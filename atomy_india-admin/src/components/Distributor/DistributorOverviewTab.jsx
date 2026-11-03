import React from 'react';
import { 
  IndianRupee, 
  Package, 
  Boxes,
  Truck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  TrendingUp, 
  Users, 
  ShoppingBag,
  Sparkles,
  Crown,
  ArrowRight,
  ShieldCheck,
  Send,
  Eye
} from 'lucide-react';
import '../Admin/AdminDashboard.css';

export default function DistributorOverviewTab({ 
  stats, 
  orders = [], 
  customers = [], 
  distributor, 
  onNavigateTab, 
  onSelectOrderForDispatch 
}) {
  const commRate = Number(distributor?.commissionRate || 8.0);
  const totalRev = Number(stats?.totalRevenue || orders.filter(o => String(o.orderStatus || '').toUpperCase() !== 'CANCELLED').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0));
  const totalComm = Number(stats?.totalCommission || (totalRev * commRate) / 100);

  // Today's orders in territory
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => {
    const d = new Date(o.createdAt || Date.now());
    return d >= startOfToday;
  });

  const todaySale = todayOrders.filter(o => String(o.orderStatus || '').toUpperCase() !== 'CANCELLED').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const placedCount = orders.filter(o => {
    const st = String(o.orderStatus || 'PLACED').toUpperCase();
    return st === 'PLACED' || st === 'NEW';
  }).length;

  const processingCount = orders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'PROCESSING';
  }).length;

  const shippedCount = orders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'SHIPPED' || st === 'OUT_FOR_DELIVERY';
  }).length;

  const deliveredCount = orders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'DELIVERED';
  }).length;

  const delayedOrders = orders.filter(o => {
    const st = String(o.orderStatus || 'PLACED').toUpperCase();
    if (st === 'DELIVERED' || st === 'CANCELLED') return false;
    const base = new Date(o.createdAt || Date.now());
    const deadline = new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000);
    return new Date() > deadline;
  });

  const recentOrders = orders.slice(0, 8);
  const assignedPins = distributor?.assignedPincodes || [distributor?.primaryPincode].filter(Boolean);

  return (
    <div>
      {/* 1. Header Heading Row with Subtitle & Quick Controls */}
      <div className="content-heading-row" style={{ paddingTop: '4px', marginBottom: '22px' }}>
        <div>
          <h2 className="content-title">Territory Overview &amp; Regional Hub KPIs</h2>
          <p className="content-subtitle">
            Real-time fulfillment metrics, Blue Dart dispatch SLAs, and commission payouts for PIN: <strong>{distributor?.primaryPincode}</strong> ({distributor?.city || 'Regional Hub'}, {distributor?.state || 'India'})
          </p>
        </div>
        <div className="heading-actions-cluster">
          <button 
            type="button" 
            className="primary-action-btn" 
            onClick={() => onNavigateTab('orders')}
          >
            <Package size={15} />
            <span>Manage Orders ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Top Sales KPI Cards: Curved Wing Cards (Identical to Super Admin) */}
      <div className="kpi-curve-grid">
        {/* Card 1: Today's Total Sale */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#0284c7', cursor: 'pointer' }}
          onClick={() => onNavigateTab('finance')}
          title="View Today's Financial Settlement"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">TODAY'S TERRITORY SALE</div>
            <div className="kpi-curve-val">
              ₹ {todaySale.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="kpi-curve-sub">
              From <strong>{todayOrders.length} orders</strong> placed today • <span style={{ color: '#0284c7', fontWeight: 600 }}>View Finance →</span>
            </div>
          </div>
          <div className="kpi-curve-right-wing">
            <svg viewBox="0 0 120 140" preserveAspectRatio="none" className="kpi-curve-wing-svg">
              <path d="M 50 0 C 15 35 15 105 50 140 L 120 140 L 120 0 Z" fill="#e0f2fe" />
            </svg>
            <div className="kpi-curve-icon-badge">
              <TrendingUp size={22} color="#0284c7" />
            </div>
          </div>
        </div>

        {/* Card 2: Today's Orders */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#15803d', cursor: 'pointer' }}
          onClick={() => onNavigateTab('orders')}
          title="Inspect Territory Orders"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">TODAY'S ORDERS</div>
            <div className="kpi-curve-val">
              {todayOrders.length} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>orders</span>
            </div>
            <div className="kpi-curve-sub">
              Received in your PIN code territory • <span style={{ color: '#15803d', fontWeight: 600 }}>View Orders →</span>
            </div>
          </div>
          <div className="kpi-curve-right-wing">
            <svg viewBox="0 0 120 140" preserveAspectRatio="none" className="kpi-curve-wing-svg">
              <path d="M 50 0 C 15 35 15 105 50 140 L 120 140 L 120 0 Z" fill="#dcfce7" />
            </svg>
            <div className="kpi-curve-icon-badge">
              <ShoppingBag size={22} color="#15803d" />
            </div>
          </div>
        </div>

        {/* Card 3: Overall Total Sale & Commission */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#334155', cursor: 'pointer' }}
          onClick={() => onNavigateTab('finance')}
          title="Open Commission Ledger"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">OVERALL TERRITORY SALE</div>
            <div className="kpi-curve-val">
              ₹ {totalRev.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="kpi-curve-sub">
              Your Commission ({commRate}%): <strong style={{ color: '#15803d' }}>+₹{Math.round(totalComm).toLocaleString('en-IN')}</strong> • <span style={{ color: '#00a3e0', fontWeight: 600 }}>Settlements →</span>
            </div>
          </div>
          <div className="kpi-curve-right-wing">
            <svg viewBox="0 0 120 140" preserveAspectRatio="none" className="kpi-curve-wing-svg">
              <path d="M 50 0 C 15 35 15 105 50 140 L 120 140 L 120 0 Z" fill="#f1f5f9" />
            </svg>
            <div className="kpi-curve-icon-badge">
              <IndianRupee size={22} color="#334155" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Shortcuts Strip */}
      <div className="overview-quick-actions-bar" style={{ marginBottom: '24px' }}>
        <span className="quick-actions-label">
          <Sparkles size={14} color="#00a3e0" />
          <span>QUICK ACTIONS:</span>
        </span>
        <div className="quick-actions-links-row">
          <button 
            type="button" 
            className="quick-action-pill-btn" 
            onClick={() => onNavigateTab('inventory')}
          >
            <Boxes size={13} color="#00A3E0" />
            <span>Hub Inventory</span>
          </button>

          <button 
            type="button" 
            className="quick-action-pill-btn" 
            onClick={() => onNavigateTab('orders')}
          >
            <Package size={13} color="#0284c7" />
            <span>Fulfill Customer Orders</span>
          </button>

          <button 
            type="button" 
            className="quick-action-pill-btn" 
            onClick={() => onNavigateTab('customers')}
          >
            <Users size={13} color="#0284c7" />
            <span>Territory Customers ({customers.length})</span>
          </button>

          <button 
            type="button" 
            className="quick-action-pill-btn" 
            onClick={() => onNavigateTab('membership')}
          >
            <Crown size={13} color="#eab308" />
            <span>Member Accounts</span>
          </button>

          <button 
            type="button" 
            className="quick-action-pill-btn" 
            onClick={() => onNavigateTab('finance')}
          >
            <IndianRupee size={13} color="#15803d" />
            <span>Payout Settlement</span>
          </button>
        </div>
      </div>

      {/* 4. Order Status Pipeline: Step Cards with Wavy Header & Numbers (Matching Super Admin Exactly) */}
      <div className="kpi-step-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Step 01: PLACED */}
        <div
          className="kpi-step-card"
          style={{ '--step-bg': '#f0f9ff', '--step-color': '#0284c7' }}
          onClick={() => onNavigateTab('orders')}
          title="Filter New Placed Orders"
        >
          <div className="kpi-step-top-header">
            <div className="kpi-step-icon-badge">
              <Package size={20} color="#0284c7" />
            </div>
            <div className="kpi-step-number">01</div>
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="kpi-step-wave-svg">
              <path d="M 0 12 Q 25 22 50 14 T 100 16 L 100 24 L 0 24 Z" fill="#ffffff" />
            </svg>
          </div>
          <div className="kpi-step-body">
            <div className="kpi-step-title">NEW (PLACED)</div>
            <div className="kpi-step-val">{placedCount}</div>
            <div className="kpi-step-sub">Awaiting warehouse pack</div>
          </div>
        </div>

        {/* Step 02: PROCESSING */}
        <div
          className="kpi-step-card"
          style={{ '--step-bg': '#fefce8', '--step-color': '#ca8a04' }}
          onClick={() => onNavigateTab('orders')}
          title="Filter Processing Orders"
        >
          <div className="kpi-step-top-header">
            <div className="kpi-step-icon-badge">
              <Clock size={20} color="#ca8a04" />
            </div>
            <div className="kpi-step-number">02</div>
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="kpi-step-wave-svg">
              <path d="M 0 12 Q 25 22 50 14 T 100 16 L 100 24 L 0 24 Z" fill="#ffffff" />
            </svg>
          </div>
          <div className="kpi-step-body">
            <div className="kpi-step-title">PROCESSING</div>
            <div className="kpi-step-val">{processingCount}</div>
            <div className="kpi-step-sub">Preparing for courier</div>
          </div>
        </div>

        {/* Step 03: IN TRANSIT */}
        <div
          className="kpi-step-card"
          style={{ '--step-bg': '#f5f3ff', '--step-color': '#7c3aed' }}
          onClick={() => onNavigateTab('orders')}
          title="Filter In Transit Orders"
        >
          <div className="kpi-step-top-header">
            <div className="kpi-step-icon-badge">
              <Truck size={20} color="#7c3aed" />
            </div>
            <div className="kpi-step-number">03</div>
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="kpi-step-wave-svg">
              <path d="M 0 12 Q 25 22 50 14 T 100 16 L 100 24 L 0 24 Z" fill="#ffffff" />
            </svg>
          </div>
          <div className="kpi-step-body">
            <div className="kpi-step-title">IN TRANSIT</div>
            <div className="kpi-step-val">{shippedCount}</div>
            <div className="kpi-step-sub">Dispatched with AWB</div>
          </div>
        </div>

        {/* Step 04: DELIVERED */}
        <div
          className="kpi-step-card"
          style={{ '--step-bg': '#f0fdf4', '--step-color': '#16a34a' }}
          onClick={() => onNavigateTab('orders')}
          title="Filter Delivered Orders"
        >
          <div className="kpi-step-top-header">
            <div className="kpi-step-icon-badge">
              <CheckCircle2 size={20} color="#16a34a" />
            </div>
            <div className="kpi-step-number">04</div>
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="kpi-step-wave-svg">
              <path d="M 0 12 Q 25 22 50 14 T 100 16 L 100 24 L 0 24 Z" fill="#ffffff" />
            </svg>
          </div>
          <div className="kpi-step-body">
            <div className="kpi-step-title">DELIVERED</div>
            <div className="kpi-step-val">{deliveredCount}</div>
            <div className="kpi-step-sub">Handover complete</div>
          </div>
        </div>

        {/* Step 05: DELAYED SLA */}
        <div
          className="kpi-step-card"
          style={{ '--step-bg': '#fee2e2', '--step-color': '#dc2626' }}
          onClick={() => onNavigateTab('orders')}
          title="Filter Delayed Orders"
        >
          <div className="kpi-step-top-header">
            <div className="kpi-step-icon-badge">
              <AlertTriangle size={20} color="#dc2626" />
            </div>
            <div className="kpi-step-number">05</div>
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="kpi-step-wave-svg">
              <path d="M 0 12 Q 25 22 50 14 T 100 16 L 100 24 L 0 24 Z" fill="#ffffff" />
            </svg>
          </div>
          <div className="kpi-step-body">
            <div className="kpi-step-title">DELAYED SLA</div>
            <div className="kpi-step-val" style={{ color: delayedOrders.length > 0 ? '#dc2626' : '#0f172a' }}>
              {delayedOrders.length}
            </div>
            <div className="kpi-step-sub">
              {delayedOrders.length > 0 ? 'Overdue 2-day delivery' : 'All within SLA'}
            </div>
          </div>
        </div>

        {/* Step 06: EARNED COMMISSION */}
        <div
          className="kpi-step-card"
          style={{ '--step-bg': '#ecfdf5', '--step-color': '#059669' }}
          onClick={() => onNavigateTab('finance')}
          title="View Financial Commission Ledger"
        >
          <div className="kpi-step-top-header">
            <div className="kpi-step-icon-badge">
              <IndianRupee size={20} color="#059669" />
            </div>
            <div className="kpi-step-number">06</div>
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="kpi-step-wave-svg">
              <path d="M 0 12 Q 25 22 50 14 T 100 16 L 100 24 L 0 24 Z" fill="#ffffff" />
            </svg>
          </div>
          <div className="kpi-step-body">
            <div className="kpi-step-title">EARNED COMM.</div>
            <div className="kpi-step-val" style={{ color: '#059669' }}>
              ₹{Math.round(totalComm).toLocaleString('en-IN')}
            </div>
            <div className="kpi-step-sub">{commRate}% Partner Rate</div>
          </div>
        </div>
      </div>

      {/* 5. Recent Orders Table in Master Admin Card using .atomy-data-table */}
      <div className="admin-card" style={{ marginBottom: '32px' }}>
        <div className="card-title-row" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Recent Territory Customer Orders
            </h3>
            <p className="card-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Live customer orders automatically routed to your regional hub based on delivery PIN code
            </p>
          </div>
          <button 
            type="button" 
            className="secondary-btn" 
            onClick={() => onNavigateTab('orders')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>View All ({orders.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <Package size={38} color="#cbd5e1" style={{ marginBottom: '10px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>No orders recorded in your assigned PIN codes yet.</p>
          </div>
        ) : (
          <div className="atomy-table-responsive orders-table-wrapper">
            <table className="atomy-data-table orders-data-table">
              <thead>
                <tr>
                  <th style={{ width: '180px', minWidth: '180px' }}>Order ID &amp; Date</th>
                  <th style={{ minWidth: '220px' }}>Customer &amp; Address</th>
                  <th style={{ width: '110px', minWidth: '110px', textAlign: 'center' }}>Delivery PIN</th>
                  <th style={{ width: '140px', minWidth: '140px', textAlign: 'center' }}>Order Status</th>
                  <th style={{ width: '130px', minWidth: '130px', textAlign: 'right' }}>Total Amount</th>
                  <th style={{ width: '130px', minWidth: '130px', textAlign: 'right' }}>Commission</th>
                  <th style={{ width: '190px', minWidth: '190px' }}>Courier / Tracking</th>
                  <th style={{ width: '120px', minWidth: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const orderAmt = Number(o.totalAmount || 0);
                  const isCancelled = String(o.orderStatus || '').toUpperCase() === 'CANCELLED';
                  const earnedCommission = isCancelled ? 0 : ((orderAmt * commRate) / 100);

                  const hasRealTracking = Boolean(o.tracking?.trackingNumber && !o.tracking.trackingNumber.startsWith('MOCK'));

                  return (
                    <tr key={o.orderId || o.id}>
                      <td>
                        <div className="order-id-badge">
                          <span className="order-id-text">{o.orderId || o.id}</span>
                        </div>
                        <div className="order-date-text">
                          {new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      <td>
                        <div className="cell-primary-text">{o.customerName || 'Customer'}</div>
                        <div className="cell-secondary-text">{o.city}, {o.state}</div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="pincode-pill">
                          {o.pincode}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`payment-pill ${(o.orderStatus || 'PLACED').toLowerCase()}`}>
                          {o.orderStatus || 'PLACED'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }} className="cell-price-col">
                        <span className="order-total-amount">
                          ₹ {orderAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }} className="cell-price-col">
                        {isCancelled ? (
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                            ₹0.00 (Cancelled)
                          </span>
                        ) : (
                          <span style={{ fontWeight: 700, color: '#16a34a' }}>
                            +₹{earnedCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>

                      <td>
                        {hasRealTracking ? (
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Truck size={12} /> {o.tracking.courierPartner || 'Blue Dart Express'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                              AWB: <strong>{o.tracking.trackingNumber}</strong>
                            </div>
                          </div>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: '#f1f5f9',
                            color: '#64748b'
                          }}>
                            Pending Dispatch
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="action-pill-btn tracking"
                          onClick={() => onSelectOrderForDispatch(o)}
                          title="Update Tracking / Dispatch Order"
                        >
                          <Send size={12} />
                          <span>Dispatch</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
