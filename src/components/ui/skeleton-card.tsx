import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  variant?: 'card' | 'list-item' | 'profile' | 'timeline';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className, variant = 'card' }) => {
  const baseClasses = "animate-pulse rounded-2xl bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] overflow-hidden";
  
  if (variant === 'profile') {
    return (
      <div className={cn(baseClasses, "p-6", className)}>
        <div className="flex flex-col items-center gap-4">
          {/* Avatar skeleton */}
          <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
          {/* Name */}
          <div className="h-6 w-32 bg-muted rounded-lg animate-pulse" />
          {/* ID */}
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <div className="flex-1 h-14 bg-muted rounded-xl animate-pulse" />
          <div className="flex-1 h-14 bg-muted rounded-xl animate-pulse" />
          <div className="flex-1 h-14 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'list-item') {
    return (
      <div className={cn("flex items-center gap-4 p-4", className)}>
        <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className={cn(baseClasses, "p-4", className)}>
        <div className="flex items-start gap-3">
          {/* Timeline dot */}
          <div className="w-3 h-3 rounded-full bg-muted animate-pulse mt-1" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className={cn(baseClasses, "p-5", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
        </div>
      </div>
      {/* Content lines */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
      </div>
      {/* Action area */}
      <div className="mt-4 pt-4 border-t border-[var(--medimo-border)]">
        <div className="h-10 w-full bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

interface SkeletonTextProps {
  className?: string;
  lines?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ className, lines = 3 }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "h-4 bg-muted rounded animate-pulse",
            i === lines - 1 ? "w-3/4" : "w-full"
          )} 
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
};

interface SkeletonAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };
  
  return (
    <div className={cn("rounded-full bg-muted animate-pulse", sizes[size], className)} />
  );
};

export default SkeletonCard;