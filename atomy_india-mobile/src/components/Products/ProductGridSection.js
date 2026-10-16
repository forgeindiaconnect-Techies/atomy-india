import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import ProductCard from './ProductCard';

const TABS = [
  { id: 'all', label: 'All Products' },
  { id: 'best', label: 'Best' },
  { id: 'new', label: 'New' },
  { id: 'recommendation', label: 'Recommended' },
];

const MAX_INITIAL_ROWS = 10;
const ITEMS_PER_ROW = 2;
const MAX_INITIAL_PRODUCTS = MAX_INITIAL_ROWS * ITEMS_PER_ROW; // 20 items

export default function ProductGridSection({
  products = [],
  onProductPress,
  onAddToCart,
  favorites = [],
  onToggleFavorite,
  isMember = false,
  onJoinMemberPress,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter products by tab
  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case 'best':
        return products.filter((p) => p.isBest);
      case 'new':
        return products.filter((p) => p.isNew);
      case 'recommendation':
        return products.filter((p) => p.isRecommended);
      case 'all':
      default:
        return products;
    }
  }, [products, activeTab]);

  // Determine displayed items: 10 rows max (20 items) unless "More" is clicked
  const hasExceeded = filteredProducts.length > MAX_INITIAL_PRODUCTS;
  const displayedProducts = isExpanded
    ? filteredProducts
    : filteredProducts.slice(0, MAX_INITIAL_PRODUCTS);
  const hiddenCount = filteredProducts.length - MAX_INITIAL_PRODUCTS;

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header with Title */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleBadgeRow}>
          <View style={styles.titleAccentBar} />
          <Text style={styles.sectionTitle}>Atomy Shopping Mall</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Absolute Quality, Absolute Price
        </Text>
      </View>

      {/* Tabs Row: All, Best, New, Recommendation */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                activeOpacity={0.75}
                onPress={() => {
                  setActiveTab(tab.id);
                  setIsExpanded(false); // Reset expansion on tab change
                }}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive && styles.tabButtonTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View style={styles.tabBadgeCount}>
                    <Text style={styles.tabBadgeCountText}>
                      {filteredProducts.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Row by Row 2-Column Product Grid (NO horizontal scrolling) */}
      <View style={styles.gridContainer}>
        {displayedProducts.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            onPress={onProductPress}
            onAddToCart={onAddToCart}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
            isMember={isMember}
            onJoinMemberPress={onJoinMemberPress}
          />
        ))}
      </View>

      {/* If products exceed 10 rows (20 products): "More" toggle button */}
      {hasExceeded && (
        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.8}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.moreButtonText}>
            {isExpanded
              ? 'Show Less (Back to Top 10 Rows)'
              : `View More Products (+${hiddenCount} more)`}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 18,
    backgroundColor: COLORS.background,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleAccentBar: {
    width: 4,
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginLeft: 12,
  },
  tabsContainer: {
    marginBottom: 14,
  },
  tabsContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButtonActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabBadgeCount: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  moreButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
