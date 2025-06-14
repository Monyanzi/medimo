
import { format, parseISO, isToday } from 'date-fns';

export interface MedicationReminder {
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  frequency: string;
  isCompleted: boolean;
}

export interface DailyReminders {
  date: string;
  reminders: MedicationReminder[];
}

class MedicationReminderService {
  private reminders: DailyReminders[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('medicationReminders');
    if (saved) {
      this.reminders = JSON.parse(saved);
    }
  }

  private saveToStorage() {
    localStorage.setItem('medicationReminders', JSON.stringify(this.reminders));
  }

  generateDailyReminders(medications: any[]) {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Check if we already have reminders for today
    const existingIndex = this.reminders.findIndex(r => r.date === today);
    
    const todayReminders: MedicationReminder[] = [];
    
    medications.filter(med => med.status === 'active').forEach(med => {
      const times = this.parseFrequencyToTimes(med.frequency);
      
      times.forEach(time => {
        todayReminders.push({
          medicationId: med.id,
          medicationName: med.name,
          dosage: med.dosage,
          scheduledTime: time,
          frequency: med.frequency,
          isCompleted: false
        });
      });
    });

    if (existingIndex >= 0) {
      // Update existing reminders, preserving completion status
      const existing = this.reminders[existingIndex];
      todayReminders.forEach(newReminder => {
        const existingReminder = existing.reminders.find(
          r => r.medicationId === newReminder.medicationId && r.scheduledTime === newReminder.scheduledTime
        );
        if (existingReminder) {
          newReminder.isCompleted = existingReminder.isCompleted;
        }
      });
      this.reminders[existingIndex] = { date: today, reminders: todayReminders };
    } else {
      this.reminders.push({ date: today, reminders: todayReminders });
    }

    this.saveToStorage();
    return todayReminders;
  }

  private parseFrequencyToTimes(frequency: string): string[] {
    const freq = frequency.toLowerCase();
    
    if (freq.includes('once daily') || freq.includes('daily')) {
      return ['08:00']; // 8 AM
    } else if (freq.includes('twice daily') || freq.includes('twice')) {
      return ['08:00', '20:00']; // 8 AM and 8 PM
    } else if (freq.includes('three times') || freq.includes('3 times')) {
      return ['08:00', '14:00', '20:00']; // 8 AM, 2 PM, 8 PM
    } else if (freq.includes('four times') || freq.includes('4 times')) {
      return ['08:00', '12:00', '16:00', '20:00']; // Every 4 hours during day
    } else if (freq.includes('every 6 hours')) {
      return ['06:00', '12:00', '18:00', '00:00'];
    } else if (freq.includes('every 8 hours')) {
      return ['08:00', '16:00', '00:00'];
    } else if (freq.includes('every 12 hours')) {
      return ['08:00', '20:00'];
    }
    
    // Default to once daily if we can't parse
    return ['08:00'];
  }

  getTodaysReminders(): MedicationReminder[] {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayData = this.reminders.find(r => r.date === today);
    return todayData?.reminders || [];
  }

  markReminderCompleted(medicationId: string, scheduledTime: string) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayIndex = this.reminders.findIndex(r => r.date === today);
    
    if (todayIndex >= 0) {
      const reminderIndex = this.reminders[todayIndex].reminders.findIndex(
        r => r.medicationId === medicationId && r.scheduledTime === scheduledTime
      );
      
      if (reminderIndex >= 0) {
        this.reminders[todayIndex].reminders[reminderIndex].isCompleted = true;
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  getPendingReminders(): MedicationReminder[] {
    const todayReminders = this.getTodaysReminders();
    return todayReminders.filter(r => !r.isCompleted);
  }

  getOverdueReminders(): MedicationReminder[] {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    
    return this.getPendingReminders().filter(reminder => {
      return reminder.scheduledTime <= currentTime;
    });
  }

  getCompletionRate(): number {
    const todayReminders = this.getTodaysReminders();
    if (todayReminders.length === 0) return 100;
    
    const completed = todayReminders.filter(r => r.isCompleted).length;
    return Math.round((completed / todayReminders.length) * 100);
  }
}

export const medicationReminderService = new MedicationReminderService();
