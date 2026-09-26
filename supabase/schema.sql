-- ==============================================================================
-- MENTIS SCHOLARLY APPLICATION — POSTGRES SCHEMA & RLS SECURITY POLICIES
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. TABLE: profiles
-- Extends auth.users with scholarly academic credentials, status, and role.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_id TEXT NOT NULL DEFAULT 'scholar_m1',
  institution TEXT NOT NULL DEFAULT '',
  education_type TEXT NOT NULL DEFAULT 'university' CHECK (education_type IN ('school', 'college', 'university', 'graduate', 'custom')),
  program TEXT NOT NULL DEFAULT '',
  current_period TEXT NOT NULL DEFAULT '',
  target_grade TEXT NOT NULL DEFAULT '',
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: courses
-- Academic courses enrolled by the scholar.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  instructor TEXT NOT NULL DEFAULT '',
  credits INTEGER NOT NULL DEFAULT 3,
  current_grade TEXT,
  target_grade TEXT,
  color TEXT NOT NULL DEFAULT '#173B2D',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);

-- ------------------------------------------------------------------------------
-- 4. TABLE: schedule_blocks
-- Weekly scheduled lectures, laboratories, study sessions, and commitments.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Mon ... 6=Sun
  start_minutes INTEGER NOT NULL CHECK (start_minutes >= 0 AND start_minutes <= 1440),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  color TEXT NOT NULL DEFAULT '#173B2D',
  type TEXT NOT NULL DEFAULT 'class' CHECK (type IN ('class', 'study', 'assignment', 'commute', 'break', 'exam', 'personal')),
  room_or_location TEXT,
  reminder_minutes_before INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_user_id ON public.schedule_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_course_id ON public.schedule_blocks(course_id);

-- ------------------------------------------------------------------------------
-- 5. TABLE: commute_profiles
-- Commute and transit parameters for morning Leave-By calculations.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commute_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL DEFAULT '',
  distance_km NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  travel_minutes INTEGER NOT NULL DEFAULT 30,
  prep_buffer_minutes INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. TABLE: books
-- Bookshelf codices, manuals, and reading progress.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  cover_url TEXT,
  file_url TEXT,
  total_pages INTEGER NOT NULL DEFAULT 100,
  current_page INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);

-- ------------------------------------------------------------------------------
-- 7. TABLE: notes
-- Structured manuscript notes containing blocks (heading, paragraph, quote, code).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  ocr_extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_course_id ON public.notes(course_id);

-- ------------------------------------------------------------------------------
-- 8. TABLE: learning_sessions
-- Socratic AI dialogue sessions with the scholarly personas.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT 'raziel',
  mode TEXT NOT NULL DEFAULT 'socratic',
  topic TEXT NOT NULL DEFAULT '',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON public.learning_sessions(user_id);

-- ------------------------------------------------------------------------------
-- 9. TABLE: user_ai_credentials
-- Server-side encrypted provider credentials for the "Magical Key" feature.
-- NEVER exposed to client-side code directly.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_ai_credentials (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gemini',
  encrypted_key TEXT NOT NULL,
  key_iv TEXT NOT NULL,
  key_tag TEXT NOT NULL,
  masked_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation ensuring users only access their own records.
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_credentials ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if caller has 'admin' role in profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- POLICIES: profiles
-- Users can view and update their own profile.
-- Administrators can view all profiles and update approval statuses.
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile details"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Normal users cannot elevate their own role or approve themselves
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND approval_status = (SELECT approval_status FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: User-Owned Relational Tables
-- Strict self-ownership: auth.uid() = user_id
-- ------------------------------------------------------------------------------

-- courses
CREATE POLICY "Users can manage own courses"
  ON public.courses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- schedule_blocks
CREATE POLICY "Users can manage own schedule"
  ON public.schedule_blocks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- commute_profiles
CREATE POLICY "Users can manage own commute profile"
  ON public.commute_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- books
CREATE POLICY "Users can manage own books"
  ON public.books FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- notes
CREATE POLICY "Users can manage own notes"
  ON public.notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- learning_sessions
CREATE POLICY "Users can manage own learning sessions"
  ON public.learning_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_ai_credentials (server-side only via service role or user's own encrypted record)
CREATE POLICY "Users can view own masked AI credentials"
  ON public.user_ai_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI credentials"
  ON public.user_ai_credentials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 11. AUTOMATIC PROFILE PROVISIONING TRIGGER
-- Automatically creates a pending profile upon auth.users signup.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_id,
    approval_status,
    role
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_id', 'scholar_m1'),
    'pending',
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
