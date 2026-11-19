import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { onCatalogUpdate } from '../../services/catalogSyncService';
import { GST_BADGE_IMAGE } from '../../data/mockData';
import ProductPriceDisplay from './ProductPriceDisplay';
import './ProductSection.css';

export default function BrandShowcaseSection({
  title,
  subtitle,
  bannerImage,
  bannerLink = "#",
  products = [],
  onAddToCart,
  onProductClick,
  isMember = false
}) {
  const [, setCatalogTick] = useState(0);

  useEffect(() => {
    return onCatalogUpdate(() => {
      setCatalogTick(t => t + 1);
    });
  }, []);

  const isHealthSection = Boolean(title && title.toLowerCase().includes('health'));

  return (
    <section className={`product-showcase-section brand-showcase-section ${isHealthSection ? 'health-showcase-section' : ''}`}>
      <div className="container">
        {/* Section Title */}
        <div className="section-header-block">
          <h2 className="section-main-title">{title}</h2>
          <p className="section-sub-title">{subtitle}</p>
        </div>

        {/* Brand Hero Banner */}
        {bannerImage && (
          <div className="brand-hero-banner">
            <a href={bannerLink} className="brand-banner-link">
              <img
                src={bannerImage}
                alt={title}
                className="brand-banner-img"
                loading="lazy"
              />
            </a>
          </div>
        )}

        {/* Horizontal Products Grid */}
        <div className="brand-products-grid">
          {products.map((product) => {
            const price = Number(product.price) || 0;
            const origPrice = Number(product.originalPrice) || price;
            const discNum = product.discountPercent
              ? Number(String(product.discountPercent).replace(/[^0-9]/g, ''))
              : (origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0);
            const hasOffer = discNum > 0 && origPrice > price;

            const isGstReduced = Boolean(
              product.gstReduced === true ||
              (Array.isArray(product.tags) && product.tags.some(t => String(t).toUpperCase().includes('GST'))) ||
              (typeof product.tags === 'string' && product.tags.toUpperCase().includes('GST'))
            );

            return (
              <div
                key={product.id}
                className="brand-product-card"
                onClick={() => onProductClick && onProductClick(product)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onProductClick && onProductClick(product);
                  }
                }}
              >
                <div className="brand-product-img-wrap">
                  {isGstReduced && (
                    <img
                      src={GST_BADGE_IMAGE}
                      alt="GST Reduced"
                      className="brand-gst-badge"
                      loading="lazy"
                    />
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="brand-product-img"
                    loading="lazy"
                  />
                  <button
                    className="product-cart-quick-btn brand-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart && onAddToCart(product);
                    }}
                    aria-label={`Add ${product.name} to cart`}
                    title="Add to Cart"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>

                <div className="brand-product-info">
                  <h3
                    className="brand-product-title notranslate"
                    translate="no"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <ProductPriceDisplay product={product} isMember={isMember} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
