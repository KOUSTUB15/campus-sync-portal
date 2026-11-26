import React, { useState } from 'react';
import { Award, Rocket, FileCheck2, Briefcase, MessageSquare, Printer, Plus } from 'lucide-react';
import { useCampusStore, PageHeader, printDocumentHtml } from '@campus/shared-core';

export default function GrowthServices() {
  const { db, updateDb, currentUser } = useCampusStore();
  const student = db.students.find((s) => s.email === currentUser?.email) || db.students[0];
  const [subTab, setSubTab] = useState('certs');

  const [certForm, setCertForm] = useState({ type: 'Bonafide Certificate', purpose: '' });
  const [aicteForm, setAicteForm] = useState({ title: '', category: 'Technical Innovation', points: 15, certFile: '' });
  const [pitchForm, setPitchForm] = useState({ title: '', domain: 'EdTech / AI', pitchSummary: '' });
  const [ticketForm, setTicketForm] = useState({ category: 'Faculty Feedback', subject: '', message: '', rating: 5 });

  const requestCert = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      certificates: [{
        id: `CERT-${Date.now().toString().slice(-4)}`,
        usn: student.usn,
        studentName: student.name,
        dept: student.dept,
        ...certForm,
        requestDate: new Date().toISOString().slice(0, 10),
        status: 'Pending',
        signedBy: '',
        certHash: '',
      }, ...prev.certificates],
    }), 'Certificate request sent live to College Admin Portal!');
    setCertForm({ type: 'Bonafide Certificate', purpose: '' });
  };

  const downloadCert = (c) => {
    printDocumentHtml(c.type, `
      <div class="doc-box">
        <h1>${db.masterSettings.institutionName}</h1>
        <div class="sub">${db.masterSettings.affiliation} • ${db.masterSettings.academicYear}</div>
        <h2 style="text-align:center">${c.type}</h2>
        <p style="margin:24px 0">Certified that <strong>${c.studentName}</strong> (USN: <strong>${c.usn}</strong>, Dept: <strong>${c.dept}</strong>) is a bonafide student. Purpose: ${c.purpose}.</p>
        <p><strong>Digital Hash:</strong> ${c.certHash}</p>
        <div class="sig"><div>Date: ${c.requestDate}</div><div><div class="stamp">DIGITALLY SIGNED</div><br/><strong>${c.signedBy}</strong></div></div>
      </div>
    `);
  };

  const addAicte = (e) => {
    e.preventDefault();
    const pts = Number(aicteForm.points);
    updateDb((prev) => ({
      ...prev,
      aicteActivities: [{ id: `AIC-${Date.now().toString().slice(-4)}`, usn: student.usn, ...aicteForm, points: pts, status: 'Submitted' }, ...prev.aicteActivities],
      students: prev.students.map((s) => (s.usn === student.usn ? { ...s, aictePoints: Math.min(db.masterSettings.aicteTargetPoints, s.aictePoints + pts) } : s)),
    }), `Added ${pts} AICTE points!`);
    setAicteForm({ title: '', category: 'Technical Innovation', points: 15, certFile: '' });
  };

  const submitPitch = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      startupPitches: [{
        id: `STP-${Date.now().toString().slice(-4)}`,
        usn: student.usn,
        studentName: student.name,
        ...pitchForm,
        status: 'Submitted for Mentor Review',
        mentorFeedback: 'Awaiting review from Mentor in Teacher Portal.',
      }, ...prev.startupPitches],
    }), 'Startup pitch submitted for Mentor Review!');
    setPitchForm({ title: '', domain: 'EdTech / AI', pitchSummary: '' });
  };

  const applyDrive = (driveId) => {
    updateDb((prev) => ({
      ...prev,
      placements: prev.placements.map((p) =>
        p.id === driveId && !p.applicants.includes(student.usn) ? { ...p, applicants: [...p.applicants, student.usn] } : p
      ),
    }), 'Applied to placement drive! Synced to College Placement Cell.');
  };

  const submitTicket = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      tickets: [{
        id: `TK-${Date.now().toString().slice(-4)}`,
        usn: student.usn,
        studentName: student.name,
        ...ticketForm,
        rating: Number(ticketForm.rating),
        status: 'Open',
        reply: '',
      }, ...prev.tickets],
    }), 'Feedback / Helpdesk ticket routed to College Admin!');
    setTicketForm({ category: 'Faculty Feedback', subject: '', message: '', rating: 5 });
  };

  const myCerts = db.certificates.filter((c) => c.usn === student.usn);
  const myAicte = db.aicteActivities.filter((a) => a.usn === student.usn);
  const aictePct = Math.min(100, Math.round((student.aictePoints / db.masterSettings.aicteTargetPoints) * 100));

  return (
    <div className="stack">
      <PageHeader title="4. Growth & Campus Services" subtitle="Certificate Requests (Bonafide/TC/NOC), AICTE 100-Pt Tracker, Startup Pitches, Placement Drives, and Feedback & Helpdesk." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'certs' ? 'active' : ''}`} onClick={() => setSubTab('certs')}>Certificate Request & PDF</button>
        <button className={`tab-btn ${subTab === 'aicte' ? 'active' : ''}`} onClick={() => setSubTab('aicte')}>AICTE 100-Pt Tracker</button>
        <button className={`tab-btn ${subTab === 'ideas' ? 'active' : ''}`} onClick={() => setSubTab('ideas')}>New Ideas & Startup Pitch</button>
        <button className={`tab-btn ${subTab === 'placements' ? 'active' : ''}`} onClick={() => setSubTab('placements')}>Placements & Internships</button>
        <button className={`tab-btn ${subTab === 'helpdesk' ? 'active' : ''}`} onClick={() => setSubTab('helpdesk')}>Feedback & Helpdesk</button>
      </div>

      {subTab === 'certs' && (
        <div className="stack">
          <form className="card grid-3" onSubmit={requestCert}>
            <select className="select" value={certForm.type} onChange={(e) => setCertForm({ ...certForm, type: e.target.value })}>
              <option>Bonafide Certificate</option><option>Study Certificate</option><option>NOC (Internship)</option><option>Transfer Certificate (TC)</option><option>Conduct Certificate</option>
            </select>
            <input className="input" placeholder="Purpose (e.g. Internship / Passport / Loan)" value={certForm.purpose} onChange={(e) => setCertForm({ ...certForm, purpose: e.target.value })} required />
            <button className="btn btn-primary" type="submit"><FileCheck2 size={15} /> Apply for Certificate</button>
          </form>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Track Certificate Status & Download Signed PDF</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Type</th><th>Purpose</th><th>Status</th><th>Download</th></tr></thead>
                <tbody>
                  {myCerts.map((c) => (
                    <tr key={c.id}>
                      <td><code>{c.id}</code></td>
                      <td><strong>{c.type}</strong></td>
                      <td>{c.purpose}</td>
                      <td><span className={`badge ${c.status.includes('Approved') ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                      <td>
                        {c.status.includes('Approved') ? (
                          <button className="btn btn-sm btn-primary" onClick={() => downloadCert(c)}><Printer size={14} /> Download PDF</button>
                        ) : (
                          <span className="card-sub">Awaiting College Sign</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'aicte' && (
        <div className="stack">
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="row"><Award size={18} color="var(--accent)" /><span className="card-title">AICTE 100-Point Activity Progress</span></div>
              <strong>{student.aictePoints} / {db.masterSettings.aicteTargetPoints} Points ({aictePct}%)</strong>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${aictePct}%` }} /></div>
          </div>

          <form className="card grid-4" onSubmit={addAicte}>
            <input className="input" placeholder="Activity / Event Name" value={aicteForm.title} onChange={(e) => setAicteForm({ ...aicteForm, title: e.target.value })} required />
            <select className="select" value={aicteForm.category} onChange={(e) => setAicteForm({ ...aicteForm, category: e.target.value })}>
              <option>Technical Innovation</option><option>Community Outreach</option><option>Skill Certification</option><option>Sports / Cultural</option>
            </select>
            <input type="number" className="input" placeholder="Points" value={aicteForm.points} onChange={(e) => setAicteForm({ ...aicteForm, points: e.target.value })} />
            <button className="btn btn-primary" type="submit"><Plus size={15} /> Log Activity</button>
          </form>

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Activity</th><th>Category</th><th>Points</th><th>Status</th></tr></thead>
                <tbody>
                  {myAicte.map((a) => (
                    <tr key={a.id}><td><strong>{a.title}</strong></td><td>{a.category}</td><td>+{a.points}</td><td><span className="badge badge-success">{a.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'ideas' && (
        <div className="stack">
          <form className="card stack" onSubmit={submitPitch}>
            <div className="row"><Rocket size={18} color="var(--accent)" /><span className="card-title">Submit Startup Pitch for Mentor Review</span></div>
            <div className="grid-2">
              <input className="input" placeholder="Startup / Product Title" value={pitchForm.title} onChange={(e) => setPitchForm({ ...pitchForm, title: e.target.value })} required />
              <input className="input" placeholder="Domain (e.g. Mobility, AI, AgriTech)" value={pitchForm.domain} onChange={(e) => setPitchForm({ ...pitchForm, domain: e.target.value })} required />
            </div>
            <textarea className="textarea" placeholder="Problem statement, solution & prototype summary..." value={pitchForm.pitchSummary} onChange={(e) => setPitchForm({ ...pitchForm, pitchSummary: e.target.value })} required />
            <div><button className="btn btn-primary" type="submit">Submit Pitch</button></div>
          </form>

          {db.startupPitches.map((p) => (
            <div key={p.id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{p.title} ({p.domain})</strong>
                <span className="badge badge-info">{p.status}</span>
              </div>
              <p className="card-sub" style={{ margin: '8px 0' }}>{p.pitchSummary}</p>
              <div className="badge badge-success">Mentor Review: {p.mentorFeedback}</div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'placements' && (
        <div className="card stack">
          <div className="row"><Briefcase size={18} color="var(--accent)" /><span className="card-title">Eligible Placement Drives & Offer Status</span></div>
          {db.placements.map((p) => {
            const eligible = student.cgpa >= p.minCgpa && student.backlogs <= p.maxBacklogs;
            const applied = p.applicants.includes(student.usn);
            const offered = p.offers.includes(student.usn);
            return (
              <div key={p.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div><strong>{p.company} — {p.role}</strong><div className="card-sub">CTC: {p.ctc} • Min CGPA: {p.minCgpa} • Drive Date: {p.driveDate}</div></div>
                  {offered ? (
                    <span className="badge badge-success">OFFER RECEIVED</span>
                  ) : applied ? (
                    <span className="badge badge-info">Applied</span>
                  ) : eligible ? (
                    <button className="btn btn-sm btn-primary" onClick={() => applyDrive(p.id)}>Apply Now</button>
                  ) : (
                    <span className="badge badge-danger">Not Eligible</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'helpdesk' && (
        <div className="grid-2">
          <form className="card stack" onSubmit={submitTicket}>
            <div className="row"><MessageSquare size={18} color="var(--accent)" /><span className="card-title">Faculty Feedback & Support Ticket</span></div>
            <select className="select" value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}>
              <option>Faculty Feedback</option><option>Lab Infrastructure</option><option>Exam / Hall Ticket</option><option>Library / Accounts</option>
            </select>
            <input className="input" placeholder="Subject" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} required />
            <textarea className="textarea" placeholder="Describe your feedback or issue..." value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} required />
            <div className="field"><label>Satisfaction Rating (1–5)</label><input type="number" min="1" max="5" className="input" value={ticketForm.rating} onChange={(e) => setTicketForm({ ...ticketForm, rating: e.target.value })} /></div>
            <button className="btn btn-primary" type="submit">Submit to College Portal</button>
          </form>

          <div className="card stack">
            <div className="card-title">My Tickets & Admin Responses</div>
            {db.tickets.filter((t) => t.usn === student.usn).map((t) => (
              <div key={t.id} style={{ padding: 12, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}><strong>{t.subject}</strong><span className={`badge ${t.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></div>
                <div className="card-sub" style={{ marginTop: 4 }}>{t.message}</div>
                {t.reply && <div className="badge badge-info" style={{ marginTop: 8 }}>Admin Reply: {t.reply}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
