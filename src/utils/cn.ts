export type CX =
  | string
  | number
  | null
  | undefined
  | false
  | CX[]
  | Record<string, boolean | undefined | null>;

export function cn(...args: CX[]): string {
  const out: string[] = [];
  const walk = (v: CX) => {
    if (!v) return;
    if (typeof v === "string" || typeof v === "number") out.push(String(v));
    else if (Array.isArray(v)) v.forEach(walk);
    else if (typeof v === "object") {
      for (const k in v) if (v[k]) out.push(k);
    }
  };
  args.forEach(walk);
  return out.join(" ");
}

/** Backwards-compat: maak van string/undefined altijd een array */
export function toArray<T>(v: T | T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : v == null ? [] : [v];
}

/** Voor bestaande patronen `classes.filter(Boolean).join(" ")` */
export function joinClasses(
  classes: string | (string | false | null | undefined)[] | null | undefined
): string {
  return toArray(classes).filter(Boolean).join(" ");
}