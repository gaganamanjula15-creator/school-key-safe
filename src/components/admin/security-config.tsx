import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Key, AlertTriangle, Save, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  expirationDays: number;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  ipWhitelist: string[];
  auditLogging: boolean;
  passwordPolicy: PasswordPolicy;
}

export function SecurityConfig({ isOpen, onClose }: SecurityConfigProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    ipWhitelist: [],
    auditLogging: true,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      preventReuse: 5,
      expirationDays: 90
    }
  });

  const [newIp, setNewIp] = useState('');
  const [isModified, setIsModified] = useState(false);

  const handleSettingChange = (field: keyof SecuritySettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsModified(true);
  };

  const handlePasswordPolicyChange = (field: keyof PasswordPolicy, value: any) => {
    setSettings(prev => ({
      ...prev,
      passwordPolicy: { ...prev.passwordPolicy, [field]: value }
    }));
    setIsModified(true);
  };

  const addIpToWhitelist = () => {
    if (newIp && !settings.ipWhitelist.includes(newIp)) {
      setSettings(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, newIp]
      }));
      setNewIp('');
      setIsModified(true);
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter(i => i !== ip)
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    console.log('Saving security settings:', settings);
    toast({
      title: "Security Settings Saved",
      description: "Security configuration has been updated successfully.",
    });
    setIsModified(false);
  };

  const resetToDefaults = () => {
    setSettings({
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      ipWhitelist: [],
      auditLogging: true,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        preventReuse: 5,
        expirationDays: 90
      }
    });
    setIsModified(true);
    toast({
      title: "Settings Reset",
      description: "Security settings have been reset to defaults.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings Management
          </DialogTitle>
          <DialogDescription>
            Configure authentication, access control, and security policies
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="passwords">Password Policy</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Authentication Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="480"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      min="3"
                      max="10"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.lockoutDuration}
                    onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all authentication and access events
                    </p>
                  </div>
                  <Switch
                    checked={settings.auditLogging}
                    onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Policy Tab */}
          <TabsContent value="passwords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Minimum Password Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    min="4"
                    max="50"
                    value={settings.passwordPolicy.minLength}
                    onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Character Requirements</Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="uppercase">Require Uppercase Letters</Label>
                      <Switch
                        id="uppercase"
                        checked={settings.passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) => handlePasswordPolicyChange('requireUppercase', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="lowercase">Require Lowercase Letters</Label>
                      <Switch
                        id="lowercase"
                        checked={settings.passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) => handlePasswordPolicyChange('requireLowercase', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="numbers">Require Numbers</Label>
                      <Switch
                        id="numbers"
                        checked={settings.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => handlePasswordPolicyChange('requireNumbers', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="special">Require Special Characters</Label>
                      <Switch
                        id="special"
                        checked={settings.passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) => handlePasswordPolicyChange('requireSpecialChars', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preventReuse">Prevent Password Reuse (last N passwords)</Label>
                    <Input
                      id="preventReuse"
                      type="number"
                      min="0"
                      max="24"
                      value={settings.passwordPolicy.preventReuse}
                      onChange={(e) => handlePasswordPolicyChange('preventReuse', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiration">Password Expiration (days)</Label>
                    <Input
                      id="expiration"
                      type="number"
                      min="0"
                      max="365"
                      value={settings.passwordPolicy.expirationDays}
                      onChange={(e) => handlePasswordPolicyChange('expirationDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  IP Address Whitelist
                </CardTitle>
                <CardDescription>
                  Restrict admin access to specific IP addresses (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter IP address (e.g., 192.168.1.100)"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                  />
                  <Button onClick={addIpToWhitelist} disabled={!newIp}>
                    Add IP
                  </Button>
                </div>

                {settings.ipWhitelist.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Whitelisted IP Addresses</Label>
                    <div className="flex flex-wrap gap-2">
                      {settings.ipWhitelist.map((ip) => (
                        <Badge
                          key={ip}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeIpFromWhitelist(ip)}
                        >
                          {ip}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No IP restrictions configured. Admin access allowed from any IP.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
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
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}