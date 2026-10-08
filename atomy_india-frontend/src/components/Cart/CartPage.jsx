import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, ShoppingBag, Plus, Minus, X, ArrowLeft } from 'lucide-react';
import './CartPage.css';

const CART_PAGE_BEST_PRODUCTS = [
  {
    id: "D90501",
    name: "Atomy Toothpaste 200g x1N",
    price: 359,
    formattedPrice: "₹ 359.00",
    image: "https://image.atomy.com/IN/goods/D90501/org/663/251130000048663.jpg?w=480&h=480",
    gstReduced: true
  },
  {
    id: "D00301",
    name: "Evening Care Foam Cleanser",
    price: 900,
    formattedPrice: "₹ 900.00",
    image: "https://image.atomy.com/IN/goods/D00301/D00301_00.jpg?w=480&h=480",
    gstReduced: false
  },
  {
    id: "D00521",
    name: "Toothpaste 50g x 4 N",
    price: 520,
    formattedPrice: "₹ 520.00",
    image: "https://image.atomy.com/IN/goods/D00521/D00521_00.jpg?w=480&h=480",
    gstReduced: true
  },
  {
    id: "D00271",
    name: "Sunscreen SPF50+ PA+++(White )",
    price: 900,
    formattedPrice: "₹ 900.00",
    image: "https://image.atomy.com/IN/goods/D00271/D00271_00.jpg?w=480&h=480",
    gstReduced: false
  },
  {
    id: "D00281",
    name: "Sunscreen SPF50+ PA+++(Beige )",
    price: 900,
    formattedPrice: "₹ 900.00",
    image: "https://image.atomy.com/IN/goods/D00281/D00281_00.jpg?w=480&h=480",
    gstReduced: false
  },
  {
    id: "D00501",
    name: "Toothpaste 200g X 5 N",
    price: 1795,
    formattedPrice: "₹ 1,795.00",
    image: "https://image.atomy.com/IN/goods/D00501/D00501_00.jpg?w=480&h=480",
    gstReduced: true
  },
  {
    id: "D00510",
    name: "Toothbrush 8N",
    price: 950,
    formattedPrice: "₹ 950.00",
    image: "https://image.atomy.com/IN/goods/D00510/D00510_00.jpg?w=480&h=480",
    gstReduced: true
  },
  {
    id: "D00601",
    name: "Herbal Hair Shampoo",
    price: 1050,
    formattedPrice: "₹ 1,050.00",
    image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
    gstReduced: true
  },
  {
    id: "D04086",
    name: "Atomy Moringa",
    price: 799,
    formattedPrice: "₹ 799.00",
    image: "https://image.atomy.com/IN/goods/D04086/D04086_00.jpg?w=480&h=480",
    gstReduced: true
  }
];

export default function CartPage({
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  onNavigateHome,
  onNavigateBack,
  onProductClick,
  onAddToCart,
  onNavigateSignIn
}) {
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
  const totalPV = selectedItems.reduce((acc, item) => {
    const itemPv = item.pv || Math.round((item.price || 1000) * 4.5);
    return acc + itemPv * (item.qty || 1);
  }, 0);

  const freeShippingThreshold = 4000;
  const isFreeShipping = subtotal >= freeShippingThreshold || selectedItems.length === 0;
  const shippingFee = (selectedItems.length > 0 && !isFreeShipping) ? 150 : 0;
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

              <div className="cart-none">
                <span>There are no items in the cart</span>
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

                {/* Free Shipping Indicator */}
                <div className="cart-group_indi">
                  <div className="txt">
                    {subtotal >= freeShippingThreshold ? (
                      <span className="free-ship-success">
                        <em>Free shipping</em> applied to this order!
                      </span>
                    ) : (
                      <span>
                        <em>₹{(freeShippingThreshold - subtotal).toLocaleString('en-IN')}</em> more to get free shipping
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
              <li className="bx_sub">
                <span className="txt">
                  Promotions may be applied.
                </span>
              </li>
            </ul>
          </div>

          {/* Two Buttons: Easy Purchase + Total Items Checkout (.fxd-btn) */}
          <div className={`fxd-btn ${selectedItems.length === 0 ? 'disabled' : ''}`}>
            <button
              type="button"
              className="easy"
              disabled={selectedItems.length === 0}
              onClick={() => {
                if (selectedItems.length > 0) {
                  onCheckout && onCheckout();
                }
              }}
            >
              <em>Easy Purchase</em>
            </button>
            <button
              type="button"
              className="sp"
              disabled={selectedItems.length === 0}
              onClick={() => {
                if (selectedItems.length > 0) {
                  onCheckout && onCheckout();
                }
              }}
            >
              <em>
                {selectedItems.length === 0
                  ? '0 items in total'
                  : `${selectedItems.length} items in total`}
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
            {CART_PAGE_BEST_PRODUCTS.map((prod) => (
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
                        <em>₹</em><b>{prod.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
