
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Appointment, Medication } from '@/types';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Pill, CheckCircle, RotateCcw, Activity, AlertTriangle } from 'lucide-react';
import AppointmentDetailModal from '@/components/modals/AppointmentDetailModal';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

interface TodaysHealthDashboardProps {
  upcomingAppointment?: Appointment;
  activeMedications: Medication[];
}

const TodaysHealthDashboard: React.FC<TodaysHealthDashboardProps> = ({ 
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

  const handleMarkTaken = (medicationId: string, medicationName: string) => {
    setTakenMedications(prev => new Set([...prev, medicationId]));
    toast.success(`${medicationName} marked as taken`);
    
    addNotification({
      title: 'Medication Taken',
      message: `${medicationName} marked as taken`,
      type: 'medication',
      relatedId: medicationId
    });
  };

  const handleSnooze = (medicationName: string) => {
    toast.info(`Reminder snoozed for ${medicationName}`);
  };

  // Calculate pending items
  const pendingMedications = activeMedications.filter(med => !takenMedications.has(med.id));
  const hasVitalsReminder = true; // Mock data - in real app, check if vitals are due
  const hasPendingItems = upcomingAppointment || pendingMedications.length > 0 || hasVitalsReminder;

  if (!hasPendingItems) {
    return (
      <Card className="bg-white border border-gray-100 shadow-md">
        <CardContent className="p-6 text-center">
          <div className="text-[#28A745] mb-3">
            <CheckCircle className="h-10 w-10 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            All Set for Today! 
          </h3>
          <p className="text-gray-600 text-sm">
            No pending medications, appointments, or health reminders.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white border border-gray-100 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#0066CC]/10 rounded-lg">
                <Activity className="h-5 w-5 text-[#0066CC]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Today's Health Dashboard
                </h3>
                <p className="text-gray-600 text-sm">Your daily health reminders</p>
              </div>
            </div>
            {(pendingMedications.length > 0 || hasVitalsReminder) && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-[#0066CC]" />
                <span className="text-sm text-[#0066CC] font-medium">
                  {pendingMedications.length + (hasVitalsReminder ? 1 : 0)} pending
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Pending Medications */}
            {pendingMedications.length > 0 && (
              <div className="p-4 bg-[#0066CC]/5 rounded-lg border border-[#0066CC]/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Pill className="h-4 w-4 text-[#0066CC]" />
                  <h4 className="font-medium text-gray-900">Medications Due</h4>
                  <Badge className="bg-[#0066CC]/10 text-[#0066CC] text-xs">
                    {pendingMedications.length} pending
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {pendingMedications.slice(0, 2).map((medication) => (
                    <div key={medication.id} className="bg-white p-3 rounded border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{medication.name} {medication.dosage}</p>
                          <p className="text-sm text-gray-600">{medication.frequency}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => handleMarkTaken(medication.id, medication.name)}
                          className="flex-1 bg-[#28A745] hover:bg-[#28A745]/90 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Take Now
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleSnooze(medication.name)}
                          className="flex-1 border-gray-200"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Snooze
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingMedications.length > 2 && (
                    <p className="text-sm text-gray-600 text-center">
                      +{pendingMedications.length - 2} more medication{pendingMedications.length - 2 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming Appointment */}
            {upcomingAppointment && (
              <div className="p-4 bg-[#009B8F]/5 rounded-lg border border-[#009B8F]/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-4 w-4 text-[#009B8F]" />
                  <h4 className="font-medium text-gray-900">Next Appointment</h4>
                  <Badge className="bg-[#009B8F]/10 text-[#009B8F] text-xs">
                    Today
                  </Badge>
                </div>
                
                <div className="bg-white p-3 rounded border border-gray-100">
                  <div className="mb-2">
                    <p className="font-medium text-gray-900">{upcomingAppointment.title}</p>
                    <p className="text-sm text-gray-600">Dr. {upcomingAppointment.doctorName}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <Clock className="h-4 w-4" />
                    <span>{format(parseISO(upcomingAppointment.dateTime), 'h:mm a')}</span>
                    <span>•</span>
                    <span>{upcomingAppointment.location}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      onClick={handleViewAppointmentDetails}
                      className="flex-1 bg-[#009B8F] hover:bg-[#009B8F]/90 text-white"
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="flex-1 border-gray-200"
                    >
                      Reschedule
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Vitals Reminder */}
            {hasVitalsReminder && (
              <div className="p-4 bg-[#28A745]/5 rounded-lg border border-[#28A745]/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Activity className="h-4 w-4 text-[#28A745]" />
                  <h4 className="font-medium text-gray-900">Vitals Check</h4>
                  <Badge className="bg-[#28A745]/10 text-[#28A745] text-xs">
                    Due
                  </Badge>
                </div>
                
                <div className="bg-white p-3 rounded border border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">
                    Time for your daily vitals check - blood pressure and weight
                  </p>
                  <Button 
                    size="sm"
                    className="w-full bg-[#28A745] hover:bg-[#28A745]/90 text-white"
                  >
                    Log Vitals
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AppointmentDetailModal 
        appointment={upcomingAppointment || null}
        isOpen={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
      />
    </>
  );
};

export default TodaysHealthDashboard;
