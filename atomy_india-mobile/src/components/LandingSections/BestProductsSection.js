import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { BEST_PRODUCTS } from '../../data/mockData';
import LandingProductCard from '../Products/LandingProductCard';

const TABS = ['ALL', 'BEST', 'NEW', 'RECOMMENDATION'];

export default function BestProductsSection({
  onAddToCart,
  onProductClick,
  favorites = [],
  onToggleFavorite,
  isMember = false,
  onJoinMemberPress,
}) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [visibleLimit, setVisibleLimit] = useState(10); // 5 rows x 2 products = 10 limit

  const filteredProducts = BEST_PRODUCTS.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.categoryTab && item.categoryTab.includes(activeTab);
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisibleLimit(10); // Reset to first 5 rows (10 products)
  };

  const displayedProducts = filteredProducts.slice(0, visibleLimit);
  const hasMore = filteredProducts.length > visibleLimit;
  const isExpanded = visibleLimit > 10;

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.mainTitle}>{"Atomy India Shopping Mall\nBEST"}</Text>
        <Text style={styles.subTitle}>Absolute Quality Absolute Price</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              activeOpacity={0.75}
              onPress={() => handleTabChange(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2-Column Product Grid (1 row = 2 products, limit 5 rows = 10 products) */}
      <View style={styles.productsGrid}>
        {displayedProducts.map((product) => {
          const isFav = favorites.includes(product.id);
          return (
            <View key={product.id} style={styles.gridItem}>
              <LandingProductCard
                product={product}
                isFavorite={isFav}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onPress={onProductClick}
                isMember={isMember}
                onJoinMemberPress={onJoinMemberPress}
                cardWidth="100%"
              />
            </View>
          );
        })}
      </View>

      {/* "More" / "Less" Buttons for extra rows */}
      {hasMore && !isExpanded && (
        <TouchableOpacity
          style={styles.moreBtn}
          activeOpacity={0.8}
          onPress={() => setVisibleLimit((prev) => prev + 10)}
          accessibilityRole="button"
          accessibilityLabel="Show more products"
        >
          <Text style={styles.moreBtnText}>More</Text>
        </TouchableOpacity>
      )}

      {hasMore && isExpanded && (
        <View style={styles.moreLessBtnRow}>
          <TouchableOpacity
            style={[styles.moreBtn, styles.halfBtn]}
            activeOpacity={0.8}
            onPress={() => setVisibleLimit((prev) => prev + 10)}
            accessibilityRole="button"
            accessibilityLabel="Show more products"
          >
            <Text style={styles.moreBtnText}>More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.moreBtn, styles.halfBtn]}
            activeOpacity={0.8}
            onPress={() => setVisibleLimit(10)}
            accessibilityRole="button"
            accessibilityLabel="Show less products"
          >
            <Text style={styles.moreBtnText}>Less</Text>
          </TouchableOpacity>
        </View>
      )}

      {!hasMore && isExpanded && (
        <TouchableOpacity
          style={styles.moreBtn}
          activeOpacity={0.8}
          onPress={() => setVisibleLimit(10)}
          accessibilityRole="button"
          accessibilityLabel="Show less products"
        >
          <Text style={styles.moreBtnText}>Less</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 22.5,
    lineHeight: 29,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 13.5,
    color: '#111827',
    marginTop: 4,
    textAlign: 'center',
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
    rowGap: 16,
  },
  gridItem: {
    width: '48.5%',
    marginBottom: 4,
  },
  moreBtn: {
    marginHorizontal: 14,
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#00A3E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00A3E0',
    letterSpacing: 0.3,
  },
  moreLessBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 18,
    gap: 12,
  },
  halfBtn: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
  },
});
