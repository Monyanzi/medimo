
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CreditCard, QrCode, Download, User, Bell, Globe, FileText, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [qrModalOpen, setQrModalOpen] = useState(false);

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
    navigate('/');
  };

  const handleQRCode = () => {
    setQrModalOpen(true);
  };

  const handleExport = () => {
    console.log('Exporting PDF report...');
    // TODO: Implement PDF export functionality
  };

  const settingsItems = [
    {
      icon: User,
      label: 'Personal Information',
      path: '/profile/personal-information'
    },
    {
      icon: Bell,
      label: 'Notifications',
      path: '/profile/notifications'
    },
    {
      icon: Globe,
      label: 'Language & Region',
      path: '/profile/language-region'
    },
    {
      icon: FileText,
      label: 'Terms of Service',
      path: '/profile/terms'
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      path: '/profile/privacy'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      path: '/profile/support'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <p className="text-text-secondary">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background-main font-inter">
        {/* Header */}
        <header className="bg-surface-card border-b border-border-divider px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-text-primary">Profile</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        <div className="px-4 py-6 space-y-6">
          {/* User Identity Card */}
          <Card className="bg-surface-card border-border-divider shadow-md">
            <CardContent className="p-6">
              {/* Avatar & User Info */}
              <div className="text-center mb-6">
                <Avatar className="h-20 w-20 bg-accent-success mx-auto mb-4">
                  <AvatarFallback className="bg-accent-success text-text-primary font-bold text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-text-primary mb-1">
                  {user.name}
                </h2>
                <p className="text-sm text-text-secondary">
                  ID: {user.id}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDigitalKey}
                  className="flex flex-col items-center space-y-1 h-auto py-3 border-border-divider hover:bg-accent-success/20"
                >
                  <CreditCard className="h-5 w-5 text-primary-action" />
                  <span className="text-xs">Digital Key</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleQRCode}
                  className="flex flex-col items-center space-y-1 h-auto py-3 border-border-divider hover:bg-accent-success/20"
                >
                  <QrCode className="h-5 w-5 text-primary-action" />
                  <span className="text-xs">QR Code</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex flex-col items-center space-y-1 h-auto py-3 border-border-divider hover:bg-accent-success/20"
                >
                  <Download className="h-5 w-5 text-primary-action" />
                  <span className="text-xs">Export</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Navigation */}
          <Card className="bg-surface-card border-border-divider shadow-md">
            <CardContent className="p-0">
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between p-4 hover:bg-accent-success/20 transition-colors ${
                      index !== settingsItems.length - 1 ? 'border-b border-border-divider' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-text-secondary" />
                      <span className="text-text-primary font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-secondary" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Logout Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full bg-destructive-action/10 hover:bg-destructive-action/20 text-destructive-action border border-destructive-action/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-surface-card border-border-divider">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-text-primary">Log Out?</AlertDialogTitle>
                <AlertDialogDescription className="text-text-secondary">
                  Are you sure you want to log out? You'll need to sign in again to access your health data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border-divider">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleLogout}
                  className="bg-destructive-action hover:bg-destructive-action/90"
                >
                  Log Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <QRCodeModal isOpen={qrModalOpen} onOpenChange={setQrModalOpen} />
    </>
  );
};

export default ProfileScreen;
