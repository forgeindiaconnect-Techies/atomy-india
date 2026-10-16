import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Linking,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Polygon, Rect, Line, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../../constants/theme';
import AtomyFooter from '../Navigation/AtomyFooter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const phoenixLogo = require('../../../assets/team_phoenix_circle_clean.png');
const heroBannerImg = require('../../../assets/bn_compensation_mobile.jpg');

// Authentic Atomy Mastership Hexagon Badges matching Website
function MastershipHexBadge({ type, size = 36 }) {
  switch (type) {
    case 'sales':
      return (
        <Svg width={size} height={size * 1.12} viewBox="0 0 34 38" fill="none">
          <Path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096E6" />
          <SvgText x="17" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="21" fontWeight="700" fontFamily="sans-serif">
            $
          </SvgText>
        </Svg>
      );
    case 'diamond':
      return (
        <Svg width={size} height={size * 1.12} viewBox="0 0 34 38" fill="none">
          <Path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096E6" />
          <Path d="M17 10L24.5 16.5L17 28L9.5 16.5L17 10Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <Path d="M9.5 16.5H24.5M17 10V28M12.5 16.5L17 28M21.5 16.5L17 28" stroke="#FFFFFF" strokeWidth="1" strokeLinejoin="round" />
        </Svg>
      );
    case 'sharon':
      return (
        <Svg width={size} height={size * 1.12} viewBox="0 0 34 38" fill="none">
          <Path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096E6" />
          <Circle cx="17" cy="16.5" r="3" fill="#FFFFFF" />
          <Path d="M17 11.5C15 11.5 13.5 13 13.5 15C13.5 17.5 17 22 17 22C17 22 20.5 17.5 20.5 15C20.5 13 19 11.5 17 11.5Z" stroke="#FFFFFF" strokeWidth="1.3" fill="none" />
          <Path d="M14 20C11.5 21.5 11 24.5 11 26" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
          <Path d="M20 20C22.5 21.5 23 24.5 23 26" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={size} height={size * 1.12} viewBox="0 0 34 38" fill="none">
          <Path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096E6" />
          <Polygon points="17,9 19.5,15 26,15.5 21.2,19.5 22.8,26 17,22.5 11.2,26 12.8,19.5 8,15.5 14.5,15" fill="#FFFFFF" />
        </Svg>
      );
    case 'royal':
      return (
        <Svg width={size} height={size * 1.12} viewBox="0 0 34 38" fill="none">
          <Path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096E6" />
          <Path d="M9 25H25M9 25L11 15.5L14 19.5L17 13L20 19.5L23 15.5L25 25H9Z" stroke="#FFFFFF" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
          <Circle cx="11" cy="14" r="1.2" fill="#FFFFFF" />
          <Circle cx="17" cy="11.5" r="1.2" fill="#FFFFFF" />
          <Circle cx="23" cy="14" r="1.2" fill="#FFFFFF" />
        </Svg>
      );
    case 'crown':
      return (
        <Svg width={size} height={size * 1.12} viewBox="0 0 34 38" fill="none">
          <Path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096E6" />
          <Path d="M9 25H25L26 16.5L20.5 20L17 12L13.5 20L8 16.5L9 25Z" fill="#FFFFFF" />
          <Circle cx="8" cy="15" r="1.3" fill="#FFFFFF" />
          <Circle cx="17" cy="10.5" r="1.3" fill="#FFFFFF" />
          <Circle cx="26" cy="15" r="1.3" fill="#FFFFFF" />
        </Svg>
      );
    case 'imperial':
      return (
        <Svg width={size} height={size * 1.12} viewBox="0 0 34 38" fill="none">
          <Path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096E6" />
          <Path d="M8 25H26M10.5 25L10.5 18C10.5 15 13.5 13 17 13C20.5 13 23.5 15 23.5 18L23.5 25M17 13V8.5M14.5 10.5H19.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx="17" cy="17" r="1.6" fill="#FFFFFF" />
        </Svg>
      );
    default:
      return null;
  }
}

export default function CompensationPlanPage({
  onNavigateHome,
  onNavigateBack,
  onCartPress,
  cartCount = 0,
}) {
  const [activeTab, setActiveTab] = useState('dealership'); // 'dealership' | 'commission' | 'promotion'

  const handleDownloadPdf = () => {
    Alert.alert(
      'Atomy Compensation Plan (PDF)',
      'Download official Atomy India Compensation & Marketing Plan May 2026 brochure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download PDF',
          onPress: () => {
            Linking.openURL('https://in.atomy.com/atomy/compensation');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. CENTERED COMPENSATION PLAN TITLE & BREADCRUMB BAR */}
        <View style={styles.titleSection}>
          <Text style={styles.pageMainTitle}>Compensation Plan</Text>
          <View style={styles.breadcrumbBar}>
            <View style={styles.breadcrumbPath}>
              <TouchableOpacity onPress={onNavigateHome} activeOpacity={0.7}>
                <Text style={styles.breadLink}>About Us</Text>
              </TouchableOpacity>
              <Text style={styles.breadSep}>&gt;</Text>
              <Text style={styles.breadActive}>Compensation Plan</Text>
            </View>

            <TouchableOpacity
              style={styles.inlinePdfBtn}
              onPress={handleDownloadPdf}
              activeOpacity={0.7}
              title="Download PDF"
            >
              <Ionicons name="document-text-outline" size={14} color="#0082CD" />
              <Text style={styles.inlinePdfText}>PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. HERO BANNER (Matching bn_1280x200_0.jpg on Website) */}
        <ImageBackground
          source={heroBannerImg}
          style={styles.heroBanner}
          imageStyle={styles.heroBannerImage}
          resizeMode="cover"
        >
          <View style={styles.heroBannerContent}>
            <Text style={styles.heroBannerText}>
              The Well-Balanced, Righteous{'\n'}
              Marketing Plan shows the{'\n'}
              Company's Vision for Success{'\n'}
              of All Atomy Members.
            </Text>
          </View>
        </ImageBackground>

        {/* 4. THREE INTERACTIVE NAV TABS (Matching Website exactly) */}
        <View style={styles.tabsRow} role="tablist">
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'dealership' && styles.tabBtnActive]}
            onPress={() => setActiveTab('dealership')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'dealership' && styles.tabBtnTextActive]}>
              Dealership Class
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'commission' && styles.tabBtnActive]}
            onPress={() => setActiveTab('commission')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'commission' && styles.tabBtnTextActive]}>
              Commission
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'promotion' && styles.tabBtnActive]}
            onPress={() => setActiveTab('promotion')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'promotion' && styles.tabBtnTextActive]}>
              Promotion Criteria
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* TAB 1: DEALERSHIP CLASS (Exact Match to Web) */}
        {/* ========================================================================= */}
        {activeTab === 'dealership' && (
          <View style={styles.panelContainer}>
            <View style={styles.cstHeaderBlock}>
              <Text style={styles.cstSectionTitle}>Class Sequence and Conditions</Text>
              <Text style={styles.cstSubDesc}>Minimum PV that must be obtained for each level.</Text>
              <Text style={styles.cstNotiText}>
                * Based on personal sales and could be changed every month depends on downline sales.
              </Text>
            </View>

            {/* 5 Dealership Flow Cards matching Web */}
            <View style={styles.dealershipList}>
              {/* 1. SALES REP */}
              <View style={styles.classCard}>
                <View style={styles.classCardHeader}>
                  <Ionicons name="person-outline" size={22} color="#0082CD" />
                  <Text style={styles.classCardTitle}>SALES REP</Text>
                </View>
                <View style={styles.classCardBody}>
                  <Text style={styles.classCardDesc}>
                    Accumulated between{'\n'}
                    <Text style={styles.classCardBold}>10,000 PV ~ 2,99,999 PV</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.cardArrow}>
                <Ionicons name="arrow-down" size={16} color="#94A3B8" />
              </View>

              {/* 2. AGENT */}
              <View style={styles.classCard}>
                <View style={styles.classCardHeader}>
                  <Ionicons name="people-outline" size={22} color="#0082CD" />
                  <Text style={styles.classCardTitle}>AGENT</Text>
                </View>
                <View style={styles.classCardBody}>
                  <Text style={styles.classCardDesc}>
                    Accumulate a minimum of <Text style={styles.classCardBold}>3 Lakh PV</Text> or a Sales Rep with a smaller leg of at least <Text style={styles.classCardBold}>6 Lakh PV</Text> accumulated in the previous month
                  </Text>
                </View>
              </View>

              <View style={styles.cardArrow}>
                <Ionicons name="arrow-down" size={16} color="#94A3B8" />
              </View>

              {/* 3. SPECIAL AGENT */}
              <View style={styles.classCard}>
                <View style={styles.classCardHeader}>
                  <Ionicons name="clipboard-outline" size={22} color="#0082CD" />
                  <Text style={styles.classCardTitle}>SPECIAL AGENT</Text>
                </View>
                <View style={styles.classCardBody}>
                  <Text style={styles.classCardDesc}>
                    Accumulated a minimum of <Text style={styles.classCardBold}>7 Lakh PV</Text> or an Agent with a smaller leg of at least <Text style={styles.classCardBold}>14 Lakh PV</Text> accumulated in the previous month
                  </Text>
                </View>
              </View>

              <View style={styles.cardArrow}>
                <Ionicons name="arrow-down" size={16} color="#94A3B8" />
              </View>

              {/* 4. DEALER */}
              <View style={styles.classCard}>
                <View style={styles.classCardHeader}>
                  <Ionicons name="storefront-outline" size={22} color="#0082CD" />
                  <Text style={styles.classCardTitle}>DEALER</Text>
                </View>
                <View style={styles.classCardBody}>
                  <Text style={styles.classCardDesc}>
                    Accumulated a minimum of <Text style={styles.classCardBold}>15 Lakh PV</Text> or an Special Agent with a smaller leg of at least <Text style={styles.classCardBold}>30 Lakh PV</Text> accumulated in the previous month
                  </Text>
                </View>
              </View>

              <View style={styles.cardArrow}>
                <Ionicons name="arrow-down" size={16} color="#94A3B8" />
              </View>

              {/* 5. EXCLUSIVE DISTRIBUTOR */}
              <View style={[styles.classCard, styles.classCardED]}>
                <View style={styles.classCardHeader}>
                  <Ionicons name="business-outline" size={22} color="#0082CD" />
                  <Text style={[styles.classCardTitle, { color: '#0082CD' }]}>EXCLUSIVE DISTRIBUTOR</Text>
                </View>
                <View style={styles.classCardBody}>
                  <Text style={styles.classCardDesc}>
                    Accumulated a minimum of <Text style={styles.classCardBold}>24 Lakh PV</Text> or an Dealer with a smaller leg of at least <Text style={styles.classCardBold}>48 Lakh PV</Text> accumulated in the previous month
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COMMISSION (Standard, 5 Types, General Commission, Mastership Bonus) */}
        {/* ========================================================================= */}
        {activeTab === 'commission' && (
          <View style={styles.panelContainer}>
            {/* 1. Commission Standard */}
            <View style={styles.cstPlanPart}>
              <View style={styles.cstHeaderBlock}>
                <Text style={styles.cstSectionTitle}>Commission Standard</Text>
                <Text style={styles.cstSubDesc}>
                  Based on membership class sequence, General commission, Mastership Bonus, and Education commission, the total payment allowance of the member will be paid by settling 70% of the attainment point(PV).
                </Text>
                <Text style={styles.cstNotiText}>
                  ※ The total amount of commission to members does not exceed 35% of total sales income.
                </Text>
              </View>
            </View>

            {/* 2. Commission Types (5 Types Table) */}
            <View style={styles.cstPlanPart}>
              <View style={styles.cstHeaderBlock}>
                <Text style={styles.cstSectionTitle}>Commission Types</Text>
                <Text style={styles.cstSubDesc}>
                  Distributors will be entitled to the following Five types of benefits and incentives:
                </Text>
              </View>

              <View style={styles.tableCard}>
                <View style={styles.tableHeadRow}>
                  <Text style={[styles.tableHeadText, { flex: 1.3 }]}>Types</Text>
                  <Text style={[styles.tableHeadText, { flex: 2.7 }]}>Prerequisite</Text>
                </View>

                {[
                  {
                    type: 'Type-1, Retail Profit',
                    desc: 'Distributor can earn Upto 25% by selling products of the Company on MRP',
                  },
                  {
                    type: 'Type-2, General Commission',
                    desc: 'Upto 44% of Global PVs* will be distributed to qualified members/distributors who fulfill the requirements of General Commission as mentioned in the Compensation Plan',
                  },
                  {
                    type: 'Type-3, Mastership Bonus',
                    desc: 'This is the third type of commission, in which 20% of Global PVs* will be distributed amongst the achievers (7 levels of Mastership)',
                  },
                  {
                    type: 'Type-4, Mastership Promotion & Incentives',
                    desc: 'On achievement of Mastership Rank One Time incentives will be awarded to qualified members/distributors',
                  },
                  {
                    type: 'Type-5, Education Centre Commission',
                    desc: "In approved Education Centres, training will be provided related to Atomy's Compensation Plan, Product. 6% of Centre's total PV is paid to the applicable Centre to cover operational expenses",
                  },
                ].map((item, idx) => (
                  <View key={`ctype-${idx}`} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                    <Text style={[styles.tableCellBold, { flex: 1.3 }]}>{item.type}</Text>
                    <Text style={[styles.tableCellText, { flex: 2.7 }]}>{item.desc}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.calloutNote}>
                *Global PVs - Refers to the sum total of PVs accumulated by the Distributors associated with Atomy group companies at a global level.
              </Text>
            </View>

            {/* 3. General Commission (44%) Table */}
            <View style={styles.cstPlanPart}>
              <View style={styles.cstHeaderBlock}>
                <Text style={styles.cstSectionTitle}>General Commission (44%)</Text>
                <Text style={styles.cstSubDesc}>
                  44% of entire sales PV will be distributed between qualified members every week according to the rate. Individuals must first accumulate at least 10,000 PV in order to accumulate downline PVs.
                </Text>
              </View>

              <View style={styles.tableCard}>
                <View style={styles.tableHeadRow}>
                  <Text style={[styles.tableHeadText, { flex: 1.1 }]}>Grade</Text>
                  <Text style={[styles.tableHeadText, { flex: 1.2 }]}>Class</Text>
                  <Text style={[styles.tableHeadText, { flex: 1.4 }]}>Daily Leg PV</Text>
                  <Text style={[styles.tableHeadText, { flex: 1.1, textAlign: 'right' }]}>INR</Text>
                </View>

                {[
                  { grade: '8 / 5 pts', class: 'SALES REP', pv: '≥ 3 Lakh PV', inr: '₹1,321' },
                  { grade: '7 / 15 pts', class: 'AGENT', pv: '≥ 3 Lakh PV', inr: '₹3,964' },
                  { grade: '6 / 30 pts', class: 'SPECIAL AGENT', pv: '≥ 7 Lakh PV', inr: '₹7,929' },
                  { grade: '5 / 60 pts', class: 'DEALER', pv: '≥ 15 Lakh PV', inr: '₹15,857' },
                  { grade: '4 / 90 pts', class: 'E.D.', pv: '≥ 24 Lakh PV', inr: '₹23,786' },
                  { grade: '3 / 150 pts', class: 'E.D.', pv: '≥ 60 Lakh PV', inr: '₹39,644' },
                  { grade: '2 / 250 pts', class: 'E.D.', pv: '≥ 2 Crore PV', inr: '₹66,073' },
                  { grade: '1 / 300 pts', class: 'E.D.', pv: '≥ 5 Crore PV', inr: '₹79,287' },
                ].map((row, idx) => (
                  <View key={`gc-${idx}`} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                    <Text style={[styles.tableCellBold, { flex: 1.1 }]}>{row.grade}</Text>
                    <Text style={[styles.tableCellText, { flex: 1.2, fontWeight: '600' }]}>{row.class}</Text>
                    <Text style={[styles.tableCellText, { flex: 1.4 }]}>{row.pv}</Text>
                    <Text style={[styles.tableCellGreen, { flex: 1.1, textAlign: 'right' }]}>{row.inr}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.calloutCard}>
                <Text style={styles.calloutBullet}>• Sponsorship allowance is paid on the following Tuesday by adding up weeks after daily closing from Wednesday to next Tuesday.</Text>
                <Text style={styles.calloutBullet}>• Personal PV may be added to the smaller leg for calculating commission.</Text>
                <Text style={styles.calloutBullet}>• Left leg PV and right leg PV will be flushed to 0 when a general commission match occurs during daily settlement.</Text>
                <Text style={styles.calloutBulletBold}>** My Accumulated PV does not reset.</Text>
              </View>
            </View>

            {/* 4. Mastership Bonus (20%) Table */}
            <View style={styles.cstPlanPart}>
              <View style={styles.cstHeaderBlock}>
                <Text style={styles.cstSectionTitle}>Mastership Bonus (20%)</Text>
                <Text style={styles.cstSubDesc}>
                  20% of entire sales PV will be distributed according to each mastership.
                </Text>
              </View>

              <View style={styles.tableCard}>
                <View style={styles.tableHeadRow}>
                  <Text style={[styles.tableHeadText, { flex: 1.4 }]}>Mastership</Text>
                  <Text style={[styles.tableHeadText, { flex: 1.6 }]}>Conditions</Text>
                  <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>Bonus</Text>
                </View>

                {[
                  { type: 'sales', name: 'Sales Master', cond: 'Special Agent + 25 Lakh PV on each leg', bonus: '10%' },
                  { type: 'diamond', name: 'Diamond Master', cond: 'Dealer + 2 Sales Masters on each leg', bonus: '5%' },
                  { type: 'sharon', name: 'Sharon Rose', cond: 'Exclusive Dist. + 2 Diamond on each leg', bonus: '2%' },
                  { type: 'star', name: 'Star Master', cond: 'Exclusive Dist. + 2 Sharon Rose on each leg', bonus: '1.2%' },
                  { type: 'royal', name: 'Royal Master', cond: 'Exclusive Dist. + 2 Star Masters on each leg', bonus: '1%' },
                  { type: 'crown', name: 'Crown Master', cond: 'Exclusive Dist. + 2 Royal Masters on each leg', bonus: '0.5%' },
                  { type: 'imperial', name: 'Imperial Master', cond: 'Exclusive Dist. + 2 Crown Masters on each leg', bonus: '0.3%' },
                ].map((item, idx) => (
                  <View key={`mb-${idx}`} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                    <View style={[styles.mastershipCellRow, { flex: 1.4 }]}>
                      <MastershipHexBadge type={item.type} size={24} />
                      <Text style={styles.mastershipNameText}>{item.name}</Text>
                    </View>
                    <Text style={[styles.tableCellText, { flex: 1.6, fontSize: 11 }]}>{item.cond}</Text>
                    <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right', color: '#0082CD' }]}>
                      {item.bonus}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.calloutNote}>
                • Mastership Bonus 1st period paid on 22nd, 2nd period paid on 7th of each month.{'\n'}
                • Accumulation Periods: 1st – 15th, 16th – End of month.
              </Text>
            </View>

            {/* 5. Education Centre Commission (6%) */}
            <View style={styles.cstPlanPart}>
              <View style={styles.cstHeaderBlock}>
                <Text style={styles.cstSectionTitle}>Education Centre Commission</Text>
                <Text style={styles.cstSubDesc}>
                  6% of a centre's total PV is paid to the applicable Education centre to cover operational expenses.
                </Text>
                <Text style={styles.cstNotiText}>
                  ※ The total amount of commission to members/distributors cannot exceed 35% of total sales income. All calculations of commissions and bonus are automatically set to this limit.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROMOTION CRITERIA (Split Cards, 7 Masterships Table, Terms) */}
        {/* ========================================================================= */}
        {activeTab === 'promotion' && (
          <View style={styles.panelContainer}>
            {/* Section 1: Promotion Criteria by Mastership */}
            <View style={styles.cstPlanPart}>
              <View style={styles.cstHeaderBlock}>
                <Text style={styles.cstSectionTitle}>Promotion Criteria by Mastership</Text>
              </View>

              {/* Exact 2 Split Cards matching Website Screenshot */}
              <View style={styles.splitCardsContainer}>
                {/* Left Card: No restriction on promotion */}
                <View style={styles.splitCard}>
                  <View style={styles.splitCardLeftPane}>
                    <View style={styles.darkCircleIcon}>
                      <Ionicons name="checkbox-outline" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.splitPaneTitle}>No restriction on promotion</Text>
                  </View>
                  <View style={styles.splitCardRightPane}>
                    <Text style={styles.splitRankItem}>• Sales Master</Text>
                    <Text style={styles.splitRankItem}>• Diamond Master</Text>
                    <Text style={styles.splitRankItem}>• Sharon Rose Master</Text>
                  </View>
                </View>

                {/* Right Card: Must achieve previous Mastership 3 times */}
                <View style={styles.splitCard}>
                  <View style={styles.splitCardLeftPane}>
                    <View style={styles.darkCircleIcon}>
                      <Ionicons name="trending-up-outline" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.splitPaneTitle}>
                      Must achieve previous Mastership 3 times before being promoted onto the next Mastership level
                    </Text>
                  </View>
                  <View style={styles.splitCardRightPane}>
                    <Text style={styles.splitRankItem}>• Star Master</Text>
                    <Text style={styles.splitRankItem}>• Royal Master</Text>
                    <Text style={styles.splitRankItem}>• Crown Master</Text>
                    <Text style={styles.splitRankItem}>• Imperial Master</Text>
                  </View>
                </View>
              </View>

              {/* Exact Bullets matching Website */}
              <View style={styles.criteriaBulletsBox}>
                <Text style={styles.criteriaBulletText}>• No conditions for continuous position maintenance</Text>
                <Text style={styles.criteriaBulletText}>• Unlimited Timeline (only with valid membership status)</Text>
                <Text style={styles.criteriaBulletText}>• Promotion of two levels in one entry is not permitted beyond Diamond Master level</Text>
              </View>
            </View>

            {/* Section 2: Mastership Promotion & Incentives Table (matching Website) */}
            <View style={styles.cstPlanPart}>
              <View style={styles.cstHeaderBlock}>
                <Text style={styles.cstSectionTitle}>Mastership Promotion &amp; Incentives</Text>
              </View>

              <View style={styles.tableCard}>
                <View style={styles.tableHeadRow}>
                  <Text style={[styles.tableHeadText, { flex: 1.3 }]}>Mastership</Text>
                  <Text style={[styles.tableHeadText, { flex: 2.7 }]}>Incentives</Text>
                </View>

                {[
                  {
                    type: 'sales',
                    name: 'Sales Master',
                    incentive: '*INR 30,000 Cash',
                  },
                  {
                    type: 'diamond',
                    name: 'Diamond Master',
                    incentive: '*INR 90,000 Cash',
                  },
                  {
                    type: 'sharon',
                    name: 'Sharon Rose Master',
                    incentive: '*INR 1.2 lakh Cash,\n2 pax Tour Packages (3 Nights and 4 Days)',
                  },
                  {
                    type: 'star',
                    name: 'Star Master',
                    incentive: '*INR 6 lakh Cash,\n4 pax Tour Packages (3 Nights and 4 Days)',
                  },
                  {
                    type: 'royal',
                    name: 'Royal Master',
                    incentive: '*INR 30 lakh Cash,\n*INR 1.2 lakh per month# for sponsorship activities,\nCar rental fee#,\n4 pax Tour Packages (10 Nights and 11 Days)',
                  },
                  {
                    type: 'crown',
                    name: 'Crown Master',
                    incentive: '*INR 1.8 Crore Cash,\n*INR 3 lakh per month# for sponsorship activities,\na Luxury car#,\n4 pax Tour Packages (10 Nights and 11 Days)',
                  },
                  {
                    type: 'imperial',
                    name: 'Imperial Master',
                    incentive: '*INR 6 crore Cash,\n*INR 6 lakh per month# for sponsorship activities,\na Luxury car#,\nan Office of Approx. 1,700 sq.ft.# with a Personal Assistant#,\na Driver#,\n4 pax Tour Packages (10 Nights and 11 Days)',
                  },
                ].map((item, idx) => (
                  <View key={`promo-${idx}`} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                    <View style={[styles.mastershipCellRow, { flex: 1.3 }]}>
                      <MastershipHexBadge type={item.type} size={24} />
                      <Text style={styles.mastershipNameText}>{item.name}</Text>
                    </View>
                    <Text style={[styles.tableCellText, { flex: 2.7, lineHeight: 18, color: '#1E293B', fontWeight: '500' }]}>
                      {item.incentive}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Terms and conditions */}
            <View style={styles.cstPlanPart}>
              <View style={styles.cstHeaderBlock}>
                <Text style={styles.cstSectionTitle}>Terms and conditions</Text>
              </View>

              <View style={styles.termsBox}>
                <Text style={styles.termsBullet}>• Products are based on purchase price</Text>
                <Text style={styles.termsBullet}>• Sharon-Rose/Star Master – Travel tickets *INR 50,000 eq/person</Text>
                <Text style={styles.termsBullet}>• Royal/Crown/Imperial Master – Travel tickets *INR 2.4 lakh eq/person</Text>
                <Text style={styles.termsBullet}>• Car rental fee - *INR 60,000 eq/month#</Text>
                <Text style={styles.termsBullet}>• Crown Master luxury car# - *INR 40 lakh</Text>
                <Text style={styles.termsBullet}>• Imperial Master luxury car# - *INR 50 lakh</Text>
                <Text style={styles.termsBullet}>• Imperial Master office rent allowance - *INR 1.5 lakh eq/month#</Text>
                <Text style={styles.termsBullet}>• Imperial Master personal assistant salary - *INR 50,000 eq/month#</Text>
                <Text style={styles.termsBullet}>• Imperial Master driver salary - *INR 50,000 eq/month#</Text>
                <Text style={styles.termsBullet}>• Tax will be deducted as applicable per government regulations</Text>
              </View>
            </View>
          </View>
        )}

        {/* 5. Official Corporate & Support Footer */}
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
  /* Top Nav Bar */
  topNavBar: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
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
    gap: 10,
    flex: 1,
    marginLeft: 4,
  },
  navEmblem: {
    width: 28,
    height: 28,
  },
  navMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  navSubTitle: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#94A3B8',
  },
  navPdfBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scroll Content */
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
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
  inlinePdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0082CD',
    backgroundColor: '#F0F9FF',
  },
  inlinePdfText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0082CD',
  },

  /* Hero Banner with Chairman Park prominently framed */
  heroBanner: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    height: 170,
    minHeight: 170,
    justifyContent: 'center',
    backgroundColor: '#0F2942',
  },
  heroBannerImage: {
    borderRadius: 12,
  },
  heroBannerContent: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  heroBannerText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 21,
    letterSpacing: -0.2,
    maxWidth: '58%',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* Tabs Row matching website */
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    marginHorizontal: 12,
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#0082CD',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Panel & Section Styles */
  panelContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 16,
  },
  cstPlanPart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  cstHeaderBlock: {
    gap: 4,
  },
  cstSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cstSubDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  cstNotiText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },

  /* Dealership Sequence Cards */
  dealershipList: {
    gap: 8,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  classCardED: {
    borderColor: '#0082CD',
    backgroundColor: '#F0F9FF',
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  classCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  classCardBody: {},
  classCardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  classCardBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  cardArrow: {
    alignItems: 'center',
    paddingVertical: 2,
  },

  /* Table Cards */
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeadRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tableHeadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  tableCellBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  tableCellText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  tableCellGreen: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669',
  },

  /* Mastership Cell */
  mastershipCellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mastershipNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Callouts & Notes */
  calloutCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  calloutBullet: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
  },
  calloutBulletBold: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  calloutNote: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
  },

  /* Split Criteria Cards matching Screenshot */
  splitCardsContainer: {
    gap: 12,
    marginTop: 6,
  },
  splitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  splitCardLeftPane: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  darkCircleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitPaneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: 18,
  },
  splitCardRightPane: {
    padding: 14,
    gap: 6,
  },
  splitRankItem: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  criteriaBulletsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
    marginTop: 10,
  },
  criteriaBulletText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },

  /* Terms Box */
  termsBox: {
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  termsBullet: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
  },
});
