
import React from 'react';
import { AlertTriangle, Phone, Droplets, XCircle, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Contraindication keywords to parse from Important Notes
const CONTRAINDICATION_KEYWORDS = ['no x-ray', 'no mri', 'no radiation', 'no ct', 'pregnant'];

interface EmergencyData {
    name?: string;
    bloodType?: string;
    allergies?: string[];
    conditions?: string[];
    emergencyContact?: {
        name?: string;
        phone?: string;
        relationship?: string;
    };
    importantNotes?: string;
    qrCodeUrl?: string;
}

// Extract contraindications from important notes  
const extractContraindications = (notes: string): string[] => {
    if (!notes) return [];
    const lowerNotes = notes.toLowerCase();
    return CONTRAINDICATION_KEYWORDS.filter(keyword => lowerNotes.includes(keyword));
};

// Read emergency data from localStorage (works when logged out)
export const getEmergencyDataFromStorage = (): EmergencyData | null => {
    try {
        const data = localStorage.getItem('medimo_emergency_profile');
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

// Save emergency data to localStorage (called on login/profile update)
export const saveEmergencyDataToStorage = (data: EmergencyData): void => {
    try {
        localStorage.setItem('medimo_emergency_profile', JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save emergency data to localStorage:', error);
    }
};

interface DigitalEmergencyCardProps {
    /** Optional data override (for when user is logged in) */
    data?: EmergencyData;
}

const DigitalEmergencyCard: React.FC<DigitalEmergencyCardProps> = ({ data }) => {
    // Use provided data or read from localStorage  
    const emergencyData = data || getEmergencyDataFromStorage();

    if (!emergencyData) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 text-center">
                <Shield className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-[var(--medimo-text-primary)] mb-2">
                    No Emergency Data Available
                </h3>
                <p className="text-sm text-[var(--medimo-text-muted)]">
                    This device has no saved medical profile. Ask patient for physical wallet card.
                </p>
            </div>
        );
    }

    const contraindications = extractContraindications(emergencyData.importantNotes || '');
    const hasAllergies = emergencyData.allergies && emergencyData.allergies.length > 0;
    const hasEmergencyContact = emergencyData.emergencyContact?.name && emergencyData.emergencyContact?.phone;

    const handleEmergencyCall = () => {
        if (emergencyData.emergencyContact?.phone) {
            window.location.href = `tel:${emergencyData.emergencyContact.phone.replace(/\D/g, '')}`;
        }
    };

    return (
        <div className="space-y-4">
            {/* Patient Name & Blood Type - Most Critical */}
            <div className="bg-gradient-to-r from-[var(--medimo-accent)] to-[var(--medimo-accent)]/80 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">PATIENT</p>
                        <h2 className="font-display text-xl font-bold">{emergencyData.name || 'Unknown'}</h2>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                            <Droplets className="h-5 w-5" />
                            <span className="font-display text-2xl font-bold">{emergencyData.bloodType || '?'}</span>
                        </div>
                        <p className="text-xs text-white/70 mt-1">Blood Type</p>
                    </div>
                </div>
            </div>

            {/* Critical Contraindications - RED WARNING */}
            {contraindications.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-400 dark:border-red-600 rounded-xl p-4 animate-pulse-slow">
                    <div className="flex items-center gap-2 mb-3">
                        <XCircle className="h-5 w-5 text-red-600" />
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

            {/* Allergies - AMBER WARNING */}
            {hasAllergies && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-bold uppercase tracking-wider text-amber-600">
                            ALLERGIES
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {emergencyData.allergies!.map((allergy, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-full text-sm font-semibold text-amber-700 dark:text-amber-300"
                            >
                                ⚠️ {allergy}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Conditions */}
            {emergencyData.conditions && emergencyData.conditions.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-[var(--medimo-text-muted)]" />
                        <span className="text-xs font-mono uppercase tracking-wider text-[var(--medimo-text-muted)]">
                            Medical Conditions
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {emergencyData.conditions.map((condition, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm text-[var(--medimo-text-primary)]"
                            >
                                {condition}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Important Notes (excluding contraindications) */}
            {emergencyData.importantNotes && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-mono uppercase tracking-wider text-amber-600">
                            Important Notes
                        </span>
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                        {emergencyData.importantNotes}
                    </p>
                </div>
            )}

            {/* Emergency Contact - CALL BUTTON */}
            {hasEmergencyContact && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-mono uppercase tracking-wider text-emerald-600 mb-1">
                                Emergency Contact
                            </p>
                            <p className="font-display font-semibold text-[var(--medimo-text-primary)] text-lg">
                                {emergencyData.emergencyContact!.name}
                                {emergencyData.emergencyContact!.relationship && (
                                    <span className="text-[var(--medimo-text-muted)] font-normal text-sm ml-2">
                                        ({emergencyData.emergencyContact!.relationship})
                                    </span>
                                )}
                            </p>
                            <p className="text-sm font-mono text-[var(--medimo-text-secondary)]">
                                {emergencyData.emergencyContact!.phone}
                            </p>
                        </div>
                        <Button
                            onClick={handleEmergencyCall}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 px-5 font-display font-medium shadow-lg shadow-emerald-200"
                        >
                            <Phone className="h-5 w-5 mr-2" />
                            CALL
                        </Button>
                    </div>
                </div>
            )}

            {/* QR Code (if available) */}
            {emergencyData.qrCodeUrl && (
                <div className="flex justify-center pt-2">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                        <img
                            src={emergencyData.qrCodeUrl}
                            alt="Emergency QR Code"
                            className="w-32 h-32"
                        />
                        <p className="text-xs text-center text-slate-500 mt-2">Scan for full profile</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalEmergencyCard;
