import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AtomyFooter from '../Navigation/AtomyFooter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const phoenixLogo = require('../../../assets/team_phoenix_circle_clean.png');

const JOIN_STEPS = [
  {
    step: 'Step 01',
    title: 'Eligibility & Sponsor ID Verification',
    desc: 'Applicant must be an Indian citizen aged 18 or above with a valid PAN Card and Aadhaar/Voter ID. Enter your sponsor’s 8-digit Member ID to attach to their lineage network.',
    icon: 'person-add-outline',
  },
  {
    step: 'Step 02',
    title: 'KYC Document Authentication',
    desc: 'Upload clear scans or photos of your PAN Card and Government Address Proof. Fast instant OTP verification ensures secure, compliant identity validation.',
    icon: 'shield-checkmark-outline',
  },
  {
    step: 'Step 03',
    title: 'Designate Your Local Education Centre',
    desc: 'Select your preferred official Atomy Education Centre located closest to your city or postal district to receive free parcel pickup and localized community mentoring.',
    icon: 'business-outline',
  },
  {
    step: 'Step 04',
    title: 'Account Generation & Immediate Access',
    desc: 'Your unique 8-digit Atomy Member ID is generated instantly. Sign in immediately to start shopping at exclusive Member Wholesale Prices with complete PV accrual.',
    icon: 'checkmark-circle-outline',
  },
];

const ORDER_STEPS = [
  {
    step: 'Step 01',
    title: 'Browse Shopping Mall & Add to Cart',
    desc: 'Explore Health Supplements (HemoHIM, Probiotics), Beauty (Absolute Skincare), Personal Care, and Home Living. Click "+ Add to Cart" or "Buy Now".',
    icon: 'cart-outline',
  },
  {
    step: 'Step 02',
    title: 'Select Delivery Destination',
    desc: 'Choose either your Direct Home/Office Shipping Address or pick up from your affiliated Atomy Education Centre for free delivery options.',
    icon: 'location-outline',
  },
  {
    step: 'Step 03',
    title: 'Complete Secure Online Payment',
    desc: 'Pay safely through UPI (Google Pay, PhonePe, Paytm), RuPay / Visa / Mastercard, or Direct Net Banking. Instant order confirmation SMS and Email dispatched.',
    icon: 'card-outline',
  },
  {
    step: 'Step 04',
    title: 'Dispatch & Real-Time Tracking',
    desc: 'Orders are dispatched within 24-48 hours from the Gurugram Central Fulfillment Center with automated Blue Dart AWB tracking numbers.',
    icon: 'cube-outline',
  },
];

const DELIVERY_INFO = [
  {
    title: 'Logistics Partners',
    desc: 'Dispatched through Blue Dart Express, Delhivery, and XpressBees with full door-to-door transit insurance.',
    icon: 'airplane-outline',
  },
  {
    title: 'Free Shipping Threshold',
    desc: 'Orders totaling ₹4,500 and above qualify for 100% Free Shipping to any reachable PIN code across India.',
    icon: 'gift-outline',
  },
  {
    title: 'Education Centre Free Pickup',
    desc: 'Deliveries sent to your registered Education Centre are completely FREE regardless of order size.',
    icon: 'business-outline',
  },
  {
    title: 'Transit Delivery Speeds',
    desc: 'Metro Cities: 2 - 3 business days. Tier-2 & Tier-3 Regional Hubs: 3 - 6 business days.',
    icon: 'time-outline',
  },
];

const RETURN_INFO = [
  {
    title: '30-Day 100% Satisfaction Guarantee',
    desc: 'If not completely satisfied with product quality, return within 30 calendar days from delivery date.',
    icon: 'refresh-circle-outline',
  },
  {
    title: 'Hassle-Free Doorstep Reverse Pickup',
    desc: 'Our logistics partners will pick up the parcel directly from your doorstep with pre-printed return labels.',
    icon: 'swap-horizontal-outline',
  },
  {
    title: 'Prompt Full Refund',
    desc: '100% refund credited back to the original payment source (UPI/Bank/Card) within 5-7 business days of quality inspection.',
    icon: 'wallet-outline',
  },
];

export default function GuidePage({
  onNavigateHome,
  onNavigateBack,
  onNavigateMembership,
}) {
  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'order' | 'delivery' | 'return'

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. CENTERED MEMBER GUIDE TITLE & BREADCRUMB */}
        <View style={styles.titleSection}>
          <Text style={styles.pageMainTitle}>Member Guide</Text>
          <View style={styles.breadcrumbBar}>
            <View style={styles.breadcrumbPath}>
              <TouchableOpacity onPress={onNavigateHome} activeOpacity={0.7}>
                <Text style={styles.breadLink}>HOME</Text>
              </TouchableOpacity>
              <Text style={styles.breadSep}>&gt;</Text>
              <Text style={styles.breadActive}>Member Guide</Text>
            </View>

            <TouchableOpacity
              style={styles.inlineJoinBtn}
              onPress={onNavigateMembership || onNavigateHome}
              activeOpacity={0.7}
            >
              <Text style={styles.inlineJoinBtnText}>Join Member</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* 2. HERO BANNER */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Ionicons name="book-outline" size={13} color="#00A3E0" />
            <Text style={styles.heroBadgeText}>OFFICIAL USER GUIDE</Text>
          </View>
          <Text style={styles.heroTitle}>Member & Shopping Guide</Text>
          <Text style={styles.heroDesc}>
            Step-by-step procedures for seamless registration, shopping mall orders, delivery tracking, and returns.
          </Text>
        </View>

        {/* 3. TABS BAR */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
          style={styles.tabsScroll}
        >
          {[
            { id: 'join', label: '1. Join Guide', icon: 'person-add-outline' },
            { id: 'order', label: '2. Order Guide', icon: 'cart-outline' },
            { id: 'delivery', label: '3. Delivery & Transit', icon: 'cube-outline' },
            { id: 'return', label: '4. Returns & Guarantee', icon: 'refresh-outline' },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabPill, activeTab === t.id && styles.tabPillActive]}
              onPress={() => setActiveTab(t.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={t.icon}
                size={14}
                color={activeTab === t.id ? '#FFFFFF' : '#64748B'}
              />
              <Text style={[styles.tabPillText, activeTab === t.id && styles.tabPillTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ========================================================================= */}
        {/* TAB 1: JOIN GUIDE */}
        {/* ========================================================================= */}
        {activeTab === 'join' && (
          <View style={styles.panelContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>How to Become an Atomy Member</Text>
              <Text style={styles.sectionSubtitle}>
                Free registration with zero joining fees.
              </Text>
            </View>

            {JOIN_STEPS.map((s, idx) => (
              <View key={`join-${idx}`} style={styles.stepCard}>
                <View style={styles.stepNumCol}>
                  <View style={styles.stepIconBox}>
                    <Ionicons name={s.icon} size={20} color="#00A3E0" />
                  </View>
                  <Text style={styles.stepNumText}>{s.step}</Text>
                </View>
                <View style={styles.stepContentCol}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.88}
              onPress={onNavigateMembership || onNavigateHome}
            >
              <Text style={styles.ctaButtonText}>Register as Distributor Now</Text>
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ORDER GUIDE */}
        {/* ========================================================================= */}
        {activeTab === 'order' && (
          <View style={styles.panelContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ordering & Payment Procedures</Text>
              <Text style={styles.sectionSubtitle}>
                Instant checkout with UPI, Card, and Net Banking.
              </Text>
            </View>

            {ORDER_STEPS.map((s, idx) => (
              <View key={`order-${idx}`} style={styles.stepCard}>
                <View style={styles.stepNumCol}>
                  <View style={[styles.stepIconBox, { backgroundColor: '#EDE9FE' }]}>
                    <Ionicons name={s.icon} size={20} color="#7C3AED" />
                  </View>
                  <Text style={[styles.stepNumText, { color: '#7C3AED' }]}>{s.step}</Text>
                </View>
                <View style={styles.stepContentCol}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DELIVERY & TRANSIT */}
        {/* ========================================================================= */}
        {activeTab === 'delivery' && (
          <View style={styles.panelContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shipping Policy & Express Network</Text>
              <Text style={styles.sectionSubtitle}>
                Dispatched from Gurugram Central Fulfillment Center.
              </Text>
            </View>

            {DELIVERY_INFO.map((d, idx) => (
              <View key={`del-${idx}`} style={styles.infoCard}>
                <View style={[styles.stepIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name={d.icon} size={20} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>{d.title}</Text>
                  <Text style={styles.infoDesc}>{d.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: RETURNS & GUARANTEE */}
        {/* ========================================================================= */}
        {activeTab === 'return' && (
          <View style={styles.panelContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>30-Day Money Back Guarantee</Text>
              <Text style={styles.sectionSubtitle}>
                Compliant with Consumer Protection Direct Selling Rules 2021.
              </Text>
            </View>

            {RETURN_INFO.map((r, idx) => (
              <View key={`ret-${idx}`} style={styles.infoCard}>
                <View style={[styles.stepIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name={r.icon} size={20} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>{r.title}</Text>
                  <Text style={styles.infoDesc}>{r.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Official Corporate & Support Footer */}
        <AtomyFooter />
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  /* Title Section with Centered Heading & Breadcrumb Bar */
  titleSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  pageMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  breadcrumbPath: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadLink: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  breadSep: {
    fontSize: 11,
    color: '#94A3B8',
  },
  breadActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0082CD',
  },
  inlineJoinBtn: {
    backgroundColor: '#0082CD',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  inlineJoinBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
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
  navJoinBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navJoinBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroBanner: {
    backgroundColor: '#0F2942',
    paddingHorizontal: 16,
    paddingVertical: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  tabsScroll: {
    marginTop: 12,
  },
  tabsScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  panelContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 10,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  stepNumCol: {
    alignItems: 'center',
    gap: 4,
  },
  stepIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00A3E0',
  },
  stepContentCol: {
    flex: 1,
    gap: 3,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  infoDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
