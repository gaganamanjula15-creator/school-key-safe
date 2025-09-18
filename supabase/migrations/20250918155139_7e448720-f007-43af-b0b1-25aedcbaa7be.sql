-- Fix the role check constraint to include moderator
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['student'::text, 'teacher'::text, 'admin'::text, 'parent'::text, 'moderator'::text]));