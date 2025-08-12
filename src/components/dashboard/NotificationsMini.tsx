import React from 'react';
import { Bell, Trophy, Shirt, Settings, Coffee } from 'lucide-react';
import type { NotificationItem } from '@/services/data/types';
import ImageWithFallback from '../ui/ImageWithFallback';

interface NotificationsMiniProps {
  items?: NotificationItem[] | null;
  loading?: boolean;
  className?: string;
}

const NotificationsMini: React.FC<NotificationsMiniProps> = ({
  items,
  loading = false,
  className = ''
}) => {
  // Normaliseer data - bulletproof
  const list: NotificationItem[] = Array.isArray(items) ? items : [];

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('challenge')) {
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    }
    if (title.toLowerCase().includes('outfit')) {
      return <Shirt className="w-4 h-4 text-[#89CFF0]" />;
    }
    if (title.toLowerCase().includes('systeem') || title.toLowerCase().includes('update')) {
      return <Settings className="w-4 h-4 text-gray-500" />;
    }
    return <Bell className="w-4 h-4 text-purple-500" />;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`bg-white rounded-3xl shadow-sm p-6 animate-pulse ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state met Nova illustratie
  if (list.length === 0) {
    return (
      <div className={`bg-white rounded-3xl shadow-sm p-6 text-center ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-[#89CFF0] rounded-full flex items-center justify-center">
            <Bell className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-lg font-medium text-[#0D1B2A]">Notificaties</h3>
        </div>
        
        <div className="py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#89CFF0]/20 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-8 h-8 text-[#89CFF0]" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Geen nieuws, goed nieuws</h4>
          <p className="text-sm text-gray-600">Nova geniet van een koffietje terwijl alles perfect loopt</p>
        </div>
      </div>
    );
  }

  // Content state
  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-[#89CFF0] rounded-full flex items-center justify-center">
            <Bell className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-lg font-medium text-[#0D1B2A]">Notificaties</h3>
        </div>
        
        <div className="text-sm text-gray-500">{list.length}</div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {list.slice(0, 4).map((notification, index) => (
          <div
            key={notification.id}
            className={`flex items-start space-x-3 p-3 rounded-2xl transition-all hover:bg-gray-50 animate-fade-in ${
              !notification.read ? 'bg-[#89CFF0]/5 border border-[#89CFF0]/20' : ''
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              {getNotificationIcon(notification.title)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h4 className={`font-medium text-sm leading-tight ${
                  !notification.read ? 'text-[#0D1B2A]' : 'text-gray-700'
                }`}>
                  {notification.title}
                </h4>
                
                {!notification.read && (
                  <div className="w-2 h-2 bg-[#89CFF0] rounded-full flex-shrink-0 ml-2 mt-1"></div>
                )}
              </div>
              
              {notification.body && (
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {notification.body}
                </p>
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                {new Date(notification.created_at).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {list.length > 4 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <button className="text-sm text-[#89CFF0] hover:text-[#89CFF0]/80 font-medium transition-colors">
            Bekijk alle {list.length} notificaties →
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsMini;