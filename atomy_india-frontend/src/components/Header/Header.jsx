import React, { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingCart, ChevronDown, ChevronUp, Menu, Globe, X, Bell, Sparkles, Clock, Heart, Ticket, Compass, Settings } from 'lucide-react';
import { MenuToggleIcon } from '../FloatingToolbar/FloatingToolbar';
import atomyLogo from '../../assets/atomy-logo.png';
import phoenixLogo from '../../assets/WhatsApp Image 2026-10-09 at 5.52.23 PM.jpeg';
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
  const [isStickyNav, setIsStickyNav] = useState(false);
  const [isAtomySitesOpen, setIsAtomySitesOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const quickMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const atomySitesMenuRef = useRef(null);

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
        <div className="container main-header-container">
          
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
                    <span>Membership Active</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="top-utility-link-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenMembershipModal) onOpenMembershipModal();
                      else if (onNavigateMembership) onNavigateMembership();
                    }}
                  >
                    Join Member
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
                <span className="top-utility-divider"></span>
                <a
                  href="/about-us"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateView) onNavigateView('about-us');
                    else window.location.href = '/about-us';
                  }}
                >
                  About Us
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
            {/* Atomy Corporate Logo with Family Sites Dropdown */}
            <div className="atomy-corner-brand-wrapper" ref={atomySitesMenuRef}>
              <a
                href="/"
                className="atomy-corner-logo"
                aria-label="Atomy Home"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateHome && onNavigateHome();
                }}
              >
                <img
                  src={atomyLogo}
                  alt="Atomy"
                  className="atomy-corner-logo-img"
                />
              </a>
              <button
                type="button"
                className={`brand-arrow-circle ${isAtomySitesOpen ? 'open' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAtomySitesOpen((prev) => !prev);
                }}
                aria-label="Toggle Atomy Family Sites"
                aria-expanded={isAtomySitesOpen}
              >
                {isAtomySitesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Atomy Family Sites Dropdown Card (Referenced from in.atomy.com/main) */}
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

            {/* Left Content + Search Bar positioned directly next to My Office */}
            <div className="main-row-left-group">
              <div className="brand-section">
                <a
                  href="/"
                  className="brand-col-logo"
                  aria-label="Team Phoenix Home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateHome && onNavigateHome();
                  }}
                >
                  <div className="brand-logo-top-row">
                    <img
                      src={phoenixLogo}
                      alt="Team Phoenix Logo"
                      className="brand-logo-img"
                    />
                  </div>
                </a>

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
                    {isMember && (
                      <span
                        className="member-badge-chip"
                        style={{
                          marginLeft: '8px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.18)'
                        }}
                      >
                        ★ DP Member
                      </span>
                    )}
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
