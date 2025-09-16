import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  QrCode, 
  Calendar, 
  Download, 
  Search,
  CheckCircle,
  XCircle,
  BookOpen
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

interface TeacherDashboardProps {
  teacher: TeacherData;
  onLogout: () => void;
}

export function TeacherDashboard({ teacher, onLogout }: TeacherDashboardProps) {
  const [scanResult, setScanResult] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const mockStudents = [
    { id: 'S001', name: 'Alice Johnson', status: 'present', time: '09:15 AM' },
    { id: 'S002', name: 'Bob Smith', status: 'present', time: '09:12 AM' },
    { id: 'S003', name: 'Carol Davis', status: 'absent', time: '-' },
    { id: 'S004', name: 'David Wilson', status: 'present', time: '09:18 AM' },
  ];

  const handleQRScan = () => {
    // Mock QR scan result
    const mockResult = 'Student: Alice Johnson (S001) - Verified';
    setScanResult(mockResult);
    setTimeout(() => setScanResult(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teacher Portal</h1>
              <p className="text-sm text-muted-foreground">
                {teacher.name} • {teacher.department}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="classes">My Classes</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* QR Scanner Section */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    QR Code Scanner
                  </CardTitle>
                  <CardDescription>
                    Scan student QR codes to mark attendance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Point camera at student QR code
                      </p>
                      <Button 
                        onClick={handleQRScan}
                        className="bg-gradient-primary"
                      >
                        Start Scanning
                      </Button>
                    </div>
                  </div>
                  
                  {scanResult && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-sm text-success font-medium">
                        ✓ {scanResult}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manual Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Manual Attendance
                  </CardTitle>
                  <CardDescription>
                    Mark attendance manually if needed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {mockStudents.map((student) => (
                      <div 
                        key={student.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-smooth"
                      >
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {student.time}
                          </span>
                          <Badge 
                            variant={student.status === 'present' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <div className="grid gap-4">
              {teacher.classes.map((cls) => (
                <Card key={cls.id} className="hover:shadow-card transition-smooth cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{cls.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cls.students} students • {cls.schedule}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Take Attendance
                        </Button>
                        <Button variant="outline" size="sm">
                          View Students
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Attendance Reports
                </CardTitle>
                <CardDescription>
                  Generate and download attendance reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">Daily Report</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Today's attendance
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Download
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Last 7 days
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Download
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">Monthly Report</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Current month
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}