
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, QrCode, Share2, AlertTriangle } from 'lucide-react';
import QRCodeModal from '@/components/modals/QRCodeModal';
import { User } from '@/types';

interface DigitalHealthKeyProps {
  user: User;
}

const DigitalHealthKey: React.FC<DigitalHealthKeyProps> = ({ user }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const criticalInfoCount = user.conditions.length + user.allergies.length;
  const hasEmergencyContact = user.emergencyContact.name && user.emergencyContact.phone;

  return (
    <>
      <Card className="bg-surface-card border-2 border-primary-action shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-action/10 p-2 rounded-full">
                <Shield className="h-6 w-6 text-primary-action" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Digital Health Key</h2>
                <p className="text-sm text-text-secondary">Emergency medical information</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive-action" />
              <Badge className="bg-destructive-action text-white font-medium">
                EMERGENCY
              </Badge>
            </div>
          </div>

          <div className="bg-accent-success/5 rounded-lg p-4 mb-4 border border-accent-success/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-primary">Critical Information Ready</span>
              <span className="text-sm font-bold text-primary-action">{criticalInfoCount} items</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-secondary">Conditions:</span>
                <span className="font-medium text-text-primary ml-1">{user.conditions.length}</span>
              </div>
              <div>
                <span className="text-text-secondary">Allergies:</span>
                <span className="font-medium text-text-primary ml-1">{user.allergies.length}</span>
              </div>
              <div>
                <span className="text-text-secondary">Blood Type:</span>
                <span className="font-medium text-text-primary ml-1">{user.bloodType}</span>
              </div>
              <div>
                <span className="text-text-secondary">Emergency Contact:</span>
                <span className={`font-medium ml-1 ${hasEmergencyContact ? 'text-primary-action' : 'text-destructive-action'}`}>
                  {hasEmergencyContact ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={() => setQrModalOpen(true)}
              className="flex-1 bg-primary-action hover:bg-primary-action/90 text-white font-medium"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Show QR Code
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-primary-action text-primary-action hover:bg-primary-action/10"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Quick Share
            </Button>
          </div>

          <p className="text-xs text-text-secondary text-center mt-3">
            🔒 Your data is encrypted and only shared when you choose
          </p>
        </CardContent>
      </Card>

      <QRCodeModal isOpen={qrModalOpen} onOpenChange={setQrModalOpen} />
    </>
  );
};

export default DigitalHealthKey;
