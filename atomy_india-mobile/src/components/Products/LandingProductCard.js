import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { GST_BADGE_IMAGE } from '../../data/mockData';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../../data/officialDistributorPrices';
import { getHighResImageUrl } from '../../utils/imageUtils';

function formatInr(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function LandingProductCard({
  product,
  onPress,
  onAddToCart,
  isFavorite = false,
  onToggleFavorite,
  cardWidth = 176,
  isMember = false,
  onJoinMemberPress,
}) {
  const isPercentWidth = typeof cardWidth === 'string' && cardWidth.includes('%');
  const resolvedWidth = isPercentWidth ? cardWidth : Math.max(Number(cardWidth) || 176, 160);
  const official = product?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[product.id] : null;
  const rawPrice = Number(product.price) || (official ? official.dpPrice : 0);

  // Explicit database discount percent (0 means NO promotional retail discount)
  const dbDiscount = product.discountPercent !== undefined && product.discountPercent !== null && product.discountPercent !== ''
    ? Number(String(product.discountPercent).replace(/[^0-9]/g, ''))
    : 0;

  // Accurate MRP from database
  let mrp = Number(product.originalPrice || product.mrp);
  if (!mrp || mrp <= rawPrice) {
    if (official && official.mrp && official.mrp > rawPrice) {
      mrp = official.mrp;
    } else {
      mrp = rawPrice;
    }
  }

  // Official Member DP Wholesale Price
  let dpPrice = Number(product.dpPrice || (official ? official.dpPrice : 0));
  if (!dpPrice || dpPrice >= rawPrice) {
    dpPrice = official?.dpPrice || rawPrice;
  }

  // Point Value (PV)
  const pv = Number(product.pv !== undefined ? product.pv : (official?.pv || 0)) || Math.round(rawPrice * 4.5);

  // Active selling price: Member gets wholesale DP, guest gets retail price
  const activePrice = isMember ? dpPrice : rawPrice;

  // Real offer condition matching website: only if DB has explicit promotional discount or member getting DP discount
  const hasOffer = isMember
    ? (mrp > dpPrice)
    : (dbDiscount > 0 && mrp > activePrice);

  const discountPercent = dbDiscount > 0
    ? dbDiscount
    : (hasOffer ? Math.round(((mrp - activePrice) / mrp) * 100) : 0);

  const productTags = Array.isArray(product.tags)
    ? product.tags
    : typeof product.tags === 'string' && product.tags.trim()
    ? product.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  // Regional Hub Inventory Resolution
  const stockQty = product.stockQuantity !== undefined ? Number(product.stockQuantity) : 50;
  const isOutOfStock = product.inStock === false || stockQty < 2;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: resolvedWidth },
        isPercentWidth && { width: '100%', marginRight: 0 },
      ]}
      activeOpacity={0.88}
      onPress={() => onPress && onPress(product)}
    >
      {/* Product Image Area */}
      <View style={styles.imageWrapper}>
        {/* Rank Badge (#1, #2, etc.) matching authentic website style */}
        {product.rank ? (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{product.rank}</Text>
          </View>
        ) : null}

        {/* GST Reduced Flag */}
        {product.gstReduced && GST_BADGE_IMAGE ? (
          <Image
            source={{ uri: GST_BADGE_IMAGE }}
            style={styles.gstBadge}
            resizeMode="contain"
          />
        ) : null}

        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={styles.heartBtn}
          activeOpacity={0.7}
          onPress={() => onToggleFavorite && onToggleFavorite(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#EF4444' : '#94A3B8'}
          />
        </TouchableOpacity>

        {/* Product Photo */}
        <Image
          source={{
            uri: getHighResImageUrl(
              product.image ||
              product.img ||
              'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg'
            ),
          }}
          style={[styles.productImg, isOutOfStock && styles.productImgOutOfStock]}
          resizeMode="contain"
        />

        {/* Out of Stock Overlay matching authentic website */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeText}>OUT OF STOCK</Text>
            </View>
          </View>
        )}

        {/* Floating Cart Button on Product Image (disabled when out of stock) */}
        <TouchableOpacity
          style={[styles.imageCartBtn, isOutOfStock && styles.imageCartBtnDisabled]}
          activeOpacity={isOutOfStock ? 1 : 0.8}
          onPress={() => {
            if (isOutOfStock) return;
            onAddToCart && onAddToCart(product);
          }}
          disabled={isOutOfStock}
          accessibilityLabel={isOutOfStock ? "Out of stock" : "Add to cart"}
        >
          <Ionicons
            name={isOutOfStock ? "ban-outline" : "cart-outline"}
            size={18}
            color={isOutOfStock ? "#64748B" : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Product Information - Authentically matching website */}
      <View style={styles.infoWrapper}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price Strike Row (like website) */}
        {hasOffer ? (
          <View style={styles.priceRow}>
            <Text style={styles.mrpLabel}>MRP</Text>
            <Text style={styles.originalPrice}>₹ {formatInr(mrp)}</Text>
            {isMember ? (
              <View style={styles.dpBadge}>
                <Text style={styles.dpBadgeText}>Distributor Price</Text>
              </View>
            ) : (
              <View style={styles.discountBadgeWrap}>
                <Text style={styles.discountBadge}>{discountPercent}% off</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Main Selling Price (with .00 like website) */}
        <View style={styles.mainPriceRow}>
          {!hasOffer && <Text style={styles.mrpLabelStandalone}>MRP </Text>}
          <Text style={[styles.mainPrice, isMember && styles.mainPriceMember]}>
            ₹ {formatInr(activePrice)}
          </Text>
        </View>

        {/* PV Note (visible directly below price like in website) */}
        <Text style={styles.pvNote}>
          {pv.toLocaleString('en-IN')} PV
        </Text>

        {/* Regional Hub Inventory Status */}
        {isOutOfStock ? (
          <View style={styles.oosNoticeRow}>
            <Ionicons name="alert-circle" size={11} color="#DC2626" />
            <Text style={styles.oosNoticeText}>
              Out of stock at {product.regionalHubName || 'this hub'}
            </Text>
          </View>
        ) : product.regionalHubName ? (
          <View style={styles.inStockNoticeRow}>
            <View style={styles.inStockDot} />
            <Text style={styles.inStockNoticeText} numberOfLines={1}>
              In stock at {product.regionalHubName}
            </Text>
          </View>
        ) : null}

        {/* Non-Member Unlock Hint Banner matching authentic website */}
        {!isMember ? (
          <TouchableOpacity
            style={styles.lockedDpBanner}
            activeOpacity={0.7}
            onPress={() => onJoinMemberPress && onJoinMemberPress(product)}
          >
            <Ionicons name="lock-closed" size={10} color="#92400E" />
            <Text style={styles.lockedDpText} numberOfLines={2}>
              Join Membership for Distributor Price
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Dynamic Badges & Hashtags (Configured by Admin) */}
        {(() => {
          const isFreeDeliv = Boolean(product.freeDelivery || product.isFreeDelivery);
          const cleanTags = productTags
            .map((t) => (t.startsWith('#') ? t : `#${t}`))
            .filter((t) => {

              const upper = String(t).toUpperCase().replace(/^#/, '').trim();

              if (upper.includes('FREE DELIVERY') || upper.includes('FREE_DELIVERY')) return false;

              const blacklist = [

                'HOME', 'ORALCARE', 'HAIRCARE', 'NEWARRIVAL', 'MAKEUPESSENTIAL', 'BRIGHTENING',

                'SUNPROTECTION', 'DAILYCARE', 'POPULAR', 'NEW LAUNCH', 'BEST SELLER', 'BEAUTY',

                'HEALTH', 'PERSONAL CARE', 'OTHERS'

              ];

              return !blacklist.includes(upper);

            });

          if (!isFreeDeliv && cleanTags.length === 0) return null;

          return (
            <View style={styles.tagsRow}>
              {isFreeDeliv ? (
                <View style={styles.freeDeliveryBadge}>
                  <Text style={styles.freeDeliveryText}>Free Delivery</Text>
                </View>
              ) : null}
              {cleanTags.map((tag, idx) => {
                const isGst = tag.toUpperCase().includes('GST');
                return (
                  <Text key={idx} style={[styles.tagText, isGst && styles.tagGstText]}>
                    {tag}
                  </Text>
                );
              })}
            </View>
          );
        })()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    marginRight: 16,
  },
  imageWrapper: {
    width: '100%',
    height: 165,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 6,
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.primary, // Official Atomy Cyan Blue from website
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderBottomRightRadius: 8,
    zIndex: 2,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  imageCartBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 3,
  },
  gstBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 44,
    height: 44,
    zIndex: 2,
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoWrapper: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 17.5,
    marginBottom: 3, // No artificial gap between product name and content
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    marginBottom: 8, // Line spacing to selling price
    flexWrap: 'wrap',
  },
  mrpLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  originalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountBadgeWrap: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3.5,
  },
  discountBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  dpBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  dpBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  mainPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8, // Line spacing to PV note
  },
  mrpLabelStandalone: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 4,
  },
  mainPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mainPriceMember: {
    color: '#059669',
  },
  pvNote: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10, // Line spacing to membership unlock banner
  },
  lockedDpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 9, // Line spacing to tags / delivery
    borderWidth: 0.8,
    borderColor: '#FDE68A',
  },
  lockedDpText: {
    fontSize: 9.2,
    fontWeight: '700',
    color: '#92400E',
    lineHeight: 12.5,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pvPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#BFDBFE',
  },
  pvText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 7,
  },
  tagText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  tagGstText: {
    color: '#64748B',
    fontWeight: '700',
  },
  freeDeliveryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    marginBottom: 5,
  },
  freeDeliveryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  productImgOutOfStock: {
    opacity: 0.45,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  imageCartBtnDisabled: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
    opacity: 0.65,
  },
  oosNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  oosNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  inStockNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 4,
  },
  inStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  inStockNoticeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
    flex: 1,
  },
});

export default React.memo(LandingProductCard);
