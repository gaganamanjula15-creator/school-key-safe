-- Fix missing profiles for existing users
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
  -- Auto-approve if it's an admin email, otherwise false
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.users.email) THEN true
    ELSE false
  END
FROM auth.users
WHERE id = 'ac5b232d-e4a7-429e-9ef6-c19311bcda4b'
ON CONFLICT (user_id) DO NOTHING;

-- Also insert profiles for any other users who might be missing profiles
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
    WHEN EXISTS (SELECT 1 FROM public.admin_emails ae WHERE ae.email = auth.users.email) THEN true
    ELSE false
  END
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;