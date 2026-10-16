import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Card width matches screen width minus horizontal padding (16 * 2 = 32)
const CARD_WIDTH = SCREEN_WIDTH - 32;
// 720 x 180 aspect ratio = 4:1
const CARD_HEIGHT = Math.round(CARD_WIDTH * (180 / 720));

export default function PromoBannerStrip({ image, text, onPress }) {
  const isUserGuide = (text || '').toLowerCase().includes('guide');
  const isResource = (text || '').toLowerCase().includes('resource');

  // Choose the mobile-optimized asset or fallback to remote URI
  let bannerSource = { uri: image };
  let bgColor = '#F1F5F9';

  if (isUserGuide) {
    bannerSource = require('../../../assets/user_guide_banner_mobile.png');
    bgColor = '#CCD7ED';
  } else if (isResource) {
    bannerSource = require('../../../assets/resource_material_banner_mobile.png');
    bgColor = '#EBF6FE';
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.bannerBox, { backgroundColor: bgColor }]}
        activeOpacity={0.92}
        onPress={onPress}
      >
        <Image
          source={bannerSource}
          style={styles.bannerImg}
          resizeMode="cover"
        />

        {/* Action pill cleanly positioned on the left side where there is ample open space */}
        <View style={styles.overlayContent}>
          <View style={styles.actionPill}>
            <Text style={styles.bannerText}>{text}</Text>
            <Ionicons name="chevron-forward" size={15} color={COLORS.navy} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerBox: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  overlayContent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 14,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  bannerText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.2,
  },
});
