import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Calendar, Droplets, Users, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import onboardingBg1 from '@/assets/onboarding-bg-1.png';
import onboardingBg2 from '@/assets/onboarding-bg-2.png';
import onboardingBg3 from '@/assets/onboarding-bg-3.png';
import onboardingBg4 from '@/assets/onboarding-bg-4.png';

const setupSchema = z.object({
  dob: z.string().min(1, 'Date of birth is required'),
  bloodType: z.string().min(1, 'Blood type is required'),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
});

type SetupForm = z.infer<typeof setupSchema>;

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const relationships = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];

const stepBackgrounds = [onboardingBg1, onboardingBg2, onboardingBg3, onboardingBg4];

const stepConfig = [
  {
    icon: Sparkles,
    title: "Welcome",
    subtitle: "Let's personalize your health companion",
    color: "from-sky-400/20 to-sky-100/40",
  },
  {
    icon: Calendar,
    title: "When's your birthday?",
    subtitle: "This helps us provide age-appropriate health insights",
    color: "from-amber-200/30 to-orange-100/40",
  },
  {
    icon: Droplets,
    title: "What's your blood type?",
    subtitle: "Critical information for emergency situations",
    color: "from-rose-200/30 to-pink-100/40",
  },
  {
    icon: Users,
    title: "Emergency contact",
    subtitle: "Someone we can reach in case of emergency",
    color: "from-emerald-200/30 to-teal-100/40",
  },
];

const OnboardingSetupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { user, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      dob: '',
      bloodType: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: ''
    }
  });

  const totalSteps = 4;

  const onSubmit = async (data: SetupForm) => {
    try {
      const updateData = {
        dob: data.dob,
        bloodType: data.bloodType,
        emergencyContact: data.emergencyContactName ? {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone || '',
          relationship: data.emergencyContactRelationship || ''
        } : undefined,
        isOnboardingComplete: true
      };

      await updateUser(updateData);
      navigate('/onboarding/complete');
    } catch (error) {
      console.error('Failed to complete setup:', error);
    }
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      const isValid = await form.trigger('dob');
      if (isValid) setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const isValid = await form.trigger('bloodType');
      if (isValid) setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/welcome');
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';
  const StepIcon = stepConfig[currentStep].icon;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div 
            className={`absolute inset-0 bg-gradient-to-b ${stepConfig[currentStep].color}`}
          />
          <img
            src={stepBackgrounds[currentStep]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicators */}
      <div className="absolute top-6 left-0 right-0 px-6 z-20">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
            >
              <motion.div
                className="h-full bg-primary-action"
                initial={{ width: 0 }}
                animate={{ width: i <= currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.4, delay: i === currentStep ? 0.2 : 0 }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={prevStep}
        className="absolute top-14 left-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
      >
        <ChevronRight className="h-5 w-5 rotate-180 text-text-primary" />
      </button>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col pt-24 pb-8 px-6">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentStep}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col"
          >
            {/* Step Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-4"
              >
                <StepIcon className="h-8 w-8 text-primary-action" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-text-primary mb-2"
              >
                {currentStep === 0 ? `Hi ${firstName}! 👋` : stepConfig[currentStep].title}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-text-secondary"
              >
                {stepConfig[currentStep].subtitle}
              </motion.p>
            </div>

            {/* Step Content */}
            <Form {...form}>
              <form className="flex-1 flex flex-col">
                <div className="flex-1">
                  {currentStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-action/20 to-primary-action/5 rounded-full flex items-center justify-center">
                          <span className="text-4xl">🏥</span>
                        </div>
                        <h2 className="text-lg font-semibold text-text-primary">
                          Your health, organized
                        </h2>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          We'll help you set up your health profile in just a few steps. 
                          This information helps us provide personalized care and can be 
                          critical in emergencies.
                        </p>
                        <div className="flex justify-center gap-2 pt-2">
                          {['🎂', '🩸', '👨‍👩‍👧'].map((emoji, i) => (
                            <div key={i} className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xl">
                              {emoji}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
                    >
                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Date of Birth</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="date" 
                                className="h-14 text-lg bg-white border-2 border-muted focus:border-primary-action rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="bloodType"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid grid-cols-4 gap-3">
                              {bloodTypes.map((type, index) => (
                                <motion.button
                                  key={type}
                                  type="button"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + index * 0.05 }}
                                  onClick={() => field.onChange(type)}
                                  className={`
                                    relative h-20 rounded-2xl font-bold text-lg transition-all duration-200
                                    ${field.value === type 
                                      ? 'bg-primary-action text-white shadow-lg scale-105' 
                                      : 'bg-white/80 backdrop-blur-sm text-text-primary hover:bg-white shadow-md hover:scale-102'
                                    }
                                  `}
                                >
                                  {field.value === type && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                                    >
                                      <Check className="h-4 w-4 text-white" />
                                    </motion.div>
                                  )}
                                  {type}
                                </motion.button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <p className="text-center text-sm text-text-secondary mt-4">
                        Don't know? You can update this later in settings.
                      </p>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Contact Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., John Smith"
                                className="h-12 bg-white border-2 border-muted focus:border-primary-action rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="h-12 bg-white border-2 border-muted focus:border-primary-action rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContactRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Relationship</FormLabel>
                            <div className="flex flex-wrap gap-2">
                              {relationships.map((rel) => (
                                <button
                                  key={rel}
                                  type="button"
                                  onClick={() => field.onChange(rel)}
                                  className={`
                                    px-4 py-2 rounded-full text-sm font-medium transition-all
                                    ${field.value === rel 
                                      ? 'bg-primary-action text-white' 
                                      : 'bg-muted text-text-secondary hover:bg-muted/80'
                                    }
                                  `}
                                >
                                  {rel}
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <p className="text-center text-xs text-text-secondary pt-2">
                        This is optional but highly recommended for emergencies
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-semibold rounded-2xl bg-primary-action hover:bg-primary-action/90 shadow-lg"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Setting up...
                      </span>
                    ) : currentStep === totalSteps - 1 ? (
                      <span className="flex items-center gap-2">
                        Complete Setup
                        <Check className="h-5 w-5" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Continue
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    )}
                  </Button>

                  {currentStep === 3 && (
                    <button
                      type="button"
                      onClick={() => form.handleSubmit(onSubmit)()}
                      className="w-full mt-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Skip for now
                    </button>
                  )}
                </motion.div>
              </form>
            </Form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingSetupPage;
