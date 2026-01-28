import React from 'react';

interface ProfileFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  className = '',
}) => {
  return (
    <div className={className}>
      <label className="text-sm font-semibold text-muted mb-1 block">
        {label}
      </label>
      {typeof value === 'string' ? (
        <p className="text-base font-medium text-text">{value}</p>
      ) : (
        value
      )}
    </div>
  );
};
