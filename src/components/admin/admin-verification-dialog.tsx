import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminVerificationDialogProps {
  isOpen: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export function AdminVerificationDialog({ isOpen, onVerified, onCancel }: AdminVerificationDialogProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.functions.invoke('verify-admin-code', {
        body: { verificationCode: verificationCode.toUpperCase().trim() }
      });

      if (verifyError || !data?.success) {
        setError(data?.error || 'Invalid verification code');
        toast({
          title: "Verification Failed",
          description: "The verification code is incorrect",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Verification Successful",
        description: `Welcome, ${data.admin.name}`,
      });

      // Smooth transition
      setTimeout(() => {
        setVerificationCode('');
        onVerified();
      }, 500);
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred during verification');
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isVerifying) {
      handleVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Admin Verification Required</DialogTitle>
              <DialogDescription>
                Enter your special admin code to continue
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Alert className="border-warning/20 bg-warning/5">
          <Lock className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This is a security measure to verify admin identity. Your verification code was provided separately.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter your code (e.g., KARAGAS2024)"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyPress={handleKeyPress}
              className="font-mono text-lg tracking-wider"
              disabled={isVerifying}
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isVerifying}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !verificationCode.trim()}
            className="flex-1"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
