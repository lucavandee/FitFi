import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, X, Sparkles, Shirt, User, ShoppingBag, Zap } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { streamChat, type NovaMode, type NovaStreamEvent } from '@/services/ai/novaService';
import { useNovaConn, NovaConnectionProvider } from '@/components/ai/NovaConnection';
import TypingSkeleton from '@/components/ai/TypingSkeleton';
import OutfitCards from '@/components/ai/OutfitCards';
import type { NovaOutfitsPayload } from '@/lib/outfitSchema';
import QuotaModal from '@/components/ai/QuotaModal';
import NovaLoginPrompt from '@/components/auth/NovaLoginPrompt';
import { getUserTier, checkQuotaLimit, incrementUsage } from '@/utils/session';
import track from '@/utils/telemetry';
import toast from 'react-hot-toast';

function stripJSONMarkers(text: string): string {
  const START = '<<<FITFI_JSON>>>';
  const END = '<<<END_FITFI_JSON>>>';
  let result = text;

  const si = result.indexOf(START);
  if (si >= 0) {
    const ei = result.indexOf(END, si + START.length);
    if (ei > si) {
      result = result.slice(0, si) + result.slice(ei + END.length);
    } else {
      result = result.slice(0, si);
    }
  }

  return result.trim();
}

function mdLite(s: string) {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const strong = esc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const em = strong.replace(/\*(.+?)\*/g, '<em>$1</em>');
  const lists = em.replace(/(?:^|\n)- (.+)/g, '\n• $1');
  return lists.replace(/\n/g, '<br/>');
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const contextModes = [
  { id: 'outfits' as NovaMode, label: 'Outfits', icon: Shirt, color: 'from-blue-500 to-blue-600' },
  { id: 'archetype' as NovaMode, label: 'Stijl', icon: User, color: 'from-purple-500 to-purple-600' },
  { id: 'shop' as NovaMode, label: 'Shop', icon: ShoppingBag, color: 'from-pink-500 to-pink-600' }
];

const suggestionChips = [
  { icon: Sparkles, text: 'Geef me een outfit voor een date night', mode: 'outfits' as NovaMode },
  { icon: User, text: 'Wat is mijn stijlarchetype?', mode: 'archetype' as NovaMode },
  { icon: ShoppingBag, text: 'Toon me trending items', mode: 'shop' as NovaMode },
  { icon: Zap, text: 'Wat zijn mijn beste kleuren?', mode: 'archetype' as NovaMode }
];

function DashboardNovaSectionInner() {
  const { user } = useUser();
  const conn = useNovaConn();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [cards, setCards] = useState<NovaOutfitsPayload | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptReason, setLoginPromptReason] = useState<'auth' | 'quiz' | 'rate_limit'>('auth');
  const [usageInfo, setUsageInfo] = useState<{ current: number; limit: number; remaining: number } | undefined>();
  const [contextMode, setContextMode] = useState<NovaMode>('outfits');
  const userTier = getUserTier();

  // Load conversation history from Supabase
  useEffect(() => {
    const loadConversation = async () => {
      if (!user?.id || user.id === 'anon') return;

      try {
        const { supabase } = await import('@/lib/supabaseClient');
        const sb = supabase();

        const { data, error } = await sb
          .from('nova_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn('[Nova] Failed to load conversation:', error);
          return;
        }

        if (data?.messages && Array.isArray(data.messages)) {
          const historyMessages = data.messages.slice(-10).map((msg: any, idx: number) => ({
            id: msg.id || `history-${idx}`,
            role: msg.role || 'assistant',
            content: msg.content || '',
            timestamp: msg.timestamp || Date.now()
          }));
          setMessages(historyMessages);
          return;
        }
      } catch (err) {
        console.warn('[Nova] Error loading conversation:', err);
      }

      // Default greeting
      if (user?.name && messages.length === 0) {
        setMessages([{
          id: 'greeting',
          role: 'assistant',
          content: `Hoi ${user.name}! 👋 Ik ben Nova, je AI-stylist. Ik kan je helpen met outfit-advies, kleurencombinaties, en stijltips. Wat wil je vandaag weten?`,
          timestamp: Date.now()
        }]);
      }
    };

    loadConversation();
  }, [user?.id, user?.name]);

  // Save conversation to Supabase
  useEffect(() => {
    const saveConversation = async () => {
      if (!user?.id || user.id === 'anon' || messages.length === 0) return;

      try {
        const { supabase } = await import('@/lib/supabaseClient');
        const sb = supabase();

        await sb.from('nova_conversations').upsert({
          user_id: user.id,
          messages: messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          })),
          context_mode: contextMode,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      } catch (err) {
        console.warn('[Nova] Failed to save conversation:', err);
      }
    };

    const timeoutId = setTimeout(saveConversation, 2000);
    return () => clearTimeout(timeoutId);
  }, [messages, user?.id, contextMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSuggestionClick = (suggestion: typeof suggestionChips[0]) => {
    setContextMode(suggestion.mode);
    setInput(suggestion.text);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const sb = supabase();
      const { data: { session } } = await sb.auth.getSession();

      if (!session?.user) {
        setLoginPromptReason('auth');
        setLoginPromptOpen(true);
        return;
      }
    } catch {
      setLoginPromptReason('auth');
      setLoginPromptOpen(true);
      return;
    }

    if (!user || !user.id || user.id === 'anon') {
      setLoginPromptReason('auth');
      setLoginPromptOpen(true);
      return;
    }

    const quizAnswersStr = localStorage.getItem('ff_quiz_answers');
    if (!quizAnswersStr) {
      setLoginPromptReason('quiz');
      setLoginPromptOpen(true);
      return;
    }

    const tier = getUserTier();
    const userId = user?.id || 'anon';

    if (!checkQuotaLimit(tier, userId)) {
      setQuotaOpen(true);
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCards(null);
    setIsTyping(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    conn.setStatus('connecting');
    const tStart = performance.now();
    let firstChunkAt: number | null = null;

    if (typeof track === 'function') {
      track('nova_message_send', { context: contextMode, location: 'dashboard' });
    }

    try {
      const assistantId = `assistant-${Date.now()}`;
      let acc = '';
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() }]);

      try {
        const history = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
        for await (const delta of streamChat({
          mode: contextMode,
          messages: history,
          signal: abortRef.current.signal,
          onEvent: (evt) => {
            if (evt.type === 'json' && evt.data?.type === 'outfits') {
              setCards(evt.data);
            }
            if (evt.type === 'meta') {
              if (evt.model) conn.setMeta({ model: evt.model });
              if (evt.traceId) conn.setMeta({ traceId: evt.traceId });
            } else if (evt.type === 'error') {
              if ((evt as any).code === 'quota_exceeded') {
                setQuotaOpen(true);
              }
            } else if (evt.type === 'chunk') {
              if (!firstChunkAt) {
                firstChunkAt = performance.now();
                conn.setMeta({ ttfbMs: Math.max(0, Math.round(firstChunkAt - tStart)) });
                conn.setStatus('streaming');
              }
            } else if (evt.type === 'done') {
              setMessages(prev => prev.map(m => {
                if (m.id !== assistantId) return m;
                const START = '<<<FITFI_JSON>>>';
                const END = '<<<END_FITFI_JSON>>>';
                let c = m.content || '';
                const si = c.indexOf(START);
                const ei = c.indexOf(END, si + START.length);
                if (si >= 0 && ei > si) {
                  c = c.slice(0, si) + c.slice(ei + END.length);
                }
                return { ...m, content: c };
              }));
              conn.setStatus('done');
            } else if (evt.type === 'error') {
              conn.setStatus('error');
            }
          }
        })) {
          acc += delta;
          const displayContent = stripJSONMarkers(acc);
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: displayContent } : m));
          scrollToBottom();
        }

        incrementUsage(getUserTier(), user?.id || 'anon');
      } catch (e: any) {
        conn.setStatus('error');
        let content = 'Sorry, er ging iets mis. Probeer het opnieuw.';

        const errorData = e?.response?.data || e?.data || {};
        const errorCode = errorData.code || errorData.error;

        if (errorCode === 'AUTH_REQUIRED' || errorCode === 'authentication_required') {
          setLoginPromptReason('auth');
          setLoginPromptOpen(true);
          content = 'Log in om Nova te gebruiken.';
        } else if (errorCode === 'QUIZ_REQUIRED') {
          setLoginPromptReason('quiz');
          setLoginPromptOpen(true);
          content = 'Voltooi eerst je stijlquiz.';
        } else if (errorCode === 'RATE_LIMIT_REACHED') {
          setLoginPromptReason('rate_limit');
          if (errorData.usage) {
            setUsageInfo(errorData.usage);
          }
          setLoginPromptOpen(true);
          content = errorData.message || 'Dagelijkse limiet bereikt.';
        }

        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content } : m));
      } finally {
        setIsTyping(false);
        abortRef.current = null;

        if (conn.status !== 'error') {
          conn.setStatus('done');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbort = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      toast.success('Nova gestopt');
    }
  };

  return (
    <section className="py-12">
      <div className="ff-container max-w-5xl">
        <motion.div
          className="bg-[var(--color-surface)] rounded-3xl shadow-[var(--shadow-soft)] border border-[var(--color-border)] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with Context Switcher */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-[var(--color-border)] px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">Chat met Nova</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Je persoonlijke AI-stylist</p>
                </div>
              </div>

              {/* Context Switcher */}
              <div className="flex gap-2">
                {contextModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = contextMode === mode.id;
                  return (
                    <motion.button
                      key={mode.id}
                      onClick={() => setContextMode(mode.id)}
                      className={[
                        'px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all',
                        isActive
                          ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                          : 'bg-white dark:bg-gray-800 text-[var(--color-text)] border border-[var(--color-border)] hover:border-blue-300'
                      ].join(' ')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{mode.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Suggestion Chips */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((chip, idx) => {
                  const ChipIcon = chip.icon;
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleSuggestionClick(chip)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-[var(--color-border)] rounded-full text-xs font-medium text-[var(--color-text)] hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-1.5"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ChipIcon className="w-3 h-3" />
                      {chip.text}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="h-[500px] overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-white/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/10"
            style={{ scrollbarWidth: 'thin' }}
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={[
                    'max-w-[85%] rounded-2xl px-4 py-3 shadow-md',
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-[var(--color-text)] border border-[var(--color-border)]'
                  ].join(' ')}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                      <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nova</span>
                    </div>
                  )}
                  {message.role === 'user' ? (
                    <p className="text-sm font-medium">{message.content}</p>
                  ) : (
                    <div
                      className="text-sm prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: mdLite(message.content) }}
                    />
                  )}
                </div>
              </motion.div>
            ))}

            {/* Enhanced Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 border border-[var(--color-border)] shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
                      >
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                      <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nova</span>
                      <motion.span
                        className="text-xs text-[var(--color-text-muted)]"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        aan het typen...
                      </motion.span>
                    </div>
                    <TypingSkeleton />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Outfit cards */}
            {cards && (
              <div className="mb-4">
                <OutfitCards data={cards} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[var(--color-border)] bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Vraag Nova om styling advies..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-border)] bg-white dark:bg-gray-800 text-[var(--color-text)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                  disabled={isLoading}
                />
                {input && (
                  <motion.button
                    type="button"
                    onClick={() => setInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                  </motion.button>
                )}
              </div>

              {isLoading ? (
                <motion.button
                  type="button"
                  onClick={handleAbort}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                  <span>Stop</span>
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center gap-2 shadow-lg"
                  whileHover={input.trim() ? { scale: 1.05 } : {}}
                  whileTap={input.trim() ? { scale: 0.95 } : {}}
                >
                  <Send className="w-4 h-4" />
                  <span>Verstuur</span>
                </motion.button>
              )}
            </form>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <QuotaModal
        isOpen={quotaOpen}
        onClose={() => setQuotaOpen(false)}
        tier={userTier}
      />

      <NovaLoginPrompt
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        reason={loginPromptReason}
        usage={usageInfo}
        tier={userTier}
      />
    </section>
  );
}

export function DashboardNovaSection() {
  return (
    <NovaConnectionProvider>
      <DashboardNovaSectionInner />
    </NovaConnectionProvider>
  );
}
