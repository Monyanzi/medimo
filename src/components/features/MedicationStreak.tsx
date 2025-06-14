
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Calendar } from 'lucide-react';

interface MedicationStreakProps {
  currentStreak: number;
  bestStreak: number;
  todayCompleted: boolean;
}

const MedicationStreak: React.FC<MedicationStreakProps> = ({
  currentStreak,
  bestStreak,
  todayCompleted
}) => {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-orange-400 to-red-500';
    if (streak >= 14) return 'from-yellow-400 to-orange-500';
    if (streak >= 7) return 'from-blue-400 to-purple-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '✨';
    return '💊';
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-text-primary">Medication Streak</h3>
          </div>
          <div className="text-2xl">{getStreakEmoji(currentStreak)}</div>
        </div>

        <div className="text-center mb-4">
          <div className={`text-3xl font-bold bg-gradient-to-r ${getStreakColor(currentStreak)} bg-clip-text text-transparent mb-2`}>
            {currentStreak} days
          </div>
          <p className="text-text-secondary text-sm">
            {todayCompleted ? "Great job! Keep it up!" : "Take your medications to continue your streak"}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-text-secondary">Best: {bestStreak} days</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${
            todayCompleted 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {todayCompleted ? 'Today ✓' : 'Pending'}
          </div>
        </div>

        {/* Progress dots for last 7 days */}
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < Math.min(currentStreak, 7) 
                  ? 'bg-gradient-to-r from-orange-400 to-red-500' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationStreak;
