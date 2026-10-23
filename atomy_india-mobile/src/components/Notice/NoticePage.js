import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AtomyFooter from '../Navigation/AtomyFooter';

const phoenixLogo = require('../../../assets/fic-symbol.png');

const OFFICIAL_NOTICES = [
  {
    id: 1,
    tab: 'member',
    category: 'GENERAL NOTICE',
    title: 'New Register Member Coupon Offer',
    views: '18,362',
    date: '16-06-2026',
    summary: 'Instant ₹500 discount voucher credited to My Office for all newly registered and e-KYC verified members on orders above ₹3,500.',
    details: [
      'Eligibility: All new members successfully registered and verified via e-KYC.',
      'Coupon Benefit: Instant ₹ 500 Discount Voucher applicable on first shopping mall purchase above ₹ 3,500.',
      'Validity: 30 calendar days from the date of registration.',
      'How to Claim: Automatically credited to My Office > My Coupons upon registration completion.',
      'Start your absolute quality wellness journey with Atomy India today!'
    ]
  },
  {
    id: 2,
    tab: 'product',
    category: 'PRODUCT',
    title: 'HemoHIM Patented Herbal Extract Quality Standards',
    views: '24,190',
    date: '10-06-2026',
    summary: 'Government-certified testing reports and safety documentation published for recent HemoHIM batches in India.',
    details: [
      'Atomy HemoHIM is manufactured by Kolmar BNH under strict cGMP protocols.',
      'Individually approved immune-support supplement developed through 8 years of KAERI research.',
      'Fully compliant with FSSAI regulations and AYUSH certification standards in India.',
      'Authentic products are guaranteed exclusively when purchased through the official Atomy mobile app and website.'
    ]
  },
  {
    id: 3,
    tab: 'stock',
    category: 'SHIPPING & STOCK',
    title: 'Express Doorstep Delivery Network Across India',
    views: '12,854',
    date: '02-06-2026',
    summary: 'Upgraded delivery speeds across all Tier-1 and Tier-2 pin codes with live dispatch and tracking updates.',
    details: [
      'Partnered with tier-1 logistics networks (BlueDart, Delhivery, XpressBees).',
      'Average transit time for Metro cities: 2-3 business days.',
      'All other regions: 4-6 business days.',
      'Track your consignment live using your Order ID in Profile > Order History.'
    ]
  },
  {
    id: 4,
    tab: 'event',
    category: 'EVENT',
    title: 'Monthly Success Academy Schedule & Live Webcast',
    views: '31,420',
    date: '28-05-2026',
    summary: 'Join our national leadership academy stream this Saturday at 11:00 AM IST with leadership recognition & product launches.',
    details: [
      'Broadcast Live on CH.ATOMY and Zoom.',
      'Keynote addresses by Imperial Masters and Country Leadership.',
      'Mastership Promotion Ceremony for newly elevated Sales Masters and Diamond Masters.',
      'Interactive quiz with special gift sets for participating viewers.'
    ]
  },
  {
    id: 5,
    tab: 'member',
    category: 'OPERATION',
    title: 'Customer Support Working Hours & Courier Dispatch Updates',
    views: '9,812',
    date: '15-05-2026',
    summary: 'Customer counsel lines operate Mon-Sat 09:00 AM - 06:00 PM IST with prompt resolution support.',
    details: [
      'Toll-Free Helpline: 1800-103-8855',
      'Email Support: atomy_in@atomy.kr',
      'Warehouse operations remain operational 6 days a week at Gurugram fulfillment center.',
      'Center delivery orders are dispatched within 24 hours of order placement.'
    ]
  },
  {
    id: 6,
    tab: 'career',
    category: 'CAREER & LEADERSHIP',
    title: 'Team Phoenix India Leadership Development Program',
    views: '15,200',
    date: '01-05-2026',
    summary: 'Free mentorship workshop for distributors aspiring to achieve Mastership levels.',
    details: [
      'Comprehensive training on consumer acquisition and lineage structuring.',
      'In-depth breakdown of the Atomy Binary Compensation Plan.',
      'Digital marketing toolkit provided to all qualified distributors.',
      'Register via your local Education Centre Leader.'
    ]
  }
];

const NOTICE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'member', label: 'Member' },
  { id: 'product', label: 'Product' },
  { id: 'stock', label: 'Stock *' },
  { id: 'event', label: 'Event' },
  { id: 'career', label: 'Career' },
];

export default function NoticePage({
  onNavigateHome,
  onNavigateBack,
  onCartPress,
  cartCount = 0,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(1);

  const filteredNotices = useMemo(() => {
    return OFFICIAL_NOTICES.filter((n) => {
      if (activeTab !== 'all' && n.tab !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = n.title.toLowerCase().includes(q);
        const inCat = n.category.toLowerCase().includes(q);
        const inSum = n.summary.toLowerCase().includes(q);
        if (!inTitle && !inCat && !inSum) return false;
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  return (
    <View style={styles.container}>
      {/* 1. CENTERED NOTICE TITLE & BREADCRUMB */}
      <View style={styles.titleSection}>
        <Text style={styles.pageMainTitle}>Notices & Announcements</Text>
        <View style={styles.breadcrumbBar}>
          <View style={styles.breadcrumbPath}>
            <TouchableOpacity onPress={onNavigateHome} activeOpacity={0.7}>
              <Text style={styles.breadLink}>HOME</Text>
            </TouchableOpacity>
            <Text style={styles.breadSep}>&gt;</Text>
            <Text style={styles.breadActive}>Notice</Text>
          </View>
        </View>
      </View>

      {/* 2. SEARCH BAR */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notices, coupons, events..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. HORIZONTAL TABS */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {NOTICE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. NOTICES LIST */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>
          {filteredNotices.length} Announcements Found
        </Text>

        {filteredNotices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Notices Found</Text>
            <Text style={styles.emptySub}>
              There are no announcements currently published under this category.
            </Text>
          </View>
        ) : (
          filteredNotices.map((notice) => {
            const isExpanded = expandedId === notice.id;
            return (
              <View key={notice.id} style={[styles.noticeCard, isExpanded && styles.noticeCardActive]}>
                <TouchableOpacity
                  style={styles.noticeHeader}
                  onPress={() => setExpandedId(isExpanded ? null : notice.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.topInfoRow}>
                    <View style={styles.catBadge}>
                      <Text style={styles.catBadgeText}>{notice.category}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="eye-outline" size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>{notice.views}</Text>
                      <Text style={styles.metaDivider}>•</Text>
                      <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>{notice.date}</Text>
                    </View>
                  </View>

                  <Text style={[styles.noticeTitle, isExpanded && styles.noticeTitleActive]}>
                    {notice.title}
                  </Text>

                  <Text style={styles.noticeSummary} numberOfLines={isExpanded ? 0 : 2}>
                    {notice.summary}
                  </Text>

                  <View style={styles.expandRow}>
                    <Text style={styles.expandHint}>
                      {isExpanded ? 'Show less' : 'Read full announcement'}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#00A3E0"
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && notice.details && (
                  <View style={styles.detailsBox}>
                    <Text style={styles.detailsHeader}>Key Information:</Text>
                    {notice.details.map((point, pIdx) => (
                      <View key={pIdx} style={styles.detailPointRow}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.detailPointText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Official Corporate & Support Footer */}
        <AtomyFooter />
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    justifyContent: 'flex-start',
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
  backButton: {
    padding: 6,
    marginLeft: -4,
  },
  brandingCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginLeft: 8,
  },
  phoenixEmblem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  brandingTextCol: {
    flexShrink: 1,
  },
  brandingTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandingSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
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
    backgroundColor: '#E11D48',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  tabsScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00A3E0',
  },
  tabText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#00A3E0',
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
    marginLeft: 2,
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noticeCardActive: {
    borderColor: '#BAE6FD',
  },
  noticeHeader: {
    padding: 16,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  catBadgeText: {
    color: '#00A3E0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  metaDivider: {
    color: '#CBD5E1',
    marginHorizontal: 2,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
  },
  noticeTitleActive: {
    color: '#00A3E0',
  },
  noticeSummary: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 10,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandHint: {
    fontSize: 12,
    color: '#00A3E0',
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 16,
    gap: 8,
  },
  detailsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  detailPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A3E0',
    marginTop: 6,
  },
  detailPointText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
