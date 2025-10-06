import { useState, useEffect } from 'react';
import { LoginPage } from '@/components/login-page';
import { SignupPage } from '@/components/auth/SignupPage';
import { EnhancedStudentDashboard } from '@/components/enhanced-student-dashboard';
import { EnhancedTeacherDashboard } from '@/components/enhanced-teacher-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { ModeratorDashboard } from '@/components/dashboards/moderator-dashboard';
import { ParentDashboard } from '@/components/dashboards/parent-dashboard';
import { WelcomeOverlay } from '@/components/welcome-overlay';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type UserRole = 'student' | 'teacher' | 'admin' | 'moderator' | 'parent';

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

interface ModeratorData {
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
  | ({ role: 'moderator' } & ModeratorData)
  | ({ role: 'parent' } & ParentData);

const Index = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user, userProfile, loading, justLoggedIn, signOut } = useAuth();

  // Show welcome overlay when user successfully logs in
  useEffect(() => {
    if (user && userProfile && userProfile.approved && justLoggedIn && !showWelcome && !loading) {
      setShowWelcome(true);
    }
  }, [user, userProfile, loading, justLoggedIn]);

  // Handle welcome overlay close
  const handleWelcomeClose = () => {
    setIsTransitioning(true);
    setShowWelcome(false);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Handle page transitions
  const handlePageTransition = (callback: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setIsTransitioning(false);
    }, 150);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Show signup page
  if (showSignup) {
    return (
      <div className={cn(
        "transition-all duration-300 ease-out",
        isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100 animate-fade-in"
      )}>
        <SignupPage onBack={() => handlePageTransition(() => setShowSignup(false))} />
      </div>
    );
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
      }),
      ...(userProfile.role === 'moderator' && {
        first_name: userProfile.first_name,
        last_name: userProfile.last_name
      })
    };

    const DashboardComponent = () => {
      switch (userProfile.role) {
        case 'student':
          return <EnhancedStudentDashboard student={userData as any} onLogout={signOut} />;
        case 'teacher':
          return <EnhancedTeacherDashboard teacher={userData as any} onLogout={signOut} />;
        case 'parent':
          return <ParentDashboard parent={userData as any} onLogout={signOut} />;
        case 'admin':
          return <AdminDashboard admin={userData as any} onLogout={signOut} />;
        case 'moderator':
          return <ModeratorDashboard moderator={userData as any} onLogout={signOut} />;
        default:
          return null;
      }
    };

    return (
      <>
        <div className={cn(
          "transition-all duration-300 ease-out",
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100",
          !showWelcome && "animate-fade-in"
        )}>
          <DashboardComponent />
        </div>
        
        {/* Welcome Overlay */}
        <WelcomeOverlay
          isVisible={showWelcome}
          userName={`${userProfile.first_name} ${userProfile.last_name}`}
          userRole={userProfile.role}
          onClose={handleWelcomeClose}
        />
      </>
    );
  }

  return (
    <div className={cn(
      "transition-all duration-300 ease-out",
      isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100 animate-fade-in"
    )}>
      <LoginPage onSignup={() => handlePageTransition(() => setShowSignup(true))} />
    </div>
  );
};

export default Index;
