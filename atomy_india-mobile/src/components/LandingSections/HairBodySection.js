import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HAIR_BODY_PRODUCTS } from '../../data/mockData';
import LandingProductCard from '../Products/LandingProductCard';

const CARD_WIDTH = 158;
const ITEM_CARD_OFFSET = 170; // 158 card width + 12 margin (leaves 3rd card peeking)
const TRACK_WIDTH = 76;

export default function HairBodySection({
  onAddToCart,
  onProductClick,
  favorites = [],
  onToggleFavorite,
  isMember = false,
  onJoinMemberPress,
}) {
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentWidth, setContentWidth] = useState(HAIR_BODY_PRODUCTS.length * ITEM_CARD_OFFSET);
  const [containerWidth, setContainerWidth] = useState(360);

  const maxScroll = Math.max(1, contentWidth - containerWidth);
  const thumbWidth = Math.max(20, Math.min(40, Math.round(TRACK_WIDTH * (containerWidth / Math.max(containerWidth, contentWidth)))));

  const thumbTranslateX = scrollX.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, TRACK_WIDTH - thumbWidth],
    extrapolate: 'clamp',
  });

  const scrollToIndex = (idx) => {
    const clamped = Math.max(0, Math.min(HAIR_BODY_PRODUCTS.length - 1, idx));
    setActiveIndex(clamped);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: clamped * ITEM_CARD_OFFSET,
        animated: true,
      });
    }
  };

  const scrollNext = () => scrollToIndex(activeIndex + 1);
  const scrollPrev = () => scrollToIndex(activeIndex - 1);

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header with Prominent Scroll Indication */}
      <View style={styles.headerBlock}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleCol}>
            <Text style={styles.mainTitle}>{"Atomy India Hair & Body\nEssential"}</Text>
            <Text style={styles.subTitle}>Essential Quality for Head-to-Toe Wellness</Text>
          </View>

          {/* Prominent Header Scroll Indicator: [ < ] 1/6 [ > ] */}
          <View style={styles.headerScrollIndicator}>
            <TouchableOpacity
              style={[styles.arrowCircleBtn, activeIndex === 0 && styles.arrowCircleDisabled]}
              onPress={scrollPrev}
              disabled={activeIndex === 0}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Previous product"
            >
              <Ionicons name="chevron-back" size={15} color={activeIndex === 0 ? "#CBD5E1" : "#00A3E0"} />
            </TouchableOpacity>

            <Text style={styles.counterBadgeText}>
              <Text style={styles.counterBadgeActive}>{activeIndex + 1}</Text>/{HAIR_BODY_PRODUCTS.length}
            </Text>

            <TouchableOpacity
              style={[styles.arrowCircleBtn, activeIndex >= HAIR_BODY_PRODUCTS.length - 1 && styles.arrowCircleDisabled]}
              onPress={scrollNext}
              disabled={activeIndex >= HAIR_BODY_PRODUCTS.length - 1}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Next product"
            >
              <Ionicons name="chevron-forward" size={15} color={activeIndex >= HAIR_BODY_PRODUCTS.length - 1 ? "#CBD5E1" : "#00A3E0"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Horizontal Product Cards Slider with Floating Navigation Arrows & Card Peeking */}
      <View style={styles.sliderWrapper}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsScroll}
          onContentSizeChange={(w) => setContentWidth(w)}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
              listener: (e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const idx = Math.min(
                  HAIR_BODY_PRODUCTS.length - 1,
                  Math.max(0, Math.round(offsetX / ITEM_CARD_OFFSET))
                );
                if (idx !== activeIndex) {
                  setActiveIndex(idx);
                }
              },
            }
          )}
          scrollEventThrottle={16}
        >
          {HAIR_BODY_PRODUCTS.map((product) => {
            const isFav = favorites.includes(product.id);
            return (
              <LandingProductCard
                key={product.id}
                product={product}
                isFavorite={isFav}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onPress={onProductClick}
                isMember={isMember}
                onJoinMemberPress={onJoinMemberPress}
                cardWidth={CARD_WIDTH}
              />
            );
          })}
        </Animated.ScrollView>

        {/* Floating Side Arrow Buttons for immediate visible scroll cue */}
        {activeIndex < HAIR_BODY_PRODUCTS.length - 1 && (
          <TouchableOpacity
            style={styles.floatingRightArrow}
            onPress={scrollNext}
            activeOpacity={0.85}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Scroll next"
          >
            <Ionicons name="chevron-forward" size={18} color="#00A3E0" />
          </TouchableOpacity>
        )}
        {activeIndex > 0 && (
          <TouchableOpacity
            style={styles.floatingLeftArrow}
            onPress={scrollPrev}
            activeOpacity={0.85}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Scroll previous"
          >
            <Ionicons name="chevron-back" size={18} color="#00A3E0" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Side Scrolling Indications: Progress Track & Interactive Dots */}
      {HAIR_BODY_PRODUCTS.length > 1 && (
        <View style={styles.indicationsContainer}>
          {/* Animated Scroll Progress Track */}
          <View style={styles.scrollTrack}>
            <Animated.View
              style={[
                styles.scrollThumb,
                {
                  width: thumbWidth,
                  transform: [{ translateX: thumbTranslateX }],
                },
              ]}
            />
          </View>

          {/* Interactive Pagination Dots */}
          <View style={styles.dotsRow}>
            {HAIR_BODY_PRODUCTS.map((product, idx) => {
              const isActive = idx === activeIndex;
              return (
                <TouchableOpacity
                  key={`dot-${product.id || idx}`}
                  activeOpacity={0.7}
                  onPress={() => scrollToIndex(idx)}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  style={[
                    styles.indicatorDot,
                    isActive && styles.indicatorDotActive,
                  ]}
                  accessibilityLabel={`Scroll to product ${idx + 1}`}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBlock: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleCol: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  headerScrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 4,
  },
  arrowCircleBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A3E0',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  arrowCircleDisabled: {
    backgroundColor: '#F8FAFC',
    shadowOpacity: 0,
    elevation: 0,
  },
  counterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    minWidth: 26,
    textAlign: 'center',
  },
  counterBadgeActive: {
    color: '#00A3E0',
    fontWeight: '800',
  },
  sliderWrapper: {
    position: 'relative',
  },
  productsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  floatingRightArrow: {
    position: 'absolute',
    right: 6,
    top: '38%',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  floatingLeftArrow: {
    position: 'absolute',
    left: 6,
    top: '38%',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  indicationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 8,
  },
  scrollTrack: {
    width: TRACK_WIDTH,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  scrollThumb: {
    height: '100%',
    borderRadius: 1.5,
    backgroundColor: '#00A3E0',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  indicatorDot: {
    width: 6,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  indicatorDotActive: {
    width: 18,
    backgroundColor: '#00A3E0',
  },
});
