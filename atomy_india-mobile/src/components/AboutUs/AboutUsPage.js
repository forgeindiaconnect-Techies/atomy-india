import React, { useState, useMemo } from 'react';
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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const phoenixLogo = require('../../../assets/team_phoenix_circle_clean.png');

const TOP_5_FAQS = [
  {
    id: 'faq-1',
    q: "Why I still didn't receive the delivery?",
    a: "Orders in India are dispatched through our certified courier logistics partners (BlueDart / Delhivery / XpressBees). Standard delivery takes 3-7 business days depending on state and PIN code. You can check real-time courier tracking through 'Order / Delivery' in your account or Contact Us."
  },
  {
    id: 'faq-2',
    q: "What is the criteria to become an Atomy Distributor in India ?",
    a: "Any Indian citizen aged 18 years or above with a valid PAN Card and Aadhaar Card/Voter ID can register as an Atomy Distributor. Membership is 100% free with zero joining fees. To activate sponsorship points and accumulate downline PV, simply purchase products totaling 10,000 PV (~₹1,500 - ₹2,000)."
  },
  {
    id: 'faq-3',
    q: "Where can I check my commission?",
    a: "You can check your General Commission, Mastership Bonus, and daily point matching records by logging into My Office on Atomy India portal under the 'My Commission' / 'General Commission Records' tab. Commission payments are settled weekly on Tuesdays."
  },
  {
    id: 'faq-4',
    q: "Where can I find my purchase record, group purchase record or commission record?",
    a: "Navigate to My Office > Lineage / My Group Purchase Record. Here you can inspect daily Left Leg and Right Leg volume, accumulated Point Value (PV), and order histories across all generations."
  },
  {
    id: 'faq-5',
    q: "How to register to become an Atomy Distributor?",
    a: "Click 'Join Us' on the top navigation bar. Select 'Indian Resident (18+)', verify your mobile number via OTP, enter your Sponsor ID (provided by your upline mentor), upload your PAN and address proof, and complete your member registration."
  }
];

const CST_NOTICES = [
  {
    id: 'noti-1',
    tag: '[GENERAL NOTICE]',
    title: 'New Register Member Coupon Offer',
    desc: 'Instant ₹500 discount voucher on first order above ₹3,500 for newly registered members.'
  },
  {
    id: 'noti-2',
    tag: '[SHIPPING]',
    title: 'Express Doorstep Delivery Network Across India',
    desc: 'Upgraded delivery speeds across all Tier-1 and Tier-2 pin codes with live GPS tracking.'
  },
  {
    id: 'noti-3',
    tag: '[PRODUCT]',
    title: 'HemoHIM Patented Herbal Extract Quality Standards',
    desc: 'Government-certified quality testing reports published for HemoHIM batches.'
  },
  {
    id: 'noti-4',
    tag: '[OPERATION]',
    title: 'Customer Support Working Hours & Courier Dispatch Updates',
    desc: 'Customer counsel lines operate Mon-Sat 09:00 AM - 17:30 PM IST.'
  },
  {
    id: 'noti-5',
    tag: '[EVENT]',
    title: 'Monthly Success Academy Schedule & Live Webcast',
    desc: 'Join our national leadership academy stream this Saturday at 11:00 AM.'
  }
];

export default function AboutUsPage({
  onNavigateHome,
  onNavigateBack,
  onNavigateFaq,
  onNavigateFindCentre,
  onNavigateCompany,
  onNavigateNotice,
  onCartPress,
  cartCount = 0,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaqId, setActiveFaqId] = useState(null);
  const [companyMainTab, setCompanyMainTab] = useState('aboutUs'); // 'aboutUs' | 'management'
  const [companySubTab, setCompanySubTab] = useState('overview'); // 'overview' | 'vision' | 'philosophy' | 'foundation' | 'motto'
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Filter FAQs and Notices based on search
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return TOP_5_FAQS;
    const q = searchQuery.toLowerCase().trim();
    return TOP_5_FAQS.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredNotices = useMemo(() => {
    if (!searchQuery.trim()) return CST_NOTICES;
    const q = searchQuery.toLowerCase().trim();
    return CST_NOTICES.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.tag.toLowerCase().includes(q) ||
        n.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleDownloadPlan = () => {
    Alert.alert(
      'Atomy Compensation Plan',
      'Atomy India Compensation Plan document (May 2026 Edition).\nOfficial Direct Selling Business Model & General Commission Guidelines.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open PDF',
          onPress: () =>
            Linking.openURL(
              'https://in.atomy.com'
            ).catch(() => {}),
        },
      ]
    );
  };

  const handleInquirySubmit = () => {
    if (!inquiryForm.name.trim() || !inquiryForm.email.trim() || !inquiryForm.message.trim()) {
      Alert.alert('Required Fields', 'Please enter your name, email and message.');
      return;
    }
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setIsInquiryModalOpen(false);
      setInquiryForm({ name: '', phone: '', email: '', message: '' });
      Alert.alert(
        'Inquiry Submitted',
        'Thank you! Your 1:1 inquiry has been received. Our Atomy India Customer Counsel team will reply to your registered email within 24 business hours.'
      );
    }, 1200);
  };

  const handleCallCounsel = (phone) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`).catch(() => {
      Alert.alert('Call Support', `Phone: ${phone}`);
    });
  };

  const handleEmailCounsel = (email) => {
    Linking.openURL(`mailto:${email}?subject=Customer Support Inquiry`).catch(() => {
      Alert.alert('Email Support', `Email: ${email}`);
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP CYAN NAVBAR */}
      <View style={styles.topNavBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onNavigateBack || onNavigateHome}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.brandingCenter}>
          <Image source={phoenixLogo} style={styles.phoenixEmblem} resizeMode="contain" />
          <View style={styles.brandingTextCol}>
            <Text style={styles.brandingTitle} numberOfLines={1}>
              ABOUT US
            </Text>
            <Text style={styles.brandingSubtitle}>Customer Happiness Center</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={onCartPress}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. BREADCRUMBS BAR */}
        <View style={styles.breadcrumbBar}>
          <TouchableOpacity onPress={onNavigateHome} activeOpacity={0.7}>
            <Text style={styles.breadcrumbLink}>HOME</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbArrow}>&gt;</Text>
          <Text style={styles.breadcrumbCurrent}>About Us</Text>
        </View>

        {/* 3. MAIN PAGE TITLE */}
        <View style={styles.pageTitleHeader}>
          <Text style={styles.pageTitleText}>About Us</Text>
        </View>

        {/* 4. CUSTOMER SERVICE FAQ HERO SECTION */}
        <View style={styles.faqHeroSection}>
          <View style={styles.faqWelcomeRow}>
            <Text style={styles.faqWelcomeTitle}>
              Welcome to Atomy India's Customer Service
            </Text>
            <View style={styles.welcomeBadge}>
              <Text style={styles.welcomeBadgeText}>We’re here to help.</Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={styles.faqSearchBox}>
            <View style={styles.faqTagBadge}>
              <Text style={styles.faqTagBadgeText}>FAQ</Text>
            </View>
            <Text style={styles.faqPromptText}>
              Find answers to frequently asked questions about ordering, commissions, products and more.{'\n'}
              You can search or select a question type to find detailed information.
            </Text>

            <View style={styles.searchInputRow}>
              <TextInput
                style={styles.searchInputField}
                placeholder="Enter search term."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.searchSubmitBtn}
                activeOpacity={0.8}
                onPress={() => {}}
              >
                <Ionicons name="search" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. BOARDS SECTION: TOP 5 FAQS & NOTICE */}
        <View style={styles.boardsContainer}>
          {/* Board 1: TOP 5 FAQs */}
          <View style={styles.boardCard}>
            <View style={styles.boardCardHeader}>
              <Text style={styles.boardCardTitle}>TOP 5 FAQs</Text>
              <TouchableOpacity
                onPress={() => onNavigateFaq && onNavigateFaq()}
                activeOpacity={0.7}
              >
                <Text style={styles.boardMoreText}>More &gt;</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.boardList}>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isOpen = activeFaqId === faq.id;
                  return (
                    <TouchableOpacity
                      key={faq.id}
                      style={styles.faqRowItem}
                      onPress={() => setActiveFaqId(isOpen ? null : faq.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.faqQuestionRow}>
                        <Text style={styles.faqQuestionText} numberOfLines={isOpen ? undefined : 2}>
                          {faq.q}
                        </Text>
                        <Ionicons
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="#64748B"
                        />
                      </View>
                      {isOpen && (
                        <View style={styles.faqInlineAnswer}>
                          <Text style={styles.faqAnswerText}>{faq.a}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.boardEmptyText}>No FAQs matching "{searchQuery}"</Text>
              )}
            </View>
          </View>

          {/* Board 2: Notice */}
          <View style={[styles.boardCard, { marginTop: 16 }]}>
            <View style={styles.boardCardHeader}>
              <Text style={styles.boardCardTitle}>Notice</Text>
              <TouchableOpacity
                onPress={() => onNavigateNotice && onNavigateNotice()}
                activeOpacity={0.7}
              >
                <Text style={styles.boardMoreText}>More &gt;</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.boardList}>
              {filteredNotices.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={styles.noticeRowItem}
                  onPress={() => onNavigateNotice && onNavigateNotice()}
                  activeOpacity={0.8}
                >
                  <View style={styles.noticeTagBadge}>
                    <Text style={styles.noticeTagText}>{n.tag}</Text>
                  </View>
                  <Text style={styles.noticeTitleText} numberOfLines={2}>
                    {n.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 6. FIVE SERVICE QUICK CARDS GRID */}
        <View style={styles.serviceCardsSection}>
          <View style={styles.serviceCardsGrid}>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={handleDownloadPlan}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="ribbon-outline" size={24} color="#0284C7" />
              </View>
              <Text style={styles.serviceCardLabel}>Compensation{'\n'}Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() =>
                Alert.alert(
                  'Seminar & Education',
                  'Atomy India One-Day Seminars & Success Academy.\nEvery Saturday 11:00 AM live on official YouTube & Zoom channels.'
                )
              }
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="calendar-outline" size={24} color="#16A34A" />
              </View>
              <Text style={styles.serviceCardLabel}>Seminar &amp;{'\n'}Education</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => onNavigateFindCentre && onNavigateFindCentre()}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="location-outline" size={24} color="#D97706" />
              </View>
              <Text style={styles.serviceCardLabel}>Centre{'\n'}Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() =>
                Alert.alert(
                  'User Guide',
                  'Atomy Mobile & Web Portal User Guide.\nComplete manual for placing orders, sponsor placement, commission calculations and returns.'
                )
              }
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="book-outline" size={24} color="#9333EA" />
              </View>
              <Text style={styles.serviceCardLabel}>User{'\n'}Guide</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={handleDownloadPlan}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: '#FFE4E6' }]}>
                <Ionicons name="cloud-download-outline" size={24} color="#E11D48" />
              </View>
              <Text style={styles.serviceCardLabel}>Resource{'\n'}Materials</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. COMPANY INFORMATION TABS SECTION */}
        <View style={styles.companySection}>
          {/* Primary Tabs Nav */}
          <View style={styles.primaryTabsRow}>
            <TouchableOpacity
              style={[
                styles.primaryTabBtn,
                companyMainTab === 'aboutUs' && styles.primaryTabBtnActive,
              ]}
              onPress={() => setCompanyMainTab('aboutUs')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.primaryTabText,
                  companyMainTab === 'aboutUs' && styles.primaryTabTextActive,
                ]}
              >
                About Us
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryTabBtn,
                companyMainTab === 'management' && styles.primaryTabBtnActive,
              ]}
              onPress={() => setCompanyMainTab('management')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.primaryTabText,
                  companyMainTab === 'management' && styles.primaryTabTextActive,
                ]}
              >
                Management Info
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sub-menu if About Us is active */}
          {companyMainTab === 'aboutUs' && (
            <View style={styles.subPillsScrollRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'vision', label: 'Vision' },
                  { key: 'philosophy', label: 'Philosophy' },
                  { key: 'foundation', label: 'Foundation' },
                  { key: 'motto', label: 'Motto' },
                ].map((item) => {
                  const isSelected = companySubTab === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.subPillBtn, isSelected && styles.subPillBtnActive]}
                      onPress={() => setCompanySubTab(item.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.subPillBtnText,
                          isSelected && styles.subPillBtnTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Tab Panel Content */}
          <View style={styles.tabPanelCard}>
            {companyMainTab === 'aboutUs' ? (
              <>
                {/* SUBTAB 1: OVERVIEW */}
                {companySubTab === 'overview' && (
                  <View style={styles.panelBlock}>
                    <Text style={styles.panelSectionHeading}>Overview</Text>

                    <View style={styles.masstigeHighlightCard}>
                      <Text style={styles.masstigeLeadMain}>
                        The Basic Theory of Economy is Straightforward Distribution is Key!{'\n'}
                        Effective Strategy where Quality meets Value
                      </Text>
                      <View style={styles.masstigeBanner}>
                        <Text style={styles.masstigeBannerText}>
                          Atomy's MASSTIGE strategy is to provide{' '}
                          <Text style={styles.spBlue}>Absolute Quality</Text> products at an{' '}
                          <Text style={styles.spBlue}>Absolute Price.</Text>
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.panelParagraph}>
                      As the world market is more globalized and united to a single market, Atomy’s Masstige brand is positioned to gain momentum and growth.
                    </Text>
                    <Text style={styles.panelParagraph}>
                      Established in 2009, Atomy is a global direct selling company with operations in 27 regions worldwide as of December 2024, including Korea.
                    </Text>
                    <Text style={styles.panelParagraph}>
                      Since it was established, Atomy has grown rapidly through consumer-centered direct selling that strictly upholds CEO Park Han-gill’s principle of <Text style={styles.boldTxt}>“Absolute Quality, Absolute Price.”</Text> The company has worked tirelessly to create a foundation for sustainable growth based on innovative thinking that sets customer success as its key objective.
                    </Text>

                    <View style={styles.threeCulturesStrip}>
                      <Text style={styles.threeCulturesTitle}>Atomy’s Corporate Culture:</Text>
                      <Text style={styles.threeCulturesItems}>
                        1. Principle Centred Culture{'\n'}
                        2. Culture of Accompanied Growth{'\n'}
                        3. Sharing Culture
                      </Text>
                    </View>

                    <Text style={styles.panelParagraph}>
                      Our objective is beyond consumer satisfaction; rather it is centered for success. A corporation that cherishes the spirit! We believe that valuing individuals is our priority.
                    </Text>
                  </View>
                )}

                {/* SUBTAB 2: VISION */}
                {companySubTab === 'vision' && (
                  <View style={styles.panelBlock}>
                    <Text style={styles.panelSectionHeading}>Vision</Text>

                    {/* Step 1 */}
                    <View style={styles.visionStepHeader}>
                      <Text style={styles.visionStepPill}>01. Customers’ <Text style={styles.spBold}>Success</Text></Text>
                    </View>
                    <Text style={styles.panelParagraph}>
                      Customers are not simply a means for Atomy—they are the ultimate goal. The <Text style={styles.boldTxt}>"Philosophy of Cow vs. Baby"</Text> best describes Atomy's mindset toward our customers. The reason people tend cows is not for the cows' sake, but for obtaining milk. However, when a parent cares for their baby, it is for the baby's own well-being. Likewise, we hope to help our members succeed as consumers and business owners.
                    </Text>

                    {/* Step 2 */}
                    <View style={[styles.visionStepHeader, { marginTop: 14 }]}>
                      <Text style={styles.visionStepPill}>02. Distribution <Text style={styles.spBold}>HUB</Text></Text>
                    </View>
                    <Text style={styles.panelParagraph}>
                      Atomy aims to become a world distribution hub—the central unit of a distribution network. Our Global Sourcing Global Sales (GSGS) strategy seeks out high-quality products that meet our Absolute Quality Absolute Price standard and offers them to consumers worldwide.
                    </Text>

                    {/* Step 3 */}
                    <View style={[styles.visionStepHeader, { marginTop: 14 }]}>
                      <Text style={styles.visionStepPill}>03. <Text style={styles.spBold}>Premier</Text> Company</Text>
                    </View>
                    <Text style={styles.panelParagraph}>
                      Atomy aims to be a Premier Company—the best of the best. <Text style={styles.boldTxt}>"Honesty and Goodness is the Best Strategy"</Text> describes our corporate values. We want our employees and leaders to always be honest and loyal to our members.
                    </Text>
                  </View>
                )}

                {/* SUBTAB 3: PHILOSOPHY */}
                {companySubTab === 'philosophy' && (
                  <View style={styles.panelBlock}>
                    <Text style={styles.panelSectionHeading}>Philosophy</Text>
                    <View style={styles.visionStepHeader}>
                      <Text style={styles.visionStepPill}>
                        A Small but <Text style={styles.spBold}>Big Company</Text> with <Text style={styles.spBold}>Precise</Text> Management.
                      </Text>
                    </View>
                    <Text style={styles.panelParagraph}>
                      Atomy aims to be a "small but big" company. We are not preoccupied with our size or wealth, but with the establishment of a rock-solid and sturdy infrastructure, which echoes our founding principle of Continuity.
                    </Text>
                    <Text style={styles.panelParagraph}>
                      We need "precise management" to eliminate unnecessary expenses and pay careful attention to detail. Our "big company" mindset encourages customers to succeed big, ensures that employees feel big happiness, and gives back to society in a big way.
                    </Text>
                  </View>
                )}

                {/* SUBTAB 4: FOUNDATION */}
                {companySubTab === 'foundation' && (
                  <View style={styles.panelBlock}>
                    <Text style={styles.panelSectionHeading}>Foundation</Text>

                    {/* Pillar 1 */}
                    <View style={styles.foundationPillarCard}>
                      <View style={styles.pillarBadge}>
                        <Text style={styles.pillarBadgeText}>BEING{'\n'}(CONTINUITY)</Text>
                      </View>
                      <View style={styles.pillarDetailCol}>
                        <Text style={styles.panelParagraph}>
                          Being (Continuity) is every enterprise's primary goal and the most important social responsibility. Atomy must endure to carry out its mission to make a better world.
                        </Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.boldTxt}>Cost Management:</Text> Zero-debt policy &amp; product cost optimization.</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.boldTxt}>Operations Management:</Text> Honesty and principle-abiding ethics.</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.boldTxt}>Human Resources:</Text> Fostering creativity and personal growth.</Text>
                      </View>
                    </View>

                    {/* Pillar 2 */}
                    <View style={[styles.foundationPillarCard, { marginTop: 12 }]}>
                      <View style={[styles.pillarBadge, { backgroundColor: '#0284C7' }]}>
                        <Text style={styles.pillarBadgeText}>SPEED</Text>
                      </View>
                      <View style={styles.pillarDetailCol}>
                        <Text style={styles.panelParagraph}>
                          Crucial factor in Atomy's growth: moving at a quick pace in the right direction.
                        </Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.boldTxt}>Speed of Adaptation:</Text> Industry 4.0 fast readiness.</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.boldTxt}>Speed of Information:</Text> Transferring accurate data globally.</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.boldTxt}>Speed of Expansion:</Text> Success Academy multiplying member growth.</Text>
                      </View>
                    </View>

                    {/* Pillar 3 */}
                    <View style={[styles.foundationPillarCard, { marginTop: 12 }]}>
                      <View style={[styles.pillarBadge, { backgroundColor: '#16A34A' }]}>
                        <Text style={styles.pillarBadgeText}>BALANCE</Text>
                      </View>
                      <View style={styles.pillarDetailCol}>
                        <Text style={styles.panelParagraph}>
                          Atomy seeks to fulfill social responsibility through balanced distribution of wealth and fairness to optimize resources and uplift all stakeholders.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* SUBTAB 5: MOTTO */}
                {companySubTab === 'motto' && (
                  <View style={styles.panelBlock}>
                    <Text style={styles.panelSectionHeading}>Company Motto</Text>

                    <View style={styles.mottoBanner}>
                      <Text style={styles.mottoBannerText}>
                        Cherish the <Text style={styles.spBlue}>Spirit.</Text> Create the <Text style={styles.spBlue}>Vision.</Text>{'\n'}
                        Follow the <Text style={styles.spBlue}>Faith.</Text> Serve in <Text style={styles.spBlue}>Humility.</Text>
                      </Text>
                    </View>

                    {/* Motto 1 */}
                    <View style={styles.mottoItemRow}>
                      <View style={styles.mottoPillarBadge}>
                        <Text style={styles.mottoPillarBadgeText}>SPIRIT</Text>
                      </View>
                      <View style={styles.mottoPillarTextCol}>
                        <Text style={styles.mottoLeadPhrase}>Cherish the Spirit</Text>
                        <Text style={styles.mottoBodyText}>
                          People are the most precious beings, created in God's image and never to be used as a means to an end.
                        </Text>
                      </View>
                    </View>

                    {/* Motto 2 */}
                    <View style={[styles.mottoItemRow, { marginTop: 12 }]}>
                      <View style={styles.mottoPillarBadge}>
                        <Text style={styles.mottoPillarBadgeText}>VISION</Text>
                      </View>
                      <View style={styles.mottoPillarTextCol}>
                        <Text style={styles.mottoLeadPhrase}>Create the Vision</Text>
                        <Text style={styles.mottoBodyText}>
                          The most accurate way to predict the future is to plan for it ourselves and take charge of tomorrow.
                        </Text>
                      </View>
                    </View>

                    {/* Motto 3 */}
                    <View style={[styles.mottoItemRow, { marginTop: 12 }]}>
                      <View style={styles.mottoPillarBadge}>
                        <Text style={styles.mottoPillarBadgeText}>FAITH</Text>
                      </View>
                      <View style={styles.mottoPillarTextCol}>
                        <Text style={styles.mottoLeadPhrase}>Follow the Faith</Text>
                        <Text style={styles.mottoBodyText}>
                          Believing in things unseen has the immense power to inspire action toward a desirable future.
                        </Text>
                      </View>
                    </View>

                    {/* Motto 4 */}
                    <View style={[styles.mottoItemRow, { marginTop: 12 }]}>
                      <View style={styles.mottoPillarBadge}>
                        <Text style={styles.mottoPillarBadgeText}>HUMILITY</Text>
                      </View>
                      <View style={styles.mottoPillarTextCol}>
                        <Text style={styles.mottoLeadPhrase}>Serve in Humility</Text>
                        <Text style={styles.mottoBodyText}>
                          Our thoughts should reach to the sky, but our feet should remain firmly grounded.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            ) : (
              /* MAIN TAB 2: MANAGEMENT INFO */
              <View style={styles.panelBlock}>
                <Text style={styles.panelSectionHeading}>Management Info</Text>

                {/* Leader 1 */}
                <View style={styles.leaderCard}>
                  <Text style={styles.leaderTitleHeader}>
                    <Text style={styles.boldTxt}>About</Text> Dr. Seikh Imtiaz Ali (Abraham Lee)
                  </Text>
                  <View style={styles.leaderDetailBody}>
                    <Text style={styles.panelParagraph}>
                      <Text style={styles.boldTxt}>S. Imtiaz Ali,</Text> is currently the Managing Director of Atomy Enterprise India Private Limited.
                    </Text>
                    <Text style={styles.panelParagraph}>
                      He is an IITian and was awarded Doctor of Philosophy (PhD) from KAIST (Korea Advanced Institute of Science and Technology), South Korea. He has vast experience handling operations across 30 different countries.
                    </Text>
                  </View>
                </View>

                {/* Leader 2 */}
                <View style={[styles.leaderCard, { marginTop: 14 }]}>
                  <Text style={styles.leaderTitleHeader}>
                    <Text style={styles.boldTxt}>About</Text> Seok-Gyun Kwon
                  </Text>
                  <View style={styles.leaderDetailBody}>
                    <Text style={styles.panelParagraph}>
                      <Text style={styles.boldTxt}>Seok-Gyun Kwon</Text> is supporting the operations of the Company in India as a Director and Regional Director of Atomy Korea.
                    </Text>
                    <Text style={styles.panelParagraph}>
                      Over 30 years of direct sales leadership experience across South Korea, China and Southeast Asia.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 8. COUNSEL CONTACTS SECTION */}
        <View style={styles.counselSection}>
          <Text style={styles.counselMainTitle}>Customer Counsel &amp; Inquiries</Text>

          {/* 1. Customer Support */}
          <TouchableOpacity
            style={styles.counselCard}
            onPress={() => handleCallCounsel('+91-124-695-9000')}
            activeOpacity={0.8}
          >
            <View style={styles.counselCardHeader}>
              <Ionicons name="call" size={18} color="#00A3E0" />
              <Text style={styles.counselCardLabel}>Customer Support</Text>
            </View>
            <Text style={styles.counselPhoneBig}>+91-124-695-9000</Text>
            <Text style={styles.counselScheduleSub}>
              Mon - Sat 09:00 AM ~ 17:30 PM (IST){'\n'}
              (Weekends &amp; Holidays - Closed)
            </Text>
          </TouchableOpacity>

          {/* 2. Fax Number */}
          <View style={styles.counselCard}>
            <View style={styles.counselCardHeader}>
              <Ionicons name="print-outline" size={18} color="#64748B" />
              <Text style={styles.counselCardLabel}>Fax Number</Text>
            </View>
            <Text style={styles.counselPhoneBig}>+91-124-647-2851</Text>
          </View>

          {/* 3. E-Mail */}
          <TouchableOpacity
            style={styles.counselCard}
            onPress={() => handleEmailCounsel('atomy_in@atomypark.com')}
            activeOpacity={0.8}
          >
            <View style={styles.counselCardHeader}>
              <Ionicons name="mail" size={18} color="#00A3E0" />
              <Text style={styles.counselCardLabel}>E-Mail</Text>
            </View>
            <Text style={[styles.counselPhoneBig, { color: '#00A3E0' }]}>
              atomy_in@atomypark.com
            </Text>
            <Text style={styles.counselScheduleSub}>* Please contact us for more information.</Text>
          </TouchableOpacity>

          {/* 4. 1:1 Inquiry */}
          <View style={[styles.counselCard, styles.counselInquiryCard]}>
            <View style={styles.counselCardHeader}>
              <Ionicons name="chatbubbles" size={18} color="#00A3E0" />
              <Text style={styles.counselCardLabel}>1:1 Inquiry</Text>
            </View>
            <Text style={styles.inquiryDescText}>
              Ask our customer service if you have any questions about Atomy.{'\n'}
              We'll kindly answer as soon as possible.
            </Text>
            <TouchableOpacity
              style={styles.inquiryOpenBtn}
              onPress={() => setIsInquiryModalOpen(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="send-outline" size={16} color="#FFFFFF" />
              <Text style={styles.inquiryOpenBtnText}>Open Inquiry Form</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 9. 1:1 INQUIRY MODAL */}
      <Modal
        visible={isInquiryModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsInquiryModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleWrap}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#00A3E0" />
                <Text style={styles.modalTitleText}>1:1 Customer Inquiry</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsInquiryModalOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.inputFieldLabel}>Your Full Name *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter your name"
                placeholderTextColor="#94A3B8"
                value={inquiryForm.name}
                onChangeText={(t) => setInquiryForm({ ...inquiryForm, name: t })}
              />

              <Text style={styles.inputFieldLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="+91 9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={inquiryForm.phone}
                onChangeText={(t) => setInquiryForm({ ...inquiryForm, phone: t })}
              />

              <Text style={styles.inputFieldLabel}>E-Mail Address *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={inquiryForm.email}
                onChangeText={(t) => setInquiryForm({ ...inquiryForm, email: t })}
              />

              <Text style={styles.inputFieldLabel}>Inquiry Message *</Text>
              <TextInput
                style={[styles.modalTextInput, styles.modalTextArea]}
                placeholder="Type your question regarding membership, delivery, commission or products..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={inquiryForm.message}
                onChangeText={(t) => setInquiryForm({ ...inquiryForm, message: t })}
              />
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsInquiryModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleInquirySubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSubmitText}>Submit Inquiry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 6,
  },
  brandingCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  phoenixEmblem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  brandingTextCol: {
    alignItems: 'flex-start',
  },
  brandingTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  brandingSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  cartButton: {
    padding: 6,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  breadcrumbLink: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  breadcrumbArrow: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 6,
  },
  breadcrumbCurrent: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  pageTitleHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  pageTitleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  faqHeroSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  faqWelcomeRow: {
    marginBottom: 12,
  },
  faqWelcomeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  welcomeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  welcomeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  faqSearchBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  faqTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#00A3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  faqTagBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  faqPromptText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    height: 44,
  },
  searchInputField: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 6,
  },
  clearSearchBtn: {
    padding: 4,
  },
  searchSubmitBtn: {
    backgroundColor: '#00A3E0',
    borderRadius: 6,
    padding: 8,
    marginLeft: 6,
  },
  boardsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  boardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  boardCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  boardCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  boardMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A3E0',
  },
  boardList: {
    gap: 8,
  },
  faqRowItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  faqInlineAnswer: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  boardEmptyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  noticeRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  noticeTagBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  noticeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  noticeTitleText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  serviceCardsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  serviceCardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceCardLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 13,
  },
  companySection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  primaryTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 3,
    marginBottom: 10,
  },
  primaryTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  primaryTabBtnActive: {
    backgroundColor: '#00A3E0',
  },
  primaryTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  primaryTabTextActive: {
    color: '#FFFFFF',
  },
  subPillsScrollRow: {
    marginBottom: 10,
  },
  subPillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  subPillBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  subPillBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  subPillBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabPanelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  panelBlock: {},
  panelSectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  masstigeHighlightCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 12,
    marginBottom: 12,
  },
  masstigeLeadMain: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    lineHeight: 17,
    marginBottom: 8,
  },
  masstigeBanner: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
  },
  masstigeBannerText: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
    lineHeight: 18,
  },
  spBlue: {
    color: '#00A3E0',
    fontWeight: '800',
  },
  panelParagraph: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 10,
  },
  boldTxt: {
    fontWeight: '700',
    color: '#0F172A',
  },
  threeCulturesStrip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00A3E0',
    padding: 12,
    marginVertical: 10,
  },
  threeCulturesTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  threeCulturesItems: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '600',
  },
  visionStepHeader: {
    marginBottom: 6,
  },
  visionStepPill: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  spBold: {
    fontWeight: '800',
    color: '#00A3E0',
  },
  foundationPillarCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillarBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pillarBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  pillarDetailCol: {},
  bulletItem: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 17,
    marginTop: 4,
  },
  mottoBanner: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  mottoBannerText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 20,
  },
  mottoItemRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mottoPillarBadge: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  mottoPillarBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  mottoPillarTextCol: {},
  mottoLeadPhrase: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  mottoBodyText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  leaderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leaderTitleHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00A3E0',
    marginBottom: 8,
  },
  leaderDetailBody: {},
  counselSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  counselMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  counselCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  counselInquiryCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  counselCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  counselCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  counselPhoneBig: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  counselScheduleSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  inquiryDescText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 12,
  },
  inquiryOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00A3E0',
    borderRadius: 8,
    paddingVertical: 10,
  },
  inquiryOpenBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: '#00A3E0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
