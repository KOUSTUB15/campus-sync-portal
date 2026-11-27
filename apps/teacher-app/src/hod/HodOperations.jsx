import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Rocket, FolderGit2, BookOpen, Award } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function HodOperations() {
  const { db, updateDb } = useCampusStore();
  const [subTab, setSubTab] = useState('leaves');
  const [repPick, setRepPick] = useState({});

  // Project Group Allotment
  const [pgForm, setPgForm] = useState({ groupName: '', projectTitle: '', dept: '', semester: '7th Sem', studentUsns: [], facultyId: '', maxMarks: 50 });

  const decideLeave = (leave, status) => {
    const repId = repPick[leave.id] || '';
    const repFac = db.teachers.find((t) => t.id === repId);
    updateDb((prev) => ({
      ...prev,
      leaves: prev.leaves.map((l) =>
        l.id === leave.id
          ? { ...l, status, replacementFacultyId: repId, replacementFacultyName: repFac ? repFac.name : '' }
          : l
      ),
      // If HOD selected a replacement faculty for an approved faculty leave, auto-apply to that faculty's timetable entries!
      timetable:
        leave.applicantType === 'faculty' && status === 'Approved' && repFac
          ? {
              ...prev.timetable,
              entries: prev.timetable.entries.map((e) =>
                e.facultyId === leave.applicantId
                  ? { ...e, replacementFacultyId: repFac.id, replacementFacultyName: repFac.name, replacementReason: `Leave (${leave.from} to ${leave.to})` }
                  : e
              ),
            }
          : prev.timetable,
    }), `${leave.applicantType === 'student' ? 'Student' : 'Faculty'} leave ${status}!`);
  };

  const toggleUsnInGroup = (usn) => {
    setPgForm((p) => ({
      ...p,
      studentUsns: p.studentUsns.includes(usn) ? p.studentUsns.filter((u) => u !== usn) : [...p.studentUsns, usn],
    }));
  };

  const addProjectGroup = (e) => {
    e.preventDefault();
    const fac = db.teachers.find((t) => t.id === pgForm.facultyId);
    if (!fac || pgForm.studentUsns.length === 0) { alert('Select a faculty guide and at least one student'); return; }
    updateDb((prev) => ({
      ...prev,
      projectGroups: [{
        id: `PG-${Date.now().toString().slice(-4)}`,
        ...pgForm,
        maxMarks: Number(pgForm.maxMarks) || 50,
        marks: 0,
        facultyName: fac.name,
        meetings: [],
      }, ...prev.projectGroups],
    }), `Project group allotted to ${fac.name}!`);
    setPgForm({ groupName: '', projectTitle: '', dept: '', semester: '7th Sem', studentUsns: [], facultyId: '', maxMarks: 50 });
  };

  const allotIncubationFaculty = (startupId, facId) => {
    const fac = db.teachers.find((t) => t.id === facId);
    updateDb((prev) => ({
      ...prev,
      startups: prev.startups.map((st) =>
        st.id === startupId
          ? { ...st, incubationFacultyId: facId, incubationFacultyName: fac ? fac.name : '', status: fac ? 'Allotted to Incubation' : 'Pending HOD' }
          : st
      ),
    }), fac ? `Startup allotted to Incubation Faculty: ${fac.name}` : 'Incubation allotment cleared');
  };

  return (
    <div className="stack">
      <PageHeader title="HOD: Leave Approvals, Projects, Startups, Syllabus & Research" subtitle="Approve student/faculty leaves with faculty replacement, allot project groups & startup incubation mentors, and inspect calendar-wise syllabus." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'leaves' ? 'active' : ''}`} onClick={() => setSubTab('leaves')}>Leaves & Replacements ({db.leaves.filter((l) => l.status === 'Pending').length})</button>
        <button className={`tab-btn ${subTab === 'projects' ? 'active' : ''}`} onClick={() => setSubTab('projects')}>Project Group Allotment ({db.projectGroups.length})</button>
        <button className={`tab-btn ${subTab === 'startups' ? 'active' : ''}`} onClick={() => setSubTab('startups')}>Startup &rarr; Incubation ({db.startups.length})</button>
        <button className={`tab-btn ${subTab === 'syllabus' ? 'active' : ''}`} onClick={() => setSubTab('syllabus')}>Faculty Syllabus Calendar ({db.syllabusLogs.length})</button>
        <button className={`tab-btn ${subTab === 'research' ? 'active' : ''}`} onClick={() => setSubTab('research')}>Research & Meetings</button>
      </div>

      {subTab === 'leaves' && (
        <div className="card stack">
          <div className="card-title">Student & Faculty Leave Permissions (Strict HOD Approval)</div>
          {db.leaves.length === 0 ? (
            <EmptyState title="No Leave Requests" message="Student and Faculty leave applications appear here for HOD permission." />
          ) : (
            db.leaves.map((l) => (
              <div key={l.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <strong>{l.applicantName}</strong> <span className="badge">{l.applicantType.toUpperCase()}</span>
                    <div className="card-sub">{l.from} to {l.to} • Reason: {l.reason}</div>
                    {l.replacementFacultyName && <div className="badge badge-info" style={{ marginTop: 4 }}>Replacement Faculty: {l.replacementFacultyName}</div>}
                  </div>
                  <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  {l.applicantType === 'faculty' && (
                    <select className="select" style={{ width: 220 }} value={repPick[l.id] || l.replacementFacultyId || ''} onChange={(e) => setRepPick({ ...repPick, [l.id]: e.target.value })}>
                      <option value="">Assign Replacement Faculty...</option>
                      {db.teachers.filter((t) => t.id !== l.applicantId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                  <button className="btn btn-sm btn-success" onClick={() => decideLeave(l, 'Approved')}><Check size={13} /> Approve</button>
                  <button className="btn btn-sm btn-danger" onClick={() => decideLeave(l, 'Rejected')}><X size={13} /> Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'projects' && (
        <div className="stack">
          <form className="card stack" onSubmit={addProjectGroup}>
            <div className="row"><FolderGit2 size={18} color="var(--accent)" /><span className="card-title">Allot Project Group to Faculty Guide</span></div>
            <div className="grid-3">
              <input className="input" placeholder="Group Name (e.g. Batch G-01)" value={pgForm.groupName} onChange={(e) => setPgForm({ ...pgForm, groupName: e.target.value })} required />
              <input className="input" placeholder="Project Title" value={pgForm.projectTitle} onChange={(e) => setPgForm({ ...pgForm, projectTitle: e.target.value })} required />
              <select className="select" value={pgForm.facultyId} onChange={(e) => setPgForm({ ...pgForm, facultyId: e.target.value })} required>
                <option value="">Allot Faculty Guide...</option>
                {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>)}
              </select>
            </div>
            <div className="field">
              <label>Select Students for this Project Group:</label>
              <div className="row">
                {db.students.length === 0 ? <span className="card-sub">No students registered yet.</span> : db.students.map((s) => (
                  <button type="button" key={s.usn} className={`btn btn-sm ${pgForm.studentUsns.includes(s.usn) ? 'btn-primary' : ''}`} onClick={() => toggleUsnInGroup(s.usn)}>
                    {pgForm.studentUsns.includes(s.usn) ? '✓ ' : '+ '}{s.name} ({s.usn})
                  </button>
                ))}
              </div>
            </div>
            <div><button className="btn btn-primary" type="submit"><Plus size={15} /> Allot Project Group</button></div>
          </form>

          <div className="card">
            {db.projectGroups.length === 0 ? (
              <EmptyState title="No Project Groups Allotted" message="Create a student project group and allot a faculty guide above." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Group & Title</th><th>Students</th><th>Allotted Faculty</th><th>Meetings / Marks</th><th>Action</th></tr></thead>
                  <tbody>
                    {db.projectGroups.map((g) => (
                      <tr key={g.id}>
                        <td><strong>{g.groupName}</strong><div className="card-sub">{g.projectTitle}</div></td>
                        <td>{g.studentUsns.join(', ')}</td>
                        <td><strong>{g.facultyName}</strong></td>
                        <td>{g.meetings.length} meeting(s) • Marks: {g.marks}/{g.maxMarks}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, projectGroups: prev.projectGroups.filter((x) => x.id !== g.id) }), 'Project group removed')}><Trash2 size={13} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'startups' && (
        <div className="card stack">
          <div className="row"><Rocket size={18} color="var(--accent)" /><span className="card-title">Student Startup Requests &rarr; Allot to Incubation Faculty</span></div>
          {db.startups.length === 0 ? (
            <EmptyState title="No Startup Requests" message="Student startup requests submitted in Student Portal appear here for Incubation Faculty allotment." />
          ) : (
            db.startups.map((st) => (
              <div key={st.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div><strong>{st.title}</strong> ({st.domain})<div className="card-sub">By {st.studentName} ({st.usn}) • {st.description}</div></div>
                  <span className="badge badge-info">{st.status}</span>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <label className="card-sub">Allot Incubation Faculty:</label>
                  <select className="select" style={{ width: 240 }} value={st.incubationFacultyId || ''} onChange={(e) => allotIncubationFaculty(st.id, e.target.value)}>
                    <option value="">Select Incubation Faculty...</option>
                    {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.dept})</option>)}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'syllabus' && (
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}><BookOpen size={18} color="var(--accent)" /><span className="card-title">Faculty Calendar-wise Syllabus Covered Log</span></div>
          {db.syllabusLogs.length === 0 ? (
            <EmptyState title="No Syllabus Logs Yet" message="When Faculty log calendar-wise topics covered on their allotted subjects, every entry displays here live." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Faculty</th><th>Subject</th><th>Module & Topic Covered</th><th>Completion</th></tr></thead>
                <tbody>
                  {db.syllabusLogs.map((l) => (
                    <tr key={l.id}>
                      <td><strong>{l.date}</strong></td>
                      <td>{l.facultyName}</td>
                      <td>{l.subjectName}</td>
                      <td>Mod {l.moduleNo}: {l.topic} ({l.hours} hr)</td>
                      <td><span className="badge badge-success">{l.completionPercent}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === 'research' && (
        <div className="grid-2">
          <div className="card">
            <div className="row" style={{ marginBottom: 10 }}><Award size={18} color="var(--accent)" /><span className="card-title">Faculty Research Publications</span></div>
            {db.researchPapers.length === 0 ? <EmptyState title="No Publications Yet" message="Publications logged by Faculty appear here." /> : (
              db.researchPapers.map((r) => (
                <div key={r.id} style={{ padding: 10, borderRadius: 10, background: 'var(--surface-elevated)', marginBottom: 8 }}>
                  <strong>{r.title}</strong> <span className="badge">{r.type}</span>
                  <div className="card-sub">{r.facultyName} • {r.venue} ({r.year})</div>
                </div>
              ))
            )}
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>College Faculty Meetings</div>
            {db.facultyMeetings.length === 0 ? <EmptyState title="No Meetings Scheduled" message="Meetings scheduled in College Portal appear here." /> : (
              db.facultyMeetings.map((m) => (
                <div key={m.id} style={{ padding: 10, borderRadius: 10, background: 'var(--surface-elevated)', marginBottom: 8 }}>
                  <strong>{m.title}</strong><div className="card-sub">{m.date} • {m.time} • {m.venue} — {m.agenda}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
