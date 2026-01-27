import React, { useEffect } from 'react';
import { ExternalLink, Heart, Info } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import SmartImage from '@/components/media/SmartImage';
import Button from './ui/Button';
import { trackProductClick, trackShopCta, trackImpression } from '@/services/engagement';
import { buildAffiliateUrl, detectPartner } from '@/utils/deeplinks';
import { buildClickRef, logAffiliateClick, isAffiliateConsentGiven } from '@/utils/affiliate';
import toast from 'react-hot-toast';
import { useUser } from '@/context/UserContext';
import { trackView, trackLike, trackSave as trackSaveInteraction, trackClick } from '@/services/ml/interactionTrackingService';

interface ProductCardProps {
  id: string;
  brand: string;
  title: string;
  price: number;
  imageUrl: string;
  deeplink: string;
  className?: string;
  outfitId?: string;
  position?: number;
  context?: Record<string, any>;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  brand,
  title,
  price,
  imageUrl,
  deeplink,
  className = '',
  outfitId,
  position,
  context = {}
}) => {
  const { saveOutfit } = useGamification();
  const { user } = useUser();

  // Track view on mount (ML interaction tracking)
  useEffect(() => {
    trackView(id, {
      outfitId,
      position,
      page: 'ProductCard',
      brand,
      price,
      ...context
    });
  }, [id, outfitId, position, brand, price]);

  const handleSave = async () => {
    try {
      // Track save interaction for ML
      trackSaveInteraction(id, {
        outfitId,
        position,
        page: 'ProductCard',
        brand,
        price,
        ...context
      });

      await saveOutfit();
      toast.success('Product bewaard!');
    } catch (error) {
      console.warn('Save failed, using local fallback:', error);
      const { toggleSave } = await import('@/services/engagement');
      const saved = toggleSave(id);
      toast.success(saved ? 'Product bewaard!' : 'Product verwijderd uit favorieten');
    }
  };

  const handleClick = async () => {
    // Track click interaction for ML
    trackClick(id, {
      outfitId,
      position,
      page: 'ProductCard',
      brand,
      price,
      source: 'shop_button',
      ...context
    });

    trackProductClick({
      id: id,
      title: title,
      brand: brand,
      price: price,
      source: 'ProductCard'
    });

    const partner = detectPartner(deeplink || '');
    const affiliateUrl = buildAffiliateUrl(deeplink || '#', partner || undefined);

    trackShopCta({
      id: id,
      partner: partner || 'unknown',
      url: affiliateUrl,
      source: 'ProductCard'
    });

    if (isAffiliateConsentGiven()) {
      const clickRef = buildClickRef({ outfitId: id, slot: 1, userId: user?.id });
      await logAffiliateClick({
        clickRef,
        outfitId: id,
        productUrl: affiliateUrl,
        userId: user?.id,
        merchantName: partner || undefined,
      });
    }

    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Product Image - Reserved space for CLS prevention */}
      <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <SmartImage
          src={imageUrl}
          alt={`${title} van ${brand}`}
          id={id}
          kind="product"
          aspect="3/4"
          containerClassName="w-full h-full"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          imgClassName="hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleClick}
          loading="lazy"
        />
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
            {title}
          </h3>
          <p className="text-gray-600 text-xs">{brand}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            €{price.toFixed(2)}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              icon={<Heart size={14} />}
              className="text-gray-500 hover:text-red-500 p-1"
              aria-label="Bewaar product"
            >
              <></>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleClick}
              icon={<ExternalLink size={14} />}
              iconPosition="right"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white text-xs px-3 py-1"
            >
              Bekijk
            </Button>
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1 text-xs text-[var(--color-text)]/60">
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
  );
};

export default ProductCard;