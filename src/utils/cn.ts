// Utility: combineer classNames met truthy filtering
export default function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}