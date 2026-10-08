import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Heart,
  Share2,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Star,
  FileText,
  ShoppingBag,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  ArrowLeft
} from 'lucide-react';
import {
  GST_BADGE_IMAGE,
  getRelatedProducts
} from '../../data/mockData';
import { getProductDetailConfig, getGenericName } from '../../data/productDetailsData';
import { MenuToggleIcon } from '../FloatingToolbar/FloatingToolbar';
import './ProductDetailPage.css';

export default function ProductDetailPage({
  product,
  onAddToCart,
  onBuyNow,
  onNavigateHome,
  onNavigateBack,
  onSelectCategory,
  onProductClick,
  onNavigateFavorites,
  onNavigateOrders,
  onOpenQuickOrder,
  onNavigateContact,
  onOpenRecentlyViewed,
  favorites = [],
  onToggleFavorite
}) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'review' | 'payment' | 'return'
  const [isProductInfoOpen, setIsProductInfoOpen] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(product?.likes || 224);
  const [toast, setToast] = useState(null);
  const [isExpandedDetails, setIsExpandedDetails] = useState(false);
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const [isPdpQuickMenuOpen, setIsPdpQuickMenuOpen] = useState(false);

  const relatedSliderRef = useRef(null);
  const tabsSectionRef = useRef(null);
  const pdpQuickMenuRef = useRef(null);

  // Close quick menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pdpQuickMenuRef.current && !pdpQuickMenuRef.current.contains(e.target)) {
        setIsPdpQuickMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!tabsSectionRef.current) return;
      const rect = tabsSectionRef.current.getBoundingClientRect();
      // Appears when entering into the product information / details section
      setShowFloatingCard(rect.top <= 140);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic product configuration and official specifications based on category/product identity
  const config = getProductDetailConfig(product);
  const officialData = config?.officialData;

  // On Atomy India official site, Beauty / Cosmetics / Makeup products have Generic Name FIRST in the table
  const categoryStr = ((product?.category || '') + ' ' + (product?.name || '')).toLowerCase();
  const isGenericNameFirst = categoryStr.includes('beauty') ||
                             categoryStr.includes('skincare') ||
                             categoryStr.includes('cosmetic') ||
                             categoryStr.includes('makeup') ||
                             categoryStr.includes('eyeliner') ||
                             categoryStr.includes('concealer') ||
                             categoryStr.includes('air pact') ||
                             categoryStr.includes('evening care') ||
                             categoryStr.includes('sunscreen') ||
                             categoryStr.includes('the fame') ||
                             categoryStr.includes('absolute');

  // Gallery images (official multi-angle gallery images from Atomy studio or product image)
  const galleryImages = (
    officialData?.galleryImages && officialData.galleryImages.length > 0
      ? officialData.galleryImages
      : [product?.image, product?.image, product?.image, product?.image]
  ).filter(Boolean);

  useEffect(() => {
    setCurrentImgIdx(0);
    setQty(1);
    setActiveTab('details');
    setIsLiked(false);
    setLikesCount(product?.likes || 224);
    setIsProductInfoOpen(true);
    setIsExpandedDetails(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  if (!product) {
    return (
      <div className="pdp-not-found container">
        <h2>Product Not Found</h2>
        <button className="atomy-btn-primary" onClick={onNavigateHome}>
          Return to Shopping Mall
        </button>
      </div>
    );
  }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const isFavorite = favorites.some((f) => f.id === product?.id);

  const handleToggleLike = () => {
    if (onToggleFavorite && product) {
      onToggleFavorite(product);
    }
    setIsLiked(!isFavorite);
    setLikesCount((prev) => (isFavorite ? prev - 1 : prev + 1));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Atomy India`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleJumpToReviews = () => {
    setActiveTab('review');
    if (tabsSectionRef.current) {
      const topOffset = tabsSectionRef.current.getBoundingClientRect().top + window.pageYOffset - 50;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    if (tabsSectionRef.current) {
      const topOffset = tabsSectionRef.current.getBoundingClientRect().top + window.pageYOffset - 50;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const unitPrice = product.price || 1350;
  const totalPrice = unitPrice * qty;
  const itemPv = product.pv || officialData?.pv || 6700;
  const totalPv = itemPv * qty;

  // Lock body scroll and listen for Escape / Arrow keys when modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isImgModalOpen) return;
      if (e.key === 'Escape') {
        setIsImgModalOpen(false);
        setIsZoomed(false);
      } else if (e.key === 'ArrowLeft') {
        setIsZoomed(false);
        setCurrentImgIdx((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'ArrowRight') {
        setIsZoomed(false);
        setCurrentImgIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : prev));
      }
    };

    if (isImgModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isImgModalOpen, galleryImages.length]);

  // Next / Prev image navigation in hero box (boundary-aware matching screenshot)
  const handlePrevImage = () => {
    setCurrentImgIdx((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextImage = () => {
    setCurrentImgIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : prev));
  };

  const handleModalPrev = () => {
    setIsZoomed(false);
    setCurrentImgIdx((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleModalNext = () => {
    setIsZoomed(false);
    setCurrentImgIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : prev));
  };

  // Related products dynamically resolved by category (matches Screenshot 4)
  const relatedProducts = getRelatedProducts(product);

  const scrollRelated = (direction) => {
    if (relatedSliderRef.current) {
      const scrollAmount = direction === 'left' ? -260 * 2 : 260 * 2;
      relatedSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="pdp-page-wrapper">
      {/* 1. Breadcrumbs Bar (matches User Screenshot 1: Home > HemoHIM) */}
      <div className="pdp-breadcrumb-bar">
        <div className="container">
          <nav className="pdp-breadcrumbs">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome && onNavigateHome();
              }}
            >
              Home
            </a>
            <span className="crumb-arrow">&gt;</span>
            <span className="crumb-current">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* 2. Main Showcase & Purchasing Area */}
      <section className="pdp-main-section">
        <div className="container pdp-grid-container">

          {/* Left Column: Product Gallery & Trust Guarantees */}
          <div className="pdp-gallery-column">
            <div className="pdp-main-image-card">
              {/* GST Reduced Badge (matches Screenshot 1) */}
              {product.gstReduced && (
                <img
                  src={GST_BADGE_IMAGE}
                  alt="GST Reduced"
                  className="pdp-gst-badge"
                />
              )}

              {/* Prev / Next Arrow Buttons overlay on image (matching Image 1 design) */}
              {currentImgIdx > 0 && (
                <button
                  type="button"
                  className="pdp-img-nav-btn prev"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} strokeWidth={1.5} />
                </button>
              )}

              <img
                src={galleryImages[currentImgIdx] || product.image}
                alt={product.name}
                className="pdp-hero-image"
                onClick={() => {
                  setIsImgModalOpen(true);
                  setIsZoomed(false);
                }}
                style={{ cursor: 'pointer' }}
                title="Click to view enlarged image"
              />

              {currentImgIdx < galleryImages.length - 1 && (
                <button
                  type="button"
                  className="pdp-img-nav-btn next"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} strokeWidth={1.5} />
                </button>
              )}

              {/* Image pagination indicator e.g. 3/4 (matches Image 1) */}
              <div className="pdp-img-counter-pill">
                {currentImgIdx + 1}/{galleryImages.length}
              </div>

              {/* Fullscreen / expand button (matches Image 1) */}
              <button
                type="button"
                className="pdp-img-expand-btn"
                title="View Product Images"
                onClick={() => {
                  setIsImgModalOpen(true);
                  setIsZoomed(false);
                }}
                aria-label="Zoom Image"
              >
                <Maximize2 size={20} strokeWidth={1.75} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="pdp-thumbnails-strip">
              {galleryImages.map((thumb, idx) => (
                <div
                  key={idx}
                  className={`pdp-thumb-item ${currentImgIdx === idx ? 'active' : ''}`}
                  onClick={() => setCurrentImgIdx(idx)}
                >
                  <img src={thumb} alt={`View ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Main Info & Sticky Qty Purchase Block */}
          <div className="pdp-buy-column">

            {/* Top Review Rating & Action Icons (Print, Heart, Share) (matches Screenshot 1) */}
            <div className="pdp-top-meta-row">
              <div className="pdp-review-summary-left">
                <Star size={16} fill="#111" color="#111" />
                <span className="pdp-rating-num">{product.rating || '5.0'}</span>
                <span className="pdp-reviews-count-text">
                  {product.reviewsCount || 13} no(s){' '}
                  <button
                    type="button"
                    className="pdp-review-link-btn"
                    onClick={handleJumpToReviews}
                  >
                    Review
                  </button>
                </span>
              </div>

              <div className="pdp-action-icons-right">
                <button
                  type="button"
                  className="pdp-icon-tool-btn"
                  onClick={handlePrint}
                  title="Print Product Page"
                  aria-label="Print"
                >
                  <Printer size={18} />
                </button>
                <button
                  type="button"
                  className={`pdp-icon-tool-btn ${isFavorite || isLiked ? 'liked' : ''}`}
                  onClick={handleToggleLike}
                  title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
                  aria-label="Favorites"
                >
                  <Heart
                    size={18}
                    fill={isFavorite || isLiked ? "#ef4444" : "none"}
                    color={isFavorite || isLiked ? "#ef4444" : "#444444"}
                  />
                </button>
                <button
                  type="button"
                  className="pdp-icon-tool-btn"
                  onClick={handleShare}
                  title="Share Product"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Free Delivery Bordered Badge (matches Screenshot 1) */}
            <div className="pdp-badge-line">
              <span className="pdp-free-deliv-pill">Free Delivery</span>
            </div>

            {/* Product Title (matches Screenshot 1) */}
            <h1 className="pdp-official-title">{product.name}</h1>

            {/* Price & Offer Row */}
            {(() => {
              const origVal = Number(product.originalPrice) || 0;
              const discVal = product.discountPercent
                ? Number(String(product.discountPercent).replace(/[^0-9]/g, ''))
                : (origVal > unitPrice ? Math.round(((origVal - unitPrice) / origVal) * 100) : 0);
              const hasOffer = discVal > 0 && origVal > unitPrice;

              return (
                <>
                  <div className="pdp-price-amount">
                    {!hasOffer && <span style={{ fontSize: '16px', color: '#64748b', fontWeight: '500', marginRight: '6px' }}>MRP</span>}
                    ₹ {unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>

                  {hasOffer && (
                    <div className="pdp-mrp-discount-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 10px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>MRP:</span>
                      <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
                        ₹ {origVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '11.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                        {discVal}% OFF
                      </span>
                    </div>
                  )}
                </>
              );
            })()}

            {/* DP (Distributor Price) Row for Member Advantage */}
            {(product.dpPrice || product.distributorPrice) && (
              <div className="pdp-dp-price-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '8px 14px', borderRadius: '8px', margin: '10px 0 14px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', background: '#10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                  DP PRICE
                </span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#065f46' }}>
                  ₹ {Number(product.dpPrice || product.distributorPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span style={{ fontSize: '12px', color: '#047857' }}>
                  • Atomy Member Advantage Plan (Upcoming)
                </span>
              </div>
            )}

            {/* Authentic Atomy PV Display */}
            <div className="pdp-pv-display-row">
              <span className="pdp-pv-amount">{itemPv.toLocaleString('en-IN')} PV</span>
            </div>

            {/* Product Number */}
            <p className="pdp-product-number-line">
              Product number {product.id || 'D00101'}
            </p>

            {/* Social Proof Counter Stats (matches Screenshot 1 with cyan icons) */}
            <div className="pdp-stats-indicators-row">
              <div className="stat-indicator-item">
                <Heart size={16} color="#00A3E0" />
                <span>{likesCount} Likes</span>
              </div>
              <div className="stat-indicator-item">
                <FileText size={16} color="#00A3E0" />
                <span>{product.purchased || '1,219'} Purchased</span>
              </div>
              <div className="stat-indicator-item">
                <ShoppingBag size={16} color="#00A3E0" />
                <span>{product.addedToCart || '2,333'} Added to cart</span>
              </div>
            </div>

            {/* Shipping Details Row (matches Screenshot 1) */}
            <div className="pdp-shipping-details-row">
              <span className="ship-label">Shipping details</span>
              <span className="ship-val">Free delivery for orders above ₹ 4,500.00</span>
            </div>

            {/* Sticky Qty Card & Action Buttons (Exact Match to Screenshots 1 & 2) */}
            <div className="pdp-sticky-purchase-wrapper">
              <div className="pdp-qty-section-title">Qty</div>

              {/* Light Gray Container Box */}
              <div className="pdp-qty-gray-box">
                <div className="pdp-qty-item-name">{product.name}</div>
                <div className="pdp-qty-stepper-price-row">
                  {/* Stepper with - and + */}
                  <div className="pdp-official-stepper">
                    <button
                      type="button"
                      className="stepper-btn-minus"
                      onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="stepper-val-box">{qty}</span>
                    <button
                      type="button"
                      className="stepper-btn-plus"
                      onClick={() => setQty((prev) => prev + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Price & PV stack on right */}
                  <div className="pdp-qty-price-pv-stack">
                    <div className="pdp-qty-box-price">
                      ₹ {unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    {itemPv > 0 && (
                      <div className="pdp-qty-box-pv">
                        {totalPv.toLocaleString('en-IN')} PV
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Product Price Summary Row */}
              <div className="pdp-total-price-summary-row">
                <span className="total-label">Total Product Price</span>
                <div className="total-amount-box">
                  <span className="units-count">{qty} Unit(s)&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                  <span className="bold-total-price">
                    ₹ {totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Total PV Summary Row */}
              <div className="pdp-total-pv-summary-row">
                <span className="total-label">Total PV</span>
                <div className="total-pv-box">
                  {totalPv.toLocaleString('en-IN')} PV
                </div>
              </div>

              {/* Action Buttons: Easy Purchase | Cart, and Buy Now (matches Screenshot 1 & 2) */}
              <div className="pdp-floating-action-buttons">
                <div className="pdp-action-buttons-subrow">
                  <button
                    type="button"
                    className="pdp-easy-purchase-btn"
                    onClick={() => {
                      onBuyNow && onBuyNow(product, qty);
                    }}
                  >
                    Easy Purchase
                  </button>
                  <button
                    type="button"
                    className="pdp-cart-btn"
                    onClick={() => {
                      onAddToCart && onAddToCart(product, qty);
                      showToast(`Added ${qty} × ${product.name} to cart!`);
                    }}
                  >
                    Cart
                  </button>
                </div>

                <button
                  type="button"
                  className="pdp-buy-now-btn"
                  onClick={() => {
                    onBuyNow && onBuyNow(product, qty);
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Persistent Container: Sticky Tab Bar persists across Tabs AND Related Products till the last */}
      <div className="pdp-sticky-tabs-container">
        {/* Full-width Sticky Tabs Bar (Persists till the last of the page) */}
        <div className="pdp-tabs-sticky-bar-wrapper">
          <div className="container">
            <div className="pdp-tab-headers-bar">
              <button
                type="button"
                className={`pdp-tab-nav-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => handleTabClick('details')}
              >
                Details
              </button>
              <button
                type="button"
                className={`pdp-tab-nav-btn ${activeTab === 'review' ? 'active' : ''}`}
                onClick={() => handleTabClick('review')}
              >
                Review({product.reviewsCount || 13})
              </button>
              <button
                type="button"
                className={`pdp-tab-nav-btn ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => handleTabClick('payment')}
              >
                Payment/Delivery
              </button>
              <button
                type="button"
                className={`pdp-tab-nav-btn ${activeTab === 'return' ? 'active' : ''}`}
                onClick={() => handleTabClick('return')}
              >
                Return/Exchange
              </button>

              {/* Quick Menu Toggle on Corner of Details Bar (matches Header Corner) */}
              <div className="pdp-tabs-quick-corner" ref={pdpQuickMenuRef}>
                <button
                  type="button"
                  className={`quick-menu-corner-pill ${isPdpQuickMenuOpen ? 'active' : ''}`}
                  onClick={() => setIsPdpQuickMenuOpen(!isPdpQuickMenuOpen)}
                  aria-expanded={isPdpQuickMenuOpen}
                  aria-label="Quick Menu"
                  title="Quick Access Services"
                >
                  <span className="quick-menu-pulse-badge" aria-hidden="true">
                    <span className="pulse-ping"></span>
                    <span className="pulse-dot"></span>
                  </span>
                  <span className="quick-menu-pill-text">Quick Menu</span>
                  <MenuToggleIcon isOpen={isPdpQuickMenuOpen} size={18} />
                </button>

                {/* Quick Menu Dropdown Box */}
                {isPdpQuickMenuOpen && (
                  <div className="quick-menu-corner-dropdown animate-fade">
                    <button
                      type="button"
                      className="quick-menu-corner-item"
                      onClick={() => {
                        setIsPdpQuickMenuOpen(false);
                        if (onNavigateOrders) onNavigateOrders();
                        else window.dispatchEvent(new CustomEvent('atomy:open-orders'));
                      }}
                    >
                      <img
                        src="/images/floating/order_delivery.svg"
                        alt="Order / Delivery"
                        className="quick-menu-corner-icon"
                      />
                      <span>Order / Delivery</span>
                    </button>

                    <button
                      type="button"
                      className="quick-menu-corner-item"
                      onClick={() => {
                        setIsPdpQuickMenuOpen(false);
                        if (onOpenQuickOrder) onOpenQuickOrder();
                        else window.dispatchEvent(new CustomEvent('atomy:open-quick-order'));
                      }}
                    >
                      <img
                        src="/images/floating/quick_order.svg"
                        alt="Quick Order"
                        className="quick-menu-corner-icon"
                      />
                      <span>Quick Order</span>
                    </button>

                    {/* Favorites Page Link */}
                    <button
                      type="button"
                      className="quick-menu-corner-item"
                      onClick={() => {
                        setIsPdpQuickMenuOpen(false);
                        onNavigateFavorites && onNavigateFavorites();
                      }}
                    >
                      <Heart
                        size={20}
                        className="quick-menu-corner-lucide"
                        style={{ color: '#ef4444', fill: favorites.length > 0 ? '#ef4444' : 'none' }}
                      />
                      <span>Favorites {favorites.length > 0 ? `(${favorites.length})` : ''}</span>
                    </button>

                    <button
                      type="button"
                      className="quick-menu-corner-item"
                      onClick={() => {
                        setIsPdpQuickMenuOpen(false);
                        if (onNavigateContact) onNavigateContact();
                        else window.dispatchEvent(new CustomEvent('atomy:open-contact'));
                      }}
                    >
                      <img
                        src="/images/floating/find_centre.svg"
                        alt="Find Centre"
                        className="quick-menu-corner-icon"
                      />
                      <span>Contact Us / Find Centre</span>
                    </button>

                    <button
                      type="button"
                      className="quick-menu-corner-item"
                      onClick={() => {
                        setIsPdpQuickMenuOpen(false);
                        if (onOpenRecentlyViewed) onOpenRecentlyViewed();
                        else window.dispatchEvent(new CustomEvent('atomy:open-recent'));
                      }}
                    >
                      <Clock size={20} className="quick-menu-corner-lucide" />
                      <span>Recently Viewed Products</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. 4-Tab Information Section (Exact match to User Screenshots) */}
        <section className="pdp-tabs-section" ref={tabsSectionRef}>
          <div className="container">
            {/* 3/4 + 1/4 Grid Layout (matches User Screenshots) */}
            <div className="pdp-details-layout-grid">
            {/* Left Column (approx 3/4): Main Tabbed Information & Details */}
            <div className="pdp-details-main-col">
              <div className="pdp-tab-content-panel">

            {/* TAB 1: DETAILS (Exact match to Screenshot 2 & 3) */}
            {activeTab === 'details' && (
              <div className="tab-pane animate-fade">
                {/* Accordion Heading: Product information (matches Screenshot 2 & 3) */}
                <div
                  className="pdp-accordion-header"
                  onClick={() => setIsProductInfoOpen(!isProductInfoOpen)}
                >
                  <h3 className="accordion-title">Product information</h3>
                  <button type="button" className="accordion-toggle-btn" aria-label="Toggle details">
                    {isProductInfoOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Collapsible Content: Official Unified Specifications & Information Table */}
                {isProductInfoOpen && (
                  <div className="pdp-product-info-table-container">
                    <table className="pdp-official-specs-table">
                      <tbody>
                        {isGenericNameFirst && (
                          <tr>
                            <th>Generic Name</th>
                            <td>{config.specs?.genericName || getGenericName(product)}</td>
                          </tr>
                        )}
                        {config.specs?.brandExportedBy && (
                          <tr>
                            <th>Brand Exported By</th>
                            <td>{config.specs.brandExportedBy}</td>
                          </tr>
                        )}
                        {config.specs?.manufacturer && (
                          <tr>
                            <th>Manufacturer name and address</th>
                            <td>{config.specs.manufacturer}</td>
                          </tr>
                        )}
                        {config.specs?.importedMarketedBy && (
                          <tr>
                            <th>Imported and Marketed by</th>
                            <td>{config.specs.importedMarketedBy}</td>
                          </tr>
                        )}
                        <tr>
                          <th>Country of Origin</th>
                          <td>{config.specs?.countryOfOrigin || "Republic of Korea"}</td>
                        </tr>
                        {!isGenericNameFirst && (
                          <tr>
                            <th>Generic Name</th>
                            <td>{config.specs?.genericName || getGenericName(product)}</td>
                          </tr>
                        )}
                        {config.specs?.directions && (
                          <tr>
                            <th>Directions</th>
                            <td>{config.specs.directions}</td>
                          </tr>
                        )}
                        {config.specs?.netVolume && (
                          <tr>
                            <th>Net Volume / Quantity</th>
                            <td>{config.specs.netVolume}</td>
                          </tr>
                        )}
                        {config.specs?.productType && (
                          <tr>
                            <th>Product Type</th>
                            <td>{config.specs.productType}</td>
                          </tr>
                        )}
                        {config.specs?.storage && (
                          <tr>
                            <th>Storage Advice</th>
                            <td>{config.specs.storage}</td>
                          </tr>
                        )}
                        {config.specs?.cautions && (
                          <tr>
                            <th>Cautions</th>
                            <td>
                              <div className="specs-caution-list">
                                {Array.isArray(config.specs.cautions) ? (
                                  config.specs.cautions.map((caution, idx) => (
                                    <div key={idx} className="spec-caution-item">
                                      {caution.startsWith('-') ? caution : `- ${caution}`}
                                    </div>
                                  ))
                                ) : (
                                  <div className="spec-caution-item">{config.specs.cautions}</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                        {config.specs?.expiration && (
                          <tr>
                            <th>Expiration</th>
                            <td>{config.specs.expiration}</td>
                          </tr>
                        )}
                        {config.specs?.licenseNumber && (
                          <tr>
                            <th>License / Reg. No.</th>
                            <td>{config.specs.licenseNumber}</td>
                          </tr>
                        )}
                        {config.specs?.contact && (
                          <tr className="pdp-specs-contact-row">
                            <th>For feedback or complaints, Contact us at</th>
                            <td style={{ whiteSpace: 'pre-line' }}>
                              {config.specs.contact}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* EXPANDED OFFICIAL ATOMY PRODUCT BROCHURE */}
                    {isExpandedDetails && officialData?.brochureImages && officialData.brochureImages.length > 0 && (
                      <div className="pdp-expanded-presentation animate-fade">
                        <div className="pdp-official-brochure-container">
                          <div className="pdp-brochure-images-stack">
                            {officialData.brochureImages
                              .filter((imgUrl) => {
                                const lower = imgUrl.toLowerCase();
                                if (/_000[123]\.gif/i.test(lower)) return false;
                                if (lower.includes('detail_d00217_0001.png')) return false;
                                if (lower.includes('detail_d01513_0001.jpg')) return false;
                                if (lower.includes('detail_d04086_0001.jpg')) return false;
                                return true;
                              })
                              .map((imgUrl, idx) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt={`${product.name} official detail page ${idx + 1}`}
                                  className="pdp-official-brochure-img"
                                  loading="lazy"
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Official Expand / Fold Product Details Button at the very bottom under full information */}
                    <div className="pdp-expand-toggle-wrapper">
                      <button
                        type="button"
                        className="pdp-expand-details-btn"
                        onClick={() => setIsExpandedDetails(!isExpandedDetails)}
                      >
                        <em>{isExpandedDetails ? 'Fold product details ∧' : 'Expand product details ∨'}</em>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* TAB 2: REVIEW */}
            {activeTab === 'review' && (
              <div className="tab-pane animate-fade">
                <div className="reviews-summary-header">
                  <div className="rating-overview">
                    <div className="overall-score">5.0</div>
                    <div className="stars-row">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <div className="total-ratings-text">Based on {product.reviewsCount || 13} Verified Customer Reviews</div>
                  </div>

                  <div className="ratings-bars-list">
                    <div className="bar-row">
                      <span>5 Star</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: '95%' }}></div></div>
                      <span>95%</span>
                    </div>
                    <div className="bar-row">
                      <span>4 Star</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: '5%' }}></div></div>
                      <span>5%</span>
                    </div>
                    <div className="bar-row">
                      <span>3 Star</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: '0%' }}></div></div>
                      <span>0%</span>
                    </div>
                  </div>
                </div>

                <div className="customer-reviews-stream">
                  <div className="single-review-card">
                    <div className="review-top-row">
                      <span className="reviewer-name">Priya Sharma</span>
                      <span className="verified-badge"><CheckCircle2 size={13} /> Verified Customer</span>
                      <span className="review-date">3 days ago</span>
                    </div>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p className="review-body">
                      Authentic Atomy product in original factory sealed pack. Immediate energy and stamina recovery. Truly exceptional!
                    </p>
                  </div>

                  <div className="single-review-card">
                    <div className="review-top-row">
                      <span className="reviewer-name">Rajesh Kumar</span>
                      <span className="verified-badge"><CheckCircle2 size={13} /> Verified Customer</span>
                      <span className="review-date">1 week ago</span>
                    </div>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p className="review-body">
                      Prompt delivery via Blue Dart with live tracking. Quality is 100% genuine as expected from Atomy India.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PAYMENT / DELIVERY */}
            {activeTab === 'payment' && (
              <div className="tab-pane animate-fade">
                <h3 className="tab-section-heading">Payment Methods & Courier Delivery</h3>
                <div className="policy-grid">
                  <div className="policy-card">
                    <Truck size={24} color="#00A3E0" />
                    <h4>Courier Partners & Timelines</h4>
                    <p>
                      Orders dispatched within 24–48 hours via Blue Dart Express / Delhivery from Gurugram central warehouse.
                      Standard transit time is 2–5 business days across all Indian postal PIN codes.
                    </p>
                  </div>

                  <div className="policy-card">
                    <ShieldCheck size={24} color="#00A3E0" />
                    <h4>Safe Payment Modes</h4>
                    <p>
                      We accept all major Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), and Net Banking with 256-bit SSL encryption.
                    </p>
                  </div>

                  <div className="policy-card">
                    <CheckCircle2 size={24} color="#00A3E0" />
                    <h4>Free Delivery Policy</h4>
                    <p>
                      Public direct retail orders above ₹ 4,500 qualify for 100% Free Standard Courier Shipping nationwide.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: RETURN / EXCHANGE */}
            {activeTab === 'return' && (
              <div className="tab-pane animate-fade">
                <h3 className="tab-section-heading">Return & Exchange Guidelines</h3>
                <div className="policy-grid">
                  <div className="policy-card">
                    <RotateCcw size={24} color="#00A3E0" />
                    <h4>30-Day Customer Satisfaction</h4>
                    <p>
                      Unopened products in their original factory seal can be returned within 30 days of delivery for a replacement or full refund.
                    </p>
                  </div>
                  <div className="policy-card">
                    <ShieldCheck size={24} color="#00A3E0" />
                    <h4>Damaged / Defective Items</h4>
                    <p>
                      In the rare event of transit damage or manufacturing defect, notify customer support within 48 hours for immediate doorstep replacement.
                    </p>
                  </div>
                  <div className="policy-card">
                    <FileText size={24} color="#00A3E0" />
                    <h4>Customer Care Helpline</h4>
                    <p>
                      Reach out to our customer care team at <strong>+91-124-695-9000</strong> or email <strong>atomy_in@atomypark.com</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column (approx 1/4): Floating Sticky Purchase Card (matches User Screenshots 1 & 2) */}
        <div className={`pdp-details-sticky-col ${showFloatingCard ? 'visible' : ''}`}>
              <div className="pdp-floating-purchase-card">
                <div className="pdp-qty-section-title">Qty</div>

                {/* Light Gray Container Box */}
                <div className="pdp-qty-gray-box">
                  <div className="pdp-qty-item-name">{product.name}</div>
                  <div className="pdp-qty-stepper-price-row">
                    {/* Stepper with - and + */}
                    <div className="pdp-official-stepper">
                      <button
                        type="button"
                        className="stepper-btn-minus"
                        onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="stepper-val-box">{qty}</span>
                      <button
                        type="button"
                        className="stepper-btn-plus"
                        onClick={() => setQty((prev) => prev + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price & PV stack on right */}
                    <div className="pdp-qty-price-pv-stack">
                      <div className="pdp-qty-box-price">
                        ₹ {unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      {itemPv > 0 && (
                        <div className="pdp-qty-box-pv">
                          {totalPv.toLocaleString('en-IN')} PV
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Product Price Summary Row */}
                <div className="pdp-total-price-summary-row">
                  <span className="total-label">Total Product Price</span>
                  <div className="total-amount-box">
                    <span className="units-count">{qty} Unit(s)&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                    <span className="bold-total-price">
                      ₹ {totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Total PV Summary Row */}
                <div className="pdp-total-pv-summary-row">
                  <span className="total-label">Total PV</span>
                  <div className="total-pv-box">
                    {totalPv.toLocaleString('en-IN')} PV
                  </div>
                </div>

                {/* Action Buttons: Easy Purchase | Cart, and Buy Now (matches Screenshots 1 & 2) */}
                <div className="pdp-floating-action-buttons">
                  <div className="pdp-action-buttons-subrow">
                    <button
                      type="button"
                      className="pdp-easy-purchase-btn"
                      onClick={() => {
                        onBuyNow && onBuyNow(product, qty);
                      }}
                    >
                      Easy Purchase
                    </button>
                    <button
                      type="button"
                      className="pdp-cart-btn"
                      onClick={() => {
                        onAddToCart && onAddToCart(product, qty);
                        showToast(`Added ${qty} × ${product.name} to cart!`);
                      }}
                    >
                      Cart
                    </button>
                  </div>

                  <button
                    type="button"
                    className="pdp-buy-now-btn"
                    onClick={() => {
                      onBuyNow && onBuyNow(product, qty);
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Related Products Section (Exact Match to User Screenshot 4) */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="pdp-related-section">
          <div className="container">
            <div className="related-header">
              <h3 className="related-main-title">Related Products</h3>
              <p className="related-sub-title">The following products are our recommendations.</p>
            </div>

            <div className="related-carousel-container">
              {/* Circular Left / Right Navigation Buttons */}
              <button
                type="button"
                className="related-arrow-btn left"
                onClick={() => scrollRelated('left')}
                aria-label="Previous recommendations"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="related-cards-track" ref={relatedSliderRef}>
                {relatedProducts.map((item) => (
                  <div key={item.id} className="related-product-card">
                    {/* Square Image Box with Quick Cart in bottom right */}
                    <div className="related-img-box">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="related-card-img"
                        onClick={() => onProductClick && onProductClick(item)}
                      />
                      <button
                        type="button"
                        className="related-quick-cart-btn"
                        onClick={() => {
                          onAddToCart && onAddToCart(item, 1);
                          showToast(`Added ${item.name} to cart!`);
                        }}
                        title="Add to Cart"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>

                    {/* Product Name, Price, Distributor Note, and Likes */}
                    <div className="related-info-box">
                      <h4
                        className="related-item-title"
                        title={item.name}
                        onClick={() => onProductClick && onProductClick(item)}
                      >
                        {item.name}
                      </h4>

                      <div className="related-item-price">
                        {item.formattedPrice || `₹ ${item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      </div>

                      <p className="product-pv-note">
                        {(item.pv || 4000).toLocaleString('en-IN')} PV
                      </p>

                      <div className="related-likes-line">
                        {item.likes || 246} Likes
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="related-arrow-btn right"
                onClick={() => scrollRelated('right')}
                aria-label="Next recommendations"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </section>
      )}
      </div>

      {/* View Product Img Section / Modal (matches User Screenshot 2) */}
      {isImgModalOpen && (
        <div
          className="pdp-img-modal-overlay"
          onClick={() => {
            setIsImgModalOpen(false);
            setIsZoomed(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="View Product Image"
        >
          <div
            className="pdp-img-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close X Button */}
            <button
              type="button"
              className="pdp-modal-close-btn"
              onClick={() => {
                setIsImgModalOpen(false);
                setIsZoomed(false);
              }}
              title="Close image viewer (Esc)"
              aria-label="Close"
            >
              <X size={26} strokeWidth={1.5} />
            </button>

            {/* Main Image Stage with Side Arrows and Zoom */}
            <div className="pdp-modal-stage">
              {currentImgIdx > 0 && (
                <button
                  type="button"
                  className="pdp-modal-nav-btn prev"
                  onClick={handleModalPrev}
                  aria-label="Previous image"
                  title="Previous image"
                >
                  <ChevronLeft size={28} strokeWidth={1.5} />
                </button>
              )}

              <div
                className={`pdp-modal-img-viewport ${isZoomed ? 'zoomed' : ''}`}
                onClick={() => setIsZoomed(!isZoomed)}
                title={isZoomed ? "Click to zoom out" : "Click to zoom in"}
              >
                <img
                  src={galleryImages[currentImgIdx] || product.image}
                  alt={product.name}
                  className="pdp-modal-img"
                />
              </div>

              {currentImgIdx < galleryImages.length - 1 && (
                <button
                  type="button"
                  className="pdp-modal-nav-btn next"
                  onClick={handleModalNext}
                  aria-label="Next image"
                  title="Next image"
                >
                  <ChevronRight size={28} strokeWidth={1.5} />
                </button>
              )}

              {/* Magnifier / Zoom button at bottom-right corner */}
              <button
                type="button"
                className="pdp-modal-zoom-btn"
                onClick={() => setIsZoomed(!isZoomed)}
                title={isZoomed ? "Zoom Out" : "Zoom In"}
                aria-label="Toggle zoom"
              >
                {isZoomed ? (
                  <ZoomOut size={24} strokeWidth={1.5} />
                ) : (
                  <ZoomIn size={24} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Thumbnails row at bottom of modal (Active has black border matching Image 2) */}
            <div className="pdp-modal-thumbs-row">
              {galleryImages.map((thumb, idx) => (
                <div
                  key={idx}
                  className={`pdp-modal-thumb-box ${currentImgIdx === idx ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentImgIdx(idx);
                    setIsZoomed(false);
                  }}
                  title={`View angle ${idx + 1}`}
                >
                  <img src={thumb} alt={`View angle ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <span className="toast-dot"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
