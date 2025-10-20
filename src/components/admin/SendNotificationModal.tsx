import { useState } from 'react';
import toast from 'react-hot-toast';
import { sendNotification, type NotificationInput } from '@/services/admin/adminService';

interface SendNotificationModalProps {
  onClose: () => void;
  preselectedUserId?: string;
  preselectedUserName?: string;
}

export default function SendNotificationModal({
  onClose,
  preselectedUserId,
  preselectedUserName,
}: SendNotificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState<NotificationInput>({
    targetUserId: preselectedUserId,
    title: '',
    message: '',
    type: 'info',
  });

  const handleSend = async () => {
    if (!input.title.trim() || !input.message.trim()) {
      toast.error('Titel en bericht zijn verplicht');
      return;
    }

    setLoading(true);
    const success = await sendNotification(input);
    setLoading(false);

    if (success) {
      toast.success('Notificatie verstuurd!');
      onClose();
    } else {
      toast.error('Fout bij versturen notificatie');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--color-surface)] rounded-lg max-w-2xl w-full p-6 border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-[var(--color-text)] mb-6">
          📨 Notificatie Versturen
        </h3>

        {preselectedUserName && (
          <div className="mb-4 p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
            <span className="text-sm text-[var(--color-text-secondary)]">Ontvanger: </span>
            <span className="text-sm font-medium text-[var(--color-text)]">{preselectedUserName}</span>
          </div>
        )}

        <div className="space-y-4">
          {!preselectedUserId && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Doelgroep
              </label>
              <select
                value={input.targetTier || 'all'}
                onChange={(e) =>
                  setInput({
                    ...input,
                    targetTier: e.target.value === 'all' ? undefined : (e.target.value as any),
                  })
                }
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
              >
                <option value="all">Alle gebruikers</option>
                <option value="free">Alleen Free users</option>
                <option value="premium">Alleen Premium users</option>
                <option value="founder">Alleen Founders</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['info', 'success', 'warning', 'promo'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setInput({ ...input, type })}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    input.type === type
                      ? 'bg-[var(--ff-color-primary-700)] text-white'
                      : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-700)]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={input.title}
              onChange={(e) => setInput({ ...input, title: e.target.value })}
              placeholder="Bijvoorbeeld: Nieuwe premium features!"
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Bericht *
            </label>
            <textarea
              value={input.message}
              onChange={(e) => setInput({ ...input, message: e.target.value })}
              placeholder="Bijvoorbeeld: We hebben zojuist nieuwe AI-powered outfit suggestions gelanceerd! Check het uit in je dashboard."
              rows={4}
              className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                CTA Label (optioneel)
              </label>
              <input
                type="text"
                value={input.actionLabel || ''}
                onChange={(e) => setInput({ ...input, actionLabel: e.target.value })}
                placeholder="Bijvoorbeeld: Bekijk nu"
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                CTA URL (optioneel)
              </label>
              <input
                type="text"
                value={input.actionUrl || ''}
                onChange={(e) => setInput({ ...input, actionUrl: e.target.value })}
                placeholder="/dashboard"
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSend}
            disabled={loading || !input.title.trim() || !input.message.trim()}
            className="flex-1 px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Versturen...' : 'Verstuur Notificatie'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:border-[var(--ff-color-primary-700)] transition-colors font-medium"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
