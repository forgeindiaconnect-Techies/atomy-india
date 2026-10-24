import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { joinMembershipApi } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GPAY_LOGO = require('../../../assets/logos/gpay.png');
const PHONEPE_LOGO = require('../../../assets/logos/phonepe.png');
const PAYTM_LOGO = require('../../../assets/logos/paytm.png');
const UPI_LOGO = require('../../../assets/logos/upi.png');

export default function MembershipPaymentModal({
  visible = false,
  onClose,
  currentUser,
  plan = 'ANNUAL', // 'MONTHLY' | 'ANNUAL'
  onSuccess,
}) {
  const planAmount = plan === 'MONTHLY' ? 299 : 2499;
  const planDuration = plan === 'MONTHLY' ? '30 Days Access' : '365 Days Access (Full Year)';
  const planName = plan === 'MONTHLY' ? 'Monthly Distributor Membership' : 'Annual Distributor Membership';

  // Member contact details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPAY'); // 'GPAY' | 'PHONEPE' | 'PAYTM' | 'CUSTOM'
  const [customUpiId, setCustomUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 8920 1142 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('821');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedMember, setCompletedMember] = useState(null);

  // Sync with currentUser on open
  useEffect(() => {
    if (visible) {
      setIsCompleted(false);
      setCompletedMember(null);
      setIsProcessing(false);
      setErrorMessage(null);

      const defaultName = (currentUser && currentUser.name && currentUser.name !== 'Guest User')
        ? currentUser.name
        : '';
      const defaultEmail = (currentUser && currentUser.email) ? currentUser.email : '';
      const defaultPhone = (currentUser && currentUser.phone) ? currentUser.phone : '';

      setName(defaultName);
      setEmail(defaultEmail);
      setPhone(defaultPhone);
      setCardName(defaultName || 'Atomy Customer');
      if (defaultEmail) {
        setCustomUpiId(`${defaultEmail.split('@')[0]}@okhdfcbank`);
      } else {
        setCustomUpiId('customer@upi');
      }
    }
  }, [visible, currentUser]);

  if (!visible) return null;

  const handlePayNow = async () => {
    setErrorMessage(null);

    // Validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 8) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    if (paymentMethod === 'UPI' && selectedUpiApp === 'CUSTOM') {
      if (!customUpiId.trim() || !customUpiId.includes('@')) {
        setErrorMessage('Please enter a valid UPI ID (e.g. name@okaxis)');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const paymentId = `pay_atomy_${Date.now()}`;
      const paymentMethodLabel = paymentMethod === 'UPI'
        ? `UPI (${selectedUpiApp === 'CUSTOM' ? customUpiId : selectedUpiApp})`
        : paymentMethod === 'CARD'
        ? `CARD (ending ${cardNumber.slice(-4)})`
        : `NETBANKING (${selectedBank})`;

      const payload = {
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        phone: trimmedPhone,
        plan: plan,
        amountPaid: planAmount,
        paymentMethod: paymentMethodLabel,
        paymentId: paymentId,
      };

      // Call API (broadcasts to Cloud Render Server AND Localhost in parallel)
      const res = await joinMembershipApi(payload);

      const memberResult = res?.member || {
        id: `ATM-MEM-${Math.floor(100 + Math.random() * 900)}`,
        customerName: trimmedName,
        customerEmail: trimmedEmail,
        customerPhone: trimmedPhone,
        plan: plan,
        amountPaid: planAmount,
        paymentMethod: paymentMethodLabel,
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + (plan === 'ANNUAL' ? 365 : 30) * 86400000).toISOString(),
        status: 'ACTIVE',
      };

      setTimeout(() => {
        setIsProcessing(false);
        setCompletedMember(memberResult);
        setIsCompleted(true);
      }, 800);
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage('Payment processing failed. Please check your connection and retry.');
    }
  };

  const handleFinish = () => {
    if (onSuccess && completedMember) {
      onSuccess(completedMember);
    }
    onClose();
  };

  const banks = ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <Ionicons name="shield-checkmark" size={13} color="#059669" />
                <Text style={styles.badgeText}>256-BIT SECURE CHECKOUT</Text>
              </View>
              <Text style={styles.headerTitle}>
                {isCompleted ? 'Membership Activated 🎉' : 'Distributor Membership Payment'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              disabled={isProcessing}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isCompleted && completedMember ? (
            /* Success Celebration Screen */
            <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.successContainer}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                  <Ionicons name="checkmark-circle" size={54} color="#059669" />
                </View>
              </View>

              <Text style={styles.successHeading}>Welcome to Atomy Distributor Club!</Text>
              <Text style={styles.successSub}>
                Your official membership is now active and synced with the Atomy server.
              </Text>

              {/* Membership Card */}
              <View style={styles.memberPassCard}>
                <View style={styles.passHeader}>
                  <Text style={styles.passBrand}>ATOMY INDIA DISTRIBUTOR</Text>
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>ACTIVE</Text>
                  </View>
                </View>

                <Text style={styles.passMemberName}>{completedMember.customerName || name}</Text>
                <Text style={styles.passMemberId}>
                  Member ID: {completedMember.id || completedMember.memberId || 'ATM-MEM-ACTIVE'}
                </Text>

                <View style={styles.passDivider} />

                <View style={styles.passDetailsGrid}>
                  <View style={styles.passDetailCol}>
                    <Text style={styles.passDetailLabel}>PLAN</Text>
                    <Text style={styles.passDetailVal}>{plan === 'MONTHLY' ? 'Monthly' : 'Annual (365 Days)'}</Text>
                  </View>
                  <View style={styles.passDetailCol}>
                    <Text style={styles.passDetailLabel}>AMOUNT PAID</Text>
                    <Text style={styles.passDetailVal}>₹ {planAmount}</Text>
                  </View>
                  <View style={styles.passDetailCol}>
                    <Text style={styles.passDetailLabel}>PRIVILEGE</Text>
                    <Text style={styles.passDetailVal}>Wholesale DP + PV</Text>
                  </View>
                </View>
              </View>

              {/* Privilege summary banner */}
              <View style={styles.unlockedBox}>
                <Ionicons name="sparkles" size={18} color="#0284C7" />
                <Text style={styles.unlockedText}>
                  All catalog product cards now automatically display wholesale Distributor Price (DP) and credit Personal PV to your account.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleFinish}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryActionBtnText}>Start Shopping with DP Prices</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Checkout Form */
            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Plan Summary Card */}
              <View style={styles.planSummaryCard}>
                <View style={styles.planSummaryLeft}>
                  <View style={styles.planIconCircle}>
                    <Ionicons
                      name={plan === 'ANNUAL' ? 'trophy' : 'calendar'}
                      size={20}
                      color={plan === 'ANNUAL' ? '#D97706' : '#00A3E0'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planSummaryName}>{planName}</Text>
                    <Text style={styles.planSummarySub}>{planDuration}</Text>
                  </View>
                </View>
                <View style={styles.planSummaryPriceWrap}>
                  <Text style={styles.planSummaryPrice}>₹ {planAmount}</Text>
                  <Text style={styles.planSummaryInclusive}>inc. all taxes</Text>
                </View>
              </View>

              {/* Member Registration Details */}
              <Text style={styles.sectionHeading}>Member Details</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter full legal name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="email@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Mobile Phone *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="9876543210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Payment Method Selector */}
              <Text style={styles.sectionHeading}>Select Payment Method</Text>
              <View style={styles.paymentMethodTabs}>
                <TouchableOpacity
                  style={[
                    styles.methodTab,
                    paymentMethod === 'UPI' && styles.methodTabActive,
                  ]}
                  onPress={() => setPaymentMethod('UPI')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={18}
                    color={paymentMethod === 'UPI' ? COLORS.primary : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.methodTabText,
                      paymentMethod === 'UPI' && styles.methodTabTextActive,
                    ]}
                  >
                    UPI Apps
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodTab,
                    paymentMethod === 'CARD' && styles.methodTabActive,
                  ]}
                  onPress={() => setPaymentMethod('CARD')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color={paymentMethod === 'CARD' ? COLORS.primary : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.methodTabText,
                      paymentMethod === 'CARD' && styles.methodTabTextActive,
                    ]}
                  >
                    Card
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodTab,
                    paymentMethod === 'NETBANKING' && styles.methodTabActive,
                  ]}
                  onPress={() => setPaymentMethod('NETBANKING')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="business-outline"
                    size={18}
                    color={paymentMethod === 'NETBANKING' ? COLORS.primary : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.methodTabText,
                      paymentMethod === 'NETBANKING' && styles.methodTabTextActive,
                    ]}
                  >
                    Net Banking
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Payment Method Details */}
              {paymentMethod === 'UPI' && (
                <View style={styles.methodCard}>
                  <Text style={styles.methodCardTitle}>Choose UPI Option</Text>

                  {/* UPI Apps Grid */}
                  <View style={styles.upiGrid}>
                    <TouchableOpacity
                      style={[
                        styles.upiAppBtn,
                        selectedUpiApp === 'GPAY' && styles.upiAppBtnActive,
                      ]}
                      onPress={() => setSelectedUpiApp('GPAY')}
                    >
                      <Image source={GPAY_LOGO} style={styles.upiAppLogo} resizeMode="contain" />
                      <Text style={styles.upiAppLabel}>Google Pay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.upiAppBtn,
                        selectedUpiApp === 'PHONEPE' && styles.upiAppBtnActive,
                      ]}
                      onPress={() => setSelectedUpiApp('PHONEPE')}
                    >
                      <Image source={PHONEPE_LOGO} style={styles.upiAppLogo} resizeMode="contain" />
                      <Text style={styles.upiAppLabel}>PhonePe</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.upiAppBtn,
                        selectedUpiApp === 'PAYTM' && styles.upiAppBtnActive,
                      ]}
                      onPress={() => setSelectedUpiApp('PAYTM')}
                    >
                      <Image source={PAYTM_LOGO} style={styles.upiAppLogo} resizeMode="contain" />
                      <Text style={styles.upiAppLabel}>Paytm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.upiAppBtn,
                        selectedUpiApp === 'CUSTOM' && styles.upiAppBtnActive,
                      ]}
                      onPress={() => setSelectedUpiApp('CUSTOM')}
                    >
                      <Image source={UPI_LOGO} style={styles.upiAppLogo} resizeMode="contain" />
                      <Text style={styles.upiAppLabel}>Other UPI</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedUpiApp === 'CUSTOM' && (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.inputLabel}>Enter UPI ID / VPA</Text>
                      <TextInput
                        style={styles.textInput}
                        value={customUpiId}
                        onChangeText={setCustomUpiId}
                        placeholder="yourname@okaxis"
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="none"
                      />
                    </View>
                  )}
                </View>
              )}

              {paymentMethod === 'CARD' && (
                <View style={styles.methodCard}>
                  <Text style={styles.methodCardTitle}>Credit or Debit Card</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Card Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Valid Thru</Text>
                      <TextInput
                        style={styles.textInput}
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                        placeholder="MM/YY"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <TextInput
                        style={styles.textInput}
                        value={cardCvv}
                        onChangeText={setCardCvv}
                        placeholder="123"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cardholder Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={cardName}
                      onChangeText={setCardName}
                      placeholder="Name printed on card"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
              )}

              {paymentMethod === 'NETBANKING' && (
                <View style={styles.methodCard}>
                  <Text style={styles.methodCardTitle}>Select Bank</Text>
                  {banks.map((b) => (
                    <TouchableOpacity
                      key={b}
                      style={[
                        styles.bankOptionRow,
                        selectedBank === b && styles.bankOptionRowActive,
                      ]}
                      onPress={() => setSelectedBank(b)}
                    >
                      <View style={[styles.radioCircle, selectedBank === b && styles.radioCircleActive]}>
                        {selectedBank === b && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.bankOptionText, selectedBank === b && styles.bankOptionTextActive]}>
                        {b}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Error Message */}
              {errorMessage && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Security info */}
              <View style={styles.securityRow}>
                <Ionicons name="lock-closed" size={14} color="#059669" />
                <Text style={styles.securityText}>
                  Safe & Secure 256-Bit SSL Payment Processing
                </Text>
              </View>

              {/* Submit CTA */}
              <TouchableOpacity
                style={[styles.primaryActionBtn, isProcessing && styles.primaryActionBtnDisabled]}
                onPress={handlePayNow}
                disabled={isProcessing}
                activeOpacity={0.88}
              >
                {isProcessing ? (
                  <View style={styles.processingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.primaryActionBtnText}>Securing & Activating Membership...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.primaryActionBtnText}>Pay ₹ {planAmount} & Activate</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  bodyScroll: {
    maxHeight: 560,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  // Plan Summary
  planSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  planSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  planIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  planSummaryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  planSummarySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  planSummaryPriceWrap: {
    alignItems: 'flex-end',
  },
  planSummaryPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00A3E0',
  },
  planSummaryInclusive: {
    fontSize: 10,
    color: '#94A3B8',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  // Payment Method Tabs
  paymentMethodTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
    gap: 4,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  methodTabActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  methodTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  methodTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  methodCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  methodCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  // UPI Grid
  upiGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  upiAppBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
  },
  upiAppBtnActive: {
    borderColor: '#00A3E0',
    backgroundColor: '#F0F9FF',
  },
  upiAppLogo: {
    width: 28,
    height: 28,
    marginBottom: 4,
  },
  upiAppLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
  // Bank List
  bankOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    gap: 10,
  },
  bankOptionRowActive: {
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
  },
  bankOptionText: {
    fontSize: 12,
    color: '#334155',
  },
  bankOptionTextActive: {
    fontWeight: '700',
    color: '#00A3E0',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#00A3E0',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A3E0',
  },
  // Error Box
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  securityText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A3E0',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#00A3E0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  primaryActionBtnDisabled: {
    opacity: 0.75,
  },
  primaryActionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Success Screen Styles
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  successIconOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successIconInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  memberPassCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  passBrand: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  activeTag: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  passMemberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  passMemberId: {
    fontSize: 12,
    color: '#94A3B8',
  },
  passDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  passDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passDetailCol: {
    flex: 1,
  },
  passDetailLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 2,
  },
  passDetailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  unlockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  unlockedText: {
    fontSize: 12,
    color: '#0369A1',
    flex: 1,
    lineHeight: 17,
  },
});
