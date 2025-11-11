import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Search, Filter, Calendar, User, Activity,
  XCircle, ChevronDown, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  created_at: string;
}

export default function AdminAuditPage() {
  const { isAdmin, user, isLoading: authLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      console.error('[AdminAudit] Access denied - user is not admin');
      return;
    }

    loadAuditLogs();
  }, [isAdmin, authLoading]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const sb = supabase();

      // Check if user_activity_log table exists
      const { data, error } = await sb
        .from('user_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          console.warn('[AdminAudit] user_activity_log table does not exist yet');
          setLogs([]);
          return;
        }
        console.error('[AdminAudit] Error loading audit logs:', error);
        toast.error('Kon audit logs niet laden');
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('[AdminAudit] Exception:', error);
      toast.error('Fout bij laden audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

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
            <FileText className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              Audit Log
            </h1>
          </div>
          <p className="text-[var(--color-muted)]">
            Bekijk alle gebruikersactiviteit en systeemgebeurtenissen
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder="Zoek op email, actie of resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent"
            >
              <option value="all">Alle acties</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--color-muted)]">Audit logs laden...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-12 text-center">
            <AlertCircle className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
              Nog geen audit logs
            </h3>
            <p className="text-[var(--color-muted)]">
              De user_activity_log tabel is nog leeg of bestaat niet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                      <span className="font-medium text-[var(--color-text)]">
                        {log.action}
                      </span>
                      {log.resource_type && (
                        <span className="px-2 py-0.5 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] text-xs rounded-full">
                          {log.resource_type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{log.user_email || log.user_id.substring(0, 8) + '...'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(log.created_at).toLocaleString('nl-NL')}</span>
                      </div>
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)]">
                          Details tonen
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4" />
                <p className="text-[var(--color-muted)]">Geen logs gevonden voor deze filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
