import React, { useState } from 'react';
import { Save, Printer, Receipt } from 'lucide-react';
import { useCampusStore, PageHeader, printDocumentHtml } from '@campus/shared-core';

export default function SessionProfile() {
  const { db, updateDb, currentUser } = useCampusStore();
  const student = db.students.find((s) => s.email === currentUser?.email) || db.students[0];
  const [subTab, setSubTab] = useState('session');
  const [form, setForm] = useState(student);
  const [resume, setResume] = useState(student.resume);

  const saveSessionAndBatch = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.usn === student.usn
          ? { ...s, semester: form.semester, sessionType: form.sessionType, classBatch: form.classBatch, labBatch: form.labBatch, elective: form.elective }
          : s
      ),
    }), 'Session & Batch settings saved (synced to Teacher & College apps)');
  };

  const saveResume = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.usn === student.usn ? { ...s, resume } : s)),
    }), 'ATS Resume profile saved!');
  };

  const printResume = () => {
    printDocumentHtml(`ATS_Resume_${student.usn}`, `
      <div class="doc-box">
        <h1>${student.name}</h1>
        <div class="sub">${resume.headline} • ${student.email} • USN: ${student.usn} • ${student.dept} (${student.semester})</div>
        <h2>Education</h2>
        <p><strong>${db.masterSettings.institutionName}</strong> — B.E. in ${student.dept} • CGPA: <strong>${student.cgpa}</strong></p>
        <h2>Technical Skills</h2>
        <p>${resume.skills}</p>
        <h2>Key Projects</h2>
        <p>${resume.projects}</p>
        <h2>Achievements & AICTE Activities (${student.aictePoints} Pts)</h2>
        <p>${resume.achievements}</p>
      </div>
    `);
  };

  return (
    <div className="stack">
      <PageHeader title="1. Session & Profile Setup" subtitle="Session Defining (Regular/Backlog), Class & Lab Batch (B1/B2), Elective Group, ATS Resume Builder, Fee Receipts & Academic Calendar." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'session' ? 'active' : ''}`} onClick={() => setSubTab('session')}>Session & Batch Setting</button>
        <button className={`tab-btn ${subTab === 'profile' ? 'active' : ''}`} onClick={() => setSubTab('profile')}>Profile, ATS Resume & Fee Receipt</button>
        <button className={`tab-btn ${subTab === 'academic' ? 'active' : ''}`} onClick={() => setSubTab('academic')}>Academic Calendar & Results</button>
      </div>

      {subTab === 'session' && (
        <form className="card stack" onSubmit={saveSessionAndBatch}>
          <div className="card-title">Academic Year, Session Defining & Batch Selection</div>
          <div className="grid-3">
            <div className="field"><label>Academic Year (From Master)</label><input className="input" value={db.masterSettings.academicYear} disabled /></div>
            <div className="field">
              <label>Semester</label>
              <select className="select" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                {db.masterSettings.semesters.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Session Type</label>
              <select className="select" value={form.sessionType} onChange={(e) => setForm({ ...form, sessionType: e.target.value })}>
                <option>Regular</option><option>Regular + Backlog</option><option>Backlog Only</option>
              </select>
            </div>
            <div className="field">
              <label>Class Batch</label>
              <select className="select" value={form.classBatch} onChange={(e) => setForm({ ...form, classBatch: e.target.value })}>
                <option>CSE-A</option><option>CSE-B</option><option>AIML-A</option><option>ECE-A</option>
              </select>
            </div>
            <div className="field">
              <label>Lab Batch (B1 / B2)</label>
              <select className="select" value={form.labBatch} onChange={(e) => setForm({ ...form, labBatch: e.target.value })}>
                <option>B1</option><option>B2</option><option>B3</option>
              </select>
            </div>
            <div className="field">
              <label>Elective Group Selection</label>
              <select className="select" value={form.elective} onChange={(e) => setForm({ ...form, elective: e.target.value })}>
                <option>Cloud & DevOps</option><option>Cyber Security</option><option>Generative AI</option><option>IoT & Embedded</option>
              </select>
            </div>
          </div>
          <div><button className="btn btn-primary" type="submit"><Save size={15} /> Save Session & Batch</button></div>
        </form>
      )}

      {subTab === 'profile' && (
        <div className="grid-2">
          <form className="card stack" onSubmit={saveResume}>
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div className="card-title">ATS Resume Builder</div>
              <button type="button" className="btn btn-sm" onClick={printResume}><Printer size={14} /> Export PDF</button>
            </div>
            <div className="field"><label>Professional Headline</label><input className="input" value={resume.headline} onChange={(e) => setResume({ ...resume, headline: e.target.value })} /></div>
            <div className="field"><label>Skills</label><input className="input" value={resume.skills} onChange={(e) => setResume({ ...resume, skills: e.target.value })} /></div>
            <div className="field"><label>Core Technical Projects</label><textarea className="textarea" value={resume.projects} onChange={(e) => setResume({ ...resume, projects: e.target.value })} /></div>
            <div className="field"><label>Achievements</label><textarea className="textarea" value={resume.achievements} onChange={(e) => setResume({ ...resume, achievements: e.target.value })} /></div>
            <button className="btn btn-primary" type="submit"><Save size={15} /> Save Resume</button>
          </form>

          <div className="card stack">
            <div className="row"><Receipt size={18} color="var(--accent)" /><span className="card-title">USN Identity, Fee Receipts & Scholarship</span></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>USN</span><strong>{student.usn}</strong></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>Department</span><strong>{student.dept}</strong></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>Annual Tuition Fee</span><strong>₹{student.feeAmount.toLocaleString()}</strong></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>Fee Status</span><span className={`badge ${student.feeStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`}>{student.feeStatus}</span></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>Receipt No.</span><code>{student.receiptNo}</code></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>Scholarship</span><strong>{student.scholarship}</strong></div>
          </div>
        </div>
      )}

      {subTab === 'academic' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Master Academic Calendar</div>
            <div className="stack" style={{ gap: 8 }}>
              {db.academicCalendar.map((c) => (
                <div key={c.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                  <div><strong>{c.event}</strong><div className="card-sub">{c.date}</div></div>
                  <span className="badge">{c.category}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Internal Results Summary (CGPA: {student.cgpa})</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Subject</th><th>IA Score</th><th>Status</th></tr></thead>
                <tbody>
                  {Object.entries(student.iaMarks).map(([sub, m]) => (
                    <tr key={sub}><td>{sub}</td><td><strong>{m}/{db.masterSettings.iaMaxMarks}</strong></td><td><span className={`badge ${m >= 20 ? 'badge-success' : 'badge-danger'}`}>{m >= 20 ? 'Qualified' : 'Improve'}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
