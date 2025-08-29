import React, { useEffect, useState } from "react";
import { fetchReferralsByInviter, type ReferralRow } from "@/services/dashboard/referralsService";
import { useUser } from "@/context/UserContext";

export default function FoundersBlock() {
  const { user } = useUser();
  const [rows, setRows] = useState<ReferralRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!user?.id) return;

    (async () => {
      try {
        const data = await fetchReferralsByInviter(user.id);
        if (mounted) setRows(data);
      } catch (e: any) {
        console.warn("[FoundersBlock] load referrals failed:", e?.message || e);
        if (mounted) setErr("Kon referrals niet laden.");
      }
    })();

    return () => { mounted = false; };
  }, [user?.id]);

  if (err) return <div className="ff-card p-4 text-sm text-red-600">{err}</div>;
  if (!rows) return <div className="ff-card p-4 text-sm">Laden…</div>;
  return (
    <div className="ff-card p-4">
      <div className="font-semibold mb-2">Jouw referrals</div>
      <ul className="text-sm list-disc pl-4">
        {rows.map(r => <li key={r.id}>{r.status ?? "pending"} • {new Date(r.created_at ?? "").toLocaleDateString()}</li>)}
      </ul>
    </div>
  );
}