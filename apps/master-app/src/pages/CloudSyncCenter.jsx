import React, { useState } from 'react';
import { Cloud, Download, Upload, RotateCcw } from 'lucide-react';
import { useCampusStore, PageHeader, GitHubSyncModal } from '@campus/shared-core';

export default function CloudSyncCenter() {
  const { db, updateDb, resetDb, syncMeta, relayConnected, ghConfig } = useCampusStore();
  const [modalOpen, setModalOpen] = useState(false);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-portal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.masterSettings && parsed.students) {
          updateDb(() => parsed, 'Imported campus database & synced across all 4 apps!');
        }
      } catch {
        alert('Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="stack">
      <PageHeader
        title="Online GitHub Cloud Sync & Data Hub"
        subtitle="Inspect how Master, College, Teacher, and Student apps stay synchronized locally on MacBook and online via GitHub."
        actions={<button className="btn btn-primary" onClick={() => setModalOpen(true)}><Cloud size={15} /> Configure GitHub Gist Sync</button>}
      />

      <div className="grid-3">
        <div className="card">
          <div className="card-title">1. Same-Origin Live Bus</div>
          <p className="card-sub" style={{ marginTop: 8 }}>
            When hosted on <strong>GitHub Pages</strong> or run via <code>npm run serve:all</code>, all 4 apps share the exact same domain. Updates broadcast instantaneously via <code>BroadcastChannel</code> + <code>localStorage</code>.
          </p>
          <div style={{ marginTop: 12 }}><span className="badge badge-success">Always Active</span></div>
        </div>

        <div className="card">
          <div className="card-title">2. MacBook Local Multi-Port Relay</div>
          <p className="card-sub" style={{ marginTop: 8 }}>
            When running <code>npm run dev</code> on ports 5170–5173, the included Node relay (<code>localhost:5199</code>) bridges live Server-Sent Events across all 4 dev servers.
          </p>
          <div style={{ marginTop: 12 }}>
            <span className={`badge ${relayConnected ? 'badge-success' : 'badge-warning'}`}>
              {relayConnected ? 'Relay Connected (5199)' : 'Standby (Run npm run dev)'}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">3. GitHub Gist Cloud Sync (Cross-Device)</div>
          <p className="card-sub" style={{ marginTop: 8 }}>
            Connect a private GitHub Gist to synchronize changes online between your MacBook, iPhone, and teammates using pure GitHub REST APIs.
          </p>
          <div style={{ marginTop: 12 }}>
            <span className={`badge ${ghConfig.gistId ? 'badge-success' : 'badge-info'}`}>
              {ghConfig.gistId ? `Gist Linked: ${ghConfig.gistId.slice(0, 10)}...` : 'Click Configure Above'}
            </span>
          </div>
        </div>
      </div>

      <div className="card stack">
        <div className="card-title">Database Portability & Demo Reset</div>
        <div className="card-sub">Last Sync Source: <strong>{syncMeta.source}</strong> at {syncMeta.lastSyncTime}</div>
        <div className="row">
          <button className="btn" onClick={exportJson}><Download size={15} /> Export Unified DB (.json)</button>
          <label className="btn" style={{ cursor: 'pointer' }}>
            <Upload size={15} /> Import Backup (.json)
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={importJson} />
          </label>
          <button className="btn btn-danger" onClick={resetDb}><RotateCcw size={15} /> Reset Demo Data</button>
        </div>
      </div>

      <GitHubSyncModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
