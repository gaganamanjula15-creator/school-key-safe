import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_number: string | null;
}

interface SentMessage {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  recipient: {
    first_name: string;
    last_name: string;
  };
}

export function PrivateMessages() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchSentMessages();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, student_number')
        .eq('role', 'student')
        .eq('approved', true)
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSentMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('private_messages')
        .select(`
          id,
          message,
          created_at,
          is_read,
          recipient_id,
          profiles!private_messages_recipient_id_fkey(first_name, last_name)
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        message: msg.message,
        created_at: msg.created_at,
        is_read: msg.is_read,
        recipient: {
          first_name: (msg.profiles as any)?.first_name || '',
          last_name: (msg.profiles as any)?.last_name || '',
        }
      })) || [];
      
      setSentMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching sent messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedStudent || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a student and enter a message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedStudent,
          message: message.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setMessage('');
      setSelectedStudent('');
      fetchSentMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Send Message Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send Private Message
          </CardTitle>
          <CardDescription>
            Send a secure, private message to a student (100% confidential)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student-select">Select Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger id="student-select">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading students...</SelectItem>
                ) : students.length === 0 ? (
                  <SelectItem value="none" disabled>No students found</SelectItem>
                ) : (
                  students.map((student) => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {student.first_name} {student.last_name} 
                      {student.student_number && ` (${student.student_number})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-text">Message</Label>
            <Textarea
              id="message-text"
              placeholder="Type your private message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={sendMessage} 
            disabled={sending || !selectedStudent || !message.trim()}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Sending...' : 'Send Private Message'}
          </Button>
        </CardContent>
      </Card>

      {/* Sent Messages History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Sent Messages
          </CardTitle>
          <CardDescription>
            Your last 10 sent messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages sent yet
            </p>
          ) : (
            <div className="space-y-4">
              {sentMessages.map((msg) => (
                <div key={msg.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {msg.recipient.first_name} {msg.recipient.last_name}
                      </span>
                    </div>
                    <Badge variant={msg.is_read ? "default" : "secondary"} className="text-xs">
                      {msg.is_read ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(msg.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}