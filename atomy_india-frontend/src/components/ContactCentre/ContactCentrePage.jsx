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
  X
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ATOMY_CENTRES, ATOMY_STATES } from '../../data/centresData';
import './ContactCentrePage.css';

export default function ContactCentrePage({ onNavigateHome }) {
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  // Initialize Leaflet Map
  useEffect(() => {
    if (activeTab !== 'centres' || !mapContainerRef.current) return;

    // Avoid duplicate initialization
    if (!mapInstanceRef.current) {
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
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
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

    // Invalidate size to ensure clean render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep instance intact during tab switches unless destroyed
    };
  }, [activeTab]);

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

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setOrderNo('');
    setMessage('');
    setIsSubmitted(false);
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
          /* 1:1 Inquiry Tab */
          <div className="inquiry-form-wrapper">
            {isSubmitted ? (
              <div className="inquiry-success-card">
                <CheckCircle2 size={60} color="#10b981" />
                <h3>Thank You! Your Inquiry Has Been Submitted.</h3>
                <p>
                  Inquiry Reference ID: <strong>INQ-{Date.now().toString().slice(-6)}</strong>
                </p>
                <p className="success-subtext">
                  Our Atomy India Customer Support team will review your inquiry and get back to you within 24 business hours at <strong>{email}</strong>.
                </p>
                <button
                  type="button"
                  className="submit-another-btn"
                  onClick={handleResetForm}
                >
                  Submit Another Inquiry
                </button>
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
        )}
      </div>
    </div>
  );
}
