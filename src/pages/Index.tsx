import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserManagement } from "@/components/user-management";

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
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Purple Header Bar */}
        <div className="fixed top-0 left-0 right-0 h-12 bg-gradient-to-r from-purple-600 to-purple-700 z-50"></div>
        
        <AppSidebar />
        
        <main className="flex-1 pt-12">
          <UserManagement />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
