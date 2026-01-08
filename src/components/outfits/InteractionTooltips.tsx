/**
 * Pre-configured Tooltip Variants for Outfit Card Interactions
 *
 * Provides clear, consistent tooltips for all outfit card buttons.
 * Ensures users understand what each button does on both desktop and mobile.
 *
 * Usage:
 * ```tsx
 * import { SaveTooltip, LikeTooltip, DislikeTooltip, ExplainTooltip } from './InteractionTooltips';
 *
 * <SaveTooltip>
 *   <button>❤️</button>
 * </SaveTooltip>
 * ```
 */

import React from 'react';
import { SimpleTooltip, Tooltip } from '@/components/ui/Tooltip';
import { Heart, ThumbsUp, ThumbsDown, MessageCircle, ShoppingBag, Share2, Star, Sparkles, HelpCircle } from 'lucide-react';

interface TooltipWrapperProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Save/Favorite Tooltip
 */
export function SaveTooltip({ children, disabled, className }: TooltipWrapperProps) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <Heart className="w-4 h-4" />
            <span>Bewaar outfit</span>
          </div>
          <div className="text-xs opacity-80">Voeg toe aan je favorieten</div>
        </div>
      }
      position="top"
      size="md"
      delay={200}
      enableLongPress={true}
      longPressDuration={500}
      ariaLabel="Bewaar deze outfit in je favorieten"
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Remove from favorites tooltip
 */
export function UnsaveTooltip({ children, disabled, className }: TooltipWrapperProps) {
  return (
    <SimpleTooltip
      text="Verwijder uit favorieten"
      position="top"
      size="md"
      delay={200}
      ariaLabel="Verwijder deze outfit uit je favorieten"
      disabled={disabled}
      className={className}
    >
      {children}
    </SimpleTooltip>
  );
}

/**
 * "More Like This" / Like Tooltip
 */
export function LikeTooltip({ children, disabled, className }: TooltipWrapperProps) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <ThumbsUp className="w-4 h-4" />
            <span>Meer zoals dit</span>
          </div>
          <div className="text-xs opacity-80">Toon vergelijkbare outfits</div>
        </div>
      }
      position="top"
      size="md"
      delay={200}
      theme="dark"
      ariaLabel="Toon meer outfits zoals deze"
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * "Not My Style" / Dislike Tooltip
 */
export function DislikeTooltip({ children, disabled, className }: TooltipWrapperProps) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <ThumbsDown className="w-4 h-4" />
            <span>Niet mijn stijl</span>
          </div>
          <div className="text-xs opacity-80">Verberg dit type outfit</div>
        </div>
      }
      position="top"
      size="md"
      delay={200}
      theme="dark"
      ariaLabel="Verberg outfits zoals deze uit je feed"
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Explain / Nova Tooltip
 */
export function ExplainTooltip({ children, disabled, className }: TooltipWrapperProps) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <MessageCircle className="w-4 h-4" />
            <span>Nova uitleg</span>
          </div>
          <div className="text-xs opacity-80">Waarom past dit outfit bij je?</div>
        </div>
      }
      position="top"
      size="md"
      delay={200}
      theme="primary"
      ariaLabel="Laat Nova uitleggen waarom dit outfit bij jouw stijl past"
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Shop / Purchase Tooltip
 */
export function ShopTooltip({ children, disabled, className }: TooltipWrapperProps) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="w-4 h-4" />
            <span>Shop deze look</span>
          </div>
          <div className="text-xs opacity-80">Bekijk individuele items</div>
        </div>
      }
      position="top"
      size="md"
      delay={200}
      ariaLabel="Bekijk en shop individuele items uit dit outfit"
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Share Tooltip
 */
export function ShareTooltip({ children, disabled, className }: TooltipWrapperProps) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <Share2 className="w-4 h-4" />
            <span>Deel outfit</span>
          </div>
          <div className="text-xs opacity-80">Deel met vrienden of social media</div>
        </div>
      }
      position="top"
      size="md"
      delay={200}
      ariaLabel="Deel dit outfit met vrienden"
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Rate / Give Feedback Tooltip
 */
export function RateTooltip({ children, disabled, className }: TooltipWrapperProps) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <Star className="w-4 h-4" />
            <span>Beoordeel outfit</span>
          </div>
          <div className="text-xs opacity-80">Geef sterren voor betere matches</div>
        </div>
      }
      position="top"
      size="md"
      delay={200}
      ariaLabel="Beoordeel dit outfit met sterren om je aanbevelingen te verbeteren"
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Match Percentage Badge Tooltip
 */
export function MatchBadgeTooltip({
  children,
  matchPercentage,
  breakdown,
  disabled,
  className
}: TooltipWrapperProps & {
  matchPercentage: number;
  breakdown?: {
    archetype?: number;
    color?: number;
    style?: number;
    season?: number;
    occasion?: number;
  };
}) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Match Score: {matchPercentage}%</span>
          </div>
          <div className="text-xs opacity-80">Dit outfit past bij jouw stijlprofiel</div>

          {breakdown && (
            <div className="mt-1 pt-2 border-t border-white/20 text-xs space-y-1">
              {breakdown.archetype !== undefined && (
                <div className="flex justify-between gap-3">
                  <span className="opacity-75">Archetype:</span>
                  <span className="font-semibold">{breakdown.archetype}%</span>
                </div>
              )}
              {breakdown.color !== undefined && (
                <div className="flex justify-between gap-3">
                  <span className="opacity-75">Kleur:</span>
                  <span className="font-semibold">{breakdown.color}%</span>
                </div>
              )}
              {breakdown.style !== undefined && (
                <div className="flex justify-between gap-3">
                  <span className="opacity-75">Stijl:</span>
                  <span className="font-semibold">{breakdown.style}%</span>
                </div>
              )}
              {breakdown.season !== undefined && (
                <div className="flex justify-between gap-3">
                  <span className="opacity-75">Seizoen:</span>
                  <span className="font-semibold">{breakdown.season}%</span>
                </div>
              )}
              {breakdown.occasion !== undefined && (
                <div className="flex justify-between gap-3">
                  <span className="opacity-75">Gelegenheid:</span>
                  <span className="font-semibold">{breakdown.occasion}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      }
      position="top"
      size="lg"
      delay={300}
      ariaLabel={`Match percentage: ${matchPercentage} procent. Dit outfit past bij jouw stijl.`}
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Color Harmony Badge Tooltip
 */
export function ColorHarmonyTooltip({
  children,
  score,
  label,
  disabled,
  className
}: TooltipWrapperProps & { score: number; label: string }) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="font-semibold">{label}</div>
          <div className="text-xs opacity-80">
            Kleurcombinaties in dit outfit harmoniseren goed met elkaar (score: {score}%)
          </div>
        </div>
      }
      position="top"
      size="md"
      delay={300}
      ariaLabel={`${label}. Kleurharmonie score: ${score} procent`}
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Help / Info Tooltip (generic)
 */
export function HelpTooltip({
  children,
  text,
  title,
  disabled,
  className
}: TooltipWrapperProps & { text: string; title?: string }) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          {title && <div className="font-semibold flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            <span>{title}</span>
          </div>}
          <div className={title ? "text-xs opacity-80" : "text-sm"}>{text}</div>
        </div>
      }
      position="auto"
      size="md"
      delay={200}
      ariaLabel={title ? `${title}: ${text}` : text}
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Swipe Gesture Hint Tooltip (for mobile onboarding)
 */
export function SwipeHintTooltip({ children, disabled, className }: TooltipWrapperProps) {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-2">
          <div className="font-semibold">💡 Swipe Tip</div>
          <div className="text-xs space-y-1">
            <div>👉 <strong>Swipe rechts:</strong> Vind ik leuk</div>
            <div>👈 <strong>Swipe links:</strong> Niet mijn stijl</div>
          </div>
        </div>
      }
      position="top"
      size="lg"
      alwaysVisible={false}
      delay={0}
      theme="light"
      ariaLabel="Swipe rechts voor like, swipe links voor dislike"
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

/**
 * Loading State Tooltip
 */
export function LoadingTooltip({ children, action, disabled, className }: TooltipWrapperProps & { action: string }) {
  return (
    <SimpleTooltip
      text={`${action}...`}
      position="top"
      size="sm"
      delay={0}
      ariaLabel={`Bezig met ${action.toLowerCase()}`}
      disabled={disabled}
      className={className}
    >
      {children}
    </SimpleTooltip>
  );
}

/**
 * Season Badge Tooltip
 */
export function SeasonTooltip({
  children,
  season,
  disabled,
  className
}: TooltipWrapperProps & { season: string }) {
  const seasonDescriptions: Record<string, string> = {
    lente: 'Lichte, warme kleuren. Perfect voor het voorjaar.',
    zomer: 'Koele, gedempte tinten. Zomerse frisheid.',
    herfst: 'Warme, rijke aardtinten. Herfstsfeer.',
    winter: 'Heldere, koele contrasten. Winterse elegantie.'
  };

  const description = seasonDescriptions[season.toLowerCase()] || 'Seizoensgebonden kleurenpalet';

  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="font-semibold capitalize">{season}</div>
          <div className="text-xs opacity-80">{description}</div>
        </div>
      }
      position="top"
      size="md"
      delay={300}
      ariaLabel={`Seizoen: ${season}. ${description}`}
      disabled={disabled}
      className={className}
    >
      {children}
    </Tooltip>
  );
}
