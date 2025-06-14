
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Appointment, Medication } from '@/types';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Pill, CheckCircle, RotateCcw } from 'lucide-react';
import AppointmentDetailModal from '@/components/modals/AppointmentDetailModal';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

interface UpdateCardProps {
  upcomingAppointment?: Appointment;
  activeMedications: Medication[];
}

const UpdateCard: React.FC<UpdateCardProps> = ({ 
  upcomingAppointment, 
  activeMedications 
}) => {
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [takenMedications, setTakenMedications] = useState<Set<string>>(new Set());
  const { addNotification } = useNotifications();

  const handleViewAppointmentDetails = () => {
    if (upcomingAppointment) {
      setAppointmentModalOpen(true);
    }
  };

  const handleReschedule = () => {
    toast.info('Reschedule functionality would open appointment edit modal');
    // In a real app, this would open an appointment reschedule modal
  };

  const handleMarkTaken = (medicationId: string, medicationName: string) => {
    setTakenMedications(prev => new Set([...prev, medicationId]));
    toast.success(`Marked ${medicationName} as taken`);
    
    // Add notification for successful medication taking
    addNotification({
      title: 'Medication Taken',
      message: `${medicationName} marked as taken`,
      type: 'medication',
      relatedId: medicationId
    });
  };

  const handleSnooze = (medicationName: string) => {
    toast.info(`Snoozed reminder for ${medicationName} for 30 minutes`);
    // In a real app, this would set a new reminder
  };

  // Show different content based on what data is available
  const hasUpcomingAppointment = !!upcomingAppointment;
  const hasMedicationReminders = activeMedications.length > 0;

  if (!hasUpcomingAppointment && !hasMedicationReminders) {
    return (
      <Card className="bg-surface-card border border-border-divider">
        <CardContent className="p-6 text-center">
          <div className="text-accent-success mb-2">
            <CheckCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            All caught up! 🎉
          </h3>
          <p className="text-text-secondary">
            No upcoming appointments or medication reminders at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Upcoming Appointment Card */}
        {hasUpcomingAppointment && (
          <Card className="bg-surface-card border border-border-divider">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-action/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary-action" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      Upcoming Appointment
                    </h3>
                    <p className="text-text-secondary text-sm">Next scheduled visit</p>
                  </div>
                </div>
                <Badge className="bg-primary-action/10 text-primary-action">
                  Scheduled
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="font-medium text-text-primary">{upcomingAppointment.title}</p>
                  <p className="text-sm text-text-secondary">with {upcomingAppointment.doctorName}</p>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-text-secondary" />
                  <span className="text-text-secondary">
                    {format(parseISO(upcomingAppointment.dateTime), 'EEEE, MMMM d, yyyy • h:mm a')}
                  </span>
                </div>
                
                <div className="text-sm text-text-secondary">
                  📍 {upcomingAppointment.location}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleViewAppointmentDetails}
                  className="flex-1 bg-primary-action hover:bg-primary-action/90"
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReschedule}
                  className="flex-1"
                >
                  Reschedule
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medication Reminders Card */}
        {hasMedicationReminders && (
          <Card className="bg-surface-card border border-border-divider">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-accent-success/10 rounded-lg">
                  <Pill className="h-5 w-5 text-accent-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Medication Reminders
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {activeMedications.length} active medication{activeMedications.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {activeMedications.slice(0, 2).map((medication) => {
                  const isTaken = takenMedications.has(medication.id);
                  
                  return (
                    <div 
                      key={medication.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isTaken 
                          ? 'bg-accent-success/10 border-accent-success/20' 
                          : 'bg-surface-secondary border-border-divider'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-text-primary flex items-center gap-2">
                            {medication.name} {medication.dosage}
                            {isTaken && <CheckCircle className="h-4 w-4 text-accent-success" />}
                          </p>
                          <p className="text-sm text-text-secondary">{medication.frequency}</p>
                        </div>
                      </div>
                      
                      {!isTaken && (
                        <div className="flex space-x-2 mt-3">
                          <Button 
                            size="sm"
                            onClick={() => handleMarkTaken(medication.id, medication.name)}
                            className="flex-1 bg-accent-success hover:bg-accent-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Taken
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleSnooze(medication.name)}
                            className="flex-1"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Snooze
                          </Button>
                        </div>
                      )}
                      
                      {isTaken && (
                        <div className="mt-2 text-sm text-accent-success">
                          ✓ Taken today
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {activeMedications.length > 2 && (
                  <p className="text-sm text-text-secondary text-center pt-2">
                    +{activeMedications.length - 2} more medication{activeMedications.length - 2 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AppointmentDetailModal 
        appointment={upcomingAppointment || null}
        isOpen={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
      />
    </>
  );
};

export default UpdateCard;
