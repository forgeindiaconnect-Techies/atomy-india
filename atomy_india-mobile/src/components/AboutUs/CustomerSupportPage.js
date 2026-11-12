import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Linking,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import {
  submitSupportTicketApi,
  getSupportTicketApi,
  getCustomerTicketsByEmailApi,
  addCustomerTicketReplyApi,
} from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const phoenixLogo = require('../../../assets/fic-symbol.png');

const INQUIRY_CATEGORIES = [
  'Order & Delivery',
  'Product Details & Quality',
  'Membership & Verification',
  'Commission & PV Points',
  'Returns & Exchanges',
  'Education Centre Guidance',
  'Other',
];

export default function CustomerSupportPage({
  onNavigateHome,
  onNavigateBack,
  onNavigateFaq,
  onNavigateFindCentre,
  onNavigateCompany,
  onNavigateNotice,
  onCartPress,
  cartCount = 0,
  currentUser,
  deliveryAddress,
}) {
  // Navigation Sub-Tabs: 'new' | 'track'
  const [activeSubTab, setActiveSubTab] = useState('new');

  // Form Fields
  const [inquiryCategory, setInquiryCategory] = useState(INQUIRY_CATEGORIES[0]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [problemTitle, setProblemTitle] = useState('');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [orderNo, setOrderNo] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Submission State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Tracking & Live Chat State
  const [ticketSearchInput, setTicketSearchInput] = useState('');
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [customerInquiriesList, setCustomerInquiriesList] = useState([]);
  const [isSearchingTicket, setIsSearchingTicket] = useState(false);
  const [ticketSearchError, setTicketSearchError] = useState('');
  const [customerReplyText, setCustomerReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const chatScrollRef = useRef(null);

  // Pre-fill user details on mount or user change
  useEffect(() => {
    if (currentUser) {
      if (!name && currentUser.name) setName(currentUser.name);
      if (!email && currentUser.email) setEmail(currentUser.email);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Load customer recent tickets by email
  const loadCustomerTickets = async (userEmail) => {
    const targetEmail = userEmail || email || currentUser?.email;
    if (!targetEmail || !targetEmail.trim()) return;
    try {
      const tickets = await getCustomerTicketsByEmailApi(targetEmail.trim());
      if (Array.isArray(tickets)) {
        setCustomerInquiriesList(tickets);
      }
    } catch (err) {
      // quiet fallback
    }
  };

  useEffect(() => {
    if (email) {
      loadCustomerTickets(email);
    }
  }, [email]);

  // Handle Hotline Calls & Support Emails
  const handleCallHotline = (number = '01246959000') => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Customer Care', 'Helpline: 0124-695-9000 / 1800-103-5555 (Mon-Fri 9:30 AM-6:30 PM)');
    });
  };

  const handleSendEmail = () => {
    Linking.openURL('mailto:atomy_in@atomypark.com?subject=Customer Support Inquiry').catch(() => {
      Alert.alert('Support Email', 'Email: atomy_in@atomypark.com');
    });
  };

  // Submit 1:1 Support Ticket
  const handleSubmitInquiry = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your Full Name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Required Field', 'Please enter a valid Email Address.');
      return;
    }
    if (inquiryCategory === 'Other' && !problemTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a Problem Title.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Required Field', 'Please enter your message details.');
      return;
    }

    setIsSubmitting(true);
    const subjectText =
      inquiryCategory === 'Other' && problemTitle.trim()
        ? `[${inquiryCategory}] ${problemTitle.trim()}`
        : `[${inquiryCategory}] Inquiry from ${name.trim()}`;

    const ticketPayload = {
      customerName: name.trim(),
      customerEmail: email.trim().toLowerCase(),
      customerPhone: phone.trim(),
      category: inquiryCategory,
      subject: subjectText,
      initialMessage: message.trim(),
      orderId: orderNo.trim() || undefined,
      pincode: currentUser?.pincode || deliveryAddress?.pincode || undefined,
    };

    try {
      const result = await submitSupportTicketApi(ticketPayload);
      setSubmittedTicket(result);
      setIsSubmitted(true);
      // Refresh tickets list
      loadCustomerTickets(email.trim());
    } catch (err) {
      // Local fallback representation for instant response
      const fallbackTicket = {
        ticketId: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: name.trim(),
        customerEmail: email.trim().toLowerCase(),
        customerPhone: phone.trim(),
        category: inquiryCategory,
        subject: subjectText,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        orderId: orderNo.trim() || null,
        messages: [
          {
            sender: 'CUSTOMER',
            message: message.trim(),
            sentAt: new Date().toISOString(),
          },
        ],
      };
      setSubmittedTicket(fallbackTicket);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to submit another inquiry
  const handleResetForm = () => {
    setMessage('');
    setProblemTitle('');
    setOrderNo('');
    setIsSubmitted(false);
    setSubmittedTicket(null);
  };

  // Search or Load Ticket for Tracking
  const handleSearchTicket = async (ticketIdToFetch) => {
    const tid = (ticketIdToFetch || ticketSearchInput || '').trim();
    if (!tid) {
      setTicketSearchError('Please enter an Inquiry Reference ID (e.g. TCK-...)');
      return;
    }

    setIsSearchingTicket(true);
    setTicketSearchError('');

    try {
      const ticket = await getSupportTicketApi(tid);
      if (ticket && ticket.ticketId) {
        setTrackedTicket(ticket);
        setTicketSearchInput(ticket.ticketId);
      } else {
        // Search inside loaded customer list
        const found = customerInquiriesList.find(
          (t) => t.ticketId?.toLowerCase() === tid.toLowerCase()
        );
        if (found) {
          setTrackedTicket(found);
          setTicketSearchInput(found.ticketId);
        } else {
          setTicketSearchError(`Inquiry ticket "${tid}" was not found.`);
        }
      }
    } catch (err) {
      setTicketSearchError(`Could not find inquiry "${tid}".`);
    } finally {
      setIsSearchingTicket(false);
    }
  };

  // Send Customer Reply to Existing Ticket
  const handleSendCustomerReply = async () => {
    if (!trackedTicket || !customerReplyText.trim()) return;
    const text = customerReplyText.trim();
    setIsSendingReply(true);

    try {
      const reply = await addCustomerTicketReplyApi(trackedTicket.ticketId, text);
      const newMsg = reply && reply.message ? reply : {
        sender: 'CUSTOMER',
        message: text,
        sentAt: new Date().toISOString(),
      };

      setTrackedTicket((prev) => ({
        ...prev,
        status: prev.status === 'RESOLVED' || prev.status === 'CLOSED' ? 'IN_PROGRESS' : prev.status,
        messages: [...(prev.messages || []), newMsg],
      }));
      setCustomerReplyText('');

      // Auto scroll chat
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (err) {
      // Optimistic addition
      const optimisticMsg = {
        sender: 'CUSTOMER',
        message: text,
        sentAt: new Date().toISOString(),
      };
      setTrackedTicket((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), optimisticMsg],
      }));
      setCustomerReplyText('');
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP NAVBAR */}
      <View style={styles.topNavBar}>
        <TouchableOpacity
          style={styles.navIconBtn}
          onPress={onNavigateBack || onNavigateHome}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.brandingCenter}>
          <Image source={phoenixLogo} style={styles.phoenixEmblem} resizeMode="contain" />
          <View style={styles.brandingTextCol}>
            <Text style={styles.brandingTitle} numberOfLines={1}>
              CUSTOMER SUPPORT
            </Text>
            <Text style={styles.brandingSubtitle}>1:1 Happiness Desk & Inquiries</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.navIconBtn}
          onPress={onCartPress}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 2. OFFICIAL SUPPORT HOTLINE & EMAIL STRIP */}
      <View style={styles.hotlineStrip}>
        <TouchableOpacity
          style={styles.hotlineCol}
          onPress={() => handleCallHotline('01246959000')}
          activeOpacity={0.75}
        >
          <View style={styles.hotlineIconBox}>
            <Ionicons name="call" size={18} color="#00A3E0" />
          </View>
          <View style={styles.hotlineTextCol}>
            <Text style={styles.hotlineLabel}>Toll-Free Helpline</Text>
            <Text style={styles.hotlineVal}>0124-695-9000</Text>
            <Text style={styles.hotlineSub}>Mon-Fri 09:30 AM – 06:30 PM</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.hotlineDivider} />

        <TouchableOpacity
          style={styles.hotlineCol}
          onPress={handleSendEmail}
          activeOpacity={0.75}
        >
          <View style={[styles.hotlineIconBox, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="mail" size={18} color="#16A34A" />
          </View>
          <View style={styles.hotlineTextCol}>
            <Text style={styles.hotlineLabel}>Direct Support Email</Text>
            <Text style={styles.hotlineVal} numberOfLines={1}>atomy_in@atomypark.com</Text>
            <Text style={styles.hotlineSub}>Average response within 24h</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. SUB-TABS: NEW INQUIRY vs TRACK & LIVE CHAT */}
      <View style={styles.subTabsBar}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'new' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('new')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={activeSubTab === 'new' ? '#00A3E0' : '#64748B'}
          />
          <Text
            style={[styles.subTabBtnText, activeSubTab === 'new' && styles.subTabBtnTextActive]}
          >
            New Inquiry
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'track' && styles.subTabBtnActive]}
          onPress={() => {
            setActiveSubTab('track');
            if (email) loadCustomerTickets(email);
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={18}
            color={activeSubTab === 'track' ? '#00A3E0' : '#64748B'}
          />
          <Text
            style={[styles.subTabBtnText, activeSubTab === 'track' && styles.subTabBtnTextActive]}
          >
            Track Inquiries & Chat
          </Text>
          {customerInquiriesList.length > 0 && (
            <View style={styles.tabCountBadge}>
              <Text style={styles.tabCountBadgeText}>{customerInquiriesList.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* SUB-TAB 1: NEW INQUIRY FORM */}
        {/* ======================================================== */}
        {activeSubTab === 'new' ? (
          isSubmitted ? (
            /* SUCCESS CARD */
            <View style={styles.successCard}>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Inquiry Submitted Successfully!</Text>
              <View style={styles.refIdBox}>
                <Text style={styles.refIdLabel}>Inquiry Reference ID</Text>
                <Text style={styles.refIdValue}>
                  {submittedTicket?.ticketId || 'TCK-CONFIRMED'}
                </Text>
              </View>
              <Text style={styles.successNotice}>
                Our Atomy India Customer Support team and regional hub will review your inquiry and
                respond to <Text style={{ fontWeight: '700', color: '#0F172A' }}>{email}</Text> within
                24 business hours.
              </Text>

              <TouchableOpacity
                style={styles.trackChatNowBtn}
                onPress={() => {
                  setTrackedTicket(submittedTicket);
                  setTicketSearchInput(submittedTicket?.ticketId || '');
                  setActiveSubTab('track');
                  setIsSubmitted(false);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
                <Text style={styles.trackChatNowBtnText}>View Live Chat & Track Replies</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitAnotherBtn}
                onPress={handleResetForm}
                activeOpacity={0.8}
              >
                <Text style={styles.submitAnotherBtnText}>Submit Another Inquiry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* INQUIRY FORM */
            <View style={styles.formCard}>
              <View style={styles.formBanner}>
                <Ionicons name="information-circle" size={20} color="#00A3E0" />
                <Text style={styles.formBannerText}>
                  Submit 1:1 inquiries regarding orders, products, verification, or delivery.
                </Text>
              </View>

              {/* Inquiry Category Selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Inquiry Category <Text style={styles.reqStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerSelector}
                  onPress={() => setShowCategoryPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerSelectorText}>{inquiryCategory}</Text>
                  <Ionicons name="chevron-down" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Problem Title (if Other) */}
              {inquiryCategory === 'Other' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Problem Title <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Brief subject of your issue..."
                    placeholderTextColor="#94A3B8"
                    value={problemTitle}
                    onChangeText={setProblemTitle}
                  />
                </View>
              )}

              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Your Full Name <Text style={styles.reqStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email Address */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Email Address <Text style={styles.reqStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. rahul@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Phone Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={13}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Order Reference Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Order Number (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. ORD-20261112-XXXX"
                  placeholderTextColor="#94A3B8"
                  value={orderNo}
                  onChangeText={setOrderNo}
                />
              </View>

              {/* Message Details */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Message Details <Text style={styles.reqStar}>*</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Please describe your inquiry, issue or question in detail..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmitInquiry}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={17} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Submit 1:1 Inquiry</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )
        ) : (
          /* ======================================================== */
          /* SUB-TAB 2: TRACK INQUIRIES & LIVE REPLIES */
          /* ======================================================== */
          <View style={styles.trackSection}>
            {/* Quick Ticket Chips of Customer Inquiries */}
            {customerInquiriesList.length > 0 && (
              <View style={styles.chipsSection}>
                <Text style={styles.chipsSectionTitle}>Your Recent Inquiries:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {customerInquiriesList.map((t) => {
                    const isSelected = trackedTicket?.ticketId === t.ticketId;
                    const st = (t.status || 'OPEN').toUpperCase();
                    return (
                      <TouchableOpacity
                        key={t.ticketId}
                        style={[styles.ticketChip, isSelected && styles.ticketChipSelected]}
                        onPress={() => {
                          setTrackedTicket(t);
                          setTicketSearchInput(t.ticketId);
                          setTicketSearchError('');
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.ticketChipId, isSelected && styles.ticketChipIdSelected]}>
                          {t.ticketId}
                        </Text>
                        <View
                          style={[
                            styles.chipStatusDot,
                            {
                              backgroundColor:
                                st === 'RESOLVED' || st === 'CLOSED'
                                  ? '#10B981'
                                  : st === 'IN_PROGRESS'
                                  ? '#0284C7'
                                  : '#F59E0B',
                            },
                          ]}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Ticket Search Bar */}
            <View style={styles.searchBarRow}>
              <View style={styles.searchInputWrap}>
                <Ionicons name="search" size={18} color="#64748B" />
                <TextInput
                  style={styles.ticketSearchInput}
                  placeholder="Enter Ticket ID (e.g. TCK-1001)..."
                  placeholderTextColor="#94A3B8"
                  value={ticketSearchInput}
                  onChangeText={(val) => {
                    setTicketSearchInput(val);
                    if (ticketSearchError) setTicketSearchError('');
                  }}
                  autoCapitalize="characters"
                />
              </View>
              <TouchableOpacity
                style={styles.searchTicketBtn}
                onPress={() => handleSearchTicket()}
                disabled={isSearchingTicket}
                activeOpacity={0.8}
              >
                {isSearchingTicket ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.searchTicketBtnText}>Search</Text>
                )}
              </TouchableOpacity>
            </View>

            {ticketSearchError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorBannerText}>{ticketSearchError}</Text>
              </View>
            ) : null}

            {/* Live Chat Thread Card */}
            {trackedTicket ? (
              <View style={styles.chatThreadCard}>
                {/* Chat Header */}
                <View style={styles.chatHeader}>
                  <View style={styles.chatHeaderBadges}>
                    <View style={styles.ticketIdBadge}>
                      <Text style={styles.ticketIdBadgeText}>{trackedTicket.ticketId}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusTag,
                        {
                          backgroundColor:
                            trackedTicket.status === 'RESOLVED'
                              ? '#D1FAE5'
                              : trackedTicket.status === 'IN_PROGRESS'
                              ? '#E0F2FE'
                              : '#FEF3C7',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          {
                            color:
                              trackedTicket.status === 'RESOLVED'
                                ? '#065F46'
                                : trackedTicket.status === 'IN_PROGRESS'
                                ? '#0369A1'
                                : '#92400E',
                          },
                        ]}
                      >
                        {trackedTicket.status || 'OPEN'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.chatSubjectText}>{trackedTicket.subject}</Text>

                  <View style={styles.chatMetaRow}>
                    <Text style={styles.chatMetaText}>
                      Category: <Text style={{ fontWeight: '600' }}>{trackedTicket.category}</Text>
                    </Text>
                    {trackedTicket.orderId && (
                      <Text style={styles.chatMetaText}>
                        {' '}• Order: <Text style={{ fontWeight: '600' }}>{trackedTicket.orderId}</Text>
                      </Text>
                    )}
                  </View>

                  <View style={styles.chatActionBtnsRow}>
                    <TouchableOpacity
                      style={styles.refreshChatBtn}
                      onPress={() => handleSearchTicket(trackedTicket.ticketId)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="refresh" size={14} color="#00A3E0" />
                      <Text style={styles.refreshChatBtnText}>Refresh Chat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.closeChatBtn}
                      onPress={() => {
                        setTrackedTicket(null);
                        setTicketSearchInput('');
                        setTicketSearchError('');
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle" size={15} color="#DC2626" />
                      <Text style={styles.closeChatBtnText}>Close Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Messages Stream */}
                <ScrollView
                  ref={chatScrollRef}
                  style={styles.chatMessagesStream}
                  contentContainerStyle={styles.chatMessagesContent}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
                >
                  {trackedTicket.messages && trackedTicket.messages.length > 0 ? (
                    trackedTicket.messages.map((msg, idx) => {
                      const isAgent = msg.sender === 'ADMIN' || msg.sender === 'DISTRIBUTOR';
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.msgBubbleRow,
                            isAgent ? styles.msgRowAgent : styles.msgRowCustomer,
                          ]}
                        >
                          <View
                            style={[
                              styles.msgBubble,
                              isAgent ? styles.msgBubbleAgent : styles.msgBubbleCustomer,
                            ]}
                          >
                            <View style={styles.msgSenderRow}>
                              <Ionicons
                                name={isAgent ? 'headset' : 'person-circle'}
                                size={13}
                                color={isAgent ? '#00A3E0' : '#475569'}
                              />
                              <Text
                                style={[
                                  styles.msgSenderName,
                                  isAgent && { color: '#0284C7', fontWeight: '700' },
                                ]}
                              >
                                {isAgent
                                  ? 'Atomy Operations Support'
                                  : `${trackedTicket.customerName || 'You'} (Customer)`}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.msgText,
                                isAgent && styles.msgTextAgent,
                              ]}
                            >
                              {msg.message}
                            </Text>
                            <Text style={styles.msgTime}>
                              {new Date(
                                msg.sentAt || msg.createdAt || Date.now()
                              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.emptyMessagesBox}>
                      <Ionicons name="chatbubble-ellipses-outline" size={36} color="#94A3B8" />
                      <Text style={styles.emptyMessagesText}>No messages recorded yet.</Text>
                    </View>
                  )}
                </ScrollView>

                {/* Reply Input Bar */}
                <View style={styles.replyBar}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Type your reply to Atomy Support..."
                    placeholderTextColor="#94A3B8"
                    value={customerReplyText}
                    onChangeText={setCustomerReplyText}
                    editable={!isSendingReply && trackedTicket.status !== 'CLOSED'}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendReplyBtn,
                      (!customerReplyText.trim() || isSendingReply) && styles.sendReplyBtnDisabled,
                    ]}
                    onPress={handleSendCustomerReply}
                    disabled={!customerReplyText.trim() || isSendingReply}
                    activeOpacity={0.8}
                  >
                    {isSendingReply ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="send" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.noTicketCard}>
                <Ionicons name="chatbubbles-outline" size={54} color="#CBD5E1" />
                <Text style={styles.noTicketTitle}>Select or Search an Inquiry</Text>
                <Text style={styles.noTicketSub}>
                  Enter your Inquiry Reference ID above to see live updates and agent replies from our
                  support desk.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 4. OFFICIAL HEADQUARTERS CONTACT DETAILS (Matching Website) */}
        <View style={styles.contactHqCard}>
          <Text style={styles.contactHqCardTitle}>Official Contact Details & Corporate HQ</Text>

          {/* 1. Hotline */}
          <TouchableOpacity
            style={styles.contactHqRow}
            onPress={() => handleCallHotline('01246959000')}
            activeOpacity={0.8}
          >
            <View style={[styles.contactHqIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="call" size={20} color="#00A3E0" />
            </View>
            <View style={styles.contactHqContent}>
              <Text style={styles.contactHqLabel}>Customer Support Hotline</Text>
              <Text style={styles.contactHqValue}>0124-695-9000</Text>
              <Text style={styles.contactHqSub}>Toll-Free: 1800-103-5555 • Tap to Call</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.contactHqDivider} />

          {/* 2. Direct Support Email */}
          <TouchableOpacity
            style={styles.contactHqRow}
            onPress={handleSendEmail}
            activeOpacity={0.8}
          >
            <View style={[styles.contactHqIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="mail" size={20} color="#16A34A" />
            </View>
            <View style={styles.contactHqContent}>
              <Text style={styles.contactHqLabel}>Direct Support Email</Text>
              <Text style={styles.contactHqValue}>atomy_in@atomypark.com</Text>
              <Text style={styles.contactHqSub}>Mon-Fri 09:30 AM – 06:30 PM (IST) • Tap to Email</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.contactHqDivider} />

          {/* 3. Corporate Office Address */}
          <TouchableOpacity
            style={styles.contactHqRow}
            onPress={() =>
              Linking.openURL(
                'https://www.google.com/maps/search/?api=1&query=Atomy+Enterprise+India+Pvt+Ltd,+801,+8th+Floor,+Tower+B,+Unitech+Cyber+Park,+Sector+39,+Gurugram,+Haryana+122003'
              )
            }
            activeOpacity={0.8}
          >
            <View style={[styles.contactHqIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="business" size={20} color="#D97706" />
            </View>
            <View style={styles.contactHqContent}>
              <Text style={styles.contactHqLabel}>Corporate Office</Text>
              <Text style={styles.contactHqValue}>Sector 39, Gurugram</Text>
              <Text style={styles.contactHqSub}>
                801, 8th Floor, Tower B, Unitech Cyber Park, Sector 39, Gurugram, Haryana - 122003 • Tap to View Map
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* CATEGORY PICKER MODAL */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Inquiry Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {INQUIRY_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catOptionRow,
                    inquiryCategory === cat && styles.catOptionRowSelected,
                  ]}
                  onPress={() => {
                    setInquiryCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.catOptionText,
                      inquiryCategory === cat && styles.catOptionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                  {inquiryCategory === cat && (
                    <Ionicons name="checkmark" size={18} color="#00A3E0" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNavBar: {
    height: 56,
    backgroundColor: '#00A3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  navIconBtn: {
    padding: 6,
  },
  brandingCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  phoenixEmblem: {
    width: 26,
    height: 26,
    marginRight: 8,
  },
  brandingTextCol: {
    alignItems: 'center',
  },
  brandingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandingSubtitle: {
    color: '#E0F2FE',
    fontSize: 10,
    fontWeight: '500',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },

  /* Hotline Strip */
  hotlineStrip: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  hotlineCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotlineIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  hotlineTextCol: {
    flex: 1,
  },
  hotlineLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  hotlineVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
  },
  hotlineSub: {
    fontSize: 9,
    color: '#94A3B8',
  },
  hotlineDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },

  /* Sub-Tabs */
  subTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  subTabBtnActive: {
    borderBottomColor: '#00A3E0',
  },
  subTabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  subTabBtnTextActive: {
    color: '#00A3E0',
    fontWeight: '700',
  },
  tabCountBadge: {
    backgroundColor: '#00A3E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 14,
  },

  /* Form Card */
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  formBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#00A3E0',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    gap: 8,
  },
  formBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  reqStar: {
    color: '#EF4444',
  },
  pickerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  pickerSelectorText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
  },
  submitButton: {
    backgroundColor: '#00A3E0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    marginTop: 6,
    gap: 8,
    elevation: 2,
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Success Card */
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
  },
  successIconWrap: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 14,
  },
  refIdBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  refIdLabel: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },
  refIdValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#166534',
    letterSpacing: 1,
    marginTop: 2,
  },
  successNotice: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  trackChatNowBtn: {
    backgroundColor: '#00A3E0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    gap: 8,
    marginBottom: 10,
  },
  trackChatNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  submitAnotherBtn: {
    paddingVertical: 10,
  },
  submitAnotherBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Track Section */
  trackSection: {
    gap: 12,
  },
  chipsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipsSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  ticketChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    gap: 6,
  },
  ticketChipSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00A3E0',
  },
  ticketChipId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  ticketChipIdSelected: {
    color: '#0369A1',
  },
  chipStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  searchBarRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  ticketSearchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  searchTicketBtn: {
    backgroundColor: '#00A3E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTicketBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    padding: 8,
    gap: 6,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Chat Thread Card */
  chatThreadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    elevation: 2,
  },
  chatHeader: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatHeaderBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ticketIdBadge: {
    backgroundColor: '#0F172A',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ticketIdBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chatSubjectText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  chatMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  chatActionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  refreshChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  refreshChatBtnText: {
    color: '#00A3E0',
    fontSize: 11,
    fontWeight: '700',
  },
  closeChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  closeChatBtnText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Messages Stream */
  chatMessagesStream: {
    maxHeight: 320,
    minHeight: 180,
    backgroundColor: '#F1F5F9',
  },
  chatMessagesContent: {
    padding: 12,
    gap: 10,
  },
  msgBubbleRow: {
    flexDirection: 'row',
  },
  msgRowCustomer: {
    justifyContent: 'flex-end',
  },
  msgRowAgent: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '85%',
    borderRadius: 12,
    padding: 10,
  },
  msgBubbleCustomer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomRightRadius: 2,
  },
  msgBubbleAgent: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderBottomLeftRadius: 2,
  },
  msgSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  msgSenderName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  msgText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  msgTextAgent: {
    color: '#0F172A',
  },
  msgTime: {
    fontSize: 9,
    color: '#94A3B8',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  emptyMessagesBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyMessagesText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },

  /* Reply Input Bar */
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  sendReplyBtn: {
    backgroundColor: '#00A3E0',
    borderRadius: 8,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendReplyBtnDisabled: {
    backgroundColor: '#94A3B8',
  },

  /* No ticket placeholder */
  noTicketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noTicketTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginTop: 10,
  },
  noTicketSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },

  /* Official Headquarters Contact Details (Matching Website) */
  contactHqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  contactHqCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contactHqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactHqIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactHqContent: {
    flex: 1,
  },
  contactHqLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  contactHqValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  contactHqSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 14,
  },
  contactHqDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 340,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  catOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  catOptionRowSelected: {
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
  },
  catOptionText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  catOptionTextSelected: {
    color: '#00A3E0',
    fontWeight: '700',
  },
});
