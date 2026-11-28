import React, { useState, useEffect } from 'react';
import { Cloud, UploadCloud, DownloadCloud, CheckCircle2, PlusCircle, Eye, EyeOff, Copy, ClipboardPaste } from 'lucide-react';
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
    showToast,
  } = useCampusStore();

  const [token, setToken] = useState(ghConfig.token || '');
  const [gistId, setGistId] = useState(ghConfig.gistId || '');
  const [autoSync, setAutoSync] = useState(ghConfig.autoSync !== false);
  const [showToken, setShowToken] = useState(false);
  const [bundleInput, setBundleInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (open) {
      setToken(ghConfig.token || '');
      setGistId(ghConfig.gistId || '');
      setAutoSync(ghConfig.autoSync !== false);
    }
  }, [open, ghConfig]);

  const handleSave = async () => {
    setBusy(true);
    setMsg('');
    try {
      await configureGitHubSync({ token: token.trim(), gistId: gistId.trim(), autoSync });
      setMsg('Connected & synced with GitHub Gist Cloud!');
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    const clean = token.trim();
    if (!clean || (!clean.startsWith('ghp_') && !clean.startsWith('github_pat_'))) {
      setMsg('Paste a valid GitHub Personal Access Token (classic starting with ghp_) with "gist" permission first.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const created = await createCloudGist(clean);
      setGistId(created.gistId);
      setMsg(`Created Gist ID: ${created.gistId}. Use "Copy 1-Click Sync Code" below to connect your iPhone or other devices!`);
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const copySyncCode = async () => {
    if (!token.trim() || !gistId.trim()) {
      setMsg('Connect or create a Sync Gist first before copying the Sync Code.');
      return;
    }
    const code = btoa(JSON.stringify({ token: token.trim(), gistId: gistId.trim() }));
    await navigator.clipboard.writeText(code);
    showToast('1-Click Sync Code copied! Paste it on another device to link instantly.');
  };

  const applySyncCode = async () => {
    try {
      const parsed = JSON.parse(atob(bundleInput.trim()));
      if (!parsed.token || !parsed.gistId) throw new Error('Invalid code');
      setToken(parsed.token);
      setGistId(parsed.gistId);
      await configureGitHubSync({ token: parsed.token, gistId: parsed.gistId, autoSync: true });
      setBundleInput('');
      setMsg('Linked instantly via Sync Code and pulled latest data!');
    } catch {
      setMsg('Invalid Sync Code. Copy the code from your already-connected portal.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cross-App & GitHub Online Sync (Autofill-Proof)">
      <div className="stack" style={{ gap: 14 }}>
        <div className="card" style={{ padding: 14, background: 'var(--surface-elevated)' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="row"><Cloud size={18} color="var(--accent)" /><strong>Active Sync Layer:</strong></div>
            <span className="badge badge-success">{syncMeta.source}</span>
          </div>
          <div className="card-sub" style={{ marginTop: 6 }}>
            • <strong>Same-Origin Bus:</strong> Automatic across tabs on GitHub Pages.<br />
            • <strong>MacBook Multi-Port Relay:</strong> {relayConnected ? 'Connected (port 5199)' : 'Standby (active during npm run dev)'}.<br />
            • <strong>GitHub Gist Cloud:</strong> {ghConfig.gistId ? `Linked (${ghConfig.gistId.slice(0, 10)}...)` : 'Not linked yet'}.
          </div>
        </div>

        <div className="field">
          <label>GitHub Classic Token (<code>ghp_...</code> with <code>gist</code> scope — autofill disabled)</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input
              type={showToken ? 'text' : 'password'}
              name="campus_gh_sync_token_no_autofill"
              autoComplete="new-password"
              data-lpignore="true"
              className="input"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button type="button" className="btn btn-sm" onClick={() => setShowToken((v) => !v)} title="Show/Hide Token">
              {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="field">
          <label>Shared GitHub Gist ID (leave blank & click Create New Sync Gist once)</label>
          <input
            type="text"
            name="campus_gh_gist_id"
            autoComplete="off"
            className="input"
            placeholder="Paste existing Gist ID or create a new one"
            value={gistId}
            onChange={(e) => setGistId(e.target.value)}
          />
        </div>

        <label className="row" style={{ fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={autoSync} onChange={(e) => setAutoSync(e.target.checked)} />
          Auto-sync across MacBook, iPhone & teammates every 8 seconds
        </label>

        {msg && <div className="badge badge-info" style={{ borderRadius: 5, padding: '8px 12px', display: 'block' }}>{msg}</div>}

        <div className="row">
          <button className="btn btn-primary" disabled={busy} onClick={handleSave}><CheckCircle2 size={15} /> Connect & Save</button>
          <button className="btn" disabled={busy} onClick={handleCreate}><PlusCircle size={15} /> Create New Sync Gist</button>
          <button className="btn" disabled={busy} onClick={() => pushGitHubNow()}><UploadCloud size={15} /> Push</button>
          <button className="btn" disabled={busy} onClick={() => pullGitHubNow(false)}><DownloadCloud size={15} /> Pull</button>
        </div>

        <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }} className="stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 13 }}>1-Click Device Linking (MacBook &harr; iPhone)</strong>
            <button className="btn btn-sm" onClick={copySyncCode}><Copy size={13} /> Copy Sync Code</button>
          </div>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input className="input" placeholder="Paste Sync Code from another device..." value={bundleInput} onChange={(e) => setBundleInput(e.target.value)} />
            <button className="btn btn-sm btn-primary" onClick={applySyncCode}><ClipboardPaste size={13} /> Link</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
