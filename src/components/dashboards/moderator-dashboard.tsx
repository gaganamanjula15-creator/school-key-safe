import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Shield, 
  Users, 
  BarChart3,
  Search,
  Eye,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ModeratorData {
  name: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface ModeratorDashboardProps {
  moderator: ModeratorData;
  onLogout: () => void;
}

export function ModeratorDashboard({ moderator, onLogout }: ModeratorDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    activeToday: 0,
    pendingApprovals: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemStats();
    fetchAllUsers();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('role, is_active, approved')
        .eq('is_active', true);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const studentCount = profilesData?.filter(p => p.role === 'student').length || 0;
      const teacherCount = profilesData?.filter(p => p.role === 'teacher').length || 0;
      const adminCount = profilesData?.filter(p => p.role === 'admin').length || 0;
      const pendingCount = profilesData?.filter(p => !p.approved).length || 0;

      setSystemStats({
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalAdmins: adminCount,
        activeToday: 0,
        pendingApprovals: pendingCount
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-secondary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Moderator Portal</h1>
              <p className="text-sm text-muted-foreground">
                Content Moderator • {moderator.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" onClick={onLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* System Stats - Read Only */}
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

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">View Users</TabsTrigger>
            <TabsTrigger value="info">Access Information</TabsTrigger>
          </TabsList>

          {/* View Users Tab - Read Only */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Users (View Only)
                </CardTitle>
                <CardDescription>
                  Browse all registered users - moderators have read-only access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-semibold">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            user.role === 'admin' ? 'default' :
                            user.role === 'teacher' ? 'secondary' :
                            user.role === 'student' ? 'outline' :
                            user.role === 'moderator' ? 'default' : 'outline'
                          }>
                            {user.role}
                          </Badge>
                          <Badge variant={user.approved ? 'default' : 'destructive'}>
                            {user.approved ? 'Approved' : 'Pending'}
                          </Badge>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No users found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Information Tab */}
          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderator Access Level</CardTitle>
                <CardDescription>
                  Information about your access permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2 text-success flex items-center gap-2">
                    ✓ You Have Access To:
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• View system statistics</li>
                    <li>• Browse all user accounts</li>
                    <li>• View user information</li>
                    <li>• Monitor system activity</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg bg-destructive/10">
                  <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                    ✗ Limited Access (Admin Only):
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Approve or reject user registrations</li>
                    <li>• Modify user accounts</li>
                    <li>• Access system settings</li>
                    <li>• Manage verification codes</li>
                    <li>• Send private messages to users</li>
                    <li>• Perform bulk operations</li>
                    <li>• System control functions</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg bg-primary/10">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> If you need elevated access permissions, please contact a system administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}