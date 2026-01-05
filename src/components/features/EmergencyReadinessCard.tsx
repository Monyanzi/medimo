
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, XCircle, ChevronRight } from 'lucide-react';
import { User } from '@/types';
import { Link } from 'react-router-dom';

interface EmergencyReadinessCardProps {
    user: User;
    medicationsCount: number;
}

interface CheckItem {
    label: string;
    complete: boolean;
    critical: boolean;
    link?: string;
}

const EmergencyReadinessCard: React.FC<EmergencyReadinessCardProps> = ({ user, medicationsCount }) => {
    const checks: CheckItem[] = [
        {
            label: 'Full name',
            complete: !!user.name && user.name.length > 2,
            critical: true,
        },
        {
            label: 'Date of birth',
            complete: !!user.dob,
            critical: true,
        },
        {
            label: 'Blood type',
            complete: !!user.bloodType && user.bloodType !== '',
            critical: true,
        },
        {
            label: 'Allergies',
            complete: user.allergies && user.allergies.length > 0,
            critical: true,
        },
        {
            label: 'Emergency contact',
            complete: !!(user.emergencyContact?.name && user.emergencyContact?.phone),
            critical: true,
        },
        {
            label: 'Medical conditions',
            complete: user.conditions && user.conditions.length > 0,
            critical: false,
        },
        {
            label: 'Current medications',
            complete: medicationsCount > 0,
            critical: false,
        },
        {
            label: 'Important notes',
            complete: !!user.importantNotes && user.importantNotes.length > 0,
            critical: false,
        },
        {
            label: 'QR code generated',
            complete: !!user.qrCode,
            critical: false,
        },
    ];

    const criticalChecks = checks.filter(c => c.critical);
    const completedCritical = criticalChecks.filter(c => c.complete).length;
    const allCompleted = checks.filter(c => c.complete).length;
    const totalChecks = checks.length;
    const completionPercent = Math.round((allCompleted / totalChecks) * 100);
    const criticalComplete = completedCritical === criticalChecks.length;

    const getStatusColor = () => {
        if (criticalComplete && completionPercent >= 80) return 'text-emerald-500';
        if (criticalComplete) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getStatusLabel = () => {
        if (criticalComplete && completionPercent >= 80) return 'Emergency Ready';
        if (criticalComplete) return 'Basics Complete';
        return 'Critical Info Missing';
    };

    const getStatusIcon = () => {
        if (criticalComplete && completionPercent >= 80) return CheckCircle2;
        if (criticalComplete) return AlertCircle;
        return XCircle;
    };

    const StatusIcon = getStatusIcon();

    return (
        <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl overflow-hidden">
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
                        <span className={`font-display font-semibold ${getStatusColor()}`}>
                            {getStatusLabel()}
                        </span>
                    </div>
                    <span className="text-sm text-[var(--medimo-text-muted)]">
                        {allCompleted}/{totalChecks} fields
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <Progress value={completionPercent} className="h-2" />
                </div>

                {/* Compact Checklist */}
                <div className="space-y-1.5">
                    {checks.map((check, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between py-1 px-2 rounded-lg ${!check.complete && check.critical
                                    ? 'bg-rose-50 dark:bg-rose-950/20'
                                    : ''
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {check.complete ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : check.critical ? (
                                    <XCircle className="h-4 w-4 text-rose-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-[var(--medimo-text-muted)]" />
                                )}
                                <span className={`text-sm ${check.complete
                                        ? 'text-[var(--medimo-text-secondary)]'
                                        : check.critical
                                            ? 'text-rose-600 font-medium'
                                            : 'text-[var(--medimo-text-muted)]'
                                    }`}>
                                    {check.label}
                                    {check.critical && !check.complete && (
                                        <span className="ml-1 text-xs text-rose-500">*required</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA if incomplete */}
                {!criticalComplete && (
                    <Link
                        to="/profile/personal-medical"
                        className="mt-4 flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
                    >
                        <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                            Complete critical info for emergencies
                        </span>
                        <ChevronRight className="h-4 w-4 text-rose-500" />
                    </Link>
                )}
            </CardContent>
        </Card>
    );
};

export default EmergencyReadinessCard;
