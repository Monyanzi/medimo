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
import { Pill } from "lucide-react";
import { toast } from 'sonner';

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
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
      } else {
        setError("Could not find the medication to edit. It might have been deleted.");
        setOriginalMedication(null);
      }
    } else if (!isOpen) {
      // Reset form when modal is closed
      setFormData({ name: '', dosage: '', frequency: '', instructions: '', status: 'active' });
      setOriginalMedication(null);
      setError(null);
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
      toast.error("Cannot submit: Event data or related medication is missing.");
      return;
    }
    if (!formData.name || !formData.dosage || !formData.frequency) {
      toast.warning("Please fill in all required fields: Name, Dosage, and Frequency.");
      return;
    }

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
      toast.error('Failed to update medication. Please try again.');
      setError('Failed to update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = () => {
    return formData.name?.trim() && formData.dosage?.trim() && formData.frequency?.trim();
  };

  if (!event || !originalMedication && isOpen && !error) {
     // Still loading or event is not suitable
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
            Update the details for {originalMedication?.name || 'this medication'}. Changes will reflect on the timeline.
          </DialogDescription>
        </DialogHeader>
        
        {error && <p className="text-sm text-red-500 py-2">{error}</p>}

        {!error && originalMedication && (
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
            disabled={!isFormValid() || isSubmitting || !!error || !originalMedication}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedicationTimelineModal;
