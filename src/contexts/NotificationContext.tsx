
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHealthData } from './HealthDataContext';
import { useAuth } from './AuthContext';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { caregiverNotificationService } from '@/services/caregiverNotificationService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'medication' | 'appointment' | 'info' | 'caregiver-alert' | 'safety-checkin';
  timestamp: string;
  isRead: boolean;
  relatedId?: string;
  severity?: 'warning' | 'critical';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  checkForMissedCheckIns: () => void;

  // Preferences (read-only snapshot; gating logic only)
  medicationReminders: boolean;
  appointmentReminders: boolean;
  vitalSignsReminders: boolean;
  caregiverAlerts: boolean;
}

// Base key for app settings; actual storage will be user-scoped
// Legacy: settings moved to AppSettingsContext. Keep minimal preference flags for generation gating.

interface AppSettings {
  language: string;
  region: string;
  timeFormat: string;
  dateFormat: string;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  vitalSignsReminders: boolean;
  caregiverAlerts: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { medications, appointments } = useHealthData(); // Assuming this hook doesn't cause re-renders if data is stable
  const { user } = useAuth(); // Assuming this hook doesn't cause re-renders if user is stable

  // App Settings State
  // Removed language/region/time/date (now in AppSettingsContext)
  const [medicationReminders, setMedicationRemindersState] = useState<boolean>(true);
  const [appointmentReminders, setAppointmentRemindersState] = useState<boolean>(true);
  const [vitalSignsReminders, setVitalSignsRemindersState] = useState<boolean>(false);
  const [caregiverAlerts, setCaregiverAlertsState] = useState<boolean>(true);

  // Compute a user-scoped key when user changes
  // Legacy persistence removed (now handled centrally in AppSettingsContext)
  const setMedicationReminders = (enabled: boolean) => { setMedicationRemindersState(enabled); };
  const setAppointmentReminders = (enabled: boolean) => { setAppointmentRemindersState(enabled); };
  const setVitalSignsReminders = (enabled: boolean) => { setVitalSignsRemindersState(enabled); };
  const setCaregiverAlerts = (enabled: boolean) => { setCaregiverAlertsState(enabled); };

  // Check for missed check-ins periodically
  const checkForMissedCheckIns = () => {
    if (!user || !user.caregiver?.checkInSettings?.enabled) return;

    const missedCheckInAlert = caregiverNotificationService.checkForMissedCheckIn(user);
    if (missedCheckInAlert) {
      // Add notification for user
      addNotification({
        title: 'Missed Check-in Alert',
        message: 'Your caregiver has been notified about your missed check-in.',
        type: 'safety-checkin',
        severity: missedCheckInAlert.severity
      });

      // Send alert to caregiver
      caregiverNotificationService.sendAlert(missedCheckInAlert, user.caregiver);
    }
  };

  // Generate notifications based on health data
  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Medication reminders (mock - in real app this would be time-based)
    if (medicationReminders) { // Check preference
      medications.filter(med => med.status === 'active').forEach(med => {
        if (med.frequency.includes('daily') || med.frequency.includes('twice')) {
          newNotifications.push({
            id: `med-${med.id}-${Date.now()}`,
            title: 'Medication Reminder',
            message: `Take ${med.name} ${med.dosage} - ${med.frequency}`,
            type: 'medication',
            timestamp: new Date().toISOString(),
            isRead: false,
            relatedId: med.id
          });
        }
      });
    }

    // Upcoming appointment notifications
    if (appointmentReminders) { // Check preference
      appointments.forEach(apt => {
        const aptDate = parseISO(apt.dateTime);
        if (isToday(aptDate) || isTomorrow(aptDate)) {
          const timeStr = isToday(aptDate) ? 'today' : 'tomorrow';
          const timeFormatted = format(aptDate, 'h:mm a');

          newNotifications.push({
            id: `apt-${apt.id}-${Date.now()}`,
            title: 'Upcoming Appointment',
            message: `${apt.title} ${timeStr} at ${timeFormatted}`,
            type: 'appointment',
            timestamp: new Date().toISOString(),
            isRead: false,
            relatedId: apt.id
          });
        }
      });
    }

    // Only update if there are new notifications to avoid infinite loops
    // This condition might need refinement if settings change and should re-trigger notifications
    if (newNotifications.length > 0 && notifications.length === 0) {
      setNotifications(newNotifications);
    }
  }, [medications, appointments, notifications.length, medicationReminders, appointmentReminders]);

  // Check for missed check-ins every 5 minutes
  useEffect(() => {
    if (caregiverAlerts) { // Check preference
      checkForMissedCheckIns(); // Check immediately
      const interval = setInterval(checkForMissedCheckIns, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, caregiverAlerts]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      checkForMissedCheckIns,
  // Minimal preference flags kept locally (will migrate to AppSettingsContext consumption later)
  medicationReminders,
  appointmentReminders,
  vitalSignsReminders,
  caregiverAlerts
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
