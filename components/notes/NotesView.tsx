'use client';

import React, { useState } from 'react';
import { Note, Course, NoteBlock } from '@/types/mentis';
import { MentisRepository } from '@/lib/storage/repository';
import { ScholarlyNotesIcon } from '@/components/icons/ScholarlyIcons';
import { Plus, Trash2, Tag, Search, Sparkles, ArrowLeft, BookOpen, Quote, Code, Heading } from 'lucide-react';
import { VoiceDictationButton } from '@/components/ai/VoiceDictationButton';
import { playParchmentRustle, playQuillScratch, playClickTactile } from '@/lib/audio/soundEffects';

interface NotesViewProps {
  notes: Note[];
  courses: Course[];
  initialNoteId?: string | null;
  onAddNote: (note: Note) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

let noteCounter = 0;
function createScholarlyId(prefix: string): string {
  noteCounter += 1;
  return `${prefix}_${noteCounter}`;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  courses,
  initialNoteId,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(
    initialNoteId || (notes[0]?.id ?? null)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.blocks.some((b) => b.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCourse =
      selectedCourseFilter === 'all' || n.courseId === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  const handleCreateNewNote = () => {
    playParchmentRustle();
    const newNote: Note = {
      id: createScholarlyId('note'),
      userId: 'scholar_usr_01',
      courseId: courses[0]?.id,
      title: 'Untitled Manuscript',
      blocks: [
        {
          id: createScholarlyId('block'),
          type: 'heading',
          content: 'Scholarly Inscription',
        },
        {
          id: createScholarlyId('block'),
          type: 'paragraph',
          content: 'Record observations, proofs, and definitions here...',
        },
      ],
      tags: ['Study'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddNote(newNote);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateTitle = (newTitle: string) => {
    if (!activeNote) return;
    onUpdateNote({
      ...activeNote,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddBlock = (type: NoteBlock['type']) => {
    if (!activeNote) return;
    playQuillScratch();
    const newBlock: NoteBlock = {
      id: createScholarlyId('block'),
      type,
      content: type === 'heading' ? 'New Section' : '',
    };
    onUpdateNote({
      ...activeNote,
      blocks: [...activeNote.blocks, newBlock],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAppendDictatedParagraph = (transcribedText: string) => {
    if (!activeNote) return;
    playQuillScratch();
    const newBlock: NoteBlock = {
      id: createScholarlyId('block'),
      type: 'paragraph',
      content: transcribedText,
    };
    onUpdateNote({
      ...activeNote,
      blocks: [...activeNote.blocks, newBlock],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateBlockContent = (blockId: string, content: string) => {
    if (!activeNote) return;
    onUpdateNote({
      ...activeNote,
      blocks: activeNote.blocks.map((b) => (b.id === blockId ? { ...b, content } : b)),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!activeNote || activeNote.blocks.length <= 1) return;
    playClickTactile();
    onUpdateNote({
      ...activeNote,
      blocks: activeNote.blocks.filter((b) => b.id !== blockId),
      updatedAt: new Date().toISOString(),
    });
  };

  // AI-Assisted Titling & Summary
  const handleAISummarize = async () => {
    if (!activeNote) return;
    setIsGeneratingAI(true);
    try {
      const aiCreds = MentisRepository.getAiCredentials();
      const textCorpus = activeNote.blocks.map((b) => b.content).join('\n');
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textCorpus,
          title: activeNote.title,
          encryptedKey: aiCreds.encryptedKey || undefined,
          magicSpell: aiCreds.magicSpell || undefined,
          model: aiCreds.modelPreference || 'gemini-3.8-flash',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          const summaryBlock: NoteBlock = {
            id: createScholarlyId('summary'),
            type: 'quote',
            content: `[AI Scholarly Synthesis]: ${data.summary}`,
          };
          onUpdateNote({
            ...activeNote,
            title: data.recommendedTitle || activeNote.title,
            blocks: [summaryBlock, ...activeNote.blocks],
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        const noticeBlock: NoteBlock = {
          id: createScholarlyId('notice'),
          type: 'quote',
          content: `[Synthesis Stasis]: ${errData.message || 'AI not configured. Seal a Magical Key in Profile > Scholarly Arcana to awaken the synthesis engine.'}`,
        };
        onUpdateNote({
          ...activeNote,
          blocks: [noticeBlock, ...activeNote.blocks],
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('AI summary error:', e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-scholarly text-2xl font-bold text-[#173B2D]">
            Scholarly Manuscripts
          </h2>
          <p className="text-xs text-[#202820]/70 font-sans mt-0.5">
            Handwritten notes, transcribed proofs, theorems, and OCR annotations.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] text-xs font-serif-scholarly font-medium shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#B59A62]" />
          <span>New Manuscript</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Manuscript Index */}
        <div
          className={`lg:col-span-4 parchment-card rounded-2xl p-4 space-y-3 ${
            activeNote ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Search & Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#202820]/40" />
            <input
              type="text"
              placeholder="Search scrolls & proofs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-serif-scholarly bg-[#FAF7EE] border border-[#E3DAC1] rounded-xl text-[#202820] placeholder:text-[#202820]/40"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-serif-scholarly">
            <button
              onClick={() => setSelectedCourseFilter('all')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                selectedCourseFilter === 'all'
                  ? 'bg-[#173B2D] text-[#F3EEDB] font-semibold'
                  : 'text-[#202820]/70 hover:bg-[#EAE2C8]'
              }`}
            >
              All Manuscripts
            </button>
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourseFilter(c.id)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                  selectedCourseFilter === c.id
                    ? 'bg-[#173B2D] text-[#F3EEDB] font-semibold'
                    : 'text-[#202820]/70 hover:bg-[#EAE2C8]'
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>

          {/* Manuscript List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const isSelected = note.id === activeNoteId;
              const course = courses.find((c) => c.id === note.courseId);

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    playParchmentRustle();
                    setActiveNoteId(note.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF7EE] border-[#B59A62] shadow-xs'
                      : 'bg-[#FAF7EE]/60 border-[#E3DAC1] hover:bg-[#FAF7EE]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif-scholarly text-xs font-bold text-[#173B2D] line-clamp-1">
                      {note.title}
                    </h4>
                    {course && (
                      <span className="text-[10px] font-serif-scholarly text-[#8E7541] font-semibold shrink-0">
                        {course.code}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#202820]/65 line-clamp-2 mt-1 font-sans">
                    {note.blocks[0]?.content || 'Empty scroll'}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.2 rounded text-[9px] bg-[#A9C9A9]/25 text-[#173B2D]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Manuscript Editor */}
        <div
          className={`lg:col-span-8 parchment-card rounded-2xl p-6 sm:p-7 ${
            !activeNote ? 'hidden lg:block' : 'block'
          }`}
        >
          {activeNote ? (
            <div className="space-y-5">
              {/* Top Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1]">
                <button
                  onClick={() => {
                    playClickTactile();
                    setActiveNoteId(null);
                  }}
                  className="lg:hidden flex items-center gap-1 text-xs font-serif-scholarly text-[#173B2D] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Manuscripts</span>
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <VoiceDictationButton
                    onTranscription={handleAppendDictatedParagraph}
                    tooltip="Dictate voice transcription into new paragraph"
                  />

                  <button
                    onClick={handleAISummarize}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif-scholarly text-[#8E7541] bg-[#FAF7EE] border border-[#B59A62]/50 hover:bg-[#FAF7EE] rounded-xl transition-colors cursor-pointer"
                    title="Generate scholarly synthesis & recommended title"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#B59A62]" />
                    <span>{isGeneratingAI ? 'Synthesizing...' : 'AI Synthesis'}</span>
                  </button>

                  <button
                    onClick={() => {
                      playClickTactile();
                      onDeleteNote(activeNote.id);
                      setActiveNoteId(null);
                    }}
                    className="p-1.5 text-rose-800 hover:bg-rose-50 rounded-xl cursor-pointer"
                    title="Delete manuscript"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Manuscript Title Input with Voice Dictation */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  placeholder="Manuscript Title..."
                  className="flex-1 font-serif-scholarly text-xl sm:text-2xl font-bold text-[#173B2D] bg-transparent border-b border-transparent hover:border-[#E3DAC1] focus:border-[#B59A62] outline-hidden pb-1"
                />
                <VoiceDictationButton
                  compact
                  onTranscription={(text) =>
                    handleUpdateTitle(
                      activeNote.title ? `${activeNote.title} ${text}` : text
                    )
                  }
                  tooltip="Dictate manuscript title"
                />
              </div>

              {/* Course & Metadata Tagging */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-serif-scholarly">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#8E7541]" />
                  <select
                    value={activeNote.courseId || ''}
                    onChange={(e) =>
                      onUpdateNote({ ...activeNote, courseId: e.target.value })
                    }
                    className="bg-transparent border border-[#E3DAC1] rounded-lg px-2 py-0.5 text-[#173B2D]"
                  >
                    <option value="">No Course Associated</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 text-[#202820]/60">
                  <Tag className="w-3 h-3 text-[#B59A62]" />
                  <span>{activeNote.tags.join(', ')}</span>
                </div>
              </div>

              {/* Manuscript Content Blocks */}
              <div className="space-y-4 pt-2">
                {activeNote.blocks.map((block) => (
                  <div key={block.id} className="relative group">
                    {block.type === 'heading' && (
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                        className="w-full font-serif-scholarly text-base sm:text-lg font-bold text-[#173B2D] bg-transparent border-b border-dashed border-[#E3DAC1] focus:border-[#B59A62] outline-hidden py-1"
                        placeholder="Heading title..."
                      />
                    )}

                    {block.type === 'paragraph' && (
                      <div className="relative">
                        <textarea
                          value={block.content}
                          onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                          rows={3}
                          className="w-full font-sans text-sm leading-relaxed text-[#202820] bg-transparent border border-transparent hover:border-[#E3DAC1] focus:border-[#B59A62] rounded-lg p-2 pr-9 outline-hidden resize-y"
                          placeholder="Write paragraphs, proofs, or notes..."
                        />
                        <div className="absolute right-2 top-2 z-10">
                          <VoiceDictationButton
                            compact
                            onTranscription={(text) => {
                              playQuillScratch();
                              handleUpdateBlockContent(
                                block.id,
                                block.content ? `${block.content} ${text}` : text
                              );
                            }}
                            tooltip="Dictate directly into paragraph"
                          />
                        </div>
                      </div>
                    )}

                    {block.type === 'quote' && (
                      <div className="border-l-3 border-[#B59A62] pl-3 py-1 bg-[#F3EEDB]/40 rounded-r-lg">
                        <textarea
                          value={block.content}
                          onChange={(e) =>
                            handleUpdateBlockContent(block.id, e.target.value)
                          }
                          rows={2}
                          className="w-full font-serif-scholarly italic text-xs sm:text-sm text-[#173B2D] bg-transparent outline-hidden resize-none"
                          placeholder="Quote, axiom, or theorem..."
                        />
                      </div>
                    )}

                    {block.type === 'code' && (
                      <div className="bg-[#173B2D] text-[#F3EEDB] p-3 rounded-xl font-mono text-xs">
                        <textarea
                          value={block.content}
                          onChange={(e) =>
                            handleUpdateBlockContent(block.id, e.target.value)
                          }
                          rows={2}
                          className="w-full bg-transparent outline-hidden resize-none"
                          placeholder="Code snippet or formula..."
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="absolute right-1 top-1 opacity-0 group-hover:opacity-70 hover:opacity-100 p-1 text-rose-700 transition-opacity"
                      title="Remove section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Block Toolstrip */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#E3DAC1] text-xs font-serif-scholarly">
                <span className="text-[#202820]/50 text-[11px]">Append section:</span>
                <button
                  onClick={() => handleAddBlock('paragraph')}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[#173B2D]"
                >
                  Paragraph
                </button>
                <button
                  onClick={() => handleAddBlock('heading')}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[#173B2D] flex items-center gap-1"
                >
                  <Heading className="w-3 h-3" />
                  <span>Heading</span>
                </button>
                <button
                  onClick={() => handleAddBlock('quote')}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[#173B2D] flex items-center gap-1"
                >
                  <Quote className="w-3 h-3" />
                  <span>Axiom / Quote</span>
                </button>
                <button
                  onClick={() => handleAddBlock('code')}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[#173B2D] flex items-center gap-1"
                >
                  <Code className="w-3 h-3" />
                  <span>Formula / Code</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-[#202820]/60">
              <ScholarlyNotesIcon size={36} className="mx-auto text-[#B59A62] mb-3" />
              <h3 className="font-serif-scholarly text-base font-bold text-[#173B2D]">
                Select or Inscribe a Manuscript
              </h3>
              <p className="text-xs font-sans mt-1">
                Choose an existing manuscript from the index or compose a fresh study scroll.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
