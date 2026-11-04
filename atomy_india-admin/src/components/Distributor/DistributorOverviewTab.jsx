import React, { useState, useEffect } from 'react';
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
  Eye,
  Bell,
  Settings
} from 'lucide-react';
import { INITIAL_ADMIN_PRODUCTS } from '../../data/defaultAdminProducts';
import { fetchDistributorInventory } from '../../services/distributorService';
import '../Admin/AdminDashboard.css';

export default function DistributorOverviewTab({ 
  stats, 
  orders = [], 
  customers = [], 
  distributor, 
  onNavigateTab, 
  onSelectOrderForDispatch 
}) {
  const [products, setProducts] = useState(INITIAL_ADMIN_PRODUCTS || []);

  const distId = String(distributor?.distributorId || distributor?.id || 'DIST-635002').toLowerCase();

  useEffect(() => {
    let isMounted = true;
    const targetDistId = distributor?.distributorId || distributor?.id || 'DIST-635002';
    fetchDistributorInventory(targetDistId)
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => {
        console.warn('Using default catalog for hub overview:', err);
      });
    return () => { isMounted = false; };
  }, [distributor?.distributorId, distributor?.id]);

  const assignedPins = distributor?.assignedPincodes || [distributor?.primaryPincode].filter(Boolean);
  const validPins = new Set(Array.isArray(assignedPins) ? assignedPins : []);
  if (distributor?.primaryPincode) validPins.add(String(distributor.primaryPincode).trim());
  if (validPins.size === 0) validPins.add('635002');

  // Territory orders strictly for assigned PIN codes
  const territoryOrders = orders.filter(o => {
    const p = String(o.pincode || o.shippingAddress?.pincode || '').trim();
    return p ? validPins.has(p) : false;
  });

  const commRate = Number(distributor?.commissionRate || 8.0);
  const totalRev = Number(stats?.totalRevenue || territoryOrders.filter(o => String(o.orderStatus || '').toUpperCase() !== 'CANCELLED').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0));
  const totalComm = Number(stats?.totalCommission || (totalRev * commRate) / 100);

  // Today's orders in territory
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayOrders = territoryOrders.filter(o => {
    const d = new Date(o.createdAt || Date.now());
    return d >= startOfToday;
  });

  const todaySale = todayOrders.filter(o => String(o.orderStatus || '').toUpperCase() !== 'CANCELLED').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const placedCount = territoryOrders.filter(o => {
    const st = String(o.orderStatus || 'PLACED').toUpperCase();
    return st === 'PLACED' || st === 'NEW';
  }).length;

  const processingCount = territoryOrders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'PROCESSING';
  }).length;

  const shippedCount = territoryOrders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'SHIPPED' || st === 'OUT_FOR_DELIVERY';
  }).length;

  const deliveredCount = territoryOrders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'DELIVERED';
  }).length;

  const delayedOrders = territoryOrders.filter(o => {
    const st = String(o.orderStatus || 'PLACED').toUpperCase();
    if (st === 'DELIVERED' || st === 'CANCELLED') return false;
    const base = new Date(o.createdAt || Date.now());
    const deadline = new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000);
    return new Date() > deadline;
  });

  const resolveOrderItems = (order) => {
    if (!order) return [];
    const rawItems = (Array.isArray(order.items) && order.items.length > 0)
      ? order.items
      : (Number(order.totalAmount) > 0 ? [{ price: order.totalAmount, qty: 1 }] : []);

    return rawItems.map(it => {
      const rawCode = String(it.productId || it.id || it.code || it.productCode || it.sku || '').trim();
      const rawName = String(it.productName || it.name || it.title || '').trim();
      const rawPrice = Number(it.unitPrice ?? it.price ?? 0);

      const matched = 
        (rawCode ? INITIAL_ADMIN_PRODUCTS.find(p => p && String(p.id).toLowerCase() === rawCode.toLowerCase()) : null) ||
        (rawName ? INITIAL_ADMIN_PRODUCTS.find(p => p && p.name && p.name.toLowerCase() === rawName.toLowerCase()) : null) ||
        (rawPrice > 0 ? INITIAL_ADMIN_PRODUCTS.find(p => Number(p.price) === rawPrice) : null);

      return {
        name: rawName || matched?.name || (rawCode ? `Atomy Product (${rawCode})` : 'Atomy Authentic Product'),
        quantity: Number(it.quantity ?? it.qty ?? it.count ?? 1) || 1
      };
    });
  };

  return (
    <div>
      {/* 1. Header Heading Row with Subtitle & Quick Controls */}
      <div className="content-heading-row" style={{ paddingTop: '4px', marginBottom: '22px' }}>
        <div>
          <h2 className="content-title">Territory Overview &amp; Regional Hub KPIs</h2>
          <p className="content-subtitle">
            Real-time fulfillment metrics, Blue Dart dispatch SLAs, and inventory management for PIN: <strong>{distributor?.primaryPincode}</strong> ({distributor?.city || 'Regional Hub'}, {distributor?.state || 'India'})
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

        {/* Card 3: Overall Total Sale (Identical to Super Admin) */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#334155', cursor: 'pointer' }}
          onClick={() => onNavigateTab('finance')}
          title="Open Financial Ledger & Settlements"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">OVERALL TERRITORY SALE</div>
            <div className="kpi-curve-val">
              ₹ {totalRev.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="kpi-curve-sub">
              Total lifetime territory revenue across all orders • <span style={{ color: '#00a3e0', fontWeight: 600 }}>Settlements →</span>
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
      </div>

      {/* 5. Overview Details Split (Identical to Super Admin) */}
      <div className="atomy-overview-split" style={{ marginBottom: '32px' }}>
        {/* Left Box: Recent Customer Orders */}
        <div className="atomy-card-box">
          <div className="card-box-header">
            <div className="box-title-group">
              <Package size={18} color="#00A3E0" />
              <h3>Recent Customer Orders</h3>
            </div>
            <button className="link-button" onClick={() => onNavigateTab('orders')}>
              View All Orders ({territoryOrders.length}) →
            </button>
          </div>

          {territoryOrders.length === 0 ? (
            <div className="empty-box-note">No customer orders recorded in your territory yet.</div>
          ) : (
            <div className="recent-orders-list">
              {territoryOrders.slice(0, 5).map((o) => (
                <div
                  key={o.orderId || o.id}
                  className="recent-order-row clickable"
                  onClick={() => {
                    if (onSelectOrderForDispatch) onSelectOrderForDispatch(o);
                    else onNavigateTab('orders');
                  }}
                  title="Click to view and dispatch order"
                >
                  <div className="recent-order-left">
                    <span className="order-id-badge">{o.orderId || o.id}</span>
                    <div className="customer-info-line">
                      <strong>{o.customerName || 'Customer'}</strong> • {o.city || distributor?.city || 'Regional Hub'} ({new Date(o.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </div>
                    <div className="order-items-snippet">
                      {resolveOrderItems(o).map(it => `${it.name} (x${it.quantity})`).join(', ') || '1 item'}
                    </div>
                  </div>
                  <div className="order-row-right">
                    <span className="order-price">₹ {Number(o.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className={`status-badge ${(o.orderStatus || 'PLACED').toLowerCase()}`}>{o.orderStatus || 'PLACED'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Box: Warehouse Stock Health & Quick Action Center */}
        <div className="atomy-card-box">
          <div className="card-box-header">
            <div className="box-title-group">
              <Boxes size={18} color="#00A3E0" />
              <h3>Inventory &amp; Stock Health</h3>
            </div>
            <button className="link-button" onClick={() => onNavigateTab('inventory')}>
              Manage Hub Stock →
            </button>
          </div>

          <div className="inv-health-list">
            <div className="health-row">
              <span>Total Registered Catalog SKUs</span>
              <strong>{products.length}</strong>
            </div>
            <div className="health-row">
              <span>In Stock Products</span>
              <strong className="text-green">
                {products.filter(p => Number(p.stockQuantity ?? 15) > (p.lowStockThreshold || 10)).length}
              </strong>
            </div>
            <div className="health-row">
              <span>Low Stock Warnings (&le; 10 units)</span>
              <strong className="text-yellow">
                {products.filter(p => Number(p.stockQuantity ?? 15) > 0 && Number(p.stockQuantity ?? 15) <= (p.lowStockThreshold || 10)).length}
              </strong>
            </div>
            <div className="health-row">
              <span>Out of Stock SKUs</span>
              <strong className="text-red">
                {products.filter(p => Number(p.stockQuantity ?? 15) === 0).length}
              </strong>
            </div>
          </div>

          <div className="quick-actions-box">
            <div className="quick-actions-title">OPERATIONAL SHORTCUTS</div>
            <div className="quick-btn-grid">
              <button className="quick-action-tile" onClick={() => onNavigateTab('inventory')}>
                <Boxes size={16} />
                <span>Manage Stock</span>
              </button>
              <button className="quick-action-tile" onClick={() => onNavigateTab('orders')}>
                <Bell size={16} />
                <span>Review New ({placedCount})</span>
              </button>
              <button className="quick-action-tile" onClick={() => onNavigateTab('customers')}>
                <Users size={16} />
                <span>Customers ({customers.length})</span>
              </button>
              <button className="quick-action-tile" onClick={() => onNavigateTab('settings')}>
                <Settings size={16} />
                <span>Hub Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
