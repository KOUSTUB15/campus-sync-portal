import React, { useState } from 'react';
import { Download, Printer, Briefcase, MessageSquare, Plus } from 'lucide-react';
import { useCampusStore, PageHeader, exportToCSV, printDocumentHtml } from '@campus/shared-core';

export default function ReportsOutcomes() {
  const { db, updateDb } = useCampusStore();
  const [subTab, setSubTab] = useState('reports');
  const [driveForm, setDriveForm] = useState({ company: '', role: '', ctc: '', minCgpa: 7.0, driveDate: '' });
  const [replyMap, setReplyMap] = useState({});

  const exportExcelCSV = () => {
    exportToCSV('student-consolidated-report.csv', db.students.map((s) => ({
      USN: s.usn,
      Name: s.name,
      Branch: s.dept,
      Semester: s.semester,
      CGPA: s.cgpa,
      Backlogs: s.backlogs,
      AICTE_Points: s.aictePoints,
      FeeStatus: s.feeStatus,
    })));
  };

  const printTranscript = (s) => {
    const rows = Object.keys(s.iaMarks).map((sub) =>
      `<tr><td>${sub}</td><td>${s.attendance[sub] ?? '-'}%</td><td>${s.iaMarks[sub]}/${db.masterSettings.iaMaxMarks}</td><td>${s.iaMarks[sub] >= 20 ? 'PASS' : 'NEEDS IMPROVEMENT'}</td></tr>`
    ).join('');
    printDocumentHtml(`Transcript_${s.usn}`, `
      <div class="doc-box">
        <h1>${db.masterSettings.institutionName}</h1>
        <div class="sub">Consolidated Academic Transcript • ${db.masterSettings.academicYear}</div>
        <p><strong>Student:</strong> ${s.name} (${s.usn}) &nbsp;|&nbsp; <strong>Branch:</strong> ${s.dept} &nbsp;|&nbsp; <strong>CGPA:</strong> ${s.cgpa}</p>
        <table><thead><tr><th>Subject</th><th>Attendance</th><th>IA Score</th><th>Remark</th></tr></thead><tbody>${rows}</tbody></table>
        <p><strong>AICTE 100-Pt Progress:</strong> ${s.aictePoints}/${db.masterSettings.aicteTargetPoints} Points</p>
      </div>
    `);
  };

  const addDrive = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      placements: [...prev.placements, {
        id: `PL-${Date.now().toString().slice(-4)}`,
        ...driveForm,
        minCgpa: Number(driveForm.minCgpa),
        maxBacklogs: 0,
        applicants: [],
        offers: [],
      }],
    }), `Placement drive ${driveForm.company} published to Student Portal!`);
    setDriveForm({ company: '', role: '', ctc: '', minCgpa: 7.0, driveDate: '' });
  };

  const issueOffer = (driveId, usn) => {
    updateDb((prev) => ({
      ...prev,
      placements: prev.placements.map((p) =>
        p.id === driveId && !p.offers.includes(usn) ? { ...p, offers: [...p.offers, usn] } : p
      ),
    }), `Offer issued to ${usn} (live in Student Portal)!`);
  };

  const resolveTicket = (id) => {
    const reply = replyMap[id] || 'Resolved by College Administration.';
    updateDb((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => (t.id === id ? { ...t, status: 'Resolved', reply } : t)),
    }), 'Ticket reply sent to Student Portal');
  };

  return (
    <div className="stack">
      <PageHeader
        title="Reports, Analytics, Placements & Grievance"
        subtitle="Consolidated transcripts, Excel/PDF exports, Dept pass % & AICTE compliance, Company drives, and Student feedback tickets."
        actions={<button className="btn btn-primary" onClick={exportExcelCSV}><Download size={15} /> Export Excel (CSV)</button>}
      />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'reports' ? 'active' : ''}`} onClick={() => setSubTab('reports')}>Student Reports & Transcripts</button>
        <button className={`tab-btn ${subTab === 'analytics' ? 'active' : ''}`} onClick={() => setSubTab('analytics')}>College Analysis & AICTE</button>
        <button className={`tab-btn ${subTab === 'placements' ? 'active' : ''}`} onClick={() => setSubTab('placements')}>Placements & Training</button>
        <button className={`tab-btn ${subTab === 'grievance' ? 'active' : ''}`} onClick={() => setSubTab('grievance')}>Grievance & Feedback</button>
      </div>

      {subTab === 'reports' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Consolidated Student Transcripts</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>USN</th><th>Name</th><th>Dept</th><th>CGPA</th><th>Backlogs</th><th>AICTE Pts</th><th>Transcript PDF</th></tr></thead>
              <tbody>
                {db.students.map((s) => (
                  <tr key={s.usn}>
                    <td><code>{s.usn}</code></td>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.dept}</td>
                    <td><strong>{s.cgpa}</strong></td>
                    <td>{s.backlogs}</td>
                    <td>{s.aictePoints}/{db.masterSettings.aicteTargetPoints}</td>
                    <td><button className="btn btn-sm" onClick={() => printTranscript(s)}><Printer size={14} /> Print / PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'analytics' && (
        <div className="grid-2">
          <div className="card stack">
            <div className="card-title">Pass % & Department Analytics</div>
            {db.departments.map((d) => (
              <div key={d.id}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 5 }}>
                  <strong>{d.code} — {d.name}</strong>
                  <span>{d.passRate}%</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${d.passRate}%` }} /></div>
              </div>
            ))}
          </div>

          <div className="card stack">
            <div className="card-title">AICTE Compliance Report Summary</div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>Faculty-Student Ratio Norm (1:20)</span><span className="badge badge-success">Compliant</span></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>100-Point Student Activity Integration</span><span className="badge badge-success">Active</span></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>Digital Library & IEEE E-Journals</span><span className="badge badge-success">Verified</span></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span>Grievance Redressal Portal Live</span><span className="badge badge-success">Operational</span></div>
          </div>
        </div>
      )}

      {subTab === 'placements' && (
        <div className="stack">
          <form className="card grid-3" onSubmit={addDrive}>
            <input className="input" placeholder="Company Name" value={driveForm.company} onChange={(e) => setDriveForm({ ...driveForm, company: e.target.value })} required />
            <input className="input" placeholder="Role (e.g. SDE Intern)" value={driveForm.role} onChange={(e) => setDriveForm({ ...driveForm, role: e.target.value })} required />
            <input className="input" placeholder="CTC / Stipend" value={driveForm.ctc} onChange={(e) => setDriveForm({ ...driveForm, ctc: e.target.value })} required />
            <input type="number" step="0.1" className="input" placeholder="Min CGPA" value={driveForm.minCgpa} onChange={(e) => setDriveForm({ ...driveForm, minCgpa: e.target.value })} />
            <input type="date" className="input" value={driveForm.driveDate} onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })} required />
            <button className="btn btn-primary" type="submit"><Plus size={15} /> Publish Drive</button>
          </form>

          <div className="card">
            <div className="row" style={{ marginBottom: 12 }}><Briefcase size={18} color="var(--accent)" /><span className="card-title">Company Drives & Student Offers</span></div>
            <div className="stack" style={{ gap: 12 }}>
              {db.placements.map((p) => (
                <div key={p.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div><strong>{p.company} — {p.role}</strong><div className="card-sub">CTC: {p.ctc} • Min CGPA: {p.minCgpa} • Date: {p.driveDate}</div></div>
                    <span className="badge badge-info">{p.applicants.length} Applicants • {p.offers.length} Offers</span>
                  </div>
                  <div className="row" style={{ marginTop: 10 }}>
                    {p.applicants.map((usn) => (
                      <button key={usn} className={`btn btn-sm ${p.offers.includes(usn) ? 'btn-success' : ''}`} onClick={() => issueOffer(p.id, usn)}>
                        {usn} {p.offers.includes(usn) ? '✓ Offered' : '• Issue Offer'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'grievance' && (
        <div className="card stack">
          <div className="row"><MessageSquare size={18} color="var(--accent)" /><span className="card-title">Student Feedback & Support Tickets</span></div>
          {db.tickets.map((t) => (
            <div key={t.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div><strong>{t.subject}</strong><div className="card-sub">{t.studentName} ({t.usn}) • {t.category} • Rating: {t.rating}/5</div></div>
                <span className={`badge ${t.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span>
              </div>
              <p className="card-sub" style={{ margin: '8px 0' }}>{t.message}</p>
              {t.reply && <div className="badge badge-info" style={{ marginBottom: 8 }}>Admin Reply: {t.reply}</div>}
              {t.status !== 'Resolved' && (
                <div className="row">
                  <input className="input" style={{ flex: 1 }} placeholder="Type resolution response..." value={replyMap[t.id] || ''} onChange={(e) => setReplyMap({ ...replyMap, [t.id]: e.target.value })} />
                  <button className="btn btn-primary btn-sm" onClick={() => resolveTicket(t.id)}>Resolve</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
