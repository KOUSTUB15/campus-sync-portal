import React, { useState } from 'react';
import { Plus, FlaskConical, CalendarClock } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function ClassroomLab() {
  const { db, updateDb, currentUser } = useCampusStore();
  const [subTab, setSubTab] = useState('lectures');

  const [lecForm, setLecForm] = useState({ subject: 'Full Stack Web Dev (21CS51)', title: '', videoUrl: '', docTitle: '', syllabusCovered: 4, syllabusTotal: 5 });
  const [asgForm, setAsgForm] = useState({ subject: 'Full Stack Web Dev (21CS51)', title: '', dueDate: '', maxMarks: 20, type: 'Assignment' });
  const [labForm, setLabForm] = useState({ subject: 'Web Tech Lab (21CSL55)', batch: 'B1 & B2', title: '', manualFile: '', programSnippet: '' });
  const [leaveForm, setLeaveForm] = useState({ from: '', to: '', type: 'Casual Leave', substitute: 'Dr. Meera Joshi' });

  const addLecture = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      lectures: [{
        id: `LEC-${Date.now().toString().slice(-4)}`,
        ...lecForm,
        syllabusCovered: Number(lecForm.syllabusCovered),
        syllabusTotal: Number(lecForm.syllabusTotal),
        postedBy: currentUser?.name || 'Prof. Ananya Sharma',
        date: new Date().toISOString().slice(0, 10),
      }, ...prev.lectures],
    }), 'Lecture & Notes published directly to Student App!');
    setLecForm({ ...lecForm, title: '', videoUrl: '', docTitle: '' });
  };

  const addAssignment = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      assignments: [{
        id: `ASG-${Date.now().toString().slice(-4)}`,
        ...asgForm,
        maxMarks: Number(asgForm.maxMarks),
        submissions: [],
      }, ...prev.assignments],
    }), 'Assignment / AICTE Task pushed to Student App!');
    setAsgForm({ ...asgForm, title: '', dueDate: '' });
  };

  const addLab = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      labs: [{
        id: `LAB-${Date.now().toString().slice(-4)}`,
        ...labForm,
        submissions: [],
      }, ...prev.labs],
    }), 'Lab Manual & Program published to Student App!');
    setLabForm({ ...labForm, title: '', manualFile: '', programSnippet: '' });
  };

  const updateViva = (labId, usn, marks) => {
    updateDb((prev) => ({
      ...prev,
      labs: prev.labs.map((l) =>
        l.id === labId
          ? { ...l, submissions: l.submissions.map((s) => (s.usn === usn ? { ...s, vivaMarks: Number(marks), status: 'Evaluated' } : s)) }
          : l
      ),
    }), `Lab Viva score updated for ${usn}`);
  };

  const updateStudentBatch = (usn, field, value) => {
    updateDb((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.usn === usn ? { ...s, [field]: value } : s)),
    }), `Updated ${field} for ${usn} (synced to Student App)`);
  };

  const setSubstitute = (ttId, substitute) => {
    updateDb((prev) => ({
      ...prev,
      timetable: prev.timetable.map((t) => (t.id === ttId ? { ...t, substitute } : t)),
    }), 'Substitute faculty assigned');
  };

  const applyLeave = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      facultyLeaves: [{
        id: `FL-${Date.now().toString().slice(-4)}`,
        teacherId: currentUser?.code || 'FAC-CSE-104',
        teacherName: currentUser?.name || 'Prof. Ananya Sharma',
        dept: currentUser?.dept || 'CSE',
        ...leaveForm,
        status: 'Pending',
      }, ...prev.facultyLeaves],
    }), 'Leave request sent to College Admin Portal for approval!');
    setLeaveForm({ from: '', to: '', type: 'Casual Leave', substitute: 'Dr. Meera Joshi' });
  };

  return (
    <div className="stack">
      <PageHeader title="Classroom & Lab Teaching" subtitle="Publish lectures, syllabus progress, assignments, lab manuals & viva grades, B1/B2 batches, and timetable substitutes." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'lectures' ? 'active' : ''}`} onClick={() => setSubTab('lectures')}>Lectures, Syllabus & Assignments</button>
        <button className={`tab-btn ${subTab === 'lab' ? 'active' : ''}`} onClick={() => setSubTab('lab')}>Labs, Manuals & Viva Marks</button>
        <button className={`tab-btn ${subTab === 'batch' ? 'active' : ''}`} onClick={() => setSubTab('batch')}>Batch Setting (B1/B2 & Electives)</button>
        <button className={`tab-btn ${subTab === 'timetable' ? 'active' : ''}`} onClick={() => setSubTab('timetable')}>Timetable, Substitute & Leave</button>
      </div>

      {subTab === 'lectures' && (
        <div className="stack">
          <div className="grid-2">
            <form className="card stack" onSubmit={addLecture}>
              <div className="card-title">Create Lecture (Video, Docs & Syllabus Progress)</div>
              <input className="input" placeholder="Subject" value={lecForm.subject} onChange={(e) => setLecForm({ ...lecForm, subject: e.target.value })} required />
              <input className="input" placeholder="Lecture / Module Title" value={lecForm.title} onChange={(e) => setLecForm({ ...lecForm, title: e.target.value })} required />
              <input className="input" placeholder="Video Link (YouTube / Drive)" value={lecForm.videoUrl} onChange={(e) => setLecForm({ ...lecForm, videoUrl: e.target.value })} />
              <input className="input" placeholder="Notes / PDF Document Name" value={lecForm.docTitle} onChange={(e) => setLecForm({ ...lecForm, docTitle: e.target.value })} />
              <div className="grid-2">
                <div className="field"><label>Modules Covered</label><input type="number" className="input" value={lecForm.syllabusCovered} onChange={(e) => setLecForm({ ...lecForm, syllabusCovered: e.target.value })} /></div>
                <div className="field"><label>Total Modules</label><input type="number" className="input" value={lecForm.syllabusTotal} onChange={(e) => setLecForm({ ...lecForm, syllabusTotal: e.target.value })} /></div>
              </div>
              <button className="btn btn-primary" type="submit"><Plus size={15} /> Publish Lecture</button>
            </form>

            <form className="card stack" onSubmit={addAssignment}>
              <div className="card-title">Post Assignment / AICTE Activity Task</div>
              <input className="input" placeholder="Subject" value={asgForm.subject} onChange={(e) => setAsgForm({ ...asgForm, subject: e.target.value })} required />
              <input className="input" placeholder="Assignment Title" value={asgForm.title} onChange={(e) => setAsgForm({ ...asgForm, title: e.target.value })} required />
              <div className="grid-3">
                <div className="field"><label>Due Date</label><input type="date" className="input" value={asgForm.dueDate} onChange={(e) => setAsgForm({ ...asgForm, dueDate: e.target.value })} required /></div>
                <div className="field"><label>Max Marks</label><input type="number" className="input" value={asgForm.maxMarks} onChange={(e) => setAsgForm({ ...asgForm, maxMarks: e.target.value })} /></div>
                <div className="field">
                  <label>Category</label>
                  <select className="select" value={asgForm.type} onChange={(e) => setAsgForm({ ...asgForm, type: e.target.value })}>
                    <option>Assignment</option><option>AICTE Task</option><option>Quiz Prep</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" type="submit"><Plus size={15} /> Publish Task</button>
            </form>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Published Lectures & Syllabus Coverage</div>
            <div className="stack" style={{ gap: 10 }}>
              {db.lectures.map((l) => {
                const pct = Math.round((l.syllabusCovered / l.syllabusTotal) * 100);
                return (
                  <div key={l.id} style={{ padding: 12, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <div><strong>{l.title}</strong><div className="card-sub">{l.subject} • Doc: {l.docTitle || 'None'} • {l.date}</div></div>
                      <span className="badge badge-success">{l.syllabusCovered}/{l.syllabusTotal} Modules ({pct}%)</span>
                    </div>
                    <div className="progress-track" style={{ marginTop: 8 }}><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subTab === 'lab' && (
        <div className="stack">
          <form className="card stack" onSubmit={addLab}>
            <div className="row"><FlaskConical size={18} color="var(--accent)" /><span className="card-title">Upload Lab Manual & Starter Program</span></div>
            <div className="grid-3">
              <input className="input" placeholder="Lab Subject" value={labForm.subject} onChange={(e) => setLabForm({ ...labForm, subject: e.target.value })} required />
              <input className="input" placeholder="Experiment Title" value={labForm.title} onChange={(e) => setLabForm({ ...labForm, title: e.target.value })} required />
              <input className="input" placeholder="Manual Filename (PDF)" value={labForm.manualFile} onChange={(e) => setLabForm({ ...labForm, manualFile: e.target.value })} required />
            </div>
            <textarea className="textarea" placeholder="Reference Program Code Snippet..." value={labForm.programSnippet} onChange={(e) => setLabForm({ ...labForm, programSnippet: e.target.value })} />
            <div><button className="btn btn-primary" type="submit">Publish Lab Experiment</button></div>
          </form>

          {db.labs.map((lab) => (
            <div key={lab.id} className="card">
              <div className="card-header">
                <div><div className="card-title">{lab.title}</div><div className="card-sub">{lab.subject} • Batch: {lab.batch} • Manual: {lab.manualFile}</div></div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>USN</th><th>Student</th><th>Batch</th><th>Code Repo</th><th>Attendance</th><th>Viva Marks (/{25})</th></tr></thead>
                  <tbody>
                    {lab.submissions.map((s) => (
                      <tr key={s.usn}>
                        <td><code>{s.usn}</code></td>
                        <td><strong>{s.studentName}</strong></td>
                        <td><span className="badge">{s.batch}</span></td>
                        <td><a href={s.codeUrl} target="_blank" rel="noreferrer">View Code</a></td>
                        <td><span className="badge badge-success">{s.labAttendance}</span></td>
                        <td>
                          <input
                            type="number"
                            max="25"
                            className="input"
                            style={{ width: 82, padding: '5px 8px' }}
                            value={s.vivaMarks}
                            onChange={(e) => updateViva(lab.id, s.usn, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'batch' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Theory & Lab Batches (B1/B2), USN Mapping & Elective Assignment</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>USN</th><th>Student</th><th>Theory Batch</th><th>Lab Batch</th><th>Elective Group</th></tr></thead>
              <tbody>
                {db.students.map((s) => (
                  <tr key={s.usn}>
                    <td><code>{s.usn}</code></td>
                    <td><strong>{s.name}</strong></td>
                    <td>
                      <select className="select" value={s.classBatch} onChange={(e) => updateStudentBatch(s.usn, 'classBatch', e.target.value)}>
                        <option>CSE-A</option><option>CSE-B</option><option>AIML-A</option><option>ECE-A</option>
                      </select>
                    </td>
                    <td>
                      <select className="select" value={s.labBatch} onChange={(e) => updateStudentBatch(s.usn, 'labBatch', e.target.value)}>
                        <option>B1</option><option>B2</option><option>B3</option>
                      </select>
                    </td>
                    <td>
                      <select className="select" value={s.elective} onChange={(e) => updateStudentBatch(s.usn, 'elective', e.target.value)}>
                        <option>Cloud & DevOps</option><option>Cyber Security</option><option>Generative AI</option><option>IoT & Embedded</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'timetable' && (
        <div className="grid-2">
          <div className="card">
            <div className="row" style={{ marginBottom: 12 }}><CalendarClock size={18} color="var(--accent)" /><span className="card-title">Class Schedule & Substitute Assignment</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Day & Time</th><th>Subject</th><th>Room</th><th>Substitute</th></tr></thead>
                <tbody>
                  {db.timetable.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.day}</strong><div className="card-sub">{t.time}</div></td>
                      <td>{t.subject}</td>
                      <td>{t.room}</td>
                      <td>
                        <select className="select" value={t.substitute} onChange={(e) => setSubstitute(t.id, e.target.value)}>
                          <option value="">None (Self)</option>
                          {db.teachers.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card stack">
            <div className="card-title">Apply for Faculty Leave (Syncs to College Admin)</div>
            <form className="stack" style={{ gap: 10 }} onSubmit={applyLeave}>
              <div className="grid-2">
                <div className="field"><label>From</label><input type="date" className="input" value={leaveForm.from} onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })} required /></div>
                <div className="field"><label>To</label><input type="date" className="input" value={leaveForm.to} onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })} required /></div>
              </div>
              <input className="input" placeholder="Leave Type / Reason" value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })} required />
              <select className="select" value={leaveForm.substitute} onChange={(e) => setLeaveForm({ ...leaveForm, substitute: e.target.value })}>
                {db.teachers.map((f) => <option key={f.id} value={f.name}>Substitute: {f.name}</option>)}
              </select>
              <button className="btn btn-primary" type="submit">Submit Leave to College Portal</button>
            </form>
            <div className="stack" style={{ gap: 8 }}>
              {db.facultyLeaves.map((l) => (
                <div key={l.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                  <div><strong>{l.type}</strong><div className="card-sub">{l.from} to {l.to} • Sub: {l.substitute}</div></div>
                  <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
