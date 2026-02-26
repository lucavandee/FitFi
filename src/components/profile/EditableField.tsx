import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  'aria-label'?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  placeholder = 'Typ je tekst',
  'aria-label': ariaLabel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
      toast.success('Opgeslagen', { duration: 3000 });
    } catch {
      toast.error('Er ging iets mis', { duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  return (
    <div>
      <label className="text-sm font-semibold text-[var(--color-text)] mb-1.5 block">{label}</label>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 h-11 px-3.5 bg-[var(--color-bg)] border border-[var(--ff-color-primary-500)] rounded-xl text-[var(--color-text)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2 transition-colors"
            placeholder={placeholder}
            autoFocus
            aria-label={ariaLabel || `Bewerk ${label.toLowerCase()}`}
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 w-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[var(--ff-color-primary-700)] text-white rounded-xl hover:bg-[var(--ff-color-primary-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
            aria-label="Opslaan"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="h-11 w-11 min-w-[44px] min-h-[44px] flex items-center justify-center border border-[var(--color-border)] text-[var(--color-muted)] rounded-xl hover:border-[var(--ff-color-primary-400)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2 transition-colors"
            aria-label="Annuleren"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text)] flex-1 min-w-0 truncate">{value}</span>
          <button
            onClick={() => {
              setEditValue(value);
              setIsEditing(true);
            }}
            className="h-9 w-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-50)] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2 transition-colors flex-shrink-0"
            aria-label={`Wijzig ${label.toLowerCase()}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
