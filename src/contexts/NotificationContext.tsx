
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

  // App Settings
  language: string;
  setLanguage: (language: string) => void;
  region: string;
  setRegion: (region: string) => void;
  timeFormat: string;
  setTimeFormat: (format: string) => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;

  // Notification Preferences
  medicationReminders: boolean;
  setMedicationReminders: (enabled: boolean) => void;
  appointmentReminders: boolean;
  setAppointmentReminders: (enabled: boolean) => void;
  vitalSignsReminders: boolean;
  setVitalSignsReminders: (enabled: boolean) => void;
  caregiverAlerts: boolean;
  setCaregiverAlerts: (enabled: boolean) => void;
  pushNotifications: boolean;
  setPushNotifications: (enabled: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
}

const APP_SETTINGS_KEY = 'medimo_app_settings';

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
  const [language, setLanguageState] = useState<string>('en');
  const [region, setRegionState] = useState<string>('US');
  const [timeFormat, setTimeFormatState] = useState<string>('12h');
  const [dateFormat, setDateFormatState] = useState<string>('MM/DD/YYYY');
  const [medicationReminders, setMedicationRemindersState] = useState<boolean>(true);
  const [appointmentReminders, setAppointmentRemindersState] = useState<boolean>(true);
  const [vitalSignsReminders, setVitalSignsRemindersState] = useState<boolean>(false);
  const [caregiverAlerts, setCaregiverAlertsState] = useState<boolean>(true);
  const [pushNotifications, setPushNotificationsState] = useState<boolean>(true);
  const [emailNotifications, setEmailNotificationsState] = useState<boolean>(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(APP_SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings: AppSettings = JSON.parse(savedSettings);
        setLanguageState(parsedSettings.language || 'en');
        setRegionState(parsedSettings.region || 'US');
        setTimeFormatState(parsedSettings.timeFormat || '12h');
        setDateFormatState(parsedSettings.dateFormat || 'MM/DD/YYYY');
        setMedicationRemindersState(parsedSettings.medicationReminders !== undefined ? parsedSettings.medicationReminders : true);
        setAppointmentRemindersState(parsedSettings.appointmentReminders !== undefined ? parsedSettings.appointmentReminders : true);
        setVitalSignsRemindersState(parsedSettings.vitalSignsReminders !== undefined ? parsedSettings.vitalSignsReminders : false);
        setCaregiverAlertsState(parsedSettings.caregiverAlerts !== undefined ? parsedSettings.caregiverAlerts : true);
        setPushNotificationsState(parsedSettings.pushNotifications !== undefined ? parsedSettings.pushNotifications : true);
        setEmailNotificationsState(parsedSettings.emailNotifications !== undefined ? parsedSettings.emailNotifications : false);
      }
    } catch (error) {
      console.error("Error loading app settings from localStorage:", error);
      // Defaults are already set, so no further action needed
    }
  }, []);

  const saveSettingsToLocalStorage = (settings: AppSettings) => {
    try {
      localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving app settings to localStorage:", error);
    }
  };

  // Setter functions that also save to localStorage
  const setLanguage = (lang: string) => { setLanguageState(lang); saveSettingsToLocalStorage(getCurrentAppSettings()); };
  const setRegion = (reg: string) => { setRegionState(reg); saveSettingsToLocalStorage(getCurrentAppSettings()); };
  const setTimeFormat = (tf: string) => { setTimeFormatState(tf); saveSettingsToLocalStorage(getCurrentAppSettings()); };
  const setDateFormat = (df: string) => { setDateFormatState(df); saveSettingsToLocalStorage(getCurrentAppSettings()); };
  const setMedicationReminders = (enabled: boolean) => { setMedicationRemindersState(enabled); saveSettingsToLocalStorage(getCurrentAppSettings()); };
  const setAppointmentReminders = (enabled: boolean) => { setAppointmentRemindersState(enabled); saveSettingsToLocalStorage(getCurrentAppSettings()); };
  const setVitalSignsReminders = (enabled: boolean) => { setVitalSignsRemindersState(enabled); saveSettingsToLocalStorage(getCurrentAppSettings()); };
  const setCaregiverAlerts = (enabled: boolean) => { setCaregiverAlertsState(enabled); saveSettingsToLocalStorage(getCurrentAppSettings()); };
  const setPushNotifications = (enabled: boolean) => { setPushNotificationsState(enabled); saveSettingsToLocalStorage(getCurrentAppSettings()); };
  const setEmailNotifications = (enabled: boolean) => { setEmailNotificationsState(enabled); saveSettingsToLocalStorage(getCurrentAppSettings()); };

  const getCurrentAppSettings = (): AppSettings => ({
    language, region, timeFormat, dateFormat,
    medicationReminders, appointmentReminders, vitalSignsReminders,
    caregiverAlerts, pushNotifications, emailNotifications
  });

  // Update localStorage whenever a setting changes
  useEffect(() => {
    saveSettingsToLocalStorage(getCurrentAppSettings());
  }, [
    language, region, timeFormat, dateFormat,
    medicationReminders, appointmentReminders, vitalSignsReminders,
    caregiverAlerts, pushNotifications, emailNotifications
  ]);

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
      // App Settings
      language,
      setLanguage,
      region,
      setRegion,
      timeFormat,
      setTimeFormat,
      dateFormat,
      setDateFormat,
      // Notification Preferences
      medicationReminders,
      setMedicationReminders,
      appointmentReminders,
      setAppointmentReminders,
      vitalSignsReminders,
      setVitalSignsReminders,
      caregiverAlerts,
      setCaregiverAlerts,
      pushNotifications,
      setPushNotifications,
      emailNotifications,
      setEmailNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
