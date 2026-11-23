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
import DistributorNotificationsPage from './DistributorNotificationsPage';
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
  fetchHubTeam,
  fetchDistributorTickets
} from '../../services/distributorService';
import { playOrderAlertSound, playSupportAlertSound, sendDesktopNotification } from '../../services/soundAlerts';
import '../Admin/AdminDashboard.css';

export default function DistributorDashboard({ distributorUser, onLogout, onBackToStore }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [inspectingOrderId, setInspectingOrderId] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // overview | inventory | orders | customers | support | membership | finance | settings
  const [liveDistributor, setLiveDistributor] = useState(() => {
    try {
      const cachedTeam = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('atomy_cached_hub_team') : null;
      if (cachedTeam) {
        const parsedTeam = JSON.parse(cachedTeam);
        if (parsedTeam?.primaryManager?.onLeave !== undefined) {
          return {
            ...distributorUser,
            isSubstituteActive: Boolean(parsedTeam.primaryManager.onLeave),
            status: parsedTeam.primaryManager.onLeave ? 'ACTIVE' : 'STANDBY'
          };
        }
      }
    } catch (e) { }
    return distributorUser;
  });
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
  const [tickets, setTickets] = useState([]);
  const knownTicketIdsRef = useRef(new Set());
  const isInitialTicketLoadRef = useRef(true);

  // Full Product Editor State
  const [isEditingProductView, setIsEditingProductView] = useState(false);
  const [currentEditingProduct, setCurrentEditingProduct] = useState(null);
  const [refreshInventoryKey, setRefreshInventoryKey] = useState(0);
  const [hubTeamInfo, setHubTeamInfo] = useState(() => {
    try {
      const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('atomy_cached_hub_team') : null;
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return null;
  });

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

  const isSubstituteStandbyRef = useRef(isSubstituteStandby);
  useEffect(() => {
    isSubstituteStandbyRef.current = isSubstituteStandby;
  }, [isSubstituteStandby]);

  // Temporary Command Active banner state
  const [showCommandBanner, setShowCommandBanner] = useState(false);

  // Track previous leave status to only alert on LIVE state changes, never on page load/refresh
  const prevLeaveStatusRef = useRef(null);
  const handoverStorageKey = `atomy_handover_alerted_${distId || 'sub'}`;

  // High-priority alert banner auto-dismiss
  useEffect(() => {
    if (activeAlert) {
      const timer = setTimeout(() => {
        setActiveAlert(null);
      }, 9000); // Auto-dismiss alert banner after 9 seconds
      return () => clearTimeout(timer);
    }
  }, [activeAlert]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Real-Time Audio Alert Settings
  const [soundSettings, setSoundSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_distributor_sound_settings');
      return saved ? JSON.parse(saved) : {
        orderSoundEnabled: true,
        supportSoundEnabled: true,
        volume: 0.85
      };
    } catch {
      return { orderSoundEnabled: true, supportSoundEnabled: true, volume: 0.85 };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('atomy_distributor_sound_settings', JSON.stringify(soundSettings));
    } catch { }
  }, [soundSettings]);

  // =========================================================================
  // CENTRALIZED BROWSER & MOBILE BACK BUTTON NAVIGATION MANAGER
  // =========================================================================
  const isPopNavigatingRef = useRef(false);
  const prevTabRef = useRef('overview');

  useEffect(() => {
    if (isPopNavigatingRef.current) {
      isPopNavigatingRef.current = false;
      prevTabRef.current = activeTab;
      return;
    }

    try {
      if (activeTab === 'overview') {
        if (prevTabRef.current !== 'overview') {
          window.history.replaceState({ tab: 'overview', subView: null }, '', window.location.href);
        }
      } else {
        if (prevTabRef.current === 'overview') {
          window.history.pushState({ tab: activeTab, subView: null }, '', window.location.href);
        } else {
          window.history.replaceState({ tab: activeTab, subView: null }, '', window.location.href);
        }
      }
    } catch { }

    prevTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (isPopNavigatingRef.current) return;
    if (isEditingProductView) {
      try {
        window.history.pushState({ tab: activeTab, subView: 'product-editor' }, '', window.location.href);
      } catch { }
    }
  }, [isEditingProductView, activeTab]);

  useEffect(() => {
    if (isPopNavigatingRef.current) return;
    if (inspectingOrderId) {
      try {
        window.history.pushState({ tab: activeTab, subView: 'order-detail' }, '', window.location.href);
      } catch { }
    }
  }, [Boolean(inspectingOrderId), activeTab]);

  useEffect(() => {
    if (isPopNavigatingRef.current) return;
    if (selectedOrderForTracking) {
      try {
        window.history.pushState({ tab: activeTab, subView: 'tracking-modal' }, '', window.location.href);
      } catch { }
    }
  }, [Boolean(selectedOrderForTracking), activeTab]);

  useEffect(() => {
    if (isPopNavigatingRef.current) return;
    if (isMobileNavOpen) {
      try {
        window.history.pushState({ tab: activeTab, subView: 'mobile-nav' }, '', window.location.href);
      } catch { }
    }
  }, [isMobileNavOpen, activeTab]);

  useEffect(() => {
    try {
      window.history.replaceState({ tab: activeTab, subView: null }, '', window.location.href);
    } catch { }

    const handlePopState = () => {
      // 1. Mobile Drawer
      if (isMobileNavOpen) {
        isPopNavigatingRef.current = true;
        setIsMobileNavOpen(false);
        return;
      }

      // 2. Modals & Inner views -> return to parent page
      if (selectedOrderForTracking) {
        isPopNavigatingRef.current = true;
        setSelectedOrderForTracking(null);
        return;
      }

      if (inspectingOrderId) {
        isPopNavigatingRef.current = true;
        setInspectingOrderId(null);
        return;
      }

      if (isEditingProductView) {
        isPopNavigatingRef.current = true;
        setIsEditingProductView(false);
        setCurrentEditingProduct(null);
        return;
      }

      // 3. Any other tab -> return to overview page
      if (activeTab !== 'overview') {
        isPopNavigatingRef.current = true;
        setActiveTab('overview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 4. Already on overview with no modals -> let browser perform natural back navigation
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    activeTab,
    isMobileNavOpen,
    isEditingProductView,
    inspectingOrderId,
    selectedOrderForTracking
  ]);

  const handleCloseProductEditor = () => {
    if (window.history.state?.subView === 'product-editor') {
      window.history.back();
    } else {
      setIsEditingProductView(false);
      setCurrentEditingProduct(null);
    }
  };

  const alertedOrderIdsRef = useRef(new Map());

  const triggerDistributorOrderAlert = (order, isLiveRealtime = false) => {
    // If substitute is in standby (Primary is ACTIVE), strictly DO NOT alert or ring order fanfare!
    if (isSubDistributor && isSubstituteStandbyRef.current) return;
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
    if (soundSettings.orderSoundEnabled) {
      playOrderAlertSound(soundSettings.volume);
    }

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

  const alertedTicketIdsRef = useRef(new Map());
  const triggerDistributorTicketAlert = (ticket) => {
    if (isSubDistributor && isSubstituteStandbyRef.current) return;
    if (!ticket) return;
    const ticketIdStr = String(ticket.ticketId || ticket.id || '');
    if (!ticketIdStr) return;

    // Deduplicate: ignore duplicate triggers within 20s
    const lastAlertTime = alertedTicketIdsRef.current.get(ticketIdStr);
    const now = Date.now();
    if (lastAlertTime && (now - lastAlertTime < 20000)) return;
    alertedTicketIdsRef.current.set(ticketIdStr, now);

    // Play loud, crisp support chime (A5-D6 double pulse)
    if (soundSettings.supportSoundEnabled) {
      playSupportAlertSound(soundSettings.volume);
    }

    // Show high-priority shaking alert banner
    setActiveAlert({
      type: 'support',
      title: '🎧 NEW CUSTOMER SUPPORT INQUIRY!',
      message: `Ticket #${ticketIdStr} from ${ticket.customerName || 'Customer'}: "${ticket.subject || ticket.message || 'Support Request'}"`,
      time: 'Just now',
      targetId: ticketIdStr
    });

    sendDesktopNotification(`🎧 New Customer Ticket #${ticketIdStr}`, {
      body: `From ${ticket.customerName || 'Customer'}: "${ticket.subject || ticket.message || 'Customer inquiry'}"`
    });

    showToast(`🎧 New Support Ticket #${ticketIdStr} from ${ticket.customerName || 'Customer'}`);
  };

  const alertedCancelIdsRef = useRef(new Map());
  const triggerDistributorCancelAlert = (data) => {
    if (isSubDistributor && isSubstituteStandbyRef.current) return;
    if (!data) return;
    const orderIdStr = String(data.orderId || data.order?.orderId || data.order?.id || '');
    if (!orderIdStr) return;

    // Deduplicate: ignore duplicate triggers within 20s
    const lastAlertTime = alertedCancelIdsRef.current.get(orderIdStr);
    const now = Date.now();
    if (lastAlertTime && (now - lastAlertTime < 20000)) return;
    alertedCancelIdsRef.current.set(orderIdStr, now);

    const reason = data.cancelReason || data.order?.cancelReason || 'Ordered by mistake / Change of mind';
    const notes = data.cancelNotes || data.order?.cancelNotes || '';

    // Play warning chime
    if (soundSettings.supportSoundEnabled) {
      playSupportAlertSound(soundSettings.volume);
    }

    // Show high-priority cancellation alert banner
    setActiveAlert({
      type: 'cancellation',
      title: '🚫 CUSTOMER ORDER CANCELLED!',
      message: `Order #${orderIdStr} was cancelled by customer. Reason: "${reason}"${notes ? ` (Note: ${notes})` : ''}`,
      time: 'Just now',
      targetId: orderIdStr
    });

    sendDesktopNotification(`🚫 Order #${orderIdStr} Cancelled`, {
      body: `Customer cancelled order. Reason: ${reason}`
    });

    showToast(`🚫 Order #${orderIdStr} Cancelled: "${reason}"`);
  };

  // Handover Notification: Only trigger when a LIVE transition from Active -> Leave occurs
  useEffect(() => {
    if (!isSubDistributor) return;

    // During initial mount / page refresh: capture existing status and return without alerts
    if (isInitialLoadRef.current) {
      prevLeaveStatusRef.current = Boolean(isPrimaryOnLeave);
      if (isPrimaryOnLeave) {
        try {
          sessionStorage.setItem(handoverStorageKey, 'true');
        } catch (e) { }
      }
      return;
    }

    if (prevLeaveStatusRef.current === null) {
      prevLeaveStatusRef.current = Boolean(isPrimaryOnLeave);
      return;
    }

    const wasAlertedInSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(handoverStorageKey) === 'true';

    // LIVE Transition from Standby -> In Command (Primary just went on leave while substitute is live in session)
    if (isPrimaryOnLeave && !prevLeaveStatusRef.current && !wasAlertedInSession) {
      prevLeaveStatusRef.current = true;
      try {
        sessionStorage.setItem(handoverStorageKey, 'true');
      } catch (e) { }

      // Show temporary command banner for 7 seconds
      setShowCommandBanner(true);
      const bannerTimer = setTimeout(() => {
        setShowCommandBanner(false);
      }, 7000);

      // 1. FIRST: Handover notification & chime
      if (soundSettings.orderSoundEnabled) {
        playOrderAlertSound(soundSettings.volume);
      }
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
          if (soundSettings.orderSoundEnabled) {
            playOrderAlertSound(soundSettings.volume);
          }
          showToast(`🔔 Hub Unlocked: ${pendingOrders.length} active customer orders waiting for fulfillment!`);
        }
      }, 1800);

      return () => {
        clearTimeout(bannerTimer);
        clearTimeout(orderRingTimer);
      };
    }

    // LIVE Transition from In Command -> Standby (Primary returned from leave)
    if (!isPrimaryOnLeave && prevLeaveStatusRef.current) {
      prevLeaveStatusRef.current = false;
      try {
        sessionStorage.removeItem(handoverStorageKey);
      } catch (e) { }
      setShowCommandBanner(false);
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
      const [profileRes, statsRes, ordersRes, custsRes, teamRes, ticketsRes] = await Promise.allSettled([
        fetchDistributorProfile(distId),
        fetchDistributorStats(distId),
        fetchDistributorOrders(distId, 'ALL'),
        fetchDistributorCustomers(distId),
        fetchHubTeam(distId),
        fetchDistributorTickets(distId)
      ]);

      if (teamRes.status === 'fulfilled' && teamRes.value) {
        setHubTeamInfo(teamRes.value);
        try {
          sessionStorage.setItem('atomy_cached_hub_team', JSON.stringify(teamRes.value));
        } catch (e) { }
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
          if (!(isSubDistributor && isSubstituteStandbyRef.current)) {
            freshOrders.forEach(o => {
              const oid = String(o.orderId || o.id || '');
              if (oid && !knownOrderIdsRef.current.has(oid)) {
                triggerDistributorOrderAlert(o, true);
              }
            });
          }
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
      if (ticketsRes.status === 'fulfilled' && Array.isArray(ticketsRes.value)) {
        const freshTickets = ticketsRes.value;
        setTickets(freshTickets);

        // Detect newly arrived support tickets not in initial load
        if (!isInitialTicketLoadRef.current) {
          freshTickets.forEach(t => {
            const tid = String(t.ticketId || t.id || '');
            if (tid && !knownTicketIdsRef.current.has(tid)) {
              triggerDistributorTicketAlert(t);
            }
          });
        }

        freshTickets.forEach(t => {
          const tid = String(t.ticketId || t.id || '');
          if (tid) knownTicketIdsRef.current.add(tid);
        });
        isInitialTicketLoadRef.current = false;
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
    let ticketChannel = null;

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        orderChannel = new BroadcastChannel('atomy_order_channel');
        orderChannel.onmessage = (event) => {
          const data = event.data;
          if (data && data.type === 'ORDER_CANCELLED') {
            const o = data.order || { orderId: data.orderId, pincode: data.pincode };
            if (!o.pincode || matchesDistributorTerritory(o)) {
              triggerDistributorCancelAlert(data);
              loadDashboardData(true);
            }
            return;
          }
          if (data && (data.type === 'ORDER_PLACED' || data.type === 'NEW_ORDER') && data.order) {
            const o = data.order;
            if (matchesDistributorTerritory(o)) {
              if (isSubDistributor && isSubstituteStandbyRef.current) {
                // Primary is on active duty: Co-Manager in standby does not receive or ring orders
                return;
              }
              triggerDistributorOrderAlert(o, true);
              loadDashboardData(true);
            }
          }
        };

        ticketChannel = new BroadcastChannel('atomy_ticket_channel');
        ticketChannel.onmessage = (event) => {
          const data = event.data;
          if (data && (data.type === 'NEW_TICKET' || data.type === 'TICKET_CREATED') && data.ticket) {
            const t = data.ticket;
            const matchesTicket = (t.assignedDistributorId && t.assignedDistributorId === distId) ||
              (t.pincode && matchesDistributorTerritory({ pincode: t.pincode })) ||
              (!t.assignedDistributorId && !t.pincode);
            if (matchesTicket) {
              triggerDistributorTicketAlert(t);
              loadDashboardData(true);
            }
          }
        };

        syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.onmessage = (event) => {
          const data = event.data;
          if (data && data.type === 'HUB_HANDOVER_STATUS_CHANGED') {
            if (isSubDistributor) {
              setHubTeamInfo(prev => {
                const updated = {
                  ...(prev || {}),
                  primaryManager: {
                    ...(prev?.primaryManager || {}),
                    onLeave: Boolean(data.onLeave)
                  }
                };
                try {
                  sessionStorage.setItem('atomy_cached_hub_team', JSON.stringify(updated));
                } catch (e) { }
                return updated;
              });
              setLiveDistributor(prev => ({
                ...(prev || {}),
                isSubstituteActive: Boolean(data.onLeave),
                status: data.onLeave ? 'ACTIVE' : 'STANDBY'
              }));
            }
            loadDashboardData(true);
            return;
          }
          if (data && data.type === 'ORDER_CANCELLED') {
            const o = data.order || { orderId: data.orderId, pincode: data.pincode };
            if (!o.pincode || matchesDistributorTerritory(o)) {
              triggerDistributorCancelAlert(data);
              loadDashboardData(true);
            }
            return;
          }
          if (data && (data.type === 'ORDER_PLACED' || data.type === 'NEW_ORDER') && data.order) {
            const o = data.order;
            if (matchesDistributorTerritory(o)) {
              if (isSubDistributor && isSubstituteStandbyRef.current) {
                return;
              }
              triggerDistributorOrderAlert(o, true);
              loadDashboardData(true);
            }
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }

    const handleWindowCancel = (e) => {
      if (e.detail) {
        triggerDistributorCancelAlert({ order: e.detail, orderId: e.detail.orderId, cancelReason: e.detail.cancelReason, cancelNotes: e.detail.cancelNotes });
        loadDashboardData(true);
      }
    };
    window.addEventListener('atomy:order-cancelled', handleWindowCancel);

    // 2. Real-time background sync polling every 5 seconds
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadDashboardData(true);
    }, 5000);

    return () => {
      if (orderChannel) orderChannel.close();
      if (ticketChannel) ticketChannel.close();
      if (syncChannel) syncChannel.close();
      window.removeEventListener('atomy:order-cancelled', handleWindowCancel);
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
    } catch (e) { }

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
    } catch (e) { }

    showToast('Dispatch tracking updated & customer notified via email / SMS!');

    // 4. Background network persistence without blocking UI
    try {
      await updateDistributorOrderTracking(orderId, distId, trackingPayload);
    } catch (err) {
      console.warn('Network tracking update note (optimistic update kept):', err.message);
    }

    // Refresh dashboard in background
    loadDashboardData().catch(() => { });
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
    } catch (e) { }

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
    } catch (e) { }

    showToast(`Order ${orderId} status set to ${newStatus}`);

    // 4. Background network persistence without blocking UI
    try {
      await updateDistributorOrderStatus(orderId, distId, newStatus);
    } catch (err) {
      console.warn('Network status update note (optimistic update kept):', err.message);
    }

    // Refresh dashboard in background
    loadDashboardData().catch(() => { });
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
      await updateDistributorStock(distId, payload.id, payload.stockQuantity, payload.lowStockThreshold).catch(() => { });
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

  // Notification State Management for Distributor & Substitute
  const [notifState, setNotifState] = useState(() => {
    try {
      const saved = localStorage.getItem(`atomy_hub_notif_state_${distId}`);
      return saved ? JSON.parse(saved) : { readIds: [], deletedIds: [], allRead: false };
    } catch {
      return { readIds: [], deletedIds: [], allRead: false };
    }
  });

  const persistNotifState = (nextState) => {
    setNotifState(nextState);
    try {
      localStorage.setItem(`atomy_hub_notif_state_${distId}`, JSON.stringify(nextState));
    } catch { }
  };

  // Dynamically generated real-time notifications for this regional hub
  const hubNotifications = useMemo(() => {
    if (!currentDist) return [];
    const list = [];
    const readSet = new Set(notifState?.readIds || []);
    const deletedSet = new Set(notifState?.deletedIds || []);
    const isAllRead = Boolean(notifState?.allRead);
    const allReadTs = notifState?.allReadTimestamp ? Number(notifState.allReadTimestamp) : 0;

    const checkIsRead = (id, targetId, createdAt) => {
      if (isAllRead) return true;
      if (allReadTs > 0 && createdAt && new Date(createdAt).getTime() <= allReadTs) return true;
      if (readSet.has(id)) return true;
      if (targetId && readSet.has(targetId)) return true;
      if (readSet.has('all')) return true;
      return false;
    };

    // 1. Handover & Operational Command Alerts
    if (isSubDistributor) {
      if (isSubstituteInCommand) {
        const id = `notif_handover_command_${distId}`;
        if (!deletedSet.has(id)) {
          list.push({
            id,
            type: 'handover',
            priority: 'high',
            title: '⚡ Operational Handover: You Are In Command',
            message: `Primary Distributor ${primaryManager?.contactPerson || currentDist?.primaryManagerName || 'Franchise Owner'} is on leave. Full operational authority of Regional Hub PIN ${currentDist?.primaryPincode || '635002'} is transferred to you.`,
            targetTab: 'settings',
            createdAt: new Date().toISOString(),
            read: checkIsRead(id, null, null)
          });
        }
      } else {
        const id = `notif_handover_standby_${distId}`;
        if (!deletedSet.has(id)) {
          list.push({
            id,
            type: 'system',
            priority: 'normal',
            title: '🛡️ Standby Relief Co-Manager Mode',
            message: `Primary Hub Manager is on active duty. You are on standby to take over regional operations whenever leave is requested.`,
            targetTab: 'settings',
            createdAt: new Date().toISOString(),
            read: checkIsRead(id, null, null)
          });
        }
      }
    } else if (currentDist?.substituteManagerName || currentDist?.substituteManagerEmail) {
      const id = `notif_substitute_linked_${distId}`;
      if (!deletedSet.has(id)) {
        list.push({
          id,
          type: 'system',
          priority: 'normal',
          title: '👥 Co-Manager Linked for Relief Duty',
          message: `Co-Manager ${currentDist?.substituteManagerName || 'Assistant'} (${currentDist?.substituteManagerEmail}) is registered for PIN ${currentDist?.primaryPincode || '635002'} to maintain uninterrupted operations during leave.`,
          targetTab: 'settings',
          createdAt: new Date().toISOString(),
          read: checkIsRead(id, null, null)
        });
      }
    }

    // 2. Customer Orders (Delayed SLA, Placed, Preparing, Pickup Ready, Delivered)
    (orders || []).forEach(order => {
      const oid = String(order.orderId || order.id || '');
      if (!oid) return;
      const st = String(order.orderStatus || order.status || 'PLACED').toUpperCase();

      // Delayed SLA Alert
      const base = new Date(order.createdAt || Date.now());
      const isDelayed = (new Date() > new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000)) && st !== 'DELIVERED' && st !== 'CANCELLED';
      if (isDelayed) {
        const delayedId = `notif_delayed_${oid}`;
        if (!deletedSet.has(delayedId)) {
          list.push({
            id: delayedId,
            type: 'delayed_order',
            priority: 'alert',
            title: `⚠️ Delivery SLA Delay Warning: #${oid}`,
            message: `Shipment for ${order.customerName || 'Customer'} is past the 48-hour delivery commitment. Please expedite dispatch.`,
            targetTab: 'orders',
            targetId: oid,
            createdAt: order.createdAt || new Date().toISOString(),
            read: checkIsRead(delayedId, oid, order.createdAt)
          });
        }
      }

      // Order Status Specific Notification
      const orderNotifId = `notif_order_${oid}_${st}`;
      if (!deletedSet.has(orderNotifId)) {
        let notifType = 'order';
        let title = `New Order Placed: #${oid}`;
        let message = `Customer ${order.customerName || 'Customer'} placed order for ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}.`;
        let priority = 'normal';

        if (st === 'PLACED') {
          priority = 'high';
          title = `📦 New Order Placed: #${oid}`;
          message = `New order received from ${order.customerName || 'Customer'} (₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}) for ${order.fulfillmentType === 'STORE_PICKUP' ? 'Store Pickup' : 'Courier Delivery'}.`;
        } else if (st === 'PROCESSING') {
          title = `📋 Order Packing in Progress: #${oid}`;
          message = `Hub staff currently picking items and packing package for ${order.customerName || 'Customer'}.`;
        } else if (st === 'READY_FOR_PICKUP') {
          notifType = 'pickup';
          priority = 'high';
          title = `🏬 Ready for Customer Pickup: #${oid}`;
          message = `Package is waiting at hub counter for customer collection. OTP required for handover.`;
        } else if (st === 'DELIVERED') {
          notifType = 'delivery';
          priority = 'success';
          title = `✅ Order Handed Over & Completed: #${oid}`;
          message = `Order #${oid} verified and completed. Hub commission has been recorded.`;
        } else if (st === 'CANCELLED' || st === 'REFUNDED') {
          notifType = 'cancellation';
          priority = 'alert';
          const reason = order.cancelReason || order.cancellationReason || order.returnReason || 'Ordered by mistake / Change of mind';
          title = `🚫 Order Cancelled: #${oid}`;
          message = `Order #${oid} for ${order.customerName || 'Customer'} was cancelled. Reason: "${reason}"${order.cancelNotes ? ` (Note: ${order.cancelNotes})` : ''}. 100% refund settlement registered.`;
        }

        list.push({
          id: orderNotifId,
          type: notifType,
          priority,
          title,
          message,
          targetTab: 'orders',
          targetId: oid,
          createdAt: order.updatedAt || order.createdAt || new Date().toISOString(),
          read: checkIsRead(orderNotifId, oid, order.updatedAt || order.createdAt)
        });
      }
    });

    // 3. Customer Support Inquiries
    (tickets || []).forEach(ticket => {
      const tid = String(ticket.ticketId || ticket.id || '');
      if (!tid) return;
      const ticketNotifId = `notif_ticket_${tid}_${ticket.status || 'OPEN'}`;
      if (!deletedSet.has(ticketNotifId)) {
        list.push({
          id: ticketNotifId,
          type: 'support',
          priority: ticket.status === 'OPEN' ? 'high' : 'normal',
          title: `Customer Support: #${tid}`,
          message: `[${ticket.category || 'Inquiry'}] From ${ticket.customerName || ticket.name || 'Customer'}: "${ticket.subject || ticket.message || 'Help requested'}" (${ticket.status || 'OPEN'})`,
          targetTab: 'support',
          targetId: tid,
          createdAt: ticket.createdAt || new Date().toISOString(),
          read: checkIsRead(ticketNotifId, tid, ticket.createdAt)
        });
      }
    });

    // 4. Low stock alert if any
    if (stats?.lowStockProductsCount > 0) {
      const stockId = `notif_low_stock_${distId}`;
      if (!deletedSet.has(stockId)) {
        list.push({
          id: stockId,
          type: 'inventory',
          priority: 'alert',
          title: `📉 Inventory Alert: ${stats.lowStockProductsCount} Products Low on Stock`,
          message: `Several catalog products in regional hub PIN ${currentDist?.primaryPincode || '635002'} are approaching safety thresholds. Restock to prevent order fulfillment delays.`,
          targetTab: 'inventory',
          createdAt: new Date().toISOString(),
          read: checkIsRead(stockId, null, null)
        });
      }
    }

    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [currentDist, notifState, isSubDistributor, isSubstituteInCommand, orders, tickets, distId, primaryManager, stats]);

  // Handlers for user interactions
  const handleMarkNotificationAsRead = (id, forceRead = true) => {
    setNotifState(prev => {
      const currentReads = new Set(prev?.readIds || []);
      const cleanOid = String(id).replace(/^notif_(order|delayed|ticket)_/, '').replace(/_[A-Z_]+$/, '');
      if (forceRead) {
        currentReads.add(id);
        if (cleanOid) {
          currentReads.add(cleanOid);
          currentReads.add(`notif_order_${cleanOid}_PLACED`);
          currentReads.add(`notif_order_${cleanOid}_PROCESSING`);
          currentReads.add(`notif_order_${cleanOid}_READY_FOR_PICKUP`);
          currentReads.add(`notif_order_${cleanOid}_DELIVERED`);
          currentReads.add(`notif_order_${cleanOid}_CANCELLED`);
          currentReads.add(`notif_order_${cleanOid}_REFUNDED`);
          currentReads.add(`notif_delayed_${cleanOid}`);
        }
      } else {
        currentReads.delete(id);
        if (cleanOid) currentReads.delete(cleanOid);
      }
      const next = {
        ...(prev || {}),
        allRead: false,
        readIds: Array.from(currentReads),
        deletedIds: prev?.deletedIds || []
      };
      try {
        localStorage.setItem(`atomy_hub_notif_state_${distId}`, JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifState(prev => {
      const allIds = hubNotifications.map(n => n.id);
      const allOids = hubNotifications.map(n => n.targetId).filter(Boolean);
      const currentReads = new Set([...(prev?.readIds || []), ...allIds, ...allOids, 'all']);
      const next = {
        ...(prev || {}),
        allRead: true,
        allReadTimestamp: Date.now(),
        readIds: Array.from(currentReads),
        deletedIds: prev?.deletedIds || []
      };
      try {
        localStorage.setItem(`atomy_hub_notif_state_${distId}`, JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const handleDeleteNotification = (id) => {
    setNotifState(prev => {
      const currentDeletes = new Set(prev?.deletedIds || []);
      currentDeletes.add(id);
      const next = {
        ...(prev || {}),
        deletedIds: Array.from(currentDeletes)
      };
      try {
        localStorage.setItem(`atomy_hub_notif_state_${distId}`, JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const handleClearAllNotifications = () => {
    setNotifState(prev => {
      const readIds = hubNotifications.filter(n => n.read).map(n => n.id);
      const next = {
        ...(prev || {}),
        deletedIds: Array.from(new Set([...(prev?.deletedIds || []), ...readIds]))
      };
      try {
        localStorage.setItem(`atomy_hub_notif_state_${distId}`, JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const handleDismissNotificationFromHeader = (notifIdOrOrder) => {
    let targetId = '';
    if (typeof notifIdOrOrder === 'object') {
      targetId = notifIdOrOrder.orderId || notifIdOrOrder.id || '';
    } else {
      targetId = String(notifIdOrOrder);
    }
    const cleanId = targetId.replace(/^delayed_/, '');
    setNotifState(prev => {
      const currentReads = new Set(prev?.readIds || []);
      currentReads.add(targetId);
      currentReads.add(cleanId);
      currentReads.add(`notif_order_${cleanId}_PLACED`);
      currentReads.add(`notif_order_${cleanId}_PROCESSING`);
      currentReads.add(`notif_order_${cleanId}_READY_FOR_PICKUP`);
      currentReads.add(`notif_order_${cleanId}_DELIVERED`);
      currentReads.add(`notif_order_${cleanId}_CANCELLED`);
      currentReads.add(`notif_order_${cleanId}_REFUNDED`);
      currentReads.add(`notif_delayed_${cleanId}`);
      const next = {
        ...(prev || {}),
        readIds: Array.from(currentReads),
        deletedIds: prev?.deletedIds || []
      };
      try {
        localStorage.setItem(`atomy_hub_notif_state_${distId}`, JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const unreadNotifsCount = useMemo(() => {
    if (isSubstituteStandby) return 0;
    return hubNotifications.filter(n => !n.read).length;
  }, [hubNotifications, isSubstituteStandby]);

  const overviewStatsMapped = {
    todayOrdersCount: isSubstituteStandby ? 0 : (orders || []).filter(o => new Date(o.createdAt || Date.now()) >= new Date(new Date().setHours(0, 0, 0, 0))).length,
    unreadOrdersCount: isSubstituteStandby ? 0 : recentNewOrders.length,
    delayedCount: isSubstituteStandby ? 0 : delayedOrders.length,
    delayedOrders: isSubstituteStandby ? [] : delayedOrders,
    unreadDelayedCount: isSubstituteStandby ? 0 : delayedOrders.length,
    unreadTicketsCount: isSubstituteStandby ? 0 : (tickets || []).filter(t => t.status === 'OPEN').length,
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
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: (activeTab !== 'notifications' && unreadNotifsCount > 0) ? String(unreadNotifsCount) : null, isLocked: false },
    { id: 'settings', label: isSubDistributor ? 'Profile Settings' : 'Hub Settings', icon: isSubDistributor ? User : Settings, isLocked: false }
  ];

  return (
    <div className="admin-master-wrapper">
      {/* 1. Master Header with live notifications & profile */}
      <Header
        cartCount={0}
        onCartClick={() => { }}
        onNavigateHome={onBackToStore}
        currentView="admin"
        adminProfile={headerAdminProfile}
        onLogout={onLogout}
        onNavigateAdminProfile={() => {
          setIsEditingProductView(false);
          setActiveTab('settings');
        }}
        notificationCount={unreadNotifsCount}
        overviewStats={overviewStatsMapped}
        onSelectNotificationTab={(tab, filter, targetId) => {
          setIsEditingProductView(false);
          if (targetId) setInspectingOrderId(targetId);
          if (tab === 'notifications') {
            setActiveTab('notifications');
          } else if (tab === 'orders') {
            setActiveTab('orders');
          } else if (tab === 'support') {
            setActiveTab('support');
          } else if (tab === 'inventory') {
            setActiveTab('inventory');
          } else if (tab === 'settings') {
            setActiveTab('settings');
          } else if (tab === 'finance') {
            setActiveTab('finance');
          }
        }}
        onMarkAllNotifsAsRead={handleMarkAllNotificationsAsRead}
        onDismissNotif={handleDismissNotificationFromHeader}
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
                if (activeAlert.type === 'support') {
                  setActiveTab('support');
                } else if (activeAlert.type === 'cancellation') {
                  setActiveTab('finance');
                } else {
                  setActiveTab('orders');
                }
                setActiveAlert(null);
              }}
            >
              {activeAlert.type === 'support' ? 'View Support Inquiry →' : (activeAlert.type === 'cancellation' ? 'Inspect Refund Queue →' : 'Fulfill & Dispatch Order →')}
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
            href={import.meta.env.VITE_STORE_URL || "https://atomy-india-eta.vercel.app"}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-refresh-btn"
            style={{ textDecoration: 'none', background: '#00a3e0', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Open Live Customer Store"
          >
            <ExternalLink size={13} />
            <span>Customer Store</span>
          </a>
        </div>
      </div>

      {/* Mobile-Only Substitute Co-Manager Status Pill */}
      {isSubDistributor && (
        <div className="substitute-mobile-status-strip">
          {isSubstituteStandby ? (
            <div className="substitute-mobile-badge standby">
              <Clock size={12} />
              <span>STANDBY RELIEF • Primary Active (PIN {currentDist?.primaryPincode})</span>
            </div>
          ) : (
            <div className="substitute-mobile-badge command">
              <Sparkles size={12} />
              <span>TEMPORARY COMMAND ACTIVE • Full Authority</span>
            </div>
          )}
        </div>
      )}

      {/* Mobile Slide-Out Sidebar Drawer */}
      {isMobileNavOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsMobileNavOpen(false)}>
          <div className="mobile-sidebar-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-brand">
                <div className="mobile-drawer-avatar">
                  {(currentDist?.contactPerson || currentDist?.businessName || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="mobile-drawer-meta">
                  <span className="mobile-drawer-title">
                    {currentDist?.contactPerson || currentDist?.businessName || 'Regional Hub'}
                  </span>
                  <span className="mobile-drawer-pin">
                    {isSubDistributor
                      ? (isSubstituteStandby ? `Standby Co-Manager • PIN ${currentDist?.primaryPincode}` : `Co-Manager In Command • PIN ${currentDist?.primaryPincode}`)
                      : `Assigned Area: PIN ${currentDist?.primaryPincode}`}
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
                const isLocked = item.isLocked;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`mobile-drawer-nav-item ${isActive ? 'active' : ''} ${isLocked ? 'is-locked-tab' : ''}`}
                    onClick={() => {
                      setIsEditingProductView(false);
                      setActiveTab(item.id);
                      setIsMobileNavOpen(false);
                      if (isLocked) {
                        showToast(`Access Blocked: ${item.label} is locked while Primary is on active duty.`);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={isLocked ? { opacity: 0.65 } : {}}
                  >
                    <div className="mobile-drawer-nav-icon">
                      <Icon size={18} />
                    </div>
                    <span className="mobile-drawer-nav-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>{item.label}</span>
                      {isLocked && <Lock size={12} style={{ color: '#d97706', marginLeft: 'auto', flexShrink: 0 }} />}
                    </span>
                    {item.badge && !isLocked && (
                      <span className="mobile-drawer-badge">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mobile-drawer-footer">
              <a
                href={import.meta.env.VITE_STORE_URL || "https://atomy-india-eta.vercel.app"}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-drawer-store-btn"
              >
                <ExternalLink size={15} />
                <span>Customer Store</span>
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
              onCancel={handleCloseProductEditor}
            />
          ) : isSubDistributor && hubTeamInfo === null && isLoading ? (
            <div className="admin-tab-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '440px', gap: '14px' }}>
              <RefreshCw size={32} className="animate-spin" color="#00a3e0" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                Connecting to Regional Logistics Hub...
              </span>
            </div>
          ) : isSubstituteStandby && activeTab !== 'settings' ? (
            <div className="admin-tab-content standby-lockout-tab">
              <div className="standby-lockout-card">
                {/* Big Lock / Shield Graphic */}
                <div className="standby-graphic-circle">
                  <ShieldCheck className="standby-shield-icon" strokeWidth={2.2} />
                </div>

                <div className="standby-status-pill">
                  🔒 Standby Relief Mode Active — All Operations Locked
                </div>

                <h1 className="standby-title">
                  Primary Distributor is Currently Active
                </h1>

                <p className="standby-desc">
                  Primary Distributor <strong style={{ color: '#0f172a' }}>{primaryManager?.contactPerson || currentDist?.primaryManagerName || 'Selva Kumar'}</strong> is on active duty managing this hub. As the Temporary Substitute / Co-Manager, all hub operational pages (Inventory, Orders, Customers, Membership, and Settlements) are locked while the Primary is active.
                </p>

                {/* Hub & Role Summary Card */}
                <div className="standby-summary-grid">
                  <div className="standby-summary-item">
                    <span className="standby-summary-label">
                      Regional Hub Franchise
                    </span>
                    <span className="standby-summary-value text-slate">
                      <Building2 size={15} color="#00A3E0" />
                      {currentDist?.parentHubName || currentDist?.businessName || 'Regional Hub'}
                    </span>
                    <span className="standby-summary-sub">
                      Territory PIN: <strong>{currentDist?.primaryPincode}</strong>
                    </span>
                  </div>

                  <div className="standby-summary-item">
                    <span className="standby-summary-label">
                      Primary Manager on Duty
                    </span>
                    <span className="standby-summary-value text-green">
                      <span className="standby-dot-green"></span>
                      {primaryManager?.contactPerson || currentDist?.primaryManagerName || 'Selva Kumar'} (Active)
                    </span>
                    <span className="standby-summary-sub">
                      {primaryManager?.email || 'primary.hub@atomy.com'}
                    </span>
                  </div>

                  <div className="standby-summary-item">
                    <span className="standby-summary-label">
                      Your Account &amp; Status
                    </span>
                    <span className="standby-summary-value text-amber">
                      <Clock size={15} color="#b45309" />
                      {currentDist?.contactPerson || 'Temporary Substitute'} (Standby)
                    </span>
                    <span className="standby-summary-sub">
                      Account ID: <strong>{currentDist?.distributorId}</strong>
                    </span>
                  </div>
                </div>

                {/* Blocked Pages Overview List */}
                <div className="standby-blocked-box">
                  <div className="standby-blocked-heading">
                    🔒 Hub Operational Pages Blocked in Standby Mode:
                  </div>
                  <div className="standby-blocked-grid">
                    {[
                      'Overview & Metrics',
                      'Inventory & Stock Management',
                      'Customer Orders & Logistics Dispatches',
                      'Customer Directory & Contact Details',
                      'Customer Support Escalations',
                      'Membership Accounts & Tier Approvals',
                      'Finance & Remittance Settlements'
                    ].map(p => (
                      <span key={p} className="standby-blocked-chip">
                        <Lock size={11} color="#d97706" />
                        <span>{p}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="standby-actions-row">
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="standby-action-btn primary"
                  >
                    <User size={17} />
                    <span>Manage My Profile Settings →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loadDashboardData();
                      showToast('Checking Primary Distributor live status...');
                    }}
                    className="standby-action-btn secondary"
                  >
                    <RefreshCw size={15} />
                    <span>Refresh Live Status</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* TEMPORARY COMMAND ACTIVE BANNER */}
              {isSubstituteInCommand && showCommandBanner && (
                <div className="temporary-command-banner">
                  <div className="command-banner-content">
                    <div className="command-banner-icon">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <div className="command-banner-title">
                        ⚡ TEMPORARY COMMAND ACTIVE — Full Operational Authority
                      </div>
                      <div className="command-banner-desc">
                        Primary Distributor <strong>{primaryManager?.contactPerson || currentDist?.primaryManagerName || 'Franchise Owner'}</strong> is currently on leave. You have full operational control over stock, orders, and customer store pickups.
                      </div>
                    </div>
                  </div>
                  <div className="command-banner-actions">
                    <span className="command-banner-badge">
                      IN COMMAND
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCommandBanner(false)}
                      className="command-banner-close-btn"
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
                  initialSelectedOrderId={inspectingOrderId}
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

              {activeTab === 'notifications' && (
                <DistributorNotificationsPage
                  distributorUser={currentDist}
                  isSubstitute={isSubDistributor}
                  isSubstituteInCommand={isSubstituteInCommand}
                  isSubstituteStandby={isSubstituteStandby}
                  orders={orders}
                  tickets={tickets}
                  primaryManager={primaryManager}
                  notifications={hubNotifications}
                  onMarkAsRead={handleMarkNotificationAsRead}
                  onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                  onDeleteNotification={handleDeleteNotification}
                  onClearAllNotifications={handleClearAllNotifications}
                  onNavigateTab={(tab, filter, targetId) => {
                    setIsEditingProductView(false);
                    if (targetId) setInspectingOrderId(targetId);
                    setActiveTab(tab);
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <div className="admin-tab-content">
                  <DistributorSettingsPage
                    distributor={currentDist}
                    soundSettings={soundSettings}
                    onUpdateSoundSettings={setSoundSettings}
                    showToast={showToast}
                    onLogout={onLogout}
                    onSaveSettings={async (updatedPayload) => {
                      if (updatedPayload) {
                        setLiveDistributor(prev => {
                          const updated = { ...prev, ...updatedPayload };
                          try {
                            const sessionStr = sessionStorage.getItem('atomy_admin_session') || localStorage.getItem('atomy_admin_session');
                            if (sessionStr) {
                              const sessionObj = JSON.parse(sessionStr);
                              if (sessionObj?.adminUser) {
                                sessionObj.adminUser = { ...sessionObj.adminUser, ...updatedPayload };
                                if (sessionStorage.getItem('atomy_admin_session')) {
                                  sessionStorage.setItem('atomy_admin_session', JSON.stringify(sessionObj));
                                }
                                if (localStorage.getItem('atomy_admin_session')) {
                                  localStorage.setItem('atomy_admin_session', JSON.stringify(sessionObj));
                                }
                              }
                            }
                          } catch (e) { console.warn(e); }
                          return updated;
                        });
                      }
                      showToast(isSubDistributor ? 'Personal profile updated successfully!' : 'Hub settings updated successfully!');
                      await loadDashboardData(true);
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
          onClose={() => {
            if (window.history.state?.subView === 'tracking-modal') {
              window.history.back();
            } else {
              setSelectedOrderForTracking(null);
            }
          }}
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
