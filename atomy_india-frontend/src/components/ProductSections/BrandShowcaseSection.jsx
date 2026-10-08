import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { onCatalogUpdate } from '../../services/catalogSyncService';
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

  return (
    <section className="product-showcase-section brand-showcase-section">
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

            return (
              <div key={product.id} className="brand-product-card">
                <div className="brand-product-img-wrap">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="brand-product-img"
                    loading="lazy"
                    onClick={() => onProductClick && onProductClick(product)}
                    style={{ cursor: 'pointer' }}
                  />
                  <button
                    className="product-cart-quick-btn brand-cart-btn"
                    onClick={() => onAddToCart && onAddToCart(product)}
                    aria-label={`Add ${product.name} to cart`}
                    title="Add to Cart"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>

                <div className="brand-product-info">
                  <h3
                    className="brand-product-title"
                    title={product.name}
                    onClick={() => onProductClick && onProductClick(product)}
                    style={{ cursor: 'pointer' }}
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
