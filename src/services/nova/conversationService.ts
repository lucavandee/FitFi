import { supabase } from "@/lib/supabaseClient";

export interface NovaMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface NovaConversation {
  id: string;
  user_id?: string;
  session_id?: string;
  messages: NovaMessage[];
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class ConversationService {
  private currentConversationId: string | null = null;

  async getOrCreateConversation(): Promise<NovaConversation | null> {
    const client = supabase();
    if (!client) return null;

    try {
      const { data: { user } } = await client.auth.getUser();
      const sessionId = localStorage.getItem('ff_session_id') || crypto.randomUUID();

      if (!localStorage.getItem('ff_session_id')) {
        localStorage.setItem('ff_session_id', sessionId);
      }

      const query = user
        ? client.from('nova_conversations').select('*').eq('user_id', user.id)
        : client.from('nova_conversations').select('*').eq('session_id', sessionId);

      const { data, error } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('[ConversationService] Error fetching conversation:', error);
        return null;
      }

      if (data) {
        this.currentConversationId = data.id;
        return data as NovaConversation;
      }

      const newConversation = {
        user_id: user?.id || null,
        session_id: !user ? sessionId : null,
        messages: [],
        context: this.getQuizContext(),
      };

      const { data: created, error: createError } = await client
        .from('nova_conversations')
        .insert(newConversation)
        .select()
        .single();

      if (createError) {
        console.error('[ConversationService] Error creating conversation:', createError);
        return null;
      }

      this.currentConversationId = created.id;
      return created as NovaConversation;
    } catch (error) {
      console.error('[ConversationService] Exception in getOrCreateConversation:', error);
      return null;
    }
  }

  async addMessage(role: 'user' | 'assistant', content: string): Promise<boolean> {
    const client = supabase();
    if (!client || !this.currentConversationId) return false;

    try {
      const conversation = await this.getOrCreateConversation();
      if (!conversation) return false;

      const newMessage: NovaMessage = {
        role,
        content,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...conversation.messages, newMessage];
      const messagesToKeep = updatedMessages.slice(-20);

      const { error } = await client
        .from('nova_conversations')
        .update({ messages: messagesToKeep })
        .eq('id', this.currentConversationId);

      if (error) {
        console.error('[ConversationService] Error adding message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[ConversationService] Exception in addMessage:', error);
      return false;
    }
  }

  async getRecentMessages(limit = 10): Promise<NovaMessage[]> {
    const conversation = await this.getOrCreateConversation();
    if (!conversation) return [];

    return conversation.messages.slice(-limit);
  }

  async clearConversation(): Promise<boolean> {
    const client = supabase();
    if (!client || !this.currentConversationId) return false;

    try {
      const { error } = await client
        .from('nova_conversations')
        .update({ messages: [], context: this.getQuizContext() })
        .eq('id', this.currentConversationId);

      if (error) {
        console.error('[ConversationService] Error clearing conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[ConversationService] Exception in clearConversation:', error);
      return false;
    }
  }

  private getQuizContext(): Record<string, any> {
    try {
      const quizAnswers = localStorage.getItem('ff_quiz_answers');
      const archetype = localStorage.getItem('ff_archetype');
      const colorProfile = localStorage.getItem('ff_color_profile');

      return {
        quizAnswers: quizAnswers ? JSON.parse(quizAnswers) : null,
        archetype: archetype ? JSON.parse(archetype) : null,
        colorProfile: colorProfile ? JSON.parse(colorProfile) : null,
      };
    } catch (error) {
      console.error('[ConversationService] Error getting quiz context:', error);
      return {};
    }
  }

  reset(): void {
    this.currentConversationId = null;
  }
}

export const conversationService = new ConversationService();
