type Partner = 'zalando'|'amazon'|'bol';

const UTM = 'utm_source=fitfi&utm_medium=ai&utm_campaign=nova';

export function buildDeeplink(partner: Partner, q: string) {
  const query = encodeURIComponent(q.trim());
  switch (partner) {
    case 'zalando':
      // generieke zoek-URL
      return `https://www.zalando.nl/catalog/?q=${query}&${UTM}`;
    case 'amazon': {
      const tag = import.meta.env.VITE_AMAZON_TAG ? `&tag=${encodeURIComponent(import.meta.env.VITE_AMAZON_TAG)}` : '';
      return `https://www.amazon.nl/s?k=${query}${tag}&${UTM}`;
    }
    case 'bol':
      return `https://www.bol.com/nl/nl/s/?searchtext=${query}&${UTM}`;
    default:
      return `https://www.google.com/search?q=${query}+kleding`;
  }
}

export function getDefaultPartner(): Partner {
  const p = (import.meta.env.VITE_DEFAULT_SHOP_PARTNER || 'zalando').toLowerCase();
  return (['zalando','amazon','bol'].includes(p) ? (p as Partner) : 'zalando');
}