// Minimale types zodat imports bestaan; vervang later met echte engine-exports.
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Product = { id: string; title: string };
export type Outfit = { id: string; products?: Product[] };