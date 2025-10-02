import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserCircle, GraduationCap, Users, Shield, Heart, UserPlus, ChevronDown, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/theme-toggle';
import schoolLogo from '@/assets/school-logo.png';
import heroBg from '@/assets/hero-bg.jpg';

type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

interface LoginPageProps {
  onSignup: () => void;
}

export function LoginPage({ onSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const roles = [
    {
      value: 'student' as const,
      label: 'Student',
      icon: GraduationCap,
      description: 'Access your digital ID and attendance'
    },
    {
      value: 'teacher' as const,
      label: 'Teacher',
      icon: Users,
      description: 'Manage classes and track attendance'
    },
    {
      value: 'parent' as const,
      label: 'Parent',
      icon: Heart,
      description: 'Monitor your child\'s progress'
    },
    {
      value: 'admin' as const,
      label: 'Admin',
      icon: Shield,
      description: 'Full system administration access'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-primary opacity-90" />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {/* School Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={schoolLogo} alt="School Logo" className="w-16 h-16" />
            <div className="text-white">
              <h1 className="text-2xl font-bold">R/KARAGASTHALAWA DIGITAL SYSTEM</h1>
              <p className="text-sm opacity-90">Secure School Identification</p>
            </div>
          </div>
        </div>

        <Card className="shadow-elegant border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center relative">
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            <CardTitle className="text-2xl text-primary">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border/50 focus:border-primary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border/50 focus:border-primary"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-primary-light shadow-glow transition-smooth"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Don't have an account?</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/20 hover:bg-primary/10 hover:border-primary/50 justify-between"
                  >
                    <div className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create New Account
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-sm border-primary/20 shadow-elegant z-50">
                  <DropdownMenuItem 
                    onClick={onSignup}
                    className="flex items-center p-3 hover:bg-primary/10 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 mr-3 text-primary" />
                    <div>
                      <div className="font-medium">Student Account</div>
                      <div className="text-xs text-muted-foreground">Access digital ID and services</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onSignup}
                    className="flex items-center p-3 hover:bg-primary/10 cursor-pointer"
                  >
                    <Users className="w-4 h-4 mr-3 text-primary" />
                    <div>
                      <div className="font-medium">Teacher Account</div>
                      <div className="text-xs text-muted-foreground">Manage classes and attendance</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onSignup}
                    className="flex items-center p-3 hover:bg-primary/10 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 mr-3 text-primary" />
                    <div>
                      <div className="font-medium">Parent Account</div>
                      <div className="text-xs text-muted-foreground">Monitor child's progress</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="sm"
                className="w-full text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Need Help? Contact Administration
              </Button>

              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>Teachers added by administration only</p>
                <p>All accounts require approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}