// /src/lib/links/resolver.ts
/**
 * Eenvoudige affiliate/merchant linkresolver.
 * Houdt alle URL-sjablonen op één plek en voegt optioneel een partner-id toe.
 * Geen netwerkcalls, geen secrets in code — alleen VITE_* env-var toegestaan.
 */
type Merchant = "lululemon" | "cos" | "arket" | "other";

const TEMPLATES: Record<Merchant, (sku: string, partnerId?: string) => string> = {
  lululemon: (sku, pid) => `https://shop.lululemon.com/p/${sku}${pid ? `?aff=${pid}` : ""}`,
  cos:       (sku, pid) => `https://www.cos.com/en_eur/p/${sku}${pid ? `?aff=${pid}` : ""}`,
  arket:     (sku, pid) => `https://www.arket.com/en_eur/p/${sku}${pid ? `?aff=${pid}` : ""}`,
  other:     (sku, pid) => `https://example.com/p/${sku}${pid ? `?aff=${pid}` : ""}`,
};

export function resolveProductUrl(merchant: Merchant, sku: string): string {
  const pid = import.meta.env.VITE_AFFILIATE_PARTNER_ID as string | undefined;
  const builder = TEMPLATES[merchant] ?? TEMPLATES.other;
  return builder(sku, pid);
}