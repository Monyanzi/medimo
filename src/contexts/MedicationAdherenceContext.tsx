
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAdherence = localStorage.getItem('medicationAdherence');
    if (savedAdherence) {
      const parsedData = JSON.parse(savedAdherence);
      setDailyAdherence(parsedData);
    }
  }, []);

  // Save data to localStorage whenever dailyAdherence changes
  useEffect(() => {
    if (dailyAdherence.length > 0) {
      localStorage.setItem('medicationAdherence', JSON.stringify(dailyAdherence));
    }
  }, [dailyAdherence]);

  // Calculate streaks whenever dailyAdherence changes
  useEffect(() => {
    const { current, best } = calculateStreaks();
    setCurrentStreak(current);
    setBestStreak(best);
  }, [dailyAdherence]);

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
          // This is a simplified calculation - in a real app you'd consider prescribed vs taken
          updatedDay.adherenceScore = Math.min(100, (updatedDay.takenMedications.length / 3) * 100);
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
          adherenceScore: 33 // 1 out of 3 medications
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

  const calculateStreaks = () => {
    if (dailyAdherence.length === 0) return { current: 0, best: 0 };

    const sortedDays = [...dailyAdherence].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak from today backwards
    for (let i = 0; i < sortedDays.length; i++) {
      const day = sortedDays[i];
      if (day.adherenceScore >= 80) { // Consider 80%+ as good adherence
        if (i === currentStreak) {
          currentStreak++;
        }
        tempStreak++;
      } else {
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }

    return { current: currentStreak, best: Math.max(bestStreak, currentStreak) };
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
