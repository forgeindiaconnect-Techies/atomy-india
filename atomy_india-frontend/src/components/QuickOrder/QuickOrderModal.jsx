import React, { useState, useMemo } from 'react';
import { 
  X, 
  Zap, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  Search, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ALL_CATALOG_PRODUCTS } from '../../data/mockData';
import './QuickOrderModal.css';

// Popular quick order shortcuts
const POPULAR_SHORTCUTS = [
  { id: 'D00101', label: 'HemoHIM 1set' },
  { id: 'D00501', label: 'Toothpaste 200g x5' },
  { id: 'D00351', label: 'Evening Care 4 Set' },
  { id: 'D00207', label: 'Absolute Skincare Set' },
  { id: 'D00301', label: 'Foam Cleanser' },
  { id: 'D00510', label: 'Toothbrush 8N' }
];

export default function QuickOrderModal({ 
  isOpen, 
  onClose, 
  onAddToCart, 
  onProceedToOrderSheet 
}) {
  // Pre-seed with 2 initial rows
  const [rows, setRows] = useState([
    { rowId: 1, query: 'D00101', product: ALL_CATALOG_PRODUCTS.find(p => p.id === 'D00101') || null, qty: 1 },
    { rowId: 2, query: 'D00501', product: ALL_CATALOG_PRODUCTS.find(p => p.id === 'D00501') || null, qty: 2 }
  ]);
  const [activeSearchRowId, setActiveSearchRowId] = useState(null);

  if (!isOpen) return null;

  // Add row
  const handleAddRow = () => {
    setRows(prev => [
      ...prev,
      { rowId: Date.now(), query: '', product: null, qty: 1 }
    ]);
  };

  // Remove row
  const handleRemoveRow = (rowId) => {
    setRows(prev => prev.filter(r => r.rowId !== rowId));
  };

  // Update query and match product
  const handleQueryChange = (rowId, text) => {
    setRows(prev => prev.map(r => {
      if (r.rowId === rowId) {
        // Direct match by ID
        const matched = ALL_CATALOG_PRODUCTS.find(p => 
          p.id.toLowerCase() === text.trim().toLowerCase()
        );
        return {
          ...r,
          query: text,
          product: matched || null
        };
      }
      return r;
    }));
  };

  // Select product from autocomplete
  const handleSelectProduct = (rowId, prod) => {
    setRows(prev => prev.map(r => {
      if (r.rowId === rowId) {
        return {
          ...r,
          query: `${prod.id} - ${prod.name}`,
          product: prod
        };
      }
      return r;
    }));
    setActiveSearchRowId(null);
  };

  // Add shortcut product
  const handleAddShortcut = (prodId) => {
    const prod = ALL_CATALOG_PRODUCTS.find(p => p.id === prodId);
    if (!prod) return;

    // Check if already in rows
    const existing = rows.find(r => r.product?.id === prodId);
    if (existing) {
      setRows(prev => prev.map(r => 
        r.product?.id === prodId ? { ...r, qty: r.qty + 1 } : r
      ));
    } else {
      setRows(prev => [
        ...prev,
        { rowId: Date.now(), query: `${prod.id} - ${prod.name}`, product: prod, qty: 1 }
      ]);
    }
  };

  // Update quantity
  const handleUpdateQty = (rowId, delta) => {
    setRows(prev => prev.map(r => {
      if (r.rowId === rowId) {
        const newQty = Math.max(1, r.qty + delta);
        return { ...r, qty: newQty };
      }
      return r;
    }));
  };

  // Valid selected products
  const validItems = rows.filter(r => r.product !== null);
  const totalAmount = validItems.reduce((acc, r) => acc + (r.product.price * r.qty), 0);
  const totalPV = validItems.reduce((acc, r) => acc + ((r.product.pv || 0) * r.qty), 0);
  const totalItemsCount = validItems.reduce((acc, r) => acc + r.qty, 0);

  // Add all to cart
  const handleAddAllToCart = () => {
    if (validItems.length === 0) return;
    validItems.forEach(r => {
      onAddToCart && onAddToCart(r.product, r.qty);
    });
    onClose();
  };

  // Order now
  const handleOrderNow = () => {
    if (validItems.length === 0) return;
    validItems.forEach(r => {
      onAddToCart && onAddToCart(r.product, r.qty);
    });
    onClose();
    if (onProceedToOrderSheet) {
      onProceedToOrderSheet();
    }
  };

  return (
    <div className="quick-order-overlay" onClick={onClose}>
      <div className="quick-order-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quick-order-header">
          <div className="header-title-box">
            <div className="quick-order-icon-badge">
              <Zap size={20} color="#00A3E0" />
            </div>
            <div>
              <h3>Atomy Quick Order (간편주문)</h3>
              <p>Enter Atomy product codes or names for instant bulk order creation.</p>
            </div>
          </div>
          <button 
            type="button" 
            className="quick-order-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Shortcuts Bar */}
        <div className="quick-order-shortcuts">
          <span className="shortcuts-label">
            <Sparkles size={13} color="#00A3E0" /> Quick Add Popular:
          </span>
          <div className="shortcuts-chips-row">
            {POPULAR_SHORTCUTS.map(sc => (
              <button
                key={sc.id}
                type="button"
                className="shortcut-chip"
                onClick={() => handleAddShortcut(sc.id)}
              >
                + {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="quick-order-table-container">
          <div className="quick-order-table-head">
            <span className="col-code">Product Code / Name</span>
            <span className="col-info">Product Details</span>
            <span className="col-qty">Quantity</span>
            <span className="col-pv">PV</span>
            <span className="col-price">Total (₹)</span>
            <span className="col-action"></span>
          </div>

          <div className="quick-order-rows-list">
            {rows.map((row, idx) => {
              const query = (row.query || '').toLowerCase();
              const suggestions = query.trim().length > 1 && !row.product
                ? ALL_CATALOG_PRODUCTS.filter(p => 
                    p.id.toLowerCase().includes(query) || 
                    p.name.toLowerCase().includes(query)
                  ).slice(0, 5)
                : [];

              return (
                <div key={row.rowId} className="quick-order-row">
                  {/* Code Search Input */}
                  <div className="col-code relative-cell">
                    <input
                      type="text"
                      placeholder="e.g. D00101 or HemoHIM"
                      value={row.query}
                      onChange={(e) => handleQueryChange(row.rowId, e.target.value)}
                      onFocus={() => setActiveSearchRowId(row.rowId)}
                      className={`code-input ${row.product ? 'has-product' : ''}`}
                    />

                    {/* Autocomplete Dropdown */}
                    {activeSearchRowId === row.rowId && suggestions.length > 0 && (
                      <div className="quick-search-dropdown">
                        {suggestions.map(s => (
                          <div 
                            key={s.id} 
                            className="suggestion-item"
                            onClick={() => handleSelectProduct(row.rowId, s)}
                          >
                            <img src={s.image} alt={s.name} />
                            <div>
                              <strong>{s.id}</strong> - {s.name}
                              <small>₹ {s.price?.toLocaleString('en-IN')}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Info Display */}
                  <div className="col-info">
                    {row.product ? (
                      <div className="matched-product-info">
                        <img 
                          src={row.product.image} 
                          alt={row.product.name} 
                          className="matched-thumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg';
                          }}
                        />
                        <div className="matched-text">
                          <span className="matched-title">{row.product.name}</span>
                          <span className="matched-unit-price">
                            ₹ {(row.product.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="unmatched-placeholder">
                        Enter code above to match
                      </span>
                    )}
                  </div>

                  {/* Quantity Control */}
                  <div className="col-qty">
                    <div className="qty-controls">
                      <button 
                        type="button" 
                        onClick={() => handleUpdateQty(row.rowId, -1)}
                        disabled={row.qty <= 1}
                      >
                        -
                      </button>
                      <span>{row.qty}</span>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateQty(row.rowId, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* PV */}
                  <div className="col-pv">
                    {row.product ? (
                      <span className="pv-badge">
                        {((row.product.pv || 0) * row.qty).toLocaleString('en-IN')} PV
                      </span>
                    ) : (
                      '-'
                    )}
                  </div>

                  {/* Price */}
                  <div className="col-price">
                    {row.product ? (
                      <strong>
                        ₹ {((row.product.price || 0) * row.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </strong>
                    ) : (
                      '-'
                    )}
                  </div>

                  {/* Remove Row */}
                  <div className="col-action">
                    {rows.length > 1 && (
                      <button
                        type="button"
                        className="row-delete-btn"
                        onClick={() => handleRemoveRow(row.rowId)}
                        title="Remove row"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Another Row Button */}
          <button 
            type="button" 
            className="add-row-btn"
            onClick={handleAddRow}
          >
            <Plus size={16} />
            <span>Add Another Product Line</span>
          </button>
        </div>

        {/* Footer Summary & Actions */}
        <div className="quick-order-footer">
          <div className="footer-summary-stats">
            <div className="stat-box">
              <span className="lbl">Selected Products</span>
              <strong>{validItems.length} ({totalItemsCount} units)</strong>
            </div>
            <div className="stat-box pv-stat-box">
              <span className="lbl">Earned PV Points</span>
              <strong>{totalPV.toLocaleString('en-IN')} PV</strong>
            </div>
            <div className="stat-box amount-stat-box">
              <span className="lbl">Total Order Price</span>
              <strong>₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <div className="footer-actions-group">
            <button
              type="button"
              className="quick-action-cart"
              onClick={handleAddAllToCart}
              disabled={validItems.length === 0}
            >
              <ShoppingCart size={16} />
              <span>Add All to Cart</span>
            </button>

            <button
              type="button"
              className="quick-action-order"
              onClick={handleOrderNow}
              disabled={validItems.length === 0}
            >
              <span>Order Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
