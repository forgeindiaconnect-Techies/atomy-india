import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { ALL_PRODUCTS } from '../../data/mockData';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../../data/officialDistributorPrices';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getItemPricing(item, isMember) {
  const official = item.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[item.id] : null;
  const rawPrice = Number(item.price) || (official ? official.dpPrice : 1000);
  let mrp = Number(item.originalPrice) || Number(item.mrp);
  if (!mrp || mrp <= rawPrice) {
    if (official && official.mrp && official.mrp > rawPrice) {
      mrp = official.mrp;
    } else {
      mrp = Math.round(rawPrice * 1.18);
    }
  }
  let dpPrice = Number(item.dpPrice || (official ? official.dpPrice : 0));
  if (!dpPrice || dpPrice >= rawPrice) {
    dpPrice = Math.round(rawPrice * 0.85);
  }
  const itemPrice = isMember ? dpPrice : rawPrice;
  const pv = Number(item.pv || (official ? official.pv : 0)) || Math.round(rawPrice * 4.5);
  return { rawPrice, mrp, dpPrice, itemPrice, pv };
}

export default function CartPage({
  cartItems = [],
  isMember = false,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  onNavigateHome,
  onNavigateBack,
  onProductClick,
  onAddToCart,
  onOpenMembershipModal,
}) {
  // Array of selected product IDs (all selected by default)
  const [selectedIds, setSelectedIds] = useState(() =>
    cartItems.map((item) => item.id)
  );

  // Sync selected IDs if cart items change
  React.useEffect(() => {
    setSelectedIds((prev) => {
      const currentIds = cartItems.map((item) => item.id);
      return prev.filter((id) => currentIds.includes(id));
    });
  }, [cartItems]);

  // Toggle single item selection
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const isAllSelected =
    cartItems.length > 0 && selectedIds.length === cartItems.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map((item) => item.id));
    }
  };

  // Delete selected items
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      Alert.alert(
        'No Items Selected',
        'Please select the items you wish to remove from your cart.'
      );
      return;
    }
    Alert.alert(
      'Remove Items',
      `Are you sure you want to remove ${selectedIds.length} selected ${
        selectedIds.length === 1 ? 'item' : 'items'
      } from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach((id) => onRemoveItem && onRemoveItem(id));
            setSelectedIds([]);
          },
        },
      ]
    );
  };

  // Calculation helpers
  const selectedItems = useMemo(
    () => cartItems.filter((item) => selectedIds.includes(item.id)),
    [cartItems, selectedIds]
  );

  const subtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const { itemPrice } = getItemPricing(item, isMember);
      return acc + itemPrice * (item.qty || 1);
    }, 0);
  }, [selectedItems, isMember]);

  const totalPV = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const { pv } = getItemPricing(item, isMember);
      return acc + pv * (item.qty || 1);
    }, 0);
  }, [selectedItems, isMember]);

  const hasFreeDeliveryProduct = useMemo(() => {
    return selectedItems.some((item) => item.freeDelivery === true);
  }, [selectedItems]);

  const freeShippingThreshold = 4500;
  const isFreeDeliveryEligible =
    subtotal >= freeShippingThreshold || hasFreeDeliveryProduct;
  const shippingFee =
    selectedItems.length > 0 && !isFreeDeliveryEligible ? 150 : 0;
  const grandTotal = subtotal + shippingFee;

  // Best products recommendations for cart bottom section
  const recommendedProducts = useMemo(() => {
    const inCartIds = cartItems.map((c) => c.id);
    return ALL_PRODUCTS.filter((p) => !inCartIds.includes(p.id)).slice(0, 8);
  }, [cartItems]);

  return (
    <View style={styles.screenContainer}>
      {/* 1. Header with Back Button and Progress Stepper */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onNavigateBack || onNavigateHome}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>

        {/* 3-Step Progress Stepper matching website (.odrHead-pgs) */}
        <View style={styles.stepperRow}>
          <View style={styles.stepItemActive}>
            <Text style={styles.stepNumActive}>01</Text>
            <Text style={styles.stepTextActive}>Cart</Text>
          </View>
          <Text style={styles.stepperSeparator}>›</Text>
          <View style={styles.stepItemInactive}>
            <Text style={styles.stepNumInactive}>02</Text>
            <Text style={styles.stepTextInactive}>Order / Payment</Text>
          </View>
          <Text style={styles.stepperSeparator}>›</Text>
          <View style={styles.stepItemInactive}>
            <Text style={styles.stepNumInactive}>03</Text>
            <Text style={styles.stepTextInactive}>Complete</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length === 0 ? (
          /* EMPTY CART STATE (matching website) */
          <View style={styles.emptyContainer}>
            {/* Member Benefits Banner */}
            {!isMember && (
              <View style={styles.guestBenefitBanner}>
                <View style={styles.guestBenefitInfo}>
                  <Text style={styles.guestBenefitTitle}>
                    Join as Member for DP Prices & PV
                  </Text>
                  <Text style={styles.guestBenefitSubtitle}>
                    Earn Points (PV) & unlock Distributor Discount pricing on every purchase.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.guestBenefitBtn}
                  onPress={onOpenMembershipModal}
                  activeOpacity={0.85}
                >
                  <Text style={styles.guestBenefitBtnText}>Join Free</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="bag-handle-outline" size={54} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>There are no items in the cart</Text>
              <Text style={styles.emptySubtitle}>
                Explore our curated Atomy India catalog to discover health, skincare, and daily lifestyle essentials.
              </Text>

              <TouchableOpacity
                style={styles.startShoppingBtn}
                onPress={onNavigateHome}
                activeOpacity={0.88}
              >
                <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
                <Text style={styles.startShoppingText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* POPULATED CART STATE */
          <View style={styles.cartContentWrapper}>
            {/* Select All & Delete Bar (.cart-topAll) */}
            <View style={styles.selectBar}>
              <TouchableOpacity
                style={styles.checkboxLabelRow}
                onPress={handleToggleSelectAll}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.customCheckbox,
                    isAllSelected && styles.customCheckboxChecked,
                  ]}
                >
                  {isAllSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.selectAllText}>
                  All ({selectedIds.length}/{cartItems.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteSelectedBtn}
                onPress={handleDeleteSelected}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteSelectedText}>Delete Selected</Text>
              </TouchableOpacity>
            </View>

            {/* Delivery Group Box (.cart-group) */}
            <View style={styles.cartGroupBox}>
              {/* Delivery Group Header */}
              <View style={styles.groupHeader}>
                <View style={styles.groupHeaderLeft}>
                  <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.groupHeaderText}>General Delivery</Text>
                </View>
                <View style={styles.directDeliveryBadge}>
                  <Text style={styles.directDeliveryBadgeText}>Direct Delivery</Text>
                </View>
              </View>

              {/* Free Delivery Indicator Banner */}
              <View
                style={[
                  styles.deliveryIndicatorBanner,
                  isFreeDeliveryEligible
                    ? styles.deliveryIndicatorSuccess
                    : styles.deliveryIndicatorStandard,
                ]}
              >
                <Ionicons
                  name={isFreeDeliveryEligible ? 'checkmark-circle' : 'information-circle'}
                  size={16}
                  color={isFreeDeliveryEligible ? '#059669' : '#0284C7'}
                />
                <Text
                  style={[
                    styles.deliveryIndicatorText,
                    isFreeDeliveryEligible
                      ? styles.deliveryTextSuccess
                      : styles.deliveryTextStandard,
                  ]}
                >
                  {isFreeDeliveryEligible ? (
                    'Free Delivery applied to this order!'
                  ) : (
                    `Standard Delivery (₹ 150.00) applied. Add ₹ ${(
                      freeShippingThreshold - subtotal
                    ).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })} more for Free Delivery.`
                  )}
                </Text>
              </View>

              {/* Products List */}
              {isMember ? (
                <View style={styles.memberStatusBanner}>
                  <Ionicons name="sparkles" size={15} color="#059669" />
                  <Text style={styles.memberStatusBannerText}>
                    Distributor Member Active: Wholesale DP prices applied to your cart!
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.joinMemberBanner}
                  activeOpacity={0.8}
                  onPress={onOpenMembershipModal}
                >
                  <View style={styles.joinMemberBannerLeft}>
                    <Ionicons name="lock-closed" size={14} color="#92400E" />
                    <Text style={styles.joinMemberBannerText}>
                      Join Membership to get Wholesale Distributor (DP) Prices
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#92400E" />
                </TouchableOpacity>
              )}

              <View style={styles.itemsList}>
                {cartItems.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id);
                  const { itemPrice, rawPrice, pv: itemPv } = getItemPricing(item, isMember);
                  const isLast = idx === cartItems.length - 1;

                  return (
                    <View
                      key={item.id}
                      style={[styles.cartItemRow, isLast && styles.cartItemRowLast]}
                    >
                      {/* Checkbox */}
                      <TouchableOpacity
                        style={styles.itemCheckWrapper}
                        onPress={() => handleToggleSelect(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <View
                          style={[
                            styles.customCheckbox,
                            isSelected && styles.customCheckboxChecked,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Product Thumbnail */}
                      <TouchableOpacity
                        style={styles.itemImageContainer}
                        onPress={() => onProductClick && onProductClick(item)}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={{
                            uri:
                              item.image ||
                              item.img ||
                              'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg',
                          }}
                          style={styles.itemImage}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>

                      {/* Product Details & Actions */}
                      <View style={styles.itemDetails}>
                        <View style={styles.itemDetailsTop}>
                          <View style={styles.itemTitleArea}>
                            <Text style={styles.itemCode}>{item.id}</Text>
                            <TouchableOpacity
                              onPress={() => onProductClick && onProductClick(item)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.itemName} numberOfLines={2}>
                                {item.name}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {/* Delete Item Button */}
                          <TouchableOpacity
                            style={styles.itemDeleteBtn}
                            onPress={() => onRemoveItem && onRemoveItem(item.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityLabel={`Remove ${item.name}`}
                          >
                            <Ionicons name="close" size={18} color="#94A3B8" />
                          </TouchableOpacity>
                        </View>

                        {/* PV Badge */}
                        <View style={styles.pvBadge}>
                          <Text style={styles.pvBadgeLabel}>PV</Text>
                          <Text style={styles.pvBadgeValue}>
                            {(itemPv * item.qty).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {/* Price & Quantity Row */}
                        <View style={styles.itemPriceQtyRow}>
                          <View style={styles.priceContainer}>
                            {isMember && rawPrice > itemPrice && (
                              <Text style={styles.itemOriginalPrice}>
                                ₹ {(rawPrice * item.qty).toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                })}
                              </Text>
                            )}
                            <Text style={[styles.itemPrice, isMember && styles.itemPriceGreen]}>
                              ₹ {(itemPrice * item.qty).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                              })}
                            </Text>
                            {isMember && (
                              <View style={styles.dpBadge}>
                                <Text style={styles.dpBadgeText}>DP Price</Text>
                              </View>
                            )}
                          </View>

                          {/* Stepper Controls */}
                          <View style={styles.qtyStepper}>
                            <TouchableOpacity
                              style={[
                                styles.stepperBtn,
                                item.qty <= 1 && styles.stepperBtnDisabled,
                              ]}
                              onPress={() =>
                                onUpdateQty &&
                                onUpdateQty(item.id, Math.max(1, item.qty - 1))
                              }
                              disabled={item.qty <= 1}
                              accessibilityLabel="Decrease quantity"
                            >
                              <Ionicons
                                name="remove"
                                size={14}
                                color={item.qty <= 1 ? '#CBD5E1' : '#0F172A'}
                              />
                            </TouchableOpacity>

                            <Text style={styles.stepperValue}>{item.qty}</Text>

                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() =>
                                onUpdateQty && onUpdateQty(item.id, item.qty + 1)
                              }
                              accessibilityLabel="Increase quantity"
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
            </View>

            {/* Order Summary Breakdown Box (.odr-total) */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryBoxTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total PV</Text>
                <Text style={styles.summaryPvValue}>
                  {totalPV.toLocaleString('en-IN')} PV
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping Fee</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    shippingFee === 0 && styles.freeShippingText,
                  ]}
                >
                  {shippingFee === 0 ? 'FREE' : `₹ ${shippingFee.toFixed(2)}`}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRowTotal}>
                <Text style={styles.summaryTotalLabel}>Estimated Total</Text>
                <Text style={styles.summaryTotalValue}>
                  ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <Text style={styles.gstNoteText}>
                * All prices are inclusive of GST. Final checkout invoice will display itemized taxes.
              </Text>
            </View>
          </View>
        )}

        {/* 2. Recommendations Section: "Best Product" matching website (.odrBtm-gds) */}
        {recommendedProducts.length > 0 && (
          <View style={styles.recommendationsSection}>
            <View style={styles.recHeaderRow}>
              <Text style={styles.recTitle}>Best Products</Text>
              <Text style={styles.recSubtitle}>Popular Picks for You</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recScrollContent}
            >
              {recommendedProducts.map((prod) => {
                const prodPrice =
                  isMember && prod.dpPrice ? prod.dpPrice : prod.price;

                return (
                  <View key={prod.id} style={styles.recCard}>
                    <TouchableOpacity
                      onPress={() => onProductClick && onProductClick(prod)}
                      activeOpacity={0.88}
                      style={styles.recImageWrap}
                    >
                      <Image
                        source={{
                          uri:
                            prod.image ||
                            prod.img ||
                            'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg',
                        }}
                        style={styles.recImage}
                        resizeMode="contain"
                      />
                      {prod.gstReduced && (
                        <View style={styles.recGstBadge}>
                          <Text style={styles.recGstBadgeText}>GST REDUCED</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <Text style={styles.recProdName} numberOfLines={2}>
                      {prod.name}
                    </Text>

                    <View style={styles.recPriceRow}>
                      <Text style={styles.recPriceText}>
                        ₹ {prodPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                      {isMember && (
                        <View style={styles.recDpBadge}>
                          <Text style={styles.recDpBadgeText}>DP</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.recPvText}>
                      {(prod.pv || 2000).toLocaleString('en-IN')} PV
                    </Text>

                    {/* Quick Add To Cart Button */}
                    <TouchableOpacity
                      style={styles.recAddBtn}
                      onPress={() => onAddToCart && onAddToCart(prod)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="cart-outline" size={15} color={COLORS.primary} />
                      <Text style={styles.recAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Extra padding at bottom for sticky checkout footer */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* 3. Sticky Bottom Checkout Bar (matching website (.fxd-btn)) */}
      {cartItems.length > 0 && (
        <View style={styles.stickyCheckoutBar}>
          <View style={styles.stickyTotalInfo}>
            <Text style={styles.stickyTotalLabel}>Estimated Total</Text>
            <Text style={styles.stickyTotalValue}>
              ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.stickyPvValue}>
              {totalPV.toLocaleString('en-IN')} PV Total
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.placeOrderBtn,
              selectedItems.length === 0 && styles.placeOrderBtnDisabled,
            ]}
            disabled={selectedItems.length === 0}
            onPress={() => onCheckout && onCheckout(selectedItems)}
            activeOpacity={0.88}
          >
            <Text style={styles.placeOrderBtnText}>
              {selectedItems.length === 0
                ? 'Place Order (0)'
                : `Place Order (${selectedItems.length})`}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  stepItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepNumActive: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  stepTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepperSeparator: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  stepItemInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepNumInactive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepTextInactive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Empty State Styles
  emptyContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  guestBenefitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  guestBenefitInfo: {
    flex: 1,
  },
  guestBenefitTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 2,
  },
  guestBenefitSubtitle: {
    fontSize: 11.5,
    color: '#0284C7',
    lineHeight: 15,
  },
  guestBenefitBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  guestBenefitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 24,
  },
  startShoppingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  startShoppingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Populated Cart Styles
  cartContentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  selectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  checkboxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.8,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCheckboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  deleteSelectedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  deleteSelectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Cart Group Box
  cartGroupBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#EDF4FB',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  directDeliveryBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  directDeliveryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // Delivery Indicator
  deliveryIndicatorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  deliveryIndicatorSuccess: {
    backgroundColor: '#ECFDF5',
  },
  deliveryIndicatorStandard: {
    backgroundColor: '#F8FAFC',
  },
  deliveryIndicatorText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  deliveryTextSuccess: {
    color: '#065F46',
    fontWeight: '600',
  },
  deliveryTextStandard: {
    color: '#475569',
    fontWeight: '500',
  },

  // Items List
  itemsList: {
    paddingHorizontal: 14,
  },
  cartItemRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'flex-start',
    gap: 10,
  },
  cartItemRowLast: {
    borderBottomWidth: 0,
  },
  itemCheckWrapper: {
    paddingTop: 28,
  },
  itemImageContainer: {
    width: 76,
    height: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  itemImage: {
    width: 68,
    height: 68,
  },
  itemDetails: {
    flex: 1,
    minWidth: 0,
  },
  itemDetailsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  itemTitleArea: {
    flex: 1,
  },
  itemCode: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    color: '#94A3B8',
    fontWeight: '600',
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginTop: 1,
  },
  itemDeleteBtn: {
    padding: 2,
  },
  pvBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  pvBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pvBadgeValue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0369A1',
  },
  itemPriceQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemPriceGreen: {
    color: '#059669',
  },
  itemOriginalPrice: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginRight: 2,
  },
  memberStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  memberStatusBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  joinMemberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  joinMemberBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  joinMemberBannerText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  dpBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    borderWidth: 0.8,
    borderColor: '#A7F3D0',
  },
  dpBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  stepperBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  stepperBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  stepperValue: {
    width: 28,
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Summary Box
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryBoxTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '700',
  },
  summaryPvValue: {
    fontSize: 13.5,
    color: COLORS.primary,
    fontWeight: '700',
  },
  freeShippingText: {
    color: '#059669',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  gstNoteText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
    marginTop: 4,
  },

  // Recommendations Section
  recommendationsSection: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
    paddingBottom: 8,
  },
  recHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  recSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  recScrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  recCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  recImageWrap: {
    width: '100%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  recImage: {
    width: 100,
    height: 100,
  },
  recGstBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 2,
  },
  recGstBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '800',
  },
  recProdName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 15,
    height: 30,
    marginBottom: 4,
  },
  recPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recPriceText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  recDpBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 3.5,
    paddingVertical: 1,
    borderRadius: 2,
  },
  recDpBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#059669',
  },
  recPvText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 6,
  },
  recAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 4,
    backgroundColor: '#F0F9FF',
  },
  recAddBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Sticky Bottom Checkout Bar
  stickyCheckoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 10,
  },
  stickyTotalInfo: {
    flex: 1,
  },
  stickyTotalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  stickyTotalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  stickyPvValue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  placeOrderBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  placeOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
