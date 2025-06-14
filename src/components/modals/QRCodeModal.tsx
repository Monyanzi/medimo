
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Download, AlertTriangle, RotateCcw } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onOpenChange }) => {
  const { user, regenerateQRCode, isLoading } = useAuth();

  const downloadQRCode = () => {
    if (!user?.qrCode?.imageUrl || !user) return;
    
    const link = document.createElement('a');
    link.download = `${user.name.replace(/\s+/g, '_')}_Emergency_QR.png`;
    link.href = user.qrCode.imageUrl;
    link.click();
  };

  const handleRegenerateQR = async () => {
    try {
      await regenerateQRCode();
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface-card border border-border-divider">
        <DialogHeader>
          <DialogTitle className="text-text-primary flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive-action" />
            Emergency QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-accent-warning/10 p-3 rounded-lg border border-accent-warning/20">
            <p className="text-sm text-text-secondary">
              This QR code contains your critical medical information for emergency responders.
            </p>
          </div>

          {user.qrCode?.imageUrl && (
            <div className="flex justify-center">
              <Card className="p-4 bg-white">
                <img 
                  src={user.qrCode.imageUrl} 
                  alt="Emergency QR Code" 
                  className="w-64 h-64" 
                />
              </Card>
            </div>
          )}

          {user.qrCode?.generatedAt && (
            <div className="text-center">
              <p className="text-xs text-text-secondary">
                Generated: {format(parseISO(user.qrCode.generatedAt), 'MMM d, yyyy h:mm a')}
              </p>
              <p className="text-xs text-text-secondary">
                ID: {user.qrCode.id}
              </p>
            </div>
          )}

          <div className="space-y-2 text-sm text-text-secondary">
            <p><strong>Included Information:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Name and Date of Birth</li>
              <li>Blood Type: {user.bloodType}</li>
              <li>Allergies: {user.allergies.length > 0 ? user.allergies.join(', ') : 'None'}</li>
              <li>Medical Conditions: {user.conditions.length > 0 ? user.conditions.join(', ') : 'None'}</li>
              <li>Emergency Contact Information</li>
              <li>Organ Donor Status</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={downloadQRCode}
              className="flex-1 bg-accent-success hover:bg-accent-success/90"
              disabled={!user.qrCode?.imageUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
            <Button 
              onClick={handleRegenerateQR}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isLoading ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>

          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
