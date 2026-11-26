import React, { useState } from 'react';
import { Cloud, RefreshCw, UploadCloud, DownloadCloud, CheckCircle2, PlusCircle } from 'lucide-react';
import { useCampusStore } from '../StoreContext.jsx';
import { Modal } from './UI.jsx';

export function GitHubSyncModal({ open, onClose }) {
  const {
    ghConfig,
    configureGitHubSync,
    createCloudGist,
    pushGitHubNow,
    pullGitHubNow,
    syncMeta,
    relayConnected,
  } = useCampusStore();

  const [token, setToken] = useState(ghConfig.token || '');
  const [gistId, setGistId] = useState(ghConfig.gistId || '');
  const [autoSync, setAutoSync] = useState(ghConfig.autoSync !== false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setBusy(true);
    setMsg('');
    try {
      await configureGitHubSync({ token: token.trim(), gistId: gistId.trim(), autoSync });
      setMsg('Saved & connected to GitHub Gist Cloud Sync!');
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!token.trim()) {
      setMsg('Enter a GitHub Personal Access Token (with "gist" scope) first.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const created = await createCloudGist(token);
      setGistId(created.gistId);
      setMsg(`Created Gist ID: ${created.gistId} — Share this Gist ID across all 4 apps!`);
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cross-App & GitHub Online Sync">
      <div className="stack" style={{ gap: 14 }}>
        <div className="card" style={{ padding: 14, background: 'var(--surface-elevated)' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="row">
              <Cloud size={18} color="var(--accent)" />
              <strong>Active Sync Layer:</strong>
            </div>
            <span className="badge badge-success">{syncMeta.source}</span>
          </div>
          <div className="card-sub" style={{ marginTop: 6 }}>
            • <strong>Same-Origin Bus:</strong> Automatic on GitHub Pages & unified server.<br />
            • <strong>Local Mac Multi-Port Relay:</strong> {relayConnected ? 'Connected (port 5199)' : 'Offline (run npm run dev)'}.<br />
            • <strong>GitHub Gist Cloud:</strong> {ghConfig.gistId ? `Connected (${ghConfig.gistId.slice(0, 10)}...)` : 'Not configured yet'}.
          </div>
        </div>

        <div className="field">
          <label>GitHub Personal Access Token (classic token with <code>gist</code> scope)</label>
          <input
            type="password"
            className="input"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Shared GitHub Gist ID (leave blank & click Create New Gist once)</label>
          <input
            className="input"
            placeholder="e.g. a1b2c3d4e5f67890..."
            value={gistId}
            onChange={(e) => setGistId(e.target.value)}
          />
        </div>

        <label className="row" style={{ fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={autoSync} onChange={(e) => setAutoSync(e.target.checked)} />
          Enable automatic cloud sync every 8 seconds across all devices
        </label>

        {msg && (
          <div className="badge badge-info" style={{ borderRadius: 10, padding: '8px 12px', display: 'block' }}>
            {msg}
          </div>
        )}

        <div className="row">
          <button className="btn btn-primary" disabled={busy} onClick={handleSave}>
            <CheckCircle2 size={15} /> Connect & Save
          </button>
          <button className="btn" disabled={busy} onClick={handleCreate}>
            <PlusCircle size={15} /> Create New Sync Gist
          </button>
          <button className="btn" disabled={busy} onClick={() => pushGitHubNow()}>
            <UploadCloud size={15} /> Push
          </button>
          <button className="btn" disabled={busy} onClick={() => pullGitHubNow(false)}>
            <DownloadCloud size={15} /> Pull
          </button>
        </div>

        <div className="card-sub">
          Last Sync: {syncMeta.lastSyncTime} {syncMeta.error ? `• Error: ${syncMeta.error}` : ''}
        </div>
      </div>
    </Modal>
  );
}
