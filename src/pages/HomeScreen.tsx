
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { MedicationAdherenceProvider } from '@/contexts/MedicationAdherenceContext';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import DigitalHealthKey from '@/components/features/DigitalHealthKey';
import TodaysHealthDashboard from '@/components/features/TodaysHealthDashboard';
import HealthScore from '@/components/features/HealthScore';
import MedicationStreak from '@/components/features/MedicationStreak';
import QuickCheckIn from '@/components/features/QuickCheckIn';
import VitalTracker from '@/components/features/VitalTracker';
import FAB from '@/components/shared/FAB';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { appointments, medications, isLoading } = useHealthData();

  if (!user) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Loading...</h2>
          <p className="text-text-secondary">Please wait while we load your data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-main font-inter">
        <Header />
        <main className="px-4 py-6 pb-24 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Hello, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-text-secondary">Loading your health information...</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // Find the next upcoming appointment
  const now = new Date();
  const upcomingAppointment = appointments
    .filter(apt => new Date(apt.dateTime) > now)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

  // Get active medications
  const activeMedications = medications.filter(med => med.status === 'active');

  return (
    <MedicationAdherenceProvider>
      <div className="min-h-screen bg-background-main font-inter">
        <Header />
        
        <main className="px-4 py-6 pb-24 space-y-6">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Hello, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-text-secondary">
              Your health information is secure and up to date
            </p>
          </div>

          {/* PRIORITY #1: Digital Health Key - Always first */}
          <DigitalHealthKey user={user} />

          {/* PRIORITY #2: Today's Health Dashboard - Critical daily reminders */}
          <TodaysHealthDashboard 
            upcomingAppointment={upcomingAppointment}
            activeMedications={activeMedications}
          />

          {/* PRIORITY #3: Vital Signs Tracker - Show health trends over time */}
          <VitalTracker />

          {/* PRIORITY #4: Enhanced Gamification with Real Data */}
          <div className="space-y-4">
            <HealthScore />
            <MedicationStreak />
            <QuickCheckIn />
          </div>
        </main>

        <FAB />
        <BottomNavigation />
      </div>
    </MedicationAdherenceProvider>
  );
};

export default HomeScreen;
