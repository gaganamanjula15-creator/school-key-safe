-- Create system_stats table to store editable statistics
CREATE TABLE IF NOT EXISTS public.system_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT NOT NULL UNIQUE,
  stat_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for admins and moderators
CREATE POLICY "Admins and moderators can view stats" 
ON public.system_stats 
FOR SELECT 
USING (get_current_user_role() IN ('admin', 'moderator'));

CREATE POLICY "Admins and moderators can update stats" 
ON public.system_stats 
FOR UPDATE 
USING (get_current_user_role() IN ('admin', 'moderator'));

CREATE POLICY "Admins and moderators can insert stats" 
ON public.system_stats 
FOR INSERT 
WITH CHECK (get_current_user_role() IN ('admin', 'moderator'));

-- Insert default statistics
INSERT INTO public.system_stats (stat_key, stat_value) VALUES 
('total_students', 1247),
('total_teachers', 78),
('total_admins', 5),
('active_today', 892)
ON CONFLICT (stat_key) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_system_stats_updated_at
BEFORE UPDATE ON public.system_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();