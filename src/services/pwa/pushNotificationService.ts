import { supabase } from '@/lib/supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPreferences {
  outfit_suggestions: boolean;
  style_tips: boolean;
  price_drops: boolean;
  achievements: boolean;
  challenges: boolean;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

export async function subscribeToPushNotifications(): Promise<PushSubscriptionJSON | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications not supported');
    return null;
  }

  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const subscriptionJson = subscription.toJSON();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    await supabase.from('push_subscriptions').upsert({
      user_id: user.user.id,
      endpoint: subscriptionJson.endpoint!,
      p256dh_key: subscriptionJson.keys!.p256dh!,
      auth_key: subscriptionJson.keys!.auth!,
      updated_at: new Date().toISOString(),
    });

    return subscriptionJson;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.user.id)
          .eq('endpoint', subscription.endpoint);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (error) throw error;

    return data || {
      outfit_suggestions: true,
      style_tips: true,
      price_drops: true,
      achievements: true,
      challenges: true,
    };
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return null;
  }
}

export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    return false;
  }
}

export async function isPushNotificationSupported(): Promise<boolean> {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function isPushNotificationEnabled(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null && Notification.permission === 'granted';
  } catch {
    return false;
  }
}

export async function logNotificationClick(notificationId: string): Promise<void> {
  try {
    await supabase
      .from('notification_log')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq('id', notificationId);
  } catch (error) {
    console.error('Failed to log notification click:', error);
  }
}

export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200],
        ...options,
      });
    });
  }
}
