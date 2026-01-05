

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, QrCode, Download, User, Settings, FileText, LogOut, Info, Save, Check, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import EmergencyReadinessCard from '@/components/features/EmergencyReadinessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import DesktopSidebar from '@/components/shared/DesktopSidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import QRCodeModal from '@/components/modals/QRCodeModal';
import { toast } from 'sonner';

const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { medications } = useHealthData();
  const navigate = useNavigate();
  const activeMedicationsCount = medications.filter(m => m.status === 'active').length;
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Important Notes State
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user?.importantNotes) {
      setNotes(user.importantNotes);
    }
  }, [user?.importantNotes]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDigitalKey = () => {
    if (!user) {
      toast.error('User information not available');
      return;
    }

    const message = `Digital Health Key
ID: ${user.id}
Name: ${user.name}
Blood Type: ${user.bloodType}
Emergency Contact: ${user.emergencyContact?.name || 'Not set'}
Organ Donor: ${user.organDonor ? 'Yes' : 'No'}
QR Code: ${user.qrCode ? 'Active' : 'Not Generated'}`;

    toast.info(message, {
      duration: 10000,
      description: "Digital Health Key Details",
    });
  };

  const handleQRCode = () => {
    setQrModalOpen(true);
  };

  const handleExport = async () => {
    if (!user) {
      toast.error('User information not available for export');
      return;
    }
    // Navigate to timeline where the real export lives, or we could trigger the modal here
    // For now, let's redirect to timeline as the export logic is complex there
    navigate('/timeline');
    toast.info('Please use the Export button on the Timeline for full options.');
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setHasUnsavedChanges(true);
    setNotesSaved(false);
  };

  const handleSaveNotes = async () => {
    if (!user) return;
    if (notes === user.importantNotes) {
      setHasUnsavedChanges(false);
      return; // No changes
    }

    setIsSavingNotes(true);
    try {
      await updateUser({ importantNotes: notes });
      setNotesSaved(true);
      setHasUnsavedChanges(false);
      toast.success('Important notes saved');
      // Auto-hide saved indicator after 3 seconds
      setTimeout(() => setNotesSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const settingsItems = [
    {
      icon: User,
      label: 'Personal & Medical Info',
      path: '/profile/personal-medical',
      description: 'Personal info, medical history, emergency contacts'
    },
    {
      icon: Settings,
      label: 'Settings & Notifications',
      path: '/profile/settings-notifications',
      description: 'Notifications, language, and app preferences'
    },
    {
      icon: FileText,
      label: 'Legal & Support',
      path: '/profile/legal-support',
      description: 'Terms, privacy policy, help resources'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--medimo-bg-primary)] flex items-center justify-center">
        <p className="text-[var(--medimo-text-secondary)]">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--medimo-bg-primary)]">
        {/* Desktop Sidebar - hidden on mobile and tablet */}
        <DesktopSidebar />

        {/* Main content with sidebar offset on desktop */}
        <div className="xl:pl-64 transition-all duration-300">
          <Header />

          <div className="px-4 py-6 pb-28 lg:pb-8 space-y-5 max-w-3xl mx-auto lg:px-8">
            {/* User Identity Card */}
            <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl reveal-1">
              <CardContent className="p-6">
                {/* Avatar & User Info */}
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-[var(--medimo-accent-soft)]">
                    <AvatarFallback className="bg-[var(--medimo-accent)] text-white font-display font-bold text-xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="font-display text-xl font-bold text-[var(--medimo-text-primary)] mb-1">
                    {user.name}
                  </h2>
                  <p className="text-xs text-[var(--medimo-text-secondary)] font-mono">
                    ID: {user.id}
                  </p>
                  {user.caregiver && (
                    <p className="text-xs text-[var(--medimo-success)] mt-2">
                      Safety monitoring enabled
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDigitalKey}
                    className="flex flex-col items-center space-y-1 h-auto py-3 border-[var(--medimo-border)] hover:border-[var(--medimo-accent)] hover:bg-[var(--medimo-accent-soft)] rounded-xl transition-colors"
                  >
                    <CreditCard className="h-5 w-5 text-[var(--medimo-accent)]" />
                    <span className="text-xs font-display">Digital Key</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleQRCode}
                    className="flex flex-col items-center space-y-1 h-auto py-3 border-[var(--medimo-border)] hover:border-[var(--medimo-accent)] hover:bg-[var(--medimo-accent-soft)] rounded-xl transition-colors"
                  >
                    <QrCode className="h-5 w-5 text-[var(--medimo-accent)]" />
                    <span className="text-xs font-display">QR Code</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="flex flex-col items-center space-y-1 h-auto py-3 border-[var(--medimo-border)] hover:border-[var(--medimo-accent)] hover:bg-[var(--medimo-accent-soft)] rounded-xl transition-colors"
                  >
                    <Download className="h-5 w-5 text-[var(--medimo-accent)]" />
                    <span className="text-xs font-display">Export</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Readiness Check */}
            <EmergencyReadinessCard user={user} medicationsCount={activeMedicationsCount} />

            {/* Important Information Card */}
            <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl reveal-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-display text-[var(--medimo-text-primary)]">
                  <Info className="h-4 w-4 text-[var(--medimo-accent)]" />
                  Other Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-[var(--medimo-text-secondary)]">
                  Add any critical details not covered elsewhere (e.g., pregnancy status, implants, advance directives). This will be included in your emergency exports.
                </p>
                <div className="relative">
                  <Textarea
                    value={notes}
                    onChange={handleNotesChange}
                    onBlur={handleSaveNotes}
                    placeholder="E.g. Pregnant (Due July 25), Metal Hip Implant (Right), Do Not Resuscitate Order on file..."
                    className="min-h-[100px] bg-[var(--medimo-bg-primary)] border-[var(--medimo-border)] text-sm resize-none focus:ring-1 focus:ring-[var(--medimo-accent)]"
                  />
                  <div className="absolute bottom-2 right-2">
                    {isSavingNotes && (
                      <div className="text-[10px] text-[var(--medimo-text-muted)] flex items-center gap-1 bg-[var(--medimo-bg-primary)]/90 px-2 py-1 rounded-full">
                        <Save className="h-3 w-3 animate-spin" /> Saving...
                      </div>
                    )}
                    {notesSaved && !isSavingNotes && (
                      <div className="text-[10px] text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-full">
                        <Check className="h-3 w-3" /> Saved!
                      </div>
                    )}
                    {hasUnsavedChanges && !isSavingNotes && !notesSaved && (
                      <div className="text-[10px] text-amber-600 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-full">
                        Unsaved changes
                      </div>
                    )}
                  </div>
                </div>
                {notes && notes.length > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
                    <Check className="h-3 w-3" /> This info will appear on your wallet card and exports
                  </p>
                )}

                {/* Explicit Save Button for user comfort */}
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || !hasUnsavedChanges}
                    className={`flex-1 h-10 rounded-xl font-medium ${hasUnsavedChanges
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20'
                      : 'bg-[var(--medimo-bg-primary)] text-[var(--medimo-text-muted)] border border-[var(--medimo-border)]'
                      }`}
                  >
                    <Save className={`h-4 w-4 mr-2 ${isSavingNotes ? 'animate-spin' : ''}`} />
                    {isSavingNotes ? 'Saving...' : hasUnsavedChanges ? 'Save Notes' : 'Saved ✓'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile/personal-medical')}
                    className="h-10 rounded-xl border-[var(--medimo-border)] hover:bg-[var(--medimo-accent-soft)]"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Navigation */}
            <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl overflow-hidden reveal-2">
              <CardContent className="p-0">
                {settingsItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between p-4 hover:bg-[var(--medimo-accent-soft)] transition-colors ${index !== settingsItems.length - 1 ? 'border-b border-[var(--medimo-border)]' : ''
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--medimo-bg-primary)] flex items-center justify-center">
                          <Icon className="h-5 w-5 text-[var(--medimo-text-secondary)]" />
                        </div>
                        <div>
                          <div className="font-display font-medium text-[var(--medimo-text-primary)]">{item.label}</div>
                          <div className="text-xs text-[var(--medimo-text-muted)]">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--medimo-text-muted)]" />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Logout Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-[var(--hc-accent-critical-soft)] hover:bg-[var(--medimo-critical)]/10 text-[var(--medimo-critical)] border border-[var(--medimo-critical)]/20 hover:border-[var(--medimo-critical)]/40 rounded-xl h-12 font-display font-medium reveal-3"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display text-[var(--medimo-text-primary)]">Log Out?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[var(--medimo-text-secondary)]">
                    Are you sure you want to log out? You'll need to sign in again to access your health data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg border-[var(--medimo-border)]">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="rounded-lg bg-[var(--medimo-critical)] hover:bg-[var(--medimo-critical)]/90"
                  >
                    Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <BottomNavigation />
      </div>

      <QRCodeModal isOpen={qrModalOpen} onOpenChange={setQrModalOpen} />
    </>
  );
};

export default ProfileScreen;
