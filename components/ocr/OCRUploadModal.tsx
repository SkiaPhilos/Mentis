'use client';

import React, { useState, useRef } from 'react';
import { MentisRepository } from '@/lib/storage/repository';
import { playParchmentRustle, playQuillScratch, playClickTactile } from '@/lib/audio/soundEffects';
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  Check,
  Copy,
  Plus,
  RefreshCw,
  AlertCircle,
  Eye,
  Camera,
} from 'lucide-react';

interface OCRUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToActiveNote?: (text: string) => void;
  onCreateNewNote?: (title: string, text: string) => void;
  hasActiveNote?: boolean;
}

export const OCRUploadModal: React.FC<OCRUploadModalProps> = ({
  isOpen,
  onClose,
  onInsertToActiveNote,
  onCreateNewNote,
  hasActiveNote = false,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [extractedTitle, setExtractedTitle] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please present an image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image exceeds the 10MB archive threshold.');
      return;
    }

    setErrorMessage(null);
    setMimeType(file.type);
    playParchmentRustle();

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      // Auto-trigger OCR extraction
      performOCR(dataUrl, file.type);
    };
    reader.readAsDataURL(file);
  };

  const performOCR = async (imageBase64: string, type: string) => {
    setIsScanning(true);
    setErrorMessage(null);
    setExtractedText('');
    setExtractedTitle('');

    try {
      const creds = MentisRepository.getAiCredentials();

      const response = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: type,
          encryptedKey: creds?.encryptedKey,
          magicSpell: creds?.magicSpell,
          model: creds?.modelPreference || 'gemini-3.8-flash',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'AI_NOT_CONFIGURED') {
          throw new Error(
            'The Mentis OCR Vision Engine requires a configured Magical Key in your Scholar Profile.'
          );
        }
        throw new Error(data.message || 'Vision transcription encountered an error.');
      }

      setExtractedTitle(data.title || 'Transcribed Manuscript');
      setExtractedText(data.extractedText || '');
      setDetectedLanguage(data.detectedLanguage || 'Academic English');
      setSummary(data.summary || '');
      playQuillScratch();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to scan and transcribe study image.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    playClickTactile();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (!extractedText || !onInsertToActiveNote) return;
    onInsertToActiveNote(extractedText);
    playQuillScratch();
    onClose();
  };

  const handleCreateNew = () => {
    if (!extractedText || !onCreateNewNote) return;
    onCreateNewNote(extractedTitle || 'Transcribed Study Note', extractedText);
    playQuillScratch();
    onClose();
  };

  const handleReset = () => {
    setImagePreview(null);
    setExtractedText('');
    setExtractedTitle('');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    playClickTactile();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1710]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-[#FAF7EE] border border-[#B59A62]/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3DAC1] bg-[#F3EEDB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#173B2D] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                Scholarly Vision & OCR Scribe
              </h3>
              <p className="text-xs text-[#8E7541] font-serif-scholarly">
                Transcribe diagrams, math formulas, and handwritten folios into searchable manuscript text
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#202820]/60 hover:text-[#173B2D] hover:bg-[#EAE2C8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-[11px] text-amber-800">
                  Ensure your Magical Key (Gemini API key) is configured in your Scholar Profile.
                </p>
              </div>
            </div>
          )}

          {!imagePreview ? (
            /* Upload Dropzone */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#B59A62]/60 rounded-2xl p-10 text-center cursor-pointer hover:bg-[#F3EEDB]/60 transition-all bg-[#FAF7EE] flex flex-col items-center justify-center gap-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-[#EAE2C8] group-hover:bg-[#173B2D] text-[#8E7541] group-hover:text-[#D4AF37] flex items-center justify-center transition-colors shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="font-serif-scholarly text-base font-bold text-[#173B2D]">
                  Deposit Study Image or Screenshot
                </p>
                <p className="text-xs text-[#202820]/70 mt-1">
                  Drag and drop a PNG, JPG, or WEBP file, or click to inspect local records
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-[#8E7541] font-serif-scholarly">
                <span>Supports LaTeX math</span>
                <span>•</span>
                <span>Diagrammatic descriptions</span>
                <span>•</span>
                <span>Handwritten script</span>
              </div>
            </div>
          ) : (
            /* Two Column View: Image Preview vs Extracted Text */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Source Image */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-serif-scholarly text-[#8E7541]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Source Manuscript Visual
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-[#173B2D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Upload different image
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-[#E3DAC1] bg-[#202820]/5 flex items-center justify-center min-h-[260px] max-h-[380px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Uploaded folio"
                    className="max-h-[380px] w-auto object-contain"
                  />

                  {/* Golden Scanning Bar Animation */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#D4AF37]/10 flex flex-col justify-between overflow-hidden pointer-events-none">
                      <div className="w-full h-1 bg-[#D4AF37] shadow-[0_0_12px_#D4AF37] animate-pulse transform translate-y-32" />
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0F1710]/40 backdrop-blur-2xs">
                        <div className="bg-[#FAF7EE] px-4 py-2.5 rounded-xl border border-[#B59A62] shadow-lg flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-[#B59A62] animate-spin" />
                          <span className="text-xs font-serif-scholarly font-bold text-[#173B2D]">
                            Gemini Vision deciphering manuscript...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {summary && (
                  <p className="text-[11px] font-serif-scholarly italic text-[#8E7541] bg-[#F3EEDB] p-2.5 rounded-xl border border-[#E3DAC1]">
                    &ldquo;{summary}&rdquo;
                  </p>
                )}
              </div>

              {/* Right Column: Transcribed Text */}
              <div className="space-y-3 flex flex-col">
                <div className="flex items-center justify-between text-xs font-serif-scholarly text-[#8E7541]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Deciphered Text & LaTeX
                  </span>
                  {detectedLanguage && (
                    <span className="px-2 py-0.5 rounded-md bg-[#A9C9A9]/30 text-[#173B2D] text-[10px] font-semibold">
                      {detectedLanguage}
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <input
                    type="text"
                    value={extractedTitle}
                    onChange={(e) => setExtractedTitle(e.target.value)}
                    placeholder="Deciphered Title..."
                    className="w-full font-serif-scholarly text-sm font-bold text-[#173B2D] bg-[#F3EEDB]/60 border border-[#E3DAC1] rounded-xl px-3 py-1.5 focus:border-[#B59A62] outline-hidden"
                  />

                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    placeholder={
                      isScanning
                        ? 'Deciphering textual symbols and theorems...'
                        : 'Transcribed manuscript text will appear here...'
                    }
                    rows={11}
                    className="w-full flex-1 font-mono text-xs leading-relaxed text-[#202820] bg-[#FAF7EE] border border-[#E3DAC1] rounded-xl p-3 focus:border-[#B59A62] outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#E3DAC1] bg-[#F3EEDB]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-serif-scholarly text-[#202820]/70 hover:text-[#173B2D] hover:bg-[#EAE2C8] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {extractedText && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif-scholarly bg-[#FAF7EE] border border-[#B59A62]/60 hover:bg-[#F3EEDB] text-[#173B2D] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {hasActiveNote && onInsertToActiveNote && (
                  <button
                    onClick={handleInsert}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif-scholarly font-bold bg-[#8E7541] hover:bg-[#725C31] text-[#FAF7EE] shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert into Active Note</span>
                  </button>
                )}

                {onCreateNewNote && (
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif-scholarly font-bold bg-[#173B2D] hover:bg-[#122F24] text-[#F3EEDB] shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Inscribe New Note</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
