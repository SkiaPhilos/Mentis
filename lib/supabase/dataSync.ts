import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { MentisRepository } from '@/lib/storage/repository';
import {
  Course,
  ScheduleBlock,
  CommuteProfile,
  Book,
  Note,
  LearningSession,
  UserProfile,
} from '@/types/mentis';

export interface SupabaseSyncStatus {
  synced: boolean;
  coursesCount: number;
  scheduleCount: number;
  booksCount: number;
  notesCount: number;
  sessionsCount: number;
  lastSyncedAt?: string;
  error?: string;
}

/**
 * Loads all scholarly data for the authenticated user from Supabase.
 * If data exists, hydrates the MentisRepository so the UI displays live database records.
 */
export async function loadUserSupabaseData(userId: string): Promise<SupabaseSyncStatus> {
  if (!isSupabaseConfigured() || !userId) {
    return {
      synced: false,
      coursesCount: 0,
      scheduleCount: 0,
      booksCount: 0,
      notesCount: 0,
      sessionsCount: 0,
      error: 'Supabase is not configured or user is unauthenticated.',
    };
  }

  const supabase = createClient();
  if (!supabase) {
    return {
      synced: false,
      coursesCount: 0,
      scheduleCount: 0,
      booksCount: 0,
      notesCount: 0,
      sessionsCount: 0,
      error: 'Supabase client could not be initialized.',
    };
  }

  try {
    const [
      coursesRes,
      scheduleRes,
      commuteRes,
      booksRes,
      notesRes,
      sessionsRes,
    ] = await Promise.all([
      supabase.from('courses').select('*').eq('user_id', userId),
      supabase.from('schedule_blocks').select('*').eq('user_id', userId).order('day_of_week').order('start_minutes'),
      supabase.from('commute_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('books').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      supabase.from('learning_sessions').select('*').eq('user_id', userId).order('saved_at', { ascending: false }),
    ]);

    // 1. Sync Courses
    let coursesCount = 0;
    if (coursesRes.data && coursesRes.data.length > 0) {
      const parsedCourses: Course[] = coursesRes.data.map((c) => ({
        id: c.id,
        userId: c.user_id,
        name: c.name,
        code: c.code,
        instructor: c.instructor || '',
        credits: c.credits || 3,
        currentGrade: c.current_grade,
        targetGrade: c.target_grade,
        color: c.color || '#173B2D',
      }));
      MentisRepository.saveCourses(parsedCourses);
      coursesCount = parsedCourses.length;
    }

    // 2. Sync Schedule Blocks
    let scheduleCount = 0;
    if (scheduleRes.data && scheduleRes.data.length > 0) {
      const parsedSchedule: ScheduleBlock[] = scheduleRes.data.map((b) => ({
        id: b.id,
        userId: b.user_id,
        courseId: b.course_id || undefined,
        title: b.title,
        dayOfWeek: b.day_of_week,
        startMinutes: b.start_minutes,
        durationMinutes: b.duration_minutes,
        color: b.color || '#173B2D',
        type: b.type || 'class',
        roomOrLocation: b.room_or_location || undefined,
        reminderMinutesBefore: b.reminder_minutes_before || undefined,
      }));
      MentisRepository.saveSchedule(parsedSchedule);
      scheduleCount = parsedSchedule.length;
    }

    // 3. Sync Commute Profile
    if (commuteRes.data) {
      const parsedCommute: CommuteProfile = {
        userId: commuteRes.data.user_id,
        institution: commuteRes.data.institution || '',
        distanceKm: Number(commuteRes.data.distance_km || 0),
        travelMinutes: commuteRes.data.travel_minutes || 30,
        prepBufferMinutes: commuteRes.data.prep_buffer_minutes || 15,
      };
      MentisRepository.saveCommute(parsedCommute);
    }

    // 4. Sync Books
    let booksCount = 0;
    if (booksRes.data && booksRes.data.length > 0) {
      const parsedBooks: Book[] = booksRes.data.map((bk) => ({
        id: bk.id,
        userId: bk.user_id,
        courseId: bk.course_id || undefined,
        title: bk.title,
        author: bk.author,
        category: bk.category || 'General',
        coverUrl: bk.cover_url || undefined,
        fileUrl: bk.file_url || undefined,
        totalPages: bk.total_pages || 100,
        currentPage: bk.current_page || 0,
        progress: bk.progress || 0,
        lastReadAt: bk.last_read_at || undefined,
      }));
      MentisRepository.saveBooks(parsedBooks);
      booksCount = parsedBooks.length;
    }

    // 5. Sync Notes
    let notesCount = 0;
    if (notesRes.data && notesRes.data.length > 0) {
      const parsedNotes: Note[] = notesRes.data.map((n) => ({
        id: n.id,
        userId: n.user_id,
        courseId: n.course_id || undefined,
        title: n.title,
        blocks: Array.isArray(n.blocks) ? n.blocks : [],
        tags: Array.isArray(n.tags) ? n.tags : [],
        ocrExtractedText: n.ocr_extracted_text || undefined,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      }));
      MentisRepository.saveNotes(parsedNotes);
      notesCount = parsedNotes.length;
    }

    // 6. Sync Learning Sessions
    let sessionsCount = 0;
    if (sessionsRes.data && sessionsRes.data.length > 0) {
      const parsedSessions: LearningSession[] = sessionsRes.data.map((s) => ({
        id: s.id,
        userId: s.user_id,
        courseId: s.course_id || undefined,
        title: s.title,
        persona: s.persona || 'raziel',
        mode: s.mode || 'socratic',
        topic: s.topic || '',
        messages: Array.isArray(s.messages) ? s.messages : [],
        summary: s.summary || undefined,
        savedAt: s.saved_at,
      }));
      MentisRepository.saveSessions(parsedSessions);
      sessionsCount = parsedSessions.length;
    }

    return {
      synced: true,
      coursesCount,
      scheduleCount,
      booksCount,
      notesCount,
      sessionsCount,
      lastSyncedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to query Supabase tables.';
    return {
      synced: false,
      coursesCount: 0,
      scheduleCount: 0,
      booksCount: 0,
      notesCount: 0,
      sessionsCount: 0,
      error: errorMsg,
    };
  }
}

/**
 * Persists a new or updated course to Supabase.
 */
export async function syncCourseToSupabase(course: Course): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('courses').upsert({
      id: course.id,
      user_id: course.userId,
      name: course.name,
      code: course.code,
      instructor: course.instructor || '',
      credits: course.credits || 3,
      current_grade: course.currentGrade || null,
      target_grade: course.targetGrade || null,
      color: course.color || '#173B2D',
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Deletes a course from Supabase.
 */
export async function syncDeleteCourseFromSupabase(courseId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Persists a schedule block to Supabase.
 */
export async function syncScheduleBlockToSupabase(block: ScheduleBlock): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('schedule_blocks').upsert({
      id: block.id,
      user_id: block.userId,
      course_id: block.courseId || null,
      title: block.title,
      day_of_week: block.dayOfWeek,
      start_minutes: block.startMinutes,
      duration_minutes: block.durationMinutes,
      color: block.color || '#173B2D',
      type: block.type || 'class',
      room_or_location: block.roomOrLocation || null,
      reminder_minutes_before: block.reminderMinutesBefore || null,
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Deletes a schedule block from Supabase.
 */
export async function syncDeleteScheduleBlockFromSupabase(blockId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('schedule_blocks').delete().eq('id', blockId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Persists commute profile to Supabase.
 */
export async function syncCommuteToSupabase(commute: CommuteProfile): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('commute_profiles').upsert({
      user_id: commute.userId,
      institution: commute.institution || '',
      distance_km: commute.distanceKm || 0,
      travel_minutes: commute.travelMinutes || 30,
      prep_buffer_minutes: commute.prepBufferMinutes || 15,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Persists a book to Supabase.
 */
export async function syncBookToSupabase(book: Book): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('books').upsert({
      id: book.id,
      user_id: book.userId,
      course_id: book.courseId || null,
      title: book.title,
      author: book.author,
      category: book.category || 'General',
      cover_url: book.coverUrl || null,
      file_url: book.fileUrl || null,
      total_pages: book.totalPages || 100,
      current_page: book.currentPage || 0,
      progress: book.progress || 0,
      last_read_at: book.lastReadAt || null,
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Deletes a book from Supabase.
 */
export async function syncDeleteBookFromSupabase(bookId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('books').delete().eq('id', bookId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Persists a manuscript note to Supabase.
 */
export async function syncNoteToSupabase(note: Note): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('notes').upsert({
      id: note.id,
      user_id: note.userId,
      course_id: note.courseId || null,
      title: note.title,
      blocks: note.blocks || [],
      tags: note.tags || [],
      ocr_extracted_text: note.ocrExtractedText || null,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Deletes a note from Supabase.
 */
export async function syncDeleteNoteFromSupabase(noteId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Persists a learning session to Supabase.
 */
export async function syncSessionToSupabase(session: LearningSession): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('learning_sessions').upsert({
      id: session.id,
      user_id: session.userId,
      course_id: session.courseId || null,
      title: session.title,
      persona: session.persona,
      mode: session.mode,
      topic: session.topic || '',
      messages: session.messages || [],
      summary: session.summary || null,
      saved_at: session.savedAt || new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}
