
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Heart, Eye, EyeOff, AlertTriangle, QrCode, Phone } from 'lucide-react';
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
    <div className="min-h-screen bg-[var(--medimo-bg-primary)] flex flex-col">
      {/* Premium Header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-[var(--medimo-text-primary)]">Medimo</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-6">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold text-[var(--medimo-text-primary)]">
              Welcome Back
            </h1>
            <p className="text-[var(--medimo-text-secondary)]">
              Sign in to access your health records
            </p>
          </div>

          {/* Login Card - Premium Glassmorphism */}
          <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg text-[var(--medimo-text-primary)]">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <Alert className="border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800">
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
                            className="h-12 rounded-xl border-[var(--medimo-border)] focus:border-[var(--medimo-accent)] focus:ring-[var(--medimo-accent)] bg-[var(--medimo-bg-secondary)]"
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
                              className="h-12 rounded-xl border-[var(--medimo-border)] focus:border-[var(--medimo-accent)] focus:ring-[var(--medimo-accent)] bg-[var(--medimo-bg-secondary)] pr-12"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
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
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-teal-500/20 transition-all duration-200"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-[var(--medimo-text-secondary)]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[var(--medimo-accent)] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Emergency Access Section */}
          <div className="pt-4 border-t border-[var(--medimo-border)]">
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors group"
            >
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-rose-700 dark:text-rose-300 text-sm">Emergency Access</p>
                <p className="text-xs text-rose-600 dark:text-rose-400">View critical info without login</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Emergency Access Modal */}
      <Dialog open={emergencyModalOpen} onOpenChange={setEmergencyModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl bg-[var(--medimo-bg-elevated)] border-[var(--medimo-border)]">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-rose-500/20">
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
                className="w-full flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
              >
                <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center">
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

