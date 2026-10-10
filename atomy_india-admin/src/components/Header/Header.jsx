import React, { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingCart, ChevronDown, ChevronUp, Menu, Globe, X, Bell, Sparkles, Clock, Heart } from 'lucide-react';
import { MenuToggleIcon } from '../FloatingToolbar/FloatingToolbar';
import { ALL_CATALOG_PRODUCTS } from '../../data/mockData';
import PhoenixFlight from './PhoenixFlight';
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
  adminProfile = null,
  onNavigateAdminProfile = null,
  notificationCount = 0,
  overviewStats = null,
  onSelectNotificationTab = null
}) {
  const [activePortal, setActivePortal] = useState('mall');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(0);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isStickyNav, setIsStickyNav] = useState(false);
  const searchContainerRef = useRef(null);
  const quickMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const [isAdminNotifOpen, setIsAdminNotifOpen] = useState(false);
  const adminNotifRef = useRef(null);
  const [isAtomySitesOpen, setIsAtomySitesOpen] = useState(false);
  const atomySitesMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (adminNotifRef.current && !adminNotifRef.current.contains(e.target)) {
        setIsAdminNotifOpen(false);
      }
      if (atomySitesMenuRef.current && !atomySitesMenuRef.current.contains(e.target)) {
        setIsAtomySitesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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

  // Sticky navbar after first scroll on landing page and general views
  useEffect(() => {
    const handleScroll = () => {
      if (currentView !== 'product' && window.scrollY > 95) {
        setIsStickyNav(true);
      } else {
        setIsStickyNav(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

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

  // Close search dropdown and quick menu on click outside
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products based on search query
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_CATALOG_PRODUCTS.filter((prod) => {
      const name = (prod.name || '').toLowerCase();
      const id = (prod.id || '').toLowerCase();
      const cat = (prod.category || '').toLowerCase();
      const sub = (prod.subTopic || '').toLowerCase();
      return name.includes(q) || id.includes(q) || cat.includes(q) || sub.includes(q);
    }).slice(0, 10);
  }, [searchQuery]);

  const handleSelectSearchedProduct = (product) => {
    setIsSearchOpen(false);
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
    <header className="header-wrapper">
      {/* Unified Main Brand Header Bar */}
      <div className={`main-header-bar ${currentView === 'admin' ? 'admin-header-bar' : ''}`}>
        {/* Soaring Golden Phoenix Bird Background with Splitting Wind Flames */}
        <PhoenixFlight />

        <div className="container main-header-container">

          
          {/* Top Utility Links Row - Hidden for Admin */}
          {currentView !== 'admin' && (
            <div className="head-top-row">
              <div className="top-utility-links">
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
                <span className="top-utility-divider"></span>
                <a href="#about">About Us</a>
                <span className="top-utility-divider"></span>
                <a
                  href="/profile"
                  className="top-utility-settings-link"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateProfile) {
                      onNavigateProfile();
                    } else {
                      window.location.href = '/profile';
                    }
                  }}
                >
                  Settings
                </a>
                <span className="top-utility-divider"></span>
                <div className="region-selector">
                  <span className="region-title">India</span>
                  <Globe size={14} strokeWidth={1.8} />
                  <ChevronDown size={11} strokeWidth={2.2} />
                </div>
              </div>
            </div>
          )}

          {/* Main Row: Left Content + Search Bar (Parallel & close gap) + Right Action Icons */}
          <div className="head-main-row">
            {/* Left Content + Search Bar positioned directly next to My Office */}
            <div className="main-row-left-group">
              <div className="brand-section" ref={atomySitesMenuRef}>
                <div className="brand-logo-cluster">
                  <a
                    href="/"
                    className="brand-col-logo"
                    aria-label="Atomy Home"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateHome && onNavigateHome();
                    }}
                  >
                    <div className="brand-logo-top-row">
                      <svg
                        viewBox="0 0 103 52"
                        height="42"
                        width="84"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="brand-logo-svg"
                      >
                        <g fill="#ffffff">
                          <path d="M25.04 44.771h-3.2l1.397-4.983h.393l1.41 4.983Zm-.91-6.456h-1.945l-3.47 11.595h1.13a.716.716 0 0 0 .724-.564l.87-3.125h4.022l1.04 3.683h1.628l-3.256-11a.738.738 0 0 0-.735-.58M32.125 39.44a.38.38 0 0 0 .416.42h2.716v10.05h1.13a.39.39 0 0 0 .433-.435V39.86h2.741a.382.382 0 0 0 .418-.42v-1.043h-7.854v1.043ZM53.256 44.083c0 2.939-1.06 4.43-3.148 4.43-2.089 0-3.174-1.491-3.174-4.43 0-2.939 1.068-4.43 3.174-4.43 2.105 0 3.148 1.488 3.148 4.43Zm-3.148-5.923c-3.08 0-4.711 2.045-4.711 5.923s1.63 5.923 4.71 5.923c2.146 0 4.698-1.027 4.698-5.923s-2.544-5.923-4.697-5.923ZM68.141 39.108l-2.294 6.848-.074.248-.073-.257-2.567-7.084a.736.736 0 0 0-.709-.548H60.78v11.598h1.105a.397.397 0 0 0 .433-.437v-8.972l.155.502 2.66 7.333.025.07h.684a.77.77 0 0 0 .777-.563l2.32-6.848.145-.469v9.384h1.13a.391.391 0 0 0 .416-.437v-11.16h-1.442c-.565 0-.865.228-1.048.792M84.246 38.315c-.529 0-.766.158-1.015.674l-2.295 4.674-2.614-5.289-.031-.059H76.55l3.606 7.096v4.499h1.187c.147 0 .39-.056.39-.437v-3.179a3.097 3.097 0 0 1 .367-1.57l3.222-6.414-1.076.005ZM9.999 11.18c4.587 0 6.218 4.699 6.218 8.681 0 3.982-1.62 8.695-6.218 8.695s-6.218-4.701-6.218-8.695c0-3.994 1.614-8.681 6.218-8.681Zm.09 21.037c5.088 0 6.34-3.68 6.34-3.68v1.996c0 1.129.847 1.693 1.769 1.693.729 0 1.769-.333 1.769-1.693V8.943c0-1.43-1.04-1.765-1.77-1.765-.776 0-1.768.335-1.768 1.765v1.495s-1.58-3.26-6.34-3.26C3.623 7.178 0 13.208 0 19.695c0 6.487 3.623 12.522 10.09 12.522ZM23.084 10.672h2.721v19.864c0 .98.738 1.693 1.9 1.693 1.161 0 1.896-.694 1.896-1.693V10.672h2.736c1.246 0 1.893-.643 1.893-1.748 0-1.106-.647-1.743-1.893-1.743H29.6V1.907c0-.847-.172-1.907-1.896-1.907-1.611 0-1.9 1.08-1.9 1.907V7.18h-2.721c-1.258 0-1.896.634-1.896 1.743 0 1.108.638 1.748 1.896 1.748Z" />
                          <path d="M42.738 10.923c4.651 0 6.288 4.795 6.288 8.845 0 4.05-1.637 8.856-6.288 8.856-4.652 0-6.314-4.78-6.314-8.842 0-4.061 1.642-8.859 6.314-8.859Zm0 21.294c6.463 0 10.089-6.024 10.089-12.522S49.187 7.18 42.737 7.18c-6.449 0-10.097 6.027-10.097 12.514 0 6.487 3.629 12.522 10.098 12.522ZM100.956 28.624c-4.872 0-6.217-2.417-6.43-2.764h6.035s1.695.141 1.695-1.808c0-1.895-1.695-1.816-1.695-1.816h-7.385v-1.272h7.436s1.806.133 1.806-1.692-1.806-1.718-1.806-1.718h-7.436v-1.128h6.5s1.696.122 1.696-1.58c0-1.658-1.696-1.576-1.696-1.576h-6.5v-1.173h8.131s1.696.14 1.696-1.808c0-1.895-1.696-1.82-1.696-1.82h-4.222s1.808-1.821.55-2.95c-1.257-1.127-2.308.201-2.308.201L92.84 8.47H90.06L87.57 5.72s-1.074-1.303-2.3-.2c-1.227 1.102.55 2.95.55 2.95h-4.222s-1.696-.076-1.696 1.819c0 1.949 1.696 1.808 1.696 1.808h8.128v1.179h-6.5s-1.696-.082-1.696 1.576c0 1.693 1.696 1.58 1.696 1.58h6.5v1.128h-7.421s-1.806-.079-1.806 1.718c0 1.796 1.806 1.692 1.806 1.692h7.43v1.272H82.34s-1.695-.08-1.695 1.816c0 1.95 1.695 1.808 1.695 1.808h6.026c-.212.347-1.549 2.764-6.424 2.764-2.038 0-2.15 1.388-1.978 2.256a1.732 1.732 0 0 0 1.718 1.306s6.412.449 9.773-4.306c3.363 4.755 9.767 4.306 9.767 4.306a1.719 1.719 0 0 0 1.724-1.291c.164-.878.051-2.257-1.978-2.257M78.081 12.771c0-3.384-3.258-5.502-6.243-5.502-2.515 0-4.683 1.049-5.612 2.538-.732-1.5-2.434-2.538-4.418-2.538a5.045 5.045 0 0 0-3.937 1.796c0-1.362-.52-1.873-1.548-1.873-1.196 0-1.696.548-1.696 1.975v21.378a1.69 1.69 0 0 0 1.129 1.6c.22.077.453.109.685.092 1.88 0 1.81-1.692 1.81-1.692V14.393c0-.59.208-2.713 3.153-2.713 2.787 0 3.123 1.709 3.123 2.713v16.141s-.045 1.692 1.82 1.692c1.908 0 1.806-1.692 1.806-1.692V14.393c0-1.275.743-2.713 3.134-2.713 2.886 0 3.149 1.709 3.149 2.713v16.141s-.082 1.692 1.82 1.692c1.947 0 1.814-1.692 1.814-1.692l.011-17.763Z" />
                        </g>
                      </svg>
                    </div>
                  </a>

                  <button
                    type="button"
                    className={`brand-arrow-circle ${isAtomySitesOpen ? 'open' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAtomySitesOpen((prev) => !prev);
                    }}
                    title="Select Global Site"
                    aria-label="Toggle Atomy Family Sites"
                    aria-expanded={isAtomySitesOpen}
                  >
                    {isAtomySitesOpen ? <ChevronUp size={13} strokeWidth={2.4} /> : <ChevronDown size={13} strokeWidth={2.4} />}
                  </button>

                  {/* Atomy Family Sites Dropdown Card */}
                  {isAtomySitesOpen && (
                    <div className="atomy-sites-dropdown-card">
                      <div className="atomy-sites-header">
                        <a
                          href="https://in.atomy.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="atomy-sites-header-logo-link"
                        >
                          <img
                            src="https://resources.atomy.com/20261007093306/fo/images/common/CI-blue_68.svg"
                            alt="ATOMY"
                            className="atomy-sites-header-img"
                          />
                        </a>
                        <button
                          type="button"
                          className="atomy-sites-close-btn"
                          onClick={() => setIsAtomySitesOpen(false)}
                          aria-label="Close family menu"
                        >
                          <ChevronUp size={13} />
                        </button>
                      </div>

                      <ul className="atomy-sites-list">
                        {ATOMY_FAMILY_SITES.map((site) => (
                          <li key={site.id}>
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="atomy-site-item"
                              onClick={() => setIsAtomySitesOpen(false)}
                            >
                              <img
                                src={site.iconUrl}
                                alt={site.title}
                                className="atomy-site-icon-img"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <span className="atomy-site-name">{site.title}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="team-phoenix-col">
                  <span className="team-phoenix-title">Team Phoenix</span>
                  <span className="team-phoenix-sub">Team Phoenix India</span>
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
                        onClick={() => setActivePortal('office')}
                      >
                        My Office
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Search Box placed parallel right next to My Office - Hidden for Admin */}
              {currentView !== 'admin' && (
                <div className="search-container" ref={searchContainerRef}>
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
                                      ₹{' '}
                                      {(prod.price || 0).toLocaleString('en-IN', {
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
              )}
            </div>

            {/* Right Action Icons: Notification, Profile, Cart */}
            <div className="header-actions">
              {currentView === 'admin' ? (
                <div className="admin-master-actions-group">
                  {/* Master Navbar Notification Bell */}
                  <div className="admin-master-notif-wrap" ref={adminNotifRef}>
                    <button
                      type="button"
                      className={`admin-master-bell-btn ${isAdminNotifOpen ? 'active' : ''}`}
                      onClick={() => setIsAdminNotifOpen(prev => !prev)}
                      title="System Alerts & Notifications"
                      aria-label="Notifications"
                    >
                      <Bell size={20} strokeWidth={2.2} />
                      {notificationCount > 0 && (
                        <span className="admin-master-bell-badge">
                          {notificationCount}
                        </span>
                      )}
                    </button>

                    {isAdminNotifOpen && (
                      <div className="admin-master-notif-dropdown">
                        <div className="notif-dropdown-header">
                          <strong>Notifications & Alerts</strong>
                          <span className="notif-count-pill">
                            {notificationCount} Active
                          </span>
                        </div>
                        <div className="notif-dropdown-body">
                          {overviewStats?.recentNewOrders && overviewStats.recentNewOrders.length > 0 ? (
                            overviewStats.recentNewOrders.map(ro => (
                              <div
                                key={ro.orderId}
                                className="notif-item order-specific-item"
                                onClick={() => {
                                  onSelectNotificationTab && onSelectNotificationTab('orders', 'PLACED');
                                  setIsAdminNotifOpen(false);
                                }}
                              >
                                <div className="notif-icon-circle placed">
                                  <Bell size={14} />
                                </div>
                                <div className="notif-text">
                                  <strong>New Order: #{ro.orderId}</strong>
                                  <span>{ro.customerName} • ₹{Number(ro.totalAmount || ro.grandTotal || 0).toLocaleString('en-IN')}</span>
                                  {ro.estimatedDeliveryDate && (
                                    <span className="notif-eta-badge" style={{ display: 'block', fontSize: '11px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                                      Est. Delivery: {ro.estimatedDeliveryDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (overviewStats?.placedCount || 0) > 0 ? (
                            <div
                              className="notif-item"
                              onClick={() => {
                                onSelectNotificationTab && onSelectNotificationTab('orders', 'PLACED');
                                setIsAdminNotifOpen(false);
                              }}
                            >
                              <div className="notif-icon-circle placed">
                                <Bell size={14} />
                              </div>
                              <div className="notif-text">
                                <strong>{overviewStats.placedCount} New Customer Orders</strong>
                                <span>Awaiting warehouse packing & fulfillment</span>
                              </div>
                            </div>
                          ) : null}

                          {(overviewStats?.openTicketsCount || 0) > 0 && (
                            <div
                              className="notif-item"
                              onClick={() => {
                                onSelectNotificationTab && onSelectNotificationTab('support');
                                setIsAdminNotifOpen(false);
                              }}
                            >
                              <div className="notif-icon-circle support">
                                <User size={14} />
                              </div>
                              <div className="notif-text">
                                <strong>{overviewStats.openTicketsCount} Open Support Inquiries</strong>
                                <span>Customer questions waiting for response</span>
                              </div>
                            </div>
                          )}

                          {(overviewStats?.lowStockCount || 0) > 0 && (
                            <div
                              className="notif-item"
                              onClick={() => {
                                onSelectNotificationTab && onSelectNotificationTab('inventory');
                                setIsAdminNotifOpen(false);
                              }}
                            >
                              <div className="notif-icon-circle stock">
                                <Sparkles size={14} />
                              </div>
                              <div className="notif-text">
                                <strong>{overviewStats.lowStockCount} Inventory Stock Alerts</strong>
                                <span>Products reaching threshold limit</span>
                              </div>
                            </div>
                          )}

                          {notificationCount === 0 && (
                            <div className="notif-empty-state">
                              <span>✓ All systems normal. No active alerts.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Master Navbar Admin Profile Pill matching User Image 1 */}
                  <div
                    className="admin-master-profile-pill"
                    onClick={() => onNavigateAdminProfile && onNavigateAdminProfile()}
                    title="View Admin Profile & Settings"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="admin-master-avatar">
                      {(adminProfile?.name || 'Naveen').charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-master-info">
                      <span className="admin-master-name">
                        {adminProfile?.name ? adminProfile.name.split(' ')[0] : 'Naveen'}
                      </span>
                      <span className="admin-master-role">
                        {adminProfile?.role || 'Super Administrator'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                        aria-label="Sign in / My Account" 
                        title="Sign in / My Account"
                        onClick={() => {
                          onNavigateSignIn ? onNavigateSignIn('signin') : (window.location.href = '/signin');
                        }}
                      >
                        <User size={25} strokeWidth={1.8} />
                      </button>
                    )}
                  </div>

                  {/* Cart Button */}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar - Hidden for Admin */}
      {currentView !== 'admin' && (
        <>
          {isStickyNav && <div className="sub-nav-placeholder" aria-hidden="true" />}
          <nav className={`sub-nav-bar ${isStickyNav ? 'is-sticky' : ''}`}>
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
                <div className="category-popup-dropdown" role="menu">
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
                            setIsMegaMenuOpen(false);
                            onSelectCategory && onSelectCategory(cat.id);
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
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
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
                </div>
              )}
            </div>
          </div>
        </nav>
      </>
    )}
    </header>
  );
}
