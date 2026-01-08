import React, { useState } from 'react';
import { X, ExternalLink, ShoppingBag, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductImage } from '@/components/ui/ProductImage';
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
  const [isOpening, setIsOpening] = useState(false);

  const handleShopClick = async () => {
    const baseUrl = product.affiliateUrl || product.productUrl;

    if (!baseUrl || baseUrl === '#') {
      toast.error('Shoplink niet beschikbaar', {
        description: 'Deze retailer biedt momenteel geen online shoplink aan.',
        icon: '🛍️',
      });
      return;
    }

    setIsOpening(true);

    try {
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

      toast.success('Product opent in nieuw tabblad', {
        icon: '🛍️',
      });
    } catch (error) {
      console.error('Error opening shop link:', error);
      toast.error('Kon shoplink niet openen', {
        description: 'Probeer het opnieuw of gebruik de directe link.',
      });
    } finally {
      setIsOpening(false);
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
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              productName={product.name}
              brand={product.brand}
              color={product.color}
              category={product.category}
              aspectRatio="1/1"
              className="w-full"
            />

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
                    disabled={isOpening}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    aria-label={`Shop ${product.name} bij ${product.retailer || 'winkel'}`}
                    aria-busy={isOpening}
                  >
                    {isOpening ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Opent...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Shop bij {product.retailer || 'winkel'}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center py-6 px-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800 font-medium mb-1">
                      Shopfunctie komt binnenkort beschikbaar
                    </p>
                    <p className="text-xs text-amber-700">
                      Deze retailer biedt momenteel geen online shoplink aan
                    </p>
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
