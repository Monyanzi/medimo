
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
    if (score >= 85) return 'text-primary-action';
    if (score >= 70) return 'text-accent-success';
    return 'text-text-secondary';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', badge: 'bg-primary-action' };
    if (score >= 80) return { level: 'Very Good', badge: 'bg-accent-success' };
    if (score >= 70) return { level: 'Good', badge: 'bg-accent-success' };
    if (score >= 60) return { level: 'Fair', badge: 'bg-text-secondary' };
    return { level: 'Needs Attention', badge: 'bg-text-secondary' };
  };

  const scoreLevel = getScoreLevel(totalScore);

  return (
    <Card className="bg-surface-card border border-border-divider shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary-action" />
            <h3 className="font-semibold text-text-primary">Health Score</h3>
          </div>
          <Badge className={`${scoreLevel.badge} text-white`}>
            {scoreLevel.level}
          </Badge>
        </div>

        <div className="text-center mb-6">
          <div className={`text-4xl font-bold ${getScoreColor(totalScore)} mb-2`}>
            {totalScore}
          </div>
          <div className="w-full bg-border-divider rounded-full h-2">
            <div 
              className="bg-primary-action h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalScore}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Pill className="h-4 w-4 text-primary-action mr-1" />
            </div>
            <div className="text-sm font-medium text-text-primary">{adherenceScore}%</div>
            <div className="text-xs text-text-secondary">Medication</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-accent-success mr-1" />
            </div>
            <div className="text-sm font-medium text-text-primary">{completenessScore}%</div>
            <div className="text-xs text-text-secondary">Data Complete</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-accent-success mr-1" />
            </div>
            <div className="text-sm font-medium text-text-primary">{checkInScore}%</div>
            <div className="text-xs text-text-secondary">Check-ins</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthScore;
