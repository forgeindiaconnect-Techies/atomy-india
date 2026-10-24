import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { ALL_PRODUCTS } from '../../data/mockData';
import LandingProductCard from '../Products/LandingProductCard';
import AtomyFooter from '../Navigation/AtomyFooter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - 36) / 2);

const RECENT_SEARCHES_STORAGE_KEY = 'atomy_mobile_recent_searches';

// Authentic Popular searches matching Atomy official online shopping mall
const POPULAR_SEARCHES = [
  'HemoHIM',
  'Toothpaste',
  'Absolute Skincare',
  'Foam Cleanser',
  'Deep Pure Cleansing Oil',
  'Evening Care 4 Set',
  'Omega 3',
  'Probiotics',
  'Sunscreen SPF 50+',
  'Fabric Detergent',
  'Cafe Arabica',
  'Cerabebe',
];

// Quick category suggestions
const QUICK_CATEGORIES = [
  { id: 'health_care', label: 'Health Care', icon: 'fitness-outline', query: 'health' },
  { id: 'skin_care', label: 'Skin Care', icon: 'sparkles-outline', query: 'skincare' },
  { id: 'personal_care', label: 'Personal Care', icon: 'body-outline', query: 'personal' },
  { id: 'living', label: 'Living', icon: 'home-outline', query: 'detergent' },
  { id: 'food', label: 'Food', icon: 'restaurant-outline', query: 'arabica' },
];

const loadSavedRecentSearches = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {}
  return ['HemoHIM', 'Toothpaste', 'Absolute Skincare', 'Omega 3'];
};

const saveRecentSearchesToStorage = (list) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (e) {}
};

export default function SearchPage({
  isMember = false,
  favorites = [],
  onToggleFavorite,
  onAddToCart,
  onProductClick,
  onNavigateBack,
  onNavigateHome,
  onCartPress,
  cartCount = 0,
  onJoinMemberPress,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(loadSavedRecentSearches);
  const [sortBy, setSortBy] = useState('RELEVANCE'); // 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'PV_DESC'
  const inputRef = useRef(null);

  // Focus input automatically on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Save query to recent searches
  const recordRecentSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      saveRecentSearchesToStorage(updated);
      return updated;
    });
  };

  // Remove a single recent search term
  const handleRemoveRecentSearch = (termToRemove) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      saveRecentSearchesToStorage(updated);
      return updated;
    });
  };

  // Clear all recent searches
  const handleClearAllRecent = () => {
    setRecentSearches([]);
    saveRecentSearchesToStorage([]);
  };

  // Execute search
  const handleExecuteSearch = (queryToSearch) => {
    const query = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!query) {
      setSubmittedQuery('');
      return;
    }
    setSearchQuery(query);
    setSubmittedQuery(query);
    recordRecentSearch(query);
    Keyboard.dismiss();
  };

  // Active query to filter products by
  const activeSearchTerm = (submittedQuery || searchQuery).trim().toLowerCase();

  // Filter products based on search term
  const searchResults = useMemo(() => {
    if (!activeSearchTerm) return [];

    let results = ALL_PRODUCTS.filter((prod) => {
      const name = (prod.name || '').toLowerCase();
      const tags = Array.isArray(prod.tags) ? prod.tags.join(' ').toLowerCase() : '';
      const cat = Array.isArray(prod.categoryTab) ? prod.categoryTab.join(' ').toLowerCase() : '';
      const id = (prod.id || '').toLowerCase();
      const desc = (prod.desc || prod.subtitle || '').toLowerCase();

      return (
        name.includes(activeSearchTerm) ||
        tags.includes(activeSearchTerm) ||
        cat.includes(activeSearchTerm) ||
        id.includes(activeSearchTerm) ||
        desc.includes(activeSearchTerm)
      );
    });

    // Apply sorting
    if (sortBy === 'PRICE_ASC') {
      results.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'PRICE_DESC') {
      results.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'PV_DESC') {
      results.sort((a, b) => (b.pv || 0) - (a.pv || 0));
    }

    return results;
  }, [activeSearchTerm, sortBy]);

  // Recommended Bestsellers to show when search query is empty
  const recommendedBestsellers = useMemo(() => {
    return ALL_PRODUCTS.slice(0, 6);
  }, []);

  return (
    <View style={styles.container}>
      {/* 1. Top Search Header Bar */}
      <View style={styles.headerBar}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={onNavigateBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Search Capsule Input Box */}
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={19} color={COLORS.primary} style={styles.inputSearchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search Atomy products, health, skincare..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (!text.trim()) {
                setSubmittedQuery('');
              }
            }}
            onSubmitEditing={() => handleExecuteSearch()}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              activeOpacity={0.7}
              onPress={() => {
                setSearchQuery('');
                setSubmittedQuery('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={19} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Right Action: Search Button or Cart Icon */}
        {searchQuery.trim().length > 0 ? (
          <TouchableOpacity
            style={styles.searchSubmitBtn}
            activeOpacity={0.8}
            onPress={() => handleExecuteSearch()}
          >
            <Text style={styles.searchSubmitBtnText}>Search</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerCartBtn}
            activeOpacity={0.7}
            onPress={onCartPress}
            accessibilityLabel="Shopping Cart"
          >
            <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Main Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollInner}
      >
        {/* STATE A: NO SEARCH SUBMITTED / EMPTY INPUT -> Show Recent & Popular Searches */}
        {!activeSearchTerm ? (
          <View style={styles.discoveryContainer}>
            {/* 1. RECENT SEARCHES SECTION */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Ionicons name="time-outline" size={19} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                </View>
                {recentSearches.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearAllRecent}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {recentSearches.length > 0 ? (
                <View style={styles.chipsWrap}>
                  {recentSearches.map((term, index) => (
                    <View key={`recent-${index}-${term}`} style={styles.recentChip}>
                      <TouchableOpacity
                        style={styles.recentChipTouchable}
                        activeOpacity={0.75}
                        onPress={() => handleExecuteSearch(term)}
                      >
                        <Ionicons name="time-outline" size={13} color="#64748B" style={{ marginRight: 5 }} />
                        <Text style={styles.recentChipText} numberOfLines={1}>
                          {term}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.recentChipRemoveBtn}
                        activeOpacity={0.7}
                        onPress={() => handleRemoveRecentSearch(term)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="close" size={14} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyRecentBox}>
                  <Ionicons name="search-outline" size={22} color="#CBD5E1" />
                  <Text style={styles.emptyRecentText}>No recent searches yet</Text>
                </View>
              )}
            </View>

            {/* 2. POPULAR SEARCHES SECTION */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Ionicons name="flame" size={20} color="#FF5722" />
                  <Text style={styles.sectionTitle}>Popular Searches</Text>
                </View>
                <View style={styles.trendingBadge}>
                  <Text style={styles.trendingBadgeText}>Trending Now</Text>
                </View>
              </View>

              <View style={styles.chipsWrap}>
                {POPULAR_SEARCHES.map((popularTerm, idx) => {
                  const isTopPick = idx < 2;
                  return (
                    <TouchableOpacity
                      key={`pop-${popularTerm}`}
                      style={[styles.popularChip, isTopPick && styles.popularChipTop]}
                      activeOpacity={0.75}
                      onPress={() => handleExecuteSearch(popularTerm)}
                    >
                      {isTopPick ? (
                        <View style={styles.topRankPill}>
                          <Text style={styles.topRankText}>#{idx + 1}</Text>
                        </View>
                      ) : (
                        <Ionicons name="trending-up" size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
                      )}
                      <Text style={[styles.popularChipText, isTopPick && styles.popularChipTextTop]}>
                        {popularTerm}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. QUICK CATEGORY SHORTCUTS */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Ionicons name="apps-outline" size={19} color="#0D9488" />
                  <Text style={styles.sectionTitle}>Browse by Category</Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                {QUICK_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryShortcutCard}
                    activeOpacity={0.75}
                    onPress={() => handleExecuteSearch(cat.query)}
                  >
                    <View style={styles.catIconCircle}>
                      <Ionicons name={cat.icon} size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.catShortcutLabel}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 4. RECOMMENDED BESTSELLERS */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Ionicons name="star" size={18} color="#EAB308" />
                  <Text style={styles.sectionTitle}>Featured Atomy Bestsellers</Text>
                </View>
              </View>

              <View style={styles.productGrid}>
                {recommendedBestsellers.map((prod) => (
                  <View key={`rec-${prod.id}`} style={styles.gridItem}>
                    <LandingProductCard
                      product={prod}
                      cardWidth="100%"
                      isMember={isMember}
                      isFavorite={favorites.includes(prod.id)}
                      onToggleFavorite={onToggleFavorite}
                      onPress={onProductClick}
                      onAddToCart={onAddToCart}
                      onJoinMemberPress={onJoinMemberPress}
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          /* STATE B: SEARCH RESULTS DISPLAY */
          <View style={styles.resultsContainer}>
            {/* Results Status & Sort Bar */}
            <View style={styles.resultsBar}>
              <View style={styles.resultCountRow}>
                <Text style={styles.resultsForText}>
                  Results for <Text style={styles.resultsQueryHighlight}>"{activeSearchTerm}"</Text>
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{searchResults.length}</Text>
                </View>
              </View>

              {/* Sorting Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortChipsRow}>
                {[
                  { id: 'RELEVANCE', label: 'Relevance' },
                  { id: 'PRICE_ASC', label: 'Price: Low to High' },
                  { id: 'PRICE_DESC', label: 'Price: High to Low' },
                  { id: 'PV_DESC', label: 'Highest PV' },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.sortChip, sortBy === s.id && styles.sortChipActive]}
                    activeOpacity={0.75}
                    onPress={() => setSortBy(s.id)}
                  >
                    <Text style={[styles.sortChipText, sortBy === s.id && styles.sortChipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Search Results Grid */}
            {searchResults.length > 0 ? (
              <View style={styles.productGrid}>
                {searchResults.map((product) => (
                  <View key={`search-${product.id}`} style={styles.gridItem}>
                    <LandingProductCard
                      product={product}
                      cardWidth="100%"
                      isMember={isMember}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={onToggleFavorite}
                      onPress={onProductClick}
                      onAddToCart={onAddToCart}
                      onJoinMemberPress={onJoinMemberPress}
                    />
                  </View>
                ))}
              </View>
            ) : (
              /* EMPTY SEARCH RESULTS STATE */
              <View style={styles.emptyResultsWrapper}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="search" size={42} color="#94A3B8" />
                </View>
                <Text style={styles.emptyResultsTitle}>No products found</Text>
                <Text style={styles.emptyResultsSub}>
                  We couldn't find any products matching "{activeSearchTerm}". Check your spelling or try popular keywords below.
                </Text>

                {/* Popular Searches Fallback */}
                <View style={styles.fallbackPopularBox}>
                  <Text style={styles.fallbackTitle}>Try searching for:</Text>
                  <View style={styles.chipsWrap}>
                    {POPULAR_SEARCHES.slice(0, 6).map((term) => (
                      <TouchableOpacity
                        key={`fallback-${term}`}
                        style={styles.popularChip}
                        activeOpacity={0.75}
                        onPress={() => handleExecuteSearch(term)}
                      >
                        <Ionicons name="trending-up" size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
                        <Text style={styles.popularChipText}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Global Footer */}
        <AtomyFooter onNavigateHome={onNavigateHome} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    height: 40,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  inputSearchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 0,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  searchSubmitBtn: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  searchSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerCartBtn: {
    marginLeft: 10,
    padding: 6,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingBottom: 40,
  },
  discoveryContainer: {
    padding: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  clearAllText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#EF4444',
  },
  trendingBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  trendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentChipTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 160,
  },
  recentChipText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  recentChipRemoveBtn: {
    padding: 4,
    marginLeft: 4,
  },
  emptyRecentBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 8,
  },
  emptyRecentText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  popularChipTop: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  topRankPill: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 6,
  },
  topRankText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  popularChipText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  popularChipTextTop: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  categoryShortcutCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 85,
  },
  catIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catShortcutLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 12,
  },
  resultsBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultsForText: {
    fontSize: 14,
    color: '#64748B',
  },
  resultsQueryHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sortChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridItem: {
    width: '48%',
    marginBottom: 6,
  },
  emptyResultsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyResultsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptyResultsSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  fallbackPopularBox: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  fallbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
});
