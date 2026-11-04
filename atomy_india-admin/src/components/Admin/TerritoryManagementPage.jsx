import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
  ArrowLeft,
  Users
} from 'lucide-react';
import { 
  fetchPincodes, 
  fetchPincodeStats, 
  fetchDistributorList, 
  createDistributor, 
  assignPincode, 
  unassignPincode 
} from '../../services/distributorService';
import DistributorCustomersPage from '../Distributor/DistributorCustomersPage';
import './TerritoryManagementPage.css';

export default function TerritoryManagementPage({ showToast, orders = [], customers = [] }) {
  const [pincodes, setPincodes] = useState([]);
  const [stats, setStats] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Sub-Admin Inspection State
  const [selectedDistributor, setSelectedDistributor] = useState(null);

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

  // Open Sub-Admin page for a distributor
  const handleSelectDistributor = (dist) => {
    const formattedDist = {
      id: dist.id || dist.distributorId || 'DIST-635002',
      distributorId: dist.distributorId || dist.id || 'DIST-635002',
      distributorName: dist.distributorName || dist.businessName || dist.contactPerson || dist.assignedDistributorName || 'Selva',
      contactPerson: dist.contactPerson || dist.assignedDistributorName || 'Selva',
      email: dist.email || dist.assignedDistributorEmail || 'selva@atomy.com',
      phone: dist.phone || dist.assignedDistributorPhone || '+91 98765 43210',
      primaryPincode: String(dist.primaryPincode || dist.pincode || '635002').trim(),
      assignedPincodes: dist.assignedPincodes || [String(dist.primaryPincode || dist.pincode || '635002').trim()],
      city: dist.city || dist.district || 'Krishnagiri',
      state: dist.state || 'Tamil Nadu',
      hubAddress: dist.hubAddress || dist.address || `${dist.city || dist.district || 'Krishnagiri'}, ${dist.state || 'Tamil Nadu'}`
    };
    setSelectedDistributor(formattedDist);
  };

  // Build active distributors list for prominent sub-admin tiles
  const activeDistributorsList = useMemo(() => {
    const map = new Map();

    // 1. Registered distributors
    (distributors || []).forEach(d => {
      const pin = String(d.primaryPincode || d.pincode || '').trim();
      const name = d.businessName || d.distributorName || d.contactPerson || 'Regional Distributor';
      const key = `${pin}_${name}`;
      map.set(key, {
        id: d.id || d.distributorId || `DIST-${pin}`,
        distributorId: d.distributorId || d.id || `DIST-${pin}`,
        distributorName: name,
        contactPerson: d.contactPerson || name,
        email: d.email || 'distributor@atomy.com',
        phone: d.phone || '+91 98765 43210',
        primaryPincode: pin || '635002',
        assignedPincodes: d.assignedPincodes || [pin || '635002'],
        city: d.city || 'Krishnagiri',
        state: d.state || 'Tamil Nadu',
        hubAddress: d.hubAddress || `${d.city || 'Regional Hub'}, ${d.state || 'Tamil Nadu'}`
      });
    });

    // 2. Assigned PIN codes
    pincodes.forEach(p => {
      if (p.status === 'ASSIGNED' && p.assignedDistributorName) {
        const pin = String(p.pincode).trim();
        const key = `${pin}_${p.assignedDistributorName}`;
        if (!map.has(key)) {
          map.set(key, {
            id: p.assignedDistributorId || `DIST-${pin}`,
            distributorId: p.assignedDistributorId || `DIST-${pin}`,
            distributorName: p.assignedDistributorName,
            contactPerson: p.assignedDistributorName,
            email: p.assignedDistributorEmail || 'selva@atomy.com',
            phone: p.assignedDistributorPhone || '+91 98765 43210',
            primaryPincode: pin,
            assignedPincodes: [pin],
            city: p.district || 'Krishnagiri',
            state: p.state || 'Tamil Nadu',
            hubAddress: `${p.officeName || 'Regional Hub'}, ${p.district}, ${p.state}`
          });
        }
      }
    });

    // 3. Fallback: Selva (PIN 635002)
    if (map.size === 0) {
      map.set('635002_Selva', {
        id: 'DIST-635002',
        distributorId: 'DIST-635002',
        distributorName: 'Selva (Regional Hub)',
        contactPerson: 'Selva',
        email: 'selva@atomy.com',
        phone: '+91 98765 43210',
        primaryPincode: '635002',
        assignedPincodes: ['635002'],
        city: 'Krishnagiri',
        state: 'Tamil Nadu',
        hubAddress: 'Krishnagiri Regional Hub Logistics, Tamil Nadu - 635002'
      });
    }

    return Array.from(map.values());
  }, [distributors, pincodes]);

  // VIEW 1: Sub-Admin Page & Customer Directory Output
  if (selectedDistributor) {
    return (
      <div className="territory-page-wrap">
        {/* Top Full-Width Navigation Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setSelectedDistributor(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                color: '#1e293b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <ArrowLeft size={16} />
              <span>Back to Distributors &amp; Territories</span>
            </button>
            <div style={{ height: '28px', width: '1px', background: '#cbd5e1' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedDistributor.distributorName} — Sub-Admin Customer Directory
                </h3>
                <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '3px 9px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                  PIN: {selectedDistributor.primaryPincode}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                Assigned Territory: {selectedDistributor.city}, {selectedDistributor.state} • Contact: {selectedDistributor.phone} • {selectedDistributor.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#0369a1', background: '#e0f2fe', padding: '5px 12px', borderRadius: '14px', fontWeight: 700, border: '1px solid #bae6fd' }}>
              Sub-Admin Output View
            </span>
          </div>
        </div>

        {/* Customer Directory Output for this Sub-Admin */}
        <DistributorCustomersPage
          distributor={selectedDistributor}
          customers={customers}
          orders={orders}
          isLoading={false}
        />
      </div>
    );
  }

  // VIEW 2: Default Distributors & Territories Management View
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
            {stats?.activeDistributors || activeDistributorsList.length}
          </div>
        </div>
      </div>

      {/* 2. Active Regional Distributors (Sub-Admins) Cards Grid */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#0284c7" />
            <span>Active Regional Distributors (Sub-Admins)</span>
          </h3>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            Click any distributor to open their Sub-Admin Console &amp; Customer Directory
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {activeDistributorsList.map((dist, idx) => (
            <div
              key={dist.id || dist.distributorId || idx}
              onClick={() => handleSelectDistributor(dist)}
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(2,132,199,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              }}
              title="Click to open Sub-Admin Console & Customer Directory"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', border: '1px solid #86efac' }}>
                    ACTIVE SUB-ADMIN
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: '12px' }}>
                    PIN: {dist.primaryPincode}
                  </span>
                </div>

                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  {dist.distributorName}
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
                  {dist.hubAddress}
                </div>

                <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={12} color="#94a3b8" />
                    <span>{dist.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={12} color="#94a3b8" />
                    <span>{dist.phone}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#0284c7', fontWeight: 700, fontSize: '12.5px' }}>
                <span>Open Sub-Admin Customer Directory</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
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

      {/* 4. PIN Codes Directory Table */}
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
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>District &amp; State</th>
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
                          <div 
                            onClick={() => handleSelectDistributor(p)}
                            style={{ 
                              cursor: 'pointer', 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              background: '#f0f9ff', 
                              border: '1px solid #bae6fd', 
                              display: 'inline-flex', 
                              flexDirection: 'column', 
                              gap: '2px', 
                              transition: 'all 0.15s ease' 
                            }}
                            title="Click to open Sub-Admin Console & Customer Directory"
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#f0f9ff'; }}
                          >
                            <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building2 size={13} />
                              <span>{p.assignedDistributorName || 'Distributor'}</span>
                              <ArrowRight size={12} color="#0284c7" />
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {p.assignedDistributorEmail} • {p.assignedDistributorPhone}
                            </div>
                            <span style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                              Open Sub-Admin Customer Directory →
                            </span>
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

      {/* 5. Register Distributor Modal */}
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

      {/* 6. Assign PIN Code to Distributor Modal */}
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
