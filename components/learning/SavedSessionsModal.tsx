'use client';

import React from 'react';
import { LearningSession, Course } from '@/types/mentis';
import { MentisRepository } from '@/lib/storage/repository';
import { playParchmentRustle, playQuillScratch, playClickTactile } from '@/lib/audio/soundEffects';
import {
  X,
  History,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Trash2,
  FileText,
  Calendar,
} from 'lucide-react';

interface SavedSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: LearningSession[];
  courses: Course[];
  onResumeSession: (session: LearningSession) => void;
  onInscribeSessionToNote: (session: LearningSession) => void;
}

export const SavedSessionsModal: React.FC<SavedSessionsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  courses,
  onResumeSession,
  onInscribeSessionToNote,
}) => {
  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickTactile();
    MentisRepository.deleteSession(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1710]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#FAF7EE] border border-[#B59A62]/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3DAC1] bg-[#F3EEDB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#173B2D] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-scholarly text-lg font-bold text-[#173B2D]">
                Archived Socratic Sessions
              </h3>
              <p className="text-xs text-[#8E7541] font-serif-scholarly">
                Resume past dialectics or inscribe dialogue threads into your manuscripts
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

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EAE2C8] text-[#8E7541] flex items-center justify-center mx-auto shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="font-serif-scholarly text-base font-bold text-[#173B2D]">
                No Archived Inquiries Yet
              </h4>
              <p className="text-xs text-[#202820]/70 max-w-md mx-auto font-sans leading-relaxed">
                When contemplating theorems with Raziel, Raphael, or the tutors, click &ldquo;Save Session&rdquo; to preserve the dialectical thread in this archive.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const course = courses.find((c) => c.id === session.courseId);
              const formattedDate = new Date(session.savedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    playParchmentRustle();
                    onResumeSession(session);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-[#E3DAC1] hover:border-[#B59A62] bg-[#FAF7EE] hover:bg-[#F3EEDB]/50 transition-all cursor-pointer group shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-serif-scholarly text-sm font-bold text-[#173B2D] group-hover:text-[#8E7541] transition-colors">
                        {session.title || 'Untitled Dialogue'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-serif-scholarly text-[#8E7541]">
                        <span className="capitalize font-semibold text-[#173B2D]">
                          Tutor: {session.persona}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{session.mode} Mode</span>
                        {course && (
                          <>
                            <span>•</span>
                            <span className="text-[#8E7541]">{course.code}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInscribeSessionToNote(session);
                        }}
                        title="Inscribe into Manuscript Note"
                        className="p-1.5 rounded-lg text-[#8E7541] hover:text-[#173B2D] hover:bg-[#EAE2C8] transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        title="Purge session from archive"
                        className="p-1.5 rounded-lg text-rose-700 hover:text-rose-900 hover:bg-rose-100/60 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#202820]/60 border-t border-[#E3DAC1]/60 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8E7541]" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1 text-[#173B2D] font-serif-scholarly font-medium group-hover:translate-x-0.5 transition-transform">
                      {session.messages.length} exchanges
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E3DAC1] bg-[#F3EEDB] text-xs font-serif-scholarly text-[#8E7541]">
          <span>{sessions.length} total preserved inquiry sessions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#E3DAC1] hover:bg-[#EAE2C8] text-[#173B2D] transition-colors cursor-pointer"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
};
