-- Fix missing profiles for existing users
-- First, add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Insert profile for user ac5b232d-e4a7-429e-9ef6-c19311bcda4b
INSERT INTO public.profiles (user_id, email, first_name, last_name, role, grade, student_number, approved)
SELECT 
  id,
  email,
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name',
  COALESCE(raw_user_meta_data->>'role', 'student'),
  raw_user_meta_data->>'grade',
  raw_user_meta_data->>'student_number',
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.users.email) THEN true
    ELSE false
  END
FROM auth.users
WHERE id = 'ac5b232d-e4a7-429e-9ef6-c19311bcda4b'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = 'ac5b232d-e4a7-429e-9ef6-c19311bcda4b');

-- Also insert profiles for any other users who might be missing profiles
INSERT INTO public.profiles (user_id, email, first_name, last_name, role, grade, student_number, approved)
SELECT 
  auth.users.id,
  auth.users.email,
  auth.users.raw_user_meta_data->>'first_name',
  auth.users.raw_user_meta_data->>'last_name',
  COALESCE(auth.users.raw_user_meta_data->>'role', 'student'),
  auth.users.raw_user_meta_data->>'grade',
  auth.users.raw_user_meta_data->>'student_number',
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.admin_emails ae WHERE ae.email = auth.users.email) THEN true
    ELSE false
  END
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.users.id
);