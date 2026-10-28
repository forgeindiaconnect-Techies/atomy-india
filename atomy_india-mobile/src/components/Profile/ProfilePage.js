import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
  Alert,
  Platform,
  Modal,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { getMembershipExpiryInfo } from '../Membership/MembershipExpiryBanner';
import { fetchCouponsFromBackend } from '../../services/couponService';
import {
  fetchNotificationsApi,
  getStoredNotifications,
  reconcileNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  addNotification,
  formatRelativeTime,
} from '../../services/notificationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getOrderTrackingStage(order) {
  const status = (((order?.status || '') + ' ' + (order?.trackStatus || ''))).toUpperCase();
  if (status.includes('DELIVERED')) return 5;
  if (status.includes('OUT') || status.includes('DELIVERY')) return 4;
  if (status.includes('DISPATCH') || status.includes('TRANSIT') || status.includes('SHIPPED')) return 3;
  if (status.includes('PACK') || status.includes('CONFIRM')) return 2;
  return 1;
}

const TRACKING_STEPS = [
  { step: 1, title: 'Order Placed & Confirmed', desc: 'Order verified & confirmed by Central Database', icon: 'receipt-outline' },
  { step: 2, title: 'Packed & Quality Checked', desc: 'Securely packed at Gurugram Fulfillment Center', icon: 'cube-outline' },
  { step: 3, title: 'In Transit / Dispatched', desc: 'Dispatched via Blue Dart Express with live AWB', icon: 'airplane-outline' },
  { step: 4, title: 'Out for Delivery', desc: 'Local delivery courier is en route to your shipping address', icon: 'bicycle-outline' },
  { step: 5, title: 'Delivered', desc: 'Package successfully delivered & handed over', icon: 'checkmark-circle-outline' },
];

function getInvoiceBreakdown(order) {
  if (!order) return { taxable: '0.00', gst: '0.00', total: '0.00' };
  const rawNum = Number(String(order.total || '').replace(/[^0-9.]/g, '')) || 0;
  const taxable = (rawNum / 1.18).toFixed(2);
  const gst = (rawNum - Number(taxable)).toFixed(2);
  const total = rawNum.toFixed(2);
  return { taxable, gst, total };
}

export default function ProfilePage({
  currentUser,
  onUpdateUser,
  isMember = false,
  membershipData = null,
  membershipExpiryInfo = null,
  favoritesCount = 0,
  cartCount = 0,
  placedOrders = [],
  onUpdateOrders,
  onNavigateHome,
  onNavigateBack,
  onNavigateCart,
  onNavigateFavorites,
  onNavigateMembership,
  onLogOut,
  onNavigateSignIn,
  onOpenAuthModal,
}) {
  const expiry = useMemo(() => {
    return membershipExpiryInfo || getMembershipExpiryInfo(membershipData || (isMember ? { expiryDate: true } : null));
  }, [membershipExpiryInfo, membershipData, isMember]);

  const isExpiringSoon = expiry?.status === 'EXPIRING_SOON';
  const isExpired = expiry?.status === 'EXPIRED';

  // Navigation between main menu and specific subpages
  // 'main' | 'edit_profile' | 'orders' | 'addresses' | 'coupons' | 'policies' | 'payment_refund' | 'settings' | 'notifications'
  const [currentSubView, setCurrentSubView] = useState('main');

  // Handle Log Out with Cross-Platform Confirmation (Web & Mobile Native)
  const handleLogout = () => {
    const doLogout = () => {
      if (onLogOut) {
        onLogOut();
      } else {
        if (onUpdateUser) {
          onUpdateUser({
            name: 'Guest User',
            email: '',
            phone: '',
            gender: '',
            dob: '',
            memberId: '',
          });
        }
        if (onNavigateHome) {
          onNavigateHome();
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out of your Atomy account?');
      if (confirmed) {
        doLogout();
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out of your Atomy account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', style: 'destructive', onPress: doLogout },
        ]
      );
    }
  };

  // Real user data (no hardcoded fake demo persona)
  const [userData, setUserData] = useState({
    name: currentUser?.name || 'Guest User',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    gender: currentUser?.gender || '',
    dob: currentUser?.dob || '',
    memberId: currentUser?.memberId || '',
  });

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({ ...userData });

  // Sync state dynamically when currentUser or isMember prop changes
  useEffect(() => {
    const updated = {
      name: currentUser?.name || 'Guest User',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      gender: currentUser?.gender || '',
      dob: currentUser?.dob || '',
      memberId: isMember ? (currentUser?.memberId || '') : '',
    };
    setUserData(updated);
    setEditForm(updated);
  }, [currentUser, isMember]);

  // Settings switches
  const [settings, setSettings] = useState({
    pushNotif: true,
    whatsappUpdates: true,
    promoOffers: false,
    biometricLogin: true,
  });

  // Orders State (No fake demo orders)
  const [orders, setOrders] = useState(placedOrders || []);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    if (placedOrders) {
      setOrders(placedOrders);
    }
  }, [placedOrders]);

  // Dynamic Accumulated PV calculation from orders & user account
  const accumulatedPV = useMemo(() => {
    let sum = Number(currentUser?.accumulatedPv || currentUser?.pv || 0);
    if (Array.isArray(orders)) {
      orders.forEach((o) => {
        if (o.totalPv || o.totalPV) {
          sum += Number(o.totalPv || o.totalPV || 0);
        } else if (typeof o.pv === 'string') {
          const num = Number(o.pv.replace(/[^0-9]/g, '')) || 0;
          sum += num;
        } else if (typeof o.pv === 'number') {
          sum += o.pv;
        } else if (Array.isArray(o.items)) {
          o.items.forEach((it) => {
            sum += (Number(it.pv) || 0) * (Number(it.qty || it.quantity) || 1);
          });
        }
      });
    }
    return sum;
  }, [orders, currentUser]);

  // Notifications State & Sync
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'orders' | 'account'

  // Dynamic reconciliation with orders and session (including membership plan expiry state)
  useEffect(() => {
    const email = currentUser?.email || 'guest';
    const initial = reconcileNotifications(email, currentUser, orders, expiry);
    setNotifications(initial);

    fetchNotificationsApi(email).then((remote) => {
      if (remote && remote.length > 0) {
        const merged = reconcileNotifications(email, currentUser, orders, expiry);
        setNotifications(merged);
      }
    });
  }, [currentUser?.email, orders, expiry]);

  // Live 30-second interval timer for real-time timestamp updates without reload
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications((prev) =>
        (prev || []).map((n) => ({
          ...n,
          time: n.createdAt ? formatRelativeTime(n.createdAt) : n.time,
        }))
      );
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = async () => {
    const email = currentUser?.email || 'guest';
    const updated = await markAllNotificationsAsRead(email);
    setNotifications(updated);
  };

  const handleMarkRead = async (id) => {
    const email = currentUser?.email || 'guest';
    const updated = await markNotificationAsRead(email, id);
    setNotifications(updated);
  };

  const handleDeleteNotif = async (id) => {
    const email = currentUser?.email || 'guest';
    const updated = await deleteNotification(email, id);
    setNotifications(updated);
  };

  const handleClearAllNotifs = async () => {
    const doClear = async () => {
      const email = currentUser?.email || 'guest';
      const updated = await clearAllNotifications(email);
      setNotifications(updated);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to clear all notifications?')) {
        doClear();
      }
    } else {
      Alert.alert('Clear All', 'Are you sure you want to clear all notifications?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: doClear },
      ]);
    }
  };

  const handleCancelOrder = (order) => {
    const s = `${order?.status || ''} ${order?.orderStatus || ''} ${order?.trackStatus || ''}`.toLowerCase();
    const isInTransit = s.includes('transit') || s.includes('shipped') || s.includes('out for delivery') || s.includes('dispatched');

    const doCancel = async () => {
      const updated = orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: 'Cancelled',
              paymentStatus: isInTransit ? 'NON_REFUNDABLE' : 'REFUNDED',
              trackStatus: isInTransit
                ? 'Order cancelled while in transit. Non-refundable (₹0 refund). Package return to warehouse initiated.'
                : 'Order cancelled by customer. Full refund initiated.',
            }
          : o
      );
      setOrders(updated);
      if (onUpdateOrders) onUpdateOrders(updated);

      const email = currentUser?.email || 'guest';
      await addNotification(email, {
        id: `notif_cancelled_${order.id}_${Date.now()}`,
        type: 'order_cancelled',
        orderId: String(order.id),
        title: `Order #${order.id} Cancelled`,
        message: isInTransit
          ? `Order #${order.id} for ${order.title} was cancelled while in transit. Notice: As package already started transit, the cancellation amount will not be refunded.`
          : `Order #${order.id} for ${order.title} has been cancelled. A full refund of ${order.total} has been initiated to your source payment method.`,
      });

      const refreshed = reconcileNotifications(email, currentUser, updated, expiry);
      setNotifications(refreshed);

      const successMsg = isInTransit
        ? `Order #${order.id} was cancelled to stop transit. Note: As the package already started transit, the amount is not refundable (₹0 refund).`
        : `Order #${order.id} was cancelled successfully. Full refund initiated.`;

      if (Platform.OS === 'web') {
        window.alert(successMsg);
      } else {
        Alert.alert('Order Cancelled', successMsg);
      }
    };

    const confirmTitle = isInTransit ? 'Cancel Order In Transit (No Refund)' : 'Cancel Order';
    const confirmMsg = isInTransit
      ? `WARNING: Order #${order.id} has already started transit! You can still cancel this order to halt delivery, but the cancellation amount will NOT be refunded (₹0 refund) as courier transit costs are committed. Do you wish to proceed?`
      : `Are you sure you want to cancel Order #${order.id}? A full refund of ${order.total} will be processed.`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        doCancel();
      }
    } else {
      Alert.alert(
        confirmTitle,
        confirmMsg,
        [
          { text: 'Keep Order', style: 'cancel' },
          { text: isInTransit ? 'Cancel Order (No Refund)' : 'Cancel Order', style: 'destructive', onPress: doCancel },
        ]
      );
    }
  };

  // Saved Addresses State with local persistence
  const [addresses, setAddresses] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('atomy_mobile_saved_addresses');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('atomy_mobile_saved_addresses', JSON.stringify(addresses));
      }
    } catch (e) {}
  }, [addresses]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddr, setNewAddr] = useState({
    type: 'Home',
    name: userData.name || '',
    phone: userData.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Geolocation & PIN Code Live Detection States (Matching Website)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState('');
  const [locationFeedback, setLocationFeedback] = useState(null);
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);

  // Trigger Live GPS Current Location Detection
  const handleDetectCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationFeedback('Geolocation is not supported on this device.');
      setTimeout(() => setLocationFeedback(null), 3500);
      return;
    }

    setIsDetectingLocation(true);
    setLocationFeedback('Detecting GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();

          const detectedPin = data.postcode || '';
          const detectedCity = data.city || data.locality || data.principalSubdivision || '';
          const detectedState = data.principalSubdivision || '';
          const detectedArea = [data.locality, data.neighbourhood].filter(Boolean).join(', ');

          setNewAddr((prev) => ({
            ...prev,
            pincode: detectedPin || prev.pincode,
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
            street: prev.street ? prev.street : (detectedArea || ''),
          }));

          setIsLocationDetected(true);
          const locName = [detectedCity, detectedState].filter(Boolean).join(', ');
          setDetectedLocationName(locName);

          if (detectedPin && detectedPin.length === 6) {
            handleLookupPincodeDetails(detectedPin);
          }

          setLocationFeedback(`✓ Location applied: ${locName || 'Current Location'}`);
          setTimeout(() => setLocationFeedback(null), 4000);
        } catch (err) {
          setLocationFeedback('Could not fetch address details for this location.');
          setTimeout(() => setLocationFeedback(null), 3500);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        setIsLocationDetected(false);
        setLocationFeedback('Location permission not granted. Enter 6-digit PIN code.');
        setTimeout(() => setLocationFeedback(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Live lookup for Indian PIN code (District, State & Post Offices / Areas)
  const handleLookupPincodeDetails = async (pin) => {
    const cleanPin = String(pin || '').replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) return;

    setIsLookingUpPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      const data = await response.json();
      if (data && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice)) {
        const postOffices = data[0].PostOffice;
        const district = postOffices[0].District;
        const st = postOffices[0].State;
        const areaNames = postOffices.map((po) => po.Name).filter(Boolean);

        setNewAddr((prev) => ({
          ...prev,
          city: district || prev.city,
          state: st || prev.state,
        }));

        setAvailableAreas(areaNames);
      } else {
        setAvailableAreas([]);
      }
    } catch (e) {
      // Graceful fallback
    } finally {
      setIsLookingUpPincode(false);
    }
  };

  const handlePincodeChange = (text) => {
    const clean = text.replace(/\D/g, '').slice(0, 6);
    setNewAddr((prev) => ({ ...prev, pincode: clean }));
    if (clean.length === 6) {
      handleLookupPincodeDetails(clean);
    } else {
      setAvailableAreas([]);
    }
  };

  const handleSelectAreaChip = (areaName) => {
    setNewAddr((prev) => {
      const current = (prev.street || '').trim();
      let updated = current;
      if (!current) {
        updated = areaName;
      } else if (!current.toLowerCase().includes(areaName.toLowerCase())) {
        updated = `${current}, ${areaName}`;
      }
      return {
        ...prev,
        street: updated,
      };
    });
  };

  // Bank account linking state for Commissions & Refunds (Starts unlinked)
  const [linkedBank, setLinkedBank] = useState(null);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolder: userData.name || '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  // Coupons & Vouchers state (synchronized with MongoDB backend)
  const [coupons, setCoupons] = useState([]);
  const [enteredCoupon, setEnteredCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState('');

  useEffect(() => {
    fetchCouponsFromBackend().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setCoupons(list);
      }
    });
  }, []);

  // Active Policy / FAQ expansion
  const [activePolicyIdx, setActivePolicyIdx] = useState(0);

  // Save edited personal details
  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
      return;
    }
    setUserData({ ...editForm });
    if (onUpdateUser) {
      onUpdateUser({ ...editForm });
    }
    Alert.alert('Success', 'Your personal details have been updated successfully!');
    setCurrentSubView('main');
  };

  // Edit existing address
  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setNewAddr({
      type: addr.type || 'Home',
      name: addr.name || '',
      phone: addr.phone || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
    });
    setIsAddingAddress(true);
  };

  // Add or update address
  const handleAddAddress = () => {
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) {
      Alert.alert('Incomplete Address', 'Please fill in street, city/district, and 6-digit pincode.');
      return;
    }

    if (editingAddressId) {
      setAddresses(
        addresses.map((a) =>
          a.id === editingAddressId ? { ...a, ...newAddr } : a
        )
      );
      setEditingAddressId(null);
      Alert.alert('Address Updated', 'Delivery address updated successfully.');
    } else {
      const created = {
        id: `addr-${Date.now()}`,
        ...newAddr,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, created]);
      Alert.alert('Address Saved', 'New delivery address added successfully.');
    }

    setIsAddingAddress(false);
    setIsLocationDetected(false);
    setAvailableAreas([]);
    setNewAddr({
      type: 'Home',
      name: userData.name || '',
      phone: userData.phone || '',
      street: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  // Save Bank Account for PV Commissions & Refunds
  const handleSaveBank = () => {
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) {
      Alert.alert('Required Fields', 'Please fill in Bank Name, Account Number, and IFSC Code.');
      return;
    }
    setLinkedBank({ ...bankForm });
    setIsEditingBank(false);
    Alert.alert('Bank Account Linked', 'Your bank account has been saved for commissions and refunds.');
  };

  // Apply Coupon
  const handleApplyCoupon = () => {
    if (!enteredCoupon.trim()) return;
    const found = coupons.find(
      (c) => c.code.toUpperCase() === enteredCoupon.trim().toUpperCase()
    );
    if (found) {
      setCouponFeedback(`Coupon "${found.code}" applied! You get ${found.discount}.`);
    } else {
      setCouponFeedback('Invalid voucher code. Please check and try again.');
    }
    setEnteredCoupon('');
  };



  // Initials calculation
  const getInitials = () => {
    if (!userData.name || userData.name === 'Customer Account' || userData.name === 'Guest User') return 'GU';
    return userData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ---------------------------------------------------------------------------
  // SUB-PAGE: EDIT PERSONAL DETAILS
  // ---------------------------------------------------------------------------
  if (currentSubView === 'edit_profile') {
    return (
      <View style={styles.root}>
        {/* Top Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setCurrentSubView('main')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Edit Personal Details
          </Text>
          <TouchableOpacity
            style={styles.headerSaveBtn}
            onPress={handleSaveProfile}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.headerSaveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.subPageScroll}
          contentContainerStyle={styles.subPageContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.editAvatarSection}>
            <View style={styles.editAvatarCircle}>
              <Text style={styles.editAvatarText}>{getInitials()}</Text>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.editAvatarHint}>Update profile details</Text>
          </View>

          {/* Form Fields Card */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Account Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(val) => setEditForm({ ...editForm, name: val })}
                placeholder="Enter Your Full Name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.email}
                onChangeText={(val) => setEditForm({ ...editForm, email: val })}
                placeholder="Enter Email Address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.phone}
                onChangeText={(val) => setEditForm({ ...editForm, phone: val })}
                placeholder="e.g. +91 98765 00000"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {['Female', 'Male', 'Prefer not to say'].map((g) => {
                  const isSelected = editForm.gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderPill, isSelected && styles.genderPillActive]}
                      onPress={() => setEditForm({ ...editForm, gender: g })}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.genderPillText,
                          isSelected && styles.genderPillTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.dob}
                onChangeText={(val) => setEditForm({ ...editForm, dob: val })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.readOnlyField}>
              <Text style={styles.inputLabel}>Membership Status</Text>
              <View style={styles.readOnlyBox}>
                <Ionicons
                  name={isMember ? 'shield-checkmark' : 'person-outline'}
                  size={16}
                  color={isMember ? '#10B981' : '#64748B'}
                />
                <Text style={styles.readOnlyText}>
                  {isMember ? 'Official Distributor Member' : 'Standard Guest Customer'}
                </Text>
                {isMember && (
                  <View style={styles.verifiedTag}>
                    <Text style={styles.verifiedTagText}>ACTIVE DP</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.saveSubmitBtn}
            onPress={handleSaveProfile}
            activeOpacity={0.88}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveSubmitBtnText}>Save Personal Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setEditForm({ ...userData });
              setCurrentSubView('main');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Discard & Go Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // SUB-PAGE: MY ORDERS
  // ---------------------------------------------------------------------------
  if (currentSubView === 'orders') {
    return (
      <View style={styles.root}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setCurrentSubView('main')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            My Orders
          </Text>
          <TouchableOpacity
            style={styles.headerCartBtn}
            onPress={onNavigateCart}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={23} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.subPageScroll}
          contentContainerStyle={styles.subPageContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.subPageHeaderInfo}>
            <Text style={styles.subPageMainTitle}>Order History ({orders.length})</Text>
            <Text style={styles.subPageMainDesc}>
              Track package dispatches, download GST invoices, and manage your orders.
            </Text>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Ionicons name="bag-handle-outline" size={54} color="#94A3B8" />
              <Text style={styles.emptyStateTitle}>No Orders Placed Yet</Text>
              <Text style={styles.emptyStateDesc}>
                When you place an order for authentic Korean health & skincare essentials, your order status, delivery tracking, and GST invoice will appear here.
              </Text>
              <TouchableOpacity
                style={styles.emptyShopBtn}
                onPress={onNavigateHome}
                activeOpacity={0.88}
              >
                <Text style={styles.emptyShopBtnText}>Explore Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ordersListContainer}>
              {orders.map((ord) => (
                <View key={ord.id} style={styles.orderCardDetailed}>
                  <View style={styles.orderCardHeader}>
                    <View>
                      <Text style={styles.orderCardId}>Order #{ord.id}</Text>
                      <Text style={styles.orderCardDate}>Placed on {ord.date}</Text>
                    </View>
                    <View style={(ord.status || '').toLowerCase().includes('cancel') ? styles.statusPillRed : styles.statusPillGreen}>
                      <Ionicons
                        name={(ord.status || '').toLowerCase().includes('cancel') ? "close-circle" : "checkmark-circle"}
                        size={13}
                        color={(ord.status || '').toLowerCase().includes('cancel') ? "#DC2626" : "#15803D"}
                      />
                      <Text style={(ord.status || '').toLowerCase().includes('cancel') ? styles.statusPillRedText : styles.statusPillGreenText}>
                        {ord.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderProductInfo}>
                    <Ionicons name="cube-outline" size={20} color="#00A3E0" />
                    <Text style={styles.orderProductsText}>{ord.title}</Text>
                  </View>

                  {ord.trackStatus && (
                    <View style={styles.orderTrackStrip}>
                      <Ionicons name="navigate-outline" size={14} color="#64748B" />
                      <Text style={styles.orderTrackStripText}>{ord.trackStatus}</Text>
                    </View>
                  )}

                  <View style={styles.orderPricingRow}>
                    <View>
                      <Text style={styles.priceRowLabel}>Total Amount</Text>
                      <Text style={styles.priceRowVal}>{ord.total}</Text>
                    </View>
                    {ord.pv && (
                      <View style={styles.pvEarnedBadge}>
                        <Ionicons name="sparkles" size={12} color="#00A3E0" />
                        <Text style={styles.pvEarnedBadgeText}>+{ord.pv}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.orderCardBtnRow}>
                    <TouchableOpacity
                      style={styles.orderTrackBtn}
                      onPress={() => setSelectedTrackOrder(ord)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="location-outline" size={15} color="#00A3E0" />
                      <Text style={styles.orderTrackBtnText}>Track Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.orderInvoiceBtn}
                      onPress={() => setSelectedInvoiceOrder(ord)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="document-text-outline" size={15} color="#334155" />
                      <Text style={styles.orderInvoiceBtnText}>Invoice</Text>
                    </TouchableOpacity>

                    {/* Eligible for cancellation if not already Delivered or Cancelled */}
                    {!((ord.status || '').toLowerCase().includes('deliver') || (ord.status || '').toLowerCase().includes('cancel')) && (
                      <TouchableOpacity
                        style={styles.orderCancelBtn}
                        onPress={() => handleCancelOrder(ord)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-circle-outline" size={15} color="#DC2626" />
                        <Text style={styles.orderCancelBtnText}>
                          {((ord.status || '').toLowerCase().includes('transit') || (ord.status || '').toLowerCase().includes('ship')) ? 'Cancel (No Refund)' : 'Cancel'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* TRACK ORDER MODAL */}
        <Modal
          visible={Boolean(selectedTrackOrder)}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedTrackOrder(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalHeaderLeft}>
                  <Ionicons name="navigate-circle" size={24} color="#00A3E0" />
                  <View>
                    <Text style={styles.modalMainTitle}>Delivery Tracking</Text>
                    <Text style={styles.modalSubtitle}>Order #{selectedTrackOrder?.id}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedTrackOrder(null)}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.trackingCourierCard}>
                  <View style={styles.courierTopLine}>
                    <Text style={styles.courierName}>{selectedTrackOrder?.courier || 'Blue Dart Express'}</Text>
                    <View style={styles.courierLivePill}>
                      <View style={styles.pulsingGreenDot} />
                      <Text style={styles.courierLiveText}>Live Dispatch</Text>
                    </View>
                  </View>
                  <View style={styles.courierDetailsGrid}>
                    <View style={styles.courierGridCol}>
                      <Text style={styles.courierGridLbl}>Tracking AWB</Text>
                      <Text style={styles.courierGridVal}>
                        {selectedTrackOrder?.awb || selectedTrackOrder?.trackingNumber || `BLUEDART-${(selectedTrackOrder?.id || '').replace(/[^0-9]/g, '')}`}
                      </Text>
                    </View>
                    <View style={styles.courierGridCol}>
                      <Text style={styles.courierGridLbl}>Expected Delivery</Text>
                      <Text style={styles.courierGridVal}>{selectedTrackOrder?.eta || 'Within 24-48 Hours'}</Text>
                    </View>
                  </View>
                  {selectedTrackOrder?.trackStatus && (
                    <Text style={styles.courierStatusNotice}>
                      • {selectedTrackOrder.trackStatus}
                    </Text>
                  )}
                </View>

                <View style={styles.stepperContainer}>
                  <Text style={styles.stepperHeaderTitle}>Live Progress Timeline</Text>
                  {(() => {
                    const currentStage = getOrderTrackingStage(selectedTrackOrder);
                    return TRACKING_STEPS.map((st, idx) => {
                      const isCompleted = st.step < currentStage;
                      const isCurrent = st.step === currentStage;
                      const isFuture = st.step > currentStage;
                      const isLast = idx === TRACKING_STEPS.length - 1;

                      return (
                        <View key={st.step} style={styles.stepperStepRow}>
                          <View style={styles.stepperLeftCol}>
                            <View
                              style={[
                                styles.stepperCircle,
                                isCompleted && styles.stepperCircleCompleted,
                                isCurrent && styles.stepperCircleCurrent,
                                isFuture && styles.stepperCircleFuture,
                              ]}
                            >
                              <Ionicons
                                name={isCompleted ? 'checkmark' : st.icon}
                                size={14}
                                color={isCompleted ? '#FFFFFF' : isCurrent ? '#00A3E0' : '#94A3B8'}
                              />
                            </View>
                            {!isLast && (
                              <View
                                style={[
                                  styles.stepperConnector,
                                  isCompleted ? styles.stepperConnectorActive : styles.stepperConnectorInactive,
                                ]}
                              />
                            )}
                          </View>

                          <View style={styles.stepperRightCol}>
                            <View style={styles.stepperTitleRow}>
                              <Text
                                style={[
                                  styles.stepperStepTitle,
                                  isCurrent && styles.stepperStepTitleCurrent,
                                  isFuture && styles.stepperStepTitleFuture,
                                ]}
                              >
                                {st.title}
                              </Text>
                              {isCurrent && (
                                <View style={styles.stepperActivePill}>
                                  <Text style={styles.stepperActivePillText}>Current Status</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.stepperStepDesc}>{st.desc}</Text>
                          </View>
                        </View>
                      );
                    });
                  })()}
                </View>

                <View style={styles.trackingAddressCard}>
                  <Ionicons name="location" size={18} color="#00A3E0" />
                  <View style={styles.trackingAddressInfo}>
                    <Text style={styles.trackingAddressTitle}>Shipping Destination</Text>
                    <Text style={styles.trackingAddressRecipient}>
                      {userData.name || 'Valued Customer'} {userData.phone ? `• ${userData.phone}` : ''}
                    </Text>
                    <Text style={styles.trackingAddressText}>
                      {selectedTrackOrder?.shippingAddress || 'Address registered on file for delivery'}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooterRow}>
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setSelectedTrackOrder(null)}
                  activeOpacity={0.88}
                >
                  <Text style={styles.modalPrimaryBtnText}>Close Tracking</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* INVOICE MODAL */}
        <Modal
          visible={Boolean(selectedInvoiceOrder)}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedInvoiceOrder(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalHeaderLeft}>
                  <Ionicons name="document-text" size={24} color="#00A3E0" />
                  <View>
                    <Text style={styles.modalMainTitle}>Official GST Tax Invoice</Text>
                    <Text style={styles.modalSubtitle}>Order #{selectedInvoiceOrder?.id}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedInvoiceOrder(null)}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.invoiceCompanyBox}>
                  <Text style={styles.invoiceCompanyName}>Atomy Enterprise India Pvt. Ltd.</Text>
                  <Text style={styles.invoiceCompanyMeta}>
                    Magnum Tower 2, Sector 58, Gurugram 122011, Haryana{'\n'}
                    GSTIN: 06AAACA0000A1Z5 | PAN: AAACA0000A{'\n'}
                    Email: atomy_in@atomypark.com | Tel: +91-124-695-9000
                  </Text>
                </View>

                <View style={styles.invoiceMetaCard}>
                  <View style={styles.invoiceMetaRow}>
                    <View style={styles.invoiceMetaCol}>
                      <Text style={styles.invoiceMetaLbl}>Invoice No.</Text>
                      <Text style={styles.invoiceMetaValBold}>
                        INV-{(selectedInvoiceOrder?.id || '').replace('ORD-', '')}
                      </Text>
                    </View>
                    <View style={styles.invoiceMetaCol}>
                      <Text style={styles.invoiceMetaLbl}>Invoice Date</Text>
                      <Text style={styles.invoiceMetaVal}>{selectedInvoiceOrder?.date || '15 Oct 2026'}</Text>
                    </View>
                  </View>

                  <View style={styles.invoiceMetaRow}>
                    <View style={styles.invoiceMetaCol}>
                      <Text style={styles.invoiceMetaLbl}>Billed To</Text>
                      <Text style={styles.invoiceMetaVal}>{userData.name || 'Customer'}</Text>
                      {userData.phone ? <Text style={styles.invoiceSubMetaVal}>{userData.phone}</Text> : null}
                    </View>
                    <View style={styles.invoiceMetaCol}>
                      <Text style={styles.invoiceMetaLbl}>Payment Mode</Text>
                      <Text style={styles.invoiceMetaVal}>Prepaid (UPI / NetBanking)</Text>
                    </View>
                  </View>

                  {selectedInvoiceOrder?.shippingAddress && (
                    <View style={styles.invoiceAddressSection}>
                      <Text style={styles.invoiceMetaLbl}>Shipping Address</Text>
                      <Text style={styles.invoiceAddressVal}>{selectedInvoiceOrder.shippingAddress}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.invoiceItemsCard}>
                  <View style={styles.invoiceItemsHeader}>
                    <Text style={[styles.invoiceItemTh, { flex: 3 }]}>Product Description</Text>
                    <Text style={[styles.invoiceItemTh, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                    <Text style={[styles.invoiceItemTh, { flex: 2, textAlign: 'right' }]}>Amount</Text>
                  </View>

                  {selectedInvoiceOrder?.items && selectedInvoiceOrder.items.length > 0 ? (
                    selectedInvoiceOrder.items.map((it, idx) => (
                      <View key={idx} style={styles.invoiceItemRow}>
                        <Text style={[styles.invoiceItemTd, { flex: 3 }]}>{it.name || it.title}</Text>
                        <Text style={[styles.invoiceItemTd, { flex: 1, textAlign: 'center' }]}>{it.qty || 1}</Text>
                        <Text style={[styles.invoiceItemTd, { flex: 2, textAlign: 'right' }]}>
                          ₹ {Number(it.price * (it.qty || 1)).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.invoiceItemRow}>
                      <Text style={[styles.invoiceItemTd, { flex: 3 }]}>
                        {selectedInvoiceOrder?.title || 'Atomy Official Health & Skincare Product'}
                      </Text>
                      <Text style={[styles.invoiceItemTd, { flex: 1, textAlign: 'center' }]}>1</Text>
                      <Text style={[styles.invoiceItemTd, { flex: 2, textAlign: 'right' }]}>
                        {selectedInvoiceOrder?.total || '₹ 0'}
                      </Text>
                    </View>
                  )}
                </View>

                {(() => {
                  const bd = getInvoiceBreakdown(selectedInvoiceOrder);
                  return (
                    <View style={styles.invoiceSummaryCard}>
                      <View style={styles.invoiceSummaryRow}>
                        <Text style={styles.invoiceSummaryLbl}>Taxable Amount</Text>
                        <Text style={styles.invoiceSummaryVal}>₹ {bd.taxable}</Text>
                      </View>
                      <View style={styles.invoiceSummaryRow}>
                        <Text style={styles.invoiceSummaryLbl}>Integrated GST (IGST 18%)</Text>
                        <Text style={styles.invoiceSummaryVal}>₹ {bd.gst}</Text>
                      </View>
                      <View style={styles.invoiceSummaryRow}>
                        <Text style={styles.invoiceSummaryLbl}>Shipping / Delivery</Text>
                        <Text style={[styles.invoiceSummaryVal, { color: '#16A34A' }]}>FREE</Text>
                      </View>
                      <View style={styles.invoiceDivider} />
                      <View style={styles.invoiceSummaryRow}>
                        <Text style={styles.invoiceGrandTotalLbl}>Total Paid (INR)</Text>
                        <Text style={styles.invoiceGrandTotalVal}>{selectedInvoiceOrder?.total || ('₹ ' + bd.total)}</Text>
                      </View>
                      {selectedInvoiceOrder?.pv && (
                        <View style={styles.invoicePvRow}>
                          <Ionicons name="sparkles" size={13} color="#00A3E0" />
                          <Text style={styles.invoicePvText}>PV Credited to Member: +{selectedInvoiceOrder.pv}</Text>
                        </View>
                      )}
                    </View>
                  );
                })()}

                <View style={styles.invoiceStampCard}>
                  <Ionicons name="shield-checkmark" size={18} color="#15803D" />
                  <Text style={styles.invoiceStampText}>
                    This is an authentic computer-generated GST tax invoice issued by Atomy Enterprise India Pvt. Ltd. No physical signature is required.
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooterRow}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={async () => {
                    try {
                      await Share.share({
                        title: `Invoice #${selectedInvoiceOrder?.id}`,
                        message: `Atomy India Tax Invoice for Order #${selectedInvoiceOrder?.id}\nTotal: ${selectedInvoiceOrder?.total}\nDate: ${selectedInvoiceOrder?.date}\nCustomer: ${userData.name}\nGSTIN: 06AAACA0000A1Z5\nThank you for shopping with Atomy India!`,
                      });
                    } catch (e) {}
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-outline" size={16} color="#00A3E0" />
                  <Text style={styles.modalSecondaryBtnText}>Share / Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setSelectedInvoiceOrder(null)}
                  activeOpacity={0.88}
                >
                  <Text style={styles.modalPrimaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // SUB-PAGE: SAVED ADDRESSES
  // ---------------------------------------------------------------------------
  if (currentSubView === 'addresses') {
    return (
      <View style={styles.root}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setCurrentSubView('main')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Delivery Addresses
          </Text>
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => {
              if (isAddingAddress) setEditingAddressId(null);
              setIsAddingAddress(!isAddingAddress);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isAddingAddress ? 'close' : 'add'}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.subPageScroll}
          contentContainerStyle={styles.subPageContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Add / Edit Address Form Toggle */}
          {isAddingAddress ? (
            <View style={styles.addAddressFormCard}>
              <Text style={styles.formSectionTitle}>
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </Text>

              {/* Use Current Location Action Button & Status (Matching Website) */}
              <TouchableOpacity
                style={[
                  styles.gpsLocationBtn,
                  isLocationDetected && styles.gpsLocationBtnSuccess,
                ]}
                onPress={handleDetectCurrentLocation}
                disabled={isDetectingLocation}
                activeOpacity={0.8}
              >
                {isDetectingLocation ? (
                  <>
                    <ActivityIndicator size="small" color="#00A3E0" />
                    <Text style={styles.gpsLocationBtnText}>Detecting GPS Live Location...</Text>
                  </>
                ) : isLocationDetected ? (
                  <>
                    <Ionicons name="checkmark-circle" size={17} color="#16A34A" />
                    <Text style={styles.gpsLocationBtnTextSuccess}>
                      Location Applied {detectedLocationName ? `(${detectedLocationName})` : ''}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="navigate" size={16} color="#00A3E0" />
                    <Text style={styles.gpsLocationBtnText}>Use Current Location</Text>
                  </>
                )}
              </TouchableOpacity>

              {locationFeedback && !isLocationDetected ? (
                <View style={styles.locationFeedbackBox}>
                  <Ionicons name="information-circle-outline" size={14} color="#0284C7" />
                  <Text style={styles.locationFeedbackText}>{locationFeedback}</Text>
                </View>
              ) : null}

              {/* Address Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address Type</Text>
                <View style={styles.genderRow}>
                  {['Home', 'Office', 'Other'].map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.genderPill,
                        newAddr.type === t && styles.genderPillActive,
                      ]}
                      onPress={() => setNewAddr({ ...newAddr, type: t })}
                    >
                      <Text
                        style={[
                          styles.genderPillText,
                          newAddr.type === t && styles.genderPillTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* PIN Code, City/District & State with Live Detection */}
              <View style={styles.twoColRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.labelWithSpinner}>
                    <Text style={styles.inputLabel}>Pincode *</Text>
                    {isLookingUpPincode && (
                      <View style={styles.inlineLookupIndicator}>
                        <ActivityIndicator size="small" color="#00A3E0" />
                        <Text style={styles.lookupText}>Finding...</Text>
                      </View>
                    )}
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={newAddr.pincode}
                    onChangeText={handlePincodeChange}
                    placeholder="6-digit pincode"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>City / District *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newAddr.city}
                    onChangeText={(val) => setNewAddr({ ...newAddr, city: val })}
                    placeholder="District / City"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddr.state}
                  onChangeText={(val) => setNewAddr({ ...newAddr, state: val })}
                  placeholder="State"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Specific Areas Auto-Detected for this PIN (Matching Website) */}
              {availableAreas.length > 0 ? (
                <View style={styles.detectedAreasContainer}>
                  <View style={styles.detectedAreasHeader}>
                    <Ionicons name="location" size={13} color="#00A3E0" />
                    <Text style={styles.detectedAreasTitle}>
                      Areas / Post Offices in PIN {newAddr.pincode} (Tap to add):
                    </Text>
                  </View>
                  <View style={styles.areaChipsWrap}>
                    {availableAreas.slice(0, 10).map((area) => {
                      const isSelected = (newAddr.street || '').toLowerCase().includes(area.toLowerCase());
                      return (
                        <TouchableOpacity
                          key={area}
                          style={[
                            styles.areaChipBtn,
                            isSelected && styles.areaChipBtnActive,
                          ]}
                          onPress={() => handleSelectAreaChip(area)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="location-outline"
                            size={11}
                            color={isSelected ? '#0284C7' : '#64748B'}
                          />
                          <Text
                            style={[
                              styles.areaChipText,
                              isSelected && styles.areaChipTextActive,
                            ]}
                          >
                            {area}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {/* Street Address & Landmark */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>House No, Flat, Street Address *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAddr.street}
                  onChangeText={(val) => setNewAddr({ ...newAddr, street: val })}
                  placeholder="House / Flat No., Building, Area name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Recipient Details */}
              <View style={styles.twoColRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Contact Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newAddr.name}
                    onChangeText={(val) => setNewAddr({ ...newAddr, name: val })}
                    placeholder="Recipient Name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newAddr.phone}
                    onChangeText={(val) => setNewAddr({ ...newAddr, phone: val.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit phone"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveSubmitBtn}
                onPress={handleAddAddress}
                activeOpacity={0.88}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.saveSubmitBtnText}>
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.subPageHeaderInfo}>
            <Text style={styles.subPageMainTitle}>Saved Addresses ({addresses.length})</Text>
            <Text style={styles.subPageMainDesc}>
              Products will be safely dispatched to your saved delivery addresses.
            </Text>
          </View>

          {addresses.length === 0 && !isAddingAddress ? (
            <View style={styles.emptyStateBox}>
              <Ionicons name="location-outline" size={54} color="#94A3B8" />
              <Text style={styles.emptyStateTitle}>No Saved Delivery Addresses</Text>
              <Text style={styles.emptyStateDesc}>
                Add your home or office delivery address for fast, one-tap checkout on all orders.
              </Text>
              <TouchableOpacity
                style={styles.emptyShopBtn}
                onPress={() => setIsAddingAddress(true)}
                activeOpacity={0.88}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.emptyShopBtnText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressesListContainer}>
              {addresses.map((addr) => (
                <View key={addr.id} style={styles.addressCardDetailed}>
                  <View style={styles.addressCardTopRow}>
                    <View style={styles.addressTypeBadge}>
                      <Ionicons
                        name={addr.type === 'Home' ? 'home-outline' : 'business-outline'}
                        size={14}
                        color="#00A3E0"
                      />
                      <Text style={styles.addressTypeBadgeText}>{addr.type}</Text>
                    </View>

                    {addr.isDefault && (
                      <View style={styles.defaultBadgePill}>
                        <Text style={styles.defaultBadgePillText}>DEFAULT ADDRESS</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.addressNameText}>{addr.name}</Text>
                  <Text style={styles.addressBodyText}>
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </Text>
                  {addr.phone ? (
                    <Text style={styles.addressPhoneText}>Mobile: {addr.phone}</Text>
                  ) : null}

                  <View style={styles.addressActionRow}>
                    {!addr.isDefault && (
                      <TouchableOpacity
                        style={styles.setAsDefaultBtn}
                        onPress={() => {
                          setAddresses(
                            addresses.map((a) => ({
                              ...a,
                              isDefault: a.id === addr.id,
                            }))
                          );
                          Alert.alert('Updated', 'Set as your primary delivery address.');
                        }}
                      >
                        <Text style={styles.setAsDefaultBtnText}>Set as Default</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.editAddressBtn}
                      onPress={() => handleEditAddress(addr)}
                    >
                      <Ionicons name="pencil-outline" size={15} color="#00A3E0" />
                      <Text style={styles.editAddressBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteAddressBtn}
                      onPress={() => {
                        setAddresses(addresses.filter((a) => a.id !== addr.id));
                      }}
                    >
                      <Ionicons name="trash-outline" size={15} color="#EF4444" />
                      <Text style={styles.deleteAddressBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // SUB-PAGE: COUPONS & VOUCHERS
  // ---------------------------------------------------------------------------
  if (currentSubView === 'coupons') {
    return (
      <View style={styles.root}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setCurrentSubView('main')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Coupons & Vouchers
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.subPageScroll}
          contentContainerStyle={styles.subPageContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Coupon Input Strip */}
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoTextInput}
              placeholder="Enter Promo Code (e.g. WELCOME10)"
              placeholderTextColor="#94A3B8"
              value={enteredCoupon}
              onChangeText={setEnteredCoupon}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.promoApplyBtn}
              onPress={handleApplyCoupon}
              activeOpacity={0.88}
            >
              <Text style={styles.promoApplyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {couponFeedback ? (
            <View style={styles.couponFeedbackBox}>
              <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              <Text style={styles.couponFeedbackText}>{couponFeedback}</Text>
            </View>
          ) : null}

          <View style={styles.subPageHeaderInfo}>
            <Text style={styles.subPageMainTitle}>Available Coupons ({coupons.length})</Text>
            <Text style={styles.subPageMainDesc}>
              Tap "Copy" on any coupon code to apply during order checkout.
            </Text>
          </View>

          <View style={styles.couponsListContainer}>
            {coupons.map((cpn, cIdx) => (
              <View key={`cpn-${cIdx}`} style={styles.couponCardDetailed}>
                <View style={styles.couponCardHeader}>
                  <View style={styles.couponBadgeGold}>
                    <Text style={styles.couponBadgeGoldText}>{cpn.discount}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyCouponBtn}
                    onPress={() => {
                      setEnteredCoupon(cpn.code);
                      Alert.alert('Code Copied', `Code ${cpn.code} ready to apply!`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="copy-outline" size={14} color="#00A3E0" />
                    <Text style={styles.copyCouponBtnText}>Copy</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.couponCodeText}>{cpn.code}</Text>
                <Text style={styles.couponTitleText}>{cpn.title}</Text>
                <Text style={styles.couponDescText}>{cpn.desc}</Text>

                <View style={styles.couponFooterRow}>
                  <Text style={styles.couponExpiryText}>Valid till {cpn.validTill}</Text>
                  <Text style={styles.couponMinText}>Min spend: {cpn.minSpend}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // SUB-PAGE: POLICIES AND LEGAL
  // ---------------------------------------------------------------------------
  if (currentSubView === 'policies') {
    const POLICIES = [
      {
        id: 'tos',
        title: 'Terms of Service & Distributor Agreement',
        icon: 'document-text-outline',
        content:
          'By accessing Atomy India online services, members agree to adhere to the Absolute Quality Absolute Price purchasing principles and ethical direct-selling protocols laid out by Atomy India Enterprises Private Limited.',
      },
      {
        id: 'direct_selling',
        title: 'Direct Selling Rules (Consumer Protection 2021)',
        icon: 'shield-checkmark-outline',
        content:
          'Atomy India fully complies with the Consumer Protection (Direct Selling) Rules, 2021 notified by the Ministry of Consumer Affairs, Government of India. There are NO mandatory sign-up fees or forced inventory loads.',
      },
      {
        id: 'privacy',
        title: 'Privacy Policy & Data Security',
        icon: 'lock-closed-outline',
        content:
          'Your personal identifiers, PAN, GSTIN, bank details, and order transactions are encrypted using 256-bit SSL protocols. Atomy never sells or shares customer personal records with third-party advertisers.',
      },
      {
        id: 'shipping_delivery',
        title: 'Nationwide Delivery Policy & SLA',
        icon: 'cube-outline',
        content:
          'Orders across all Indian states and pin codes are fulfilled through nearby regional hubs within 2 business days. Remote mountain and forest areas with restricted transport facilities are delivered within 3 business days via Blue Dart Express. Free doorstep delivery applies to orders above ₹4,500.',
      },
      {
        id: 'grievance',
        title: 'Grievance Redressal Mechanism',
        icon: 'person-circle-outline',
        content:
          'Grievance Officer: Mr. Rahul Verma\nEmail: grievance@atomy.in\nPhone: 1800-103-7203\nAddress: Atomy India Enterprises, Gurugram, Haryana.\nTurnaround Time: Acknowledgement within 48 hours; resolution within 30 days.',
      },
    ];

    return (
      <View style={styles.root}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setCurrentSubView('main')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Policies & Legal
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.subPageScroll}
          contentContainerStyle={styles.subPageContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.subPageHeaderInfo}>
            <Text style={styles.subPageMainTitle}>Legal & Statutory Disclosures</Text>
            <Text style={styles.subPageMainDesc}>
              Official legal policies, distributor terms, and Government of India regulatory compliances.
            </Text>
          </View>

          <View style={styles.policiesListContainer}>
            {POLICIES.map((p, idx) => {
              const isOpen = activePolicyIdx === idx;
              return (
                <View key={p.id} style={styles.policyCard}>
                  <TouchableOpacity
                    style={styles.policyCardHeader}
                    onPress={() => setActivePolicyIdx(isOpen ? -1 : idx)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.policyTitleRow}>
                      <Ionicons name={p.icon} size={20} color="#00A3E0" />
                      <Text style={styles.policyTitleText}>{p.title}</Text>
                    </View>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                  {isOpen && <Text style={styles.policyContentText}>{p.content}</Text>}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // SUB-PAGE: PAYMENT AND REFUND
  // ---------------------------------------------------------------------------
  if (currentSubView === 'payment_refund') {
    return (
      <View style={styles.root}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setCurrentSubView('main')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Payment & Refund
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.subPageScroll}
          contentContainerStyle={styles.subPageContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 100% Satisfaction Guarantee Card */}
          <View style={styles.guaranteeCard}>
            <View style={styles.guaranteeIconWrap}>
              <Ionicons name="shield-checkmark" size={32} color="#15803D" />
            </View>
            <Text style={styles.guaranteeTitle}>30-Day 100% Satisfaction Guarantee</Text>
            <Text style={styles.guaranteeDesc}>
              Atomy stands behind the Absolute Quality of our products. If you are not completely satisfied, return eligible items within 30 days for a full refund.
            </Text>
          </View>

          {/* Refund Timeline Card */}
          <View style={styles.infoSectionCard}>
            <Text style={styles.infoSectionCardTitle}>Refund Modes & Timelines</Text>

            <View style={styles.timelineRow}>
              <Ionicons name="flash-outline" size={20} color="#00A3E0" />
              <View style={styles.timelineDetails}>
                <Text style={styles.timelineHeading}>UPI & Instant Net Banking</Text>
                <Text style={styles.timelineBody}>Credited within 24 hours of return approval.</Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <Ionicons name="card-outline" size={20} color="#00A3E0" />
              <View style={styles.timelineDetails}>
                <Text style={styles.timelineHeading}>Credit / Debit Cards</Text>
                <Text style={styles.timelineBody}>
                  Credited in 3 to 5 business days per your issuing bank.
                </Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <Ionicons name="business-outline" size={20} color="#00A3E0" />
              <View style={styles.timelineDetails}>
                <Text style={styles.timelineHeading}>NEFT / RTGS Bank Transfer</Text>
                <Text style={styles.timelineBody}>
                  Processed directly to your registered bank account for refunds and PV bonuses.
                </Text>
              </View>
            </View>
          </View>

          {/* Cancellation & Zero-Cost Replacement Card */}
          <View style={styles.infoSectionCard}>
            <Text style={styles.infoSectionCardTitle}>Cancellation & Replacement Rules</Text>

            <View style={styles.timelineRow}>
              <Ionicons name="close-circle-outline" size={20} color="#E11D48" />
              <View style={styles.timelineDetails}>
                <Text style={styles.timelineHeading}>Transit Cancellation Policy</Text>
                <Text style={styles.timelineBody}>
                  Orders can be cancelled at any point prior to delivery. Pre-dispatch cancellations receive a 100% full refund. Once the package has started transit or is shipped, cancellation is permitted to halt delivery, but the amount will NOT be refunded (₹0 refund) as transit logistics costs are incurred.
                </Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <Ionicons name="refresh-circle-outline" size={20} color="#16A34A" />
              <View style={styles.timelineDetails}>
                <Text style={styles.timelineHeading}>Zero-Cost Replacement (Transit Damage Only)</Text>
                <Text style={styles.timelineBody}>
                  Items damaged in transit before delivery or wrong SKU receive free 1-to-1 replacement. Customer breakage after delivery is strictly void.
                </Text>
              </View>
            </View>
          </View>

          {/* Linked Bank Account for PV Commissions & Refunds */}
          <View style={styles.infoSectionCard}>
            <View style={styles.cardHeaderWithAction}>
              <Text style={styles.infoSectionCardTitle}>Linked Bank Account</Text>
              <TouchableOpacity
                onPress={() => setIsEditingBank(!isEditingBank)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.editBankActionText}>
                  {linkedBank ? (isEditingBank ? 'Close' : 'Update') : isEditingBank ? 'Close' : '+ Link Bank'}
                </Text>
              </TouchableOpacity>
            </View>

            {isEditingBank ? (
              <View style={styles.bankFormBox}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Account Holder Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={bankForm.accountHolder}
                    onChangeText={(val) => setBankForm({ ...bankForm, accountHolder: val })}
                    placeholder="Enter Beneficiary Name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bank Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={bankForm.bankName}
                    onChangeText={(val) => setBankForm({ ...bankForm, bankName: val })}
                    placeholder="e.g. State Bank of India, HDFC, ICICI"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Account Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={bankForm.accountNumber}
                    onChangeText={(val) => setBankForm({ ...bankForm, accountNumber: val })}
                    placeholder="Enter Account Number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>IFSC Code</Text>
                  <TextInput
                    style={styles.textInput}
                    value={bankForm.ifscCode}
                    onChangeText={(val) => setBankForm({ ...bankForm, ifscCode: val })}
                    placeholder="e.g. SBIN0001234"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                  />
                </View>
                <TouchableOpacity
                  style={styles.saveSubmitBtn}
                  onPress={handleSaveBank}
                  activeOpacity={0.88}
                >
                  <Text style={styles.saveSubmitBtnText}>Save Bank Account</Text>
                </TouchableOpacity>
              </View>
            ) : linkedBank ? (
              <View style={styles.bankAccountRow}>
                <Ionicons name="wallet-outline" size={24} color="#00A3E0" />
                <View style={styles.bankAccountCol}>
                  <Text style={styles.bankName}>{linkedBank.bankName}</Text>
                  <Text style={styles.bankNumber}>
                    Account: •••••••• {linkedBank.accountNumber.slice(-4)}
                  </Text>
                  <Text style={styles.bankHolder}>Beneficiary: {linkedBank.accountHolder}</Text>
                </View>
                <View style={styles.verifiedTag}>
                  <Text style={styles.verifiedTagText}>SAVED</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyBankState}>
                <Ionicons name="card-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyBankText}>No bank account linked yet.</Text>
                <Text style={styles.emptyBankSub}>
                  Link your bank account to receive eligible refund credits and distributor PV commissions.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // SUB-PAGE: SETTINGS
  // ---------------------------------------------------------------------------
  if (currentSubView === 'settings') {
    return (
      <View style={styles.root}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setCurrentSubView('main')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Settings
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.subPageScroll}
          contentContainerStyle={styles.subPageContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoSectionCard}>
            <Text style={styles.infoSectionCardTitle}>Notifications & Alerts</Text>

            <View style={styles.settingToggleRow}>
              <View style={styles.settingToggleTextCol}>
                <Text style={styles.settingToggleTitle}>Push Notifications</Text>
                <Text style={styles.settingToggleDesc}>Instant updates for order tracking & dispatch</Text>
              </View>
              <Switch
                value={settings.pushNotif}
                onValueChange={(val) => setSettings({ ...settings, pushNotif: val })}
                trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
                thumbColor={settings.pushNotif ? '#00A3E0' : '#F1F5F9'}
              />
            </View>

            <View style={styles.settingToggleRow}>
              <View style={styles.settingToggleTextCol}>
                <Text style={styles.settingToggleTitle}>WhatsApp Notifications</Text>
                <Text style={styles.settingToggleDesc}>Delivery tracking and GST invoice on mobile</Text>
              </View>
              <Switch
                value={settings.whatsappUpdates}
                onValueChange={(val) => setSettings({ ...settings, whatsappUpdates: val })}
                trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
                thumbColor={settings.whatsappUpdates ? '#00A3E0' : '#F1F5F9'}
              />
            </View>

            <View style={styles.settingToggleRow}>
              <View style={styles.settingToggleTextCol}>
                <Text style={styles.settingToggleTitle}>Promotional & Seminar Offers</Text>
                <Text style={styles.settingToggleDesc}>Announcements of Atomy Success Academies</Text>
              </View>
              <Switch
                value={settings.promoOffers}
                onValueChange={(val) => setSettings({ ...settings, promoOffers: val })}
                trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
                thumbColor={settings.promoOffers ? '#00A3E0' : '#F1F5F9'}
              />
            </View>
          </View>

          <View style={styles.infoSectionCard}>
            <Text style={styles.infoSectionCardTitle}>Security & Access</Text>

            <TouchableOpacity
              style={styles.menuRowItem}
              onPress={() => Alert.alert('Security', 'Password change email sent to ' + userData.email)}
              activeOpacity={0.7}
            >
              <View style={styles.menuRowLeft}>
                <Ionicons name="key-outline" size={20} color="#00A3E0" />
                <Text style={styles.menuRowTitle}>Change Account Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRowItem}
              onPress={() => Alert.alert('App Cache', 'Temporary cache cleared successfully.')}
              activeOpacity={0.7}
            >
              <View style={styles.menuRowLeft}>
                <Ionicons name="trash-outline" size={20} color="#64748B" />
                <Text style={styles.menuRowTitle}>Clear Cache & Cookies</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.appVersionCard}>
            <Text style={styles.appVersionTitle}>Atomy India Mobile App</Text>
            <Text style={styles.appVersionNum}>Version 2.4.0 (Official Release)</Text>
            <Text style={styles.appVersionCopyright}>
              © Atomy India Enterprises Pvt. Ltd. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // SUB-PAGE: NOTIFICATIONS & ALERTS
  // ---------------------------------------------------------------------------
  if (currentSubView === 'notifications') {
    const filteredNotifs = notifications.filter((n) => {
      if (notifFilter === 'orders') return (n.type || '').startsWith('order');
      if (notifFilter === 'account') return !(n.type || '').startsWith('order');
      return true;
    });

    const ordersNotifCount = notifications.filter((n) => (n.type || '').startsWith('order')).length;
    const accountNotifCount = notifications.filter((n) => !(n.type || '').startsWith('order')).length;

    const getNotifIconInfo = (type) => {
      switch (type) {
        case 'membership_expiring':
          return { name: 'time', color: '#D97706', bg: '#FEF3C7' };
        case 'membership_expired':
          return { name: 'alert-circle', color: '#DC2626', bg: '#FEE2E2' };
        case 'membership_active':
          return { name: 'shield-checkmark', color: '#10B981', bg: '#DCFCE7' };
        case 'order_placed':
          return { name: 'bag-check', color: '#15803D', bg: '#DCFCE7' };
        case 'order_shipped':
        case 'order_transit':
          return { name: 'airplane', color: '#0284C7', bg: '#E0F2FE' };
        case 'order_out_for_delivery':
          return { name: 'bicycle', color: '#D97706', bg: '#FEF3C7' };
        case 'order_delivered':
          return { name: 'checkmark-done-circle', color: '#16A34A', bg: '#DCFCE7' };
        case 'order_cancelled':
          return { name: 'close-circle', color: '#DC2626', bg: '#FEE2E2' };
        case 'kyc':
          return { name: 'shield-checkmark', color: '#7C3AED', bg: '#EDE9FE' };
        case 'welcome':
          return { name: 'sparkles', color: '#00A3E0', bg: '#E0F2FE' };
        default:
          return { name: 'notifications', color: '#00A3E0', bg: '#E0F2FE' };
      }
    };

    return (
      <View style={styles.root}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setCurrentSubView('main')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Notifications & Updates
          </Text>
          <TouchableOpacity
            style={styles.headerCartBtn}
            onPress={onNavigateCart}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={23} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.subPageScroll}
          contentContainerStyle={styles.subPageContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Info & Actions */}
          <View style={styles.subPageHeaderInfo}>
            <View style={styles.notifHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subPageMainTitle}>
                  Inbox ({notifications.length})
                </Text>
                <Text style={styles.subPageMainDesc}>
                  Live order tracking dispatches, account updates & important announcements.
                </Text>
              </View>
              {unreadNotifCount > 0 && (
                <View style={styles.unreadCountBadge}>
                  <Text style={styles.unreadCountBadgeText}>{unreadNotifCount} unread</Text>
                </View>
              )}
            </View>

            {/* Quick Action Buttons */}
            {notifications.length > 0 && (
              <View style={styles.notifActionToolbar}>
                {unreadNotifCount > 0 && (
                  <TouchableOpacity
                    style={styles.notifToolBtn}
                    onPress={handleMarkAllRead}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-done" size={14} color="#00A3E0" />
                    <Text style={styles.notifToolBtnText}>Mark all as read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.notifToolBtn, styles.notifToolBtnDanger]}
                  onPress={handleClearAllNotifs}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={14} color="#DC2626" />
                  <Text style={[styles.notifToolBtnText, { color: '#DC2626' }]}>Clear all</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Filter Pills */}
          <View style={styles.notifFilterRow}>
            <TouchableOpacity
              style={[styles.notifFilterPill, notifFilter === 'all' && styles.notifFilterPillActive]}
              onPress={() => setNotifFilter('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.notifFilterText, notifFilter === 'all' && styles.notifFilterTextActive]}>
                All ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.notifFilterPill, notifFilter === 'orders' && styles.notifFilterPillActive]}
              onPress={() => setNotifFilter('orders')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cube-outline"
                size={13}
                color={notifFilter === 'orders' ? '#FFFFFF' : '#64748B'}
              />
              <Text style={[styles.notifFilterText, notifFilter === 'orders' && styles.notifFilterTextActive]}>
                Orders ({ordersNotifCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.notifFilterPill, notifFilter === 'account' && styles.notifFilterPillActive]}
              onPress={() => setNotifFilter('account')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-outline"
                size={13}
                color={notifFilter === 'account' ? '#FFFFFF' : '#64748B'}
              />
              <Text style={[styles.notifFilterText, notifFilter === 'account' && styles.notifFilterTextActive]}>
                Account & Membership ({accountNotifCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notification List */}
          {filteredNotifs.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Ionicons name="notifications-off-outline" size={54} color="#94A3B8" />
              <Text style={styles.emptyStateTitle}>No Notifications</Text>
              <Text style={styles.emptyStateDesc}>
                {notifFilter === 'orders'
                  ? 'No order notifications found. Placed order tracking alerts will appear here.'
                  : 'You are all caught up! Updates regarding dispatches, tracking, and promotions will arrive here.'}
              </Text>
              {orders.length === 0 && (
                <TouchableOpacity
                  style={styles.emptyShopBtn}
                  onPress={onNavigateHome}
                  activeOpacity={0.88}
                >
                  <Text style={styles.emptyShopBtnText}>Explore Products</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.notifListContainer}>
              {filteredNotifs.map((item) => {
                const iconInfo = getNotifIconInfo(item.type);
                const matchedOrder = item.orderId
                  ? orders.find((o) => String(o.id) === String(item.orderId))
                  : null;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.notifCard,
                      item.unread && styles.notifCardUnread,
                      item.type === 'membership_expiring' && styles.notifCardWarning,
                      item.type === 'membership_expired' && styles.notifCardExpired,
                    ]}
                    onPress={() => handleMarkRead(item.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.notifCardTop}>
                      {/* Left Icon Pill */}
                      <View style={[styles.notifIconCircle, { backgroundColor: iconInfo.bg }]}>
                        <Ionicons name={iconInfo.name} size={18} color={iconInfo.color} />
                      </View>

                      {/* Header Title & Date */}
                      <View style={styles.notifCardHeaderCol}>
                        <View style={styles.notifCardTitleRow}>
                          <Text style={styles.notifCardTitle} numberOfLines={2}>
                            {item.title}
                          </Text>
                          {item.unread && (
                            <View
                              style={[
                                styles.notifBlueDot,
                                item.type === 'membership_expiring' && { backgroundColor: '#F59E0B' },
                                item.type === 'membership_expired' && { backgroundColor: '#DC2626' },
                              ]}
                            />
                          )}
                        </View>
                        <Text style={styles.notifCardTime}>
                          {item.time || item.timestamp || (item.createdAt ? formatRelativeTime(item.createdAt) : 'Recent')}
                        </Text>
                      </View>

                      {/* Dismiss / Delete button */}
                      <TouchableOpacity
                        style={styles.notifDismissBtn}
                        onPress={() => handleDeleteNotif(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>

                    {/* Message Body */}
                    <Text style={styles.notifCardMessage}>{item.message}</Text>

                    {/* Membership Renewal / Reactivation Action Button */}
                    {(item.isMembershipAlert || item.type?.startsWith('membership')) && (
                      <View style={styles.notifOrderActionRow}>
                        <TouchableOpacity
                          style={[
                            styles.notifTrackBtn,
                            item.type === 'membership_expired'
                              ? { backgroundColor: '#DC2626' }
                              : { backgroundColor: '#D97706' },
                          ]}
                          onPress={() => {
                            handleMarkRead(item.id);
                            if (onNavigateMembership) onNavigateMembership();
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="refresh" size={13} color="#FFFFFF" />
                          <Text style={styles.notifTrackBtnText}>
                            {item.type === 'membership_expired'
                              ? 'Reactivate Plan Now'
                              : 'Renew Plan Now (₹299)'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Order Action Buttons (Clean wrap & concise labels to prevent overflow) */}
                    {matchedOrder && (
                      <View style={styles.notifOrderActionRow}>
                        <TouchableOpacity
                          style={styles.notifTrackBtn}
                          onPress={() => {
                            handleMarkRead(item.id);
                            setCurrentSubView('orders');
                            setSelectedTrackOrder(matchedOrder);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="location-outline" size={13} color="#FFFFFF" />
                          <Text style={styles.notifTrackBtnText}>Track Order</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.notifInvoiceBtn}
                          onPress={() => {
                            handleMarkRead(item.id);
                            setCurrentSubView('orders');
                            setSelectedInvoiceOrder(matchedOrder);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="document-text-outline" size={13} color="#475569" />
                          <Text style={styles.notifInvoiceBtnText}>Invoice</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN PROFILE SCREEN (ORGANIZED INTO 3 CLEAN, PROFESSIONAL SECTIONS)
  // ---------------------------------------------------------------------------
  // SECTION 1: MY ORDERS, SAVED ADDRESSES & WISHLIST
  const SECTION_ORDERS = [
    {
      id: 'orders',
      title: 'My Orders',
      desc: 'Track orders, invoices & package history',
      icon: 'receipt-outline',
      badge: `${orders.length}`,
      onPress: () => setCurrentSubView('orders'),
    },
    {
      id: 'addresses',
      title: 'Saved Addresses',
      desc: 'Manage home & office delivery addresses',
      icon: 'location-outline',
      badge: addresses.length > 0 ? `${addresses.length}` : null,
      onPress: () => setCurrentSubView('addresses'),
    },
    {
      id: 'wishlist',
      title: 'Wishlist Products',
      desc: 'Saved favorites & personal shopping list',
      icon: 'heart-outline',
      badge: `${favoritesCount}`,
      onPress: onNavigateFavorites,
    },
  ];

  // SECTION 2: MEMBERSHIP & COUPONS
  const SECTION_MEMBERSHIP = [
    {
      id: 'membership_plan',
      title: 'Membership Plan',
      desc: 'Wholesale DP pricing & Point Value (PV)',
      icon: 'ribbon-outline',
      badge: isMember ? 'Active DP' : 'Join Membership',
      badgeActive: isMember,
      onPress: onNavigateMembership,
    },
    {
      id: 'coupons',
      title: 'Coupons & Vouchers',
      desc: 'Discount vouchers & promotional promo codes',
      icon: 'ticket-outline',
      badge: `${coupons.length}`,
      onPress: () => setCurrentSubView('coupons'),
    },
  ];

  // SECTION 3: NOTIFICATIONS, PAYMENT REFUND, LEGAL & SETTINGS
  const SECTION_SETTINGS = [
    {
      id: 'notifications',
      title: 'Notifications & Alerts',
      desc: 'Order dispatches, status alerts & updates',
      icon: 'notifications-outline',
      badge: unreadNotifCount > 0 ? `${unreadNotifCount} New` : null,
      badgeActive: unreadNotifCount > 0,
      onPress: () => setCurrentSubView('notifications'),
    },
    {
      id: 'payment_refund',
      title: 'Payment and Refund',
      desc: 'Refund policies, payment modes & bank account',
      icon: 'card-outline',
      onPress: () => setCurrentSubView('payment_refund'),
    },
    {
      id: 'policies',
      title: 'Policies and Legal',
      desc: 'Terms of service, privacy & compliance',
      icon: 'shield-checkmark-outline',
      onPress: () => setCurrentSubView('policies'),
    },
    {
      id: 'settings',
      title: 'Settings',
      desc: 'App preferences, clear cache & security',
      icon: 'settings-outline',
      onPress: () => setCurrentSubView('settings'),
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuButtonItem}
      onPress={item.onPress}
      activeOpacity={0.72}
    >
      {/* Left Icon with tailored background */}
      <View style={styles.menuItemIconWrap}>
        <Ionicons name={item.icon} size={20} color="#00A3E0" />
      </View>

      {/* Title & Description */}
      <View style={styles.menuItemTextCol}>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
        <Text style={styles.menuItemDesc} numberOfLines={1}>
          {item.desc}
        </Text>
      </View>

      {/* Optional Badge */}
      {item.badge ? (
        <View
          style={[
            styles.menuBadgePill,
            item.badgeActive && styles.menuBadgePillActive,
          ]}
        >
          <Text
            style={[
              styles.menuBadgePillText,
              item.badgeActive && styles.menuBadgePillTextActive,
            ]}
          >
            {item.badge}
          </Text>
        </View>
      ) : null}

      {/* Right Arrow Chevron */}
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* 1. Top Navbar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={onNavigateBack || onNavigateHome}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          My Account & Profile
        </Text>

        <View style={styles.headerRightActionGroup}>
          <TouchableOpacity
            style={styles.headerNotifBtn}
            onPress={() => setCurrentSubView('notifications')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={21} color="#FFFFFF" />
            {unreadNotifCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerCartBtn}
            onPress={onNavigateCart}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={23} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Guest Sign In / Register Prompt Banner */}
        {(!userData.email || userData.name === 'Guest User') && (
          <View style={styles.guestLoginBox}>
            <View style={styles.guestLoginTextCol}>
              <View style={styles.guestLoginTitleRow}>
                <Ionicons name="log-in-outline" size={18} color="#00A3E0" />
                <Text style={styles.guestLoginTitle}>Sign In / Register</Text>
              </View>
              <Text style={styles.guestLoginDesc}>
                Sign in to place orders, access orders, and unlock Member DP prices.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.guestLoginBtn}
              onPress={() => {
                if (onNavigateSignIn) onNavigateSignIn();
                else if (onOpenAuthModal) onOpenAuthModal();
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.guestLoginBtnText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* 2. User Hero Profile Card with Arrow on the Right Edge to Edit Personal Details */}
        <TouchableOpacity
          style={styles.userHeroCardTouchable}
          onPress={() => {
            if (!userData.email || userData.name === 'Guest User') {
              if (onNavigateSignIn) onNavigateSignIn();
              else if (onOpenAuthModal) onOpenAuthModal();
            } else {
              setCurrentSubView('edit_profile');
            }
          }}
          activeOpacity={0.85}
        >
          <View style={styles.userHeroContentRow}>
            {/* Avatar Circle */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{getInitials()}</Text>
            </View>

            {/* Name, Email, Phone */}
            <View style={styles.userMetaCol}>
              <Text style={styles.userNameText}>{userData.name || 'Guest User'}</Text>
              <Text style={styles.userEmailText}>{userData.email || (isMember ? 'distributor@atomy.in' : 'Guest Account • Tap to sign in')}</Text>
              {userData.phone ? (
                <Text style={styles.userPhoneText}>{userData.phone}</Text>
              ) : null}
            </View>

            {/* Right Edge Arrow to Edit Personal Details */}
            <View style={styles.rightArrowBtn}>
              <Ionicons name="chevron-forward" size={22} color="#00A3E0" />
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. Distributor Membership Status Banner */}
        <TouchableOpacity
          style={[
            styles.membershipBanner,
            isExpired
              ? styles.membershipBannerExpired
              : isExpiringSoon
              ? styles.membershipBannerWarning
              : isMember
              ? styles.membershipBannerActive
              : styles.membershipBannerInactive,
          ]}
          onPress={onNavigateMembership}
          activeOpacity={0.88}
        >
          <View style={styles.membershipBannerLeft}>
            <Ionicons
              name={
                isExpired
                  ? 'alert-circle'
                  : isExpiringSoon
                  ? 'time'
                  : isMember
                  ? 'shield-checkmark'
                  : 'ribbon-outline'
              }
              size={22}
              color={
                isExpired
                  ? '#DC2626'
                  : isExpiringSoon
                  ? '#D97706'
                  : isMember
                  ? '#10B981'
                  : '#D97706'
              }
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.membershipBannerTitle,
                  {
                    color: isExpired
                      ? '#DC2626'
                      : isExpiringSoon
                      ? '#B45309'
                      : isMember
                      ? '#15803D'
                      : '#92400E',
                  },
                ]}
              >
                {isExpired
                  ? `Membership Plan Expired (${expiry?.expiryDateStr || ''})`
                  : isExpiringSoon
                  ? `Plan Expires in ${expiry?.remainingDays || 2} Day${expiry?.remainingDays === 1 ? '' : 's'} (${expiry?.expiryDateStr || ''})`
                  : isMember
                  ? 'Active Distributor Member'
                  : 'Standard Customer'}
              </Text>
              <Text
                style={[
                  styles.membershipBannerDesc,
                  isExpiringSoon && { color: '#92400E' },
                  isExpired && { color: '#991B1B' },
                ]}
              >
                {isExpired
                  ? 'Reactivate now to restore wholesale DP pricing • Tap to renew'
                  : isExpiringSoon
                  ? 'Wholesale DP active • Tap to renew plan and prevent interruption'
                  : isMember
                  ? 'Wholesale Distributor Pricing (DP) is active'
                  : 'Join Membership to get Distributor Price (DP) & PV'}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={
              isExpired
                ? '#DC2626'
                : isExpiringSoon
                ? '#B45309'
                : isMember
                ? '#15803D'
                : '#92400E'
            }
          />
        </TouchableOpacity>

        {/* 4. Counters Summary Row */}
        <View style={styles.countersCard}>
          <View style={styles.counterBox}>
            <Text style={styles.counterVal}>{accumulatedPV.toLocaleString('en-IN')}</Text>
            <Text style={styles.counterLabel}>Accumulated PV</Text>
          </View>

          <View style={styles.counterDivider} />

          <TouchableOpacity
            style={styles.counterBox}
            onPress={onNavigateFavorites}
            activeOpacity={0.7}
          >
            <Text style={styles.counterVal}>{favoritesCount}</Text>
            <Text style={styles.counterLabel}>Saved Favorites ›</Text>
          </TouchableOpacity>

          <View style={styles.counterDivider} />

          <TouchableOpacity
            style={styles.counterBox}
            onPress={() => setCurrentSubView('orders')}
            activeOpacity={0.7}
          >
            <Text style={styles.counterVal}>{orders.length}</Text>
            <Text style={styles.counterLabel}>Total Orders ›</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 1: MY ORDERS, SAVED ADDRESS & WISHLIST */}
        <View style={styles.menuGroup}>
          <View style={styles.menuGroupHeaderRow}>
            <Ionicons name="bag-check-outline" size={15} color="#00A3E0" />
            <Text style={styles.menuGroupHeader}>My Orders & Wishlist</Text>
          </View>
          <View style={styles.menuButtonsCard}>
            {SECTION_ORDERS.map((item, idx) => (
              <React.Fragment key={item.id}>
                {renderMenuItem(item)}
                {idx < SECTION_ORDERS.length - 1 && <View style={styles.menuItemDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* SECTION 2: MEMBERSHIP & COUPONS */}
        <View style={styles.menuGroup}>
          <View style={styles.menuGroupHeaderRow}>
            <Ionicons name="ribbon-outline" size={15} color="#0284C7" />
            <Text style={styles.menuGroupHeader}>Membership & Coupons</Text>
          </View>
          <View style={styles.menuButtonsCard}>
            {SECTION_MEMBERSHIP.map((item, idx) => (
              <React.Fragment key={item.id}>
                {renderMenuItem(item)}
                {idx < SECTION_MEMBERSHIP.length - 1 && <View style={styles.menuItemDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* SECTION 3: PAYMENT REFUND, LEGAL & SETTINGS */}
        <View style={styles.menuGroup}>
          <View style={styles.menuGroupHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={15} color="#64748B" />
            <Text style={styles.menuGroupHeader}>Payment, Legal & Settings</Text>
          </View>
          <View style={styles.menuButtonsCard}>
            {SECTION_SETTINGS.map((item, idx) => (
              <React.Fragment key={item.id}>
                {renderMenuItem(item)}
                {idx < SECTION_SETTINGS.length - 1 && <View style={styles.menuItemDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* LOG OUT BUTTON (Working with cross-platform confirmation & clean red styling) */}
        <TouchableOpacity
          style={styles.logOutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={19} color="#DC2626" />
          <Text style={styles.logOutBtnText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: -0.3,
  },
  headerCartBtn: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  headerSaveBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  headerSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  headerAddBtn: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  // Guest Login Box
  guestLoginBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  guestLoginTextCol: {
    flex: 1,
  },
  guestLoginTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  guestLoginTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369A1',
  },
  guestLoginDesc: {
    fontSize: 11,
    color: '#0284C7',
    lineHeight: 15,
  },
  guestLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00A3E0',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  guestLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // User Hero Card
  userHeroCardTouchable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userHeroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#00A3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  userMetaCol: {
    flex: 1,
    gap: 2,
  },
  userNameText: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  userEmailText: {
    fontSize: 12.5,
    color: '#64748B',
  },
  userPhoneText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  rightArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Membership Banner
  membershipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  membershipBannerActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  membershipBannerWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  membershipBannerExpired: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  membershipBannerInactive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  membershipBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  membershipBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  membershipBannerDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  // Counters
  countersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  counterBox: {
    alignItems: 'center',
    flex: 1,
  },
  counterVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  counterLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  counterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },

  // Menu Sections & Group Cards (Clean 3-Section Layout)
  menuGroup: {
    marginBottom: 16,
  },
  menuGroupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuGroupHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  menuButtonsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuButtonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  menuItemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 62,
    marginRight: 14,
  },
  menuItemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuItemDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  menuBadgePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  menuBadgePillActive: {
    backgroundColor: '#DCFCE7',
  },
  menuBadgePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  menuBadgePillTextActive: {
    color: '#15803D',
  },

  // Log Out button
  logOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  logOutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.2,
  },

  // ---------------------------------------------------------------------------
  // SUBPAGES COMMON STYLES
  // ---------------------------------------------------------------------------
  subPageScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  subPageContent: {
    padding: 16,
    paddingBottom: 40,
  },
  subPageHeaderInfo: {
    marginBottom: 16,
  },
  subPageMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subPageMainDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 3,
  },

  // Empty State Box (Authentic Clean View when empty)
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  emptyShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00A3E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyShopBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Edit Profile Specific
  editAvatarSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  editAvatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#00A3E0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  editAvatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0F172A',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editAvatarHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '700',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  genderPillActive: {
    borderColor: '#00A3E0',
    backgroundColor: '#E0F2FE',
  },
  genderPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  genderPillTextActive: {
    color: '#00A3E0',
    fontWeight: '800',
  },
  readOnlyField: {
    marginTop: 4,
  },
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  verifiedTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#15803D',
  },
  saveSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00A3E0',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },

  // Orders Subpage
  ordersListContainer: {
    gap: 12,
  },
  orderCardDetailed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderCardId: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  orderCardDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusPillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusPillGreenText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  orderProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  orderProductsText: {
    flex: 1,
    fontSize: 12.5,
    color: '#1E293B',
    lineHeight: 16,
    fontWeight: '600',
  },
  orderTrackStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  orderTrackStripText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  orderPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginBottom: 10,
  },
  priceRowLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  priceRowVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  pvEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pvEarnedBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#00A3E0',
  },
  orderCardBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  orderTrackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingVertical: 8,
    borderRadius: 6,
  },
  orderTrackBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00A3E0',
  },
  orderInvoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 6,
  },
  orderInvoiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  // Addresses Subpage
  addAddressFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 16,
    marginBottom: 16,
  },
  gpsLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  gpsLocationBtnSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  gpsLocationBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00A3E0',
  },
  gpsLocationBtnTextSuccess: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
  },
  locationFeedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    marginBottom: 12,
  },
  locationFeedbackText: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
    flex: 1,
  },
  labelWithSpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inlineLookupIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lookupText: {
    fontSize: 11,
    color: '#00A3E0',
    fontWeight: '600',
  },
  detectedAreasContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  detectedAreasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  detectedAreasTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  areaChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  areaChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  areaChipBtnActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  areaChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  areaChipTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addressesListContainer: {
    gap: 12,
  },
  addressCardDetailed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  addressCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  addressTypeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3E0',
  },
  defaultBadgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgePillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#15803D',
  },
  addressNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  addressBodyText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginVertical: 4,
  },
  addressPhoneText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  addressActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  setAsDefaultBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  setAsDefaultBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#00A3E0',
  },
  deleteAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteAddressBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Coupons Subpage
  promoInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  promoTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
  },
  promoApplyBtn: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 8,
  },
  promoApplyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  couponFeedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  couponFeedbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  couponsListContainer: {
    gap: 10,
  },
  couponCardDetailed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  couponCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  couponBadgeGold: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  couponBadgeGoldText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B45309',
  },
  copyCouponBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  copyCouponBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#00A3E0',
  },
  couponCodeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  couponTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  couponDescText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 3,
  },
  couponFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  couponExpiryText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  couponMinText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  // Policies Subpage
  policiesListContainer: {
    gap: 10,
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  policyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  policyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  policyTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  policyContentText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 19,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },

  // Payment & Refund Subpage
  guaranteeCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  guaranteeIconWrap: {
    marginBottom: 8,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803D',
    marginBottom: 4,
    textAlign: 'center',
  },
  guaranteeDesc: {
    fontSize: 12.5,
    color: '#166534',
    lineHeight: 18,
    textAlign: 'center',
  },
  infoSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  infoSectionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timelineDetails: {
    flex: 1,
  },
  timelineHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  timelineBody: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  editBankActionText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#00A3E0',
  },
  bankFormBox: {
    marginTop: 10,
  },
  bankAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
  },
  bankAccountCol: {
    flex: 1,
  },
  bankName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  bankNumber: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  bankHolder: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  emptyBankState: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  emptyBankText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginTop: 6,
  },
  emptyBankSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },

  // Settings Subpage
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingToggleTextCol: {
    flex: 1,
    marginRight: 10,
  },
  settingToggleTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  settingToggleDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  menuRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  appVersionCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appVersionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
  },
  appVersionNum: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  appVersionCopyright: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 4,
  },

  // Modals (Track Order & Invoice)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalScrollView: {
    maxHeight: 520,
  },
  modalScrollContent: {
    padding: 20,
    gap: 16,
  },
  modalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalPrimaryBtn: {
    flex: 1,
    backgroundColor: '#00A3E0',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    paddingVertical: 13,
  },
  modalSecondaryBtnText: {
    color: '#00A3E0',
    fontSize: 14,
    fontWeight: '800',
  },

  // Tracking Modal Styles
  trackingCourierCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 14,
    gap: 10,
  },
  courierTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courierName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0284C7',
  },
  courierLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pulsingGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  courierLiveText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  courierDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E0F2FE',
  },
  courierGridCol: {
    flex: 1,
  },
  courierGridLbl: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  courierGridVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  courierStatusNotice: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
    backgroundColor: '#E0F2FE',
    padding: 8,
    borderRadius: 6,
  },

  // Stepper Styles
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  stepperHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  stepperStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepperLeftCol: {
    alignItems: 'center',
    width: 28,
  },
  stepperCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleCompleted: {
    backgroundColor: '#16A34A',
  },
  stepperCircleCurrent: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#00A3E0',
  },
  stepperCircleFuture: {
    backgroundColor: '#F1F5F9',
  },
  stepperConnector: {
    width: 2,
    height: 38,
    marginVertical: 2,
  },
  stepperConnectorActive: {
    backgroundColor: '#16A34A',
  },
  stepperConnectorInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepperRightCol: {
    flex: 1,
    paddingTop: 3,
    paddingBottom: 16,
  },
  stepperTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stepperStepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperStepTitleCurrent: {
    color: '#00A3E0',
  },
  stepperStepTitleFuture: {
    color: '#94A3B8',
  },
  stepperActivePill: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stepperActivePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  stepperStepDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  trackingAddressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  trackingAddressInfo: {
    flex: 1,
  },
  trackingAddressTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  trackingAddressRecipient: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  trackingAddressText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },

  // Invoice Modal Styles
  invoiceCompanyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00A3E0',
  },
  invoiceCompanyName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  invoiceCompanyMeta: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  invoiceMetaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceMetaCol: {
    flex: 1,
  },
  invoiceMetaLbl: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  invoiceMetaVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  invoiceMetaValBold: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00A3E0',
  },
  invoiceSubMetaVal: {
    fontSize: 11.5,
    color: '#64748B',
  },
  invoiceAddressSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  invoiceAddressVal: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  invoiceItemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  invoiceItemsHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  invoiceItemTh: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  invoiceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  invoiceItemTd: {
    fontSize: 12,
    color: '#1E293B',
  },
  invoiceSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
  },
  invoiceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceSummaryLbl: {
    fontSize: 12,
    color: '#64748B',
  },
  invoiceSummaryVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  invoiceGrandTotalLbl: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  invoiceGrandTotalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#00A3E0',
  },
  invoicePvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  invoicePvText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  invoiceStampCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
  },
  invoiceStampText: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    lineHeight: 15,
  },

  /* Header notification button & badge */
  headerRightActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerNotifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#00A3E0',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },

  /* Notifications sub-page */
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  unreadCountBadge: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  unreadCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  notifActionToolbar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  notifToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  notifToolBtnDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  notifToolBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
  notifFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  notifFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifFilterPillActive: {
    backgroundColor: '#00A3E0',
    borderColor: '#00A3E0',
  },
  notifFilterText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  notifFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  notifListContainer: {
    gap: 10,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  notifCardUnread: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderLeftWidth: 3.5,
    borderLeftColor: '#00A3E0',
  },
  notifCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCardHeaderCol: {
    flex: 1,
  },
  notifCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flexShrink: 1,
  },
  notifBlueDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00A3E0',
  },
  notifCardTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  notifDismissBtn: {
    padding: 2,
  },
  notifCardMessage: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginTop: 8,
    marginLeft: 46,
  },
  notifOrderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginLeft: 46,
  },
  notifTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#00A3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
  },
  notifTrackBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  notifInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
  },
  notifInvoiceBtnText: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '700',
  },
  notifCardWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderLeftWidth: 3.5,
    borderLeftColor: '#F59E0B',
  },
  notifCardExpired: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderLeftWidth: 3.5,
    borderLeftColor: '#DC2626',
  },
  editAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00A3E0',
    backgroundColor: '#F0F9FF',
    gap: 4,
  },
  editAddressBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
});

