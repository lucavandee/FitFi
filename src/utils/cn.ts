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
    else if (typeof v === "object") for (const k in v) if ((v as any)[k]) out.push(k);
  };
  args.forEach(walk);
  return out.join(" ");
}

/** Backwards-compat: maak van string/undefined altijd een array */
export function toArray<T>(v: T | T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : v == null ? [] : [v];
}

/** Vervanger voor patterns als `x.filter(Boolean).join(" ")` */
export function joinClasses(
  list: string | (string | false | null | undefined)[] | null | undefined
): string {
  const arr = toArray(list); // ⚠️ niet "classes" noemen i.v.m. preflight pattern
  const filtered: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v) filtered.push(v);
  }
  return filtered.join(" ");
}