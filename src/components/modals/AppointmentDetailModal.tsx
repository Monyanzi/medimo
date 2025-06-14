
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, User, FileText, Edit, Trash2 } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import { toast } from 'sonner';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  isOpen,
  onOpenChange
}) => {
  const { deleteAppointment } = useHealthData();

  if (!appointment) return null;

  const appointmentDate = parseISO(appointment.dateTime);
  const isUpcoming = appointmentDate > new Date();

  const handleReschedule = () => {
    toast.info('Reschedule functionality would open appointment edit modal');
    // In a real app, this would open an edit modal
  };

  const handleCancel = async () => {
    try {
      await deleteAppointment(appointment.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface-card border border-border-divider">
        <DialogHeader>
          <DialogTitle className="text-text-primary flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-action" />
            Appointment Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Appointment Title */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{appointment.title}</h3>
            <Badge variant={isUpcoming ? "default" : "secondary"} className="mt-1">
              {isUpcoming ? 'Upcoming' : 'Past'}
            </Badge>
          </div>

          {/* Doctor Info */}
          <div className="flex items-center gap-3 p-3 bg-accent-success/10 rounded-lg">
            <User className="h-5 w-5 text-accent-success" />
            <div>
              <p className="font-medium text-text-primary">{appointment.doctorName}</p>
              <p className="text-sm text-text-secondary">Doctor</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 p-3 bg-primary-action/10 rounded-lg">
            <Clock className="h-5 w-5 text-primary-action" />
            <div>
              <p className="font-medium text-text-primary">
                {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-text-secondary">
                {format(appointmentDate, 'h:mm a')}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-3 bg-accent-warning/10 rounded-lg">
            <MapPin className="h-5 w-5 text-accent-warning" />
            <div>
              <p className="font-medium text-text-primary">{appointment.location}</p>
              <p className="text-sm text-text-secondary">Location</p>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="flex items-start gap-3 p-3 bg-surface-secondary rounded-lg">
              <FileText className="h-5 w-5 text-text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-text-primary mb-1">Notes</p>
                <p className="text-sm text-text-secondary">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {isUpcoming && (
              <Button 
                onClick={handleReschedule}
                className="flex-1 bg-primary-action hover:bg-primary-action/90"
              >
                <Edit className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1 text-destructive-action border-destructive-action hover:bg-destructive-action/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailModal;
