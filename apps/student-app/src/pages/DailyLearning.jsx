import React, { useState } from 'react';
import { PlayCircle, Upload, CheckCircle2 } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function DailyLearning() {
  const { db, updateDb, currentUser } = useCampusStore();
  const student = db.students.find((s) => s.email === currentUser?.email) || db.students[0];
  const [subTab, setSubTab] = useState('lectures');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [labUrlMap, setLabUrlMap] = useState({});
  const [asgUrlMap, setAsgUrlMap] = useState({});
  const [leaveForm, setLeaveForm] = useState({ type: 'OD (Hackathon / Event)', from: '', to: '', reason: '' });

  const minAtt = db.masterSettings.minAttendancePercent;

  const submitQuiz = (quiz) => {
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (quizAnswers[`${quiz.id}_${idx}`] === q.answer) score += 1;
    });
    updateDb((prev) => ({
      ...prev,
      quizzes: prev.quizzes.map((q) =>
        q.id === quiz.id
          ? {
              ...q,
              attempts: [
                ...q.attempts.filter((a) => a.usn !== student.usn),
                { usn: student.usn, name: student.name, score, total: quiz.questions.length, date: new Date().toISOString().slice(0, 10) },
              ],
            }
          : q
      ),
    }), `Quiz submitted! You scored ${score}/${quiz.questions.length}`);
  };

  const uploadLabCode = (labId) => {
    const codeUrl = labUrlMap[labId]?.trim();
    if (!codeUrl) return;
    updateDb((prev) => ({
      ...prev,
      labs: prev.labs.map((l) =>
        l.id === labId
          ? {
              ...l,
              submissions: [
                ...l.submissions.filter((s) => s.usn !== student.usn),
                { usn: student.usn, studentName: student.name, batch: student.labBatch, codeUrl, labAttendance: 'Present', vivaMarks: 0, maxViva: 25, status: 'Submitted' },
              ],
            }
          : l
      ),
    }), 'Lab code / record uploaded! Teacher can now enter Viva Marks.');
    setLabUrlMap({ ...labUrlMap, [labId]: '' });
  };

  const submitAssignment = (asgId) => {
    const link = asgUrlMap[asgId]?.trim();
    if (!link) return;
    updateDb((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        a.id === asgId
          ? {
              ...a,
              submissions: [
                ...a.submissions.filter((s) => s.usn !== student.usn),
                { usn: student.usn, studentName: student.name, link, notes: 'Submitted via Student Portal', status: 'Submitted', marks: null },
              ],
            }
          : a
      ),
    }), 'Assignment submitted to Teacher Portal!');
    setAsgUrlMap({ ...asgUrlMap, [asgId]: '' });
  };

  const applyLeave = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      studentLeaves: [{
        id: `SL-${Date.now().toString().slice(-4)}`,
        usn: student.usn,
        studentName: student.name,
        ...leaveForm,
        status: 'Pending',
      }, ...prev.studentLeaves],
    }), 'Leave / OD request submitted to Faculty!');
    setLeaveForm({ type: 'OD (Hackathon / Event)', from: '', to: '', reason: '' });
  };

  return (
    <div className="stack">
      <PageHeader title="2. Daily Learning & Labs" subtitle="Class Timetable, Lectures & Videos, Interactive Quizzes, Lab Manuals & Code Uploads, Attendance Shortage Alerts & Assignments." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'lectures' ? 'active' : ''}`} onClick={() => setSubTab('lectures')}>Lectures, Timetable & Quizzes</button>
        <button className={`tab-btn ${subTab === 'lab' ? 'active' : ''}`} onClick={() => setSubTab('lab')}>Labs, Manuals & Viva</button>
        <button className={`tab-btn ${subTab === 'attendance' ? 'active' : ''}`} onClick={() => setSubTab('attendance')}>Attendance & Leave / OD</button>
        <button className={`tab-btn ${subTab === 'assignments' ? 'active' : ''}`} onClick={() => setSubTab('assignments')}>Assignments & Grades</button>
      </div>

      {subTab === 'lectures' && (
        <div className="stack">
          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Class Timetable ({student.classBatch} / {student.labBatch})</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Room</th></tr></thead>
                  <tbody>
                    {db.timetable.map((t) => (
                      <tr key={t.id}><td><strong>{t.day}</strong></td><td>{t.time}</td><td>{t.subject}</td><td>{t.room}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card stack" style={{ gap: 10 }}>
              <div className="card-title">Videos, Notes & Syllabus Progress</div>
              {db.lectures.map((l) => (
                <div key={l.id} style={{ padding: 12, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                  <strong>{l.title}</strong>
                  <div className="card-sub">{l.subject} • Syllabus: {l.syllabusCovered}/{l.syllabusTotal} Modules • Notes: {l.docTitle}</div>
                  {l.videoUrl && <a className="btn btn-sm" style={{ marginTop: 8 }} href={l.videoUrl} target="_blank" rel="noreferrer"><PlayCircle size={14} /> Watch Lecture</a>}
                </div>
              ))}
            </div>
          </div>

          <div className="card stack">
            <div className="card-title">Attempt Interactive Quizzes (Published by Teacher App)</div>
            {db.quizzes.map((qz) => {
              const myAttempt = qz.attempts.find((a) => a.usn === student.usn);
              return (
                <div key={qz.id} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
                    <div><strong>{qz.title}</strong><div className="card-sub">{qz.subject} • By {qz.createdBy}</div></div>
                    {myAttempt && <span className="badge badge-success">Score: {myAttempt.score}/{myAttempt.total}</span>}
                  </div>
                  <div className="stack" style={{ gap: 12 }}>
                    {qz.questions.map((q, idx) => (
                      <div key={idx}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>{idx + 1}. {q.q}</div>
                        <div className="grid-2" style={{ gap: 8 }}>
                          {q.options.map((opt, oi) => (
                            <label key={oi} className="row" style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13 }}>
                              <input type="radio" name={`${qz.id}_${idx}`} checked={quizAnswers[`${qz.id}_${idx}`] === oi} onChange={() => setQuizAnswers({ ...quizAnswers, [`${qz.id}_${idx}`]: oi })} />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => submitQuiz(qz)}><CheckCircle2 size={15} /> Submit Quiz</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'lab' && (
        <div className="stack">
          {db.labs.map((lab) => {
            const mySub = lab.submissions.find((s) => s.usn === student.usn);
            return (
              <div key={lab.id} className="card stack">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div><strong>{lab.title}</strong><div className="card-sub">{lab.subject} • Batch: {lab.batch} • Manual: {lab.manualFile}</div></div>
                  {mySub && <span className="badge badge-success">Viva: {mySub.vivaMarks}/{mySub.maxViva} • {mySub.labAttendance}</span>}
                </div>
                {lab.programSnippet && (
                  <pre style={{ padding: 12, borderRadius: 10, background: 'var(--bg-base)', overflowX: 'auto', fontSize: 12.5 }}>{lab.programSnippet}</pre>
                )}
                <div className="row">
                  <input className="input" style={{ flex: 1 }} placeholder="Paste GitHub / Lab Record Link to upload..." value={labUrlMap[lab.id] || ''} onChange={(e) => setLabUrlMap({ ...labUrlMap, [lab.id]: e.target.value })} />
                  <button className="btn btn-primary" onClick={() => uploadLabCode(lab.id)}><Upload size={15} /> Upload Lab Code</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'attendance' && (
        <div className="grid-2">
          <div className="card stack">
            <div className="card-title">Subject Attendance % (Master Min Rule: {minAtt}%)</div>
            {Object.entries(student.attendance).map(([sub, pct]) => (
              <div key={sub}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong>{sub}</strong>
                  <span className={`badge ${pct < minAtt ? 'badge-danger' : 'badge-success'}`}>{pct}% {pct < minAtt ? '— SHORTAGE' : '— OK'}</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: pct < minAtt ? 'var(--danger)' : undefined }} /></div>
              </div>
            ))}
          </div>

          <div className="card stack">
            <div className="card-title">Apply Leave / OD Request</div>
            <form className="stack" style={{ gap: 10 }} onSubmit={applyLeave}>
              <select className="select" value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}>
                <option>OD (Hackathon / Event)</option><option>Medical Leave</option><option>Personal Leave</option>
              </select>
              <div className="grid-2">
                <input type="date" className="input" value={leaveForm.from} onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })} required />
                <input type="date" className="input" value={leaveForm.to} onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })} required />
              </div>
              <input className="input" placeholder="Reason / Proof details" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
              <button className="btn btn-primary" type="submit">Submit Request</button>
            </form>
            {db.studentLeaves.filter((l) => l.usn === student.usn).map((l) => (
              <div key={l.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <div><strong>{l.type}</strong><div className="card-sub">{l.from} to {l.to}</div></div>
                <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'assignments' && (
        <div className="stack">
          {db.assignments.map((a) => {
            const mySub = a.submissions.find((s) => s.usn === student.usn);
            return (
              <div key={a.id} className="card stack">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div><strong>{a.title}</strong><div className="card-sub">{a.subject} • {a.type} • Due: {a.dueDate} • Max Marks: {a.maxMarks}</div></div>
                  {mySub ? <span className="badge badge-success">{mySub.status} {mySub.marks !== null ? `• ${mySub.marks}/${a.maxMarks}` : ''}</span> : <span className="badge badge-warning">Pending</span>}
                </div>
                <div className="row">
                  <input className="input" style={{ flex: 1 }} placeholder="Paste GitHub / Google Drive submission URL..." value={asgUrlMap[a.id] || ''} onChange={(e) => setAsgUrlMap({ ...asgUrlMap, [a.id]: e.target.value })} />
                  <button className="btn btn-primary" onClick={() => submitAssignment(a.id)}><Upload size={15} /> Submit Work</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
