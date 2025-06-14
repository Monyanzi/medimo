
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
import { Pill } from "lucide-react";

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
    status: 'active' as 'active' | 'discontinued'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.dosage || !formData.frequency) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addMedication({
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        instructions: formData.instructions || undefined,
        status: formData.status
      });
      
      // Reset form
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        instructions: '',
        status: 'active'
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding medication:', error);
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
