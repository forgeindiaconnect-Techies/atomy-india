import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const defaultPromoPoster = require('../../../assets/new_arrival_adelica.png');
const kolkataNoticePoster = require('../../../assets/promo_kolkata_notice.jpg');
const welcomeCouponPoster = require('../../../assets/promo_welcome_coupon.jpg');
const joiningRewardsPoster = require('../../../assets/promo_500_joining.jpg');

export function resolveImageSource(img) {
  if (!img) return defaultPromoPoster;
  if (typeof img === 'number') return img;
  if (typeof img !== 'string') return defaultPromoPoster;
  const trimmed = img.trim();
  if (trimmed === 'promo_kolkata_notice' || trimmed.includes('promo_kolkata_notice')) {
    return kolkataNoticePoster;
  }
  if (trimmed === 'promo_welcome_coupon' || trimmed.includes('promo_welcome_coupon')) {
    return welcomeCouponPoster;
  }
  if (trimmed === 'promo_500_joining' || trimmed.includes('promo_500_joining')) {
    return joiningRewardsPoster;
  }
  if (trimmed === 'new_arrival_adelica' || trimmed.includes('new_arrival_adelica')) {
    return defaultPromoPoster;
  }
  if (trimmed.startsWith('data:image') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { uri: trimmed };
  }
  if (trimmed.startsWith('/images/')) {
    return { uri: `http://localhost:5173${trimmed}` };
  }
  return defaultPromoPoster;
}

export default function FloatingAdModal({
  visible,
  adConfig,
  onClose,
  onAddToCart,
  onOrderNow,
  onOpenModal,
  showFloatingCard = true,
  scrollAnim,
}) {
  const [doNotShowToday, setDoNotShowToday] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Scroll hide animation (synced with bottom navigation bar)
  const fallbackScrollAnim = useRef(new Animated.Value(0)).current;
  const activeScrollAnim = scrollAnim || fallbackScrollAnim;

  // Floating bubble animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showFloatingCard || visible) return;

    // Organic breathing scale pulse & gentle vertical bobbing
    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(bobAnim, {
            toValue: -4,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(bobAnim, {
            toValue: 0,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ])
    );

    // Continuous glowing radar ripple wave (starts from circle perimeter, expands & fades cleanly)
    const rippleLoop = Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 1900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      })
    );

    breathingLoop.start();
    rippleLoop.start();

    return () => {
      breathingLoop.stop();
      rippleLoop.stop();
    };
  }, [showFloatingCard, visible]);

  // Dynamic calculations to display the FULL promotional poster without cropping
  const maxAvailableCardHeight = Math.min((screenHeight || 800) * 0.90, 720);
  const BOTTOM_CONTROLS_HEIGHT = 120;
  const maxPosterHeight = maxAvailableCardHeight - BOTTOM_CONTROLS_HEIGHT;

  // Aspect ratio to reveal full flyer
  const POSTER_RATIO = 1.45;
  const baseCardWidth = Math.min(screenWidth - 32, 420);
  const cardWidth = Math.min(baseCardWidth, Math.floor(maxPosterHeight / POSTER_RATIO));
  const posterHeight = Math.round(cardWidth * POSTER_RATIO);

  // Active ad banners list (from adConfig.ads if available, otherwise single fallback)
  const adsList = (Array.isArray(adConfig?.ads) && adConfig.ads.length > 0)
    ? adConfig.ads.filter((a) => a.isActive !== false)
    : [
        {
          id: adConfig?.id || 'D00620',
          name: adConfig?.name || 'Adelica Soft Brow Pencil - Gray',
          price: adConfig?.price || 700,
          pv: adConfig?.pv || 4000,
          badge: adConfig?.badge || 'NEW LAUNCH',
          image: adConfig?.image,
          isActive: true
        }
      ];

  const safeIndex = currentSlideIndex < adsList.length ? currentSlideIndex : 0;
  const currentAd = adsList[safeIndex] || adsList[0];

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : adsList.length - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev < adsList.length - 1 ? prev + 1 : 0));
  };

  const handleDismiss = () => {
    if (onClose) {
      onClose(doNotShowToday);
    }
  };

  const handleCart = () => {
    if (onAddToCart) {
      onAddToCart({
        id: currentAd.id || 'D00620',
        name: currentAd.name || currentAd.title || 'Atomy Product',
        price: currentAd.price || 700,
        mrp: currentAd.mrp || 850,
        pv: currentAd.pv || 4000,
        img: currentAd.image || 'https://image.atomy.com/IN/goods/D00620/D00620_00.jpg',
      });
    }
    handleDismiss();
  };

  const handleBuy = () => {
    if (onOrderNow) {
      onOrderNow({
        id: currentAd.id || 'D00620',
        name: currentAd.name || currentAd.title || 'Atomy Product',
        price: currentAd.price || 700,
        mrp: currentAd.mrp || 850,
        pv: currentAd.pv || 4000,
        img: currentAd.image || 'https://image.atomy.com/IN/goods/D00620/D00620_00.jpg',
      });
    }
    handleDismiss();
  };

  const isProduct = Number(currentAd?.price || 0) > 0;
  const currentImageSource = resolveImageSource(currentAd?.image);
  const bubbleImageSource = resolveImageSource(adsList[0]?.image);

  return (
    <>
      {/* 1. FIXED TRANSPARENT FLOATING AD BUBBLE (Docked at bottom-left, animated effects & scroll hide) */}
      {showFloatingCard && !visible && (
        <Animated.View
          style={[
            styles.floatingBubbleContainer,
            {
              opacity: activeScrollAnim.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [1, 0.5, 0],
              }),
              transform: [
                {
                  translateY: Animated.add(
                    bobAnim,
                    activeScrollAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 140],
                    })
                  ),
                },
                { scale: pulseAnim },
              ],
            },
          ]}
          pointerEvents={showFloatingCard && !visible ? 'auto' : 'none'}
        >
          {/* Animated Glowing Ripple Wave Ring - Perfectly centered behind button */}
          <Animated.View
            style={[
              styles.floatingBubbleRipple,
              {
                transform: [
                  {
                    scale: rippleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.42],
                    }),
                  },
                ],
                opacity: rippleAnim.interpolate({
                  inputRange: [0, 0.15, 0.7, 1],
                  outputRange: [0, 0.65, 0.25, 0],
                }),
              },
            ]}
            pointerEvents="none"
          />

          <TouchableOpacity
            style={styles.floatingBubbleBtn}
            activeOpacity={0.82}
            onPress={onOpenModal}
            accessibilityLabel={`View Promotional Ads (${adsList.length})`}
            accessibilityRole="button"
          >
            {/* Circular Thumbnail with image */}
            <Image
              source={bubbleImageSource}
              style={styles.floatingBubbleImg}
              resizeMode="cover"
            />

            {/* Glowing inner rim */}
            <View style={styles.floatingBubbleInnerGlow} pointerEvents="none" />

            {/* Bottom ribbon badge with sparkle */}
            <View style={styles.floatingBubbleBadge}>
              <Ionicons name="sparkles" size={8} color="#FFE066" style={{ marginRight: 2 }} />
              <Text style={styles.floatingBubbleBadgeText}>
                {adsList.length > 1 ? `${adsList.length} ADS` : 'NEW'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* 2. FULL PROMOTIONAL POPUP MODAL (Multi-banner with arrows & dots matching Image 2) */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDismiss}
        statusBarTranslucent={true}
      >
        <View style={styles.overlay}>
          {/* Backdrop tap to dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={handleDismiss}
          />

          <View style={[styles.modalCard, { width: cardWidth }]}>
            {/* Poster Container with relative positioning for navigation arrows */}
            <View style={[styles.posterContainer, { height: posterHeight }]}>
              <Image
                source={currentImageSource}
                style={styles.posterImage}
                resizeMode="cover"
              />

              {/* Navigation Left Arrow matching Image 2 */}
              {adsList.length > 1 && (
                <TouchableOpacity
                  style={[styles.arrowButton, styles.arrowLeft]}
                  onPress={handlePrevSlide}
                  activeOpacity={0.8}
                  accessibilityLabel="Previous ad banner"
                >
                  <Ionicons name="chevron-back" size={24} color="rgba(255, 255, 255, 0.95)" />
                </TouchableOpacity>
              )}

              {/* Navigation Right Arrow matching Image 2 */}
              {adsList.length > 1 && (
                <TouchableOpacity
                  style={[styles.arrowButton, styles.arrowRight]}
                  onPress={handleNextSlide}
                  activeOpacity={0.8}
                  accessibilityLabel="Next ad banner"
                >
                  <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.95)" />
                </TouchableOpacity>
              )}

              {/* Tag / Badge Top overlay */}
              {currentAd?.badge && (
                <View style={styles.posterBadgeWrap}>
                  <Text style={styles.posterBadgeText}>{currentAd.badge}</Text>
                </View>
              )}
            </View>

            {/* Pagination Dot Indicators matching Image 2 ● ○ ○ ○ */}
            {adsList.length > 1 && (
              <View style={styles.dotsContainer}>
                {adsList.map((_, dotIdx) => (
                  <TouchableOpacity
                    key={dotIdx}
                    onPress={() => setCurrentSlideIndex(dotIdx)}
                    style={[
                      styles.dotIndicator,
                      dotIdx === safeIndex && styles.dotIndicatorActive,
                    ]}
                    accessibilityLabel={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </View>
            )}

            {/* Action Bar */}
            {isProduct ? (
              <View style={styles.actionBar}>
                <TouchableOpacity
                  style={styles.btnCart}
                  onPress={handleCart}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cart-outline" size={17} color="#00A3E0" />
                  <Text style={styles.btnCartText}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnBuy}
                  onPress={handleBuy}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnBuyText}>
                    Order Now (₹{currentAd.price})
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.promoInfoBar}>
                <Text style={styles.promoHeadline} numberOfLines={1}>
                  {currentAd.name || currentAd.title}
                </Text>
                <TouchableOpacity
                  style={styles.btnPromoAction}
                  onPress={handleDismiss}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnPromoActionText}>
                    {currentAd.actionText || 'View Details'}
                  </Text>
                  <Ionicons name="arrow-forward" size={15} color="#00A3E0" />
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Bar: Do Not Show Today & Close Button matching Image 2 */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setDoNotShowToday((prev) => !prev)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkboxBox, doNotShowToday && styles.checkboxBoxActive]}>
                  {doNotShowToday && (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Do not show again today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleDismiss}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = Math.min(width - 36, 400);

const styles = StyleSheet.create({
  // Fixed Transparent Floating Ad Trigger (Matches user's circular thumbnail with effects)
  floatingBubbleContainer: {
    position: 'absolute',
    bottom: 74,
    left: 16,
    width: 56,
    height: 56,
    zIndex: 9998,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBubbleRipple: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#00A3E0',
    backgroundColor: 'rgba(0, 163, 224, 0.12)',
    zIndex: -1,
  },
  floatingBubbleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#00A3E0',
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 9,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'transform 0.2s ease, opacity 0.2s ease',
        }
      : {}),
  },
  floatingBubbleImg: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  floatingBubbleInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  floatingBubbleBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#00A3E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1.5,
  },
  floatingBubbleBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Modal Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    zIndex: 99999,
    ...(Platform.OS === 'web'
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }
      : {}),
  },
  modalCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 25,
  },
  posterContainer: {
    width: '100%',
    height: 520,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? { objectPosition: 'top center' } : {}),
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  btnCart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#BAE6FD',
    gap: 6,
  },
  btnCartText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  btnBuy: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: '#00A3E0',
    borderRadius: 10,
    gap: 6,
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnBuyText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFBFD',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#00A3E0',
    borderColor: '#00A3E0',
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Carousel Navigation Arrows matching Image 2
  arrowButton: {
    position: 'absolute',
    top: '48%',
    width: 38,
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    zIndex: 10,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },
  // Dots pagination container matching Image 2 ● ○ ○ ○
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  dotIndicatorActive: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#1E293B',
  },
  posterBadgeWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backdropFilter: 'blur(4px)',
  },
  posterBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Promotion Info bar (when ad is not a priced product)
  promoInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  promoHeadline: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 10,
  },
  btnPromoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  btnPromoActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
});
