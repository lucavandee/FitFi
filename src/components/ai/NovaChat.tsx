import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Sparkles, Heart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { saveUserFeedback, processRealtimeFeedback } from '../../engine/recommendationEngine';
import { generateNovaStyleTips } from '../../engine/explainOutfit';
import { Outfit } from '../../engine/types';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';

interface NovaChatProps {
  currentOutfits?: Outfit[];
  onOutfitUpdate?: (outfits: Outfit[]) => void;
  context?: 'onboarding' | 'results' | 'general';
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'nova' | 'user';
  content: string;
  timestamp: number;
  outfit?: Outfit;
  feedback?: 'like' | 'dislike';
}

const NovaChat: React.FC<NovaChatProps> = ({
  currentOutfits = [],
  onOutfitUpdate,
  context = 'general',
  className = ''
}) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(() => {
    // Auto-open for first-time visitors
    return !localStorage.getItem('novaSeen');
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with Nova's greeting
    if (messages.length === 0) {
      initializeChat();
    }
  }, [context]);

  useEffect(() => {
    // Mark Nova as seen when chat opens
    if (isOpen && !localStorage.getItem('novaSeen')) {
      localStorage.setItem('novaSeen', 'true');
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    const greetings = {
      onboarding: `Hoi! Ik ben Nova, jouw persoonlijke AI-stylist. Ik help je ontdekken welke stijl echt bij je past. Laten we beginnen! ✨`,
      results: `Geweldig! Ik heb je stijlprofiel geanalyseerd en deze outfits speciaal voor jou samengesteld. Wat vind je ervan?`,
      general: `Hoi! Ik ben Nova. Heb je vragen over stijl of wil je nieuwe outfit-ideeën? Ik help je graag! 💫`
    };

    const initialMessage: ChatMessage = {
      id: `nova_${Date.now()}`,
      type: 'nova',
      content: greetings[context],
      timestamp: Date.now()
    };

    setMessages([initialMessage]);

    // Add style tips after a delay
    setTimeout(() => {
      if (user) {
        const tips = generateNovaStyleTips(user, context);
        const tipMessage: ChatMessage = {
          id: `nova_tip_${Date.now()}`,
          type: 'nova',
          content: tips[Math.floor(Math.random() * tips.length)],
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, tipMessage]);
      }
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOutfitFeedback = async (outfit: Outfit, feedbackType: 'like' | 'dislike') => {
    if (!user) return;

    // Add user feedback message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: feedbackType === 'like' ? '👍 Ik vind deze outfit leuk!' : '👎 Deze outfit is niet mijn stijl',
      timestamp: Date.now(),
      outfit,
      feedback: feedbackType
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Process feedback and get updated recommendations
      const result = await processRealtimeFeedback(
        {
          user_id: user.id,
          item_id: outfit.id,
          item_type: 'outfit',
          feedback_type: feedbackType,
          context: {
            archetype: outfit.archetype,
            occasion: outfit.occasion,
            matchPercentage: outfit.matchPercentage
          }
        },
        currentOutfits
      );

      // Update outfits if callback provided
      if (onOutfitUpdate) {
        onOutfitUpdate(result.updatedOutfits);
      }

      // Generate Nova's response
      setTimeout(() => {
        const responses = {
          like: [
            `Geweldig! Ik zie dat je van ${outfit.archetype.replace('_', ' ')} stijl houdt. Ik ga meer vergelijkbare outfits voor je zoeken! 🎉`,
            `Perfect! Deze ${outfit.occasion.toLowerCase()} look past inderdaad goed bij je. Ik heb je voorkeuren bijgewerkt.`,
            `Mooi! Ik leer van je keuzes. Verwacht meer outfits in deze stijl! ✨`
          ],
          dislike: [
            `Geen probleem! Iedereen heeft andere voorkeuren. Ik ga andere stijlen voor je proberen.`,
            `Bedankt voor je feedback! Ik pas mijn aanbevelingen aan zodat ze beter bij je passen.`,
            `Genoteerd! Ik leer van elke reactie om betere matches te vinden. 🎯`
          ]
        };

        const responseOptions = responses[feedbackType];
        const response = responseOptions[Math.floor(Math.random() * responseOptions.length)];

        const novaResponse: ChatMessage = {
          id: `nova_response_${Date.now()}`,
          type: 'nova',
          content: response,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, novaResponse]);
        setIsTyping(false);

        // Add new recommendations if available
        if (result.newRecommendations.length > 0) {
          setTimeout(() => {
            const recMessage: ChatMessage = {
              id: `nova_rec_${Date.now()}`,
              type: 'nova',
              content: `Gebaseerd op je feedback heb ik ${result.newRecommendations.length} nieuwe aanbevelingen voor je! 🔥`,
              timestamp: Date.now()
            };
            setMessages(prev => [...prev, recMessage]);
          }, 1000);
        }
      }, 1500);

    } catch (error) {
      console.error('Error processing feedback:', error);
      setIsTyping(false);
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isNova = message.type === 'nova';

    return (
      <div
        key={message.id}
        className={`flex ${isNova ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}
      >
        <div className={`max-w-[80%] ${isNova ? 'order-2' : 'order-1'}`}>
          {/* Avatar */}
          {isNova && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#89CFF0]">Nova</span>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`rounded-2xl px-4 py-3 ${
              isNova
                ? 'bg-gradient-to-r from-[#89CFF0]/10 to-blue-50 text-gray-800'
                : 'bg-[#89CFF0] text-white'
            }`}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
            
            {/* Outfit Preview */}
            {message.outfit && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-16 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={message.outfit.imageUrl || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=2'}
                      alt={message.outfit.title}
                      className="w-full h-full object-cover"
                      componentName="NovaChat"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{message.outfit.title}</h4>
                    <p className="text-gray-600 text-xs">{message.outfit.matchPercentage}% match</p>
                  </div>
                </div>

                {/* Feedback Buttons */}
                {isNova && !message.feedback && (
                  <div className="flex space-x-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOutfitFeedback(message.outfit!, 'like')}
                      icon={<ThumbsUp size={12} />}
                      iconPosition="left"
                      className="flex-1 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      Leuk!
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOutfitFeedback(message.outfit!, 'dislike')}
                      icon={<ThumbsDown size={12} />}
                      iconPosition="left"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Niet mijn stijl
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-1 ${isNova ? 'text-left' : 'text-right'}`}>
            {new Date(message.timestamp).toLocaleTimeString('nl-NL', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Chat Toggle Button */}
      <button
        id="nova-ai-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-70 w-14 h-14 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'scale-110' : 'hover:scale-110'
        }`}
        aria-label="Chat met Nova"
      >
        <MessageCircle className="h-7 w-7 text-white" />
        {messages.length > 1 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{messages.length - 1}</span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-70 w-80 h-96 bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#89CFF0]/10 to-blue-50 rounded-t-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Nova AI</h3>
                <p className="text-sm text-gray-600">Jouw persoonlijke stylist</p>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(renderMessage)}
            
            {/* Typing Indicator */}
            {isTyping && (
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

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tip = generateNovaStyleTips(user || {} as any, context)[0];
                  const tipMessage: ChatMessage = {
                    id: `nova_tip_${Date.now()}`,
                    type: 'nova',
                    content: tip,
                    timestamp: Date.now()
                  };
                  setMessages(prev => [...prev, tipMessage]);
                }}
                className="text-xs border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                💡 Stijltip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const helpMessage: ChatMessage = {
                    id: `nova_help_${Date.now()}`,
                    type: 'nova',
                    content: 'Ik kan je helpen met outfit-keuzes, stijladvies en het uitleggen van mijn aanbevelingen. Geef feedback op outfits zodat ik beter kan leren wat je leuk vindt!',
                    timestamp: Date.now()
                  };
                  setMessages(prev => [...prev, helpMessage]);
                }}
                className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                ❓ Help
              </Button>
            </div>
            
            <div className="text-center">
              <span className="text-xs text-gray-500">
                Nova leert van je feedback om betere aanbevelingen te doen
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovaChat;