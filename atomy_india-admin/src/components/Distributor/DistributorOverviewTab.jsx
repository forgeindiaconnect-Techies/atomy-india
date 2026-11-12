import React, { useState, useEffect, useMemo } from 'react';
import { 
  IndianRupee, 
  Package, 
  Boxes,
  Truck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Users, 
  ShoppingBag,
  Sparkles, 
  Crown, 
  ArrowRight, 
  ShieldCheck, 
  Send, 
  Eye, 
  TrendingUp,
  Plus,
  Bell,
  Headphones,
  Volume2
} from 'lucide-react';
import { ALL_CATALOG_PRODUCTS } from '../../data/mockData';
import { fetchDistributorInventory } from '../../services/distributorService';
import { fetchAdminTickets, isDemoTicket } from '../../services/api';
import { formatTimeIST } from '../../utils/dateUtils';
import '../Admin/AdminDashboard.css';

export default function DistributorOverviewTab({ 
  stats, 
  orders = [], 
  customers = [], 
  distributor, 
  onNavigateTab, 
  onSelectOrderForDispatch 
}) {
  const assignedPins = distributor?.assignedPincodes || [distributor?.primaryPincode].filter(Boolean);
  const validPins = new Set(Array.isArray(assignedPins) ? assignedPins.map(p => String(p).trim()) : []);
  if (distributor?.primaryPincode) validPins.add(String(distributor.primaryPincode).trim());

  const currentDistId = String(distributor?.distributorId || distributor?.id || '').trim();

  // Territory orders strictly for assigned PIN codes or assigned distributor
  const territoryOrders = orders.filter(o => {
    if (currentDistId && o.assignedDistributorId && String(o.assignedDistributorId).trim() === currentDistId) {
      return true;
    }
    const p = String(o.pincode || o.shippingAddress?.pincode || '').trim();
    return p && validPins.size > 0 ? validPins.has(p) : false;
  });

  const displayOrders = territoryOrders.length > 0 ? territoryOrders : orders;

  const commRate = Number(distributor?.commissionRate || 8.0);
  const totalRev = Number(stats?.totalRevenue || displayOrders.filter(o => String(o.orderStatus || '').toUpperCase() !== 'CANCELLED').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0));
  const totalComm = Number(stats?.totalCommission || (totalRev * commRate) / 100);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayTerritoryOrders = displayOrders.filter(o => {
    const d = new Date(o.createdAt || o.date || o.orderDate || Date.now());
    return d >= todayStart && String(o.orderStatus || '').toUpperCase() !== 'CANCELLED';
  });

  const todaySale = todayTerritoryOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const todayOrdersCount = todayTerritoryOrders.length;
  const overallSale = totalRev;

  const placedCount = displayOrders.filter(o => {
    const st = String(o.orderStatus || 'PLACED').toUpperCase();
    return st === 'PLACED' || st === 'NEW';
  }).length;

  const processingCount = displayOrders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'PROCESSING';
  }).length;

  const shippedCount = displayOrders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'SHIPPED' || st === 'OUT_FOR_DELIVERY';
  }).length;

  const deliveredCount = displayOrders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'DELIVERED';
  }).length;

  const delayedOrders = displayOrders.filter(o => {
    const st = String(o.orderStatus || 'PLACED').toUpperCase();
    if (st === 'DELIVERED' || st === 'CANCELLED') return false;
    const base = new Date(o.createdAt || Date.now());
    const deadline = new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000);
    return new Date() > deadline;
  });

  // Fetch live distributor regional stock
  const [inventoryList, setInventoryList] = useState([]);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadStock() {
      try {
        const dId = distributor?.distributorId || distributor?.id || '';
        if (dId) {
          const liveStock = await fetchDistributorInventory(dId);
          if (isMounted && Array.isArray(liveStock) && liveStock.length > 0) {
            setInventoryList(liveStock);
            return;
          }
        }
      } catch (err) {
        console.debug('Distributor inventory load note:', err?.message);
      }
      if (isMounted && Array.isArray(ALL_CATALOG_PRODUCTS)) {
        setInventoryList(ALL_CATALOG_PRODUCTS);
      }
    }
    loadStock();

    // Load open tickets count live from backend API and clean stale demo tickets
    async function loadTicketsCount() {
      try {
        const liveTickets = await fetchAdminTickets();
        if (isMounted && Array.isArray(liveTickets)) {
          const valid = liveTickets.filter(t => !isDemoTicket(t));
          const openCount = valid.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || !t.status).length;
          setOpenTicketsCount(openCount);
          try {
            localStorage.setItem('atomy_admin_tickets', JSON.stringify(valid));
          } catch {}
          return;
        }
      } catch (e) {
        console.debug('Distributor tickets live count note:', e?.message);
      }

      // Fallback to localStorage after strictly sanitizing demo tickets
      try {
        const saved = localStorage.getItem('atomy_admin_tickets');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(t => !isDemoTicket(t));
            const openCount = valid.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || !t.status).length;
            if (isMounted) setOpenTicketsCount(openCount);
            localStorage.setItem('atomy_admin_tickets', JSON.stringify(valid));
            return;
          }
        }
        if (isMounted) setOpenTicketsCount(0);
      } catch (e) {
        if (isMounted) setOpenTicketsCount(0);
      }
    }
    loadTicketsCount();

    const handleTicketsUpdated = () => {
      loadTicketsCount();
    };
    window.addEventListener('storage', handleTicketsUpdated);
    window.addEventListener('atomy:ticket-updated', handleTicketsUpdated);

    return () => { 
      isMounted = false; 
      window.removeEventListener('storage', handleTicketsUpdated);
      window.removeEventListener('atomy:ticket-updated', handleTicketsUpdated);
    };
  }, [distributor?.distributorId, distributor?.id]);

  const stockStats = useMemo(() => {
    const list = Array.isArray(inventoryList) && inventoryList.length > 0 ? inventoryList : (ALL_CATALOG_PRODUCTS || []);
    const totalSkus = list.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    list.forEach(p => {
      const q = Number(p.stockQuantity ?? p.stock ?? (p.inStock ? 25 : 0));
      const th = Number(p.lowStockThreshold || 10);
      if (q > th) {
        inStock++;
      } else if (q > 0) {
        lowStock++;
      } else {
        outOfStock++;
      }
    });

    return { 
      totalSkus, 
      inStockCount: inStock, 
      lowStockCount: lowStock, 
      outOfStockCount: outOfStock 
    };
  }, [inventoryList]);

  // Robust order items resolver to guarantee product name and quantity
  const resolveOrderItems = (order) => {
    if (!order) return [];
    const rawItems = (Array.isArray(order.items) && order.items.length > 0)
      ? order.items
      : (Number(order.totalAmount) > 0 ? [{ price: order.totalAmount, qty: 1 }] : []);

    return rawItems.map(it => {
      const rawCode = String(it.productId || it.id || it.code || it.productCode || '').trim();
      const rawName = String(it.productName || it.name || it.title || '').trim();
      const rawPrice = Number(it.unitPrice ?? it.price ?? 0);

      const matched = 
        (rawCode ? (ALL_CATALOG_PRODUCTS || []).find(p => p && String(p.id).toLowerCase() === rawCode.toLowerCase()) : null) ||
        (rawName ? (ALL_CATALOG_PRODUCTS || []).find(p => p && p.name && p.name.toLowerCase() === rawName.toLowerCase()) : null) ||
        (rawPrice > 0 ? (ALL_CATALOG_PRODUCTS || []).find(p => Number(p.price) === rawPrice) : null);

      const resolvedName = rawName || matched?.name || (rawCode ? `Atomy Product (${rawCode})` : 'Atomy Authentic Product');
      const resolvedQty = Number(it.quantity ?? it.qty ?? it.count ?? 1) || 1;

      return {
        name: resolvedName,
        quantity: resolvedQty
      };
    });
  };

  const recentOrders = displayOrders.slice(0, 6);

  return (
    <div>
      {/* 1. Header Heading Row with Subtitle & Quick Controls */}
      <div className="content-heading-row" style={{ paddingTop: '4px', marginBottom: '20px' }}>
        <div>
          <h2 className="content-title">Territory Overview</h2>
          <p className="content-subtitle">
            Real-time fulfillment metrics, Blue Dart dispatch SLAs, and territory performance for PIN: <strong>{distributor?.primaryPincode || 'Assigned Territory'}</strong> ({distributor?.city || 'Regional Hub'}, {distributor?.state || 'India'})
          </p>
        </div>
        <div className="heading-actions-cluster">
          <button 
            type="button" 
            className="primary-action-btn" 
            onClick={() => onNavigateTab('orders')}
          >
            <Package size={15} />
            <span>Manage Orders ({displayOrders.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Top Sales KPI Cards (Curved Wave with Circular Icon Badge) */}
      <div className="kpi-curve-grid" style={{ marginBottom: '24px' }}>
        {/* Card 1: Today's Total Sale */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#0284c7', cursor: 'pointer' }}
          onClick={() => onNavigateTab('finance')}
          title="View Today's Financial Settlement & Details"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">TODAY'S TOTAL SALE</div>
            <div className="kpi-curve-val">
              ₹ {todaySale.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="kpi-curve-sub">
              From <strong>{todayOrdersCount} orders</strong> placed today • <span style={{ color: '#0284c7', fontWeight: 600 }}>View Finance →</span>
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
          title="Inspect Today's Orders & Customer Fulfillment"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">TODAY'S ORDERS</div>
            <div className="kpi-curve-val">
              {todayOrdersCount} <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>orders</span>
            </div>
            <div className="kpi-curve-sub">
              Direct public consumer orders received • <span style={{ color: '#15803d', fontWeight: 600 }}>View Orders →</span>
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

        {/* Card 3: Overall Total Sale */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#334155', cursor: 'pointer' }}
          onClick={() => onNavigateTab('finance')}
          title="Open Financial Ledger, Refunds & Settlements"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">OVERALL TOTAL SALE</div>
            <div className="kpi-curve-val">
              ₹ {overallSale.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="kpi-curve-sub">
              Total lifetime gross revenue across all orders • <span style={{ color: '#00a3e0', fontWeight: 600 }}>Ledger &amp; Audit →</span>
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

      {/* 3. The 5 Core Status KPI Cards (01 Placed, 02 Processing, 03 In Transit, 04 Delivered, 05 Delayed SLA) */}
      <div className="kpi-step-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
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

      {/* 4. Superadmin-Style Overview Split: Recent Orders & Stock Health with Shortcuts */}
      <div className="atomy-overview-split" style={{ marginBottom: '32px' }}>
        {/* Left Card: Recent Customer Orders */}
        <div className="atomy-card-box">
          <div className="card-box-header">
            <div className="box-title-group">
              <Package size={18} color="#00A3E0" />
              <h3>Recent Customer Orders</h3>
            </div>
            <button className="link-button" onClick={() => onNavigateTab('orders')}>
              View All Orders ({displayOrders.length}) →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-box-note" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
              <Package size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
              <div>No customer orders recorded in your territory yet.</div>
            </div>
          ) : (
            <div className="recent-orders-list">
              {recentOrders.map((o) => (
                <div
                  key={o.orderId || o.id}
                  className="recent-order-row clickable"
                  onClick={() => {
                    onNavigateTab('orders');
                    if (onSelectOrderForDispatch) onSelectOrderForDispatch(o);
                  }}
                >
                  <div className="recent-order-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="order-id-badge">{o.orderId || o.id}</span>
                      {o.fulfillmentType === 'STORE_PICKUP' && (
                        <span style={{ fontSize: '10.5px', fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px' }}>
                          🏢 Pickup
                        </span>
                      )}
                    </div>
                    <div className="customer-info-line">
                      <strong>{o.customerName || 'Customer'}</strong> • {o.city || o.state || distributor?.city || 'Local Territory'} ({formatTimeIST(o.createdAt || o.date)})
                    </div>
                    <div className="order-items-snippet">
                      {resolveOrderItems(o).map(it => `${it.name} (x${it.quantity})`).join(', ') || '1 item'}
                    </div>
                  </div>
                  <div className="order-row-right">
                    <span className="order-price">₹ {Number(o.totalAmount || 0).toLocaleString('en-IN')}</span>
                    <span className={`status-badge ${(o.orderStatus || 'PLACED').toLowerCase()}`}>{o.orderStatus || 'PLACED'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Card: Warehouse Stock Health & Quick Action Center */}
        <div className="atomy-card-box">
          <div className="card-box-header">
            <div className="box-title-group">
              <Boxes size={18} color="#00A3E0" />
              <h3>Inventory &amp; Stock Health</h3>
            </div>
            <button className="link-button" onClick={() => onNavigateTab('inventory')}>
              Manage Catalog →
            </button>
          </div>

          <div className="inv-health-list">
            <div className="health-row">
              <span>Total Registered Catalog SKUs</span>
              <strong>{stockStats.totalSkus}</strong>
            </div>
            <div className="health-row">
              <span>In Stock Products</span>
              <strong className="text-green">
                {stockStats.inStockCount}
              </strong>
            </div>
            <div className="health-row">
              <span>Low Stock Warnings (&le; 10 units)</span>
              <strong className="text-yellow">{stockStats.lowStockCount}</strong>
            </div>
            <div className="health-row">
              <span>Out of Stock SKUs</span>
              <strong className="text-red">{stockStats.outOfStockCount}</strong>
            </div>
          </div>

          <div className="quick-actions-box">
            <div className="quick-actions-title">OPERATIONAL SHORTCUTS</div>
            <div className="quick-btn-grid">
              <button className="quick-action-tile" onClick={() => onNavigateTab('inventory')}>
                <Plus size={16} />
                <span>Add Product</span>
              </button>
              <button className="quick-action-tile" onClick={() => onNavigateTab('orders')}>
                <Bell size={16} />
                <span>Review New ({placedCount})</span>
              </button>
              <button className="quick-action-tile" onClick={() => onNavigateTab('support')}>
                <Headphones size={16} />
                <span>Support Desk ({openTicketsCount})</span>
              </button>
              <button className="quick-action-tile" onClick={() => onNavigateTab('settings')}>
                <Volume2 size={16} />
                <span>Sound Controls</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
