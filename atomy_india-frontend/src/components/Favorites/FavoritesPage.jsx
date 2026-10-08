import React from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import './FavoritesPage.css';

export default function FavoritesPage({
  favorites = [],
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onProductClick,
  onNavigateHome
}) {
  return (
    <div className="favorites-page-container container">
      {/* Breadcrumb Navigation */}
      <nav className="favorites-breadcrumbs" aria-label="Breadcrumb">
        <span className="breadcrumb-item" onClick={onNavigateHome} style={{ cursor: 'pointer' }}>
          HOME
        </span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-item" onClick={onNavigateHome} style={{ cursor: 'pointer' }}>
          Shopping Mall
        </span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">Favorites</span>
      </nav>

      {/* Page Header */}
      <div className="favorites-page-header">
        <div className="favorites-header-content">
          <div className="favorites-title-row">
            <Heart className="favorites-title-icon" size={28} />
            <h1 className="favorites-page-title">My Favorites</h1>
            <span className="favorites-count-badge">{favorites.length}</span>
          </div>
          <p className="favorites-page-subtitle">
            Saved items from Atomy India catalog. Add items to your cart or purchase anytime.
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            type="button"
            className="favorites-clear-btn"
            onClick={() => {
              if (window.confirm('Are you sure you want to remove all items from favorites?')) {
                favorites.forEach((p) => onToggleFavorite(p));
              }
            }}
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Content: Empty State vs Grid */}
      {favorites.length === 0 ? (
        <div className="favorites-empty-box">
          <div className="empty-icon-circle">
            <Heart size={48} className="empty-heart-icon" />
          </div>
          <h2 className="empty-title">Your Favorites list is empty</h2>
          <p className="empty-desc">
            Explore Atomy's range of Absolute Quality, Absolute Price products and click the heart icon on any item to save it here.
          </p>
          <button
            type="button"
            className="empty-browse-btn"
            onClick={onNavigateHome}
          >
            <ShoppingBag size={18} />
            <span>Start Shopping</span>
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((prod) => {
            const unitPrice = prod.price || 1350;
            const pv = prod.pv || 6700;

            return (
              <div key={prod.id} className="favorite-card">
                {/* Remove Favorite Button */}
                <button
                  type="button"
                  className="favorite-remove-btn"
                  title="Remove from Favorites"
                  onClick={() => onToggleFavorite(prod)}
                  aria-label="Remove from Favorites"
                >
                  <Heart size={20} className="filled-heart" />
                </button>

                {/* Product Thumbnail */}
                <div
                  className="favorite-img-wrapper"
                  onClick={() => onProductClick && onProductClick(prod)}
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="favorite-img"
                    loading="lazy"
                  />
                  {prod.badge && (
                    <span className="favorite-badge">{prod.badge}</span>
                  )}
                </div>

                {/* Details */}
                <div className="favorite-card-body">
                  <div className="favorite-category-tag">
                    {prod.category?.toUpperCase() || 'ATOMY'}
                  </div>

                  <h3
                    className="favorite-product-name"
                    title={prod.name}
                    onClick={() => onProductClick && onProductClick(prod)}
                  >
                    {prod.name}
                  </h3>

                  <div className="favorite-pricing-row">
                    <div className="favorite-price">
                      ₹ {unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    {pv > 0 && (
                      <div className="favorite-pv">
                        {pv.toLocaleString('en-IN')} PV
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="favorite-actions-row">
                    <button
                      type="button"
                      className="favorite-cart-btn"
                      onClick={() => onAddToCart && onAddToCart(prod, 1)}
                    >
                      <ShoppingCart size={16} />
                      <span>Cart</span>
                    </button>
                    <button
                      type="button"
                      className="favorite-buy-btn"
                      onClick={() => onBuyNow && onBuyNow(prod, 1)}
                    >
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
