import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { ALL_PRODUCTS } from '../../data/mockData';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../../data/officialDistributorPrices';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatInr(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function FavoritesPage({
  favoriteIds = [],
  isMember = false,
  cartCount = 0,
  onNavigateHome,
  onNavigateBack,
  onNavigateCart,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onProductClick,
}) {
  // Map favoriteIds to product objects
  const favoriteProducts = React.useMemo(() => {
    return favoriteIds
      .map((id) => ALL_PRODUCTS.find((p) => String(p.id) === String(id)))
      .filter(Boolean);
  }, [favoriteIds]);

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all saved items from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            favoriteProducts.forEach((p) => onToggleFavorite && onToggleFavorite(p));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* 1. Cyan Top Navbar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={onNavigateBack || onNavigateHome}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          My Favorites
        </Text>

        <View style={styles.headerActionsRight}>
          {favoriteProducts.length > 0 && (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={handleClearAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerCartBtn}
            onPress={onNavigateCart}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={23} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Sub-Header: Breadcrumb & Item Count */}
      <View style={styles.subBar}>
        <View style={styles.breadcrumbRow}>
          <TouchableOpacity onPress={onNavigateHome}>
            <Text style={styles.breadcrumbLink}>HOME</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSep}>›</Text>
          <Text style={styles.breadcrumbLink}>Shopping Mall</Text>
          <Text style={styles.breadcrumbSep}>›</Text>
          <Text style={styles.breadcrumbCurrent}>Favorites</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      </View>

      {/* 3. Main Content: Empty State vs Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {favoriteProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={54} color="#EF4444" />
            </View>
            <Text style={styles.emptyTitle}>Your Favorites list is empty</Text>
            <Text style={styles.emptySubtitle}>
              Explore Atomy's range of Absolute Quality, Absolute Price products and tap the heart
              icon on any item to save it here.
            </Text>
            <TouchableOpacity
              style={styles.emptyStartBtn}
              onPress={onNavigateHome}
              activeOpacity={0.88}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.emptyStartBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {favoriteProducts.map((prod) => {
              const priceData = OFFICIAL_DISTRIBUTOR_PRICES[prod.id] || null;
              const rawPrice = Number(prod.price) || (priceData ? priceData.dpPrice : 1000);
              let mrp = Number(prod.originalPrice) || Number(prod.mrp);
              if (!mrp || mrp <= rawPrice) {
                mrp = priceData?.mrp || Math.round(rawPrice * 1.18);
              }
              const dpPrice =
                Number(prod.dpPrice || priceData?.dpPrice) || Math.round(rawPrice * 0.85);
              const pv = Number(prod.pv || priceData?.pv) || Math.round(rawPrice * 4.5);
              const activePrice = isMember ? dpPrice : rawPrice;
              const discountPercent = Math.round(((mrp - activePrice) / mrp) * 100);

              const imgUri =
                prod.image ||
                prod.img ||
                'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg';

              return (
                <View key={prod.id} style={styles.card}>
                  {/* Remove Favorite Button */}
                  <TouchableOpacity
                    style={styles.removeFavBtn}
                    onPress={() => onToggleFavorite && onToggleFavorite(prod)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="heart" size={20} color="#EF4444" />
                  </TouchableOpacity>

                  {/* Product Image */}
                  <TouchableOpacity
                    style={styles.cardImageTouchable}
                    onPress={() => onProductClick && onProductClick(prod)}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: imgUri }} style={styles.cardImg} resizeMode="contain" />
                    {prod.badge && (
                      <View style={styles.cardBadgePill}>
                        <Text style={styles.cardBadgePillText}>{prod.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Card Details */}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardCategory}>
                      {(prod.category || 'ATOMY').toUpperCase()}
                    </Text>

                    <TouchableOpacity
                      onPress={() => onProductClick && onProductClick(prod)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {prod.name}
                      </Text>
                    </TouchableOpacity>

                    {/* Price Row */}
                    <View style={styles.priceRow}>
                      <Text style={styles.mrpText}>MRP ₹ {formatInr(mrp)}</Text>
                      {isMember ? (
                        <View style={styles.dpBadge}>
                          <Text style={styles.dpBadgeText}>DP Price</Text>
                        </View>
                      ) : (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>{discountPercent}% off</Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.mainPriceText, isMember && styles.mainPriceTextGreen]}>
                      ₹ {formatInr(activePrice)}
                    </Text>

                    <Text style={styles.pvText}>+{pv.toLocaleString('en-IN')} PV</Text>

                    {/* Action Buttons */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.cartBtn}
                        onPress={() => onAddToCart && onAddToCart(prod)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="cart-outline" size={16} color="#00A3E0" />
                        <Text style={styles.cartBtnText}>Add</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.buyBtn}
                        onPress={() => onBuyNow && onBuyNow(prod, 1)}
                        activeOpacity={0.88}
                      >
                        <Text style={styles.buyBtnText}>Buy Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: -0.3,
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCartBtn: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  subBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbLink: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  breadcrumbSep: {
    fontSize: 11,
    color: '#94A3B8',
  },
  breadcrumbCurrent: {
    fontSize: 11,
    color: '#00A3E0',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    color: '#00A3E0',
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  emptyStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00A3E0',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStartBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Favorites Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  removeFavBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  cardImageTouchable: {
    width: '100%',
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardImg: {
    width: '90%',
    height: '90%',
  },
  cardBadgePill: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#00A3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  cardBadgePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  cardBody: {
    marginTop: 8,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 17,
    minHeight: 34,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  mrpText: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  discountBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#DC2626',
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
  mainPriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  mainPriceTextGreen: {
    color: '#059669',
  },
  pvText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3E0',
    marginTop: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 7,
    borderRadius: 6,
  },
  cartBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#00A3E0',
  },
  buyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A3E0',
    paddingVertical: 7,
    borderRadius: 6,
  },
  buyBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
