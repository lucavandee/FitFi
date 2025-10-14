import React from 'react';
import { X, ExternalLink, ShoppingBag, Info } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import Button from '@/components/ui/Button';
import { track } from '@/utils/telemetry';
import { buildClickRef, logAffiliateClick, isAffiliateConsentGiven, buildAwinUrl } from '@/utils/affiliate';
import { useUser } from '@/context/UserContext';

interface Product {
  id: string;
  name: string;
  brand?: string;
  imageUrl: string;
  price?: number;
  currency?: string;
  retailer?: string;
  affiliateUrl?: string;
  productUrl?: string;
  category?: string;
  color?: string;
}

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { user } = useUser();

  const handleShopClick = async () => {
    const baseUrl = product.affiliateUrl || product.productUrl;
    if (!baseUrl || baseUrl === '#') return;

    track('product_click', {
      product_id: product.id,
      product_name: product.name,
      retailer: product.retailer,
      price: product.price,
    });

    if (isAffiliateConsentGiven()) {
      const clickRef = buildClickRef({ outfitId: product.id, slot: 1, userId: user?.id });
      const affiliateUrl = buildAwinUrl(baseUrl, clickRef);

      await logAffiliateClick({
        clickRef,
        outfitId: product.id,
        productUrl: affiliateUrl,
        userId: user?.id,
        merchantName: product.retailer,
      });

      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(baseUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const shopUrl = product.affiliateUrl || product.productUrl;
  const hasValidUrl = shopUrl && shopUrl !== '#';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-semibold">Product details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--color-bg)] transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-square rounded-lg overflow-hidden bg-[var(--color-bg)]">
              <SmartImage
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              {product.brand && (
                <p className="text-sm text-[var(--color-text)]/60 mb-2">{product.brand}</p>
              )}
              <h3 className="text-2xl font-bold mb-4">{product.name}</h3>

              {product.price && (
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {product.currency === 'EUR' ? '€' : '$'}
                    {product.price.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {product.category && (
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text)]/70">Categorie</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text)]/70">Kleur</span>
                    <span className="font-medium">{product.color}</span>
                  </div>
                )}
                {product.retailer && (
                  <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text)]/70">Winkel</span>
                    <span className="font-medium capitalize">{product.retailer}</span>
                  </div>
                )}
              </div>

              <div className="mt-auto space-y-3">
                {hasValidUrl ? (
                  <Button
                    onClick={handleShopClick}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Shop bij {product.retailer || 'winkel'}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div className="text-center py-4 text-[var(--color-text)]/60">
                    <p className="text-sm">Product link niet beschikbaar</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-[var(--color-text)]/60 text-center">
                    Je wordt doorgestuurd naar de website van de retailer
                  </p>
                  <p className="flex items-center justify-center gap-1 text-xs text-[var(--color-text)]/60">
                    <Info size={12} className="flex-shrink-0" />
                    <span>
                      Affiliate link.{' '}
                      <a href="/disclosure" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                        Meer info
                      </a>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
