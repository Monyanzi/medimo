
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
import { useHealthData } from "@/contexts/HealthDataContext";
import { Activity } from "lucide-react";

interface LogVitalsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const LogVitalsModal: React.FC<LogVitalsModalProps> = ({ isOpen, onOpenChange }) => {
  const { addVitalSigns } = useHealthData();
  const [formData, setFormData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    weight: '',
    height: '',
    temperature: '',
    oxygenSaturation: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const vitalsData = {
        bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : undefined,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : undefined,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : undefined,
        notes: formData.notes || undefined,
        recordedDate: new Date().toISOString()
      };

      await addVitalSigns(vitalsData);
      
      // Reset form
      setFormData({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        weight: '',
        height: '',
        temperature: '',
        oxygenSaturation: '',
        notes: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving vital signs:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.bloodPressureSystolic || formData.heartRate || formData.weight || 
           formData.temperature || formData.oxygenSaturation;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-red-500" />
            <span>Log Vital Signs</span>
          </DialogTitle>
          <DialogDescription>
            Record your current vital signs and measurements
          </DialogDescription>
        </DialogHeader>
        
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
              />
            </div>
            <div>
              <Label htmlFor="diastolic">Diastolic BP</Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                value={formData.bloodPressureDiastolic}
                onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
              />
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
            />
          </div>

          {/* Weight and Height */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="150"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="height">Height (in)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="68"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
            </div>
          </div>

          {/* Temperature */}
          <div>
            <Label htmlFor="temperature">Temperature (°F)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="98.6"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
            />
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
            />
          </div>

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
          >
            {isSubmitting ? 'Saving...' : 'Save Vitals'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogVitalsModal;
