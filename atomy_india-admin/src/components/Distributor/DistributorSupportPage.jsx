import React, { useState, useEffect, useMemo } from 'react';
import {
  Headphones,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  Phone,
  Mail,
  Package,
  Plus,
  RefreshCw,
  X,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MapPin,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Truck,
  IndianRupee
} from 'lucide-react';
import {
  processDistributorRefund,
  processDistributorReplacement
} from '../../services/distributorService';
import '../Admin/AdminDashboard.css';

const rawBase = (import.meta.env.VITE_API_BASE_URL || 'https://atomy-india-lqsy.onrender.com/api').trim().replace(/\/+$/, '');
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

export default function DistributorSupportPage({ distributor, orders = [], customers = [] }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Refund & Replacement Action States
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [refundReason, setRefundReason] = useState('Customer requested refund via support ticket');
  const [restockInventory, setRestockInventory] = useState(true);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const [replacementModalOrder, setReplacementModalOrder] = useState(null);
  const [replacementProductId, setReplacementProductId] = useState('');
  const [replacementReason, setReplacementReason] = useState('Damaged during delivery / package crushed');
  const [replacementNotes, setReplacementNotes] = useState('');
  const [isProcessingReplacement, setIsProcessingReplacement] = useState(false);

  // Modal: Log New Inquiry
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderId: '',
    category: 'ORDER_ISSUE',
    priority: 'MEDIUM',
    subject: '',
    message: ''
  });
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  const assignedPins = distributor?.assignedPincodes || [distributor?.primaryPincode].filter(Boolean);
  const territoryCustomerEmails = useMemo(() => {
    const set = new Set();
    (customers || []).forEach(c => c.email && set.add(c.email.toLowerCase().trim()));
    (orders || []).forEach(o => o.customerEmail && set.add(o.customerEmail.toLowerCase().trim()));
    return set;
  }, [customers, orders]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch support tickets from backend API
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/support/tickets`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTickets(data);
          if (data.length > 0 && !selectedTicket) {
            setSelectedTicket(data[0]);
          }
          return;
        }
      }
      // Fallback to local storage if API returned non-array
      const saved = localStorage.getItem('atomy_admin_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTickets(parsed);
          if (parsed.length > 0 && !selectedTicket) {
            setSelectedTicket(parsed[0]);
          }
        }
      }
    } catch (err) {
      console.warn('Using local tickets fallback:', err.message);
      const saved = localStorage.getItem('atomy_admin_tickets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTickets(Array.isArray(parsed) ? parsed : []);
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Status filter
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

      // Category filter
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = (t.ticketId || '').toLowerCase().includes(q);
        const matchName = (t.customerName || '').toLowerCase().includes(q);
        const matchEmail = (t.customerEmail || '').toLowerCase().includes(q);
        const matchPhone = (t.customerPhone || '').toLowerCase().includes(q);
        const matchSubject = (t.subject || '').toLowerCase().includes(q);
        const matchOrder = (t.orderId || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchEmail && !matchPhone && !matchSubject && !matchOrder) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, statusFilter, categoryFilter, searchQuery]);

  // Keep selected ticket in sync with updated list
  useEffect(() => {
    if (selectedTicket) {
      const match = tickets.find(t => (t.ticketId || t.id) === (selectedTicket.ticketId || selectedTicket.id));
      if (match) setSelectedTicket(match);
    }
  }, [tickets]);

  // Handle Update Status
  const handleUpdateStatus = async (ticketId, nextStatus) => {
    try {
      const res = await fetch(`${API_BASE}/admin/support/tickets/${encodeURIComponent(ticketId)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      // Update local state
      setTickets(prev => prev.map(t => {
        if ((t.ticketId || t.id) === ticketId) {
          return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return t;
      }));

      showToast(`Ticket #${ticketId} status updated to ${nextStatus}!`);
    } catch (err) {
      // Local fallback update
      setTickets(prev => prev.map(t => {
        if ((t.ticketId || t.id) === ticketId) {
          return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return t;
      }));
      showToast(`Ticket status updated to ${nextStatus}!`);
    }
  };

  // Handle Send Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setIsSubmittingReply(true);
    const ticketId = selectedTicket.ticketId || selectedTicket.id;
    const senderName = distributor?.businessName || distributor?.contactPerson || 'Regional Hub Support';

    const newMsgObj = {
      messageId: `MSG-${Date.now()}`,
      sender: 'ADMIN',
      senderName,
      message: replyMessage.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      await fetch(`${API_BASE}/admin/support/tickets/${encodeURIComponent(ticketId)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage.trim() })
      });

      // Update local list
      setTickets(prev => prev.map(t => {
        if ((t.ticketId || t.id) === ticketId) {
          const updatedMessages = [...(t.messages || []), newMsgObj];
          return {
            ...t,
            messages: updatedMessages,
            status: t.status === 'OPEN' ? 'IN_PROGRESS' : t.status,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      }));

      setReplyMessage('');
      showToast(`Response dispatched to customer ${selectedTicket.customerName}!`);
    } catch (err) {
      // Graceful local update
      setTickets(prev => prev.map(t => {
        if ((t.ticketId || t.id) === ticketId) {
          return {
            ...t,
            messages: [...(t.messages || []), newMsgObj],
            status: t.status === 'OPEN' ? 'IN_PROGRESS' : t.status,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      }));
      setReplyMessage('');
      showToast(`Response recorded for ticket #${ticketId}!`);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Quick Template Auto-Fill
  const handleApplyTemplate = (text) => {
    setReplyMessage(text);
  };

  const distId = distributor?.distributorId || distributor?.id || 'DIST-635002';

  // Find matching order in territory orders for selected ticket
  const matchedOrder = useMemo(() => {
    if (!selectedTicket) return null;
    if (selectedTicket.orderId) {
      const byId = (orders || []).find(o => String(o.orderId || o.id).toLowerCase() === String(selectedTicket.orderId).toLowerCase());
      if (byId) return byId;
    }
    if (selectedTicket.customerEmail) {
      const byEmail = (orders || []).find(o => (o.customerEmail || '').toLowerCase() === selectedTicket.customerEmail.toLowerCase());
      if (byEmail) return byEmail;
    }
    return null;
  }, [selectedTicket, orders]);

  const handleConfirmRefund = async () => {
    if (!refundModalOrder) return;
    setIsProcessingRefund(true);
    const orderId = refundModalOrder.orderId || refundModalOrder.id;
    try {
      await processDistributorRefund(orderId, distId, {
        reason: refundReason,
        restockInventory
      });

      if (selectedTicket) {
        const resolutionMsg = {
          messageId: `MSG-RES-${Date.now()}`,
          sender: 'ADMIN',
          senderName: `${distributor?.businessName || 'Regional Hub'} (Authorized Action)`,
          message: `✅ RETURN & REFUND APPROVED: A full refund of ₹${Number(refundModalOrder.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been processed for Order #${orderId}. Reason: ${refundReason}.${restockInventory ? ' Returned items have been restocked into Krishnagiri Hub Inventory.' : ''}`,
          timestamp: new Date().toISOString()
        };

        const ticketId = selectedTicket.ticketId || selectedTicket.id;
        try {
          await fetch(`${API_BASE}/admin/support/tickets/${encodeURIComponent(ticketId)}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resolutionMsg)
          });
          await fetch(`${API_BASE}/admin/support/tickets/${encodeURIComponent(ticketId)}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'RESOLVED' })
          });
        } catch (e) {
          console.warn('Ticket sync error:', e);
        }

        setTickets(prev => prev.map(t => {
          if ((t.ticketId || t.id) === ticketId) {
            return {
              ...t,
              status: 'RESOLVED',
              messages: [...(t.messages || []), resolutionMsg],
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        }));
      }

      showToast(`Return & Refund processed successfully for Order #${orderId}!`);
      setRefundModalOrder(null);
    } catch (err) {
      console.error('Failed to process refund:', err);
      showToast(err.message || 'Failed to process refund');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleConfirmReplacement = async () => {
    if (!replacementModalOrder) return;
    setIsProcessingReplacement(true);
    const orderId = replacementModalOrder.orderId || replacementModalOrder.id;
    try {
      await processDistributorReplacement(orderId, distId, {
        productId: replacementProductId,
        quantity: 1,
        reason: replacementReason,
        notes: replacementNotes
      });

      if (selectedTicket) {
        const resolutionMsg = {
          messageId: `MSG-REP-${Date.now()}`,
          sender: 'ADMIN',
          senderName: `${distributor?.businessName || 'Regional Hub'} (Authorized Action)`,
          message: `🔄 REPLACEMENT UNIT DISPATCHED: A replacement unit has been dispatched from Krishnagiri Hub stock for Order #${orderId}. Reason: ${replacementReason}.${replacementNotes ? ' Dispatch note: ' + replacementNotes : ''}`,
          timestamp: new Date().toISOString()
        };

        const ticketId = selectedTicket.ticketId || selectedTicket.id;
        try {
          await fetch(`${API_BASE}/admin/support/tickets/${encodeURIComponent(ticketId)}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resolutionMsg)
          });
          await fetch(`${API_BASE}/admin/support/tickets/${encodeURIComponent(ticketId)}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'RESOLVED' })
          });
        } catch (e) {
          console.warn('Ticket sync error:', e);
        }

        setTickets(prev => prev.map(t => {
          if ((t.ticketId || t.id) === ticketId) {
            return {
              ...t,
              status: 'RESOLVED',
              messages: [...(t.messages || []), resolutionMsg],
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        }));
      }

      showToast(`Replacement dispatched successfully for Order #${orderId}!`);
      setReplacementModalOrder(null);
    } catch (err) {
      console.error('Failed to dispatch replacement:', err);
      showToast(err.message || 'Failed to dispatch replacement');
    } finally {
      setIsProcessingReplacement(false);
    }
  };

  // Handle Create Manual Ticket
  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!newTicketForm.customerName || !newTicketForm.customerEmail || !newTicketForm.subject) {
      showToast('Please fill in customer name, email, and subject.');
      return;
    }

    setIsCreatingTicket(true);
    const newId = `TICK-${Date.now().toString().slice(-4)}`;
    const ticketPayload = {
      ticketId: newId,
      customerName: newTicketForm.customerName,
      customerEmail: newTicketForm.customerEmail,
      customerPhone: newTicketForm.customerPhone || '+91 98000 00000',
      orderId: newTicketForm.orderId || null,
      category: newTicketForm.category,
      priority: newTicketForm.priority,
      subject: newTicketForm.subject,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          messageId: `MSG-${Date.now()}`,
          sender: 'CUSTOMER',
          senderName: newTicketForm.customerName,
          message: newTicketForm.message || newTicketForm.subject,
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      await fetch(`${API_BASE}/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketPayload)
      });
    } catch (err) {
      console.warn('Saved ticket locally:', err.message);
    }

    setTickets(prev => [ticketPayload, ...prev]);
    setSelectedTicket(ticketPayload);
    setIsCreateModalOpen(false);
    setIsCreatingTicket(false);
    setNewTicketForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      orderId: '',
      category: 'ORDER_ISSUE',
      priority: 'MEDIUM',
      subject: '',
      message: ''
    });
    showToast(`Support Ticket #${newId} logged successfully!`);
  };

  // Metrics
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="admin-tab-content">
      {/* 1. Header Row */}
      <div className="content-heading-row with-filter">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Headphones size={13} />
            <span>Regional Customer Care &amp; Assistance Desk</span>
          </div>
          <h2 className="content-title">Customer Support &amp; Order Inquiries</h2>
          <p className="content-subtitle">
            Resolve delivery queries, damaged item reports, customer return assistance, and order inquiries for territory PIN: <strong>{distributor?.primaryPincode}</strong> ({distributor?.city || 'Regional Hub'}, {distributor?.state}).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="quick-refresh-btn"
            onClick={fetchTickets}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            title="Refresh Tickets"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn-create-category"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={16} />
            <span>+ Log Customer Inquiry</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', margin: '20px 0' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Total Inquiries</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>{tickets.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Lifetime customer tickets</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }}></span>
            <span>Awaiting Action</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c' }}>{openCount}</div>
          <div style={{ fontSize: '12px', color: '#9a3412', marginTop: '4px' }}>Open tickets requiring response</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>In Progress</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7' }}>{inProgressCount}</div>
          <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px' }}>Discussions actively underway</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Resolved / Closed</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a' }}>{resolvedCount}</div>
          <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>Successfully resolved inquiries</div>
        </div>
      </div>

      {/* 3. Toolbar: Search & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '260px' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by ticket ID, customer name, email, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13.5px' }}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={15} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', color: '#1e293b', fontWeight: 600 }}
          >
            <option value="ALL">All Statuses ({tickets.length})</option>
            <option value="OPEN">Open Only ({openCount})</option>
            <option value="IN_PROGRESS">In Progress ({inProgressCount})</option>
            <option value="RESOLVED">Resolved ({resolvedCount})</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', color: '#1e293b', fontWeight: 600 }}
          >
            <option value="ALL">All Categories</option>
            <option value="ORDER_ISSUE">Order Inquiries</option>
            <option value="DELIVERY_DELAY">Delivery &amp; Delay</option>
            <option value="DAMAGED_PRODUCT">Damaged / Missing Items</option>
            <option value="REFUND_REQUEST">Refunds &amp; Returns</option>
            <option value="PRODUCT_INQUIRY">Product Questions</option>
            <option value="GENERAL_SUPPORT">General Support</option>
          </select>
        </div>
      </div>

      {/* 4. Split-Pane Workspace */}
      {tickets.length === 0 ? (
        <div className="support-empty-state-box" style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Headphones size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Customer Support Inbox is Clear</h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '480px', margin: '0 auto 20px' }}>
            No customer inquiries logged yet for this regional hub territory. Any inquiries submitted via the customer storefront will appear here in real time.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            + Log First Customer Inquiry
          </button>
        </div>
      ) : (
        <div className="atomy-support-split" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '16px', minHeight: '620px' }}>
          {/* Left Column: Ticket List */}
          <div className="atomy-tickets-sidebar" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
              <span>INQUIRIES LIST</span>
              <span>{filteredTickets.length} Found</span>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, maxHeight: '600px' }}>
              {filteredTickets.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No tickets matched your filter.
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket && (selectedTicket.ticketId || selectedTicket.id) === (t.ticketId || t.id);
                  const isTerritoryCustomer = territoryCustomerEmails.has((t.customerEmail || '').toLowerCase().trim());
                  return (
                    <div
                      key={t.ticketId || t.id}
                      onClick={() => setSelectedTicket(t)}
                      style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isSelected ? '#f0f9ff' : '#ffffff',
                        borderLeft: isSelected ? '4px solid #0284c7' : '4px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>
                          #{t.ticketId || t.id}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: t.status === 'OPEN' ? '#fed7aa' : t.status === 'IN_PROGRESS' ? '#bae6fd' : '#bbf7d0',
                          color: t.status === 'OPEN' ? '#9a3412' : t.status === 'IN_PROGRESS' ? '#0369a1' : '#15803d'
                        }}>
                          {t.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.subject || 'Customer Support Request'}
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <User size={12} />
                        <span>{t.customerName || 'Customer'}</span>
                        {isTerritoryCustomer && (
                          <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' }}>
                            Territory
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{t.category ? t.category.replace('_', ' ') : 'Inquiry'}</span>
                        <span>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Conversation Thread Pane */}
          <div className="atomy-ticket-thread-pane" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedTicket ? (
              <>
                {/* Thread Header */}
                <div style={{ padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px' }}>
                          #{selectedTicket.ticketId || selectedTicket.id}
                        </span>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                          Category: {selectedTicket.category || 'General'}
                        </span>
                        {selectedTicket.orderId && (
                          <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#ede9fe', color: '#6d28d9' }}>
                            Order #{selectedTicket.orderId}
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                        {selectedTicket.subject || 'Customer Support Request'}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Status:</span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateStatus(selectedTicket.ticketId || selectedTicket.id, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, background: '#ffffff', color: '#0f172a' }}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Quick Info Card */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12.5px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} color="#0284c7" />
                      <strong>{selectedTicket.customerName || 'Customer'}</strong>
                    </div>

                    {selectedTicket.customerEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} color="#0284c7" />
                        <a href={`mailto:${selectedTicket.customerEmail}`} style={{ color: '#0284c7', textDecoration: 'none' }}>
                          {selectedTicket.customerEmail}
                        </a>
                      </div>
                    )}

                    {selectedTicket.customerPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="#0284c7" />
                        <a href={`tel:${selectedTicket.customerPhone}`} style={{ color: '#0284c7', textDecoration: 'none' }}>
                          {selectedTicket.customerPhone}
                        </a>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', color: '#94a3b8' }}>
                      <Clock size={13} />
                      <span>Logged: {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'Recent'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Return & Replacement Action Desk */}
                {(matchedOrder || selectedTicket.orderId || selectedTicket.category === 'REFUND_REQUEST' || selectedTicket.category === 'DAMAGED_PRODUCT') && (
                  <div style={{
                    margin: '12px 18px',
                    padding: '14px 18px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#e0f2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0284c7'
                      }}>
                        <Package size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                            Order #{matchedOrder ? (matchedOrder.orderId || matchedOrder.id) : (selectedTicket.orderId || 'Select Order')}
                          </strong>
                          {matchedOrder && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: String(matchedOrder.orderStatus).toUpperCase() === 'REFUNDED' ? '#fee2e2' : '#dcfce7',
                              color: String(matchedOrder.orderStatus).toUpperCase() === 'REFUNDED' ? '#dc2626' : '#15803d'
                            }}>
                              {matchedOrder.orderStatus || 'PLACED'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {matchedOrder ? (
                            <span>
                              Amount: <strong style={{ color: '#0f172a' }}>₹ {Number(matchedOrder.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                              {' • '}{(matchedOrder.items || []).length} item{(matchedOrder.items || []).length !== 1 ? 's' : ''}
                              {' • '}PIN: {matchedOrder.pincode}
                            </span>
                          ) : (
                            <span>Select a territory order below to issue refund or replacement</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {(!matchedOrder || (orders || []).length > 1) && (
                        <select
                          value={matchedOrder ? (matchedOrder.orderId || matchedOrder.id) : ''}
                          onChange={(e) => {
                            const found = orders.find(o => (o.orderId || o.id) === e.target.value);
                            if (found && selectedTicket) {
                              setSelectedTicket(prev => ({ ...prev, orderId: found.orderId || found.id }));
                            }
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            background: '#ffffff',
                            color: '#334155'
                          }}
                        >
                          <option value="">{matchedOrder ? 'Switch Order...' : 'Select Territory Order...'}</option>
                          {(orders || []).map(o => (
                            <option key={o.orderId || o.id} value={o.orderId || o.id}>
                              #{o.orderId || o.id} - ₹{Number(o.totalAmount || 0).toFixed(0)} ({o.customerName || 'Customer'})
                            </option>
                          ))}
                        </select>
                      )}

                      {matchedOrder && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setReplacementModalOrder(matchedOrder);
                              setReplacementProductId('');
                              setReplacementReason('Damaged during delivery / package crushed');
                              setReplacementNotes('');
                            }}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#7c3aed',
                              color: '#ffffff',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer'
                            }}
                            title="Dispatch replacement unit from hub stock"
                          >
                            <RefreshCw size={14} />
                            <span>Dispatch Replacement</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRefundModalOrder(matchedOrder);
                              setRefundReason('Customer requested refund via support ticket');
                              setRestockInventory(true);
                            }}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#dc2626',
                              color: '#ffffff',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer'
                            }}
                            title="Process return & refund to customer"
                          >
                            <RotateCcw size={14} />
                            <span>Process Return &amp; Refund</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Messages Stream */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', maxHeight: '420px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#fafafa' }}>
                  {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                    <div style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                        {selectedTicket.message || 'Customer submitted this inquiry.'}
                      </p>
                    </div>
                  ) : (
                    selectedTicket.messages.map((m, idx) => {
                      const isAdmin = m.sender === 'ADMIN';
                      return (
                        <div
                          key={m.messageId || idx}
                          style={{
                            alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            background: isAdmin ? '#0284c7' : '#ffffff',
                            color: isAdmin ? '#ffffff' : '#0f172a',
                            borderRadius: '12px',
                            borderTopRightRadius: isAdmin ? '2px' : '12px',
                            borderTopLeftRadius: isAdmin ? '12px' : '2px',
                            padding: '12px 16px',
                            border: isAdmin ? 'none' : '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{ fontSize: '11px', fontWeight: 700, color: isAdmin ? '#e0f2fe' : '#64748b', marginBottom: '4px' }}>
                            {isAdmin ? `${distributor?.businessName || 'Hub Logistics Support'} (You)` : selectedTicket.customerName}
                          </div>
                          <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.5' }}>
                            {m.message}
                          </p>
                          <div style={{ fontSize: '10.5px', textAlign: 'right', marginTop: '6px', color: isAdmin ? '#bae6fd' : '#94a3b8' }}>
                            {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Composer & Quick Templates */}
                <div style={{ padding: '16px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                  {/* Quick Chips */}
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', alignSelf: 'center' }}>QUICK:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('Hello, your parcel has been dispatched from our regional hub via Blue Dart express and will arrive tomorrow.')}
                      style={{ padding: '4px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '16px', fontSize: '11.5px', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Out for Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('We have verified your delivery address with our courier logistics partner. Expected delivery is within 24 hours.')}
                      style={{ padding: '4px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '16px', fontSize: '11.5px', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Address Verified
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('We apologize for the damaged packaging. A priority replacement unit has been allocated from our local warehouse.')}
                      style={{ padding: '4px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '16px', fontSize: '11.5px', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Replacement Dispatched
                    </button>
                  </div>

                  <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px' }}>
                    <textarea
                      rows={2}
                      placeholder={`Reply directly to ${selectedTicket.customerName || 'customer'}...`}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none', resize: 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReply || !replyMessage.trim()}
                      style={{
                        padding: '0 20px',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: isSubmittingReply || !replyMessage.trim() ? 'not-allowed' : 'pointer',
                        opacity: isSubmittingReply || !replyMessage.trim() ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Send size={15} />
                      <span>{isSubmittingReply ? 'Sending...' : 'Send'}</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px', color: '#94a3b8', fontSize: '14px' }}>
                Select a support inquiry from the left panel to review message thread.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Modal: Log Manual Customer Support Ticket */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Headphones size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Log Customer Inquiry / Call</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Record an offline call or inquiry received at your regional hub.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={newTicketForm.customerName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Customer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@gmail.com"
                    value={newTicketForm.customerEmail}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerEmail: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Customer Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newTicketForm.customerPhone}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerPhone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Related Order ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. AT-20261005-9281"
                    value={newTicketForm.orderId}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, orderId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="ORDER_ISSUE">Order Issue / Status</option>
                    <option value="DELIVERY_DELAY">Delivery Delay</option>
                    <option value="DAMAGED_PRODUCT">Damaged / Missing Item</option>
                    <option value="REFUND_REQUEST">Refund / Return Request</option>
                    <option value="PRODUCT_INQUIRY">Product Inquiry</option>
                    <option value="GENERAL_SUPPORT">General Support</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer inquiring about expected delivery time for Delhi Central PIN"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Initial Inquiry Details / Message</label>
                <textarea
                  rows={3}
                  placeholder="Provide customer notes, call details, or complaint description..."
                  value={newTicketForm.message}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTicket}
                  style={{ padding: '8px 20px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isCreatingTicket ? 'Saving...' : 'Register Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return & Refund Modal */}
      {refundModalOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={18} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Process Return &amp; Refund</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Order #{refundModalOrder.orderId || refundModalOrder.id}</div>
                </div>
              </div>
              <button type="button" onClick={() => setRefundModalOrder(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <strong>{refundModalOrder.customerName || 'Customer'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Refund Amount:</span>
                <strong style={{ color: '#dc2626', fontSize: '14px' }}>₹ {Number(refundModalOrder.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Return &amp; Refund Reason</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="Customer requested refund via support ticket">Customer requested refund via support ticket</option>
                <option value="Customer returned product to regional hub">Customer returned product to regional hub</option>
                <option value="Customer rejected delivery at doorstep">Customer rejected delivery at doorstep</option>
                <option value="Defective / damaged item returned">Defective / damaged item returned</option>
                <option value="Order cancelled by customer before delivery">Order cancelled by customer before delivery</option>
                <option value="Incorrect address / uncontactable customer">Incorrect address / uncontactable customer</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <input
                type="checkbox"
                id="restockInventoryCheckboxSupport"
                checked={restockInventory}
                onChange={(e) => setRestockInventory(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }}
              />
              <label htmlFor="restockInventoryCheckboxSupport" style={{ fontSize: '12.5px', color: '#065f46', fontWeight: 600, cursor: 'pointer' }}>
                Automatically Restock Items into Hub Inventory
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                disabled={isProcessingRefund}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: isProcessingRefund ? 'not-allowed' : 'pointer', opacity: isProcessingRefund ? 0.7 : 1 }}
              >
                {isProcessingRefund ? 'Processing...' : 'Confirm Return & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replacement Modal */}
      {replacementModalOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={18} color="#7c3aed" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Issue Replacement Unit</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Order #{replacementModalOrder.orderId || replacementModalOrder.id}</div>
                </div>
              </div>
              <button type="button" onClick={() => setReplacementModalOrder(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Select Product to Replace</label>
              <select
                value={replacementProductId}
                onChange={(e) => setReplacementProductId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="">All Items in Order (Full Replacement)</option>
                {(replacementModalOrder.items || []).map((it, idx) => (
                  <option key={it.productId || idx} value={it.productId}>
                    {it.productName || it.name || `Item ${idx + 1}`} (Qty: {it.quantity || 1})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Replacement Reason</label>
              <select
                value={replacementReason}
                onChange={(e) => setReplacementReason(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="Damaged during delivery / package crushed">Damaged during delivery / package crushed</option>
                <option value="Bottle seal leakage / defective container">Bottle seal leakage / defective container</option>
                <option value="Wrong product SKU dispatched by mistake">Wrong product SKU dispatched by mistake</option>
                <option value="Customer complaint verified & approved">Customer complaint verified & approved</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Hub Dispatch Notes (Optional)</label>
              <textarea
                value={replacementNotes}
                onChange={(e) => setReplacementNotes(e.target.value)}
                placeholder="e.g. Dispatched new sealed box via Blue Dart Express, AWB will follow."
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                * Replacement item will be automatically deducted from your hub stock inventory.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setReplacementModalOrder(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReplacement}
                disabled={isProcessingReplacement}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: isProcessingReplacement ? 'not-allowed' : 'pointer', opacity: isProcessingReplacement ? 0.7 : 1 }}
              >
                {isProcessingReplacement ? 'Dispatching...' : 'Dispatch Replacement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 10000 }}>
          <CheckCircle2 size={16} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

