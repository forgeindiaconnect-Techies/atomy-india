import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../../data/officialDistributorPrices';

function formatInr(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RecentlyViewedModal({
  visible = false,
  onClose,
  items = [],
  onProductClick,
  onAddToCart,
  onRemoveItem,
  onClearAll,
  isMember = false,
}) {
  const { width: screenWidth } = useWindowDimensions();
  // Take more width of parent page (88% on mobile, max 480px on larger screens)
  const drawerWidth = screenWidth < 520
    ? Math.round(screenWidth * 0.88)
    : Math.min(Math.round(screenWidth * 0.82), 480);

  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500, // 0.5 sec time lap
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500, // 0.5 sec time lap
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      slideAnim.setValue(-drawerWidth);
      fadeAnim.setValue(0);
    }
  }, [visible, drawerWidth]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 500, // 0.5 sec time lap
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500, // 0.5 sec time lap
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        {/* Left-Side Top-to-Bottom Drawer (Takes 3/4 of the page on left) */}
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              width: drawerWidth,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView edges={['top']} style={styles.drawerSafeArea}>
            {/* Drawer Top Header Row */}
            <View style={styles.headerRow}>
              <View style={styles.titleGroup}>
                <View style={styles.clockIconCircle}>
                  <Ionicons name="time" size={18} color="#00A3E0" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>
                    Recently Viewed
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {items.length} {items.length === 1 ? 'item' : 'items'} browsed
                  </Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                {items.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearAllBtn}
                    onPress={onClearAll}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={13} color="#EF4444" />
                    <Text style={styles.clearAllText}>Clear</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={24} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Member Wholesale Pricing Banner */}
            {items.length > 0 && (
              <View style={styles.memberPillStrip}>
                <Ionicons name="pricetag" size={12} color="#0284C7" />
                <Text style={styles.memberPillText}>
                  {isMember ? 'Wholesale Distributor Prices active ★' : 'Member wholesale savings available'}
                </Text>
              </View>
            )}

            {/* Body Content */}
            {items.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="time-outline" size={44} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>No recent products</Text>
                <Text style={styles.emptySubtitle}>
                  Products you browse will appear here for easy quick access.
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={handleClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.exploreBtnText}>Explore Shopping Mall</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                style={styles.itemsScroll}
                contentContainerStyle={styles.itemsContent}
                showsVerticalScrollIndicator={false}
              >
                {items.map((prod) => {
                  const official = prod?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[prod.id] : null;
                  const rawPrice = Number(prod.price) || (official ? official.dpPrice : 1000);
                  let mrp = Number(prod.originalPrice) || Number(prod.mrp);
                  if (!mrp || mrp <= rawPrice) {
                    mrp = official?.mrp || Math.round(rawPrice * 1.18);
                  }
                  let dpPrice = Number(prod.dpPrice || (official ? official.dpPrice : 0));
                  if (!dpPrice || dpPrice >= rawPrice) {
                    dpPrice = Math.round(rawPrice * 0.85);
                  }
                  const activePrice = isMember ? dpPrice : rawPrice;
                  const pv = Number(prod.pv || (official ? official.pv : 0)) || Math.round(rawPrice * 4.5);
                  const imgUri = prod.image || prod.img || 'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg';

                  return (
                    <View key={`recent-${prod.id}`} style={styles.itemCard}>
                      {/* Main Product Row */}
                      <View style={styles.cardMainRow}>
                        {/* Thumbnail */}
                        <TouchableOpacity
                          style={styles.itemImageWrap}
                          activeOpacity={0.8}
                          onPress={() => {
                            handleClose();
                            if (onProductClick) onProductClick(prod);
                          }}
                        >
                          <Image source={{ uri: imgUri }} style={styles.itemImage} resizeMode="contain" />
                        </TouchableOpacity>

                        {/* Info Column with generous spacing */}
                        <View style={styles.itemInfoCol}>
                          <View style={styles.itemNameRow}>
                            <TouchableOpacity
                              style={{ flex: 1 }}
                              activeOpacity={0.8}
                              onPress={() => {
                                handleClose();
                                if (onProductClick) onProductClick(prod);
                              }}
                            >
                              <Text style={styles.itemName} numberOfLines={2}>
                                {prod.name}
                              </Text>
                            </TouchableOpacity>

                            {/* Remove item button */}
                            <TouchableOpacity
                              style={styles.removeItemBtn}
                              onPress={() => onRemoveItem && onRemoveItem(prod.id)}
                              activeOpacity={0.6}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons name="close-circle" size={19} color="#CBD5E1" />
                            </TouchableOpacity>
                          </View>

                          {/* Price & DP */}
                          <View style={styles.priceRow}>
                            <Text style={[styles.mainPrice, isMember && styles.mainPriceGreen]}>
                              ₹ {formatInr(activePrice)}
                            </Text>
                            {mrp > activePrice && (
                              <Text style={styles.mrpStrikethrough}>
                                ₹ {formatInr(mrp)}
                              </Text>
                            )}
                          </View>

                          {/* Full Distributor Price label when active */}
                          {isMember && (
                            <View style={styles.dpBadge}>
                              <Text style={styles.dpBadgeText}>Distributor Price</Text>
                            </View>
                          )}

                          {/* PV Points */}
                          <View style={styles.pvPill}>
                            <Ionicons name="sparkles" size={10} color="#00A3E0" />
                            <Text style={styles.pvText}>{Number(pv).toLocaleString('en-IN')} PV</Text>
                          </View>
                        </View>
                      </View>

                      {/* Bottom Action: Quick Add To Cart */}
                      <TouchableOpacity
                        style={styles.quickAddBtn}
                        activeOpacity={0.85}
                        onPress={() => onAddToCart && onAddToCart(prod)}
                      >
                        <Ionicons name="cart-outline" size={15} color="#00A3E0" />
                        <Text style={styles.quickAddBtnText}>Add to Cart</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <View style={{ height: 32 }} />
              </ScrollView>
            )}
          </SafeAreaView>
        </Animated.View>

        {/* Right Side Remaining 1/4 (25%) Backdrop - Tap to Dismiss */}
        <Animated.View style={[styles.backdropRight, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  drawerContainer: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 5, height: 0 },
    shadowRadius: 12,
    elevation: 20,
    zIndex: 10,
  },
  drawerSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backdropRight: {
    flex: 1, // Takes exactly the remaining 1/4 (25%) of the screen
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clockIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  closeBtn: {
    padding: 3,
  },
  memberPillStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2FE',
  },
  memberPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  itemsScroll: {
    flex: 1,
  },
  itemsContent: {
    padding: 14,
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemImageWrap: {
    width: 74,
    height: 74,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '92%',
    height: '92%',
  },
  itemInfoCol: {
    flex: 1,
    paddingLeft: 12,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5,
    lineHeight: 18,
  },
  removeItemBtn: {
    paddingTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  mainPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  mainPriceGreen: {
    color: '#16A34A',
  },
  mrpStrikethrough: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  dpBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  dpBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  pvPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pvText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#00A3E0',
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A3E0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#00A3E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#00A3E0',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  exploreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

