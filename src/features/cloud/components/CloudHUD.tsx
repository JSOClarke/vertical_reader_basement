import React from 'react';
import { Button } from '../../../components/ui/Button';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { useReaderStore } from '../../reader/store/useReaderStore';
import { useSyncActions } from '../hooks/useSyncActions';
import { translations } from '../../../localization/translations';

interface CloudHUDProps {}

/**
 * Autonomous Cloud Sync HUD.
 * Refactored in Phase 4 to use hooks/stores directly, removing all prop-drilling.
 */
export const CloudHUD: React.FC<CloudHUDProps> = () => {
  const language = useProfileStore(state => state.language);
  const hasUnsavedChanges = useProfileStore(state => state.hasUnsavedChanges);
  const showToast = useReaderStore(state => state.showToast);
  const t = (translations as any)[language];

  const { 
    isConnected, isPushing, isPulling, lastSynced, 
    connect, handleCloudPush, handleCloudPull 
  } = useSyncActions(showToast, t);

  return (
    <div 
      style={{
        position: 'fixed',
        top: '30px',
        right: '30px',
        zIndex: 2000,
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}
    >
      {!isConnected ? (
        <Button 
          variant="hud"
          onClick={connect}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19c.6 0 1.1-.4 1.3-.9.4-1 .3-2.1-.3-3-.6-.9-1.5-1.5-2.5-1.5-.1 0-.3 0-.4.1-.4-2-2.1-3.6-4.1-3.6-1.5 0-2.8.9-3.5 2.1-.3-.1-.6-.1-.9-.1-1.6 0-2.9 1.3-2.9 2.9 0 .2 0 .4.1.5-1.1.4-1.9 1.5-1.9 2.8 0 1.5 1.1 2.7 2.6 2.7h12.5z" />
            </svg>
          }
        >
          {t.connectDrive || "Connect Drive"}
        </Button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {hasUnsavedChanges && !isPushing && (
            <div style={{ 
              fontSize: '9px', 
              letterSpacing: '0.15em', 
              fontWeight: '300', 
              color: '#f59e0b', 
              opacity: 0.8, 
              textTransform: 'uppercase', 
              marginBottom: '-2px' 
            }}>
              {t.unsavedChanges || "Unsaved"}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button 
              variant="hud"
              onClick={handleCloudPush}
              loading={isPushing}
              disabled={isPulling}
              active={true}
              title={t.pushTitle}
            >
              {isPushing ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              variant="hud"
              onClick={handleCloudPull}
              loading={isPulling}
              disabled={isPushing}
              active={true}
              title={t.pullTitle}
            >
              {isPulling ? 'Loading...' : 'Load'}
            </Button>
            {lastSynced && (
              <div style={{ padding: '0 10px', fontSize: '9px', opacity: 0.3, maxWidth: '60px', lineHeight: '1.1' }}>
                Sync: {lastSynced.split(',')[1]}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
