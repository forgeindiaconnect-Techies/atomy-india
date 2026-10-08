import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  ShieldCheck, 
  TrendingUp, 
  Gift, 
  Percent, 
  Sparkles, 
  Users, 
  Search, 
  Plus, 
  CheckCircle2, 
  Zap, 
  Calendar,
  Save,
  Check,
  X,
  CreditCard,
  UserCheck,
  UserX,
  RefreshCw,
  Clock
} from 'lucide-react';
import { 
  getMembershipSettings, 
  saveMembershipSettings, 
  getMembersRegistry, 
  saveMembersRegistry,
  addMemberToRegistry,
  updateMemberStatus,
  fetchMembersFromBackend,
  fetchMembershipSettingsFromBackend
} from '../../services/membershipService';
import './MembershipManagementPage.css';

export default function MembershipManagementPage() {
  const [settings, setSettings] = useState(getMembershipSettings);
  const [members, setMembers] = useState(getMembersRegistry);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New Member form state
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'ANNUAL'
  });

  // Load from backend MySQL database on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchMembersFromBackend(),
      fetchMembershipSettingsFromBackend()
    ]).then(([m, s]) => {
      if (m) setMembers(m);
      if (s) setSettings(s);
    }).finally(() => {
      setIsLoading(false);
    });

    const handleUpdate = () => {
      setSettings(getMembershipSettings());
      setMembers(getMembersRegistry());
    };
    window.addEventListener('atomy:membership-settings-updated', handleUpdate);
    window.addEventListener('atomy:members-registry-updated', handleUpdate);
    return () => {
      window.removeEventListener('atomy:membership-settings-updated', handleUpdate);
      window.removeEventListener('atomy:members-registry-updated', handleUpdate);
    };
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveMembershipSettings(settings);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleEnrollMemberSubmit = (e) => {
    e.preventDefault();
    if (!newMemberForm.name.trim() || !newMemberForm.email.trim()) {
      alert('Please fill in member name and email.');
      return;
    }
    const added = addMemberToRegistry(newMemberForm);
    setMembers(getMembersRegistry());
    setIsEnrollModalOpen(false);
    setNewMemberForm({ name: '', email: '', phone: '', plan: 'ANNUAL' });
  };

  const handleToggleMemberStatus = (memberId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = updateMemberStatus(memberId, newStatus);
    setMembers(updated);
  };

  const handleSyncDatabase = async () => {
    setIsLoading(true);
    try {
      const [m, s] = await Promise.all([
        fetchMembersFromBackend(),
        fetchMembershipSettingsFromBackend()
      ]);
      if (m) setMembers(m);
      if (s) setSettings(s);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2500);
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchPlan = 
      planFilter === 'ALL' || 
      (planFilter === 'MONTHLY' && m.plan === 'MONTHLY') ||
      (planFilter === 'ANNUAL' && m.plan === 'ANNUAL') ||
      (planFilter === 'ACTIVE' && m.status === 'ACTIVE') ||
      (planFilter === 'INACTIVE' && m.status === 'INACTIVE');

    const q = searchQuery.toLowerCase().trim();
    const name = (m.customerName || m.name || '').toLowerCase();
    const email = (m.customerEmail || m.email || '').toLowerCase();
    const phone = (m.customerPhone || m.phone || '');
    const id = (m.id || '').toLowerCase();
    const payId = (m.paymentId || '').toLowerCase();

    const matchSearch = !q || 
      name.includes(q) || 
      email.includes(q) || 
      id.includes(q) ||
      phone.includes(q) ||
      payId.includes(q);

    return matchPlan && matchSearch;
  });

  // Calculate KPIs
  const activeMembers = members.filter(m => m.status === 'ACTIVE');
  const annualSubscribers = activeMembers.filter(m => m.plan === 'ANNUAL').length;
  const monthlySubscribers = activeMembers.filter(m => m.plan === 'MONTHLY').length;
  const totalPvAccumulated = activeMembers.reduce((sum, m) => sum + (m.lifetimePv || 0), 0);

  return (
    <div className="membership-mgmt-container" id="admin-membership-page">
      {/* 1. Header & Actions Strip */}
      <div className="membership-page-header">
        <div>
          <div className="membership-header-badge">
            <Crown size={15} />
            <span>SINGLE-CLASS ATOMY DISTRIBUTOR MEMBERSHIP</span>
          </div>
          <h2 className="membership-page-title">Membership Management</h2>
          <p className="membership-page-subtitle">
            Single class membership model with Monthly & Annual billing plans. Active members automatically unlock wholesale 
            <strong> Distributor Price (DP)</strong> instead of MRP and earn <strong>Personal PV Points</strong> on every purchase.
          </p>
        </div>

        <div className="membership-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="membership-btn-secondary"
            onClick={handleSyncDatabase}
            disabled={isLoading}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '9px 14px', 
              borderRadius: '6px', 
              border: '1px solid #cbd5e1', 
              background: '#ffffff', 
              color: '#334155',
              cursor: 'pointer', 
              fontWeight: 600, 
              fontSize: '13px' 
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          <button 
            type="button" 
            className="membership-btn-primary"
            onClick={() => setIsEnrollModalOpen(true)}
          >
            <Plus size={16} />
            <span>Enroll Customer</span>
          </button>
        </div>
      </div>

      {isSavedToast && (
        <div className="membership-toast-success">
          <CheckCircle2 size={16} />
          <span>Membership billing plans and wholesale rules updated successfully!</span>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="membership-kpi-grid">
        <div className="membership-kpi-card highlight-blue">
          <div className="kpi-card-top">
            <span className="kpi-pill">TOTAL MEMBERS</span>
            <Users size={20} className="kpi-icon blue" />
          </div>
          <div className="kpi-card-value">{activeMembers.length}</div>
          <div className="kpi-card-label">Active Distributor Members</div>
          <div className="kpi-card-trend positive">
            <TrendingUp size={13} />
            <span>All unlock wholesale DP & PV</span>
          </div>
        </div>

        <div className="membership-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-pill">ANNUAL PLANS</span>
            <Crown size={20} className="kpi-icon gold" />
          </div>
          <div className="kpi-card-value">{annualSubscribers}</div>
          <div className="kpi-card-label">Annual Membership (₹{settings.annualFee}/yr)</div>
          <div className="kpi-card-trend positive">
            <span>{Math.round((annualSubscribers / (activeMembers.length || 1)) * 100)}% of total members</span>
          </div>
        </div>

        <div className="membership-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-pill">MONTHLY PLANS</span>
            <Calendar size={20} className="kpi-icon purple" />
          </div>
          <div className="kpi-card-value">{monthlySubscribers}</div>
          <div className="kpi-card-label">Monthly Membership (₹{settings.monthlyFee}/mo)</div>
          <div className="kpi-card-trend neutral">
            <span>Auto-renewing active cycles</span>
          </div>
        </div>

        <div className="membership-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-pill">TOTAL PV CREDITED</span>
            <Zap size={20} className="kpi-icon emerald" />
          </div>
          <div className="kpi-card-value">{totalPvAccumulated > 0 ? `${(totalPvAccumulated / 1000000).toFixed(1)}M PV` : '0 PV'}</div>
          <div className="kpi-card-label">Personal PV Accumulated</div>
          <div className="kpi-card-trend positive">
            <Sparkles size={13} />
            <span>1.0x Base PV on all orders</span>
          </div>
        </div>
      </div>

      {/* 3. Membership Configuration & Billing Plans Card */}
      <div className="membership-section-block">
        <div className="section-block-header">
          <div>
            <h3 className="section-block-title">Membership Architecture & Billing Plans</h3>
            <p className="section-block-subtitle">
              Configure the single-class membership pricing for Monthly and Annual payment cycles.
            </p>
          </div>
          <span className="single-tier-pill">Single Membership Class</span>
        </div>

        <form onSubmit={handleSaveSettings} className="membership-plans-form">
          <div className="plans-dual-grid">
            {/* Monthly Plan Card */}
            <div className="plan-setting-card">
              <div className="plan-card-header">
                <div className="plan-icon-wrap monthly">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="plan-title">Monthly Membership</h4>
                  <span className="plan-badge">Recurring 30-Day Access</span>
                </div>
              </div>

              <div className="plan-card-body">
                <div className="plan-input-group">
                  <label htmlFor="plan-monthly-fee">Monthly Subscription Fee (₹)</label>
                  <div className="currency-input-wrap">
                    <span className="currency-symbol">₹</span>
                    <input
                      id="plan-monthly-fee"
                      type="number"
                      min="1"
                      value={settings.monthlyFee}
                      onChange={(e) => setSettings({ ...settings, monthlyFee: Number(e.target.value) })}
                      className="plan-number-input"
                      required
                    />
                    <span className="fee-period">/ month</span>
                  </div>
                </div>

                <div className="plan-perks-box">
                  <div className="perk-bullet">
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>Instant access to <strong>Wholesale DP Prices</strong></span>
                  </div>
                  <div className="perk-bullet">
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>Personal PV Point Value credited on every order</span>
                  </div>
                  <div className="perk-bullet">
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>Billed monthly with flexible cancellation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Annual Plan Card */}
            <div className="plan-setting-card recommended">
              <div className="plan-recommended-tag">BEST VALUE FOR MEMBERS</div>
              <div className="plan-card-header">
                <div className="plan-icon-wrap annual">
                  <Crown size={20} />
                </div>
                <div>
                  <h4 className="plan-title">Annual Membership</h4>
                  <span className="plan-badge gold">Full 365-Day Access</span>
                </div>
              </div>

              <div className="plan-card-body">
                <div className="plan-input-group">
                  <label htmlFor="plan-annual-fee">Annual Subscription Fee (₹)</label>
                  <div className="currency-input-wrap">
                    <span className="currency-symbol">₹</span>
                    <input
                      id="plan-annual-fee"
                      type="number"
                      min="1"
                      value={settings.annualFee}
                      onChange={(e) => setSettings({ ...settings, annualFee: Number(e.target.value) })}
                      className="plan-number-input"
                      required
                    />
                    <span className="fee-period">/ year</span>
                  </div>
                </div>

                <div className="plan-perks-box">
                  <div className="perk-bullet">
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>Instant access to <strong>Wholesale DP Prices</strong></span>
                  </div>
                  <div className="perk-bullet">
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>Full 12 months uninterrupted PV accumulation</span>
                  </div>
                  <div className="perk-bullet">
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>Save 30% compared to monthly plan billing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Rule Description Box */}
          <div className="pricing-rules-summary-box">
            <div className="rule-item">
              <ShieldCheck size={18} color="#00A3E0" />
              <div>
                <strong>Wholesale DP Price Behavior:</strong>
                <p>When a signed-in customer has an active membership, the store dynamically replaces MRP with the <strong>Wholesale DP Price</strong> and displays their earnable <strong>PV points</strong>.</p>
              </div>
            </div>
            <div className="rule-item">
              <Users size={18} color="#64748b" />
              <div>
                <strong>Non-Member / Guest Behavior:</strong>
                <p>Visitors who are NOT signed in, or customers without active membership, will ONLY view the <strong>MRP price and regular offer price</strong>. They cannot access DP prices or PV values.</p>
              </div>
            </div>
          </div>

          <div className="form-submit-row">
            <button type="submit" className="membership-btn-primary">
              <Save size={15} />
              <span>Save Membership Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Customer Member Directory Table */}
      <div className="membership-section-block">
        <div className="section-block-header">
          <div>
            <h3 className="section-block-title">Enrolled Members Directory</h3>
            <p className="section-block-subtitle">
              Manage enrolled Atomy Distributor members, monitor active billing cycles, and review accumulated PV.
            </p>
          </div>
          <span className="members-count-indicator">{filteredMembers.length} Members Listed</span>
        </div>

        {/* Filter and Search Bar */}
        <div className="membership-table-toolbar">
          <div className="toolbar-search-wrap">
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              placeholder="Search member by Name, Email, or Member Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="toolbar-search-input"
            />
          </div>

          <div className="toolbar-filter-tabs">
            {[
              { id: 'ALL', label: 'All Members' },
              { id: 'ANNUAL', label: 'Annual Plan' },
              { id: 'MONTHLY', label: 'Monthly Plan' },
              { id: 'ACTIVE', label: 'Active Only' },
              { id: 'INACTIVE', label: 'Inactive' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`filter-tab-pill ${planFilter === tab.id ? 'active' : ''}`}
                onClick={() => setPlanFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="members-table-wrap">
          <table className="members-table">
            <thead>
              <tr>
                <th>Member Details</th>
                <th>Billing Plan</th>
                <th>Payment & Fee</th>
                <th>Cycle Start</th>
                <th>Renewal / Expiry</th>
                <th>Personal PV Earned</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty-row">
                    No members found matching your search or filter.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const displayName = member.customerName || member.name || 'Member';
                  const displayEmail = member.customerEmail || member.email || '';
                  const displayPhone = member.customerPhone || member.phone || '';
                  const amount = Number(member.amountPaid || (member.plan === 'ANNUAL' ? 2499 : 299));
                  const payMethod = member.paymentMethod || 'ONLINE';
                  const payId = member.paymentId || 'PAID';

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="member-name-cell">
                          <div className="member-avatar-circle">
                            {displayName.charAt(0)}
                          </div>
                          <div>
                            <div className="member-name">{displayName}</div>
                            <div className="member-meta">
                              <span>{member.id}</span> • <span>{displayEmail}</span>
                              {displayPhone && <span> • {displayPhone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`plan-pill ${member.plan.toLowerCase()}`}>
                          {member.plan === 'ANNUAL' ? 'Annual Plan' : 'Monthly Plan'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          ₹ {amount.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
                          <CreditCard size={11} />
                          <span>{payMethod}</span>
                          <span style={{ color: '#94a3b8' }}>•</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '10.5px' }}>{payId.slice(0, 14)}...</span>
                        </div>
                      </td>
                      <td>
                        <div className="member-date">{member.startDate ? String(member.startDate).split('T')[0] : 'Today'}</div>
                      </td>
                      <td>
                        <div className="member-date">{member.expiryDate ? String(member.expiryDate).split('T')[0] : '1 Year'}</div>
                      </td>
                      <td>
                        <div className="member-pv-val">
                          <strong>{(member.lifetimePv || 0).toLocaleString('en-IN')}</strong> PV
                        </div>
                      </td>
                      <td>
                        {member.status === 'ACTIVE' ? (
                          <span className="member-status-active">
                            <span className="dot" />
                            <span>Active (DP Unlocked)</span>
                          </span>
                        ) : (
                          <span className="member-status-inactive">
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button" 
                        className={`btn-toggle-status ${member.status === 'ACTIVE' ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleMemberStatus(member.id, member.status)}
                        title={member.status === 'ACTIVE' ? "Suspend Membership" : "Activate Membership"}
                      >
                        {member.status === 'ACTIVE' ? (
                          <>
                            <UserX size={13} />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={13} />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Enroll Customer Modal */}
      {isEnrollModalOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsEnrollModalOpen(false)}>
          <div className="enroll-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="enroll-modal-header">
              <div className="enroll-header-left">
                <Crown size={20} color="#00A3E0" />
                <h3>Enroll Customer into Atomy Membership</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsEnrollModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEnrollMemberSubmit} className="enroll-modal-form">
              <div className="enroll-field-group">
                <label>Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  className="enroll-input"
                  required
                />
              </div>

              <div className="enroll-field-group">
                <label>Customer Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh.kumar@example.com"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  className="enroll-input"
                  required
                />
              </div>

              <div className="enroll-field-group">
                <label>Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  className="enroll-input"
                />
              </div>

              <div className="enroll-field-group">
                <label>Select Membership Billing Plan</label>
                <div className="plan-selector-grid">
                  <label className={`plan-choice-card ${newMemberForm.plan === 'MONTHLY' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="enroll-plan"
                      value="MONTHLY"
                      checked={newMemberForm.plan === 'MONTHLY'}
                      onChange={() => setNewMemberForm({ ...newMemberForm, plan: 'MONTHLY' })}
                    />
                    <div className="choice-title">Monthly Plan</div>
                    <div className="choice-price">₹ {settings.monthlyFee} / month</div>
                    <div className="choice-sub">30 days validity</div>
                  </label>

                  <label className={`plan-choice-card ${newMemberForm.plan === 'ANNUAL' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="enroll-plan"
                      value="ANNUAL"
                      checked={newMemberForm.plan === 'ANNUAL'}
                      onChange={() => setNewMemberForm({ ...newMemberForm, plan: 'ANNUAL' })}
                    />
                    <div className="choice-title">Annual Plan</div>
                    <div className="choice-price">₹ {settings.annualFee} / year</div>
                    <div className="choice-sub">365 days (Best Value)</div>
                  </label>
                </div>
              </div>

              <div className="enroll-modal-footer">
                <button 
                  type="button" 
                  className="membership-btn-secondary"
                  onClick={() => setIsEnrollModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="membership-btn-primary">
                  <Check size={16} />
                  <span>Activate & Enroll Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
