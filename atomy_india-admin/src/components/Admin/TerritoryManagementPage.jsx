import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Search, 
  CheckCircle2, 
  Eye, 
  ArrowLeft, 
  X, 
  Phone, 
  Mail, 
  Users, 
  Package, 
  Truck, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { fetchDistributorList } from '../../services/distributorService';
import DeliveryStatusStepper from '../Orders/DeliveryStatusStepper';
import '../Admin/AdminDashboard.css';
import './TerritoryManagementPage.css';

// Default active distributor fallback (Selva, PIN 635002)
const DEFAULT_DISTRIBUTORS = [
  {
    id: 'DIST-635002',
    distributorId: 'DIST-635002',
    businessName: 'Selva Regional Logistics Hub',
    distributorName: 'Selva',
    contactPerson: 'Selva',
    email: 'selva@atomy.com',
    phone: '+91 98765 43210',
    primaryPincode: '635002',
    assignedPincodes: ['635002'],
    city: 'Krishnagiri',
    state: 'Tamil Nadu',
    hubAddress: 'Krishnagiri Regional Logistics Centre, Tamil Nadu - 635002',
    commissionRate: 7.5,
    territoryFee: 25000,
    status: 'ACTIVE'
  }
];

export default function TerritoryManagementPage({ showToast, orders = [], customers = [] }) {
  const [distributors, setDistributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected distributor for Overall Overview Page
  const [selectedDistributor, setSelectedDistributor] = useState(null);

  // Overview sub-tab: 'customers' | 'orders'
  const [overviewTab, setOverviewTab] = useState('customers');
  const [overviewSearchQuery, setOverviewSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [inspectedCustomer, setInspectedCustomer] = useState(null);
  const [inspectedOrder, setInspectedOrder] = useState(null);

  const loadDistributors = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDistributorList().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map(d => ({
          ...d,
          id: d.distributorId || d.id || 'DIST-635002',
          distributorId: d.distributorId || d.id || 'DIST-635002',
          businessName: d.businessName || d.distributorName || 'Regional Hub',
          distributorName: d.distributorName || d.contactPerson || d.businessName || 'Distributor',
          contactPerson: d.contactPerson || d.businessName || 'Representative',
          primaryPincode: String(d.primaryPincode || d.pincode || '635002').trim(),
          assignedPincodes: d.assignedPincodes || [String(d.primaryPincode || d.pincode || '635002').trim()],
          commissionRate: d.commissionRate || 7.5,
          status: d.status || 'ACTIVE'
        }));
        setDistributors(normalized);
      } else {
        setDistributors(DEFAULT_DISTRIBUTORS);
      }
    } catch (err) {
      console.warn('Notice: loading active distributor list fallback:', err.message);
      setDistributors(DEFAULT_DISTRIBUTORS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDistributors();
  }, []);

  // Compute metrics per distributor
  const enrichedDistributors = useMemo(() => {
    return distributors.map(d => {
      const pins = new Set((d.assignedPincodes || [d.primaryPincode]).filter(Boolean).map(p => String(p).trim()));
      if (d.primaryPincode) pins.add(String(d.primaryPincode).trim());

      const distOrders = (orders || []).filter(o => {
        const p = String(o.pincode || o.shippingAddress?.pincode || '').trim();
        return p ? pins.has(p) : false;
      });

      const totalSales = distOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const totalCommission = distOrders.reduce((sum, o) => {
        const comm = Number(o.distributorCommission);
        return sum + (comm > 0 ? comm : (Number(o.totalAmount || 0) * ((d.commissionRate || 7.5) / 100)));
      }, 0);

      // Territory customers
      const distCustEmails = new Set(distOrders.map(o => (o.customerEmail || '').toLowerCase().trim()).filter(Boolean));
      const distCustomersList = (customers || []).filter(c => {
        const email = (c.email || '').toLowerCase().trim();
        const pin = String(c.pincode || '').trim();
        return distCustEmails.has(email) || (pin && pins.has(pin));
      });

      // Include customers from territory orders not in customers list
      distOrders.forEach(o => {
        const email = (o.customerEmail || '').toLowerCase().trim();
        if (email && !distCustomersList.some(c => (c.email || '').toLowerCase().trim() === email)) {
          distCustomersList.push({
            name: o.customerName || 'Customer',
            email: o.customerEmail,
            phone: o.customerPhone || 'N/A',
            city: o.city || d.city,
            state: o.state || d.state,
            pincode: o.pincode || d.primaryPincode,
            address: o.shippingAddress || 'Territory Address'
          });
        }
      });

      return {
        ...d,
        distOrders,
        totalOrders: distOrders.length,
        totalSales,
        totalCommission,
        distCustomers: distCustomersList,
        totalCustomers: distCustomersList.length,
        coveredPinsCount: pins.size
      };
    });
  }, [distributors, orders, customers]);

  // Overall Top KPIs across all distributors
  const totalDistributorsCount = enrichedDistributors.length;
  const totalCoveredPins = useMemo(() => {
    const set = new Set();
    enrichedDistributors.forEach(d => {
      (d.assignedPincodes || [d.primaryPincode]).forEach(p => {
        if (p) set.add(String(p).trim());
      });
    });
    return Math.max(set.size, 1);
  }, [enrichedDistributors]);

  // Search filter
  const filteredDistributors = useMemo(() => {
    if (!searchQuery.trim()) return enrichedDistributors;
    const q = searchQuery.toLowerCase().trim();
    return enrichedDistributors.filter(d => 
      (d.businessName || '').toLowerCase().includes(q) ||
      (d.distributorName || '').toLowerCase().includes(q) ||
      (d.contactPerson || '').toLowerCase().includes(q) ||
      (d.primaryPincode || '').toLowerCase().includes(q) ||
      (d.email || '').toLowerCase().includes(q) ||
      (d.phone || '').toLowerCase().includes(q) ||
      (d.city || '').toLowerCase().includes(q) ||
      (d.state || '').toLowerCase().includes(q)
    );
  }, [enrichedDistributors, searchQuery]);

  // Selected distributor computed details for Overview Page
  const selectedDistDetails = useMemo(() => {
    if (!selectedDistributor) return null;
    return enrichedDistributors.find(d => 
      (d.distributorId === selectedDistributor.distributorId) || 
      (d.primaryPincode === selectedDistributor.primaryPincode)
    ) || selectedDistributor;
  }, [selectedDistributor, enrichedDistributors]);

  // Overview customers enriched with order metrics
  const overviewCustomers = useMemo(() => {
    if (!selectedDistDetails) return [];
    const custs = selectedDistDetails.distCustomers || [];
    const ords = selectedDistDetails.distOrders || [];

    return custs.map(c => {
      const email = (c.email || '').toLowerCase().trim();
      const cOrders = ords.filter(o => (o.customerEmail || '').toLowerCase().trim() === email);
      const ordersCount = cOrders.length || Number(c.totalOrders || 1);
      const spend = cOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0) || Number(c.totalSpent || 0);
      const latestOrderDate = cOrders.length > 0 
        ? new Date(Math.max(...cOrders.map(o => new Date(o.createdAt || Date.now()).getTime())))
        : (c.lastOrderDate ? new Date(c.lastOrderDate) : null);

      return {
        ...c,
        computedOrders: ordersCount,
        computedSpend: spend,
        latestDate: latestOrderDate,
        orderList: cOrders
      };
    });
  }, [selectedDistDetails]);

  // Overview customers filtered
  const filteredOverviewCustomers = useMemo(() => {
    if (!overviewSearchQuery.trim()) return overviewCustomers;
    const q = overviewSearchQuery.toLowerCase().trim();
    return overviewCustomers.filter(c => 
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.pincode || '').toLowerCase().includes(q)
    );
  }, [overviewCustomers, overviewSearchQuery]);

  // Overview orders filtered
  const filteredOverviewOrders = useMemo(() => {
    if (!selectedDistDetails) return [];
    let list = selectedDistDetails.distOrders || [];
    if (orderStatusFilter !== 'ALL') {
      list = list.filter(o => String(o.orderStatus || 'PLACED').toUpperCase() === orderStatusFilter);
    }
    if (overviewSearchQuery.trim()) {
      const q = overviewSearchQuery.toLowerCase().trim();
      list = list.filter(o => 
        String(o.orderId || o.id || '').toLowerCase().includes(q) ||
        String(o.customerName || '').toLowerCase().includes(q) ||
        String(o.customerPhone || '').toLowerCase().includes(q) ||
        String(o.city || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedDistDetails, orderStatusFilter, overviewSearchQuery]);

  // VIEW 1: Distributor Overall Overview Page
  if (selectedDistDetails) {
    const dist = selectedDistDetails;
    return (
      <div className="territory-page-wrap">
        {/* 1. Full-Width Top Bar with Back Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setSelectedDistributor(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                color: '#1e293b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <ArrowLeft size={16} />
              <span>Back to Distributors &amp; Territories</span>
            </button>
            <div style={{ height: '28px', width: '1px', background: '#cbd5e1' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {dist.businessName || dist.distributorName} — Overall Overview
                </h3>
                <span style={{ fontSize: '11px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', border: '1px solid #86efac' }}>
                  ACTIVE SUB-ADMIN
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                  PIN: {dist.primaryPincode}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                Location: <strong>{dist.hubAddress || `${dist.city}, ${dist.state}`}</strong> • Contact: <strong>{dist.contactPerson} ({dist.phone})</strong> • Email: <strong>{dist.email}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#0369a1', background: '#e0f2fe', padding: '6px 14px', borderRadius: '14px', fontWeight: 700, border: '1px solid #bae6fd' }}>
              Commission Rate: {dist.commissionRate || 7.5}%
            </span>
          </div>
        </div>

        {/* 2. Top Overview 4 KPI Cards for this Distributor */}
        <div className="territory-stats-grid" style={{ marginBottom: '24px' }}>
          {/* Card 1: Total Sales */}
          <div className="territory-stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
            <div className="territory-stat-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Total Territory Sales</span>
              <IndianRupee size={16} color="#0284c7" />
            </div>
            <div className="territory-stat-value" style={{ color: '#0284c7' }}>
              ₹ {Number(dist.totalSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
              Gross merchandise volume in PIN {dist.primaryPincode}
            </div>
          </div>

          {/* Card 2: Total Commission */}
          <div className="territory-stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
            <div className="territory-stat-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Total Commission Earned</span>
              <TrendingUp size={16} color="#16a34a" />
            </div>
            <div className="territory-stat-value" style={{ color: '#16a34a' }}>
              ₹ {Number(dist.totalCommission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
              {dist.commissionRate || 7.5}% auto-credited hub earnings
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div className="territory-stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="territory-stat-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Total Territory Orders</span>
              <Package size={16} color="#f59e0b" />
            </div>
            <div className="territory-stat-value" style={{ color: '#d97706' }}>
              {dist.totalOrders || 0} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>orders</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
              Fulfilled via regional delivery logistics
            </div>
          </div>

          {/* Card 4: Total Customers */}
          <div className="territory-stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div className="territory-stat-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Territory Customers</span>
              <Users size={16} color="#8b5cf6" />
            </div>
            <div className="territory-stat-value" style={{ color: '#7c3aed' }}>
              {dist.totalCustomers || 0} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>consumers</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
              Verified shoppers residing in PIN {dist.primaryPincode}
            </div>
          </div>
        </div>

        {/* 3. Sub-Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <button
            type="button"
            onClick={() => { setOverviewTab('customers'); setOverviewSearchQuery(''); }}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: overviewTab === 'customers' ? '#0284c7' : '#f1f5f9',
              color: overviewTab === 'customers' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={16} />
            <span>Territory Customers ({overviewCustomers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setOverviewTab('orders'); setOverviewSearchQuery(''); }}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: overviewTab === 'orders' ? '#0284c7' : '#f1f5f9',
              color: overviewTab === 'orders' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Package size={16} />
            <span>Territory Orders ({dist.distOrders?.length || 0})</span>
          </button>
        </div>

        {/* 4. Search Filter Bar for Active Tab */}
        <div className="orders-filter-row" style={{ marginBottom: '16px' }}>
          <div className="search-input-wrapper orders-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder={overviewTab === 'customers' ? 'Search customers by name, phone, email, or city...' : 'Search orders by order ID, customer name, or phone...'}
              value={overviewSearchQuery}
              onChange={(e) => setOverviewSearchQuery(e.target.value)}
              className="atomy-search-input"
            />
            {overviewSearchQuery && (
              <button 
                type="button" 
                className="clear-search-btn" 
                onClick={() => setOverviewSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="orders-summary-pill">
            <span>
              Showing <strong>{overviewTab === 'customers' ? filteredOverviewCustomers.length : filteredOverviewOrders.length}</strong> {overviewTab === 'customers' ? 'Customers' : 'Orders'}
            </span>
          </div>
        </div>

        {/* 5A. SUB-VIEW: Customers Table */}
        {overviewTab === 'customers' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Customer Name</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Contact Details</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Delivery Location</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>Territory Orders</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Total Spend</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOverviewCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <Users size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No territory customers recorded for PIN {dist.primaryPincode}.</p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>When consumers residing in this PIN place orders, their profile and history will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOverviewCustomers.map((c, idx) => (
                      <tr key={c.email || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{c.name || 'Atomy Shopper'}</div>
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                            PIN: {c.pincode || dist.primaryPincode}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>{c.phone || 'N/A'}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{c.email}</div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: '13px', color: '#334155' }}>{c.address || c.city || `${dist.city}, ${dist.state}`}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>{c.city || dist.city}, {c.state || dist.state} - {c.pincode || dist.primaryPincode}</div>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <span style={{ padding: '4px 10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px', fontWeight: 700, fontSize: '12px' }}>
                            {c.computedOrders || 1} order{(c.computedOrders || 1) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          ₹ {Number(c.computedSpend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="action-pill-btn detail"
                            onClick={() => setInspectedCustomer(c)}
                            title="Inspect Customer Profile & History"
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5B. SUB-VIEW: Orders Table */}
        {overviewTab === 'orders' && (
          <div>
            {/* Status Tabs */}
            <div className="orders-status-nav-strip" style={{ marginBottom: '14px' }}>
              {[
                { id: 'ALL', label: 'All Orders', count: dist.distOrders?.length || 0 },
                { id: 'PLACED', label: 'New Orders', count: (dist.distOrders || []).filter(o => String(o.orderStatus || 'PLACED').toUpperCase() === 'PLACED').length },
                { id: 'PROCESSING', label: 'Processing', count: (dist.distOrders || []).filter(o => String(o.orderStatus || '').toUpperCase() === 'PROCESSING').length },
                { id: 'SHIPPED', label: 'Shipped', count: (dist.distOrders || []).filter(o => String(o.orderStatus || '').toUpperCase() === 'SHIPPED').length },
                { id: 'DELIVERED', label: 'Delivered', count: (dist.distOrders || []).filter(o => String(o.orderStatus || '').toUpperCase() === 'DELIVERED').length },
                { id: 'CANCELLED', label: 'Cancelled', count: (dist.distOrders || []).filter(o => String(o.orderStatus || '').toUpperCase() === 'CANCELLED').length }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`order-status-tab ${orderStatusFilter === t.id ? 'active' : ''}`}
                  onClick={() => setOrderStatusFilter(t.id)}
                >
                  <span>{t.label}</span>
                  <span className="tab-count-badge">{t.count}</span>
                </button>
              ))}
            </div>

            <div className="atomy-table-responsive orders-table-wrapper">
              <table className="atomy-data-table orders-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '175px', minWidth: '175px' }}>Order ID &amp; Date</th>
                    <th style={{ width: '210px', minWidth: '210px' }}>Customer Details</th>
                    <th style={{ minWidth: '220px' }}>Shipping Address</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Items</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Total Amount</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Commission</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOverviewOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-empty-row">
                        <Package size={40} color="#94a3b8" />
                        <p>No territory orders found matching this filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOverviewOrders.map((o) => {
                      const totalAmt = Number(o.totalAmount || 0);
                      const comm = Number(o.distributorCommission || (totalAmt * ((dist.commissionRate || 7.5) / 100)));
                      const orderDate = new Date(o.createdAt || Date.now());
                      const status = String(o.orderStatus || 'PLACED').toUpperCase();

                      return (
                        <tr key={o.orderId || o.id}>
                          <td>
                            <div className="order-id-badge">
                              <span className="order-id-text">{o.orderId || o.id}</span>
                            </div>
                            <div className="order-date-text">
                              {orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td>
                            <div className="cell-primary-text">{o.customerName || 'Customer'}</div>
                            <div className="cell-secondary-text">{o.customerPhone || 'N/A'}</div>
                            <div className="cell-secondary-text">{o.customerEmail || ''}</div>
                          </td>
                          <td className="cell-address">
                            <div className="address-line-primary">{o.shippingAddress || 'Registered Delivery Destination'}</div>
                            <div className="address-line-sub">{o.city || dist.city}, {o.state || dist.state} <span className="pincode-pill">{o.pincode || dist.primaryPincode}</span></div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="items-count-badge">
                              {o.items?.length || 1} item{(o.items?.length || 1) !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800 }}>
                            ₹ {totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>
                            +₹ {comm.toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`status-badge ${status.toLowerCase()}`}>
                              {status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="action-pill-btn detail"
                              onClick={() => setInspectedOrder(o)}
                              title="Inspect Order Details"
                            >
                              <Eye size={13} />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Customer Inspection Modal */}
        {inspectedCustomer && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
            <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="#0284c7" />
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    Customer Profile: {inspectedCustomer.name}
                  </h3>
                </div>
                <button type="button" onClick={() => setInspectedCustomer(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Contact</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{inspectedCustomer.phone || 'N/A'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{inspectedCustomer.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Location</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>PIN: {inspectedCustomer.pincode || dist.primaryPincode}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{inspectedCustomer.city || dist.city}, {inspectedCustomer.state || dist.state}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Orders</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{inspectedCustomer.computedOrders || 1}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Lifetime Spend</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>₹ {Number(inspectedCustomer.computedSpend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setInspectedCustomer(null)}
                  style={{ padding: '8px 16px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. Order Inspection Modal */}
        {inspectedOrder && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
            <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={20} color="#0284c7" />
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    Order: {inspectedOrder.orderId || inspectedOrder.id}
                  </h3>
                  <span className={`status-badge ${(inspectedOrder.orderStatus || 'PLACED').toLowerCase()}`}>
                    {inspectedOrder.orderStatus || 'PLACED'}
                  </span>
                </div>
                <button type="button" onClick={() => setInspectedOrder(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <DeliveryStatusStepper order={inspectedOrder} />
              </div>

              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Customer</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{inspectedOrder.customerName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{inspectedOrder.customerPhone} • {inspectedOrder.customerEmail}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Delivery Address</div>
                  <div style={{ fontSize: '12.5px', color: '#334155' }}>{inspectedOrder.shippingAddress}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>{inspectedOrder.city}, {inspectedOrder.state} - {inspectedOrder.pincode}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Order Value</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>₹ {Number(inspectedOrder.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Distributor Commission (7.5%)</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                    +₹ {Number(inspectedOrder.distributorCommission || (Number(inspectedOrder.totalAmount || 0) * 0.075)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  style={{ padding: '8px 16px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
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

  // VIEW 2: Default "Distributors & Territories" List View
  return (
    <div className="territory-page-wrap">
      {/* 1. Content Header */}
      <div className="content-heading-row with-filter" style={{ marginBottom: '18px' }}>
        <div>
          <h2 className="content-title">Distributors &amp; Regional Territories</h2>
          <p className="content-subtitle">
            Active regional distribution hubs, assigned delivery pincodes, sales performance, and commission oversight.
          </p>
        </div>
      </div>

      {/* 2. Top 3 KPI Cards as requested: Total Distributors, Total Covered Area, Commission */}
      <div className="territory-stats-grid" style={{ marginBottom: '24px' }}>
        {/* KPI 1: Total Distributors */}
        <div className="territory-stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="territory-stat-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Total Distributors</span>
            <Building2 size={18} color="#0284c7" />
          </div>
          <div className="territory-stat-value" style={{ color: '#0f172a' }}>
            {totalDistributorsCount} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Active Regional Hub{totalDistributorsCount !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Authorized regional franchise logistics partners
          </div>
        </div>

        {/* KPI 2: Total Covered Area */}
        <div className="territory-stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div className="territory-stat-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Total Covered Area</span>
            <MapPin size={18} color="#16a34a" />
          </div>
          <div className="territory-stat-value" style={{ color: '#16a34a' }}>
            {totalCoveredPins} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Covered Territory PIN{totalCoveredPins !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Dedicated regional courier and hub coverage
          </div>
        </div>

        {/* KPI 3: Commission Model */}
        <div className="territory-stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="territory-stat-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Partner Commission</span>
            <IndianRupee size={18} color="#f59e0b" />
          </div>
          <div className="territory-stat-value" style={{ color: '#d97706' }}>
            7.5% - 8.0% <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Per Order</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Auto-credited margin per fulfilled territory delivery
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="orders-filter-row" style={{ marginBottom: '18px' }}>
        <div className="search-input-wrapper orders-search-box" style={{ maxWidth: '640px' }}>
          <Search size={16} />
          <input
            type="text"
            className="atomy-search-input"
            placeholder="Search distributors by name, phone, email, PIN code, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <span>Showing <strong>{filteredDistributors.length}</strong> of <strong>{totalDistributorsCount}</strong> Active Distributors</span>
        </div>
      </div>

      {/* 4. Current Distributors List Table (Merged seamlessly with page, Commission column moved inside Overview) */}
      <div style={{ width: '100%', overflowX: 'auto', marginTop: '8px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading active distributors...
          </div>
        ) : filteredDistributors.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Building2 size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No distributors found matching "{searchQuery}".</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', background: 'transparent' }}>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', minWidth: '220px' }}>Distributor Hub &amp; ID</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', minWidth: '180px' }}>Assigned Territory</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', minWidth: '220px' }}>Contact Person</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'center', minWidth: '110px' }}>Total Orders</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right', minWidth: '130px' }}>Total Sales</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'center', minWidth: '110px' }}>Status</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right', minWidth: '140px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistributors.map((d) => (
                <tr 
                  key={d.distributorId}
                  onClick={() => setSelectedDistributor(d)}
                  style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  title="Click to view overall overview page (sales, commission, orders, customers)"
                >
                  {/* Hub & ID */}
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14.5px' }}>
                          {d.businessName || d.distributorName}
                        </div>
                        <span style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace' }}>
                          ID: {d.distributorId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Territory */}
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: '#0284c7', fontSize: '13px' }}>
                      <MapPin size={14} />
                      <span>PIN: {d.primaryPincode}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {d.city}, {d.state}
                    </div>
                  </td>

                  {/* Contact Person */}
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>
                      {d.contactPerson}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {d.phone} • {d.email}
                    </div>
                  </td>

                  {/* Orders */}
                  <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 12px', background: '#e2e8f0', color: '#0f172a', borderRadius: '12px', fontWeight: 700, fontSize: '13px' }}>
                      {d.totalOrders || 0}
                    </span>
                  </td>

                  {/* Sales */}
                  <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                    ₹ {Number(d.totalSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                    <span className="territory-badge-assigned">
                      <CheckCircle2 size={12} /> ACTIVE
                    </span>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="action-pill-btn detail"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDistributor(d);
                      }}
                      title="Open Distributor Overall Overview (Customers, Orders, Sales, Commission)"
                    >
                      <Eye size={13} />
                      <span>View Overview →</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
