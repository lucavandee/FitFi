// src/components/ai/NovaLauncher.tsx
import React from "react";
import Button from "@/components/ui/Button";
import { useNovaChat } from "@/components/nova/NovaChatProvider";
import { MessageCircle } from "lucide-react";

/**
 * Standaard renderen we GEEN inline knop meer (voorkomt horizontale balken).
 * Gebruik <NovaLauncher inline /> als je bewust een knop in content wilt tonen.
 */
export default function NovaLauncher({ inline = false }: { inline?: boolean }) {
  const nova = useNovaChat();
  if (!inline) return null;

  return (
    <Button
      variant="primary"
      icon={<MessageCircle size={16} />}
      iconPosition="left"
      onClick={nova.open}
    >
      Open Nova
    </Button>
  );
}