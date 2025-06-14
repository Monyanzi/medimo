
import React from 'react';
import { CreditCard, Share } from 'lucide-react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DigitalHealthKeyProps {
  user: User;
}

const DigitalHealthKey: React.FC<DigitalHealthKeyProps> = ({ user }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Medimo Digital Health Key',
          text: `${user.name}'s Medical Information`,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${user.name}'s Digital Health Key - ${window.location.origin}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-surface-card shadow-lg border-border-divider font-inter">
      <CardContent className="p-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-medimo-silver" />
            <span className="font-bold text-medimo-silver text-lg tracking-wide">
              MEDIMO DIGITAL KEY
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="p-2 hover:bg-accent-success/20"
          >
            <Share className="h-5 w-5 text-medimo-silver" />
          </Button>
        </div>

        {/* Patient Info Block */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              {user.name}
            </h2>
            <p className="text-sm text-text-secondary">
              Patient ID: #{user.id}
            </p>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm text-text-secondary">DOB:</span>
              <span className="text-sm font-medium text-text-primary">
                {formatDate(user.dob)}
              </span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm text-text-secondary">Blood Type:</span>
              <span className="text-sm font-medium text-text-primary">
                {user.bloodType}
              </span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm text-text-secondary">Organ Donor:</span>
              <span className="text-sm font-medium text-text-primary">
                {user.organDonor ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-border-divider mb-6"></div>

        {/* Critical Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Critical Allergies */}
          <div>
            <h3 className="font-semibold text-text-primary mb-2 text-sm">
              Critical Allergies
            </h3>
            {user.allergies.length > 0 ? (
              <ul className="space-y-1">
                {user.allergies.map((allergy, index) => (
                  <li key={index} className="text-sm text-destructive-action font-medium">
                    • {allergy}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-secondary">None reported</p>
            )}
          </div>

          {/* Critical Conditions */}
          <div>
            <h3 className="font-semibold text-text-primary mb-2 text-sm">
              Critical Conditions
            </h3>
            {user.conditions.length > 0 ? (
              <ul className="space-y-1">
                {user.conditions.map((condition, index) => (
                  <li key={index} className="text-sm text-text-primary">
                    • {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-secondary">None reported</p>
            )}
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="font-semibold text-text-primary mb-2 text-sm">
              Emergency Contact
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-primary">
                {user.emergencyContact.name}
              </p>
              <p className="text-sm text-text-secondary">
                {user.emergencyContact.relationship}
              </p>
              <p className="text-sm text-primary-action font-medium">
                {user.emergencyContact.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Insurance Section (Optional) */}
        {user.insurance && (
          <>
            <div className="border-t border-border-divider mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-text-secondary">Provider:</span>
                <p className="text-sm font-medium text-text-primary">
                  {user.insurance.provider}
                </p>
              </div>
              <div>
                <span className="text-sm text-text-secondary">Policy #:</span>
                <p className="text-sm font-medium text-text-primary">
                  {user.insurance.policyNumber}
                </p>
              </div>
              <div>
                <span className="text-sm text-text-secondary">Member ID:</span>
                <p className="text-sm font-medium text-text-primary">
                  {user.insurance.memberId}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DigitalHealthKey;
