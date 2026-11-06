import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  User,
  KeyRound,
  Check,
  LogOut
} from 'lucide-react';
import '../Admin/AdminDashboard.css';

export default function DistributorSettingsPage({ distributor, onSaveSettings, onLogout }) {
  const [hubAddress, setHubAddress] = useState(distributor?.hubAddress || '');
  const [contactPerson, setContactPerson] = useState(distributor?.contactPerson || '');
  const [phone, setPhone] = useState(distributor?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (distributor) {
      setHubAddress(distributor.hubAddress || '');
      setContactPerson(distributor.contactPerson || '');
      setPhone(distributor.phone || '');
    }
  }, [distributor]);

  const assignedPins = distributor?.assignedPincodes || [distributor?.primaryPincode].filter(Boolean);

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg('');

    if (onSaveSettings) {
      onSaveSettings({
        hubAddress,
        contactPerson,
        phone,
        password: newPassword.trim() || undefined
      });
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="admin-tab-content distributor-settings-tab">
      {/* 1. Content Heading Row */}
      <div className="content-heading-row with-filter">
        <div>
          <h2 className="content-title">Regional Hub Settings &amp; Partner Profile</h2>
          <p className="content-subtitle">
            Manage your regional fulfillment center details, contact coordinates, security credentials, and view authorized territory PIN codes.
          </p>
        </div>
      </div>

      {/* 2. Success Alert */}
      {isSaved && (
        <div style={{
          padding: '14px 18px',
          background: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          color: '#15803d',
          fontSize: '13.5px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <CheckCircle2 size={18} />
          <span>Regional Hub profile and contact settings updated successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '14px 18px',
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '10px',
          color: '#dc2626',
          fontSize: '13.5px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3. Split Two Column Cards */}
      <div className="settings-grid-layout">
        {/* Left Column: Hub Profile Form */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <Building2 size={20} color="#00A3E0" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Fulfillment Hub Profile Coordinates
            </h3>
          </div>

          <form onSubmit={handleSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Business Legal Enterprise Name
              </label>
              <input
                type="text"
                disabled
                value={distributor?.businessName || ''}
                style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', color: '#64748b', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Verified enterprise distributor name registered with Atomy India Headquarters.
              </span>
            </div>

            <div className="settings-fields-row">
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Distributor ID
                </label>
                <input
                  type="text"
                  disabled
                  value={distributor?.distributorId || ''}
                  style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', color: '#64748b', boxSizing: 'border-box', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Primary PIN Code
                </label>
                <input
                  type="text"
                  disabled
                  value={distributor?.primaryPincode || ''}
                  style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', color: '#00A3E0', boxSizing: 'border-box', fontWeight: 700 }}
                />
              </div>
            </div>

            <div className="settings-fields-row">
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Contact Representative
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Dispatch Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Official Hub Dispatch Address
              </label>
              <textarea
                rows={3}
                required
                value={hubAddress}
                onChange={(e) => setHubAddress(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                placeholder="Physical warehouse or depot address where local couriers pick up dispatches"
              />
            </div>

            {/* Password Update Subsection */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px', marginTop: '6px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={16} color="#64748b" />
                <span>Security &amp; Console Password</span>
              </div>
              <div className="settings-fields-row">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="submit"
                className="quick-action-pill-btn"
                style={{ padding: '10px 22px', fontSize: '14px', background: '#00A3E0', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
              >
                <Save size={16} />
                <span>Save Hub Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Authorized Territory Coverage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card: Managed Territory PINs */}
          <div className="admin-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <MapPin size={20} color="#00A3E0" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Authorized PIN Code Zone
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 16px' }}>
              Your Regional Hub is the exclusive fulfillment center for all consumer orders placed in your assigned Indian postal territory:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  border: '1px solid #bae6fd'
                }}
              >
                <MapPin size={15} color="#0284c7" />
                <span>PIN: {distributor?.primaryPincode || '110001'} ({distributor?.city || 'Regional Hub'}, {distributor?.state || 'India'})</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                Territory expansions or additional PIN code assignments must be approved by the Atomy India Super Administrator.
              </span>
            </div>
          </div>

          {/* Card: Verification Badge */}
          <div className="admin-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldCheck size={20} color="#16a34a" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Verified Partner Status
              </h3>
            </div>
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              This account holds verified Regional Logistics Distributor status under Atomy India. Commission payouts are automatically credited per delivery confirmation.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', color: '#16a34a', fontWeight: 700, fontSize: '13px' }}>
              <CheckCircle2 size={16} />
              <span>Full SLA Dispatch Clearance Active</span>
            </div>
          </div>

          {/* Card: Account Session & Sign Out */}
          {onLogout && (
            <div className="admin-card settings-logout-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <LogOut size={22} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>
                  Hub Account Session
                </h3>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                Terminate current session and sign out of this Regional Logistics Hub console. You can sign back in anytime using your authorized PIN credentials.
              </p>
              <button
                type="button"
                onClick={onLogout}
                className="settings-logout-btn"
              >
                <LogOut size={16} />
                <span>Sign Out from Hub Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
