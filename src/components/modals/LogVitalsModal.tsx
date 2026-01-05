
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useHealthData } from "@/contexts/HealthDataContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { Activity, AlertTriangle } from "lucide-react";
import { checkVitalInRange, DEFAULT_VITAL_RANGES, getVitalStatusColor, getVitalMessage, VitalStatus } from "@/utils/vitalsUtils";
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

interface LogVitalsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialData?: {
    id?: string;
    bloodPressureSystolic?: number | null;
    bloodPressureDiastolic?: number | null;
    heartRate?: number | null;
    weight?: number | null;
    height?: number | null;
    temperature?: number | null;
    oxygenSaturation?: number | null;
    bloodGlucose?: number | null;
    notes?: string | null;
    recordedDate?: string;
  } | null;
}

const LogVitalsModal: React.FC<LogVitalsModalProps> = ({ isOpen, onOpenChange, initialData = null }) => {
  const { addVitalSigns, updateVitalSigns } = useHealthData();
  const { measurementUnit } = useAppSettings();
  
  // Convert stored metric values to display values based on user preference
  const toDisplayValue = (value: number | null | undefined, converter: (v: number, u: typeof measurementUnit) => number) => {
    if (value == null) return '';
    return converter(value, measurementUnit).toFixed(1);
  };

  const [formData, setFormData] = useState({
    bloodPressureSystolic: initialData?.bloodPressureSystolic?.toString() || '',
    bloodPressureDiastolic: initialData?.bloodPressureDiastolic?.toString() || '',
    heartRate: initialData?.heartRate?.toString() || '',
    weight: toDisplayValue(initialData?.weight, fromStorageWeight),
    height: toDisplayValue(initialData?.height, fromStorageHeight),
    temperature: toDisplayValue(initialData?.temperature, fromStorageTemperature),
    oxygenSaturation: initialData?.oxygenSaturation?.toString() || '',
    bloodGlucose: toDisplayValue(initialData?.bloodGlucose, fromStorageGlucose),
    notes: initialData?.notes?.toString() || ''
  });
  
  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        bloodPressureSystolic: initialData.bloodPressureSystolic?.toString() || '',
        bloodPressureDiastolic: initialData.bloodPressureDiastolic?.toString() || '',
        heartRate: initialData.heartRate?.toString() || '',
        weight: toDisplayValue(initialData.weight, fromStorageWeight),
        height: toDisplayValue(initialData.height, fromStorageHeight),
        temperature: toDisplayValue(initialData.temperature, fromStorageTemperature),
        oxygenSaturation: initialData.oxygenSaturation?.toString() || '',
        bloodGlucose: toDisplayValue(initialData.bloodGlucose, fromStorageGlucose),
        notes: initialData.notes?.toString() || ''
      });
    } else {
      setFormData({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        weight: '',
        height: '',
        temperature: '',
        oxygenSaturation: '',
        bloodGlucose: '',
        notes: ''
      });
    }
  }, [initialData]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vitalsAlerts, setVitalsAlerts] = useState<{[key: string]: { status: VitalStatus; message: string }}>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null); // Added error state

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time vital checking for critical ranges
    if (value && DEFAULT_VITAL_RANGES[field as keyof typeof DEFAULT_VITAL_RANGES]) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const status = checkVitalInRange(numValue, DEFAULT_VITAL_RANGES[field as keyof typeof DEFAULT_VITAL_RANGES]);
        const message = getVitalMessage(field, numValue, status);
        
        setVitalsAlerts(prev => ({
          ...prev,
          [field]: { status, message }
        }));
      }
    } else {
      setVitalsAlerts(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    setSubmissionError(null); // Clear previous submission errors
    setIsSubmitting(true);
    try {
      // Basic form validation (at least one vital sign should be entered)
      if (!isFormValid()) {
        setSubmissionError("Please enter at least one vital sign value.");
        setIsSubmitting(false);
        return;
      }

      // Convert display values to storage values (metric)
      const vitalsData = {
        bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
        weight: formData.weight ? toStorageWeight(parseFloat(formData.weight), measurementUnit) : null,
        height: formData.height ? toStorageHeight(parseFloat(formData.height), measurementUnit) : null,
        temperature: formData.temperature ? toStorageTemperature(parseFloat(formData.temperature), measurementUnit) : null,
        oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : null,
        bloodGlucose: formData.bloodGlucose ? toStorageGlucose(parseFloat(formData.bloodGlucose), measurementUnit) : null,
        notes: formData.notes || null,
        recordedDate: initialData?.recordedDate || new Date().toISOString()
      };

      if (initialData?.id) {
        // Update existing vitals
        await updateVitalSigns(initialData.id, vitalsData);
      } else {
        // Add new vitals
        await addVitalSigns(vitalsData);
      }
      
      // Reset form
      if (!initialData) {
        setFormData({
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          heartRate: '',
          weight: '',
          height: '',
          temperature: '',
          oxygenSaturation: '',
          bloodGlucose: '',
          notes: ''
        });
        setVitalsAlerts({});
      }
      
      onOpenChange(false); // Close modal on success
    } catch (error) {
      console.error('Error saving vital signs:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save vital signs. Please try again.";
      setSubmissionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.bloodPressureSystolic || formData.heartRate || formData.weight || 
           formData.temperature || formData.oxygenSaturation || formData.bloodGlucose;
  };

  const hasCriticalAlerts = Object.values(vitalsAlerts).some(alert => alert.status === 'critical');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-red-500" />
            <span>{initialData?.id ? 'Edit' : 'Log'} Vital Signs</span>
          </DialogTitle>
          <DialogDescription>
            Record your current vital signs and measurements
          </DialogDescription>
        </DialogHeader>

        {submissionError && (
          <Alert variant="destructive" className="my-2"> {/* Adjusted margin */}
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
                placeholder="120"
                value={formData.bloodPressureSystolic}
                onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)}
                className={vitalsAlerts.bloodPressureSystolic?.status === 'critical' ? 'border-red-500' : ''}
              />
              {vitalsAlerts.bloodPressureSystolic && (
                <div className={`text-xs mt-1 ${getVitalStatusColor(vitalsAlerts.bloodPressureSystolic.status)}`}>
                  {vitalsAlerts.bloodPressureSystolic.status === 'normal' ? '✓ Normal' : 
                   vitalsAlerts.bloodPressureSystolic.status === 'warning' ? '⚠ High' : '🚨 Critical'}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="diastolic">Diastolic BP</Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                value={formData.bloodPressureDiastolic}
                onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
                className={vitalsAlerts.bloodPressureDiastolic?.status === 'critical' ? 'border-red-500' : ''}
              />
              {vitalsAlerts.bloodPressureDiastolic && (
                <div className={`text-xs mt-1 ${getVitalStatusColor(vitalsAlerts.bloodPressureDiastolic.status)}`}>
                  {vitalsAlerts.bloodPressureDiastolic.status === 'normal' ? '✓ Normal' : 
                   vitalsAlerts.bloodPressureDiastolic.status === 'warning' ? '⚠ High' : '🚨 Critical'}
                </div>
              )}
            </div>
          </div>

          {/* Heart Rate */}
          <div>
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              value={formData.heartRate}
              onChange={(e) => handleInputChange('heartRate', e.target.value)}
              className={vitalsAlerts.heartRate?.status === 'critical' ? 'border-red-500' : ''}
            />
            {vitalsAlerts.heartRate && (
              <div className={`text-xs mt-1 ${getVitalStatusColor(vitalsAlerts.heartRate.status)}`}>
                {vitalsAlerts.heartRate.status === 'normal' ? '✓ Normal' : 
                 vitalsAlerts.heartRate.status === 'warning' ? '⚠ Abnormal' : '🚨 Critical'}
              </div>
            )}
          </div>

          {/* Weight and Height */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="weight">Weight ({getWeightUnit(measurementUnit)})</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder={getWeightPlaceholder(measurementUnit)}
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="height">Height ({getHeightUnit(measurementUnit)})</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder={getHeightPlaceholder(measurementUnit)}
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
            </div>
          </div>

          {/* Temperature */}
          <div>
            <Label htmlFor="temperature">Temperature ({getTemperatureUnit(measurementUnit)})</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder={getTemperaturePlaceholder(measurementUnit)}
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              className={vitalsAlerts.temperature?.status === 'critical' ? 'border-red-500' : ''}
            />
            {vitalsAlerts.temperature && (
              <div className={`text-xs mt-1 ${getVitalStatusColor(vitalsAlerts.temperature.status)}`}>
                {vitalsAlerts.temperature.status === 'normal' ? '✓ Normal' : 
                 vitalsAlerts.temperature.status === 'warning' ? '⚠ Elevated' : '🚨 Critical'}
              </div>
            )}
          </div>

          {/* Oxygen Saturation */}
          <div>
            <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
            <Input
              id="oxygenSaturation"
              type="number"
              placeholder="98"
              value={formData.oxygenSaturation}
              onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
              className={vitalsAlerts.oxygenSaturation?.status === 'critical' ? 'border-red-500' : ''}
            />
            {vitalsAlerts.oxygenSaturation && (
              <div className={`text-xs mt-1 ${getVitalStatusColor(vitalsAlerts.oxygenSaturation.status)}`}>
                {vitalsAlerts.oxygenSaturation.status === 'normal' ? '✓ Normal' : 
                 vitalsAlerts.oxygenSaturation.status === 'warning' ? '⚠ Low' : '🚨 Critical'}
              </div>
            )}
          </div>

          {/* Blood Glucose (Diabetes) */}
          <div>
            <Label htmlFor="bloodGlucose">Blood Glucose ({getGlucoseUnit(measurementUnit)})</Label>
            <Input
              id="bloodGlucose"
              type="number"
              step="0.1"
              placeholder={getGlucosePlaceholder(measurementUnit)}
              value={formData.bloodGlucose}
              onChange={(e) => handleInputChange('bloodGlucose', e.target.value)}
              className={vitalsAlerts.bloodGlucose?.status === 'critical' ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Normal fasting: {getGlucoseNormalRange(measurementUnit)}
            </p>
            {vitalsAlerts.bloodGlucose && (
              <div className={`text-xs mt-1 ${getVitalStatusColor(vitalsAlerts.bloodGlucose.status)}`}>
                {vitalsAlerts.bloodGlucose.status === 'normal' ? '✓ Normal' : 
                 vitalsAlerts.bloodGlucose.status === 'warning' ? '⚠ Elevated' : '🚨 Critical'}
              </div>
            )}
          </div>

          {/* Critical Alerts */}
          {hasCriticalAlerts && (
            <Alert className="border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                <strong>Critical readings detected!</strong> Consider seeking immediate medical attention for any critical values.
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the readings..."
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
            className={hasCriticalAlerts ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isSubmitting ? 'Saving...' : hasCriticalAlerts ? 'Save Critical Vitals' : 'Save Vitals'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogVitalsModal;
