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
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { COLORS } from '../../constants/theme';
import AtomyFooter from '../Navigation/AtomyFooter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const phoenixLogo = require('../../../assets/team_phoenix_circle_clean.png');

// 5 Official Atomy Hub Portals exactly from https://in.atomy.com/atomy/hub
const OFFICIAL_HUB_PORTALS = [
  {
    id: 'atomy-com',
    title: 'Atomy.com',
    logoSvg: 'https://image.atomy.com/IN/banner/90/562/251000000020562104816.svg',
    fallbackIcon: 'globe-outline',
    brandColor: '#0082CD',
    desc: 'A company that exceeds customer satisfaction to achieve customer success.',
    url: 'https://global.atomy.com/index.es?sid=a2',
  },
  {
    id: 'ch-atomy',
    title: 'CH.ATOMY',
    logoSvg: 'https://image.atomy.com/IN/banner/90/563/251000000020563104843.svg',
    fallbackIcon: 'videocam-outline',
    brandColor: '#0082CD',
    desc: 'Videos, products, and various news content.',
    url: 'https://ch.atomy.com/in',
  },
  {
    id: 'atomy-ticket',
    title: 'Atomy Ticket',
    logoSvg: 'https://image.atomy.com/IN/banner/90/564/251000000020564104927.svg',
    fallbackIcon: 'ticket-outline',
    brandColor: '#0082CD',
    desc: "Stay updated with Atomy's global seminars instantly and receive notifications.",
    url: 'https://ticket.atomy.com/h/main?jisa=in&ln=en',
  },
  {
    id: 'atomy-aza',
    title: 'AtomyAZA',
    logoSvg: 'https://image.atomy.com/IN/banner/90/565/251000000020565104955.svg',
    fallbackIcon: 'cart-outline',
    brandColor: '#F59E0B',
    desc: 'An online shopping mall that suggests and sells trustworthy products.',
    url: 'https://atomyaza.co.kr/',
  },
  {
    id: 'at-g-mall',
    title: 'At.G Mall',
    logoSvg: 'https://image.atomy.com/IN/banner/90/566/251000000020566105020.svg',
    fallbackIcon: 'airplane-outline',
    brandColor: '#10B981',
    desc: 'The fast way to Atomy Korea’ Products for global members.',
    url: 'https://global.atomy.kr/',
  },
];

export default function AtomyHubPage({
  onNavigateHome,
  onNavigateBack,
}) {
  const [svgErrors, setSvgErrors] = useState({});

  const handleOpenPortal = async (item) => {
    try {
      const supported = await Linking.canOpenURL(item.url);
      if (supported) {
        await Linking.openURL(item.url);
      } else {
        await Linking.openURL(item.url);
      }
    } catch (err) {
      Alert.alert('Unable to Open Link', item.url);
    }
  };

  const handleSvgError = (id) => {
    setSvgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. BREADCRUMB BAR (HOME > AtomyHub) */}
        <View style={styles.breadcrumbBar}>
          <TouchableOpacity onPress={onNavigateHome} activeOpacity={0.7}>
            <Text style={styles.breadLink}>HOME</Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
          <Text style={styles.breadCurrent}>AtomyHub</Text>
        </View>

        {/* 3. OFFICIAL disp-top_title HEADER */}
        <View style={styles.dispTopTitle}>
          <Text style={styles.dispHeading}>AtomyHub</Text>
          <Text style={styles.dispSubtitle}>Official Global Ecosystem Portals</Text>
        </View>

        {/* 4. OFFICIAL HUB-LIST CARDS (Exact match to in.atomy.com/atomy/hub) */}
        <View style={styles.hubListContainer}>
          {OFFICIAL_HUB_PORTALS.map((portal) => {
            const hasSvgError = svgErrors[portal.id];

            return (
              <View key={portal.id} style={styles.hubCard}>
                {/* DT: Logo & Title */}
                <View style={styles.hubDt}>
                  <View style={styles.logoWrap}>
                    {!hasSvgError ? (
                      <SvgUri
                        width="100%"
                        height="52"
                        uri={portal.logoSvg}
                        onError={() => handleSvgError(portal.id)}
                      />
                    ) : (
                      <View style={[styles.fallbackLogoBox, { borderColor: portal.brandColor }]}>
                        <Ionicons name={portal.fallbackIcon} size={28} color={portal.brandColor} />
                        <Text style={[styles.fallbackLogoText, { color: portal.brandColor }]}>
                          {portal.title}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.hubCardTitle}>{portal.title}</Text>
                </View>

                {/* DD.TXT: Exact Official Description */}
                <View style={styles.hubTxtBox}>
                  <Text style={styles.hubCardDesc}>{portal.desc}</Text>
                </View>

                {/* DD.BT: Shortcut Button */}
                <View style={styles.hubBtBox}>
                  <TouchableOpacity
                    style={styles.btnShortcut}
                    activeOpacity={0.8}
                    onPress={() => handleOpenPortal(portal)}
                  >
                    <Text style={styles.btnShortcutText}>Shortcut</Text>
                    <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* 5. FOOTER NOTICE */}
        <View style={styles.officialFootnote}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#0082CD" />
          <Text style={styles.officialFootnoteText}>
            All portals are operated directly by Atomy Headquarters and protected under Atomy Global Network security protocols.
          </Text>
        </View>

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
  /* Top Nav Bar */
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
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
  },
  navEmblem: {
    width: 30,
    height: 30,
    borderRadius: 15,
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

  /* Scroll Content */
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },

  /* Breadcrumb Bar */
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  breadLink: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  breadCurrent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* disp-top_title (Header) */
  dispTopTitle: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  dispHeading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  dispSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 3,
  },

  /* Hub List Cards (.hub-list) */
  hubListContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  hubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    padding: 24,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  /* Hub Card DT: Logo & Title */
  hubDt: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  logoWrap: {
    height: 54,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackLogoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  fallbackLogoText: {
    fontSize: 16,
    fontWeight: '700',
  },
  hubCardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  /* Hub Card DD.TXT: Exact Text with Top Divider */
  hubTxtBox: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 18,
    minHeight: 60,
    justifyContent: 'center',
  },
  hubCardDesc: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#4B5563',
    textAlign: 'center',
  },

  /* Hub Card DD.BT: Shortcut Button */
  hubBtBox: {
    marginTop: 18,
    alignItems: 'center',
  },
  btnShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#333333',
    borderRadius: 6,
    paddingVertical: 12,
    width: '100%',
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  btnShortcutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Official Footnote */
  officialFootnote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 20,
  },
  officialFootnoteText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#1E40AF',
  },
});
