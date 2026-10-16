import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Video,
  Award,
  Users,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  CalendarCheck,
  List,
  Sparkles,
  Ticket,
  CheckCircle2,
  X,
  Play
} from 'lucide-react';
import './SeminarsPage.css';

// Seminar Categories matching https://in.atomy.com/cst/seminarEducation
const SEMINAR_TYPES = [
  { id: 'ALL', label: 'All', color: '#111827', dotClass: 'dot-all' },
  { id: 'SUCCESS', label: 'Success Academy', color: '#f59e0b', dotClass: 'dot-yw' },
  { id: 'REGIONAL', label: 'Regional Seminar', color: '#10b981', dotClass: 'dot-gr' },
  { id: 'ONEDAY', label: 'One-day seminar', color: '#f97316', dotClass: 'dot-or' },
  { id: 'ONLINE', label: 'Other(online) seminars', color: '#94a3b8', dotClass: 'dot-gy' },
];

const OFFICIAL_SEMINARS = [
  {
    id: 'SEM-01',
    type: 'ONEDAY',
    typeLabel: 'One-day seminar',
    dotClass: 'dot-or',
    title: 'Mumbai Regional One Day Seminar',
    dateStr: '14-10-2026',
    day: 14,
    month: 10,
    year: 2026,
    time: '01:30 PM - 05:30 PM IST',
    venue: 'CIDCO Exhibition Centre, Hall 1',
    address: 'Swami Pranabananda Marg, Sector 30A, Vashi, Navi Mumbai, Maharashtra - 400703',
    city: 'Mumbai',
    speaker: 'Crown Master Rajesh Sharma & Dr. Sung-Hoon Kim',
    seatsAvailable: 120,
    totalSeats: 500,
    description: 'Atomy One Day Seminars are official company run seminars that invite smart-sumers, who consume absolute quality, absolute price products, to share principles, economics, and vision.',
  },
  {
    id: 'SEM-02',
    type: 'ONLINE',
    typeLabel: 'Other(online) seminars',
    dotClass: 'dot-gy',
    title: 'National Live Webcast & Product Launch',
    dateStr: '15-10-2026',
    day: 15,
    month: 10,
    year: 2026,
    time: '07:00 PM - 08:30 PM IST',
    venue: 'CH.ATOMY Live Streaming & YouTube',
    address: 'Live Streaming across India via official broadcast channels',
    city: 'Online Stream',
    speaker: 'Atomy India Corporate Trainers & Medical Specialists',
    seatsAvailable: 5000,
    totalSeats: 5000,
    description: 'Interactive live Q&A, seasonal product promotions, and new member distributor guidance broadcast nationwide.',
  },
  {
    id: 'SEM-03',
    type: 'REGIONAL',
    typeLabel: 'Regional Seminar',
    dotClass: 'dot-gr',
    title: 'Bengaluru Tech & Wellness Seminar',
    dateStr: '18-10-2026',
    day: 18,
    month: 10,
    year: 2026,
    time: '01:30 PM - 05:30 PM IST',
    venue: 'NIMHANS Convention Centre, Hall A',
    address: 'Hosur Main Road, Lakkasandra, Bengaluru, Karnataka - 560029',
    city: 'Bengaluru',
    speaker: 'Royal Master Park & Leaders Club Members',
    seatsAvailable: 85,
    totalSeats: 350,
    description: 'Kolmar BNH manufacturing technologies, Hemohim immune research and local center support initiatives.',
  },
  {
    id: 'SEM-04',
    type: 'ONEDAY',
    typeLabel: 'One-day seminar',
    dotClass: 'dot-or',
    title: 'Hyderabad Leadership One Day Seminar',
    dateStr: '21-10-2026',
    day: 21,
    month: 10,
    year: 2026,
    time: '01:30 PM - 05:30 PM IST',
    venue: 'Shilpakala Vedika Auditorium',
    address: 'Hitech City Main Road, Madhapur, Hyderabad, Telangana - 500081',
    city: 'Hyderabad',
    speaker: 'Star Master Venkatesh & Sharon-Rose Masters',
    seatsAvailable: 160,
    totalSeats: 450,
    description: 'Mastership Challenge formulation and consumer satisfaction strategies for Southern India distributors.',
  },
  {
    id: 'SEM-05',
    type: 'SUCCESS',
    typeLabel: 'Success Academy',
    dotClass: 'dot-yw',
    title: 'All-India Grand Success Academy 2026',
    dateStr: '24-10-2026',
    day: 24,
    month: 10,
    year: 2026,
    time: '10:00 AM - 06:00 PM IST',
    venue: 'Indira Gandhi Indoor Stadium, Arena 1',
    address: 'Indraprastha Estate, Grand Trunk Road, Near ITO, New Delhi - 110002',
    city: 'New Delhi',
    speaker: 'Imperial Master Lee & Korean Headquarters Executive Delegation',
    seatsAvailable: 340,
    totalSeats: 2500,
    description: 'Flagship conference celebrating Mastership promotions, visionary lectures, and Life Scenario award ceremonies.',
  },
  {
    id: 'SEM-06',
    type: 'SUCCESS',
    typeLabel: 'Success Academy',
    dotClass: 'dot-yw',
    title: 'Success Academy Day 2 (Life Scenario Formulation)',
    dateStr: '25-10-2026',
    day: 25,
    month: 10,
    year: 2026,
    time: '09:30 AM - 04:30 PM IST',
    venue: 'Indira Gandhi Indoor Stadium, Arena 1',
    address: 'Indraprastha Estate, Grand Trunk Road, Near ITO, New Delhi - 110002',
    city: 'New Delhi',
    speaker: 'Crown Masters & Atomy India Managing Directors',
    seatsAvailable: 280,
    totalSeats: 2500,
    description: 'Hands-on Life Scenario formulation workshop, pin ceremony, and future roadmap unveiling.',
  },
  {
    id: 'SEM-07',
    type: 'ONEDAY',
    typeLabel: 'One-day seminar',
    dotClass: 'dot-or',
    title: 'Kolkata East Zone One Day Seminar',
    dateStr: '28-10-2026',
    day: 28,
    month: 10,
    year: 2026,
    time: '01:30 PM - 05:30 PM IST',
    venue: 'Biswa Bangla Convention Centre',
    address: 'Action Area I, New Town, Kolkata, West Bengal - 700156',
    city: 'Kolkata',
    speaker: 'Star Master Ananya Sen & Kolmar Researchers',
    seatsAvailable: 210,
    totalSeats: 600,
    description: 'Ayurvedic integration with GSGS global sourcing, consumer demonstration and product tasting.',
  },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SeminarsPage({ onNavigateHome }) {
  // Tabs: 'INFO' | 'VIDEO'
  const [activeTab, setActiveTab] = useState('INFO');

  // Year & Month picker state
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(10); // 1-12 (October)

  // Filters & Views
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('CAL'); // 'CAL' | 'LST'
  const [selectedDay, setSelectedDay] = useState(14);

  // Seat Booking Modal
  const [bookingSeminar, setBookingSeminar] = useState(null);
  const [bookingDone, setBookingDone] = useState(false);

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handlePrevYear = () => {
    setSelectedYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear((prev) => prev + 1);
  };

  // Calendar generation for selected year and month (Monday start)
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDayIndex = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    // In JS Sunday=0, Monday=1 ... Saturday=6. For Monday start:
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days = [];
    for (let i = 0; i < offset; i++) {
      days.push({ dayNumber: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ dayNumber: d });
    }
    return days;
  }, [selectedYear, selectedMonth]);

  // Filtered seminars
  const filteredSeminars = useMemo(() => {
    return OFFICIAL_SEMINARS.filter((s) => {
      const matchMonth = s.month === selectedMonth && s.year === selectedYear;
      if (!matchMonth) return false;
      if (activeFilter === 'ALL') return true;
      return s.type === activeFilter;
    });
  }, [selectedYear, selectedMonth, activeFilter]);

  // Seminars for the currently selected day
  const daySeminars = useMemo(() => {
    return OFFICIAL_SEMINARS.filter((s) => {
      return (
        s.month === selectedMonth &&
        s.year === selectedYear &&
        s.day === selectedDay &&
        (activeFilter === 'ALL' || s.type === activeFilter)
      );
    });
  }, [selectedYear, selectedMonth, selectedDay, activeFilter]);

  // Helper to get seminars on a given day for calendar dots
  const getEventsForDay = (d) => {
    if (!d) return [];
    return OFFICIAL_SEMINARS.filter((s) => {
      return (
        s.month === selectedMonth &&
        s.year === selectedYear &&
        s.day === d &&
        (activeFilter === 'ALL' || s.type === activeFilter)
      );
    });
  };

  const handleOpenBooking = (sem) => {
    setBookingSeminar(sem);
    setBookingDone(false);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingDone(true);
  };

  return (
    <div className="atomy-cst-seminar-page">
      {/* 1. Official Header & Location Breadcrumb */}
      <div className="cst-wrap inner-center">
        <div className="cst-title-area">
          <h2 className="cst-main-title">Seminar &amp; Education</h2>
          <ul className="cst-location">
            <li>
              <button type="button" className="loc-link" onClick={onNavigateHome}>
                About Us
              </button>
            </li>
            <ChevronRight size={13} className="loc-sep" />
            <li>
              <span className="loc-current" aria-current="page">
                Seminar &amp; Education
              </span>
            </li>
          </ul>
        </div>

        {/* 2. Official Top Tabs (gtTabs) */}
        <div className="cst-tabs-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'INFO'}
            className={`cst-tab-btn ${activeTab === 'INFO' ? 'active' : ''}`}
            onClick={() => setActiveTab('INFO')}
          >
            <span>Information</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'VIDEO'}
            className={`cst-tab-btn ${activeTab === 'VIDEO' ? 'active' : ''}`}
            onClick={() => setActiveTab('VIDEO')}
          >
            <span>Video training guide</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: INFORMATION */}
        {/* ======================================================== */}
        {activeTab === 'INFO' && (
          <div className="cst-edu-panel">
            {/* Seminar schedule section */}
            <div className="cst-plan-part">
              <div className="cst-plan-desc">
                <h3 className="section-heading">Seminar schedule</h3>
              </div>

              {/* comp-diary */}
              <div className="comp-diary-box">
                {/* Month / Year Navigator */}
                <div className="my-date-nav">
                  <div className="m-date-item" id="year">
                    <button
                      type="button"
                      className="nav-arrow"
                      onClick={handlePrevYear}
                      aria-label="Previous Year"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="date-val">
                      <b>{selectedYear}</b>
                    </span>
                    <button
                      type="button"
                      className="nav-arrow"
                      onClick={handleNextYear}
                      aria-label="Next Year"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="m-date-item" id="month">
                    <button
                      type="button"
                      className="nav-arrow"
                      onClick={handlePrevMonth}
                      aria-label="Previous Month"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="date-val">
                      <b>{MONTH_NAMES[selectedMonth - 1]}</b>
                    </span>
                    <button
                      type="button"
                      className="nav-arrow"
                      onClick={handleNextMonth}
                      aria-label="Next Month"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Filter Checkboxes & View Switcher */}
                <div className="my-chk-row">
                  <div className="filter-chips-list">
                    <button
                      type="button"
                      className={`filter-chip chip-all ${activeFilter === 'ALL' ? 'selected' : ''}`}
                      onClick={() => setActiveFilter('ALL')}
                    >
                      <span className="chk-box"></span>
                      <span className="chip-label">All</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-chip chip-yw ${activeFilter === 'SUCCESS' ? 'selected' : ''}`}
                      onClick={() => setActiveFilter('SUCCESS')}
                    >
                      <span className="chk-box"></span>
                      <span className="chip-label">Success Academy</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-chip chip-gr ${activeFilter === 'REGIONAL' ? 'selected' : ''}`}
                      onClick={() => setActiveFilter('REGIONAL')}
                    >
                      <span className="chk-box"></span>
                      <span className="chip-label">Regional Seminar</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-chip chip-or ${activeFilter === 'ONEDAY' ? 'selected' : ''}`}
                      onClick={() => setActiveFilter('ONEDAY')}
                    >
                      <span className="chk-box"></span>
                      <span className="chip-label">One-day seminar</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-chip chip-gy ${activeFilter === 'ONLINE' ? 'selected' : ''}`}
                      onClick={() => setActiveFilter('ONLINE')}
                    >
                      <span className="chk-box"></span>
                      <span className="chip-label">Other(online) seminars</span>
                    </button>

                    <div className="chip-myschedule">
                      <CalendarCheck size={14} color="#0082cd" />
                      <span>My Schedule</span>
                    </div>
                  </div>

                  <div className="view-mode-toggle">
                    <button
                      type="button"
                      className={`view-btn ${viewMode === 'CAL' ? 'on' : ''}`}
                      onClick={() => setViewMode('CAL')}
                      title="Calendar view"
                    >
                      <CalendarIcon size={16} />
                      <span className="v-text">Calendar view</span>
                    </button>
                    <button
                      type="button"
                      className={`view-btn ${viewMode === 'LST' ? 'on' : ''}`}
                      onClick={() => setViewMode('LST')}
                      title="List view"
                    >
                      <List size={16} />
                      <span className="v-text">List view</span>
                    </button>
                  </div>
                </div>

                {/* VIEW 1: CALENDAR VIEW */}
                {viewMode === 'CAL' ? (
                  <div className="grid-cal-wrap">
                    <div className="grid-cal-table">
                      <div className="cal-header-row">
                        <div className="cal-th">Mon</div>
                        <div className="cal-th">Tue</div>
                        <div className="cal-th">Wed</div>
                        <div className="cal-th">Thu</div>
                        <div className="cal-th">Fri</div>
                        <div className="cal-th">Sat</div>
                        <div className="cal-th sun">Sun</div>
                      </div>

                      <div className="cal-grid-body">
                        {calendarDays.map((cell, idx) => {
                          const isBlank = cell.dayNumber === null;
                          const events = isBlank ? [] : getEventsForDay(cell.dayNumber);
                          const isSelected = !isBlank && selectedDay === cell.dayNumber;

                          return (
                            <div
                              key={idx}
                              className={`cal-cell ${isBlank ? 'cell-empty' : ''} ${
                                isSelected ? 'cell-selected' : ''
                              } ${events.length > 0 ? 'cell-has-events' : ''}`}
                              onClick={() => {
                                if (!isBlank) setSelectedDay(cell.dayNumber);
                              }}
                            >
                              {!isBlank && (
                                <>
                                  <div className="cell-num-row">
                                    <span className={`cell-num ${isSelected ? 'selected' : ''}`}>
                                      {cell.dayNumber}
                                    </span>
                                    {events.length > 0 && (
                                      <span className="event-count-badge">
                                        {events.length}
                                      </span>
                                    )}
                                  </div>

                                  <div className="cell-events-list">
                                    {events.map((ev) => (
                                      <div
                                        key={ev.id}
                                        className={`cell-event-chip ${ev.dotClass}`}
                                        title={`${ev.typeLabel} - ${ev.title}`}
                                      >
                                        <span className="chip-bullet"></span>
                                        <span className="chip-text">{ev.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Day Agenda Box */}
                    <div className="selected-day-agenda-box">
                      <div className="agenda-header">
                        <h4>
                          Events on {selectedDay} {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                        </h4>
                        <span className="agenda-count">
                          {daySeminars.length} {daySeminars.length === 1 ? 'Seminar' : 'Seminars'} scheduled
                        </span>
                      </div>

                      {daySeminars.length === 0 ? (
                        <div className="no-events-day">
                          <p>No seminars scheduled on this date for the active filter.</p>
                        </div>
                      ) : (
                        <div className="agenda-items-grid">
                          {daySeminars.map((item) => (
                            <div key={item.id} className="agenda-seminar-card">
                              <div className="card-top-bar">
                                <span className={`type-tag ${item.dotClass}`}>{item.typeLabel}</span>
                                <span className="time-tag">
                                  <Clock size={13} /> {item.time}
                                </span>
                              </div>
                              <h5 className="agenda-sem-title">{item.title}</h5>
                              <div className="agenda-meta-row">
                                <MapPin size={14} color="#0082cd" />
                                <span>{item.venue}, {item.city}</span>
                              </div>
                              <div className="agenda-meta-row">
                                <Users size={14} color="#0082cd" />
                                <span>Speaker: {item.speaker}</span>
                              </div>
                              <p className="agenda-desc">{item.description}</p>
                              <div className="agenda-card-bottom">
                                <span className="seats-info">
                                  <strong>{item.seatsAvailable}</strong> seats remaining
                                </span>
                                <button
                                  type="button"
                                  className="btn-book-seat"
                                  onClick={() => handleOpenBooking(item)}
                                >
                                  <Ticket size={14} />
                                  <span>Reserve Pass</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* VIEW 2: LIST VIEW */
                  <div className="seminar-list-view">
                    {filteredSeminars.length === 0 ? (
                      <div className="no-events-box">
                        <p>No seminars found matching this filter in {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.</p>
                      </div>
                    ) : (
                      <div className="list-items-table">
                        {filteredSeminars.map((sem) => (
                          <div key={sem.id} className="list-seminar-row">
                            <div className="list-col-type">
                              <span className={`type-tag ${sem.dotClass}`}>{sem.typeLabel}</span>
                              <div className="list-date-pill">
                                <strong>{sem.day}</strong>
                                <span>{MONTH_NAMES[sem.month - 1].slice(0, 3)}</span>
                              </div>
                            </div>

                            <div className="list-col-main">
                              <h4 className="list-sem-title">{sem.title}</h4>
                              <div className="list-meta-group">
                                <span>
                                  <Clock size={13} color="#0082cd" /> {sem.time}
                                </span>
                                <span>
                                  <MapPin size={13} color="#0082cd" /> {sem.venue} ({sem.city})
                                </span>
                                <span>
                                  <Users size={13} color="#0082cd" /> {sem.speaker}
                                </span>
                              </div>
                              <p className="list-desc-text">{sem.description}</p>
                            </div>

                            <div className="list-col-action">
                              <span className="seats-counter">
                                <strong>{sem.seatsAvailable}</strong> seats left
                              </span>
                              <button
                                type="button"
                                className="btn-book-seat"
                                onClick={() => handleOpenBooking(sem)}
                              >
                                <Ticket size={14} />
                                <span>Reserve Pass</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Official Atomy Ticket Callout Banner */}
              <div className="cst-edu__diary_btm">
                <span>
                  You can check the seminar schedule more conveniently by using the Atomy Ticket.
                </span>
                <button
                  type="button"
                  className="btn-ticket-sd"
                  onClick={() =>
                    window.open(
                      'https://ticket.atomy.com/h/main?jisa=in&ln=en',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <em>Go to Atomy Ticket</em>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            {/* Official Supervision Section */}
            <div className="cst-edu__seminar-supervision">
              <h3 className="supervision-title">
                Atomy Seminar is supervised by Atomy India headquarter
              </h3>

              <div className="supervision-grid">
                {/* One Day Seminar Card */}
                <div className="supervision-card">
                  <div className="card-heading-row">
                    <img
                      src="https://image.atomy.com/editor/047/2510130140047.gif"
                      alt="One Day Seminar Icon"
                      width="48"
                      height="48"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <strong>One Day Seminar</strong>
                  </div>
                  <div className="card-info-content">
                    <p className="info-desc">
                      Atomy One Day Seminars are official company run seminars that invite
                      smart-sumers, who consume the absolute quality, absolute price, masstige
                      products, to share company principles, Atomy culture and economics,
                      products, and vision.
                    </p>
                    <div className="participation-box">
                      <h5 className="part-title">How to participate in the Seminars</h5>
                      <ol className="part-steps">
                        <li>
                          <strong>1.</strong> Seminar applications are received through the education
                          centres. Members who wish to participate must submit the seminar
                          application form to their designated centers.
                        </li>
                        <li>
                          <strong>2.</strong> Please contact your designated centers for more
                          information. Once the center leaders submit the applications, they will be
                          assigned seats in the seminar room.
                        </li>
                        <li>
                          <strong>3.</strong> For more information, click on the date from the
                          calendar.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Success Academy Card */}
                <div className="supervision-card">
                  <div className="card-heading-row">
                    <img
                      src="https://image.atomy.com/editor/027/2510130140027.gif"
                      alt="Success Academy Icon"
                      width="48"
                      height="48"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <strong>Success Academy</strong>
                  </div>
                  <div className="card-info-content">
                    <p className="info-desc">
                      Atomy Success Academy preaches Atomy’s vision for fulfilling customer
                      success and masstalism (mass-capitalism), while congratulating promotions, and
                      writing out the life scenario to help lead people to success.
                    </p>
                    <div className="success-highlights-box">
                      <div className="highlight-item">
                        <Award size={18} color="#f59e0b" />
                        <span>Mastership Pin Award Ceremony & Congratulatory Speeches</span>
                      </div>
                      <div className="highlight-item">
                        <Sparkles size={18} color="#0082cd" />
                        <span>Life Scenario Formulation Workshop</span>
                      </div>
                      <div className="highlight-item">
                        <Users size={18} color="#10b981" />
                        <span>Executive lectures by Imperial & Crown Masters</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: VIDEO TRAINING GUIDE */}
        {/* ======================================================== */}
        {activeTab === 'VIDEO' && (
          <div className="cst-edu-panel">
            <div className="cst-edu__video-container">
              {/* YouTube Card */}
              <div className="bx-video-card yt-card">
                <div className="bx-video-head">
                  <div className="logo-badge yt-badge">
                    <Play size={20} fill="#fff" color="#fff" />
                  </div>
                  <span className="bx-video-title">Atomy India Official YouTube Channel</span>
                </div>
                <div className="bx-video-body">
                  <div className="bx-video-text">
                    <strong className="text-lead">Just turn it on with PC, mobile, or tablet!</strong>
                    <p className="text-sub">
                      Watch the videos curated by Atomy anytime, anywhere, conveniently 24/7.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-video-link yt-btn"
                    onClick={() =>
                      window.open(
                        'https://www.youtube.com/channel/UC-rPEnjVmDAmLpUJukl6jMw',
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                  >
                    <em>Go to Official YouTube</em>
                    <ExternalLink size={15} />
                  </button>
                </div>
              </div>

              {/* CH.ATOMY Card */}
              <div className="bx-video-card ch-card">
                <div className="bx-video-head">
                  <div className="logo-badge ch-badge">
                    <Video size={20} color="#fff" />
                  </div>
                  <span className="bx-video-title">Channel Atomy</span>
                </div>
                <div className="bx-video-body">
                  <div className="bx-video-text">
                    <strong className="text-lead">Add convenience to your Atomy life!</strong>
                    <p className="text-sub">
                      Watch various videos, Atomy news, and educational materials on PC, mobile, or tablet!
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-video-link ch-btn"
                    onClick={() =>
                      window.open('https://ch.atomy.com/in', '_blank', 'noopener,noreferrer')
                    }
                  >
                    <em>Go to CH.ATOMY</em>
                    <ExternalLink size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Curated Categories Video Section */}
            <div className="video-categories-grid">
              <div className="video-category-card">
                <div className="cat-icon-badge">
                  <Award size={22} color="#0082cd" />
                </div>
                <h4>Vision &amp; Philosophy</h4>
                <p>Chairman Park Han-Gill's corporate lectures, Balanced Life Scenario formulation, and Atomy cultural tenets.</p>
                <button
                  type="button"
                  className="cat-link-btn"
                  onClick={() => window.open('https://ch.atomy.com/in/category/1', '_blank')}
                >
                  Browse Lectures <ChevronRight size={14} />
                </button>
              </div>

              <div className="video-category-card">
                <div className="cat-icon-badge">
                  <Sparkles size={22} color="#10b981" />
                </div>
                <h4>Product Masterclasses</h4>
                <p>Kolmar BNH scientific research, HemoHIM immunological patents, Absolute CellActive skincare technologies.</p>
                <button
                  type="button"
                  className="cat-link-btn"
                  onClick={() => window.open('https://ch.atomy.com/in/category/2', '_blank')}
                >
                  Watch Product Science <ChevronRight size={14} />
                </button>
              </div>

              <div className="video-category-card">
                <div className="cat-icon-badge">
                  <Users size={22} color="#f59e0b" />
                </div>
                <h4>Business &amp; Compensation</h4>
                <p>Step-by-step guidance on General Commission, Dealership classifications, and Mastership bonus cycles.</p>
                <button
                  type="button"
                  className="cat-link-btn"
                  onClick={() => window.open('https://ch.atomy.com/in/category/3', '_blank')}
                >
                  Compensation Tutorials <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Seat Reservation Modal */}
      {bookingSeminar && (
        <div className="seminar-modal-backdrop" onClick={() => setBookingSeminar(null)}>
          <div className="seminar-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="seminar-modal-header">
              <div className="modal-title-cluster">
                <Ticket size={20} color="#0082cd" />
                <h3>Reserve Seminar Seat</h3>
              </div>
              <button
                type="button"
                className="seminar-modal-close"
                onClick={() => setBookingSeminar(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="seminar-modal-body">
              {bookingDone ? (
                <div className="booking-success-box">
                  <CheckCircle2 size={54} color="#16a34a" />
                  <h3>Seat Reservation Confirmed!</h3>
                  <p>
                    Your complimentary delegate seat for{' '}
                    <strong>{bookingSeminar.title}</strong> has been allocated.
                    A confirmation pass with QR code has been dispatched to your registered SMS and email.
                  </p>
                  <div className="ticket-meta-pill">
                    <span>
                      Pass ID: <strong>ATM-SEM-{Math.floor(10000 + Math.random() * 90000)}</strong>
                    </span>
                    <span>
                      Venue: <strong>{bookingSeminar.city}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="modal-done-btn"
                    onClick={() => setBookingSeminar(null)}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConfirmBooking}>
                  <div className="event-summary-box">
                    <span className={`type-tag ${bookingSeminar.dotClass}`}>
                      {bookingSeminar.typeLabel}
                    </span>
                    <h4>{bookingSeminar.title}</h4>
                    <p>📍 {bookingSeminar.venue}</p>
                    <p>
                      📅 {bookingSeminar.dateStr} • {bookingSeminar.time}
                    </p>
                  </div>

                  <div className="modal-form-group">
                    <label>Atomy Member ID / Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 17094821 or +91 98765 43210"
                      required
                      defaultValue="17094821"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Delegate Name *</label>
                    <input
                      type="text"
                      placeholder="Full name as per KYC"
                      required
                      defaultValue="Priya Sharma"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Affiliated Education Centre</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi Royal Centre or Nearest Centre"
                      defaultValue="New Delhi Central Education Centre"
                    />
                  </div>

                  <div className="form-info-note">
                    * Attendance is free of charge under Atomy's company-run education policy. Seats
                    are allocated through Education Centres on first-come, first-served basis.
                  </div>

                  <div className="modal-actions-row">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setBookingSeminar(null)}
                    >
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
