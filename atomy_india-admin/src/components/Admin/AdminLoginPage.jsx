import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import brandLogo from '../../assets/logo.png';
import IndiaMap from '../Header/IndiaMap';
import { 
  loginAdminOrDistributor,
  requestAdminForgotPasswordOtp,
  resetAdminPassword
} from '../../services/distributorService';
import './AdminLoginPage.css';

export default function AdminLoginPage({ onLoginSuccess, onBackToStore }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot Password flow state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Identifier, 2: OTP & New Password, 3: Success
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    const query = forgotIdentifier.trim() || emailOrUsername.trim();
    if (!query) {
      setForgotError('Please enter your registered official email or Distributor ID.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      const res = await requestAdminForgotPasswordOtp(query);
      setForgotEmail(res.email || query);
      setForgotSuccess(res.message || '6-digit verification code dispatched to your registered email.');
      setForgotStep(2);
      setResendCooldown(60);
    } catch (err) {
      setForgotError(err.message || 'Failed to dispatch verification code. Please check your credentials.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setForgotError('Please enter the valid 6-digit verification code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    try {
      await resetAdminPassword(forgotEmail, forgotOtp.trim(), forgotNewPassword.trim());
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password. Please check the verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUser = emailOrUsername.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Please enter both your Admin/Distributor ID and password.');
      return;
    }

    setIsLoading(true);

    try {
      const authUser = await loginAdminOrDistributor(trimmedUser, trimmedPass);
      const isDistributor = authUser.role === 'DISTRIBUTOR_ADMIN';

      setSuccessMsg(
        isDistributor
          ? `Authentication verified. Loading Regional Distributor Hub (${authUser.primaryPincode || 'Territory'})...`
          : 'Authentication verified. Loading Operations Console...'
      );

      const adminUser = {
        ...authUser,
        name: authUser.name || authUser.contactPerson || authUser.businessName || 'Atomy Administrator',
        email: authUser.email || (trimmedUser.includes('@') ? trimmedUser : `${trimmedUser}@atomy.in`),
        role: authUser.role || 'SUPER_ADMIN',
        roleTitle: isDistributor ? 'Regional Distributor Sub-Admin' : 'Super Administrator',
        lastLogin: 'Just now (IST)'
      };

      if (rememberMe) {
        localStorage.setItem('atomy_admin_session', JSON.stringify({
          authenticated: true,
          adminUser,
          loginTimestamp: Date.now()
        }));
      } else {
        sessionStorage.setItem('atomy_admin_session', JSON.stringify({
          authenticated: true,
          adminUser,
          loginTimestamp: Date.now()
        }));
      }

      setTimeout(() => {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess(adminUser);
        }
      }, 400);
    } catch (err) {
      setIsLoading(false);
      const isNetworkError = err.message === 'Failed to fetch' || 
                             err.message?.toLowerCase().includes('network') || 
                             err.message?.toLowerCase().includes('fetch');
      if (isNetworkError) {
        setErrorMsg('Connecting to cloud backend... The server was waking up. Please click "Sign In to Console" again now.');
      } else {
        setErrorMsg(err.message || 'Invalid administrative credentials. Access denied.');
      }
    }
  };

  return (
    <div className="admin-login-viewport" id="admin-login-screen">
      {/* Top Floating White Navigation Bar */}
      <header className="login-top-bar">
        <div className="login-brand-meta">
          <span className="brand-dot-pulse" />
          <span className="brand-meta-text">Forge India Connect • Administrator Portal</span>
        </div>

        <button 
          type="button" 
          id="btn-return-storefront"
          className="btn-link-store" 
          onClick={onBackToStore}
          title="Return to Customer Shopping Mall"
        >
          <span>Customer Store</span>
          <ExternalLink size={14} />
        </button>
      </header>

      {/* Center Auth Card Container */}
      <main className="login-card-container">
        {/* Forge India Connect Brand Logo */}
        <div className="signin-logo-wrap" style={{ cursor: 'pointer' }} onClick={onBackToStore} title="Forge India Connect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.17)',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <img
                src={brandLogo}
                alt="Forge India Connect"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800, fontSize: '24px', letterSpacing: '0.8px', lineHeight: 1.1 }}>
                <span style={{ color: '#002C6C' }}>FORGE</span>
                <span style={{ color: '#FF9933', display: 'flex', alignItems: 'center' }}>
                  <IndiaMap style={{ width: '18px', height: '22px', fill: '#FF9933', marginRight: '1px', display: 'inline-block' }} />
                  NDIA
                </span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', color: '#00A3E0', marginTop: '2px' }}>
                CONNECT
              </div>
            </div>
          </div>
        </div>

        {/* Crisp White Card */}
        <div className="login-white-card">
          {!isForgotPassword ? (
            <>
              {/* Card Header */}
              <div className="login-header-group">
                <div className="login-header-title-row">
                  <h1 className="login-title">Operations Console</h1>
                  <span className="admin-pill-badge">ADMIN</span>
                </div>
                <p className="login-subtitle">
                  Internal Administrative Access • Secure Workspace
                </p>
              </div>

              <div className="signin-divider-line" />

              {/* Error & Success Alerts */}
              {errorMsg && (
                <div className="login-alert-box error" role="alert" id="admin-login-error">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="login-alert-box success" role="alert" id="admin-login-success">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form className="login-form" onSubmit={handleSubmit} noValidate autoComplete="off">
                {/* Input: Admin Email / Username */}
                <div className="form-field-group">
                  <label htmlFor="admin-email" className="field-label">
                    Official Email or Distributor ID
                  </label>
                  <div className="input-wrap">
                    <Mail size={17} className="input-icon" />
                    <input
                      id="admin-email"
                      name="admin_account_id"
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. DIST-635002 or selva.hub@atomy.in"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      disabled={isLoading}
                      className="login-input"
                      required
                    />
                  </div>
                </div>

                {/* Input: Password */}
                <div className="form-field-group">
                  <div className="field-label-row">
                    <label htmlFor="admin-password" className="field-label">
                      Security Password
                    </label>
                  </div>
                  <div className="input-wrap">
                    <Lock size={17} className="input-icon" />
                    <input
                      id="admin-password"
                      name="admin_account_pwd"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Enter administrator password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="login-input"
                      required
                    />
                    <button
                      type="button"
                      id="btn-toggle-password-visibility"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Keep session active checkbox & Forgot Password */}
                <div className="form-row-options">
                  <label className="checkbox-label" htmlFor="check-remember-me">
                    <input
                      id="check-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="checkbox-custom" />
                    <span className="checkbox-text">Keep session active</span>
                  </label>

                  <button
                    type="button"
                    className="btn-forgot-password-link"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setForgotIdentifier(emailOrUsername.trim());
                      setForgotStep(1);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="btn-admin-login-submit"
                  className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="submit-spinner" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Console</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Forgot Password Flow for Distributor & Substitute */
            <div className="admin-forgot-password-flow">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#08267e', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Sign In</span>
                </button>
                <span className="admin-pill-badge" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                  BREVO 2FA
                </span>
              </div>

              <div className="login-header-group" style={{ marginBottom: '16px' }}>
                <h2 className="login-title" style={{ fontSize: '20px' }}>
                  {forgotStep === 3 ? 'Password Updated' : 'Reset Console Password'}
                </h2>
                <p className="login-subtitle">
                  {forgotStep === 1 && 'Enter your registered official email or Distributor ID to receive a 6-digit OTP verification code.'}
                  {forgotStep === 2 && 'Enter the 6-digit verification code sent via Brevo email and choose a new password.'}
                  {forgotStep === 3 && 'Your console credentials have been securely updated.'}
                </p>
              </div>

              <div className="signin-divider-line" />

              {forgotError && (
                <div className="login-alert-box error" role="alert" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && forgotStep !== 3 && (
                <div className="login-alert-box success" role="alert" style={{ marginBottom: '16px' }}>
                  <CheckCircle2 size={16} />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {/* Step 1: Enter email or Distributor ID */}
              {forgotStep === 1 && (
                <form className="login-form" onSubmit={handleRequestOtp} noValidate>
                  <div className="form-field-group">
                    <label className="field-label">
                      Registered Email or Distributor ID
                    </label>
                    <div className="input-wrap">
                      <Mail size={17} className="input-icon" />
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. DIST-635002, selva.hub@atomy.in, subdistributor@gmail.com"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        disabled={forgotLoading}
                        className="login-input"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`login-submit-btn ${forgotLoading ? 'loading' : ''}`}
                    disabled={forgotLoading || !forgotIdentifier.trim()}
                  >
                    {forgotLoading ? (
                      <>
                        <div className="submit-spinner" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Enter OTP & New Password */}
              {forgotStep === 2 && (
                <form className="login-form" onSubmit={handleResetPasswordSubmit} noValidate>
                  <div className="form-field-group">
                    <label className="field-label" style={{ textAlign: 'center', display: 'block' }}>
                      6-Digit Verification Code (OTP)
                    </label>
                    <div className="input-wrap" style={{ justifyContent: 'center' }}>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="• • • • • •"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={forgotLoading}
                        className="login-input"
                        style={{ letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', paddingLeft: '14px' }}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="field-label">New Security Password</label>
                    <div className="input-wrap">
                      <Lock size={17} className="input-icon" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        placeholder="New password (min 6 characters)"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        disabled={forgotLoading}
                        className="login-input"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        tabIndex={-1}
                      >
                        {showForgotNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="field-label">Confirm New Password</label>
                    <div className="input-wrap">
                      <Lock size={17} className="input-icon" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        disabled={forgotLoading}
                        className="login-input"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`login-submit-btn ${forgotLoading ? 'loading' : ''}`}
                    disabled={forgotLoading || forgotOtp.length !== 6 || forgotNewPassword.length < 6}
                  >
                    {forgotLoading ? (
                      <>
                        <div className="submit-spinner" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Console Password</span>
                        <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      Change email/ID
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={resendCooldown > 0 || forgotLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendCooldown > 0 ? '#94a3b8' : '#00A3E0',
                        fontWeight: '600',
                        cursor: resendCooldown > 0 ? 'default' : 'pointer',
                        padding: 0
                      }}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Success Confirmation */}
              {forgotStep === 3 && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: '60px', height: '60px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ShieldCheck size={34} color="#16a34a" />
                  </div>
                  <h3 style={{ color: '#0f172a', margin: '0 0 8px', fontSize: '18px' }}>Console Password Reset!</h3>
                  <p style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.6, margin: '0 0 20px' }}>
                    Your password has been securely updated in the database. A confirmation email has been dispatched via Brevo.
                  </p>
                  <button
                    type="button"
                    className="login-submit-btn"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setEmailOrUsername(forgotIdentifier || forgotEmail);
                      setPassword('');
                      setForgotStep(1);
                      setErrorMsg('');
                      setSuccessMsg('Password updated! Please sign in with your new password.');
                    }}
                  >
                    <span>Sign In with New Password</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Card Footer Security Badges */}
          <div className="login-card-footer">
            <div className="security-badge-item">
              <ShieldCheck size={14} />
              <span>TLS 256-Bit Encrypted</span>
            </div>
            <div className="security-badge-divider">•</div>
            <div className="security-badge-item">
              <Building2 size={14} />
              <span>Gurugram HQ Node</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="login-legal-text">
          Authorized personnel only. All access attempts, session timestamps, and administrative actions are logged in compliance with Atomy India Enterprise IT Policy.
        </p>
      </main>
    </div>
  );
}

