import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles, Copy, X, Bot } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { streamChat } from '@/services/ai/novaService';
import TypingSkeleton from '@/components/ai/TypingSkeleton';
import { track } from '@/utils/analytics';
import toast from 'react-hot-toast';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contextMode, setContextMode] = useState<'outfits'|'archetype'|'shop'>('outfits');
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingDelay, setShowTypingDelay] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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
        track('nova_stream_done', {
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
      track('nova_chat_initialized', {
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

    // Fire analytics + bubble state
    window.dispatchEvent(new CustomEvent('nova:message', { detail: { role: 'user' } }));
    track('nova_message_send', { context: contextMode });

    // Track user message
    track('nova_user_message', {
      event_category: 'ai_interaction',
      event_label: 'message_sent',
      message_length: userMessage.content.length,
      user_id: user?.id
    });

    try {
      // Create assistant message placeholder
      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Stream response
      let acc = '';
      const history = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
      
      for await (const delta of streamChat({ mode: contextMode as any, messages: history, signal: abortController.signal })) {
        acc += delta;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: acc } : m));
        // Auto-scroll after each chunk
        scrollToBottom();
      }
      
      // Track Nova response
      track('nova_response_generated', {
        event_category: 'ai_interaction',
        event_label: 'streaming_complete',
        response_length: acc.length,
        user_id: user?.id
      });

    } catch (error) {
      // Check if error was due to abort
      if (abortController.signal.aborted) {
        console.log('[NovaChat] Request aborted by user');
        
        // Track abort
        track('nova_request_aborted', {
          event_category: 'ai_interaction',
          event_label: 'user_abort',
          user_id: user?.id,
          context: contextMode
        });
      } else {
        console.error('[NovaChat] Error:', error);
        
        // Check for SSE inactive error
        const errorMsg = error instanceof Error ? error.message : String(error);
        let content = 'Sorry, er ging iets mis. Probeer het opnieuw.';
        
        if (errorMsg.includes('NOVA_SSE_INACTIVE')) {
          content = 'Nova is nog niet actief (SSE/OPENAI). Vraag je team om OPENAI_API_KEY te zetten of de Netlify function te deployen.';
        }
        
        setMessages(prev => prev.map(m => 
          m.id === `assistant-${Date.now()}` ? { ...m, content } : m
        ).concat(prev.length === messages.length + 1 ? [] : [{
          id: `error-${Date.now()}`,
          role: 'assistant',
          content,
          timestamp: Date.now(),
          type: 'text'
        }]));

        // Track Nova error
        track('nova_error', {
          event_category: 'ai_interaction',
          event_label: 'response_failed',
          error_message: errorMsg,
          user_id: user?.id,
          context: contextMode
        });
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setShowTypingDelay(false);
      abortRef.current = null;
      
      // Track stream completion
      track('nova_stream_done', {
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
      track('nova_message_copied', {
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
                className="p-1 rounded hover:bg-white/10 transition-colors group"
                aria-label="Kopieer antwoord"
                title="Kopieer naar klembord"
              >
                <Copy className="w-3 h-3 text-white/60 group-hover:text-white/80" />
              </button>
            </div>
          )}
          
          {isUser ? (
            <div className="whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
          ) : (
            <div 
              className="prose prose-sm max-w-none text-ink" 
              data-testid="nova-assistant"
              dangerouslySetInnerHTML={{ __html: mdLite(message.content) }} 
            />
          )}
          
          {message.data && message.type === 'outfits' && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="text-xs text-white/80">
                {message.data.items?.length || 0} outfit suggesties
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-ink">Nova AI</h2>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium">
                Premium Stylist
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="relative flex-1 min-h-0 overflow-y-auto p-4 md:p-5 space-y-3 bg-white/70 text-ink"
      >
        {messages.map(renderMessage)}
        
        {(showTypingDelay || isTyping) && <TypingSkeleton />}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-[var(--ff-panel)] text-ink border border-gray-100 rounded-2xl px-4 py-3 flex items-center space-x-2 shadow-[0_4px_20px_rgba(13,27,42,0.06)]">
              <Loader className="w-4 h-4 animate-spin text-[#89CFF0]" />
              <span className="text-sm text-gray-600">Nova denkt na...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Vraag Nova om stijladvies..."
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm
                       text-ink placeholder-muted caret-ink outline-none
                       focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/30 focus:shadow-[0_4px_20px_rgba(137,207,240,0.15)]"
          />
          
          {isLoading ? (
            <button
              type="button"
              onClick={handleAbort}
              className="bg-red-500 hover:bg-red-600 text-white rounded-2xl px-4 py-2 transition-colors shadow-sm hover:shadow-md"
              title="Stop Nova"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] rounded-2xl px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default NovaChat;