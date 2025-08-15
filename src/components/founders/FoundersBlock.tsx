import React, { useEffect, useMemo, useState } from "react";
import { supabase as getSupabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/context/UserContext";
import { fetchReferralsByInviter } from "@/services/dashboard/referralsService";

export const FoundersBlock: React.FC = () => {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const [refCount, setRefCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const inviteUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://fitfi.ai";
    return `${origin}/?ref=${userId ?? "guest"}`;
  }, [userId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErrMsg(null);

      if (!userId) {
        // Geen ingelogde user of geen client → toon 0 en stop zonder error
        if (alive) { setRefCount(0); setLoading(false); }
        return;
      }

      try {
        const rows = await fetchReferralsByInviter(userId);
        const count = rows.length;
        if (alive) setRefCount(count);

        const sb = getSupabaseClient();
        if (!sb) {
          console.warn("[FoundersBlock] Supabase client not available");
          return;
        }

        const { error: statsUpdateErr } = await sb
          .from("user_stats")
          .upsert({
            user_id: userId,
            invites: count,
            updated_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
          });

        if (statsUpdateErr) console.warn("[FoundersBlock] user_stats upsert warning:", statsUpdateErr.message);
      } catch (e: any) {
        console.error("[FoundersBlock] load referrals failed:", e?.message ?? e);
        if (alive) {
          setErrMsg("Referrals laden mislukt (wordt snel gefixt).");
          setRefCount(0); // graceful
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [userId]);

  async function onShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join FitFi", text: "Word mijn stijl‑buddy op FitFi!", url: inviteUrl });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
      }
      toast("Invite link gedeeld/gekopieerd ✅");
    } catch {
      // stil
    }
  }

  function toast(msg: string) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded-full z-[9999]";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  return (
    <div className="card lift-sm p-5 sm:p-6">
      <div className="text-sm text-gray-500">Founders Club</div>

      <div className="flex items-center justify-between mt-2">
        <div className="text-xl font-semibold">{loading ? "…" : `${refCount}/3`} referrals</div>
        <button
          type="button"
          onClick={onShare}
          className="px-4 py-2 rounded-full bg-[#89CFF0] text-white hover:bg-[#5FB7E6] btn-animate disabled:opacity-60"
          disabled={loading}
        >
          Deel invite
        </button>
      </div>

      {errMsg && <div className="text-sm text-red-600 mt-2">{errMsg}</div>}

      <div className="text-xs text-gray-500 mt-2 break-all">{inviteUrl}</div>
    </div>
  );
};

export default FoundersBlock;