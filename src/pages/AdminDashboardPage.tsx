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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'notifications'>('overview');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'free' | 'premium' | 'founder' | ''>('');
  const [filterAdmin, setFilterAdmin] = useState<boolean | ''>('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');

  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTargetUser, setNotificationTargetUser] = useState<{ id: string; name: string } | null>(null);

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Geen toegang</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Je hebt admin rechten nodig om deze pagina te bekijken.
          </p>
          {user ? (
            <p className="mt-4 text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]">
              Ingelogd als: <strong className="text-[var(--color-text)]">{user.email}</strong>
              <br />
              <span className="text-xs">Admin toegang vereist.</span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
              Log eerst in om toegang te krijgen.
            </p>
          )}
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={() => navigate('/inloggen')}
              className="px-6 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors"
            >
              Inloggen
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:border-[var(--ff-color-primary-700)] transition-colors"
            >
              Terug naar home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">⚡ Admin Dashboard</h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              Centraal beheer van gebruikers, metrics en acties
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNotificationModal(true)}
              className="px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors font-medium text-sm"
            >
              📨 Notificatie versturen
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:border-[var(--ff-color-primary-700)] transition-colors font-medium text-sm"
            >
              📥 Export CSV
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:border-[var(--ff-color-primary-700)] transition-colors font-medium text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="border-b border-[var(--color-border)] mb-8">
          <div className="flex gap-6">
            {[
              { id: 'overview', label: '📊 Overzicht' },
              { id: 'users', label: '👥 Gebruikers' },
              { id: 'audit', label: '📋 Audit Log' },
              { id: 'notifications', label: '📨 Notificaties' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[var(--ff-color-primary-700)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--ff-color-primary-700)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && metrics && (
              <div className="space-y-6">
                {realtimeMetrics && (
                  <div className="bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-900)] rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">⚡ Realtime Metrics</h2>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">Live</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{realtimeMetrics.total_users || 0}</div>
                        <div className="text-sm opacity-90">Total Users</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{realtimeMetrics.premium_users || 0}</div>
                        <div className="text-sm opacity-90">Premium</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{realtimeMetrics.growth_7d || 0}</div>
                        <div className="text-sm opacity-90">Growth (7d)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{realtimeMetrics.active_sessions || 0}</div>
                        <div className="text-sm opacity-90">Active Sessions</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Totaal Gebruikers"
                    value={metrics.total_users}
                    subtitle={`${metrics.admin_count} admin${metrics.admin_count !== 1 ? 's' : ''}`}
                  />
                  <MetricCard
                    title="Premium Users"
                    value={metrics.tier_breakdown.premium + metrics.tier_breakdown.founder}
                    subtitle={`${metrics.tier_breakdown.founder} founders`}
                  />
                  <MetricCard
                    title="Groei (30d)"
                    value={metrics.growth.last_30d}
                    subtitle={`${metrics.growth.last_7d} laatste 7 dagen`}
                  />
                  <MetricCard
                    title="Engagement"
                    value={metrics.engagement.with_style_profile}
                    subtitle="met style profile"
                  />
                </div>

                <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                    Tier Verdeling
                  </h2>
                  <div className="space-y-3">
                    <TierBar
                      label="Free"
                      count={metrics.tier_breakdown.free}
                      total={metrics.total_users}
                      color="var(--color-border)"
                    />
                    <TierBar
                      label="Premium"
                      count={metrics.tier_breakdown.premium}
                      total={metrics.total_users}
                      color="var(--ff-color-primary-600)"
                    />
                    <TierBar
                      label="Founder"
                      count={metrics.tier_breakdown.founder}
                      total={metrics.total_users}
                      color="var(--ff-color-accent-600)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <EngagementCard
                    title="Style Profiles"
                    count={metrics.engagement.with_style_profile}
                    total={metrics.total_users}
                  />
                  <EngagementCard
                    title="Saved Outfits"
                    count={metrics.engagement.with_saved_outfits}
                    total={metrics.total_users}
                  />
                  <EngagementCard
                    title="Quiz Completed"
                    count={metrics.engagement.with_quiz_completed}
                    total={metrics.total_users}
                  />
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Zoek op naam of email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
                    />
                    <select
                      value={filterTier}
                      onChange={(e) => setFilterTier(e.target.value as any)}
                      className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
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
                      className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
                    >
                      <option value="">Alle users</option>
                      <option value="true">Alleen admins</option>
                      <option value="false">Geen admins</option>
                    </select>
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors font-medium"
                    >
                      Zoeken
                    </button>
                  </div>
                </div>

                <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--color-bg)]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                            Gebruiker
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                            Tier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                            Admin
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                            Sinds
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                            Acties
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {users.map((usr) => (
                          <tr key={usr.id} className="hover:bg-[var(--color-bg)] transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-[var(--color-text)]">
                                  {usr.full_name}
                                </div>
                                <div className="text-sm text-[var(--color-text-secondary)]">
                                  {usr.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  usr.tier === 'founder'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : usr.tier === 'premium'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {usr.tier}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {usr.is_admin && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  Admin
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                              <div className="flex flex-col gap-1">
                                {usr.has_style_profile && (
                                  <span className="text-xs">✓ Style profile</span>
                                )}
                                {usr.saved_outfits_count > 0 && (
                                  <span className="text-xs">
                                    {usr.saved_outfits_count} saved outfits
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                              {new Date(usr.created_at).toLocaleDateString('nl-NL')}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setSelectedUser(usr)}
                                  className="text-sm text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] font-medium"
                                >
                                  Beheer
                                </button>
                                <button
                                  onClick={() => {
                                    setNotificationTargetUser({ id: usr.id, name: usr.full_name });
                                    setShowNotificationModal(true);
                                  }}
                                  className="text-sm text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] font-medium"
                                >
                                  📨
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Zoek in audit log..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="md:col-span-2 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
                    />
                    <select
                      value={auditActionFilter}
                      onChange={(e) => setAuditActionFilter(e.target.value)}
                      className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
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

                <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
                  <div className="p-6 border-b border-[var(--color-border)]">
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">
                      📋 Admin Audit Log
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {filteredAuditLog.length} entries {auditSearch || auditActionFilter ? '(gefilterd)' : ''}
                    </p>
                  </div>
                  <div className="divide-y divide-[var(--color-border)] max-h-[600px] overflow-y-auto">
                    {filteredAuditLog.map((entry) => (
                      <div key={entry.id} className="p-6 hover:bg-[var(--color-bg)] transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[var(--color-text)]">
                                {entry.action.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {new Date(entry.created_at).toLocaleString('nl-NL')}
                              </span>
                            </div>
                            {entry.details && Object.keys(entry.details).length > 0 && (
                              <pre className="mt-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg)] p-3 rounded border border-[var(--color-border)] overflow-x-auto">
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
                <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-8 text-center">
                  <div className="text-6xl mb-4">📨</div>
                  <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                    Notificaties Versturen
                  </h2>
                  <p className="text-[var(--color-text-secondary)] mb-6">
                    Verstuur berichten naar specifieke gebruikers of broadcast naar hele groepen
                  </p>
                  <button
                    onClick={() => setShowNotificationModal(true)}
                    className="px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors font-medium"
                  >
                    Nieuwe Notificatie Maken
                  </button>
                </div>

                <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
                  <h3 className="font-semibold text-[var(--color-text)] mb-4">💡 Voorbeelden</h3>
                  <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex gap-2">
                      <span className="shrink-0">•</span>
                      <div>
                        <strong className="text-[var(--color-text)]">Product updates:</strong> Vertel gebruikers over nieuwe features
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="shrink-0">•</span>
                      <div>
                        <strong className="text-[var(--color-text)]">Promoties:</strong> Stuur tijdelijke aanbiedingen naar free users
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="shrink-0">•</span>
                      <div>
                        <strong className="text-[var(--color-text)]">Support:</strong> Bereik specifieke gebruikers met persoonlijke hulp
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="shrink-0">•</span>
                      <div>
                        <strong className="text-[var(--color-text)]">Engagement:</strong> Herinner gebruikers aan onafgemaakte profielen
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-surface)] rounded-lg max-w-md w-full p-6 border border-[var(--color-border)]">
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Beheer Gebruiker
              </h3>

              <div className="mb-4 p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {selectedUser.full_name}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {selectedUser.email}
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs px-2 py-1 bg-[var(--color-border)] rounded">
                    {selectedUser.tier}
                  </span>
                  {selectedUser.is_admin && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              <textarea
                placeholder="Reden voor actie (verplicht)"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] mb-4"
                rows={3}
              />

              <div className="space-y-3 mb-4">
                <div className="text-sm font-medium text-[var(--color-text)]">Admin Rechten:</div>
                <div className="flex gap-2">
                  {!selectedUser.is_admin && (
                    <button
                      onClick={handleGrantAdmin}
                      disabled={!actionReason.trim()}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Grant Admin
                    </button>
                  )}
                  {selectedUser.is_admin && (
                    <button
                      onClick={handleRevokeAdmin}
                      disabled={!actionReason.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Revoke Admin
                    </button>
                  )}
                </div>

                <div className="text-sm font-medium text-[var(--color-text)] mt-4">
                  Tier Wijzigen:
                </div>
                <div className="flex gap-2">
                  {(['free', 'premium', 'founder'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => handleChangeTier(tier)}
                      disabled={!actionReason.trim() || selectedUser.tier === tier}
                      className="flex-1 px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
                className="w-full px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:border-[var(--ff-color-primary-700)] transition-colors text-sm font-medium"
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
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
      <div className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">{title}</div>
      <div className="text-3xl font-bold text-[var(--color-text)] mb-1">{value}</div>
      <div className="text-xs text-[var(--color-text-secondary)]">{subtitle}</div>
    </div>
  );
}

function TierBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[var(--color-text)]">{label}</span>
        <span className="text-[var(--color-text-secondary)]">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function EngagementCard({
  title,
  count,
  total,
}: {
  title: string;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
      <div className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">{title}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-[var(--color-text)]">{count}</div>
        <div className="text-sm text-[var(--color-text-secondary)]">
          / {total} ({percentage.toFixed(1)}%)
        </div>
      </div>
    </div>
  );
}
