import React, { useState } from 'react';
import { UserPlus, KeyRound } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function SecurityAuth() {
  const { db, updateDb } = useCampusStore();
  const [form, setForm] = useState({ name: '', email: '', role: 'student', dept: 'CSE', code: '', phone: '' });

  const addAccount = (e) => {
    e.preventDefault();
    const newUser = {
      id: `U-${Date.now().toString().slice(-4)}`,
      ...form,
      password: 'password123',
    };
    updateDb((prev) => ({ ...prev, users: [...prev.users, newUser] }), `Account created for ${form.name} (default pass: password123)`);
    setForm({ name: '', email: '', role: 'student', dept: 'CSE', code: '', phone: '' });
  };

  return (
    <div className="stack">
      <PageHeader title="Login Accounts & OTP Password Reset Audit" subtitle="Manage portal credentials and inspect OTP password reset requests across all 4 apps." />

      <form className="card stack" onSubmit={addAccount}>
        <div className="card-title">Provision New Portal Account</div>
        <div className="grid-3">
          <div className="field"><label>Full Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="field"><label>Campus Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="field">
            <label>Portal Role</label>
            <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="college">College Admin</option>
              <option value="master">Master Admin</option>
            </select>
          </div>
          <div className="field"><label>USN / Staff Code</label><input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="2MM23CS010" required /></div>
          <div className="field"><label>Department</label><input className="input" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} /></div>
          <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div><button className="btn btn-primary" type="submit"><UserPlus size={15} /> Create Account</button></div>
      </form>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Active Portal Accounts ({db.users.length})</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>ID</th></tr></thead>
              <tbody>
                {db.users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td><span className="badge">{u.role.toUpperCase()}</span></td>
                    <td>{u.email}</td>
                    <td>{u.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}><KeyRound size={17} color="var(--accent)" /><span className="card-title">OTP Password Reset Audit Log</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Email</th><th>OTP</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {db.otpLogs.map((l) => (
                  <tr key={l.id}>
                    <td>{l.email}</td>
                    <td><code>{l.otp}</code></td>
                    <td><span className="badge badge-success">{l.status}</span></td>
                    <td>{l.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
