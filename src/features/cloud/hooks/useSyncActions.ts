import { useGoogleDrive } from '../../../hooks/useGoogleDrive';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { useBookStore } from '../../reader/store/useBookStore';
import type { UserProfile } from '../../../types';

/**
 * Custom hook to manage cloud synchronization actions (Push/Pull).
 * It orchestrates data between multiple stores and Google Drive.
 */
export const useSyncActions = (showToast: (msg: string, type?: 'success' | 'error') => void, t: any) => {
  const { push, pull, isConnected, isPushing, isPulling, lastSynced, connect } = useGoogleDrive();
  
  const setHasUnsavedChanges = useProfileStore(state => state.setHasUnsavedChanges);
  const importProfile = useProfileStore(state => state.importProfile);
  
  const setBookData = useBookStore(state => state.setBookData);
  const setMetadata = useBookStore(state => state.setMetadata);

  const handleCloudPush = async () => {
    // Combine state from both stores for a complete cloud profile
    const profile = {
      ...useProfileStore.getState(),
      sentences: useBookStore.getState().sentences,
      metadata: useBookStore.getState().metadata
    };
    
    const success = await push(profile as any);
    if (success) { 
      showToast(t.cloudPushSuccess || "Sync Successful!"); 
      setHasUnsavedChanges(false); 
    } else { 
      showToast(t.cloudSyncError, 'error'); 
    }
  };

  const handleCloudPull = async () => {
    const cloudData = await pull();
    if (cloudData && typeof cloudData === 'object') {
      if (confirm(t.confirmReset)) {
        const profile = cloudData as UserProfile;
        // Split cloud data into respective stores
        if (profile.sentences) setBookData(profile.sentences);
        if (profile.metadata) setMetadata(profile.metadata);
        importProfile(profile);
        showToast(t.cloudPullSuccess);
        setHasUnsavedChanges(false);
      }
    } else if (!cloudData) { 
      showToast(t.cloudSyncError, 'error'); 
    }
  };

  return {
    isConnected,
    isPushing,
    isPulling,
    lastSynced,
    connect,
    handleCloudPush,
    handleCloudPull
  };
};
