import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/theme';
import {
  loginCustomerApi,
  registerCustomerApi,
  googleAuthCustomerApi,
  requestForgotPasswordOtp,
  verifyPasswordOtp,
  resetCustomerPassword,
} from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Official Google G colorful logo SVG
function GoogleLogoSvg({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

export default function SignInPage({
  onAuthSuccess,
  onNavigateHome,
  onNavigateBack,
  noticeMessage = null,
  initialMode = 'signin', // 'signin' | 'signup'
}) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState('EMAIL'); // 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleSendOtp = async () => {
    setForgotError('');
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotLoading(true);
    try {
      await requestForgotPasswordOtp(forgotEmail.trim());
      setForgotStep('OTP');
    } catch (err) {
      setForgotError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setForgotError('');
    if (!forgotOtp.trim() || forgotOtp.trim().length < 6) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    setForgotLoading(true);
    try {
      await verifyPasswordOtp(forgotEmail.trim(), forgotOtp.trim());
      setForgotStep('NEW_PASSWORD');
    } catch (err) {
      setForgotError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotError('');
    if (!forgotNewPassword.trim() || forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }
    setForgotLoading(true);
    try {
      await resetCustomerPassword(forgotEmail.trim(), forgotOtp.trim(), forgotNewPassword.trim());
      setForgotStep('SUCCESS');
      setPassword(forgotNewPassword.trim());
      setIdentifier(forgotEmail.trim());
    } catch (err) {
      setForgotError(err.message || 'Failed to update password.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    setErrorMsg(null);

    if (mode === 'signin') {
      if (!identifier.trim()) {
        setErrorMsg('Please enter your Email Address or Phone Number');
        return;
      }
      if (!password.trim()) {
        setErrorMsg('Please enter your password');
        return;
      }

      setIsLoading(true);
      try {
        const res = await loginCustomerApi({
          usernameOrEmail: identifier.trim(),
          password: password.trim(),
        });

        if (res.success && res.data?.customer) {
          const cust = res.data.customer;
          const userSession = {
            name: cust.fullName || cust.name || cust.username || identifier.split('@')[0],
            email: cust.email || identifier.trim(),
            phone: cust.phone || '',
            gender: cust.gender || 'Not Specified',
            dob: cust.dob || '',
            memberId: cust.customerId || cust.memberId || '',
            address: cust.address || '',
            isMember: Boolean(cust.isMember),
            pv: Number(cust.pv || 0),
          };
          if (onAuthSuccess) {
            onAuthSuccess(userSession);
          }
        } else {
          const serverMsg = res.data?.message || res.error || 'Login failed. Please check your email and password.';
          setErrorMsg(serverMsg);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign Up validation
      if (!fullName.trim()) {
        setErrorMsg('Please enter your Full Name');
        return;
      }
      if (!regEmail.trim() || !regEmail.includes('@')) {
        setErrorMsg('Please enter a valid Email Address');
        return;
      }
      const cleanPhone = regPhone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setErrorMsg('Phone Number must be exactly 10 digits');
        return;
      }
      if (!password.trim() || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters');
        return;
      }

      setIsLoading(true);
      try {
        const payload = {
          fullName: fullName.trim(),
          name: fullName.trim(),
          email: regEmail.trim(),
          phone: cleanPhone,
          password: password.trim(),
        };

        const res = await registerCustomerApi(payload);
        if (res.success && res.data?.customer) {
          const cust = res.data.customer;
          const signupTime = cust.createdAt || new Date().toISOString();
          const userSession = {
            name: cust.fullName || cust.name || fullName.trim(),
            email: cust.email || regEmail.trim(),
            phone: cust.phone || cleanPhone,
            gender: 'Not Specified',
            dob: '',
            memberId: cust.customerId || '',
            address: cust.address || '',
            isMember: Boolean(cust.isMember),
            pv: 0,
            createdAt: signupTime,
          };

          try {
            if (typeof window !== 'undefined' && window.localStorage && cust.email) {
              window.localStorage.setItem(`atomy_user_signup_time_${cust.email.toLowerCase().trim()}`, signupTime);
            }
          } catch {}

          if (onAuthSuccess) {
            onAuthSuccess(userSession);
          }
        } else {
          const serverMsg = res.data?.message || res.error || 'Registration failed. Please try again.';
          setErrorMsg(serverMsg);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Google Fast Auth Handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const mockGoogleData = {
        name: 'Google User',
        email: 'customer.google@atomy.in',
        googleId: 'g_' + Date.now(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      };

      const res = await googleAuthCustomerApi(mockGoogleData);
      if (res.success && res.data?.customer) {
        const cust = res.data.customer;
        const userSession = {
          name: cust.fullName || cust.name || 'Google User',
          email: cust.email || mockGoogleData.email,
          phone: cust.phone || '',
          gender: cust.gender || 'Not Specified',
          dob: cust.dob || '',
          memberId: cust.customerId || '',
          address: cust.address || '',
          isMember: Boolean(cust.isMember),
          pv: Number(cust.pv || 0),
        };
        if (onAuthSuccess) {
          onAuthSuccess(userSession);
        }
      } else {
        setErrorMsg(res.data?.message || 'Google sign-in could not authenticate with backend.');
      }
    } catch (err) {
      setErrorMsg('Google sign-in encountered an issue.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    mode === 'signin'
      ? identifier.trim().length > 0 && password.trim().length > 0
      : fullName.trim().length > 0 &&
        regEmail.trim().length > 0 &&
        regPhone.replace(/\D/g, '').length === 10 &&
        password.trim().length >= 6;

  return (
    <View style={styles.pageContainer}>
      {/* Top Bar with Back Arrow */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={onNavigateBack || onNavigateHome}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>ATOMY INDIA</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          {/* Main Title & Subtitle matching website reference - Centered */}
          <View style={styles.titleWrapper}>
            <Text style={styles.mainTitle}>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</Text>
            <Text style={styles.mainSubtitle}>
              {mode === 'signin'
                ? 'Welcome back! Enter your email and password to sign in'
                : 'Create your account to enjoy member wholesale prices and points'}
            </Text>
          </View>

          {/* Dark Divider Line below subtitle */}
          <View style={styles.titleDividerLine} />

          {/* Gated Access Notice (e.g. from Cart, Favorites, Quick Order) */}
          {noticeMessage && (
            <View style={styles.gateNoticeBanner}>
              <Ionicons name="lock-closed" size={16} color="#0284C7" style={{ marginRight: 8 }} />
              <Text style={styles.gateNoticeText}>{noticeMessage}</Text>
            </View>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={17} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          )}

          {/* Form Fields */}
          {mode === 'signin' ? (
            /* ================= SIGN IN FORM ================= */
            <View style={styles.fieldsContainer}>
              {/* Input 1: Email Address or Phone Number */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address or Phone Number"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={(t) => {
                    setIdentifier(t);
                    setErrorMsg(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Input 2: Password with Show/Hide Eye */}
              <View style={styles.inputGroupWithIcon}>
                <TextInput
                  style={styles.textInputNoBorder}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrorMsg(null);
                  }}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIconBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* Primary Action Button */}
              <TouchableOpacity
                style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Remember Email & Forgot Password Row */}
              <View style={styles.rememberAndForgotRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  activeOpacity={0.8}
                  onPress={() => setRememberEmail(!rememberEmail)}
                >
                  <View style={[styles.checkboxCircle, rememberEmail && styles.checkboxCircleActive]}>
                    {rememberEmail && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberText}>Remember Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setForgotEmail(identifier.includes('@') ? identifier.trim() : '');
                    setForgotStep('EMAIL');
                    setForgotError('');
                    setIsForgotModalOpen(true);
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Mode Switcher */}
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>New customer? </Text>
                <TouchableOpacity onPress={() => setMode('signup')} activeOpacity={0.7}>
                  <Text style={styles.switchLink}>Sign Up here</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ================= SIGN UP FORM ================= */
            <View style={styles.fieldsContainer}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Full Name"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={(t) => {
                    setFullName(t);
                    setErrorMsg(null);
                  }}
                />
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address"
                  placeholderTextColor="#94A3B8"
                  value={regEmail}
                  onChangeText={(t) => {
                    setRegEmail(t);
                    setErrorMsg(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Phone Number with seamless +91 prefix badge */}
              <View style={styles.phoneInputRow}>
                <View style={styles.phonePrefixBadge}>
                  <Text style={styles.phonePrefixText}>IN +91</Text>
                </View>
                <TextInput
                  style={styles.phoneTextInput}
                  placeholder="Phone Number"
                  placeholderTextColor="#94A3B8"
                  value={regPhone}
                  onChangeText={(t) => {
                    setRegPhone(t.replace(/\D/g, '').slice(0, 10));
                    setErrorMsg(null);
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              {/* Password */}
              <View style={styles.inputGroupWithIcon}>
                <TextInput
                  style={styles.textInputNoBorder}
                  placeholder="Password (min 6 characters)"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrorMsg(null);
                  }}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIconBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* Primary Action Button */}
              <TouchableOpacity
                style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Mode Switcher */}
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => setMode('signin')} activeOpacity={0.7}>
                  <Text style={styles.switchLink}>Sign In here</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Divider: OR CONTINUE WITH */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <GoogleLogoSvg size={20} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Footer Helpful Links matching reference screenshot */}
          <View style={styles.footerLinksRow}>
            <TouchableOpacity
              onPress={() => Alert.alert('Find ID', 'Please enter your registered mobile number to retrieve your Atomy Member ID.')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLinkText}>Find ID</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>|</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Forgot Password', 'A password reset link will be sent to your registered email.')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLinkText}>Forgot Password</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>|</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Customer Help', 'Contact Atomy India Happiness Center: 1800-123-28669 (Toll Free)')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLinkText}>Customer Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Forgot Password OTP Modal */}
      <Modal
        visible={isForgotModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsForgotModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleWrap}>
                <Ionicons name="key-outline" size={20} color="#00A3E0" />
                <Text style={styles.modalHeaderTitle}>Reset Password</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsForgotModalOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {forgotError ? (
              <View style={styles.modalErrorBanner}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.modalErrorText}>{forgotError}</Text>
              </View>
            ) : null}

            {forgotStep === 'EMAIL' && (
              <View style={styles.modalStepContent}>
                <Text style={styles.modalStepDesc}>
                  Enter the email address registered with your Atomy account. We will send a secure 6-digit OTP code to verify your identity.
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter your registered email"
                  placeholderTextColor="#94A3B8"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, forgotLoading && styles.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={forgotLoading}
                  activeOpacity={0.85}
                >
                  {forgotLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {forgotStep === 'OTP' && (
              <View style={styles.modalStepContent}>
                <Text style={styles.modalStepDesc}>
                  We have sent a 6-digit verification code to <Text style={{ fontWeight: '700', color: '#0F172A' }}>{forgotEmail}</Text>. Please enter it below.
                </Text>
                <TextInput
                  style={[styles.modalInput, { textAlign: 'center', fontSize: 20, letterSpacing: 6, fontWeight: '700' }]}
                  placeholder="------"
                  placeholderTextColor="#94A3B8"
                  value={forgotOtp}
                  onChangeText={(t) => setForgotOtp(t.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, forgotLoading && styles.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={forgotLoading}
                  activeOpacity={0.85}
                >
                  {forgotLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Verify Code</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setForgotStep('EMAIL')}
                  style={{ alignSelf: 'center', marginTop: 12 }}
                >
                  <Text style={{ fontSize: 13, color: '#64748B' }}>Change Email</Text>
                </TouchableOpacity>
              </View>
            )}

            {forgotStep === 'NEW_PASSWORD' && (
              <View style={styles.modalStepContent}>
                <Text style={styles.modalStepDesc}>
                  Create a new secure password for your Atomy India account (minimum 6 characters).
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="New Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={forgotNewPassword}
                  onChangeText={setForgotNewPassword}
                />
                <TextInput
                  style={[styles.modalInput, { marginTop: 10 }]}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={forgotConfirmPassword}
                  onChangeText={setForgotConfirmPassword}
                />
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, forgotLoading && styles.btnDisabled]}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                  activeOpacity={0.85}
                >
                  {forgotLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {forgotStep === 'SUCCESS' && (
              <View style={styles.modalStepContent}>
                <View style={styles.modalSuccessIconWrap}>
                  <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
                </View>
                <Text style={styles.modalSuccessTitle}>Password Updated!</Text>
                <Text style={styles.modalStepDesc}>
                  Your password has been securely reset. You can now sign in with your updated credentials.
                </Text>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={() => setIsForgotModalOpen(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSubmitBtnText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00A3E0',
    letterSpacing: 1.5,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
    alignItems: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
    alignSelf: 'center',
  },
  mainSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 14,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: 360,
  },
  titleDividerLine: {
    height: 1.5,
    backgroundColor: '#1E293B',
    width: '100%',
    marginBottom: 20,
    alignSelf: 'center',
  },
  gateNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  gateNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '500',
  },
  fieldsContainer: {
    gap: 12,
  },
  inputGroup: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  textInput: {
    fontSize: 14.5,
    color: '#1E293B',
    height: '100%',
  },
  inputGroupWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    height: 48,
    paddingLeft: 14,
    paddingRight: 10,
  },
  textInputNoBorder: {
    flex: 1,
    fontSize: 14.5,
    color: '#1E293B',
    height: '100%',
  },
  eyeIconBtn: {
    padding: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    height: 48,
    overflow: 'hidden',
  },
  phonePrefixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  phonePrefixText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#1E293B',
    paddingHorizontal: 14,
    height: '100%',
  },
  primaryButton: {
    height: 46,
    backgroundColor: '#00A3E0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#00A3E0',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rememberAndForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    marginBottom: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPasswordLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00A3E0',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  modalErrorText: {
    fontSize: 12.5,
    color: '#DC2626',
    flex: 1,
  },
  modalStepContent: {
    width: '100%',
  },
  modalStepDesc: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 14.5,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  modalSubmitBtn: {
    height: 46,
    backgroundColor: '#00A3E0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.65,
  },
  modalSuccessIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalSuccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16A34A',
    textAlign: 'center',
    marginBottom: 8,
  },
  checkboxCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxCircleActive: {
    backgroundColor: '#00A3E0',
    borderColor: '#00A3E0',
  },
  rememberText: {
    fontSize: 13,
    color: '#475569',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  switchText: {
    fontSize: 13.5,
    color: '#475569',
  },
  switchLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
    paddingHorizontal: 12,
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#334155',
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    gap: 10,
  },
  footerLinkText: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '500',
  },
  footerDivider: {
    fontSize: 12,
    color: '#CBD5E1',
  },
});
