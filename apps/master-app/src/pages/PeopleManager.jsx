import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState, semesterToYearLevel } from '@campus/shared-core';

export default function PeopleManager() {
  const { db, updateDb } = useCampusStore();
  const [subTab, setSubTab] = useState('teachers');
  const [search, setSearch] = useState('');

  // Teacher form
  const emptyTeacher = { id: '', name: '', designation: 'Faculty', dept: '', email: '', password: '', phone: '', qualification: '' };
  const [tForm, setTForm] = useState(emptyTeacher);
  const [editTeacherId, setEditTeacherId] = useState(null);

  // Student form
  const emptyStudent = { usn: '', name: '', dept: '', semester: '1st Sem', eligibilityStatus: 'Eligible', email: '', password: '', phone: '', parentName: '', parentPhone: '' };
  const [sForm, setSForm] = useState(emptyStudent);
  const [editStudentUsn, setEditStudentUsn] = useState(null);

  // Office Worker form
  const emptyWorker = { id: '', name: '', role: 'College Admin', email: '', password: '', phone: '', dutyNotes: '' };
  const [wForm, setWForm] = useState(emptyWorker);
  const [editWorkerId, setEditWorkerId] = useState(null);

  const saveTeacher = (e) => {
    e.preventDefault();
    const id = editTeacherId || `FAC-${Date.now().toString().slice(-4)}`;
    const record = { ...tForm, id, email: tForm.email.trim().toLowerCase(), dept: tForm.dept.trim() || 'General', joinedDate: new Date().toISOString().slice(0, 10) };
    const userAccount = { id: `USR-${id}`, refId: id, portal: 'teacher', subRole: record.designation, name: record.name, email: record.email, password: record.password, phone: record.phone, dept: record.dept };

    updateDb((prev) => ({
      ...prev,
      teachers: editTeacherId ? prev.teachers.map((t) => (t.id === editTeacherId ? record : t)) : [record, ...prev.teachers],
      users: [...prev.users.filter((u) => !(u.refId === id && u.portal === 'teacher')), userAccount],
    }), editTeacherId ? 'Teacher updated!' : `${record.designation} ${record.name} added with login credentials!`);
    setTForm(emptyTeacher);
    setEditTeacherId(null);
  };

  const deleteTeacher = (id) => {
    updateDb((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== id),
      users: prev.users.filter((u) => !(u.refId === id && u.portal === 'teacher')),
    }), 'Teacher deleted');
  };

  const saveStudent = (e) => {
    e.preventDefault();
    const usn = (editStudentUsn || sForm.usn).trim().toUpperCase();
    const record = {
      ...sForm,
      usn,
      email: sForm.email.trim().toLowerCase(),
      dept: sForm.dept.trim() || 'General',
      academicYearLevel: semesterToYearLevel(sForm.semester),
      admissionDocs: editStudentUsn ? (db.students.find((x) => x.usn === editStudentUsn)?.admissionDocs || []) : [],
      feeTotal: editStudentUsn ? (db.students.find((x) => x.usn === editStudentUsn)?.feeTotal || 0) : 0,
      feePaid: editStudentUsn ? (db.students.find((x) => x.usn === editStudentUsn)?.feePaid || 0) : 0,
    };
    const userAccount = { id: `USR-${usn}`, refId: usn, portal: 'student', subRole: 'Student', name: record.name, email: record.email, password: record.password, phone: record.phone, dept: record.dept };

    updateDb((prev) => ({
      ...prev,
      students: editStudentUsn ? prev.students.map((s) => (s.usn === editStudentUsn ? record : s)) : [record, ...prev.students],
      users: [...prev.users.filter((u) => !(u.refId === usn && u.portal === 'student')), userAccount],
    }), editStudentUsn ? 'Student updated!' : `Student ${record.name} added with login credentials!`);
    setSForm(emptyStudent);
    setEditStudentUsn(null);
  };

  const deleteStudent = (usn) => {
    updateDb((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.usn !== usn),
      users: prev.users.filter((u) => !(u.refId === usn && u.portal === 'student')),
    }), 'Student deleted');
  };

  const saveWorker = (e) => {
    e.preventDefault();
    const id = editWorkerId || `OFF-${Date.now().toString().slice(-4)}`;
    const record = { ...wForm, id, email: wForm.email.trim().toLowerCase(), joinedDate: new Date().toISOString().slice(0, 10) };
    const userAccount = { id: `USR-${id}`, refId: id, portal: 'college', subRole: record.role, name: record.name, email: record.email, password: record.password, phone: record.phone, dept: 'College Office' };

    updateDb((prev) => ({
      ...prev,
      officeWorkers: editWorkerId ? prev.officeWorkers.map((w) => (w.id === editWorkerId ? record : w)) : [record, ...prev.officeWorkers],
      users: [...prev.users.filter((u) => !(u.refId === id && u.portal === 'college')), userAccount],
    }), editWorkerId ? 'Office Worker updated!' : `${record.role} ${record.name} added for College Portal!`);
    setWForm(emptyWorker);
    setEditWorkerId(null);
  };

  const deleteWorker = (id) => {
    updateDb((prev) => ({
      ...prev,
      officeWorkers: prev.officeWorkers.filter((w) => w.id !== id),
      users: prev.users.filter((u) => !(u.refId === id && u.portal === 'college')),
    }), 'Office Worker deleted');
  };

  const q = search.trim().toLowerCase();

  return (
    <div className="stack">
      <PageHeader
        title="People & Credentials Directory"
        subtitle="Add, edit, or delete Teachers (HOD / Faculty), Students, and Office Workers (College Admin, Accountant, Peon, Clerk, Librarian)."
        actions={
          <div className="row">
            <Search size={15} color="var(--text-muted)" />
            <input className="input" style={{ width: 220 }} placeholder="Search by name, USN, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        }
      />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'teachers' ? 'active' : ''}`} onClick={() => setSubTab('teachers')}>Teachers & HOD ({db.teachers.length})</button>
        <button className={`tab-btn ${subTab === 'students' ? 'active' : ''}`} onClick={() => setSubTab('students')}>Students ({db.students.length})</button>
        <button className={`tab-btn ${subTab === 'workers' ? 'active' : ''}`} onClick={() => setSubTab('workers')}>Office Workers ({db.officeWorkers.length})</button>
      </div>

      {subTab === 'teachers' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveTeacher}>
            <div className="card-title">{editTeacherId ? 'Edit Teacher' : 'Add New Teacher (HOD or Faculty)'}</div>
            <div className="grid-3">
              <div className="field"><label>Full Name</label><input className="input" value={tForm.name} onChange={(e) => setTForm({ ...tForm, name: e.target.value })} required /></div>
              <div className="field">
                <label>Role in Teachers App</label>
                <select className="select" value={tForm.designation} onChange={(e) => setTForm({ ...tForm, designation: e.target.value })}>
                  <option value="HOD">HOD</option>
                  <option value="Faculty">Faculty</option>
                </select>
              </div>
              <div className="field">
                <label>Department</label>
                <input className="input" list="dept-list" placeholder="e.g. CSE" value={tForm.dept} onChange={(e) => setTForm({ ...tForm, dept: e.target.value })} required />
              </div>
              <div className="field"><label>Login Email</label><input type="email" className="input" value={tForm.email} onChange={(e) => setTForm({ ...tForm, email: e.target.value })} required /></div>
              <div className="field"><label>Login Password</label><input className="input" value={tForm.password} onChange={(e) => setTForm({ ...tForm, password: e.target.value })} required /></div>
              <div className="field"><label>Phone</label><input className="input" value={tForm.phone} onChange={(e) => setTForm({ ...tForm, phone: e.target.value })} /></div>
            </div>
            <div className="row">
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editTeacherId ? 'Save Changes' : 'Add Teacher'}</button>
              {editTeacherId && <button type="button" className="btn" onClick={() => { setEditTeacherId(null); setTForm(emptyTeacher); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            {db.teachers.length === 0 ? (
              <EmptyState title="No Teachers Added" message="Add an HOD or Faculty member above so they can log in to the Teachers Portal." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Designation</th><th>Dept</th><th>Email / Password</th><th>Actions</th></tr></thead>
                  <tbody>
                    {db.teachers.filter((t) => `${t.name} ${t.email} ${t.dept} ${t.designation}`.toLowerCase().includes(q)).map((t) => (
                      <tr key={t.id}>
                        <td><code>{t.id}</code></td>
                        <td><strong>{t.name}</strong><div className="card-sub">{t.phone}</div></td>
                        <td><span className={`badge ${t.designation === 'HOD' ? 'badge-warning' : 'badge-info'}`}>{t.designation}</span></td>
                        <td>{t.dept}</td>
                        <td>{t.email}<div className="card-sub">Pass: <code>{t.password}</code></div></td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditTeacherId(t.id); setTForm(t); }}><Edit3 size={13} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteTeacher(t.id)}><Trash2 size={13} /></button>
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

      {subTab === 'students' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveStudent}>
            <div className="card-title">{editStudentUsn ? `Edit Student (${editStudentUsn})` : 'Add New Student'}</div>
            <div className="grid-3">
              <div className="field"><label>USN / Roll No</label><input className="input" value={sForm.usn} onChange={(e) => setSForm({ ...sForm, usn: e.target.value })} disabled={Boolean(editStudentUsn)} required /></div>
              <div className="field"><label>Full Name</label><input className="input" value={sForm.name} onChange={(e) => setSForm({ ...sForm, name: e.target.value })} required /></div>
              <div className="field"><label>Department</label><input className="input" list="dept-list" placeholder="e.g. CSE" value={sForm.dept} onChange={(e) => setSForm({ ...sForm, dept: e.target.value })} required /></div>
              <div className="field">
                <label>Semester</label>
                <select className="select" value={sForm.semester} onChange={(e) => setSForm({ ...sForm, semester: e.target.value })}>
                  {db.masterSettings.semesters.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field"><label>Login Email</label><input type="email" className="input" value={sForm.email} onChange={(e) => setSForm({ ...sForm, email: e.target.value })} required /></div>
              <div className="field"><label>Login Password</label><input className="input" value={sForm.password} onChange={(e) => setSForm({ ...sForm, password: e.target.value })} required /></div>
              <div className="field"><label>Phone</label><input className="input" value={sForm.phone} onChange={(e) => setSForm({ ...sForm, phone: e.target.value })} /></div>
              <div className="field"><label>Parent Name</label><input className="input" value={sForm.parentName} onChange={(e) => setSForm({ ...sForm, parentName: e.target.value })} /></div>
              <div className="field"><label>Parent Phone</label><input className="input" value={sForm.parentPhone} onChange={(e) => setSForm({ ...sForm, parentPhone: e.target.value })} /></div>
            </div>
            <div className="row">
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editStudentUsn ? 'Save Changes' : 'Add Student'}</button>
              {editStudentUsn && <button type="button" className="btn" onClick={() => { setEditStudentUsn(null); setSForm(emptyStudent); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            {db.students.length === 0 ? (
              <EmptyState title="No Students Added" message="Add students here or via Complete Admission in College Portal." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>USN</th><th>Name</th><th>Dept / Sem</th><th>Status</th><th>Login Credentials</th><th>Actions</th></tr></thead>
                  <tbody>
                    {db.students.filter((s) => `${s.usn} ${s.name} ${s.email} ${s.dept}`.toLowerCase().includes(q)).map((s) => (
                      <tr key={s.usn}>
                        <td><code>{s.usn}</code></td>
                        <td><strong>{s.name}</strong><div className="card-sub">{s.phone}</div></td>
                        <td>{s.dept} • {s.semester} (Yr {s.academicYearLevel})</td>
                        <td><span className={`badge ${s.eligibilityStatus === 'Year Back' ? 'badge-danger' : 'badge-success'}`}>{s.eligibilityStatus}</span></td>
                        <td>{s.email}<div className="card-sub">Pass: <code>{s.password}</code></div></td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditStudentUsn(s.usn); setSForm(s); }}><Edit3 size={13} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteStudent(s.usn)}><Trash2 size={13} /></button>
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

      {subTab === 'workers' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveWorker}>
            <div className="card-title">{editWorkerId ? 'Edit Office Worker' : 'Add Office Worker (College Portal Role-Scoped Login)'}</div>
            <div className="grid-3">
              <div className="field"><label>Full Name</label><input className="input" value={wForm.name} onChange={(e) => setWForm({ ...wForm, name: e.target.value })} required /></div>
              <div className="field">
                <label>Office Job Role</label>
                <select className="select" value={wForm.role} onChange={(e) => setWForm({ ...wForm, role: e.target.value })}>
                  <option value="College Admin">College Admin (Full Office Access)</option>
                  <option value="Accountant">Accountant (Finance & Fees Only)</option>
                  <option value="Peon">Peon / Support Staff (Tasks & Errands Only)</option>
                  <option value="Clerk">Clerk / Admission Officer (Admissions & Certs Only)</option>
                  <option value="Librarian">Librarian (Library Books & Issues Only)</option>
                </select>
              </div>
              <div className="field"><label>Phone</label><input className="input" value={wForm.phone} onChange={(e) => setWForm({ ...wForm, phone: e.target.value })} /></div>
              <div className="field"><label>Login Email</label><input type="email" className="input" value={wForm.email} onChange={(e) => setWForm({ ...wForm, email: e.target.value })} required /></div>
              <div className="field"><label>Login Password</label><input className="input" value={wForm.password} onChange={(e) => setWForm({ ...wForm, password: e.target.value })} required /></div>
              <div className="field"><label>Duty Notes</label><input className="input" placeholder="e.g. Accounts desk / Block B Peon" value={wForm.dutyNotes} onChange={(e) => setWForm({ ...wForm, dutyNotes: e.target.value })} /></div>
            </div>
            <div className="row">
              <button className="btn btn-primary" type="submit"><Plus size={15} /> {editWorkerId ? 'Save Changes' : 'Add Office Worker'}</button>
              {editWorkerId && <button type="button" className="btn" onClick={() => { setEditWorkerId(null); setWForm(emptyWorker); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            {db.officeWorkers.length === 0 ? (
              <EmptyState title="No Office Workers Added" message="Add a College Admin, Accountant, Peon, Clerk, or Librarian above. Each worker will see ONLY their own job portal after logging into College Portal." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Job Role</th><th>Duty Notes</th><th>Login Credentials</th><th>Actions</th></tr></thead>
                  <tbody>
                    {db.officeWorkers.filter((w) => `${w.name} ${w.role} ${w.email}`.toLowerCase().includes(q)).map((w) => (
                      <tr key={w.id}>
                        <td><code>{w.id}</code></td>
                        <td><strong>{w.name}</strong><div className="card-sub">{w.phone}</div></td>
                        <td><span className="badge badge-info">{w.role}</span></td>
                        <td>{w.dutyNotes || '—'}</td>
                        <td>{w.email}<div className="card-sub">Pass: <code>{w.password}</code></div></td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditWorkerId(w.id); setWForm(w); }}><Edit3 size={13} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteWorker(w.id)}><Trash2 size={13} /></button>
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

      <datalist id="dept-list">
        {db.departments.map((d) => <option key={d.id} value={d.code}>{d.name}</option>)}
      </datalist>
    </div>
  );
}
