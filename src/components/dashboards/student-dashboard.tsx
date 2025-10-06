import { DigitalIDCard } from '@/components/digital-id-card';
import { MessageInbox } from '@/components/message-inbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Download, User, QrCode } from 'lucide-react';

interface StudentData {
  name: string;
  id: string;
  class: string;
  email: string;
  photo?: string;
  attendanceRate: number;
  recentAttendance: { date: string; status: 'present' | 'absent' }[];
}

interface StudentDashboardProps {
  student: StudentData;
  onLogout: () => void;
}

export function StudentDashboard({ student, onLogout }: StudentDashboardProps) {
  const idCardData = {
    name: student.name,
    role: 'student' as const,
    id: student.id,
    class: student.class,
    photo: student.photo
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Student Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {student.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Messages Section */}
          <MessageInbox />

          {/* Rest of Dashboard */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Digital ID Card Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Digital ID</h2>
                <Button size="sm" className="bg-gradient-primary">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              
              <DigitalIDCard data={idCardData} />
              
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    QR Code Usage
                  </CardTitle>
                  <CardDescription>
                    Use your QR code for attendance, library access, and verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Weekly Scans</span>
                      <Badge variant="secondary">12 times</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Scan</span>
                      <span className="text-muted-foreground">Today 2:15 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile & Attendance Section */}
            <div className="space-y-6">
              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your basic information below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Student ID</label>
                      <p className="text-sm text-muted-foreground">{student.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Class</label>
                      <p className="text-sm text-muted-foreground">{student.class}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Update Profile Photo
                  </Button>
                </CardContent>
              </Card>

              {/* Attendance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Attendance History
                  </CardTitle>
                  <CardDescription>
                    Your attendance rate: {student.attendanceRate}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <Badge variant={student.attendanceRate >= 85 ? "default" : "destructive"}>
                        {student.attendanceRate}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-smooth" 
                        style={{ width: `${student.attendanceRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Records</h4>
                    {student.recentAttendance.map((record, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}