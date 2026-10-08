import React, { useState } from 'react';
import {
  UserCheck,
  ShoppingCart,
  Truck,
  RotateCcw,
  LayoutDashboard,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  PhoneCall,
  FileText,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import './GuidePage.css';

export default function GuidePage({ onNavigateHome, onNavigateCategory, onNavigateSignIn }) {
  const [activeGuideTab, setActiveGuideTab] = useState('join');

  const JOIN_STEPS = [
    {
      step: 'Step 01',
      title: 'Eligibility & Sponsor ID Verification',
      desc: 'Applicant must be an Indian citizen aged 18 or above with a valid PAN Card and Aadhaar/Voter ID. Enter your sponsor’s 8-digit Member ID to attach to their lineage network.'
    },
    {
      step: 'Step 02',
      title: 'KYC Document Authentication',
      desc: 'Upload clear scans or photos of your PAN Card and Government Address Proof. Fast instant OTP verification ensures secure, compliant identity validation.'
    },
    {
      step: 'Step 03',
      title: 'Designate Your Local Education Centre',
      desc: 'Select your preferred official Atomy Education Centre located closest to your city or postal district to receive free parcel pickup and localized community mentoring.'
    },
    {
      step: 'Step 04',
      title: 'Account Generation & Immediate Access',
      desc: 'Your unique 8-digit Atomy Member ID is generated instantly. Sign in immediately to start shopping at exclusive Member Prices with complete PV accrual.'
    }
  ];

  const ORDER_STEPS = [
    {
      step: 'Step 01',
      title: 'Browse Shopping Mall & Add to Cart',
      desc: 'Explore Health Supplements (HemoHIM, Probiotics), Beauty (Absolute Skincare), Personal Care, and Home Living. Click "+ Add to Cart" or "Buy Now".'
    },
    {
      step: 'Step 02',
      title: 'Select Delivery Destination',
      desc: 'Choose either your Direct Home/Office Shipping Address or pick up from your affiliated Atomy Education Centre for free delivery options.'
    },
    {
      step: 'Step 03',
      title: 'Complete Secure Online Payment',
      desc: 'Pay safely through UPI (Google Pay, PhonePe, Paytm), RuPay / Visa / Mastercard, or Direct Net Banking. Instant order confirmation SMS and Email dispatched.'
    },
    {
      step: 'Step 04',
      title: 'Dispatch & Real-Time Tracking',
      desc: 'Orders are dispatched within 24-48 hours from the Gurugram Central Fulfillment Center with automated Blue Dart AWB tracking numbers.'
    }
  ];

  return (
    <div className="guide-page">
      {/* 1. Breadcrumbs */}
      <div className="guide-breadcrumb-bar">
        <div className="guide-container">
          <button type="button" className="bread-link" onClick={onNavigateHome}>
            HOME
          </button>
          <ChevronRight size={14} className="bread-sep" />
          <span className="bread-active">Guide</span>
        </div>
      </div>

      {/* 2. Header Banner */}
      <section className="guide-header-banner">
        <div className="guide-container">
          <div className="guide-banner-content">
            <span className="guide-eyebrow">USER GUIDE & OFFICIAL PROCEDURES</span>
            <h1 className="guide-title">Atomy India Member & Shopping Guide</h1>
            <p className="guide-subtitle">
              Step-by-step guides for seamless membership registration, ordering, express delivery tracking,
              and returns under Indian direct selling regulations.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Sub Navigation Tabs */}
      <nav className="guide-nav-tabs-wrapper">
        <div className="guide-container">
          <div className="guide-nav-tabs">
            <button
              className={`guide-tab-btn ${activeGuideTab === 'join' ? 'active' : ''}`}
              onClick={() => setActiveGuideTab('join')}
            >
              <UserCheck size={16} />
              <span>How to Join (Membership)</span>
            </button>
            <button
              className={`guide-tab-btn ${activeGuideTab === 'order' ? 'active' : ''}`}
              onClick={() => setActiveGuideTab('order')}
            >
              <ShoppingCart size={16} />
              <span>How to Order</span>
            </button>
            <button
              className={`guide-tab-btn ${activeGuideTab === 'delivery' ? 'active' : ''}`}
              onClick={() => setActiveGuideTab('delivery')}
            >
              <Truck size={16} />
              <span>Delivery & Shipping</span>
            </button>
            <button
              className={`guide-tab-btn ${activeGuideTab === 'returns' ? 'active' : ''}`}
              onClick={() => setActiveGuideTab('returns')}
            >
              <RotateCcw size={16} />
              <span>Return & Refund Policy</span>
            </button>
            <button
              className={`guide-tab-btn ${activeGuideTab === 'myoffice' ? 'active' : ''}`}
              onClick={() => setActiveGuideTab('myoffice')}
            >
              <LayoutDashboard size={16} />
              <span>My Office & Lineage</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 4. Tab Content Body */}
      <div className="guide-container guide-content-container">
        {/* TAB 1: HOW TO JOIN */}
        {activeGuideTab === 'join' && (
          <div className="guide-pane-fade">
            <div className="guide-pane-heading">
              <span className="kicker">FREE REGISTRATION • ZERO MEMBERSHIP FEES</span>
              <h2>How to Join Atomy India as a Registered Member</h2>
              <p>
                Atomy membership is 100% free with NO joining fee, NO mandatory monthly auto-ships,
                and NO annual renewal charges. Enjoy lifetime access to Member Prices and global Point Value.
              </p>
            </div>

            <div className="steps-flow-grid">
              {JOIN_STEPS.map((s, idx) => (
                <div key={idx} className="step-flow-card">
                  <div className="step-bubble">{s.step}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="kyc-checklist-card">
              <h3>Required Documents for Indian Residents</h3>
              <div className="kyc-items-grid">
                <div className="kyc-item">
                  <CheckCircle2 size={18} color="#00A3E0" />
                  <div>
                    <strong>Valid PAN Card</strong>
                    <span>Mandatory for tax identity and TDS compliance.</span>
                  </div>
                </div>
                <div className="kyc-item">
                  <CheckCircle2 size={18} color="#00A3E0" />
                  <div>
                    <strong>Proof of Address (Aadhaar / Passport / Voter ID)</strong>
                    <span>Ensures verified residential delivery and member authenticity.</span>
                  </div>
                </div>
                <div className="kyc-item">
                  <CheckCircle2 size={18} color="#00A3E0" />
                  <div>
                    <strong>Active Mobile Number & Email</strong>
                    <span>For OTP verification, order updates, and commission SMS.</span>
                  </div>
                </div>
                <div className="kyc-item">
                  <CheckCircle2 size={18} color="#00A3E0" />
                  <div>
                    <strong>Sponsor Member ID</strong>
                    <span>Required to place you in the bilateral direct selling lineage.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="join-cta-bar">
              <div>
                <h3>Ready to Join Atomy India?</h3>
                <p>Register online in minutes or sign in to your registered member account.</p>
              </div>
              <button
                type="button"
                className="guide-cta-btn"
                onClick={onNavigateSignIn}
              >
                <span>Proceed to Sign In / Join</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: HOW TO ORDER */}
        {activeGuideTab === 'order' && (
          <div className="guide-pane-fade">
            <div className="guide-pane-heading">
              <span className="kicker">ORDERING WORKFLOW</span>
              <h2>Step-by-Step Shopping Mall Ordering Guide</h2>
              <p>Simple, clean e-commerce ordering available 24 hours a day, 7 days a week.</p>
            </div>

            <div className="steps-flow-grid">
              {ORDER_STEPS.map((s, idx) => (
                <div key={idx} className="step-flow-card">
                  <div className="step-bubble blue">{s.step}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="order-payment-box">
              <h3>Supported Secure Payment Methods</h3>
              <p>
                All transactions are encrypted through RBI-compliant 256-bit SSL payment gateways with instant receipt issuance:
              </p>
              <div className="payment-badges-row">
                <span className="pay-badge">UPI (GPay / PhonePe / BHIM)</span>
                <span className="pay-badge">RuPay & Visa / Mastercard</span>
                <span className="pay-badge">Net Banking (50+ Indian Banks)</span>
                <span className="pay-badge">Wallets (Paytm / Mobikwik)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DELIVERY & SHIPPING */}
        {activeGuideTab === 'delivery' && (
          <div className="guide-pane-fade">
            <div className="guide-pane-heading">
              <span className="kicker">EXPRESS COURIER PARTNERS</span>
              <h2>Atomy India Delivery Standards & Guidelines</h2>
              <p>Ensuring absolute product freshness with rapid, tracked transit across India.</p>
            </div>

            <div className="delivery-cards-grid">
              <div className="delivery-rule-card">
                <div className="rule-icon"><Truck size={24} color="#00A3E0" /></div>
                <h3>Free Delivery Threshold</h3>
                <p>
                  Orders with an invoice value of <strong>₹ 4,500 or more</strong> qualify for
                  <strong> Free Express Home Delivery</strong> anywhere in India.
                </p>
                <div className="rule-sub">For orders below ₹ 4,500, a flat shipping fee of ₹ 150 applies.</div>
              </div>

              <div className="delivery-rule-card">
                <div className="rule-icon"><ShieldCheck size={24} color="#10b981" /></div>
                <h3>Free Center Pickup</h3>
                <p>
                  Members can choose to ship their orders directly to their affiliated
                  <strong> Official Education Centre</strong> with <strong>Zero Delivery Charges</strong>, regardless of order amount!
                </p>
                <div className="rule-sub">Collect at your convenience from your centre leader.</div>
              </div>

              <div className="delivery-rule-card">
                <div className="rule-icon"><Truck size={24} color="#f59e0b" /></div>
                <h3>Dispatch Timelines</h3>
                <p>
                  Processed and dispatched within <strong>24 to 48 hours</strong> from our Gurugram Central Fulfillment Center.
                </p>
                <div className="rule-sub">Metro: 2-4 days | Non-Metro: 4-6 days | Remote: 7-9 days.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RETURN & REFUND */}
        {activeGuideTab === 'returns' && (
          <div className="guide-pane-fade">
            <div className="guide-pane-heading">
              <span className="kicker">CONSUMER RIGHTS PROTECTION</span>
              <h2>30-Day 100% Satisfaction Guarantee & Return Policy</h2>
              <p>Atomy stands behind every item with an unconditional quality commitment.</p>
            </div>

            <div className="returns-body-card">
              <div className="return-policy-block">
                <h3>30-Day Money-Back Guarantee</h3>
                <p>
                  If you are not completely satisfied with your purchase, you may return the product within <strong>30 calendar days</strong> of receiving it for a full product refund (less reasonable shipping charges).
                </p>
              </div>

              <div className="return-policy-block">
                <h3>Return Process Guidelines</h3>
                <ol className="return-steps-list">
                  <li>Initiate a return request via <em>My Page &gt; Order History &gt; Return Request</em> or call our Toll-Free Helpline at <strong>1800-103-8200</strong>.</li>
                  <li>Our logistics team will schedule a reverse pickup from your registered address via Blue Dart.</li>
                  <li>Upon receipt and inspection at our Gurugram warehouse, refunds are credited back to your original source payment method within <strong>7 business days</strong>.</li>
                </ol>
              </div>

              <div className="return-policy-block">
                <h3>PV Adjustment on Returns</h3>
                <p>
                  When a returned order is refunded, any associated Point Value (PV) that was accrued from that order will be adjusted accordingly from your group and personal accounts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MY OFFICE & LINEAGE */}
        {activeGuideTab === 'myoffice' && (
          <div className="guide-pane-fade">
            <div className="guide-pane-heading">
              <span className="kicker">BUSINESS MANAGEMENT TERMINAL</span>
              <h2>Navigating My Office, Genealogy Tree & PV Tracker</h2>
              <p>Your comprehensive personal dashboard to track daily sales, group volume, and commission statements.</p>
            </div>

            <div className="myoffice-features-grid">
              <div className="myoffice-feature-box">
                <LayoutDashboard size={24} color="#00A3E0" />
                <h3>Genealogy (Lineage) Tree</h3>
                <p>Inspect your entire left leg and right leg distributor network, member join dates, and active statuses in real time.</p>
              </div>

              <div className="myoffice-feature-box">
                <FileText size={24} color="#10b981" />
                <h3>General Commission Records</h3>
                <p>Review daily matching scores, flushed points, and historic commission statements with complete tax compliance records.</p>
              </div>

              <div className="myoffice-feature-box">
                <UserCheck size={24} color="#f59e0b" />
                <h3>Group Purchase Records</h3>
                <p>Real-time analytics of downline consumption by product SKU, allowing leaders to mentor and support their teams effectively.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
