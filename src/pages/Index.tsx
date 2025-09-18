import { useState } from 'react';
import { LoginPage } from '@/components/login-page';
import { EnhancedStudentDashboard } from '@/components/enhanced-student-dashboard';
import { EnhancedTeacherDashboard } from '@/components/enhanced-teacher-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { ParentDashboard } from '@/components/dashboards/parent-dashboard';

type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

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

type User = 
  | ({ role: 'student' } & StudentData)
  | ({ role: 'teacher' } & TeacherData)  
  | ({ role: 'admin' } & AdminData)
  | ({ role: 'parent' } & ParentData);

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
    },
    parent: {
      role: 'parent',
      name: 'Jennifer Smith',
      id: 'P001',
      email: 'jennifer.smith@email.com',
      children: [
        {
          id: 'S2024001',
          name: 'Emma Smith',
          class: 'Grade 10-A',
          attendanceRate: 94,
          recentGrades: [
            { subject: 'Mathematics', grade: 'A', date: 'Sep 15, 2024' },
            { subject: 'Science', grade: 'B+', date: 'Sep 14, 2024' },
            { subject: 'English', grade: 'A-', date: 'Sep 13, 2024' },
            { subject: 'History', grade: 'B', date: 'Sep 12, 2024' },
          ],
          homeworkPending: 2,
          recentAttendance: [
            { date: 'Sep 16, 2024', status: 'present' as const },
            { date: 'Sep 15, 2024', status: 'present' as const },
            { date: 'Sep 14, 2024', status: 'present' as const },
            { date: 'Sep 13, 2024', status: 'absent' as const },
            { date: 'Sep 12, 2024', status: 'present' as const },
          ]
        },
        {
          id: 'S2024002',
          name: 'James Smith',
          class: 'Grade 8-B',
          attendanceRate: 88,
          recentGrades: [
            { subject: 'Mathematics', grade: 'B', date: 'Sep 15, 2024' },
            { subject: 'Science', grade: 'A-', date: 'Sep 14, 2024' },
            { subject: 'English', grade: 'B+', date: 'Sep 13, 2024' },
          ],
          homeworkPending: 1,
          recentAttendance: [
            { date: 'Sep 16, 2024', status: 'present' as const },
            { date: 'Sep 15, 2024', status: 'absent' as const },
            { date: 'Sep 14, 2024', status: 'present' as const },
            { date: 'Sep 13, 2024', status: 'present' as const },
            { date: 'Sep 12, 2024', status: 'present' as const },
          ]
        }
      ]
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
      case 'parent':
        return <ParentDashboard parent={currentUser} onLogout={handleLogout} />;
      case 'admin':
        return <AdminDashboard admin={currentUser} onLogout={handleLogout} />;
    }
  }

  return <LoginPage onLogin={handleLogin} />;
};

export default Index;
