
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Heart, Calendar, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OnboardingCompletePage: React.FC = () => {
  const navigate = useNavigate();

  const nextSteps = [
    {
      icon: Calendar,
      title: 'Add Your First Appointment',
      description: 'Keep track of upcoming medical appointments',
      action: () => navigate('/timeline')
    },
    {
      icon: FileText,
      title: 'Upload Medical Documents',
      description: 'Store important health documents securely',
      action: () => navigate('/vault')
    },
    {
      icon: Shield,
      title: 'Generate Emergency QR Code',
      description: 'Quick access to critical info in emergencies',
      action: () => navigate('/profile')
    }
  ];

  return (
    <div className="min-h-screen bg-background-main flex flex-col">
      <div className="flex-1 px-4 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome to Medimo!
            </h1>
            <p className="text-text-secondary">
              Your profile is set up and ready. Let's get you started with managing your health.
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-3 mt-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Recommended Next Steps
            </h2>
            
            {nextSteps.map((step, index) => (
              <Card 
                key={index} 
                className="bg-surface-card border-border-divider cursor-pointer hover:bg-surface-card/80 transition-colors"
                onClick={step.action}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="bg-primary-action/10 p-2 rounded-lg">
                    <step.icon className="h-5 w-5 text-primary-action" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-medium text-text-primary">{step.title}</h3>
                    <p className="text-sm text-text-secondary">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Action */}
          <div className="pt-6">
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-primary-action hover:bg-primary-action/90 text-white py-3"
            >
              <Heart className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          <p className="text-xs text-text-muted">
            You can always update your information later in the Profile section.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCompletePage;
