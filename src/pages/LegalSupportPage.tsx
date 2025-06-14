
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Shield, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LegalSupportPage: React.FC = () => {
  const navigate = useNavigate();

  const legalItems = [
    {
      title: 'Terms of Service',
      description: 'Review our terms and conditions',
      icon: FileText,
      content: 'Our Terms of Service outline the rules and guidelines for using our health management platform...'
    },
    {
      title: 'Privacy Policy',
      description: 'Learn how we protect your data',
      icon: Shield,
      content: 'Your privacy is our priority. This policy explains how we collect, use, and protect your health information...'
    }
  ];

  const supportItems = [
    {
      title: 'Frequently Asked Questions',
      description: 'Common questions and answers',
      action: () => console.log('FAQ clicked')
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      action: () => console.log('Contact support clicked')
    },
    {
      title: 'User Guide',
      description: 'Learn how to use the app',
      action: () => console.log('User guide clicked')
    },
    {
      title: 'Report a Bug',
      description: 'Help us improve the app',
      action: () => console.log('Report bug clicked')
    },
    {
      title: 'Feature Request',
      description: 'Suggest new features',
      action: () => console.log('Feature request clicked')
    }
  ];

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
          <h1 className="text-lg font-bold text-text-primary">Legal & Support</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Legal Documents */}
        <Card className="bg-surface-card border-border-divider">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary-action" />
              <span className="text-text-primary">Legal Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {legalItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 text-text-secondary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{item.title}</h4>
                      <p className="text-sm text-text-secondary mb-3">{item.description}</p>
                      <div className="text-sm text-text-primary">
                        {item.content}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => console.log(`${item.title} read more clicked`)}
                      >
                        Read Full Document
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card className="bg-surface-card border-border-divider">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-primary-action" />
              <span className="text-text-primary">Help & Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supportItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-between h-auto p-4 text-left"
                onClick={item.action}
              >
                <div>
                  <div className="font-medium text-text-primary">{item.title}</div>
                  <div className="text-sm text-text-secondary">{item.description}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-text-secondary" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="bg-surface-card border-border-divider">
          <CardHeader>
            <CardTitle className="text-text-primary">App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Version</span>
              <span className="text-text-primary">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Last Updated</span>
              <span className="text-text-primary">December 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Developer</span>
              <span className="text-text-primary">Health Management Co.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LegalSupportPage;
