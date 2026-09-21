'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import {
  UserProfile,
  ScheduleBlock,
  CommuteProfile,
  Book,
  Note,
  Course,
} from '@/types/mentis';
import { calculateLeaveBy } from '@/lib/commuteCalculator';
import { MentisGuide } from '@/components/character/MentisGuide';
import {
  ScholarlyScheduleIcon,
  ScholarlyNotesIcon,
  ScholarlyLibraryIcon,
  ScholarlyLearningIcon,
} from '@/components/icons/ScholarlyIcons';
import {
  Clock,
  Compass,
  BookOpen,
  ArrowRight,
  Flame,
  PlusCircle,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '@/components/layout/ScholarlyShell';

// Deterministic Time & Date Store using useSyncExternalStore
interface TimeSnapshot {
  greeting: string;
  formattedDate: string;
  dayIndex: number;
  key: string;
}

let cachedClientSnapshot: TimeSnapshot = {
  greeting: 'Greetings',
  formattedDate: 'Scholarly Calendar',
  dayIndex: 0,
  key: '',
};

function getClientTimeSnapshot(): TimeSnapshot {
  if (typeof window === 'undefined') return serverTimeSnapshot;
  const now = new Date();
  const hours = now.getHours();
  let greeting = 'Good Morning';
  if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
  else if (hours >= 17) greeting = 'Good Evening';

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const dayIndex = (now.getDay() + 6) % 7;
  const key = `${dayIndex}-${greeting}-${formattedDate}`;
  if (cachedClientSnapshot.key !== key) {
    cachedClientSnapshot = { greeting, formattedDate, dayIndex, key };
  }
  return cachedClientSnapshot;
}

const serverTimeSnapshot: TimeSnapshot = {
  greeting: 'Greetings',
  formattedDate: 'Scholarly Calendar',
  dayIndex: 0,
  key: 'ssr',
};

function getServerTimeSnapshot(): TimeSnapshot {
  return serverTimeSnapshot;
}

function subscribeToTime(callback: () => void) {
  const interval = setInterval(callback, 60000);
  return () => clearInterval(interval);
}

interface DailyDeskViewProps {
  profile: UserProfile;
  courses: Course[];
  schedule: ScheduleBlock[];
  commute: CommuteProfile;
  books: Book[];
  notes: Note[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenBook: (book: Book) => void;
  onOpenNote: (note: Note) => void;
}

export const DailyDeskView: React.FC<DailyDeskViewProps> = ({
  profile,
  courses,
  schedule,
  commute,
  books,
  notes,
  onNavigate,
  onOpenBook,
  onOpenNote,
}) => {
  // Pure external store subscription - zero cascading render setState in effect
  const { greeting: timeGreeting, formattedDate, dayIndex } = useSyncExternalStore(
    subscribeToTime,
    getClientTimeSnapshot,
    getServerTimeSnapshot
  );

  const [guideEmotion, setGuideEmotion] = useState<'idle' | 'smile' | 'celebratory' | 'curious'>('smile');

  // Filter today's classes based on deterministic dayIndex
  const todayClasses = schedule
    .filter((b) => b.dayOfWeek === dayIndex)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  // If no classes today, preview Monday's classes as scholarly showcase
  const displayClasses = todayClasses.length > 0 ? todayClasses : schedule.filter((b) => b.dayOfWeek === 0);
  const nextClass = displayClasses[0] || schedule[0];

  // Calculate Leave-By details
  const leaveBy = nextClass ? calculateLeaveBy(nextClass, commute) : null;

  // Active book
  const currentBook = books[0];
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="space-y-7">
      {/* Scholar's Greeting & Ambiance Banner */}
      <div className="parchment-card rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        {/* Subtle Decorative Background Seal */}
        <div className="absolute right-4 -bottom-10 opacity-5 pointer-events-none">
          <svg width="220" height="220" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="#173B2D" strokeWidth="2" fill="none" />
            <polygon points="50,10 60,40 90,50 60,60 50,90 40,60 10,50 40,40" fill="#B59A62" />
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif-scholarly uppercase tracking-wider text-[#8E7541]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <h2 className="font-serif-scholarly text-2xl sm:text-3xl font-bold text-[#173B2D] mt-1 tracking-tight">
              {timeGreeting}, {profile.fullName.split(' ')[0]}
            </h2>
            <p className="text-xs sm:text-sm text-[#202820]/75 font-sans mt-1 max-w-xl">
              Your study desk is prepared. {courses.length} courses active across {profile.institution}.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#EAE2C8]/70 p-3 rounded-2xl border border-[#E3DAC1] shrink-0">
            <MentisGuide
              size={52}
              emotion={guideEmotion}
              interactive={true}
              message={{
                text: 'Welcome to your sanctuary! Gauss’s Law lecture is upcoming.',
              }}
            />
            <div className="text-right">
              <span className="text-[11px] text-[#202820]/60 uppercase tracking-wider block font-serif-scholarly">
                Academic Streak
              </span>
              <div className="flex items-center gap-1 text-[#173B2D] font-serif-scholarly font-bold text-base">
                <Flame className="w-4 h-4 text-[#B59A62] fill-[#B59A62]" />
                <span>14 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave-By Commute Alert & Next Academic Commitment */}
      {leaveBy && (
        <motion.div
          whileHover={{ y: -2 }}
          className="parchment-card rounded-2xl p-5 border-l-4 border-l-[#B59A62] shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#173B2D] text-[#F3EEDB] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Clock className="w-5 h-5 text-[#B59A62]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-serif-scholarly font-bold uppercase tracking-wider bg-[#173B2D] text-[#F3EEDB]">
                    Next Commitment
                  </span>
                  <span className="text-xs text-[#202820]/60 font-medium">
                    Starts at {leaveBy.eventStartFormatted}
                  </span>
                </div>
                <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D] mt-1">
                  {leaveBy.eventTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#202820]/75">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B59A62]" />
                    {leaveBy.roomOrLocation || 'Main Academic Hall'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-[#B59A62]" />
                    {commute.institution} ({commute.distanceKm} km away)
                  </span>
                </div>
              </div>
            </div>

            {/* Calculated Leave-By Box */}
            <div className="flex items-center gap-3 bg-[#FAF7EE] p-3 rounded-xl border border-[#E3DAC1] self-stretch lg:self-auto justify-between lg:justify-end">
              <div className="text-left lg:text-right">
                <span className="text-[10px] font-serif-scholarly uppercase tracking-wider text-[#8E7541] block font-semibold">
                  Intelligent Leave-By
                </span>
                <span className="font-serif-scholarly text-xl font-bold text-[#173B2D]">
                  {leaveBy.leaveByFormatted}
                </span>
                <span className="text-[10px] text-[#202820]/60 block">
                  {commute.travelMinutes}m transit + {commute.prepBufferMinutes}m prep buffer
                </span>
              </div>
              <button
                onClick={() => onNavigate('schedule')}
                className="p-2 rounded-lg bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] transition-colors"
                title="View Full Timetable"
              >
                <ArrowRight className="w-4 h-4 text-[#B59A62]" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Two-Column Grid: Currently Reading & Recent Manuscripts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Library Reading Card */}
        <div className="parchment-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1]">
              <div className="flex items-center gap-2">
                <ScholarlyLibraryIcon size={18} active />
                <h3 className="font-serif-scholarly text-sm font-bold text-[#173B2D]">
                  Current Reading
                </h3>
              </div>
              <button
                onClick={() => onNavigate('library')}
                className="text-xs font-serif-scholarly text-[#8E7541] hover:text-[#173B2D] transition-colors"
              >
                Browse Bookshelf →
              </button>
            </div>

            {currentBook ? (
              <div className="mt-4 flex items-start gap-4">
                {/* Book Spine Graphic */}
                <div className="w-16 h-22 rounded-md bg-[#173B2D] border-l-4 border-[#B59A62] shadow-sm flex flex-col justify-between p-2 shrink-0">
                  <div className="w-full h-1 bg-[#B59A62]/40 rounded-full" />
                  <BookOpen className="w-5 h-5 text-[#F3EEDB]/60 mx-auto" />
                  <span className="text-[7px] text-[#F3EEDB]/80 font-serif-scholarly tracking-tighter truncate text-center">
                    {currentBook.category}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-serif-scholarly text-[#B59A62] uppercase tracking-wider font-semibold">
                    {currentBook.category}
                  </span>
                  <h4 className="font-serif-scholarly text-base font-bold text-[#173B2D] leading-snug truncate">
                    {currentBook.title}
                  </h4>
                  <p className="text-xs text-[#202820]/70 italic mt-0.5 truncate">
                    by {currentBook.author}
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-serif-scholarly text-[#202820]/70 mb-1">
                      <span>Progress: Page {currentBook.currentPage} of {currentBook.totalPages}</span>
                      <span className="font-semibold text-[#173B2D]">{currentBook.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#EAE2C8] overflow-hidden">
                      <div
                        className="h-full bg-[#173B2D] rounded-full transition-all duration-500"
                        style={{ width: `${currentBook.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#202820]/60 mt-4">No active books in reading list.</p>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-[#E3DAC1] flex justify-end">
            {currentBook && (
              <button
                onClick={() => onOpenBook(currentBook)}
                className="px-3.5 py-1.5 rounded-lg bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] text-xs font-serif-scholarly font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Continue Reading</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B59A62]" />
              </button>
            )}
          </div>
        </div>

        {/* Recent Manuscripts (Notes) */}
        <div className="parchment-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DAC1]">
              <div className="flex items-center gap-2">
                <ScholarlyNotesIcon size={18} active />
                <h3 className="font-serif-scholarly text-sm font-bold text-[#173B2D]">
                  Recent Manuscripts
                </h3>
              </div>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs font-serif-scholarly text-[#8E7541] hover:text-[#173B2D] transition-colors"
              >
                All Notes →
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onOpenNote(note)}
                  className="p-2.5 rounded-xl bg-[#F3EEDB]/60 border border-[#E3DAC1] hover:border-[#B59A62]/60 hover:bg-[#FAF7EE] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="overflow-hidden">
                    <h5 className="font-serif-scholarly text-xs font-bold text-[#173B2D] group-hover:text-[#8E7541] transition-colors truncate">
                      {note.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#202820]/60">
                        {note.blocks.length} sections
                      </span>
                      {note.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 rounded text-[9px] bg-[#A9C9A9]/30 text-[#173B2D]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#202820]/40 group-hover:text-[#173B2D] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E3DAC1] flex justify-end">
            <button
              onClick={() => onNavigate('notes')}
              className="px-3.5 py-1.5 rounded-lg bg-[#EAE2C8] text-[#173B2D] hover:bg-[#E2D6B5] border border-[#B59A62]/40 text-xs font-serif-scholarly font-medium transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#B59A62]" />
              <span>Compose New Manuscript</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Learning Sanctuary Fast-Launcher */}
      <div className="parchment-card rounded-2xl p-5 bg-linear-to-r from-[#FAF7EE] to-[#EAF2EA] border border-[#A9C9A9]/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173B2D] text-[#B59A62] flex items-center justify-center shadow-xs shrink-0">
              <ScholarlyLearningIcon size={22} active />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-scholarly text-sm sm:text-base font-bold text-[#173B2D]">
                  The Scholarly AI Sanctuary
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#B59A62]/20 text-[#8E7541] font-semibold">
                  5 Personas · 7 Learning Modes
                </span>
              </div>
              <p className="text-xs text-[#202820]/75 mt-0.5 font-sans">
                Engage Raziel, Azazel, Raphael, Astaroth, or Jophiel for Socratic dialogue, revision, or exam drills.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('learning')}
            className="px-4 py-2 rounded-xl bg-[#173B2D] text-[#F3EEDB] hover:bg-[#122E23] text-xs font-serif-scholarly font-medium transition-all flex items-center gap-2 shadow-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B59A62]" />
            <span>Enter Sanctuary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
