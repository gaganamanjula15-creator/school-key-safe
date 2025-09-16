import { QRCodeComponent } from '@/components/ui/qr-code';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import schoolLogo from '@/assets/school-logo.png';

interface IDCardData {
  name: string;
  role: 'student' | 'teacher' | 'admin';
  id: string;
  class?: string;
  department?: string;
  photo?: string;
}

interface DigitalIDCardProps {
  data: IDCardData;
  className?: string;
}

export function DigitalIDCard({ data, className }: DigitalIDCardProps) {
  const qrData = JSON.stringify({
    id: data.id,
    name: data.name,
    role: data.role,
    timestamp: Date.now()
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'student': return 'default';
      case 'teacher': return 'secondary';
      case 'admin': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto bg-gradient-card border-2 border-primary/20 shadow-card overflow-hidden ${className}`}>
      {/* Header with school branding */}
      <div className="bg-gradient-primary p-4 text-white text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src={schoolLogo} alt="School Logo" className="w-10 h-10" />
          <div>
            <h3 className="font-bold text-lg">Digital ID</h3>
            <p className="text-xs opacity-90">Secure Identification</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-20 h-20 border-2 border-primary/20">
            <AvatarImage src={data.photo} alt={data.name} />
            <AvatarFallback className="text-lg font-semibold bg-muted">
              {data.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-bold text-lg text-foreground">{data.name}</h4>
            <Badge variant={getRoleBadgeVariant(data.role)} className="mb-2">
              {data.role.toUpperCase()}
            </Badge>
            <p className="text-sm text-muted-foreground">ID: {data.id}</p>
            {data.class && (
              <p className="text-sm text-muted-foreground">Class: {data.class}</p>
            )}
            {data.department && (
              <p className="text-sm text-muted-foreground">Dept: {data.department}</p>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="text-center border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-2">Scan for Verification</p>
          <div className="flex justify-center">
            <QRCodeComponent value={qrData} size={120} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Valid for {new Date().getFullYear()}-{new Date().getFullYear() + 1} Academic Year
          </p>
        </div>
      </CardContent>
    </Card>
  );
}