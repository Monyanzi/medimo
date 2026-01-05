
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Calendar, Pill, AlertTriangle } from 'lucide-react';
import { useMedicationAdherence } from '@/contexts/MedicationAdherenceContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { checkVitalInRange, DEFAULT_VITAL_RANGES } from '@/utils/vitalsUtils';

const HealthScore: React.FC = () => {
  const { overallAdherenceScore } = useMedicationAdherence();
  const { documents, vitalSigns } = useHealthData();
  const { user } = useAuth();

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
    
    // Ideal is 4 check-ins per month (weekly)
    const idealCheckIns = 4;
    const score = Math.min(100, (recentVitals.length / idealCheckIns) * 100);
    return Math.round(score);
  };

  // Check for critical vitals in recent readings
  const checkForCriticalVitals = () => {
    if (vitalSigns.length === 0) return { hasCritical: false, criticalCount: 0 };
    
    const recentVital = vitalSigns[vitalSigns.length - 1]; // Most recent
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

  // Reduce total score if there are critical vitals
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

  const scoreLevel = getScoreLevel(totalScore);

  return (
  <Card className="bg-surface-card border border-border-divider elev-surface">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary-action" />
            <h3 className="font-semibold text-text-primary">Health Score</h3>
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

        <div className="text-center mb-6">
          <div className={`text-4xl font-bold ${getScoreColor(totalScore)} mb-2`}>
            {totalScore}
          </div>
          <div className="w-full bg-border-divider rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${criticalVitals.hasCritical ? 'bg-red-500' : 'bg-primary-action'}`}
              style={{ width: `${Math.max(totalScore, 0)}%` }}
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

export default HealthScore;
