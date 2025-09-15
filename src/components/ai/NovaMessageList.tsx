// src/components/ai/NovaMessageList.tsx

import React, { memo } from "react";
import type { ChatMessage } from "./types";

type Props = {
  messages: ChatMessage[];
  streamingText?: string; // lopende assistant-stream
};

const Bubble: React.FC<{ role: "user" | "assistant"; children: React.ReactNode }> = ({ role, children }) => {
  const isUser = role === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl border border-ui shadow-soft ${
          isUser ? "bg-surface" : "bg-surface"
        }`}
        role="text"
      >
        <p className="text-ink whitespace-pre-wrap leading-relaxed">{children}</p>
      </div>
    </div>
  );
};

const NovaMessageList: React.FC<Props> = ({ messages, streamingText }) => {
  return (
    <div className="w-full">
      {messages.map((m) => (
        <Bubble key={m.id} role={m.role === "assistant" ? "assistant" : "user"}>
          {m.content}
        </Bubble>
      ))}
      {typeof streamingText === "string" && streamingText.length > 0 && (
        <Bubble role="assistant">
          {streamingText}
          <span className="inline-block align-baseline ml-1 skeleton w-3 h-4 rounded-sm" aria-hidden="true" />
        </Bubble>
      )}
    </div>
  );
};

export default memo(NovaMessageList);