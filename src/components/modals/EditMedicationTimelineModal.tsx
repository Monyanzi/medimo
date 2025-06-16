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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHealthData } from "@/contexts/HealthDataContext";
import { TimelineEvent, Medication } from "@/types";
import { Pill, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert"; // Added Alert

interface EditMedicationTimelineModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event: TimelineEvent | null;
}

const EditMedicationTimelineModal: React.FC<EditMedicationTimelineModalProps> = ({ isOpen, onOpenChange, event }) => {
  const { medications, updateMedication, updateTimelineEvent } = useHealthData();
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    status: 'active'
  });
  const [originalMedication, setOriginalMedication] = useState<Medication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null); // Renamed for consistency

  useEffect(() => {
    if (isOpen && event && event.category === 'Medication' && event.relatedId) {
      const medicationToEdit = medications.find(med => med.id === event.relatedId);
      if (medicationToEdit) {
        setFormData({
          name: medicationToEdit.name,
          dosage: medicationToEdit.dosage,
          frequency: medicationToEdit.frequency,
          instructions: medicationToEdit.instructions || '',
          status: medicationToEdit.status
        });
        setOriginalMedication(medicationToEdit);
        setSubmissionError(null); // Clear error on successful load
      } else {
        setSubmissionError("Could not find the medication to edit. It might have been deleted.");
        setOriginalMedication(null);
      }
    } else if (!isOpen) {
      // Reset form when modal is closed
      setFormData({ name: '', dosage: '', frequency: '', instructions: '', status: 'active' });
      setOriginalMedication(null);
      setSubmissionError(null); // Clear error on close
    }
  }, [isOpen, event, medications]);

  const handleInputChange = (field: keyof Medication, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!event || !event.relatedId || !originalMedication) {
      setSubmissionError("Cannot submit: Event data or related medication is missing.");
      return;
    }
    if (!formData.name || !formData.dosage || !formData.frequency) {
      setSubmissionError("Please fill in all required fields: Name, Dosage, and Frequency.");
      return;
    }
    setSubmissionError(null); // Clear previous submission errors
    setIsSubmitting(true);
    try {
      const medicationUpdates: Partial<Medication> = {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        instructions: formData.instructions || undefined,
        status: formData.status as 'active' | 'completed' | 'discontinued',
      };
      
      await updateMedication(event.relatedId, medicationUpdates);

      // Update the timeline event's title and details
      // For example, if the event was "Medication Added: OldName", update it to "Medication Details Updated: NewName"
      // Or keep a generic update message
      const newTimelineTitle = `Medication Updated: ${formData.name}`;
      const newTimelineDetails = `Details for ${formData.name} (${formData.dosage}, ${formData.frequency}) updated. Status: ${formData.status}.`;
      
      await updateTimelineEvent(event.id, {
        title: newTimelineTitle,
        details: newTimelineDetails,
      });
      
      toast.success('Medication and timeline event updated successfully!');
      onOpenChange(false);
    } catch (err) {
      console.error('Error updating medication timeline event:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update medication. Please try again.";
      setSubmissionError(errorMessage);
      // toast.error removed, error displayed in modal
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = () => {
    return formData.name?.trim() && formData.dosage?.trim() && formData.frequency?.trim();
  };

  if (!event || (isOpen && !originalMedication && !submissionError)) {
    // If open, but no original med and no error yet (could be loading or bad event)
    // To prevent rendering with inconsistent state if originalMedication is null but no error message is set yet.
    // Or, if there's an error related to finding the med, submissionError will be set and this check passes.
    return null;
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-blue-500" />
            <span>Edit Medication Details</span>
          </DialogTitle>
          <DialogDescription>
            Update the details for {originalMedication?.name || event?.title || 'this medication'}. Changes will reflect on the timeline.
          </DialogDescription>
        </DialogHeader>
        
        {submissionError && (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}

        {/* Render form only if originalMedication is loaded and no initial critical error */}
        {originalMedication && !submissionError && (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-med-name">Medication Name *</Label>
              <Input
                id="edit-med-name"
                placeholder="e.g., Lisinopril"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="edit-med-dosage">Dosage *</Label>
              <Input
                id="edit-med-dosage"
                placeholder="e.g., 10mg"
                value={formData.dosage || ''}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="edit-med-frequency">Frequency *</Label>
              <Input
                id="edit-med-frequency"
                placeholder="e.g., Once daily"
                value={formData.frequency || ''}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400 mt-1">Examples: 'Once daily', 'Twice a day', 'Every 6 hours'</p>
            </div>

            <div>
              <Label htmlFor="edit-med-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'active' | 'completed' | 'discontinued') => handleInputChange('status', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-med-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-med-instructions">Instructions (Optional)</Label>
              <Textarea
                id="edit-med-instructions"
                placeholder="e.g., Take with water, preferably in the morning"
                value={formData.instructions || ''}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
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
            disabled={!isFormValid() || isSubmitting || !originalMedication} // Error state implicitly handled by not allowing submit if critical error occurred
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedicationTimelineModal;
