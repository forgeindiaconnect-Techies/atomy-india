import React, { useState } from 'react';
import {
  ChevronRight,
  User,
  Users,
  ClipboardList,
  Store,
  Building2,
  FileDown
} from 'lucide-react';
import bannerImg from '../../assets/bn_1280x200_0.jpg';
import './CompensationPlanPage.css';

// Reusable Mastership Hexagon Badges matching Atomy India
function MastershipHexBadge({ type }) {
  switch (type) {
    case 'sales':
      return (
        <svg width="34" height="38" viewBox="0 0 34 38" fill="none" className="mastership-hex-badge">
          <path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096e6" />
          <text x="17" y="26" textAnchor="middle" fill="#ffffff" fontSize="21" fontWeight="700" fontFamily="sans-serif">$</text>
        </svg>
      );
    case 'diamond':
      return (
        <svg width="34" height="38" viewBox="0 0 34 38" fill="none" className="mastership-hex-badge">
          <path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096e6" />
          <path d="M17 10L24.5 16.5L17 28L9.5 16.5L17 10Z" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M9.5 16.5H24.5M17 10V28M12.5 16.5L17 28M21.5 16.5L17 28" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" />
        </svg>
      );
    case 'sharon':
      return (
        <svg width="34" height="38" viewBox="0 0 34 38" fill="none" className="mastership-hex-badge">
          <path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096e6" />
          <circle cx="17" cy="16.5" r="3" fill="#ffffff" />
          <path d="M17 11.5C15 11.5 13.5 13 13.5 15C13.5 17.5 17 22 17 22C17 22 20.5 17.5 20.5 15C20.5 13 19 11.5 17 11.5Z" stroke="#ffffff" strokeWidth="1.3" fill="none" />
          <path d="M14 20C11.5 21.5 11 24.5 11 26" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M20 20C22.5 21.5 23 24.5 23 26" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'star':
      return (
        <svg width="34" height="38" viewBox="0 0 34 38" fill="none" className="mastership-hex-badge">
          <path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096e6" />
          <polygon points="17,9 19.5,15 26,15.5 21.2,19.5 22.8,26 17,22.5 11.2,26 12.8,19.5 8,15.5 14.5,15" fill="#ffffff" />
        </svg>
      );
    case 'royal':
      return (
        <svg width="34" height="38" viewBox="0 0 34 38" fill="none" className="mastership-hex-badge">
          <path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096e6" />
          <path d="M9 25H25M9 25L11 15.5L14 19.5L17 13L20 19.5L23 15.5L25 25H9Z" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
          <circle cx="11" cy="14" r="1.2" fill="#ffffff" />
          <circle cx="17" cy="11.5" r="1.2" fill="#ffffff" />
          <circle cx="23" cy="14" r="1.2" fill="#ffffff" />
        </svg>
      );
    case 'crown':
      return (
        <svg width="34" height="38" viewBox="0 0 34 38" fill="none" className="mastership-hex-badge">
          <path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096e6" />
          <path d="M9 25H25L26 16.5L20.5 20L17 12L13.5 20L8 16.5L9 25Z" fill="#ffffff" />
          <circle cx="8" cy="15" r="1.3" fill="#ffffff" />
          <circle cx="17" cy="10.5" r="1.3" fill="#ffffff" />
          <circle cx="26" cy="15" r="1.3" fill="#ffffff" />
        </svg>
      );
    case 'imperial':
      return (
        <svg width="34" height="38" viewBox="0 0 34 38" fill="none" className="mastership-hex-badge">
          <path d="M17 1L33 9.5V28.5L17 37L1 28.5V9.5L17 1Z" fill="#0096e6" />
          <path d="M8 25H26M10.5 25L10.5 18C10.5 15 13.5 13 17 13C20.5 13 23.5 15 23.5 18L23.5 25M17 13V8.5M14.5 10.5H19.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="17" cy="17" r="1.6" fill="#ffffff" />
        </svg>
      );
    default:
      return null;
  }
}

export default function CompensationPlanPage({ onNavigateHome, onNavigateBack, onNavigateView }) {
  const [activeTab, setActiveTab] = useState('dealership'); // dealership, commission, promotion

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = '/Atomy_Compensation_Plan_May_2026.pdf';
    link.download = 'Atomy Compensation Plan - May 2026.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="cst-plan-wrapper">
      <div className="container cst-plan-main-container">
        {/* Top Header Row with Title, Breadcrumb & Download PDF */}
        <div className="cst-plan-title-bar">
          <h1 className="cst-page-title">Compensation Plan</h1>

          <div className="cst-top-right-group">
            <div className="cst-breadcrumb">
              <span
                className="bread-link"
                onClick={() => (onNavigateView ? onNavigateView('about-us') : onNavigateHome())}
              >
                About Us
              </span>
              <span className="bread-sep">&gt;</span>
              <span className="bread-active">Compensation Plan</span>
            </div>

            <button
              type="button"
              className="cst-pdf-download-btn"
              onClick={handleDownloadPdf}
              title="Download Atomy Compensation Plan - May 2026 PDF"
            >
              <FileDown size={16} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Hero Visual Banner (matching bn_1280x200_0.jpg) */}
        <div
          className="cst-plan-hero-banner"
          style={{ backgroundImage: `url(${bannerImg})` }}
        >
          <div className="cst-plan-hero-text">
            <p>
              The Well-Balanced, Righteous<br />
              Marketing Plan shows the<br />
              Company's Vision for Success<br />
              of All Atomy Members.
            </p>
          </div>
        </div>

        {/* 3 Interactive Nav Tabs */}
        <div className="cst-plan-tabs-row" role="tablist">
          <button
            type="button"
            className={`cst-tab-btn ${activeTab === 'dealership' ? 'active' : ''}`}
            onClick={() => setActiveTab('dealership')}
            role="tab"
            aria-selected={activeTab === 'dealership'}
          >
            <span>Dealership Class</span>
          </button>
          <button
            type="button"
            className={`cst-tab-btn ${activeTab === 'commission' ? 'active' : ''}`}
            onClick={() => setActiveTab('commission')}
            role="tab"
            aria-selected={activeTab === 'commission'}
          >
            <span>Commission</span>
          </button>
          <button
            type="button"
            className={`cst-tab-btn ${activeTab === 'promotion' ? 'active' : ''}`}
            onClick={() => setActiveTab('promotion')}
            role="tab"
            aria-selected={activeTab === 'promotion'}
          >
            <span>Promotion Criteria</span>
          </button>
        </div>

        {/* TAB 1: DEALERSHIP CLASS (Exactly matching Original in.atomy.com style & flow) */}
        {activeTab === 'dealership' && (
          <div className="cst-plan-panel animate-fade-in">
            <div className="cst-plan-header-block">
              <h3 className="cst-section-title">Class Sequence and Conditions</h3>
              <div className="cst-sub-desc">
                <span className="main-sub">Minimum PV that must be obtained for each level.</span>
                <span className="noti">* Based on personal sales and could be changed every month depends on downline sales.</span>
              </div>
            </div>

            {/* 5 Dealership Flow Sequence Boxes with Connecting Chevron Arrows */}
            <div className="cst-dealership-cards-grid">
              {/* 1. SALES REP */}
              <div className="cst-class-card">
                <div className="cst-class-header">
                  <User size={24} className="cst-class-icon" />
                  <span className="cst-class-title">SALES REP</span>
                </div>
                <div className="cst-class-body">
                  <p className="cst-class-sub">
                    Accumulated between<br />
                    <strong>10,000 PV ~ 2,99,999 PV</strong>
                  </p>
                </div>
              </div>

              {/* 2. AGENT */}
              <div className="cst-class-card">
                <div className="cst-class-header">
                  <Users size={24} className="cst-class-icon" />
                  <span className="cst-class-title">AGENT</span>
                </div>
                <div className="cst-class-body">
                  <p className="cst-class-sub">
                    Accumulate a minimum of<br />
                    <strong>3 Lakh PV</strong> or a Sales Rep with a smaller leg of at least <strong>6 Lakh PV</strong> accumulated in the previous month
                  </p>
                </div>
              </div>

              {/* 3. SPECIAL AGENT */}
              <div className="cst-class-card">
                <div className="cst-class-header">
                  <ClipboardList size={24} className="cst-class-icon" />
                  <span className="cst-class-title">SPECIAL AGENT</span>
                </div>
                <div className="cst-class-body">
                  <p className="cst-class-sub">
                    Accumulated a minimum of<br />
                    <strong>7 Lakh PV</strong> or an Agent with a smaller leg of at least <strong>14 Lakh PV</strong> accumulated in the previous month
                  </p>
                </div>
              </div>

              {/* 4. DEALER */}
              <div className="cst-class-card">
                <div className="cst-class-header">
                  <Store size={24} className="cst-class-icon" />
                  <span className="cst-class-title">DEALER</span>
                </div>
                <div className="cst-class-body">
                  <p className="cst-class-sub">
                    Accumulated a minimum of<br />
                    <strong>15 Lakh PV</strong> or an Special Agent with a smaller leg of at least <strong>30 Lakh PV</strong> accumulated in the previous month
                  </p>
                </div>
              </div>

              {/* 5. EXCLUSIVE DISTRIBUTOR */}
              <div className="cst-class-card">
                <div className="cst-class-header">
                  <Building2 size={24} className="cst-class-icon" />
                  <span className="cst-class-title">
                    EXCLUSIVE<br />DISTRIBUTOR
                  </span>
                </div>
                <div className="cst-class-body">
                  <p className="cst-class-sub">
                    Accumulated a minimum of<br />
                    <strong>24 Lakh PV</strong> or an Dealer with a smaller leg of at least <strong>48 Lakh PV</strong> accumulated in the previous month
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMMISSION */}
        {activeTab === 'commission' && (
          <div className="cst-plan-panel animate-fade-in">
            {/* Commission Standard */}
            <div className="cst-plan-part">
              <div className="cst-plan-header-block">
                <h3 className="cst-section-title">Commission Standard</h3>
                <div className="cst-sub-desc">
                  <span className="main-sub">
                    Based on membership class sequence, General commission, Mastership Bonus, and Education commission, the total payment allowance of the member will be paid by settling 70% of the attainment point(PV).
                  </span>
                  <span className="noti">※ The total amount of commission to members does not exceed 35% of total sales income.</span>
                </div>
              </div>
            </div>

            {/* Commission Types */}
            <div className="cst-plan-part">
              <div className="cst-plan-header-block">
                <h3 className="cst-section-title">Commission Types</h3>
                <div className="cst-sub-desc">
                  <span className="main-sub">Distributors will be entitled to the following Five types of benefits and incentives:</span>
                </div>
              </div>

              <div className="cst-table-wrapper">
                <table className="cst-data-table">
                  <colgroup>
                    <col style={{ width: '28%' }} />
                    <col style={{ width: '72%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Types</th>
                      <th>Prerequisite</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="bold-cell">Type-1, Retail Profit</td>
                      <td>Distributor can earn Upto 25% by selling products of the Company on MRP</td>
                    </tr>
                    <tr>
                      <td className="bold-cell">Type-2, General Commission</td>
                      <td>Upto 44% of Global PVs* will be distributed to qualified members/distributors who fulfill the requirements of General Commission as mentioned in the Compensation Plan</td>
                    </tr>
                    <tr>
                      <td className="bold-cell">Type-3, Mastership Bonus</td>
                      <td>This is the third type of commission, in which 20% of Global PVs* will be distributed amongst the achievers (7 levels of Mastership)</td>
                    </tr>
                    <tr>
                      <td className="bold-cell">Type-4, Mastership Promotion &amp; Incentives</td>
                      <td>On achievement of Mastership Rank One Time incentives will be awarded to qualified members/distributors</td>
                    </tr>
                    <tr>
                      <td className="bold-cell">Type-5, Education Centre Commission</td>
                      <td>In approved Education Centres, training will be provided related to Atomy's Compensation Plan, Product. Policies and procedures shall be provided to any consumer or any Distributor/Prospective Distributor. 6% of Centre's total PV is paid to the applicable Centre to cover operational expenses</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="cst-note-callout">
                *Global PVs - Refers to the sum total of PVs accumulated by the Distributors associated with Atomy group companies at a global level.
              </div>
            </div>

            {/* General Commission (44%) */}
            <div className="cst-plan-part">
              <div className="cst-plan-header-block">
                <h3 className="cst-section-title">General Commission</h3>
                <div className="cst-sub-desc">
                  <span className="main-sub">
                    44% of entire sales PV will be distributed between qualified members every week according to the rate. Individuals must first accumulate at least 10,000 PV in order to accumulate downline PVs.
                  </span>
                </div>
              </div>

              <div className="cst-table-wrapper">
                <table className="cst-data-table">
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Grade/Score</th>
                      <th>My Grade Standard</th>
                      <th>Daily Small Leg**</th>
                      <th>Commission in INR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="center-cell bold-cell">8 level / 5 pts</td>
                      <td className="center-cell">SALES REP</td>
                      <td className="center-cell">Accumulated &ge; 3 lakh PV</td>
                      <td className="center-cell inr-cell">₹1,321</td>
                    </tr>
                    <tr>
                      <td className="center-cell bold-cell">7 level / 15 pts</td>
                      <td className="center-cell">AGENT</td>
                      <td className="center-cell">Accumulated &ge; 3 lakh PV</td>
                      <td className="center-cell inr-cell">₹3,964</td>
                    </tr>
                    <tr>
                      <td className="center-cell bold-cell">6 level / 30 pts</td>
                      <td className="center-cell">SPECIAL AGENT</td>
                      <td className="center-cell">&ge; 7 lakh PV</td>
                      <td className="center-cell inr-cell">₹7,929</td>
                    </tr>
                    <tr>
                      <td className="center-cell bold-cell">5 level / 60 pts</td>
                      <td className="center-cell">DEALER</td>
                      <td className="center-cell">&ge; 15 lakh PV</td>
                      <td className="center-cell inr-cell">₹15,857</td>
                    </tr>
                    <tr>
                      <td className="center-cell bold-cell">4 level / 90 pts</td>
                      <td className="center-cell">EXCLUSIVE DISTRIBUTOR</td>
                      <td className="center-cell">&ge; 24 lakh PV</td>
                      <td className="center-cell inr-cell">₹23,786</td>
                    </tr>
                    <tr>
                      <td className="center-cell bold-cell">3 level / 150 pts</td>
                      <td className="center-cell">EXCLUSIVE DISTRIBUTOR</td>
                      <td className="center-cell">&ge; 60 lakh PV</td>
                      <td className="center-cell inr-cell">₹39,644</td>
                    </tr>
                    <tr>
                      <td className="center-cell bold-cell">2 level / 250 pts</td>
                      <td className="center-cell">EXCLUSIVE DISTRIBUTOR</td>
                      <td className="center-cell">&ge; 2 Crore PV</td>
                      <td className="center-cell inr-cell">₹66,073</td>
                    </tr>
                    <tr>
                      <td className="center-cell bold-cell">1 level / 300 pts</td>
                      <td className="center-cell">EXCLUSIVE DISTRIBUTOR</td>
                      <td className="center-cell">&ge; 5 Crore PV</td>
                      <td className="center-cell inr-cell">₹79,287</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="cst-note-callout">
                <p>• Sponsorship allowance is paid on the following Tuesday by adding up weeks after daily closing from Wednesday to next Tuesday.</p>
                <p>• Personal PV may be added to the smaller leg for calculating commission.</p>
                <p>• Personal PV (applied to the small leg) - left leg PV, and right leg PV will be flushed and reset to 0 when a general commission match occurs during daily settlement.</p>
                <p><strong>** My Accumulated PV does not reset.</strong></p>
              </div>
            </div>

            {/* Mastership Bonus (20%) */}
            <div className="cst-plan-part">
              <div className="cst-plan-header-block">
                <h3 className="cst-section-title">Mastership Bonus</h3>
                <div className="cst-sub-desc">
                  <span className="main-sub">20% of entire sales PV will be distributed according to each mastership.</span>
                </div>
              </div>

              <div className="cst-table-wrapper">
                <table className="cst-data-table">
                  <colgroup>
                    <col style={{ width: '26%' }} />
                    <col style={{ width: '46%' }} />
                    <col style={{ width: '28%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Mastership</th>
                      <th>Conditions for Maintaining Qualifications</th>
                      <th>Mastership Bonus</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="sales" />
                          <span className="cst-master-name">Sales Master</span>
                        </div>
                      </td>
                      <td>
                        <strong>Special Agent</strong> with a minimum of 25 lakh Group PV under each leg.<br />
                        If the total PV of the smaller leg exceeds 3 lakh PV, personal PV acquired during the point accumulation period can be added to the smaller leg to achieve Mastership.
                      </td>
                      <td><strong>10% of total PV</strong> distributed equally to Sales Masters</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="diamond" />
                          <span className="cst-master-name">Diamond Master</span>
                        </div>
                      </td>
                      <td>
                        <strong>Dealer</strong> with minimum 2 Sales Masters under each leg
                      </td>
                      <td><strong>5% of total PV</strong> distributed equally to Diamond Masters and higher Masterships</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="sharon" />
                          <span className="cst-master-name">Sharon Rose Master</span>
                        </div>
                      </td>
                      <td>
                        <strong>Exclusive Distributor</strong> with minimum 2 Diamond Masters under each leg
                      </td>
                      <td><strong>2% of total PV</strong> distributed equally to Sharon-Rose Masters and higher Masterships</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="star" />
                          <span className="cst-master-name">Star Master</span>
                        </div>
                      </td>
                      <td>
                        <strong>Exclusive Distributor</strong> with minimum 2 Sharon-Rose Masters under each leg
                      </td>
                      <td><strong>1.2% of total PV</strong> distributed equally to Star Masters and higher Masterships</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="royal" />
                          <span className="cst-master-name">Royal Master</span>
                        </div>
                      </td>
                      <td>
                        <strong>Exclusive Distributor</strong> with minimum 2 Star Masters under each leg
                      </td>
                      <td><strong>1% of total PV</strong> distributed equally to Royal Masters and higher Masterships</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="crown" />
                          <span className="cst-master-name">Crown Master</span>
                        </div>
                      </td>
                      <td>
                        <strong>Exclusive Distributor</strong> with minimum 2 Royal Masters under each leg
                      </td>
                      <td><strong>0.5% of total PV</strong> distributed equally to Crown Masters and higher Masterships</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="imperial" />
                          <span className="cst-master-name">Imperial Master</span>
                        </div>
                      </td>
                      <td>
                        <strong>Exclusive Distributor</strong> with minimum 2 Crown Masters under each leg
                      </td>
                      <td><strong>0.3% of total PV</strong> distributed equally to Imperial Masters</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="cst-note-callout">
                <p>• Mastership Bonus for the 1st period will be paid on the 22nd and 2nd period will be paid on 7th of each month.</p>
                <p>• Point Value Accumulation Period: 1st – 15th, 16th – End of month.</p>
              </div>
            </div>

            {/* Education Centre Commission (6%) */}
            <div className="cst-plan-part">
              <div className="cst-plan-header-block">
                <h3 className="cst-section-title">Education Centre Commission</h3>
                <div className="cst-sub-desc">
                  <span className="main-sub">
                    6% of a centre's total PV is paid to the applicable Education centre to cover operational expenses.
                  </span>
                  <span className="noti">
                    ※ The total amount of commission to members/distributors cannot exceed 35% of total sales income. All calculations of commissions and bonus are automatically set to this limit. Note – Commissions, bonuses and incentives shall be disbursed after deducting applicable taxes as per rules and regulations.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROMOTION CRITERIA (Matching User's Reference Screenshot) */}
        {activeTab === 'promotion' && (
          <div className="cst-plan-panel animate-fade-in">
            {/* Section 1: Promotion Criteria by Mastership */}
            <div className="cst-plan-part">
              <div className="cst-plan-header-block">
                <h3 className="cst-section-title">Promotion Criteria by Mastership</h3>
              </div>

              {/* Exact 2 Split Cards matching Screenshot */}
              <div className="cst-criteria-split-container">
                {/* Left Card: No restriction on promotion */}
                <div className="cst-criteria-split-card">
                  <div className="criteria-left-pane">
                    <div className="criteria-dark-circle-icon">
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <circle cx="18" cy="18" r="18" fill="#2d3748" />
                        <rect x="10" y="12" width="16" height="15" rx="2.5" stroke="#ffffff" strokeWidth="1.6" />
                        <line x1="14" y1="9.5" x2="14" y2="13" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
                        <line x1="22" y1="9.5" x2="22" y2="13" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
                        <line x1="10" y1="16.5" x2="26" y2="16.5" stroke="#ffffff" strokeWidth="1.2" />
                        <path d="M14 21L16.5 23.5L22 18" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="criteria-pane-title">No restriction on promotion</span>
                  </div>
                  <div className="criteria-right-pane">
                    <div className="criteria-ranks-grid">
                      <div className="criteria-rank-item">• Sales Master</div>
                      <div className="criteria-rank-item">• Diamond Master</div>
                      <div className="criteria-rank-item">• Sharon Rose Master</div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Must achieve previous Mastership 3 times */}
                <div className="cst-criteria-split-card">
                  <div className="criteria-left-pane">
                    <div className="criteria-dark-circle-icon">
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <circle cx="18" cy="18" r="18" fill="#2d3748" />
                        <circle cx="18" cy="18" r="12" stroke="#ffffff" strokeWidth="1.5" />
                        <path d="M18 23V13M18 13L14 17M18 13L22 17" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="criteria-pane-title">Must achieve previous Mastership 3 times before being promoted onto the next Mastership level</span>
                  </div>
                  <div className="criteria-right-pane">
                    <div className="criteria-ranks-grid">
                      <div className="criteria-rank-item">• Star Master</div>
                      <div className="criteria-rank-item">• Royal Master</div>
                      <div className="criteria-rank-item">• Crown Master</div>
                      <div className="criteria-rank-item">• Imperial Master</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exact Bullets matching Screenshot */}
              <ul className="cst-criteria-bullets-list">
                <li>• No conditions for continuous position maintenance</li>
                <li>• Unlimited Timeline (only with valid membership status)</li>
                <li>• Promotion of two levels in one entry is not permitted beyond Diamond Master level</li>
              </ul>
            </div>

            {/* Section 2: Mastership Promotion & Incentives Table (matching Screenshot) */}
            <div className="cst-plan-part">
              <div className="cst-plan-header-block">
                <h3 className="cst-section-title">Mastership Promotion &amp; Incentives</h3>
              </div>

              <div className="cst-table-wrapper cst-promo-table-wrapper">
                <table className="cst-data-table cst-promo-table">
                  <colgroup>
                    <col style={{ width: '28%' }} />
                    <col style={{ width: '72%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="promo-th-mastership">Mastership</th>
                      <th className="promo-th-incentives">Incentives</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 1. Sales Master */}
                    <tr>
                      <td className="promo-td-mastership">
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="sales" />
                          <span className="cst-master-name">Sales Master</span>
                        </div>
                      </td>
                      <td className="promo-td-incentives">
                        *INR 30,000 Cash
                      </td>
                    </tr>

                    {/* 2. Diamond Master */}
                    <tr>
                      <td className="promo-td-mastership">
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="diamond" />
                          <span className="cst-master-name">Diamond Master</span>
                        </div>
                      </td>
                      <td className="promo-td-incentives">
                        *INR 90,000 Cash
                      </td>
                    </tr>

                    {/* 3. Sharon Rose Master */}
                    <tr>
                      <td className="promo-td-mastership">
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="sharon" />
                          <span className="cst-master-name">Sharon Rose Master</span>
                        </div>
                      </td>
                      <td className="promo-td-incentives">
                        *INR 1.2 lakh Cash,<br />
                        2 pax Tour Packages (3 Nights and 4 Days)
                      </td>
                    </tr>

                    {/* 4. Star Master */}
                    <tr>
                      <td className="promo-td-mastership">
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="star" />
                          <span className="cst-master-name">Star Master</span>
                        </div>
                      </td>
                      <td className="promo-td-incentives">
                        *INR 6 lakh Cash,<br />
                        4 pax Tour Packages (3 Nights and 4 Days)
                      </td>
                    </tr>

                    {/* 5. Royal Master */}
                    <tr>
                      <td className="promo-td-mastership">
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="royal" />
                          <span className="cst-master-name">Royal Master</span>
                        </div>
                      </td>
                      <td className="promo-td-incentives">
                        *INR 30 lakh Cash,<br />
                        *INR 1.2 lakh per month# for sponsorship activities,<br />
                        Car rental fee#,<br />
                        4 pax Tour Packages (10 Nights and 11 Days)
                      </td>
                    </tr>

                    {/* 6. Crown Master */}
                    <tr>
                      <td className="promo-td-mastership">
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="crown" />
                          <span className="cst-master-name">Crown Master</span>
                        </div>
                      </td>
                      <td className="promo-td-incentives">
                        *INR 1.8 Crore Cash,<br />
                        *INR 3 lakh per month# for sponsorship activities,<br />
                        a Luxury car#,<br />
                        4 pax Tour Packages (10 Nights and 11 Days)
                      </td>
                    </tr>

                    {/* 7. Imperial Master */}
                    <tr>
                      <td className="promo-td-mastership">
                        <div className="cst-mastership-cell">
                          <MastershipHexBadge type="imperial" />
                          <span className="cst-master-name">Imperial Master</span>
                        </div>
                      </td>
                      <td className="promo-td-incentives">
                        *INR 6 crore Cash,<br />
                        *INR 6 lakh per month# for sponsorship activities,<br />
                        a Luxury car#,<br />
                        an Office of Approx. 1,700 sq.ft.# with a Personal Assistant#,<br />
                        a Driver#,<br />
                        4 pax Tour Packages (10 Nights and 11 Days)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="cst-plan-part">
              <div className="cst-plan-header-block">
                <h3 className="cst-section-title">Terms and conditions</h3>
              </div>

              <ul className="cst-criteria-bullets-list">
                <li>• Products are based on purchase price</li>
                <li>• Sharon-Rose/Star Master – Travel tickets *INR 50,000 eq/person</li>
                <li>• Royal/Crown/Imperial Master – Travel tickets *INR 2.4 lakh eq/person</li>
                <li>• Car rental fee - *INR 60,000 eq/month#</li>
                <li>• Crown Master luxury car# - *INR 40 lakh</li>
                <li>• Imperial Master luxury car# - *INR 50 lakh</li>
                <li>• Imperial Master office rent allowance - *INR 1.5 lakh eq/month#</li>
                <li>• Imperial Master personal assistant salary - *INR 50,000 eq/month#</li>
                <li>• Imperial Master driver salary - *INR 50,000 eq/month#</li>
                <li>• Tax will be deducted as applicable per government regulations</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
