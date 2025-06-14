
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CreditCard, QrCode, Download, User, Bell, Globe, FileText, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
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
    const keyInfo = {
      id: user?.id,
      name: user?.name,
      bloodType: user?.bloodType,
      emergencyContact: user?.emergencyContact?.name,
      qrCodeStatus: user?.qrCode ? 'Active' : 'Not Generated'
    };
    
    alert(`Digital Health Key\n\nID: ${keyInfo.id}\nName: ${keyInfo.name}\nBlood Type: ${keyInfo.bloodType}\nEmergency Contact: ${keyInfo.emergencyContact}\nQR Code: ${keyInfo.qrCodeStatus}`);
  };

  const handleQRCode = () => {
    setQrModalOpen(true);
  };

  const handleExport = async () => {
    console.log('Exporting PDF report...');
    try {
      const exportData = {
        user: user?.name,
        exportDate: new Date().toISOString(),
        sections: ['Personal Information', 'Medical History', 'Emergency Contacts', 'QR Code']
      };
      
      console.log('Export data prepared:', exportData);
      alert('Health data export has been prepared. In a real implementation, this would generate and download a PDF file.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8F9FA] font-inter">
        {/* Always show Header */}
        <Header />

        <div className="px-4 py-6 pb-24 space-y-6">
          {/* User Identity Card */}
          <Card className="bg-white border border-gray-100 shadow-md">
            <CardContent className="p-6">
              {/* Avatar & User Info */}
              <div className="text-center mb-6">
                <Avatar className="h-20 w-20 bg-[#0066CC] mx-auto mb-4">
                  <AvatarFallback className="bg-[#0066CC] text-white font-bold text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-600">
                  ID: {user.id}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDigitalKey}
                  className="flex flex-col items-center space-y-1 h-auto py-3 border-gray-200 hover:bg-[#0066CC]/5"
                >
                  <CreditCard className="h-5 w-5 text-[#0066CC]" />
                  <span className="text-xs">Digital Key</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleQRCode}
                  className="flex flex-col items-center space-y-1 h-auto py-3 border-gray-200 hover:bg-[#0066CC]/5"
                >
                  <QrCode className="h-5 w-5 text-[#0066CC]" />
                  <span className="text-xs">QR Code</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex flex-col items-center space-y-1 h-auto py-3 border-gray-200 hover:bg-[#0066CC]/5"
                >
                  <Download className="h-5 w-5 text-[#0066CC]" />
                  <span className="text-xs">Export</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Navigation */}
          <Card className="bg-white border border-gray-100 shadow-md">
            <CardContent className="p-0">
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                      index !== settingsItems.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-900 font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
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
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border border-gray-200">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900">Log Out?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Are you sure you want to log out? You'll need to sign in again to access your health data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Log Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Always show BottomNavigation */}
        <BottomNavigation />
      </div>

      <QRCodeModal isOpen={qrModalOpen} onOpenChange={setQrModalOpen} />
    </>
  );
};

export default ProfileScreen;
