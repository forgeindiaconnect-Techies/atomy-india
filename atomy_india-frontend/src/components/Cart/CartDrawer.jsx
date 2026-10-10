import React from 'react';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQty, onRemoveItem, onCheckout, onViewCartPage }) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">Shopping Cart ({cartItems.reduce((acc, i) => acc + i.qty, 0)})</div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="cart-drawer-items-list">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} strokeWidth={1.2} />
              <p>Your shopping cart is currently empty</p>
              {onViewCartPage && (
                <button
                  className="cart-view-page-btn"
                  onClick={() => {
                    onClose();
                    onViewCartPage();
                  }}
                  style={{
                    marginTop: '12px',
                    padding: '8px 18px',
                    border: '1px solid #00b6f0',
                    color: '#00b6f0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Go to Cart Page
                </button>
              )}
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <div className="cart-item-price">
                    ₹ {(item.price * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  {Boolean(item.pv || item.price) && (
                    <div style={{ fontSize: '12px', color: '#00A3E0', fontWeight: '700', marginTop: '1px' }}>
                      {((item.pv || Math.round((item.price || 1000) * 4.5)) * item.qty).toLocaleString('en-IN')} PV
                    </div>
                  )}
                  <div className="cart-item-qty-row">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      >
                        -
                      </button>
                      <span className="qty-val">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-item-remove-btn"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span>Estimated Total:</span>
              <span>₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              {onViewCartPage && (
                <button
                  type="button"
                  className="cart-view-page-btn"
                  onClick={() => {
                    onClose();
                    onViewCartPage();
                  }}
                  style={{
                    flex: '1',
                    height: '46px',
                    border: '1px solid #00b6f0',
                    color: '#00b6f0',
                    background: '#fff',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  View Cart Page
                </button>
              )}
              <button
                className="cart-checkout-btn"
                onClick={onCheckout}
                style={{ flex: '1.2', height: '46px' }}
              >
                Proceed to Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
