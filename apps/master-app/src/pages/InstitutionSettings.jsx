import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function InstitutionSettings() {
  const { db, updateDb } = useCampusStore();
  const [form, setForm] = useState(db.masterSettings);
  const [deptForm, setDeptForm] = useState({ code: '', name: '' });
  const [editDeptId, setEditDeptId] = useState(null);

  const saveSettings = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      masterSettings: {
        ...prev.masterSettings,
        ...form,
        minAttendancePercent: Number(form.minAttendancePercent),
        passPercent: Number(form.passPercent),
        maxMarks: Number(form.maxMarks),
      },
    }), 'Institution Name & Master Rules updated across all 4 portals!');
  };

  const saveDept = (e) => {
    e.preventDefault();
    if (!deptForm.code.trim() || !deptForm.name.trim()) return;
    if (editDeptId) {
      updateDb((prev) => ({
        ...prev,
        departments: prev.departments.map((d) => (d.id === editDeptId ? { ...d, code: deptForm.code.trim().toUpperCase(), name: deptForm.name.trim() } : d)),
      }), 'Department updated');
      setEditDeptId(null);
    } else {
      updateDb((prev) => ({
        ...prev,
        departments: [...prev.departments, { id: `DEPT-${Date.now().toString().slice(-4)}`, code: deptForm.code.trim().toUpperCase(), name: deptForm.name.trim() }],
      }), 'Department added');
    }
    setDeptForm({ code: '', name: '' });
  };

  const deleteDept = (id) => {
    updateDb((prev) => ({ ...prev, departments: prev.departments.filter((d) => d.id !== id) }), 'Department deleted');
  };

  return (
    <div className="stack">
      <PageHeader title="Institution & Master Settings" subtitle="Configure Institution Name, Academic Year, Attendance/Passing Rules, and Departments." />

      <form className="card stack" onSubmit={saveSettings}>
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div className="card-title">Institution Identity & Academic Rules</div>
          <button className="btn btn-primary" type="submit"><Save size={15} /> Save Settings</button>
        </div>
        <div className="grid-3">
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label>Institution Name (Displayed on All 4 Portals)</label>
            <input className="input" value={form.institutionName} onChange={(e) => setForm({ ...form, institutionName: e.target.value })} placeholder="Enter official college / university name" required />
          </div>
          <div className="field">
            <label>Institution Code</label>
            <input className="input" value={form.institutionCode} onChange={(e) => setForm({ ...form, institutionCode: e.target.value })} placeholder="e.g. 2MM" />
          </div>
          <div className="field">
            <label>Academic Year</label>
            <input className="input" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} required />
          </div>
          <div className="field">
            <label>Active Semester</label>
            <select className="select" value={form.activeSemester} onChange={(e) => setForm({ ...form, activeSemester: e.target.value })}>
              {db.masterSettings.semesters.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Min Attendance %</label>
            <input type="number" min="40" max="95" className="input" value={form.minAttendancePercent} onChange={(e) => setForm({ ...form, minAttendancePercent: e.target.value })} />
          </div>
          <div className="field">
            <label>Passing Percentage (%)</label>
            <input type="number" min="20" max="60" className="input" value={form.passPercent} onChange={(e) => setForm({ ...form, passPercent: e.target.value })} />
          </div>
          <div className="field">
            <label>Default Subject Max Marks</label>
            <input type="number" className="input" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
          </div>
        </div>
      </form>

      <div className="card stack">
        <div className="card-title">Departments (Used across Teachers, Students & Subjects)</div>
        <form className="grid-3" onSubmit={saveDept}>
          <input className="input" placeholder="Dept Code (e.g. CSE)" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} required />
          <input className="input" placeholder="Department Full Name" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} required />
          <div className="row">
            <button className="btn btn-primary" type="submit"><Plus size={15} /> {editDeptId ? 'Update Dept' : 'Add Department'}</button>
            {editDeptId && <button type="button" className="btn" onClick={() => { setEditDeptId(null); setDeptForm({ code: '', name: '' }); }}>Cancel</button>}
          </div>
        </form>
        {db.departments.length === 0 ? (
          <EmptyState title="No Departments Yet" message="Add your college departments (e.g. CSE, ECE, AIML, ME) above." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Department Name</th><th>Actions</th></tr></thead>
              <tbody>
                {db.departments.map((d) => (
                  <tr key={d.id}>
                    <td><span className="badge">{d.code}</span></td>
                    <td><strong>{d.name}</strong></td>
                    <td className="row">
                      <button className="btn btn-sm" onClick={() => { setEditDeptId(d.id); setDeptForm({ code: d.code, name: d.name }); }}><Edit3 size={13} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteDept(d.id)}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
