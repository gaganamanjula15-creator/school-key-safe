import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Palette, Save, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IdCardConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CardDesign {
  template: 'modern' | 'classic' | 'minimal';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoPosition: 'top-left' | 'top-center' | 'top-right';
  includeQrCode: boolean;
  includeBarcode: boolean;
  backgroundColor: string;
}

interface CardFields {
  student: string[];
  teacher: string[];
  admin: string[];
}

export function IdCardConfig({ isOpen, onClose }: IdCardConfigProps) {
  const { toast } = useToast();
  const [cardDesign, setCardDesign] = useState<CardDesign>({
    template: 'modern',
    primaryColor: '#1e40af',
    secondaryColor: '#7c3aed',
    fontFamily: 'Arial',
    logoPosition: 'top-center',
    includeQrCode: true,
    includeBarcode: false,
    backgroundColor: '#ffffff'
  });

  const [cardFields, setCardFields] = useState<CardFields>({
    student: ['name', 'id', 'class', 'photo', 'qrCode'],
    teacher: ['name', 'id', 'department', 'photo', 'qrCode'],
    admin: ['name', 'id', 'title', 'photo', 'qrCode']
  });

  const [isModified, setIsModified] = useState(false);

  const availableFields = {
    student: ['name', 'id', 'class', 'grade', 'photo', 'bloodType', 'emergencyContact', 'qrCode', 'barcode'],
    teacher: ['name', 'id', 'department', 'subject', 'photo', 'phone', 'email', 'qrCode', 'barcode'],
    admin: ['name', 'id', 'title', 'department', 'photo', 'phone', 'email', 'qrCode', 'barcode']
  };

  const templates = [
    { id: 'modern', name: 'Modern', description: 'Clean design with gradients' },
    { id: 'classic', name: 'Classic', description: 'Traditional institutional look' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' }
  ];

  const fontOptions = ['Arial', 'Helvetica', 'Times New Roman', 'Roboto', 'Open Sans'];

  const handleDesignChange = (field: keyof CardDesign, value: any) => {
    setCardDesign(prev => ({ ...prev, [field]: value }));
    setIsModified(true);
  };

  const handleFieldToggle = (role: keyof CardFields, field: string) => {
    setCardFields(prev => ({
      ...prev,
      [role]: prev[role].includes(field)
        ? prev[role].filter(f => f !== field)
        : [...prev[role], field]
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    console.log('Saving ID card configuration:', { cardDesign, cardFields });
    toast({
      title: "Configuration Saved",
      description: "ID card templates have been updated successfully.",
    });
    setIsModified(false);
  };

  const handlePreview = () => {
    toast({
      title: "Preview Generated",
      description: "ID card preview would open in a new window.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            ID Card Template Configuration
          </DialogTitle>
          <DialogDescription>
            Customize the appearance and fields of digital ID cards
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="design" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">Design & Layout</TabsTrigger>
            <TabsTrigger value="fields">Card Fields</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Visual Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div className="space-y-3">
                  <Label>Card Template</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          cardDesign.template === template.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleDesignChange('template', template.id)}
                      >
                        <div className="text-center">
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={cardDesign.primaryColor}
                        onChange={(e) => handleDesignChange('primaryColor', e.target.value)}
                        className="w-12 h-10"
                      />
                      <Input
                        value={cardDesign.primaryColor}
                        onChange={(e) => handleDesignChange('primaryColor', e.target.value)}
                        placeholder="#1e40af"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={cardDesign.secondaryColor}
                        onChange={(e) => handleDesignChange('secondaryColor', e.target.value)}
                        className="w-12 h-10"
                      />
                      <Input
                        value={cardDesign.secondaryColor}
                        onChange={(e) => handleDesignChange('secondaryColor', e.target.value)}
                        placeholder="#7c3aed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={cardDesign.backgroundColor}
                        onChange={(e) => handleDesignChange('backgroundColor', e.target.value)}
                        className="w-12 h-10"
                      />
                      <Input
                        value={cardDesign.backgroundColor}
                        onChange={(e) => handleDesignChange('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>

                {/* Layout Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select value={cardDesign.fontFamily} onValueChange={(value) => handleDesignChange('fontFamily', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Logo Position</Label>
                    <Select value={cardDesign.logoPosition} onValueChange={(value) => handleDesignChange('logoPosition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-center">Top Center</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fields Tab */}
          <TabsContent value="fields" className="space-y-6">
            {Object.entries(availableFields).map(([role, fields]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="capitalize">{role} ID Cards</CardTitle>
                  <CardDescription>
                    Select which fields to include on {role} ID cards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fields.map((field) => (
                      <div
                        key={field}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          cardFields[role as keyof CardFields].includes(field)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleFieldToggle(role as keyof CardFields, field)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="capitalize text-sm">{field.replace(/([A-Z])/g, ' $1')}</span>
                          {cardFields[role as keyof CardFields].includes(field) && (
                            <Badge variant="default" className="text-xs">✓</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <CardDescription>
                  Preview how ID cards will look with current settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    ID card preview will be generated here
                  </p>
                  <Button onClick={handlePreview} className="gap-2">
                    <Eye className="w-4 h-4" />
                    Generate Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isModified}
            className={isModified ? "bg-success hover:bg-success/90 text-success-foreground" : ""}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}