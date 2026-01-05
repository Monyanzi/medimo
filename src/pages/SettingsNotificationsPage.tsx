
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Globe, Smartphone, Ruler, Trash2, AlertTriangle } from 'lucide-react';
import DesktopSidebar from '@/components/shared/DesktopSidebar';
import BottomNavigation from '@/components/shared/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SettingsNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, deleteCurrentAccount, isLoading } = useAuth();
  const {
    language, setLanguage,
    region, setRegion,
    timeFormat, setTimeFormat,
    dateFormat, setDateFormat,
    measurementUnit, setMeasurementUnit,
    medicationReminders, setMedicationReminders,
    appointmentReminders, setAppointmentReminders,
    vitalSignsReminders, setVitalSignsReminders,
    caregiverAlerts, setCaregiverAlerts,
    pushNotifications, setPushNotifications,
    emailNotifications, setEmailNotifications
  } = useAppSettings();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const CONFIRM_TEXT = 'DELETE';

  const handleSave = () => {
    toast.success('Settings have been saved.');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== CONFIRM_TEXT) {
      toast.error(`Please type "${CONFIRM_TEXT}" to confirm deletion`);
      return;
    }

    setIsDeleting(true);
    const result = await deleteCurrentAccount();
    setIsDeleting(false);

    if (result.success) {
      // Validate: user should be logged out, redirect to welcome
      setShowDeleteDialog(false);
      navigate('/welcome');
    }
    // Error handling is done in deleteCurrentAccount via toast
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'ar', name: 'العربية' }
  ];

  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
    { code: 'BR', name: 'Brazil' }
  ];

  return (
    <div className="min-h-screen bg-[var(--medimo-bg-primary)]">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main content with sidebar offset */}
      <div className="xl:pl-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-[var(--medimo-bg-elevated)] border-b border-[var(--medimo-border)] px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="p-2 rounded-xl hover:bg-[var(--medimo-accent-soft)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-display font-bold text-[var(--medimo-text-primary)]">Settings & Notifications</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-4 py-6 pb-28 lg:pb-8 space-y-6 max-w-3xl mx-auto lg:px-8">
          {/* Notification Settings */}
          <Card className="bg-surface-card border-border-divider">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary-action" />
                <span className="text-text-primary">Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="medReminders" className="text-base">Medication Reminders</Label>
                    <p className="text-sm text-text-secondary">
                      Get notified when it's time to take your medications
                    </p>
                  </div>
                  <Switch
                    id="medReminders"
                    checked={medicationReminders}
                    onCheckedChange={setMedicationReminders}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="apptReminders" className="text-base">Appointment Reminders</Label>
                    <p className="text-sm text-text-secondary">
                      Receive reminders for upcoming appointments
                    </p>
                  </div>
                  <Switch
                    id="apptReminders"
                    checked={appointmentReminders}
                    onCheckedChange={setAppointmentReminders}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="vitalReminders" className="text-base">Vital Signs Reminders</Label>
                    <p className="text-sm text-text-secondary">
                      Reminders to log your daily vital signs
                    </p>
                  </div>
                  <Switch
                    id="vitalReminders"
                    checked={vitalSignsReminders}
                    onCheckedChange={setVitalSignsReminders}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="caregiverAlerts" className="text-base">Caregiver Alerts</Label>
                    <p className="text-sm text-text-secondary">
                      Allow caregivers to receive health alerts
                    </p>
                  </div>
                  <Switch
                    id="caregiverAlerts"
                    checked={caregiverAlerts}
                    onCheckedChange={setCaregiverAlerts}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-text-primary mb-4">Notification Methods</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-text-secondary" />
                      <Label htmlFor="pushNotifications" className="text-base">Push Notifications</Label>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-text-secondary" />
                      <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region Settings */}
          <Card className="bg-surface-card border-border-divider">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary-action" />
                <span className="text-text-primary">Language & Region</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(reg => (
                      <SelectItem key={reg.code} value={reg.code}>
                        {reg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Format</Label>
                <Select value={timeFormat} onValueChange={setTimeFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                    <SelectItem value="24h">24-hour (14:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Measurement Units */}
          <Card className="bg-surface-card border-border-divider">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ruler className="h-5 w-5 text-primary-action" />
                <span className="text-text-primary">Measurement Units</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Unit System</Label>
                <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (kg, cm, °C)</SelectItem>
                    <SelectItem value="imperial">Imperial (lbs, in, °F)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-text-secondary mt-2">
                  {measurementUnit === 'metric' 
                    ? 'Weight in kilograms, height in centimeters, temperature in Celsius'
                    : 'Weight in pounds, height in inches, temperature in Fahrenheit'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-primary-action hover:bg-primary-action/90"
          >
            Save Settings
          </Button>

          {/* Danger Zone - Delete Account */}
          <Card className="bg-surface-card border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-text-primary">Delete Account</h4>
                <p className="text-sm text-text-secondary">
                  Permanently delete your account and all associated data including medications, 
                  appointments, documents, and health records. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="mt-2"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will permanently delete your account <strong>({user?.email})</strong> and all your data:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>All medications and reminders</li>
                <li>All appointments and timeline history</li>
                <li>All uploaded documents</li>
                <li>All vital signs and health records</li>
                <li>Emergency contacts and medical information</li>
              </ul>
              <p className="font-medium text-destructive">
                This action is irreversible and cannot be undone.
              </p>
              <div className="pt-2">
                <Label htmlFor="confirm-delete" className="text-sm font-medium">
                  Type <strong>{CONFIRM_TEXT}</strong> to confirm:
                </Label>
                <Input
                  id="confirm-delete"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder={CONFIRM_TEXT}
                  className="mt-1"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteConfirmText('')}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== CONFIRM_TEXT || isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNavigation />
    </div>
  );
};

export default SettingsNotificationsPage;
