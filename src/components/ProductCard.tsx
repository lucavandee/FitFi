import React, { useEffect, useState } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import SmartImage from '@/components/media/SmartImage';
import { trackProductClick, trackShopCta, trackImpression } from '@/services/engagement';
import { buildAffiliateUrl, detectPartner } from '@/utils/deeplinks';
import { buildClickRef, logAffiliateClick, isAffiliateConsentGiven } from '@/utils/affiliate';
import toast from 'react-hot-toast';
import { useUser } from '@/context/UserContext';
import { trackView, trackLike, trackSave as trackSaveInteraction, trackClick } from '@/services/ml/interactionTrackingService';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  id: string;
  brand: string;
  title: string;
  price: number;
  imageUrl: string;
  deeplink: string;
  reason?: string;
  className?: string;
  outfitId?: string;
  position?: number;
  context?: Record<string, any>;
  onFeedbackMore?: (id: string) => void;
  onFeedbackLess?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  brand,
  title,
  price,
  imageUrl,
  deeplink,
  reason,
  className = '',
  outfitId,
  position,
  context = {},
  onFeedbackMore,
  onFeedbackLess,
}) => {
  const { saveOutfit } = useGamification();
  const { user } = useUser();
  const [saved, setSaved] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'more' | 'less' | null>(null);

  useEffect(() => {
    trackView(id, { outfitId, position, page: 'ProductCard', brand, price, ...context });
  }, [id]);

  const handleSave = async () => {
    try {
      trackSaveInteraction(id, { outfitId, position, page: 'ProductCard', brand, price, ...context });
      await saveOutfit();
      setSaved(true);
      toast.success('Bewaard voor later.');
    } catch {
      try {
        const { toggleSave } = await import('@/services/engagement');
        const isSaved = toggleSave(id);
        setSaved(isSaved);
        toast.success(isSaved ? 'Bewaard voor later.' : 'Verwijderd uit bewaarde items.');
      } catch {
        toast.error('Bewaren mislukt. Probeer opnieuw.');
      }
    }
  };

  const handleClick = async () => {
    trackClick(id, { outfitId, position, page: 'ProductCard', brand, price, source: 'shop_button', ...context });
    trackProductClick({ id, title, brand, price, source: 'ProductCard' });

    const partner = detectPartner(deeplink || '');
    const affiliateUrl = buildAffiliateUrl(deeplink || '#', partner || undefined);

    trackShopCta({ id, partner: partner || 'unknown', url: affiliateUrl, source: 'ProductCard' });

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

  const handleFeedbackMore = () => {
    setFeedbackGiven('more');
    trackLike(id, { outfitId, position, feedback: 'more', ...context });
    onFeedbackMore?.(id);
    toast.success('Goed om te weten. We tonen meer items zoals dit.');
  };

  const handleFeedbackLess = () => {
    setFeedbackGiven('less');
    trackLike(id, { outfitId, position, feedback: 'less', ...context });
    onFeedbackLess?.(id);
    toast('Niet jouw smaak? We leren van je feedback.', { duration: 3000 });
  };

  return (
    <article
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden',
        'hover:shadow-[var(--shadow-soft)] transition-shadow',
        className
      )}
      aria-label={`${title} van ${brand}`}
    >
      {/* Product image */}
      <div className="aspect-[3/4] overflow-hidden bg-[var(--ff-color-neutral-100)] relative">
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

        {/* Save button (overlay, top-right) */}
        <button
          onClick={handleSave}
          aria-label={saved ? 'Verwijderd uit bewaard' : 'Bewaar voor later'}
          className={cn(
            'absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm',
            saved
              ? 'bg-[var(--ff-color-primary-700)] text-white'
              : 'bg-white/90 text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)]'
          )}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-0.5">
          {brand}
        </p>
        <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug line-clamp-2 mb-2">
          {title}
        </h3>

        {/* Reason line */}
        {reason && (
          <p className="text-xs text-[var(--color-muted)] italic mb-2.5 line-clamp-2">
            {reason}
          </p>
        )}

        {/* Price + primary CTA */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-base font-bold text-[var(--color-text)]">
            €{price.toFixed(2)}
          </span>
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg text-xs font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
            aria-label={`Shop bij partner (je verlaat FitFi)`}
          >
            Shop bij partner
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Feedback row */}
        {(onFeedbackMore || onFeedbackLess) && feedbackGiven === null && (
          <div className="flex items-center gap-2 pt-2.5 border-t border-[var(--color-border)]">
            <span className="text-[10px] text-[var(--color-muted)] mr-auto">Niet jouw smaak? Geef feedback.</span>
            <button
              onClick={handleFeedbackMore}
              aria-label="Meer zoals dit"
              title="Meer zoals dit"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-50)] transition-colors"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Meer zoals dit
            </button>
            <button
              onClick={handleFeedbackLess}
              aria-label="Minder zoals dit"
              title="Minder zoals dit"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold text-[var(--color-muted)] hover:text-[var(--ff-color-error-600)] hover:bg-[var(--ff-color-error-50)] transition-colors"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              Minder zoals dit
            </button>
          </div>
        )}

        {feedbackGiven !== null && (
          <div className="pt-2.5 border-t border-[var(--color-border)]">
            <p className="text-[10px] text-[var(--color-muted)] text-center">
              {feedbackGiven === 'more' ? 'Bedankt — we tonen meer hiervan.' : 'Begrepen — we leren van je.'}
            </p>
          </div>
        )}

        {/* Affiliate disclosure */}
        <p className="mt-2.5 text-[10px] text-[var(--color-muted)] leading-relaxed">
          Koop bij partner (je verlaat FitFi) ·{' '}
          <a
            href="/disclosure"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Meer info
          </a>
        </p>
      </div>
    </article>
  );
};

export default ProductCard;
