
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsPage: React.FC = () => {
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
          <h1 className="text-lg font-bold text-text-primary">Terms of Service</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        <Card className="bg-surface-card border-border-divider">
          <CardHeader>
            <CardTitle className="text-text-primary">Terms of Service</CardTitle>
            <p className="text-sm text-text-secondary">Last updated: June 14, 2025</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-text-secondary">
            <section>
              <h3 className="font-semibold text-text-primary mb-2">1. Acceptance of Terms</h3>
              <p>By accessing and using Medimo, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">2. Medical Information</h3>
              <p>Medimo is designed to help you organize and manage your health information. This app is not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">3. Data Security</h3>
              <p>We implement appropriate security measures to protect your personal health information. However, no method of transmission over the internet or electronic storage is 100% secure.</p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">4. User Responsibilities</h3>
              <p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">5. Emergency QR Code</h3>
              <p>The emergency QR code feature is provided for convenience only. In case of a medical emergency, always call emergency services immediately. Do not rely solely on the QR code for emergency medical information.</p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">6. Limitation of Liability</h3>
              <p>In no event shall Medimo be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.</p>
            </section>

            <section>
              <h3 className="font-semibold text-text-primary mb-2">7. Changes to Terms</h3>
              <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;
