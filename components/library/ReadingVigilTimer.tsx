'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Book, PomodoroVigilMode, ReadingFocusSession } from '@/types/mentis';
import { playCathedralChime, playSingingBowl } from '@/lib/scholarlyAudio';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Minimize2,
  Maximize2,
  X,
  Coffee,
  Hourglass,
  Feather,
} from 'lucide-react';

interface ReadingVigilTimerProps {
  books: Book[];
  activeBook?: Book | null;
  onUpdateBook?: (book: Book) => void;
  onLogSession?: (session: ReadingFocusSession) => void;
  onClose?: () => void;
  isFloating?: boolean;
}

const PRESET_DURATIONS: Record<PomodoroVigilMode, { label: string; minutes: number; isBreak?: boolean }> = {
  classic: { label: 'Classic Vigil', minutes: 25 },
  extended: { label: 'Dissertation', minutes: 50 },
  custom: { label: 'Custom Vigil', minutes: 30 },
  repose: { label: 'Scholar Repose', minutes: 5, isBreak: true },
};

export const ReadingVigilTimer: React.FC<ReadingVigilTimerProps> = ({
  books,
  activeBook,
  onUpdateBook,
  onLogSession,
  onClose,
  isFloating = false,
}) => {
  const [mode, setMode] = useState<PomodoroVigilMode>('classic');
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [selectedBookId, setSelectedBookId] = useState<string>(
    activeBook ? activeBook.id : books[0]?.id || ''
  );

  const targetMinutes =
    mode === 'custom' ? customMinutes : PRESET_DURATIONS[mode].minutes;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(targetMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(isFloating);

  // Pages tracked during vigil
  const selectedBook = books.find((b) => b.id === selectedBookId) || activeBook || null;
  const [startPage, setStartPage] = useState<number>(selectedBook ? selectedBook.currentPage : 1);
  const [endPage, setEndPage] = useState<number>(selectedBook ? selectedBook.currentPage : 1);

  // Completed modal state
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [reflectionNotes, setReflectionNotes] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    const bk = books.find((b) => b.id === bookId);
    if (bk) {
      setStartPage(bk.currentPage);
      setEndPage(bk.currentPage);
    }
  };

  // Handle timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (soundEnabled) {
              playCathedralChime();
            }
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  const handleModeSelect = (newMode: PomodoroVigilMode) => {
    setIsRunning(false);
    setMode(newMode);
    const newMinutes =
      newMode === 'custom' ? customMinutes : PRESET_DURATIONS[newMode].minutes;
    setSecondsRemaining(newMinutes * 60);
  };

  const handleStartPause = () => {
    if (!isRunning) {
      if (soundEnabled) {
        playSingingBowl();
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(targetMinutes * 60);
  };

  const handleCompleteEarly = () => {
    setIsRunning(false);
    if (soundEnabled) {
      playCathedralChime();
    }
    setShowCompletionModal(true);
  };

  const handleSaveVigilSession = () => {
    const elapsedSeconds = Math.max(0, targetMinutes * 60 - secondsRemaining);
    const pagesDelta = Math.max(0, endPage - startPage);

    const session: ReadingFocusSession = {
      id: `vigil_${Date.now()}`,
      userId: 'scholar_usr_01',
      bookId: selectedBook?.id,
      bookTitle: selectedBook?.title,
      mode,
      targetDurationMinutes: targetMinutes,
      completedDurationSeconds: elapsedSeconds,
      startPage,
      endPage,
      pagesReadDelta: pagesDelta,
      reflectionNotes: reflectionNotes.trim() || undefined,
      completedAt: new Date().toISOString(),
    };

    if (onLogSession) {
      onLogSession(session);
    }

    // Update the book's progress automatically
    if (selectedBook && onUpdateBook && endPage !== selectedBook.currentPage) {
      const clampedPage = Math.min(selectedBook.totalPages, Math.max(1, endPage));
      const newProgress = Math.round((clampedPage / selectedBook.totalPages) * 100);
      onUpdateBook({
        ...selectedBook,
        currentPage: clampedPage,
        progress: newProgress,
        lastReadAt: new Date().toISOString(),
        notes: reflectionNotes.trim()
          ? selectedBook.notes
            ? `${selectedBook.notes}\n• ${reflectionNotes.trim()}`
            : `• ${reflectionNotes.trim()}`
          : selectedBook.notes,
      });
    }

    setShowCompletionModal(false);
    setReflectionNotes('');
    setSecondsRemaining(targetMinutes * 60);
  };

  // Calculations for circular dial
  const totalSeconds = targetMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Render minimized floating pill
  if (isMinimized) {
    return (
      <div
        id="reading-vigil-minimized"
        className="fixed bottom-5 right-5 z-40 bg-[#173B2D] text-[#F3EEDB] px-4 py-2.5 rounded-2xl shadow-xl border border-[#B59A62] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3"
      >
        <div className="flex items-center gap-2">
          <Hourglass
            className={`w-4 h-4 text-[#B59A62] ${isRunning ? 'animate-pulse' : ''}`}
          />
          <span className="font-mono text-sm font-bold tracking-wider">{formattedTime}</span>
        </div>

        <div className="text-[11px] text-[#E3DAC1] border-l border-[#B59A62]/40 pl-2 max-w-[120px] truncate">
          {selectedBook ? selectedBook.title : 'Scholarly Vigil'}
        </div>

        <div className="flex items-center gap-1 pl-1">
          <button
            onClick={handleStartPause}
            className="p-1 rounded-lg bg-[#FAF7EE]/10 hover:bg-[#FAF7EE]/20 text-[#F3EEDB]"
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-lg bg-[#FAF7EE]/10 hover:bg-[#FAF7EE]/20 text-[#F3EEDB]"
            title="Expand Astrolabe Dial"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-[#FAF7EE]/10 hover:bg-[#FAF7EE]/20 text-[#F3EEDB]/70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id="reading-vigil-timer-card"
      className="parchment-card rounded-2xl p-5 sm:p-6 border border-[#B59A62]/60 shadow-lg relative overflow-hidden"
    >
      {/* Astrolabe Decorative Corner Inscriptions */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border border-[#B59A62]/20 pointer-events-none" />
      <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full border border-[#B59A62]/15 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E3DAC1] relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#173B2D]/10 flex items-center justify-center border border-[#173B2D]/20">
            <Hourglass className="w-4 h-4 text-[#173B2D]" />
          </div>
          <div>
            <h3 className="font-serif-scholarly text-base font-bold text-[#173B2D] flex items-center gap-2">
              <span>The Scholarly Vigil</span>
              <span className="text-[10px] uppercase px-2 py-0.2 rounded-full bg-[#B59A62]/20 text-[#8E7541] font-sans font-bold">
                Reading Focus
              </span>
            </h3>
            <p className="text-[11px] text-[#202820]/65 font-sans">
              Astrolabe Pomodoro session calibrated for uninterrupted manuscript contemplation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-[#FAF7EE] border-[#E3DAC1] text-[#173B2D]'
                : 'bg-stone-200/50 border-stone-300 text-stone-500'
            }`}
            title={soundEnabled ? 'Acoustic Bell Enabled' : 'Acoustic Bell Muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[#173B2D]"
            title="Minimize to Floating Bar"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#EAE2C8] text-[#202820]/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Presets Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs font-serif-scholarly relative z-10">
        {(['classic', 'extended', 'custom', 'repose'] as PomodoroVigilMode[]).map((m) => {
          const isSelected = mode === m;
          const preset = PRESET_DURATIONS[m];
          return (
            <button
              key={m}
              onClick={() => handleModeSelect(m)}
              className={`p-2 rounded-xl text-center border transition-all ${
                isSelected
                  ? 'bg-[#173B2D] text-[#F3EEDB] border-[#173B2D] shadow-xs font-bold'
                  : 'bg-[#FAF7EE] border-[#E3DAC1] text-[#202820]/75 hover:border-[#B59A62]'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                {m === 'repose' ? (
                  <Coffee className="w-3 h-3 text-[#B59A62]" />
                ) : (
                  <Sparkles className="w-3 h-3 text-[#B59A62]" />
                )}
                <span>{preset.label}</span>
              </div>
              <div
                className={`text-[10px] mt-0.5 ${
                  isSelected ? 'text-[#B59A62]' : 'text-[#8E7541]'
                }`}
              >
                {m === 'custom' ? `${customMinutes}m` : `${preset.minutes} min`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Astrolabe Dial Section */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 my-6 relative z-10">
        {/* SVG Circular Astrolabe Dial */}
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Outer Decorative Astrolabe Ring */}
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="#B59A62"
              strokeWidth="1"
              strokeDasharray="2, 6"
              opacity="0.5"
            />
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#E3DAC1"
              strokeWidth="8"
            />
            {/* Progress Active Stroke */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#173B2D"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
            />
          </svg>

          {/* Center Time & Status Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="text-[10px] font-serif-scholarly uppercase tracking-widest text-[#8E7541] font-semibold">
              {mode === 'repose' ? 'Scholarly Repose' : 'Contemplation'}
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#173B2D] my-1">
              {formattedTime}
            </span>
            <span className="text-[10px] text-[#202820]/60 font-sans">
              {isRunning ? 'Vigil in Progress' : 'Dial Ready'}
            </span>
          </div>
        </div>

        {/* Dial Controls & Associated Codex */}
        <div className="space-y-4 max-w-xs w-full text-xs font-serif-scholarly">
          {/* Associated Book Selector */}
          <div>
            <label className="block font-semibold mb-1 text-[#173B2D] flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Target Codex Under Study</span>
            </label>
            <select
              id="vigil-book-select"
              value={selectedBookId}
              onChange={(e) => handleBookChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none truncate"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.author}) — Page {b.currentPage}
                </option>
              ))}
            </select>
          </div>

          {/* Page Inscription Range */}
          {selectedBook && (
            <div className="p-3 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#8E7541] font-semibold">
                <span>Reading Ledger</span>
                <span>Max: {selectedBook.totalPages} folios</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-[#202820]/65">Start Page</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedBook.totalPages}
                    value={startPage}
                    onChange={(e) => setStartPage(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2 py-1 rounded-lg bg-white border border-[#E3DAC1] text-center font-mono font-bold"
                  />
                </div>
                <span className="text-[#8E7541] pt-3">→</span>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#202820]/65">End Page</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedBook.totalPages}
                    value={endPage}
                    onChange={(e) => setEndPage(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2 py-1 rounded-lg bg-white border border-[#E3DAC1] text-center font-mono font-bold"
                  />
                </div>
              </div>
              <div className="text-[10px] text-center text-[#173B2D] font-medium pt-0.5">
                {endPage >= startPage
                  ? `+${endPage - startPage} folios contemplated in this session`
                  : 'Adjust folios forward'}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              id="vigil-start-pause-btn"
              onClick={handleStartPause}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#173B2D] text-[#F3EEDB] font-bold flex items-center justify-center gap-2 hover:bg-[#122E23] transition-colors shadow-xs"
            >
              {isRunning ? <Pause className="w-4 h-4 text-[#B59A62]" /> : <Play className="w-4 h-4 text-[#B59A62]" />}
              <span>{isRunning ? 'Hold Vigil' : 'Commence Vigil'}</span>
            </button>

            <button
              id="vigil-reset-btn"
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:border-[#B59A62] text-[#173B2D]"
              title="Reset Astrolabe"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="vigil-seal-btn"
              onClick={handleCompleteEarly}
              className="px-3 py-2.5 rounded-xl bg-[#8E7541]/15 text-[#8E7541] border border-[#8E7541]/30 hover:bg-[#8E7541]/25 transition-colors font-semibold"
              title="Conclude and log session"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Completion & Reflection Modal */}
      {showCompletionModal && (
        <div
          id="vigil-completion-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#F4EEDC] p-6 shadow-2xl border border-[#B59A62] text-[#173B2D] space-y-4">
            <div className="text-center pb-3 border-b border-[#E3DAC1]">
              <div className="w-12 h-12 rounded-full bg-[#173B2D]/10 mx-auto flex items-center justify-center mb-2 border border-[#173B2D]/20">
                <Sparkles className="w-6 h-6 text-[#8E7541]" />
              </div>
              <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                Vigil Concluded & Sanctified
              </h3>
              <p className="text-xs text-[#202820]/70 font-sans mt-0.5">
                {targetMinutes} minutes of rigorous scholarly contemplation logged.
              </p>
            </div>

            <div className="space-y-3 text-xs font-serif-scholarly">
              <div className="p-3 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1]">
                <div className="text-[#8E7541] font-semibold mb-1">Session Folio Record</div>
                <div className="text-[#202820]">
                  <strong>{selectedBook?.title || 'General Manuscript'}</strong>: Folio{' '}
                  <strong>{startPage}</strong> to <strong>{endPage}</strong> (+
                  {Math.max(0, endPage - startPage)} folios read).
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#173B2D] flex items-center gap-1">
                  <Feather className="w-3.5 h-3.5 text-[#B59A62]" />
                  <span>Scholarly Marginalia & Reflection Note</span>
                </label>
                <textarea
                  id="vigil-reflection-input"
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="Inscribe a key theorem, conceptual breakthrough, or reflection gathered during this vigil..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] text-[#202820] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E3DAC1]">
              <button
                id="skip-vigil-notes-btn"
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-serif-scholarly text-[#202820]/70 hover:bg-[#EAE2C8]"
              >
                Dismiss
              </button>
              <button
                id="save-vigil-notes-btn"
                type="button"
                onClick={handleSaveVigilSession}
                className="px-5 py-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] text-xs font-serif-scholarly font-bold hover:bg-[#122E23] transition-colors shadow-xs"
              >
                Inscribe Session & Update Folio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
