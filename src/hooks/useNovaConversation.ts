import { useEffect, useState, useCallback } from 'react';
import { conversationService, NovaMessage } from '@/services/nova/conversationService';

export function useNovaConversation() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<NovaMessage[]>([]);

  useEffect(() => {
    const loadConversation = async () => {
      setIsLoading(true);
      try {
        const conversation = await conversationService.getOrCreateConversation();
        if (conversation) {
          setConversationId(conversation.id);
          setHistory(conversation.messages);
        }
      } catch (error) {
        console.error('[useNovaConversation] Error loading conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, []);

  const addMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    const success = await conversationService.addMessage(role, content);
    if (success) {
      const recentMessages = await conversationService.getRecentMessages(20);
      setHistory(recentMessages);
    }
    return success;
  }, []);

  const clearConversation = useCallback(async () => {
    const success = await conversationService.clearConversation();
    if (success) {
      setHistory([]);
    }
    return success;
  }, []);

  const refreshHistory = useCallback(async () => {
    const recentMessages = await conversationService.getRecentMessages(20);
    setHistory(recentMessages);
  }, []);

  return {
    conversationId,
    history,
    isLoading,
    addMessage,
    clearConversation,
    refreshHistory,
  };
}
