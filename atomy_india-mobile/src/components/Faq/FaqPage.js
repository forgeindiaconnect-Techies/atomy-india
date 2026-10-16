import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const phoenixLogo = require('../../../assets/team_phoenix_circle_clean.png');

const FAQ_DATA = [
  {
    id: 'faq-1',
    category: 'Delivery',
    question: "Why haven't I received my delivery yet?",
    answer: "Orders across India are dispatched via certified logistics partners (BlueDart, Delhivery, XpressBees). Standard delivery takes 3 to 7 business days depending on state and PIN code. You can check live tracking from 'Order/Delivery' in your profile or contact our helpdesk."
  },
  {
    id: 'faq-2',
    category: 'Distributor',
    question: "What is the criteria to become an Atomy Distributor in India?",
    answer: "Any Indian citizen aged 18 or above with a valid PAN Card and Aadhaar/Voter ID can register as an Atomy Distributor. Membership is 100% free with zero joining fees. To activate sponsorship points and accumulate downline PV, purchase products totaling 10,000 PV (~₹1,500 - ₹2,000)."
  },
  {
    id: 'faq-3',
    category: 'Commission',
    question: "Where can I check my commission records?",
    answer: "Log into 'My Office' on the Atomy portal or mobile app and tap 'General Commission Statement'. Commission payments are calculated daily and settled weekly on Tuesdays directly into your verified bank account."
  },
  {
    id: 'faq-4',
    category: 'Distributor',
    question: "Where can I find my purchase record or group lineage record?",
    answer: "Navigate to My Office > Lineage / My Group Purchase Record. Here you can inspect daily Left Leg and Right Leg volumes, accumulated Point Value (PV), and order histories across all generations."
  },
  {
    id: 'faq-5',
    category: 'Distributor',
    question: "How do I register to become an Atomy Distributor?",
    answer: "Tap 'Join Us' on the menu or top navigation. Select 'Indian Resident (18+)', verify your mobile number with OTP, enter your Sponsor Member ID (provided by your upline mentor), submit your KYC documents, and your account will be activated."
  },
  {
    id: 'faq-6',
    category: 'Product',
    question: "What is the return and refund policy for Atomy products?",
    answer: "Atomy India offers a 100% 30-day customer satisfaction money-back guarantee on unused, sealed items or verified defects. Submit a ticket in 'About Us > 1:1 Support' or call our toll-free line to initiate a return pickup."
  },
  {
    id: 'faq-7',
    category: 'Commission',
    question: "Do my personal Point Values (PV) ever expire?",
    answer: "No! Your Personal Point Value (Personal PV) never expires as long as you maintain active membership by making at least 1 purchase within a 12-month period. Personal PV accumulates permanently throughout your lifetime."
  },
  {
    id: 'faq-8',
    category: 'Delivery',
    question: "Can I deliver products to a local Atomy Education Centre?",
    answer: "Yes! During checkout on the Order Sheet, select 'Education Centre Delivery'. Centre delivery is completely FREE with zero shipping fees regardless of order amount, and you can pick up your parcel directly from the centre."
  },
  {
    id: 'faq-9',
    category: 'Commission',
    question: "How does the binary compensation structure work?",
    answer: "Atomy uses a consumer-friendly binary compensation model with two legs: Left Leg and Right Leg. When both legs accumulate qualifying point values (minimum 300,000 PV on each leg), a commission score is matched and bonus is rewarded."
  },
  {
    id: 'faq-10',
    category: 'Product',
    question: "What makes Atomy's 'Masstige' philosophy unique?",
    answer: "Masstige stands for 'Mass Prestige'—providing absolute quality luxury products at absolute affordable prices. By cutting out advertising, wholesalers, and retail markups, premium wellness and skincare products are delivered directly to consumers."
  }
];

const FAQ_CATEGORIES = ['All', 'Delivery', 'Distributor', 'Commission', 'Product'];

export default function FaqPage({
  onNavigateHome,
  onNavigateBack,
  onNavigateAboutUs,
  onCartPress,
  cartCount = 0,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState('faq-1');

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inQ = item.question.toLowerCase().includes(q);
        const inA = item.answer.toLowerCase().includes(q);
        if (!inQ && !inA) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const toggleAccordion = (id) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:18001038855').catch(() => {
      Alert.alert('Customer Care', 'Toll Free: 1800-103-8855 (Mon-Sat 9AM-6PM)');
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
              FAQ DIRECTORY
            </Text>
            <Text style={styles.brandingSubtitle}>Frequently Asked Questions</Text>
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

      {/* 2. SEARCH BAR */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions, delivery, PV, commission..."
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

      {/* 3. CATEGORY FILTER TABS */}
      <View style={styles.categoryFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {FAQ_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. SCROLLABLE ACCORDION LIST */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>
          {filteredFaqs.length} Help Topics {selectedCategory !== 'All' ? `(${selectedCategory})` : ''}
        </Text>

        {filteredFaqs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Matching Questions</Text>
            <Text style={styles.emptySub}>
              Try searching with another keyword or reach out directly to customer service.
            </Text>
          </View>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <View key={faq.id} style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleAccordion(faq.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.qBadge}>
                    <Text style={styles.qBadgeText}>Q</Text>
                  </View>
                  <Text style={[styles.faqQuestion, isExpanded && styles.faqQuestionActive]}>
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={isExpanded ? '#00A3E0' : '#64748B'}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqBody}>
                    <View style={styles.answerRow}>
                      <View style={styles.aBadge}>
                        <Text style={styles.aBadgeText}>A</Text>
                      </View>
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* 5. STILL HAVE QUESTIONS BANNER */}
        <View style={styles.contactSupportCard}>
          <View style={styles.supportCardIcon}>
            <Ionicons name="headset" size={24} color="#00A3E0" />
          </View>
          <Text style={styles.supportCardTitle}>Still need assistance?</Text>
          <Text style={styles.supportCardSub}>
            Our Customer Care team is here to help you Monday to Saturday from 9:00 AM to 6:00 PM.
          </Text>

          <View style={styles.supportButtonsRow}>
            <TouchableOpacity
              style={styles.supportCallBtn}
              onPress={handleCallSupport}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" />
              <Text style={styles.supportCallBtnText}>1800-103-8855</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportTicketBtn}
              onPress={onNavigateAboutUs}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={16} color="#00A3E0" />
              <Text style={styles.supportTicketBtnText}>1:1 Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNavBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 10 : 12,
    paddingBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    fontSize: 16,
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
  categoryFilterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  categoryScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00A3E0',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#00A3E0',
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    marginLeft: 2,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqCardExpanded: {
    borderColor: '#BAE6FD',
    backgroundColor: '#FFFFFF',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  qBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qBadgeText: {
    color: '#00A3E0',
    fontSize: 13,
    fontWeight: '800',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  faqQuestionActive: {
    color: '#00A3E0',
    fontWeight: '700',
  },
  faqBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  aBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aBadgeText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  faqAnswer: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  contactSupportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  supportCardIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  supportCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  supportCardSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  supportButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  supportCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A3E0',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  supportCallBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  supportTicketBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 6,
  },
  supportTicketBtnText: {
    color: '#00A3E0',
    fontSize: 13,
    fontWeight: '700',
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
