import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone, Bell, BellOff, TrendingUp, Users,
  Activity, CheckCircle, XCircle, Send, BarChart3
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface PWAStats {
  total_subscriptions: number;
  active_subscriptions: number;
  notifications_sent_today: number;
  notifications_sent_week: number;
  avg_click_rate: number;
  category_stats: Record<string, { sent: number; clicked: number }>;
}

interface NotificationLog {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  sent_at: string;
  clicked: boolean;
  clicked_at: string | null;
}

export default function AdminPWADashboard() {
  const [stats, setStats] = useState<PWAStats | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);

  const [notification, setNotification] = useState({
    title: '',
    body: '',
    type: 'outfit_suggestions',
    url: '/dashboard',
  });

  useEffect(() => {
    loadStats();
    loadRecentNotifications();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [subscriptionsResult, notificationsResult, logsResult] = await Promise.all([
        supabase.from('push_subscriptions').select('id, created_at'),
        supabase
          .from('notification_log')
          .select('*')
          .gte('sent_at', weekAgo.toISOString()),
        supabase
          .from('notification_log')
          .select('notification_type, clicked')
          .gte('sent_at', weekAgo.toISOString()),
      ]);

      const totalSubscriptions = subscriptionsResult.data?.length || 0;

      const activeSubscriptions = subscriptionsResult.data?.filter((sub) => {
        const createdDate = new Date(sub.created_at);
        const daysSince = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      }).length || 0;

      const notificationsToday = notificationsResult.data?.filter((log) => {
        const sentDate = new Date(log.sent_at);
        return sentDate >= today;
      }).length || 0;

      const notificationsWeek = notificationsResult.data?.length || 0;

      const clicked = logsResult.data?.filter((log) => log.clicked).length || 0;
      const total = logsResult.data?.length || 0;
      const avgClickRate = total > 0 ? (clicked / total) * 100 : 0;

      const categoryStats: Record<string, { sent: number; clicked: number }> = {};
      logsResult.data?.forEach((log) => {
        if (!categoryStats[log.notification_type]) {
          categoryStats[log.notification_type] = { sent: 0, clicked: 0 };
        }
        categoryStats[log.notification_type].sent++;
        if (log.clicked) {
          categoryStats[log.notification_type].clicked++;
        }
      });

      setStats({
        total_subscriptions: totalSubscriptions,
        active_subscriptions: activeSubscriptions,
        notifications_sent_today: notificationsToday,
        notifications_sent_week: notificationsWeek,
        avg_click_rate: avgClickRate,
        category_stats: categoryStats,
      });
    } catch (error) {
      console.error('Failed to load PWA stats:', error);
      toast.error('Kon PWA statistieken niet laden');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_log')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentNotifications(data || []);
    } catch (error) {
      console.error('Failed to load recent notifications:', error);
    }
  };

  const handleSendTestNotification = async () => {
    if (!notification.title || !notification.body) {
      toast.error('Vul titel en bericht in');
      return;
    }

    setSendLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      await supabase.from('notification_log').insert({
        user_id: userData.user.id,
        notification_type: notification.type,
        title: notification.title,
        body: notification.body,
      });

      if ('Notification' in window && Notification.permission === 'granted') {
        await navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(notification.title, {
            body: notification.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            data: { url: notification.url },
          });
        });
      }

      toast.success('Test notificatie verzonden!');
      setNotification({ title: '', body: '', type: 'outfit_suggestions', url: '/dashboard' });
      loadStats();
      loadRecentNotifications();
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Kon notificatie niet verzenden');
    } finally {
      setSendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-[var(--ff-color-primary-100)] rounded w-1/3" />
            <div className="grid gap-6 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-[var(--ff-color-primary-100)] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">PWA Dashboard</h1>
            <p className="text-[var(--color-muted)] mt-1">
              Monitor push notifications en app installaties
            </p>
          </div>
          <button
            onClick={loadStats}
            className="ff-btn ff-btn-secondary flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Ververs
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Smartphone}
            label="Totaal Subscriptions"
            value={stats?.total_subscriptions || 0}
            color="primary"
          />
          <StatCard
            icon={Bell}
            label="Actief (30d)"
            value={stats?.active_subscriptions || 0}
            color="accent"
          />
          <StatCard
            icon={Send}
            label="Verzonden (Vandaag)"
            value={stats?.notifications_sent_today || 0}
            color="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Gem. Click Rate"
            value={`${stats?.avg_click_rate.toFixed(1)}%`}
            color="accent"
          />
        </div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[var(--radius-2xl)] bg-white/80 backdrop-blur-sm shadow-[var(--shadow-lifted)] border border-[var(--color-border)] p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
            <h2 className="text-xl font-heading text-[var(--color-text)]">
              Performance per Categorie
            </h2>
          </div>

          <div className="space-y-4">
            {Object.entries(stats?.category_stats || {}).map(([type, data]) => {
              const clickRate = data.sent > 0 ? (data.clicked / data.sent) * 100 : 0;
              return (
                <div
                  key={type}
                  className="p-4 rounded-lg bg-[var(--ff-color-primary-50)] border border-[var(--color-border)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[var(--color-text)] capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-[var(--color-muted)]">
                      {data.sent} verzonden
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]"
                          style={{ width: `${clickRate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[var(--ff-color-primary-700)]">
                      {clickRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Send Test Notification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[var(--radius-2xl)] bg-white/80 backdrop-blur-sm shadow-[var(--shadow-lifted)] border border-[var(--color-border)] p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Send className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
            <h2 className="text-xl font-heading text-[var(--color-text)]">
              Test Notificatie Versturen
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Titel
              </label>
              <input
                type="text"
                value={notification.title}
                onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]"
                placeholder="Nieuwe outfit suggestie!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Bericht
              </label>
              <textarea
                value={notification.body}
                onChange={(e) => setNotification({ ...notification, body: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]"
                rows={3}
                placeholder="We hebben 3 nieuwe outfits gevonden die perfect bij je stijl passen."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Type
                </label>
                <select
                  value={notification.type}
                  onChange={(e) => setNotification({ ...notification, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]"
                >
                  <option value="outfit_suggestions">Outfit Suggestions</option>
                  <option value="style_tips">Style Tips</option>
                  <option value="price_drops">Price Drops</option>
                  <option value="achievements">Achievements</option>
                  <option value="challenges">Challenges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={notification.url}
                  onChange={(e) => setNotification({ ...notification, url: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]"
                  placeholder="/dashboard"
                />
              </div>
            </div>

            <button
              onClick={handleSendTestNotification}
              disabled={sendLoading}
              className="ff-btn ff-btn-primary w-full flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sendLoading ? 'Bezig...' : 'Verstuur Test Notificatie'}
            </button>
          </div>
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[var(--radius-2xl)] bg-white/80 backdrop-blur-sm shadow-[var(--shadow-lifted)] border border-[var(--color-border)] overflow-hidden"
        >
          <div className="p-6 border-b border-[var(--color-border)]">
            <h2 className="text-xl font-heading text-[var(--color-text)]">
              Recente Notificaties
            </h2>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {recentNotifications.map((log) => (
              <div key={log.id} className="p-4 hover:bg-[var(--ff-color-primary-50)] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[var(--color-text)]">{log.title}</h3>
                      {log.clicked ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[var(--color-muted)]" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-muted)] mb-2">{log.body}</p>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
                      <span className="capitalize">{log.notification_type.replace(/_/g, ' ')}</span>
                      <span>{new Date(log.sent_at).toLocaleString('nl-NL')}</span>
                      {log.clicked && log.clicked_at && (
                        <span className="text-green-600">
                          Geklikt: {new Date(log.clicked_at).toLocaleString('nl-NL')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {recentNotifications.length === 0 && (
              <div className="p-8 text-center text-[var(--color-muted)]">
                Nog geen notificaties verzonden
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'primary' | 'accent';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    primary: 'from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)]',
    accent: 'from-[var(--ff-color-accent-600)] to-[var(--ff-color-accent-700)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="rounded-[var(--radius-2xl)] bg-white/80 backdrop-blur-sm shadow-[var(--shadow-lifted)] border border-[var(--color-border)] p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-[var(--color-text)] mb-1">{value}</div>
      <div className="text-sm text-[var(--color-muted)]">{label}</div>
    </motion.div>
  );
}
