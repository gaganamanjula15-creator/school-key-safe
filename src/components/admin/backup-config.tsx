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
import { Progress } from '@/components/ui/progress';
import { 
  HardDrive, 
  Download, 
  Upload, 
  Calendar, 
  Save, 
  X, 
  Play, 
  Clock,
  CheckCircle,
  AlertCircle,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackupConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BackupSettings {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionDays: number;
  includeFiles: boolean;
  includeUserData: boolean;
  compressBackups: boolean;
  encryptBackups: boolean;
}

interface BackupRecord {
  id: string;
  date: string;
  size: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in-progress';
}

export function BackupConfig({ isOpen, onClose }: BackupConfigProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: true,
    frequency: 'daily',
    time: '02:00',
    retentionDays: 30,
    includeFiles: true,
    includeUserData: true,
    compressBackups: true,
    encryptBackups: true
  });

  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isModified, setIsModified] = useState(false);

  const recentBackups: BackupRecord[] = [
    { id: '1', date: 'Sep 16, 2024 02:00', size: '2.4 GB', type: 'automatic', status: 'completed' },
    { id: '2', date: 'Sep 15, 2024 02:00', size: '2.3 GB', type: 'automatic', status: 'completed' },
    { id: '3', date: 'Sep 14, 2024 14:30', size: '2.2 GB', type: 'manual', status: 'completed' },
    { id: '4', date: 'Sep 14, 2024 02:00', size: '0 GB', type: 'automatic', status: 'failed' },
  ];

  const handleSettingChange = (field: keyof BackupSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsModified(true);
  };

  const handleSave = () => {
    console.log('Saving backup settings:', settings);
    toast({
      title: "Backup Settings Saved",
      description: "Backup configuration has been updated successfully.",
    });
    setIsModified(false);
  };

  const startManualBackup = () => {
    setIsBackupInProgress(true);
    setBackupProgress(0);
    
    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackupInProgress(false);
          toast({
            title: "Backup Completed",
            description: "Manual backup has been created successfully.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const downloadBackup = (backupId: string) => {
    toast({
      title: "Download Started",
      description: `Backup ${backupId} download has started.`,
    });
  };

  const exportData = (type: string) => {
    toast({
      title: "Export Started",
      description: `${type} export is being prepared for download.`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Backup & Export Configuration
          </DialogTitle>
          <DialogDescription>
            Configure automatic backups and manage data exports
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="backup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="backup">Backup Settings</TabsTrigger>
            <TabsTrigger value="history">Backup History</TabsTrigger>
            <TabsTrigger value="export">Data Export</TabsTrigger>
          </TabsList>

          {/* Backup Settings Tab */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Automatic Backup Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create system backups on schedule
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                  />
                </div>

                {settings.autoBackup && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Backup Frequency</Label>
                        <Select value={settings.frequency} onValueChange={(value) => handleSettingChange('frequency', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Backup Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={settings.time}
                          onChange={(e) => handleSettingChange('time', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retention">Backup Retention (days)</Label>
                      <Input
                        id="retention"
                        type="number"
                        min="1"
                        max="365"
                        value={settings.retentionDays}
                        onChange={(e) => handleSettingChange('retentionDays', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Backups older than this will be automatically deleted
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Include User Files</Label>
                    <p className="text-sm text-muted-foreground">
                      Include uploaded files and documents
                    </p>
                  </div>
                  <Switch
                    checked={settings.includeFiles}
                    onCheckedChange={(checked) => handleSettingChange('includeFiles', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Include User Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Include user profiles and personal data
                    </p>
                  </div>
                  <Switch
                    checked={settings.includeUserData}
                    onCheckedChange={(checked) => handleSettingChange('includeUserData', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Compress Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce backup file size with compression
                    </p>
                  </div>
                  <Switch
                    checked={settings.compressBackups}
                    onCheckedChange={(checked) => handleSettingChange('compressBackups', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Encrypt Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Protect backups with encryption
                    </p>
                  </div>
                  <Switch
                    checked={settings.encryptBackups}
                    onCheckedChange={(checked) => handleSettingChange('encryptBackups', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Backup</CardTitle>
                <CardDescription>
                  Create a backup immediately with current settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isBackupInProgress ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-sm">Backup in progress...</span>
                    </div>
                    <Progress value={backupProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">{backupProgress}% complete</p>
                  </div>
                ) : (
                  <Button onClick={startManualBackup} className="gap-2">
                    <Play className="w-4 h-4" />
                    Start Manual Backup
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Backups</CardTitle>
                <CardDescription>
                  View and manage previous backup files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBackups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(backup.status)}
                        <div>
                          <p className="font-medium">{backup.date}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{backup.size}</span>
                            <Badge variant="outline" className="text-xs">
                              {backup.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {backup.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBackup(backup.id)}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Export Options
                </CardTitle>
                <CardDescription>
                  Export specific data types for analysis or migration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center gap-3"
                    onClick={() => exportData('User Data')}
                  >
                    <Upload className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-semibold">Export User Data</div>
                      <div className="text-sm text-muted-foreground">
                        All student, teacher, and admin profiles
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center gap-3"
                    onClick={() => exportData('Attendance Records')}
                  >
                    <Calendar className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-semibold">Export Attendance</div>
                      <div className="text-sm text-muted-foreground">
                        All attendance records and statistics
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center gap-3"
                    onClick={() => exportData('Academic Records')}
                  >
                    <HardDrive className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-semibold">Export Grades</div>
                      <div className="text-sm text-muted-foreground">
                        Student grades and academic data
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center gap-3"
                    onClick={() => exportData('System Logs')}
                  >
                    <Database className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-semibold">Export System Logs</div>
                      <div className="text-sm text-muted-foreground">
                        Audit trails and system activity
                      </div>
                    </div>
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