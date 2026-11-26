import React from 'react';
import { Building2, Users, GraduationCap, FileCheck2, Briefcase, AlertTriangle } from 'lucide-react';
import { useCampusStore, StatCard, PageHeader } from '@campus/shared-core';

export default function Dashboard({ onNavigate }) {
  const { db } = useCampusStore();
  const pendingLeaves = db.facultyLeaves.filter((l) => l.status === 'Pending');
  const pendingCerts = db.certificates.filter((c) => c.status === 'Pending');
  const overdueBooks = db.libraryIssues.filter((i) => i.fine > 0);
  const openTickets = db.tickets.filter((t) => t.status !== 'Resolved');

  return (
    <div className="stack">
      <PageHeader
        title="College Administration Dashboard"
        subtitle={`Live institutional command center synced with Master Rules (${db.masterSettings.academicYear}).`}
      />

      <div className="grid-4">
        <StatCard label="Departments" value={db.departments.length} hint={`${db.departments.reduce((a, d) => a + d.intake, 0)} Total Sanctioned Intake`} icon={Building2} />
        <StatCard label="Active Students" value={db.students.length} hint={`${db.students.filter((s) => s.feeStatus === 'Paid').length} Fees Cleared`} icon={GraduationCap} tone="success" />
        <StatCard label="Faculty Strength" value={db.teachers.length} hint={`${pendingLeaves.length} Leave Approvals Pending`} icon={Users} tone={pendingLeaves.length ? 'warning' : 'success'} />
        <StatCard label="Pending Certificates" value={pendingCerts.length} hint={`${openTickets.length} Open Helpdesk Tickets`} icon={FileCheck2} tone={pendingCerts.length ? 'warning' : 'success'} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Action Queue (Live from Teacher & Student Apps)</div>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between', padding: 12, borderRadius: 10, background: 'var(--surface-elevated)' }}>
              <div><strong>Faculty Leave Requests</strong><div className="card-sub">{pendingLeaves.length} awaiting approval</div></div>
              <button className="btn btn-sm btn-primary" onClick={() => onNavigate('people')}>Review</button>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', padding: 12, borderRadius: 10, background: 'var(--surface-elevated)' }}>
              <div><strong>Student Certificate Requests (Bonafide/TC/NOC)</strong><div className="card-sub">{pendingCerts.length} awaiting digital signature</div></div>
              <button className="btn btn-sm btn-primary" onClick={() => onNavigate('academic')}>Sign & Issue</button>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', padding: 12, borderRadius: 10, background: 'var(--surface-elevated)' }}>
              <div><strong>Library Overdue & No-Dues</strong><div className="card-sub">{overdueBooks.length} student(s) with pending fines</div></div>
              <button className="btn btn-sm" onClick={() => onNavigate('academic')}>Manage Library</button>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', padding: 12, borderRadius: 10, background: 'var(--surface-elevated)' }}>
              <div><strong>Placement Drives & Offers</strong><div className="card-sub">{db.placements.length} active company drives</div></div>
              <button className="btn btn-sm" onClick={() => onNavigate('reports')}>View Drives</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Department Intake & Pass % Snapshot</div>
          </div>
          <div className="stack" style={{ gap: 14 }}>
            {db.departments.map((d) => {
              const fillPct = Math.round((d.filled / d.intake) * 100);
              return (
                <div key={d.id}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong>{d.code} — {d.name}</strong>
                    <span className="badge badge-success">Pass: {d.passRate}%</span>
                  </div>
                  <div className="card-sub" style={{ marginBottom: 6 }}>HOD: {d.hod} • Filled: {d.filled}/{d.intake} ({fillPct}%)</div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${fillPct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
