import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Check,
  Search,
  Filter,
  Package,
  Truck,
  Clock,
  Headphones,
  Boxes,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  AlertTriangle,
  Building2,
  X
} from 'lucide-react';
import './DistributorNotificationsPage.css';

export default function DistributorNotificationsPage({
  distributorUser,
  isSubstitute = false,
  isSubstituteInCommand = false,
  isSubstituteStandby = false,
  orders = [],
  tickets = [],
  primaryManager = null,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
  onNavigateTab
}) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'ORDERS' | 'SUPPORT' | 'INVENTORY' | 'SYSTEM' | 'HISTORY'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionToast, setActionToast] = useState('');

  const showToast = (msg) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(''), 3000);
  };

  // Filter and search: ONLY SHOW UNREAD NOTIFICATIONS (before read only) across all active views
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // If we are on the Read History tab, show read items; otherwise, strictly only show BEFORE read (unread only)
      if (filterType === 'HISTORY') {
        if (!notif.read) return false;
      } else {
        if (notif.read) return false;
      }

      // Filter by category
      if (filterType === 'ORDERS' && !['order', 'pickup', 'delayed_order', 'delivery', 'cancellation'].includes(notif.type)) return false;
      if (filterType === 'SUPPORT' && notif.type !== 'support') return false;
      if (filterType === 'INVENTORY' && notif.type !== 'inventory') return false;
      if (filterType === 'SYSTEM' && !['handover', 'system'].includes(notif.type)) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (notif.title || '').toLowerCase().includes(q);
        const msgMatch = (notif.message || '').toLowerCase().includes(q);
        const idMatch = (notif.targetId || '').toLowerCase().includes(q);
        if (!titleMatch && !msgMatch && !idMatch) return false;
      }

      return true;
    });
  }, [notifications, filterType, searchQuery]);

  const counts = useMemo(() => {
    // Only count unread items for each active category so numbers drop to 0 when read
    const unread = notifications.filter(n => !n.read).length;
    const ordersCount = notifications.filter(n => !n.read && ['order', 'pickup', 'delayed_order', 'delivery', 'cancellation'].includes(n.type)).length;
    const supportCount = notifications.filter(n => !n.read && n.type === 'support').length;
    const inventoryCount = notifications.filter(n => !n.read && n.type === 'inventory').length;
    const systemCount = notifications.filter(n => !n.read && ['handover', 'system'].includes(n.type)).length;
    const historyCount = notifications.filter(n => n.read).length;
    return {
      all: unread,
      unread,
      orders: ordersCount,
      support: supportCount,
      inventory: inventoryCount,
      system: systemCount,
      history: historyCount
    };
  }, [notifications]);

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'cancellation':
        return <AlertTriangle size={18} />;
      case 'delayed_order':
        return <Clock size={18} />;
      case 'pickup':
        return <Building2 size={18} />;
      case 'delivery':
        return <CheckCircle2 size={18} />;
      case 'order':
        return <Package size={18} />;
      case 'support':
        return <Headphones size={18} />;
      case 'inventory':
        return <Boxes size={18} />;
      case 'handover':
        return <ShieldCheck size={18} />;
      case 'system':
      default:
        return <Bell size={18} />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'cancellation':
        return { label: 'ORDER CANCELLED', bg: '#ffe4e6', color: '#be123c' };
      case 'delayed_order':
        return { label: 'SLA DELAY ALERT', bg: '#fee2e2', color: '#b91c1c' };
      case 'pickup':
        return { label: 'COUNTER PICKUP', bg: '#dcfce7', color: '#15803d' };
      case 'delivery':
        return { label: 'COMPLETED', bg: '#ecfdf5', color: '#047857' };
      case 'order':
        return { label: 'CUSTOMER ORDER', bg: '#e0f2fe', color: '#0369a1' };
      case 'support':
        return { label: 'CUSTOMER TICKET', bg: '#fef3c7', color: '#b45309' };
      case 'inventory':
        return { label: 'STOCK ALERT', bg: '#ffedd5', color: '#c2410c' };
      case 'handover':
        return { label: 'COMMAND HANDOVER', bg: '#ede9fe', color: '#6d28d9' };
      case 'system':
      default:
        return { label: 'SYSTEM NOTICE', bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className="distributor-notifs-page animate-fade">
      {/* 1. Header Toolbar */}
      <div className="notifs-header-bar">
        <div className="notifs-header-left">
          <div className="notifs-title-cluster">
            <div className="notifs-icon-bubble">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="notifs-main-title">
                Notifications &amp; Activity Center
              </h2>
              <div className="notifs-subtitle">
                <span>{distributorUser?.businessName || distributorUser?.contactPerson || 'Regional Hub'}</span>
                <span className="bullet-sep">•</span>
                <span>PIN: <strong>{distributorUser?.primaryPincode || '635002'}</strong></span>
                {isSubstitute && (
                  <>
                    <span className="bullet-sep">•</span>
                    <span className="substitute-pill-tag">
                      {isSubstituteInCommand ? 'In Active Command' : 'Standby Relief Duty'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="notifs-header-right">
          <button
            type="button"
            className="notifs-action-btn read-all-btn"
            disabled={counts.unread === 0}
            onClick={() => {
              if (onMarkAllAsRead) onMarkAllAsRead();
              showToast('All notifications marked as read.');
            }}
            title="Mark all notifications as read"
          >
            <Check size={16} />
            <span>Mark All as Read</span>
          </button>

          <button
            type="button"
            className="notifs-action-btn clear-read-btn"
            disabled={notifications.filter(n => n.read).length === 0}
            onClick={() => {
              if (onClearAllNotifications) onClearAllNotifications();
              showToast('Read notifications cleared permanently.');
            }}
            title="Clear all read notification history"
          >
            <Trash2 size={16} />
            <span>Clear Read History</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="notifs-controls-card">
        <div className="notifs-search-input-wrap">
          <Search size={16} className="notifs-search-icon" />
          <input
            type="text"
            className="notifs-search-input"
            placeholder="Search by order ID, ticket, customer, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="notifs-search-clear"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="notifs-filter-pills-row">
          <button
            type="button"
            className={`notif-filter-pill ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            <span>All Active</span>
            {counts.all > 0 && <span className="pill-count">{counts.all}</span>}
          </button>

          <button
            type="button"
            className={`notif-filter-pill ${filterType === 'ORDERS' ? 'active' : ''}`}
            onClick={() => setFilterType('ORDERS')}
          >
            <span>Orders &amp; Logistics</span>
            {counts.orders > 0 && <span className="pill-count">{counts.orders}</span>}
          </button>

          <button
            type="button"
            className={`notif-filter-pill ${filterType === 'SUPPORT' ? 'active' : ''}`}
            onClick={() => setFilterType('SUPPORT')}
          >
            <span>Support Tickets</span>
            {counts.support > 0 && <span className="pill-count">{counts.support}</span>}
          </button>

          <button
            type="button"
            className={`notif-filter-pill ${filterType === 'INVENTORY' ? 'active' : ''}`}
            onClick={() => setFilterType('INVENTORY')}
          >
            <span>Stock Alerts</span>
            {counts.inventory > 0 && <span className="pill-count">{counts.inventory}</span>}
          </button>

          <button
            type="button"
            className={`notif-filter-pill ${filterType === 'SYSTEM' ? 'active' : ''}`}
            onClick={() => setFilterType('SYSTEM')}
          >
            <span>System &amp; Handover</span>
            {counts.system > 0 && <span className="pill-count">{counts.system}</span>}
          </button>

          <button
            type="button"
            className={`notif-filter-pill history-pill ${filterType === 'HISTORY' ? 'active' : ''}`}
            onClick={() => setFilterType('HISTORY')}
          >
            <span>Read History</span>
            {counts.history > 0 && <span className="pill-count">{counts.history}</span>}
          </button>
        </div>
      </div>

      {/* 3. Notification List Container */}
      <div className="notifs-list-container">
        {filteredNotifications.length === 0 ? (
          <div className="notifs-empty-card">
            <div className="notifs-empty-icon-wrap">
              <CheckCircle2 size={44} color="#10b981" />
            </div>
            <h3>
              {filterType === 'HISTORY'
                ? 'No read notifications in history'
                : "You're all caught up! No unread notifications"}
            </h3>
            <p>
              {searchQuery
                ? `No notifications found matching "${searchQuery}".`
                : filterType === 'HISTORY'
                  ? 'Notifications you mark as read or complete will appear in this history archive.'
                  : 'All hub notifications have been read and removed from the active view.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="notifs-reset-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear Search Query
              </button>
            )}
          </div>
        ) : (
          <div className="notifs-cards-stack">
            {filteredNotifications.map((notif) => {
              const badge = getTypeBadge(notif.type);
              const isUnread = !notif.read;

              return (
                <div
                  key={notif.id}
                  className={`notif-card-item ${isUnread ? 'is-unread' : 'is-read'} ${notif.type}`}
                  onClick={() => {
                    if (isUnread && onMarkAsRead) {
                      onMarkAsRead(notif.id);
                    }
                  }}
                >
                  <div className="notif-card-left">
                    <div className={`notif-type-icon-box ${notif.type}`}>
                      {getNotificationIcon(notif.type, notif.priority)}
                    </div>
                  </div>

                  <div className="notif-card-middle">
                    <div className="notif-card-meta-row">
                      <span
                        className="notif-type-badge"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                      <span className="notif-time-text">
                        {notif.time || (notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Recent')}
                      </span>
                      {isUnread ? (
                        <span className="notif-unread-dot" title="Unread notification" />
                      ) : (
                        <span className="notif-read-tag">Read</span>
                      )}
                    </div>

                    <h4 className="notif-card-title">{notif.title}</h4>
                    <p className="notif-card-body-text">{notif.message}</p>

                    {notif.targetId && (
                      <div className="notif-ref-tag">
                        Ref: <strong>{notif.targetId}</strong>
                      </div>
                    )}
                  </div>

                  <div className="notif-card-right-actions" onClick={(e) => e.stopPropagation()}>
                    {notif.targetTab && (
                      <button
                        type="button"
                        className="notif-row-btn primary-btn"
                        onClick={() => {
                          if (isUnread && onMarkAsRead) onMarkAsRead(notif.id);
                          if (onNavigateTab) onNavigateTab(notif.targetTab, null, notif.targetId);
                        }}
                        title={`Navigate to ${notif.targetTab}`}
                      >
                        <span>View Details</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    <button
                      type="button"
                      className={`notif-row-btn toggle-read-btn ${isUnread ? 'action-read' : 'action-unread'}`}
                      onClick={() => {
                        if (onMarkAsRead) onMarkAsRead(notif.id, !notif.read);
                        showToast(isUnread ? 'Marked as read & removed from active list' : 'Restored to unread notifications');
                      }}
                      title={isUnread ? 'Mark as read and remove from active list' : 'Restore to unread list'}
                    >
                      <Check size={14} />
                      <span>{isUnread ? 'Mark Read' : 'Restore'}</span>
                    </button>

                    <button
                      type="button"
                      className="notif-row-btn delete-btn"
                      onClick={() => {
                        if (onDeleteNotification) onDeleteNotification(notif.id);
                        showToast('Notification deleted');
                      }}
                      title="Permanently delete notification"
                    >
                      <Trash2 size={14} />
                      <span className="mobile-only-delete-text">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Toast Confirmation */}
      {actionToast && (
        <div className="notifs-live-toast">
          <CheckCircle2 size={16} color="#38bdf8" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
}
