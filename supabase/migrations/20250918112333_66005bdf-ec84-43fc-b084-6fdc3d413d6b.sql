-- Create security definer function first
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop ALL existing policies
DROP POLICY "Admins can view all profiles" ON public.profiles;
DROP POLICY "Users can view their own profile" ON public.profiles;  
DROP POLICY "Admins can create profiles" ON public.profiles;
DROP POLICY "Admins can update all profiles" ON public.profiles;
DROP POLICY "Users can update their own profile" ON public.profiles;
DROP POLICY "Admins can delete profiles" ON public.profiles;

-- Create new policies using the security definer function to avoid infinite recursion
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.get_current_user_role() = 'admin');