import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Search, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Truck, 
  X, 
  CheckCircle2, 
  Gift 
} from 'lucide-react';
import { fetchMembersFromBackend } from '../../services/membershipService';
import '../Admin/AdminDashboard.css';

export default function DistributorMembershipsPage({ distributor, territoryOrders = [] }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('ALL');

  const assignedPins = distributor?.assignedPincodes || [distributor?.primaryPincode].filter(Boolean);

  useEffect(() => {
    async function loadMembers() {
      setIsLoading(true);
      try {
        const all = await fetchMembersFromBackend();
        const territoryEmails = new Set(
          (territoryOrders || []).map(o => (o.customerEmail || '').toLowerCase().trim()).filter(Boolean)
        );

        // Filter members that belong to this distributor's territory (by pincode or territory orders)
        const territoryMembers = (all || []).filter(m => {
          const pin = String(m.pincode || m.pin || '').trim();
          const email = (m.email || m.customerEmail || '').toLowerCase().trim();
          const myPin = String(distributor?.primaryPincode || '').trim();
          if (myPin && pin === myPin) return true;
          if (email && territoryEmails.has(email)) return true;
          return false;
        });

        setMembers(territoryMembers);
      } catch (e) {
        console.error('Failed to load territory members', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadMembers();
  }, [distributor, territoryOrders]);

  const filtered = members.filter((m) => {
    if (selectedPlanFilter !== 'ALL') {
      const pl = String(m.plan || 'ANNUAL').toUpperCase();
      if (!pl.includes(selectedPlanFilter)) return false;
    }

    if (memberSearchQuery.trim()) {
      const q = memberSearchQuery.toLowerCase().trim();
      const matchName = String(m.name || m.fullName || '').toLowerCase().includes(q);
      const matchEmail = String(m.email || '').toLowerCase().includes(q);
      const matchId = String(m.memberId || m.id || '').toLowerCase().includes(q);
      const matchPin = String(m.pincode || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId && !matchPin) return false;
    }

    return true;
  });

  const annualCount = members.filter(m => String(m.plan || '').toUpperCase().includes('ANNUAL')).length;

  return (
    <div className="admin-tab-content">
      {/* 1. Content Heading Row */}
      <div className="content-heading-row with-filter">
        <div>
          <h2 className="content-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={22} color="#eab308" />
              <span>Territory Membership &amp; Loyalty Privileges</span>
            </span>
          </h2>
          <p className="content-subtitle">
            Privileged Atomy Distributor Members residing in your assigned delivery PIN code: <strong>{distributor?.primaryPincode}</strong> ({distributor?.city || 'Regional Hub'}, {distributor?.state}).
          </p>
        </div>
      </div>

      {/* 2. Membership KPI Cards Strip */}
      <div className="kpi-gradient-grid">
        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #fefce8 0%, #fef08a 100%)',
            '--card-border': '#fde047',
            '--card-title-color': '#a16207'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Territory Members</div>
            <div className="kpi-grad-icon-wrap">
              <Crown size={19} color="#ca8a04" />
            </div>
          </div>
          <div className="kpi-grad-val">
            {members.length} <span className="kpi-grad-unit">enrolled</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Active verified members in PIN area</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#ca8a04" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(202, 138, 4, 0.08)" />
            </svg>
          </div>
        </div>

        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
            '--card-border': '#bbf7d0',
            '--card-title-color': '#15803d'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Annual Privilege Tier</div>
            <div className="kpi-grad-icon-wrap">
              <Sparkles size={19} color="#16a34a" />
            </div>
          </div>
          <div className="kpi-grad-val">
            {annualCount || members.length} <span className="kpi-grad-unit">VIPs</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ 100% Free Express Delivery privileged</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(22, 163, 74, 0.08)" />
            </svg>
          </div>
        </div>

        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
            '--card-border': '#bae6fd',
            '--card-title-color': '#0369a1'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Courier SLA Speed</div>
            <div className="kpi-grad-icon-wrap">
              <Truck size={19} color="#0284c7" />
            </div>
          </div>
          <div className="kpi-grad-val">
            24-48 <span className="kpi-grad-unit">hrs</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Priority dispatch for members</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(2, 132, 199, 0.08)" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Search and Summary Filter Bar */}
      <div className="orders-filter-row">
        <div className="search-input-wrapper orders-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by Member ID, Name, Email, or PIN..."
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            className="atomy-search-input"
          />
          {memberSearchQuery && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => setMemberSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="orders-summary-pill">
          <span>Showing <strong>{filtered.length}</strong> of <strong>{members.length}</strong> Territory Members</span>
        </div>
      </div>

      {/* 4. Members Table */}
      <div className="atomy-table-responsive">
        <table className="atomy-data-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Member ID</th>
              <th>Contact Details</th>
              <th>Assigned Territory</th>
              <th style={{ textAlign: 'center' }}>Membership Tier</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th>Enrolled Date</th>
              <th>Privilege Rights</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="table-empty-row">
                  <p>Loading territory members...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-row">
                  <Crown size={36} color="#94a3b8" />
                  <p>No members registered in this territory matching search query.</p>
                </td>
              </tr>
            ) : (
              filtered.map((m, idx) => (
                <tr key={m.memberId || idx}>
                  <td>
                    <div className="customer-avatar-row">
                      <div className="customer-avatar-circle" style={{ background: '#fef08a', color: '#854d0e', border: '1px solid #fde047' }}>
                        {(m.name || 'M').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="cell-primary-text">{m.name}</div>
                        <div className="cell-secondary-text" style={{ fontSize: '11px', color: '#ca8a04', fontWeight: 700 }}>
                          Verified Atomy Gold
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="order-id-badge" style={{ background: '#f8fafc', color: '#0369a1', borderColor: '#bae6fd' }}>
                      {m.memberId || `ATOMY-${idx + 1001}`}
                    </span>
                  </td>

                  <td>
                    <div className="cell-secondary-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} color="#94a3b8" />
                      <span>{m.email}</span>
                    </div>
                    <div className="cell-secondary-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <Phone size={12} color="#94a3b8" />
                      <span>{m.phone || 'N/A'}</span>
                    </div>
                  </td>

                  <td>
                    <div className="address-line-sub">
                      {m.city || distributor?.city}, {m.state || distributor?.state} <span className="pincode-pill">{m.pincode || distributor?.primaryPincode}</span>
                    </div>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      backgroundColor: '#fef9c3',
                      color: '#a16207',
                      border: '1px solid #fef08a'
                    }}>
                      <Crown size={12} /> Annual VIP
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className="sla-badge delivered" style={{ display: 'inline-flex', padding: '3px 9px' }}>
                      <CheckCircle2 size={11} color="#15803d" /> Active
                    </span>
                  </td>

                  <td>
                    <div className="order-date-text">
                      {new Date(m.joinedAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Truck size={13} color="#00A3E0" /> Free Blue Dart Delivery
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
