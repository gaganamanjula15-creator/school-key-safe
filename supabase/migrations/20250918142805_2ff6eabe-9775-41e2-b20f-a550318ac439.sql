-- Fix RLS policies for admin_emails table
DROP POLICY IF EXISTS "Only admins can view admin emails" ON public.admin_emails;
DROP POLICY IF EXISTS "Only admins can manage admin emails" ON public.admin_emails;

-- Create proper RLS policies for admin_emails
CREATE POLICY "Admins can view admin emails" 
ON public.admin_emails 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert admin emails" 
ON public.admin_emails 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update admin emails" 
ON public.admin_emails 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete admin emails" 
ON public.admin_emails 
FOR DELETE 
USING (public.get_current_user_role() = 'admin');