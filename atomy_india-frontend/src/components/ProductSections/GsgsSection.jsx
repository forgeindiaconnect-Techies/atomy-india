import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { GSGS_PRODUCTS, GST_BADGE_IMAGE } from '../../data/mockData';
import { onCatalogUpdate } from '../../services/catalogSyncService';
import ProductPriceDisplay from './ProductPriceDisplay';
import './ProductSection.css';

export default function GsgsSection({ onAddToCart, onProductClick, isMember = false }) {
  const [likedProducts, setLikedProducts] = useState({});
  const [, setCatalogTick] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    return onCatalogUpdate(() => {
      setCatalogTick(t => t + 1);
    });
  }, []);

  const toggleLike = (id) => {
    setLikedProducts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="product-showcase-section gsgs-showcase-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block">
          <h2 className="section-main-title">Atomy India GSGS Product</h2>
          <p className="section-sub-title">Where Local Meets World-Class</p>
        </div>

        {/* Carousel Slider */}
        <div className="product-carousel-wrapper">
          <button
            className="product-nav-arrow prev"
            onClick={() => scrollSlider('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="product-cards-slider gsgs-cards-slider" ref={sliderRef}>
            {GSGS_PRODUCTS.map((product) => {
              const isLiked = likedProducts[product.id];
              const likesCount = (product.likes || 0) + (isLiked ? 1 : 0);

              return (
                <div key={product.id} className="product-card gsgs-product-card">
                  <div className="product-img-wrap gsgs-img-wrap">
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
