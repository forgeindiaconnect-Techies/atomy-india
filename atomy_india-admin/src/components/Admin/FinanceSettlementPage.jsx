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
  Info
} from 'lucide-react';
import './FinanceSettlementPage.css';

export default function FinanceSettlementPage({
  orders = [],
  tickets = [],
  products = [],
  onProcessRefund,
  onInspectOrder,
  onNavigateToOrders,
  onNavigateToSupport
}) {
  // Sub-tabs: 'overview' | 'queue' | 'rules'
  const [activeFinanceSubTab, setActiveFinanceSubTab] = useState('overview');

  // Filter & Search states
  const [timeRange, setTimeRange] = useState('ALL'); // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'REFUNDED' | 'CANCELLED' | 'PENDING'
  const [copiedId, setCopiedId] = useState(null);

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
      const isPaid = order.paymentStatus === 'PAID' || (!isCancelledOrRefunded && order.orderStatus !== 'PENDING');

      // Gross Sales include all non-cancelled orders
      if (!isCancelledOrRefunded) {
        overallGrossSales += amt;
        if (isToday) {
          todayGrossSales += amt;
          todayOrdersCount += 1;
        }

        // Method tally
        const m = order.paymentMethod || 'ONLINE_UPI';
        if (methodTotals[m] !== undefined) {
          methodTotals[m] += amt;
        } else {
          methodTotals.ONLINE_UPI += amt;
        }
      } else {
        // Refunded / Cancelled tallies
        totalRefundedAmount += amt;
        totalRefundedCount += 1;
        if (isToday) {
          todayRefundedAmount += amt;
          todayRefundCount += 1;
        }
      }

      // Check if order items or ticket indicate a replacement
      if (order.isReplacement || order.notes?.toLowerCase()?.includes('replacement')) {
        totalReplacementsCount += 1;
        estimatedReplacementValue += amt;
      }
    });

    // Check support tickets for replacement requests or damaged goods
    const damagedTickets = tickets.filter(t => 
      t.category === 'DAMAGED_PRODUCT' || 
      t.subject?.toLowerCase()?.includes('replacement') || 
      t.message?.toLowerCase()?.includes('damaged')
    );
    if (damagedTickets.length > totalReplacementsCount) {
      totalReplacementsCount = damagedTickets.length;
      if (estimatedReplacementValue === 0) {
        estimatedReplacementValue = damagedTickets.length * 2850; // average Atomy basket value
      }
    }

    const netRealizedRevenue = Math.max(0, overallGrossSales - totalRefundedAmount);
    const todayNetSales = Math.max(0, todayGrossSales - todayRefundedAmount);
    const validOrdersCount = Math.max(1, overallOrdersCount - totalRefundedCount);
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

  // Filtered orders list for the financial transaction ledger
  const filteredLedgerOrders = useMemo(() => {
    return orders.filter(order => {
      // Time range filter
      const ts = getOrderTimestamp(order);
      if (timeRange === 'TODAY' && ts < startOfToday) return false;
      if (timeRange === 'WEEK' && ts < sevenDaysAgo) return false;
      if (timeRange === 'MONTH' && ts < thirtyDaysAgo) return false;

      // Status filter
      const isRef = order.paymentStatus === 'REFUNDED' || order.orderStatus === 'CANCELLED';
      if (statusFilter === 'PAID' && isRef) return false;
      if (statusFilter === 'REFUNDED' && !isRef) return false;
      if (statusFilter === 'CANCELLED' && order.orderStatus !== 'CANCELLED') return false;

      // Search Query
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

  // Refund & Replacement Queue items (Orders that are cancelled, refunded, or have pending refund/replacement tickets)
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
            <span>Financial Operations & Settlement Engine</span>
          </div>
          <h2 className="content-title">Finance, Sales & Refund Management</h2>
          <p className="content-subtitle">
            Real-time ledger audit, daily revenue settlement, refund payment reversions, zero-cost replacements, and policy standards.
          </p>
        </div>

        <div className="heading-actions-cluster">
          <button className="secondary-action-btn" onClick={handleExportCSV} title="Export financial transaction ledger to CSV">
            <Download size={15} />
            <span>Export Financial Audit</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Grid - Today's Sale, Overall Orders, Overall Sale, Refunded Amount, Net Revenue */}
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
            <span className="sub-text">received today</span>
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
            <span className="sub-stat-pill pill-purple">100% Tracked</span>
            <span className="sub-text">All-time direct consumer volume</span>
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

        {/* KPI 5: Net Realized Revenue */}
        <div className="finance-kpi-card kpi-card-amber">
          <div className="card-top-beam beam-amber" />
          <div className="card-watermark"><ShieldCheck size={82} /></div>
          <div className="finance-kpi-header">
            <div>
              <span className="finance-kpi-title">NET REALIZED REVENUE</span>
              <span className="kpi-micro-tag tag-amber">★ REALIZED</span>
            </div>
            <div className="finance-kpi-icon-circle amber-circle">
              <ShieldCheck size={19} />
            </div>
          </div>
          <div className="finance-kpi-value text-emerald">
            <span className="finance-currency-symbol">₹</span>
            {financeStats.netRealizedRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="finance-kpi-sub">
            <span className="sub-stat-pill pill-amber">True Realized</span>
            <span className="sub-text">Gross less refunds & reversals</span>
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
            <span className="sub-text">≈ ₹ {financeStats.estimatedReplacementValue.toLocaleString('en-IN')} goods replaced free</span>
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
          <span>Financial Ledger & Sales Audit</span>
        </button>

        <button
          className={`finance-subnav-btn ${activeFinanceSubTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveFinanceSubTab('queue')}
        >
          <RotateCcw size={16} />
          <span>Refund & Replacement Queue</span>
          {financeStats.totalRefundedCount > 0 && (
            <span className="subnav-count-badge">{financeStats.totalRefundedCount}</span>
          )}
        </button>

        <button
          className={`finance-subnav-btn ${activeFinanceSubTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveFinanceSubTab('rules')}
        >
          <ShieldCheck size={16} />
          <span>Refund, Replacement & Cancellation Rules</span>
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
              <span>Real-Time Payment Gateway & Channel Settlement</span>
            </div>
            <div className="payment-methods-grid">
              <div className="pm-card">
                <span className="pm-label">UPI (GPay / PhonePe / Paytm)</span>
                <span className="pm-val">₹ {financeStats.methodTotals.ONLINE_UPI.toLocaleString('en-IN')}</span>
                <span className="pm-sla">Instant • Reversals in 24 hrs</span>
              </div>
              <div className="pm-card">
                <span className="pm-label">Credit & Debit Cards</span>
                <span className="pm-val">₹ {financeStats.methodTotals.CREDIT_DEBIT_CARD.toLocaleString('en-IN')}</span>
                <span className="pm-sla">Visa / Master / RuPay • 3-5 days</span>
              </div>
              <div className="pm-card">
                <span className="pm-label">Net Banking & NEFT</span>
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
                <p>Try resetting your search query or selecting "All Time" to view all records.</p>
              </div>
            ) : (
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Order & Date</th>
                    <th>Customer Details</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: 'right' }}>Gross Amount</th>
                    <th>Status</th>
                    <th>Settlement / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedgerOrders.map(order => {
                    const isRefunded = order.paymentStatus === 'REFUNDED' || order.orderStatus === 'CANCELLED';
                    const amt = Number(order.totalAmount || 0);
                    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

                    return (
                      <tr key={order.orderId || Math.random()} className={isRefunded ? 'row-refunded' : ''}>
                        <td>
                          <div className="order-id-cell">
                            <span className="order-id-code" onClick={() => copyToClipboard(order.orderId, order.orderId)}>
                              {order.orderId}
                              {copiedId === order.orderId && <span className="copied-tag">Copied!</span>}
                            </span>
                            <span className="order-date-text">
                              <Calendar size={12} /> {formattedDate}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="customer-cell">
                            <strong>{order.customerName || 'Anonymous Customer'}</strong>
                            <span className="customer-sub">{order.customerPhone || order.customerEmail || 'No contact specified'}</span>
                          </div>
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
                            <span className="order-stage-sub">Stage: {order.orderStatus || 'DELIVERED'}</span>
                          </div>
                        </td>

                        <td>
                          <div className="action-buttons-cell">
                            <button
                              className="inspect-btn"
                              onClick={() => onInspectOrder && onInspectOrder(order)}
                              title="Inspect Order Details"
                            >
                              <Eye size={14} />
                              <span>Inspect</span>
                            </button>

                            {!isRefunded && onProcessRefund && (
                              <button
                                className="quick-refund-btn"
                                onClick={() => onProcessRefund(order.orderId)}
                                title="Process Refund & Reversal"
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
                Operational Refund & Replacement Dispatch Queue
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Review customer return requests, zero-cost damaged goods replacements, and manage direct bank account payouts.
              </p>
            </div>
          </div>

          <div className="finance-table-wrapper" style={{ marginTop: '16px' }}>
            {refundReplacementQueue.length === 0 ? (
              <div className="finance-empty-box">
                <CheckCircle2 size={36} color="#16a34a" />
                <h4>No pending refunds or replacements</h4>
                <p>All consumer orders and return tickets have been processed cleanly without pending settlement issues.</p>
              </div>
            ) : (
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Order & Date</th>
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

                    return (
                      <tr key={order.orderId || Math.random()}>
                        <td>
                          <strong>{order.orderId}</strong>
                          <div className="order-date-text">{formattedDate}</div>
                        </td>
                        <td>
                          <strong>{order.customerName}</strong>
                          <div className="customer-sub">{order.customerPhone}</div>
                        </td>
                        <td>
                          <span className="reason-pill">
                            {order.isReplacement ? 'Damaged in Transit (Free Replacement)' : 'Customer Cancellation / 30-Day Guarantee'}
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
                            onClick={() => onInspectOrder && onInspectOrder(order)}
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
                <h3>Official Atomy India Cancellation, Refund & Replacement Rules Engine</h3>
                <p>Standard Operating Procedures (SOP) governing customer rights, administrative authorizations, and financial accounting</p>
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
                <h4>Consumer Satisfaction & Money-Back Policy</h4>
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
                <h4>Transit Damage & Incorrect Items Only</h4>
                <ul className="rule-list">
                  <li>
                    <strong>Transit Damage & Wrong Item Window:</strong> If products arrive damaged in transit before delivery (broken bottle, courier leak, crushed carton) or the wrong SKU is delivered, customers are entitled to an immediate <strong>1-to-1 brand-new replacement</strong>.
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
                <h4>Payout Timelines & Banking Modes</h4>
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

            {/* Quick Action Buttons to jump to Orders / Support */}
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
        </div>
      )}
    </div>
  );
}
