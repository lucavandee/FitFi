import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { fetchUserContext, buildSystemPrompt } from "@/services/nova/userContext";
import {
  fetchEnhancedUserContext,
  buildEnhancedSystemPrompt,
  type EnhancedNovaContext,
} from "@/services/nova/enhancedUserContext";
import { streamChat, type Message } from "@/services/ai/novaService";
import toast from "react-hot-toast";

interface UseEnhancedNovaOptions {
  autoLoadContext?: boolean;
  enableSwipeData?: boolean;
  enableBrandAffinity?: boolean;
  enableConversationHistory?: boolean;
}

export function useEnhancedNova(options: UseEnhancedNovaOptions = {}) {
  const {
    autoLoadContext = true,
    enableSwipeData = true,
    enableBrandAffinity = true,
    enableConversationHistory = true,
  } = options;

  const { user } = useUser();
  const [context, setContext] = useState<EnhancedNovaContext | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Load enhanced context
  const loadContext = useCallback(async () => {
    if (!user) return;

    setIsLoadingContext(true);
    try {
      const baseContext = await fetchUserContext(user.id);
      if (!baseContext) {
        console.warn("[EnhancedNova] No base context found");
        return;
      }

      // Check which enhancements to enable
      if (enableSwipeData || enableBrandAffinity || enableConversationHistory) {
        const enhanced = await fetchEnhancedUserContext(baseContext);
        setContext(enhanced);

        // Show intelligence toast
        const features: string[] = [];
        if (enhanced.recentSwipes) features.push(`${enhanced.recentSwipes.swipeCount} swipes`);
        if (enhanced.brandAffinity) features.push("brand voorkeuren");
        if (enhanced.recentOutfits) features.push(`${enhanced.recentOutfits.length} saved outfits`);
        if (enhanced.conversationHistory)
          features.push(`${enhanced.conversationHistory.length} gesprekken`);

        if (features.length > 0) {
          toast.success(`Nova is klaar! 🧠\nGeladen: ${features.join(", ")}`, {
            duration: 3000,
            icon: "✨",
          });
        }
      } else {
        setContext(baseContext);
      }
    } catch (error) {
      console.error("[EnhancedNova] Error loading context:", error);
      toast.error("Kon Nova context niet laden");
    } finally {
      setIsLoadingContext(false);
    }
  }, [user, enableSwipeData, enableBrandAffinity, enableConversationHistory]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoadContext) {
      loadContext();
    }
  }, [autoLoadContext, loadContext]);

  // Send message with enhanced context
  const sendMessage = useCallback(
    async (content: string) => {
      if (!context) {
        toast.error("Nova context niet beschikbaar");
        return;
      }

      if (isStreaming) {
        console.warn("[EnhancedNova] Already streaming, ignoring message");
        return;
      }

      const userMessage: Message = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);

      // Build enhanced system prompt
      const systemPrompt = buildEnhancedSystemPrompt(context);
      const systemMessage: Message = { role: "system", content: systemPrompt };

      const allMessages = [systemMessage, ...messages, userMessage];

      setIsStreaming(true);

      let assistantContent = "";
      const assistantMessage: Message = { role: "assistant", content: "" };

      try {
        for await (const chunk of streamChat({
          mode: "style",
          messages: allMessages,
          onEvent: (event) => {
            if (event.type === "delta" && event.text) {
              assistantContent += event.text;
              assistantMessage.content = assistantContent;
              setMessages((prev) => {
                const updated = [...prev];
                if (updated[updated.length - 1]?.role === "assistant") {
                  updated[updated.length - 1] = { ...assistantMessage };
                } else {
                  updated.push({ ...assistantMessage });
                }
                return updated;
              });
            }
          },
        })) {
          // Streaming happens in onEvent callback
        }
      } catch (error) {
        console.error("[EnhancedNova] Streaming error:", error);
        toast.error("Nova heeft een fout gemaakt");
        setMessages((prev) =>
          prev.filter((m) => m.role !== "assistant" || m.content.length > 0)
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [context, messages, isStreaming]
  );

  // Clear conversation
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Reload context (useful after swipes or outfit saves)
  const reloadContext = useCallback(async () => {
    await loadContext();
  }, [loadContext]);

  return {
    context,
    messages,
    isLoadingContext,
    isStreaming,
    sendMessage,
    clearMessages,
    reloadContext,
    // Intelligence indicators
    hasSwipeData: !!context?.recentSwipes,
    hasBrandData: !!context?.brandAffinity,
    hasConversationHistory: !!context?.conversationHistory,
    hasRecentOutfits: !!context?.recentOutfits,
  };
}
