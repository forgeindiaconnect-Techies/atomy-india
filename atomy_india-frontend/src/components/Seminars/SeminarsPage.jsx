import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Video,
  Award,
  Users,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Ticket,
  CheckCircle2,
  X
} from 'lucide-react';
import './SeminarsPage.css';

const UPCOMING_SEMINARS = [
  {
    id: 'SEM-101',
    type: 'success_academy',
    typeLabel: 'Success Academy',
    badgeClass: 'badge-academy',
    title: 'All-India Grand Success Academy 2026',
    date: '2026-10-24 & 25',
    time: '10:00 AM - 06:00 PM IST',
    city: 'New Delhi',
    venue: 'Indira Gandhi Indoor Arena, ITO, New Delhi - 110002',
    speaker: 'Imperial Master Lee & Special Korean Delegation',
    status: 'OPEN',
    seatsAvailable: 340,
    highlights: 'Imperial Master Keynote, Mastership Pin Award Ceremony, Life Scenario Formulation Workshop, Exclusive delegate gifts.'
  },
  {
    id: 'SEM-102',
    type: 'one_day',
    typeLabel: 'One Day Seminar',
    badgeClass: 'badge-oneday',
    title: 'Mumbai Regional One Day Seminar',
    date: '2026-10-14',
    time: '01:30 PM - 05:30 PM IST',
    city: 'Mumbai',
    venue: 'CIDCO Exhibition Centre, Hall 1, Vashi, Navi Mumbai - 400703',
    speaker: 'Crown Master Rajesh Sharma & Dr. Kim',
    status: 'OPEN',
    seatsAvailable: 120,
    highlights: 'Product science breakdown (HemoHIM & Absolute Skincare), Vision of Atomy Masstige in Indian Direct Selling.'
  },
  {
    id: 'SEM-103',
    type: 'one_day',
    typeLabel: 'One Day Seminar',
    badgeClass: 'badge-oneday',
    title: 'Bengaluru Tech & Wellness One Day Seminar',
    date: '2026-10-18',
    time: '01:30 PM - 05:30 PM IST',
    city: 'Bengaluru',
    venue: 'NIMHANS Convention Centre, Hosur Road, Bengaluru - 560029',
    speaker: 'Royal Master Park & Leaders Club Members',
    status: 'FILLING_FAST',
    seatsAvailable: 45,
    highlights: 'Biotechnology behind Kolmar BNH manufacturing, Bilateral lineage compensation breakdown.'
  },
  {
    id: 'SEM-104',
    type: 'one_day',
    typeLabel: 'One Day Seminar',
    badgeClass: 'badge-oneday',
    title: 'Hyderabad Leadership One Day Seminar',
    date: '2026-10-21',
    time: '01:30 PM - 05:30 PM IST',
    city: 'Hyderabad',
    venue: 'Shilpakala Vedika, Hitech City, Madhapur, Hyderabad - 500081',
    speaker: 'Star Master Venkatesh & Sharon-Rose Masters',
    status: 'OPEN',
    seatsAvailable: 180,
    highlights: 'Mastership Challenge planning for 16th-End cycle, Health supplement consumer case studies.'
  },
  {
    id: 'SEM-105',
    type: 'one_day',
    typeLabel: 'One Day Seminar',
    badgeClass: 'badge-oneday',
    title: 'Kolkata East Zone One Day Seminar',
    date: '2026-10-28',
    time: '01:30 PM - 05:30 PM IST',
    city: 'Kolkata',
    venue: 'Biswa Bangla Convention Centre, Action Area I, New Town, Kolkata - 700156',
    speaker: 'Star Master Ananya Sen & Kolmar Researchers',
    status: 'OPEN',
    seatsAvailable: 210,
    highlights: 'Ayurvedic integration with GSGS global sourcing, consumer demonstration and product tasting.'
  }
];

export default function SeminarsPage({ onNavigateHome }) {
  const [filterType, setFilterType] = useState('ALL');
  const [selectedSeminar, setSelectedSeminar] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredSeminars = UPCOMING_SEMINARS.filter((s) => {
    if (filterType === 'ALL') return true;
    return s.type === filterType;
  });

  const handleBookTicket = (sem) => {
    setSelectedSeminar(sem);
    setBookingSuccess(false);
  };

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  return (
    <div className="seminars-page">
      {/* 1. Breadcrumbs */}
      <div className="seminars-breadcrumb-bar">
        <div className="seminars-container">
          <button type="button" className="bread-link" onClick={onNavigateHome}>
            HOME
          </button>
          <ChevronRight size={14} className="bread-sep" />
          <span className="bread-active">Seminars</span>
        </div>
      </div>

      {/* 2. Header Banner */}
      <section className="seminars-header-banner">
        <div className="seminars-container">
          <div className="seminars-banner-content">
            <span className="seminars-eyebrow">ATOMY EDUCATION SYSTEM</span>
            <h1 className="seminars-title">Success Academy & Seminars</h1>
            <p className="seminars-subtitle">
              Atomy provides a company-sponsored education system directly to ensure equal opportunity
              for all members to learn, grow, and achieve lifelong success without expensive training fees.
            </p>
          </div>
        </div>
      </section>

      {/* 3. System Highlights */}
      <section className="seminars-system-section">
        <div className="seminars-container">
          <div className="system-cards-grid">
            <div className="system-card">
              <div className="system-icon-wrap academy">
                <Award size={26} />
              </div>
              <h3>Success Academy</h3>
              <p>
                Our flagship 2-day conference held bi-annually. Features Mastership promotion ceremonies,
                in-depth economic principles, and guidance on formulating your personal Life Scenario.
              </p>
            </div>

            <div className="system-card">
              <div className="system-icon-wrap oneday">
                <Users size={26} />
              </div>
              <h3>One Day Seminar</h3>
              <p>
                Regional one-day workshops across major Indian metros. Delivers product science education,
                marketing plan walkthroughs, and inspiration from active Master leaders.
              </p>
            </div>

            <div className="system-card">
              <div className="system-icon-wrap broadcast">
                <Video size={26} />
              </div>
              <h3>CH.ATOMY Broadcasting</h3>
              <p>
                24/7 digital broadcasting streaming live seminar feeds, corporate lectures by Founder Han-Gill Park,
                and multilingual VOD training directly to your smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Schedule & Registration Table */}
      <div className="seminars-container seminars-table-section">
        <div className="schedule-header-row">
          <div>
            <h2 className="schedule-title">Upcoming Seminar Schedule & Booking</h2>
            <p className="schedule-sub">Book your attendance or coordinate with your local Education Centre Leader.</p>
          </div>

          <div className="filter-pill-group">
            <button
              className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterType('ALL')}
            >
              All Events
            </button>
            <button
              className={`filter-btn ${filterType === 'success_academy' ? 'active' : ''}`}
              onClick={() => setFilterType('success_academy')}
            >
              Success Academy
            </button>
            <button
              className={`filter-btn ${filterType === 'one_day' ? 'active' : ''}`}
              onClick={() => setFilterType('one_day')}
            >
              One Day Seminars
            </button>
          </div>
        </div>

        <div className="seminars-list-grid">
          {filteredSeminars.map((sem) => (
            <div key={sem.id} className="seminar-event-card">
              <div className="event-card-top">
                <span className={`event-type-badge ${sem.badgeClass}`}>{sem.typeLabel}</span>
                <span className={`status-pill ${sem.status.toLowerCase()}`}>
                  {sem.status === 'OPEN' ? 'Registration Open' : 'Filling Fast'}
                </span>
              </div>

              <h3 className="event-title">{sem.title}</h3>

              <div className="event-meta-list">
                <div className="meta-row">
                  <Calendar size={15} color="#00A3E0" />
                  <span><strong>Date:</strong> {sem.date}</span>
                </div>
                <div className="meta-row">
                  <Clock size={15} color="#00A3E0" />
                  <span><strong>Time:</strong> {sem.time}</span>
                </div>
                <div className="meta-row">
                  <MapPin size={15} color="#00A3E0" />
                  <span><strong>Venue:</strong> {sem.venue} ({sem.city})</span>
                </div>
                <div className="meta-row">
                  <Users size={15} color="#00A3E0" />
                  <span><strong>Speaker:</strong> {sem.speaker}</span>
                </div>
              </div>

              <p className="event-highlight-text">{sem.highlights}</p>

              <div className="event-card-footer">
                <span className="seats-text">
                  <strong>{sem.seatsAvailable}</strong> seats remaining
                </span>
                <button
                  type="button"
                  className="book-seat-btn"
                  onClick={() => handleBookTicket(sem)}
                >
                  <Ticket size={15} />
                  <span>Reserve Seat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Reservation Modal */}
      {selectedSeminar && (
        <div className="seminar-modal-backdrop" onClick={() => setSelectedSeminar(null)}>
          <div className="seminar-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="seminar-modal-header">
              <div className="modal-title-cluster">
                <Ticket size={20} color="#00A3E0" />
                <h3>Reserve Seminar Seat</h3>
              </div>
              <button className="seminar-modal-close" onClick={() => setSelectedSeminar(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="seminar-modal-body">
              {bookingSuccess ? (
                <div className="booking-success-box">
                  <CheckCircle2 size={54} color="#16a34a" />
                  <h3>Seat Reservation Confirmed!</h3>
                  <p>
                    Your complimentary delegate seat for <strong>{selectedSeminar.title}</strong> has been allocated.
                    A confirmation pass with QR code has been dispatched to your registered SMS and email.
                  </p>
                  <div className="ticket-meta-pill">
                    <span>Pass ID: <strong>ATM-SEM-{Math.floor(10000 + Math.random() * 90000)}</strong></span>
                    <span>Venue: <strong>{selectedSeminar.city}</strong></span>
                  </div>
                  <button
                    type="button"
                    className="modal-done-btn"
                    onClick={() => setSelectedSeminar(null)}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConfirmReservation}>
                  <div className="event-summary-box">
                    <h4>{selectedSeminar.title}</h4>
                    <p>📍 {selectedSeminar.venue}</p>
                    <p>📅 {selectedSeminar.date} • {selectedSeminar.time}</p>
                  </div>

                  <div className="modal-form-group">
                    <label>Atomy Member ID / Mobile Number *</label>
                    <input type="text" placeholder="e.g. 17094821 or +91 98765 43210" required />
                  </div>

                  <div className="modal-form-group">
                    <label>Delegate Name *</label>
                    <input type="text" placeholder="Full name as per KYC" required />
                  </div>

                  <div className="modal-form-group">
                    <label>Affiliated Education Centre</label>
                    <input type="text" placeholder="e.g. Delhi Royal Centre or Nearest Centre" />
                  </div>

                  <div className="form-info-note">
                    * Attendance is free of charge under Atomy's company-run education policy. Seats are issued on first-come, first-served basis.
                  </div>

                  <div className="modal-actions-row">
                    <button type="button" className="btn-cancel" onClick={() => setSelectedSeminar(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-confirm">
                      Confirm Reservation (Free)
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
