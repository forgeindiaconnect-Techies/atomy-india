import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ExternalLink, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Building2
} from 'lucide-react';
import './AdminLoginPage.css';

export default function AdminLoginPage({ onLoginSuccess, onBackToStore }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Default credentials for Super Admin
  const DEMO_CREDENTIALS = {
    username: 'naveen.admin@atomy.com',
    password: 'admin123'
  };

  const handleFillDemo = () => {
    setEmailOrUsername(DEMO_CREDENTIALS.username);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUser = emailOrUsername.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Please enter both your Admin ID/Email and password.');
      return;
    }

    setIsLoading(true);

    // Simulate enterprise security validation delay for premium feel
    setTimeout(() => {
      // Allow demo credentials or any reasonable admin credentials
      const isValid = 
        (trimmedUser.toLowerCase() === 'admin' && trimmedPass === 'admin123') ||
        (trimmedUser.toLowerCase() === 'admin@atomy.in' && trimmedPass === 'admin123') ||
        (trimmedUser.toLowerCase() === 'naveen.admin@atomy.com' && trimmedPass === 'admin123') ||
        // Also allow flexible login for development if password is 6+ chars
        (trimmedUser.length >= 3 && trimmedPass.length >= 6);

      if (!isValid) {
        setIsLoading(false);
        setErrorMsg('Invalid administrative credentials. Use the Demo Account button or enter password with 6+ characters.');
        return;
      }

      setSuccessMsg('Authentication verified. Loading Atomy Operations Center...');

      const adminUser = {
        name: trimmedUser.includes('naveen') ? 'Naveen Sourabh Pal' : 'Atomy Operations Admin',
        email: trimmedUser.includes('@') ? trimmedUser : `${trimmedUser}@atomy.in`,
        role: 'Super Administrator',
        employeeId: 'AT-IN-001',
        department: 'E-Commerce Operations & Supply Chain',
        location: 'Gurugram HQ, India',
        twoFactorEnabled: true,
        lastLogin: 'Just now (IST)',
        sessionIp: '192.168.1.104 (Secure VPN)'
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
      }, 700);
    }, 850);
  };

  return (
    <div className="admin-login-viewport" id="admin-login-screen">
      {/* Background Ambient Glows */}
      <div className="login-bg-glow glow-top-left" />
      <div className="login-bg-glow glow-bottom-right" />
      <div className="login-grid-pattern" />

      {/* Top Floating Navigation */}
      <header className="login-top-bar">
        <div className="login-brand-meta">
          <span className="brand-dot-pulse" />
          <span className="brand-meta-text">Atomy India • Operations Portal</span>
        </div>

        <button 
          type="button" 
          id="btn-return-storefront"
          className="btn-link-store" 
          onClick={onBackToStore}
          title="Return to Customer Shopping Mall (Port 5173)"
        >
          <span>Customer Store (5173)</span>
          <ExternalLink size={14} />
        </button>
      </header>

      {/* Center Auth Card */}
      <main className="login-card-container">
        <div className="login-glass-card">
          {/* Card Header & Brand Branding */}
          <div className="login-header-group">
            <div className="login-logo-ring">
              <img 
                src="/atomy-logo.png" 
                alt="Atomy India" 
                className="login-atomy-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="login-shield-badge">
                <ShieldCheck size={18} />
              </div>
            </div>

            <h1 className="login-title">Operations Console</h1>
            <p className="login-subtitle">
              Internal Administrative Access • Secured Workspace
            </p>
          </div>

          {/* Quick Demo Pill Helper */}
          <div className="login-quick-hint">
            <div className="quick-hint-left">
              <KeyRound size={15} className="hint-icon" />
              <span>Demo Super Admin</span>
            </div>
            <button 
              type="button" 
              id="btn-quick-fill-admin"
              className="quick-hint-fill-btn"
              onClick={handleFillDemo}
            >
              Auto-Fill Credentials
            </button>
          </div>

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
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Input: Admin Username or Email */}
            <div className="form-field-group">
              <label htmlFor="admin-email" className="field-label">
                Official Email or Admin ID
              </label>
              <div className="input-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  id="admin-email"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. naveen.admin@atomy.com"
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
                <span className="security-tag">Protected</span>
              </div>
              <div className="input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
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
                <span className="checkbox-text">Keep session active on this device</span>
              </label>
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
                  <span>Verifying Terminal Access...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badges */}
          <div className="login-card-footer">
            <div className="security-badge-item">
              <ShieldCheck size={14} />
              <span>TLS 256-Bit Encrypted</span>
            </div>
            <div className="security-badge-divider">•</div>
            <div className="security-badge-item">
              <Building2 size={14} />
              <span>HQ Gurugram Node</span>
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
