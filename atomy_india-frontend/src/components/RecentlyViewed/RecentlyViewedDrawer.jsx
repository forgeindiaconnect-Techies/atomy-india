import React from 'react';
import { X, Clock, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import './RecentlyViewedDrawer.css';

export default function RecentlyViewedDrawer({
  isOpen,
  onClose,
  items = [],
  onAddToCart,
  onProductClick,
  onClearAll,
  onRemoveItem
}) {
  if (!isOpen) return null;

  return (
    <div className="recently-viewed-overlay" onClick={onClose}>
      <aside 
        className="recently-viewed-drawer animate-slide-left"
        onClick={(e) => e.stopPropagation()}
        aria-label="Recently Viewed Products"
      >
        {/* Header */}
        <div className="rv-header">
          <div className="rv-header-title">
            <Clock size={20} color="#00A3E0" />
            <span>Recently Viewed ({items.length})</span>
          </div>

          <div className="rv-header-actions">
            {items.length > 0 && (
              <button
                type="button"
                className="rv-clear-all-btn"
                onClick={onClearAll}
                title="Clear all history"
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            )}
            <button
              type="button"
              className="rv-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content / Items List */}
        <div className="rv-body">
          {items.length === 0 ? (
            <div className="rv-empty-state">
              <Clock size={48} className="rv-empty-icon" />
              <h4>No recently viewed products</h4>
              <p>Explore our catalog to find absolute quality wellness and beauty items.</p>
              <button
                type="button"
                className="rv-browse-btn"
                onClick={onClose}
              >
                Explore Shopping Mall
              </button>
            </div>
          ) : (
            <div className="rv-items-list">
              {items.map((prod) => (
                <div key={prod.id} className="rv-item-card">
                  <div 
                    className="rv-item-img"
                    onClick={() => {
                      onProductClick && onProductClick(prod);
                      onClose();
                    }}
                  >
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg';
                      }}
                    />
                  </div>

                  <div className="rv-item-info">
                    <h5 
                      className="rv-item-title"
                      onClick={() => {
                        onProductClick && onProductClick(prod);
                        onClose();
                      }}
                    >
                      {prod.name}
                    </h5>

                    <div className="rv-item-pricing">
                      <span className="rv-item-price">
                        ₹ {(prod.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      {prod.pv && (
                        <span className="rv-item-pv">
                          PV {prod.pv.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="rv-item-actions">
                      <button
                        type="button"
                        className="rv-cart-add-btn"
                        onClick={() => onAddToCart && onAddToCart(prod, 1)}
                      >
                        <ShoppingCart size={13} />
                        <span>Add to Cart</span>
                      </button>

                      {onRemoveItem && (
                        <button
                          type="button"
                          className="rv-remove-btn"
                          onClick={() => onRemoveItem(prod.id)}
                          title="Remove from history"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="rv-footer">
            <button
              type="button"
              className="rv-continue-btn"
              onClick={onClose}
            >
              <span>Continue Shopping</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
