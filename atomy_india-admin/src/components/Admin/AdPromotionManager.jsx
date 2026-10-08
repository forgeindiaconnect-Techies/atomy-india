import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Layers,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  ExternalLink,
  RefreshCw,
  Folder,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  getAdConfig,
  saveAdConfig,
  fetchRemoteAdConfig,
  clearAdSuppressionForLogin
} from '../../services/adPromotionService';
import {
  getHeroSlides,
  saveHeroSlides,
  getCategoryBanners,
  saveCategoryBanners
} from '../../services/bannerService';
import './AdPromotionManager.css';

export default function AdPromotionManager({ showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('landing'); // 'landing', 'category', 'floating'

  // 1. Landing Hero Banners State
  const [heroSlides, setHeroSlides] = useState(() => getHeroSlides());
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState(null);
  const [heroFormData, setHeroFormData] = useState({
    title: '',
    subtitle: '',
    img: '',
    bg: '#072044',
    textColor: '#ffffff',
    hasTextOverlay: false,
    link: ''
  });

  // 2. Category Section Banners State
  const CATEGORIES_LIST = [
    { id: 'health', name: 'Health Supplements' },
    { id: 'beauty', name: 'Beauty & Skincare' },
    { id: 'food', name: 'Food & Nutrition' },
    { id: 'personal_care', name: 'Personal Care' },
    { id: 'home', name: 'Home Living' },
    { id: 'hemohim', name: 'HemoHIM' },
    { id: 'others', name: 'ETC / Others' }
  ];
  const [selectedCatId, setSelectedCatId] = useState('health');
  const [catBanners, setCatBanners] = useState(() => getCategoryBanners('health'));
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatBanner, setEditingCatBanner] = useState(null);
  const [catFormData, setCatFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    bgColor: '#f4f0ec',
    categoryId: 'health'
  });

  // 3. Floating Ad State
  const [adConfig, setAdConfig] = useState(() => getAdConfig());

  // Image file input refs for Photo Upload
  const heroFileInputRef = useRef(null);
  const catFileInputRef = useRef(null);
  const floatingFileInputRef = useRef(null);

  // Sync category banners when selectedCatId changes
  useEffect(() => {
    setCatBanners(getCategoryBanners(selectedCatId));
  }, [selectedCatId]);

  // Sync floating ad with remote backend on mount & events
  useEffect(() => {
    fetchRemoteAdConfig().then((cfg) => {
      if (cfg) setAdConfig(cfg);
    });

    const handleAdUpdated = (e) => {
      if (e.detail) setAdConfig(e.detail);
    };
    window.addEventListener('atomy:ad-updated', handleAdUpdated);
    return () => window.removeEventListener('atomy:ad-updated', handleAdUpdated);
  }, []);

  // Generic Photo Upload to Base64 Data URL
  const handlePhotoUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast && showToast('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast && showToast('Image file size exceeds 10MB. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      callback(dataUrl);
      showToast && showToast(`Photo "${file.name}" uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  // --- Handlers: Landing Hero Slides ---
  const handleOpenAddHero = () => {
    setEditingHeroSlide(null);
    setHeroFormData({
      title: '',
      subtitle: '',
      img: '',
      bg: '#072044',
      textColor: '#ffffff',
      hasTextOverlay: false,
      link: ''
    });
    setIsHeroModalOpen(true);
  };

  const handleOpenEditHero = (slide, index) => {
    setEditingHeroSlide({ ...slide, index });
    setHeroFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      img: slide.img || '',
      bg: slide.bg || '#072044',
      textColor: slide.textColor || '#ffffff',
      hasTextOverlay: !!slide.hasTextOverlay,
      link: slide.link || ''
    });
    setIsHeroModalOpen(true);
  };

  const handleSaveHeroSlide = (e) => {
    e.preventDefault();
    if (!heroFormData.img) {
      showToast && showToast('Please provide a photo or image URL for the landing banner.');
      return;
    }

    let updatedSlides = [...heroSlides];
    if (editingHeroSlide !== null && editingHeroSlide.index !== undefined) {
      // Edit existing
      updatedSlides[editingHeroSlide.index] = {
        ...editingHeroSlide,
        ...heroFormData
      };
      showToast && showToast('Landing Page Banner updated successfully!');
    } else {
      // Add new
      const newSlide = {
        id: Date.now(),
        ...heroFormData
      };
      updatedSlides.push(newSlide);
      showToast && showToast('New Landing Page Banner added successfully!');
    }

    setHeroSlides(updatedSlides);
    saveHeroSlides(updatedSlides);
    setIsHeroModalOpen(false);
  };

  const handleDeleteHeroSlide = (index) => {
    if (heroSlides.length <= 1) {
      showToast && showToast('At least one landing banner must remain.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this landing page banner?')) {
      const updated = heroSlides.filter((_, i) => i !== index);
      setHeroSlides(updated);
      saveHeroSlides(updated);
      showToast && showToast('Landing banner deleted.');
    }
  };

  // --- Handlers: Category Banners ---
  const handleOpenAddCatBanner = () => {
    setEditingCatBanner(null);
    setCatFormData({
      title: '',
      subtitle: '',
      image: '',
      bgColor: '#f4f0ec',
      categoryId: selectedCatId
    });
    setIsCatModalOpen(true);
  };

  const handleOpenEditCatBanner = (banner, index) => {
    setEditingCatBanner({ ...banner, index });
    setCatFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      bgColor: banner.bgColor || '#f4f0ec',
      categoryId: selectedCatId
    });
    setIsCatModalOpen(true);
  };

  const handleSaveCatBanner = (e) => {
    e.preventDefault();
    if (!catFormData.image) {
      showToast && showToast('Please provide a photo or image URL for the category banner.');
      return;
    }

    const targetCategory = catFormData.categoryId || selectedCatId;
    let currentList = getCategoryBanners(targetCategory);
    let updatedList = [...currentList];

    if (editingCatBanner !== null && editingCatBanner.index !== undefined) {
      updatedList[editingCatBanner.index] = {
        ...editingCatBanner,
        title: catFormData.title,
        subtitle: catFormData.subtitle,
        image: catFormData.image,
        bgColor: catFormData.bgColor
      };
      showToast && showToast(`Category banner for ${targetCategory.toUpperCase()} updated!`);
    } else {
      updatedList.push({
        id: Date.now(),
        title: catFormData.title,
        subtitle: catFormData.subtitle,
        image: catFormData.image,
        bgColor: catFormData.bgColor
      });
      showToast && showToast(`New category banner added for ${targetCategory.toUpperCase()}!`);
    }

    saveCategoryBanners(targetCategory, updatedList);
    if (targetCategory === selectedCatId) {
      setCatBanners(updatedList);
    }
    setIsCatModalOpen(false);
  };

  const handleDeleteCatBanner = (index) => {
    if (window.confirm('Delete this category banner?')) {
      const updated = catBanners.filter((_, i) => i !== index);
      setCatBanners(updated);
      saveCategoryBanners(selectedCatId, updated);
      showToast && showToast('Category banner deleted.');
    }
  };

  // --- Handlers: Floating Ad ---
  const handleSaveFloatingAd = async () => {
    try {
      await saveAdConfig(adConfig);
      clearAdSuppressionForLogin();
      showToast && showToast('Floating Ad & Pop-up changes saved & published live!');
    } catch (err) {
      showToast && showToast('Error saving floating ad: ' + err.message);
    }
  };

  return (
    <div className="ad-promotion-manager-root animate-fade-in">
      {/* Top Header */}
      <div className="ad-manager-header">
        <div>
          <h2 className="ad-manager-title">Ads & Banner Promotions Manager</h2>
          <p className="ad-manager-subtitle">
            Create, edit, and organize promotional ads with photo upload across Landing Hero, Category Pages, and Floating Pop-up.
          </p>
        </div>
      </div>

      {/* 3 Dedicated Top Tabs */}
      <div className="ad-subtabs-nav">
        <button
          type="button"
          className={`ad-subtab-btn ${activeSubTab === 'landing' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('landing')}
        >
          <Layers size={18} />
          <span>Landing Page Banners</span>
          <span className="ad-tab-count-pill">{heroSlides.length}</span>
        </button>

        <button
          type="button"
          className={`ad-subtab-btn ${activeSubTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('category')}
        >
          <Folder size={18} />
          <span>Category Section Banners</span>
          <span className="ad-tab-count-pill">{CATEGORIES_LIST.length} Cats</span>
        </button>

        <button
          type="button"
          className={`ad-subtab-btn ${activeSubTab === 'floating' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('floating')}
        >
          <Sparkles size={18} />
          <span>Landing Page Floating Ad & Pop-up</span>
          <span className={`ad-live-pill ${adConfig.isActive ? 'live' : 'off'}`}>
            {adConfig.isActive ? 'LIVE' : 'OFF'}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: LANDING PAGE BANNERS */}
      {/* ============================================================== */}
      {activeSubTab === 'landing' && (
        <div className="ad-section-container animate-fade-in">
          <div className="ad-section-toolbar">
            <div>
              <h3 className="ad-section-heading">Landing Page Hero Slides ({heroSlides.length})</h3>
              <p className="ad-section-subheading">
                Top rotating hero carousel banners displayed on the customer home page.
              </p>
            </div>
            <button
              type="button"
              className="atomy-btn-primary"
              onClick={handleOpenAddHero}
            >
              <Plus size={16} />
              <span>Add New Landing Banner</span>
            </button>
          </div>

          <div className="ad-cards-grid">
            {heroSlides.map((slide, idx) => (
              <div key={slide.id || idx} className="ad-banner-card">
                <div
                  className="ad-banner-preview-box"
                  style={{ backgroundColor: slide.bg || '#072044' }}
                >
                  <img
                    src={slide.img}
                    alt={slide.title || 'Slide'}
                    className="ad-banner-img"
                    onError={(e) => { e.target.src = 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg'; }}
                  />
                  {slide.hasTextOverlay && (
                    <div className="ad-banner-overlay-preview" style={{ color: slide.textColor || '#fff' }}>
                      <span className="ad-overlay-sub">{slide.subtitle}</span>
                      <strong className="ad-overlay-tit">{slide.title}</strong>
                    </div>
                  )}
                  <span className="ad-banner-order-badge">#{idx + 1}</span>
                </div>

                <div className="ad-card-details">
                  <div className="ad-card-title-row">
                    <h4>{slide.title || '(No Title / Image-only banner)'}</h4>
                    <span className="ad-card-color-swatch" style={{ backgroundColor: slide.bg || '#072044' }} title={slide.bg}></span>
                  </div>
                  {slide.subtitle && <p className="ad-card-subtitle">{slide.subtitle}</p>}

                  <div className="ad-card-meta-row">
                    <span className="ad-card-tag">
                      {slide.hasTextOverlay ? 'Text Overlay: ON' : 'Image Only'}
                    </span>
                    <div className="ad-card-actions">
                      <button
                        type="button"
                        className="ad-btn-icon edit"
                        onClick={() => handleOpenEditHero(slide, idx)}
                        title="Edit Banner"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="ad-btn-icon delete"
                        onClick={() => handleDeleteHeroSlide(idx)}
                        title="Delete Banner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: CATEGORY SECTION BANNERS */}
      {/* ============================================================== */}
      {activeSubTab === 'category' && (
        <div className="ad-section-container animate-fade-in">
          <div className="ad-section-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div>
                <h3 className="ad-section-heading">Category Header Banners</h3>
                <p className="ad-section-subheading">
                  Top promotional banners displayed above products on category pages.
                </p>
              </div>

              {/* Category Dropdown Filter */}
              <div className="cat-selector-box">
                <label>Select Category:</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="atomy-form-select cat-dropdown"
                >
                  {CATEGORIES_LIST.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.id})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="atomy-btn-primary"
              onClick={handleOpenAddCatBanner}
            >
              <Plus size={16} />
              <span>Add Banner to {selectedCatId.toUpperCase()}</span>
            </button>
          </div>

          {catBanners.length === 0 ? (
            <div className="ad-empty-state">
              <ImageIcon size={48} className="ad-empty-icon" />
              <h4>No banners configured for {selectedCatId.toUpperCase()} yet</h4>
              <p>Add a promotional header banner for this category section.</p>
              <button
                type="button"
                className="atomy-btn-primary"
                onClick={handleOpenAddCatBanner}
                style={{ marginTop: '12px' }}
              >
                <Plus size={16} />
                <span>Add Banner Now</span>
              </button>
            </div>
          ) : (
            <div className="ad-cards-grid">
              {catBanners.map((banner, idx) => (
                <div key={banner.id || idx} className="ad-banner-card">
                  <div
                    className="ad-banner-preview-box"
                    style={{ backgroundColor: banner.bgColor || '#f4f0ec' }}
                  >
                    <img
                      src={banner.image}
                      alt={banner.title || 'Category Banner'}
                      className="ad-banner-img"
                      onError={(e) => { e.target.src = 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg'; }}
                    />
                    <span className="ad-banner-order-badge">#{idx + 1}</span>
                  </div>

                  <div className="ad-card-details">
                    <div className="ad-card-title-row">
                      <h4>{banner.title || '(Untitled Banner)'}</h4>
                      <span className="ad-card-color-swatch" style={{ backgroundColor: banner.bgColor || '#f4f0ec' }} title={banner.bgColor}></span>
                    </div>
                    {banner.subtitle && <p className="ad-card-subtitle">{banner.subtitle}</p>}

                    <div className="ad-card-meta-row">
                      <span className="ad-card-tag category-tag">
                        {selectedCatId.toUpperCase()}
                      </span>
                      <div className="ad-card-actions">
                        <button
                          type="button"
                          className="ad-btn-icon edit"
                          onClick={() => handleOpenEditCatBanner(banner, idx)}
                          title="Edit Banner"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="ad-btn-icon delete"
                          onClick={() => handleDeleteCatBanner(idx)}
                          title="Delete Banner"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: LANDING PAGE FLOATING AD & POP-UP */}
      {/* ============================================================== */}
      {activeSubTab === 'floating' && (
        <div className="ad-section-container animate-fade-in">
          {/* Status Banner */}
          <div
            className="floating-ad-status-bar"
            style={{
              background: adConfig.isActive ? '#ecfdf5' : '#fef2f2',
              borderColor: adConfig.isActive ? '#10b981' : '#ef4444'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                className="status-pulse-dot"
                style={{
                  background: adConfig.isActive ? '#10b981' : '#ef4444',
                  boxShadow: adConfig.isActive ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
                }}
              />
              <div>
                <strong style={{ color: adConfig.isActive ? '#065f46' : '#991b1b', fontSize: '15.5px' }}>
                  {adConfig.isActive ? 'Floating Ad is Currently LIVE on Store' : 'Floating Ad is Currently DISABLED'}
                </strong>
                <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '13px' }}>
                  {adConfig.isActive
                    ? 'Appears automatically as a floating pill on the bottom-left and pops up as a modal on landing page.'
                    : 'Hidden from customer landing page.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label className="toggle-label">
                <span>Live Status:</span>
                <input
                  type="checkbox"
                  checked={adConfig.isActive}
                  onChange={(e) => {
                    const updated = { ...adConfig, isActive: e.target.checked };
                    setAdConfig(updated);
                    saveAdConfig(updated);
                    showToast && showToast(e.target.checked ? 'Floating ad turned ON' : 'Floating ad turned OFF');
                  }}
                  className="toggle-checkbox"
                />
              </label>

              <button
                type="button"
                className="atomy-btn-secondary"
                onClick={() => {
                  clearAdSuppressionForLogin();
                  showToast && showToast("Today's suppression cleared! The ad will pop up immediately on store reload.");
                }}
              >
                Test Pop-up (Reset Suppression)
              </button>
            </div>
          </div>

          {/* Form & Live Preview Grid */}
          <div className="floating-ad-grid">
            {/* Form */}
            <div className="settings-section-card">
              <div className="settings-card-header">
                <h3>Ad Details & Poster Configuration</h3>
                <p>Upload a promotional photo or customize the headline copy, prices, and tags.</p>
              </div>

              <div className="settings-body-form" style={{ padding: '20px' }}>
                {/* Photo Upload Function */}
                <div className="atomy-form-group photo-upload-group">
                  <label>Promotion Poster Photo</label>
                  <div className="photo-upload-container">
                    <input
                      type="file"
                      ref={floatingFileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handlePhotoUpload(e, (dataUrl) => setAdConfig({ ...adConfig, image: dataUrl }))}
                    />

                    <div className="photo-preview-box">
                      {adConfig.image ? (
                        <img src={adConfig.image} alt="Poster" className="uploaded-poster-preview" />
                      ) : (
                        <div className="photo-placeholder">
                          <ImageIcon size={32} />
                          <span>No photo selected</span>
                        </div>
                      )}
                    </div>

                    <div className="photo-upload-actions">
                      <button
                        type="button"
                        className="atomy-btn-secondary"
                        onClick={() => floatingFileInputRef.current?.click()}
                      >
                        <Upload size={16} />
                        <span>Upload Photo from Device</span>
                      </button>
                      <div className="photo-url-input-wrap">
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Or enter Image URL:</span>
                        <input
                          type="text"
                          value={adConfig.image}
                          onChange={(e) => setAdConfig({ ...adConfig, image: e.target.value })}
                          className="atomy-form-input"
                          placeholder="/images/promotions/new_arrival_adelica.png"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="atomy-form-group">
                  <label>Product Headline / Name</label>
                  <input
                    type="text"
                    value={adConfig.name}
                    onChange={(e) => setAdConfig({ ...adConfig, name: e.target.value })}
                    className="atomy-form-input"
                    placeholder="e.g. Adelica Soft Brow Pencil - Gray"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="atomy-form-group">
                    <label>Brand Name</label>
                    <input
                      type="text"
                      value={adConfig.brand}
                      onChange={(e) => setAdConfig({ ...adConfig, brand: e.target.value })}
                      className="atomy-form-input"
                      placeholder="e.g. ATOMY adelica"
                    />
                  </div>
                  <div className="atomy-form-group">
                    <label>Badge Tag</label>
                    <input
                      type="text"
                      value={adConfig.badge}
                      onChange={(e) => setAdConfig({ ...adConfig, badge: e.target.value })}
                      className="atomy-form-input"
                      placeholder="e.g. NEW LAUNCH"
                    />
                  </div>
                </div>

                <div className="atomy-form-group">
                  <label>Collection / Header Banner Title</label>
                  <input
                    type="text"
                    value={adConfig.collection || ''}
                    onChange={(e) => setAdConfig({ ...adConfig, collection: e.target.value })}
                    className="atomy-form-input"
                    placeholder="e.g. NEW ARRIVAL BEAUTY COLLECTION"
                  />
                </div>

                <div className="atomy-form-group">
                  <label>Tagline / Description</label>
                  <textarea
                    rows={3}
                    value={adConfig.tagline}
                    onChange={(e) => setAdConfig({ ...adConfig, tagline: e.target.value })}
                    className="atomy-form-input"
                    placeholder="Diamond pentagonal cut, to express easy and delicate eyebrows..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div className="atomy-form-group">
                    <label>MRP Price (₹)</label>
                    <input
                      type="number"
                      value={adConfig.price}
                      onChange={(e) => setAdConfig({ ...adConfig, price: parseFloat(e.target.value) || 0 })}
                      className="atomy-form-input"
                    />
                  </div>
                  <div className="atomy-form-group">
                    <label>Points Value (PV)</label>
                    <input
                      type="number"
                      value={adConfig.pv}
                      onChange={(e) => setAdConfig({ ...adConfig, pv: parseInt(e.target.value) || 0 })}
                      className="atomy-form-input"
                    />
                  </div>
                  <div className="atomy-form-group">
                    <label>Product ID</label>
                    <input
                      type="text"
                      value={adConfig.id}
                      onChange={(e) => setAdConfig({ ...adConfig, id: e.target.value })}
                      className="atomy-form-input"
                      placeholder="D00620"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="atomy-btn-primary"
                  onClick={handleSaveFloatingAd}
                  style={{ width: '100%', marginTop: '18px', padding: '12px' }}
                >
                  <Check size={18} />
                  <span>Save & Publish Floating Ad</span>
                </button>
              </div>
            </div>

            {/* Live Customer Preview */}
            <div className="preview-container">
              <div className="settings-section-card">
                <div className="settings-card-header">
                  <h3>Customer Preview: Floating Badge</h3>
                  <p>How it floats on the bottom-left of the customer landing page:</p>
                </div>
                <div style={{ padding: '24px', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                  <div className="floating-badge-preview-card">
                    <div className="badge-thumb-box">
                      <img src={adConfig.image} alt="" className="badge-thumb-img" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="badge-info-box">
                      <div className="badge-tag-row">
                        <span className="badge-blue-pill">{adConfig.badge || 'NEW LAUNCH'}</span>
                        <span className="badge-brand-text">{adConfig.brand}</span>
                      </div>
                      <div className="badge-name-text">{adConfig.name}</div>
                      <div className="badge-price-row">
                        <strong>₹{adConfig.price}</strong>
                        <span className="badge-pv-pill">{adConfig.pv?.toLocaleString()} PV</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-card" style={{ marginTop: '20px' }}>
                <div className="settings-card-header">
                  <h3>Customer Preview: Pop-up Modal Ad</h3>
                  <p>How it appears as a clean popup with photo poster:</p>
                </div>
                <div style={{ padding: '20px', background: '#f1f5f9', display: 'flex', justifyContent: 'center' }}>
                  <div className="modal-preview-box">
                    <div className="modal-preview-header">
                      <span>{adConfig.collection || 'PROMOTION'}</span>
                      <X size={16} />
                    </div>
                    <div className="modal-preview-poster">
                      <img src={adConfig.image} alt="" className="modal-poster-img" />
                    </div>
                    <div className="modal-preview-footer">
                      <span>Do not show again today</span>
                      <span style={{ fontWeight: '600', color: '#00a3e0' }}>Close</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT LANDING PAGE BANNER */}
      {/* ============================================================== */}
      {isHeroModalOpen && (
        <div className="ad-modal-backdrop" onClick={() => setIsHeroModalOpen(false)}>
          <div className="ad-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3>{editingHeroSlide ? 'Edit Landing Page Banner' : 'Add New Landing Page Banner'}</h3>
              <button
                type="button"
                className="ad-modal-close"
                onClick={() => setIsHeroModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveHeroSlide} className="ad-modal-body">
              {/* Photo Upload Section */}
              <div className="atomy-form-group photo-upload-group">
                <label>Banner Photo / Image *</label>
                <div className="modal-photo-dropzone">
                  <input
                    type="file"
                    ref={heroFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handlePhotoUpload(e, (dataUrl) => setHeroFormData({ ...heroFormData, img: dataUrl }))}
                  />

                  {heroFormData.img ? (
                    <div className="modal-photo-preview-wrap">
                      <img src={heroFormData.img} alt="Banner Preview" className="modal-photo-preview" />
                      <button
                        type="button"
                        className="change-photo-btn"
                        onClick={() => heroFileInputRef.current?.click()}
                      >
                        <Upload size={14} /> Change Photo
                      </button>
                    </div>
                  ) : (
                    <div
                      className="modal-photo-drop-prompt"
                      onClick={() => heroFileInputRef.current?.click()}
                    >
                      <Upload size={32} className="drop-icon" />
                      <strong>Click to Upload Banner Photo from Device</strong>
                      <span>Supports JPG, PNG, WEBP up to 10MB</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Or enter Image URL:</label>
                  <input
                    type="text"
                    value={heroFormData.img}
                    onChange={(e) => setHeroFormData({ ...heroFormData, img: e.target.value })}
                    className="atomy-form-input"
                    placeholder="https://image.atomy.com/IN/banner/..."
                  />
                </div>
              </div>

              <div className="atomy-form-group">
                <label>Banner Title (Main Headline)</label>
                <input
                  type="text"
                  value={heroFormData.title}
                  onChange={(e) => setHeroFormData({ ...heroFormData, title: e.target.value })}
                  className="atomy-form-input"
                  placeholder="e.g. Atomy India Presents Mongsang Talk Show"
                />
              </div>

              <div className="atomy-form-group">
                <label>Subtitle / Subheading</label>
                <input
                  type="text"
                  value={heroFormData.subtitle}
                  onChange={(e) => setHeroFormData({ ...heroFormData, subtitle: e.target.value })}
                  className="atomy-form-input"
                  placeholder="e.g. Special Seminar & Direct Selling Vision"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="atomy-form-group">
                  <label>Background Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={heroFormData.bg}
                      onChange={(e) => setHeroFormData({ ...heroFormData, bg: e.target.value })}
                      style={{ width: '40px', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={heroFormData.bg}
                      onChange={(e) => setHeroFormData({ ...heroFormData, bg: e.target.value })}
                      className="atomy-form-input"
                      placeholder="#072044"
                    />
                  </div>
                </div>

                <div className="atomy-form-group">
                  <label>Text Color</label>
                  <select
                    value={heroFormData.textColor}
                    onChange={(e) => setHeroFormData({ ...heroFormData, textColor: e.target.value })}
                    className="atomy-form-select"
                  >
                    <option value="#ffffff">Light / White (#ffffff)</option>
                    <option value="#222222">Dark / Black (#222222)</option>
                  </select>
                </div>
              </div>

              <div className="atomy-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={heroFormData.hasTextOverlay}
                    onChange={(e) => setHeroFormData({ ...heroFormData, hasTextOverlay: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#00a3e0' }}
                  />
                  <strong>Show Text Overlay with Arrow on Banner</strong>
                </label>
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                  Enable if your banner image doesn't already have text embedded in it.
                </small>
              </div>

              <div className="ad-modal-footer">
                <button
                  type="button"
                  className="atomy-btn-secondary"
                  onClick={() => setIsHeroModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="atomy-btn-primary"
                >
                  <Check size={16} />
                  <span>{editingHeroSlide ? 'Save Changes' : 'Add Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT CATEGORY BANNER */}
      {/* ============================================================== */}
      {isCatModalOpen && (
        <div className="ad-modal-backdrop" onClick={() => setIsCatModalOpen(false)}>
          <div className="ad-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3>{editingCatBanner ? 'Edit Category Banner' : `Add Category Banner`}</h3>
              <button
                type="button"
                className="ad-modal-close"
                onClick={() => setIsCatModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCatBanner} className="ad-modal-body">
              <div className="atomy-form-group">
                <label>Target Category</label>
                <select
                  value={catFormData.categoryId}
                  onChange={(e) => setCatFormData({ ...catFormData, categoryId: e.target.value })}
                  className="atomy-form-select"
                >
                  {CATEGORIES_LIST.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.id})</option>
                  ))}
                </select>
              </div>

              {/* Photo Upload Section */}
              <div className="atomy-form-group photo-upload-group">
                <label>Category Banner Photo *</label>
                <div className="modal-photo-dropzone">
                  <input
                    type="file"
                    ref={catFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handlePhotoUpload(e, (dataUrl) => setCatFormData({ ...catFormData, image: dataUrl }))}
                  />

                  {catFormData.image ? (
                    <div className="modal-photo-preview-wrap">
                      <img src={catFormData.image} alt="Preview" className="modal-photo-preview" />
                      <button
                        type="button"
                        className="change-photo-btn"
                        onClick={() => catFileInputRef.current?.click()}
                      >
                        <Upload size={14} /> Change Photo
                      </button>
                    </div>
                  ) : (
                    <div
                      className="modal-photo-drop-prompt"
                      onClick={() => catFileInputRef.current?.click()}
                    >
                      <Upload size={32} className="drop-icon" />
                      <strong>Click to Upload Category Banner Photo from Device</strong>
                      <span>Supports JPG, PNG, WEBP</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Or enter Image URL:</label>
                  <input
                    type="text"
                    value={catFormData.image}
                    onChange={(e) => setCatFormData({ ...catFormData, image: e.target.value })}
                    className="atomy-form-input"
                    placeholder="https://image.atomy.com/IN/banner/..."
                  />
                </div>
              </div>

              <div className="atomy-form-group">
                <label>Banner Title</label>
                <input
                  type="text"
                  value={catFormData.title}
                  onChange={(e) => setCatFormData({ ...catFormData, title: e.target.value })}
                  className="atomy-form-input"
                  placeholder="e.g. Liquid Laundry Detergent"
                />
              </div>

              <div className="atomy-form-group">
                <label>Subtitle / Description</label>
                <input
                  type="text"
                  value={catFormData.subtitle}
                  onChange={(e) => setCatFormData({ ...catFormData, subtitle: e.target.value })}
                  className="atomy-form-input"
                  placeholder="e.g. Making Every Fabric Feel Like New Again"
                />
              </div>

              <div className="atomy-form-group">
                <label>Background Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={catFormData.bgColor}
                    onChange={(e) => setCatFormData({ ...catFormData, bgColor: e.target.value })}
                    style={{ width: '40px', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={catFormData.bgColor}
                    onChange={(e) => setCatFormData({ ...catFormData, bgColor: e.target.value })}
                    className="atomy-form-input"
                    placeholder="#ebe6df"
                  />
                </div>
              </div>

              <div className="ad-modal-footer">
                <button
                  type="button"
                  className="atomy-btn-secondary"
                  onClick={() => setIsCatModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="atomy-btn-primary"
                >
                  <Check size={16} />
                  <span>{editingCatBanner ? 'Save Changes' : 'Add Category Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
