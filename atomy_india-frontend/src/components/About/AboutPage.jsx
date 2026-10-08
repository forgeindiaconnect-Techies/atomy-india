import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Search,
  Phone,
  Mail,
  Printer,
  HelpCircle,
  Award,
  BookOpen,
  MapPin,
  Calendar,
  Download,
  ExternalLink,
  MessageSquare,
  X,
  Sparkles,
  Send
} from 'lucide-react';
import './AboutPage.css';

const TOP_5_FAQS = [
  {
    id: 'faq-1',
    q: "Why I still didn't receive the delivery?",
    a: "Orders in India are dispatched through our certified courier logistics partners (BlueDart / Delhivery / XpressBees). Standard delivery takes 3-7 business days depending on state and PIN code. You can check real-time courier tracking through 'Order / Delivery' in your account or Contact Us."
  },
  {
    id: 'faq-2',
    q: "What is the criteria to become an Atomy Distributor in India ?",
    a: "Any Indian citizen aged 18 years or above with a valid PAN Card and Aadhaar Card/Voter ID can register as an Atomy Distributor. Membership is 100% free with zero joining fees. To activate sponsorship points and accumulate downline PV, simply purchase products totaling 10,000 PV (~₹1,500 - ₹2,000)."
  },
  {
    id: 'faq-3',
    q: "Where can I check my commission?",
    a: "You can check your General Commission, Mastership Bonus, and daily point matching records by logging into My Office on Atomy India portal under the 'My Commission' / 'General Commission Records' tab. Commission payments are settled weekly on Tuesdays."
  },
  {
    id: 'faq-4',
    q: "Where can I find my purchase record, group purchase record or commission record?",
    a: "Navigate to My Office > Lineage / My Group Purchase Record. Here you can inspect daily Left Leg and Right Leg volume, accumulated Point Value (PV), and order histories across all generations."
  },
  {
    id: 'faq-5',
    q: "How to register to become an Atomy Distributor?",
    a: "Click 'Join Us' on the top navigation bar. Select 'Indian Resident (18+)', verify your mobile number via OTP, enter your Sponsor ID (provided by your upline mentor), upload your PAN and address proof, and complete your member registration."
  }
];

const CST_NOTICES = [
  {
    id: 'noti-1',
    tag: '[GENERAL NOTICE]',
    title: 'New Register Member Coupon Offer',
    desc: 'Instant ₹500 discount voucher on first order above ₹3,500 for newly registered members.'
  },
  {
    id: 'noti-2',
    tag: '[SHIPPING]',
    title: 'Express Doorstep Delivery Network Across India',
    desc: 'Upgraded delivery speeds across all Tier-1 and Tier-2 pin codes with live GPS tracking.'
  },
  {
    id: 'noti-3',
    tag: '[PRODUCT]',
    title: 'HemoHIM Patented Herbal Extract Quality Standards',
    desc: 'Government-certified quality testing reports published for HemoHIM batches.'
  },
  {
    id: 'noti-4',
    tag: '[OPERATION]',
    title: 'Customer Support Working Hours & Courier Dispatch Updates',
    desc: 'Customer counsel lines operate Mon-Sat 09:00 AM - 17:30 PM IST.'
  },
  {
    id: 'noti-5',
    tag: '[EVENT]',
    title: 'Monthly Success Academy Schedule & Live Webcast',
    desc: 'Join our national leadership academy stream this Saturday at 11:00 AM.'
  }
];

export default function AboutPage({ onNavigateHome, onNavigateBack, onNavigateView }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [companyMainTab, setCompanyMainTab] = useState('aboutUs'); // 'aboutUs' | 'management'
  const [companySubTab, setCompanySubTab] = useState('overview'); // 'overview' | 'vision' | 'philosophy' | 'foundation' | 'motto'
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Filter FAQs and Notices based on search
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return TOP_5_FAQS;
    const q = searchQuery.toLowerCase().trim();
    return TOP_5_FAQS.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredNotices = useMemo(() => {
    if (!searchQuery.trim()) return CST_NOTICES;
    const q = searchQuery.toLowerCase().trim();
    return CST_NOTICES.filter(n => n.title.toLowerCase().includes(q) || n.tag.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleDownloadPlan = () => {
    const link = document.createElement('a');
    link.href = '/Atomy_Compensation_Plan_May_2026.pdf';
    link.download = 'Atomy_Compensation_Plan_May_2026.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setIsInquiryModalOpen(false);
      setInquiryForm({ name: '', phone: '', email: '', message: '' });
    }, 2000);
  };

  return (
    <div className="atomy-cst-main-page">
      {/* 1. Breadcrumbs Bar */}
      <div className="cst-top-breadcrumb-bar">
        <div className="container cst-breadcrumb-inner">
          <button type="button" className="bread-home-btn" onClick={onNavigateHome}>
            HOME
          </button>
          <span className="bread-arrow">&gt;</span>
          <span className="bread-current-txt">About Us</span>
        </div>
      </div>

      <div className="container cst-body-container">
        {/* 2. Main Page Title (matching in.atomy.com cst-title) */}
        <div className="cst-title-head">
          <h2>About Us</h2>
        </div>

        {/* 3. Customer Service FAQ Hero Section (matching in.atomy.com cst-main__faq) */}
        <div className="cst-main__faq">
          <div className="cst-faq-welcome-header">
            <h3>Welcome to Atomy India's Customer Service</h3>
            <span className="cst-welcome-badge">We’re here to help.</span>
          </div>

          <div className="cst-faq-search-box">
            <h4 className="faq-box-tag">FAQ</h4>
            <p className="faq-box-prompt">
              Find answers to frequently asked questions about ordering, commissions, products and more.<br />
              You can search or select a question type to find detailed information.
            </p>

            <div className="cst-search-input-unit">
              <input
                type="search"
                id="cstSearchInput"
                placeholder="Enter search term."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cst-input-field"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="cst-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                className="cst-search-submit-btn"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Boards Section: TOP 5 FAQs & Notice (matching in.atomy.com cst-main__board) */}
        <div className="cst-main__board">
          {/* Board 1: TOP 5 FAQs */}
          <div className="cst-board-col">
            <div className="cst-board-header">
              <h4>TOP 5 FAQs</h4>
              <button
                type="button"
                className="cst-board-more-btn"
                onClick={() => setSearchQuery('')}
              >
                More &gt;
              </button>
            </div>
            <ul className="cst-board-list">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <li
                    key={faq.id}
                    className="cst-faq-row-item"
                    onClick={() => setActiveFaq(activeFaq?.id === faq.id ? null : faq)}
                  >
                    <div className="faq-q-title-row">
                      <span className="faq-q-txt">{faq.q}</span>
                      <ChevronRight
                        size={15}
                        className={`faq-chevron ${activeFaq?.id === faq.id ? 'rotated' : ''}`}
                      />
                    </div>
                    {activeFaq?.id === faq.id && (
                      <div className="cst-faq-inline-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="cst-board-empty">No FAQs matching "{searchQuery}"</li>
              )}
            </ul>
          </div>

          {/* Board 2: Notice */}
          <div className="cst-board-col">
            <div className="cst-board-header">
              <h4>Notice</h4>
              <button
                type="button"
                className="cst-board-more-btn"
                onClick={() => onNavigateView && onNavigateView('notice')}
              >
                More &gt;
              </button>
            </div>
            <ul className="cst-board-list">
              {filteredNotices.map((n) => (
                <li
                  key={n.id}
                  className="cst-notice-row-item"
                  onClick={() => onNavigateView && onNavigateView('notice')}
                >
                  <strong className="notice-category-badge">{n.tag}</strong>
                  <span className="notice-headline-txt">{n.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. Quick Links Bar (matching in.atomy.com cst-main__link) */}
        <div className="cst-main__link">
          <ul className="cst-service-cards-grid">
            <li>
              <button
                type="button"
                className="cst-service-card"
                onClick={() => onNavigateView && onNavigateView('compensation')}
              >
                <div className="cst-service-icon-wrap icon-comp">
                  <Award size={26} />
                </div>
                <span className="cst-service-label">Compensation Plan</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="cst-service-card"
                onClick={() => onNavigateView && onNavigateView('seminars')}
              >
                <div className="cst-service-icon-wrap icon-seminar">
                  <Calendar size={26} />
                </div>
                <span className="cst-service-label">Seminar &amp; Education</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="cst-service-card"
                onClick={() => onNavigateView && onNavigateView('contact')}
              >
                <div className="cst-service-icon-wrap icon-centre">
                  <MapPin size={26} />
                </div>
                <span className="cst-service-label">Centre Map</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="cst-service-card"
                onClick={() => onNavigateView && onNavigateView('guide')}
              >
                <div className="cst-service-icon-wrap icon-guide">
                  <BookOpen size={26} />
                </div>
                <span className="cst-service-label">User Guide</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="cst-service-card"
                onClick={handleDownloadPlan}
                title="Download Compensation Plan PDF"
              >
                <div className="cst-service-icon-wrap icon-resource">
                  <Download size={26} />
                </div>
                <span className="cst-service-label">Resource</span>
              </button>
            </li>
          </ul>
        </div>

        {/* 6. Company Information Tabs Section (matching in.atomy.com cst-main__company) */}
        <div className="cst-main__company">
          {/* Primary Tabs */}
          <div className="cst-primary-tabs-nav" role="tablist">
            <button
              type="button"
              className={`cst-prim-tab-btn ${companyMainTab === 'aboutUs' ? 'active' : ''}`}
              onClick={() => setCompanyMainTab('aboutUs')}
            >
              <span>About Us</span>
            </button>
            <button
              type="button"
              className={`cst-prim-tab-btn ${companyMainTab === 'management' ? 'active' : ''}`}
              onClick={() => setCompanyMainTab('management')}
            >
              <span>Management Info</span>
            </button>
          </div>

          {/* Sub-menu if About Us is active */}
          {companyMainTab === 'aboutUs' && (
            <div className="cst-secondary-subtabs">
              <button
                type="button"
                className={`cst-sub-pill ${companySubTab === 'overview' ? 'active' : ''}`}
                onClick={() => setCompanySubTab('overview')}
              >
                Overview
              </button>
              <button
                type="button"
                className={`cst-sub-pill ${companySubTab === 'vision' ? 'active' : ''}`}
                onClick={() => setCompanySubTab('vision')}
              >
                Vision
              </button>
              <button
                type="button"
                className={`cst-sub-pill ${companySubTab === 'philosophy' ? 'active' : ''}`}
                onClick={() => setCompanySubTab('philosophy')}
              >
                Philosophy
              </button>
              <button
                type="button"
                className={`cst-sub-pill ${companySubTab === 'foundation' ? 'active' : ''}`}
                onClick={() => setCompanySubTab('foundation')}
              >
                Foundation
              </button>
              <button
                type="button"
                className={`cst-sub-pill ${companySubTab === 'motto' ? 'active' : ''}`}
                onClick={() => setCompanySubTab('motto')}
              >
                Motto
              </button>
            </div>
          )}

          {/* Tab Panel Content */}
          <div className="cst-company-panel-content">
            {companyMainTab === 'aboutUs' ? (
              <>
                {/* SUBTAB 1: OVERVIEW */}
                {companySubTab === 'overview' && (
                  <div className="cst-company__part">
                    <div className="cst-company__desc">
                      <h3>Overview</h3>
                      <div className="cst-h-sub-box">
                        <div className="cst-lead-txt-wrap">
                          <span className="lead-main">
                            The Basic Theory of Economy is Straightforward Distribution is Key!<br />
                            Effective Strategy where Quality meets Value
                          </span>
                          <span className="lead-masstige">
                            Atomy's MASSTIGE strategy is to provide<br />
                            <strong className="sp-blue">Absolute Quality</strong> products at an <strong className="sp-blue">Absolute Price.</strong>
                          </span>
                        </div>
                        <div className="cst-masstige-img-wrap">
                          <img
                            src="https://image.atomy.com/editor/498/2511070141498.png"
                            alt="Atomy Masstige Strategy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="cst-company__txt">
                      <p>
                        As the world market is more globalized and united to a single market, Atomy’s Masstige brand is positioned to gain momentum and growth.
                      </p>
                      <p>
                        Established in 2009, Atomy is a global direct selling company with operations in 27 regions worldwide as of December 2024, including Korea.
                      </p>
                      <p>
                        Since it was established, Atomy has grown rapidly through consumer-centered direct selling that strictly upholds CEO Park Han-gill’s principle of <strong>“Absolute Quality, Absolute Price.”</strong> The company has worked tirelessly to create a foundation for sustainable growth based on innovative thinking that sets customer success as its key objective and a corporate culture centered on principles, inclusive growth, and sharing.
                      </p>
                      <p>
                        Atomy uses a consumer-oriented direct selling strategy. We select favorable products that are higher in quality at more reasonable prices, and sell them through distribution channels that can compete with department stores, discount stores, home shopping networks, and online shopping. In other words, we find products that are more competitive in quality and price than similar products distributed through other channels for our customers' benefits. Through this strategy, we promise to achieve our ultimate goal of <em>"Surpassing Customer Satisfaction to Customer Success."</em>
                      </p>
                      <p>
                        Built on a foundation of principles, Atomy will lead the industry to reshape recognition and reputation.
                      </p>
                      <div className="cst-three-cultures-strip">
                        <p>
                          Atomy’s Culture: <strong>1. Principle Centred Culture &nbsp;|&nbsp; 2. Culture of Accompanied Growth &nbsp;|&nbsp; 3. Sharing Culture</strong>
                        </p>
                      </div>
                      <p>
                        Our objective is beyond consumer satisfaction; rather it is centered for success.
                      </p>
                      <p>
                        A corporation that cherishes the spirit! We believe that valuing individuals is our priority. Be our partner in faith and believe in your own success through Atomy. We will always serve you with the utmost humble heart. Enjoy a beautiful life with Atomy and make your dreams come true.
                      </p>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: VISION */}
                {companySubTab === 'vision' && (
                  <div className="cst-company__part">
                    <div className="cst-company__desc">
                      <h3>Vision</h3>
                      <div className="vision-step-box">
                        <span className="step-num-pill">01. Customers’ <strong>Success</strong></span>
                      </div>
                    </div>
                    <div className="cst-company__txt">
                      <p>
                        Customers are not simply a means for Atomy—they are the ultimate goal. The <strong>"Philosophy of Cow vs. Baby"</strong> best describes Atomy's mindset toward our customers. The reason people tend cows is not for the cows' sake, but for the purpose of obtaining milk. However, when a parent cares for their baby, it is for the baby's own well-being; they do not expect anything in return. Likewise, we hope to go beyond just satisfying our customers to helping them succeed for their own good. We want them to achieve success as consumers and/or business owners through Atomy.
                      </p>
                    </div>

                    <div className="cst-company__desc line-top">
                      <div className="vision-step-box">
                        <span className="step-num-pill">02. Distribution <strong>HUB</strong></span>
                      </div>
                    </div>
                    <div className="cst-company__txt">
                      <p>
                        Atomy aims to become a world distribution hub—the central unit of a distribution network. To achieve this goal, Atomy is creating a competitive advantage by enabling a direct and effective connection between manufacturers and consumers worldwide. Our Global Sourcing Global Sales (GSGS) strategy will help us seek out high-quality products that meet our Absolute Quality Absolute Price standard and offer them to consumers globally.
                      </p>
                    </div>

                    <div className="cst-company__desc line-top">
                      <div className="vision-step-box">
                        <span className="step-num-pill">03. <strong>Premier</strong> Company</span>
                      </div>
                    </div>
                    <div className="cst-company__txt">
                      <p>
                        Atomy aims to be a Premier Company—the best of the best. <strong>"Honesty and Goodness is the Best Strategy"</strong> is a philosophy that describes our corporate values. We want our employees to always be honest and loyal to our members as providers of quality products at reasonable prices, and we will continue to develop programs to foster creative individuals who will produce added value based on solid conscientious and moral standards.
                      </p>
                      <div className="cst-vision-principles-card">
                        <h4 className="principles-lead">Cultural Principles of Atomy for Aspiring Toward a Top-notch Company beyond First-class:</h4>
                        <p><strong>01. Principle-oriented culture:</strong> Principle-oriented culture seeks to benefit every constituent of our society.</p>
                        <p><strong>02. Culture of mutual growth and cooperation:</strong> The culture of mutual growth and cooperation is about a company growing together with everybody.</p>
                        <p><strong>03. Culture of sharing:</strong> Lastly, the culture of Sharing is about loving and caring for all people around the world.</p>
                        <p className="century-commitment">We are sure that our three cultures form a solid foundation that will ensure our success for the next 100 years.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: PHILOSOPHY */}
                {companySubTab === 'philosophy' && (
                  <div className="cst-company__part">
                    <div className="cst-company__desc">
                      <h3>Philosophy</h3>
                      <div className="vision-step-box">
                        <span className="step-num-pill">A Small but <strong>Big Company</strong> with <strong>Precise</strong> Management.</span>
                      </div>
                    </div>
                    <div className="cst-company__txt">
                      <p>
                        Atomy aims to be a "small but big" company. We are not preoccupied with our size or wealth, but with the establishment of a rock-solid and sturdy infrastructure, which echoes our founding principle of Continuity.
                      </p>
                      <p>
                        We need "precise management" to eliminate unnecessary expenses and pay careful attention to detail. Our "big company" mindset encourages customers to succeed big, ensures that employees feel big happiness, and gives back to society in a big way.
                      </p>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: FOUNDATION */}
                {companySubTab === 'foundation' && (
                  <div className="cst-company__part">
                    <div className="cst-company__desc">
                      <h3>Foundation</h3>
                    </div>

                    <div className="cst-foundation-pillar-row">
                      <div className="cst-pillar-badge">
                        <strong>BEING<br />(CONTINUITY)</strong>
                      </div>
                      <div className="cst-pillar-detail">
                        <p>
                          Being (Continuity) is every enterprise's primary goal and the most important social responsibility. Atomy's employees, members, customers, partners and even local communities are all connected like parts of a living organism. Everyone is needed in our mission to make a better world, and Atomy must continue to survive to carry out the task. We put forth a lot of effort to endure; from reducing costs to enhancing business viability.
                        </p>
                        <ul className="cst-pillar-bullets">
                          <li><strong>Cost Management:</strong> Strict Management of Product Cost, Stable Financial Management based on Zero-Debt Policy, Low Level of Fixed Cost based on Pipeline Theory.</li>
                          <li><strong>Operations Management:</strong> Honesty in Management, Transparency in Management, Abiding by Principles = Core Value of Managerial Problem Solving.</li>
                          <li><strong>Human Resources Management:</strong> Foster Creativity in HR Management.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="cst-foundation-pillar-row line-top">
                      <div className="cst-pillar-badge">
                        <strong>Speed</strong>
                      </div>
                      <div className="cst-pillar-detail">
                        <p>
                          Although Continuity is the company's top priority, added value can be generated through growth. The most crucial factor in Atomy's growth is Speed, but Speed is not just how fast we are moving, but also in what direction. When we say Speed is important in our growth, it means that we should be moving at a quick pace in the right direction.
                        </p>
                        <ul className="cst-pillar-bullets">
                          <li><strong>Speed of Adaptation:</strong> Industry 4.0 has a greater and wider impact on society. Atomy takes all measures to keep pace with rapid change.</li>
                          <li><strong>Speed of Information:</strong> Transferring accurate information to multiple destinations simultaneously without altering the original message.</li>
                          <li><strong>Speed of Business Expansion:</strong> Multiplying member success globally through our proven Success Academy system.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="cst-foundation-pillar-row line-top">
                      <div className="cst-pillar-badge">
                        <strong>Balance</strong>
                      </div>
                      <div className="cst-pillar-detail">
                        <p>
                          Atomy seeks to fulfill social responsibility through the balanced distribution of wealth. This includes the concept of fairness, as we believe balance and fairness will optimize the utilization of limited resources and lead to greater wealth for all. The value of Atomy is not only created by our members, but by our partnering companies, consumers, and the greater society through direct and indirect interactions with the company.
                        </p>
                        <p>
                          Atomy strives to provide better quality products at more reasonable prices for our consumers and returns the profits back to them. We are also involved in many social contribution activities for the betterment of society. The fair and balanced distribution of our earnings secures our loyal customer base and ensures sustainable growth.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 5: MOTTO */}
                {companySubTab === 'motto' && (
                  <div className="cst-company__part">
                    <div className="cst-company__desc">
                      <h3>Motto</h3>
                    </div>

                    <div className="cst-motto-headline-banner">
                      Cherish the <strong>Spirit.</strong> Create the <strong>Vision.</strong><br />
                      Follow the <strong>Faith.</strong> Serve in <strong>Humility.</strong>
                    </div>

                    <div className="cst-foundation-pillar-row">
                      <div className="cst-pillar-badge">
                        <strong>SPIRIT</strong>
                      </div>
                      <div className="cst-pillar-detail">
                        <p className="pillar-lead-phrase">Cherish the <strong>Spirit</strong></p>
                        <p>
                          People are the most precious beings. We were created in God's image and should never be used as a means to an end but should be the final purpose. We should always be considered valuable.
                        </p>
                      </div>
                    </div>

                    <div className="cst-foundation-pillar-row line-top">
                      <div className="cst-pillar-badge">
                        <strong>VISION</strong>
                      </div>
                      <div className="cst-pillar-detail">
                        <p className="pillar-lead-phrase">Create the <strong>Vision</strong></p>
                        <p>
                          The most accurate way to predict the future is to plan for it ourselves. We must take this initiative in our own thinking so that we may be in charge of our own future.
                        </p>
                      </div>
                    </div>

                    <div className="cst-foundation-pillar-row line-top">
                      <div className="cst-pillar-badge">
                        <strong>FAITH</strong>
                      </div>
                      <div className="cst-pillar-detail">
                        <p className="pillar-lead-phrase">Follow the <strong>Faith.</strong></p>
                        <p>
                          It is not difficult to have faith in the things that are visible, but the faith we pursue is believing in things we cannot see. This genuine faith in an unseen vision has the power to inspire action toward a desirable future.
                        </p>
                      </div>
                    </div>

                    <div className="cst-foundation-pillar-row line-top">
                      <div className="cst-pillar-badge">
                        <strong>HUMILITY</strong>
                      </div>
                      <div className="cst-pillar-detail">
                        <p className="pillar-lead-phrase">Serve in <strong>Humility</strong></p>
                        <p>
                          Humility is the most valuable virtue. Our thoughts should reach to the sky, but our feet should remain on the ground. If we can remain humble even after achieving our goals, we will earn the respect of others.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* MAIN TAB 2: MANAGEMENT INFO */
              <div className="cst-company__part">
                <div className="cst-company__desc">
                  <h3>Management Info</h3>
                </div>

                {/* Profile 1: Dr. Seikh Imtiaz Ali */}
                <div className="cst-leader-profile-unit">
                  <p className="leader-tit">
                    <strong>About</strong> Dr. Seikh Imtiaz Ali (Abraham Lee)
                  </p>

                  <div className="leader-card-flex">
                    <div className="leader-photo-box">
                      <img
                        src="https://image.atomy.com/editor/499/2511070141499.png"
                        alt="Dr. Seikh Imtiaz Ali"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="leader-bio-text">
                      <p>
                        <strong>S. Imtiaz Ali,</strong> is currently the Managing Director of Atomy Enterprise India Private Limited.<br />
                        He is responsible for the overall operations of the Company and is successfully leading Team Atomy, in partnership with the distributor leadership, to drive sales growth and achieve Atomy’s lofty business objectives &amp; the powerful vision of its founders.
                      </p>
                      <p>
                        He is an IITian and was awarded Doctor of Philosophy (PhD) from KAIST (Korea Advanced Institute of Science and Technology), South Korea.<br />
                        He has also worked in both Head Quarters as well as local Offices in India of big global conglomerates of South Korea.<br />
                        He has a vast &amp; varied experience of handling business activities of almost 30 different countries of Latin America, Asia and Africa.
                      </p>
                      <p>
                        He is highly adaptable to the demands of the Indian market and is playing a pivotal role in Atomy’s success in India.<br />
                        Atomy India hopes to scale great heights under his able guidance &amp; leadership.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile 2: Seok-Gyun Kwon */}
                <div className="cst-leader-profile-unit line-top">
                  <p className="leader-tit">
                    <strong>About</strong> Seok-Gyun Kwon
                  </p>

                  <div className="leader-card-flex">
                    <div className="leader-photo-box">
                      <img
                        src="https://image.atomy.com/editor/500/2511070141500.png"
                        alt="Seok-Gyun Kwon"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="leader-bio-text">
                      <p>
                        <strong>Seok-Gyun Kwon</strong> is supporting the operations of the Company in India as a Director.<br />
                        He is also serving as a Regional Director of Atomy, Korea.
                      </p>
                      <p>
                        Seok-Gyun Kwon has a rich experience of over 30 years in direct sales and consumer marketing in South Korea, China and other Asian countries.<br />
                        With a committed and inspirational vision, Mr Kwon is passionate about mentoring the youth and takes a keen interest in the holistic development of everyone associated with Atomy.
                      </p>
                      <p>
                        He is much respected for his impelling and motivational approach towards life which is commendable &amp; exemplary.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 7. Counsel Contacts Section (matching in.atomy.com cst-main__counsel) */}
        <div className="cst-main__counsel">
          <div className="cst-counsel-inner">
            {/* 1. Customer Support */}
            <div className="cst-counsel-card">
              <div className="cst-counsel-header-title">
                <b>Customer Support</b>
              </div>
              <div className="cst-counsel-detail">
                <strong className="cst-phone-big">+91-124-695-9000</strong>
                <span className="cst-schedule-sub">
                  Mon - Sat 09:00 AM ~ 17:30 PM (IST)<br />
                  (Weekends &amp; Holidays - Closed)
                </span>
              </div>
            </div>

            {/* 2. Fax Number */}
            <div className="cst-counsel-card">
              <div className="cst-counsel-header-title">
                <b>Fax Number</b>
              </div>
              <div className="cst-counsel-detail">
                <strong className="cst-phone-big">+91-124-647-2851</strong>
              </div>
            </div>

            {/* 3. E-Mail */}
            <div className="cst-counsel-card">
              <div className="cst-counsel-header-title">
                <b>E-Mail</b>
              </div>
              <div className="cst-counsel-detail">
                <a href="mailto:atomy_in@atomypark.com" className="cst-mail-link">
                  atomy_in@atomypark.com
                </a>
                <span className="cst-schedule-sub">* Please contact us for more information.</span>
              </div>
            </div>

            {/* 4. 1:1 Inquiry */}
            <div className="cst-counsel-card cst-counsel-inquiry-card">
              <div className="cst-counsel-header-title">
                <b>1:1 Inquiry</b>
              </div>
              <div className="cst-inquiry-flex-body">
                <div className="cst-inquiry-desc-side">
                  <p>
                    Ask our customer service if you have any questions about Atomy.<br />
                    We'll kindly answer as soon as possible.
                  </p>
                  <button
                    type="button"
                    className="cst-inquiry-open-btn"
                    onClick={() => setIsInquiryModalOpen(true)}
                  >
                    <em>Inquiry</em>
                  </button>
                </div>
                <div className="cst-inquiry-img-side">
                  <img
                    src="https://resources.atomy.com/fo/images/cst/ico_main_cns_0.svg"
                    alt="1:1 Counsel"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. 1:1 Inquiry Modal */}
      {isInquiryModalOpen && (
        <div className="cst-modal-backdrop" onClick={() => setIsInquiryModalOpen(false)}>
          <div className="cst-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cst-modal-header">
              <div className="modal-title-with-icon">
                <MessageSquare size={20} color="#0096e6" />
                <h3>Customer Service 1:1 Inquiry</h3>
              </div>
              <button
                type="button"
                className="cst-modal-close-icon"
                onClick={() => setIsInquiryModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {inquirySuccess ? (
              <div className="cst-modal-success animate-fade">
                <Sparkles size={36} color="#0096e6" />
                <h4>Thank You!</h4>
                <p>Your inquiry has been submitted. Our Atomy India Customer Counsel team will reply to your email within 24 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="cst-inquiry-form">
                <div className="form-group">
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>E-Mail Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Inquiry Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your question regarding membership, delivery, commission or products..."
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  />
                </div>
                <div className="form-footer-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsInquiryModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    <Send size={15} />
                    <span>Send Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
