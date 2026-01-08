/**
 * ShopItemsList Component
 *
 * Displays all items from an outfit in a clean list view with shop buttons.
 * Opens in modal or as expandable section in outfit card.
 *
 * Features:
 * - All outfit items listed with images
 * - Shop button per item (opens in new tab)
 * - Loading states
 * - Error handling
 * - Clear feedback for missing links
 * - Affiliate link support
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Check,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductImage } from '@/components/ui/ProductImage';
import Button from '@/components/ui/Button';
import { ShopTooltip } from './InteractionTooltips';
import { track } from '@/utils/telemetry';
import {
  buildClickRef,
  logAffiliateClick,
  isAffiliateConsentGiven,
  buildAwinUrl
} from '@/utils/affiliate';
import { useUser } from '@/context/UserContext';
import { cn } from '@/utils/cn';

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

interface ShopItemsListProps {
  /** List of products in outfit */
  products: Product[];

  /** Outfit ID for tracking */
  outfitId?: string;

  /** Modal mode (vs inline) */
  isModal?: boolean;

  /** Close handler (modal only) */
  onClose?: () => void;

  /** Title override */
  title?: string;

  /** Show empty state if no products */
  showEmpty?: boolean;
}

export function ShopItemsList({
  products,
  outfitId,
  isModal = false,
  onClose,
  title = 'Shop deze look',
  showEmpty = true
}: ShopItemsListProps) {
  const { user } = useUser();
  const [openingProductId, setOpeningProductId] = useState<string | null>(null);

  const handleShopClick = async (product: Product, index: number) => {
    const baseUrl = product.affiliateUrl || product.productUrl;

    if (!baseUrl || baseUrl === '#') {
      toast.error('Shoplink niet beschikbaar', {
        description: `${product.retailer || 'Deze retailer'} biedt momenteel geen online shoplink aan.`,
        icon: '🛍️',
      });
      return;
    }

    setOpeningProductId(product.id);

    try {
      track('product_click', {
        product_id: product.id,
        product_name: product.name,
        retailer: product.retailer,
        price: product.price,
        outfit_id: outfitId,
        position: index,
        source: 'shop_items_list',
      });

      if (isAffiliateConsentGiven()) {
        const clickRef = buildClickRef({
          outfitId: outfitId || product.id,
          slot: index + 1,
          userId: user?.id,
        });
        const affiliateUrl = buildAwinUrl(baseUrl, clickRef);

        await logAffiliateClick({
          clickRef,
          outfitId: outfitId || product.id,
          productUrl: affiliateUrl,
          userId: user?.id,
          merchantName: product.retailer,
        });

        window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.open(baseUrl, '_blank', 'noopener,noreferrer');
      }

      toast.success(`${product.name} opent in nieuw tabblad`, {
        icon: '🛍️',
      });
    } catch (error) {
      console.error('Error opening shop link:', error);
      toast.error('Kon shoplink niet openen', {
        description: 'Probeer het opnieuw of gebruik de directe link.',
      });
    } finally {
      setOpeningProductId(null);
    }
  };

  const content = (
    <div className={cn('space-y-4', isModal && 'p-6')}>
      {/* Header */}
      {isModal && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-bg)] transition-colors"
              aria-label="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 && showEmpty && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-[var(--color-text)]/40" />
          <p className="text-lg font-medium text-[var(--color-text)]/70 mb-1">
            Geen items gevonden
          </p>
          <p className="text-sm text-[var(--color-text)]/50">
            Dit outfit bevat nog geen shopbare items
          </p>
        </div>
      )}

      {/* Products list */}
      {products.map((product, index) => {
        const hasValidUrl = product.affiliateUrl || product.productUrl;
        const isOpening = openingProductId === product.id;

        return (
          <motion.div
            key={product.id}
            className="flex gap-4 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Product Image */}
            <div className="flex-shrink-0">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                productName={product.name}
                brand={product.brand}
                color={product.color}
                category={product.category}
                aspectRatio="1/1"
                className="w-24 h-24 rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              {product.brand && (
                <p className="text-xs text-[var(--color-text)]/60 mb-1">
                  {product.brand}
                </p>
              )}
              <h3 className="font-semibold text-base mb-2 line-clamp-2">
                {product.name}
              </h3>

              <div className="flex items-baseline gap-2 mb-3">
                {product.price && (
                  <span className="text-lg font-bold">
                    {product.currency === 'EUR' ? '€' : '$'}
                    {product.price.toFixed(2)}
                  </span>
                )}
                {product.category && (
                  <span className="text-xs text-[var(--color-text)]/50 capitalize">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Shop Button */}
              {hasValidUrl ? (
                <ShopTooltip>
                  <Button
                    onClick={() => handleShopClick(product, index)}
                    disabled={isOpening}
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    aria-label={`Shop ${product.name} bij ${product.retailer || 'winkel'}`}
                    aria-busy={isOpening}
                  >
                    {isOpening ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Opent...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Shop bij {product.retailer || 'winkel'}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </>
                    )}
                  </Button>
                </ShopTooltip>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>Binnenkort beschikbaar</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Footer info */}
      {products.length > 0 && (
        <div className="pt-4 mt-4 border-t border-[var(--color-border)] space-y-2">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text)]/60">
            <Check className="w-4 h-4 text-green-600" />
            <span>Alle links openen in een nieuw tabblad</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text)]/60">
            <Info className="w-4 h-4" />
            <span>
              Affiliate links.{' '}
              <a
                href="/disclosure"
                className="underline hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Meer info
              </a>
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          className="bg-[var(--color-bg)] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return <div className="w-full">{content}</div>;
}

/**
 * Compact variant showing just the count + button
 */
export function ShopItemsButton({
  products,
  outfitId,
  className
}: {
  products: Product[];
  outfitId?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const availableCount = products.filter(
    (p) => p.affiliateUrl || p.productUrl
  ).length;

  if (products.length === 0) return null;

  return (
    <>
      <ShopTooltip>
        <Button
          onClick={() => setIsOpen(true)}
          variant="secondary"
          size="md"
          className={cn('w-full', className)}
          aria-label={`Shop ${products.length} items uit dit outfit`}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Shop deze look ({availableCount}/{products.length})
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </ShopTooltip>

      <AnimatePresence>
        {isOpen && (
          <ShopItemsList
            products={products}
            outfitId={outfitId}
            isModal={true}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Inline variant (no modal, just list)
 */
export function ShopItemsInline({
  products,
  outfitId,
  title,
  showEmpty = false
}: Omit<ShopItemsListProps, 'isModal' | 'onClose'>) {
  return (
    <ShopItemsList
      products={products}
      outfitId={outfitId}
      isModal={false}
      title={title}
      showEmpty={showEmpty}
    />
  );
}
