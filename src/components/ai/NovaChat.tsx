import React from 'react';
import { Send, Sparkles, MessageCircle } from 'lucide-react';
import { planAndExecute, NovaMemory, NovaMessage } from '@/ai/nova/agent';
import { trackEvent } from '@/utils/analytics';
import OutfitCard from '@/components/outfits/OutfitCard';
import ProductCard from '@/components/ProductCard';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export type NovaChatProps = {
  onClose?: () => void;
  context?: string;
  className?: string;
};

function NovaChat({ onClose, context = 'general', className = '' }: NovaChatProps) {
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<NovaMessage[]>(NovaMemory.readHistory());
  const [cards, setCards] = React.useState<any[]>([]);
  const [kind, setKind] = React.useState<'outfits' | 'products' | undefined>();
  const [thinking, setThinking] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load profile and show personalized greeting
  React.useEffect(() => {
    const profile = NovaMemory.readProfile();
    
    if (profile && messages.length === 1) {
      // Generate personalized greeting based on profile
      let personalizedGreeting = 'Hey! Ik zie dat je je stijlprofiel hebt voltooid. ';
      
      if (profile.answers?.stylePreferences) {
        const topPrefs = profile.answers.stylePreferences.slice(0, 2);
        personalizedGreeting += `Ik hou rekening met jouw voorkeur voor ${topPrefs.join(' & ')}. `;
      }
      
      if (profile.answers?.baseColors) {
        personalizedGreeting += `En ik weet dat je van ${profile.answers.baseColors} kleuren houdt. `;
      }
      
      if (profile.archetypes?.length > 0) {
        personalizedGreeting += `Perfect voor jouw ${profile.archetypes[0].replace('_', ' ')} stijl! `;
      }
      
      personalizedGreeting += 'Waar kan ik je mee helpen?';
      
      const personalizedMsg: NovaMessage = {
        role: 'nova',
        content: personalizedGreeting,
        ts: Date.now()
      };
      
      setMessages([personalizedMsg]);
      NovaMemory.writeHistory([personalizedMsg]);
    }
  }, []);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Initialize with greeting if no history
  React.useEffect(() => {
    if (messages.length === 0) {
      const greeting: NovaMessage = {
        role: 'nova',
        content: 'Hey! Ik ben Nova, jouw AI-stylist. Waar heb je zin in vandaag—een outfitadvies, of iets specifieks zoeken?',
        ts: Date.now()
      };
      setMessages([greeting]);
      NovaMemory.writeHistory([greeting]);
    }
  }, []);

  const send = async () => {
    if (!input.trim()) return;
    
    const userMsg: NovaMessage = { role: 'user', content: input, ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    NovaMemory.writeHistory(newMessages);
    
    setThinking(true);
    setInput(''); // Clear input immediately for better UX
    
    try {
      const res = await planAndExecute(input);
      
      if (res.kind) setKind(res.kind as any);
      setCards(res.cards || []);
      
      const botMsg: NovaMessage = { role: 'nova', content: res.reply, ts: Date.now() };
      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);
      NovaMemory.writeHistory(finalMessages);
    } catch (e) {
      console.error('Nova error:', e);
      toast.error('Er ging iets mis. Probeer het nog eens.');
      
      // Add error message to chat
      const errorMsg: NovaMessage = {
        role: 'nova',
        content: 'Sorry, er ging iets mis. Probeer het nog eens of stel een andere vraag.',
        ts: Date.now()
      };
      const errorMessages = [...newMessages, errorMsg];
      setMessages(errorMessages);
      NovaMemory.writeHistory(errorMessages);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion);
    
    // Track quick suggestion usage
    trackEvent('nova_quick_suggestion_click', 'ai_interaction', 'suggestion_used', 1, {
      suggestion_text: suggestion.slice(0, 50),
      suggestion_index: quickSuggestions.indexOf(suggestion)
    });
  };

  const handleOutfitAction = (action: string, outfit: any) => {
    // Track outfit actions
    trackEvent('nova_outfit_action', 'ai_interaction', action, 1, {
      outfit_id: outfit.id,
      outfit_archetype: outfit.archetype,
      outfit_match_percentage: outfit.matchPercentage
    });
    
    switch (action) {
      case 'save':
        toast.success('Outfit bewaard!');
        break;
      case 'dislike':
        toast('We laten minder van deze stijl zien');
        // Remove from current cards
        setCards(prev => prev.filter(c => c.id !== outfit.id));
        break;
      case 'more_like_this':
        toast.success('Meer zoals dit toegevoegd!');
        // Could trigger new outfit generation
        break;
    }
  };

  const handleExplainInChat = (explanation: string, outfit: any) => {
    // Track explanation requests
    trackEvent('nova_explanation_generated', 'ai_interaction', 'outfit_explained', 1, {
      outfit_id: outfit.id,
      explanation_length: explanation.length,
      outfit_archetype: outfit.archetype
    });
    
    // Add explanation to chat
    const explanationMessage: NovaMessage = {
      role: 'nova',
      content: `💡 **${outfit.title}** - ${explanation}`,
      ts: Date.now()
    };
    const newMessages = [...messages, explanationMessage];
    setMessages(newMessages);
    NovaMemory.writeHistory(newMessages);
  };
  const quickSuggestions = [
    'Outfit voor kantoor onder €120 in zwart',
    'Casual weekend look met sneakers',
    'Zomerse outfit in beige',
    'Formele look voor bruiloft',
    'Sportieve outfit voor gym'
  ];

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
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              m.role === 'user'
                ? 'bg-[#89CFF0] text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm leading-relaxed">{m.content}</p>
              <div className="text-xs opacity-70 mt-1">
                {new Date(m.ts).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {thinking && (
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
        
        <div ref={messagesEndRef} />
      </div>

      {/* Cards Display */}
      {cards.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {kind === 'outfits' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {cards.map((outfit: any) => (
                <div key={outfit.id} className="bg-white rounded-xl p-3 shadow-sm">
                  <OutfitCard
                    outfit={{
                      ...outfit,
                      currentSeasonLabel: outfit.season || 'Dit seizoen',
                      dominantColorName: outfit.dominantColor || undefined
                    }}
                    onSave={() => handleOutfitAction('save', outfit)}
                    onDislike={() => handleOutfitAction('dislike', outfit)}
                    onMoreLikeThis={() => handleOutfitAction('more_like_this', outfit)}
                    onExplain={(explanation) => handleExplainInChat(explanation, outfit)}
                  />
                </div>
              ))}
            </div>
          )}
          
          {kind === 'products' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {cards.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  brand={product.brand || 'Unknown'}
                  title={product.name || product.title}
                  price={product.price || 0}
                  imageUrl={product.imageUrl}
                  deeplink={product.affiliateUrl || '#'}
                  className="scale-90"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl">
        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Probeer bijvoorbeeld:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.slice(0, 3).map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Bijv. 'Outfit voor kantoor onder €120 in zwart'"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
            disabled={thinking}
          />
          <Button
            onClick={send}
            disabled={!input.trim() || thinking}
            variant="primary"
            size="sm"
            icon={thinking ? undefined : <Send size={16} />}
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] px-4"
            aria-label="Verstuur bericht"
          >
            {thinking ? (
              <div className="w-4 h-4 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
            ) : (
              'Stuur'
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Nova leert van je feedback om betere aanbevelingen te doen
        </p>
      </div>
    </div>
  );
}

export default NovaChat;