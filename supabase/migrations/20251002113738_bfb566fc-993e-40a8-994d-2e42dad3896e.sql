-- Add udayak2285@gmail.com as admin email
INSERT INTO public.admin_emails (email)
VALUES ('udayak2285@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Update the profile to admin role and approve
UPDATE public.profiles
SET role = 'admin',
    approved = true,
    updated_at = now()
WHERE email = 'udayak2285@gmail.com';