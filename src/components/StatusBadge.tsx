import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'live' | 'active' | 'operational' | 'maintenance' | 'error';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'live':
      case 'active':
      case 'operational':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          defaultLabel: 'Live'
        };
      case 'maintenance':
        return {
          icon: <Clock className="w-4 h-4" />,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          defaultLabel: 'Onderhoud'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          defaultLabel: 'Offline'
        };
      default:
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          defaultLabel: 'Live'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  return (
    <div
      className={`inline-flex items-center space-x-2 rounded-full border font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${getSizeClasses()} ${className}`}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </div>
  );
};

export default StatusBadge;