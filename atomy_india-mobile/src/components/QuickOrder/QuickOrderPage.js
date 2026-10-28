import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { ALL_PRODUCTS } from '../../data/mockData';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../../data/officialDistributorPrices';
import { getHighResImageUrl } from '../../utils/imageUtils';

const phoenixLogo = require('../../../assets/fic-symbol.png');

// Curated authentic popular & fast-selling Atomy India products
const POPULAR_FAST_SELLING_METADATA = [
  {
    id: 'D00101',
    tag: '🔥 #1 BESTSELLER',
    tagColor: '#DC2626',
    tagBg: '#FEE2E2',
    subtitle: 'Immunity Up! Patented Herbal Complex',
    category: 'health',
  },
  {
    id: 'D00207',
    tag: '⭐ HIGHEST PV',
    tagColor: '#7C3AED',
    tagBg: '#EDE9FE',
    subtitle: 'Absolute CellActive Luxury Skincare Set',
    category: 'beauty',
  },
  {
    id: 'D00003',
    tag: '🏆 TOP SELLER',
    tagColor: '#0284C7',
    tagBg: '#E0F2FE',
    subtitle: 'The Fame 5-Piece Hydrating Daily Care',
    category: 'beauty',
  },
  {
    id: 'D00351',
    tag: '✨ HOME SPA',
    tagColor: '#D97706',
    tagBg: '#FEF3C7',
    subtitle: 'Evening Care 4-Step Deep Cleansing',
    category: 'beauty',
  },
  {
    id: 'D00510',
    tag: '⭐ DAILY ESSENTIAL',
    tagColor: '#16A34A',
    tagBg: '#DCFCE7',
    subtitle: 'Super Slim 99.9% Gold Nano Bristles (8N)',
    category: 'personal',
  },
  {
    id: 'D00170',
    tag: '🌿 SUPERFOOD',
    tagColor: '#059669',
    tagBg: '#D1FAE5',
    subtitle: 'Organic Fermented Noni Concentrate',
    category: 'health',
  },
  {
    id: 'D00111',
    tag: '❤️ HEART HEALTH',
    tagColor: '#DC2626',
    tagBg: '#FEE2E2',
    subtitle: 'Alaska E-Omega 3 High Purity EPA & DHA',
    category: 'health',
  },
  {
    id: 'D00160',
    tag: '🦠 GUT HEALTH',
    tagColor: '#6D28D9',
    tagBg: '#F3E8FF',
    subtitle: 'Nutraceutical Mix (12 Probiotics Complex)',
    category: 'health',
  },
  {
    id: 'D00281',
    tag: '☀️ SUN DEFENSE',
    tagColor: '#EA580C',
    tagBg: '#FFEDD5',
    subtitle: 'Broad Spectrum SPF50+ PA+++ Sunscreen',
    category: 'beauty',
  },
  {
    id: 'D90178',
    tag: '🌱 100% PURE',
    tagColor: '#15803D',
    tagBg: '#DCFCE7',
    subtitle: 'Pure Spirulina Nutrient Booster (India)',
    category: 'health',
  },
  {
    id: 'D94085',
    tag: '⚡ VITALITY',
    tagColor: '#B45309',
    tagBg: '#FEF3C7',
    subtitle: 'Pure Shilajit Herbal Capsules',
    category: 'health',
  },
  {
    id: 'D00693',
    tag: '💆 SCALP & HAIR',
    tagColor: '#0284C7',
    tagBg: '#E0F2FE',
    subtitle: 'Scalpcare 2 Set (Shampoo & Treatment)',
    category: 'personal',
  },
  {
    id: 'D00757',
    tag: '💧 MOISTURE',
    tagColor: '#2563EB',
    tagBg: '#DBEAFE',
    subtitle: 'Hydra Brightening Care 2-Set',
    category: 'beauty',
  },
  {
    id: 'D00975',
    tag: '☕ 100% ARABICA',
    tagColor: '#78350F',
    tagBg: '#F5EBE6',
    subtitle: 'Cafe Arabica Black Premium Coffee (50pk)',
    category: 'personal',
  },
];

const POPULAR_TABS = [
  { id: 'all', label: 'All Popular' },
  { id: 'health', label: 'Health & Immunity' },
  { id: 'beauty', label: 'Skincare & Beauty' },
  { id: 'personal', label: 'Personal & Home' },
];

export default function QuickOrderPage({
  onNavigateHome,
  onNavigateBack,
  onCartPress,
  onAddToCart,
  onCheckout,
  cartCount = 0,
  currentUser,
  isMember = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  // Order sheet starts empty - no hardcoded demo products
  const [orderRows, setOrderRows] = useState([]);
  const [activePopularTab, setActivePopularTab] = useState('all');

  // Autocomplete search suggestions from ALL_PRODUCTS
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALL_PRODUCTS.filter(
      (p) =>
        p &&
        (p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [searchQuery]);

  // Price & PV calculation helpers
  const getItemPrice = (product) => {
    if (!product) return { price: 0, mrp: 0, isDiscounted: false };
    const official = product.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[product.id] : null;
    const rawPrice = Number(product.price) || (official ? official.mrp || official.dpPrice : 1000);
    let dpPrice = Number(product.dpPrice || (official ? official.dpPrice : 0));
    if (!dpPrice || dpPrice >= rawPrice) {
      dpPrice = Math.round(rawPrice * 0.85);
    }
    const finalPrice = isMember ? dpPrice : rawPrice;
    const mrp = Number(product.mrp || (official ? official.mrp : rawPrice));
    return {
      price: finalPrice,
      mrp,
      isDiscounted: isMember && dpPrice < mrp,
    };
  };

  const getItemPv = (product) => {
    if (!product) return 0;
    const official = product.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[product.id] : null;
    return Number(product.pv || (official ? official.pv : 0)) || Math.round((product.price || 1000) * 4.5);
  };

  // Add product to quick order rows
  const handleAddProduct = (prod) => {
    if (!prod) return;
    setOrderRows((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [{ product: prod, qty: 1 }, ...prev];
    });
    setSearchQuery('');
  };

  // Update row quantity
  const handleUpdateQty = (prodId, newQty) => {
    if (newQty <= 0) {
      handleRemoveRow(prodId);
      return;
    }
    setOrderRows((prev) =>
      prev.map((item) =>
        item.product.id === prodId ? { ...item, qty: newQty } : item
      )
    );
  };

  // Remove row
  const handleRemoveRow = (prodId) => {
    setOrderRows((prev) => prev.filter((item) => item.product.id !== prodId));
  };

  // Check how many of a product are currently in the order rows
  const getProductRowQty = (prodId) => {
    const existing = orderRows.find((item) => item.product.id === prodId);
    return existing ? existing.qty : 0;
  };

  // Curated Popular & Fast Selling Products list
  const popularFastSellingProducts = useMemo(() => {
    return POPULAR_FAST_SELLING_METADATA.map((meta) => {
      const prod = ALL_PRODUCTS.find(
        (p) => p && String(p.id).toUpperCase() === meta.id.toUpperCase()
      );
      if (!prod) return null;
      return {
        ...prod,
        popularTag: meta.tag,
        popularTagColor: meta.tagColor,
        popularTagBg: meta.tagBg,
        popularSubtitle: meta.subtitle,
        popularCategory: meta.category,
      };
    }).filter(Boolean);
  }, []);

  // Filtered list based on active tab
  const filteredPopularProducts = useMemo(() => {
    if (activePopularTab === 'all') return popularFastSellingProducts;
    return popularFastSellingProducts.filter(
      (p) => p.popularCategory === activePopularTab
    );
  }, [popularFastSellingProducts, activePopularTab]);

  // Calculations for summary bar
  const totalItemsCount = orderRows.reduce((sum, r) => sum + r.qty, 0);
  const totalPrice = orderRows.reduce(
    (sum, r) => sum + getItemPrice(r.product).price * r.qty,
    0
  );
  const totalPv = orderRows.reduce(
    (sum, r) => sum + getItemPv(r.product) * r.qty,
    0
  );

  // Add all rows to global cart
  const handleAddAllToCart = () => {
    if (orderRows.length === 0) {
      Alert.alert('Empty Order', 'Please add at least one product to the quick order sheet.');
      return;
    }
    orderRows.forEach((r) => {
      if (onAddToCart) {
        for (let i = 0; i < r.qty; i++) {
          onAddToCart(r.product);
        }
      }
    });
    Alert.alert('Added to Cart', `Added ${totalItemsCount} items to your shopping cart.`);
  };

  // Direct Checkout with quick order rows
  const handleProceedCheckout = () => {
    if (orderRows.length === 0) {
      Alert.alert('Empty Order', 'Please add at least one product to the quick order sheet.');
      return;
    }
    const items = orderRows.map((r) => {
      const priceInfo = getItemPrice(r.product);
      const pv = getItemPv(r.product);
      return {
        ...r.product,
        price: priceInfo.price,
        dpPrice: priceInfo.price,
        pv,
        image: r.product.image || r.product.img,
        qty: r.qty,
      };
    });
    if (onCheckout) {
      onCheckout(items);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP CYAN NAVBAR */}
      <View style={styles.topNavBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onNavigateBack || onNavigateHome}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.brandingCenter}>
          <Image source={phoenixLogo} style={styles.phoenixEmblem} resizeMode="contain" />
          <View style={styles.brandingTextCol}>
            <Text style={styles.brandingTitle} numberOfLines={1}>
              QUICK ORDER
            </Text>
            <Text style={styles.brandingSubtitle}>Fast Catalog Entry & Fast Selling</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={onCartPress}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Logged in member delivery address bar */}
      <View style={styles.memberAddressCard}>
        <View style={styles.memberBadgeRow}>
          <View style={styles.memberGreetingBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#00A3E0" />
            <Text style={styles.memberGreetingText}>
              {currentUser?.memberId
                ? `★ DP Member: ${currentUser?.name || 'Member'} (ID: ${currentUser.memberId})`
                : `★ Customer: ${currentUser?.name || 'Guest User'}`}
            </Text>
          </View>
          <View style={styles.freeShippingPill}>
            <Ionicons name="sparkles" size={11} color="#16A34A" />
            <Text style={styles.freeShippingPillText}>Free Delivery</Text>
          </View>
        </View>

        <View style={styles.addressInlineRow}>
          <Ionicons name="location-outline" size={14} color="#64748B" />
          <Text style={styles.addressInlineText} numberOfLines={1}>
            {currentUser?.address || '801, Tower B, Unitech Cyber Park, Sector 39, Gurugram'}
          </Text>
        </View>
      </View>

      {/* 2. FAST PRODUCT CODE / NAME INPUT */}
      <View style={styles.searchSection}>
        <Text style={styles.inputPromptText}>
          Enter Product Code (e.g. D00101, D00207) or Name:
        </Text>
        <View style={styles.searchBar}>
          <Ionicons name="barcode-outline" size={20} color="#00A3E0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Type product code or keyword..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Suggestions Dropdown */}
        {searchSuggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            {searchSuggestions.map((item) => {
              const priceInfo = getItemPrice(item);
              const pv = getItemPv(item);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionItem}
                  onPress={() => handleAddProduct(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.suggestionCodeBadge}>
                    <Text style={styles.suggestionCodeText}>{item.id}</Text>
                  </View>
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.suggestionPrice}>₹{priceInfo.price.toLocaleString('en-IN')}</Text>
                  <View style={styles.suggestionPvBadge}>
                    <Text style={styles.suggestionPvText}>+{pv.toLocaleString('en-IN')} PV</Text>
                  </View>
                  <Ionicons name="add-circle" size={22} color="#00A3E0" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* 3. MAIN SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={[
          styles.scrollContent,
          orderRows.length > 0 && styles.scrollContentWithBottomBar,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION A: ORDER SHEET ITEMS (If populated) */}
        {orderRows.length > 0 && (
          <View style={styles.orderSheetSection}>
            <View style={styles.listHeaderRow}>
              <View style={styles.listHeaderTitleGroup}>
                <Ionicons name="receipt-outline" size={18} color="#00A3E0" />
                <Text style={styles.listHeaderTitle}>
                  Order Sheet Items ({orderRows.length})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setOrderRows([])} activeOpacity={0.7}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {orderRows.map((row) => {
              const priceInfo = getItemPrice(row.product);
              const rowPrice = priceInfo.price * row.qty;
              const rowPv = getItemPv(row.product) * row.qty;

              return (
                <View key={row.product.id} style={styles.rowCard}>
                  <Image
                    source={{ uri: getHighResImageUrl(row.product.image || row.product.img) }}
                    style={styles.rowThumbnail}
                    resizeMode="contain"
                  />

                  <View style={styles.rowInfoCol}>
                    <View style={styles.codeRow}>
                      <Text style={styles.productCodeBadge}>{row.product.id}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveRow(row.product.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={17} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.rowProductName} numberOfLines={2}>
                      {row.product.name}
                    </Text>

                    <View style={styles.priceAndControlsRow}>
                      <View>
                        <Text style={styles.rowPriceText}>
                          ₹ {rowPrice.toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.rowPvText}>
                          +{rowPv.toLocaleString('en-IN')} PV
                        </Text>
                      </View>

                      {/* Quantity Selector */}
                      <View style={styles.qtyControlGroup}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => handleUpdateQty(row.product.id, row.qty - 1)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="remove" size={14} color="#0F172A" />
                        </TouchableOpacity>
                        <Text style={styles.qtyNumber}>{row.qty}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => handleUpdateQty(row.product.id, row.qty + 1)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={14} color="#0F172A" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* SECTION B: ORDER SHEET EMPTY HELPER BANNER (When 0 items) */}
        {orderRows.length === 0 && (
          <View style={styles.sheetEmptyPrompt}>
            <View style={styles.sheetEmptyIconCircle}>
              <Ionicons name="flash" size={20} color="#00A3E0" />
            </View>
            <View style={styles.sheetEmptyTextWrap}>
              <Text style={styles.sheetEmptyTitle}>Quick Order Sheet Ready</Text>
              <Text style={styles.sheetEmptySubtitle}>
                Type a product code above or tap <Text style={styles.sheetEmptyHighlight}>[+ Add]</Text> on popular fast-selling products below.
              </Text>
            </View>
          </View>
        )}

        {/* SECTION C: POPULAR & FAST SELLING PRODUCTS LIST */}
        <View style={styles.popularSection}>
          <View style={styles.popularSectionHeader}>
            <View style={styles.popularTitleRow}>
              <View style={styles.popularFireBadge}>
                <Ionicons name="flame" size={16} color="#DC2626" />
                <Text style={styles.popularFireText}>HOT</Text>
              </View>
              <Text style={styles.popularSectionTitle}>Popular Fast-Selling Products</Text>
            </View>
            <Text style={styles.popularSectionSub}>
              Top Atomy bestsellers with high PV • 1-Tap Quick Add
            </Text>
          </View>

          {/* Category Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularTabsRow}
          >
            {POPULAR_TABS.map((tab) => {
              const isActive = activePopularTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.popularTabChip, isActive && styles.popularTabChipActive]}
                  onPress={() => setActivePopularTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.popularTabChipText,
                      isActive && styles.popularTabChipTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Popular Products Cards List */}
          <View style={styles.popularProductsList}>
            {filteredPopularProducts.map((item) => {
              const priceInfo = getItemPrice(item);
              const pv = getItemPv(item);
              const qtyInSheet = getProductRowQty(item.id);

              return (
                <View key={`pop-${item.id}`} style={styles.popularCard}>
                  {/* Product Thumbnail */}
                  <Image
                    source={{ uri: getHighResImageUrl(item.image || item.img) }}
                    style={styles.popularThumbnail}
                    resizeMode="contain"
                  />

                  {/* Middle Details */}
                  <View style={styles.popularInfoCol}>
                    {/* Badge Row: Code + Fast Selling Pill */}
                    <View style={styles.popularBadgeRow}>
                      <View style={styles.popularCodeBadge}>
                        <Text style={styles.popularCodeText}>{item.id}</Text>
                      </View>
                      {item.popularTag && (
                        <View
                          style={[
                            styles.popularTagPill,
                            { backgroundColor: item.popularTagBg || '#FEE2E2' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.popularTagText,
                              { color: item.popularTagColor || '#DC2626' },
                            ]}
                          >
                            {item.popularTag}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Product Name */}
                    <Text style={styles.popularProductName} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {/* Subtitle / Key benefit */}
                    {item.popularSubtitle && (
                      <Text style={styles.popularProductSub} numberOfLines={1}>
                        {item.popularSubtitle}
                      </Text>
                    )}

                    {/* Price and PV */}
                    <View style={styles.popularPriceRow}>
                      <View style={styles.popularPriceCol}>
                        <Text style={styles.popularPriceText}>
                          ₹ {priceInfo.price.toLocaleString('en-IN')}
                        </Text>
                        {priceInfo.isDiscounted && (
                          <Text style={styles.popularMrpText}>
                            MRP ₹{priceInfo.mrp.toLocaleString('en-IN')}
                          </Text>
                        )}
                      </View>

                      <View style={styles.popularPvBadge}>
                        <Ionicons name="sparkles" size={11} color="#00A3E0" />
                        <Text style={styles.popularPvText}>
                          +{pv.toLocaleString('en-IN')} PV
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Right Action: + Add or In-Sheet Stepper */}
                  <View style={styles.popularActionCol}>
                    {qtyInSheet > 0 ? (
                      <View style={styles.popularInSheetControls}>
                        <Text style={styles.popularInSheetLabel}>In Sheet</Text>
                        <View style={styles.popularQtyStepper}>
                          <TouchableOpacity
                            style={styles.popularQtyStepperBtn}
                            onPress={() => handleUpdateQty(item.id, qtyInSheet - 1)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="remove" size={13} color="#0F172A" />
                          </TouchableOpacity>
                          <Text style={styles.popularQtyStepperNumber}>{qtyInSheet}</Text>
                          <TouchableOpacity
                            style={styles.popularQtyStepperBtn}
                            onPress={() => handleUpdateQty(item.id, qtyInSheet + 1)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="add" size={13} color="#0F172A" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.popularAddBtn}
                        onPress={() => handleAddProduct(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.popularAddBtnText}>Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 4. STICKY BOTTOM SUMMARY BAR (Only visible when items in sheet) */}
      {orderRows.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomSummaryInfo}>
            <View>
              <Text style={styles.bottomCountLabel}>{totalItemsCount} Products Selected</Text>
              <Text style={styles.bottomTotalText}>₹ {totalPrice.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.bottomPvBadge}>
              <Ionicons name="sparkles" size={13} color="#00A3E0" />
              <Text style={styles.bottomPvText}>+{totalPv.toLocaleString('en-IN')} PV</Text>
            </View>
          </View>

          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddAllToCart}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={16} color="#00A3E0" />
              <Text style={styles.addToCartBtnText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleProceedCheckout}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutBtnText}>Order Sheet &gt;</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNavBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 10 : 12,
    paddingBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backButton: {
    padding: 6,
    marginLeft: -4,
  },
  brandingCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginLeft: 8,
  },
  phoenixEmblem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  brandingTextCol: {
    flexShrink: 1,
  },
  brandingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandingSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  cartButton: {
    padding: 6,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E11D48',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  memberAddressCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 6,
  },
  memberBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberGreetingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  memberGreetingText: {
    color: '#00A3E0',
    fontSize: 11,
    fontWeight: '700',
  },
  freeShippingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeShippingPillText: {
    color: '#16A34A',
    fontSize: 10.5,
    fontWeight: '700',
  },
  addressInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressInlineText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  inputPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  suggestionCodeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggestionCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A3E0',
  },
  suggestionName: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  suggestionPvBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggestionPvText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 16,
  },
  scrollContentWithBottomBar: {
    paddingBottom: 130,
  },
  sheetEmptyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    borderLeftWidth: 4,
    borderLeftColor: '#00A3E0',
    gap: 12,
  },
  sheetEmptyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetEmptyTextWrap: {
    flex: 1,
  },
  sheetEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  sheetEmptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  sheetEmptyHighlight: {
    color: '#00A3E0',
    fontWeight: '700',
  },
  orderSheetSection: {
    gap: 10,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  listHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearAllText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  rowCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    alignItems: 'center',
  },
  rowThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  rowInfoCol: {
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  productCodeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A3E0',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  rowProductName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 8,
  },
  priceAndControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rowPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowPvText: {
    fontSize: 11,
    color: '#00A3E0',
    fontWeight: '700',
  },
  qtyControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  qtyNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  popularSection: {
    gap: 10,
  },
  popularSectionHeader: {
    marginBottom: 2,
  },
  popularTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  popularFireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  popularFireText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  popularSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  popularSectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  popularTabsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  popularTabChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularTabChipActive: {
    backgroundColor: '#00A3E0',
    borderColor: '#00A3E0',
  },
  popularTabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  popularTabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  popularProductsList: {
    gap: 10,
  },
  popularCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  popularThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  popularInfoCol: {
    flex: 1,
  },
  popularBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  popularCodeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  popularCodeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
  popularTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  popularTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  popularProductName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 2,
  },
  popularProductSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  popularPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  popularPriceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  popularPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  popularMrpText: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  popularPvBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  popularPvText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
  popularActionCol: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  popularAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    minWidth: 64,
    justifyContent: 'center',
  },
  popularAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  popularInSheetControls: {
    alignItems: 'center',
    gap: 4,
  },
  popularInSheetLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  popularQtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  popularQtyStepperBtn: {
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  popularQtyStepperNumber: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 18,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  bottomSummaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomCountLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomTotalText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  bottomPvBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  bottomPvText: {
    color: '#00A3E0',
    fontWeight: '700',
    fontSize: 12.5,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 11,
    borderRadius: 8,
    gap: 6,
  },
  addToCartBtnText: {
    color: '#00A3E0',
    fontSize: 13,
    fontWeight: '700',
  },
  checkoutBtn: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A3E0',
    paddingVertical: 11,
    borderRadius: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
