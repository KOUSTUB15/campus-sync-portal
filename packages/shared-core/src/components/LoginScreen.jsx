import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowRight, Sun, Moon, ExternalLink, Cloud, ShieldCheck } from 'lucide-react';
import { useCampusStore } from '../StoreContext.jsx';
import { PORTAL_CONFIG, getPortalUrl } from '../portalUrls.js';
import { GitHubSyncModal } from './GitHubSyncModal.jsx';

export function LoginScreen({ portalId, heading, tagline }) {
  const {
    db,
    login,
    bootstrapMaster,
    generateOtp,
    resetPasswordWithOtp,
    theme,
    toggleTheme,
    ghConfig,
  } = useCampusStore();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [syncOpen, setSyncOpen] = useState(false);

  // First-time Master Setup state (only when no master exists yet)
  const needsBootstrap = portalId === 'master' && !db.users.some((u) => u.portal === 'master');
  const [setup, setSetup] = useState({
    institutionName: '',
    institutionCode: '',
    academicYear: '2026-2027',
    activeSemester: '1st Sem',
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpInfo, setOtpInfo] = useState('');

  const portalUsersCount = db.users.filter((u) => u.portal === portalId).length;

  const handleBootstrap = (e) => {
    e.preventDefault();
    if (setup.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    bootstrapMaster(setup);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (!res.ok) setError(res.error);
  };

  const handleSendOtp = () => {
    setError('');
    const res = generateOtp(otpEmail);
    if (!res.ok) setError(res.error);
    else {
      setSentOtp(res.otp);
      setOtpInfo(`Verification OTP generated (logged in Master Portal): ${res.otp}`);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    const res = resetPasswordWithOtp(otpEmail, enteredOtp, newPassword);
    if (!res.ok) setError(res.error);
    else {
      setMode('login');
      setEmail(otpEmail);
      setPassword('');
      setSentOtp('');
      setOtpInfo('');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <span className="badge">{PORTAL_CONFIG[portalId]?.title}</span>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-sm" onClick={() => setSyncOpen(true)} title="Connect GitHub Sync">
              <Cloud size={14} color={ghConfig.gistId ? 'var(--success)' : 'var(--accent)'} />
              <span>{ghConfig.gistId ? 'Synced' : 'Sync'}</span>
            </button>
            <button className="btn btn-sm" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {needsBootstrap ? (
          <form className="stack" style={{ gap: 12 }} onSubmit={handleBootstrap}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>First-Time Institution Setup</h1>
              <p className="card-sub">Zero demo data — create your real Institution & Master Admin account below (or click <strong>Sync</strong> above to pull existing data from GitHub).</p>
            </div>
            <div className="field"><label>Institution Name</label><input className="input" placeholder="e.g. Maratha Mandal Engineering College" value={setup.institutionName} onChange={(e) => setSetup({ ...setup, institutionName: e.target.value })} required /></div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="field"><label>Institution Code</label><input className="input" placeholder="e.g. 2MM" value={setup.institutionCode} onChange={(e) => setSetup({ ...setup, institutionCode: e.target.value })} required /></div>
              <div className="field"><label>Academic Year</label><input className="input" value={setup.academicYear} onChange={(e) => setSetup({ ...setup, academicYear: e.target.value })} required /></div>
            </div>
            <div className="field"><label>Master Admin Full Name</label><input className="input" placeholder="Your Name" value={setup.name} onChange={(e) => setSetup({ ...setup, name: e.target.value })} required /></div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="field"><label>Master Admin Email</label><input type="email" className="input" placeholder="master@college.edu" value={setup.email} onChange={(e) => setSetup({ ...setup, email: e.target.value })} required /></div>
              <div className="field"><label>Phone</label><input className="input" placeholder="+91 ..." value={setup.phone} onChange={(e) => setSetup({ ...setup, phone: e.target.value })} /></div>
            </div>
            <div className="field"><label>Create Password (min 6 chars)</label><input type="password" className="input" value={setup.password} onChange={(e) => setSetup({ ...setup, password: e.target.value })} required /></div>
            {error && <div className="badge badge-danger" style={{ borderRadius: 10, padding: 10 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: 11 }}>
              <ShieldCheck size={16} /> Initialize Institution & Enter Master Portal
            </button>
          </form>
        ) : (
          <>
            <h1 style={{ fontSize: 23, fontWeight: 800, marginBottom: 4 }}>{heading}</h1>
            <p className="card-sub" style={{ marginBottom: 18 }}>
              {db.masterSettings.institutionName ? `${db.masterSettings.institutionName} • ` : ''}{tagline}
            </p>

            {portalUsersCount === 0 && (
              <div className="badge badge-warning" style={{ borderRadius: 10, padding: 10, display: 'block', marginBottom: 14 }}>
                No {portalId} accounts created yet. Create credentials in <strong>Master Portal</strong> or <strong>College Portal</strong>, or click <strong>Sync</strong> above to pull data from GitHub Gist.
              </div>
            )}

            {mode === 'login' ? (
              <form className="stack" style={{ gap: 13 }} onSubmit={handleLogin}>
                <div className="field">
                  <label>Registered Email</label>
                  <input className="input" type="email" placeholder="Enter email assigned by Admin" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input className="input" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <div className="badge badge-danger" style={{ borderRadius: 10, padding: 10 }}>{error}</div>}
                <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: 11 }}>
                  <Lock size={15} /> Sign In
                </button>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <button type="button" className="btn btn-sm" style={{ background: 'transparent', border: 'none', color: 'var(--accent)' }} onClick={() => { setMode('otp'); setError(''); }}>
                    <KeyRound size={14} /> Forgot Password? OTP Reset
                  </button>
                  <span className="card-sub">{portalUsersCount} active user(s)</span>
                </div>
              </form>
            ) : (
              <form className="stack" style={{ gap: 13 }} onSubmit={handleReset}>
                <div className="field">
                  <label>Registered Email</label>
                  <input className="input" type="email" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} required />
                </div>
                <button type="button" className="btn" onClick={handleSendOtp}><Mail size={15} /> Generate 6-Digit OTP</button>
                {otpInfo && <div className="badge badge-success" style={{ borderRadius: 10, padding: 10, display: 'block' }}>{otpInfo}</div>}
                {sentOtp && (
                  <>
                    <div className="field"><label>Enter OTP</label><input className="input" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} required /></div>
                    <div className="field"><label>New Password</label><input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
                    <button className="btn btn-primary" type="submit">Verify & Update Password <ArrowRight size={15} /></button>
                  </>
                )}
                {error && <div className="badge badge-danger" style={{ borderRadius: 10, padding: 10 }}>{error}</div>}
                <button type="button" className="btn btn-sm" onClick={() => setMode('login')}>Back to Sign In</button>
              </form>
            )}
          </>
        )}

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div className="card-sub" style={{ marginBottom: 8, fontWeight: 600 }}>Switch Connected Campus App:</div>
          <div className="portal-links">
            {Object.values(PORTAL_CONFIG).map((p) => (
              <a key={p.id} href={getPortalUrl(p.id, portalId)} className={`portal-pill ${p.id === portalId ? 'current' : ''}`}>
                {p.title.replace(' Portal', '')} <ExternalLink size={10} style={{ display: 'inline' }} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <GitHubSyncModal open={syncOpen} onClose={() => setSyncOpen(false)} />
    </div>
  );
}
