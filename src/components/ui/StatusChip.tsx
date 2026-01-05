import React from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';

export type StatusLevel = 'normal' | 'elevated' | 'critical';

interface StatusChipProps {
  status: StatusLevel;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

const iconFor: Record<StatusLevel, React.ReactNode> = {
  normal: <Check strokeWidth={2} />,
  elevated: <AlertTriangle strokeWidth={2} />,
  critical: <X strokeWidth={2} />
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, className = '', showIcon = true }) => {
  return (
    <span className={`status-chip chip-${status} ${className}`.trim()} aria-label={`Status: ${status}`}> 
      {showIcon && iconFor[status]}
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusChip;