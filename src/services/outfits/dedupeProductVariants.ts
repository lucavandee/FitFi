/**
 * De productfeed (Daisycon) levert elke maat als aparte rij: 1000 rijen zijn
 * ~643 echte producten. Zonder ontdubbeling ziet de engine maatvarianten als
 * verschillende producten, wat kandidaat-tellingen en diversiteit vervuilt en
 * outfits met "twee keer hetzelfde shirt" mogelijk maakt.
 */

// Greedy tot regeleinde: maten kunnen komma's bevatten ("Maat 44,5") of ranges ("Maat 6-7Y")
const SIZE_SUFFIX = /,\s*Maat\s+.+$/i;

export function productVariantKey(name: string): string {
  return name.replace(SIZE_SUFFIX, "").trim();
}

const sizeFromName = (name: string): string | null => {
  const match = name.match(/,\s*Maat\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

interface VariantLike {
  name?: string;
  gender?: string;
  category?: string;
  price?: number;
  inStock?: boolean;
  sizes?: string[];
}

/**
 * Collapse maat-varianten tot één product per (naam-zonder-maat, gender,
 * categorie). De goedkoopste op-voorraad-variant wint; maten van alle
 * varianten worden samengevoegd in `sizes`.
 */
export function dedupeProductVariants<T extends VariantLike>(products: T[]): T[] {
  const groups = new Map<string, T[]>();

  for (const product of products) {
    const name = product.name ?? "";
    const key = `${productVariantKey(name)}::${product.gender ?? ""}::${product.category ?? ""}`;
    const group = groups.get(key);
    if (group) {
      group.push(product);
    } else {
      groups.set(key, [product]);
    }
  }

  const result: T[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }

    const candidates = group.some((p) => p.inStock !== false)
      ? group.filter((p) => p.inStock !== false)
      : group;
    const winner = candidates.reduce((best, p) =>
      (p.price ?? Infinity) < (best.price ?? Infinity) ? p : best
    );

    const sizes = new Set<string>();
    for (const p of group) {
      for (const s of p.sizes ?? []) sizes.add(s);
      const fromName = sizeFromName(p.name ?? "");
      if (fromName) sizes.add(fromName);
    }

    result.push({ ...winner, sizes: Array.from(sizes) });
  }

  return result;
}
