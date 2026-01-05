import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type { MeasurementUnit } from '@/utils/unitConversions';

// Types
export interface AppSettings {
  language: string;
  region: string;
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  measurementUnit: MeasurementUnit;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  vitalSignsReminders: boolean;
  caregiverAlerts: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

export interface AppSettingsContextType extends AppSettings {
  setLanguage: (v: string) => void;
  setRegion: (v: string) => void;
  setTimeFormat: (v: '12h' | '24h') => void;
  setDateFormat: (v: AppSettings['dateFormat']) => void;
  setMeasurementUnit: (v: MeasurementUnit) => void;
  setMedicationReminders: (v: boolean) => void;
  setAppointmentReminders: (v: boolean) => void;
  setVitalSignsReminders: (v: boolean) => void;
  setCaregiverAlerts: (v: boolean) => void;
  setPushNotifications: (v: boolean) => void;
  setEmailNotifications: (v: boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  region: 'US',
  timeFormat: '24h',
  dateFormat: 'DD/MM/YYYY',
  measurementUnit: 'metric',
  medicationReminders: true,
  appointmentReminders: true,
  vitalSignsReminders: false,
  caregiverAlerts: true,
  pushNotifications: true,
  emailNotifications: false
};

const BASE_KEY = 'medimo_app_settings_v2'; // v2 to differentiate from legacy NotificationContext storage

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const useAppSettings = () => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
};

export const AppSettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  const key = useCallback(() => user ? `${BASE_KEY}__${user.id}` : `${BASE_KEY}__anon`, [user]);

  // Legacy migration: pull from old NotificationContext key once if new key absent
  const migrateIfNeeded = useCallback(() => {
    const targetKey = key();
    if (localStorage.getItem(targetKey)) return; // Already has new format
    // Legacy pattern: medimo_app_settings__<userId> OR base without user id
    const legacyKey = user ? `medimo_app_settings__${user.id}` : 'medimo_app_settings';
    const legacy = localStorage.getItem(legacyKey);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        setSettings(prev => ({ ...prev, ...parsed }));
        localStorage.setItem(targetKey, JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, [key, user]);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(key());
      if (existing) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(existing) });
      } else {
        migrateIfNeeded();
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setHydrated(true);
    }
  }, [key, migrateIfNeeded]);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(key(), JSON.stringify(settings)); } catch { /* noop */ }
  }, [settings, key, hydrated]);

  const update = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => setSettings(s => ({ ...s, [k]: v }));

  const value: AppSettingsContextType = {
    ...settings,
    setLanguage: v => update('language', v),
    setRegion: v => update('region', v),
    setTimeFormat: v => update('timeFormat', v),
    setDateFormat: v => update('dateFormat', v),
    setMeasurementUnit: v => update('measurementUnit', v),
    setMedicationReminders: v => update('medicationReminders', v),
    setAppointmentReminders: v => update('appointmentReminders', v),
    setVitalSignsReminders: v => update('vitalSignsReminders', v),
    setCaregiverAlerts: v => update('caregiverAlerts', v),
    setPushNotifications: v => update('pushNotifications', v),
    setEmailNotifications: v => update('emailNotifications', v),
    resetToDefaults: () => setSettings(DEFAULT_SETTINGS)
  };

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};
