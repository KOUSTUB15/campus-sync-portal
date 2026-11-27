import React, { useState } from 'react';
import { UserPlus, Trash2, Edit3 } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState, FileUploadButton, DownloadFileButton, semesterToYearLevel } from '@campus/shared-core';

export default function AdmissionsCredentials() {
  const { db, updateDb, showToast } = useCampusStore();
  const [subTab, setSubTab] = useState('admission');

  const emptyAdm = {
    usn: '', name: '', email: '', password: '', phone: '', dob: '', gender: 'Male', address: '',
    dept: '', semester: '1st Sem', admissionQuota: 'Govt', parentName: '', parentPhone: '',
    prevQualification: '', feeTotal: 0, feePaid: 0, scholarship: 'None', admissionDocs: [],
  };
  const [adm, setAdm] = useState(emptyAdm);
  const [editUsn, setEditUsn] = useState(null);

  const emptyTeacher = { name: '', designation: 'Faculty', dept: '', email: '', password: '', phone: '', qualification: '' };
  const [tForm, setTForm] = useState(emptyTeacher);
  const [editTid, setEditTid] = useState(null);

  const addAdmissionDoc = (fileRes) => {
    setAdm((prev) => ({
      ...prev,
      admissionDocs: [...prev.admissionDocs, { id: `DOC-${Date.now().toString().slice(-4)}`, ...fileRes, uploadedAt: new Date().toISOString().slice(0, 10) }],
    }));
    showToast(`Attached ${fileRes.name}`);
  };

  const saveAdmission = (e) => {
    e.preventDefault();
    const usn = (editUsn || adm.usn).trim().toUpperCase();
    const record = {
      ...adm,
      usn,
      email: adm.email.trim().toLowerCase(),
      dept: adm.dept.trim() || 'General',
      academicYearLevel: semesterToYearLevel(adm.semester),
      eligibilityStatus: editUsn ? (db.students.find((s) => s.usn === editUsn)?.eligibilityStatus || 'Eligible') : 'Eligible',
      feeTotal: Number(adm.feeTotal) || 0,
      feePaid: Number(adm.feePaid) || 0,
    };
    const userObj = { id: `USR-${usn}`, refId: usn, portal: 'student', subRole: 'Student', name: record.name, email: record.email, password: record.password, phone: record.phone, dept: record.dept };

    updateDb((prev) => ({
      ...prev,
      students: editUsn ? prev.students.map((s) => (s.usn === editUsn ? record : s)) : [record, ...prev.students],
      users: [...prev.users.filter((u) => !(u.refId === usn && u.portal === 'student')), userObj],
    }), editUsn ? 'Student admission record updated!' : `Student ${record.name} admitted & portal credentials created!`);
    setAdm(emptyAdm);
    setEditUsn(null);
  };

  const deleteStudent = (usn) => {
    updateDb((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.usn !== usn),
      users: prev.users.filter((u) => !(u.refId === usn && u.portal === 'student')),
    }), 'Student deleted');
  };

  const saveTeacher = (e) => {
    e.preventDefault();
    const id = editTid || `FAC-${Date.now().toString().slice(-4)}`;
    const record = { ...tForm, id, email: tForm.email.trim().toLowerCase(), dept: tForm.dept.trim() || 'General', joinedDate: new Date().toISOString().slice(0, 10) };
    const userObj = { id: `USR-${id}`, refId: id, portal: 'teacher', subRole: record.designation, name: record.name, email: record.email, password: record.password, phone: record.phone, dept: record.dept };

    updateDb((prev) => ({
      ...prev,
      teachers: editTid ? prev.teachers.map((t) => (t.id === editTid ? record : t)) : [record, ...prev.teachers],
      users: [...prev.users.filter((u) => !(u.refId === id && u.portal === 'teacher')), userObj],
    }), editTid ? 'Teacher updated!' : `${record.designation} ${record.name} registered with email & password!`);
    setTForm(emptyTeacher);
    setEditTid(null);
  };

  const deleteTeacher = (id) => {
    updateDb((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== id),
      users: prev.users.filter((u) => !(u.refId === id && u.portal === 'teacher')),
    }), 'Teacher deleted');
  };

  return (
    <div className="stack">
      <PageHeader title="Complete Student Admission & Portal Credentials" subtitle="Capture complete student details, upload admission documents, and assign login email & password for students and teachers." />

      <div className="tabs">
        <button className={`tab-btn ${subTab === 'admission' ? 'active' : ''}`} onClick={() => setSubTab('admission')}>Student Admission & List ({db.students.length})</button>
        <button className={`tab-btn ${subTab === 'teachers' ? 'active' : ''}`} onClick={() => setSubTab('teachers')}>Teachers List & Credentials ({db.teachers.length})</button>
      </div>

      {subTab === 'admission' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveAdmission}>
            <div className="card-title">{editUsn ? `Edit Student Admission (${editUsn})` : 'New Complete Student Admission Form'}</div>
            <div className="grid-3">
              <div className="field"><label>USN / Admission No *</label><input className="input" value={adm.usn} onChange={(e) => setAdm({ ...adm, usn: e.target.value })} disabled={Boolean(editUsn)} required /></div>
              <div className="field"><label>Student Full Name *</label><input className="input" value={adm.name} onChange={(e) => setAdm({ ...adm, name: e.target.value })} required /></div>
              <div className="field"><label>Department *</label><input className="input" placeholder="e.g. CSE" value={adm.dept} onChange={(e) => setAdm({ ...adm, dept: e.target.value })} required /></div>
              <div className="field">
                <label>Admitted Semester *</label>
                <select className="select" value={adm.semester} onChange={(e) => setAdm({ ...adm, semester: e.target.value })}>
                  {db.masterSettings.semesters.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field"><label>Date of Birth</label><input type="date" className="input" value={adm.dob} onChange={(e) => setAdm({ ...adm, dob: e.target.value })} /></div>
              <div className="field">
                <label>Gender</label>
                <select className="select" value={adm.gender} onChange={(e) => setAdm({ ...adm, gender: e.target.value })}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="field"><label>Student Phone</label><input className="input" value={adm.phone} onChange={(e) => setAdm({ ...adm, phone: e.target.value })} /></div>
              <div className="field"><label>Parent / Guardian Name</label><input className="input" value={adm.parentName} onChange={(e) => setAdm({ ...adm, parentName: e.target.value })} /></div>
              <div className="field"><label>Parent Phone</label><input className="input" value={adm.parentPhone} onChange={(e) => setAdm({ ...adm, parentPhone: e.target.value })} /></div>
              <div className="field"><label>Previous Qualification & %</label><input className="input" placeholder="e.g. 12th Science - 88%" value={adm.prevQualification} onChange={(e) => setAdm({ ...adm, prevQualification: e.target.value })} /></div>
              <div className="field">
                <label>Admission Quota</label>
                <select className="select" value={adm.admissionQuota} onChange={(e) => setAdm({ ...adm, admissionQuota: e.target.value })}>
                  <option>Govt</option><option>Management</option><option>NRI</option>
                </select>
              </div>
              <div className="field"><label>Total Annual Fee (₹)</label><input type="number" className="input" value={adm.feeTotal} onChange={(e) => setAdm({ ...adm, feeTotal: e.target.value })} /></div>
              <div className="field" style={{ gridColumn: 'span 3' }}><label>Residential Address</label><input className="input" value={adm.address} onChange={(e) => setAdm({ ...adm, address: e.target.value })} /></div>
              <div className="field"><label>Assign Student Portal Email *</label><input type="email" className="input" placeholder="student@college.edu" value={adm.email} onChange={(e) => setAdm({ ...adm, email: e.target.value })} required /></div>
              <div className="field"><label>Assign Student Portal Password *</label><input className="input" placeholder="Create password" value={adm.password} onChange={(e) => setAdm({ ...adm, password: e.target.value })} required /></div>
              <div className="field">
                <label>Upload Admission Documents (Marks Card, ID, TC)</label>
                <FileUploadButton label="Attach Document (PDF/Img)" onUploaded={addAdmissionDoc} onError={(m) => showToast(m, 'error')} />
              </div>
            </div>

            {adm.admissionDocs.length > 0 && (
              <div className="row">
                {adm.admissionDocs.map((d) => (
                  <span key={d.id} className="badge badge-info">
                    {d.name}
                    <button type="button" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 4 }} onClick={() => setAdm((p) => ({ ...p, admissionDocs: p.admissionDocs.filter((x) => x.id !== d.id) }))}>×</button>
                  </span>
                ))}
              </div>
            )}

            <div className="row">
              <button className="btn btn-primary" type="submit"><UserPlus size={15} /> {editUsn ? 'Update Student' : 'Complete Admission & Issue Login'}</button>
              {editUsn && <button type="button" className="btn" onClick={() => { setEditUsn(null); setAdm(emptyAdm); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Admitted Students Directory</div>
            {db.students.length === 0 ? (
              <EmptyState title="No Students Admitted Yet" message="Complete the admission form above to register a student with documents and login credentials." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>USN</th><th>Student</th><th>Dept / Sem</th><th>Quota & Docs</th><th>Portal Login</th><th>Actions</th></tr></thead>
                  <tbody>
                    {db.students.map((s) => (
                      <tr key={s.usn}>
                        <td><code>{s.usn}</code></td>
                        <td><strong>{s.name}</strong><div className="card-sub">Parent: {s.parentName || '—'} ({s.parentPhone || '—'})</div></td>
                        <td>{s.dept} • {s.semester}</td>
                        <td>
                          <span className="badge">{s.admissionQuota || 'Govt'}</span>
                          <div className="row" style={{ marginTop: 4 }}>
                            {(s.admissionDocs || []).map((doc) => <DownloadFileButton key={doc.id} fileName={doc.name} dataUrl={doc.dataUrl} label={doc.name.slice(0, 14)} />)}
                          </div>
                        </td>
                        <td>{s.email}<div className="card-sub">Pass: <code>{s.password}</code></div></td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditUsn(s.usn); setAdm({ ...emptyAdm, ...s }); }}><Edit3 size={13} /></button>
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

      {subTab === 'teachers' && (
        <div className="stack">
          <form className="card stack" onSubmit={saveTeacher}>
            <div className="card-title">{editTid ? 'Edit Teacher / HOD' : 'Add Teacher / HOD & Assign Portal Login'}</div>
            <div className="grid-3">
              <div className="field"><label>Full Name *</label><input className="input" value={tForm.name} onChange={(e) => setTForm({ ...tForm, name: e.target.value })} required /></div>
              <div className="field">
                <label>Role *</label>
                <select className="select" value={tForm.designation} onChange={(e) => setTForm({ ...tForm, designation: e.target.value })}>
                  <option value="HOD">HOD</option><option value="Faculty">Faculty</option>
                </select>
              </div>
              <div className="field"><label>Department *</label><input className="input" placeholder="e.g. CSE" value={tForm.dept} onChange={(e) => setTForm({ ...tForm, dept: e.target.value })} required /></div>
              <div className="field"><label>Qualification</label><input className="input" placeholder="M.Tech / Ph.D" value={tForm.qualification} onChange={(e) => setTForm({ ...tForm, qualification: e.target.value })} /></div>
              <div className="field"><label>Phone</label><input className="input" value={tForm.phone} onChange={(e) => setTForm({ ...tForm, phone: e.target.value })} /></div>
              <div className="field"><label>Assign Login Email *</label><input type="email" className="input" value={tForm.email} onChange={(e) => setTForm({ ...tForm, email: e.target.value })} required /></div>
              <div className="field"><label>Assign Login Password *</label><input className="input" value={tForm.password} onChange={(e) => setTForm({ ...tForm, password: e.target.value })} required /></div>
            </div>
            <div className="row">
              <button className="btn btn-primary" type="submit"><UserPlus size={15} /> {editTid ? 'Save Changes' : 'Register Teacher'}</button>
              {editTid && <button type="button" className="btn" onClick={() => { setEditTid(null); setTForm(emptyTeacher); }}>Cancel</button>}
            </div>
          </form>

          <div className="card">
            {db.teachers.length === 0 ? (
              <EmptyState title="No Teachers Registered" message="Add HODs and Faculty above." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Dept</th><th>Credentials</th><th>Actions</th></tr></thead>
                  <tbody>
                    {db.teachers.map((t) => (
                      <tr key={t.id}>
                        <td><code>{t.id}</code></td>
                        <td><strong>{t.name}</strong><div className="card-sub">{t.qualification} • {t.phone}</div></td>
                        <td><span className={`badge ${t.designation === 'HOD' ? 'badge-warning' : 'badge-info'}`}>{t.designation}</span></td>
                        <td>{t.dept}</td>
                        <td>{t.email}<div className="card-sub">Pass: <code>{t.password}</code></div></td>
                        <td className="row">
                          <button className="btn btn-sm" onClick={() => { setEditTid(t.id); setTForm(t); }}><Edit3 size={13} /></button>
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
    </div>
  );
}
