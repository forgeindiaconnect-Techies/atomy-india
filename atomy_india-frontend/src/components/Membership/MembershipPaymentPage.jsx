import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  ArrowRight,
  Check,
  Sparkles,
  QrCode,
  Award,
  Zap,
  HelpCircle
} from 'lucide-react';
import { enrollMembership, getMembershipSettings } from '../../services/membershipService';
import './MembershipPaymentPage.css';

export default function MembershipPaymentPage({
  currentUser,
  plan: initialPlan = 'MONTHLY',
  onNavigateHome,
  onNavigateBack,
  onMembershipActivated
}) {
  const settings = getMembershipSettings();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY');

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY');
    }
  }, [initialPlan]);

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [upiId, setUpiId] = useState(currentUser?.email ? `${currentUser.email.split('@')[0]}@okhdfcbank` : 'naveen.mj2.45@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [showQrCode, setShowQrCode] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 8920 1142 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('821');
  const [cardName, setCardName] = useState(currentUser?.name || 'Naveen Kumar');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedMember, setCompletedMember] = useState(null);

  const planAmount = selectedPlan === 'ANNUAL' ? (settings.annualFee || 2499) : (settings.monthlyFee || 299);
  const basePrice = Math.round(planAmount / 1.18);
  const gstAmount = planAmount - basePrice;

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);

    const paymentId = `pay_atomy_mem_${Date.now()}`;
    const paymentDetails = {
      method: paymentMethod,
      id: paymentId,
      amount: planAmount
    };

    try {
      const member = await enrollMembership(currentUser, selectedPlan, paymentDetails);
      setTimeout(() => {
        setIsProcessing(false);
        setCompletedMember(member);
        setIsCompleted(true);
        if (onMembershipActivated) {
          onMembershipActivated(member);
        }
      }, 900);
    } catch (err) {
      console.error('Membership payment processing error:', err);
      setIsProcessing(false);
    }
  };

  const handleFinishAndShop = () => {
    if (completedMember && onMembershipActivated) {
      onMembershipActivated(completedMember);
    }
    window.dispatchEvent(new CustomEvent('atomy:members-registry-updated'));
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  return (
    <div className="membership-payment-page">
      {/* 1. Top Breadcrumb & Navigation Bar */}
      <div className="payment-page-topbar">
        <div className="container payment-topbar-container">
          <div className="topbar-left">
            <button
              type="button"
              className="btn-back-membership"
              onClick={onNavigateBack || onNavigateHome}
            >
              <ArrowLeft size={16} />
              <span>Back to Membership Plans</span>
            </button>
            <div className="topbar-breadcrumbs">
              <span className="crumb" onClick={onNavigateHome}>Home</span>
              <span className="sep">/</span>
              <span className="crumb" onClick={onNavigateBack}>Membership</span>
              <span className="sep">/</span>
              <span className="crumb current">Checkout</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="secure-badge-pill">
              <Lock size={13} color="#059669" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container payment-page-main-container">
        {isCompleted ? (
          /* ========================================================
             SUCCESSFUL ACTIVATION VIEW
             ======================================================== */
          <div className="membership-success-card animate-fade">
            <div className="success-header-badge">
              <div className="success-icon-wrap">
                <ShieldCheck size={48} color="#059669" />
              </div>
              <span className="success-tag">OFFICIALLY ACTIVATED</span>
              <h2 className="success-heading">Payment Successful!</h2>
              <p className="success-lead">
                Welcome to Atomy India! Your <strong>{selectedPlan === 'ANNUAL' ? 'Annual (12 Months)' : 'Monthly (1 Month)'} Distributor Membership</strong> has been verified and activated.
              </p>
            </div>

            {/* Official Receipt Details */}
            <div className="success-receipt-card">
              <div className="receipt-meta-grid">
                <div className="receipt-col">
                  <span className="r-label">Membership ID</span>
                  <strong className="r-val id-code">{completedMember?.id || 'ATM-MEM-98721'}</strong>
                </div>
                <div className="receipt-col">
                  <span className="r-label">Customer Name</span>
                  <span className="r-val">{completedMember?.customerName || currentUser?.name || 'Member'}</span>
                </div>
                <div className="receipt-col">
                  <span className="r-label">Subscription Plan</span>
                  <span className="r-val">{selectedPlan === 'ANNUAL' ? 'Annual (365 Days)' : 'Monthly (30 Days)'}</span>
                </div>
                <div className="receipt-col">
                  <span className="r-label">Total Amount Paid</span>
                  <strong className="r-val price-val">₹ {planAmount.toLocaleString('en-IN')} (Incl. GST)</strong>
                </div>
                <div className="receipt-col">
                  <span className="r-label">Transaction Reference</span>
                  <span className="r-val mono">{completedMember?.paymentId || 'pay_atomy_verified'}</span>
                </div>
                <div className="receipt-col">
                  <span className="r-label">Payment Mode</span>
                  <span className="r-val">{paymentMethod}</span>
                </div>
              </div>

              <div className="receipt-status-banner">
                <CheckCircle2 size={16} color="#059669" />
                <span>Status: <strong>ACTIVE & UNLOCKED</strong> • Wholesale Distributor Pricing (DP) applied immediately</span>
              </div>
            </div>

            {/* Privileges Unlocked */}
            <div className="unlocked-privileges-box">
              <h4>Privileges Unlocked on Your Account</h4>
              <div className="privilege-grid">
                <div className="privilege-item">
                  <Check size={16} color="#00A3E0" />
                  <span>Wholesale DP prices active across entire Atomy catalog (~18%-20% savings)</span>
                </div>
                <div className="privilege-item">
                  <Check size={16} color="#00A3E0" />
                  <span>Personal Point Value (PV) points accumulated on every completed order</span>
                </div>
                <div className="privilege-item">
                  <Check size={16} color="#00A3E0" />
                  <span>Priority dispatch & courier delivery directly from verified Atomy warehouses</span>
                </div>
                <div className="privilege-item">
                  <Check size={16} color="#00A3E0" />
                  <span>Exclusive member access to new product launches and seminars</span>
                </div>
              </div>
            </div>

            <div className="success-action-row">
              <button
                type="button"
                className="btn-start-shopping-dp"
                onClick={handleFinishAndShop}
              >
                <span>Start Shopping with Wholesale DP Prices</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             DEDICATED PAYMENT CHECKOUT PAGE (Matching User Screenshot)
             ======================================================== */
          <div className="membership-checkout-layout">
            {/* Left Column: Interactive Payment Methods Form */}
            <div className="payment-left-column">
              <div className="checkout-main-card">
                {/* Section Header */}
                <div className="checkout-card-header">
                  <div className="header-badge-row">
                    <div className="secure-shield-tag">
                      <Lock size={12} color="#059669" />
                      <span>256-BIT SECURE CHECKOUT</span>
                    </div>
                  </div>
                  <h1 className="checkout-page-title">Distributor Membership Checkout</h1>
                  <p className="checkout-page-subtitle">
                    Select your payment method below to activate distributor pricing and personal PV accumulation.
                  </p>
                </div>

                {/* Plan Summary Card Strip (matching screenshot) */}
                <div className="plan-summary-strip">
                  <div className="strip-left-info">
                    <div className="strip-plan-badge">
                      {selectedPlan === 'ANNUAL' ? 'ANNUAL PLAN' : 'MONTHLY PLAN'}
                    </div>
                    <h3 className="strip-plan-title">
                      Atomy Distributor Membership ({selectedPlan === 'ANNUAL' ? '12 Months' : '1 Month'})
                    </h3>
                    <p className="strip-plan-desc">
                      Unlocks wholesale Distributor Price (DP) & Personal PV
                    </p>

                    {/* Quick Plan Switcher */}
                    <div className="strip-plan-switcher">
                      <button
                        type="button"
                        className={`switcher-pill ${selectedPlan === 'MONTHLY' ? 'active' : ''}`}
                        onClick={() => setSelectedPlan('MONTHLY')}
                      >
                        Monthly (₹ 299)
                      </button>
                      <button
                        type="button"
                        className={`switcher-pill ${selectedPlan === 'ANNUAL' ? 'active' : ''}`}
                        onClick={() => setSelectedPlan('ANNUAL')}
                      >
                        Annual (₹ 2,499 • Save 30%)
                      </button>
                    </div>
                  </div>

                  <div className="strip-right-pricing">
                    <div className="strip-hero-price">₹ {planAmount.toLocaleString('en-IN')}</div>
                    <div className="strip-gst-caption">
                      Incl. 18% GST (₹{gstAmount})
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handlePayNow} className="checkout-payment-form">
                  {/* Select Payment Method */}
                  <div className="payment-method-selection-group">
                    <label className="group-label">Select Payment Method</label>
                    <div className="method-cards-grid">
                      <button
                        type="button"
                        className={`method-select-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('UPI')}
                      >
                        <Smartphone size={19} />
                        <span>UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        className={`method-select-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('CARD')}
                      >
                        <CreditCard size={19} />
                        <span>Card</span>
                      </button>

                      <button
                        type="button"
                        className={`method-select-btn ${paymentMethod === 'NETBANKING' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('NETBANKING')}
                      >
                        <Building2 size={19} />
                        <span>Net Banking</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Interactive Details Box */}
                  <div className="method-details-panel">
                    {/* Method 1: UPI / QR */}
                    {paymentMethod === 'UPI' && (
                      <div className="upi-panel-content animate-fade">
                        {/* UPI App Chips (matching screenshot) */}
                        <div className="upi-app-chips-row">
                          <button
                            type="button"
                            className={`upi-app-chip ${selectedUpiApp === 'gpay' ? 'selected' : ''}`}
                            onClick={() => { setSelectedUpiApp('gpay'); setShowQrCode(false); }}
                          >
                            <span>Google Pay</span>
                          </button>
                          <button
                            type="button"
                            className={`upi-app-chip ${selectedUpiApp === 'phonepe' ? 'selected' : ''}`}
                            onClick={() => { setSelectedUpiApp('phonepe'); setShowQrCode(false); }}
                          >
                            <span>PhonePe</span>
                          </button>
                          <button
                            type="button"
                            className={`upi-app-chip ${selectedUpiApp === 'paytm' ? 'selected' : ''}`}
                            onClick={() => { setSelectedUpiApp('paytm'); setShowQrCode(false); }}
                          >
                            <span>Paytm</span>
                          </button>
                          <button
                            type="button"
                            className={`upi-app-chip ${selectedUpiApp === 'bhim' ? 'selected' : ''}`}
                            onClick={() => { setSelectedUpiApp('bhim'); setShowQrCode(false); }}
                          >
                            <span>BHIM UPI</span>
                          </button>
                          <button
                            type="button"
                            className={`upi-app-chip ${showQrCode ? 'selected' : ''}`}
                            onClick={() => setShowQrCode(!showQrCode)}
                          >
                            <QrCode size={13} style={{ marginRight: '4px' }} />
                            <span>Scan QR</span>
                          </button>
                        </div>

                        {showQrCode ? (
                          <div className="upi-qr-display-box">
                            <div className="qr-box-inner">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=naveen.mj2.45-1@okicici%26pn=Atomy%20India%26am=${planAmount}%26cu=INR`}
                                alt="UPI Payment QR"
                                className="qr-image"
                              />
                            </div>
                            <span className="qr-note">Scan with any UPI app (GPay, PhonePe, Paytm) to pay ₹{planAmount}</span>
                          </div>
                        ) : (
                          <div className="input-group-field">
                            <label htmlFor="input-vpa-address">Virtual Payment Address (UPI ID)</label>
                            <input
                              id="input-vpa-address"
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="username@okhdfcbank"
                              required
                              className="vpa-text-input"
                            />
                            <span className="field-hint-text">You will receive a payment request on your UPI app</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Method 2: Credit / Debit Card */}
                    {paymentMethod === 'CARD' && (
                      <div className="card-panel-content animate-fade">
                        <div className="input-group-field">
                          <label htmlFor="card-number-input">Card Number</label>
                          <input
                            id="card-number-input"
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4532 •••• •••• 8821"
                            required
                            className="vpa-text-input"
                          />
                        </div>

                        <div className="card-sub-grid">
                          <div className="input-group-field">
                            <label htmlFor="card-exp-input">Expiry Date</label>
                            <input
                              id="card-exp-input"
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              required
                              className="vpa-text-input"
                            />
                          </div>

                          <div className="input-group-field">
                            <label htmlFor="card-cvv-input">CVV</label>
                            <input
                              id="card-cvv-input"
                              type="password"
                              maxLength="4"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="•••"
                              required
                              className="vpa-text-input"
                            />
                          </div>
                        </div>

                        <div className="input-group-field">
                          <label htmlFor="card-name-input">Cardholder Name</label>
                          <input
                            id="card-name-input"
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name as printed on Card"
                            required
                            className="vpa-text-input"
                          />
                        </div>
                      </div>
                    )}

                    {/* Method 3: Net Banking */}
                    {paymentMethod === 'NETBANKING' && (
                      <div className="netbanking-panel-content animate-fade">
                        <div className="input-group-field">
                          <label htmlFor="netbanking-bank-select">Select Your Bank</label>
                          <select
                            id="netbanking-bank-select"
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="vpa-text-input bank-select"
                          >
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="State Bank of India">State Bank of India (SBI)</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                            <option value="Punjab National Bank">Punjab National Bank</option>
                            <option value="Bank of Baroda">Bank of Baroda</option>
                            <option value="Canara Bank">Canara Bank</option>
                            <option value="Union Bank of India">Union Bank of India</option>
                            <option value="IndusInd Bank">IndusInd Bank</option>
                          </select>
                          <span className="field-hint-text">You will be redirected to your bank's secure netbanking gateway</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Pay Button */}
                  <div className="checkout-action-wrap">
                    <button
                      type="submit"
                      className={`btn-primary-pay-join ${isProcessing ? 'loading' : ''}`}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span>Processing Secure Payment...</span>
                      ) : (
                        <>
                          <span>Pay ₹ {planAmount.toLocaleString('en-IN')} & Join Membership</span>
                          <ArrowRight size={19} />
                        </>
                      )}
                    </button>

                    <p className="checkout-security-footnote">
                      🔒 Payments are encrypted with 256-bit SSL and processed securely. Membership details will be saved to your verified Atomy account.
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Order Summary & Member Advantages Sidebar */}
            <div className="payment-right-sidebar">
              <div className="order-summary-card">
                <h3 className="summary-header-title">Order Summary</h3>

                <div className="summary-details-list">
                  <div className="summary-item-row">
                    <span className="item-label">Distributor Plan</span>
                    <span className="item-val">{selectedPlan === 'ANNUAL' ? 'Annual (365 Days)' : 'Monthly (30 Days)'}</span>
                  </div>

                  <div className="summary-item-row">
                    <span className="item-label">Base Fee</span>
                    <span className="item-val">₹ {basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="summary-item-row">
                    <span className="item-label">GST (18% Included)</span>
                    <span className="item-val">₹ {gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="summary-divider" />

                  <div className="summary-total-row">
                    <div className="total-label-box">
                      <span>Total Amount</span>
                      <small>(Inclusive of all taxes)</small>
                    </div>
                    <span className="total-amount-val">
                      ₹ {planAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Account Credited Info */}
                {currentUser && (
                  <div className="account-credited-strip">
                    <span className="account-label">ACCOUNT BEING CREDITED:</span>
                    <div className="account-name">{currentUser.name}</div>
                    <div className="account-email">{currentUser.email}</div>
                  </div>
                )}

                {/* Guaranteed Privileges Box */}
                <div className="sidebar-privileges-box">
                  <div className="privilege-title">
                    <Sparkles size={15} color="#00A3E0" />
                    <span>Included Distributor Benefits</span>
                  </div>
                  <ul className="privilege-bullets">
                    <li>✓ Instant Wholesale DP Prices (~20% Off)</li>
                    <li>✓ Personal PV Points on every purchase</li>
                    <li>✓ Priority Doorstep Delivery from warehouse</li>
                    <li>✓ Distributor certification & sales rights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
