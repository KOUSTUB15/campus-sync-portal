import React, { useState } from 'react';
import { Award, ShieldCheck, Save, Plus } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function ProfileResearch() {
  const { db, updateDb, currentUser } = useCampusStore();
  const me = db.teachers.find((t) => t.email === currentUser?.email) || db.teachers[0];

  const [profile, setProfile] = useState(me);
  const [pubForm, setPubForm] = useState({ type: 'Journal', title: '', venue: '', year: '2026', doiOrPatentNo: '', grantAmount: '' });

  const saveProfile = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === me.id ? { ...t, ...profile } : t)),
    }), 'Faculty profile, Scopus/ORCID & UPI updated!');
  };

  const addResearch = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      researchPapers: [{ id: `RES-${Date.now().toString().slice(-4)}`, teacherId: me.id, ...pubForm }, ...prev.researchPapers],
    }), 'Publication / Patent added to Faculty Portfolio!');
    setPubForm({ type: 'Journal', title: '', venue: '', year: '2026', doiOrPatentNo: '', grantAmount: '' });
  };

  const toggleRole = (role) => {
    const has = profile.roles.includes(role);
    const nextRoles = has ? profile.roles.filter((r) => r !== role) : [...profile.roles, role];
    setProfile({ ...profile, roles: nextRoles });
    updateDb((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === me.id ? { ...t, roles: nextRoles } : t)),
    }), `Updated faculty role: ${role}`);
  };

  return (
    <div className="stack">
      <PageHeader title="Faculty Profile, Role Management & Research" subtitle="Manage Journals, Conferences, Patents, Grants, Scopus/ORCID IDs, HOD/Coordinator/Proctor roles, and personal details." />

      <div className="grid-2">
        <form className="card stack" onSubmit={saveProfile}>
          <div className="card-title">Personal Profile, UPI & Research Identifiers</div>
          <div className="grid-2">
            <div className="field"><label>Name</label><input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
            <div className="field"><label>Teacher ID</label><input className="input" value={profile.id} disabled /></div>
            <div className="field"><label>Email</label><input className="input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
            <div className="field"><label>Phone No.</label><input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
            <div className="field"><label>UPI ID (Exam Remuneration)</label><input className="input" value={profile.upi} onChange={(e) => setProfile({ ...profile, upi: e.target.value })} /></div>
            <div className="field"><label>Scopus Author ID</label><input className="input" value={profile.scopusId} onChange={(e) => setProfile({ ...profile, scopusId: e.target.value })} /></div>
            <div className="field" style={{ gridColumn: 'span 2' }}><label>ORCID ID</label><input className="input" value={profile.orcidId} onChange={(e) => setProfile({ ...profile, orcidId: e.target.value })} /></div>
          </div>
          <div><button className="btn btn-primary" type="submit"><Save size={15} /> Save Profile</button></div>
        </form>

        <div className="card stack">
          <div className="row"><ShieldCheck size={18} color="var(--accent)" /><span className="card-title">Role Management (HOD / Coordinator / Proctor)</span></div>
          <p className="card-sub">Assigned departmental roles determine available oversight permissions across College and Teacher workflows.</p>
          <div className="row">
            {['HOD', 'Coordinator', 'Proctor', 'Exam Squad', 'NBA/AICTE Lead'].map((role) => (
              <button key={role} className={`btn ${profile.roles.includes(role) ? 'btn-primary' : ''}`} onClick={() => toggleRole(role)}>
                {profile.roles.includes(role) ? '✓ ' : '+ '}{role}
              </button>
            ))}
          </div>
          <div className="card" style={{ background: 'var(--surface-elevated)', marginTop: 8 }}>
            <strong>Assigned Teaching Subjects</strong>
            <div className="card-sub" style={{ marginTop: 6 }}>{profile.subjects.join(' • ')}</div>
          </div>
        </div>
      </div>

      <div className="card stack">
        <div className="row"><Award size={18} color="var(--accent)" /><span className="card-title">Research & Publications (Journals, Conferences, Patents & Grants)</span></div>
        <form className="grid-3" onSubmit={addResearch}>
          <select className="select" value={pubForm.type} onChange={(e) => setPubForm({ ...pubForm, type: e.target.value })}>
            <option>Journal</option><option>Conference</option><option>Patent</option><option>Funded Grant</option>
          </select>
          <input className="input" placeholder="Paper / Patent Title" value={pubForm.title} onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })} required />
          <input className="input" placeholder="Venue / Indexing (IEEE, Scopus)" value={pubForm.venue} onChange={(e) => setPubForm({ ...pubForm, venue: e.target.value })} required />
          <input className="input" placeholder="DOI / Patent Number" value={pubForm.doiOrPatentNo} onChange={(e) => setPubForm({ ...pubForm, doiOrPatentNo: e.target.value })} />
          <input className="input" placeholder="Grant Amount (Optional)" value={pubForm.grantAmount} onChange={(e) => setPubForm({ ...pubForm, grantAmount: e.target.value })} />
          <button className="btn btn-primary" type="submit"><Plus size={15} /> Add Entry</button>
        </form>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Title</th><th>Venue / Indexing</th><th>DOI / Patent No.</th><th>Grant</th></tr></thead>
            <tbody>
              {db.researchPapers.map((r) => (
                <tr key={r.id}>
                  <td><span className="badge">{r.type}</span></td>
                  <td><strong>{r.title}</strong></td>
                  <td>{r.venue} ({r.year})</td>
                  <td><code>{r.doiOrPatentNo}</code></td>
                  <td>{r.grantAmount || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
