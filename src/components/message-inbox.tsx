import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Inbox, Mail, MailOpen, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender: {
    first_name: string;
    last_name: string;
  };
}

export function MessageInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('inbox-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `recipient_id=eq.${supabase.auth.getUser().then(r => r.data.user?.id)}`
        },
        () => {
          fetchMessages();
          toast({
            title: "New Message",
            description: "You have received a new private message",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
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
          sender_id,
          profiles!private_messages_sender_id_fkey(first_name, last_name)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        message: msg.message,
        created_at: msg.created_at,
        is_read: msg.is_read,
        sender: {
          first_name: (msg.profiles as any)?.first_name || 'Unknown',
          last_name: (msg.profiles as any)?.last_name || 'User',
        }
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('private_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await markAsRead(message.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Private Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Your private messages are 100% confidential
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <Alert>
              <Inbox className="h-4 w-4" />
              <AlertDescription>
                No messages yet. You'll receive notifications when someone sends you a message.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Messages List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedMessage?.id === message.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {message.is_read ? (
                          <MailOpen className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Mail className="w-4 h-4 text-primary" />
                        )}
                        <span className={`font-medium text-sm ${!message.is_read ? 'text-primary' : ''}`}>
                          {message.sender.first_name} {message.sender.last_name}
                        </span>
                      </div>
                      {!message.is_read && (
                        <Badge variant="destructive" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {message.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(message.created_at)}
                    </p>
                  </button>
                ))}
              </div>

              {/* Message Content */}
              <div className="border rounded-lg p-6">
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-lg">
                        From: {selectedMessage.sender.first_name} {selectedMessage.sender.last_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(selectedMessage.created_at)}
                      </p>
                    </div>
                    <div className="py-4">
                      <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a message to read</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}