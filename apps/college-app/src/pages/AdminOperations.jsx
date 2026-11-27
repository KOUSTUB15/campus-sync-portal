import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Calendar, Users, BookOpen, ClipboardList, Award } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState } from '@campus/shared-core';

export default function AdminOperations() {
  const { db, updateDb, currentUser } = useCampusStore();
  const [subTab, setSubTab] = useState('subjects');

  // Subject allotment
  const emptySub = { code: '', name: '', dept: '', semester: '1st Sem', type: 'Theory', credits: 4, facultyId: '' };
  const [sForm, setSForm] = useState(emptySub);
  const [editSubId, setEditSubId] = useState(null);

  // Faculty meeting
  const emptyMeet = { title: '', date: '', time: '', venue: '', agenda: '', minutes: '' };
  const [mForm, setMForm] = useState(emptyMeet);
  const [editMeetId, setEditMeetId] = useState(null);

  // Semester calendar
  const emptyCal = { date: '', endDate: '', title: '', category: 'Academic', description: '' };
  const [cForm, setCForm] = useState(emptyCal);
  const [editCalId, setEditCalId] = useState(null);

  // Peon / Office task assignment
  const [taskForm, setTaskForm] = useState({ title: '', assignedToId: '', priority: 'Medium', dueDate: '', location: '', notes: '' });

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
    }), editSubId ? 'Subject allotment updated on Teacher & HOD Portals!' : 'Subject allotted! Faculty will now see it in their portal.');
    setSForm(emptySub);
    setEditSubId(null);
  };

  const saveMeeting = (e) => {
    e.preventDefault();
    const rec = { id: editMeetId || `MTG-${Date.now().toString().slice(-4)}`, ...mForm, createdBy: currentUser.name };
    updateDb((prev) => ({
      ...prev,
      facultyMeetings: editMeetId ? prev.facultyMeetings.map((x) => (x.id === editMeetId ? rec : x)) : [rec, ...prev.facultyMeetings],
    }), editMeetId ? 'Faculty meeting updated!' : 'Faculty meeting scheduled (visible to HOD & Faculty)!');
    setMForm(emptyMeet);
    setEditMeetId(null);
  };

  const saveCalendar = (e) => {
    e.preventDefault();
    const rec = { id: editCalId || `CAL-${Date.now().toString().slice(-4)}`, ...cForm };
    updateDb((prev) => ({
      ...prev,
      semesterCalendar: editCalId ? prev.semesterCalendar.map((x) => (x.id === editCalId ? rec : x)) : [...prev.semesterCalendar, rec].sort((a, b) => a.date.localeCompare(b.date)),
    }), 'Whole semester calendar updated across all portals!');
    setCForm(emptyCal);
    setEditCalId(null);
  };

  const assignTask = (e) => {
    e.preventDefault();
    const worker = db.officeWorkers.find((w) => w.id === taskForm.assignedToId);
    updateDb((prev) => ({
      ...prev,
      officeTasks: [{
        id: `TSK-${Date.now().toString().slice(-4)}`,
        ...taskForm,
        assignedToName: worker ? worker.name : 'Any Support Staff',
        assignedToRole: worker ? worker.role : 'Peon',
        status: 'Pending',
        createdBy: currentUser.name,
      }, ...prev.officeTasks],
    }), 'Task sent to Support Staff / Peon Portal!');
    setTaskForm({ title: '', assignedToId: '', priority: 'Medium', dueDate: '', location: '', notes: '' });
  };

  return (
    <div className="stack">
      <PageHeader title="College Academic & Office Operations" subtitle="Faculty Subject Allotment, Faculty Meetings, Whole Semester Calendar, Peon Task Assignment & Faculty Research." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'subjects' ? 'active' : ''}`} onClick={() => setSubTab('subjects')}>Faculty Subject Allotment ({db.subjects.length})</button>
        <button className={`tab-btn ${subTab === 'meetings' ? 'active' : ''}`} onClick={() => setSubTab('meetings')}>Faculty Meetings ({db.facultyMeetings.length})</button>
        <button className={`tab-btn ${subTab === 'calendar' ? 'active' : ''}`} onClick={() => setSubTab('calendar')}>Whole Semester Calendar ({db.semesterCalendar.length})</button>
        <button className={`tab-btn ${subTab === 'tasks' ? 'active' : ''}`} onClick={() => setSubTab('tasks')}>Assign Peon / Staff Tasks</button>
        <button className={`tab-btn ${subTab === 'research' ? 'active' : ''}`} onClick={() => setSubTab('research')}>Faculty Research ({db.researchPapers.length})</button>
      </div>

      {subTab === 'subjects' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveSubject}>
            <div className="row"><BookOpen size={18} color="var(--accent)" /><span className="card-title">{editSubId ? 'Edit Subject Allotment' : 'Allot Subject to Faculty (Effects Teacher Portal Immediately)'}</span></div>
            <div className="grid-3">
              <input className="input" placeholder="Subject Code (e.g. BCS501)" value={sForm.code} onChange={(e) => setSForm({ ...sForm, code: e.target.value })} required />
              <input className="input" placeholder="Subject Name" value={sForm.name} onChange={(e) => setSForm({ ...sForm, name: e.target.value })} required />
              <input className="input" placeholder="Department (e.g. CSE)" value={sForm.dept} onChange={(e) => setSForm({ ...sForm, dept: e.target.value })} required />
              <select className="select" value={sForm.semester} onChange={(e) => setSForm({ ...sForm, semester: e.target.value })}>
                {db.masterSettings.semesters.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select className="select" value={sForm.type} onChange={(e) => setSForm({ ...sForm, type: e.target.value })}>
                <option>Theory</option><option>Lab</option><option>Theory + Lab</option>
              </select>
              <select className="select" value={sForm.facultyId} onChange={(e) => setSForm({ ...sForm, facultyId: e.target.value })}>
                <option value="">Allot Faculty...</option>
                {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.designation} • {t.dept})</option>)}
              </select>
            </div>
            <div className="row">
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editSubId ? 'Update Allotment' : 'Allot Subject'}</button>
              {editSubId && <button type="button" className="btn" onClick={() => { setEditSubId(null); setSForm(emptySub); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            {db.subjects.length === 0 ? (
              <EmptyState title="No Subjects Allotted Yet" message="Allot subjects here or in HOD Portal. Faculty only see subjects allotted to them." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Code</th><th>Subject</th><th>Dept / Sem</th><th>Type</th><th>Allotted Faculty</th><th>Actions</th></tr></thead>
                  <tbody>
                    {db.subjects.map((s) => (
                      <tr key={s.id}>
                        <td><code>{s.code}</code></td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.dept} • {s.semester}</td>
                        <td><span className="badge">{s.type}</span></td>
                        <td><strong>{s.facultyName}</strong></td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditSubId(s.id); setSForm(s); }}><Edit3 size={13} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, subjects: prev.subjects.filter((x) => x.id !== s.id) }), 'Subject removed')}><Trash2 size={13} /></button>
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

      {subTab === 'meetings' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveMeeting}>
            <div className="row"><Users size={18} color="var(--accent)" /><span className="card-title">{editMeetId ? 'Edit Faculty Meeting' : 'Schedule Faculty Meeting'}</span></div>
            <div className="grid-3">
              <input className="input" placeholder="Meeting Title" value={mForm.title} onChange={(e) => setMForm({ ...mForm, title: e.target.value })} required />
              <input type="date" className="input" value={mForm.date} onChange={(e) => setMForm({ ...mForm, date: e.target.value })} required />
              <input className="input" placeholder="Time (e.g. 11:00 AM)" value={mForm.time} onChange={(e) => setMForm({ ...mForm, time: e.target.value })} required />
              <input className="input" placeholder="Venue (e.g. Seminar Hall)" value={mForm.venue} onChange={(e) => setMForm({ ...mForm, venue: e.target.value })} required />
              <input className="input" style={{ gridColumn: 'span 2' }} placeholder="Agenda" value={mForm.agenda} onChange={(e) => setMForm({ ...mForm, agenda: e.target.value })} required />
            </div>
            <textarea className="textarea" placeholder="Meeting Minutes / Decisions (optional)" value={mForm.minutes} onChange={(e) => setMForm({ ...mForm, minutes: e.target.value })} />
            <div className="row">
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editMeetId ? 'Update Meeting' : 'Schedule Meeting'}</button>
              {editMeetId && <button type="button" className="btn" onClick={() => { setEditMeetId(null); setMForm(emptyMeet); }}>Cancel</button>}
            </div>
          </form>

          <div className="card stack">
            {db.facultyMeetings.length === 0 ? (
              <EmptyState title="No Faculty Meetings Scheduled" message="Schedule a faculty meeting above." />
            ) : (
              db.facultyMeetings.map((m) => (
                <div key={m.id} style={{ padding: 14, borderRadius: 12, background: 'var(--surface-elevated)' }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div><strong>{m.title}</strong><div className="card-sub">{m.date} • {m.time} • Venue: {m.venue}</div></div>
                    <div className="row">
                      <button className="btn btn-sm" onClick={() => { setEditMeetId(m.id); setMForm(m); }}><Edit3 size={13} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, facultyMeetings: prev.facultyMeetings.filter((x) => x.id !== m.id) }), 'Meeting deleted')}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="card-sub" style={{ marginTop: 6 }}><strong>Agenda:</strong> {m.agenda}</div>
                  {m.minutes && <div className="card-sub" style={{ marginTop: 4 }}><strong>Minutes:</strong> {m.minutes}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {subTab === 'calendar' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveCalendar}>
            <div className="row"><Calendar size={18} color="var(--accent)" /><span className="card-title">{editCalId ? 'Edit Calendar Event' : 'Add Whole Semester Calendar Event'}</span></div>
            <div className="grid-4">
              <div className="field"><label>Start Date *</label><input type="date" className="input" value={cForm.date} onChange={(e) => setCForm({ ...cForm, date: e.target.value })} required /></div>
              <div className="field"><label>End Date (Optional)</label><input type="date" className="input" value={cForm.endDate} onChange={(e) => setCForm({ ...cForm, endDate: e.target.value })} /></div>
              <div className="field">
                <label>Category</label>
                <select className="select" value={cForm.category} onChange={(e) => setCForm({ ...cForm, category: e.target.value })}>
                  <option>Academic</option><option>Exam</option><option>Holiday</option><option>Meeting</option><option>Event</option>
                </select>
              </div>
              <div className="field"><label>Event Title *</label><input className="input" placeholder="e.g. Semester Reopening" value={cForm.title} onChange={(e) => setCForm({ ...cForm, title: e.target.value })} required /></div>
            </div>
            <input className="input" placeholder="Description / Instructions" value={cForm.description} onChange={(e) => setCForm({ ...cForm, description: e.target.value })} />
            <div className="row">
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editCalId ? 'Update Event' : 'Add to Semester Calendar'}</button>
              {editCalId && <button type="button" className="btn" onClick={() => { setEditCalId(null); setCForm(emptyCal); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            {db.semesterCalendar.length === 0 ? (
              <EmptyState title="Semester Calendar is Empty" message="Add semester reopening, internal exams, holidays, and last working day above." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Dates</th><th>Event</th><th>Category</th><th>Description</th><th>Actions</th></tr></thead>
                  <tbody>
                    {db.semesterCalendar.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.date}</strong>{c.endDate ? ` to ${c.endDate}` : ''}</td>
                        <td><strong>{c.title}</strong></td>
                        <td><span className="badge">{c.category}</span></td>
                        <td>{c.description || '—'}</td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditCalId(c.id); setCForm(c); }}><Edit3 size={13} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, semesterCalendar: prev.semesterCalendar.filter((x) => x.id !== c.id) }), 'Event deleted')}><Trash2 size={13} /></button>
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

      {subTab === 'tasks' && (
        <div className="stack">
          <form className="card stack" onSubmit={assignTask}>
            <div className="row"><ClipboardList size={18} color="var(--accent)" /><span className="card-title">Assign Duty to Peon / Office Support Staff</span></div>
            <div className="grid-3">
              <input className="input" placeholder="Task / Duty Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
              <select className="select" value={taskForm.assignedToId} onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}>
                <option value="">All Peons / Support Staff</option>
                {db.officeWorkers.filter((w) => w.role === 'Peon').map((w) => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
              </select>
              <input className="input" placeholder="Location / Room" value={taskForm.location} onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })} />
              <input type="date" className="input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              <input className="input" style={{ gridColumn: 'span 2' }} placeholder="Instructions" value={taskForm.notes} onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })} />
            </div>
            <div><button className="btn btn-primary" type="submit"><Plus size={15} /> Assign Duty</button></div>
          </form>

          <div className="card">
            {db.officeTasks.length === 0 ? (
              <EmptyState title="No Office Tasks Assigned" message="Tasks assigned here appear exclusively in the Peon Portal." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Task</th><th>Assigned To</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {db.officeTasks.map((t) => (
                      <tr key={t.id}>
                        <td><strong>{t.title}</strong></td>
                        <td>{t.assignedToName}</td>
                        <td>{t.location || '—'}</td>
                        <td><span className={`badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, officeTasks: prev.officeTasks.filter((x) => x.id !== t.id) }), 'Task removed')}><Trash2 size={13} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'research' && (
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}><Award size={18} color="var(--accent)" /><span className="card-title">Faculty Research & Publications (Synced from Faculty Portal)</span></div>
          {db.researchPapers.length === 0 ? (
            <EmptyState title="No Research Publications Yet" message="Publications entered by Faculty in Teachers Portal automatically appear here." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Faculty</th><th>Dept</th><th>Type</th><th>Title</th><th>Venue / Year</th><th>DOI / Link</th></tr></thead>
                <tbody>
                  {db.researchPapers.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.facultyName}</strong></td>
                      <td>{r.dept}</td>
                      <td><span className="badge">{r.type}</span></td>
                      <td><strong>{r.title}</strong></td>
                      <td>{r.venue} ({r.year})</td>
                      <td>{r.doiOrLink ? <a href={r.doiOrLink.startsWith('http') ? r.doiOrLink : '#'} target="_blank" rel="noreferrer">{r.doiOrLink}</a> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
