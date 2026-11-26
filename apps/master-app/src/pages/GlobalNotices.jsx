import React, { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useCampusStore, PageHeader } from '@campus/shared-core';

export default function GlobalNotices() {
  const { db, updateDb } = useCampusStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('All Portals');
  const [priority, setPriority] = useState('High');

  const publish = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const item = {
      id: `N-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      body: body.trim(),
      audience,
      priority,
      postedBy: 'Master Control',
      date: new Date().toISOString().slice(0, 10),
    };
    updateDb((prev) => ({ ...prev, globalNotices: [item, ...prev.globalNotices] }), 'Global circular pushed to all apps!');
    setTitle('');
    setBody('');
  };

  const remove = (id) => {
    updateDb((prev) => ({ ...prev, globalNotices: prev.globalNotices.filter((n) => n.id !== id) }), 'Circular removed');
  };

  return (
    <div className="stack">
      <PageHeader title="Global Notifications & Circulars" subtitle="Broadcast official campus notices instantaneously to College, Teacher, and Student notification trays." />

      <form className="card stack" onSubmit={publish}>
        <div className="card-title">Broadcast New Circular</div>
        <div className="grid-3">
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label>Circular Title</label>
            <input className="input" placeholder="e.g. Exam Hall Tickets Live for 5th Semester" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label>Target Audience</label>
            <select className="select" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option>All Portals</option>
              <option>College Only</option>
              <option>Teacher Only</option>
              <option>Student Only</option>
              <option>Student & Teacher</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Message Body</label>
          <textarea className="textarea" placeholder="Enter circular details..." value={body} onChange={(e) => setBody(e.target.value)} required />
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <select className="select" style={{ width: 180 }} value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Normal</option>
          </select>
          <button type="submit" className="btn btn-primary"><Send size={15} /> Publish Circular</button>
        </div>
      </form>

      <div className="card stack" style={{ gap: 12 }}>
        <div className="card-title">Published Circulars ({db.globalNotices.length})</div>
        {db.globalNotices.map((n) => (
          <div key={n.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <strong>{n.title}</strong>
                <div className="card-sub">{n.audience} • {n.date} • By {n.postedBy}</div>
              </div>
              <div className="row">
                <span className={`badge ${n.priority === 'High' ? 'badge-danger' : 'badge-info'}`}>{n.priority}</span>
                <button className="btn btn-sm btn-danger" onClick={() => remove(n.id)}><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="card-sub" style={{ marginTop: 8 }}>{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
