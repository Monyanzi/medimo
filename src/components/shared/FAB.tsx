
import React, { useState } from 'react';
import { Plus, X, Pill, Calendar, FileText, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFAB = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action: string) => {
    console.log(`FAB Action: ${action}`);
    setIsOpen(false);
    // TODO: Open respective modals/forms
  };

  const actions = [
    {
      id: 'medication',
      label: 'Add Medication',
      icon: Pill,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'appointment',
      label: 'Add Appointment', 
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'document',
      label: 'Upload Document',
      icon: FileText,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'vitals',
      label: 'Log Vitals',
      icon: Activity,
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 font-inter">
      {/* Action Buttons */}
      <div className={cn(
        "flex flex-col space-y-3 mb-4 transition-all duration-300 transform",
        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className={cn(
                "flex items-center space-x-3 transition-all duration-300",
                isOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <span className="bg-surface-card text-text-primary px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap border border-border-divider">
                {action.label}
              </span>
              <Button
                onClick={() => handleAction(action.id)}
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg text-white transition-all duration-200 hover:scale-110",
                  action.color
                )}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB Button */}
      <Button
        onClick={toggleFAB}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-primary-action hover:bg-primary-action/90 text-white",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default FAB;
