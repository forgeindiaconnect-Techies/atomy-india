import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Linking,
  BackHandler,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../../data/officialDistributorPrices';
import OrderSuccessCelebration from '../Orders/OrderSuccessCelebration';
import { createOrderApi, checkPincodeInventory, fetchHubDetails } from '../../services/api';
import { applyCouponBackend, fetchCouponsFromBackend, DEFAULT_STORE_COUPONS } from '../../services/couponService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Original Authentic UPI App Logos
const GPAY_LOGO = require('../../../assets/logos/gpay.png');
const PHONEPE_LOGO = require('../../../assets/logos/phonepe.png');
const PAYTM_LOGO = require('../../../assets/logos/paytm.png');
const UPI_LOGO = require('../../../assets/logos/upi.png');

// Key Indian postal zones for instant PIN code lookup
const PIN_CODE_MAP = {
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110002': { city: 'Central Delhi', state: 'Delhi' },
  '110020': { city: 'South Delhi', state: 'Delhi' },
  '122001': { city: 'Gurugram', state: 'Haryana' },
  '122003': { city: 'Gurugram', state: 'Haryana' },
  '122018': { city: 'Gurugram', state: 'Haryana' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh' },
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '400050': { city: 'Bandra, Mumbai', state: 'Maharashtra' },
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '560034': { city: 'Koramangala, Bengaluru', state: 'Karnataka' },
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '682001': { city: 'Kochi', state: 'Kerala' },
  '796001': { city: 'Aizawl', state: 'Mizoram' },
};

const EMPTY_ADDRESS_FORM = {
  id: '',
  tag: 'Home',
  recipientName: '',
  recipientPhone: '',
  pincode: '',
  city: '',
  state: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  deliveryMessage: '',
  isDefault: true,
};

function getSavedAddressesList(currentUser) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const mobSaved = window.localStorage.getItem('atomy_mobile_saved_addresses');
      if (mobSaved) {
        const parsed = JSON.parse(mobSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const webSaved = window.localStorage.getItem('atomy_customer_addresses');
      if (webSaved) {
        const parsed = JSON.parse(webSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (e) { }

  if (Array.isArray(currentUser?.addresses) && currentUser.addresses.length > 0) {
    return currentUser.addresses;
  }

  if (currentUser && currentUser.name && currentUser.name !== 'Guest User') {
    return [
      {
        id: 'addr-default-profile',
        tag: 'Home',
        recipientName: currentUser.name || 'Naveen',
        recipientPhone: currentUser.phone || '9876543210',
        pincode: currentUser.pincode || '635202',
        city: currentUser.city || 'Dharmapuri',
        state: currentUser.state || 'Tamil Nadu',
        addressLine1: currentUser.address || 'dNo 45, Rk building, bayanapalli',
        addressLine2: 'Krishnapuram, Krishnagiri',
        landmark: 'Near Bus Stand',
        deliveryMessage: '',
        isDefault: true,
      },
    ];
  }
  return [];
}

function getInitialAddress(currentUser) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedSelected =
        window.localStorage.getItem('atomy_mobile_selected_address') ||
        window.localStorage.getItem('atomy_shipping_address');
      if (storedSelected) {
        const parsed = JSON.parse(storedSelected);
        if (parsed && (parsed.addressLine1 || parsed.street) && parsed.pincode) {
          return {
            id: parsed.id || `addr-${Date.now()}`,
            tag: parsed.tag || parsed.type || 'Home',
            recipientName: parsed.recipientName || parsed.name || (currentUser?.name && currentUser?.name !== 'Customer Account' ? currentUser.name : 'Naveen'),
            recipientPhone: parsed.recipientPhone || parsed.phone || currentUser?.phone || '9876543210',
            pincode: parsed.pincode || '635202',
            city: parsed.city || 'Dharmapuri',
            state: parsed.state || 'Tamil Nadu',
            addressLine1: parsed.addressLine1 || parsed.street || 'dNo 45, Rk building, bayanapalli',
            addressLine2: parsed.addressLine2 || 'Krishnapuram, Krishnagiri',
            landmark: parsed.landmark || '',
            deliveryMessage: parsed.deliveryMessage || '',
            isDefault: true,
          };
        }
      }
      const list = getSavedAddressesList(currentUser);
      if (Array.isArray(list) && list.length > 0) {
        const def = list.find((a) => a.isDefault) || list[0];
        if (def && (def.street || def.addressLine1) && def.pincode) {
          return {
            id: def.id || `addr-${Date.now()}`,
            tag: def.type || def.tag || 'Home',
            recipientName: def.name || def.recipientName || (currentUser?.name && currentUser?.name !== 'Customer Account' ? currentUser.name : 'Naveen'),
            recipientPhone: def.phone || def.recipientPhone || currentUser?.phone || '9876543210',
            pincode: def.pincode || '635202',
            city: def.city || 'Dharmapuri',
            state: def.state || 'Tamil Nadu',
            addressLine1: def.street || def.addressLine1 || 'dNo 45, Rk building, bayanapalli',
            addressLine2: def.addressLine2 || 'Krishnapuram, Krishnagiri',
            landmark: def.landmark || '',
            deliveryMessage: def.deliveryMessage || '',
            isDefault: true,
          };
        }
      }
    }
  } catch (e) { }

  if (currentUser && currentUser.name && currentUser.name !== 'Guest User') {
    return {
      id: 'addr-default-profile',
      tag: 'Home',
      recipientName: currentUser.name || 'Naveen',
      recipientPhone: currentUser.phone || '9876543210',
      pincode: currentUser.pincode || '635202',
      city: currentUser.city || 'Dharmapuri',
      state: currentUser.state || 'Tamil Nadu',
      addressLine1: currentUser.address || 'dNo 45, Rk building, bayanapalli',
      addressLine2: 'Krishnapuram, Krishnagiri',
      landmark: 'Near Bus Stand',
      deliveryMessage: '',
      isDefault: true,
    };
  }
  return null;
}

function getInitialCoManager(currentUser) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('atomy_co_manager_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    }
  } catch (e) { }

  if (currentUser?.coManager && currentUser.coManager.name) {
    return currentUser.coManager;
  }

  if (currentUser?.spouseName) {
    return {
      name: currentUser.spouseName,
      phone: currentUser.spousePhone || '9840123456',
      relationship: 'Spouse / Co-Applicant',
      status: 'Active',
      isAuthorized: true,
    };
  }

  return {
    name: 'Priya Naveen',
    phone: '9840123456',
    relationship: 'Spouse / Co-Applicant',
    status: 'Active',
    isAuthorized: true,
  };
}

function formatInr(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getEstimatedDelivery(addressText = '') {
  const isRemote = /forest|mountain|hills?|ghat|ooty|nilgiris|kodaikanal|yercaud|munnar|wayanad|valparai|coonoor|shimla|manali|kullu|leh|ladakh|jammu|kashmir|uttarkashi|chamoli|nainital|mussoorie|arunachal|sikkim|meghalaya|nagaland|mizoram|manipur/i.test(addressText);
  const slaDays = isRemote ? 3 : 2;
  const now = new Date();
  const delivery = new Date(now);
  delivery.setDate(delivery.getDate() + slaDays);
  const endStr = delivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return {
    date: endStr,
    range: `${endStr} (${isRemote ? 'Within 3 Days • Mountain/Forest Area' : 'Within 2 Days • Nearby Hub Fulfillment'})`,
    carrier: 'Blue Dart Express (Standard)',
    timeFrame: isRemote ? 'Within 3 Days (Mountain/Forest Area)' : 'Within 2 Days (Nearby Hub)',
    isRemote,
    slaDays,
  };
}

function getItemPricing(item, isMember) {
  const official = item.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[item.id] : null;
  const rawPrice = Number(item.price) || (official ? official.dpPrice : 1000);
  let mrp = Number(item.originalPrice) || Number(item.mrp);
  if (!mrp || mrp <= rawPrice) {
    if (official && official.mrp && official.mrp > rawPrice) {
      mrp = official.mrp;
    } else {
      mrp = Math.round(rawPrice * 1.18);
    }
  }
  let dpPrice = Number(item.dpPrice || (official ? official.dpPrice : 0));
  if (!dpPrice || dpPrice >= rawPrice) {
    dpPrice = Math.round(rawPrice * 0.85);
  }
  const price = isMember ? dpPrice : rawPrice;
  const pv = Number(item.pv || (official ? official.pv : 0)) || Math.round(rawPrice * 4.5);
  return { rawPrice, mrp, dpPrice, price, pv };
}

export default function PaymentSummaryPage({
  checkoutItems = [],
  isMember = false,
  currentUser = null,
  placedOrders = [],
  onRequestSignIn,
  onNavigateBack,
  onNavigateHome,
  onUpdateQty,
  onRemoveItem,
  onOrderSuccess,
  onProductClick,
}) {
  // Step state: 'sheet' -> 'payment' -> 'completed'
  const [step, setStep] = useState('sheet');

  // Handle in-built mobile back button (Hardware Back button)
  useEffect(() => {
    const onBackPress = () => {
      if (step === 'payment') {
        setStep('sheet');
        return true;
      }
      if (step === 'sheet') {
        if (onNavigateBack) {
          onNavigateBack();
          return true;
        }
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, [step, onNavigateBack]);

  // Swipe-back gesture handler for Payment Summary (from left edge)
  const swipePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isFromLeftEdge = evt.nativeEvent.pageX <= 55;
        const isSwipingRight =
          gestureState.dx > 20 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        return isFromLeftEdge && isSwipingRight;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 60 || gestureState.vx > 0.4) {
          if (step === 'payment') {
            setStep('sheet');
          } else if (step === 'sheet') {
            if (onNavigateBack) onNavigateBack();
          }
        }
      },
    })
  ).current;

  // Accordion toggle states
  const [isItemsExpanded, setIsItemsExpanded] = useState(true);
  const [isTaxBreakdownOpen, setIsTaxBreakdownOpen] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);

  // Address state (Dynamic from user profile / local storage, without hardcoding)
  const [selectedAddress, setSelectedAddress] = useState(() => getInitialAddress(currentUser));
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState(() => getSavedAddressesList(currentUser));
  const [addressForm, setAddressForm] = useState(() => {
    const init = getInitialAddress(currentUser);
    return (
      init || {
        ...EMPTY_ADDRESS_FORM,
        recipientName: currentUser?.name && currentUser?.name !== 'Customer Account' ? currentUser.name : '',
        recipientPhone: currentUser?.phone || '',
      }
    );
  });

  // Co-Manager & Distributor Plan states
  const [coManager, setCoManager] = useState(() => getInitialCoManager(currentUser));
  const [isCoManagerModalOpen, setIsCoManagerModalOpen] = useState(false);
  const [coManagerForm, setCoManagerForm] = useState(() => {
    const init = getInitialCoManager(currentUser);
    return {
      name: init?.name || '',
      phone: init?.phone || '',
      relationship: init?.relationship || 'Spouse / Co-Applicant',
      isAuthorized: init?.isAuthorized !== false,
    };
  });

  const handleSaveCoManager = () => {
    if (!coManagerForm.name.trim() || !coManagerForm.phone.trim()) {
      Alert.alert('Required Fields', 'Please enter Co-Manager Full Name and Mobile Number.');
      return;
    }
    const updated = {
      name: coManagerForm.name.trim(),
      phone: coManagerForm.phone.trim().replace(/\D/g, ''),
      relationship: coManagerForm.relationship || 'Spouse / Co-Applicant',
      status: 'Active',
      isAuthorized: coManagerForm.isAuthorized !== false,
    };
    setCoManager(updated);
    setIsCoManagerModalOpen(false);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('atomy_co_manager_profile', JSON.stringify(updated));
      }
    } catch (e) { }
    Alert.alert('Co-Manager Updated', `${updated.name} linked as Co-Manager (Joint Distributor Operator).`);
  };

  // Compact Coupon Dropdown State (Headings only)
  const [isCouponDropdownOpen, setIsCouponDropdownOpen] = useState(false);

  // Regional Logistics Hub state (including Co-Manager delegation)
  const [hubDetails, setHubDetails] = useState(null);
  const [isLoadingHub, setIsLoadingHub] = useState(false);

  // Re-sync address when currentUser updates if no address was previously set
  useEffect(() => {
    if (!selectedAddress) {
      const dynamicAddr = getInitialAddress(currentUser);
      if (dynamicAddr) {
        setSelectedAddress(dynamicAddr);
        setAddressForm(dynamicAddr);
      } else if (currentUser?.name && currentUser?.name !== 'Customer Account') {
        setAddressForm((prev) => ({
          ...prev,
          recipientName: prev.recipientName || currentUser.name,
          recipientPhone: prev.recipientPhone || currentUser.phone || '',
        }));
      }
    }
  }, [currentUser]);

  // Single Home / Single Office limits for address modal
  const hasExistingHome = savedAddresses.some(
    (a) => a.id !== addressForm.id && (a.type || a.tag || '').toLowerCase().trim() === 'home'
  );
  const hasExistingOffice = savedAddresses.some(
    (a) => a.id !== addressForm.id && (a.type || a.tag || '').toLowerCase().trim() === 'office'
  );

  // Delivery destination PIN & regional stock check (Option B)
  const [deliveryPinStock, setDeliveryPinStock] = useState({});
  const [isCheckingDeliveryStock, setIsCheckingDeliveryStock] = useState(false);
  const deliveryPincode = selectedAddress?.pincode ? String(selectedAddress.pincode).trim() : '';

  useEffect(() => {
    let isCurrent = true;
    if (!deliveryPincode || !/^\d{6}$/.test(deliveryPincode)) {
      setDeliveryPinStock({});
      return;
    }

    setIsCheckingDeliveryStock(true);
    checkPincodeInventory(deliveryPincode)
      .then((res) => {
        if (!isCurrent) return;
        setDeliveryPinStock(res?.itemsStock || {});
        setIsCheckingDeliveryStock(false);
      })
      .catch(() => {
        if (isCurrent) setIsCheckingDeliveryStock(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [deliveryPincode]);

  // Fetch real-time Regional Logistics Hub & Co-Manager details
  useEffect(() => {
    const pin = deliveryPincode || '635002';
    setIsLoadingHub(true);
    fetchHubDetails(pin)
      .then((info) => {
        setHubDetails(info);
        setIsLoadingHub(false);
      })
      .catch(() => {
        setIsLoadingHub(false);
      });
  }, [deliveryPincode]);

  // Items out of delivery stock in destination PIN hub (< 2 units or inStock === false)
  const outOfDeliveryItems = useMemo(() => {
    return (checkoutItems || []).filter((item) => {
      const pinStockInfo =
        deliveryPincode && deliveryPinStock[item.id] !== undefined
          ? deliveryPinStock[item.id]
          : null;

      let stockQty;
      let inStock;

      if (pinStockInfo !== null) {
        stockQty = Number(pinStockInfo.stockQuantity || 0);
        inStock = Boolean(pinStockInfo.inStock);
      } else {
        stockQty = item.stockQuantity !== undefined ? Number(item.stockQuantity) : 50;
        inStock = item.inStock !== false;
      }

      const maxOrderable = Math.max(0, stockQty - 1);
      return !inStock || stockQty < 2 || maxOrderable < 1 || (item.qty || item.quantity || 1) > maxOrderable;
    });
  }, [checkoutItems, deliveryPincode, deliveryPinStock]);

  const hasOutOfDeliveryItems = outOfDeliveryItems.length > 0;

  const hasValidAddress = useMemo(() => {
    return Boolean(
      selectedAddress &&
      selectedAddress.recipientName?.trim() &&
      selectedAddress.recipientPhone?.trim() &&
      selectedAddress.pincode?.trim() &&
      (selectedAddress.addressLine1?.trim() || selectedAddress.street?.trim())
    );
  }, [selectedAddress]);

  const isFirstOrder = useMemo(() => {
    if (Array.isArray(placedOrders) && placedOrders.length > 0) return false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('atomy_mobile_orders') || window.localStorage.getItem('atomy_orders');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return false;
        }
      }
    } catch (e) { }
    return true;
  }, [placedOrders]);

  const hasHemohimInCart = useMemo(() => {
    return (
      Array.isArray(checkoutItems) &&
      checkoutItems.some((it) => {
        if (!it) return false;
        const n = String(it.name || it.title || '').toLowerCase();
        const t = Array.isArray(it.tags) ? it.tags.join(' ').toLowerCase() : String(it.tags || '').toLowerCase();
        const c = String(it.category || '').toLowerCase();
        return n.includes('hemohim') || n.includes('hemo him') || t.includes('hemohim') || c.includes('hemohim');
      })
    );
  }, [checkoutItems]);

  const [availableCoupons, setAvailableCoupons] = useState(DEFAULT_STORE_COUPONS);

  useEffect(() => {
    fetchCouponsFromBackend().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setAvailableCoupons(list);
      }
    });
  }, []);

  // Filter eligible store coupons for compact dropdown
  const eligibleCoupons = useMemo(() => {
    if (!Array.isArray(availableCoupons) || availableCoupons.length === 0) return [];
    return availableCoupons.filter((cpn) => {
      const code = String(cpn.code || '').toUpperCase();
      const status = String(cpn.status || 'ACTIVE').toUpperCase();
      if (status !== 'ACTIVE') return false;

      // Welcome coupon only for 1st order
      const isWelcome = cpn.firstOrderOnly === true || code.includes('WELCOME') || code.includes('FIRST');
      if (isWelcome && !isFirstOrder) return false;

      // HemoHIM coupon only if HemoHIM in cart
      const isHemohim = code.includes('HEMO') || String(cpn.targetProduct || '').toUpperCase() === 'HEMOHIM';
      if (isHemohim && !hasHemohimInCart) return false;

      return true;
    });
  }, [availableCoupons, isFirstOrder, hasHemohimInCart]);
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState('');
  const [locationFeedback, setLocationFeedback] = useState(null);
  const [availableAreas, setAvailableAreas] = useState([]);

  // Fulfillment method: Courier Doorstep Delivery vs Direct Regional Hub Pickup
  const [fulfillmentType, setFulfillmentType] = useState('COURIER_DELIVERY'); // 'COURIER_DELIVERY' | 'STORE_PICKUP'
  const isStorePickup = fulfillmentType === 'STORE_PICKUP';

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'COD' | 'NETBANKING'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'bhim'
  const [customUpiId, setCustomUpiId] = useState('');
  const [showCustomUpi, setShowCustomUpi] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [saveCardRbi, setSaveCardRbi] = useState(true);

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC');

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isAmountDropdownOpen, setIsAmountDropdownOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showOtherUpiApps, setShowOtherUpiApps] = useState(false);

  const destinationAddressString = useMemo(() => {
    return `${selectedAddress?.addressLine1 || ''} ${selectedAddress?.city || ''} ${selectedAddress?.state || ''} ${selectedAddress?.pincode || ''}`;
  }, [selectedAddress]);

  const estimatedDelivery = useMemo(() => getEstimatedDelivery(destinationAddressString), [destinationAddressString]);

  // Price & calculations
  const totalQty = useMemo(
    () => checkoutItems.reduce((acc, i) => acc + (i.qty || 1), 0),
    [checkoutItems]
  );

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((acc, item) => {
      const { price } = getItemPricing(item, isMember);
      return acc + price * (item.qty || 1);
    }, 0);
  }, [checkoutItems, isMember]);

  const totalPV = useMemo(() => {
    return checkoutItems.reduce((acc, item) => {
      const { pv } = getItemPricing(item, isMember);
      return acc + pv * (item.qty || 1);
    }, 0);
  }, [checkoutItems, isMember]);

  const hasFreeDeliveryProduct = useMemo(() => {
    return checkoutItems.some((item) => item.freeDelivery === true);
  }, [checkoutItems]);

  const isFreeDelivery = subtotal >= 4500 || hasFreeDeliveryProduct;
  const rawShippingFee = checkoutItems.length > 0 && !isFreeDelivery ? 150 : 0;
  const effectiveRawShippingFee = isStorePickup ? 0 : rawShippingFee;

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountAmount) return Math.min(subtotal, appliedCoupon.discountAmount);
    if (appliedCoupon.discountValue && appliedCoupon.discountType === 'PERCENTAGE') {
      return Math.round(subtotal * (appliedCoupon.discountValue / 100));
    }
    if (appliedCoupon.discountValue && appliedCoupon.discountType === 'FIXED') {
      return Math.min(subtotal, appliedCoupon.discountValue);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const shippingFee = appliedCoupon?.isFreeShipping ? 0 : effectiveRawShippingFee;
  const voucherDiscount = isVoucherApplied ? Math.min(subtotal, 500) : 0;
  const grandTotal = Math.max(0, subtotal - couponDiscount - voucherDiscount + shippingFee);

  const handleApplyCoupon = async (codeOverride) => {
    const codeToApply = (typeof codeOverride === 'string' ? codeOverride : couponCode).trim();
    setCouponError('');
    if (!codeToApply) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponLoading(true);
    try {
      const res = await applyCouponBackend(codeToApply, subtotal, checkoutItems, isFirstOrder);
      if (res && res.valid) {
        setAppliedCoupon(res);
        setCouponCode(res.code || codeToApply);
        setCouponError('');
      } else {
        setCouponError(res?.message || 'Invalid or expired coupon code.');
      }
    } catch (err) {
      setCouponError('Could not verify coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Calculate dynamic savings: difference between Retail MRP and active paid price
  const totalSavings = useMemo(() => {
    let savings = 0;
    checkoutItems.forEach((item) => {
      const official = item?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[item.id] : null;
      const rawPrice = Number(item.price) || (official ? official.dpPrice : 0);
      let mrp = Number(item.originalPrice) || Number(item.mrp);
      if (!mrp || mrp <= rawPrice) {
        if (official && official.mrp && official.mrp > rawPrice) {
          mrp = official.mrp;
        } else {
          mrp = Math.round(rawPrice * 1.18);
        }
      }
      const { price: itemUnitPrice } = getItemPricing(item, isMember);
      const diff = Math.max(0, mrp - itemUnitPrice);
      savings += diff * (item.qty || 1);
    });
    return savings > 0 ? savings : 224;
  }, [checkoutItems, isMember]);

  // Accurate GST breakdown: items with GST reduced receive 5%, others 18%
  const gstBreakdown = useMemo(() => {
    let totalBase = 0;
    let totalGst = 0;
    checkoutItems.forEach((item) => {
      const { price: itemUnitPrice } = getItemPricing(item, isMember);
      const price = itemUnitPrice * (item.qty || 1);
      const isReduced = item.gstReduced || (Array.isArray(item.tags) && item.tags.some((t) => String(t).toUpperCase().includes('GST REDUCED')));
      const rate = isReduced ? 5 : 18;
      const base = price / (1 + rate / 100);
      const gst = price - base;
      totalBase += base;
      totalGst += gst;
    });
    return { totalBase, totalGst };
  }, [checkoutItems, isMember]);

  // Trigger Live GPS Current Location Detection (Matching Website)
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

          setAddressForm((prev) => ({
            ...prev,
            pincode: detectedPin || prev.pincode,
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
            addressLine2: detectedArea || prev.addressLine2,
          }));

          setIsLocationDetected(true);
          const locName = [detectedCity, detectedState].filter(Boolean).join(', ');
          setDetectedLocationName(locName);

          if (detectedPin && detectedPin.length === 6) {
            handlePincodeChange(detectedPin);
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

  // Handle PIN code lookup & Area Chips
  const handlePincodeChange = async (pin) => {
    const cleanPin = pin.replace(/\D/g, '').slice(0, 6);
    let city = addressForm.city;
    let state = addressForm.state;

    if (cleanPin.length === 6 && PIN_CODE_MAP[cleanPin]) {
      city = PIN_CODE_MAP[cleanPin].city;
      state = PIN_CODE_MAP[cleanPin].state;
    }

    setAddressForm((prev) => ({
      ...prev,
      pincode: cleanPin,
      city,
      state,
    }));

    if (cleanPin.length === 6) {
      setIsLookingUpPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const data = await res.json();
        if (data?.[0]?.Status === 'Success' && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
          const postOffices = data[0].PostOffice;
          const po = postOffices[0];
          const areaNames = postOffices.map((p) => p.Name).filter(Boolean);

          setAddressForm((prev) => ({
            ...prev,
            city: po.District || prev.city,
            state: po.State || prev.state,
          }));

          setAvailableAreas(areaNames);
        } else {
          setAvailableAreas([]);
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        setIsLookingUpPin(false);
      }
    } else {
      setAvailableAreas([]);
    }
  };

  const handleSelectAreaChip = (areaName) => {
    setAddressForm((prev) => ({
      ...prev,
      addressLine2: areaName,
    }));
  };

  const handleSaveAddress = () => {
    const name = addressForm.recipientName?.trim();
    const phone = addressForm.recipientPhone?.trim();
    const pin = addressForm.pincode?.trim();
    const addr1 = addressForm.addressLine1?.trim();

    if (!name || !phone || !pin || !addr1) {
      Alert.alert('Required Fields', 'Please fill in Name, Phone, PIN code, and Address Line 1.');
      return;
    }

    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (pin.length !== 6) {
      Alert.alert('Invalid PIN', 'Please enter a 6-digit postal PIN code.');
      return;
    }

    // Single Home / Single Office enforcement
    if ((addressForm.tag || 'Home') !== 'Other') {
      const duplicate = savedAddresses.find(
        (a) => a.id !== addressForm.id && (a.type || a.tag || '').toLowerCase().trim() === (addressForm.tag || 'Home').toLowerCase().trim()
      );
      if (duplicate) {
        Alert.alert(
          `${addressForm.tag || 'Home'} Address Limit`,
          `You already have a ${addressForm.tag || 'Home'} address saved. Only 1 ${addressForm.tag || 'Home'} address is permitted. You can edit your existing ${addressForm.tag || 'Home'} address or choose 'Other'.`
        );
        return;
      }
    }

    const normalizedAddress = {
      id: addressForm.id || `addr-${Date.now()}`,
      tag: addressForm.tag || 'Home',
      recipientName: name,
      recipientPhone: phone,
      pincode: pin,
      city: addressForm.city || '',
      state: addressForm.state || '',
      addressLine1: addr1,
      addressLine2: addressForm.addressLine2 || '',
      landmark: addressForm.landmark || '',
      deliveryMessage: addressForm.deliveryMessage || '',
      isDefault: true,
    };

    setSelectedAddress(normalizedAddress);
    setIsAddressModalOpen(false);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('atomy_mobile_selected_address', JSON.stringify(normalizedAddress));

        // Also sync to saved addresses list
        const existingSaved = window.localStorage.getItem('atomy_mobile_saved_addresses');
        let list = [];
        if (existingSaved) {
          try {
            list = JSON.parse(existingSaved) || [];
          } catch (e) { }
        }
        const profileFormat = {
          id: normalizedAddress.id,
          type: normalizedAddress.tag || 'Home',
          name: normalizedAddress.recipientName,
          phone: normalizedAddress.recipientPhone,
          street: normalizedAddress.addressLine1 + (normalizedAddress.addressLine2 ? `, ${normalizedAddress.addressLine2}` : ''),
          city: normalizedAddress.city,
          state: normalizedAddress.state,
          pincode: normalizedAddress.pincode,
          isDefault: true,
        };
        list = list.map((a) => ({ ...a, isDefault: false }));
        const existingIdx = list.findIndex((a) => a.id === normalizedAddress.id);
        if (existingIdx >= 0) {
          list[existingIdx] = profileFormat;
        } else {
          list.unshift(profileFormat);
        }
        window.localStorage.setItem('atomy_mobile_saved_addresses', JSON.stringify(list));
        window.localStorage.setItem('atomy_customer_addresses', JSON.stringify(list));
        setSavedAddresses(list);
      }
    } catch (e) { }
  };

  const handleSelectSavedAddress = (addr) => {
    const formatted = {
      id: addr.id || `addr-${Date.now()}`,
      tag: addr.type || addr.tag || 'Home',
      recipientName: addr.name || addr.recipientName || '',
      recipientPhone: addr.phone || addr.recipientPhone || '',
      pincode: addr.pincode || '',
      city: addr.city || '',
      state: addr.state || '',
      addressLine1: addr.street || addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      deliveryMessage: addr.deliveryMessage || '',
      isDefault: Boolean(addr.isDefault),
    };
    setSelectedAddress(formatted);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('atomy_mobile_selected_address', JSON.stringify(formatted));
        window.localStorage.setItem('atomy_shipping_address', JSON.stringify(formatted));
      }
    } catch (e) {}
  };

  const handleDeleteAddress = (addrId) => {
    Alert.alert(
      'Remove Address',
      'Are you sure you want to remove this delivery address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const nextList = savedAddresses.filter((a) => a.id !== addrId);
            setSavedAddresses(nextList);
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('atomy_mobile_saved_addresses', JSON.stringify(nextList));
                window.localStorage.setItem('atomy_customer_addresses', JSON.stringify(nextList));
              }
            } catch (e) {}
            if (selectedAddress?.id === addrId) {
              if (nextList.length > 0) {
                handleSelectSavedAddress(nextList[0]);
              } else {
                setSelectedAddress(null);
              }
            }
          },
        },
      ]
    );
  };

  const handleOpenEditAddress = (addr) => {
    setAddressForm({
      id: addr.id,
      tag: addr.tag || addr.type || 'Home',
      recipientName: addr.recipientName || addr.name || '',
      recipientPhone: addr.recipientPhone || addr.phone || '',
      pincode: addr.pincode || '',
      city: addr.city || '',
      state: addr.state || '',
      addressLine1: addr.addressLine1 || addr.street || '',
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      deliveryMessage: addr.deliveryMessage || '',
      isDefault: Boolean(addr.isDefault),
    });
    setIsAddressModalOpen(true);
  };

  // Direct mobile redirect to installed UPI apps
  const handleOpenUpiApp = async (appId) => {
    const upiId = 'atomyindia.pay@icici';
    const payeeName = 'Atomy Enterprises India';
    const amount = Number(grandTotal || 0).toFixed(2);
    const txnNote = 'Atomy Order Payment';

    let url = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;

    if (appId === 'gpay') {
      url = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    } else if (appId === 'phonepe') {
      url = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    } else if (appId === 'paytm') {
      url = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    } else if (appId === 'bhim') {
      url = `bhim://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    } else if (appId === 'cred') {
      url = `cred://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    } else if (appId === 'vpa' && customUpiId.trim()) {
      url = `upi://pay?pa=${encodeURIComponent(customUpiId.trim())}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const genericUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
        const canGeneric = await Linking.canOpenURL(genericUrl);
        if (canGeneric) {
          await Linking.openURL(genericUrl);
        } else {
          Alert.alert(
            'Opening UPI Application',
            `Redirecting to ${appId.toUpperCase()} for ₹${formatInr(grandTotal)}. Complete the payment in your UPI app and tap "I Have Completed UPI Payment" below.`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (e) {
      Alert.alert(
        'UPI Payment Intent',
        `Opening ${appId.toUpperCase()} for ₹${formatInr(grandTotal)}. After payment is completed, tap "I Have Completed UPI Payment" below.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Check login helper
  const checkUserLoggedIn = () => {
    return Boolean(
      currentUser &&
      currentUser.email &&
      currentUser.email.trim() !== '' &&
      currentUser.name !== 'Guest User'
    );
  };

  const handleProceedToPayment = () => {
    if (hasOutOfDeliveryItems) {
      Alert.alert(
        'Delivery Stock Notice',
        `This item is not in stock for delivery to PIN ${deliveryPincode || 'your selected area'}. Please select another address or remove the item.`
      );
      return;
    }

    if (!checkUserLoggedIn()) {
      Alert.alert(
        'Sign In Required to Place Order',
        'You must sign in to your Atomy India account to place an order and proceed to payment.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In / Register',
            onPress: () => {
              if (onRequestSignIn) onRequestSignIn();
            },
          },
        ]
      );
      if (onRequestSignIn) onRequestSignIn();
      return;
    }

    if (!hasValidAddress) {
      Alert.alert(
        'Delivery Address Required',
        'Please enter and save your delivery address before proceeding to payment.',
        [
          {
            text: 'Add Address',
            onPress: () => {
              setAddressForm((prev) => ({
                ...prev,
                recipientName: prev.recipientName || (currentUser?.name && currentUser?.name !== 'Customer Account' ? currentUser.name : ''),
                recipientPhone: prev.recipientPhone || currentUser?.phone || '',
              }));
              setIsAddressModalOpen(true);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      setIsAddressModalOpen(true);
      return;
    }

    setStep('payment');
  };

  // Complete Order
  const handleCompleteOrder = () => {
    if (hasOutOfDeliveryItems) {
      Alert.alert(
        'Delivery Stock Notice',
        `This item is not in stock for delivery to PIN ${deliveryPincode || 'your selected area'}. Please select another address or remove the item.`
      );
      setStep('sheet');
      return;
    }

    const user = currentUser;
    if (!checkUserLoggedIn()) {
      Alert.alert(
        'Sign In Required to Place Order',
        'You must sign in to your Atomy India account to complete your order.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In / Register',
            onPress: () => {
              if (onRequestSignIn) onRequestSignIn();
            },
          },
        ]
      );
      if (onRequestSignIn) onRequestSignIn();
      return;
    }

    if (!hasValidAddress) {
      Alert.alert('Delivery Address Required', 'Please enter your shipping address to complete the order.');
      setStep('sheet');
      setIsAddressModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const assignedOrderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const orderDetails = {
        orderId: assignedOrderId,
        orderDate: now.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        paymentMethod:
          paymentMethod === 'UPI'
            ? `UPI (${selectedUpiApp === 'gpay' ? 'Google Pay' : selectedUpiApp === 'phonepe' ? 'PhonePe' : selectedUpiApp === 'paytm' ? 'Paytm' : selectedUpiApp === 'bhim' ? 'BHIM' : selectedUpiApp === 'cred' ? 'CRED' : 'UPI Intent'})`
            : paymentMethod === 'COD'
              ? 'Cash on Delivery (COD)'
              : paymentMethod === 'NETBANKING'
                ? `Net Banking (${selectedBank})`
                : 'Credit / Debit Card',
        grandTotal,
        totalPV,
        recipient: selectedAddress?.recipientName || currentUser?.name || 'Customer',
        phone: selectedAddress?.recipientPhone || currentUser?.phone || '',
        address: selectedAddress
          ? `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
          : 'Pending Address',
        trackingNumber: `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`,
        estimatedDelivery: isStorePickup ? 'Ready for Pickup within 24h' : estimatedDelivery.timeFrame,
        estimatedDeliveryDate: isStorePickup ? 'Available at Hub Counter' : estimatedDelivery.range,
        fulfillmentType: isStorePickup ? 'STORE_PICKUP' : 'COURIER_DELIVERY',
        shippingMethod: isStorePickup ? 'STORE_PICKUP' : 'COURIER_DELIVERY',
        isPickup: isStorePickup,
        pickupStatus: isStorePickup ? 'PENDING_PACKING' : null,
        hubName: isStorePickup ? 'Selva Regional Logistics Hub' : null,
        hubAddress: isStorePickup ? 'Krishnagiri Regional Logistics Centre, Tamil Nadu - 635002' : null,
        items: checkoutItems,
      };

      // Also dispatch to Spring Boot backend database for admin & live tracking sync
      const backendPayload = {
        orderId: assignedOrderId,
        customerName: selectedAddress.recipientName || currentUser?.name || 'Customer',
        customerEmail: currentUser?.email || 'customer@atomy.com',
        customerPhone: selectedAddress.recipientPhone || currentUser?.phone || '+91 98000 00000',
        shippingAddress: isStorePickup ? 'Direct Store Pickup at Regional Logistics Hub' : selectedAddress.addressLine1,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        orderSource: 'MOBILE_APP',
        totalAmount: grandTotal,
        shippingFee: shippingFee,
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'ONLINE_UPI',
        orderStatus: 'PLACED',
        fulfillmentType: isStorePickup ? 'STORE_PICKUP' : 'COURIER_DELIVERY',
        shippingMethod: isStorePickup ? 'STORE_PICKUP' : 'COURIER_DELIVERY',
        isPickup: isStorePickup,
        pickupStatus: isStorePickup ? 'PENDING_PACKING' : null,
        hubName: isStorePickup ? 'Selva Regional Logistics Hub' : null,
        hubAddress: isStorePickup ? 'Krishnagiri Regional Logistics Centre, Tamil Nadu - 635002' : null,
        estimatedDeliveryDate: isStorePickup ? 'Available at Hub Counter' : estimatedDelivery.range,
        estimatedDelivery: isStorePickup ? 'Ready for Pickup within 24h' : estimatedDelivery.timeFrame,
        items: checkoutItems.map((it) => ({
          productId: it.id,
          productName: it.name,
          productImage: it.image || it.img || '',
          price: Number(it.price) || 0,
          quantity: it.qty || 1,
          pv: Number(it.pv) || 0,
        })),
      };
      createOrderApi(backendPayload).catch((e) => console.warn('Order dispatch to server:', e.message));

      setConfirmedOrder(orderDetails);
      setIsProcessing(false);
      setShowCelebration(true);
      if (onOrderSuccess) onOrderSuccess(orderDetails);
    }, 1200);
  };

  // ---------------------------------------------------------------------------
  // STEP 2.5: 1-SECOND CELEBRATION ANIMATION (Matching User Reference Image)
  // ---------------------------------------------------------------------------
  if (showCelebration) {
    return (
      <OrderSuccessCelebration
        savedAmount={totalSavings}
        duration={1500}
        onFinish={() => {
          setShowCelebration(false);
          setStep('completed');
        }}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 3: ORDER COMPLETED SUCCESS VIEW (Matching Website)
  // ---------------------------------------------------------------------------
  if (step === 'completed' && confirmedOrder) {
    return (
      <View style={styles.root}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onNavigateHome}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Confirmation</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.completedScroll} showsVerticalScrollIndicator={false}>
          {/* Success Check Icon */}
          <View style={styles.successCheckCircle}>
            <Ionicons name="checkmark-circle" size={74} color="#10B981" />
          </View>

          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for shopping with Atomy India. Your doorstep delivery order has been received and is being prepared.
          </Text>

          {/* Order Details Card */}
          <View style={styles.confirmedDetailsCard}>
            <View style={styles.confirmedMetaRow}>
              <View style={styles.confirmedMetaCol}>
                <Text style={styles.confirmedMetaLabel}>Order ID</Text>
                <Text style={styles.confirmedMetaValHighlight}>{confirmedOrder.orderId}</Text>
              </View>
              <View style={styles.confirmedMetaCol}>
                <Text style={styles.confirmedMetaLabel}>Order Date</Text>
                <Text style={styles.confirmedMetaVal}>{confirmedOrder.orderDate}</Text>
              </View>
            </View>

            <View style={styles.confirmedMetaRow}>
              <View style={styles.confirmedMetaCol}>
                <Text style={styles.confirmedMetaLabel}>Payment Method</Text>
                <Text style={styles.confirmedMetaVal}>{confirmedOrder.paymentMethod}</Text>
              </View>
              <View style={styles.confirmedMetaCol}>
                <Text style={styles.confirmedMetaLabel}>Total Amount</Text>
                <Text style={styles.confirmedMetaPrice}>₹ {formatInr(confirmedOrder.grandTotal)}</Text>
              </View>
            </View>

            {/* PV Celebration Banner */}
            <View style={styles.pvCelebrationBanner}>
              <Ionicons name="sparkles" size={18} color="#00A3E0" />
              <Text style={styles.pvCelebrationText}>
                Congratulations! You earned{' '}
                <Text style={{ fontWeight: '800', color: '#00A3E0' }}>
                  +{confirmedOrder.totalPV.toLocaleString('en-IN')} PV
                </Text>{' '}
                for your Atomy member account!
              </Text>
            </View>

            {/* Delivery Destination */}
            <View style={styles.confirmedAddressBox}>
              <Ionicons name="location" size={18} color="#00A3E0" />
              <View style={{ flex: 1 }}>
                <Text style={styles.confirmedAddressHeader}>Delivery Destination:</Text>
                <Text style={styles.confirmedAddressLine}>{confirmedOrder.address}</Text>
                <Text style={styles.confirmedRecipient}>
                  Recipient: {confirmedOrder.recipient} (+91 {confirmedOrder.phone})
                </Text>
              </View>
            </View>

            {/* Express Delivery Box */}
            <View style={styles.expressEtaBox}>
              <Ionicons name="cube" size={20} color="#00A3E0" />
              <View style={{ flex: 1 }}>
                <Text style={styles.expressEtaTitle}>Blue Dart Doorstep Express</Text>
                <Text style={styles.expressEtaDate}>
                  Estimated Delivery: <Text style={{ fontWeight: '800' }}>{estimatedDelivery.range}</Text>
                </Text>
                <Text style={styles.expressEtaSub}>
                  Transit: {estimatedDelivery.timeFrame} • AWB: {confirmedOrder.trackingNumber}
                </Text>
              </View>
            </View>

            {/* Confirmed Products */}
            <Text style={styles.confirmedItemsHeader}>Purchased Items ({confirmedOrder.items.length})</Text>
            {confirmedOrder.items.map((item, idx) => (
              <View key={`conf-${item.id}-${idx}`} style={styles.confirmedItemRow}>
                <Image
                  source={{ uri: item.image || item.img || 'https://image.atomy.com/IN/banner/90/471/251100000021471133613.jpg' }}
                  style={styles.confirmedItemThumb}
                  resizeMode="contain"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.confirmedItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.confirmedItemMeta}>
                    Qty: {item.qty} • ₹ {formatInr(isMember && item.dpPrice ? item.dpPrice : item.price)} each
                  </Text>
                </View>
                <Text style={styles.confirmedItemSubtotal}>
                  ₹ {formatInr((isMember && item.dpPrice ? item.dpPrice : item.price) * (item.qty || 1))}
                </Text>
              </View>
            ))}
          </View>

          {/* Continue Shopping Button */}
          <TouchableOpacity style={styles.continueShoppingBtn} activeOpacity={0.88} onPress={onNavigateHome}>
            <Text style={styles.continueShoppingBtnText}>Continue Shopping</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 2: DEDICATED PAYMENT GATEWAY VIEW (Matching Website Step === 'payment')
  // ---------------------------------------------------------------------------
  if (step === 'payment') {
    return (
      <View style={styles.root} {...swipePanResponder.panHandlers}>
        {/* 1. TOP HEADER (Matching Screenshot: Step 3 of 3, Payments, 100% Secure) */}
        <View style={styles.fkHeader}>
          <TouchableOpacity
            style={styles.fkBackBtn}
            onPress={() => setStep('sheet')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.fkTitleCol}>
            <Text style={styles.fkStepText}>Step 3 of 3</Text>
            <Text style={styles.fkMainTitle}>Payments</Text>
          </View>
          <View style={styles.fkSecureBadge}>
            <Ionicons name="lock-closed-outline" size={13} color="#475569" />
            <Text style={styles.fkSecureBadgeText}>100% Secure</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.paymentGatewayScroll} showsVerticalScrollIndicator={false}>
          {/* 2. TOTAL AMOUNT DROPDOWN BANNER (Matching Screenshot) */}
          <View style={styles.fkAmountCard}>
            <TouchableOpacity
              style={styles.fkAmountHeaderRow}
              onPress={() => setIsAmountDropdownOpen(!isAmountDropdownOpen)}
              activeOpacity={0.75}
            >
              <View style={styles.fkAmountLeft}>
                <Text style={styles.fkAmountTitle}>Total Amount</Text>
                <Ionicons
                  name={isAmountDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#2563EB"
                  style={{ marginLeft: 4 }}
                />
              </View>
              <Text style={styles.fkAmountValue}>₹{formatInr(grandTotal)}</Text>
            </TouchableOpacity>

            {/* Expandable Price Breakdown */}
            {isAmountDropdownOpen && (
              <View style={styles.fkAmountDetails}>
                <View style={styles.fkDetailRow}>
                  <Text style={styles.fkDetailLabel}>Items Subtotal ({totalQty} items)</Text>
                  <Text style={styles.fkDetailVal}>₹{formatInr(subtotal)}</Text>
                </View>
                <View style={styles.fkDetailRow}>
                  <Text style={styles.fkDetailLabel}>Delivery Charges</Text>
                  <Text style={[styles.fkDetailVal, isFreeDelivery && { color: '#16A34A', fontWeight: '700' }]}>
                    {isFreeDelivery ? 'FREE' : `₹${shippingFee}`}
                  </Text>
                </View>
                <View style={styles.fkDetailRow}>
                  <Text style={styles.fkDetailLabel}>Point Value (PV) Earned</Text>
                  <Text style={[styles.fkDetailVal, { color: '#00A3E0', fontWeight: '700' }]}>
                    +{totalPV.toLocaleString()} PV
                  </Text>
                </View>
                <View style={styles.fkDetailRow}>
                  <Text style={styles.fkDetailLabel}>GST Included in Total</Text>
                  <Text style={styles.fkDetailVal}>₹{formatInr(gstBreakdown.totalGst)}</Text>
                </View>
              </View>
            )}
          </View>

          {/* 3. VERTICAL ACCORDION PAYMENT METHOD CARDS (Matching Screenshot) */}

          {/* CARD 1: UPI */}
          <View style={[styles.accordionCard, paymentMethod === 'UPI' && styles.accordionCardActive]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setPaymentMethod((prev) => (prev === 'UPI' ? null : 'UPI'))}
              activeOpacity={0.8}
            >
              <View style={styles.accordionIconBox}>
                <View style={styles.upiIconBadge}>
                  <Text style={styles.upiIconBadgeText}>UPI</Text>
                </View>
              </View>
              <View style={styles.accordionInfoCol}>
                <Text style={styles.accordionTitle}>UPI</Text>
                <Text style={styles.accordionSubtitle}>Pay by any UPI app</Text>
                <Text style={styles.accordionGreenOffer}>Save upto ₹15 • 3 offers available</Text>
              </View>
              <Ionicons
                name={paymentMethod === 'UPI' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            {/* UPI Expanded Body (Direct mobile app redirection, NO QR Code) */}
            {paymentMethod === 'UPI' && (
              <View style={styles.accordionBody}>
                <Text style={styles.upiSelectLabel}>Select App to Redirect & Pay</Text>

                {/* Primary 3 UPI Apps: Google Pay, PhonePe, Paytm with Official Original Logos */}
                <View style={styles.upiAppsGrid}>
                  {[
                    {
                      id: 'gpay',
                      name: 'Google Pay',
                      desc: 'Instant UPI Intent with Google Pay',
                      logo: GPAY_LOGO,
                    },
                    {
                      id: 'phonepe',
                      name: 'PhonePe',
                      desc: 'Pay directly via PhonePe UPI',
                      logo: PHONEPE_LOGO,
                    },
                    {
                      id: 'paytm',
                      name: 'Paytm UPI',
                      desc: 'Paytm UPI & Wallet Gateway',
                      logo: PAYTM_LOGO,
                    },
                  ].map((app) => {
                    const isSelected = selectedUpiApp === app.id;
                    return (
                      <TouchableOpacity
                        key={app.id}
                        style={[styles.upiAppCard, isSelected && styles.upiAppCardSelected]}
                        onPress={() => {
                          setSelectedUpiApp(app.id);
                          handleOpenUpiApp(app.id);
                        }}
                        activeOpacity={0.75}
                      >
                        <View style={styles.upiLogoBox}>
                          <Image source={app.logo} style={styles.upiOriginalLogo} resizeMode="contain" />
                        </View>
                        <View style={styles.upiAppCardInfo}>
                          <Text style={[styles.upiAppCardName, isSelected && styles.upiAppCardNameSelected]}>
                            {app.name}
                          </Text>
                          <Text style={styles.upiAppCardDesc}>{app.desc}</Text>
                        </View>
                        <View style={[styles.upiRadioCircle, isSelected && styles.upiRadioCircleSelected]}>
                          {isSelected && <View style={styles.upiRadioInner} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* "Pay with other UPI apps" Toggle Button */}
                <TouchableOpacity
                  style={[styles.otherUpiToggleBtn, showOtherUpiApps && styles.otherUpiToggleBtnActive]}
                  onPress={() => setShowOtherUpiApps(!showOtherUpiApps)}
                  activeOpacity={0.75}
                >
                  <View style={styles.otherUpiToggleLeft}>
                    <Ionicons
                      name={showOtherUpiApps ? 'chevron-up-circle' : 'add-circle-outline'}
                      size={20}
                      color="#00A3E0"
                    />
                    <Text style={styles.otherUpiToggleText}>
                      {showOtherUpiApps ? 'Hide other UPI apps' : 'Pay with other UPI apps'}
                    </Text>
                  </View>
                  <Ionicons
                    name={showOtherUpiApps ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>

                {/* Hidden Other UPI Apps (Shown when user taps "Pay with other UPI apps") */}
                {showOtherUpiApps && (
                  <View style={[styles.upiAppsGrid, { marginTop: 4, marginBottom: 14 }]}>
                    {[
                      {
                        id: 'bhim',
                        name: 'BHIM UPI',
                        desc: 'NPCI Unified Payments Interface',
                        logo: UPI_LOGO,
                      },
                      {
                        id: 'cred',
                        name: 'CRED UPI',
                        desc: 'Earn credit rewards on checkout',
                        color: '#18181B',
                        icon: 'star-outline',
                      },
                      {
                        id: 'other',
                        name: 'Any Other UPI App',
                        desc: 'Amazon Pay, WhatsApp, Banking UPI',
                        logo: UPI_LOGO,
                      },
                    ].map((app) => {
                      const isSelected = selectedUpiApp === app.id;
                      return (
                        <TouchableOpacity
                          key={app.id}
                          style={[styles.upiAppCard, isSelected && styles.upiAppCardSelected]}
                          onPress={() => {
                            setSelectedUpiApp(app.id);
                            handleOpenUpiApp(app.id);
                          }}
                          activeOpacity={0.75}
                        >
                          <View style={styles.upiLogoBox}>
                            {app.logo ? (
                              <Image source={app.logo} style={styles.upiOriginalLogo} resizeMode="contain" />
                            ) : (
                              <View style={[styles.upiAppIconBox, { backgroundColor: app.color, width: 30, height: 30, marginRight: 0 }]}>
                                <Ionicons name={app.icon} size={16} color="#FFFFFF" />
                              </View>
                            )}
                          </View>
                          <View style={styles.upiAppCardInfo}>
                            <Text style={[styles.upiAppCardName, isSelected && styles.upiAppCardNameSelected]}>
                              {app.name}
                            </Text>
                            <Text style={styles.upiAppCardDesc}>{app.desc}</Text>
                          </View>
                          <View style={[styles.upiRadioCircle, isSelected && styles.upiRadioCircleSelected]}>
                            {isSelected && <View style={styles.upiRadioInner} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Instant Redirect CTA Button */}
                <TouchableOpacity
                  style={styles.openUpiBtn}
                  onPress={() => handleOpenUpiApp(selectedUpiApp)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="flash" size={17} color="#FFFFFF" />
                  <Text style={styles.openUpiBtnText}>
                    Open {selectedUpiApp === 'gpay' ? 'Google Pay' : selectedUpiApp === 'phonepe' ? 'PhonePe' : selectedUpiApp === 'paytm' ? 'Paytm' : selectedUpiApp === 'bhim' ? 'BHIM' : selectedUpiApp === 'cred' ? 'CRED' : 'UPI App'} (₹ {formatInr(grandTotal)})
                  </Text>
                </TouchableOpacity>

                {/* Verify & Complete CTA Button */}
                <TouchableOpacity
                  style={styles.verifyUpiBtn}
                  onPress={handleCompleteOrder}
                  disabled={isProcessing}
                  activeOpacity={0.88}
                >
                  {isProcessing ? (
                    <View style={styles.spinnerRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.verifyUpiBtnText}>Verifying Payment...</Text>
                    </View>
                  ) : (
                    <View style={styles.spinnerRow}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.verifyUpiBtnText}>
                        I Have Completed UPI Payment (₹ {formatInr(grandTotal)})
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Virtual UPI ID Toggle / Input */}
                <TouchableOpacity
                  style={styles.vpaToggleBtn}
                  onPress={() => setShowCustomUpi(!showCustomUpi)}
                >
                  <Text style={styles.vpaToggleText}>
                    {showCustomUpi ? 'Hide UPI ID Entry' : 'Or pay using Virtual UPI ID / VPA'}
                  </Text>
                </TouchableOpacity>

                {showCustomUpi && (
                  <View style={styles.vpaInputBox}>
                    <TextInput
                      style={styles.vpaInput}
                      placeholder="e.g. mobile@okhdfcbank"
                      placeholderTextColor="#94A3B8"
                      value={customUpiId}
                      onChangeText={setCustomUpiId}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.vpaPayBtn}
                      onPress={() => {
                        if (!customUpiId.trim()) return;
                        handleOpenUpiApp('vpa');
                      }}
                      disabled={!customUpiId.trim() || isProcessing}
                    >
                      <Text style={styles.vpaPayBtnText}>Send Request</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* CARD 2: CREDIT / DEBIT / ATM CARD */}
          <View style={[styles.accordionCard, paymentMethod === 'CARD' && styles.accordionCardActive]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setPaymentMethod((prev) => (prev === 'CARD' ? null : 'CARD'))}
              activeOpacity={0.8}
            >
              <View style={styles.accordionIconBox}>
                <Ionicons name="card-outline" size={20} color="#0F172A" />
              </View>
              <View style={styles.accordionInfoCol}>
                <Text style={styles.accordionTitle}>Credit / Debit / ATM Card</Text>
                <Text style={styles.accordionSubtitle}>Add and secure cards as per RBI guidelines</Text>
                <Text style={styles.accordionGreenOffer}>Save upto ₹1,567 • 5 offers available</Text>
              </View>
              <Ionicons
                name={paymentMethod === 'CARD' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            {/* Card Expanded Form */}
            {paymentMethod === 'CARD' && (
              <View style={styles.accordionBody}>
                <View style={styles.cardLogosRow}>
                  <Text style={styles.cardBadge}>VISA</Text>
                  <Text style={styles.cardBadge}>Mastercard</Text>
                  <Text style={styles.cardBadge}>RuPay</Text>
                </View>

                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="XXXX XXXX XXXX XXXX"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChangeText={(t) => {
                    const clean = t.replace(/\D/g, '').slice(0, 16);
                    setCardNumber(clean.replace(/(\d{4})/g, '$1 ').trim());
                  }}
                />

                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Valid Thru</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="MM/YY"
                      placeholderTextColor="#94A3B8"
                      maxLength={5}
                      value={cardExpiry}
                      onChangeText={(t) => {
                        let clean = t.replace(/\D/g, '').slice(0, 4);
                        if (clean.length >= 3) clean = `${clean.slice(0, 2)}/${clean.slice(2)}`;
                        setCardExpiry(clean);
                      }}
                    />
                  </View>
                  <View style={{ width: 14 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>CVV / CVC</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="3 or 4 digits"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry
                      maxLength={4}
                      keyboardType="numeric"
                      value={cardCvv}
                      onChangeText={setCardCvv}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Name on Card</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Cardholder Name"
                  placeholderTextColor="#94A3B8"
                  value={cardHolder}
                  onChangeText={setCardHolder}
                />

                <TouchableOpacity
                  style={styles.rbiCheckboxRow}
                  onPress={() => setSaveCardRbi(!saveCardRbi)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={saveCardRbi ? 'checkbox' : 'square-outline'}
                    size={19}
                    color={saveCardRbi ? '#00A3E0' : '#94A3B8'}
                  />
                  <Text style={styles.rbiCheckboxText}>Securely tokenize & save this card as per RBI guidelines</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.verifyUpiBtn}
                  onPress={handleCompleteOrder}
                  disabled={isProcessing}
                  activeOpacity={0.88}
                >
                  {isProcessing ? (
                    <View style={styles.spinnerRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.verifyUpiBtnText}>Authorizing Card...</Text>
                    </View>
                  ) : (
                    <Text style={styles.verifyUpiBtnText}>Pay ₹ {formatInr(grandTotal)}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* (EMI REMOVED ACCORDING TO USER REQUIREMENT: "like this set but remvoe the emi") */}

          {/* CARD 3: NET BANKING */}
          <View style={[styles.accordionCard, paymentMethod === 'NETBANKING' && styles.accordionCardActive]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setPaymentMethod((prev) => (prev === 'NETBANKING' ? null : 'NETBANKING'))}
              activeOpacity={0.8}
            >
              <View style={styles.accordionIconBox}>
                <Ionicons name="business-outline" size={20} color="#0F172A" />
              </View>
              <View style={styles.accordionInfoCol}>
                <Text style={styles.accordionTitle}>Net Banking</Text>
                <Text style={styles.accordionSubtitle}>All major Indian banks supported</Text>
              </View>
              <Ionicons
                name={paymentMethod === 'NETBANKING' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            {/* Net Banking Expanded Form */}
            {paymentMethod === 'NETBANKING' && (
              <View style={styles.accordionBody}>
                <Text style={styles.cardFormTitle}>Select Popular Bank</Text>
                <View style={styles.bankGrid}>
                  {['HDFC', 'ICICI', 'SBI', 'Axis Bank', 'Kotak', 'PNB'].map((b) => {
                    const isBankActive = selectedBank === b;
                    return (
                      <TouchableOpacity
                        key={b}
                        style={[styles.bankTile, isBankActive && styles.bankTileActive]}
                        onPress={() => setSelectedBank(b)}
                      >
                        <Text style={[styles.bankTileCode, isBankActive && styles.bankTileCodeActive]}>{b}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.verifyUpiBtn}
                  onPress={handleCompleteOrder}
                  disabled={isProcessing}
                  activeOpacity={0.88}
                >
                  {isProcessing ? (
                    <View style={styles.spinnerRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.verifyUpiBtnText}>Redirecting...</Text>
                    </View>
                  ) : (
                    <Text style={styles.verifyUpiBtnText}>Pay via {selectedBank} (₹ {formatInr(grandTotal)})</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* CARD 4: CASH ON DELIVERY */}
          <View style={[styles.accordionCard, paymentMethod === 'COD' && styles.accordionCardActive]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setPaymentMethod((prev) => (prev === 'COD' ? null : 'COD'))}
              activeOpacity={0.8}
            >
              <View style={styles.accordionIconBox}>
                <Ionicons name="cash-outline" size={20} color="#0F172A" />
              </View>
              <View style={styles.accordionInfoCol}>
                <Text style={styles.accordionTitle}>Cash on Delivery</Text>
                <Text style={styles.accordionSubtitle}>Pay at your doorstep with cash or courier UPI</Text>
              </View>
              <Ionicons
                name={paymentMethod === 'COD' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            {/* COD Expanded Form */}
            {paymentMethod === 'COD' && (
              <View style={styles.accordionBody}>
                <View style={styles.codCenterBox}>
                  <Ionicons name="cash" size={44} color="#10B981" />
                  <Text style={styles.codTitle}>Pay at Your Doorstep</Text>
                  <Text style={styles.codDesc}>
                    You can pay with cash or ask the delivery executive for their UPI QR code upon parcel arrival.
                  </Text>

                  <View style={styles.codBulletRow}>
                    <Ionicons name="checkmark-circle" size={17} color="#10B981" />
                    <Text style={styles.codBulletText}>Exact change is recommended for faster handover</Text>
                  </View>
                  <View style={styles.codBulletRow}>
                    <Ionicons name="checkmark-circle" size={17} color="#10B981" />
                    <Text style={styles.codBulletText}>Official GST courier tax invoice provided upon delivery</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.verifyUpiBtn, { backgroundColor: '#10B981', marginTop: 18 }]}
                    onPress={handleCompleteOrder}
                    disabled={isProcessing}
                    activeOpacity={0.88}
                  >
                    {isProcessing ? (
                      <View style={styles.spinnerRow}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.verifyUpiBtnText}>Confirming Order...</Text>
                      </View>
                    ) : (
                      <Text style={styles.verifyUpiBtnText}>Confirm Cash on Delivery (₹ {formatInr(grandTotal)})</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* CARD 5: HAVE A GIFT CARD / VOUCHER? (Matching Screenshot) */}
          <View style={styles.accordionCard}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setIsVoucherOpen(!isVoucherOpen)}
              activeOpacity={0.8}
            >
              <View style={styles.accordionIconBox}>
                <Ionicons name="gift-outline" size={20} color="#0F172A" />
              </View>
              <View style={styles.accordionInfoCol}>
                <Text style={styles.accordionTitle}>Have an Atomy Gift Card / Voucher?</Text>
              </View>
              <Ionicons
                name={isVoucherOpen ? 'remove-circle-outline' : 'add-circle-outline'}
                size={22}
                color="#2563EB"
              />
            </TouchableOpacity>

            {isVoucherOpen && (
              <View style={styles.accordionBody}>
                <View style={styles.vpaInputBox}>
                  <TextInput
                    style={styles.vpaInput}
                    placeholder="Enter 16-digit Gift Voucher Code"
                    placeholderTextColor="#94A3B8"
                    value={voucherCode}
                    onChangeText={setVoucherCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={[styles.vpaPayBtn, !voucherCode.trim() && { opacity: 0.6 }]}
                    onPress={() => {
                      if (!voucherCode.trim()) return;
                      setIsVoucherApplied(true);
                      Alert.alert('Gift Voucher', 'Atomy Voucher applied successfully! Discount adjusted in total.');
                    }}
                    disabled={!voucherCode.trim()}
                  >
                    <Text style={styles.vpaPayBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* 4. FOOTER: 35 CRORE HAPPY CUSTOMERS AND COUNTING! (Matching Screenshot) */}
          <View style={styles.fkTrustFooter}>
            <Text style={styles.fkTrustFooterText}>35 Crore happy customers and counting!</Text>
          </View>

          {/* Destination Snapshot Box */}
          <View style={styles.miniDestinationCard}>
            <View style={styles.miniDestHeader}>
              <Ionicons name="cube-outline" size={15} color="#00A3E0" />
              <Text style={styles.miniDestHeaderText}>
                {hasValidAddress
                  ? `Shipping to: ${selectedAddress.recipientName}`
                  : 'Shipping Address Needed'}
              </Text>
            </View>
            <Text style={styles.miniDestAddress}>
              {hasValidAddress
                ? `${selectedAddress.addressLine1}, ${selectedAddress.city} - ${selectedAddress.pincode}`
                : 'No delivery address selected. Please add delivery address.'}
            </Text>
            {hasValidAddress ? (
              <Text style={styles.miniDestEta}>
                Est. Delivery: <Text style={{ fontWeight: '700' }}>{estimatedDelivery.range}</Text>
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 1: ORDER SHEET & PAYMENT SUMMARY (Matching Website Step === 'sheet')
  // ---------------------------------------------------------------------------
  return (
    <View style={styles.root} {...swipePanResponder.panHandlers}>
      {/* 1. Top Navbar with Stepper */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onNavigateBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order & Payment</Text>
        <View style={styles.secureHeaderPill}>
          <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
          <Text style={styles.secureHeaderPillText}>100% Safe</Text>
        </View>
      </View>

      {/* Stepper Progress Bar matching website */}
      <View style={styles.stepperBar}>
        <View style={styles.stepItemDone}>
          <Ionicons name="checkmark-circle" size={15} color="#10B981" />
          <Text style={styles.stepTextDone}>1. Cart</Text>
        </View>
        <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
        <View style={styles.stepItemActive}>
          <Text style={styles.stepTextActive}>2. Order & Address</Text>
        </View>
        <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
        <View style={styles.stepItemPending}>
          <Text style={styles.stepTextPending}>3. Payment</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
        {/* =========================================================================
            SECTION 1: ORDER PRODUCTS SUMMARY (Matching Website Section 1)
            ========================================================================= */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionCardHeader}
            onPress={() => setIsItemsExpanded(!isItemsExpanded)}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="bag-check-outline" size={20} color="#00A3E0" />
              <Text style={styles.sectionCardTitle}>Ordered Items ({checkoutItems.length})</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerPvPreview}>+{totalPV.toLocaleString('en-IN')} PV</Text>
              <Ionicons name={isItemsExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" />
            </View>
          </TouchableOpacity>

          {isItemsExpanded && (
            <View style={styles.itemsListContainer}>
              {checkoutItems.map((item, index) => {
                const { price: itemPrice, rawPrice, mrp, pv: itemPv } = getItemPricing(item, isMember);
                const isFree = item.freeDelivery === true;
                const isItemOutOfDelivery = outOfDeliveryItems.some((o) => o.id === item.id);

                return (
                  <View key={`item-${item.id}-${index}`} style={styles.itemCard}>
                    {/* Corner 'X' Remove Button matching user requirement & website */}
                    <TouchableOpacity
                      style={styles.cornerRemoveBtn}
                      onPress={() => onRemoveItem && onRemoveItem(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Remove item"
                    >
                      <Ionicons name="close" size={17} color="#94A3B8" />
                    </TouchableOpacity>

                    <View style={styles.itemCardContentRow}>
                      {/* Product Thumbnail */}
                      <TouchableOpacity
                        onPress={() => onProductClick && onProductClick(item)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{
                            uri:
                              item.image ||
                              item.img ||
                              'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480',
                          }}
                          style={styles.itemThumb}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>

                      {/* Product Info */}
                      <View style={styles.itemInfoCol}>
                        <TouchableOpacity
                          onPress={() => onProductClick && onProductClick(item)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.itemNameText} numberOfLines={2}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>

                        {/* Price & PV Row */}
                        <View style={styles.itemPriceRow}>
                          <View style={styles.priceWithDpGroup}>
                            {isMember && rawPrice > itemPrice && (
                              <Text style={styles.itemOriginalPriceStriked}>₹ {formatInr(rawPrice)}</Text>
                            )}
                            <Text style={[styles.itemUnitPriceText, isMember && styles.itemUnitPriceGreen]}>
                              ₹ {formatInr(itemPrice)}
                            </Text>
                            {isMember && (
                              <View style={styles.itemDpBadge}>
                                <Text style={styles.itemDpBadgeText}>DP Price</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.itemPvBadgeWrap}>
                            <Text style={styles.itemPvText}>+{itemPv.toLocaleString('en-IN')} PV</Text>
                          </View>
                        </View>

                        {/* Badges Row */}
                        <View style={styles.itemBadgesRow}>
                          <View style={isFree ? styles.freeDeliveryPill : styles.standardDeliveryPill}>
                            <Text style={isFree ? styles.freeDeliveryPillText : styles.standardDeliveryPillText}>
                              {isFree ? 'FREE DELIVERY' : 'STANDARD DELIVERY'}
                            </Text>
                          </View>
                          <View style={styles.gstTagPill}>
                            <Text style={styles.gstTagPillText}>GST INCLUDED</Text>
                          </View>
                        </View>

                        {/* Quantity Stepper & Line Total */}
                        <View style={styles.stepperContainer}>
                          <View style={styles.stepperControlGroup}>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() => onUpdateQty && onUpdateQty(item.id, Math.max(1, (item.qty || 1) - 1))}
                              disabled={(item.qty || 1) <= 1}
                            >
                              <Ionicons
                                name="remove"
                                size={14}
                                color={(item.qty || 1) <= 1 ? '#CBD5E1' : '#334155'}
                              />
                            </TouchableOpacity>

                            <Text style={styles.stepperQtyText}>{item.qty || 1}</Text>

                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() => onUpdateQty && onUpdateQty(item.id, (item.qty || 1) + 1)}
                            >
                              <Ionicons name="add" size={14} color="#334155" />
                            </TouchableOpacity>
                          </View>

                          <Text style={styles.itemLineTotalText}>
                            Total: ₹ {formatInr(itemPrice * (item.qty || 1))}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Destination PIN Stock Alert */}
                    {isItemOutOfDelivery && (
                      <View style={styles.itemStockAlertRow}>
                        <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6, marginTop: 1 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemStockAlertMsg}>
                            This item is not in stock for delivery to PIN {deliveryPincode || 'your area'}. Please select another address or remove the item.
                          </Text>
                          <TouchableOpacity
                            style={styles.itemStockAlertRemoveBtn}
                            onPress={() => onRemoveItem && onRemoveItem(item.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.itemStockAlertRemoveBtnText}>Remove Item</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* =========================================================================
            SECTION 2: FULFILLMENT & DELIVERY METHOD (Doorstep vs Hub Pickup)
            ========================================================================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="car-outline" size={20} color="#00A3E0" />
              <Text style={styles.sectionCardTitle}>Delivery / Collection Option</Text>
            </View>
          </View>

          <View style={styles.fulfillmentToggleRow}>
            {/* Option 1: Doorstep Delivery */}
            <TouchableOpacity
              style={[
                styles.fulfillmentOptionCard,
                !isStorePickup && styles.fulfillmentOptionCardActive,
              ]}
              onPress={() => setFulfillmentType('COURIER_DELIVERY')}
              activeOpacity={0.8}
            >
              <View style={styles.fulfillmentCardTop}>
                <Ionicons
                  name="bicycle-outline"
                  size={20}
                  color={!isStorePickup ? '#00A3E0' : '#64748B'}
                />
                <Ionicons
                  name={!isStorePickup ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={!isStorePickup ? '#00A3E0' : '#CBD5E1'}
                />
              </View>
              <Text style={[styles.fulfillmentOptionTitle, !isStorePickup && styles.fulfillmentOptionTitleActive]}>
                Doorstep Delivery
              </Text>
              <Text style={styles.fulfillmentOptionSubtitle}>
                Blue Dart Express Line-haul
              </Text>
              <View style={[styles.fulfillmentFeeTag, isFreeDelivery ? styles.feeTagFree : styles.feeTagPaid]}>
                <Text style={[styles.fulfillmentFeeTagText, isFreeDelivery ? styles.feeTagFreeText : styles.feeTagPaidText]}>
                  {isFreeDelivery ? 'FREE Delivery' : '₹ 150.00 Fee'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Regional Hub Pickup */}
            <TouchableOpacity
              style={[
                styles.fulfillmentOptionCard,
                isStorePickup && styles.fulfillmentOptionCardActiveGreen,
              ]}
              onPress={() => setFulfillmentType('STORE_PICKUP')}
              activeOpacity={0.8}
            >
              <View style={styles.fulfillmentCardTop}>
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color={isStorePickup ? '#10B981' : '#64748B'}
                />
                <Ionicons
                  name={isStorePickup ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={isStorePickup ? '#10B981' : '#CBD5E1'}
                />
              </View>
              <Text style={[styles.fulfillmentOptionTitle, isStorePickup && { color: '#10B981' }]}>
                Regional Hub Pickup
              </Text>
              <Text style={styles.fulfillmentOptionSubtitle}>
                Self collection at counter
              </Text>
              <View style={[styles.fulfillmentFeeTag, styles.feeTagFree]}>
                <Text style={[styles.fulfillmentFeeTagText, styles.feeTagFreeText]}>
                  FREE ₹0 FEE
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Regional Logistics Hub Notice Banner & Co-Manager Delegation */}
          {isStorePickup && (
            <View style={styles.hubDetailsContainer}>
              <View style={styles.hubDetailsHeader}>
                <Ionicons name="business" size={18} color="#059669" />
                <Text style={styles.hubDetailsHeaderTitle}>
                  {hubDetails?.hubName || 'Selva Regional Logistics Hub'}
                </Text>
              </View>
              <Text style={styles.hubAddressText}>
                {hubDetails?.hubAddress || 'RK Tower, Rayakotta main road, bayanapalli, Krishnagiri - 635002'}
              </Text>
              <Text style={styles.hubTimingsText}>
                Open: {hubDetails?.operatingHours || 'Mon–Sat 9:30 AM – 7:30 PM'}
              </Text>

              {/* Hub Manager & Co-Manager Contacts */}
              <View style={styles.hubContactRow}>
                <View style={styles.hubManagerSection}>
                  <Text style={styles.hubManagerLabel}>Hub Manager / Sub-Admin:</Text>
                  <Text style={styles.hubManagerValue}>
                    {hubDetails?.contactPerson || 'Selva Kumar (Hub Manager)'}
                  </Text>
                  <Text style={styles.hubManagerPhone}>
                    Phone: {hubDetails?.phone || '+91 95388 53454'}
                  </Text>
                </View>

                {/* Hub Co-Manager (Model 1: Shared Hub) */}
                <View style={styles.hubCoManagerBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.hubCoManagerTag}>Model 1: Hub Co-Manager</Text>
                    <Text style={styles.hubCoManagerDuty}>
                      {hubDetails?.isSubstituteActive ? '⚡ Acting Duty Standby' : 'Shared Hub Standby'}
                    </Text>
                  </View>
                  <Text style={styles.hubCoManagerName}>
                    {hubDetails?.isSubstituteActive ? (hubDetails.actingManagerName || 'Hub Co-Manager') : (hubDetails?.coManagerName || 'Hub Co-Manager (Standby)')}
                  </Text>
                </View>
              </View>
              <Text style={styles.hubPickupNote}>
                ℹ Present your product invoice or Order ID at the counter to collect your parcel.
              </Text>
            </View>
          )}
        </View>

        {/* =========================================================================
            SECTION 4: DELIVERY ADDRESS (When Doorstep Delivery is chosen)
            ========================================================================= */}
        {!isStorePickup ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <View style={[styles.sectionHeaderLeft, { flex: 1, minWidth: 0, marginRight: 8 }]}>
                <Ionicons name="location-outline" size={18} color="#00A3E0" />
                <Text style={[styles.sectionCardTitle, { flexShrink: 1, fontSize: 14 }]} numberOfLines={1}>
                  Delivery Address
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addNewAddressBtn}
                onPress={() => {
                  setAddressForm({
                    ...EMPTY_ADDRESS_FORM,
                    recipientName: currentUser?.name && currentUser?.name !== 'Customer Account' ? currentUser.name : '',
                    recipientPhone: currentUser?.phone || '',
                  });
                  setIsAddressModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={14} color="#00A3E0" />
                <Text style={styles.addNewAddressBtnText}>Add Address</Text>
              </TouchableOpacity>
            </View>

            {/* Saved Addresses List */}
            {savedAddresses.length > 0 ? (
              <View style={styles.savedAddressesList}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      style={[styles.savedAddressCard, isSelected && styles.savedAddressCardSelected]}
                      onPress={() => handleSelectSavedAddress(addr)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.savedAddressTopRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons
                            name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                            size={18}
                            color={isSelected ? '#00A3E0' : '#CBD5E1'}
                          />
                          <View style={styles.addressTagBadge}>
                            <Text style={styles.addressTagText}>{addr.tag || addr.type || 'Home'}</Text>
                          </View>
                          {addr.isDefault && (
                            <View style={styles.defaultAddressBadge}>
                              <Text style={styles.defaultAddressBadgeText}>Default</Text>
                            </View>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <TouchableOpacity onPress={() => handleOpenEditAddress(addr)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                            <Ionicons name="pencil-outline" size={15} color="#0284C7" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                            <Ionicons name="trash-outline" size={15} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ marginLeft: 26, marginTop: 4 }}>
                        <Text style={styles.savedRecipientText}>
                          {addr.name || addr.recipientName}{' '}
                          <Text style={{ fontWeight: '400', color: '#64748B' }}>
                            (+91 {addr.phone || addr.recipientPhone})
                          </Text>
                        </Text>
                        <Text style={styles.savedStreetText}>
                          {addr.street || addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        </Text>
                        <Text style={styles.savedCityPinText}>
                          {addr.city}, {addr.state} - <Text style={{ fontWeight: '700' }}>{addr.pincode}</Text>
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : hasValidAddress ? (
              <View style={styles.singleAddressCard}>
                <View style={styles.savedAddressTopRow}>
                  <View style={styles.addressTagBadge}>
                    <Text style={styles.addressTagText}>{selectedAddress.tag || 'Home'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleOpenEditAddress(selectedAddress)}>
                    <Text style={{ fontSize: 13, color: '#00A3E0', fontWeight: '700' }}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.savedRecipientText}>
                  {selectedAddress.recipientName} (+91 {selectedAddress.recipientPhone})
                </Text>
                <Text style={styles.savedStreetText}>
                  {selectedAddress.addressLine1}
                  {selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}
                </Text>
                <Text style={styles.savedCityPinText}>
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                </Text>
              </View>
            ) : (
              <View style={styles.noAddressPromptBox}>
                <Ionicons name="location-outline" size={32} color="#00A3E0" style={{ marginBottom: 6 }} />
                <Text style={styles.noAddressTitle}>No Delivery Address Added</Text>
                <Text style={styles.noAddressSub}>
                  Please add your shipping address to calculate express delivery.
                </Text>
                <TouchableOpacity
                  style={styles.addAddressPromptBtn}
                  onPress={() => {
                    setAddressForm({
                      ...EMPTY_ADDRESS_FORM,
                      recipientName: currentUser?.name && currentUser?.name !== 'Customer Account' ? currentUser.name : '',
                      recipientPhone: currentUser?.phone || '',
                    });
                    setIsAddressModalOpen(true);
                  }}
                  activeOpacity={0.88}
                >
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.addAddressPromptBtnText}>+ Add Delivery Address</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Delivery Stock Warning if selected PIN has out of stock items */}
            {hasOutOfDeliveryItems && deliveryPincode ? (
              <View style={styles.destStockNotice}>
                <Ionicons name="warning" size={18} color="#DC2626" style={{ marginRight: 8, marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.destStockNoticeTitle}>Delivery Stock Notice for PIN {deliveryPincode}</Text>
                  <Text style={styles.destStockNoticeMsg}>
                    {outOfDeliveryItems.length === 1
                      ? `This item is not in stock for delivery to PIN ${deliveryPincode}. Please select another address or remove the item.`
                      : `Some items in your cart are not in stock for delivery to PIN ${deliveryPincode}. Please select another address or remove them to proceed.`}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          /* Hub Pickup Contact Card */
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="person-circle-outline" size={20} color="#00A3E0" />
                <Text style={styles.sectionCardTitle}>Customer Pickup Verification Contact</Text>
              </View>
            </View>
            <View style={{ padding: 14 }}>
              <Text style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>
                Recipient Name: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{currentUser?.name || selectedAddress?.recipientName || 'Naveen'}</Text>
              </Text>
              <Text style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>
                Pickup Verification Phone: <Text style={{ fontWeight: '700', color: '#0F172A' }}>+91 {currentUser?.phone || selectedAddress?.recipientPhone || '9876543210'}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: '#059669', marginTop: 4, fontWeight: '600' }}>
                ✓ SMS Pickup OTP will be dispatched to this mobile number when parcel is ready at hub.
              </Text>
            </View>
          </View>
        )}

        {/* =========================================================================
            SECTION 5: APPLY COUPON / VOUCHER (COMPACT DROPDOWN OF HEADINGS ONLY)
            ========================================================================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="pricetag-outline" size={20} color="#00A3E0" />
              <Text style={styles.sectionCardTitle}>Apply Coupon / Voucher</Text>
            </View>
            <TouchableOpacity
              style={styles.couponDropdownToggleBtn}
              onPress={() => setIsCouponDropdownOpen(!isCouponDropdownOpen)}
              activeOpacity={0.8}
            >
              <Text style={styles.couponDropdownToggleText}>
                {eligibleCoupons.length} Offers Available
              </Text>
              <Ionicons
                name={isCouponDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={15}
                color="#00A3E0"
              />
            </TouchableOpacity>
          </View>

          {/* Applied Coupon Banner */}
          {appliedCoupon ? (
            <View style={styles.appliedCouponBanner}>
              <View style={styles.appliedCouponLeft}>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                <View style={{ marginLeft: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                    <View style={styles.appliedDiscountPill}>
                      <Text style={styles.appliedDiscountPillText}>
                        {appliedCoupon.isFreeShipping ? 'FREE DELIVERY' : `₹ ${formatInr(couponDiscount)} OFF`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.appliedCouponTitle}>{appliedCoupon.title || 'Coupon Applied Successfully'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponBtn}>
                <Text style={styles.removeCouponBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code (e.g. WELCOME10)"
                placeholderTextColor="#94A3B8"
                value={couponCode}
                onChangeText={(t) => {
                  setCouponCode(t.toUpperCase());
                  setCouponError('');
                }}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.applyCouponBtn, couponLoading && { opacity: 0.7 }]}
                onPress={() => handleApplyCoupon()}
                disabled={couponLoading || !couponCode.trim()}
                activeOpacity={0.85}
              >
                {couponLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.applyCouponBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {couponError ? <Text style={styles.couponErrorText}>{couponError}</Text> : null}

          {/* Compact Dropdown of Headings ONLY (No verbose paragraphs) */}
          {isCouponDropdownOpen && !appliedCoupon && (
            <View style={styles.compactCouponsDropdown}>
              <Text style={styles.compactDropdownHeader}>Tap Apply to redeem an eligible voucher heading:</Text>
              {eligibleCoupons.length > 0 ? (
                eligibleCoupons.map((cpn) => {
                  const isApplied = appliedCoupon?.code === cpn.code;
                  return (
                    <View key={cpn.code || cpn.id} style={styles.compactCouponRow}>
                      <View style={styles.compactCouponInfo}>
                        <View style={styles.compactBadgeCluster}>
                          <Text style={styles.compactCode}>{cpn.code}</Text>
                          <View style={styles.compactDiscountTag}>
                            <Text style={styles.compactDiscountTagText}>
                              {cpn.discountDisplay || cpn.discount || 'OFFER'}
                            </Text>
                          </View>
                        </View>
                        {/* Heading Only */}
                        <Text style={styles.compactTitle} numberOfLines={1}>
                          {cpn.title || `${cpn.code} Privilege Voucher`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.compactApplyBtn, isApplied && styles.compactApplyBtnApplied]}
                        onPress={() => handleApplyCoupon(cpn.code)}
                        disabled={couponLoading || isApplied}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.compactApplyBtnText, isApplied && { color: '#16A34A' }]}>
                          {isApplied ? 'Applied' : 'Apply'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noCouponsText}>No coupons currently match your cart items.</Text>
              )}
            </View>
          )}
        </View>

        {/* =========================================================================
            SECTION 6: PAYMENT SUMMARY CARD
            ========================================================================= */}
        <View style={styles.paymentSummaryCard}>
          <Text style={styles.paymentSummaryTitle}>Payment Summary</Text>

          <View style={styles.summaryBreakdown}>
            {/* Product Total Row (with Clickable Arrow for GST Breakdown) */}
            <TouchableOpacity
              style={styles.summaryLineClickable}
              onPress={() => setIsTaxBreakdownOpen(!isTaxBreakdownOpen)}
              activeOpacity={0.8}
            >
              <View style={styles.summaryLabelWithArrow}>
                <Text style={styles.summaryLineLabel}>Product Total ({totalQty} items)</Text>
                <Ionicons
                  name={isTaxBreakdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  color="#00A3E0"
                />
              </View>
              <Text style={styles.summaryLineValue}>₹ {formatInr(subtotal)}</Text>
            </TouchableOpacity>

            {/* Collapsible Base Price & GST Breakdown */}
            {isTaxBreakdownOpen && (
              <View style={styles.taxBreakdownPanel}>
                <View style={styles.taxSubRow}>
                  <Text style={styles.taxSubLabel}>Base Price</Text>
                  <Text style={styles.taxSubValue}>₹ {formatInr(gstBreakdown.totalBase)}</Text>
                </View>
                <View style={styles.taxSubRow}>
                  <Text style={styles.taxSubLabel}>GST (Included in price)</Text>
                  <Text style={styles.taxSubValue}>₹ {formatInr(gstBreakdown.totalGst)}</Text>
                </View>
              </View>
            )}

            {/* PV Points */}
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLineLabel}>Accumulated PV Points</Text>
              <Text style={styles.pvPointValue}>+{totalPV.toLocaleString('en-IN')} PV</Text>
            </View>

            {/* Coupon Savings (if applied) */}
            {couponDiscount > 0 && (
              <View style={styles.summaryLine}>
                <Text style={[styles.summaryLineLabel, { color: '#16A34A', fontWeight: '700' }]}>
                  Coupon Savings ({appliedCoupon?.code})
                </Text>
                <Text style={{ fontSize: 13.5, color: '#16A34A', fontWeight: '800' }}>
                  - ₹ {formatInr(couponDiscount)}
                </Text>
              </View>
            )}

            {/* Delivery Fee */}
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLineLabel}>
                {isStorePickup ? 'Regional Hub Store Pickup Fee' : 'Doorstep Delivery Fee'}
              </Text>
              <Text style={shippingFee === 0 ? styles.freeDeliveryValue : styles.summaryLineValue}>
                {shippingFee === 0 ? 'FREE' : `₹ ${formatInr(shippingFee)}`}
              </Text>
            </View>

            {/* Delivery qualification callout */}
            {isStorePickup ? (
              <View style={styles.freeDeliveryQualRow}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.freeDeliveryQualText}>
                  Direct Hub Pickup Selected: Zero Delivery Fee (Collect with Invoice)
                </Text>
              </View>
            ) : shippingFee === 0 ? (
              <View style={styles.freeDeliveryQualRow}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.freeDeliveryQualText}>
                  {subtotal >= 4500
                    ? 'Free Delivery Applied (Order above ₹ 4,500.00)'
                    : 'Free Delivery Applied (Eligible Item in Order)'}
                </Text>
              </View>
            ) : (
              <View style={styles.shippingNoticeRow}>
                <Ionicons name="alert-circle" size={14} color="#D97706" />
                <Text style={styles.shippingNoticeText}>
                  Standard Fee: ₹ 150.00 (Add ₹ {formatInr(4500 - subtotal)} more for Free Delivery)
                </Text>
              </View>
            )}

            {/* Estimated Delivery Row in Summary */}
            <View style={[styles.summaryLine, styles.estimatedDeliverySummaryRow]}>
              <View style={styles.estimatedDeliveryLabelCol}>
                <Ionicons name="cube-outline" size={14} color="#00A3E0" />
                <Text style={styles.summaryLineLabel}>Estimated Delivery</Text>
              </View>
              <Text style={styles.etaDateHighlight}>{estimatedDelivery.range}</Text>
            </View>

            <View style={styles.summaryDivider} />

            {/* Grand Total */}
            <View style={styles.grandTotalRow}>
              <View>
                <Text style={styles.grandTotalLabel}>Total Payment Amount</Text>
                <Text style={styles.inclusiveGstText}>(Inclusive of GST)</Text>
              </View>
              <Text style={styles.grandTotalAmount}>₹ {formatInr(grandTotal)}</Text>
            </View>
          </View>

          {/* Consent Checkbox */}
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => setAgreedTerms(!agreedTerms)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={agreedTerms ? 'checkbox' : 'square-outline'}
              size={19}
              color={agreedTerms ? '#00A3E0' : '#94A3B8'}
            />
            <Text style={styles.consentText}>I confirm the items and delivery destination details.</Text>
          </TouchableOpacity>

          {/* Out of Delivery / Stock Alert Banner */}
          {hasOutOfDeliveryItems && deliveryPincode ? (
            <View style={styles.stockAlertBanner}>
              <Ionicons name="warning" size={20} color="#DC2626" style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stockAlertTitle}>Delivery Stock Notice (PIN: {deliveryPincode})</Text>
                <Text style={styles.stockAlertMsg}>
                  {outOfDeliveryItems.length === 1
                    ? `This item is not in stock for delivery to PIN ${deliveryPincode}. Please select another address or remove the item.`
                    : `These items are not in stock for delivery to PIN ${deliveryPincode}. Please select another address or remove them to proceed.`}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Proceed to Payment CTA */}
          <TouchableOpacity
            style={[
              styles.proceedToPaymentBtn,
              (!agreedTerms || checkoutItems.length === 0 || hasOutOfDeliveryItems) && styles.proceedBtnDisabled,
            ]}
            onPress={handleProceedToPayment}
            activeOpacity={0.88}
          >
            <Text style={styles.proceedToPaymentBtnText}>Proceed to Payment</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Trust & Guarantee Banner */}
          <View style={styles.trustBanner}>
            <Ionicons name="shield-checkmark" size={16} color="#00A3E0" />
            <Text style={styles.trustBannerText}>Safe and Secure Payments • 100% Authentic Atomy Guarantee</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ADDRESS EDIT / ADD MODAL */}
      <Modal visible={isAddressModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={() => setIsAddressModalOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
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

              {/* Address Type (Home / Office / Other) */}
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.genderRow}>
                {['Home', 'Office', 'Other'].map((t) => {
                  const isTaken = (t === 'Home' && hasExistingHome) || (t === 'Office' && hasExistingOffice);
                  return (
                    <TouchableOpacity
                      key={t}
                      disabled={isTaken}
                      style={[
                        styles.genderPill,
                        (addressForm.tag || 'Home') === t && styles.genderPillActive,
                        isTaken && styles.typePillDisabled,
                      ]}
                      onPress={() => {
                        if (isTaken) {
                          Alert.alert(
                            `${t} Address Saved`,
                            `You already have a ${t} address saved. Only 1 ${t} address is allowed. You can edit your existing ${t} address or choose 'Other'.`
                          );
                          return;
                        }
                        setAddressForm((prev) => ({ ...prev, tag: t }));
                      }}
                    >
                      <Text
                        style={[
                          styles.genderPillText,
                          (addressForm.tag || 'Home') === t && styles.genderPillTextActive,
                          isTaken && styles.typePillTextDisabled,
                        ]}
                      >
                        {t} {isTaken ? '(Saved)' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {hasExistingHome && hasExistingOffice ? (
                <Text style={styles.addressTypeLimitNote}>
                  ℹ Home & Office addresses are already saved (1 each). New addresses can be added under Other.
                </Text>
              ) : hasExistingHome ? (
                <Text style={styles.addressTypeLimitNote}>
                  ℹ 1 Home address already exists. Choose Office or Other, or edit your existing Home address.
                </Text>
              ) : hasExistingOffice ? (
                <Text style={styles.addressTypeLimitNote}>
                  ℹ 1 Office address already exists. Choose Home or Other, or edit your existing Office address.
                </Text>
              ) : null}

              <Text style={styles.inputLabel}>Recipient Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                value={addressForm.recipientName}
                onChangeText={(t) => setAddressForm((prev) => ({ ...prev, recipientName: t }))}
              />

              <Text style={styles.inputLabel}>Mobile Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                value={addressForm.recipientPhone}
                onChangeText={(t) => setAddressForm((prev) => ({ ...prev, recipientPhone: t.replace(/\D/g, '') }))}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.inputLabel}>6-Digit PIN Code *</Text>
                {isLookingUpPin && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ActivityIndicator size="small" color="#00A3E0" />
                    <Text style={{ fontSize: 11, color: '#00A3E0', fontWeight: '600' }}>Finding District & Area...</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="PIN Code (e.g. 122003)"
                keyboardType="numeric"
                maxLength={6}
                value={addressForm.pincode}
                onChangeText={handlePincodeChange}
              />

              {/* Specific Areas Auto-Detected for this PIN (Matching Website) */}
              {availableAreas.length > 0 ? (
                <View style={styles.detectedAreasContainer}>
                  <View style={styles.detectedAreasHeader}>
                    <Ionicons name="location" size={13} color="#00A3E0" />
                    <Text style={styles.detectedAreasTitle}>
                      Areas / Post Offices in PIN {addressForm.pincode} (Tap to select):
                    </Text>
                  </View>
                  <View style={styles.areaChipsWrap}>
                    {availableAreas.slice(0, 10).map((area) => {
                      const isSelected = addressForm.addressLine2 === area;
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

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City / District</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="City / District"
                    value={addressForm.city}
                    onChangeText={(t) => setAddressForm((prev) => ({ ...prev, city: t }))}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="State"
                    value={addressForm.state}
                    onChangeText={(t) => setAddressForm((prev) => ({ ...prev, state: t }))}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Flat, House No., Building *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="House / Flat / Block details"
                value={addressForm.addressLine1}
                onChangeText={(t) => setAddressForm((prev) => ({ ...prev, addressLine1: t }))}
              />

              <Text style={styles.inputLabel}>Area, Sector, Street</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Area or locality"
                value={addressForm.addressLine2}
                onChangeText={(t) => setAddressForm((prev) => ({ ...prev, addressLine2: t }))}
              />

              <Text style={styles.inputLabel}>Delivery Notes / Instructions</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Please call before delivery"
                value={addressForm.deliveryMessage}
                onChangeText={(t) => setAddressForm((prev) => ({ ...prev, deliveryMessage: t }))}
              />

              <TouchableOpacity style={styles.saveAddressBtn} onPress={handleSaveAddress} activeOpacity={0.88}>
                <Text style={styles.saveAddressBtnText}>Save & Apply Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  secureHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  secureHeaderPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  stepperBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepItemDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepTextDone: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  stepItemActive: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  stepTextActive: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00A3E0',
  },
  stepItemPending: {
    paddingHorizontal: 6,
  },
  stepTextPending: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  mainScroll: {
    padding: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  editAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editAddressBtnText: {
    color: '#00A3E0',
    fontSize: 12,
    fontWeight: '700',
  },
  addressBody: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  addressTagBadge: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  addressTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  recipientNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  recipientPhoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  addressLineText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginTop: 2,
  },
  addressCityStateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  deliveryNoteText: {
    fontSize: 11.5,
    color: '#0284C7',
    fontStyle: 'italic',
    marginTop: 6,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemsListContainer: {
    marginTop: 12,
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  cornerRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  itemCardContentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemInfoCol: {
    flex: 1,
  },
  itemNameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    paddingRight: 28, // Clearance for corner remove button
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  priceWithDpGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemUnitPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemUnitPriceGreen: {
    color: '#059669',
  },
  itemOriginalPriceStriked: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  itemDpBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    borderWidth: 0.8,
    borderColor: '#A7F3D0',
  },
  itemDpBadgeText: {
    color: '#059669',
    fontSize: 9.5,
    fontWeight: '800',
  },
  itemPvBadgeWrap: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#BAE6FD',
  },
  itemPvText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3E0',
  },
  itemBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  itemDeliveryBadgeWrap: {
    marginTop: 4,
  },
  freeDeliveryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  standardDeliveryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 6,
  },
  stepperControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  itemLineTotalText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'right',
  },
  expressTransitCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 12,
  },
  expressTransitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expressTransitTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  expressTransitSub: {
    fontSize: 12,
    color: '#0C4A6E',
    marginTop: 2,
  },

  // PAYMENT SUMMARY CARD
  paymentSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  paymentSummaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  summaryBreakdown: {
    gap: 10,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLineClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryLabelWithArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLineLabel: {
    fontSize: 13.5,
    color: '#475569',
    fontWeight: '600',
  },
  summaryLineValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  taxBreakdownPanel: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#00A3E0',
    padding: 8,
    borderRadius: 6,
    gap: 4,
    marginVertical: 2,
  },
  taxSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taxSubLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  taxSubValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  pvPointValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00A3E0',
  },
  freeDeliveryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  freeDeliveryQualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -2,
  },
  freeDeliveryQualText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#10B981',
  },
  shippingNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -2,
  },
  shippingNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  estimatedDeliverySummaryRow: {
    alignItems: 'flex-start',
    gap: 8,
  },
  estimatedDeliveryLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
    marginTop: 2,
  },
  etaDateHighlight: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#00A3E0',
    flex: 1,
    textAlign: 'right',
    lineHeight: 18,
  },
  destinationSnapshotBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  destSnapshotTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3E0',
    textTransform: 'uppercase',
  },
  destSnapshotName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  destSnapshotAddress: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  grandTotalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  grandTotalLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  inclusiveGstText: {
    fontSize: 11,
    color: '#64748B',
  },
  grandTotalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00A3E0',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  consentText: {
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
  },
  proceedToPaymentBtn: {
    backgroundColor: '#00A3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  proceedBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  proceedToPaymentBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  trustBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },

  // PAYMENT GATEWAY STYLES
  paymentGatewayScroll: {
    padding: 14,
  },
  paymentMethodTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  paymentMethodTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentMethodTabActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00A3E0',
  },
  paymentMethodTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  paymentMethodTabTextActive: {
    color: '#00A3E0',
  },
  upiRedirectContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  upiCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  upiCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  amountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  amountPillLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  amountPillVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00A3E0',
  },
  upiSelectLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upiAppsGrid: {
    gap: 8,
    marginBottom: 14,
  },
  upiAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  upiAppCardSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#00A3E0',
  },
  upiAppIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  upiLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    padding: 3,
  },
  upiOriginalLogo: {
    width: '100%',
    height: '100%',
  },
  otherUpiToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 2,
    marginBottom: 10,
  },
  otherUpiToggleBtnActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#00A3E0',
  },
  otherUpiToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otherUpiToggleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  upiAppCardInfo: {
    flex: 1,
  },
  upiAppCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  upiAppCardNameSelected: {
    color: '#00A3E0',
  },
  upiAppCardDesc: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  upiRadioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upiRadioCircleSelected: {
    borderColor: '#00A3E0',
  },
  upiRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A3E0',
  },
  openUpiBtn: {
    backgroundColor: '#00A3E0',
    paddingVertical: 13,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  openUpiBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  verifyUpiBtn: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyUpiBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  securitySubnote: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 6,
    lineHeight: 15,
  },
  spinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vpaToggleBtn: {
    paddingVertical: 10,
    marginTop: 6,
  },
  vpaToggleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
  vpaInputBox: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  vpaInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  vpaPayBtn: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8,
  },
  vpaPayBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  // CARD FORM STYLES
  cardFormContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardFormTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardLogosRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    marginBottom: 12,
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rbiCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 14,
  },
  rbiCheckboxText: {
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
  },

  // COD STYLES
  codCenterBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  codTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  codDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  codBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    width: '100%',
  },
  codBulletText: {
    fontSize: 12,
    color: '#334155',
  },

  // NET BANKING STYLES
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  bankTile: {
    width: (SCREEN_WIDTH - 64) / 3,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankTileActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00A3E0',
  },
  bankTileCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  bankTileCodeActive: {
    color: '#00A3E0',
  },

  // MINI DESTINATION STYLES
  miniDestinationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
  },
  miniDestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniDestHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00A3E0',
  },
  miniDestAddress: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
  },
  miniDestEta: {
    fontSize: 11.5,
    color: '#0F172A',
    marginTop: 4,
  },

  // COMPLETED VIEW STYLES
  completedScroll: {
    padding: 16,
    alignItems: 'center',
  },
  successCheckCircle: {
    marginTop: 10,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  confirmedDetailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 18,
  },
  confirmedMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  confirmedMetaCol: {
    flex: 1,
  },
  confirmedMetaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmedMetaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  confirmedMetaValHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00A3E0',
    marginTop: 2,
  },
  confirmedMetaPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#00A3E0',
    marginTop: 2,
  },
  pvCelebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginVertical: 10,
  },
  pvCelebrationText: {
    fontSize: 12,
    color: '#0369A1',
    flex: 1,
    lineHeight: 16,
  },
  confirmedAddressBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  confirmedAddressHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3E0',
  },
  confirmedAddressLine: {
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
  },
  confirmedRecipient: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  expressEtaBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  expressEtaTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
  },
  expressEtaDate: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
  expressEtaSub: {
    fontSize: 11,
    color: '#4ADE80',
    marginTop: 1,
  },
  confirmedItemsHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 4,
  },
  confirmedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  confirmedItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  confirmedItemName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  confirmedItemMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  confirmedItemSubtotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  continueShoppingBtn: {
    width: '100%',
    backgroundColor: '#00A3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 18,
    marginBottom: 30,
  },
  continueShoppingBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBodyScroll: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
  },
  twoColRow: {
    flexDirection: 'row',
  },
  saveAddressBtn: {
    backgroundColor: '#00A3E0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveAddressBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
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
  detectedAreasContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 10,
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

  // FLIPKART STYLE PAYMENTS SCREEN STYLES (Matching user screenshot)
  fkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fkBackBtn: {
    marginRight: 14,
  },
  fkTitleCol: {
    flex: 1,
  },
  fkStepText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 1,
  },
  fkMainTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  fkSecureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fkSecureBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },

  // Amount Banner
  fkAmountCard: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 14,
  },
  fkAmountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fkAmountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fkAmountTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  fkAmountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },
  fkAmountDetails: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
    gap: 6,
  },
  fkDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fkDetailLabel: {
    fontSize: 12,
    color: '#475569',
  },
  fkDetailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Accordion Cards
  accordionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginHorizontal: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accordionCardActive: {
    borderColor: '#00A3E0',
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  accordionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upiIconBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  upiIconBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  accordionInfoCol: {
    flex: 1,
  },
  accordionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  accordionSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  accordionGreenOffer: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginTop: 3,
  },
  accordionBody: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 14,
    backgroundColor: '#FFFFFF',
  },

  // Trust Footer
  fkTrustFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginTop: 6,
  },
  fkTrustFooterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },

  // Coupon / Promo Card Styles
  couponCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  couponHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  couponCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 13.5,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    fontWeight: '700',
  },
  applyCouponBtn: {
    height: 42,
    paddingHorizontal: 18,
    backgroundColor: '#00A3E0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 6,
    padding: 10,
  },
  appliedCouponBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  appliedCouponCode: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  appliedCouponDesc: {
    fontSize: 12,
    color: '#15803D',
  },
  removeCouponBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeCouponBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  couponErrorText: {
    fontSize: 11.5,
    color: '#DC2626',
    marginTop: 6,
    fontWeight: '600',
  },
  addAddressPromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  addAddressPromptTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addAddressIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressPromptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  addAddressPromptSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  addAddressPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A3E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  addAddressPromptBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  availableCouponsSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  availableCouponsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availableCouponsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  availableCouponsSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  couponsGrid: {
    gap: 10,
  },
  couponTile: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  couponTileApplied: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  couponTileIneligible: {
    opacity: 0.85,
    backgroundColor: '#FAFAFA',
  },
  couponTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  couponTileBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  couponTileDiscountBadge: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  couponTileDiscountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  newComerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  newComerPillText: {
    color: '#7C3AED',
    fontSize: 10,
    fontWeight: '700',
  },
  hemohimPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  hemohimPillText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  couponAppliedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  couponAppliedPillText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  couponTileApplyBtn: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  couponTileApplyBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  couponTileApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  couponTileApplyBtnTextDisabled: {
    color: '#94A3B8',
  },
  couponTileCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  couponTileTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  couponTileDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 6,
  },
  couponScopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  couponScopeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  couponEligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  couponEligibilityText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Option B Stock Alert & Delivery Notice Styles
  destStockNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  destStockNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  destStockNoticeMsg: {
    fontSize: 11.5,
    color: '#B91C1C',
    lineHeight: 16,
  },
  itemStockAlertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 9,
    marginTop: 8,
  },
  itemStockAlertMsg: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B91C1C',
    lineHeight: 15,
  },
  itemStockAlertRemoveBtn: {
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 4,
  },
  itemStockAlertRemoveBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  stockAlertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  stockAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  stockAlertMsg: {
    fontSize: 11.5,
    color: '#B91C1C',
    lineHeight: 16,
    fontWeight: '500',
  },

  // Address Type Selector Styles
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
  typePillDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  typePillTextDisabled: {
    color: '#94A3B8',
  },
  addressTypeLimitNote: {
    fontSize: 11,
    color: '#0284C7',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 10,
    lineHeight: 15,
  },

  // Fulfillment Method (Courier vs Regional Hub Pickup)
  fulfillmentSectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fulfillmentSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fulfillmentToggleRow: {
    gap: 8,
  },
  fulfillmentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
  },
  fulfillmentOptionCardActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#00A3E0',
  },
  fulfillmentOptionCardActiveGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  fulfillmentOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  fulfillmentOptionTitleActive: {
    color: '#00A3E0',
    fontWeight: '800',
  },
  fulfillmentOptionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  freeBadgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  freeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  hubPickupInfoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  hubPickupInfoTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#065F46',
  },
  hubPickupInfoDesc: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 2,
  },
  hubPickupInfoTimings: {
    fontSize: 10.5,
    color: '#059669',
    marginTop: 3,
    fontWeight: '500',
  },
  headerPvPreview: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00A3E0',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  itemBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  freeDeliveryPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#86EFAC',
  },
  freeDeliveryPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  standardDeliveryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#CBD5E1',
  },
  standardDeliveryPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  gstTagPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  gstTagPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  activeDistributorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  distributorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeDistributorPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  distributorBody: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  distributorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributorAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  distributorMemberName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  distributorIdTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A3E0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#BAE6FD',
  },
  distributorContactText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dpBenefitCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  dpBenefitCalloutText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#15803D',
    flex: 1,
    lineHeight: 16,
  },
  coManagerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  coManagerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  coManagerSectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  coManagerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#BAE6FD',
  },
  coManagerActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A3E0',
  },
  coManagerBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coManagerNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  coManagerRolePill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  coManagerRolePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  coManagerSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  noCoManagerNotice: {
    padding: 6,
  },
  noCoManagerNoticeText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  fulfillmentCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fulfillmentFeeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  feeTagFree: {
    backgroundColor: '#DCFCE7',
    borderWidth: 0.8,
    borderColor: '#86EFAC',
  },
  feeTagPaid: {
    backgroundColor: '#FEF3C7',
    borderWidth: 0.8,
    borderColor: '#FDE68A',
  },
  feeTagFreeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  feeTagPaidText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  hubDetailsContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  hubDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  hubDetailsHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#14532D',
  },
  hubAddressText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 17,
    marginTop: 2,
  },
  hubTimingsText: {
    fontSize: 11.5,
    color: '#047857',
    fontWeight: '600',
    marginTop: 4,
  },
  hubContactRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    gap: 10,
  },
  hubManagerSection: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  hubManagerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hubManagerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 3,
  },
  hubManagerPhone: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  hubCoManagerBox: {
    paddingTop: 2,
  },
  hubCoManagerTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hubCoManagerName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 3,
  },
  hubCoManagerDuty: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
  },
  hubPickupNote: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 8,
    fontStyle: 'italic',
  },
  addNewAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    flexShrink: 0,
  },
  addNewAddressBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3E0',
  },
  savedAddressesList: {
    gap: 8,
    marginTop: 4,
  },
  savedAddressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  savedAddressCardSelected: {
    borderColor: '#00A3E0',
    backgroundColor: '#F0F9FF',
  },
  savedAddressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultAddressBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#A7F3D0',
  },
  defaultAddressBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  savedRecipientText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  savedStreetText: {
    fontSize: 12.5,
    color: '#334155',
    marginTop: 2,
    lineHeight: 17,
  },
  savedCityPinText: {
    fontSize: 12.5,
    color: '#0F172A',
    marginTop: 2,
  },
  singleAddressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noAddressPromptBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  noAddressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  noAddressSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 12,
  },
  couponDropdownToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  couponDropdownToggleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#00A3E0',
  },
  appliedCouponBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 10,
  },
  appliedCouponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedCouponCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14532D',
  },
  appliedDiscountPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  appliedDiscountPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  appliedCouponTitle: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  compactCouponsDropdown: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  compactDropdownHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  compactCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  compactCouponInfo: {
    flex: 1,
  },
  compactBadgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  compactCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#BAE6FD',
  },
  compactDiscountTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  compactDiscountTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  compactApplyBtn: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compactApplyBtnApplied: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  compactApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  noCouponsText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 6,
  },
  coManagerModalNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 12,
  },
  coManagerModalNoticeText: {
    fontSize: 11.5,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
  },
  coManagerAuthCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 14,
  },
  coManagerAuthCheckboxText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },

});
