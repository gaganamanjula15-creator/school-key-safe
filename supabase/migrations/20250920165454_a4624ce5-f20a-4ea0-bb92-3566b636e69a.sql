-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  teacher_id UUID NOT NULL,
  class_code TEXT UNIQUE NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create class enrollments table (students in classes)
CREATE TABLE public.class_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(class_id, student_id)
);

-- Create attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID NOT NULL,
  marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(class_id, student_id, attendance_date)
);

-- Create parent-student relationships table
CREATE TABLE public.parent_student_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Teachers can manage their own classes" 
ON public.classes 
FOR ALL 
USING (teacher_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Students can view their enrolled classes" 
ON public.classes 
FOR SELECT 
USING (
  id IN (
    SELECT class_id FROM public.class_enrollments 
    WHERE student_id = auth.uid() AND is_active = true
  ) OR get_current_user_role() IN ('admin', 'teacher')
);

-- RLS Policies for class_enrollments
CREATE POLICY "Teachers can manage enrollments for their classes" 
ON public.class_enrollments 
FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes 
    WHERE teacher_id = auth.uid()
  ) OR get_current_user_role() = 'admin'
);

CREATE POLICY "Students can view their own enrollments" 
ON public.class_enrollments 
FOR SELECT 
USING (student_id = auth.uid() OR get_current_user_role() IN ('admin', 'teacher'));

-- RLS Policies for attendance_records
CREATE POLICY "Teachers can manage attendance for their classes" 
ON public.attendance_records 
FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes 
    WHERE teacher_id = auth.uid()
  ) OR get_current_user_role() = 'admin'
);

CREATE POLICY "Students can view their own attendance" 
ON public.attendance_records 
FOR SELECT 
USING (student_id = auth.uid() OR get_current_user_role() IN ('admin', 'teacher'));

CREATE POLICY "Parents can view their children's attendance" 
ON public.attendance_records 
FOR SELECT 
USING (
  student_id IN (
    SELECT student_id FROM public.parent_student_relationships 
    WHERE parent_id = auth.uid()
  ) OR get_current_user_role() IN ('admin', 'teacher')
);

-- RLS Policies for parent_student_relationships
CREATE POLICY "Admins can manage parent-student relationships" 
ON public.parent_student_relationships 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Parents can view their relationships" 
ON public.parent_student_relationships 
FOR SELECT 
USING (parent_id = auth.uid() OR get_current_user_role() IN ('admin', 'teacher'));

CREATE POLICY "Students can view their relationships" 
ON public.parent_student_relationships 
FOR SELECT 
USING (student_id = auth.uid() OR get_current_user_role() IN ('admin', 'teacher'));

-- Create triggers for updated_at
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX idx_class_enrollments_class_id ON public.class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student_id ON public.class_enrollments(student_id);
CREATE INDEX idx_attendance_records_class_id ON public.attendance_records(class_id);
CREATE INDEX idx_attendance_records_student_id ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_records_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_parent_student_parent_id ON public.parent_student_relationships(parent_id);
CREATE INDEX idx_parent_student_student_id ON public.parent_student_relationships(student_id);