import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Eye, 
  X, 
  ChevronRight,
  ExternalLink,
  Calendar,
  Phone,
  Mail,
  IndianRupee,
  ShieldCheck,
  Store,
  Check,
  FileText,
  Printer,
  ArrowLeft,
  Download
} from 'lucide-react';
import DeliveryStatusStepper from '../Orders/DeliveryStatusStepper';
import { updateDistributorPickupStatus } from '../../services/distributorService';
import '../Admin/AdminDashboard.css';
import './DistributorOrdersPage.css';

// Helper to reliably extract complete destination address across all order formats
export const resolveOrderDestination = (order) => {
  if (!order) return { recipient: 'Customer', phone: '', street: '', city: '', state: '', pincode: '', fullAddress: 'Registered Delivery Destination' };
  
  const recipient = order.customerName || order.recipient || order.shippingAddress?.recipient || order.address?.recipient || 'Customer';
  const phone = order.customerPhone || order.phone || order.shippingAddress?.phone || order.address?.phone || '';
  
  let street = '';
  if (typeof order.shippingAddress === 'string' && order.shippingAddress.trim()) {
    street = order.shippingAddress.trim();
  } else if (order.shippingAddress && typeof order.shippingAddress === 'object') {
    street = order.shippingAddress.address || order.shippingAddress.fullAddress || order.shippingAddress.street || '';
  } else if (typeof order.address === 'string' && order.address.trim()) {
    street = order.address.trim();
  } else if (order.address && typeof order.address === 'object') {
    street = order.address.address || order.address.fullAddress || order.address.street || '';
  }

  const city = order.city || order.shippingAddress?.city || order.address?.city || '';
  const state = order.state || order.shippingAddress?.state || order.address?.state || '';
  const pincode = order.pincode || order.shippingAddress?.pincode || order.address?.pincode || '';

  const parts = [];
  if (street) parts.push(street);
  if (city && !street.toLowerCase().includes(city.toLowerCase())) parts.push(city);
  if (state && !street.toLowerCase().includes(state.toLowerCase())) parts.push(state);
  if (pincode && !street.includes(pincode)) parts.push(`PIN: ${pincode}`);

  const fullAddress = parts.length > 0 ? parts.join(', ') : [city, state, pincode ? `PIN: ${pincode}` : ''].filter(Boolean).join(', ') || 'Direct Customer Delivery Destination';

  return {
    recipient,
    phone,
    street: street || fullAddress,
    city,
    state,
    pincode,
    fullAddress
  };
};

export default function DistributorOrdersPage({ 
  orders = [], 
  distributor, 
  onUpdateTracking, 
  onUpdateOrderStatus,
  onOpenTrackingModal,
  isLoading 
}) {
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

  // Keep inspected order detail live and reactive when orders state changes
  useEffect(() => {
    if (selectedOrderDetail) {
      const fresh = orders.find(o => (o.orderId === selectedOrderDetail.orderId || o.id === selectedOrderDetail.id));
      if (fresh) {
        setSelectedOrderDetail(prev => ({ ...prev, ...fresh }));
      }
    }
  }, [orders]);

  const assignedPins = distributor?.assignedPincodes || [distributor?.primaryPincode].filter(Boolean);

  // SLA calculation helper identical to Super Admin
  const getOrderDeliverySLA = (order) => {
    const st = String(order?.orderStatus || 'PLACED').toUpperCase();
    if (st === 'DELIVERED') {
      return { isDelivered: true, isDelayed: false, statusText: 'Delivered' };
    }
    if (st === 'CANCELLED') {
      return { isCancelled: true, isDelayed: false, statusText: 'Cancelled' };
    }

    const created = new Date(order?.createdAt || Date.now());
    // 2 days SLA for regional hub territory
    const slaTarget = new Date(created.getTime() + 2 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const isDelayed = now > slaTarget;
    const diffDays = Math.max(1, Math.round((now - slaTarget) / (1000 * 60 * 60 * 24)));

    const targetDateStr = slaTarget.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });

    return {
      isDelivered: false,
      isCancelled: false,
      isDelayed,
      delayDays: diffDays,
      targetDateStr,
      statusText: `Delivery Target: ${targetDateStr}`
    };
  };

  const delayedOrders = orders.filter(o => getOrderDeliverySLA(o).isDelayed);

  // Official Atomy India Tax Invoice HTML generator
  const generateInvoiceHtml = (order) => {
    if (!order) return '';
    const orderId = order.orderId || order.id || 'N/A';
    const invoiceNo = `INV-${orderId}`;
    const dest = resolveOrderDestination(order);
    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const totalAmount = Number(order.totalAmount || 0);
    const shippingFee = Number(order.shippingFee || 0);
    const merchandiseSubtotal = Math.max(0, totalAmount - shippingFee);
    const taxableAmount = (merchandiseSubtotal / 1.18).toFixed(2);
    const gstAmount = (merchandiseSubtotal - parseFloat(taxableAmount)).toFixed(2);
    const rawItems = order.items && order.items.length > 0 
      ? order.items 
      : [{ name: 'Atomy Product Order', quantity: 1, price: merchandiseSubtotal }];

    const items = rawItems.map(it => {
      let price = Number(it.price || it.unitPrice || 0);
      if (rawItems.length === 1 && merchandiseSubtotal > 0) {
        price = merchandiseSubtotal / (it.quantity || it.qty || 1);
      }
      return { ...it, price };
    });

    const itemsHtml = items.map((it, idx) => {
      const itPrice = Number(it.price || it.unitPrice || 0);
      const itQty = it.quantity || 1;
      const itTotal = itPrice * itQty;
      const itTaxable = (itTotal / 1.18).toFixed(2);
      const itGst = (itTotal - parseFloat(itTaxable)).toFixed(2);
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${idx + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
            <strong>${it.productName || it.name || 'Atomy Product'}</strong>
            ${it.sku ? `<div style="font-size: 11px; color: #64748b;">SKU: ${it.sku}</div>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">${itQty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right;">₹ ${itPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right;">₹ ${parseFloat(itTaxable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right;">18% (₹ ${parseFloat(itGst).toLocaleString('en-IN', { minimumFractionDigits: 2 })})</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: bold;">₹ ${itTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${invoiceNo}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 36px; font-size: 13px; line-height: 1.5; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .title-area { font-size: 24px; font-weight: 800; color: #00a3e0; letter-spacing: -0.5px; }
          .sub-badge { display: inline-block; background: #e0f2fe; color: #0284c7; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; margin-top: 4px; }
          .address-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 24px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .items-table th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .summary-card { width: 340px; margin-left: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 30px; }
          .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
          .grand-total-row { border-top: 2px solid #00a3e0; margin-top: 6px; padding-top: 8px; font-weight: 800; font-size: 16px; color: #0284c7; }
          .print-btn-bar { margin-bottom: 24px; text-align: right; }
          .btn-print { background: #00a3e0; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }
          @media print {
            .print-btn-bar { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-bar">
          <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>
        <table class="header-table">
          <tr>
            <td style="width: 60%;">
              <div class="title-area">ATOMY INDIA</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">Atomy Enterprise India Pvt. Ltd. • Official Tax Invoice</div>
              <span class="sub-badge">ORIGINAL FOR RECIPIENT</span>
            </td>
            <td style="width: 40%; text-align: right;">
              <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${invoiceNo}</div>
              <div style="font-size: 12px; color: #64748b;">Order Ref: ${orderId}</div>
              <div style="font-size: 12px; color: #64748b;">Invoice Date: ${orderDate}</div>
              <div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-top: 4px;">GSTIN: 33AAACA0101A1Z5</div>
            </td>
          </tr>
        </table>

        <div class="address-card">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 14px;">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px;">Dispatched By (Regional Hub):</div>
                <strong style="color: #0f172a;">${distributor?.hubName || distributor?.businessName || 'Regional Hub'}</strong><br/>
                <span>Distributor ID: ${distributor?.id || distributor?.distributorId || 'N/A'} (PIN: ${distributor?.primaryPincode || 'N/A'})</span><br/>
                <span>${[distributor?.address || distributor?.hubAddress, distributor?.city, distributor?.state].filter(Boolean).join(', ') || 'Regional Logistics Center'}</span><br/>
                <span>Phone: ${distributor?.phone || distributor?.contactPersonPhone || 'N/A'}</span>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 14px; border-left: 1px solid #e2e8f0;">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px;">Billed &amp; Shipped To (Customer):</div>
                <strong style="color: #0f172a;">${dest.recipient}</strong><br/>
                <span>${dest.fullAddress}</span><br/>
                <span>Contact: ${dest.phone || order.customerPhone || 'N/A'}${order.customerEmail ? ' • ' + order.customerEmail : ''}</span>
              </td>
            </tr>
          </table>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 35px;">#</th>
              <th>Product Description</th>
              <th style="width: 50px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Unit Price</th>
              <th style="width: 100px; text-align: right;">Taxable Val</th>
              <th style="width: 110px; text-align: right;">GST Rate</th>
              <th style="width: 110px; text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary-card">
          <div class="summary-row">
            <span style="color: #64748b;">Merchandise Subtotal:</span>
            <span>₹ ${merchandiseSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="summary-row">
            <span style="color: #64748b;">Taxable Net Amount:</span>
            <span>₹ ${parseFloat(taxableAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="summary-row">
            <span style="color: #64748b;">CGST (9%):</span>
            <span>₹ ${(parseFloat(gstAmount) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="summary-row">
            <span style="color: #64748b;">SGST (9%):</span>
            <span>₹ ${(parseFloat(gstAmount) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="summary-row">
            <span style="color: #64748b;">Shipping &amp; Delivery Fee:</span>
            <span>${shippingFee > 0 ? `₹ ${shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '<span style="color: #16a34a; font-weight: 600;">FREE (Atomy Hub Delivery)</span>'}</span>
          </div>
          <div class="summary-row grand-total-row">
            <span>Invoice Grand Total:</span>
            <span>₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div style="margin-top: 40px; padding-top: 14px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <strong>Payment Status:</strong> ${order.paymentStatus || 'PAID'} (${order.paymentMethod || 'ONLINE UPI'})<br/>
            <span>This is a computer-generated tax invoice issued by Atomy Enterprise India Authorized Regional Hub.</span>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; color: #0f172a;">For Atomy Enterprise India Pvt. Ltd.</div>
            <div style="margin-top: 24px; font-size: 11px; color: #94a3b8;">Authorized Signatory / Hub Dispatch Seal</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Official Atomy India Tax Invoice print preview handler
  const handlePrintInvoice = (order) => {
    if (!order) return;
    const printWindow = window.open('', '_blank', 'width=880,height=920');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to view/print the invoice.');
      return;
    }
    const html = generateInvoiceHtml(order);
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };

  // Official Atomy India Tax Invoice download handler (PDF/HTML download + instant print dialog)
  const handleDownloadInvoice = (order) => {
    if (!order) return;
    const orderId = order.orderId || order.id || 'ORDER';
    const html = generateInvoiceHtml(order);
    
    // 1. Direct file download
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Atomy_Tax_Invoice_${orderId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('File download error:', e);
    }

    // 2. Open printable window with auto-trigger for system Save-as-PDF
    const printWindow = window.open('', '_blank', 'width=880,height=920');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    }
  };

  // Status Filter options
  const statusTabs = [
    { id: 'ALL', label: 'All Orders', count: orders.length },
    { id: 'PLACED', label: 'New Orders', count: orders.filter(o => String(o.orderStatus || 'PLACED').toUpperCase() === 'PLACED').length },
    { id: 'PROCESSING', label: 'Processing', count: orders.filter(o => String(o.orderStatus || '').toUpperCase() === 'PROCESSING').length },
    { id: 'SHIPPED', label: 'In Transit & Shipped', count: orders.filter(o => {
      const st = String(o.orderStatus || '').toUpperCase();
      return st === 'SHIPPED' || st === 'OUT_FOR_DELIVERY';
    }).length },
    { id: 'DELIVERED', label: 'Delivered', count: orders.filter(o => String(o.orderStatus || '').toUpperCase() === 'DELIVERED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => String(o.orderStatus || '').toUpperCase() === 'CANCELLED').length },
    { id: 'DELAYED', label: '⚠️ Delayed Deliveries', count: delayedOrders.length, isDelayedTab: true }
  ];

  const filteredOrders = orders.filter((o) => {
    const st = String(o.orderStatus || 'PLACED').toUpperCase();
    const sla = getOrderDeliverySLA(o);

    if (orderStatusFilter === 'DELAYED') {
      if (!sla.isDelayed) return false;
    } else if (orderStatusFilter === 'SHIPPED') {
      if (st !== 'SHIPPED' && st !== 'OUT_FOR_DELIVERY') return false;
    } else if (orderStatusFilter !== 'ALL' && st !== orderStatusFilter) {
      return false;
    }

    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchId = String(o.orderId || o.id || '').toLowerCase().includes(q);
      const matchCust = String(o.customerName || '').toLowerCase().includes(q);
      const matchPhone = String(o.customerPhone || '').toLowerCase().includes(q);
      const matchPin = String(o.pincode || '').toLowerCase().includes(q);
      const matchCity = String(o.city || '').toLowerCase().includes(q);
      if (!matchId && !matchCust && !matchPhone && !matchPin && !matchCity) return false;
    }

    return true;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (onUpdateOrderStatus) {
        await onUpdateOrderStatus(orderId, newStatus);
      } else if (onUpdateTracking) {
        await onUpdateTracking(orderId, {
          orderStatus: newStatus,
          currentStatus: newStatus,
          statusNote: `Status updated to ${newStatus} by Regional Hub (${distributor?.distributorId || 'DIST-HUB'})`
        });
      }
      if (selectedOrderDetail && (selectedOrderDetail.orderId === orderId || selectedOrderDetail.id === orderId)) {
        setSelectedOrderDetail(prev => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (e) {
      console.error('Failed to change status:', e);
    }
  };

  const handleUpdatePickup = async (orderId, newPickupStatus) => {
    try {
      await updateDistributorPickupStatus(orderId, distributor?.distributorId || distributor?.id || '', newPickupStatus);
      if (onUpdateTracking) {
        await onUpdateTracking(orderId, {
          orderStatus: newPickupStatus === 'COLLECTED' ? 'DELIVERED' : 'PROCESSING',
          pickupStatus: newPickupStatus,
          statusNote: newPickupStatus === 'COLLECTED' 
            ? 'Customer presented invoice and collected parcel from hub counter.' 
            : 'Items packed and marked ready for customer hub pickup.'
        });
      }
    } catch (e) {
      console.error('Failed to update pickup status:', e);
    }
  };

  return (
    <div className="admin-tab-content">
      {/* 1. Content Heading Row with Delayed Badge */}
      <div className="content-heading-row with-filter">
        <div>
          <h2 className="content-title">
            Customer Orders &amp; Regional Hub Logistics
            {delayedOrders.length > 0 && (
              <span style={{
                marginLeft: '12px',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                padding: '3px 12px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                verticalAlign: 'middle'
              }}>
                <AlertTriangle size={14} color="#dc2626" />
                {delayedOrders.length} Delayed Orders
              </span>
            )}
          </h2>
          <p className="content-subtitle">
            Inspect direct customer orders in your assigned PIN code ({distributor?.primaryPincode}), manage Blue Dart dispatch tracking, and monitor SLA delivery deadlines.
          </p>
        </div>
      </div>

      {/* 2. Orders Status Nav Strip */}
      <div className="orders-status-nav-strip">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`order-status-tab ${orderStatusFilter === tab.id ? 'active' : ''} ${tab.isDelayedTab ? 'delayed-tab' : ''}`}
            onClick={() => setOrderStatusFilter(tab.id)}
          >
            <span>{tab.label}</span>
            <span className="tab-count-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* 3. Search and Summary Filter Row */}
      <div className="orders-filter-row">
        <div className="search-input-wrapper orders-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone, or City..."
            value={orderSearchQuery}
            onChange={(e) => setOrderSearchQuery(e.target.value)}
            className="atomy-search-input"
          />
          {orderSearchQuery && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => setOrderSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="orders-summary-pill">
          <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> Territory Orders</span>
        </div>
      </div>

      {/* 4. Delayed Orders SLA Control Bar */}
      {orderStatusFilter === 'DELAYED' && (
        <div className="delayed-orders-management-bar">
          <div className="delayed-mgmt-left">
            <AlertTriangle size={20} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong>Regional Delivery SLA Control ({delayedOrders.length} Delayed Orders)</strong>
              <p>
                Orders exceeding the 48-hour delivery SLA trigger automated tracking notifications. Please dispatch tracking information or coordinate with your local delivery courier immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Orders Data Table */}
      <div className="atomy-table-responsive orders-table-wrapper">
        <table className="atomy-data-table orders-data-table">
          <thead>
            <tr>
              <th style={{ width: '185px', minWidth: '185px' }}>Order ID &amp; Date</th>
              <th style={{ width: '220px', minWidth: '220px' }}>Customer Details</th>
              <th style={{ minWidth: '240px' }}>Shipping Destination</th>
              <th style={{ width: '120px', minWidth: '120px', textAlign: 'center' }}>Items</th>
              <th style={{ width: '140px', minWidth: '140px', textAlign: 'right' }}>Total Amount</th>
              <th style={{ width: '130px', minWidth: '130px', textAlign: 'center' }}>Payment</th>
              <th style={{ width: '190px', minWidth: '190px', textAlign: 'center' }}>Fulfillment Status</th>
              <th style={{ width: '210px', minWidth: '210px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-row">
                  <Package size={40} color="#94a3b8" />
                  <p>No territory orders found matching the selected filter.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const sla = getOrderDeliverySLA(o);
                const orderDate = new Date(o.createdAt || Date.now());
                const currentStatus = String(o.orderStatus || 'PLACED').toUpperCase();

                return (
                  <tr key={o.orderId || o.id}>
                    <td>
                      <div className="order-id-badge">
                        <span className="order-id-text">{o.orderId || o.id}</span>
                      </div>
                      <div className="order-date-text">
                        {orderDate.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        <span className="order-time-text">
                          {orderDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                      {sla.isDelivered ? (
                        <span className="sla-badge delivered">
                          <CheckCircle2 size={11} color="#15803d" /> Delivered
                        </span>
                      ) : sla.isCancelled ? null : sla.isDelayed ? (
                        <span className="sla-badge delayed" title={`Target was ${sla.targetDateStr}`}>
                          <AlertTriangle size={11} color="#dc2626" /> Overdue ({sla.delayDays}d)
                        </span>
                      ) : (
                        <span className="sla-badge on-schedule" title={`Delivery target: ${sla.targetDateStr}`}>
                          <Clock size={11} color="#15803d" /> On Schedule
                        </span>
                      )}

                      <div style={{ marginTop: '5px' }}>
                        {o.fulfillmentType === 'STORE_PICKUP' ? (
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 7px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #86efac' }}>
                            <Store size={11} /> DIRECT PICKUP
                          </span>
                        ) : (
                          <span style={{ fontSize: '10.5px', fontWeight: 600, background: '#e0f2fe', color: '#0369a1', padding: '2px 7px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #bae6fd' }}>
                            <Truck size={11} /> COURIER
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="cell-primary-text">{o.customerName || 'Customer'}</div>
                      <div className="cell-secondary-text">{o.customerPhone || 'N/A'}</div>
                      <div className="cell-secondary-text">{o.customerEmail}</div>
                    </td>

                    <td className="cell-address">
                      {(() => {
                        const oDest = resolveOrderDestination(o);
                        return (
                          <>
                            <div className="address-line-primary" title={oDest.fullAddress}>
                              {oDest.street || oDest.fullAddress}
                            </div>
                            <div className="address-line-sub">
                              {oDest.city || distributor?.city}, {oDest.state || distributor?.state} <span className="pincode-pill">{oDest.pincode}</span>
                            </div>
                          </>
                        );
                      })()}
                      <div style={{
                        fontSize: '11px',
                        color: sla.isDelayed ? '#dc2626' : '#0284c7',
                        fontWeight: sla.isDelayed ? 700 : 600,
                        marginTop: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {sla.isDelayed ? <AlertTriangle size={12} color="#dc2626" /> : <Truck size={12} />}
                        <span>
                          {sla.isDelayed ? (
                            <><strong>Last SLA Date: {sla.targetDateStr}</strong> ({sla.delayDays}d late)</>
                          ) : (
                            <>Target SLA: {sla.targetDateStr}</>
                          )}
                        </span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="items-count-badge">
                        {o.items?.length || 1} item{(o.items?.length || 1) !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }} className="cell-price-col">
                      <span className="order-total-amount">
                        ₹ {Number(o.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`payment-pill ${(o.paymentStatus || 'PAID').toLowerCase()}`}>
                        {o.paymentMethod ? o.paymentMethod.replace(/_/g, ' ') : 'ONLINE UPI'} {o.paymentStatus ? `(${o.paymentStatus})` : ''}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(o.orderId || o.id, e.target.value)}
                        className={`status-select ${currentStatus.toLowerCase()}`}
                      >
                        <option value="PLACED">PLACED (New)</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions-group">
                        <button
                          type="button"
                          className="action-pill-btn detail"
                          onClick={() => setSelectedOrderDetail(o)}
                          title="Inspect Order Items & Invoice"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>

                        {o.fulfillmentType === 'STORE_PICKUP' ? (
                          (currentStatus !== 'DELIVERED' && o.pickupStatus !== 'COLLECTED') ? (
                            o.pickupStatus === 'READY_FOR_PICKUP' ? (
                              <button
                                type="button"
                                className="action-pill-btn"
                                style={{ background: '#10b981', color: '#ffffff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleUpdatePickup(o.orderId || o.id, 'COLLECTED')}
                                title="Customer arrived with invoice: verify and hand over parcel"
                              >
                                <Check size={13} />
                                <span>Hand Over</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="action-pill-btn"
                                style={{ background: '#0284c7', color: '#ffffff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleUpdatePickup(o.orderId || o.id, 'READY_FOR_PICKUP')}
                                title="Pack items and mark ready for customer pickup"
                              >
                                <Package size={13} />
                                <span>Pack for Pickup</span>
                              </button>
                            )
                          ) : (
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={12} /> Collected
                            </span>
                          )
                        ) : (
                          <button
                            type="button"
                            className="action-pill-btn tracking"
                            onClick={() => onOpenTrackingModal && onOpenTrackingModal(o)}
                            title="Update Courier / Blue Dart Tracking"
                          >
                            <Truck size={13} />
                            <span>Tracking</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 6. Full-Page Order Inspection & Live Stepper (Dedicated View matching Super Admin) */}
      {selectedOrderDetail && (
        <div className="order-inspection-fullscreen-page">
          {/* Top Fullscreen Header Bar */}
          <div className="inspection-fullscreen-topbar">
            <div className="inspection-topbar-left">
              <button 
                type="button"
                className="inspection-back-nav-btn" 
                onClick={() => setSelectedOrderDetail(null)}
              >
                <ArrowLeft size={18} />
                <span>Back to Territory Orders</span>
              </button>
              <div className="inspection-topbar-divider" />
              <div className="inspection-order-headline">
                <Package size={22} color="#00A3E0" />
                <h3>Order Inspection: <span className="inspection-order-id">{selectedOrderDetail.orderId || selectedOrderDetail.id}</span></h3>
                <span className={`inspection-status-pill status-${(selectedOrderDetail.orderStatus || 'placed').toLowerCase()}`}>
                  {selectedOrderDetail.orderStatus || 'PLACED'}
                </span>
              </div>
            </div>

            <div className="inspection-topbar-right">
              <button 
                type="button" 
                className="inspection-topbar-close-btn" 
                onClick={() => setSelectedOrderDetail(null)}
                title="Close and return to territory orders"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Fullscreen Body Content (Covers entire screen) */}
          <div className="inspection-fullscreen-content">
            {/* Live Animated Delivery Stepper */}
            <div className="inspection-card stepper-card">
              <DeliveryStatusStepper order={selectedOrderDetail} />
            </div>

            {/* Customer & Delivery Meta Grid */}
            <div className="order-meta-info-grid">
              <div className="meta-info-card">
                <div className="meta-card-label">CUSTOMER DETAILS</div>
                <div className="meta-card-main">{resolveOrderDestination(selectedOrderDetail).recipient}</div>
                <div className="meta-card-sub">{resolveOrderDestination(selectedOrderDetail).phone || selectedOrderDetail.customerPhone || 'No Phone'}</div>
                <div className="meta-card-sub">{selectedOrderDetail.customerEmail || 'No Email'}</div>
              </div>

              <div className="meta-info-card">
                <div className="meta-card-label">DELIVERY DESTINATION</div>
                <div className="meta-card-main" style={{ whiteSpace: 'normal', lineHeight: '1.45', fontSize: '13px', fontWeight: 600 }}>
                  {resolveOrderDestination(selectedOrderDetail).fullAddress}
                </div>
                <div className="meta-card-sub" style={{ marginTop: '4px' }}>
                  PIN: <strong>{resolveOrderDestination(selectedOrderDetail).pincode}</strong> • Territory: {resolveOrderDestination(selectedOrderDetail).city}, {resolveOrderDestination(selectedOrderDetail).state}
                </div>
              </div>

              <div className="meta-info-card">
                <div className="meta-card-label">PAYMENT & SETTLEMENT</div>
                <div className="meta-card-main">
                  ₹ {Number(selectedOrderDetail.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="meta-card-sub">
                  Method: {selectedOrderDetail.paymentMethod || 'ONLINE UPI'} • {selectedOrderDetail.paymentStatus || 'PAID'}
                </div>
                {selectedOrderDetail.distributorCommission && (
                  <div className="meta-card-sub" style={{ color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                    Your Hub Commission: ₹ {Number(selectedOrderDetail.distributorCommission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>

              {(() => {
                const sla = getOrderDeliverySLA(selectedOrderDetail);
                return (
                  <div
                    className="meta-info-card"
                    style={sla.isDelayed ? { border: '1px solid #fecaca', background: '#fff5f5' } : {}}
                  >
                    <div className="meta-card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>REGIONAL DELIVERY SLA</span>
                      {sla.isDelayed && (
                        <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <AlertTriangle size={12} color="#dc2626" /> OVERDUE ({sla.delayDays}D)
                        </span>
                      )}
                    </div>
                    <div
                      className="meta-card-main"
                      style={{ color: sla.isDelayed ? '#dc2626' : '#00A3E0', fontWeight: 700 }}
                    >
                      {sla.targetDateStr ? `Target Date: ${sla.targetDateStr}` : '48-Hour Territory SLA'}
                    </div>
                    <div className="meta-card-sub">
                      Status: <strong style={{ color: sla.isDelayed ? '#dc2626' : '#15803d' }}>{sla.statusText}</strong> • Carrier: {selectedOrderDetail.courier || selectedOrderDetail.tracking?.courierPartner || 'Blue Dart Express'} {selectedOrderDetail.tracking?.trackingNumber ? `(${selectedOrderDetail.tracking.trackingNumber})` : ''}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Items Table Card */}
            <div className="inspection-card items-card">
              <div className="order-items-detail-title">
                Purchased Line Items ({((selectedOrderDetail.items && selectedOrderDetail.items.length) || 1)} Items)
              </div>
              <div className="atomy-table-responsive">
                <table className="atomy-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Item Description</th>
                      <th style={{ textAlign: 'center', width: '15%' }}>Quantity</th>
                      <th style={{ textAlign: 'right', width: '20%' }}>Unit Price</th>
                      <th style={{ textAlign: 'right', width: '20%' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const totalAmt = Number(selectedOrderDetail.totalAmount || 0);
                      const shipFee = Number(selectedOrderDetail.shippingFee || 0);
                      const merchSubtotal = Math.max(0, totalAmt - shipFee);
                      const rawItems = (selectedOrderDetail.items && selectedOrderDetail.items.length > 0)
                        ? selectedOrderDetail.items
                        : [{ productName: 'Atomy Product Order', quantity: 1, price: merchSubtotal }];
                      return rawItems.map((item, idx) => {
                        let itPrice = Number(item.price || item.unitPrice || 0);
                        const itQty = Number(item.quantity || item.qty || 1);
                        if (rawItems.length === 1 && merchSubtotal > 0) {
                          itPrice = merchSubtotal / itQty;
                        }
                        const itTotal = itPrice * itQty;
                        return (
                          <tr key={idx}>
                            <td>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.productName || item.name || 'Atomy Product'}</div>
                              {item.sku && <span style={{ fontSize: '11.5px', color: '#64748b' }}>SKU: {item.sku}</span>}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700 }}>{itQty}</td>
                            <td style={{ textAlign: 'right', color: '#475569' }}>
                              ₹ {itPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                              ₹ {itTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, padding: '14px 16px', background: '#f8fafc' }}>
                        Grand Total (Inclusive of GST):
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '16px', color: '#00A3E0', padding: '14px 16px', background: '#f8fafc' }}>
                        ₹ {Number(selectedOrderDetail.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Dedicated Official GST Tax Invoice & Download Card */}
            <div className="inspection-card" style={{ padding: '22px 26px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Official GST Tax Invoice &amp; Settlement</h4>
                    <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Invoice No: <strong style={{ color: '#0f172a' }}>INV-{selectedOrderDetail.orderId || selectedOrderDetail.id}</strong> • GSTIN: <strong>33AAACA0101A1Z5</strong>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onClick={() => handleDownloadInvoice(selectedOrderDetail)}
                    title="Download Official Tax Invoice as PDF"
                  >
                    <Download size={15} />
                    <span>Download Invoice (PDF)</span>
                  </button>
                  <button
                    type="button"
                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onClick={() => handlePrintInvoice(selectedOrderDetail)}
                    title="Print / Save Tax Invoice"
                  >
                    <Printer size={15} />
                    <span>Print Tax Invoice</span>
                  </button>
                </div>
              </div>

              {/* Invoice Breakdown Grid */}
              {(() => {
                const totalAmt = Number(selectedOrderDetail.totalAmount || 0);
                const shipFee = Number(selectedOrderDetail.shippingFee || 0);
                const merchSubtotal = Math.max(0, totalAmt - shipFee);
                const taxableNet = merchSubtotal / 1.18;
                const totalGst = merchSubtotal - taxableNet;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Taxable Net Amount</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        ₹ {taxableNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>GST (18% Incl.)</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        ₹ {totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Shipping &amp; Delivery Fee</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: shipFee > 0 ? '#0f172a' : '#16a34a', marginTop: '2px' }}>
                        {shipFee > 0 ? `₹ ${shipFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'FREE (Atomy Hub)'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Invoice Grand Total</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#00A3E0', marginTop: '2px' }}>
                        ₹ {totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Payment Mode</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                        {selectedOrderDetail.paymentMethod || 'ONLINE UPI'} <span style={{ color: '#16a34a' }}>({selectedOrderDetail.paymentStatus || 'PAID'})</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Hub Commission (7.5%)</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                        ₹ {Number(selectedOrderDetail.distributorCommission || (totalAmt * 0.075)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Status / Dispatch Action Strip in Inspector */}
            <div className="inspection-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#334155' }}>Update Live Fulfillment Status:</span>
                <select
                  value={String(selectedOrderDetail.orderStatus || 'PLACED').toUpperCase()}
                  onChange={(e) => {
                    const newSt = e.target.value;
                    handleStatusChange(selectedOrderDetail.orderId || selectedOrderDetail.id, newSt);
                    setSelectedOrderDetail(prev => ({ ...prev, orderStatus: newSt }));
                  }}
                  className={`status-select ${String(selectedOrderDetail.orderStatus || 'PLACED').toLowerCase()}`}
                  style={{ minWidth: '170px', padding: '8px 12px', fontSize: '13px', fontWeight: 700, borderRadius: '8px' }}
                >
                  <option value="PLACED">PLACED (New)</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {selectedOrderDetail.fulfillmentType !== 'STORE_PICKUP' && (
                  <button
                    type="button"
                    className="action-pill-btn tracking"
                    onClick={() => {
                      const o = selectedOrderDetail;
                      if (onOpenTrackingModal) onOpenTrackingModal(o);
                    }}
                    style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Truck size={16} />
                    <span>Update Courier &amp; Tracking Details</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
