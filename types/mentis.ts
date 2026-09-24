export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'active';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarId: string;
  institution: string;
  educationType: 'school' | 'college' | 'university' | 'graduate' | 'custom';
  program: string;
  currentPeriod: string; // e.g. "Semester 4" or "Class 10" or "Year 2"
  targetGrade: string; // e.g. "3.85 GPA" or "A+"
  approvalStatus: ApprovalStatus;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  currentGrade?: string;
  targetGrade?: string;
  color: string;
  notesCount?: number;
}

export type ScheduleBlockType = 'class' | 'study' | 'assignment' | 'commute' | 'break' | 'exam' | 'personal';

export interface ScheduleBlock {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  dayOfWeek: number; // 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun
  startMinutes: number; // 0 to 1440 (e.g. 510 = 08:30 AM)
  durationMinutes: number; // in increments of 30, e.g. 60, 90, 120
  color: string;
  type: ScheduleBlockType;
  roomOrLocation?: string;
  reminderMinutesBefore?: number;
}

export interface CommuteProfile {
  userId: string;
  institution: string;
  distanceKm: number;
  travelMinutes: number;
  prepBufferMinutes: number;
}

export interface Book {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  author: string;
  category: string;
  coverUrl?: string;
  fileUrl?: string;
  fileData?: string;
  fileType?: 'pdf' | 'docx' | 'text';
  fileName?: string;
  manuscriptHtml?: string;
  totalPages: number;
  currentPage: number;
  progress: number; // 0 to 100
  lastReadAt?: string;
  notes?: string;
}

export type PomodoroVigilMode = 'classic' | 'extended' | 'custom' | 'repose';

export interface ReadingFocusSession {
  id: string;
  userId: string;
  bookId?: string;
  bookTitle?: string;
  mode: PomodoroVigilMode;
  targetDurationMinutes: number;
  completedDurationSeconds: number;
  startPage?: number;
  endPage?: number;
  pagesReadDelta: number;
  reflectionNotes?: string;
  completedAt: string;
}

export interface LibraryExportConfig {
  format: 'pdf' | 'docx';
  scope: 'all' | 'in_progress' | 'completed' | 'by_category';
  selectedCategory?: string;
  includeNotes: boolean;
  includeStats: boolean;
}

export type NoteBlockType = 'paragraph' | 'heading' | 'bullet' | 'quote' | 'code' | 'ocr';

export interface NoteBlock {
  id: string;
  type: NoteBlockType;
  content: string;
}

export interface Note {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  blocks: NoteBlock[];
  tags: string[];
  ocrExtractedText?: string;
  createdAt: string;
  updatedAt: string;
}

export type AIPersonaId = 'raziel' | 'azazel' | 'raphael' | 'astaroth' | 'jophiel';

export type AILearningMode =
  | 'teacher'
  | 'socratic'
  | 'practice'
  | 'revision'
  | 'exam'
  | 'explain'
  | 'summary';

export interface SearchGroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  structuredAction?: {
    action: string;
    title: string;
    payload: Record<string, unknown>;
  };
  searchSources?: SearchGroundingSource[];
  searchQueries?: string[];
}

export interface LearningSession {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  persona: AIPersonaId;
  mode: AILearningMode;
  topic: string;
  messages: ChatMessage[];
  summary?: string;
  contextSources?: string[];
  savedAt: string;
}

export interface TransientTask {
  id: string;
  userId: string;
  title: string;
  courseId?: string;
  completed: boolean;
  priority: 'vigilant' | 'standard' | 'minor';
  dueTime?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StudySessionLog {
  id: string;
  userId: string;
  title: string;
  courseId?: string;
  durationMinutes: number;
  vigilType: 'deep_study' | 'problem_drill' | 'revision' | 'inquiry' | 'reading';
  notes?: string;
  timestamp: string; // ISO date
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface UserAiCredential {
  userId: string;
  provider: AIProvider;
  apiKey?: string; // Deprecated: raw key, replaced by encryptedKey and maskedKey in Step 5
  encryptedKey?: string; // AES-256-GCM ciphertext from server vault
  maskedKey?: string; // Formatted mask e.g. ••••••••••••4F92
  magicSpell?: string;
  isAwakened: boolean;
  modelPreference?: string;
  lastVerifiedAt?: string;
  unlockMode: 'api_key' | 'magic_spell' | 'none';
}

export interface ManagedScholar {
  id: string;
  fullName: string;
  email: string;
  avatarId: string;
  institution: string;
  program: string;
  educationType?: 'school' | 'college' | 'university' | 'graduate' | 'custom';
  currentPeriod?: string;
  status: ApprovalStatus;
  role: 'user' | 'admin';
  appliedAt: string;
  reviewedAt?: string;
  password?: string;
}

export interface AuthSession {
  user: UserProfile;
  token?: string;
  expiresAt?: string;
}

