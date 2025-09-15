// src/components/ai/types.ts

export type NovaHeartbeat = { type: "heartbeat"; ts: number };

export type NovaDelta = { type: "delta"; delta: string; ts?: number };

export type NovaComplete = {
  type: "complete";
  message: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  ts?: number;
};

export type NovaError = {
  type: "error";
  message: string;
  code?: string | number;
  ts?: number;
};

export type NovaInfo =
  | { type: "nova:open"; ts?: number }
  | { type: "nova:prefill"; value?: string; ts?: number }
  | { type: "nova:set-context"; context?: Record<string, unknown>; ts?: number }
  | { type: "nova:prompt-login"; ts?: number };

export type NovaEvent = NovaHeartbeat | NovaDelta | NovaComplete | NovaError | NovaInfo;

/** Chat message model for UI */
export type ChatRole = "user" | "assistant" | "system";
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  ts: number;
};

export type NovaRequest = {
  prompt: string;
  context?: Record<string, unknown>;
  messages?: Array<{ role: ChatRole; content: string }>;
  // Extra velden kunnen door je functie worden genegeerd:
  [key: string]: unknown;
};

export type NovaHeaders = {
  "x-fitfi-tier"?: string;
  "x-fitfi-uid"?: string;
};

/** Minimal analytics-safe tracker (no-op als niets aanwezig) */
export function track(event: string, payload?: Record<string, unknown>) {
  const w = (globalThis as unknown as { fitfiTrack?: (e: string, p?: Record<string, unknown>) => void }) || {};
  if (typeof w.fitfiTrack === "function") {
    w.fitfiTrack(event, payload);
  } else {
    // rustige fallback zonder lawaai
    // console.debug("[track]", event, payload);
  }
}