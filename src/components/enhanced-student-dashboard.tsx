import { useState } from 'react';
import { DigitalIDCard } from '@/components/digital-id-card';
import { HomeworkUpload } from '@/components/homework-upload';
import { Announcements } from '@/components/announcements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  CalendarDays, 
  Download, 
  User, 
  QrCode, 
  BookOpen,
  FileText,
  Bell,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';

interface StudentData {
  name: string;
  id: string;
  class: string;
  email: string;
  photo?: string;
  attendanceRate: number;
  recentAttendance: { date: string; status: 'present' | 'absent' }[];
}

interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  maxGrade?: number;
}

interface EnhancedStudentDashboardProps {
  student: StudentData;
  onLogout: () => void;
}

export function EnhancedStudentDashboard({ student, onLogout }: EnhancedStudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const homework: HomeworkItem[] = [
    { id: '1', subject: 'Mathematics', title: 'Calculus Assignment 3', dueDate: '2024-09-20', status: 'pending' },
    { id: '2', subject: 'Physics', title: 'Motion Laws Report', dueDate: '2024-09-18', status: 'submitted' },
    { id: '3', subject: 'Chemistry', title: 'Organic Compounds Lab', dueDate: '2024-09-15', status: 'graded', grade: 88, maxGrade: 100 },
    { id: '4', subject: 'English', title: 'Literature Essay', dueDate: '2024-09-22', status: 'pending' },
  ];

  const announcements = [
    {
      id: '1',
      title: 'School Sports Day',
      content: 'Annual sports day will be held on September 25th. All students are encouraged to participate in various events.',
      type: 'event' as const,
      targetAudience: 'students' as const,
      author: 'Principal Johnson',
      createdAt: '2024-09-16',
      isActive: true,
      viewCount: 234
    },
    {
      id: '2',
      title: 'Library Maintenance',
      content: 'The library will be closed for maintenance from September 20-22. Online resources will remain available.',
      type: 'general' as const,
      targetAudience: 'all' as const,
      author: 'Librarian Smith',
      createdAt: '2024-09-15',
      isActive: true,
      viewCount: 156
    }
  ];

  const idCardData = {
    name: student.name,
    role: 'student' as const,
    id: student.id,
    class: student.class,
    photo: student.photo
  };

  const getHomeworkStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'submitted': return 'secondary';
      case 'graded': return 'default';
      default: return 'outline';
    }
  };

  const handleHomeworkSubmit = (homeworkId: string, data: any) => {
    console.log('Homework submitted:', { homeworkId, data });
    // Update homework status - this would connect to backend
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b bg-gradient-card shadow-elegant">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-glow">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Student Portal</h1>
                <p className="text-muted-foreground">Welcome back, {student.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Class {student.class}
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
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="id-card" className="text-sm">Digital ID</TabsTrigger>
            <TabsTrigger value="homework" className="text-sm">Homework</TabsTrigger>
            <TabsTrigger value="attendance" className="text-sm">Attendance</TabsTrigger>
            <TabsTrigger value="announcements" className="text-sm">Announcements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-card border-primary/20 hover:shadow-card transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">{student.attendanceRate}%</p>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-secondary/20 hover:shadow-card transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <p className="text-2xl font-bold">{homework.filter(h => h.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-accent/20 hover:shadow-card transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-accent-foreground" />
                  <p className="text-2xl font-bold">
                    {homework.filter(h => h.grade).reduce((acc, h) => acc + (h.grade || 0), 0) / homework.filter(h => h.grade).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Grade</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-border hover:shadow-card transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{announcements.length}</p>
                  <p className="text-sm text-muted-foreground">Announcements</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Upcoming Homework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {homework.filter(h => h.status === 'pending').slice(0, 3).map((hw) => (
                      <div key={hw.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{hw.title}</p>
                          <p className="text-xs text-muted-foreground">{hw.subject}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getHomeworkStatusColor(hw.status)} className="text-xs">
                            {hw.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(hw.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Recent Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.recentAttendance.slice(0, 5).map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">{record.date}</span>
                        <Badge 
                          variant={record.status === 'present' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Digital ID Tab */}
          <TabsContent value="id-card" className="animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Your Digital ID Card</h2>
                <p className="text-muted-foreground">
                  Use your QR code for attendance, library access, and verification
                </p>
              </div>
              
              <DigitalIDCard data={idCardData} className="animate-scale-in" />
              
              <div className="text-center">
                <Button className="bg-gradient-primary shadow-glow">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Homework Tab */}
          <TabsContent value="homework" className="space-y-6 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Homework List */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">My Assignments</h3>
                {homework.map((hw) => (
                  <Card key={hw.id} className="hover:shadow-card transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{hw.title}</h4>
                          <p className="text-sm text-muted-foreground">{hw.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(hw.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={getHomeworkStatusColor(hw.status)} className="text-xs">
                            {hw.status}
                          </Badge>
                          {hw.grade !== undefined && (
                            <p className="text-sm font-medium text-success">
                              {hw.grade}/{hw.maxGrade}
                            </p>
                          )}
                        </div>
                      </div>
                      {hw.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="mt-3 bg-gradient-primary"
                          onClick={() => {
                            // This would open homework upload modal
                            console.log('Upload homework for:', hw.id);
                          }}
                        >
                          Submit Assignment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Upload Area */}
              <div>
                <HomeworkUpload
                  subject="Mathematics"
                  dueDate="2024-09-20"
                  onSubmit={(data) => handleHomeworkSubmit('sample', data)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Attendance Overview
                </CardTitle>
                <CardDescription>
                  Your attendance rate: {student.attendanceRate}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium">This Month</span>
                  <Badge variant={student.attendanceRate >= 85 ? "default" : "destructive"}>
                    {student.attendanceRate}%
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-primary h-3 rounded-full transition-all duration-1000 animate-pulse-glow" 
                    style={{ width: `${student.attendanceRate}%` }}
                  />
                </div>

                <div className="grid gap-2 mt-6">
                  <h4 className="font-medium">Recent Records</h4>
                  {student.recentAttendance.map((record, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-smooth">
                      <span>{record.date}</span>
                      <Badge 
                        variant={record.status === 'present' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="animate-fade-in">
            <Announcements 
              announcements={announcements}
              userRole="student"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}