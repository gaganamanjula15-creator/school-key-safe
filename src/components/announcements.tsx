import { useState, useEffect } from 'react';
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
  Trash2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'academic';
  target_audience: 'all' | 'students' | 'teachers' | 'parents';
  author_name: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  view_count: number;
}

export function Announcements() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as const,
    targetAudience: 'all' as const,
    expiresAt: ''
  });
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const userRole = userProfile?.role || 'student';

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

  // Fetch announcements
  useEffect(() => {
    fetchAnnouncements();

    // Real-time subscription
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!user || !userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to create announcements",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          type: formData.type,
          target_audience: formData.targetAudience,
          expires_at: formData.expiresAt || null,
          author_id: user.id,
          author_name: `${userProfile.first_name} ${userProfile.last_name}`.trim() || userProfile.email,
          is_active: true,
          view_count: 0
        });

      if (error) throw error;

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
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Announcement deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      });
    }
  };

  const canCreateAnnouncements = userRole === 'admin' || userRole === 'teacher';
  const filteredAnnouncements = announcements.filter(ann => {
    if (ann.target_audience === 'all') return true;
    if (userRole === 'admin') return true;
    // Match user role with target audience
    if (userRole === 'student' && ann.target_audience === 'students') return true;
    if (userRole === 'teacher' && ann.target_audience === 'teachers') return true;
    if (userRole === 'parent' && ann.target_audience === 'parents') return true;
    return false;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            disabled={submitting}
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
              <Button 
                onClick={handleCreateAnnouncement} 
                className="bg-gradient-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Publish Announcement
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                disabled={submitting}
              >
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
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
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
                      <span className="capitalize">{announcement.target_audience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{announcement.view_count} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    By {announcement.author_name}
                  </div>
                </div>
                
                {announcement.expires_at && (
                  <div className="mt-2 text-sm text-warning flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Expires: {new Date(announcement.expires_at).toLocaleDateString()}
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