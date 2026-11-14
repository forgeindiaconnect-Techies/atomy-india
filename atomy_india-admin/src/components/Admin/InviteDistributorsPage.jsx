import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UserPlus,
  MapPin,
  Building2,
  Mail,
  Phone,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Send,
  Plus,
  X,
  Layers,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Filter,
  Check,
  Trash2
} from 'lucide-react';
import {
  fetchDistributorList,
  createDistributor,
  fetchPincodes,
  assignPincode,
  resendDistributorInvite,
  deleteDistributor,
  clearAllDistributors,
  updateHubLeaveStatus
} from '../../services/distributorService';
import { normalizeIndianMobile, isValidIndianMobile } from '../../utils/phoneUtils';
import './InviteDistributorsPage.css';

export default function InviteDistributorsPage({ showToast }) {
  const [distributors, setDistributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState(null);
  const [sendingInviteId, setSendingInviteId] = useState(null);

  // Real-time PIN checker state
  const [pinCheckInput, setPinCheckInput] = useState('');
  const [pinCheckResult, setPinCheckResult] = useState(null);
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [isHubDropdownOpen, setIsHubDropdownOpen] = useState(false);
  const hubDropdownRef = useRef(null);

  // Close hub dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hubDropdownRef.current && !hubDropdownRef.current.contains(event.target)) {
        setIsHubDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Invite Form State (1 Sub-Admin = strictly 1 PIN code)
  const [inviteForm, setInviteForm] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    primaryPincode: '',
    city: '',
    state: 'Delhi',
    hubAddress: '',
    commissionRate: 7.5,
    territoryFee: 25000,
    password: 'Admin@123',
    sendEmailInvite: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real distributor list from live database
  const loadDistributors = async () => {
    setIsLoading(true);
    try {
      // Clear legacy localStorage cache of demo invites
      try {
        localStorage.removeItem('atomy_invited_distributors');
      } catch {}

      const data = await fetchDistributorList().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map(d => ({
          ...d,
          id: d.distributorId || d.id,
          assignedPincodes: d.assignedPincodes || [d.primaryPincode],
          status: d.status || 'ACTIVE'
        }));
        setDistributors(normalized);
      } else {
        setDistributors([
          {
            distributorId: 'DIST-635002',
            businessName: 'Selva Regional Logistics Hub',
            contactPerson: 'Selva',
            email: 'selva@atomy.com',
            phone: '+91 98765 43210',
            primaryPincode: '635002',
            assignedPincodes: ['635002'],
            city: 'Krishnagiri',
            state: 'Tamil Nadu',
            hubAddress: 'Krishnagiri Regional Logistics Centre, Tamil Nadu - 635002',
            commissionRate: 7.5,
            territoryFee: 25000,
            status: 'ACTIVE',
            onboardedAt: '2026-11-01'
          }
        ]);
      }
    } catch (err) {
      console.warn('Notice: loading fallback active distributor:', err.message);
      setDistributors([
        {
          distributorId: 'DIST-635002',
          businessName: 'Selva Regional Logistics Hub',
          contactPerson: 'Selva',
          email: 'selva@atomy.com',
          phone: '+91 98765 43210',
          primaryPincode: '635002',
          assignedPincodes: ['635002'],
          city: 'Krishnagiri',
          state: 'Tamil Nadu',
          hubAddress: 'Krishnagiri Regional Logistics Centre, Tamil Nadu - 635002',
          commissionRate: 7.5,
          territoryFee: 25000,
          status: 'ACTIVE',
          onboardedAt: '2026-11-01'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDistributors();
  }, []);

  // Real-time PIN Code Availability Check
  const handleCheckPincode = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setPinCheckInput(cleaned);

    if (cleaned.length === 6) {
      const assignedDist = distributors.find(d => 
        d.primaryPincode === cleaned || (d.assignedPincodes && d.assignedPincodes.includes(cleaned))
      );

      if (assignedDist) {
        setPinCheckResult({
          status: 'ASSIGNED',
          pincode: cleaned,
          distributor: assignedDist
        });
      } else {
        setPinCheckResult({
          status: 'VACANT',
          pincode: cleaned
        });
      }
    } else {
      setPinCheckResult(null);
    }
  };

  // Open invite modal with prefilled PIN
  const handleInviteForPincode = (pin) => {
    setInviteForm(prev => ({
      ...prev,
      primaryPincode: pin,
      isSubDistributor: false,
      parentHubId: null,
      parentHubName: null
    }));
    setIsInviteModalOpen(true);
  };

  // Handle Send Invitation & Onboard
  const handleSubmitInvite = async (e) => {
    e.preventDefault();
    if (inviteForm.isSubDistributor) {
      if (!inviteForm.parentHubId) {
        if (showToast) showToast('Please choose a Primary Hub to co-manage.', 'error');
        return;
      }
      if (!inviteForm.email || !inviteForm.contactPerson) {
        if (showToast) showToast('Please enter the Co-Manager name and email address.', 'error');
        return;
      }
    } else {
      if (!inviteForm.email || !inviteForm.primaryPincode || !inviteForm.businessName) {
        if (showToast) showToast('Please complete all required fields.', 'error');
        return;
      }
    }

    const cleanPhone = normalizeIndianMobile(inviteForm.phone);
    if (!isValidIndianMobile(cleanPhone)) {
      if (cleanPhone.length > 0 && !/^[6-9]/.test(cleanPhone)) {
        if (showToast) showToast('Contact Mobile Number must start with 6, 7, 8, or 9.', 'error');
      } else {
        if (showToast) showToast('Please enter a valid 10-digit Indian mobile number.', 'error');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const bizName = inviteForm.isSubDistributor 
        ? (inviteForm.businessName || `${inviteForm.parentHubName} (Co-Manager)`)
        : inviteForm.businessName;

      const payload = {
        businessName: bizName,
        contactPerson: inviteForm.contactPerson || 'Hub Co-Manager',
        email: inviteForm.email.toLowerCase().trim(),
        phone: cleanPhone,
        primaryPincode: inviteForm.primaryPincode,
        city: inviteForm.city || 'Hub City',
        state: inviteForm.state,
        hubAddress: inviteForm.hubAddress || `${inviteForm.city || 'Hub'} Regional Logistics Centre`,
        commissionRate: parseFloat(inviteForm.commissionRate) || 7.5,
        territoryFee: parseInt(inviteForm.territoryFee, 10) || 0,
        password: inviteForm.password || 'Admin@123',
        sendEmail: inviteForm.sendEmailInvite !== false,
        isSubDistributor: Boolean(inviteForm.isSubDistributor),
        parentHubId: inviteForm.parentHubId || null,
        parentHubName: inviteForm.parentHubName || null
      };

      // Create distributor on server & trigger Brevo invitation email
      const savedDist = await createDistributor(payload);

      if (showToast) {
        showToast(`Invitation email & portal access link sent to ${payload.email} for ${payload.businessName} [${payload.primaryPincode}]!`, 'success');
      }

      // Reset form & close modal
      setIsInviteModalOpen(false);
      setInviteForm({
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        primaryPincode: '',
        city: '',
        state: 'Delhi',
        hubAddress: '',
        commissionRate: 7.5,
        territoryFee: 25000,
        password: 'Admin@123',
        sendEmailInvite: true
      });
      setPinCheckResult(null);
      setPinCheckInput('');
      setHubSearchQuery('');

      // Reload live list
      await loadDistributors();
    } catch (err) {
      if (showToast) showToast('Failed to onboard distributor: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy Onboarding Link
  const handleCopyInviteLink = (dist) => {
    const distId = dist.distributorId || dist.id;
    const inviteLink = `${window.location.origin}/admin?invite=${encodeURIComponent(distId)}&email=${encodeURIComponent(dist.email)}&pin=${encodeURIComponent(dist.primaryPincode)}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInviteId(distId);
    if (showToast) showToast(`Onboarding invite link copied to clipboard!`, 'info');
    setTimeout(() => setCopiedInviteId(null), 3000);
  };

  // Resend Invite Email via Brevo
  const handleResendInvite = async (dist) => {
    const distId = dist.distributorId || dist.id;
    setSendingInviteId(distId);
    try {
      await resendDistributorInvite(distId);
      if (showToast) {
        showToast(`Invitation email with portal access link dispatched to ${dist.email}!`, 'success');
      }
    } catch (err) {
      if (showToast) {
        showToast(`Failed to dispatch email: ${err.message}`, 'error');
      }
    } finally {
      setSendingInviteId(null);
    }
  };

  // Toggle Status (ACTIVE / INVITED / PAUSED)
  const handleToggleStatus = (distId) => {
    setDistributors(prev => prev.map(d => {
      if ((d.distributorId || d.id) === distId) {
        const nextStatus = d.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return {
          ...d,
          status: nextStatus,
          onboardedAt: nextStatus === 'ACTIVE' ? (d.onboardedAt || new Date().toISOString().split('T')[0]) : d.onboardedAt
        };
      }
      return d;
    }));
    if (showToast) showToast(`Distributor status toggled!`, 'info');
  };

  // Super Admin 1-click Handoff between Primary and Temporary Substitute
  const handleToggleHandover = async (primaryDist, substituteDist) => {
    const isCurrentlyOnLeave = primaryDist.onLeave || primaryDist.status === 'ON_LEAVE';
    const nextOnLeave = !isCurrentlyOnLeave;
    try {
      await updateHubLeaveStatus(primaryDist.distributorId || primaryDist.id, {
        onLeave: nextOnLeave,
        delegatedToId: nextOnLeave && substituteDist ? (substituteDist.distributorId || substituteDist.id) : null,
        delegatedToName: nextOnLeave && substituteDist ? (substituteDist.contactPerson || substituteDist.businessName) : null
      });

      // Broadcast handover change immediately to all tabs
      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({
          type: 'HUB_HANDOVER_STATUS_CHANGED',
          onLeave: nextOnLeave,
          primaryName: primaryDist.contactPerson,
          hubId: primaryDist.distributorId || primaryDist.id
        });
      } catch (e) {}
      if (showToast) {
        showToast(
          nextOnLeave 
            ? `Hub handed over to Temporary Substitute (${substituteDist ? substituteDist.contactPerson : 'Backup'})! Substitute is now ACTIVE.`
            : `Hub returned to Primary Manager (${primaryDist.contactPerson})! Substitute is back on STANDBY.`,
          'success'
        );
      }
      await loadDistributors();
    } catch (err) {
      if (showToast) showToast(`Failed to toggle handoff: ${err.message}`, 'error');
    }
  };

  // Delete Individual Distributor
  const handleDeleteDistributor = async (distId, name) => {
    if (!window.confirm(`Are you sure you want to remove distributor "${name || distId}"? Their territory PIN codes will be freed and reset to VACANT.`)) {
      return;
    }
    try {
      await deleteDistributor(distId);
      if (showToast) showToast(`Distributor "${name || distId}" successfully deleted.`, 'success');
      await loadDistributors();
    } catch (err) {
      if (showToast) showToast(`Failed to delete distributor: ${err.message}`, 'error');
    }
  };

  // Clear All Distributors (Purge duplicates / reset)
  const handleClearAllDistributors = async () => {
    if (!window.confirm('Are you sure you want to remove ALL distributors? This will clear all duplicate records in MongoDB and reset territory assignments to vacant.')) {
      return;
    }
    try {
      await clearAllDistributors();
      if (showToast) showToast('All distributors cleared and database reset successfully.', 'success');
      await loadDistributors();
    } catch (err) {
      if (showToast) showToast(`Failed to clear distributors: ${err.message}`, 'error');
    }
  };

  // Filtered List
  const filteredDistributors = useMemo(() => {
    return distributors.filter(d => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q || (
        (d.businessName && d.businessName.toLowerCase().includes(q)) ||
        (d.contactPerson && d.contactPerson.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q)) ||
        (d.primaryPincode && d.primaryPincode.includes(q)) ||
        (d.assignedPincodes && d.assignedPincodes.some(p => p.includes(q))) ||
        (d.city && d.city.toLowerCase().includes(q))
      );

      const matchState = stateFilter === 'ALL' || d.state === stateFilter;
      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;

      return matchSearch && matchState && matchStatus;
    });
  }, [distributors, search, stateFilter, statusFilter]);

  // Primary Hubs for Co-Manager selection dropdown
  const primaryHubs = useMemo(() => {
    return distributors.filter(d => d.distributorRole !== 'SUB_DISTRIBUTOR');
  }, [distributors]);

  // Dynamic search filter for hubs by name or PIN code
  const filteredPrimaryHubs = useMemo(() => {
    if (!hubSearchQuery.trim()) return primaryHubs;
    const q = hubSearchQuery.toLowerCase().trim();
    return primaryHubs.filter(h => 
      (h.businessName || '').toLowerCase().includes(q) ||
      (h.primaryPincode || '').includes(q) ||
      (h.city || '').toLowerCase().includes(q) ||
      (h.contactPerson || '').toLowerCase().includes(q)
    );
  }, [primaryHubs, hubSearchQuery]);

  // Select which Hub a Co-Manager will co-manage
  const handleSelectParentHub = (hubId) => {
    if (!hubId) {
      setInviteForm(prev => ({
        ...prev,
        parentHubId: '',
        parentHubName: '',
        businessName: '',
        primaryPincode: '',
        city: '',
        state: 'Delhi',
        hubAddress: '',
        commissionRate: 7.5,
        territoryFee: 0,
        contactPerson: '',
        email: '',
        phone: '',
        password: ''
      }));
      return;
    }
    const hub = distributors.find(d => (d.distributorId || d.id) === hubId);
    if (!hub) return;
    setInviteForm(prev => ({
      ...prev,
      parentHubId: hub.distributorId || hub.id,
      parentHubName: hub.businessName,
      businessName: `${hub.businessName} (Co-Manager)`,
      primaryPincode: hub.primaryPincode,
      city: hub.city,
      state: hub.state,
      hubAddress: hub.hubAddress || `${hub.city} Regional Logistics Centre`,
      commissionRate: hub.commissionRate || 7.5,
      territoryFee: 0,
      contactPerson: '',
      email: '',
      phone: '',
      password: '',
      isSubDistributor: true
    }));
  };

  // Instant search & auto-select by Name or PIN
  const handleHubSearchType = (val) => {
    setHubSearchQuery(val);
    const clean = val.trim().toLowerCase();
    if (!clean) return;

    // Check if directly matches a 6-digit PIN or full business name
    const match = primaryHubs.find(h => 
      h.primaryPincode === clean ||
      (h.businessName && h.businessName.toLowerCase() === clean) ||
      (h.contactPerson && h.contactPerson.toLowerCase() === clean)
    );
    if (match) {
      handleSelectParentHub(match.distributorId || match.id);
    }
  };

  // Open invite modal to onboard a Sub-Distributor / Co-Manager
  const handleInviteSubDistributor = (primaryDist = null) => {
    setHubSearchQuery('');
    setIsHubDropdownOpen(false);
    if (primaryDist && (primaryDist.distributorId || primaryDist.id)) {
      setInviteForm({
        businessName: primaryDist.businessName ? `${primaryDist.businessName} (Co-Manager)` : '',
        contactPerson: '',
        email: '',
        phone: '',
        primaryPincode: primaryDist.primaryPincode || '',
        city: primaryDist.city || '',
        state: primaryDist.state || 'Delhi',
        hubAddress: primaryDist.hubAddress || '',
        commissionRate: primaryDist.commissionRate || 7.5,
        territoryFee: 0,
        password: '',
        sendEmailInvite: true,
        isSubDistributor: true,
        parentHubId: primaryDist.distributorId || primaryDist.id,
        parentHubName: primaryDist.businessName || ''
      });
    } else {
      setInviteForm({
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        primaryPincode: '',
        city: '',
        state: 'Delhi',
        hubAddress: '',
        commissionRate: 7.5,
        territoryFee: 0,
        password: '',
        sendEmailInvite: true,
        isSubDistributor: true,
        parentHubId: '',
        parentHubName: ''
      });
    }
    setIsInviteModalOpen(true);
  };
  const metrics = useMemo(() => {
    const totalHubs = distributors.length;
    const activeHubs = distributors.filter(d => d.status === 'ACTIVE').length;
    const pendingInvites = distributors.filter(d => d.status === 'INVITED').length;
    const allCoveredPins = new Set();
    distributors.forEach(d => {
      if (d.assignedPincodes) d.assignedPincodes.forEach(p => allCoveredPins.add(p));
      else if (d.primaryPincode) allCoveredPins.add(d.primaryPincode);
    });
    return {
      totalHubs,
      activeHubs,
      pendingInvites,
      totalPinsCovered: allCoveredPins.size
    };
  }, [distributors]);

  const uniqueStates = useMemo(() => {
    const s = new Set(distributors.map(d => d.state).filter(Boolean));
    return ['ALL', ...Array.from(s)];
  }, [distributors]);

  return (
    <div className="invite-distributors-page-wrap">
      {/* Page Header */}
      <div className="invite-page-header">
        <div className="invite-header-content">
          <div className="invite-header-badge">
            <ShieldCheck size={12} />
            <span>TERRITORY FRANCHISE & ONBOARDING</span>
          </div>
          <h1 className="invite-page-title">Invite & Onboard Regional Distributors</h1>
          <p className="invite-page-subtitle">
            Authorize regional logistics partners by PIN code area. Send portal access invitations and credentials directly to their email via Brevo.
          </p>
        </div>

        <div className="invite-header-actions">
          {distributors.length > 0 && (
            <button
              type="button"
              className="btn-clear-all-distributors"
              title="Delete all distributors and clear duplicate records"
              onClick={handleClearAllDistributors}
            >
              <Trash2 size={14} />
              <span>Clear All Distributors</span>
            </button>
          )}

          <button
            type="button"
            className="btn-open-invite-modal"
            style={{ background: '#059669', borderColor: '#059669', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Onboard a Temporary Substitute / Standby Backup Distributor for an existing hub"
            onClick={() => handleInviteSubDistributor(null)}
          >
            <UserPlus size={15} />
            <span>+ Onboard Temporary Substitute (Backup)</span>
          </button>

          <button
            type="button"
            className="btn-open-invite-modal"
            onClick={() => {
              setInviteForm({
                businessName: '',
                contactPerson: '',
                email: '',
                phone: '',
                primaryPincode: '',
                city: '',
                state: 'Delhi',
                hubAddress: '',
                commissionRate: 7.5,
                territoryFee: 25000,
                password: 'Admin@123',
                sendEmailInvite: true,
                isSubDistributor: false,
                parentHubId: null,
                parentHubName: null
              });
              setPinCheckResult(null);
              setPinCheckInput('');
              setIsInviteModalOpen(true);
            }}
          >
            <UserPlus size={15} />
            <span>+ Invite New Distributor</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="invite-metrics-grid">
        <div className="invite-metric-card">
          <div className="metric-icon-box blue">
            <Building2 size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Regional Hubs</span>
            <span className="metric-value">{metrics.totalHubs}</span>
            <span className="metric-sub">{metrics.activeHubs} Active • {metrics.pendingInvites} Pending</span>
          </div>
        </div>

        <div className="invite-metric-card">
          <div className="metric-icon-box green">
            <MapPin size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Covered PIN Code Areas</span>
            <span className="metric-value">{metrics.totalPinsCovered}</span>
            <span className="metric-sub">Dedicated Logistics Reach</span>
          </div>
        </div>

        <div className="invite-metric-card">
          <div className="metric-icon-box amber">
            <Clock size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Pending Onboarding</span>
            <span className="metric-value">{metrics.pendingInvites}</span>
            <span className="metric-sub">Awaiting Link Activation</span>
          </div>
        </div>

        <div className="invite-metric-card">
          <div className="metric-icon-box purple">
            <Sparkles size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Partner Commission Model</span>
            <span className="metric-value">7.5% - 8.0%</span>
            <span className="metric-sub">Auto-calculated per order</span>
          </div>
        </div>
      </div>

      {/* Interactive PIN Code Availability Checker Card */}
      <div className="pincode-checker-card">
        <div className="pincode-checker-info">
          <div className="checker-title-row">
            <MapPin size={20} className="checker-pin-icon" />
            <div>
              <h3 className="checker-heading">Check Territory PIN Code Availability</h3>
              <p className="checker-sub">
                Enter any 6-digit Indian PIN code to verify if that territory is vacant or already assigned before sending an onboarding invitation.
              </p>
            </div>
          </div>
        </div>

        <div className="pincode-checker-controls">
          <div className="pincode-input-wrap">
            <input
              type="text"
              placeholder="e.g. 110001, 560001, 600001..."
              maxLength={6}
              value={pinCheckInput}
              onChange={(e) => handleCheckPincode(e.target.value)}
              className="pincode-search-input"
            />
            {pinCheckInput && (
              <button
                type="button"
                className="btn-clear-pin"
                onClick={() => { setPinCheckInput(''); setPinCheckResult(null); }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Checker Result Preview */}
          {pinCheckResult && (
            <div className={`pin-result-badge ${pinCheckResult.status.toLowerCase()}`}>
              {pinCheckResult.status === 'VACANT' ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>PIN {pinCheckResult.pincode} is <strong>VACANT & READY</strong> for onboarding!</span>
                  <button
                    type="button"
                    className="btn-invite-this-pin"
                    onClick={() => handleInviteForPincode(pinCheckResult.pincode)}
                  >
                    Onboard to {pinCheckResult.pincode}
                  </button>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>
                    PIN {pinCheckResult.pincode} is <strong>ASSIGNED</strong> to {pinCheckResult.distributor?.businessName} ({pinCheckResult.distributor?.city})
                  </span>
                  <button
                    type="button"
                    className="btn-invite-this-pin"
                    style={{ background: '#059669', borderColor: '#059669', color: '#fff', marginLeft: 'auto' }}
                    onClick={() => handleInviteSubDistributor(pinCheckResult.distributor)}
                  >
                    + Onboard Hub Co-Manager (Model 1)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="invite-toolbar">
        <div className="invite-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by distributor name, contact, PIN code, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="invite-filter-input"
          />
        </div>

        <div className="invite-filter-group">
          <div className="select-wrap">
            <span className="filter-prefix">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="invite-select-filter"
            >
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st === 'ALL' ? 'All States' : st}</option>
              ))}
            </select>
          </div>

          <div className="select-wrap">
            <span className="filter-prefix">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="invite-select-filter"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Hubs</option>
              <option value="INVITED">Pending Invitations</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Distributors & Invitations Table */}
      <div className="invite-table-container">
        <table className="invite-distributors-table">
          <thead>
            <tr>
              <th>Distributor Hub & ID</th>
              <th>Contact Representative</th>
              <th>Assigned Territory PIN</th>
              <th>Commission</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="invite-table-empty">
                  <RefreshCw size={36} className="animate-spin" style={{ color: '#0284c7', margin: '0 auto 12px' }} />
                  <h4>Loading Regional Distributors...</h4>
                  <p>Fetching active distributor franchises from database.</p>
                </td>
              </tr>
            ) : filteredDistributors.length === 0 ? (
              <tr>
                <td colSpan={6} className="invite-table-empty">
                  <UserPlus size={40} className="empty-table-icon" />
                  <h4>No Regional Distributors Onboarded Yet</h4>
                  <p>Click <strong>+ Invite New Distributor</strong> above to onboard logistics partners and send invitation links through email.</p>
                </td>
              </tr>
            ) : (
              filteredDistributors.map((dist) => {
                const distId = dist.distributorId || dist.id;
                const isSendingThis = sendingInviteId === distId;
                return (
                  <tr key={distId} className="invite-table-row">
                    <td>
                      <div className="dist-business-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="dist-biz-name">{dist.businessName}</span>
                          {dist.distributorRole === 'SUB_DISTRIBUTOR' ? (
                            <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              Co-Manager (Shared Hub)
                            </span>
                          ) : (
                            <>
                              <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                Primary Hub
                              </span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleInviteSubDistributor(dist); }}
                                style={{
                                  fontSize: '10.5px',
                                  background: '#ecfdf5',
                                  color: '#047857',
                                  border: '1px solid #a7f3d0',
                                  padding: '1px 7px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                                title="Onboard a Co-Manager who shares this hub's inventory and dispatches"
                              >
                                <UserPlus size={11} /> + Add Co-Manager
                              </button>
                            </>
                          )}
                          {dist.onLeave && (
                            <span style={{ fontSize: '10.5px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              🌴 On Leave
                            </span>
                          )}
                        </div>
                        <span className="dist-biz-id">{distId}</span>
                        {dist.parentHubId && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Linked Hub: <strong>{dist.parentHubId}</strong>
                          </span>
                        )}
                        <span className="dist-biz-city">{dist.city}, {dist.state}</span>
                        {dist.hubAddress && (
                          <span style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'flex-start', gap: '4px', lineHeight: 1.35 }}>
                            <MapPin size={12} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{dist.hubAddress}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="dist-contact-cell">
                        <span className="dist-contact-name">{dist.contactPerson}</span>
                        <span className="dist-contact-email">
                          <Mail size={12} /> {dist.email}
                        </span>
                        <span className="dist-contact-phone">
                          <Phone size={12} /> {dist.phone}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="primary-pin-badge" style={{ fontWeight: 700, fontSize: '13.5px' }}>
                        <MapPin size={14} /> {dist.primaryPincode}
                      </span>
                    </td>

                    <td>
                      <div className="commission-cell">
                        <span className="comm-rate">{dist.commissionRate || 7.5}%</span>
                        <span className="comm-fee">₹ {(dist.territoryFee || 25000).toLocaleString('en-IN')} Fee</span>
                      </div>
                    </td>

                    <td>
                      {dist.distributorRole === 'SUB_DISTRIBUTOR' ? (
                        <span className={`invite-status-pill ${dist.status === 'ACTIVE' ? 'active' : 'paused'}`} style={{
                          background: dist.status === 'ACTIVE' ? '#ecfdf5' : '#fffbeb',
                          color: dist.status === 'ACTIVE' ? '#047857' : '#b45309',
                          borderColor: dist.status === 'ACTIVE' ? '#a7f3d0' : '#fde68a'
                        }}>
                          {dist.status === 'ACTIVE' ? <Sparkles size={12} /> : <Clock size={12} />}
                          <span>{dist.status === 'ACTIVE' ? 'IN COMMAND' : 'STANDBY (LOCKED)'}</span>
                        </span>
                      ) : (
                        <span className={`invite-status-pill ${(dist.status || 'ACTIVE').toLowerCase()}`}>
                          {dist.status === 'ACTIVE' && <CheckCircle2 size={12} />}
                          {dist.status === 'ON_LEAVE' && <Clock size={12} color="#b45309" />}
                          {dist.status === 'INVITED' && <Clock size={12} />}
                          {dist.status === 'PAUSED' && <AlertCircle size={12} />}
                          <span>{dist.status || 'ACTIVE'}</span>
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="invite-row-actions">
                        {dist.distributorRole !== 'SUB_DISTRIBUTOR' && (() => {
                          const substitute = distributors.find(d => d.parentHubId === distId);
                          const isPrimaryOnLeave = dist.onLeave || dist.status === 'ON_LEAVE';

                          return (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {substitute && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleHandover(dist, substitute)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '5px 9px',
                                    background: isPrimaryOnLeave ? '#ecfdf5' : '#fffbeb',
                                    color: isPrimaryOnLeave ? '#047857' : '#b45309',
                                    border: isPrimaryOnLeave ? '1.5px solid #a7f3d0' : '1.5px solid #fde68a',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={isPrimaryOnLeave ? "Primary returns to active duty; Substitute returns to Standby" : "Activate Temporary Substitute and put Primary on leave"}
                                >
                                  {isPrimaryOnLeave ? (
                                    <>
                                      <CheckCircle2 size={12} />
                                      <span>Return to Primary</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={12} />
                                      <span>Handover to Backup</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                        <button
                          type="button"
                          className="btn-action-icon copy"
                          title="Copy Onboarding Portal Link"
                          onClick={() => handleCopyInviteLink(dist)}
                        >
                          {copiedInviteId === distId ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
                        </button>

                        <button
                          type="button"
                          disabled={isSendingThis}
                          className="btn-action-icon send"
                          title="Send Invitation Link & Credentials via Email (Brevo)"
                          onClick={() => handleResendInvite(dist)}
                        >
                          {isSendingThis ? (
                            <RefreshCw size={15} className="animate-spin" />
                          ) : (
                            <Send size={15} />
                          )}
                        </button>

                        <button
                          type="button"
                          className={`btn-action-toggle ${dist.status === 'ACTIVE' ? 'pause' : 'activate'}`}
                          onClick={() => handleToggleStatus(distId)}
                        >
                          {dist.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          className="btn-action-icon delete"
                          style={{
                            color: '#dc2626',
                            background: '#fef2f2',
                            borderColor: '#fecaca'
                          }}
                          title="Delete this distributor and release PIN code territory"
                          onClick={() => handleDeleteDistributor(distId, dist.businessName)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Invite & Onboard New Distributor */}
      {isInviteModalOpen && (
        <div className="invite-modal-overlay" onClick={() => setIsInviteModalOpen(false)}>
          <div className="invite-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="invite-modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-bubble">
                  <UserPlus size={22} color="#0284c7" />
                </div>
                <div>
                  <h3 className="modal-title">
                    {inviteForm.isSubDistributor ? 'Onboard Temporary Substitute (Backup)' : 'Onboard New Regional Distributor'}
                  </h3>
                  <p className="modal-subtitle">
                    {inviteForm.isSubDistributor 
                      ? 'Assign a standby backup distributor to take over this regional hub when the primary distributor is unavailable or on leave.'
                      : 'Generate access credentials and dispatch onboarding email with portal link.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsInviteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitInvite} className="invite-modal-form">
              {inviteForm.isSubDistributor ? (
                /* ==============================================================
                   CO-MANAGER ONBOARDING FLOW:
                   1. Choose Hub (Search by Name or PIN)
                   2. Hub details are inherited & locked
                   3. Only ask Co-Manager personal details
                   ============================================================== */
                <div>
                  {/* Step 1: Collapsed Unified Searchable Hub Dropdown */}
                  <div
                    ref={hubDropdownRef}
                    style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      marginBottom: '16px',
                      position: 'relative'
                    }}
                  >
                    <label style={{ color: '#0f172a', fontWeight: 700, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Building2 size={16} color="#0284c7" />
                      <span>Choose Hub *</span>
                    </label>

                    {/* Single Combined Input: Search Bar and Dropdown collided into one */}
                    <div
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        background: '#ffffff',
                        border: isHubDropdownOpen ? '1.5px solid #0284c7' : '1.5px solid #94a3b8',
                        borderRadius: '6px',
                        boxShadow: isHubDropdownOpen ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Search size={16} style={{ position: 'absolute', left: '12px', color: '#64748b', pointerEvents: 'none' }} />

                      <input
                        type="text"
                        placeholder="Choose Hub (Search by Hub Name or PIN Code)..."
                        value={isHubDropdownOpen ? hubSearchQuery : (inviteForm.parentHubName ? `${inviteForm.parentHubName} — PIN: ${inviteForm.primaryPincode} (${inviteForm.city}, ${inviteForm.state})` : '')}
                        onChange={(e) => {
                          setHubSearchQuery(e.target.value);
                          if (!isHubDropdownOpen) setIsHubDropdownOpen(true);
                        }}
                        onFocus={() => {
                          setIsHubDropdownOpen(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 65px 10px 36px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13.5px',
                          fontWeight: (!isHubDropdownOpen && inviteForm.parentHubName) ? 600 : 400,
                          color: (!isHubDropdownOpen && inviteForm.parentHubName) ? '#0f172a' : '#334155',
                          background: 'transparent',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />

                      {/* Right Action Icons (Clear button if chosen & Chevron toggle) */}
                      <div style={{ position: 'absolute', right: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {(inviteForm.parentHubId || hubSearchQuery) && (
                          <button
                            type="button"
                            title="Clear selection"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectParentHub('');
                              setHubSearchQuery('');
                              setIsHubDropdownOpen(false);
                            }}
                            style={{
                              background: '#e2e8f0',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#475569'
                            }}
                          >
                            <X size={12} />
                          </button>
                        )}

                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsHubDropdownOpen(prev => !prev);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <ChevronDown
                            size={18}
                            style={{
                              transform: isHubDropdownOpen ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s ease'
                            }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Dropdown Menu List */}
                    {isHubDropdownOpen && (
                      <div
                        style={{
                          marginTop: '8px',
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                          maxHeight: '210px',
                          overflowY: 'auto'
                        }}
                      >
                        {filteredPrimaryHubs.length === 0 ? (
                          <div style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                            No regional hubs found matching "{hubSearchQuery}".
                          </div>
                        ) : (
                          filteredPrimaryHubs.map(hub => {
                            const isSelected = (hub.distributorId || hub.id) === inviteForm.parentHubId;
                            return (
                              <div
                                key={hub.distributorId || hub.id}
                                onClick={() => {
                                  handleSelectParentHub(hub.distributorId || hub.id);
                                  setHubSearchQuery('');
                                  setIsHubDropdownOpen(false);
                                }}
                                style={{
                                  padding: '10px 14px',
                                  borderBottom: '1px solid #f1f5f9',
                                  cursor: 'pointer',
                                  background: isSelected ? '#eff6ff' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'background 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                                      {hub.businessName}
                                    </span>
                                    <span style={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      background: '#e0f2fe',
                                      color: '#0369a1',
                                      padding: '1px 6px',
                                      borderRadius: '4px'
                                    }}>
                                      PIN: {hub.primaryPincode}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    {hub.city}, {hub.state} • Manager: {hub.contactPerson || 'N/A'}
                                  </div>
                                </div>

                                {isSelected && (
                                  <Check size={16} color="#0284c7" />
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Once Hub is chosen, display locked Hub details and empty personal details form */}
                  {inviteForm.parentHubId ? (
                    <>
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '14px 16px', borderRadius: '10px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={17} color="#059669" />
                            <strong style={{ fontSize: '14px', color: '#065f46' }}>{inviteForm.parentHubName}</strong>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '6px' }}>
                            PIN: {inviteForm.primaryPincode}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#047857', lineHeight: 1.45 }}>
                          <strong>Warehouse Depot Address:</strong> {inviteForm.hubAddress || `${inviteForm.city}, ${inviteForm.state}`}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
                          ✓ Standby Relief Model: Exactly ONE manager is active at any time. When Primary is active, the Temporary Substitute is locked in Standby. When Primary activates Leave/Handoff, the Substitute takes operational command.
                        </div>
                      </div>

                      {/* ONLY ASK THE PERSON DETAILS */}
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginBottom: '12px' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          Temporary Substitute Personal Information
                        </h4>
                      </div>

                      <div className="modal-form-grid">
                        {/* Substitute Name */}
                        <div className="form-group full-width">
                          <label>Temporary Substitute Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Arvind Mehta"
                            value={inviteForm.contactPerson}
                            onChange={(e) => setInviteForm({ ...inviteForm, contactPerson: e.target.value })}
                          />
                        </div>

                        {/* Login Email */}
                        <div className="form-group">
                          <label>Substitute Login Email (Invitation will be sent here) *</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. arvind.substitute@atomy.com"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                          />
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                          <label>Contact Mobile Number (10 Digits) *</label>
                          <input
                            type="tel"
                            required
                            maxLength={15}
                            placeholder="e.g. 9822012345"
                            value={inviteForm.phone}
                            onChange={(e) => {
                              setInviteForm({ ...inviteForm, phone: normalizeIndianMobile(e.target.value) });
                            }}
                          />
                        </div>

                        {/* Temporary Password */}
                        <div className="form-group full-width">
                          <label>Temporary Portal Password *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Admin@123"
                            value={inviteForm.password}
                            onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                          />
                          <span className="field-hint">Sent securely in the invitation email for console access.</span>
                        </div>

                        {/* Send Email Checkbox */}
                        <div className="form-group full-width" style={{ marginTop: '4px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#0369a1' }}>
                            <input
                              type="checkbox"
                              checked={inviteForm.sendEmailInvite}
                              onChange={(e) => setInviteForm({ ...inviteForm, sendEmailInvite: e.target.checked })}
                              style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
                            />
                            <span>Automatically send onboarding invitation email & portal credentials via Brevo</span>
                          </label>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : (
                /* ==============================================================
                   BRAND-NEW PRIMARY DISTRIBUTOR ONBOARDING (ALL FIELDS)
                   ============================================================== */
                <div className="modal-form-grid">
                  {/* Hub & Business Name */}
                  <div className="form-group full-width">
                    <label>Business / Regional Hub Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pune Central Logistics & Atomy Hub"
                      value={inviteForm.businessName}
                      onChange={(e) => setInviteForm({ ...inviteForm, businessName: e.target.value })}
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="form-group">
                    <label>Contact Person / Hub Manager *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arvind Mehta"
                      value={inviteForm.contactPerson}
                      onChange={(e) => setInviteForm({ ...inviteForm, contactPerson: e.target.value })}
                    />
                  </div>

                  {/* Email Address */}
                  <div className="form-group">
                    <label>Distributor Login Email (Invitation will be sent here) *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. partner.logistics@atomy.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    />
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label>Contact Mobile Number (10 Digits) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={15}
                      placeholder="e.g. 9822012345"
                      value={inviteForm.phone}
                      onChange={(e) => {
                        setInviteForm({ ...inviteForm, phone: normalizeIndianMobile(e.target.value) });
                      }}
                    />
                  </div>

                  {/* Primary PIN */}
                  <div className="form-group full-width">
                    <label>Assigned Territory PIN Code (6 Digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 411001"
                      value={inviteForm.primaryPincode}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setInviteForm({ ...inviteForm, primaryPincode: d });
                      }}
                    />
                    <span className="field-hint">This Sub-Admin will strictly manage stock and orders for this specific PIN code territory.</span>
                  </div>

                  {/* City & State */}
                  <div className="form-group">
                    <label>Territory City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pune"
                      value={inviteForm.city}
                      onChange={(e) => setInviteForm({ ...inviteForm, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <select
                      value={inviteForm.state}
                      onChange={(e) => setInviteForm({ ...inviteForm, state: e.target.value })}
                    >
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Kerala">Kerala</option>
                    </select>
                  </div>

                  {/* Physical Hub Pickup Address */}
                  <div className="form-group full-width">
                    <label>Physical Hub Address (Customer Store Pickup Location) *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. No. 42, NH-44 Rayakottai Road, Near Gandhi Statue, Krishnagiri - 635001"
                      value={inviteForm.hubAddress}
                      onChange={(e) => setInviteForm({ ...inviteForm, hubAddress: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span className="field-hint">
                      This exact hub address, manager name &amp; contact number will be presented to customers when they select "Direct Hub Pickup" at checkout.
                    </span>
                  </div>

                  {/* Commercial Terms: Commission & Deposit */}
                  <div className="form-group">
                    <label>Commission Rate (%) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="3.0"
                      max="20.0"
                      value={inviteForm.commissionRate}
                      onChange={(e) => setInviteForm({ ...inviteForm, commissionRate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Security Deposit / Territory Fee (₹) *</label>
                    <input
                      type="number"
                      step="1000"
                      value={inviteForm.territoryFee}
                      onChange={(e) => setInviteForm({ ...inviteForm, territoryFee: e.target.value })}
                    />
                  </div>

                  {/* Initial Temporary Password */}
                  <div className="form-group full-width">
                    <label>Initial Temporary Portal Password *</label>
                    <input
                      type="text"
                      required
                      value={inviteForm.password}
                      onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                    />
                    <span className="field-hint">Sent securely in the invitation email for login access to the Logistics Console.</span>
                  </div>

                  {/* Send Email Checkbox */}
                  <div className="form-group full-width" style={{ marginTop: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#0369a1' }}>
                      <input
                        type="checkbox"
                        checked={inviteForm.sendEmailInvite}
                        onChange={(e) => setInviteForm({ ...inviteForm, sendEmailInvite: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
                      />
                      <span>Automatically send onboarding invitation email & login portal link via Brevo</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="invite-modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                {(!inviteForm.isSubDistributor || inviteForm.parentHubId) ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-modal-submit"
                  >
                    {isSubmitting 
                      ? 'Sending Invitation...' 
                      : inviteForm.isSubDistributor 
                        ? 'Send Invitation & Onboard Substitute' 
                        : 'Send Invitation & Onboard Hub'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn-modal-submit"
                    style={{ opacity: 0.5, cursor: 'not-allowed', background: '#94a3b8' }}
                  >
                    Select a Hub Above to Continue
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 removed: 1 Sub-Admin strictly manages 1 PIN code */}
    </div>
  );
}
