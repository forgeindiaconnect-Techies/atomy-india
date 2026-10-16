import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AtomyFooter from '../Navigation/AtomyFooter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const phoenixLogo = require('../../../assets/team_phoenix_circle_clean.png');

// Seminar Categories matching https://in.atomy.com/cst/seminarEducation
const SEMINAR_TYPES = [
  { id: 'ALL', label: 'All', color: '#0F172A', dotColor: '#0F172A' },
  { id: 'SUCCESS', label: 'Success Academy', color: '#D97706', dotColor: '#F59E0B' }, // yw
  { id: 'REGIONAL', label: 'Regional Seminar', color: '#16A34A', dotColor: '#10B981' }, // gr
  { id: 'ONEDAY', label: 'One-day seminar', color: '#EA580C', dotColor: '#F97316' }, // or
  { id: 'ONLINE', label: 'Other(online) seminars', color: '#64748B', dotColor: '#94A3B8' }, // gy
];

// Official Seminars Data for India
const OFFICIAL_SEMINARS = [
  {
    id: 'SEM-01',
    type: 'ONEDAY',
    typeLabel: 'One-day seminar',
    dotColor: '#F97316',
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
    dotColor: '#94A3B8',
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
    dotColor: '#10B981',
    title: 'Bengaluru Tech & Wellness Seminar',
    dateStr: '18-10-2026',
    day: 18,
    month: 10,
    year: 2026,
    time: '01:30 PM - 05:30 PM IST',
    venue: 'NIMHANS Convention Centre',
    address: 'Hosur Road, Lakkasandra, Wilson Garden, Bengaluru, Karnataka - 560029',
    city: 'Bengaluru',
    speaker: 'Royal Master Park & Leaders Club Members',
    seatsAvailable: 45,
    totalSeats: 400,
    description: 'Bilateral lineage compensation breakdown, Kolmar BNH research presentation, and regional distributor honors.',
  },
  {
    id: 'SEM-04',
    type: 'REGIONAL',
    typeLabel: 'Regional Seminar',
    dotColor: '#10B981',
    title: 'Hyderabad Leadership Regional Seminar',
    dateStr: '21-10-2026',
    day: 21,
    month: 10,
    year: 2026,
    time: '01:30 PM - 05:30 PM IST',
    venue: 'Shilpakala Vedika',
    address: 'Hitech City Main Rd, Madhapur, Hyderabad, Telangana - 500081',
    city: 'Hyderabad',
    speaker: 'Star Master Venkatesh & Sharon-Rose Masters',
    seatsAvailable: 180,
    totalSeats: 600,
    description: 'Mastership Challenge planning for monthly cycles and health supplement consumer testimonials.',
  },
  {
    id: 'SEM-05',
    type: 'SUCCESS',
    typeLabel: 'Success Academy',
    dotColor: '#F59E0B',
    title: 'All-India Grand Success Academy 2026',
    dateStr: '24-10-2026',
    day: 24,
    month: 10,
    year: 2026,
    time: '10:00 AM - 06:00 PM IST',
    venue: 'Indira Gandhi Indoor Arena',
    address: 'Indraprastha Estate, ITO, New Delhi, Delhi - 110002',
    city: 'New Delhi',
    speaker: 'Imperial Master Lee & Korean Leadership Delegation',
    seatsAvailable: 340,
    totalSeats: 1500,
    description: 'Atomy Success Academy preaches Atomy’s vision for fulfilling customer success and masstalism, while congratulating promotions and formulating the life scenario.',
  },
  {
    id: 'SEM-06',
    type: 'SUCCESS',
    typeLabel: 'Success Academy (Day 2)',
    dateStr: '25-10-2026',
    day: 25,
    month: 10,
    year: 2026,
    time: '10:00 AM - 04:30 PM IST',
    venue: 'Indira Gandhi Indoor Arena',
    address: 'Indraprastha Estate, ITO, New Delhi, Delhi - 110002',
    city: 'New Delhi',
    speaker: 'Chairman Vision Broadcast & Top Leaders',
    seatsAvailable: 280,
    totalSeats: 1500,
    description: 'Day 2 Mastership Pin Celebration, Life Scenario presentations, and exclusive delegate recognition gifts.',
  },
  {
    id: 'SEM-07',
    type: 'ONEDAY',
    typeLabel: 'One-day seminar',
    dotColor: '#F97316',
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
    totalSeats: 500,
    description: 'GSGS global sourcing integration, HemoHIM demonstration, and east zone distributor growth strategies.',
  },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SeminarsPage({
  onNavigateHome,
  onNavigateBack,
  currentUser,
  isMember,
}) {
  // Main Tabs: 'info' (Information) | 'video' (Video training guide)
  const [mainTab, setMainTab] = useState('info');

  // Year & Month state
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 1-indexed (October = 10)

  // Type filter: 'ALL' | 'SUCCESS' | 'REGIONAL' | 'ONEDAY' | 'ONLINE'
  const [selectedType, setSelectedType] = useState('ALL');

  // View mode: 'cal' (Calendar view) | 'list' (List view)
  const [viewMode, setViewMode] = useState('cal');

  // Selected date on calendar (defaults to 14 October 2026)
  const [selectedDay, setSelectedDay] = useState(14);

  // Modal states
  const [mapSeminar, setMapSeminar] = useState(null);
  const [bookingSeminar, setBookingSeminar] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filtered seminars based on selected type and month
  const filteredSeminars = useMemo(() => {
    return OFFICIAL_SEMINARS.filter((s) => {
      const matchMonth = s.month === currentMonth && s.year === currentYear;
      const matchType = selectedType === 'ALL' || s.type === selectedType;
      return matchMonth && matchType;
    });
  }, [currentYear, currentMonth, selectedType]);

  // Seminars on the currently selected calendar day
  const selectedDaySeminars = useMemo(() => {
    return OFFICIAL_SEMINARS.filter((s) => {
      const matchDay = s.day === selectedDay && s.month === currentMonth && s.year === currentYear;
      const matchType = selectedType === 'ALL' || s.type === selectedType;
      return matchDay && matchType;
    });
  }, [selectedDay, currentMonth, currentYear, selectedType]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calendar Grid builder (October 2026 starts on Thursday = day 4, 31 days)
  const calendarDays = useMemo(() => {
    // Determine days in month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    // Determine start day of week (0 = Sun, 1 = Mon, ..., 6 = Sat).
    // In Atomy standard, Monday is first day of week:
    const firstDayIndex = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7; // 0 = Mon, 6 = Sun

    const cells = [];
    // Blank leading days
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, key: `empty-${i}` });
    }
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayEvents = OFFICIAL_SEMINARS.filter(
        (s) => s.day === d && s.month === currentMonth && s.year === currentYear
      );
      cells.push({
        day: d,
        key: `day-${d}`,
        events: dayEvents,
        hasEvent: dayEvents.length > 0,
      });
    }
    return cells;
  }, [currentYear, currentMonth]);

  const handleOpenTicketSite = () => {
    Alert.alert(
      'Atomy Ticket Portal',
      'You are being redirected to the official Atomy Ticket platform: https://ticket.atomy.com/',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Atomy Ticket', onPress: () => Linking.openURL('https://ticket.atomy.com/h/main?jisa=in&ln=en') },
      ]
    );
  };

  const handleOpenYouTube = () => {
    Linking.openURL('https://www.youtube.com/channel/UC-rPEnjVmDAmLpUJukl6jMw');
  };

  const handleOpenChAtomy = () => {
    Linking.openURL('https://ch.atomy.com/in');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. PAGE HEADER TITLE & BREADCRUMB */}
        <View style={styles.titleSection}>
          <Text style={styles.pageMainHeading}>Seminar & Education</Text>
          <View style={styles.breadcrumbRow}>
            <TouchableOpacity onPress={onNavigateHome}>
              <Text style={styles.breadGray}>About Us</Text>
            </TouchableOpacity>
            <Text style={styles.breadSep}>&gt;</Text>
            <Text style={styles.breadCyan}>Seminar & Education</Text>
          </View>
        </View>

        {/* 3. OFFICIAL TABS: Information vs Video training guide (id: cst-edu) */}
        <View style={styles.officialTabsBar}>
          <TouchableOpacity
            style={[styles.officialTabBtn, mainTab === 'info' && styles.officialTabBtnActive]}
            onPress={() => setMainTab('info')}
            activeOpacity={0.8}
          >
            <Text style={[styles.officialTabText, mainTab === 'info' && styles.officialTabTextActive]}>
              Information
            </Text>
            {mainTab === 'info' && <View style={styles.officialTabLine} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.officialTabBtn, mainTab === 'video' && styles.officialTabBtnActive]}
            onPress={() => setMainTab('video')}
            activeOpacity={0.8}
          >
            <Text style={[styles.officialTabText, mainTab === 'video' && styles.officialTabTextActive]}>
              Video training guide
            </Text>
            {mainTab === 'video' && <View style={styles.officialTabLine} />}
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* TAB 1: INFORMATION (Seminar Schedule, Calendar/List, Supervisor Info)   */}
        {/* ========================================================================= */}
        {mainTab === 'info' && (
          <View style={styles.tabContentPanel}>
            {/* 4. SEMINAR SCHEDULE HEADER */}
            <View style={styles.scheduleHeaderRow}>
              <Text style={styles.scheduleHeading}>Seminar schedule</Text>
            </View>

            {/* 5. MONTH & YEAR PICKER */}
            <View style={styles.datePickerContainer}>
              <View style={styles.dateSelectorBox}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.dateArrowBtn}>
                  <Ionicons name="chevron-back" size={18} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.dateDisplayTitle}>
                  {MONTH_NAMES[currentMonth - 1]} {currentYear}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.dateArrowBtn}>
                  <Ionicons name="chevron-forward" size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {/* View Mode Toggle: Calendar View vs List View */}
              <View style={styles.viewModeToggle}>
                <TouchableOpacity
                  style={[styles.viewModeBtn, viewMode === 'cal' && styles.viewModeBtnActive]}
                  onPress={() => setViewMode('cal')}
                >
                  <Ionicons name="calendar-outline" size={16} color={viewMode === 'cal' ? '#FFFFFF' : '#475569'} />
                  <Text style={[styles.viewModeBtnText, viewMode === 'cal' && styles.viewModeBtnTextActive]}>
                    Calendar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.viewModeBtn, viewMode === 'list' && styles.viewModeBtnActive]}
                  onPress={() => setViewMode('list')}
                >
                  <Ionicons name="list-outline" size={16} color={viewMode === 'list' ? '#FFFFFF' : '#475569'} />
                  <Text style={[styles.viewModeBtnText, viewMode === 'list' && styles.viewModeBtnTextActive]}>
                    List
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 6. TYPE FILTER PILLS (Matching in.atomy.com: All, Success Academy, Regional, One-day, Online) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsScroll}
              style={styles.filterPillsWrap}
            >
              {SEMINAR_TYPES.map((t) => {
                const isSelected = selectedType === t.id;
                return (
                  <TouchableOpacity
                    key={`filter-${t.id}`}
                    style={[styles.filterTypeBtn, isSelected && styles.filterTypeBtnActive]}
                    onPress={() => setSelectedType(t.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.typeDot, { backgroundColor: t.dotColor }]} />
                    <Text style={[styles.filterTypeLabel, isSelected && styles.filterTypeLabelActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 7. CALENDAR VIEW */}
            {viewMode === 'cal' ? (
              <View style={styles.calendarCard}>
                {/* Days of week header */}
                <View style={styles.weekDaysHeader}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w, idx) => (
                    <Text
                      key={`wd-${idx}`}
                      style={[
                        styles.weekDayText,
                        idx === 5 && { color: '#00A3E0' },
                        idx === 6 && { color: '#EF4444' },
                      ]}
                    >
                      {w}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {calendarDays.map((c) => {
                    if (!c.day) {
                      return <View key={c.key} style={styles.emptyDayCell} />;
                    }

                    const isSelected = selectedDay === c.day;
                    const isToday = c.day === 14;

                    return (
                      <TouchableOpacity
                        key={c.key}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                          isToday && !isSelected && styles.dayCellToday,
                        ]}
                        onPress={() => setSelectedDay(c.day)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayCellNumber,
                            isSelected && styles.dayCellNumberSelected,
                            isToday && !isSelected && styles.dayCellNumberToday,
                          ]}
                        >
                          {c.day}
                        </Text>

                        {/* Events indicator dots */}
                        {c.hasEvent && (
                          <View style={styles.eventDotsRow}>
                            {c.events.slice(0, 3).map((ev, evIdx) => (
                              <View
                                key={`dot-${ev.id}-${evIdx}`}
                                style={[
                                  styles.eventMiniDot,
                                  { backgroundColor: ev.dotColor },
                                  isSelected && { borderColor: '#FFFFFF', borderWidth: 1 },
                                ]}
                              />
                            ))}
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected Day Agenda Header */}
                <View style={styles.selectedDayAgendaHeader}>
                  <View style={styles.agendaDatePill}>
                    <Ionicons name="calendar" size={14} color="#00A3E0" />
                    <Text style={styles.agendaDateText}>
                      {selectedDay} {MONTH_NAMES[currentMonth - 1]} {currentYear}
                    </Text>
                  </View>
                  <Text style={styles.agendaCountText}>
                    {selectedDaySeminars.length} {selectedDaySeminars.length === 1 ? 'Seminar' : 'Seminars'}
                  </Text>
                </View>

                {/* Selected Day Seminar Cards */}
                {selectedDaySeminars.length > 0 ? (
                  <View style={styles.agendaList}>
                    {selectedDaySeminars.map((sem) => (
                      <View key={`agenda-${sem.id}`} style={styles.seminarItemCard}>
                        <View style={styles.seminarHeaderRow}>
                          <View style={[styles.seminarBadge, { backgroundColor: sem.dotColor }]}>
                            <Text style={styles.seminarBadgeText}>{sem.typeLabel}</Text>
                          </View>
                          <Text style={styles.seminarCityText}>📍 {sem.city}</Text>
                        </View>

                        <Text style={styles.seminarCardTitle}>{sem.title}</Text>

                        <View style={styles.infoRow}>
                          <Ionicons name="time-outline" size={14} color="#00A3E0" />
                          <Text style={styles.infoText}>{sem.time}</Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Ionicons name="location-outline" size={14} color="#00A3E0" />
                          <Text style={styles.infoText}>{sem.venue}</Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Ionicons name="mic-outline" size={14} color="#7C3AED" />
                          <Text style={[styles.infoText, { color: '#7C3AED', fontWeight: '700' }]}>
                            Speaker: {sem.speaker}
                          </Text>
                        </View>

                        <Text style={styles.seminarDescription}>{sem.description}</Text>

                        <View style={styles.actionButtonsRow}>
                          <TouchableOpacity
                            style={styles.mapBtn}
                            onPress={() => setMapSeminar(sem)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="map-outline" size={15} color="#00A3E0" />
                            <Text style={styles.mapBtnText}>View Map</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.bookTicketBtn}
                            onPress={() => {
                              setBookingSeminar(sem);
                              setBookingSuccess(false);
                            }}
                            activeOpacity={0.85}
                          >
                            <Ionicons name="ticket" size={15} color="#FFFFFF" />
                            <Text style={styles.bookTicketBtnText}>Book Ticket</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noEventsBox}>
                    <Ionicons name="calendar-outline" size={32} color="#CBD5E1" />
                    <Text style={styles.noEventsText}>No seminars scheduled for this day.</Text>
                    <Text style={styles.noEventsSub}>Click on dates with colored dots to view scheduled events.</Text>
                  </View>
                )}
              </View>
            ) : (
              /* 8. LIST VIEW */
              <View style={styles.listViewContainer}>
                {filteredSeminars.length > 0 ? (
                  filteredSeminars.map((sem) => (
                    <View key={`list-${sem.id}`} style={styles.seminarItemCard}>
                      <View style={styles.seminarHeaderRow}>
                        <View style={[styles.seminarBadge, { backgroundColor: sem.dotColor }]}>
                          <Text style={styles.seminarBadgeText}>{sem.typeLabel}</Text>
                        </View>
                        <Text style={styles.seminarCityText}>📍 {sem.city}</Text>
                      </View>

                      <Text style={styles.seminarCardTitle}>{sem.title}</Text>

                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color="#00A3E0" />
                        <Text style={styles.infoText}>{sem.dateStr} • {sem.time}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color="#00A3E0" />
                        <Text style={styles.infoText}>{sem.venue}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="mic-outline" size={14} color="#7C3AED" />
                        <Text style={[styles.infoText, { color: '#7C3AED', fontWeight: '700' }]}>
                          Speaker: {sem.speaker}
                        </Text>
                      </View>

                      <Text style={styles.seminarDescription}>{sem.description}</Text>

                      <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                          style={styles.mapBtn}
                          onPress={() => setMapSeminar(sem)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="map-outline" size={15} color="#00A3E0" />
                          <Text style={styles.mapBtnText}>View Map</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.bookTicketBtn}
                          onPress={() => {
                            setBookingSeminar(sem);
                            setBookingSuccess(false);
                          }}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="ticket" size={15} color="#FFFFFF" />
                          <Text style={styles.bookTicketBtnText}>Book Ticket</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noEventsBox}>
                    <Ionicons name="calendar-outline" size={32} color="#CBD5E1" />
                    <Text style={styles.noEventsText}>No events match the selected filter.</Text>
                  </View>
                )}
              </View>
            )}

            {/* 9. BOTTOM ATOMY TICKET PROMO BANNER (Exact text from in.atomy.com) */}
            <View style={styles.ticketBannerCard}>
              <View style={styles.ticketBannerTextCol}>
                <Ionicons name="ticket" size={24} color="#00A3E0" />
                <Text style={styles.ticketBannerDesc}>
                  You can check the seminar schedule more conveniently by using the Atomy Ticket.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.goToTicketBtn}
                onPress={handleOpenTicketSite}
                activeOpacity={0.88}
              >
                <Text style={styles.goToTicketBtnText}>Go to Atomy Ticket</Text>
                <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 10. SUPERVISED BY HEADQUARTER SECTION (Exact text and structure from in.atomy.com) */}
            <View style={styles.supervisedSection}>
              <Text style={styles.supervisedMainTitle}>
                Atomy Seminar is supervised by Atomy India headquarter
              </Text>

              {/* One Day Seminar Card */}
              <View style={styles.supervisedCard}>
                <View style={styles.supervisedHeaderRow}>
                  <View style={styles.supervisedIconCircle}>
                    <Ionicons name="calendar-outline" size={24} color="#EA580C" />
                  </View>
                  <Text style={styles.supervisedCardTitle}>One Day Seminar</Text>
                </View>

                <Text style={styles.supervisedCardDesc}>
                  Atomy One Day Seminars are official company run seminars that invite smart-sumers, who consume the absolute quality, absolute price, masstige products, to share company principles, Atomy culture and economics, products, and vision.
                </Text>

                <View style={styles.howToParticipateBox}>
                  <Text style={styles.howToTitle}>How to participate in the Seminars</Text>
                  <Text style={styles.howToStep}>
                    1. Seminar applications are received through the education centres. Members who wish to participate must submit the seminar application form to their designated centers.
                  </Text>
                  <Text style={styles.howToStep}>
                    2. Please contact your designated centers for more information. Once the center leaders submit the applications, they will be assigned seats in the seminar room.
                  </Text>
                  <Text style={styles.howToStep}>
                    3. For more information, click on the date from the calendar.
                  </Text>
                </View>
              </View>

              {/* Success Academy Card */}
              <View style={styles.supervisedCard}>
                <View style={styles.supervisedHeaderRow}>
                  <View style={[styles.supervisedIconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="ribbon-outline" size={24} color="#D97706" />
                  </View>
                  <Text style={styles.supervisedCardTitle}>Success Academy</Text>
                </View>

                <Text style={styles.supervisedCardDesc}>
                  Atomy Success Academy preaches Atomy’s vision for fulfilling customer success and masstalism (mass-capitalism), while congratulating promotions, and writing out the life scenario to help lead people to success.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VIDEO TRAINING GUIDE (Matching in.atomy.com: YouTube & CH.ATOMY)   */}
        {/* ========================================================================= */}
        {mainTab === 'video' && (
          <View style={styles.tabContentPanel}>
            {/* Box 1: Atomy India Official YouTube Channel */}
            <View style={styles.videoChannelCard}>
              <View style={styles.channelHeaderRow}>
                <View style={[styles.channelIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="logo-youtube" size={26} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.channelName}>Atomy India Official YouTube Channel</Text>
                  <Text style={styles.channelBadgeText}>Official Broadcast</Text>
                </View>
              </View>

              <View style={styles.channelBodyBox}>
                <Text style={styles.channelHeadline}>Just turn it on with PC, mobile, or tablet!</Text>
                <Text style={styles.channelSubtext}>
                  Watch the videos curated by Atomy anytime, anywhere, conveniently 24/7.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.channelActionBtn, { backgroundColor: '#DC2626' }]}
                onPress={handleOpenYouTube}
                activeOpacity={0.88}
              >
                <Ionicons name="logo-youtube" size={17} color="#FFFFFF" />
                <Text style={styles.channelActionBtnText}>Go to Official YouTube</Text>
                <Ionicons name="open-outline" size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Box 2: Channel Atomy (CH.ATOMY) */}
            <View style={styles.videoChannelCard}>
              <View style={styles.channelHeaderRow}>
                <View style={[styles.channelIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="tv-outline" size={26} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.channelName}>Channel Atomy (CH.ATOMY)</Text>
                  <Text style={styles.channelBadgeText}>Global Knowledge Hub</Text>
                </View>
              </View>

              <View style={styles.channelBodyBox}>
                <Text style={styles.channelHeadline}>Add convenience to your Atomy life!</Text>
                <Text style={styles.channelSubtext}>
                  Watch various videos, Atomy news, and educational materials on PC, mobile, or tablet!
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.channelActionBtn, { backgroundColor: COLORS.primary }]}
                onPress={handleOpenChAtomy}
                activeOpacity={0.88}
              >
                <Ionicons name="play-circle" size={17} color="#FFFFFF" />
                <Text style={styles.channelActionBtnText}>Go to CH.ATOMY</Text>
                <Ionicons name="open-outline" size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Curated Media Highlights */}
            <View style={styles.mediaHighlightsSection}>
              <Text style={styles.mediaHighlightsTitle}>Curated Video Topics</Text>

              {[
                { title: 'The Soul of Masstige: Absolute Quality & Price', duration: '24 min', tag: 'Chairman Vision' },
                { title: 'Biotechnology behind HemoHIM: KAERI Research', duration: '18 min', tag: 'Product Science' },
                { title: 'Absolute CellActive Skincare Technology Breakdown', duration: '14 min', tag: 'Beauty Masterclass' },
                { title: 'Life Scenario Formulation Guide for Success Academy', duration: '32 min', tag: 'Leadership' },
              ].map((m, idx) => (
                <TouchableOpacity
                  key={`topic-${idx}`}
                  style={styles.topicRow}
                  activeOpacity={0.8}
                  onPress={handleOpenChAtomy}
                >
                  <View style={styles.topicPlayIcon}>
                    <Ionicons name="play" size={14} color="#00A3E0" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topicTitle}>{m.title}</Text>
                    <Text style={styles.topicMeta}>{m.tag} • {m.duration}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Official Corporate & Support Footer */}
        <AtomyFooter />
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ========================================================================= */}
      {/* VENUE MAP MODAL (Showing Map Coordinates, Address, Landmark, Directions) */}
      {/* ========================================================================= */}
      <Modal
        visible={!!mapSeminar}
        transparent
        animationType="fade"
        onRequestClose={() => setMapSeminar(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalTopBar}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSeminarType}>{mapSeminar?.typeLabel}</Text>
                <Text style={styles.modalVenueTitle}>{mapSeminar?.venue}</Text>
              </View>
              <TouchableOpacity onPress={() => setMapSeminar(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Simulated Map Visual Box matching Google Map ID: SEMINAR_MAP */}
            <View style={styles.simulatedMapBox}>
              <View style={styles.mapGridLines}>
                <Ionicons name="location" size={42} color="#DC2626" />
                <Text style={styles.mapMarkerText}>{mapSeminar?.city} Event Venue</Text>
              </View>
              <View style={styles.mapCurrentLocPill}>
                <Text style={styles.mapCurrentLocText}>Current Venue Location: {mapSeminar?.city}</Text>
              </View>
            </View>

            <View style={styles.modalAddressDetails}>
              <Text style={styles.addressLabel}>Official Venue Address:</Text>
              <Text style={styles.addressText}>{mapSeminar?.address}</Text>

              <Text style={styles.timingLabel}>Date & Time:</Text>
              <Text style={styles.timingText}>{mapSeminar?.dateStr} • {mapSeminar?.time}</Text>
            </View>

            <TouchableOpacity
              style={styles.openExternalMapBtn}
              onPress={() => {
                const query = encodeURIComponent(`${mapSeminar?.venue}, ${mapSeminar?.address}`);
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
              }}
              activeOpacity={0.88}
            >
              <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
              <Text style={styles.openExternalMapBtnText}>Open in Google Maps Navigation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* TICKET BOOKING MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={!!bookingSeminar}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingSeminar(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContentCard, { maxHeight: '90%' }]}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalVenueTitle}>
                {bookingSuccess ? 'Seat Reserved Successfully! 🎉' : 'Delegate Registration'}
              </Text>
              <TouchableOpacity onPress={() => setBookingSeminar(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {bookingSuccess ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={60} color="#10B981" />
                <Text style={styles.successHeading}>Free Delegate Pass Confirmed</Text>
                <Text style={styles.successSub}>
                  Your seat for <Text style={{ fontWeight: '800' }}>{bookingSeminar?.title}</Text> has been registered with Atomy India Headquarter.
                </Text>
                <View style={styles.ticketCodePill}>
                  <Text style={styles.ticketCodeText}>
                    AWB/PASS: ATM-SEM-{Math.floor(10000 + Math.random() * 90000)}
                  </Text>
                </View>
                <Text style={styles.passAdvice}>
                  Show this digital pass or your Member ID at the entrance registration desk.
                </Text>
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => setBookingSeminar(null)}
                >
                  <Text style={styles.doneBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.bookingFormWrap}>
                <Text style={styles.formSeminarName}>{bookingSeminar?.title}</Text>
                <Text style={styles.formSeminarDate}>📅 {bookingSeminar?.dateStr} • {bookingSeminar?.time}</Text>
                <Text style={styles.formSeminarAddress}>📍 {bookingSeminar?.venue}</Text>

                <View style={styles.verifiedMemberCard}>
                  <Text style={styles.memberCardHeader}>Attendee Information:</Text>
                  <Text style={styles.memberCardName}>{currentUser?.name || 'Registered Atomy Member'}</Text>
                  <Text style={styles.memberCardMeta}>{currentUser?.memberId ? `Member ID: ${currentUser.memberId} • ` : ''}{currentUser?.phone || '+91 98765 43210'}</Text>
                  <Text style={styles.memberCardCenter}>Education Centre: Cyber Park Central Centre, Gurugram</Text>
                </View>

                <TouchableOpacity
                  style={styles.confirmPassBtn}
                  onPress={() => setBookingSuccess(true)}
                  activeOpacity={0.88}
                >
                  <Ionicons name="ticket" size={17} color="#FFFFFF" />
                  <Text style={styles.confirmPassBtnText}>Confirm Free Delegate Seat</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNavBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 10 : 12,
  },
  navBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 4,
  },
  navEmblem: {
    width: 26,
    height: 26,
  },
  navMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  navSubTitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  ticketHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  titleSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  pageMainHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  breadGray: {
    fontSize: 12,
    color: '#64748B',
  },
  breadSep: {
    fontSize: 12,
    color: '#94A3B8',
  },
  breadCyan: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  officialTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 8,
  },
  officialTabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  officialTabBtnActive: {},
  officialTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  officialTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  officialTabLine: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  tabContentPanel: {
    paddingHorizontal: 14,
    paddingTop: 16,
    gap: 16,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDisplayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  viewModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewModeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  viewModeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  viewModeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  filterPillsWrap: {},
  filterPillsScroll: {
    gap: 8,
  },
  filterTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTypeBtnActive: {
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterTypeLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  weekDayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 8,
  },
  emptyDayCell: {
    width: `${100 / 7}%`,
    height: 48,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dayCellToday: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  dayCellNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  dayCellNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayCellNumberToday: {
    color: '#00A3E0',
    fontWeight: '800',
  },
  eventDotsRow: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    bottom: 4,
  },
  eventMiniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  selectedDayAgendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  agendaDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  agendaDateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00A3E0',
  },
  agendaCountText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  agendaList: {
    marginTop: 10,
    gap: 12,
  },
  listViewContainer: {
    gap: 12,
  },
  seminarItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  seminarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seminarBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seminarBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  seminarCityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  seminarCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  seminarDescription: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 10,
    borderRadius: 8,
  },
  mapBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
  bookTicketBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookTicketBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noEventsBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  noEventsText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  noEventsSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
  },
  ticketBannerCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 12,
  },
  ticketBannerTextCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ticketBannerDesc: {
    flex: 1,
    fontSize: 13,
    color: '#0369A1',
    lineHeight: 18,
    fontWeight: '600',
  },
  goToTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  goToTicketBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  supervisedSection: {
    gap: 12,
    marginTop: 4,
  },
  supervisedMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  supervisedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  supervisedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  supervisedIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supervisedCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  supervisedCardDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  howToParticipateBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  howToTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  howToStep: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  videoChannelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  channelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  channelIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  channelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  channelBodyBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  channelHeadline: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  channelSubtext: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  channelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  channelActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mediaHighlightsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  mediaHighlightsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topicPlayIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  topicMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSeminarType: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3E0',
    textTransform: 'uppercase',
  },
  modalVenueTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  simulatedMapBox: {
    height: 160,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGridLines: {
    alignItems: 'center',
    gap: 4,
  },
  mapMarkerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  mapCurrentLocPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  mapCurrentLocText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalAddressDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  addressText: {
    fontSize: 12.5,
    color: '#1E293B',
    lineHeight: 17,
  },
  timingLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 6,
  },
  timingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A3E0',
  },
  openExternalMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  openExternalMapBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bookingFormWrap: {
    gap: 10,
  },
  formSeminarName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  formSeminarDate: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
  formSeminarAddress: {
    fontSize: 12,
    color: '#475569',
  },
  verifiedMemberCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 12,
    gap: 3,
    marginTop: 6,
  },
  memberCardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    marginBottom: 2,
  },
  memberCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  memberCardMeta: {
    fontSize: 12,
    color: '#475569',
  },
  memberCardCenter: {
    fontSize: 11.5,
    color: '#64748B',
  },
  confirmPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 6,
  },
  confirmPassBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  successHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  successSub: {
    fontSize: 12.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
  ticketCodePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  ticketCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  passAdvice: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
