'use client';

import React, { useState } from 'react';
import { Book, Course } from '@/types/mentis';
import { ScholarlyLibraryIcon } from '@/components/icons/ScholarlyIcons';
import { BookOpen, Plus, ArrowLeft, Bookmark, Sparkles, ChevronLeft, ChevronRight, Check } from 'lucide-react';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New book form
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('Physics');
  const [newPages, setNewPages] = useState(350);

  const categories = ['all', ...Array.from(new Set(books.map((b) => b.category)))];

  const filteredBooks = books.filter(
    (b) => filterCategory === 'all' || b.category === filterCategory
  );

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Book = {
      id: `book_${Date.now()}`,
      userId: 'scholar_usr_01',
      title: newTitle,
      author: newAuthor,
      category: newCategory,
      totalPages: newPages,
      currentPage: 1,
      progress: 0,
      lastReadAt: new Date().toISOString(),
    };
    onAddBook(created);
    setActiveBook(created);
    setIsAddModalOpen(false);
  };

  const handlePageChange = (delta: number) => {
    if (!activeBook) return;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-scholarly text-2xl font-bold text-[#173B2D]">
            Scholarly Library & Codexes
          </h2>
          <p className="text-xs text-[#202820]/70 font-sans mt-0.5">
            Physical-feel book collections, page bookmarks, and integrated text reader.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] text-xs font-serif-scholarly font-medium shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#B59A62]" />
          <span>Shelve New Codex</span>
        </button>
      </div>

      {/* Active Reader Mode */}
      {activeBook ? (
        <div className="parchment-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-md border border-[#B59A62]/40">
          {/* Reader Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E3DAC1]">
            <button
              onClick={() => setActiveBook(null)}
              className="flex items-center gap-1.5 text-xs font-serif-scholarly text-[#173B2D] hover:text-[#8E7541]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Bookshelf</span>
            </button>

            <div className="text-center">
              <span className="text-[10px] uppercase font-serif-scholarly text-[#8E7541] font-semibold">
                {activeBook.category}
              </span>
              <h3 className="font-serif-scholarly text-base sm:text-lg font-bold text-[#173B2D]">
                {activeBook.title}
              </h3>
              <span className="text-xs text-[#202820]/60 italic">by {activeBook.author}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#A9C9A9]/20 text-[#173B2D] text-xs font-serif-scholarly font-bold">
                {activeBook.progress}% Read
              </span>
            </div>
          </div>

          {/* Dual Parchment Pages (Physical Reader Simulation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7EE] p-6 rounded-2xl border border-[#E3DAC1] shadow-inner relative">
            {/* Center Book Spine Crease */}
            <div className="hidden md:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-3 bg-linear-to-r from-black/5 via-black/10 to-transparent pointer-events-none rounded-sm" />

            {/* Left Page */}
            <div className="space-y-4 font-serif-scholarly text-xs sm:text-sm leading-relaxed text-[#202820] pr-3">
              <div className="flex justify-between items-center text-[10px] text-[#202820]/50 border-b border-[#E3DAC1]/60 pb-1">
                <span>CHAPTER IV</span>
                <span>Page {activeBook.currentPage}</span>
              </div>
              <p className="indent-4">
                Consider a closed hypothetical volume enclosing charge density ρ. By Maxwell’s first formulation, the total divergence of the electric induction field across any enveloping boundary reflects the net bounded charge.
              </p>
              <div className="p-3 my-2 bg-[#F3EEDB] rounded-lg border-l-2 border-[#B59A62] text-xs italic font-serif-scholarly">
                &quot;The flux of the electrostatic field through any closed surface is proportional to the total electric charge enclosed within that surface.&quot;
              </div>
              <p>
                In spherical coordinates, due to radial symmetry, the field is uniform at every equidistant point from the origin, thereby rendering the surface integral elementary.
              </p>
            </div>

            {/* Right Page */}
            <div className="space-y-4 font-serif-scholarly text-xs sm:text-sm leading-relaxed text-[#202820] pl-3">
              <div className="flex justify-between items-center text-[10px] text-[#202820]/50 border-b border-[#E3DAC1]/60 pb-1">
                <span>ELECTRODYNAMICS</span>
                <span>Page {Math.min(activeBook.totalPages, activeBook.currentPage + 1)}</span>
              </div>
              <p className="indent-4">
                When conducting rigorous field derivations, we substitute the surface integral with the volume integral via the divergence theorem:
              </p>
              <div className="p-2.5 bg-[#173B2D] text-[#F3EEDB] rounded-lg font-mono text-[11px] text-center">
                ∮_S E · da = 1/ε₀ ∫_V ρ dV
              </div>
              <p>
                This allows analytical solution of asymmetric charge densities without resorting to tedious piecewise superposition summations.
              </p>
            </div>
          </div>

          {/* Reader Pagination & Progress Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(-2)}
                disabled={activeBook.currentPage <= 1}
                className="p-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#173B2D] hover:bg-[#EAE2C8] disabled:opacity-40 transition-colors"
                title="Turn back two pages"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-serif-scholarly text-[#202820]">
                Page <strong>{activeBook.currentPage}</strong> of <strong>{activeBook.totalPages}</strong>
              </span>
              <button
                onClick={() => handlePageChange(2)}
                disabled={activeBook.currentPage >= activeBook.totalPages}
                className="p-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#173B2D] hover:bg-[#EAE2C8] disabled:opacity-40 transition-colors"
                title="Turn forward two pages"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-serif-scholarly text-[#8E7541]">
                Bookmark set at Page {activeBook.currentPage}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Bookshelf Collection Grid */
        <div className="space-y-5">
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

          {/* Bookshelf Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => setActiveBook(book)}
                className="parchment-card rounded-2xl p-4 flex flex-col justify-between hover:border-[#B59A62] cursor-pointer transition-all hover:-translate-y-1 shadow-xs group"
              >
                <div>
                  {/* Book Spine Graphic Header */}
                  <div className="h-32 rounded-xl bg-[#173B2D] border-l-6 border-[#B59A62] p-3 flex flex-col justify-between text-[#F3EEDB] shadow-inner mb-3.5 relative overflow-hidden">
                    <div className="w-full flex justify-between items-center opacity-60 text-[9px] font-serif-scholarly">
                      <span>{book.category}</span>
                      <Bookmark className="w-3 h-3 text-[#B59A62]" />
                    </div>
                    <h4 className="font-serif-scholarly text-xs font-bold leading-tight line-clamp-2">
                      {book.title}
                    </h4>
                    <span className="text-[10px] text-[#A9C9A9] font-serif-scholarly italic truncate">
                      {book.author}
                    </span>
                  </div>

                  <span className="text-[10px] font-serif-scholarly text-[#8E7541] font-semibold block uppercase">
                    {book.category}
                  </span>
                  <h4 className="font-serif-scholarly text-sm font-bold text-[#173B2D] group-hover:text-[#8E7541] transition-colors line-clamp-2">
                    {book.title}
                  </h4>
                  <p className="text-xs text-[#202820]/60 italic mt-0.5">by {book.author}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E3DAC1]">
                  <div className="flex items-center justify-between text-[11px] font-serif-scholarly mb-1">
                    <span className="text-[#202820]/60">Page {book.currentPage}/{book.totalPages}</span>
                    <span className="font-bold text-[#173B2D]">{book.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#EAE2C8] overflow-hidden">
                    <div
                      className="h-full bg-[#173B2D] rounded-full"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#F3EEDB] p-6 shadow-2xl border border-[#B59A62]/50 text-[#173B2D]">
            <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D] pb-3 border-b border-[#E3DAC1]">
              Shelve a New Academic Codex
            </h3>

            <form onSubmit={handleCreateBook} className="mt-4 space-y-3.5 text-xs font-serif-scholarly">
              <div>
                <label className="block font-semibold mb-1">Book Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Principia Mathematica"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
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
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Field / Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Total Pages</label>
                  <input
                    type="number"
                    min="1"
                    value={newPages}
                    onChange={(e) => setNewPages(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3DAC1]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-[#202820]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#173B2D] text-[#F3EEDB] font-medium"
                >
                  Shelve Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
