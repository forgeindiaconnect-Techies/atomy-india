import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  MessageSquare,
  Navigation,
  Globe,
  Share2,
  X,
  RefreshCw,
  User,
  Headphones,
  ShieldCheck,
  AlertCircle,
  Inbox
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ATOMY_CENTRES, ATOMY_STATES } from '../../data/centresData';
import { 
  submitSupportTicket, 
  getSupportTicket, 
  addCustomerTicketReply, 
  getCustomerTicketsByEmail 
} from '../../services/api';
import './ContactCentrePage.css';

export default function ContactCentrePage({ onNavigateHome, onNavigateBack, currentUser }) {
  const [activeTab, setActiveTab] = useState('centres'); // 'centres' | 'inquiry'
  const [selectedState, setSelectedState] = useState('All States');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCentre, setSelectedCentre] = useState(ATOMY_CENTRES[0]);

  // Leaflet map references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // 1:1 Inquiry Form state
  const [inquiryCategory, setInquiryCategory] = useState('Order & Delivery');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [orderNo, setOrderNo] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // 1:1 Tracking & Live Chat state
  const [inquirySubTab, setInquirySubTab] = useState('new'); // 'new' | 'track'
  const [ticketSearchInput, setTicketSearchInput] = useState('');
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [customerInquiriesList, setCustomerInquiriesList] = useState([]);
  const [isSearchingTicket, setIsSearchingTicket] = useState(false);
  const [ticketSearchError, setTicketSearchError] = useState('');
  const [customerReplyText, setCustomerReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (!name && currentUser.name) setName(currentUser.name);
      if (!email && currentUser.email) setEmail(currentUser.email);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Filter centres
  const filteredCentres = useMemo(() => {
    return ATOMY_CENTRES.filter((c) => {
      if (selectedState !== 'All States' && c.state !== selectedState) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = c.name.toLowerCase().includes(q);
        const inCity = c.city.toLowerCase().includes(q);
        const inAddr = c.address.toLowerCase().includes(q);
        const inLeader = c.leader.toLowerCase().includes(q);
        if (!inName && !inCity && !inAddr && !inLeader) return false;
      }
      return true;
    });
  }, [selectedState, searchQuery]);

  // Initialize Leaflet Map with robust teardown & unmount lifecycle
  useEffect(() => {
    if (activeTab !== 'centres' || !mapContainerRef.current) return;

    // Destroy any existing map instance to prevent duplicate initialization / memory lag
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (err) {}
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    mapInstanceRef.current = map;
    markersRef.current = {};

    // Custom Atomy pin icon
    const createCustomIcon = (isSelected = false) => {
      return L.divIcon({
        className: 'atomy-leaflet-div-icon',
        html: `
          <div class="custom-pin-marker ${isSelected ? 'active-pin' : ''}">
            <div class="pin-ring"></div>
            <div class="pin-head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    };

    // Add markers for all centres
    ATOMY_CENTRES.forEach((centre) => {
      if (centre.lat && centre.lng) {
        const isSelected = selectedCentre?.id === centre.id;
        const marker = L.marker([centre.lat, centre.lng], {
          icon: createCustomIcon(isSelected)
        }).addTo(map);

        marker.bindPopup(`
          <div class="leaflet-centre-popup">
            <span class="popup-badge">${centre.state}</span>
            <h4 class="popup-title">${centre.name}</h4>
            <p class="popup-addr">${centre.address}</p>
            <div class="popup-meta">
              <span>Leader: <strong>${centre.leader}</strong></span>
              <span>Tel: <a href="tel:${centre.phone}">+91 ${centre.phone}</a></span>
              <span>Hours: ${centre.hours}</span>
            </div>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${centre.name} ${centre.address}`)}" 
              target="_blank" 
              class="popup-directions"
            >
              Directions in Google Maps →
            </a>
          </div>
        `);

        marker.on('click', () => {
          setSelectedCentre(centre);
        });

        markersRef.current[centre.id] = marker;
      }
    });

    // Invalidate size cleanly
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {}
        mapInstanceRef.current = null;
      }
      markersRef.current = {};
    };
  }, [activeTab]);

  // Total unmount cleanup to guarantee zero memory leaks or background lag
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {}
        mapInstanceRef.current = null;
      }
      markersRef.current = {};
    };
  }, []);

  // When selectedCentre changes, fly to its coordinates and open its popup
  useEffect(() => {
    if (mapInstanceRef.current && selectedCentre?.lat && selectedCentre?.lng) {
      mapInstanceRef.current.flyTo([selectedCentre.lat, selectedCentre.lng], 13, {
        duration: 1.2
      });

      const marker = markersRef.current[selectedCentre.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedCentre]);

  const mapCategoryToEnum = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('order') || c.includes('delivery')) return 'ORDER_ISSUE';
    if (c.includes('product') || c.includes('ingredient')) return 'PRODUCT_INQUIRY';
    if (c.includes('refund') || c.includes('payment')) return 'REFUND_REQUEST';
    if (c.includes('damage')) return 'DAMAGED_PRODUCT';
    if (c.includes('delay')) return 'DELIVERY_DELAY';
    return 'GENERAL_SUPPORT';
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randFour = Math.floor(1000 + Math.random() * 9000);
    const uniformTicketId = `TCK-${todayStr}-${randFour}`;

    const backendCategory = mapCategoryToEnum(inquiryCategory);
    const backendPayload = {
      ticketId: uniformTicketId,
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim() || (currentUser?.phone || '+91 98000 00000'),
      orderId: orderNo.trim() || '',
      category: backendCategory,
      priority: 'HIGH',
      subject: `[${inquiryCategory || 'Support'}] Inquiry from ${name.trim()}`,
      initialMessage: message.trim(),
      message: message.trim()
    };

    let backendTicket = null;
    try {
      backendTicket = await submitSupportTicket(backendPayload);
    } catch (err) {
      console.warn('Backend ticket API warning:', err);
    }

    const ticketId = backendTicket?.ticketId || uniformTicketId;
    const newTicket = {
      ticketId,
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim() || (currentUser?.phone || '+91 98000 00000'),
      orderId: orderNo.trim() || '',
      category: backendCategory,
      priority: 'HIGH',
      subject: `[${inquiryCategory || 'Support'}] Inquiry from ${name.trim()}`,
      message: message.trim(),
      status: 'OPEN',
      createdAt: backendTicket?.createdAt || new Date().toISOString(),
      messages: backendTicket?.messages || [
        {
          sender: 'CUSTOMER',
          message: message.trim(),
          timestamp: new Date().toISOString()
        }
      ]
    };

    // 1. Store in localStorage across both admin and customer registries
    try {
      const existingAdmin = JSON.parse(localStorage.getItem('atomy_admin_tickets') || '[]');
      localStorage.setItem('atomy_admin_tickets', JSON.stringify([newTicket, ...existingAdmin]));
      const existingCustomer = JSON.parse(localStorage.getItem('atomy_customer_tickets') || '[]');
      localStorage.setItem('atomy_customer_tickets', JSON.stringify([newTicket, ...existingCustomer]));
    } catch (err) {}

    // 2. Broadcast immediately in real time across BroadcastChannel
    try {
      const syncChannel = new BroadcastChannel('atomy_sync_channel');
      syncChannel.postMessage({ type: 'NEW_TICKET', ticket: newTicket });
    } catch (err) {}
    try {
      const supportChannel = new BroadcastChannel('atomy_support_channel');
      supportChannel.postMessage({ type: 'NEW_SUPPORT_TICKET', ticket: newTicket });
    } catch (err) {}

    const finalTicket = backendTicket || newTicket;
    setSubmittedTicket(finalTicket);
    setTrackedTicket(finalTicket);
    setIsSubmitted(true);
    refreshCustomerTickets();
  };

  const handleResetForm = () => {
    setName(currentUser?.name || '');
    setEmail(currentUser?.email || '');
    setPhone(currentUser?.phone || '');
    setOrderNo('');
    setMessage('');
    setSubmittedTicket(null);
    setIsSubmitted(false);
  };

  // Fetch & synchronize customer's tickets
  const refreshCustomerTickets = async () => {
    const userEmail = email.trim() || currentUser?.email || '';
    let combined = [];

    // LocalStorage first
    try {
      const local = JSON.parse(localStorage.getItem('atomy_customer_tickets') || '[]');
      if (Array.isArray(local)) combined = [...local];
    } catch {}

    // Backend tickets by email if available
    if (userEmail) {
      try {
        const backendList = await getCustomerTicketsByEmail(userEmail);
        if (Array.isArray(backendList)) {
          backendList.forEach(bt => {
            const idx = combined.findIndex(c => c.ticketId === bt.ticketId);
            if (idx === -1) {
              combined.push(bt);
            } else {
              combined[idx] = bt;
            }
          });
        }
      } catch (err) {}
    }

    setCustomerInquiriesList(combined);
    return combined;
  };

  useEffect(() => {
    refreshCustomerTickets();
  }, [currentUser, email]);

  // Real-time polling when tracking a ticket
  useEffect(() => {
    if (activeTab !== 'inquiry' || inquirySubTab !== 'track' || !trackedTicket?.ticketId) return;

    const interval = setInterval(async () => {
      try {
        const fresh = await getSupportTicket(trackedTicket.ticketId);
        if (fresh && fresh.ticketId) {
          setTrackedTicket(prev => {
            if (!prev) return fresh;
            if (fresh.messages?.length !== prev.messages?.length || fresh.status !== prev.status) {
              return fresh;
            }
            return prev;
          });
        }
      } catch {}
    }, 3500);

    return () => clearInterval(interval);
  }, [activeTab, inquirySubTab, trackedTicket?.ticketId]);

  // Real-time cross-tab updates via BroadcastChannel
  useEffect(() => {
    let supportChannel;
    try {
      supportChannel = new BroadcastChannel('atomy_support_channel');
      supportChannel.onmessage = (event) => {
        const data = event.data;
        if (data && (data.type === 'TICKET_REPLY' || data.type === 'STATUS_UPDATE') && data.ticketId) {
          if (trackedTicket && trackedTicket.ticketId === data.ticketId) {
            getSupportTicket(data.ticketId).then(fresh => {
              if (fresh) setTrackedTicket(fresh);
            }).catch(() => {});
          }
        }
      };
    } catch {}

    return () => {
      if (supportChannel) {
        try { supportChannel.close(); } catch {}
      }
    };
  }, [trackedTicket?.ticketId]);

  // Handle Search / Track lookup
  const handleSearchTicket = async (e, forcedQuery) => {
    if (e && e.preventDefault) e.preventDefault();
    let query = (forcedQuery !== undefined ? forcedQuery : ticketSearchInput).trim();

    // If query is empty, auto-detect user's inquiries or load latest
    if (!query) {
      if (customerInquiriesList && customerInquiriesList.length > 0) {
        setTrackedTicket(customerInquiriesList[0]);
        setTicketSearchInput(customerInquiriesList[0].ticketId);
        setTicketSearchError('');
        return;
      }
      const fallbackEmail = email.trim() || currentUser?.email || '';
      if (fallbackEmail) {
        query = fallbackEmail;
      } else {
        setIsSearchingTicket(true);
        try {
          const allRecent = await getCustomerTicketsByEmail('');
          if (allRecent && allRecent.length > 0) {
            setCustomerInquiriesList(allRecent);
            setTrackedTicket(allRecent[0]);
            setTicketSearchInput(allRecent[0].ticketId);
            setTicketSearchError('');
            setIsSearchingTicket(false);
            return;
          }
        } catch {}
        setIsSearchingTicket(false);
        setTicketSearchError('Please enter a Ticket Reference ID or your Email address.');
        return;
      }
    }

    setIsSearchingTicket(true);
    setTicketSearchError('');

    try {
      // 1. Direct ticket ID lookup from backend
      try {
        const ticket = await getSupportTicket(query);
        if (ticket && ticket.ticketId) {
          setTrackedTicket(ticket);
          setTicketSearchInput(ticket.ticketId);
          setCustomerInquiriesList(prev => {
            const exists = prev.some(p => p.ticketId === ticket.ticketId);
            if (exists) return prev.map(p => p.ticketId === ticket.ticketId ? ticket : p);
            return [ticket, ...prev];
          });
          setIsSearchingTicket(false);
          return;
        }
      } catch (err) {}

      // 2. Email lookup
      if (query.includes('@')) {
        const tickets = await getCustomerTicketsByEmail(query);
        if (tickets && tickets.length > 0) {
          setCustomerInquiriesList(tickets);
          setTrackedTicket(tickets[0]);
          setTicketSearchInput(tickets[0].ticketId);
          setIsSearchingTicket(false);
          return;
        }
      }

      // 3. Fallback search across all recent tickets or local list
      try {
        const allRecent = await getCustomerTicketsByEmail('');
        if (allRecent && allRecent.length > 0) {
          const qLower = query.toLowerCase();
          const match = allRecent.find(t =>
            (t.ticketId && t.ticketId.toLowerCase().includes(qLower)) ||
            (t.customerEmail && t.customerEmail.toLowerCase().includes(qLower)) ||
            (t.subject && t.subject.toLowerCase().includes(qLower))
          );
          if (match) {
            setTrackedTicket(match);
            setTicketSearchInput(match.ticketId);
            setIsSearchingTicket(false);
            return;
          }
        }
      } catch (err) {}

      // 4. Local storage fallback
      const local = JSON.parse(localStorage.getItem('atomy_customer_tickets') || '[]');
      const match = local.find(t => 
        (t.ticketId && t.ticketId.toLowerCase().includes(query.toLowerCase())) ||
        (t.subject && t.subject.toLowerCase().includes(query.toLowerCase()))
      );

      if (match) {
        setTrackedTicket(match);
        setTicketSearchInput(match.ticketId);
        setIsSearchingTicket(false);
        return;
      }

      setTicketSearchError(`No inquiry found matching "${query}". Please check your Reference ID or Email.`);
    } catch (err) {
      setTicketSearchError('Unable to connect to support server. Please try again.');
    } finally {
      setIsSearchingTicket(false);
    }
  };

  // Customer replies to support
  const handleSendCustomerReply = async (e) => {
    e.preventDefault();
    if (!customerReplyText.trim() || !trackedTicket) return;

    const replyMsg = customerReplyText.trim();
    setIsSendingReply(true);

    const optimisticMsg = {
      sender: 'CUSTOMER',
      message: replyMsg,
      sentAt: new Date().toISOString()
    };

    const updatedTicket = {
      ...trackedTicket,
      messages: [...(trackedTicket.messages || []), optimisticMsg]
    };
    setTrackedTicket(updatedTicket);
    setCustomerReplyText('');

    try {
      await addCustomerTicketReply(trackedTicket.ticketId, replyMsg);
      const refreshed = await getSupportTicket(trackedTicket.ticketId);
      if (refreshed) {
        setTrackedTicket(refreshed);
        setCustomerInquiriesList(prev => prev.map(p => p.ticketId === refreshed.ticketId ? refreshed : p));
      }

      // Broadcast real-time message to admin dashboard across channels
      try {
        const supportChan = new BroadcastChannel('atomy_support_channel');
        supportChan.postMessage({ type: 'TICKET_REPLY', ticketId: trackedTicket.ticketId, ticket: refreshed || updatedTicket });
      } catch {}
      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({ type: 'TICKET_REPLY', ticketId: trackedTicket.ticketId, ticket: refreshed || updatedTicket });
      } catch {}
    } catch (err) {
      console.warn('Reply sync error:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="contact-centre-page">
      {/* 1. Breadcrumbs */}
      <div className="contact-breadcrumbs">
        <div className="container">
          <button onClick={onNavigateHome} className="breadcrumb-link">
            Home
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">Customer Support</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-active">Find Centre & Map</span>
        </div>
      </div>

      <div className="container contact-main-container">
        {/* 2. Page Header */}
        <div className="contact-page-header">
          <div className="contact-header-left">
            <h1 className="contact-page-title">Education Centre Map & Support</h1>
            <p className="contact-page-subtitle">
              Locate authorized Atomy India Education Centres across 15+ states with interactive map navigation and direct support.
            </p>
          </div>
          <div className="contact-hq-badge">
            <Building2 size={18} />
            <span>Corporate HQ: Gurugram, Haryana</span>
          </div>
        </div>

        {/* 3. Official Headquarters Info Strip */}
        <div className="contact-hq-card">
          <div className="hq-card-col">
            <div className="hq-icon-box">
              <Phone size={22} />
            </div>
            <div className="hq-info-content">
              <span className="hq-label">Customer Support Hotline</span>
              <strong className="hq-val">0124-695-9000</strong>
              <span className="hq-sub">Toll-Free: 1800-103-5555</span>
            </div>
          </div>

          <div className="hq-card-col">
            <div className="hq-icon-box">
              <Mail size={22} />
            </div>
            <div className="hq-info-content">
              <span className="hq-label">Direct Support Email</span>
              <strong className="hq-val">atomy_in@atomypark.com</strong>
              <span className="hq-sub">Mon-Fri 09:30 AM – 06:30 PM (IST)</span>
            </div>
          </div>

          <div className="hq-card-col">
            <div className="hq-icon-box">
              <MapPin size={22} />
            </div>
            <div className="hq-info-content">
              <span className="hq-label">Corporate Office</span>
              <strong className="hq-val">Sector 39, Gurugram</strong>
              <span className="hq-sub">801, 8th Floor, Tower B, Unitech Cyber Park</span>
            </div>
          </div>
        </div>

        {/* 4. Navigation Tabs */}
        <div className="contact-tabs-bar">
          <button
            type="button"
            className={`contact-tab-btn ${activeTab === 'centres' ? 'active' : ''}`}
            onClick={() => setActiveTab('centres')}
          >
            <MapPin size={17} />
            <span>Find Centre & Live Map ({ATOMY_CENTRES.length})</span>
          </button>
          <button
            type="button"
            className={`contact-tab-btn ${activeTab === 'inquiry' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiry')}
          >
            <MessageSquare size={17} />
            <span>1:1 Customer Support Desk</span>
          </button>
        </div>

        {/* 5. Tab Content */}
        {activeTab === 'centres' ? (
          <div className="centres-view-layout">
            {/* Filter controls */}
            <div className="centres-filter-bar">
              <div className="filter-state-select-wrap">
                <Filter size={16} className="filter-icon" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="state-dropdown"
                >
                  {ATOMY_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by centre name, city, address, or leader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="centre-search-input"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="centres-count-indicator">
                Showing <strong>{filteredCentres.length}</strong> centres across India
              </div>
            </div>

            {/* REAL INTERACTIVE LEAFLET MAP SECTION */}
            <div className="real-leaflet-map-wrapper">
              <div className="map-top-bar">
                <div className="map-bar-title">
                  <Navigation size={16} color="#00A3E0" />
                  <span>Interactive Map • Click any pin or list card to zoom</span>
                </div>
                {selectedCentre && (
                  <div className="map-active-target">
                    Currently Viewing: <strong>{selectedCentre.name} ({selectedCentre.city})</strong>
                  </div>
                )}
              </div>

              {/* The Leaflet Map DOM Container */}
              <div 
                ref={mapContainerRef} 
                className="leaflet-interactive-map-canvas"
                style={{ height: '420px', width: '100%', borderRadius: '0 0 12px 12px' }}
              />
            </div>

            {/* Split layout: Selected Centre Detail Panel & Scrollable List */}
            <div className="centres-main-grid">
              {/* Left Column: Centre Detail Preview */}
              {selectedCentre && (
                <div className="centre-preview-panel">
                  <div className="preview-header">
                    <span className="state-badge">{selectedCentre.state}</span>
                    <h3 className="preview-title">{selectedCentre.name}</h3>
                  </div>

                  <div className="preview-details-list">
                    <div className="preview-detail-row">
                      <MapPin size={18} className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Full Address</span>
                        <p className="detail-text">{selectedCentre.address}</p>
                      </div>
                    </div>

                    <div className="preview-detail-row">
                      <Phone size={18} className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Contact Phone</span>
                        <p className="detail-text">
                          <a href={`tel:${selectedCentre.phone}`} className="phone-link">
                            +91 {selectedCentre.phone}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="preview-detail-row">
                      <Building2 size={18} className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Centre Leader</span>
                        <p className="detail-text">{selectedCentre.leader}</p>
                      </div>
                    </div>

                    <div className="preview-detail-row">
                      <Clock size={18} className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Operating Hours</span>
                        <p className="detail-text">{selectedCentre.hours}</p>
                      </div>
                    </div>
                  </div>

                  <div className="preview-actions-bar">
                    <a
                      href={`tel:${selectedCentre.phone}`}
                      className="centre-action-call"
                    >
                      <Phone size={15} />
                      <span>Call Centre</span>
                    </a>
                    {selectedCentre.whatsapp && (
                      <a
                        href={`https://api.whatsapp.com/send?phone=${selectedCentre.whatsapp}&text=Hello%20Atomy%20${encodeURIComponent(selectedCentre.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="centre-action-whatsapp"
                      >
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedCentre.name} ${selectedCentre.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="centre-action-directions"
                    >
                      <ExternalLink size={14} />
                      <span>Google Maps</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Right Column: Centres Directory Cards */}
              <div className="centres-cards-scroll">
                {filteredCentres.length === 0 ? (
                  <div className="no-centres-found">
                    <MapPin size={40} className="empty-pin-icon" />
                    <h4>No Education Centres Found</h4>
                    <p>Try searching with another keyword or select "All States".</p>
                    <button
                      type="button"
                      className="reset-filters-btn"
                      onClick={() => {
                        setSelectedState('All States');
                        setSearchQuery('');
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  filteredCentres.map((centre) => {
                    const isSelected = selectedCentre?.id === centre.id;
                    return (
                      <div
                        key={centre.id}
                        className={`centre-list-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedCentre(centre)}
                      >
                        <div className="card-top-row">
                          <span className="card-city-tag">{centre.city}</span>
                          <span className="card-state-tag">{centre.state}</span>
                        </div>

                        <h4 className="card-centre-name">{centre.name}</h4>
                        <p className="card-centre-address">{centre.address}</p>

                        <div className="card-meta-row">
                          <span className="card-leader">
                            Leader: <strong>{centre.leader}</strong>
                          </span>
                          <span className="card-phone">
                            <Phone size={12} /> {centre.phone}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 1:1 Inquiry & Tracking Hub */
          <div className="inquiry-hub-wrapper">
            {/* Sub-tabs header */}
            <div className="inquiry-subtabs-header">
              <button
                type="button"
                className={`inquiry-subtab-btn ${inquirySubTab === 'new' ? 'active' : ''}`}
                onClick={() => {
                  setInquirySubTab('new');
                  setIsSubmitted(false);
                }}
              >
                <Send size={15} />
                <span>Submit 1:1 Inquiry</span>
              </button>
              <button
                type="button"
                className={`inquiry-subtab-btn ${inquirySubTab === 'track' ? 'active' : ''}`}
                onClick={() => {
                  setInquirySubTab('track');
                  refreshCustomerTickets().then(list => {
                    if (!trackedTicket && list && list.length > 0) {
                      setTrackedTicket(list[0]);
                      setTicketSearchInput(list[0].ticketId);
                    }
                  });
                }}
              >
                <MessageSquare size={15} />
                <span>Track Inquiries & Live Replies</span>
                {customerInquiriesList.length > 0 && (
                  <span className="subtab-counter-badge">{customerInquiriesList.length}</span>
                )}
              </button>
            </div>

            {inquirySubTab === 'new' ? (
              <div className="inquiry-form-wrapper">
                {isSubmitted ? (
                  <div className="inquiry-success-card">
                    <CheckCircle2 size={60} color="#10b981" />
                    <h3>Thank You! Your Inquiry Has Been Submitted.</h3>
                    <p>
                      Inquiry Reference ID: <strong>{submittedTicket?.ticketId || `TCK-${Date.now().toString().slice(-6)}`}</strong>
                    </p>
                    <p className="success-subtext">
                      Our Atomy India Customer Support team will review your inquiry and get back to you within 24 business hours at <strong>{email}</strong>.
                    </p>
                    <div className="inquiry-success-actions">
                      <button
                        type="button"
                        className="view-thread-primary-btn"
                        onClick={() => {
                          setTrackedTicket(submittedTicket);
                          setTicketSearchInput(submittedTicket?.ticketId || '');
                          setInquirySubTab('track');
                          setIsSubmitted(false);
                        }}
                      >
                        <MessageSquare size={16} />
                        <span>View Live Chat & Track Replies</span>
                      </button>
                      <button
                        type="button"
                        className="submit-another-btn"
                        onClick={handleResetForm}
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="inquiry-form">
                    <div className="form-intro-banner">
                      <MessageSquare size={20} color="#00A3E0" />
                      <div>
                        <h4>1:1 Customer Support Desk</h4>
                        <p>Submit inquiries regarding orders, products, commissions, or membership verification.</p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field full-width">
                        <label>Inquiry Category *</label>
                        <select
                          value={inquiryCategory}
                          onChange={(e) => setInquiryCategory(e.target.value)}
                          className="form-input"
                        >
                          <option value="Order & Delivery">Order & Delivery Inquiries</option>
                          <option value="Product Details & Quality">Product Details & Usage Guide</option>
                          <option value="Membership & Verification">Membership, Verification & KYC</option>
                          <option value="Commission & PV Points">Commission & PV Points</option>
                          <option value="Returns & Exchanges">Returns, Replacements & Refunds</option>
                          <option value="Education Centre Guidance">Education Centre Guidance</option>
                          <option value="Other Inquiries">General / Other Inquiries</option>
                        </select>
                      </div>

                      <div className="form-field">
                        <label>Your Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="form-input"
                        />
                      </div>

                      <div className="form-field">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          placeholder="e.g. rahul@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="form-input"
                        />
                      </div>

                      <div className="form-field">
                        <label>Phone Number (Optional)</label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="form-field">
                        <label>Related Order No. (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. AT20261005-9281"
                          value={orderNo}
                          onChange={(e) => setOrderNo(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="form-field full-width">
                        <label>Message / Description *</label>
                        <textarea
                          rows={5}
                          placeholder="Please provide complete details regarding your query so we can assist you promptly..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          className="form-input textarea"
                        />
                      </div>
                    </div>

                    <div className="form-submit-row">
                      <button type="submit" className="submit-inquiry-btn">
                        <Send size={16} />
                        <span>Submit 1:1 Inquiry</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* Track Inquiries & Live Replies View */
              <div className="tracker-view-wrapper">
                {/* Search / Lookup Bar */}
                <div className="tracker-search-card">
                  <div className="tracker-search-header">
                    <div>
                      <h4>Track Inquiry & View Support Replies</h4>
                      <p>Enter your Reference ID (e.g. <code>TICK-20261009-568</code>) or registered Email to view conversation history and reply live.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSearchTicket} className="tracker-search-form">
                    <div className="tracker-search-input-wrap">
                      <Search size={18} className="tracker-search-icon" />
                      <input
                        type="text"
                        placeholder="Inquiry Reference ID or Email..."
                        value={ticketSearchInput}
                        onChange={(e) => setTicketSearchInput(e.target.value)}
                        className="tracker-search-input"
                      />
                    </div>
                    <button type="submit" disabled={isSearchingTicket} className="tracker-search-btn">
                      {isSearchingTicket ? <RefreshCw size={15} className="spinner" /> : <Search size={15} />}
                      <span>Track Inquiry</span>
                    </button>
                  </form>

                  {ticketSearchError && (
                    <div className="tracker-error-alert">
                      <AlertCircle size={16} />
                      <span>{ticketSearchError}</span>
                    </div>
                  )}

                  {/* Recent Inquiries Quick Buttons */}
                  {customerInquiriesList.length > 0 && (
                    <div className="tracker-recent-inquiries-bar">
                      <span className="recent-label">Your Inquiries:</span>
                      <div className="recent-chips-scroll">
                        {customerInquiriesList.map((t) => {
                          const isSel = trackedTicket?.ticketId === t.ticketId;
                          return (
                            <button
                              key={t.ticketId}
                              type="button"
                              className={`tracker-chip-btn ${isSel ? 'active' : ''}`}
                              onClick={() => {
                                setTrackedTicket(t);
                                setTicketSearchInput(t.ticketId);
                                setTicketSearchError('');
                              }}
                            >
                              <span className="chip-ticket-id">{t.ticketId}</span>
                              <span className={`chip-status-tag ${(t.status || '').toLowerCase()}`}>
                                {t.status}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tracked Ticket Chat Thread */}
                {trackedTicket ? (
                  <div className="tracker-thread-card">
                    <div className="tracker-thread-header">
                      <div className="tracker-header-left">
                        <div className="tracker-badges-row">
                          <span className="tracker-ticket-id-badge">{trackedTicket.ticketId}</span>
                          <span className={`tracker-status-badge ${(trackedTicket.status || '').toLowerCase()}`}>
                            <span className="status-live-dot"></span>
                            {trackedTicket.status === 'OPEN' ? 'WAITING FOR SUPPORT' :
                             trackedTicket.status === 'IN_PROGRESS' ? 'IN PROGRESS (ACTIVE)' :
                             trackedTicket.status === 'RESOLVED' ? 'RESOLVED' :
                             trackedTicket.status || 'OPEN'}
                          </span>
                          <span className="tracker-connected-pill">
                            <span className="pulse-green-dot"></span> Live Support Connected
                          </span>
                        </div>
                        <h3 className="tracker-subject">{trackedTicket.subject}</h3>
                        <div className="tracker-meta-row">
                          <span>Category: <strong>{trackedTicket.category}</strong></span>
                          <span>•</span>
                          <span>Raised: {new Date(trackedTicket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          {trackedTicket.orderId && (
                            <>
                              <span>•</span>
                              <span>Order Ref: <strong>{trackedTicket.orderId}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="tracker-refresh-btn"
                        onClick={() => handleSearchTicket(null, trackedTicket.ticketId)}
                        title="Refresh Conversation"
                      >
                        <RefreshCw size={14} />
                        <span>Refresh Chat</span>
                      </button>
                    </div>

                    {/* Messages Stream */}
                    <div className="tracker-messages-stream">
                      {trackedTicket.messages && trackedTicket.messages.length > 0 ? (
                        trackedTicket.messages.map((msg, idx) => {
                          const isAdmin = msg.sender === 'ADMIN';
                          return (
                            <div
                              key={idx}
                              className={`tracker-message-row ${isAdmin ? 'from-support' : 'from-customer'}`}
                            >
                              <div className="tracker-bubble">
                                <div className="tracker-bubble-author">
                                  {isAdmin ? (
                                    <>
                                      <Headphones size={13} color="#00A3E0" />
                                      <span>Atomy Operations Support (Agent Reply)</span>
                                    </>
                                  ) : (
                                    <>
                                      <User size={13} />
                                      <span>{trackedTicket.customerName || 'You'} (Customer)</span>
                                    </>
                                  )}
                                </div>
                                <div className="tracker-bubble-text">{msg.message}</div>
                                <div className="tracker-bubble-time">
                                  {new Date(msg.sentAt || msg.createdAt || msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="tracker-empty-messages">
                          <MessageSquare size={32} color="#94a3b8" />
                          <p>No messages recorded yet in this inquiry.</p>
                        </div>
                      )}
                    </div>

                    {/* Reply Form */}
                    <form onSubmit={handleSendCustomerReply} className="tracker-reply-form">
                      <input
                        type="text"
                        placeholder="Type your reply to Atomy Support..."
                        value={customerReplyText}
                        onChange={(e) => setCustomerReplyText(e.target.value)}
                        disabled={isSendingReply || trackedTicket.status === 'CLOSED'}
                        className="tracker-reply-input"
                      />
                      <button
                        type="submit"
                        disabled={!customerReplyText.trim() || isSendingReply || trackedTicket.status === 'CLOSED'}
                        className="tracker-reply-btn"
                      >
                        <Send size={15} />
                        <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="tracker-no-ticket-selected">
                    <Inbox size={48} color="#94a3b8" />
                    <h4>Select or Track an Inquiry</h4>
                    <p>Enter your Inquiry Reference ID above to see live updates and agent replies from our support desk.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
