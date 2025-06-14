
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Calendar, Pill } from 'lucide-react';

interface HealthScoreProps {
  adherenceScore: number;
  completenessScore: number;
  checkInScore: number;
}

const HealthScore: React.FC<HealthScoreProps> = ({
  adherenceScore,
  completenessScore,
  checkInScore
}) => {
  const totalScore = Math.round(
    (adherenceScore * 0.4) + (completenessScore * 0.3) + (checkInScore * 0.3)
  );

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#28A745]';
    if (score >= 70) return 'text-[#0066CC]';
    return 'text-[#009B8F]';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', badge: 'bg-[#28A745]' };
    if (score >= 80) return { level: 'Very Good', badge: 'bg-[#0066CC]' };
    if (score >= 70) return { level: 'Good', badge: 'bg-[#009B8F]' };
    if (score >= 60) return { level: 'Fair', badge: 'bg-gray-500' };
    return { level: 'Needs Attention', badge: 'bg-gray-600' };
  };

  const scoreLevel = getScoreLevel(totalScore);

  return (
    <Card className="bg-white border border-gray-100 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-[#0066CC]" />
            <h3 className="font-semibold text-gray-900">Health Score</h3>
          </div>
          <Badge className={`${scoreLevel.badge} text-white`}>
            {scoreLevel.level}
          </Badge>
        </div>

        <div className="text-center mb-6">
          <div className={`text-4xl font-bold ${getScoreColor(totalScore)} mb-2`}>
            {totalScore}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#0066CC] h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalScore}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Pill className="h-4 w-4 text-[#0066CC] mr-1" />
            </div>
            <div className="text-sm font-medium text-gray-900">{adherenceScore}%</div>
            <div className="text-xs text-gray-600">Medication</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-[#28A745] mr-1" />
            </div>
            <div className="text-sm font-medium text-gray-900">{completenessScore}%</div>
            <div className="text-xs text-gray-600">Data Complete</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-[#009B8F] mr-1" />
            </div>
            <div className="text-sm font-medium text-gray-900">{checkInScore}%</div>
            <div className="text-xs text-gray-600">Check-ins</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthScore;
