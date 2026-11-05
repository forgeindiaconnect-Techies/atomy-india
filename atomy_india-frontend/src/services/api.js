import { ALL_CATALOG_PRODUCTS } from '../data/mockData';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const defaultBaseUrl = isLocalhost ? 'http://localhost:8085/api' : 'https://atomy-india-lqsy.onrender.com/api';
const rawBase = (import.meta.env.VITE_API_BASE_URL || defaultBaseUrl).trim().replace(/\/+$/, '');
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

// Customer APIs
export async function fetchHubDetails(pincode) {
  const pin = (pincode || (typeof localStorage !== 'undefined' ? localStorage.getItem('atomy_customer_delivery_pincode') : '') || '635001').trim();
  try {
    const res = await fetch(`${API_BASE}/pincodes/hub-details?pincode=${encodeURIComponent(pin)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API fetchHubDetails fallback:', err.message);
  }

  // Graceful fallback with full details based on regional PIN code
  if (pin.startsWith('11')) {
    return {
      found: true,
      hubName: 'Delhi Central Regional Hub',
      hubAddress: 'Plot 14, Connaught Place Logistics Park, Outer Circle, New Delhi - 110001',
      contactPerson: 'Rajesh Sharma (Hub Manager)',
      phone: '+91 98111 22334',
      email: 'delhi.distributor@atomy.com',
      pincode: '110001',
      city: 'New Delhi',
      state: 'Delhi',
      operatingHours: 'Mon – Sat: 9:30 AM – 7:30 PM',
      pickupInstructions: 'Present your Order ID or downloaded Invoice PDF at the counter to collect your order.'
    };
  } else if (pin.startsWith('56')) {
    return {
      found: true,
      hubName: 'Bengaluru South Regional Hub',
      hubAddress: 'No. 88, 5th Block, Koramangala Commerce Hub, Near Sony World Signal, Bengaluru - 560001',
      contactPerson: 'Suresh Kumar (Hub Manager)',
      phone: '+91 98450 11223',
      email: 'bengaluru.distributor@atomy.com',
      pincode: '560001',
      city: 'Bengaluru',
      state: 'Karnataka',
      operatingHours: 'Mon – Sat: 9:30 AM – 7:30 PM',
      pickupInstructions: 'Present your Order ID or downloaded Invoice PDF at the counter to collect your order.'
    };
  } else if (pin === '635002') {
    return {
      found: true,
      distributorId: 'DIST-635002',
      hubName: 'Selva atomy hub',
      hubAddress: 'RK Tower, Rayakotta main road, bayanapalli, Krishnagiri - 635002',
      contactPerson: 'Selva Kumar (Hub Manager)',
      phone: '+91 95388 53454',
      email: 'selvakumarc029@gmail.com',
      pincode: '635002',
      city: 'Krishnagiri',
      state: 'Tamil Nadu',
      operatingHours: 'Mon – Sat: 9:30 AM – 7:30 PM',
      pickupInstructions: 'Present your Order ID or downloaded Invoice PDF at the counter to collect your order.'
    };
  }
  return {
    found: false,
    distributorId: null,
    hubName: 'No Regional Hub Available',
    hubAddress: 'No regional hub currently serves this delivery PIN code.',
    contactPerson: 'Logistics Desk',
    phone: '+91 1800 123 4567',
    email: 'support.india@atomy.com',
    pincode: pin,
    city: 'Unavailable',
    state: 'India',
    isDeliverable: false
  };
}

export async function checkPincodeInventory(pincode) {
  const pin = String(pincode || '').trim();
  if (!pin) return { isDeliverable: true, itemsStock: {} };

  try {
    const res = await fetch(`${API_BASE}/products?pincode=${encodeURIComponent(pin)}`);
    if (res.ok) {
      const products = await res.json();
      if (Array.isArray(products) && products.length > 0) {
        const prodMap = {};
        let anyInStock = false;
        products.forEach(p => {
          const qty = p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0;
          const inStk = Boolean(p.inStock) && qty >= 2;
          if (inStk) anyInStock = true;
          prodMap[p.id] = {
            stockQuantity: qty,
            inStock: inStk,
            hubId: p.regionalHubId,
            hubName: p.regionalHubName
          };
        });
        return { isDeliverable: anyInStock, itemsStock: prodMap, raw: products };
      }
    }
  } catch (err) {
    console.debug('checkPincodeInventory quiet note:', err?.message || err);
  }

  // Fallback if backend is offline / remote error:
  // Only known assigned distributor PINs (like 635002, 11*, 56*) have inventory.
  // Other PINs (like 635202 without an assigned hub) have 0 stock.
  const hasKnownHub = pin === '635002' || pin.startsWith('11') || pin.startsWith('56');
  const prodMap = {};
  if (Array.isArray(ALL_CATALOG_PRODUCTS)) {
    ALL_CATALOG_PRODUCTS.forEach(p => {
      prodMap[p.id] = {
        stockQuantity: hasKnownHub ? (p.stockQuantity !== undefined ? Number(p.stockQuantity) : 50) : 0,
        inStock: hasKnownHub ? (p.inStock !== false) : false
      };
    });
  }
  return { isDeliverable: hasKnownHub, itemsStock: prodMap };
}

export async function createCustomerOrder(orderData) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000);
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to place order');
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    // If remote endpoint failed/timed out, try localhost backend if available
    if (!API_BASE.includes('localhost:8085')) {
      try {
        const localCtrl = new AbortController();
        const localTimeout = setTimeout(() => localCtrl.abort(), 3500);
        const localRes = await fetch('http://localhost:8085/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
          signal: localCtrl.signal
        });
        clearTimeout(localTimeout);
        if (localRes.ok) {
          return await localRes.json();
        }
      } catch (localErr) {}
    }
    throw err;
  }
}

export async function syncUnsyncedOrdersToBackend() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('atomy_placed_orders');
    if (!raw) return;
    const orders = JSON.parse(raw);
    if (!Array.isArray(orders) || orders.length === 0) return;

    let updated = false;
    for (const order of orders) {
      if (!order.syncedToBackend && order.orderId) {
        try {
          const isCod = (order.paymentMethod || '').toLowerCase().includes('cash') || (order.paymentMethod || '').toLowerCase().includes('cod');
          const payload = {
            orderId: order.orderId,
            customerName: order.customerName || order.recipient || 'Customer',
            customerEmail: order.customerEmail || 'customer@atomy.com',
            customerPhone: order.phone || order.customerPhone || '9876543210',
            shippingAddress: typeof order.shippingAddress === 'string' ? order.shippingAddress : (order.address?.fullAddress || 'Doorstep Delivery'),
            city: order.city || 'New Delhi',
            state: order.state || 'Delhi',
            pincode: order.pincode || '110001',
            paymentMethod: isCod ? 'CASH_ON_DELIVERY' : 'ONLINE_UPI',
            shippingFee: order.shippingFee !== undefined ? Number(order.shippingFee) : 0,
            totalAmount: order.grandTotal !== undefined ? Number(order.grandTotal) : Number(order.totalAmount || 0),
            items: (order.items || []).map(it => ({
              productId: it.id || it.productId || '',
              name: it.name || it.productName || '',
              productName: it.name || it.productName || '',
              price: Number(it.price) || 0,
              image: it.image || it.productImage || '',
              quantity: it.qty || it.quantity || 1
            }))
          };
          const res = await createCustomerOrder(payload);
          if (res && res.orderId) {
            order.syncedToBackend = true;
            updated = true;
          }
        } catch (syncErr) {
          console.warn('Sync pending order failed for', order.orderId, syncErr.message);
        }
      }
    }
    if (updated) {
      localStorage.setItem('atomy_placed_orders', JSON.stringify(orders));
    }
  } catch (e) {
    console.warn('syncUnsyncedOrdersToBackend error:', e);
  }
}

export async function getCustomerOrderTracking(orderId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_BASE}/tracking/${encodeURIComponent(orderId)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Tracking for order "${orderId}" was not found.`);
      }
      throw new Error('Failed to retrieve tracking details');
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    // If remote endpoint failed/timed out, try localhost backend if available
    if (!API_BASE.includes('localhost:8085')) {
      try {
        const localCtrl = new AbortController();
        const localTimeout = setTimeout(() => localCtrl.abort(), 3000);
        const localRes = await fetch(`http://localhost:8085/api/tracking/${encodeURIComponent(orderId)}`, {
          signal: localCtrl.signal
        });
        clearTimeout(localTimeout);
        if (localRes.ok) {
          return await localRes.json();
        }
      } catch (localErr) {}
    }
    throw err;
  }
}

export async function submitSupportTicket(ticketData) {
  const res = await fetch(`${API_BASE}/support/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to submit ticket');
  }
  return res.json();
}

export async function getSupportTicket(ticketId) {
  const res = await fetch(`${API_BASE}/support/tickets/${encodeURIComponent(ticketId)}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Ticket "${ticketId}" was not found.`);
    }
    throw new Error('Failed to retrieve support ticket');
  }
  return res.json();
}

export async function getCustomerTicketsByEmail(email) {
  const res = await fetch(`${API_BASE}/support/tickets?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Failed to retrieve customer tickets');
  return res.json();
}

export async function addCustomerTicketReply(ticketId, message) {
  const res = await fetch(`${API_BASE}/support/tickets/${encodeURIComponent(ticketId)}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sender: 'CUSTOMER' })
  });
  if (!res.ok) throw new Error('Failed to post reply');
  return res.json();
}

// Admin APIs
export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchAdminOrders(statusFilter) {
  const url = statusFilter ? `${API_BASE}/admin/orders?status=${statusFilter}` : `${API_BASE}/admin/orders`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function updateAdminOrderStatus(orderId, newStatus) {
  const res = await fetch(`${API_BASE}/admin/orders/${encodeURIComponent(orderId)}/status?status=${newStatus}`, {
    method: 'PUT'
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function updateAdminOrderTracking(orderId, trackingData) {
  const res = await fetch(`${API_BASE}/admin/orders/${encodeURIComponent(orderId)}/tracking`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trackingData)
  });
  if (!res.ok) throw new Error('Failed to update tracking');
  return res.json();
}

export async function fetchAdminInventory(alertOnly = false) {
  const url = alertOnly ? `${API_BASE}/admin/inventory?alertOnly=true` : `${API_BASE}/admin/inventory`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function updateAdminStock(productId, availableQuantity, lowStockThreshold) {
  const res = await fetch(`${API_BASE}/admin/inventory/${encodeURIComponent(productId)}/stock`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity: availableQuantity,
      isAbsolute: true,
      lowStockThreshold: lowStockThreshold
    })
  });
  if (!res.ok) throw new Error('Failed to update inventory stock');
  return res.json();
}

export async function createAdminProduct(productData) {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function updateAdminProduct(productId, productData) {
  const res = await fetch(`${API_BASE}/admin/products/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteAdminProduct(productId) {
  const res = await fetch(`${API_BASE}/admin/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to remove product');
  return true;
}

export async function fetchAdminTickets(statusFilter) {
  const url = statusFilter ? `${API_BASE}/admin/support/tickets?status=${statusFilter}` : `${API_BASE}/admin/support/tickets`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch support tickets');
  return res.json();
}

export async function replyAdminTicket(ticketId, message) {
  const res = await fetch(`${API_BASE}/admin/support/tickets/${encodeURIComponent(ticketId)}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sender: 'ADMIN' })
  });
  if (!res.ok) throw new Error('Failed to send admin reply');
  return res.json();
}

export async function updateAdminTicketStatus(ticketId, status) {
  const res = await fetch(`${API_BASE}/admin/support/tickets/${encodeURIComponent(ticketId)}/status?status=${status}`, {
    method: 'PUT'
  });
  if (!res.ok) throw new Error('Failed to update ticket status');
  return res.json();
}

export async function clearAllAdminTickets() {
  const res = await fetch(`${API_BASE}/admin/support/tickets`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear tickets');
  return res.json();
}

export async function fetchAdminProducts() {
  const [prodRes, invRes] = await Promise.all([
    fetch(`${API_BASE}/products`),
    fetch(`${API_BASE}/admin/inventory`).catch(() => null)
  ]);
  if (!prodRes.ok) throw new Error('Failed to fetch products');
  const products = await prodRes.json();
  const inventory = invRes && invRes.ok ? await invRes.json() : [];

  const invMap = new Map();
  if (Array.isArray(inventory)) {
    inventory.forEach(inv => {
      if (inv.productId) invMap.set(inv.productId, inv);
    });
  }

  return products.map(p => {
    const inv = invMap.get(p.id);
    return {
      ...p,
      stockQuantity: inv ? inv.stockQuantity : (p.stockQuantity ?? 150),
      lowStockThreshold: inv ? inv.lowStockThreshold : (p.lowStockThreshold ?? 15),
      status: inv ? inv.status : (p.status || 'IN_STOCK')
    };
  });
}

// ==========================================
// CUSTOMER AUTH & REGISTRATION API (MYSQL)
// ==========================================

export async function registerCustomer(customerData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
}

export async function loginCustomer(credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (res.status === 503) {
      throw new Error('Backend server is suspended on Render (503 Service Unavailable).');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Sign in failed');
    }
    return data;
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
      throw new Error('Backend server is suspended or sleeping on Render. Please resume it on Render dashboard.');
    }
    throw err;
  }
}

export async function googleAuthCustomer(googleData) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(googleData)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Google authentication failed');
  }
  return data;
}

export async function fetchAdminCustomers() {
  const res = await fetch(`${API_BASE}/admin/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers list');
  return res.json();
}

export async function fetchAdminProfile() {
  const res = await fetch(`${API_BASE}/admin/profile`);
  if (!res.ok) throw new Error('Failed to fetch admin profile');
  return res.json();
}

export async function updateAdminProfile(profileData) {
  const res = await fetch(`${API_BASE}/admin/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  if (!res.ok) throw new Error('Failed to update admin profile in database');
  return res.json();
}

// Password Reset APIs via Brevo
export async function requestForgotPasswordOtp(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to send password reset code.');
  }
  return data;
}

export async function verifyPasswordOtp(email, otp) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Invalid or expired verification code.');
  }
  return data;
}

export async function resetCustomerPassword(email, otp, newPassword) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to reset password.');
  }
  return data;
}




