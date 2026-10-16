import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CATEGORIES, CATEGORY_CONFIGS } from '../../data/mockData';
import LandingProductCard from '../Products/LandingProductCard';
import HeroBannerCarousel from '../Banner/HeroBannerCarousel';
import AtomyFooter from '../Navigation/AtomyFooter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = Math.round(SCREEN_WIDTH * (360 / 720));

// Authentic Team Phoenix Logo asset
const phoenixLogo = require('../../../assets/team_phoenix_circle_clean.png');

export default function CategoryPage({
  categoryId = 'personal_care',
  isMember = false,
  favorites = [],
  onToggleFavorite,
  onAddToCart,
  onProductClick,
  onSelectCategory,
  onNavigateHome,
  onNavigateBack,
  onCartPress,
  cartCount = 0,
  onJoinMemberPress,
  onSearchPress,
}) {
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [sortBy, setSortBy] = useState('POPULAR');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isSortPickerOpen, setIsSortPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Normalize category key
  const categoryKey = useMemo(() => {
    if (!categoryId) return 'personal_care';
    const key = String(categoryId).toLowerCase().replace(/[\s-]+/g, '_');
    if (CATEGORY_CONFIGS[key]) return key;
    if (key === 'personal') return 'personal_care';
    return 'personal_care';
  }, [categoryId]);

  const categoryConfig = useMemo(() => {
    return CATEGORY_CONFIGS[categoryKey] || CATEGORY_CONFIGS.personal_care;
  }, [categoryKey]);

  // Reset subcategory to 'All' when category changes
  useEffect(() => {
    setActiveSubcategory('All');
    setSearchQuery('');
    setIsSearchExpanded(false);
  }, [categoryKey]);

  // Category banners formatted for HeroBannerCarousel with smooth sliding & animated hide/appear text
  const categorySlides = useMemo(() => {
    return (categoryConfig.banners || []).map((b, idx) => ({
      id: `cat-banner-${categoryKey}-${idx}`,
      title: b.title || '',
      subtitle: b.subtitle || '',
      desc: b.desc || '',
      img: b.image || b.img,
      image: b.image || b.img,
      bg: b.bgColor || '#F1F5F9',
      textColor: b.textColor || '#0F172A',
      hasTextOverlay: Boolean(b.title || b.subtitle),
    }));
  }, [categoryConfig, categoryKey]);

  // Subcategories list
  const subcategories = useMemo(() => {
    return categoryConfig.subcategories || ['All'];
  }, [categoryConfig]);

  // Filter products by subcategory and search query
  const filteredProducts = useMemo(() => {
    let prods = categoryConfig.allProducts || [];
    if (activeSubcategory && activeSubcategory !== 'All') {
      prods = prods.filter(
        (p) =>
          p.subTopic === activeSubcategory ||
          (p.tags && p.tags.includes(activeSubcategory)) ||
          p.name.toLowerCase().includes(activeSubcategory.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      prods = prods.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.id && p.id.toLowerCase().includes(q)) ||
          (p.subTopic && p.subTopic.toLowerCase().includes(q))
      );
    }

    // Sort products
    const sorted = [...prods];
    if (sortBy === 'PRICE_LOW') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'PRICE_HIGH') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'PV_HIGH') {
      sorted.sort((a, b) => (b.pv || 0) - (a.pv || 0));
    }

    return sorted;
  }, [categoryConfig, activeSubcategory, searchQuery, sortBy]);

  // Best products for this category
  const bestProducts = useMemo(() => {
    return categoryConfig.bestProducts || [];
  }, [categoryConfig]);

  return (
    <View style={styles.screenContainer}>
      {/* 1. Top Navbar: Solid Cyan Blue with Team Phoenix Logo & Name ONLY, Searchbar, and Cart */}
      <View style={styles.topBlueRow}>
        {/* Left Side: Back Arrow + Team Phoenix Emblem & Name */}
        <View style={styles.leftBrandArea}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onNavigateBack || onNavigateHome}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Back to Home"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Team Phoenix Emblem & Name ONLY (without Atomy logo) */}
          <TouchableOpacity
            style={styles.phoenixGroup}
            activeOpacity={0.8}
            onPress={onNavigateBack || onNavigateHome}
          >
            <Image
              source={phoenixLogo}
              style={styles.phoenixEmblem}
              resizeMode="contain"
            />
            <View style={styles.phoenixTextCol}>
              <Text style={styles.phoenixTitle} numberOfLines={1}>
                Team Phoenix
              </Text>
              <Text style={styles.phoenixSub} numberOfLines={1}>
                India
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Right Side: Capsule Search Pill + Cart with Red Badge */}
        <View style={styles.rightActions}>
          {isSearchExpanded ? (
            <View style={styles.expandedSearchBox}>
              <TextInput
                style={styles.expandedSearchInput}
                placeholder="Search..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => {
                  if (searchQuery.length > 0) {
                    setSearchQuery('');
                  } else {
                    setIsSearchExpanded(false);
                  }
                }}
                style={styles.searchClearBtn}
              >
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.searchCapsulePill}
              activeOpacity={0.8}
              onPress={() => {
                if (onSearchPress) {
                  onSearchPress();
                } else {
                  setIsSearchExpanded(true);
                }
              }}
              accessibilityLabel="Search in category"
            >
              <Ionicons name="search" size={17} color={COLORS.primary} />
            </TouchableOpacity>
          )}

          {/* White Cart Outline Icon with Red Circle Badge */}
          <TouchableOpacity
            style={styles.cartBtn}
            activeOpacity={0.7}
            onPress={onCartPress}
            accessibilityLabel="Shopping Cart"
          >
            <Ionicons name="cart-outline" size={25} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartRedBadge}>
                <Text style={styles.cartRedBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Sub-Header Bar: Category Title Switcher Dropdown Pill (Centered) */}
      <View style={styles.categorySubBar}>
        <TouchableOpacity
          style={styles.categoryTitlePill}
          onPress={() => setIsCategoryPickerOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.categoryTitleText} numberOfLines={1}>
            {categoryConfig.name}
          </Text>
          <Ionicons name="chevron-down" size={15} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Category Hero Banner Carousel (Smooth Sliding & Staggered Hide/Appear Text) */}
        {categorySlides.length > 0 && (
          <HeroBannerCarousel
            key={categoryKey}
            slides={categorySlides}
          />
        )}

        {/* 3. Subcategories Filter Tabs - Evenly Spread Across Width */}
        <View style={styles.subcategoriesBar}>
          <ScrollView
            horizontal={subcategories.length > 4}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.subcategoriesScroll,
              subcategories.length <= 4 && styles.subcategoriesSpread,
            ]}
          >
            {subcategories.map((sub) => {
              const isActive = activeSubcategory === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  style={[
                    styles.subcategoryPill,
                    subcategories.length <= 4 && styles.subcategoryPillSpread,
                    isActive && styles.subcategoryPillActive,
                  ]}
                  onPress={() => setActiveSubcategory(sub)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.subcategoryText,
                      isActive && styles.subcategoryTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Best Products Slider (for active category) */}
        {bestProducts.length > 0 && activeSubcategory === 'All' && (
          <View style={styles.bestSection}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  {categoryConfig.name} Best Product
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bestProductsScroll}
            >
              {bestProducts.map((prod) => (
                <LandingProductCard
                  key={prod.id}
                  product={{
                    ...prod,
                    image: prod.image || prod.img,
                  }}
                  isFavorite={favorites.includes(prod.id)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToCart={onAddToCart}
                  onPress={onProductClick}
                  isMember={isMember}
                  onJoinMemberPress={onJoinMemberPress}
                  cardWidth={176}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5. All Products Grid Section */}
        <View style={styles.gridSection}>
          {/* Header Row: Count & Sorting */}
          <View style={styles.gridHeaderRow}>
            <Text style={styles.productCountText}>
              All ({filteredProducts.length})
            </Text>

            {/* Sort Filter Selector */}
            <TouchableOpacity
              style={styles.sortSelectorBtn}
              onPress={() => setIsSortPickerOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.sortSelectorText}>
                {sortBy === 'POPULAR'
                  ? 'Popular'
                  : sortBy === 'PRICE_LOW'
                  ? 'Price: Low'
                  : sortBy === 'PRICE_HIGH'
                  ? 'Price: High'
                  : 'PV: High'}
              </Text>
              <Ionicons name="swap-vertical" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Product Cards Grid */}
          <View style={styles.productGrid}>
            {filteredProducts.map((prod) => (
              <View key={prod.id} style={styles.gridItem}>
                <LandingProductCard
                  product={{
                    ...prod,
                    image: prod.image || prod.img,
                  }}
                  isFavorite={favorites.includes(prod.id)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToCart={onAddToCart}
                  onPress={onProductClick}
                  isMember={isMember}
                  onJoinMemberPress={onJoinMemberPress}
                  cardWidth="100%"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Official Corporate & Support Footer */}
        <AtomyFooter />
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* CATEGORY SWITCHER MODAL */}
      <Modal
        visible={isCategoryPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsCategoryPickerOpen(false)}
        >
          <View style={styles.pickerDialog}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setIsCategoryPickerOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerList}>
              {CATEGORIES.map((cat) => {
                const isSelected = categoryKey === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.pickerItem,
                      isSelected && styles.pickerItemActive,
                    ]}
                    onPress={() => {
                      setIsCategoryPickerOpen(false);
                      onSelectCategory && onSelectCategory(cat.id);
                    }}
                  >
                    <View style={styles.pickerItemLeft}>
                      <Ionicons
                        name={cat.fallbackIcon || 'grid-outline'}
                        size={20}
                        color={isSelected ? COLORS.primary : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.pickerItemText,
                          isSelected && styles.pickerItemTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* SORT PICKER MODAL */}
      <Modal
        visible={isSortPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsSortPickerOpen(false)}
        >
          <View style={styles.pickerDialog}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Sort Products</Text>
              <TouchableOpacity
                onPress={() => setIsSortPickerOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {[
              { id: 'POPULAR', label: 'Popular Products' },
              { id: 'PRICE_LOW', label: 'Price: Low to High' },
              { id: 'PRICE_HIGH', label: 'Price: High to Low' },
              { id: 'PV_HIGH', label: 'PV: High to Low' },
            ].map((s) => {
              const isSelected = sortBy === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.pickerItem,
                    isSelected && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setSortBy(s.id);
                    setIsSortPickerOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      isSelected && styles.pickerItemTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBlueRow: {
    backgroundColor: COLORS.primary, // Solid Atomy Cyan Blue #00A3E0
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 12,
    paddingTop: Platform.OS === 'ios' ? 6 : 8,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  leftBrandArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtn: {
    padding: 6,
  },
  phoenixGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  phoenixEmblem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  phoenixTextCol: {
    flexDirection: 'column',
  },
  phoenixTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  phoenixSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E0F2FE',
    lineHeight: 12,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchCapsulePill: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  expandedSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 32,
    width: 135,
  },
  expandedSearchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  searchClearBtn: {
    padding: 2,
  },
  cartBtn: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cartRedBadge: {
    position: 'absolute',
    top: -4,
    right: -7,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartRedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  categorySubBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryTitlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 6.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Category Banner
  bannerWrapper: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    position: 'relative',
    backgroundColor: '#072044',
    overflow: 'hidden',
  },
  bannerImage: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerTextOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 20,
    width: '54%',
    justifyContent: 'center',
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    letterSpacing: -0.4,
  },
  bannerCounterBox: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  bannerCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Subcategories
  subcategoriesBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 10,
    width: '100%',
  },
  subcategoriesScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  subcategoriesSpread: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    gap: 10,
  },
  subcategoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subcategoryPillSpread: {
    flex: 1,
    paddingHorizontal: 6,
  },
  subcategoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subcategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  subcategoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Best Section
  bestSection: {
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 6,
    borderBottomColor: '#F8FAFC',
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  bestProductsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },

  // All Products Grid
  gridSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  gridHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  productCountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sortSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  sortSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 42) / 2,
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerDialog: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  pickerList: {
    maxHeight: 350,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerItemActive: {
    backgroundColor: '#F0F9FF',
  },
  pickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  pickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
