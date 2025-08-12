import React from 'react';

/**
 * lazyAny: maakt een React.lazy component die óf de default export neemt,
 * óf de eerste beste named export die op een React component lijkt.
 * Hiermee voorkomen we "Property 'default' is missing" build/runtime issues.
 */
export function lazyAny<TProps = any>(loader: () => Promise<any>) {
  return React.lazy(async () => {
    const mod = await loader();
    const pick =
      mod?.default ??
      Object.values(mod).find((v: any) => typeof v === 'function' || (v && typeof v === 'object' && ('$$typeof' in v || 'render' in v)));
    if (!pick) {
      throw new Error('Lazy page/module has no component export (default or named).');
    }
    return { default: pick as React.ComponentType<TProps> };
  });
}