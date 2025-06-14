
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-main font-inter">
      {/* Header */}
      <header className="bg-surface-card border-b border-border-divider px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-text-primary">Privacy Policy</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        <Card className="bg-surface-card border-border-divider">
          <CardHeader>
            <CardTitle className="text-text-primary">Privacy Policy</CardTitle>
            <p className="text-sm text-text-secondary">Last updated: June 14, 2025</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-text-secondary">
            <section>
              <h3 className="font-semibold text-text-primary mb-2">Information We Collect</h3>
              <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our services. This includes:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Personal information (name, email, date of birth)</li>
                <li>Health information (medical conditions, allergies, medications)</li>
                <li>Emergency contact information</li>
                <li>Insurance information (optional)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Provide and maintain our services</li>
                <li>Generate your emergency QR code</li>
                <li>Send you medication and appointment reminders</li>
                <li>Improve our services and user experience</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">Information Sharing</h3>
              <p>We do not sell, trade, or otherwise transfer your personal health information to third parties except:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>In case of medical emergencies (via QR code)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">Data Security</h3>
              <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">Data Retention</h3>
              <p>We retain your personal information only as long as necessary to provide our services and comply with our legal obligations.</p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">Your Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@medimo.app</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPage;
