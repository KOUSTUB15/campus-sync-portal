import React, { useState } from 'react';
import { Plus, Trash2, Edit3, FolderGit2, Award, Calendar, Rocket } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function FacultyProjectsResearch() {
  const { db, updateDb, currentUser } = useCampusStore();
  const [subTab, setSubTab] = useState('projects');

  const myGroups = db.projectGroups.filter((g) => g.facultyId === currentUser.refId);
  const myStartups = db.startups.filter((s) => s.incubationFacultyId === currentUser.refId);
  const myResearch = db.researchPapers.filter((r) => r.facultyId === currentUser.refId);
  const myLeaves = db.leaves.filter((l) => l.applicantType === 'faculty' && l.applicantId === currentUser.refId);
  const myReplacementDuties = db.timetable.entries.filter((e) => e.replacementFacultyId === currentUser.refId);

  // Project meeting form
  const [mtgForm, setMtgForm] = useState({ groupId: myGroups[0]?.id || '', date: new Date().toISOString().slice(0, 10), topic: '', remarks: '', attendance: {} });

  // Leave form
  const [leaveForm, setLeaveForm] = useState({ from: '', to: '', reason: '' });

  // Research form
  const emptyRes = { type: 'Journal', title: '', venue: '', year: '2026', doiOrLink: '' };
  const [rForm, setRForm] = useState(emptyRes);
  const [editResId, setEditResId] = useState(null);

  const addProjectMeeting = (e) => {
    e.preventDefault();
    const grp = myGroups.find((g) => g.id === (mtgForm.groupId || myGroups[0]?.id));
    if (!grp) return;
    const att = {};
    grp.studentUsns.forEach((u) => { att[u] = mtgForm.attendance[u] || 'Present'; });
    const meeting = { id: `PM-${Date.now().toString().slice(-4)}`, date: mtgForm.date, topic: mtgForm.topic, remarks: mtgForm.remarks, attendance: att };
    updateDb((prev) => ({
      ...prev,
      projectGroups: prev.projectGroups.map((g) => (g.id === grp.id ? { ...g, meetings: [meeting, ...g.meetings] } : g)),
    }), 'Project meeting attendance recorded (visible to Students)!');
    setMtgForm({ ...mtgForm, topic: '', remarks: '' });
  };

  const updateProjectMarks = (grpId, marks) => {
    updateDb((prev) => ({
      ...prev,
      projectGroups: prev.projectGroups.map((g) => (g.id === grpId ? { ...g, marks: Number(marks) } : g)),
    }), 'Project group marks updated!');
  };

  const applyLeave = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      leaves: [{
        id: `LV-${Date.now().toString().slice(-4)}`,
        applicantType: 'faculty',
        applicantId: currentUser.refId,
        applicantName: currentUser.name,
        dept: currentUser.dept,
        ...leaveForm,
        status: 'Pending',
        hodRemarks: '',
        replacementFacultyId: '',
        replacementFacultyName: '',
      }, ...prev.leaves],
    }), 'Leave request submitted to HOD for permission & replacement!');
    setLeaveForm({ from: '', to: '', reason: '' });
  };

  const saveResearch = (e) => {
    e.preventDefault();
    const rec = {
      id: editResId || `RES-${Date.now().toString().slice(-4)}`,
      facultyId: currentUser.refId,
      facultyName: currentUser.name,
      dept: currentUser.dept,
      ...rForm,
    };
    updateDb((prev) => ({
      ...prev,
      researchPapers: editResId ? prev.researchPapers.map((x) => (x.id === editResId ? rec : x)) : [rec, ...prev.researchPapers],
    }), 'Research publication saved (displayed in College & HOD Portals)!');
    setRForm(emptyRes);
    setEditResId(null);
  };

  const activeGroup = myGroups.find((g) => g.id === mtgForm.groupId) || myGroups[0];

  return (
    <div className="stack">
      <PageHeader title="My Projects, Leave, Timetable Replacements & Research" subtitle="Job-scoped faculty workspace: manage your HOD-allotted project groups, leaves, incubation startups, and research." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'projects' ? 'active' : ''}`} onClick={() => setSubTab('projects')}>My Project Groups ({myGroups.length})</button>
        <button className={`tab-btn ${subTab === 'leave' ? 'active' : ''}`} onClick={() => setSubTab('leave')}>Leave & Replacement Duties</button>
        <button className={`tab-btn ${subTab === 'research' ? 'active' : ''}`} onClick={() => setSubTab('research')}>Research Publications ({myResearch.length})</button>
        {myStartups.length > 0 && <button className={`tab-btn ${subTab === 'incubation' ? 'active' : ''}`} onClick={() => setSubTab('incubation')}>Incubation Startups ({myStartups.length})</button>}
      </div>

      {subTab === 'projects' && (
        <div className="stack">
          {myGroups.length === 0 ? (
            <EmptyState title="No Project Groups Allotted" message="Project groups allotted to you by HOD will appear here for meeting attendance & marks." />
          ) : (
            <>
              <form className="card stack" onSubmit={addProjectMeeting}>
                <div className="row"><FolderGit2 size={18} color="var(--accent)" /><span className="card-title">Log Project Meeting Attendance</span></div>
                <div className="grid-3">
                  <select className="select" value={activeGroup?.id || ''} onChange={(e) => setMtgForm({ ...mtgForm, groupId: e.target.value })}>
                    {myGroups.map((g) => <option key={g.id} value={g.id}>{g.groupName} — {g.projectTitle}</option>)}
                  </select>
                  <input type="date" className="input" value={mtgForm.date} onChange={(e) => setMtgForm({ ...mtgForm, date: e.target.value })} required />
                  <input className="input" placeholder="Meeting Topic / Progress Reviewed" value={mtgForm.topic} onChange={(e) => setMtgForm({ ...mtgForm, topic: e.target.value })} required />
                </div>
                {activeGroup && (
                  <div className="row">
                    {activeGroup.studentUsns.map((usn) => {
                      const st = db.students.find((s) => s.usn === usn);
                      const status = mtgForm.attendance[usn] || 'Present';
                      return (
                        <button type="button" key={usn} className={`btn btn-sm ${status === 'Present' ? 'btn-success' : 'btn-danger'}`} onClick={() => setMtgForm({ ...mtgForm, attendance: { ...mtgForm.attendance, [usn]: status === 'Present' ? 'Absent' : 'Present' } })}>
                          {st ? st.name : usn} ({usn}): {status}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div><button className="btn btn-primary" type="submit"><Plus size={15} /> Record Meeting Attendance</button></div>
              </form>

              {myGroups.map((g) => (
                <div key={g.id} className="card stack">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div><strong>{g.groupName} — {g.projectTitle}</strong><div className="card-sub">Team: {g.studentUsns.join(', ')} • {g.meetings.length} meeting(s)</div></div>
                    <div className="row">
                      <span className="card-sub">Project Marks (/{g.maxMarks}):</span>
                      <input type="number" max={g.maxMarks} className="input" style={{ width: 82 }} defaultValue={g.marks} onBlur={(e) => updateProjectMarks(g.id, e.target.value)} />
                    </div>
                  </div>
                  {g.meetings.map((m) => (
                    <div key={m.id} className="card-sub" style={{ padding: 8, borderRadius: 8, background: 'var(--surface-elevated)' }}>
                      <strong>{m.date}</strong>: {m.topic} — {Object.entries(m.attendance).map(([u, st]) => `${u}: ${st}`).join(' | ')}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {subTab === 'leave' && (
        <div className="grid-2">
          <div className="card stack">
            <div className="row"><Calendar size={18} color="var(--accent)" /><span className="card-title">Apply Faculty Leave (HOD Approval)</span></div>
            <form className="stack" style={{ gap: 10 }} onSubmit={applyLeave}>
              <div className="grid-2">
                <div className="field"><label>From</label><input type="date" className="input" value={leaveForm.from} onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })} required /></div>
                <div className="field"><label>To</label><input type="date" className="input" value={leaveForm.to} onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })} required /></div>
              </div>
              <input className="input" placeholder="Reason for leave" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
              <button className="btn btn-primary" type="submit">Request HOD Permission</button>
            </form>
            {myLeaves.map((l) => (
              <div key={l.id} style={{ padding: 10, borderRadius: 5, background: 'var(--surface-elevated)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}><strong>{l.from} to {l.to}</strong><span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span></div>
                <div className="card-sub">{l.reason} {l.replacementFacultyName ? `• Replacement: ${l.replacementFacultyName}` : ''}</div>
              </div>
            ))}
          </div>

          <div className="card stack">
            <div className="card-title">My Replacement Class Duties (Assigned by HOD)</div>
            {myReplacementDuties.length === 0 ? (
              <EmptyState title="No Replacement Duties" message="If HOD assigns you to cover a colleague's class, it appears here immediately." />
            ) : (
              myReplacementDuties.map((e) => (
                <div key={e.id} style={{ padding: 10, borderRadius: 5, background: 'var(--surface-elevated)' }}>
                  <strong>{e.day} • {e.slot} — {e.subjectName}</strong>
                  <div className="card-sub">Covering for {e.facultyName} • {e.dept} {e.semester} • Room {e.room || 'TBD'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {subTab === 'research' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveResearch}>
            <div className="row"><Award size={18} color="var(--accent)" /><span className="card-title">{editResId ? 'Edit Publication' : 'Add Research Publication (Visible to College & HOD)'}</span></div>
            <div className="grid-3">
              <select className="select" value={rForm.type} onChange={(e) => setRForm({ ...rForm, type: e.target.value })}>
                <option>Journal</option><option>Conference</option><option>Patent</option><option>Book Chapter</option>
              </select>
              <input className="input" placeholder="Paper / Patent Title" value={rForm.title} onChange={(e) => setRForm({ ...rForm, title: e.target.value })} required />
              <input className="input" placeholder="Journal / Conference Name" value={rForm.venue} onChange={(e) => setRForm({ ...rForm, venue: e.target.value })} required />
              <input className="input" placeholder="Year" value={rForm.year} onChange={(e) => setRForm({ ...rForm, year: e.target.value })} />
              <input className="input" style={{ gridColumn: 'span 2' }} placeholder="DOI / Publication Link" value={rForm.doiOrLink} onChange={(e) => setRForm({ ...rForm, doiOrLink: e.target.value })} />
            </div>
            <div className="row">
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editResId ? 'Update' : 'Add Publication'}</button>
              {editResId && <button type="button" className="btn" onClick={() => { setEditResId(null); setRForm(emptyRes); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            {myResearch.length === 0 ? <EmptyState title="No Publications Recorded" message="Add your journals, conferences, or patents above." /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Type</th><th>Title</th><th>Venue / Year</th><th>Actions</th></tr></thead>
                  <tbody>
                    {myResearch.map((r) => (
                      <tr key={r.id}>
                        <td><span className="badge">{r.type}</span></td>
                        <td><strong>{r.title}</strong></td>
                        <td>{r.venue} ({r.year})</td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditResId(r.id); setRForm(r); }}><Edit3 size={13} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, researchPapers: prev.researchPapers.filter((x) => x.id !== r.id) }), 'Publication deleted')}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'incubation' && (
        <div className="card stack">
          <div className="row"><Rocket size={18} color="var(--accent)" /><span className="card-title">Incubation Startup Mentoring (Allotted by HOD)</span></div>
          {myStartups.map((st) => (
            <div key={st.id} style={{ padding: 14, borderRadius: 5, background: 'var(--surface-elevated)' }} className="stack">
              <div className="row" style={{ justifyContent: 'space-between' }}><strong>{st.title} ({st.domain})</strong><span className="badge badge-info">{st.status}</span></div>
              <div className="card-sub">Student: {st.studentName} ({st.usn}) — {st.description}</div>
              <div className="row">
                <input className="input" style={{ flex: 1 }} placeholder="Enter mentor feedback..." defaultValue={st.incubationFeedback || ''} onBlur={(e) => updateDb((prev) => ({ ...prev, startups: prev.startups.map((x) => (x.id === st.id ? { ...x, incubationFeedback: e.target.value } : x)) }), 'Feedback saved')} />
                <button className="btn btn-sm btn-success" onClick={() => updateDb((prev) => ({ ...prev, startups: prev.startups.map((x) => (x.id === st.id ? { ...x, status: 'Approved' } : x)) }), 'Startup approved!')}>Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
