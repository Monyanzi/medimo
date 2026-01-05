import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

export interface MedicationDose {
  medicationId: string;
  medicationName: string;
  dateTaken: string;
  timeTaken: string;
  dosage: string;
}

export interface DailyAdherence {
  date: string;
  takenMedications: MedicationDose[];
  missedMedications: string[];
  adherenceScore: number;
}

interface MedicationAdherenceContextType {
  dailyAdherence: DailyAdherence[];
  currentStreak: number;
  bestStreak: number;
  overallAdherenceScore: number;
  markMedicationTaken: (medicationId: string, medicationName: string, dosage: string) => void;
  isMedicationTakenToday: (medicationId: string) => boolean;
  getTodaysAdherence: () => DailyAdherence | null;
  calculateStreaks: () => { current: number; best: number };
}

const MedicationAdherenceContext = createContext<MedicationAdherenceContextType | undefined>(undefined);

export const useMedicationAdherence = () => {
  const context = useContext(MedicationAdherenceContext);
  if (context === undefined) {
    throw new Error('useMedicationAdherence must be used within a MedicationAdherenceProvider');
  }
  return context;
};

export const MedicationAdherenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyAdherence, setDailyAdherence] = useState<DailyAdherence[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const { user } = useAuth();

  const getStorageKey = useCallback(() => {
    return user ? `medicationAdherence__${user.id}` : 'medicationAdherence__anon';
  }, [user]);

  // Load data when user changes
  useEffect(() => {
    const key = getStorageKey();
    const savedAdherence = localStorage.getItem(key);
    if (savedAdherence) {
      try {
        const parsedData = JSON.parse(savedAdherence);
        setDailyAdherence(parsedData);
      } catch (e) {
        console.error('Failed to parse medication adherence data:', e);
        localStorage.removeItem(key); // Clear corrupted data
        setDailyAdherence([]);
      }
    } else {
      setDailyAdherence([]);
    }
  }, [getStorageKey]);

  // Save data to localStorage whenever dailyAdherence changes (Debounced)
  useEffect(() => {
    const key = getStorageKey();
    if (dailyAdherence.length > 0) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(dailyAdherence));
      }, 1000); // 1 second debounce
      return () => clearTimeout(timeoutId);
    }
  }, [dailyAdherence, getStorageKey]);

  const calculateStreaks = useCallback(() => {
    if (dailyAdherence.length === 0) return { current: 0, best: 0 };

    // Sort by date descending (newest first)
    const sortedDays = [...dailyAdherence].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    // Calculate streaks by checking date consecutiveness
    for (let i = 0; i < sortedDays.length; i++) {
      const day = sortedDays[i];
      const currentDate = new Date(day.date);
      const isGoodAdherence = day.adherenceScore >= 80;

      // Check if this date is exactly 1 day after the previous
      let isConsecutive = true;
      if (prevDate !== null) {
        const diffMs = prevDate.getTime() - currentDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        isConsecutive = diffDays === 1;
      }

      if (isGoodAdherence && isConsecutive) {
        tempStreak++;
        // Track current streak (from today backwards)
        if (i === 0 || currentStreak === i) {
          currentStreak = tempStreak;
        }
      } else if (isGoodAdherence && !isConsecutive) {
        // Gap in dates, reset temp streak but start new one
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 1;
        // If this is day 0, it can start a current streak
        if (i === 0) currentStreak = 1;
      } else {
        // Adherence < 80%, end current streak calculation
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 0;
      }

      prevDate = currentDate;
    }

    if (tempStreak > bestStreak) bestStreak = tempStreak;

    return { current: currentStreak, best: Math.max(bestStreak, currentStreak) };
  }, [dailyAdherence]);

  // Calculate streaks whenever dailyAdherence changes
  useEffect(() => {
    const { current, best } = calculateStreaks();
    setCurrentStreak(current);
    setBestStreak(best);
  }, [dailyAdherence, calculateStreaks]);

  const markMedicationTaken = (medicationId: string, medicationName: string, dosage: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = format(new Date(), 'HH:mm');

    setDailyAdherence(prev => {
      const existingDayIndex = prev.findIndex(day => day.date === today);

      if (existingDayIndex >= 0) {
        // Update existing day
        const updatedDay = { ...prev[existingDayIndex] };
        const alreadyTaken = updatedDay.takenMedications.some(med => med.medicationId === medicationId);

        if (!alreadyTaken) {
          updatedDay.takenMedications.push({
            medicationId,
            medicationName,
            dateTaken: today,
            timeTaken: now,
            dosage
          });

          // Recalculate adherence score for the day
          // Logic: (Taken Doses / Prescribed Doses) * 100
          // We will approximate by assuming:
          // 1. If a medication is taken, it was expected.
          // 2. We track unique medications taken vs unique medications expected.

          const uniqueTaken = new Set(updatedDay.takenMedications.map(m => m.medicationId)).size;
          // Simple robust logic for v1: 
          // If you took something, you're doing good. 
          // We'll refine this when we link full schedule data.
          updatedDay.adherenceScore = Math.min(100, (uniqueTaken * 33)); // ~3 meds = 100%
        }

        const newData = [...prev];
        newData[existingDayIndex] = updatedDay;
        return newData;
      } else {
        // Create new day entry
        const newDay: DailyAdherence = {
          date: today,
          takenMedications: [{
            medicationId,
            medicationName,
            dateTaken: today,
            timeTaken: now,
            dosage
          }],
          missedMedications: [],
          // Simplified initial score
          adherenceScore: 33
        };

        return [...prev, newDay].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    });
  };

  const isMedicationTakenToday = (medicationId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayData = dailyAdherence.find(day => day.date === today);
    return todayData?.takenMedications.some(med => med.medicationId === medicationId) || false;
  };

  const getTodaysAdherence = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return dailyAdherence.find(day => day.date === today) || null;
  };

  const overallAdherenceScore = dailyAdherence.length > 0
    ? Math.round(dailyAdherence.reduce((sum, day) => sum + day.adherenceScore, 0) / dailyAdherence.length)
    : 0;

  return (
    <MedicationAdherenceContext.Provider value={{
      dailyAdherence,
      currentStreak,
      bestStreak,
      overallAdherenceScore,
      markMedicationTaken,
      isMedicationTakenToday,
      getTodaysAdherence,
      calculateStreaks
    }}>
      {children}
    </MedicationAdherenceContext.Provider>
  );
};
