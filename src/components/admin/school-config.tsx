import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { School, Upload, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SchoolConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  logoUrl: string;
}

export function SchoolConfig({ isOpen, onClose }: SchoolConfigProps) {
  const { toast } = useToast();
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: 'Digital Academy High School',
    address: '123 Education Street, Learning City, LC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@digitalacademy.edu',
    website: 'www.digitalacademy.edu',
    description: 'Excellence in Education Through Innovation and Technology',
    logoUrl: '/src/assets/school-logo.png'
  });

  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSchoolConfig();
    }
  }, [isOpen]);

  const loadSchoolConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('school_config')
        .select('config_value')
        .eq('config_key', 'school_info')
        .maybeSingle();

      if (error) throw error;

      if (data?.config_value) {
        setSchoolInfo(data.config_value as unknown as SchoolInfo);
      }
    } catch (error) {
      console.error('Error loading school config:', error);
      toast({
        title: "Error",
        description: "Failed to load school configuration",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof SchoolInfo, value: string) => {
    setSchoolInfo(prev => ({ ...prev, [field]: value }));
    setIsModified(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('school_config')
        .upsert({
          config_key: 'school_info',
          config_value: schoolInfo as any,
          updated_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "School information has been updated successfully.",
      });
      setIsModified(false);
    } catch (error) {
      console.error('Error saving school config:', error);
      toast({
        title: "Error",
        description: "Failed to save school configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = () => {
    // In a real app, this would handle file upload
    toast({
      title: "Logo Upload",
      description: "Logo upload functionality requires backend integration.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="w-5 h-5" />
            School Information Configuration
          </DialogTitle>
          <DialogDescription>
            Update your school's basic information and branding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Logo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">School Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <School className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Current logo: {schoolInfo.logoUrl}
                  </p>
                  <Button variant="outline" onClick={handleLogoUpload} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload New Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    value={schoolInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={schoolInfo.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="www.yourschool.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={schoolInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete school address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={schoolInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={schoolInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@yourschool.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">School Description</Label>
                <Textarea
                  id="description"
                  value={schoolInfo.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your school's mission and values"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isModified || loading}
            className={isModified ? "bg-success hover:bg-success/90 text-success-foreground" : ""}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}