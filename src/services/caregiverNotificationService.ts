
import { User } from '@/types';
import { VitalStatus } from '@/types/vitals';

export interface CaregiverAlert {
  type: 'missed-checkin' | 'critical-vitals' | 'emergency';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: string;
  patientName: string;
  vitalData?: {
    type: string;
    value: number;
    status: VitalStatus;
  };
}

class CaregiverNotificationService {
  private getLastCheckIn(): Date | null {
    const lastCheckIn = localStorage.getItem('lastDailyCheckIn');
    return lastCheckIn ? new Date(lastCheckIn) : null;
  }

  private getLastSafetyCheckIn(): Date | null {
    const settings = localStorage.getItem('safetyCheckInSettings');
    if (!settings) return null;
    
    const parsed = JSON.parse(settings);
    return parsed.lastCheckIn ? new Date(parsed.lastCheckIn) : null;
  }

  public checkForMissedCheckIn(user: User): CaregiverAlert | null {
    if (!user.caregiver?.checkInSettings?.enabled) return null;

    const lastCheckIn = this.getLastSafetyCheckIn() || this.getLastCheckIn();
    if (!lastCheckIn) return null;

    const now = new Date();
    const timeDiff = now.getTime() - lastCheckIn.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    const threshold = user.caregiver.checkInSettings.missedCheckInThreshold || 60;

    if (minutesDiff > threshold) {
      return {
        type: 'missed-checkin',
        severity: minutesDiff > threshold * 2 ? 'critical' : 'warning',
        message: `${user.name} has not checked in for ${Math.round(minutesDiff)} minutes. Last check-in: ${lastCheckIn.toLocaleString()}`,
        timestamp: now.toISOString(),
        patientName: user.name
      };
    }

    return null;
  }

  public createCriticalVitalAlert(user: User, vitalType: string, value: number, status: VitalStatus): CaregiverAlert {
    // Only create alerts for warning and critical statuses, skip normal
    const alertSeverity: 'warning' | 'critical' = status === 'critical' ? 'critical' : 'warning';
    
    return {
      type: 'critical-vitals',
      severity: alertSeverity,
      message: `${user.name} has ${status} ${vitalType} reading: ${value}. Immediate attention may be required.`,
      timestamp: new Date().toISOString(),
      patientName: user.name,
      vitalData: {
        type: vitalType,
        value,
        status
      }
    };
  }

  public async sendAlert(alert: CaregiverAlert, caregiver: NonNullable<User['caregiver']>): Promise<void> {
    console.log('Sending caregiver alert:', alert);
    console.log('To caregiver:', caregiver);

    // In a real implementation, this would:
    // 1. Send SMS to caregiver.phone
    // 2. Send email to caregiver.email (if provided)
    // 3. Make API call to notification service
    // 4. Store alert in database for tracking
    
    // For now, we'll simulate the notification
    const notificationData = {
      recipient: {
        phone: caregiver.phone,
        email: caregiver.email,
        name: caregiver.name
      },
      alert,
      timestamp: new Date().toISOString()
    };

    // Store locally for demo purposes
    const existingAlerts = JSON.parse(localStorage.getItem('caregiverAlerts') || '[]');
    existingAlerts.push(notificationData);
    localStorage.setItem('caregiverAlerts', JSON.stringify(existingAlerts));

    console.log('Alert sent successfully:', notificationData);
  }

  public getRecentAlerts(): any[] {
    return JSON.parse(localStorage.getItem('caregiverAlerts') || '[]');
  }
}

export const caregiverNotificationService = new CaregiverNotificationService();
