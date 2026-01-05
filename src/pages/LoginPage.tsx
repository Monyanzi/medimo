
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Heart, Eye, EyeOff, AlertTriangle, Phone, Shield, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import DigitalEmergencyCard from '@/components/features/DigitalEmergencyCard';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contextLogin(data.email, data.password);

      if (response.success && response.user) {
        if (response.user.isOnboardingComplete) {
          navigate('/');
        } else {
          navigate('/onboarding/setup');
        }
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-teal-950" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-200/30 to-transparent dark:from-teal-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-200/30 to-transparent dark:from-emerald-800/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      
      {/* Floating Medical Icons - Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.02]">
        <div className="absolute top-[10%] left-[15%] text-6xl">💊</div>
        <div className="absolute top-[20%] right-[20%] text-5xl">🩺</div>
        <div className="absolute bottom-[30%] left-[10%] text-4xl">❤️</div>
        <div className="absolute bottom-[15%] right-[15%] text-5xl">🏥</div>
        <div className="absolute top-[50%] left-[50%] text-4xl">📋</div>
      </div>

      {/* Header */}
      <header className="relative px-6 py-5 flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25 transition-transform hover:scale-105">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-[var(--medimo-text-primary)]">Medimo</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-6 py-8 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-6">
          {/* Welcome Section - Enhanced */}
          <div className="text-center space-y-3 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100/80 dark:bg-teal-900/40 rounded-full text-xs font-medium text-teal-700 dark:text-teal-300 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Your Health, Your Control
            </div>
            <h1 className="font-display text-3xl font-bold text-[var(--medimo-text-primary)]">
              Welcome Back
            </h1>
            <p className="text-[var(--medimo-text-secondary)]">
              Sign in to access your health records
            </p>
          </div>

          {/* Login Card - Enhanced with better elevation */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-black/5 animate-slide-up delay-75">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg text-[var(--medimo-text-primary)] flex items-center gap-2">
                <Lock className="h-4 w-4 text-[var(--medimo-accent)]" />
                Sign In
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <Alert className="border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 animate-scale-in">
                      <AlertDescription className="text-rose-700 dark:text-rose-300 text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--medimo-text-secondary)]">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            className="h-12 rounded-xl border-[var(--medimo-border)] focus:border-[var(--medimo-accent)] focus:ring-[var(--medimo-accent)] bg-white/70 dark:bg-slate-900/50 transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--medimo-text-secondary)]">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              className="h-12 rounded-xl border-[var(--medimo-border)] focus:border-[var(--medimo-accent)] focus:ring-[var(--medimo-accent)] bg-white/70 dark:bg-slate-900/50 pr-12 transition-all duration-200"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent transition-transform active:scale-90"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-[var(--medimo-text-muted)]" />
                              ) : (
                                <Eye className="h-4 w-4 text-[var(--medimo-text-muted)]" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-teal-500/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Register Link */}
          <div className="text-center animate-slide-up delay-150">
            <p className="text-sm text-[var(--medimo-text-secondary)]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[var(--medimo-accent)] font-semibold hover:underline underline-offset-2 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-6 py-4 animate-slide-up delay-225">
            <div className="flex items-center gap-1.5 text-xs text-[var(--medimo-text-muted)]">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>HIPAA Ready</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--medimo-border)]" />
            <div className="flex items-center gap-1.5 text-xs text-[var(--medimo-text-muted)]">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>256-bit Encrypted</span>
            </div>
          </div>

          {/* Emergency Access Section - Enhanced */}
          <div className="pt-2 animate-slide-up delay-300">
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-rose-700 dark:text-rose-300 text-sm">Emergency Access</p>
                <p className="text-xs text-rose-600 dark:text-rose-400">View critical info without login</p>
              </div>
              <svg className="w-5 h-5 text-rose-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Emergency Access Modal */}
      <Dialog open={emergencyModalOpen} onOpenChange={setEmergencyModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-[var(--medimo-border)]">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-rose-500/25 animate-scale-in">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="font-display text-xl text-[var(--medimo-text-primary)]">
              Emergency Access
            </DialogTitle>
            <DialogDescription className="text-[var(--medimo-text-secondary)]">
              Critical medical information for emergency responders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            {/* Digital Emergency Card - Shows data from localStorage */}
            <DigitalEmergencyCard />

            {/* Divider */}
            <div className="border-t border-[var(--medimo-border)] pt-4">
              {/* Emergency Services Call */}
              <a
                href="tel:911"
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/30 border border-rose-200 dark:border-rose-800 rounded-xl hover:shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-rose-700 dark:text-rose-300">Call Emergency Services</p>
                  <p className="text-xs text-rose-600 dark:text-rose-400">Dial 911 (or local equivalent)</p>
                </div>
              </a>
            </div>

            {/* Physical Card Reminder */}
            <div className="text-center pt-2">
              <p className="text-xs text-[var(--medimo-text-muted)]">
                No data displayed? Ask patient for physical Medimo wallet card.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;

