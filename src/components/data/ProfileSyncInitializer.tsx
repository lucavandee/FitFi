import { useEffect } from 'react';
import { profileSyncService } from '@/services/data/profileSyncService';
import { initLinkHealth } from '@/services/linkHealth/linkHealthService';

export default function ProfileSyncInitializer() {
  useEffect(() => {
    const initSync = async () => {
      try {
        await profileSyncService.checkAndSync();
      } catch (error) {
        if (import.meta.env.DEV) {
        }
      }
    };

    initSync();
    initLinkHealth().catch(() => {});

    const interval = setInterval(() => {
      profileSyncService.checkAndSync();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
