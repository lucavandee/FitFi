// Canonical navigation helpers
export function toTribe(id: string) {
  return `/tribes/${encodeURIComponent(id)}`;
}
export function toProduct(productId: string) {
  return `/product/${encodeURIComponent(productId)}`;
}
export function toResults() {
  return `/results`;
}
const NavigationService = { toTribe, toProduct, toResults };
export default NavigationService;