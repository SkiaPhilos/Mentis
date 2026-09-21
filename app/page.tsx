'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScholarlyShell, ActiveTab } from '@/components/layout/ScholarlyShell';
import { DailyDeskView } from '@/components/desk/DailyDeskView';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { NotesView } from '@/components/notes/NotesView';
import { LibraryView } from '@/components/library/LibraryView';
import { LearningSanctuaryView } from '@/components/learning/LearningSanctuaryView';
import { ProfileView } from '@/components/profile/ProfileView';
import { AdminView } from '@/components/admin/AdminView';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { PendingApprovalView } from '@/components/auth/PendingApprovalView';
import { MentisRepository } from '@/lib/storage/repository';
import {
  UserProfile,
  Course,
  ScheduleBlock,
  CommuteProfile,
  Book,
  Note,
  UserAiCredential,
} from '@/types/mentis';

function MentisSanctuary() {
  const { logout, updateApprovalStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('desk');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Relational Entities synchronized deterministically via useSyncExternalStore
  // SSR snapshot matches 100% with initial client hydration to prevent hydration mismatches
  const profile = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getActiveAuthUserSnapshot,
    MentisRepository.getDefaultProfile
  );
  const courses = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getCoursesSnapshot,
    MentisRepository.getDefaultCourses
  );
  const schedule = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getScheduleSnapshot,
    MentisRepository.getDefaultSchedule
  );
  const commute = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getCommuteSnapshot,
    MentisRepository.getDefaultCommute
  );
  const books = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getBooksSnapshot,
    MentisRepository.getDefaultBooks
  );
  const notes = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getNotesSnapshot,
    MentisRepository.getDefaultNotes
  );
  const aiCredentials = useSyncExternalStore(
    MentisRepository.subscribe,
    MentisRepository.getAiCredentialsSnapshot,
    MentisRepository.getDefaultAiCredentials
  );

  // Deep-link / cross-navigation state
  const [activeBookToRead, setActiveBookToRead] = useState<Book | null>(null);
  const [activeNoteToEdit, setActiveNoteToEdit] = useState<string | null>(null);

  // Mutation handlers with reactive repository synchronization
  const handleUpdateProfile = (updated: UserProfile) => {
    MentisRepository.saveProfile(updated);
  };

  const handleAddCourse = (course: Course) => {
    MentisRepository.addCourse(course);
  };

  const handleDeleteCourse = (id: string) => {
    const next = courses.filter((c) => c.id !== id);
    MentisRepository.saveCourses(next);
  };

  const handleAddScheduleBlock = (block: ScheduleBlock) => {
    MentisRepository.addScheduleBlock(block);
  };

  const handleUpdateScheduleBlock = (block: ScheduleBlock) => {
    MentisRepository.updateScheduleBlock(block);
  };

  const handleDeleteScheduleBlock = (id: string) => {
    MentisRepository.deleteScheduleBlock(id);
  };

  const handleUpdateCommute = (updated: CommuteProfile) => {
    MentisRepository.saveCommute(updated);
  };

  const handleAddBook = (book: Book) => {
    MentisRepository.addBook(book);
  };

  const handleUpdateBook = (book: Book) => {
    MentisRepository.updateBook(book);
  };

  const handleAddNote = (note: Note) => {
    MentisRepository.addNote(note);
  };

  const handleUpdateNote = (note: Note) => {
    MentisRepository.updateNote(note);
  };

  const handleDeleteNote = (id: string) => {
    MentisRepository.deleteNote(id);
  };

  const handleUpdateAiCredentials = (updated: UserAiCredential) => {
    MentisRepository.saveAiCredentials(updated);
  };

  // Cross-view actions
  const handleOpenBook = (book: Book) => {
    setActiveBookToRead(book);
    setActiveTab('library');
  };

  const handleOpenNote = (note: Note) => {
    setActiveNoteToEdit(note.id);
    setActiveTab('notes');
  };

  // Approval Gate Routing: If candidate status is pending or rejected, present the review sanctum
  const isApproved = profile.approvalStatus === 'approved';

  if (!isApproved) {
    return (
      <>
        <PendingApprovalView
          user={profile}
          onRefreshStatus={() => {}}
          onUpdateApprovalStatus={updateApprovalStatus}
          onLogout={async () => {
            await logout();
            setAuthModalOpen(true);
          }}
          onEnterSanctuary={() => updateApprovalStatus('approved')}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <ScholarlyShell
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'library') setActiveBookToRead(null);
          if (tab !== 'notes') setActiveNoteToEdit(null);
        }}
        profile={profile}
        onOpenAuth={() => setAuthModalOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'desk' && (
              <DailyDeskView
                profile={profile}
                courses={courses}
                schedule={schedule}
                commute={commute}
                books={books}
                notes={notes}
                onNavigate={setActiveTab}
                onOpenBook={handleOpenBook}
                onOpenNote={handleOpenNote}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleView
                schedule={schedule}
                courses={courses}
                commute={commute}
                onAddBlock={handleAddScheduleBlock}
                onUpdateBlock={handleUpdateScheduleBlock}
                onDeleteBlock={handleDeleteScheduleBlock}
                onUpdateCommute={handleUpdateCommute}
              />
            )}

            {activeTab === 'notes' && (
              <NotesView
                notes={notes}
                courses={courses}
                initialNoteId={activeNoteToEdit}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
              />
            )}

            {activeTab === 'library' && (
              <LibraryView
                books={books}
                courses={courses}
                initialActiveBook={activeBookToRead}
                onAddBook={handleAddBook}
                onUpdateBook={handleUpdateBook}
              />
            )}

            {activeTab === 'learning' && (
              <LearningSanctuaryView courses={courses} />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                courses={courses}
                aiCredentials={aiCredentials}
                onUpdateProfile={handleUpdateProfile}
                onAddCourse={handleAddCourse}
                onDeleteCourse={handleDeleteCourse}
                onUpdateAiCredentials={handleUpdateAiCredentials}
              />
            )}

            {activeTab === 'admin' && (
              <AdminView currentUser={profile} />
            )}
          </motion.div>
        </AnimatePresence>
      </ScholarlyShell>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}

export default function MentisApp() {
  return (
    <AuthProvider>
      <MentisSanctuary />
    </AuthProvider>
  );
}
