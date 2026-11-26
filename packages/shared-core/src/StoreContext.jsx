import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_DB } from './initialData.js';
import {
  loadLocalState,
  saveLocalState,
  broadcastLocalUpdate,
  subscribeLiveChannels,
  pushToLocalRelay,
  pullFromLocalRelay,
  getGitHubSyncConfig,
  saveGitHubSyncConfig,
  pushToGitHubGist,
  pullFromGitHubGist,
  createGitHubSyncGist,
} from './syncEngine.js';

const StoreContext = createContext(null);
const THEME_KEY = 'campus_portal_theme_v1';

export function StoreProvider({ portalRole, children }) {
  const initial = loadLocalState(INITIAL_DB);
  const [db, setDb] = useState(initial.db);
  const lastUpdatedRef = useRef(initial.updatedAt);

  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  const [relayConnected, setRelayConnected] = useState(false);
  const [ghConfig, setGhConfig] = useState(() => getGitHubSyncConfig());
  const [syncMeta, setSyncMeta] = useState({
    state: 'idle',
    source: 'Local Browser',
    lastSyncTime: new Date().toLocaleTimeString(),
    error: '',
  });
  const [toast, setToast] = useState(null);

  const authStorageKey = `campus_auth_${portalRole}`;
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(authStorageKey) || 'null');
    } catch {
      return null;
    }
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 3200 ? null : prev));
    }, 3400);
  }, []);

  // Apply theme globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // Apply incoming remote updates only if newer
  const applyRemote = useCallback((remoteDb, remoteTs, source) => {
    if (!remoteDb) return;
    if (remoteTs && remoteTs <= lastUpdatedRef.current) return;
    lastUpdatedRef.current = remoteTs || Date.now();
    saveLocalState(remoteDb, lastUpdatedRef.current);
    setDb(remoteDb);
    setSyncMeta({
      state: 'synced',
      source,
      lastSyncTime: new Date().toLocaleTimeString(),
      error: '',
    });
  }, []);

  // Subscribe to BroadcastChannel + localStorage + Local Dev Relay SSE
  useEffect(() => {
    const unsub = subscribeLiveChannels(
      applyRemote,
      (isUp) => setRelayConnected(isUp),
      (cfg) => setGhConfig(cfg)
    );

    // Pull initial state from Local Dev Relay if running locally
    pullFromLocalRelay().then((payload) => {
      if (payload?.db && payload.updatedAt > lastUpdatedRef.current) {
        applyRemote(payload.db, payload.updatedAt, 'Local Dev Relay');
      } else if (payload === null && lastUpdatedRef.current === 0) {
        saveLocalState(INITIAL_DB, Date.now());
      }
    });

    return unsub;
  }, [applyRemote]);

  // GitHub Gist Cloud Auto-Polling (every 8 seconds when configured)
  const pullGitHubNow = useCallback(async (silent = false) => {
    const cfg = getGitHubSyncConfig();
    if (!cfg?.gistId) return;
    try {
      setSyncMeta((s) => ({ ...s, state: 'syncing', error: '' }));
      const payload = await pullFromGitHubGist(cfg);
      if (payload?.db && payload.updatedAt > lastUpdatedRef.current) {
        applyRemote(payload.db, payload.updatedAt, 'GitHub Gist Cloud');
        if (!silent) showToast('Pulled latest campus data from GitHub Cloud');
      } else {
        setSyncMeta((s) => ({ ...s, state: 'synced', source: 'GitHub Gist Cloud', lastSyncTime: new Date().toLocaleTimeString() }));
        if (!silent) showToast('Already up to date with GitHub Cloud');
      }
    } catch (err) {
      setSyncMeta((s) => ({ ...s, state: 'error', error: err.message }));
      if (!silent) showToast(err.message, 'error');
    }
  }, [applyRemote, showToast]);

  useEffect(() => {
    if (!ghConfig?.gistId || ghConfig.autoSync === false) return;
    pullGitHubNow(true);
    const id = setInterval(() => pullGitHubNow(true), 8000);
    return () => clearInterval(id);
  }, [ghConfig?.gistId, ghConfig?.token, ghConfig?.autoSync, pullGitHubNow]);

  // Core update function shared by all 4 apps
  const updateDb = useCallback((updater, toastMsg) => {
    setDb((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const now = Date.now();
      lastUpdatedRef.current = now;
      saveLocalState(next, now);
      broadcastLocalUpdate(next, now);
      pushToLocalRelay(next, now);

      const cfg = getGitHubSyncConfig();
      if (cfg?.token && cfg?.gistId && cfg.autoSync !== false) {
        setSyncMeta((s) => ({ ...s, state: 'syncing', error: '' }));
        pushToGitHubGist(cfg, next, now)
          .then(() => {
            setSyncMeta({
              state: 'synced',
              source: 'GitHub Gist Cloud',
              lastSyncTime: new Date().toLocaleTimeString(),
              error: '',
            });
          })
          .catch((err) => {
            setSyncMeta((s) => ({ ...s, state: 'error', error: err.message }));
          });
      } else {
        setSyncMeta({
          state: 'synced',
          source: relayConnected ? 'Local Dev Relay + Browser' : 'Same-Origin Live Bus',
          lastSyncTime: new Date().toLocaleTimeString(),
          error: '',
        });
      }
      return next;
    });
    if (toastMsg) showToast(toastMsg);
  }, [relayConnected, showToast]);

  const configureGitHubSync = async (newCfg) => {
    saveGitHubSyncConfig(newCfg);
    setGhConfig(newCfg);
    if (newCfg.gistId) {
      await pullGitHubNow(false);
    }
  };

  const createCloudGist = async (token) => {
    const created = await createGitHubSyncGist(token, db);
    const cfg = { token: token.trim(), gistId: created.gistId, autoSync: true, htmlUrl: created.htmlUrl };
    saveGitHubSyncConfig(cfg);
    setGhConfig(cfg);
    setSyncMeta({ state: 'synced', source: 'GitHub Gist Cloud', lastSyncTime: new Date().toLocaleTimeString(), error: '' });
    showToast(`GitHub Sync Gist created (${created.gistId.slice(0, 8)}...)`);
    return created;
  };

  const pushGitHubNow = async () => {
    const cfg = getGitHubSyncConfig();
    if (!cfg?.token || !cfg?.gistId) {
      showToast('Enter GitHub Token & Gist ID first', 'error');
      return;
    }
    try {
      setSyncMeta((s) => ({ ...s, state: 'syncing', error: '' }));
      const now = Date.now();
      lastUpdatedRef.current = now;
      await pushToGitHubGist(cfg, db, now);
      setSyncMeta({ state: 'synced', source: 'GitHub Gist Cloud', lastSyncTime: new Date().toLocaleTimeString(), error: '' });
      showToast('Pushed campus database to GitHub Cloud');
    } catch (err) {
      setSyncMeta((s) => ({ ...s, state: 'error', error: err.message }));
      showToast(err.message, 'error');
    }
  };

  const resetDb = () => {
    updateDb(() => INITIAL_DB, 'Reset all 4 portals back to clean demo seed data');
  };

  const login = (email, password) => {
    const match = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!match) return { ok: false, error: 'Invalid email or password.' };
    if (portalRole !== 'master' && match.role !== portalRole && match.role !== 'master') {
      return { ok: false, error: `This account belongs to the ${match.role.toUpperCase()} portal.` };
    }
    sessionStorage.setItem(authStorageKey, JSON.stringify(match));
    setCurrentUser(match);
    showToast(`Welcome back, ${match.name}`);
    return { ok: true, user: match };
  };

  const quickDemoLogin = () => {
    const match = db.users.find((u) => u.role === portalRole) || db.users[0];
    sessionStorage.setItem(authStorageKey, JSON.stringify(match));
    setCurrentUser(match);
    showToast(`Signed in as ${match.name}`);
  };

  const logout = () => {
    sessionStorage.removeItem(authStorageKey);
    setCurrentUser(null);
  };

  const generateOtp = (email) => {
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return { ok: false, error: 'No account found with this email.' };
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    updateDb((prev) => ({
      ...prev,
      otpLogs: [
        { id: `OTP-${Date.now().toString().slice(-4)}`, email: user.email, otp, status: 'Sent', timestamp: new Date().toLocaleString() },
        ...prev.otpLogs,
      ],
    }));
    return { ok: true, otp };
  };

  const resetPasswordWithOtp = (email, otp, newPassword) => {
    const log = db.otpLogs.find((l) => l.email.toLowerCase() === email.trim().toLowerCase() && l.otp === otp.trim());
    if (!log) return { ok: false, error: 'Invalid OTP code.' };
    updateDb((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() ? { ...u, password: newPassword } : u
      ),
      otpLogs: prev.otpLogs.map((l) => (l.id === log.id ? { ...l, status: 'Verified & Reset' } : l)),
    }), 'Password updated across all portals!');
    return { ok: true };
  };

  return (
    <StoreContext.Provider
      value={{
        db,
        updateDb,
        resetDb,
        portalRole,
        theme,
        toggleTheme,
        currentUser,
        login,
        quickDemoLogin,
        logout,
        generateOtp,
        resetPasswordWithOtp,
        relayConnected,
        ghConfig,
        configureGitHubSync,
        createCloudGist,
        pushGitHubNow,
        pullGitHubNow,
        syncMeta,
        toast,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useCampusStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useCampusStore must be used inside StoreProvider');
  return ctx;
}
