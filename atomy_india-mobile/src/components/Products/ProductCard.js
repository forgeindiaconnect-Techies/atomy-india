import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../../data/officialDistributorPrices';
import { getHighResImageUrl } from '../../utils/imageUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2; // 2 products per row with 12px margin

function formatInr(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
  isFavorite = false,
  onToggleFavorite,
  isMember = false,
  onJoinMemberPress,
}) {
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const official = product?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[product.id] : null;
  const rawPrice = Number(product.price) || (official ? official.dpPrice : 1000);

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

  const imageSource = imgError || (!product.img && !product.image)
    ? { uri: 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg' }
    : { uri: getHighResImageUrl(product.image || product.img) };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress && onPress(product)}
    >
      {/* Product Image & Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.productImage}
          resizeMode="contain"
          onError={() => setImgError(true)}
        />

        {/* Promo / Category Badge */}
        {product.badge && (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        )}

        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={styles.favButton}
          activeOpacity={0.7}
          onPress={() => onToggleFavorite && onToggleFavorite(product)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? COLORS.danger : COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        {/* PV Badge */}
        <View style={styles.pvBadge}>
          <Text style={styles.pvText}>
            {pv.toLocaleString('en-IN')} PV
          </Text>
        </View>

        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price Row */}
        {hasOffer && (
          <View style={styles.strikeRow}>
            <Text style={styles.mrpLabel}>MRP</Text>
            <Text style={styles.mrpPrice}>₹{formatInr(mrp)}</Text>
            {isMember ? (
              <View style={styles.dpBadge}>
                <Text style={styles.dpBadgeText}>Distributor Price</Text>
              </View>
            ) : (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{discountPercent}% off</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={[styles.memberPrice, isMember && styles.memberPriceGreen]}>
            ₹{formatInr(activePrice)}
          </Text>
        </View>

        {/* Non-Member Unlock Hint */}
        {!isMember && (
          <TouchableOpacity
            style={styles.lockedDpBanner}
            activeOpacity={0.7}
            onPress={() => onJoinMemberPress && onJoinMemberPress(product)}
          >
            <Ionicons name="lock-closed" size={9} color="#92400E" />
            <Text style={styles.lockedDpText} numberOfLines={2}>
              Join for Distributor Price
            </Text>
          </TouchableOpacity>
        )}

        {/* Add to Cart Quick Button */}
        <TouchableOpacity
          style={styles.addToCartBtn}
          activeOpacity={0.8}
          onPress={() => onAddToCart && onAddToCart(product)}
        >
          <Ionicons name="cart-outline" size={15} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.95,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  detailsContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  pvBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  pvText: {
    color: COLORS.pvBlue,
    fontSize: 10,
    fontWeight: '800',
  },
  productName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: 16.5,
    minHeight: 33,
    marginBottom: 4,
  },
  strikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  mrpLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  mrpPrice: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  dpBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dpBadgeText: {
    fontSize: 9,
    color: '#059669',
    fontWeight: '800',
  },
  discountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  discountBadgeText: {
    fontSize: 9,
    color: '#0284C7',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  memberPrice: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  memberPriceGreen: {
    color: '#059669',
  },
  lockedDpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    marginBottom: 8,
  },
  lockedDpText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '700',
    flex: 1,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    borderRadius: 6,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
