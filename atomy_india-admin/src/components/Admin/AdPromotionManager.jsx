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
  AlertCircle,
  ChevronLeft,
  ChevronRight
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
  const [isFloatingBannerModalOpen, setIsFloatingBannerModalOpen] = useState(false);
  const [editingFloatingIndex, setEditingFloatingIndex] = useState(null);
  const [previewCarouselIndex, setPreviewCarouselIndex] = useState(0);
  const [floatingBannerFormData, setFloatingBannerFormData] = useState({
    id: '',
    name: '',
    title: '',
    brand: 'ATOMY INDIA',
    collection: 'SPECIAL PROMOTION',
    tagline: '',
    subtitle: '',
    price: 0,
    pv: 0,
    image: '',
    badge: 'SPECIAL OFFER',
    badgeColor: '#F59E0B',
    link: '',
    actionText: 'View Details',
    isActive: true
  });

  // Image file input refs for Photo Upload
  const heroFileInputRef = useRef(null);
  const catFileInputRef = useRef(null);
  const floatingFileInputRef = useRef(null);
  const floatingBannerFileInputRef = useRef(null);

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

  // --- Handlers: Floating Ad & Multi-Banners ---
  const handleOpenAddFloatingBanner = () => {
    setEditingFloatingIndex(null);
    setFloatingBannerFormData({
      id: `ad-${Date.now()}`,
      name: '',
      title: '',
      brand: 'ATOMY INDIA',
      collection: 'SPECIAL PROMOTION',
      tagline: '',
      subtitle: '',
      price: 0,
      pv: 0,
      image: '',
      badge: 'SPECIAL OFFER',
      badgeColor: '#F59E0B',
      link: '',
      actionText: 'View Details',
      isActive: true
    });
    setIsFloatingBannerModalOpen(true);
  };

  const handleOpenEditFloatingBanner = (banner, index) => {
    setEditingFloatingIndex(index);
    setFloatingBannerFormData({
      id: banner.id || `ad-${Date.now()}`,
      name: banner.name || banner.title || '',
      title: banner.title || banner.name || '',
      brand: banner.brand || 'ATOMY INDIA',
      collection: banner.collection || '',
      tagline: banner.tagline || banner.subtitle || '',
      subtitle: banner.subtitle || banner.tagline || '',
      price: Number(banner.price) || 0,
      pv: Number(banner.pv) || 0,
      image: banner.image || '',
      badge: banner.badge || 'PROMOTION',
      badgeColor: banner.badgeColor || '#00a3e0',
      link: banner.link || '',
      actionText: banner.actionText || '',
      isActive: banner.isActive !== false
    });
    setIsFloatingBannerModalOpen(true);
  };

  const handleSaveFloatingBanner = async (e) => {
    e.preventDefault();
    if (!floatingBannerFormData.image) {
      showToast && showToast('Please select or enter an image URL for the pop-up ad banner.');
      return;
    }

    const currentAds = Array.isArray(adConfig.ads) && adConfig.ads.length > 0
      ? [...adConfig.ads]
      : [];

    const bannerObj = {
      ...floatingBannerFormData,
      name: floatingBannerFormData.name || floatingBannerFormData.title || 'Atomy Promotion',
      title: floatingBannerFormData.title || floatingBannerFormData.name || 'Atomy Promotion',
    };

    let updatedAds;
    if (editingFloatingIndex !== null && editingFloatingIndex !== undefined) {
      updatedAds = [...currentAds];
      updatedAds[editingFloatingIndex] = {
        ...updatedAds[editingFloatingIndex],
        ...bannerObj
      };
      showToast && showToast('Pop-up ad banner updated successfully!');
    } else {
      updatedAds = [...currentAds, bannerObj];
      showToast && showToast('New pop-up ad banner added successfully!');
    }

    const updatedConfig = {
      ...adConfig,
      ads: updatedAds,
      image: updatedAds[0]?.image || adConfig.image,
      name: updatedAds[0]?.name || adConfig.name,
      price: updatedAds[0]?.price ?? adConfig.price,
      pv: updatedAds[0]?.pv ?? adConfig.pv,
      badge: updatedAds[0]?.badge || adConfig.badge,
    };

    setAdConfig(updatedConfig);
    await saveAdConfig(updatedConfig);
    clearAdSuppressionForLogin();
    setIsFloatingBannerModalOpen(false);
  };

  const handleDeleteFloatingBanner = async (index) => {
    const currentAds = Array.isArray(adConfig.ads) ? adConfig.ads : [];
    if (currentAds.length <= 1) {
      showToast && showToast('At least one pop-up ad banner must remain.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this pop-up ad banner?')) {
      const updatedAds = currentAds.filter((_, i) => i !== index);
      const updatedConfig = {
        ...adConfig,
        ads: updatedAds,
        image: updatedAds[0]?.image || adConfig.image,
      };
      setAdConfig(updatedConfig);
      await saveAdConfig(updatedConfig);
      showToast && showToast('Pop-up ad banner deleted.');
    }
  };

  const handleToggleFloatingBannerActive = async (index) => {
    const currentAds = Array.isArray(adConfig.ads) ? [...adConfig.ads] : [];
    if (currentAds[index]) {
      currentAds[index] = {
        ...currentAds[index],
        isActive: currentAds[index].isActive === false ? true : false
      };
      const updatedConfig = { ...adConfig, ads: currentAds };
      setAdConfig(updatedConfig);
      await saveAdConfig(updatedConfig);
      showToast && showToast(
        currentAds[index].isActive
          ? `"${currentAds[index].name || 'Banner'}" is now ACTIVE`
          : `"${currentAds[index].name || 'Banner'}" is now PAUSED`
      );
    }
  };

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
            {heroSlides.map((slide, idx) => {
              const isFitAd = idx < 3 || !slide.hasTextOverlay;
              return (
                <div key={slide.id || idx} className={`ad-banner-card ${isFitAd ? 'ad-card-fit' : ''}`}>
                  <div
                    className={`ad-banner-preview-box ${isFitAd ? 'ad-preview-fit' : ''}`}
                    style={{ backgroundColor: slide.bg || '#072044' }}
                  >
                    {isFitAd && (
                      <div
                        className="ad-banner-ambient-bg"
                        style={{ backgroundImage: `url(${slide.img})` }}
                        aria-hidden="true"
                      />
                    )}
                    <img
                      src={slide.img}
                      alt={slide.title || 'Slide'}
                      className={`ad-banner-img ${isFitAd ? 'ad-banner-img-fit' : ''}`}
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
            );
          })}
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

          {/* Toolbar for Multiple Pop-up Ad Banners */}
          <div className="ad-section-toolbar">
            <div>
              <h3 className="ad-section-heading">
                Pop-up Promotional Ad Banners ({adConfig.ads?.length || 0})
              </h3>
              <p className="ad-section-subheading">
                Manage multiple promotional banners shown in the pop-up modal when customers open the store.
              </p>
            </div>
            <button
              type="button"
              className="atomy-btn-primary"
              onClick={handleOpenAddFloatingBanner}
            >
              <Plus size={16} />
              <span>Add New Pop-up Ad Banner</span>
            </button>
          </div>

          {/* Cards Grid: All Pop-up Banners */}
          <div className="ad-cards-grid">
            {(adConfig.ads || []).map((banner, idx) => (
              <div key={banner.id || idx} className="ad-banner-card">
                <div
                  className="ad-banner-preview-box"
                  style={{ backgroundColor: '#f8fafc', height: '180px' }}
                >
                  <img
                    src={banner.image || '/images/promotions/new_arrival_adelica.png'}
                    alt={banner.name || 'Ad Banner'}
                    className="ad-banner-slide-img"
                    style={{ objectFit: 'contain' }}
                  />
                  {banner.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: banner.badgeColor || '#00a3e0',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {banner.badge}
                    </span>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '12px'
                    }}
                  >
                    #{idx + 1}
                  </span>
                </div>

                <div className="ad-card-details">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                      {banner.brand || 'ATOMY'}
                    </span>
                    <button
                      type="button"
                      className={`badge-status-pill ${banner.isActive !== false ? 'active' : 'paused'}`}
                      onClick={() => handleToggleFloatingBannerActive(idx)}
                      title="Click to toggle banner active / paused status"
                    >
                      {banner.isActive !== false ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </div>

                  <h4 className="ad-card-title" title={banner.name || banner.title}>
                    {banner.name || banner.title || 'Untitled Promotional Banner'}
                  </h4>
                  <p className="ad-card-subtitle" title={banner.tagline || banner.subtitle}>
                    {banner.tagline || banner.subtitle || 'No description entered'}
                  </p>

                  <div className="ad-card-footer">
                    <span className="ad-card-meta">
                      {Number(banner.price) > 0 ? `₹${banner.price} (${banner.pv || 0} PV)` : (banner.actionText || 'Informational')}
                    </span>
                    <div className="ad-card-actions">
                      <button
                        type="button"
                        className="ad-btn-icon edit"
                        onClick={() => handleOpenEditFloatingBanner(banner, idx)}
                        title="Edit Pop-up Banner"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="ad-btn-icon delete"
                        onClick={() => handleDeleteFloatingBanner(idx)}
                        title="Delete Pop-up Banner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Live Preview Section matching User Reference Image 2 */}
          <div className="settings-section-card" style={{ marginTop: '24px' }}>
            <div className="settings-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#00a3e0" />
                <h3 style={{ margin: 0 }}>Live Customer Preview: Multi-Banner Pop-up Modal</h3>
              </div>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                Exact visual replica of the customer pop-up modal with side-by-side banners, navigation arrows, and dot indicators (Image 2):
              </p>
            </div>

            <div style={{ padding: '24px', background: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* Image 2 Replica Container */}
              <div className="admin-multi-popup-card">
                {/* 3 Banners Carousel Track */}
                <div className="admin-multi-popup-stage">
                  {/* Left Arrow Button (loops continuously) */}
                  <button
                    type="button"
                    className="admin-multi-arrow-btn prev"
                    onClick={() => {
                      const total = adConfig.ads?.length || 1;
                      setPreviewCarouselIndex((prev) => (prev - 1 + total) % total);
                    }}
                    title="Previous Banners"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>

                  {/* 3 Columns Display in Continuous Circular Loop */}
                  <div className="admin-multi-popup-track">
                    {Array.from({ length: Math.min(3, adConfig.ads?.length || 1) }).map((_, slotIdx) => {
                      const total = adConfig.ads?.length || 1;
                      const adIdx = (previewCarouselIndex + slotIdx) % total;
                      const ad = adConfig.ads?.[adIdx] || adConfig;
                      return (
                        <div key={`${ad.id || adIdx}-${previewCarouselIndex}-${slotIdx}`} className="admin-multi-popup-col">
                          <img
                            src={ad.image || '/images/promotions/new_arrival_adelica.png'}
                            alt={ad.name || 'Ad'}
                            className="admin-multi-popup-img"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Arrow Button (loops continuously) */}
                  <button
                    type="button"
                    className="admin-multi-arrow-btn next"
                    onClick={() => {
                      const total = adConfig.ads?.length || 1;
                      setPreviewCarouselIndex((prev) => (prev + 1) % total);
                    }}
                    title="Next Banners"
                  >
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Dot Indicators ● ○ ○ ○ (clickable, loops all slides) */}
                <div className="admin-multi-dots">
                  {(adConfig.ads || []).map((_, dotIdx) => (
                    <div
                      key={dotIdx}
                      className={`admin-multi-dot ${dotIdx === (previewCarouselIndex % (adConfig.ads?.length || 1)) ? 'active' : ''}`}
                      onClick={() => setPreviewCarouselIndex(dotIdx)}
                      style={{ cursor: 'pointer' }}
                      title={`Go to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>

                {/* Bottom Bar: Do not show again today & Close icon */}
                <div className="admin-multi-bottom-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" readOnly checked={false} style={{ width: '15px', height: '15px' }} />
                    <span>Do not show again today</span>
                  </div>
                  <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} />
                </div>
              </div>

              {/* Floating Badge Preview on Bottom-Left */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                  Bottom-Left Floating Badge Trigger:
                </span>
                <div className="floating-badge-preview-card">
                  <div className="badge-thumb-box">
                    <img
                      src={adConfig.ads?.[0]?.image || adConfig.image || '/images/promotions/new_arrival_adelica.png'}
                      alt=""
                      className="badge-thumb-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="badge-info-box">
                    <div className="badge-tag-row">
                      <span className="badge-blue-pill">
                        {adConfig.ads?.length > 1 ? `${adConfig.ads.length} ADS` : (adConfig.badge || 'PROMO')}
                      </span>
                      <span className="badge-brand-text">{adConfig.ads?.[0]?.brand || adConfig.brand}</span>
                    </div>
                    <div className="badge-name-text">
                      {adConfig.ads?.[0]?.name || adConfig.name || 'Atomy Promotions'}
                    </div>
                    <div className="badge-price-row">
                      <strong>Tap to open {adConfig.ads?.length || 0} active banners</strong>
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
      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT POP-UP AD BANNER */}
      {/* ============================================================== */}
      {isFloatingBannerModalOpen && (
        <div className="ad-modal-backdrop" onClick={() => setIsFloatingBannerModalOpen(false)}>
          <div className="ad-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3>{editingFloatingIndex !== null ? 'Edit Pop-up Ad Banner' : 'Add New Pop-up Ad Banner'}</h3>
              <button
                type="button"
                className="ad-modal-close"
                onClick={() => setIsFloatingBannerModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFloatingBanner} className="ad-modal-body">
              {/* Photo Upload Section */}
              <div className="atomy-form-group photo-upload-group">
                <label>Pop-up Banner Photo / Poster *</label>
                <div className="modal-photo-dropzone">
                  <input
                    type="file"
                    ref={floatingBannerFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handlePhotoUpload(e, (dataUrl) => setFloatingBannerFormData({ ...floatingBannerFormData, image: dataUrl }))}
                  />

                  {floatingBannerFormData.image ? (
                    <div className="modal-photo-preview-wrap">
                      <img src={floatingBannerFormData.image} alt="Banner Preview" className="modal-photo-preview" />
                      <button
                        type="button"
                        className="change-photo-btn"
                        onClick={() => floatingBannerFileInputRef.current?.click()}
                      >
                        <Upload size={14} />
                        <span>Change Photo</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="modal-photo-drop-prompt"
                      onClick={() => floatingBannerFileInputRef.current?.click()}
                    >
                      <Upload size={28} className="drop-icon" />
                      <strong>Click to upload promotional poster photo</strong>
                      <span>Supports PNG, JPG, JPEG, WEBP (Max 10MB)</span>
                    </div>
                  )}
                </div>

                <div className="photo-url-input-wrap" style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Or enter Image URL:</span>
                  <input
                    type="text"
                    value={floatingBannerFormData.image}
                    onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, image: e.target.value })}
                    className="atomy-form-input"
                    placeholder="/images/promotions/promo_kolkata_notice.jpg"
                  />
                </div>
              </div>

              {/* Title & Brand */}
              <div className="atomy-form-group">
                <label>Banner Title / Headline *</label>
                <input
                  type="text"
                  required
                  value={floatingBannerFormData.name}
                  onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, name: e.target.value, title: e.target.value })}
                  className="atomy-form-input"
                  placeholder="e.g. Delivery Delayed in Kolkata – Festive Season"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="atomy-form-group">
                  <label>Badge Tag</label>
                  <input
                    type="text"
                    value={floatingBannerFormData.badge}
                    onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, badge: e.target.value })}
                    className="atomy-form-input"
                    placeholder="e.g. NOTICE, SPECIAL OFFER, REWARDS"
                  />
                </div>
                <div className="atomy-form-group">
                  <label>Badge Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={floatingBannerFormData.badgeColor || '#00a3e0'}
                      onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, badgeColor: e.target.value })}
                      style={{ width: '40px', height: '38px', padding: '2px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={floatingBannerFormData.badgeColor || '#00a3e0'}
                      onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, badgeColor: e.target.value })}
                      className="atomy-form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="atomy-form-group">
                <label>Advisory / Collection Headline</label>
                <input
                  type="text"
                  value={floatingBannerFormData.collection}
                  onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, collection: e.target.value })}
                  className="atomy-form-input"
                  placeholder="e.g. FESTIVE SEASON ADVISORY or WELCOME EXCLUSIVE OFFER"
                />
              </div>

              <div className="atomy-form-group">
                <label>Tagline / Description</label>
                <textarea
                  rows={2}
                  value={floatingBannerFormData.tagline}
                  onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, tagline: e.target.value, subtitle: e.target.value })}
                  className="atomy-form-input"
                  placeholder="Brief details about this notice or promotion..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="atomy-form-group">
                  <label>Action Button Text</label>
                  <input
                    type="text"
                    value={floatingBannerFormData.actionText}
                    onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, actionText: e.target.value })}
                    className="atomy-form-input"
                    placeholder="e.g. View Notice, Claim Coupon, Order Now"
                  />
                </div>
                <div className="atomy-form-group">
                  <label>Link / Route (Optional)</label>
                  <input
                    type="text"
                    value={floatingBannerFormData.link}
                    onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, link: e.target.value })}
                    className="atomy-form-input"
                    placeholder="e.g. /coupons, /notice, /membership"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="atomy-form-group">
                  <label>Price in ₹ (0 if notice/coupon)</label>
                  <input
                    type="number"
                    value={floatingBannerFormData.price}
                    onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, price: parseFloat(e.target.value) || 0 })}
                    className="atomy-form-input"
                  />
                </div>
                <div className="atomy-form-group">
                  <label>PV Points (0 if not applicable)</label>
                  <input
                    type="number"
                    value={floatingBannerFormData.pv}
                    onChange={(e) => setFloatingBannerFormData({ ...floatingBannerFormData, pv: parseInt(e.target.value) || 0 })}
                    className="atomy-form-input"
                  />
                </div>
              </div>

              <div className="ad-modal-footer">
                <button
                  type="button"
                  className="atomy-btn-secondary"
                  onClick={() => setIsFloatingBannerModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="atomy-btn-primary"
                >
                  <Check size={16} />
                  <span>{editingFloatingIndex !== null ? 'Save Changes' : 'Add Pop-up Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
