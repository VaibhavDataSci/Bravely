"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { C } from '@/constants/theme';
import { NeonButton, GlassCard, NeonInput } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');

  const tabs = [
    { id: 'Profile', icon: '👤' },
    { id: 'Account', icon: '⚙️' },
    { id: 'Security', icon: '🔒' },
    { id: 'Preferences', icon: '🎨' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return <ProfileTab />;
      case 'Account':
        return <AccountTab user={user} />;
      case 'Security':
        return <SecurityTab />;
      case 'Preferences':
        return <PreferencesTab />;
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: '100vh', 
      background: '#030712', overflow: 'hidden', animation: 'fade-in 0.4s ease'
    }}>
      {/* Top Navigation */}
      <div style={{
        padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24,
        borderBottom: `1px solid ${C.borderMid}`, background: 'rgba(7, 8, 22,0.5)'
      }}>
        <button 
          onClick={() => router.push('/dashboard')}
          onMouseEnter={e => e.currentTarget.style.color = C.primary}
          onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
          style={{
            background: 'none', border: 'none', color: C.textMuted, 
            fontSize: 14, cursor: 'pointer', fontFamily: 'Space Grotesk',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.2s',
          }}
        >
          <span>←</span> Dashboard
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Settings</h1>
      </div>

      {/* Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar */}
        <div style={{
          width: 260, borderRight: `1px solid ${C.borderMid}`, 
          background: 'rgba(13,21,40,0.3)', padding: '32px 16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                borderRadius: 12, border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? `linear-gradient(90deg, rgba(167, 139, 250, 0.2), transparent)` : 'transparent',
                color: activeTab === tab.id ? C.primary : C.textSecondary,
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 15, transition: 'all 0.2s ease',
                borderLeft: activeTab === tab.id ? `3px solid ${C.primary}` : `3px solid transparent`,
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.id}
            </button>
          ))}
        </div>

        {/* Right Content Panel */}
        <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', animation: 'slide-left 0.3s ease' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: C.textPrimary }}>{activeTab}</h2>
            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 32 }}>
              Manage your {activeTab.toLowerCase()} settings and preferences.
            </p>
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── TAB COMPONENTS ───────────────────────────────────────────────────────────

const ProfileTab = () => {
  return (
    <GlassCard style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Avatar Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingBottom: 24, borderBottom: `1px dashed ${C.borderMid}` }}>
        <div style={{ 
          width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff',
          boxShadow: `0 0 20px rgba(167, 139, 250, 0.2)`
        }}>
          👤
        </div>
        <div>
          <div style={{ display: 'flex', gap: 12 }}>
            <NeonButton size="sm" variant="outline">Change Avatar</NeonButton>
            <button style={{ background: 'none', border: 'none', color: C.error, fontSize: 13, cursor: 'pointer' }}>Remove</button>
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>JPG, GIF or PNG. 1MB max.</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
          <NeonInput defaultValue="Alex Developer" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Email</label>
          <NeonInput defaultValue="alex@example.com" />
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <NeonButton>Save Changes</NeonButton>
      </div>
    </GlassCard>
  );
};

const AccountTab = ({ user }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassCard style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
          <NeonInput defaultValue="alex_dev_99" />
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>This is how you appear to other peers.</div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Login Email</label>
          <NeonInput defaultValue={user?.email || "alex@example.com"} />
        </div>
        <div style={{ marginTop: 8 }}>
          <NeonButton>Update Account</NeonButton>
        </div>
      </GlassCard>

      <GlassCard style={{ padding: 32, border: `1px solid rgba(239,68,68,0.3)`, background: 'rgba(239,68,68,0.02)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.error, margin: 0, marginBottom: 8 }}>Delete Account</h3>
        <p style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20, lineHeight: 1.5 }}>
          Once you delete your account, there is no going back. All your mock interview data, peer scores, and settings will be permanently wiped.
        </p>
        <NeonButton 
          variant="outline" 
          style={{ borderColor: C.error, color: C.error }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Delete Account
        </NeonButton>
      </GlassCard>
    </div>
  );
};

const SecurityTab = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassCard style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Password</label>
          <NeonInput type="password" placeholder="••••••••" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Password</label>
          <NeonInput type="password" placeholder="••••••••" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm New Password</label>
          <NeonInput type="password" placeholder="••••••••" />
        </div>
        <div style={{ marginTop: 8 }}>
          <NeonButton>Update Password</NeonButton>
        </div>
      </GlassCard>

      <GlassCard style={{ padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, marginBottom: 4 }}>Two-factor Authentication</h3>
          <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Add an extra layer of security to your account.</p>
        </div>
        <div style={{ 
          width: 48, height: 24, borderRadius: 12, background: C.success, position: 'relative', cursor: 'pointer',
          boxShadow: `0 0 10px ${C.success}40`
        }}>
          <div style={{ 
            position: 'absolute', top: 2, right: 2, width: 20, height: 20, background: '#fff', borderRadius: '50%'
          }} />
        </div>
      </GlassCard>
    </div>
  );
};

const PreferencesTab = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Theme Settings */}
      <GlassCard style={{ padding: 32 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Theme Appearance</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, padding: 20, borderRadius: 12, border: `2px solid ${C.primary}`, background: '#030712', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.primary, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>☾</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>Dark Mode</div>
          </div>
          <div style={{ flex: 1, padding: 20, borderRadius: 12, border: `1px solid ${C.borderMid}`, background: '#f8fafc', cursor: 'pointer', textAlign: 'center', opacity: 0.5 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☼</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Light Mode</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>(Coming soon)</div>
          </div>
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Notifications</h3>
        {[
          { title: 'Peer Match Alerts', desc: 'Get notified when a peer accepts your interview request.' },
          { title: 'Weekly Reports', desc: 'Receive weekly summaries of your mock interview performance.' },
          { title: 'App Updates', desc: 'News about product features and updates.' },
        ].map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{item.title}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{item.desc}</div>
            </div>
            <div style={{ 
              width: 48, height: 24, borderRadius: 12, background: C.primary, position: 'relative', cursor: 'pointer',
              boxShadow: `0 0 10px ${C.primary}40`
            }}>
              <div style={{ 
                position: 'absolute', top: 2, right: 2, width: 20, height: 20, background: '#fff', borderRadius: '50%'
              }} />
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Hardware Settings UI only */}
      <GlassCard style={{ padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, marginBottom: 4 }}>App Sounds</h3>
          <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Play navigation and alert sounds.</p>
        </div>
        <div style={{ 
          width: 48, height: 24, borderRadius: 12, background: C.primary, position: 'relative', cursor: 'pointer',
        }}>
          <div style={{ 
            position: 'absolute', top: 2, right: 2, width: 20, height: 20, background: '#fff', borderRadius: '50%'
          }} />
        </div>
      </GlassCard>

    </div>
  );
};
