import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronRight,
  Play,
  Download,
  Video,
  FileText,
  X,
  Compass
} from 'lucide-react';
import './AtomyHubPage.css';

// 5 Official Atomy Hub Portals exactly from https://in.atomy.com/atomy/hub
const OFFICIAL_HUB_ITEMS = [
  {
    id: 'atomy-com',
    title: 'Atomy.com',
    logo: 'https://image.atomy.com/IN/banner/90/562/251000000020562104816.svg',
    desc: 'A company that exceeds customer satisfaction to achieve customer success.',
    url: 'https://global.atomy.com/index.es?sid=a2',
    isExternal: true
  },
  {
    id: 'ch-atomy',
    title: 'CH.ATOMY',
    logo: 'https://image.atomy.com/IN/banner/90/563/251000000020563104843.svg',
    desc: 'Videos, products, and various news content.',
    url: 'https://ch.atomy.com/in',
    isExternal: true
  },
  {
    id: 'atomy-ticket',
    title: 'Atomy Ticket',
    logo: 'https://image.atomy.com/IN/banner/90/564/251000000020564104927.svg',
    desc: "Stay updated with Atomy's global seminars instantly and receive notifications.",
    url: 'https://ticket.atomy.com/h/main?jisa=in&ln=en',
    isExternal: true
  },
  {
    id: 'atomy-aza',
    title: 'AtomyAZA',
    logo: 'https://image.atomy.com/IN/banner/90/565/251000000020565104955.svg',
    desc: 'An online shopping mall that suggests and sells trustworthy products.',
    url: 'https://atomyaza.co.kr/',
    isExternal: true
  },
  {
    id: 'at-g-mall',
    title: 'At.G Mall',
    logo: 'https://image.atomy.com/IN/banner/90/566/251000000020566105020.svg',
    desc: 'The fast way to Atomy Korea’ Products for global members.',
    url: 'https://global.atomy.kr/',
    isExternal: true
  }
];

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
  const [activeMediaTab, setActiveMediaTab] = useState('none'); // 'none', 'videos', 'downloads'
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const handleShortcutClick = (item) => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadFile = (item) => {
    alert(`Initiating download for "${item.title}" (${item.format}, ${item.fileSize}).`);
  };

  return (
    <div className="atomy-hub-page-wrapper">
      {/* 1. Breadcrumb bar */}
      <div className="hub-top-breadcrumb-bar">
        <div className="container hub-breadcrumb-container">
          <div className="hub-breadcrumb">
            <button type="button" className="bread-link" onClick={onNavigateHome}>
              HOME
            </button>
            <ChevronRight size={14} className="bread-separator" />
            <span className="bread-current">AtomyHub</span>
          </div>
        </div>
      </div>

      <div className="container hub-main-container">
        {/* 2. Official Header */}
        <div className="disp-top_title">
          <h2>AtomyHub</h2>
        </div>

        {/* 3. Official 5-Portal Hub List (matching in.atomy.com/atomy/hub) */}
        <div className="hub-list">
          {OFFICIAL_HUB_ITEMS.map((hub) => (
            <dl key={hub.id} className="hub-card-item">
              <dt>
                <span className="logo">
                  <img
                    src={hub.logo}
                    alt={hub.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </span>
                <span className="tit">{hub.title}</span>
              </dt>
              <dd className="txt">{hub.desc}</dd>
              <dd className="bt">
                <button
                  type="button"
                  className="btn sd"
                  onClick={() => handleShortcutClick(hub)}
                  title={`Open ${hub.title}`}
                >
                  <em>Shortcut</em>
                  <ChevronRight size={14} className="shortcut-icon" />
                </button>
              </dd>
            </dl>
          ))}
        </div>

        {/* 4. CH.ATOMY Media & Catalog Resources Accordion / Section */}
        <div className="hub-media-resources-section">
          <div className="hub-section-header">
            <div className="hub-section-title-wrap">
              <Compass size={22} className="hub-section-icon" />
              <h3>CH.ATOMY Multimedia & Official Publications</h3>
            </div>
            <div className="hub-media-toggle-tabs">
              <button
                type="button"
                className={`hub-media-toggle-btn ${activeMediaTab === 'videos' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab(activeMediaTab === 'videos' ? 'none' : 'videos')}
              >
                <Video size={16} />
                <span>Featured Videos</span>
              </button>
              <button
                type="button"
                className={`hub-media-toggle-btn ${activeMediaTab === 'downloads' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab(activeMediaTab === 'downloads' ? 'none' : 'downloads')}
              >
                <FileText size={16} />
                <span>Publications & Catalogs</span>
              </button>
            </div>
          </div>

          {/* Videos Grid */}
          {activeMediaTab === 'videos' && (
            <div className="hub-videos-grid animate-fade">
              {HUB_VIDEOS.map((vid) => (
                <div key={vid.id} className="hub-video-card">
                  <div className="video-thumb-wrap" onClick={() => setActiveVideoModal(vid)}>
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="video-thumb-img"
                      onError={(e) => {
                        e.target.src = 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg';
                      }}
                    />
                    <div className="video-overlay">
                      <div className="play-circle">
                        <Play size={20} fill="#ffffff" color="#ffffff" />
                      </div>
                    </div>
                    <span className="video-duration">{vid.duration}</span>
                  </div>
                  <div className="video-card-body">
                    <span className="video-cat-badge">{vid.category}</span>
                    <h4 className="video-title" onClick={() => setActiveVideoModal(vid)}>
                      {vid.title}
                    </h4>
                    <p className="video-speaker">{vid.speaker}</p>
                    <p className="video-desc">{vid.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Downloads Grid */}
          {activeMediaTab === 'downloads' && (
            <div className="hub-downloads-grid animate-fade">
              {HUB_DOWNLOADS.map((doc) => (
                <div key={doc.id} className="hub-download-card">
                  <div className="doc-icon-wrap">
                    <FileText size={28} />
                  </div>
                  <div className="doc-body">
                    <div className="doc-top-row">
                      <span className="doc-badge">{doc.category}</span>
                      <span className="doc-size">{doc.fileSize}</span>
                    </div>
                    <h4 className="doc-title">{doc.title}</h4>
                    <p className="doc-desc">{doc.desc}</p>
                  </div>
                  <button
                    type="button"
                    className="doc-dl-btn"
                    onClick={() => handleDownloadFile(doc)}
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div className="hub-video-modal-backdrop" onClick={() => setActiveVideoModal(null)}>
          <div className="hub-video-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-cat">{activeVideoModal.category}</span>
                <h3 className="modal-title">{activeVideoModal.title}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveVideoModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-video-viewport">
              <div className="video-player-placeholder">
                <Play size={48} className="player-icon" />
                <p>Streaming CH.ATOMY Official Broadcast ({activeVideoModal.duration})</p>
                <span className="player-caption">{activeVideoModal.speaker}</span>
              </div>
            </div>
            <div className="modal-footer">
              <p className="modal-desc">{activeVideoModal.desc}</p>
              <button
                type="button"
                className="modal-action-btn"
                onClick={() => window.open('https://ch.atomy.com/in', '_blank')}
              >
                <span>Watch full HD on CH.ATOMY</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
