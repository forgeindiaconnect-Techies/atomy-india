import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { NOTICE_ITEMS } from '../../data/mockData';

export default function NoticeTicker({ onNoticePress }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!NOTICE_ITEMS || NOTICE_ITEMS.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NOTICE_ITEMS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const currentNotice = (NOTICE_ITEMS && NOTICE_ITEMS[currentIndex]) || 'Welcome to Atomy India';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tickerCard}
        activeOpacity={0.8}
        onPress={() => onNoticePress && onNoticePress(currentNotice)}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NOTICE</Text>
        </View>

        <Text style={styles.noticeText} numberOfLines={1}>
          {currentNotice}
        </Text>

        <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
