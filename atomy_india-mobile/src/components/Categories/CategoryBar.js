import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
  Easing,
} from 'react-native';
import Svg, { SvgUri, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../../data/mockData';
import { COLORS } from '../../constants/theme';

function CategoryIcon({ item, size = 32 }) {
  const [hasSvgError, setHasSvgError] = useState(false);

  // On Web, native <img> handles SVG perfectly
  if (Platform.OS === 'web') {
    return (
      <Image
        source={{ uri: item.icon }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  // On Native (Android / iOS)
  if (!hasSvgError && item.icon) {
    return (
      <SvgUri
        uri={item.icon}
        width={size}
        height={size}
        onError={() => setHasSvgError(true)}
      />
    );
  }

  // Fallback to high-quality Ionicons with tailored category color
  return (
    <Ionicons
      name={item.fallbackIcon || 'grid-outline'}
      size={size - 4}
      color={item.color || COLORS.primary}
    />
  );
}

export default function CategoryBar({
  categories = CATEGORIES,
  selectedCategoryId = null,
  onSelectCategory,
  refreshKey = 0,
}) {
  const scrollViewRef = useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  // Reset arrow indicator whenever returning to home or refreshing the app
  useEffect(() => {
    setShowScrollHint(true);
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });
  }, [refreshKey]);

  // Pulsing glow light animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  // If user moves/scrolls the category bar, arrow disappears immediately
  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    if (x > 5 && showScrollHint) {
      setShowScrollHint(false);
    }
  };

  const handleScrollBeginDrag = () => {
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  // If user clicks the arrow, reach all the way to the end so no icon is hidden
  const handleScrollRight = () => {
    setShowScrollHint(false);
    if (scrollViewRef.current?.scrollToEnd) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    } else {
      scrollViewRef.current?.scrollTo({ x: 9999, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                isSelected && styles.categoryItemSelected,
              ]}
              activeOpacity={0.7}
              onPress={() => onSelectCategory && onSelectCategory(cat.id)}
              accessibilityLabel={`Category: ${cat.name}`}
            >
              {/* Icon Container Circle */}
              <View
                style={[
                  styles.iconCircle,
                  isSelected && styles.iconCircleSelected,
                ]}
              >
                <CategoryIcon item={cat} size={30} />
              </View>

              {/* Category Title */}
              <Text
                style={[
                  styles.categoryName,
                  isSelected && styles.categoryNameSelected,
                ]}
                numberOfLines={2}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Floating Sharp Double Arrow (No background box/circle, White & Grey, Disappears on click or move) */}
      {showScrollHint && (
        <TouchableOpacity
          style={styles.scrollHintContainer}
          activeOpacity={0.7}
          onPress={handleScrollRight}
          accessibilityLabel="Scroll more categories"
        >
          <Animated.View
            style={[
              styles.sharpArrowBadge,
              {
                opacity: glowAnim,
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.92, 1.08],
                    }),
                  },
                ],
              },
            ]}
          >
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              {/* Subtle contrast shadow */}
              <Path
                d="M4 4.8 L11 11.8 L4 18.8"
                stroke="rgba(0,0,0,0.22)"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M11.5 4.8 L18.5 11.8 L11.5 18.8"
                stroke="rgba(0,0,0,0.22)"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* First Chevron: Sleek Grey */}
              <Path
                d="M4 4 L11 11 L4 18"
                stroke="#94A3B8"
                strokeWidth="3.0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Second Chevron: Crisp White */}
              <Path
                d="M11.5 4 L18.5 11 L11.5 18"
                stroke="#FFFFFF"
                strokeWidth="3.0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingLeft: 12,
    paddingRight: 32,
    alignItems: 'flex-start',
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  categoryItemSelected: {
    transform: [{ scale: 1.02 }],
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircleSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.8,
  },
  categoryName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 15,
  },
  categoryNameSelected: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  scrollHintContainer: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  sharpArrowBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
