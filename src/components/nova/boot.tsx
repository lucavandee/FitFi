// Nova Chat initialization
// This file is imported in main.tsx to ensure Nova globals are available

declare global {
  interface Window {
    NovaChat?: {
      version: string;
      initialized: boolean;
    };
  }
}

// Initialize Nova globals
if (typeof window !== "undefined") {
  window.NovaChat = {
    version: "1.0.0",
    initialized: true,
  };
}

export {};