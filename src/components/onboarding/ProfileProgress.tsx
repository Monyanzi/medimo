
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ProfileProgress: React.FC = () => {
  const { user } = useAuth();

  const requirements = [
    {
      id: 'basic-info',
      label: 'Basic Information',
      completed: !!(user?.name && user?.email && user?.dob && user?.bloodType)
    },
    {
      id: 'emergency-contact',
      label: 'Emergency Contact',
      completed: !!(user?.emergencyContact?.name && user?.emergencyContact?.phone)
    },
    {
      id: 'medical-info',
      label: 'Medical Conditions',
      completed: !!(user?.allergies?.length || user?.conditions?.length)
    },
    {
      id: 'qr-code',
      label: 'QR Code Generated',
      completed: !!user?.qrCode
    }
  ];

  const completedCount = requirements.filter(req => req.completed).length;
  const progressPercentage = (completedCount / requirements.length) * 100;

  if (progressPercentage === 100) {
    return null; // Hide when fully complete
  }

  return (
    <Card className="bg-surface-card border-border-divider">
      <CardHeader>
        <CardTitle className="text-text-primary text-lg">Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Progress</span>
            <span className="text-text-primary font-medium">
              {completedCount}/{requirements.length} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        <div className="space-y-2">
          {requirements.map((requirement) => (
            <div key={requirement.id} className="flex items-center space-x-3">
              {requirement.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-border-divider" />
              )}
              <span className={`text-sm ${
                requirement.completed ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                {requirement.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileProgress;
