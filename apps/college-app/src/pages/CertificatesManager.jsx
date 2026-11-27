import React, { useState } from 'react';
import { Upload, Edit3, Trash2 } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState, FileUploadButton, DownloadFileButton } from '@campus/shared-core';

export default function CertificatesManager() {
  const { db, updateDb, currentUser, showToast } = useCampusStore();
  const emptyCert = { usn: '', type: 'Bonafide Certificate', remarks: '', fileName: '', fileDataUrl: '' };
  const [form, setForm] = useState(emptyCert);
  const [editId, setEditId] = useState(null);

  const saveCert = (e) => {
    e.preventDefault();
    const st = db.students.find((s) => s.usn === form.usn);
    if (!st) { showToast('Select a student first', 'error'); return; }
    const record = {
      id: editId || `CERT-${Date.now().toString().slice(-4)}`,
      usn: st.usn,
      studentName: st.name,
      type: form.type,
      remarks: form.remarks,
      fileName: form.fileName,
      fileDataUrl: form.fileDataUrl,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    updateDb((prev) => ({
      ...prev,
      certificates: editId ? prev.certificates.map((c) => (c.id === editId ? record : c)) : [record, ...prev.certificates],
    }), editId ? 'Certificate updated!' : 'Certificate uploaded & available in Student Portal!');
    setForm(emptyCert);
    setEditId(null);
  };

  return (
    <div className="stack">
      <PageHeader title="Student Certificates (Upload, Edit & Delete)" subtitle="Upload signed certificates (PDF/Image) for students. Students can immediately download them in Student Portal." />

      <form className="card stack" onSubmit={saveCert}>
        <div className="card-title">{editId ? 'Edit Uploaded Certificate' : 'Upload New Certificate'}</div>
        <div className="grid-3">
          <div className="field">
            <label>Select Student *</label>
            <select className="select" value={form.usn} onChange={(e) => setForm({ ...form, usn: e.target.value })} required>
              <option value="">Choose student...</option>
              {db.students.map((s) => <option key={s.usn} value={s.usn}>{s.name} ({s.usn})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Certificate Type *</label>
            <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Bonafide Certificate</option><option>Study Certificate</option><option>Transfer Certificate (TC)</option><option>Conduct Certificate</option><option>NOC</option><option>Provisional Degree</option>
            </select>
          </div>
          <div className="field"><label>Remarks</label><input className="input" placeholder="e.g. Official Signed Copy" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
        </div>
        <div className="row">
          <FileUploadButton
            label={form.fileName ? `Replace File (${form.fileName})` : 'Upload Certificate PDF / Image'}
            onUploaded={(f) => setForm((p) => ({ ...p, fileName: f.name, fileDataUrl: f.dataUrl }))}
            onError={(m) => showToast(m, 'error')}
          />
          <button className="btn btn-primary" type="submit"><Upload size={15} /> {editId ? 'Update Certificate' : 'Upload & Publish'}</button>
          {editId && <button type="button" className="btn" onClick={() => { setEditId(null); setForm(emptyCert); }}>Cancel</button>}
        </div>
      </form>

      <div className="card">
        {db.certificates.length === 0 ? (
          <EmptyState title="No Certificates Uploaded" message="Upload a student's certificate above." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Certificate Type</th><th>Remarks</th><th>File</th><th>Actions</th></tr></thead>
              <tbody>
                {db.certificates.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.studentName}</strong><div className="card-sub">{c.usn} • {c.uploadedAt}</div></td>
                    <td><span className="badge badge-success">{c.type}</span></td>
                    <td>{c.remarks || '—'}</td>
                    <td><DownloadFileButton fileName={c.fileName} dataUrl={c.fileDataUrl} label={c.fileName || 'Download'} /></td>
                    <td className="row">
                      <button className="btn btn-sm" onClick={() => { setEditId(c.id); setForm({ usn: c.usn, type: c.type, remarks: c.remarks, fileName: c.fileName, fileDataUrl: c.fileDataUrl }); }}><Edit3 size={13} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, certificates: prev.certificates.filter((x) => x.id !== c.id) }), 'Certificate deleted')}><Trash2 size={13} /></button>
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
