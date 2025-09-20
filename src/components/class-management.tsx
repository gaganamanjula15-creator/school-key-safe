import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, UserPlus, Calendar, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Class {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  class_code: string;
  student_count?: number;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_number: string;
  grade: string;
}

export function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const { toast } = useToast();

  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    grade_level: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        class_enrollments(count)
      `)
      .eq('is_active', true);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive"
      });
    } else {
      setClasses(data || []);
    }
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, student_number, grade')
      .eq('role', 'student')
      .eq('approved', true)
      .eq('is_active', true);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      });
    } else {
      setStudents(data || []);
    }
  };

  const createClass = async () => {
    if (!newClass.name || !newClass.subject || !newClass.grade_level) return;

    setLoading(true);
    const { error } = await supabase
      .from('classes')
      .insert({
        name: newClass.name,
        subject: newClass.subject,
        grade_level: newClass.grade_level,
        teacher_id: (await supabase.auth.getUser()).data.user?.id
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Class created successfully"
      });
      setNewClass({ name: '', subject: '', grade_level: '' });
      fetchClasses();
    }
  };

  const fetchClassStudents = async (classId: string) => {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select(`
        profiles!inner (
          id, first_name, last_name, email, student_number, grade
        )
      `)
      .eq('class_id', classId)
      .eq('is_active', true);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch class students",
        variant: "destructive"
      });
      setClassStudents([]);
    } else {
      const studentsData = data?.map((enrollment: any) => enrollment.profiles).filter(Boolean) || [];
      setClassStudents(studentsData);
    }
  };

  const addStudentToClass = async (studentId: string, classId: string) => {
    const { error } = await supabase
      .from('class_enrollments')
      .insert({
        class_id: classId,
        student_id: studentId
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add student to class",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Student added to class"
      });
      if (selectedClass) {
        fetchClassStudents(selectedClass.id);
      }
      fetchClasses();
    }
  };

  const removeStudentFromClass = async (studentId: string, classId: string) => {
    const { error } = await supabase
      .from('class_enrollments')
      .update({ is_active: false })
      .eq('class_id', classId)
      .eq('student_id', studentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove student from class",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Student removed from class"
      });
      if (selectedClass) {
        fetchClassStudents(selectedClass.id);
      }
      fetchClasses();
    }
  };

  const availableStudents = students.filter(student => 
    !classStudents.some(classStudent => classStudent.id === student.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Class Management</h2>
        </div>
      </div>

      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="create">Create Class</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{classItem.name}</CardTitle>
                      <CardDescription>{classItem.subject}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      Grade {classItem.grade_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground">
                        {classItem.student_count || 0} students
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {classItem.class_code}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedClass(classItem);
                            fetchClassStudents(classItem.id);
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Manage Students
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Manage Students - {selectedClass?.name}</DialogTitle>
                          <DialogDescription>
                            Add or remove students from this class
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="current">
                          <TabsList>
                            <TabsTrigger value="current">Current Students</TabsTrigger>
                            <TabsTrigger value="add">Add Students</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="current" className="space-y-4">
                            {classStudents.length === 0 ? (
                              <p className="text-center text-muted-foreground py-8">
                                No students in this class yet
                              </p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Student Number</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {classStudents.map((student) => (
                                    <TableRow key={student.id}>
                                      <TableCell>
                                        {student.first_name} {student.last_name}
                                      </TableCell>
                                      <TableCell>{student.student_number}</TableCell>
                                      <TableCell>{student.grade}</TableCell>
                                      <TableCell>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeStudentFromClass(student.id, selectedClass!.id)}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Remove
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="add" className="space-y-4">
                            {availableStudents.length === 0 ? (
                              <p className="text-center text-muted-foreground py-8">
                                All students are already in this class
                              </p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Student Number</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {availableStudents.map((student) => (
                                    <TableRow key={student.id}>
                                      <TableCell>
                                        {student.first_name} {student.last_name}
                                      </TableCell>
                                      <TableCell>{student.student_number}</TableCell>
                                      <TableCell>{student.grade}</TableCell>
                                      <TableCell>
                                        <Button
                                          size="sm"
                                          onClick={() => addStudentToClass(student.id, selectedClass!.id)}
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.location.href = `/attendance/${classItem.id}`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Take Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Class</CardTitle>
              <CardDescription>
                Create a new class and start managing student attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="className">Class Name</Label>
                  <Input
                    id="className"
                    placeholder="e.g., Mathematics 10-A"
                    value={newClass.name}
                    onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics"
                    value={newClass.subject}
                    onChange={(e) => setNewClass(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select onValueChange={(value) => setNewClass(prev => ({ ...prev, grade_level: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 13 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Grade {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={createClass}
                disabled={loading || !newClass.name || !newClass.subject || !newClass.grade_level}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Class'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}