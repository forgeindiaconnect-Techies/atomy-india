import React, { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingCart, ChevronDown, ChevronUp, ChevronRight, Menu, Globe, X, Bell, Sparkles, Clock, Heart, Ticket, Compass, Settings, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getSavedLanguage, changeLanguage } from '../../services/languageService';
import { MenuToggleIcon } from '../FloatingToolbar/FloatingToolbar';
import atomyLogo from '../../assets/atomy-logo.png';
import ficLogo from '../../assets/fic-symbol.png';
import IndiaMap from './IndiaMap';
import PhoenixFlight from './PhoenixFlight';
import NavbarColorPicker, { isHexColorDark, hexToRgba, rgbaToHex } from './NavbarColorPicker';
import { ALL_CATALOG_PRODUCTS } from '../../data/mockData';
import './Header.css';


const ATOMY_FAMILY_SITES = [
  {
    id: 'atomy-corp',
    title: 'Atomy Corp.',
    url: 'https://global.atomy.com/index.es?sid=a2',
    iconUrl: 'https://image.atomy.com/IN/banner/90/531/251000000020531101619.svg'
  },
  {
    id: 'ch-atomy',
    title: 'CH.ATOMY',
    url: 'https://ch.atomy.com/in',
    iconUrl: 'https://image.atomy.com/IN/banner/90/526/251000000020526101648.svg'
  },
  {
    id: 'atomy-ticket',
    title: 'Atomy Ticket',
    url: 'https://ticket.atomy.com/h/main?jisa=in&ln=en',
    iconUrl: 'https://image.atomy.com/IN/banner/90/527/251000000020527101753.svg'
  },
  {
    id: 'at-g-mall',
    title: 'At.G Mall',
    url: 'https://global.atomy.kr/m/',
    iconUrl: 'https://image.atomy.com/IN/banner/90/529/251000000020529101849.svg'
  },
  {
    id: 'masstige-times',
    title: 'MASSTIGE TIMES',
    url: 'https://mt.atomy.com/?lang=en',
    iconUrl: 'https://image.atomy.com/IN/banner/90/403/250900000020403161939.svg'
  }
];

export default function Header({
  cartCount = 0,
  favoritesCount = 0,
  onCartClick,
  onNavigateCart,
  onNavigateFavorites,
  onNavigateOrders,
  onOpenQuickOrder,
  onNavigateContact,
  onOpenRecentlyViewed,
  onNavigateHome,
  onSelectCategory,
  onNavigateSignIn,
  onSelectProduct,
  onNavigateView,
  onNavigateAdmin,
  currentUser = null,
  onLogout,
  onNavigateProfile,
  currentView = 'home',
  isMember = false,
  onOpenMembershipModal,
  onNavigateMembership
}) {
  const [activePortal, setActivePortal] = useState('mall');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(0);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isAtomySitesOpen, setIsAtomySitesOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => getSavedLanguage());
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [navbarBottom, setNavbarBottom] = useState(0);
  const [navbarBgColor, setNavbarBgColor] = useState(() => {
    try {
      return localStorage.getItem('atomy_navbar_bg') || '#EAB308';
    } catch (e) {
      return '#EAB308';
    }
  });

  const [isNavbarGlass, setIsNavbarGlass] = useState(() => {
    try {
      return localStorage.getItem('atomy_navbar_glass') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [navbarOpacity, setNavbarOpacity] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_navbar_opacity');
      return saved ? parseFloat(saved) : 0.45;
    } catch (e) {
      return 0.45;
    }
  });

  const isNavbarDark = isHexColorDark(navbarBgColor);

  const finalNavbarBg = React.useMemo(() => {
    if (!isNavbarGlass) return navbarBgColor;
    return hexToRgba(navbarBgColor, navbarOpacity);
  }, [navbarBgColor, isNavbarGlass, navbarOpacity]);

  const handleNavbarColorChange = (newColor, isGlassOption) => {
    setNavbarBgColor(newColor);
    try {
      localStorage.setItem('atomy_navbar_bg', newColor);
    } catch (e) {
      // ignore
    }

    if (typeof isGlassOption === 'boolean') {
      setIsNavbarGlass(isGlassOption);
      try {
        localStorage.setItem('atomy_navbar_glass', isGlassOption ? 'true' : 'false');
      } catch (e) {}
    } else if (typeof newColor === 'string' && newColor.startsWith('rgba')) {
      setIsNavbarGlass(true);
      try {
        localStorage.setItem('atomy_navbar_glass', 'true');
      } catch (e) {}
    }
  };

  const handleToggleNavbarGlass = (enableGlass) => {
    setIsNavbarGlass(enableGlass);
    try {
      localStorage.setItem('atomy_navbar_glass', enableGlass ? 'true' : 'false');
    } catch (e) {}
  };

  const handleChangeNavbarOpacity = (newOpacity) => {
    setNavbarOpacity(newOpacity);
    try {
      localStorage.setItem('atomy_navbar_opacity', String(newOpacity));
    } catch (e) {}
  };
  const searchContainerRef = useRef(null);
  const quickMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const atomySitesMenuRef = useRef(null);
  const mainHeaderBarRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const handleToggleMobileSearch = () => {
    if (mainHeaderBarRef.current) {
      const rect = mainHeaderBarRef.current.getBoundingClientRect();
      setNavbarBottom(Math.round(rect.bottom));
    }
    setIsMobileSearchOpen((prev) => !prev);
  };

  // Keep popup aligned right below the navbar even when window resizes or scrolls
  useEffect(() => {
    if (isMobileSearchOpen) {
      const updateNavbarBottom = () => {
        if (mainHeaderBarRef.current) {
          const rect = mainHeaderBarRef.current.getBoundingClientRect();
          setNavbarBottom(Math.round(rect.bottom));
        }
      };
      updateNavbarBottom();
      window.addEventListener('resize', updateNavbarBottom);
      window.addEventListener('scroll', updateNavbarBottom, { passive: true });
      return () => {
        window.removeEventListener('resize', updateNavbarBottom);
        window.removeEventListener('scroll', updateNavbarBottom);
      };
    }
  }, [isMobileSearchOpen]);

  // Auto-focus mobile search input when popup opens
  useEffect(() => {
    if (isMobileSearchOpen) {
      const timer = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen]);

  // Close mobile search popup on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSearchOpen]);

  useEffect(() => {
    const handleLangChange = (e) => {
      if (e.detail?.language) {
        setSelectedLanguage(e.detail.language);
      }
    };
    window.addEventListener('atomy:language-changed', handleLangChange);
    return () => window.removeEventListener('atomy:language-changed', handleLangChange);
  }, []);

  // Clean customer display names and initials
  const userFullName = currentUser?.name || currentUser?.username || currentUser?.email || 'Customer';
  const userEmail = currentUser?.email || '';

  const userGreetingName = React.useMemo(() => {
    if (!currentUser) return '';
    const raw = (currentUser.name || currentUser.username || '').trim();
    if (raw.includes('@')) {
      const emailName = raw.split('@')[0];
      const clean = emailName.split(/[._-]/)[0];
      return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : emailName;
    }
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length > 0) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return raw;
  }, [currentUser]);

  const userInitial = React.useMemo(() => {
    if (!currentUser) return 'U';
    const name = (currentUser.name || currentUser.username || '').trim();
    const clean = name.replace(/^[^a-zA-Z0-9]+/, '');
    return clean ? clean.charAt(0).toUpperCase() : 'U';
  }, [currentUser]);

  const POPULAR_SEARCHES = [
    'HemoHIM',
    'Toothpaste',
    'Foam Cleanser',
    'Absolute Skincare',
    'Scrubber',
    'Fabric Detergent',
    'Omega 3',
    'Cafe Arabica'
  ];

  // Close search dropdown, quick menu, and Atomy sites on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target)) {
        setIsQuickMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setIsMegaMenuOpen(false);
      }
      if (atomySitesMenuRef.current && !atomySitesMenuRef.current.contains(e.target)) {
        setIsAtomySitesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products based on search query
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const catalog = Array.isArray(ALL_CATALOG_PRODUCTS) ? ALL_CATALOG_PRODUCTS : [];
    return catalog.filter((prod) => {
      const name = (prod.name || '').toLowerCase();
      const id = (prod.id || '').toLowerCase();
      const cat = (prod.category || '').toLowerCase();
      const sub = (prod.subTopic || '').toLowerCase();
      return name.includes(q) || id.includes(q) || cat.includes(q) || sub.includes(q);
    }).slice(0, 10);
  }, [searchQuery]);

  const handleSelectSearchedProduct = (product) => {
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handlePopularSearchClick = (keyword) => {
    setSearchQuery(keyword);
    setIsSearchOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectSearchedProduct(searchResults[0]);
    }
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectSearchedProduct(searchResults[0]);
    }
  };

  const categories = [
    {
      id: "hemohim",
      name: "HemoHIM",
      icon: "https://image.atomy.com/IN/banner/90/793/25100000002079317317.svg",
      subcategories: ["HemoHIM", "HemoHIM Global Edition"]
    },
    {
      id: "health",
      name: "HEALTH",
      icon: "https://image.atomy.com/IN/banner/90/788/251000000020788143752.svg",
      subcategories: ["Immunity", "Nutritional Health", "Targeted Care", "Eye Health", "Digestive Health", "Omega-3", "Supplements"]
    },
    {
      id: "food",
      name: "FOOD",
      icon: "https://image.atomy.com/IN/banner/90/794/251000000020794143823.svg",
      subcategories: ["Healthy Snacks", "Tea & Coffee", "Functional Foods"]
    },
    {
      id: "beauty",
      name: "BEAUTY",
      icon: "https://image.atomy.com/IN/banner/90/789/251000000020789143852.svg",
      subcategories: ["Absolute Series", "Skin Care", "Makeup", "The Fame", "Evening Care", "Sun Care"]
    },
    {
      id: "personal_care",
      name: "PERSONAL CARE",
      icon: "https://image.atomy.com/IN/banner/90/790/251000000020790143920.svg",
      subcategories: ["Hair and Body", "Oral Care", "Hand Care", "Body Cleanser", "Scalp Care"]
    },
    {
      id: "home",
      name: "HOME",
      icon: "https://image.atomy.com/IN/banner/90/795/251000000020795143948.svg",
      subcategories: ["Living Care", "Detergent", "Kitchenware"]
    },
    {
      id: "others",
      name: "ETC",
      icon: "https://image.atomy.com/IN/banner/90/801/251000000020801144016.svg",
      subcategories: ["Special Set", "Supplementary Goods", "Publications & Business Materials"]
    },
    {
      id: "all_products",
      name: "ALL PRODUCTS",
      icon: "https://image.atomy.com/IN/banner/90/802/251000000020802144045.svg",
      subcategories: ["View Full Catalog", "Best Sellers", "New Arrivals"]
    }
  ];

  return (
    <>
      <header className={`header-wrapper ${isNavbarGlass ? 'is-glass-mode' : ''}`}>
      {/* Unified Main Brand Header Bar with Dynamic User Chosen Color */}
      <div
        ref={mainHeaderBarRef}
        className={`main-header-bar ${currentView === 'admin' ? 'admin-header-bar' : ''} ${isNavbarDark ? 'theme-dark-navbar' : 'theme-light-navbar'} ${isNavbarGlass ? 'navbar-glass-effect' : ''}`}
        style={{
          backgroundColor: finalNavbarBg,
          borderBottomColor: isNavbarDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Bird flight temporarily stopped while changing navbar background color */}
        {/* <PhoenixFlight /> */}

        <div className="container main-header-container">
          {/* Mobile Common Brand Section (Large size, spans full height of both rows on mobile) */}
          <div className="mobile-only-brand-col">
            <a
              href="/"
              className="brand-col-logo"
              aria-label="Forge India Connect Home"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome && onNavigateHome();
              }}
            >
              <div className="brand-logo-top-row">
                <img
                  src={ficLogo}
                  alt="Forge India Connect"
                  className="brand-logo-img"
                />
              </div>
            </a>

            <div
              className="team-phoenix-col fic-brand-col"
              onClick={() => onNavigateHome && onNavigateHome()}
              style={{ cursor: 'pointer' }}
            >
              <div className="team-phoenix-title fic-brand-title">
                <span className="fic-forge-text">FORGE</span>
                <span className="fic-india-text">
                  <IndiaMap className="fic-india-map-svg" />
                  NDIA
                </span>
              </div>
              <div className="team-phoenix-sub fic-brand-sub">
                <span className="fic-connect-text">CONNECT</span>
              </div>
            </div>
          </div>

          <div className="main-header-content-col">
          {/* Top Utility Links Row - Hidden for Admin */}
          {currentView !== 'admin' && (
            <div className="head-top-row">
              <div className="top-utility-links">
                {isMember ? (
                  <button
                    type="button"
                    className="top-membership-pill member-active"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onNavigateMembership) onNavigateMembership();
                    }}
                    title="Atomy Distributor Membership Active - Wholesale DP Pricing Unlocked"
                  >
                    <span className="member-pill-sparkle">★</span>
                    <span className="member-pill-label-desktop">Membership Active</span>
                    <span className="member-pill-label-mobile">Active</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="top-utility-link-btn top-membership-join-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenMembershipModal) onOpenMembershipModal();
                      else if (onNavigateMembership) onNavigateMembership();
                    }}
                  >
                    <span className="join-label-desktop">Join Member</span>
                    <span className="join-label-mobile">Join</span>
                  </button>
                )}
                <span className="top-utility-divider"></span>

                {currentUser ? (
                  <button
                    type="button"
                    className="top-logout-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      onLogout && onLogout();
                    }}
                  >
                    Sign Out
                  </button>
                ) : (
                  <a
                    href="/signin"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateSignIn ? onNavigateSignIn('signin') : (window.location.href = '/signin');
                    }}
                  >
                    Sign in
                  </a>
                )}
                <span className="top-utility-divider top-utility-desktop-only"></span>
                <a
                  href="/about-us"
                  className="top-utility-desktop-only"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateView) onNavigateView('about-us');
                    else window.location.href = '/about-us';
                  }}
                >
                  About Us
                </a>
                <span className="top-utility-divider top-utility-desktop-only"></span>
                <div className="region-selector-wrapper top-utility-desktop-only">
                  <button
                    type="button"
                    className="region-selector-btn"
                    onClick={() => setIsLangModalOpen(true)}
                    aria-label="Select Language and Region"
                    title="Language/Region settings"
                  >
                    <span className="region-title">{SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.region || 'India'}</span>
                    <Globe size={14} strokeWidth={1.8} />
                    <ChevronDown size={11} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Row: Left Content (Forge India Logo & Name, Shopping Mall & My Office) + Expanded Search Bar + Right Action Icons */}
          <div className="head-main-row">
            {/* Left Content (Forge Brand + Portal Tabs) + Search Bar */}
            <div className="main-row-left-group">
              <div className="brand-section desktop-only-brand-section">
                <a
                  href="/"
                  className="brand-col-logo"
                  aria-label="Forge India Connect Home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateHome && onNavigateHome();
                  }}
                >
                  <div className="brand-logo-top-row">
                    <img
                      src={ficLogo}
                      alt="Forge India Connect"
                      className="brand-logo-img"
                    />
                  </div>
                </a>

                <div
                  className="team-phoenix-col fic-brand-col"
                  onClick={() => onNavigateHome && onNavigateHome()}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="team-phoenix-title fic-brand-title">
                    <span className="fic-forge-text">FORGE</span>
                    <span className="fic-india-text">
                      <IndiaMap className="fic-india-map-svg" />
                      NDIA
                    </span>
                  </div>
                  <div className="team-phoenix-sub fic-brand-sub">
                    <span className="fic-connect-text">CONNECT</span>
                  </div>
                </div>

                {/* Shopping Mall / My Office Portal Tabs - Hidden for Admin */}
                {currentView !== 'admin' && (
                  <>
                    <div className="brand-col-divider"></div>
                    <div className="portal-col">
                      <span
                        className={`portal-tab ${activePortal === 'mall' ? 'active' : ''}`}
                        onClick={() => setActivePortal('mall')}
                      >
                        Shopping Mall
                      </span>
                      <span className="portal-divider"></span>
                      <span
                        className={`portal-tab ${activePortal === 'office' ? 'active' : ''}`}
                        onClick={() => {
                          window.open('https://in.atomy.com/main', '_blank');
                        }}
                        title="Official Atomy Distributor Portal (in.atomy.com/main)"
                      >
                        My Office ↗
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Search Box placed parallel right next to My Office - Hidden for Admin */}
              {currentView !== 'admin' && (
                <>
                  <div className="search-container desktop-search-container" ref={searchContainerRef}>
                  <form onSubmit={handleSearchSubmit} className="search-box">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Which product has monopoly in world?"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="search-clear-btn"
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchOpen(false);
                        }}
                        aria-label="Clear search"
                      >
                        <X size={15} />
                      </button>
                    )}
                    <button type="submit" className="search-btn" aria-label="Search">
                      <Search size={19} strokeWidth={2.2} />
                    </button>
                  </form>

                  {/* Interactive Search Results Dropdown */}
                  {isSearchOpen && (
                    <div className="search-dropdown-menu">
                      {searchQuery.trim().length === 0 ? (
                        <div className="search-suggestions">
                          <div className="search-section-header">
                            <Sparkles size={14} className="sparkle-icon" />
                            <span>Popular Searches</span>
                          </div>
                          <div className="popular-tags-list">
                            {POPULAR_SEARCHES.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className="popular-tag-btn"
                                onClick={() => handlePopularSearchClick(tag)}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="search-results-list">
                          <div className="search-section-header">
                            <span>
                              Results for "<b>{searchQuery}</b>" ({searchResults.length})
                            </span>
                          </div>
                          {searchResults.length === 0 ? (
                            <div className="search-no-results">
                              <p>No products found for "{searchQuery}".</p>
                              <span>Try searching for Toothpaste, HemoHIM, or Cleanser</span>
                            </div>
                          ) : (
                            searchResults.map((prod) => (
                              <div
                                key={prod.id}
                                className="search-result-item"
                                onClick={() => handleSelectSearchedProduct(prod)}
                              >
                                <div className="search-result-img">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg';
                                    }}
                                  />
                                </div>
                                <div className="search-result-info">
                                  <div className="search-result-meta">
                                    <span className="search-result-code">{prod.id}</span>
                                    {prod.category && (
                                      <span className="search-result-cat">{prod.category.toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="search-result-title">{prod.name}</div>
                                  <div className="search-result-price-row">
                                    <span className="search-result-price">
                                      ₹ {(prod.price || 0).toLocaleString('en-IN', {
                                        minimumFractionDigits: 2
                                      })}
                                    </span>
                                    {prod.pv && (
                                      <span className="search-result-pv">
                                        PV {prod.pv.toLocaleString('en-IN')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Compact Search Pill (Same line as logo & profile) */}
                <div
                  className={`mobile-search-trigger-pill ${isMobileSearchOpen ? 'is-active' : ''}`}
                  onClick={handleToggleMobileSearch}
                  role="button"
                  tabIndex={0}
                  aria-label="Toggle search popup"
                >
                  <span className="mobile-search-pill-placeholder">
                    {searchQuery || "Which product has monopoly in world?"}
                  </span>
                  <Search size={14} strokeWidth={2.4} className="mobile-search-pill-icon" />
                </div>
              </>
            )}
          </div>

            {/* Right Action Icons: Notification, Profile, Cart */}
            <div className="header-actions">
              {/* Authenticated Customer Greeting seamlessly merged with background */}
              {currentUser && (
                <div 
                  className="customer-header-greeting" 
                  onClick={() => onNavigateProfile && onNavigateProfile()}
                  tabIndex={0}
                  role="button"
                  title={userFullName}
                  aria-label={`Customer profile: ${userFullName}`}
                >
                  <span className="customer-greeting-text">
                    Hello, <strong className="customer-greeting-name">{userGreetingName}</strong>
                  </span>

                  {/* Clean single-line hover tooltip showing ONLY the full name */}
                  <div className="customer-name-hover-tooltip" role="tooltip">
                    {userFullName}
                  </div>
                </div>
              )}

              <div className="profile-action-container">
                {currentUser ? (
                  <button 
                    className="action-btn logged-in-profile-btn" 
                    aria-label="Customer Profile & Settings" 
                    title={`${userFullName} - Profile & Settings`}
                    onClick={() => onNavigateProfile && onNavigateProfile()}
                  >
                    <div className="profile-avatar-circle">
                      {userInitial}
                    </div>
                    <span className="profile-online-badge"></span>
                  </button>
                ) : (
                  <button 
                    className="action-btn" 
                    aria-label={currentView === 'admin' ? "Admin Profile" : "Sign in / My Account"} 
                    title={currentView === 'admin' ? "Admin Profile" : "Sign in / My Account"}
                    onClick={() => {
                      if (currentView !== 'admin') {
                        onNavigateSignIn ? onNavigateSignIn('signin') : (window.location.href = '/signin');
                      }
                    }}
                  >
                    <User size={25} strokeWidth={1.8} />
                  </button>
                )}
                {currentView === 'admin' && (
                  <span className="profile-role-title">Admin</span>
                )}
              </div>

              {/* Cart Button - Navigates to Cart Page / Opens Drawer - Hidden for Admin */}
              {currentView !== 'admin' && (
                <button 
                  className="action-btn cart-btn-wrapper" 
                  aria-label="Cart" 
                  title="Shopping Cart"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateCart) {
                      onNavigateCart();
                    } else if (onCartClick) {
                      onCartClick();
                    }
                  }}
                >
                  <ShoppingCart size={25} strokeWidth={1.8} />
                  <span className="cart-badge">{cartCount}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

      {/* Sub-Navigation Bar - Hidden for Admin */}
      {currentView !== 'admin' && (
        <nav className="sub-nav-bar">
          <div className="container sub-nav-container">
            {/* All Category Dropdown Trigger & Popup Menu */}
            <div className="category-menu-wrapper" ref={categoryMenuRef}>
              <button
                className={`all-menu-toggle ${isMegaMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                aria-label="Toggle All Categories"
                aria-expanded={isMegaMenuOpen}
              >
                {isMegaMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              {/* Original Site Style Category Popup List with Subsidebar */}
              {isMegaMenuOpen && (
                <>
                  <div
                    className="category-popup-backdrop"
                    onClick={() => setIsMegaMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="category-popup-dropdown" role="menu">
                    {/* Mobile Drawer Account Strip */}
                    <div className="category-popup-mobile-account-bar">
                      {currentUser ? (
                        <div className="mobile-drawer-user-info">
                          <div className="mobile-drawer-avatar">{userInitial}</div>
                          <div className="mobile-drawer-meta">
                            <span className="mobile-drawer-username">{userFullName}</span>
                            <span className="mobile-drawer-status">{isMember ? '★ Member Active' : 'Consumer'}</span>
                          </div>
                          <button
                            type="button"
                            className="mobile-drawer-logout-btn"
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              onLogout && onLogout();
                            }}
                          >
                            Sign Out
                          </button>
                          <button
                            type="button"
                            className="mobile-drawer-close-icon-btn"
                            onClick={() => setIsMegaMenuOpen(false)}
                            aria-label="Close Menu"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <div className="mobile-drawer-guest-actions">
                          <button
                            type="button"
                            className="mobile-drawer-auth-btn signin-btn"
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              onNavigateSignIn ? onNavigateSignIn('signin') : (window.location.href = '/signin');
                            }}
                          >
                            Sign In
                          </button>
                          <button
                            type="button"
                            className="mobile-drawer-auth-btn join-btn"
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              if (onOpenMembershipModal) onOpenMembershipModal();
                              else if (onNavigateMembership) onNavigateMembership();
                            }}
                          >
                            Join Member
                          </button>
                          <button
                            type="button"
                            className="mobile-drawer-close-icon-btn"
                            onClick={() => setIsMegaMenuOpen(false)}
                            aria-label="Close Menu"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Main Drawer Split Body */}
                    <div className="category-popup-split-body">
                      {/* Left Sidebar: Primary Categories */}
                      <div className="category-popup-sidebar">
                        {categories.map((cat, idx) => {
                          const isHovered = hoveredCategoryIndex === idx;
                          return (
                            <div
                              key={cat.id}
                              className={`category-popup-item ${isHovered ? 'active' : ''}`}
                              onMouseEnter={() => setHoveredCategoryIndex(idx)}
                              onClick={() => {
                                setHoveredCategoryIndex(idx);
                              }}
                              role="menuitem"
                            >
                              <div className="category-item-icon-box">
                                <img
                                  src={cat.icon}
                                  alt=""
                                  className="category-popup-icon"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              </div>
                              <span className="category-item-label">{cat.name}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Subsidebar: Subcategories Panel */}
                      <div className="category-popup-subsidebar">
                        <div className="category-subsidebar-header">
                          <span className="category-subsidebar-title">
                            {categories[hoveredCategoryIndex]?.name}
                          </span>
                        </div>

                        <div className="category-subsidebar-list">
                          {categories[hoveredCategoryIndex]?.subcategories.map((sub, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              className="category-subsidebar-item"
                              onClick={() => {
                                setIsMegaMenuOpen(false);
                                onSelectCategory && onSelectCategory(categories[hoveredCategoryIndex]?.id);
                              }}
                            >
                              <span>{sub}</span>
                              <ChevronRight size={14} className="sub-chevron" />
                            </button>
                          ))}
                        </div>

                        {/* View all products in active category */}
                        <div className="category-subsidebar-footer">
                          <button
                            type="button"
                            className="category-view-all-btn"
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              onSelectCategory && onSelectCategory(categories[hoveredCategoryIndex]?.id);
                            }}
                          >
                            <span>View All {categories[hoveredCategoryIndex]?.name}</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Drawer Bottom Quick Links */}
                    <div className="category-popup-mobile-quick-links">
                      <button
                        type="button"
                        className="mobile-drawer-quick-link"
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          if (onOpenQuickOrder) onOpenQuickOrder();
                          else if (onNavigateQuickOrder) onNavigateQuickOrder();
                        }}
                      >
                        <Compass size={17} />
                        <span>Quick Order</span>
                      </button>
                      <button
                        type="button"
                        className="mobile-drawer-quick-link"
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          if (onNavigateOrders) onNavigateOrders();
                        }}
                      >
                        <Clock size={17} />
                        <span>Track Order</span>
                      </button>
                      <button
                        type="button"
                        className="mobile-drawer-quick-link"
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          if (onNavigateFavorites) onNavigateFavorites();
                        }}
                      >
                        <Heart size={17} />
                        <span>Wishlist</span>
                      </button>
                      <button
                        type="button"
                        className="mobile-drawer-quick-link"
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          if (onNavigateContact) onNavigateContact();
                        }}
                      >
                        <Globe size={17} />
                        <span>Centres</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <ul className="nav-links-list">
              <li className={`nav-item ${currentView === 'home' ? 'active' : ''}`}>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateView) onNavigateView('home');
                    else if (onNavigateHome) onNavigateHome();
                  }}
                >
                  HOME
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="https://global.atomy.com/menu.es?mid=a20101000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('https://global.atomy.com/menu.es?mid=a20101000000', '_blank', 'noopener,noreferrer');
                  }}
                >
                  About Atomy
                </a>
              </li>
              <li className={`nav-item ${currentView === 'notice' ? 'active' : ''}`}>
                <a
                  href="#notice"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateView && onNavigateView('notice');
                  }}
                >
                  Notice
                </a>
              </li>
              <li className={`nav-item ${currentView === 'compensation' ? 'active' : ''}`}>
                <a
                  href="#compensation"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateView && onNavigateView('compensation');
                  }}
                >
                  Compensation Plan
                </a>
              </li>
              <li className={`nav-item ${currentView === 'guide' ? 'active' : ''}`}>
                <a
                  href="#guide"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateView && onNavigateView('guide');
                  }}
                >
                  Guide
                </a>
              </li>
              <li className={`nav-item ${currentView === 'seminars' ? 'active' : ''}`}>
                <a
                  href="#seminars"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateView && onNavigateView('seminars');
                  }}
                >
                  Seminars
                </a>
              </li>
              <li className={`nav-item ${currentView === 'hub' ? 'active' : ''}`}>
                <a
                  href="#hub"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateView && onNavigateView('hub');
                  }}
                >
                  AtomyHUB
                </a>
              </li>
            </ul>

            {/* Quick Menu Toggle at the corner of Home / About Atomy Bar */}
            <div className="sub-nav-quick-corner" ref={quickMenuRef}>
              <button
                type="button"
                className={`quick-menu-corner-pill ${isQuickMenuOpen ? 'active' : ''}`}
                onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                aria-expanded={isQuickMenuOpen}
                aria-label="Quick Menu"
                title="Quick Access Services"
              >
                <span className="quick-menu-pulse-badge" aria-hidden="true">
                  <span className="pulse-ping"></span>
                  <span className="pulse-dot"></span>
                </span>
                <span className="quick-menu-pill-text">Quick Menu</span>
                <MenuToggleIcon isOpen={isQuickMenuOpen} size={18} />
              </button>

              {/* Quick Menu Dropdown */}
              {isQuickMenuOpen && (
                <div className="quick-menu-corner-dropdown animate-fade">
                  <button
                    type="button"
                    className="quick-menu-corner-item"
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      if (onNavigateOrders) onNavigateOrders();
                      else window.dispatchEvent(new CustomEvent('atomy:open-orders'));
                    }}
                  >
                    <img
                      src="/images/floating/order_delivery.svg"
                      alt="Order / Delivery"
                      className="quick-menu-corner-icon"
                    />
                    <span>Order / Delivery</span>
                  </button>

                  <button
                    type="button"
                    className="quick-menu-corner-item"
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      if (onOpenQuickOrder) onOpenQuickOrder();
                      else window.dispatchEvent(new CustomEvent('atomy:open-quick-order'));
                    }}
                  >
                    <img
                      src="/images/floating/quick_order.svg"
                      alt="Quick Order"
                      className="quick-menu-corner-icon"
                    />
                    <span>Quick Order</span>
                  </button>

                  {/* Favorites Page Link */}
                  <button
                    type="button"
                    className="quick-menu-corner-item"
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onNavigateFavorites && onNavigateFavorites();
                    }}
                  >
                    <Heart
                      size={20}
                      className="quick-menu-corner-lucide"
                      style={{ color: '#ef4444', fill: favoritesCount > 0 ? '#ef4444' : 'none' }}
                    />
                    <span>Favorites {favoritesCount > 0 ? `(${favoritesCount})` : ''}</span>
                  </button>

                  <button
                    type="button"
                    className="quick-menu-corner-item"
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      if (onNavigateContact) onNavigateContact();
                      else window.dispatchEvent(new CustomEvent('atomy:open-contact'));
                    }}
                  >
                    <img
                      src="/images/floating/find_centre.svg"
                      alt="Find Centre"
                      className="quick-menu-corner-icon"
                    />
                    <span>Contact Us / Find Centre</span>
                  </button>

                  <button
                    type="button"
                    className="quick-menu-corner-item"
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      if (onOpenRecentlyViewed) onOpenRecentlyViewed();
                      else window.dispatchEvent(new CustomEvent('atomy:open-recent'));
                    }}
                  >
                    <Clock size={20} className="quick-menu-corner-lucide" />
                    <span>Recently Viewed Products</span>
                  </button>

                  {/* Settings Item */}
                  <button
                    type="button"
                    className="quick-menu-corner-item"
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      if (onNavigateProfile) {
                        onNavigateProfile();
                      } else {
                        window.location.href = '/profile';
                      }
                    }}
                  >
                    <Settings size={20} className="quick-menu-corner-lucide" />
                    <span>Settings</span>
                  </button>

                  {/* Mobile Only: About Us */}
                  <button
                    type="button"
                    className="quick-menu-corner-item mobile-only-quick-item"
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      if (onNavigateView) onNavigateView('about-us');
                      else window.location.href = '/about-us';
                    }}
                  >
                    <Compass size={20} className="quick-menu-corner-lucide" />
                    <span>About Us</span>
                  </button>

                  {/* Mobile Only: Region / Language */}
                  <div
                    className="quick-menu-corner-item mobile-only-quick-item"
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      setIsLangModalOpen(true);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <Globe size={20} className="quick-menu-corner-lucide" />
                    <span>Language/Region settings</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

    {/* Official Atomy India Language/Region settings Modal (Exact match to user reference screenshot) */}
    {/* Official Atomy India Language/Region settings Modal (Exact match to user reference screenshot) */}
    {isLangModalOpen && (
      <div className="lang-region-modal-overlay notranslate" translate="no" onClick={() => setIsLangModalOpen(false)}>
        <div
          className="lang-region-modal-card notranslate"
          translate="no"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-modal-title"
        >
          <div className="lang-region-modal-header notranslate" translate="no">
            <h2 id="lang-modal-title" className="lang-region-modal-title notranslate" translate="no">
              Language/Region settings
            </h2>
            <button
              type="button"
              className="lang-region-close-btn"
              onClick={() => setIsLangModalOpen(false)}
              aria-label="Close"
            >
              <X size={26} strokeWidth={1.5} />
            </button>
          </div>

          <div className="lang-region-modal-body notranslate" translate="no">
            <h3 className="lang-region-section-heading notranslate" translate="no">Language settings</h3>

            <div className="lang-radio-group notranslate" translate="no">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isChecked = selectedLanguage === lang.code;
                return (
                  <label
                    key={lang.code}
                    className={`lang-radio-label notranslate ${isChecked ? 'active' : ''}`}
                    translate="no"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedLanguage(lang.code);
                      changeLanguage(lang.code);
                    }}
                  >
                    <input
                      type="radio"
                      name="atomy_language_radio"
                      value={lang.code}
                      checked={isChecked}
                      readOnly
                      className="lang-native-radio"
                    />
                    <span className="lang-custom-radio">
                      {isChecked && <span className="lang-radio-dot" />}
                    </span>
                    <span className="lang-radio-text notranslate" translate="no">{lang.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Mobile Search Popup Modal - Opens below the navbar on mobile */}
    {isMobileSearchOpen && (
      <div 
        className="mobile-search-popup-overlay"
        style={{
          top: navbarBottom ? `${navbarBottom}px` : undefined,
          height: navbarBottom ? `calc(100dvh - ${navbarBottom}px)` : undefined
        }}
        onClick={() => setIsMobileSearchOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Search"
      >
        <div 
          className="mobile-search-popup-card" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-search-popup-header">
            <form onSubmit={handleMobileSearchSubmit} className="mobile-search-popup-form">
              <Search size={18} strokeWidth={2.2} className="mobile-search-popup-input-icon" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                className="mobile-search-popup-input"
                placeholder="Search products, HemoHIM, toothpaste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="mobile-search-popup-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear input"
                >
                  <X size={16} />
                </button>
              )}
            </form>
            <button
              type="button"
              className="mobile-search-popup-cancel-btn"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              Cancel
            </button>
          </div>

          <div className="mobile-search-popup-content">
            {searchQuery.trim().length === 0 ? (
              <div className="mobile-search-popular-section">
                <div className="mobile-search-section-label">
                  <Sparkles size={14} className="sparkle-icon" />
                  <span>Popular Searches</span>
                </div>
                <div className="mobile-search-tags-grid">
                  {POPULAR_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="mobile-search-tag-chip"
                      onClick={() => {
                        setSearchQuery(tag);
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mobile-search-results-section">
                <div className="mobile-search-section-label">
                  <span>Results for "{searchQuery}" ({searchResults.length})</span>
                </div>
                {searchResults.length === 0 ? (
                  <div className="mobile-search-empty-state">
                    <p>No products found for "{searchQuery}".</p>
                    <span>Try searching for HemoHIM, Toothpaste, or Cleanser</span>
                  </div>
                ) : (
                  <div className="mobile-search-results-list">
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        className="mobile-search-result-card"
                        onClick={() => handleSelectSearchedProduct(prod)}
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="mobile-search-result-thumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg';
                          }}
                        />
                        <div className="mobile-search-result-details">
                          <span className="mobile-search-result-code">{prod.id}</span>
                          <h4 className="mobile-search-result-title">{prod.name}</h4>
                          <div className="mobile-search-result-price-row">
                            <span className="mobile-search-result-price">
                              ₹ {(prod.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            {prod.pv && (
                              <span className="mobile-search-result-pv">
                                PV {prod.pv.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
