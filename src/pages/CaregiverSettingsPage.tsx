
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Shield, Clock, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const caregiverSchema = z.object({
  caregiver: z.object({
    name: z.string().min(2, 'Caregiver name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required').optional().or(z.literal('')),
    relationship: z.string().min(1, 'Relationship is required'),
    isEmergencyContact: z.boolean(),
    checkInSettings: z.object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'twice-daily', 'custom']),
      customHours: z.number().min(1).max(24).optional(),
      reminderTime: z.string().optional(),
      missedCheckInThreshold: z.number().min(15).max(1440)
    }).optional()
  }).optional()
});

type CaregiverForm = z.infer<typeof caregiverSchema>;

const CaregiverSettingsPage: React.FC = () => {
  const { user, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<CaregiverForm>({
    resolver: zodResolver(caregiverSchema),
    defaultValues: {
      caregiver: user?.caregiver ? {
        name: user.caregiver.name || '',
        phone: user.caregiver.phone || '',
        email: user.caregiver.email || '',
        relationship: user.caregiver.relationship || '',
        isEmergencyContact: user.caregiver.isEmergencyContact || false,
        checkInSettings: {
          enabled: user.caregiver.checkInSettings?.enabled || false,
          frequency: user.caregiver.checkInSettings?.frequency || 'daily',
          customHours: user.caregiver.checkInSettings?.customHours || 24,
          reminderTime: user.caregiver.checkInSettings?.reminderTime || '09:00',
          missedCheckInThreshold: user.caregiver.checkInSettings?.missedCheckInThreshold || 60
        }
      } : undefined
    }
  });

  const checkInEnabled = form.watch('caregiver.checkInSettings.enabled');
  const frequency = form.watch('caregiver.checkInSettings.frequency');

  const onSubmit = async (data: CaregiverForm) => {
    try {
      if (data.caregiver) {
        await updateUser({
          caregiver: {
            name: data.caregiver.name!,
            phone: data.caregiver.phone!,
            email: data.caregiver.email,
            relationship: data.caregiver.relationship!,
            isEmergencyContact: data.caregiver.isEmergencyContact!,
            checkInSettings: data.caregiver.checkInSettings ? {
              enabled: data.caregiver.checkInSettings.enabled!,
              frequency: data.caregiver.checkInSettings.frequency!,
              customHours: data.caregiver.checkInSettings.customHours,
              reminderTime: data.caregiver.checkInSettings.reminderTime,
              missedCheckInThreshold: data.caregiver.checkInSettings.missedCheckInThreshold!
            } : undefined
          }
        });
        toast.success('Caregiver settings updated successfully');
      }
    } catch (error) {
      console.error('Failed to update caregiver settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const relationships = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Professional Caregiver', 'Other'];

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
          <h1 className="text-lg font-bold text-text-primary">Caregiver Settings</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Caregiver Information */}
            <Card className="bg-surface-card border-border-divider">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary-action" />
                  <span className="text-text-primary">Caregiver Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="caregiver.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caregiver Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter caregiver name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caregiver.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>Phone Number</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="Enter phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caregiver.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>Email (Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caregiver.relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {relationships.map(relationship => (
                            <SelectItem key={relationship} value={relationship}>
                              {relationship}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caregiver.isEmergencyContact"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Emergency Contact</FormLabel>
                        <FormDescription>
                          Use this caregiver as your emergency contact
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Check-in Settings */}
            <Card className="bg-surface-card border-border-divider">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary-action" />
                  <span className="text-text-primary">Safety Check-in Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="caregiver.checkInSettings.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Safety Check-ins</FormLabel>
                        <FormDescription>
                          Your caregiver will be notified if you miss check-ins
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {checkInEnabled && (
                  <>
                    <FormField
                      control={form.control}
                      name="caregiver.checkInSettings.frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Once Daily</SelectItem>
                              <SelectItem value="twice-daily">Twice Daily</SelectItem>
                              <SelectItem value="custom">Custom Hours</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {frequency === 'custom' && (
                      <FormField
                        control={form.control}
                        name="caregiver.checkInSettings.customHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Hours</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="1" 
                                max="24"
                                placeholder="Enter hours between check-ins"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Number of hours between required check-ins (1-24)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="caregiver.checkInSettings.reminderTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Reminder Time</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormDescription>
                            When to remind you to check in each day
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="caregiver.checkInSettings.missedCheckInThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alert Threshold (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="15" 
                              max="1440"
                              placeholder="Minutes before alerting caregiver"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            How long to wait before alerting your caregiver (15-1440 minutes)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-primary-action hover:bg-primary-action/90"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Caregiver Settings'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CaregiverSettingsPage;
