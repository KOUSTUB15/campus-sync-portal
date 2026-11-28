import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowRight, Sun, Moon, ExternalLink, Cloud, ShieldCheck, RotateCcw } from 'lucide-react';
import { useCampusStore } from '../StoreContext.jsx';
import { PORTAL_CONFIG, getPortalUrl } from '../portalUrls.js';
import { GitHubSyncModal } from './GitHubSyncModal.jsx';
import { DoubleConfirmResetModal } from './UI.jsx';

export function LoginScreen({ portalId, heading, tagline }) {
  const {
    db,
    login,
    bootstrapMaster,
    wipeAllData,
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
  const [resetModalOpen, setResetModalOpen] = useState(false);

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

  // OTP state (for College / Teacher / Student portals)
  const [otpEmail, setOtpEmail] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpInfo, setOtpInfo] = useState('');

  const portalUsersCount = db.users.filter((u) => u.portal === portalId).length;

  const handleBootstrap = (e) => {
    e.preventDefault();
    setError('');
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

  const handleOtpReset = (e) => {
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

  const handleCompleteFactoryReset = async () => {
    await wipeAllData();
    setEmail('');
    setPassword('');
    setError('');
    setMode('login');
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
          <span className="badge">{PORTAL_CONFIG[portalId]?.title}</span>
          <div className="row" style={{ gap: 6 }}>
            <button type="button" className="btn btn-sm" onClick={() => setSyncOpen(true)} title="Connect GitHub Sync">
              <Cloud size={14} color={ghConfig.gistId ? 'var(--success)' : 'var(--accent)'} />
              <span>{ghConfig.gistId ? 'Synced' : 'Sync'}</span>
            </button>
            <button type="button" className="btn btn-sm" onClick={toggleTheme} title="Switch Light / Dark Mode">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {needsBootstrap ? (
          <form className="stack" style={{ gap: 12 }} onSubmit={handleBootstrap}>
            <div>
              <h1 className="login-heading">Institution Setup</h1>
              <p className="card-sub">
                Enter your Institution details and create the Master Administrator account below, or click <strong>Sync</strong> above to link an existing GitHub Gist.
              </p>
            </div>
            <div className="field">
              <label>Institution Name</label>
              <input className="input" placeholder="e.g. Maratha Mandal Engineering College" value={setup.institutionName} onChange={(e) => setSetup({ ...setup, institutionName: e.target.value })} required />
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="field">
                <label>Institution Code</label>
                <input className="input" placeholder="e.g. 2MM" value={setup.institutionCode} onChange={(e) => setSetup({ ...setup, institutionCode: e.target.value })} required />
              </div>
              <div className="field">
                <label>Academic Year</label>
                <input className="input" value={setup.academicYear} onChange={(e) => setSetup({ ...setup, academicYear: e.target.value })} required />
              </div>
            </div>
            <div className="field">
              <label>Master Administrator Full Name</label>
              <input className="input" placeholder="Full Name" value={setup.name} onChange={(e) => setSetup({ ...setup, name: e.target.value })} required />
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="field">
                <label>Administrator Email</label>
                <input type="email" className="input" placeholder="master@college.edu" value={setup.email} onChange={(e) => setSetup({ ...setup, email: e.target.value })} required />
              </div>
              <div className="field">
                <label>Phone</label>
                <input className="input" placeholder="+91 ..." value={setup.phone} onChange={(e) => setSetup({ ...setup, phone: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Create Password (min 6 characters)</label>
              <input type="password" className="input" value={setup.password} onChange={(e) => setSetup({ ...setup, password: e.target.value })} required />
            </div>
            {error && <div className="alert-panel alert-danger">{error}</div>}
            <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: 10 }}>
              <ShieldCheck size={15} /> Initialize Institution &amp; Enter Master Portal
            </button>
          </form>
        ) : (
          <>
            <h1 className="login-heading">{heading}</h1>
            <p className="card-sub" style={{ marginBottom: 18 }}>
              {db.masterSettings.institutionName ? `${db.masterSettings.institutionName} — ` : ''}{tagline}
            </p>

            {portalUsersCount === 0 && (
              <div className="alert-panel alert-warning" style={{ marginBottom: 14 }}>
                No {portalId} accounts registered yet. Create credentials in <strong>Master Portal</strong> or <strong>College Portal</strong>, or click <strong>Sync</strong> above to pull data from GitHub.
              </div>
            )}

            {mode === 'login' ? (
              <form className="stack" style={{ gap: 13 }} onSubmit={handleLogin}>
                <div className="field">
                  <label>Registered Email</label>
                  <input className="input" type="email" placeholder="Enter your official email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input className="input" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <div className="alert-panel alert-danger">{error}</div>}
                <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: 10 }}>
                  <Lock size={15} /> Sign In
                </button>

                {portalId === 'master' ? (
                  <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border)' }} className="stack">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="card-sub">Forgot Master Password?</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => setResetModalOpen(true)}
                      >
                        <RotateCcw size={13} /> Reset All 4 Portals
                      </button>
                    </div>
                    <p className="card-sub" style={{ fontSize: 11.5 }}>
                      Resetting clears all data across Master, College, Teachers &amp; Student portals so you can set up a new Master account. You will be asked to confirm twice.
                    </p>
                  </div>
                ) : (
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setMode('otp'); setError(''); }}>
                      <KeyRound size={14} /> Forgot Password? OTP Reset
                    </button>
                    <span className="card-sub">{portalUsersCount} active user(s)</span>
                  </div>
                )}
              </form>
            ) : (
              <form className="stack" style={{ gap: 13 }} onSubmit={handleOtpReset}>
                <div className="field">
                  <label>Registered Email</label>
                  <input className="input" type="email" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} required />
                </div>
                <button type="button" className="btn" onClick={handleSendOtp}><Mail size={15} /> Generate 6-Digit OTP</button>
                {otpInfo && <div className="alert-panel alert-success">{otpInfo}</div>}
                {sentOtp && (
                  <>
                    <div className="field"><label>Enter OTP</label><input className="input" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} required /></div>
                    <div className="field"><label>New Password</label><input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
                    <button className="btn btn-primary" type="submit">Verify &amp; Update Password <ArrowRight size={15} /></button>
                  </>
                )}
                {error && <div className="alert-panel alert-danger">{error}</div>}
                <button type="button" className="btn btn-sm" onClick={() => setMode('login')}>Back to Sign In</button>
              </form>
            )}
          </>
        )}

        <div className="divider" />
        <div className="card-sub" style={{ marginBottom: 8, fontWeight: 600 }}>Switch Connected Portal</div>
        <div className="portal-links">
          {Object.values(PORTAL_CONFIG).map((p) => (
            <a key={p.id} href={getPortalUrl(p.id, portalId)} className={`portal-pill ${p.id === portalId ? 'current' : ''}`}>
              {p.title.replace(' Portal', '')} <ExternalLink size={10} style={{ display: 'inline' }} />
            </a>
          ))}
        </div>
      </div>

      <GitHubSyncModal open={syncOpen} onClose={() => setSyncOpen(false)} />
      <DoubleConfirmResetModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirmReset={handleCompleteFactoryReset}
      />
    </div>
  );
}
