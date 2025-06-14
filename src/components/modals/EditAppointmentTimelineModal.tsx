
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHealthData } from "@/contexts/HealthDataContext";
import { TimelineEvent, Appointment } from "@/types";
import { Calendar } from "lucide-react";
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

interface EditAppointmentTimelineModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event: TimelineEvent | null;
}

const EditAppointmentTimelineModal: React.FC<EditAppointmentTimelineModalProps> = ({ isOpen, onOpenChange, event }) => {
  const { appointments, updateAppointment, updateTimelineEvent } = useHealthData();
  const [formData, setFormData] = useState({
    title: '',
    doctorName: '',
    location: '',
    date: '',
    time: '',
    notes: ''
  });
  const [originalAppointment, setOriginalAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && event && event.category === 'Appointment' && event.relatedId) {
      const appointmentToEdit = appointments.find(apt => apt.id === event.relatedId);
      if (appointmentToEdit) {
        const dateTime = parseISO(appointmentToEdit.dateTime);
        setFormData({
          title: appointmentToEdit.title,
          doctorName: appointmentToEdit.doctorName,
          location: appointmentToEdit.location || '',
          date: format(dateTime, 'yyyy-MM-dd'),
          time: format(dateTime, 'HH:mm'),
          notes: appointmentToEdit.notes || ''
        });
        setOriginalAppointment(appointmentToEdit);
      }
    } else if (!isOpen) {
      setFormData({ title: '', doctorName: '', location: '', date: '', time: '', notes: '' });
      setOriginalAppointment(null);
    }
  }, [isOpen, event, appointments]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!event || !event.relatedId || !originalAppointment) {
      toast.error("Cannot submit: Event data or related appointment is missing.");
      return;
    }
    if (!formData.title || !formData.doctorName || !formData.date || !formData.time) {
      toast.warning("Please fill in all required fields: Title, Doctor Name, Date, and Time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const appointmentUpdates: Partial<Appointment> = {
        title: formData.title,
        doctorName: formData.doctorName,
        location: formData.location || 'TBD',
        dateTime: dateTime,
        notes: formData.notes || undefined,
      };
      
      await updateAppointment(event.relatedId, appointmentUpdates);

      const newTimelineTitle = `Appointment Updated: ${formData.title}`;
      const newTimelineDetails = `${formData.title} with ${formData.doctorName} at ${formData.location || 'TBD'} on ${format(parseISO(dateTime), 'MMM d, yyyy')} at ${format(parseISO(dateTime), 'h:mm a')}.`;
      
      await updateTimelineEvent(event.id, {
        title: newTimelineTitle,
        details: newTimelineDetails,
      });
      
      toast.success('Appointment and timeline event updated successfully!');
      onOpenChange(false);
    } catch (err) {
      console.error('Error updating appointment timeline event:', err);
      toast.error('Failed to update appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = () => {
    return formData.title.trim() && formData.doctorName.trim() && formData.date && formData.time;
  };

  if (!event || !originalAppointment && isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span>Edit Appointment Details</span>
          </DialogTitle>
          <DialogDescription>
            Update the details for this appointment. Changes will reflect on the timeline.
          </DialogDescription>
        </DialogHeader>
        
        {originalAppointment && (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-apt-title">Appointment Title *</Label>
              <Input
                id="edit-apt-title"
                placeholder="e.g., Annual Physical"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="edit-apt-doctor">Doctor Name *</Label>
              <Input
                id="edit-apt-doctor"
                placeholder="e.g., Dr. Sarah Mitchell"
                value={formData.doctorName}
                onChange={(e) => handleInputChange('doctorName', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="edit-apt-location">Location</Label>
              <Input
                id="edit-apt-location"
                placeholder="e.g., Primary Care Clinic, Room 101"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="edit-apt-date">Date *</Label>
                <Input
                  id="edit-apt-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="edit-apt-time">Time *</Label>
                <Input
                  id="edit-apt-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-apt-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-apt-notes"
                placeholder="Additional notes about the appointment..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid() || isSubmitting || !originalAppointment}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentTimelineModal;
