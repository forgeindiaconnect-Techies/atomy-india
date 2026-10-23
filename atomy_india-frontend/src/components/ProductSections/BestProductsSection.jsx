import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { BEST_PRODUCTS, GST_BADGE_IMAGE } from '../../data/mockData';
import { onCatalogUpdate } from '../../services/catalogSyncService';
import { getProductStats } from '../../services/productStatsService';
import ProductPriceDisplay from './ProductPriceDisplay';
import './ProductSection.css';

export default function BestProductsSection({
  onAddToCart,
  onProductClick,
  isMember = false,
  favorites = [],
  onToggleFavorite
}) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [, setCatalogTick] = useState(0);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth <= 768;
    return false;
  });
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sliderRef = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    return onCatalogUpdate(() => {
      setCatalogTick(t => t + 1);
    });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset expansion when switching category tabs
  useEffect(() => {
    setIsMobileExpanded(false);
  }, [activeTab]);

  const tabs = ['ALL', 'BEST', 'NEW', 'RECOMMENDATION', 'HEALTH', 'BEAUTY', 'LIVING', 'FOOD'];

  const filteredProducts = BEST_PRODUCTS.filter((item) => {
    if (activeTab === 'ALL') return true;
    if (item.categoryTab && Array.isArray(item.categoryTab) && item.categoryTab.includes(activeTab)) return true;
    if (item.category && item.category.toUpperCase() === activeTab) return true;
    if (activeTab === 'LIVING' && (item.category === 'home' || item.category === 'personal_care')) return true;
    return false;
  });

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTabsScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollTabsRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  // On mobile: limit to 10 products (5 rows of 2), remaining shown via View More button
  const visibleProducts = isMobile && !isMobileExpanded
    ? filteredProducts.slice(0, 10)
    : filteredProducts;

  const hiddenCount = filteredProducts.length - 10;

  return (
    <section className="product-showcase-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block">
          <h2 className="section-main-title">Atomy India Shopping Mall BEST</h2>
          <p className="section-sub-title">Absolute Quality Absolute Price</p>
        </div>

        {/* Filter Tabs with Sideways Scroll Indication on Mobile */}
        <div className={`filter-tabs-wrapper ${canScrollRight ? 'has-overflow-right' : ''}`}>
          <div className="mobile-swipe-hint-pill">
            <span>Scroll sections</span>
            <ChevronRight size={13} className="swipe-hint-bounce-arrow" />
          </div>

          <div
            className="filter-tabs-container"
            ref={tabsRef}
            onScroll={handleTabsScroll}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`filter-tab-pill ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {canScrollRight && (
            <button
              type="button"
              className="tabs-scroll-indicator-arrow"
              onClick={scrollTabsRight}
              aria-label="Scroll more sections"
              title="More sections"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Product Display: 2-in-a-row grid on mobile, slider on desktop */}
        <div className="product-carousel-wrapper">
          {!isMobile && (
            <button
              className="product-nav-arrow prev"
              onClick={() => scrollSlider('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div
            className={`product-cards-slider best-products-display ${isMobile ? 'mobile-two-col-grid' : 'desktop-slider'}`}
            ref={sliderRef}
          >
            {visibleProducts.map((product) => {
              const isLiked = favorites.some((f) => f.id === product.id);
              const stats = getProductStats(product, isLiked);
              const likesCount = stats.likes;

              return (
                <div key={product.id} className="product-card">
                  {/* Product Image Box */}
                  <div className="product-img-wrap">
                    {product.rank && (
                      <div className="product-rank-badge">{product.rank}</div>
                    )}
                    {product.gstReduced && (
                      <img
                        src={GST_BADGE_IMAGE}
                        alt="GST Reduced"
                        className="product-gst-badge"
                      />
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-img"
                      loading="lazy"
                      onClick={() => onProductClick && onProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    />
                    <button
                      className="product-cart-quick-btn"
                      onClick={() => onAddToCart && onAddToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                      title="Add to Cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="product-info-wrap">
                    <h3
                      className="product-title notranslate"
                      translate="no"
                      title={product.name}
                      onClick={() => onProductClick && onProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.name}
                    </h3>
                    <ProductPriceDisplay product={product} isMember={isMember} />

                    <div className="product-meta-row">
                      <div className="likes-counter">
                        <Heart
                          size={14}
                          fill={isLiked ? "#e53935" : "none"}
                          color={isLiked ? "#e53935" : "#888888"}
                        />
                        <span>{likesCount} Likes</span>
                      </div>
                    </div>

                    {Boolean(product.tags) && (
                      <div className="product-tags-row">
                        {(Array.isArray(product.tags)
                          ? product.tags
                          : typeof product.tags === 'string'
                            ? product.tags.split(',').map(t => t.trim()).filter(Boolean)
                            : []
                        ).map((tag, tIdx) => (
                          <span key={tIdx}>{tag}</span>
                        ))}
                      </div>
                    )}

                    {product.freeDelivery && (
                      <span className="free-delivery-badge">Free Delivery</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isMobile && (
            <button
              className="product-nav-arrow next"
              onClick={() => scrollSlider('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Mobile View More / Show Less Button below the 10 products (5 rows) */}
        {isMobile && filteredProducts.length > 10 && (
          <div className="best-products-more-container">
            <button
              type="button"
              className="best-products-more-btn"
              onClick={() => setIsMobileExpanded(prev => !prev)}
            >
              <span>
                {isMobileExpanded
                  ? 'Show Less'
                  : `View More Products (+${hiddenCount})`}
              </span>
              {isMobileExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
