import React from 'react';
import { GraduationCap, AlertTriangle, Award, FileCheck2, Briefcase } from 'lucide-react';
import { useCampusStore, StatCard, PageHeader } from '@campus/shared-core';

export default function Dashboard({ onNavigate }) {
  const { db, currentUser } = useCampusStore();
  const student = db.students.find((s) => s.email === currentUser?.email) || db.students[0];
  const minAtt = db.masterSettings.minAttendancePercent;
  const attEntries = Object.entries(student.attendance);
  const avgAtt = Math.round(attEntries.reduce((a, [, v]) => a + v, 0) / attEntries.length);
  const shortages = attEntries.filter(([, v]) => v < minAtt);

  return (
    <div className="stack">
      <PageHeader
        title={`Welcome, ${student.name}`}
        subtitle={`${student.usn} • ${student.dept} (${student.semester}) • Batch: ${student.classBatch} / Lab ${student.labBatch} • Elective: ${student.elective}`}
      />

      <div className="grid-4">
        <StatCard label="Overall Attendance" value={`${avgAtt}%`} hint={`Master Rule: min ${minAtt}%`} icon={GraduationCap} tone={shortages.length ? 'warning' : 'success'} />
        <StatCard label="Current CGPA" value={student.cgpa} hint={`${student.backlogs} Active Backlog(s)`} icon={Award} />
        <StatCard label="AICTE 100-Pt Tracker" value={`${student.aictePoints}/${db.masterSettings.aicteTargetPoints}`} hint="Verified activity points" icon={FileCheck2} tone="success" />
        <StatCard label="Eligible Drives" value={db.placements.filter((p) => student.cgpa >= p.minCgpa && student.backlogs <= p.maxBacklogs).length} hint="Live from College Placement Cell" icon={Briefcase} />
      </div>

      {shortages.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.45)', background: 'rgba(239,68,68,0.09)' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="row">
              <AlertTriangle size={20} color="var(--danger)" />
              <div>
                <strong>Attendance Shortage Alert (Below Master Threshold {minAtt}%)</strong>
                <div className="card-sub">{shortages.map(([sub, v]) => `${sub}: ${v}%`).join(' • ')}</div>
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => onNavigate('learning')}>Apply OD / Leave</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Subject-wise Attendance & IA Marks</div>
            <button className="btn btn-sm" onClick={() => onNavigate('exams')}>Hall Ticket</button>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {attEntries.map(([sub, pct]) => (
              <div key={sub}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong>{sub}</strong>
                  <span className={`badge ${pct < minAtt ? 'badge-danger' : 'badge-success'}`}>Att: {pct}% • IA: {student.iaMarks[sub] ?? '-'}/{db.masterSettings.iaMaxMarks}</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: pct < minAtt ? 'var(--danger)' : undefined }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Campus Calendar & Global Circulars</div>
            <button className="btn btn-sm" onClick={() => onNavigate('services')}>Request Certificate</button>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {db.academicCalendar.map((c) => (
              <div key={c.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <div><strong>{c.event}</strong><div className="card-sub">{c.date}</div></div>
                <span className="badge">{c.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
