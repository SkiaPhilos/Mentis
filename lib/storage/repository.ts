import {
  UserProfile,
  Course,
  ScheduleBlock,
  CommuteProfile,
  Book,
  ReadingFocusSession,
  Note,
  LearningSession,
  UserAiCredential,
  ManagedScholar,
  ApprovalStatus,
  TransientTask,
  StudySessionLog,
} from '@/types/mentis';

const STORAGE_KEYS = {
  PROFILE: 'mentis_scholar_profile',
  COURSES: 'mentis_courses',
  SCHEDULE: 'mentis_schedule_blocks',
  COMMUTE: 'mentis_commute_profile',
  BOOKS: 'mentis_books',
  READING_VIGILS: 'mentis_reading_vigil_sessions',
  NOTES: 'mentis_notes',
  SESSIONS: 'mentis_learning_sessions',
  AI_CREDENTIALS: 'mentis_user_ai_credentials',
  SCHOLARS: 'mentis_managed_scholars',
  ACTIVE_AUTH: 'mentis_active_auth_user',
  MATRICULATION_COMPLETED: 'mentis_matriculation_completed',
  TASKS: 'mentis_transient_tasks',
  STUDY_LOGS: 'mentis_study_session_logs',
};

export const ACADEMIC_MAGIC_SPELLS: Record<string, string> = {
  NOCTIS_LUCIS_SOCRATIS: 'The Lantern of Socrates (Socratic Wisdom)',
  SEEK_TRUTH_ETERNAL: 'Axiom of Alexandria (Truth Seeker)',
  MENTIS_ACADEMIA_2026: 'Imperial Academy Seal (Universal Scholar)',
  ALBUS_SCHOLAR: 'The Great Library Codex (Archival Mastery)',
  LUMEN_SCIENTIAE: 'The Torch of Natural Philosophy (Empirical Rigor)',
};

export const DEFAULT_AI_CREDENTIALS: UserAiCredential = {
  userId: 'scholar_usr_01',
  provider: 'gemini',
  apiKey: '',
  encryptedKey: '',
  maskedKey: '',
  magicSpell: '',
  isAwakened: false,
  modelPreference: 'gemini-3.8-flash',
  unlockMode: 'none',
};

// Default initial scholar profile (deterministic timestamp for SSR consistency)
export const DEFAULT_PROFILE: UserProfile = {
  id: 'scholar_usr_01',
  email: 'scholar@mentis.academic',
  fullName: 'Abdullah Saeed',
  avatarId: 'scholar_m1',
  institution: 'COMSATS University',
  educationType: 'university',
  program: 'Computer Science & Mathematics',
  currentPeriod: 'Semester 4',
  targetGrade: '3.90 GPA',
  approvalStatus: 'approved',
  role: 'user', // Default role is standard scholar; admin privileges are strictly authenticated
  createdAt: '2026-09-01T00:00:00.000Z',
};

// Default managed scholars registry
export const DEFAULT_SCHOLARS: ManagedScholar[] = [
  {
    id: 'scholar_usr_01',
    fullName: 'Abdullah Saeed',
    email: 'scholar@mentis.academic',
    avatarId: 'scholar_m1',
    institution: 'COMSATS University',
    program: 'Computer Science & Mathematics',
    educationType: 'university',
    currentPeriod: 'Semester 4',
    status: 'approved',
    role: 'admin',
    appliedAt: '2 weeks ago',
  },
  {
    id: 'sch_p1',
    fullName: 'Hamza Farooq',
    email: 'h.farooq@comsats.edu.pk',
    avatarId: 'scholar_m2',
    institution: 'COMSATS Islamabad',
    program: 'Electrical Engineering',
    educationType: 'university',
    currentPeriod: 'Semester 2',
    status: 'pending',
    role: 'user',
    appliedAt: '2 hours ago',
  },
  {
    id: 'sch_p2',
    fullName: 'Ayesha Siddiqui',
    email: 'a.siddiqui@alumni.ox.ac.uk',
    avatarId: 'scholar_f1',
    institution: 'Oxford University',
    program: 'Classical Philology',
    educationType: 'graduate',
    currentPeriod: 'Year 1',
    status: 'rejected',
    role: 'user',
    appliedAt: '5 hours ago',
  },
  {
    id: 'sch_a2',
    fullName: 'Zainab Qazi',
    email: 'z.qazi@lums.edu.pk',
    avatarId: 'scholar_f2',
    institution: 'LUMS',
    program: 'Economics & Mathematics',
    educationType: 'university',
    currentPeriod: 'Semester 6',
    status: 'approved',
    role: 'user',
    appliedAt: '3 days ago',
  },
];

// Initial default courses
export const DEFAULT_COURSES: Course[] = [
  {
    id: 'course_phy2',
    userId: 'scholar_usr_01',
    name: 'Electromagnetism & Optics',
    code: 'PHY-201',
    instructor: 'Dr. Alistair Vance',
    credits: 4,
    currentGrade: 'A-',
    targetGrade: 'A',
    color: '#173B2D',
    notesCount: 4,
  },
  {
    id: 'course_math',
    userId: 'scholar_usr_01',
    name: 'Multivariable Calculus',
    code: 'MTH-204',
    instructor: 'Prof. Clara Hesse',
    credits: 3,
    currentGrade: 'B+',
    targetGrade: 'A',
    color: '#2C5E4B',
    notesCount: 6,
  },
  {
    id: 'course_cs',
    userId: 'scholar_usr_01',
    name: 'Algorithms & Data Structures',
    code: 'CSC-310',
    instructor: 'Dr. Tariq Rahman',
    credits: 4,
    currentGrade: 'A',
    targetGrade: 'A+',
    color: '#3D362A',
    notesCount: 8,
  },
  {
    id: 'course_phil',
    userId: 'scholar_usr_01',
    name: 'Epistemology & Logic',
    code: 'PHL-102',
    instructor: 'Dean Eleanor Wright',
    credits: 2,
    currentGrade: 'A',
    targetGrade: 'A',
    color: '#8E7541',
    notesCount: 3,
  },
];

// Initial default commute profile (CONCEPT.md Section 41: COMSATS, 12km, 42 min)
export const DEFAULT_COMMUTE: CommuteProfile = {
  userId: 'scholar_usr_01',
  institution: 'COMSATS',
  distanceKm: 12,
  travelMinutes: 42,
  prepBufferMinutes: 15,
};

// Initial schedule blocks across the 7-day timetable
export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  // Monday (day 0)
  {
    id: 'sch_m1',
    userId: 'scholar_usr_01',
    courseId: 'course_phy2',
    title: 'PHY-201 Lecture: Gauss Law',
    dayOfWeek: 0,
    startMinutes: 510, // 08:30 AM
    durationMinutes: 90, // 08:30 - 10:00
    color: '#173B2D',
    type: 'class',
    roomOrLocation: 'Hall C-12',
  },
  {
    id: 'sch_m2',
    userId: 'scholar_usr_01',
    courseId: 'course_math',
    title: 'MTH-204: Vector Fields',
    dayOfWeek: 0,
    startMinutes: 630, // 10:30 AM
    durationMinutes: 60, // 10:30 - 11:30
    color: '#2C5E4B',
    type: 'class',
    roomOrLocation: 'Math Seminar Rm 4',
  },
  {
    id: 'sch_m3',
    userId: 'scholar_usr_01',
    courseId: 'course_cs',
    title: 'Graph Algorithms Lab',
    dayOfWeek: 0,
    startMinutes: 840, // 02:00 PM
    durationMinutes: 120, // 02:00 - 04:00 PM
    color: '#3D362A',
    type: 'study',
    roomOrLocation: 'Turing Lab 2',
  },
  // Tuesday (day 1)
  {
    id: 'sch_t1',
    userId: 'scholar_usr_01',
    courseId: 'course_cs',
    title: 'CSC-310: Dynamic Programming',
    dayOfWeek: 1,
    startMinutes: 540, // 09:00 AM
    durationMinutes: 90, // 09:00 - 10:30
    color: '#3D362A',
    type: 'class',
    roomOrLocation: 'Auditorium A',
  },
  {
    id: 'sch_t2',
    userId: 'scholar_usr_01',
    courseId: 'course_phil',
    title: 'Epistemology Discussion',
    dayOfWeek: 1,
    startMinutes: 690, // 11:30 AM
    durationMinutes: 60, // 11:30 - 12:30
    color: '#8E7541',
    type: 'class',
    roomOrLocation: 'Old Library Annex',
  },
  // Wednesday (day 2)
  {
    id: 'sch_w1',
    userId: 'scholar_usr_01',
    courseId: 'course_phy2',
    title: 'Physics Lab: Faraday Experiment',
    dayOfWeek: 2,
    startMinutes: 510, // 08:30 AM
    durationMinutes: 120, // 08:30 - 10:30
    color: '#173B2D',
    type: 'class',
    roomOrLocation: 'Kelvin Optics Lab',
  },
  {
    id: 'sch_w2',
    userId: 'scholar_usr_01',
    courseId: 'course_math',
    title: 'Calculus Problem Session',
    dayOfWeek: 2,
    startMinutes: 720, // 12:00 PM
    durationMinutes: 90,
    color: '#2C5E4B',
    type: 'study',
    roomOrLocation: 'Study Hall B',
  },
  // Thursday (day 3)
  {
    id: 'sch_th1',
    userId: 'scholar_usr_01',
    courseId: 'course_cs',
    title: 'CSC-310: Computational Complexity',
    dayOfWeek: 3,
    startMinutes: 540, // 09:00 AM
    durationMinutes: 90,
    color: '#3D362A',
    type: 'class',
    roomOrLocation: 'Auditorium A',
  },
  // Friday (day 4)
  {
    id: 'sch_f1',
    userId: 'scholar_usr_01',
    courseId: 'course_phy2',
    title: 'PHY-201: Maxwell Equations',
    dayOfWeek: 4,
    startMinutes: 510, // 08:30 AM
    durationMinutes: 60,
    color: '#173B2D',
    type: 'class',
    roomOrLocation: 'Hall C-12',
  },
];

// Initial books in library
export const DEFAULT_BOOKS: Book[] = [
  {
    id: 'book_em_griffiths',
    userId: 'scholar_usr_01',
    courseId: 'course_phy2',
    title: 'Introduction to Electrodynamics',
    author: 'David J. Griffiths',
    category: 'Physics',
    totalPages: 624,
    currentPage: 248,
    progress: 40,
    lastReadAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'book_clrs',
    userId: 'scholar_usr_01',
    courseId: 'course_cs',
    title: 'Introduction to Algorithms (4th Edition)',
    author: 'Cormen, Leiserson, Rivest, Stein',
    category: 'Computer Science',
    totalPages: 1312,
    currentPage: 412,
    progress: 31,
    lastReadAt: '2026-09-19T14:30:00.000Z',
  },
  {
    id: 'book_spivak',
    userId: 'scholar_usr_01',
    courseId: 'course_math',
    title: 'Calculus on Manifolds',
    author: 'Michael Spivak',
    category: 'Mathematics',
    totalPages: 160,
    currentPage: 88,
    progress: 55,
    lastReadAt: '2026-09-18T09:15:00.000Z',
  },
  {
    id: 'book_aristotle',
    userId: 'scholar_usr_01',
    courseId: 'course_phil',
    title: 'Posterior Analytics & Organon',
    author: 'Aristotle (Oxford Translation)',
    category: 'Philosophy & Logic',
    totalPages: 320,
    currentPage: 142,
    progress: 44,
    lastReadAt: '2026-09-17T16:45:00.000Z',
  },
];

// Initial Notes (deterministic timestamps)
export const DEFAULT_NOTES: Note[] = [
  {
    id: 'note_kcl_practice',
    userId: 'scholar_usr_01',
    courseId: 'course_phy2',
    title: "Kirchhoff's Laws — Circuit Analysis",
    blocks: [
      {
        id: 'b1',
        type: 'heading',
        content: 'Kirchhoff’s Current Law (KCL) & Charge Conservation',
      },
      {
        id: 'b2',
        type: 'paragraph',
        content:
          'The algebraic sum of currents entering any node in an electrical circuit is identically zero. This is a direct consequence of charge conservation in a lumped parameter circuit.',
      },
      {
        id: 'b3',
        type: 'quote',
        content: '∑ I_in = ∑ I_out at every closed junction.',
      },
      {
        id: 'b4',
        type: 'paragraph',
        content:
          'When evaluating multi-loop bridge networks, establish reference nodes carefully and apply nodal voltage analysis to eliminate redundant loops.',
      },
    ],
    tags: ['Circuits', 'Physics', 'KCL', 'ExamPrep'],
    ocrExtractedText:
      'Practice Problem 3: Given loop current I1 = 2.4A, compute node voltage V_b with respect to ground.',
    createdAt: '2026-09-19T08:00:00.000Z',
    updatedAt: '2026-09-20T11:20:00.000Z',
  },
  {
    id: 'note_vector_fields',
    userId: 'scholar_usr_01',
    courseId: 'course_math',
    title: 'Divergence Theorem & Stokes Theorem',
    blocks: [
      {
        id: 'b10',
        type: 'heading',
        content: 'Surface Integrals to Volume Flux',
      },
      {
        id: 'b11',
        type: 'paragraph',
        content:
          'The total outward flux of a vector field F across a closed smooth orientable surface S equals the triple integral of the divergence of F over the enclosed volume V.',
      },
      {
        id: 'b12',
        type: 'code',
        content: '∬_S F · dS = ∭_V (∇ · F) dV',
      },
    ],
    tags: ['Calculus', 'Flux', 'VectorAnalysis'],
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-19T15:40:00.000Z',
  },
];

// Helper to safely access localStorage
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Mentis storage write error:', err);
  }
}

// -----------------------------------------------------------------------------
// Reactive Event Emitter for useSyncExternalStore
// -----------------------------------------------------------------------------
type StoreListener = () => void;
const listeners = new Set<StoreListener>();

function emitChange() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (err) {
      console.error('Mentis store listener error:', err);
    }
  });
}

// Snapshot memoization caches to guarantee referential stability for useSyncExternalStore
let cachedProfileRaw: string | null = null;
let cachedProfileSnapshot: UserProfile = DEFAULT_PROFILE;

let cachedCoursesRaw: string | null = null;
let cachedCoursesSnapshot: Course[] = DEFAULT_COURSES;

let cachedScheduleRaw: string | null = null;
let cachedScheduleSnapshot: ScheduleBlock[] = DEFAULT_SCHEDULE;

let cachedCommuteRaw: string | null = null;
let cachedCommuteSnapshot: CommuteProfile = DEFAULT_COMMUTE;

let cachedBooksRaw: string | null = null;
let cachedBooksSnapshot: Book[] = DEFAULT_BOOKS;

let cachedNotesRaw: string | null = null;
let cachedNotesSnapshot: Note[] = DEFAULT_NOTES;

let cachedSessionsRaw: string | null = null;
let cachedSessionsSnapshot: LearningSession[] = [];

let cachedAiCredentialsRaw: string | null = null;
let cachedAiCredentialsSnapshot: UserAiCredential = DEFAULT_AI_CREDENTIALS;

let cachedScholarsRaw: string | null = null;
let cachedScholarsSnapshot: ManagedScholar[] = DEFAULT_SCHOLARS;

let cachedActiveAuthRaw: string | null = null;
let cachedActiveAuthSnapshot: UserProfile | null = null;

export const DEFAULT_TRANSIENT_TASKS: TransientTask[] = [
  {
    id: 'task_1',
    userId: 'scholar_usr_01',
    title: "Derive Maxwell's 4th Equation from Ampere-Maxwell law",
    courseId: 'course_phy2',
    completed: false,
    priority: 'vigilant',
    dueTime: '15:00',
    createdAt: '2026-09-23T08:00:00.000Z',
  },
  {
    id: 'task_2',
    userId: 'scholar_usr_01',
    title: 'Inscribe marginalia on Chapter 4: Discrete Structures & Graphs',
    courseId: 'course_cs',
    completed: true,
    priority: 'standard',
    createdAt: '2026-09-22T19:30:00.000Z',
    completedAt: '2026-09-23T07:15:00.000Z',
  },
  {
    id: 'task_3',
    userId: 'scholar_usr_01',
    title: 'Engage Raziel in Socratic dialectic on Vector Divergence',
    courseId: 'course_math',
    completed: false,
    priority: 'standard',
    dueTime: '18:30',
    createdAt: '2026-09-23T09:00:00.000Z',
  },
  {
    id: 'task_4',
    userId: 'scholar_usr_01',
    title: 'Formulate preliminary thesis on Humean Epistemology',
    courseId: 'course_phil',
    completed: false,
    priority: 'minor',
    createdAt: '2026-09-23T10:00:00.000Z',
  },
];

export const DEFAULT_STUDY_LOGS: StudySessionLog[] = [
  {
    id: 'slog_1',
    userId: 'scholar_usr_01',
    title: 'Vector Calculus Problem Set',
    courseId: 'course_math',
    durationMinutes: 75,
    vigilType: 'deep_study',
    notes: 'Solved Stokes Theorem exercises 1-8',
    timestamp: '2026-09-17T14:30:00.000Z',
  },
  {
    id: 'slog_2',
    userId: 'scholar_usr_01',
    title: 'Reading Vigil: Greek Epistemology',
    courseId: 'course_phil',
    durationMinutes: 60,
    vigilType: 'reading',
    notes: 'Theaetetus on knowledge as justified true belief',
    timestamp: '2026-09-18T16:00:00.000Z',
  },
  {
    id: 'slog_3',
    userId: 'scholar_usr_01',
    title: 'Dynamic Programming Proofs',
    courseId: 'course_cs',
    durationMinutes: 90,
    vigilType: 'problem_drill',
    notes: 'Optimal substructure & memoization tables',
    timestamp: '2026-09-19T11:00:00.000Z',
  },
  {
    id: 'slog_4',
    userId: 'scholar_usr_01',
    title: 'Electromagnetic Field Theory',
    courseId: 'course_phy2',
    durationMinutes: 110,
    vigilType: 'deep_study',
    notes: 'Faraday Law & displacement current',
    timestamp: '2026-09-20T15:00:00.000Z',
  },
  {
    id: 'slog_5',
    userId: 'scholar_usr_01',
    title: 'Automata Theory & Turing Machines',
    courseId: 'course_cs',
    durationMinutes: 80,
    vigilType: 'revision',
    notes: 'Halting problem diagonalization argument',
    timestamp: '2026-09-21T18:00:00.000Z',
  },
  {
    id: 'slog_6',
    userId: 'scholar_usr_01',
    title: 'Dialectic with Raziel on Ontology',
    courseId: 'course_phil',
    durationMinutes: 45,
    vigilType: 'inquiry',
    notes: 'Aristotelian categories vs. modern predicate logic',
    timestamp: '2026-09-22T17:00:00.000Z',
  },
  {
    id: 'slog_7',
    userId: 'scholar_usr_01',
    title: 'Optics & Wave Equation Lab',
    courseId: 'course_phy2',
    durationMinutes: 65,
    vigilType: 'deep_study',
    notes: 'Interferometer fringe measurements',
    timestamp: '2026-09-23T09:30:00.000Z',
  },
];

let cachedTasksRaw: string | null = null;
let cachedTasksSnapshot: TransientTask[] = DEFAULT_TRANSIENT_TASKS;

let cachedStudyLogsRaw: string | null = null;
let cachedStudyLogsSnapshot: StudySessionLog[] = DEFAULT_STUDY_LOGS;

// Unified Repository API
export const MentisRepository = {
  // Store subscription for useSyncExternalStore
  subscribe: (listener: StoreListener) => {
    listeners.add(listener);
    const handleStorage = (e: StorageEvent) => {
      if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
        emitChange();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }
    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  },

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------
  getDefaultProfile: (): UserProfile => DEFAULT_PROFILE,

  getProfileSnapshot: (): UserProfile => {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!raw) return DEFAULT_PROFILE;
      if (raw === cachedProfileRaw) return cachedProfileSnapshot;
      cachedProfileRaw = raw;
      cachedProfileSnapshot = JSON.parse(raw) as UserProfile;
      return cachedProfileSnapshot;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  getProfile: (): UserProfile => {
    return getLocal<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },

  saveProfile: (profile: UserProfile): void => {
    setLocal(STORAGE_KEYS.PROFILE, profile);
    cachedProfileRaw = JSON.stringify(profile);
    cachedProfileSnapshot = profile;
    emitChange();
  },

  // ---------------------------------------------------------------------------
  // Courses
  // ---------------------------------------------------------------------------
  getDefaultCourses: (): Course[] => DEFAULT_COURSES,

  getCoursesSnapshot: (): Course[] => {
    if (typeof window === 'undefined') return DEFAULT_COURSES;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (!raw) return DEFAULT_COURSES;
      if (raw === cachedCoursesRaw) return cachedCoursesSnapshot;
      cachedCoursesRaw = raw;
      cachedCoursesSnapshot = JSON.parse(raw) as Course[];
      return cachedCoursesSnapshot;
    } catch {
      return DEFAULT_COURSES;
    }
  },

  getCourses: (): Course[] => {
    return getLocal<Course[]>(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
  },

  saveCourses: (courses: Course[]): void => {
    setLocal(STORAGE_KEYS.COURSES, courses);
    cachedCoursesRaw = JSON.stringify(courses);
    cachedCoursesSnapshot = courses;
    emitChange();
  },

  addCourse: (course: Course): void => {
    const list = MentisRepository.getCourses();
    const updated = [course, ...list];
    MentisRepository.saveCourses(updated);
  },

  // ---------------------------------------------------------------------------
  // Schedule
  // ---------------------------------------------------------------------------
  getDefaultSchedule: (): ScheduleBlock[] => DEFAULT_SCHEDULE,

  getScheduleSnapshot: (): ScheduleBlock[] => {
    if (typeof window === 'undefined') return DEFAULT_SCHEDULE;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (!raw) return DEFAULT_SCHEDULE;
      if (raw === cachedScheduleRaw) return cachedScheduleSnapshot;
      cachedScheduleRaw = raw;
      cachedScheduleSnapshot = JSON.parse(raw) as ScheduleBlock[];
      return cachedScheduleSnapshot;
    } catch {
      return DEFAULT_SCHEDULE;
    }
  },

  getSchedule: (): ScheduleBlock[] => {
    return getLocal<ScheduleBlock[]>(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);
  },

  saveSchedule: (blocks: ScheduleBlock[]): void => {
    setLocal(STORAGE_KEYS.SCHEDULE, blocks);
    cachedScheduleRaw = JSON.stringify(blocks);
    cachedScheduleSnapshot = blocks;
    emitChange();
  },

  addScheduleBlock: (block: ScheduleBlock): void => {
    const list = MentisRepository.getSchedule();
    MentisRepository.saveSchedule([...list, block]);
  },

  updateScheduleBlock: (block: ScheduleBlock): void => {
    const list = MentisRepository.getSchedule();
    MentisRepository.saveSchedule(list.map((b) => (b.id === block.id ? block : b)));
  },

  deleteScheduleBlock: (id: string): void => {
    const list = MentisRepository.getSchedule();
    MentisRepository.saveSchedule(list.filter((b) => b.id !== id));
  },

  // ---------------------------------------------------------------------------
  // Commute
  // ---------------------------------------------------------------------------
  getDefaultCommute: (): CommuteProfile => DEFAULT_COMMUTE,

  getCommuteSnapshot: (): CommuteProfile => {
    if (typeof window === 'undefined') return DEFAULT_COMMUTE;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COMMUTE);
      if (!raw) return DEFAULT_COMMUTE;
      if (raw === cachedCommuteRaw) return cachedCommuteSnapshot;
      cachedCommuteRaw = raw;
      cachedCommuteSnapshot = JSON.parse(raw) as CommuteProfile;
      return cachedCommuteSnapshot;
    } catch {
      return DEFAULT_COMMUTE;
    }
  },

  getCommute: (): CommuteProfile => {
    return getLocal<CommuteProfile>(STORAGE_KEYS.COMMUTE, DEFAULT_COMMUTE);
  },

  saveCommute: (commute: CommuteProfile): void => {
    setLocal(STORAGE_KEYS.COMMUTE, commute);
    cachedCommuteRaw = JSON.stringify(commute);
    cachedCommuteSnapshot = commute;
    emitChange();
  },

  // ---------------------------------------------------------------------------
  // Books
  // ---------------------------------------------------------------------------
  getDefaultBooks: (): Book[] => DEFAULT_BOOKS,

  getBooksSnapshot: (): Book[] => {
    if (typeof window === 'undefined') return DEFAULT_BOOKS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
      if (!raw) return DEFAULT_BOOKS;
      if (raw === cachedBooksRaw) return cachedBooksSnapshot;
      cachedBooksRaw = raw;
      cachedBooksSnapshot = JSON.parse(raw) as Book[];
      return cachedBooksSnapshot;
    } catch {
      return DEFAULT_BOOKS;
    }
  },

  getBooks: (): Book[] => {
    return getLocal<Book[]>(STORAGE_KEYS.BOOKS, DEFAULT_BOOKS);
  },

  saveBooks: (books: Book[]): void => {
    setLocal(STORAGE_KEYS.BOOKS, books);
    cachedBooksRaw = JSON.stringify(books);
    cachedBooksSnapshot = books;
    emitChange();
  },

  addBook: (book: Book): void => {
    const list = MentisRepository.getBooks();
    MentisRepository.saveBooks([book, ...list]);
  },

  updateBook: (book: Book): void => {
    const list = MentisRepository.getBooks();
    MentisRepository.saveBooks(list.map((b) => (b.id === book.id ? book : b)));
  },

  deleteBook: (id: string): void => {
    const list = MentisRepository.getBooks();
    MentisRepository.saveBooks(list.filter((b) => b.id !== id));
  },

  // ---------------------------------------------------------------------------
  // Reading Focus Sessions (Pomodoro Vigils)
  // ---------------------------------------------------------------------------
  getReadingSessions: (): ReadingFocusSession[] => {
    return getLocal<ReadingFocusSession[]>(STORAGE_KEYS.READING_VIGILS, []);
  },

  saveReadingSessions: (sessions: ReadingFocusSession[]): void => {
    setLocal(STORAGE_KEYS.READING_VIGILS, sessions);
    emitChange();
  },

  logReadingSession: (session: ReadingFocusSession): void => {
    const list = MentisRepository.getReadingSessions();
    MentisRepository.saveReadingSessions([session, ...list]);
  },

  // ---------------------------------------------------------------------------
  // Notes
  // ---------------------------------------------------------------------------
  getDefaultNotes: (): Note[] => DEFAULT_NOTES,

  getNotesSnapshot: (): Note[] => {
    if (typeof window === 'undefined') return DEFAULT_NOTES;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!raw) return DEFAULT_NOTES;
      if (raw === cachedNotesRaw) return cachedNotesSnapshot;
      cachedNotesRaw = raw;
      cachedNotesSnapshot = JSON.parse(raw) as Note[];
      return cachedNotesSnapshot;
    } catch {
      return DEFAULT_NOTES;
    }
  },

  getNotes: (): Note[] => {
    return getLocal<Note[]>(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
  },

  saveNotes: (notes: Note[]): void => {
    setLocal(STORAGE_KEYS.NOTES, notes);
    cachedNotesRaw = JSON.stringify(notes);
    cachedNotesSnapshot = notes;
    emitChange();
  },

  addNote: (note: Note): void => {
    const list = MentisRepository.getNotes();
    MentisRepository.saveNotes([note, ...list]);
  },

  updateNote: (note: Note): void => {
    const list = MentisRepository.getNotes();
    MentisRepository.saveNotes(list.map((n) => (n.id === note.id ? note : n)));
  },

  deleteNote: (id: string): void => {
    const list = MentisRepository.getNotes();
    MentisRepository.saveNotes(list.filter((n) => n.id !== id));
  },

  // ---------------------------------------------------------------------------
  // Learning Sessions
  // ---------------------------------------------------------------------------
  getDefaultSessions: (): LearningSession[] => [],

  getSessionsSnapshot: (): LearningSession[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!raw) return [];
      if (raw === cachedSessionsRaw) return cachedSessionsSnapshot;
      cachedSessionsRaw = raw;
      cachedSessionsSnapshot = JSON.parse(raw) as LearningSession[];
      return cachedSessionsSnapshot;
    } catch {
      return [];
    }
  },

  getSessions: (): LearningSession[] => {
    return getLocal<LearningSession[]>(STORAGE_KEYS.SESSIONS, []);
  },

  saveSessions: (sessions: LearningSession[]): void => {
    setLocal(STORAGE_KEYS.SESSIONS, sessions);
    cachedSessionsRaw = JSON.stringify(sessions);
    cachedSessionsSnapshot = sessions;
    emitChange();
  },

  addSession: (session: LearningSession): void => {
    const list = MentisRepository.getSessions();
    MentisRepository.saveSessions([session, ...list]);
  },

  deleteSession: (id: string): void => {
    const list = MentisRepository.getSessions().filter((s) => s.id !== id);
    MentisRepository.saveSessions(list);
  },

  // ---------------------------------------------------------------------------
  // AI Credentials & Arcane Magic Spells
  // ---------------------------------------------------------------------------
  getDefaultAiCredentials: (): UserAiCredential => DEFAULT_AI_CREDENTIALS,

  getAiCredentialsSnapshot: (): UserAiCredential => {
    if (typeof window === 'undefined') return DEFAULT_AI_CREDENTIALS;
    try {
      // Purge any legacy unencrypted key
      if (localStorage.getItem('mentis_magical_key')) {
        localStorage.removeItem('mentis_magical_key');
      }

      const raw = localStorage.getItem(STORAGE_KEYS.AI_CREDENTIALS);
      if (!raw) return DEFAULT_AI_CREDENTIALS;

      if (raw === cachedAiCredentialsRaw) return cachedAiCredentialsSnapshot;
      cachedAiCredentialsRaw = raw;
      const parsed = JSON.parse(raw) as UserAiCredential;

      // Ensure raw apiKey is stripped if present from legacy sessions
      if (parsed.apiKey) {
        parsed.apiKey = undefined;
      }

      cachedAiCredentialsSnapshot = parsed;
      return cachedAiCredentialsSnapshot;
    } catch {
      return DEFAULT_AI_CREDENTIALS;
    }
  },

  getAiCredentials: (): UserAiCredential => {
    return MentisRepository.getAiCredentialsSnapshot();
  },

  saveAiCredentials: (credentials: UserAiCredential): void => {
    // Purge raw key from browser storage for Step 5 security compliance
    const sanitized: UserAiCredential = {
      ...credentials,
      apiKey: undefined,
    };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mentis_magical_key');
    }
    setLocal(STORAGE_KEYS.AI_CREDENTIALS, sanitized);
    cachedAiCredentialsRaw = JSON.stringify(sanitized);
    cachedAiCredentialsSnapshot = sanitized;
    emitChange();
  },

  // ---------------------------------------------------------------------------
  // Managed Scholars & Approval Registry
  // ---------------------------------------------------------------------------
  getDefaultScholars: (): ManagedScholar[] => DEFAULT_SCHOLARS,

  getScholarsSnapshot: (): ManagedScholar[] => {
    if (typeof window === 'undefined') return DEFAULT_SCHOLARS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SCHOLARS);
      if (!raw) return DEFAULT_SCHOLARS;
      if (raw === cachedScholarsRaw) return cachedScholarsSnapshot;
      cachedScholarsRaw = raw;
      cachedScholarsSnapshot = JSON.parse(raw) as ManagedScholar[];
      return cachedScholarsSnapshot;
    } catch {
      return DEFAULT_SCHOLARS;
    }
  },

  getScholars: (): ManagedScholar[] => {
    return getLocal<ManagedScholar[]>(STORAGE_KEYS.SCHOLARS, DEFAULT_SCHOLARS);
  },

  saveScholars: (scholars: ManagedScholar[]): void => {
    setLocal(STORAGE_KEYS.SCHOLARS, scholars);
    cachedScholarsRaw = JSON.stringify(scholars);
    cachedScholarsSnapshot = scholars;
    emitChange();
  },

  addScholarApplication: (scholar: ManagedScholar): void => {
    const list = MentisRepository.getScholars();
    // Prevent duplicate email registrations
    const filtered = list.filter((s) => s.email.toLowerCase() !== scholar.email.toLowerCase());
    MentisRepository.saveScholars([scholar, ...filtered]);
  },

  updateScholarStatus: (id: string, status: ApprovalStatus): void => {
    const list = MentisRepository.getScholars();
    const updated = list.map((s) =>
      s.id === id ? { ...s, status, reviewedAt: new Date().toISOString() } : s
    );
    MentisRepository.saveScholars(updated);

    // If the currently logged in scholar profile matches this ID, sync profile approvalStatus
    const currentProfile = MentisRepository.getProfile();
    if (currentProfile.id === id || currentProfile.email === list.find((s) => s.id === id)?.email) {
      MentisRepository.saveProfile({
        ...currentProfile,
        approvalStatus: status,
      });
    }
  },

  // ---------------------------------------------------------------------------
  // Active Auth Session
  // ---------------------------------------------------------------------------
  getDefaultActiveAuthUser: (): UserProfile | null => null,

  getActiveAuthUserSnapshot: (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_AUTH);
      if (!raw) return null;
      if (raw === cachedActiveAuthRaw) return cachedActiveAuthSnapshot;
      cachedActiveAuthRaw = raw;
      cachedActiveAuthSnapshot = JSON.parse(raw) as UserProfile;
      return cachedActiveAuthSnapshot;
    } catch {
      return null;
    }
  },

  getActiveAuthUser: (): UserProfile | null => {
    return MentisRepository.getActiveAuthUserSnapshot();
  },

  setActiveAuthUser: (user: UserProfile): void => {
    MentisRepository.saveProfile(user);
    setLocal(STORAGE_KEYS.ACTIVE_AUTH, user);
    cachedActiveAuthRaw = JSON.stringify(user);
    cachedActiveAuthSnapshot = user;
    emitChange();
  },

  clearActiveAuthUser: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_AUTH);
    }
    cachedActiveAuthRaw = null;
    cachedActiveAuthSnapshot = null;
    emitChange();
  },

  // ---------------------------------------------------------------------------
  // Transient Tasks
  // ---------------------------------------------------------------------------
  getDefaultTasks: (): TransientTask[] => DEFAULT_TRANSIENT_TASKS,

  getTasksSnapshot: (): TransientTask[] => {
    if (typeof window === 'undefined') return DEFAULT_TRANSIENT_TASKS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!raw) return DEFAULT_TRANSIENT_TASKS;
      if (raw === cachedTasksRaw) return cachedTasksSnapshot;
      cachedTasksRaw = raw;
      cachedTasksSnapshot = JSON.parse(raw) as TransientTask[];
      return cachedTasksSnapshot;
    } catch {
      return DEFAULT_TRANSIENT_TASKS;
    }
  },

  getTasks: (): TransientTask[] => {
    return getLocal<TransientTask[]>(STORAGE_KEYS.TASKS, DEFAULT_TRANSIENT_TASKS);
  },

  saveTasks: (tasks: TransientTask[]): void => {
    setLocal(STORAGE_KEYS.TASKS, tasks);
    cachedTasksRaw = JSON.stringify(tasks);
    cachedTasksSnapshot = tasks;
    emitChange();
  },

  addTask: (task: TransientTask): void => {
    const list = MentisRepository.getTasks();
    MentisRepository.saveTasks([task, ...list]);
  },

  toggleTask: (id: string): void => {
    const list = MentisRepository.getTasks();
    const updated = list.map((t) =>
      t.id === id
        ? {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? new Date().toISOString() : undefined,
          }
        : t
    );
    MentisRepository.saveTasks(updated);
  },

  deleteTask: (id: string): void => {
    const list = MentisRepository.getTasks();
    MentisRepository.saveTasks(list.filter((t) => t.id !== id));
  },

  // ---------------------------------------------------------------------------
  // Study Session Logs (Study Velocity)
  // ---------------------------------------------------------------------------
  getDefaultStudyLogs: (): StudySessionLog[] => DEFAULT_STUDY_LOGS,

  getStudyLogsSnapshot: (): StudySessionLog[] => {
    if (typeof window === 'undefined') return DEFAULT_STUDY_LOGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDY_LOGS);
      if (!raw) return DEFAULT_STUDY_LOGS;
      if (raw === cachedStudyLogsRaw) return cachedStudyLogsSnapshot;
      cachedStudyLogsRaw = raw;
      cachedStudyLogsSnapshot = JSON.parse(raw) as StudySessionLog[];
      return cachedStudyLogsSnapshot;
    } catch {
      return DEFAULT_STUDY_LOGS;
    }
  },

  getStudyLogs: (): StudySessionLog[] => {
    return getLocal<StudySessionLog[]>(STORAGE_KEYS.STUDY_LOGS, DEFAULT_STUDY_LOGS);
  },

  saveStudyLogs: (logs: StudySessionLog[]): void => {
    setLocal(STORAGE_KEYS.STUDY_LOGS, logs);
    cachedStudyLogsRaw = JSON.stringify(logs);
    cachedStudyLogsSnapshot = logs;
    emitChange();
  },

  addStudyLog: (log: StudySessionLog): void => {
    const list = MentisRepository.getStudyLogs();
    MentisRepository.saveStudyLogs([log, ...list]);
  },

  isMatriculationCompleted: (): boolean => {
    return getLocal<boolean>(STORAGE_KEYS.MATRICULATION_COMPLETED, false);
  },

  setMatriculationCompleted: (completed: boolean): void => {
    setLocal(STORAGE_KEYS.MATRICULATION_COMPLETED, completed);
    emitChange();
  },
};
