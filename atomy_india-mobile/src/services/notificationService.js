import { Platform } from 'react-native';
import { API_BASE } from './api';

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
export const reconcileNotifications = (email, user, orders = [], membershipExpiry = null) => {
  const currentSaved = getStoredNotifications(email);
  let newNotifications = [...currentSaved];

  // 1. Membership Expiration & Renewal Alerts
  if (membershipExpiry && membershipExpiry.status) {
    // Clear previous stale membership notifications
    newNotifications = newNotifications.filter((n) => !n.id.startsWith('notif_mem_'));

    if (membershipExpiry.status === 'EXPIRING_SOON') {
      const remainingDays = membershipExpiry.remainingDays || 2;
      const expiryDate = membershipExpiry.expiryDateStr || 'soon';
      const notifCreated = new Date().toISOString();
      newNotifications.unshift({
        id: `notif_mem_expiring_${remainingDays}d`,
        type: 'membership_expiring',
        title: `⚠️ Distributor Plan Expires in ${remainingDays} Day${remainingDays === 1 ? '' : 's'}`,
        message: `Your Atomy Distributor Membership plan expires on ${expiryDate}. Renew your plan today to prevent interruption to wholesale Distributor Price (DP) discounts and personal PV points.`,
        unread: true,
        isMembershipAlert: true,
        createdAt: notifCreated,
        time: formatRelativeTime(notifCreated),
        timestamp: formatRelativeTime(notifCreated),
      });
    } else if (membershipExpiry.status === 'EXPIRED') {
      const expiryDate = membershipExpiry.expiryDateStr || '';
      const notifCreated = new Date().toISOString();
      newNotifications.unshift({
        id: 'notif_mem_expired',
        type: 'membership_expired',
        title: '⛔ Distributor Membership Plan Expired',
        message: `Your Atomy Distributor plan has expired${expiryDate ? ` on ${expiryDate}` : ''}. Reactivate your plan now to restore wholesale DP pricing and PV point accumulation.`,
        unread: true,
        isMembershipAlert: true,
        createdAt: notifCreated,
        time: formatRelativeTime(notifCreated),
        timestamp: formatRelativeTime(notifCreated),
      });
    }
  }

  const existingIds = new Set(newNotifications.map((n) => n.id));

  // 2. Real Welcome / Sign Up Notification (with exact signup elapsed time)
  if (email && email !== 'guest' && user?.name && user.name !== 'Guest User') {
    const welcomeId = `welcome_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    let signupIso = user?.createdAt;
    if (!signupIso && typeof window !== 'undefined' && window.localStorage) {
      signupIso = window.localStorage.getItem(`atomy_user_signup_time_${email.toLowerCase()}`);
    }
    if (!signupIso) {
      signupIso = new Date().toISOString();
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(`atomy_user_signup_time_${email.toLowerCase()}`, signupIso);
        } catch {}
      }
    }

    if (!existingIds.has(welcomeId)) {
      newNotifications.unshift({
        id: welcomeId,
        type: 'welcome',
        title: 'Special Customer Welcome!',
        message: `Hello ${user.name}, welcome to Atomy India! Explore 100% genuine Korean health & skincare essentials at Absolute Quality, Absolute Price.`,
        unread: true,
        createdAt: signupIso,
        time: formatRelativeTime(signupIso),
        timestamp: formatRelativeTime(signupIso),
      });
      existingIds.add(welcomeId);
    }

    // 2b. Membership Active Welcome notification if user is a member
    if (user?.isMember) {
      const memActiveId = `notif_mem_active_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      if (!existingIds.has(memActiveId)) {
        const memDate = user?.membershipStartDate || signupIso;
        newNotifications.unshift({
          id: memActiveId,
          type: 'membership_active',
          title: '🎉 Distributor Membership Active',
          message: 'Your Atomy Distributor Membership is active. You have unlocked official wholesale Distributor Prices (DP) and 100% Personal PV accumulation.',
          unread: false,
          isMembershipAlert: true,
          createdAt: memDate,
          time: formatRelativeTime(memDate),
          timestamp: formatRelativeTime(memDate),
        });
        existingIds.add(memActiveId);
      }
    }
  }

  // 3. Orders Notifications (single latest status notification per order, with real timestamps)
  orders.forEach((ord) => {
    if (!ord || !ord.id) return;
    const orderNum = String(ord.id);
    const status = (ord.status || '').toLowerCase();

    // Parse order date safely
    let orderIso = new Date().toISOString();
    const rawDate = ord.createdAt || ord.date || ord.orderDate;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        orderIso = parsed.toISOString();
      }
    }
    const relativeTime = formatRelativeTime(orderIso);

    // Courier info without fake hardcoded fallbacks
    const courierInfo = ord.courier && ord.awb
      ? ` via ${ord.courier} (AWB: ${ord.awb})`
      : ord.courier
      ? ` via ${ord.courier}`
      : '';

    // Determine latest primary notification type for this order
    let notifType = 'order_placed';
    let title = `Order #${orderNum} Confirmed & Placed`;
    let message = `Your order for ${ord.title || 'Atomy items'} totaling ${ord.total || '₹0.00'} has been placed. Packaging and dispatch initiated.`;
    let isUnread = false;

    if (status.includes('cancel')) {
      notifType = 'order_cancelled';
      title = `Order #${orderNum} Cancelled`;
      const isNonRefundable = ord.paymentStatus === 'NON_REFUNDABLE' || (ord.trackStatus || '').toLowerCase().includes('non-refundable');
      message = isNonRefundable
        ? `Order #${orderNum} was cancelled while in transit. As transit had commenced, the cancellation amount is non-refundable (₹0 refund).`
        : `Order #${orderNum} was cancelled. A refund of ${ord.total || 'the full amount'} has been initiated to your source payment method.`;
      isUnread = true;
    } else if (status.includes('deliver') && !status.includes('out')) {
      notifType = 'order_delivered';
      title = `Order #${orderNum} Delivered! 🎉`;
      message = `Package containing ${ord.title || 'Atomy items'} was successfully delivered to your shipping address${courierInfo}.`;
      isUnread = true;
    } else if (status.includes('transit') || status.includes('out') || status.includes('dispatch') || status.includes('shipped')) {
      notifType = 'order_transit';
      title = `Order #${orderNum} Out for Delivery`;
      message = `Your package is on its way${courierInfo}. Expected delivery within 24-48 hours.`;
      isUnread = true;
    }

    const orderNotifId = `notif_order_${orderNum}`;
    const existingIndex = newNotifications.findIndex(
      (n) => n.id === orderNotifId || n.orderId === orderNum
    );

    if (existingIndex >= 0) {
      // Update with latest status if it evolved
      newNotifications[existingIndex] = {
        ...newNotifications[existingIndex],
        type: notifType,
        title,
        message,
        orderId: orderNum,
        time: relativeTime,
        timestamp: relativeTime,
      };
    } else {
      newNotifications.push({
        id: orderNotifId,
        type: notifType,
        orderId: orderNum,
        title,
        message,
        unread: isUnread,
        createdAt: orderIso,
        time: relativeTime,
        timestamp: relativeTime,
      });
      existingIds.add(orderNotifId);
    }
  });

  // Sort by createdAt descending (membership alerts stay pinned at top)
  newNotifications.sort((a, b) => {
    if (a.isMembershipAlert) return -1;
    if (b.isMembershipAlert) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

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
