import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard,
  Boxes,
  Package, 
  Users, 
  IndianRupee,
  Crown,
  Settings,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  ExternalLink,
  LogOut,
  RefreshCw,
  Bell,
  Headphones,
  X
} from 'lucide-react';
import Header from '../Header/Header';
import DistributorOverviewTab from './DistributorOverviewTab';
import DistributorInventoryPage from './DistributorInventoryPage';
import DistributorOrdersPage from './DistributorOrdersPage';
import DistributorCustomersPage from './DistributorCustomersPage';
import DistributorSupportPage from './DistributorSupportPage';
import DistributorMembershipsPage from './DistributorMembershipsPage';
import DistributorFinancePage from './DistributorFinancePage';
import DistributorSettingsPage from './DistributorSettingsPage';
import DistributorTrackingModal from './DistributorTrackingModal';
import ProductEditorPage from '../Admin/ProductEditorPage';
import { updateAdminProduct } from '../../services/api';
import { 
  fetchDistributorStats, 
  fetchDistributorOrders, 
  updateDistributorOrderTracking, 
  updateDistributorOrderStatus,
  fetchDistributorCustomers,
  fetchDistributorProfile,
  updateDistributorStock
} from '../../services/distributorService';
import { playOrderAlertSound, sendDesktopNotification } from '../../services/soundAlerts';
import '../Admin/AdminDashboard.css';

export default function DistributorDashboard({ distributorUser, onLogout, onBackToStore }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | inventory | orders | customers | support | membership | finance | settings
  const [liveDistributor, setLiveDistributor] = useState(distributorUser);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);

  // Active High-Impact Alert Banner state
  const [activeAlert, setActiveAlert] = useState(null);
  const knownOrderIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // Full Product Editor State
  const [isEditingProductView, setIsEditingProductView] = useState(false);
  const [currentEditingProduct, setCurrentEditingProduct] = useState(null);
  const [refreshInventoryKey, setRefreshInventoryKey] = useState(0);

  const currentDist = liveDistributor || distributorUser;
  const distId = currentDist?.distributorId || currentDist?.id || '';
  const assignedPins = currentDist?.assignedPincodes || [currentDist?.primaryPincode].filter(Boolean);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const triggerDistributorOrderAlert = (order, isLiveRealtime = false) => {
    if (!order) return;
    const orderIdStr = String(order.orderId || order.id || '');
    if (!orderIdStr) return;

    // Trigger audible fanfare chime
    playOrderAlertSound(0.95);

    // Show high-priority shaking alert banner
    setActiveAlert({
      type: 'order',
      title: '🚨 NEW REGIONAL HUB ORDER RECEIVED!',
      message: `Order #${orderIdStr} placed by ${order.customerName || order.recipient || 'Customer'} (PIN: ${order.pincode || currentDist?.primaryPincode}) for ₹ ${Number(order.totalAmount || order.grandTotal || 0).toLocaleString('en-IN')}`,
      time: 'Just now',
      targetId: orderIdStr
    });

    // Native desktop push notification
    sendDesktopNotification(`🚨 Atomy Hub: New Order #${orderIdStr}`, {
      body: `Customer ${order.customerName || order.recipient || 'Customer'} placed order for ₹ ${Number(order.totalAmount || order.grandTotal || 0).toLocaleString('en-IN')}. Assigned to PIN ${order.pincode || currentDist?.primaryPincode}.`
    });
  };

  const matchesDistributorTerritory = (o) => {
    if (!o) return false;
    const pin = String(o.pincode || o.shippingAddress?.pincode || '').trim();
    const validPins = new Set(Array.isArray(assignedPins) ? assignedPins : []);
    if (currentDist?.primaryPincode) validPins.add(String(currentDist.primaryPincode).trim());
    if (validPins.size === 0) validPins.add('635002');

    // Strict PIN code matching: only orders in the distributor's assigned PIN codes
    return pin ? validPins.has(pin) : false;
  };

  const loadDashboardData = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const [profileRes, statsRes, ordersRes, custsRes] = await Promise.allSettled([
        fetchDistributorProfile(distId),
        fetchDistributorStats(distId),
        fetchDistributorOrders(distId, 'ALL'),
        fetchDistributorCustomers(distId)
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setLiveDistributor(prev => ({ ...prev, ...profileRes.value }));
      }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        // Strict territory filtering: only orders belonging to assigned PIN codes
        const freshOrders = ordersRes.value.filter(matchesDistributorTerritory);
        setOrders(freshOrders);

        // Detect newly arrived orders not in initial load
        if (!isInitialLoadRef.current) {
          freshOrders.forEach(o => {
            const oid = String(o.orderId || o.id || '');
            if (oid && !knownOrderIdsRef.current.has(oid)) {
              triggerDistributorOrderAlert(o, true);
            }
          });
        }

        freshOrders.forEach(o => {
          const oid = String(o.orderId || o.id || '');
          if (oid) knownOrderIdsRef.current.add(oid);
        });
        isInitialLoadRef.current = false;
      }
      if (custsRes.status === 'fulfilled') setCustomers(custsRes.value);
    } catch (err) {
      console.error('Failed to load distributor data:', err);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // 1. Setup real-time BroadcastChannel listeners
    let orderChannel = null;
    let syncChannel = null;

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        orderChannel = new BroadcastChannel('atomy_order_channel');
        orderChannel.onmessage = (event) => {
          const data = event.data;
          if (data && (data.type === 'ORDER_PLACED' || data.type === 'NEW_ORDER') && data.order) {
            const o = data.order;
            if (matchesDistributorTerritory(o)) {
              triggerDistributorOrderAlert(o, true);
              loadDashboardData(true);
            }
          }
        };

        syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.onmessage = (event) => {
          const data = event.data;
          if (data && (data.type === 'ORDER_PLACED' || data.type === 'NEW_ORDER') && data.order) {
            const o = data.order;
            if (matchesDistributorTerritory(o)) {
              triggerDistributorOrderAlert(o, true);
              loadDashboardData(true);
            }
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }

    // 2. Real-time background sync polling every 5 seconds
    const pollInterval = setInterval(() => {
      loadDashboardData(true);
    }, 5000);

    return () => {
      if (orderChannel) orderChannel.close();
      if (syncChannel) syncChannel.close();
      clearInterval(pollInterval);
    };
  }, [distId, JSON.stringify(assignedPins)]);

  const handleUpdateTracking = async (orderId, trackingPayload) => {
    try {
      const res = await updateDistributorOrderTracking(orderId, distId, trackingPayload);
      const targetStatus = trackingPayload.orderStatus || trackingPayload.currentStatus || 'SHIPPED';
      
      // Update local state immediately
      setOrders(prev => prev.map(o => {
        if (o.orderId === orderId || o.id === orderId) {
          return {
            ...o,
            orderStatus: targetStatus,
            courier: trackingPayload.courierPartner || o.courier,
            tracking: {
              ...(o.tracking || {}),
              courierPartner: trackingPayload.courierPartner,
              trackingNumber: trackingPayload.trackingNumber,
              currentStatus: targetStatus,
              currentLocation: trackingPayload.initialLocation,
              estimatedDelivery: trackingPayload.estimatedDelivery
            }
          };
        }
        return o;
      }));

      // Broadcast live to customer website and all open tabs
      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId, newStatus: targetStatus });
      } catch (e) {}

      // Update localStorage atomy_placed_orders if present
      try {
        const localOrdersRaw = localStorage.getItem('atomy_placed_orders');
        if (localOrdersRaw) {
          const list = JSON.parse(localOrdersRaw);
          const statusMap = {
            'PLACED': 'Payment Completed',
            'PROCESSING': 'Preparing Shipment',
            'SHIPPED': 'In Transit',
            'OUT_FOR_DELIVERY': 'Out for Delivery',
            'DELIVERED': 'Delivered',
            'CANCELLED': 'Cancelled'
          };
          const updated = list.map(o => {
            if (o.orderId === orderId) {
              return {
                ...o,
                status: statusMap[targetStatus] || targetStatus,
                orderStatus: targetStatus,
                trackingNumber: trackingPayload.trackingNumber || o.trackingNumber,
                courier: trackingPayload.courierPartner || o.courier
              };
            }
            return o;
          });
          localStorage.setItem('atomy_placed_orders', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('atomy:orders-updated', { detail: updated }));
        }
      } catch (e) {}

      showToast('Dispatch tracking updated & customer notified via email / SMS!');
      await loadDashboardData();
      return res;
    } catch (err) {
      showToast(`Error: ${err.message || 'Tracking update failed'}`);
      throw err;
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDistributorOrderStatus(orderId, distId, newStatus);
      setOrders(prev => prev.map(o => {
        if (o.orderId === orderId || o.id === orderId) {
          const isCodOrder = (o.paymentMethod || '').toLowerCase().includes('cash') || (o.paymentMethod || '').toLowerCase().includes('cod');
          const newPaymentStatus = (newStatus === 'DELIVERED' && isCodOrder) ? 'PAID' : (newStatus === 'CANCELLED' ? 'REFUNDED' : o.paymentStatus);
          return { ...o, orderStatus: newStatus, paymentStatus: newPaymentStatus };
        }
        return o;
      }));

      // Broadcast live to customer website and all open tabs
      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId, newStatus });
      } catch (e) {}

      // Update localStorage atomy_placed_orders if present
      try {
        const localOrdersRaw = localStorage.getItem('atomy_placed_orders');
        if (localOrdersRaw) {
          const list = JSON.parse(localOrdersRaw);
          const statusMap = {
            'PLACED': 'Payment Completed',
            'PROCESSING': 'Preparing Shipment',
            'SHIPPED': 'In Transit',
            'OUT_FOR_DELIVERY': 'Out for Delivery',
            'DELIVERED': 'Delivered',
            'CANCELLED': 'Cancelled'
          };
          const updated = list.map(o => {
            if (o.orderId === orderId) {
              const isCodOrder = (o.paymentMethod || '').toLowerCase().includes('cash') || (o.paymentMethod || '').toLowerCase().includes('cod');
              const newPaymentStatus = (newStatus === 'DELIVERED' && isCodOrder) ? 'PAID' : (newStatus === 'CANCELLED' ? 'REFUNDED' : o.paymentStatus);
              return {
                ...o,
                status: statusMap[newStatus] || newStatus,
                orderStatus: newStatus,
                paymentStatus: newPaymentStatus
              };
            }
            return o;
          });
          localStorage.setItem('atomy_placed_orders', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('atomy:orders-updated', { detail: updated }));
        }
      } catch (e) {}

      showToast(`Order ${orderId} status set to ${newStatus}`);
      await loadDashboardData();
    } catch (err) {
      showToast(`Error: ${err.message || 'Status update failed'}`);
      throw err;
    }
  };

  // Open Full Product Editor for the Sub-Admin
  const handleOpenEditProduct = (prod) => {
    const isHemohim = prod.categoryId === 'hemohim' || (prod.name && prod.name.toLowerCase().includes('hemohim')) || prod.id === 'D00101' || prod.id === 'D00102' || prod.id === 'D00104';
    setCurrentEditingProduct({
      ...prod,
      categoryId: isHemohim ? 'hemohim' : (prod.categoryId || 'health'),
      isNew: false
    });
    setIsEditingProductView(true);
    setTimeout(() => {
      window.scrollTo(0, 0);
      const mainPanel = document.querySelector('.admin-main-panel');
      if (mainPanel) mainPanel.scrollTop = 0;
    }, 10);
  };

  // Save changes from ProductEditorPage
  const handleSaveProductFromEditor = async (productData) => {
    const rawPrice = Number(productData.price) || 0;
    const rawMrp = Number(productData.originalPrice) || 0;
    const safePrice = rawPrice > 0 ? rawPrice : (rawMrp > 0 ? rawMrp : 0);
    const safeMrp = rawMrp > 0 ? rawMrp : safePrice;
    const safeStock = Number(productData.stockQuantity) || 0;
    const safeThreshold = Number(productData.lowStockThreshold) || 10;

    const payload = {
      ...productData,
      price: safePrice,
      originalPrice: safeMrp,
      discountPercent: Number(productData.discountPercent) || 0,
      dpPrice: productData.dpPrice ? Number(productData.dpPrice) : 0,
      pv: Number(productData.pv) || 0,
      stockQuantity: safeStock,
      lowStockThreshold: safeThreshold,
      status: safeStock === 0 ? 'OUT_OF_STOCK'
        : safeStock <= safeThreshold ? 'LOW_STOCK' : 'IN_STOCK',
      isVeg: Boolean(productData.isVeg),
      isNonVeg: Boolean(productData.isNonVeg),
      gstReduced: Boolean(productData.gstReduced),
      freeDelivery: Boolean(productData.freeDelivery),
      active: productData.active !== undefined ? Boolean(productData.active) : true,
      likesCount: Number(productData.likesCount) || 0,
      tags: productData.tags || 'Best Seller',
      galleryImages: Array.isArray(productData.galleryImages) && productData.galleryImages.length > 0
        ? productData.galleryImages.filter(Boolean)
        : (productData.image ? [productData.image] : [])
    };

    try {
      await updateAdminProduct(payload.id, payload);
      await updateDistributorStock(distId, payload.id, payload.stockQuantity, payload.lowStockThreshold).catch(() => {});
      showToast(`Product "${payload.name}" updated and synced successfully!`);
    } catch (err) {
      console.warn('Backend update warning:', err);
      showToast(`Product "${payload.name}" saved!`);
    }

    try {
      const channel = new BroadcastChannel('atomy_product_channel');
      channel.postMessage({ type: 'PRODUCT_UPDATED', product: payload });
      const syncChannel = new BroadcastChannel('atomy_sync_channel');
      syncChannel.postMessage({ type: 'PRODUCT_UPDATED', product: payload });
    } catch { }

    setRefreshInventoryKey(prev => prev + 1);
    setIsEditingProductView(false);
    setCurrentEditingProduct(null);
  };

  // Header profile mapping
  const headerAdminProfile = {
    name: currentDist?.businessName || currentDist?.contactPerson || 'Regional Distributor Hub',
    email: currentDist?.email || 'distributor@atomy.com',
    role: `Regional Distributor (PIN: ${currentDist?.primaryPincode})`,
    location: `${currentDist?.city || 'Regional Hub'}, ${currentDist?.state || 'India'}`,
    department: `Territory Hub Logistics (PIN: ${currentDist?.primaryPincode || '110001'})`,
    employeeId: currentDist?.distributorId || 'DIST-IN'
  };

  // Delayed orders in territory for notification bell
  const delayedOrders = orders.filter(o => {
    const st = String(o.orderStatus || 'PLACED').toUpperCase();
    if (st === 'DELIVERED' || st === 'CANCELLED') return false;
    const base = new Date(o.createdAt || Date.now());
    const deadline = new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000);
    return new Date() > deadline;
  });

  const overviewStatsMapped = {
    todayOrdersCount: (orders || []).filter(o => new Date(o.createdAt || Date.now()) >= new Date(new Date().setHours(0,0,0,0))).length,
    unreadOrdersCount: (orders || []).filter(o => o.orderStatus === 'PLACED').length,
    delayedCount: delayedOrders.length,
    delayedOrders: delayedOrders,
    unreadDelayedCount: delayedOrders.length,
    unreadTicketsCount: 0,
    unreadLowStockCount: 0,
    recentNewOrders: (orders || []).slice(0, 5)
  };

  return (
    <div className="admin-master-wrapper">
      {/* 1. Master Header with live notifications & profile */}
      <Header
        cartCount={0}
        onCartClick={() => {}}
        onNavigateHome={onBackToStore}
        currentView="admin"
        adminProfile={headerAdminProfile}
        onLogout={onLogout}
        onNavigateAdminProfile={() => {
          setIsEditingProductView(false);
          setActiveTab('settings');
        }}
        notificationCount={delayedOrders.length}
        overviewStats={overviewStatsMapped}
        onSelectNotificationTab={(tab) => {
          setIsEditingProductView(false);
          if (tab === 'orders') {
            setActiveTab('orders');
          }
        }}
        onMarkAllNotifsAsRead={() => {}}
        onDismissNotif={() => {}}
      />

      {/* 2. Top Emergency / High-Priority Alert Banner (Hits hard with audio chime) */}
      {activeAlert && (
        <div className={`admin-high-alert-banner ${activeAlert.type} animate-shake`} style={{ margin: '14px 24px 0 24px' }}>
          <div className="alert-content-left">
            <div className="alert-bell-pulse">
              <Bell size={24} />
            </div>
            <div>
              <div className="alert-badge-tag">{activeAlert.title}</div>
              <div className="alert-main-text">{activeAlert.message}</div>
            </div>
          </div>
          <div className="alert-actions-right">
            <button
              className="alert-btn-action"
              onClick={() => {
                setActiveTab('orders');
                setActiveAlert(null);
              }}
            >
              Fulfill &amp; Dispatch Order →
            </button>
            <button className="alert-btn-dismiss" onClick={() => setActiveAlert(null)}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Operational Quick Action Bar (Top Utilities matching Super Admin) */}
      <div className="admin-quick-strip">
        <div className="quick-strip-left">
          <span className="live-status-dot"></span>
          <span className="live-status-title">Atomy India Regional Hub Logistics Console</span>
          <span className="live-store-tag">Assigned Area: PIN {currentDist?.primaryPincode}</span>
        </div>

        <div className="quick-strip-right">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="quick-refresh-btn"
            style={{ textDecoration: 'none', background: '#00a3e0', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Open Live Customer Store"
          >
            <ExternalLink size={13} />
            <span>Customer Store (5173)</span>
          </a>

          {onLogout && (
            <button
              type="button"
              className="quick-refresh-btn"
              onClick={onLogout}
              style={{
                textDecoration: 'none',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontWeight: 700
              }}
              title="Sign Out of Regional Hub Console"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Connected Two-Column Layout */}
      <div className="admin-connected-body">
        {/* Left Master Sidebar */}
        <aside className="admin-master-sidebar">
          <nav className="sidebar-nav-menu">
            <button
              className={`sidebar-nav-button ${activeTab === 'overview' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => {
                setIsEditingProductView(false);
                setActiveTab('overview');
              }}
            >
              <LayoutDashboard size={20} />
              <span>Overview &amp; KPIs</span>
            </button>

            <button
              className={`sidebar-nav-button ${(activeTab === 'inventory' || isEditingProductView) ? 'active' : ''}`}
              onClick={() => {
                setIsEditingProductView(false);
                setActiveTab('inventory');
              }}
            >
              <Boxes size={20} />
              <span>{isEditingProductView ? 'Catalog Editor (Active)' : 'Inventory & Stock'}</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'orders' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => {
                setIsEditingProductView(false);
                setActiveTab('orders');
              }}
            >
              <Package size={20} />
              <span>Customer Orders</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'customers' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => {
                setIsEditingProductView(false);
                setActiveTab('customers');
              }}
            >
              <Users size={20} />
              <span>Customer Details</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'support' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => {
                setIsEditingProductView(false);
                setActiveTab('support');
              }}
            >
              <Headphones size={20} />
              <span>Customer Support</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'membership' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => {
                setIsEditingProductView(false);
                setActiveTab('membership');
              }}
            >
              <Crown size={20} />
              <span>Membership Accounts</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'finance' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => {
                setIsEditingProductView(false);
                setActiveTab('finance');
              }}
            >
              <IndianRupee size={20} />
              <span>Finance &amp; Settlements</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'settings' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => {
                setIsEditingProductView(false);
                setActiveTab('settings');
              }}
            >
              <Settings size={20} />
              <span>Hub Settings</span>
            </button>

            <div style={{ margin: '14px 10px', borderTop: '1px solid #e2e8f0' }}></div>

            <button
              type="button"
              className="sidebar-nav-button logout-sidebar-btn"
              onClick={onLogout}
              style={{
                color: '#dc2626',
                fontWeight: 700
              }}
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </nav>

          <div className="sidebar-footer-box">
            <div className="admin-status-indicator">
              <span className="dot-green"></span>
              <span>Online • PIN {currentDist?.primaryPincode}</span>
            </div>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <main className={`admin-main-panel ${isEditingProductView ? 'is-editor-mode' : ''}`}>
          {isEditingProductView ? (
            <ProductEditorPage
              key={currentEditingProduct?.id || 'product-editor'}
              initialData={currentEditingProduct}
              onSave={handleSaveProductFromEditor}
              onCancel={() => {
                setIsEditingProductView(false);
                setCurrentEditingProduct(null);
              }}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="admin-tab-content">
                  <DistributorOverviewTab
                    stats={stats}
                    orders={orders}
                    customers={customers}
                    distributor={currentDist}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onSelectOrderForDispatch={(order) => setSelectedOrderForTracking(order)}
                  />
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="admin-tab-content">
                  <DistributorInventoryPage
                    distributor={currentDist}
                    refreshKey={refreshInventoryKey}
                    onOpenEditProduct={handleOpenEditProduct}
                  />
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="admin-tab-content">
                  <DistributorOrdersPage
                    orders={orders}
                    distributor={currentDist}
                    onUpdateTracking={handleUpdateTracking}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onOpenTrackingModal={(order) => setSelectedOrderForTracking(order)}
                    onRefreshOrders={loadDashboardData}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="admin-tab-content">
                  <DistributorCustomersPage
                    customers={customers}
                    orders={orders}
                    distributor={currentDist}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {activeTab === 'support' && (
                <div className="admin-tab-content">
                  <DistributorSupportPage
                    distributor={currentDist}
                    orders={orders}
                    customers={customers}
                  />
                </div>
              )}

              {activeTab === 'membership' && (
                <div className="admin-tab-content">
                  <DistributorMembershipsPage
                    distributor={currentDist}
                    territoryOrders={orders}
                  />
                </div>
              )}

              {activeTab === 'finance' && (
                <div className="admin-tab-content">
                  <DistributorFinancePage
                    stats={stats}
                    orders={orders}
                    distributor={currentDist}
                  />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="admin-tab-content">
                  <DistributorSettingsPage
                    distributor={currentDist}
                    onLogout={onLogout}
                    onSaveSettings={() => {
                      showToast('Hub settings updated successfully!');
                      loadDashboardData();
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* 4. Tracking Modal for Dispatch */}
      {selectedOrderForTracking && (
        <DistributorTrackingModal
          order={selectedOrderForTracking}
          distributor={distributorUser}
          onClose={() => setSelectedOrderForTracking(null)}
          onUpdateSuccess={async (orderId, payload) => {
            await handleUpdateTracking(orderId, payload);
          }}
        />
      )}

      {/* 5. Live Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 10000 }}>
          <CheckCircle2 size={16} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
