import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, X, ChevronDown } from 'lucide-react';
import './NoticePage.css';

const ATOMY_OFFICIAL_NOTICES = [
  {
    id: 1,
    tab: 'member',
    category: 'GENERAL NOTICE',
    title: 'New Register Member Coupon Offer',
    views: '18,362',
    date: '16-06-2026',
    content: `
      <h3>New Register Member Coupon Offer</h3>
      <p>Dear Valued Atomy India Members,</p>
      <p>We are delighted to announce our exclusive Welcome Gift Coupon initiative for all newly registered Atomy members across India!</p>
      <h4>Promotion Details:</h4>
      <ul>
        <li><strong>Eligibility:</strong> All new members successfully registered and verified via e-KYC.</li>
        <li><strong>Coupon Benefit:</strong> Instant ₹ 500 Discount Voucher applicable on your first shopping mall purchase above ₹ 3,500.</li>
        <li><strong>Validity:</strong> 30 calendar days from the date of registration.</li>
        <li><strong>How to Claim:</strong> The coupon is automatically credited to <em>My Office &gt; My Coupons</em> upon registration completion.</li>
      </ul>
      <p>Start your absolute quality wellness journey with Atomy India today!</p>
    `
  }
];

export default function NoticePage({ onNavigateHome }) {
  // Active Tab: 'member' | 'product' | 'stock' | 'event' | 'career'
  const [activeTab, setActiveTab] = useState('member');
  const [searchField, setSearchField] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslateOn, setIsTranslateOn] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);

  // Tab counts
  const filteredNotices = useMemo(() => {
    return ATOMY_OFFICIAL_NOTICES.filter((n) => {
      const matchTab = n.tab === activeTab;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchTab;

      const matchText =
        searchField === 'title'
          ? n.title.toLowerCase().includes(q)
          : n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);

      return matchTab && matchText;
    });
  }, [activeTab, searchField, searchQuery]);

  const latestNotice = ATOMY_OFFICIAL_NOTICES.find((n) => n.tab === activeTab) || ATOMY_OFFICIAL_NOTICES[0];

  return (
    <div className="atomy-official-notice-page">
      <div className="atomy-notice-center-container">
        {/* 1. Page Header Title & Breadcrumb */}
        <div className="atomy-notice-top-row">
          <h1 className="atomy-notice-page-title">Notice</h1>
          <div className="atomy-notice-breadcrumb">
            <span className="crumb-gray">About Us</span>
            <span className="crumb-sep">&gt;</span>
            <span className="crumb-cyan">Notice</span>
          </div>
        </div>

        {/* 2. Top Navigation Tabs Bar */}
        <div className="atomy-notice-tabs-bar">
          <button
            type="button"
            className={`notice-main-tab ${activeTab === 'member' ? 'active' : ''}`}
            onClick={() => { setActiveTab('member'); setExpandedNoticeId(null); }}
          >
            <span>Member</span>
            {activeTab === 'member' && <span className="tab-active-line"></span>}
          </button>

          <button
            type="button"
            className={`notice-main-tab ${activeTab === 'product' ? 'active' : ''}`}
            onClick={() => { setActiveTab('product'); setExpandedNoticeId(null); }}
          >
            <span>Product</span>
            {activeTab === 'product' && <span className="tab-active-line"></span>}
          </button>

          <button
            type="button"
            className={`notice-main-tab ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stock'); setExpandedNoticeId(null); }}
          >
            <span>Out of Stock/In Stock <span className="asterisk-red">*</span></span>
            {activeTab === 'stock' && <span className="tab-active-line"></span>}
          </button>

          <button
            type="button"
            className={`notice-main-tab ${activeTab === 'event' ? 'active' : ''}`}
            onClick={() => { setActiveTab('event'); setExpandedNoticeId(null); }}
          >
            <span>Event</span>
            {activeTab === 'event' && <span className="tab-active-line"></span>}
          </button>

          <button
            type="button"
            className={`notice-main-tab ${activeTab === 'career' ? 'active' : ''}`}
            onClick={() => { setActiveTab('career'); setExpandedNoticeId(null); }}
          >
            <span>Career</span>
            {activeTab === 'career' && <span className="tab-active-line"></span>}
          </button>
        </div>

        {/* 3. Sub-filter & Search Toolbar */}
        <div className="atomy-notice-toolbar-row">
          <div className="toolbar-count">
            All <strong>{filteredNotices.length}</strong>
          </div>

          <div className="toolbar-controls-right">
            {/* Translate Toggle */}
            <div className="translate-toggle-group">
              <span className="translate-label">Translate / 翻译 / Traducir</span>
              <button
                type="button"
                className={`switch-toggle-pill ${isTranslateOn ? 'on' : ''}`}
                onClick={() => setIsTranslateOn(!isTranslateOn)}
                aria-label="Toggle language translation"
              >
                <span className="switch-slider-knob"></span>
              </button>
            </div>

            {/* Dropdown Filter */}
            <div className="filter-dropdown-wrap">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="filter-select-box"
              >
                <option value="all">All</option>
                <option value="title">Title</option>
              </select>
              <ChevronDown size={14} className="dropdown-chevron-icon" />
            </div>

            {/* Search Input Box */}
            <div className="search-input-box-wrap">
              <input
                type="text"
                placeholder="Enter search term."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="notice-term-input"
              />
              <button type="button" className="term-search-btn" aria-label="Search">
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Table Structure matching image */}
        <div className="atomy-notice-table-container">
          <table className="atomy-notice-official-table">
            <thead>
              <tr>
                <th className="th-category">Category</th>
                <th className="th-title">Title</th>
                <th className="th-views">Views</th>
                <th className="th-date">Registration date</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-table-cell">
                    No notices available for this category.
                  </td>
                </tr>
              ) : (
                filteredNotices.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`notice-data-row ${expandedNoticeId === item.id ? 'active-expanded' : ''}`}
                      onClick={() => setExpandedNoticeId(expandedNoticeId === item.id ? null : item.id)}
                    >
                      <td className="td-category">
                        <span className="category-cyan-text">{item.category}</span>
                      </td>
                      <td className="td-title">
                        <span className="notice-title-clickable">{item.title}</span>
                      </td>
                      <td className="td-views">{item.views}</td>
                      <td className="td-date">{item.date}</td>
                    </tr>

                    {/* Expandable Notice Detail Row */}
                    {expandedNoticeId === item.id && (
                      <tr className="notice-expand-row">
                        <td colSpan={4} className="notice-expand-cell">
                          <div
                            className="notice-inner-content-html"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Bottom Notice Strip (matches bottom of user's screenshot) */}
        {latestNotice && (
          <div className="atomy-notice-bottom-strip">
            <div className="bottom-strip-text">
              <span className="bracket-notice">[Notice]</span>
              <strong className="bottom-strip-cat">{latestNotice.category}</strong>
              <span className="strip-divider">-</span>
              <span className="bottom-strip-title">{latestNotice.title}</span>
            </div>
            <button
              type="button"
              className="bottom-strip-arrow"
              onClick={() => setExpandedNoticeId(latestNotice.id)}
              aria-label="View Notice"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
