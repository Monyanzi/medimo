
import { CriticalVitalRanges, VitalAlert, VitalRange } from '@/types/vitals';

export const DEFAULT_VITAL_RANGES: CriticalVitalRanges = {
  bloodPressureSystolic: { min: 90, max: 140, unit: 'mmHg' },
  bloodPressureDiastolic: { min: 60, max: 90, unit: 'mmHg' },
  heartRate: { min: 60, max: 100, unit: 'bpm' },
  temperature: { min: 97.0, max: 99.5, unit: '°F' },
  oxygenSaturation: { min: 95, max: 100, unit: '%' }
};

export type VitalStatus = 'normal' | 'warning' | 'critical';

export const checkVitalInRange = (value: number, range: VitalRange): VitalStatus => {
  if (value < range.min || value > range.max) {
    // Critical if very far outside range
    const deviation = Math.max(
      Math.abs(value - range.min) / range.min,
      Math.abs(value - range.max) / range.max
    );
    return deviation > 0.3 ? 'critical' : 'warning';
  }
  return 'normal';
};

export const getVitalStatusColor = (status: VitalStatus): string => {
  switch (status) {
    case 'critical': return 'text-red-600';
    case 'warning': return 'text-orange-500';
    default: return 'text-green-600';
  }
};

export const getVitalMessage = (vitalType: string, value: number, status: VitalStatus): string => {
  const messages = {
    critical: {
      bloodPressureSystolic: 'Blood pressure is critically high. Seek immediate medical attention.',
      bloodPressureDiastolic: 'Blood pressure is critically abnormal. Contact your doctor immediately.',
      heartRate: 'Heart rate is at dangerous levels. Seek medical help now.',
      temperature: 'Temperature indicates serious condition. Contact healthcare provider immediately.',
      oxygenSaturation: 'Oxygen levels are critically low. Seek emergency care.'
    },
    warning: {
      bloodPressureSystolic: 'Blood pressure is elevated. Monitor closely.',
      bloodPressureDiastolic: 'Blood pressure reading is concerning. Consider consulting your doctor.',
      heartRate: 'Heart rate is outside normal range. Monitor and rest.',
      temperature: 'Temperature is elevated. Monitor symptoms.',
      oxygenSaturation: 'Oxygen levels are low. Rest and monitor breathing.'
    }
  };

  if (status === 'normal') return 'Reading is within normal range.';
  return messages[status][vitalType as keyof typeof messages[typeof status]] || `${vitalType} reading needs attention.`;
};
