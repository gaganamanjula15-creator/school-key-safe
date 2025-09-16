import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Eye, 
  MessageSquare, 
  Star,
  Clock,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HomeworkSubmission {
  id: string;
  studentName: string;
  studentId: string;
  title: string;
  description: string;
  submittedAt: string;
  files: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  status: 'pending' | 'reviewed' | 'graded';
  grade?: number;
  feedback?: string;
  maxGrade: number;
}

interface HomeworkReviewProps {
  submissions: HomeworkSubmission[];
  onGradeSubmission: (id: string, grade: number, feedback: string) => void;
}

export function HomeworkReview({ submissions, onGradeSubmission }: HomeworkReviewProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  const filteredSubmissions = submissions.filter(sub => 
    filterStatus === 'all' || sub.status === filterStatus
  );

  const handleGradeSubmit = () => {
    if (!selectedSubmission) return;
    
    const gradeValue = parseFloat(grade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > selectedSubmission.maxGrade) {
      toast({
        title: "Invalid Grade",
        description: `Grade must be between 0 and ${selectedSubmission.maxGrade}`,
        variant: "destructive"
      });
      return;
    }

    onGradeSubmission(selectedSubmission.id, gradeValue, feedback);
    toast({
      title: "Success!",
      description: "Grade and feedback submitted successfully"
    });
    
    // Reset form
    setGrade('');
    setFeedback('');
    setSelectedSubmission(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'outline';
      case 'graded': return 'default';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'graded': return <CheckCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Homework Reviews</h2>
          <p className="text-muted-foreground">
            {submissions.length} submissions total
          </p>
        </div>
        
        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Submissions ({filteredSubmissions.length})</h3>
          
          {filteredSubmissions.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No submissions found</p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredSubmissions.map((submission) => (
                <Card 
                  key={submission.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-card hover:-translate-y-1 ${
                    selectedSubmission?.id === submission.id ? 'ring-2 ring-primary shadow-glow' : ''
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{submission.studentName}</p>
                          <p className="text-sm text-muted-foreground">{submission.studentId}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(submission.status)} className="text-xs">
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium line-clamp-1">{submission.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {submission.files.length} file(s) • Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                      
                      {submission.grade !== undefined && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-secondary" />
                          <span className="text-sm font-medium">
                            Grade: {submission.grade}/{submission.maxGrade}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Submission Details & Grading */}
        <div className="space-y-4">
          {selectedSubmission ? (
            <>
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {selectedSubmission.title}
                  </CardTitle>
                  <CardDescription>
                    By {selectedSubmission.studentName} ({selectedSubmission.studentId})
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Submission Details */}
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSubmission.description || "No description provided"}
                    </p>
                  </div>

                  {/* Files */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Files ({selectedSubmission.files.length})
                    </Label>
                    <div className="space-y-2">
                      {selectedSubmission.files.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Previous Feedback */}
                  {selectedSubmission.feedback && (
                    <div>
                      <Label className="text-sm font-medium">Previous Feedback</Label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-lg border">
                        <p className="text-sm">{selectedSubmission.feedback}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grading Section */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Grade Submission
                  </CardTitle>
                  <CardDescription>
                    Maximum grade: {selectedSubmission.maxGrade} points
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grade">Grade (0-{selectedSubmission.maxGrade})</Label>
                      <Input
                        id="grade"
                        type="number"
                        min="0"
                        max={selectedSubmission.maxGrade}
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="Enter grade"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Badge variant="outline" className="px-3 py-1">
                        Current: {selectedSubmission.grade ?? 'Not graded'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide constructive feedback for the student..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={handleGradeSubmit}
                    className="w-full bg-gradient-primary"
                    disabled={!grade.trim()}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Grade & Feedback
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Select a submission to review and grade
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}