import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { openNovaStream } from '@/services/nova/novaClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface NovaConversationalPanelProps {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, any>;
  currentQuestion?: {
    field: string;
    question: string;
    type: string;
    options?: string[];
  };
  phase: 'questions' | 'swipes' | 'calibration';
  onSuggestAnswer?: (field: string, value: any) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function NovaConversationalPanel({
  currentStep,
  totalSteps,
  answers,
  currentQuestion,
  phase,
  onSuggestAnswer,
  isExpanded,
  onToggleExpand,
  onClose
}: NovaConversationalPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      // Welcome message when opened
      setMessages([{
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: Date.now()
      }]);
    }
  }, [isExpanded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getWelcomeMessage = () => {
    if (phase === 'questions') {
      return `Hoi! 👋 Ik ben Nova, jouw AI styling assistent. Je bent nu bij vraag ${currentStep + 1} van ${totalSteps}. Heb je vragen over deze stap, of wil je styling advies?`;
    }
    if (phase === 'swipes') {
      return `Geweldig dat je bij de swipe fase bent! Swipe naar rechts op looks die je aantrekken. Ik leer van elke keuze die je maakt. Vragen?`;
    }
    return `We zijn je persoonlijke Style DNA aan het kalibreren! Dit wordt exciting. Stel me gerust vragen.`;
  };

  const buildContext = () => {
    const context = {
      phase,
      currentStep: currentStep + 1,
      totalSteps,
      progress: Math.round((currentStep / totalSteps) * 100),
      answers,
      currentQuestion: currentQuestion ? {
        field: currentQuestion.field,
        question: currentQuestion.question,
        type: currentQuestion.type
      } : null
    };

    return `
Je bent Nova, een AI styling assistent die users helpt tijdens hun onboarding.

HUIDIGE CONTEXT:
- Fase: ${phase}
- Stap: ${currentStep + 1}/${totalSteps}
- Voortgang: ${Math.round((currentStep / totalSteps) * 100)}%

HUIDIGE VRAAG:
${currentQuestion ? `"${currentQuestion.question}" (veld: ${currentQuestion.field})` : 'Geen specifieke vraag nu'}

USER ANTWOORDEN TOT NU:
${JSON.stringify(answers, null, 2)}

INSTRUCTIES:
1. Wees vriendelijk, persoonlijk en behulpzaam
2. Als user vraagt over huidige vraag, leg uit WAAROM we het vragen
3. Als user twijfelt tussen opties, help met advies gebaseerd op eerdere antwoorden
4. Als user vast zit, bied concrete suggesties
5. Gebruik Nederlandse taal, casual maar professioneel
6. Houd antwoorden kort (max 2-3 zinnen) tenzij diepte nodig is
7. Als je styling advies geeft, wees specifiek en actionable

Je doel: Help user met vertrouwen door de quiz heen, maak het leuk en persoonlijk.
`.trim();
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'nova_onboarding_question', {
        question: input,
        step: currentStep,
        phase
      });
    }

    try {
      const contextMessage = {
        role: 'system',
        content: buildContext()
      };

      const conversationHistory = [
        contextMessage,
        ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input }
      ];

      let assistantResponse = '';

      await openNovaStream(
        '/.netlify/functions/nova',
        {
          mode: 'onboarding',
          messages: conversationHistory as any
        },
        {
          onChunk: (e) => {
            assistantResponse += e.delta;
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.role === 'assistant' && Date.now() - lastMessage.timestamp < 1000) {
                return [...prev.slice(0, -1), { ...lastMessage, content: assistantResponse }];
              }
              return [...prev, { role: 'assistant', content: assistantResponse, timestamp: Date.now() }];
            });
          },
          onDone: () => {
            setIsLoading(false);

            // Track successful interaction
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'nova_onboarding_response', {
                response_length: assistantResponse.length,
                step: currentStep,
                phase
              });
            }
          },
          onError: (e) => {
            console.error('Nova error:', e);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Sorry, ik kon je vraag niet verwerken. Probeer het opnieuw of ga verder met de quiz.',
              timestamp: Date.now()
            }]);
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Er ging iets mis. Probeer het opnieuw.',
        timestamp: Date.now()
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isExpanded) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed bottom-6 right-6 z-50 w-96 h-[600px] flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-elevated)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">Nova</div>
              <div className="text-xs text-[var(--color-text)]/60">AI Styling Assistent</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleExpand}
              className="p-2 hover:bg-[var(--color-bg)] rounded-[var(--radius-md)] transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-bg)] rounded-[var(--radius-md)] transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-[var(--radius-lg)] px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-bg)] text-[var(--color-text)]'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[var(--color-bg)] rounded-[var(--radius-lg)] px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-end gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Stel me een vraag..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-lg)] hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[var(--color-text)]/50 mt-2">
            Tip: Vraag me om uitleg, advies, of hulp bij keuzes
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
