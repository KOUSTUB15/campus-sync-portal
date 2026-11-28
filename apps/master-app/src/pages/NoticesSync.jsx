import React, { useState } from 'react';
import { Send, Trash2, Cloud, Download, Upload, RotateCcw } from 'lucide-react';
import { useCampusStore, PageHeader, EmptyState, GitHubSyncModal, DoubleConfirmResetModal } from '@campus/shared-core';

export default function NoticesSync() {
  const { db, updateDb, wipeAllData, syncMeta, ghConfig } = useCampusStore();
  const [notice, setNotice] = useState({ title: '', body: '', audience: 'All Portals', priority: 'High' });
  const [syncOpen, setSyncOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const postNotice = (e) => {
    e.preventDefault();
    updateDb((prev) => ({
      ...prev,
      globalNotices: [{
        id: `N-${Date.now().toString().slice(-4)}`,
        ...notice,
        postedBy: 'Master Control',
        date: new Date().toISOString().slice(0, 10),
      }, ...prev.globalNotices],
    }), 'Global notice published to all 4 portals!');
    setNotice({ title: '', body: '', audience: 'All Portals', priority: 'High' });
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-portal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.masterSettings) updateDb(() => parsed, 'Backup restored across all 4 apps!');
      } catch {
        alert('Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="stack">
      <PageHeader
        title="Global Circulars & GitHub Cloud Sync"
        subtitle="Publish campus-wide announcements and manage live GitHub Gist synchronization & JSON backups."
        actions={<button className="btn btn-primary" onClick={() => setSyncOpen(true)}><Cloud size={15} /> Open GitHub Sync Modal</button>}
      />

      <div className="grid-2">
        <form className="card stack" onSubmit={postNotice}>
          <div className="card-title">Publish Global Circular</div>
          <input className="input" placeholder="Circular Title" value={notice.title} onChange={(e) => setNotice({ ...notice, title: e.target.value })} required />
          <textarea className="textarea" placeholder="Circular details..." value={notice.body} onChange={(e) => setNotice({ ...notice, body: e.target.value })} required />
          <div className="grid-2">
            <select className="select" value={notice.audience} onChange={(e) => setNotice({ ...notice, audience: e.target.value })}>
              <option>All Portals</option><option>College Only</option><option>Teachers Only</option><option>Students Only</option>
            </select>
            <select className="select" value={notice.priority} onChange={(e) => setNotice({ ...notice, priority: e.target.value })}>
              <option>High</option><option>Medium</option><option>Normal</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit"><Send size={15} /> Publish Circular</button>
        </form>

        <div className="card stack">
          <div className="card-title">Cloud Sync &amp; Data Backup</div>
          <div className="card-sub">
            Active Sync: <strong>{syncMeta.source}</strong> &middot; Last Sync: {syncMeta.lastSyncTime}<br />
            GitHub Gist: <strong>{ghConfig.gistId ? `Connected (${ghConfig.gistId.slice(0, 10)}...)` : 'Not Linked'}</strong>
          </div>
          <div className="row">
            <button className="btn" onClick={exportBackup}><Download size={15} /> Export JSON Backup</button>
            <label className="btn" style={{ cursor: 'pointer' }}>
              <Upload size={15} /> Import JSON
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={importBackup} />
            </label>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-danger" onClick={() => setResetOpen(true)}>
              <RotateCcw size={15} /> Reset All 4 Portals (Clear All Data)
            </button>
          </div>
        </div>
      </div>

      <div className="card stack">
        <div className="card-title">Published Global Notices ({db.globalNotices.length})</div>
        {db.globalNotices.length === 0 ? (
          <EmptyState title="No Global Notices" message="Publish your first official circular above." />
        ) : (
          db.globalNotices.map((n) => (
            <div key={n.id} className="row" style={{ justifyContent: 'space-between', padding: 12, borderRadius: 8, background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
              <div><strong>{n.title}</strong><div className="card-sub">{n.body} ({n.audience} &middot; {n.date})</div></div>
              <button className="btn btn-sm btn-danger" onClick={() => updateDb((prev) => ({ ...prev, globalNotices: prev.globalNotices.filter((x) => x.id !== n.id) }), 'Notice deleted')}><Trash2 size={14} /></button>
            </div>
          ))
        )}
      </div>

      <GitHubSyncModal open={syncOpen} onClose={() => setSyncOpen(false)} />
      <DoubleConfirmResetModal open={resetOpen} onClose={() => setResetOpen(false)} onConfirmReset={wipeAllData} />
    </div>
  );
}
