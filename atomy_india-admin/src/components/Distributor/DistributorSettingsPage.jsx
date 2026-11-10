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
  LogOut,
  Users,
  Calendar,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { fetchHubTeam, updateHubLeaveStatus } from '../../services/distributorService';
import '../Admin/AdminDashboard.css';

export default function DistributorSettingsPage({ distributor, onSaveSettings, onLogout }) {
  const [hubAddress, setHubAddress] = useState(distributor?.hubAddress || '');
  const [contactPerson, setContactPerson] = useState(distributor?.contactPerson || '');
  const [phone, setPhone] = useState(distributor?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sign out confirmation modal state
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Model 1: Team & Delegation State
  const [teamData, setTeamData] = useState(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isOnLeave, setIsOnLeave] = useState(Boolean(distributor?.onLeave || distributor?.status === 'ON_LEAVE'));
  const [selectedDelegatee, setSelectedDelegatee] = useState(distributor?.delegatedToName || '');
  const [isUpdatingLeave, setIsUpdatingLeave] = useState(false);

  // Leave Reason State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReasonCategory, setLeaveReasonCategory] = useState('Personal / Family Leave');
  const [leaveReasonNotes, setLeaveReasonNotes] = useState('');
  const [currentLeaveReason, setCurrentLeaveReason] = useState(distributor?.leaveReason || '');

  useEffect(() => {
    if (distributor) {
      setHubAddress(distributor.hubAddress || '');
      setContactPerson(distributor.contactPerson || '');
      setPhone(distributor.phone || '');
      setIsOnLeave(Boolean(distributor.onLeave || distributor.status === 'ON_LEAVE'));
      setSelectedDelegatee(distributor.delegatedToName || '');
      setCurrentLeaveReason(distributor.leaveReason || '');

      loadTeam();
    }
  }, [distributor]);

  const loadTeam = async () => {
    if (!distributor?.distributorId) return;
    setIsLoadingTeam(true);
    try {
      const data = await fetchHubTeam(distributor.distributorId);
      setTeamData(data);
      if (data?.coManagers?.length > 0 && !selectedDelegatee) {
        setSelectedDelegatee(data.coManagers[0].contactPerson || data.coManagers[0].businessName);
      }
    } catch (err) {
      console.warn('Failed to fetch hub team:', err.message);
      // Fallback local co-manager state if backend is sleeping
      setTeamData({
        effectiveHubId: distributor.effectiveHubId || distributor.distributorId,
        primaryManager: {
          distributorId: distributor.effectiveHubId || 'DIST-635002',
          businessName: distributor.businessName || 'Selva Regional Hub',
          contactPerson: distributor.contactPerson || 'Selva Kumar',
          email: distributor.email || 'selvakumarc029@gmail.com',
          phone: distributor.phone || '+91 95388 53454',
          distributorRole: 'PRIMARY_MANAGER'
        },
        coManagers: [
          {
            distributorId: (distributor.effectiveHubId || 'DIST-635002') + '-SUB1',
            businessName: (distributor.businessName || 'Regional Hub') + ' (Co-Manager)',
            contactPerson: 'Hub Co-Manager',
            email: 'subdistributor@gmail.com',
            phone: '+91 98400 12345',
            distributorRole: 'SUB_DISTRIBUTOR'
          }
        ]
      });
    } finally {
      setIsLoadingTeam(false);
    }
  };

  // Called when primary clicks the button on the card
  const handleToggleLeave = () => {
    if (isOnLeave) {
      // Resume active duty directly
      handleResumeActiveDuty();
    } else {
      // Open modal to specify the reason for taking leave
      setShowLeaveModal(true);
    }
  };

  // Confirm taking leave with reason
  const handleConfirmTakeLeave = async (e) => {
    if (e) e.preventDefault();
    setIsUpdatingLeave(true);
    const effectiveReason = leaveReasonNotes.trim()
      ? `${leaveReasonCategory}: ${leaveReasonNotes.trim()}`
      : leaveReasonCategory;

    try {
      await updateHubLeaveStatus(distributor.distributorId, {
        onLeave: true,
        delegatedToId: teamData?.coManagers?.[0]?.distributorId || 'SUB-1',
        delegatedToName: selectedDelegatee || 'Hub Co-Manager',
        leaveReason: effectiveReason
      });

      setIsOnLeave(true);
      setCurrentLeaveReason(effectiveReason);
      setShowLeaveModal(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({
          type: 'HUB_HANDOVER_STATUS_CHANGED',
          onLeave: true,
          primaryName: distributor?.contactPerson || distributor?.businessName,
          hubId: distributor?.effectiveHubId || distributor?.distributorId,
          leaveReason: effectiveReason
        });
      } catch (e) {}

      if (onSaveSettings) onSaveSettings();
    } catch (err) {
      setErrorMsg('Failed to update leave status: ' + err.message);
    } finally {
      setIsUpdatingLeave(false);
    }
  };

  // Resume active duty (end leave)
  const handleResumeActiveDuty = async () => {
    setIsUpdatingLeave(true);
    try {
      await updateHubLeaveStatus(distributor.distributorId, {
        onLeave: false,
        delegatedToId: null,
        delegatedToName: null,
        leaveReason: null
      });

      setIsOnLeave(false);
      setCurrentLeaveReason('');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({
          type: 'HUB_HANDOVER_STATUS_CHANGED',
          onLeave: false,
          primaryName: distributor?.contactPerson || distributor?.businessName,
          hubId: distributor?.effectiveHubId || distributor?.distributorId,
          leaveReason: null
        });
      } catch (e) {}

      if (onSaveSettings) onSaveSettings();
    } catch (err) {
      setErrorMsg('Failed to update leave status: ' + err.message);
    } finally {
      setIsUpdatingLeave(false);
    }
  };

  const isSubDistributor = distributor?.distributorRole === 'SUB_DISTRIBUTOR';
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
          <h2 className="content-title">
            {isSubDistributor ? 'Personal Profile Settings' : 'Regional Hub Settings & Partner Profile'}
          </h2>
          <p className="content-subtitle">
            {isSubDistributor 
              ? `Manage your personal contact credentials, phone, and console password as Temporary Substitute for ${distributor?.parentHubName || 'Regional Hub'}.`
              : 'Manage your regional fulfillment center details, contact coordinates, security credentials, and view authorized territory PIN codes.'}
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
        {/* Left Column: Profile Form */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <Building2 size={20} color="#00A3E0" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              {isSubDistributor ? 'My Personal Profile Coordinates' : 'Fulfillment Hub Profile Coordinates'}
            </h3>
          </div>

          <form onSubmit={handleSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {!isSubDistributor && (
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
            )}

            <div className="settings-fields-row">
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  {isSubDistributor ? 'Substitute ID' : 'Distributor ID'}
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
                  {isSubDistributor ? 'Login Email (Account ID)' : 'Primary PIN Code'}
                </label>
                <input
                  type="text"
                  disabled
                  value={isSubDistributor ? (distributor?.email || '') : (distributor?.primaryPincode || '')}
                  style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', color: isSubDistributor ? '#334155' : '#00A3E0', boxSizing: 'border-box', fontWeight: 600 }}
                />
              </div>
            </div>

            <div className="settings-fields-row">
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  {isSubDistributor ? 'Full Name *' : 'Contact Representative *'}
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
                  {isSubDistributor ? 'Contact Phone Number *' : 'Dispatch Phone Number *'}
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

            {!isSubDistributor && (
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
            )}

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
                <span>{isSubDistributor ? 'Save Profile Settings' : 'Save Hub Profile'}</span>
              </button>
            </div>
          </form>

          {/* Account Session & Sign Out - Positioned directly under Personal Details */}
          {onLogout && (
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '10px',
                padding: '16px 18px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                    <LogOut size={16} color="#dc2626" />
                    <span>Hub Account Session</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '380px', lineHeight: 1.4 }}>
                    Terminate current session and sign out of this Regional Logistics Hub console.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSignOutModal(true)}
                  style={{
                    padding: '9px 18px',
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Authorized Territory Coverage & Model 1 Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {isSubDistributor ? (
            /* Locked Hub Information for Temporary Substitute */
            <div className="admin-card" style={{ padding: '24px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Building2 size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Assigned Regional Hub Details (Locked)
                </h3>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ fontSize: '13.5px', marginBottom: '8px', color: '#1e293b' }}>
                  <strong>Parent Franchise:</strong> {distributor?.parentHubName || 'Regional Logistics Hub'}
                </div>
                <div style={{ fontSize: '13.5px', marginBottom: '8px', color: '#1e293b' }}>
                  <strong>Territory PIN Code:</strong> <span style={{ color: '#0284c7', fontWeight: 700 }}>{distributor?.primaryPincode}</span>
                </div>
                <div style={{ fontSize: '13.5px', marginBottom: '8px', color: '#1e293b' }}>
                  <strong>Operational Role:</strong> Temporary Substitute (Standby Relief Manager)
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.45 }}>
                  <strong>Warehouse Depot Address:</strong> {distributor?.hubAddress || 'Official Regional Depot'}
                </div>
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 14px', borderRadius: '8px', fontSize: '12.5px', color: '#047857', lineHeight: 1.5 }}>
                ✓ <strong>Shared Hub Franchise:</strong> When the Primary Distributor is on leave, you take full command of this hub's stock, orders, and pickups. The depot address, commission rates, and territory licenses are managed by the Primary Hub owner.
              </div>
            </div>
          ) : (
            <>
              {/* Model 1: Operational Status & Leave Delegation */}
              <div className="admin-card" style={{ padding: '24px', borderLeft: isOnLeave ? '4px solid #f59e0b' : '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color={isOnLeave ? '#d97706' : '#059669'} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Operational Status &amp; Leave Delegation
                </h3>
              </div>
              <span style={{
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background: isOnLeave ? '#fef3c7' : '#dcfce7',
                color: isOnLeave ? '#b45309' : '#15803d',
                border: isOnLeave ? '1px solid #fde68a' : '1px solid #bbf7d0'
              }}>
                {isOnLeave ? '🌴 ON LEAVE' : '🟢 ACTIVE DUTY'}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 14px' }}>
              {isOnLeave 
                ? `Hub operations are currently delegated to ${selectedDelegatee || 'Co-Manager'}. Dispatches and customer pickups are being fulfilled under shared stock.`
                : 'Primary manager is on active duty. Dispatches and pickups are running normally under SLA.'}
            </p>

            {isOnLeave && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '11px 14px', borderRadius: '8px', fontSize: '13px', color: '#92400e', marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🌴 Stated Reason for Leave:</span>
                </div>
                <div style={{ color: '#78350f', fontWeight: 600 }}>
                  {currentLeaveReason || distributor?.leaveReason || 'Personal / Family Leave'}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teamData?.coManagers && teamData.coManagers.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Designated Co-Manager / Standby Delegate
                  </label>
                  <select
                    value={selectedDelegatee}
                    onChange={(e) => setSelectedDelegatee(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {teamData.coManagers.map(c => (
                      <option key={c.distributorId} value={c.contactPerson || c.businessName}>
                        {c.contactPerson || c.businessName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={handleToggleLeave}
                disabled={isUpdatingLeave}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isOnLeave ? '#10b981' : '#f59e0b',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                {isUpdatingLeave ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : isOnLeave ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Resume Active Duty (End Leave)</span>
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    <span>Take Leave &amp; Delegate Hub to Co-Manager</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Model 1: Hub Co-Managers & Shared Staff */}
          <div className="admin-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Users size={20} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Hub Co-Managers (Model 1: Shared Hub)
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
              Authorized managers who share the <strong>exact same physical inventory</strong>, customer directory, and order queues for PIN <strong>{distributor?.primaryPincode}</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Primary Manager */}
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      {teamData?.primaryManager?.contactPerson || distributor?.contactPerson || 'Primary Manager'}
                    </span>
                    <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      PRIMARY FRANCHISE
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {teamData?.primaryManager?.email || distributor?.email}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>Hub Owner</span>
              </div>

              {/* Co-Managers */}
              {teamData?.coManagers && teamData.coManagers.length > 0 ? (
                teamData.coManagers.map(sub => (
                  <div key={sub.distributorId} style={{ padding: '10px 14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#065f46' }}>
                          {sub.contactPerson || sub.businessName}
                        </span>
                        <span style={{ fontSize: '10.5px', background: '#d1fae5', color: '#047857', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          CO-MANAGER
                        </span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#047857' }}>
                        {sub.email} &bull; {sub.phone}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>Shared Stock</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                  No auxiliary co-managers onboarded for this PIN yet. The Super Admin can invite a Co-Manager under Model 1 via <em>Invite &amp; Onboard</em>.
                </div>
              )}
            </div>
          </div>
        </>
      )}

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

        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                flexShrink: 0
              }}>
                <LogOut size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Confirm Sign Out
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Regional Hub Logistics Console
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Are you sure you want to sign out? You will need to log back in with your PIN credentials to access hub inventory and orders.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutModal(false);
                  if (onLogout) onLogout();
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
                }}
              >
                <LogOut size={15} />
                <span>Yes, Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take Leave & Reason Modal */}
      {showLeaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                flexShrink: 0
              }}>
                <Calendar size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Specify Reason for Taking Leave
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Handover Hub to Co-Manager ({selectedDelegatee || 'Designated Co-Manager'})
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              When you take leave, hub dispatch authority and live order alerts will immediately unlock for your Co-Manager. Please specify the reason for record and compliance:
            </p>

            <form onSubmit={handleConfirmTakeLeave}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Leave Category *
                </label>
                <select
                  value={leaveReasonCategory}
                  onChange={(e) => setLeaveReasonCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    background: '#f8fafc',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Personal / Family Leave">🌴 Personal / Family Leave</option>
                  <option value="Medical / Health Emergency">🏥 Medical / Health Emergency</option>
                  <option value="Vacation / Scheduled Time Off">✈️ Vacation / Scheduled Time Off</option>
                  <option value="Official Atomy Training & Conferences">🎓 Official Atomy Training &amp; Conferences</option>
                  <option value="Facility / Depot Maintenance">🛠️ Facility / Depot Maintenance</option>
                  <option value="Urgent Travel">🚗 Urgent Travel / Out of Station</option>
                  <option value="Other Operational Reason">📋 Other Operational Reason</option>
                </select>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Additional Notes / Specific Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  value={leaveReasonNotes}
                  onChange={(e) => setLeaveReasonNotes(e.target.value)}
                  placeholder="e.g. Attending Atomy India regional leadership summit in Chennai from 11th to 14th Nov..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingLeave}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#f59e0b',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
                  }}
                >
                  {isUpdatingLeave ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Calendar size={15} />
                  )}
                  <span>Confirm &amp; Delegate Hub</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
