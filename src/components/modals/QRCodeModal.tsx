
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Download, RotateCcw, QrCode, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onOpenChange }) => {
  const { user, regenerateQRCode, isLoading } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const downloadQRCode = async () => {
    if (!user?.qrCode?.imageUrl || !user) {
      toast.error('QR code not available for download');
      return;
    }

    try {
      const response = await fetch(user.qrCode.imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch QR code image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `${user.name.replace(/\s+/g, '_')}_Emergency_QR.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded!');

    } catch (error) {
      console.error('QR code download failed:', error);
      toast.error('Failed to download QR code');
    }
  };

  const handleRegenerateQR = async () => {
    try {
      await regenerateQRCode();
      toast.success('QR code regenerated!');
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
      toast.error('Failed to regenerate QR code');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl bg-[var(--medimo-bg-elevated)] border-[var(--medimo-border)]">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-teal-500/20">
            <QrCode className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="font-display text-xl text-[var(--medimo-text-primary)]">
            Emergency QR Code
          </DialogTitle>
          <DialogDescription className="text-[var(--medimo-text-secondary)]">
            Scan to access critical medical info
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Display */}
          {user.qrCode?.imageUrl ? (
            <div className="flex justify-center">
              <div className="relative p-4 bg-white rounded-2xl shadow-lg">
                <img
                  src={user.qrCode.imageUrl}
                  alt="Emergency QR Code"
                  className="w-52 h-52"
                  onError={() => toast.error('QR code failed to load')}
                />
                {/* Corner accent */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-52 h-52 bg-[var(--medimo-bg-secondary)] rounded-2xl border-2 border-dashed border-[var(--medimo-border)] flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-10 w-10 text-[var(--medimo-text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--medimo-text-muted)]">No QR code yet</p>
                  <p className="text-xs text-[var(--medimo-text-muted)]">Generate one below</p>
                </div>
              </div>
            </div>
          )}

          {/* Generation Info */}
          {user.qrCode?.generatedAt && (
            <p className="text-center text-xs text-[var(--medimo-text-muted)]">
              Generated {format(parseISO(user.qrCode.generatedAt), 'MMM d, yyyy')}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={downloadQRCode}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-teal-500/20"
              disabled={!user.qrCode?.imageUrl || isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleRegenerateQR}
              variant="outline"
              className="flex-1 h-11 rounded-xl border-[var(--medimo-border)] hover:bg-[var(--medimo-bg-secondary)]"
              disabled={isLoading}
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Working...' : 'Regenerate'}
            </Button>
          </div>

          {/* Collapsible Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between py-2 text-sm text-[var(--medimo-text-muted)] hover:text-[var(--medimo-text-secondary)] transition-colors"
          >
            <span>What's included in this QR?</span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDetails && (
            <div className="bg-[var(--medimo-bg-secondary)] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--medimo-text-muted)]">Blood Type</span>
                <span className="font-medium text-[var(--medimo-text-primary)]">{user.bloodType || 'Not set'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--medimo-text-muted)]">Allergies</span>
                <span className="font-medium text-[var(--medimo-text-primary)]">
                  {user.allergies?.length > 0 ? user.allergies.length + ' listed' : 'None'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--medimo-text-muted)]">Conditions</span>
                <span className="font-medium text-[var(--medimo-text-primary)]">
                  {user.conditions?.length > 0 ? user.conditions.length + ' listed' : 'None'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--medimo-text-muted)]">Emergency Contact</span>
                <span className="font-medium text-[var(--medimo-text-primary)]">
                  {user.emergencyContact?.name ? '✓ Set' : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--medimo-text-muted)]">Organ Donor</span>
                <span className="font-medium text-[var(--medimo-text-primary)]">
                  {user.organDonor ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
