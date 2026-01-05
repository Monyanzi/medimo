
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Clock, FolderOpen, User, Plus, Pill, Calendar, FileText, Activity, ScanLine, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
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

const DesktopSidebar: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
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
        },
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
            icon: ScanLine,
            color: 'text-[var(--medimo-accent)]',
            bgColor: 'bg-[var(--medimo-accent-soft)]'
        },
        {
            id: 'medication' as ModalType,
            label: 'Add Medication',
            icon: Pill,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            id: 'appointment' as ModalType,
            label: 'Add Appointment',
            icon: Calendar,
            color: 'text-violet-600',
            bgColor: 'bg-violet-50'
        },
        {
            id: 'document' as ModalType,
            label: 'Upload Document',
            icon: FileText,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            id: 'vitals' as ModalType,
            label: 'Log Vitals',
            icon: Activity,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50'
        }
    ];

    const handleAction = (action: ModalType) => {
        setActionSheetOpen(false);
        setTimeout(() => setActiveModal(action), 150);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            {/* Desktop Sidebar - hidden on mobile and tablet, shown on xl: (1280px+) */}
            <aside className={cn(
                "hidden xl:flex fixed left-0 top-0 bottom-0 flex-col",
                "bg-[var(--medimo-bg-elevated)] border-r border-[var(--medimo-border)]",
                "transition-all duration-300 ease-out z-40",
                isCollapsed ? "w-20" : "w-64"
            )}>
                {/* Logo */}
                <div className="p-4 border-b border-[var(--medimo-border)]">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center shadow-premium">
                            <span className="text-white font-display font-bold text-lg">M</span>
                        </div>
                        {!isCollapsed && (
                            <span className="font-display text-xl font-bold text-[var(--medimo-text-primary)]">
                                Medimo
                            </span>
                        )}
                    </Link>
                </div>

                {/* Quick Action Button */}
                <div className="p-4">
                    <Button
                        onClick={() => setActionSheetOpen(true)}
                        className={cn(
                            "w-full bg-accent-gradient text-white rounded-xl h-11 shadow-premium",
                            "hover:shadow-premium-lg transition-all duration-200",
                            "flex items-center justify-center gap-2",
                            isCollapsed && "px-0"
                        )}
                    >
                        <Plus className="h-5 w-5" strokeWidth={2.5} />
                        {!isCollapsed && <span className="font-display font-medium">New Entry</span>}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                    item.isActive
                                        ? "bg-[var(--medimo-accent-soft)] text-[var(--medimo-accent)]"
                                        : "text-[var(--medimo-text-secondary)] hover:bg-[var(--medimo-bg-primary)] hover:text-[var(--medimo-text-primary)]",
                                    isCollapsed && "justify-center px-0"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    item.isActive && "bg-[var(--medimo-accent)]/10"
                                )}>
                                    <Icon
                                        className={cn("h-5 w-5", item.isActive && "scale-105")}
                                        strokeWidth={item.isActive ? 2.5 : 2}
                                    />
                                </div>
                                {!isCollapsed && (
                                    <span className={cn(
                                        "font-display text-sm",
                                        item.isActive ? "font-semibold" : "font-medium"
                                    )}>
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-3 border-t border-[var(--medimo-border)] space-y-1">
                    {/* Settings */}
                    <Link
                        to="/profile/settings-notifications"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                            "text-[var(--medimo-text-secondary)] hover:bg-[var(--medimo-bg-primary)] hover:text-[var(--medimo-text-primary)]",
                            isCollapsed && "justify-center px-0"
                        )}
                    >
                        <Settings className="h-5 w-5" strokeWidth={2} />
                        {!isCollapsed && <span className="font-display text-sm font-medium">Settings</span>}
                    </Link>

                    {/* User Profile Card */}
                    {user && (
                        <div className={cn(
                            "flex items-center gap-3 p-3 rounded-xl bg-[var(--medimo-bg-primary)]",
                            isCollapsed && "justify-center"
                        )}>
                            <div className="w-10 h-10 rounded-xl bg-[var(--medimo-accent)] flex items-center justify-center">
                                <span className="text-white font-display font-semibold text-sm">
                                    {getInitials(user.name)}
                                </span>
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="font-display font-semibold text-sm text-[var(--medimo-text-primary)] truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-[var(--medimo-text-muted)] truncate">
                                        {user.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full",
                            "text-[var(--medimo-text-muted)] hover:bg-[var(--medimo-bg-primary)] hover:text-[var(--medimo-text-secondary)]",
                            isCollapsed && "justify-center px-0"
                        )}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5" strokeWidth={2} />
                        ) : (
                            <>
                                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                                <span className="font-display text-sm font-medium">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Action Sheet for Desktop */}
            <Drawer open={actionSheetOpen} onOpenChange={setActionSheetOpen}>
                <DrawerContent className="bottom-sheet">
                    <div className="sheet-handle" />
                    <DrawerHeader className="text-center pb-3 pt-0">
                        <DrawerTitle className="font-display text-lg text-[var(--medimo-text-primary)]">
                            Quick Actions
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 pb-8 grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {actions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    onClick={() => handleAction(action.id)}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--medimo-bg-primary)] active:bg-[var(--medimo-accent-soft)] border border-[var(--medimo-border)] transition-all duration-200 hover:shadow-premium active:scale-[0.98]"
                                >
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", action.bgColor)}>
                                        <Icon className={cn("h-6 w-6", action.color)} />
                                    </div>
                                    <span className="font-display font-medium text-sm text-[var(--medimo-text-primary)]">
                                        {action.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <DrawerClose asChild>
                        <Button
                            variant="ghost"
                            className="mx-4 mb-4 h-12 rounded-2xl text-[var(--medimo-text-secondary)] font-display font-medium"
                        >
                            Cancel
                        </Button>
                    </DrawerClose>
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

export default DesktopSidebar;
