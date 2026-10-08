import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  ArrowRight,
  Check,
  Sparkles,
  Award
} from 'lucide-react';
import { enrollMembership } from '../../services/membershipService';
import './MembershipPaymentModal.css';

export default function MembershipPaymentModal({
  isOpen,
  onClose,
  currentUser,
  plan = 'ANNUAL',
  planAmount = 2499,
  onSuccess
}) {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState(currentUser?.email ? `${currentUser.email.split('@')[0]}@okhdfcbank` : 'customer@upi');
  const [cardNumber, setCardNumber] = useState('4532 8920 1142 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('821');
  const [cardName, setCardName] = useState(currentUser?.name || 'Atomy Customer');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedMember, setCompletedMember] = useState(null);

  if (!isOpen) return null;

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);

    const paymentId = `pay_atomy_${Date.now()}`;
    const paymentDetails = {
      method: paymentMethod,
      id: paymentId,
      amount: planAmount
    };

    try {
      const member = await enrollMembership(currentUser, plan, paymentDetails);
      setTimeout(() => {
        setIsProcessing(false);
        setCompletedMember(member);
        setIsCompleted(true);
      }, 900);
    } catch (err) {
      console.error('Membership payment processing error:', err);
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    if (onSuccess && completedMember) {
      onSuccess(completedMember);
    }
    onClose();
  };

  const basePrice = Math.round(planAmount / 1.18);
  const gstAmount = planAmount - basePrice;

  return (
    <div className="payment-modal-backdrop" onClick={onClose}>
      <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="payment-modal-header">
          <div className="payment-header-left">
            <div className="payment-badge-shield">
              <Lock size={14} color="#059669" />
              <span>256-BIT SECURE CHECKOUT</span>
            </div>
            <h3 className="payment-modal-title">
              {isCompleted ? 'Membership Activated 🎉' : 'Distributor Membership Checkout'}
            </h3>
          </div>
          <button type="button" className="payment-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="payment-modal-body">
          {isCompleted ? (
            /* Success Screen */
            <div className="payment-success-screen">
              <div className="success-icon-animation">
                <ShieldCheck size={56} color="#059669" />
              </div>
              <h2 className="success-title">Payment Successful!</h2>
              <p className="success-subtitle">
                Welcome to Atomy India! Your <strong>{plan === 'ANNUAL' ? 'Annual' : 'Monthly'} Distributor Membership</strong> is officially active on your account.
              </p>

              <div className="success-receipt-box">
                <div className="receipt-row">
                  <span className="receipt-label">Membership ID:</span>
                  <strong className="receipt-val highlight">{completedMember?.id || 'ATM-MEM-ACTIVE'}</strong>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Customer Name:</span>
                  <span className="receipt-val">{completedMember?.customerName || currentUser?.name}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Plan & Validity:</span>
                  <span className="receipt-val">{plan === 'ANNUAL' ? 'Annual (365 Days)' : 'Monthly (30 Days)'}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Amount Paid:</span>
                  <strong className="receipt-val">₹ {planAmount.toLocaleString('en-IN')} (Paid)</strong>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Payment ID:</span>
                  <span className="receipt-val code">{completedMember?.paymentId || 'pay_atomy_verified'}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Payment Method:</span>
                  <span className="receipt-val">{paymentMethod}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Status:</span>
                  <span className="receipt-status-pill">ACTIVE & UNLOCKED</span>
                </div>
              </div>

              <div className="success-benefits-unlocked">
                <div className="benefit-item">
                  <CheckCircle2 size={16} color="#059669" />
                  <span>Wholesale DP prices active across all products</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle2 size={16} color="#059669" />
                  <span>Personal PV Points accumulated on every purchase</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle2 size={16} color="#059669" />
                  <span>Verified Atomy Distributor Privileges Activated</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-payment-action success"
                onClick={handleFinish}
              >
                <span>Start Shopping with Wholesale DP Prices</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handlePayNow} className="payment-checkout-form">
              {/* Order Summary Strip */}
              <div className="checkout-summary-strip">
                <div className="strip-info">
                  <span className="strip-plan-badge">{plan} PLAN</span>
                  <h4>Atomy Distributor Membership ({plan === 'ANNUAL' ? '12 Months' : '1 Month'})</h4>
                  <p>Unlocks wholesale Distributor Price (DP) & Personal PV</p>
                </div>
                <div className="strip-total">
                  <div className="strip-amount">₹ {planAmount.toLocaleString('en-IN')}</div>
                  <div className="strip-gst-note">Incl. 18% GST (₹{gstAmount})</div>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="payment-methods-selector">
                <label className="section-input-label">Select Payment Method</label>
                <div className="methods-tabs-grid">
                  <button
                    type="button"
                    className={`method-tab-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <Smartphone size={18} />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    className={`method-tab-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('CARD')}
                  >
                    <CreditCard size={18} />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    className={`method-tab-btn ${paymentMethod === 'NETBANKING' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('NETBANKING')}
                  >
                    <Building2 size={18} />
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="payment-details-card">
                {paymentMethod === 'UPI' && (
                  <div className="payment-method-panel upi">
                    <div className="upi-apps-row">
                      <span className="upi-chip">Google Pay</span>
                      <span className="upi-chip">PhonePe</span>
                      <span className="upi-chip">Paytm</span>
                      <span className="upi-chip">BHIM UPI</span>
                    </div>
                    <div className="form-group-field">
                      <label htmlFor="upi-vpa-input">Virtual Payment Address (UPI ID)</label>
                      <input
                        id="upi-vpa-input"
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        required
                        className="payment-text-input"
                      />
                      <span className="input-helper-text">You will receive a payment request on your UPI app</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="payment-method-panel card">
                    <div className="form-group-field">
                      <label htmlFor="card-number-input">Card Number</label>
                      <input
                        id="card-number-input"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 8821"
                        required
                        className="payment-text-input"
                      />
                    </div>
                    <div className="card-dual-row">
                      <div className="form-group-field">
                        <label htmlFor="card-expiry-input">Expiry Date</label>
                        <input
                          id="card-expiry-input"
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          required
                          className="payment-text-input"
                        />
                      </div>
                      <div className="form-group-field">
                        <label htmlFor="card-cvv-input">CVV</label>
                        <input
                          id="card-cvv-input"
                          type="password"
                          maxLength="4"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          required
                          className="payment-text-input"
                        />
                      </div>
                    </div>
                    <div className="form-group-field">
                      <label htmlFor="card-name-input">Cardholder Name</label>
                      <input
                        id="card-name-input"
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name as on Card"
                        required
                        className="payment-text-input"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="payment-method-panel netbanking">
                    <div className="form-group-field">
                      <label htmlFor="bank-select">Select Your Bank</label>
                      <select
                        id="bank-select"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="payment-text-input"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank</option>
                      </select>
                      <span className="input-helper-text">You will be redirected to your bank's secure netbanking portal</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="payment-actions-wrap">
                <button
                  type="submit"
                  className={`btn-payment-action primary ${isProcessing ? 'loading' : ''}`}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span>Processing Secure Payment...</span>
                  ) : (
                    <>
                      <span>Pay ₹ {planAmount.toLocaleString('en-IN')} & Join Membership</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="payment-security-disclaimer">
                  🔒 Payments are encrypted with 256-bit SSL and processed securely. Membership details will be saved to your verified Atomy account.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
