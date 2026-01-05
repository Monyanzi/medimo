
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Clock, FolderOpen, User, Plus, Pill, Calendar, FileText, Activity, ScanLine, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

// Import Modals
import AddMedicationModal from '@/components/modals/AddMedicationModal';
import AddAppointmentModal from '@/components/modals/AddAppointmentModal';
import UploadDocumentModal from '@/components/modals/UploadDocumentModal';
import LogVitalsModal from '@/components/modals/LogVitalsModal';
import SmartScanModal from '@/components/modals/SmartScanModal';

type ModalType = 'medication' | 'appointment' | 'document' | 'vitals' | 'scan' | null;

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      isActive: location.pathname === '/'
    },
    {
      path: '/timeline',
      icon: Clock,
      label: 'Timeline',
      isActive: location.pathname === '/timeline'
    }
  ];

  const navItemsRight = [
    {
      path: '/vault',
      icon: FolderOpen,
      label: 'Vault',
      isActive: location.pathname === '/vault'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      isActive: location.pathname.startsWith('/profile')
    }
  ];

  const actions = [
    {
      id: 'scan' as ModalType,
      label: 'Smart Scan',
      description: 'Scan prescriptions & documents',
      icon: ScanLine,
      color: 'text-[var(--medimo-accent)]',
      bgColor: 'bg-[var(--medimo-accent-soft)]'
    },
    {
      id: 'medication' as ModalType,
      label: 'Add Medication',
      description: 'Track a new medication',
      icon: Pill,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'appointment' as ModalType,
      label: 'Add Appointment',
      description: 'Schedule a health visit',
      icon: Calendar,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      id: 'document' as ModalType,
      label: 'Upload Document',
      description: 'Store health records',
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'vitals' as ModalType,
      label: 'Log Vitals',
      description: 'Record health measurements',
      icon: Activity,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    }
  ];

  const handleAction = (action: ModalType) => {
    setActionSheetOpen(false);
    setTimeout(() => setActiveModal(action), 150);
  };

  const renderNavItem = (item: typeof navItems[0]) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-0 flex-1 relative group touch-target-sm active:scale-95",
          item.isActive
            ? "text-[var(--medimo-accent)]"
            : "text-[var(--medimo-text-muted)] active:text-[var(--medimo-accent)]"
        )}
      >
        {/* Active indicator pill */}
        {item.isActive && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[var(--medimo-accent)] rounded-full shadow-sm shadow-[var(--medimo-accent)]/30" />
        )}
        <div className={cn(
          "p-2 rounded-xl transition-all duration-200",
          item.isActive
            ? "bg-[var(--medimo-accent-soft)] shadow-sm"
            : "group-active:bg-[var(--medimo-accent-soft)]"
        )}>
          <Icon
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              item.isActive && "scale-105"
            )}
            strokeWidth={item.isActive ? 2.5 : 1.75}
          />
        </div>
        <span className={cn(
          "text-[10px] font-display mt-0.5 tracking-wide transition-all",
          item.isActive ? "font-semibold" : "font-medium"
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Premium glassmorphism navigation - visible on mobile and tablet, hidden on xl+ desktop */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/20 z-50 pb-safe xl:hidden">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto px-2">
          {/* Left nav items */}
          {navItems.map(renderNavItem)}

          {/* Center Action Button - Premium gradient with breathing glow */}
          <button
            onClick={() => setActionSheetOpen(true)}
            className="relative -mt-7 flex flex-col items-center touch-target"
            aria-label="Add new item"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent-gradient text-white flex items-center justify-center breathe-glow transition-all duration-200 active:scale-95">
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-display font-medium mt-1 text-[var(--medimo-text-muted)]">
              Add
            </span>
          </button>

          {/* Right nav items */}
          {navItemsRight.map(renderNavItem)}
        </div>
        {/* Safe area padding for iPhone */}
        <div className="h-safe-area-inset-bottom bg-[var(--medimo-bg-elevated)]" />
      </nav>

      {/* Premium Action Sheet */}
      <Drawer open={actionSheetOpen} onOpenChange={setActionSheetOpen}>
        <DrawerContent className="bottom-sheet">
          {/* Handle indicator */}
          <div className="sheet-handle" />

          <DrawerHeader className="text-center pb-3 pt-0">
            <DrawerTitle className="font-display text-lg text-[var(--medimo-text-primary)]">
              Quick Actions
            </DrawerTitle>
            <p className="text-sm text-[var(--medimo-text-muted)] mt-1">
              What would you like to add?
            </p>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-2">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--medimo-bg-primary)] active:bg-[var(--medimo-accent-soft)] border border-[var(--medimo-border)] transition-all duration-200 active:scale-[0.98]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", action.bgColor)}>
                    <Icon className={cn("h-6 w-6", action.color)} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-display font-semibold text-[var(--medimo-text-primary)]">
                      {action.label}
                    </div>
                    <div className="text-sm text-[var(--medimo-text-muted)]">
                      {action.description}
                    </div>
                  </div>
                  <div className="text-[var(--medimo-text-muted)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}

            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="w-full mt-4 h-12 rounded-2xl text-[var(--medimo-text-secondary)] font-display font-medium active:scale-[0.98] transition-transform"
              >
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Modals */}
      <SmartScanModal isOpen={activeModal === 'scan'} onOpenChange={() => setActiveModal(null)} />
      <AddMedicationModal isOpen={activeModal === 'medication'} onOpenChange={() => setActiveModal(null)} />
      <AddAppointmentModal isOpen={activeModal === 'appointment'} onOpenChange={() => setActiveModal(null)} />
      <UploadDocumentModal isOpen={activeModal === 'document'} onOpenChange={() => setActiveModal(null)} />
      <LogVitalsModal isOpen={activeModal === 'vitals'} onOpenChange={() => setActiveModal(null)} />
    </>
  );
};

export default BottomNavigation;
