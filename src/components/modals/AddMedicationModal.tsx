
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHealthData } from "@/contexts/HealthDataContext";
import { Pill, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { format, addDays } from 'date-fns';
import { Alert, AlertDescription } from "@/components/ui/alert"; // Added Alert

interface AddMedicationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ isOpen, onOpenChange }) => {
  const { addMedication } = useHealthData();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    status: 'active' as 'active' | 'discontinued',
    prescriptionDays: ''
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
    if (!formData.name || !formData.dosage || !formData.frequency) {
      // Basic client-side validation, could be enhanced
      setSubmissionError("Please fill in Medication Name, Dosage, and Frequency.");
      return;
    }
    setSubmissionError(null); // Clear previous errors
    setIsSubmitting(true);
    try {
      const medicationData: any = {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        instructions: formData.instructions || undefined,
        status: formData.status
      };

      // Add prescription period if specified
      if (formData.prescriptionDays && parseInt(formData.prescriptionDays) > 0) {
        const startDate = new Date();
        const totalDays = parseInt(formData.prescriptionDays);
        const endDate = addDays(startDate, totalDays);
        
        medicationData.prescriptionPeriod = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalDays
        };
      }

      await addMedication(medicationData);
      
      // Reset form
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        instructions: '',
        status: 'active',
        prescriptionDays: ''
      });
      
      // Reset form and close modal on success
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        instructions: '',
        status: 'active',
        prescriptionDays: ''
      });
      onOpenChange(false);
      // Assuming HealthDataContext.addMedication calls toast.success
    } catch (error) {
      console.error('Error adding medication:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add medication. Please try again.";
      setSubmissionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && formData.dosage.trim() && formData.frequency.trim();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-blue-500" />
            <span>Add New Medication</span>
          </DialogTitle>
          <DialogDescription>
            Add a new medication to your medical records
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
            <Label htmlFor="name">Medication Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Lisinopril"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="dosage">Dosage *</Label>
            <Input
              id="dosage"
              placeholder="e.g., 10mg"
              value={formData.dosage}
              onChange={(e) => handleInputChange('dosage', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="frequency">Frequency *</Label>
            <Input
              id="frequency"
              placeholder="e.g., Once daily"
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Examples: 'Once daily', 'Twice a day', 'Every 6 hours'</p>
          </div>

          <div>
            <Label htmlFor="prescriptionDays">Prescription Period (Days)</Label>
            {/* Ensuring type="number" is already good. Further validation (e.g. positive) could be added via schema if needed. */}
            <Input
              id="prescriptionDays"
              type="number"
              placeholder="e.g., 30 (optional)"
              value={formData.prescriptionDays}
              onChange={(e) => handleInputChange('prescriptionDays', e.target.value)}
              min="0" // Basic HTML5 validation for non-negative
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for ongoing medication. Enter number of days.
            </p>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'active' | 'discontinued') => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="instructions">Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Take with water, preferably in the morning"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
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
            {isSubmitting ? 'Adding...' : 'Add Medication'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicationModal;
