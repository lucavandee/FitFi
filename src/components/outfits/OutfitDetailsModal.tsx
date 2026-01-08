import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Info,
  Sparkles,
  ChevronRight,
  Tag,
  Package,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { LazyImage } from '@/components/ui/LazyImage';
import Button from '@/components/ui/Button';
import { track } from '@/utils/telemetry';
import { buildClickRef, logAffiliateClick, isAffiliateConsentGiven, buildAwinUrl } from '@/utils/affiliate';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';
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
  colors?: string[];
  description?: string;
  material?: string;
  sizes?: string[];
  inStock?: boolean;
}

interface OutfitDetailsModalProps {
  outfit: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    matchPercentage?: number;
    archetype?: string;
    occasion?: string;
    tags?: string[];
    products?: Product[];
    totalPrice?: number;
    explanation?: string;
  };
  onClose: () => void;
  onShopProduct?: (product: Product) => void;
}

export default function OutfitDetailsModal({
  outfit,
  onClose,
  onShopProduct
}: OutfitDetailsModalProps) {
  const { user } = useUser();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openingProductId, setOpeningProductId] = useState<string | null>(null);

  const handleShopClick = async (product: Product) => {
    const baseUrl = product.affiliateUrl || product.productUrl;

    if (!baseUrl || baseUrl === '#') {
      toast.error('Shoplink niet beschikbaar', {
        description: 'Deze retailer biedt momenteel geen online shoplink aan.',
        icon: '🛍️',
      });
      return;
    }

    setOpeningProductId(product.id);

    try {
      track('product_click_from_outfit_details', {
        outfit_id: outfit.id,
        product_id: product.id,
        product_name: product.name,
        retailer: product.retailer,
        price: product.price,
      });

      if (isAffiliateConsentGiven()) {
        const clickRef = buildClickRef({ outfitId: outfit.id, slot: 1, userId: user?.id });
        const affiliateUrl = buildAwinUrl(baseUrl, clickRef);

        await logAffiliateClick({
          clickRef,
          outfitId: outfit.id,
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

      if (onShopProduct) {
        onShopProduct(product);
      }
    } catch (error) {
      console.error('Error opening shop link:', error);
      toast.error('Kon shoplink niet openen');
    } finally {
      setOpeningProductId(null);
    }
  };

  const handleShopAllClick = () => {
    if (!outfit.products || outfit.products.length === 0) {
      toast('Geen items beschikbaar');
      return;
    }

    const availableProducts = outfit.products.filter(p => p.affiliateUrl || p.productUrl);

    if (availableProducts.length === 0) {
      toast('Shopfunctie komt binnenkort beschikbaar');
      return;
    }

    track('shop_all_from_outfit_details', {
      outfit_id: outfit.id,
      product_count: availableProducts.length,
    });

    availableProducts.forEach((product, index) => {
      setTimeout(() => {
        handleShopClick(product);
      }, index * 500);
    });

    toast.success(`${availableProducts.length} items openen...`, {
      icon: '🛍️',
    });
  };

  const totalPrice = outfit.totalPrice || outfit.products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;
  const availableProducts = outfit.products?.filter(p => p.affiliateUrl || p.productUrl) || [];
  const allAvailable = availableProducts.length === outfit.products?.length;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Outfit details</h2>
              {outfit.matchPercentage && outfit.matchPercentage > 80 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>{Math.round(outfit.matchPercentage)}%</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-bg)] transition-colors"
              aria-label="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Left: Outfit Image + Info */}
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200">
                  <LazyImage
                    src={outfit.imageUrl}
                    alt={outfit.title}
                    className="w-full h-full object-cover"
                    fallback="/placeholder.png"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">{outfit.title}</h3>
                  <p className="text-[var(--color-text)]/70 leading-relaxed mb-4">
                    {outfit.description}
                  </p>

                  {/* Tags */}
                  {outfit.tags && outfit.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {outfit.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--ff-color-primary-50)] text-[var(--color-primary)] rounded-full text-xs font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Explanation */}
                  {outfit.explanation && (
                    <div className="p-4 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-xl">
                      <div className="flex items-start gap-2 mb-2">
                        <Info className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-[var(--color-primary)]">
                          Waarom dit werkt:
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text)]/80 leading-relaxed">
                        {outfit.explanation}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="p-3 bg-[var(--color-bg)] rounded-xl text-center">
                      <div className="text-2xl font-bold text-[var(--color-primary)]">
                        {outfit.products?.length || 0}
                      </div>
                      <div className="text-xs text-[var(--color-text)]/60">Items</div>
                    </div>
                    <div className="p-3 bg-[var(--color-bg)] rounded-xl text-center">
                      <div className="text-2xl font-bold text-[var(--color-primary)]">
                        {Math.round(outfit.matchPercentage || 75)}%
                      </div>
                      <div className="text-xs text-[var(--color-text)]/60">Match</div>
                    </div>
                    <div className="p-3 bg-[var(--color-bg)] rounded-xl text-center">
                      <div className="text-2xl font-bold text-[var(--color-primary)]">
                        €{totalPrice.toFixed(0)}
                      </div>
                      <div className="text-xs text-[var(--color-text)]/60">Totaal</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Products List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Items in dit outfit</h4>
                  <span className="text-sm text-[var(--color-text)]/60">
                    {availableProducts.length} van {outfit.products?.length || 0} beschikbaar
                  </span>
                </div>

                <div className="space-y-3">
                  {outfit.products && outfit.products.length > 0 ? (
                    outfit.products.map((product, idx) => {
                      const hasUrl = product.affiliateUrl || product.productUrl;
                      const isOpening = openingProductId === product.id;

                      return (
                        <motion.div
                          key={product.id}
                          className={cn(
                            'p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]',
                            'hover:border-[var(--color-primary)] transition-all',
                            hasUrl && 'cursor-pointer'
                          )}
                          onClick={() => hasUrl && setSelectedProduct(product)}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <LazyImage
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                fallback="/placeholder.png"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                  {product.brand && (
                                    <p className="text-xs text-[var(--color-text)]/60 mb-0.5">
                                      {product.brand}
                                    </p>
                                  )}
                                  <h5 className="font-medium text-sm truncate">
                                    {product.name}
                                  </h5>
                                </div>
                                {product.price && (
                                  <span className="text-lg font-bold text-[var(--color-primary)] flex-shrink-0">
                                    €{product.price.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mb-2">
                                {product.category && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs">
                                    <Package className="w-3 h-3" />
                                    {product.category}
                                  </span>
                                )}
                                {product.color && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs">
                                    {product.color}
                                  </span>
                                )}
                                {product.inStock !== undefined && (
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                      product.inStock
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                    )}
                                  >
                                    {product.inStock ? 'Op voorraad' : 'Niet op voorraad'}
                                  </span>
                                )}
                              </div>

                              {hasUrl && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShopClick(product);
                                  }}
                                  disabled={isOpening}
                                  variant="primary"
                                  size="sm"
                                  className="w-full mt-2"
                                >
                                  {isOpening ? (
                                    <>Opent...</>
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-4 h-4 mr-1" />
                                      Shop bij {product.retailer || 'winkel'}
                                      <ExternalLink className="w-3 h-3 ml-1" />
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-[var(--color-text)]/60">
                      Geen items beschikbaar
                    </div>
                  )}
                </div>

                {/* Sizing Info */}
                {outfit.products && outfit.products.some(p => p.sizes) && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-blue-900">
                        Maat-informatie
                      </span>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Klik op een item voor beschikbare maten en maat-informatie
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm text-[var(--color-text)]/60 mb-1">
                  Totaalprijs
                </div>
                <div className="text-2xl font-bold text-[var(--color-primary)]">
                  €{totalPrice.toFixed(2)}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onClose}
                >
                  Sluiten
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleShopAllClick}
                  disabled={availableProducts.length === 0}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop complete outfit
                  {!allAvailable && (
                    <span className="ml-1 text-xs opacity-80">
                      ({availableProducts.length}/{outfit.products?.length})
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-[var(--color-text)]/60 text-center mt-3 flex items-center justify-center gap-1">
              <Info size={12} />
              Items openen in aparte tabbladen bij de retailer
            </p>
          </div>
        </motion.div>

        {/* Selected Product Detail Overlay */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedProduct(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Product informatie</h4>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <LazyImage
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {selectedProduct.brand && (
                    <p className="text-sm text-gray-600">{selectedProduct.brand}</p>
                  )}
                  <h5 className="text-lg font-bold">{selectedProduct.name}</h5>

                  {selectedProduct.description && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  )}

                  <div className="space-y-2 py-3 border-y border-gray-200">
                    {selectedProduct.material && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Materiaal</span>
                        <span className="font-medium">{selectedProduct.material}</span>
                      </div>
                    )}
                    {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-2">Beschikbare maten</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.sizes.map((size) => (
                            <span
                              key={size}
                              className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedProduct.price && (
                    <div className="text-2xl font-bold text-blue-600">
                      €{selectedProduct.price.toFixed(2)}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      handleShopClick(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Shop dit item
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
