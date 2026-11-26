import React, { useState } from 'react';
import { Shield, Compass, Sliders, Bell, KeyRound, Cloud } from 'lucide-react';
import { StoreProvider, useCampusStore, AppShell, LoginScreen } from '@campus/shared-core';
import GatewayHub from './pages/GatewayHub.jsx';
import MasterSettings from './pages/MasterSettings.jsx';
import GlobalNotices from './pages/GlobalNotices.jsx';
import SecurityAuth from './pages/SecurityAuth.jsx';
import CloudSyncCenter from './pages/CloudSyncCenter.jsx';

function MasterWorkspace() {
  const { currentUser } = useCampusStore();
  const [tab, setTab] = useState('gateway');

  if (!currentUser) {
    return (
      <LoginScreen
        portalId="master"
        heading="Master Portal Login"
        tagline="Configure system rules, permissions, global notices & launch all portals"
      />
    );
  }

  const navGroups = [
    {
      label: 'Campus Gateway',
      items: [
        { id: 'gateway', label: 'Portal Hub & Role Switch', icon: Compass },
        { id: 'settings', label: 'Master Settings & Rules', icon: Sliders },
        { id: 'notices', label: 'Global Circulars', icon: Bell },
      ],
    },
    {
      label: 'Security & Online Sync',
      items: [
        { id: 'security', label: 'Accounts & OTP Reset', icon: KeyRound },
        { id: 'sync', label: 'GitHub Cloud Sync', icon: Cloud },
      ],
    },
  ];

  return (
    <AppShell portalId="master" icon={Shield} navGroups={navGroups} activeTab={tab} onTabChange={setTab}>
      {tab === 'gateway' && <GatewayHub onNavigate={setTab} />}
      {tab === 'settings' && <MasterSettings />}
      {tab === 'notices' && <GlobalNotices />}
      {tab === 'security' && <SecurityAuth />}
      {tab === 'sync' && <CloudSyncCenter />}
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider portalRole="master">
      <MasterWorkspace />
    </StoreProvider>
  );
}
