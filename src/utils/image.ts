import { hashString } from "./hash";
import {
  IMAGE_WIDTHS,
  IMAGE_DOMAINS,
  USE_NETLIFY_IMAGE_CDN,
} from "./imageConfig";

export type ImageKind = "product" | "outfit" | "avatar" | "nova" | "generic";

export function normalizeUrl(src?: string | null): string | undefined {
  if (!src) return;
  try {
    const u = new URL(
      src,
      typeof window !== "undefined"
        ? window.location.origin
        : "https://fitfi.ai",
    );
    if (u.protocol === "http:") u.protocol = "https:";
    return u.toString();
  } catch {
    return src;
  }
}

function brandHue(i: number) {
  const hues = [198, 210, 222, 230, 192, 204];
  return hues[i % hues.length];
}
export function fallbackDataUrl(
  id: string,
  kind: ImageKind,
  w = 480,
  h = 640,
): string {
  const seed = hashString(`${kind}:${id}`);
  const c1 = `hsl(${brandHue(seed)} 70% 50%)`;
  const c2 = `hsl(${brandHue(seed >> 1)} 70% 42%)`;
  const label =
    kind === "nova" ? "Nova" : kind[0].toUpperCase() + kind.slice(1);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
    <stop offset='0%' stop-color='${c1}'/><stop offset='100%' stop-color='${c2}'/></linearGradient></defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
      fill='white' font-family='Montserrat, Arial, sans-serif' font-weight='700' font-size='28'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function toCdn(url?: string, w?: number) {
  if (!url) return undefined;
  if (!USE_NETLIFY_IMAGE_CDN) return url;
  try {
    const u = new URL(url);
    if (!IMAGE_DOMAINS.includes(u.hostname)) return url; // alleen whitelisted domeinen
  } catch {
    return url;
  }
  const width = w && Number.isFinite(w) ? Number(w) : undefined;
  const params = new URLSearchParams({ url });
  if (width) params.set("w", String(width));
  return `/.netlify/images?${params.toString()}`;
}

export function buildSrcSet(url?: string) {
  const u = normalizeUrl(url);
  if (!u) return undefined;
  const entries = IMAGE_WIDTHS.map((w) => `${toCdn(u, w)} ${w}w`);
  return entries.join(", ");
}
