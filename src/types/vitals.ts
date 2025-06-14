
export interface VitalRange {
  min: number;
  max: number;
  unit: string;
}

export interface CriticalVitalRanges {
  bloodPressureSystolic: VitalRange;
  bloodPressureDiastolic: VitalRange;
  heartRate: VitalRange;
  temperature: VitalRange;
  oxygenSaturation: VitalRange;
}

export interface VitalAlert {
  id: string;
  vitalType: string;
  value: number;
  range: VitalRange;
  severity: 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

export interface CaregiverInfo {
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isEmergencyContact: boolean;
}

export interface CheckInSettings {
  enabled: boolean;
  frequency: 'daily' | 'twice-daily' | 'custom';
  customHours?: number;
  reminderTime?: string;
  missedCheckInThreshold: number; // minutes before alert
}

export type VitalStatus = 'normal' | 'warning' | 'critical';
