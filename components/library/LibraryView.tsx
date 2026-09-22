'use client';

import React, { useState, useRef } from 'react';
import { Book, Course, ReadingFocusSession } from '@/types/mentis';
import { ReadingVigilTimer } from '@/components/library/ReadingVigilTimer';
import { LibraryExportModal } from '@/components/library/LibraryExportModal';
import { DualFolioReader } from '@/components/library/DualFolioReader';
import { MentisRepository } from '@/lib/storage/repository';
import { playPageTurnSound, playClickTactile } from '@/lib/scholarlyAudio';
import mammoth from 'mammoth';
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Bookmark,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Hourglass,
  FileDown,
  Printer,
  Feather,
  Trash2,
  Edit3,
  Search,
  UploadCloud,
  FileText,
} from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  courses: Course[];
  initialActiveBook?: Book | null;
  onAddBook: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  courses,
  initialActiveBook,
  onAddBook,
  onUpdateBook,
}) => {
  const [activeBook, setActiveBook] = useState<Book | null>(initialActiveBook || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVigilOpen, setIsVigilOpen] = useState(false);
  const [isVigilMinimized, setIsVigilMinimized] = useState(false);

  // New book form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('Physics');
  const [newCourseId, setNewCourseId] = useState<string>('');
  const [newPages, setNewPages] = useState(350);
  const [newNotes, setNewNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    type: 'pdf' | 'docx';
    data?: string;
    html?: string;
  } | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Reader margin note editing
  const [isAddingReaderNote, setIsAddingReaderNote] = useState(false);
  const [readerNoteInput, setReaderNoteInput] = useState('');

  const categories = ['all', ...Array.from(new Set(books.map((b) => b.category)))];

  const filteredBooks = books.filter((b) => {
    const matchesCat = filterCategory === 'all' || b.category === filterCategory;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleModalDocUpload = async (file: File) => {
    setIsParsingDoc(true);
    try {
      const fileName = file.name;
      const lower = fileName.toLowerCase();

      if (lower.endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          const pdfjsLib = await import('pdfjs-dist');
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
          }
          const base64 = dataUrl.split(',')[1];
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const doc = await pdfjsLib.getDocument({ data: bytes }).promise;

          setUploadedFile({
            name: fileName,
            type: 'pdf',
            data: dataUrl,
          });
          setNewPages(doc.numPages || 100);
          if (!newTitle.trim()) {
            setNewTitle(fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
          }
          setIsParsingDoc(false);
          playClickTactile();
        };
        reader.readAsDataURL(file);
      } else if (lower.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;
        const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
        const estPages = Math.max(2, Math.ceil(words / 350));

        setUploadedFile({
          name: fileName,
          type: 'docx',
          html,
        });
        setNewPages(estPages);
        if (!newTitle.trim()) {
          setNewTitle(fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        setIsParsingDoc(false);
        playClickTactile();
      }
    } catch (err) {
      console.error('Failed to parse uploaded document:', err);
      setIsParsingDoc(false);
    }
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Book = {
      id: `book_${Date.now()}`,
      userId: 'scholar_usr_01',
      courseId: newCourseId || undefined,
      title: newTitle.trim(),
      author: newAuthor.trim(),
      category: newCategory.trim(),
      totalPages: newPages,
      currentPage: 1,
      progress: 0,
      notes: newNotes.trim() || undefined,
      fileType: uploadedFile?.type,
      fileData: uploadedFile?.data,
      fileName: uploadedFile?.name,
      manuscriptHtml: uploadedFile?.html,
      lastReadAt: new Date().toISOString(),
    };
    onAddBook(created);
    setActiveBook(created);
    setIsAddModalOpen(false);

    // Reset form
    setNewTitle('');
    setNewAuthor('');
    setNewNotes('');
    setNewPages(350);
    setUploadedFile(null);
  };

  const handlePageChange = (delta: number) => {
    if (!activeBook) return;
    playPageTurnSound();
    const nextPage = Math.max(1, Math.min(activeBook.totalPages, activeBook.currentPage + delta));
    const newProgress = Math.round((nextPage / activeBook.totalPages) * 100);
    const updated = {
      ...activeBook,
      currentPage: nextPage,
      progress: newProgress,
      lastReadAt: new Date().toISOString(),
    };
    setActiveBook(updated);
    onUpdateBook(updated);
  };

  const handleJumpToPage = (targetPage: number) => {
    if (!activeBook) return;
    playPageTurnSound();
    const clamped = Math.max(1, Math.min(activeBook.totalPages, targetPage));
    const newProgress = Math.round((clamped / activeBook.totalPages) * 100);
    const updated = {
      ...activeBook,
      currentPage: clamped,
      progress: newProgress,
      lastReadAt: new Date().toISOString(),
    };
    setActiveBook(updated);
    onUpdateBook(updated);
  };

  const handleAddReaderNote = () => {
    if (!activeBook || !readerNoteInput.trim()) return;
    const formatted = activeBook.notes
      ? `${activeBook.notes}\n• [Folio ${activeBook.currentPage}]: ${readerNoteInput.trim()}`
      : `• [Folio ${activeBook.currentPage}]: ${readerNoteInput.trim()}`;
    const updated: Book = {
      ...activeBook,
      notes: formatted,
      lastReadAt: new Date().toISOString(),
    };
    setActiveBook(updated);
    onUpdateBook(updated);
    setReaderNoteInput('');
    setIsAddingReaderNote(false);
  };

  const handleLogVigilSession = (session: ReadingFocusSession) => {
    MentisRepository.logReadingSession(session);
  };

  const courseMap = new Map(courses.map((c) => [c.id, c.code]));

  return (
    <div className="space-y-6">
      {/* Header with Pomodoro Vigil & Physical Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-scholarly text-2xl font-bold text-[#173B2D]">
            Scholarly Library & Codexes
          </h2>
          <p className="text-xs text-[#202820]/70 font-sans mt-0.5">
            Physical-feel book collections, astrolabe focus vigils, and certified archival registers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Pomodoro Focus Vigil Toggle */}
          <button
            id="toggle-reading-vigil-btn"
            onClick={() => setIsVigilOpen(!isVigilOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-serif-scholarly font-medium transition-all ${
              isVigilOpen
                ? 'bg-[#8E7541] text-[#F3EEDB] border-[#8E7541] shadow-xs'
                : 'bg-[#FAF7EE] text-[#173B2D] border-[#E3DAC1] hover:border-[#B59A62]'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>Reading Vigil</span>
          </button>

          {/* Export Physical Catalogue */}
          <button
            id="open-catalogue-export-btn"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[#173B2D] text-xs font-serif-scholarly font-medium transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-[#8E7541]" />
            <span>Export Catalogue</span>
          </button>

          {/* Shelve New Codex */}
          <button
            id="shelve-new-codex-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] text-xs font-serif-scholarly font-medium shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>Shelve New Codex</span>
          </button>
        </div>
      </div>

      {/* Reading Vigil Astrolabe Timer (Docked or Floating) */}
      {isVigilOpen && (
        <ReadingVigilTimer
          books={books}
          activeBook={activeBook}
          onUpdateBook={onUpdateBook}
          onLogSession={handleLogVigilSession}
          onClose={() => setIsVigilOpen(false)}
        />
      )}

      {/* Active Reader Mode (Dual-Page Scholarly Folio Reader) */}
      {activeBook ? (
        <div className="space-y-4">
          <DualFolioReader
            book={activeBook}
            onUpdateBook={(updated) => {
              setActiveBook(updated);
              onUpdateBook(updated);
            }}
            onClose={() => setActiveBook(null)}
          />
        </div>
      ) : (
        /* Bookshelf Collection Grid */
        <div className="space-y-5">
          {/* Search and Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-serif-scholarly">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                    filterCategory === cat
                      ? 'bg-[#173B2D] text-[#F3EEDB] font-bold shadow-xs'
                      : 'bg-[#FAF7EE] text-[#202820]/70 hover:bg-[#EAE2C8] border border-[#E3DAC1]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#8E7541] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search codex, author..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-xs font-serif-scholarly text-[#202820] outline-none placeholder:text-[#202820]/40"
              />
            </div>
          </div>

          {/* Bookshelf Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBooks.map((book) => {
              const courseCode = book.courseId ? courseMap.get(book.courseId) : null;
              return (
                <div
                  key={book.id}
                  onClick={() => setActiveBook(book)}
                  className="parchment-card rounded-2xl p-4 flex flex-col justify-between hover:border-[#B59A62] cursor-pointer transition-all hover:-translate-y-1 shadow-xs group relative overflow-hidden"
                >
                  <div>
                    {/* Book Spine Graphic Header with Gold Foil Detailing */}
                    <div className="h-32 rounded-xl bg-[#173B2D] border-l-6 border-[#B59A62] p-3 flex flex-col justify-between text-[#F3EEDB] shadow-inner mb-3.5 relative overflow-hidden">
                      <div className="w-full flex justify-between items-center opacity-70 text-[9px] font-serif-scholarly">
                        <span>{book.category}</span>
                        <Bookmark className="w-3.5 h-3.5 text-[#B59A62]" />
                      </div>
                      <h4 className="font-serif-scholarly text-xs font-bold leading-tight line-clamp-2">
                        {book.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#A9C9A9] font-serif-scholarly italic truncate max-w-[120px]">
                          {book.author}
                        </span>
                        {courseCode && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-[#B59A62]/25 text-[#F3EEDB] text-[9px]">
                            {courseCode}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-serif-scholarly text-[#8E7541] font-semibold block uppercase tracking-wider">
                      {book.category}
                    </span>
                    <h4 className="font-serif-scholarly text-sm font-bold text-[#173B2D] group-hover:text-[#8E7541] transition-colors line-clamp-2">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[#202820]/60 italic mt-0.5">by {book.author}</p>

                    {book.notes && (
                      <p className="text-[10px] text-[#8E7541] italic line-clamp-1 mt-1.5">
                        &quot;{book.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E3DAC1]">
                    <div className="flex items-center justify-between text-[11px] font-serif-scholarly mb-1">
                      <span className="text-[#202820]/60">
                        Folio {book.currentPage}/{book.totalPages}
                      </span>
                      <span className="font-bold text-[#173B2D]">{book.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EAE2C8] overflow-hidden">
                      <div
                        className="h-full bg-[#173B2D] rounded-full transition-all duration-300"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12 parchment-card rounded-2xl border border-dashed border-[#B59A62]/40 text-xs font-serif-scholarly text-[#202820]/60">
              No volumes found matching the query. Shelve a new codex to enrich your library.
            </div>
          )}
        </div>
      )}

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div
          id="add-book-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#F4EEDC] p-6 shadow-2xl border border-[#B59A62] text-[#173B2D]">
            <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D] pb-3 border-b border-[#E3DAC1]">
              Shelve a New Academic Codex
            </h3>

            {/* Document Import Dropzone */}
            <div className="mt-3 p-3 rounded-xl border border-dashed border-[#B59A62] bg-[#FAF7EE] flex flex-col items-center justify-center gap-1.5 text-center">
              <UploadCloud className="w-5 h-5 text-[#B59A62]" />
              <div className="text-xs font-serif-scholarly font-medium text-[#173B2D]">
                Import PDF or Word (.docx) Manuscript
              </div>
              <p className="text-[10px] text-[#8E7541] font-sans">
                Vector diagrams & typography parsed natively into dual-page folios
              </p>
              <button
                type="button"
                onClick={() => modalFileInputRef.current?.click()}
                disabled={isParsingDoc}
                className="mt-1 px-3 py-1 rounded-lg bg-[#173B2D] text-[#F3EEDB] text-[11px] font-serif-scholarly hover:bg-[#204E3C] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isParsingDoc ? 'Illuminating folios...' : uploadedFile ? `Attached: ${uploadedFile.name}` : 'Browse Local Folio'}
              </button>
              <input
                ref={modalFileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleModalDocUpload(file);
                }}
              />
            </div>

            <form
              onSubmit={handleCreateBook}
              className="mt-4 space-y-3.5 text-xs font-serif-scholarly"
            >
              <div>
                <label className="block font-semibold mb-1">Codex Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Principia Mathematica"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Author</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Isaac Newton"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Discipline / Field</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Total Folios (Pages)</label>
                  <input
                    type="number"
                    min="1"
                    value={newPages}
                    onChange={(e) => setNewPages(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Associated Course (Optional)</label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
                >
                  <option value="">Independent Study / None</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Opening Inscription / Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Preliminary commentary or syllabus syllabus context..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3DAC1]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-[#202820]/70 hover:bg-[#EAE2C8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] font-medium hover:bg-[#122E23] transition-colors shadow-xs"
                >
                  Shelve Volume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Physical Catalogue Exporter Modal */}
      <LibraryExportModal
        books={books}
        courses={courses}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
