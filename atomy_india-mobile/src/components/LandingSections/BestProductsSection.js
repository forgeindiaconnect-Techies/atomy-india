import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import {
  BEST_PRODUCTS,
  ALL_PRODUCTS,
  FOOD_ESSENTIAL_PRODUCTS,
  HAIR_BODY_PRODUCTS,
  HEALTH_ESSENTIAL_PRODUCTS,
} from '../../data/mockData';
import { onCatalogUpdate, resolveTargetCategoryKey } from '../../services/catalogSyncService';
import LandingProductCard from '../Products/LandingProductCard';

// Authentic Website Filter Tabs (ALL, BEST, NEW, RECOMMENDATION, HEALTH, BEAUTY, LIVING, FOOD)
const TABS = ['ALL', 'BEST', 'NEW', 'RECOMMENDATION', 'HEALTH', 'BEAUTY', 'LIVING', 'FOOD'];

function BestProductsSection({
  onAddToCart,
  onProductClick,
  favorites = [],
  onToggleFavorite,
  isMember = false,
  onJoinMemberPress,
}) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [visibleLimit, setVisibleLimit] = useState(10); // 5 rows x 2 products = 10 limit
  const [catalogTick, setCatalogTick] = useState(0);
  const tabsScrollRef = useRef(null);

  // Subscribe to live catalog synchronization
  useEffect(() => {
    return onCatalogUpdate(() => {
      setCatalogTick((t) => t + 1);
    });
  }, []);

  // Helper to shuffle the BEST products with 1..N ranks matching the website
  const getShuffledBest = () => {
    const originalBest = BEST_PRODUCTS.filter(
      (item) =>
        (item.categoryTab && Array.isArray(item.categoryTab) && item.categoryTab.includes('BEST')) ||
        Boolean(item.isBest) ||
        Boolean(item.badge && String(item.badge).toUpperCase().includes('BEST'))
    );
    const sourceList = originalBest.length > 0 ? originalBest : BEST_PRODUCTS.slice(0, 5);
    if (sourceList.length <= 1) {
      return sourceList.map((p, idx) => ({ ...p, rank: idx + 1 }));
    }

    const shuffled = [...sourceList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    if (shuffled.every((item, idx) => item.id === sourceList[idx]?.id)) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    return shuffled.map((p, idx) => ({
      ...p,
      rank: idx + 1,
    }));
  };

  const [shuffledBestProducts, setShuffledBestProducts] = useState(() => getShuffledBest());

  // Comprehensive multi-factor category filtering accurately mirroring website logic
  const filteredProducts = useMemo(() => {
    if (activeTab === 'ALL') {
      return BEST_PRODUCTS;
    }

    if (activeTab === 'BEST') {
      const bestList = BEST_PRODUCTS.filter(
        (item) =>
          (item.categoryTab && Array.isArray(item.categoryTab) && item.categoryTab.includes('BEST')) ||
          Boolean(item.isBest) ||
          Boolean(item.badge && String(item.badge).toUpperCase().includes('BEST'))
      );
      return bestList.length > 0 ? bestList : BEST_PRODUCTS.slice(0, 5);
    }

    if (activeTab === 'NEW') {
      const newList = BEST_PRODUCTS.filter(
        (item) =>
          (item.categoryTab && Array.isArray(item.categoryTab) && item.categoryTab.includes('NEW')) ||
          Boolean(item.isNew) ||
          Boolean(item.badge && String(item.badge).toUpperCase().includes('NEW'))
      );
      if (newList.length > 0) return newList;
      // Resilient fallback from all catalog items
      const fromAll = (ALL_PRODUCTS || []).filter(
        (item) =>
          Boolean(item.isNew) ||
          Boolean(item.badge && String(item.badge).toUpperCase().includes('NEW'))
      );
      return fromAll.length > 0 ? fromAll.slice(0, 10) : BEST_PRODUCTS.slice(5, 9);
    }

    if (activeTab === 'RECOMMENDATION') {
      const recList = BEST_PRODUCTS.filter(
        (item) =>
          (item.categoryTab && Array.isArray(item.categoryTab) && item.categoryTab.includes('RECOMMENDATION')) ||
          Boolean(item.isRecommended)
      );
      return recList.length > 0 ? recList : BEST_PRODUCTS.slice(9);
    }

    if (activeTab === 'HEALTH') {
      const bestHealth = BEST_PRODUCTS.filter((item) => {
        const cat = resolveTargetCategoryKey(item);
        return (
          cat === 'health' ||
          cat === 'hemohim' ||
          (item.categoryTab && Array.isArray(item.categoryTab) && item.categoryTab.includes('HEALTH'))
        );
      });
      const allHealth = (ALL_PRODUCTS || []).filter((item) => {
        const cat = resolveTargetCategoryKey(item);
        return cat === 'health' || cat === 'hemohim';
      });
      const seen = new Set();
      const combined = [];
      [...bestHealth, ...allHealth].forEach((p) => {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          combined.push(p);
        }
      });
      return combined.length > 0 ? combined : (HEALTH_ESSENTIAL_PRODUCTS || []);
    }

    if (activeTab === 'BEAUTY') {
      const bestBeauty = BEST_PRODUCTS.filter((item) => {
        const cat = resolveTargetCategoryKey(item);
        return (
          cat === 'beauty' ||
          (item.categoryTab && Array.isArray(item.categoryTab) && item.categoryTab.includes('BEAUTY'))
        );
      });
      const allBeauty = (ALL_PRODUCTS || []).filter((item) => {
        const cat = resolveTargetCategoryKey(item);
        return cat === 'beauty';
      });
      const seen = new Set();
      const combined = [];
      [...bestBeauty, ...allBeauty].forEach((p) => {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          combined.push(p);
        }
      });
      return combined;
    }

    if (activeTab === 'LIVING') {
      const bestLiving = BEST_PRODUCTS.filter((item) => {
        const cat = resolveTargetCategoryKey(item);
        return (
          cat === 'personal_care' ||
          cat === 'home' ||
          (item.categoryTab && Array.isArray(item.categoryTab) && item.categoryTab.includes('LIVING'))
        );
      });
      const allLiving = (ALL_PRODUCTS || []).filter((item) => {
        const cat = resolveTargetCategoryKey(item);
        return cat === 'personal_care' || cat === 'home';
      });
      const hairBody = HAIR_BODY_PRODUCTS || [];
      const seen = new Set();
      const combined = [];
      [...bestLiving, ...allLiving, ...hairBody].forEach((p) => {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          combined.push(p);
        }
      });
      return combined;
    }

    if (activeTab === 'FOOD') {
      const bestFood = BEST_PRODUCTS.filter((item) => {
        const cat = resolveTargetCategoryKey(item);
        return (
          cat === 'food' ||
          (item.categoryTab && Array.isArray(item.categoryTab) && item.categoryTab.includes('FOOD'))
        );
      });
      const allFood = (ALL_PRODUCTS || []).filter((item) => {
        const cat = resolveTargetCategoryKey(item);
        return cat === 'food';
      });
      const foodEssentials = FOOD_ESSENTIAL_PRODUCTS || [];
      const seen = new Set();
      const combined = [];
      [...bestFood, ...allFood, ...foodEssentials].forEach((p) => {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          combined.push(p);
        }
      });
      return combined;
    }

    return BEST_PRODUCTS;
  }, [activeTab, catalogTick]);

  const handleTabChange = (tab, index) => {
    if (tab === 'BEST') {
      setShuffledBestProducts(getShuffledBest());
    }
    setActiveTab(tab);
    setVisibleLimit(10); // Reset to first 5 rows (10 products)

    // Smooth scroll tab into view if needed
    if (tabsScrollRef.current && typeof index === 'number') {
      const offset = Math.max(0, index * 85 - 60);
      tabsScrollRef.current.scrollTo({ x: offset, animated: true });
    }
  };

  const targetList = activeTab === 'BEST' ? shuffledBestProducts : filteredProducts;
  const displayedProducts = targetList.slice(0, visibleLimit);
  const hasMore = targetList.length > visibleLimit;
  const isExpanded = visibleLimit > 10;

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.mainTitle}>{'Atomy India Shopping Mall\nBEST'}</Text>
        <Text style={styles.subTitle}>Absolute Quality Absolute Price</Text>
      </View>

      {/* Filter Tabs matching website (Scrollable with ALL, BEST, NEW, RECOMMENDATION, HEALTH, BEAUTY, LIVING, FOOD) */}
      <View style={styles.tabsWrapper}>
        <View style={styles.swipeHintRow}>
          <Text style={styles.swipeHintText}>Scroll sections</Text>
          <Ionicons name="chevron-forward" size={13} color="#00A3E0" />
        </View>

        <ScrollView
          ref={tabsScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                activeOpacity={0.75}
                onPress={() => handleTabChange(tab, idx)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

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
    marginBottom: 12,
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
  tabsWrapper: {
    marginBottom: 16,
  },
  swipeHintRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 3,
  },
  swipeHintText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#00A3E0',
    letterSpacing: 0.2,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  tabPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#00A3E0',
    borderColor: '#00A3E0',
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
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

export default React.memo(BestProductsSection);
