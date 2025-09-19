import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeOverlayProps {
  isVisible: boolean;
  userName: string;
  userRole: string;
  onClose: () => void;
}

export function WelcomeOverlay({ isVisible, userName, userRole, onClose }: WelcomeOverlayProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/60 backdrop-blur-sm transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <Card 
        className={cn(
          "w-full max-w-md bg-gradient-to-br from-white to-primary/5 border-primary/20",
          "shadow-elegant transform transition-all duration-300",
          isVisible ? "animate-scale-in" : "animate-scale-out"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-8 text-center space-y-6">
          {/* Welcome Icon */}
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-primary rounded-full animate-pulse-glow"></div>
            <CheckCircle className="w-12 h-12 text-white relative z-10" />
            <Sparkles className="w-6 h-6 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>

          {/* Welcome Message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome Back!
            </h2>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">
                Hello, {userName}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                Logged in as {userRole}
              </p>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <p className="text-sm text-success-foreground">
              Successfully authenticated! Redirecting to your dashboard...
            </p>
          </div>

          {/* Continue Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-primary hover:bg-primary-light shadow-glow transition-smooth"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}