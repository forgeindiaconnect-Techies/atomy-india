import { Platform } from 'react-native';

const API_BASE = 'http://localhost:8085/api';

/**
 * Helper to get local storage safely across Web and React Native
 */
const getStorageKey = (email) => `atomy_notifications_${(email || 'guest').toLowerCase().trim()}`;

export const getStoredNotifications = (email) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = window.localStorage.getItem(getStorageKey(email));
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {
    console.warn('[NotificationService] Error reading local notifications:', e);
  }
  return [];
};

export const saveStoredNotifications = (email, notifications) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(getStorageKey(email), JSON.stringify(notifications || []));
    }
  } catch (e) {
    console.warn('[NotificationService] Error saving local notifications:', e);
  }
};

/**
 * Fetch notifications from backend API if available, falling back to local storage
 */
export const fetchNotificationsApi = async (email) => {
  if (!email) return [];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE}/notifications?email=${encodeURIComponent(email)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const remote = await res.json();
      if (Array.isArray(remote)) {
        return remote.map((r) => ({
          id: String(r.id),
          email: r.email,
          title: r.title,
          message: r.message,
          type: r.type,
          orderId: r.orderId,
          unread: !r.isRead,
          createdAt: r.createdAt || new Date().toISOString(),
          time: formatRelativeTime(r.createdAt),
        }));
      }
    }
  } catch (e) {
    // Backend offline or unreachable, smoothly fallback
  }
  return null;
};

/**
 * Format relative or readable timestamp
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
};

/**
 * Generate & reconcile dynamic notifications from real user session and placed orders
 */
export const reconcileNotifications = (email, user, orders = []) => {
  const currentSaved = getStoredNotifications(email);
  const existingIds = new Set(currentSaved.map((n) => n.id));
  const newNotifications = [...currentSaved];

  // 1. Welcome / New Login Notification (if user is signed in)
  if (email && email !== 'guest' && user?.name && user.name !== 'Guest User') {
    const welcomeId = `welcome_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    if (!existingIds.has(welcomeId)) {
      newNotifications.unshift({
        id: welcomeId,
        type: 'welcome',
        title: 'Welcome to Atomy India!',
        message: `Hello ${user.name}, you are successfully signed in. Enjoy 100% genuine Korean health & skincare essentials at official Member DP prices.`,
        unread: false,
        createdAt: new Date().toISOString(),
        time: 'Active Session',
      });
      existingIds.add(welcomeId);
    }
  }

  // 2. Orders Notifications (Placed, In Transit, Delivered, Cancelled)
  orders.forEach((ord) => {
    if (!ord || !ord.id) return;
    const orderNum = String(ord.id);
    const status = (ord.status || '').toLowerCase();

    // Notification for: Order Placed
    const placedId = `notif_placed_${orderNum}`;
    if (!existingIds.has(placedId)) {
      newNotifications.unshift({
        id: placedId,
        type: 'order_placed',
        orderId: orderNum,
        title: `Order #${orderNum} Confirmed & Placed`,
        message: `Your order for ${ord.title || 'Atomy items'} totaling ${ord.total || '₹0.00'} has been placed. Packaging and dispatch initiated.`,
        unread: false,
        createdAt: ord.date ? new Date().toISOString() : new Date().toISOString(),
        time: ord.date || 'Recent',
      });
      existingIds.add(placedId);
    }

    // Notification for: Order Delivered
    if (status.includes('deliver') && !status.includes('out')) {
      const deliveredId = `notif_delivered_${orderNum}`;
      if (!existingIds.has(deliveredId)) {
        newNotifications.unshift({
          id: deliveredId,
          type: 'order_delivered',
          orderId: orderNum,
          title: `Order #${orderNum} Delivered! 🎉`,
          message: `Package containing ${ord.title || 'Atomy items'} was successfully delivered to your shipping address via Blue Dart Express.`,
          unread: true,
          createdAt: new Date().toISOString(),
          time: 'Delivered',
        });
        existingIds.add(deliveredId);
      }
    }

    // Notification for: Out for Delivery / In Transit
    if (status.includes('transit') || status.includes('out') || status.includes('dispatch') || status.includes('shipped')) {
      const transitId = `notif_transit_${orderNum}`;
      if (!existingIds.has(transitId)) {
        newNotifications.unshift({
          id: transitId,
          type: 'order_transit',
          orderId: orderNum,
          title: `Order #${orderNum} Out for Delivery`,
          message: `Your package is on its way via ${ord.courier || 'Blue Dart Express'} (AWB: ${ord.awb || 'ATMY-EXP'}). Expected delivery within 24-48 hours.`,
          unread: true,
          createdAt: new Date().toISOString(),
          time: 'In Transit',
        });
        existingIds.add(transitId);
      }
    }

    // Notification for: Cancelled
    if (status.includes('cancel')) {
      const cancelId = `notif_cancelled_${orderNum}`;
      if (!existingIds.has(cancelId)) {
        newNotifications.unshift({
          id: cancelId,
          type: 'order_cancelled',
          orderId: orderNum,
          title: `Order #${orderNum} Cancelled`,
          message: `Order #${orderNum} was cancelled. A refund of ${ord.total || 'the full amount'} has been initiated to your source payment method.`,
          unread: true,
          createdAt: new Date().toISOString(),
          time: 'Cancelled',
        });
        existingIds.add(cancelId);
      }
    }
  });

  // Sort by createdAt descending
  newNotifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  saveStoredNotifications(email, newNotifications);
  return newNotifications;
};

/**
 * Add a new real-time notification
 */
export const addNotification = async (email, notif) => {
  const current = getStoredNotifications(email);
  const newNotif = {
    id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type: notif.type || 'general',
    orderId: notif.orderId || null,
    title: notif.title || 'Atomy Notification',
    message: notif.message || '',
    unread: true,
    createdAt: new Date().toISOString(),
    time: 'Just now',
  };

  const updated = [newNotif, ...current.filter((n) => n.id !== newNotif.id)];
  saveStoredNotifications(email, updated);

  // Send to backend if available
  if (email && email !== 'guest') {
    try {
      fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          orderId: newNotif.orderId,
        }),
      }).catch(() => {});
    } catch {}
  }

  return updated;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (email, notifId) => {
  const current = getStoredNotifications(email);
  const updated = current.map((n) => (n.id === notifId ? { ...n, unread: false } : n));
  saveStoredNotifications(email, updated);

  // Sync with backend if numeric ID
  if (/^\d+$/.test(notifId)) {
    try {
      fetch(`${API_BASE}/notifications/${notifId}/read`, { method: 'PUT' }).catch(() => {});
    } catch {}
  }
  return updated;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (email) => {
  const current = getStoredNotifications(email);
  const updated = current.map((n) => ({ ...n, unread: false }));
  saveStoredNotifications(email, updated);

  if (email && email !== 'guest') {
    try {
      fetch(`${API_BASE}/notifications/read-all?email=${encodeURIComponent(email)}`, {
        method: 'PUT',
      }).catch(() => {});
    } catch {}
  }
  return updated;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (email, notifId) => {
  const current = getStoredNotifications(email);
  const updated = current.filter((n) => n.id !== notifId);
  saveStoredNotifications(email, updated);

  if (/^\d+$/.test(notifId)) {
    try {
      fetch(`${API_BASE}/notifications/${notifId}`, { method: 'DELETE' }).catch(() => {});
    } catch {}
  }
  return updated;
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (email) => {
  saveStoredNotifications(email, []);
  if (email && email !== 'guest') {
    try {
      fetch(`${API_BASE}/notifications/clear?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {}
  }
  return [];
};
