import React, { useState, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, ShoppingBag, Plus, Minus, X, ArrowLeft } from 'lucide-react';
import './CartPage.css';
import { ALL_CATALOG_PRODUCTS, BEST_PRODUCTS, getRelatedProducts, getPopularProducts } from '../../data/mockData';
import { calculateCartTaxSummary } from '../../services/taxService';
import { calculateProductPricing } from '../../services/membershipService';

export default function CartPage({
  cartItems = [],
  currentUser = null,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  onNavigateHome,
  onNavigateBack,
  onProductClick,
  onAddToCart,
  onNavigateSignIn,
  isMember = false,
  onOpenMembershipModal
}) {
  // Determine if active user is logged in (from prop or localStorage)
  const isLoggedIn = Boolean(
    currentUser || (() => {
      try {
        const saved = localStorage.getItem('atomy_current_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })()
  );

  const [selectedIds, setSelectedIds] = useState(() => 
    cartItems.map(item => item.id)
  );

  const bestSliderRef = useRef(null);

  React.useEffect(() => {
    setSelectedIds(prev => {
      const currentIds = cartItems.map(item => item.id);
      return prev.filter(id => currentIds.includes(id));
    });
  }, [cartItems]);

  const popularBestsellers = useMemo(() => {
    const cartIds = cartItems.map(item => item.id);
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      const related = getRelatedProducts(firstItem, 12);
      const filtered = related.filter(p => !cartIds.includes(p.id));
      if (filtered.length >= 4) return filtered;
    }
    return getPopularProducts(12, cartIds);
  }, [cartItems]);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(cartItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      alert("No item was selected, please select the item you wish to remove.");
      return;
    }
    if (window.confirm(`Remove selected ${selectedIds.length} products?`)) {
      selectedIds.forEach(id => onRemoveItem && onRemoveItem(id));
      setSelectedIds([]);
    }
  };

  const isAllSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0);
  const cartTaxSummary = calculateCartTaxSummary(selectedItems);
  const totalPV = selectedItems.reduce((acc, item) => {
    const itemPv = item.pv || Math.round((item.price || 1000) * 4.5);
    return acc + itemPv * (item.qty || 1);
  }, 0);

  // Check if any product specifies Free Delivery
  const hasFreeDeliveryProduct = selectedItems.some(item => {
    if (item.freeDelivery === true) return true;
    if (item.freeDelivery === false) return false;
    const cat = ALL_CATALOG_PRODUCTS?.find(p => p.id === item.id) || BEST_PRODUCTS?.find(p => p.id === item.id);
    if (cat?.freeDelivery === true) return true;
    if (Array.isArray(item.tags) && item.tags.some(t => typeof t === 'string' && t.toLowerCase().includes('free delivery'))) return true;
    if (Array.isArray(cat?.tags) && cat.tags.some(t => typeof t === 'string' && t.toLowerCase().includes('free delivery'))) return true;
    return false;
  });
  const freeShippingThreshold = 4500;
  const isFreeDeliveryEligible = subtotal >= freeShippingThreshold || hasFreeDeliveryProduct;
  const shippingFee = (selectedItems.length > 0 && !isFreeDeliveryEligible) ? 150 : 0;
  const grandTotal = subtotal + shippingFee;

  const handleScrollSlider = (direction) => {
    if (bestSliderRef.current) {
      const step = 256 * 3;
      bestSliderRef.current.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth'
      });
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg';
  };

  return (
    <div className="cart-page-view container">
      {/* Progress Header (.odrHead) */}
      <div className="odrHead">
        <div className="odrHead-title">
          <h2>Cart</h2>
        </div>
        <dl className="odrHead-pgs">
          <dt className="ir">Progress</dt>
          <dd aria-current="page">
            <span className="step-num">01</span> Cart
          </dd>
          <dd>
            <span className="step-num">02</span> Order / Payment
          </dd>
          <dd>
            <span className="step-num">03</span> Complete
          </dd>
        </dl>
      </div>

      {/* Main Order Content Wrapper (.odrWrap) */}
      <div className="odrWrap">
        {/* Left Column (.odrCont) */}
        <div className="odrCont">
          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="cart-empty-wrapper">
              {!isLoggedIn && (
                <div className="cart-login">
                  <div className="tit">
                    <h3>Sign in to receive benefits.</h3>
                    <span>Points can be earned once you join as a member</span>
                  </div>
                  <div className="bt">
                    <button 
                      className="btn ln mg" 
                      type="button" 
                      onClick={onNavigateSignIn}
                    >
                      <em>Sign in</em>
                    </button>
                  </div>
                </div>
              )}

              <div className="cart-none" style={{ flexDirection: 'column', textAlign: 'center', padding: '80px 20px' }}>
                <ShoppingBag size={48} color="#94a3b8" style={{ marginBottom: '14px', strokeWidth: 1.5 }} />
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#334155' }}>There are no items in the cart</span>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', maxWidth: '380px' }}>
                  Explore our curated Atomy catalog to discover health, skincare, and daily lifestyle essentials.
                </p>
                <button
                  type="button"
                  className="btn-browse-shop"
                  onClick={onNavigateHome}
                  style={{
                    marginTop: '20px',
                    padding: '11px 28px',
                    backgroundColor: '#00A3E0',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 163, 224, 0.25)',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Populated Cart State */
            <div className="cart-items-wrapper">
              {/* Select All Bar (.cart-topAll) */}
              <div className="cart-topAll">
                <div className="chk">
                  <input
                    type="checkbox"
                    id="cart-select-all"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="cart-select-all">
                    All ({selectedIds.length}/{cartItems.length})
                  </label>
                </div>
                <div className="btn-set-top">
                  <button
                    type="button"
                    className="btn ln sm"
                    onClick={handleDeleteSelected}
                  >
                    Delete Selected
                  </button>
                </div>
              </div>

              {/* Cart Group (.cart-group) */}
              <div className="cart-group">
                <div className="cart-group_head normal">
                  <div className="chk">
                    <input
                      type="checkbox"
                      id="general-delivery-chk"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="general-delivery-chk">General Delivery</label>
                  </div>
                  <div className="info">
                    <span className="addr">Direct Delivery</span>
                  </div>
                </div>

                {/* Free Delivery Indicator based on product specification */}
                <div className="cart-group_indi">
                  <div className="txt">
                    {hasFreeDeliveryProduct ? (
                      <span className="free-ship-success">
                        <em>Free Delivery</em> applied to this order! (Eligible product included)
                      </span>
                    ) : (
                      <span>
                        <em>Standard Delivery (₹ 150.00)</em> applied. Add any product with Free Delivery for free doorstep shipping.
                      </span>
                    )}
                  </div>
                </div>

                {/* Products List (.cart-group_list) */}
                <div className="cart-group_list">
                  <ul>
                    {cartItems.map(item => {
                      const isSelected = selectedIds.includes(item.id);
                      const itemPv = item.pv || Math.round((item.price || 1000) * 4.5);
                      return (
                        <li key={item.id} className="cart-item">
                          {/* Item Checkbox */}
                          <div className="item-chk">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(item.id)}
                            />
                          </div>

                          {/* Product Info & Image (.pay-gds) */}
                          <div className="pay-gds">
                            <div 
                              className="img" 
                              onClick={() => onProductClick && onProductClick(item)}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                onError={handleImageError}
                              />
                            </div>
                            <div className="info">
                              <span className="gdsCode">{item.id}</span>
                              <h4 
                                className="tit" 
                                onClick={() => onProductClick && onProductClick(item)}
                              >
                                {item.name}
                              </h4>
                              <div className="pv-badge">
                                <span>PV</span> <b>{(itemPv * item.qty).toLocaleString('en-IN')}</b>
                              </div>
                            </div>
                          </div>

                          {/* Stepper Option */}
                          <div className="option">
                            <div className="qty-stepper">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                                disabled={item.qty <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="qty-val">{item.qty}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Price Display (.gdsPrice) */}
                          <div className="gdsPrice">
                            <div className="prc">
                              <span className="prc_ori">
                                <em>₹</em>
                                <b>{((item.price || 0) * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b>
                              </span>
                            </div>
                            <div className="pv">
                              <span className="pv_ori">
                                <em>PV</em>
                                <b>{(itemPv * item.qty).toLocaleString('en-IN')}</b>
                              </span>
                            </div>
                          </div>

                          {/* Close / Delete Button (.cls) */}
                          <div className="cls">
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              aria-label="Remove item"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Left Side Subtotal/Total Summary (as shown in user's image) */}
          <div className="odr-total odr-total-left">
            <ul>
              <li className="bx_lst">
                <div>
                  <span className="tit">Subtotal</span>
                  <span className="prc"><em>₹</em><b>{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b></span>
                </div>
                <div>
                  <span className="tit">Shipping Fee</span>
                  <span className="prc"><em>₹</em><b>{shippingFee === 0 ? '0.00' : shippingFee.toFixed(2)}</b></span>
                </div>
              </li>
              <li className="bx_total">
                <span className="tit">Total</span>
                <span className="prc"><em>₹</em><b>{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b></span>
              </li>
              <li style={{ padding: '2px 0 6px', textAlign: 'right', listStyle: 'none' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  (Final amount inclusive of GST: ₹ {cartTaxSummary.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              </li>
              <li className="bx_sub">
                <span className="txt">Promotions may be applied.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Sticky Fixed Info Column (.odrFixedInfo) matching user's image */}
        <div className="odrFixedInfo">
          <div className="odr-total">
            <ul>
              <li className="bx_lst">
                <div>
                  <span className="tit">Subtotal</span>
                  <span className="prc">
                    <em>₹</em>
                    <b>{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b>
                  </span>
                </div>
                <div>
                  <span className="tit">Shipping Fee</span>
                  <span className="prc">
                    <em>₹</em>
                    <b>{shippingFee === 0 ? '0.00' : shippingFee.toFixed(2)}</b>
                  </span>
                </div>
              </li>
              <li className="bx_total">
                <span className="tit">Estimated Amount</span>
                <span className="prc">
                  <em>₹</em>
                  <b>{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b>
                </span>
              </li>
              <li style={{ padding: '2px 0 6px', textAlign: 'right', listStyle: 'none' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  (Final amount inclusive of GST: ₹ {cartTaxSummary.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              </li>
              <li className="bx_sub">
                <span className="txt" style={{ color: isFreeDeliveryEligible ? '#059669' : '#0284c7', fontWeight: 600 }}>
                  {isFreeDeliveryEligible
                    ? '✓ Free delivery applied (orders above ₹ 4,500.00)'
                    : `Add ₹ ${(4500 - subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} more for Free Delivery`}
                </span>
              </li>
            </ul>
          </div>

          {/* Place Order Button (.fxd-btn) navigating to Payment Summary */}
          <div className={`fxd-btn ${selectedItems.length === 0 ? 'disabled' : ''}`}>
            <button
              type="button"
              className="btn-cart-place-order"
              disabled={selectedItems.length === 0}
              onClick={() => {
                if (selectedItems.length > 0) {
                  onCheckout && onCheckout(selectedItems);
                }
              }}
              style={{
                width: '100%',
                height: '52px',
                background: selectedItems.length === 0 ? '#d8dde0' : '#00b6f0',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '0.2px',
                transition: 'all 0.2s ease'
              }}
            >
              <em>
                {selectedItems.length === 0
                  ? 'Place Order (0 items)'
                  : `Place Order (${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'})`}
              </em>
            </button>
          </div>
        </div>
      </div>

      {/* SEPARATE FULL-WIDTH SECTION: Best Products Section (.odrBtm-gds) */}
      <div className="odrBtm-gds">
        <div className="cmn-top">
          <h3 className="cmn-top_tit">
            <strong>Best Product</strong>
          </h3>
        </div>

        <div className="swiper-container-wrapper">
          <button 
            type="button" 
            className="swiper-arrow swiper-prev" 
            onClick={() => handleScrollSlider('left')}
            aria-label="Previous Products"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>

          <div className="swiper-gdsList-track" ref={bestSliderRef}>
            {popularBestsellers.map((prod) => {
              const pricing = calculateProductPricing(prod, isMember);
              return (
                <div key={prod.id} className="swiper-slide-gds">
                  <div 
                    className="gdImg" 
                    onClick={() => onProductClick && onProductClick(prod)}
                  >
                    {prod.gstReduced && (
                      <span className="gdsFlag">
                        <img
                          src="https://image.atomy.com/IN/goods/flag/501/251120000048501.png"
                          alt="GST Reduce"
                        />
                      </span>
                    )}
                    <span className="img">
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        onError={handleImageError}
                      />
                    </span>
                  </div>

                  <div className="gdInfo">
                    <button
                      type="button"
                      className="bt_cart"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart && onAddToCart(prod);
                      }}
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={19} color="#00b6f0" strokeWidth={1.8} />
                    </button>

                    <div 
                      className="title" 
                      onClick={() => onProductClick && onProductClick(prod)}
                    >
                      {prod.name}
                    </div>

                    <div className="gdsPrice">
                      <span className="prc">
                        <span className="prc_ori">
                          <em>₹</em><b>{pricing.activePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b>
                        </span>
                        {isMember && <span style={{ fontSize: '11px', color: '#059669', marginLeft: '5px', fontWeight: '700' }}>DP</span>}
                      </span>
                      <span className="pv" style={{ display: 'block', fontSize: '12px', color: '#00A3E0', fontWeight: '600', marginTop: '2px' }}>
                        {(pricing.pv || prod.pv || 2000).toLocaleString('en-IN')} PV
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            type="button" 
            className="swiper-arrow swiper-next" 
            onClick={() => handleScrollSlider('right')}
            aria-label="Next Products"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
