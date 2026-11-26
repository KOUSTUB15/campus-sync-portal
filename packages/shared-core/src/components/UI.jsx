import React from 'react';
import { X } from 'lucide-react';

export function StatCard({ label, value, hint, icon: Icon, tone }) {
  const toneColors = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  };
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={tone ? { color: toneColors[tone] } : undefined}>{value}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
      {Icon && (
        <div className="stat-icon" style={tone ? { color: toneColors[tone] } : undefined}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="card-header" style={{ marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <div className="card-sub">{subtitle}</div>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div className="card-title">{title}</div>
          <button className="btn btn-sm" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
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
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 36px; color: #0f172a; line-height: 1.55; }
      .doc-box { border: 2px solid #1e293b; padding: 30px; border-radius: 10px; max-width: 760px; margin: 0 auto; }
      h1 { font-size: 22px; margin: 0 0 4px; text-align: center; }
      h2 { font-size: 16px; margin: 18px 0 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
      .sub { text-align: center; color: #475569; font-size: 13px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
      th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
      th { background: #f1f5f9; }
      .sig { margin-top: 38px; display: flex; justify-content: space-between; font-size: 13px; }
      .stamp { display: inline-block; border: 2px dashed #059669; color: #059669; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 12px; }
    </style></head><body>${bodyHtml}<script>window.onload=()=>window.print();</script></body></html>`);
  win.document.close();
}
