import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function MembershipModal({
  visible = false,
  onClose,
  isMember = false,
  onToggleMembership,
}) {
  const [authMode, setAuthMode] = useState('join'); // 'join' or 'signin'
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');

  const benefits = [
    {
      icon: 'pricetag-outline',
      title: 'Distributor Price (DP)',
      desc: 'Unlock wholesale prices up to 25% below retail MRP on all products.',
    },
    {
      icon: 'trending-up-outline',
      title: 'PV Accumulation',
      desc: 'Earn Personal Volume (PV) on every order for commission eligibility.',
    },
    {
      icon: 'shield-checkmark-outline',
      title: '100% Free Lifetime Membership',
      desc: 'Zero joining fee, zero annual maintenance fee.',
    },
    {
      icon: 'ribbon-outline',
      title: 'Official Partner Support',
      desc: 'Exclusive member access to Mongsang Talk Shows & Seminars.',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.modalTitle}>
                {isMember ? 'Atomy Member Portal' : 'Join Atomy Membership'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isMember
                  ? 'Your wholesale distributor pricing is currently ACTIVE'
                  : 'Free consumer registration for wholesale DP benefits'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentScroll}
          >
            {/* Status Card */}
            <View
              style={[
                styles.statusBanner,
                isMember ? styles.statusBannerActive : styles.statusBannerGuest,
              ]}
            >
              <Ionicons
                name={isMember ? 'checkmark-circle' : 'person-outline'}
                size={22}
                color={isMember ? '#059669' : '#D97706'}
              />
              <View style={styles.statusTextCol}>
                <Text style={styles.statusTitle}>
                  {isMember ? 'Distributor Member Active' : 'Public / Guest View'}
                </Text>
                <Text style={styles.statusDesc}>
                  {isMember
                    ? 'Displaying wholesale DP prices & accumulating PV'
                    : 'Displaying retail MRP pricing with locked DP wholesale price'}
                </Text>
              </View>
            </View>

            {/* Toggle Button to Switch Mode */}
            <TouchableOpacity
              style={[
                styles.toggleModeBtn,
                isMember ? styles.toggleModeBtnLeave : styles.toggleModeBtnJoin,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                onToggleMembership && onToggleMembership(!isMember);
                onClose();
              }}
            >
              <Ionicons
                name={isMember ? 'log-out-outline' : 'sparkles'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.toggleModeBtnText}>
                {isMember
                  ? 'Switch back to Public Guest View'
                  : 'Activate Free Member Mode (Unlock DP Prices)'}
              </Text>
            </TouchableOpacity>

            {/* Membership Benefits List */}
            <Text style={styles.benefitsHeading}>MEMBERSHIP ADVANTAGES</Text>
            <View style={styles.benefitsList}>
              {benefits.map((b, i) => (
                <View key={i} style={styles.benefitCard}>
                  <View style={styles.benefitIconCircle}>
                    <Ionicons name={b.icon} size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.benefitTextCol}>
                    <Text style={styles.benefitTitle}>{b.title}</Text>
                    <Text style={styles.benefitDesc}>{b.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  statusBannerActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBannerGuest: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  toggleModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleModeBtnJoin: {
    backgroundColor: COLORS.primary,
  },
  toggleModeBtnLeave: {
    backgroundColor: '#64748B',
  },
  toggleModeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  benefitsHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  benefitsList: {
    gap: 10,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  benefitIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  benefitDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
});
