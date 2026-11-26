import React, { useState } from 'react';
import { CheckCircle2, FolderGit2, FileSpreadsheet } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function EvalProjects() {
  const { db, updateDb } = useCampusStore();
  const [subTab, setSubTab] = useState('students');
  const [selectedSubject, setSelectedSubject] = useState('Full Stack Web Dev (21CS51)');
  const minAtt = db.masterSettings.minAttendancePercent;

  const updateStudentMetric = (usn, type, value) => {
    updateDb((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.usn === usn
          ? { ...s, [type]: { ...s[type], [selectedSubject]: Number(value) } }
          : s
      ),
    }));
  };

  const gradeAssignment = (asgId, usn, marks) => {
    updateDb((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        a.id === asgId
          ? { ...a, submissions: a.submissions.map((s) => (s.usn === usn ? { ...s, marks: Number(marks), status: 'Graded' } : s)) }
          : a
      ),
    }), `Graded assignment for ${usn}`);
  };

  const updateExamImp = (examId, impQuestions) => {
    updateDb((prev) => ({
      ...prev,
      exams: prev.exams.map((ex) => (ex.id === examId ? { ...ex, impQuestions } : ex)),
    }), 'Updated Model QP / Important Questions for Student Portal');
  };

  const updateProject = (prjId, patch) => {
    updateDb((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === prjId ? { ...p, ...patch } : p)),
    }), 'Project review synced to Student Portal!');
  };

  const handleStudentLeave = (id, status) => {
    updateDb((prev) => ({
      ...prev,
      studentLeaves: prev.studentLeaves.map((l) => (l.id === id ? { ...l, status } : l)),
    }), `Student Leave/OD marked ${status}`);
  };

  return (
    <div className="stack">
      <PageHeader title="Evaluation, Exams & Projects" subtitle="Live Student Directory, IA Marks & Attendance Rubrics, Question Papers, Assignment Grading, and Project Synopsis Reviews." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'students' ? 'active' : ''}`} onClick={() => setSubTab('students')}>Student List, Marks & Eligibility</button>
        <button className={`tab-btn ${subTab === 'exams' ? 'active' : ''}`} onClick={() => setSubTab('exams')}>Exams, QPs & IA Rubrics</button>
        <button className={`tab-btn ${subTab === 'projects' ? 'active' : ''}`} onClick={() => setSubTab('projects')}>Projects & Synopsis Evaluation</button>
      </div>

      {subTab === 'students' && (
        <div className="stack">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Student Performance, Parent Contact, Backlogs & AICTE Status</div>
              <select className="select" style={{ width: 270 }} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option>Full Stack Web Dev (21CS51)</option>
                <option>Computer Networks (21CS52)</option>
                <option>Machine Learning (21CS53)</option>
                <option>Web Tech Lab (21CSL55)</option>
              </select>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>USN & Name</th><th>Parent Contact</th><th>Att (%)</th><th>IA Marks (/{db.masterSettings.iaMaxMarks})</th><th>Backlogs / AICTE</th><th>Eligibility</th></tr>
                </thead>
                <tbody>
                  {db.students.map((s) => {
                    const att = s.attendance[selectedSubject] ?? 80;
                    const marks = s.iaMarks[selectedSubject] ?? 35;
                    const eligible = att >= minAtt && marks >= 20;
                    return (
                      <tr key={s.usn}>
                        <td><strong>{s.name}</strong><div className="card-sub">{s.usn} • {s.dept} ({s.labBatch})</div></td>
                        <td>{s.parentName}<div className="card-sub">{s.parentPhone}</div></td>
                        <td>
                          <input type="number" max="100" className="input" style={{ width: 76, padding: '5px 8px' }} value={att} onChange={(e) => updateStudentMetric(s.usn, 'attendance', e.target.value)} />
                        </td>
                        <td>
                          <input type="number" max={db.masterSettings.iaMaxMarks} className="input" style={{ width: 76, padding: '5px 8px' }} value={marks} onChange={(e) => updateStudentMetric(s.usn, 'iaMarks', e.target.value)} />
                        </td>
                        <td>{s.backlogs} Back • {s.aictePoints} AICTE pts</td>
                        <td><span className={`badge ${eligible ? 'badge-success' : 'badge-danger'}`}>{eligible ? 'Eligible' : 'Shortage / Risk'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Assignment Submissions Grading</div>
              {db.assignments.map((a) => (
                <div key={a.id} style={{ marginBottom: 14 }}>
                  <strong>{a.title}</strong> <span className="card-sub">(Max {a.maxMarks})</span>
                  {a.submissions.length === 0 ? (
                    <div className="card-sub">No submissions yet.</div>
                  ) : (
                    a.submissions.map((sub) => (
                      <div key={sub.usn} className="row" style={{ justifyContent: 'space-between', marginTop: 6, padding: 8, borderRadius: 8, background: 'var(--surface-elevated)' }}>
                        <div><strong>{sub.studentName}</strong> (<a href={sub.link} target="_blank" rel="noreferrer">Work Link</a>)</div>
                        <div className="row">
                          <input type="number" max={a.maxMarks} className="input" style={{ width: 72, padding: '4px 8px' }} defaultValue={sub.marks ?? ''} onBlur={(e) => e.target.value && gradeAssignment(a.id, sub.usn, e.target.value)} placeholder="Marks" />
                          <span className="badge badge-success">{sub.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Student Leave / OD Requests</div>
              <div className="stack" style={{ gap: 8 }}>
                {db.studentLeaves.map((l) => (
                  <div key={l.id} style={{ padding: 12, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <strong>{l.studentName} ({l.usn}) — {l.type}</strong>
                      <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
                    </div>
                    <div className="card-sub">{l.from} to {l.to} • {l.reason}</div>
                    <div className="row" style={{ marginTop: 8 }}>
                      <button className="btn btn-sm btn-success" onClick={() => handleStudentLeave(l.id, 'Approved')}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleStudentLeave(l.id, 'Rejected')}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'exams' && (
        <div className="card stack">
          <div className="row"><FileSpreadsheet size={18} color="var(--accent)" /><span className="card-title">Exam Dates, Question Papers, Answer Keys & Important Questions</span></div>
          {db.exams.map((ex) => (
            <div key={ex.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <div><strong>{ex.subject}</strong><div className="card-sub">{ex.date} • {ex.time} • {ex.room}</div></div>
                <span className="badge badge-info">QP: {ex.qpFile} ({ex.qpStatus})</span>
              </div>
              <div className="field">
                <label>Important Questions & Answer Hints (Published to Student Exams Tab)</label>
                <textarea className="textarea" defaultValue={ex.impQuestions} onBlur={(e) => updateExamImp(ex.id, e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'projects' && (
        <div className="card stack">
          <div className="row"><FolderGit2 size={18} color="var(--accent)" /><span className="card-title">Guided Projects — Synopsis, Repo Links, Presentations & Marks</span></div>
          {db.projects.map((p) => (
            <div key={p.id} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{p.title}</strong>
                  <div className="card-sub">Team: {p.teamUsns.join(', ')} • Milestone: {p.milestone}</div>
                </div>
                <span className="badge badge-success">{p.synopsisStatus}</span>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <a className="btn btn-sm" href={p.repoUrl} target="_blank" rel="noreferrer">Open GitHub Repo</a>
                <span className="badge">Report: {p.reportFile}</span>
                <span className="badge">Att: {p.attendance}</span>
                <div className="row" style={{ marginLeft: 'auto' }}>
                  <label className="card-sub">Project Marks (/50):</label>
                  <input type="number" max="50" className="input" style={{ width: 80, padding: '5px 8px' }} value={p.marks} onChange={(e) => updateProject(p.id, { marks: Number(e.target.value) })} />
                  <button className="btn btn-sm btn-primary" onClick={() => updateProject(p.id, { synopsisStatus: 'Approved' })}><CheckCircle2 size={14} /> Approve Synopsis</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
