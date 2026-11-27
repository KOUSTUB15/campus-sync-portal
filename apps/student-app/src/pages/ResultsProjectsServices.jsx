import React, { useState } from 'react';
import { Plus, Trash2, FolderGit2, Rocket, Calendar } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function ResultsProjectsServices() {
  const { db, updateDb, currentUser } = useCampusStore();
  const student = db.students.find((s) => s.usn === currentUser.refId);
  const [subTab, setSubTab] = useState('results');

  const semSubjects = student ? db.subjects.filter((s) => s.semester === student.semester && (!s.dept || s.dept === student.dept)) : [];

  // Semester result entry by student (displayed to Faculty & HOD)
  const [resForm, setResForm] = useState({ subjectId: '', customSubject: '', studentEnteredMarks: '', maxMarks: 100, resultStatus: 'Pass', sgpa: '' });
  // Leave request (routed strictly to HOD)
  const [leaveForm, setLeaveForm] = useState({ from: '', to: '', reason: '' });
  // Startup request (routed to HOD -> Incubation Faculty)
  const [stpForm, setStpForm] = useState({ title: '', domain: '', description: '' });

  if (!student) return null;

  const addSemesterResult = (e) => {
    e.preventDefault();
    const sub = db.subjects.find((s) => s.id === resForm.subjectId);
    const subjectName = sub ? `${sub.code} ${sub.name}` : resForm.customSubject.trim();
    if (!subjectName) return;
    updateDb((prev) => ({
      ...prev,
      studentSemesterResults: [{
        id: `SR-${Date.now().toString().slice(-4)}`,
        usn: student.usn,
        studentName: student.name,
        dept: student.dept,
        semester: student.semester,
        academicYearLevel: student.academicYearLevel,
        subjectId: sub ? sub.id : '',
        subjectName,
        studentEnteredMarks: Number(resForm.studentEnteredMarks),
        maxMarks: Number(resForm.maxMarks) || 100,
        resultStatus: resForm.resultStatus,
        sgpa: resForm.sgpa,
        updatedAt: new Date().toISOString().slice(0, 10),
      }, ...prev.studentSemesterResults],
    }), 'Semester result submitted (displayed to Faculty, HOD & College)!');
    setResForm({ subjectId: '', customSubject: '', studentEnteredMarks: '', maxMarks: 100, resultStatus: 'Pass', sgpa: '' });
  };

  const applyLeave = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      leaves: [{
        id: `LV-${Date.now().toString().slice(-4)}`,
        applicantType: 'student',
        applicantId: student.usn,
        applicantName: student.name,
        dept: student.dept,
        ...leaveForm,
        status: 'Pending',
        hodRemarks: '',
      }, ...prev.leaves],
    }), 'Leave request sent to HOD! Permission requires HOD approval.');
    setLeaveForm({ from: '', to: '', reason: '' });
  };

  const submitStartup = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      startups: [{
        id: `STP-${Date.now().toString().slice(-4)}`,
        usn: student.usn,
        studentName: student.name,
        dept: student.dept,
        ...stpForm,
        status: 'Pending HOD',
        incubationFacultyId: '',
        incubationFacultyName: '',
        incubationFeedback: '',
        createdAt: new Date().toISOString().slice(0, 10),
      }, ...prev.startups],
    }), 'Startup request sent to HOD for Incubation Faculty allotment!');
    setStpForm({ title: '', domain: '', description: '' });
  };

  const myResults = db.studentSemesterResults.filter((r) => r.usn === student.usn);
  const myGroups = db.projectGroups.filter((g) => g.studentUsns.includes(student.usn));
  const myLeaves = db.leaves.filter((l) => l.applicantType === 'student' && l.applicantId === student.usn);
  const myStartups = db.startups.filter((s) => s.usn === student.usn);

  return (
    <div className="stack">
      <PageHeader title="Semester Results, Project Meetings, Leave & Startups" subtitle="Enter official semester results for Faculty/HOD, inspect every project meeting's attendance, request HOD leave & pitch startups." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'results' ? 'active' : ''}`} onClick={() => setSubTab('results')}>Semester Result Entry ({myResults.length})</button>
        <button className={`tab-btn ${subTab === 'projects' ? 'active' : ''}`} onClick={() => setSubTab('projects')}>Project Meeting Attendance ({myGroups.length})</button>
        <button className={`tab-btn ${subTab === 'leave' ? 'active' : ''}`} onClick={() => setSubTab('leave')}>HOD Leave Permission</button>
        <button className={`tab-btn ${subTab === 'startup' ? 'active' : ''}`} onClick={() => setSubTab('startup')}>Startup Request</button>
        <button className={`tab-btn ${subTab === 'calendar' ? 'active' : ''}`} onClick={() => setSubTab('calendar')}>Semester Calendar & Exams</button>
      </div>

      {subTab === 'results' && (
        <div className="stack">
          <form className="card stack" onSubmit={addSemesterResult}>
            <div className="card-title">Enter Your Semester Result (Displayed Live to Faculty & HOD)</div>
            <div className="grid-3">
              <select className="select" value={resForm.subjectId} onChange={(e) => setResForm({ ...resForm, subjectId: e.target.value })}>
                <option value="">Select Semester Subject (or type below)...</option>
                {semSubjects.map((s) => <option key={s.id} value={s.id}>{s.code} {s.name}</option>)}
              </select>
              <input className="input" placeholder="Or enter subject name manually" value={resForm.customSubject} onChange={(e) => setResForm({ ...resForm, customSubject: e.target.value })} />
              <select className="select" value={resForm.resultStatus} onChange={(e) => setResForm({ ...resForm, resultStatus: e.target.value })}>
                <option value="Pass">Pass</option>
                <option value="Backlog">Backlog / Fail</option>
              </select>
              <input type="number" className="input" placeholder="Marks Scored" value={resForm.studentEnteredMarks} onChange={(e) => setResForm({ ...resForm, studentEnteredMarks: e.target.value })} required />
              <input type="number" className="input" placeholder="Max Marks (100)" value={resForm.maxMarks} onChange={(e) => setResForm({ ...resForm, maxMarks: e.target.value })} />
              <input className="input" placeholder="Semester SGPA (optional)" value={resForm.sgpa} onChange={(e) => setResForm({ ...resForm, sgpa: e.target.value })} />
            </div>
            <div><button className="btn btn-primary" type="submit"><Plus size={15} /> Submit Result to Faculty & HOD</button></div>
          </form>

          <div className="card">
            {myResults.length === 0 ? <EmptyState title="No Semester Results Entered" message="Enter your subject results above so your Faculty and HOD can verify them." /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Semester</th><th>Subject</th><th>Marks</th><th>SGPA</th><th>Status</th><th>Delete</th></tr></thead>
                  <tbody>
                    {myResults.map((r) => (
                      <tr key={r.id}>
                        <td>{r.semester}</td>
                        <td><strong>{r.subjectName}</strong></td>
                        <td><strong>{r.studentEnteredMarks}/{r.maxMarks}</strong></td>
                        <td>{r.sgpa || '—'}</td>
                        <td><span className={`badge ${r.resultStatus === 'Pass' ? 'badge-success' : 'badge-danger'}`}>{r.resultStatus}</span></td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, studentSemesterResults: prev.studentSemesterResults.filter((x) => x.id !== r.id) }), 'Result deleted')}><Trash2 size={13} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'projects' && (
        <div className="stack">
          {myGroups.length === 0 ? (
            <EmptyState title="No Project Group Allotted Yet" message="Once HOD allots you to a project group and faculty logs meetings, every meeting's attendance will show here." />
          ) : (
            myGroups.map((g) => (
              <div key={g.id} className="card stack">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="row"><FolderGit2 size={18} color="var(--accent)" /><div><strong>{g.groupName} — {g.projectTitle}</strong><div className="card-sub">Guide: {g.facultyName} • Team: {g.studentUsns.join(', ')}</div></div></div>
                  <span className="badge badge-success">Marks: {g.marks}/{g.maxMarks}</span>
                </div>
                {g.meetings.length === 0 ? (
                  <div className="card-sub">No meetings recorded by guide yet.</div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Meeting Date</th><th>Topic Reviewed</th><th>My Attendance</th></tr></thead>
                      <tbody>
                        {g.meetings.map((m) => (
                          <tr key={m.id}>
                            <td><strong>{m.date}</strong></td>
                            <td>{m.topic}</td>
                            <td><span className={`badge ${m.attendance[student.usn] === 'Present' ? 'badge-success' : 'badge-danger'}`}>{m.attendance[student.usn] || 'Not Marked'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'leave' && (
        <div className="grid-2">
          <form className="card stack" onSubmit={applyLeave}>
            <div className="card-title">Request Leave (Requires HOD Permission)</div>
            <div className="grid-2">
              <div className="field"><label>From</label><input type="date" className="input" value={leaveForm.from} onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })} required /></div>
              <div className="field"><label>To</label><input type="date" className="input" value={leaveForm.to} onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })} required /></div>
            </div>
            <textarea className="textarea" placeholder="Reason for leave..." value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
            <button className="btn btn-primary" type="submit">Submit to HOD</button>
          </form>
          <div className="card stack">
            <div className="card-title">My Leave Status</div>
            {myLeaves.length === 0 ? <EmptyState title="No Leave Requests" message="Submit a leave request on the left." /> : myLeaves.map((l) => (
              <div key={l.id} style={{ padding: 12, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}><strong>{l.from} to {l.to}</strong><span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span></div>
                <div className="card-sub">{l.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'startup' && (
        <div className="grid-2">
          <form className="card stack" onSubmit={submitStartup}>
            <div className="row"><Rocket size={18} color="var(--accent)" /><span className="card-title">Submit Startup Request to HOD</span></div>
            <input className="input" placeholder="Startup / Idea Title" value={stpForm.title} onChange={(e) => setStpForm({ ...stpForm, title: e.target.value })} required />
            <input className="input" placeholder="Domain (e.g. AI, FinTech, Mobility)" value={stpForm.domain} onChange={(e) => setStpForm({ ...stpForm, domain: e.target.value })} required />
            <textarea className="textarea" placeholder="Describe your idea & prototype..." value={stpForm.description} onChange={(e) => setStpForm({ ...stpForm, description: e.target.value })} required />
            <button className="btn btn-primary" type="submit">Submit Startup Request</button>
          </form>
          <div className="card stack">
            <div className="card-title">My Startup Status & Incubation Faculty</div>
            {myStartups.length === 0 ? <EmptyState title="No Startup Requests" message="Submit your startup request to get allotted an Incubation Faculty mentor by HOD." /> : myStartups.map((st) => (
              <div key={st.id} style={{ padding: 12, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}><strong>{st.title}</strong><span className="badge badge-info">{st.status}</span></div>
                <div className="card-sub">Incubation Faculty: <strong>{st.incubationFacultyName || 'Awaiting HOD Allotment'}</strong></div>
                {st.incubationFeedback && <div className="badge badge-success" style={{ marginTop: 6 }}>Feedback: {st.incubationFeedback}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'calendar' && (
        <div className="grid-2">
          <div className="card stack">
            <div className="row"><Calendar size={18} color="var(--accent)" /><span className="card-title">Whole Semester Calendar (College)</span></div>
            {db.semesterCalendar.length === 0 ? <EmptyState title="No Calendar Events" message="Whole semester calendar published by College appears here." /> : db.semesterCalendar.map((c) => (
              <div key={c.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <div><strong>{c.title}</strong><div className="card-sub">{c.date}{c.endDate ? ` to ${c.endDate}` : ''} • {c.description}</div></div>
                <span className="badge">{c.category}</span>
              </div>
            ))}
          </div>
          <div className="card stack">
            <div className="card-title">Exam Timetable ({student.semester})</div>
            {db.exams.filter((ex) => ex.semester === student.semester).length === 0 ? <EmptyState title="No Exams Allotted" message="Exams scheduled by HOD appear here." /> : db.exams.filter((ex) => ex.semester === student.semester).map((ex) => (
              <div key={ex.id} style={{ padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <strong>{ex.examName}: {ex.subjectName}</strong>
                <div className="card-sub">{ex.date} • {ex.time} • Room: {ex.room}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
