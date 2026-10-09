import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
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
                      className="product-title"
                      title={product.name}
                      onClick={() => onProductClick && onProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.name}
                    </h3>
                    <ProductPriceDisplay product={product} isMember={isMember} />

                    <div className="product-meta-row">
                      <div
                        className="likes-counter"
                        onClick={() => onToggleFavorite && onToggleFavorite(product)}
                        title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
                        style={{ cursor: 'pointer' }}
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
