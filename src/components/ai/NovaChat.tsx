import React, { useState, useRef, useEffect } from 'react';
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
import { getUserTier, checkQuotaLimit, incrementUsage } from '@/utils/session';
import { generateNovaExplanation } from '@/engine/explainOutfit';

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
        className="underline decoration-[#89CFF0] underline-offset-2 hover:opacity-80">{part}</a>;
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
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: acc } : m));
          scrollToBottom();
        }
        
        // Increment usage on successful completion
        incrementUsage(getUserTier(), user?.id || 'anon');
      } catch (e: any) {
        conn.setStatus('error');
        const errorMsg = e?.message || String(e);
        let content = 'Sorry, er ging iets mis. Probeer het opnieuw.';
        
        if (errorMsg.includes('NOVA_SSE_INACTIVE')) {
          content = 'Nova is nog niet actief (SSE/OpenAI). Zet OPENAI_API_KEY in Netlify en deploy de function.';
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
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
      >
        <div
          className={[
            'max-w-[85%] rounded-2xl px-3 py-2 shadow-sm',
            isUser ? 'ml-auto bg-[var(--ff-bubble-user)] text-ink shadow-[0_2px_12px_rgba(13,27,42,0.04)]'
                   : 'mr-auto bg-[var(--ff-panel)] text-ink shadow-[0_4px_20px_rgba(13,27,42,0.06)]'
          ].join(' ')}
        >
          {/* Assistant message header with copy button */}
          {!isUser && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-[#89CFF0] rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-[#89CFF0]">Nova</span>
                <span className="px-2 py-0.5 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium">
                  AI
                </span>
              </div>
              
              <button
                onClick={() => handleCopyMessage(message.content)}
                className="p-1 rounded hover:bg-white