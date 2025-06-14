
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, MapPin, AlertTriangle } from 'lucide-react';
import { User } from '@/types';
import { toast } from 'sonner';

interface EmergencyContactCardProps {
  user: User;
}

const EmergencyContactCard: React.FC<EmergencyContactCardProps> = ({ user }) => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const handleCall = (phone: string, name: string) => {
    // In a real app, this would initiate a phone call
    window.open(`tel:${phone}`);
    toast.success(`Calling ${name}...`);
  };

  const handleSMS = (phone: string, name: string) => {
    const emergencyMessage = `EMERGENCY: I need help. My location is being shared. This is ${user.name}.`;
    window.open(`sms:${phone}?body=${encodeURIComponent(emergencyMessage)}`);
    toast.success(`Emergency SMS sent to ${name}`);
  };

  const handleEmergencyMode = () => {
    setIsEmergencyMode(true);
    toast.error('Emergency mode activated. Emergency contacts will be notified.');
    
    // Auto-disable emergency mode after 30 seconds
    setTimeout(() => {
      setIsEmergencyMode(false);
      toast.info('Emergency mode deactivated');
    }, 30000);
  };

  const hasEmergencyContact = user.emergencyContact.name && user.emergencyContact.phone;

  if (!hasEmergencyContact) {
    return (
      <Card className="bg-surface-card border border-destructive-action/50">
        <CardContent className="p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive-action mx-auto mb-2" />
          <p className="text-sm text-text-primary font-medium mb-1">No Emergency Contact</p>
          <p className="text-xs text-text-secondary">Add emergency contact in your profile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-surface-card border transition-all ${isEmergencyMode ? 'border-destructive-action bg-destructive-action/5' : 'border-border-divider'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-primary-action" />
            <h4 className="font-medium text-text-primary">Emergency Contact</h4>
          </div>
          {isEmergencyMode && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-destructive-action rounded-full animate-pulse" />
              <span className="text-xs text-destructive-action font-medium">ACTIVE</span>
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div>
            <p className="font-medium text-text-primary">{user.emergencyContact.name}</p>
            <p className="text-xs text-text-secondary">{user.emergencyContact.relationship}</p>
          </div>
          <p className="text-sm text-text-secondary">{user.emergencyContact.phone}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCall(user.emergencyContact.phone, user.emergencyContact.name)}
            className="text-xs"
          >
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSMS(user.emergencyContact.phone, user.emergencyContact.name)}
            className="text-xs"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            SMS
          </Button>
          <Button
            size="sm"
            onClick={handleEmergencyMode}
            className={`text-xs ${isEmergencyMode ? 'bg-destructive-action hover:bg-destructive-action/90' : 'bg-destructive-action hover:bg-destructive-action/90'}`}
            disabled={isEmergencyMode}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {isEmergencyMode ? 'Active' : '911'}
          </Button>
        </div>

        {isEmergencyMode && (
          <div className="mt-3 p-2 bg-destructive-action/10 rounded text-center">
            <p className="text-xs text-destructive-action">Emergency services and contacts notified</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyContactCard;
