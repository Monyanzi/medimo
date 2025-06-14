
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Calendar } from 'lucide-react';
import { useMedicationAdherence } from '@/contexts/MedicationAdherenceContext';

const MedicationStreak: React.FC = () => {
  const { currentStreak, bestStreak, getTodaysAdherence } = useMedicationAdherence();
  
  const todaysAdherence = getTodaysAdherence();
  const todayCompleted = todaysAdherence ? todaysAdherence.adherenceScore >= 80 : false;

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-primary-action';
    if (streak >= 14) return 'text-accent-success';
    if (streak >= 7) return 'text-accent-success';
    return 'text-text-secondary';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '✨';
    return '💊';
  };

  return (
    <Card className="bg-surface-card border border-border-divider shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-primary-action" />
            <h3 className="font-semibold text-text-primary">Medication Streak</h3>
          </div>
          <div className="text-2xl">{getStreakEmoji(currentStreak)}</div>
        </div>

        <div className="text-center mb-4">
          <div className={`text-3xl font-bold ${getStreakColor(currentStreak)} mb-2`}>
            {currentStreak} days
          </div>
          <p className="text-text-secondary text-sm">
            {todayCompleted ? "Great job! Keep it up!" : "Take your medications to continue your streak"}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-text-secondary" />
            <span className="text-text-secondary">Best: {bestStreak} days</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${
            todayCompleted 
              ? 'bg-primary-action/10 text-primary-action' 
              : 'bg-accent-success/10 text-accent-success'
          }`}>
            {todayCompleted ? 'Complete ✓' : 'Pending'}
          </div>
        </div>

        {/* Progress dots for last 7 days */}
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < Math.min(currentStreak, 7) 
                  ? 'bg-primary-action' 
                  : 'bg-border-divider'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationStreak;
