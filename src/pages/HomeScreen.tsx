
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { MedicationAdherenceProvider } from '@/contexts/MedicationAdherenceContext';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import DesktopSidebar from '@/components/shared/DesktopSidebar';
import DigitalHealthKey from '@/components/features/DigitalHealthKey';
import TodaysHealthDashboard from '@/components/features/TodaysHealthDashboard';
import VitalTracker from '@/components/features/VitalTracker';

import { medicationReminderService } from '@/services/medicationReminderService';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';


const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { appointments, medications, isLoading } = useHealthData();
  const { addNotification } = useNotifications();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentDate = () => {
    return format(new Date(), 'EEEE, MMMM d');
  };

  // Set current user on medication reminder service for proper data isolation
  useEffect(() => {
    medicationReminderService.setCurrentUser(user?.id || null);
  }, [user?.id]);

  // Generate reminders when medications change
  useEffect(() => {
    if (user && medications.length > 0) {
      medicationReminderService.generateDailyReminders(medications);
    }
  }, [user, medications]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--medimo-bg-primary)] flex items-center justify-center">
        <div className="text-center reveal-1">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[var(--medimo-accent)] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="font-display text-xl font-semibold text-[var(--medimo-text-primary)] mb-2">Loading...</h2>
          <p className="text-[var(--medimo-text-secondary)]">Please wait while we load your data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--medimo-bg-primary)]">
        <Header />
        <main className="px-4 py-6 pb-24 space-y-6 max-w-3xl mx-auto">
          <div className="text-center reveal-1">
            <h1 className="font-display text-2xl font-bold text-[var(--medimo-text-primary)] mb-2">
              Hello, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-[var(--medimo-text-secondary)]">Loading your health information...</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const now = new Date();
  const upcomingAppointment = appointments
    .filter(apt => new Date(apt.dateTime) > now)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

  const activeMedications = medications.filter(med => med.status === 'active');
  const pendingReminders = medicationReminderService.getPendingReminders();

  return (
    <MedicationAdherenceProvider>
      <div className="min-h-screen bg-[var(--medimo-bg-primary)]">
        {/* Desktop Sidebar - hidden on mobile */}
        <DesktopSidebar />

        {/* Main content with sidebar offset on desktop */}
        <div className="xl:pl-64 transition-all duration-300">
          <Header />

          <main className="px-4 py-6 pb-28 lg:pb-8 max-w-[1800px] mx-auto lg:px-10 xl:px-14">
            {/* Compact Hero Section - Horizontal on desktop */}
            <div className="relative mb-8 reveal-1">
              {/* Background gradient accent */}
              <div className="absolute -top-6 -left-4 w-24 h-24 bg-[var(--medimo-accent)]/10 rounded-full blur-3xl" />

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Greeting */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-mono text-[var(--medimo-text-muted)] uppercase tracking-[0.12em]">
                      {getCurrentDate()}
                    </span>
                  </div>

                  <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--medimo-text-primary)] tracking-tight leading-[1.15]">
                    {getGreeting()}, <span className="bg-gradient-to-r from-[var(--medimo-accent)] to-teal-500 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span>
                  </h1>

                  <p className="text-[var(--medimo-text-secondary)] text-sm md:text-base mt-2 hidden lg:block max-w-2xl">
                    {pendingReminders.length > 0 ? (
                      <>You have <span className="font-medium text-[var(--medimo-accent)]">{pendingReminders.length} pending medication{pendingReminders.length > 1 ? 's' : ''}</span>. Stay on track!</>
                    ) : (
                      <>Your health overview looks great today. All systems nominal.</>
                    )}
                  </p>

                  <p className="text-[var(--medimo-text-secondary)] text-sm md:text-base mt-1 lg:hidden">
                    {pendingReminders.length > 0 ? (
                      <>Take <span className="font-medium text-[var(--medimo-accent)]">{pendingReminders[0]?.medicationName || 'your medication'}</span> soon</>
                    ) : upcomingAppointment ? (
                      <>Next: <span className="font-medium text-[var(--medimo-text-primary)]">{upcomingAppointment.title}</span></>
                    ) : (
                      <>All caught up ✓</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Grid Layout - Optimized for full screen utilization */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-8">

              {/* Health ID Card - Left Column on Large Screens */}
              <div className="xl:col-span-4 reveal-2 h-full">
                <DigitalHealthKey user={user} medications={medications} />
              </div>

              {/* Today's Health Dashboard - Right Column - Wider work area */}
              <div className="xl:col-span-8 reveal-3 h-full">
                <TodaysHealthDashboard
                  upcomingAppointment={upcomingAppointment}
                  activeMedications={activeMedications}
                />
              </div>

              {/* Vital Signs Tracker - Full Width Bottom Row */}
              <div className="xl:col-span-12 reveal-5">
                <VitalTracker />
              </div>
            </div>
          </main>
        </div>

        <BottomNavigation />
      </div>
    </MedicationAdherenceProvider>
  );
};

export default HomeScreen;
