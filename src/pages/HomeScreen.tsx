
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import DigitalHealthKey from '@/components/features/DigitalHealthKey';
import UpdateCard from '@/components/features/UpdateCard';
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
    <div className="min-h-screen bg-background-main font-inter">
      <Header />
      
      <main className="px-4 py-6 pb-24 space-y-6">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Hello, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-text-secondary">
            Your health information is secure and up to date
          </p>
        </div>

        {/* Digital Health Key */}
        <div className="space-y-4">
          <DigitalHealthKey user={user} />
        </div>

        {/* Update Card */}
        <div className="space-y-4">
          <UpdateCard 
            upcomingAppointment={upcomingAppointment}
            activeMedications={activeMedications}
          />
        </div>
      </main>

      <FAB />
      <BottomNavigation />
    </div>
  );
};

export default HomeScreen;
