/**
 * Real-Time Customer Notification Service for Atomy India Web
 * Manages dynamically reconciled notifications based on actual user activity:
 * - Real Account Registration / Welcome with dynamic relative timestamp
 * - Real Order status events (Placed, In Transit, Delivered, Cancelled)
 * - Real Membership events
 * - Real Admin Announcements
 * - Automatic real-time relative time formatting (e.g. Just now, 10 minutes ago)
 */

export function formatRelativeTime(isoOrTimestamp) {
  if (!isoOrTimestamp) return 'Just now';
  try {
    const timestamp = typeof isoOrTimestamp === 'number'
      ? isoOrTimestamp
      : new Date(isoOrTimestamp).getTime();

    if (isNaN(timestamp)) return 'Just now';

    const diffMs = Date.now() - timestamp;
    if (diffMs < 0) return 'Just now';

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin === 1) return '1 minute ago';
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Recently';
  }
}

const getStorageKey = (userKey) => `atomy_customer_notifications_${(userKey || 'guest').toLowerCase().trim()}`;

export function getStoredNotifications(userKey) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = window.localStorage.getItem(getStorageKey(userKey));
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.warn('[NotificationService] Read failed:', err);
  }
  return [];
}

export function saveStoredNotifications(userKey, notifs) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(getStorageKey(userKey), JSON.stringify(notifs || []));
    }
  } catch (err) {
    console.warn('[NotificationService] Save failed:', err);
  }
}

/**
 * Reconcile notifications in real-time from active user profile and real placed orders
 */
export function reconcileCustomerNotifications(currentUser, placedOrders = []) {
  const userKey = (currentUser?.email || currentUser?.username || currentUser?.id || 'guest').toLowerCase().trim();
  const savedNotifs = getStoredNotifications(userKey);
  const readStatusMap = new Map();
  savedNotifs.forEach((n) => {
    if (n && n.id) {
      readStatusMap.set(n.id, n.unread === false ? false : true);
    }
  });

  const reconciled = [];

  // 1. Real Welcome Notification based on real signup timestamp
  if (currentUser && userKey !== 'guest') {
    let signupTimestamp = currentUser?.createdAt;
    if (!signupTimestamp && typeof window !== 'undefined' && window.localStorage) {
      signupTimestamp = window.localStorage.getItem(`atomy_user_signup_time_${userKey}`);
    }
    if (!signupTimestamp) {
      signupTimestamp = new Date().toISOString();
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`atomy_user_signup_time_${userKey}`, signupTimestamp);
        }
      } catch {}
    }

    const welcomeId = `welcome_${userKey}`;
    const isUnread = readStatusMap.has(welcomeId) ? readStatusMap.get(welcomeId) : true;

    reconciled.push({
      id: welcomeId,
      title: 'Special Customer Welcome!',
      message: `Welcome to Atomy India, ${currentUser?.name || 'Valued Customer'}! Explore Absolute Quality at Absolute Price across skincare, health, and living essentials.`,
      type: 'welcome',
      createdAt: signupTimestamp,
      time: formatRelativeTime(signupTimestamp),
      unread: isUnread
    });
  }

  // 2. Real Membership Notification if Member
  if (currentUser?.isMember || currentUser?.membership?.status === 'ACTIVE') {
    const memId = `membership_${userKey}`;
    const memCreatedAt = currentUser?.membership?.startDate || currentUser?.membershipEnrolledAt || currentUser?.createdAt || new Date().toISOString();
    const isUnread = readStatusMap.has(memId) ? readStatusMap.get(memId) : false;

    reconciled.push({
      id: memId,
      title: 'Distributor Membership Active',
      message: 'You have active distributor privileges! Enjoy exclusive wholesale Distributor Prices (DP) and accumulate 100% Personal PV points on all orders.',
      type: 'membership',
      createdAt: memCreatedAt,
      time: formatRelativeTime(memCreatedAt),
      unread: isUnread
    });
  }

  // 3. Real Placed Orders Notifications
  if (Array.isArray(placedOrders)) {
    placedOrders.forEach((ord) => {
      if (!ord || !ord.id) return;
      const orderIdStr = String(ord.id);
      const notifId = `order_${orderIdStr}`;
      const statusLower = (ord.status || ord.orderStatus || '').toLowerCase();
      const orderDate = ord.createdAt || ord.date || ord.orderDate || new Date().toISOString();

      let title = `Order #${orderIdStr} Confirmed & Placed`;
      let message = `Your order for ${ord.title || (ord.items && ord.items[0]?.name) || 'Atomy items'} totaling ${ord.total || '₹' + (ord.totalAmount || 0)} has been placed successfully.`;
      let type = 'order';

      if (statusLower.includes('cancel')) {
        title = `Order #${orderIdStr} Cancelled`;
        const isNonRefundable = ord.paymentStatus === 'NON_REFUNDABLE' || (ord.trackStatus || '').toLowerCase().includes('non-refundable');
        message = isNonRefundable
          ? `Order #${orderIdStr} was cancelled while in transit. Notice: As package already commenced transit, the cancellation amount is non-refundable (₹0 refund).`
          : `Order #${orderIdStr} was cancelled. Full refund has been initiated to your source payment method.`;
        type = 'order_cancelled';
      } else if (statusLower.includes('deliver') && !statusLower.includes('out')) {
        title = `Order #${orderIdStr} Delivered! 🎉`;
        message = `Your package containing ${ord.title || 'Atomy items'} was successfully delivered to your shipping address.`;
        type = 'order_delivered';
      } else if (statusLower.includes('transit') || statusLower.includes('out') || statusLower.includes('shipped')) {
        title = `Order #${orderIdStr} In Transit via ${ord.courier || 'Blue Dart'}`;
        message = `Your shipment is currently in transit${ord.awb ? ` (AWB: ${ord.awb})` : ''}. Expected delivery within 24-48 hours.`;
        type = 'order_transit';
      }

      const isUnread = readStatusMap.has(notifId) ? readStatusMap.get(notifId) : true;

      reconciled.push({
        id: notifId,
        orderId: orderIdStr,
        title,
        message,
        type,
        createdAt: orderDate,
        time: formatRelativeTime(orderDate),
        unread: isUnread
      });
    });
  }

  // 4. Real Admin Broadcasts (only if real broadcast announcements exist)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const rawAnnouncements = window.localStorage.getItem('atomy_broadcast_notifications');
      if (rawAnnouncements) {
        const broadcasts = JSON.parse(rawAnnouncements);
        if (Array.isArray(broadcasts)) {
          broadcasts.forEach((b) => {
            if (b && b.id && b.createdAt) {
              const bId = `broadcast_${b.id}`;
              const isUnread = readStatusMap.has(bId) ? readStatusMap.get(bId) : true;
              reconciled.push({
                id: bId,
                title: b.title || 'Platform Announcement',
                message: b.message || '',
                type: b.type || 'announcement',
                createdAt: b.createdAt,
                time: formatRelativeTime(b.createdAt),
                unread: isUnread
              });
            }
          });
        }
      }
    }
  } catch {}

  // Sort by createdAt descending (newest first)
  reconciled.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  saveStoredNotifications(userKey, reconciled);
  return reconciled;
}

export function markAllCustomerNotificationsAsRead(userKey, notifications = []) {
  const updated = notifications.map((n) => ({ ...n, unread: false }));
  saveStoredNotifications(userKey, updated);
  return updated;
}

export function markSingleNotificationRead(userKey, notifId, notifications = []) {
  const updated = notifications.map((n) => (n.id === notifId ? { ...n, unread: false } : n));
  saveStoredNotifications(userKey, updated);
  return updated;
}
