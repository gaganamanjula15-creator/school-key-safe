-- Re-enable RLS on STUDENTS table and add basic policy
ALTER TABLE public."STUDENTS" ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow authenticated users to view students
CREATE POLICY "Authenticated users can view students" 
ON public."STUDENTS" 
FOR SELECT 
TO authenticated 
USING (true);

-- Add a policy to allow admins to manage students
CREATE POLICY "Admins can manage students" 
ON public."STUDENTS" 
FOR ALL 
TO authenticated 
USING (get_current_user_role() = 'admin') 
WITH CHECK (get_current_user_role() = 'admin');