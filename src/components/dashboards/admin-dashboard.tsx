import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  School,
  Lock,
  Activity,
  Database,
  RefreshCw,
  Trash2,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Edit3
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SchoolConfig } from '@/components/admin/school-config';
import { IdCardConfig } from '@/components/admin/id-card-config';
import { SecurityConfig } from '@/components/admin/security-config';
import { BackupConfig } from '@/components/admin/backup-config';
import { UserManagement } from '@/components/user-management';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminData {
  name: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
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
  const [systemControlLoading, setSystemControlLoading] = useState(false);
  const [systemControlResult, setSystemControlResult] = useState<any>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    activeToday: 0,
    pendingApprovals: 0
  });
  const [editStatsOpen, setEditStatsOpen] = useState(false);
  const [editingStats, setEditingStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    activeToday: 0
  });
  const { toast } = useToast();

  // Check if current admin is Gagana Manjula (system owner) - using first and last name
  const isSystemOwner = (admin.name === 'Gagana Manjula') || 
                        (admin.first_name === 'Gagana' && admin.last_name === 'Manjula');

  useEffect(() => {
    fetchPendingUsers();
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const { data, error } = await supabase
        .from('system_stats')
        .select('*');

      if (error) {
        console.error('Error fetching system stats:', error);
        return;
      }

      const stats = {
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        activeToday: 0,
        pendingApprovals: pendingUsers.length
      };

      // Map database stats to component state
      data?.forEach((stat: any) => {
        switch (stat.stat_key) {
          case 'total_students':
            stats.totalStudents = stat.stat_value;
            break;
          case 'total_teachers':
            stats.totalTeachers = stat.stat_value;
            break;
          case 'total_admins':
            stats.totalAdmins = stat.stat_value;
            break;
          case 'active_today':
            stats.activeToday = stat.stat_value;
            break;
        }
      });

      stats.pendingApprovals = pendingUsers.length;
      setSystemStats(stats);
      setEditingStats({
        totalStudents: stats.totalStudents,
        totalTeachers: stats.totalTeachers,
        totalAdmins: stats.totalAdmins,
        activeToday: stats.activeToday
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const updateSystemStats = async () => {
    try {
      const updates = [
        { stat_key: 'total_students', stat_value: editingStats.totalStudents },
        { stat_key: 'total_teachers', stat_value: editingStats.totalTeachers },
        { stat_key: 'total_admins', stat_value: editingStats.totalAdmins },
        { stat_key: 'active_today', stat_value: editingStats.activeToday }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_stats')
          .upsert(update, { onConflict: 'stat_key' });

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Success",
        description: "System statistics updated successfully",
      });

      setEditStatsOpen(false);
      fetchSystemStats();
    } catch (error) {
      console.error('Error updating system stats:', error);
      toast({
        title: "Error",
        description: "Failed to update system statistics",
        variant: "destructive",
      });
    }
  };

  const fetchPendingUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending users:', error);
      return;
    }

    setPendingUsers(data || []);
  };

  const handleApproveUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "User approved successfully",
    });

    fetchPendingUsers(); // Refresh the list
  };

  const handleRejectUser = async (userId: string) => {
    // Delete the profile and this will cascade to delete the auth user
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error", 
        description: "Failed to reject user",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "User registration rejected",
    });

    fetchPendingUsers(); // Refresh the list
    fetchSystemStats(); // Refresh stats
  };

  // Check if user can edit stats (admins and moderators)  
  const canEditStats = true; // Allow all admins to edit stats

  // Mock data for stats - now loaded from database
  useEffect(() => {
    if (pendingUsers.length >= 0) {
      fetchSystemStats();
    }
  }, [pendingUsers]);

  const executeSystemControl = async (action: string, actionName: string) => {
    if (!isSystemOwner) {
      toast({
        title: "Access Denied",
        description: "Only the system owner can perform this action.",
        variant: "destructive",
      });
      return;
    }

    setSystemControlLoading(true);
    setSystemControlResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-system-control', {
        body: { 
          action,
          adminName: `${admin.first_name} ${admin.last_name}` // Send full name for verification
        }
      });

      if (error) {
        throw error;
      }

      setSystemControlResult(data.data);
      toast({
        title: "Success",
        description: `${actionName} completed successfully.`,
      });
    } catch (error) {
      console.error('System control error:', error);
      toast({
        title: "Error",
        description: `Failed to execute ${actionName}.`,
        variant: "destructive",
      });
    } finally {
      setSystemControlLoading(false);
    }
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
            <CardContent className="p-4 text-center relative">
              {canEditStats && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => setEditStatsOpen(true)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{systemStats.totalStudents}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          
          <Card className="border-secondary/20 bg-gradient-card">
            <CardContent className="p-4 text-center relative">
              {canEditStats && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => setEditStatsOpen(true)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
              <Users className="w-8 h-8 mx-auto mb-2 text-secondary" />
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="approvals">User Approvals</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            {isSystemOwner && <TabsTrigger value="control">System Control</TabsTrigger>}
          </TabsList>

          {/* User Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Pending User Registrations ({pendingUsers.length})
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
                              <p className="font-semibold">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email} • {user.role}
                                {user.role === 'student' && user.grade && ` • ${user.grade}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Registered: {new Date(user.created_at).toLocaleDateString()}
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
                            onClick={() => handleRejectUser(user.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => handleApproveUser(user.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
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
                        Ready
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIdCardConfigOpen(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                       onClick={() => setSecurityConfigOpen(true)}>
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-accent" />
                      <div>
                        <h4 className="font-semibold">Security Settings</h4>
                        <p className="text-sm text-muted-foreground">
                          Configure authentication and access controls
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
                          setSecurityConfigOpen(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                       onClick={() => setBackupConfigOpen(true)}>
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-warning" />
                      <div>
                        <h4 className="font-semibold">Backup & Recovery</h4>
                        <p className="text-sm text-muted-foreground">
                          Configure automated backups and data recovery
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
                          setBackupConfigOpen(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Control Tab - Only for System Owner */}
          {isSystemOwner && (
            <TabsContent value="control" className="space-y-6">
              <Alert className="border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Restricted Access:</strong> This section is only available to the system owner (Gagana Manjula). 
                  These actions can affect the entire system and should be used with extreme caution.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Shield className="w-5 h-5" />
                    System Control Panel
                  </CardTitle>
                  <CardDescription>
                    Advanced system operations - Use with extreme caution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border border-warning/20 rounded-lg bg-warning/5">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-warning" />
                        <div>
                          <h4 className="font-semibold">Database Maintenance</h4>
                          <p className="text-sm text-muted-foreground">
                            Perform database cleanup and optimization
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        disabled={systemControlLoading}
                        onClick={() => executeSystemControl('database_maintenance', 'Database Maintenance')}
                        className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                      >
                        {systemControlLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Execute'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-destructive" />
                        <div>
                          <h4 className="font-semibold">System Restart</h4>
                          <p className="text-sm text-muted-foreground">
                            Restart system services (causes brief downtime)
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        disabled={systemControlLoading}
                        onClick={() => executeSystemControl('system_restart', 'System Restart')}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        {systemControlLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Restart'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-destructive" />
                        <div>
                          <h4 className="font-semibold">Clear System Cache</h4>
                          <p className="text-sm text-muted-foreground">
                            Clear all system caches and temporary data
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        disabled={systemControlLoading}
                        onClick={() => executeSystemControl('clear_cache', 'Clear System Cache')}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        {systemControlLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Clear Cache'}
                      </Button>
                    </div>
                  </div>

                  {systemControlResult && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Operation Result:</h4>
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(systemControlResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

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

        {/* Edit Statistics Dialog */}
        <Dialog open={editStatsOpen} onOpenChange={setEditStatsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Edit System Statistics
              </DialogTitle>
              <DialogDescription>
                Update the system statistics displayed on the dashboard. Only visible counts will be changed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalStudents">Total Students</Label>
                  <Input
                    id="totalStudents"
                    type="number"
                    value={editingStats.totalStudents}
                    onChange={(e) => setEditingStats(prev => ({ 
                      ...prev, 
                      totalStudents: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalTeachers">Total Teachers</Label>
                  <Input
                    id="totalTeachers"
                    type="number"
                    value={editingStats.totalTeachers}
                    onChange={(e) => setEditingStats(prev => ({ 
                      ...prev, 
                      totalTeachers: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalAdmins">Total Admins</Label>
                  <Input
                    id="totalAdmins"
                    type="number"
                    value={editingStats.totalAdmins}
                    onChange={(e) => setEditingStats(prev => ({ 
                      ...prev, 
                      totalAdmins: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="activeToday">Active Today</Label>
                  <Input
                    id="activeToday"
                    type="number"
                    value={editingStats.activeToday}
                    onChange={(e) => setEditingStats(prev => ({ 
                      ...prev, 
                      activeToday: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditStatsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateSystemStats} className="bg-gradient-primary">
                Update Statistics
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}