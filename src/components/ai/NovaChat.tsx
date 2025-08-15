import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles, Copy } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { loadNovaAgent } from '@/ai/nova/load';
import type { NovaReply } from '@/ai/nova/agent';
import TypingSkeleton from '@/components/ai/TypingSkeleton';
import { track } from '@/utils/analytics';
import toast from 'react-hot-toast';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setIsTyping(true);

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
      const agent = await loadNovaAgent();
      const reply = await agent.ask(userMessage.content, { 
        profile: user,
        userId: user?.id,
        context: contextMode
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: getReplyContent(reply),
        timestamp: Date.now(),
        type: reply.type,
        data: reply.type !== 'text' ? reply : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Track Nova response
      track('nova_response_generated', {
        event_category: 'ai_interaction',
        event_label: reply.type,
        response_type: reply.type,
        user_id: user?.id
      });

    } catch (error) {
      console.error('[NovaChat] Error getting response:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, ik kan je nu niet helpen. Probeer het later opnieuw.',
        timestamp: Date.now(),
        type: 'text'
      };

      setMessages(prev => [...prev, errorMessage]);

      // Track Nova error
      track('nova_error', {
        event_category: 'ai_interaction',
        event_label: 'response_failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        user_id: user?.id,
        context: contextMode
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
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
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-[#89CFF0] text-[#0D1B2A]'
              : 'bg-white/10 text-white border border-white/20'
          }`}
        >
          {/* Assistant message header with copy button */}
          {!isUser && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <img src="/images/nova.svg" alt="Nova" className="w-4 h-4" />
                <span className="text-sm font-medium text-[#89CFF0]">Nova</span>
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
          
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            <span data-testid="nova-assistant">{message.content}</span>
          </div>
          
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
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(renderMessage)}
        
        {isTyping && <TypingSkeleton />}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white/10 text-white border border-white/20 rounded-2xl px-4 py-3 flex items-center space-x-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Nova denkt na...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Vraag Nova om stijladvies..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] rounded-xl px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default NovaChat;