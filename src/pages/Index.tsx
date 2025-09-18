import { useState } from 'react';
import { LoginPage } from '@/components/login-page';
import { SignupPage } from '@/components/auth/SignupPage';
import { EnhancedStudentDashboard } from '@/components/enhanced-student-dashboard';
import { EnhancedTeacherDashboard } from '@/components/enhanced-teacher-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { ParentDashboard } from '@/components/dashboards/parent-dashboard';
import { useAuth } from '@/contexts/AuthContext';

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
  first_name: string;
  last_name: string;
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
  const [showSignup, setShowSignup] = useState(false);
  const { user, userProfile, loading, signOut } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show signup page
  if (showSignup) {
    return <SignupPage onBack={() => setShowSignup(false)} />;
  }

  // Render appropriate dashboard based on user role
  if (user && userProfile && userProfile.approved) {
    const userData = {
      role: userProfile.role,
      name: `${userProfile.first_name} ${userProfile.last_name}`,
      id: userProfile.student_number || userProfile.id,
      email: userProfile.email,
      ...(userProfile.role === 'student' && {
        class: userProfile.grade || 'N/A',
        attendanceRate: 92,
        recentAttendance: []
      }),
      ...(userProfile.role === 'teacher' && {
        department: userProfile.department || 'General',
        classes: []
      }),
      ...(userProfile.role === 'parent' && {
        children: []
      }),
      ...(userProfile.role === 'admin' && {
        first_name: userProfile.first_name,
        last_name: userProfile.last_name
      })
    };

    switch (userProfile.role) {
      case 'student':
        return <EnhancedStudentDashboard student={userData as any} onLogout={signOut} />;
      case 'teacher':
        return <EnhancedTeacherDashboard teacher={userData as any} onLogout={signOut} />;
      case 'parent':
        return <ParentDashboard parent={userData as any} onLogout={signOut} />;
      case 'admin':
        return <AdminDashboard admin={userData as any} onLogout={signOut} />;
    }
  }

  return <LoginPage onSignup={() => setShowSignup(true)} />;
};

export default Index;
