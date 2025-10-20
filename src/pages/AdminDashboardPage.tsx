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
import { Users, TrendingUp, Award, Activity, Download, Bell, Search as SearchIcon } from 'lucide-react';

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Geen toegang</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Je hebt admin rechten nodig om deze pagina te bekijken.
          </p>
          {user ? (
            <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] mb-6">
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
              className="px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] hover:bg-[var(--ff-color-primary-700)] transition-colors font-semibold"
            >
              Inloggen
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-xl)] hover:border-[var(--ff-color-primary-600)] transition-colors font-semibold"
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
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Admin Dashboard</h1>
              <p className="text-[var(--color-text-secondary)]">
                Welkom terug, {user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNotificationModal(true)}
                className="px-4 py-2 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-lg)] hover:bg-[var(--ff-color-primary-700)] transition-colors font-medium text-sm flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Notificatie
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-lg)] hover:border-[var(--ff-color-primary-600)] transition-colors font-medium text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-lg)] hover:border-[var(--ff-color-primary-600)] transition-colors font-medium text-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Metrics Cards */}
        {realtimeMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--ff-color-primary-600)]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Total Users</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {realtimeMetrics.total_users || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {realtimeMetrics.admins || 0} admins
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--ff-color-primary-600)]/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Premium</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {realtimeMetrics.premium_users || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">Betalende gebruikers</p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--ff-color-primary-600)]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Growth (7d)</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {realtimeMetrics.growth_7d || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">Nieuwe users</p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--ff-color-primary-600)]/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Engagement</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {realtimeMetrics.total_users > 0
                      ? Math.round(
                          (realtimeMetrics.style_profiles / realtimeMetrics.total_users) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">Met style profile</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] overflow-hidden mb-8">
          <div className="border-b border-[var(--color-border)]">
            <div className="flex">
              {[
                { id: 'overview', label: 'Dashboard' },
                { id: 'users', label: 'Gebruikers' },
                { id: 'audit', label: 'Audit Log' },
                { id: 'notifications', label: 'Notificaties' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[var(--ff-color-primary-600)] text-[var(--ff-color-primary-600)]'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
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
                <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--ff-color-primary-600)] rounded-full animate-spin" />
                <p className="mt-4 text-sm text-[var(--color-text-secondary)]">Laden...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && metrics && (
                  <div className="space-y-6">
                    {/* Growth Overview */}
                    <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6">
                        Groei Overzicht
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: '7 dagen', value: metrics.growth.last_7d },
                          { label: '30 dagen', value: metrics.growth.last_30d },
                          { label: '90 dagen', value: metrics.growth.last_90d },
                        ].map((item) => {
                          const percentage =
                            metrics.total_users > 0
                              ? ((item.value / metrics.total_users) * 100).toFixed(1)
                              : 0;
                          return (
                            <div key={item.label}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-[var(--color-text)]">
                                  {item.label}
                                </span>
                                <span className="text-sm font-bold text-[var(--color-text)]">
                                  {item.value} ({percentage}%)
                                </span>
                              </div>
                              <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[var(--ff-color-primary-600)] transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tier Distribution */}
                    <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6">
                        Tier Verdeling
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Free', value: metrics.tier_breakdown.free },
                          { label: 'Premium', value: metrics.tier_breakdown.premium },
                          { label: 'Founder', value: metrics.tier_breakdown.founder },
                        ].map((tier) => {
                          const percentage =
                            metrics.total_users > 0
                              ? ((tier.value / metrics.total_users) * 100).toFixed(1)
                              : 0;
                          return (
                            <div
                              key={tier.label}
                              className="bg-[var(--color-bg)] rounded-[var(--radius-lg)] p-4 text-center"
                            >
                              <p className="text-2xl font-bold text-[var(--color-text)] mb-1">
                                {tier.value}
                              </p>
                              <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                                {tier.label}
                              </p>
                              <p className="text-xs font-semibold text-[var(--ff-color-primary-600)]">
                                {percentage}%
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          title: 'Style Profiles',
                          value: metrics.engagement.with_style_profile,
                          total: metrics.total_users,
                        },
                        {
                          title: 'Saved Outfits',
                          value: metrics.engagement.with_saved_outfits,
                          total: metrics.total_users,
                        },
                        {
                          title: 'Quiz Completed',
                          value: metrics.engagement.with_quiz_completed,
                          total: metrics.total_users,
                        },
                      ].map((item) => {
                        const percentage =
                          item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : 0;
                        return (
                          <div
                            key={item.title}
                            className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6"
                          >
                            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                              {item.title}
                            </p>
                            <p className="text-3xl font-bold text-[var(--color-text)] mb-1">
                              {item.value}
                            </p>
                            <p className="text-sm text-[var(--ff-color-primary-600)] font-semibold">
                              {percentage}% van totaal
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="bg-[var(--color-bg)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="relative">
                          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                          <input
                            type="text"
                            placeholder="Zoek op naam of email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] focus:border-transparent"
                          />
                        </div>
                        <select
                          value={filterTier}
                          onChange={(e) => setFilterTier(e.target.value as any)}
                          className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
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
                          className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
                        >
                          <option value="">Alle users</option>
                          <option value="true">Alleen admins</option>
                          <option value="false">Geen admins</option>
                        </select>
                        <button
                          onClick={handleSearch}
                          className="px-6 py-2 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-lg)] hover:bg-[var(--ff-color-primary-700)] transition-colors font-semibold"
                        >
                          Zoeken
                        </button>
                      </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[var(--color-bg)]">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase">
                                Gebruiker
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase">
                                Tier
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase">
                                Engagement
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase">
                                Sinds
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--color-text)] uppercase">
                                Acties
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border)]">
                            {users.map((usr) => (
                              <tr
                                key={usr.id}
                                className="hover:bg-[var(--color-bg)] transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--ff-color-primary-600)] text-white flex items-center justify-center font-semibold">
                                      {usr.full_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-[var(--color-text)]">
                                        {usr.full_name || 'Onbekend'}
                                      </div>
                                      <div className="text-xs text-[var(--color-text-secondary)]">
                                        {usr.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                      usr.tier === 'founder'
                                        ? 'bg-amber-100 text-amber-800'
                                        : usr.tier === 'premium'
                                        ? 'bg-[var(--ff-color-primary-600)]/10 text-[var(--ff-color-primary-700)]'
                                        : 'bg-[var(--color-bg)] text-[var(--color-text)]'
                                    }`}
                                  >
                                    {usr.tier}
                                  </span>
                                  {usr.is_admin && (
                                    <span className="ml-2 inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                      Admin
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                                  <div className="space-y-1">
                                    {usr.has_style_profile && <div>✓ Style profile</div>}
                                    {usr.saved_outfits_count > 0 && (
                                      <div>{usr.saved_outfits_count} saved outfits</div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                                  {new Date(usr.created_at).toLocaleDateString('nl-NL')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => {
                                        setNotificationTargetUser({
                                          id: usr.id,
                                          name: usr.full_name,
                                        });
                                        setShowNotificationModal(true);
                                      }}
                                      className="text-xs px-3 py-1.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-lg)] hover:border-[var(--ff-color-primary-600)] transition-colors font-medium"
                                    >
                                      Message
                                    </button>
                                    <button
                                      onClick={() => setSelectedUser(usr)}
                                      className="text-xs px-3 py-1.5 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-lg)] hover:bg-[var(--ff-color-primary-700)] transition-colors font-medium"
                                    >
                                      Beheer
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
                    <div className="bg-[var(--color-bg)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Zoek in audit log..."
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          className="md:col-span-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
                        />
                        <select
                          value={auditActionFilter}
                          onChange={(e) => setAuditActionFilter(e.target.value)}
                          className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
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

                    <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden">
                      <div className="p-6 border-b border-[var(--color-border)]">
                        <h2 className="text-lg font-semibold text-[var(--color-text)]">
                          Admin Audit Log
                        </h2>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {filteredAuditLog.length} entries
                        </p>
                      </div>
                      <div className="divide-y divide-[var(--color-border)] max-h-[600px] overflow-y-auto">
                        {filteredAuditLog.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-6 hover:bg-[var(--color-bg)] transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-sm font-semibold text-[var(--color-text)]">
                                {entry.action.replace(/_/g, ' ').toUpperCase()}
                              </div>
                              <div className="text-xs text-[var(--color-text-secondary)]">
                                {new Date(entry.created_at).toLocaleString('nl-NL')}
                              </div>
                            </div>
                            {entry.details && Object.keys(entry.details).length > 0 && (
                              <pre className="mt-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg)] p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-x-auto">
                                {JSON.stringify(entry.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-[var(--color-text-secondary)] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                      Notificaties Versturen
                    </h2>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                      Verstuur berichten naar specifieke gebruikers of hele groepen
                    </p>
                    <button
                      onClick={() => setShowNotificationModal(true)}
                      className="px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] hover:bg-[var(--ff-color-primary-700)] transition-colors font-semibold"
                    >
                      Nieuwe Notificatie Maken
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] max-w-md w-full p-8 border border-[var(--color-border)]">
            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-6">Beheer Gebruiker</h3>

            <div className="mb-6 p-4 bg-[var(--color-bg)] rounded-[var(--radius-xl)] border border-[var(--color-border)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-600)] text-white flex items-center justify-center font-bold">
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
                <span className="text-xs px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full font-medium">
                  {selectedUser.tier}
                </span>
                {selectedUser.is_admin && (
                  <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <textarea
              placeholder="Reden voor actie (verplicht)"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-xl)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] mb-6"
              rows={3}
            />

            <div className="space-y-4 mb-6">
              <div className="text-sm font-semibold text-[var(--color-text)]">Admin Rechten:</div>
              <div className="flex gap-2">
                {!selectedUser.is_admin && (
                  <button
                    onClick={handleGrantAdmin}
                    disabled={!actionReason.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-[var(--radius-lg)] hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold"
                  >
                    Grant Admin
                  </button>
                )}
                {selectedUser.is_admin && (
                  <button
                    onClick={handleRevokeAdmin}
                    disabled={!actionReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[var(--radius-lg)] hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold"
                  >
                    Revoke Admin
                  </button>
                )}
              </div>

              <div className="text-sm font-semibold text-[var(--color-text)] mt-4">
                Tier Wijzigen:
              </div>
              <div className="flex gap-2">
                {(['free', 'premium', 'founder'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleChangeTier(tier)}
                    disabled={!actionReason.trim() || selectedUser.tier === tier}
                    className="flex-1 px-4 py-2 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-lg)] hover:bg-[var(--ff-color-primary-700)] disabled:opacity-50 transition-colors font-semibold"
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
              className="w-full px-4 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-lg)] hover:border-[var(--ff-color-primary-600)] transition-colors font-semibold"
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
