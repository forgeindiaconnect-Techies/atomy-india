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
  X
} from 'lucide-react';
import DeliveryStatusStepper from './DeliveryStatusStepper';
import './OrderHistoryPage.css';

export default function OrderHistoryPage({ 
  onNavigateHome, 
  onAddToCart, 
  onProductClick,
  placedOrders = [] 
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'today' | '1week' | '1month' | '3months' | '6months' | 'all'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Payment Completed' | 'Preparing Shipment' | 'In Transit' | 'Delivered'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);
  const [activeTrackedOrder, setActiveTrackedOrder] = useState(null);
  const [trackerSearchInput, setTrackerSearchInput] = useState('');

  // Map real customer placed orders without any fake demo data
  const allOrders = useMemo(() => {
    return (placedOrders || []).map((o) => ({
      orderId: o.orderId || `AT-${Date.now().toString().slice(-8)}`,
      orderDate: o.date ? o.date.split('T')[0] : new Date().toISOString().split('T')[0],
      status: o.status || 'Payment Completed',
      statusStep: o.status === 'Delivered' ? 5 : o.status === 'In Transit' ? 3 : o.status === 'Preparing Shipment' ? 2 : 1,
      courier: o.courier || (o.status === 'Payment Completed' ? 'Awaiting Allocation' : 'Blue Dart Express'),
      trackingNumber: o.trackingNumber || '',
      paymentMethod: o.paymentMethod || 'Online Payment',
      shippingAddress: o.address || {
        recipient: o.recipient || 'Atomy Customer',
        phone: o.phone || '',
        address: o.fullAddress || 'Registered Delivery Address'
      },
      items: (o.items || []).map((it) => ({
        id: it.id,
        name: it.name,
        image: it.image,
        qty: it.qty || 1,
        price: it.price || 0,
        pv: it.pv || 0
      }))
    }));
  }, [placedOrders]);

  useEffect(() => {
    if (allOrders.length > 0) {
      setActiveTrackedOrder(allOrders[0]);
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

  return (
    <div className="order-history-page">
      {/* 1. Breadcrumbs */}
      <div className="order-breadcrumbs">
        <div className="container">
          <button onClick={onNavigateHome} className="breadcrumb-link">
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
              Inspect order details, monitor live package transit checkpoints, and re-order with one click.
            </p>
          </div>
          <div className="order-header-badge">
            <Package size={18} />
            <span>Official Atomy India Fulfillment</span>
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
              <span>AWB: <strong className="mono">{activeTrackedOrder.trackingNumber}</strong></span>
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

              {/* Quick Tracker Search Input */}
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

              return (
                <div key={order.orderId} className="order-item-card">
                  {/* Card Header */}
                  <div className="order-card-header">
                    <div className="order-header-info">
                      <span className="order-date-text">{order.orderDate}</span>
                      <span className="order-divider">|</span>
                      <span className="order-id-code">Order No: <strong>{order.orderId}</strong></span>
                    </div>

                    <div className="order-header-badges">
                      <span className={`status-pill ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.status === 'Delivered' && <CheckCircle2 size={14} />}
                        {order.status === 'In Transit' && <Truck size={14} />}
                        {order.status === 'Preparing Shipment' && <Clock size={14} />}
                        {order.status}
                      </span>
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
                        <span>Invoice / Details</span>
                      </button>

                      <button
                        type="button"
                        className="order-btn-primary"
                        onClick={() => handleTrackDelivery(order)}
                        title="Track Shipment Status"
                      >
                        <Truck size={15} />
                        <span>Track Delivery</span>
                      </button>

                      <button
                        type="button"
                        className="order-btn-reorder"
                        onClick={() => handleReorder(order)}
                        title="Add items to cart again"
                      >
                        <RotateCcw size={15} />
                        <span>Re-order</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Helpful Delivery Guide Notice */}
        <div className="order-help-banner">
          <div className="help-icon-circle">
            <Info size={22} />
          </div>
          <div className="help-text-content">
            <h4>Atomy India Delivery & Return Policy</h4>
            <p>
              Orders are dispatched via Blue Dart and Delhivery logistics within 1-2 business days.
              Returns or exchanges can be requested within 30 days of delivery through our Customer Support.
              For inquiries regarding education centres or commission points, please contact our helpdesk.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Invoice & Order Details Modal */}
      {activeInvoiceOrder && (
        <div className="invoice-modal-overlay" onClick={() => setActiveInvoiceOrder(null)}>
          <div className="invoice-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <div className="invoice-title">
                <FileText size={20} color="#00A3E0" />
                <span>Order Invoice Details</span>
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
              {/* Top Meta info */}
              <div className="invoice-meta-grid">
                <div>
                  <span className="invoice-lbl">Order Number</span>
                  <span className="invoice-val bold">{activeInvoiceOrder.orderId}</span>
                </div>
                <div>
                  <span className="invoice-lbl">Order Date</span>
                  <span className="invoice-val">{activeInvoiceOrder.orderDate}</span>
                </div>
                <div>
                  <span className="invoice-lbl">Payment Mode</span>
                  <span className="invoice-val">{activeInvoiceOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="invoice-lbl">Courier & AWB</span>
                  <span className="invoice-val">{activeInvoiceOrder.courier} ({activeInvoiceOrder.trackingNumber})</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="invoice-address-box">
                <div className="address-box-title">
                  <MapPin size={16} />
                  <span>Delivery Address</span>
                </div>
                <div className="address-box-body">
                  <strong>{activeInvoiceOrder.shippingAddress.recipient}</strong> - {activeInvoiceOrder.shippingAddress.phone}<br />
                  {activeInvoiceOrder.shippingAddress.address}
                </div>
              </div>

              {/* Items List */}
              <div className="invoice-items-table">
                <div className="table-header-row">
                  <span>Product Description</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">PV</span>
                  <span className="text-right">Price</span>
                </div>
                {activeInvoiceOrder.items.map((item, idx) => (
                  <div key={idx} className="table-data-row">
                    <span className="item-name-cell">{item.name}</span>
                    <span className="text-center">{item.qty}</span>
                    <span className="text-right">{((item.pv || 0) * item.qty).toLocaleString('en-IN')} PV</span>
                    <span className="text-right">₹ {(item.price * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>

              {/* Summary Calculations */}
              <div className="invoice-summary-table">
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
