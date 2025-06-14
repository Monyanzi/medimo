
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
    if (streak >= 30) return 'text-[#28A745]';
    if (streak >= 14) return 'text-[#0066CC]';
    if (streak >= 7) return 'text-[#009B8F]';
    return 'text-gray-500';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '✨';
    return '💊';
  };

  return (
    <Card className="bg-white border border-gray-100 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-[#0066CC]" />
            <h3 className="font-semibold text-gray-900">Medication Streak</h3>
          </div>
          <div className="text-2xl">{getStreakEmoji(currentStreak)}</div>
        </div>

        <div className="text-center mb-4">
          <div className={`text-3xl font-bold ${getStreakColor(currentStreak)} mb-2`}>
            {currentStreak} days
          </div>
          <p className="text-gray-600 text-sm">
            {todayCompleted ? "Great job! Keep it up!" : "Take your medications to continue your streak"}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Best: {bestStreak} days</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${
            todayCompleted 
              ? 'bg-[#28A745]/10 text-[#28A745]' 
              : 'bg-[#0066CC]/10 text-[#0066CC]'
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
                  ? 'bg-[#0066CC]' 
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
