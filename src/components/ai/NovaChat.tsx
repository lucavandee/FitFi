import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, X } from 'lucide-react';
import { routeMessage, type NovaReply } from '@/ai/nova/router';
import { useUser } from '@/context/UserContext';
import { trackEvent } from '@/utils/analytics';

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
  const [status, setStatus] = useState<'ready' | 'degraded' | 'error'>('ready');
  const { user } = useUser();
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

  // Initialize Nova agent with fail-safe
  useEffect(() => {
    try {
      // Try to initialize Nova agent
      if (import.meta.env.VITE_NOVA_ENABLED === 'true') {
        import('@/ai/nova/load').catch(err => {
          console.warn('[Nova] Agent loading failed:', err);
          setStatus('degraded');
        });
      }
    } catch (err) {
      console.error('[Nova] Init failed:', err);
      setStatus('degraded');
    }
  }, []);
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Trim input and validate
    const text = value.trim();
    if (!text || sending) return;

    // Check if Nova is in degraded state
    if (status === 'degraded') {
      const errorMessage: NovaMessage = { 
        role: 'assistant', 
        text: 'Nova is tijdelijk niet beschikbaar. Probeer het later opnieuw of neem contact op voor hulp.', 
        ts: Date.now() 
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
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

      // Use smart router for deterministic responses
      const reply: NovaReply = await Promise.resolve(routeMessage(text, {
        userId: user?.id,
        gender: user?.gender ?? 'female',
        profile: user ? {
          id: user.id,
          name: user.name || 'User',
          email: user.email || '',
          gender: user.gender || 'female',
          stylePreferences: {
            casual: 3,
            formal: 3,
            sporty: 3,
            vintage: 3,
            minimalist: 3
          },
          isPremium: false,
          savedRecommendations: []
        } : null
      }));

      // Handle different reply types
      switch (reply.type) {
        case 'smalltalk':
        case 'capabilities':
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            text: reply.text, 
            ts: Date.now() 
          }]);
          break;
          
        case 'clarify':
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            text: reply.text, 
            ts: Date.now(),
            options: reply.options
          }]);
          break;
          
        case 'outfits':
          // Format outfits as rich content
          const outfitText = `${reply.text}\n\n${reply.outfits.map((outfit, i) => 
            `${i + 1}. **${outfit.title}** (${outfit.matchPercentage}% match)\n   ${outfit.description}`
          ).join('\n\n')}`;
          
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            text: outfitText, 
            ts: Date.now(),
            outfits: reply.outfits
          }]);
          break;
      }

      trackEvent('nova_response_generated', 'ai_interaction', 'assistant_response', 1, {
        response_type: reply.type,
        response_length: reply.text.length,
        context: context
      });

    } catch (err) {
      console.warn('[Nova] Chat error:', err);
      setStatus('error');
      
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

  const handleOutfitAction = (action: 'save' | 'more' | 'dislike', outfit: any) => {
    // Track outfit interaction
    trackEvent('nova_outfit_action', 'ai_interaction', action, 1, {
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype,
      context: context
    });

    switch (action) {
      case 'save':
        // Add to saved outfits (could integrate with engagement service)
        console.log('Saving outfit:', outfit.id);
        // You could call: toggleSave(outfit.id) from engagement service
        break;
      case 'more':
        // Request more similar outfits
        console.log('Requesting more like:', outfit.id);
        setValue(`Meer outfits zoals ${outfit.title}`);
        break;
      case 'dislike':
        // Hide this type of outfit
        console.log('Disliking outfit:', outfit.id);
        // You could call: dislike(outfit.id) from engagement service
        break;
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

  // Show degraded state indicator
  const getStatusIndicator = () => {
    switch (status) {
      case 'degraded':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Beperkte functionaliteit"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Fout opgetreden"></div>;
      default:
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online"></div>;
    }
  };
  return (
    <div className={`chat-container flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl pointer-events-auto ${className}`} style={{ height: '420px' }}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#89CFF0]/10 to-blue-50 dark:from-[#89CFF0]/20 dark:to-blue-900/20 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Nova AI</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {status === 'degraded' ? 'Beperkte functionaliteit' : 'Jouw persoonlijke stylist'}
              </p>
            </div>
            {getStatusIndicator()}
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              type="button"
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
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {message.text}
              </div>
              
              {/* Render clarification options */}
              {(message as any).options && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(message as any).options.map((option: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleQuickSuggestion(option)}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Render outfit cards */}
              {(message as any).outfits && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(message as any).outfits.slice(0, 3).map((outfit: any, i: number) => (
                    <div key={outfit.id || i} className="rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="aspect-[4/3] bg-white/5 grid place-items-center text-white/50 text-sm overflow-hidden">
                        {outfit.imageUrl ? (
                          <img 
                            src={outfit.imageUrl} 
                            alt={outfit.title || 'Outfit'} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <span>Geen afbeelding</span>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-white font-medium text-sm mb-1 line-clamp-1">
                          {outfit.title || 'Stijlvolle look'}
                        </div>
                        <div className="text-white/70 text-xs line-clamp-2 mb-2">
                          {outfit.description || 'Geselecteerd op basis van jouw profiel'}
                        </div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="bg-white/20 px-2 py-0.5 rounded-full">
                            {outfit.matchPercentage || 85}% match
                          </span>
                          <span className="text-white/60">{outfit.archetype || 'casual'}</span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleOutfitAction('save', outfit)}
                            className="flex-1 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15 transition-colors"
                            title="Bewaar outfit"
                          >
                            Bewaar
                          </button>
                          <button 
                            onClick={() => handleOutfitAction('more', outfit)}
                            className="flex-1 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15 transition-colors"
                            title="Meer zoals dit"
                          >
                            Meer
                          </button>
                          <button 
                            onClick={() => handleOutfitAction('dislike', outfit)}
                            className="flex-1 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15 transition-colors text-red-300"
                            title="Niet mijn stijl"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
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
      <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-3xl">
        {/* Quick Suggestions - only show initially */}
        {messages.length <= 1 && (
          <div className="px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Probeer bijvoorbeeld:</p>
            <div className="flex gap-2 min-w-max">
              {quickSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors whitespace-nowrap"
                  disabled={sending || status === 'degraded'}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Form */}
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              ref={inputRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Bijv. 'Zomerse outfit in beige'"
              className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pl-4 pr-12 outline-none border border-gray-200 dark:border-gray-600 focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all"
              disabled={sending || status === 'degraded'}
              maxLength={500}
              aria-label="Bericht aan Nova"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!value.trim() || sending || status === 'degraded'}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg bg-[#89CFF0] hover:bg-[#89CFF0]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0D1B2A] grid place-items-center focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:ring-offset-2 transition-colors"
              aria-label="Verstuur bericht"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            {status === 'degraded' 
              ? 'Nova heeft beperkte functionaliteit - probeer het later opnieuw'
              : 'Nova leert van je feedback om betere aanbevelingen te doen'
            }
          </p>
        </div>
        
        {/* Footer */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          {status === 'degraded' 
            ? 'Nova heeft beperkte functionaliteit - probeer het later opnieuw'
            : 'Nova leert van je feedback om betere aanbevelingen te doen'
          }
        </p>
      </div>
    </div>
  );
}

export default NovaChat;