
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      id: '1',
      question: 'How do I generate my emergency QR code?',
      answer: 'Go to your Profile, tap on "QR Code", and your emergency QR code will be automatically generated with your critical medical information.'
    },
    {
      id: '2',
      question: 'Is my health data secure?',
      answer: 'Yes, we use industry-standard encryption to protect your data. Your information is stored securely and only shared with your explicit consent or in emergency situations via your QR code.'
    },
    {
      id: '3',
      question: 'Can I export my health data?',
      answer: 'Yes, you can export your health data as a PDF report from your Profile page by tapping the "Export" button.'
    },
    {
      id: '4',
      question: 'How do I add medications or appointments?',
      answer: 'Use the floating action button (+ icon) on the home screen to quickly add medications, appointments, or log vital signs.'
    },
    {
      id: '5',
      question: 'What happens if I lose access to my account?',
      answer: 'Contact our support team immediately. We can help you recover your account using your registered email address and emergency contact information.'
    }
  ];

  const handleFAQToggle = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support form submitted:', contactForm);
    // TODO: Implement actual form submission
    alert('Thank you for your message. We\'ll get back to you within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

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
          <h1 className="text-lg font-bold text-text-primary">Help & Support</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Quick Contact Options */}
        <Card className="bg-surface-card border-border-divider">
          <CardHeader>
            <CardTitle className="text-text-primary">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent-success/10 border border-accent-success/20">
              <Mail className="h-5 w-5 text-accent-success" />
              <div>
                <p className="font-medium text-text-primary">Email Support</p>
                <p className="text-sm text-text-secondary">support@medimo.app</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary-action/10 border border-primary-action/20">
              <Phone className="h-5 w-5 text-primary-action" />
              <div>
                <p className="font-medium text-text-primary">Phone Support</p>
                <p className="text-sm text-text-secondary">1-800-MEDIMO (1-800-633-4660)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent-warning/10 border border-accent-warning/20">
              <MessageCircle className="h-5 w-5 text-accent-warning" />
              <div>
                <p className="font-medium text-text-primary">Live Chat</p>
                <p className="text-sm text-text-secondary">Available 24/7 for urgent issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-surface-card border-border-divider">
          <CardHeader>
            <CardTitle className="text-text-primary">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {faqs.map((faq) => (
              <Collapsible key={faq.id} open={openFAQ === faq.id} onOpenChange={() => handleFAQToggle(faq.id)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto text-left hover:bg-accent-success/10"
                  >
                    <span className="font-medium text-text-primary">{faq.question}</span>
                    {openFAQ === faq.id ? (
                      <ChevronUp className="h-4 w-4 text-text-secondary" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-secondary" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <p className="text-sm text-text-secondary">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="bg-surface-card border-border-divider">
          <CardHeader>
            <CardTitle className="text-text-primary">Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="How can we help you?"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please describe your issue or question in detail..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary-action hover:bg-primary-action/90">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
