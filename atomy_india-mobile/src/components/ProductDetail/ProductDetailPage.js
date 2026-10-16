import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { ALL_PRODUCTS } from '../../data/mockData';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../../data/officialDistributorPrices';
import LandingProductCard from '../Products/LandingProductCard';
import {
  getProductDetailConfig,
  getGenericName,
  getOfficialProductDetails,
} from '../../data/productDetailsData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatInr(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInrWhole(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
}

const LOCAL_BROCHURES = {
  'detail_d00101_clean.jpg': require('../../../assets/brochures/detail_d00101_clean.jpg'),
  'detail_d00101_0001.jpg': require('../../../assets/brochures/detail_d00101_clean.jpg'),
  'detail_d00102_0001.jpg': require('../../../assets/brochures/detail_d00101_clean.jpg'),
  'detail_d00104_0001.jpg': require('../../../assets/brochures/detail_d00101_clean.jpg'),
};

function resolveBrochureSource(uri) {
  if (!uri) return null;
  if (typeof uri !== 'string') return uri;
  const fileName = uri.split('/').pop().split('?')[0];
  if (LOCAL_BROCHURES[fileName]) {
    return LOCAL_BROCHURES[fileName];
  }
  return { uri };
}

const AutoHeightBrochureImage = React.memo(({ uri, onPressZoom }) => {
  const [aspectRatio, setAspectRatio] = useState(null);
  const imageSource = useMemo(() => resolveBrochureSource(uri), [uri]);

  useEffect(() => {
    let isMounted = true;
    if (imageSource) {
      if (typeof imageSource === 'number') {
        const resolved = Image.resolveAssetSource(imageSource);
        if (resolved && resolved.width && resolved.height) {
          if (isMounted) setAspectRatio(resolved.width / resolved.height);
          return;
        }
      }
      if (imageSource.uri) {
        Image.getSize(
          imageSource.uri,
          (width, height) => {
            if (isMounted && width > 0 && height > 0) {
              setAspectRatio(width / height);
            }
          },
          () => {
            if (isMounted) setAspectRatio(750 / 3730);
          }
        );
      }
    }
    return () => {
      isMounted = false;
    };
  }, [imageSource]);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPressZoom && onPressZoom(imageSource)}
      style={styles.brochureImageWrapper}
    >
      <Image
        source={imageSource}
        style={[
          styles.brochureImage,
          aspectRatio ? { aspectRatio } : { minHeight: 320 },
        ]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
});

export default function ProductDetailPage({
  product,
  isMember = false,
  isFavorite = false,
  favorites = [],
  cartCount = 0,
  onNavigateBack,
  onNavigateCart,
  onAddToCart,
  onBuyNow,
  onToggleFavorite,
  onJoinMemberPress,
  onSelectRelatedProduct,
}) {
  if (!product) return null;

  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'review' | 'payment' | 'return'
  const [isProductInfoOpen, setIsProductInfoOpen] = useState(true);
  const [isExpandedBrochure, setIsExpandedBrochure] = useState(false);
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const [zoomBrochureSource, setZoomBrochureSource] = useState(null);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isEducationCentreOpen, setIsEducationCentreOpen] = useState(false);
  const [isSelfPickUpOpen, setIsSelfPickUpOpen] = useState(false);

  const scrollRef = useRef(null);

  // Official product details data
  const config = useMemo(() => getProductDetailConfig(product), [product]);
  const officialData = config?.officialData || getOfficialProductDetails(product.id, product.name);
  const genericName = useMemo(() => getGenericName(product), [product]);
  const priceData = OFFICIAL_DISTRIBUTOR_PRICES[product.id] || null;

  // Prices and PV
  const rawPrice = Number(product.price) || (priceData ? priceData.dpPrice : 1000);
  let mrp = Number(product.originalPrice) || Number(product.mrp);
  if (!mrp || mrp <= rawPrice) {
    if (priceData && priceData.mrp && priceData.mrp > rawPrice) {
      mrp = priceData.mrp;
    } else {
      mrp = Math.round(rawPrice * 1.18);
    }
  }

  let dpPrice = Number(product.dpPrice || (priceData ? priceData.dpPrice : 0));
  if (!dpPrice || dpPrice >= rawPrice) {
    dpPrice = Math.round(rawPrice * 0.85);
  }

  const pv = Number(product.pv || (priceData ? priceData.pv : 0)) || Math.round(rawPrice * 4.5);
  const activePrice = isMember ? dpPrice : rawPrice;
  const hasOffer = mrp > activePrice;
  const savingsAmount = hasOffer ? mrp - activePrice : 0;
  const discountPercent = hasOffer ? Math.round(((mrp - activePrice) / mrp) * 100) : 0;

  // Tax calculations matching website
  const isReducedGst =
    product.gstReduced ||
    (Array.isArray(product.tags) &&
      product.tags.some((t) => String(t).toUpperCase().includes('GST REDUCED')));
  const gstRate = isReducedGst ? 5 : 18;
  const unitGstBase = activePrice / (1 + gstRate / 100);
  const unitGst = activePrice - unitGstBase;

  // Total calculations for selected quantity
  const totalPrice = activePrice * qty;
  const totalPv = pv * qty;

  // Real dynamic reviews
  const productReviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const reviewsCount = productReviews.length || (Number(product?.reviewsCount) > 0 ? Number(product.reviewsCount) : 0);
  const ratingValue = reviewsCount > 0 ? (product?.rating || '5.0') : '0.0';

  // Multi-angle gallery images
  const galleryImages = useMemo(() => {
    const list = [];
    if (officialData?.galleryImages && officialData.galleryImages.length > 0) {
      officialData.galleryImages.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    if (product.image && !list.includes(product.image)) list.unshift(product.image);
    else if (product.img && !list.includes(product.img)) list.unshift(product.img);

    if (list.length === 0) {
      list.push('https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg');
    }
    return list;
  }, [product, officialData]);

  const activeMainImg = galleryImages[currentImgIdx] || galleryImages[0];

  // Related products list
  const relatedProducts = useMemo(() => {
    const currentCat = (product.category || '').toLowerCase();
    const currentId = String(product.id || '');
    let matches = ALL_PRODUCTS.filter(
      (p) => String(p.id) !== currentId && p.category && p.category.toLowerCase() === currentCat
    );
    if (matches.length < 5) {
      const others = ALL_PRODUCTS.filter(
        (p) => String(p.id) !== currentId && !matches.some((m) => m.id === p.id)
      );
      matches = [...matches, ...others];
    }
    return matches.slice(0, 6);
  }, [product]);

  const handlePrevImage = () => {
    setCurrentImgIdx((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextImage = () => {
    setCurrentImgIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : prev));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.name} on Atomy India: ₹ ${formatInr(activePrice)} (+${pv.toLocaleString()} PV)`,
      });
    } catch (e) {}
  };

  return (
    <View style={styles.root}>
      {/* 1. Official Cyan Top Navbar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={onNavigateBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Product Details
        </Text>

        <View style={styles.headerActionsRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => onToggleFavorite && onToggleFavorite(product)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>

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

      <ScrollView
        ref={scrollRef}
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Seamless Hero Image Area (Direct on White Page) */}
        <View style={styles.heroImageSection}>
          {/* GST Reduced Badge */}
          {product.gstReduced && (
            <View style={styles.gstBadgePill}>
              <Text style={styles.gstBadgePillText}>GST REDUCED (5%)</Text>
            </View>
          )}

          {/* Prev Arrow Overlay */}
          {currentImgIdx > 0 && (
            <TouchableOpacity style={styles.imgNavBtnPrev} onPress={handlePrevImage} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={22} color="#334155" />
            </TouchableOpacity>
          )}

          {/* Hero Image */}
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => setIsImgModalOpen(true)}
            style={styles.heroImageTouchable}
          >
            <Image source={{ uri: activeMainImg }} style={styles.heroImage} resizeMode="contain" />
          </TouchableOpacity>

          {/* Next Arrow Overlay */}
          {currentImgIdx < galleryImages.length - 1 && (
            <TouchableOpacity style={styles.imgNavBtnNext} onPress={handleNextImage} activeOpacity={0.8}>
              <Ionicons name="chevron-forward" size={22} color="#334155" />
            </TouchableOpacity>
          )}

          {/* Pagination Pill (e.g. 1/6) */}
          <View style={styles.imgCounterPill}>
            <Text style={styles.imgCounterPillText}>
              {currentImgIdx + 1}/{galleryImages.length}
            </Text>
          </View>

          {/* Fullscreen Expand Button */}
          <TouchableOpacity
            style={styles.imgExpandBtn}
            onPress={() => setIsImgModalOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="expand-outline" size={17} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Thumbnail Strip */}
        {galleryImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbStrip}
          >
            {galleryImages.map((uri, idx) => {
              const isSelected = idx === currentImgIdx;
              return (
                <TouchableOpacity
                  key={`thumb-${idx}`}
                  style={[styles.thumbItem, isSelected && styles.thumbItemActive]}
                  onPress={() => setCurrentImgIdx(idx)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri }} style={styles.thumbImg} resizeMode="contain" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* 3. Product Details Area */}
        <View style={styles.pageBodyContent}>
          {/* Top Review Rating & Tools Row */}
          <View style={styles.topMetaRow}>
            <TouchableOpacity
              style={styles.reviewSummaryLeft}
              onPress={() => setActiveTab('review')}
              activeOpacity={0.8}
            >
              <Ionicons name="star" size={15} color={reviewsCount > 0 ? '#0F172A' : '#94A3B8'} />
              <Text style={styles.ratingNum}>{ratingValue}</Text>
              <Text style={styles.reviewsCountText}>
                {reviewsCount} no(s) <Text style={styles.reviewUnderline}>Review</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.actionIconsRight}>
              <TouchableOpacity
                style={styles.iconToolBtn}
                onPress={() => onToggleFavorite && onToggleFavorite(product)}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? '#EF4444' : '#1E293B'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconToolBtn} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Free Delivery Bordered Pill */}
          <View style={styles.badgeLine}>
            <Text style={styles.freeDelivPill}>Free Delivery</Text>
          </View>

          {/* Official Product Title */}
          <Text style={styles.officialTitle}>{product.name}</Text>

          {/* 4. EXACT PRICE ROW MATCHING USER SCREENSHOT: ₹2,701 3884 ⓘ [ ₹1183 off ] */}
          <View style={styles.customPriceHeroRow}>
            <Text style={styles.heroCurrentPrice}>₹{formatInrWhole(activePrice)}</Text>

            {hasOffer && (
              <View style={styles.mrpAndInfoWrap}>
                <Text style={styles.heroMrpStrikethrough}>{formatInrWhole(mrp)}</Text>

                {/* Touch info icon to trigger the Price & Tax Breakdown Modal */}
                <TouchableOpacity
                  style={styles.infoIconCircleBtn}
                  onPress={() => setIsTaxModalOpen(true)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                >
                  <Text style={styles.infoIconChar}>ⓘ</Text>
                </TouchableOpacity>
              </View>
            )}

            {hasOffer && (
              <View style={styles.slantedDiscountTag}>
                <Text style={styles.slantedDiscountTagText}>
                  ₹{formatInrWhole(savingsAmount)} off
                </Text>
              </View>
            )}

            {isMember && (
              <View style={styles.dpPricePill}>
                <Ionicons name="pricetag" size={13} color="#059669" />
                <Text style={styles.dpPricePillText}>Distributor Price</Text>
              </View>
            )}
          </View>

          {/* 5. PV Value & Membership DP Hint right below the price row */}
          <View style={styles.pvAndMemberSection}>
            <View style={styles.pvBadgePill}>
              <Ionicons name="sparkles" size={13} color="#00A3E0" />
              <Text style={styles.pvBadgePillText}>{pv.toLocaleString('en-IN')} PV</Text>
            </View>

            {!isMember ? (
              <TouchableOpacity
                onPress={onJoinMemberPress}
                activeOpacity={0.8}
                style={styles.joinMemberHintWrap}
              >
                <Text style={styles.joinMemberHintText}>
                  Join Membership to get the Distributor Price
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#00A3E0" />
              </TouchableOpacity>
            ) : (
              <View style={styles.activeMemberAppliedWrap}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.activeMemberAppliedText}>
                  Distributor Price Applied (Member Benefit)
                </Text>
              </View>
            )}
          </View>

          {/* Product Number Line */}
          <Text style={styles.productNumberLine}>Product number {product.id || 'D00101'}</Text>

          {/* 6. SOCIAL PROOF STATS: SET ONE BY ONE VERTICALLY AS REQUESTED */}
          <View style={styles.verticalStatsList}>
            <View style={styles.verticalStatRow}>
              <View style={styles.statIconWrap}>
                <Ionicons name="heart" size={17} color="#EF4444" />
              </View>
              <Text style={styles.verticalStatLabel}>
                <Text style={styles.verticalStatBold}>{product.likes || 224}</Text> Likes
              </Text>
            </View>

            <View style={styles.verticalStatRow}>
              <View style={styles.statIconWrap}>
                <Ionicons name="document-text" size={17} color="#00A3E0" />
              </View>
              <Text style={styles.verticalStatLabel}>
                <Text style={styles.verticalStatBold}>250</Text> Purchased
              </Text>
            </View>

            <View style={styles.verticalStatRow}>
              <View style={styles.statIconWrap}>
                <Ionicons name="bag" size={17} color="#00A3E0" />
              </View>
              <Text style={styles.verticalStatLabel}>
                <Text style={styles.verticalStatBold}>273</Text> Added to cart
              </Text>
            </View>
          </View>

          {/* Shipping Details Row */}
          <View style={styles.shippingDetailsRow}>
            <Text style={styles.shipLabel}>Shipping details:</Text>
            <Text style={styles.shipVal}>Free delivery for orders above ₹ 4,500.00</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.qtySectionWrapper}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.officialStepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQty((prev) => Math.max(1, prev - 1))}
                disabled={qty <= 1}
              >
                <Ionicons
                  name="remove"
                  size={16}
                  color={qty <= 1 ? '#CBD5E1' : '#334155'}
                />
              </TouchableOpacity>

              <Text style={styles.stepperValBox}>{qty}</Text>

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQty((prev) => prev + 1)}
              >
                <Ionicons name="add" size={16} color="#334155" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 7. 4-Tab Navigation Bar */}
        <View style={styles.tabsBar}>
          {[
            { id: 'details', label: 'Details' },
            { id: 'review', label: `Review(${reviewsCount})` },
            { id: 'payment', label: 'Payment/Delivery' },
            { id: 'return', label: 'Return/Exchange' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabNavBtn, active && styles.tabNavBtnActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabNavBtnText, active && styles.tabNavBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 8. Tab Content Body */}
        <View style={styles.tabContentPanel}>
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <View style={styles.tabPane}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIsProductInfoOpen(!isProductInfoOpen)}
                activeOpacity={0.8}
              >
                <Text style={styles.accordionTitle}>Product information</Text>
                <Ionicons
                  name={isProductInfoOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>

              {isProductInfoOpen && (
                <View style={styles.specsTableContainer}>
                  <View style={styles.specsTable}>
                    {/* Generic Name */}
                    <View style={styles.specTableRow}>
                      <View style={styles.specTableTh}>
                        <Text style={styles.specThText}>Generic Name</Text>
                      </View>
                      <View style={styles.specTableTd}>
                        <Text style={styles.specTdText}>
                          {config.specs?.genericName || genericName}
                        </Text>
                      </View>
                    </View>

                    {/* Brand Exported By */}
                    <View style={styles.specTableRow}>
                      <View style={styles.specTableTh}>
                        <Text style={styles.specThText}>Brand Exported By</Text>
                      </View>
                      <View style={styles.specTableTd}>
                        <Text style={styles.specTdText}>
                          {config.specs?.brandExportedBy ||
                            'Atomy Co., Ltd., 2148-21, Baekjemunhwa-ro, Gongju-si, Chungcheongnam-do (South Korea)'}
                        </Text>
                      </View>
                    </View>

                    {/* Manufacturer Name & Address */}
                    <View style={styles.specTableRow}>
                      <View style={styles.specTableTh}>
                        <Text style={styles.specThText}>Manufacturer Name and address</Text>
                      </View>
                      <View style={styles.specTableTd}>
                        <Text style={styles.specTdText}>
                          {config.specs?.manufacturer ||
                            'Kolmar Korea Co., Ltd., 12-11, Deokgogae-gil, Jeonui-myeon, Sejong-si, Republic of Korea'}
                        </Text>
                      </View>
                    </View>

                    {/* Imported & Marketed by */}
                    <View style={styles.specTableRow}>
                      <View style={styles.specTableTh}>
                        <Text style={styles.specThText}>Imported and Marketed by</Text>
                      </View>
                      <View style={styles.specTableTd}>
                        <Text style={styles.specTdText}>
                          {config.specs?.importedMarketedBy ||
                            'Atomy Enterprise India Pvt. Ltd.\nL-19, LGF, Kalkaji, New Delhi-110 019, India'}
                        </Text>
                      </View>
                    </View>

                    {/* Country of origin */}
                    <View style={styles.specTableRow}>
                      <View style={styles.specTableTh}>
                        <Text style={styles.specThText}>Country of origin</Text>
                      </View>
                      <View style={styles.specTableTd}>
                        <Text style={styles.specTdText}>
                          {config.specs?.countryOfOrigin || 'Republic of Korea'}
                        </Text>
                      </View>
                    </View>

                    {/* Net Volume / Quantity */}
                    <View style={styles.specTableRow}>
                      <View style={styles.specTableTh}>
                        <Text style={styles.specThText}>Net Volume / Quantity</Text>
                      </View>
                      <View style={styles.specTableTd}>
                        <Text style={styles.specTdText}>
                          {config.specs?.netVolume ||
                            officialData?.volumeDesc ||
                            'Standard Factory Sealed Retail Pack'}
                        </Text>
                      </View>
                    </View>

                    {/* Product Type */}
                    <View style={styles.specTableRow}>
                      <View style={styles.specTableTh}>
                        <Text style={styles.specThText}>Product Type</Text>
                      </View>
                      <View style={styles.specTableTd}>
                        <Text style={styles.specTdText}>
                          {config.specs?.productType || 'Consumer Daily Essential'}
                        </Text>
                      </View>
                    </View>

                    {/* Storage Advice */}
                    <View style={styles.specTableRow}>
                      <View style={styles.specTableTh}>
                        <Text style={styles.specThText}>Storage Advice</Text>
                      </View>
                      <View style={styles.specTableTd}>
                        <Text style={styles.specTdText}>
                          {config.specs?.storage ||
                            'Store in a cool, dry place away from direct sunlight.'}
                        </Text>
                      </View>
                    </View>

                    {/* Caution */}
                    {config.specs?.cautions && (
                      <View style={styles.specTableRow}>
                        <View style={styles.specTableTh}>
                          <Text style={styles.specThText}>Caution</Text>
                        </View>
                        <View style={styles.specTableTd}>
                          {Array.isArray(config.specs.cautions) ? (
                            config.specs.cautions.map((c, i) => (
                              <Text key={`c-${i}`} style={styles.specCautionItem}>
                                • {c.replace(/^-\s*/, '')}
                              </Text>
                            ))
                          ) : (
                            <Text style={styles.specTdText}>{config.specs.cautions}</Text>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Expiration */}
                    {config.specs?.expiration && (
                      <View style={styles.specTableRow}>
                        <View style={styles.specTableTh}>
                          <Text style={styles.specThText}>Expiration</Text>
                        </View>
                        <View style={styles.specTableTd}>
                          <Text style={styles.specTdText}>{config.specs.expiration}</Text>
                        </View>
                      </View>
                    )}

                    {/* License Number / FSSAI */}
                    {config.specs?.licenseNumber && (
                      <View style={styles.specTableRow}>
                        <View style={styles.specTableTh}>
                          <Text style={styles.specThText}>
                            {config.specs?.licenseLabel ||
                              (config.specs?.licenseNumber?.startsWith('FSSAI')
                                ? 'FSSAI Lic. No.'
                                : 'License / Reg. No.')}
                          </Text>
                        </View>
                        <View style={styles.specTableTd}>
                          <Text style={styles.specTdText}>{config.specs.licenseNumber}</Text>
                        </View>
                      </View>
                    )}

                    {/* Contact Us */}
                    <View style={[styles.specTableRow, { borderBottomWidth: 0 }]}>
                      <View style={styles.specTableTh}>
                        <Text style={styles.specThText}>
                          For feedback or complaints, Contact us at
                        </Text>
                      </View>
                      <View style={styles.specTableTd}>
                        <Text style={styles.specTdText}>
                          {config.specs?.contact ||
                            'Atomy Enterprise India Pvt. Ltd.\nAddress: 801-802, 8th floor, Magnum Tower – 2, Sector – 58, Golf Course Ext. Road, Gurgaon 122 011, Haryana, India\nEmail us at: atomy_in@atomypark.com\nTel.No.: +91-124- 695-9000'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Expanded Brochure Images */}
                  {isExpandedBrochure &&
                    officialData?.brochureImages &&
                    officialData.brochureImages.length > 0 && (
                      <View style={styles.brochureImagesContainer}>
                        <View style={styles.brochureZoomHint}>
                          <Ionicons name="search-outline" size={14} color="#0284C7" />
                          <Text style={styles.brochureZoomHintText}>
                            Tap any brochure section to view in High-Definition Zoom
                          </Text>
                        </View>
                        {officialData.brochureImages
                          .filter((bUri) => {
                            const lower = (bUri || '').toLowerCase();
                            return !lower.endsWith('.mp4') && !lower.endsWith('.webm');
                          })
                          .map((bUri, bIdx) => (
                            <AutoHeightBrochureImage
                              key={`brochure-${bIdx}`}
                              uri={bUri}
                              onPressZoom={(src) => setZoomBrochureSource(src)}
                            />
                          ))}
                      </View>
                    )}

                  <TouchableOpacity
                    style={styles.expandDetailsBtn}
                    onPress={() => setIsExpandedBrochure(!isExpandedBrochure)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.expandDetailsBtnText}>
                      {isExpandedBrochure ? 'Fold product details ∧' : 'Expand product details ∨'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* TAB 2: REVIEW */}
          {activeTab === 'review' && (
            <View style={styles.tabPane}>
              {reviewsCount > 0 ? (
                <>
                  <View style={styles.reviewsSummaryHeader}>
                    <Text style={styles.overallScore}>{ratingValue}</Text>
                    <View style={styles.starsRow}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons key={i} name="star" size={17} color="#F59E0B" />
                      ))}
                    </View>
                    <Text style={styles.totalRatingsText}>
                      Based on {reviewsCount} Verified Customer Review{reviewsCount > 1 ? 's' : ''}
                    </Text>

                    <View style={styles.ratingsBarsList}>
                      <View style={styles.barRow}>
                        <Text style={styles.barRowLabel}>5 Star</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: '100%' }]} />
                        </View>
                        <Text style={styles.barRowPercent}>100%</Text>
                      </View>
                      <View style={styles.barRow}>
                        <Text style={styles.barRowLabel}>4 Star</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: '0%' }]} />
                        </View>
                        <Text style={styles.barRowPercent}>0%</Text>
                      </View>
                      <View style={styles.barRow}>
                        <Text style={styles.barRowLabel}>3 Star</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: '0%' }]} />
                        </View>
                        <Text style={styles.barRowPercent}>0%</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.reviewsStream}>
                    {productReviews.map((r, idx) => (
                      <View key={idx} style={styles.singleReviewCard}>
                        <View style={styles.reviewTopRow}>
                          <Text style={styles.reviewerName}>
                            {r.author || r.reviewer || r.name || 'Verified Customer'}
                          </Text>
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                            <Text style={styles.verifiedBadgeText}>Verified Customer</Text>
                          </View>
                        </View>
                        <View style={styles.reviewStars}>
                          {[...Array(r.rating || 5)].map((_, i) => (
                            <Ionicons key={i} name="star" size={13} color="#F59E0B" />
                          ))}
                        </View>
                        <Text style={styles.reviewBody}>
                          {r.comment || r.body || r.text || ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.emptyReviewsContainer}>
                  <View style={styles.emptyReviewsIconCircle}>
                    <Ionicons name="chatbubbles-outline" size={38} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyReviewsTitle}>No Reviews Yet</Text>
                  <Text style={styles.emptyReviewsDesc}>
                    There are currently no reviews for this product. Be the first verified customer to share your experience!
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 3: PAYMENT / DELIVERY */}
          {activeTab === 'payment' && (
            <View style={styles.tabPane}>
              <View style={styles.atomyBlock}>
                <Text style={styles.atomyTitle}>Delivery Period</Text>
                <Text style={styles.atomyListItem}>
                  • Depending on destination, Delivery takes 0-2 working days after payment.
                </Text>
                <Text style={styles.atomyListItem}>
                  • Delivery time may vary depending on location and courier serviceability.
                </Text>
                <Text style={styles.atomyListItem}>
                  • Weekends and public holidays are exempt from the Delivery period.
                </Text>
              </View>

              <View style={styles.atomyBlock}>
                <Text style={styles.atomyTitle}>Delivery Fee Zone Charges</Text>
                <View style={styles.zoneTableContainer}>
                  <View style={styles.zoneTableRowHeader}>
                    <Text style={[styles.zoneTableCell, { flex: 2, fontWeight: '800' }]}>Region</Text>
                    <Text style={[styles.zoneTableCell, { flex: 1, fontWeight: '800' }]}>Zone</Text>
                    <Text style={[styles.zoneTableCell, { flex: 1, fontWeight: '800' }]}>≤ 500g</Text>
                    <Text style={[styles.zoneTableCell, { flex: 1.2, fontWeight: '800' }]}>+500g</Text>
                  </View>
                  {[
                    { region: 'Intra-city', code: 'A', base: '₹ 40', add: '₹ 28' },
                    { region: 'Intra-Region', code: 'B', base: '₹ 46', add: '₹ 40' },
                    { region: 'Metro', code: 'C', base: '₹ 48', add: '₹ 44' },
                    { region: 'Rest of India', code: 'D', base: '₹ 69', add: '₹ 52' },
                    { region: 'J&K / NE', code: 'E/F', base: '₹ 75', add: '₹ 58' },
                  ].map((z, idx) => (
                    <View key={`z-${idx}`} style={styles.zoneTableRow}>
                      <Text style={[styles.zoneTableCell, { flex: 2 }]}>{z.region}</Text>
                      <Text style={[styles.zoneTableCell, { flex: 1 }]}>{z.code}</Text>
                      <Text style={[styles.zoneTableCell, { flex: 1 }]}>{z.base}</Text>
                      <Text style={[styles.zoneTableCell, { flex: 1.2 }]}>{z.add}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.zoneTableNote}>* Free delivery for orders above ₹ 4,500.00</Text>
              </View>

              <TouchableOpacity
                style={styles.policyAccordionBtn}
                onPress={() => setIsEducationCentreOpen(!isEducationCentreOpen)}
              >
                <Text style={styles.policyAccordionTitle}>Education Centre Delivery</Text>
                <Ionicons
                  name={isEducationCentreOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
              {isEducationCentreOpen && (
                <View style={styles.policyAccordionBody}>
                  <Text style={styles.atomyListItem}>
                    • Free delivery for orders delivered to the designated affiliated Education
                    Centre regardless of purchase amount.
                  </Text>
                  <Text style={styles.atomyListItem}>
                    • Members can collect orders during centre working hours with Photo ID.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.policyAccordionBtn}
                onPress={() => setIsSelfPickUpOpen(!isSelfPickUpOpen)}
              >
                <Text style={styles.policyAccordionTitle}>Self Pick Up</Text>
                <Ionicons
                  name={isSelfPickUpOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
              {isSelfPickUpOpen && (
                <View style={styles.policyAccordionBody}>
                  <Text style={styles.atomyListItem}>
                    • Available at designated Atomy India Main Hubs (Monday–Friday, 10am–5pm).
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 4: RETURN / EXCHANGE */}
          {activeTab === 'return' && (
            <View style={styles.tabPane}>
              <View style={styles.atomyBlock}>
                <Text style={styles.atomyTitle}>Return / Exchange Policy</Text>
                <Text style={styles.atomyListItem}>
                  • 30-Day Money-Back Guarantee for sealed products in original saleable condition.
                </Text>
                <Text style={styles.atomyListItem}>
                  • Contact Customer Support at 0124-695-9000 or email atomy_in@atomypark.com to
                  initiate return pickup.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 9. RELATED PRODUCTS SECTION (Down Where the Related Product List is) */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeaderRow}>
              <Text style={styles.relatedSectionTitle}>Related Products</Text>
              <Text style={styles.relatedSectionSubtitle}>
                Customers who viewed this item also explored
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScrollContent}
            >
              {relatedProducts.map((relProd) => (
                <LandingProductCard
                  key={relProd.id}
                  product={{
                    ...relProd,
                    image: relProd.image || relProd.img,
                  }}
                  isMember={isMember}
                  isFavorite={favorites.includes(relProd.id)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToCart={onAddToCart}
                  onPress={(p) => {
                    if (onSelectRelatedProduct) {
                      onSelectRelatedProduct(p);
                    }
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                  onJoinMemberPress={onJoinMemberPress}
                  cardWidth={176}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* 10. Official Sticky Bottom Purchase Bar */}
      <View style={styles.stickyBottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>{qty} Unit(s)</Text>
          <Text style={styles.bottomPriceVal}>₹ {formatInr(totalPrice)}</Text>
          <Text style={styles.bottomPvVal}>+{totalPv.toLocaleString('en-IN')} PV</Text>
        </View>

        <View style={styles.bottomBtnsRow}>
          <TouchableOpacity
            style={styles.bottomCartBtn}
            onPress={() => onAddToCart && onAddToCart(product, qty)}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={18} color="#00A3E0" />
            <Text style={styles.bottomCartBtnText}>Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomBuyBtn}
            onPress={() => onBuyNow && onBuyNow(product, qty)}
            activeOpacity={0.88}
          >
            <Text style={styles.bottomBuyBtnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PRICE & TAX BREAKDOWN POPUP MODAL (Triggered when touching the 'ⓘ' icon) */}
      <Modal visible={isTaxModalOpen} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalBackdropOverlay}
          activeOpacity={1}
          onPress={() => setIsTaxModalOpen(false)}
        >
          <View style={styles.taxModalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.taxModalHeader}>
              <View style={styles.taxModalHeaderLeft}>
                <Ionicons name="receipt-outline" size={20} color="#00A3E0" />
                <Text style={styles.taxModalTitle}>Price & Tax Breakdown</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsTaxModalOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.taxModalBody}>
              {hasOffer && (
                <View style={styles.modalBreakdownRow}>
                  <Text style={styles.modalBreakdownLabel}>Maximum Retail Price (MRP)</Text>
                  <Text style={styles.modalBreakdownValue}>₹ {formatInr(mrp)}</Text>
                </View>
              )}

              {hasOffer && (
                <View style={styles.modalBreakdownRow}>
                  <Text style={[styles.modalBreakdownLabel, { color: '#059669' }]}>
                    Discount Savings ({discountPercent}% OFF)
                  </Text>
                  <Text style={[styles.modalBreakdownValue, { color: '#059669', fontWeight: '800' }]}>
                    - ₹ {formatInr(savingsAmount)}
                  </Text>
                </View>
              )}

              <View style={styles.modalDivider} />

              <View style={styles.modalBreakdownRow}>
                <Text style={styles.modalBreakdownLabel}>
                  {isMember ? 'Distributor Price (Base)' : 'Base Price (Excl. Tax)'}
                </Text>
                <Text style={[styles.modalBreakdownValue, { fontWeight: '800' }]}>
                  ₹ {formatInr(unitGstBase)}
                </Text>
              </View>

              <View style={styles.modalBreakdownRow}>
                <Text style={styles.modalBreakdownLabel}>
                  Goods & Services Tax ({gstRate === 5 ? 'GST 5%' : 'GST 18%'})
                </Text>
                <Text style={styles.modalBreakdownValue}>₹ {formatInr(unitGst)}</Text>
              </View>

              <View style={[styles.modalBreakdownRow, styles.modalTotalRow]}>
                <Text style={styles.modalTotalLabel}>Total Price (Incl. Tax)</Text>
                <Text style={styles.modalTotalValue}>₹ {formatInr(activePrice)}</Text>
              </View>
            </View>

            <View style={styles.taxModalNoteWrap}>
              <Ionicons name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.taxModalNoteText}>
                All consumer taxes are officially assessed under Central & State GST rules.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.taxModalCloseBtn}
              onPress={() => setIsTaxModalOpen(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.taxModalCloseBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* FULLSCREEN IMAGE MODAL */}
      <Modal visible={isImgModalOpen} animationType="fade" transparent>
        <View style={styles.imageModalBackdrop}>
          <View style={styles.imageModalHeader}>
            <Text style={styles.imageModalTitle}>
              {currentImgIdx + 1} / {galleryImages.length}
            </Text>
            <TouchableOpacity onPress={() => setIsImgModalOpen(false)}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.imageModalCenter}>
            <Image
              source={{ uri: activeMainImg }}
              style={styles.imageModalMainImg}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>

      {/* HD FULLSCREEN BROCHURE ZOOM MODAL */}
      <Modal
        visible={!!zoomBrochureSource}
        animationType="fade"
        transparent
        onRequestClose={() => setZoomBrochureSource(null)}
      >
        <View style={styles.zoomModalBackdrop}>
          <View style={styles.zoomModalHeader}>
            <View style={styles.zoomModalTitleRow}>
              <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
              <Text style={styles.zoomModalTitle}>HD Brochure Zoom</Text>
            </View>
            <TouchableOpacity
              onPress={() => setZoomBrochureSource(null)}
              style={styles.zoomModalCloseBtn}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.zoomModalScroll}
            contentContainerStyle={styles.zoomModalScrollContent}
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {zoomBrochureSource && (
              <Image
                source={zoomBrochureSource}
                style={styles.zoomModalImage}
                resizeMode="contain"
              />
            )}
          </ScrollView>
          <View style={styles.zoomModalFooter}>
            <Text style={styles.zoomModalFooterText}>
              Pinch or scroll to inspect ultra-sharp details
            </Text>
          </View>
        </View>
      </Modal>
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
    fontSize: 16.5,
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
  mainScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Hero Image Section
  heroImageSection: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 330,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gstBadgePill: {
    position: 'absolute',
    top: 14,
    left: 16,
    backgroundColor: '#00A3E0',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 4,
    zIndex: 5,
  },
  gstBadgePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  heroImageTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '92%',
    height: '92%',
  },
  imgNavBtnPrev: {
    position: 'absolute',
    left: 14,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imgNavBtnNext: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imgCounterPill: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  imgCounterPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  imgExpandBtn: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Thumbnails
  thumbStrip: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  thumbItem: {
    width: 58,
    height: 58,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 3,
    backgroundColor: '#FFFFFF',
  },
  thumbItemActive: {
    borderColor: '#00A3E0',
    backgroundColor: '#F0F9FF',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },

  // Page Body Content
  pageBodyContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewsCountText: {
    fontSize: 13,
    color: '#64748B',
  },
  reviewUnderline: {
    textDecorationLine: 'underline',
    color: '#00A3E0',
    fontWeight: '600',
  },
  actionIconsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconToolBtn: {
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeLine: {
    marginBottom: 6,
  },
  freeDelivPill: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  officialTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 26,
    letterSpacing: -0.4,
    marginBottom: 10,
  },

  // CUSTOM PRICE HERO ROW MATCHING SCREENSHOT: ₹2,701 3884 ⓘ [ ₹1183 off ]
  customPriceHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 6,
  },
  heroCurrentPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  mrpAndInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMrpStrikethrough: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  infoIconCircleBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  infoIconChar: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
    marginTop: -1,
  },
  slantedDiscountTag: {
    backgroundColor: '#B91C1C', // Vivid deep red tag matching reference
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 3,
    transform: [{ skewX: '-10deg' }], // Stylish slanted cut
  },
  slantedDiscountTagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.2,
    transform: [{ skewX: '10deg' }], // Unskew text for clarity
  },
  dpPricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 4,
  },
  dpPricePillText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
  },

  // PV and Membership Section right below Price Row
  pvAndMemberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
    paddingVertical: 4,
  },
  pvBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pvBadgePillText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00A3E0',
  },
  joinMemberHintWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  joinMemberHintText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#00A3E0',
  },
  activeMemberAppliedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeMemberAppliedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },

  productNumberLine: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },

  // VERTICAL STATS LIST (ONE BY ONE VERTICALLY)
  verticalStatsList: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    gap: 8,
    marginBottom: 12,
  },
  verticalStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  statIconWrap: {
    width: 24,
    alignItems: 'center',
  },
  verticalStatLabel: {
    fontSize: 13,
    color: '#475569',
  },
  verticalStatBold: {
    fontWeight: '800',
    color: '#0F172A',
  },

  shippingDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  shipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  shipVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },

  // Quantity Stepper
  qtySectionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 14,
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  officialStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 36,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  stepperValBox: {
    minWidth: 38,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Tabs Bar
  tabsBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginTop: 6,
  },
  tabNavBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabNavBtnActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#00A3E0',
  },
  tabNavBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabNavBtnTextActive: {
    color: '#00A3E0',
    fontWeight: '900',
  },

  // Tab Content Panel
  tabContentPanel: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  tabPane: {
    gap: 12,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  specsTableContainer: {
    marginTop: 10,
  },
  specsTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  specTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  specTableTh: {
    width: '38%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    justifyContent: 'center',
  },
  specThText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  specTableTd: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 10,
    justifyContent: 'center',
  },
  specTdText: {
    fontSize: 11.5,
    color: '#0F172A',
    lineHeight: 16,
  },
  specCautionItem: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 3,
  },
  brochureImagesContainer: {
    width: '100%',
    maxWidth: 750,
    alignSelf: 'center',
    marginTop: 14,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brochureZoomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },
  brochureZoomHintText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
  },
  brochureImageWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  brochureImage: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  zoomModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  zoomModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  zoomModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoomModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  zoomModalCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  zoomModalScroll: {
    flex: 1,
  },
  zoomModalScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  zoomModalImage: {
    width: Math.min(SCREEN_WIDTH, 750),
    height: Math.min(SCREEN_WIDTH, 750) * (3730 / 750),
  },
  zoomModalFooter: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  zoomModalFooterText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  expandDetailsBtn: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  expandDetailsBtnText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#00A3E0',
  },

  // Review Tab
  reviewsSummaryHeader: {
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  overallScore: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginVertical: 4,
  },
  totalRatingsText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  ratingsBarsList: {
    width: '100%',
    gap: 6,
    paddingHorizontal: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barRowLabel: {
    width: 44,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  barRowPercent: {
    width: 32,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
  },
  reviewsStream: {
    marginTop: 10,
    gap: 10,
  },
  singleReviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedBadgeText: {
    fontSize: 10.5,
    color: '#10B981',
    fontWeight: '700',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  reviewBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },

  // Policy Tabs
  atomyBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  atomyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  atomyListItem: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 4,
  },
  zoneTableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 6,
  },
  zoneTableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  zoneTableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  zoneTableCell: {
    fontSize: 11,
    color: '#334155',
  },
  zoneTableNote: {
    fontSize: 10.5,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 6,
  },
  policyAccordionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  policyAccordionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  policyAccordionBody: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -4,
  },

  // 9. RELATED PRODUCTS SECTION
  relatedSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  relatedHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  relatedSectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  relatedSectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  relatedScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 6,
  },

  // Sticky Bottom Bar
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 8,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomPriceLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  bottomPriceVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  bottomPvVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3E0',
  },
  bottomBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#00A3E0',
  },
  bottomCartBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#00A3E0',
  },
  bottomBuyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#00A3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBuyBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // TAX BREAKDOWN POPUP MODAL STYLES
  modalBackdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  taxModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  taxModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  taxModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taxModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  taxModalBody: {
    paddingVertical: 14,
    gap: 8,
  },
  modalBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBreakdownLabel: {
    fontSize: 13,
    color: '#475569',
  },
  modalBreakdownValue: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  modalTotalRow: {
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
  },
  modalTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00A3E0',
  },
  taxModalNoteWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  taxModalNoteText: {
    flex: 1,
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  taxModalCloseBtn: {
    backgroundColor: '#00A3E0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  taxModalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Fullscreen Modal
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 30,
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  imageModalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalMainImg: {
    width: SCREEN_WIDTH - 20,
    height: SCREEN_WIDTH - 20,
  },

  // Empty Reviews State
  emptyReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
  },
  emptyReviewsIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  emptyReviewsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyReviewsDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
