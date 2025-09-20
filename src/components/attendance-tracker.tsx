import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Clock, AlertCircle, Calendar as CalendarIcon, Users, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Class {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  grade: string;
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

interface ExistingAttendance {
  student_id: string;
  status: string;
  notes?: string;
}

const attendanceStatuses = [
  { value: 'present', label: 'Present', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-yellow-600' },
  { value: 'excused', label: 'Excused', icon: AlertCircle, color: 'text-blue-600' }
];

export function AttendanceTracker() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<ExistingAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass.id);
      fetchExistingAttendance(selectedClass.id, selectedDate);
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
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

  const fetchClassStudents = async (classId: string) => {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select(`
        profiles!inner (
          id, first_name, last_name, student_number, grade
        )
      `)
      .eq('class_id', classId)
      .eq('is_active', true);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      });
      setStudents([]);
      setAttendance([]);
    } else {
      const studentsData = data?.map((enrollment: any) => enrollment.profiles).filter(Boolean) || [];
      setStudents(studentsData);
      
      // Initialize attendance records for all students
      setAttendance(studentsData.map((student: any) => ({
        student_id: student.id,
        status: 'present' as const,
        notes: ''
      })));
    }
  };

  const fetchExistingAttendance = async (classId: string, date: Date) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('student_id, status, notes')
      .eq('class_id', classId)
      .eq('attendance_date', format(date, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching existing attendance:', error);
    } else {
      setExistingAttendance(data || []);
    }
  };

  const updateAttendance = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendance(prev => prev.map(record => 
      record.student_id === studentId 
        ? { ...record, status }
        : record
    ));
  };

  const updateNotes = (studentId: string, notes: string) => {
    setAttendance(prev => prev.map(record => 
      record.student_id === studentId 
        ? { ...record, notes }
        : record
    ));
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;

    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const attendanceData = attendance.map(record => ({
      class_id: selectedClass.id,
      student_id: record.student_id,
      attendance_date: format(selectedDate, 'yyyy-MM-dd'),
      status: record.status,
      marked_by: user?.id,
      notes: record.notes
    }));

    // Delete existing attendance for this date and class
    await supabase
      .from('attendance_records')
      .delete()
      .eq('class_id', selectedClass.id)
      .eq('attendance_date', format(selectedDate, 'yyyy-MM-dd'));

    // Insert new attendance records
    const { error } = await supabase
      .from('attendance_records')
      .insert(attendanceData);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Attendance saved successfully"
      });
      fetchExistingAttendance(selectedClass.id, selectedDate);
    }
  };

  const getStudentAttendance = (studentId: string) => {
    const existing = existingAttendance.find(record => record.student_id === studentId);
    if (existing) return existing;
    
    const current = attendance.find(record => record.student_id === studentId);
    return current || { student_id: studentId, status: 'present', notes: '' };
  };

  const getAttendanceSummary = () => {
    const summary = { present: 0, absent: 0, late: 0, excused: 0 };
    students.forEach(student => {
      const record = getStudentAttendance(student.id);
      summary[record.status as keyof typeof summary]++;
    });
    return summary;
  };

  const summary = getAttendanceSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Attendance Tracker</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Class</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => {
              const classItem = classes.find(c => c.id === value);
              setSelectedClass(classItem || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name} - {classItem.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Summary</CardTitle>
            <CardDescription>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Present</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {summary.present}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Absent</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {summary.absent}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Late</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {summary.late}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Excused</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {summary.excused}
              </Badge>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-sm">Total</span>
              <Badge variant="outline">
                {students.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      {selectedClass && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mark Attendance - {selectedClass.name}</CardTitle>
              <CardDescription>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </div>
            <Button onClick={saveAttendance} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Attendance'}
            </Button>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No students in this class</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student Number</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const studentRecord = getStudentAttendance(student.id);
                    const statusConfig = attendanceStatuses.find(s => s.value === studentRecord.status);
                    const StatusIcon = statusConfig?.icon || CheckCircle2;
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.student_number}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${statusConfig?.color}`} />
                            <span className="capitalize">{studentRecord.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {attendanceStatuses.map((status) => (
                              <Button
                                key={status.value}
                                variant={studentRecord.status === status.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateAttendance(student.id, status.value as AttendanceRecord['status'])}
                              >
                                <status.icon className="w-4 h-4" />
                              </Button>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setStudentNotes(studentRecord.notes || '');
                              }}
                            >
                              Notes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Notes - {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogTitle>
            <DialogDescription>
              Add attendance notes for this student
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter attendance notes..."
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (selectedStudent) {
                  updateNotes(selectedStudent.id, studentNotes);
                  setSelectedStudent(null);
                }
              }}>
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}