export const IMAGE_WIDTHS = [160, 240, 320, 480, 640, 768, 960, 1200];
export const IMAGE_DOMAINS = [
  'images.unsplash.com', 'cdn.shopify.com', 'static.zalando.de', 'static.zalando.nl',
  'm.media-amazon.com', 'img.ltwebstatic.com', 'res.cloudinary.com',
];
export const USE_NETLIFY_IMAGE_CDN =
  (import.meta.env.VITE_USE_NETLIFY_IMAGE_CDN ?? 'true').toString().toLowerCase() !== 'false';