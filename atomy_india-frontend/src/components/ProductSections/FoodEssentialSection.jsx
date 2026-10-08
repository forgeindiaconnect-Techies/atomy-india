import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { FOOD_ESSENTIAL_PRODUCTS } from '../../data/mockData';
import { onCatalogUpdate } from '../../services/catalogSyncService';
import ProductPriceDisplay from './ProductPriceDisplay';
import './ProductSection.css';

export default function FoodEssentialSection({ onAddToCart, onProductClick, isMember = false }) {
  const [, setCatalogTick] = useState(0);

  useEffect(() => {
    return onCatalogUpdate(() => {
      setCatalogTick(t => t + 1);
    });
  }, []);

  return (
    <section className="product-showcase-section food-essential-section">
      <div className="container">
        <div className="food-essential-wrap">
          {/* Left Title Column */}
          <div className="food-essential-title-col">
            <h2 className="food-section-title">Atomy Food Essential</h2>
            <p className="food-section-subtitle">The Foundation of Your Daily Wellness</p>
          </div>

          {/* Right Product Items (No Card Box, 100% Authentic Atomy Layout) */}
          <div className="food-essential-grid">
            {FOOD_ESSENTIAL_PRODUCTS.map((product) => {
              const price = Number(product.price) || 0;
              const origPrice = Number(product.originalPrice) || price;
              const discNum = product.discountPercent
                ? Number(String(product.discountPercent).replace(/[^0-9]/g, ''))
                : (origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0);
              const hasOffer = discNum > 0 && origPrice > price;

              return (
                <div key={product.id} className="food-product-item">
                  <div className="food-img-container">
                    <div className="food-circle-img-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="food-product-img"
                        loading="lazy"
                        onClick={() => onProductClick && onProductClick(product)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    <div
                      className="food-tag-pill"
                      style={{ backgroundColor: product.tagColor || '#ceb576' }}
                    >
                      {product.tag}
                    </div>
                  </div>

                  <div className="food-info-container">
                    <div className="food-header-row">
                      <h3
                        className="food-product-title"
                        title={product.name}
                        onClick={() => onProductClick && onProductClick(product)}
                        style={{ cursor: 'pointer' }}
                      >
                        {product.name}
                      </h3>
                      <button
                        className="product-cart-quick-btn food-cart-btn"
                        onClick={() => onAddToCart && onAddToCart(product)}
                        aria-label={`Add ${product.name} to cart`}
                        title="Add to Cart"
                      >
                        <ShoppingCart size={17} />
                      </button>
                    </div>

                    <ProductPriceDisplay product={product} isMember={isMember} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
