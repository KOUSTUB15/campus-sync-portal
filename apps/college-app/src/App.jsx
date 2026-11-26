import React, { useState } from 'react';
import { Building2, LayoutDashboard, Settings2, Users, BookOpenCheck, BarChart3 } from 'lucide-react';
import { StoreProvider, useCampusStore, AppShell, LoginScreen } from '@campus/shared-core';
import Dashboard from './pages/Dashboard.jsx';
import SystemSetup from './pages/SystemSetup.jsx';
import PeopleAdmissions from './pages/PeopleAdmissions.jsx';
import AcademicOps from './pages/AcademicOps.jsx';
import ReportsOutcomes from './pages/ReportsOutcomes.jsx';

function CollegeWorkspace() {
  const { currentUser } = useCampusStore();
  const [tab, setTab] = useState('dashboard');

  if (!currentUser) {
    return (
      <LoginScreen
        portalId="college"
        heading="College Admin Login"
        tagline="Manage admissions, faculty, exams, certificates, library & analytics"
      />
    );
  }

  const navGroups = [
    {
      label: 'Overview',
      items: [{ id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'College Modules',
      items: [
        { id: 'setup', label: 'System & Campus Setup', icon: Settings2 },
        { id: 'people', label: 'People & Admissions', icon: Users },
        { id: 'academic', label: 'Academic Operations', icon: BookOpenCheck },
        { id: 'reports', label: 'Reports & Outcomes', icon: BarChart3 },
      ],
    },
  ];

  return (
    <AppShell portalId="college" icon={Building2} navGroups={navGroups} activeTab={tab} onTabChange={setTab}>
      {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
      {tab === 'setup' && <SystemSetup />}
      {tab === 'people' && <PeopleAdmissions />}
      {tab === 'academic' && <AcademicOps />}
      {tab === 'reports' && <ReportsOutcomes />}
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider portalRole="college">
      <CollegeWorkspace />
    </StoreProvider>
  );
}
