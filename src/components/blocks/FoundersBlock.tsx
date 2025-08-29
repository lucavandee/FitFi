import React, { useEffect, useState } from "react";
import { Users, Gift } from "lucide-react";
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
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-midnight">Jouw Referrals</h3>
      </div>
      
      {rows.length === 0 ? (
        <div className="text-center py-6 text-midnight/60">
          <Gift className="w-8 h-8 mx-auto mb-2 text-turquoise/50" />
          <p className="text-sm">Nog geen referrals</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-light-gray rounded-lg p-3">
              <span className="text-sm text-midnight/70">
                {r.invitee_email || 'Uitnodiging'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                r.status === 'converted' ? 'bg-green-100 text-green-700' :
                r.status === 'joined' ? 'bg-turquoise/20 text-turquoise' :
                'bg-midnight/10 text-midnight/60'
              }`}>
                {r.status === 'converted' ? 'Geconverteerd' :
                 r.status === 'joined' ? 'Aangesloten' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <button className="btn btn-primary w-full mt-4">
        Meer Uitnodigen
      </button>
    </div>
  );
}