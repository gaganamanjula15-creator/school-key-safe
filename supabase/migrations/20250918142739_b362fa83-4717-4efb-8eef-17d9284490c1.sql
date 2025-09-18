-- Add approval status and admin-only emails to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create approved admin emails table
CREATE TABLE IF NOT EXISTS public.admin_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert approved admin email
INSERT INTO public.admin_emails (email) VALUES ('gagana.manjula@school.edu')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS on admin_emails
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_emails table
CREATE POLICY "Only admins can view admin emails" 
ON public.admin_emails 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can manage admin emails" 
ON public.admin_emails 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Update the handle_new_user function to set approval based on role and email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role, approved)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    -- Auto-approve only if it's an admin email
    CASE 
      WHEN EXISTS (SELECT 1 FROM public.admin_emails WHERE email = NEW.email) THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$;