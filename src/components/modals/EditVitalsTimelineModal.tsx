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
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { TimelineEvent, VitalSigns } from "@/types";
import { Activity, AlertTriangle } from "lucide-react";
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getWeightUnit,
  getHeightUnit,
  getTemperatureUnit,
  getGlucoseUnit,
  getWeightPlaceholder,
  getHeightPlaceholder,
  getTemperaturePlaceholder,
  getGlucosePlaceholder,
  getGlucoseNormalRange,
  toStorageWeight,
  toStorageHeight,
  toStorageTemperature,
  toStorageGlucose,
  fromStorageWeight,
  fromStorageHeight,
  fromStorageTemperature,
  fromStorageGlucose,
} from "@/utils/unitConversions";

interface EditVitalsTimelineModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event: TimelineEvent | null;
}

const EditVitalsTimelineModal: React.FC<EditVitalsTimelineModalProps> = ({ isOpen, onOpenChange, event }) => {
  const { vitalSigns, updateVitalSigns, updateTimelineEvent } = useHealthData();
  const { measurementUnit } = useAppSettings();
  // Form data stores display values (user's preferred unit)
  const [formData, setFormData] = useState<{
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    weight: string;
    height: string;
    temperature: string;
    oxygenSaturation?: number;
    bloodGlucose: string;
    notes: string;
    recordedDate: string;
  }>({
    bloodPressureSystolic: undefined,
    bloodPressureDiastolic: undefined,
    heartRate: undefined,
    weight: '',
    height: '',
    temperature: '',
    oxygenSaturation: undefined,
    bloodGlucose: '',
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
        // Convert stored metric values to display values
        setFormData({
          bloodPressureSystolic: vitalToEdit.bloodPressureSystolic ?? undefined,
          bloodPressureDiastolic: vitalToEdit.bloodPressureDiastolic ?? undefined,
          heartRate: vitalToEdit.heartRate ?? undefined,
          weight: vitalToEdit.weight != null ? fromStorageWeight(vitalToEdit.weight, measurementUnit).toFixed(1) : '',
          height: vitalToEdit.height != null ? fromStorageHeight(vitalToEdit.height, measurementUnit).toFixed(1) : '',
          temperature: vitalToEdit.temperature != null ? fromStorageTemperature(vitalToEdit.temperature, measurementUnit).toFixed(1) : '',
          oxygenSaturation: vitalToEdit.oxygenSaturation ?? undefined,
          bloodGlucose: vitalToEdit.bloodGlucose != null ? fromStorageGlucose(vitalToEdit.bloodGlucose, measurementUnit).toFixed(1) : '',
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
        weight: '',
        height: '',
        temperature: '',
        oxygenSaturation: undefined,
        bloodGlucose: '',
        notes: '',
        recordedDate: new Date().toISOString()
      });
      setOriginalVital(null);
      setSubmissionError(null);
    }
  }, [isOpen, event, vitalSigns, measurementUnit]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'notes' || field === 'weight' || field === 'height' || field === 'temperature' || field === 'bloodGlucose'
        ? value 
        : (value ? Number(value) : undefined)
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
      formData.weight !== '',
      formData.height !== '',
      formData.temperature !== '',
      formData.oxygenSaturation !== undefined,
      formData.bloodGlucose !== ''
    ].some(Boolean);

    if (!hasAtLeastOneVital) {
      setSubmissionError("Please provide at least one vital sign value.");
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      // Convert display values to storage values (metric)
      const vitalUpdates: Partial<VitalSigns> = {
        bloodPressureSystolic: formData.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ?? null,
        heartRate: formData.heartRate ?? null,
        weight: formData.weight ? toStorageWeight(parseFloat(formData.weight), measurementUnit) : null,
        height: formData.height ? toStorageHeight(parseFloat(formData.height), measurementUnit) : null,
        temperature: formData.temperature ? toStorageTemperature(parseFloat(formData.temperature), measurementUnit) : null,
        oxygenSaturation: formData.oxygenSaturation ?? null,
        bloodGlucose: formData.bloodGlucose ? toStorageGlucose(parseFloat(formData.bloodGlucose), measurementUnit) : null,
        notes: formData.notes || null,
        recordedDate: formData.recordedDate || new Date().toISOString()
      };
      
      await updateVitalSigns(event.relatedId, vitalUpdates);

      // Update the timeline event's title and details (display in user's preferred unit)
      const details = [];
      if (vitalUpdates.bloodPressureSystolic && vitalUpdates.bloodPressureDiastolic) {
        details.push(`BP: ${vitalUpdates.bloodPressureSystolic}/${vitalUpdates.bloodPressureDiastolic} mmHg`);
      }
      if (vitalUpdates.heartRate) details.push(`HR: ${vitalUpdates.heartRate} bpm`);
      if (formData.weight) details.push(`Weight: ${formData.weight} ${getWeightUnit(measurementUnit)}`);
      if (formData.height) details.push(`Height: ${formData.height} ${getHeightUnit(measurementUnit)}`);
      if (formData.temperature) details.push(`Temp: ${formData.temperature}${getTemperatureUnit(measurementUnit)}`);
      if (vitalUpdates.oxygenSaturation) details.push(`SpO2: ${vitalUpdates.oxygenSaturation}%`);
      if (formData.bloodGlucose) details.push(`Glucose: ${formData.bloodGlucose} ${getGlucoseUnit(measurementUnit)}`);
      
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
              <Label htmlFor="weight">Weight ({getWeightUnit(measurementUnit)})</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder={getWeightPlaceholder(measurementUnit)}
              />
            </div>
            <div>
              <Label htmlFor="height">Height ({getHeightUnit(measurementUnit)})</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder={getHeightPlaceholder(measurementUnit)}
              />
            </div>
          </div>

          {/* Temperature and Oxygen Saturation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature">Temperature ({getTemperatureUnit(measurementUnit)})</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder={getTemperaturePlaceholder(measurementUnit)}
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

          {/* Blood Glucose (Diabetes) */}
          <div>
            <Label htmlFor="bloodGlucose">Blood Glucose ({getGlucoseUnit(measurementUnit)})</Label>
            <Input
              id="bloodGlucose"
              type="number"
              step="0.1"
              value={formData.bloodGlucose}
              onChange={(e) => handleInputChange('bloodGlucose', e.target.value)}
              placeholder={getGlucosePlaceholder(measurementUnit)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Normal fasting: {getGlucoseNormalRange(measurementUnit)}
            </p>
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
