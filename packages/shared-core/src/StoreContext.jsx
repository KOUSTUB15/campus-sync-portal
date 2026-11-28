import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { EMPTY_DB } from './initialData.js';
import {
  loadLocalState,
  saveLocalState,
  clearAllPortalAuthSessions,
  broadcastLocalUpdate,
  broadcastFactoryReset,
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
const THEME_KEY = 'campus_portal_v3_theme';

export function StoreProvider({ portalRole, children }) {
  const initial = loadLocalState(EMPTY_DB);
  const [db, setDb] = useState(initial.db);
  const lastUpdatedRef = useRef(initial.updatedAt);

  // Classic Light default for simple, professional institutional look
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const [relayConnected, setRelayConnected] = useState(false);
  const [ghConfig, setGhConfig] = useState(() => getGitHubSyncConfig());
  const [syncMeta, setSyncMeta] = useState({
    state: 'idle',
    source: 'Local Browser',
    lastSyncTime: new Date().toLocaleTimeString(),
    error: '',
  });
  const [toast, setToast] = useState(null);

  const authStorageKey = `campus_v2_auth_${portalRole}`;
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
      setToast((prev) => (prev && Date.now() - prev.id >= 3600 ? null : prev));
    }, 3800);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const applyRemote = useCallback((remoteDb, remoteTs, source) => {
    if (!remoteDb) return;
    if (remoteTs && remoteTs <= lastUpdatedRef.current) return;
    const merged = { ...EMPTY_DB, ...remoteDb };
    lastUpdatedRef.current = remoteTs || Date.now();
    saveLocalState(merged, lastUpdatedRef.current);
    setDb(merged);
    setSyncMeta({ state: 'synced', source, lastSyncTime: new Date().toLocaleTimeString(), error: '' });
  }, []);

  const handleRemoteReset = useCallback((remoteTs) => {
    lastUpdatedRef.current = remoteTs || Date.now();
    saveLocalState(EMPTY_DB, lastUpdatedRef.current);
    clearAllPortalAuthSessions();
    setDb(EMPTY_DB);
    setCurrentUser(null);
    setSyncMeta({ state: 'synced', source: 'Factory Reset', lastSyncTime: new Date().toLocaleTimeString(), error: '' });
    showToast('All 4 portals were reset by Master Portal.', 'error');
  }, [showToast]);

  useEffect(() => {
    const unsub = subscribeLiveChannels(applyRemote, setRelayConnected, setGhConfig, handleRemoteReset);
    pullFromLocalRelay().then((payload) => {
      if (payload?.db && payload.updatedAt > lastUpdatedRef.current) {
        applyRemote(payload.db, payload.updatedAt, 'Local Dev Relay');
      }
    });
    return unsub;
  }, [applyRemote, handleRemoteReset]);

  // Keep currentUser synced — and immediately sign out if account was deleted or portals were reset
  useEffect(() => {
    if (!currentUser) return;
    const latest = db.users.find((u) => u.id === currentUser.id);
    if (!latest) {
      sessionStorage.removeItem(authStorageKey);
      setCurrentUser(null);
      return;
    }
    if (JSON.stringify(latest) !== JSON.stringify(currentUser)) {
      sessionStorage.setItem(authStorageKey, JSON.stringify(latest));
      setCurrentUser(latest);
    }
  }, [db.users, currentUser, authStorageKey]);

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
            setSyncMeta({ state: 'synced', source: 'GitHub Gist Cloud', lastSyncTime: new Date().toLocaleTimeString(), error: '' });
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

  const bootstrapMaster = ({ institutionName, institutionCode, academicYear, activeSemester, name, email, password, phone }) => {
    const masterUser = {
      id: `USR-M-${Date.now().toString().slice(-4)}`,
      refId: 'MASTER-01',
      portal: 'master',
      subRole: 'Master Admin',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      dept: 'Administration',
    };
    updateDb((prev) => ({
      ...prev,
      initialized: true,
      masterSettings: {
        ...prev.masterSettings,
        institutionName: institutionName.trim(),
        institutionCode: institutionCode.trim(),
        academicYear: academicYear.trim() || '2026-2027',
        activeSemester: activeSemester || '1st Sem',
      },
      users: [masterUser, ...prev.users.filter((u) => u.portal !== 'master')],
    }), 'Institution & Master Admin initialized!');
    sessionStorage.setItem(authStorageKey, JSON.stringify(masterUser));
    setCurrentUser(masterUser);
  };

  const configureGitHubSync = async (newCfg) => {
    saveGitHubSyncConfig(newCfg);
    setGhConfig(newCfg);
    if (newCfg.gistId) await pullGitHubNow(false);
  };

  const createCloudGist = async (token) => {
    const created = await createGitHubSyncGist(token, db);
    const cfg = { token: token.trim().replace(/^Bearer\s+/i, ''), gistId: created.gistId, autoSync: true, htmlUrl: created.htmlUrl };
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
      showToast('Pushed database to GitHub Cloud');
    } catch (err) {
      setSyncMeta((s) => ({ ...s, state: 'error', error: err.message }));
      showToast(err.message, 'error');
    }
  };

  // Complete 4-portal Factory Reset: wipes local DB, all 4 portal sessions, local relay, and linked GitHub Gist
  const wipeAllData = async () => {
    const now = Date.now();
    lastUpdatedRef.current = now;
    setDb(EMPTY_DB);
    saveLocalState(EMPTY_DB, now);
    clearAllPortalAuthSessions();
    setCurrentUser(null);
    broadcastLocalUpdate(EMPTY_DB, now);
    broadcastFactoryReset(now);
    pushToLocalRelay(EMPTY_DB, now);

    const cfg = getGitHubSyncConfig();
    if (cfg?.token && cfg?.gistId) {
      try {
        setSyncMeta((s) => ({ ...s, state: 'syncing', error: '' }));
        await pushToGitHubGist(cfg, EMPTY_DB, now);
        setSyncMeta({ state: 'synced', source: 'GitHub Gist Cloud (Reset)', lastSyncTime: new Date().toLocaleTimeString(), error: '' });
      } catch (err) {
        setSyncMeta((s) => ({ ...s, state: 'error', error: err.message }));
      }
    }
    showToast('All 4 portals have been reset and all data cleared. Set up a new Master Admin.');
  };

  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const match = db.users.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!match) return { ok: false, error: 'Invalid email or password. Make sure your account has been created in Master or College Portal.' };
    if (match.portal !== portalRole) {
      return { ok: false, error: `This account belongs to the ${match.portal.toUpperCase()} portal (${match.subRole}), not this portal.` };
    }
    sessionStorage.setItem(authStorageKey, JSON.stringify(match));
    setCurrentUser(match);
    showToast(`Signed in as ${match.name} (${match.subRole})`);
    return { ok: true, user: match };
  };

  const logout = () => {
    sessionStorage.removeItem(authStorageKey);
    setCurrentUser(null);
  };

  const generateOtp = (email) => {
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return { ok: false, error: 'No registered user found with this email.' };
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    updateDb((prev) => ({
      ...prev,
      otpLogs: [{ id: `OTP-${Date.now().toString().slice(-4)}`, email: user.email, otp, status: 'Sent', timestamp: new Date().toLocaleString() }, ...prev.otpLogs],
    }));
    return { ok: true, otp };
  };

  const resetPasswordWithOtp = (email, otp, newPassword) => {
    const log = db.otpLogs.find((l) => l.email.toLowerCase() === email.trim().toLowerCase() && l.otp === otp.trim());
    if (!log) return { ok: false, error: 'Invalid OTP code.' };
    updateDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.email.toLowerCase() === email.trim().toLowerCase() ? { ...u, password: newPassword } : u)),
      teachers: prev.teachers.map((t) => (t.email.toLowerCase() === email.trim().toLowerCase() ? { ...t, password: newPassword } : t)),
      students: prev.students.map((s) => (s.email.toLowerCase() === email.trim().toLowerCase() ? { ...s, password: newPassword } : s)),
      officeWorkers: prev.officeWorkers.map((w) => (w.email.toLowerCase() === email.trim().toLowerCase() ? { ...w, password: newPassword } : w)),
      otpLogs: prev.otpLogs.map((l) => (l.id === log.id ? { ...l, status: 'Verified & Reset' } : l)),
    }), 'Password updated across all portals!');
    return { ok: true };
  };

  return (
    <StoreContext.Provider
      value={{
        db,
        updateDb,
        bootstrapMaster,
        wipeAllData,
        portalRole,
        theme,
        toggleTheme,
        currentUser,
        login,
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
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} color="var(--success)" />}
          <span>{toast.message}</span>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useCampusStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useCampusStore must be used inside StoreProvider');
  return ctx;
}
