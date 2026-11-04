import React, { useState } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Download, 
  ShieldCheck, 
  Truck, 
  Search, 
  X,
  FileText,
  AlertTriangle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import '../Admin/AdminDashboard.css';

export default function DistributorFinancePage({ 
  stats, 
  orders = [], 
  distributor 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const assignedPins = distributor?.assignedPincodes || [distributor?.primaryPincode].filter(Boolean);
  const commRate = Number(distributor?.commissionRate || 8.0);

  // Filter refunded orders
  const refundedOrders = orders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    const retSt = String(o.returnStatus || '').toUpperCase();
    return st === 'REFUNDED' || retSt === 'REFUNDED' || (st === 'CANCELLED' && o.returnReason);
  });
  const refundedRev = refundedOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  // Filter out cancelled and refunded orders for revenue and commission calculations
  const activeOrders = orders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    const retSt = String(o.returnStatus || '').toUpperCase();
    return st !== 'CANCELLED' && st !== 'REFUNDED' && retSt !== 'REFUNDED';
  });
  const activeRev = activeOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalComm = (activeRev * commRate) / 100;

  const deliveredOrders = activeOrders.filter(o => String(o.orderStatus || '').toUpperCase() === 'DELIVERED');
  const deliveredRev = deliveredOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const deliveredComm = (deliveredRev * commRate) / 100;

  const inTransitOrders = activeOrders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    return st === 'SHIPPED' || st === 'OUT_FOR_DELIVERY' || st === 'PROCESSING' || st === 'PLACED';
  });
  const inTransitRev = inTransitOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const inTransitComm = (inTransitRev * commRate) / 100;

  const cancelledOrders = orders.filter(o => {
    const st = String(o.orderStatus || '').toUpperCase();
    const retSt = String(o.returnStatus || '').toUpperCase();
    return st === 'CANCELLED' && !o.returnReason && retSt !== 'REFUNDED';
  });

  const filteredOrders = orders.filter(o => {
    const st = String(o.orderStatus || 'PLACED').toUpperCase();
    const retSt = String(o.returnStatus || '').toUpperCase();
    const isRefunded = st === 'REFUNDED' || retSt === 'REFUNDED' || (st === 'CANCELLED' && Boolean(o.returnReason));

    if (statusFilter === 'DELIVERED' && (st !== 'DELIVERED' || isRefunded)) return false;
    if (statusFilter === 'IN_TRANSIT' && (isRefunded || (st !== 'SHIPPED' && st !== 'OUT_FOR_DELIVERY' && st !== 'PROCESSING' && st !== 'PLACED'))) return false;
    if (statusFilter === 'CANCELLED' && (st !== 'CANCELLED' || isRefunded)) return false;
    if (statusFilter === 'REFUNDED' && !isRefunded) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = String(o.orderId || o.id || '').toLowerCase().includes(q);
      const matchCust = String(o.customerName || '').toLowerCase().includes(q);
      const matchPin = String(o.pincode || '').toLowerCase().includes(q);
      if (!matchId && !matchCust && !matchPin) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'PIN', 'Gross Amount (INR)', 'Commission Rate (%)', 'Commission (INR)', 'Fulfillment Status', 'Settlement Status'];
    const rows = filteredOrders.map(o => {
      const st = String(o.orderStatus || '').toUpperCase();
      const retSt = String(o.returnStatus || '').toUpperCase();
      const isRef = st === 'REFUNDED' || retSt === 'REFUNDED' || (st === 'CANCELLED' && Boolean(o.returnReason));
      const isCanc = st === 'CANCELLED' && !isRef;
      const isDeliv = st === 'DELIVERED' && !isRef;
      const gross = Number(o.totalAmount || 0);
      const comm = (isCanc || isRef) ? 0 : ((gross * commRate) / 100);

      return [
        o.orderId || o.id,
        new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN'),
        `"${o.customerName || 'Customer'}"`,
        o.pincode || '',
        gross.toFixed(2),
        commRate,
        comm.toFixed(2),
        isRef ? 'REFUNDED' : (o.orderStatus || 'PLACED'),
        isRef ? 'REFUNDED / REVERSED' : isCanc ? 'VOID / CANCELLED' : isDeliv ? 'SETTLED' : 'IN_PIPELINE'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `territory_settlement_ledger_${distributor?.distributorId || 'hub'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-tab-content">
      {/* 1. Content Heading Row */}
      <div className="content-heading-row with-filter" style={{ paddingTop: '4px', marginBottom: '22px' }}>
        <div>
          <h2 className="content-title">Finance &amp; Territory Settlement Ledger</h2>
          <p className="content-subtitle">
            Gross customer sales, partner commission earnings ({commRate}%), and settlement disbursement records for {distributor?.businessName || 'Regional Hub'} (PIN: {distributor?.primaryPincode}).
          </p>
        </div>
        <div className="heading-actions-cluster">
          <button 
            type="button" 
            className="secondary-btn"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={14} />
            <span>Export Territory Ledger</span>
          </button>
        </div>
      </div>

      {/* 2. Curved Wing KPI Cards (Matching Super Admin Overview Design Exactly) */}
      <div className="kpi-curve-grid" style={{ marginBottom: '28px' }}>
        {/* Card 1: Total Commission Accrued */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#16a34a', cursor: 'pointer' }}
          title="Total Commission Accrued from Active Territory Orders"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">TOTAL COMMISSION ACCRUED</div>
            <div className="kpi-curve-val">
              ₹ {Math.round(totalComm).toLocaleString('en-IN')}
            </div>
            <div className="kpi-curve-sub">
              From <strong>₹{Math.round(activeRev).toLocaleString('en-IN')}</strong> active sales across {activeOrders.length} order{activeOrders.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="kpi-curve-right-wing">
            <svg viewBox="0 0 120 140" preserveAspectRatio="none" className="kpi-curve-wing-svg">
              <path d="M 50 0 C 15 35 15 105 50 140 L 120 140 L 120 0 Z" fill="#dcfce7" />
            </svg>
            <div className="kpi-curve-icon-badge">
              <IndianRupee size={22} color="#16a34a" />
            </div>
          </div>
        </div>

        {/* Card 2: Settled / Delivered Payouts */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#0284c7', cursor: 'pointer' }}
          title="Earnings from Delivered Orders Ready for Disbursement"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">DELIVERED ORDER EARNINGS</div>
            <div className="kpi-curve-val">
              ₹ {Math.round(deliveredComm).toLocaleString('en-IN')}
            </div>
            <div className="kpi-curve-sub">
              Delivered <strong>{deliveredOrders.length} orders</strong> • Ready for bank payout
            </div>
          </div>
          <div className="kpi-curve-right-wing">
            <svg viewBox="0 0 120 140" preserveAspectRatio="none" className="kpi-curve-wing-svg">
              <path d="M 50 0 C 15 35 15 105 50 140 L 120 140 L 120 0 Z" fill="#e0f2fe" />
            </svg>
            <div className="kpi-curve-icon-badge">
              <CheckCircle2 size={22} color="#0284c7" />
            </div>
          </div>
        </div>

        {/* Card 3: In-Transit Pipeline */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#ea580c', cursor: 'pointer' }}
          onClick={() => setStatusFilter(statusFilter === 'IN_TRANSIT' ? 'ALL' : 'IN_TRANSIT')}
          title="Commission Tied to Shipments Currently in Fulfillment Pipeline"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">IN-TRANSIT PIPELINE COMMISSION</div>
            <div className="kpi-curve-val">
              ₹ {Math.round(inTransitComm).toLocaleString('en-IN')}
            </div>
            <div className="kpi-curve-sub">
              <strong>{inTransitOrders.length} shipments</strong> pending customer delivery
            </div>
          </div>
          <div className="kpi-curve-right-wing">
            <svg viewBox="0 0 120 140" preserveAspectRatio="none" className="kpi-curve-wing-svg">
              <path d="M 50 0 C 15 35 15 105 50 140 L 120 140 L 120 0 Z" fill="#ffedd5" />
            </svg>
            <div className="kpi-curve-icon-badge">
              <Clock size={22} color="#ea580c" />
            </div>
          </div>
        </div>

        {/* Card 4: Refunded / Voided Orders */}
        <div 
          className="kpi-curve-card interactive-kpi-card" 
          style={{ '--accent-color': '#dc2626', cursor: 'pointer' }}
          onClick={() => setStatusFilter(statusFilter === 'REFUNDED' ? 'ALL' : 'REFUNDED')}
          title="Orders returned and refunded - Reversed Commission"
        >
          <div className="kpi-curve-corner-accent"></div>
          <div className="kpi-curve-content">
            <div className="kpi-curve-tag">REFUNDED &amp; VOIDED</div>
            <div className="kpi-curve-val" style={{ color: '#dc2626' }}>
              ₹ {Math.round(refundedRev).toLocaleString('en-IN')}
            </div>
            <div className="kpi-curve-sub">
              <strong>{refundedOrders.length} order{refundedOrders.length !== 1 ? 's' : ''}</strong> refunded • Reversed commission
            </div>
          </div>
          <div className="kpi-curve-right-wing">
            <svg viewBox="0 0 120 140" preserveAspectRatio="none" className="kpi-curve-wing-svg">
              <path d="M 50 0 C 15 35 15 105 50 140 L 120 140 L 120 0 Z" fill="#fee2e2" />
            </svg>
            <div className="kpi-curve-icon-badge">
              <RotateCcw size={22} color="#dc2626" />
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Quick Status Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {[
          { id: 'ALL', label: 'All Transactions', count: orders.length },
          { id: 'DELIVERED', label: 'Delivered / Settled', count: deliveredOrders.length },
          { id: 'IN_TRANSIT', label: 'In Pipeline', count: inTransitOrders.length },
          { id: 'CANCELLED', label: 'Cancelled', count: cancelledOrders.length },
          { id: 'REFUNDED', label: 'Refunded & Returned', count: refundedOrders.length }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              border: statusFilter === tab.id ? 'none' : '1px solid #cbd5e1',
              background: statusFilter === tab.id 
                ? (tab.id === 'REFUNDED' ? '#dc2626' : tab.id === 'CANCELLED' ? '#64748b' : '#0284c7')
                : '#ffffff',
              color: statusFilter === tab.id ? '#ffffff' : '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              background: statusFilter === tab.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="orders-filter-row" style={{ marginBottom: '20px' }}>
        <div className="search-input-wrapper orders-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search transaction by Order ID, Customer, or PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="atomy-search-input"
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="orders-summary-pill">
          <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> Ledger Transactions</span>
        </div>
      </div>

      {/* 4. Ledger Data Table */}
      <div className="atomy-table-responsive orders-table-wrapper">
        <table className="atomy-data-table orders-data-table">
          <thead>
            <tr>
              <th style={{ width: '175px', minWidth: '175px' }}>Order ID &amp; Date</th>
              <th style={{ minWidth: '200px' }}>Customer Name</th>
              <th style={{ width: '110px', minWidth: '110px', textAlign: 'center' }}>Assigned PIN</th>
              <th style={{ width: '130px', minWidth: '130px', textAlign: 'right' }}>Gross Order Value</th>
              <th style={{ width: '110px', minWidth: '110px', textAlign: 'center' }}>Commission %</th>
              <th style={{ width: '130px', minWidth: '130px', textAlign: 'right' }}>Earnings</th>
              <th style={{ width: '140px', minWidth: '140px', textAlign: 'center' }}>Fulfillment Status</th>
              <th style={{ width: '140px', minWidth: '140px', textAlign: 'center' }}>Settlement State</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-row">
                  <FileText size={36} color="#94a3b8" />
                  <p>No financial ledger records found matching query.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const st = String(o.orderStatus || '').toUpperCase();
                const retSt = String(o.returnStatus || '').toUpperCase();
                const isRefunded = st === 'REFUNDED' || retSt === 'REFUNDED' || (st === 'CANCELLED' && Boolean(o.returnReason));
                const isCancelled = (st === 'CANCELLED') && !isRefunded;
                const isDelivered = (st === 'DELIVERED') && !isRefunded;
                const gross = Number(o.totalAmount || 0);
                const comm = (isCancelled || isRefunded) ? 0 : ((gross * commRate) / 100);

                return (
                  <tr key={o.orderId || o.id}>
                    <td>
                      <div className="order-id-badge">
                        <span className="order-id-text">{o.orderId || o.id}</span>
                      </div>
                      <div className="order-date-text">
                        {new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    <td>
                      <div className="cell-primary-text">{o.customerName || 'Customer'}</div>
                      <div className="cell-secondary-text">{o.customerEmail}</div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="pincode-pill">{o.pincode}</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: isRefunded ? '#dc2626' : '#0f172a' }}>
                        ₹ {gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#64748b' }}>{commRate}%</span>
                    </td>

                    <td style={{ textAlign: 'right' }} className="cell-price-col">
                      {isRefunded ? (
                        <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600, fontStyle: 'italic' }}>
                          ₹0.00 (Reversed)
                        </span>
                      ) : isCancelled ? (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                          ₹0.00
                        </span>
                      ) : (
                        <span className="order-total-amount" style={{ color: '#16a34a' }}>
                          +₹{comm.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {isRefunded ? (
                        <span className="payment-pill" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 700 }}>
                          REFUNDED
                        </span>
                      ) : (
                        <span className={`payment-pill ${(o.orderStatus || 'PLACED').toLowerCase()}`}>
                          {o.orderStatus || 'PLACED'}
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
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
                          <RotateCcw size={11} color="#dc2626" /> Refunded / Void
                        </span>
                      ) : isCancelled ? (
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
                          <XCircle size={11} color="#dc2626" /> Void (Cancelled)
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
