import React from "react";
import type { NotificationItem } from "@/services/data/types";

/**
 * Dashboard > NotificationsMini
 * - Safe by default: nooit crashen op undefined/empty
 * - Premium UX: skeletons, nette empty state
 */
export const NotificationsMini: React.FC<{
  items?: NotificationItem[] | null;
  loading?: boolean;
}> = ({ items, loading = false }) => {
  // Normaliseer data
  const list: NotificationItem[] = Array.isArray(items) ? items : [];

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-2 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (list.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="text-sm font-semibold mb-2">Notificaties</div>
        <div className="text-sm text-gray-500">Geen nieuwe notificaties</div>
      </div>
    );
  }

  // Content
  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <div className="text-sm font-semibold mb-2">Notificaties</div>
      <ul className="space-y-2">
        {list.slice(0, 3).map((n) => (
          <li key={n.id} className="text-sm">
            <div className="font-medium">{n.title}</div>
            {n.body && <div className="text-gray-600">{n.body}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
};