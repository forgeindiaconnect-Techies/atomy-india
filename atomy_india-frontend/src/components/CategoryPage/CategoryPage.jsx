import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, X } from 'lucide-react';
import { CATEGORIES, CATEGORY_CONFIGS, GST_BADGE_IMAGE } from '../../data/mockData';
import { getCategoryBanners } from '../../services/bannerService';
import { onCatalogUpdate } from '../../services/catalogSyncService';
import { CarouselPauseIcon, CarouselPlayIcon, CarouselLayersIcon } from '../common/CarouselControlsIcons';
import './CategoryPage.css';

const FALLBACK_PRODUCT_IMAGE = "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg";
const SVG_FALLBACK_IMAGE = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f5f6f8'/%3E%3Cpath d='M100 180 L130 140 L160 170 L200 120 L230 180 Z' fill='%23d0d5dd'/%3E%3Ccircle cx='125' cy='120' r='15' fill='%23d0d5dd'/%3E%3Ctext x='50%25' y='75%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%23888888'%3EAtomy Product%3C/text%3E%3C/svg%3E";

export default function CategoryPage({
  categoryId = 'health',
  onSelectCategory,
  onAddToCart,
  onProductClick,
  onNavigateHome,
  onNavigateBack
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [sortBy, setSortBy] = useState('POPULAR');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isBannerPlaying, setIsBannerPlaying] = useState(true);
  const [isViewAllBannersOpen, setIsViewAllBannersOpen] = useState(false);
  const [, setCatalogTick] = useState(0);

  useEffect(() => {
    return onCatalogUpdate(() => {
      setCatalogTick(t => t + 1);
    });
  }, []);

  // Fallback to health if categoryId not found
  const categoryKey = categoryId ? categoryId.toLowerCase().replace(/[\s-]+/g, '_') : 'health';
  const categoryData = CATEGORY_CONFIGS[categoryKey] || CATEGORY_CONFIGS.health;

  const [liveCatBanners, setLiveCatBanners] = useState(() => getCategoryBanners(categoryKey));

  useEffect(() => {
    const handleUpdate = () => setLiveCatBanners(getCategoryBanners(categoryKey));
    setLiveCatBanners(getCategoryBanners(categoryKey));
    window.addEventListener('atomy:cat-banners-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('atomy:cat-banners-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [categoryKey]);

  const banners = liveCatBanners && liveCatBanners.length > 0
    ? liveCatBanners
    : (categoryData.banners && categoryData.banners.length > 0
        ? categoryData.banners
        : (categoryData.banner ? [categoryData.banner] : []));

  const hasMultipleBanners = banners.length > 1;
  const extendedBanners = hasMultipleBanners
    ? [banners[banners.length - 1], ...banners, banners[0]]
    : banners;

  const [bannerTrackIdx, setBannerTrackIdx] = useState(hasMultipleBanners ? 1 : 0);
  const [isBannerTransitionEnabled, setIsBannerTransitionEnabled] = useState(true);

  // Real 0-based index for counter and pagination indicators
  const realBannerIdx = hasMultipleBanners
    ? (bannerTrackIdx === 0
        ? banners.length - 1
        : bannerTrackIdx === banners.length + 1
          ? 0
          : bannerTrackIdx - 1)
    : 0;

  const bestSliderRef = useRef(null);
  const recSliderRef = useRef(null);
  const allProductsSectionRef = useRef(null);
  const topCategoryRef = useRef(null);

  // Reset to 'All' when category changes
  useEffect(() => {
    setActiveSubcategory('All');
  }, [categoryId]);

  // Handle clicking any category item (sub): directs to All () section down below; clicking All returns normal
  const handleSubcategoryClick = (sub) => {
    setActiveSubcategory(sub);

    if (sub === 'All') {
      // Return to normal: smooth scroll back to the top of the category page
      if (topCategoryRef.current) {
        topCategoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Direct to the All () section down below
      setTimeout(() => {
        if (allProductsSectionRef.current) {
          const navOffset = 120; // Accounts for sticky header & sticky tabs bar
          const elementPosition = allProductsSectionRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };

  // Mouse drag-to-scroll state for Best Product slider
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  // Mouse drag-to-scroll state for Recommendation Product slider
  const [isRecMouseDown, setIsRecMouseDown] = useState(false);
  const [recStartX, setRecStartX] = useState(0);
  const [recScrollLeftPos, setRecScrollLeftPos] = useState(0);

  const handleImageError = (e) => {
    if (e.currentTarget.src !== FALLBACK_PRODUCT_IMAGE) {
      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
    } else {
      e.currentTarget.src = SVG_FALLBACK_IMAGE;
    }
  };

  // Helper to format discount content and authentic prices
  const renderPricing = (product) => {
    const rawPrice = Number(product.price) || 0;
    const currentPrice = `₹ ${rawPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const origNum = Number(product.originalPrice) || rawPrice;

    const discNum = product.discountPercent
      ? Number(String(product.discountPercent).replace(/[^0-9]/g, ''))
      : (origNum > rawPrice ? Math.round(((origNum - rawPrice) / origNum) * 100) : 0);

    const hasOffer = discNum > 0 && origNum > rawPrice;
    const pvValue = product.pv ? product.pv.toLocaleString('en-IN') : Math.round(rawPrice * 4.5).toLocaleString('en-IN');

    if (hasOffer) {
      const originalPrice = `₹ ${origNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return (
        <div className="cate-pricing-wrap">
          <div className="price-strike-row">
            <span className="price-mrp-label">MRP</span>
            <span className="price-original">{originalPrice}</span>
            <span className="price-percent">{discNum}% off</span>
          </div>
          <div className="cate-product-price">
            {currentPrice}
          </div>
          {(product.dpPrice || product.distributorPrice) ? (
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700', marginTop: '2px', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px', display: 'inline-block' }}>
              DP: ₹ {Number(product.dpPrice || product.distributorPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          ) : null}
          <div className="cate-product-pv">
            {pvValue} PV
          </div>
        </div>
      );
    }

    return (
      <div className="cate-pricing-wrap">
        <div className="cate-product-price">
          <span style={{ fontSize: '12px', color: '#777777', fontWeight: '500', marginRight: '5px' }}>MRP</span>
          {currentPrice}
        </div>
        {(product.dpPrice || product.distributorPrice) ? (
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700', marginTop: '2px', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px', display: 'inline-block' }}>
            DP: ₹ {Number(product.dpPrice || product.distributorPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        ) : null}
        <div className="cate-product-pv">
          {pvValue} PV
        </div>
      </div>
    );
  };

  // Reset states when category changes
  useEffect(() => {
    setIsBannerTransitionEnabled(false);
    setBannerTrackIdx(hasMultipleBanners ? 1 : 0);
    setActiveSubcategory('All');
    if (bestSliderRef.current) {
      bestSliderRef.current.scrollLeft = 0;
    }
    if (recSliderRef.current) {
      recSliderRef.current.scrollLeft = 0;
    }
    const timer = setTimeout(() => {
      setIsBannerTransitionEnabled(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [categoryKey, hasMultipleBanners]);

  // Seamless clockwise loop on transition end
  const handleBannerTransitionEnd = () => {
    if (!hasMultipleBanners) return;
    if (bannerTrackIdx >= banners.length + 1) {
      setIsBannerTransitionEnabled(false);
      setBannerTrackIdx(1);
      setTimeout(() => {
        setIsBannerTransitionEnabled(true);
      }, 50);
    } else if (bannerTrackIdx <= 0) {
      setIsBannerTransitionEnabled(false);
      setBannerTrackIdx(banners.length);
      setTimeout(() => {
        setIsBannerTransitionEnabled(true);
      }, 50);
    }
  };

  // Auto-advance banner slides every 4.5 seconds in forward / clockwise direction
  useEffect(() => {
    if (!hasMultipleBanners || !isBannerPlaying) return;
    const interval = setInterval(() => {
      setIsBannerTransitionEnabled(true);
      setBannerTrackIdx((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [hasMultipleBanners, isBannerPlaying]);

  const handleNextBanner = () => {
    if (!hasMultipleBanners) return;
    setIsBannerTransitionEnabled(true);
    setBannerTrackIdx((prev) => prev + 1);
  };

  const handlePrevBanner = () => {
    if (!hasMultipleBanners) return;
    setIsBannerTransitionEnabled(true);
    setBannerTrackIdx((prev) => prev - 1);
  };

  // Left & Right arrow smooth sliding with continuous loop
  const scrollBestSlider = (direction) => {
    if (!bestSliderRef.current) return;
    const container = bestSliderRef.current;
    const cardStep = 244 * 2; // Scroll 2 cards at a time (card: 228px + gap: 16px)
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === 'right') {
      if (container.scrollLeft >= maxScroll - 20) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 20) {
        container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -cardStep, behavior: 'smooth' });
      }
    }
  };

  // Mouse Drag to Scroll
  const handleMouseDown = (e) => {
    if (!bestSliderRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - bestSliderRef.current.offsetLeft);
    setScrollLeftPos(bestSliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !bestSliderRef.current) return;
    const x = e.pageX - bestSliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    if (Math.abs(walk) > 2) {
      e.preventDefault();
      bestSliderRef.current.scrollLeft = scrollLeftPos - walk;
    }
  };

  // Wheel Horizontal Scroll
  const handleSliderWheel = (e) => {
    if (!bestSliderRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      bestSliderRef.current.scrollLeft += e.deltaY;
    }
  };

  // Recommendation Slider Left & Right arrow smooth sliding (305px card + 20px gap)
  const scrollRecSlider = (direction) => {
    if (!recSliderRef.current) return;
    const container = recSliderRef.current;
    const cardStep = (305 + 20) * 2; // Scroll 2 cards at a time
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === 'right') {
      if (container.scrollLeft >= maxScroll - 20) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 20) {
        container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -cardStep, behavior: 'smooth' });
      }
    }
  };

  const handleRecMouseDown = (e) => {
    if (!recSliderRef.current) return;
    setIsRecMouseDown(true);
    setRecStartX(e.pageX - recSliderRef.current.offsetLeft);
    setRecScrollLeftPos(recSliderRef.current.scrollLeft);
  };

  const handleRecMouseLeave = () => {
    setIsRecMouseDown(false);
  };

  const handleRecMouseUp = () => {
    setIsRecMouseDown(false);
  };

  const handleRecMouseMove = (e) => {
    if (!isRecMouseDown || !recSliderRef.current) return;
    const x = e.pageX - recSliderRef.current.offsetLeft;
    const walk = (x - recStartX) * 1.2;
    if (Math.abs(walk) > 2) {
      e.preventDefault();
      recSliderRef.current.scrollLeft = recScrollLeftPos - walk;
    }
  };

  const handleRecSliderWheel = (e) => {
    if (!recSliderRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      recSliderRef.current.scrollLeft += e.deltaY;
    }
  };

  const getSubcategoryCount = (sub) => {
    if (!categoryData.allProducts) return 0;
    if (sub === 'All') return categoryData.allProducts.length;
    const subLower = sub.toLowerCase();
    return categoryData.allProducts.filter((p) => {
      const subTopicMatch = p.subTopic && p.subTopic.toLowerCase() === subLower;
      const nameMatch = p.name && p.name.toLowerCase().includes(subLower);
      const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().includes(subLower));
      const catMatch = p.category && p.category.toLowerCase().includes(subLower);
      return subTopicMatch || nameMatch || tagMatch || catMatch;
    }).length;
  };

  // Filter products by subcategory
  const getFilteredProducts = () => {
    let list = [...(categoryData.allProducts || [])];
    if (activeSubcategory && activeSubcategory !== 'All') {
      const subLower = activeSubcategory.toLowerCase();
      list = list.filter((p) => {
        const subTopicMatch = p.subTopic && p.subTopic.toLowerCase() === subLower;
        const nameMatch = p.name && p.name.toLowerCase().includes(subLower);
        const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().includes(subLower));
        const catMatch = p.category && p.category.toLowerCase().includes(subLower);
        return subTopicMatch || nameMatch || tagMatch || catMatch;
      });
    }

    if (sortBy === 'PRICE_LOW_HIGH') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'PRICE_HIGH_LOW') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'LIKES') {
      const getLikes = (item) => {
        if (typeof item.likes === 'number') return item.likes;
        return parseInt(String(item.likes || '0').replace(/[^0-9]/g, '')) || 0;
      };
      return list.sort((a, b) => getLikes(b) - getLikes(a));
    }
    return list; // POPULAR / default
  };

  const filteredProducts = getFilteredProducts();

  const sortOptions = [
    { label: 'Popular', value: 'POPULAR' },
    { label: 'Review / Likes', value: 'LIKES' },
    { label: 'Price (lowest)', value: 'PRICE_LOW_HIGH' },
    { label: 'Price (highest)', value: 'PRICE_HIGH_LOW' }
  ];

  return (
    <div className="category-landing-page" ref={topCategoryRef}>
      {/* 1. Category Switcher Dropdown Top Bar */}
      <div className="cate-top-bar">
        <div className="cate-top-dropdown-container">
          <button
            type="button"
            className={`cate-top-toggle-btn ${isDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
          >
            <h2>{categoryData.name}</h2>
            <ChevronDown size={22} className="cate-dropdown-arrow" />
          </button>

          {isDropdownOpen && (
            <div className="cate-dropdown-menu">
              <ul>
                {CATEGORIES.map((cat) => {
                  const isSelected = cat.id === categoryData.id;
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className={`cate-dropdown-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onSelectCategory(cat.id);
                        }}
                      >
                        {cat.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="container category-container">
        {/* 2. Category Hero Banner (matches official in.atomy.com) */}
        {banners.length > 0 && (
          <div className="cate-mnBn">
            <div
              className="cate-mnBn-track"
              style={{
                transform: `translateX(-${bannerTrackIdx * 100}%)`,
                transition: isBannerTransitionEnabled
                  ? 'transform 0.65s cubic-bezier(0.25, 1, 0.4, 1)'
                  : 'none'
              }}
              onTransitionEnd={handleBannerTransitionEnd}
            >
              {extendedBanners.map((bn, eIdx) => {
                const itemRealIdx = hasMultipleBanners
                  ? (eIdx === 0
                      ? banners.length - 1
                      : eIdx === banners.length + 1
                        ? 0
                        : eIdx - 1)
                  : 0;
                const isActive = itemRealIdx === realBannerIdx;
                return (
                  <div
                    key={eIdx}
                    className={`slideBx ${isActive ? 'active' : ''}`}
                  >
                    <div className="slideBx_img">
                      <img
                        src={bn.image}
                        alt={bn.title}
                        className="cate-hero-img"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="slideBx_txt">
                      <h1 className="slideBx_txt_tit">{bn.title}</h1>
                      {bn.subtitle && <p className="slideBx_txt_sub">{bn.subtitle}</p>}
                      <div className="slideBx_txt_arw" title={bn.title}>
                        <div className="arrow-draw-wrapper">
                          <svg
                            className="half-arrow-svg"
                            viewBox="0 0 68 18"
                            width="68"
                            height="18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 9H62L54 3M62 9L54 15"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Multi-slide banner navigation controls (matches Image 1) */}
            {banners.length > 1 && (
              <div className="swiper-control btn_bk">
                <button
                  type="button"
                  className="swiper-button-prev"
                  onClick={handlePrevBanner}
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="swiper-button-next"
                  onClick={handleNextBanner}
                  aria-label="Next Slide"
                >
                  <ChevronRight size={22} />
                </button>
                <div className="auto_set">
                  <span className="pg_num">
                    {realBannerIdx + 1}/{banners.length}
                  </span>
                  <button
                    type="button"
                    className="auto-btn"
                    onClick={() => setIsBannerPlaying(!isBannerPlaying)}
                    aria-label={isBannerPlaying ? "Pause" : "Play"}
                    title={isBannerPlaying ? "Pause" : "Play"}
                  >
                    {isBannerPlaying ? (
                      <CarouselPauseIcon size={12} />
                    ) : (
                      <CarouselPlayIcon size={12} />
                    )}
                  </button>
                  <button
                    type="button"
                    className="view-btn"
                    aria-label="View all banners"
                    title="View all banners"
                    onClick={() => setIsViewAllBannersOpen(true)}
                  >
                    <CarouselLayersIcon size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Subcategory Tab Filter (matches user's Image 1) */}
        <div className="cate-subcategories-bar">
          <div className="cate-subcategories-list">
            {(categoryData.subcategories || []).map((sub, idx) => (
              <button
                key={idx}
                type="button"
                className={`cate-sub-tab-btn ${activeSubcategory === sub ? 'active' : ''}`}
                onClick={() => handleSubcategoryClick(sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Best Product Section with Left/Right Slider (matches user's Image 3) */}
        {categoryData.bestProducts && categoryData.bestProducts.length > 0 && (
          <section className="cate-best-section">
            <div className="cate-section-heading">
              <h3><strong>{categoryData.name} Best Product</strong></h3>
            </div>

            <div className="cate-best-slider-wrapper">
              <button
                type="button"
                className="cate-slider-arrow left"
                onClick={() => scrollBestSlider('left')}
                aria-label="Previous Products"
              >
                <ChevronLeft size={24} />
              </button>

              <div
                className={`cate-best-cards-row ${isMouseDown ? 'dragging' : ''}`}
                ref={bestSliderRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleSliderWheel}
              >
                {categoryData.bestProducts.map((product) => (
                  <div key={product.id} className="cate-product-card">
                    <div className="cate-product-img-box">
                      {product.gstReduced && (
                        <img
                          src={GST_BADGE_IMAGE}
                          alt="GST Reduce"
                          className="cate-flag-gst"
                        />
                      )}
                      {product.isVeg && (
                        <span className="cate-flag-veg">VEG</span>
                      )}
                      {product.isNonVeg && (
                        <span className="cate-flag-nonveg">NON-VEG</span>
                      )}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="cate-product-img"
                        onError={handleImageError}
                        loading="lazy"
                        onClick={() => onProductClick && onProductClick(product)}
                      />
                      <button
                        type="button"
                        className="cate-cart-btn"
                        onClick={() => onAddToCart && onAddToCart(product)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingCart size={19} />
                      </button>
                    </div>

                    <div className="cate-product-info">
                      <h4
                        className="cate-product-name"
                        title={product.name}
                        onClick={() => onProductClick && onProductClick(product)}
                      >
                        {product.name}
                      </h4>
                      {renderPricing(product)}
                      {product.likes && (
                        <div className="cate-product-meta">
                          <span className="cate-likes-text">{product.likes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="cate-slider-arrow right"
                onClick={() => scrollBestSlider('right')}
                aria-label="Next Products"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </section>
        )}

        {/* Recommendation Product Section (matches official in.atomy.com in categories that have it) */}
        {categoryData.recommendationProducts && categoryData.recommendationProducts.length > 0 && (
          <section className="cate-best-section cate-recommendation-section">
            <div className="cate-section-heading">
              <h3><strong>{categoryData.name} Recommendation Product</strong></h3>
            </div>

            <div className="cate-best-slider-wrapper">
              <button
                type="button"
                className="cate-slider-arrow left"
                onClick={() => scrollRecSlider('left')}
                aria-label="Previous Recommendation Products"
              >
                <ChevronLeft size={24} />
              </button>

              <div
                className={`cate-best-cards-row ${isRecMouseDown ? 'dragging' : ''}`}
                ref={recSliderRef}
                onMouseDown={handleRecMouseDown}
                onMouseLeave={handleRecMouseLeave}
                onMouseUp={handleRecMouseUp}
                onMouseMove={handleRecMouseMove}
                onWheel={handleRecSliderWheel}
              >
                {categoryData.recommendationProducts.map((product) => (
                  <div key={product.id} className="cate-product-card">
                    <div className="cate-product-img-box">
                      {product.gstReduced && (
                        <img
                          src={GST_BADGE_IMAGE}
                          alt="GST Reduce"
                          className="cate-flag-gst"
                        />
                      )}
                      {product.isVeg && (
                        <span className="cate-flag-veg">VEG</span>
                      )}
                      {product.isNonVeg && (
                        <span className="cate-flag-nonveg">NON-VEG</span>
                      )}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="cate-product-img"
                        onError={handleImageError}
                        loading="lazy"
                        onClick={() => onProductClick && onProductClick(product)}
                      />
                      <button
                        type="button"
                        className="cate-cart-btn"
                        onClick={() => onAddToCart && onAddToCart(product)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingCart size={19} />
                      </button>
                    </div>

                    <div className="cate-product-info">
                      <h4
                        className="cate-product-name"
                        title={product.name}
                        onClick={() => onProductClick && onProductClick(product)}
                      >
                        {product.name}
                      </h4>
                      {renderPricing(product)}
                      {product.likes && (
                        <div className="cate-product-meta">
                          <span className="cate-likes-text">{product.likes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="cate-slider-arrow right"
                onClick={() => scrollRecSlider('right')}
                aria-label="Next Recommendation Products"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </section>
        )}

        {/* 5. Main Category Products Catalog Grid */}
        <section className="cate-all-products-section" ref={allProductsSectionRef}>
          {/* Controls Bar: Total Count + Sort Dropdown */}
          <div className="cate-sort-controls-bar">
            <div className="cate-total-count">
              All (<strong>{filteredProducts.length}</strong>)
            </div>

            <div className="cate-sort-dropdown-wrap">
              <button
                type="button"
                className="cate-sort-select-btn"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              >
                <span>{sortOptions.find((opt) => opt.value === sortBy)?.label || 'Popular'}</span>
                <ChevronDown size={14} />
              </button>

              {isSortDropdownOpen && (
                <div className="cate-sort-dropdown-menu">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`cate-sort-option ${sortBy === opt.value ? 'selected' : ''}`}
                      onClick={() => {
                        setSortBy(opt.value);
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid of All Products */}
          <div className="cate-products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="cate-product-card">
                <div className="cate-product-img-box">
                  {product.gstReduced && (
                    <img
                      src={GST_BADGE_IMAGE}
                      alt="GST Reduce"
                      className="cate-flag-gst"
                    />
                  )}
                  {product.isVeg && (
                    <span className="cate-flag-veg">VEG</span>
                  )}
                  {product.isNonVeg && (
                    <span className="cate-flag-nonveg">NON-VEG</span>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="cate-product-img"
                    onError={handleImageError}
                    loading="lazy"
                    onClick={() => onProductClick && onProductClick(product)}
                  />
                  <button
                    type="button"
                    className="cate-cart-btn"
                    onClick={() => onAddToCart && onAddToCart(product)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart size={19} />
                  </button>
                </div>

                <div className="cate-product-info">
                  <h4
                    className="cate-product-name"
                    title={product.name}
                    onClick={() => onProductClick && onProductClick(product)}
                  >
                    {product.name}
                  </h4>
                  {renderPricing(product)}
                  {product.likes && (
                    <div className="cate-product-meta">
                      <span className="cate-likes-text">{product.likes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Category Banners View All Modal */}
      {isViewAllBannersOpen && (
        <div
          className="view-all-modal-backdrop"
          onClick={() => setIsViewAllBannersOpen(false)}
        >
          <div
            className="view-all-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="View all banners"
          >
            <div className="view-all-modal-header">
              <h3 className="view-all-modal-title">View all</h3>
              <button
                type="button"
                className="view-all-modal-close"
                onClick={() => setIsViewAllBannersOpen(false)}
                aria-label="Close"
              >
                <X size={26} strokeWidth={1.8} />
              </button>
            </div>
            <div className="view-all-modal-body">
              <div className="view-all-banners-list">
                {banners.map((bn, idx) => (
                  <div
                    key={idx}
                    className={`view-all-banner-item ${idx === realBannerIdx ? 'active' : ''}`}
                    onClick={() => {
                      setIsBannerTransitionEnabled(true);
                      setBannerTrackIdx(hasMultipleBanners ? idx + 1 : idx);
                      setIsViewAllBannersOpen(false);
                    }}
                  >
                    <div className="view-all-banner-thumb-wrapper">
                      <img
                        src={bn.image}
                        alt={bn.title}
                        className="view-all-banner-thumb"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="view-all-banner-info">
                      <span className="view-all-banner-num">{String(idx + 1).padStart(2, '0')}</span>
                      <h4 className="view-all-banner-title">{bn.title}</h4>
                      {bn.subtitle && <p className="view-all-banner-sub">{bn.subtitle}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
