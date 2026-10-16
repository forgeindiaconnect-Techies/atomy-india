import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 4-point sparkle star SVG component
function SparkleStar({ size = 26, color = '#34D399' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 0 C12 6.6 6.6 12 0 12 C6.6 12 12 17.4 12 24 C12 17.4 17.4 12 24 12 C17.4 12 12 6.6 12 0 Z"
        fill={color}
      />
    </Svg>
  );
}

// Floating golden coin with shine and lightning/spark mark
function GoldCoin({ size = 28, tilt = '0deg' }) {
  return (
    <View
      style={[
        styles.goldCoin,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ rotate: tilt }],
        },
      ]}
    >
      <View
        style={[
          styles.goldCoinInner,
          {
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) / 2,
          },
        ]}
      >
        <Ionicons name="flash" size={size * 0.46} color="#FFFFFF" />
      </View>
    </View>
  );
}

export default function OrderSuccessCelebration({
  savedAmount = 224,
  onFinish,
  duration = 1400, // ~1.4 seconds animation
}) {
  // Animation drivers
  const mainScale = useRef(new Animated.Value(0.3)).current;
  const outerRippleScale = useRef(new Animated.Value(0.7)).current;
  const outerRippleOpacity = useRef(new Animated.Value(0.3)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(0)).current;
  const coinsTranslateY = useRef(new Animated.Value(20)).current;
  const coinsOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(15)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Center Checkmark Spring Animation
    Animated.spring(mainScale, {
      toValue: 1,
      tension: 65,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // 2. Ripple pulse on concentric rings
    Animated.parallel([
      Animated.timing(outerRippleScale, {
        toValue: 1.08,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(outerRippleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Sparkles twinkle and rotate
    Animated.parallel([
      Animated.spring(sparkleScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Floating coins motion
    Animated.parallel([
      Animated.timing(coinsOpacity, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(coinsTranslateY, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.back(1.4)),
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // 5. "Order Placed" & "You saved ₹..." entrance
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 450,
        delay: 250,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.ease),
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after 1.4 seconds
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const spin = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '25deg'],
  });

  return (
    <TouchableOpacity
      style={styles.overlayContainer}
      activeOpacity={1}
      onPress={onFinish}
    >
      <View style={styles.centerStage}>
        {/* Concentric Green Circle Rings */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              transform: [{ scale: outerRippleScale }],
              opacity: outerRippleOpacity,
            },
          ]}
        >
          <View style={styles.middleRing}>
            <Animated.View
              style={[
                styles.innerGreenCircle,
                { transform: [{ scale: mainScale }] },
              ]}
            >
              <Ionicons name="checkmark" size={54} color="#FFFFFF" style={styles.checkIcon} />
            </Animated.View>
          </View>

          {/* Sparkle 1: Top-Left */}
          <Animated.View
            style={[
              styles.sparklePosition,
              { top: 22, left: 52 },
              {
                transform: [{ scale: sparkleScale }, { rotate: spin }],
              },
            ]}
          >
            <SparkleStar size={24} color="#34D399" />
          </Animated.View>

          {/* Sparkle 2: Top-Right */}
          <Animated.View
            style={[
              styles.sparklePosition,
              { top: 38, right: 38 },
              {
                transform: [{ scale: sparkleScale }, { rotate: spin }],
              },
            ]}
          >
            <SparkleStar size={20} color="#34D399" />
          </Animated.View>

          {/* Sparkle 3: Bottom-Left */}
          <Animated.View
            style={[
              styles.sparklePosition,
              { bottom: 44, left: 40 },
              {
                transform: [{ scale: sparkleScale }, { rotate: spin }],
              },
            ]}
          >
            <SparkleStar size={18} color="#34D399" />
          </Animated.View>

          {/* Sparkle 4: Bottom-Right */}
          <Animated.View
            style={[
              styles.sparklePosition,
              { bottom: 26, right: 46 },
              {
                transform: [{ scale: sparkleScale }, { rotate: spin }],
              },
            ]}
          >
            <SparkleStar size={16} color="#34D399" />
          </Animated.View>
        </Animated.View>

        {/* Floating Golden Coins around outer circle (matching user's screenshot) */}
        <Animated.View
          style={[
            styles.coinsLayer,
            {
              opacity: coinsOpacity,
              transform: [{ translateY: coinsTranslateY }],
            },
          ]}
          pointerEvents="none"
        >
          {/* Left Side Coins */}
          <View style={[styles.coinWrapper, { top: 35, left: -22 }]}>
            <GoldCoin size={24} tilt="-20deg" />
          </View>
          <View style={[styles.coinWrapper, { top: 125, left: -34 }]}>
            <GoldCoin size={26} tilt="-15deg" />
          </View>
          <View style={[styles.coinWrapper, { bottom: 15, left: -16 }]}>
            <GoldCoin size={22} tilt="10deg" />
          </View>

          {/* Right Side Coins */}
          <View style={[styles.coinWrapper, { top: 50, right: -26 }]}>
            <GoldCoin size={24} tilt="25deg" />
          </View>
          <View style={[styles.coinWrapper, { bottom: 35, right: -20 }]}>
            <GoldCoin size={22} tilt="-10deg" />
          </View>
        </Animated.View>

        {/* Text Section: Order Placed & You saved ₹... */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.orderPlacedTitle}>Order Placed</Text>
          <Text style={styles.savingsSubtitle}>
            You saved ₹{Number(savedAmount || 224).toLocaleString('en-IN')}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
  },
  outerRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#E8F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  middleRing: {
    width: 184,
    height: 184,
    borderRadius: 92,
    backgroundColor: '#D1F2DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerGreenCircle: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: '#48D374',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  checkIcon: {
    marginTop: -2,
  },
  sparklePosition: {
    position: 'absolute',
  },
  coinsLayer: {
    position: 'absolute',
    width: 260,
    height: 260,
  },
  coinWrapper: {
    position: 'absolute',
  },
  goldCoin: {
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  goldCoinInner: {
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  orderPlacedTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  savingsSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.1,
  },
});
