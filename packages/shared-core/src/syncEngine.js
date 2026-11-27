const STORAGE_KEY = 'campus_portal_v2_db';
const META_KEY = 'campus_portal_v2_meta';
const GITHUB_CFG_KEY = 'campus_portal_v2_github_sync';
const CHANNEL_NAME = 'campus_portal_v2_bus';
const LOCAL_RELAY_URL = 'http://localhost:5199';

export const TAB_SENDER_ID = `tab_${Math.random().toString(36).slice(2, 10)}`;

export function loadLocalState(fallbackDb) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const meta = JSON.parse(localStorage.getItem(META_KEY) || '{}');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { db: { ...fallbackDb, ...parsed }, updatedAt: meta.updatedAt || Date.now() };
    }
  } catch {
    // ignore corrupted storage
  }
  return { db: fallbackDb, updatedAt: 0 };
}

export function saveLocalState(db, updatedAt = Date.now()) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    localStorage.setItem(META_KEY, JSON.stringify({ updatedAt }));
  } catch {
    // quota fallback
  }
}

export function getGitHubSyncConfig() {
  try {
    return JSON.parse(localStorage.getItem(GITHUB_CFG_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveGitHubSyncConfig(cfg) {
  localStorage.setItem(GITHUB_CFG_KEY, JSON.stringify(cfg));
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage({ type: 'GH_CONFIG_UPDATED', cfg, senderId: TAB_SENDER_ID });
    ch.close();
  } catch {
    // ignore
  }
}

export async function createGitHubSyncGist(token, db) {
  const cleanToken = token.trim().replace(/^Bearer\s+/i, '');
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'Campus Sync Portal v2 — Live Shared Database (Zero Demo Data)',
      public: false,
      files: {
        'campus-portal-v2-db.json': {
          content: JSON.stringify({ updatedAt: Date.now(), db }, null, 2),
        },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API Error (${res.status})`);
  }
  const data = await res.json();
  return { gistId: data.id, htmlUrl: data.html_url };
}

export async function pushToGitHubGist(cfg, db, updatedAt) {
  if (!cfg?.token || !cfg?.gistId) return { ok: false, reason: 'not-configured' };
  const cleanToken = cfg.token.trim().replace(/^Bearer\s+/i, '');
  const res = await fetch(`https://api.github.com/gists/${cfg.gistId.trim()}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        'campus-portal-v2-db.json': {
          content: JSON.stringify({ updatedAt, db }, null, 2),
        },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub Push Failed (${res.status})`);
  }
  return { ok: true, updatedAt };
}

export async function pullFromGitHubGist(cfg) {
  if (!cfg?.gistId) return null;
  const headers = { Accept: 'application/vnd.github+json' };
  if (cfg.token) headers.Authorization = `Bearer ${cfg.token.trim().replace(/^Bearer\s+/i, '')}`;
  const res = await fetch(`https://api.github.com/gists/${cfg.gistId.trim()}?t=${Date.now()}`, { headers });
  if (!res.ok) throw new Error(`GitHub Pull Failed (${res.status})`);
  const data = await res.json();
  const file = data.files?.['campus-portal-v2-db.json'] || data.files?.['campus-portal-db.json'];
  if (!file?.content) return null;
  return JSON.parse(file.content);
}

export async function pushToLocalRelay(db, updatedAt) {
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) return false;
  try {
    const res = await fetch(`${LOCAL_RELAY_URL}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ db, updatedAt, senderId: TAB_SENDER_ID }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullFromLocalRelay() {
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) return null;
  try {
    const res = await fetch(`${LOCAL_RELAY_URL}/state`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && !data.empty && data.db) return data;
    return null;
  } catch {
    return null;
  }
}

export function subscribeLiveChannels(onRemoteState, onRelayStatus, onGhConfig) {
  const cleanups = [];
  if (typeof BroadcastChannel !== 'undefined') {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = (e) => {
      const msg = e.data;
      if (!msg || msg.senderId === TAB_SENDER_ID) return;
      if (msg.type === 'DB_UPDATED' && msg.db) onRemoteState(msg.db, msg.updatedAt, 'BroadcastChannel');
      if (msg.type === 'GH_CONFIG_UPDATED' && msg.cfg && onGhConfig) onGhConfig(msg.cfg);
    };
    cleanups.push(() => ch.close());
  }
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const meta = JSON.parse(localStorage.getItem(META_KEY) || '{}');
        onRemoteState(JSON.parse(e.newValue), meta.updatedAt || Date.now(), 'LocalStorage');
      } catch { /* ignore */ }
    }
  };
  window.addEventListener('storage', onStorage);
  cleanups.push(() => window.removeEventListener('storage', onStorage));

  if (['localhost', '127.0.0.1'].includes(window.location.hostname) && typeof EventSource !== 'undefined') {
    try {
      const es = new EventSource(`${LOCAL_RELAY_URL}/events`);
      es.onopen = () => onRelayStatus(true);
      es.onerror = () => onRelayStatus(false);
      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'connected') { onRelayStatus(true); return; }
          if (payload.senderId === TAB_SENDER_ID) return;
          if (payload.db) onRemoteState(payload.db, payload.updatedAt || Date.now(), 'Local Dev Relay');
        } catch { /* ignore */ }
      };
      cleanups.push(() => es.close());
    } catch {
      onRelayStatus(false);
    }
  }
  return () => cleanups.forEach((fn) => fn());
}

export function broadcastLocalUpdate(db, updatedAt) {
  if (typeof BroadcastChannel !== 'undefined') {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage({ type: 'DB_UPDATED', db, updatedAt, senderId: TAB_SENDER_ID });
    ch.close();
  }
}
