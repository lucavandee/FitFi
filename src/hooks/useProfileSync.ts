import { useEffect, useState } from 'react';
import { profileSyncService, SyncStatus } from '@/services/data/profileSyncService';

export function useProfileSync(autoSync = true) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('unknown');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialStatus = profileSyncService.getSyncStatus();
    setSyncStatus(initialStatus);

    if (autoSync) {
      const performSync = async () => {
        setIsLoading(true);
        try {
          await profileSyncService.checkAndSync();
          const newStatus = profileSyncService.getSyncStatus();
          setSyncStatus(newStatus);
        } catch (error) {
          console.error('[useProfileSync] Error during auto-sync:', error);
        } finally {
          setIsLoading(false);
        }
      };

      performSync();
    }
  }, [autoSync]);

  const manualSync = async () => {
    setIsLoading(true);
    try {
      const success = await profileSyncService.syncLocalToRemote();
      const newStatus = profileSyncService.getSyncStatus();
      setSyncStatus(newStatus);
      return success;
    } catch (error) {
      console.error('[useProfileSync] Error during manual sync:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    try {
      await profileSyncService.getProfile();
      const newStatus = profileSyncService.getSyncStatus();
      setSyncStatus(newStatus);
    } catch (error) {
      console.error('[useProfileSync] Error refreshing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncStatus,
    isLoading,
    manualSync,
    refreshProfile,
  };
}
