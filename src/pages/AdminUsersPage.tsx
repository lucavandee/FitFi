import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, ChevronDown, Shield, Mail,
  Calendar, Crown, XCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  tier: 'free' | 'premium' | 'founder';
  is_admin: boolean;
  created_at: string;
  last_sign_in: string | null;
  quiz_completed: boolean;
}

export default function AdminUsersPage() {
  const { isAdmin, user, isLoading: authLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    premium: 0,
    founder: 0,
    admins: 0,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      console.error('[AdminUsers] Access denied - user is not admin');
      return;
    }

    loadUsers();
  }, [isAdmin, authLoading]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const sb = supabase();

      if (!sb) {
        console.error('[AdminUsers] Supabase client not available - check environment variables');
        toast.error('Database niet beschikbaar. Controleer of VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY zijn ingesteld.');
        setLoading(false);
        return;
      }

      // Call admin function that returns merged user data
      const { data, error } = await sb.rpc('get_admin_users');

      if (error) {
        console.error('[AdminUsers] Error loading users:', error);
        toast.error('Kon gebruikers niet laden');
        return;
      }

      setUsers(data || []);

      // Calculate stats
      const userData = data || [];
      const total = userData.length;
      const free = userData.filter(u => u.tier === 'free').length;
      const premium = userData.filter(u => u.tier === 'premium').length;
      const founder = userData.filter(u => u.tier === 'founder').length;
      const admins = userData.filter(u => u.is_admin).length;

      setStats({ total, free, premium, founder, admins });
    } catch (error) {
      console.error('[AdminUsers] Exception:', error);
      toast.error('Fout bij laden gebruikers');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = filterTier === 'all' || u.tier === filterTier;

    return matchesSearch && matchesTier;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--color-text)]">Admin verificatie...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center">
            <XCircle className="w-10 h-10 text-[var(--ff-color-primary-600)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">
            Geen toegang
          </h1>
          <p className="text-[var(--color-muted)] mb-6">
            Je hebt geen admin rechten om deze pagina te bekijken.
          </p>
          <a href="/" className="ff-btn ff-btn-primary inline-flex items-center gap-2">
            Terug naar home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              Gebruikersbeheer
            </h1>
          </div>
          <p className="text-[var(--color-muted)]">
            Beheer alle gebruikers en hun toegang
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
          >
            <div className="text-sm text-[var(--color-muted)] mb-1">Totaal</div>
            <div className="text-2xl font-bold text-[var(--color-text)]">{stats.total}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
          >
            <div className="text-sm text-[var(--color-muted)] mb-1">Free</div>
            <div className="text-2xl font-bold text-[var(--color-text)]">{stats.free}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
          >
            <div className="text-sm text-[var(--color-muted)] mb-1">Premium</div>
            <div className="text-2xl font-bold text-blue-600">{stats.premium}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
          >
            <div className="text-sm text-[var(--color-muted)] mb-1">Founder</div>
            <div className="text-2xl font-bold text-purple-600">{stats.founder}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
          >
            <div className="text-sm text-[var(--color-muted)] mb-1">Admins</div>
            <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder="Zoek op email of naam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent"
              />
            </div>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent"
            >
              <option value="all">Alle tiers</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="founder">Founder</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--color-muted)]">Gebruikers laden...</p>
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--ff-color-primary-50)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                      Gebruiker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                      Aangemaakt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--ff-color-primary-50)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-[var(--color-text)]">
                                {user.full_name || user.email.split('@')[0]}
                              </div>
                              {user.is_admin && (
                                <Shield className="w-4 h-4 text-red-500" title="Admin" />
                              )}
                            </div>
                            <div className="text-sm text-[var(--color-muted)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.tier === 'founder' ? 'bg-purple-100 text-purple-800' :
                          user.tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.tier === 'founder' && <Crown className="w-3 h-3" />}
                          {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.quiz_completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm text-[var(--color-muted)]">
                            {user.quiz_completed ? 'Quiz voltooid' : 'Quiz niet voltooid'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-muted)]">
                        {new Date(user.created_at).toLocaleDateString('nl-NL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4" />
                <p className="text-[var(--color-muted)]">Geen gebruikers gevonden</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
