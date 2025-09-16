import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserCircle, GraduationCap, Users, Shield } from 'lucide-react';
import schoolLogo from '@/assets/school-logo.png';
import heroBg from '@/assets/hero-bg.jpg';

type UserRole = 'student' | 'teacher' | 'admin';

interface LoginPageProps {
  onLogin: (role: UserRole, credentials: { email: string; password: string }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      value: 'admin' as const,
      label: 'Admin',
      icon: Shield,
      description: 'Full system administration access'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole, { email, password });
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
              <h1 className="text-2xl font-bold">Digital ID System</h1>
              <p className="text-sm opacity-90">Secure School Identification</p>
            </div>
          </div>
        </div>

        <Card className="shadow-elegant border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Welcome Back</CardTitle>
            <CardDescription>
              Choose your role and sign in to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Select Your Role</Label>
              <div className="grid gap-2">
                {roles.map((role) => (
                  <Button
                    key={role.value}
                    variant={selectedRole === role.value ? "default" : "outline"}
                    className={`p-4 h-auto justify-start ${
                      selectedRole === role.value 
                        ? 'bg-gradient-primary border-primary/50 text-white shadow-glow' 
                        : 'hover:border-primary/50 hover:bg-accent'
                    }`}
                    onClick={() => setSelectedRole(role.value)}
                  >
                    <role.icon className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">{role.label}</div>
                      <div className="text-xs opacity-75">{role.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

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
              >
                Sign In as {roles.find(r => r.value === selectedRole)?.label}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p>Forgot your password? Contact administration</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}