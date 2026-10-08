import React, { useState, useEffect } from 'react';
import { Check, X, User, Mail } from 'lucide-react';
import { clearAdSuppressionForLogin } from '../../services/adPromotionService';
import './SignInPage.css';

export default function SignInPage({
  initialMode = 'signin',
  onNavigateHome,
  onLoginSuccess
}) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveId, setSaveId] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Google OAuth Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [isCustomGoogleInput, setIsCustomGoogleInput] = useState(false);

  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);

  // Load saved ID if present
  useEffect(() => {
    const saved = localStorage.getItem('atomy_saved_id');
    if (saved && !isSignUp) {
      setUsername(saved);
      setSaveId(true);
    }
  }, [isSignUp]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSignUp) {
      if (!fullName.trim() || !email.trim() || !username.trim() || !password) {
        setErrorMessage('Please fill in all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    } else {
      if (!username.trim() || !password) {
        setErrorMessage('Please enter your ID and password.');
        return;
      }
    }

    setSubmitted(true);
    if (saveId) {
      localStorage.setItem('atomy_saved_id', username.trim());
    } else {
      localStorage.removeItem('atomy_saved_id');
    }

    // Always clear ad suppression so the promotional ad pops up on login or signup!
    clearAdSuppressionForLogin();

    const userData = isSignUp
      ? {
        name: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        role: 'customer'
      }
      : {
        name: username.trim(),
        username: username.trim(),
        email: `${username.trim().toLowerCase().replace(/\s+/g, '')}@atomy.in`,
        role: 'customer'
      };

    setTimeout(() => {
      onLoginSuccess && onLoginSuccess(userData, isSignUp);
    }, 500);
  };

  const handleGoogleAccountSelect = (googleUser) => {
    setIsGoogleModalOpen(false);
    clearAdSuppressionForLogin();
    localStorage.setItem('atomy_saved_id', googleUser.name);

    const userData = {
      name: googleUser.name,
      email: googleUser.email,
      username: googleUser.email.split('@')[0],
      role: 'customer'
    };

    setTimeout(() => {
      onLoginSuccess && onLoginSuccess(userData, isSignUp);
    }, 400);
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const derivedName = customGoogleEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    handleGoogleAccountSelect({
      name: formattedName,
      email: customGoogleEmail.trim()
    });
  };

  return (
    <div className="atomy-signin-wrapper">
      <div className="signin-inner-container">
        {/* Atomy Blue Brand Logo */}
        <div className="signin-logo-wrap">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome && onNavigateHome();
            }}
            aria-label="Atomy Home"
            title="Return to Shopping Mall"
          >
            <svg
              viewBox="0 0 103 52"
              height="58"
              width="116"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="signin-atomy-logo"
            >
              <g fill="#00A3E0">
                <path d="M25.04 44.771h-3.2l1.397-4.983h.393l1.41 4.983Zm-.91-6.456h-1.945l-3.47 11.595h1.13a.716.716 0 0 0 .724-.564l.87-3.125h4.022l1.04 3.683h1.628l-3.256-11a.738.738 0 0 0-.735-.58M32.125 39.44a.38.38 0 0 0 .416.42h2.716v10.05h1.13a.39.39 0 0 0 .433-.435V39.86h2.741a.382.382 0 0 0 .418-.42v-1.043h-7.854v1.043ZM53.256 44.083c0 2.939-1.06 4.43-3.148 4.43-2.089 0-3.174-1.491-3.174-4.43 0-2.939 1.068-4.43 3.174-4.43 2.105 0 3.148 1.488 3.148 4.43Zm-3.148-5.923c-3.08 0-4.711 2.045-4.711 5.923s1.63 5.923 4.71 5.923c2.146 0 4.698-1.027 4.698-5.923s-2.544-5.923-4.697-5.923ZM68.141 39.108l-2.294 6.848-.074.248-.073-.257-2.567-7.084a.736.736 0 0 0-.709-.548H60.78v11.598h1.105a.397.397 0 0 0 .433-.437v-8.972l.155.502 2.66 7.333.025.07h.684a.77.77 0 0 0 .777-.563l2.32-6.848.145-.469v9.384h1.13a.391.391 0 0 0 .416-.437v-11.16h-1.442c-.565 0-.865.228-1.048.792M84.246 38.315c-.529 0-.766.158-1.015.674l-2.295 4.674-2.614-5.289-.031-.059H76.55l3.606 7.096v4.499h1.187c.147 0 .39-.056.39-.437v-3.179a3.097 3.097 0 0 1 .367-1.57l3.222-6.414-1.076.005ZM9.999 11.18c4.587 0 6.218 4.699 6.218 8.681 0 3.982-1.62 8.695-6.218 8.695s-6.218-4.701-6.218-8.695c0-3.994 1.614-8.681 6.218-8.681Zm.09 21.037c5.088 0 6.34-3.68 6.34-3.68v1.996c0 1.129.847 1.693 1.769 1.693.729 0 1.769-.333 1.769-1.693V8.943c0-1.43-1.04-1.765-1.77-1.765-.776 0-1.768.335-1.768 1.765v1.495s-1.58-3.26-6.34-3.26C3.623 7.178 0 13.208 0 19.695c0 6.487 3.623 12.522 10.09 12.522ZM23.084 10.672h2.721v19.864c0 .98.738 1.693 1.9 1.693 1.161 0 1.896-.694 1.896-1.693V10.672h2.736c1.246 0 1.893-.643 1.893-1.748 0-1.106-.647-1.743-1.893-1.743H29.6V1.907c0-.847-.172-1.907-1.896-1.907-1.611 0-1.9 1.08-1.9 1.907V7.18h-2.721c-1.258 0-1.896.634-1.896 1.743 0 1.108.638 1.748 1.896 1.748Z" />
                <path d="M42.738 10.923c4.651 0 6.288 4.795 6.288 8.845 0 4.05-1.637 8.856-6.288 8.856-4.652 0-6.314-4.78-6.314-8.842 0-4.061 1.642-8.859 6.314-8.859Zm0 21.294c6.463 0 10.089-6.024 10.089-12.522S49.187 7.18 42.737 7.18c-6.449 0-10.097 6.027-10.097 12.514 0 6.487 3.629 12.522 10.098 12.522ZM100.956 28.624c-4.872 0-6.217-2.417-6.43-2.764h6.035s1.695.141 1.695-1.808c0-1.895-1.695-1.816-1.695-1.816h-7.385v-1.272h7.436s1.806.133 1.806-1.692-1.806-1.718-1.806-1.718h-7.436v-1.128h6.5s1.696.122 1.696-1.58c0-1.658-1.696-1.576-1.696-1.576h-6.5v-1.173h8.131s1.696.14 1.696-1.808c0-1.895-1.696-1.82-1.696-1.82h-4.222s1.808-1.821.55-2.95c-1.257-1.127-2.308.201-2.308.201L92.84 8.47H90.06L87.57 5.72s-1.074-1.303-2.3-.2c-1.227 1.102.55 2.95.55 2.95h-4.222s-1.696-.076-1.696 1.819c0 1.949 1.696 1.808 1.696 1.808h8.128v1.179h-6.5s-1.696-.082-1.696 1.576c0 1.693 1.696 1.58 1.696 1.58h6.5v1.128h-7.421s-1.806-.079-1.806 1.718c0 1.796 1.806 1.692 1.806 1.692h7.43v1.272H82.34s-1.695-.08-1.695 1.816c0 1.95 1.695 1.808 1.695 1.808h6.026c-.212.347-1.549 2.764-6.424 2.764-2.038 0-2.15 1.388-1.978 2.256a1.732 1.732 0 0 0 1.718 1.306s6.412.449 9.773-4.306c3.363 4.755 9.767 4.306 9.767 4.306a1.719 1.719 0 0 0 1.724-1.291c.164-.878.051-2.257-1.978-2.257M78.081 12.771c0-3.384-3.258-5.502-6.243-5.502-2.515 0-4.683 1.049-5.612 2.538-.732-1.5-2.434-2.538-4.418-2.538a5.045 5.045 0 0 0-3.937 1.796c0-1.362-.52-1.873-1.548-1.873-1.196 0-1.696.548-1.696 1.975v21.378a1.69 1.69 0 0 0 1.129 1.6c.22.077.453.109.685.092 1.88 0 1.81-1.692 1.81-1.692V14.393c0-.59.208-2.713 3.153-2.713 2.787 0 3.123 1.709 3.123 2.713v16.141s-.045 1.692 1.82 1.692c1.908 0 1.806-1.692 1.806-1.692V14.393c0-1.275.743-2.713 3.134-2.713 2.886 0 3.149 1.709 3.149 2.713v16.141s-.082 1.692 1.82 1.692c1.947 0 1.814-1.692 1.814-1.692l.011-17.763Z" />
              </g>
            </svg>
          </a>
        </div>

        {/* White Card Container */}
        <div className="signin-card">
          {/* Card Header Title - overrides cleanly based on state */}
          <div className="auth-card-header">
            <h2 className="signin-title">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            <p className="signin-subtitle">
              {isSignUp
                ? 'Create a customer account to shop Atomy products'
                : 'Welcome back! Enter your Customer ID & Password to sign in'}
            </p>
          </div>
          <div className="signin-divider-line"></div>

          {/* Centered Content Block */}
          <div className="signin-content-center">
            {errorMessage && (
              <div className="auth-error-banner" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '14px' }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="signin-form">
              {isSignUp && (
                <div className="form-input-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="signin-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              {isSignUp && (
                <div className="form-input-group">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="signin-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-input-group">
                <input
                  type="text"
                  placeholder={isSignUp ? "Choose Username / Customer ID" : "ID / Username"}
                  className="signin-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-input-group">
                <input
                  type="password"
                  placeholder="Password"
                  className="signin-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                />
              </div>

              {isSignUp && (
                <div className="form-input-group">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="signin-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className={`signin-submit-btn ${username.trim() && password ? 'active' : ''}`}
                disabled={submitted}
              >
                {submitted
                  ? (isSignUp ? 'Creating Account...' : 'Signing in...')
                  : (isSignUp ? 'Sign Up (Create Account)' : 'Sign In')}
              </button>

              {!isSignUp && (
                <div
                  className="save-id-container"
                  onClick={() => setSaveId(!saveId)}
                >
                  <div className={`custom-round-checkbox ${saveId ? 'checked' : ''}`}>
                    {saveId && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span className="save-id-label">Remember ID</span>
                </div>
              )}
            </form>

            {/* Customer Switch Prompt - Overrides and toggles between Sign In and Sign Up */}
            <div className="customer-mode-prompt" style={{ textAlign: 'center', marginTop: '20px', fontSize: '13.5px', color: '#64748b' }}>
              {!isSignUp ? (
                <>
                  New customer?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#00A3E0', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Sign Up here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#00A3E0', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Sign In here
                  </button>
                </>
              )}
            </div>

            {/* Prominent Google Sign In Button - Placed DOWN below form as requested */}
            <div className="auth-separator-row" style={{ margin: '22px 0 16px' }}>
              <span className="auth-separator-line"></span>
              <span className="auth-separator-text">or continue with</span>
              <span className="auth-separator-line"></span>
            </div>

            <button
              type="button"
              className="google-signin-prominent-btn"
              onClick={() => setIsGoogleModalOpen(true)}
              aria-label={isSignUp ? "Sign up with Google" : "Continue with Google"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>

            {/* Bottom Customer Support Links */}
            {!isSignUp && (
              <div className="signin-footer-links" style={{ marginTop: '20px' }}>
                <a href="#find-id" className="sub-link">Find ID</a>
                <span className="link-divider">|</span>
                <a href="#find-password" className="sub-link">Forgot Password</a>
                <span className="link-divider">|</span>
                <a href="#customer-help" className="sub-link">Customer Help</a>
              </div>
            )}
          </div>
        </div>

        {/* Back to Mall Return Link */}
        <div className="signin-bottom-return">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome && onNavigateHome();
            }}
          >
            ← Return to Atomy Shopping Mall
          </a>
        </div>
      </div>

      {/* Google Sign In Account Chooser Modal */}
      {isGoogleModalOpen && (
        <div className="google-oauth-overlay" onClick={() => setIsGoogleModalOpen(false)}>
          <div className="google-oauth-card animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="google-oauth-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  Sign in with Google
                </h3>
              </div>
              <button
                type="button"
                className="google-close-btn"
                onClick={() => setIsGoogleModalOpen(false)}
                aria-label="Close Google sign in"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '14px 0 16px', fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5 }}>
              Choose a Google account to continue to <strong>Atomy India Shopping Mall</strong>:
            </p>

            <div className="google-accounts-list">
              <button
                type="button"
                className="google-account-item"
                onClick={() => handleGoogleAccountSelect({ name: 'Alex Verma', email: 'alex.verma@gmail.com' })}
              >
                <div className="google-avatar-circle" style={{ background: '#0284c7' }}>
                  A
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>Alex Verma</div>
                  <div style={{ color: '#6b7280', fontSize: '12.5px' }}>alex.verma@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                className="google-account-item"
                onClick={() => handleGoogleAccountSelect({ name: 'Naveen Kumar', email: 'naveen.atomy@gmail.com' })}
              >
                <div className="google-avatar-circle" style={{ background: '#7c3aed' }}>
                  N
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>Naveen Kumar</div>
                  <div style={{ color: '#6b7280', fontSize: '12.5px' }}>naveen.atomy@gmail.com</div>
                </div>
              </button>

              {!isCustomGoogleInput ? (
                <button
                  type="button"
                  className="google-account-item custom-choice"
                  onClick={() => setIsCustomGoogleInput(true)}
                >
                  <div className="google-avatar-circle" style={{ background: '#64748b' }}>
                    <User size={16} />
                  </div>
                  <div style={{ textAlign: 'left', fontWeight: '500', color: '#374151', fontSize: '13.5px' }}>
                    Use another Google account...
                  </div>
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      placeholder="Enter your Gmail address"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="signin-input"
                      style={{ height: '40px', fontSize: '13px' }}
                      autoFocus
                      required
                    />
                    <button
                      type="submit"
                      style={{
                        background: '#00A3E0',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0 16px',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
              To continue, Google will share your name and email with Atomy India.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
