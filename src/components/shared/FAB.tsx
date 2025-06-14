
import React, { useState } from 'react';
import { Plus, X, Pill, Calendar, FileText, Activity, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

// Import Modals
import AddMedicationModal from '@/components/modals/AddMedicationModal';
import AddAppointmentModal from '@/components/modals/AddAppointmentModal';
import UploadDocumentModal from '@/components/modals/UploadDocumentModal';
import LogVitalsModal from '@/components/modals/LogVitalsModal';
import SmartScanModal from '@/components/modals/SmartScanModal';

type ModalType = 'medication' | 'appointment' | 'document' | 'vitals' | 'scan' | null;

const FAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const location = useLocation();

  const toggleFAB = () => {
    setIsOpen(!isOpen);
    if (isOpen) { // If closing FAB, also close any active modal
      setActiveModal(null);
    }
  };

  const handleAction = (action: ModalType) => {
    console.log(`FAB Action: ${action}`);
    setActiveModal(action);
    setIsOpen(false); // Close FAB menu when modal opens
  };

  // Define actions based on current route
  const getActionsForRoute = () => {
    const allActions = [
      {
        id: 'scan' as ModalType,
        label: 'Smart Scan',
        icon: ScanLine,
        color: 'bg-indigo-500 hover:bg-indigo-600'
      },
      {
        id: 'medication' as ModalType,
        label: 'Add Medication',
        icon: Pill,
        color: 'bg-blue-500 hover:bg-blue-600'
      },
      {
        id: 'appointment' as ModalType,
        label: 'Add Appointment', 
        icon: Calendar,
        color: 'bg-purple-500 hover:bg-purple-600'
      },
      {
        id: 'document' as ModalType,
        label: 'Upload Document',
        icon: FileText,
        color: 'bg-green-500 hover:bg-green-600'
      },
      {
        id: 'vitals' as ModalType,
        label: 'Log Vitals',
        icon: Activity,
        color: 'bg-red-500 hover:bg-red-600'
      }
    ];

    // Context-aware filtering - Smart Scan always available
    if (location.pathname === '/vault') {
      return allActions.filter(action => ['scan', 'document'].includes(action.id));
    } else if (location.pathname === '/timeline') {
      return allActions.filter(action => action.id !== 'document');
    } else {
      // Home and other pages show all actions
      return allActions;
    }
  };

  const actions = getActionsForRoute();

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40 font-inter">
        {/* Action Buttons */}
        <div className={cn(
          "flex flex-col items-end space-y-3 mb-4 transition-all duration-300 transform",
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
                  aria-label={action.label}
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
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close actions" : "Open actions"}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Modals */}
      <SmartScanModal isOpen={activeModal === 'scan'} onOpenChange={() => setActiveModal(null)} />
      <AddMedicationModal isOpen={activeModal === 'medication'} onOpenChange={() => setActiveModal(null)} />
      <AddAppointmentModal isOpen={activeModal === 'appointment'} onOpenChange={() => setActiveModal(null)} />
      <UploadDocumentModal isOpen={activeModal === 'document'} onOpenChange={() => setActiveModal(null)} />
      <LogVitalsModal isOpen={activeModal === 'vitals'} onOpenChange={() => setActiveModal(null)} />
    </>
  );
};

export default FAB;
