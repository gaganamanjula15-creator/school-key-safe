import { useState, useEffect } from "react";
import { Search, Plus, Users, Edit, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  student_number?: string;
  grade?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "student" as UserProfile['role'],
    student_number: "",
    grade: "",
    department: "",
    phone: "",
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data || []) as UserProfile[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.student_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('profiles')
          .update(formData)
          .eq('id', editingUser.id);

        if (error) throw error;
        toast.success('User updated successfully');
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert([formData]);

        if (error) throw error;
        toast.success('User created successfully');
      }

      fetchUsers();
      resetForm();
      setIsAddDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      role: "student",
      student_number: "",
      grade: "",
      department: "",
      phone: "",
      is_active: true,
    });
  };

  const openEditDialog = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role,
      student_number: user.student_number || "",
      grade: user.grade || "",
      department: user.department || "",
      phone: user.phone || "",
      is_active: user.is_active,
    });
    setIsAddDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'teacher': return 'bg-secondary text-secondary-foreground';
      case 'parent': return 'bg-parent-primary text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getStatsData = () => {
    const total = users.length;
    const active = users.filter(u => u.is_active).length;
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, active, byRole };
  };

  const stats = getStatsData();

  if (loading) {
    return <div className="flex-1 p-6 bg-background">Loading...</div>;
  }

  return (
    <div className="flex-1 p-6 bg-background">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <Users className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-semibold">User Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-card rounded-lg border">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <div className="text-2xl font-bold text-success">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <div className="text-2xl font-bold text-secondary">{stats.byRole.student || 0}</div>
            <div className="text-sm text-muted-foreground">Students</div>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <div className="text-2xl font-bold text-accent-foreground">{stats.byRole.teacher || 0}</div>
            <div className="text-sm text-muted-foreground">Teachers</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="parent">Parents</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setEditingUser(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="px-8">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, role: value as UserProfile['role'] }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student_number">Student Number</Label>
                      <Input
                        id="student_number"
                        value={formData.student_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, student_number: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        value={formData.grade}
                        onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
                {formData.role === 'teacher' && (
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                        {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.phone || 'N/A'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.role === 'student' && user.student_number && (
                    <div>ID: {user.student_number}</div>
                  )}
                  {user.role === 'student' && user.grade && (
                    <div>Grade: {user.grade}</div>
                  )}
                  {user.role === 'teacher' && user.department && (
                    <div>Dept: {user.department}</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}