import React from 'react';
import { BookOpen, FlaskConical, AlertTriangle, Users, Sparkles } from 'lucide-react';
import { useCampusStore, StatCard, PageHeader } from '@campus/shared-core';

export default function Dashboard({ onNavigate }) {
  const { db } = useCampusStore();
  const minAtt = db.masterSettings.minAttendancePercent;
  const atRisk = db.students.filter((s) =>
    Object.values(s.attendance).some((v) => v < minAtt) || s.backlogs > 0
  );

  return (
    <div className="stack">
      <PageHeader
        title="Faculty & Mentor Workspace"
        subtitle={`Synced with Master Min-Attendance Rule (${minAtt}%) and College Timetable.`}
        actions={<button className="btn btn-primary" onClick={() => onNavigate('ai')}><Sparkles size={15} /> Open AI Teacher Suite</button>}
      />

      <div className="grid-4">
        <StatCard label="Published Lectures" value={db.lectures.length} hint={`${db.quizzes.length} Interactive Quizzes`} icon={BookOpen} />
        <StatCard label="Active Labs & Tasks" value={db.labs.length + db.assignments.length} hint="Live sync with Student App" icon={FlaskConical} />
        <StatCard label="At-Risk Mentees" value={atRisk.length} hint={`Below ${minAtt}% att or backlogs`} icon={AlertTriangle} tone={atRisk.length ? 'danger' : 'success'} />
        <StatCard label="Research & Patents" value={db.researchPapers.length} hint="Scopus / ORCID linked" icon={Users} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Teaching Schedule</div>
            <button className="btn btn-sm" onClick={() => onNavigate('classroom')}>Apply Leave / Sub</button>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {db.timetable.map((t) => (
              <div key={t.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <div><strong>{t.subject}</strong><div className="card-sub">{t.day} • {t.time} • {t.room}</div></div>
                <span className="badge">{t.batch} {t.substitute ? `• Sub: ${t.substitute}` : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Live Low-Attendance & At-Risk Alerts</div>
            <button className="btn btn-sm" onClick={() => onNavigate('ai')}>Mentor Chat</button>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {atRisk.map((s) => {
              const lows = Object.entries(s.attendance).filter(([, pct]) => pct < minAtt);
              return (
                <div key={s.usn} style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <strong>{s.name} ({s.usn})</strong>
                    <span className="badge badge-danger">Parent: {s.parentPhone}</span>
                  </div>
                  <div className="card-sub" style={{ marginTop: 4 }}>
                    {lows.map(([sub, pct]) => `${sub.split('(')[0].trim()}: ${pct}%`).join(' • ') || 'Active Backlogs'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
