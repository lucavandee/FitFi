export interface ABResult { variant: "A" | "B"; }
export default function useABTesting(key = "default"): ABResult {
  const v: "A" | "B" = (key.length % 2 === 0) ? "A" : "B";
  return { variant: v };
}