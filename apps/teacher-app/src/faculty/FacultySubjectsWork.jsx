import React, { useState } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function FacultySubjectsWork() {
  const { db, updateDb, currentUser } = useCampusStore();
  const [subTab, setSubTab] = useState('syllabus');

  const mySubjects = db.subjects.filter((s) => s.facultyId === currentUser.refId);
  const [selectedSubId, setSelectedSubId] = useState(mySubjects[0]?.id || '');
  const activeSub = mySubjects.find((s) => s.id === selectedSubId) || mySubjects[0];

  // Syllabus calendar log
  const [sylForm, setSylForm] = useState({ date: new Date().toISOString().slice(0, 10), moduleNo: '1', topic: '', hours: 1, completionPercent: 20 });

  // Attendance session
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attType, setAttType] = useState('Class');
  const [attTopic, setAttTopic] = useState('');
  const [attMap, setAttMap] = useState({});

  // Marks input map
  const [marksDraft, setMarksDraft] = useState({});

  if (mySubjects.length === 0) {
    return (
      <div className="stack">
        <PageHeader title="My Allotted Subjects Workspace" subtitle="Job-scoped Faculty Portal — displays ONLY subjects allotted to you by HOD or College." />
        <EmptyState title="No Subjects Allotted to You Yet" message="Once your HOD or College Admin allots subjects to your account, your syllabus calendar, class/lab attendance, marks, quizzes, and assignments will unlock automatically." />
      </div>
    );
  }

  const subStudents = db.students.filter((s) => s.semester === activeSub.semester && (!activeSub.dept || s.dept === activeSub.dept));

  const addSyllabusLog = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      syllabusLogs: [{
        id: `SYL-${Date.now().toString().slice(-4)}`,
        subjectId: activeSub.id,
        subjectName: `${activeSub.code} ${activeSub.name}`,
        facultyId: currentUser.refId,
        facultyName: currentUser.name,
        ...sylForm,
        hours: Number(sylForm.hours) || 1,
        completionPercent: Number(sylForm.completionPercent) || 0,
      }, ...prev.syllabusLogs],
    }), 'Calendar-wise syllabus log saved & displayed to HOD!');
    setSylForm({ ...sylForm, topic: '' });
  };

  const saveAttendance = (e) => {
    e.preventDefault();
    const records = {};
    subStudents.forEach((s) => { records[s.usn] = attMap[s.usn] || 'Present'; });
    updateDb((prev) => ({
      ...prev,
      attendanceLogs: [{
        id: `ATT-${Date.now().toString().slice(-4)}`,
        subjectId: activeSub.id,
        subjectName: `${activeSub.code} ${activeSub.name}`,
        facultyId: currentUser.refId,
        date: attDate,
        sessionType: attType,
        topic: attTopic,
        records,
      }, ...prev.attendanceLogs],
    }), `${attType} attendance saved for ${activeSub.code}!`);
    setAttTopic('');
  };

  const saveStudentMarks = (st) => {
    const d = marksDraft[st.usn] || {};
    const existing = db.subjectMarks.find((m) => m.subjectId === activeSub.id && m.usn === st.usn);
    const ia = Number(d.iaMarks ?? existing?.iaMarks ?? 0);
    const lab = Number(d.labMarks ?? existing?.labMarks ?? 0);
    const total = ia + lab;
    const maxMarks = Number(db.masterSettings.maxMarks) || 100;
    const status = (total / maxMarks) * 100 >= (Number(db.masterSettings.passPercent) || 40) ? 'Pass' : 'Fail';
    const rec = {
      id: existing?.id || `MRK-${Date.now().toString().slice(-4)}`,
      subjectId: activeSub.id,
      subjectName: `${activeSub.code} ${activeSub.name}`,
      semester: activeSub.semester,
      usn: st.usn,
      studentName: st.name,
      facultyId: currentUser.refId,
      iaMarks: ia,
      labMarks: lab,
      totalMarks: total,
      maxMarks,
      status,
    };
    updateDb((prev) => ({
      ...prev,
      subjectMarks: [...prev.subjectMarks.filter((m) => !(m.subjectId === activeSub.id && m.usn === st.usn)), rec],
    }), `Marks allotted for ${st.name} (reflected live on Student Result)!`);
  };

  const mySylLogs = db.syllabusLogs.filter((l) => l.subjectId === activeSub.id);
  const myAttLogs = db.attendanceLogs.filter((l) => l.subjectId === activeSub.id);

  return (
    <div className="stack">
      <PageHeader
        title="My Allotted Subjects — Syllabus, Attendance & Marks"
        subtitle="You only see subjects allotted to you by HOD / College."
        actions={
          <select className="select" style={{ width: 290 }} value={activeSub.id} onChange={(e) => setSelectedSubId(e.target.value)}>
            {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name} ({s.semester} • {s.type})</option>)}
          </select>
        }
      />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'syllabus' ? 'active' : ''}`} onClick={() => setSubTab('syllabus')}>Calendar-wise Syllabus Covered</button>
        <button className={`tab-btn ${subTab === 'attendance' ? 'active' : ''}`} onClick={() => setSubTab('attendance')}>Class & Lab Attendance</button>
        <button className={`tab-btn ${subTab === 'marks' ? 'active' : ''}`} onClick={() => setSubTab('marks')}>Subject & Lab Marks Allotment</button>
      </div>

      {subTab === 'syllabus' && (
        <div className="stack">
          <form className="card stack" onSubmit={addSyllabusLog}>
            <div className="card-title">Log Syllabus Covered (Displayed Calendar-wise to HOD)</div>
            <div className="grid-4">
              <div className="field"><label>Date</label><input type="date" className="input" value={sylForm.date} onChange={(e) => setSylForm({ ...sylForm, date: e.target.value })} required /></div>
              <div className="field"><label>Module No.</label><input className="input" value={sylForm.moduleNo} onChange={(e) => setSylForm({ ...sylForm, moduleNo: e.target.value })} required /></div>
              <div className="field"><label>Hours</label><input type="number" min="1" className="input" value={sylForm.hours} onChange={(e) => setSylForm({ ...sylForm, hours: e.target.value })} /></div>
              <div className="field"><label>Total Completion %</label><input type="number" min="0" max="100" className="input" value={sylForm.completionPercent} onChange={(e) => setSylForm({ ...sylForm, completionPercent: e.target.value })} /></div>
            </div>
            <input className="input" placeholder="Topic covered in class/lab..." value={sylForm.topic} onChange={(e) => setSylForm({ ...sylForm, topic: e.target.value })} required />
            <div><button className="btn btn-primary" type="submit"><Plus size={15} /> Add Calendar Entry</button></div>
          </form>

          <div className="card">
            {mySylLogs.length === 0 ? <EmptyState title="No Syllabus Entries Yet" message="Log today's covered topic above." /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Module</th><th>Topic Covered</th><th>Completion</th><th>Delete</th></tr></thead>
                  <tbody>
                    {mySylLogs.map((l) => (
                      <tr key={l.id}>
                        <td><strong>{l.date}</strong></td>
                        <td>Mod {l.moduleNo}</td>
                        <td>{l.topic} ({l.hours}h)</td>
                        <td><span className="badge badge-success">{l.completionPercent}%</span></td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, syllabusLogs: prev.syllabusLogs.filter((x) => x.id !== l.id) }), 'Log deleted')}><Trash2 size={13} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'attendance' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveAttendance}>
            <div className="card-title">Mark Class / Lab Attendance — {activeSub.code} ({activeSub.semester})</div>
            <div className="grid-3">
              <input type="date" className="input" value={attDate} onChange={(e) => setAttDate(e.target.value)} required />
              <select className="select" value={attType} onChange={(e) => setAttType(e.target.value)}>
                <option value="Class">Theory Class</option>
                <option value="Lab">Lab Session</option>
              </select>
              <input className="input" placeholder="Topic / Experiment Name" value={attTopic} onChange={(e) => setAttTopic(e.target.value)} />
            </div>
            {subStudents.length === 0 ? (
              <EmptyState title={`No Students in ${activeSub.dept} ${activeSub.semester}`} message="Admitted students in this semester will appear automatically." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>USN</th><th>Student</th><th>Status</th></tr></thead>
                  <tbody>
                    {subStudents.map((s) => {
                      const val = attMap[s.usn] || 'Present';
                      return (
                        <tr key={s.usn}>
                          <td><code>{s.usn}</code></td>
                          <td><strong>{s.name}</strong></td>
                          <td className="row">
                            <button type="button" className={`btn btn-sm ${val === 'Present' ? 'btn-success' : ''}`} onClick={() => setAttMap({ ...attMap, [s.usn]: 'Present' })}>Present</button>
                            <button type="button" className={`btn btn-sm ${val === 'Absent' ? 'btn-danger' : ''}`} onClick={() => setAttMap({ ...attMap, [s.usn]: 'Absent' })}>Absent</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {subStudents.length > 0 && <div><button className="btn btn-primary" type="submit"><CheckCircle2 size={15} /> Save Attendance Session</button></div>}
          </form>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Past Attendance Sessions ({myAttLogs.length})</div>
            {myAttLogs.map((log) => {
              const vals = Object.values(log.records);
              const pres = vals.filter((v) => v === 'Present').length;
              return (
                <div key={log.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 5, background: 'var(--surface-elevated)', marginBottom: 8 }}>
                  <div><strong>{log.date} — {log.sessionType}</strong> {log.topic ? `(${log.topic})` : ''}</div>
                  <div className="row">
                    <span className="badge badge-success">{pres}/{vals.length} Present</span>
                    <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, attendanceLogs: prev.attendanceLogs.filter((x) => x.id !== log.id) }), 'Attendance session deleted')}><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'marks' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Subject & Lab Marks Allotment — {activeSub.code} {activeSub.name}</div>
          {subStudents.length === 0 ? (
            <EmptyState title="No Students in This Semester" message="Students enrolled in this semester will appear here for marks entry." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>USN & Name</th><th>Subject / IA Marks</th><th>Lab Marks</th><th>Total</th><th>Action</th></tr></thead>
                <tbody>
                  {subStudents.map((st) => {
                    const existing = db.subjectMarks.find((m) => m.subjectId === activeSub.id && m.usn === st.usn);
                    const draft = marksDraft[st.usn] || {};
                    const ia = draft.iaMarks ?? existing?.iaMarks ?? '';
                    const lab = draft.labMarks ?? existing?.labMarks ?? '';
                    return (
                      <tr key={st.usn}>
                        <td><strong>{st.name}</strong><div className="card-sub">{st.usn}</div></td>
                        <td><input type="number" className="input" style={{ width: 90 }} value={ia} onChange={(e) => setMarksDraft({ ...marksDraft, [st.usn]: { ...draft, iaMarks: e.target.value } })} placeholder="0" /></td>
                        <td><input type="number" className="input" style={{ width: 90 }} value={lab} onChange={(e) => setMarksDraft({ ...marksDraft, [st.usn]: { ...draft, labMarks: e.target.value } })} placeholder="0" /></td>
                        <td><strong>{(Number(ia) || 0) + (Number(lab) || 0)}/{db.masterSettings.maxMarks}</strong></td>
                        <td><button className="btn btn-sm btn-primary" onClick={() => saveStudentMarks(st)}>Save Marks</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
