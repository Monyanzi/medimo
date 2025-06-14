
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Thermometer, Weight } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import { format, parseISO } from 'date-fns';

const VitalTracker: React.FC = () => {
  const { vitalSigns } = useHealthData();

  // Prepare chart data
  const chartData = vitalSigns
    .sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime())
    .map(vital => ({
      date: format(parseISO(vital.recordedDate), 'MMM dd'),
      fullDate: vital.recordedDate,
      systolic: vital.bloodPressureSystolic,
      diastolic: vital.bloodPressureDiastolic,
      heartRate: vital.heartRate,
      weight: vital.weight,
      temperature: vital.temperature
    }));

  const getLatestVital = (type: keyof typeof vitalSigns[0]) => {
    if (vitalSigns.length === 0) return null;
    const latest = vitalSigns[vitalSigns.length - 1];
    return latest[type];
  };

  const formatVitalValue = (value: number | undefined, unit: string) => {
    return value ? `${value}${unit}` : 'No data';
  };

  if (vitalSigns.length === 0) {
    return (
      <Card className="bg-surface-card border border-border-divider shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary-action" />
            <span>Vital Signs Tracker</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Vital Signs Data</h3>
            <p className="text-text-secondary">Start tracking your vitals to see trends over time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface-card border border-border-divider shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary-action" />
          <span>Vital Signs Tracker</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Vitals Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Heart className="h-5 w-5 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-blue-700">
              {formatVitalValue(getLatestVital('heartRate'), ' bpm')}
            </div>
            <div className="text-xs text-blue-600">Heart Rate</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Activity className="h-5 w-5 text-red-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-red-700">
              {getLatestVital('bloodPressureSystolic') && getLatestVital('bloodPressureDiastolic') 
                ? `${getLatestVital('bloodPressureSystolic')}/${getLatestVital('bloodPressureDiastolic')}`
                : 'No data'}
            </div>
            <div className="text-xs text-red-600">Blood Pressure</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Thermometer className="h-5 w-5 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-orange-700">
              {formatVitalValue(getLatestVital('temperature'), '°F')}
            </div>
            <div className="text-xs text-orange-600">Temperature</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Weight className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-green-700">
              {formatVitalValue(getLatestVital('weight'), ' lbs')}
            </div>
            <div className="text-xs text-green-600">Weight</div>
          </div>
        </div>

        {/* Blood Pressure Trend */}
        {chartData.some(d => d.systolic || d.diastolic) && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-primary mb-3">Blood Pressure Trend</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value, name) => [value, name === 'systolic' ? 'Systolic' : 'Diastolic']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Heart Rate Trend */}
        {chartData.some(d => d.heartRate) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-primary mb-3">Heart Rate Trend</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value) => [value + ' bpm', 'Heart Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VitalTracker;
