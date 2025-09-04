import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type GradientTextProps = {
  text?: string | string[] | ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

function toPlainString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(toPlainString).join(" ");
  try { return String(v); } catch { return ""; }
}

/** Named export die legacy imports ondersteunt */
export function GradientTextLine({
  text,
  className = "",
  as = "span",
}: GradientTextProps) {
  const Tag = as as any;
  const content = toPlainString(text);
  return (
    <Tag
      className={cn(
        "bg-gradient-to-r from-[#0D1B2A] via-[#89CFF0] to-[#0D1B2A] bg-clip-text text-transparent",
        className
      )}
    >
      {content}
    </Tag>
  );
}

/** Named export voor wie `import { GradientText }` gebruikt */
export function GradientText(props: GradientTextProps) {
  return <GradientTextLine {...props} />;
}

/** Default export voor `import GradientText from ...` */
export default function GradientTextDefault(props: GradientTextProps) {
  return <GradientTextLine {...props} />;
}