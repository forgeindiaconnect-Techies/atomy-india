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
function VerticalDeliveryStepper({ order, defaultMode = 'vertical' }) {
  const isCancelled = useMemo(() => {
    const raw = String(order?.status || order?.orderStatus || '').toLowerCase();
    return raw.includes('cancel');
  }, [order]);

  const targetStage = useMemo(() => computeTargetStage(order), [order]);
  const [currentStep, setCurrentStep] = useState(1);
  const [lineProgress, setLineProgress] = useState(0);
  const [stepperMode, setStepperMode] = useState(defaultMode); // 'vertical' | 'horizontal'

  // Restart progression when order changes
  useEffect(() => {
    setCurrentStep(1);
    setLineProgress(0);
  }, [order?.id, order?.orderId]);

  // Adjust immediately if target stage is set lower
  useEffect(() => {
    if (currentStep > targetStage) {
      setCurrentStep(targetStage);
      setLineProgress(100);
    }
  }, [targetStage, currentStep]);

  // One by one stage progression with smooth animated delay
  useEffect(() => {
    if (currentStep < targetStage) {
      setLineProgress(0);
      const startTime = Date.now();
      const duration = 1200; // 1.2s delay per stage

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

  const stages = isCancelled ? [
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
      label: 'Processing & Check',
      sub: 'Pre-Dispatch Window',
      moverType: 'package',
      moverLabel: 'Review Completed',
      icon: 'cube-outline',
    },
    {
      num: 3,
      label: 'Order Cancelled',
      sub: '100% Refund Initiated',
      moverType: 'done',
      moverLabel: 'Cancellation Recorded',
      icon: 'close-circle-outline',
    },
  ] : [
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
          <View style={[styles.livePulseDot, isCancelled && { backgroundColor: '#DC2626' }]} />
          <Text style={[styles.stepperLiveTitle, isCancelled && { color: '#DC2626' }]}>
            {isCancelled ? 'ORDER CANCELLATION & TRANSIT STATUS' : 'LIVE SHIPPING STATUS'}
          </Text>
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

// Standard Reason Catalog matching customer website (Amazon / Myntra benchmark)
export const MOBILE_CANCELLATION_REASONS = [
  { id: 'mistake', title: 'Order created by mistake', desc: 'Placed order unintentionally or duplicate' },
  { id: 'address', title: 'Need to change delivery address or phone', desc: 'Entered incorrect address/phone details' },
  { id: 'delivery_delay', title: 'Expected delivery date is too long', desc: 'Urgent requirement / delivery too late' },
  { id: 'payment_method', title: 'Want to change payment method / UPI', desc: 'Switch to another card or UPI account' },
  { id: 'better_deal', title: 'Found better price or changed mind', desc: 'Purchasing through alternate distributor' },
  { id: 'coupon_missed', title: 'Forgot to apply coupon discount', desc: 'Re-order with promotional voucher' },
  { id: 'other', title: 'Other reason', desc: 'Distributor or personal circumstance' },
];

export const MOBILE_RETURN_REASONS = [
  { id: 'damaged_transit', title: 'Damaged in transit before delivery', desc: 'Crushed box, broken bottle, spilled liquid on arrival' },
  { id: 'wrong_item', title: 'Wrong product or variant delivered', desc: 'Different SKU, item, or quantity received' },
  { id: 'defective', title: 'Defective pump or dispenser stuck', desc: 'Spray nozzle broken or manufacturing defect' },
  { id: 'missing_item', title: 'Missing item in sealed package', desc: 'Partial shipment or item absent from invoice' },
  { id: 'quality_dissatisfaction', title: '30-Day Satisfaction Guarantee claim', desc: 'Quality did not meet expectations' },
  { id: 'allergic_reaction', title: 'Skin sensitivity or reaction', desc: 'Adverse reaction to cosmetic formula' },
  { id: 'expired', title: 'Expired or near-expiry product', desc: 'Manufacturing date does not meet criteria' },
  { id: 'other', title: 'Other reason', desc: 'Provide details for quality review' },
];

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
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);
  const [localOrdersOverrides, setLocalOrdersOverrides] = useState({});

  // Mobile Modals State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReasonId, setCancelReasonId] = useState('mistake');
  const [cancelNotes, setCancelNotes] = useState('');

  const [replacementModalOrder, setReplacementModalOrder] = useState(null);
  const [resolutionMode, setResolutionMode] = useState('replacement'); // 'replacement' | 'refund'
  const [returnReasonId, setReturnReasonId] = useState('damaged_transit');
  const [actionNotes, setActionNotes] = useState('');
  const [conditionConfirmed, setConditionConfirmed] = useState(true);

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [activeRulesTab, setActiveRulesTab] = useState('cancellation'); // 'cancellation' | 'replacement' | 'refund_guarantee' | 'timelines'
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

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

  const nonCancelledOrders = useMemo(() => orders.filter(o => !String(o.status || '').toLowerCase().includes('cancel')), [orders]);
  const activeTrackedOrder = (selectedTrackOrder && !String(selectedTrackOrder.status || '').toLowerCase().includes('cancel'))
    ? selectedTrackOrder
    : (nonCancelledOrders.length > 0 ? nonCancelledOrders[0] : null);

  // Helper to open Cancellation Modal
  const handleCancelOrder = (ord) => {
    if (!ord) return;
    const target = typeof ord === 'object' && ord !== null ? ord : orders.find(o => (o.id === ord || o.orderId === ord)) || { id: ord, orderId: ord };
    setCancelModalOrder(target);
    setCancelReasonId('mistake');
    setCancelNotes('');
  };

  // Helper to open Replacement Modal
  const handleRequestReplacement = (ord) => {
    if (!ord) return;
    const target = typeof ord === 'object' && ord !== null ? ord : orders.find(o => (o.id === ord || o.orderId === ord)) || { id: ord, orderId: ord };
    setReplacementModalOrder(target);
    setResolutionMode('replacement');
    setReturnReasonId('damaged_transit');
    setActionNotes('');
    setConditionConfirmed(true);
  };

  // Helper to open Return Modal
  const handleRequestReturn = (ord) => {
    if (!ord) return;
    const target = typeof ord === 'object' && ord !== null ? ord : orders.find(o => (o.id === ord || o.orderId === ord)) || { id: ord, orderId: ord };
    setReplacementModalOrder(target);
    setResolutionMode('refund');
    setReturnReasonId('quality_dissatisfaction');
    setActionNotes('');
    setConditionConfirmed(true);
  };

  // Execute Cancellation
  const handleConfirmCancelOrderAction = () => {
    if (!cancelModalOrder) return;
    setIsSubmittingAction(true);
    const id = cancelModalOrder.id || cancelModalOrder.orderId;
    const selectedObj = MOBILE_CANCELLATION_REASONS.find(r => r.id === cancelReasonId) || MOBILE_CANCELLATION_REASONS[0];
    const fullReason = selectedObj.title;

    try {
      setLocalOrdersOverrides(prev => ({
        ...prev,
        [id]: {
          status: 'Cancelled',
          trackStatus: `Order cancelled (${fullReason}). 100% refund initiated.`
        }
      }));

      if (selectedTrackOrder && (selectedTrackOrder.id === id || selectedTrackOrder.orderId === id)) {
        setSelectedTrackOrder(null);
      }

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const saved = JSON.parse(window.localStorage.getItem('atomy_placed_orders') || '[]');
          const updated = saved.map(o => (o.orderId === id || o.id === id) ? { 
            ...o, 
            status: 'Cancelled', 
            orderStatus: 'CANCELLED', 
            paymentStatus: (cancelModalOrder.status || '').toLowerCase().includes('ship') || (cancelModalOrder.status || '').toLowerCase().includes('transit') ? 'NON_REFUNDABLE' : 'REFUNDED', 
            cancelReason: fullReason, 
            cancelNotes 
          } : o);
          window.localStorage.setItem('atomy_placed_orders', JSON.stringify(updated));

          const inTransit = (cancelModalOrder.status || '').toLowerCase().includes('ship') || (cancelModalOrder.status || '').toLowerCase().includes('transit');
          const paymentStatusVal = inTransit ? 'NON_REFUNDABLE' : 'REFUNDED';

          const adminSaved = JSON.parse(window.localStorage.getItem('atomy_admin_orders') || '[]');
          const updatedAdmin = adminSaved.map(o => (o.orderId === id || o.id === id) ? { 
            ...o, 
            orderStatus: 'CANCELLED', 
            paymentStatus: paymentStatusVal, 
            cancelReason: fullReason, 
            cancelNotes 
          } : o);
          window.localStorage.setItem('atomy_admin_orders', JSON.stringify(updatedAdmin));

          // Create Admin Support Ticket
          const adminTickets = JSON.parse(window.localStorage.getItem('atomy_admin_tickets') || '[]');
          adminTickets.unshift({
            ticketId: `TCK-${Date.now().toString().slice(-8)}`,
            customerName: cancelModalOrder.shippingAddress || 'Customer',
            customerEmail: 'customer@atomy.in',
            subject: `Mobile App Order Cancellation #${id}: ${fullReason}`,
            category: 'CANCELLATION',
            orderId: id,
            status: 'RESOLVED',
            message: inTransit
              ? `Customer cancelled order #${id} on mobile app after transit started. Non-refundable policy applied (₹0 refunded).\nReason: ${fullReason}\nComments: ${cancelNotes || 'None'}`
              : `Customer cancelled order #${id} on mobile app.\nReason: ${fullReason}\nComments: ${cancelNotes || 'None'}\n100% Refund initiated to payment source.`,
            createdAt: new Date().toISOString()
          });
          window.localStorage.setItem('atomy_admin_tickets', JSON.stringify(adminTickets));
        }
      } catch {}

      const inTransitAlert = (cancelModalOrder.status || '').toLowerCase().includes('ship') || (cancelModalOrder.status || '').toLowerCase().includes('transit');
      const msg = inTransitAlert
        ? `Order #${id} was cancelled while in transit. As warned, after starting transit the cancellation amount will not be refunded (₹0 refund).`
        : `Order #${id} was cancelled successfully. Full 100% refund of ${cancelModalOrder.total || 'the order amount'} has been initiated to your source payment method (UPI within 24h, Cards in 3-5 days).`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert(inTransitAlert ? 'Order Cancelled (No Refund)' : 'Order Cancelled & 100% Refund Initiated', msg);
      }
      setCancelModalOrder(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Execute Replacement or Return
  const handleConfirmReplacementOrReturnAction = () => {
    if (!replacementModalOrder) return;
    setIsSubmittingAction(true);
    const id = replacementModalOrder.id || replacementModalOrder.orderId;
    const isReplacement = resolutionMode === 'replacement';
    const selectedObj = MOBILE_RETURN_REASONS.find(r => r.id === returnReasonId) || MOBILE_RETURN_REASONS[0];
    const fullReason = selectedObj.title;

    try {
      setLocalOrdersOverrides(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          replacementRequested: isReplacement ? true : prev[id]?.replacementRequested,
          returnRequested: !isReplacement ? true : prev[id]?.returnRequested
        }
      }));

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const adminTickets = JSON.parse(window.localStorage.getItem('atomy_admin_tickets') || '[]');
          adminTickets.unshift({
            ticketId: `TCK-${Date.now().toString().slice(-8)}`,
            customerName: replacementModalOrder.shippingAddress || 'Customer',
            customerEmail: 'customer@atomy.in',
            subject: isReplacement 
              ? `Mobile 1-to-1 Replacement Request #${id}: ${fullReason}`
              : `Mobile 30-Day Satisfaction Return #${id}: ${fullReason}`,
            category: isReplacement ? 'DAMAGED_PRODUCT' : 'REFUND_REQUEST',
            orderId: id,
            status: 'OPEN',
            message: `Customer Resolution: ${isReplacement ? 'Zero-Cost Replacement' : 'Return for 100% Refund'}\nReason: ${fullReason}\nNotes: ${actionNotes || 'None'}\nPackaging Intact: ${conditionConfirmed ? 'Confirmed' : 'Unchecked'}\nReverse Courier: Free Blue Dart Express pickup scheduled at ${replacementModalOrder.shippingAddress || 'customer address'}.`,
            createdAt: new Date().toISOString()
          });
          window.localStorage.setItem('atomy_admin_tickets', JSON.stringify(adminTickets));
        }
      } catch {}

      const msg = isReplacement 
        ? `Zero-Cost 1-to-1 Replacement registered for Order #${id}! Blue Dart Express will collect the package from your address with ₹0 reverse shipping charge.`
        : `30-Day Money-Back Guarantee claim submitted for Order #${id}! Blue Dart reverse pickup scheduled; 100% refund will be credited back to your original payment channel.`;

      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert(isReplacement ? 'Replacement Scheduled' : 'Return Registered', msg);
      }
      setReplacementModalOrder(null);
    } finally {
      setIsSubmittingAction(false);
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
                    Cancellation, Zero-Cost Replacement & 100% Refund Rules
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.rulesBannerViewBtn}
                  onPress={() => { setActiveRulesTab('cancellation'); setIsRulesModalOpen(true); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rulesBannerViewBtnText}>{'All Rules >'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rulesBannerPillarsRow}>
                <TouchableOpacity
                  style={styles.rulesPillarCard}
                  onPress={() => { setActiveRulesTab('cancellation'); setIsRulesModalOpen(true); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.rulesPillarDot, { backgroundColor: '#0284C7' }]} />
                  <Text style={styles.rulesPillarTitle} numberOfLines={1}>Pre-Dispatch Cancel</Text>
                  <Text style={styles.rulesPillarBody}>Instant 100% refund before package ships.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rulesPillarCard}
                  onPress={() => { setActiveRulesTab('replacement'); setIsRulesModalOpen(true); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.rulesPillarDot, { backgroundColor: '#4F46E5' }]} />
                  <Text style={styles.rulesPillarTitle} numberOfLines={1}>Free Replacement</Text>
                  <Text style={styles.rulesPillarBody}>7-day transit damage window via Blue Dart.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rulesPillarCard}
                  onPress={() => { setActiveRulesTab('refund_guarantee'); setIsRulesModalOpen(true); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.rulesPillarDot, { backgroundColor: '#16A34A' }]} />
                  <Text style={styles.rulesPillarTitle} numberOfLines={1}>30-Day Refund</Text>
                  <Text style={styles.rulesPillarBody}>100% satisfaction refund (UPI: 24h, Cards: 3-5d).</Text>
                </TouchableOpacity>
              </View>
            </View>

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
            const statusLower = (ord.status || '').toLowerCase();
            const isCancelled = statusLower.includes('cancel');
            const isCurrentlyTracked = !isCancelled && activeTrackedOrder?.id === ord.id;

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

                {/* Action Buttons: Track Status & View GST Invoice */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.trackOrderBtn,
                      expandedOrderId === ord.id && styles.trackOrderBtnActive,
                      isCancelled && (expandedOrderId === ord.id ? styles.cancelTrackBtnActive : styles.cancelTrackBtn),
                      isDelivered && (expandedOrderId === ord.id ? styles.deliveredTrackBtnActive : styles.deliveredTrackBtn),
                    ]}
                    onPress={() => setExpandedOrderId(prev => prev === ord.id ? null : ord.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isCancelled ? 'close-circle-outline' : isDelivered ? 'checkmark-circle-outline' : 'location-outline'}
                      size={15}
                      color={expandedOrderId === ord.id ? '#FFFFFF' : (isCancelled ? '#DC2626' : isDelivered ? '#16A34A' : '#00A3E0')}
                    />
                    <Text style={[
                      styles.trackOrderBtnText,
                      expandedOrderId === ord.id && styles.trackOrderBtnTextActive,
                      isCancelled && expandedOrderId !== ord.id && { color: '#DC2626' },
                      isDelivered && expandedOrderId !== ord.id && { color: '#16A34A' },
                    ]}>
                      {expandedOrderId === ord.id
                        ? (isCancelled || isDelivered ? 'Hide Status' : 'Hide Tracking')
                        : (isCancelled || isDelivered ? 'View Status' : 'Track Status')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.invoiceBtn}
                    onPress={() => setActiveInvoiceOrder(ord)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="document-text-outline" size={15} color="#00A3E0" />
                    <Text style={styles.invoiceBtnText}>View GST Invoice</Text>
                  </TouchableOpacity>
                </View>

                {/* Inline Vertical Delivery / Cancellation Tracking Stepper (Matching Website) */}
                {expandedOrderId === ord.id && (
                  <View style={styles.orderInlineTrackerBox}>
                    <View style={styles.inlineTrackerHeader}>
                      <View style={styles.inlineTrackerMeta}>
                        <Text style={styles.inlineMetaText}>
                          Carrier: <Text style={styles.courierBold}>{isCancelled ? 'Transit Halted' : (ord.courier || 'Blue Dart Express')}</Text>
                          <Text style={styles.inlineMetaSep}> • </Text>
                          AWB: <Text style={styles.monoBold}>{ord.awb || `BD-${ord.id}`}</Text>
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.inlineTrackerCloseBtn}
                        onPress={() => setExpandedOrderId(null)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close" size={14} color="#64748B" />
                        <Text style={styles.inlineTrackerCloseText}>Close</Text>
                      </TouchableOpacity>
                    </View>

                    <VerticalDeliveryStepper order={ord} defaultMode="vertical" />

                    <View style={styles.inlineTrackerDestination}>
                      <Ionicons name="location-outline" size={14} color="#00A3E0" />
                      <Text style={styles.inlineTrackerDestText} numberOfLines={2}>
                        Shipping to: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{ord.shippingAddress || 'Registered Delivery Address'}</Text>
                      </Text>
                    </View>
                  </View>
                )}

                {/* Customer Section: Pre-Dispatch Cancellation, Zero-Cost Replacement, Return & Policy Rules */}
                <View style={styles.cardCustomerActionsRow}>
                  {(() => {
                    const statusLower = (ord.status || '').toLowerCase();
                    const isCancelled = statusLower.includes('cancel');
                    const isReplacement = statusLower.includes('replac');
                    // Allow cancel for orders that are not delivered or already cancelled
                    const canCancel = !isCancelled && !statusLower.includes('deliver');
                    const isInTransit = !isCancelled && (statusLower.includes('ship') || statusLower.includes('transit') || statusLower.includes('out for'));
                    const canRequestReplacement = !isCancelled && (statusLower.includes('deliver') || statusLower.includes('transit') || isReplacement);
                    const canRequestReturn = !isCancelled && statusLower.includes('deliver');

                    if (isCancelled) {
                      return (
                        <View style={styles.cancelledStatusCard}>
                          <View style={styles.cancelledStatusLeft}>
                            <Ionicons name="close-circle" size={18} color="#DC2626" />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.cancelledStatusTitle}>Order Cancelled • 100% Refund</Text>
                              <Text style={styles.cancelledStatusSub}>Reversed to source payment (UPI: 24h, Cards: 3-5d)</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.cancelledRulesBtn}
                            onPress={() => { setActiveRulesTab('timelines'); setIsRulesModalOpen(true); }}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.cancelledRulesBtnText}>SLA &gt;</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }

                    if (canCancel) {
                      return (
                        <View style={styles.cardCustomerBtnRow}>
                          <TouchableOpacity
                            style={[styles.customerActionBtn, styles.cancelActionBtn]}
                            onPress={() => handleCancelOrder(ord)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                            <Text style={styles.cancelActionBtnText}>
                              {isInTransit ? 'Cancel Order (No Refund)' : 'Cancel Order (100% Refund)'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.customerActionBtn, styles.rulesActionBtn]}
                            onPress={() => { setActiveRulesTab('cancellation'); setIsRulesModalOpen(true); }}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="shield-checkmark-outline" size={14} color="#0284C7" />
                            <Text style={styles.rulesActionBtnText}>Rules &amp; SOP</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }

                    if (canRequestReplacement || canRequestReturn) {
                      return (
                        <View style={{ gap: 6, width: '100%' }}>
                          <View style={styles.cardCustomerBtnRow}>
                            {canRequestReplacement && (
                              <TouchableOpacity
                                style={[styles.customerActionBtn, styles.replaceActionBtn]}
                                onPress={() => handleRequestReplacement(ord)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="repeat-outline" size={14} color="#4F46E5" />
                                <Text style={styles.replaceActionBtnText}>Replace Item (₹0)</Text>
                              </TouchableOpacity>
                            )}

                            {canRequestReturn && (
                              <TouchableOpacity
                                style={[styles.customerActionBtn, styles.returnActionBtn]}
                                onPress={() => handleRequestReturn(ord)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="shield-checkmark-outline" size={14} color="#16A34A" />
                                <Text style={styles.returnActionBtnText}>30-Day Return</Text>
                              </TouchableOpacity>
                            )}
                          </View>

                          <TouchableOpacity
                            style={styles.policyLinkRow}
                            onPress={() => { setActiveRulesTab('refund_guarantee'); setIsRulesModalOpen(true); }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="information-circle-outline" size={13} color="#0284C7" />
                            <Text style={styles.policyLinkText}>View 30-Day Money-Back &amp; Free Replacement Policy &gt;</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }

                    return (
                      <View style={styles.cardCustomerBtnRow}>
                        <TouchableOpacity
                          style={[styles.customerActionBtn, styles.rulesActionBtn, { flex: 1 }]}
                          onPress={() => { setActiveRulesTab('timelines'); setIsRulesModalOpen(true); }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="shield-checkmark-outline" size={14} color="#0284C7" />
                          <Text style={styles.rulesActionBtnText}>View Consumer Protection SOP &amp; Timelines</Text>
                        </TouchableOpacity>
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

      {/* ========================================================
          MODAL 1: MOBILE PRE-DISPATCH CANCELLATION MODAL
          ======================================================== */}
      <Modal
        visible={!!cancelModalOrder}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCancelModalOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalDragHandle} />

            <View style={[styles.modalHeader, { borderBottomColor: '#FECDD3' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={[styles.modalShieldIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="close-circle" size={24} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: '#9F1239' }]} numberOfLines={1}>
                    Cancel Order #{cancelModalOrder?.id || cancelModalOrder?.orderId}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: '#BE123C' }]}>
                    Pre-dispatch 100% refund • ₹0 cancellation charge
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseCircle}
                onPress={() => setCancelModalOrder(null)} 
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Dynamic Refund & Warning Banner */}
            {(() => {
              const inTransit = cancelModalOrder && ((cancelModalOrder.status || '').toLowerCase().includes('ship') || (cancelModalOrder.status || '').toLowerCase().includes('transit') || (cancelModalOrder.status || '').toLowerCase().includes('out for'));
              if (inTransit) {
                return (
                  <View style={[styles.mobileRefundBanner, { backgroundColor: '#FFF1F2', borderColor: '#F43F5E' }]}>
                    <View style={styles.mobileRsbRow}>
                      <Text style={[styles.mobileRsbLabel, { color: '#BE123C' }]}>CANCELLATION REFUND AMOUNT</Text>
                      <Text style={[styles.mobileRsbAmount, { color: '#BE123C' }]}>₹ 0.00</Text>
                    </View>
                    <Text style={[styles.mobileRsbSub, { color: '#9F1239', fontWeight: '600' }]}>
                      ⚠️ Warning: Your package has already started transit via Blue Dart. After starting transit, the cancellation amount will NOT be refunded (₹0 refund).
                    </Text>
                  </View>
                );
              }
              return (
                <View style={styles.mobileRefundBanner}>
                  <View style={styles.mobileRsbRow}>
                    <Text style={styles.mobileRsbLabel}>100% REFUND AMOUNT</Text>
                    <Text style={styles.mobileRsbAmount}>{cancelModalOrder?.total || 'Full Paid Amount'}</Text>
                  </View>
                  <Text style={styles.mobileRsbSub}>Reversed directly to source payment method (₹0 deductions)</Text>
                  <View style={styles.mobileSlaRow}>
                    <View style={[styles.mobileSlaPill, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
                      <Text style={styles.mobileSlaTextTop}>⚡ UPI</Text>
                      <Text style={styles.mobileSlaTextBot}>Within 24h</Text>
                    </View>
                    <View style={styles.mobileSlaPill}>
                      <Text style={styles.mobileSlaTextTop}>💳 Cards</Text>
                      <Text style={styles.mobileSlaTextBot}>3 - 5 Days</Text>
                    </View>
                    <View style={styles.mobileSlaPill}>
                      <Text style={styles.mobileSlaTextTop}>🏦 Net Banking</Text>
                      <Text style={styles.mobileSlaTextBot}>5 - 7 Days</Text>
                    </View>
                  </View>
                </View>
              );
            })()}

              {/* Reason Selector */}
              <Text style={styles.mobileFormSectionTitle}>Reason for Cancellation *</Text>
              <View style={{ gap: 8, marginVertical: 8 }}>
                {MOBILE_CANCELLATION_REASONS.map(reason => {
                  const isSelected = cancelReasonId === reason.id;
                  return (
                    <TouchableOpacity
                      key={reason.id}
                      style={[styles.mobileReasonTile, isSelected && styles.mobileReasonTileSelectedDanger]}
                      onPress={() => setCancelReasonId(reason.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.mobileRadioCircle, isSelected && { borderColor: '#DC2626' }]}>
                        {isSelected && <View style={[styles.mobileRadioInner, { backgroundColor: '#DC2626' }]} />}
                      </View>
                      <View style={styles.mobileReasonTextCol}>
                        <Text style={[styles.mobileReasonTitle, isSelected && { color: '#9F1239' }]}>{reason.title}</Text>
                        <Text style={styles.mobileReasonDesc}>{reason.desc}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {cancelReasonId === 'address' && (
                <View style={styles.mobileTipBanner}>
                  <Ionicons name="information-circle" size={16} color="#1D4ED8" />
                  <Text style={styles.mobileTipText}>
                    Want to change delivery address? Our dispatch team can update your address before courier handover without cancelling.
                  </Text>
                </View>
              )}

              {/* Additional Comments */}
              <Text style={[styles.mobileFormSectionTitle, { marginTop: 10 }]}>Comments (Optional)</Text>
              <TextInput
                style={styles.mobileTextInput}
                placeholder="Share any comments with our team..."
                placeholderTextColor="#94A3B8"
                value={cancelNotes}
                onChangeText={setCancelNotes}
                multiline
                numberOfLines={2}
              />
            </ScrollView>

            <View style={styles.mobileModalFooterRow}>
              <TouchableOpacity
                style={styles.mobileBtnSecondary}
                onPress={() => setCancelModalOrder(null)}
                disabled={isSubmittingAction}
              >
                <Text style={styles.mobileBtnSecondaryText}>Keep Order</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mobileBtnDanger}
                onPress={handleConfirmCancelOrderAction}
                disabled={isSubmittingAction}
              >
                <Text style={styles.mobileBtnDangerText}>
                  {isSubmittingAction ? 'Processing...' : 'Confirm Cancellation'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 2: MOBILE REPLACEMENT / 30-DAY RETURN MODAL
          ======================================================== */}
      <Modal
        visible={!!replacementModalOrder}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReplacementModalOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalDragHandle} />

            <View style={[styles.modalHeader, { borderBottomColor: resolutionMode === 'replacement' ? '#C7D2FE' : '#BBF7D0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={[styles.modalShieldIcon, { backgroundColor: resolutionMode === 'replacement' ? '#EEF2FF' : '#DCFCE7' }]}>
                  <Ionicons 
                    name={resolutionMode === 'replacement' ? "repeat" : "shield-checkmark"} 
                    size={22} 
                    color={resolutionMode === 'replacement' ? "#4F46E5" : "#16A34A"} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: resolutionMode === 'replacement' ? '#312E81' : '#14532D' }]} numberOfLines={1}>
                    {resolutionMode === 'replacement' ? 'Zero-Cost Replacement' : '30-Day Return & Refund'}
                  </Text>
                  <Text style={styles.modalSubtitle}>Order #{replacementModalOrder?.id || replacementModalOrder?.orderId}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseCircle}
                onPress={() => setReplacementModalOrder(null)} 
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Resolution Switcher */}
              <View style={styles.mobileResolutionSwitcher}>
                <TouchableOpacity
                  style={[styles.mobileResolutionBtn, resolutionMode === 'replacement' && styles.mobileResolutionBtnActiveIndigo]}
                  onPress={() => setResolutionMode('replacement')}
                >
                  <Text style={[styles.mobileResBadge, { backgroundColor: '#DBEAFE', color: '#1D4ED8' }]}>RECOMMENDED</Text>
                  <Text style={styles.mobileResTitle}>Free Replacement</Text>
                  <Text style={styles.mobileResSub}>₹0 pickup • Fresh unit • PV safe</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mobileResolutionBtn, resolutionMode === 'refund' && styles.mobileResolutionBtnActiveGreen]}
                  onPress={() => setResolutionMode('refund')}
                >
                  <Text style={[styles.mobileResBadge, { backgroundColor: '#DCFCE7', color: '#15803D' }]}>GUARANTEE</Text>
                  <Text style={styles.mobileResTitle}>100% Refund</Text>
                  <Text style={styles.mobileResSub}>Reversed to original payment</Text>
                </TouchableOpacity>
              </View>

              {/* Reason Selector */}
              <Text style={styles.mobileFormSectionTitle}>Reason for {resolutionMode === 'replacement' ? 'Replacement' : 'Return'} *</Text>
              <View style={{ gap: 8, marginVertical: 8 }}>
                {MOBILE_RETURN_REASONS.map(reason => {
                  const isSelected = returnReasonId === reason.id;
                  return (
                    <TouchableOpacity
                      key={reason.id}
                      style={[styles.mobileReasonTile, isSelected && styles.mobileReasonTileSelectedBlue]}
                      onPress={() => setReturnReasonId(reason.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.mobileRadioCircle, isSelected && { borderColor: '#00A3E0' }]}>
                        {isSelected && <View style={[styles.mobileRadioInner, { backgroundColor: '#00A3E0' }]} />}
                      </View>
                      <View style={styles.mobileReasonTextCol}>
                        <Text style={[styles.mobileReasonTitle, isSelected && { color: '#0369A1' }]}>{reason.title}</Text>
                        <Text style={styles.mobileReasonDesc}>{reason.desc}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Comments */}
              <Text style={[styles.mobileFormSectionTitle, { marginTop: 10 }]}>Details of Defect / Feedback</Text>
              <TextInput
                style={styles.mobileTextInput}
                placeholder="Describe the issue with the item..."
                placeholderTextColor="#94A3B8"
                value={actionNotes}
                onChangeText={setActionNotes}
                multiline
                numberOfLines={2}
              />

              {/* Condition Checkbox */}
              <TouchableOpacity
                style={styles.mobileConditionCheckRow}
                onPress={() => setConditionConfirmed(c => !c)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={conditionConfirmed ? "checkbox" : "square-outline"}
                  size={20}
                  color={conditionConfirmed ? "#00A3E0" : "#94A3B8"}
                />
                <Text style={styles.mobileConditionText}>
                  I confirm that damage occurred in transit before delivery or wrong item received, and was NOT broken or damaged after delivery by me.
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.mobileModalFooterRow}>
              <TouchableOpacity
                style={styles.mobileBtnSecondary}
                onPress={() => setReplacementModalOrder(null)}
                disabled={isSubmittingAction}
              >
                <Text style={styles.mobileBtnSecondaryText}>Keep Product</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mobileBtnPrimary,
                  resolutionMode === 'replacement' ? { backgroundColor: '#4F46E5' } : { backgroundColor: '#16A34A' }
                ]}
                onPress={handleConfirmReplacementOrReturnAction}
                disabled={isSubmittingAction || !conditionConfirmed}
              >
                <Text style={styles.mobileBtnPrimaryText}>
                  {isSubmittingAction 
                    ? 'Submitting...' 
                    : resolutionMode === 'replacement' 
                      ? 'Schedule Replacement' 
                      : 'Initiate Return'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 3: TABBED RULES & POLICIES MODAL
          ======================================================== */}
      <Modal
        visible={isRulesModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRulesModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalDragHandle} />

            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={styles.modalShieldIcon}>
                  <Ionicons name="shield-checkmark" size={22} color="#00A3E0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>Official Consumer SOP</Text>
                  <Text style={styles.modalSubtitle}>Cancellation, Replacement &amp; 100% Refund Rules</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseCircle}
                onPress={() => setIsRulesModalOpen(false)} 
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Mobile Tabs Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mobileRulesTabBar}>
              {[
                { key: 'cancellation', label: 'Cancellation' },
                { key: 'replacement', label: '7-Day Replace' },
                { key: 'refund_guarantee', label: '30-Day Refund' },
                { key: 'timelines', label: 'Banking SLA' },
              ].map(tab => {
                const isActive = activeRulesTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.mobileRulesTabBtn, isActive && styles.mobileRulesTabBtnActive]}
                    onPress={() => setActiveRulesTab(tab.key)}
                  >
                    <Text style={[styles.mobileRulesTabText, isActive && styles.mobileRulesTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {activeRulesTab === 'cancellation' && (
                <View style={styles.modalRuleSection}>
                  <View style={styles.modalRuleHeader}>
                    <View style={[styles.modalRulePill, { backgroundColor: '#E0F2FE' }]}>
                      <Text style={[styles.modalRulePillText, { color: '#0284C7' }]}>Rule 01 • Cancellation</Text>
                    </View>
                    <Text style={styles.modalRuleHeading}>Cancellation &amp; Transit Policy</Text>
                  </View>
                  <Text style={styles.modalRuleDescription}>
                    Orders can be cancelled before or after shipping. Before shipping: 100% full refund is issued instantly. After starting transit: You can cancel, but the cancellation amount will NOT be refunded (₹0 refund) as courier costs are executed.
                  </Text>
                </View>
              )}

              {activeRulesTab === 'replacement' && (
                <View style={styles.modalRuleSection}>
                  <View style={styles.modalRuleHeader}>
                    <View style={[styles.modalRulePill, { backgroundColor: '#EEF2FF' }]}>
                      <Text style={[styles.modalRulePillText, { color: '#4F46E5' }]}>Rule 02 • Replacement</Text>
                    </View>
                    <Text style={styles.modalRuleHeading}>Transit Damage &amp; Wrong Product Only</Text>
                  </View>
                  <Text style={styles.modalRuleDescription}>
                    Within 7 days of delivery, if items arrived damaged in transit before delivery (leaks, broken seals) or wrong SKU delivered, request free 1-to-1 replacement via Blue Dart. Items broken, dropped, or damaged by customer after delivery will NOT be accepted.
                  </Text>
                </View>
              )}

              {activeRulesTab === 'refund_guarantee' && (
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
              )}

              {activeRulesTab === 'timelines' && (
                <View style={styles.modalRuleSection}>
                  <View style={styles.modalRuleHeader}>
                    <View style={[styles.modalRulePill, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.modalRulePillText, { color: '#B45309' }]}>Rule 04 • Banking Timelines</Text>
                    </View>
                    <Text style={styles.modalRuleHeading}>RBI Clearing &amp; Payment SLAs</Text>
                  </View>
                  <Text style={styles.modalRuleDescription}>
                    • UPI (GPay/PhonePe/Paytm): Within 24 Hours{'\n'}
                    • Credit/Debit Cards: 3 to 5 Banking Days{'\n'}
                    • Net Banking (NEFT/IMPS): 5 to 7 Banking Days
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsRulesModalOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseBtnText}>Understood & Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 5: AUTHENTIC GST TAX INVOICE MODAL (Matching Website)
          ======================================================== */}
      {activeInvoiceOrder && (
        <Modal
          visible={Boolean(activeInvoiceOrder)}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveInvoiceOrder(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.invoiceModalCard}>
              {/* Header */}
              <View style={styles.invoiceModalHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.invoiceTagPill}>
                    <Text style={styles.invoiceTagText}>Official Tax Invoice</Text>
                  </View>
                  <Text style={styles.invoiceModalTitle}>Atomy India Order Details</Text>
                  <Text style={styles.invoiceOrderNumber}>
                    Order No: <Text style={styles.monoBold}>{activeInvoiceOrder.id}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.invoiceModalCloseBtn}
                  onPress={() => setActiveInvoiceOrder(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.invoiceModalScroll} showsVerticalScrollIndicator={false}>
                {/* Meta Grid (Order Date, Payment Method, Fulfillment Partner, Tracking AWB) */}
                <View style={styles.invoiceMetaGrid}>
                  <View style={styles.invoiceMetaCol}>
                    <Text style={styles.invoiceMetaLabel}>Order Date:</Text>
                    <Text style={styles.invoiceMetaVal}>{activeInvoiceOrder.date}</Text>
                  </View>
                  <View style={styles.invoiceMetaCol}>
                    <Text style={styles.invoiceMetaLabel}>Payment Method:</Text>
                    <Text style={styles.invoiceMetaVal}>{activeInvoiceOrder.paymentMethod || 'Online Payment'}</Text>
                  </View>
                  <View style={styles.invoiceMetaCol}>
                    <Text style={styles.invoiceMetaLabel}>Fulfillment Partner:</Text>
                    <Text style={styles.invoiceMetaVal}>{activeInvoiceOrder.courier || 'Blue Dart Express'}</Text>
                  </View>
                  <View style={styles.invoiceMetaCol}>
                    <Text style={styles.invoiceMetaLabel}>Tracking AWB:</Text>
                    <Text style={[styles.invoiceMetaVal, styles.monoBold]}>{activeInvoiceOrder.awb || `BD-${activeInvoiceOrder.id}`}</Text>
                  </View>
                </View>

                {/* Delivery Destination */}
                <View style={styles.invoiceShippingBox}>
                  <Text style={styles.invoiceShippingBoxLabel}>Delivery Destination:</Text>
                  <Text style={styles.invoiceShippingBoxText}>
                    {activeInvoiceOrder.shippingAddress || 'Registered Delivery Address'}
                  </Text>
                </View>

                {/* Items List */}
                <View style={styles.invoiceItemsSection}>
                  <Text style={styles.invoiceSectionTitle}>Ordered Items</Text>
                  {(activeInvoiceOrder.items && activeInvoiceOrder.items.length > 0 ? activeInvoiceOrder.items : [
                    {
                      name: activeInvoiceOrder.title,
                      qty: activeInvoiceOrder.itemsCount || 1,
                      price: typeof activeInvoiceOrder.total === 'string'
                        ? parseFloat(activeInvoiceOrder.total.replace(/[^0-9.]/g, '')) || 0
                        : activeInvoiceOrder.total || 0,
                    }
                  ]).map((it, idx) => {
                    const unitPrice = typeof it.price === 'number' ? it.price : parseFloat(String(it.price || '0').replace(/[^0-9.]/g, '')) || 0;
                    const qty = it.qty || 1;
                    const lineTotal = unitPrice * qty;
                    return (
                      <View key={idx} style={styles.invoiceItemRow}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.invoiceItemName} numberOfLines={2}>{it.name}</Text>
                          <Text style={styles.invoiceItemUnit}>Qty: {qty} • ₹ {unitPrice.toLocaleString('en-IN')} each</Text>
                        </View>
                        <Text style={styles.invoiceItemTotal}>₹ {lineTotal.toLocaleString('en-IN')}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Totals Summary */}
                {(() => {
                  const rawTotal = typeof activeInvoiceOrder.total === 'string'
                    ? parseFloat(activeInvoiceOrder.total.replace(/[^0-9.]/g, '')) || 0
                    : activeInvoiceOrder.total || 0;
                  return (
                    <View style={styles.invoiceTotalsSummary}>
                      <View style={styles.invoiceSummaryRow}>
                        <Text style={styles.invoiceSummaryLabel}>Subtotal:</Text>
                        <Text style={styles.invoiceSummaryValue}>₹ {rawTotal.toLocaleString('en-IN')}</Text>
                      </View>
                      <View style={styles.invoiceSummaryRow}>
                        <Text style={styles.invoiceSummaryLabel}>Shipping Fee:</Text>
                        <Text style={styles.invoiceFreeShipping}>FREE (Standard Atomy Delivery)</Text>
                      </View>
                      {activeInvoiceOrder.pv && (
                        <View style={styles.invoiceSummaryRow}>
                          <Text style={styles.invoiceSummaryLabel}>Accumulated PV:</Text>
                          <Text style={styles.invoicePvHighlight}>{activeInvoiceOrder.pv}</Text>
                        </View>
                      )}
                      <View style={[styles.invoiceSummaryRow, styles.invoiceGrandTotalRow]}>
                        <Text style={styles.invoiceGrandTotalLabel}>Grand Total (incl. GST):</Text>
                        <Text style={styles.invoiceGrandTotalValue}>₹ {rawTotal.toLocaleString('en-IN')}</Text>
                      </View>
                    </View>
                  );
                })()}
              </ScrollView>

              {/* Footer Action Buttons */}
              <View style={styles.invoiceModalFooter}>
                <TouchableOpacity
                  style={styles.invoiceCloseActionBtn}
                  onPress={() => setActiveInvoiceOrder(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.invoiceCloseActionText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.invoiceTrackActionBtn}
                  onPress={() => {
                    const ordId = activeInvoiceOrder.id;
                    setActiveInvoiceOrder(null);
                    setExpandedOrderId(ordId);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.invoiceTrackActionText}>Track Consignment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    height: 40,
    borderRadius: 8,
    gap: 6,
  },
  invoiceBtnText: {
    color: '#00A3E0',
    fontSize: 12,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    height: 40,
    borderRadius: 8,
    gap: 5,
  },
  trackOrderBtnActive: {
    backgroundColor: '#00A3E0',
    borderColor: '#0284C7',
  },
  trackOrderBtnText: {
    fontSize: 12,
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  mobileTrackerBtnPair: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    width: '100%',
  },
  mobileActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  mobileCancelBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  mobileCancelBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  mobileReplaceBtn: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  mobileReplaceBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  mobileReturnBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  mobileReturnBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  mobileRulesBtn: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  mobileRulesBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  mobileCancelledNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  mobileCancelledNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },

  /* Card Customer Actions Row (inside past order card) */
  cardCustomerActionsRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  cardCustomerBtnRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    alignItems: 'center',
  },
  customerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelActionBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    flex: 1.4,
  },
  cancelActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  rulesActionBtn: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    flex: 1,
  },
  rulesActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  replaceActionBtn: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    flex: 1,
  },
  replaceActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  returnActionBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    flex: 1,
  },
  returnActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  policyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 5,
    marginTop: 2,
  },
  policyLinkText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  cancelledStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 8,
    gap: 8,
  },
  cancelledStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cancelledStatusTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  cancelledStatusSub: {
    fontSize: 10,
    color: '#991B1B',
    marginTop: 1,
  },
  cancelledRulesBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  cancelledRulesBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#DC2626',
  },

  /* Modern Mobile Bottom-Sheet Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '100%',
    maxHeight: '92%',
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalDragHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 2,
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
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1.5,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
  },

  /* Mobile Modal Breakdown, Reason Tiles & Tabs Styles */
  mobileRefundBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  mobileRsbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mobileRsbLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9F1239',
    letterSpacing: 0.5,
  },
  mobileRsbAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: '#DC2626',
  },
  mobileRsbSub: {
    fontSize: 11,
    color: '#BE123C',
    marginBottom: 10,
  },
  mobileSlaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  mobileSlaPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileSlaTextTop: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  mobileSlaTextBot: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 2,
  },
  mobileFormSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  mobileReasonTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  mobileReasonTileSelectedDanger: {
    borderColor: '#DC2626',
    backgroundColor: '#FFF5F5',
  },
  mobileReasonTileSelectedBlue: {
    borderColor: '#00A3E0',
    backgroundColor: '#F0F9FF',
  },
  mobileRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  mobileReasonTextCol: {
    flex: 1,
  },
  mobileReasonTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  mobileReasonDesc: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1.5,
    lineHeight: 14,
  },
  mobileTipBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 10,
    marginTop: 6,
    marginBottom: 6,
  },
  mobileTipText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 15,
  },
  mobileTextInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 56,
    textAlignVertical: 'top',
    marginBottom: 6,
  },
  mobileModalFooterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  mobileBtnSecondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBtnSecondaryText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  mobileBtnDanger: {
    flex: 1.4,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBtnDangerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  mobileResolutionSwitcher: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  mobileResolutionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  mobileResolutionBtnActiveIndigo: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  mobileResolutionBtnActiveGreen: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  mobileResBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  mobileResTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  mobileResSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  mobileConditionCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 11,
    marginTop: 8,
    marginBottom: 8,
  },
  mobileConditionText: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    lineHeight: 15,
  },
  mobileBtnPrimary: {
    flex: 1.4,
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  mobileRulesTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  mobileRulesTabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    marginRight: 4,
  },
  mobileRulesTabBtnActive: {
    borderBottomColor: '#00A3E0',
  },
  mobileRulesTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  mobileRulesTabTextActive: {
    color: '#00A3E0',
    fontWeight: '800',
  },
  // Inline Order Tracking Stepper inside Order Card
  orderInlineTrackerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  inlineTrackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 6,
  },
  inlineTrackerMeta: {
    flex: 1,
    marginRight: 8,
  },
  inlineMetaText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  inlineMetaSep: {
    color: '#CBD5E1',
  },
  inlineTrackerCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  inlineTrackerCloseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  inlineTrackerDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#BAE6FD',
    marginTop: 8,
  },
  inlineTrackerDestText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
  },
  cancelTrackBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
  },
  cancelTrackBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  deliveredTrackBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  deliveredTrackBtnActive: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
  },

  // Official GST Tax Invoice Modal Styles
  invoiceModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    width: '94%',
    maxWidth: 520,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  invoiceModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  invoiceTagPill: {
    backgroundColor: '#E0F2FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginBottom: 4,
  },
  invoiceTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  invoiceModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  invoiceOrderNumber: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  invoiceModalCloseBtn: {
    padding: 4,
  },
  invoiceModalScroll: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  invoiceMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  invoiceMetaCol: {
    width: '47%',
    marginBottom: 4,
  },
  invoiceMetaLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  invoiceMetaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  invoiceShippingBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  invoiceShippingBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 2,
  },
  invoiceShippingBoxText: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 16,
  },
  invoiceItemsSection: {
    marginBottom: 12,
  },
  invoiceSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  invoiceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  invoiceItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  invoiceItemUnit: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  invoiceItemTotal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  invoiceTotalsSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  invoiceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  invoiceSummaryLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  invoiceSummaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  invoiceFreeShipping: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  invoicePvHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A3E0',
  },
  invoiceGrandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    marginTop: 6,
    paddingTop: 6,
  },
  invoiceGrandTotalLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  invoiceGrandTotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00A3E0',
  },
  invoiceModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  invoiceCloseActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceCloseActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  invoiceTrackActionBtn: {
    flex: 1.6,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#00A3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  invoiceTrackActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
