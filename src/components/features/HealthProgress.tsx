
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Calendar, Pill, TrendingUp, AlertTriangle } from 'lucide-react';
import { useMedicationAdherence } from '@/contexts/MedicationAdherenceContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { checkVitalInRange, DEFAULT_VITAL_RANGES } from '@/utils/vitalsUtils';

const HealthProgress: React.FC = () => {
  const { currentStreak, bestStreak, getTodaysAdherence, overallAdherenceScore } = useMedicationAdherence();
  const { documents, vitalSigns } = useHealthData();
  const { user } = useAuth();

  const todaysAdherence = getTodaysAdherence();
  const todayCompleted = todaysAdherence ? todaysAdherence.adherenceScore >= 80 : false;

  // Calculate completeness score based on profile data
  const calculateCompletenessScore = () => {
    if (!user) return 0;
    
    let score = 0;
    const totalFields = 8;
    
    if (user.name) score++;
    if (user.email) score++;
    if (user.dob) score++;
    if (user.bloodType) score++;
    if (user.emergencyContact.name && user.emergencyContact.phone) score++;
    if (user.allergies.length > 0) score++;
    if (user.conditions.length > 0) score++;
    if (documents.length > 0) score++;
    
    return Math.round((score / totalFields) * 100);
  };

  // Calculate check-in score based on recent vital signs
  const calculateCheckInScore = () => {
    if (vitalSigns.length === 0) return 0;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentVitals = vitalSigns.filter(vital => 
      new Date(vital.recordedDate) >= thirtyDaysAgo
    );
    
    const idealCheckIns = 4;
    const score = Math.min(100, (recentVitals.length / idealCheckIns) * 100);
    return Math.round(score);
  };

  // Check for critical vitals in recent readings
  const checkForCriticalVitals = () => {
    if (vitalSigns.length === 0) return { hasCritical: false, criticalCount: 0 };
    
    const recentVital = vitalSigns[vitalSigns.length - 1];
    let criticalCount = 0;
    
    if (recentVital.bloodPressureSystolic && checkVitalInRange(recentVital.bloodPressureSystolic, DEFAULT_VITAL_RANGES.bloodPressureSystolic) === 'critical') {
      criticalCount++;
    }
    if (recentVital.bloodPressureDiastolic && checkVitalInRange(recentVital.bloodPressureDiastolic, DEFAULT_VITAL_RANGES.bloodPressureDiastolic) === 'critical') {
      criticalCount++;
    }
    if (recentVital.heartRate && checkVitalInRange(recentVital.heartRate, DEFAULT_VITAL_RANGES.heartRate) === 'critical') {
      criticalCount++;
    }
    if (recentVital.temperature && checkVitalInRange(recentVital.temperature, DEFAULT_VITAL_RANGES.temperature) === 'critical') {
      criticalCount++;
    }
    
    return { hasCritical: criticalCount > 0, criticalCount };
  };

  const adherenceScore = overallAdherenceScore;
  const completenessScore = calculateCompletenessScore();
  const checkInScore = calculateCheckInScore();
  const criticalVitals = checkForCriticalVitals();

  const totalScore = Math.round(
    (adherenceScore * 0.4) + (completenessScore * 0.3) + (checkInScore * 0.3) - (criticalVitals.hasCritical ? 20 : 0)
  );

  const getScoreColor = (score: number) => {
    if (criticalVitals.hasCritical) return 'text-red-600';
    if (score >= 85) return 'text-primary-action';
    if (score >= 70) return 'text-accent-success';
    return 'text-text-secondary';
  };

  const getScoreLevel = (score: number) => {
    if (criticalVitals.hasCritical) return { level: 'Needs Attention', badge: 'bg-red-600' };
    if (score >= 90) return { level: 'Excellent', badge: 'bg-primary-action' };
    if (score >= 80) return { level: 'Very Good', badge: 'bg-accent-success' };
    if (score >= 70) return { level: 'Good', badge: 'bg-accent-success' };
    if (score >= 60) return { level: 'Fair', badge: 'bg-text-secondary' };
    return { level: 'Needs Attention', badge: 'bg-text-secondary' };
  };

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

  const scoreLevel = getScoreLevel(totalScore);

  return (
  <Card className="bg-surface-card border border-border-divider elev-surface">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary-action" />
            <h3 className="font-semibold text-text-primary">Health Progress</h3>
            {criticalVitals.hasCritical && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Badge className={`${scoreLevel.badge} text-white`}>
            {scoreLevel.level}
          </Badge>
        </div>

        {criticalVitals.hasCritical && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Critical vital signs detected. Consider medical consultation.
            </p>
          </div>
        )}

        {/* Health Score Section */}
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold ${getScoreColor(totalScore)} mb-2`}>
            {totalScore}
          </div>
          <div className="w-full bg-border-divider rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${criticalVitals.hasCritical ? 'bg-red-500' : 'bg-primary-action'}`}
              style={{ width: `${Math.max(totalScore, 0)}%` }}
            />
          </div>
        </div>

        {/* Medication Streak Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 text-primary-action" />
              <span className="font-medium text-text-primary">Medication Streak</span>
            </div>
            <div className="text-xl">{getStreakEmoji(currentStreak)}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${getStreakColor(currentStreak)}`}>
              {currentStreak} days
            </div>
            <div className="text-right">
              <div className="text-xs text-text-secondary">Best: {bestStreak} days</div>
              <div className={`px-2 py-1 rounded-full text-xs mt-1 ${
                todayCompleted 
                  ? 'bg-primary-action/10 text-primary-action' 
                  : 'bg-accent-success/10 text-accent-success'
              }`}>
                {todayCompleted ? 'Complete ✓' : 'Pending'}
              </div>
            </div>
          </div>

          {/* Progress dots for last 7 days */}
          <div className="flex justify-center space-x-2 mt-3">
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
        </div>

        {/* Detailed Metrics */}
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
              <Calendar className={`h-4 w-4 mr-1 ${criticalVitals.hasCritical ? 'text-red-500' : 'text-accent-success'}`} />
            </div>
            <div className="text-sm font-medium text-text-primary">{checkInScore}%</div>
            <div className="text-xs text-text-secondary">
              {criticalVitals.hasCritical ? 'Critical Vitals' : 'Check-ins'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthProgress;
