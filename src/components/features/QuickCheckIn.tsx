
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heart, Smile, Frown, Meh, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';

const QuickCheckIn: React.FC = () => {
  const [mood, setMood] = useState([3]);
  const [symptoms, setSymptoms] = useState([1]);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [safetyCheckInEnabled, setSafetyCheckInEnabled] = useState(false);
  const [lastSafetyCheckIn, setLastSafetyCheckIn] = useState<Date | null>(null);
  const [safetyCheckInInterval, setSafetyCheckInInterval] = useState(24); // hours

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('safetyCheckInSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSafetyCheckInEnabled(settings.enabled || false);
      setSafetyCheckInInterval(settings.interval || 24);
      if (settings.lastCheckIn) {
        setLastSafetyCheckIn(new Date(settings.lastCheckIn));
      }
    }

    // Check if daily check-in was completed today
    const today = new Date().toDateString();
    const lastCheckIn = localStorage.getItem('lastDailyCheckIn');
    if (lastCheckIn && new Date(lastCheckIn).toDateString() === today) {
      setHasCheckedIn(true);
    }
  }, []);

  // Check if safety check-in is overdue
  const isSafetyCheckInOverdue = () => {
    if (!safetyCheckInEnabled || !lastSafetyCheckIn) return false;
    const now = new Date();
    const timeDiff = now.getTime() - lastSafetyCheckIn.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff > safetyCheckInInterval;
  };

  const getMoodIcon = (value: number) => {
    if (value >= 4) return <Smile className="h-5 w-5 text-primary-action" />;
    if (value >= 3) return <Meh className="h-5 w-5 text-accent-success" />;
    return <Frown className="h-5 w-5 text-text-secondary" />;
  };

  const getMoodLabel = (value: number) => {
    if (value >= 4) return 'Great';
    if (value >= 3) return 'Okay';
    return 'Not Good';
  };

  const getSymptomLabel = (value: number) => {
    if (value <= 1) return 'None';
    if (value <= 2) return 'Mild';
    if (value <= 3) return 'Moderate';
    return 'Severe';
  };

  const handleCheckIn = () => {
    const now = new Date();
    setHasCheckedIn(true);
    
    // Save daily check-in
    localStorage.setItem('lastDailyCheckIn', now.toISOString());
    
    // If safety check-in is enabled, update safety check-in time
    if (safetyCheckInEnabled) {
      setLastSafetyCheckIn(now);
      const settings = {
        enabled: safetyCheckInEnabled,
        interval: safetyCheckInInterval,
        lastCheckIn: now.toISOString()
      };
      localStorage.setItem('safetyCheckInSettings', JSON.stringify(settings));
    }
    
    toast.success('Check-in completed!', {
      description: safetyCheckInEnabled ? 
        'Your caregiver has been notified you are safe.' : 
        'Your health data helps track your progress.'
    });
  };

  const handleSafetyToggle = (enabled: boolean) => {
    setSafetyCheckInEnabled(enabled);
    const settings = {
      enabled,
      interval: safetyCheckInInterval,
      lastCheckIn: lastSafetyCheckIn?.toISOString() || null
    };
    localStorage.setItem('safetyCheckInSettings', JSON.stringify(settings));
    
    if (enabled) {
      toast.success('Safety check-in enabled', {
        description: 'Your caregiver will be alerted if you miss check-ins.'
      });
    }
  };

  const isOverdue = isSafetyCheckInOverdue();

  if (hasCheckedIn && !isOverdue) {
    return (
      <Card className="bg-surface-card border border-border-divider shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="text-primary-action text-3xl mb-3">✓</div>
          <h3 className="font-semibold text-text-primary mb-2">Check-in Complete!</h3>
          <p className="text-text-secondary text-sm">
            {safetyCheckInEnabled ? 
              'Your caregiver knows you are safe.' : 
              'Thanks for sharing how you\'re feeling today.'}
          </p>
          
          {/* Safety Settings */}
          <div className="mt-4 pt-4 border-t border-border-divider">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary-action" />
                <Label htmlFor="safety-mode" className="text-sm">Safety Check-in</Label>
              </div>
              <Switch
                id="safety-mode"
                checked={safetyCheckInEnabled}
                onCheckedChange={handleSafetyToggle}
              />
            </div>
            {safetyCheckInEnabled && (
              <p className="text-xs text-text-secondary mt-2">
                Next check-in due in {safetyCheckInInterval} hours
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-surface-card border shadow-sm ${isOverdue ? 'border-red-500 bg-red-50' : 'border-border-divider'}`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-primary-action" />
          <h3 className="font-semibold text-text-primary">
            {isOverdue ? 'Safety Check-in Overdue' : 'Daily Check-in'}
          </h3>
          {isOverdue && <Clock className="h-4 w-4 text-red-500" />}
        </div>

        {isOverdue && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Your caregiver may be notified if you don't check in soon.
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">How are you feeling?</label>
              <div className="flex items-center space-x-2">
                {getMoodIcon(mood[0])}
                <span className="text-sm text-text-secondary">{getMoodLabel(mood[0])}</span>
              </div>
            </div>
            <Slider
              value={mood}
              onValueChange={setMood}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">Any symptoms?</label>
              <span className="text-sm text-text-secondary">{getSymptomLabel(symptoms[0])}</span>
            </div>
            <Slider
              value={symptoms}
              onValueChange={setSymptoms}
              max={4}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Safety Check-in Settings */}
          <div className="pt-4 border-t border-border-divider">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary-action" />
                <Label htmlFor="safety-toggle" className="text-sm">Enable Safety Check-in</Label>
              </div>
              <Switch
                id="safety-toggle"
                checked={safetyCheckInEnabled}
                onCheckedChange={handleSafetyToggle}
              />
            </div>
            {safetyCheckInEnabled && (
              <p className="text-xs text-text-secondary">
                Your caregiver will be alerted if you miss check-ins
              </p>
            )}
          </div>

          <Button 
            onClick={handleCheckIn} 
            className={`w-full ${isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-action hover:bg-primary-action/90'} text-white`}
          >
            {isOverdue ? 'Complete Overdue Check-in' : 'Complete Check-in'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickCheckIn;
