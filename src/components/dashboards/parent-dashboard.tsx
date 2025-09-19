import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Heart, 
  LogOut, 
  User, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MessageCircle,
  Download
} from 'lucide-react';
import { Announcements } from '@/components/announcements';

interface ParentData {
  name: string;
  id: string;
  email: string;
  children: Array<{
    id: string;
    name: string;
    class: string;
    attendanceRate: number;
    recentGrades: Array<{
      subject: string;
      grade: string;
      date: string;
    }>;
    homeworkPending: number;
    recentAttendance: Array<{
      date: string;
      status: 'present' | 'absent';
    }>;
  }>;
}

interface ParentDashboardProps {
  parent: ParentData;
  onLogout: () => void;
}

export function ParentDashboard({ parent, onLogout }: ParentDashboardProps) {
  const [selectedChild, setSelectedChild] = useState(parent.children[0]);

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-success';
    if (rate >= 75) return 'text-warning';
    return 'text-destructive';
  };

  const getAttendanceStatus = (status: 'present' | 'absent') => {
    return status === 'present' ? (
      <CheckCircle className="w-4 h-4 text-success" />
    ) : (
      <XCircle className="w-4 h-4 text-destructive" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Parent Portal</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {parent.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="gap-2 hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Children Selector */}
          <div className="lg:col-span-1">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Your Children
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parent.children.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedChild.id === child.id ? "default" : "outline"}
                    className="w-full justify-start p-4 h-auto"
                    onClick={() => setSelectedChild(child)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{child.name}</div>
                      <div className="text-xs opacity-75">{child.class}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <div className="mt-6">
              <Announcements 
                announcements={[
                  {
                    id: '1',
                    title: 'Parent-Teacher Conference',
                    content: 'Scheduled for next week. Please check your email for specific time slots.',
                    type: 'event' as const,
                    targetAudience: 'parents' as const,
                    author: 'Administration',
                    createdAt: 'Sep 16, 2024',
                    isActive: true,
                    viewCount: 25
                  },
                  {
                    id: '2',
                    title: 'School Holiday Notice',
                    content: 'School will be closed on Sep 20, 2024 for national holiday.',
                    type: 'general' as const,
                    targetAudience: 'all' as const,
                    author: 'Principal',
                    createdAt: 'Sep 15, 2024',
                    isActive: true,
                    viewCount: 45
                  }
                ]}
                userRole="teacher"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Child Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarFallback className="bg-gradient-primary text-white text-lg">
                        {selectedChild.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{selectedChild.name}</h3>
                    <p className="text-muted-foreground">{selectedChild.class}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance Rate</p>
                      <p className={`text-2xl font-bold ${getAttendanceColor(selectedChild.attendanceRate)}`}>
                        {selectedChild.attendanceRate}%
                      </p>
                    </div>
                    <TrendingUp className={`w-8 h-8 ${getAttendanceColor(selectedChild.attendanceRate)}`} />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Homework</p>
                      <p className="text-2xl font-bold text-warning">
                        {selectedChild.homeworkPending}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Attendance */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Attendance
                </CardTitle>
                <CardDescription>
                  Last 5 school days for {selectedChild.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedChild.recentAttendance.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        {getAttendanceStatus(day.status)}
                        <span className="font-medium">{day.date}</span>
                      </div>
                      <Badge variant={day.status === 'present' ? 'default' : 'destructive'}>
                        {day.status === 'present' ? 'Present' : 'Absent'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Recent Grades
                </CardTitle>
                <CardDescription>
                  Latest academic performance for {selectedChild.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedChild.recentGrades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{grade.subject}</p>
                        <p className="text-sm text-muted-foreground">{grade.date}</p>
                      </div>
                      <Badge variant="outline" className="text-lg font-bold">
                        {grade.grade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <MessageCircle className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">Contact Teacher</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <Download className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">Download Reports</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">View Schedule</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}