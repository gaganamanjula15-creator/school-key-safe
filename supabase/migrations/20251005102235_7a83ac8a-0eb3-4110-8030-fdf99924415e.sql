-- Create admin verification codes table
CREATE TABLE IF NOT EXISTS public.admin_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_code text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  last_used_at timestamp with time zone,
  UNIQUE(admin_id, verification_code)
);

-- Enable RLS
ALTER TABLE public.admin_verification_codes ENABLE ROW LEVEL SECURITY;

-- Admins can view their own codes
CREATE POLICY "Admins can view own codes"
ON public.admin_verification_codes
FOR SELECT
TO authenticated
USING (
  admin_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create verification attempts log
CREATE TABLE IF NOT EXISTS public.admin_verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_code text NOT NULL,
  success boolean NOT NULL,
  ip_address text,
  attempted_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on attempts
ALTER TABLE public.admin_verification_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view their own attempts
CREATE POLICY "Admins can view own attempts"
ON public.admin_verification_attempts
FOR SELECT
TO authenticated
USING (
  admin_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Insert default verification code for system owner (Gagana Manjula)
-- Code: KARAGAS2024
INSERT INTO public.admin_verification_codes (admin_id, verification_code, is_active)
SELECT user_id, 'KARAGAS2024', true
FROM public.profiles
WHERE first_name = 'Gagana' AND last_name = 'Manjula' AND role = 'admin'
ON CONFLICT (admin_id, verification_code) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_admin_id ON public.admin_verification_codes(admin_id);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_admin_id ON public.admin_verification_attempts(admin_id);