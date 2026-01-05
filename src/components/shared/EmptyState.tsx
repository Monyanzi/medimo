import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    illustration: string;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    illustration,
    title,
    description,
    actionLabel,
    onAction,
    className
}) => {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
            {/* Illustration */}
            <div className="w-48 h-36 mb-6 relative">
                <img
                    src={illustration}
                    alt=""
                    className="w-full h-full object-contain"
                    aria-hidden="true"
                />
            </div>

            {/* Title */}
            <h3 className="font-display text-xl font-semibold text-[var(--medimo-text-primary)] mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-[var(--medimo-text-secondary)] text-sm max-w-xs mb-6 leading-relaxed">
                {description}
            </p>

            {/* Action Button */}
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="rounded-xl bg-[var(--medimo-accent)] hover:bg-[var(--medimo-accent)]/90 px-6 h-11 font-display font-medium"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
