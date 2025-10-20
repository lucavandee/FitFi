import { UserSearchResult } from '@/services/admin/adminService';

interface PremiumUserTableProps {
  users: UserSearchResult[];
  onManageUser: (user: UserSearchResult) => void;
  onSendNotification: (user: UserSearchResult) => void;
}

export default function PremiumUserTable({
  users,
  onManageUser,
  onSendNotification,
}: PremiumUserTableProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[var(--color-bg)] to-[var(--color-surface)]">
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                Gebruiker
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                Sinds
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-[var(--color-bg)] transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-800)] flex items-center justify-center text-white font-semibold text-sm">
                      {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--color-text)]">
                        {user.full_name || 'Onbekend'}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.tier === 'founder'
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                          : user.tier === 'premium'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)]'
                      }`}
                    >
                      {user.tier === 'founder' && '⭐ '}
                      {user.tier === 'premium' && '💎 '}
                      {user.tier}
                    </span>
                    {user.is_admin && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        🛡️ Admin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {user.has_style_profile && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text)]">
                        <span className="text-green-500">✓</span>
                        <span>Style profile</span>
                      </div>
                    )}
                    {user.saved_outfits_count > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                        <span>💾</span>
                        <span>{user.saved_outfits_count} saved outfits</span>
                      </div>
                    )}
                    {user.referral_count > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                        <span>🎁</span>
                        <span>{user.referral_count} referrals</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {new Date(user.created_at).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onSendNotification(user)}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-700)] hover:text-white rounded-lg border border-[var(--ff-color-primary-700)] transition-all duration-200"
                    >
                      📨 Message
                    </button>
                    <button
                      onClick={() => onManageUser(user)}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--ff-color-primary-700)] hover:text-white rounded-lg border border-[var(--color-border)] hover:border-[var(--ff-color-primary-700)] transition-all duration-200"
                    >
                      ⚙️ Beheer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
