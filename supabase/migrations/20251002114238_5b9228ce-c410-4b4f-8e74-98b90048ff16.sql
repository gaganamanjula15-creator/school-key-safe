-- Create school_config table to store school configuration
CREATE TABLE IF NOT EXISTS public.school_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_config ENABLE ROW LEVEL SECURITY;

-- Admins can view school config
CREATE POLICY "Admins can view school config"
ON public.school_config
FOR SELECT
USING (get_current_user_role() = 'admin');

-- Admins can insert school config
CREATE POLICY "Admins can insert school config"
ON public.school_config
FOR INSERT
WITH CHECK (get_current_user_role() = 'admin');

-- Admins can update school config
CREATE POLICY "Admins can update school config"
ON public.school_config
FOR UPDATE
USING (get_current_user_role() = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_school_config_updated_at
  BEFORE UPDATE ON public.school_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default school configuration
INSERT INTO public.school_config (config_key, config_value)
VALUES ('school_info', '{
  "name": "Digital Academy High School",
  "address": "123 Education Street, Learning City, LC 12345",
  "phone": "+1 (555) 123-4567",
  "email": "info@digitalacademy.edu",
  "website": "www.digitalacademy.edu",
  "description": "Excellence in Education Through Innovation and Technology",
  "logoUrl": "/src/assets/school-logo.png"
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;