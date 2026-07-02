
CREATE TABLE public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_level TEXT NOT NULL CHECK (academic_level IN ('undergrad','grad')),
  age INT NOT NULL,
  major TEXT NOT NULL,
  can_help_with TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_profiles TO authenticated;
GRANT ALL ON public.mentor_profiles TO service_role;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view mentor profiles" ON public.mentor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert own mentor profile" ON public.mentor_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own mentor profile" ON public.mentor_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own mentor profile" ON public.mentor_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.mentee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_level TEXT NOT NULL CHECK (academic_level IN ('undergrad','grad')),
  age INT NOT NULL,
  major TEXT NOT NULL,
  needs_help_with TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentee_profiles TO authenticated;
GRANT ALL ON public.mentee_profiles TO service_role;
ALTER TABLE public.mentee_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view mentee profiles" ON public.mentee_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert own mentee profile" ON public.mentee_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own mentee profile" ON public.mentee_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own mentee profile" ON public.mentee_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
