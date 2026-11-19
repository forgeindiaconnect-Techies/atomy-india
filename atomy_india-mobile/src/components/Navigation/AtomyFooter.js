import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AGREEMENT_LINKS = [
  'Direct Seller Agreement',
  'Code of Ethics and Principles',
  'Self-declaration',
  'Policies and Procedures',
  'CSR',
  'POSH',
  'Open source License',
  'Contact Details',
  'Compliance',
  'Return/Exchange',
  'Search Direct Seller',
  'Member Check',
];

export default function AtomyFooter() {
  const handleOpenPhone = () => {
    Linking.openURL('tel:+911246959000').catch(() => {});
  };

  const handleOpenEmail = () => {
    Linking.openURL('mailto:atomy_in@atomypark.com').catch(() => {});
  };

  const handleOpenSocial = (platform) => {
    const urls = {
      facebook: 'https://www.facebook.com/atomyindiapark',
      youtube: 'https://www.youtube.com/channel/UC-rPEnjVmDAmLpUJukl6jMw',
      instagram: 'https://www.instagram.com/atomyindia_official',
      linkedin: 'https://www.linkedin.com/company/atomy-enterprise-india-pvt-ltd',
      telegram: 'https://t.me/atomy_india_official',
    };
    if (urls[platform]) {
      Linking.openURL(urls[platform]).catch(() => {});
    }
  };

  return (
    <View style={styles.footerWrapper}>
      {/* 1. TOP AGREEMENT & POLICY LINKS (Exact match to official layout) */}
      <View style={styles.agreementsBar}>
        <View style={styles.agreementsList}>
          {AGREEMENT_LINKS.map((link, idx) => (
            <React.Fragment key={idx}>
              <TouchableOpacity
                activeOpacity={0.6}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={styles.agreementLinkText}>{link}</Text>
              </TouchableOpacity>
              {idx < AGREEMENT_LINKS.length - 1 && (
                <Text style={styles.agreementDivider}>|</Text>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrapper: {
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 24,
  },
  /* 1. Agreements Header Bar */
  agreementsBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  agreementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  agreementLinkText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    fontWeight: '400',
  },
  agreementDivider: {
    fontSize: 11,
    color: '#9CA3AF',
    marginHorizontal: 3,
  },

  /* 2. Main Content Container */
  mainContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 20,
  },

  /* Support Block */
  supportBlock: {
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  supportHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  csPhoneRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  csTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  csPhone: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  socialIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportDetailsBox: {
    gap: 3,
  },
  supportDetailText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  supportClosedText: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
  },
  supportEmailText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  boldUnderlineText: {
    color: '#1F2937',
    fontWeight: '500',
  },
  inquiryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  inquiryBtnText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#374151',
  },

  /* Corporate Block */
  corporateBlock: {
    gap: 10,
  },
  grievanceText: {
    fontSize: 11.5,
    color: '#4B5563',
    lineHeight: 18,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  addressText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 17,
  },
  copyrightText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
  },
});
