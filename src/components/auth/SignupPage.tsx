import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, GraduationCap, Heart, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import schoolLogo from '@/assets/school-logo.png';
import heroBg from '@/assets/hero-bg.jpg';

interface SignupPageProps {
  onBack: () => void;
}

export function SignupPage({ onBack }: SignupPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentNumber: '',
    grade: '',
    role: 'student' as 'student' | 'parent' | 'teacher'
  });
  
  const { signUp, loading } = useAuth();

  const roles = [
    {
      value: 'student' as const,
      label: 'Student',
      icon: GraduationCap,
      description: 'Register as a student'
    },
    {
      value: 'teacher' as const,
      label: 'Teacher',
      icon: Users,
      description: 'Register as a teacher'
    },
    {
      value: 'parent' as const,
      label: 'Parent',
      icon: Heart,
      description: 'Register as a parent'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: formData.role,
      ...(formData.role === 'student' && {
        student_number: formData.studentNumber,
        grade: formData.grade
      })
    };

    const { error } = await signUp(formData.email, formData.password, userData);
    
    if (!error) {
      onBack(); // Go back to login page after successful signup
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <p className="text-sm opacity-90">Student Registration</p>
            </div>
          </div>
        </div>

        <Card className="shadow-elegant border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <CardTitle className="text-2xl text-primary">Create Account</CardTitle>
                <CardDescription>
                  Register for the school digital ID system
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">I am a:</Label>
              <div className="grid gap-2">
                {roles.map((role) => (
                  <Button
                    key={role.value}
                    variant={formData.role === role.value ? "default" : "outline"}
                    className={`p-4 h-auto justify-start ${
                      formData.role === role.value 
                        ? 'bg-gradient-primary border-primary/50 text-white shadow-glow' 
                        : 'hover:border-primary/50 hover:bg-accent'
                    }`}
                    onClick={() => handleInputChange('role', role.value)}
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
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="border-border/50 focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="border-border/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-border/50 focus:border-primary"
                  required
                />
              </div>

              {/* Student-specific fields */}
              {formData.role === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="studentNumber">Student Number</Label>
                    <Input
                      id="studentNumber"
                      placeholder="Enter student number"
                      value={formData.studentNumber}
                      onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                      className="border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade/Class</Label>
                    <Input
                      id="grade"
                      placeholder="e.g., Grade 10-A"
                      value={formData.grade}
                      onChange={(e) => handleInputChange('grade', e.target.value)}
                      className="border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="border-border/50 focus:border-primary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="border-border/50 focus:border-primary"
                  required
                />
                {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-primary-light shadow-glow transition-smooth"
                disabled={loading || formData.password !== formData.confirmPassword}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Admin Approval Required
                </Badge>
              </div>
              <p>Your account will be reviewed by administration before activation.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}