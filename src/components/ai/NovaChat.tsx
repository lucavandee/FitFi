import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle } from 'lucide-react';
import { loadNovaAgent } from '@/ai/nova/load';
import { trackEvent } from '@/utils/analytics';
import Button from '../ui/Button';

export type NovaMessage = { role: 'user' | 'assistant' | 'system'; text: string; ts: number };

export type NovaChatProps = {
  onClose?: () => void;
  context?: string;
  className?: string;
};

function NovaChat({ onClose, context = 'general', className = '' }: NovaChatProps) {
  const [messages, setMessages] = useState<NovaMessage[]>([
    { 
      role: 'assistant', 
      text: 'Hey! Ik ben Nova, jouw AI-stylist. Waar kan ik je mee helpen?', 
      ts: Date.now() 
    }
  ]);
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Trim input and validate
    const text = value.trim();
    if (!text || sending) return;

    // Prevent double-clicking by setting sending immediately
    setSending(true);
    setError(null);

    // Add user message immediately for better UX
    const userMessage: NovaMessage = { role: 'user', text, ts: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setValue(''); // Clear input immediately

    try {
      // Track user message
      trackEvent('nova_message_sent', 'ai_interaction', 'user_message', 1, {
        message_length: text.length,
        context: context,
        message_type: 'user_input'
      });

      // Load Nova agent with fallback
      const agent = await loadNovaAgent();
      if (!agent) {
        throw new Error('Nova agent not available');
      }

      // Get reply from agent
      const reply = await agent.ask(text, { context });

      // Convert reply to plain text string
      let responseText: string;
      
      if (reply?.type === 'text') {
        responseText = reply.message;
      } else if (reply?.type === 'tips') {
        // Format tips as readable text
        responseText = `**${reply.title}**\n\n${reply.bullets.map(b => `• ${b}`).join('\n')}`;
      } else if (reply?.type === 'outfits') {
        // Format outfits as text list
        responseText = `**${reply.title}**\n\n${reply.items.map(item => 
          `• **${item.name}** - ${item.description}${item.price ? ` (€${item.price})` : ''}`
        ).join('\n')}`;
      } else {
        // Fallback for unknown reply types
        responseText = 'Ik heb je vraag ontvangen. Kun je iets specifieker zijn?';
      }

      // Add assistant response
      const assistantMessage: NovaMessage = { 
        role: 'assistant', 
        text: responseText, 
        ts: Date.now() 
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Track successful response
      trackEvent('nova_response_generated', 'ai_interaction', 'assistant_response', 1, {
        response_type: reply?.type || 'unknown',
        response_length: responseText.length,
        context: context
      });

    } catch (err) {
      console.warn('[Nova] Chat error:', err);
      
      // Show user-friendly error message
      const errorMessage: NovaMessage = { 
        role: 'assistant', 
        text: 'Sorry, er ging iets mis. Probeer het nog eens of stel je vraag net anders. 🤖', 
        ts: Date.now() 
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Set error state for debugging
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Track error
      trackEvent('nova_error', 'ai_interaction', 'chat_error', 1, {
        error_message: err instanceof Error ? err.message : 'Unknown error',
        context: context,
        user_input: text
      });
      
    } finally {
      setSending(false);
      // Re-focus input for better UX
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickSuggestions = [
    'Zomerse outfit in beige',
    'Smart casual voor kantoor',
    'Weekend look met sneakers',
    'Formele outfit voor event'
  ];

  const handleQuickSuggestion = (suggestion: string) => {
    setValue(suggestion);
    inputRef.current?.focus();
    
    // Track quick suggestion usage
    trackEvent('nova_quick_suggestion', 'ai_interaction', 'suggestion_clicked', 1, {
      suggestion_text: suggestion,
      context: context
    });
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#89CFF0]/10 to-blue-50 dark:from-[#89CFF0]/20 dark:to-blue-900/20 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Nova AI</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Jouw persoonlijke stylist</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online"></div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
              aria-label="Sluit Nova chat"
            >
              <X size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-[#89CFF0] text-white'
                : message.role === 'system'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {message.text}
              </pre>
              <div className="text-xs opacity-70 mt-1">
                {new Date(message.ts).toLocaleTimeString('nl-NL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {/* Thinking indicator */}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error display */}
        {error && (
          <div className="flex justify-start">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl px-4 py-3 max-w-[85%]">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Debug info:</strong> {error}
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-3xl">
        {/* Quick Suggestions - only show initially */}
        {messages.length <= 1 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Probeer bijvoorbeeld:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                  disabled={sending}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Form */}
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Bijv. 'Zomerse outfit in beige'"
            className="flex-1 min-w-0 px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors text-sm placeholder-gray-500 dark:placeholder-gray-400"
            disabled={sending}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!value.trim() || sending}
            className="flex-shrink-0 px-4 py-2 bg-[#89CFF0] hover:bg-[#89CFF0]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0D1B2A] rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:ring-offset-2"
            aria-label="Verstuur bericht"
          >
            <div className="flex items-center space-x-2">
              {sending ? (
                <div className="w-4 h-4 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span className="text-sm">Stuur</span>
            </div>
          </button>
        </form>
        
        {/* Footer */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Nova leert van je feedback om betere aanbevelingen te doen
        </p>
      </div>
    </div>
  );
}

export default NovaChat;