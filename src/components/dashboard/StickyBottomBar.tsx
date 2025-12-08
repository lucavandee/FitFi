import React from 'react';
import { ShoppingBag, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useABVariant } from '@/hooks/useABVariant';
import { track } from '@/utils/analytics';

interface StickyBottomBarProps {
  onClaimDaily: () => void;
  userId?: string;
  className?: string;
}

const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  onClaimDaily,
  userId,
  className = ''
}) => {
  const variant = useABVariant('mobile_sticky_cta');

  const handleOutfitsClick = () => {
    track('mobile_sticky_cta_click', {
      variant,
      label: 'outfits',
      userId,
      source: 'dashboard_sticky_bottom'
    });

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        variant,
        label: 'mobile_sticky_outfits',
        userId
      });
    }
  };

  const handleClaimClick = () => {
    track('mobile_sticky_cta_click', {
      variant,
      label: 'claim_xp',
      userId,
      source: 'dashboard_sticky_bottom'
    });

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        variant,
        label: 'mobile_sticky_claim',
        userId
      });
    }

    onClaimDaily();
  };

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${className}`}>
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 rounded-t-2xl shadow-xl p-4">
        <div className="flex space-x-3 max-w-sm mx-auto">
          <Button
            as={Link}
            to="/outfits"
            onClick={handleOutfitsClick}
            variant="primary"
            size="lg"
            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white shadow-sm rounded-2xl"
            icon={<ShoppingBag size={18} />}
            iconPosition="left"
            data-ab-variant={variant}
          >
            Bekijk Outfits
          </Button>
          
          <Button
            onClick={handleClaimClick}
            variant="outline"
            size="lg"
            className="flex-1 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white rounded-2xl"
            icon={<Gift size={18} />}
            iconPosition="left"
            data-ab-variant={variant}
          >
            Claim XP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyBottomBar;