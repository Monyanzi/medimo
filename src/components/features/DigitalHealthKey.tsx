
import React from 'react';
import { CreditCard, Share, AlertTriangle } from 'lucide-react';
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
    <Card className="bg-white border border-gray-100 shadow-lg">
      <CardContent className="p-6">
        {/* Emergency Banner */}
        <div className="flex items-center justify-between mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">EMERGENCY ACCESS</span>
          </div>
          <div className="text-red-600 text-xl">🚨</div>
        </div>

        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-[#0066CC]" />
            <span className="font-bold text-[#0066CC] text-lg tracking-wide">
              MEDIMO DIGITAL KEY
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="p-2 hover:bg-[#0066CC]/10 text-[#0066CC]"
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>

        {/* Patient Info Block */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {user.name}
            </h2>
            <p className="text-sm text-gray-600">
              Patient ID: #{user.id}
            </p>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm text-gray-600">DOB:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(user.dob)}
              </span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm text-gray-600">Blood Type:</span>
              <span className="text-sm font-medium text-red-600">
                {user.bloodType}
              </span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm text-gray-600">Organ Donor:</span>
              <span className="text-sm font-medium text-gray-900">
                {user.organDonor ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Critical Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Critical Allergies */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
              Critical Allergies
            </h3>
            {user.allergies.length > 0 ? (
              <ul className="space-y-1">
                {user.allergies.map((allergy, index) => (
                  <li key={index} className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                    ⚠️ {allergy}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">None reported</p>
            )}
          </div>

          {/* Critical Conditions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              Medical Conditions
            </h3>
            {user.conditions.length > 0 ? (
              <ul className="space-y-1">
                {user.conditions.map((condition, index) => (
                  <li key={index} className="text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded">
                    • {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">None reported</p>
            )}
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              Emergency Contact
            </h3>
            <div className="space-y-1 bg-[#0066CC]/5 p-3 rounded">
              <p className="text-sm font-medium text-gray-900">
                {user.emergencyContact.name}
              </p>
              <p className="text-sm text-gray-600">
                {user.emergencyContact.relationship}
              </p>
              <p className="text-sm text-[#0066CC] font-medium">
                {user.emergencyContact.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Insurance Section */}
        {user.insurance && (
          <>
            <div className="border-t border-gray-200 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Provider:</span>
                <p className="text-sm font-medium text-gray-900">
                  {user.insurance.provider}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Policy #:</span>
                <p className="text-sm font-medium text-gray-900">
                  {user.insurance.policyNumber}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Member ID:</span>
                <p className="text-sm font-medium text-gray-900">
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
