
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthGuard from '@/components/auth/AuthGuard';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: 'Health Tracking',
      description: 'Monitor your medications, appointments, and vital signs in one place'
    },
    {
      icon: Shield,
      title: 'Emergency Ready',
      description: 'Quick access to critical medical information when you need it most'
    },
    {
      icon: Clock,
      title: 'Never Miss a Dose',
      description: 'Smart reminders help you stay on track with your medications'
    },
    {
      icon: Users,
      title: 'Caregiver Support',
      description: 'Keep your loved ones informed and connected to your health journey'
    }
  ];

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-background-main flex flex-col">
        {/* Header */}
        <header className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-action rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">Medimo</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-text-primary">
                Welcome to Your Health Hub
              </h1>
              <p className="text-lg text-text-secondary">
                Take control of your health journey with smart tracking, reminders, and emergency preparedness.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-4 my-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-surface-card border-border-divider">
                  <CardContent className="p-4 flex items-start space-x-3">
                    <div className="bg-primary-action/10 p-2 rounded-lg flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-primary-action" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-text-primary">{feature.title}</h3>
                      <p className="text-sm text-text-secondary mt-1">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/register')}
                className="w-full bg-primary-action hover:bg-primary-action/90 text-white py-3"
              >
                Create Account
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Sign In
              </Button>
            </div>

            <p className="text-xs text-text-muted">
              Already have an account? Sign in above to access your health dashboard.
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default WelcomePage;
