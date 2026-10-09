import React, { useState } from 'react';
import { X, Headphones, Send, Search, CheckCircle2, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { submitSupportTicket, getSupportTicket, addCustomerTicketReply } from '../../services/api';
import './SupportModal.css';

export default function SupportModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'check'
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderId: '',
    category: 'GENERAL_SUPPORT',
    priority: 'MEDIUM',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdTicket, setCreatedTicket] = useState(null);

  // Status check state
  const [ticketSearchId, setTicketSearchId] = useState('');
  const [viewTicket, setViewTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewTicketSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fallbackId = `TCK-${Date.now().toString().slice(-6)}`;
    const ticketObj = {
      ticketId: fallbackId,
      customerName: formData.customerName || 'Customer',
      customerEmail: formData.customerEmail || 'customer@atomy.com',
      customerPhone: formData.customerPhone || '+91 98000 00000',
      orderId: formData.orderId || '',
      category: formData.category || 'GENERAL_SUPPORT',
      priority: formData.priority || 'HIGH',
      subject: formData.subject || `Inquiry from ${formData.customerName || 'Customer'}`,
      message: formData.message,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      messages: [
        {
          sender: 'CUSTOMER',
          message: formData.message,
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const backendPayload = {
        ...formData,
        initialMessage: formData.message,
        category: formData.category || 'GENERAL_SUPPORT'
      };
      const res = await submitSupportTicket(backendPayload);
      const ticketToSave = res || ticketObj;
      setCreatedTicket(ticketToSave);

      try {
        const existing = JSON.parse(localStorage.getItem('atomy_admin_tickets') || '[]');
        localStorage.setItem('atomy_admin_tickets', JSON.stringify([ticketToSave, ...existing]));
      } catch {}

      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({ type: 'NEW_TICKET', ticket: ticketToSave });
      } catch {}
      try {
        const supportChannel = new BroadcastChannel('atomy_support_channel');
        supportChannel.postMessage({ type: 'NEW_SUPPORT_TICKET', ticket: ticketToSave });
      } catch {}
    } catch (err) {
      // Offline fallback: save locally and broadcast
      setCreatedTicket(ticketObj);
      try {
        const existing = JSON.parse(localStorage.getItem('atomy_admin_tickets') || '[]');
        localStorage.setItem('atomy_admin_tickets', JSON.stringify([ticketObj, ...existing]));
      } catch {}
      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({ type: 'NEW_TICKET', ticket: ticketObj });
      } catch {}
      try {
        const supportChannel = new BroadcastChannel('atomy_support_channel');
        supportChannel.postMessage({ type: 'NEW_SUPPORT_TICKET', ticket: ticketObj });
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTicket = async (e) => {
    e.preventDefault();
    if (!ticketSearchId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getSupportTicket(ticketSearchId.trim());
      setViewTicket(res.data);
    } catch (err) {
      setViewTicket(null);
      setError(err.message || 'Ticket not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomerReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !viewTicket) return;
    setLoading(true);
    try {
      const res = await addCustomerTicketReply(viewTicket.ticketId, replyText.trim());
      setViewTicket(res.data);
      setReplyText('');
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-overlay" onClick={onClose}>
      <div className="support-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="support-header">
          <div className="support-header-title">
            <Headphones size={20} color="#00A3E0" />
            <span>Atomy India Customer Care & Help Desk</span>
          </div>
          <button className="support-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="support-tabs">
          <button
            className={`support-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => { setActiveTab('new'); setError(null); }}
          >
            Submit an Inquiry
          </button>
          <button
            className={`support-tab-btn ${activeTab === 'check' ? 'active' : ''}`}
            onClick={() => { setActiveTab('check'); setError(null); }}
          >
            Check Ticket Status
          </button>
        </div>

        {/* Body */}
        <div className="support-body">
          {error && (
            <div className="support-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'new' ? (
            createdTicket ? (
              <div className="support-success-card">
                <CheckCircle2 size={50} color="#16a34a" />
                <h3>Ticket Raised Successfully!</h3>
                <p>Our dedicated customer support team will review your inquiry shortly.</p>
                <div className="ticket-id-badge">
                  <span>Your Ticket ID:</span>
                  <strong>{createdTicket.ticketId}</strong>
                </div>
                <p className="ticket-id-hint">Keep this Ticket ID safe to track responses and reply to our executives.</p>
                <button
                  className="ticket-track-btn"
                  onClick={() => {
                    setTicketSearchId(createdTicket.ticketId);
                    setViewTicket(createdTicket);
                    setActiveTab('check');
                    setCreatedTicket(null);
                  }}
                >
                  View Conversation Thread
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewTicketSubmit} className="support-form">
                <div className="support-form-grid-2">
                  <div className="form-group">
                    <label>Your Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={formData.customerName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="customerEmail"
                      required
                      placeholder="e.g. priya@example.com"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="support-form-grid-2">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      placeholder="+91-..."
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Associated Order ID (If Any)</label>
                    <input
                      type="text"
                      name="orderId"
                      placeholder="e.g. ORD-20261001-..."
                      value={formData.orderId}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="support-form-grid-2">
                  <div className="form-group">
                    <label>Inquiry Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="support-select"
                    >
                      <option value="GENERAL_SUPPORT">General Support / Account</option>
                      <option value="ORDER_ISSUE">Order Issue</option>
                      <option value="DELIVERY_DELAY">Delivery Delay</option>
                      <option value="DAMAGED_PRODUCT">Damaged / Wrong Product</option>
                      <option value="REFUND_REQUEST">Refund / Return Request</option>
                      <option value="PRODUCT_INQUIRY">Product Inquiry / Ingredients</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="support-select"
                    >
                      <option value="LOW">Low - General Question</option>
                      <option value="MEDIUM">Medium - Standard Request</option>
                      <option value="HIGH">High - Urgent Issue</option>
                      <option value="URGENT">Urgent - Damaged / Missing Item</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Brief summary of your question or issue"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Message *</label>
                  <textarea
                    name="message"
                    rows="4"
                    required
                    placeholder="Describe how we can help you in detail..."
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <button type="submit" disabled={loading} className="support-submit-btn">
                  <Send size={16} />
                  {loading ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </form>
            )
          ) : (
            /* Check Ticket Tab */
            <div className="check-ticket-view">
              <form onSubmit={handleCheckTicket} className="check-ticket-search">
                <input
                  type="text"
                  placeholder="Enter Ticket ID (e.g. TICK-...)"
                  value={ticketSearchId}
                  onChange={(e) => setTicketSearchId(e.target.value)}
                  className="ticket-search-input"
                />
                <button type="submit" disabled={loading} className="ticket-search-btn">
                  <Search size={16} />
                  {loading ? 'Checking...' : 'Find Ticket'}
                </button>
              </form>

              {viewTicket && (
                <div className="ticket-thread-box">
                  <div className="ticket-info-header">
                    <div>
                      <span className="thread-ticket-id">{viewTicket.ticketId}</span>
                      <h4 className="thread-subject">{viewTicket.subject}</h4>
                      <div className="thread-meta">
                        <span>Category: {viewTicket.category}</span>
                        <span>•</span>
                        <span>Priority: {viewTicket.priority}</span>
                      </div>
                    </div>
                    <div className="thread-status-badge">{viewTicket.status}</div>
                  </div>

                  {/* Conversation Messages */}
                  <div className="messages-stream">
                    {viewTicket.messages?.map((msg, i) => (
                      <div
                        key={i}
                        className={`message-bubble-row ${msg.sender === 'CUSTOMER' ? 'from-customer' : 'from-admin'}`}
                      >
                        <div className="message-bubble">
                          <div className="message-sender-tag">
                            {msg.sender === 'CUSTOMER' ? 'You' : 'Atomy India Support (Admin)'}
                          </div>
                          <div className="message-text">{msg.message}</div>
                          <div className="message-time">
                            <Clock size={11} />
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer reply box */}
                  <form onSubmit={handleSendCustomerReply} className="reply-form">
                    <input
                      type="text"
                      placeholder="Type a follow-up message..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="reply-input"
                    />
                    <button type="submit" disabled={loading || !replyText.trim()} className="reply-send-btn">
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
