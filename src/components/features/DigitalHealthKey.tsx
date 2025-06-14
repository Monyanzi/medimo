
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, QrCode, Share2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import QRCodeModal from '@/components/modals/QRCodeModal';
import { User } from '@/types';

interface DigitalHealthKeyProps {
  user: User;
}

const DigitalHealthKey: React.FC<DigitalHealthKeyProps> = ({ user }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-primary-action">{criticalInfoCount} items</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
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

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-accent-success/20 space-y-3">
                {user.conditions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-2">Medical Conditions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-destructive-action/10 text-destructive-action border-destructive-action/30">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {user.allergies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-2">Allergies:</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {hasEmergencyContact && (
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-2">Emergency Contact:</h4>
                    <div className="text-xs">
                      <p className="font-medium">{user.emergencyContact.name}</p>
                      <p className="text-text-secondary">{user.emergencyContact.relationship}</p>
                      <p className="text-primary-action font-mono">{user.emergencyContact.phone}</p>
                    </div>
                  </div>
                )}

                {user.insurance && (
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-2">Insurance:</h4>
                    <div className="text-xs space-y-1">
                      <p><span className="text-text-secondary">Provider:</span> <span className="font-medium">{user.insurance.provider}</span></p>
                      <p><span className="text-text-secondary">Member ID:</span> <span className="font-mono">{user.insurance.memberId}</span></p>
                    </div>
                  </div>
                )}
              </div>
            )}
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
