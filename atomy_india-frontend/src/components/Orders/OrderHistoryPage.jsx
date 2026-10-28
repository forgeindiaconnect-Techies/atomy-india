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
  IndianRupee,
  AlertCircle,
  Banknote
} from 'lucide-react';
import DeliveryStatusStepper from './DeliveryStatusStepper';
import { updateAdminOrderStatus, syncUnsyncedOrdersToBackend } from '../../services/api';
import './OrderHistoryPage.css';

// Benchmark Reason Catalog (Amazon / Myntra / Flipkart standard)
export const CANCELLATION_REASONS = [
  {
    id: 'mistake',
    title: 'Order created by mistake',
    desc: 'Placed order unintentionally or created a duplicate order'
  },
  {
    id: 'address',
    title: 'Need to change delivery address or phone number',
    desc: 'Entered incorrect shipping destination or contact number'
  },
  {
    id: 'delivery_delay',
    title: 'Expected delivery date is too long',
    desc: 'Need product urgently or shipping timeframe is longer than anticipated'
  },
  {
    id: 'payment_method',
    title: 'Want to change payment method / UPI',
    desc: 'Need to switch to an alternative card, UPI, or corporate account'
  },
  {
    id: 'better_deal',
    title: 'Found better price or alternative distributor',
    desc: 'Purchasing through local Atomy education center or changed mind'
  },
  {
    id: 'coupon_missed',
    title: 'Forgot to apply promotional voucher / discount coupon',
    desc: 'Wish to cancel and place order again with discount applied'
  },
  {
    id: 'other',
    title: 'Other reason',
    desc: 'Distributor or personal circumstance (specify below)'
  }
];

export const RETURN_REPLACEMENT_REASONS = [
  {
    id: 'damaged_transit',
    title: 'Item arrived damaged or leaking in transit',
    desc: 'Crushed box, broken bottle, spilled essence, or torn security seal'
  },
  {
    id: 'wrong_item',
    title: 'Wrong item or variant delivered',
    desc: 'Delivered item SKU or shade does not match the order sheet'
  },
  {
    id: 'defective',
    title: 'Defective product / pump or dispenser not working',
    desc: 'Spray nozzle stuck, container lid broken, or pump dispenser malfunction'
  },
  {
    id: 'missing_item',
    title: 'Missing item in package (Partial delivery)',
    desc: 'Sealed parcel arrived with items missing from the tax invoice'
  },
  {
    id: 'quality_dissatisfaction',
    title: 'Quality did not meet expectations (30-Day Money-Back Guarantee)',
    desc: 'Product did not achieve desired results under Atomy satisfaction promise'
  },
  {
    id: 'allergic_reaction',
    title: 'Skin sensitivity or allergic reaction',
    desc: 'Experienced adverse skin reaction or formula sensitivity'
  },
  {
    id: 'expired',
    title: 'Expired or near-expiry date product',
    desc: 'Shelf life / manufacturing date does not meet freshness standards'
  },
  {
    id: 'other',
    title: 'Other reason',
    desc: 'Please describe the issue for our quality assurance desk'
  }
];

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
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Local overrides for cancellations, replacements, and returns
  const [localOrderOverrides, setLocalOrderOverrides] = useState({});

  // Action Modals State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReasonId, setCancelReasonId] = useState('mistake');
  const [cancelNotes, setCancelNotes] = useState('');

  const [replacementModalOrder, setReplacementModalOrder] = useState(null);
  const [resolutionMode, setResolutionMode] = useState('replacement'); // 'replacement' | 'refund'
  const [returnReasonId, setReturnReasonId] = useState('damaged_transit');
  const [actionNotes, setActionNotes] = useState('');
  const [conditionConfirmed, setConditionConfirmed] = useState(true);

  const [returnModalOrder, setReturnModalOrder] = useState(null);

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [activeRulesTab, setActiveRulesTab] = useState('cancellation'); // 'cancellation' | 'replacement' | 'refund_guarantee' | 'timelines'
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

    // Auto-sync any locally cached offline orders to backend MongoDB Atlas
    syncUnsyncedOrdersToBackend();
  }, []);

  // Map real customer placed orders without any fake demo data, merged with local overrides
  const allOrders = useMemo(() => {
    return (placedOrders || []).map((o) => {
      const oId = o.orderId || `AT-${Date.now().toString().slice(-8)}`;
      const override = localOrderOverrides[oId] || {};
      const isCod = (o.paymentMethod || '').toLowerCase().includes('cash') || (o.paymentMethod || '').toLowerCase().includes('cod');
      const defaultStatus = isCod ? 'Cash on Delivery' : 'Payment Completed';
      let status = override.status || o.status || defaultStatus;
      if (isCod && status === 'Payment Completed' && (!o.paymentStatus || o.paymentStatus === 'PENDING')) {
        status = 'Cash on Delivery';
      }
      const paymentStatus = override.paymentStatus || o.paymentStatus || (status === 'Cancelled' ? 'REFUNDED' : isCod ? 'PENDING' : 'PAID');

      return {
        orderId: oId,
        orderDate: o.date ? o.date.split('T')[0] : (o.orderDate || new Date().toISOString().split('T')[0]),
        status: status,
        paymentStatus: paymentStatus,
        statusStep: status === 'Delivered' ? 5 : status === 'In Transit' ? 3 : status === 'Preparing Shipment' ? 2 : status === 'Cancelled' ? 0 : 1,
        courier: o.courier || (status === 'Payment Completed' || status === 'Cash on Delivery' ? 'Awaiting Allocation' : 'Blue Dart Express'),
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



  // Status counters
  const counters = useMemo(() => {
    return {
      all: allOrders.length,
      paid: allOrders.filter(o => o.status === 'Payment Completed' || o.status === 'Cash on Delivery' || o.status === 'PLACED').length,
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
      if (statusFilter !== 'all') {
        if (statusFilter === 'Payment Completed') {
          if (order.status !== 'Payment Completed' && order.status !== 'Cash on Delivery' && order.status !== 'PLACED') return false;
        } else if (order.status !== statusFilter) {
          return false;
        }
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

  const handleToggleTracking = (order) => {
    if (!order) return;
    setExpandedOrderId((prev) => (prev === order.orderId ? null : order.orderId));
  };

  const handleReorder = (order) => {
    if (onAddToCart) {
      order.items.forEach((item) => {
        onAddToCart(item, item.qty);
      });
    }
  };

  // Helper: safely get order items
  const getOrderItems = (order) => (order && Array.isArray(order.items) ? order.items : []);

  // Helper: safely calculate order total with fallbacks
  const getOrderTotal = (order) => {
    if (!order) return 0;
    if (typeof order.grandTotal === 'number' && order.grandTotal > 0) return order.grandTotal;
    if (typeof order.totalAmount === 'number' && order.totalAmount > 0) return order.totalAmount;
    if (typeof order.total === 'number' && order.total > 0) return order.total;
    const items = getOrderItems(order);
    if (items.length > 0) {
      return items.reduce((s, it) => s + ((Number(it.price) || 0) * (Number(it.qty || it.quantity) || 1)), 0);
    }
    return 0;
  };

  // ==========================================
  // ACTION HANDLERS: CANCEL, REPLACE & RETURN
  // ==========================================

  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setIsSubmittingAction(true);
    const oId = cancelModalOrder.orderId;
    const orderTotal = getOrderTotal(cancelModalOrder);
    const selectedObj = CANCELLATION_REASONS.find(r => r.id === cancelReasonId) || CANCELLATION_REASONS[0];
    const fullReason = selectedObj.title;

    try {
      // 1. Backend update
      try {
        await updateAdminOrderStatus(oId, 'CANCELLED');
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }

      const inTransit = isInTransitOrShipped(cancelModalOrder);
      const paymentStatusVal = inTransit ? 'NON_REFUNDABLE' : 'REFUNDED';

      // 2. Local State update
      setLocalOrderOverrides(prev => ({
        ...prev,
        [oId]: {
          ...prev[oId],
          status: 'Cancelled',
          paymentStatus: paymentStatusVal,
          cancelReason: fullReason,
          cancelNotes: cancelNotes + (inTransit ? ' [Cancelled In Transit - Non-Refundable]' : '')
        }
      }));

      // 3. LocalStorage persistence & Broadcast
      try {
        const placed = JSON.parse(localStorage.getItem('atomy_placed_orders') || '[]');
        const updatedPlaced = placed.map(o => o.orderId === oId ? { 
          ...o, 
          status: 'Cancelled', 
          orderStatus: 'CANCELLED', 
          paymentStatus: paymentStatusVal,
          cancelReason: fullReason,
          cancelNotes: cancelNotes
        } : o);
        localStorage.setItem('atomy_placed_orders', JSON.stringify(updatedPlaced));

        const adminOrders = JSON.parse(localStorage.getItem('atomy_admin_orders') || '[]');
        const updatedAdmin = adminOrders.map(o => o.orderId === oId ? { 
          ...o, 
          orderStatus: 'CANCELLED', 
          paymentStatus: paymentStatusVal,
          cancelReason: fullReason,
          cancelNotes: cancelNotes
        } : o);
        localStorage.setItem('atomy_admin_orders', JSON.stringify(updatedAdmin));

        // Create Admin Support Ticket for customer records
        const adminTickets = JSON.parse(localStorage.getItem('atomy_admin_tickets') || '[]');
        adminTickets.unshift({
          ticketId: `TCK-${Date.now().toString().slice(-8)}`,
          customerName: cancelModalOrder.shippingAddress?.recipient || 'Customer',
          customerEmail: cancelModalOrder.customerEmail || 'customer@atomy.in',
          customerPhone: cancelModalOrder.shippingAddress?.phone || '',
          subject: `Order Cancellation #${oId}: ${fullReason}`,
          category: 'CANCELLATION',
          orderId: oId,
          status: 'RESOLVED',
          message: inTransit
            ? `Customer cancelled order after transit started. Non-refundable policy applied (₹0 refunded per policy).\nReason: ${fullReason}\nComments: ${cancelNotes || 'None'}\nOriginal Value: ₹${orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : `Customer initiated 100% automated pre-dispatch cancellation.\nReason: ${fullReason}\nComments: ${cancelNotes || 'None'}\nRefund Amount: ₹${orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\nRefund SLA: UPI (24h) / Cards (3-5d).`,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('atomy_admin_tickets', JSON.stringify(adminTickets));

        window.dispatchEvent(new CustomEvent('atomy:order-cancelled', { detail: cancelModalOrder }));
      } catch {}

      setToastMessage({
        type: inTransit ? 'warning' : 'success',
        title: inTransit ? 'Order Cancelled (No Refund Applied)' : 'Order Cancelled & 100% Refund Initiated',
        desc: inTransit
          ? `Order #${oId} was cancelled while in transit. As warned, after starting transit the cancellation amount will not be refunded (₹0 refund).`
          : `Order #${oId} was cancelled. 100% refund of ₹${orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been initiated to your source payment method (UPI within 24h, Cards in 3-5 days).`
      });
      setCancelModalOrder(null);
      setCancelNotes('');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmReplacementOrReturn = async () => {
    const activeOrder = replacementModalOrder || returnModalOrder;
    if (!activeOrder) return;
    setIsSubmittingAction(true);
    const oId = activeOrder.orderId;
    const orderTotal = getOrderTotal(activeOrder);
    const selectedObj = RETURN_REPLACEMENT_REASONS.find(r => r.id === returnReasonId) || RETURN_REPLACEMENT_REASONS[0];
    const fullReason = selectedObj.title;

    try {
      const isReplacement = resolutionMode === 'replacement';
      const ticketCategory = isReplacement ? 'DAMAGED_PRODUCT' : 'REFUND_REQUEST';
      const ticketSubject = isReplacement 
        ? `Zero-Cost 1-to-1 Replacement Request for Order #${oId}: ${fullReason}`
        : `30-Day Money-Back Guarantee Return for Order #${oId}: ${fullReason}`;

      const newTicket = {
        ticketId: `TCK-${Date.now().toString().slice(-8)}`,
        customerName: activeOrder.shippingAddress?.recipient || 'Customer',
        customerEmail: activeOrder.customerEmail || 'customer@atomy.in',
        customerPhone: activeOrder.shippingAddress?.phone || '',
        subject: ticketSubject,
        category: ticketCategory,
        orderId: oId,
        status: 'OPEN',
        message: `Customer Resolution: ${isReplacement ? 'Zero-Cost 1-to-1 Replacement' : 'Return for 100% Refund'}\nReason: ${fullReason}\nDetails: ${actionNotes || 'None'}\nPackaging Retained: ${conditionConfirmed ? 'Yes (confirmed)' : 'Pending verification'}\nReverse Courier: Free Blue Dart Express pickup scheduled at ${activeOrder.shippingAddress?.address || 'Customer registered address'}.\nAmount: ₹${orderTotal.toLocaleString('en-IN')}`,
        createdAt: new Date().toISOString()
      };

      try {
        const adminTickets = JSON.parse(localStorage.getItem('atomy_admin_tickets') || '[]');
        adminTickets.unshift(newTicket);
        localStorage.setItem('atomy_admin_tickets', JSON.stringify(adminTickets));
        window.dispatchEvent(new CustomEvent('atomy:support-ticket-created', { detail: newTicket }));

        // Store flag in placed orders
        const placed = JSON.parse(localStorage.getItem('atomy_placed_orders') || '[]');
        const updatedPlaced = placed.map(o => o.orderId === oId ? {
          ...o,
          replacementRequested: isReplacement ? true : o.replacementRequested,
          returnRequested: !isReplacement ? true : o.returnRequested
        } : o);
        localStorage.setItem('atomy_placed_orders', JSON.stringify(updatedPlaced));
      } catch {}

      setLocalOrderOverrides(prev => ({
        ...prev,
        [oId]: {
          ...prev[oId],
          replacementRequested: isReplacement ? true : prev[oId]?.replacementRequested,
          returnRequested: !isReplacement ? true : prev[oId]?.returnRequested
        }
      }));

      if (isReplacement) {
        setToastMessage({
          type: 'success',
          title: 'Zero-Cost Replacement Scheduled',
          desc: `Your replacement for Order #${oId} has been registered! Blue Dart Express will collect the package from your address with ₹0 shipping fee, and a fresh replacement unit will be dispatched.`
        });
      } else {
        setToastMessage({
          type: 'success',
          title: '30-Day Money-Back Return Submitted',
          desc: `Your return request for Order #${oId} has been registered! Blue Dart reverse pickup has been scheduled. Once inspected, ₹${orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} will be credited back to your original payment channel.`
        });
      }

      setReplacementModalOrder(null);
      setReturnModalOrder(null);
      setActionNotes('');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Helper check if order is already in transit or shipped
  const isInTransitOrShipped = (order) => {
    if (!order) return false;
    const st = String(order.status || '').toLowerCase();
    return st.includes('ship') || st.includes('transit') || st.includes('out for');
  };

  // Allow customer to cancel any order that is NOT yet Delivered or already Cancelled
  const isCancellable = (order) => {
    if (!order) return false;
    const st = String(order.status || '').toLowerCase();
    if (st.includes('deliver') || st.includes('cancel')) {
      return false;
    }
    return true;
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
          <button 
            type="button"
            className="order-header-policy-link"
            onClick={() => setIsRulesModalOpen(true)}
            title="Read Official Atomy India Refund, Replacement & Cancellation Rules"
          >
            <ShieldCheck size={16} color="#00A3E0" />
            <span>Refund & Replacement Rules</span>
            <ChevronRight size={14} />
          </button>
        </div>



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
            <div className="tracker-card-label">Order Confirmed / Paid</div>
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
                        <span className={`status-pill ${order.status === 'Cash on Delivery' ? 'cash-on-delivery' : order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {order.status === 'Delivered' && <CheckCircle2 size={14} />}
                          {order.status === 'In Transit' && <Truck size={14} />}
                          {order.status === 'Preparing Shipment' && <Clock size={14} />}
                          {order.status === 'Cash on Delivery' && <Banknote size={14} />}
                          {order.status === 'Cash on Delivery' ? 'Cash on Delivery (Pending Payment)' : order.status}
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

                      {/* Status / Tracking Action Button:
                          - For Cancelled: View Status (expanding travelling cancellation flow)
                          - For Delivered: View Status
                          - For Refunded: View Status
                          - For In-Progress: Track */}
                      {isCanc ? (
                        <button
                          type="button"
                          className={`order-btn-view-status btn-cancelled ${expandedOrderId === order.orderId ? 'is-active' : ''}`}
                          onClick={() => handleToggleTracking(order)}
                          title="View Order Cancellation & 100% Refund Status"
                        >
                          <XCircle size={15} />
                          <span>{expandedOrderId === order.orderId ? 'Hide Status' : 'View Status'}</span>
                        </button>
                      ) : isDeliv ? (
                        <button
                          type="button"
                          className={`order-btn-view-status btn-delivered ${expandedOrderId === order.orderId ? 'is-active' : ''}`}
                          onClick={() => handleToggleTracking(order)}
                          title="View Delivery Completion Status"
                        >
                          <CheckCircle2 size={15} />
                          <span>{expandedOrderId === order.orderId ? 'Hide Status' : 'View Status'}</span>
                        </button>
                      ) : (order.paymentStatus === 'REFUNDED' || order.status === 'Refunded' || order.returnRequested) ? (
                        <button
                          type="button"
                          className={`order-btn-view-status btn-refunded ${expandedOrderId === order.orderId ? 'is-active' : ''}`}
                          onClick={() => handleToggleTracking(order)}
                          title="View Refund Status"
                        >
                          <RotateCcw size={15} />
                          <span>{expandedOrderId === order.orderId ? 'Hide Status' : 'View Status'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`order-btn-primary ${expandedOrderId === order.orderId ? 'is-active-btn' : ''}`}
                          onClick={() => handleToggleTracking(order)}
                          title="Track Shipment Status"
                        >
                          <Truck size={15} />
                          <span>{expandedOrderId === order.orderId ? 'Hide Tracking' : 'Track'}</span>
                        </button>
                      )}

                      {/* CANCEL ORDER OPTION (Allowed with warning if in transit) */}
                      {canCancel && (
                        <button
                          type="button"
                          className="order-btn-cancel"
                          onClick={() => setCancelModalOrder(order)}
                          title={isInTransitOrShipped(order) ? "Cancel Order (Non-Refundable In Transit)" : "Cancel Order & Receive 100% Refund"}
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
                          onClick={() => {
                            setReplacementModalOrder(order);
                            setResolutionMode('replacement');
                          }}
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
                          onClick={() => {
                            setReplacementModalOrder(order);
                            setResolutionMode('refund');
                          }}
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

                  {/* Inline Expanded Delivery / Cancellation Tracker Section */}
                  {expandedOrderId === order.orderId && (
                    <div className="order-inline-tracker-box animate-fade">
                      <div className="inline-tracker-header">
                        <div className="inline-tracker-meta">
                          <span className="meta-carrier">
                            Carrier: <strong>{isCanc ? 'Transit Halted' : (order.courier || 'Blue Dart Express')}</strong>
                          </span>
                          <span className="sep">•</span>
                          <span className="meta-awb">
                            AWB: <strong className="mono">{order.trackingNumber || (order.orderId ? `BD-${order.orderId}` : 'BD-Pending Allocation')}</strong>
                          </span>
                          <span className="sep">•</span>
                          <span className="meta-date">
                            Order Date: <strong>{order.orderDate}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          className="inline-tracker-close-btn"
                          onClick={() => setExpandedOrderId(null)}
                          title="Close tracking details"
                        >
                          <X size={14} />
                          <span>Close</span>
                        </button>
                      </div>

                      {/* Animated Delivery or Travelling Cancellation Stepper */}
                      <DeliveryStatusStepper order={order} />

                      {/* Destination Shipping Address Banner */}
                      <div className="inline-tracker-destination">
                        <MapPin size={15} color="#00A3E0" />
                        <span>
                          Shipping to: <strong>{order.shippingAddress?.recipient || 'Customer'}</strong>
                          {order.shippingAddress?.address ? ` — ${order.shippingAddress.address}` : ''}
                        </span>
                      </div>
                    </div>
                  )}
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
        <div className="order-modal-backdrop animate-fade" onClick={() => setCancelModalOrder(null)}>
          <div className="order-action-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const inTransit = isInTransitOrShipped(cancelModalOrder);
              return (
                <>
                  <div className="modal-header-danger">
                    <div className="danger-icon-wrap">
                      <XCircle size={26} color="#dc2626" />
                    </div>
                    <div>
                      <h3>Cancel Order #{cancelModalOrder.orderId}</h3>
                      <p>
                        {inTransit 
                          ? 'Package is already in transit. You can cancel, but the amount is non-refundable.'
                          : 'Eligible for instant free pre-dispatch cancellation with 100% automated refund.'}
                      </p>
                    </div>
                    <button className="modal-close-x" onClick={() => setCancelModalOrder(null)} aria-label="Close modal">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="modal-body-content">
                    {/* Dynamic Warning & Refund Breakdown Banner */}
                    {inTransit ? (
                      <div className="refund-summary-banner danger-tone" style={{ background: '#fff1f2', borderColor: '#f43f5e' }}>
                        <div className="rsb-top-row">
                          <span className="rsb-label" style={{ color: '#be123c', fontWeight: 700 }}>
                            Cancellation Refund Amount
                          </span>
                          <span className="rsb-amount" style={{ color: '#be123c' }}>
                            ₹ 0.00
                          </span>
                        </div>
                        <div className="rsb-destination" style={{ color: '#9f1239' }}>
                          <strong>⚠️ Warning — In Transit Non-Refundable Notice:</strong> After starting transit, the cancellation amount will <strong>NOT be refunded (₹0 refund)</strong> because courier logistics, Blue Dart transit allocations, and shipping fees are already irrevocably committed.
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                          Original Order Value: <strong>₹ {getOrderTotal(cancelModalOrder).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> (Forfeited upon transit cancellation)
                        </div>
                      </div>
                    ) : (
                      <div className="refund-summary-banner danger-tone">
                        <div className="rsb-top-row">
                          <span className="rsb-label">100% Refund Amount</span>
                          <span className="rsb-amount">
                            ₹ {getOrderTotal(cancelModalOrder).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="rsb-destination">
                          Credited directly back to your source payment method with <strong>₹0 cancellation fee</strong>.
                        </div>
                        <div className="refund-sla-grid">
                          <div className="sla-pill active-fast">
                            <span className="sla-channel">⚡ UPI (GPay / PhonePe)</span>
                            <span className="sla-time">Within 24 Hours</span>
                          </div>
                          <div className="sla-pill">
                            <span className="sla-channel">💳 Cards (Debit / Credit)</span>
                            <span className="sla-time">3 - 5 Business Days</span>
                          </div>
                          <div className="sla-pill">
                            <span className="sla-channel">🏦 Net Banking</span>
                            <span className="sla-time">5 - 7 Business Days</span>
                          </div>
                        </div>
                      </div>
                    )}

              {/* Reason Selector (Amazon / Myntra Style Radio Tiles) */}
              <div className="action-form-group">
                <label className="form-label">
                  Please select a reason for cancellation <span className="req">*</span>
                </label>
                <div className="reason-radio-list">
                  {CANCELLATION_REASONS.map((reason) => {
                    const isSelected = cancelReasonId === reason.id;
                    return (
                      <label 
                        key={reason.id} 
                        className={`reason-radio-tile ${isSelected ? 'selected danger-tone' : ''}`}
                      >
                        <input
                          type="radio"
                          name="cancellationReason"
                          value={reason.id}
                          checked={isSelected}
                          onChange={() => setCancelReasonId(reason.id)}
                        />
                        <div className="reason-tile-text">
                          <span className="reason-tile-title">{reason.title}</span>
                          <span className="reason-tile-desc">{reason.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Helpful hint if address change reason is selected */}
              {cancelReasonId === 'address' && (
                <div className="reason-tip-banner animate-fade">
                  <AlertCircle size={18} color="#1d4ed8" />
                  <div>
                    <strong>Need to change your shipping address?</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '11.5px' }}>
                      If you only need to change your address or phone number, our customer care team can update your delivery destination before dispatch without cancelling your order.
                    </p>
                  </div>
                </div>
              )}

              {/* Optional comments box */}
              <div className="action-form-group">
                <label className="form-label">Additional Comments / Feedback (Optional)</label>
                <textarea
                  placeholder="Share any additional details with our support team..."
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  className="form-textarea-input"
                  rows={2}
                />
              </div>

              <div className="policy-reminder-box">
                <ShieldCheck size={18} color="#00A3E0" />
                <span>
                  <strong>Atomy ₹0 Cancellation Guarantee:</strong> No deduction or restocking fee will be levied. 100% of your invoice amount is refunded.
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
                  Keep My Order
                </button>
                <button 
                  type="button" 
                  className="btn-modal-confirm-danger" 
                  onClick={handleConfirmCancelOrder}
                  disabled={isSubmittingAction}
                >
                  {isSubmittingAction ? (
                    'Processing Cancellation...'
                  ) : (
                    <>
                      <XCircle size={16} />
                      <span>{inTransit ? 'Confirm Cancellation (No Refund)' : 'Confirm Cancellation & Full Refund'}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  )}

      {/* ========================================================
          MODAL 2 & 3: ZERO-COST REPLACEMENT OR 30-DAY RETURN MODAL
          ======================================================== */}
      {(replacementModalOrder || returnModalOrder) && (() => {
        const modalOrder = replacementModalOrder || returnModalOrder;
        const isReplacement = resolutionMode === 'replacement';
        const orderTotal = getOrderTotal(modalOrder);

        return (
          <div className="order-modal-backdrop animate-fade" onClick={() => { setReplacementModalOrder(null); setReturnModalOrder(null); }}>
            <div className="order-action-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
              <div className={isReplacement ? 'modal-header-indigo' : 'modal-header-emerald'}>
                <div className={isReplacement ? 'indigo-icon-wrap' : 'emerald-icon-wrap'}>
                  {isReplacement ? <Truck size={26} color="#4338ca" /> : <RotateCcw size={26} color="#15803d" />}
                </div>
                <div>
                  <h3>
                    {isReplacement 
                      ? `Request Zero-Cost 1-to-1 Replacement (#${modalOrder.orderId})` 
                      : `30-Day Money-Back Guarantee Return (#${modalOrder.orderId})`}
                  </h3>
                  <p>
                    {isReplacement
                      ? 'Free Blue Dart reverse courier pickup with brand new unit dispatch.'
                      : 'Protected by Atomy Absolute Quality satisfaction guarantee with 100% refund.'}
                  </p>
                </div>
                <button className="modal-close-x" onClick={() => { setReplacementModalOrder(null); setReturnModalOrder(null); }}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body-content">
                {/* Resolution Mode Switcher (Amazon / Myntra Style) */}
                <div className="resolution-mode-switcher">
                  <button
                    type="button"
                    className={`mode-card-btn ${isReplacement ? 'active indigo-mode' : ''}`}
                    onClick={() => setResolutionMode('replacement')}
                  >
                    <span className="mode-card-badge recom">Recommended</span>
                    <strong>Zero-Cost 1-to-1 Replacement</strong>
                    <span>₹0 reverse shipping • Fresh unit • 100% PV kept intact</span>
                  </button>
                  <button
                    type="button"
                    className={`mode-card-btn ${!isReplacement ? 'active emerald-mode' : ''}`}
                    onClick={() => setResolutionMode('refund')}
                  >
                    <span className="mode-card-badge guarantee">Money-Back Guarantee</span>
                    <strong>Return for 100% Refund</strong>
                    <span>Full purchase reversal to original payment method</span>
                  </button>
                </div>

                {/* Refund / Replacement Value Banner */}
                <div className={`refund-summary-banner ${!isReplacement ? 'green-banner' : ''}`}>
                  <div className="rsb-top-row">
                    <span className="rsb-label">
                      {isReplacement ? 'Replacement Value' : '100% Refundable Amount'}
                    </span>
                    <span className={`rsb-amount ${!isReplacement ? 'text-green' : ''}`} style={isReplacement ? { color: '#4338ca' } : {}}>
                      ₹ {orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="rsb-destination">
                    {isReplacement 
                      ? 'Free doorstep reverse pickup scheduled via Blue Dart Express with ₹0 fee.'
                      : 'Credited directly back to your payment account once inspection is complete.'}
                  </div>
                </div>

                {/* Replacement Eligibility Policy Card */}
                {isReplacement && (
                  <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                      <ShieldCheck size={18} color="#4338ca" />
                      <span>Replacement Inspection Standards</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#15803d' }}>
                        <span>✓</span>
                        <span><strong>Eligible:</strong> Products damaged in transit <em>before delivery</em> (leaking bottle, broken seal, crushed carton) or wrong product delivered.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#b91c1c' }}>
                        <span>✗</span>
                        <span><strong>Strictly Void:</strong> Items broken, dropped, or damaged by customer <em>after delivery</em> will NOT be accepted for replacement.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Structured Reason Selector */}
                <div className="action-form-group">
                  <label className="form-label">
                    Select reason for {isReplacement ? 'replacement' : 'return'} <span className="req">*</span>
                  </label>
                  <div className="reason-radio-list">
                    {RETURN_REPLACEMENT_REASONS.map((reason) => {
                      const isSelected = returnReasonId === reason.id;
                      return (
                        <label 
                          key={reason.id} 
                          className={`reason-radio-tile ${isSelected ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="returnReplacementReason"
                            value={reason.id}
                            checked={isSelected}
                            onChange={() => setReturnReasonId(reason.id)}
                          />
                          <div className="reason-tile-text">
                            <span className="reason-tile-title">{reason.title}</span>
                            <span className="reason-tile-desc">{reason.desc}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Description / Comments */}
                <div className="action-form-group">
                  <label className="form-label">Details of the issue or feedback (Optional)</label>
                  <textarea
                    placeholder="Provide additional details regarding the condition, leak, or damage..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="form-textarea-input"
                    rows={2}
                  />
                </div>

                {/* Package Condition Confirmation Checkbox */}
                <label className="condition-check-row">
                  <input
                    type="checkbox"
                    checked={conditionConfirmed}
                    onChange={(e) => setConditionConfirmed(e.target.checked)}
                  />
                  <span>
                    I confirm that damage occurred in transit <strong>before delivery</strong> or wrong item was received, and was <strong>NOT broken or damaged by me after delivery</strong>.
                  </span>
                </label>

                {/* Pickup Address Card */}
                <div className="pickup-address-reminder">
                  <MapPin size={18} color="#00A3E0" />
                  <div>
                    <strong>Blue Dart Express Reverse Pickup Address:</strong>
                    <div>{modalOrder.shippingAddress?.recipient || 'Customer'} • {modalOrder.shippingAddress?.phone || 'Contact Phone'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{modalOrder.shippingAddress?.address || 'Registered Delivery Address'}</div>
                  </div>
                </div>
              </div>

              <div className="modal-action-footer">
                <button 
                  type="button" 
                  className="btn-modal-cancel" 
                  onClick={() => { setReplacementModalOrder(null); setReturnModalOrder(null); }}
                  disabled={isSubmittingAction}
                >
                  Keep Product
                </button>
                <button 
                  type="button" 
                  className={isReplacement ? 'btn-modal-confirm-indigo' : 'btn-modal-confirm-green'}
                  onClick={handleConfirmReplacementOrReturn}
                  disabled={isSubmittingAction || !conditionConfirmed}
                >
                  {isSubmittingAction ? (
                    'Scheduling...'
                  ) : isReplacement ? (
                    <>
                      <Truck size={16} />
                      <span>Schedule Free 1-to-1 Replacement</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      <span>Submit Return & 100% Refund</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          MODAL 4: FULL OFFICIAL CANCELLATION & REPLACEMENT RULES
          ======================================================== */}
      {isRulesModalOpen && (
        <div className="order-modal-backdrop animate-fade" onClick={() => setIsRulesModalOpen(false)}>
          <div className="order-rules-full-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="rules-modal-header">
              <div className="rules-m-icon">
                <ShieldCheck size={28} color="#00A3E0" />
              </div>
              <div>
                <h2>Official Atomy India Cancellation, Replacement & Refund Policy</h2>
                <p>Standard Operating Procedure (SOP) governing consumer rights and customer protection</p>
              </div>
              <button className="modal-close-x" onClick={() => setIsRulesModalOpen(false)} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            {/* Interactive Tab Switcher Bar */}
            <div className="rules-tabs-bar">
              <button 
                type="button" 
                className={`rules-tab-btn ${activeRulesTab === 'cancellation' ? 'active' : ''}`}
                onClick={() => setActiveRulesTab('cancellation')}
              >
                <XCircle size={15} />
                <span>Pre-Dispatch Cancellation</span>
              </button>
              <button 
                type="button" 
                className={`rules-tab-btn ${activeRulesTab === 'replacement' ? 'active' : ''}`}
                onClick={() => setActiveRulesTab('replacement')}
              >
                <Truck size={15} />
                <span>7-Day Free Replacement</span>
              </button>
              <button 
                type="button" 
                className={`rules-tab-btn ${activeRulesTab === 'refund_guarantee' ? 'active' : ''}`}
                onClick={() => setActiveRulesTab('refund_guarantee')}
              >
                <ShieldCheck size={15} />
                <span>30-Day Money-Back Guarantee</span>
              </button>
              <button 
                type="button" 
                className={`rules-tab-btn ${activeRulesTab === 'timelines' ? 'active' : ''}`}
                onClick={() => setActiveRulesTab('timelines')}
              >
                <Clock size={15} />
                <span>Banking Refund SLA</span>
              </button>
            </div>

            <div className="rules-modal-scrollable">
              {activeRulesTab === 'cancellation' && (
                <div className="policy-block animate-fade">
                  <div className="policy-badge-num blue">SOP POLICY 01</div>
                  <h3>Pre-Dispatch Order Cancellation Rights</h3>
                  <ul className="policy-bullets">
                    <li>
                      <strong>Immediate Cancellation Window:</strong> You may cancel any order free of charge at any moment while status is <code>Order Placed</code>, <code>Payment Completed</code>, or <code>Preparing Shipment</code> before warehouse handover.
                    </li>
                    <li>
                      <strong>Zero Cancellation Fee:</strong> Atomy India levies <strong>₹0 cancellation fee</strong>. No deduction is made from your paid invoice amount.
                    </li>
                    <li>
                      <strong>100% Automated Refund Before Shipping:</strong> Full paid amount is refunded immediately to your original payment channel (UPI within 24 hours, Cards in 3-5 days).
                    </li>
                    <li>
                      <strong>In-Transit Cancellation Allowed (No Refund):</strong> If you cancel an order after the package has started transit via Blue Dart, cancellation is allowed to halt delivery, but <strong>the cancellation amount will NOT be refunded (₹0 refund)</strong> as logistics and courier costs have already been executed.
                    </li>
                  </ul>
                </div>
              )}

              {activeRulesTab === 'replacement' && (
                <div className="policy-block animate-fade">
                  <div className="policy-badge-num indigo">SOP POLICY 02</div>
                  <h3>Zero-Cost 1-to-1 Product Replacement (Transit Damage & Wrong Product Only)</h3>
                  <ul className="policy-bullets">
                    <li>
                      <strong>Transit Damage Window:</strong> If any product arrives damaged in transit, leaking, or the wrong product is delivered, you have <strong>7 calendar days</strong> from delivery to request a free 1-to-1 replacement.
                    </li>
                    <li>
                      <strong>Customer Damage Strictly Void:</strong> Replacement will <strong>NOT be accepted if the customer broke or damaged the product</strong> after delivery. Accidental drops, post-delivery breakage, or misuse are strictly ineligible.
                    </li>
                    <li>
                      <strong>₹0 Reverse Logistics Cost:</strong> Free reverse pickup is arranged through Blue Dart Express at your doorstep at ₹0 expense for verified transit issues.
                    </li>
                    <li>
                      <strong>Zero PV Impact:</strong> Because funds are not reversed, your distributor Point Value (PV) points and bonus calculations remain 100% intact.
                    </li>
                    <li>
                      <strong>Direct Warehouse Dispatch:</strong> A brand-new genuine sealed replacement is dispatched from our Gurugram Central Fulfillment Center.
                    </li>
                  </ul>
                </div>
              )}

              {activeRulesTab === 'refund_guarantee' && (
                <div className="policy-block animate-fade">
                  <div className="policy-badge-num emerald">SOP POLICY 03</div>
                  <h3>Atomy 30-Day Absolute Quality 100% Satisfaction Guarantee</h3>
                  <ul className="policy-bullets">
                    <li>
                      <strong>30 Calendar Days:</strong> In accordance with Atomy's Absolute Quality promise, you can return gently tested or unopened products within 30 days of delivery if dissatisfied with the results.
                    </li>
                    <li>
                      <strong>100% Purchase Refund:</strong> Full purchase price is refunded to your original payment method.
                    </li>
                    <li>
                      <strong>Distributor PV Ledger Adjustment:</strong> PV accrued on refunded orders will be adjusted on distributor ledgers to ensure compensation plan compliance.
                    </li>
                  </ul>
                </div>
              )}

              {activeRulesTab === 'timelines' && (
                <div className="policy-block animate-fade">
                  <div className="policy-badge-num amber">SOP POLICY 04</div>
                  <h3>RBI Clearing Refund Timelines & Payment Channels</h3>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b' }}>
                    Refunds are processed automatically via bank clearing networks adhering to RBI consumer protection regulations:
                  </p>
                  <table className="policy-timeline-table">
                    <thead>
                      <tr>
                        <th>Payment Mode</th>
                        <th>Settlement SLA</th>
                        <th>Payout Destination</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>UPI (GPay / PhonePe / Paytm / BHIM)</strong></td>
                        <td><span className="fast-tag">Within 24 Hours</span></td>
                        <td>Original Virtual Payment Address (VPA)</td>
                      </tr>
                      <tr>
                        <td><strong>Credit / Debit Cards (Visa / MasterCard / RuPay)</strong></td>
                        <td>3 to 5 Banking Days</td>
                        <td>Direct card reversal through acquiring bank</td>
                      </tr>
                      <tr>
                        <td><strong>Net Banking (SBI / HDFC / ICICI / Axis / Others)</strong></td>
                        <td>5 to 7 Banking Days</td>
                        <td>Original linked bank account (via NEFT/IMPS)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
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
