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

      {/* 2. MAIN FOOTER CONTENT */}
      <View style={styles.mainContainer}>
        {/* RIGHT / SUPPORT BLOCK (Customer Support, Socials, Inquiry) */}
        <View style={styles.supportBlock}>
          <View style={styles.supportHeaderRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenPhone}
              style={styles.csPhoneRow}
            >
              <Text style={styles.csTitle}>Customer Support </Text>
              <Text style={styles.csPhone}>+91-124-695-9000</Text>
            </TouchableOpacity>

            {/* Colorful Social Icons matching screenshot */}
            <View style={styles.socialIconsRow}>
              {/* Facebook */}
              <TouchableOpacity
                style={[styles.socialCircle, { backgroundColor: '#1877F2' }]}
                activeOpacity={0.8}
                onPress={() => handleOpenSocial('facebook')}
                accessibilityLabel="Facebook"
              >
                <Ionicons name="logo-facebook" size={15} color="#FFFFFF" />
              </TouchableOpacity>

              {/* YouTube */}
              <TouchableOpacity
                style={[styles.socialCircle, { backgroundColor: '#FF0000' }]}
                activeOpacity={0.8}
                onPress={() => handleOpenSocial('youtube')}
                accessibilityLabel="YouTube"
              >
                <Ionicons name="logo-youtube" size={14} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Instagram */}
              <TouchableOpacity
                style={[styles.socialCircle, { backgroundColor: '#E4405F' }]}
                activeOpacity={0.8}
                onPress={() => handleOpenSocial('instagram')}
                accessibilityLabel="Instagram"
              >
                <Ionicons name="logo-instagram" size={14} color="#FFFFFF" />
              </TouchableOpacity>

              {/* LinkedIn */}
              <TouchableOpacity
                style={[styles.socialCircle, { backgroundColor: '#0A66C2' }]}
                activeOpacity={0.8}
                onPress={() => handleOpenSocial('linkedin')}
                accessibilityLabel="LinkedIn"
              >
                <Ionicons name="logo-linkedin" size={13} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Telegram */}
              <TouchableOpacity
                style={[styles.socialCircle, { backgroundColor: '#229ED9' }]}
                activeOpacity={0.8}
                onPress={() => handleOpenSocial('telegram')}
                accessibilityLabel="Telegram"
              >
                <Ionicons name="paper-plane" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.supportDetailsBox}>
            <Text style={styles.supportDetailText}>Fax Number : +91-124-647-2851</Text>
            <Text style={styles.supportDetailText}>Mon - Sat 09:00 AM ~ 17:30 PM (IST)</Text>
            <Text style={styles.supportClosedText}>(Sundays & Holidays - Closed)</Text>
            <Text style={styles.supportEmailText}>
              E-mail : <Text style={styles.boldUnderlineText}>atomy_in@atomypark.com</Text>
            </Text>
          </View>

          {/* Inquiry Button */}
          <TouchableOpacity
            style={styles.inquiryBtn}
            activeOpacity={0.7}
            onPress={handleOpenEmail}
          >
            <Ionicons name="mail-outline" size={14} color="#333333" />
            <Text style={styles.inquiryBtnText}>Inquiry</Text>
          </TouchableOpacity>
        </View>

        {/* LEFT / GRIEVANCE & CORPORATE BLOCK */}
        <View style={styles.corporateBlock}>
          <Text style={styles.grievanceText}>
            For Queries and Grievance, please contact Mr. Naveen Sourabh Pal{'\n'}
            Email ID - atomy_in@atomypark.com Mobile No.: +918700995915{'\n'}
            Nodal Officer Name - Mr. Rahul Kokadwar{'\n'}
            Telephone No.:+91-124-647-2850
          </Text>

          <Text style={styles.companyName}>Atomy Enterprise India Pvt. Ltd.</Text>

          <Text style={styles.addressText}>
            Corporate Address : 801/802, 8th Floor, Magnum Tower 2, Golf Course Extension Road, Sector - 58, Gurugram - 122011, Haryana, India{'\n'}
            Registered Address : L-19, LGF, Kalkaji, New Delhi - 110019, Delhi, India{'\n'}
            CEO : Park Han-Gill , Yoon YongSoon{'\n'}
            CIN : U74999DL2019FTC346490{'\n'}
            GSTIN : 06AARCA9734D1ZG PAN : AARCA9734D
          </Text>

          <Text style={styles.copyrightText}>
            © 2023-2026 ATOMY CO., LTD. ALL RIGHTS RESERVED
          </Text>
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
