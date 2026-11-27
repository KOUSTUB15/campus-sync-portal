import React, { useState } from 'react';
import { Users, BookOpen, Award, ClipboardCheck, FileSpreadsheet, FolderGit2 } from 'lucide-react';
import { StoreProvider, useCampusStore, AppShell, LoginScreen } from '@campus/shared-core';
import HodSubjectsTimetable from './hod/HodSubjectsTimetable.jsx';
import HodExamsEligibility from './hod/HodExamsEligibility.jsx';
import HodOperations from './hod/HodOperations.jsx';
import FacultySubjectsWork from './faculty/FacultySubjectsWork.jsx';
import FacultyQuizzesAssignments from './faculty/FacultyQuizzesAssignments.jsx';
import FacultyProjectsResearch from './faculty/FacultyProjectsResearch.jsx';

function TeacherWorkspace() {
  const { currentUser, db } = useCampusStore();
  const [tab, setTab] = useState('default');

  if (!currentUser) {
    return (
      <LoginScreen
        portalId="teacher"
        heading="Teachers Portal Login (HOD & Faculty)"
        tagline="HODs receive department control; Faculty receive their strictly allotted subject workspace"
      />
    );
  }

  // STRICT SPLIT: HOD vs FACULTY
  if (currentUser.subRole === 'HOD') {
    const active = tab === 'default' ? 'subjects' : tab;
    const pendingLeaves = db.leaves.filter((l) => l.status === 'Pending').length;
    const navGroups = [
      {
        label: 'HOD Control Panel',
        items: [
          { id: 'subjects', label: 'Subjects & Editable Timetable', icon: BookOpen },
          { id: 'exams', label: 'Eligibility, Year Back & Exams', icon: FileSpreadsheet },
          { id: 'ops', label: 'Leaves, Projects & Startups', icon: ClipboardCheck, badge: pendingLeaves },
        ],
      },
    ];
    return (
      <AppShell portalId="teacher" roleBadge="HOD Portal" icon={Users} navGroups={navGroups} activeTab={active} onTabChange={setTab}>
        {active === 'subjects' && <HodSubjectsTimetable />}
        {active === 'exams' && <HodExamsEligibility />}
        {active === 'ops' && <HodOperations />}
      </AppShell>
    );
  }

  // FACULTY JOB-SCOPED PORTAL
  const active = tab === 'default' ? 'work' : tab;
  const mySubCount = db.subjects.filter((s) => s.facultyId === currentUser.refId).length;
  const myGroupCount = db.projectGroups.filter((g) => g.facultyId === currentUser.refId).length;
  const navGroups = [
    {
      label: 'Faculty Job Portal',
      items: [
        { id: 'work', label: 'My Subjects, Syllabus & Marks', icon: BookOpen, badge: mySubCount },
        { id: 'qa', label: 'Quizzes & Assignments', icon: ClipboardCheck },
        { id: 'proj', label: 'Projects, Leave & Research', icon: FolderGit2, badge: myGroupCount },
      ],
    },
  ];

  return (
    <AppShell portalId="teacher" roleBadge="Faculty Portal" icon={Award} navGroups={navGroups} activeTab={active} onTabChange={setTab}>
      {active === 'work' && <FacultySubjectsWork />}
      {active === 'qa' && <FacultyQuizzesAssignments />}
      {active === 'proj' && <FacultyProjectsResearch />}
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
