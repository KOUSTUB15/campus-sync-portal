import React from 'react';
import { Building2, GraduationCap, Users, Shield, ExternalLink, Bell, CheckCircle2, Cloud } from 'lucide-react';
import { useCampusStore, PORTAL_CONFIG, getPortalUrl, StatCard, PageHeader } from '@campus/shared-core';

export default function GatewayHub({ onNavigate }) {
  const { db, syncMeta, ghConfig } = useCampusStore();

  const pendingCerts = db.certificates.filter((c) => c.status === 'Pending').length;
  const pendingLeaves = db.facultyLeaves.filter((l) => l.status === 'Pending').length;

  const portals = [
    {
      id: 'college',
      icon: Building2,
      title: '1. College Login (Admin & Management)',
      desc: 'Departments, Master Calendar, Faculty Leave Approvals, Admission Quotas, Exam Seating & Hall Tickets, Signed Certificates, Library, Placements & Analytics.',
      stats: `${db.departments.length} Depts • ${pendingCerts} Pending Certs • ${pendingLeaves} Leave Requests`,
    },
    {
      id: 'teacher',
      icon: Users,
      title: '2. Teacher Login (Faculty & Mentors)',
      desc: 'Lectures & Syllabus Tracker, Labs & Viva Marks, B1/B2 Batch Mapping, IA Rubrics, AI Quiz/QP/PPT Maker, At-Risk Insights, Proctor Chat & Research.',
      stats: `${db.teachers.length} Faculty • ${db.lectures.length} Lectures • ${db.quizzes.length} Active Quizzes`,
    },
    {
      id: 'student',
      icon: GraduationCap,
      title: '3. Student Login (Learners)',
      desc: 'Session & Batch Defining, ATS Resume Builder, Quizzes & Lab Uploads, Attendance Shortage Alerts, Hall Tickets, AICTE 100-Pt Tracker, Certificates & Drives.',
      stats: `${db.students.length} Students • ${db.placements.length} Placement Drives • ${db.exams.length} Exams`,
    },
  ];

  return (
    <div className="stack">
      <PageHeader
        title="Campus Management Portal — Master Gateway"
        subtitle="Central system controller configuring rules, permissions, circulars, and live synchronization across all 4 React portals."
        actions={
          <>
            <button className="btn" onClick={() => onNavigate('settings')}>Configure System Rules</button>
            <button className="btn btn-primary" onClick={() => onNavigate('sync')}>
              <Cloud size={15} /> {ghConfig.gistId ? 'GitHub Cloud Active' : 'Connect GitHub Sync'}
            </button>
          </>
        }
      />

      <div className="grid-4">
        <StatCard label="Academic Session" value={db.masterSettings.academicYear} hint={db.masterSettings.activeSemester} icon={Shield} />
        <StatCard label="Min Attendance Rule" value={`${db.masterSettings.minAttendancePercent}%`} hint={`Pass Threshold: ${db.masterSettings.passPercent}%`} icon={CheckCircle2} tone="success" />
        <StatCard label="Global Circulars" value={db.globalNotices.length} hint="Broadcasted to all 4 apps" icon={Bell} />
        <StatCard label="Active Sync Layer" value={ghConfig.gistId ? 'GitHub Cloud' : 'Live Local'} hint={syncMeta.source} icon={Cloud} />
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Select User Role — Launch Connected Standalone Apps</div>
            <div className="card-sub">Each portal runs as its own independent React application and stays synchronized in real time.</div>
          </div>
        </div>
        <div className="grid-3">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="card" style={{ background: 'var(--surface-elevated)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="stat-icon"><Icon size={20} /></div>
                  <span className="badge">{PORTAL_CONFIG[p.id].title}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{p.title}</div>
                <div className="card-sub" style={{ flex: 1 }}>{p.desc}</div>
                <div className="badge badge-info" style={{ width: 'fit-content' }}>{p.stats}</div>
                <a
                  href={getPortalUrl(p.id, 'master')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  Open {PORTAL_CONFIG[p.id].title} <ExternalLink size={14} />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Latest Global Circulars Active Across Campus</div>
          <button className="btn btn-sm" onClick={() => onNavigate('notices')}>Publish New Notice</button>
        </div>
        <div className="stack" style={{ gap: 10 }}>
          {db.globalNotices.map((n) => (
            <div key={n.id} style={{ padding: 12, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{n.title}</strong>
                <span className={`badge ${n.priority === 'High' ? 'badge-danger' : 'badge-info'}`}>{n.audience} • {n.date}</span>
              </div>
              <div className="card-sub" style={{ marginTop: 4 }}>{n.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
