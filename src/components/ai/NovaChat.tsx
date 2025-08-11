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
    <div className={`flex flex-col h-full bg-white rounded-3xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#89CFF0]/10 to-blue-50 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Nova AI</h3>
              <p className="text-sm text-gray-600">Jouw persoonlijke stylist</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online"></div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Sluit Nova chat"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-[#89CFF0] text-white'
                : message.role === 'system'
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : 'bg-gray-100 text-gray-800'
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
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error display */}
        {error && (
          <div className="flex justify-start">
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 max-w-[85%]">
              <p className="text-sm text-red-700">
                <strong>Debug info:</strong> {error}
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl">
        {/* Quick Suggestions - only show initially */}
        {messages.length <= 1 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Probeer bijvoorbeeld:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={sending}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Form */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Bijv. 'Zomerse outfit in beige'"
            className="flex-1 min-w-0 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors text-sm"
            disabled={sending}
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!value.trim() || sending}
            variant="primary"
            size="sm"
            icon={sending ? undefined : <Send size={16} />}
            className="shrink-0 bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] px-4"
            aria-label="Verstuur bericht"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
            ) : (
              'Stuur'
            )}
          </Button>
        </form>
        
        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-2">
          Nova leert van je feedback om betere aanbevelingen te doen
        </p>
      </div>
    </div>
  );
}

export default NovaChat;