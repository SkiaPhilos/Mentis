'use client';

import React, { useState } from 'react';
import { Book, Course, ReadingFocusSession } from '@/types/mentis';
import { ReadingVigilTimer } from '@/components/library/ReadingVigilTimer';
import { LibraryExportModal } from '@/components/library/LibraryExportModal';
import { MentisRepository } from '@/lib/storage/repository';
import { playPageTurnSound } from '@/lib/scholarlyAudio';
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

      {/* Active Reader Mode */}
      {activeBook ? (
        <div className="parchment-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-md border border-[#B59A62]/40">
          {/* Reader Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DAC1]">
            <button
              id="return-to-bookshelf-btn"
              onClick={() => setActiveBook(null)}
              className="flex items-center gap-1.5 text-xs font-serif-scholarly text-[#173B2D] hover:text-[#8E7541] self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Bookshelf</span>
            </button>

            <div className="text-center sm:px-4">
              <span className="text-[10px] uppercase font-serif-scholarly text-[#8E7541] font-semibold tracking-wider">
                {activeBook.category}{' '}
                {activeBook.courseId && `• ${courseMap.get(activeBook.courseId) || 'Course'}`}
              </span>
              <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                {activeBook.title}
              </h3>
              <span className="text-xs text-[#202820]/60 italic">by {activeBook.author}</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Quick trigger for Vigil bound to this book */}
              <button
                id="reader-launch-vigil-btn"
                onClick={() => setIsVigilOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[11px] font-serif-scholarly text-[#173B2D]"
                title="Start timed reading vigil on this book"
              >
                <Hourglass className="w-3 h-3 text-[#B59A62]" />
                <span>Commence Vigil</span>
              </button>

              <span className="px-2.5 py-1 rounded-lg bg-[#A9C9A9]/25 text-[#173B2D] text-xs font-serif-scholarly font-bold border border-[#A9C9A9]/50">
                {activeBook.progress}% Read
              </span>
            </div>
          </div>

          {/* Dual Parchment Pages (Physical Reader Simulation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF7EE] p-6 sm:p-8 rounded-2xl border border-[#E3DAC1] shadow-inner relative">
            {/* Center Book Spine Crease & Shadow */}
            <div className="hidden md:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-3 bg-linear-to-r from-black/5 via-black/10 to-transparent pointer-events-none rounded-sm" />

            {/* Left Page */}
            <div className="space-y-4 font-serif-scholarly text-xs sm:text-sm leading-relaxed text-[#202820] pr-0 md:pr-4">
              <div className="flex justify-between items-center text-[10px] text-[#8E7541] border-b border-[#E3DAC1]/80 pb-1 font-semibold">
                <span>FOLIO SECTION {Math.ceil(activeBook.currentPage / 10)}</span>
                <span>Folio {activeBook.currentPage}</span>
              </div>
              <p className="indent-5 first-letter:text-2xl first-letter:font-bold first-letter:text-[#173B2D] first-letter:float-left first-letter:mr-1.5">
                Consider a closed hypothetical volume enclosing charge density ρ. By Maxwell’s first
                formulation, the total divergence of the electric induction field across any
                enveloping boundary directly reflects the net bounded charge enclosed within.
              </p>
              <div className="p-3 my-2 bg-[#F3EEDB] rounded-xl border-l-3 border-[#B59A62] text-xs italic font-serif-scholarly shadow-xs">
                &quot;The flux of the electrostatic field through any closed surface is proportional
                to the total electric charge enclosed within that surface.&quot;
              </div>
              <p className="indent-4">
                In spherical coordinates, due to radial symmetry, the field is uniform at every
                equidistant point from the origin, thereby rendering the surface integral elementary
                and invariant to angular coordinate shifts.
              </p>
            </div>

            {/* Right Page */}
            <div className="space-y-4 font-serif-scholarly text-xs sm:text-sm leading-relaxed text-[#202820] pl-0 md:pl-4">
              <div className="flex justify-between items-center text-[10px] text-[#8E7541] border-b border-[#E3DAC1]/80 pb-1 font-semibold">
                <span>{activeBook.category.toUpperCase()}</span>
                <span>Folio {Math.min(activeBook.totalPages, activeBook.currentPage + 1)}</span>
              </div>
              <p className="indent-4">
                When conducting rigorous field derivations, we substitute the surface integral with
                the volume integral via the divergence theorem:
              </p>
              <div className="p-3 bg-[#173B2D] text-[#F3EEDB] rounded-xl font-mono text-xs text-center border border-[#B59A62]/30 shadow-xs">
                ∮_S E · da = 1/ε₀ ∫_V ρ dV
              </div>
              <p className="indent-4">
                This enables analytical solutions for continuous charge distributions without
                resorting to cumbersome piecewise superposition sums.
              </p>

              {/* Scholar Marginalia Box */}
              <div className="mt-3 pt-3 border-t border-[#E3DAC1] text-[11px] text-[#8E7541]">
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <Feather className="w-3 h-3 text-[#B59A62]" />
                    <span>Scholar Marginalia</span>
                  </span>
                  <button
                    onClick={() => setIsAddingReaderNote(!isAddingReaderNote)}
                    className="text-[10px] text-[#173B2D] hover:underline"
                  >
                    {isAddingReaderNote ? 'Cancel' : '+ Inscribe Note'}
                  </button>
                </div>

                {activeBook.notes && (
                  <div className="bg-[#FFFDF8] p-2.5 rounded-lg border border-[#E3DAC1] text-[#202820] italic whitespace-pre-line max-h-24 overflow-y-auto">
                    {activeBook.notes}
                  </div>
                )}

                {isAddingReaderNote && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={readerNoteInput}
                      onChange={(e) => setReaderNoteInput(e.target.value)}
                      placeholder="Inscribe observation on current folio..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E3DAC1] text-xs text-[#202820] outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddReaderNote}
                        className="px-3 py-1 rounded-lg bg-[#173B2D] text-[#F3EEDB] text-[10px] font-bold"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reader Pagination & Progress Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#E3DAC1]">
            <div className="flex items-center gap-3">
              <button
                id="reader-page-back-btn"
                onClick={() => handlePageChange(-2)}
                disabled={activeBook.currentPage <= 1}
                className="p-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#173B2D] hover:bg-[#EAE2C8] disabled:opacity-40 transition-colors"
                title="Turn back two pages"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-serif-scholarly text-[#202820]">
                Folio <strong>{activeBook.currentPage}</strong> of{' '}
                <strong>{activeBook.totalPages}</strong>
              </span>

              <button
                id="reader-page-forward-btn"
                onClick={() => handlePageChange(2)}
                disabled={activeBook.currentPage >= activeBook.totalPages}
                className="p-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#173B2D] hover:bg-[#EAE2C8] disabled:opacity-40 transition-colors"
                title="Turn forward two pages"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Jump-to-Page Slider / Input */}
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-serif-scholarly text-[#8E7541]">
                Jump to Folio:
              </label>
              <input
                type="range"
                min="1"
                max={activeBook.totalPages}
                value={activeBook.currentPage}
                onChange={(e) => handleJumpToPage(parseInt(e.target.value, 10))}
                className="w-28 sm:w-36 accent-[#173B2D] cursor-pointer"
              />
              <span className="text-xs font-serif-scholarly text-[#173B2D] font-bold">
                {activeBook.currentPage}
              </span>
            </div>
          </div>
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
