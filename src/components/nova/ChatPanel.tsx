import React from "react";

/**
 * Legacy component dat vroeger een horizontale balk renderde.
 * We renderen bewust niets om dubbele UI te voorkomen.
 * Als je ooit inline chat wil, geef dan expliciet <ChatPanelInline />.
 */
export default function ChatPanel() {
  return null;
}

// Optioneel: een kleine inline-variant (alleen opzettelijk gebruikt)
export function ChatPanelInline() {
  return (
    <div className="rounded-xl border border-black/10 p-3 text-sm text-gray-600">
      Nova is beschikbaar via de knop rechtsonder.
    </div>
  );
}