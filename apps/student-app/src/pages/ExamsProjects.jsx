import React, { useState } from 'react';
import { Printer, Send, Upload, FileText } from 'lucide-react';
import { useCampusStore, PageHeader, printDocumentHtml } from '@campus/shared-core';

export default function ExamsProjects() {
  const { db, updateDb, currentUser } = useCampusStore();
  const student = db.students.find((s) => s.email === currentUser?.email) || db.students[0];
  const [subTab, setSubTab] = useState('exams');
  const [revForm, setRevForm] = useState({ subject: 'Full Stack Web Dev (21CS51)', reason: '' });
  const [prjUpdate, setPrjUpdate] = useState({ milestone: '', repoUrl: '', reportFile: '' });
  const [chatText, setChatText] = useState('');

  const printHallTicket = () => {
    const rows = db.exams.map((ex) => `<tr><td>${ex.subject}</td><td>${ex.date}</td><td>${ex.time}</td><td>${ex.room}</td></tr>`).join('');
    printDocumentHtml(`HallTicket_${student.usn}`, `
      <div class="doc-box">
        <h1>${db.masterSettings.institutionName}</h1>
        <div class="sub">OFFICIAL EXAMINATION HALL TICKET • ${db.masterSettings.academicYear}</div>
        <p><strong>Candidate:</strong> ${student.name} &nbsp;|&nbsp; <strong>USN:</strong> ${student.usn} &nbsp;|&nbsp; <strong>Dept:</strong> ${student.dept} (${student.semester})</p>
        <table><thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Seating Hall</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="sig"><div>Student Signature</div><div class="stamp">CONTROLLER OF EXAMINATIONS VERIFIED</div></div>
      </div>
    `);
  };

  const applyReval = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      revaluations: [{
        id: `REV-${Date.now().toString().slice(-4)}`,
        usn: student.usn,
        studentName: student.name,
        subject: revForm.subject,
        currentMarks: student.iaMarks[revForm.subject] ?? 0,
        reason: revForm.reason,
        status: 'Submitted',
      }, ...prev.revaluations],
    }), 'Revaluation request submitted!');
    setRevForm({ ...revForm, reason: '' });
  };

  const myProject = db.projects.find((p) => p.teamUsns.includes(student.usn)) || db.projects[0];

  const updateProjectSubmission = (e) => {
    e.preventDefault();
    if (!myProject) return;
    updateDb((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === myProject.id
          ? {
              ...p,
              milestone: prjUpdate.milestone || p.milestone,
              repoUrl: prjUpdate.repoUrl || p.repoUrl,
              reportFile: prjUpdate.reportFile || p.reportFile,
            }
          : p
      ),
    }), 'Project synopsis/report updated for Guide review!');
    setPrjUpdate({ milestone: '', repoUrl: '', reportFile: '' });
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    updateDb((prev) => ({
      ...prev,
      mentorChats: [...prev.mentorChats, {
        id: `MC-${Date.now().toString().slice(-4)}`,
        usn: student.usn,
        mentorId: student.mentorId,
        sender: 'student',
        senderName: student.name,
        text: chatText.trim(),
        time: new Date().toLocaleString(),
      }],
    }), 'Message sent to Mentor (live in Teacher Portal)');
    setChatText('');
  };

  const mentor = db.teachers.find((t) => t.id === student.mentorId) || db.teachers[0];
  const chats = db.mentorChats.filter((c) => c.usn === student.usn);

  return (
    <div className="stack">
      <PageHeader title="3. Exams, Projects & Guides" subtitle="Download Hall Ticket, Timetable & Model QPs, Revaluation Requests, Project Synopsis/Milestones, and Assigned Mentor Chat." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'exams' ? 'active' : ''}`} onClick={() => setSubTab('exams')}>Hall Ticket, Timetable, QPs & Reval</button>
        <button className={`tab-btn ${subTab === 'project' ? 'active' : ''}`} onClick={() => setSubTab('project')}>Project Synopsis & Milestones</button>
        <button className={`tab-btn ${subTab === 'guides' ? 'active' : ''}`} onClick={() => setSubTab('guides')}>Assigned Mentor & Meeting Chat</button>
      </div>

      {subTab === 'exams' && (
        <div className="stack">
          <div className="card">
            <div className="card-header">
              <div><div className="card-title">Exam Timetable, Model QPs & Hall Ticket</div><div className="card-sub">Published live from College Exam Cell & Faculty</div></div>
              <button className="btn btn-primary" onClick={printHallTicket}><Printer size={15} /> Download Hall Ticket PDF</button>
            </div>
            <div className="stack" style={{ gap: 10 }}>
              {db.exams.map((ex) => (
                <div key={ex.id} style={{ padding: 14, borderRadius: 12, background: 'var(--surface-elevated)' }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <strong>{ex.subject}</strong>
                    <span className="badge badge-info">{ex.date} • {ex.room}</span>
                  </div>
                  <div className="card-sub" style={{ marginTop: 4 }}><FileText size={13} style={{ display: 'inline' }} /> Model QP: {ex.qpFile} • Important Questions: {ex.impQuestions}</div>
                </div>
              ))}
            </div>
          </div>

          <form className="card stack" onSubmit={applyReval}>
            <div className="card-title">Apply for Revaluation / Rechecking</div>
            <div className="grid-2">
              <select className="select" value={revForm.subject} onChange={(e) => setRevForm({ ...revForm, subject: e.target.value })}>
                {Object.keys(student.iaMarks).map((sub) => <option key={sub}>{sub}</option>)}
              </select>
              <input className="input" placeholder="Reason for revaluation request..." value={revForm.reason} onChange={(e) => setRevForm({ ...revForm, reason: e.target.value })} required />
            </div>
            <div><button className="btn btn-primary" type="submit">Submit Revaluation Request</button></div>
          </form>
        </div>
      )}

      {subTab === 'project' && myProject && (
        <div className="card stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div><div className="card-title">{myProject.title}</div><div className="card-sub">Guide: {myProject.guideName} • Current Milestone: {myProject.milestone}</div></div>
            <span className="badge badge-success">{myProject.synopsisStatus} • Marks: {myProject.marks}/50</span>
          </div>
          <form className="grid-3" onSubmit={updateProjectSubmission}>
            <input className="input" placeholder="New Milestone Status" value={prjUpdate.milestone} onChange={(e) => setPrjUpdate({ ...prjUpdate, milestone: e.target.value })} />
            <input className="input" placeholder="GitHub Repo URL" value={prjUpdate.repoUrl} onChange={(e) => setPrjUpdate({ ...prjUpdate, repoUrl: e.target.value })} />
            <input className="input" placeholder="Synopsis / Report PDF Name" value={prjUpdate.reportFile} onChange={(e) => setPrjUpdate({ ...prjUpdate, reportFile: e.target.value })} />
            <button className="btn btn-primary" type="submit"><Upload size={15} /> Upload Project Update</button>
          </form>
        </div>
      )}

      {subTab === 'guides' && (
        <div className="card stack">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div><div className="card-title">Assigned Mentor: {mentor.name}</div><div className="card-sub">{mentor.email} • {mentor.phone} • Dept: {mentor.dept}</div></div>
            <span className="badge badge-success">Live Proctor Sync</span>
          </div>
          <div className="chat-box">
            {chats.map((m) => (
              <div key={m.id} className={`chat-msg ${m.sender === 'student' ? 'me' : 'them'}`}>
                <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>{m.senderName} • {m.time}</div>
                <div>{m.text}</div>
              </div>
            ))}
          </div>
          <form className="row" onSubmit={sendChat}>
            <input className="input" style={{ flex: 1 }} placeholder="Write a message to your mentor..." value={chatText} onChange={(e) => setChatText(e.target.value)} />
            <button className="btn btn-primary" type="submit"><Send size={15} /> Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
