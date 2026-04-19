import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Calendar, Crown, Shield, ShieldOff, CircleCheck as CheckCircle, Circle as XCircle, RefreshCw, Send, Shirt, Heart, ExternalLink, TriangleAlert as AlertTriangle, ChevronDown, Save, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { setUserTier, setUserAdmin, sendNotification } from '@/services/admin/adminService';
import toast from 'react-hot-toast';

interface UserDetail {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  tier: 'free' | 'premium' | 'founder';
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in: string | null;
  referral_code: string | null;
  referral_count: number;
  gender: string | null;
  quiz_completed: boolean;
  style_archetype: string | null;
  subscription_status: string | null;
  subscription_product: string | null;
  subscription_period_end: string | null;
  cancel_at_period_end: boolean | null;
  saved_outfits_count: number;
  swipe_count: number;
  email_confirmed: boolean;
}

interface UserDetailDrawerProps {
  userId: string | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

const TIER_CONFIG = {
  free: { label: 'Free', color: 'text-[#8A8A8A]', bg: 'bg-[#FAF5F2]', border: 'border-[#E5E5E5]' },
  premium: { label: 'Premium', color: 'text-[#6366F1]', bg: 'bg-blue-50', border: 'border-blue-200' },
  founder: { label: 'Founder', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#FAF5F2] rounded-xl p-3 text-center">
      <div className="text-xl font-bold text-[#1A1A1A]">{value}</div>
      <div className="text-xs text-[#8A8A8A] mt-0.5">{label}</div>
      {sub && <div className="text-xs text-[#8A8A8A] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function UserDetailDrawer({ userId, onClose, onUserUpdated }: UserDetailDrawerProps) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'free' | 'premium' | 'founder'>('free');
  const [reason, setReason] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [showTierChange, setShowTierChange] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const sb = supabase();
    if (!sb) { setLoading(false); return; }

    const { data, error } = await sb.rpc('get_user_detail', { p_user_id: userId });
    if (error) {
      toast.error('Kon gebruikersdetails niet laden');
    } else if (data) {
      setDetail(data as UserDetail);
      setSelectedTier((data as UserDetail).tier || 'free');
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleTierChange = async () => {
    if (!detail || saving) return;
    setSaving(true);
    const ok = await setUserTier(detail.id, selectedTier, reason || 'Admin manual change');
    if (ok) {
      toast.success(`Tier gewijzigd naar ${selectedTier}`);
      setShowTierChange(false);
      setReason('');
      await loadDetail();
      onUserUpdated();
    } else {
      toast.error('Tier wijziging mislukt');
    }
    setSaving(false);
  };

  const handleAdminToggle = async () => {
    if (!detail || saving) return;
    setSaving(true);
    const newStatus = !detail.is_admin;
    const ok = await setUserAdmin(detail.id, newStatus, 'Admin manual toggle');
    if (ok) {
      toast.success(newStatus ? 'Admin rechten verleend' : 'Admin rechten ingetrokken');
      setShowAdminConfirm(false);
      await loadDetail();
      onUserUpdated();
    } else {
      toast.error('Admin wijziging mislukt');
    }
    setSaving(false);
  };

  const handleSendNotification = async () => {
    if (!detail || !notifTitle || !notifMessage) return;
    setSaving(true);
    const ok = await sendNotification({
      targetUserId: detail.id,
      title: notifTitle,
      message: notifMessage,
      type: 'info',
    });
    if (ok) {
      toast.success('Notificatie verzonden');
      setShowNotifForm(false);
      setNotifTitle('');
      setNotifMessage('');
    } else {
      toast.error('Verzenden mislukt');
    }
    setSaving(false);
  };

  const tierCfg = detail ? TIER_CONFIG[detail.tier] : TIER_CONFIG.free;

  return (
    <AnimatePresence>
      {userId && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#FFFFFF] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-[#FAF5F2]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4E8E3] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#A8513A]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1A1A1A]">Gebruikersdetails</div>
                  {detail && <div className="text-xs text-[#8A8A8A]">{detail.email}</div>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#FAF5F2] transition-colors"
              >
                <X className="w-5 h-5 text-[#8A8A8A]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-[#A8513A] border-t-transparent rounded-full" />
                </div>
              ) : detail ? (
                <div className="p-6 space-y-6">

                  {/* Identity */}
                  <section>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-lg font-bold text-[#1A1A1A]">
                          {detail.full_name || '—'}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Mail className="w-3.5 h-3.5 text-[#8A8A8A]" />
                          <span className="text-sm text-[#8A8A8A]">{detail.email}</span>
                          {detail.email_confirmed && (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {detail.is_admin && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${tierCfg.bg} ${tierCfg.color} ${tierCfg.border}`}>
                          {detail.tier === 'founder' && <Crown className="w-3 h-3" />}
                          {detail.tier.charAt(0).toUpperCase() + detail.tier.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-[#8A8A8A]">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Lid sinds {new Date(detail.created_at).toLocaleDateString('nl-NL')}</span>
                      </div>
                      {detail.last_sign_in && (
                        <div className="flex items-center gap-2 text-[#8A8A8A]">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Laatst actief {new Date(detail.last_sign_in).toLocaleDateString('nl-NL')}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Stats */}
                  <section>
                    <h3 className="text-sm font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">Activiteit</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <StatBox label="Outfits opgeslagen" value={detail.saved_outfits_count} />
                      <StatBox label="Style swipes" value={detail.swipe_count} />
                      <StatBox label="Referrals" value={detail.referral_count} />
                    </div>
                  </section>

                  {/* Style profile */}
                  <section>
                    <h3 className="text-sm font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">Stijlprofiel</h3>
                    <div className="bg-[#FAF5F2] rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#8A8A8A]">Quiz voltooid</span>
                        {detail.quiz_completed ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Ja</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#8A8A8A] text-sm"><XCircle className="w-4 h-4" /> Nee</span>
                        )}
                      </div>
                      {detail.style_archetype && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#8A8A8A]">Archetype</span>
                          <span className="flex items-center gap-1 text-sm font-medium text-[#1A1A1A]">
                            <Shirt className="w-4 h-4 text-[#C2654A]" />
                            {detail.style_archetype}
                          </span>
                        </div>
                      )}
                      {detail.gender && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#8A8A8A]">Geslacht</span>
                          <span className="text-sm font-medium text-[#1A1A1A] capitalize">{detail.gender}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Subscription */}
                  <section>
                    <h3 className="text-sm font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">Lidmaatschap</h3>
                    <div className="bg-[#FAF5F2] rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#8A8A8A]">Status</span>
                        <span className={`text-sm font-semibold ${
                          detail.subscription_status === 'active' ? 'text-green-600' :
                          detail.subscription_status ? 'text-amber-600' : 'text-[#8A8A8A]'
                        }`}>
                          {detail.subscription_status === 'active' ? 'Actief' :
                           detail.subscription_status === 'canceled' ? 'Geannuleerd' :
                           detail.subscription_status || 'Geen abonnement'}
                        </span>
                      </div>
                      {detail.subscription_period_end && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#8A8A8A]">
                            {detail.cancel_at_period_end ? 'Eindigt op' : 'Verlengt op'}
                          </span>
                          <span className="text-sm text-[#1A1A1A]">
                            {new Date(detail.subscription_period_end).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                      )}
                      {detail.referral_code && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#8A8A8A]">Referral code</span>
                          <span className="text-sm font-mono font-medium text-[#1A1A1A]">{detail.referral_code}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Tier management */}
                  <section>
                    <h3 className="text-sm font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">Tier beheer</h3>
                    <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowTierChange(!showTierChange)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FAF5F2] transition-colors"
                      >
                        <span className="text-sm font-medium text-[#1A1A1A]">Tier wijzigen</span>
                        <ChevronDown className={`w-4 h-4 text-[#8A8A8A] transition-transform ${showTierChange ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showTierChange && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-[#E5E5E5] pt-3 space-y-3">
                              <div className="grid grid-cols-3 gap-2">
                                {(['free', 'premium', 'founder'] as const).map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => setSelectedTier(t)}
                                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                                      selectedTier === t
                                        ? 'border-[#A8513A] bg-[#FAF5F2] text-[#A8513A]'
                                        : 'border-[#E5E5E5] text-[#8A8A8A] hover:border-[#D4856E]'
                                    }`}
                                  >
                                    {t === 'founder' && <Crown className="w-3 h-3 inline mr-1" />}
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                  </button>
                                ))}
                              </div>
                              <input
                                type="text"
                                placeholder="Reden (optioneel)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#C2654A] focus:border-transparent bg-[#FFFFFF]"
                              />
                              <button
                                onClick={handleTierChange}
                                disabled={saving || selectedTier === detail.tier}
                                className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
                                style={{ background: '#A8513A' }}
                              >
                                {saving ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Opslaan...
                                  </span>
                                ) : (
                                  <span className="flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" /> Opslaan
                                  </span>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>

                  {/* Admin toggle */}
                  <section>
                    <h3 className="text-sm font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">Admin rechten</h3>
                    <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowAdminConfirm(!showAdminConfirm)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FAF5F2] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {detail.is_admin ? (
                            <><ShieldOff className="w-4 h-4 text-red-500" /><span className="text-sm font-medium text-red-600">Admin rechten intrekken</span></>
                          ) : (
                            <><Shield className="w-4 h-4 text-[#C2654A]" /><span className="text-sm font-medium text-[#1A1A1A]">Admin rechten verlenen</span></>
                          )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#8A8A8A] transition-transform ${showAdminConfirm ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showAdminConfirm && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-[#E5E5E5] pt-3">
                              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                  {detail.is_admin
                                    ? 'Deze gebruiker verliest toegang tot het admin panel.'
                                    : 'Deze gebruiker krijgt volledige admin toegang tot het systeem.'}
                                </p>
                              </div>
                              <button
                                onClick={handleAdminToggle}
                                disabled={saving}
                                className={`w-full py-2 px-4 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all ${
                                  detail.is_admin ? 'bg-red-600 hover:bg-red-700' : ''
                                }`}
                                style={!detail.is_admin ? { background: '#A8513A' } : {}}
                              >
                                {saving ? 'Bezig...' : detail.is_admin ? 'Intrekken bevestigen' : 'Verlenen bevestigen'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>

                  {/* Send notification */}
                  <section>
                    <h3 className="text-sm font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">Bericht sturen</h3>
                    <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowNotifForm(!showNotifForm)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FAF5F2] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-[#C2654A]" />
                          <span className="text-sm font-medium text-[#1A1A1A]">Notificatie versturen</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#8A8A8A] transition-transform ${showNotifForm ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showNotifForm && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-[#E5E5E5] pt-3 space-y-3">
                              <input
                                type="text"
                                placeholder="Titel"
                                value={notifTitle}
                                onChange={(e) => setNotifTitle(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#C2654A] focus:border-transparent bg-[#FFFFFF]"
                              />
                              <textarea
                                placeholder="Bericht..."
                                value={notifMessage}
                                onChange={(e) => setNotifMessage(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#C2654A] focus:border-transparent bg-[#FFFFFF] resize-none"
                              />
                              <button
                                onClick={handleSendNotification}
                                disabled={saving || !notifTitle || !notifMessage}
                                className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
                                style={{ background: '#A8513A' }}
                              >
                                {saving ? 'Verzenden...' : 'Verzenden'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>

                  {/* User ID (for debugging) */}
                  <section className="pt-2 border-t border-[#E5E5E5]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8A8A8A]">User ID</span>
                      <span className="text-xs font-mono text-[#8A8A8A] truncate max-w-[200px]">{detail.id}</span>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-[#8A8A8A]">
                  Geen gegevens beschikbaar
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
