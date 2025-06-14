
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Download, AlertTriangle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onOpenChange }) => {
  const { user, regenerateQRCode, isLoading } = useAuth();

  const downloadQRCode = async () => {
    if (!user?.qrCode?.imageUrl || !user) {
      toast.error('QR code not available for download');
      return;
    }
    
    try {
      console.log('Downloading QR code:', user.qrCode.imageUrl);
      
      // Create a temporary link to download the QR code
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
      toast.success('QR code downloaded successfully!');
      
    } catch (error) {
      console.error('QR code download failed:', error);
      toast.error('Failed to download QR code. Please try again.');
    }
  };

  const handleRegenerateQR = async () => {
    try {
      console.log('Regenerating QR code...');
      await regenerateQRCode();
      toast.success('QR code regenerated successfully!');
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
      toast.error('Failed to regenerate QR code. Please try again.');
    }
  };

  if (!user) {
    return null;
  }

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

          {user.qrCode?.imageUrl ? (
            <div className="flex justify-center">
              <Card className="p-4 bg-white">
                <img 
                  src={user.qrCode.imageUrl} 
                  alt="Emergency QR Code" 
                  className="w-64 h-64" 
                  onError={(e) => {
                    console.error('QR code image failed to load');
                    toast.error('QR code image failed to load');
                  }}
                />
              </Card>
            </div>
          ) : (
            <div className="flex justify-center">
              <Card className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">QR Code not available</p>
                    <p className="text-xs text-gray-400">Try regenerating</p>
                  </div>
                </div>
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
              <li>Allergies: {user.allergies?.length > 0 ? user.allergies.join(', ') : 'None'}</li>
              <li>Medical Conditions: {user.conditions?.length > 0 ? user.conditions.join(', ') : 'None'}</li>
              <li>Emergency Contact Information</li>
              <li>Organ Donor Status: {user.organDonor ? 'Yes' : 'No'}</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={downloadQRCode}
              className="flex-1 bg-accent-success hover:bg-accent-success/90"
              disabled={!user.qrCode?.imageUrl || isLoading}
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
