import { useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Student {
  id: string;
  name: string;
  studentNumber: string;
  grade: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  hasTempPhoto: boolean;
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Alex Johnson",
    studentNumber: "STU001",
    grade: "10th",
    role: "Student",
    isActive: true,
    hasTempPhoto: true,
  },
  {
    id: "2", 
    name: "Sarah Chen",
    studentNumber: "STU002",
    grade: "11th",
    role: "Student",
    isActive: true,
    hasTempPhoto: true,
  },
  {
    id: "3",
    name: "Michael Davis",
    studentNumber: "STU003", 
    grade: "9th",
    role: "Student",
    isActive: true,
    hasTempPhoto: true,
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    studentNumber: "STU004",
    grade: "12th", 
    role: "Student",
    isActive: true,
    hasTempPhoto: true,
  },
  {
    id: "5",
    name: "David Kim",
    studentNumber: "STU005",
    grade: "10th",
    role: "Student", 
    isActive: true,
    hasTempPhoto: true,
  },
];

export function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 bg-background">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <Users className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-semibold">Student IDs</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-12 bg-muted/30 rounded-lg"></div>
          ))}
        </div>

        {/* Search and Add */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Name, ID number or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="px-8">
            Add
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Student #</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {student.studentNumber}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {student.grade}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {student.role}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Badge 
                      variant={student.isActive ? "default" : "secondary"}
                      className="bg-primary text-primary-foreground"
                    >
                      Active
                    </Badge>
                    <Badge 
                      variant="secondary"
                      className="bg-muted text-muted-foreground"
                    >
                      Temp Photo
                    </Badge>
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