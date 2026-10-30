import { Platform } from 'react-native';
import { CLOUD_API_BASE, LOCAL_API_BASE } from './api';

/**
 * Storage key helper (scoped per user email)
 */
const getStorageKey = (email) => `atomy_notifications_${(email || 'guest').toLowerCase().trim()}`;

/**
 * Read locally stored notifications
 */
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

/**
 * Save locally stored notifications
 */
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
 * Format timestamp into user-friendly relative or calendar string
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently';
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
 * Fetch live notifications from backend API (queries Cloud & Local candidate bases)
 */
export const fetchNotificationsApi = async (email) => {
  if (!email || email === 'guest') return [];

  const candidateBases = [CLOUD_API_BASE, LOCAL_API_BASE];

  for (const base of candidateBases) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${base}/notifications?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
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
            type: r.type || 'general',
            orderId: r.orderId ? String(r.orderId) : null,
            unread: !r.isRead,
            createdAt: r.createdAt || new Date().toISOString(),
            time: formatRelativeTime(r.createdAt),
            timestamp: formatRelativeTime(r.createdAt),
          }));
        }
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  return null;
};

/**
 * Fetch live notifications and synchronize cache (authoritative, no hardcoding)
 */
export const fetchLiveNotifications = async (email) => {
  if (!email || email === 'guest') {
    return getStoredNotifications(email);
  }

  const remote = await fetchNotificationsApi(email);
  if (Array.isArray(remote)) {
    saveStoredNotifications(email, remote);
    return remote;
  }

  return getStoredNotifications(email);
};

/**
 * Backward compatibility hook: returns stored notifications without synthesizing fake ones
 */
export const reconcileNotifications = (email, user, orders = [], membershipExpiry = null) => {
  return getStoredNotifications(email);
};

/**
 * Add a new real action notification (syncs with backend & local cache)
 */
export const addNotification = async (email, notif) => {
  if (!email || email === 'guest') return [];

  const newNotif = {
    id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type: notif.type || 'general',
    orderId: notif.orderId ? String(notif.orderId) : null,
    title: notif.title || 'Atomy Notification',
    message: notif.message || '',
    unread: true,
    createdAt: new Date().toISOString(),
    time: 'Just now',
    timestamp: 'Just now',
  };

  const current = getStoredNotifications(email);
  const updated = [newNotif, ...current.filter((n) => n.id !== newNotif.id)];
  saveStoredNotifications(email, updated);

  // Broadcast to backend
  const candidateBases = [CLOUD_API_BASE, LOCAL_API_BASE];
  Promise.allSettled(
    candidateBases.map((base) =>
      fetch(`${base}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          orderId: newNotif.orderId,
        }),
      })
    )
  ).catch(() => {});

  return updated;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (email, notifId) => {
  const current = getStoredNotifications(email);
  const updated = current.map((n) => (n.id === notifId ? { ...n, unread: false } : n));
  saveStoredNotifications(email, updated);

  const candidateBases = [CLOUD_API_BASE, LOCAL_API_BASE];
  Promise.allSettled(
    candidateBases.map((base) =>
      fetch(`${base}/notifications/${notifId}/read`, { method: 'PUT' })
    )
  ).catch(() => {});

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
    const candidateBases = [CLOUD_API_BASE, LOCAL_API_BASE];
    Promise.allSettled(
      candidateBases.map((base) =>
        fetch(`${base}/notifications/read-all?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          method: 'PUT',
        })
      )
    ).catch(() => {});
  }

  return updated;
};

/**
 * Delete a single notification
 */
export const deleteNotification = async (email, notifId) => {
  const current = getStoredNotifications(email);
  const updated = current.filter((n) => n.id !== notifId);
  saveStoredNotifications(email, updated);

  const candidateBases = [CLOUD_API_BASE, LOCAL_API_BASE];
  Promise.allSettled(
    candidateBases.map((base) =>
      fetch(`${base}/notifications/${notifId}`, { method: 'DELETE' })
    )
  ).catch(() => {});

  return updated;
};

/**
 * Clear all notifications completely (permanently removes from backend and local cache)
 */
export const clearAllNotifications = async (email) => {
  saveStoredNotifications(email, []);

  if (email && email !== 'guest') {
    const candidateBases = [CLOUD_API_BASE, LOCAL_API_BASE];
    await Promise.allSettled(
      candidateBases.map((base) =>
        fetch(`${base}/notifications/clear?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          method: 'DELETE',
        })
      )
    ).catch(() => {});
  }

  return [];
};
