
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface AppTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const AppTour: React.FC<AppTourProps> = ({ 
  steps, 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const nextStep = () => {
    if (isLastStep) {
      onComplete?.();
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Tour Card */}
      <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-surface-card border-border-divider">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary">{step.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded ${
                    index <= currentStep ? 'bg-primary-action' : 'bg-border-divider'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={skipTour}
              className="text-text-secondary"
            >
              Skip Tour
            </Button>

            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                onClick={nextStep}
                className="bg-primary-action hover:bg-primary-action/90"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
