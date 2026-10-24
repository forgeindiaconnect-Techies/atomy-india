import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import MembershipPaymentModal from './MembershipPaymentModal';
import { getMembershipExpiryInfo } from './MembershipExpiryBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MembershipPage({
  isMember = false,
  currentUser = null,
  membershipData = null,
  membershipExpiryInfo = null,
  onNavigateHome,
  onNavigateBack,
  onMembershipActivated,
  onMembershipCancelled,
}) {
  const [selectedPlan, setSelectedPlan] = useState('ANNUAL'); // 'MONTHLY' | 'ANNUAL'
  const [activeFaq, setActiveFaq] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const expiry = useMemo(() => {
    return membershipExpiryInfo || getMembershipExpiryInfo(membershipData || (isMember ? { expiryDate: true } : null));
  }, [membershipExpiryInfo, membershipData, isMember]);

  const isExpiringSoon = expiry?.status === 'EXPIRING_SOON';
  const isExpired = expiry?.status === 'EXPIRED';

  // Official membership pricing matching website
  const settings = {
    monthlyFee: '299',
    annualFee: '2,499',
  };

  const handleSubscribe = (plan = selectedPlan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handleCancelMembership = () => {
    Alert.alert(
      'Cancel Membership',
      'Are you sure you want to cancel your distributor membership? You will lose access to wholesale Distributor Prices (DP).',
      [
        { text: 'Keep Membership', style: 'cancel' },
        {
          text: 'Cancel Membership',
          style: 'destructive',
          onPress: () => {
            if (onMembershipCancelled) {
              onMembershipCancelled();
            }
          },
        },
      ]
    );
  };

  const benefits = [
    {
      id: 'dp',
      icon: 'pricetag-outline',
      title: 'Wholesale DP Pricing',
      desc: 'Save ~18% to 20% on every order. Purchase all authentic Atomy products at direct wholesale distributor rates rather than retail MRP.',
      color: '#00A3E0',
    },
    {
      id: 'pv',
      icon: 'sparkles-outline',
      title: 'Personal PV Points',
      desc: 'Every purchase accumulates Point Value (PV) credited straight to your profile, unlocking distributor compensation advantages.',
      color: '#0284C7',
    },
    {
      id: 'dispatch',
      icon: 'airplane-outline',
      title: 'Priority Fast Dispatch',
      desc: 'Enjoy expedited order packaging and free standard delivery on qualifying Atomy orders directly from our verified warehouse.',
      color: '#059669',
    },
    {
      id: 'quality',
      icon: 'shield-checkmark-outline',
      title: 'Absolute Quality Guarantee',
      desc: '100% genuine Korean wellness and personal care formulations backed by Kolmar BNH and Atomy Global standards.',
      color: '#7C3AED',
    },
  ];

  const faqs = [
    {
      q: 'What is the Distributor Price (DP)?',
      a: 'Distributor Price (DP) is the exclusive wholesale rate offered only to registered Atomy Distributor Members. It offers an average 18% to 20% discount below the Maximum Retail Price (MRP) across our entire catalog.',
    },
    {
      q: 'What is PV (Point Value)?',
      a: 'Point Value (PV) is the numerical value assigned to each Atomy product. When an active Distributor Member purchases products at DP price, PV points accumulate directly to their member ID.',
    },
    {
      q: 'Do I get instant access to DP prices after subscribing?',
      a: 'Yes! As soon as your membership is activated, all product prices across the app automatically switch to wholesale Distributor Price (DP), and PV points become visible on all cards.',
    },
    {
      q: 'Can I cancel or switch my plan?',
      a: 'Yes, you can renew or manage your membership anytime from your Profile under the Distributor Membership tab without any cancellation penalties or hidden fees.',
    },
  ];

  return (
    <View style={styles.root}>
      {/* 1. Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onNavigateBack || onNavigateHome}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Back to Shopping Mall</Text>
        </TouchableOpacity>

        <View style={styles.breadcrumbWrap}>
          <Text style={styles.crumbText} onPress={onNavigateHome}>
            Home
          </Text>
          <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.7)" />
          <Text style={styles.crumbTextActive}>Distributor Membership</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Section Matching Website */}
        <View style={styles.heroCard}>
          <View style={styles.goldBadge}>
            <Ionicons name="ribbon-outline" size={15} color="#D97706" />
            <Text style={styles.goldBadgeText}>OFFICIAL ATOMY DISTRIBUTOR MEMBERSHIP</Text>
          </View>

          <Text style={styles.heroTitle}>
            Join Membership to get the Distributor Price (DP) & Earn PV
          </Text>

          <Text style={styles.heroSubtitle}>
            Unlock wholesale member pricing across all premium Korean skincare, health
            supplements, and personal care essentials with Point Value (PV) benefits.
          </Text>

          {/* Active / Expiring Soon / Expired Status Box */}
          {(isMember || isExpired) && (
            <View
              style={[
                styles.activeStatusBox,
                isExpiringSoon && styles.activeStatusBoxWarning,
                isExpired && styles.activeStatusBoxExpired,
              ]}
            >
              <View style={styles.activeStatusHeader}>
                <View
                  style={[
                    styles.activeStatusIconCircle,
                    isExpiringSoon && styles.activeStatusIconCircleWarning,
                    isExpired && styles.activeStatusIconCircleExpired,
                  ]}
                >
                  <Ionicons
                    name={
                      isExpired
                        ? 'alert-circle'
                        : isExpiringSoon
                        ? 'time'
                        : 'shield-checkmark'
                    }
                    size={22}
                    color={
                      isExpired
                        ? '#DC2626'
                        : isExpiringSoon
                        ? '#D97706'
                        : '#10B981'
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.activeStatusTitle,
                      isExpiringSoon && styles.activeStatusTitleWarning,
                      isExpired && styles.activeStatusTitleExpired,
                    ]}
                  >
                    {isExpired
                      ? `Membership Plan Expired (${expiry?.expiryDateStr || ''})`
                      : isExpiringSoon
                      ? `Plan Expires in ${expiry?.remainingDays || 2} Day${expiry?.remainingDays === 1 ? '' : 's'} (${expiry?.expiryDateStr || ''})`
                      : 'Active Distributor Member'}
                  </Text>
                  <Text
                    style={[
                      styles.activeStatusDesc,
                      isExpiringSoon && styles.activeStatusDescWarning,
                      isExpired && styles.activeStatusDescExpired,
                    ]}
                  >
                    {isExpired
                      ? 'Reactivate your distributor plan now to unlock wholesale DP pricing and earn personal PV points.'
                      : isExpiringSoon
                      ? 'Renew today to maintain uninterrupted access to wholesale DP prices and accumulate personal PV points.'
                      : 'Wholesale Distributor Pricing (DP) is active on your account.'}
                  </Text>
                </View>
              </View>

              {/* Status Metadata Chips Row */}
              <View style={styles.statusChipsRow}>
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipLabel}>Plan: </Text>
                  <Text style={styles.statusChipVal}>
                    {membershipData?.plan === 'ANNUAL' ? 'Annual (₹2,499)' : 'Monthly (₹299)'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusChip,
                    isExpiringSoon && styles.statusChipWarning,
                    isExpired && styles.statusChipExpired,
                  ]}
                >
                  <Text style={styles.statusChipLabel}>Status: </Text>
                  <Text
                    style={[
                      styles.statusChipVal,
                      isExpiringSoon && { color: '#B45309', fontWeight: '800' },
                      isExpired && { color: '#DC2626', fontWeight: '800' },
                    ]}
                  >
                    {isExpired
                      ? '● Expired'
                      : isExpiringSoon
                      ? `⚠️ ${expiry?.remainingDays || 2}d Left`
                      : '● Active'}
                  </Text>
                </View>
                {expiry?.expiryDateStr ? (
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipLabel}>Expires: </Text>
                    <Text style={styles.statusChipVal}>{expiry.expiryDateStr}</Text>
                  </View>
                ) : null}
              </View>

              {/* Action Buttons: Clean full-width layout without cramped text wrapping */}
              <View style={styles.activeActionsRow}>
                {isExpiringSoon || isExpired ? (
                  <TouchableOpacity
                    style={[
                      styles.actionPrimaryBtn,
                      isExpired ? styles.reactivateActionBtn : styles.renewActionBtn,
                    ]}
                    onPress={() => handleSubscribe('MONTHLY')}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionPrimaryBtnText}>
                      {isExpired ? 'Reactivate Plan Now (₹299)' : 'Renew Plan Now (₹299)'}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.actionPrimaryBtn,
                    (isExpiringSoon || isExpired) ? styles.actionSecondaryShoppingBtn : styles.continueMallBtn,
                  ]}
                  onPress={onNavigateHome}
                  activeOpacity={0.88}
                >
                  <Ionicons
                    name="cart-outline"
                    size={16}
                    color={(isExpiringSoon || isExpired) ? '#0F172A' : '#FFFFFF'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.actionPrimaryBtnText,
                      (isExpiringSoon || isExpired) && { color: '#0F172A' },
                    ]}
                  >
                    Start Shopping at DP Price
                  </Text>
                </TouchableOpacity>

                {isMember && !isExpired && (
                  <TouchableOpacity
                    style={styles.cancelMembershipInlineBtn}
                    onPress={handleCancelMembership}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelMembershipInlineText}>Cancel Membership</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* 3. Plan Selection Section (Matching Website) */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitleCenter}>Choose Your Membership Plan</Text>
          <Text style={styles.sectionSubCenter}>
            Simple, transparent pricing with no hidden charges
          </Text>

          <View style={styles.plansContainer}>
            {/* Monthly Plan */}
            <TouchableOpacity
              style={[
                styles.planBox,
                selectedPlan === 'MONTHLY' && styles.planBoxActive,
              ]}
              onPress={() => setSelectedPlan('MONTHLY')}
              activeOpacity={0.88}
            >
              <View style={styles.planHeader}>
                <View style={styles.planRadioRow}>
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === 'MONTHLY' && styles.radioCircleChecked,
                    ]}
                  >
                    {selectedPlan === 'MONTHLY' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.planName}>Monthly Plan</Text>
                </View>

                <View style={styles.planCost}>
                  <Text style={styles.currency}>₹</Text>
                  <Text style={styles.amount}>{settings.monthlyFee}</Text>
                  <Text style={styles.cadence}> / month</Text>
                </View>
              </View>

              <View style={styles.planFeatureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#00A3E0" />
                  <Text style={styles.featureItemText}>Instant access to Wholesale DP Price</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#00A3E0" />
                  <Text style={styles.featureItemText}>Personal PV point value credit</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#00A3E0" />
                  <Text style={styles.featureItemText}>30 days active distributor status</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#00A3E0" />
                  <Text style={styles.featureItemText}>Cancel or renew anytime</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.planSelectBtn,
                  selectedPlan === 'MONTHLY' && styles.planSelectBtnActive,
                ]}
                onPress={() => {
                  setSelectedPlan('MONTHLY');
                  handleSubscribe('MONTHLY');
                }}
              >
                <Text
                  style={[
                    styles.planSelectBtnText,
                    selectedPlan === 'MONTHLY' && styles.planSelectBtnTextActive,
                  ]}
                >
                  {isMember ? 'Renew Monthly' : 'Continue with Monthly Plan'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Annual Plan (Featured Best Value) */}
            <TouchableOpacity
              style={[
                styles.planBox,
                styles.planBoxFeatured,
                selectedPlan === 'ANNUAL' && styles.planBoxActive,
              ]}
              onPress={() => setSelectedPlan('ANNUAL')}
              activeOpacity={0.88}
            >
              <View style={styles.featuredBanner}>
                <Text style={styles.featuredBannerText}>BEST VALUE • SAVE 30%</Text>
              </View>

              <View style={styles.planHeader}>
                <View style={styles.planRadioRow}>
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === 'ANNUAL' && styles.radioCircleChecked,
                    ]}
                  >
                    {selectedPlan === 'ANNUAL' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.planName}>Annual Plan</Text>
                </View>

                <View style={styles.planCost}>
                  <Text style={styles.currency}>₹</Text>
                  <Text style={styles.amount}>{settings.annualFee}</Text>
                  <Text style={styles.cadence}> / year</Text>
                </View>
              </View>

              <View style={styles.planFeatureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.featureItemText}>
                    <Text style={{ fontWeight: '800' }}>Full 365 Days</Text> of Wholesale DP
                    Price
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.featureItemText}>
                    Maximum PV accumulation on all orders
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.featureItemText}>
                    Save ₹1,089 compared to monthly billing
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.featureItemText}>
                    Priority distributor customer care
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.featureItemText}>
                    Early access to new product releases
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.planSelectBtn,
                  styles.planSelectBtnFeatured,
                  selectedPlan === 'ANNUAL' && styles.planSelectBtnActive,
                ]}
                onPress={() => {
                  setSelectedPlan('ANNUAL');
                  handleSubscribe('ANNUAL');
                }}
              >
                <Text
                  style={[
                    styles.planSelectBtnText,
                    styles.planSelectBtnTextFeatured,
                  ]}
                >
                  {isMember
                    ? 'Renew Annual Plan'
                    : 'Continue with Annual Plan (Recommended)'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Action CTA Block */}
          {!isMember && (
            <TouchableOpacity
              style={styles.mainSubscribeBtn}
              onPress={() => handleSubscribe(selectedPlan)}
              activeOpacity={0.88}
            >
              <Text style={styles.mainSubscribeBtnText}>
                Continue to Payment & Checkout (₹{' '}
                {selectedPlan === 'ANNUAL' ? settings.annualFee : settings.monthlyFee})
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* 4. Distributor Member Privileges (4 Benefit Cards) - Placed Below Plan Cards */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitleCenter}>Distributor Member Privileges</Text>
          <Text style={styles.sectionSubCenter}>
            Everything you receive as an official Atomy Distributor
          </Text>

          <View style={styles.benefitsGrid}>
            {benefits.map((b) => (
              <View key={b.id} style={styles.benefitCard}>
                <View style={[styles.benefitIconWrap, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name={b.icon} size={22} color={b.color} />
                </View>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 5. Website FAQs Accordion */}
        <View style={styles.faqsSection}>
          <Text style={styles.sectionTitleCenter}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSubCenter}>Everything you need to know about DP & PV</Text>

          <View style={styles.faqsList}>
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <View key={index} style={styles.faqCard}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => setActiveFaq(isOpen ? null : index)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.faqQuestionText}>{faq.q}</Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>

                  {isOpen && <Text style={styles.faqAnswerText}>{faq.a}</Text>}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Official Membership Payment Sheet Modal */}
      <MembershipPaymentModal
        visible={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currentUser={currentUser}
        plan={selectedPlan}
        onSuccess={(member) => {
          setIsPaymentModalOpen(false);
          if (onMembershipActivated) {
            onMembershipActivated(member);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  breadcrumbWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crumbText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11.5,
  },
  crumbTextActive: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  goldBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 27,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },

  // Active status box
  activeStatusBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  activeStatusBoxWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    shadowColor: '#F59E0B',
  },
  activeStatusBoxExpired: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
  },
  activeStatusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  activeStatusIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activeStatusIconCircleWarning: {
    backgroundColor: '#FEF3C7',
  },
  activeStatusIconCircleExpired: {
    backgroundColor: '#FEE2E2',
  },
  activeStatusTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#15803D',
    lineHeight: 20,
  },
  activeStatusTitleWarning: {
    color: '#B45309',
  },
  activeStatusTitleExpired: {
    color: '#DC2626',
  },
  activeStatusDesc: {
    fontSize: 12,
    color: '#166534',
    marginTop: 3,
    lineHeight: 17,
  },
  activeStatusDescWarning: {
    color: '#92400E',
  },
  activeStatusDescExpired: {
    color: '#991B1B',
  },
  statusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  statusChipWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statusChipExpired: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  statusChipLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  statusChipVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeActionsRow: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
  },
  actionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 9,
  },
  continueMallBtn: {
    backgroundColor: '#059669',
  },
  renewActionBtn: {
    backgroundColor: '#D97706',
  },
  reactivateActionBtn: {
    backgroundColor: '#DC2626',
  },
  actionSecondaryShoppingBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  actionPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  cancelMembershipInlineBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cancelMembershipInlineText: {
    color: '#EF4444',
    fontSize: 11.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Section titles
  sectionTitleCenter: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sectionSubCenter: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsGrid: {
    gap: 10,
  },
  benefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  benefitIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  // Pricing Section
  pricingSection: {
    marginBottom: 24,
  },
  plansContainer: {
    gap: 14,
    marginBottom: 14,
  },
  planBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
    position: 'relative',
  },
  planBoxFeatured: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F8FCFF',
  },
  planBoxActive: {
    borderColor: '#00A3E0',
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  featuredBanner: {
    position: 'absolute',
    top: -11,
    left: 20,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  featuredBannerText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  planRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleChecked: {
    borderColor: '#00A3E0',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00A3E0',
  },
  planName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  planCost: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00A3E0',
    marginRight: 2,
  },
  amount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  cadence: {
    fontSize: 12,
    color: '#64748B',
  },
  planFeatureList: {
    gap: 8,
    marginBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureItemText: {
    fontSize: 12.5,
    color: '#334155',
    flex: 1,
  },
  planSelectBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  planSelectBtnFeatured: {
    backgroundColor: '#00A3E0',
  },
  planSelectBtnActive: {
    backgroundColor: '#00A3E0',
  },
  planSelectBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  planSelectBtnTextFeatured: {
    color: '#FFFFFF',
  },
  planSelectBtnTextActive: {
    color: '#FFFFFF',
  },

  // Main Subscribe CTA
  mainSubscribeBtn: {
    backgroundColor: '#00A3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  mainSubscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
  },

  // FAQs
  faqsSection: {
    marginBottom: 20,
  },
  faqsList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
});
