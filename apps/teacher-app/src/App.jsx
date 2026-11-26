import React, { useState } from 'react';
import { Users, LayoutDashboard, BookOpen, ClipboardCheck, Sparkles, Award } from 'lucide-react';
import { StoreProvider, useCampusStore, AppShell, LoginScreen } from '@campus/shared-core';
import Dashboard from './pages/Dashboard.jsx';
import ClassroomLab from './pages/ClassroomLab.jsx';
import EvalProjects from './pages/EvalProjects.jsx';
import AIMentoring from './pages/AIMentoring.jsx';
import ProfileResearch from './pages/ProfileResearch.jsx';

function TeacherWorkspace() {
  const { currentUser } = useCampusStore();
  const [tab, setTab] = useState('dashboard');

  if (!currentUser) {
    return (
      <LoginScreen
        portalId="teacher"
        heading="Teacher & Mentor Login"
        tagline="Manage classes, labs, B1/B2 batches, IA marks, AI teaching tools & research"
      />
    );
  }

  const navGroups = [
    {
      label: 'Overview',
      items: [{ id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Teaching Modules',
      items: [
        { id: 'classroom', label: 'Classroom & Lab Teaching', icon: BookOpen },
        { id: 'eval', label: 'Evaluation & Projects', icon: ClipboardCheck },
        { id: 'ai', label: 'AI & Student Mentoring', icon: Sparkles },
        { id: 'profile', label: 'Profile & Research', icon: Award },
      ],
    },
  ];

  return (
    <AppShell portalId="teacher" icon={Users} navGroups={navGroups} activeTab={tab} onTabChange={setTab}>
      {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
      {tab === 'classroom' && <ClassroomLab />}
      {tab === 'eval' && <EvalProjects />}
      {tab === 'ai' && <AIMentoring />}
      {tab === 'profile' && <ProfileResearch />}
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider portalRole="teacher">
      <TeacherWorkspace />
    </StoreProvider>
  );
}
