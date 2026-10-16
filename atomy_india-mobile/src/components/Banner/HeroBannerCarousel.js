import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HERO_SLIDES } from '../../data/mockData';
import { COLORS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Authentic mobile banners: 720 x 400 (aspect ratio 1.8) edge-to-edge
const BANNER_HEIGHT = Math.round(SCREEN_WIDTH * (400 / 720));

// Staggered animated text overlay that hides when inactive and smoothly appears with a time-lapse delay when active
function SlideTextOverlay({ item, isActive }) {
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Start hidden
      subtitleAnim.setValue(0);
      titleAnim.setValue(0);
      arrowAnim.setValue(0);

      // Staggered entrance animation: subtitle first, title second, arrow third
      Animated.parallel([
        Animated.timing(subtitleAnim, {
          toValue: 1,
          duration: 480,
          delay: 180, // brief time-lapse before appearing
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 520,
          delay: 320, // staggered time-lapse
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 450,
          delay: 480, // arrow glides in
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      // Hide smoothly when slide transitions away
      Animated.parallel([
        Animated.timing(subtitleAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(titleAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [isActive]);

  const subtitleTranslateY = subtitleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const titleTranslateY = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  const arrowTranslateX = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  return (
    <View style={styles.textOverlay} pointerEvents="none">
      {item.subtitle ? (
        <Animated.View
          style={{
            opacity: subtitleAnim,
            transform: [{ translateY: subtitleTranslateY }],
          }}
        >
          <Text
            style={[
              styles.slideSubtitle,
              { color: item.textColor || '#222222' },
            ]}
            numberOfLines={2}
          >
            {item.subtitle}
          </Text>
        </Animated.View>
      ) : null}

      {item.title ? (
        <Animated.View
          style={{
            opacity: titleAnim,
            transform: [{ translateY: titleTranslateY }],
          }}
        >
          <Text
            style={[
              styles.slideTitle,
              { color: item.textColor || '#222222' },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </Animated.View>
      ) : null}

      {item.desc ? (
        <Animated.View
          style={{
            opacity: titleAnim,
            transform: [{ translateY: titleTranslateY }],
          }}
        >
          <Text
            style={[
              styles.slideDesc,
              { color: item.textColor || '#555555' },
            ]}
            numberOfLines={2}
          >
            {item.desc}
          </Text>
        </Animated.View>
      ) : null}

      <Animated.View
        style={[
          styles.arrowIndicatorWrap,
          {
            opacity: arrowAnim,
            transform: [{ translateX: arrowTranslateX }],
          },
        ]}
      >
        <View
          style={[
            styles.arrowStem,
            { backgroundColor: item.textColor || '#222222' },
          ]}
        />
        <Ionicons
          name="arrow-forward"
          size={15}
          color={item.textColor || '#222222'}
          style={styles.arrowIcon}
        />
      </Animated.View>
    </View>
  );
}

export default function HeroBannerCarousel({
  slides = HERO_SLIDES,
  onSlidePress,
  onOpenAllSlides,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const flatListRef = useRef(null);

  // Auto-slide effect every 4.5 seconds (respects pause state)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [activeIndex, slides.length, isPaused]);

  const handleMomentumScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const renderSlideItem = ({ item, index }) => {
    const isActive = index === activeIndex;

    return (
      <TouchableOpacity
        style={[styles.slideContainer, { backgroundColor: item.bg || '#F1F5F9' }]}
        activeOpacity={0.92}
        onPress={() => onSlidePress && onSlidePress(item)}
      >
        {/* Mobile Banner: edge-to-edge cover like on landing page */}
        <Image
          source={
            typeof (item.img || item.image) === 'string'
              ? { uri: item.img || item.image }
              : (item.img || item.image)
          }
          style={styles.bannerImage}
          resizeMode="cover"
        />

        {/* Text Overlay for ad slides with smooth time-lapse hide & appear transition */}
        {item.hasTextOverlay && (
          <SlideTextOverlay item={item} isActive={isActive} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={flatListRef}
        data={slides}
        extraData={activeIndex}
        renderItem={renderSlideItem}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Floating Control Box matching reference screenshot: [2/9  ||  [=]] */}
      <View style={styles.controlBox}>
        {/* Slide Counter */}
        <Text style={styles.controlCounterText}>
          {activeIndex + 1}/{slides.length}
        </Text>

        {/* Play/Pause Toggle Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsPaused(!isPaused)}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessibilityLabel={isPaused ? 'Resume auto slide' : 'Pause auto slide'}
        >
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={11}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* View All Slides Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onOpenAllSlides && onOpenAllSlides()}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessibilityLabel="View all banner slides"
        >
          <Ionicons
            name="copy-outline"
            size={12}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerImage: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
  },
  textOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 20,
    width: '48%',
    justifyContent: 'center',
    zIndex: 5,
  },
  slideSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  slideTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 23,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  slideDesc: {
    fontSize: 10.5,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 14,
    marginBottom: 8,
  },
  arrowIndicatorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  arrowStem: {
    width: 26,
    height: 1.8,
  },
  arrowIcon: {
    marginLeft: -4,
  },
  controlBox: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Dark translucent pill matching reference image
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  controlCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
