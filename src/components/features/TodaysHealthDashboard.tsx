
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Pill, Activity, Calendar, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useMedicationAdherence } from '@/contexts/MedicationAdherenceContext';
import { toast } from 'sonner';
import LogVitalsModal from '@/components/modals/LogVitalsModal';

interface TodaysHealthDashboardProps {
  upcomingAppointment?: any;
  activeMedications: any[];
}

const TodaysHealthDashboard: React.FC<TodaysHealthDashboardProps> = ({
  upcomingAppointment,
  activeMedications
}) => {
  const { isMedicationTakenToday, markMedicationTaken } = useMedicationAdherence();
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);

  const pendingMedications = activeMedications.filter(med => !isMedicationTakenToday(med.id));
  const takenMedications = activeMedications.filter(med => isMedicationTakenToday(med.id));

  const expiringMedications = activeMedications.filter(med => {
    if (!med.prescriptionPeriod?.endDate) return false;
    const daysUntilExpiry = differenceInDays(parseISO(med.prescriptionPeriod.endDate), new Date());
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  });

  const appointmentDays = upcomingAppointment ?
    differenceInDays(parseISO(upcomingAppointment.dateTime), new Date()) : null;

  const hasOverdueItems = pendingMedications.length > 0;
  const hasExpiringMeds = expiringMedications.length > 0;
  const hasUpcomingAppointment = !!upcomingAppointment;

  const handleMarkTaken = (medication: any) => {
    markMedicationTaken(medication.id, medication.name, medication.dosage);
    toast.success(`Marked ${medication.name} as taken`);
  };

  const handleMarkAllTaken = () => {
    if (pendingMedications.length === 0) return;
    pendingMedications.forEach(med => {
      markMedicationTaken(med.id, med.name, med.dosage);
    });
    toast.success("All pending medications marked as taken.");
  };

  const completionRate = activeMedications.length > 0
    ? Math.round((takenMedications.length / activeMedications.length) * 100)
    : 100;

  return (
    <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        {/* Header with Progress Ring */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--medimo-accent-soft)] flex items-center justify-center">
              <Activity className="h-5 w-5 text-[var(--medimo-accent)]" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-[var(--medimo-text-primary)]">Today's Health</h3>
              <p className="text-xs text-[var(--medimo-text-muted)]">
                {format(new Date(), 'EEEE, MMM d')}
              </p>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="var(--medimo-border)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="var(--medimo-accent)"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(completionRate / 100) * 150.8} 150.8`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-sm font-bold text-[var(--medimo-text-primary)]">{completionRate}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Column 1: Critical Actions (Expiring & Due) */}
          <div className="space-y-4">
            {/* Expiring Medications Alert */}
            {hasExpiringMeds && (
              <div className="p-4 bg-[var(--hc-accent-warning-soft)] rounded-xl border border-[var(--medimo-warning)]/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--medimo-warning)]/20 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-[var(--medimo-warning)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-medium text-[var(--medimo-text-primary)] text-sm">Expiring Soon</h4>
                  </div>
                  <Badge className="bg-[var(--medimo-warning)]/10 text-[var(--medimo-warning)] text-[10px] font-mono">
                    {expiringMedications.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {expiringMedications.slice(0, 2).map((med) => {
                    const daysLeft = differenceInDays(parseISO(med.prescriptionPeriod.endDate), new Date());
                    return (
                      <div key={med.id} className="flex items-center justify-between">
                        <span className="text-sm text-[var(--medimo-text-primary)]">{med.name}</span>
                        <span className="text-xs font-mono text-[var(--medimo-warning)]">
                          {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Medications Due Section */}
            {pendingMedications.length > 0 ? (
              <div className="p-4 bg-[var(--hc-accent-critical-soft)] rounded-xl border border-[var(--medimo-critical)]/20 h-full">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--medimo-critical)]/20 flex items-center justify-center">
                    <Pill className="h-4 w-4 text-[var(--medimo-critical)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-medium text-[var(--medimo-text-primary)] text-sm">Medications Due</h4>
                  </div>
                  <Badge className="bg-[var(--medimo-critical)]/10 text-[var(--medimo-critical)] text-[10px] font-mono">
                    {pendingMedications.length} pending
                  </Badge>
                </div>
                <div className="space-y-2">
                  {pendingMedications.slice(0, 5).map((med) => (
                    <div key={med.id} className="flex items-center justify-between py-2 border-b border-[var(--medimo-critical)]/5 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--medimo-text-primary)]">{med.name}</span>
                        <span className="text-[10px] text-[var(--medimo-text-muted)] font-mono">{med.dosage}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleMarkTaken(med)}
                        className="h-8 px-4 bg-[var(--medimo-success)] hover:bg-[var(--medimo-success)]/90 text-white text-xs font-medium rounded-lg shadow-sm"
                      >
                        Taking
                      </Button>
                    </div>
                  ))}
                  {pendingMedications.length > 5 && (
                    <p className="text-xs text-[var(--medimo-text-muted)] text-center pt-1">+{pendingMedications.length - 5} more</p>
                  )}
                </div>
              </div>
            ) : !hasUpcomingAppointment && !takenMedications.length && !hasExpiringMeds && (
              /* Empty State placeholder if nothing else is showing in col 1 but we want to balance layout? 
                 Actually, if all clear, the All Clear block below handles it. */
              null
            )}
          </div>

          {/* Column 2: Status & Info */}
          <div className="space-y-4">
            {/* Appointments Section */}
            {upcomingAppointment && (
              <div className="p-4 bg-[var(--medimo-accent-soft)] rounded-xl border border-[var(--medimo-accent)]/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--medimo-accent)]/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-[var(--medimo-accent)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-medium text-[var(--medimo-text-primary)] text-sm">Next Appointment</h4>
                  </div>
                  {appointmentDays !== null && (
                    <Badge className="bg-[var(--medimo-accent)]/10 text-[var(--medimo-accent)] text-[10px] font-mono">
                      {appointmentDays === 0 ? 'Today' : appointmentDays === 1 ? 'Tomorrow' : `${appointmentDays}d`}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--medimo-text-primary)]">
                      {upcomingAppointment.type || upcomingAppointment.title}
                    </p>
                    <p className="text-xs text-[var(--medimo-text-muted)] font-mono mt-0.5">
                      {format(new Date(upcomingAppointment.dateTime), 'MMM d • h:mm a')}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--medimo-accent)] bg-white/50 px-2 py-1 rounded-lg">
                    {upcomingAppointment.location}
                  </span>
                </div>
              </div>
            )}

            {/* Taken Medications Section */}
            {takenMedications.length > 0 && (
              <div className="p-4 bg-[var(--hc-accent-success-soft)] rounded-xl border border-[var(--medimo-success)]/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--medimo-success)]/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-[var(--medimo-success)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-medium text-[var(--medimo-text-primary)] text-sm">Completed Today</h4>
                  </div>
                  <Badge className="bg-[var(--medimo-success)]/10 text-[var(--medimo-success)] text-[10px] font-mono">
                    {takenMedications.length}/{activeMedications.length}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {takenMedications.slice(0, 6).map((med) => (
                    <span key={med.id} className="px-2.5 py-1 bg-white/50 rounded-lg text-xs text-[var(--medimo-text-secondary)] border border-[var(--medimo-success)]/10">
                      {med.name} ✓
                    </span>
                  ))}
                  {takenMedications.length > 6 && (
                    <span className="px-2.5 py-1 text-xs text-[var(--medimo-text-muted)]">
                      +{takenMedications.length - 6}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* If Col 2 is empty but Col 1 has stuff, maybe we want to show a 'Nice Job' or empty spacer? 
                For now, let it be empty, grid handles height. */}
          </div>

          {/* All Clear State - spans both cols */}
          {!hasOverdueItems && !upcomingAppointment && !hasExpiringMeds && !takenMedications.length && (
            <div className="col-span-1 lg:col-span-2 text-center py-12 bg-[var(--medimo-bg-primary)]/50 rounded-xl border border-dashed border-[var(--medimo-border)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--medimo-accent)] to-teal-500 flex items-center justify-center shadow-lg shadow-[var(--medimo-accent)]/20">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-display font-semibold text-[var(--medimo-text-primary)] mb-1">All clear for today!</h4>
              <p className="text-sm text-[var(--medimo-text-secondary)]">No urgent tasks or medications pending.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-3 mt-6 pt-5 border-t border-[var(--medimo-border)]">
          <Button
            className="flex-1 h-11 bg-[var(--medimo-accent)] hover:bg-[var(--medimo-accent)]/90 text-white rounded-xl font-display font-medium"
            onClick={() => setVitalsModalOpen(true)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Log Vitals
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-11 border-[var(--medimo-border)] hover:border-[var(--medimo-accent)] hover:bg-[var(--medimo-accent-soft)] text-[var(--medimo-text-primary)] rounded-xl font-display font-medium"
            disabled={pendingMedications.length === 0}
            onClick={handleMarkAllTaken}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark All Done
          </Button>
        </div>
      </CardContent>
      <LogVitalsModal isOpen={vitalsModalOpen} onOpenChange={setVitalsModalOpen} />
    </Card>
  );
};

export default TodaysHealthDashboard;
