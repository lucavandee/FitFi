import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, CircleCheck as CheckCircle, Circle as XCircle, Crown, Download, RefreshCw, ChevronUp, ChevronDown, ArrowLeft, Filter, MoveVertical as MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { setUserTier, exportUsersCSV } from '@/services/admin/adminService';
import UserDetailDrawer from '@/components/admin/UserDetailDrawer';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  tier: 'free' | 'premium' | 'founder';
  is_admin: boolean;
  created_at: string;
  last_sign_in: string | null;
  quiz_completed: boolean;
  referral_count: number;
  subscription_status: string | null;
}

type SortField = 'created_at' | 'last_sign_in' | 'email' | 'tier';
type SortDir = 'asc' | 'desc';

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  founder: { label: 'Founder', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  premium: { label: 'Premium', cls: 'bg-blue-50 text-[var(--ff-color-nova)] border border-blue-200' },
  free:    { label: 'Free',    cls: 'bg-[var(--ff-color-primary-50)] text-[var(--color-muted)] border border-[var(--color-border)]' },
};

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color || 'text-[var(--color-text)]'}`}>{value}</div>
    </motion.div>
  );
}

function SortButton({ field, current, dir, onClick }: {
  field: SortField; current: SortField; dir: SortDir; onClick: (f: SortField) => void;
}) {
  const active = field === current;
  return (
    <button onClick={() => onClick(field)} className="inline-flex items-center gap-0.5 hover:text-[var(--ff-color-primary-700)] transition-colors">
      {active ? (
        dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3 opacity-30" />
      )}
    </button>
  );
}

const QUICK_TIER_LABELS: Record<string, string> = {
  free: 'Free',
  premium: 'Premium',
  founder: 'Founder',
};

export default function AdminUsersPage() {
  const { isAdmin, isLoading: authLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterQuiz, setFilterQuiz] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;
  const fetchedRef = useRef(false);

  const stats = useMemo(() => ({
    total: users.length,
    free: users.filter(u => u.tier === 'free').length,
    premium: users.filter(u => u.tier === 'premium').length,
    founder: users.filter(u => u.tier === 'founder').length,
    admins: users.filter(u => u.is_admin).length,
    quiz: users.filter(u => u.quiz_completed).length,
  }), [users]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadUsers();
  }, [isAdmin, authLoading]);

  const loadUsers = async () => {
    setLoading(true);
    const sb = supabase();
    if (!sb) { setLoading(false); return; }

    const { data, error } = await sb.rpc('get_admin_users');
    if (error) {
      console.error('get_admin_users error:', error);
      toast.error('Kon gebruikers niet laden: ' + (error.message || 'onbekende fout'));
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let rows = users.filter(u => {
      const search = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        u.email.toLowerCase().includes(search) ||
        (u.full_name?.toLowerCase() || '').includes(search);
      const matchTier = filterTier === 'all' || u.tier === filterTier;
      const matchQuiz = filterQuiz === 'all' ||
        (filterQuiz === 'done' ? u.quiz_completed : !u.quiz_completed);
      return matchSearch && matchTier && matchQuiz;
    });

    rows = [...rows].sort((a, b) => {
      let av: string | number = '', bv: string | number = '';
      if (sortField === 'created_at') { av = a.created_at; bv = b.created_at; }
      if (sortField === 'last_sign_in') { av = a.last_sign_in || ''; bv = b.last_sign_in || ''; }
      if (sortField === 'email') { av = a.email; bv = b.email; }
      if (sortField === 'tier') {
        const order = { founder: 0, premium: 1, free: 2 };
        av = order[a.tier]; bv = order[b.tier];
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [users, searchTerm, filterTier, filterQuiz, sortField, sortDir]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleQuickTier = async (userId: string, tier: 'free' | 'premium' | 'founder') => {
    setOpenMenuId(null);
    const prevUsers = users;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier } : u));
    const ok = await setUserTier(userId, tier, 'Quick tier change via admin panel');
    if (ok) {
      toast.success(`Tier gewijzigd naar ${tier}`);
    } else {
      setUsers(prevUsers);
      toast.error('Tier wijziging mislukt');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const csv = await exportUsersCSV();
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitfi-users-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV gedownload');
    } else {
      toast.error('Export mislukt');
    }
    setExporting(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 72px)' }}>
        <div className="animate-spin w-10 h-10 border-4 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 72px)' }}>
        <div className="text-center">
          <XCircle className="w-16 h-16 text-[var(--color-muted)] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">Geen toegang</h1>
          <p className="text-[var(--color-muted)]">Je hebt geen admin rechten.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg)]" style={{ minHeight: 'calc(100vh - 72px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--ff-color-primary-50)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--color-muted)]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                <h1 className="text-2xl font-bold text-[var(--color-text)]">Gebruikersbeheer</h1>
              </div>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">
                {stats.total} gebruikers &middot; {stats.premium} premium &middot; {stats.founder} founder
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--ff-color-primary-50)] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-[var(--color-muted)] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] transition-colors"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporteren...' : 'CSV Export'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          <StatCard label="Totaal" value={stats.total} />
          <StatCard label="Free" value={stats.free} />
          <StatCard label="Premium" value={stats.premium} color="text-[var(--ff-color-nova)]" />
          <StatCard label="Founder" value={stats.founder} color="text-amber-600" />
          <StatCard label="Admins" value={stats.admins} color="text-red-600" />
          <StatCard label="Quiz" value={stats.quiz} color="text-green-600" />
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-4 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder="Zoek op naam of email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent bg-[var(--color-surface)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--color-muted)]" />
              <select
                value={filterTier}
                onChange={(e) => { setFilterTier(e.target.value); setPage(0); }}
                className="px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent bg-[var(--color-surface)]"
              >
                <option value="all">Alle tiers</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="founder">Founder</option>
              </select>
              <select
                value={filterQuiz}
                onChange={(e) => { setFilterQuiz(e.target.value); setPage(0); }}
                className="px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent bg-[var(--color-surface)]"
              >
                <option value="all">Quiz: alle</option>
                <option value="done">Quiz voltooid</option>
                <option value="not">Quiz niet voltooid</option>
              </select>
            </div>
          </div>
          {(searchTerm || filterTier !== 'all' || filterQuiz !== 'all') && (
            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <span>{filtered.length} resultaten</span>
              <button
                onClick={() => { setSearchTerm(''); setFilterTier('all'); setFilterQuiz('all'); setPage(0); }}
                className="text-[var(--ff-color-primary-700)] hover:underline"
              >
                Wis filters
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-[var(--shadow-soft)]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--ff-color-primary-50)] border-b border-[var(--color-border)]">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Gebruiker
                          <SortButton field="email" current={sortField} dir={sortDir} onClick={handleSort} />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Tier
                          <SortButton field="tier" current={sortField} dir={sortDir} onClick={handleSort} />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider hidden md:table-cell">
                        Abonnement
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider hidden lg:table-cell">
                        Quiz
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          Aangemeld
                          <SortButton field="created_at" current={sortField} dir={sortDir} onClick={handleSort} />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider hidden xl:table-cell">
                        <div className="flex items-center gap-1">
                          Laatste login
                          <SortButton field="last_sign_in" current={sortField} dir={sortDir} onClick={handleSort} />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {paginated.map((u) => {
                      const badge = TIER_BADGE[u.tier] || TIER_BADGE.free;
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-[var(--ff-color-primary-50)] transition-colors cursor-pointer group"
                          onClick={() => setSelectedUserId(u.id)}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[var(--ff-color-primary-700)]">
                                {(u.full_name || u.email)[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-[var(--color-text)] flex items-center gap-1.5 truncate">
                                  {u.full_name || u.email.split('@')[0]}
                                  {u.is_admin && <Shield className="w-3.5 h-3.5 text-red-500 flex-shrink-0" title="Admin" />}
                                </div>
                                <div className="text-xs text-[var(--color-muted)] truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                              {u.tier === 'founder' && <Crown className="w-3 h-3" />}
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <span className={`text-xs font-medium ${
                              u.subscription_status === 'active' ? 'text-green-600' :
                              u.subscription_status ? 'text-amber-600' :
                              'text-[var(--color-muted)]'
                            }`}>
                              {u.subscription_status === 'active' ? 'Actief' :
                               u.subscription_status === 'canceled' ? 'Geannuleerd' :
                               u.subscription_status || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 hidden lg:table-cell">
                            {u.quiz_completed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[var(--color-muted)]" />
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[var(--color-muted)] hidden lg:table-cell">
                            {new Date(u.created_at).toLocaleDateString('nl-NL')}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[var(--color-muted)] hidden xl:table-cell">
                            {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('nl-NL') : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                                className="p-1.5 rounded-lg hover:bg-[var(--ff-color-primary-100)] transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-[var(--color-muted)]" />
                              </button>
                              {openMenuId === u.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                  <div className="absolute right-0 top-8 z-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg py-1 w-48">
                                    <div className="px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Tier wijzigen</div>
                                    {(['free', 'premium', 'founder'] as const).map((t) => (
                                      <button
                                        key={t}
                                        onClick={() => handleQuickTier(u.id, t)}
                                        disabled={u.tier === t}
                                        className="w-full text-left px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                      >
                                        {t === 'founder' && <Crown className="w-3.5 h-3.5 text-amber-600" />}
                                        {QUICK_TIER_LABELS[t]}
                                        {u.tier === t && <span className="ml-auto text-xs text-[var(--color-muted)]">huidig</span>}
                                      </button>
                                    ))}
                                    <div className="border-t border-[var(--color-border)] my-1" />
                                    <button
                                      onClick={() => { setOpenMenuId(null); setSelectedUserId(u.id); }}
                                      className="w-full text-left px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)]"
                                    >
                                      Details bekijken
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {paginated.length === 0 && (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-3 opacity-40" />
                  <p className="text-[var(--color-muted)]">Geen gebruikers gevonden</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] bg-[var(--ff-color-primary-50)]">
                  <span className="text-xs text-[var(--color-muted)]">
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} van {filtered.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] disabled:opacity-40 hover:bg-[var(--color-surface)] transition-colors"
                    >
                      Vorige
                    </button>
                    <span className="text-xs text-[var(--color-muted)]">{page + 1} / {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] disabled:opacity-40 hover:bg-[var(--color-surface)] transition-colors"
                    >
                      Volgende
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      <UserDetailDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUserUpdated={loadUsers}
      />
    </div>
  );
}
