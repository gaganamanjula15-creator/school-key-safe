import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Phone, Mail, MapPin, MessageSquare, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import schoolLogo from '@/assets/school-logo.png';
import heroBg from '@/assets/hero-bg.jpg';

export default function HelpPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please contact administration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created! Waiting for admin approval.",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative p-4"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-primary opacity-90" />
      
      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={schoolLogo} alt="School Logo" className="w-16 h-16" />
            <div className="text-white">
              <h1 className="text-2xl font-bold">Help & Support</h1>
              <p className="text-sm opacity-90">Contact Administration</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Contact Information */}
          <Card className="shadow-elegant border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="absolute top-4 right-4">
                <ThemeToggle />
              </div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Administration Contact
              </CardTitle>
              <CardDescription>
                Get help from our administration team
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+94 XX XXX XXXX</p>
                    <p className="text-xs text-muted-foreground mt-1">Available: Mon-Fri, 8AM-4PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">admin@karagasthalawa.edu.lk</p>
                    <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">School Address</p>
                    <p className="text-sm text-muted-foreground">
                      R/Karagasthalawa Maha Vidyalaya<br />
                      Karagasthalawa, Sri Lanka
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">Important Notice</p>
                  <p className="text-xs text-muted-foreground">
                    All new accounts require admin approval before access is granted. 
                    Please allow 24-48 hours for verification.
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </CardContent>
          </Card>

          {/* Phone Number Signup */}
          <Card className="shadow-elegant border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Sign Up with Phone
              </CardTitle>
              <CardDescription>
                Create account using your phone number
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 border border-border/50 rounded-md bg-muted/50">
                        <span className="text-sm">+94</span>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="771234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="flex-1"
                        maxLength={9}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your 9-digit phone number (without +94)
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary"
                    disabled={loading || phoneNumber.length !== 9}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-900 dark:text-amber-200">
                      <strong>Note:</strong> You will receive an SMS with a 6-digit verification code. 
                      Standard SMS charges may apply.
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      required
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Code sent to +94{phoneNumber}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </Button>

                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="w-full"
                  >
                    Change Phone Number
                  </Button>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-900 dark:text-blue-200">
                      <strong>Approval Required:</strong> Your account will be reviewed by administration. 
                      You'll be notified once approved (24-48 hours).
                    </p>
                  </div>
                </form>
              )}

              <div className="text-center text-xs text-muted-foreground">
                <p>Already have an account?</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/')}
                  className="h-auto p-0 text-primary"
                >
                  Sign in here
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
