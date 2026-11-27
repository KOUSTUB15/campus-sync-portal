import React, { useState } from 'react';
import { Plus, Edit3, Trash2, RefreshCw } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function HodSubjectsTimetable() {
  const { db, updateDb, currentUser } = useCampusStore();
  const [subTab, setSubTab] = useState('subjects');

  const deptTeachers = db.teachers.filter((t) => !currentUser.dept || t.dept === currentUser.dept || currentUser.dept === 'General');
  const allTeachers = deptTeachers.length ? deptTeachers : db.teachers;

  // Subjects CRUD & Faculty Replacement
  const emptySub = { code: '', name: '', dept: currentUser.dept || '', semester: '1st Sem', type: 'Theory', credits: 4, facultyId: '' };
  const [sForm, setSForm] = useState(emptySub);
  const [editSubId, setEditSubId] = useState(null);

  // Editable Timetable Grid (Custom Columns/Rows)
  const [ttDept, setTtDept] = useState(currentUser.dept || (db.departments[0]?.code || 'CSE'));
  const [ttSem, setTtSem] = useState('1st Sem');
  const [newSlot, setNewSlot] = useState('');
  const [newDay, setNewDay] = useState('');
  const [cellForm, setCellForm] = useState({ day: 'Monday', slot: db.timetable.slots[0] || '', subjectId: '', room: '', replacementFacultyId: '', replacementReason: '' });

  const saveSubject = (e) => {
    e.preventDefault();
    const fac = db.teachers.find((t) => t.id === sForm.facultyId);
    const rec = {
      id: editSubId || `SUB-${Date.now().toString().slice(-4)}`,
      ...sForm,
      code: sForm.code.trim().toUpperCase(),
      credits: Number(sForm.credits) || 3,
      facultyName: fac ? fac.name : 'Unassigned',
    };
    updateDb((prev) => ({
      ...prev,
      subjects: editSubId ? prev.subjects.map((x) => (x.id === editSubId ? rec : x)) : [rec, ...prev.subjects],
    }), editSubId ? 'Subject / Faculty allotment updated!' : 'Subject added & allotted to Faculty!');
    setSForm(emptySub);
    setEditSubId(null);
  };

  const replaceFacultyOnSubject = (subId, newFacId) => {
    const fac = db.teachers.find((t) => t.id === newFacId);
    updateDb((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === subId ? { ...s, facultyId: newFacId, facultyName: fac ? fac.name : 'Unassigned' } : s)),
    }), `Faculty replaced to ${fac ? fac.name : 'Unassigned'} (live on Faculty Portal)`);
  };

  const addRowSlot = () => {
    if (!newSlot.trim()) return;
    updateDb((prev) => ({
      ...prev,
      timetable: { ...prev.timetable, slots: [...prev.timetable.slots, newSlot.trim()] },
    }), 'Added timetable time row');
    setNewSlot('');
  };

  const deleteRowSlot = (slot) => {
    updateDb((prev) => ({
      ...prev,
      timetable: {
        ...prev.timetable,
        slots: prev.timetable.slots.filter((s) => s !== slot),
        entries: prev.timetable.entries.filter((e) => e.slot !== slot),
      },
    }), 'Removed timetable row');
  };

  const addColDay = () => {
    if (!newDay.trim()) return;
    updateDb((prev) => ({
      ...prev,
      timetable: { ...prev.timetable, days: [...prev.timetable.days, newDay.trim()] },
    }), 'Added timetable day column');
    setNewDay('');
  };

  const deleteColDay = (day) => {
    updateDb((prev) => ({
      ...prev,
      timetable: {
        ...prev.timetable,
        days: prev.timetable.days.filter((d) => d !== day),
        entries: prev.timetable.entries.filter((e) => e.day !== day),
      },
    }), 'Removed timetable column');
  };

  const saveTimetableCell = (e) => {
    e.preventDefault();
    const sub = db.subjects.find((s) => s.id === cellForm.subjectId);
    const rep = db.teachers.find((t) => t.id === cellForm.replacementFacultyId);
    if (!sub || !cellForm.day || !cellForm.slot) return;
    const entry = {
      id: `TT-${Date.now().toString().slice(-4)}`,
      dept: ttDept,
      semester: ttSem,
      day: cellForm.day,
      slot: cellForm.slot,
      subjectId: sub.id,
      subjectName: `${sub.code} ${sub.name}`,
      facultyId: sub.facultyId,
      facultyName: sub.facultyName,
      room: cellForm.room,
      replacementFacultyId: rep ? rep.id : '',
      replacementFacultyName: rep ? rep.name : '',
      replacementReason: cellForm.replacementReason,
    };
    updateDb((prev) => ({
      ...prev,
      timetable: {
        ...prev.timetable,
        entries: [
          ...prev.timetable.entries.filter((x) => !(x.dept === ttDept && x.semester === ttSem && x.day === cellForm.day && x.slot === cellForm.slot)),
          entry,
        ],
      },
    }), 'Timetable cell saved (live on Faculty & Student Portals)!');
  };

  const clearTimetableCell = (day, slot) => {
    updateDb((prev) => ({
      ...prev,
      timetable: {
        ...prev.timetable,
        entries: prev.timetable.entries.filter((x) => !(x.dept === ttDept && x.semester === ttSem && x.day === day && x.slot === slot)),
      },
    }), 'Timetable cell cleared');
  };

  const semSubjects = db.subjects.filter((s) => s.semester === ttSem);

  return (
    <div className="stack">
      <PageHeader title="HOD: Subjects, Faculty Allotment & Editable Timetable" subtitle="Add, edit, delete, or replace faculty on subjects per semester, and customize timetable rows/columns." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'subjects' ? 'active' : ''}`} onClick={() => setSubTab('subjects')}>Subjects & Faculty Allotment ({db.subjects.length})</button>
        <button className={`tab-btn ${subTab === 'timetable' ? 'active' : ''}`} onClick={() => setSubTab('timetable')}>Editable Timetable Grid</button>
      </div>

      {subTab === 'subjects' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveSubject}>
            <div className="card-title">{editSubId ? 'Edit Subject' : 'Add Subject & Allot Faculty'}</div>
            <div className="grid-3">
              <input className="input" placeholder="Subject Code (e.g. BCS501)" value={sForm.code} onChange={(e) => setSForm({ ...sForm, code: e.target.value })} required />
              <input className="input" placeholder="Subject Name" value={sForm.name} onChange={(e) => setSForm({ ...sForm, name: e.target.value })} required />
              <input className="input" placeholder="Department" value={sForm.dept} onChange={(e) => setSForm({ ...sForm, dept: e.target.value })} required />
              <select className="select" value={sForm.semester} onChange={(e) => setSForm({ ...sForm, semester: e.target.value })}>
                {db.masterSettings.semesters.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select className="select" value={sForm.type} onChange={(e) => setSForm({ ...sForm, type: e.target.value })}>
                <option>Theory</option><option>Lab</option><option>Theory + Lab</option>
              </select>
              <select className="select" value={sForm.facultyId} onChange={(e) => setSForm({ ...sForm, facultyId: e.target.value })}>
                <option value="">Select Faculty...</option>
                {allTeachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>)}
              </select>
            </div>
            <div className="row">
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editSubId ? 'Update Subject' : 'Add & Allot Subject'}</button>
              {editSubId && <button type="button" className="btn" onClick={() => { setEditSubId(null); setSForm(emptySub); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            {db.subjects.length === 0 ? (
              <EmptyState title="No Subjects Added Yet" message="Add semester subjects and allot them to faculty above." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Code</th><th>Subject</th><th>Dept / Sem</th><th>Type</th><th>Allotted / Replace Faculty</th><th>Actions</th></tr></thead>
                  <tbody>
                    {db.subjects.map((s) => (
                      <tr key={s.id}>
                        <td><code>{s.code}</code></td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.dept} • {s.semester}</td>
                        <td><span className="badge">{s.type}</span></td>
                        <td>
                          <select className="select" style={{ minWidth: 180 }} value={s.facultyId} onChange={(e) => replaceFacultyOnSubject(s.id, e.target.value)}>
                            <option value="">Unassigned</option>
                            {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>)}
                          </select>
                        </td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditSubId(s.id); setSForm(s); }}><Edit3 size={13} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, subjects: prev.subjects.filter((x) => x.id !== s.id) }), 'Subject deleted')}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'timetable' && (
        <div className="stack">
          <div className="card stack">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="card-title">Customize Rows (Time Slots) & Columns (Days)</div>
              <div className="row">
                <input className="input" style={{ width: 130 }} placeholder="Dept (CSE)" value={ttDept} onChange={(e) => setTtDept(e.target.value)} />
                <select className="select" style={{ width: 130 }} value={ttSem} onChange={(e) => setTtSem(e.target.value)}>
                  {db.masterSettings.semesters.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="row">
                <input className="input" style={{ flex: 1 }} placeholder="Add Row (e.g. 04:00 - 05:00)" value={newSlot} onChange={(e) => setNewSlot(e.target.value)} />
                <button className="btn btn-sm btn-primary" onClick={addRowSlot}><Plus size={14} /> Add Row</button>
              </div>
              <div className="row">
                <input className="input" style={{ flex: 1 }} placeholder="Add Column (e.g. Sunday / Extra)" value={newDay} onChange={(e) => setNewDay(e.target.value)} />
                <button className="btn btn-sm btn-primary" onClick={addColDay}><Plus size={14} /> Add Column</button>
              </div>
            </div>

            <form className="grid-3" onSubmit={saveTimetableCell}>
              <select className="select" value={cellForm.day} onChange={(e) => setCellForm({ ...cellForm, day: e.target.value })}>
                {db.timetable.days.map((d) => <option key={d}>{d}</option>)}
              </select>
              <select className="select" value={cellForm.slot} onChange={(e) => setCellForm({ ...cellForm, slot: e.target.value })}>
                {db.timetable.slots.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select className="select" value={cellForm.subjectId} onChange={(e) => setCellForm({ ...cellForm, subjectId: e.target.value })} required>
                <option value="">Select Subject ({ttSem})...</option>
                {(semSubjects.length ? semSubjects : db.subjects).map((s) => <option key={s.id} value={s.id}>{s.code} {s.name} ({s.facultyName})</option>)}
              </select>
              <input className="input" placeholder="Room / Lab No." value={cellForm.room} onChange={(e) => setCellForm({ ...cellForm, room: e.target.value })} />
              <select className="select" value={cellForm.replacementFacultyId} onChange={(e) => setCellForm({ ...cellForm, replacementFacultyId: e.target.value })}>
                <option value="">No Replacement Faculty</option>
                {db.teachers.map((t) => <option key={t.id} value={t.id}>Replace with: {t.name}</option>)}
              </select>
              <button className="btn btn-primary" type="submit"><RefreshCw size={14} /> Update Cell</button>
            </form>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Timetable Matrix — {ttDept} • {ttSem}</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Time Slot (Row)</th>
                    {db.timetable.days.map((day) => (
                      <th key={day}>
                        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                          <span>{day}</span>
                          <button className="btn btn-sm btn-danger" style={{ padding: '2px 5px' }} onClick={() => deleteColDay(day)} title="Delete Column">×</button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {db.timetable.slots.map((slot) => (
                    <tr key={slot}>
                      <td>
                        <div className="row" style={{ flexWrap: 'nowrap' }}>
                          <strong>{slot}</strong>
                          <button className="btn btn-sm btn-danger" style={{ padding: '2px 5px' }} onClick={() => deleteRowSlot(slot)} title="Delete Row">×</button>
                        </div>
                      </td>
                      {db.timetable.days.map((day) => {
                        const cell = db.timetable.entries.find((e) => e.dept === ttDept && e.semester === ttSem && e.day === day && e.slot === slot);
                        return (
                          <td key={day} style={{ minWidth: 145 }}>
                            {cell ? (
                              <div style={{ padding: 7, borderRadius: 8, background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
                                <div style={{ fontWeight: 700, fontSize: 12.5 }}>{cell.subjectName}</div>
                                <div className="card-sub" style={{ fontSize: 11 }}>{cell.facultyName} {cell.room ? `• ${cell.room}` : ''}</div>
                                {cell.replacementFacultyName && <span className="badge badge-warning" style={{ fontSize: 10, marginTop: 3 }}>Sub: {cell.replacementFacultyName}</span>}
                                <div style={{ marginTop: 4 }}>
                                  <button className="btn btn-sm btn-danger" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => clearTimetableCell(day, slot)}>Clear</button>
                                </div>
                              </div>
                            ) : (
                              <span className="card-sub">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
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
