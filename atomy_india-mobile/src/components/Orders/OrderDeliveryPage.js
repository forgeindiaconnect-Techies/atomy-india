import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

const phoenixLogo = require('../../../assets/fic-symbol.png');

// 1. Vector SVG Model: Envelope Mover
function EnvelopeModel({ size = 1 }) {
  return (
    <View style={styles.svgWrap}>
      <Svg width={36 * size} height={26 * size} viewBox="0 0 34 24" fill="none">
        <Line x1="1" y1="8" x2="6" y2="8" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity={0.8} />
        <Line x1="0" y1="12" x2="5" y2="12" stroke="#00A3E0" strokeWidth="2" strokeLinecap="round" />
        <Line x1="2" y1="16" x2="6" y2="16" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity={0.8} />
        <Rect x="7" y="3" width="25" height="18" rx="3" fill="#00A3E0" stroke="#0284c7" strokeWidth="1.2" />
        <Path d="M8 5L19.5 14L31 5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="19.5" cy="14" r="2.2" fill="#fef08a" />
      </Svg>
    </View>
  );
}

// 2. Vector SVG Model: Parcel Carton Box Mover
function ParcelCartonModel({ size = 1 }) {
  return (
    <View style={styles.svgWrap}>
      <Svg width={36 * size} height={32 * size} viewBox="0 0 34 30" fill="none">
        <Path d="M17 2L31 9L17 16L3 9L17 2Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
        <Path d="M3 9V22L17 29V16L3 9Z" fill="#d97706" stroke="#92400e" strokeWidth="1.2" />
        <Path d="M31 9V22L17 29V16L31 9Z" fill="#b45309" stroke="#78350f" strokeWidth="1.2" />
        <Path d="M17 2V16" stroke="#ffffff" strokeWidth="2.8" strokeDasharray="2.5 1.5" />
        <Path d="M10 5.5L24 12.5" stroke="#fef3c7" strokeWidth="2.2" />
        <Rect x="21" y="18" width="6" height="4.5" rx="0.5" fill="#ffffff" opacity={0.9} />
      </Svg>
    </View>
  );
}

// 3. Vector SVG Model: Blue Dart Express Van/Truck Mover
function BlueDartTruckModel({ size = 1 }) {
  return (
    <View style={styles.svgWrap}>
      <Svg width={60 * size} height={34 * size} viewBox="0 0 56 32" fill="none">
        <Circle cx="2" cy="19" r="1.5" fill="#94a3b8" opacity={0.6} />
        <Circle cx="0.5" cy="17.5" r="1" fill="#cbd5e1" opacity={0.4} />
        <Rect x="4" y="5" width="32" height="17" rx="2" fill="#00A3E0" stroke="#0284c7" strokeWidth="1.4" />
        <Rect x="6" y="9" width="28" height="5" rx="1" fill="#ffffff" />
        <SvgText x="8" y="12.8" fontSize="3.8" fontWeight="900" fill="#00A3E0">BLUE DART</SvgText>
        <Path d="M36 10H46L51 16V23H36V10Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.4" />
        <Path d="M38 12H44.5L48 16H38V12Z" fill="#e0f2fe" />
        <Circle cx="50" cy="19" r="1.5" fill="#fef08a" />
        <Path d="M51 18.5L55 17V21L51 19.5Z" fill="#fef08a" opacity={0.6} />
        <Rect x="4" y="22" width="46" height="1.8" fill="#1e293b" />
        <Circle cx="13" cy="23.5" r="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <Circle cx="13" cy="23.5" r="2.8" fill="#cbd5e1" />
        <Circle cx="13" cy="23.5" r="1.2" fill="#1e293b" />
        <Circle cx="43" cy="23.5" r="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <Circle cx="43" cy="23.5" r="2.8" fill="#cbd5e1" />
        <Circle cx="43" cy="23.5" r="1.2" fill="#1e293b" />
      </Svg>
    </View>
  );
}

// 4. Vector SVG Model: Delivery Boy on Motorbike Mover
function DeliveryBikeModel({ size = 1 }) {
  return (
    <View style={styles.svgWrap}>
      <Svg width={56 * size} height={38 * size} viewBox="0 0 52 36" fill="none">
        <Line x1="1" y1="20" x2="6" y2="20" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <Line x1="3" y1="24" x2="8" y2="24" stroke="#00A3E0" strokeWidth="2" strokeLinecap="round" />
        <Rect x="13" y="11" width="8" height="10" rx="1.5" fill="#10b981" stroke="#047857" strokeWidth="1.2" />
        <Rect x="15" y="13" width="4" height="4.5" rx="0.5" fill="#ffffff" opacity={0.9} />
        <Circle cx="26" cy="7" r="4.2" fill="#00A3E0" stroke="#0284c7" strokeWidth="1.2" />
        <Path d="M27 6.5H30.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
        <Path d="M25 11L27 18L22 22" stroke="#0284c7" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M25 13L32 16" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
        <Circle cx="33" cy="16" r="1.2" fill="#0f172a" />
        <Path d="M14 26L23 23L32 16L34 22L38 26" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M23 23H29" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
        <Path d="M35 19L39 18V21L35 20Z" fill="#fef08a" />
        <Circle cx="12" cy="26.5" r="5.2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <Circle cx="12" cy="26.5" r="2.8" fill="#cbd5e1" />
        <Circle cx="12" cy="26.5" r="1.2" fill="#1e293b" />
        <Circle cx="40" cy="26.5" r="5.2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <Circle cx="40" cy="26.5" r="2.8" fill="#cbd5e1" />
        <Circle cx="40" cy="26.5" r="1.2" fill="#1e293b" />
      </Svg>
    </View>
  );
}

// Compute target stage from order status matching website
function computeTargetStage(order) {
  if (!order) return 1;
  const raw = (order.status || '').toUpperCase().trim();
  if (raw.includes('DELIVERED')) return 5;
  if (raw.includes('OUT') || raw.includes('LOCAL')) return 4;
  if (raw.includes('TRANSIT') || raw.includes('SHIPPED') || raw.includes('DISPATCH')) return 3;
  if (raw.includes('PREPAR') || raw.includes('PROCESS') || raw.includes('PACK')) return 2;
  return 1;
}

// Vertical & Horizontal animated delivery status stepper matching website
function VerticalDeliveryStepper({ order }) {
  const targetStage = useMemo(() => computeTargetStage(order), [order]);
  const [currentStep, setCurrentStep] = useState(1);
  const [lineProgress, setLineProgress] = useState(0);
  const [stepperMode, setStepperMode] = useState('horizontal'); // 'horizontal' | 'vertical'

  // Restart progression when order changes
  useEffect(() => {
    setCurrentStep(1);
    setLineProgress(0);
  }, [order?.id]);

  // One by one stage progression with smooth animated delay
  useEffect(() => {
    if (currentStep < targetStage) {
      setLineProgress(0);
      const startTime = Date.now();
      const duration = 1500; // 1.5s delay per stage

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / duration) * 100);
        setLineProgress(pct);

        if (elapsed >= duration) {
          clearInterval(interval);
          setCurrentStep((prev) => Math.min(targetStage, prev + 1));
        }
      }, 40);

      return () => clearInterval(interval);
    } else {
      setLineProgress(100);
    }
  }, [currentStep, targetStage]);

  const stages = [
    {
      num: 1,
      label: 'Order Placed',
      sub: 'Payment Confirmed & Verified',
      moverType: 'envelope',
      moverLabel: 'Order Confirmation Sent',
      icon: 'receipt-outline',
    },
    {
      num: 2,
      label: 'Preparing',
      sub: 'Warehouse Packaging & QC Complete',
      moverType: 'package',
      moverLabel: 'Carton Box Packed',
      icon: 'cube-outline',
    },
    {
      num: 3,
      label: 'In Transit',
      sub: 'Blue Dart Dispatch & Line-Haul',
      moverType: 'truck',
      moverLabel: 'Blue Dart Express In Transit',
      icon: 'airplane-outline',
    },
    {
      num: 4,
      label: 'Out for Delivery',
      sub: 'Arrived at Local Courier Hub',
      moverType: 'bike',
      moverLabel: 'Courier Out on Bike',
      icon: 'bicycle-outline',
    },
    {
      num: 5,
      label: 'Delivered',
      sub: 'Package Delivered at Doorstep',
      moverType: 'done',
      moverLabel: 'Handed to Customer',
      icon: 'checkmark-done-circle',
    },
  ];

  return (
    <View style={styles.verticalStepperWrapper}>
      {/* 1. Live Shipping Status Header */}
      <View style={styles.stepperLiveHeader}>
        <View style={styles.statusHeaderLeftRow}>
          <View style={styles.livePulseDot} />
          <Text style={styles.stepperLiveTitle}>LIVE SHIPPING STATUS</Text>
          <TouchableOpacity
            onPress={() => setStepperMode((m) => (m === 'horizontal' ? 'vertical' : 'horizontal'))}
            style={styles.modeToggleBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={stepperMode === 'horizontal' ? 'list' : 'swap-horizontal'}
              size={12}
              color="#00A3E0"
            />
            <Text style={styles.modeToggleBtnText}>
              {stepperMode === 'horizontal' ? 'Vertical' : 'Horizontal'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. STEPPER VIEW SWITCHER (Horizontal Flow matching website or Vertical Sequence) */}
      {stepperMode === 'horizontal' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalStepperContent}
        >
          {stages.map((st, idx) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            const isLast = idx === stages.length - 1;

            return (
              <React.Fragment key={st.num}>
                <View style={styles.hStageNode}>
                  <View
                    style={[
                      styles.hStageCircle,
                      isCompleted && styles.hStageCircleCompleted,
                      isCurrent && styles.hStageCircleCurrent,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark-sharp" size={17} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.hStageNumber, isCurrent && styles.hStageNumberCurrent]}>
                        {st.num}
                      </Text>
                    )}
                    {isCurrent && <View style={styles.hGlowRing} />}
                  </View>
                  <Text style={[styles.hStageTitle, isCurrent && styles.hStageTitleCurrent]}>
                    {st.label}
                  </Text>
                  <Text style={styles.hStageSub}>{st.sub}</Text>
                  {isCurrent && (
                    <View style={styles.hLiveBadge}>
                      <Text style={styles.hLiveBadgeText}>
                        {st.num === 5 ? 'DELIVERED 🎉' : 'IN PROGRESS'}
                      </Text>
                    </View>
                  )}
                </View>

                {!isLast && (
                  <View style={styles.hConnectorTrack}>
                    <View style={styles.hDottedLine} />
                    <View
                      style={[
                        styles.hFilledLine,
                        {
                          width:
                            currentStep > st.num
                              ? '100%'
                              : currentStep === st.num
                              ? `${lineProgress}%`
                              : '0%',
                        },
                      ]}
                    />

                    {/* Mover Vehicle positioned across line */}
                    {currentStep === st.num && (
                      <View
                        style={[
                          styles.hMoverWrap,
                          {
                            left: `${Math.max(0, Math.min(85, lineProgress))}%`,
                          },
                        ]}
                      >
                        {idx === 0 && <EnvelopeModel size={0.85} />}
                        {idx === 1 && <ParcelCartonModel size={0.85} />}
                        {idx === 2 && <BlueDartTruckModel size={0.8} />}
                        {idx === 3 && <DeliveryBikeModel size={0.8} />}
                      </View>
                    )}
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      ) : (
        /* Vertical Sequence with Vector SVG Models along each connector */
        <View style={styles.verticalStagesList}>
          {stages.map((st, idx) => {
            const isDone = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            const isFuture = currentStep < st.num;
            const isLast = idx === stages.length - 1;

            return (
              <View key={st.num} style={styles.verticalStageBlock}>
                {/* Stage Node Row */}
                <View style={styles.stageNodeRow}>
                  {/* Node Circle */}
                  <View
                    style={[
                      styles.stageCircle,
                      isDone && styles.stageCircleDone,
                      isCurrent && styles.stageCircleCurrent,
                      isFuture && styles.stageCircleFuture,
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark-sharp" size={15} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.stageNumberText,
                          isCurrent && styles.stageNumberTextCurrent,
                          isFuture && styles.stageNumberTextFuture,
                        ]}
                      >
                        {st.num}
                      </Text>
                    )}
                    {isCurrent && <View style={styles.stageGlowPulse} />}
                  </View>

                  {/* Stage Info */}
                  <View style={styles.stageTextWrap}>
                    <View style={styles.stageTitleRow}>
                      <Text
                        style={[
                          styles.stageTitleText,
                          isCurrent && styles.stageTitleTextCurrent,
                          isDone && styles.stageTitleTextDone,
                          isFuture && styles.stageTitleTextFuture,
                        ]}
                      >
                        {st.label}
                      </Text>

                      {isCurrent && (
                        <View style={styles.activeStageTag}>
                          <View style={styles.tinyPulseDot} />
                          <Text style={styles.activeStageTagText}>
                            {st.num === 5 ? 'DELIVERED 🎉' : 'IN PROGRESS'}
                          </Text>
                        </View>
                      )}

                      {isDone && (
                        <View style={styles.completedTag}>
                          <Text style={styles.completedTagText}>✓ Completed</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.stageSubText}>{st.sub}</Text>
                  </View>
                </View>

                {/* Segment Between Stages: Dotted Track + Vector SVG Moving Model */}
                {!isLast && (
                  <View style={styles.connectorSegmentWrapper}>
                    {/* Vertical Dotted Line Column */}
                    <View style={styles.connectorLineColumn}>
                      <View style={styles.verticalDottedTrack} />
                      <View
                        style={[
                          styles.verticalFilledTrack,
                          {
                            height:
                              currentStep > st.num
                                ? '100%'
                                : currentStep === st.num
                                ? `${lineProgress}%`
                                : '0%',
                          },
                        ]}
                      />
                    </View>

                    {/* MOVING VECTOR SVG MODEL (Only active stage, no background, no text content) */}
                    {currentStep === st.num && (
                      <View
                        style={[
                          styles.verticalMoverWrap,
                          {
                            top: 2 + (lineProgress / 100) * 38,
                          },
                        ]}
                      >
                        {idx === 0 && <EnvelopeModel size={0.75} />}
                        {idx === 1 && <ParcelCartonModel size={0.75} />}
                        {idx === 2 && <BlueDartTruckModel size={0.65} />}
                        {idx === 3 && <DeliveryBikeModel size={0.65} />}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function OrderDeliveryPage({
  placedOrders = [],
  onNavigateHome,
  onNavigateBack,
  onCartPress,
  onProductClick,
  cartCount = 0,
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'processing' | 'in_transit' | 'delivered'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);
  const [localOrdersOverrides, setLocalOrdersOverrides] = useState({});
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('atomy_placed_orders');
        if (saved) {
          const parsed = JSON.parse(saved);
          const overrides = {};
          if (Array.isArray(parsed)) {
            parsed.forEach(o => {
              const id = o.orderId || o.id;
              if (id && (o.status === 'Cancelled' || o.orderStatus === 'CANCELLED' || o.replacementRequested || o.returnRequested)) {
                overrides[id] = {
                  status: 'Cancelled',
                  trackStatus: 'Order cancelled by customer. 100% refund initiated.',
                  replacementRequested: o.replacementRequested || false,
                  returnRequested: o.returnRequested || false
                };
              }
            });
          }
          setLocalOrdersOverrides(overrides);
        }
      }
    } catch {}
  }, []);

  // Real placed orders from app state merged with local overrides
  const orders = useMemo(() => {
    return (placedOrders || []).map(o => {
      const id = o.id || o.orderId;
      const override = localOrdersOverrides[id] || {};
      return {
        ...o,
        status: override.status || o.status || 'Processing',
        trackStatus: override.trackStatus || o.trackStatus,
        replacementRequested: override.replacementRequested || o.replacementRequested || false,
        returnRequested: override.returnRequested || o.returnRequested || false,
      };
    });
  }, [placedOrders, localOrdersOverrides]);

  const activeTrackedOrder = selectedTrackOrder || (orders.length > 0 ? orders[0] : null);

  const handleCancelOrder = (ord) => {
    if (!ord) return;
    const id = ord.id || ord.orderId;
    const doCancel = () => {
      setLocalOrdersOverrides(prev => ({
        ...prev,
        [id]: {
          status: 'Cancelled',
          trackStatus: 'Order cancelled by customer. Full 100% refund initiated.'
        }
      }));

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const saved = JSON.parse(window.localStorage.getItem('atomy_placed_orders') || '[]');
          const updated = saved.map(o => (o.orderId === id || o.id === id) ? { ...o, status: 'Cancelled', orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : o);
          window.localStorage.setItem('atomy_placed_orders', JSON.stringify(updated));

          const adminSaved = JSON.parse(window.localStorage.getItem('atomy_admin_orders') || '[]');
          const updatedAdmin = adminSaved.map(o => (o.orderId === id || o.id === id) ? { ...o, orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : o);
          window.localStorage.setItem('atomy_admin_orders', JSON.stringify(updatedAdmin));
        }
      } catch {}

      const msg = `Order #${id} was cancelled successfully. Full 100% refund of ${ord.total || 'the order amount'} has been initiated to your source payment method (UPI within 24h, Cards in 3-5 days).`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Order Cancelled & Refund Initiated', msg);
      }
    };

    const confirmMsg = `Are you sure you want to cancel Order #${id}? A full 100% refund of ${ord.total || 'the order amount'} will be reversed back to your payment source.`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        doCancel();
      }
    } else {
      Alert.alert('Cancel Order', confirmMsg, [
        { text: 'Keep Order', style: 'cancel' },
        { text: 'Confirm Cancellation', style: 'destructive', onPress: doCancel }
      ]);
    }
  };

  const handleRequestReplacement = (ord) => {
    if (!ord) return;
    const id = ord.id || ord.orderId;
    const doReplace = () => {
      setLocalOrdersOverrides(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          replacementRequested: true
        }
      }));

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const adminTickets = JSON.parse(window.localStorage.getItem('atomy_admin_tickets') || '[]');
          adminTickets.unshift({
            ticketId: `TCK-${Date.now().toString().slice(-8)}`,
            customerName: ord.shippingAddress || 'Customer',
            customerEmail: 'customer@atomy.in',
            subject: `Zero-Cost Replacement Request for Order #${id}`,
            category: 'DAMAGED_PRODUCT',
            orderId: id,
            status: 'OPEN',
            message: `Mobile customer requested zero-cost 1-to-1 replacement for transit damage on Order #${id}. Reverse courier pickup via Blue Dart Express scheduled at zero cost.`,
            createdAt: new Date().toISOString()
          });
          window.localStorage.setItem('atomy_admin_tickets', JSON.stringify(adminTickets));
        }
      } catch {}

      const msg = `Zero-Cost 1-to-1 Replacement registered for Order #${id}! Blue Dart Express will collect the package from your address with ₹0 reverse shipping charge.`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Replacement Scheduled', msg);
      }
    };

    const confirmMsg = `Request Zero-Cost 1-to-1 Replacement for Order #${id}?\n\nIf products arrived damaged, leaked, or broken in transit, Blue Dart Express will collect the package at ₹0 shipping cost, and a fresh replacement will be dispatched.`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        doReplace();
      }
    } else {
      Alert.alert('1-to-1 Free Replacement', confirmMsg, [
        { text: 'Close', style: 'cancel' },
        { text: 'Schedule Replacement', onPress: doReplace }
      ]);
    }
  };

  const handleRequestReturn = (ord) => {
    if (!ord) return;
    const id = ord.id || ord.orderId;
    const doReturn = () => {
      setLocalOrdersOverrides(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          returnRequested: true
        }
      }));

      const msg = `30-Day Money-Back Guarantee claim submitted for Order #${id}! Our Gurugram logistics center will coordinate return pickup and initiate your 100% refund.`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Return Registered', msg);
      }
    };

    const confirmMsg = `Claim 30-Day 100% Satisfaction Return for Order #${id}?\n\nFull purchase amount will be refunded to your original payment channel upon inspection.`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        doReturn();
      }
    } else {
      Alert.alert('30-Day Money-Back Guarantee', confirmMsg, [
        { text: 'Close', style: 'cancel' },
        { text: 'Initiate Return', onPress: doReturn }
      ]);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeFilter === 'delivered' && o.status !== 'Delivered') return false;
      if (activeFilter === 'in_transit' && o.status !== 'In Transit') return false;
      if (activeFilter === 'processing' && o.status !== 'Processing') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inId = o.id?.toLowerCase().includes(q);
        const inTitle = o.title?.toLowerCase().includes(q);
        const inAwb = o.awb?.toLowerCase().includes(q);
        if (!inId && !inTitle && !inAwb) return false;
      }
      return true;
    });
  }, [orders, activeFilter, searchQuery]);

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
              ORDER / DELIVERY
            </Text>
            <Text style={styles.brandingSubtitle}>Live Shipment Dispatch Tracking</Text>
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

      {/* 2. BREADCRUMB & FULFILLMENT BADGE */}
      <View style={styles.breadcrumbBadgeRow}>
        <View style={styles.breadcrumbCol}>
          <Text style={styles.breadcrumbText} numberOfLines={1}>
            <Text style={styles.breadcrumbDim}>Home</Text>
            <Text style={styles.breadcrumbSep}> &gt; </Text>
            <Text style={styles.breadcrumbDim}>My Atomy</Text>
            <Text style={styles.breadcrumbSep}> &gt; </Text>
            <Text style={styles.breadcrumbActive}>Order/Delivery</Text>
          </Text>
        </View>
        <View style={styles.fulfillmentBadge}>
          <Ionicons name="shield-checkmark" size={13} color="#00A3E0" />
          <Text style={styles.fulfillmentBadgeText}>Official Atomy Fulfillment</Text>
        </View>
      </View>

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Orders Placed Yet</Text>
            <Text style={styles.emptySub}>
              You haven't placed any orders yet. Browse our shopping mall and place an order to track live shipment status here.
            </Text>
            <TouchableOpacity
              style={styles.emptyExploreBtn}
              onPress={onNavigateHome}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyExploreText}>Explore Shopping Mall</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 2.8 PROMINENT CANCELLATION & REPLACEMENT RULES BANNER */}
            <View style={styles.mobileRulesBanner}>
              <View style={styles.rulesBannerHeader}>
                <View style={styles.rulesBannerShield}>
                  <Ionicons name="shield-checkmark" size={18} color="#00A3E0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rulesBannerTitle}>Official Consumer Protection SOP</Text>
                  <Text style={styles.rulesBannerSub}>
                    Cancellation, Zero-Cost Replacement &amp; 100% Refund Rules
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.rulesBannerViewBtn}
                  onPress={() => setIsRulesModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rulesBannerViewBtnText}>Rules &gt;</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rulesBannerPillarsRow}>
                <View style={styles.rulesPillarCard}>
                  <View style={[styles.rulesPillarDot, { backgroundColor: '#0284C7' }]} />
                  <Text style={styles.rulesPillarTitle}>Pre-Dispatch Cancel</Text>
                  <Text style={styles.rulesPillarBody}>Instant 100% refund before package ships.</Text>
                </View>
                <View style={styles.rulesPillarCard}>
                  <View style={[styles.rulesPillarDot, { backgroundColor: '#4F46E5' }]} />
                  <Text style={styles.rulesPillarTitle}>Free Replacement</Text>
                  <Text style={styles.rulesPillarBody}>7-day transit damage window via Blue Dart.</Text>
                </View>
                <View style={styles.rulesPillarCard}>
                  <View style={[styles.rulesPillarDot, { backgroundColor: '#16A34A' }]} />
                  <Text style={styles.rulesPillarTitle}>30-Day Refund</Text>
                  <Text style={styles.rulesPillarBody}>100% satisfaction refund (UPI: 24h, Cards: 3-5d).</Text>
                </View>
              </View>
            </View>

            {/* 3. LATEST ORDER LIVE SHIPMENT STATUS (Set directly in page without background box) */}
            {activeTrackedOrder && (
              <View style={styles.latestOrderTrackerCard}>
                <View style={styles.trackerTopMetaRow}>
                  <View style={styles.trackerIdCol}>
                    <View style={styles.trackerEyebrowRow}>
                      <Ionicons name="sparkles" size={12} color="#00A3E0" />
                      <Text style={styles.trackerEyebrowText}>
                        {selectedTrackOrder ? 'SELECTED CONSIGNMENT' : 'LATEST ORDER SHIPMENT'}
                      </Text>
                    </View>
                    <Text style={styles.trackerOrderId}>Order #{activeTrackedOrder.id}</Text>
                    <Text style={styles.trackerOrderDate}>Placed on {activeTrackedOrder.date}</Text>
                  </View>

                  <View style={[
                    styles.statusBadge,
                    activeTrackedOrder.status === 'Delivered'
                      ? styles.statusBadgeDelivered
                      : styles.statusBadgeTransit,
                  ]}>
                    <Ionicons
                      name={activeTrackedOrder.status === 'Delivered' ? 'checkmark-circle' : 'airplane-outline'}
                      size={14}
                      color={activeTrackedOrder.status === 'Delivered' ? '#16A34A' : '#0284C7'}
                    />
                    <Text style={[
                      styles.statusBadgeText,
                      activeTrackedOrder.status === 'Delivered'
                        ? styles.statusBadgeTextDelivered
                        : styles.statusBadgeTransit,
                    ]}>
                      {activeTrackedOrder.status}
                    </Text>
                  </View>
                </View>

                {/* Item Title & Courier Info */}
                <View style={styles.trackerItemInfoRow}>
                  <Ionicons name="bag-check-outline" size={16} color="#00A3E0" />
                  <Text style={styles.trackerItemTitle} numberOfLines={1}>
                    {activeTrackedOrder.title}
                  </Text>
                </View>

                <View style={styles.trackerCourierMetaRow}>
                  <Text style={styles.trackerCourierMetaText}>
                    Carrier: <Text style={styles.courierBold}>{activeTrackedOrder.courier || 'Express Courier'}</Text>
                    {activeTrackedOrder.awb ? ` • AWB: ${activeTrackedOrder.awb}` : ''}
                    {activeTrackedOrder.eta ? ` • ETA: ${activeTrackedOrder.eta}` : ''}
                  </Text>
                </View>

                {/* Stepper (Horizontal by default, without Blue Dart Express pill in header) */}
                <VerticalDeliveryStepper order={activeTrackedOrder} />

                {activeTrackedOrder.shippingAddress && (
                  <View style={styles.trackerAddressBanner}>
                    <Ionicons name="location-outline" size={14} color="#00A3E0" />
                    <Text style={styles.trackerAddressText} numberOfLines={1}>
                      Shipping to: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{activeTrackedOrder.shippingAddress}</Text>
                    </Text>
                  </View>
                )}

                {/* Tracker Actions Strip: Direct Cancel, Replacement & Rules Buttons */}
                <View style={styles.mobileTrackerActionsRow}>
                  {(() => {
                    const st = (activeTrackedOrder.status || '').toLowerCase();
                    const isCancellable = !st.includes('delivered') && !st.includes('transit') && !st.includes('cancel');
                    const isDelivered = st.includes('delivered');
                    const isCancelled = st.includes('cancel');

                    return (
                      <>
                        {isCancellable && (
                          <TouchableOpacity
                            style={[styles.mobileActionBtn, styles.mobileCancelBtn]}
                            onPress={() => handleCancelOrder(activeTrackedOrder)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                            <Text style={styles.mobileCancelBtnText}>Cancel Order</Text>
                          </TouchableOpacity>
                        )}

                        {isDelivered && (
                          <>
                            <TouchableOpacity
                              style={[styles.mobileActionBtn, styles.mobileReplaceBtn]}
                              onPress={() => handleRequestReplacement(activeTrackedOrder)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="refresh-circle-outline" size={14} color="#4338CA" />
                              <Text style={styles.mobileReplaceBtnText}>Replacement</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.mobileActionBtn, styles.mobileReturnBtn]}
                              onPress={() => handleRequestReturn(activeTrackedOrder)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="return-down-back-outline" size={14} color="#15803D" />
                              <Text style={styles.mobileReturnBtnText}>Return</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {isCancelled && (
                          <View style={styles.mobileCancelledNotice}>
                            <Ionicons name="information-circle" size={14} color="#64748B" />
                            <Text style={styles.mobileCancelledNoticeText}>Cancelled • Full Refund Reversed</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={[styles.mobileActionBtn, styles.mobileRulesBtn]}
                          onPress={() => setIsRulesModalOpen(true)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="shield-checkmark-outline" size={14} color="#0284C7" />
                          <Text style={styles.mobileRulesBtnText}>Rules &amp; SOP</Text>
                        </TouchableOpacity>
                      </>
                    );
                  })()}
                </View>
              </View>
            )}

            {/* 4. TRACKING LOOKUP BAR */}
            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Order No (e.g. AT-892410)..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 5. PAST & DELIVERED ORDERS SECTION (Shown Below the Shipping Status) */}
            <View style={styles.pastOrdersSectionHeader}>
              <View style={styles.pastOrdersTitleRow}>
                <Ionicons name="time-outline" size={18} color="#0F172A" />
                <Text style={styles.pastOrdersTitle}>PAST &amp; DELIVERED ORDERS</Text>
                <View style={styles.pastOrdersCountBadge}>
                  <Text style={styles.pastOrdersCountText}>{filteredOrders.length}</Text>
                </View>
              </View>
              <Text style={styles.pastOrdersSubtitle}>
                Successful delivered consignments &amp; past order history
              </Text>
            </View>

            {/* Filter Pills: All, Delivered, In Transit, Processing */}
            <View style={styles.historyFilterStrip}>
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'in_transit', label: 'In Transit' },
                { key: 'processing', label: 'Processing' },
              ].map((tab) => {
                const isActive = activeFilter === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.historyFilterTab, isActive && styles.historyFilterTabActive]}
                    onPress={() => setActiveFilter(tab.key)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.historyFilterTabText, isActive && styles.historyFilterTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

        {/* 6. ORDERS LIST BELOW SHIPPING STATUS */}
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={54} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySub}>
              You don't have any past orders matching this search or filter.
            </Text>
            <TouchableOpacity
              style={styles.emptyExploreBtn}
              onPress={onNavigateHome}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyExploreText}>Explore Shopping Mall</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredOrders.map((ord) => {
            const isDelivered = ord.status === 'Delivered';
            const isCurrentlyTracked = activeTrackedOrder?.id === ord.id;

            return (
              <View key={ord.id} style={[styles.orderCard, isCurrentlyTracked && styles.orderCardTracked]}>
                {/* Order Header */}
                <View style={styles.orderCardHeader}>
                  <View>
                    <Text style={styles.orderIdText}>Order #{ord.id}</Text>
                    <Text style={styles.orderDateText}>Placed on {ord.date}</Text>
                  </View>

                  <View style={[
                    styles.statusBadge,
                    isDelivered ? styles.statusBadgeDelivered : styles.statusBadgeTransit,
                  ]}>
                    <Ionicons
                      name={isDelivered ? 'checkmark-circle' : 'airplane-outline'}
                      size={14}
                      color={isDelivered ? '#16A34A' : '#0284C7'}
                    />
                    <Text style={[
                      styles.statusBadgeText,
                      isDelivered ? styles.statusBadgeTextDelivered : styles.statusBadgeTransit,
                    ]}>
                      {ord.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* Items Summary */}
                <View style={styles.itemTitleRow}>
                  <Ionicons name="bag-check-outline" size={17} color="#00A3E0" />
                  <Text style={styles.itemTitleText} numberOfLines={2}>
                    {ord.title}
                  </Text>
                </View>

                {/* Courier info */}
                <View style={styles.courierInfoRow}>
                  <Ionicons name="car-outline" size={15} color="#64748B" />
                  <Text style={styles.courierText}>
                    Courier: <Text style={styles.courierBold}>{ord.courier || 'Blue Dart Express'}</Text>
                    {ord.awb ? ` • AWB: ${ord.awb}` : ''}
                  </Text>
                </View>

                {/* Delivery SLA & Target Deadline */}
                {(() => {
                  const estDate = ord.estimatedDeliveryDate || ord.estimatedDelivery;
                  const isRemote = /forest|mountain|hills?|ghat|ooty|nilgiris|kodaikanal|yercaud|munnar|wayanad|valparai|coonoor|shimla|manali|kullu|leh|ladakh|jammu|kashmir|uttarkashi|chamoli|nainital|mussoorie|arunachal|sikkim|meghalaya|nagaland|mizoram|manipur/i.test(ord.shippingAddress || '');
                  const slaText = isRemote ? '3-Day SLA (Mountain/Forest)' : '2-Day SLA (Nearby Hub)';
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, marginBottom: 4 }}>
                      <Ionicons name="time-outline" size={13} color="#0284C7" />
                      <Text style={{ fontSize: 11.5, color: '#0284C7', fontWeight: '600' }}>
                        Delivery SLA: {slaText} {estDate ? `• Target: ${estDate}` : ''}
                      </Text>
                    </View>
                  );
                })()}

                {/* Successful Delivery Confirmation Banner */}
                {isDelivered && (
                  <View style={styles.deliveredSuccessBanner}>
                    <Ionicons name="checkmark-done-circle" size={16} color="#16A34A" />
                    <Text style={styles.deliveredSuccessText}>
                      Successfully Delivered on {ord.deliveredDate || ord.date} • Verified Handover
                    </Text>
                  </View>
                )}

                {/* Pricing & PV */}
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Total Paid</Text>
                    <Text style={styles.priceValue}>{ord.total}</Text>
                  </View>
                  {ord.pv && (
                    <View style={styles.pvEarnedBadge}>
                      <Ionicons name="sparkles" size={13} color="#00A3E0" />
                      <Text style={styles.pvEarnedText}>{ord.pv}</Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={[styles.trackOrderBtn, isCurrentlyTracked && styles.trackOrderBtnActive]}
                    onPress={() => setSelectedTrackOrder(ord)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={isCurrentlyTracked ? '#FFFFFF' : '#00A3E0'}
                    />
                    <Text style={[styles.trackOrderBtnText, isCurrentlyTracked && styles.trackOrderBtnTextActive]}>
                      {isCurrentlyTracked ? 'Currently Tracking' : 'Track Status'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.invoiceBtn}
                    onPress={() => {
                      Alert.alert(
                        'GST Tax Invoice',
                        `Invoice generated for Order #${ord.id}\nAmount: ${ord.total}\nPoint Value: ${ord.pv}\nGSTIN: 06AAICA5843Q1Z2\nStatus: ${ord.status}\n\nOfficial Atomy India Distributor Invoicing.`
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="document-text-outline" size={14} color="#475569" />
                    <Text style={styles.invoiceBtnText}>View GST Invoice</Text>
                  </TouchableOpacity>
                </View>

                {/* Customer Section: Pre-Dispatch Cancellation, Zero-Cost Replacement & Return */}
                <View style={styles.cardCustomerActionsRow}>
                  {(() => {
                    const statusLower = (ord.status || '').toLowerCase();
                    const isCancelled = statusLower.includes('cancel');
                    const isReplacement = statusLower.includes('replac');
                    const canCancel = !isCancelled && !isReplacement && !statusLower.includes('transit') && !statusLower.includes('deliver');
                    const canRequestReplacement = !isCancelled && (statusLower.includes('deliver') || statusLower.includes('transit') || isReplacement);
                    const canRequestReturn = !isCancelled && statusLower.includes('deliver');

                    if (isCancelled) {
                      return (
                        <View style={styles.cancelledStatusBadge}>
                          <Ionicons name="close-circle" size={14} color="#DC2626" />
                          <Text style={styles.cancelledStatusText}>
                            Cancelled • Full Refund Processing (UPI: 24h, Cards: 3-5d)
                          </Text>
                        </View>
                      );
                    }

                    return (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, width: '100%' }}>
                        {canCancel && (
                          <TouchableOpacity
                            style={[styles.customerActionPill, styles.cancelActionPill]}
                            onPress={() => handleCancelOrder(ord.id)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="close-circle-outline" size={13} color="#DC2626" />
                            <Text style={styles.cancelActionText}>Cancel Order (100% Refund)</Text>
                          </TouchableOpacity>
                        )}

                        {canRequestReplacement && (
                          <TouchableOpacity
                            style={[styles.customerActionPill, styles.replaceActionPill]}
                            onPress={() => handleRequestReplacement(ord.id)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="repeat-outline" size={13} color="#4F46E5" />
                            <Text style={styles.replaceActionText}>Replace Damaged Item (₹0)</Text>
                          </TouchableOpacity>
                        )}

                        {canRequestReturn && (
                          <TouchableOpacity
                            style={[styles.customerActionPill, styles.returnActionPill]}
                            onPress={() => handleRequestReturn(ord.id)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="shield-checkmark-outline" size={13} color="#16A34A" />
                            <Text style={styles.returnActionText}>Claim 30-Day Return</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })()}
                </View>
              </View>
            );
          })
        )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 7. OFFICIAL CONSUMER PROTECTION & REFUND SOP MODAL */}
      <Modal
        visible={isRulesModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRulesModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={styles.modalShieldIcon}>
                  <Ionicons name="shield-checkmark" size={22} color="#00A3E0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Official Consumer SOP</Text>
                  <Text style={styles.modalSubtitle}>Cancellation, Replacement &amp; 100% Refund Rules</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsRulesModalOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Rule 1 */}
              <View style={styles.modalRuleSection}>
                <View style={styles.modalRuleHeader}>
                  <View style={[styles.modalRulePill, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[styles.modalRulePillText, { color: '#0284C7' }]}>Rule 01 • Cancellation</Text>
                  </View>
                  <Text style={styles.modalRuleHeading}>Pre-Dispatch 100% Instant Refund</Text>
                </View>
                <Text style={styles.modalRuleDescription}>
                  Orders can be cancelled at any time prior to packaging and dispatch. Instant 100% reversal to original payment method without any convenience deduction or cancellation penalty.
                </Text>
              </View>

              {/* Rule 2 */}
              <View style={styles.modalRuleSection}>
                <View style={styles.modalRuleHeader}>
                  <View style={[styles.modalRulePill, { backgroundColor: '#EEF2FF' }]}>
                    <Text style={[styles.modalRulePillText, { color: '#4F46E5' }]}>Rule 02 • Replacement</Text>
                  </View>
                  <Text style={styles.modalRuleHeading}>Zero-Cost Transit Damage Replacement</Text>
                </View>
                <Text style={styles.modalRuleDescription}>
                  Within 7 calendar days of delivery, if any sealed Atomy consumable or cosmetic arrives broken, leaked, or damaged, request immediate free replacement. Blue Dart reverse pick-up is completely free (₹0) and Member PV is 100% safeguarded.
                </Text>
              </View>

              {/* Rule 3 */}
              <View style={styles.modalRuleSection}>
                <View style={styles.modalRuleHeader}>
                  <View style={[styles.modalRulePill, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.modalRulePillText, { color: '#16A34A' }]}>Rule 03 • 30-Day Refund</Text>
                  </View>
                  <Text style={styles.modalRuleHeading}>100% Money-Back Guarantee</Text>
                </View>
                <Text style={styles.modalRuleDescription}>
                  If not 100% satisfied with an Atomy purchase, claim full product refund within 30 days of purchase. Payout SLA: UPI within 24 hours, Credit/Debit cards in 3 to 5 business days, Net Banking in 5 to 7 days.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsRulesModalOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseBtnText}>Understood &amp; Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  filterTabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  filterTabBtnActive: {
    backgroundColor: '#E0F2FE',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#00A3E0',
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderDateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeTransit: {
    backgroundColor: '#E0F2FE',
  },
  statusBadgeDelivered: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadgeTextTransit: {
    color: '#0284C7',
  },
  statusBadgeTextDelivered: {
    color: '#16A34A',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  itemTitleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  courierInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  courierText: {
    fontSize: 12,
    color: '#64748B',
  },
  courierBold: {
    fontWeight: '700',
    color: '#1E293B',
  },
  stepperContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stepperHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  stepperProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepperNode: {
    alignItems: 'center',
  },
  stepperCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepperCircleActive: {
    backgroundColor: '#00A3E0',
  },
  stepperLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  stepperLabelActive: {
    color: '#00A3E0',
    fontWeight: '700',
  },
  stepperLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: -16,
    marginHorizontal: 2,
  },
  stepperLineActive: {
    backgroundColor: '#00A3E0',
  },
  liveTrackAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 6,
    padding: 8,
    gap: 6,
    marginTop: 10,
  },
  liveTrackAlertText: {
    flex: 1,
    fontSize: 11.5,
    color: '#0369A1',
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  pvEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  pvEarnedText: {
    color: '#00A3E0',
    fontWeight: '700',
    fontSize: 12,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  invoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  invoiceBtnText: {
    color: '#00A3E0',
    fontSize: 12.5,
    fontWeight: '700',
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A3E0',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyExploreBtn: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyExploreText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  breadcrumbBadgeRow: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  breadcrumbCol: {
    flex: 1,
    marginRight: 8,
  },
  breadcrumbText: {
    fontSize: 11.5,
  },
  breadcrumbDim: {
    color: '#94A3B8',
  },
  breadcrumbSep: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  breadcrumbActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  fulfillmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#BAE6FD',
  },
  fulfillmentBadgeText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '700',
  },
  // Featured Latest Order Live Shipment Status Tracker Section (Set seamlessly in page)
  latestOrderTrackerCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 6,
    shadowOpacity: 0,
    elevation: 0,
  },
  trackerTopMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  trackerIdCol: {
    flex: 1,
  },
  trackerEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  trackerEyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00A3E0',
    letterSpacing: 0.6,
  },
  trackerOrderId: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  trackerOrderDate: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  trackerItemInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    marginBottom: 6,
  },
  trackerItemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  trackerCourierMetaRow: {
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  trackerCourierMetaText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  trackerAddressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E0F2FE',
    marginTop: 8,
  },
  trackerAddressText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
  },

  // Past & Delivered Orders Section Header
  pastOrdersSectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  pastOrdersTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  pastOrdersTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.4,
  },
  pastOrdersCountBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  pastOrdersCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  pastOrdersSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
  },

  // History Filter Strip
  historyFilterStrip: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  historyFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyFilterTabActive: {
    backgroundColor: '#00A3E0',
    borderColor: '#00A3E0',
  },
  historyFilterTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  historyFilterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Delivered Confirmation Banner
  deliveredSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#BBF7D0',
    marginBottom: 10,
  },
  deliveredSuccessText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
    flex: 1,
  },

  // Order Card Tracked Highlight
  orderCardTracked: {
    borderColor: '#38BDF8',
    backgroundColor: '#F0F9FF',
  },
  trackOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  trackOrderBtnActive: {
    backgroundColor: '#00A3E0',
    borderColor: '#0284C7',
  },
  trackOrderBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  trackOrderBtnTextActive: {
    color: '#FFFFFF',
  },
  // Vertical Delivery Stepper Styles matching authentic website
  verticalStepperWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    padding: 0,
    marginVertical: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  stepperLiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  statusHeaderLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A3E0',
  },
  stepperLiveTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  carrierBadgeWrap: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  carrierBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  currentStageStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  currentStageStripLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  currentStageStripValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00A3E0',
  },
  verticalStagesList: {
    paddingLeft: 2,
  },
  verticalStageBlock: {
    position: 'relative',
  },
  stageNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  stageCircleDone: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  stageCircleCurrent: {
    backgroundColor: '#00A3E0',
    borderColor: '#0284C7',
  },
  stageCircleFuture: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  stageNumberText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
  },
  stageNumberTextCurrent: {
    color: '#FFFFFF',
  },
  stageNumberTextFuture: {
    color: '#94A3B8',
  },
  stageGlowPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(0, 163, 224, 0.35)',
  },
  stageTextWrap: {
    flex: 1,
    paddingLeft: 12,
  },
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  stageTitleTextCurrent: {
    color: '#00A3E0',
    fontWeight: '800',
    fontSize: 13.5,
  },
  stageTitleTextDone: {
    color: '#0F172A',
    fontWeight: '700',
  },
  stageTitleTextFuture: {
    color: '#94A3B8',
  },
  activeStageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#BAE6FD',
  },
  tinyPulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00A3E0',
  },
  activeStageTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  completedTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  stageSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  connectorSegmentWrapper: {
    height: 64,
    position: 'relative',
    justifyContent: 'center',
    marginVertical: 2,
  },
  connectorLineColumn: {
    width: 28,
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDottedTrack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  verticalFilledTrack: {
    position: 'absolute',
    top: 0,
    width: 2.5,
    backgroundColor: '#00A3E0',
  },
  verticalMoverWrap: {
    position: 'absolute',
    left: 0,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  svgWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header actions
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
  },
  modeToggleBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },


  // Horizontal Stepper Track Styles (Matching Website)
  horizontalStepperContent: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  hStageNode: {
    alignItems: 'center',
    width: 96,
  },
  hStageCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  hStageCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  hStageCircleCurrent: {
    backgroundColor: '#00A3E0',
    borderColor: '#0284C7',
  },
  hStageNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  hStageNumberCurrent: {
    color: '#FFFFFF',
  },
  hGlowRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 163, 224, 0.4)',
  },
  hStageTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  hStageTitleCurrent: {
    color: '#00A3E0',
    fontWeight: '800',
  },
  hStageSub: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  hLiveBadge: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  hLiveBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hConnectorTrack: {
    width: 64,
    height: 38,
    justifyContent: 'center',
    position: 'relative',
  },
  hDottedLine: {
    height: 2,
    backgroundColor: '#CBD5E1',
    width: '100%',
  },
  hFilledLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#00A3E0',
    top: 17.5,
  },
  hMoverWrap: {
    position: 'absolute',
    top: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Consumer Protection Rules Banner */
  mobileRulesBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rulesBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  rulesBannerShield: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  rulesBannerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  rulesBannerViewBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rulesBannerViewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  rulesBannerPillarsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rulesPillarCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rulesPillarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  rulesPillarTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  rulesPillarBody: {
    fontSize: 9.5,
    color: '#64748B',
    lineHeight: 13,
  },

  /* Tracker Live Card Actions Row */
  mobileTrackerActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  mobileActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  mobileCancelBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  mobileCancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  mobileReplaceBtn: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  mobileReplaceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  mobileReturnBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  mobileReturnBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  mobileRulesBtn: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  mobileRulesBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },

  /* Card Customer Actions Row (inside past order card) */
  cardCustomerActionsRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  cancelledStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 4,
  },
  cancelledStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    flexShrink: 1,
  },
  customerActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
  },
  cancelActionPill: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  cancelActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  replaceActionPill: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  replaceActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  returnActionPill: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  returnActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },

  /* Rules & SOP Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalShieldIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalBody: {
    marginVertical: 12,
  },
  modalRuleSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalRuleHeader: {
    marginBottom: 6,
  },
  modalRulePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginBottom: 5,
  },
  modalRulePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  modalRuleHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalRuleDescription: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  modalFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCloseBtn: {
    backgroundColor: '#00A3E0',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
