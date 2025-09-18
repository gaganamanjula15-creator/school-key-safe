import { 
  Home, 
  Users, 
  GraduationCap, 
  Calendar, 
  FileText, 
  Settings, 
  HelpCircle, 
  UserCheck,
  BarChart3
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", icon: Home },
  { title: "Students", icon: Users },
  { title: "Teachers", icon: GraduationCap },
  { title: "Classes", icon: Calendar },
  { title: "Reports", icon: BarChart3 },
  { title: "Documents", icon: FileText },
  { title: "Attendance", icon: UserCheck },
  { title: "Settings", icon: Settings },
  { title: "Help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-20"} collapsible="icon">
      <SidebarContent className="bg-background border-r">
        <div className="p-4 border-b">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded text-primary-foreground flex items-center justify-center font-bold text-lg">
              M
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className="w-full h-12 flex items-center justify-center hover:bg-muted/50 rounded-lg mx-2 my-1"
                    tooltip={item.title}
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}