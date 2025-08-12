import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Sparkles, MessageCircle, X } from 'lucide-react';
import { routeMessage, type NovaReply, type NovaContext } from '@/ai/nova/router';
import { useUser } from '@/context/UserContext';
import { trackEvent } from '@/utils/analytics';
import { track } from '@/utils/telemetry';

type ChatMsg =
  | { role: 'assistant' | 'user'; type: 'text'; text: string }
  | { role: 'assistant'; type: 'gate'; text: string };

const SUGGESTIONS = [
  'Zomerse outfit in beige',
  'Smart casual voor kantoor',
  'Weekend look met sneakers',
  'Formele outfit voor event',
];
export type NovaChatProps = {
  onClose?: () => void;
  context?: string;
  // Single source of truth
  className?: string;
};

function NovaChat({ onClose, context = 'general', className = '' }: NovaChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const lastIntentRef = useRef<string | null>(null);
  const debounceTimeoutRef = useRef<number | undefined>(undefined);

  // Welkomstbericht (eenmalig)
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        type: 'text',
        text: 'Hey! Ik ben Nova, jouw AI-stylist. Waar kan ik je mee helpen?',
      },
    ]);
  }, []);

  // Pending vraag na login automatisch opnieuw sturen
  useEffect(() => {
    if (!user?.id) return;
    const pending = localStorage.getItem('nova_pending_query');
    if (pending) {
      localStorage.removeItem('nova_pending_query');
      handleSend(undefined, pending);
      track('nova_replay_query');
    }
  }, [user?.id]);

  const push = useCallback((m: ChatMsg) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const handleSend = useCallback(
    (e?: React.FormEvent, raw?: string) => {
      if (e) e.preventDefault();
      const text = (raw ?? input).trim();
      if (!text) return;

      // user message
      push({ role: 'user', type: 'text', text });
      setInput('');

      // eenvoudige debouncer voor snelle, herhaalde input
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = window.setTimeout(() => {
        const reply = routeMessage(text, { userId: user?.id });
        lastIntentRef.current = text;
        if (reply.type === 'gate') {
          push({ role: 'assistant', type: 'gate', text: reply.text });
          track('nova_gate_view');
        } else {
          push({ role: 'assistant', type: 'text', text: reply.text });
        }
      }, 50);
    },
    [push, user?.id, input]
  );

  const handleQuickSuggestion = useCallback(
    (suggestion: string) => {
      track('nova_quick_suggestion_click', { suggestion });
      setInput(suggestion);
      // direct versturen
      handleSend(undefined, suggestion);
    },
    [handleSend]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Suggesties (horizontaal scroll; blijft binnen container) */}
      <div className="shrink-0 px-3 pt-3 pb-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-sm whitespace-nowrap"
              onClick={() => handleQuickSuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Berichten (neemt alle resterende hoogte; scrolt) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right my-2' : 'text-left my-2'}>
            {m.type === 'gate' ? (
              <div className="inline-block max-w-[92%] px-4 py-3 rounded-xl bg-white/10">
                <p className="mb-3">{m.text}</p>
                <a
                  href="/inloggen?returnTo=/feed"
                  onClick={() => track('nova_sign_in_click')}
                  className="inline-flex px-3 py-2 rounded-lg bg-violet-500 hover:bg-violet-600"
                >
                  Log in of maak account
                </a>
                <div className="mt-3 aspect-[4/3] w-64 rounded-lg bg-white/5 grid place-items-center text-white/40">
                  Voorbeeld outfit (blur)
                </div>
              </div>
            ) : (
              <div className="inline-block max-w-[92%] px-3 py-2 rounded-lg bg-white/10">{m.text}</div>
            )}
          </div>
        ))}
      </div>

      {/* Input (altijd binnen kaart; geen overlap) */}
      <form
        onSubmit={(e) => handleSend(e)}
        className="shrink-0 px-3 py-3 bg-white/5 border-t border-white/10 flex gap-2 items-center"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Bijv. 'Zomerse outfit in beige'"
          className="flex-1 px-3 py-2 rounded-lg bg-white/10 outline-none"
        />
        <button type="submit" className="px-3 py-2 rounded-lg bg-violet-500 hover:bg-violet-600">
          Stuur
        </button>
      </form>
    </div>
  );
}

export default NovaChat;