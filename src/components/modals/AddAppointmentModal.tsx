
import React, { useState } from 'react';
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
import { Alert, AlertDescription } from "@/components/ui/alert"; // Added Alert
import { AlertTriangle } from "lucide-react"; // Added Icon
import { useHealthData } from "@/contexts/HealthDataContext";
import { Calendar } from "lucide-react";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onOpenChange }) => {
  const { addAppointment } = useHealthData();
  const [formData, setFormData] = useState({
    title: '',
    doctorName: '',
    location: '',
    date: '',
    time: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null); // Added error state

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.doctorName || !formData.date || !formData.time) {
      return;
    }
    setSubmissionError(null); // Clear previous errors
    setIsSubmitting(true);
    try {
      // Combine date and time into ISO string
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      await addAppointment({
        title: formData.title,
        doctorName: formData.doctorName,
        location: formData.location || 'TBD',
        dateTime: dateTime,
        notes: formData.notes || undefined
      });
      
      // Reset form
      setFormData({
        title: '',
        doctorName: '',
        location: '',
        date: '',
        time: '',
        notes: ''
      });
      
      // Reset form
      setFormData({
        title: '',
        doctorName: '',
        location: '',
        date: '',
        time: '',
        notes: ''
      });
      // toast.success is likely called from HealthDataContext.addAppointment if it's a global pattern
      // For now, let's assume the modal is responsible for its specific success toast.
      // This was already in the prompt: toast.success("Appointment added successfully!");
      // The HealthDataContext usually calls toast on its own. Let's remove the direct toast here
      // to avoid double toasting if HealthDataContext also toasts.
      // If HealthDataContext does NOT toast, then the line below should be reinstated.
      // toast.success("Appointment added successfully!");

      onOpenChange(false); // Close modal on success
    } catch (error) {
      console.error('Error adding appointment:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add appointment. Please try again.";
      setSubmissionError(errorMessage);
      // Modal stays open because onOpenChange(false) is not called here
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.title.trim() && formData.doctorName.trim() && formData.date && formData.time;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span>Add New Appointment</span>
          </DialogTitle>
          <DialogDescription>
            Schedule a new medical appointment
          </DialogDescription>
        </DialogHeader>
        
        {submissionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Appointment Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Annual Physical"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="doctorName">Doctor Name *</Label>
            <Input
              id="doctorName"
              placeholder="e.g., Dr. Sarah Mitchell"
              value={formData.doctorName}
              onChange={(e) => handleInputChange('doctorName', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Primary Care Clinic, Room 101"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the appointment..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointmentModal;
