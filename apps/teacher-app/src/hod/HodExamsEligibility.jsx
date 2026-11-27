import React, { useState } from 'react';
import { Plus, Trash2, Upload, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState, FileUploadButton, DownloadFileButton } from '@campus/shared-core';

export default function HodExamsEligibility() {
  const { db, updateDb, currentUser, showToast } = useCampusStore();
  const [subTab, setSubTab] = useState('eligibility');

  // Exam Role form
  const [roleForm, setRoleForm] = useState({ facultyId: '', role: 'Invigilator', examName: '', date: '', room: '', notes: '' });
  // Exam Schedule form
  const [exForm, setExForm] = useState({ examName: '', subjectId: '', date: '', time: '', room: '', invigilatorId: '' });
  // Hall Ticket upload by HOD
  const emptyHt = { usn: '', semester: '1st Sem', examTitle: '', fileName: '', fileDataUrl: '' };
  const [htForm, setHtForm] = useState(emptyHt);
  const [editHtId, setEditHtId] = useState(null);

  const promoteOrDetain = (usn, status) => {
    const nextSemMap = { '1st Sem': '2nd Sem', '2nd Sem': '3rd Sem', '3rd Sem': '4th Sem', '4th Sem': '5th Sem', '5th Sem': '6th Sem', '6th Sem': '7th Sem', '7th Sem': '8th Sem', '8th Sem': '8th Sem' };
    updateDb((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        if (s.usn !== usn) return s;
        if (status === 'PromoteNextYear') {
          const nextYear = Math.min(4, (Number(s.academicYearLevel) || 1) + 1);
          const nextSem = nextYear === 2 ? '3rd Sem' : nextYear === 3 ? '5th Sem' : nextYear === 4 ? '7th Sem' : nextSemMap[s.semester] || s.semester;
          return { ...s, eligibilityStatus: 'Eligible', academicYearLevel: nextYear, semester: nextSem };
        }
        return { ...s, eligibilityStatus: status };
      }),
    }), status === 'Year Back' ? `${usn} marked Year Back — locked to current year portal!` : `${usn} granted eligibility!`);
  };

  const addExamRole = (e) => {
    e.preventDefault();
    const fac = db.teachers.find((t) => t.id === roleForm.facultyId);
    if (!fac) return;
    updateDb((prev) => ({
      ...prev,
      examRoles: [{ id: `EXR-${Date.now().toString().slice(-4)}`, ...roleForm, facultyName: fac.name }, ...prev.examRoles],
    }), `Exam role allotted to ${fac.name}`);
    setRoleForm({ facultyId: '', role: 'Invigilator', examName: '', date: '', room: '', notes: '' });
  };

  const addExam = (e) => {
    e.preventDefault();
    const sub = db.subjects.find((s) => s.id === exForm.subjectId);
    const inv = db.teachers.find((t) => t.id === exForm.invigilatorId);
    if (!sub) return;
    updateDb((prev) => ({
      ...prev,
      exams: [{
        id: `EXM-${Date.now().toString().slice(-4)}`,
        examName: exForm.examName,
        subjectId: sub.id,
        subjectName: `${sub.code} ${sub.name}`,
        semester: sub.semester,
        dept: sub.dept,
        date: exForm.date,
        time: exForm.time,
        room: exForm.room,
        invigilatorId: inv ? inv.id : '',
        invigilatorName: inv ? inv.name : 'TBD',
      }, ...prev.exams],
    }), 'Exam timetable allotted (synced to Faculty & Student Portals)!');
    setExForm({ examName: '', subjectId: '', date: '', time: '', room: '', invigilatorId: '' });
  };

  const saveHallTicket = (e) => {
    e.preventDefault();
    const st = db.students.find((s) => s.usn === htForm.usn);
    if (!st) return;
    const rec = {
      id: editHtId || `HT-${Date.now().toString().slice(-4)}`,
      usn: st.usn,
      studentName: st.name,
      semester: htForm.semester,
      examTitle: htForm.examTitle,
      fileName: htForm.fileName,
      fileDataUrl: htForm.fileDataUrl,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    updateDb((prev) => ({
      ...prev,
      hallTickets: editHtId ? prev.hallTickets.map((h) => (h.id === editHtId ? rec : h)) : [rec, ...prev.hallTickets],
    }), editHtId ? 'Hall Ticket updated!' : 'Hall Ticket uploaded to Student Portal!');
    setHtForm(emptyHt);
    setEditHtId(null);
  };

  const classified = db.students.map((s) => {
    const semRes = db.studentSemesterResults.filter((r) => r.usn === s.usn);
    const facMarks = db.subjectMarks.filter((m) => m.usn === s.usn);
    const backlogs = [...new Set([
      ...semRes.filter((r) => r.resultStatus === 'Backlog').map((r) => r.subjectName),
      ...facMarks.filter((m) => m.status === 'Fail').map((m) => m.subjectName),
    ])];
    return { ...s, semRes, backlogs };
  });

  return (
    <div className="stack">
      <PageHeader title="HOD: Exams, Eligibility, Year Back & Hall Tickets" subtitle="Control student next-year eligibility, upload Hall Tickets, allot exam roles/timetable, and monitor Passed/Backlog/Year Back lists." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'eligibility' ? 'active' : ''}`} onClick={() => setSubTab('eligibility')}>Eligibility, Backlogs & Year Back</button>
        <button className={`tab-btn ${subTab === 'hallticket' ? 'active' : ''}`} onClick={() => setSubTab('hallticket')}>Hall Ticket Upload ({db.hallTickets.length})</button>
        <button className={`tab-btn ${subTab === 'exams' ? 'active' : ''}`} onClick={() => setSubTab('exams')}>Exam Timetable & Faculty Roles</button>
      </div>

      {subTab === 'eligibility' && (
        <div className="stack">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Student Semester Eligibility Control & Student-Entered Results</div>
            {classified.length === 0 ? (
              <EmptyState title="No Students Found" message="Students added in Master or College Portal appear here for eligibility decisions." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>USN & Name</th><th>Year / Sem</th><th>Backlogs</th><th>Status</th><th>HOD Permission</th></tr></thead>
                  <tbody>
                    {classified.map((s) => (
                      <tr key={s.usn}>
                        <td><strong>{s.name}</strong><div className="card-sub">{s.usn} • {s.dept}</div></td>
                        <td>Year {s.academicYearLevel} ({s.semester})</td>
                        <td>{s.backlogs.length ? <span className="badge badge-warning">{s.backlogs.join(', ')}</span> : <span className="badge badge-success">All Clear</span>}</td>
                        <td><span className={`badge ${s.eligibilityStatus === 'Year Back' ? 'badge-danger' : 'badge-success'}`}>{s.eligibilityStatus}</span></td>
                        <td className="row">
                          <button className="btn btn-sm btn-success" onClick={() => promoteOrDetain(s.usn, 'Eligible')}><CheckCircle2 size={13} /> Eligible</button>
                          <button className="btn btn-sm btn-primary" onClick={() => promoteOrDetain(s.usn, 'PromoteNextYear')}>Promote Next Year</button>
                          <button className="btn btn-sm btn-danger" onClick={() => promoteOrDetain(s.usn, 'Year Back')}><XCircle size={13} /> Mark Year Back</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Student-Entered Semester Results ({db.studentSemesterResults.length})</div>
            {db.studentSemesterResults.length === 0 ? (
              <EmptyState title="No Semester Results Entered by Students Yet" message="When students enter their semester results in Student Portal, they appear here live." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Student</th><th>Semester</th><th>Subject</th><th>Marks Entered</th><th>SGPA</th><th>Status</th></tr></thead>
                  <tbody>
                    {db.studentSemesterResults.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.studentName}</strong> ({r.usn})</td>
                        <td>{r.semester}</td>
                        <td>{r.subjectName}</td>
                        <td><strong>{r.studentEnteredMarks}/{r.maxMarks}</strong></td>
                        <td>{r.sgpa || '—'}</td>
                        <td><span className={`badge ${r.resultStatus === 'Pass' ? 'badge-success' : 'badge-danger'}`}>{r.resultStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'hallticket' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveHallTicket}>
            <div className="card-title">{editHtId ? 'Edit Hall Ticket' : 'Upload Student Hall Ticket (HOD)'}</div>
            <div className="grid-3">
              <select className="select" value={htForm.usn} onChange={(e) => setHtForm({ ...htForm, usn: e.target.value })} required>
                <option value="">Select Student...</option>
                {db.students.map((s) => <option key={s.usn} value={s.usn}>{s.name} ({s.usn} • {s.semester})</option>)}
              </select>
              <select className="select" value={htForm.semester} onChange={(e) => setHtForm({ ...htForm, semester: e.target.value })}>
                {db.masterSettings.semesters.map((s) => <option key={s}>{s}</option>)}
              </select>
              <input className="input" placeholder="Exam Title (e.g. Dec 2026 Semester Exam)" value={htForm.examTitle} onChange={(e) => setHtForm({ ...htForm, examTitle: e.target.value })} required />
            </div>
            <div className="row">
              <FileUploadButton
                label={htForm.fileName ? `Replace File (${htForm.fileName})` : 'Upload Hall Ticket PDF/Image'}
                onUploaded={(f) => setHtForm((p) => ({ ...p, fileName: f.name, fileDataUrl: f.dataUrl }))}
                onError={(m) => showToast(m, 'error')}
              />
              <button className="btn btn-primary" type="submit"><Upload size={15} /> {editHtId ? 'Update Hall Ticket' : 'Upload Hall Ticket'}</button>
              {editHtId && <button type="button" className="btn" onClick={() => { setEditHtId(null); setHtForm(emptyHt); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            {db.hallTickets.length === 0 ? (
              <EmptyState title="No Hall Tickets Uploaded" message="Upload Hall Tickets above so students can download them." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Student</th><th>Exam & Semester</th><th>File</th><th>Actions</th></tr></thead>
                  <tbody>
                    {db.hallTickets.map((h) => (
                      <tr key={h.id}>
                        <td><strong>{h.studentName}</strong> ({h.usn})</td>
                        <td>{h.examTitle} • {h.semester}</td>
                        <td><DownloadFileButton fileName={h.fileName} dataUrl={h.fileDataUrl} label={h.fileName || 'Download'} /></td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditHtId(h.id); setHtForm(h); }}><Edit3 size={13} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, hallTickets: prev.hallTickets.filter((x) => x.id !== h.id) }), 'Hall ticket deleted')}><Trash2 size={13} /></button>
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

      {subTab === 'exams' && (
        <div className="grid-2">
          <div className="card stack">
            <div className="card-title">Allot Exam Timetable (Affects Faculty & Students)</div>
            <form className="stack" style={{ gap: 10 }} onSubmit={addExam}>
              <input className="input" placeholder="Exam Name (e.g. IA-1 / Semester Exam)" value={exForm.examName} onChange={(e) => setExForm({ ...exForm, examName: e.target.value })} required />
              <select className="select" value={exForm.subjectId} onChange={(e) => setExForm({ ...exForm, subjectId: e.target.value })} required>
                <option value="">Select Subject...</option>
                {db.subjects.map((s) => <option key={s.id} value={s.id}>{s.code} {s.name} ({s.semester})</option>)}
              </select>
              <div className="grid-2">
                <input type="date" className="input" value={exForm.date} onChange={(e) => setExForm({ ...exForm, date: e.target.value })} required />
                <input className="input" placeholder="Time (09:30 - 11:00)" value={exForm.time} onChange={(e) => setExForm({ ...exForm, time: e.target.value })} required />
              </div>
              <div className="grid-2">
                <input className="input" placeholder="Exam Hall / Room" value={exForm.room} onChange={(e) => setExForm({ ...exForm, room: e.target.value })} required />
                <select className="select" value={exForm.invigilatorId} onChange={(e) => setExForm({ ...exForm, invigilatorId: e.target.value })}>
                  <option value="">Assign Invigilator...</option>
                  {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" type="submit"><Plus size={15} /> Publish Exam Slot</button>
            </form>
            {db.exams.map((ex) => (
              <div key={ex.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <div><strong>{ex.examName}: {ex.subjectName}</strong><div className="card-sub">{ex.date} • {ex.time} • {ex.room} • Invigilator: {ex.invigilatorName}</div></div>
                <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, exams: prev.exams.filter((x) => x.id !== ex.id) }), 'Exam deleted')}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>

          <div className="card stack">
            <div className="card-title">Allot Faculty Roles for Exams</div>
            <form className="stack" style={{ gap: 10 }} onSubmit={addExamRole}>
              <select className="select" value={roleForm.facultyId} onChange={(e) => setRoleForm({ ...roleForm, facultyId: e.target.value })} required>
                <option value="">Select Faculty...</option>
                {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.dept})</option>)}
              </select>
              <select className="select" value={roleForm.role} onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}>
                <option>Invigilator</option><option>Exam Squad</option><option>Paper Setter</option><option>Evaluator</option><option>Moderator</option><option>Chief Superintendent</option>
              </select>
              <input className="input" placeholder="Exam Session Name" value={roleForm.examName} onChange={(e) => setRoleForm({ ...roleForm, examName: e.target.value })} required />
              <div className="grid-2">
                <input type="date" className="input" value={roleForm.date} onChange={(e) => setRoleForm({ ...roleForm, date: e.target.value })} required />
                <input className="input" placeholder="Room / Duty Area" value={roleForm.room} onChange={(e) => setRoleForm({ ...roleForm, room: e.target.value })} />
              </div>
              <button className="btn btn-primary" type="submit"><Plus size={15} /> Allot Exam Role</button>
            </form>
            {db.examRoles.map((r) => (
              <div key={r.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <div><strong>{r.facultyName} — <span className="badge">{r.role}</span></strong><div className="card-sub">{r.examName} • {r.date} • {r.room || 'Campus'}</div></div>
                <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, examRoles: prev.examRoles.filter((x) => x.id !== r.id) }), 'Exam role deleted')}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
