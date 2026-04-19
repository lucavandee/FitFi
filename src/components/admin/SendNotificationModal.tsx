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
      <div className="bg-[#FFFFFF] rounded-lg max-w-2xl w-full p-6 border border-[#E5E5E5] max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-[#1A1A1A] mb-6">
          📨 Notificatie Versturen
        </h3>

        {preselectedUserName && (
          <div className="mb-4 p-3 bg-[#FAFAF8] rounded-lg border border-[#E5E5E5]">
            <span className="text-sm text-[#8A8A8A]">Ontvanger: </span>
            <span className="text-sm font-medium text-[#1A1A1A]">{preselectedUserName}</span>
          </div>
        )}

        <div className="space-y-4">
          {!preselectedUserId && (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
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
                className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]"
              >
                <option value="all">Alle gebruikers</option>
                <option value="free">Alleen Free users</option>
                <option value="premium">Alleen Premium users</option>
                <option value="founder">Alleen Founders</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['info', 'success', 'warning', 'promo'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setInput({ ...input, type })}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    input.type === type
                      ? 'bg-[#A8513A] text-white'
                      : 'bg-[#FAFAF8] border border-[#E5E5E5] text-[#1A1A1A] hover:border-[#A8513A]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={input.title}
              onChange={(e) => setInput({ ...input, title: e.target.value })}
              placeholder="Bijvoorbeeld: Nieuwe premium features!"
              className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Bericht *
            </label>
            <textarea
              value={input.message}
              onChange={(e) => setInput({ ...input, message: e.target.value })}
              placeholder="Bijvoorbeeld: We hebben nieuwe outfit-suggesties toegevoegd. Bekijk ze in je dashboard."
              rows={4}
              className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                CTA Label (optioneel)
              </label>
              <input
                type="text"
                value={input.actionLabel || ''}
                onChange={(e) => setInput({ ...input, actionLabel: e.target.value })}
                placeholder="Bijvoorbeeld: Bekijk nu"
                className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                CTA URL (optioneel)
              </label>
              <input
                type="text"
                value={input.actionUrl || ''}
                onChange={(e) => setInput({ ...input, actionUrl: e.target.value })}
                placeholder="/dashboard"
                className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSend}
            disabled={loading || !input.title.trim() || !input.message.trim()}
            className="flex-1 px-6 py-3 bg-[#A8513A] text-white rounded-xl hover:bg-[#C2654A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Versturen...' : 'Verstuur Notificatie'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl hover:border-[#A8513A] transition-colors font-medium"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
