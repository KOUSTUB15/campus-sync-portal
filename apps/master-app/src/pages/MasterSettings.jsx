import React, { useState } from 'react';
import { Save, ShieldCheck, Sliders } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function MasterSettings() {
  const { db, updateDb } = useCampusStore();
  const [form, setForm] = useState(db.masterSettings);

  const handleSaveRules = (e) => {
    e.preventDefault();
    updateDb(
      (prev) => ({
        ...prev,
        masterSettings: {
          ...prev.masterSettings,
          ...form,
          minAttendancePercent: Number(form.minAttendancePercent),
          iaMaxMarks: Number(form.iaMaxMarks),
          seeMaxMarks: Number(form.seeMaxMarks),
          passPercent: Number(form.passPercent),
          aicteTargetPoints: Number(form.aicteTargetPoints),
        },
      }),
      'Master rules saved & synced live to College, Teacher, and Student apps!'
    );
  };

  const togglePerm = (roleIndex, key) => {
    const updated = form.rolesMatrix.map((row, idx) =>
      idx === roleIndex ? { ...row, [key]: !row[key] } : row
    );
    setForm({ ...form, rolesMatrix: updated });
    updateDb(
      (prev) => ({
        ...prev,
        masterSettings: { ...prev.masterSettings, rolesMatrix: updated },
      }),
      'Updated Roles & Permissions Matrix across portals'
    );
  };

  return (
    <div className="stack">
      <PageHeader
        title="College Master Settings"
        subtitle="Changes made here instantly propagate to Attendance Alerts, Exam Eligibility, Grading, and Role Permissions across all 4 apps."
      />

      <form className="card stack" onSubmit={handleSaveRules}>
        <div className="card-header" style={{ marginBottom: 4 }}>
          <div className="row"><Sliders size={18} color="var(--accent)" /><span className="card-title">Academic Year, Semesters & System Rules</span></div>
          <button type="submit" className="btn btn-primary"><Save size={15} /> Save & Sync All Portals</button>
        </div>

        <div className="grid-3">
          <div className="field">
            <label>Institution Name</label>
            <input className="input" value={form.institutionName} onChange={(e) => setForm({ ...form, institutionName: e.target.value })} />
          </div>
          <div className="field">
            <label>Academic Year</label>
            <input className="input" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
          </div>
          <div className="field">
            <label>Active Semester Term</label>
            <select className="select" value={form.activeSemester} onChange={(e) => setForm({ ...form, activeSemester: e.target.value })}>
              <option>Odd Semester (1st / 3rd / 5th / 7th Sem)</option>
              <option>Odd Semester (5th / 7th Sem)</option>
              <option>Even Semester (2nd / 4th / 6th / 8th Sem)</option>
              <option>Summer Fast-Track / Backlog Term</option>
            </select>
          </div>
          <div className="field">
            <label>Minimum Attendance Rule (%) — triggers Student & Teacher Alerts</label>
            <input type="number" min="50" max="95" className="input" value={form.minAttendancePercent} onChange={(e) => setForm({ ...form, minAttendancePercent: e.target.value })} />
          </div>
          <div className="field">
            <label>Pass Percentage (%)</label>
            <input type="number" min="25" max="60" className="input" value={form.passPercent} onChange={(e) => setForm({ ...form, passPercent: e.target.value })} />
          </div>
          <div className="field">
            <label>AICTE Mandatory Activity Points</label>
            <input type="number" min="50" max="200" className="input" value={form.aicteTargetPoints} onChange={(e) => setForm({ ...form, aicteTargetPoints: e.target.value })} />
          </div>
          <div className="field">
            <label>IA Max Marks</label>
            <input type="number" className="input" value={form.iaMaxMarks} onChange={(e) => setForm({ ...form, iaMaxMarks: e.target.value })} />
          </div>
          <div className="field">
            <label>SEE Max Marks</label>
            <input type="number" className="input" value={form.seeMaxMarks} onChange={(e) => setForm({ ...form, seeMaxMarks: e.target.value })} />
          </div>
          <div className="field">
            <label>Institution Code</label>
            <input className="input" value={form.institutionCode} onChange={(e) => setForm({ ...form, institutionCode: e.target.value })} />
          </div>
        </div>
      </form>

      <div className="card">
        <div className="card-header">
          <div className="row"><ShieldCheck size={18} color="var(--accent)" /><span className="card-title">Roles & Permissions Matrix (Live Toggle)</span></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Master Config</th>
                <th>College Admin</th>
                <th>Approve Leave</th>
                <th>Enter Marks</th>
                <th>Analytics</th>
                <th>Issue Certificates</th>
              </tr>
            </thead>
            <tbody>
              {form.rolesMatrix.map((row, idx) => (
                <tr key={row.role}>
                  <td><strong>{row.role}</strong></td>
                  {['masterConfig', 'collegeAdmin', 'approveLeave', 'enterMarks', 'viewAnalytics', 'issueCerts'].map((k) => (
                    <td key={k}>
                      <input type="checkbox" checked={row[k]} onChange={() => togglePerm(idx, k)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>University Grading Scale</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Grade</th><th>Minimum Score (%)</th><th>Grade Points</th><th>Descriptor</th></tr></thead>
            <tbody>
              {db.masterSettings.gradingScale.map((g) => (
                <tr key={g.grade}>
                  <td><span className="badge">{g.grade}</span></td>
                  <td>{g.min}%+</td>
                  <td>{g.points}</td>
                  <td>{g.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
