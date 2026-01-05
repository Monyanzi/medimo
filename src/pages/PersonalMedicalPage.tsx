
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Plus, Trash2, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import DesktopSidebar from '@/components/shared/DesktopSidebar';
import BottomNavigation from '@/components/shared/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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

const personalMedicalSchema = z.object({
  // Personal Information - only name and email required
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  dob: z.string().optional(),  // Optional - add later
  bloodType: z.string().optional(),  // Optional - add later
  organDonor: z.boolean(),

  // Medical Information
  allergies: z.array(z.object({
    value: z.string().min(1, 'Allergy cannot be empty')
  })),
  conditions: z.array(z.object({
    value: z.string().min(1, 'Condition cannot be empty')
  })),

  // Emergency Contact (optional - users can add later)
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),

  // Insurance Information (optional)
  insuranceEnabled: z.boolean().default(false),
  insurance: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    memberId: z.string()
  }).optional(),

  // Caregiver Settings
  caregiverEnabled: z.boolean().default(false),
  caregiverContact: z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string(),
    relationship: z.string()
  }).optional(),
  checkInSettings: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'twice-daily', 'custom']).default('daily'),
    reminderTime: z.string().default('09:00')
  }).optional()
});

type PersonalMedicalForm = z.infer<typeof personalMedicalSchema>;

const PersonalMedicalPage: React.FC = () => {
  const { user, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const getSafeFrequency = (freq?: string): 'daily' | 'twice-daily' | 'custom' => {
    if (freq && ['daily', 'twice-daily', 'custom'].includes(freq)) {
      return freq as 'daily' | 'twice-daily' | 'custom';
    }
    return 'daily';
  };

  const form = useForm<PersonalMedicalForm>({
    resolver: zodResolver(personalMedicalSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      dob: user?.dob || '',
      bloodType: user?.bloodType || '',
      allergies: user?.allergies?.map(allergy => ({ value: allergy })) || [],
      conditions: user?.conditions?.map(condition => ({ value: condition })) || [],
      organDonor: user?.organDonor || false,
      emergencyContact: {
        name: user?.emergencyContact?.name || '',
        phone: user?.emergencyContact?.phone || '',
        relationship: user?.emergencyContact?.relationship || ''
      },
      insuranceEnabled: !!user?.insurance,
      insurance: user?.insurance ? {
        provider: user.insurance.provider || '',
        policyNumber: user.insurance.policyNumber || '',
        memberId: user.insurance.memberId || ''
      } : undefined,
      caregiverEnabled: !!user?.caregiver,
      caregiverContact: user?.caregiver ? {
        name: user.caregiver.name || '',
        email: user.caregiver.email || '',
        phone: user.caregiver.phone || '',
        relationship: user.caregiver.relationship || 'Other'
      } : undefined,
      checkInSettings: user?.caregiver?.checkInSettings ? {
        enabled: user.caregiver.checkInSettings.enabled || false,
        frequency: getSafeFrequency(user.caregiver.checkInSettings.frequency),
        reminderTime: user.caregiver.checkInSettings.reminderTime || '09:00'
      } : {
        enabled: false,
        frequency: 'daily',
        reminderTime: '09:00'
      }
    }
  });

  const { fields: allergyFields, append: appendAllergy, remove: removeAllergy } = useFieldArray({
    control: form.control,
    name: 'allergies'
  });

  const { fields: conditionFields, append: appendCondition, remove: removeCondition } = useFieldArray({
    control: form.control,
    name: 'conditions'
  });

  const onSubmit = async (data: PersonalMedicalForm) => {
    try {
      const updateData: Partial<User> & Record<string, unknown> = {
        name: data.name,
        email: data.email,
        dob: data.dob,
        bloodType: data.bloodType,
        allergies: data.allergies.map(item => item.value).filter(Boolean),
        conditions: data.conditions.map(item => item.value).filter(Boolean),
        organDonor: data.organDonor,
      };

      // Handle emergency contact (optional)
      if (data.emergencyContact?.name || data.emergencyContact?.phone) {
        updateData.emergencyContact = {
          name: data.emergencyContact.name || '',
          phone: data.emergencyContact.phone || '',
          relationship: data.emergencyContact.relationship || ''
        };
      }

      // Handle insurance
      if (data.insuranceEnabled && data.insurance) {
        updateData.insurance = {
          provider: data.insurance.provider,
          policyNumber: data.insurance.policyNumber,
          memberId: data.insurance.memberId
        };
      } else {
        updateData.insurance = undefined;
      }

      // Handle caregiver settings
      if (data.caregiverEnabled && data.caregiverContact && data.checkInSettings) {
        updateData.caregiver = {
          name: data.caregiverContact.name,
          email: data.caregiverContact.email || '',
          phone: data.caregiverContact.phone,
          relationship: data.caregiverContact.relationship,
          isEmergencyContact: false,
          checkInSettings: {
            enabled: data.checkInSettings.enabled,
            frequency: data.checkInSettings.frequency,
            reminderTime: data.checkInSettings.reminderTime,
            missedCheckInThreshold: 2
          }
        };
      } else {
        updateData.caregiver = undefined;
      }

      await updateUser(updateData);

    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const relationships = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];
  const checkInFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'twice-daily', label: 'Twice Daily' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="min-h-screen bg-[var(--medimo-bg-primary)]">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main content with sidebar offset */}
      <div className="xl:pl-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-[var(--medimo-bg-elevated)] border-b border-[var(--medimo-border)] px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="p-2 rounded-xl hover:bg-[var(--medimo-accent-soft)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-display font-bold text-[var(--medimo-text-primary)]">Personal & Medical Info</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-4 py-6 pb-28 lg:pb-8 space-y-6 max-w-3xl mx-auto lg:px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <Card className="bg-surface-card border-border-divider">
                <CardHeader>
                  <CardTitle className="text-text-primary">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your full name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Enter your email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bloodTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organDonor"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Organ Donor</FormLabel>
                          <FormDescription>
                            Are you registered as an organ donor?
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

              {/* Medical Information */}
              <Card className="bg-surface-card border-border-divider">
                <CardHeader>
                  <CardTitle className="text-text-primary">Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <FormLabel className="text-base font-medium">Allergies</FormLabel>
                    <div className="space-y-2 mt-2">
                      {allergyFields.map((field, index) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name={`allergies.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input {...field} placeholder="Enter allergy" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAllergy(index)}
                            className="p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendAllergy({ value: '' })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Allergy
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <FormLabel className="text-base font-medium">Medical Conditions</FormLabel>
                    <div className="space-y-2 mt-2">
                      {conditionFields.map((field, index) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name={`conditions.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input {...field} placeholder="Enter medical condition" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCondition(index)}
                            className="p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendCondition({ value: '' })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="bg-surface-card border-border-divider">
                <CardHeader>
                  <CardTitle className="text-text-primary">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter contact name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="Enter phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact.relationship"
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
                </CardContent>
              </Card>

              {/* Caregiver Settings */}
              <Card className="bg-surface-card border-border-divider">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-primary-action" />
                    <span className="text-text-primary">Caregiver Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="caregiverEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Caregiver Monitoring</FormLabel>
                          <FormDescription>
                            Allow a trusted caregiver to monitor your health status
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

                  {form.watch('caregiverEnabled') && (
                    <>
                      <FormField
                        control={form.control}
                        name="caregiverContact.name"
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
                        name="caregiverContact.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Caregiver Email (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="Enter caregiver email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="caregiverContact.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Caregiver Phone</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" placeholder="Enter caregiver phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="caregiverContact.relationship"
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
                        name="checkInSettings.enabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Safety Check-ins</FormLabel>
                              <FormDescription>
                                Require regular check-ins for safety monitoring
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

                      {form.watch('checkInSettings.enabled') && (
                        <>
                          <FormField
                            control={form.control}
                            name="checkInSettings.frequency"
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
                                    {checkInFrequencies.map(freq => (
                                      <SelectItem key={freq.value} value={freq.value}>
                                        {freq.label}
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
                            name="checkInSettings.reminderTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reminder Time</FormLabel>
                                <FormControl>
                                  <Input {...field} type="time" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Insurance Information */}
              <Card className="bg-surface-card border-border-divider">
                <CardHeader>
                  <CardTitle className="text-text-primary">Insurance Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="insuranceEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Add Insurance Information</FormLabel>
                          <FormDescription>
                            Include insurance details in your profile
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

                  {form.watch('insuranceEnabled') && (
                    <>
                      <FormField
                        control={form.control}
                        name="insurance.provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Provider</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter insurance provider" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="insurance.policyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Policy Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter policy number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="insurance.memberId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Member ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter member ID" />
                            </FormControl>
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
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default PersonalMedicalPage;
