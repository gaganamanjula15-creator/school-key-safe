import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  Settings,
  Search,
  Check,
  X,
  BarChart3,
  School
} from 'lucide-react';
import { SchoolConfig } from '@/components/admin/school-config';
import { IdCardConfig } from '@/components/admin/id-card-config';
import { SecurityConfig } from '@/components/admin/security-config';
import { BackupConfig } from '@/components/admin/backup-config';
import { useToast } from '@/hooks/use-toast';
import { UserManagement } from '@/components/user-management';

interface AdminData {
  name: string;
  id: string;
  email: string;
}

interface AdminDashboardProps {
  admin: AdminData;
  onLogout: () => void;
}

export function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolConfigOpen, setSchoolConfigOpen] = useState(false);
  const [idCardConfigOpen, setIdCardConfigOpen] = useState(false);
  const [securityConfigOpen, setSecurityConfigOpen] = useState(false);
  const [backupConfigOpen, setBackupConfigOpen] = useState(false);
  const { toast } = useToast();

  // Mock data
  const systemStats = {
    totalStudents: 1247,
    totalTeachers: 78,
    totalAdmins: 5,
    activeToday: 892,
    pendingApprovals: 12
  };

  const pendingUsers = [
    { id: '1', name: 'Emma Wilson', role: 'student', class: 'Grade 10A', submitted: '2 hours ago' },
    { id: '2', name: 'James Brown', role: 'teacher', department: 'Mathematics', submitted: '4 hours ago' },
    { id: '3', name: 'Sarah Davis', role: 'student', class: 'Grade 9B', submitted: '1 day ago' },
  ];

  const handleApproval = (id: string, approved: boolean) => {
    console.log(`${approved ? 'Approved' : 'Rejected'} user ${id}`);
    toast({
      title: approved ? "User Approved" : "User Rejected",
      description: `User registration has been ${approved ? 'approved' : 'rejected'}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
              <p className="text-sm text-muted-foreground">
                System Administrator • {admin.name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* System Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="border-primary/20 bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{systemStats.totalStudents}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          
          <Card className="border-secondary/20 bg-gradient-card">
            <CardContent className="p-4 text-center">
              <School className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold">{systemStats.totalTeachers}</p>
              <p className="text-sm text-muted-foreground">Total Teachers</p>
            </CardContent>
          </Card>
          
          <Card className="border-accent/20 bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-accent-foreground" />
              <p className="text-2xl font-bold">{systemStats.totalAdmins}</p>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </CardContent>
          </Card>
          
          <Card className="border-success/20 bg-gradient-card">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{systemStats.activeToday}</p>
              <p className="text-sm text-muted-foreground">Active Today</p>
            </CardContent>
          </Card>
          
          <Card className="border-warning/20 bg-gradient-card">
            <CardContent className="p-4 text-center">
              <UserPlus className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">{systemStats.pendingApprovals}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="approvals">User Approvals</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          {/* User Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Pending User Registrations
                </CardTitle>
                <CardDescription>
                  Review and approve new user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length > 0 ? (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.class || user.department} • Submitted {user.submitted}
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleApproval(user.id, false)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => handleApproval(user.id, true)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          {/* Bulk Operations Tab */}
          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Bulk User Operations
                </CardTitle>
                <CardDescription>
                  Import users via CSV file or perform bulk actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">CSV Import</h4>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a CSV file with user data
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => toast({
                          title: "File Upload",
                          description: "CSV import functionality requires backend integration.",
                        })}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Bulk Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => toast({
                          title: "Export Started",
                          description: "User data export is being prepared.",
                        })}
                      >
                        Export All Users to CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => toast({
                          title: "ID Cards Generation",
                          description: "Bulk ID card generation started.",
                        })}
                      >
                        Generate ID Cards for All Students
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => toast({
                          title: "Password Reset",
                          description: "Password reset emails are being sent.",
                        })}
                      >
                        Send Password Reset Emails
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                       onClick={() => setSchoolConfigOpen(true)}>
                    <div className="flex items-center gap-3">
                      <School className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">School Information</h4>
                        <p className="text-sm text-muted-foreground">
                          Update school name, logo, and contact details
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Ready
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSchoolConfigOpen(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                       onClick={() => setIdCardConfigOpen(true)}>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-secondary" />
                      <div>
                        <h4 className="font-semibold">ID Card Templates</h4>
                        <p className="text-sm text-muted-foreground">
                          Customize digital ID card appearance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIdCardConfigOpen(true);
                        }}
                      >
                        Customize
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                       onClick={() => setSecurityConfigOpen(true)}>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-warning" />
                      <div>
                        <h4 className="font-semibold">Security Settings</h4>
                        <p className="text-sm text-muted-foreground">
                          Manage password policies and authentication
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-warning text-warning">
                        Review Needed
                      </Badge>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSecurityConfigOpen(true);
                        }}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                       onClick={() => setBackupConfigOpen(true)}>
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-success" />
                      <div>
                        <h4 className="font-semibold">Backup & Export</h4>
                        <p className="text-sm text-muted-foreground">
                          Schedule backups and data exports
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-success text-success">
                        Configured
                      </Badge>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBackupConfigOpen(true);
                        }}
                      >
                        Setup
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <Card className="border-primary/20 bg-gradient-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-3"
                        onClick={() => {
                          toast({
                            title: "System Status",
                            description: "All systems operational. Last check: just now",
                          });
                        }}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        System Health
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-3"
                        onClick={() => {
                          toast({
                            title: "Cache Cleared",
                            description: "System cache has been cleared successfully.",
                          });
                        }}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Clear Cache
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Configuration Dialogs */}
      <SchoolConfig 
        isOpen={schoolConfigOpen} 
        onClose={() => setSchoolConfigOpen(false)} 
      />
      <IdCardConfig 
        isOpen={idCardConfigOpen} 
        onClose={() => setIdCardConfigOpen(false)} 
      />
      <SecurityConfig 
        isOpen={securityConfigOpen} 
        onClose={() => setSecurityConfigOpen(false)} 
      />
      <BackupConfig 
        isOpen={backupConfigOpen} 
        onClose={() => setBackupConfigOpen(false)} 
      />
    </div>
  );
}