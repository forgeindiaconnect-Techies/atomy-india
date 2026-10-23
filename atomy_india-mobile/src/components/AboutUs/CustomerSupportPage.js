import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const phoenixLogo = require('../../../assets/fic-symbol.png');

export default function CustomerSupportPage({
  onNavigateHome,
  onNavigateBack,
  onNavigateFaq,
  onNavigateFindCentre,
  onNavigateCompany,
  onNavigateNotice,
  onCartPress,
  cartCount = 0,
}) {
  const [inquiryType, setInquiryType] = useState('Product');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCall = () => {
    Linking.openURL('tel:18001038855').catch(() => {
      Alert.alert('Customer Care', 'Toll Free: 1800-103-8855 (Mon-Sat 9AM-6PM)');
    });
  };

  const handleEmail = () => {
    Linking.openURL('mailto:atomy_in@atomy.kr?subject=Customer Support Inquiry').catch(() => {
      Alert.alert('Customer Email', 'Email: atomy_in@atomy.kr');
    });
  };

  const handleSubmitInquiry = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Inquiry Incomplete', 'Please enter a subject and your message details.');
      return;
    }
    setSubmitted(true);
    Alert.alert(
      'Inquiry Submitted Successfully',
      `Your 1:1 Customer Ticket (${inquiryType}) has been logged. Our Customer Care team will respond to your registered email within 24 hours.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setSubject('');
            setMessage('');
            setSubmitted(false);
          },
        },
      ]
    );
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
              CUSTOMER SUPPORT
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
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SUPPORT CARD */}
        <View style={styles.heroSupportCard}>
          <View style={styles.headsetCircle}>
            <Ionicons name="headset" size={32} color="#00A3E0" />
          </View>
          <Text style={styles.heroSupportTitle}>Customer Happiness Center</Text>
          <Text style={styles.heroSupportDesc}>
            We are dedicated to customer success and continuous support for all Atomy consumers &amp; distributors across India.
          </Text>

          {/* Quick Call Action */}
          <TouchableOpacity
            style={styles.callActionButton}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
            <Text style={styles.callActionText}>Toll Free: 1800-103-8855</Text>
          </TouchableOpacity>
          <Text style={styles.supportHours}>Mon – Sat: 9:00 AM – 6:00 PM (Closed Sundays &amp; Public Holidays)</Text>
        </View>

        {/* QUICK SERVICE CARDS */}
        <View style={styles.servicesGrid}>
          <TouchableOpacity
            style={styles.serviceBox}
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="mail" size={20} color="#0284C7" />
            </View>
            <Text style={styles.serviceBoxTitle}>Email Support</Text>
            <Text style={styles.serviceBoxSub}>atomy_in@atomy.kr</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceBox}
            onPress={onNavigateFaq}
            activeOpacity={0.8}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="help-circle" size={20} color="#D97706" />
            </View>
            <Text style={styles.serviceBoxTitle}>FAQ Directory</Text>
            <Text style={styles.serviceBoxSub}>Instant Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceBox}
            onPress={onNavigateFindCentre}
            activeOpacity={0.8}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="location" size={20} color="#16A34A" />
            </View>
            <Text style={styles.serviceBoxTitle}>Education Centres</Text>
            <Text style={styles.serviceBoxSub}>Pan-India Network</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceBox}
            onPress={() => {
              Alert.alert(
                'Return & Refund Policy',
                'Atomy India offers a 100% 30-day money-back guarantee on unopened/defective items. Contact support to initiate a reverse pickup.'
              );
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="refresh" size={20} color="#9333EA" />
            </View>
            <Text style={styles.serviceBoxTitle}>Return Policy</Text>
            <Text style={styles.serviceBoxSub}>30-Day Guarantee</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK PORTAL LINKS */}
        <View style={styles.cstQuickLinksContainer}>
          <Text style={styles.cstQuickLinksTitle}>Official Portals &amp; Guides</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cstQuickLinksScroll}
          >
            <TouchableOpacity
              style={styles.cstLinkPill}
              onPress={onNavigateCompany}
              activeOpacity={0.8}
            >
              <Ionicons name="business-outline" size={16} color="#00A3E0" />
              <Text style={styles.cstLinkPillText}>The Company</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cstLinkPill}
              onPress={onNavigateFindCentre}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={16} color="#16A34A" />
              <Text style={styles.cstLinkPillText}>Centre Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cstLinkPill}
              onPress={onNavigateNotice}
              activeOpacity={0.8}
            >
              <Ionicons name="newspaper-outline" size={16} color="#D97706" />
              <Text style={styles.cstLinkPillText}>Notices</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cstLinkPill}
              onPress={onNavigateFaq}
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle-outline" size={16} color="#9333EA" />
              <Text style={styles.cstLinkPillText}>FAQs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cstLinkPill}
              onPress={() => {
                Alert.alert(
                  'Compensation Plan',
                  'Atomy India operates on a binary compensation model with General Commission, Mastership Bonus, and Promotion Incentives.'
                );
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="ribbon-outline" size={16} color="#0284C7" />
              <Text style={styles.cstLinkPillText}>Compensation Plan</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 1:1 INQUIRY FORM */}
        <View style={styles.inquiryCard}>
          <View style={styles.inquiryHeaderRow}>
            <Ionicons name="create-outline" size={20} color="#00A3E0" />
            <Text style={styles.inquirySectionTitle}>1:1 Customer Support Ticket</Text>
          </View>
          <Text style={styles.inquirySectionSubtitle}>
            Have a question about an order, commission, or product? Submit your query directly to our support desk.
          </Text>

          {/* Topic Selector */}
          <Text style={styles.inputLabel}>Inquiry Category</Text>
          <View style={styles.typeSelectorRow}>
            {['Product', 'Order/Delivery', 'Commission', 'General'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typePill,
                  inquiryType === type && styles.typePillActive,
                ]}
                onPress={() => setInquiryType(type)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typePillText,
                    inquiryType === type && styles.typePillTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subject */}
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Brief summary of your question"
            placeholderTextColor="#94A3B8"
            value={subject}
            onChangeText={setSubject}
          />

          {/* Message */}
          <Text style={styles.inputLabel}>Message Details</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Please describe your question or issue in detail..."
            placeholderTextColor="#94A3B8"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitInquiryBtn}
            onPress={handleSubmitInquiry}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.submitInquiryBtnText}>
              {submitted ? 'Ticket Submitted' : 'Submit 1:1 Ticket'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* REGISTERED OFFICE FOOTER */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeaderRow}>
            <Ionicons name="business-outline" size={18} color="#00A3E0" />
            <Text style={styles.addressCardTitle}>Corporate Headquarters</Text>
          </View>
          <Text style={styles.companyNameText}>Atomy Enterprise India Private Limited</Text>
          <Text style={styles.addressDetailText}>
            801, 8th Floor, Tower B, Unitech Cyber Park,{'\n'}
            Sector 39, Gurugram, Haryana – 122003, India
          </Text>
          <Text style={styles.cinText}>CIN: U51909HR2019FTC084223</Text>
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
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroSupportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headsetCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroSupportTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSupportDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  callActionButton: {
    backgroundColor: '#00A3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    width: '100%',
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  callActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  supportHours: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 10,
    textAlign: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceBox: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  serviceBoxSub: {
    fontSize: 11.5,
    color: '#64748B',
  },
  cstQuickLinksContainer: {
    marginBottom: 4,
  },
  cstQuickLinksTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 2,
  },
  cstQuickLinksScroll: {
    gap: 8,
  },
  cstLinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cstLinkPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inquiryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  inquirySectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  inquirySectionSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typePillActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00A3E0',
  },
  typePillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  typePillTextActive: {
    color: '#00A3E0',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
  },
  submitInquiryBtn: {
    backgroundColor: '#00A3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 16,
  },
  submitInquiryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  companyNameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  addressDetailText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 6,
  },
  cinText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
