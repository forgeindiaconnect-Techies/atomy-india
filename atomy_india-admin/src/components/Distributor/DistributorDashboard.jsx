import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  Lock,
  User
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
  updateDistributorStock,
  fetchHubTeam
} from '../../services/distributorService';
import { playOrderAlertSound, sendDesktopNotification } from '../../services/soundAlerts';
import '../Admin/AdminDashboard.css';

export default function DistributorDashboard({ distributorUser, onLogout, onBackToStore }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // overview | inventory | orders | customers | support | membership | finance | settings
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
  const [hubTeamInfo, setHubTeamInfo] = useState(null);

  const currentDist = liveDistributor || distributorUser;
  const distId = currentDist?.distributorId || currentDist?.id || '';
  const assignedPins = currentDist?.assignedPincodes || [currentDist?.primaryPincode].filter(Boolean);

  const isSubDistributor = currentDist?.distributorRole === 'SUB_DISTRIBUTOR';
  const primaryManager = hubTeamInfo?.primaryManager;
  // Follow primary manager's live leave status
  const isPrimaryOnLeave = primaryManager !== undefined && primaryManager !== null
    ? Boolean(primaryManager.onLeave)
    : Boolean(currentDist?.isSubstituteActive || currentDist?.status === 'ACTIVE');
  const isSubstituteInCommand = isSubDistributor && isPrimaryOnLeave;
  const isSubstituteStandby = isSubDistributor && !isPrimaryOnLeave;

  // Temporary Command Active banner auto-dismiss state
  const [showCommandBanner, setShowCommandBanner] = useState(false);

  useEffect(() => {
    if (isSubstituteInCommand) {
      setShowCommandBanner(true);
      const timer = setTimeout(() => {
        setShowCommandBanner(false);
      }, 7000); // Auto-disappear after 7 seconds
      return () => clearTimeout(timer);
    } else {
      setShowCommandBanner(false);
    }
  }, [isSubstituteInCommand]);

  // High-priority alert banner auto-dismiss
  useEffect(() => {
    if (activeAlert) {
      const timer = setTimeout(() => {
        setActiveAlert(null);
      }, 9000); // Auto-dismiss alert banner after 9 seconds
      return () => clearTimeout(timer);
    }
  }, [activeAlert]);

  const alertedHandoverRef = useRef(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const alertedOrderIdsRef = useRef(new Map());

  const triggerDistributorOrderAlert = (order, isLiveRealtime = false) => {
    // If substitute is in standby (locked), DO NOT alert or ring order fanfare!
    if (isSubstituteStandby) return;
    if (!order) return;
    const orderIdStr = String(order.orderId || order.id || '');
    if (!orderIdStr) return;

    // Deduplicate: If this order was already alerted in the last 20 seconds, ignore duplicate calls
    const lastAlertTime = alertedOrderIdsRef.current.get(orderIdStr);
    const now = Date.now();
    if (lastAlertTime && (now - lastAlertTime < 20000)) {
      return;
    }
    alertedOrderIdsRef.current.set(orderIdStr, now);

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

  // Handover Notification: When primary takes leave, notify substitute first (ONCE), and then ring order notifications
  useEffect(() => {
    if (!isSubDistributor) return;

    // Transition from Standby -> In Command (Primary just went on leave)
    if (isPrimaryOnLeave && !alertedHandoverRef.current) {
      alertedHandoverRef.current = true; // Lock so desktop notifications don't fire repeatedly like spam

      // Reset any stale local dismissed order IDs so the newly unlocked substitute gets fresh alerts in bell
      try {
        localStorage.removeItem('atomy_admin_read_notifs_v3');
      } catch (e) {}

      // 1. FIRST: Handover notification & chime
      playOrderAlertSound(1.0);
      setActiveAlert({
        type: 'order',
        title: '⚡ PRIMARY DISTRIBUTOR ON LEAVE — HUB HANDOVER ACTIVATED!',
        message: `Primary Distributor ${primaryManager?.contactPerson || currentDist?.primaryManagerName || 'Franchise Owner'} has taken leave. You are now unlocked and in full operational command of Regional Hub (PIN: ${currentDist?.primaryPincode}). All order fulfillment and stock controls are active.`,
        time: 'Just now',
        targetId: 'handover'
      });
      sendDesktopNotification('⚡ Atomy Hub Handover: Operational Command Transferred!', {
        body: `Primary Distributor is on leave. Full operational authority of Regional Hub PIN ${currentDist?.primaryPincode} has been transferred to you.`
      });
      showToast('⚡ Primary Distributor is on leave — Operational command handed over to you!');

      // 2. THEN ONLY: Ring the order notification fanfare for active orders waiting to be fulfilled
      const orderRingTimer = setTimeout(() => {
        const pendingOrders = (orders || []).filter(o => {
          const st = String(o.orderStatus || 'PLACED').toUpperCase();
          return st !== 'DELIVERED' && st !== 'CANCELLED';
        });
        if (pendingOrders.length > 0) {
          playOrderAlertSound(0.95);
          showToast(`🔔 Hub Unlocked: ${pendingOrders.length} active customer orders waiting for fulfillment!`);
        }
      }, 1800);

      return () => clearTimeout(orderRingTimer);
    }

    // Transition from In Command -> Standby (Primary returned from leave)
    if (!isPrimaryOnLeave && alertedHandoverRef.current) {
      alertedHandoverRef.current = false; // Reset lock so next time primary takes leave it will notify
      showToast('🔒 Primary Distributor has returned. Hub console returned to Standby mode.');
      setActiveAlert(null);
    }
  }, [isSubDistributor, isPrimaryOnLeave]);

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
      const [profileRes, statsRes, ordersRes, custsRes, teamRes] = await Promise.allSettled([
        fetchDistributorProfile(distId),
        fetchDistributorStats(distId),
        fetchDistributorOrders(distId, 'ALL'),
        fetchDistributorCustomers(distId),
        fetchHubTeam(distId)
      ]);

      if (teamRes.status === 'fulfilled' && teamRes.value) {
        setHubTeamInfo(teamRes.value);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setLiveDistributor(prev => ({ ...prev, ...profileRes.value }));
      }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        // Strict territory filtering & deduplication by orderId
        const seenIds = new Set();
        const freshOrders = [];
        ordersRes.value.filter(matchesDistributorTerritory).forEach(o => {
          const oid = String(o.orderId || o.id || '').trim();
          if (oid && !seenIds.has(oid)) {
            seenIds.add(oid);
            freshOrders.push(o);
          }
        });
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
      if (custsRes.status === 'fulfilled' && Array.isArray(custsRes.value)) {
        const primPin = String(currentDist?.primaryPincode || '635002').trim();
        setCustomers(custsRes.value.filter(c => {
          const pin = String(c.pincode || '').trim();
          return pin === primPin;
        }));
      }
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
          if (data && data.type === 'HUB_HANDOVER_STATUS_CHANGED') {
            if (isSubDistributor) {
              setHubTeamInfo(prev => ({
                ...(prev || {}),
                primaryManager: {
                  ...(prev?.primaryManager || {}),
                  onLeave: Boolean(data.onLeave)
                }
              }));
              setLiveDistributor(prev => ({
                ...(prev || {}),
                isSubstituteActive: Boolean(data.onLeave),
                status: data.onLeave ? 'ACTIVE' : 'STANDBY'
              }));
            }
            loadDashboardData(true);
            return;
          }
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
      if (typeof document !== 'undefined' && document.hidden) return;
      loadDashboardData(true);
    }, 5000);

    return () => {
      if (orderChannel) orderChannel.close();
      if (syncChannel) syncChannel.close();
      clearInterval(pollInterval);
    };
  }, [distId, JSON.stringify(assignedPins)]);

  const handleUpdateTracking = async (orderId, trackingPayload) => {
    if (isSubstituteStandby) {
      showToast('Action locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty.');
      return;
    }
    const targetStatus = trackingPayload.orderStatus || trackingPayload.currentStatus || 'SHIPPED';

    // 1. Optimistic update immediately in memory for instant UI response
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId || o.id === orderId) {
        return {
          ...o,
          orderStatus: targetStatus,
          status: targetStatus,
          pickupStatus: trackingPayload.pickupStatus || (targetStatus === 'DELIVERED' ? 'COLLECTED' : targetStatus === 'READY_FOR_PICKUP' ? 'READY_FOR_PICKUP' : (targetStatus === 'PROCESSING' || targetStatus === 'PREPARING' ? 'PREPARING' : (targetStatus === 'PLACED' ? 'PENDING_CONFIRMATION' : o.pickupStatus))),
          courier: trackingPayload.courierPartner || o.courier,
          trackingNumber: trackingPayload.trackingNumber || o.trackingNumber,
          tracking: {
            ...(o.tracking || {}),
            courierPartner: trackingPayload.courierPartner,
            trackingNumber: trackingPayload.trackingNumber,
            currentStatus: targetStatus,
            orderStatus: targetStatus,
            currentLocation: trackingPayload.currentLocation || trackingPayload.initialLocation,
            estimatedDelivery: trackingPayload.estimatedDelivery
          }
        };
      }
      return o;
    }));

    // Keep selectedOrderForTracking in sync
    setSelectedOrderForTracking(prev => {
      if (prev && (prev.orderId === orderId || prev.id === orderId)) {
        return {
          ...prev,
          orderStatus: targetStatus,
          status: targetStatus,
          courier: trackingPayload.courierPartner || prev.courier,
          trackingNumber: trackingPayload.trackingNumber || prev.trackingNumber,
          tracking: {
            ...(prev.tracking || {}),
            courierPartner: trackingPayload.courierPartner,
            trackingNumber: trackingPayload.trackingNumber,
            currentStatus: targetStatus,
            orderStatus: targetStatus,
            currentLocation: trackingPayload.currentLocation || trackingPayload.initialLocation,
            estimatedDelivery: trackingPayload.estimatedDelivery
          }
        };
      }
      return prev;
    });

    // 2. Broadcast live to customer website and all open tabs
    try {
      const syncChannel = new BroadcastChannel('atomy_sync_channel');
      syncChannel.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId, newStatus: targetStatus });
    } catch (e) {}

    // 3. Update localStorage atomy_placed_orders immediately
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
          if (o.orderId === orderId || o.id === orderId) {
            return {
              ...o,
              status: statusMap[targetStatus] || targetStatus,
              orderStatus: targetStatus,
              trackingNumber: trackingPayload.trackingNumber || o.trackingNumber,
              courier: trackingPayload.courierPartner || o.courier,
              tracking: {
                ...(o.tracking || {}),
                courierPartner: trackingPayload.courierPartner,
                trackingNumber: trackingPayload.trackingNumber,
                currentStatus: targetStatus,
                orderStatus: targetStatus,
                currentLocation: trackingPayload.currentLocation || trackingPayload.initialLocation,
                estimatedDelivery: trackingPayload.estimatedDelivery
              }
            };
          }
          return o;
        });
        localStorage.setItem('atomy_placed_orders', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('atomy:orders-updated', { detail: updated }));
      }
    } catch (e) {}

    showToast('Dispatch tracking updated & customer notified via email / SMS!');

    // 4. Background network persistence without blocking UI
    try {
      await updateDistributorOrderTracking(orderId, distId, trackingPayload);
    } catch (err) {
      console.warn('Network tracking update note (optimistic update kept):', err.message);
    }

    // Refresh dashboard in background
    loadDashboardData().catch(() => {});
    return { success: true };
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (isSubstituteStandby) {
      showToast('Action locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty.');
      return;
    }
    // 1. Optimistic update immediately in memory for instant UI response
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId || o.id === orderId) {
        const isCodOrder = (o.paymentMethod || '').toLowerCase().includes('cash') || (o.paymentMethod || '').toLowerCase().includes('cod');
        const newPaymentStatus = (newStatus === 'DELIVERED' && isCodOrder) ? 'PAID' : (newStatus === 'CANCELLED' ? 'REFUNDED' : o.paymentStatus);
        return { 
          ...o, 
          orderStatus: newStatus, 
          status: newStatus,
          paymentStatus: newPaymentStatus,
          tracking: {
            ...(o.tracking || {}),
            currentStatus: newStatus,
            orderStatus: newStatus
          }
        };
      }
      return o;
    }));

    // Keep selectedOrderForTracking in sync immediately
    setSelectedOrderForTracking(prev => {
      if (prev && (prev.orderId === orderId || prev.id === orderId)) {
        return {
          ...prev,
          orderStatus: newStatus,
          status: newStatus,
          tracking: {
            ...(prev.tracking || {}),
            currentStatus: newStatus,
            orderStatus: newStatus
          }
        };
      }
      return prev;
    });

    // 2. Broadcast live to customer website and all open tabs
    try {
      const syncChannel = new BroadcastChannel('atomy_sync_channel');
      syncChannel.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId, newStatus });
    } catch (e) {}

    // 3. Update localStorage atomy_placed_orders immediately
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
          if (o.orderId === orderId || o.id === orderId) {
            const isCodOrder = (o.paymentMethod || '').toLowerCase().includes('cash') || (o.paymentMethod || '').toLowerCase().includes('cod');
            const newPaymentStatus = (newStatus === 'DELIVERED' && isCodOrder) ? 'PAID' : (newStatus === 'CANCELLED' ? 'REFUNDED' : o.paymentStatus);
            return {
              ...o,
              status: statusMap[newStatus] || newStatus,
              orderStatus: newStatus,
              paymentStatus: newPaymentStatus,
              tracking: {
                ...(o.tracking || {}),
                currentStatus: newStatus,
                orderStatus: newStatus
              }
            };
          }
          return o;
        });
        localStorage.setItem('atomy_placed_orders', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('atomy:orders-updated', { detail: updated }));
      }
    } catch (e) {}

    showToast(`Order ${orderId} status set to ${newStatus}`);

    // 4. Background network persistence without blocking UI
    try {
      await updateDistributorOrderStatus(orderId, distId, newStatus);
    } catch (err) {
      console.warn('Network status update note (optimistic update kept):', err.message);
    }

    // Refresh dashboard in background
    loadDashboardData().catch(() => {});
  };

  // Open Full Product Editor for the Sub-Admin
  const handleOpenEditProduct = (prod) => {
    if (isSubstituteStandby) {
      showToast('Action locked: Temporary Substitute is in STANDBY mode while Primary Distributor is on active duty.');
      return;
    }
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
      tags: Array.isArray(productData.tags)
        ? productData.tags.filter(Boolean).join(', ')
        : (productData.tags !== undefined && productData.tags !== null ? String(productData.tags).trim() : ''),
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
    name: isSubDistributor
      ? (currentDist?.contactPerson || 'Temporary Substitute')
      : (currentDist?.businessName || currentDist?.contactPerson || 'Regional Distributor Hub'),
    email: currentDist?.email || 'distributor@atomy.com',
    role: isSubDistributor
      ? (isSubstituteInCommand ? 'Temporary Substitute (In Command)' : 'Temporary Substitute (Standby)')
      : `Regional Distributor (PIN: ${currentDist?.primaryPincode})`,
    pincode: currentDist?.primaryPincode,
    assignedAreaText: isSubDistributor
      ? `Substitute: PIN ${currentDist?.primaryPincode || '635002'}`
      : `Assigned Area: PIN ${currentDist?.primaryPincode || '635002'}`,
    portalTitle: isSubDistributor ? `${currentDist?.contactPerson || 'Substitute'} Portal` : 'Atomy Regional Hub',
    portalSubtitle: isSubDistributor ? `Substitute for ${currentDist?.parentHubName || 'Regional Hub'}` : 'Logistics Console',
    location: `${currentDist?.city || 'Regional Hub'}, ${currentDist?.state || 'India'}`,
    department: isSubDistributor ? `Temporary Substitute Hub Operations` : `Territory Hub Logistics (PIN: ${currentDist?.primaryPincode || '110001'})`,
    employeeId: currentDist?.distributorId || 'DIST-IN'
  };



  // Deduplicated delayed orders in territory for notification bell
  const delayedOrders = useMemo(() => {
    // While in standby relief mode, hide order alerts from notification bell
    if (isSubstituteStandby) return [];
    const seen = new Set();
    return orders.filter(o => {
      const st = String(o.orderStatus || 'PLACED').toUpperCase();
      if (st === 'DELIVERED' || st === 'CANCELLED') return false;
      const oid = String(o.orderId || o.id || '').trim();
      if (!oid || seen.has(oid)) return false;
      const base = new Date(o.createdAt || Date.now());
      const deadline = new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000);
      if (new Date() > deadline) {
        seen.add(oid);
        return true;
      }
      return false;
    });
  }, [orders, isSubstituteStandby]);

  // Deduplicated recent new unfulfilled orders
  const recentNewOrders = useMemo(() => {
    // While in standby relief mode, hide order alerts from notification bell
    if (isSubstituteStandby) return [];
    const seen = new Set();
    return orders.filter(o => {
      const st = String(o.orderStatus || 'PLACED').toUpperCase();
      if (st === 'DELIVERED' || st === 'CANCELLED') return false;
      const oid = String(o.orderId || o.id || '').trim();
      if (!oid || seen.has(oid)) return false;
      seen.add(oid);
      return true;
    }).slice(0, 5);
  }, [orders, isSubstituteStandby]);

  const overviewStatsMapped = {
    todayOrdersCount: isSubstituteStandby ? 0 : (orders || []).filter(o => new Date(o.createdAt || Date.now()) >= new Date(new Date().setHours(0,0,0,0))).length,
    unreadOrdersCount: isSubstituteStandby ? 0 : recentNewOrders.length,
    delayedCount: isSubstituteStandby ? 0 : delayedOrders.length,
    delayedOrders: isSubstituteStandby ? [] : delayedOrders,
    unreadDelayedCount: isSubstituteStandby ? 0 : delayedOrders.length,
    unreadTicketsCount: 0,
    unreadLowStockCount: 0,
    recentNewOrders: isSubstituteStandby ? [] : recentNewOrders,
    handoverNotification: (isSubDistributor && isSubstituteInCommand) ? {
      title: '⚡ Handover Active: In Command',
      message: `Primary Distributor ${primaryManager?.contactPerson || currentDist?.primaryManagerName || 'Franchise Owner'} is on leave. Full operational authority of Regional Hub PIN ${currentDist?.primaryPincode} is transferred to you.`
    } : null
  };

  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, isLocked: isSubstituteStandby },
    { id: 'inventory', label: isEditingProductView ? 'Catalog Editor (Active)' : 'Inventory & Stock', icon: Boxes, isLocked: isSubstituteStandby },
    { id: 'orders', label: 'Customer Orders', icon: Package, badge: (!isSubstituteStandby && delayedOrders.length > 0) ? `${delayedOrders.length} Late` : null, isLocked: isSubstituteStandby },
    { id: 'customers', label: 'Customer Details', icon: Users, isLocked: isSubstituteStandby },
    { id: 'support', label: 'Customer Support', icon: Headphones, isLocked: isSubstituteStandby },
    { id: 'membership', label: 'Membership Accounts', icon: Crown, isLocked: isSubstituteStandby },
    { id: 'finance', label: 'Finance & Settlements', icon: IndianRupee, isLocked: isSubstituteStandby },
    { id: 'settings', label: isSubDistributor ? 'Profile Settings' : 'Hub Settings', icon: isSubDistributor ? User : Settings, isLocked: false }
  ];

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
        notificationCount={isSubstituteStandby ? 0 : (delayedOrders.length + (overviewStatsMapped.handoverNotification ? 1 : 0))}
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
          {/* Mobile Hamburger Menu Button on Top Left below Header */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open Hub Navigation Menu"
            title="Open Hub Navigation Menu"
          >
            <Menu size={18} strokeWidth={2.4} />
            <span className="mobile-hamburger-text">Menu</span>
            <span className="mobile-hamburger-active-pill">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Overview'}
            </span>
          </button>

          <div className="quick-strip-desktop-info">
            <span className="live-status-dot"></span>
            <span className="live-status-title">Atomy India Regional Hub Logistics Console</span>
            <span className="live-store-tag">Assigned Area: PIN {currentDist?.primaryPincode}</span>
            {isSubDistributor && isSubstituteStandby && (
              <span style={{ fontSize: '11px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} /> STANDBY RELIEF MODE (Primary Active)
              </span>
            )}
            {isSubDistributor && isSubstituteInCommand && (
              <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={11} /> TEMPORARY COMMAND ACTIVE
              </span>
            )}
            {currentDist?.onLeave && (
              <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                🌴 On Leave (Delegated to {currentDist?.delegatedToName || 'Temporary Substitute'})
              </span>
            )}
          </div>
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
        </div>
      </div>

      {/* Mobile Slide-Out Sidebar Drawer */}
      {isMobileNavOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsMobileNavOpen(false)}>
          <div className="mobile-sidebar-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-brand">
                <div className="mobile-drawer-avatar">
                  {(currentDist?.businessName || currentDist?.contactPerson || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="mobile-drawer-meta">
                  <span className="mobile-drawer-title">
                    {currentDist?.businessName || 'Regional Hub'}
                  </span>
                  <span className="mobile-drawer-pin">
                    Assigned Area: PIN {currentDist?.primaryPincode}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="Close Navigation Menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-drawer-nav">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`mobile-drawer-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setIsEditingProductView(false);
                      setActiveTab(item.id);
                      setIsMobileNavOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="mobile-drawer-nav-icon">
                      <Icon size={18} />
                    </div>
                    <span className="mobile-drawer-nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="mobile-drawer-badge">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mobile-drawer-footer">
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-drawer-store-btn"
              >
                <ExternalLink size={15} />
                <span>Customer Store (5173)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 3. Connected Two-Column Layout */}
      <div className="admin-connected-body">
        {/* Left Master Sidebar */}
        <aside className="admin-master-sidebar">
          <nav className="sidebar-nav-menu">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !isEditingProductView;
              const isLocked = item.isLocked;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-button ${isActive ? 'active' : ''} ${isLocked ? 'is-locked-tab' : ''}`}
                  onClick={() => {
                    setIsEditingProductView(false);
                    setActiveTab(item.id);
                    if (isLocked) {
                      showToast(`Access Blocked: ${item.label} is locked while Primary is on active duty.`);
                    }
                  }}
                  style={isLocked ? { opacity: 0.68 } : {}}
                  title={isLocked ? `${item.label} (Locked — Primary Active)` : item.label}
                >
                  <Icon size={20} />
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
                    <span>{item.label}</span>
                    {isLocked && <Lock size={12} style={{ color: '#d97706', marginLeft: 'auto', flexShrink: 0 }} />}
                    {item.badge && !isLocked && <span className="sidebar-nav-badge">{item.badge}</span>}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer-box">
            <div className="admin-status-indicator">
              <span className={isSubstituteStandby ? "dot-amber" : "dot-green"} style={isSubstituteStandby ? { background: '#f59e0b', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' } : {}}></span>
              <span>{isSubstituteStandby ? 'Standby' : 'Online'} • PIN {currentDist?.primaryPincode}</span>
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
          ) : isSubstituteStandby && activeTab !== 'settings' ? (
            <div className="admin-tab-content standby-lockout-tab" style={{ padding: '24px 20px' }}>
              <div style={{
                maxWidth: '840px',
                margin: '10px auto',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #fde68a',
                boxShadow: '0 8px 30px rgba(217, 119, 6, 0.08)',
                padding: '40px 36px',
                textAlign: 'center'
              }}>
                {/* Big Lock / Shield Graphic */}
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: '#fffbeb',
                  border: '3px solid #fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)'
                }}>
                  <ShieldCheck size={46} strokeWidth={2.2} />
                </div>

                <div style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  background: '#fef3c7',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  marginBottom: '14px'
                }}>
                  🔒 Standby Relief Mode Active — All Operations Locked
                </div>

                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                  Primary Distributor is Currently Active
                </h1>

                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto 26px auto' }}>
                  Primary Distributor <strong style={{ color: '#0f172a' }}>{primaryManager?.contactPerson || currentDist?.primaryManagerName || 'Selva Kumar'}</strong> is on active duty managing this hub. As the Temporary Substitute / Co-Manager, all hub operational pages (Inventory, Orders, Customers, Membership, and Settlements) are locked while the Primary is active.
                </p>

                {/* Hub & Role Summary Card */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'left',
                  marginBottom: '26px'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                      Regional Hub Franchise
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={15} color="#00A3E0" />
                      {currentDist?.parentHubName || currentDist?.businessName || 'Regional Hub'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Territory PIN: <strong>{currentDist?.primaryPincode}</strong>
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                      Primary Manager on Duty
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                      {primaryManager?.contactPerson || currentDist?.primaryManagerName || 'Selva Kumar'} (Active)
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      {primaryManager?.email || 'primary.hub@atomy.com'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                      Your Account &amp; Status
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={15} color="#b45309" />
                      {currentDist?.contactPerson || 'Temporary Substitute'} (Standby)
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Account ID: <strong>{currentDist?.distributorId}</strong>
                    </span>
                  </div>
                </div>

                {/* Blocked Pages Overview List */}
                <div style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  textAlign: 'left',
                  marginBottom: '28px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    🔒 Hub Operational Pages Blocked in Standby Mode:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      'Overview & Metrics',
                      'Inventory & Stock Management',
                      'Customer Orders & Logistics Dispatches',
                      'Customer Directory & Contact Details',
                      'Customer Support Escalations',
                      'Membership Accounts & Tier Approvals',
                      'Finance & Remittance Settlements'
                    ].map(p => (
                      <span key={p} style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        background: '#ffffff',
                        color: '#78350f',
                        border: '1px solid #fde68a',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <Lock size={11} color="#d97706" /> {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    style={{
                      background: '#00A3E0',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(0, 163, 224, 0.25)'
                    }}
                  >
                    <User size={18} />
                    <span>Manage My Profile Settings →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loadDashboardData();
                      showToast('Checking Primary Distributor live status...');
                    }}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <RefreshCw size={16} />
                    <span>Refresh Live Status</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* TEMPORARY COMMAND ACTIVE BANNER */}
              {isSubstituteInCommand && showCommandBanner && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  margin: '16px 24px 0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#065f46', marginBottom: '2px' }}>
                        ⚡ TEMPORARY COMMAND ACTIVE — Full Operational Authority
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#047857', lineHeight: 1.4 }}>
                        Primary Distributor <strong>{primaryManager?.contactPerson || currentDist?.primaryManagerName || 'Franchise Owner'}</strong> is currently on leave. You have full operational control over stock, orders, and customer store pickups.
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', padding: '5px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                      IN COMMAND
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCommandBanner(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#065f46',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        opacity: 0.75,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '0.75'}
                      title="Dismiss banner"
                      aria-label="Dismiss banner"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}

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
                    isStandby={isSubstituteStandby}
                  />
                </div>
              )}

              {activeTab === 'orders' && (
                <DistributorOrdersPage
                  orders={orders}
                  distributor={currentDist}
                  onUpdateTracking={handleUpdateTracking}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onOpenTrackingModal={(order) => setSelectedOrderForTracking(order)}
                  onRefreshOrders={loadDashboardData}
                  showToast={showToast}
                  isLoading={isLoading}
                  isStandby={isSubstituteStandby}
                />
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
                <DistributorFinancePage
                  stats={stats}
                  orders={orders}
                  distributor={currentDist}
                  onNavigateToOrders={() => setActiveTab('orders')}
                  onNavigateToSupport={() => setActiveTab('support')}
                />
              )}

              {activeTab === 'settings' && (
                <div className="admin-tab-content">
                  <DistributorSettingsPage
                    distributor={currentDist}
                    onLogout={onLogout}
                    onSaveSettings={() => {
                      showToast(isSubDistributor ? 'Personal profile updated successfully!' : 'Hub settings updated successfully!');
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
