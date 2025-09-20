import { useState } from 'react';
import { HomeworkReview } from '@/components/homework-review';
import { Announcements } from '@/components/announcements';
import { ClassManagement } from '@/components/class-management';
import { AttendanceTracker } from '@/components/attendance-tracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Users, 
  QrCode, 
  Calendar, 
  Download, 
  Search,
  CheckCircle,
  BookOpen,
  FileText,
  Bell,
  BarChart3,
  Clock,
  TrendingUp
} from 'lucide-react';

interface TeacherData {
  name: string;
  id: string;
  department: string;
  email: string;
  classes: Array<{
    id: string;
    name: string;
    students: number;
    schedule: string;
  }>;
}

interface EnhancedTeacherDashboardProps {
  teacher: TeacherData;
  onLogout: () => void;
}

export function EnhancedTeacherDashboard({ teacher, onLogout }: EnhancedTeacherDashboardProps) {
  const [scanResult, setScanResult] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const homeworkSubmissions = [
    {
      id: '1',
      studentName: 'Alice Johnson',
      studentId: 'S2024001',
      title: 'Calculus Assignment 3',
      description: 'Solved integration problems from chapter 5',
      submittedAt: '2024-09-16T14:30:00',
      files: [
        { name: 'calculus_assignment.pdf', type: 'application/pdf', size: 2048000, url: '#' }
      ],
      status: 'pending' as const,
      maxGrade: 100
    },
    {
      id: '2',
      studentName: 'Bob Smith',
      studentId: 'S2024002',
      title: 'Algebra Problems Set 2',
      description: 'Complete solutions with detailed steps',
      submittedAt: '2024-09-15T10:15:00',
      files: [
        { name: 'algebra_solutions.docx', type: 'application/msword', size: 1024000, url: '#' }
      ],
      status: 'reviewed' as const,
      grade: 85,
      feedback: 'Good work, but could improve on problem 3.',
      maxGrade: 100
    }
  ];

  const announcements = [
    {
      id: '1',
      title: 'Staff Meeting Tomorrow',
      content: 'All mathematics department faculty are required to attend the meeting at 3 PM in room 201.',
      type: 'general' as const,
      targetAudience: 'teachers' as const,
      author: 'Department Head',
      createdAt: '2024-09-16',
      isActive: true,
      viewCount: 15
    }
  ];

  const mockStudents = [
    { id: 'S001', name: 'Alice Johnson', status: 'present', time: '09:15 AM', class: 'Grade 10-A' },
    { id: 'S002', name: 'Bob Smith', status: 'present', time: '09:12 AM', class: 'Grade 10-A' },
    { id: 'S003', name: 'Carol Davis', status: 'absent', time: '-', class: 'Grade 10-A' },
    { id: 'S004', name: 'David Wilson', status: 'present', time: '09:18 AM', class: 'Grade 10-A' },
  ];

  const handleQRScan = () => {
    // Mock QR scan result
    const mockResult = 'Student: Alice Johnson (S001) - Verified';
    setScanResult(mockResult);
    setTimeout(() => setScanResult(''), 3000);
  };

  const handleGradeSubmission = (id: string, grade: number, feedback: string) => {
    console.log('Grading submission:', { id, grade, feedback });
    // This would connect to backend to save the grade
  };

  const handleCreateAnnouncement = (announcement: any) => {
    console.log('Creating announcement:', announcement);
    // This would connect to backend to create the announcement
  };

  const totalStudents = teacher.classes.reduce((sum, cls) => sum + cls.students, 0);
  const presentToday = mockStudents.filter(s => s.status === 'present').length;
  const attendanceRate = Math.round((presentToday / mockStudents.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b bg-gradient-card shadow-elegant">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-glow">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Teacher Portal</h1>
                <p className="text-muted-foreground">
                  {teacher.name} • {teacher.department}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {teacher.classes.length} Classes
              </Badge>
              <ThemeToggle />
              <Button variant="outline" onClick={onLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-card border-primary/20 hover:shadow-card transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-success/20 hover:shadow-card transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">{attendanceRate}%</p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-secondary/20 hover:shadow-card transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <p className="text-2xl font-bold">{homeworkSubmissions.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-accent/20 hover:shadow-card transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-accent-foreground" />
                  <p className="text-2xl font-bold">{teacher.classes.length}</p>
                  <p className="text-sm text-muted-foreground">Active Classes</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {homeworkSubmissions.slice(0, 3).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-smooth">
                        <div>
                          <p className="font-medium text-sm">{submission.title}</p>
                          <p className="text-xs text-muted-foreground">{submission.studentName}</p>
                        </div>
                        <Badge variant={submission.status === 'pending' ? 'secondary' : 'default'} className="text-xs">
                          {submission.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Today's Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockStudents.slice(0, 4).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.id}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={student.status === 'present' ? 'default' : 'destructive'}
                            className="text-xs mb-1"
                          >
                            {student.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{student.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6 animate-fade-in">
            <AttendanceTracker />
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6 animate-fade-in">
            <ClassManagement />
          </TabsContent>

          {/* Homework Tab */}
          <TabsContent value="homework" className="animate-fade-in">
            <HomeworkReview 
              submissions={homeworkSubmissions}
              onGradeSubmission={handleGradeSubmission}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Attendance Reports
                </CardTitle>
                <CardDescription>
                  Generate and download attendance reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-border/50 hover:shadow-card transition-all duration-200 group">
                    <CardContent className="p-4 text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                      <p className="font-medium">Daily Report</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Today's attendance
                      </p>
                      <Button size="sm" variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                        Download
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 hover:shadow-card transition-all duration-200 group">
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-secondary group-hover:scale-110 transition-transform" />
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Last 7 days
                      </p>
                      <Button size="sm" variant="outline" className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground">
                        Download
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 hover:shadow-card transition-all duration-200 group">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-accent-foreground group-hover:scale-110 transition-transform" />
                      <p className="font-medium">Monthly Report</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Current month
                      </p>
                      <Button size="sm" variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground">
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="animate-fade-in">
            <Announcements 
              announcements={announcements}
              userRole="teacher"
              onCreateAnnouncement={handleCreateAnnouncement}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}