import React, { useState } from 'react';
import { GraduationCap, LayoutDashboard, UserCog, BookOpen, FileCheck2, Rocket } from 'lucide-react';
import { StoreProvider, useCampusStore, AppShell, LoginScreen } from '@campus/shared-core';
import Dashboard from './pages/Dashboard.jsx';
import SessionProfile from './pages/SessionProfile.jsx';
import DailyLearning from './pages/DailyLearning.jsx';
import ExamsProjects from './pages/ExamsProjects.jsx';
import GrowthServices from './pages/GrowthServices.jsx';

function StudentWorkspace() {
  const { currentUser } = useCampusStore();
  const [tab, setTab] = useState('dashboard');

  if (!currentUser) {
    return (
      <LoginScreen
        portalId="student"
        heading="Student Portal Login"
        tagline="Access lectures, quizzes, labs, hall tickets, AICTE tracker, certificates & drives"
      />
    );
  }

  const navGroups = [
    {
      label: 'Overview',
      items: [{ id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Learner Journey',
      items: [
        { id: 'session', label: '1. Session & Profile', icon: UserCog },
        { id: 'learning', label: '2. Daily Learning & Labs', icon: BookOpen },
        { id: 'exams', label: '3. Exams, Projects & Guides', icon: FileCheck2 },
        { id: 'services', label: '4. Growth & Services', icon: Rocket },
      ],
    },
  ];

  return (
    <AppShell portalId="student" icon={GraduationCap} navGroups={navGroups} activeTab={tab} onTabChange={setTab}>
      {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
      {tab === 'session' && <SessionProfile />}
      {tab === 'learning' && <DailyLearning />}
      {tab === 'exams' && <ExamsProjects />}
      {tab === 'services' && <GrowthServices />}
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider portalRole="student">
      <StudentWorkspace />
    </StoreProvider>
  );
}
