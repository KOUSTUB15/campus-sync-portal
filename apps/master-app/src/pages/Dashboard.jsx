import React from 'react';
import { Building2, Users, GraduationCap, Briefcase, BookOpen, ExternalLink, Cloud } from 'lucide-react';
import { useCampusStore, PORTAL_CONFIG, getPortalUrl, StatCard, PageHeader, BarChart } from '@campus/shared-core';

export default function Dashboard({ onNavigate }) {
  const { db, ghConfig } = useCampusStore();
  const hodCount = db.teachers.filter((t) => t.designation === 'HOD').length;
  const facCount = db.teachers.filter((t) => t.designation === 'Faculty').length;
  const totalCopies = db.libraryBooks.reduce((a, b) => a + (Number(b.totalCopies) || 0), 0);

  return (
    <div className="stack">
      <PageHeader
        title={db.masterSettings.institutionName || 'Master Control Hub'}
        subtitle={`Academic Year ${db.masterSettings.academicYear} • Active Term: ${db.masterSettings.activeSemester} • 100% Real User Data`}
        actions={
          <button className="btn btn-primary" onClick={() => onNavigate('sync')}>
            <Cloud size={15} /> {ghConfig.gistId ? 'GitHub Cloud Active' : 'Connect GitHub Sync'}
          </button>
        }
      />

      <div className="grid-4">
        <StatCard label="Teachers (HOD + Faculty)" value={db.teachers.length} hint={`${hodCount} HOD • ${facCount} Faculty`} icon={Users} />
        <StatCard label="Students Enrolled" value={db.students.length} hint={`${db.students.filter((s) => s.eligibilityStatus === 'Year Back').length} Year Back`} icon={GraduationCap} />
        <StatCard label="Office Workers" value={db.officeWorkers.length} hint="Admin, Accountant, Peon, Clerk, Librarian" icon={Briefcase} />
        <StatCard label="Library Books" value={db.libraryBooks.length} hint={`${totalCopies} total copies available`} icon={BookOpen} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Launch Connected Portals</div>
            <div className="card-sub">Every user you create in Master or College can sign in immediately</div>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {['college', 'teacher', 'student'].map((pid) => (
              <div key={pid} className="row" style={{ justifyContent: 'space-between', padding: 12, borderRadius: 12, background: 'var(--surface-elevated)' }}>
                <div>
                  <strong>{PORTAL_CONFIG[pid].title}</strong>
                  <div className="card-sub">{PORTAL_CONFIG[pid].subtitle} • {db.users.filter((u) => u.portal === pid).length} registered login(s)</div>
                </div>
                <a className="btn btn-sm btn-primary" href={getPortalUrl(pid, 'master')} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  Open <ExternalLink size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Institution Data Overview</div>
            <button className="btn btn-sm" onClick={() => onNavigate('people')}>Manage People</button>
          </div>
          <BarChart
            items={[
              { label: 'Students', value: db.students.length },
              { label: 'Teachers (HOD & Faculty)', value: db.teachers.length },
              { label: 'Office Workers', value: db.officeWorkers.length },
              { label: 'Library Books (Titles)', value: db.libraryBooks.length },
              { label: 'Departments', value: db.departments.length },
              { label: 'Subjects Created', value: db.subjects.length },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
