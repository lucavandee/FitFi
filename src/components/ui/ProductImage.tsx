import { SmartFallbackImage } from './SmartFallbackImage';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  productName?: string;
  brand?: string;
  color?: string;
  category?: string;
  type?: string;
  className?: string;
  aspectRatio?: '1/1' | '3/4' | '4/3' | '16/9';
  onClick?: () => void;
}

export function ProductImage({
  src,
  alt,
  productName,
  brand = '',
  color,
  category,
  type,
  className = '',
  aspectRatio = '3/4',
  onClick,
}: ProductImageProps) {
  const effectiveCategory = category || type || 'product';

  const displayName = productName || alt;
  const effectiveColor = color || extractColorFromName(displayName);

  return (
    <div className={`group cursor-pointer relative ${className}`} onClick={onClick}>
      <SmartFallbackImage
        src={src}
        alt={alt}
        category={effectiveCategory}
        color={effectiveColor}
        productName={displayName}
        aspectRatio={aspectRatio}
        className="rounded-lg overflow-hidden"
        fallbackClassName="shadow-inner"
      />

      {brand && brand.toLowerCase().includes('brams') && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs font-medium text-gray-700">
            Brams Fruit
          </span>
        </div>
      )}
    </div>
  );
}

function extractColorFromName(name: string): string {
  const colorPatterns = [
    /\b(black|navy|blue|midnight blue|light blue|green|grey|gray|white|red|brown|khaki|beige|olive)\b/i,
    /-\s*([^-]+)$/,
  ];

  for (const pattern of colorPatterns) {
    const match = name.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return 'neutral';
}
