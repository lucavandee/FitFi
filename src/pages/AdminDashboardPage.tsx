import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import {
  getDashboardMetrics,
  logAdminAction,
  type DashboardMetrics,
} from '@/services/admin/adminService';
import {
  Users,
  Image,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  Database,
  FileText,
  ArrowRight,
  Activity,
  TrendingUp,
  Award,
  Smartphone
} from 'lucide-react';

interface AdminModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
  badge?: string;
  status?: 'active' | 'beta' | 'coming-soon';
}

const adminModules: AdminModule[] = [
  {
    id: 'mood-photos',
    title: 'Mood Photos',
    description: 'Beheer visual preference mood photos',
    icon: Image,
    route: '/admin/mood-photos',
    color: 'from-pink-500 to-rose-500',
    badge: 'Nieuw',
    status: 'active'
  },
  {
    id: 'products',
    title: 'Producten',
    description: 'Beheer product catalogi en imports',
    icon: Package,
    route: '/admin/products',
    color: 'from-blue-500 to-cyan-500',
    status: 'active'
  },
  {
    id: 'brams-fruit',
    title: "Bram's Fruit",
    description: 'Import en beheer Brams Fruit producten',
    icon: Package,
    route: '/admin/brams-fruit',
    color: 'from-green-500 to-emerald-500',
    status: 'active'
  },
  {
    id: 'users',
    title: 'Gebruikers',
    description: 'Beheer gebruikers, tiers en admin rechten',
    icon: Users,
    route: '/admin/users',
    color: 'from-purple-500 to-indigo-500',
    badge: 'Dashboard Tab',
    status: 'active'
  },
  {
    id: 'stripe',
    title: 'Stripe Setup',
    description: 'Configureer Stripe payment integration',
    icon: CreditCard,
    route: '/admin/stripe-setup',
    color: 'from-orange-500 to-red-500',
    status: 'active'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Bekijk metrics, conversie en user flows',
    icon: BarChart3,
    route: '/admin/analytics',
    color: 'from-teal-500 to-cyan-500',
    badge: 'Dashboard Tab',
    status: 'active'
  },
  {
    id: 'audit',
    title: 'Audit Log',
    description: 'Bekijk admin acties en systeem logs',
    icon: FileText,
    route: '/admin/audit',
    color: 'from-slate-500 to-zinc-500',
    badge: 'Dashboard Tab',
    status: 'active'
  },
  {
    id: 'pwa',
    title: 'PWA & Push Notificaties',
    description: 'Monitor installaties en verstuur push notificaties',
    icon: Smartphone,
    route: '/admin/pwa',
    color: 'from-indigo-500 to-purple-500',
    badge: 'Dashboard Tab',
    status: 'active'
  },
  {
    id: 'zalando',
    title: 'Zalando Import',
    description: 'Import producten van Zalando',
    icon: Database,
    route: '/admin/zalando-import',
    color: 'from-yellow-500 to-amber-500',
    status: 'beta'
  },
  {
    id: 'settings',
    title: 'Systeem Instellingen',
    description: 'Configureer app settings en features',
    icon: Settings,
    route: '/admin/settings',
    color: 'from-gray-500 to-slate-500',
    status: 'coming-soon'
  }
];

export default function AdminDashboardPage() {
  const { isAdmin, user, isLoading: authLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      console.log('❌ Not admin, redirecting to home');
      navigate('/');
      return;
    }

    console.log('✅ Admin verified, loading metrics');
    loadMetrics();
    logAdminAction('view_admin_dashboard');
  }, [isAdmin, authLoading, navigate]);

  const loadMetrics = async () => {
    setLoading(true);
    const data = await getDashboardMetrics();
    if (data) setMetrics(data);
    setLoading(false);
  };

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
    return null;
  }

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'active') return null;

    const badges = {
      beta: { text: 'Beta', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'coming-soon': { text: 'Binnenkort', class: 'bg-gray-100 text-gray-600 border-gray-200' }
    };

    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-[var(--color-muted)]">
            Welkom terug, {user?.name || 'Admin'} • Beheer alle FitFi systemen
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] animate-pulse"
              >
                <div className="h-12 w-12 bg-[var(--color-bg)] rounded-lg mb-4" />
                <div className="h-6 bg-[var(--color-bg)] rounded mb-2" />
                <div className="h-4 bg-[var(--color-bg)] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white"
              >
                <Users className="w-8 h-8 mb-2 opacity-80" />
                <div className="text-2xl font-bold mb-1">
                  {metrics?.total_users || 0}
                </div>
                <div className="text-sm opacity-90">Totaal Gebruikers</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white"
              >
                <Activity className="w-8 h-8 mb-2 opacity-80" />
                <div className="text-2xl font-bold mb-1">
                  {metrics?.active_users_last_7_days || 0}
                </div>
                <div className="text-sm opacity-90">Actief (7d)</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-6 text-white"
              >
                <Award className="w-8 h-8 mb-2 opacity-80" />
                <div className="text-2xl font-bold mb-1">
                  {metrics?.premium_users || 0}
                </div>
                <div className="text-sm opacity-90">Premium Users</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white"
              >
                <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                <div className="text-2xl font-bold mb-1">
                  {((metrics?.quiz_completion_rate || 0) * 100).toFixed(0)}%
                </div>
                <div className="text-sm opacity-90">Quiz Completion</div>
              </motion.div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Admin Modules
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminModules.map((module, index) => {
                const Icon = module.icon;
                const isDisabled = module.status === 'coming-soon';

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => !isDisabled && navigate(module.route)}
                      disabled={isDisabled}
                      className={`w-full bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] text-left transition-all ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:border-[var(--ff-color-primary-700)] hover:shadow-lg cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        {(module.badge || module.status) && (
                          <div className="flex gap-2">
                            {module.badge && (
                              <span className="px-2 py-1 bg-[var(--ff-color-primary-700)] text-white rounded text-xs font-medium">
                                {module.badge}
                              </span>
                            )}
                            {getStatusBadge(module.status)}
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                        {module.title}
                      </h3>
                      <p className="text-sm text-[var(--color-muted)] mb-4">
                        {module.description}
                      </p>

                      {!isDisabled && (
                        <div className="flex items-center text-[var(--ff-color-primary-700)] text-sm font-medium">
                          Open module
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                <li>• <strong>Mood Photos:</strong> Upload en beheer visual preference photos voor de quiz</li>
                <li>• <strong>PWA & Push:</strong> Monitor app installaties en verstuur push notificaties naar gebruikers</li>
                <li>• <strong>Gebruikers Tab:</strong> Sommige modules hebben tabs in dit dashboard (gebruik navbar om te wisselen)</li>
                <li>• <strong>Brams Fruit:</strong> Import producten via Excel upload</li>
                <li>• <strong>Coming Soon:</strong> Modules in ontwikkeling komen binnenkort beschikbaar</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
