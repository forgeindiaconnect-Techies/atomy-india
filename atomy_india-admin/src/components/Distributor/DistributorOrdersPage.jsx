import React, { useState, useEffect, useMemo } from 'react';
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
  Download,
  RotateCcw,
  RefreshCw,
  Building2
} from 'lucide-react';
import DeliveryStatusStepper from '../Orders/DeliveryStatusStepper';
import { 
  sendDelayApologyEmail,
  triggerAllDelayedEmails
} from '../../services/api';
import { INITIAL_ADMIN_PRODUCTS } from '../../data/defaultAdminProducts';
import { formatDateIST, formatTimeIST } from '../../utils/dateUtils';
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

  const fullAddress = parts.length > 0 ? parts.join(', ') : [city, state, pincode ? `PIN: ${pincode}` : ''].filter(Boolean).join(', ') || 'Registered Delivery Destination';

  return { recipient, phone, street, city, state, pincode, fullAddress };
};

export default function DistributorOrdersPage({ 
  orders = [], 
  distributor, 
  onUpdateTracking, 
  onUpdateOrderStatus,
  onOpenTrackingModal,
  onRefreshOrders,
  showToast,
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

  const validPins = useMemo(() => {
    const set = new Set();
    assignedPins.forEach(p => {
      if (p) set.add(String(p).trim());
    });
    if (distributor?.primaryPincode) {
      set.add(String(distributor.primaryPincode).trim());
    }
    if (set.size === 0) set.add('635002');
    return set;
  }, [assignedPins, distributor]);

  // Strict territory filtering for assigned PIN codes
  const territoryOrders = useMemo(() => {
    return orders.filter(o => {
      const p = String(o.pincode || o.shippingAddress?.pincode || '').trim();
      return p ? validPins.has(p) : false;
    });
  }, [orders, validPins]);

  // Remote terrain detection helper
  const isRemoteTerrain = (order) => {
    if (!order) return false;
    const text = `${order.shippingAddress || ''} ${order.city || ''} ${order.state || ''} ${order.pincode || ''}`.toLowerCase();
    return /forest|mountain|hills?|ghat|ooty|nilgiris|kodaikanal|yercaud|munnar|wayanad|valparai|coonoor|shimla|manali|kullu|leh|ladakh|jammu|kashmir|uttarkashi|chamoli|nainital|mussoorie|arunachal|sikkim|meghalaya|nagaland|mizoram|manipur/i.test(text);
  };

  // Extract immutable order creation date
  const getOrderBaseDate = (order) => {
    if (!order) return new Date();
    const raw = order.createdAt || order.date || order.orderDate;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d;
    }
    if (order.orderId && /^ORD-(\d{4})(\d{2})(\d{2})/i.test(order.orderId)) {
      const m = order.orderId.match(/^ORD-(\d{4})(\d{2})(\d{2})/i);
      if (m) {
        const y = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10) - 1;
        const da = parseInt(m[3], 10);
        return new Date(y, mo, da, 12, 0, 0);
      }
    }
    return new Date();
  };

  // Static immutable estimated delivery timeline
  const getFormattedEstimatedDelivery = (order) => {
    if (!order) return 'Within 2 Days (Nearby Hub Fulfillment)';
    const isRemote = isRemoteTerrain(order);
    const days = isRemote ? 3 : 2;
    const base = getOrderBaseDate(order);
    const dTarget = new Date(base);
    dTarget.setDate(dTarget.getDate() + days);
    const targetStr = dTarget.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${targetStr} (${isRemote ? 'Within 3 Days • Mountain/Forest' : 'Within 2 Days • Nearby Hub'})`;
  };

  // Exact SLA delivery logic identical to Super Admin
  const getOrderDeliverySLA = (order) => {
    if (!order) return { isDelayed: false, targetDate: null, targetDateStr: '', delayDays: 0, daysLeft: 0, statusText: 'On Schedule' };
    
    const isDelivered = String(order.orderStatus || '').toUpperCase() === 'DELIVERED';
    const isCancelled = String(order.orderStatus || '').toUpperCase() === 'CANCELLED';

    const base = getOrderBaseDate(order);
    const isRemote = isRemoteTerrain(order);
    const slaDays = isRemote ? 3 : 2;

    const targetDate = new Date(base);
    targetDate.setDate(targetDate.getDate() + slaDays);

    const now = new Date();
    const diffTime = now.getTime() - targetDate.getTime();
    const delayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const isDelayed = !isDelivered && !isCancelled && now > targetDate;

    return {
      isDelayed,
      isDelivered,
      isCancelled,
      isRemote,
      slaDays,
      slaLabel: isRemote ? '3-Day SLA (Mountain/Forest)' : '2-Day SLA (Nearby Hub)',
      targetDate,
      targetDateStr: targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      delayDays: Math.max(1, delayDays),
      daysLeft: Math.max(0, daysLeft),
      statusText: isDelivered 
        ? 'Delivered' 
        : isCancelled 
        ? 'Cancelled' 
        : isDelayed 
        ? `Delayed by ${Math.max(1, delayDays)} day${delayDays > 1 ? 's' : ''}` 
        : daysLeft === 0 
        ? 'Due Today' 
        : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`
    };
  };

  // Robust resolver for order items with images, PV, SKU, and unit prices
  const resolveOrderItems = (order) => {
    if (!order) return [];
    const rawItems = (Array.isArray(order.items) && order.items.length > 0)
      ? order.items
      : (Number(order.totalAmount) > 0 ? [{ price: order.totalAmount, qty: 1 }] : []);

    return rawItems.map(it => {
      const rawCode = String(it.productId || it.id || it.code || it.productCode || it.sku || '').trim();
      const rawName = String(it.productName || it.name || it.title || '').trim();
      const rawPrice = Number(it.unitPrice ?? it.price ?? 0);

      const matched = 
        (rawCode ? INITIAL_ADMIN_PRODUCTS.find(p => p && String(p.id).toLowerCase() === rawCode.toLowerCase()) : null) ||
        (rawName ? INITIAL_ADMIN_PRODUCTS.find(p => p && p.name && p.name.toLowerCase() === rawName.toLowerCase()) : null) ||
        (rawPrice > 0 ? INITIAL_ADMIN_PRODUCTS.find(p => Number(p.price) === rawPrice) : null);

      const resolvedName = rawName || matched?.name || (rawCode ? `Atomy Product (${rawCode})` : 'Atomy Authentic Product');
      const resolvedCode = rawCode || matched?.id || '-';
      const resolvedQty = Number(it.quantity ?? it.qty ?? it.count ?? 1) || 1;
      const resolvedUnitPrice = rawPrice > 0 ? rawPrice : Number(matched?.price || 0);
      const rawPv = Number(it.pv ?? it.pointValue ?? 0);
      const resolvedPv = rawPv > 0 ? rawPv : Number(matched?.pv || 0);
      const resolvedImage = it.productImage || it.image || it.img || matched?.image || "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg";
      const resolvedSubtotal = resolvedUnitPrice * resolvedQty;

      return {
        name: resolvedName,
        code: resolvedCode,
        quantity: resolvedQty,
        unitPrice: resolvedUnitPrice,
        pv: resolvedPv,
        image: resolvedImage,
        subtotal: resolvedSubtotal
      };
    });
  };

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
    const items = resolveOrderItems(order);

    const itemsHtml = items.map((it, idx) => {
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${idx + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
            <strong>${it.name}</strong><br/>
            <span style="font-size: 10.5px; color: #64748b;">Code: ${it.code}</span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center;">${it.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right;">₹ ${Number(it.unitPrice).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right;">₹ ${Number(it.subtotal).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Tax Invoice - ${invoiceNo}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 13px; line-height: 1.45; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #cbd5e1; padding: 28px; border-radius: 8px; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .header-table td { vertical-align: top; }
          .brand-title { font-size: 24px; font-weight: 800; color: #00A3E0; letter-spacing: -0.5px; }
          .brand-subtitle { font-size: 11.5px; color: #475569; font-weight: 600; margin-top: 2px; }
          .invoice-title { font-size: 20px; font-weight: 800; color: #0f172a; text-align: right; }
          .invoice-meta { font-size: 12px; color: #475569; text-align: right; margin-top: 4px; }
          .section-divider { border-top: 2px solid #00A3E0; margin: 18px 0; }
          .grid-2 { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .grid-2 td { width: 50%; vertical-align: top; padding: 6px 10px; font-size: 12px; }
          .box-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; }
          .box-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .items-table th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11.5px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .summary-table { width: 45%; margin-left: auto; border-collapse: collapse; margin-bottom: 24px; }
          .summary-table td { padding: 6px 10px; font-size: 12px; }
          .summary-table tr.total-row td { font-size: 15px; font-weight: 800; color: #00A3E0; border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; }
          .footer-note { font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table class="header-table">
            <tr>
              <td>
                <div class="brand-title">ATOMY INDIA</div>
                <div class="brand-subtitle">Atomy Enterprise India Private Limited • Regional Logistics Hub</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                  Hub Distributor: <strong>${distributor?.distributorName || 'Regional Hub'}</strong> (${distributor?.primaryPincode || 'PIN 635002'})<br/>
                  GSTIN: <strong>33AAACA0101A1Z5</strong> | PAN: AAACA0101A
                </div>
              </td>
              <td>
                <div class="invoice-title">TAX INVOICE</div>
                <div class="invoice-meta">
                  Invoice No: <strong>${invoiceNo}</strong><br/>
                  Date: <strong>${orderDate}</strong><br/>
                  Order Ref: <strong>${orderId}</strong>
                </div>
              </td>
            </tr>
          </table>

          <div class="section-divider"></div>

          <table class="grid-2">
            <tr>
              <td>
                <div class="box-panel">
                  <div class="box-title">Billed &amp; Dispatched By</div>
                  <strong>Atomy India Regional Hub Logistics</strong><br/>
                  ${distributor?.distributorName || 'Regional Hub'}<br/>
                  ${[distributor?.address || distributor?.hubAddress, distributor?.city, distributor?.state].filter(Boolean).join(', ')}<br/>
                  Territory PIN: ${distributor?.primaryPincode || '635002'}<br/>
                  Phone: ${distributor?.contactPhone || distributor?.phone || '+91 98765 43210'}
                </div>
              </td>
              <td>
                <div class="box-panel">
                  <div class="box-title">Customer Shipping Destination</div>
                  <strong>${dest.recipient}</strong><br/>
                  ${dest.street || dest.fullAddress}<br/>
                  ${dest.city ? `${dest.city}, ` : ''}${dest.state || ''} ${dest.pincode ? `PIN: ${dest.pincode}` : ''}<br/>
                  Phone: ${dest.phone || 'N/A'}<br/>
                  Email: ${order.customerEmail || 'N/A'}
                </div>
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 35px;">#</th>
                <th>Item Description</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 110px;">Unit Rate (₹)</th>
                <th style="text-align: right; width: 120px;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="summary-table">
            <tr>
              <td style="color: #64748b;">Taxable Subtotal:</td>
              <td style="text-align: right; font-weight: 600;">₹ ${taxableAmount}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">CGST (9%):</td>
              <td style="text-align: right;">₹ ${(parseFloat(gstAmount) / 2).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">SGST (9%):</td>
              <td style="text-align: right;">₹ ${(parseFloat(gstAmount) / 2).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Shipping / Delivery:</td>
              <td style="text-align: right; color: ${shippingFee > 0 ? '#0f172a' : '#16a34a'};">
                ${shippingFee > 0 ? `₹ ${shippingFee.toFixed(2)}` : 'FREE'}
              </td>
            </tr>
            <tr class="total-row">
              <td>Total Payable:</td>
              <td style="text-align: right;">₹ ${totalAmount.toFixed(2)}</td>
            </tr>
          </table>

          <div class="box-panel" style="margin-top: 14px; font-size: 11.5px; line-height: 1.5;">
            <strong>Payment Mode:</strong> ${order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : 'ONLINE UPI'} • Status: <strong style="color: #16a34a;">PAID (CONFIRMED)</strong><br/>
            <strong>Logistics Partner:</strong> ${order.courier || order.tracking?.courierPartner || 'Blue Dart Express'} • AWB: <strong>${order.tracking?.trackingNumber || 'ATMY-' + orderId}</strong>
          </div>

          <div class="footer-note">
            This is a computer-generated official tax invoice authorized under Atomy Enterprise India Pvt. Ltd.<br/>
            Regional Hub Dispatch Certification • For inquiries: support@atomyindia.com | 1800-123-ATOMY
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadInvoice = (order) => {
    try {
      const orderId = order.orderId || order.id || 'order';
      const html = generateInvoiceHtml(order);
      const printWindow = window.open('', '_blank', 'width=850,height=900');
      if (!printWindow) {
        alert('Please allow popups to download / print the invoice.');
        return;
      }
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (e) {
      console.error('Failed to trigger invoice download:', e);
    }
  };

  const handlePrintInvoice = (order) => {
    handleDownloadInvoice(order);
  };

  // Delayed orders within territory
  const delayedOrders = territoryOrders.filter(o => getOrderDeliverySLA(o).isDelayed);

  // Status Filter options identical to Super Admin
  const statusTabs = [
    { id: 'ALL', label: 'All Orders', count: territoryOrders.length },
    { id: 'PLACED', label: 'New Orders', count: territoryOrders.filter(o => String(o.orderStatus || 'PLACED').toUpperCase() === 'PLACED').length },
    { id: 'PROCESSING', label: 'Processing', count: territoryOrders.filter(o => String(o.orderStatus || '').toUpperCase() === 'PROCESSING').length },
    { id: 'SHIPPED', label: 'Shipped & Out for Delivery', count: territoryOrders.filter(o => {
      const st = String(o.orderStatus || '').toUpperCase();
      return st === 'SHIPPED' || st === 'OUT_FOR_DELIVERY';
    }).length },
    { id: 'DELIVERED', label: 'Delivered', count: territoryOrders.filter(o => String(o.orderStatus || '').toUpperCase() === 'DELIVERED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: territoryOrders.filter(o => String(o.orderStatus || '').toUpperCase() === 'CANCELLED').length },
    { id: 'DELAYED', label: '⚠️ Delayed Deliveries', count: delayedOrders.length, isDelayedTab: true }
  ];

  const filteredOrders = territoryOrders.filter((o) => {
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
        setSelectedOrderDetail(prev => ({
          ...prev,
          orderStatus: newStatus,
          status: newStatus,
          tracking: {
            ...(prev?.tracking || {}),
            currentStatus: newStatus,
            orderStatus: newStatus
          }
        }));
      }
      if (showToast) showToast(`Order ${orderId} status updated to ${newStatus}`);
    } catch (e) {
      console.error('Failed to change status:', e);
      if (showToast) showToast(`Failed to update status: ${e.message}`);
    }
  };

  const handleSendDelayApologyEmail = async (orderId, customerEmail) => {
    try {
      if (showToast) showToast(`Sending delay apology email to ${customerEmail || 'customer'}...`);
      await sendDelayApologyEmail(orderId);
      if (showToast) showToast(`✓ Apology email successfully sent to ${customerEmail || 'customer'}!`);
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      if (showToast) showToast(`Failed to send apology email: ${err.message}`);
    }
  };

  const handleTriggerAllDelayEmails = async () => {
    try {
      if (showToast) showToast('Scanning delayed territory orders and dispatching apology emails...');
      const res = await triggerAllDelayedEmails();
      if (showToast) showToast(`✓ ${res.emailsSent || 0} apology email(s) dispatched to delayed customers!`);
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      if (showToast) showToast(`Error: ${err.message}`);
    }
  };

  return (
    <div className="admin-tab-content">
      {/* 1. Content Heading Row with Delayed Badge (Identical to Super Admin) */}
      <div className="content-heading-row with-filter">
        <div>
          <h2 className="content-title">
            Customer Orders &amp; Logistics Fulfillment
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
            Inspect orders placed by direct consumers in your assigned hub territory ({distributor?.primaryPincode || 'PIN 635002'}), update delivery stages, and dispatch courier tracking.
          </p>
        </div>
      </div>

      {/* 2. Orders Status Nav Strip (Identical to Super Admin) */}
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

      {/* 3. Orders Search & Summary Filter Bar (Identical to Super Admin) */}
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
          <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{territoryOrders.length}</strong> Orders</span>
        </div>
      </div>

      {/* 4. Delayed Orders Control & Batch Apology Notification Bar (Identical to Super Admin) */}
      {orderStatusFilter === 'DELAYED' && (
        <div className="delayed-orders-management-bar">
          <div className="delayed-mgmt-left">
            <AlertTriangle size={20} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong>Delayed Orders Delivery Window SLA Control ({delayedOrders.length} Delayed Orders)</strong>
              <p>
                Automated background scans trigger every 4 hours to send apology emails to customers whose shipments exceed 2 days (dispatched from nearby regional hubs) or 3 days (remote mountain/forest areas with limited transport). You can also click below to manually trigger or resend apology emails.
              </p>
            </div>
          </div>
          {filteredOrders.length > 0 && (
            <button
              type="button"
              className="trigger-all-delayed-btn"
              onClick={handleTriggerAllDelayEmails}
              title="Send Apology Email to All Delayed Customers"
            >
              <Mail size={14} />
              <span>Dispatch Apology to All ({filteredOrders.length})</span>
            </button>
          )}
        </div>
      )}

      {/* 5. Orders Data Table (Exact Super Admin columns, styling, and action pills) */}
      <div className="atomy-table-responsive orders-table-wrapper">
        <table className="atomy-data-table orders-data-table">
          <thead>
            <tr>
              <th style={{ width: '175px', minWidth: '175px' }}>Order ID &amp; Date</th>
              <th style={{ width: '210px', minWidth: '210px' }}>Customer Details</th>
              <th style={{ minWidth: '240px' }}>Shipping Destination</th>
              <th style={{ width: '120px', minWidth: '120px', textAlign: 'center' }}>Items Ordered</th>
              <th style={{ width: '140px', minWidth: '140px', textAlign: 'right' }}>Total Amount</th>
              <th style={{ width: '130px', minWidth: '130px', textAlign: 'center' }}>Payment</th>
              <th style={{ width: '190px', minWidth: '190px', textAlign: 'center' }}>Fulfillment Status</th>
              <th style={{ width: '220px', minWidth: '220px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-row">
                  <Package size={40} color="#94a3b8" />
                  <p>No customer orders found in this category.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const sla = getOrderDeliverySLA(o);
                const orderDate = new Date(o.createdAt || Date.now());
                const currentStatus = String(o.orderStatus || 'PLACED').toUpperCase();
                const isPickup = Boolean(
                  o.fulfillmentType === 'STORE_PICKUP' ||
                  o.shippingMethod === 'STORE_PICKUP' ||
                  o.isPickup === true ||
                  (o.pickupStatus && o.pickupStatus !== 'NONE') ||
                  (typeof o.shippingAddress === 'string' && o.shippingAddress.toLowerCase().includes('direct store pickup')) ||
                  (o.hubName && !o.courier)
                );
                const dest = resolveOrderDestination(o);
                const resolvedItems = resolveOrderItems(o);
                const totalAmt = Number(o.totalAmount || 0);
                const hubCommission = Number(o.distributorCommission || (totalAmt * 0.075));

                return (
                  <tr key={o.orderId || o.id}>
                    <td>
                      <div className="order-id-badge">
                        <span className="order-id-text">{o.orderId || o.id}</span>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        {isPickup ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #86efac',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.3px'
                          }}>
                            <Building2 size={11} /> DIRECT HUB PICKUP
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '10px',
                            fontWeight: 600
                          }}>
                            <Truck size={11} /> HOME DELIVERY
                          </span>
                        )}
                      </div>
                      <div className="order-date-text">
                        {formatDateIST(o.createdAt || o.date)}
                        <span className="order-time-text">
                          {formatTimeIST(o.createdAt || o.date)}
                        </span>
                      </div>
                      {sla.isDelivered ? (
                        <span className="sla-badge delivered">
                          <CheckCircle2 size={11} color="#15803d" /> Delivered
                        </span>
                      ) : sla.isCancelled ? null : sla.isDelayed ? (
                        <span className="sla-badge delayed" title={`Target was ${sla.targetDateStr} (${sla.slaDays}d SLA)`}>
                          <AlertTriangle size={11} color="#dc2626" /> Overdue ({sla.delayDays}d)
                        </span>
                      ) : (
                        <span className="sla-badge on-schedule" title={`Delivery target: ${sla.targetDateStr}`}>
                          <Clock size={11} color="#15803d" /> {sla.statusText}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="cell-primary-text">{o.customerName || 'Customer'}</div>
                      <div className="cell-secondary-text">{o.customerPhone || 'N/A'}</div>
                      <div className="cell-secondary-text">{o.customerEmail || ''}</div>
                    </td>

                    <td className="cell-address">
                      {isPickup ? (
                        <>
                          <div style={{ color: '#15803d', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building2 size={13} color="#15803d" />
                            <span>Customer Pickup at Hub Counter</span>
                          </div>
                          <div className="address-line-sub" style={{ color: '#475569', fontSize: '11.5px', marginTop: '2px' }}>
                            Hub: {o.hubName || distributor?.hubAddress || 'Designated Regional Hub Counter'}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="address-line-primary" title={dest.fullAddress}>
                            {dest.street || dest.fullAddress}
                          </div>
                          <div className="address-line-sub">
                            {dest.city}, {dest.state} <span className="pincode-pill">{dest.pincode}</span>
                          </div>
                        </>
                      )}
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
                            <><strong>Last Date: {sla.targetDateStr}</strong> ({sla.delayDays}d late)</>
                          ) : (
                            <>Deadline: {sla.targetDateStr || getFormattedEstimatedDelivery(o)}</>
                          )}
                        </span>
                      </div>
                      {sla.isDelayed && (
                        <div style={{
                          fontSize: '11px',
                          color: o.delayEmailSent ? '#16a34a' : '#ea580c',
                          fontWeight: 600,
                          marginTop: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          {o.delayEmailSent ? <CheckCircle2 size={11} color="#16a34a" /> : <Mail size={11} color="#ea580c" />}
                          <span>{o.delayEmailSent ? 'Apology email dispatched' : 'Apology email pending'}</span>
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="items-count-badge">
                        {resolvedItems.length} item{resolvedItems.length !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }} className="cell-price-col">
                      <span className="order-total-amount">
                        ₹ {totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                        +₹ {hubCommission.toFixed(2)} Hub Margin
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`payment-pill ${(o.paymentStatus || 'PAID').toLowerCase()}`}>
                        {o.paymentMethod ? o.paymentMethod.replace(/_/g, ' ') : 'ONLINE UPI'} {o.paymentStatus ? `(${o.paymentStatus})` : ''}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {(() => {
                        let badgeBg = '#f1f5f9';
                        let badgeBorder = '#cbd5e1';
                        let badgeColor = '#334155';
                        let badgeLabel = currentStatus;
                        let badgeSub = isPickup ? 'Direct Hub Pickup' : 'Courier Dispatch';
                        let badgeIcon = <Package size={12} />;

                        if (isPickup) {
                          if (currentStatus === 'DELIVERED' || o.pickupStatus === 'COLLECTED') {
                            badgeBg = '#dcfce7';
                            badgeBorder = '#86efac';
                            badgeColor = '#15803d';
                            badgeLabel = 'DELIVERED / COLLECTED';
                            badgeSub = 'Handed Over at Counter';
                            badgeIcon = <CheckCircle2 size={12} color="#15803d" />;
                          } else if (currentStatus === 'READY_FOR_PICKUP' || o.pickupStatus === 'READY_FOR_PICKUP') {
                            badgeBg = '#fef3c7';
                            badgeBorder = '#fde68a';
                            badgeColor = '#92400e';
                            badgeLabel = 'READY TO PICK UP';
                            badgeSub = 'Available at Counter';
                            badgeIcon = <Store size={12} color="#b45309" />;
                          } else if (currentStatus === 'PROCESSING') {
                            badgeBg = '#e0f2fe';
                            badgeBorder = '#bae6fd';
                            badgeColor = '#0369a1';
                            badgeLabel = 'PREPARING';
                            badgeSub = 'Hub Staff Packing';
                            badgeIcon = <Clock size={12} color="#0284c7" />;
                          } else if (currentStatus === 'PLACED') {
                            badgeBg = '#f0fdf4';
                            badgeBorder = '#bbf7d0';
                            badgeColor = '#166534';
                            badgeLabel = 'PLACED (NEW)';
                            badgeSub = 'Payment Confirmed';
                            badgeIcon = <Package size={12} color="#16a34a" />;
                          } else if (currentStatus === 'CANCELLED') {
                            badgeBg = '#fef2f2';
                            badgeBorder = '#fecaca';
                            badgeColor = '#991b1b';
                            badgeLabel = 'CANCELLED';
                            badgeSub = 'Cancelled & Refunded';
                            badgeIcon = <X size={12} color="#dc2626" />;
                          }
                        } else {
                          // Standard Doorstep Courier Delivery
                          if (currentStatus === 'DELIVERED') {
                            badgeBg = '#dcfce7';
                            badgeBorder = '#86efac';
                            badgeColor = '#15803d';
                            badgeLabel = 'DELIVERED';
                            badgeSub = 'Doorstep Delivered';
                            badgeIcon = <CheckCircle2 size={12} color="#15803d" />;
                          } else if (currentStatus === 'OUT_FOR_DELIVERY') {
                            badgeBg = '#fae8ff';
                            badgeBorder = '#f0abfc';
                            badgeColor = '#86198f';
                            badgeLabel = 'OUT FOR DELIVERY';
                            badgeSub = 'On Delivery Vehicle';
                            badgeIcon = <Truck size={12} color="#a21caf" />;
                          } else if (currentStatus === 'SHIPPED') {
                            badgeBg = '#e0f2fe';
                            badgeBorder = '#7dd3fc';
                            badgeColor = '#0369a1';
                            badgeLabel = 'SHIPPED';
                            badgeSub = 'In Courier Transit';
                            badgeIcon = <Truck size={12} color="#0284c7" />;
                          } else if (currentStatus === 'PROCESSING') {
                            badgeBg = '#fef3c7';
                            badgeBorder = '#fde68a';
                            badgeColor = '#92400e';
                            badgeLabel = 'PROCESSING';
                            badgeSub = 'Warehouse Packing';
                            badgeIcon = <Clock size={12} color="#b45309" />;
                          } else if (currentStatus === 'PLACED') {
                            badgeBg = '#f0fdf4';
                            badgeBorder = '#bbf7d0';
                            badgeColor = '#166534';
                            badgeLabel = 'PLACED (NEW)';
                            badgeSub = 'Payment Confirmed';
                            badgeIcon = <Package size={12} color="#16a34a" />;
                          } else if (currentStatus === 'CANCELLED') {
                            badgeBg = '#fef2f2';
                            badgeBorder = '#fecaca';
                            badgeColor = '#991b1b';
                            badgeLabel = 'CANCELLED';
                            badgeSub = 'Refunded';
                            badgeIcon = <X size={12} color="#dc2626" />;
                          }
                        }

                        return (
                          <div
                            onClick={() => setSelectedOrderDetail(o)}
                            title="View-only in list. Click to inspect & update status inside."
                            style={{
                              display: 'inline-flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              background: badgeBg,
                              border: `1.5px solid ${badgeBorder}`,
                              color: badgeColor,
                              cursor: 'pointer',
                              userSelect: 'none',
                              transition: 'all 0.15s ease',
                              minWidth: '130px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 800, fontSize: '11px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                              {badgeIcon}
                              <span>{badgeLabel}</span>
                            </div>
                            <span style={{ fontSize: '9.5px', fontWeight: 600, opacity: 0.85, marginTop: '1px' }}>
                              {badgeSub}
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions-group">
                        <button
                          type="button"
                          className="action-pill-btn detail"
                          onClick={() => setSelectedOrderDetail(o)}
                          title="Inspect Full Order Line Items & Invoice"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>

                        <button
                          type="button"
                          className="action-pill-btn tracking"
                          onClick={() => onOpenTrackingModal && onOpenTrackingModal(o)}
                          title="Update Courier Tracking Details"
                        >
                          <Truck size={13} />
                          <span>Tracking</span>
                        </button>

                        {sla.isDelayed && (
                          <button
                            type="button"
                            className={`action-pill-btn apology ${o.delayEmailSent ? 'sent' : ''}`}
                            onClick={() => handleSendDelayApologyEmail(o.orderId || o.id, o.customerEmail)}
                            title={o.delayEmailSent ? `Apology email sent. Click to resend.` : 'Send Customer Delay Apology Email'}
                          >
                            <Mail size={13} />
                            <span>{o.delayEmailSent ? 'Resend' : 'Send Apology'}</span>
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

      {/* 6. Full-Page Order Inspection & Live Stepper (Dedicated View Exactly matching Super Admin) */}
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
                <span>Back to All Orders</span>
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
                className="inspection-topbar-btn courier-btn"
                onClick={() => {
                  const currentSt = selectedOrderDetail.orderStatus || selectedOrderDetail.status || 'PLACED';
                  const o = {
                    ...selectedOrderDetail,
                    orderStatus: currentSt,
                    status: currentSt,
                    tracking: {
                      ...(selectedOrderDetail?.tracking || {}),
                      currentStatus: currentSt,
                      orderStatus: currentSt
                    }
                  };
                  setSelectedOrderDetail(null);
                  if (onOpenTrackingModal) onOpenTrackingModal(o);
                }}
              >
                <Truck size={15} />
                <span>Courier Tracking Details</span>
              </button>

              <button
                type="button"
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={() => handleDownloadInvoice(selectedOrderDetail)}
                title="Download Official Tax Invoice as PDF"
              >
                <Download size={14} />
                <span>Download Invoice</span>
              </button>

              <button
                type="button"
                style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '8px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={() => handlePrintInvoice(selectedOrderDetail)}
                title="Print / Save Tax Invoice"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>

              <button 
                type="button" 
                className="inspection-topbar-close-btn" 
                onClick={() => setSelectedOrderDetail(null)}
                title="Close and return to orders"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Fullscreen Body Content (Covers entire screen) */}
          <div className="inspection-fullscreen-content">
            {Boolean(
              selectedOrderDetail.fulfillmentType === 'STORE_PICKUP' ||
              selectedOrderDetail.shippingMethod === 'STORE_PICKUP' ||
              selectedOrderDetail.isPickup === true ||
              (selectedOrderDetail.pickupStatus && selectedOrderDetail.pickupStatus !== 'NONE') ||
              (typeof selectedOrderDetail.shippingAddress === 'string' && selectedOrderDetail.shippingAddress.toLowerCase().includes('direct store pickup')) ||
              (selectedOrderDetail.hubName && !selectedOrderDetail.courier)
            ) && (
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Building2 size={24} color="#16a34a" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#15803d' }}>
                    🏢 DIRECT HUB SELF-PICKUP ORDER
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '3px' }}>
                    The customer will arrive at your hub counter in person to collect this parcel. <strong>Do not assign a courier or dispatch via vehicle.</strong> Pack items and keep them ready at the pickup desk.
                  </div>
                </div>
              </div>
            )}

            {/* Live Animated Delivery Stepper */}
            <div className="inspection-card stepper-card">
              <DeliveryStatusStepper order={selectedOrderDetail} />
            </div>

            {/* Customer & Delivery Meta Grid (4 Cards identical to Super Admin) */}
            <div className="order-meta-info-grid">
              {(() => {
                const dest = resolveOrderDestination(selectedOrderDetail);
                const sla = getOrderDeliverySLA(selectedOrderDetail);
                const totalAmt = Number(selectedOrderDetail.totalAmount || 0);
                const hubCommission = Number(selectedOrderDetail.distributorCommission || (totalAmt * 0.075));

                return (
                  <>
                    <div className="meta-info-card">
                      <div className="meta-card-label">CUSTOMER DETAILS</div>
                      <div className="meta-card-main">{dest.recipient}</div>
                      <div className="meta-card-sub">{dest.phone || selectedOrderDetail.customerPhone || 'N/A'}</div>
                      <div className="meta-card-sub">{selectedOrderDetail.customerEmail || 'N/A'}</div>
                    </div>

                    <div className="meta-info-card">
                      <div className="meta-card-label">DELIVERY DESTINATION</div>
                      <div className="meta-card-main">{dest.street || dest.fullAddress}</div>
                      <div className="meta-card-sub">{dest.city}, {dest.state} - {dest.pincode}</div>
                    </div>

                    <div className="meta-info-card">
                      <div className="meta-card-label">PAYMENT &amp; STATUS</div>
                      <div className="meta-card-main">
                        ₹ {totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="meta-card-sub">
                        Method: {selectedOrderDetail.paymentMethod || 'ONLINE UPI'} • {selectedOrderDetail.paymentStatus || 'PAID'}
                      </div>
                      <div className="meta-card-sub" style={{ color: '#16a34a', fontWeight: 600, marginTop: '3px' }}>
                        Hub Margin: ₹ {hubCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div
                      className="meta-info-card"
                      style={sla.isDelayed ? { border: '1px solid #fecaca', background: '#fff5f5' } : {}}
                    >
                      <div className="meta-card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>DELIVERY SLA &amp; DEADLINE</span>
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
                        {sla.targetDateStr ? `Deadline: ${sla.targetDateStr}` : getFormattedEstimatedDelivery(selectedOrderDetail)}
                      </div>
                      <div className="meta-card-sub">
                        Status: <strong style={{ color: sla.isDelayed ? '#dc2626' : '#15803d' }}>{sla.statusText}</strong> ({sla.slaDays}-Day SLA) • Carrier: {selectedOrderDetail.courier || selectedOrderDetail.tracking?.courierPartner || 'Blue Dart Express'} {selectedOrderDetail.tracking?.trackingNumber ? `(${selectedOrderDetail.tracking.trackingNumber})` : ''}
                      </div>
                      {sla.isDelayed && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ fontSize: '11.5px', color: selectedOrderDetail.delayEmailSent ? '#16a34a' : '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {selectedOrderDetail.delayEmailSent ? (
                              <>
                                <CheckCircle2 size={13} color="#16a34a" />
                                <span>Apology Dispatched ({selectedOrderDetail.delayEmailSentAt ? new Date(selectedOrderDetail.delayEmailSentAt).toLocaleDateString('en-IN') : 'Sent'})</span>
                              </>
                            ) : (
                              <>
                                <Mail size={13} color="#b91c1c" />
                                <span>Customer not yet notified</span>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            className="apology-modal-action-btn"
                            onClick={() => handleSendDelayApologyEmail(selectedOrderDetail.orderId || selectedOrderDetail.id, selectedOrderDetail.customerEmail)}
                          >
                            <Mail size={12} />
                            <span>{selectedOrderDetail.delayEmailSent ? 'Resend Apology Email' : 'Send Apology Email Now'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Items Table Card (Identical to Super Admin) */}
            <div className="inspection-card items-card">
              <div className="order-items-detail-title">
                Purchased Items Breakdown ({resolveOrderItems(selectedOrderDetail).length} Items)
              </div>
              <div className="atomy-table-responsive">
                <table className="atomy-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px' }}>Item</th>
                      <th>Product Name</th>
                      <th>Product Code</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>PV</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolveOrderItems(selectedOrderDetail).map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <img
                            src={it.image}
                            alt={it.name}
                            className="table-product-thumb"
                            onError={(e) => {
                              e.currentTarget.src = "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg";
                            }}
                          />
                        </td>
                        <td>
                          <strong>{it.name}</strong>
                        </td>
                        <td className="mono-col">{it.code}</td>
                        <td><span className="qty-tag">{it.quantity}</span></td>
                        <td>₹ {Number(it.unitPrice).toLocaleString('en-IN')}</td>
                        <td>{Number(it.pv).toLocaleString('en-IN')} PV</td>
                        <td style={{ textAlign: 'right' }} className="cell-price">
                          ₹ {Number(it.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Update Control Bar */}
            <div className="inspection-card status-actions-card">
              <div className="status-update-control">
                <label className="status-update-label">Update Order Status:</label>
                {Boolean(
                  selectedOrderDetail.fulfillmentType === 'STORE_PICKUP' ||
                  selectedOrderDetail.shippingMethod === 'STORE_PICKUP' ||
                  selectedOrderDetail.isPickup === true ||
                  (selectedOrderDetail.pickupStatus && selectedOrderDetail.pickupStatus !== 'NONE') ||
                  (typeof selectedOrderDetail.shippingAddress === 'string' && selectedOrderDetail.shippingAddress.toLowerCase().includes('direct store pickup')) ||
                  (selectedOrderDetail.hubName && !selectedOrderDetail.courier)
                ) ? (
                  <select
                    value={String(selectedOrderDetail.orderStatus || selectedOrderDetail.status || 'PLACED').toUpperCase()}
                    onChange={(e) => {
                      const newSt = e.target.value;
                      if (newSt === 'DELIVERED' && !selectedOrderDetail.pickupVerifiedAt && selectedOrderDetail.pickupStatus !== 'COLLECTED') {
                        // Anti-False Handover: Open Tracking Modal with OTP verification flow
                        const orderToVerify = { ...selectedOrderDetail };
                        setSelectedOrderDetail(null);
                        if (onOpenTrackingModal) onOpenTrackingModal(orderToVerify);
                        return;
                      }
                      handleStatusChange(selectedOrderDetail.orderId || selectedOrderDetail.id, newSt);
                      setSelectedOrderDetail(prev => ({
                        ...prev,
                        orderStatus: newSt,
                        status: newSt,
                        pickupStatus: newSt === 'DELIVERED' ? 'COLLECTED' : newSt === 'READY_FOR_PICKUP' ? 'READY_FOR_PICKUP' : 'PENDING_PACKING',
                        tracking: {
                          ...(prev?.tracking || {}),
                          currentStatus: newSt,
                          orderStatus: newSt
                        }
                      }));
                    }}
                    className="atomy-dropdown status-modal-dropdown"
                    style={{ borderColor: '#16a34a', color: '#15803d', fontWeight: 700 }}
                  >
                    <option value="PLACED">Stage 1: PLACED (Payment Confirmed)</option>
                    <option value="PROCESSING">Stage 2: PREPARING (Staff Packing Goods from Shelf)</option>
                    <option value="READY_FOR_PICKUP">Stage 3: READY TO PICK UP (Available at Counter)</option>
                    <option value="DELIVERED">
                      Stage 4: DELIVERED / COLLECTED (Requires Customer OTP)
                    </option>
                    <option value="CANCELLED">CANCELLED (Cancelled &amp; Refunded)</option>
                  </select>
                ) : (
                  <select
                    value={String(selectedOrderDetail.orderStatus || selectedOrderDetail.status || 'PLACED').toUpperCase()}
                    onChange={(e) => {
                      const newSt = e.target.value;
                      handleStatusChange(selectedOrderDetail.orderId || selectedOrderDetail.id, newSt);
                      setSelectedOrderDetail(prev => ({
                        ...prev,
                        orderStatus: newSt,
                        status: newSt,
                        tracking: {
                          ...(prev?.tracking || {}),
                          currentStatus: newSt,
                          orderStatus: newSt
                        }
                      }));
                    }}
                    className="atomy-dropdown status-modal-dropdown"
                  >
                    <option value="PLACED">PLACED (New Order)</option>
                    <option value="PROCESSING">PROCESSING (Warehouse Packed)</option>
                    <option value="SHIPPED">SHIPPED (In Transit)</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (Local Hub)</option>
                    <option value="DELIVERED">DELIVERED (Customer Received)</option>
                    <option value="CANCELLED">CANCELLED (Cancelled &amp; Refunded)</option>
                  </select>
                )}
              </div>

              <div className="modal-actions-right">
                <button
                  type="button"
                  className="order-footer-btn courier-btn"
                  onClick={() => {
                    const currentSt = selectedOrderDetail.orderStatus || selectedOrderDetail.status || 'PLACED';
                    const o = {
                      ...selectedOrderDetail,
                      orderStatus: currentSt,
                      status: currentSt,
                      tracking: {
                        ...(selectedOrderDetail?.tracking || {}),
                        currentStatus: currentSt,
                        orderStatus: currentSt
                      }
                    };
                    setSelectedOrderDetail(null);
                    if (onOpenTrackingModal) onOpenTrackingModal(o);
                  }}
                >
                  <Truck size={15} />
                  <span>Update Logistics Tracking</span>
                </button>
                <button 
                  type="button" 
                  className="order-footer-btn done-btn" 
                  onClick={() => setSelectedOrderDetail(null)}
                >
                  <span>Close Inspection</span>
                </button>
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
          </div>
        </div>
      )}
    </div>
  );
}
