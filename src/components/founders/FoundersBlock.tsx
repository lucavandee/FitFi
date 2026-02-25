import React, { useEffect, useMemo, useState } from "react";
import { supabase as getSupabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/context/UserContext";
import { fetchReferralsByInviter } from "@/services/dashboard/referralsService";
import FoundersTierBadge from '@/components/founders/FoundersTierBadge';
import FoundersTierPerks from '@/components/founders/FoundersTierPerks';
import { resolveTier } from '@/config/foundersTiers';
import urls from "@/utils/urls";

export const FoundersBlock: React.FC = () => {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const [refCount, setRefCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const inviteUrl = useMemo(() => {
    return urls.buildReferralUrl(userId ?? "guest");
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchReferralsByInviter(userId ?? "");
        if (!mounted) return;
        setRefCount(list?.length ?? 0);
      } catch (e: any) {
        if (!mounted) return;
        setErrMsg(e?.message || "Kon referrals niet ophalen");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const tier = resolveTier(refCount);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-montserrat text-xl text-[var(--color-text)]">Founders</h3>
          <p className="text-sm text-gray-600">Nodig vrienden uit en verdien extra voordelen</p>
        </div>
        <FoundersTierBadge tier={tier} />
      </div>

      <div className="mt-4 grid gap-3">
        <div className="text-sm text-[var(--color-text)]/80 break-all">{inviteUrl}</div>
        <button
          className="ff-cta px-4 py-2 rounded-2xl"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(inviteUrl);
            } catch { /* no-op */ }
          }}
        >
          Deel invite
        </button>
      </div>

      {errMsg && <div className="text-sm text-red-600 mt-2">{errMsg}</div>}

      <div className="text-xs text-gray-500 mt-2 break-all">{inviteUrl}</div>
      
      <FoundersTierPerks referrals={loading ? 0 : refCount} className="mt-6" />
    </div>
  );
};

export default FoundersBlock;