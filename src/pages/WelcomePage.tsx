
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
      description: 'Monitor medications, appointments, and vitals in one place'
    },
    {
      icon: Shield,
      title: 'Emergency Ready',
      description: 'Quick access to critical medical information when needed'
    },
    {
      icon: Clock,
      title: 'Never Miss a Dose',
      description: 'Smart reminders help you stay on track'
    },
    {
      icon: Users,
      title: 'Caregiver Support',
      description: 'Keep loved ones connected to your health journey'
    }
  ];

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-[var(--medimo-bg-primary)] flex flex-col">
        {/* Header */}
        <header className="px-6 py-5 reveal-1">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-[var(--medimo-accent)] rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-[var(--medimo-text-primary)] tracking-tight">Medimo</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-md mx-auto space-y-8">
            {/* Hero Text */}
            <div className="space-y-4 reveal-2">
              <span className="text-[10px] font-mono text-[var(--medimo-accent)] uppercase tracking-[0.2em]">Personal Health Record</span>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--medimo-text-primary)] tracking-tight leading-tight">
                Your health, <span className="text-[var(--medimo-accent)]">your control.</span>
              </h1>
              <p className="text-[var(--medimo-text-secondary)] text-lg leading-relaxed">
                Take charge of your health journey with smart tracking, timely reminders, and emergency preparedness.
              </p>
            </div>

            {/* Features Grid */}
            <div className="space-y-3 reveal-3">
              {features.map((feature, index) => (
                <Card key={index} className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-xl card-hover">
                  <CardContent className="p-4 flex items-start space-x-4">
                    <div className="bg-[var(--medimo-accent-soft)] p-2.5 rounded-xl flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-[var(--medimo-accent)]" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-[var(--medimo-text-primary)]">{feature.title}</h3>
                      <p className="text-sm text-[var(--medimo-text-secondary)] mt-0.5">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 reveal-4">
              <Button
                onClick={() => navigate('/register')}
                className="w-full bg-[var(--medimo-accent)] hover:bg-[var(--medimo-accent)]/90 text-white h-12 rounded-xl font-display font-semibold text-base btn-lift"
              >
                Create Account
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full h-12 rounded-xl border-[var(--medimo-border)] hover:border-[var(--medimo-accent)] hover:bg-[var(--medimo-accent-soft)] font-display font-semibold text-base transition-colors"
              >
                Sign In
              </Button>
            </div>

            <p className="text-xs text-[var(--medimo-text-muted)] text-center reveal-5">
              Already have an account? Sign in above to access your health dashboard.
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default WelcomePage;
