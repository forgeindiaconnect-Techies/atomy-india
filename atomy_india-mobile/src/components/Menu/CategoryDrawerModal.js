import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

// Custom high-fidelity category icons matching the official website and user screenshot
function MenuCategoryIcon({ type }) {
  switch (type) {
    case 'hemohim':
      return (
        <View style={styles.hemohimBadge}>
          <Text style={styles.hemohimTextTop}>HEMO</Text>
          <Text style={styles.hemohimTextBottom}>HIM</Text>
        </View>
      );
    case 'health':
      return (
        <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
          <Rect x="10" y="4" width="12" height="4" rx="1.5" stroke="#0284C7" strokeWidth="2" fill="#E0F2FE" />
          <Rect x="7" y="8" width="18" height="20" rx="3" stroke="#0284C7" strokeWidth="2" fill="#F0F9FF" />
          <Path d="M16 13V23M11 18H21" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );
    case 'food':
      return (
        <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
          <Path d="M5 8L27 12" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          <Path d="M7 11L25 15" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          <Path d="M6 15C6 24 10 26 16 26C22 26 26 24 26 15H6Z" stroke="#EA580C" strokeWidth="2" fill="#FFEDD5" />
          <Path d="M12 26H20" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 'beauty':
      return (
        <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
          <Path d="M19 6L23 9V14H19V6Z" fill="#E11D48" stroke="#BE185D" strokeWidth="1.5" />
          <Rect x="18" y="14" width="6" height="14" rx="1" stroke="#475569" strokeWidth="2" fill="#F8FAFC" />
          <Rect x="8" y="12" width="7" height="16" rx="1.5" stroke="#E11D48" strokeWidth="2" fill="#FDF2F8" />
          <Rect x="10" y="8" width="3" height="4" stroke="#E11D48" strokeWidth="1.5" fill="#BE185D" />
        </Svg>
      );
    case 'personal_care':
      return (
        <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
          <Path d="M11 6H16V9" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
          <Rect x="14" y="9" width="4" height="3" stroke="#CA8A04" strokeWidth="1.5" fill="#FEF08A" />
          <Rect x="9" y="12" width="14" height="16" rx="3" stroke="#CA8A04" strokeWidth="2" fill="#FEF9C3" />
          <Rect x="12" y="16" width="8" height="8" rx="1" stroke="#EAB308" strokeWidth="1.2" fill="#FFFFFF" />
        </Svg>
      );
    case 'home':
      return (
        <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
          <Path d="M21 7V10" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
          <Path d="M4 14L16 5L28 14" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M7 13V26H25V13" stroke="#2563EB" strokeWidth="2" fill="#EFF6FF" />
          <Rect x="13" y="18" width="6" height="8" rx="1" stroke="#2563EB" strokeWidth="1.8" fill="#DBEAFE" />
        </Svg>
      );
    case 'etc':
      return (
        <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
          <Path d="M12 11C12 7 14 6 16 6C18 6 20 7 20 11" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          <Path d="M7 11H25L23 27H9L7 11Z" stroke="#D97706" strokeWidth="2" fill="#FEF3C7" />
          <Rect x="14" y="18" width="11" height="9" rx="1" stroke="#B45309" strokeWidth="1.8" fill="#FDE68A" />
          <Line x1="19.5" y1="18" x2="19.5" y2="27" stroke="#B45309" strokeWidth="1.2" />
        </Svg>
      );
    case 'all_products':
    default:
      return (
        <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
          <Rect x="6" y="6" width="8" height="8" rx="2" stroke="#64748B" strokeWidth="2.2" fill="#F8FAFC" />
          <Rect x="18" y="6" width="8" height="8" rx="2" stroke="#64748B" strokeWidth="2.2" fill="#F8FAFC" />
          <Rect x="6" y="18" width="8" height="8" rx="2" stroke="#64748B" strokeWidth="2.2" fill="#F8FAFC" />
          <Rect x="18" y="18" width="8" height="8" rx="2" stroke="#64748B" strokeWidth="2.2" fill="#F8FAFC" />
        </Svg>
      );
  }
}

// Category items ordered exactly like the landing page
const MENU_CATEGORIES = [
  { id: 'personal_care', name: 'PERSONAL\nCARE', type: 'personal_care' },
  { id: 'beauty', name: 'BEAUTY', type: 'beauty' },
  { id: 'food', name: 'FOOD', type: 'food' },
  { id: 'home', name: 'HOME', type: 'home' },
  { id: 'health', name: 'HEALTH', type: 'health' },
  { id: 'hemohim', name: 'HemoHIM', type: 'hemohim' },
  { id: 'others', name: 'ETC', type: 'etc' },
  { id: 'all_products', name: 'ALL PRODUCTS', type: 'all_products' },
];

export default function CategoryDrawerModal({
  visible = false,
  onClose,
  onSelectCategory,
  onNavigateQuickOrder,
  isMember = false,
  isUserLoggedIn = false,
  onOpenSignIn,
  onOpenMembership,
  onNavigateAboutUs,
  onNavigateFindCentre,
  onNavigateFavorites,
  onNavigateFaq,
  onNavigateNotice,
  onNavigateCompany,
  onNavigateOrderDelivery,
  onNavigateCustomerSupport,
}) {
  const [activeTab, setActiveTab] = useState('shopping'); // 'shopping' | 'office'

  const handleSignIn = () => {
    onClose();
    if (onOpenSignIn) {
      onOpenSignIn('signin');
    }
  };

  const handleJoinUs = () => {
    onClose();
    if (onOpenSignIn) {
      onOpenSignIn('signup');
    }
  };

  const handleQuickService = (service) => {
    onClose();
    if (!isUserLoggedIn) {
      if (onOpenSignIn) {
        onOpenSignIn('signin', service === 'quick_order' ? 'Sign in required to access Quick Order' : 'Sign in required to access Order / Delivery Tracking');
      }
      return;
    }
    if (service === 'order_delivery') {
      if (onNavigateOrderDelivery) {
        onNavigateOrderDelivery();
      }
    } else if (service === 'quick_order') {
      onNavigateQuickOrder && onNavigateQuickOrder();
    }
  };

  const handleLinkPress = (title) => {
    Alert.alert(title, `Opening official ${title} portal from Atomy India.`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Top Cyan Status Safe Area */}
        <SafeAreaView edges={['top']} style={styles.cyanSafeArea} />

        {/* 1. TOP CYAN BAR (#00A3E0) */}
        <View style={styles.topCyanBar}>
          <View style={styles.topAuthRow}>
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.topAuthText}>{isMember ? 'Sign Out' : 'Sign in'}</Text>
            </TouchableOpacity>
            <Text style={styles.topAuthDivider}>|</Text>
            <TouchableOpacity onPress={handleJoinUs} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.topAuthText}>{isMember ? 'My Member ID' : 'Join Us'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topActionIcons}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => Alert.alert('App Settings', 'Atomy India Mobile v1.0.0\nLanguage: English (India)')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => Alert.alert('Select Language / Region', 'English (India - Official)')}
              activeOpacity={0.7}
            >
              <Ionicons name="globe-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. SUB-BAR TABS: Shopping & My Office */}
        <View style={styles.tabsBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'shopping' && styles.tabButtonActive]}
            onPress={() => setActiveTab('shopping')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === 'shopping' && styles.tabTextActive]}>
              Shopping
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'office' && styles.tabButtonActive]}
            onPress={() => setActiveTab('office')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === 'office' && styles.tabTextActive]}>
              My Office
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. SCROLLABLE CONTENT BODY */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'shopping' ? (
            <>
              {/* Category Grid (4 columns x 2 rows, exact landing page order) */}
              <View style={styles.categoryGrid}>
                {MENU_CATEGORIES.map((cat, idx) => {
                  const isLastInRow = (idx + 1) % 4 === 0;
                  const isBottomRow = idx >= 4;

                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryCell,
                        !isLastInRow && styles.categoryCellBorderRight,
                        !isBottomRow && styles.categoryCellBorderBottom,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => {
                        onClose();
                        if (onSelectCategory) {
                          onSelectCategory(cat.id);
                        }
                      }}
                    >
                      <View style={styles.categoryIconWrap}>
                        <MenuCategoryIcon type={cat.type} />
                      </View>
                      <Text style={styles.categoryCellLabel} numberOfLines={2}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Recommended Services */}
              <View style={styles.recommendedSection}>
                <Text style={styles.sectionHeaderTitle}>Recommended Services</Text>
                <View style={styles.pillsRow}>
                  <TouchableOpacity
                    style={styles.pillButton}
                    onPress={() => handleQuickService('order_delivery')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pillButtonText}>Order/Delivery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pillButton}
                    onPress={() => handleQuickService('quick_order')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pillButtonText}>Quick Order</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2-Column Links Table */}
              <View style={styles.linksTable}>
                {/* Row 1: About Us -> Find Centre */}
                <View style={styles.linksTableRow}>
                  <TouchableOpacity
                    style={[styles.linksTableCell, styles.linksTableCellBorderRight]}
                    onPress={() => {
                      onClose();
                      onNavigateAboutUs && onNavigateAboutUs();
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.linksTableCellText}>About Us</Text>
                    <Ionicons name="chevron-forward" size={17} color="#475569" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.linksTableCell}
                    onPress={() => {
                      onClose();
                      onNavigateFindCentre && onNavigateFindCentre();
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.linksTableCellText}>Find Centre</Text>
                    <Ionicons name="chevron-forward" size={17} color="#475569" />
                  </TouchableOpacity>
                </View>

                {/* Row 2: Customer Support -> FAQ */}
                <View style={styles.linksTableRow}>
                  <TouchableOpacity
                    style={[styles.linksTableCell, styles.linksTableCellBorderRight]}
                    onPress={() => {
                      onClose();
                      onNavigateCustomerSupport && onNavigateCustomerSupport();
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.linksTableCellText}>Customer Support</Text>
                    <Ionicons name="chevron-forward" size={17} color="#475569" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.linksTableCell}
                    onPress={() => {
                      onClose();
                      onNavigateFaq && onNavigateFaq();
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.linksTableCellText}>FAQ</Text>
                    <Ionicons name="chevron-forward" size={17} color="#475569" />
                  </TouchableOpacity>
                </View>

                {/* Row 3: Notice -> The Company */}
                <View style={[styles.linksTableRow, { borderBottomWidth: 0 }]}>
                  <TouchableOpacity
                    style={[styles.linksTableCell, styles.linksTableCellBorderRight]}
                    onPress={() => {
                      onClose();
                      onNavigateNotice && onNavigateNotice();
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.linksTableCellText}>Notice</Text>
                    <Ionicons name="chevron-forward" size={17} color="#475569" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.linksTableCell}
                    onPress={() => {
                      onClose();
                      onNavigateCompany && onNavigateCompany();
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.linksTableCellText}>The Company</Text>
                    <Ionicons name="chevron-forward" size={17} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Atomy Family Section */}
              <View style={styles.familySection}>
                <Text style={styles.sectionHeaderTitle}>Atomy Family</Text>
                <View style={styles.familyGrid}>
                  {/* Atomy Corp */}
                  <TouchableOpacity
                    style={styles.familyItem}
                    onPress={() => handleLinkPress('Atomy Corp.')}
                    activeOpacity={0.75}
                  >
                    <View style={styles.familyIconCircle}>
                      <Text style={styles.atomyLogoMini}>atomy</Text>
                    </View>
                    <Text style={styles.familyItemText}>Atomy Corp.</Text>
                  </TouchableOpacity>

                  {/* CH.ATOMY */}
                  <TouchableOpacity
                    style={styles.familyItem}
                    onPress={() => handleLinkPress('CH.ATOMY')}
                    activeOpacity={0.75}
                  >
                    <View style={styles.familyIconCircle}>
                      <Ionicons name="play" size={16} color="#6366F1" />
                    </View>
                    <Text style={styles.familyItemText}>CH.ATOMY</Text>
                  </TouchableOpacity>

                  {/* Atomy Ticket */}
                  <TouchableOpacity
                    style={styles.familyItem}
                    onPress={() => handleLinkPress('Atomy Ticket')}
                    activeOpacity={0.75}
                  >
                    <View style={styles.familyIconCircle}>
                      <Ionicons name="ticket-outline" size={17} color="#00A3E0" />
                    </View>
                    <Text style={styles.familyItemText}>Atomy Ticket</Text>
                  </TouchableOpacity>

                  {/* At.G Mall */}
                  <TouchableOpacity
                    style={styles.familyItem}
                    onPress={() => handleLinkPress('At.G Mall')}
                    activeOpacity={0.75}
                  >
                    <View style={styles.familyIconCircle}>
                      <Text style={styles.atGMini}>At.G</Text>
                    </View>
                    <Text style={styles.familyItemText}>At.G Mall</Text>
                  </TouchableOpacity>

                  {/* MASSTIGE TIMES */}
                  <TouchableOpacity
                    style={styles.familyItem}
                    onPress={() => handleLinkPress('MASSTIGE TIMES')}
                    activeOpacity={0.75}
                  >
                    <View style={styles.familyIconCircle}>
                      <Ionicons name="compass-outline" size={17} color="#00A3E0" />
                    </View>
                    <Text style={styles.familyItemText}>MASSTIGE TIMES</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            /* MY OFFICE TAB VIEW: DISTRIBUTOR JOINING PORTAL & KEY BENEFITS */
            <View style={styles.myOfficeContainer}>
              {/* Top Distributor Hero Card */}
              <View style={styles.distributorHeroCard}>
                <View style={styles.distributorBadgeRow}>
                  <View style={styles.distributorBadge}>
                    <Ionicons name="sparkles" size={13} color="#00A3E0" />
                    <Text style={styles.distributorBadgeText}>OFFICIAL ATOMY DISTRIBUTOR PORTAL</Text>
                  </View>
                </View>

                <Text style={styles.distributorHeroTitle}>
                  For distributors who are willing to join our distributor, please join here!
                </Text>

                <Text style={styles.distributorHeroDesc}>
                  Start your journey with Atomy India. Register as an independent distributor to unlock wholesale distributor pricing, lifetime Point Value (PV) accumulation, and global business commissions.
                </Text>

                {/* Primary Official Link Action Button */}
                <TouchableOpacity
                  style={styles.distributorJoinBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    Linking.openURL('https://in.atomy.com/main');
                  }}
                  accessibilityLabel="Join Atomy Distributor at in.atomy.com/main"
                >
                  <Ionicons name="person-add" size={18} color="#FFFFFF" />
                  <Text style={styles.distributorJoinBtnText}>Join As Atomy Distributor</Text>
                  <Ionicons name="open-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Official URL Pill */}
                <TouchableOpacity
                  style={styles.officialUrlPill}
                  activeOpacity={0.7}
                  onPress={() => {
                    Linking.openURL('https://in.atomy.com/main');
                  }}
                  accessibilityLabel="Open in.atomy.com/main"
                >
                  <Ionicons name="link-outline" size={14} color="#00A3E0" />
                  <Text style={styles.officialUrlText}>https://in.atomy.com/main</Text>
                  <View style={styles.officialUrlTag}>
                    <Text style={styles.officialUrlTagText}>Official Portal ↗</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Extra Points: Key Benefits of Joining as an Atomy Distributor */}
              <View style={styles.benefitsHeaderRow}>
                <Ionicons name="ribbon-outline" size={18} color="#00A3E0" />
                <Text style={styles.benefitsSectionTitle}>Why Join As An Atomy Distributor?</Text>
              </View>

              <View style={styles.benefitsList}>
                {[
                  {
                    icon: 'gift-outline',
                    title: '100% Free Membership & Zero Risk',
                    desc: 'No joining fees, no annual renewal charges, and zero mandatory starter kit purchases required.',
                    highlight: 'Zero Registration Fee',
                  },
                  {
                    icon: 'pricetag-outline',
                    title: 'Wholesale Distributor (DP) Pricing',
                    desc: 'Enjoy instant wholesale member discounts of 15% to 25% off retail MRP on all authentic Atomy products.',
                    highlight: 'Save 15% - 25% Immediately',
                  },
                  {
                    icon: 'trending-up-outline',
                    title: 'Personal PV Never Expires',
                    desc: 'Your personal Point Value (PV) accumulates for a lifetime and never resets to zero, qualifying you for higher ranks.',
                    highlight: 'Lifetime PV Accumulation',
                  },
                  {
                    icon: 'cash-outline',
                    title: 'Binary Commissions & Mastership Bonus',
                    desc: 'Earn daily matched general commissions and bi-monthly global mastership bonuses deposited directly to your bank.',
                    highlight: 'Weekly Bank Payouts',
                  },
                  {
                    icon: 'globe-outline',
                    title: 'One Global ID for 27+ Countries',
                    desc: 'Your distributor membership works seamlessly across India, Korea, USA, Canada, and global branches.',
                    highlight: 'Global Business License',
                  },
                  {
                    icon: 'people-outline',
                    title: 'Team Phoenix Mentorship & Training',
                    desc: 'Get full product webinars, marketing resources, leadership guidance, and dedicated local support to grow.',
                    highlight: 'Free Dedicated Mentorship',
                  },
                ].map((item, index) => (
                  <View key={index} style={styles.benefitCard}>
                    <View style={styles.benefitIconBox}>
                      <Ionicons name={item.icon} size={22} color="#00A3E0" />
                    </View>
                    <View style={styles.benefitContent}>
                      <View style={styles.benefitTitleRow}>
                        <Text style={styles.benefitTitle}>{item.title}</Text>
                      </View>
                      <View style={styles.benefitTag}>
                        <Text style={styles.benefitTagText}>{item.highlight}</Text>
                      </View>
                      <Text style={styles.benefitDesc}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Bottom Join Footer CTA */}
              <TouchableOpacity
                style={styles.bottomJoinCta}
                activeOpacity={0.85}
                onPress={() => {
                  Linking.openURL('https://in.atomy.com/main');
                }}
              >
                <View style={styles.bottomJoinCtaLeft}>
                  <Text style={styles.bottomJoinCtaTitle}>Ready to begin your journey?</Text>
                  <Text style={styles.bottomJoinCtaSub}>Tap to register at in.atomy.com/main</Text>
                </View>
                <View style={styles.bottomJoinCtaArrow}>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  cyanSafeArea: {
    backgroundColor: '#00A3E0',
  },

  // 1. TOP CYAN BAR
  topCyanBar: {
    height: 54,
    backgroundColor: '#00A3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topAuthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  topAuthDivider: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 10,
  },
  topActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconButton: {
    padding: 4,
  },

  // 2. SUB-BAR TABS
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    height: 48,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#00A3E0',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  tabTextActive: {
    color: '#00A3E0',
  },

  // 3. BODY & CATEGORY GRID
  scrollBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryCell: {
    width: '25%',
    height: 98,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  categoryCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  categoryCellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryIconWrap: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCellLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.2,
    lineHeight: 13,
  },

  // HemoHIM custom badge
  hemohimBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hemohimTextTop: {
    fontSize: 13,
    fontWeight: '900',
    color: '#DC2626',
    lineHeight: 14,
    letterSpacing: -0.3,
  },
  hemohimTextBottom: {
    fontSize: 13,
    fontWeight: '900',
    color: '#DC2626',
    lineHeight: 14,
    letterSpacing: 0.8,
  },

  // RECOMMENDED SERVICES
  recommendedSection: {
    paddingTop: 22,
    paddingBottom: 6,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  pillButton: {
    borderWidth: 1.5,
    borderColor: '#00A3E0',
    borderRadius: 24,
    paddingVertical: 9,
    paddingHorizontal: 22,
    backgroundColor: '#FFFFFF',
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  // 2-COLUMN LINKS TABLE
  linksTable: {
    marginTop: 22,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  linksTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  linksTableCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linksTableCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  linksTableCellText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },

  // ATOMY FAMILY SECTION
  familySection: {
    paddingTop: 24,
  },
  familyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  familyItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  familyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atomyLogoMini: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00A3E0',
    letterSpacing: -0.5,
  },
  atGMini: {
    fontSize: 8,
    fontWeight: '900',
    color: '#0284C7',
  },
  familyItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },

  // MY OFFICE TAB STYLES - DISTRIBUTOR JOINING PORTAL & BENEFITS
  myOfficeContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  distributorHeroCard: {
    backgroundColor: '#0F172A', // Sleek obsidian bright black card
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  distributorBadgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  distributorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 163, 224, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 224, 0.35)',
  },
  distributorBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  distributorHeroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
    marginBottom: 8,
  },
  distributorHeroDesc: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 16,
  },
  distributorJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00A3E0', // Official Atomy Cyan Blue
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  distributorJoinBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  officialUrlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  officialUrlText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginLeft: 6,
  },
  officialUrlTag: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  officialUrlTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // Benefits Section
  benefitsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  benefitsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  benefitsList: {
    gap: 12,
    marginBottom: 20,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  benefitIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitleRow: {
    marginBottom: 4,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  benefitTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 5,
  },
  benefitTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  benefitDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  // Bottom CTA
  bottomJoinCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00A3E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  bottomJoinCtaLeft: {
    flex: 1,
  },
  bottomJoinCtaTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomJoinCtaSub: {
    color: '#E0F2FE',
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '600',
  },
  bottomJoinCtaArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
