import React, { useState } from 'react';
import { Bell, Sun, Moon, LogOut, Menu, Cloud, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { useCampusStore } from '../StoreContext.jsx';
import { PORTAL_CONFIG, getPortalUrl } from '../portalUrls.js';
import { Modal, EmptyState } from './UI.jsx';
import { GitHubSyncModal } from './GitHubSyncModal.jsx';

export function AppShell({ portalId, roleBadge, icon: BrandIcon, navGroups, activeTab, onTabChange, children }) {
  const { db, theme, toggleTheme, currentUser, logout, syncMeta, ghConfig } = useCampusStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  const cfg = PORTAL_CONFIG[portalId];
  const notices = db.globalNotices || [];

  return (
    <div className="app-layout">
      <div className={`mobile-backdrop ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand-box">
          <div className="brand-icon">{BrandIcon && <BrandIcon size={19} />}</div>
          <div>
            <div className="brand-title">{cfg.title}</div>
            <div className="brand-sub">{roleBadge || currentUser?.subRole || cfg.subtitle}</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                  >
                    {Icon && <Icon size={16} />}
                    <span>{item.label}</span>
                    {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-group-label" style={{ padding: '2px 4px' }}>Connected Portals</div>
          <div className="portal-links">
            {Object.values(PORTAL_CONFIG).map((p) => (
              <a
                key={p.id}
                href={getPortalUrl(p.id, portalId)}
                target={p.id === portalId ? '_self' : '_blank'}
                rel="noreferrer"
                className={`portal-pill ${p.id === portalId ? 'current' : ''}`}
              >
                {p.title.replace(' Portal', '')} {p.id !== portalId && <ExternalLink size={10} style={{ display: 'inline' }} />}
              </a>
            ))}
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn btn-sm mobile-toggle" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
              <Menu size={16} />
            </button>
            <div>
              <div className="topbar-inst-name">
                {db.masterSettings.institutionName || 'Academic Management System'}
              </div>
              <div className="card-sub">
                Session {db.masterSettings.academicYear} &middot; {db.masterSettings.activeSemester} &middot; Min Attendance: {db.masterSettings.minAttendancePercent}%
              </div>
            </div>
          </div>

          <div className="topbar-right">
            <button className="btn btn-sm" onClick={() => setSyncOpen(true)}>
              {syncMeta.state === 'syncing' ? (
                <RefreshCw size={14} />
              ) : syncMeta.state === 'error' ? (
                <AlertCircle size={14} color="var(--danger)" />
              ) : (
                <Cloud size={14} color={ghConfig.gistId ? 'var(--success)' : 'var(--accent)'} />
              )}
              <span>{ghConfig.gistId ? 'GitHub Synced' : 'Live Sync'}</span>
            </button>

            <button className="btn btn-sm" onClick={() => setNotifOpen(true)} title="Global Notices">
              <Bell size={14} />
              <span>{notices.length}</span>
            </button>

            <button className="btn btn-sm" onClick={toggleTheme} title="Switch Classic Light / Dark Mode">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {currentUser && (
              <div className="row" style={{ gap: 8 }}>
                <span className="badge">{currentUser.name} &middot; {currentUser.subRole}</span>
                <button className="btn btn-sm btn-danger" onClick={logout} title="Sign Out">
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="content-wrap">{children}</main>
      </div>

      <Modal open={notifOpen} onClose={() => setNotifOpen(false)} title="Global Notifications & Circulars">
        {notices.length === 0 ? (
          <EmptyState title="No Notices Published" message="Notices created in Master Portal will appear here." />
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {notices.map((n) => (
              <div key={n.id} className="card" style={{ padding: 14 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong>{n.title}</strong>
                  <span className={`badge ${n.priority === 'High' ? 'badge-danger' : 'badge-info'}`}>{n.priority}</span>
                </div>
                <p className="card-sub">{n.body}</p>
                <div className="card-sub" style={{ fontSize: 11, marginTop: 4 }}>{n.audience} &middot; By {n.postedBy} &middot; {n.date}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <GitHubSyncModal open={syncOpen} onClose={() => setSyncOpen(false)} />
    </div>
  );
}
