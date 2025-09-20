import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MessageSquare, FileText, User, Bell, Settings, Heart } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ParentAttendanceView } from '@/components/parent-attendance-view';

interface ParentData {
  name: string;
  id: string;
  email: string;
}

interface ParentDashboardProps {
  parent: ParentData;
  onLogout: () => void;
}

export function ParentDashboard({ parent, onLogout }: ParentDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Parent Portal</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {parent.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="gap-2 hover:bg-destructive hover:text-destructive-foreground"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-accent/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Parent Dashboard</h3>
              <p className="text-muted-foreground">Welcome to your parent dashboard.</p>
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <ParentAttendanceView />
          </TabsContent>

          <TabsContent value="communication">
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Communication</h3>
              <p className="text-muted-foreground">Message teachers and school staff.</p>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Reports</h3>
              <p className="text-muted-foreground">View academic and attendance reports.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}