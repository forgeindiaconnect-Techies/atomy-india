import React, { useState } from 'react';
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  BadgePercent,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Check,
  HelpCircle,
  Truck,
  Award,
  ChevronRight,
  Star
} from 'lucide-react';
import {
  getMembershipSettings,
  enrollMembership,
  isUserMember,
  cancelMembership
} from '../../services/membershipService';
import './MembershipPage.css';

export default function MembershipPage({
  currentUser,
  isMember,
  onNavigateHome,
  onNavigateBack,
  onNavigateSignIn,
  onMembershipActivated,
  onNavigatePaymentPage
}) {
  const [selectedPlan, setSelectedPlan] = useState('ANNUAL');
  const [activeFaq, setActiveFaq] = useState(null);

  const settings = getMembershipSettings();
  const hasActiveMembership = isUserMember(currentUser);

  const handleSubscribe = (plan = selectedPlan) => {
    if (onNavigatePaymentPage) {
      onNavigatePaymentPage(plan);
      return;
    }

    if (!currentUser && onNavigateSignIn) {
      onNavigateSignIn('signin');
      return;
    }
  };

  const handlePaymentSuccess = (member) => {
    if (onMembershipActivated) {
      onMembershipActivated(member);
    }
  };

  const faqs = [
    {
      q: 'What is the Distributor Price (DP)?',
      a: 'Distributor Price (DP) is the exclusive wholesale rate offered only to registered Atomy Distributor Members. It offers an average 18% to 20% discount below the Maximum Retail Price (MRP) across our entire catalog.'
    },
    {
      q: 'What is PV (Point Value)?',
      a: 'Point Value (PV) is the numerical value assigned to each Atomy product. When an active Distributor Member purchases products at DP price, PV points accumulate directly to their member ID.'
    },
    {
      q: 'Do I get instant access to DP prices after subscribing?',
      a: 'Yes! As soon as your membership is activated, all product prices across the store automatically switch to wholesale Distributor Price (DP), and PV points become visible on all cards.'
    },
    {
      q: 'Can I cancel or switch my plan?',
      a: 'Yes, you can renew or manage your membership anytime from your Profile under the Distributor Membership tab without any cancellation penalties or hidden fees.'
    }
  ];

  return (
    <div className="membership-fullpage-wrapper">
      {/* Top Breadcrumb Bar */}
      <div className="membership-top-bar">
        <div className="container membership-top-bar-container">
          <button
            type="button"
            className="membership-back-btn"
            onClick={onNavigateBack || onNavigateHome}
          >
            <ArrowLeft size={16} />
            <span>Back to Shopping Mall</span>
          </button>
          <div className="membership-breadcrumb">
            <span onClick={onNavigateHome} style={{ cursor: 'pointer' }}>Home</span>
            <ChevronRight size={13} />
            <span className="current-crumb">Distributor Membership</span>
          </div>
        </div>
      </div>

      <div className="container membership-page-content">
        {/* Hero Section */}
        <div className="membership-hero-card">
          <div className="membership-gold-badge">
            <Crown size={15} />
            <span>OFFICIAL ATOMY DISTRIBUTOR MEMBERSHIP</span>
          </div>

          <h1 className="membership-hero-title">
            Join Membership to get the Distributor Price (DP) & Earn PV
          </h1>
          <p className="membership-hero-subtitle">
            Unlock wholesale member pricing across all premium Korean skincare, health supplements,
            and personal care essentials with Point Value (PV) benefits.
          </p>

          {hasActiveMembership && (
            <div className="membership-status-active-box">
              <div className="active-badge-icon">
                <ShieldCheck size={28} color="#059669" />
              </div>
              <div className="active-badge-details">
                <h3>Active Distributor Member</h3>
                <p>
                  Welcome, <strong>{currentUser?.name || 'Member'}</strong>! Wholesale Distributor Pricing (DP) is active on your account.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-continue-mall"
                  onClick={onNavigateHome}
                >
                  Start Shopping at DP Price
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel your distributor membership?')) {
                      cancelMembership(currentUser);
                      if (onMembershipActivated) {
                        onMembershipActivated(null);
                      }
                    }
                  }}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#b91c1c',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Membership
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="membership-benefits-section">
          <h2 className="section-title-center">Distributor Member Privileges</h2>
          <p className="section-sub-center">Everything you receive as an official Atomy Distributor</p>

          <div className="membership-benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-box blue">
                <BadgePercent size={24} />
              </div>
              <h3>Wholesale DP Pricing</h3>
              <p>Save ~18% to 20% on every order. Purchase all authentic Atomy products at direct wholesale distributor rates rather than retail MRP.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box cyan">
                <Sparkles size={24} />
              </div>
              <h3>Personal PV Points</h3>
              <p>Every purchase accumulates Point Value (PV) credited straight to your profile, unlocking distributor compensation advantages.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box green">
                <Truck size={24} />
              </div>
              <h3>Priority Fast Dispatch</h3>
              <p>Enjoy expedited order packaging and free standard delivery on qualifying Atomy orders directly from our verified warehouse.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box purple">
                <Award size={24} />
              </div>
              <h3>Absolute Quality Guarantee</h3>
              <p>100% genuine Korean wellness and personal care formulations backed by Kolmar BNH and Atomy Global standards.</p>
            </div>
          </div>
        </div>

        {/* Plan Selection Section */}
        <div className="membership-pricing-section">
          <div className="pricing-header-wrap">
            <h2 className="section-title-center">Choose Your Membership Plan</h2>
            <p className="section-sub-center">Simple, transparent pricing with no hidden charges</p>
          </div>

          <div className="membership-plans-container">
            {/* Monthly Plan */}
            <div
              className={`plan-box ${selectedPlan === 'MONTHLY' ? 'active' : ''}`}
              onClick={() => setSelectedPlan('MONTHLY')}
            >
              <div className="plan-header">
                <div className="plan-radio-row">
                  <div className={`radio-circle ${selectedPlan === 'MONTHLY' ? 'checked' : ''}`}>
                    {selectedPlan === 'MONTHLY' && <div className="radio-inner" />}
                  </div>
                  <span className="plan-name">Monthly Plan</span>
                </div>
                <div className="plan-cost">
                  <span className="currency">₹</span>
                  <span className="amount">{settings.monthlyFee}</span>
                  <span className="cadence">/ month</span>
                </div>
              </div>

              <ul className="plan-feature-list">
                <li><Check size={16} color="#00A3E0" /> Instant access to Wholesale DP Price</li>
                <li><Check size={16} color="#00A3E0" /> Personal PV point value credit</li>
                <li><Check size={16} color="#00A3E0" /> 30 days active distributor status</li>
                <li><Check size={16} color="#00A3E0" /> Cancel or renew anytime</li>
              </ul>

              <button
                type="button"
                className={`plan-select-btn ${selectedPlan === 'MONTHLY' ? 'btn-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan('MONTHLY');
                  handleSubscribe('MONTHLY');
                }}
              >
                {hasActiveMembership ? 'Renew Monthly' : 'Continue with Monthly Plan'}
              </button>
            </div>

            {/* Annual Plan (Best Value) */}
            <div
              className={`plan-box featured ${selectedPlan === 'ANNUAL' ? 'active' : ''}`}
              onClick={() => setSelectedPlan('ANNUAL')}
            >
              <div className="featured-pill">BEST VALUE • SAVE 30%</div>

              <div className="plan-header">
                <div className="plan-radio-row">
                  <div className={`radio-circle ${selectedPlan === 'ANNUAL' ? 'checked' : ''}`}>
                    {selectedPlan === 'ANNUAL' && <div className="radio-inner" />}
                  </div>
                  <span className="plan-name">Annual Plan</span>
                </div>
                <div className="plan-cost">
                  <span className="currency">₹</span>
                  <span className="amount">{settings.annualFee}</span>
                  <span className="cadence">/ year</span>
                </div>
              </div>

              <ul className="plan-feature-list">
                <li><Check size={16} color="#059669" /> <strong>Full 365 Days</strong> of Wholesale DP Price</li>
                <li><Check size={16} color="#059669" /> Maximum PV accumulation on all orders</li>
                <li><Check size={16} color="#059669" /> Save ₹1,089 compared to monthly billing</li>
                <li><Check size={16} color="#059669" /> Priority distributor customer care</li>
                <li><Check size={16} color="#059669" /> Early access to new product releases</li>
              </ul>

              <button
                type="button"
                className={`plan-select-btn featured-btn ${selectedPlan === 'ANNUAL' ? 'btn-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan('ANNUAL');
                  handleSubscribe('ANNUAL');
                }}
              >
                {hasActiveMembership ? 'Renew Annual Plan' : 'Continue with Annual Plan (Recommended)'}
              </button>
            </div>
          </div>

          {/* Action CTA */}
          <div className="membership-cta-block">
            {hasActiveMembership ? (
              <div className="already-active-prompt">
                <ShieldCheck size={20} color="#059669" />
                <span>Your Atomy Distributor Membership is currently active. You enjoy wholesale DP pricing on all orders!</span>
              </div>
            ) : (
              <button
                type="button"
                id="btn-membership-continue-checkout"
                className="main-subscribe-btn"
                onClick={() => handleSubscribe(selectedPlan)}
              >
                <span>Continue to Payment & Checkout (₹ {selectedPlan === 'ANNUAL' ? settings.annualFee : settings.monthlyFee})</span>
                <ArrowRight size={18} />
              </button>
            )}
            <p className="security-guarantee-note">
              🔒 100% Secure Checkout • Instant Activation • Cancel Anytime
            </p>
          </div>
        </div>

        {/* Real Example Price Comparison */}
        <div className="price-comparison-section">
          <h2 className="section-title-center">See How Much You Save with DP</h2>
          <p className="section-sub-center">Comparison of retail MRP vs wholesale Distributor Price</p>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Retail MRP</th>
                  <th>Member DP Price</th>
                  <th>You Save</th>
                  <th>PV Points</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Atomy Toothpaste (200g x 5)</strong></td>
                  <td className="strike">₹ 1,100.00</td>
                  <td className="dp-col">₹ 900.00</td>
                  <td className="save-col"><span className="save-pill">₹ 200 (18%)</span></td>
                  <td className="pv-col">3,250 PV</td>
                </tr>
                <tr>
                  <td><strong>Atomy Absolute Skincare 6 Set</strong></td>
                  <td className="strike">₹ 19,000.00</td>
                  <td className="dp-col">₹ 15,500.00</td>
                  <td className="save-col"><span className="save-pill">₹ 3,500 (18%)</span></td>
                  <td className="pv-col">130,000 PV</td>
                </tr>
                <tr>
                  <td><strong>Atomy Hair & Body Herbal Shampoo</strong></td>
                  <td className="strike">₹ 1,350.00</td>
                  <td className="dp-col">₹ 1,100.00</td>
                  <td className="save-col"><span className="save-pill">₹ 250 (19%)</span></td>
                  <td className="pv-col">5,200 PV</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="membership-faq-section">
          <h2 className="section-title-center">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                >
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                  </div>
                  {isOpen && <p className="faq-answer">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
