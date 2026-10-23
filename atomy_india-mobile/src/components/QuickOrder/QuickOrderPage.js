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

const phoenixLogo = require('../../../assets/fic-symbol.png');

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
  const [orderRows, setOrderRows] = useState([
    {
      product: ALL_PRODUCTS[0], // HemoHIM
      qty: 1,
    },
    {
      product: ALL_PRODUCTS[1], // Absolute Skincare
      qty: 1,
    },
  ]);

  // Autocomplete search suggestions from ALL_PRODUCTS
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALL_PRODUCTS.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

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

  // Helper for row price
  const getRowPrice = (product) => {
    const official = product?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[product.id] : null;
    const rawPrice = Number(product.price) || (official ? official.dpPrice : 1000);
    let dpPrice = Number(product.dpPrice || (official ? official.dpPrice : 0));
    if (!dpPrice || dpPrice >= rawPrice) {
      dpPrice = Math.round(rawPrice * 0.85);
    }
    return isMember ? dpPrice : rawPrice;
  };

  // Calculations
  const totalItemsCount = orderRows.reduce((sum, r) => sum + r.qty, 0);
  const totalPrice = orderRows.reduce(
    (sum, r) => sum + getRowPrice(r.product) * r.qty,
    0
  );
  const totalPv = orderRows.reduce(
    (sum, r) => {
      const official = r.product?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[r.product.id] : null;
      const pv = Number(r.product.pv || (official ? official.pv : 0)) || Math.round((r.product.price || 1000) * 4.5);
      return sum + pv * r.qty;
    },
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
      const official = r.product?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[r.product.id] : null;
      const rawPrice = Number(r.product.price) || (official ? official.dpPrice : 1000);
      let dpPrice = Number(r.product.dpPrice || (official ? official.dpPrice : 0));
      if (!dpPrice || dpPrice >= rawPrice) {
        dpPrice = Math.round(rawPrice * 0.85);
      }
      return {
        ...r.product,
        price: rawPrice,
        dpPrice,
        pv: Number(r.product.pv || (official ? official.pv : 0)) || Math.round(rawPrice * 4.5),
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
            <Text style={styles.brandingSubtitle}>Fast Catalog Entry Sheet</Text>
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

      {/* Logged in member delivery address bar matching website */}
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
            {searchSuggestions.map((item) => (
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
                <Text style={styles.suggestionPrice}>₹{item.price}</Text>
                <Ionicons name="add-circle" size={20} color="#00A3E0" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 3. QUICK-ADD BESTSELLER SHORTCUTS */}
      <View style={styles.quickAddStrip}>
        <Text style={styles.quickAddStripTitle}>Popular:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickAddScroll}
        >
          {ALL_PRODUCTS.slice(0, 6).map((prod) => (
            <TouchableOpacity
              key={prod.id}
              style={styles.quickAddPill}
              onPress={() => handleAddProduct(prod)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickAddPillText}>+ {prod.id}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. ORDER ROWS LIST */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>
            Order Sheet Items ({orderRows.length})
          </Text>
          {orderRows.length > 0 && (
            <TouchableOpacity onPress={() => setOrderRows([])}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {orderRows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Your Quick Order Sheet is Empty</Text>
            <Text style={styles.emptySub}>
              Type product codes or tap a quick-add button above to populate your order rows.
            </Text>
          </View>
        ) : (
          orderRows.map((row) => {
            const rowPrice = (row.product.price || 0) * row.qty;
            const rowPv = (row.product.pv || 0) * row.qty;

            return (
              <View key={row.product.id} style={styles.rowCard}>
                <Image
                  source={{ uri: row.product.image || row.product.img }}
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
                      <Text style={styles.rowPriceText}>₹ {rowPrice.toLocaleString('en-IN')}</Text>
                      <Text style={styles.rowPvText}>+{rowPv.toLocaleString('en-IN')} PV</Text>
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
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 5. STICKY BOTTOM SUMMARY BAR */}
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  quickAddStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  quickAddStripTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  quickAddScroll: {
    gap: 6,
  },
  quickAddPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickAddPillText: {
    fontSize: 12,
    color: '#00A3E0',
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
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
});
