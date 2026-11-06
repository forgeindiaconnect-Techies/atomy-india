import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ShieldCheck, 
  IndianRupee, 
  X, 
  Eye, 
  CheckCircle2,
  Calendar,
  Package
} from 'lucide-react';
import '../Admin/AdminDashboard.css';

export default function DistributorCustomersPage({ 
  customers = [], 
  orders = [],
  distributor, 
  isLoading 
}) {
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const primaryPin = String(distributor?.primaryPincode || '635002').trim();
  const assignedPins = new Set(
    (distributor?.assignedPincodes && distributor.assignedPincodes.length > 0
      ? distributor.assignedPincodes
      : [primaryPin]
    ).map(p => String(p).trim()).filter(p => p === primaryPin)
  );
  if (assignedPins.size === 0) assignedPins.add(primaryPin);

  // Strict territory filtering: only include consumers whose address PIN strictly matches assigned PIN
  const territoryCustomers = (customers || []).filter(c => {
    const custPin = String(c.pincode || '').trim();
    return custPin ? assignedPins.has(custPin) : false;
  });

  // Compute metrics per customer
  const enrichedCustomers = territoryCustomers.map((c) => {
    const custEmail = (c.email || '').toLowerCase().trim();
    const custOrders = (orders || []).filter(o => (o.customerEmail || '').toLowerCase().trim() === custEmail);
    const totalOrdersCount = custOrders.length || Number(c.totalOrders || 1);
    const totalSpend = custOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0) || Number(c.totalSpent || 0);

    // Latest order date
    const latestOrderDate = custOrders.length > 0 
      ? new Date(Math.max(...custOrders.map(o => new Date(o.createdAt || Date.now()).getTime())))
      : (c.lastOrderDate ? new Date(c.lastOrderDate) : null);

    return {
      ...c,
      computedOrders: totalOrdersCount,
      computedSpend: totalSpend,
      latestDate: latestOrderDate,
      orderList: custOrders
    };
  });

  const filteredCustomers = enrichedCustomers.filter((c) => {
    if (!customerSearchQuery.trim()) return true;
    const q = customerSearchQuery.toLowerCase().trim();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.pincode || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q)
    );
  });

  const repeatBuyersCount = enrichedCustomers.filter(c => c.computedOrders > 1).length;
  const overallCustomerSpend = enrichedCustomers.reduce((acc, c) => acc + c.computedSpend, 0);
  const avgLifetimeValue = enrichedCustomers.length > 0 
    ? Math.round(overallCustomerSpend / enrichedCustomers.length) 
    : 0;

  return (
    <div className="admin-tab-content">
      {/* 1. Content Heading Row */}
      <div className="content-heading-row with-filter">
        <div>
          <h2 className="content-title">Customer Directory &amp; Territory Accounts</h2>
          <p className="content-subtitle">
            Registered consumers, repeat buyers, and direct purchasing histories residing in assigned PIN: <strong>{distributor?.primaryPincode}</strong> ({distributor?.city || 'Regional Hub'}, {distributor?.state}).
          </p>
        </div>
      </div>

      {/* 2. Customer Stats Strip - Design 3: Dim Light Gradient Wave Cards (Matching Super Admin) */}
      <div className="kpi-gradient-grid">
        {/* Card 1: Registered Accounts */}
        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
            '--card-border': '#bae6fd',
            '--card-title-color': '#0369a1'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Territory Consumers</div>
            <div className="kpi-grad-icon-wrap">
              <Users size={19} color="#0284c7" />
            </div>
          </div>
          <div className="kpi-grad-val">
            {enrichedCustomers.length} <span className="kpi-grad-unit">verified</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Active delivery zone shoppers</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(2, 132, 199, 0.08)" />
            </svg>
          </div>
        </div>

        {/* Card 2: Repeat Buyers */}
        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
            '--card-border': '#bbf7d0',
            '--card-title-color': '#15803d'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Repeat Buyers</div>
            <div className="kpi-grad-icon-wrap">
              <ShieldCheck size={19} color="#16a34a" />
            </div>
          </div>
          <div className="kpi-grad-val">
            {repeatBuyersCount} <span className="kpi-grad-unit">customers</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ High retention local shoppers</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(22, 163, 74, 0.08)" />
            </svg>
          </div>
        </div>

        {/* Card 3: Average Territory Spend */}
        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
            '--card-border': '#cbd5e1',
            '--card-title-color': '#334155'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Average Order Value</div>
            <div className="kpi-grad-icon-wrap">
              <IndianRupee size={19} color="#475569" />
            </div>
          </div>
          <div className="kpi-grad-val">
            ₹ {avgLifetimeValue.toLocaleString('en-IN')}
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Territory consumer spend average</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#475569" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(71, 85, 105, 0.08)" />
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
            placeholder="Search by Customer Name, Email, Phone, or PIN..."
            value={customerSearchQuery}
            onChange={(e) => setCustomerSearchQuery(e.target.value)}
            className="atomy-search-input"
          />
          {customerSearchQuery && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => setCustomerSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="orders-summary-pill">
          <span>Showing <strong>{filteredCustomers.length}</strong> of <strong>{enrichedCustomers.length}</strong> Customers</span>
        </div>
      </div>

      {/* 4. Customer Directory Table */}
      <div className="atomy-table-responsive">
        <table className="atomy-data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Details</th>
              <th>Location</th>
              <th style={{ textAlign: 'center' }}>Total Orders</th>
              <th style={{ textAlign: 'right' }}>Lifetime Spend</th>
              <th style={{ textAlign: 'center' }}>Customer Tier</th>
              <th>Last Order Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="table-empty-row">
                  <p>Loading territory customers...</p>
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-row">
                  <Users size={36} color="#94a3b8" />
                  <p>No customers found matching search in this territory.</p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c, idx) => {
                const tier = c.computedSpend > 10000 ? 'Gold Partner' : c.computedOrders > 2 ? 'Privileged' : 'Standard Shopper';
                const tierColor = tier === 'Gold Partner' ? '#eab308' : tier === 'Privileged' ? '#00A3E0' : '#64748b';

                return (
                  <tr key={idx}>
                    <td>
                      <div className="customer-avatar-row">
                        <div className="customer-avatar-circle">
                          {(c.name || 'C').slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="cell-primary-text">{c.name || 'Customer'}</div>
                          {c.customerId && (
                            <div className="cell-secondary-text" style={{ fontSize: '11px', color: '#00A3E0', fontWeight: '700' }}>
                              {c.customerId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="cell-secondary-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} color="#94a3b8" />
                        <span>{c.email}</span>
                      </div>
                      <div className="cell-secondary-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Phone size={12} color="#94a3b8" />
                        <span>{c.phone || 'N/A'}</span>
                      </div>
                    </td>

                    <td>
                      <div className="address-line-sub">
                        {c.city || distributor?.city}, {c.state || distributor?.state} <span className="pincode-pill">{c.pincode}</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="items-count-badge">
                        {c.computedOrders} order{c.computedOrders !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }} className="cell-price-col">
                      <span className="order-total-amount">
                        ₹ {Number(c.computedSpend).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: `${tierColor}15`,
                        color: tierColor,
                        border: `1px solid ${tierColor}40`
                      }}>
                        {tier}
                      </span>
                    </td>

                    <td>
                      {c.latestDate ? (
                        <div className="order-date-text">
                          {c.latestDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>New Shopper</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="action-pill-btn detail"
                        onClick={() => setSelectedCustomer(c)}
                        title="View Customer Order Details"
                      >
                        <Eye size={13} />
                        <span>View Orders</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Customer Profile & Order History Modal */}
      {selectedCustomer && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="customer-avatar-circle" style={{ width: '42px', height: '42px', fontSize: '18px' }}>
                  {(selectedCustomer.name || 'C').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="admin-modal-title">{selectedCustomer.name}</h3>
                  <span className="admin-modal-subtitle">
                    PIN: {selectedCustomer.pincode} • {selectedCustomer.city || distributor?.city}
                  </span>
                </div>
              </div>
              <button type="button" className="admin-modal-close-btn" onClick={() => setSelectedCustomer(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Email Coordinate</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{selectedCustomer.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Phone</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{selectedCustomer.phone || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Lifetime Orders</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#00A3E0' }}>{selectedCustomer.computedOrders} Purchases</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Lifetime Value</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>₹ {Number(selectedCustomer.computedSpend).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                Orders in this Territory Hub
              </div>

              {selectedCustomer.orderList && selectedCustomer.orderList.length > 0 ? (
                <div className="atomy-table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table className="atomy-data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.orderList.map((ord, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, color: '#00A3E0' }}>{ord.orderId || ord.id}</td>
                          <td>{new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
                          <td style={{ fontWeight: 700 }}>₹ {Number(ord.totalAmount).toLocaleString('en-IN')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`payment-pill ${(ord.orderStatus || 'PLACED').toLowerCase()}`}>
                              {ord.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
                  Order history managed under assigned PIN territory.
                </p>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setSelectedCustomer(null)}
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
