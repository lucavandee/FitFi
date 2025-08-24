export function stableKey(obj: any): string {
  return String(
    obj?.id ??
      obj?.slug ??
      obj?.uuid ??
      obj?.sku ??
      obj?.name ??
      obj?.title ??
      JSON.stringify(obj),
  );
}
