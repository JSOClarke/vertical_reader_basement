import { useState, useCallback, useEffect } from 'react';
import type { UserProfile } from '../types';

const CLIENT_ID = '338920617728-d6h3n4brsi6bpln1gfep002su80gqkar.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FILE_NAME = 'tateyomi-profile.json';
const STORAGE_KEY_CONNECTED = 'tateyomi-gdrive-connected';

interface GoogleDriveHook {
  isConnected: boolean;
  isPushing: boolean;
  isPulling: boolean;
  lastSynced: string | null;
  error: string | null;
  connect: () => void;
  push: (data: UserProfile) => Promise<boolean>;
  pull: () => Promise<UserProfile | null>;
}

export function useGoogleDrive(): GoogleDriveHook {
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(localStorage.getItem('lastCloudSync'));
  const [error, setError] = useState<string | null>(null);

  // Initialize GSI
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp: any) => {
          if (resp.error) {
            // Ignore silent refresh common errors to avoid redundant UI alerts
            if (resp.error !== 'id_token_ext_not_received' && resp.error !== 'interaction_required') {
              setError(resp.error);
            }
            return;
          }
          setAccessToken(resp.access_token);
          localStorage.setItem(STORAGE_KEY_CONNECTED, 'true');
        },
      });
      setTokenClient(client);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle Silent Auto-Connect
  useEffect(() => {
    if (tokenClient && localStorage.getItem(STORAGE_KEY_CONNECTED) === 'true') {
      // Silent refresh: no popup, works if already logged into Google in browser
      tokenClient.requestAccessToken({ prompt: 'none' });
    }
  }, [tokenClient]);

  const connect = useCallback(() => {
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  }, [tokenClient]);

  const findFileId = async (token: string): Promise<string | null> => {
    const resp = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}' and trashed=false`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const data = await resp.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  };

  const push = useCallback(async (data: UserProfile): Promise<boolean> => {
    if (!accessToken) return false;
    setIsPushing(true);
    setError(null);

    try {
      const fileId = await findFileId(accessToken);
      const metadata = {
        name: FILE_NAME,
        mimeType: 'application/json',
      };

      if (!fileId) {
        // Create new file
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }));

        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form,
        });
      } else {
        // Update existing file
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
          method: 'PATCH',
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
        });
      }

      const now = new Date().toLocaleString();
      setLastSynced(now);
      localStorage.setItem('lastCloudSync', now);
      return true;
    } catch (err) {
      setError(String(err));
      return false;
    } finally {
      setIsPushing(false);
    }
  }, [accessToken]);

  const pull = useCallback(async (): Promise<UserProfile | null> => {
    if (!accessToken) return null;
    setIsPulling(true);
    setError(null);

    try {
      const fileId = await findFileId(accessToken);
      if (!fileId) return null;

      const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const content = await resp.json();
      const now = new Date().toLocaleString();
      setLastSynced(now);
      localStorage.setItem('lastCloudSync', now);
      return content;
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setIsPulling(false);
    }
  }, [accessToken]);

  return {
    isConnected: !!accessToken,
    isPushing,
    isPulling,
    lastSynced,
    error,
    connect,
    push,
    pull,
  };
}
