import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { onCatalogUpdate } from '../../services/catalogSyncService';
import './ProductSection.css';

export default function BrandShowcaseSection({
  title,
  subtitle,
  bannerImage,
  bannerLink = "#",
  products = [],
  onAddToCart,
  onProductClick
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

                  <p className="product-pv-note">
                    {(product.pv || 18000).toLocaleString('en-IN')} PV
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
