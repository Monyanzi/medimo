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
import { useHealthData } from "@/contexts/HealthDataContext";
import { TimelineEvent, VitalSigns } from "@/types";
import { Activity, AlertTriangle } from "lucide-react";
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditVitalsTimelineModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event: TimelineEvent | null;
}

const EditVitalsTimelineModal: React.FC<EditVitalsTimelineModalProps> = ({ isOpen, onOpenChange, event }) => {
  const { vitalSigns, updateVitalSigns, updateTimelineEvent } = useHealthData();
  const [formData, setFormData] = useState<Partial<VitalSigns>>({
    bloodPressureSystolic: undefined,
    bloodPressureDiastolic: undefined,
    heartRate: undefined,
    weight: undefined,
    height: undefined,
    temperature: undefined,
    oxygenSaturation: undefined,
    notes: '',
    recordedDate: new Date().toISOString()
  });
  const [originalVital, setOriginalVital] = useState<VitalSigns | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && event && event.category === 'Vitals' && event.relatedId) {
      const vitalToEdit = vitalSigns.find(vital => vital.id === event.relatedId);
      if (vitalToEdit) {
        setFormData({
          bloodPressureSystolic: vitalToEdit.bloodPressureSystolic ?? undefined,
          bloodPressureDiastolic: vitalToEdit.bloodPressureDiastolic ?? undefined,
          heartRate: vitalToEdit.heartRate ?? undefined,
          weight: vitalToEdit.weight ?? undefined,
          height: vitalToEdit.height ?? undefined,
          temperature: vitalToEdit.temperature ?? undefined,
          oxygenSaturation: vitalToEdit.oxygenSaturation ?? undefined,
          notes: vitalToEdit.notes ?? '',
          recordedDate: vitalToEdit.recordedDate
        });
        setOriginalVital(vitalToEdit);
        setSubmissionError(null);
      } else {
        setSubmissionError("Could not find the vital signs to edit. They might have been deleted.");
        setOriginalVital(null);
      }
    } else if (!isOpen) {
      // Reset form when modal is closed
      setFormData({
        bloodPressureSystolic: undefined,
        bloodPressureDiastolic: undefined,
        heartRate: undefined,
        weight: undefined,
        height: undefined,
        temperature: undefined,
        oxygenSaturation: undefined,
        notes: '',
        recordedDate: new Date().toISOString()
      });
      setOriginalVital(null);
      setSubmissionError(null);
    }
  }, [isOpen, event, vitalSigns]);

  const handleInputChange = (field: keyof VitalSigns, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ? (field === 'notes' ? value : Number(value)) : undefined
    }));
  };

  const handleSubmit = async () => {
    if (!event || !event.relatedId || !originalVital) {
      setSubmissionError("Cannot submit: Event data or related vital signs are missing.");
      return;
    }

    // At least one vital sign should be provided
    const hasAtLeastOneVital = [
      formData.bloodPressureSystolic !== undefined,
      formData.bloodPressureDiastolic !== undefined,
      formData.heartRate !== undefined,
      formData.weight !== undefined,
      formData.height !== undefined,
      formData.temperature !== undefined,
      formData.oxygenSaturation !== undefined
    ].some(Boolean);

    if (!hasAtLeastOneVital) {
      setSubmissionError("Please provide at least one vital sign value.");
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const vitalUpdates: Partial<VitalSigns> = {
        bloodPressureSystolic: formData.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ?? null,
        heartRate: formData.heartRate ?? null,
        weight: formData.weight ?? null,
        height: formData.height ?? null,
        temperature: formData.temperature ?? null,
        oxygenSaturation: formData.oxygenSaturation ?? null,
        notes: formData.notes || null,
        recordedDate: formData.recordedDate || new Date().toISOString()
      };
      
      await updateVitalSigns(event.relatedId, vitalUpdates);

      // Update the timeline event's title and details
      const details = [];
      if (vitalUpdates.bloodPressureSystolic && vitalUpdates.bloodPressureDiastolic) {
        details.push(`BP: ${vitalUpdates.bloodPressureSystolic}/${vitalUpdates.bloodPressureDiastolic} mmHg`);
      }
      if (vitalUpdates.heartRate) details.push(`HR: ${vitalUpdates.heartRate} bpm`);
      if (vitalUpdates.weight) details.push(`Weight: ${vitalUpdates.weight} lbs`);
      if (vitalUpdates.height) details.push(`Height: ${vitalUpdates.height} in`);
      if (vitalUpdates.temperature) details.push(`Temp: ${vitalUpdates.temperature}°F`);
      if (vitalUpdates.oxygenSaturation) details.push(`SpO2: ${vitalUpdates.oxygenSaturation}%`);
      
      const newTimelineTitle = `Vitals Updated`;
      const newTimelineDetails = details.join(', ') || 'Vital signs updated';
      
      await updateTimelineEvent(event.id, {
        title: newTimelineTitle,
        details: newTimelineDetails,
        date: vitalUpdates.recordedDate || new Date().toISOString()
      });
      
      toast.success('Vital signs updated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating vital signs:', error);
      setSubmissionError("Failed to update vital signs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-red-500" />
            <span>Edit Vital Signs</span>
          </DialogTitle>
          <DialogDescription>
            Update the vital signs information below
          </DialogDescription>
        </DialogHeader>

        {submissionError && (
          <Alert variant="destructive" className="my-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {/* Blood Pressure */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="systolic">Systolic BP</Label>
              <Input
                id="systolic"
                type="number"
                value={formData.bloodPressureSystolic ?? ''}
                onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)}
                placeholder="120"
              />
            </div>
            <div>
              <Label htmlFor="diastolic">Diastolic BP</Label>
              <Input
                id="diastolic"
                type="number"
                value={formData.bloodPressureDiastolic ?? ''}
                onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
                placeholder="80"
              />
            </div>
          </div>

          {/* Heart Rate */}
          <div>
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              value={formData.heartRate ?? ''}
              onChange={(e) => handleInputChange('heartRate', e.target.value)}
              placeholder="72"
            />
          </div>

          {/* Weight and Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight ?? ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="150.5"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (in)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height ?? ''}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="68.5"
              />
            </div>
          </div>

          {/* Temperature and Oxygen Saturation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature ?? ''}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder="98.6"
              />
            </div>
            <div>
              <Label htmlFor="oxygen">Oxygen Saturation (%)</Label>
              <Input
                id="oxygen"
                type="number"
                min="0"
                max="100"
                value={formData.oxygenSaturation ?? ''}
                onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
                placeholder="98"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.notes ?? ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary-action hover:bg-primary-action/90"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVitalsTimelineModal;
