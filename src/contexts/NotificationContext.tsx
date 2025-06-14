
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHealthData } from './HealthDataContext';
import { format, parseISO, isToday, isTomorrow, addHours } from 'date-fns';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'medication' | 'appointment' | 'info';
  timestamp: string;
  isRead: boolean;
  relatedId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
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
  const { medications, appointments } = useHealthData();

  // Generate notifications based on health data
  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Medication reminders (mock - in real app this would be time-based)
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

    // Upcoming appointment notifications
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

    // Only update if there are new notifications to avoid infinite loops
    if (newNotifications.length > 0 && notifications.length === 0) {
      setNotifications(newNotifications);
    }
  }, [medications, appointments, notifications.length]);

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
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
