import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Building2, 
  UserPlus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Layers, 
  X,
  Phone,
  Mail,
  Plus,
  ArrowRight
} from 'lucide-react';
import { 
  fetchPincodes, 
  fetchPincodeStats, 
  fetchDistributorList, 
  createDistributor, 
  assignPincode, 
  unassignPincode 
} from '../../services/distributorService';
import './TerritoryManagementPage.css';

export default function TerritoryManagementPage({ showToast }) {
  const [pincodes, setPincodes] = useState([]);
  const [stats, setStats] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [assignModalPincode, setAssignModalPincode] = useState(null);

  // New Distributor Form State
  const [newDistForm, setNewDistForm] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    primaryPincode: '',
    hubAddress: '',
    city: '',
    state: '',
    commissionRate: 8.0,
    territoryFee: 25000,
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pinRes, statRes, distRes] = await Promise.allSettled([
        fetchPincodes(search, '', statusFilter, 0, 100),
        fetchPincodeStats(),
        fetchDistributorList()
      ]);

      if (pinRes.status === 'fulfilled') setPincodes(pinRes.value.content || pinRes.value || []);
      if (statRes.status === 'fulfilled') setStats(statRes.value);
      if (distRes.status === 'fulfilled') setDistributors(distRes.value || []);
    } catch (err) {
      console.error('Error loading territory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleRegisterDistributor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createDistributor(newDistForm);
      if (showToast) showToast('Regional Distributor registered successfully!');
      setIsRegisterModalOpen(false);
      setNewDistForm({
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        primaryPincode: '',
        hubAddress: '',
        city: '',
        state: '',
        commissionRate: 8.0,
        territoryFee: 25000,
        password: ''
      });
      await loadData();
    } catch (err) {
      if (showToast) showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignPincode = async (pincode, distId) => {
    try {
      await assignPincode(pincode, distId);
      if (showToast) showToast(`Pincode ${pincode} successfully assigned!`);
      setAssignModalPincode(null);
      await loadData();
    } catch (err) {
      if (showToast) showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleUnassignPincode = async (pincode) => {
    if (!window.confirm(`Unassign PIN code ${pincode}? Orders will revert to Central Super Hub.`)) return;
    try {
      await unassignPincode(pincode);
      if (showToast) showToast(`Pincode ${pincode} unassigned.`);
      await loadData();
    } catch (err) {
      if (showToast) showToast(`Error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="territory-page-wrap">
      {/* 1. Header KPIs */}
      <div className="territory-stats-grid">
        <div className="territory-stat-card">
          <div className="territory-stat-title">Cataloged PIN Codes</div>
          <div className="territory-stat-value">{stats?.totalPincodes || pincodes.length}</div>
        </div>

        <div className="territory-stat-card">
          <div className="territory-stat-title">Assigned Territories</div>
          <div className="territory-stat-value" style={{ color: '#16a34a' }}>
            {stats?.assignedPincodes || pincodes.filter(p => p.status === 'ASSIGNED').length}
          </div>
        </div>

        <div className="territory-stat-card">
          <div className="territory-stat-title">Vacant / Unassigned PINs</div>
          <div className="territory-stat-value" style={{ color: '#0284c7' }}>
            {stats?.vacantPincodes !== undefined ? stats.vacantPincodes : (stats?.unassignedPincodes || pincodes.filter(p => p.status !== 'ASSIGNED').length)}
          </div>
        </div>

        <div className="territory-stat-card">
          <div className="territory-stat-title">Active Regional Distributors</div>
          <div className="territory-stat-value" style={{ color: '#0f172a' }}>
            {stats?.activeDistributors || distributors.length}
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="territory-header-bar">
        <div className="territory-search-group">
          <input
            type="text"
            className="territory-search-input"
            placeholder="Search PIN code, Post Office, City or State..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="territory-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ASSIGNED">Assigned Only</option>
            <option value="UNASSIGNED">Unassigned Only</option>
          </select>
        </div>

        <button
          type="button"
          className="territory-btn-add"
          onClick={() => setIsRegisterModalOpen(true)}
        >
          <UserPlus size={16} />
          <span>Add Regional Distributor</span>
        </button>
      </div>

      {/* 3. PIN Codes Directory Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading PIN codes catalog...
          </div>
        ) : pincodes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No Indian PIN codes matched your filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>PIN Code</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Post Office / Hub</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>District & State</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Assigned Distributor</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pincodes.map((p) => {
                  const isAssigned = p.status === 'ASSIGNED';
                  return (
                    <tr key={p.pincode} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0284c7' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> {p.pincode}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>
                        {p.officeName || 'India Post SO'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b' }}>
                        {p.district}, {p.state}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isAssigned ? (
                          <span className="territory-badge-assigned">
                            <CheckCircle2 size={12} /> Assigned
                          </span>
                        ) : (
                          <span className="territory-badge-unassigned">
                            Vacant (Super Hub)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isAssigned ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                              {p.assignedDistributorName || 'Distributor'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {p.assignedDistributorEmail} • {p.assignedDistributorPhone}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Central Platform Hub
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {isAssigned ? (
                          <button
                            type="button"
                            onClick={() => handleUnassignPincode(p.pincode)}
                            style={{ padding: '5px 12px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Unassign
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAssignModalPincode(p)}
                            style={{ padding: '5px 12px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Assign Distributor
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Register Distributor Modal */}
      {isRegisterModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Register Regional Distributor (Sub-Admin)
              </h3>
              <button type="button" onClick={() => setIsRegisterModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterDistributor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Business / Hub Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai West Regional Hub"
                  value={newDistForm.businessName}
                  onChange={(e) => setNewDistForm({ ...newDistForm, businessName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newDistForm.contactPerson}
                    onChange={(e) => setNewDistForm({ ...newDistForm, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 00000"
                    value={newDistForm.phone}
                    onChange={(e) => setNewDistForm({ ...newDistForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email (Login ID)</label>
                  <input
                    type="email"
                    required
                    placeholder="distributor@atomy.com"
                    value={newDistForm.email}
                    onChange={(e) => setNewDistForm({ ...newDistForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Initial Password</label>
                  <input
                    type="text"
                    required
                    value={newDistForm.password}
                    onChange={(e) => setNewDistForm({ ...newDistForm, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Primary PIN Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400001"
                    value={newDistForm.primaryPincode}
                    onChange={(e) => setNewDistForm({ ...newDistForm, primaryPincode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={newDistForm.city}
                    onChange={(e) => setNewDistForm({ ...newDistForm, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    required
                    value={newDistForm.commissionRate}
                    onChange={(e) => setNewDistForm({ ...newDistForm, commissionRate: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Territory License Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newDistForm.territoryFee}
                    onChange={(e) => setNewDistForm({ ...newDistForm, territoryFee: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Hub / Warehouse Physical Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 4B, Western Logistics Park, Mumbai"
                  value={newDistForm.hubAddress}
                  onChange={(e) => setNewDistForm({ ...newDistForm, hubAddress: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{ padding: '9px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '9px 20px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Registering...' : 'Register Distributor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Assign PIN Code to Distributor Modal */}
      {assignModalPincode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Assign PIN {assignModalPincode.pincode}
              </h3>
              <button type="button" onClick={() => setAssignModalPincode(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Select a Regional Distributor to take control of <strong>{assignModalPincode.officeName} ({assignModalPincode.district}, {assignModalPincode.state})</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {distributors.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No active distributors registered yet. Please add a distributor first.
                </div>
              ) : (
                distributors.map((d) => (
                  <div
                    key={d.distributorId}
                    onClick={() => handleAssignPincode(assignModalPincode.pincode, d.distributorId)}
                    style={{ padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{d.businessName}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{d.city} • PIN: {d.primaryPincode} • {d.contactPerson}</div>
                    </div>
                    <ArrowRight size={16} color="#0284c7" />
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setAssignModalPincode(null)}
                style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

