
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield, QrCode, Phone, AlertTriangle, Heart,
  User as UserIcon, Edit, Download, CreditCard,
  FileText, Share2, ChevronDown, XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QRCodeModal from '@/components/modals/QRCodeModal';
import { User, Medication } from '@/types';
import { toast } from 'sonner';
import { format, parseISO, differenceInYears } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { generateWalletCardPDF } from '@/services/walletCardService';
import { generateTimelinePDF } from '@/services/pdfExportService';

interface DigitalHealthKeyProps {
  user: User;
  medications?: Medication[];
}

const DigitalHealthKey: React.FC<DigitalHealthKeyProps> = ({ user, medications = [] }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const hasEmergencyContact = user.emergencyContact?.name && user.emergencyContact?.phone;
  const activeMeds = medications.filter(m => m.status === 'active');

  // Calculate age from DOB
  const getAge = () => {
    if (!user.dob) return null;
    try {
      return differenceInYears(new Date(), parseISO(user.dob));
    } catch {
      return null;
    }
  };
  const age = getAge();

  // Contraindication keywords to parse from Important Notes
  const CONTRAINDICATION_KEYWORDS = ['no x-ray', 'no mri', 'no radiation', 'no ct', 'pregnant'];

  // Extract contraindications from important notes
  const extractContraindications = (notes: string): string[] => {
    if (!notes) return [];
    const lowerNotes = notes.toLowerCase();
    return CONTRAINDICATION_KEYWORDS.filter(keyword => lowerNotes.includes(keyword));
  };

  const contraindications = extractContraindications(user.importantNotes || '');

  const handleEmergencyCall = () => {
    const phone = user.emergencyContact?.phone;
    if (phone) {
      window.location.href = `tel:${phone.replace(/\D/g, '')}`;
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      toast.info('Generating Medical Record PDF...');
      // Pass empty vital signs and no timeline for the quick summary
      await generateTimelinePDF(user, [], {
        medications,
        appointments: [],
        vitalSigns: [],
        includeTimeline: false,
        importantNotes: user.importantNotes
      });
      toast.success('Medical Record PDF downloaded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWalletCard = async () => {
    try {
      setIsExporting(true);
      toast.info('Creating Wallet Card...');
      await generateWalletCardPDF(user, medications);
      toast.success('Wallet Card PDF downloaded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create Wallet Card');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl overflow-hidden card-hover reveal-2 shadow-sm">
        <CardContent className="p-0">
          {/* Header Band - Premium Identity */}
          <div className="bg-gradient-to-r from-[var(--medimo-accent)] to-[var(--medimo-accent)]/80 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar/Initial */}
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl font-display border-2 border-white/30 shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white tracking-tight">
                    {user.name}
                  </h2>
                  <p className="text-white/80 text-sm font-medium">
                    {age && `${age} years • `}{user.bloodType} Blood
                    {user.organDonor && ' • Organ Donor 💚'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${hasEmergencyContact ? 'bg-emerald-400' : 'bg-amber-400'} pulse-gentle shadow-lg shadow-emerald-400/20`} />
                <Shield className="h-5 w-5 text-white/90" />
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-5">
            {/* Conditions - Actual Data */}
            {user.conditions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Heart className="h-4 w-4 text-[var(--medimo-text-muted)]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--medimo-text-muted)] font-semibold">
                    Medical Conditions
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.conditions.map((condition, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-[var(--medimo-bg-primary)] border border-[var(--medimo-border)] rounded-full text-sm text-[var(--medimo-text-primary)] font-medium shadow-sm"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies - Warning Style */}
            {user.allergies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-600 font-semibold">
                    Allergies
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-700 font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Active Medications */}
            {activeMeds.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--medimo-text-muted)] font-semibold">
                    💊 Current Medications
                  </span>
                </div>
                <p className="text-sm text-[var(--medimo-text-primary)] leading-relaxed">
                  {activeMeds.map(m => `${m.name} ${m.dosage}`).join(' • ')}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-[var(--medimo-border)]/60" />

            {/* Emergency Contact */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <UserIcon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">Emergency Contact</p>
                    <p className="font-display font-semibold text-[var(--medimo-text-primary)] text-base">
                      {user.emergencyContact?.name || 'Not set'}
                      {user.emergencyContact?.relationship && (
                        <span className="text-[var(--medimo-text-muted)] font-normal text-sm">
                          {' '}• {user.emergencyContact.relationship}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-600 font-mono">
                      {user.emergencyContact?.phone || 'No phone'}
                    </p>
                  </div>
                </div>
                {user.emergencyContact?.phone && (
                  <Button
                    onClick={handleEmergencyCall}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 px-4 font-display font-medium shadow-sm shadow-emerald-200"
                  >
                    <Phone className="h-3.5 w-3.5 mr-2" />
                    Call
                  </Button>
                )}
              </div>
            </div>

            {/* Insurance */}
            {user.insurance && (
              <div className="text-sm text-[var(--medimo-text-secondary)] bg-[var(--medimo-bg-primary)] rounded-lg px-4 py-3 flex items-center border border-[var(--medimo-border)]/50">
                <Shield className="h-3.5 w-3.5 mr-2 text-[var(--medimo-text-muted)]" />
                <span className="font-medium text-[var(--medimo-text-primary)]">{user.insurance.provider}</span>
                <span className="mx-2 text-[var(--medimo-border)]">|</span>
                <span className="font-mono text-xs text-[var(--medimo-text-muted)] tracking-wide">{user.insurance.memberId}</span>
              </div>
            )}

            {/* CRITICAL CONTRAINDICATIONS - Red Warning (Higher visibility than amber notes) */}
            {contraindications.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-400 dark:border-red-600 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5 text-red-600 animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wider text-red-600">
                    ⚠️ CRITICAL CONTRAINDICATIONS
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contraindications.map((item, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/50 border-2 border-red-300 dark:border-red-700 rounded-full text-base font-bold text-red-700 dark:text-red-300 uppercase"
                    >
                      ⛔ {item.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Important Notes - Critical for doctors */}
            {user.importantNotes && user.importantNotes.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-600 font-semibold">
                    Important Notes
                  </span>
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  {user.importantNotes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    className="flex-1 bg-[var(--medimo-accent)] hover:bg-[var(--medimo-accent)]/90 text-white shadow-md shadow-[var(--medimo-accent)]/20 h-11 rounded-xl font-display font-medium group transition-all duration-300"
                  >
                    <Share2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Access & Share
                    <ChevronDown className="h-4 w-4 ml-2 opacity-70 group-hover:translate-y-0.5 transition-transform" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl border-[var(--medimo-border)] bg-[var(--medimo-bg-elevated)] shadow-xl p-1">
                  <DropdownMenuLabel className="text-xs text-[var(--medimo-text-muted)] uppercase tracking-wider font-semibold px-2 py-1.5">
                    Emergency Access
                  </DropdownMenuLabel>

                  <DropdownMenuItem onClick={() => setQrModalOpen(true)} className="rounded-lg cursor-pointer focus:bg-[var(--medimo-bg-primary)] focus:text-[var(--medimo-accent)] py-2.5">
                    <QrCode className="h-4 w-4 mr-2.5 text-[var(--medimo-text-muted)]" />
                    <span className="font-medium">Show QR Code</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-[var(--medimo-border)]/50 mx-1" />

                  <DropdownMenuItem onClick={handleExportWalletCard} disabled={isExporting} className="rounded-lg cursor-pointer focus:bg-[var(--medimo-bg-primary)] focus:text-[var(--medimo-accent)] py-2.5">
                    <CreditCard className="h-4 w-4 mr-2.5 text-[var(--medimo-text-muted)]" />
                    <div>
                      <span className="font-medium block">Wallet Card</span>
                      <span className="text-[10px] text-[var(--medimo-text-muted)]">Printable ID-size PDF</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting} className="rounded-lg cursor-pointer focus:bg-[var(--medimo-bg-primary)] focus:text-[var(--medimo-accent)] py-2.5">
                    <FileText className="h-4 w-4 mr-2.5 text-[var(--medimo-text-muted)]" />
                    <div>
                      <span className="font-medium block">Detailed Record</span>
                      <span className="text-[10px] text-[var(--medimo-text-muted)]">Full medical summary PDF</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        </CardContent>
      </Card>

      <QRCodeModal isOpen={qrModalOpen} onOpenChange={setQrModalOpen} />
    </>
  );
};

export default DigitalHealthKey;
