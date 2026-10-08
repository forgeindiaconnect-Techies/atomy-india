import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Calculator,
  Gift,
  Coins,
  CheckCircle2,
  DollarSign,
  Crown,
  Users,
  Building,
  Info
} from 'lucide-react';
import './CompensationPlanPage.css';

export default function CompensationPlanPage({ onNavigateHome, onNavigateCategory }) {
  const [activeTab, setActiveTab] = useState('classes');

  // Interactive Calculator State
  const [calcPersonalPv, setCalcPersonalPv] = useState(300000);
  const [calcLeftPv, setCalcLeftPv] = useState(300000);
  const [calcRightPv, setCalcRightPv] = useState(300000);

  // Dealership Classes
  const DEALERSHIP_CLASSES = [
    {
      level: '1. Member',
      pvRequirement: '10,000 ~ 299,999 Personal PV',
      desc: 'Activated membership eligible to accumulate group PV from downline purchases on both left and right legs.',
      scoreEligible: 'Eligible for Score 5 matching (approx. ₹ 1,321/day)'
    },
    {
      level: '2. Agent',
      pvRequirement: '300,000+ Personal PV (or Member with previous month smaller leg ≥ 600,000 PV)',
      desc: 'Core business builder level eligible for higher General Commission match tier.',
      scoreEligible: 'Eligible for Score 15 matching (approx. ₹ 3,964/day)'
    },
    {
      level: '3. Special Agent',
      pvRequirement: '700,000+ Personal PV (or Agent with previous month smaller leg ≥ 1.4 Million PV)',
      desc: 'Leader qualification tier required to challenge the first Mastership rank: Sales Master.',
      scoreEligible: 'Eligible for Score 30 matching (approx. ₹ 7,928/day) & Sales Mastership'
    },
    {
      level: '4. Dealer',
      pvRequirement: '1,500,000+ Personal PV (or Special Agent with previous month smaller leg ≥ 3.0 Million PV)',
      desc: 'Advanced leadership tier eligible for Diamond Master challenge.',
      scoreEligible: 'Eligible for Score 60 matching (approx. ₹ 15,857/day) & Diamond Mastership'
    },
    {
      level: '5. Exclusive Distributor (E.D.)',
      pvRequirement: '2,400,000+ Personal PV (Lifelong Personal PV ceiling reached)',
      desc: 'Highest personal dealership level. No further personal PV accumulation is ever required.',
      scoreEligible: 'Eligible for Maximum Score tiers (up to ₹ 79,286/day) & Imperial Master challenge'
    }
  ];

  // General Commission Score Table
  const COMMISSION_TABLE = [
    { grade: 'Grade 8', classReq: 'Member', leftRightPv: '300,000 / 300,000 PV', score: 5, estPayout: '₹ 1,321' },
    { grade: 'Grade 7', classReq: 'Agent', leftRightPv: '300,000 / 300,000 PV', score: 15, estPayout: '₹ 3,964' },
    { grade: 'Grade 6', classReq: 'Special Agent', leftRightPv: '700,000 / 700,000 PV', score: 30, estPayout: '₹ 7,928' },
    { grade: 'Grade 5', classReq: 'Dealer', leftRightPv: '1,500,000 / 1,500,000 PV', score: 60, estPayout: '₹ 15,857' },
    { grade: 'Grade 4', classReq: 'Exclusive Distributor', leftRightPv: '2,400,000 / 2,400,000 PV', score: 90, estPayout: '₹ 23,785' },
    { grade: 'Grade 3', classReq: 'Exclusive Distributor', leftRightPv: '6,000,000 / 6,000,000 PV', score: 150, estPayout: '₹ 39,643' },
    { grade: 'Grade 2', classReq: 'Exclusive Distributor', leftRightPv: '20,000,000 / 20,000,000 PV', score: 250, estPayout: '₹ 66,071' },
    { grade: 'Grade 1', classReq: 'Exclusive Distributor', leftRightPv: '50,000,000 / 50,000,000 PV', score: 300, estPayout: '₹ 79,286' }
  ];

  // 7 Masterships
  const MASTERSHIPS = [
    {
      title: 'Sales Master (SM)',
      share: '10% of Global PV (Shared exclusively among Sales Masters)',
      condition: 'Special Agent with a minimum of 2.5 Million Group PV acquired on each leg during the challenge cycle (1st–15th or 16th–end of month).',
      incentive: '1x Atomy HemoHIM Set, 1x Atomy The Fame Skincare Set, 1x Evening Care 4 Set'
    },
    {
      title: 'Diamond Master (DM)',
      share: '5% of Global PV',
      condition: 'Dealer with a minimum of 2 Sales Masters on each leg during the challenge cycle.',
      incentive: '₹ 50,000 Cash Reward, 1x HemoHIM Set, 1x The Fame Set, 1x Evening Care 4 Set'
    },
    {
      title: 'Sharon-Rose Master (SRM)',
      share: '2% of Global PV',
      condition: 'Exclusive Distributor with a minimum of 2 Diamond Masters on each leg.',
      incentive: '₹ 1,20,000 Direct Cash Reward + 2x Overseas Travel Tickets (3 Nights / 4 Days)'
    },
    {
      title: 'Star Master (STM)',
      share: '1.2% of Global PV',
      condition: 'Exclusive Distributor with a minimum of 2 Sharon-Rose Masters on each leg.',
      incentive: '₹ 6,000,000 Direct Cash Reward + 4x Overseas Travel Tickets'
    },
    {
      title: 'Royal Master (RM)',
      share: '0.4% of Global PV',
      condition: 'Exclusive Distributor with a minimum of 2 Star Masters on each leg.',
      incentive: '₹ 30,000,000 Direct Cash Reward + ₹ 1,20,000 Monthly Operational Expense Card + Luxury Car Rental + 4x Overseas Tickets (10 Nights / 11 Days)'
    },
    {
      title: 'Crown Master (CM)',
      share: '0.2% of Global PV',
      condition: 'Exclusive Distributor with a minimum of 2 Royal Masters on each leg.',
      incentive: '₹ 1.8 Crore Direct Cash Reward + ₹ 3,00,000 Monthly Operational Card + Luxury Sedan Car + 4x Travel Tickets (10 Nights / 11 Days)'
    },
    {
      title: 'Imperial Master (IM)',
      share: '0.1% of Global PV',
      condition: 'Exclusive Distributor with a minimum of 2 Crown Masters on each leg.',
      incentive: '₹ 5.0 CRORE Cash delivered on stage in a forklift! + ₹ 6,00,000 Monthly Expense Card + Luxury Chauffeur-driven Car + 1,700 sq.ft Furnished Office + 4x Luxury Travel Tickets'
    }
  ];

  // Calculation Logic
  const calculateDailyMatch = () => {
    const smallerLeg = Math.min(calcLeftPv, calcRightPv);
    if (calcPersonalPv < 10000 || smallerLeg < 300000) {
      return { score: 0, payout: 0, reason: 'Minimum 10,000 Personal PV and 300,000 Group PV required on both legs.' };
    }

    if (smallerLeg >= 50000000 && calcPersonalPv >= 2400000) return { score: 300, payout: 79286, tier: 'Grade 1 (Score 300)' };
    if (smallerLeg >= 20000000 && calcPersonalPv >= 2400000) return { score: 250, payout: 66071, tier: 'Grade 2 (Score 250)' };
    if (smallerLeg >= 6000000 && calcPersonalPv >= 2400000) return { score: 150, payout: 39643, tier: 'Grade 3 (Score 150)' };
    if (smallerLeg >= 2400000 && calcPersonalPv >= 2400000) return { score: 90, payout: 23785, tier: 'Grade 4 (Score 90)' };
    if (smallerLeg >= 1500000 && calcPersonalPv >= 1500000) return { score: 60, payout: 15857, tier: 'Grade 5 (Score 60)' };
    if (smallerLeg >= 700000 && calcPersonalPv >= 700000) return { score: 30, payout: 7928, tier: 'Grade 6 (Score 30)' };
    if (smallerLeg >= 300000 && calcPersonalPv >= 300000) return { score: 15, payout: 3964, tier: 'Grade 7 (Score 15)' };
    if (smallerLeg >= 300000 && calcPersonalPv >= 10000) return { score: 5, payout: 1321, tier: 'Grade 8 (Score 5)' };

    return { score: 0, payout: 0, reason: 'Pending matching threshold.' };
  };

  const calcResult = calculateDailyMatch();

  return (
    <div className="comp-plan-page">
      {/* 1. Breadcrumbs */}
      <div className="comp-breadcrumb-bar">
        <div className="comp-container">
          <button type="button" className="bread-link" onClick={onNavigateHome}>
            HOME
          </button>
          <ChevronRight size={14} className="bread-sep" />
          <span className="bread-active">Compensation Plan</span>
        </div>
      </div>

      {/* 2. Header Banner */}
      <section className="comp-header-banner">
        <div className="comp-container">
          <div className="comp-banner-content">
            <span className="comp-eyebrow">ATOMY INDIA MARKETING SYSTEM</span>
            <h1 className="comp-title">Righteous, Balanced & Generous Compensation Plan</h1>
            <p className="comp-subtitle">
              Designed so that ordinary consumers and dedicated distributors alike can achieve sustainable residual income.
              Transparent, permanent personal PV, with a daily commission payout structure capped fairly to prevent income polarization.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Sub Nav Tabs */}
      <nav className="comp-nav-tabs-wrapper">
        <div className="comp-container">
          <div className="comp-nav-tabs">
            <button
              className={`comp-tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => setActiveTab('classes')}
            >
              <Users size={16} />
              <span>Dealership Classes</span>
            </button>
            <button
              className={`comp-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Coins size={16} />
              <span>General Commission</span>
            </button>
            <button
              className={`comp-tab-btn ${activeTab === 'mastership' ? 'active' : ''}`}
              onClick={() => setActiveTab('mastership')}
            >
              <Crown size={16} />
              <span>Mastership Bonus (20%)</span>
            </button>
            <button
              className={`comp-tab-btn ${activeTab === 'awards' ? 'active' : ''}`}
              onClick={() => setActiveTab('awards')}
            >
              <Gift size={16} />
              <span>Promotion Incentives</span>
            </button>
            <button
              className={`comp-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculator')}
            >
              <Calculator size={16} />
              <span>Matching Calculator</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 4. Tab Body */}
      <div className="comp-container comp-content-container">
        {/* TAB 1: DEALERSHIP CLASSES */}
        {activeTab === 'classes' && (
          <div className="comp-pane-fade">
            <div className="pane-header-center">
              <span className="kicker-tag">MEMBERSHIP CLASSIFICATION</span>
              <h2 className="pane-main-heading">5 Dealership Classes of Atomy Members</h2>
              <p className="pane-desc">
                Classification is determined by your accumulated personal Point Value (PV)
                or downline smaller-leg sales volume achieved in the preceding month.
                <strong> Personal PV never resets or expires as long as your membership is active!</strong>
              </p>
            </div>

            <div className="dealership-cards-grid">
              {DEALERSHIP_CLASSES.map((cls, idx) => (
                <div key={idx} className="dealership-card">
                  <div className="card-top-pill">Tier 0{idx + 1}</div>
                  <h3 className="class-name">{cls.level}</h3>
                  <div className="class-pv-badge">{cls.pvRequirement}</div>
                  <p className="class-desc">{cls.desc}</p>
                  <div className="class-eligibility-box">
                    <CheckCircle2 size={15} color="#00A3E0" />
                    <span>{cls.scoreEligible}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="comp-info-callout">
              <Info size={24} color="#00A3E0" />
              <div>
                <h4>Key Principle: Personal PV Never Expire</h4>
                <p>
                  Unlike other conventional direct selling companies where your personal volume is flushed each month,
                  Atomy accumulates your personal purchases for life up to 2.4 Million PV ceiling.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GENERAL COMMISSION */}
        {activeTab === 'general' && (
          <div className="comp-pane-fade">
            <div className="pane-header-center">
              <span className="kicker-tag">DAILY COMMISSION SYSTEM</span>
              <h2 className="pane-main-heading">General Commission (44% of Global PV)</h2>
              <p className="pane-desc">
                Calculated on a daily basis when your smaller group leg matches a commission grade threshold.
                Once matched, both leg group PVs reset to zero and resume accumulating the next day!
              </p>
            </div>

            <div className="comp-table-card">
              <table className="atomy-comp-table">
                <thead>
                  <tr>
                    <th>Grade</th>
                    <th>Dealership Class</th>
                    <th>Daily Matching (Smaller Leg)</th>
                    <th>Score</th>
                    <th style={{ textAlign: 'right' }}>Est. Daily Payout (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_TABLE.map((row, idx) => (
                    <tr key={idx}>
                      <td className="grade-col"><strong>{row.grade}</strong></td>
                      <td>{row.classReq}</td>
                      <td><span className="pv-range-pill">{row.leftRightPv}</span></td>
                      <td><span className="score-badge">{row.score} pts</span></td>
                      <td style={{ textAlign: 'right' }} className="payout-col">
                        <strong>{row.estPayout}</strong> / day
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="comp-features-row">
              <div className="feat-box">
                <h4>Daily Calculation & Flush</h4>
                <p>Matches occur daily. Unmatched group PV carries over indefinitely until your smaller leg reaches 300,000 PV.</p>
              </div>
              <div className="feat-box">
                <h4>Weekly Direct Bank Deposit</h4>
                <p>Calculated daily from Wednesday to Tuesday and disbursed directly into your registered Indian bank account every following Tuesday.</p>
              </div>
              <div className="feat-box">
                <h4>Income Ceiling Cap</h4>
                <p>Grade 1 is capped at 50M PV (Score 300 / approx ₹ 79,286 per day) to ensure the 35% statutory commission pool is distributed fairly among beginner members.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MASTERSHIP BONUS */}
        {activeTab === 'mastership' && (
          <div className="comp-pane-fade">
            <div className="pane-header-center">
              <span className="kicker-tag">GLOBAL PROFIT SHARING</span>
              <h2 className="pane-main-heading">7 Ranks of Mastership (20% of Global Sales PV)</h2>
              <p className="pane-desc">
                Calculated twice per month: <strong>1st to 15th</strong> (1st Period) and <strong>16th to end of month</strong> (2nd Period).
                Notice how 10% of total PV is reserved exclusively for the beginner rank: Sales Master!
              </p>
            </div>

            <div className="masterships-grid">
              {MASTERSHIPS.map((m, idx) => (
                <div key={idx} className={`mastership-card ${idx === 6 ? 'imperial-card' : ''}`}>
                  <div className="mastership-header">
                    <span className="rank-num">0{idx + 1}</span>
                    <h3 className="mastership-title">{m.title}</h3>
                    <span className="pv-share-tag">{m.share}</span>
                  </div>
                  <div className="mastership-body">
                    <div className="qualify-row">
                      <strong>Qualification Requirement:</strong>
                      <p>{m.condition}</p>
                    </div>
                    <div className="incentive-row">
                      <strong>Promotion Incentive:</strong>
                      <p>{m.incentive}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AWARDS */}
        {activeTab === 'awards' && (
          <div className="comp-pane-fade">
            <div className="pane-header-center">
              <span className="kicker-tag">ONE-TIME MILESTONE RECOGNITION</span>
              <h2 className="pane-main-heading">Mastership Promotional Incentives & Cash Prizes</h2>
              <p className="pane-desc">
                When you achieve a Mastership rank for the first time, Atomy rewards your dedication
                with extraordinary gifts and milestone cash rewards handed personally by Chairman Han-Gill Park!
              </p>
            </div>

            <div className="awards-showcase-grid">
              <div className="award-banner-card sm-award">
                <div className="award-badge">SALES MASTER</div>
                <h3>Flagship Product Gift Hamper</h3>
                <p>1 Box Atomy HemoHIM + 1 Set The Fame Skincare + 1 Set Evening Care 4</p>
              </div>

              <div className="award-banner-card dm-award">
                <div className="award-badge">DIAMOND MASTER</div>
                <h3>₹ 50,000 Cash + Product Hamper</h3>
                <p>Direct cash award plus full skincare and health product packages.</p>
              </div>

              <div className="award-banner-card srm-award">
                <div className="award-badge">SHARON-ROSE MASTER</div>
                <h3>₹ 1,20,000 Cash + 2x Overseas Travel</h3>
                <p>Cash prize plus luxury 4-day international holiday for two.</p>
              </div>

              <div className="award-banner-card stm-award">
                <div className="award-badge">STAR MASTER</div>
                <h3>₹ 6,00,000 Direct Cash + 4x Travel Tickets</h3>
                <p>Family holiday package for four with comprehensive travel allowance.</p>
              </div>

              <div className="award-banner-card rm-award">
                <div className="award-badge">ROYAL MASTER</div>
                <h3>₹ 30,00,000 Cash + Luxury Car + Expense Card</h3>
                <p>₹ 1,20,000 monthly operational allowance + 11-day luxury cruise tickets.</p>
              </div>

              <div className="award-banner-card cm-award">
                <div className="award-badge">CROWN MASTER</div>
                <h3>₹ 1.8 CRORE Cash + Luxury Sedan Car</h3>
                <p>₹ 3,00,000 monthly operational credit card + 4x luxury overseas tickets.</p>
              </div>

              <div className="award-banner-card im-award full-width">
                <Crown size={32} color="#f59e0b" />
                <div className="award-badge gold">IMPERIAL MASTER (HIGHEST PIN)</div>
                <h2>₹ 5.0 CRORE Cash in Forklift + Chauffeur + 1,700 sq.ft Office</h2>
                <p>
                  Delivered on stage during the grand World Success Academy, along with a ₹ 6,00,000 monthly operational card,
                  a luxury sedan with a company-paid personal driver, and fully furnished corporate office suite.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="comp-pane-fade">
            <div className="pane-header-center">
              <span className="kicker-tag">INTERACTIVE SIMULATOR</span>
              <h2 className="pane-main-heading">General Commission Matching Calculator</h2>
              <p className="pane-desc">
                Enter your Personal PV and your daily Left Leg / Right Leg group volume to see your potential daily matching score and INR payout!
              </p>
            </div>

            <div className="calc-simulator-card">
              <div className="calc-inputs-grid">
                <div className="calc-input-group">
                  <label>Your Personal Accumulated PV</label>
                  <input
                    type="number"
                    value={calcPersonalPv}
                    step={10000}
                    onChange={(e) => setCalcPersonalPv(Number(e.target.value) || 0)}
                    className="calc-input"
                  />
                  <span className="input-hint">300,000 PV unlocks Agent tier</span>
                </div>

                <div className="calc-input-group">
                  <label>Left Leg Group PV</label>
                  <input
                    type="number"
                    value={calcLeftPv}
                    step={50000}
                    onChange={(e) => setCalcLeftPv(Number(e.target.value) || 0)}
                    className="calc-input"
                  />
                  <span className="input-hint">Accumulated downline purchases</span>
                </div>

                <div className="calc-input-group">
                  <label>Right Leg Group PV</label>
                  <input
                    type="number"
                    value={calcRightPv}
                    step={50000}
                    onChange={(e) => setCalcRightPv(Number(e.target.value) || 0)}
                    className="calc-input"
                  />
                  <span className="input-hint">Accumulated downline purchases</span>
                </div>
              </div>

              {/* Result Preview Box */}
              <div className="calc-result-box">
                <div className="result-left">
                  <span className="result-kicker">MATCHING RESULT</span>
                  <div className="result-tier-name">
                    {calcResult.score > 0 ? calcResult.tier : 'No Match'}
                  </div>
                  <p className="result-subtext">
                    {calcResult.score > 0
                      ? `Matching Score: ${calcResult.score} Points. Group PV resets to 0 after daily calculation.`
                      : calcResult.reason}
                  </p>
                </div>
                <div className="result-right">
                  <span className="payout-label">ESTIMATED DAILY PAYOUT</span>
                  <div className="payout-amount">
                    ₹ {calcResult.payout.toLocaleString('en-IN')}
                  </div>
                  <span className="payout-period">Per Matching Day</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
