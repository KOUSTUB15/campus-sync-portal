import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ShieldCheck, ArrowRight, Sun, Moon, ExternalLink } from 'lucide-react';
import { useCampusStore } from '../StoreContext.jsx';
import { PORTAL_CONFIG, getPortalUrl } from '../portalUrls.js';

export function LoginScreen({ portalId, heading, tagline }) {
  const {
    db,
    login,
    quickDemoLogin,
    generateOtp,
    resetPasswordWithOtp,
    theme,
    toggleTheme,
  } = useCampusStore();

  const [mode, setMode] = useState('login'); // 'login' | 'otp'
  const demoUser = db.users.find((u) => u.role === portalId) || db.users[0];
  const [email, setEmail] = useState(demoUser.email);
  const [password, setPassword] = useState(demoUser.password);
  const [error, setError] = useState('');

  // OTP reset state
  const [otpEmail, setOtpEmail] = useState(demoUser.email);
  const [sentOtp, setSentOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpInfo, setOtpInfo] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (!res.ok) setError(res.error);
  };

  const handleSendOtp = () => {
    setError('');
    const res = generateOtp(otpEmail);
    if (!res.ok) {
      setError(res.error);
    } else {
      setSentOtp(res.otp);
      setOtpInfo(`Demo OTP dispatched (also logged in Master Security): ${res.otp}`);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    const res = resetPasswordWithOtp(otpEmail, enteredOtp, newPassword);
    if (!res.ok) {
      setError(res.error);
    } else {
      setMode('login');
      setPassword(newPassword);
      setSentOtp('');
      setOtpInfo('');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
          <span className="badge">{db.masterSettings.academicYear} • {PORTAL_CONFIG[portalId]?.title}</span>
          <button className="btn btn-sm" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{heading}</h1>
        <p className="card-sub" style={{ marginBottom: 20 }}>
          {tagline} — {db.masterSettings.institutionName}
        </p>

        {mode === 'login' ? (
          <form className="stack" style={{ gap: 14 }} onSubmit={handleLogin}>
            <div className="field">
              <label>Campus Email</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && <div className="badge badge-danger" style={{ borderRadius: 10, padding: 10 }}>{error}</div>}

            <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: 11 }}>
              <Lock size={15} /> Sign In to {PORTAL_CONFIG[portalId]?.title}
            </button>

            <button type="button" className="btn" style={{ width: '100%' }} onClick={quickDemoLogin}>
              <ShieldCheck size={15} /> Instant 1-Click Demo Login ({demoUser.name})
            </button>

            <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'transparent', border: 'none', color: 'var(--accent)' }}
                onClick={() => { setMode('otp'); setError(''); }}
              >
                <KeyRound size={14} /> Forgot Password? OTP Reset
              </button>
              <span className="card-sub">Pass: password123</span>
            </div>
          </form>
        ) : (
          <form className="stack" style={{ gap: 14 }} onSubmit={handleReset}>
            <div className="field">
              <label>Registered Email</label>
              <input className="input" type="email" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} required />
            </div>

            <button type="button" className="btn" onClick={handleSendOtp}>
              <Mail size={15} /> Send 6-Digit OTP
            </button>

            {otpInfo && (
              <div className="badge badge-success" style={{ borderRadius: 10, padding: 10, display: 'block' }}>
                {otpInfo}
              </div>
            )}

            {sentOtp && (
              <>
                <div className="field">
                  <label>Enter OTP</label>
                  <input className="input" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} placeholder="6-digit OTP" required />
                </div>
                <div className="field">
                  <label>New Password</label>
                  <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" required />
                </div>
                <button className="btn btn-primary" type="submit">
                  Verify OTP & Update Password <ArrowRight size={15} />
                </button>
              </>
            )}

            {error && <div className="badge badge-danger" style={{ borderRadius: 10, padding: 10 }}>{error}</div>}

            <button type="button" className="btn btn-sm" onClick={() => setMode('login')}>
              Back to Sign In
            </button>
          </form>
        )}

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div className="card-sub" style={{ marginBottom: 8, fontWeight: 600 }}>Switch Connected Campus App:</div>
          <div className="portal-links">
            {Object.values(PORTAL_CONFIG).map((p) => (
              <a
                key={p.id}
                href={getPortalUrl(p.id, portalId)}
                className={`portal-pill ${p.id === portalId ? 'current' : ''}`}
              >
                {p.title.replace(' Portal', '')} <ExternalLink size={10} style={{ display: 'inline' }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
