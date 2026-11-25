import React, { useState, useEffect } from 'react';
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
  Package,
  ArrowLeft,
  CreditCard,
  AlertCircle,
  Crown
} from 'lucide-react';
import { fetchMembersFromBackend } from '../../services/membershipService';
import '../Admin/AdminDashboard.css';

export default function DistributorCustomersPage({ 
  customers = [], 
  orders = [],
  distributor, 
  isLoading,
  onInspectOrder,
  members: propMembers
}) {
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [membersList, setMembersList] = useState(propMembers || []);

  useEffect(() => {
    let isMounted = true;
    async function loadMembers() {
      try {
        const data = await fetchMembersFromBackend();
        if (isMounted && Array.isArray(data)) {
          setMembersList(data);
        }
      } catch (err) {
        console.warn('Failed to load membership registry for customer tiers:', err);
      }
    }
    loadMembers();
    return () => { isMounted = false; };
  }, []);

  const getCalculatedExpiry = (member) => {
    if (member?.expiryDate) return member.expiryDate;
    const start = member?.startDate || member?.joinedAt || member?.enrolledAt || member?.createdAt;
    if (start) {
      try {
        const d = new Date(start);
        if (!isNaN(d.getTime())) {
          if (String(member?.plan || '').toUpperCase() === 'MONTHLY') {
            d.setMonth(d.getMonth() + 1);
          } else {
            d.setFullYear(d.getFullYear() + 1);
          }
          return d.toISOString().split('T')[0];
        }
      } catch {}
    }
    return '';
  };

  const isMemberExpired = (m) => {
    if (!m) return false;
    if (String(m?.status || '').toUpperCase() === 'EXPIRED') return true;
    const expiryVal = m?.expiryDate || getCalculatedExpiry(m);
    if (expiryVal) {
      try {
        const exp = new Date(expiryVal);
        if (!isNaN(exp.getTime())) {
          // If date has no time, extend validity through end-of-day 23:59:59
          if (typeof expiryVal === 'string' && (expiryVal.length === 10 || !expiryVal.includes(':'))) {
            exp.setHours(23, 59, 59, 999);
          }
          const now = new Date();
          const isToday = (
            exp.getFullYear() === now.getFullYear() &&
            exp.getMonth() === now.getMonth() &&
            exp.getDate() === now.getDate()
          );
          return exp <= now && !isToday;
        }
      } catch {}
    }
    return false;
  };

  const getCustomerTierInfo = (customer, members = membersList) => {
    const custEmail = String(customer?.email || '').toLowerCase().trim();
    const match = (members || []).find(m => {
      const memEmail = String(m?.email || m?.customerEmail || '').toLowerCase().trim();
      return memEmail && memEmail === custEmail;
    });

    // When the plan is active (or renewed), show Gold Partner
    if (match && !isMemberExpired(match)) {
      return {
        tier: 'Gold Partner',
        subtext: 'Active VIP Member',
        color: '#b45309',
        bg: '#fef3c7',
        border: '#fde68a',
        isGold: true
      };
    }

    // If the plan is expired or non-member, just show as Standard Shopper (no expired mentions)
    return {
      tier: 'Standard Shopper',
      subtext: 'Regular Consumer',
      color: '#64748b',
      bg: '#f8fafc',
      border: '#cbd5e1',
      isGold: false
    };
  };

  const resolveCustomerAddress = (cust) => {
    if (!cust) return { fullAddress: 'Registered Delivery Destination', street: '', landmark: '', city: 'Krishnagiri', state: 'Tamil Nadu', pincode: '635002' };

    let street = '';
    let landmark = cust.landmark || '';
    let city = cust.city || distributor?.city || 'Krishnagiri';
    let state = cust.state || distributor?.state || 'Tamil Nadu';
    let pincode = cust.pincode || distributor?.primaryPincode || '635002';
    let recipientName = cust.name || 'Customer';
    let contactPhone = cust.phone || '';

    if (typeof cust.shippingAddress === 'string' && cust.shippingAddress.trim()) {
      street = cust.shippingAddress.trim();
    } else if (typeof cust.address === 'string' && cust.address.trim()) {
      street = cust.address.trim();
    } else if (typeof cust.streetAddress === 'string' && cust.streetAddress.trim()) {
      street = cust.streetAddress.trim();
    }

    if (Array.isArray(cust.orderList)) {
      for (const o of cust.orderList) {
        if (!street) {
          if (typeof o.shippingAddress === 'string' && o.shippingAddress.trim()) {
            street = o.shippingAddress.trim();
          } else if (typeof o.address === 'string' && o.address.trim()) {
            street = o.address.trim();
          } else if (o.shippingAddress && typeof o.shippingAddress === 'object') {
            street = o.shippingAddress.address || o.shippingAddress.fullAddress || o.shippingAddress.street || '';
          }
        }
        if (!landmark && o.landmark) landmark = o.landmark;
        if (o.city) city = o.city;
        if (o.state) state = o.state;
        if (o.pincode) pincode = o.pincode;
        if (o.recipientName && !recipientName) recipientName = o.recipientName;
        if (o.customerPhone && !contactPhone) contactPhone = o.customerPhone;
      }
    }

    if (!street) {
      street = '12, Agraharam, Landmark: Izhal school';
    }

    return {
      recipientName,
      contactPhone,
      street,
      landmark,
      city,
      state,
      pincode,
      fullAddress: `${street}${landmark && !street.includes(landmark) ? ', Landmark: ' + landmark : ''}, ${city}, ${state} - ${pincode}`
    };
  };

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

  // Dedicated Full-Page View for Customer Details (Replaces popup to prevent any viewport overlap)
  if (selectedCustomer) {
    const tierInfo = getCustomerTierInfo(selectedCustomer, membersList);
    const custAddr = resolveCustomerAddress(selectedCustomer);
    const avgOrderVal = selectedCustomer.computedOrders > 0 ? Math.round(selectedCustomer.computedSpend / selectedCustomer.computedOrders) : 0;

    return (
      <div className="admin-tab-content animate-fade-in" style={{ paddingBottom: '50px' }}>
        {/* 1. Dedicated Top Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => setSelectedCustomer(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Customers</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontWeight: 600 }}>
              Territory PIN: <strong>{selectedCustomer.pincode || distributor?.primaryPincode}</strong>
            </span>
            <span style={{ fontSize: '12px', background: tierInfo.bg, color: tierInfo.color, border: `1.5px solid ${tierInfo.border}`, padding: '6px 14px', borderRadius: '6px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {tierInfo.isGold ? <Crown size={14} color="#b45309" /> : null}
              {tierInfo.tier}
            </span>
          </div>
        </div>

        {/* 2. Customer Hero Banner */}
        <div className="admin-card" style={{ padding: '24px 28px', borderRadius: '14px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div
              className="customer-avatar-circle"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #08267e 0%, #1e40af 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(8, 38, 126, 0.22)',
                flexShrink: 0
              }}
            >
              {(selectedCustomer.name || 'C').slice(0, 1).toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedCustomer.name}
                </h2>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Active Consumer
                </span>
                <span style={{ fontSize: '11px', background: tierInfo.bg, color: tierInfo.color, border: `1px solid ${tierInfo.border}`, padding: '3px 10px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {tierInfo.isGold ? <Crown size={12} color="#b45309" /> : null}
                  {tierInfo.tier}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap', color: '#64748b', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#08267e" />
                  <strong style={{ color: '#0f172a' }}>{selectedCustomer.email}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#08267e" />
                  <strong style={{ color: '#0f172a' }}>{selectedCustomer.phone || custAddr.contactPhone || 'N/A'}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#08267e" />
                  <span>{custAddr.city}, {custAddr.state} - {custAddr.pincode}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Comprehensive Customer Personal Details & Delivery Address Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Card A: Personal & Contact Coordinates */}
          <div className="admin-card" style={{ padding: '22px 24px', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#08267e' }}>
                <Users size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Personal & Contact Details</h3>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Customer profile & account identity</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>Full Name</span>
                <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{selectedCustomer.name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>Customer ID</span>
                <strong style={{ fontSize: '13px', color: '#08267e', display: 'block', marginTop: '2px' }}>
                  {selectedCustomer.customerId || `CUST-${custAddr.pincode}-${selectedCustomer.computedOrders}0`}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>Email Coordinate</span>
                <strong style={{ fontSize: '12.5px', color: '#0f172a', display: 'block', marginTop: '2px', wordBreak: 'break-all' }}>{selectedCustomer.email}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>Primary Phone</span>
                <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{selectedCustomer.phone || custAddr.contactPhone || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>Account Status</span>
                <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '11px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Active Consumer
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>Customer Tier</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px', background: tierInfo.bg, color: tierInfo.color, border: `1px solid ${tierInfo.border}`, padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {tierInfo.isGold ? <Crown size={11} color="#b45309" /> : null}
                  {tierInfo.tier}
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Registered Shipping & Delivery Address */}
          <div className="admin-card" style={{ padding: '22px 24px', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                <MapPin size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Delivery & Shipping Address</h3>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Primary destination for territory orders</span>
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>Full Street Address</span>
                <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#1e293b', fontWeight: 600, lineHeight: '1.5' }}>
                  {custAddr.street}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>City / District</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{custAddr.city}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>State & PIN Code</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginTop: '2px' }}>
                    {custAddr.state} - <span style={{ color: '#08267e' }}>{custAddr.pincode}</span>
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>Assigned Territory Hub</span>
                  <span style={{ fontSize: '12px', color: '#08267e', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                    PIN {distributor?.primaryPincode || custAddr.pincode} Hub
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'block' }}>Default Delivery Method</span>
                  <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                    Doorstep Courier / Hub Pickup
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Customer Key Metrics Strip (Professional KPI Wave Cards) */}
        <div className="kpi-gradient-grid four-cols" style={{ marginBottom: '28px' }}>
          {/* Lifetime Purchases */}
          <div
            className="kpi-gradient-wave-card"
            style={{
              '--card-grad': 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
              '--card-border': '#bbf7d0',
              '--card-title-color': '#166534'
            }}
          >
            <div className="kpi-grad-top">
              <div className="kpi-grad-title">Lifetime Orders</div>
              <div className="kpi-grad-icon-wrap" style={{ background: '#ffffff', color: '#16a34a' }}>
                <ShoppingBag size={19} color="#16a34a" />
              </div>
            </div>
            <div className="kpi-grad-val" style={{ color: '#14532d' }}>
              {selectedCustomer.computedOrders} <span className="kpi-grad-unit">Purchases</span>
            </div>
            <div className="kpi-grad-bottom">
              <div className="kpi-grad-trend">✓ Total completed orders</div>
              <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
                <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeOpacity="0.6" />
                <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(22, 163, 74, 0.08)" />
              </svg>
            </div>
          </div>

          {/* Lifetime Spend */}
          <div
            className="kpi-gradient-wave-card"
            style={{
              '--card-grad': 'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 100%)',
              '--card-border': '#c7d2fe',
              '--card-title-color': '#08267e'
            }}
          >
            <div className="kpi-grad-top">
              <div className="kpi-grad-title">Lifetime Spend</div>
              <div className="kpi-grad-icon-wrap" style={{ background: '#ffffff', color: '#08267e' }}>
                <IndianRupee size={19} color="#08267e" />
              </div>
            </div>
            <div className="kpi-grad-val" style={{ color: '#08267e', fontSize: '24px' }}>
              ₹ {Number(selectedCustomer.computedSpend).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="kpi-grad-bottom">
              <div className="kpi-grad-trend">▲ Territory gross revenue</div>
              <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
                <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#08267e" strokeWidth="2.2" strokeOpacity="0.6" />
                <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(8, 38, 126, 0.08)" />
              </svg>
            </div>
          </div>

          {/* Average Order Value */}
          <div
            className="kpi-gradient-wave-card"
            style={{
              '--card-grad': 'linear-gradient(145deg, #faf5ff 0%, #f3e8ff 100%)',
              '--card-border': '#e9d5ff',
              '--card-title-color': '#6b21a8'
            }}
          >
            <div className="kpi-grad-top">
              <div className="kpi-grad-title">Avg Order Value</div>
              <div className="kpi-grad-icon-wrap" style={{ background: '#ffffff', color: '#7e22ce' }}>
                <Package size={19} color="#7e22ce" />
              </div>
            </div>
            <div className="kpi-grad-val" style={{ color: '#581c87', fontSize: '24px' }}>
              ₹ {Number(avgOrderVal).toLocaleString('en-IN')}
            </div>
            <div className="kpi-grad-bottom">
              <div className="kpi-grad-trend">● Average ticket size</div>
              <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
                <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#7e22ce" strokeWidth="2.2" strokeOpacity="0.6" />
                <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(126, 34, 206, 0.08)" />
              </svg>
            </div>
          </div>

          {/* Account Tier */}
          <div
            className="kpi-gradient-wave-card"
            style={{
              '--card-grad': 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
              '--card-border': '#fde68a',
              '--card-title-color': '#92400e'
            }}
          >
            <div className="kpi-grad-top">
              <div className="kpi-grad-title">Customer Status</div>
              <div className="kpi-grad-icon-wrap" style={{ background: '#ffffff', color: '#b45309' }}>
                <ShieldCheck size={19} color="#b45309" />
              </div>
            </div>
            <div className="kpi-grad-val" style={{ color: '#78350f', fontSize: '22px' }}>
              {tierInfo.tier}
            </div>
            <div className="kpi-grad-bottom">
              <div className="kpi-grad-trend">★ Verified consumer</div>
              <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
                <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#b45309" strokeWidth="2.2" strokeOpacity="0.6" />
                <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(180, 83, 9, 0.08)" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. Complete Orders in this Territory Hub */}
        <div className="admin-card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Orders in this Territory Hub ({selectedCustomer.orderList?.length || 0})
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Detailed historical ledger of all orders placed by {selectedCustomer.name} within PIN {selectedCustomer.pincode || distributor?.primaryPincode}.
              </p>
            </div>
          </div>

          {selectedCustomer.orderList && selectedCustomer.orderList.length > 0 ? (
            <div className="atomy-table-responsive" style={{ overflowX: 'auto' }}>
              <table className="atomy-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Order ID</th>
                    <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Order Date</th>
                    <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Payment Method</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Amount</th>
                    <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Status</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCustomer.orderList.map((ord, idx) => {
                    const st = String(ord.orderStatus || ord.status || 'PLACED').toUpperCase();
                    const isDelivered = st === 'DELIVERED';
                    const isShipped = st === 'SHIPPED';
                    const isProcessing = st === 'PROCESSING';
                    const isCancelled = st === 'CANCELLED';
                    const statusColor = isDelivered ? '#15803d' : isShipped ? '#7c3aed' : isProcessing ? '#b45309' : isCancelled ? '#dc2626' : '#08267e';
                    const statusBg = isDelivered ? '#dcfce7' : isShipped ? '#ede9fe' : isProcessing ? '#fef3c7' : isCancelled ? '#fee2e2' : '#e0e7ff';
                    const statusBorder = isDelivered ? '#bbf7d0' : isShipped ? '#ddd6fe' : isProcessing ? '#fde68a' : isCancelled ? '#fecaca' : '#c7d2fe';

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#08267e' }}>
                          {ord.orderId || ord.id}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#475569', fontSize: '13px' }}>
                          {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#334155', fontSize: '13px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <CreditCard size={13} color="#64748b" />
                            <span>{ord.paymentMethod ? ord.paymentMethod.replace(/_/g, ' ') : 'ONLINE UPI'}</span>
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                          ₹ {Number(ord.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '14px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.3px', background: statusBg, color: statusColor, border: `1px solid ${statusBorder}`, textTransform: 'uppercase' }}>
                            {st}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          {onInspectOrder ? (
                            <button
                              type="button"
                              className="action-pill-btn detail"
                              onClick={() => onInspectOrder(ord.orderId || ord.id)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', fontSize: '12px' }}
                              title="Inspect Full Order Line Items"
                            >
                              <Eye size={12} />
                              <span>Inspect</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Recorded</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
              <Package size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No orders on record for this customer in this territory hub.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

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
            '--card-grad': 'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 100%)',
            '--card-border': '#c7d2fe',
            '--card-title-color': '#08267e'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Territory Consumers</div>
            <div className="kpi-grad-icon-wrap">
              <Users size={19} color="#08267e" />
            </div>
          </div>
          <div className="kpi-grad-val">
            {enrichedCustomers.length} <span className="kpi-grad-unit">verified</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Active delivery zone shoppers</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#08267e" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(8, 38, 126, 0.08)" />
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
                const tierInfo = getCustomerTierInfo(c, membersList);

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
                            <div className="cell-secondary-text" style={{ fontSize: '11px', color: '#08267e', fontWeight: '700' }}>
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

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} className="cell-price-col">
                      <span className="order-total-amount" style={{ whiteSpace: 'nowrap' }}>
                        ₹&nbsp;{Number(c.computedSpend).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: tierInfo.bg,
                        color: tierInfo.color,
                        border: `1px solid ${tierInfo.border}`
                      }}>
                        {tierInfo.isGold ? <Crown size={12} color="#b45309" /> : null}
                        {tierInfo.tier}
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
                        title="View Customer Profile and Details"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
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
  );
}
