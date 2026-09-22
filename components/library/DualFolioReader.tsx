'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book } from '@/types/mentis';
import { playPageTurnSound, playClickTactile } from '@/lib/scholarlyAudio';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Bookmark,
  Feather,
  UploadCloud,
  FileText,
  Sparkles,
  BookOpen,
  X,
  FileUp,
  Loader2,
  Check,
} from 'lucide-react';
import { loadPdfDocument, parseDocx } from '@/lib/documentParsers';

interface DualFolioReaderProps {
  book: Book;
  onUpdateBook: (updated: Book) => void;
  onClose: () => void;
}

export const DualFolioReader: React.FC<DualFolioReaderProps> = ({
  book,
  onUpdateBook,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 75, 100, 125, 150
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAddingMarginalia, setIsAddingMarginalia] = useState<boolean>(false);
  const [marginaliaText, setMarginaliaText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // PDF.js State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const canvasLeftRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRightRef = useRef<HTMLCanvasElement | null>(null);

  // DOCX Parsed HTML
  const [docxHtml, setDocxHtml] = useState<string | null>(book.manuscriptHtml || null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Verso (Left) & Recto (Right) pages calculation
  // We align pages in 2-page spreads: 1-2, 3-4, 5-6, etc.
  const currentPage = book.currentPage || 1;
  const leftPageNum = currentPage % 2 === 1 ? currentPage : currentPage - 1;
  const rightPageNum = leftPageNum + 1;
  const totalPages = book.totalPages || 100;

  const onUpdateBookRef = useRef(onUpdateBook);
  const bookRef = useRef(book);
  useEffect(() => {
    onUpdateBookRef.current = onUpdateBook;
    bookRef.current = book;
  }, [onUpdateBook, book]);

  // Initialize PDF.js if book has PDF data
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      const currentBook = bookRef.current;
      if (currentBook.fileType !== 'pdf' || !currentBook.fileData) {
        setPdfDoc(null);
        return;
      }

      try {
        setIsPdfLoading(true);
        const doc = await loadPdfDocument(currentBook.fileData);
        if (!isCancelled) {
          setPdfDoc(doc);
          if (doc?.numPages && doc.numPages !== currentBook.totalPages) {
            onUpdateBookRef.current({
              ...currentBook,
              totalPages: doc.numPages,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load PDF in dual folio:', err);
      } finally {
        if (!isCancelled) setIsPdfLoading(false);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [book.id, book.fileData, book.fileType]);

  // Render PDF pages onto left and right canvases
  const renderPdfPage = useCallback(
    async (pageNumber: number, canvas: HTMLCanvasElement | null) => {
      if (!pdfDoc || !canvas || pageNumber > pdfDoc.numPages) {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const scale = (zoomLevel / 100) * 1.5; // High resolution rendering
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error(`Error rendering PDF page ${pageNumber}:`, err);
      }
    },
    [pdfDoc, zoomLevel]
  );

  useEffect(() => {
    if (pdfDoc) {
      renderPdfPage(leftPageNum, canvasLeftRef.current);
      if (rightPageNum <= pdfDoc.numPages) {
        renderPdfPage(rightPageNum, canvasRightRef.current);
      } else if (canvasRightRef.current) {
        const ctx = canvasRightRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRightRef.current.width, canvasRightRef.current.height);
      }
    }
  }, [pdfDoc, leftPageNum, rightPageNum, renderPdfPage]);

  // Page Turn Actions
  const turnPages = (delta: number) => {
    playPageTurnSound();
    const newPage = Math.max(1, Math.min(totalPages, leftPageNum + delta));
    const newProgress = Math.round((newPage / totalPages) * 100);
    const updated: Book = {
      ...book,
      currentPage: newPage,
      progress: newProgress,
      lastReadAt: new Date().toISOString(),
    };
    onUpdateBook(updated);
  };

  const jumpToPage = (target: number) => {
    playPageTurnSound();
    const clamped = Math.max(1, Math.min(totalPages, target));
    const newProgress = Math.round((clamped / totalPages) * 100);
    const updated: Book = {
      ...book,
      currentPage: clamped,
      progress: newProgress,
      lastReadAt: new Date().toISOString(),
    };
    onUpdateBook(updated);
  };

  // Handle Local Document Upload (PDF or DOCX)
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.pdf')) {
        // Read as Data URL
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          let totalDocPages = 1;
          try {
            const doc = await loadPdfDocument(dataUrl);
            totalDocPages = doc?.numPages || 1;
          } catch (err) {
            console.warn('Could not inspect PDF page count via loader:', err);
          }

          const updated: Book = {
            ...book,
            fileType: 'pdf',
            fileName: file.name,
            fileData: dataUrl,
            totalPages: totalDocPages,
            currentPage: 1,
            progress: 0,
          };
          onUpdateBook(updated);
          setIsUploading(false);
          playPageTurnSound();
        };
        reader.readAsDataURL(file);
      } else if (fileName.endsWith('.docx')) {
        // Parse with dynamic Mammoth
        const arrayBuffer = await file.arrayBuffer();
        const { html, estimatedPages } = await parseDocx(arrayBuffer);

        setDocxHtml(html);
        const updated: Book = {
          ...book,
          fileType: 'docx',
          fileName: file.name,
          manuscriptHtml: html,
          totalPages: estimatedPages,
          currentPage: 1,
          progress: 0,
        };
        onUpdateBook(updated);
        setIsUploading(false);
        playPageTurnSound();
      } else {
        setUploadError('Please select a PDF document (.pdf) or Word manuscript (.docx)');
        setIsUploading(false);
      }
    } catch (err: any) {
      console.error('Upload parsing failed:', err);
      setUploadError(err.message || 'Failed to parse scholarly document.');
      setIsUploading(false);
    }
  };

  const handleSaveMarginalia = () => {
    if (!marginaliaText.trim()) return;
    const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const existing = book.notes ? `${book.notes}\n\n` : '';
    const updatedNote = `${existing}Folio ${leftPageNum} [${dateStr}]: ${marginaliaText.trim()}`;
    const updated: Book = {
      ...book,
      notes: updatedNote,
    };
    onUpdateBook(updated);
    setMarginaliaText('');
    setIsAddingMarginalia(false);
    playClickTactile();
  };

  // Toggle Fullscreen Vigil
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      id="dual-folio-reader-root"
      className={`flex flex-col bg-[#F3EEDB] rounded-3xl border border-[#D6C8A7] shadow-2xl transition-all duration-300 relative overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'w-full'
      }`}
    >
      {/* Top Folio Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#E3DAC1] bg-[#FAF7EE]/90 backdrop-blur-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="reader-back-to-library-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-[#E3DAC1] bg-[#FAF7EE] text-[#173B2D] hover:bg-[#EAE2C8] transition-colors cursor-pointer"
            title="Return to Bookshelf"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h3 className="font-serif-scholarly font-bold text-sm sm:text-base text-[#173B2D] truncate">
              {book.title}
            </h3>
            <p className="text-[11px] text-[#8E7541] italic font-sans truncate">
              {book.author} &bull; {book.category}
              {book.fileName && (
                <span className="ml-1.5 text-[10px] font-mono text-[#173B2D] bg-[#EAE2C8] px-1.5 py-0.5 rounded">
                  {book.fileName}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Reader Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-[#F3EEDB] border border-[#E3DAC1] rounded-xl p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
              disabled={zoomLevel <= 75}
              className="p-1 rounded-lg hover:bg-white text-[#173B2D] disabled:opacity-30 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-medium text-[#173B2D] w-10 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 25))}
              disabled={zoomLevel >= 150}
              className="p-1 rounded-lg hover:bg-white text-[#173B2D] disabled:opacity-30 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upload Document / Manuscript Trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-xs font-serif-scholarly text-[#173B2D] transition-colors cursor-pointer"
            title="Import PDF or DOCX Manuscript"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#B59A62]" />
            <span className="hidden md:inline">Import Folio</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />

          {/* Fullscreen Reading Vigil Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl border border-[#E3DAC1] bg-[#FAF7EE] text-[#173B2D] hover:bg-[#EAE2C8] transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen Vigil' : 'Enter Fullscreen Reading Vigil'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-rose-800 text-xs flex items-center justify-between font-sans">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {(isPdfLoading || isUploading) && (
        <div className="absolute inset-0 bg-[#F3EEDB]/80 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#173B2D] animate-spin" />
          <p className="font-serif-scholarly text-sm text-[#173B2D]">
            {isUploading ? 'Binding manuscript into codex...' : 'Illuminating vector folios...'}
          </p>
        </div>
      )}

      {/* Main Dual-Page Codex Spread */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8 flex items-center justify-center min-h-[460px] md:min-h-[560px]">
        {/* The Open Codex Wrapper (Verso & Recto) */}
        <div
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 bg-[#FAF7EE] rounded-2xl border-2 border-[#D6C8A7] shadow-2xl relative overflow-hidden transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {/* Authentic Center Codex Spine Shadow & Stitched Crease */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 bg-linear-to-r from-black/10 via-black/20 to-black/5 pointer-events-none z-10 shadow-inner" />
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-[#8E7541]/40 pointer-events-none z-10" />

          {/* ============================================================ */}
          {/* VERSO (LEFT PAGE) */}
          {/* ============================================================ */}
          <div
            id="codex-verso-page"
            className="flex flex-col justify-between p-6 sm:p-8 md:p-10 border-b md:border-b-0 md:border-r border-[#E3DAC1] relative min-h-[440px] md:min-h-[580px] bg-[#FAF7EE]"
            style={{ aspectRatio: '1 / 1.414' }}
          >
            {/* Page Header Rule */}
            <div className="flex items-center justify-between border-b border-[#E3DAC1] pb-2 text-[10px] text-[#8E7541] font-serif-scholarly uppercase tracking-wider font-semibold">
              <span>{book.title.slice(0, 30)}</span>
              <span>Folio {leftPageNum}</span>
            </div>

            {/* Page Body Content */}
            <div className="flex-1 py-4 overflow-y-auto font-serif-scholarly text-xs sm:text-sm leading-relaxed text-[#202820]">
              {book.fileType === 'pdf' && pdfDoc ? (
                <div className="w-full h-full flex items-center justify-center">
                  <canvas
                    ref={canvasLeftRef}
                    className="max-w-full max-h-full object-contain shadow-xs rounded"
                  />
                </div>
              ) : book.fileType === 'docx' && docxHtml ? (
                <div
                  className="prose prose-sm font-serif-scholarly text-[#202820] max-h-full overflow-y-auto leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: docxHtml.slice(
                      ((leftPageNum - 1) * docxHtml.length) / Math.max(1, totalPages),
                      (leftPageNum * docxHtml.length) / Math.max(1, totalPages)
                    ),
                  }}
                />
              ) : (
                /* Default Scholarly Content with Mathematics & Diagrams */
                <div className="space-y-4">
                  <div className="text-[11px] text-[#8E7541] font-mono uppercase tracking-widest">
                    Chapter {Math.ceil(leftPageNum / 10)} &bull; Discourse on Foundations
                  </div>
                  <h4 className="font-serif-scholarly font-bold text-base text-[#173B2D]">
                    Principles of Continuous Field Derivations
                  </h4>
                  <p className="indent-6 first-letter:text-3xl first-letter:font-bold first-letter:text-[#173B2D] first-letter:float-left first-letter:mr-2 first-letter:font-serif-scholarly">
                    Consider a hypothetical closed volume enclosing an invariant charge density{' '}
                    <span className="font-mono italic text-[#173B2D]">ρ(r,θ,φ)</span>. By Gauss’s
                    primary theorem, the total divergence of the electric field vector across the
                    bounding hypersurface directly yields the sum of enclosed source terms.
                  </p>

                  <div className="p-3 bg-[#F3EEDB] rounded-xl border-l-4 border-[#B59A62] text-xs italic font-serif-scholarly text-[#202820]">
                    &quot;The boundary integral over an enclosed region equals the volume integral of
                    the differential divergence throughout.&quot;
                  </div>

                  <p className="indent-4">
                    Under radial invariance, spherical coordinate decomposition simplifies the
                    differential gradient operators, yielding an exact analytical closed form:
                  </p>

                  <div className="p-3 rounded-xl bg-[#173B2D] text-[#F3EEDB] font-mono text-xs text-center border border-[#B59A62]/40 shadow-xs">
                    ∇ · E = ρ / ε₀
                  </div>
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E3DAC1] text-[10px] text-[#8E7541] font-mono">
              <span>VERSO</span>
              <span className="font-bold text-[#173B2D]">{leftPageNum}</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RECTO (RIGHT PAGE) */}
          {/* ============================================================ */}
          <div
            id="codex-recto-page"
            className="flex flex-col justify-between p-6 sm:p-8 md:p-10 relative min-h-[440px] md:min-h-[580px] bg-[#FAF7EE]"
            style={{ aspectRatio: '1 / 1.414' }}
          >
            {/* Page Header Rule */}
            <div className="flex items-center justify-between border-b border-[#E3DAC1] pb-2 text-[10px] text-[#8E7541] font-serif-scholarly uppercase tracking-wider font-semibold">
              <span>Folio {rightPageNum}</span>
              <span>{book.category}</span>
            </div>

            {/* Page Body Content */}
            <div className="flex-1 py-4 overflow-y-auto font-serif-scholarly text-xs sm:text-sm leading-relaxed text-[#202820]">
              {book.fileType === 'pdf' && pdfDoc ? (
                <div className="w-full h-full flex items-center justify-center">
                  {rightPageNum <= pdfDoc.numPages ? (
                    <canvas
                      ref={canvasRightRef}
                      className="max-w-full max-h-full object-contain shadow-xs rounded"
                    />
                  ) : (
                    <div className="text-center text-xs text-[#8E7541] italic pt-20">
                      ~ End of Bound Codex Folios ~
                    </div>
                  )}
                </div>
              ) : book.fileType === 'docx' && docxHtml ? (
                <div
                  className="prose prose-sm font-serif-scholarly text-[#202820] max-h-full overflow-y-auto leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: docxHtml.slice(
                      ((rightPageNum - 1) * docxHtml.length) / Math.max(1, totalPages),
                      (rightPageNum * docxHtml.length) / Math.max(1, totalPages)
                    ),
                  }}
                />
              ) : (
                /* Default Scholarly Content (Recto Page) */
                <div className="space-y-4">
                  <p className="indent-4">
                    Extending to dynamic time-varying formulations, Faraday’s induction and Maxwell’s
                    displacement current resolve the symmetry of the electromagnetic stress tensor:
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] font-mono text-xs text-center border border-[#B59A62]/40 shadow-xs space-y-1">
                    <div>∇ × B = μ₀ J + μ₀ ε₀ (∂E / ∂t)</div>
                    <div className="text-[10px] text-[#B59A62] font-sans">
                      (Ampère-Maxwell Hypersurface Formulation)
                    </div>
                  </div>

                  <p className="indent-4">
                    In free space where <span className="font-mono text-[#173B2D]">J = 0</span>,
                    the curl of the curl transforms directly into the classical Helmholtz wave
                    equation, proving the propagation of luminous disturbance at phase velocity{' '}
                    <span className="font-mono text-[#173B2D]">c = 1 / √(μ₀ε₀)</span>.
                  </p>

                  {/* Scholar Marginalia Container */}
                  <div className="mt-4 pt-3 border-t border-[#E3DAC1] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#8E7541]">
                      <span className="flex items-center gap-1.5">
                        <Feather className="w-3.5 h-3.5 text-[#B59A62]" />
                        <span>Folio Marginalia</span>
                      </span>
                      <button
                        onClick={() => setIsAddingMarginalia(!isAddingMarginalia)}
                        className="text-[10px] text-[#173B2D] hover:underline cursor-pointer"
                      >
                        {isAddingMarginalia ? 'Cancel' : '+ Inscribe Observation'}
                      </button>
                    </div>

                    {book.notes && (
                      <div className="p-2.5 rounded-xl bg-[#F3EEDB]/60 border border-[#E3DAC1] text-[#202820] text-[11px] italic font-serif-scholarly max-h-24 overflow-y-auto whitespace-pre-line">
                        {book.notes}
                      </div>
                    )}

                    {isAddingMarginalia && (
                      <div className="space-y-2 pt-1 animate-in fade-in">
                        <textarea
                          rows={2}
                          value={marginaliaText}
                          onChange={(e) => setMarginaliaText(e.target.value)}
                          placeholder="Inscribe notes into this folio's margin..."
                          className="w-full p-2 rounded-xl bg-white border border-[#E3DAC1] text-xs text-[#202820] focus:border-[#173B2D] outline-none font-sans"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveMarginalia}
                            className="px-3 py-1 rounded-lg bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-medium hover:bg-[#204E3C] transition-colors cursor-pointer"
                          >
                            Save Inscription
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E3DAC1] text-[10px] text-[#8E7541] font-mono">
              <span className="font-bold text-[#173B2D]">{rightPageNum}</span>
              <span>RECTO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Folio Turn & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-3 border-t border-[#E3DAC1] bg-[#FAF7EE]/90">
        {/* Page Step Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="reader-flip-back-btn"
            onClick={() => turnPages(-2)}
            disabled={leftPageNum <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#173B2D] text-xs font-serif-scholarly hover:bg-[#EAE2C8] disabled:opacity-40 transition-colors cursor-pointer"
            title="Turn back two pages"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prior Spread</span>
          </button>

          <span className="text-xs font-serif-scholarly text-[#202820]">
            Folios <strong>{leftPageNum} &ndash; {Math.min(totalPages, rightPageNum)}</strong> of{' '}
            <strong>{totalPages}</strong>
            <span className="text-[#8E7541] ml-2">({book.progress}%)</span>
          </span>

          <button
            id="reader-flip-forward-btn"
            onClick={() => turnPages(2)}
            disabled={rightPageNum >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#173B2D] text-xs font-serif-scholarly hover:bg-[#EAE2C8] disabled:opacity-40 transition-colors cursor-pointer"
            title="Turn forward two pages"
          >
            <span className="hidden sm:inline">Next Spread</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Folio Jump Slider & Quick Input */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label className="text-xs font-serif-scholarly text-[#8E7541] shrink-0">
            Jump to Folio:
          </label>
          <input
            id="reader-page-slider"
            type="range"
            min="1"
            max={totalPages}
            value={leftPageNum}
            onChange={(e) => jumpToPage(parseInt(e.target.value, 10))}
            className="w-32 sm:w-48 accent-[#173B2D] cursor-pointer"
          />
          <input
            type="number"
            min="1"
            max={totalPages}
            value={leftPageNum}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) jumpToPage(val);
            }}
            className="w-14 px-1.5 py-1 text-center rounded-lg bg-white border border-[#E3DAC1] text-xs font-mono font-bold text-[#173B2D]"
          />
        </div>
      </div>
    </div>
  );
};
