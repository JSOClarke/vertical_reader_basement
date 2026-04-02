import React from 'react';
import type { ChangeEvent } from 'react';
import type { UserProfile, BookMetadata } from '../../../types';

interface ProfileManagerProps {
  sentences: string[];
  activeIndex: number;
  metadata?: BookMetadata;
  onLoadProfile: (profile: UserProfile) => void;
  isMobile?: boolean;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ sentences, activeIndex, metadata, onLoadProfile, isMobile = false }) => {
  const handleExport = () => {
    if (sentences.length === 0) {
      alert("No data loaded to export!");
      return;
    }
    const profile: UserProfile = { sentences, activeIndex, metadata };
    const jsonString = JSON.stringify(profile);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Export with a predictable filename
    link.download = `reader-profile-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.sentences) && typeof json.activeIndex === 'number') {
          onLoadProfile(json as UserProfile);
        } else {
          alert('Invalid profile format. JSON does not contain valid sentences and activeIndex.');
        }
      } catch(err) {
        alert('Failed to parse the profile file. Make sure it is a valid JSON.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div 
      style={{ 
        position: isMobile ? 'static' : 'fixed', 
        top: isMobile ? undefined : '30px', 
        left: isMobile ? undefined : '30px', 
        zIndex: 1000, 
        display: 'flex', 
        gap: '15px'
      }}
    >
      <button 
        onClick={handleExport} 
        style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
      >
        Export Profile
      </button>
      
      <label 
        style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
      >
        Import Profile
        <input 
          type="file" 
          accept=".json" 
          onChange={handleImport} 
          style={{ display: 'none' }} 
        />
      </label>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: 'var(--btn-bg)',
  color: 'var(--btn-text)',
  padding: '10px 20px',
  borderRadius: '0',
  cursor: 'pointer',
  boxShadow: 'var(--btn-shadow)',
  fontWeight: 'bold',
  fontSize: '13px',
  border: 'none',
  fontFamily: 'sans-serif',
  opacity: 0.3,
  transition: 'opacity 0.3s ease, background 0.3s, color 0.3s, box-shadow 0.3s'
};
