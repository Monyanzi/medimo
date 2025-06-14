
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Heart, Smile, Frown, Meh } from 'lucide-react';
import { toast } from 'sonner';

const QuickCheckIn: React.FC = () => {
  const [mood, setMood] = useState([3]);
  const [symptoms, setSymptoms] = useState([1]);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const getMoodIcon = (value: number) => {
    if (value >= 4) return <Smile className="h-5 w-5 text-[#28A745]" />;
    if (value >= 3) return <Meh className="h-5 w-5 text-[#0066CC]" />;
    return <Frown className="h-5 w-5 text-[#009B8F]" />;
  };

  const getMoodLabel = (value: number) => {
    if (value >= 4) return 'Great';
    if (value >= 3) return 'Okay';
    return 'Not Good';
  };

  const getSymptomLabel = (value: number) => {
    if (value <= 1) return 'None';
    if (value <= 2) return 'Mild';
    if (value <= 3) return 'Moderate';
    return 'Severe';
  };

  const handleCheckIn = () => {
    setHasCheckedIn(true);
    toast.success('Daily check-in completed!', {
      description: 'Your health data helps track your progress.'
    });
  };

  if (hasCheckedIn) {
    return (
      <Card className="bg-white border border-gray-100 shadow-md">
        <CardContent className="p-6 text-center">
          <div className="text-[#28A745] text-3xl mb-3">✓</div>
          <h3 className="font-semibold text-gray-900 mb-2">Check-in Complete!</h3>
          <p className="text-gray-600 text-sm">Thanks for sharing how you're feeling today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-100 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-[#0066CC]" />
          <h3 className="font-semibold text-gray-900">Daily Check-in</h3>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-900">How are you feeling?</label>
              <div className="flex items-center space-x-2">
                {getMoodIcon(mood[0])}
                <span className="text-sm text-gray-600">{getMoodLabel(mood[0])}</span>
              </div>
            </div>
            <Slider
              value={mood}
              onValueChange={setMood}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-900">Any symptoms?</label>
              <span className="text-sm text-gray-600">{getSymptomLabel(symptoms[0])}</span>
            </div>
            <Slider
              value={symptoms}
              onValueChange={setSymptoms}
              max={4}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <Button onClick={handleCheckIn} className="w-full bg-[#0066CC] hover:bg-[#0066CC]/90">
            Complete Check-in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickCheckIn;
