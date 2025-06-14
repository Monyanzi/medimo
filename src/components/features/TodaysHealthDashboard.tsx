
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Pill, Activity, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays, parseISO, isToday, isTomorrow } from 'date-fns';
import { useMedicationAdherence } from '@/contexts/MedicationAdherenceContext';
import { toast } from 'sonner';

interface TodaysHealthDashboardProps {
  upcomingAppointment?: any;
  activeMedications: any[];
}

const TodaysHealthDashboard: React.FC<TodaysHealthDashboardProps> = ({
  upcomingAppointment,
  activeMedications
}) => {
  const { isMedicationTakenToday, markMedicationTaken } = useMedicationAdherence();
  
  const pendingMedications = activeMedications.filter(med => !isMedicationTakenToday(med.id));
  const takenMedications = activeMedications.filter(med => isMedicationTakenToday(med.id));
  
  // Get medications expiring within 7 days
  const expiringMedications = activeMedications.filter(med => {
    if (!med.prescriptionPeriod?.endDate) return false;
    const daysUntilExpiry = differenceInDays(parseISO(med.prescriptionPeriod.endDate), new Date());
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  });

  // Get days until upcoming appointment
  const appointmentDays = upcomingAppointment ? 
    differenceInDays(parseISO(upcomingAppointment.dateTime), new Date()) : null;

  const hasOverdueItems = pendingMedications.length > 0;
  const hasExpiringMeds = expiringMedications.length > 0;
  const hasUpcomingAppointment = !!upcomingAppointment;

  const handleMarkTaken = (medication: any) => {
    markMedicationTaken(medication.id, medication.name, medication.dosage);
    toast.success(`Marked ${medication.name} as taken`);
  };

  const getPriorityIcon = () => {
    if (hasOverdueItems || hasExpiringMeds) return <AlertTriangle className="h-5 w-5 text-destructive-action" />;
    return <CheckCircle2 className="h-5 w-5 text-primary-action" />;
  };

  const getPriorityMessage = () => {
    if (hasOverdueItems) return `${pendingMedications.length} medication${pendingMedications.length > 1 ? 's' : ''} pending`;
    if (hasExpiringMeds) return `${expiringMedications.length} medication${expiringMedications.length > 1 ? 's' : ''} expiring soon`;
    if (hasUpcomingAppointment && appointmentDays !== null) {
      if (appointmentDays === 0) return 'Appointment today';
      if (appointmentDays === 1) return 'Appointment tomorrow';
      return `Appointment in ${appointmentDays} days`;
    }
    return 'All caught up! Great job';
  };

  return (
    <Card className="bg-surface-card border border-border-divider shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary-action" />
            <h3 className="font-semibold text-text-primary">Today's Health</h3>
          </div>
          <div className="flex items-center space-x-2">
            {getPriorityIcon()}
            <span className={`text-sm font-medium ${(hasOverdueItems || hasExpiringMeds) ? 'text-destructive-action' : 'text-primary-action'}`}>
              {getPriorityMessage()}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Expiring Medications Alert */}
          {hasExpiringMeds && (
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <h4 className="font-medium text-text-primary">Medications Expiring Soon</h4>
                <Badge className="bg-orange-500/10 text-orange-500 text-xs">
                  {expiringMedications.length} expiring
                </Badge>
              </div>
              <div className="space-y-2">
                {expiringMedications.slice(0, 2).map((med) => {
                  const daysLeft = differenceInDays(parseISO(med.prescriptionPeriod.endDate), new Date());
                  return (
                    <div key={med.id} className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-sm text-text-primary font-medium">{med.name}</span>
                        <span className="text-xs text-text-secondary ml-2">{med.dosage}</span>
                      </div>
                      <Badge className="bg-orange-500/10 text-orange-500 text-xs">
                        {daysLeft === 0 ? 'Expires today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                      </Badge>
                    </div>
                  );
                })}
                {expiringMedications.length > 2 && (
                  <p className="text-xs text-text-secondary">+{expiringMedications.length - 2} more expiring</p>
                )}
              </div>
            </div>
          )}

          {/* Medications Due Section */}
          {pendingMedications.length > 0 && (
            <div className="border-l-4 border-destructive-action pl-4 py-2">
              <div className="flex items-center space-x-2 mb-2">
                <Pill className="h-4 w-4 text-destructive-action" />
                <h4 className="font-medium text-text-primary">Medications Due</h4>
                <Badge className="bg-destructive-action/10 text-destructive-action text-xs">
                  {pendingMedications.length} pending
                </Badge>
              </div>
              <div className="space-y-2">
                {pendingMedications.slice(0, 2).map((med) => (
                  <div key={med.id} className="flex items-center justify-between py-1">
                    <div>
                      <span className="text-sm text-text-primary font-medium">{med.name}</span>
                      <span className="text-xs text-text-secondary ml-2">{med.dosage}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleMarkTaken(med)}
                      className="bg-accent-success hover:bg-accent-success/90 text-white text-xs"
                    >
                      Mark Taken
                    </Button>
                  </div>
                ))}
                {pendingMedications.length > 2 && (
                  <p className="text-xs text-text-secondary">+{pendingMedications.length - 2} more</p>
                )}
              </div>
            </div>
          )}

          {/* Taken Medications Section */}
          {takenMedications.length > 0 && (
            <div className="border-l-4 border-accent-success pl-4 py-2">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-accent-success" />
                <h4 className="font-medium text-text-primary">Medications Taken</h4>
                <Badge className="bg-accent-success/10 text-accent-success text-xs">
                  {takenMedications.length} completed
                </Badge>
              </div>
              <div className="space-y-1">
                {takenMedications.slice(0, 2).map((med) => (
                  <div key={med.id} className="flex items-center justify-between py-1">
                    <span className="text-sm text-text-secondary">{med.name}</span>
                    <span className="text-xs text-accent-success">✓ Taken</span>
                  </div>
                ))}
                {takenMedications.length > 2 && (
                  <p className="text-xs text-text-secondary">+{takenMedications.length - 2} more</p>
                )}
              </div>
            </div>
          )}

          {/* Appointments Section */}
          {upcomingAppointment && (
            <div className="border-l-4 border-primary-action pl-4 py-2">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-primary-action" />
                <h4 className="font-medium text-text-primary">Next Appointment</h4>
                {appointmentDays !== null && (
                  <Badge className="bg-primary-action/10 text-primary-action text-xs">
                    {appointmentDays === 0 ? 'Today' : 
                     appointmentDays === 1 ? 'Tomorrow' : 
                     `In ${appointmentDays} days`}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{upcomingAppointment.type || upcomingAppointment.title}</p>
                  <p className="text-xs text-text-secondary">
                    {format(new Date(upcomingAppointment.dateTime), 'MMM d, h:mm a')}
                  </p>
                </div>
                <Badge className="bg-primary-action/10 text-primary-action text-xs">
                  {upcomingAppointment.location}
                </Badge>
              </div>
            </div>
          )}

          {/* All Clear State */}
          {!hasOverdueItems && !upcomingAppointment && !hasExpiringMeds && (
            <div className="text-center py-4">
              <CheckCircle2 className="h-8 w-8 text-primary-action mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary">All caught up!</p>
              <p className="text-xs text-text-secondary">Your health routine is on track</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 mt-4 pt-4 border-t border-border-divider">
          <Button size="sm" className="flex-1 bg-primary-action hover:bg-primary-action/90 text-white">
            <Clock className="h-4 w-4 mr-2" />
            Log Vitals
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 border-border-divider text-text-primary hover:bg-accent-success/10"
            disabled={pendingMedications.length === 0}
          >
            <Pill className="h-4 w-4 mr-2" />
            Mark All Taken
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysHealthDashboard;
