import { useState } from 'react';
import { LoginPage } from '@/components/login-page';
import { EnhancedStudentDashboard } from '@/components/enhanced-student-dashboard';
import { EnhancedTeacherDashboard } from '@/components/enhanced-teacher-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';

type UserRole = 'student' | 'teacher' | 'admin';

interface StudentData {
  name: string;
  id: string;
  class: string;
  email: string;
  photo?: string;
  attendanceRate: number;
  recentAttendance: { date: string; status: 'present' | 'absent' }[];
}

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

interface AdminData {
  name: string;
  id: string;
  email: string;
}

type User = 
  | ({ role: 'student' } & StudentData)
  | ({ role: 'teacher' } & TeacherData)  
  | ({ role: 'admin' } & AdminData);

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Mock user data - in real app, this would come from authentication
  const mockUsers: Record<UserRole, User> = {
    student: {
      role: 'student',
      name: 'Alice Johnson',
      id: 'S2024001',
      email: 'alice.johnson@school.edu',
      class: 'Grade 10-A',
      photo: undefined,
      attendanceRate: 92,
      recentAttendance: [
        { date: 'Sep 16, 2024', status: 'present' as const },
        { date: 'Sep 15, 2024', status: 'present' as const },
        { date: 'Sep 14, 2024', status: 'absent' as const },
        { date: 'Sep 13, 2024', status: 'present' as const },
        { date: 'Sep 12, 2024', status: 'present' as const },
      ]
    },
    teacher: {
      role: 'teacher',
      name: 'Dr. Sarah Wilson',
      id: 'T001',
      email: 'sarah.wilson@school.edu',
      department: 'Mathematics',
      classes: [
        { id: 'C001', name: 'Advanced Calculus - Grade 12', students: 28, schedule: 'Mon, Wed, Fri 10:00 AM' },
        { id: 'C002', name: 'Algebra II - Grade 10', students: 32, schedule: 'Tue, Thu 2:00 PM' },
        { id: 'C003', name: 'Statistics - Grade 11', students: 24, schedule: 'Mon, Wed 1:00 PM' },
      ]
    },
    admin: {
      role: 'admin',
      name: 'Michael Chen',
      id: 'A001',
      email: 'admin@school.edu'
    }
  };

  const handleLogin = (role: UserRole, credentials: { email: string; password: string }) => {
    // Mock authentication - in real app, this would verify credentials
    console.log('Logging in:', { role, ...credentials });
    
    // Simulate successful login
    setCurrentUser(mockUsers[role]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Render appropriate dashboard based on user role
  if (currentUser) {
    switch (currentUser.role) {
      case 'student':
        return <EnhancedStudentDashboard student={currentUser} onLogout={handleLogout} />;
      case 'teacher':
        return <EnhancedTeacherDashboard teacher={currentUser} onLogout={handleLogout} />;
      case 'admin':
        return <AdminDashboard admin={currentUser} onLogout={handleLogout} />;
    }
  }

  return <LoginPage onLogin={handleLogin} />;
};

export default Index;
