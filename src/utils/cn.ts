// Utility: combineer classNames met truthy filtering
export default function cn(): string {
  const parts = Array.from(arguments) as Array<string | false | null | undefined>;
  return parts.filter(Boolean).join(" ");
}

export { cn }