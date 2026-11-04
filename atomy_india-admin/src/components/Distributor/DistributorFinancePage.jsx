import React, { useState, useMemo } from 'react';
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
  X,
  MapPin,
  Phone,
  Mail,
  User,
  Package
} from 'lucide-react';
import '../Admin/FinanceSettlementPage.css';

export default function DistributorFinancePage({
  stats,
  orders = [],
  distributor,
  onInspectOrder,
  onNavigateToOrders,
  onNavigateToSupport
}) {
  // Sub-tabs: 'overview' | 'queue' | 'rules'
  const [activeFinanceSubTab, setActiveFinanceSubTab] = useState('overview');

  // Filter & Search states
  const [timeRange, setTimeRange] = useState('ALL'); // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'REFUNDED' | 'CANCELLED'
  const [copiedId, setCopiedId] = useState(null);
  const [inspectedOrder, setInspectedOrder] = useState(null);

  const assignedPins = distributor?.assignedPincodes || [distributor?.primaryPincode].filter(Boolean);
  const validPins = useMemo(() => {
    const s = new Set(Array.isArray(assignedPins) ? assignedPins : []);
    if (distributor?.primaryPincode) s.add(String(distributor.primaryPincode).trim());
    if (s.size === 0) s.add('635002');
    return s;
  }, [assignedPins, distributor]);

  const commRate = Number(distributor?.commissionRate || 8.0);

  // Territory isolated orders (strictly matching assigned PINs)
  const territoryOrders = useMemo(() => {
    return orders.filter(o => {
      const p = String(o.pincode || o.shippingAddress?.pincode || '').trim();
      return p ? validPins.has(p) : false;
    });
  }, [orders, validPins]);

  // Time boundaries
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfToday - (7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = startOfToday - (30 * 24 * 60 * 60 * 1000);

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

  // Master Financial Computations for Territory
  const financeStats = useMemo(() => {
    let todayGrossSales = 0;
    let todayOrdersCount = 0;
    let todayRefundedAmount = 0;
    let todayRefundCount = 0;

    let overallGrossSales = 0;
    let overallOrdersCount = territoryOrders.length;
    let totalRefundedAmount = 0;
    let totalRefundedCount = 0;

    let totalReplacementsCount = 0;
    let estimatedReplacementValue = 0;

    const methodTotals = {
      ONLINE_UPI: 0,
      CREDIT_DEBIT_CARD: 0,
      NET_BANKING: 0,
      CASH_ON_DELIVERY: 0
    };

    territoryOrders.forEach(order => {
      const amt = Number(order.totalAmount) || 0;
      const orderTs = getOrderTimestamp(order);
      const isToday = orderTs >= startOfToday;
      const st = String(order.orderStatus || '').toUpperCase();
      const retSt = String(order.returnStatus || '').toUpperCase();
      const isCancelledOrRefunded = st === 'CANCELLED' || st === 'REFUNDED' || retSt === 'REFUNDED' || order.paymentStatus === 'REFUNDED';

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

      if (order.isReplacement || order.notes?.toLowerCase()?.includes('replacement') || order.replacementReason) {
        totalReplacementsCount += 1;
        estimatedReplacementValue += amt;
      }
    });

    const netRealizedRevenue = Math.max(0, overallGrossSales - totalRefundedAmount);
    const partnerCommissionEarned = (netRealizedRevenue * commRate) / 100;
    const todayNetSales = Math.max(0, todayGrossSales - todayRefundedAmount);
    const averageOrderValue = Math.round(overallGrossSales / (overallOrdersCount > 0 ? overallOrdersCount : 1));
    const refundRate = overallGrossSales > 0 ? ((totalRefundedAmount / overallGrossSales) * 100).toFixed(1) : '0.0';

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
      partnerCommissionEarned,
      averageOrderValue,
      refundRate,
      methodTotals
    };
  }, [territoryOrders, startOfToday, commRate]);

  // Filtered orders list for financial transaction ledger
  const filteredLedgerOrders = useMemo(() => {
    return territoryOrders.filter(order => {
      const ts = getOrderTimestamp(order);
      if (timeRange === 'TODAY' && ts < startOfToday) return false;
      if (timeRange === 'WEEK' && ts < sevenDaysAgo) return false;
      if (timeRange === 'MONTH' && ts < thirtyDaysAgo) return false;

      const st = String(order.orderStatus || '').toUpperCase();
      const retSt = String(order.returnStatus || '').toUpperCase();
      const isRef = st === 'REFUNDED' || retSt === 'REFUNDED' || st === 'CANCELLED' || order.paymentStatus === 'REFUNDED';

      if (statusFilter === 'PAID' && isRef) return false;
      if (statusFilter === 'REFUNDED' && !isRef) return false;
      if (statusFilter === 'CANCELLED' && st !== 'CANCELLED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = String(order.orderId || order.id || '').toLowerCase().includes(q);
        const matchesName = String(order.customerName || '').toLowerCase().includes(q);
        const matchesEmail = String(order.customerEmail || '').toLowerCase().includes(q);
        const matchesPhone = String(order.customerPhone || '').toLowerCase().includes(q);
        const matchesPin = String(order.pincode || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail && !matchesPhone && !matchesPin) return false;
      }

      return true;
    });
  }, [territoryOrders, timeRange, statusFilter, searchQuery, startOfToday, sevenDaysAgo, thirtyDaysAgo]);

  // Refund & Replacement Queue items
  const refundReplacementQueue = useMemo(() => {
    return territoryOrders.filter(order => {
      const st = String(order.orderStatus || '').toUpperCase();
      const retSt = String(order.returnStatus || '').toUpperCase();
      return (
        st === 'CANCELLED' ||
        st === 'REFUNDED' ||
        retSt === 'REFUNDED' ||
        order.paymentStatus === 'REFUNDED' ||
        order.isReplacement ||
        Boolean(order.replacementReason)
      );
    });
  }, [territoryOrders]);

  // Export Financial CSV report
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Assigned PIN', 'Phone', 'Payment Method', 'Gross Amount (INR)', 'Commission Rate (%)', 'Earnings (INR)', 'Payment Status', 'Order Status', 'Settlement Status'];
    const rows = filteredLedgerOrders.map(o => {
      const st = String(o.orderStatus || '').toUpperCase();
      const retSt = String(o.returnStatus || '').toUpperCase();
      const isRef = st === 'REFUNDED' || retSt === 'REFUNDED' || st === 'CANCELLED' || o.paymentStatus === 'REFUNDED';
      const gross = Number(o.totalAmount || 0);
      const comm = isRef ? 0 : ((gross * commRate) / 100);
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'N/A';
      return [
        `"${o.orderId || o.id || ''}"`,
        `"${dateStr}"`,
        `"${(o.customerName || 'Customer').replace(/"/g, '""')}"`,
        `"${o.pincode || ''}"`,
        `"${o.customerPhone || ''}"`,
        `"${o.paymentMethod || 'ONLINE_UPI'}"`,
        gross.toFixed(2),
        commRate,
        comm.toFixed(2),
        `"${isRef ? 'REFUNDED' : (o.paymentStatus || 'PAID')}"`,
        `"${o.orderStatus || 'PLACED'}"`,
        `"${isRef ? 'VOID / REFUNDED' : st === 'DELIVERED' ? 'SETTLED' : 'IN_PIPELINE'}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `territory_financial_audit_${distributor?.distributorId || 'hub'}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span>Regional Financial Operations & Hub Settlement Engine</span>
          </div>
          <h2 className="content-title">Finance, Sales & Settlement Management</h2>
          <p className="content-subtitle">
            Real-time territory ledger audit, daily revenue settlements, {commRate}% partner commissions, refund deductions, and regional policy standards for {distributor?.businessName || 'Regional Hub'} (PIN: {distributor?.primaryPincode}).
          </p>
        </div>

        <div className="heading-actions-cluster">
          <button className="secondary-action-btn" onClick={handleExportCSV} title="Export financial transaction ledger to CSV">
            <Download size={15} />
            <span>Export Territory Audit</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Grid - Today's Sale, Overall Orders, Overall Sale, Refunded Amount, Partner Commission, Replacements */}
      <div className="finance-kpi-grid">
        {/* KPI 1: Today's Sale */}
        <div className="finance-kpi-card kpi-card-blue">
          <div className="card-top-beam beam-blue" />
          <div className="card-watermark"><TrendingUp size={78} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">TODAY'S SALE</span>
              <span className="kpi-micro-tag tag-blue">● LIVE TODAY</span>
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
            <span className="sub-text">received today in territory</span>
          </div>
        </div>

        {/* KPI 2: Overall Orders */}
        <div className="finance-kpi-card kpi-card-purple">
          <div className="card-top-beam beam-purple" />
          <div className="card-watermark"><ShoppingBag size={78} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">TERRITORY ORDERS</span>
              <span className="kpi-micro-tag tag-purple">PIN {distributor?.primaryPincode}</span>
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
            <span className="sub-stat-pill pill-purple">100% Tracked</span>
            <span className="sub-text">Assigned hub consumer orders</span>
          </div>
        </div>

        {/* KPI 3: Overall Gross Sale */}
        <div className="finance-kpi-card kpi-card-emerald">
          <div className="card-top-beam beam-emerald" />
          <div className="card-watermark"><IndianRupee size={82} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">OVERALL SALE (GROSS)</span>
              <span className="kpi-micro-tag tag-emerald">CUMULATIVE</span>
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
            <span className="sub-text">Cumulative volume processed</span>
          </div>
        </div>

        {/* KPI 4: Refunded Amount */}
        <div className="finance-kpi-card kpi-card-rose">
          <div className="card-top-beam beam-rose" />
          <div className="card-watermark"><RotateCcw size={78} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">REFUNDED &amp; VOIDED</span>
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
            <span className="sub-text">Refunded / cancelled (Zero fee)</span>
          </div>
        </div>

        {/* KPI 5: Partner Commission Earnings */}
        <div className="finance-kpi-card kpi-card-amber">
          <div className="card-top-beam beam-amber" />
          <div className="card-watermark"><ShieldCheck size={82} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">PARTNER COMMISSION ({commRate}%)</span>
              <span className="kpi-micro-tag tag-amber">★ REALIZED</span>
            </div>
            <div className="finance-kpi-icon-circle amber-circle">
              <ShieldCheck size={19} />
            </div>
          </div>
          <div className="finance-kpi-value text-emerald">
            <span className="finance-currency-symbol">₹</span>
            {financeStats.partnerCommissionEarned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="finance-kpi-sub">
            <span className="sub-stat-pill pill-amber">Ready Payout</span>
            <span className="sub-text">From ₹{Math.round(financeStats.netRealizedRevenue).toLocaleString('en-IN')} net sales</span>
          </div>
        </div>

        {/* KPI 6: Zero-Cost Replacements */}
        <div className="finance-kpi-card kpi-card-indigo">
          <div className="card-top-beam beam-indigo" />
          <div className="card-watermark"><Truck size={78} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">REPLACEMENTS ISSUED</span>
              <span className="kpi-micro-tag tag-indigo">₹0 TRANSIT CARE</span>
            </div>
            <div className="finance-kpi-icon-circle indigo-circle">
              <Truck size={19} />
            </div>
          </div>
          <div className="finance-kpi-value text-indigo">
            {financeStats.totalReplacementsCount}
            <span className="kpi-unit-label">replacements</span>
          </div>
          <div className="finance-kpi-sub">
            <span className="sub-stat-pill pill-indigo">Blue Dart Express</span>
            <span className="sub-text">Hub stock replacement units dispatched</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tab Navigation Bar */}
      <div className="finance-subnav-strip">
        <button
          className={`finance-subnav-btn ${activeFinanceSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveFinanceSubTab('overview')}
        >
          <FileText size={16} />
          <span>Financial Ledger &amp; Settlement Audit</span>
        </button>

        <button
          className={`finance-subnav-btn ${activeFinanceSubTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveFinanceSubTab('queue')}
        >
          <RotateCcw size={16} />
          <span>Refund &amp; Replacement Queue</span>
          {financeStats.totalRefundedCount > 0 && (
            <span className="subnav-count-badge">{financeStats.totalRefundedCount}</span>
          )}
        </button>

        <button
          className={`finance-subnav-btn ${activeFinanceSubTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveFinanceSubTab('rules')}
        >
          <ShieldCheck size={16} />
          <span>Refund, Replacement &amp; Cancellation Rules</span>
        </button>
      </div>

      {/* ================================================================
          SUB-TAB 1: FINANCIAL LEDGER & SALES AUDIT
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
                <span className="pm-sla">Per territory cart fulfillment</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="finance-filter-strip">
            <div className="finance-search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search transaction by Order ID, Customer Name, Phone, PIN..."
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

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="finance-status-select"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">Settled / Paid Only</option>
                <option value="REFUNDED">Refunded / Reversals</option>
                <option value="CANCELLED">Cancelled Orders</option>
              </select>
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="finance-table-wrapper">
            {filteredLedgerOrders.length === 0 ? (
              <div className="finance-empty-box">
                <IndianRupee size={36} color="#94a3b8" />
                <h4>No transactions match the selected filters</h4>
                <p>Try resetting your search query or selecting "All Time" to view all territory records.</p>
              </div>
            ) : (
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Order &amp; Date</th>
                    <th>Customer Details</th>
                    <th style={{ textAlign: 'center' }}>PIN</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: 'right' }}>Gross Amount</th>
                    <th style={{ textAlign: 'center' }}>Commission ({commRate}%)</th>
                    <th>Status</th>
                    <th>Settlement State</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedgerOrders.map(order => {
                    const st = String(order.orderStatus || '').toUpperCase();
                    const retSt = String(order.returnStatus || '').toUpperCase();
                    const isRefunded = st === 'REFUNDED' || retSt === 'REFUNDED' || st === 'CANCELLED' || order.paymentStatus === 'REFUNDED';
                    const isDelivered = st === 'DELIVERED' && !isRefunded;
                    const amt = Number(order.totalAmount || 0);
                    const comm = isRefunded ? 0 : ((amt * commRate) / 100);
                    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                    const orderIdStr = order.orderId || order.id || 'N/A';

                    return (
                      <tr key={orderIdStr} className={isRefunded ? 'row-refunded' : ''}>
                        <td>
                          <div className="order-id-cell">
                            <span className="order-id-code" onClick={() => copyToClipboard(orderIdStr, orderIdStr)}>
                              {orderIdStr}
                              {copiedId === orderIdStr && <span className="copied-tag">Copied!</span>}
                            </span>
                            <span className="order-date-text">
                              <Calendar size={12} /> {formattedDate}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="customer-cell">
                            <strong>{order.customerName || 'Customer'}</strong>
                            <span className="customer-sub">{order.customerPhone || order.customerEmail || 'No contact specified'}</span>
                          </div>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11.5px',
                            fontWeight: 700
                          }}>
                            {order.pincode}
                          </span>
                        </td>

                        <td>
                          <span className="payment-badge">
                            {order.paymentMethod === 'ONLINE_UPI' && 'UPI / QR'}
                            {order.paymentMethod === 'CREDIT_DEBIT_CARD' && 'Card'}
                            {order.paymentMethod === 'NET_BANKING' && 'Net Banking'}
                            {(!order.paymentMethod || order.paymentMethod === 'CASH_ON_DELIVERY') && 'Direct Gateway'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div className="amount-cell">
                            <span className={`amt-val ${isRefunded ? 'amt-refunded' : 'amt-positive'}`}>
                              ₹ {amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            {isRefunded && (
                              <span className="refund-tag">Reversed / Refunded</span>
                            )}
                          </div>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          {isRefunded ? (
                            <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600, fontStyle: 'italic' }}>
                              ₹0.00 (Void)
                            </span>
                          ) : (
                            <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700 }}>
                              +₹{comm.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="status-cell">
                            {isRefunded ? (
                              <span className="status-pill status-pill-red">
                                <RotateCcw size={12} /> Refunded
                              </span>
                            ) : (
                              <span className="status-pill status-pill-green">
                                <CheckCircle2 size={12} /> Settled
                              </span>
                            )}
                            <span className="order-stage-sub">Stage: {order.orderStatus || 'PLACED'}</span>
                          </div>
                        </td>

                        <td>
                          {isRefunded ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5'
                            }}>
                              <RotateCcw size={11} color="#dc2626" /> Reversed
                            </span>
                          ) : isDelivered ? (
                            <span className="sla-badge delivered" style={{ display: 'inline-flex', padding: '3px 10px' }}>
                              <CheckCircle2 size={11} color="#15803d" /> Settled
                            </span>
                          ) : (
                            <span className="sla-badge delayed" style={{ display: 'inline-flex', padding: '3px 10px', background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                              <Clock size={11} color="#b45309" /> In Pipeline
                            </span>
                          )}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="inspect-btn"
                            onClick={() => setInspectedOrder(order)}
                            title="Inspect Order Details"
                          >
                            <Eye size={14} />
                            <span>Inspect</span>
                          </button>
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
          SUB-TAB 2: REFUND & REPLACEMENT QUEUE
          ================================================================ */}
      {activeFinanceSubTab === 'queue' && (
        <div className="finance-subtab-pane">
          <div className="queue-intro-box">
            <div className="queue-intro-icon">
              <RotateCcw size={22} color="#dc2626" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#1e293b' }}>
                Operational Refund &amp; Replacement Dispatch Queue
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Review territory customer return requests, zero-cost damaged goods replacements, and manage regional inventory restock records.
              </p>
            </div>
          </div>

          <div className="finance-table-wrapper" style={{ marginTop: '16px' }}>
            {refundReplacementQueue.length === 0 ? (
              <div className="finance-empty-box">
                <CheckCircle2 size={36} color="#16a34a" />
                <h4>No pending refunds or replacements</h4>
                <p>All territory orders in PIN {distributor?.primaryPincode} are clean without pending returns or settlement issues.</p>
              </div>
            ) : (
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Order &amp; Date</th>
                    <th>Customer Name</th>
                    <th>Reason / Type</th>
                    <th style={{ textAlign: 'right' }}>Refund Amount</th>
                    <th>Destination Channel</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {refundReplacementQueue.map(order => {
                    const amt = Number(order.totalAmount || 0);
                    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                    const orderIdStr = order.orderId || order.id || 'N/A';

                    return (
                      <tr key={orderIdStr}>
                        <td>
                          <strong>{orderIdStr}</strong>
                          <div className="order-date-text">{formattedDate}</div>
                        </td>
                        <td>
                          <strong>{order.customerName}</strong>
                          <div className="customer-sub">{order.customerPhone}</div>
                        </td>
                        <td>
                          <span className="reason-pill">
                            {order.isReplacement || order.replacementReason ? 'Damaged in Transit (Free Replacement)' : (order.returnReason || 'Customer Cancellation / 30-Day Guarantee')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="amt-val amt-refunded">
                            ₹ {amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td>
                          <div className="channel-desc">
                            {order.paymentMethod === 'ONLINE_UPI' && 'UPI Source VPA (Instant / 24h)'}
                            {order.paymentMethod === 'CREDIT_DEBIT_CARD' && 'Card Account (3-5 Days)'}
                            {order.paymentMethod === 'NET_BANKING' && 'Registered Bank IFSC (5-7 Days)'}
                            {(!order.paymentMethod || order.paymentMethod === 'CASH_ON_DELIVERY') && 'Direct Source Payout'}
                          </div>
                        </td>
                        <td>
                          <span className="status-pill status-pill-red">
                            <RotateCcw size={12} /> {order.paymentStatus || 'REFUNDED'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="inspect-btn"
                            onClick={() => setInspectedOrder(order)}
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>
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
          SUB-TAB 3: POLICY & RULES ENGINE
          ================================================================ */}
      {activeFinanceSubTab === 'rules' && (
        <div className="finance-subtab-pane">
          <div className="rules-hero-card">
            <div className="rules-hero-header">
              <ShieldCheck size={28} color="#00a3e0" />
              <div>
                <h3>Official Atomy India Cancellation, Refund &amp; Replacement Rules Engine</h3>
                <p>Standard Operating Procedures (SOP) governing customer rights, regional hub authorizations, and financial accounting</p>
              </div>
            </div>

            <div className="rules-cards-grid">
              {/* RULE 1: CANCELLATION RULES */}
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

              {/* RULE 2: 30-DAY 100% REFUND GUARANTEE */}
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

              {/* RULE 3: ZERO-COST PRODUCT REPLACEMENT */}
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

              {/* RULE 4: BANK & SETTLEMENT CHANNELS */}
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
          </div>
        </div>
      )}

      {/* 4. Inspection Modal for Order Details */}
      {inspectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '580px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                    Order #{inspectedOrder.orderId || inspectedOrder.id}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {inspectedOrder.createdAt ? new Date(inspectedOrder.createdAt).toLocaleString('en-IN') : 'Recent Order'}
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setInspectedOrder(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '12.5px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Customer Name:</span>
                <strong>{inspectedOrder.customerName || 'Customer'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Assigned PIN:</span>
                <strong>{inspectedOrder.pincode} ({inspectedOrder.city || 'Krishnagiri'})</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Order Status:</span>
                <span style={{ fontWeight: 700, color: String(inspectedOrder.orderStatus).toUpperCase() === 'REFUNDED' ? '#dc2626' : '#16a34a' }}>
                  {inspectedOrder.orderStatus || 'PLACED'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Payment Method:</span>
                <strong>{inspectedOrder.paymentMethod || 'ONLINE_UPI'}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>Items in Parcel</h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                {(inspectedOrder.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: idx < (inspectedOrder.items.length - 1) ? '1px solid #f1f5f9' : 'none', fontSize: '12.5px' }}>
                    <span>{it.productName || it.name || `Item ${idx + 1}`} × {it.quantity || 1}</span>
                    <strong style={{ color: '#0f172a' }}>₹ {Number((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Gross Total Amount:</span>
                <strong>₹ {Number(inspectedOrder.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Partner Commission ({commRate}%):</span>
                <strong style={{ color: '#16a34a' }}>+₹ {((Number(inspectedOrder.totalAmount || 0) * commRate) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setInspectedOrder(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
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
