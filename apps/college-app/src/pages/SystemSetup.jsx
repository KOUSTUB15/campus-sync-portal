import React, { useState } from 'react';
import { Plus, Calendar, Building2, Shield } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function SystemSetup() {
  const { db, updateDb } = useCampusStore();
  const [subTab, setSubTab] = useState('collegeInfo');
  const [deptForm, setDeptForm] = useState({ code: '', name: '', hod: '', intake: 60 });
  const [calForm, setCalForm] = useState({ date: '', event: '', category: 'Exam' });
  const [noticeForm, setNoticeForm] = useState({ title: '', body: '', audience: 'All Portals' });
  const [minAtt, setMinAtt] = useState(db.masterSettings.minAttendancePercent);

  const addDept = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      departments: [...prev.departments, { id: `D-${deptForm.code}`, ...deptForm, intake: Number(deptForm.intake), filled: 0, passRate: 90, aicteCompliant: true }],
    }), `Department ${deptForm.code} added`);
    setDeptForm({ code: '', name: '', hod: '', intake: 60 });
  };

  const addCal = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      academicCalendar: [...prev.academicCalendar, { id: `CAL-${Date.now().toString().slice(-4)}`, ...calForm }],
    }), 'Master academic calendar updated across Student & Teacher portals');
    setCalForm({ date: '', event: '', category: 'Exam' });
  };

  const postNotice = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      globalNotices: [{
        id: `N-${Date.now().toString().slice(-4)}`,
        ...noticeForm,
        priority: 'Medium',
        postedBy: 'College Admin',
        date: new Date().toISOString().slice(0, 10),
      }, ...prev.globalNotices],
    }), 'College notice published');
    setNoticeForm({ title: '', body: '', audience: 'All Portals' });
  };

  const saveRuleQuick = () => {
    updateDb((prev) => ({
      ...prev,
      masterSettings: { ...prev.masterSettings, minAttendancePercent: Number(minAtt) },
    }), 'Attendance rule synced with Master Settings');
  };

  return (
    <div className="stack">
      <PageHeader title="System & Campus Setup" subtitle="Master Settings sync, Departments & Branches, Master Calendar, and Institutional Notices." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'collegeInfo' ? 'active' : ''}`} onClick={() => setSubTab('collegeInfo')}>Departments & Branches</button>
        <button className={`tab-btn ${subTab === 'calendar' ? 'active' : ''}`} onClick={() => setSubTab('calendar')}>Master Calendar & Notices</button>
        <button className={`tab-btn ${subTab === 'master' ? 'active' : ''}`} onClick={() => setSubTab('master')}>Master Settings & Rules</button>
      </div>

      {subTab === 'collegeInfo' && (
        <div className="stack">
          <form className="card grid-4" onSubmit={addDept} style={{ alignItems: 'end' }}>
            <div className="field"><label>Code</label><input className="input" placeholder="ISE" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })} required /></div>
            <div className="field"><label>Department Name</label><input className="input" placeholder="Information Science" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} required /></div>
            <div className="field"><label>HOD Name</label><input className="input" placeholder="Dr. A. Rao" value={deptForm.hod} onChange={(e) => setDeptForm({ ...deptForm, hod: e.target.value })} required /></div>
            <div className="row">
              <div className="field" style={{ flex: 1 }}><label>Intake</label><input type="number" className="input" value={deptForm.intake} onChange={(e) => setDeptForm({ ...deptForm, intake: e.target.value })} /></div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 18 }}><Plus size={15} /> Add</button>
            </div>
          </form>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Active Departments & Branches</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Code</th><th>Branch Name</th><th>HOD</th><th>Sanctioned Intake</th><th>Filled</th><th>AICTE Status</th></tr></thead>
                <tbody>
                  {db.departments.map((d) => (
                    <tr key={d.id}>
                      <td><span className="badge">{d.code}</span></td>
                      <td><strong>{d.name}</strong></td>
                      <td>{d.hod}</td>
                      <td>{d.intake}</td>
                      <td>{d.filled}</td>
                      <td><span className="badge badge-success">{d.aicteCompliant ? 'Compliant' : 'Review'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'calendar' && (
        <div className="grid-2">
          <div className="card stack">
            <div className="row"><Calendar size={18} color="var(--accent)" /><span className="card-title">Master Academic Calendar</span></div>
            <form className="stack" style={{ gap: 10 }} onSubmit={addCal}>
              <div className="grid-2">
                <input type="date" className="input" value={calForm.date} onChange={(e) => setCalForm({ ...calForm, date: e.target.value })} required />
                <select className="select" value={calForm.category} onChange={(e) => setCalForm({ ...calForm, category: e.target.value })}>
                  <option>Exam</option><option>Lab</option><option>Project</option><option>Placement</option><option>Holiday</option>
                </select>
              </div>
              <input className="input" placeholder="Event description..." value={calForm.event} onChange={(e) => setCalForm({ ...calForm, event: e.target.value })} required />
              <button className="btn btn-primary" type="submit">Add to Master Calendar</button>
            </form>
            <div className="stack" style={{ gap: 8 }}>
              {db.academicCalendar.map((c) => (
                <div key={c.id} className="row" style={{ justifyContent: 'space-between', padding: 10, borderRadius: 10, background: 'var(--surface-elevated)' }}>
                  <div><strong>{c.event}</strong><div className="card-sub">{c.date}</div></div>
                  <span className="badge">{c.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card stack">
            <div className="card-title">Publish Campus Notice</div>
            <form className="stack" style={{ gap: 10 }} onSubmit={postNotice}>
              <input className="input" placeholder="Notice Title" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} required />
              <textarea className="textarea" placeholder="Circular details..." value={noticeForm.body} onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })} required />
              <button className="btn btn-primary" type="submit">Publish Across Portals</button>
            </form>
          </div>
        </div>
      )}

      {subTab === 'master' && (
        <div className="card stack">
          <div className="row"><Shield size={18} color="var(--accent)" /><span className="card-title">Synced Master Settings (Academic Years, Grading & Attendance Rules)</span></div>
          <div className="grid-3">
            <div><div className="card-sub">Academic Year</div><strong>{db.masterSettings.academicYear}</strong></div>
            <div><div className="card-sub">Active Term</div><strong>{db.masterSettings.activeSemester}</strong></div>
            <div><div className="card-sub">Grading Scale</div><strong>{db.masterSettings.gradingScale.map((g) => g.grade).join(', ')}</strong></div>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <div className="field" style={{ width: 220 }}>
              <label>Min Attendance Rule (%)</label>
              <input type="number" className="input" value={minAtt} onChange={(e) => setMinAtt(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={saveRuleQuick}>Sync Rule</button>
          </div>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table>
              <thead><tr><th>Role</th><th>College Admin</th><th>Approve Leave</th><th>Enter Marks</th><th>Issue Certs</th></tr></thead>
              <tbody>
                {db.masterSettings.rolesMatrix.map((r) => (
                  <tr key={r.role}>
                    <td><strong>{r.role}</strong></td>
                    <td>{r.collegeAdmin ? 'Yes' : 'No'}</td>
                    <td>{r.approveLeave ? 'Yes' : 'No'}</td>
                    <td>{r.enterMarks ? 'Yes' : 'No'}</td>
                    <td>{r.issueCerts ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
