import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  IndianRupee,
  TrendingUp,
  RotateCcw,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Truck,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Calendar,
  FileText,
  BadgePercent,
  Check,
  RefreshCw,
  Eye,
  Info,
  Building2,
  Trophy,
  Crown,
  MapPin,
  Sparkles,
  BarChart2,
  Activity,
  UserCheck,
  XCircle
} from 'lucide-react';
import CustomDropdown from '../common/CustomDropdown';
import { fetchDistributorList } from '../../services/distributorService';
import './FinanceSettlementPage.css';

export default function FinanceSettlementPage({
  orders = [],
  tickets = [],
  products = [],
  distributors = [],
  onProcessRefund,
  onInspectOrder,
  onNavigateToOrders,
  onNavigateToSupport
}) {
  // Sub-tabs: 'hubs' | 'overview' | 'queue' | 'rules'
  const [activeFinanceSubTab, setActiveFinanceSubTab] = useState('hubs');

  // Filter & Search states for Transaction Ledger
  const [timeRange, setTimeRange] = useState('ALL'); // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'REFUNDED' | 'CANCELLED' | 'PENDING'
  const [copiedId, setCopiedId] = useState(null);

  // Hub-wise state
  const [loadedDistributors, setLoadedDistributors] = useState(distributors || []);
  const [selectedHubId, setSelectedHubId] = useState(null);
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [hubSortBy, setHubSortBy] = useState('MONTH_SALES'); // 'MONTH_SALES' | 'LIFETIME_SALES' | 'TODAY_SALES' | 'ORDERS'
  const [hubChartRange, setHubChartRange] = useState('1M'); // '1W' | '1M' | '1Y'
  const [hoveredHubPoint, setHoveredHubPoint] = useState(null);

  // Persistent tracking of viewed refund alert items so alert badge disappears after view / view details
  const [viewedRefundOrderIds, setViewedRefundOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_viewed_refund_alerts');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markRefundAlertsAsViewed = useCallback((idsToMark) => {
    if (!idsToMark || idsToMark.length === 0) return;
    setViewedRefundOrderIds(prev => {
      const next = new Set(prev);
      let changed = false;
      idsToMark.forEach(id => {
        const strId = String(id);
        if (!next.has(strId)) {
          next.add(strId);
          changed = true;
        }
      });
      if (changed) {
        try {
          localStorage.setItem('atomy_viewed_refund_alerts', JSON.stringify(Array.from(next)));
        } catch { }
        return next;
      }
      return prev;
    });
  }, []);

  // When user is viewing the refund page, automatically mark all current refund orders as viewed
  useEffect(() => {
    if (activeFinanceSubTab === 'queue' && Array.isArray(orders)) {
      const currentIds = orders
        .filter(o => o.orderStatus === 'CANCELLED' || o.paymentStatus === 'REFUNDED' || o.isReplacement)
        .map(o => String(o.orderId || o.id));
      if (currentIds.length > 0) {
        markRefundAlertsAsViewed(currentIds);
      }
    }
  }, [activeFinanceSubTab, orders, markRefundAlertsAsViewed]);

  const handleInspectAudit = useCallback((order) => {
    if (order?.orderId || order?.id) {
      markRefundAlertsAsViewed([String(order.orderId || order.id)]);
    }
    if (onInspectOrder) onInspectOrder(order);
  }, [markRefundAlertsAsViewed, onInspectOrder]);

  const unreadRefundAlertCount = useMemo(() => {
    // While user is viewing the refund subtab, count is 0 so badge disappears immediately
    if (activeFinanceSubTab === 'queue') return 0;

    const refundOrders = (orders || []).filter(o =>
      o.orderStatus === 'CANCELLED' ||
      o.paymentStatus === 'REFUNDED' ||
      o.isReplacement
    );

    return refundOrders.filter(o => !viewedRefundOrderIds.has(String(o.orderId || o.id))).length;
  }, [activeFinanceSubTab, orders, viewedRefundOrderIds]);

  // Mobile / Browser back button navigation for Finance Subtabs (return to main Hubs parent tab)
  const isFinancePopNavRef = useRef(false);

  useEffect(() => {
    if (isFinancePopNavRef.current) {
      isFinancePopNavRef.current = false;
      return;
    }
    if (activeFinanceSubTab !== 'hubs') {
      try {
        window.history.pushState({ subView: 'finance-subtab', subTab: activeFinanceSubTab }, '', window.location.href);
      } catch { }
    }
  }, [activeFinanceSubTab]);

  useEffect(() => {
    const handleFinancePopState = () => {
      if (activeFinanceSubTab !== 'hubs') {
        isFinancePopNavRef.current = true;
        setActiveFinanceSubTab('hubs');
      }
    };

    window.addEventListener('popstate', handleFinancePopState);
    return () => {
      window.removeEventListener('popstate', handleFinancePopState);
    };
  }, [activeFinanceSubTab]);

  // Synchronize or fetch distributors
  useEffect(() => {
    if (Array.isArray(distributors) && distributors.length > 0) {
      setLoadedDistributors(distributors);
    } else {
      fetchDistributorList()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setLoadedDistributors(data);
          }
        })
        .catch(() => { });
    }
  }, [distributors]);

  // Time boundaries
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfToday - (7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = startOfToday - (30 * 24 * 60 * 60 * 1000);

  // Helper: extract immutable order base timestamp
  const getOrderTimestamp = (order) => {
    if (!order) return Date.now();
    const raw = order.createdAt || order.date || order.orderDate;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.getTime();
    }
    if (order.orderId && /^ORD-(\d{4})(\d{2})(\d{2})/i.test(order.orderId)) {
      const m = order.orderId.match(/^ORD-(\d{4})(\d{2})(\d{2})/i);
      if (m) {
        return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), 12, 0).getTime();
      }
    }
    return Date.now();
  };

  // Map sub-distributors / co-managers to their PRIMARY HUB ID
  const subToParentHubMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(loadedDistributors)) {
      loadedDistributors.forEach(d => {
        const parentId = d.parentHubId || (d.distributorRole === 'PRIMARY_MANAGER' ? null : 'DIST-635002');
        if (d.parentHubId || d.distributorRole === 'SUB_DISTRIBUTOR' || String(d.businessName || '').toLowerCase().includes('co-manager')) {
          const resolvedParent = d.parentHubId || 'DIST-635002';
          if (d.distributorId) map.set(d.distributorId, resolvedParent);
          if (d.id) map.set(d.id, resolvedParent);
          if (d.businessName) map.set(d.businessName.toLowerCase(), resolvedParent);
          if (d.email) map.set(d.email.toLowerCase(), resolvedParent);
        }
      });
    }
    return map;
  }, [loadedDistributors]);

  // Base persistent regional hub definitions (Only Primary Hubs, NEVER Co-Managers!)
  const BASE_HUBS = useMemo(() => [
    {
      id: 'DIST-635002',
      distributorId: 'DIST-635002',
      businessName: 'Selva Atomy Regional Hub',
      contactPerson: 'Selva Kumar',
      city: 'Krishnagiri',
      state: 'Tamil Nadu',
      primaryPincode: '635002',
      assignedPincodes: ['635002', '635202'],
      phone: '+91 95388 53454',
      email: 'selvakumarc029@gmail.com',
      commissionRate: 8.0,
      status: 'ACTIVE'
    },
    {
      id: 'CENTRAL_SUPER_HUB',
      distributorId: 'CENTRAL_SUPER_HUB',
      businessName: 'Atomy Central Logistics Hub (Gurugram HQ)',
      contactPerson: 'Central Super Admin',
      city: 'Gurugram',
      state: 'Haryana',
      primaryPincode: '122001',
      assignedPincodes: ['122001', '110001'],
      phone: '+91 124 4567890',
      email: 'admin@atomy.com',
      commissionRate: 0,
      status: 'ACTIVE'
    }
  ], []);

  // Complete List of Regional Hubs: Exclude Co-Managers and Sub-Distributors
  const allHubsList = useMemo(() => {
    const list = [...BASE_HUBS];
    const existingIds = new Set(list.map(h => h.distributorId || h.id));

    if (Array.isArray(loadedDistributors)) {
      loadedDistributors.forEach(d => {
        // Exclude co-managers, sub-distributors, substitutes: they belong to the primary hub
        const isSubOrCoManager =
          Boolean(d.parentHubId && d.parentHubId.trim()) ||
          d.distributorRole === 'SUB_DISTRIBUTOR' ||
          d.role === 'SUB_DISTRIBUTOR' ||
          String(d.businessName || '').toLowerCase().includes('co-manager') ||
          String(d.businessName || '').toLowerCase().includes('substitute') ||
          String(d.distributorRole || '').toLowerCase().includes('sub');

        if (isSubOrCoManager) return; // Do not list co-manager separately!

        const id = d.distributorId || d.id;
        if (id && !existingIds.has(id)) {
          existingIds.add(id);
          list.push({
            id: id,
            distributorId: id,
            businessName: d.businessName || d.distributorName || `Regional Hub (${id})`,
            contactPerson: d.contactPerson || d.distributorName || 'Hub Manager',
            city: d.city || 'Regional Center',
            state: d.state || 'India',
            primaryPincode: d.primaryPincode || (Array.isArray(d.assignedPincodes) ? d.assignedPincodes[0] : 'N/A'),
            assignedPincodes: d.assignedPincodes || [],
            phone: d.phone || 'N/A',
            email: d.email || 'N/A',
            commissionRate: d.commissionRate || 8.0,
            status: d.status || 'ACTIVE'
          });
        }
      });
    }

    // Scan orders to detect any dynamically assigned hub ID or name
    orders.forEach(o => {
      const name = String(o.assignedDistributorName || '');
      if (name.toLowerCase().includes('co-manager') || name.toLowerCase().includes('substitute')) return;

      let hid = o.assignedDistributorId || o.distributorId;
      if (hid && subToParentHubMap.has(hid)) {
        hid = subToParentHubMap.get(hid);
      }
      if (hid && !existingIds.has(hid)) {
        const isSub = loadedDistributors.some(d =>
          (d.distributorId === hid || d.id === hid) &&
          (d.parentHubId || d.distributorRole === 'SUB_DISTRIBUTOR' || String(d.businessName || '').toLowerCase().includes('co-manager'))
        );
        if (isSub) return;

        existingIds.add(hid);
        list.push({
          id: hid,
          distributorId: hid,
          businessName: o.assignedDistributorName || `Regional Logistics Hub (${hid})`,
          contactPerson: 'Assigned Hub Partner',
          city: o.city || 'Regional Center',
          state: o.state || 'India',
          primaryPincode: o.pincode || 'N/A',
          assignedPincodes: o.pincode ? [String(o.pincode)] : [],
          phone: 'N/A',
          email: 'N/A',
          commissionRate: 8.0,
          status: 'ACTIVE'
        });
      }
    });

    return list;
  }, [BASE_HUBS, loadedDistributors, orders, subToParentHubMap]);

  // Master Financial Computations
  const financeStats = useMemo(() => {
    let todayGrossSales = 0;
    let todayOrdersCount = 0;
    let todayRefundedAmount = 0;
    let todayRefundCount = 0;

    let overallGrossSales = 0;
    let overallOrdersCount = orders.length;
    let totalRefundedAmount = 0;
    let totalRefundedCount = 0;

    let totalReplacementsCount = 0;
    let estimatedReplacementValue = 0;

    // Payment Methods Breakdown
    const methodTotals = {
      ONLINE_UPI: 0,
      CREDIT_DEBIT_CARD: 0,
      NET_BANKING: 0,
      CASH_ON_DELIVERY: 0
    };

    orders.forEach(order => {
      const amt = Number(order.totalAmount) || 0;
      const orderTs = getOrderTimestamp(order);
      const isToday = orderTs >= startOfToday;
      const isCancelledOrRefunded = order.orderStatus === 'CANCELLED' || order.paymentStatus === 'REFUNDED';

      if (!isCancelledOrRefunded) {
        overallGrossSales += amt;
        if (isToday) {
          todayGrossSales += amt;
          todayOrdersCount += 1;
        }

        const m = order.paymentMethod || 'ONLINE_UPI';
        if (methodTotals[m] !== undefined) {
          methodTotals[m] += amt;
        } else {
          methodTotals.ONLINE_UPI += amt;
        }
      } else {
        totalRefundedAmount += amt;
        totalRefundedCount += 1;
        if (isToday) {
          todayRefundedAmount += amt;
          todayRefundCount += 1;
        }
      }

      if (order.isReplacement || order.notes?.toLowerCase()?.includes('replacement')) {
        totalReplacementsCount += 1;
        estimatedReplacementValue += amt;
      }
    });

    const damagedTickets = tickets.filter(t =>
      t.category === 'DAMAGED_PRODUCT' ||
      t.subject?.toLowerCase()?.includes('replacement') ||
      t.message?.toLowerCase()?.includes('damaged')
    );
    if (damagedTickets.length > totalReplacementsCount) {
      totalReplacementsCount = damagedTickets.length;
      if (estimatedReplacementValue === 0) {
        estimatedReplacementValue = damagedTickets.length * 2850;
      }
    }

    const netRealizedRevenue = Math.max(0, overallGrossSales - totalRefundedAmount);
    const todayNetSales = Math.max(0, todayGrossSales - todayRefundedAmount);
    const averageOrderValue = Math.round(overallGrossSales / (overallOrdersCount > 0 ? overallOrdersCount : 1));
    const refundRate = overallGrossSales > 0 ? ((totalRefundedAmount / overallGrossSales) * 100).toFixed(1) : 0;

    return {
      todayGrossSales,
      todayOrdersCount,
      todayRefundedAmount,
      todayRefundCount,
      todayNetSales,
      overallGrossSales,
      overallOrdersCount,
      totalRefundedAmount,
      totalRefundedCount,
      totalReplacementsCount,
      estimatedReplacementValue,
      netRealizedRevenue,
      averageOrderValue,
      refundRate,
      methodTotals
    };
  }, [orders, tickets, startOfToday]);

  // Helper function to resolve an order to its Primary Hub
  const resolveOrderToPrimaryHubId = (order, hubMap) => {
    let assignedId = order.assignedDistributorId || order.distributorId;
    if (assignedId && subToParentHubMap.has(assignedId)) {
      assignedId = subToParentHubMap.get(assignedId);
    }
    if (order.assignedDistributorName && subToParentHubMap.has(order.assignedDistributorName.toLowerCase())) {
      assignedId = subToParentHubMap.get(order.assignedDistributorName.toLowerCase());
    }

    if (assignedId && hubMap.has(assignedId)) {
      return assignedId;
    }

    if (order.assignedDistributorName) {
      for (const [id, hub] of hubMap.entries()) {
        if (hub.businessName && hub.businessName.toLowerCase() === order.assignedDistributorName.toLowerCase()) {
          return id;
        }
      }
    }

    if (order.pincode) {
      const pin = String(order.pincode).trim();
      for (const [id, hub] of hubMap.entries()) {
        if (hub.primaryPincode && String(hub.primaryPincode).trim() === pin) {
          return id;
        }
        if (Array.isArray(hub.assignedPincodes) && hub.assignedPincodes.some(p => String(p).trim() === pin)) {
          return id;
        }
      }
    }

    return hubMap.has('CENTRAL_SUPER_HUB') ? 'CENTRAL_SUPER_HUB' : allHubsList[0]?.id;
  };

  // Dynamic Hub-Wise Sales Aggregation Engine (rolls up Co-Manager sales to Primary Hub)
  const hubSalesAnalytics = useMemo(() => {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const startOfCurrentMonth = new Date(curYear, curMonth, 1).getTime();

    const hubMap = new Map();
    allHubsList.forEach(hub => {
      hubMap.set(hub.id, {
        ...hub,
        todayGrossSales: 0,
        todayOrdersCount: 0,
        monthGrossSales: 0,
        monthOrdersCount: 0,
        lifetimeGrossSales: 0,
        lifetimeOrdersCount: 0,
        orders: []
      });
    });

    orders.forEach(order => {
      const isCancelledOrRef = order.paymentStatus === 'REFUNDED' || order.orderStatus === 'CANCELLED';
      if (isCancelledOrRef) return;

      const amt = Number(order.totalAmount) || 0;
      const orderTs = getOrderTimestamp(order);
      const isToday = orderTs >= startOfToday;
      const orderDate = new Date(orderTs);
      const isThisMonth = (orderDate.getFullYear() === curYear && orderDate.getMonth() === curMonth) || (orderTs >= startOfCurrentMonth);

      const matchedHubId = resolveOrderToPrimaryHubId(order, hubMap);
      const target = hubMap.get(matchedHubId);
      if (target) {
        target.lifetimeGrossSales += amt;
        target.lifetimeOrdersCount += 1;
        target.orders.push(order);

        if (isToday) {
          target.todayGrossSales += amt;
          target.todayOrdersCount += 1;
        }

        if (isThisMonth) {
          target.monthGrossSales += amt;
          target.monthOrdersCount += 1;
        }
      }
    });

    const hubsArray = Array.from(hubMap.values());
    const totalMonthSales = hubsArray.reduce((acc, h) => acc + h.monthGrossSales, 0);
    const totalTodaySales = hubsArray.reduce((acc, h) => acc + h.todayGrossSales, 0);
    const totalTodayOrders = hubsArray.reduce((acc, h) => acc + h.todayOrdersCount, 0);

    let topHubOfMonth = hubsArray[0];
    hubsArray.forEach(h => {
      if (h.monthGrossSales > (topHubOfMonth?.monthGrossSales || 0)) {
        topHubOfMonth = h;
      }
    });

    if (!topHubOfMonth || topHubOfMonth.monthGrossSales === 0) {
      topHubOfMonth = hubsArray.reduce((best, h) => (h.lifetimeGrossSales > (best?.lifetimeGrossSales || 0) ? h : best), hubsArray[0]);
    }

    const monthLeaderShare = totalMonthSales > 0 && topHubOfMonth
      ? Math.round((topHubOfMonth.monthGrossSales / totalMonthSales) * 100)
      : (topHubOfMonth?.lifetimeGrossSales > 0 ? 100 : 0);

    return {
      hubsArray,
      totalMonthSales,
      totalTodaySales,
      totalTodayOrders,
      topHubOfMonth,
      monthLeaderShare
    };
  }, [allHubsList, orders, startOfToday, subToParentHubMap]);

  // Dynamic Hub-Wise Refund & Cancellation Analysis Engine
  const hubRefundAnalytics = useMemo(() => {
    const hubMap = new Map();
    allHubsList.forEach(hub => {
      hubMap.set(hub.id, {
        ...hub,
        totalOrdersCount: 0,
        totalGrossAmount: 0,
        cancelledOrdersCount: 0,
        cancelledAmount: 0,
        refundedOrdersCount: 0,
        refundedAmount: 0,
        replacementCount: 0,
        replacementValue: 0
      });
    });

    orders.forEach(order => {
      const amt = Number(order.totalAmount) || 0;
      const matchedHubId = resolveOrderToPrimaryHubId(order, hubMap);
      const target = hubMap.get(matchedHubId);

      if (target) {
        target.totalOrdersCount += 1;
        target.totalGrossAmount += amt;

        const isCancelled = order.orderStatus === 'CANCELLED';
        const isRefunded = order.paymentStatus === 'REFUNDED' || isCancelled;
        const isReplacement = order.isReplacement || order.notes?.toLowerCase()?.includes('replacement');

        if (isCancelled) {
          target.cancelledOrdersCount += 1;
          target.cancelledAmount += amt;
        }

        if (isRefunded) {
          target.refundedOrdersCount += 1;
          target.refundedAmount += amt;
        }

        if (isReplacement) {
          target.replacementCount += 1;
          target.replacementValue += amt;
        }
      }
    });

    return Array.from(hubMap.values()).map(h => {
      const cancelRate = h.totalOrdersCount > 0 ? ((h.cancelledOrdersCount / h.totalOrdersCount) * 100).toFixed(1) : '0.0';
      const successRate = h.totalOrdersCount > 0 ? (((h.totalOrdersCount - h.cancelledOrdersCount) / h.totalOrdersCount) * 100).toFixed(1) : '100.0';
      return {
        ...h,
        cancelRate,
        successRate
      };
    });
  }, [allHubsList, orders, subToParentHubMap]);

  // Selected Hub for graph deep-dive
  const selectedHub = useMemo(() => {
    if (selectedHubId) {
      const found = hubSalesAnalytics.hubsArray.find(h => h.id === selectedHubId || h.distributorId === selectedHubId);
      if (found) return found;
    }
    return hubSalesAnalytics.topHubOfMonth || hubSalesAnalytics.hubsArray[0];
  }, [selectedHubId, hubSalesAnalytics]);

  // Generate Interactive Smooth SVG Sales Chart Data for Selected Hub
  const selectedHubChartData = useMemo(() => {
    if (!selectedHub) {
      return {
        points: [],
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        peakPoint: { revenue: 0, label: 'N/A' },
        svgW: 600,
        svgH: 220,
        maxRevenue: 1000
      };
    }

    const points = [];
    const hubOrders = selectedHub.orders || [];

    if (hubChartRange === '1W') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        const dayShort = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const dayDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        points.push({
          key,
          label: `${dayShort}, ${dayDate}`,
          tickLabel: `${dayShort} ${dd}`,
          fullDate: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          revenue: 0,
          ordersCount: 0
        });
      }
    } else if (hubChartRange === '1M') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        const dayDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        points.push({
          key,
          label: dayDate,
          tickLabel: (i === 29 || i === 0 || i % 6 === 0) ? dayDate : '',
          fullDate: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }),
          revenue: 0,
          ordersCount: 0
        });
      }
    } else {
      // 1Y
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${yyyy}-${mm}`;
        const monthShort = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        points.push({
          key,
          label: monthShort,
          tickLabel: monthShort,
          fullDate: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
          revenue: 0,
          ordersCount: 0
        });
      }
    }

    const keyIndexMap = new Map();
    points.forEach((p, idx) => keyIndexMap.set(p.key, idx));

    hubOrders.forEach(o => {
      const isRef = o.paymentStatus === 'REFUNDED' || o.orderStatus === 'CANCELLED';
      if (isRef) return;
      const amt = Number(o.totalAmount) || 0;
      const ts = getOrderTimestamp(o);
      const d = new Date(ts);
      if (isNaN(d.getTime())) return;

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');

      const targetKey = hubChartRange === '1Y' ? `${yyyy}-${mm}` : `${yyyy}-${mm}-${dd}`;
      if (keyIndexMap.has(targetKey)) {
        const idx = keyIndexMap.get(targetKey);
        points[idx].revenue += amt;
        points[idx].ordersCount += 1;
      }
    });

    const totalRevenue = points.reduce((acc, p) => acc + p.revenue, 0);
    const totalOrders = points.reduce((acc, p) => acc + p.ordersCount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const peakPoint = points.reduce((max, p) => (p.revenue > max.revenue ? p : max), points[0] || { revenue: 0, label: 'N/A' });

    const svgW = 600;
    const svgH = 220;
    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const chartW = svgW - padLeft - padRight;
    const chartH = svgH - padTop - padBottom;

    const maxVal = Math.max(...points.map(p => p.revenue), 1000);
    const maxRevenue = Math.ceil(maxVal * 1.15);

    const numPoints = points.length;
    const stepX = numPoints > 1 ? chartW / (numPoints - 1) : chartW;

    const coords = points.map((p, i) => {
      const x = padLeft + i * stepX;
      const ratio = maxRevenue > 0 ? (p.revenue / maxRevenue) : 0;
      const y = padTop + (1 - ratio) * chartH;
      return { x, y, ...p };
    });

    let linePath = '';
    let areaPath = '';
    if (coords.length > 0) {
      linePath = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 1; i < coords.length; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        const cpX = (prev.x + curr.x) / 2;
        linePath += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
      }
      const baselineY = padTop + chartH;
      areaPath = `${linePath} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`;
    }

    return {
      points: coords,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      peakPoint,
      svgW,
      svgH,
      padLeft,
      padRight,
      padTop,
      padBottom,
      chartW,
      chartH,
      maxRevenue,
      linePath,
      areaPath
    };
  }, [selectedHub, hubChartRange]);

  // Scroll to Selected Hub Graph
  const scrollToGraph = (hubId) => {
    if (hubId) setSelectedHubId(hubId);
    setActiveFinanceSubTab('hubs');
    setTimeout(() => {
      const el = document.getElementById('selected-hub-graph-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const shell = el.querySelector('.selected-hub-card-shell');
        if (shell) {
          shell.classList.remove('graph-pulse-highlight');
          void shell.offsetWidth; // trigger reflow
          shell.classList.add('graph-pulse-highlight');
          setTimeout(() => {
            shell.classList.remove('graph-pulse-highlight');
          }, 1800);
        }
      }
    }, 60);
  };

  // Filtered and Sorted Hubs Down List
  const filteredAndSortedHubs = useMemo(() => {
    let list = [...hubSalesAnalytics.hubsArray];

    if (hubSearchQuery.trim()) {
      const q = hubSearchQuery.toLowerCase().trim();
      list = list.filter(h =>
        (h.businessName && h.businessName.toLowerCase().includes(q)) ||
        (h.contactPerson && h.contactPerson.toLowerCase().includes(q)) ||
        (h.city && h.city.toLowerCase().includes(q)) ||
        (h.primaryPincode && String(h.primaryPincode).includes(q)) ||
        (h.distributorId && h.distributorId.toLowerCase().includes(q))
      );
    }

    if (hubSortBy === 'MONTH_SALES') {
      list.sort((a, b) => b.monthGrossSales - a.monthGrossSales);
    } else if (hubSortBy === 'LIFETIME_SALES') {
      list.sort((a, b) => b.lifetimeGrossSales - a.lifetimeGrossSales);
    } else if (hubSortBy === 'TODAY_SALES') {
      list.sort((a, b) => b.todayGrossSales - a.todayGrossSales);
    } else if (hubSortBy === 'ORDERS') {
      list.sort((a, b) => b.lifetimeOrdersCount - a.lifetimeOrdersCount);
    }

    return list;
  }, [hubSalesAnalytics.hubsArray, hubSearchQuery, hubSortBy]);

  // Filtered orders list for the financial transaction ledger
  const filteredLedgerOrders = useMemo(() => {
    return orders.filter(order => {
      const ts = getOrderTimestamp(order);
      if (timeRange === 'TODAY' && ts < startOfToday) return false;
      if (timeRange === 'WEEK' && ts < sevenDaysAgo) return false;
      if (timeRange === 'MONTH' && ts < thirtyDaysAgo) return false;

      const isRef = order.paymentStatus === 'REFUNDED' || order.orderStatus === 'CANCELLED';
      if (statusFilter === 'PAID' && isRef) return false;
      if (statusFilter === 'REFUNDED' && !isRef) return false;
      if (statusFilter === 'CANCELLED' && order.orderStatus !== 'CANCELLED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = String(order.orderId || '').toLowerCase().includes(q);
        const matchesName = String(order.customerName || '').toLowerCase().includes(q);
        const matchesEmail = String(order.customerEmail || '').toLowerCase().includes(q);
        const matchesPhone = String(order.customerPhone || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail && !matchesPhone) return false;
      }

      return true;
    });
  }, [orders, timeRange, statusFilter, searchQuery, startOfToday, sevenDaysAgo, thirtyDaysAgo]);

  // Refund & Replacement Queue items
  const refundReplacementQueue = useMemo(() => {
    return orders.filter(order =>
      order.orderStatus === 'CANCELLED' ||
      order.paymentStatus === 'REFUNDED' ||
      order.isReplacement
    );
  }, [orders]);

  // Export Financial CSV report
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Payment Method', 'Gross Amount (INR)', 'Payment Status', 'Order Status', 'Net Settlement'];
    const rows = filteredLedgerOrders.map(o => {
      const isRef = o.paymentStatus === 'REFUNDED' || o.orderStatus === 'CANCELLED';
      const gross = Number(o.totalAmount || 0);
      const net = isRef ? 0 : gross;
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'N/A';
      return [
        `"${o.orderId || ''}"`,
        `"${dateStr}"`,
        `"${(o.customerName || '').replace(/"/g, '""')}"`,
        `"${o.customerPhone || ''}"`,
        `"${o.paymentMethod || 'ONLINE_UPI'}"`,
        gross,
        `"${o.paymentStatus || 'PAID'}"`,
        `"${o.orderStatus || 'DELIVERED'}"`,
        net
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `atomy_india_financial_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="admin-tab-content finance-tab-content">
      {/* 1. Header Banner */}
      <div className="content-heading-row finance-header-row">
        <div>
          <div className="finance-badge">
            <IndianRupee size={14} />
            <span>Financial Operations &amp; Regional Hub Sales Engine</span>
          </div>
          <h2 className="content-title">Finance, Hub Sales &amp; Settlement Management</h2>
          <p className="content-subtitle">
            Dynamic overall sales analytics, today's aggregated revenue across regional hubs, top-performing monthly champion, hub down list, and interactive growth charts.
          </p>
        </div>

        <div className="heading-actions-cluster">
          <button type="button" className="secondary-action-btn" onClick={handleExportCSV} title="Export financial transaction ledger to CSV">
            <Download size={16} strokeWidth={2.2} />
            <span>Export Financial Audit</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Grid - Overall Sales, Today Across Hubs, Monthly Champion Hub, etc. */}
      <div className="finance-kpi-grid">
        {/* KPI 1: Today's Overall Sale Across All Hubs */}
        <div className="finance-kpi-card kpi-card-blue">
          <div className="card-top-beam beam-blue" />
          <div className="card-watermark"><TrendingUp size={78} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">TODAY'S OVERALL SALE</span>
              <span className="kpi-micro-tag tag-blue">● LIVE ACROSS ALL HUBS</span>
            </div>
            <div className="finance-kpi-icon-circle blue-circle">
              <TrendingUp size={19} />
            </div>
          </div>
          <div className="finance-kpi-value">
            <span className="finance-currency-symbol">₹</span>
            {financeStats.todayGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="finance-kpi-sub">
            <span className="sub-stat-pill pill-blue">
              {financeStats.todayOrdersCount} order{financeStats.todayOrdersCount !== 1 ? 's' : ''}
            </span>
            <span className="sub-text">across regional territories</span>
          </div>
        </div>

        {/* KPI 2: Overall Orders */}
        <div className="finance-kpi-card kpi-card-purple">
          <div className="card-top-beam beam-purple" />
          <div className="card-watermark"><ShoppingBag size={78} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">OVERALL ORDERS</span>
              <span className="kpi-micro-tag tag-purple">LIFETIME VOLUME</span>
            </div>
            <div className="finance-kpi-icon-circle purple-circle">
              <ShoppingBag size={19} />
            </div>
          </div>
          <div className="finance-kpi-value">
            {financeStats.overallOrdersCount}
            <span className="kpi-unit-label">total orders</span>
          </div>
          <div className="finance-kpi-sub">
            <span className="sub-stat-pill pill-purple">100% Dynamic</span>
            <span className="sub-text">All-time direct consumer dispatches</span>
          </div>
        </div>

        {/* KPI 3: Overall Gross Sale */}
        <div className="finance-kpi-card kpi-card-emerald">
          <div className="card-top-beam beam-emerald" />
          <div className="card-watermark"><IndianRupee size={82} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">OVERALL SALE (GROSS)</span>
              <span className="kpi-micro-tag tag-emerald">CUMULATIVE REVENUE</span>
            </div>
            <div className="finance-kpi-icon-circle emerald-circle">
              <IndianRupee size={19} />
            </div>
          </div>
          <div className="finance-kpi-value">
            <span className="finance-currency-symbol">₹</span>
            {financeStats.overallGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="finance-kpi-sub">
            <span className="sub-stat-pill pill-emerald">GST Invoiced</span>
            <span className="sub-text">Cumulative volume across all hubs</span>
          </div>
        </div>

        {/* KPI 4: Monthly Sales Champion Hub */}
        <div className="finance-kpi-card kpi-card-amber">
          <div className="card-top-beam beam-amber" />
          <div className="card-watermark"><Trophy size={80} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">TOP HUB THIS MONTH</span>
              <span className="kpi-micro-tag tag-amber">👑 SALES CHAMPION</span>
            </div>
            <div className="finance-kpi-icon-circle amber-circle">
              <Trophy size={19} />
            </div>
          </div>
          <div className="finance-kpi-value" style={{ fontSize: '20px', fontWeight: 800 }}>
            {hubSalesAnalytics.topHubOfMonth?.businessName || 'Atomy Regional Hub'}
          </div>
          <div className="finance-kpi-sub">
            <span className="sub-stat-pill pill-amber">
              ₹ {hubSalesAnalytics.topHubOfMonth?.monthGrossSales.toLocaleString('en-IN') || 0}
            </span>
            <span className="sub-text">
              ({hubSalesAnalytics.monthLeaderShare}% of total monthly revenue)
            </span>
          </div>
        </div>

        {/* KPI 5: Refunded Amount */}
        <div className="finance-kpi-card kpi-card-rose">
          <div className="card-top-beam beam-rose" />
          <div className="card-watermark"><RotateCcw size={78} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">REFUNDED AMOUNT</span>
              <span className="kpi-micro-tag tag-rose">{financeStats.refundRate}% RATE</span>
            </div>
            <div className="finance-kpi-icon-circle rose-circle">
              <RotateCcw size={19} />
            </div>
          </div>
          <div className="finance-kpi-value text-rose">
            <span className="finance-currency-symbol">₹</span>
            {financeStats.totalRefundedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="finance-kpi-sub">
            <span className="sub-stat-pill pill-rose">{financeStats.totalRefundedCount} reversed</span>
            <span className="sub-text">Refunded / cancelled (100% SLA)</span>
          </div>
        </div>

        {/* KPI 6: Net Realized Revenue */}
        <div className="finance-kpi-card kpi-card-emerald">
          <div className="card-top-beam beam-emerald" />
          <div className="card-watermark"><ShieldCheck size={82} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">NET REALIZED REVENUE</span>
              <span className="kpi-micro-tag tag-emerald">★ REALIZED</span>
            </div>
            <div className="finance-kpi-icon-circle emerald-circle">
              <ShieldCheck size={19} />
            </div>
          </div>
          <div className="finance-kpi-value text-emerald">
            <span className="finance-currency-symbol">₹</span>
            {financeStats.netRealizedRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="finance-kpi-sub">
            <span className="sub-stat-pill pill-emerald">True Realized</span>
            <span className="sub-text">Gross less refunds &amp; reversals</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tab Navigation Bar */}
      <div className="finance-subnav-strip">
        <button
          type="button"
          className={`finance-subnav-btn ${activeFinanceSubTab === 'hubs' ? 'active' : ''}`}
          onClick={() => setActiveFinanceSubTab('hubs')}
        >
          <Building2 size={16} />
          <span className="subtab-text-full">Regional Hub Sales &amp; Growth Analytics</span>
          <span className="subtab-text-short">Hub Sales Analytics</span>
        </button>

        <button
          type="button"
          className={`finance-subnav-btn ${activeFinanceSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveFinanceSubTab('overview')}
        >
          <FileText size={16} />
          <span className="subtab-text-full">Financial Ledger &amp; Sales Audit</span>
          <span className="subtab-text-short">Ledger &amp; Audit</span>
        </button>

        <button
          type="button"
          className={`finance-subnav-btn ${activeFinanceSubTab === 'queue' ? 'active' : ''}`}
          onClick={() => {
            setActiveFinanceSubTab('queue');
            const currentIds = (orders || [])
              .filter(o => o.orderStatus === 'CANCELLED' || o.paymentStatus === 'REFUNDED' || o.isReplacement)
              .map(o => String(o.orderId || o.id));
            markRefundAlertsAsViewed(currentIds);
          }}
        >
          <RotateCcw size={16} />
          <span className="subtab-text-full">Refund &amp; Replacement Queue</span>
          <span className="subtab-text-short">Refund Queue</span>
          {unreadRefundAlertCount > 0 && (
            <span className="subnav-count-badge">{unreadRefundAlertCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`finance-subnav-btn ${activeFinanceSubTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveFinanceSubTab('rules')}
        >
          <ShieldCheck size={16} />
          <span className="subtab-text-full">Refund, Replacement &amp; Cancellation Rules</span>
          <span className="subtab-text-short">Policy Rules</span>
        </button>
      </div>

      {/* ================================================================
          SUB-TAB 1: REGIONAL HUB SALES & GROWTH ANALYTICS (DEFAULT TAB)
          ================================================================ */}
      {activeFinanceSubTab === 'hubs' && (
        <div className="finance-subtab-pane">
          {/* Top-Performing Hub of the Month Highlight Banner */}
          {hubSalesAnalytics.topHubOfMonth && (
            <div className="top-performer-champion-card">
              <div className="champion-left-visual">
                <div className="trophy-badge-glow">
                  <Trophy size={36} color="#d97706" />
                </div>
              </div>
              <div className="champion-details">
                <div className="champion-tag-row">
                  <span className="champion-kicker">
                    <Crown size={13} />
                    TOP-PERFORMING REGIONAL HUB (THIS MONTH)
                  </span>
                  <span className="champion-rank-badge">#1 SALES LEADER</span>
                </div>
                <h3 className="champion-hub-name">{hubSalesAnalytics.topHubOfMonth.businessName}</h3>
                <p className="champion-meta-line">
                  <span className="meta-item">
                    <UserCheck size={14} /> Primary Hub Manager: <strong>{hubSalesAnalytics.topHubOfMonth.contactPerson}</strong>
                  </span>
                  <span className="meta-sep">•</span>
                  <span className="meta-item">
                    <MapPin size={14} /> PIN: <strong>{hubSalesAnalytics.topHubOfMonth.primaryPincode}</strong> ({hubSalesAnalytics.topHubOfMonth.city}, {hubSalesAnalytics.topHubOfMonth.state})
                  </span>
                  <span className="meta-sep">•</span>
                  <span className="meta-item">
                    Hub ID: <span className="hub-id-badge">{hubSalesAnalytics.topHubOfMonth.distributorId}</span>
                  </span>
                </p>
              </div>

              <div className="champion-kpis">
                <div className="champ-kpi-item">
                  <span className="champ-kpi-label">This Month's Sales</span>
                  <span className="champ-kpi-value text-emerald">
                    ₹ {hubSalesAnalytics.topHubOfMonth.monthGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="champ-kpi-sub">{hubSalesAnalytics.topHubOfMonth.monthOrdersCount} order dispatches</span>
                </div>

                <div className="champ-kpi-item">
                  <span className="champ-kpi-label">Network Share</span>
                  <span className="champ-kpi-value text-blue">
                    {hubSalesAnalytics.monthLeaderShare}%
                  </span>
                  <span className="champ-kpi-sub">of total monthly gross</span>
                </div>

                <div className="champ-kpi-action">
                  <button
                    type="button"
                    className="select-champ-chart-btn"
                    onClick={() => scrollToGraph(hubSalesAnalytics.topHubOfMonth.id)}
                    title="View and navigate to this hub's sales trend graph"
                  >
                    <BarChart2 size={16} />
                    <span>View Graph →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side 2-Column Split: Left = Hub-Wise Down List, Right = Selected Hub Sales Graph */}
          <div className="hub-finance-split-grid">
            {/* LEFT COLUMN: HUB WISE SALES DOWN LIST */}
            <div className="hub-downlist-col">
              <div className="hub-col-header">
                <div>
                  <h3 className="hub-col-title">Primary Regional Hubs Performance</h3>
                  <p className="hub-col-subtitle">
                    Live gross sales, today's order volume, and commission settlements per primary franchise hub (co-manager sales integrated).
                  </p>
                </div>
                <span className="hubs-count-pill">{filteredAndSortedHubs.length} Primary Hubs</span>
              </div>

              {/* Hub Down List Filter Bar */}
              <div className="hub-list-controls">
                <div className="hub-search-wrap">
                  <Search size={15} className="hub-search-icon" />
                  <input
                    type="text"
                    placeholder="Search primary hub by name, manager, PIN code, or city..."
                    value={hubSearchQuery}
                    onChange={(e) => setHubSearchQuery(e.target.value)}
                    className="hub-search-input"
                  />
                  {hubSearchQuery && (
                    <button className="clear-search-btn" onClick={() => setHubSearchQuery('')}>×</button>
                  )}
                </div>

                <CustomDropdown
                  value={hubSortBy}
                  onChange={(val) => setHubSortBy(val)}
                  options={[
                    { value: 'MONTH_SALES', label: 'Highest Month Sales' },
                    { value: 'LIFETIME_SALES', label: 'Highest Lifetime Sales' },
                    { value: 'TODAY_SALES', label: "Today's Sales" },
                    { value: 'ORDERS', label: 'Most Orders Dispatched' }
                  ]}
                  style={{ minWidth: '190px' }}
                />
              </div>

              {/* Hubs Cards Stack */}
              <div className="hubs-card-stack">
                {filteredAndSortedHubs.length === 0 ? (
                  <div className="hubs-empty-state">
                    <Building2 size={36} color="#94a3b8" />
                    <h4>No Regional Hubs Found</h4>
                    <p>Try refining your search keyword.</p>
                  </div>
                ) : (
                  filteredAndSortedHubs.map((hub) => {
                    const isSelected = selectedHub?.id === hub.id;
                    const commissionAmount = Math.round(hub.lifetimeGrossSales * ((hub.commissionRate || 8.0) / 100));

                    return (
                      <div
                        key={hub.id}
                        className={`hub-card-item ${isSelected ? 'selected-hub-card' : ''}`}
                        onClick={() => scrollToGraph(hub.id)}
                      >
                        <div className="hub-item-top">
                          <div className="hub-item-identity">
                            <div className="hub-icon-square">
                              <Building2 size={18} color="#0284c7" />
                            </div>
                            <div>
                              <div className="hub-title-line">
                                <span className="hub-card-name">{hub.businessName}</span>
                                {hub.id === hubSalesAnalytics.topHubOfMonth?.id && (
                                  <span className="hub-champ-tag">
                                    <Crown size={11} /> #1 Top Seller
                                  </span>
                                )}
                              </div>
                              <div className="hub-card-territory">
                                <MapPin size={13} />
                                <span>PIN: <strong>{hub.primaryPincode}</strong> • {hub.city}, {hub.state}</span>
                                <span className="territory-sep">•</span>
                                <span>Mgr: <strong>{hub.contactPerson}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="hub-item-right-action">
                            <button
                              type="button"
                              className={`hub-select-btn ${isSelected ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                scrollToGraph(hub.id);
                              }}
                              title="View and navigate to this hub's sales trend graph"
                            >
                              {isSelected ? 'Viewing Graph →' : 'View Graph →'}
                            </button>
                          </div>
                        </div>

                        {/* 4-Stat Mini Metric Grid */}
                        <div className="hub-stat-mini-grid">
                          <div className="hub-mini-stat">
                            <span className="stat-lbl">Today's Sales</span>
                            <span className="stat-val text-blue">
                              ₹ {hub.todayGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="stat-sub">{hub.todayOrdersCount} today</span>
                          </div>

                          <div className="hub-mini-stat">
                            <span className="stat-lbl">This Month</span>
                            <span className="stat-val text-amber">
                              ₹ {hub.monthGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="stat-sub">{hub.monthOrdersCount} this month</span>
                          </div>

                          <div className="hub-mini-stat">
                            <span className="stat-lbl">Lifetime Gross</span>
                            <span className="stat-val text-emerald">
                              ₹ {hub.lifetimeGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="stat-sub">{hub.lifetimeOrdersCount} total orders</span>
                          </div>

                          <div className="hub-mini-stat">
                            <span className="stat-lbl">Hub Commission</span>
                            <span className="stat-val text-indigo">
                              ₹ {commissionAmount.toLocaleString('en-IN')}
                            </span>
                            <span className="stat-sub">{hub.commissionRate || 8.0}% rate</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: PARTICULAR SELECTED HUB SALES GRAPH & DEEP DIVE */}
            <div className="selected-hub-graph-col" id="selected-hub-graph-section">
              <div className="selected-hub-card-shell">
                <div className="hub-graph-header">
                  <div>
                    <div className="graph-kicker-tag">
                      <BarChart2 size={13} />
                      <span>SELECTED REGIONAL HUB SALES TREND</span>
                    </div>
                    <h3 className="hub-graph-title">{selectedHub?.businessName}</h3>
                    <p className="hub-graph-subtitle">
                      Primary Manager: <strong>{selectedHub?.contactPerson}</strong> • PIN: <strong>{selectedHub?.primaryPincode}</strong> ({selectedHub?.city}, {selectedHub?.state})
                    </p>
                  </div>

                  {/* Range Switcher (7D / 30D / 1Y) */}
                  <div className="hub-graph-range-pills">
                    <button
                      type="button"
                      className={`chart-range-pill ${hubChartRange === '1W' ? 'active' : ''}`}
                      onClick={() => { setHubChartRange('1W'); setHoveredHubPoint(null); }}
                    >
                      7 Days
                    </button>
                    <button
                      type="button"
                      className={`chart-range-pill ${hubChartRange === '1M' ? 'active' : ''}`}
                      onClick={() => { setHubChartRange('1M'); setHoveredHubPoint(null); }}
                    >
                      30 Days
                    </button>
                    <button
                      type="button"
                      className={`chart-range-pill ${hubChartRange === '1Y' ? 'active' : ''}`}
                      onClick={() => { setHubChartRange('1Y'); setHoveredHubPoint(null); }}
                    >
                      1 Year
                    </button>
                  </div>
                </div>

                {/* Selected Period KPI Summary Strip */}
                <div className="hub-chart-kpi-row">
                  <div className="hub-chart-kpi-card highlight">
                    <span className="chart-kpi-lbl">
                      {hubChartRange === '1W' ? '7-Day Revenue' : hubChartRange === '1M' ? '30-Day Revenue' : '12-Month Revenue'}
                    </span>
                    <span className="chart-kpi-val text-emerald">
                      ₹ {selectedHubChartData.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="chart-kpi-sub">Confirmed gross sales</span>
                  </div>

                  <div className="hub-chart-kpi-card">
                    <span className="chart-kpi-lbl">Orders in Period</span>
                    <span className="chart-kpi-val text-blue">
                      {selectedHubChartData.totalOrders} <span style={{ fontSize: '13px', color: '#64748b' }}>orders</span>
                    </span>
                    <span className="chart-kpi-sub">
                      AOV: ₹ {Math.round(selectedHubChartData.avgOrderValue).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="hub-chart-kpi-card">
                    <span className="chart-kpi-lbl">Peak Performance</span>
                    <span className="chart-kpi-val text-slate">
                      ₹ {selectedHubChartData.peakPoint.revenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </span>
                    <span className="chart-kpi-sub">
                      {selectedHubChartData.peakPoint.label || 'No orders'}
                    </span>
                  </div>
                </div>

                {/* Interactive SVG Chart Canvas */}
                <div
                  className="hub-chart-canvas-wrap"
                  onMouseLeave={() => setHoveredHubPoint(null)}
                >
                  {/* Floating Tooltip */}
                  {hoveredHubPoint && (
                    <div className="hub-chart-tooltip-floating">
                      <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                        {hoveredHubPoint.fullDate || hoveredHubPoint.label}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '14.5px', color: '#ffffff' }}>
                        ₹ {hoveredHubPoint.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                        {hoveredHubPoint.ordersCount} direct customer order{hoveredHubPoint.ordersCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {selectedHubChartData.totalRevenue === 0 && selectedHubChartData.totalOrders === 0 ? (
                    <div className="hub-chart-zero-state">
                      <Activity size={32} color="#94a3b8" />
                      <h4>No orders placed for this territory in this timeframe</h4>
                      <p>Customer orders routing to PIN {selectedHub?.primaryPincode} will automatically plot here dynamically.</p>
                    </div>
                  ) : (
                    <svg
                      viewBox={`0 0 ${selectedHubChartData.svgW} ${selectedHubChartData.svgH}`}
                      className="hub-sales-chart-svg"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="hubSalesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00A3E0" stopOpacity="0.35" />
                          <stop offset="60%" stopColor="#00A3E0" stopOpacity="0.08" />
                          <stop offset="100%" stopColor="#00A3E0" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines & Y-Axis Currency Values */}
                      {[0, 0.33, 0.66, 1].map((pct, idx) => {
                        const y = selectedHubChartData.padTop + (1 - pct) * selectedHubChartData.chartH;
                        const val = Math.round(selectedHubChartData.maxRevenue * pct);
                        const valLabel = val >= 100000
                          ? `₹ ${(val / 100000).toFixed(1)}L`
                          : val >= 1000
                            ? `₹ ${(val / 1000).toFixed(0)}k`
                            : `₹ ${val}`;
                        return (
                          <g key={idx}>
                            <line
                              x1={selectedHubChartData.padLeft}
                              y1={y}
                              x2={selectedHubChartData.svgW - selectedHubChartData.padRight}
                              y2={y}
                              stroke="#e2e8f0"
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />
                            <text
                              x={selectedHubChartData.padLeft - 8}
                              y={y + 3.5}
                              fontSize="10"
                              fill="#94a3b8"
                              textAnchor="end"
                              fontWeight="600"
                            >
                              {valLabel}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fill */}
                      {selectedHubChartData.areaPath && (
                        <path
                          d={selectedHubChartData.areaPath}
                          fill="url(#hubSalesGradient)"
                        />
                      )}

                      {/* Smooth Line Path */}
                      {selectedHubChartData.linePath && (
                        <path
                          d={selectedHubChartData.linePath}
                          fill="none"
                          stroke="#00A3E0"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Interactive Data Points and X-Axis Ticks */}
                      {selectedHubChartData.points.map((pt, i) => {
                        const isHovered = hoveredHubPoint?.key === pt.key;
                        const baselineY = selectedHubChartData.padTop + selectedHubChartData.chartH;

                        return (
                          <g key={pt.key || i}>
                            {/* X-Axis Tick Label */}
                            {pt.tickLabel && (
                              <text
                                x={pt.x}
                                y={baselineY + 18}
                                fontSize="10"
                                fill="#64748b"
                                textAnchor="middle"
                                fontWeight="600"
                              >
                                {pt.tickLabel}
                              </text>
                            )}

                            {/* Hover hit vertical line */}
                            {isHovered && (
                              <line
                                x1={pt.x}
                                y1={selectedHubChartData.padTop}
                                x2={pt.x}
                                y2={baselineY}
                                stroke="#38bdf8"
                                strokeDasharray="3 3"
                                strokeWidth="1.5"
                              />
                            )}

                            {/* Data circle */}
                            {(pt.revenue > 0 || isHovered) && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 6 : 4}
                                fill={isHovered ? '#0284c7' : '#ffffff'}
                                stroke="#00A3E0"
                                strokeWidth={isHovered ? 3 : 2}
                                style={{ transition: 'all 0.15s ease' }}
                              />
                            )}

                            {/* Hit Target for Hover */}
                            <rect
                              x={pt.x - 12}
                              y={selectedHubChartData.padTop}
                              width="24"
                              height={selectedHubChartData.chartH + 20}
                              fill="transparent"
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={() => setHoveredHubPoint(pt)}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>

                {/* Hub Settlement & Logistics Info Footer */}
                <div className="hub-graph-footer-strip">
                  <div className="footer-info-item">
                    <span className="lbl">Hub Status</span>
                    <span className="val text-emerald">● Operational Active</span>
                  </div>
                  <div className="footer-info-item">
                    <span className="lbl">Assigned PIN Codes</span>
                    <span className="val">{selectedHub?.assignedPincodes?.join(', ') || selectedHub?.primaryPincode}</span>
                  </div>
                  <div className="footer-info-item">
                    <span className="lbl">Commission Settlement</span>
                    <span className="val text-indigo">{selectedHub?.commissionRate || 8.0}% Gross Realized</span>
                  </div>
                  <div className="footer-info-item">
                    <span className="lbl">Dispatched All-Time</span>
                    <span className="val">{selectedHub?.lifetimeOrdersCount || 0} customer orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          SUB-TAB 2: FINANCIAL LEDGER & SALES AUDIT
          ================================================================ */}
      {activeFinanceSubTab === 'overview' && (
        <div className="finance-subtab-pane">
          {/* Payment Method Distribution Strip */}
          <div className="payment-distribution-card">
            <div className="payment-dist-title">
              <CreditCard size={17} color="#00a3e0" />
              <span>Real-Time Payment Gateway &amp; Channel Settlement</span>
            </div>
            <div className="payment-methods-grid">
              <div className="pm-card">
                <span className="pm-label">UPI (GPay / PhonePe / Paytm)</span>
                <span className="pm-val">₹ {financeStats.methodTotals.ONLINE_UPI.toLocaleString('en-IN')}</span>
                <span className="pm-sla">Instant • Reversals in 24 hrs</span>
              </div>
              <div className="pm-card">
                <span className="pm-label">Credit &amp; Debit Cards</span>
                <span className="pm-val">₹ {financeStats.methodTotals.CREDIT_DEBIT_CARD.toLocaleString('en-IN')}</span>
                <span className="pm-sla">Visa / Master / RuPay • 3-5 days</span>
              </div>
              <div className="pm-card">
                <span className="pm-label">Net Banking &amp; NEFT</span>
                <span className="pm-val">₹ {financeStats.methodTotals.NET_BANKING.toLocaleString('en-IN')}</span>
                <span className="pm-sla">Direct Bank Transfer • 5-7 days</span>
              </div>
              <div className="pm-card">
                <span className="pm-label">Average Order Value (AOV)</span>
                <span className="pm-val">₹ {financeStats.averageOrderValue.toLocaleString('en-IN')}</span>
                <span className="pm-sla">Per consumer cart fulfillment</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="finance-filter-strip">
            <div className="finance-search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="finance-search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>

            <div className="finance-filter-group">
              <div className="time-filter-pills">
                {[
                  { id: 'ALL', label: 'All Time' },
                  { id: 'TODAY', label: "Today's" },
                  { id: 'WEEK', label: 'Last 7 Days' },
                  { id: 'MONTH', label: 'Last 30 Days' }
                ].map(p => (
                  <button
                    key={p.id}
                    className={`time-pill-btn ${timeRange === p.id ? 'active' : ''}`}
                    onClick={() => setTimeRange(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <CustomDropdown
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { value: 'ALL', label: 'All Payment Statuses' },
                  { value: 'PAID', label: 'Settled / Paid Only' },
                  { value: 'REFUNDED', label: 'Refunded / Reversals' },
                  { value: 'CANCELLED', label: 'Cancelled Orders' }
                ]}
                style={{ minWidth: '190px' }}
              />
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="finance-table-wrapper">
            {filteredLedgerOrders.length === 0 ? (
              <div className="finance-empty-box">
                <IndianRupee size={36} color="#94a3b8" />
                <h4>No transactions match the selected filters</h4>
                <p>Try resetting your search query or selecting "All Time" to view all records.</p>
              </div>
            ) : (
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Order &amp; Date</th>
                    <th>Customer Details</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: 'right' }}>Gross Amount</th>
                    <th>Status</th>
                    <th>Settlement / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedgerOrders.map((order) => {
                    const isCancelledOrRef = order.paymentStatus === 'REFUNDED' || order.orderStatus === 'CANCELLED';
                    const amt = Number(order.totalAmount) || 0;
                    const dateFormatted = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A';

                    return (
                      <tr key={order.orderId || Math.random()} className={isCancelledOrRef ? 'row-cancelled' : ''}>
                        <td>
                          <div className="order-id-cell">
                            <div className="order-id-row">
                              <span className="order-id-code">{order.orderId}</span>
                              <button
                                type="button"
                                className="copy-mini-btn"
                                onClick={() => copyToClipboard(order.orderId, order.orderId)}
                                title="Copy Order ID"
                              >
                                {copiedId === order.orderId ? <Check size={12} color="#16a34a" /> : <Info size={12} />}
                              </button>
                            </div>
                            <span className="order-date-sub">{dateFormatted}</span>
                          </div>
                        </td>

                        <td>
                          <div className="customer-info-cell">
                            <span className="customer-name-bold">{order.customerName || 'Anonymous Customer'}</span>
                            <span className="customer-contact-sub">{order.customerPhone || order.customerEmail || 'No contact recorded'}</span>
                          </div>
                        </td>

                        <td>
                          <span className="payment-method-chip">
                            <CreditCard size={14} />
                            <span>{order.paymentMethod ? String(order.paymentMethod).replace(/_/g, ' ') : 'ONLINE UPI'}</span>
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <span className={`order-amount-bold ${isCancelledOrRef ? 'text-strikethrough text-rose' : 'text-emerald'}`}>
                            ₹ {amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        <td>
                          {isCancelledOrRef ? (
                            <span className="status-chip-badge chip-refunded">
                              <RotateCcw size={12} />
                              <span>{order.orderStatus === 'CANCELLED' ? 'CANCELLED' : 'REFUNDED'}</span>
                            </span>
                          ) : (
                            <span className="status-chip-badge chip-settled">
                              <CheckCircle2 size={12} />
                              <span>SETTLED (PAID)</span>
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="row-action-cluster">
                            <button
                              type="button"
                              className="row-link-btn"
                              onClick={() => handleInspectAudit(order)}
                              title="View order details and financial audit"
                            >
                              <Eye size={13} />
                              <span>View Details</span>
                            </button>

                            {!isCancelledOrRef && (
                              <button
                                type="button"
                                className="row-refund-btn"
                                onClick={() => onProcessRefund && onProcessRefund(order)}
                                title="Authorize manual financial refund"
                              >
                                <RotateCcw size={13} />
                                <span>Refund</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          SUB-TAB 3: REFUND & REPLACEMENT QUEUE & HUB-WISE BREAKDOWN
          ================================================================ */}
      {activeFinanceSubTab === 'queue' && (
        <div className="finance-subtab-pane">
          {/* 1. Hub-Wise Refund & Cancellation Analysis Table (Requested by User) */}
          <div className="hub-refund-analysis-card">
            <div className="hub-refund-header">
              <div className="hub-refund-title-wrap">
                <div className="refund-icon-circle">
                  <Building2 size={20} color="#00a3e0" />
                </div>
                <div>
                  <h4>Hub-Wise Refund &amp; Cancellation Performance</h4>
                  <p>Real-time audit of how many orders each primary logistics hub cancelled, refunded, or replaced in transit</p>
                </div>
              </div>
              <span className="hubs-count-pill">{hubRefundAnalytics.length} Primary Hubs Tracked</span>
            </div>

            <div className="table-responsive-container">
              <table className="finance-table hub-refund-table">
                <thead>
                  <tr>
                    <th>Primary Regional Hub</th>
                    <th>Total Dispatches</th>
                    <th>Cancellations Handled</th>
                    <th>Customer Refunds</th>
                    <th>Transit Replacements</th>
                    <th>Cancellation Rate</th>
                    <th>Fulfillment Success</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hubRefundAnalytics.map(h => (
                    <tr key={h.id}>
                      <td>
                        <div className="hub-identity-cell">
                          <span className="hub-name-bold">{h.businessName}</span>
                          <span className="hub-sub-details">
                            PIN: <strong>{h.primaryPincode}</strong> • Mgr: <strong>{h.contactPerson}</strong> ({h.city}, {h.state})
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="count-pill pill-slate">{h.totalOrdersCount} orders</span>
                        <span className="cell-sub-amount">₹ {h.totalGrossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td>
                        <span className={`count-pill ${h.cancelledOrdersCount > 0 ? 'pill-rose' : 'pill-slate'}`}>
                          {h.cancelledOrdersCount} cancelled
                        </span>
                        <span className="cell-sub-amount text-rose">
                          ₹ {h.cancelledAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className={`count-pill ${h.refundedOrdersCount > 0 ? 'pill-amber' : 'pill-slate'}`}>
                          {h.refundedOrdersCount} refunded
                        </span>
                        <span className="cell-sub-amount text-amber">
                          ₹ {h.refundedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className={`count-pill ${h.replacementCount > 0 ? 'pill-indigo' : 'pill-slate'}`}>
                          {h.replacementCount} replacements
                        </span>
                        <span className="cell-sub-amount text-indigo">
                          ≈ ₹ {h.replacementValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className={`rate-badge ${Number(h.cancelRate) > 10 ? 'rate-high' : 'rate-low'}`}>
                          {h.cancelRate}%
                        </span>
                      </td>
                      <td>
                        <div className="success-progress-cell">
                          <span className="success-pct">{h.successRate}%</span>
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${h.successRate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="row-link-btn"
                          onClick={() => {
                            setActiveFinanceSubTab('overview');
                            setStatusFilter('REFUNDED');
                            setSearchQuery(h.primaryPincode || h.businessName);
                            const currentIds = (orders || [])
                              .filter(o => o.orderStatus === 'CANCELLED' || o.paymentStatus === 'REFUNDED' || o.isReplacement)
                              .map(o => String(o.orderId || o.id));
                            markRefundAlertsAsViewed(currentIds);
                          }}
                          title={`View refunded order details for ${h.businessName}`}
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          SUB-TAB 4: POLICY RULES & COMPLIANCE ENGINE
          ================================================================ */}
      {activeFinanceSubTab === 'rules' && (
        <div className="finance-subtab-pane">
          <div className="rules-hero-header">
            <ShieldCheck size={28} color="#00a3e0" />
            <div>
              <h3>Official Atomy India Cancellation, Refund &amp; Replacement Rules Engine</h3>
              <p>Standard Operating Procedures (SOP) governing customer rights, administrative authorizations, and financial accounting</p>
            </div>
          </div>

          <div className="rules-cards-grid">
            <div className="rule-card">
              <div className="rule-badge badge-blue">RULE 01: ORDER CANCELLATION</div>
              <h4>Instant Free Pre-Dispatch Cancellation</h4>
              <ul className="rule-list">
                <li>
                  <strong>Pre-Dispatch Window:</strong> Customers may cancel an order directly from their account at <em>zero fee</em> as long as the status is <code>PLACED</code> or <code>PROCESSING</code>.
                </li>
                <li>
                  <strong>Post-Dispatch Locked Policy (No Refund):</strong> Once an order is handed to Blue Dart or marked <code>SHIPPED</code>, the customer <strong>cannot cancel the order</strong>. If an order is cancelled or refused post-dispatch, <strong>NO REFUND is issued (0% refund)</strong> as logistics commitments are final.
                </li>
                <li>
                  <strong>Instant Automated Reversal:</strong> Pre-dispatch cancellations trigger an automatic 100% refund authorization to the payment gateway without manual intervention.
                </li>
              </ul>
            </div>

            <div className="rule-card">
              <div className="rule-badge badge-emerald">RULE 02: 30-DAY 100% REFUND</div>
              <h4>Consumer Satisfaction &amp; Money-Back Policy</h4>
              <ul className="rule-list">
                <li>
                  <strong>30-Calendar-Day Window:</strong> In line with Atomy's Absolute Quality pledge, customers can return unopened or gently tested items within 30 days of confirmed delivery if dissatisfied.
                </li>
                <li>
                  <strong>Zero Processing Surcharges:</strong> 100% of the product purchase price is refunded.
                </li>
                <li>
                  <strong>Clawback on Point Value (PV):</strong> Any Personal PV and Master Network PV accrued on the refunded items is automatically adjusted from the distributor ledger to prevent network commission fraud.
                </li>
              </ul>
            </div>

            <div className="rule-card">
              <div className="rule-badge badge-indigo">RULE 03: ZERO-COST REPLACEMENT</div>
              <h4>Transit Damage &amp; Incorrect Items Only</h4>
              <ul className="rule-list">
                <li>
                  <strong>Transit Damage &amp; Wrong Item Window:</strong> If products arrive damaged in transit before delivery (broken bottle, courier leak, crushed carton) or the wrong SKU is delivered, customers are entitled to an immediate <strong>1-to-1 brand-new replacement</strong>.
                </li>
                <li>
                  <strong>Customer Damage Strictly Void:</strong> If the customer broke, dropped, opened, used, or damaged the item after delivery, replacement is strictly ineligible and will NOT be accepted.
                </li>
                <li>
                  <strong>100% Free Reverse Logistics:</strong> Courier pickup (Blue Dart / Delhivery) is dispatched at <em>zero shipping expense</em> to the customer for verified transit defects.
                </li>
                <li>
                  <strong>Proof Requirement:</strong> Customers must attach clear unboxing photos or videos when submitting a support ticket under category <code>DAMAGED_PRODUCT</code>.
                </li>
                <li>
                  <strong>PV Integrity Preserved:</strong> Because money is not refunded, no PV is deducted on replacements.
                </li>
              </ul>
            </div>

            <div className="rule-card">
              <div className="rule-badge badge-amber">RULE 04: SETTLEMENT CHANNELS</div>
              <h4>Payout Timelines &amp; Banking Modes</h4>
              <ul className="rule-list">
                <li>
                  <strong>UPI (Google Pay / PhonePe / Paytm / BHIM):</strong> Reversal credited directly to the customer's source Virtual Payment Address (VPA) within <strong>24 hours</strong>.
                </li>
                <li>
                  <strong>Credit / Debit Cards:</strong> Reversal routed back through the merchant acquiring bank within <strong>3 to 5 business days</strong>.
                </li>
                <li>
                  <strong>Direct Bank Account (NEFT / IMPS):</strong> For Cash on Delivery or Net Banking orders, refunds are credited directly to the customer's linked bank account (Account No. + IFSC) verified in their profile within <strong>5 to 7 business days</strong>.
                </li>
              </ul>
            </div>
          </div>

          <div className="rules-action-strip">
            <button
              className="rules-action-btn primary"
              onClick={() => onNavigateToOrders && onNavigateToOrders()}
            >
              <ShoppingBag size={16} />
              <span>Go to Customer Orders (Execute Refunds)</span>
            </button>

            <button
              className="rules-action-btn secondary"
              onClick={() => onNavigateToSupport && onNavigateToSupport()}
            >
              <HelpCircle size={16} />
              <span>Open Support Desk (Review Damaged Goods Tickets)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
