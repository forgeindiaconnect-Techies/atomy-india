import React, { useState } from 'react';
import { 
  Crown, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  X, 
  Check, 
  Sparkles,
  ArrowRight,
  Clock,
  BadgePercent
} from 'lucide-react';
import { 
  getMembershipSettings, 
  enrollMembership, 
  isUserMember 
} from '../../services/membershipService';
import MembershipPaymentModal from './MembershipPaymentModal';
import './MembershipModal.css';

export default function MembershipModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onMembershipActivated,
  onNavigateSignIn 
}) {
  const [selectedPlan, setSelectedPlan] = useState('ANNUAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const settings = getMembershipSettings();
  const hasActiveMembership = isUserMember(currentUser);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    if (!currentUser) {
      onClose();
      if (onNavigateSignIn) {
        onNavigateSignIn('signin');
      }
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (member) => {
    if (onMembershipActivated) {
      onMembershipActivated(member);
    }
    onClose();
  };

  return (
    <div className="membership-modal-backdrop" onClick={onClose}>
      <div className="membership-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="membership-modal-top">
          <div className="modal-badge-row">
            <div className="membership-gold-pill">
              <Crown size={14} />
              <span>OFFICIAL ATOMY DISTRIBUTOR MEMBERSHIP</span>
            </div>
            <button type="button" className="membership-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <h2 className="modal-main-title">
            Unlock Wholesale DP Prices & Earn Personal PV
          </h2>
          <p className="modal-main-desc">
            Become an official Atomy Distributor Member to purchase all products at wholesale 
            <strong> Distributor Price (DP)</strong> instead of MRP and earn <strong>PV (Point Value)</strong> points.
          </p>
        </div>

        {/* Modal Body */}
        <div className="membership-modal-body">
          {hasActiveMembership ? (
            /* Already a member state */
            <div className="already-member-box">
              <div className="active-shield-wrap">
                <ShieldCheck size={36} color="#16a34a" />
              </div>
              <h3>You are an Active Atomy Member!</h3>
              <p>Your account is unlocked with wholesale Distributor Pricing (DP) and full Personal PV point accumulation across all catalog items.</p>
              
              <div className="member-perks-checklist">
                <div className="perk-line">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Wholesale DP Prices applied automatically across the mall</span>
                </div>
                <div className="perk-line">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Full Personal PV point value credited with every order</span>
                </div>
              </div>

              <button type="button" className="btn-modal-action primary" onClick={onClose}>
                Continue Shopping with DP Prices
              </button>
            </div>
          ) : (
            <>
              {/* Feature Highlights Grid */}
              <div className="membership-perks-grid">
                <div className="perk-highlight-box">
                  <div className="perk-icon-circle blue">
                    <BadgePercent size={20} />
                  </div>
                  <div>
                    <h4>Wholesale DP Pricing</h4>
                    <p>Save ~18% to 20% on every order with direct Distributor Pricing instead of MRP.</p>
                  </div>
                </div>

                <div className="perk-highlight-box">
                  <div className="perk-icon-circle purple">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4>Personal PV Earnings</h4>
                    <p>Accumulate valuable PV points on every product purchase across the Atomy catalog.</p>
                  </div>
                </div>
              </div>

              {/* Plan Selection Cards */}
              <div className="plan-choices-wrapper">
                <div className="plan-choices-header">Select Your Membership Plan:</div>

                <div className="plans-grid">
                  {/* Monthly Plan */}
                  <div 
                    className={`plan-card-option ${selectedPlan === 'MONTHLY' ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan('MONTHLY')}
                  >
                    <div className="plan-card-inner">
                      <div className="plan-radio-row">
                        <div className={`custom-radio ${selectedPlan === 'MONTHLY' ? 'checked' : ''}`}>
                          {selectedPlan === 'MONTHLY' && <div className="radio-dot" />}
                        </div>
                        <div className="plan-period-title">Monthly Plan</div>
                      </div>
                      <div className="plan-price-large">
                        ₹ {settings.monthlyFee}
                        <span className="per-text">/ month</span>
                      </div>
                      <div className="plan-validity-text">
                        <Clock size={12} />
                        <span>Recurring 30-day membership</span>
                      </div>
                    </div>
                  </div>

                  {/* Annual Plan (Recommended) */}
                  <div 
                    className={`plan-card-option recommended ${selectedPlan === 'ANNUAL' ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan('ANNUAL')}
                  >
                    <span className="save-badge">RECOMMENDED • SAVE 30%</span>
                    <div className="plan-card-inner">
                      <div className="plan-radio-row">
                        <div className={`custom-radio ${selectedPlan === 'ANNUAL' ? 'checked' : ''}`}>
                          {selectedPlan === 'ANNUAL' && <div className="radio-dot" />}
                        </div>
                        <div className="plan-period-title">Annual Plan</div>
                      </div>
                      <div className="plan-price-large">
                        ₹ {settings.annualFee}
                        <span className="per-text">/ year</span>
                      </div>
                      <div className="plan-validity-text">
                        <Sparkles size={12} />
                        <span>365 days of wholesale pricing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="membership-modal-actions">
                {!currentUser ? (
                  <button 
                    type="button" 
                    className="btn-modal-action primary"
                    onClick={handleSubscribe}
                  >
                    <span>Sign In to Activate Membership</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className={`btn-modal-action primary ${isProcessing ? 'loading' : ''}`}
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span>Activating Your Atomy Membership...</span>
                    ) : (
                      <>
                        <span>Subscribe & Unlock Wholesale DP</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
                
                <p className="modal-guarantee-note">
                  🔒 Secure activation • Cancel anytime • Zero hidden renewal fees
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <MembershipPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currentUser={currentUser}
        plan={selectedPlan}
        planAmount={selectedPlan === 'ANNUAL' ? settings.annualFee : settings.monthlyFee}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
