'use client';

import React, { useState } from 'react';
import { Book, Course, LibraryExportConfig } from '@/types/mentis';
import {
  exportToPhysicalPDF,
  exportToWordDocx,
  filterBooksForExport,
  computeLibraryStats,
} from '@/lib/libraryExporter';
import {
  FileText,
  Printer,
  Download,
  Check,
  X,
  BookOpen,
  Filter,
  BarChart3,
  Bookmark,
} from 'lucide-react';

interface LibraryExportModalProps {
  books: Book[];
  courses: Course[];
  isOpen: boolean;
  onClose: () => void;
  scholarName?: string;
}

export const LibraryExportModal: React.FC<LibraryExportModalProps> = ({
  books,
  courses,
  isOpen,
  onClose,
  scholarName = 'Abdullah Saeed',
}) => {
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf');
  const [scope, setScope] = useState<'all' | 'in_progress' | 'completed' | 'by_category'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  const [includeStats, setIncludeStats] = useState<boolean>(true);

  if (!isOpen) return null;

  const categories = Array.from(new Set(books.map((b) => b.category)));
  const currentCategory = selectedCategory || categories[0] || 'Physics';

  const config: LibraryExportConfig = {
    format,
    scope,
    selectedCategory: scope === 'by_category' ? currentCategory : undefined,
    includeNotes,
    includeStats,
  };

  const targetBooks = filterBooksForExport(books, config);
  const stats = computeLibraryStats(targetBooks);

  const handleExport = () => {
    if (format === 'pdf') {
      exportToPhysicalPDF(books, courses, config, scholarName);
    } else {
      exportToWordDocx(books, courses, config, scholarName);
    }
    onClose();
  };

  return (
    <div
      id="library-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#F4EEDC] p-6 shadow-2xl border border-[#B59A62] text-[#173B2D] space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E3DAC1]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#173B2D]/10 border border-[#173B2D]/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#173B2D]" />
            </div>
            <div>
              <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                Export Academic Catalogue
              </h3>
              <p className="text-[11px] text-[#202820]/70 font-sans">
                Produce physical-record ledgers and archival registers for printing or documentation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EAE2C8] text-[#202820]/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selection (PDF vs Word) */}
        <div>
          <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-2">
            Select Physical Output Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                format === 'pdf'
                  ? 'bg-[#173B2D] text-[#F3EEDB] border-[#173B2D] shadow-xs'
                  : 'bg-[#FAF7EE] text-[#202820] border-[#E3DAC1] hover:border-[#B59A62]'
              }`}
            >
              <div className="flex items-center gap-2 font-serif-scholarly font-bold text-xs">
                <Printer className={`w-4 h-4 ${format === 'pdf' ? 'text-[#B59A62]' : 'text-[#8E7541]'}`} />
                <span>Parchment PDF (Print)</span>
              </div>
              <p
                className={`text-[10px] mt-1 line-clamp-2 ${
                  format === 'pdf' ? 'text-[#E3DAC1]' : 'text-[#202820]/65'
                }`}
              >
                High-fidelity A4 layout with Mentis Crest, bibliographic headers, and archival borders.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFormat('docx')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                format === 'docx'
                  ? 'bg-[#173B2D] text-[#F3EEDB] border-[#173B2D] shadow-xs'
                  : 'bg-[#FAF7EE] text-[#202820] border-[#E3DAC1] hover:border-[#B59A62]'
              }`}
            >
              <div className="flex items-center gap-2 font-serif-scholarly font-bold text-xs">
                <Download className={`w-4 h-4 ${format === 'docx' ? 'text-[#B59A62]' : 'text-[#8E7541]'}`} />
                <span>Word Manuscript (.docx)</span>
              </div>
              <p
                className={`text-[10px] mt-1 line-clamp-2 ${
                  format === 'docx' ? 'text-[#E3DAC1]' : 'text-[#202820]/65'
                }`}
              >
                Structured Microsoft Word table register formatted for academic records and archival filing.
              </p>
            </button>
          </div>
        </div>

        {/* Scope Selection */}
        <div className="space-y-2 text-xs font-serif-scholarly">
          <label className="block font-bold text-[#173B2D]">Archival Scope</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'all', label: 'All Codexes' },
              { id: 'in_progress', label: 'In Reading' },
              { id: 'completed', label: 'Mastered' },
              { id: 'by_category', label: 'By Field' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id as 'all' | 'in_progress' | 'completed' | 'by_category')}
                className={`px-3 py-2 rounded-xl text-center border transition-all ${
                  scope === s.id
                    ? 'bg-[#8E7541] text-[#F3EEDB] border-[#8E7541] font-bold shadow-xs'
                    : 'bg-[#FAF7EE] text-[#202820]/75 border-[#E3DAC1] hover:border-[#B59A62]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {scope === 'by_category' && (
            <div className="pt-2">
              <label className="block text-[11px] text-[#202820]/70 mb-1">
                Filter by Academic Field / Category
              </label>
              <select
                value={currentCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Inclusions / Checkboxes */}
        <div className="space-y-2 pt-1 border-t border-[#E3DAC1] text-xs font-serif-scholarly">
          <label className="block font-bold text-[#173B2D]">Archival Ledger Contents</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="rounded text-[#173B2D] focus:ring-0"
              />
              <span className="text-[#202820]">Include Statistical Summary</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="rounded text-[#173B2D] focus:ring-0"
              />
              <span className="text-[#202820]">Include Scholar Marginalia / Notes</span>
            </label>
          </div>
        </div>

        {/* Ledger Preview Badge */}
        <div className="p-3 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] flex items-center justify-between text-xs font-serif-scholarly">
          <div className="flex items-center gap-2 text-[#8E7541]">
            <Bookmark className="w-4 h-4" />
            <span>
              Target: <strong>{targetBooks.length}</strong> volumes selected
            </span>
          </div>
          <span className="text-[#173B2D] font-bold">
            {stats.totalPages.toLocaleString()} total folios ({stats.completionRate}% read)
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E3DAC1]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-serif-scholarly text-[#202820]/70 hover:bg-[#EAE2C8]"
          >
            Cancel
          </button>
          <button
            id="confirm-export-catalogue-btn"
            type="button"
            onClick={handleExport}
            className="px-5 py-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-bold hover:bg-[#122E23] flex items-center gap-2 shadow-xs transition-colors"
          >
            {format === 'pdf' ? (
              <>
                <Printer className="w-3.5 h-3.5 text-[#B59A62]" />
                <span>Generate Physical PDF Ledger</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#B59A62]" />
                <span>Download Word Manuscript (.docx)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
