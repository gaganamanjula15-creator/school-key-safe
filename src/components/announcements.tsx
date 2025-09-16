import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Plus, 
  Calendar, 
  Users, 
  AlertCircle,
  Info,
  CheckCircle,
  Megaphone,
  Clock,
  Eye,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'academic';
  targetAudience: 'all' | 'students' | 'teachers' | 'parents';
  author: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  viewCount: number;
}

interface AnnouncementsProps {
  announcements: Announcement[];
  userRole: 'student' | 'teacher' | 'admin';
  onCreateAnnouncement?: (announcement: Omit<Announcement, 'id' | 'author' | 'createdAt' | 'viewCount'>) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export function Announcements({ 
  announcements, 
  userRole, 
  onCreateAnnouncement,
  onDeleteAnnouncement 
}: AnnouncementsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as const,
    targetAudience: 'all' as const,
    expiresAt: ''
  });
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'academic': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'destructive';
      case 'event': return 'secondary';
      case 'academic': return 'default';
      default: return 'outline';
    }
  };

  const handleCreateAnnouncement = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newAnnouncement = {
      ...formData,
      isActive: true
    };

    onCreateAnnouncement?.(newAnnouncement);
    
    // Reset form
    setFormData({
      title: '',
      content: '',
      type: 'general',
      targetAudience: 'all',
      expiresAt: ''
    });
    setShowCreateForm(false);
    
    toast({
      title: "Success!",
      description: "Announcement created successfully"
    });
  };

  const canCreateAnnouncements = userRole === 'admin' || userRole === 'teacher';
  const filteredAnnouncements = announcements
    .filter(ann => ann.isActive)
    .filter(ann => {
      if (ann.targetAudience === 'all') return true;
      if (userRole === 'admin') return true;
      // Match user role with target audience
      if (userRole === 'student' && ann.targetAudience === 'students') return true;
      if (userRole === 'teacher' && ann.targetAudience === 'teachers') return true;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Announcements</h2>
            <p className="text-muted-foreground">
              {filteredAnnouncements.length} active announcement(s)
            </p>
          </div>
        </div>
        
        {canCreateAnnouncements && (
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Create Announcement Form */}
      {showCreateForm && canCreateAnnouncements && (
        <Card className="animate-fade-in border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Create New Announcement
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select 
                  value={formData.targetAudience} 
                  onValueChange={(value: any) => setFormData({ ...formData, targetAudience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                    <SelectItem value="parents">Parents Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expires">Expires (Optional)</Label>
                <Input
                  id="expires"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your announcement content here..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateAnnouncement} className="bg-gradient-primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                Publish Announcement
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No announcements available</p>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`transition-all duration-200 hover:shadow-card animate-fade-in ${
                announcement.type === 'urgent' ? 'border-destructive/50 bg-destructive/5' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeColor(announcement.type)} className="text-xs">
                        {getTypeIcon(announcement.type)}
                        <span className="ml-1 capitalize">{announcement.type}</span>
                      </Badge>
                      {announcement.type === 'urgent' && (
                        <div className="animate-pulse-glow">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(userRole === 'admin' || userRole === 'teacher') && (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDeleteAnnouncement?.(announcement.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                  <p className="text-foreground leading-relaxed">{announcement.content}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="capitalize">{announcement.targetAudience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{announcement.viewCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    By {announcement.author}
                  </div>
                </div>
                
                {announcement.expiresAt && (
                  <div className="mt-2 text-sm text-warning flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}