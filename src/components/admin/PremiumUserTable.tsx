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
    <div className="bg-[#FFFFFF] rounded-xl border border-[#E5E5E5] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[#FAFAF8] to-[#FFFFFF]">
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                Gebruiker
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                Sinds
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-[#FAFAF8] transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C2654A] to-[#8A3D28] flex items-center justify-center text-white font-semibold text-sm">
                      {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1A1A1A]">
                        {user.full_name || 'Onbekend'}
                      </div>
                      <div className="text-xs text-[#8A8A8A]">
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
                          : 'bg-[#FAFAF8] text-[#1A1A1A] border border-[#E5E5E5]'
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
                      <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]">
                        <span className="text-green-500">✓</span>
                        <span>Style profile</span>
                      </div>
                    )}
                    {user.saved_outfits_count > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-[#8A8A8A]">
                        <span>💾</span>
                        <span>{user.saved_outfits_count} saved outfits</span>
                      </div>
                    )}
                    {user.referral_count > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-[#8A8A8A]">
                        <span>🎁</span>
                        <span>{user.referral_count} referrals</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#8A8A8A]">
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
                      className="px-3 py-1.5 text-xs font-medium text-[#A8513A] hover:bg-[#A8513A] hover:text-white rounded-lg border border-[#A8513A] transition-all duration-200"
                    >
                      📨 Message
                    </button>
                    <button
                      onClick={() => onManageUser(user)}
                      className="px-3 py-1.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#A8513A] hover:text-white rounded-lg border border-[#E5E5E5] hover:border-[#A8513A] transition-all duration-200"
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
