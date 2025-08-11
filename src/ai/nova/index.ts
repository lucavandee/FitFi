// src/ai/nova/index.ts
// Barrel export voor Nova AI module

// Default export as named export
export { default as novaAgent } from './agent';

// Re-export all types and functions
export * from './agent';

// Re-export loader utilities
export * from './load';

// Re-export lexicon
export * from './nl-lexicon';