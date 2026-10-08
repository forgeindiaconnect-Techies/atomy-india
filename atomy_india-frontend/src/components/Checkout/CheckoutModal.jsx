import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Smartphone, Banknote, Building2 } from 'lucide-react';
import { createCustomerOrder } from '../../services/api';
import './CheckoutModal.css';

export default function CheckoutModal({ isOpen, onClose, cartItems, onOrderSuccess }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'ONLINE_UPI'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingFee = subtotal >= 1000 ? 0 : 99;
  const totalAmount = subtotal + shippingFee;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const orderPayload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        paymentMethod: formData.paymentMethod,
        shippingFee: shippingFee,
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          unitPrice: item.price,
          quantity: item.qty
        }))
      };

      const res = await createCustomerOrder(orderPayload);
      setPlacedOrder(res.data);
      if (onOrderSuccess) {
        onOrderSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="checkout-header">
          <div className="checkout-header-title">
            {placedOrder ? 'Order Confirmation' : 'Direct Customer Checkout'}
          </div>
          <button className="checkout-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="checkout-body">
          {placedOrder ? (
            /* Order Placed Success Screen */
            <div className="checkout-success-view">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={56} color="#00A3E0" />
              </div>
              <h3 className="success-title">Order Placed Successfully!</h3>
              <p className="success-subtitle">
                Thank you for your purchase with Atomy India. Your order is confirmed and is being processed for dispatch.
              </p>

              <div className="order-details-card">
                <div className="detail-item">
                  <span className="detail-label">Order Number</span>
                  <span className="detail-val order-num-highlight">{placedOrder.orderId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Customer Name</span>
                  <span className="detail-val">{placedOrder.customerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Delivery Address</span>
                  <span className="detail-val">{placedOrder.shippingAddress}, {placedOrder.city} - {placedOrder.pincode}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Amount Paid</span>
                  <span className="detail-val highlight-price">₹ {placedOrder.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-val">{placedOrder.paymentMethod}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Initial Status</span>
                  <span className="detail-status-pill">{placedOrder.orderStatus}</span>
                </div>
              </div>

              <div className="success-actions">
                <button
                  className="track-now-btn"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(
                      new CustomEvent('atomy:track-order', { detail: { orderId: placedOrder.orderId } })
                    );
                  }}
                >
                  <Truck size={18} />
                  Track Order Timeline
                </button>
                <button className="continue-shopping-btn" onClick={onClose}>
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form Screen */
            <form onSubmit={handleSubmit} className="checkout-form-grid">
              {error && <div className="checkout-error-banner">{error}</div>}

              {/* Left Column: Delivery & Customer Info */}
              <div className="checkout-col-left">
                <h4 className="section-title">Shipping & Contact Details</h4>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="Enter full name"
                    value={formData.customerName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="customerEmail"
                      required
                      placeholder="e.g. name@example.com"
                      value={formData.customerEmail}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      required
                      placeholder="+91-9876543210"
                      value={formData.customerPhone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address / Apartment *</label>
                  <textarea
                    name="shippingAddress"
                    rows="2"
                    required
                    placeholder="Flat / House No, Street, Locality"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength="6"
                      placeholder="6 Digits"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <h4 className="section-title payment-section-title">Payment Method</h4>
                <div className="payment-options-grid">
                  <label className={`payment-card ${formData.paymentMethod === 'ONLINE_UPI' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE_UPI"
                      checked={formData.paymentMethod === 'ONLINE_UPI'}
                      onChange={handleChange}
                    />
                    <Smartphone size={20} />
                    <div className="payment-card-info">
                      <span className="pay-method-name">Online UPI</span>
                      <span className="pay-method-desc">GPay, PhonePe, Paytm, BHIM</span>
                    </div>
                  </label>

                  <label className={`payment-card ${formData.paymentMethod === 'CREDIT_DEBIT_CARD' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CREDIT_DEBIT_CARD"
                      checked={formData.paymentMethod === 'CREDIT_DEBIT_CARD'}
                      onChange={handleChange}
                    />
                    <CreditCard size={20} />
                    <div className="payment-card-info">
                      <span className="pay-method-name">Cards</span>
                      <span className="pay-method-desc">Visa, MasterCard, RuPay</span>
                    </div>
                  </label>

                  <label className={`payment-card ${formData.paymentMethod === 'NET_BANKING' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="NET_BANKING"
                      checked={formData.paymentMethod === 'NET_BANKING'}
                      onChange={handleChange}
                    />
                    <Building2 size={20} />
                    <div className="payment-card-info">
                      <span className="pay-method-name">Net Banking</span>
                      <span className="pay-method-desc">All Indian Banks</span>
                    </div>
                  </label>

                  <label className={`payment-card ${formData.paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH_ON_DELIVERY"
                      checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                      onChange={handleChange}
                    />
                    <Banknote size={20} />
                    <div className="payment-card-info">
                      <span className="pay-method-name">Cash On Delivery</span>
                      <span className="pay-method-desc">Pay upon doorstep receipt</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="checkout-col-right">
                <h4 className="section-title">Order Summary ({cartItems.reduce((a, b) => a + b.qty, 0)} Items)</h4>

                <div className="checkout-items-preview">
                  {cartItems.map((item) => (
                    <div key={item.id} className="checkout-item-compact">
                      <img src={item.image} alt={item.name} className="checkout-thumb" />
                      <div className="checkout-thumb-info">
                        <span className="checkout-item-title">{item.name}</span>
                        <span className="checkout-item-meta">Qty: {item.qty} × ₹ {item.price.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="checkout-item-sum">₹ {(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="checkout-calculation-box">
                  <div className="calc-row">
                    <span>Items Subtotal:</span>
                    <span>₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="calc-row">
                    <span>Shipping Delivery:</span>
                    <span>{shippingFee === 0 ? <strong className="free-shipping">FREE</strong> : `₹ ${shippingFee.toFixed(2)}`}</span>
                  </div>
                  <div className="calc-row calc-total">
                    <span>Grand Total:</span>
                    <span>₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="safe-checkout-badge">
                  <ShieldCheck size={18} color="#00A3E0" />
                  <span>100% Genuine Atomy Guarantee & Safe SSL Transaction</span>
                </div>

                <button type="submit" disabled={loading} className="place-order-submit-btn">
                  {loading ? 'Processing Order...' : `Confirm & Place Order (₹ ${totalAmount.toLocaleString('en-IN')})`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
