import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { novaLLM, ChatMessage, NovaResponse, OutfitRecommendation } from '../services/novaLLM';
import { Outfit } from '../engine/types';

interface UseNovaChatOptions {
  context?: 'onboarding' | 'results' | 'general';
  initialMessages?: ChatMessage[];
  autoLoadHistory?: boolean;
}

interface UseNovaChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  outfitRecommendations: OutfitRecommendation[];
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  retryLastMessage: () => Promise<void>;
}

export function useNovaChat(options: UseNovaChatOptions = {}): UseNovaChatReturn {
  const { user } = useUser();
  const { context = 'general', initialMessages = [], autoLoadHistory = true } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outfitRecommendations, setOutfitRecommendations] = useState<OutfitRecommendation[]>([]);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  // Load conversation history on mount
  useEffect(() => {
    if (user?.id && autoLoadHistory && messages.length === 0) {
      loadConversationHistory();
    }
  }, [user?.id, autoLoadHistory]);

  // Initialize with greeting if no messages
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      initializeChat();
    }
  }, [messages.length, isLoading, context]);

  const loadConversationHistory = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const history = await novaLLM.getConversationHistory(user.id, 20);
      
      if (history.length > 0) {
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeChat = () => {
    const greetings = {
      onboarding: `Hoi! Ik ben Nova, jouw persoonlijke AI-stylist. Ik help je ontdekken welke stijl echt bij je past. Laten we beginnen! ✨`,
      results: `Geweldig! Ik heb je stijlprofiel geanalyseerd en deze outfits speciaal voor jou samengesteld. Wat vind je ervan?`,
      general: `Hoi! Ik ben Nova. Heb je vragen over stijl of wil je nieuwe outfit-ideeën? Ik help je graag! 💫`
    };

    const greeting: ChatMessage = {
      id: `nova_greeting_${Date.now()}`,
      role: 'assistant',
      content: greetings[context],
      timestamp: Date.now()
    };

    setMessages([greeting]);
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(content.trim());
    setIsTyping(true);
    setError(null);

    try {
      // Get user profile for context
      const userProfile = {
        name: user.name,
        gender: user.gender,
        style_preferences: user.stylePreferences
      };

      // Send to Nova
      const response = await novaLLM.sendMessage(
        [...messages, userMessage],
        context,
        userProfile
      );

      // Add Nova's response
      setMessages(prev => [...prev, response.message]);

      // Handle function calls
      if (response.function_calls) {
        for (const functionCall of response.function_calls) {
          if (functionCall.name === 'recommend_outfits' && functionCall.response) {
            setOutfitRecommendations(functionCall.response);
          }
        }
      }

    } catch (error) {
      console.error('Error sending message to Nova:', error);
      setError('Er ging iets mis bij het versturen van je bericht. Probeer het opnieuw.');
      
      // Add error message from Nova
      const errorMessage: ChatMessage = {
        id: `nova_error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, ik heb even een technisch probleem. Kun je je vraag opnieuw stellen? 🔧',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [user, messages, context]);

  const clearHistory = useCallback(async () => {
    if (!user?.id) return;

    try {
      const success = await novaLLM.clearConversationHistory(user.id);
      
      if (success) {
        setMessages([]);
        setOutfitRecommendations([]);
        setError(null);
        
        // Reinitialize with greeting
        setTimeout(() => initializeChat(), 100);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      setError('Kon gesprekgeschiedenis niet wissen');
    }
  }, [user?.id, context]);

  const retryLastMessage = useCallback(async () => {
    if (lastUserMessage) {
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  return {
    messages,
    isLoading,
    isTyping,
    error,
    outfitRecommendations,
    sendMessage,
    clearHistory,
    retryLastMessage
  };
}

export default useNovaChat;