import React, { useState } from 'react';
import {
  Play,
  Download,
  Share2,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Video,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  X
} from 'lucide-react';
import './AtomyHubPage.css';

const HUB_VIDEOS = [
  {
    id: 'vid-1',
    category: 'Chairman Lecture',
    title: 'The Soul of Masstige: Absolute Quality & Absolute Price',
    duration: '24:18',
    speaker: 'Han-Gill Park, Founder & Chairman',
    thumbnail: 'https://image.atomy.com/disp/siteInfo/seo/og_image_v20251013133919.png',
    desc: 'Chairman Park explores why genuine customer success is the only sustainable business model in the modern direct selling era.'
  },
  {
    id: 'vid-2',
    category: 'Product Spotlight',
    title: 'HemoHIM: Awakening Exhausted Immune Cells',
    duration: '08:42',
    speaker: 'Dr. Sung-Hoon Kim, KAERI Research Team',
    thumbnail: 'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg',
    desc: 'The clinical biotechnology and patented botanical extraction behind Angelica Gigas, Cnidium, and Paeonia Japonica.'
  },
  {
    id: 'vid-3',
    category: 'Skincare Science',
    title: 'Atomy Absolute CellActive Skincare: 6 Technologies',
    duration: '14:05',
    speaker: 'Kolmar BNH R&D Centre',
    thumbnail: 'https://image.atomy.com/IN/goods/D00201/org/085/260326000051085.jpg',
    desc: 'Unveiling the prestigious King Sejong Award-winning micro-encapsulation and targeted delivery technology.'
  },
  {
    id: 'vid-4',
    category: 'Success Story',
    title: 'From Modest Beginnings to Imperial Master',
    duration: '18:50',
    speaker: 'Imperial Master Lee Hye-Jung',
    thumbnail: 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg',
    desc: 'An inspiring life journey of faith, humble service, and bilateral network perseverance.'
  }
];

const HUB_DOWNLOADS = [
  {
    id: 'dl-1',
    category: 'Product Literature',
    title: 'Atomy India Official Product Catalog (2026 Edition)',
    fileSize: '18.4 MB',
    format: 'PDF',
    desc: 'Complete full-color catalog featuring Health Supplements, Skincare, Hair & Body, and Home Living with detailed PV values.'
  },
  {
    id: 'dl-2',
    category: 'Business Guidance',
    title: 'Official Compensation Plan & Dealership Guide',
    fileSize: '4.2 MB',
    format: 'PDF',
    desc: 'Authorized reference document explaining Dealership classes, daily matching score calculation, and Mastership bonus cycles.'
  },
  {
    id: 'dl-3',
    category: 'Compliance & Ethics',
    title: 'Direct Seller Agreement & Code of Ethics',
    fileSize: '2.8 MB',
    format: 'PDF',
    desc: 'Terms and conditions governing independent distributorship under Indian Consumer Protection (Direct Selling) Rules, 2021.'
  },
  {
    id: 'dl-4',
    category: 'Life Scenario',
    title: 'Atomy Life Scenario Workbook & Goal Planner',
    fileSize: '6.5 MB',
    format: 'PDF',
    desc: 'The official workbook designed by Chairman Park to map out your balanced life: Flesh, Soul, Spirit, and Environment.'
  }
];

export default function AtomyHubPage({ onNavigateHome, onNavigateCategory }) {
  const [activeTab, setActiveTab] = useState('media');
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const handleDownloadFile = (item) => {
    alert(`Initiating download for "${item.title}" (${item.format}, ${item.fileSize}).`);
  };

  return (
    <div className="atomy-hub-page">
      {/* 1. Breadcrumbs */}
      <div className="hub-breadcrumb-bar">
        <div className="hub-container">
          <button type="button" className="bread-link" onClick={onNavigateHome}>
            HOME
          </button>
          <ChevronRight size={14} className="bread-sep" />
          <span className="bread-active">AtomyHUB</span>
        </div>
      </div>

      {/* 2. Header Banner */}
      <section className="hub-header-banner">
        <div className="hub-container">
          <div className="hub-banner-content">
            <span className="hub-eyebrow">DIGITAL ECOSYSTEM & MEDIA PORTAL</span>
            <h1 className="hub-title">AtomyHUB Multimedia & Resource Center</h1>
            <p className="hub-subtitle">
              Your centralized gateway to official videos, marketing collateral, business presentations,
              and downloadable catalogs to support your personal wellness and distributor success.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Sub Nav Tabs */}
      <nav className="hub-nav-tabs-wrapper">
        <div className="hub-container">
          <div className="hub-nav-tabs">
            <button
              className={`hub-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveTab('media')}
            >
              <Video size={16} />
              <span>CH.ATOMY Videos</span>
            </button>
            <button
              className={`hub-tab-btn ${activeTab === 'downloads' ? 'active' : ''}`}
              onClick={() => setActiveTab('downloads')}
            >
              <Download size={16} />
              <span>Download Center</span>
            </button>
            <button
              className={`hub-tab-btn ${activeTab === 'apps' ? 'active' : ''}`}
              onClick={() => setActiveTab('apps')}
            >
              <Smartphone size={16} />
              <span>Mobile Apps & Tools</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 4. Tab Content Area */}
      <div className="hub-container hub-content-container">
        {/* TAB 1: MEDIA */}
        {activeTab === 'media' && (
          <div className="hub-pane-fade">
            <div className="hub-pane-header">
              <span className="kicker">CH.ATOMY STREAMING</span>
              <h2>Featured Lectures & Product Documentaries</h2>
              <p>Explore world-class video presentations developed by Atomy Global Broadcasting.</p>
            </div>

            <div className="videos-grid">
              {HUB_VIDEOS.map((vid) => (
                <div key={vid.id} className="hub-video-card" onClick={() => setActiveVideoModal(vid)}>
                  <div className="video-thumb-wrap">
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      onError={(e) => {
                        e.currentTarget.src = 'https://image.atomy.com/disp/siteInfo/seo/og_image_v20251013133919.png';
                      }}
                    />
                    <div className="play-overlay">
                      <div className="play-circle">
                        <Play size={20} fill="#ffffff" />
                      </div>
                    </div>
                    <span className="video-time-tag">{vid.duration}</span>
                  </div>

                  <div className="video-card-body">
                    <span className="vid-cat-tag">{vid.category}</span>
                    <h3 className="vid-title">{vid.title}</h3>
                    <p className="vid-desc">{vid.desc}</p>
                    <div className="vid-speaker-row">
                      <span>Speaker: <strong>{vid.speaker}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ch-atomy-banner-strip">
              <div>
                <h3>Want 24/7 Unlimited Access to Over 3,000+ Lectures?</h3>
                <p>Visit the official CH.ATOMY India portal and Atomy Official YouTube Channel for non-stop learning.</p>
              </div>
              <a
                href="https://ch.atomy.com"
                target="_blank"
                rel="noreferrer"
                className="ch-atomy-link-btn"
              >
                <span>Open CH.ATOMY Global</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: DOWNLOADS */}
        {activeTab === 'downloads' && (
          <div className="hub-pane-fade">
            <div className="hub-pane-header">
              <span className="kicker">OFFICIAL PUBLICATIONS & LITERATURE</span>
              <h2>Download Center</h2>
              <p>Download the latest official catalogs, compensation plan brochures, and distributor kits in high resolution.</p>
            </div>

            <div className="downloads-list-grid">
              {HUB_DOWNLOADS.map((item) => (
                <div key={item.id} className="download-item-card">
                  <div className="dl-icon-wrap">
                    <FileText size={28} color="#00A3E0" />
                  </div>
                  <div className="dl-text-wrap">
                    <span className="dl-cat">{item.category} • {item.format} ({item.fileSize})</span>
                    <h3 className="dl-title">{item.title}</h3>
                    <p className="dl-desc">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    className="dl-action-btn"
                    onClick={() => handleDownloadFile(item)}
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: APPS */}
        {activeTab === 'apps' && (
          <div className="hub-pane-fade">
            <div className="hub-pane-header">
              <span className="kicker">DIGITAL ATOMY</span>
              <h2>Atomy Mobile Applications for iOS & Android</h2>
              <p>Shop on the go, track daily Point Value, and manage your lineage network anywhere, anytime.</p>
            </div>

            <div className="apps-showcase-grid">
              <div className="app-card">
                <div className="app-badge">OFFICIAL SHOPPING</div>
                <h3>Atomy Mobile App</h3>
                <p>
                  The official shopping mall and customer portal with real-time biometric login,
                  1-click checkout, express delivery tracking, and order history.
                </p>
                <div className="app-buttons-row">
                  <button className="store-dl-btn" onClick={() => alert('Redirecting to Google Play Store')}>
                    <span>Google Play</span>
                  </button>
                  <button className="store-dl-btn" onClick={() => alert('Redirecting to Apple App Store')}>
                    <span>App Store</span>
                  </button>
                </div>
              </div>

              <div className="app-card">
                <div className="app-badge">BUSINESS TERMINAL</div>
                <h3>Atomy Ticket & Event App</h3>
                <p>
                  Official digital ticketing and entry verification application for attending
                  One Day Seminars and national Success Academy conferences.
                </p>
                <div className="app-buttons-row">
                  <button className="store-dl-btn" onClick={() => alert('Redirecting to Google Play Store')}>
                    <span>Google Play</span>
                  </button>
                  <button className="store-dl-btn" onClick={() => alert('Redirecting to Apple App Store')}>
                    <span>App Store</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Video Player Modal */}
      {activeVideoModal && (
        <div className="video-player-modal-backdrop" onClick={() => setActiveVideoModal(null)}>
          <div className="video-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <div className="modal-title-cluster">
                <span className="vid-cat-tag">{activeVideoModal.category}</span>
                <h4>{activeVideoModal.title}</h4>
              </div>
              <button className="video-modal-close" onClick={() => setActiveVideoModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="video-modal-body">
              <div className="video-player-placeholder">
                <Play size={48} color="#00A3E0" />
                <p>Streaming Official Atomy High-Definition Lecture</p>
                <span>Duration: {activeVideoModal.duration} • Speaker: {activeVideoModal.speaker}</span>
              </div>
              <p className="modal-video-desc">{activeVideoModal.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
