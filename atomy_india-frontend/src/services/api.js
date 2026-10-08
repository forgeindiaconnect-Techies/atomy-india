const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';

// Customer APIs
export async function createCustomerOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to place order');
  }
  return res.json();
}

export async function getCustomerOrderTracking(orderId) {
  const res = await fetch(`${API_BASE}/tracking/${encodeURIComponent(orderId)}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Tracking for order "${orderId}" was not found.`);
    }
    throw new Error('Failed to retrieve tracking details');
  }
  return res.json();
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

