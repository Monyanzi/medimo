import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullScreen?: boolean;
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    className,
    size = 'md',
    fullScreen = false,
    text
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={cn(
                    "animate-spin rounded-full border-primary-action border-t-transparent",
                    sizeClasses[size],
                    className
                )}
            />
            {text && <p className="text-text-secondary text-sm font-medium animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background-main/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
