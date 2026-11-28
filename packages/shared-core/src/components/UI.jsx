import React, { useState, useEffect } from 'react';
import { X, Upload, Download, AlertTriangle, RotateCcw } from 'lucide-react';

export function StatCard({ label, value, hint, icon: Icon, tone }) {
  const toneColors = { success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)' };
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={tone ? { color: toneColors[tone] } : undefined}>{value}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
      {Icon && (
        <div className="stat-icon" style={tone ? { color: toneColors[tone] } : undefined}>
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="card-header" style={{ marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="card-sub" style={{ marginTop: 2 }}>{subtitle}</div>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="empty-box">
      <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: 4 }}>{title}</strong>
      <span>{message}</span>
    </div>
  );
}

export function BarChart({ items }) {
  if (!items || items.length === 0) {
    return <EmptyState title="No Analytics Data Yet" message="Add records to visualize live charts here." />;
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="stack" style={{ gap: 10 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
            <strong>{item.label}</strong>
            <span>{item.display ?? item.value}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.round((item.value / max) * 100)}%`, background: item.color || undefined }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="card-header" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">{title}</div>
          <button className="btn btn-sm" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Reusable 2-Step Confirmation Dialog (Asks Twice before resetting all 4 portals)
export function DoubleConfirmResetModal({ open, onClose, onConfirmReset }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const handleFinalConfirm = async () => {
    setBusy(true);
    try {
      await onConfirmReset();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={step === 1 ? 'Reset All 4 Portals — Confirmation (1 of 2)' : 'Final Confirmation (2 of 2) — Clear All Data'}
    >
      {step === 1 ? (
        <div className="stack" style={{ gap: 14 }}>
          <div className="alert-panel alert-warning">
            <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>First Confirmation Required:</strong><br />
                Are you sure you want to reset the <strong>Master, College, Teachers (HOD &amp; Faculty), and Student</strong> portals?
              </div>
            </div>
          </div>
          <p className="card-sub">
            Resetting will clear your forgotten Master password and permanently erase all stored records across all 4 portals (users, admissions, subjects, timetables, marks, certificates, library books, and synced cloud data if linked).
          </p>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={() => setStep(2)}>
              Yes, Continue to Final Step (1/2)
            </button>
          </div>
        </div>
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          <div className="alert-panel alert-danger">
            <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Second &amp; Final Confirmation:</strong><br />
                This action <strong>cannot be undone</strong>. All data across all 4 portals will be completely wiped and Master Portal will return to First-Time Institution Setup.
              </div>
            </div>
          </div>
          <p className="card-sub">
            Click the button below only if you are completely sure you want to clear everything and start fresh.
          </p>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" className="btn" disabled={busy} onClick={() => setStep(1)}>Go Back</button>
            <button type="button" className="btn btn-danger-solid" disabled={busy} onClick={handleFinalConfirm}>
              <RotateCcw size={14} /> {busy ? 'Resetting All 4 Portals...' : 'Yes, Reset All 4 Portals Now (2/2)'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function readFileAsDataUrl(file, maxKb = 1500) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    if (file.size > maxKb * 1024) {
      return reject(new Error(`File too large (${Math.round(file.size / 1024)} KB). Please upload a PDF/Image under ${maxKb} KB for smooth GitHub Gist sync.`));
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: String(reader.result) });
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function FileUploadButton({ label = 'Upload File (PDF/Image)', accept = '.pdf,image/*', onUploaded, onError }) {
  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await readFileAsDataUrl(file);
      onUploaded(res);
    } catch (err) {
      if (onError) onError(err.message);
      else alert(err.message);
    }
    e.target.value = '';
  };
  return (
    <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
      <Upload size={14} /> {label}
      <input type="file" accept={accept} style={{ display: 'none' }} onChange={handleChange} />
    </label>
  );
}

export function DownloadFileButton({ fileName, dataUrl, label = 'Download' }) {
  if (!dataUrl) return <span className="card-sub">No file attached</span>;
  return (
    <a className="btn btn-sm" href={dataUrl} download={fileName || 'document'} style={{ textDecoration: 'none' }}>
      <Download size={13} /> {label}
    </a>
  );
}

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function printDocumentHtml(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=850,height=900');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Georgia, "Times New Roman", serif; padding: 32px; color: #0f172a; line-height: 1.55; }
      .doc-box { border: 2px solid #1e3a5f; padding: 28px; border-radius: 6px; max-width: 760px; margin: 0 auto; }
      h1 { font-size: 21px; margin: 0 0 4px; text-align: center; color: #1e3a5f; }
      .sub { text-align: center; color: #475569; font-size: 13px; margin-bottom: 18px; font-family: sans-serif; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; font-family: sans-serif; }
      th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
      th { background: #f1f5f9; }
    </style></head><body>${bodyHtml}<script>window.onload=()=>window.print();</script></body></html>`);
  win.document.close();
}
