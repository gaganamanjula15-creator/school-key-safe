import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificationCode {
  id: string;
  verification_code: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

interface VerificationAttempt {
  id: string;
  verification_code: string;
  success: boolean;
  attempted_at: string;
}

export function VerificationCodeManagement() {
  const [codes, setCodes] = useState<VerificationCode[]>([]);
  const [attempts, setAttempts] = useState<VerificationAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCodes();
    fetchAttempts();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_verification_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
      toast({
        title: "Error",
        description: "Failed to load verification codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_verification_attempts')
        .select('*')
        .order('attempted_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Your Verification Codes
          </CardTitle>
          <CardDescription>
            Manage your admin verification codes for secure access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading codes...</p>
            </div>
          ) : codes.length > 0 ? (
            <div className="space-y-4">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-mono text-lg font-semibold">
                          {code.verification_code}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created: {formatDate(code.created_at)}
                          </span>
                          {code.last_used_at && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Last used: {formatDate(code.last_used_at)}
                            </span>
                          )}
                        </div>
                        {code.expires_at && (
                          <p className="text-xs text-warning mt-1">
                            Expires: {formatDate(code.expires_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={code.is_active ? "default" : "secondary"}>
                    {code.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No verification codes found. Contact the system administrator to get your code.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Verification Attempts
          </CardTitle>
          <CardDescription>
            View your recent verification attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.length > 0 ? (
            <div className="space-y-2">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {attempt.success ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    )}
                    <div>
                      <p className="font-mono text-sm">{attempt.verification_code}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(attempt.attempted_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={attempt.success ? "default" : "destructive"}>
                    {attempt.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No verification attempts yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
