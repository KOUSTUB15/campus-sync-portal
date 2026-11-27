import React, { useState } from 'react';
import { GraduationCap, BookOpen, ClipboardCheck, Award } from 'lucide-react';
import { StoreProvider, useCampusStore, AppShell, LoginScreen } from '@campus/shared-core';
import SemesterHub from './pages/SemesterHub.jsx';
import QuizzesAssignments from './pages/QuizzesAssignments.jsx';
import ResultsProjectsServices from './pages/ResultsProjectsServices.jsx';

function StudentWorkspace() {
  const { currentUser, db } = useCampusStore();
  const [tab, setTab] = useState('hub');

  if (!currentUser) {
    return (
      <LoginScreen
        portalId="student"
        heading="Student Portal Login"
        tagline="Access semester subjects, timetable, quizzes, assignments, results & project meetings"
      />
    );
  }

  const student = db.students.find((s) => s.usn === currentUser.refId);
  const activeQuizzes = student ? db.quizzes.filter((q) => q.semester === student.semester && q.isActive).length : 0;

  const navGroups = [
    {
      label: student ? `${student.semester} (${student.eligibilityStatus})` : 'Student Hub',
      items: [
        { id: 'hub', label: 'Subjects, Timetable & Docs', icon: BookOpen },
        { id: 'qa', label: 'Quizzes & Assignments', icon: ClipboardCheck, badge: activeQuizzes },
        { id: 'results', label: 'Results, Projects & Requests', icon: Award },
      ],
    },
  ];

  return (
    <AppShell
      portalId="student"
      roleBadge={student?.eligibilityStatus === 'Year Back' ? `Year Back • Yr ${student.academicYearLevel}` : `${student?.semester || 'Student'}`}
      icon={GraduationCap}
      navGroups={navGroups}
      activeTab={tab}
      onTabChange={setTab}
    >
      {tab === 'hub' && <SemesterHub />}
      {tab === 'qa' && <QuizzesAssignments />}
      {tab === 'results' && <ResultsProjectsServices />}
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
