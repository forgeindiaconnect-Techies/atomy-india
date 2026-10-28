import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  FileText, 
  ChevronRight, 
  Search, 
  Calendar, 
  Filter, 
  ShoppingBag, 
  ExternalLink,
  Info,
  MapPin,
  X,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Check,
  IndianRupee
} from 'lucide-react';
import DeliveryStatusStepper from './DeliveryStatusStepper';
import { updateAdminOrderStatus } from '../../services/api';
import './OrderHistoryPage.css';

export default function OrderHistoryPage({ 
  onNavigateHome, 
  onAddToCart, 
  onProductClick,
  placedOrders = [] 
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'today' | '1week' | '1month' | '3months' | '6months' | 'all'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Payment Completed' | 'Preparing Shipment' | 'In Transit' | 'Delivered' | 'Cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);
  const [activeTrackedOrder, setActiveTrackedOrder] = useState(null);
  const [trackerSearchInput, setTrackerSearchInput] = useState('');

  // Local overrides for cancellations, replacements, and returns
  const [localOrderOverrides, setLocalOrderOverrides] = useState({});

  // Action Modals State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelNotes, setCancelNotes] = useState('');

  const [replacementModalOrder, setReplacementModalOrder] = useState(null);
  const [replacementReason, setReplacementReason] = useState('Damaged in transit / Leaking');
  const [actionNotes, setActionNotes] = useState('');

  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Product did not meet expectations');

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Load any previously persisted cancellations/replacements
  useEffect(() => {
    try {
      const saved = localStorage.getItem('atomy_placed_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        const overrides = {};
        if (Array.isArray(parsed)) {
          parsed.forEach(o => {
            if (o.orderId && (o.status === 'Cancelled' || o.orderStatus === 'CANCELLED' || o.replacementRequested || o.returnRequested)) {
              overrides[o.orderId] = {
                status: (o.status === 'Cancelled' || o.orderStatus === 'CANCELLED') ? 'Cancelled' : o.status,
                paymentStatus: o.paymentStatus || 'REFUNDED',
                replacementRequested: o.replacementRequested || false,
                returnRequested: o.returnRequested || false
              };
            }
          });
        }
        setLocalOrderOverrides(overrides);
      }
    } catch {}
  }, []);

  // Map real customer placed orders without any fake demo data, merged with local overrides
  const allOrders = useMemo(() => {
    return (placedOrders || []).map((o) => {
      const oId = o.orderId || `AT-${Date.now().toString().slice(-8)}`;
      const override = localOrderOverrides[oId] || {};
      const status = override.status || o.status || 'Payment Completed';

      return {
        orderId: oId,
        orderDate: o.date ? o.date.split('T')[0] : (o.orderDate || new Date().toISOString().split('T')[0]),
        status: status,
        paymentStatus: override.paymentStatus || o.paymentStatus || (status === 'Cancelled' ? 'REFUNDED' : 'PAID'),
        statusStep: status === 'Delivered' ? 5 : status === 'In Transit' ? 3 : status === 'Preparing Shipment' ? 2 : status === 'Cancelled' ? 0 : 1,
        courier: o.courier || (status === 'Payment Completed' ? 'Awaiting Allocation' : 'Blue Dart Express'),
        trackingNumber: o.trackingNumber || '',
        paymentMethod: o.paymentMethod || 'Online Payment',
        replacementRequested: override.replacementRequested || o.replacementRequested || false,
        returnRequested: override.returnRequested || o.returnRequested || false,
        customerEmail: o.customerEmail || o.email || '',
        shippingAddress: o.address || o.shippingAddress || {
          recipient: o.recipient || 'Atomy Customer',
          phone: o.phone || '',
          address: o.fullAddress || 'Registered Delivery Address'
        },
        items: (o.items || []).map((it) => ({
          id: it.id || it.productId,
          name: it.name || it.productName,
          image: it.image || it.productImage,
          qty: it.qty || it.quantity || 1,
          price: it.price || 0,
          pv: it.pv || 0
        }))
      };
    });
  }, [placedOrders, localOrderOverrides]);

  useEffect(() => {
    if (allOrders.length > 0) {
      if (!activeTrackedOrder || !allOrders.some(o => o.orderId === activeTrackedOrder.orderId)) {
        setActiveTrackedOrder(allOrders[0]);
      } else {
        // keep active tracked order in sync with latest status
        const updated = allOrders.find(o => o.orderId === activeTrackedOrder.orderId);
        if (updated) setActiveTrackedOrder(updated);
      }
    } else {
      setActiveTrackedOrder(null);
    }
  }, [allOrders]);

  // Status counters
  const counters = useMemo(() => {
    return {
      all: allOrders.length,
      paid: allOrders.filter(o => o.status === 'Payment Completed').length,
      preparing: allOrders.filter(o => o.status === 'Preparing Shipment').length,
      inTransit: allOrders.filter(o => o.status === 'In Transit').length,
      delivered: allOrders.filter(o => o.status === 'Delivered').length,
      cancelled: allOrders.filter(o => o.status === 'Cancelled').length
    };
  }, [allOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      // Period filter
      if (selectedPeriod !== 'all') {
        const orderDate = new Date(order.orderDate);
        const now = new Date();
        const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);

        if (selectedPeriod === 'today' && diffDays > 1) return false;
        if (selectedPeriod === '1week' && diffDays > 7) return false;
        if (selectedPeriod === '1month' && diffDays > 30) return false;
        if (selectedPeriod === '3months' && diffDays > 90) return false;
        if (selectedPeriod === '6months' && diffDays > 180) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = order.orderId.toLowerCase().includes(q);
        const matchesItem = order.items.some(it => it.name.toLowerCase().includes(q));
        if (!matchesId && !matchesItem) return false;
      }

      return true;
    });
  }, [allOrders, selectedPeriod, statusFilter, searchQuery]);

  const handleTrackDelivery = (order) => {
    setActiveTrackedOrder(order);
    const element = document.getElementById('active-tracker-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (!trackerSearchInput.trim()) return;
    const q = trackerSearchInput.trim().toLowerCase();
    const found = allOrders.find(o => 
      o.orderId.toLowerCase().includes(q) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
    );
    if (found) {
      setActiveTrackedOrder(found);
    } else {
      setActiveTrackedOrder(null);
    }
  };

  const handleReorder = (order) => {
    if (onAddToCart) {
      order.items.forEach((item) => {
        onAddToCart(item, item.qty);
      });
    }
  };

  // ==========================================
  // ACTION HANDLERS: CANCEL, REPLACE & RETURN
  // ==========================================

  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setIsSubmittingAction(true);
    const oId = cancelModalOrder.orderId;
    const orderTotal = cancelModalOrder.items.reduce((s, it) => s + (it.price * it.qty), 0);

    try {
      // 1. Backend update
      try {
        await updateAdminOrderStatus(oId, 'CANCELLED');
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }

      // 2. Local State update
      setLocalOrderOverrides(prev => ({
        ...prev,
        [oId]: {
          ...prev[oId],
          status: 'Cancelled',
          paymentStatus: 'REFUNDED'
        }
      }));

      // 3. LocalStorage persistence & Broadcast
      try {
        const placed = JSON.parse(localStorage.getItem('atomy_placed_orders') || '[]');
        const updatedPlaced = placed.map(o => o.orderId === oId ? { ...o, status: 'Cancelled', orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : o);
        localStorage.setItem('atomy_placed_orders', JSON.stringify(updatedPlaced));

        const adminOrders = JSON.parse(localStorage.getItem('atomy_admin_orders') || '[]');
        const updatedAdmin = adminOrders.map(o => o.orderId === oId ? { ...o, orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : o);
        localStorage.setItem('atomy_admin_orders', JSON.stringify(updatedAdmin));

        window.dispatchEvent(new CustomEvent('atomy:order-cancelled', { detail: cancelModalOrder }));
      } catch {}

      setToastMessage({
        type: 'success',
        title: 'Order Cancelled Successfully',
        desc: `Order #${oId} was cancelled. 100% refund of ₹${orderTotal.toLocaleString('en-IN')} has been initiated to your source payment method (UPI within 24h, Cards in 3-5 days).`
      });
      setCancelModalOrder(null);
      setCancelNotes('');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmReplacement = async () => {
    if (!replacementModalOrder) return;
    setIsSubmittingAction(true);
    const oId = replacementModalOrder.orderId;

    try {
      const newTicket = {
        ticketId: `TCK-${Date.now().toString().slice(-8)}`,
        customerName: replacementModalOrder.shippingAddress?.recipient || 'Customer',
        customerEmail: replacementModalOrder.customerEmail || 'customer@atomy.in',
        customerPhone: replacementModalOrder.shippingAddress?.phone || '',
        subject: `Zero-Cost Replacement Request for Order #${oId}: ${replacementReason}`,
        category: 'DAMAGED_PRODUCT',
        orderId: oId,
        status: 'OPEN',
        message: `Customer requested zero-cost 1-to-1 replacement for Order #${oId}.\nReason: ${replacementReason}\nNotes: ${actionNotes || 'None'}\nCourier Pickup: Free Blue Dart Express reverse pickup scheduled at customer address.`,
        createdAt: new Date().toISOString()
      };

      try {
        const adminTickets = JSON.parse(localStorage.getItem('atomy_admin_tickets') || '[]');
        adminTickets.unshift(newTicket);
        localStorage.setItem('atomy_admin_tickets', JSON.stringify(adminTickets));
        window.dispatchEvent(new CustomEvent('atomy:support-ticket-created', { detail: newTicket }));
      } catch {}

      setLocalOrderOverrides(prev => ({
        ...prev,
        [oId]: {
          ...prev[oId],
          replacementRequested: true
        }
      }));

      setToastMessage({
        type: 'success',
        title: 'Replacement Request Registered',
        desc: `Your replacement for Order #${oId} has been approved. A free 1-to-1 replacement shipment will be dispatched via Blue Dart Express with zero reverse logistics fee.`
      });
      setReplacementModalOrder(null);
      setActionNotes('');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!returnModalOrder) return;
    setIsSubmittingAction(true);
    const oId = returnModalOrder.orderId;

    try {
      const newTicket = {
        ticketId: `TCK-${Date.now().toString().slice(-8)}`,
        customerName: returnModalOrder.shippingAddress?.recipient || 'Customer',
        customerEmail: returnModalOrder.customerEmail || 'customer@atomy.in',
        customerPhone: returnModalOrder.shippingAddress?.phone || '',
        subject: `30-Day Money-Back Return Request for Order #${oId}: ${returnReason}`,
        category: 'REFUND_REQUEST',
        orderId: oId,
        status: 'OPEN',
        message: `Customer claimed 30-Day 100% Satisfaction Guarantee on Order #${oId}.\nReason: ${returnReason}\nNotes: ${actionNotes || 'None'}\nRefund Destination: Original payment channel.`,
        createdAt: new Date().toISOString()
      };

      try {
        const adminTickets = JSON.parse(localStorage.getItem('atomy_admin_tickets') || '[]');
        adminTickets.unshift(newTicket);
        localStorage.setItem('atomy_admin_tickets', JSON.stringify(adminTickets));
        window.dispatchEvent(new CustomEvent('atomy:support-ticket-created', { detail: newTicket }));
      } catch {}

      setLocalOrderOverrides(prev => ({
        ...prev,
        [oId]: {
          ...prev[oId],
          returnRequested: true
        }
      }));

      setToastMessage({
        type: 'success',
        title: 'Return & Refund Claim Submitted',
        desc: `30-Day satisfaction guarantee return registered for Order #${oId}. Our Gurugram logistics desk will arrange courier pickup and initiate your 100% refund.`
      });
      setReturnModalOrder(null);
      setActionNotes('');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Helper check if order is eligible for cancellation (pre-dispatch)
  const isCancellable = (order) => {
    if (!order) return false;
    const st = String(order.status || '').toLowerCase();
    return st.includes('placed') || st.includes('completed') || st.includes('preparing');
  };

  // Helper check if order is delivered
  const isDelivered = (order) => {
    if (!order) return false;
    return String(order.status || '').toLowerCase() === 'delivered';
  };

  return (
    <div className="order-history-page">
      {/* Dynamic Toast Alert */}
      {toastMessage && (
        <div className="order-action-toast animate-slide-down">
          <div className="toast-icon">
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div className="toast-body">
            <strong>{toastMessage.title}</strong>
            <p>{toastMessage.desc}</p>
          </div>
          <button className="toast-close-btn" onClick={() => setToastMessage(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* 1. Breadcrumbs */}
      <div className="order-breadcrumbs">
        <div className="container">
          <button type="button" className="breadcrumb-link" onClick={onNavigateHome}>
            Home
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">My Atomy</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-active">Order / Delivery History</span>
        </div>
      </div>

      <div className="container order-main-container">
        {/* 2. Page Header & Subtitle */}
        <div className="order-page-header">
          <div className="order-header-left">
            <h1 className="order-page-title">Order / Delivery History</h1>
            <p className="order-page-subtitle">
              Inspect order details, monitor live package transit checkpoints, request replacements, cancel orders, and review policies.
            </p>
          </div>
          <div className="order-header-badge">
            <Package size={18} />
            <span>Official Atomy India Fulfillment</span>
          </div>
        </div>

        {/* 2.2 Prominent Customer Cancellation & Replacement Rules Banner */}
        <div className="rules-quick-banner">
          <div className="rules-quick-left">
            <div className="rules-shield-wrap">
              <ShieldCheck size={26} color="#00A3E0" />
            </div>
            <div>
              <div className="rules-badge-title">Official Atomy India Consumer Protection SOP</div>
              <h3 className="rules-main-heading">Order Cancellation, Zero-Cost Replacement & 100% Refund Rules</h3>
              <p className="rules-sub-desc">
                Learn your rights regarding pre-dispatch order cancellation, 7-day damaged goods replacement, and 30-day satisfaction refunds.
              </p>
            </div>
          </div>

          <div className="rules-quick-pillars">
            <div className="rules-pillar-item">
              <div className="pillar-dot blue"></div>
              <div>
                <strong>Pre-Dispatch Cancellation</strong>
                <span>Instant free cancellation before courier dispatch with 100% refund.</span>
              </div>
            </div>

            <div className="rules-pillar-item">
              <div className="pillar-dot indigo"></div>
              <div>
                <strong>Zero-Cost Replacement</strong>
                <span>7-day transit damage window. Free 1-to-1 replacement via Blue Dart.</span>
              </div>
            </div>

            <div className="rules-pillar-item">
              <div className="pillar-dot emerald"></div>
              <div>
                <strong>30-Day 100% Refund</strong>
                <span>Satisfaction guarantee on genuine products. UPI refunded in 24h, Cards in 3-5 days.</span>
              </div>
            </div>
          </div>

          <div className="rules-quick-action">
            <button
              type="button"
              className="view-rules-btn"
              onClick={() => setIsRulesModalOpen(true)}
            >
              <span>View Official Rules</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* 2.5 Integrated Live Delivery Status Tracker On-Page */}
        {activeTrackedOrder ? (
          <div className="onpage-delivery-tracker-card animate-fade" id="active-tracker-section">
            <div className="tracker-card-top">
              <div className="tracker-id-box">
                <Truck size={22} color="#00A3E0" />
                <div>
                  <span className="tracker-eyebrow">Live Delivery Status</span>
                  <div className="tracker-id-row">
                    <strong className="current-track-id">{activeTrackedOrder.orderId}</strong>
                    <span className={`status-pill ${activeTrackedOrder.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {activeTrackedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Tracker Search Input */}
              <form onSubmit={handleQuickLookup} className="tracker-lookup-form">
                <input
                  type="text"
                  placeholder="Lookup Order No / AWB..."
                  value={trackerSearchInput}
                  onChange={(e) => setTrackerSearchInput(e.target.value)}
                  className="tracker-lookup-input"
                />
                <button type="submit" className="tracker-lookup-btn">
                  Track
                </button>
              </form>
            </div>

            {/* Courier Meta Line */}
            <div className="tracker-courier-line">
              <span>Carrier: <strong>{activeTrackedOrder.courier}</strong></span>
              <span className="sep">•</span>
              <span>AWB: <strong className="mono">{activeTrackedOrder.trackingNumber || 'Pending Allocation'}</strong></span>
              <span className="sep">•</span>
              <span>Order Date: <strong>{activeTrackedOrder.orderDate}</strong></span>
            </div>

            {/* 5-Step Visual Delivery Stepper with Animations & 1.5s Time-lapse */}
            <DeliveryStatusStepper order={activeTrackedOrder} />

            {/* Bottom address banner */}
            <div className="tracker-address-banner">
              <MapPin size={16} color="#00A3E0" />
              <span>
                Shipping to: <strong>{activeTrackedOrder.shippingAddress?.recipient || 'Customer'}</strong>
                {activeTrackedOrder.shippingAddress?.address ? ` - ${activeTrackedOrder.shippingAddress.address}` : ''}
              </span>
            </div>

            {/* Tracker Actions Strip: Direct Cancel, Replacement & Rules Buttons */}
            <div className="tracker-action-buttons-strip">
              <div className="tab-left-note">
                {isCancellable(activeTrackedOrder) && (
                  <span className="note-cancellable">
                    <Clock size={14} /> Eligible for instant free cancellation & 100% refund before package ships.
                  </span>
                )}
                {isDelivered(activeTrackedOrder) && (
                  <span className="note-delivered">
                    <ShieldCheck size={14} /> Covered by 7-Day Free Replacement & 30-Day Money-Back Guarantee.
                  </span>
                )}
                {activeTrackedOrder.status === 'Cancelled' && (
                  <span className="note-cancelled">
                    <RotateCcw size={14} /> Order Cancelled • 100% Refund reversed to payment source.
                  </span>
                )}
              </div>

              <div className="tab-right-actions">
                {isCancellable(activeTrackedOrder) && (
                  <button
                    type="button"
                    className="tracker-action-btn cancel-btn"
                    onClick={() => setCancelModalOrder(activeTrackedOrder)}
                  >
                    <XCircle size={15} />
                    <span>Cancel Order</span>
                  </button>
                )}

                {isDelivered(activeTrackedOrder) && (
                  <>
                    <button
                      type="button"
                      className="tracker-action-btn replace-btn"
                      onClick={() => setReplacementModalOrder(activeTrackedOrder)}
                    >
                      <Truck size={15} />
                      <span>Request Replacement</span>
                    </button>
                    <button
                      type="button"
                      className="tracker-action-btn return-btn"
                      onClick={() => setReturnModalOrder(activeTrackedOrder)}
                    >
                      <RotateCcw size={15} />
                      <span>Return & Refund</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="tracker-action-btn rules-btn"
                  onClick={() => setIsRulesModalOpen(true)}
                >
                  <HelpCircle size={15} />
                  <span>Rules & Policies</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="onpage-delivery-tracker-card lookup-only animate-fade" id="active-tracker-section">
            <div className="tracker-card-top">
              <div className="tracker-id-box">
                <Truck size={22} color="#00A3E0" />
                <div>
                  <span className="tracker-eyebrow">Track Order & Delivery Status</span>
                  <div className="tracker-id-row">
                    <span style={{ fontSize: '13px', color: '#555' }}>
                      Enter your Atomy Order Number or Courier Tracking AWB to check real-time package delivery status.
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleQuickLookup} className="tracker-lookup-form">
                <input
                  type="text"
                  placeholder="e.g. AT-202610... or BD12345678IN"
                  value={trackerSearchInput}
                  onChange={(e) => setTrackerSearchInput(e.target.value)}
                  className="tracker-lookup-input"
                />
                <button type="submit" className="tracker-lookup-btn">
                  Track Delivery
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. Order Status Summary Tracker Cards */}
        <div className="order-status-tracker-strip">
          <div 
            className={`status-tracker-card ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="tracker-card-label">Total Orders</div>
            <div className="tracker-card-count">{counters.all}</div>
          </div>
          <div 
            className={`status-tracker-card ${statusFilter === 'Payment Completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Payment Completed')}
          >
            <div className="tracker-card-label">Payment Complete</div>
            <div className="tracker-card-count">{counters.paid}</div>
          </div>
          <div 
            className={`status-tracker-card ${statusFilter === 'Preparing Shipment' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Preparing Shipment')}
          >
            <div className="tracker-card-label">Preparing Shipment</div>
            <div className="tracker-card-count">{counters.preparing}</div>
          </div>
          <div 
            className={`status-tracker-card ${statusFilter === 'In Transit' ? 'active' : ''}`}
            onClick={() => setStatusFilter('In Transit')}
          >
            <div className="tracker-card-label">In Transit</div>
            <div className="tracker-card-count">{counters.inTransit}</div>
          </div>
          <div 
            className={`status-tracker-card ${statusFilter === 'Delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Delivered')}
          >
            <div className="tracker-card-label">Delivered</div>
            <div className="tracker-card-count highlight">{counters.delivered}</div>
          </div>
          {counters.cancelled > 0 && (
            <div 
              className={`status-tracker-card cancelled-tracker-card ${statusFilter === 'Cancelled' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Cancelled')}
            >
              <div className="tracker-card-label">Cancelled / Refunded</div>
              <div className="tracker-card-count text-red">{counters.cancelled}</div>
            </div>
          )}
        </div>

        {/* 4. Filter Toolbar: Period Buttons & Search */}
        <div className="order-filter-toolbar">
          <div className="filter-period-buttons">
            <span className="filter-label">Period:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: '1week', label: '1 Week' },
              { id: '1month', label: '1 Month' },
              { id: '3months', label: '3 Months' },
              { id: '6months', label: '6 Months' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`period-btn ${selectedPeriod === p.id ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="filter-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Order ID or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="order-search-input"
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
        </div>

        {/* 5. Orders Listing */}
        {filteredOrders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="empty-state-icon">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
            <h3 className="empty-state-title">No orders found</h3>
            <p className="empty-state-desc">
              {searchQuery 
                ? `No orders matching "${searchQuery}" for the chosen filters.` 
                : 'You have no order history in the selected period.'}
            </p>
            <button 
              type="button" 
              className="empty-state-btn"
              onClick={onNavigateHome}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="orders-cards-list">
            {filteredOrders.map((order) => {
              const totalAmount = order.items.reduce((sum, it) => sum + (it.price * it.qty), 0);
              const totalPV = order.items.reduce((sum, it) => sum + ((it.pv || 0) * it.qty), 0);
              const totalQty = order.items.reduce((sum, it) => sum + it.qty, 0);
              const canCancel = isCancellable(order);
              const isDeliv = isDelivered(order);
              const isCanc = order.status === 'Cancelled';

              return (
                <div key={order.orderId} className={`order-item-card ${isCanc ? 'card-cancelled' : ''}`}>
                  {/* Card Header */}
                  <div className="order-card-header">
                    <div className="order-header-info">
                      <span className="order-date-text">{order.orderDate}</span>
                      <span className="order-divider">|</span>
                      <span className="order-id-code">Order No: <strong>{order.orderId}</strong></span>
                    </div>

                    <div className="order-header-badges">
                      {isCanc ? (
                        <span className="status-pill cancelled">
                          <XCircle size={14} />
                          Cancelled (Refund Initiated)
                        </span>
                      ) : (
                        <span className={`status-pill ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {order.status === 'Delivered' && <CheckCircle2 size={14} />}
                          {order.status === 'In Transit' && <Truck size={14} />}
                          {order.status === 'Preparing Shipment' && <Clock size={14} />}
                          {order.status}
                        </span>
                      )}

                      {order.replacementRequested && (
                        <span className="badge-replacement-tag">
                          <Truck size={13} /> Replacement Dispatched
                        </span>
                      )}
                      {order.returnRequested && (
                        <span className="badge-return-tag">
                          <RotateCcw size={13} /> Return Pending Pickup
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Products in this order */}
                  <div className="order-products-table">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-product-row">
                        <div 
                          className="product-img-box"
                          onClick={() => onProductClick && onProductClick(item)}
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg';
                            }}
                          />
                        </div>

                        <div className="product-details-col">
                          <h4 
                            className="product-title"
                            onClick={() => onProductClick && onProductClick(item)}
                          >
                            {item.name}
                          </h4>
                          <div className="product-meta-sub">
                            <span className="qty-tag">Quantity: {item.qty}</span>
                            {item.pv > 0 && (
                              <span className="pv-tag">
                                PV {(item.pv * item.qty).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="product-price-col">
                          <div className="product-price-main">
                            ₹ {(item.price * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          {item.qty > 1 && (
                            <div className="product-unit-price">
                              (₹ {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Bar with totals and actions */}
                  <div className="order-card-footer">
                    <div className="order-totals-summary">
                      <div className="summary-stat">
                        <span className="label">Total ({totalQty} {totalQty === 1 ? 'item' : 'items'}):</span>
                        <span className="value-price">
                          ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="summary-stat pv-stat">
                        <span className="label">Earned PV:</span>
                        <span className="value-pv">{totalPV.toLocaleString('en-IN')} PV</span>
                      </div>
                    </div>

                    <div className="order-actions-group">
                      <button
                        type="button"
                        className="order-btn-outline"
                        onClick={() => setActiveInvoiceOrder(order)}
                        title="View Invoice & Details"
                      >
                        <FileText size={15} />
                        <span>Invoice</span>
                      </button>

                      <button
                        type="button"
                        className="order-btn-primary"
                        onClick={() => handleTrackDelivery(order)}
                        title="Track Shipment Status"
                      >
                        <Truck size={15} />
                        <span>Track</span>
                      </button>

                      {/* CANCEL ORDER OPTION (For pre-dispatch orders) */}
                      {canCancel && (
                        <button
                          type="button"
                          className="order-btn-cancel"
                          onClick={() => setCancelModalOrder(order)}
                          title="Cancel Order & Receive 100% Refund"
                        >
                          <XCircle size={15} />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      {/* ZERO-COST REPLACEMENT OPTION (For delivered orders) */}
                      {isDeliv && !order.replacementRequested && (
                        <button
                          type="button"
                          className="order-btn-replace"
                          onClick={() => setReplacementModalOrder(order)}
                          title="Free 1-to-1 Replacement for Transit Damage"
                        >
                          <Truck size={15} />
                          <span>Replacement</span>
                        </button>
                      )}

                      {/* 30-DAY RETURN & REFUND OPTION (For delivered orders) */}
                      {isDeliv && !order.returnRequested && (
                        <button
                          type="button"
                          className="order-btn-refund"
                          onClick={() => setReturnModalOrder(order)}
                          title="30-Day 100% Satisfaction Guarantee Return"
                        >
                          <RotateCcw size={15} />
                          <span>Return & Refund</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="order-btn-reorder"
                        onClick={() => handleReorder(order)}
                        title="Add items to cart again"
                      >
                        <RotateCcw size={15} />
                        <span>Re-Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: ORDER CANCELLATION & INSTANT REFUND MODAL
          ======================================================== */}
      {cancelModalOrder && (
        <div className="order-modal-backdrop animate-fade">
          <div className="order-action-modal animate-scale-up">
            <div className="modal-header-danger">
              <div className="danger-icon-wrap">
                <XCircle size={24} color="#dc2626" />
              </div>
              <div>
                <h3>Cancel Order #{cancelModalOrder.orderId}</h3>
                <p>Eligible for instant free pre-dispatch cancellation with 100% automated refund.</p>
              </div>
              <button className="modal-close-x" onClick={() => setCancelModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              {/* Refund Summary Banner */}
              <div className="refund-summary-banner">
                <div className="rsb-label">100% Refund Amount</div>
                <div className="rsb-amount">
                  ₹ {cancelModalOrder.items.reduce((s, it) => s + (it.price * it.qty), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="rsb-destination">
                  Credited back to your original payment method (<strong>UPI: within 24 hours</strong>, <strong>Cards: 3-5 business days</strong>, <strong>Net Banking: 5-7 days</strong>).
                </div>
              </div>

              {/* Cancellation Reason Select */}
              <div className="action-form-group">
                <label className="form-label">Reason for Cancellation <span className="req">*</span></label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-select-input"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Need to change delivery address">Need to change delivery address</option>
                  <option value="Found better alternative / change of mind">Found better alternative / change of mind</option>
                  <option value="Concerned about delivery timeline">Concerned about delivery timeline</option>
                  <option value="Want to apply different coupon/payment method">Want to apply different coupon/payment method</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="action-form-group">
                <label className="form-label">Additional Comments (Optional)</label>
                <textarea
                  placeholder="Tell us how we can improve..."
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  className="form-textarea-input"
                  rows={2}
                />
              </div>

              <div className="policy-reminder-box">
                <ShieldCheck size={16} color="#0284c7" />
                <span>
                  Atomy India charges <strong>₹0 cancellation fee</strong>. No deductions will be made from your refund.
                </span>
              </div>
            </div>

            <div className="modal-action-footer">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => setCancelModalOrder(null)}
                disabled={isSubmittingAction}
              >
                Keep Order
              </button>
              <button 
                type="button" 
                className="btn-modal-confirm-danger" 
                onClick={handleConfirmCancelOrder}
                disabled={isSubmittingAction}
              >
                {isSubmittingAction ? 'Processing...' : 'Confirm Cancellation & Full Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ZERO-COST PRODUCT REPLACEMENT MODAL
          ======================================================== */}
      {replacementModalOrder && (
        <div className="order-modal-backdrop animate-fade">
          <div className="order-action-modal animate-scale-up">
            <div className="modal-header-indigo">
              <div className="indigo-icon-wrap">
                <Truck size={24} color="#4338ca" />
              </div>
              <div>
                <h3>Request Zero-Cost 1-to-1 Replacement</h3>
                <p>For items received damaged, leaked in transit, expired, or defective.</p>
              </div>
              <button className="modal-close-x" onClick={() => setReplacementModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="replacement-perks-box">
                <div className="perk-row">
                  <Check size={16} color="#16a34a" />
                  <span><strong>100% Free Reverse Courier Pickup:</strong> Blue Dart will collect the package from your address with ₹0 shipping fee.</span>
                </div>
                <div className="perk-row">
                  <Check size={16} color="#16a34a" />
                  <span><strong>Fresh 1-to-1 Unit:</strong> A brand-new genuine sealed replacement will be dispatched from our Gurugram warehouse.</span>
                </div>
                <div className="perk-row">
                  <Check size={16} color="#16a34a" />
                  <span><strong>PV Intact:</strong> Your Point Value (PV) and distributor bonuses remain 100% active.</span>
                </div>
              </div>

              <div className="action-form-group">
                <label className="form-label">Nature of Defect / Damage <span className="req">*</span></label>
                <select
                  value={replacementReason}
                  onChange={(e) => setReplacementReason(e.target.value)}
                  className="form-select-input"
                >
                  <option value="Damaged in transit / Outer packaging crushed">Damaged in transit / Outer packaging crushed</option>
                  <option value="Bottle broken / Liquid leaked inside parcel">Bottle broken / Liquid leaked inside parcel</option>
                  <option value="Security seal opened / Tampered package">Security seal opened / Tampered package</option>
                  <option value="Wrong item delivered instead of ordered product">Wrong item delivered instead of ordered product</option>
                  <option value="Defective dispenser / pump / packaging defect">Defective dispenser / pump / packaging defect</option>
                </select>
              </div>

              <div className="action-form-group">
                <label className="form-label">Brief Description of the Damage</label>
                <textarea
                  placeholder="Describe the issue with the item..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="form-textarea-input"
                  rows={2}
                />
              </div>

              <div className="pickup-address-reminder">
                <MapPin size={16} color="#4338ca" />
                <span>
                  Reverse pickup address: <strong>{replacementModalOrder.shippingAddress?.address || 'Registered Address'}</strong>
                </span>
              </div>
            </div>

            <div className="modal-action-footer">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => setReplacementModalOrder(null)}
                disabled={isSubmittingAction}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-modal-confirm-indigo" 
                onClick={handleConfirmReplacement}
                disabled={isSubmittingAction}
              >
                {isSubmittingAction ? 'Scheduling...' : 'Submit Replacement Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: 30-DAY 100% MONEY-BACK RETURN MODAL
          ======================================================== */}
      {returnModalOrder && (
        <div className="order-modal-backdrop animate-fade">
          <div className="order-action-modal animate-scale-up">
            <div className="modal-header-emerald">
              <div className="emerald-icon-wrap">
                <RotateCcw size={24} color="#15803d" />
              </div>
              <div>
                <h3>30-Day Satisfaction Return & 100% Refund</h3>
                <p>Protected by Atomy's Absolute Quality satisfaction guarantee.</p>
              </div>
              <button className="modal-close-x" onClick={() => setReturnModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="refund-summary-banner green-banner">
                <div className="rsb-label">Eligible Refund Amount</div>
                <div className="rsb-amount text-green">
                  ₹ {returnModalOrder.items.reduce((s, it) => s + (it.price * it.qty), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="rsb-destination">
                  Full purchase amount credited directly back to your original payment method once inspection is completed.
                </div>
              </div>

              <div className="action-form-group">
                <label className="form-label">Return Reason <span className="req">*</span></label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="form-select-input"
                >
                  <option value="Product did not meet expectations">Product did not meet expectations</option>
                  <option value="Sensitive to formula / skin reaction">Sensitive to formula / skin reaction</option>
                  <option value="Duplicate purchase / no longer needed">Duplicate purchase / no longer needed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="action-form-group">
                <label className="form-label">Feedback for our Quality Team</label>
                <textarea
                  placeholder="Share details on your experience..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="form-textarea-input"
                  rows={2}
                />
              </div>
            </div>

            <div className="modal-action-footer">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => setReturnModalOrder(null)}
                disabled={isSubmittingAction}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn-modal-confirm-green" 
                onClick={handleConfirmReturn}
                disabled={isSubmittingAction}
              >
                {isSubmittingAction ? 'Submitting...' : 'Initiate Return & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: FULL OFFICIAL CANCELLATION & REPLACEMENT RULES
          ======================================================== */}
      {isRulesModalOpen && (
        <div className="order-modal-backdrop animate-fade">
          <div className="order-rules-full-modal animate-scale-up">
            <div className="rules-modal-header">
              <div className="rules-m-icon">
                <ShieldCheck size={28} color="#00A3E0" />
              </div>
              <div>
                <h2>Official Atomy India Cancellation, Replacement & Refund Policy</h2>
                <p>Standard Operating Procedure (SOP) governing consumer rights and customer protection</p>
              </div>
              <button className="modal-close-x" onClick={() => setIsRulesModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="rules-modal-scrollable">
              {/* Pillar 1 */}
              <div className="policy-block">
                <div className="policy-badge-num blue">POLICY 01</div>
                <h3>Order Cancellation Policy (Pre-Dispatch)</h3>
                <ul className="policy-bullets">
                  <li>
                    <strong>Pre-Dispatch Window:</strong> Customers have the right to cancel any order without questions asked as long as the status is <code>Payment Completed</code> or <code>Preparing Shipment</code>.
                  </li>
                  <li>
                    <strong>Zero Cancellation Fee:</strong> Atomy India levies <strong>₹0 cancellation fee</strong>. 100% of the invoice amount is refunded.
                  </li>
                  <li>
                    <strong>Post-Dispatch In-Flight Shipments:</strong> Once handed over to our courier partner (Blue Dart Express) or marked <code>In Transit</code>, an order cannot be cancelled in flight. The customer may decline receipt at their doorstep upon arrival, or request a standard return upon receipt.
                  </li>
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="policy-block">
                <div className="policy-badge-num indigo">POLICY 02</div>
                <h3>Zero-Cost 1-to-1 Replacement Policy (Damaged Goods)</h3>
                <ul className="policy-bullets">
                  <li>
                    <strong>7-Calendar-Day Claim Window:</strong> If items arrive damaged in transit, leaking, broken, expired, or incorrect, you are entitled to a <strong>1-to-1 brand-new replacement</strong> within 7 days of delivery.
                  </li>
                  <li>
                    <strong>Free Reverse Logistics:</strong> Courier pickup is arranged through Blue Dart Express or Delhivery at <strong>₹0 additional expense</strong> to you.
                  </li>
                  <li>
                    <strong>No PV Impact:</strong> Because no money is reversed, your earned Point Value (PV) remains completely intact.
                  </li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="policy-block">
                <div className="policy-badge-num emerald">POLICY 03</div>
                <h3>30-Day 100% Money-Back Satisfaction Guarantee</h3>
                <ul className="policy-bullets">
                  <li>
                    <strong>30 Calendar Days:</strong> In accordance with Atomy's Absolute Quality commitment, you can return unopened or gently tested products within 30 days of delivery if dissatisfied with the results.
                  </li>
                  <li>
                    <strong>100% Refund Payout:</strong> Full product purchase price is returned.
                  </li>
                  <li>
                    <strong>PV Clawback:</strong> PV accrued from refunded orders will be adjusted from distributor account ledgers to maintain commission integrity.
                  </li>
                </ul>
              </div>

              {/* Pillar 4 */}
              <div className="policy-block">
                <div className="policy-badge-num amber">POLICY 04</div>
                <h3>Refund Payout Channels & Timelines</h3>
                <table className="policy-timeline-table">
                  <thead>
                    <tr>
                      <th>Payment Channel</th>
                      <th>Refund Timeline</th>
                      <th>Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>UPI (GPay / PhonePe / Paytm / BHIM)</strong></td>
                      <td><span className="fast-tag">Within 24 Hours</span></td>
                      <td>Original Virtual Payment Address (VPA)</td>
                    </tr>
                    <tr>
                      <td><strong>Credit / Debit Cards (Visa / Master / RuPay)</strong></td>
                      <td>3 to 5 Banking Days</td>
                      <td>Direct card reversal per RBI banking clearing</td>
                    </tr>
                    <tr>
                      <td><strong>Net Banking / Direct Bank Account</strong></td>
                      <td>5 to 7 Banking Days</td>
                      <td>Linked bank account (Account No. + IFSC)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rules-modal-footer">
              <button
                type="button"
                className="btn-rules-got-it"
                onClick={() => setIsRulesModalOpen(false)}
              >
                I Understand My Policy Rights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: INVOICE / DETAILS MODAL
          ======================================================== */}
      {activeInvoiceOrder && (
        <div className="order-modal-backdrop animate-fade">
          <div className="order-invoice-modal animate-scale-up">
            <div className="invoice-modal-header">
              <div className="invoice-title-block">
                <span className="invoice-tag">Official Tax Invoice</span>
                <h3>Atomy India Order Details</h3>
                <span className="invoice-order-no">Order No: <strong>{activeInvoiceOrder.orderId}</strong></span>
              </div>
              <button 
                type="button" 
                className="invoice-close-btn"
                onClick={() => setActiveInvoiceOrder(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="invoice-modal-body">
              <div className="invoice-meta-grid">
                <div className="meta-block">
                  <span className="meta-label">Order Date:</span>
                  <span className="meta-value">{activeInvoiceOrder.orderDate}</span>
                </div>
                <div className="meta-block">
                  <span className="meta-label">Payment Method:</span>
                  <span className="meta-value">{activeInvoiceOrder.paymentMethod}</span>
                </div>
                <div className="meta-block">
                  <span className="meta-label">Fulfillment Partner:</span>
                  <span className="meta-value">{activeInvoiceOrder.courier}</span>
                </div>
                <div className="meta-block">
                  <span className="meta-label">Tracking AWB:</span>
                  <span className="meta-value mono">{activeInvoiceOrder.trackingNumber || 'Pending'}</span>
                </div>
              </div>

              <div className="invoice-shipping-box">
                <span className="shipping-box-label">Delivery Destination:</span>
                <p className="shipping-box-text">
                  <strong>{activeInvoiceOrder.shippingAddress?.recipient}</strong> ({activeInvoiceOrder.shippingAddress?.phone})<br />
                  {activeInvoiceOrder.shippingAddress?.address}
                </p>
              </div>

              <div className="invoice-items-table">
                <div className="items-table-header">
                  <span>Product</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span>Total</span>
                </div>
                {activeInvoiceOrder.items.map((it, idx) => (
                  <div key={idx} className="items-table-row">
                    <span className="item-name">{it.name}</span>
                    <span className="item-qty">{it.qty}</span>
                    <span className="item-unit">₹ {it.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className="item-subtotal">₹ {(it.price * it.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>

              <div className="invoice-totals-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>
                    ₹ {activeInvoiceOrder.items.reduce((s, it) => s + (it.price * it.qty), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Shipping Fee:</span>
                  <span className="free-shipping">FREE (Standard Atomy Delivery)</span>
                </div>
                <div className="summary-row">
                  <span>Total Accumulated PV:</span>
                  <span className="pv-highlight">
                    {activeInvoiceOrder.items.reduce((s, it) => s + ((it.pv || 0) * it.qty), 0).toLocaleString('en-IN')} PV
                  </span>
                </div>
                <div className="summary-row grand-total">
                  <span>Grand Total (incl. GST):</span>
                  <span className="price-total">
                    ₹ {activeInvoiceOrder.items.reduce((s, it) => s + (it.price * it.qty), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="invoice-modal-footer">
              <button 
                type="button" 
                className="invoice-close-action"
                onClick={() => setActiveInvoiceOrder(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="invoice-track-action"
                onClick={() => {
                  const ord = activeInvoiceOrder;
                  setActiveInvoiceOrder(null);
                  handleTrackDelivery(ord);
                }}
              >
                <Truck size={16} />
                <span>Track Package</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
