import React from "react";
import { track } from "@/utils/analytics";
import FoundersTierBadge from '@/components/founders/FoundersTierBadge';
import FoundersTierBadge from '@/components/founders/FoundersTierBadge';
import FoundersTierBadge from '@/components/founders/FoundersTierBadge';

export const ReferralCard: React.FC<{ codeUrl: string; count: number; goal?: number }> = ({ codeUrl, count, goal = 3 }) => {
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ 
          title: "Join FitFi", 
          text: "Word mijn stijl‑buddy op FitFi!", 
          url: codeUrl 
        });
        track('referral_share_native', { method: 'native_share', url: codeUrl });
      } else {
        await navigator.clipboard.writeText(codeUrl);
        track('referral_share_copy', { method: 'clipboard', url: codeUrl });
      }
      
      // Track successful share
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'referral_share', {
          event_category: 'engagement',
          event_label: 'dashboard_referral_card',
          referral_count: count,
          goal_progress: count / goal
        });
      }
      
      // Enhanced feedback with custom toast
      const el = document.createElement("div");
      el.textContent = "Invite link gedeeld/gekopieerd ✅";
      el.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded-full z-50 animate-fade-in";
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translate(-50%, 10px)";
        setTimeout(() => el.remove(), 300);
      }, 1600);
    } catch (error) {
      console.warn('Share failed:', error);
      // Error feedback
      const el = document.createElement("div");
      el.textContent = "Share mislukt, probeer opnieuw";
      el.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-3 py-2 rounded-full z-50 animate-fade-in";
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translate(-50%, 10px)";
        setTimeout(() => el.remove(), 300);
      }, 1600);
    }
  }
  
  return (
    <div className="card p-5 sm:p-6">
      <div className="text-sm text-gray-500">Founders Club</div>
      <div className="mt-2">
        <FoundersTierBadge referrals={count} compact />
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-xl font-semibold">{count}/{goal} referrals</div>
        <button
          onClick={share}
          className="px-4 py-2 rounded-full bg-[#89CFF0] text-white hover:bg-[#5FB7E6] transition-all btn-animate"
        >
          Deel invite
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2 break-all">{codeUrl}</div>
    </div>
  );
};