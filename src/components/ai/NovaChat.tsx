import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, Sparkles, Copy, X, Bot } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { streamChat, type NovaMode, type NovaStreamEvent } from '@/services/ai/novaService';
import { mdNova } from '@/components/ai/markdown';
import { useNovaConn } from '@/components/ai/NovaConnection';
import TypingSkeleton from '@/components/ai/TypingSkeleton';
import track from '@/utils/telemetry';
import toast from 'react-hot-toast';
import OutfitCards from '@/components/ai/OutfitCards';
import type { NovaOutfitsPayload } from '@/lib/outfitSchema';
import QuotaModal from './QuotaModal';
import NovaLoginPrompt from '@/components/auth/NovaLoginPrompt';
import { getUserTier, checkQuotaLimit, incrementUsage } from '@/utils/session';
import { generateNovaExplanation } from '@/engine/explainOutfit';
import { RateLimitIndicator } from './RateLimitIndicator';

// Helper: verwijder JSON markers tijdens streaming
function stripJSONMarkers(text: string): string {
  const START = '<<<FITFI_JSON>>>';
  const END = '<<<END_FITFI_JSON>>>';
  let result = text;

  const si = result.indexOf(START);
  if (si >= 0) {
    const ei = result.indexOf(END, si + START.length);
    if (ei > si) {
      // Volledige JSON block aanwezig - verwijder het hele block inclusief markers
      result = result.slice(0, si) + result.slice(ei + END.length);
    } else {
      // END marker nog niet ontvangen - verwijder alles vanaf START
      // Dit voorkomt dat incomplete JSON zichtbaar is tijdens streaming
      result = result.slice(0, si);
    }
  }

  return result.trim();
}

// ADD bovenaan
function mdLite(s:string){
  // \n\n -> paragrafen, *...* -> em, **...** -> strong, - lijstjes
  const esc = s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const strong = esc.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  const em = strong.replace(/\*(.+?)\*/g,'<em>$1</em>');
  const lists = em.replace(/(?:^|\n)- (.+)/g, '\n• $1');
  return lists.replace(/\n/g,'<br/>');
}

const URL_RE = /(https?:\/\/[^\s)]+)(?=\)|\s|$)/g;

function renderContentWithLinks(content:string){
  const parts = content.split(URL_RE);
  return parts.map((part,i)=>{
    if(URL_RE.test(part)){
      return <a key={`url-${i}`} href={part} target="_blank" rel="nofollow noopener noreferrer"
        className="underline decoration-[var(--ff-color-primary-500)] underline-offset-2 hover:opacity-80">{part}</a>;
    }
    return <span key={`t-${i}`}>{part}</span>;
  });
}

const URL_RE2 = /(https?:\/\/[^\s)]+)(?=\)|\s|$)/g;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'tips' | 'outfits';
  data?: any;
}

const NovaChat: React.FC = () => {
  const { user } = useUser();
  const conn = useNovaConn();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contextMode, setContextMode] = useState<'outfits'|'archetype'|'shop'>('outfits');
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingDelay, setShowTypingDelay] = useState(false);
  const [cards, setCards] = useState<NovaOutfitsPayload | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptReason, setLoginPromptReason] = useState<'auth' | 'quiz' | 'rate_limit'>('auth');
  const [usageInfo, setUsageInfo] = useState<{ current: number; limit: number; remaining: number } | undefined>();
  const userTier = getUserTier();

  // Initialize Nova with greeting
  useEffect(() => {
    if (!isInitialized && user?.name) {
      initializeNova();
    }
  }, [user?.name, isInitialized]);

  // Listen to prefill and context events
  useEffect(() => {
    const onPrefill = (e: any) => {
      const { prompt, submit } = e.detail || {};
      if (!prompt) return;
      setInput(prompt);
      if (submit && typeof handleSubmit === 'function') {
        handleSubmit(new Event('submit') as any);
        
        // Track stream completion
        if (typeof track === 'function') track('nova_stream_done', {
          event_category: 'ai_interaction',
          event_label: 'stream_completed',
          user_id: user?.id,
          context: contextMode
        });
      }
    };
    const onSetCtx = (e: any) => {
      const m = e.detail?.mode;
      if (m) setContextMode(m);
    };
    window.addEventListener('nova:prefill', onPrefill as any);
    window.addEventListener('nova:set-context', onSetCtx as any);
    return () => {
      window.removeEventListener('nova:prefill', onPrefill as any);
      window.removeEventListener('nova:set-context', onSetCtx as any);
    };
  }, []);

  // Auto-scroll to bottom
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

  const initializeNova = async () => {
    // CHECK: Verify LIVE Supabase session
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const sb = supabase();
      const { data: { session } } = await sb.auth.getSession();

      if (!session?.user) {
        console.warn('⛔ [NovaChat] No Supabase session on init - showing login prompt');
        setLoginPromptReason('auth');
        setLoginPromptOpen(true);
        setIsInitialized(true);
        return;
      }
    } catch (authError) {
      console.error('❌ [NovaChat] Session check failed on init:', authError);
      setLoginPromptReason('auth');
      setLoginPromptOpen(true);
      setIsInitialized(true);
      return;
    }

    // CHECK: Is user logged in? (backup check)
    if (!user || !user.id || user.id === 'anon') {
      console.warn('⛔ [NovaChat] Context user invalid on init - showing login prompt');
      setLoginPromptReason('auth');
      setLoginPromptOpen(true);
      setIsInitialized(true); // Mark as initialized to prevent retry loop
      return;
    }

    try {
      const agent = await loadNovaAgent();
      const greeting = await agent.greet(user?.name || 'daar');

      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        timestamp: Date.now(),
        type: 'text'
      }]);

      setIsInitialized(true);

      // Track Nova initialization
      if (typeof track === 'function') track('nova_chat_initialized', {
        event_category: 'ai_interaction',
        event_label: 'greeting_sent',
        user_id: user?.id
      });
    } catch (error) {
      console.warn('[NovaChat] Initialization failed:', error);

      // Fallback greeting
      setMessages([{
        id: 'fallback-greeting',
        role: 'assistant',
        content: `Hoi ${user?.name || 'daar'}! Ik ben Nova, je AI-stylist. Waar kan ik je mee helpen?`,
        timestamp: Date.now(),
        type: 'text'
      }]);

      setIsInitialized(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // CRITICAL: Check LIVE Supabase session (not stale user state)
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const sb = supabase();
      const { data: { session } } = await sb.auth.getSession();

      if (!session?.user) {
        console.warn('⛔ [NovaChat] No active Supabase session - showing login prompt');
        setLoginPromptReason('auth');
        setLoginPromptOpen(true);
        return;
      }

      console.log('✅ [NovaChat] Active session confirmed:', {
        userId: session.user.id.substring(0, 8) + '...',
        hasSession: true
      });
    } catch (authError) {
      console.error('❌ [NovaChat] Session check failed:', authError);
      setLoginPromptReason('auth');
      setLoginPromptOpen(true);
      return;
    }

    // PROACTIVE: Check auth from context (backup check)
    if (!user || !user.id || user.id === 'anon') {
      console.warn('⛔ [NovaChat] Context user invalid - showing login prompt');
      console.log('📋 [NovaChat] User state:', user);
      setLoginPromptReason('auth');
      setLoginPromptOpen(true);
      return;
    }

    // PROACTIVE: Check quiz completion BEFORE sending request
    const quizAnswersStr = localStorage.getItem('ff_quiz_answers');
    if (!quizAnswersStr) {
      console.warn('⛔ [NovaChat] Quiz not completed - showing quiz prompt');
      console.log('📋 [NovaChat] localStorage keys:', Object.keys(localStorage));
      setLoginPromptReason('quiz');
      setLoginPromptOpen(true);
      return;
    }

    console.log('✅ [NovaChat] Proactive checks passed - sending to backend');

    // Check quota before making request
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
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Clear previous cards for new conversation
    setCards(null);
    
    // Show typing delay first (600-1200ms)
    const typingDelay = 600 + Math.random() * 600;
    setShowTypingDelay(true);
    
    setTimeout(() => {
      setShowTypingDelay(false);
      setIsTyping(true);
    }, typingDelay);
    
    // Create abort controller for this request
    const abortController = new AbortController();
    abortRef.current = abortController;
    
    // Set connection status and start timing
    conn.setStatus('connecting');
    const tStart = performance.now();
    let firstChunkAt: number | null = null;

    // Fire analytics + bubble state
    window.dispatchEvent(new CustomEvent('nova:message', { detail: { role: 'user' } }));
    if (typeof track === 'function') track('nova_message_send', { context: contextMode });

    // Track user message
    if (typeof track === 'function') track('nova_user_message', {
      event_category: 'ai_interaction',
      event_label: 'message_sent',
      message_length: userMessage.content.length,
      user_id: user?.id
    });

    try {
      // Create assistant message placeholder
      const assistantId = `assistant-${Date.now()}`;
      let acc = '';
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), type: 'text' }]);
      
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setIsTyping(true);
      
      try {
        const history = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
        for await (const delta of streamChat({ 
          mode: contextMode as NovaMode, 
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
              // quota signal vanuit server
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
              // failsafe: verwijder eventuele JSON markers uit de laatste assistant content
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
        
        // Increment usage on successful completion
        incrementUsage(getUserTier(), user?.id || 'anon');
      } catch (e: any) {
        conn.setStatus('error');
        const errorMsg = e?.message || String(e);
        let content = 'Sorry, er ging iets mis. Probeer het opnieuw.';
        let showPrompt = false;

        // DEBUG: Log complete error for troubleshooting
        console.error('🔴 [NovaChat] Error caught:', {
          message: errorMsg,
          error: e,
          response: e?.response,
          data: e?.data,
          stack: e?.stack
        });

        // Check if this is an auth/access error from the backend
        if (e?.response || e?.data) {
          const errorData = e?.response?.data || e?.data || {};
          const errorCode = errorData.code || errorData.error;

          if (errorCode === 'AUTH_REQUIRED' || errorCode === 'authentication_required') {
            setLoginPromptReason('auth');
            setLoginPromptOpen(true);
            showPrompt = true;
            content = 'Log in om Nova te gebruiken.';
          } else if (errorCode === 'QUIZ_REQUIRED') {
            setLoginPromptReason('quiz');
            setLoginPromptOpen(true);
            showPrompt = true;
            content = 'Voltooi eerst je stijlquiz om Nova te gebruiken.';
          } else if (errorCode === 'RATE_LIMIT_REACHED') {
            setLoginPromptReason('rate_limit');
            if (errorData.usage) {
              setUsageInfo(errorData.usage);
            }
            setLoginPromptOpen(true);
            showPrompt = true;
            content = errorData.message || 'Dagelijkse limiet bereikt.';
          } else if (errorCode === 'NO_PROFILE') {
            content = 'Account niet gevonden. Maak eerst een profiel aan.';
          }
        }

        // Fallback error messages
        if (!showPrompt) {
          if (errorMsg.includes('NOVA_SSE_INACTIVE')) {
            content = 'Nova is nog niet actief (SSE/OpenAI). Zet OPENAI_API_KEY in Netlify en deploy de function.';
          } else if (errorMsg.includes('aborted') || errorMsg.includes('interrupted')) {
            content = 'De verbinding werd onderbroken. De server kan overbelast zijn of de response was te groot. Probeer een kortere vraag.';
          } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
            content = 'Netwerkfout: kan geen verbinding maken met Nova. Check je internetverbinding.';
          } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
            setLoginPromptReason('auth');
            setLoginPromptOpen(true);
            content = 'Log in om Nova te gebruiken.';
          } else if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
            setLoginPromptReason('rate_limit');
            setLoginPromptOpen(true);
            content = 'Toegang geweigerd. Check je account status.';
          }
        }

        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content } : m));
      } finally {
        setIsTyping(false);
        abortRef.current = null;
        
        // Set final status if not already error
        if (conn.status !== 'error') {
          conn.setStatus('done');
        }
      }
      
      // Track Nova response
      if (typeof track === 'function') track('nova_response_generated', {
        event_category: 'ai_interaction',
        event_label: 'streaming_complete',
        response_length: acc.length,
        user_id: user?.id
      });

    } finally {
      setIsLoading(false);
      
      // Track stream completion
      if (typeof track === 'function') track('nova_stream_done', {
        event_category: 'ai_interaction',
        event_label: 'stream_completed',
        user_id: user?.id,
        context: contextMode
      });
    }
  };

  const handleAbort = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      toast.success('Nova gestopt', { duration: 1500 });
    }
  };

  const getReplyContent = (reply: NovaReply): string => {
    switch (reply.type) {
      case 'text':
        return reply.message;
      case 'tips':
        return `${reply.title}\n\n${reply.bullets.map(bullet => `• ${bullet}`).join('\n')}`;
      case 'outfits':
        return `${reply.title}\n\n${reply.items.map(item => `• ${item.name}: ${item.description}${item.price ? ` (€${item.price})` : ''}`).join('\n')}`;
      default:
        return 'Nova heeft een antwoord gestuurd.';
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Antwoord gekopieerd!', { duration: 2000 });
      
      // Track copy action
      if (typeof track === 'function') track('nova_message_copied', {
        event_category: 'ai_interaction',
        event_label: 'copy_response',
        content_length: content.length,
        user_id: user?.id
      });
    } catch (error) {
      console.warn('Copy failed:', error);
      toast.error('Kopiëren mislukt');
    }
  };
  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <motion.div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <motion.div
          className={[
            'max-w-[90%] sm:max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 shadow-lg relative overflow-hidden',
            isUser
              ? 'ml-auto bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/20'
              : 'mr-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700'
          ].join(' ')}
          whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {/* Subtle gradient overlay for assistant messages */}
          {!isUser && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 pointer-events-none" />
          )}

          {/* Assistant message header with copy button */}
          {!isUser && (
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nova</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-bold shadow-md">
                  AI
                </span>
              </div>

              <motion.button
                onClick={() => handleCopyMessage(message.content)}
                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors opacity-60 hover:opacity-100 relative z-10"
                title="Kopieer antwoord"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </motion.button>
            </div>
          )}

          {/* Message content */}
          <div className={`prose prose-sm max-w-none relative z-10 ${isUser ? 'text-white' : ''}`}>
            {isUser ? (
              <p className="mb-0 font-medium">{message.content}</p>
            ) : (
              <div
                className="nova-content"
                dangerouslySetInnerHTML={{
                  __html: mdLite(message.content)
                }}
              />
            )}
          </div>

          {/* User message timestamp */}
          {isUser && (
            <div className="mt-2 text-right">
              <span className="text-xs text-white/70">
                {new Date(message.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-blue-50/30">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4"
      >
        {messages.map(renderMessage)}
        
        {/* Typing indicators */}
        <AnimatePresence>
          {showTypingDelay && (
            <motion.div
              className="flex justify-start mb-4"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 pointer-events-none" />
                <div className="flex items-center space-x-2 mb-3 relative z-10">
                  <motion.div
                    className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nova</span>
                </div>
                <div className="flex space-x-1.5 relative z-10">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      animate={{
                        y: [0, -8, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {isTyping && !showTypingDelay && (
            <motion.div
              className="flex justify-start mb-4"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 pointer-events-none" />
                <div className="flex items-center space-x-2 mb-3 relative z-10">
                  <motion.div
                    className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nova</span>
                  <motion.span
                    className="text-xs text-gray-500 dark:text-gray-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    aan het typen...
                  </motion.span>
                </div>
                <div className="relative z-10">
                  <TypingSkeleton />
                </div>
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

      {/* Input form */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/10 backdrop-blur-xl p-4 sm:p-5 shadow-lg">
        {/* Rate limit indicator */}
        <RateLimitIndicator endpoint="NOVA_CHAT" className="mb-3" />

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <motion.div
              className="relative"
              whileFocus={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Vraag Nova om styling advies..."
                className="w-full px-5 py-4 pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-sm sm:text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
                disabled={isLoading}
              />
              {/* Animated gradient border on focus */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity pointer-events-none" />

              {input && (
                <motion.button
                  type="button"
                  onClick={() => setInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              )}
            </motion.div>
          </div>

          {isLoading ? (
            <motion.button
              type="button"
              onClick={handleAbort}
              className="px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base min-w-[110px] shadow-lg shadow-red-500/30 font-bold"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
              <span>Stop</span>
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              disabled={!input.trim()}
              className="relative px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base min-w-[120px] shadow-xl shadow-blue-500/30 font-bold overflow-hidden group"
              whileHover={input.trim() ? { scale: 1.05, boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5)' } : {}}
              whileTap={input.trim() ? { scale: 0.95 } : {}}
            >
              {/* Shine effect */}
              {input.trim() && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-200%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'linear',
                  }}
                />
              )}
              <motion.div
                animate={input.trim() ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Send className="w-5 h-5 relative z-10" />
              </motion.div>
              <span className="relative z-10">Verstuur</span>
            </motion.button>
          )}
        </form>
      </div>

      {/* Quota Modal */}
      <QuotaModal
        isOpen={quotaOpen}
        onClose={() => setQuotaOpen(false)}
        tier={userTier}
      />

      {/* Login/Access Prompt Modal */}
      <NovaLoginPrompt
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        reason={loginPromptReason}
        usage={usageInfo}
        tier={userTier}
      />
    </div>
  );
};

export default NovaChat;