import React, { useState } from 'react';
import { Building2, UserPlus, FileCheck2, Calendar, Award, Wallet, ClipboardCheck, BookOpen } from 'lucide-react';
import { StoreProvider, useCampusStore, AppShell, LoginScreen } from '@campus/shared-core';
import AccountantPortal from './pages/AccountantPortal.jsx';
import PeonPortal from './pages/PeonPortal.jsx';
import LibrarianPortal from './pages/LibrarianPortal.jsx';
import AdmissionsCredentials from './pages/AdmissionsCredentials.jsx';
import CertificatesManager from './pages/CertificatesManager.jsx';
import AdminOperations from './pages/AdminOperations.jsx';
import ExamOutcomes from './pages/ExamOutcomes.jsx';

function CollegeWorkspace() {
  const { currentUser, db } = useCampusStore();
  const [tab, setTab] = useState('default');

  if (!currentUser) {
    return (
      <LoginScreen
        portalId="college"
        heading="College Office & Staff Login"
        tagline="Role-scoped portals for College Admin, Accountant, Peon, Clerk & Librarian"
      />
    );
  }

  const role = currentUser.subRole;

  // STRICT JOB-SCOPED PORTALS: Each office worker sees ONLY their own job!
  if (role === 'Accountant') {
    const nav = [{ label: 'Accountant Desk', items: [{ id: 'default', label: 'Fees & Finance Ledger', icon: Wallet }] }];
    return (
      <AppShell portalId="college" roleBadge="Accountant Only" icon={Wallet} navGroups={nav} activeTab="default" onTabChange={() => {}}>
        <AccountantPortal />
      </AppShell>
    );
  }

  if (role === 'Peon') {
    const pending = db.officeTasks.filter((t) => t.status !== 'Completed' && (t.assignedToId === currentUser.refId || t.assignedToRole === 'Peon' || !t.assignedToId)).length;
    const nav = [{ label: 'Support Staff Desk', items: [{ id: 'default', label: 'My Assigned Duties', icon: ClipboardCheck, badge: pending }] }];
    return (
      <AppShell portalId="college" roleBadge="Peon / Support Only" icon={ClipboardCheck} navGroups={nav} activeTab="default" onTabChange={() => {}}>
        <PeonPortal />
      </AppShell>
    );
  }

  if (role === 'Librarian') {
    const nav = [{ label: 'Library Desk', items: [{ id: 'default', label: 'Books & Issue/Return', icon: BookOpen }] }];
    return (
      <AppShell portalId="college" roleBadge="Librarian Only" icon={BookOpen} navGroups={nav} activeTab="default" onTabChange={() => {}}>
        <LibrarianPortal />
      </AppShell>
    );
  }

  if (role === 'Clerk') {
    const active = tab === 'default' ? 'admissions' : tab;
    const nav = [
      {
        label: 'Clerk / Admission Desk',
        items: [
          { id: 'admissions', label: 'Admissions & Credentials', icon: UserPlus },
          { id: 'certs', label: 'Certificates Upload', icon: FileCheck2 },
        ],
      },
    ];
    return (
      <AppShell portalId="college" roleBadge="Clerk / Admissions Only" icon={UserPlus} navGroups={nav} activeTab={active} onTabChange={setTab}>
        {active === 'admissions' && <AdmissionsCredentials />}
        {active === 'certs' && <CertificatesManager />}
      </AppShell>
    );
  }

  // College Admin (Full Office Head Portal)
  const active = tab === 'default' ? 'admissions' : tab;
  const navGroups = [
    {
      label: 'College Administration',
      items: [
        { id: 'admissions', label: 'Admissions, Students & Staff', icon: UserPlus, badge: db.students.length },
        { id: 'ops', label: 'Subjects, Meetings & Calendar', icon: Calendar },
        { id: 'certs', label: 'Certificates Upload', icon: FileCheck2 },
        { id: 'outcomes', label: 'Passed, Backlogs & Year Back', icon: Award },
        { id: 'library', label: 'Library Overview', icon: BookOpen },
      ],
    },
  ];

  return (
    <AppShell portalId="college" roleBadge="College Admin" icon={Building2} navGroups={navGroups} activeTab={active} onTabChange={setTab}>
      {active === 'admissions' && <AdmissionsCredentials />}
      {active === 'ops' && <AdminOperations />}
      {active === 'certs' && <CertificatesManager />}
      {active === 'outcomes' && <ExamOutcomes />}
      {active === 'library' && <LibrarianPortal />}
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
