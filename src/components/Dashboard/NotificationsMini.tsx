import React from "react";
import type { NotificationItem } from "@/services/data/types";

export const NotificationsMini: React.FC<{ items: NotificationItem[] }> = ({ items }) => {
  if (!items?.length) return null;
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