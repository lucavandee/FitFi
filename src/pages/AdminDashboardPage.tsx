import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import {
  getDashboardMetrics,
  searchUsers,
  setUserAdmin,
  setUserTier,
  getAuditLog,
  logAdminAction,
  exportUsersCSV,
  getRealtimeMetrics,
  type DashboardMetrics,
  type UserSearchResult,
  type AuditLogEntry,
} from '@/services/admin/adminService';
import PremiumMetricCard from '@/components/admin/PremiumMetricCard';
import PremiumUserTable from '@/components/admin/PremiumUserTable';
import GrowthChart from '@/components/admin/GrowthChart';
import TierDistributionChart from '@/components/admin/TierDistributionChart';
import QuickActionsMenu from '@/components/admin/QuickActionsMenu';
import SendNotificationModal from '@/components/admin/SendNotificationModal';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { isAdmin, user } = useIsAdmin();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'notifications'>(
    'overview'
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'free' | 'premium' | 'founder' | ''>('');
  const [filterAdmin, setFilterAdmin] = useState<boolean | ''>('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');

  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTargetUser, setNotificationTargetUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    loadData();
    logAdminAction('view_dashboard');

    const interval = setInterval(loadRealtimeMetrics, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);

    const [metricsData, usersData, auditData, realtimeData] = await Promise.all([
      getDashboardMetrics(),
      searchUsers({}),
      getAuditLog(50),
      getRealtimeMetrics(),
    ]);

    if (metricsData) setMetrics(metricsData);
    setUsers(usersData);
    setAuditLog(auditData);
    if (realtimeData) setRealtimeMetrics(realtimeData);
    setLoading(false);
  };

  const loadRealtimeMetrics = async () => {
    const data = await getRealtimeMetrics();
    if (data) setRealtimeMetrics(data);
  };

  const handleSearch = async () => {
    const results = await searchUsers({
      searchTerm: searchTerm || undefined,
      tier: filterTier || undefined,
      isAdmin: filterAdmin === '' ? undefined : filterAdmin,
    });
    setUsers(results);
  };

  const handleGrantAdmin = async () => {
    if (!selectedUser || !actionReason.trim()) {
      toast.error('Geef een reden op');
      return;
    }

    const success = await setUserAdmin(selectedUser.id, true, actionReason);
    if (success) {
      toast.success(`Admin rechten toegekend aan ${selectedUser.full_name}`);
      setSelectedUser(null);
      setActionReason('');
      await handleSearch();
      await loadData();
    } else {
      toast.error('Fout bij toekennen admin rechten');
    }
  };

  const handleRevokeAdmin = async () => {
    if (!selectedUser || !actionReason.trim()) {
      toast.error('Geef een reden op');
      return;
    }

    const success = await setUserAdmin(selectedUser.id, false, actionReason);
    if (success) {
      toast.success(`Admin rechten ingetrokken van ${selectedUser.full_name}`);
      setSelectedUser(null);
      setActionReason('');
      await handleSearch();
      await loadData();
    } else {
      toast.error('Fout bij intrekken admin rechten');
    }
  };

  const handleChangeTier = async (tier: 'free' | 'premium' | 'founder') => {
    if (!selectedUser || !actionReason.trim()) {
      toast.error('Geef een reden op');
      return;
    }

    const success = await setUserTier(selectedUser.id, tier, actionReason);
    if (success) {
      toast.success(`Tier gewijzigd naar ${tier} voor ${selectedUser.full_name}`);
      setSelectedUser(null);
      setActionReason('');
      await handleSearch();
      await loadData();
    } else {
      toast.error('Fout bij wijzigen tier');
    }
  };

  const handleExportCSV = async () => {
    toast.loading('Exporteren...');
    const csv = await exportUsersCSV();
    toast.dismiss();

    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitfi-users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success('Gebruikers geëxporteerd!');
      logAdminAction('export_users_csv');
    } else {
      toast.error('Fout bij exporteren');
    }
  };

  const filteredAuditLog = auditLog.filter((entry) => {
    const matchesSearch = auditSearch
      ? entry.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        JSON.stringify(entry.details).toLowerCase().includes(auditSearch.toLowerCase())
      : true;
    const matchesAction = auditActionFilter ? entry.action === auditActionFilter : true;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(auditLog.map((e) => e.action)));

  const quickActions = [
    {
      id: 'send-notification',
      label: 'Verstuur Notificatie',
      icon: '📨',
      gradient: 'var(--ff-color-primary-600), var(--ff-color-primary-800)',
      onClick: () => setShowNotificationModal(true),
    },
    {
      id: 'export-users',
      label: 'Exporteer Users',
      icon: '📥',
      gradient: '#10b981, #059669',
      onClick: handleExportCSV,
    },
    {
      id: 'view-users',
      label: 'Bekijk Gebruikers',
      icon: '👥',
      gradient: '#8b5cf6, #6366f1',
      onClick: () => setActiveTab('users'),
    },
    {
      id: 'audit-log',
      label: 'Audit Log',
      icon: '📋',
      gradient: '#f59e0b, #ef4444',
      onClick: () => setActiveTab('audit'),
    },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Geen toegang</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Je hebt admin rechten nodig om deze pagina te bekijken.
          </p>
          {user ? (
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] mb-6">
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Ingelogd als:</p>
              <p className="font-semibold text-[var(--color-text)]">{user.email}</p>
            </div>
          ) : (
            <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
              Log eerst in om toegang te krijgen.
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/inloggen')}
              className="px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Inloggen
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:border-[var(--ff-color-primary-700)] transition-all font-medium"
            >
              Terug naar home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="bg-gradient-to-br from-[var(--ff-color-primary-700)] via-[var(--ff-color-primary-800)] to-[var(--ff-color-primary-900)] pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-5xl">⚡</span>
                Admin Dashboard
              </h1>
              <p className="text-white/80 text-lg">
                Welkom terug, {user?.email?.split('@')[0]}
              </p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium border border-white/30"
            >
              🔄 Refresh
            </button>
          </div>

          {realtimeMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <PremiumMetricCard
                title="Total Users"
                value={realtimeMetrics.total_users || 0}
                subtitle={`${realtimeMetrics.admins || 0} admins`}
                icon={<span className="text-2xl">👥</span>}
                gradient="rgba(255,255,255,0.1), rgba(255,255,255,0.05)"
              />
              <PremiumMetricCard
                title="Premium"
                value={realtimeMetrics.premium_users || 0}
                subtitle="Betalende gebruikers"
                icon={<span className="text-2xl">💎</span>}
                gradient="rgba(255,255,255,0.1), rgba(255,255,255,0.05)"
                trend={{
                  value: 12.5,
                  label: 'vs vorige maand',
                  isPositive: true,
                }}
              />
              <PremiumMetricCard
                title="Growth (7d)"
                value={realtimeMetrics.growth_7d || 0}
                subtitle="Nieuwe users"
                icon={<span className="text-2xl">📈</span>}
                gradient="rgba(255,255,255,0.1), rgba(255,255,255,0.05)"
              />
              <PremiumMetricCard
                title="Engagement"
                value={`${
                  realtimeMetrics.total_users > 0
                    ? Math.round(
                        (realtimeMetrics.style_profiles / realtimeMetrics.total_users) * 100
                      )
                    : 0
                }%`}
                subtitle="Met style profile"
                icon={<span className="text-2xl">✨</span>}
                gradient="rgba(255,255,255,0.1), rgba(255,255,255,0.05)"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-24">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] mb-8 overflow-hidden">
          <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-bg)] to-[var(--color-surface)]">
            <div className="flex gap-1 p-2">
              {[
                { id: 'overview', label: '📊 Dashboard', icon: '📊' },
                { id: 'users', label: '👥 Gebruikers', icon: '👥' },
                { id: 'audit', label: '📋 Audit Log', icon: '📋' },
                { id: 'notifications', label: '📨 Notificaties', icon: '📨' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[var(--ff-color-primary-700)] text-white shadow-lg'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[var(--color-border)] rounded-full" />
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[var(--ff-color-primary-700)] rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="mt-4 text-sm text-[var(--color-text-secondary)]">Laden...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && metrics && (
                  <div className="space-y-6">
                    <QuickActionsMenu actions={quickActions} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <GrowthChart data={metrics.growth} totalUsers={metrics.total_users} />
                      <TierDistributionChart
                        tiers={metrics.tier_breakdown}
                        total={metrics.total_users}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          title: 'Style Profiles',
                          value: metrics.engagement.with_style_profile,
                          total: metrics.total_users,
                          icon: '✨',
                          color: 'var(--ff-color-primary-600)',
                        },
                        {
                          title: 'Saved Outfits',
                          value: metrics.engagement.with_saved_outfits,
                          total: metrics.total_users,
                          icon: '💾',
                          color: 'var(--ff-color-accent-600)',
                        },
                        {
                          title: 'Quiz Completed',
                          value: metrics.engagement.with_quiz_completed,
                          total: metrics.total_users,
                          icon: '✅',
                          color: '#10b981',
                        },
                      ].map((item) => {
                        const percentage =
                          item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : 0;
                        return (
                          <div
                            key={item.title}
                            className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                style={{ backgroundColor: `${item.color}20` }}
                              >
                                {item.icon}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                                  {item.title}
                                </div>
                                <div className="text-2xl font-bold text-[var(--color-text)]">
                                  {item.value}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <div className="text-lg font-semibold" style={{ color: item.color }}>
                                {percentage}%
                              </div>
                              <div className="text-xs text-[var(--color-text-secondary)]">
                                van totaal
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-6">
                    <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                          type="text"
                          placeholder="🔍 Zoek op naam of email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          className="px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] focus:border-transparent transition-all"
                        />
                        <select
                          value={filterTier}
                          onChange={(e) => setFilterTier(e.target.value as any)}
                          className="px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] focus:border-transparent transition-all"
                        >
                          <option value="">Alle tiers</option>
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                          <option value="founder">Founder</option>
                        </select>
                        <select
                          value={String(filterAdmin)}
                          onChange={(e) =>
                            setFilterAdmin(e.target.value === '' ? '' : e.target.value === 'true')
                          }
                          className="px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] focus:border-transparent transition-all"
                        >
                          <option value="">Alle users</option>
                          <option value="true">Alleen admins</option>
                          <option value="false">Geen admins</option>
                        </select>
                        <button
                          onClick={handleSearch}
                          className="px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-all font-semibold shadow-lg hover:shadow-xl"
                        >
                          Zoeken
                        </button>
                      </div>
                    </div>

                    <PremiumUserTable
                      users={users}
                      onManageUser={setSelectedUser}
                      onSendNotification={(user) => {
                        setNotificationTargetUser({ id: user.id, name: user.full_name });
                        setShowNotificationModal(true);
                      }}
                    />
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="space-y-6">
                    <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="🔍 Zoek in audit log..."
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          className="md:col-span-2 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] focus:border-transparent transition-all"
                        />
                        <select
                          value={auditActionFilter}
                          onChange={(e) => setAuditActionFilter(e.target.value)}
                          className="px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] focus:border-transparent transition-all"
                        >
                          <option value="">Alle acties</option>
                          {uniqueActions.map((action) => (
                            <option key={action} value={action}>
                              {action}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
                      <div className="p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-bg)] to-transparent">
                        <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
                          <span>📋</span>
                          Admin Audit Log
                        </h2>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {filteredAuditLog.length} entries{' '}
                          {auditSearch || auditActionFilter ? '(gefilterd)' : ''}
                        </p>
                      </div>
                      <div className="divide-y divide-[var(--color-border)] max-h-[600px] overflow-y-auto">
                        {filteredAuditLog.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-6 hover:bg-[var(--color-bg)] transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[var(--ff-color-primary-700)] text-white flex items-center justify-center font-bold shrink-0">
                                📝
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-[var(--color-text)]">
                                    {entry.action.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-[var(--color-bg)] rounded-full text-[var(--color-text-secondary)]">
                                    {new Date(entry.created_at).toLocaleString('nl-NL')}
                                  </span>
                                </div>
                                {entry.details && Object.keys(entry.details).length > 0 && (
                                  <pre className="mt-3 text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] overflow-x-auto">
                                    {JSON.stringify(entry.details, null, 2)}
                                  </pre>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-900)] rounded-xl p-12 text-center text-white">
                      <div className="text-7xl mb-6">📨</div>
                      <h2 className="text-3xl font-bold mb-3">Notificaties Versturen</h2>
                      <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                        Verstuur gepersonaliseerde berichten naar individuele gebruikers of broadcast
                        naar hele gebruikersgroepen
                      </p>
                      <button
                        onClick={() => setShowNotificationModal(true)}
                        className="px-8 py-4 bg-white text-[var(--ff-color-primary-700)] rounded-xl hover:shadow-2xl transition-all font-bold text-lg"
                      >
                        Nieuwe Notificatie Maken
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          title: 'Product Updates',
                          description: 'Vertel gebruikers over nieuwe features',
                          icon: '🚀',
                          color: 'var(--ff-color-primary-600)',
                        },
                        {
                          title: 'Promoties',
                          description: 'Stuur tijdelijke aanbiedingen',
                          icon: '🎁',
                          color: '#f59e0b',
                        },
                        {
                          title: 'Support',
                          description: 'Bereik gebruikers met persoonlijke hulp',
                          icon: '💬',
                          color: '#10b981',
                        },
                        {
                          title: 'Engagement',
                          description: 'Herinner gebruikers aan onafgemaakte acties',
                          icon: '⚡',
                          color: '#8b5cf6',
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all"
                        >
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4"
                            style={{ backgroundColor: `${item.color}20` }}
                          >
                            {item.icon}
                          </div>
                          <h3
                            className="text-lg font-semibold mb-2"
                            style={{ color: item.color }}
                          >
                            {item.title}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface)] rounded-2xl max-w-md w-full p-8 border border-[var(--color-border)] shadow-2xl">
            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-6">⚙️ Beheer Gebruiker</h3>

            <div className="mb-6 p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-800)] flex items-center justify-center text-white font-bold text-lg">
                  {selectedUser.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-text)]">
                    {selectedUser.full_name}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full font-medium">
                  {selectedUser.tier}
                </span>
                {selectedUser.is_admin && (
                  <span className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-full font-semibold border border-red-200">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <textarea
              placeholder="Reden voor actie (verplicht)"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] mb-6 transition-all"
              rows={3}
            />

            <div className="space-y-4 mb-6">
              <div className="text-sm font-semibold text-[var(--color-text)]">Admin Rechten:</div>
              <div className="flex gap-2">
                {!selectedUser.is_admin && (
                  <button
                    onClick={handleGrantAdmin}
                    disabled={!actionReason.trim()}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-lg hover:shadow-xl"
                  >
                    ✓ Grant Admin
                  </button>
                )}
                {selectedUser.is_admin && (
                  <button
                    onClick={handleRevokeAdmin}
                    disabled={!actionReason.trim()}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-lg hover:shadow-xl"
                  >
                    ✗ Revoke Admin
                  </button>
                )}
              </div>

              <div className="text-sm font-semibold text-[var(--color-text)] mt-6">
                Tier Wijzigen:
              </div>
              <div className="flex gap-2">
                {(['free', 'premium', 'founder'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleChangeTier(tier)}
                    disabled={!actionReason.trim() || selectedUser.tier === tier}
                    className="flex-1 px-4 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl hover:bg-[var(--ff-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-lg hover:shadow-xl"
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedUser(null);
                setActionReason('');
              }}
              className="w-full px-4 py-3 border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-xl hover:border-[var(--ff-color-primary-700)] transition-all text-sm font-semibold"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {showNotificationModal && (
        <SendNotificationModal
          onClose={() => {
            setShowNotificationModal(false);
            setNotificationTargetUser(null);
          }}
          preselectedUserId={notificationTargetUser?.id}
          preselectedUserName={notificationTargetUser?.name}
        />
      )}
    </div>
  );
}
