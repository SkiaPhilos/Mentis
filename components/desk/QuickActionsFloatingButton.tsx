'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, TransientTask, StudySessionLog, Note } from '@/types/mentis';
import { MentisRepository } from '@/lib/storage/repository';
import {
  Sparkles,
  Plus,
  Clock,
  CheckSquare,
  Scroll,
  X,
  Flame,
  Check,
  Feather,
  BookOpen,
} from 'lucide-react';
import {
  playClickTactile,
  playWaxSealStamp,
  playQuillScratch,
  playParchmentRustle,
} from '@/lib/audio/soundEffects';

interface QuickActionsFloatingButtonProps {
  courses: Course[];
  onNoteCreated?: (note: Note) => void;
  onTaskAdded?: (task: TransientTask) => void;
  onStudyLogged?: (log: StudySessionLog) => void;
}

type ModalAction = 'study' | 'task' | 'thought' | null;

export const QuickActionsFloatingButton: React.FC<QuickActionsFloatingButtonProps> = ({
  courses,
  onNoteCreated,
  onTaskAdded,
  onStudyLogged,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalAction>(null);

  // Form states for Log Study Session
  const [studyTitle, setStudyTitle] = useState('');
  const [studyCourseId, setStudyCourseId] = useState('');
  const [studyDuration, setStudyDuration] = useState<number>(45);
  const [studyVigilType, setStudyVigilType] = useState<StudySessionLog['vigilType']>('deep_study');
  const [studyNotes, setStudyNotes] = useState('');

  // Form states for Transient Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCourseId, setTaskCourseId] = useState('');
  const [taskPriority, setTaskPriority] = useState<TransientTask['priority']>('standard');
  const [taskDueTime, setTaskDueTime] = useState('');

  // Form states for Rapid Thought
  const [thoughtTitle, setThoughtTitle] = useState('');
  const [thoughtBody, setThoughtBody] = useState('');
  const [thoughtTag, setThoughtTag] = useState('epiphany');
  const [thoughtCourseId, setThoughtCourseId] = useState('');

  // Toast banner for feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleMenu = () => {
    playParchmentRustle();
    setIsOpen((prev) => !prev);
  };

  const openAction = (action: ModalAction) => {
    playClickTactile();
    setActiveModal(action);
    setIsOpen(false);
  };

  const closeModal = () => {
    playClickTactile();
    setActiveModal(null);
  };

  // Submit Handlers
  const handleSaveStudySession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyTitle.trim()) return;

    playWaxSealStamp();
    const newLog: StudySessionLog = {
      id: `slog_${Date.now()}`,
      userId: 'scholar_usr_01',
      title: studyTitle.trim(),
      courseId: studyCourseId || undefined,
      durationMinutes: Number(studyDuration) || 30,
      vigilType: studyVigilType,
      notes: studyNotes.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    if (onStudyLogged) {
      onStudyLogged(newLog);
    } else {
      MentisRepository.addStudyLog(newLog);
    }

    showToast(`✨ Inscribed ${studyDuration}m study vigil: "${studyTitle.trim()}"`);
    setStudyTitle('');
    setStudyNotes('');
    setActiveModal(null);
  };

  const handleSaveTransientTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    playClickTactile();
    const newTask: TransientTask = {
      id: `task_${Date.now()}`,
      userId: 'scholar_usr_01',
      title: taskTitle.trim(),
      courseId: taskCourseId || undefined,
      completed: false,
      priority: taskPriority,
      dueTime: taskDueTime.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    if (onTaskAdded) {
      onTaskAdded(newTask);
    } else {
      MentisRepository.addTask(newTask);
    }

    showToast(`🗡️ Added scholarly quest: "${taskTitle.trim()}"`);
    setTaskTitle('');
    setTaskDueTime('');
    setActiveModal(null);
  };

  const handleSaveRapidThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thoughtBody.trim()) return;

    playQuillScratch();
    const resolvedTitle = thoughtTitle.trim() || `Fleeting Thought — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    const newNote: Note = {
      id: `note_${Date.now()}`,
      userId: 'scholar_usr_01',
      courseId: thoughtCourseId || undefined,
      title: resolvedTitle,
      blocks: [
        {
          id: `block_1`,
          type: 'paragraph',
          content: thoughtBody.trim(),
        },
      ],
      tags: [thoughtTag, 'rapid-capture'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onNoteCreated) {
      onNoteCreated(newNote);
    } else {
      MentisRepository.addNote(newNote);
    }

    showToast(`📜 Inscribed rapid manuscript: "${resolvedTitle}"`);
    setThoughtTitle('');
    setThoughtBody('');
    setActiveModal(null);
  };

  return (
    <>
      {/* Floating Action Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto bg-[#173B2D] text-[#F3EEDB] px-4 py-2.5 rounded-xl shadow-lg border border-[#B59A62] text-xs font-serif-scholarly flex items-center gap-2 max-w-sm"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Menu Options */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto flex flex-col items-end gap-2.5 mb-1"
            >
              {/* Option 1: Log Study Session */}
              <button
                onClick={() => openAction('study')}
                className="group flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#FAF7EE] hover:bg-[#F3EEDB] text-[#173B2D] border border-[#B59A62]/60 shadow-md transition-all cursor-pointer hover:translate-x--1"
              >
                <span className="text-xs font-serif-scholarly font-bold text-[#173B2D]">
                  Log Study Session
                </span>
                <span className="w-9 h-9 rounded-lg bg-[#173B2D] text-[#F3EEDB] flex items-center justify-center shadow-xs">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                </span>
              </button>

              {/* Option 2: Add Transient Task */}
              <button
                onClick={() => openAction('task')}
                className="group flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#FAF7EE] hover:bg-[#F3EEDB] text-[#173B2D] border border-[#B59A62]/60 shadow-md transition-all cursor-pointer hover:translate-x--1"
              >
                <span className="text-xs font-serif-scholarly font-bold text-[#173B2D]">
                  Add Transient Task
                </span>
                <span className="w-9 h-9 rounded-lg bg-[#2C5E4B] text-[#F3EEDB] flex items-center justify-center shadow-xs">
                  <CheckSquare className="w-4 h-4 text-[#B59A62]" />
                </span>
              </button>

              {/* Option 3: Capture Rapid Thought */}
              <button
                onClick={() => openAction('thought')}
                className="group flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#FAF7EE] hover:bg-[#F3EEDB] text-[#173B2D] border border-[#B59A62]/60 shadow-md transition-all cursor-pointer hover:translate-x--1"
              >
                <span className="text-xs font-serif-scholarly font-bold text-[#173B2D]">
                  Capture Rapid Thought
                </span>
                <span className="w-9 h-9 rounded-lg bg-[#8E7541] text-[#F3EEDB] flex items-center justify-center shadow-xs">
                  <Scroll className="w-4 h-4 text-[#F3EEDB]" />
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMenu}
          title="Quick Scholarly Actions"
          className="pointer-events-auto w-14 h-14 rounded-2xl bg-[#173B2D] hover:bg-[#122E23] text-[#F3EEDB] flex items-center justify-center shadow-xl border-2 border-[#B59A62] transition-colors cursor-pointer group relative"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6 text-[#D4AF37]" />
              </motion.span>
            ) : (
              <motion.span
                key="feather"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Feather className="w-6 h-6 text-[#D4AF37] group-hover:rotate-12 transition-transform duration-200" />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#B59A62] border-2 border-[#173B2D]" />
        </motion.button>
      </div>

      {/* Backdrop for open FAB menu */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/15 backdrop-blur-[1px]"
        />
      )}

      {/* Modals for Quick Actions */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#FAF7EE] border-2 border-[#B59A62] rounded-2xl shadow-2xl p-6 text-[#202820] relative"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-1 rounded-lg text-[#202820]/50 hover:text-[#173B2D] hover:bg-[#EAE2C8] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* MODAL 1: Log Study Session */}
              {activeModal === 'study' && (
                <form onSubmit={handleSaveStudySession} className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#E3DAC1] pb-3">
                    <span className="w-9 h-9 rounded-xl bg-[#173B2D] text-[#D4AF37] flex items-center justify-center shadow-xs">
                      <Clock className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                        Log Study Session
                      </h3>
                      <p className="text-xs text-[#202820]/70 font-sans">
                        Record focused study time on your scholarly velocity register.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                      Topic or Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={studyTitle}
                      onChange={(e) => setStudyTitle(e.target.value)}
                      placeholder="e.g. Stokes’ Theorem Derivation & Problems"
                      className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                        Course
                      </label>
                      <select
                        value={studyCourseId}
                        onChange={(e) => setStudyCourseId(e.target.value)}
                        className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                      >
                        <option value="">Independent Study</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code}: {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                        Vigil Type
                      </label>
                      <select
                        value={studyVigilType}
                        onChange={(e) =>
                          setStudyVigilType(e.target.value as StudySessionLog['vigilType'])
                        }
                        className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                      >
                        <option value="deep_study">Deep Study</option>
                        <option value="reading">Reading Vigil</option>
                        <option value="problem_drill">Problem Drill</option>
                        <option value="revision">Revision</option>
                        <option value="inquiry">AI Socratic Inquiry</option>
                      </select>
                    </div>
                  </div>

                  {/* Duration Presets */}
                  <div>
                    <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1.5">
                      Duration: {studyDuration} minutes
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 45, 60, 90].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setStudyDuration(mins)}
                          className={`py-1.5 rounded-lg text-xs font-serif-scholarly font-bold border transition-colors cursor-pointer ${
                            studyDuration === mins
                              ? 'bg-[#173B2D] text-[#F3EEDB] border-[#173B2D]'
                              : 'bg-[#F3EEDB] text-[#173B2D] border-[#E3DAC1] hover:border-[#B59A62]'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                      Scholarly Reflection / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={studyNotes}
                      onChange={(e) => setStudyNotes(e.target.value)}
                      placeholder="Optional notes on insights, lemmas proven, or pages covered..."
                      className="w-full text-xs font-sans px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#202820]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E3DAC1]">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl text-xs font-serif-scholarly font-bold text-[#202820]/70 hover:text-[#173B2D] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#173B2D] hover:bg-[#122E23] text-[#F3EEDB] text-xs font-serif-scholarly font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>Inscribe Vigil</span>
                    </button>
                  </div>
                </form>
              )}

              {/* MODAL 2: Add Transient Task */}
              {activeModal === 'task' && (
                <form onSubmit={handleSaveTransientTask} className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#E3DAC1] pb-3">
                    <span className="w-9 h-9 rounded-xl bg-[#2C5E4B] text-[#F3EEDB] flex items-center justify-center shadow-xs">
                      <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
                    </span>
                    <div>
                      <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                        Add Transient Task
                      </h3>
                      <p className="text-xs text-[#202820]/70 font-sans">
                        Capture a fleeting scholarly quest for today’s desk.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                      Task Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Inscribe marginalia on Chapter 4 of Discrete Math"
                      className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                        Course
                      </label>
                      <select
                        value={taskCourseId}
                        onChange={(e) => setTaskCourseId(e.target.value)}
                        className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                      >
                        <option value="">General Quest</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code}: {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                        Priority
                      </label>
                      <select
                        value={taskPriority}
                        onChange={(e) =>
                          setTaskPriority(e.target.value as TransientTask['priority'])
                        }
                        className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                      >
                        <option value="vigilant">Vigilant (High / Urgent)</option>
                        <option value="standard">Standard</option>
                        <option value="minor">Minor Quest</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                      Due Time (Optional)
                    </label>
                    <input
                      type="text"
                      value={taskDueTime}
                      onChange={(e) => setTaskDueTime(e.target.value)}
                      placeholder="e.g. 15:30 or Before Seminar"
                      className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E3DAC1]">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl text-xs font-serif-scholarly font-bold text-[#202820]/70 hover:text-[#173B2D] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#173B2D] hover:bg-[#122E23] text-[#F3EEDB] text-xs font-serif-scholarly font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>Add Quest</span>
                    </button>
                  </div>
                </form>
              )}

              {/* MODAL 3: Capture Rapid Thought */}
              {activeModal === 'thought' && (
                <form onSubmit={handleSaveRapidThought} className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#E3DAC1] pb-3">
                    <span className="w-9 h-9 rounded-xl bg-[#8E7541] text-[#F3EEDB] flex items-center justify-center shadow-xs">
                      <Scroll className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                        Capture Rapid Thought
                      </h3>
                      <p className="text-xs text-[#202820]/70 font-sans">
                        Immediately inscribe an intuition or epiphany into Manuscripts.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                      Manuscript Title
                    </label>
                    <input
                      type="text"
                      value={thoughtTitle}
                      onChange={(e) => setThoughtTitle(e.target.value)}
                      placeholder="e.g. Epiphany on Maxwell Displacement Current"
                      className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                        Course (Optional)
                      </label>
                      <select
                        value={thoughtCourseId}
                        onChange={(e) => setThoughtCourseId(e.target.value)}
                        className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                      >
                        <option value="">General Manuscript</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code}: {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                        Tag Category
                      </label>
                      <select
                        value={thoughtTag}
                        onChange={(e) => setThoughtTag(e.target.value)}
                        className="w-full text-xs font-serif-scholarly px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#173B2D]"
                      >
                        <option value="epiphany">💡 Epiphany</option>
                        <option value="formula">📐 Formula / Proof</option>
                        <option value="hypothesis">🔬 Hypothesis</option>
                        <option value="question">❓ Unsolved Question</option>
                        <option value="citation">📚 Citation / Excerpt</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-serif-scholarly font-bold text-[#173B2D] mb-1">
                      Manuscript Content *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={thoughtBody}
                      onChange={(e) => setThoughtBody(e.target.value)}
                      placeholder="Inscribe your mathematical reasoning, philosophical premise, or quick scholarly observation..."
                      className="w-full text-xs font-sans px-3 py-2 rounded-xl bg-[#F3EEDB] border border-[#E3DAC1] focus:border-[#173B2D] focus:outline-hidden text-[#202820]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E3DAC1]">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl text-xs font-serif-scholarly font-bold text-[#202820]/70 hover:text-[#173B2D] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#173B2D] hover:bg-[#122E23] text-[#F3EEDB] text-xs font-serif-scholarly font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Feather className="w-4 h-4 text-[#D4AF37]" />
                      <span>Inscribe Thought</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
