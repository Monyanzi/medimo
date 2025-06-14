
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    medications: true,
    appointments: true,
    vitals: false,
    documents: true,
    reminders: true,
    emergencyAlerts: true
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-background-main font-inter">
      {/* Header */}
      <header className="bg-surface-card border-b border-border-divider px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-text-primary">Notifications</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        <Card className="bg-surface-card border-border-divider">
          <CardHeader>
            <CardTitle className="text-text-primary">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Medication Reminders</Label>
                <p className="text-sm text-text-secondary">Get notified when it's time to take your medications</p>
              </div>
              <Switch
                checked={notifications.medications}
                onCheckedChange={() => handleToggle('medications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Appointment Reminders</Label>
                <p className="text-sm text-text-secondary">Receive reminders about upcoming appointments</p>
              </div>
              <Switch
                checked={notifications.appointments}
                onCheckedChange={() => handleToggle('appointments')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Vital Signs Tracking</Label>
                <p className="text-sm text-text-secondary">Reminders to log your vital signs</p>
              </div>
              <Switch
                checked={notifications.vitals}
                onCheckedChange={() => handleToggle('vitals')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Document Updates</Label>
                <p className="text-sm text-text-secondary">Notifications about new documents or updates</p>
              </div>
              <Switch
                checked={notifications.documents}
                onCheckedChange={() => handleToggle('documents')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Health Reminders</Label>
                <p className="text-sm text-text-secondary">General health and wellness reminders</p>
              </div>
              <Switch
                checked={notifications.reminders}
                onCheckedChange={() => handleToggle('reminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Emergency Alerts</Label>
                <p className="text-sm text-text-secondary">Critical health alerts and emergency notifications</p>
              </div>
              <Switch
                checked={notifications.emergencyAlerts}
                onCheckedChange={() => handleToggle('emergencyAlerts')}
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full bg-primary-action hover:bg-primary-action/90"
          onClick={() => console.log('Saving notification settings:', notifications)}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
