import React from "react";
import type { NotificationItem } from "@/services/data/types";

export const NotificationsMini: React.FC<{ items?: NotificationItem[]; loading?: boolean }> = ({ items, loading = false }) => {
  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!items?.length) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="text-sm font-semibold mb-2">Notificaties</div>
        <div className="text-center py-4">
          <div className="text-xs text-gray-500">Geen nieuwe notificaties</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <div className="text-sm font-semibold mb-2">Notificaties</div>
      <ul className="space-y-2">
        {items.slice(0,3).map(n => (
          <li key={n.id} className="text-sm">
            <div className="font-medium">{n.title}</div>
            {n.body && <div className="text-gray-600">{n.body}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
};