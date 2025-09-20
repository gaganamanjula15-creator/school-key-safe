import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, AlertCircle, Calendar as CalendarIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  grade: string;
}

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  status: string;
  notes?: string;
  classes: {
    name: string;
    subject: string;
  };
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

const attendanceStatuses = [
  { value: 'present', label: 'Present', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'excused', label: 'Excused', icon: AlertCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' }
];

export function ParentAttendanceView() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendanceRecords();
    }
  }, [selectedChild, selectedMonth]);

  const fetchChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('parent_student_relationships')
        .select(`
          profiles!inner (
            id, first_name, last_name, student_number, grade
          )
        `)
        .eq('parent_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch children information",
          variant: "destructive"
        });
        setChildren([]);
      } else {
        const childrenData = data?.map((rel: any) => rel.profiles).filter(Boolean) || [];
        setChildren(childrenData);
        if (childrenData.length > 0 && !selectedChild) {
          setSelectedChild(childrenData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!selectedChild) return;

    setLoading(true);
    
    const startDate = startOfMonth(selectedMonth);
    const endDate = endOfMonth(selectedMonth);

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          attendance_date,
          status,
          notes,
          classes (
            name,
            subject
          )
        `)
        .eq('student_id', selectedChild.id)
        .gte('attendance_date', format(startDate, 'yyyy-MM-dd'))
        .lte('attendance_date', format(endDate, 'yyyy-MM-dd'))
        .order('attendance_date', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch attendance records",
          variant: "destructive"
        });
      } else {
        setAttendanceRecords(data || []);
        calculateSummary(data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (records: AttendanceRecord[]) => {
    const summary: AttendanceSummary = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: records.length,
      percentage: 0
    };

    records.forEach(record => {
      switch (record.status) {
        case 'present':
          summary.present++;
          break;
        case 'absent':
          summary.absent++;
          break;
        case 'late':
          summary.late++;
          break;
        case 'excused':
          summary.excused++;
          break;
      }
    });

    if (summary.total > 0) {
      summary.percentage = Math.round(((summary.present + summary.late) / summary.total) * 100);
    }

    setSummary(summary);
  };

  const getStatusConfig = (status: string) => {
    return attendanceStatuses.find(s => s.value === status) || attendanceStatuses[0];
  };

  const getAttendanceTrend = () => {
    if (!summary) return null;
    
    const attendanceRate = summary.percentage;
    if (attendanceRate >= 95) return { icon: TrendingUp, color: 'text-green-600', label: 'Excellent' };
    if (attendanceRate >= 90) return { icon: TrendingUp, color: 'text-green-500', label: 'Good' };
    if (attendanceRate >= 85) return { icon: TrendingUp, color: 'text-yellow-500', label: 'Fair' };
    return { icon: TrendingDown, color: 'text-red-500', label: 'Needs Improvement' };
  };

  const trend = getAttendanceTrend();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Attendance Report</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Child Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Child</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedChild?.id || ''} 
              onValueChange={(value) => {
                const child = children.find(c => c.id === value);
                setSelectedChild(child || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.first_name} {child.last_name} - Grade {child.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Month Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedMonth}
              onSelect={(date) => date && setSelectedMonth(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Summary</CardTitle>
            <CardDescription>
              {format(selectedMonth, 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Present</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {summary.present}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Absent</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {summary.absent}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Late</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {summary.late}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Excused</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {summary.excused}
                  </Badge>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-semibold mb-2">
                    <span className="text-sm">Attendance Rate</span>
                    <Badge variant="outline">
                      {summary.percentage}%
                    </Badge>
                  </div>
                  {trend && (
                    <div className="flex items-center gap-2">
                      <trend.icon className={`w-4 h-4 ${trend.color}`} />
                      <span className={`text-sm ${trend.color}`}>{trend.label}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      {selectedChild && (
        <Card>
          <CardHeader>
            <CardTitle>
              Attendance Records - {selectedChild.first_name} {selectedChild.last_name}
            </CardTitle>
            <CardDescription>
              {format(selectedMonth, 'MMMM yyyy')} attendance details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading attendance records...</p>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No attendance records for this month</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => {
                    const statusConfig = getStatusConfig(record.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.attendance_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{record.classes.name}</TableCell>
                        <TableCell>{record.classes.subject}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                            <Badge 
                              variant="secondary" 
                              className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {record.notes || '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}