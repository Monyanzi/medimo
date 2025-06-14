
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { MedicationAdherenceProvider } from '@/contexts/MedicationAdherenceContext';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import DigitalHealthKey from '@/components/features/DigitalHealthKey';
import TodaysHealthDashboard from '@/components/features/TodaysHealthDashboard';
import HealthProgress from '@/components/features/HealthProgress';
import QuickCheckIn from '@/components/features/QuickCheckIn';
import VitalTracker from '@/components/features/VitalTracker';
import FAB from '@/components/shared/FAB';
import { medicationReminderService } from '@/services/medicationReminderService';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Pill } from 'lucide-react';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { appointments, medications, isLoading } = useHealthData();
  const { addNotification } = useNotifications();

  // Generate medication reminders on load
  useEffect(() => {
    if (medications.length > 0) {
      const reminders = medicationReminderService.generateDailyReminders(medications);
      console.log('Generated reminders for today:', reminders);
    }
  }, [medications]);

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

  // Get pending medication reminders
  const pendingReminders = medicationReminderService.getPendingReminders();
  const overdueReminders = medicationReminderService.getOverdueReminders();

  const MedicationReminderCard = () => {
    if (pendingReminders.length === 0) return null;

    return (
      <Card className="bg-yellow-50 border border-yellow-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Pill className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800">
                {overdueReminders.length > 0 ? 'Overdue Medications' : 'Medication Reminders'}
              </h4>
              <p className="text-sm text-yellow-700">
                {overdueReminders.length > 0 
                  ? `${overdueReminders.length} medication${overdueReminders.length > 1 ? 's' : ''} overdue`
                  : `${pendingReminders.length} medication${pendingReminders.length > 1 ? 's' : ''} pending today`
                }
              </p>
            </div>
            <Bell className="h-5 w-5 text-yellow-600" />
          </div>
          
          <div className="mt-3 space-y-1">
            {(overdueReminders.length > 0 ? overdueReminders : pendingReminders.slice(0, 3)).map((reminder, index) => (
              <div key={index} className="text-xs text-yellow-700">
                <span className="font-medium">{reminder.medicationName}</span> - {reminder.dosage} at {reminder.scheduledTime}
              </div>
            ))}
            {pendingReminders.length > 3 && (
              <div className="text-xs text-yellow-600">
                +{pendingReminders.length - 3} more medications
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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

          {/* PRIORITY #2: Medication Reminders - Critical daily reminders */}
          <MedicationReminderCard />

          {/* PRIORITY #3: Today's Health Dashboard - Critical daily reminders */}
          <TodaysHealthDashboard 
            upcomingAppointment={upcomingAppointment}
            activeMedications={activeMedications}
          />

          {/* PRIORITY #4: Vital Signs Tracker - Show health trends over time */}
          <VitalTracker />

          {/* PRIORITY #5: Enhanced Gamification with Real Data - Combined Health Progress */}
          <HealthProgress />

          {/* PRIORITY #6: Quick Check-in */}
          <QuickCheckIn />
        </main>

        <FAB />
        <BottomNavigation />
      </div>
    </MedicationAdherenceProvider>
  );
};

export default HomeScreen;
