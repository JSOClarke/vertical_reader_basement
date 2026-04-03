import React, { useState } from 'react';
import type { UserProfile } from '../../../types';
import { translations } from '../../../localization/translations';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { useBookStore } from '../store/useBookStore';
import { useSyncActions } from '../../cloud/hooks/useSyncActions';
import { useReaderStore } from '../store/useReaderStore';
import { Button } from '../../../components/ui/Button';
import { ValueStepper } from '../../../components/ui/ValueStepper';

interface StatusDotProps {
  active: boolean;
}

const StatusDot: React.FC<StatusDotProps> = ({ active }) => (
  <div style={{
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: active ? '#4ade80' : 'rgba(128,128,128,0.3)',
    marginLeft: 'auto',
    boxShadow: active ? '0 0 8px #4ade80' : 'none',
    transition: 'all 0.3s ease'
  }} />
);

export const MenuIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <path d="M18 6L6 18M6 6l12 12" />
    ) : (
      <path d="M4 6h16M4 12h16M4 18h16" />
    )}
  </svg>
);

const MenuCategory = ({ label, expanded, onClick }: { label: string, expanded: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    style={{
      width: '100%',
      padding: '12px 20px',
      background: 'transparent',
      border: 'none',
      borderBottom: '1px solid rgba(128,128,128,0.1)',
      color: 'var(--btn-text)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      textAlign: 'left',
      transition: 'all 0.2s ease',
    }}
  >
    {label}
    <svg 
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      style={{ 
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease',
        opacity: 0.5
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>
);

export interface SettingsMenuProps {
  setMobileMenuOpen: (open: boolean) => void;
  setCurrentView: (view: 'reader' | 'stats') => void;
  setAnkiModalOpen: (open: boolean) => void;
  setError: (err: string | null) => void;
}

/**
 * Autonomous Settings Menu.
 * Refactored in Phase 4 to use hooks/stores directly, removing 12+ props.
 */
export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  setMobileMenuOpen,
  setCurrentView,
  setAnkiModalOpen,
  setError
}) => {
  // Global Store State
  const language = useProfileStore(state => state.language);
  const theme = useProfileStore(state => state.theme);
  const aesthetics = useProfileStore(state => state.aesthetics);
  const tapToSelect = useProfileStore(state => state.tapToSelect);
  const showArrows = useProfileStore(state => state.showArrows);
  const centerActive = useProfileStore(state => state.centerActive);
  const activeIndex = useProfileStore(state => state.activeIndex);
  const stats = useProfileStore(state => state.stats);
  const bookmarks = useProfileStore(state => state.bookmarks);
  const ankiField = useProfileStore(state => state.ankiField);

  // Store Actions
  const toggleLanguage = useProfileStore(state => state.toggleLanguage);
  const toggleTheme = useProfileStore(state => state.toggleTheme);
  const setAesthetics = useProfileStore(state => state.setAesthetics);
  const toggleTapToSelect = useProfileStore(state => state.toggleTapToSelect);
  const toggleArrows = useProfileStore(state => state.toggleArrows);
  const toggleCenterActive = useProfileStore(state => state.toggleCenterActive);
  const setActiveIndex = useProfileStore(state => state.setActiveIndex);
  const setHasUnsavedChanges = useProfileStore(state => state.setHasUnsavedChanges);
  const importProfile = useProfileStore(state => state.importProfile);

  const bookData = useBookStore(state => state.sentences);
  const metadata = useBookStore(state => state.metadata);
  const setBookData = useBookStore(state => state.setBookData);
  const setMetadata = useBookStore(state => state.setMetadata);

  const showToast = useReaderStore(state => state.showToast);
  const t = (translations as any)[language];

  // Cloud Actions
  const { 
    isConnected, isPushing, isPulling, lastSynced, 
    connect, handleCloudPush, handleCloudPull 
  } = useSyncActions(showToast, t);

  const [expandedCategory, setExpandedCategory] = useState<string | null>('cloud');
  const toggle = (cat: string) => setExpandedCategory(prev => prev === cat ? null : cat);

  return (
    <div style={{ paddingBottom: '10px' }}>
      <MenuCategory 
        label={t.cloudTitle || "Cloud Sync"} 
        expanded={expandedCategory === 'cloud'} 
        onClick={() => toggle('cloud')} 
      />
      <div className={`accordion-content ${expandedCategory === 'cloud' ? 'expanded' : ''}`}>
        <div className="accordion-inner">
          {!isConnected ? (
            <Button 
              variant="menu"
              onClick={() => connect()}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 19c.6 0 1.1-.4 1.3-.9.4-1 .3-2.1-.3-3-.6-.9-1.5-1.5-2.5-1.5-.1 0-.3 0-.4.1-.4-2-2.1-3.6-4.1-3.6-1.5 0-2.8.9-3.5 2.1-.3-.1-.6-.1-.9-.1-1.6 0-2.9 1.3-2.9 2.9 0 .2 0 .4.1.5-1.1.4-1.9 1.5-1.9 2.8 0 1.5 1.1 2.7 2.6 2.7h12.5z" />
                </svg>
              }
            >
              {t.connectDrive || "Connect Drive"}
            </Button>
          ) : (
            <div style={{ paddingBottom: '8px' }}>
              <Button 
                variant="menu"
                onClick={handleCloudPush}
                loading={isPushing}
                disabled={isPulling}
              >
                {t.pushTitle || 'Save to Cloud'}
              </Button>
              <Button 
                variant="menu"
                onClick={handleCloudPull}
                loading={isPulling}
                disabled={isPushing}
              >
                {t.pullTitle || 'Load from Cloud'}
              </Button>
              {lastSynced && (
                <div style={{ padding: '8px 24px', fontSize: '10px', opacity: 0.4, fontStyle: 'italic' }}>
                  Sync: {lastSynced.split(',')[1]}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <MenuCategory 
        label={t.displaySettings || "Display"} 
        expanded={expandedCategory === 'display'} 
        onClick={() => toggle('display')} 
      />
      <div className={`accordion-content ${expandedCategory === 'display' ? 'expanded' : ''}`}>
        <div className="accordion-inner">
          <Button variant="menu" onClick={toggleTheme}>
            {theme === 'dark' ? t.lightMode : t.darkMode}
          </Button>
          <Button variant="menu" onClick={toggleLanguage}>
            {language === 'en' ? 'Language: EN' : '言語: 日本語'}
          </Button>
        </div>
      </div>

      <MenuCategory 
        label={t.aestheticsSettings || "Aesthetics"} 
        expanded={expandedCategory === 'aesthetics'} 
        onClick={() => toggle('aesthetics')} 
      />
      <div className={`accordion-content ${expandedCategory === 'aesthetics' ? 'expanded' : ''}`}>
        <div className="accordion-inner">
          <ValueStepper 
            label={t.fontSizeLabel || "Font Size"} 
            value={aesthetics.fontSize} 
            unit="px"
            onDecrease={() => { setAesthetics({ fontSize: Math.max(12, aesthetics.fontSize - 2) }); setHasUnsavedChanges(true); }}
            onIncrease={() => { setAesthetics({ fontSize: Math.min(48, aesthetics.fontSize + 2) }); setHasUnsavedChanges(true); }}
          />
          <ValueStepper 
            label={t.verticalMarginLabel || "Top/Bottom"} 
            value={aesthetics.verticalMargin} 
            unit="vh"
            onDecrease={() => { setAesthetics({ verticalMargin: Math.max(0, aesthetics.verticalMargin - 1) }); setHasUnsavedChanges(true); }}
            onIncrease={() => { setAesthetics({ verticalMargin: Math.min(30, aesthetics.verticalMargin + 1) }); setHasUnsavedChanges(true); }}
          />
          <ValueStepper 
            label={t.horizontalMarginLabel || "Left/Right"} 
            value={aesthetics.horizontalMargin} 
            unit="px"
            onDecrease={() => { setAesthetics({ horizontalMargin: Math.max(0, aesthetics.horizontalMargin - 5) }); setHasUnsavedChanges(true); }}
            onIncrease={() => { setAesthetics({ horizontalMargin: Math.min(100, aesthetics.horizontalMargin + 5) }); setHasUnsavedChanges(true); }}
          />
          <ValueStepper 
            label={t.readingWidthLabel || "Viewing Width"} 
            value={aesthetics.readingWidth} 
            unit="%"
            onDecrease={() => { setAesthetics({ readingWidth: Math.max(30, aesthetics.readingWidth - 5) }); setHasUnsavedChanges(true); }}
            onIncrease={() => { setAesthetics({ readingWidth: Math.min(100, aesthetics.readingWidth + 5) }); setHasUnsavedChanges(true); }}
          />
        </div>
      </div>
      
      <MenuCategory 
        label={t.readingSettings || "Reading"} 
        expanded={expandedCategory === 'reading'} 
        onClick={() => toggle('reading')} 
      />
      <div className={`accordion-content ${expandedCategory === 'reading' ? 'expanded' : ''}`}>
        <div className="accordion-inner">
          <Button variant="menu" onClick={() => { toggleTapToSelect(); setHasUnsavedChanges(true); }}>
            {t.tapSelect}
            <StatusDot active={tapToSelect} />
          </Button>
          <Button variant="menu" onClick={() => { toggleArrows(); setHasUnsavedChanges(true); }}>
            {t.showArrows}
            <StatusDot active={showArrows} />
          </Button>
          <Button variant="menu" onClick={() => { toggleCenterActive(); setHasUnsavedChanges(true); }}>
            {t.centerActive}
            <StatusDot active={centerActive} />
          </Button>
        </div>
      </div>

      <MenuCategory 
        label={t.dataActions || "Actions"} 
        expanded={expandedCategory === 'actions'} 
        onClick={() => toggle('actions')} 
      />
      <div className={`accordion-content ${expandedCategory === 'actions' ? 'expanded' : ''}`}>
        <div className="accordion-inner">
          <Button variant="menu" onClick={() => { setCurrentView('stats'); setMobileMenuOpen(false); }}>
            {t.viewStats}
          </Button>
          <Button
            variant="menu"
            onClick={() => {
              if (bookData.length === 0) { alert(t.noDataLoaded); return; }
              const profile: UserProfile = { 
                sentences: bookData, 
                activeIndex, 
                metadata, 
                ankiField, 
                stats, 
                bookmarks, 
                aesthetics,
                theme,
                language,
                tapToSelect,
                showArrows,
                centerActive
              };
              const blob = new Blob([JSON.stringify(profile)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `reader-profile-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              URL.revokeObjectURL(url);
              setMobileMenuOpen(false);
              showToast(t.copiedToast || "Profile Exported!");
            }}
          >
            {t.exportProfile}
          </Button>
          
          <label style={{ width: '100%', cursor: 'pointer' }}>
            <Button variant="menu" as="div" style={{ pointerEvents: 'none' }}>
              {t.importProfile}
            </Button>
            <input type="file" accept=".json" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const json = JSON.parse(ev.target?.result as string);
                  if (Array.isArray(json.sentences) && typeof json.activeIndex === 'number') {
                    setBookData(json.sentences);
                    setMetadata(json.metadata);
                    importProfile(json);
                    setError(null);
                    showToast(t.cloudPullSuccess || "Profile Imported!");
                  } else { showToast(t.invalidProfile || "Invalid Profile", 'error'); }
                } catch { showToast(t.failedParseProfile || "Fail to parse JSON", 'error'); }
              };
              reader.readAsText(file);
              e.target.value = '';
              setMobileMenuOpen(false);
            }} style={{ display: 'none' }} />
          </label>

          <label style={{ width: '100%', cursor: 'pointer' }}>
            <Button variant="menu" as="div" style={{ pointerEvents: 'none' }}>
              {t.loadEpub}
            </Button>
            <input type="file" accept=".epub" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const { parseEpub } = await import('../../epub/utils/epubParser');
                const data = await parseEpub(file);
                if (data.sentences.length === 0) {
                  setError(t.noTextInEpub);
                } else {
                  setBookData(data.sentences);
                  setMetadata(data.metadata);
                  setActiveIndex(0);
                  setError(null);
                }
              } catch (err: any) {
                setError(t.failedParseEpub);
              }
              e.target.value = '';
              setMobileMenuOpen(false);
            }} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <MenuCategory 
        label="Integrations" 
        expanded={expandedCategory === 'integrations'} 
        onClick={() => toggle('integrations')} 
      />
      <div className={`accordion-content ${expandedCategory === 'integrations' ? 'expanded' : ''}`}>
        <div className="accordion-inner">
          <Button
            variant="menu"
            onClick={() => { setAnkiModalOpen(true); setMobileMenuOpen(false); }}
          >
            {t.ankiSettings}
          </Button>
        </div>
      </div>
    </div>
  );
};
