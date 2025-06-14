
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
    if (value >= 4) return <Smile className="h-5 w-5 text-primary-action" />;
    if (value >= 3) return <Meh className="h-5 w-5 text-accent-success" />;
    return <Frown className="h-5 w-5 text-text-secondary" />;
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
      <Card className="bg-surface-card border border-border-divider shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="text-primary-action text-3xl mb-3">✓</div>
          <h3 className="font-semibold text-text-primary mb-2">Check-in Complete!</h3>
          <p className="text-text-secondary text-sm">Thanks for sharing how you're feeling today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface-card border border-border-divider shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-primary-action" />
          <h3 className="font-semibold text-text-primary">Daily Check-in</h3>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">How are you feeling?</label>
              <div className="flex items-center space-x-2">
                {getMoodIcon(mood[0])}
                <span className="text-sm text-text-secondary">{getMoodLabel(mood[0])}</span>
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
              <label className="text-sm font-medium text-text-primary">Any symptoms?</label>
              <span className="text-sm text-text-secondary">{getSymptomLabel(symptoms[0])}</span>
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

          <Button onClick={handleCheckIn} className="w-full bg-primary-action hover:bg-primary-action/90 text-white">
            Complete Check-in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickCheckIn;
