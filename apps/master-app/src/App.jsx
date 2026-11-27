import React, { useState } from 'react';
import { Shield, Compass, Sliders, Users, BookOpen, Cloud } from 'lucide-react';
import { StoreProvider, useCampusStore, AppShell, LoginScreen } from '@campus/shared-core';
import Dashboard from './pages/Dashboard.jsx';
import InstitutionSettings from './pages/InstitutionSettings.jsx';
import PeopleManager from './pages/PeopleManager.jsx';
import LibraryMaster from './pages/LibraryMaster.jsx';
import NoticesSync from './pages/NoticesSync.jsx';

function MasterWorkspace() {
  const { currentUser, db } = useCampusStore();
  const [tab, setTab] = useState('dashboard');

  if (!currentUser) {
    return (
      <LoginScreen
        portalId="master"
        heading="Master Portal Login"
        tagline="Manage Institution Name, Teachers, Students, Office Workers & Library Books"
      />
    );
  }

  const navGroups = [
    {
      label: 'Master Control',
      items: [
        { id: 'dashboard', label: 'Portal Hub & Overview', icon: Compass },
        { id: 'settings', label: 'Institution & Rules', icon: Sliders },
        { id: 'people', label: 'Teachers, Students & Staff', icon: Users, badge: db.users.length },
        { id: 'library', label: 'Library Available Books', icon: BookOpen },
        { id: 'sync', label: 'Notices & GitHub Sync', icon: Cloud },
      ],
    },
  ];

  return (
    <AppShell portalId="master" icon={Shield} navGroups={navGroups} activeTab={tab} onTabChange={setTab}>
      {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
      {tab === 'settings' && <InstitutionSettings />}
      {tab === 'people' && <PeopleManager />}
      {tab === 'library' && <LibraryMaster />}
      {tab === 'sync' && <NoticesSync />}
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
