import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { FOOD_ESSENTIAL_PRODUCTS } from '../../data/mockData';

function formatInr(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function FoodEssentialSection({
  onAddToCart,
  onProductClick,
  favorites = [],
  onToggleFavorite,
  isMember = false,
  onJoinMemberPress,
}) {
  return (
    <View style={styles.sectionContainer}>
      {/* Section Header matching Image 2 */}
      <View style={styles.headerBlock}>
        <Text style={styles.mainTitle}>{"Atomy Food\nEssential"}</Text>
        <Text style={styles.subTitle}>The Foundation of Your Daily Wellness</Text>
      </View>

      {/* Vertical Product List: 1 Row = 1 Product with Circular Image matching Image 2 */}
      <View style={styles.productsList}>
        {FOOD_ESSENTIAL_PRODUCTS.map((product, index) => {
          const isFav = favorites.includes(product.id);
          const isLast = index === FOOD_ESSENTIAL_PRODUCTS.length - 1;

          return (
            <View
              key={product.id}
              style={[styles.productRowCard, isLast && styles.productRowCardLast]}
            >
              {/* Product Card Click Area */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onProductClick && onProductClick(product)}
                style={styles.cardContent}
              >
                {/* 1. Large Circular Image matching Image 2 */}
                <View style={styles.circleImageWrapper}>
                  <View style={styles.circleImageContainer}>
                    <Image
                      source={{ uri: product.image }}
                      style={styles.circleImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Favorite Heart Button */}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    activeOpacity={0.7}
                    onPress={() => onToggleFavorite && onToggleFavorite(product)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Toggle Favorite"
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={19}
                      color={isFav ? '#EF4444' : '#64748B'}
                    />
                  </TouchableOpacity>

                  {/* 2. Colored Title Banner Pill Strip across bottom of circle matching Image 2 */}
                  <View
                    style={[
                      styles.tagStrip,
                      { backgroundColor: product.tagColor || '#C29B38' },
                    ]}
                  >
                    <Text style={styles.tagStripText} numberOfLines={1}>
                      {product.tag || product.name}
                    </Text>
                  </View>
                </View>

                {/* 3. Product Title below image */}
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>

                {/* 4. Product Price */}
                <Text style={styles.productPrice}>
                  ₹ {formatInr(product.originalPrice || product.price)}
                </Text>

                {/* 5. Member Notice / Distributor Price matching Image 2 */}
                {!isMember ? (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => onJoinMemberPress && onJoinMemberPress(product)}
                    style={styles.noticeWrap}
                  >
                    <Text style={styles.loginNoticeText}>
                      Distributor price and PV information will be shown after login
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.memberBenefitWrap}>
                    <Text style={styles.memberPriceText}>
                      Distributor Price: ₹ {formatInr(product.dpPrice || product.price)}
                    </Text>
                    <Text style={styles.memberPvText}>
                      • {Number(product.pv || 3000).toLocaleString('en-IN')} PV
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* 6. Quick Action: Add to Cart Button */}
              <TouchableOpacity
                style={styles.btnCart}
                activeOpacity={0.85}
                onPress={() => onAddToCart && onAddToCart(product)}
                accessibilityLabel={`Add ${product.name} to cart`}
              >
                <Ionicons name="cart-outline" size={17} color="#FFFFFF" />
                <Text style={styles.btnCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBlock: {
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 13.5,
    color: '#475569',
    marginTop: 4,
    textAlign: 'center',
  },
  productsList: {
    paddingHorizontal: 16,
  },
  productRowCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productRowCardLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  // Circular Image Presentation matching Image 2
  circleImageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  circleImageContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  circleImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  // Colored Title Banner Pill Strip across bottom of circle matching Image 2
  tagStrip: {
    position: 'absolute',
    bottom: -6,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 240,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 3,
  },
  tagStripText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  // Typography below circle
  productName: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 6,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  productPrice: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  noticeWrap: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  loginNoticeText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0284C7',
    textAlign: 'center',
    lineHeight: 18,
  },
  memberBenefitWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 4,
    flexWrap: 'wrap',
  },
  memberPriceText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#059669',
  },
  memberPvText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  // Add to cart action button
  btnCart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnCartText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
