import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { BEST_PRODUCTS, GST_BADGE_IMAGE } from '../../data/mockData';
import { onCatalogUpdate } from '../../services/catalogSyncService';
import './ProductSection.css';

export default function BestProductsSection({ onAddToCart, onProductClick }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [likedProducts, setLikedProducts] = useState({});
  const [, setCatalogTick] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    return onCatalogUpdate(() => {
      setCatalogTick(t => t + 1);
    });
  }, []);

  const tabs = ['ALL', 'BEST', 'NEW', 'RECOMMENDATION'];

  const filteredProducts = BEST_PRODUCTS.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.categoryTab.includes(activeTab);
  });

  const toggleLike = (id) => {
    setLikedProducts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="product-showcase-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block">
          <h2 className="section-main-title">Atomy India Shopping Mall BEST</h2>
          <p className="section-sub-title">Absolute Quality Absolute Price</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs-container">
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

        {/* Product Carousel Slider */}
        <div className="product-carousel-wrapper">
          <button
            className="product-nav-arrow prev"
            onClick={() => scrollSlider('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="product-cards-slider" ref={sliderRef}>
            {filteredProducts.map((product) => {
              const isLiked = likedProducts[product.id];
              const likesCount = (product.likes || 0) + (isLiked ? 1 : 0);

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
                      className="product-title"
                      title={product.name}
                      onClick={() => onProductClick && onProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.name}
                    </h3>
                    {(() => {
                      const price = Number(product.price) || 0;
                      const origPrice = Number(product.originalPrice) || price;
                      const discNum = product.discountPercent
                        ? Number(String(product.discountPercent).replace(/[^0-9]/g, ''))
                        : (origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0);
                      const hasOffer = discNum > 0 && origPrice > price;

                      return (
                        <div className="product-price-block">
                          {hasOffer && (
                            <div className="price-strike-row">
                              <span className="price-mrp-label">MRP</span>
                              <span className="price-original">
                                ₹ {origPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="price-percent">{discNum}% off</span>
                            </div>
                          )}
                          <p className="product-price">
                            {!hasOffer && <span className="price-mrp-label" style={{ marginRight: '5px' }}>MRP</span>}
                            {product.price !== undefined && product.price !== null
                              ? `₹ ${Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : (product.formattedPrice || '')}
                          </p>
                          {(product.dpPrice || product.distributorPrice) ? (
                            <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700', marginTop: '3px', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                              DP: ₹ {Number(product.dpPrice || product.distributorPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })()}
                    <p className="product-pv-note">
                      {(product.pv || 4000).toLocaleString('en-IN')} PV
                    </p>

                    <div className="product-meta-row">
                      <div
                        className="likes-counter"
                        onClick={() => toggleLike(product.id)}
                      >
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

          <button
            className="product-nav-arrow next"
            onClick={() => scrollSlider('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
