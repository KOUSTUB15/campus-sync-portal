import React, { useState } from 'react';
import { UserPlus, Check, X, Upload, ArrowUpCircle } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function PeopleAdmissions() {
  const { db, updateDb } = useCampusStore();
  const [subTab, setSubTab] = useState('teachers');
  const [facForm, setFacForm] = useState({ name: '', dept: 'CSE', email: '', phone: '', subjects: '' });
  const [bulkText, setBulkText] = useState('');

  const addFaculty = (e) => {
    e.preventDefault();
    const t = {
      id: `FAC-${facForm.dept}-${Math.floor(200 + Math.random() * 700)}`,
      name: facForm.name,
      dept: facForm.dept,
      email: facForm.email,
      phone: facForm.phone,
      subjects: facForm.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      roles: ['Proctor'],
      upi: '',
      scopusId: '',
      orcidId: '',
      leaveBalance: 12,
    };
    updateDb((prev) => ({ ...prev, teachers: [...prev.teachers, t] }), `Faculty ${t.name} added`);
    setFacForm({ name: '', dept: 'CSE', email: '', phone: '', subjects: '' });
  };

  const handleLeaveAction = (id, status) => {
    updateDb((prev) => ({
      ...prev,
      facultyLeaves: prev.facultyLeaves.map((l) => (l.id === id ? { ...l, status } : l)),
    }), `Faculty leave marked ${status} (synced to Teacher App)`);
  };

  const toggleFee = (usn) => {
    updateDb((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.usn === usn
          ? { ...s, feeStatus: s.feeStatus === 'Paid' ? 'Pending' : 'Paid', receiptNo: s.feeStatus === 'Paid' ? 'PENDING' : `RCPT-2026-${Math.floor(1000 + Math.random() * 8999)}` }
          : s
      ),
    }), `Updated fee status for ${usn}`);
  };

  const promoteAll = () => {
    const nextSemMap = { '1st Sem': '2nd Sem', '2nd Sem': '3rd Sem', '3rd Sem': '4th Sem', '4th Sem': '5th Sem', '5th Sem': '6th Sem', '6th Sem': '7th Sem', '7th Sem': '8th Sem', '8th Sem': 'Graduated' };
    updateDb((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.backlogs <= 2 ? { ...s, semester: nextSemMap[s.semester] || s.semester } : s)),
    }), 'Promoted eligible students to next semester!');
  };

  const bulkImportStudents = () => {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const imported = lines.map((line) => {
      const [usn, name, dept = 'CSE', sem = '5th Sem'] = line.split(',').map((x) => x.trim());
      return {
        usn,
        name: name || 'New Learner',
        email: `${usn.toLowerCase()}@campus.edu`,
        dept,
        semester: sem,
        sessionType: 'Regular',
        classBatch: `${dept}-A`,
        labBatch: 'B1',
        elective: 'Cloud & DevOps',
        parentName: 'Guardian',
        parentPhone: '+91 90000 00000',
        mentorId: 'FAC-CSE-104',
        feeStatus: 'Paid',
        feeAmount: 92500,
        receiptNo: `RCPT-${Date.now().toString().slice(-4)}`,
        scholarship: 'None',
        backlogs: 0,
        cgpa: 8.0,
        aictePoints: 25,
        attendance: { 'Full Stack Web Dev (21CS51)': 85 },
        iaMarks: { 'Full Stack Web Dev (21CS51)': 40 },
        resume: { headline: 'Engineering Student', skills: 'React, Python', projects: '', achievements: '' },
      };
    });
    updateDb((prev) => ({ ...prev, students: [...prev.students, ...imported] }), `Imported ${imported.length} student(s)`);
    setBulkText('');
  };

  const updateQuota = (id, field, delta) => {
    updateDb((prev) => ({
      ...prev,
      admissionQuotas: prev.admissionQuotas.map((q) => {
        if (q.id !== id) return q;
        const maxField = field.replace('Filled', 'Total');
        const nextVal = Math.max(0, Math.min(q[maxField], q[field] + delta));
        return { ...q, [field]: nextVal };
      }),
    }));
  };

  return (
    <div className="stack">
      <PageHeader title="People & Admissions Management" subtitle="Faculty directory & leave approvals, bulk student import/promotion, fee/scholarship status, and Govt/Mgmt/NRI seat matrix." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'teachers' ? 'active' : ''}`} onClick={() => setSubTab('teachers')}>Teachers & Leave Approvals</button>
        <button className={`tab-btn ${subTab === 'students' ? 'active' : ''}`} onClick={() => setSubTab('students')}>Student List, Bulk Import & Fees</button>
        <button className={`tab-btn ${subTab === 'quota' ? 'active' : ''}`} onClick={() => setSubTab('quota')}>Admission Quota & Seat Matrix</button>
      </div>

      {subTab === 'teachers' && (
        <div className="stack">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Faculty Leave Approvals (Live from Teacher Portal)</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Faculty</th><th>Dates</th><th>Reason</th><th>Substitute</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {db.facultyLeaves.map((l) => (
                    <tr key={l.id}>
                      <td><strong>{l.teacherName}</strong><div className="card-sub">{l.dept}</div></td>
                      <td>{l.from} to {l.to}</td>
                      <td>{l.type}</td>
                      <td>{l.substitute}</td>
                      <td><span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span></td>
                      <td className="row">
                        <button className="btn btn-sm btn-success" onClick={() => handleLeaveAction(l.id, 'Approved')}><Check size={14} /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleLeaveAction(l.id, 'Rejected')}><X size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <form className="card stack" onSubmit={addFaculty}>
            <div className="card-title">Add Faculty & Assign Subjects</div>
            <div className="grid-3">
              <input className="input" placeholder="Faculty Full Name" value={facForm.name} onChange={(e) => setFacForm({ ...facForm, name: e.target.value })} required />
              <input className="input" placeholder="Email" type="email" value={facForm.email} onChange={(e) => setFacForm({ ...facForm, email: e.target.value })} required />
              <input className="input" placeholder="Phone" value={facForm.phone} onChange={(e) => setFacForm({ ...facForm, phone: e.target.value })} />
              <select className="select" value={facForm.dept} onChange={(e) => setFacForm({ ...facForm, dept: e.target.value })}>
                {db.departments.map((d) => <option key={d.code}>{d.code}</option>)}
              </select>
              <input className="input" style={{ gridColumn: 'span 2' }} placeholder="Subjects (comma separated)" value={facForm.subjects} onChange={(e) => setFacForm({ ...facForm, subjects: e.target.value })} />
            </div>
            <div><button className="btn btn-primary" type="submit"><UserPlus size={15} /> Register Faculty</button></div>
          </form>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Faculty & Subject Allocation</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Dept</th><th>Assigned Subjects</th><th>Roles</th></tr></thead>
                <tbody>
                  {db.teachers.map((t) => (
                    <tr key={t.id}>
                      <td><code>{t.id}</code></td>
                      <td><strong>{t.name}</strong><div className="card-sub">{t.email}</div></td>
                      <td>{t.dept}</td>
                      <td>{t.subjects.join(', ')}</td>
                      <td>{t.roles.map((r) => <span key={r} className="badge" style={{ marginRight: 4 }}>{r}</span>)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'students' && (
        <div className="stack">
          <div className="card stack">
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div>
                <div className="card-title">Bulk Import (CSV) & Batch Semester Promotion</div>
                <div className="card-sub">Paste rows as: <code>USN, Full Name, Branch, Semester</code> (one per line)</div>
              </div>
              <button className="btn btn-primary" onClick={promoteAll}><ArrowUpCircle size={15} /> Promote Eligible Students</button>
            </div>
            <textarea className="textarea" placeholder="2MM23CS045, Priya Verma, CSE, 5th Sem" value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
            <div><button className="btn" onClick={bulkImportStudents}><Upload size={15} /> Import CSV Lines</button></div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Student Directory — Fee & Scholarship Status</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>USN</th><th>Name</th><th>Dept / Sem</th><th>Batch</th><th>Fee Status</th><th>Scholarship</th><th>Action</th></tr></thead>
                <tbody>
                  {db.students.map((s) => (
                    <tr key={s.usn}>
                      <td><code>{s.usn}</code></td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.dept} • {s.semester}</td>
                      <td>{s.classBatch} ({s.labBatch})</td>
                      <td><span className={`badge ${s.feeStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`}>{s.feeStatus}</span></td>
                      <td>{s.scholarship}</td>
                      <td><button className="btn btn-sm" onClick={() => toggleFee(s.usn)}>Toggle Fee</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'quota' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Admission Seat Matrix — Govt (CET/COMEDK) / Management / NRI Quotas</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Total Intake</th>
                  <th>Govt Quota (45%)</th>
                  <th>Management Quota (40%)</th>
                  <th>NRI Quota (15%)</th>
                  <th>Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {db.admissionQuotas.map((q) => {
                  const totalFilled = q.govtFilled + q.mgmtFilled + q.nriFilled;
                  const pct = Math.round((totalFilled / q.intake) * 100);
                  return (
                    <tr key={q.id}>
                      <td><span className="badge">{q.branch}</span></td>
                      <td><strong>{q.intake}</strong></td>
                      <td>
                        <div className="row">
                          <span>{q.govtFilled}/{q.govtTotal}</span>
                          <button className="btn btn-sm" onClick={() => updateQuota(q.id, 'govtFilled', -1)}>-</button>
                          <button className="btn btn-sm" onClick={() => updateQuota(q.id, 'govtFilled', 1)}>+</button>
                        </div>
                      </td>
                      <td>
                        <div className="row">
                          <span>{q.mgmtFilled}/{q.mgmtTotal}</span>
                          <button className="btn btn-sm" onClick={() => updateQuota(q.id, 'mgmtFilled', -1)}>-</button>
                          <button className="btn btn-sm" onClick={() => updateQuota(q.id, 'mgmtFilled', 1)}>+</button>
                        </div>
                      </td>
                      <td>
                        <div className="row">
                          <span>{q.nriFilled}/{q.nriTotal}</span>
                          <button className="btn btn-sm" onClick={() => updateQuota(q.id, 'nriFilled', -1)}>-</button>
                          <button className="btn btn-sm" onClick={() => updateQuota(q.id, 'nriFilled', 1)}>+</button>
                        </div>
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <div className="card-sub">{totalFilled}/{q.intake} ({pct}%)</div>
                        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
