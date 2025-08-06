/**
 * Nova LLM Service
 * Handles communication with Nova AI chat backend
 */

import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  function_call?: {
    name: string;
    arguments: any;
  };
  function_response?: any;
}

export interface NovaResponse {
  message: ChatMessage;
  function_calls?: FunctionCall[];
  memories_used?: number;
  context?: string;
}

export interface FunctionCall {
  name: string;
  arguments: any;
  response?: any;
}

export interface OutfitRecommendation {
  id: string;
  title: string;
  description: string;
  image_url: string;
  match_percentage: number;
  products: Array<{
    id: string;
    name: string;
    brand: string;
    price: number;
    image_url: string;
    affiliate_url: string;
  }>;
}

export class NovaLLMService {
  private static instance: NovaLLMService;
  
  static getInstance(): NovaLLMService {
    if (!NovaLLMService.instance) {
      NovaLLMService.instance = new NovaLLMService();
    }
    return NovaLLMService.instance;
  }

  /**
   * Send message to Nova and get response
   */
  async sendMessage(
    messages: ChatMessage[],
    context: 'onboarding' | 'results' | 'general' = 'general',
    userProfile?: any
  ): Promise<NovaResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('nova-chat', {
        body: {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            function_call: m.function_call
          })),
          context,
          user_profile: userProfile
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      // Process function calls if any
      const processedResponse = await this.processFunctionCalls(data);

      return {
        message: {
          id: `nova_${Date.now()}`,
          role: 'assistant',
          content: processedResponse.message.content,
          timestamp: Date.now(),
          function_call: processedResponse.message.function_call
        },
        function_calls: processedResponse.function_calls,
        memories_used: data.memories_used,
        context: data.context
      };
    } catch (error) {
      console.error('Nova LLM error:', error);
      
      // Fallback response
      return {
        message: {
          id: `nova_fallback_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, ik heb even een technisch probleem. Probeer het opnieuw! 🔧',
          timestamp: Date.now()
        }
      };
    }
  }

  /**
   * Process function calls from Nova
   */
  private async processFunctionCalls(response: any): Promise<{
    message: any;
    function_calls?: FunctionCall[];
  }> {
    const functionCalls: FunctionCall[] = [];

    if (response.message.function_call) {
      const { name, arguments: args } = response.message.function_call;
      
      try {
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
        let functionResponse: any = null;

        switch (name) {
          case 'recommend_outfits':
            functionResponse = await this.handleRecommendOutfits(parsedArgs);
            break;
          case 'explain_choice':
            functionResponse = await this.handleExplainChoice(parsedArgs);
            break;
          case 'suggest_accessories':
            functionResponse = await this.handleSuggestAccessories(parsedArgs);
            break;
          default:
            console.warn(`Unknown function call: ${name}`);
        }

        functionCalls.push({
          name,
          arguments: parsedArgs,
          response: functionResponse
        });

        // Update message content with function response
        if (functionResponse) {
          response.message.content += this.formatFunctionResponse(name, functionResponse);
        }

      } catch (error) {
        console.error(`Error processing function call ${name}:`, error);
      }
    }

    return {
      message: response.message,
      function_calls: functionCalls.length > 0 ? functionCalls : undefined
    };
  }

  /**
   * Handle outfit recommendations function call
   */
  private async handleRecommendOutfits(args: {
    occasion?: string;
    style_preference?: string;
    count?: number;
  }): Promise<OutfitRecommendation[]> {
    try {
      // Mock outfit recommendations
      // In production, this would call the recommendation engine
      const mockOutfits: OutfitRecommendation[] = [
        {
          id: 'outfit_1',
          title: 'Elegant Werk Outfit',
          description: 'Professionele look met moderne twist',
          image_url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
          match_percentage: 92,
          products: [
            {
              id: 'blazer_1',
              name: 'Klassieke Blazer',
              brand: 'Zara',
              price: 89.99,
              image_url: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=2',
              affiliate_url: 'https://www.zalando.nl/zara-blazer'
            }
          ]
        },
        {
          id: 'outfit_2',
          title: 'Casual Chic Look',
          description: 'Moeiteloze elegantie voor dagelijks',
          image_url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
          match_percentage: 88,
          products: [
            {
              id: 'jeans_1',
              name: 'High-Waist Jeans',
              brand: 'Weekday',
              price: 69.99,
              image_url: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=2',
              affiliate_url: 'https://www.asos.com/weekday-jeans'
            }
          ]
        },
        {
          id: 'outfit_3',
          title: 'Urban Street Style',
          description: 'Stoere stadslook met attitude',
          image_url: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
          match_percentage: 85,
          products: [
            {
              id: 'hoodie_1',
              name: 'Oversized Hoodie',
              brand: 'Champion',
              price: 49.99,
              image_url: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=2',
              affiliate_url: 'https://www.zalando.nl/champion-hoodie'
            }
          ]
        }
      ];

      return mockOutfits.slice(0, args.count || 3);
    } catch (error) {
      console.error('Error generating outfit recommendations:', error);
      return [];
    }
  }

  /**
   * Handle explain choice function call
   */
  private async handleExplainChoice(args: {
    item_type: string;
    reasoning_type: string;
  }): Promise<string> {
    const explanations = [
      'Deze keuze past perfect bij jouw persoonlijkheid omdat de kleuren en stijl jouw natuurlijke uitstraling versterken.',
      'De pasvorm en details van dit item zijn speciaal geselecteerd om jouw lichaamsbouw te flatteren.',
      'Deze combinatie werkt zo goed omdat het jouw stijlvoorkeuren perfect balanceert met praktische draagbaarheid.'
    ];

    return explanations[Math.floor(Math.random() * explanations.length)];
  }

  /**
   * Handle suggest accessories function call
   */
  private async handleSuggestAccessories(args: {
    outfit_style: string;
    occasion: string;
  }): Promise<Array<{
    id: string;
    name: string;
    type: string;
    image_url: string;
    price: number;
  }>> {
    const mockAccessories = [
      {
        id: 'bag_1',
        name: 'Minimalist Crossbody Bag',
        type: 'bag',
        image_url: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        price: 79.99
      },
      {
        id: 'watch_1',
        name: 'Classic Gold Watch',
        type: 'watch',
        image_url: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        price: 149.99
      },
      {
        id: 'necklace_1',
        name: 'Delicate Chain Necklace',
        type: 'jewelry',
        image_url: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        price: 39.99
      }
    ];

    return mockAccessories;
  }

  /**
   * Format function response for display
   */
  private formatFunctionResponse(functionName: string, response: any): string {
    switch (functionName) {
      case 'recommend_outfits':
        if (Array.isArray(response) && response.length > 0) {
          return ` Ik heb ${response.length} perfecte outfits voor je gevonden!`;
        }
        break;
      case 'explain_choice':
        return ` ${response}`;
      case 'suggest_accessories':
        if (Array.isArray(response) && response.length > 0) {
          return ` Ik heb ${response.length} accessoires die perfect bij je passen!`;
        }
        break;
    }
    return '';
  }

  /**
   * Get conversation history for user
   */
  async getConversationHistory(userId: string, limit: number = 20): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error loading conversation history:', error);
        return [];
      }

      return (data || []).reverse().map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime(),
        function_call: msg.function_call,
        function_response: msg.function_response
      }));
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  }

  /**
   * Clear conversation history for user
   */
  async clearConversationHistory(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing conversation history:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error clearing conversation history:', error);
      return false;
    }
  }
}

export const novaLLM = NovaLLMService.getInstance();
export default novaLLM;