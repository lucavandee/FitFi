import React from 'react';
import { Trash2, History } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConversationControlsProps {
  hasHistory: boolean;
  onClear: () => Promise<boolean>;
  onRefresh?: () => Promise<void>;
}

export default function ConversationControls({ hasHistory, onClear, onRefresh }: ConversationControlsProps) {
  const handleClear = async () => {
    if (!hasHistory) return;

    const confirmed = window.confirm('Weet je zeker dat je het gesprek wilt wissen?');
    if (!confirmed) return;

    const success = await onClear();
    if (success) {
      toast.success('Gesprek gewist');
    } else {
      toast.error('Kon gesprek niet wissen');
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
      toast.success('Gespreksgeschiedenis vernieuwd');
    }
  };

  if (!hasHistory) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <History className="w-4 h-4" />
        <span>Gesprek wordt opgeslagen</span>
      </div>
      <div className="flex-1" />
      <button
        onClick={handleClear}
        className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-600 hover:text-[var(--color-text)] transition-colors"
        title="Gesprek wissen"
      >
        <Trash2 className="w-4 h-4" />
        Wissen
      </button>
    </div>
  );
}
