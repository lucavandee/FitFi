import React, { useState } from 'react';
import { Edit2, CheckCircle, XCircle } from 'lucide-react';
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
      toast.success('Opgeslagen', {
        duration: 3000,
        position: 'top-center',
      });
    } catch (error) {
      toast.error('Er ging iets mis', {
        duration: 3000,
        position: 'top-center',
      });
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
      <label className="text-sm font-semibold text-muted mb-2 block">{label}</label>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 h-11 px-3 bg-white border-2 border-primary-500 rounded-lg text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            placeholder={placeholder}
            autoFocus
            aria-label={ariaLabel || `Bewerk ${label.toLowerCase()}`}
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 w-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-success-600 text-white rounded-lg hover:bg-success-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500 disabled:opacity-50 transition-colors"
            aria-label="Opslaan"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          <button
            onClick={handleCancel}
            className="h-11 w-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-danger-600 text-white rounded-lg hover:bg-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 transition-colors"
            aria-label="Annuleren"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-text">{value}</span>
          <button
            onClick={() => {
              setEditValue(value);
              setIsEditing(true);
            }}
            className="h-11 w-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
            aria-label={`Wijzig ${label.toLowerCase()}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
