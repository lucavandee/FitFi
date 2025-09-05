export default function useAB(key = "default"): "A" | "B" {
  // Simpele, stabiele default
  return (key.length % 2 === 0) ? "A" : "B";
}