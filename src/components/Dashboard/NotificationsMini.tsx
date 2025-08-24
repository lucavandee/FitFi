import React from "react";

type Notification = {
  id: string;
  title: string;
  body?: string;
  createdAt?: string;
};

export const NotificationsMini: React.FC<{
  items?: Notification[] | null;
  loading?: boolean;
}> = ({ items, loading = false }) => {
  const list: Notification[] = Array.isArray(items) ? items : [];

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 w-1/2 bg-gray-200 rounded animate-pulse" />
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
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-100 grid place-items-center">
            💤
          </div>
          <div className="text-sm text-gray-600">Geen nieuwe notificaties</div>
        </div>
      </div>
    );
  }

  // Content
  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <div className="text-sm font-semibold mb-2">Notificaties</div>
      <ul className="space-y-3">
        {list.slice(0, 4).map((n) => (
          <li key={n.id} className="text-sm">
            <div className="font-medium">{n.title}</div>
            {n.body && <div className="text-gray-600">{n.body}</div>}
            {n.createdAt && (
              <div className="text-xs text-gray-400 mt-0.5">{n.createdAt}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
