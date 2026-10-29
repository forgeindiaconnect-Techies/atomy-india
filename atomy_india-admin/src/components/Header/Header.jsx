import React, { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingCart, ChevronDown, ChevronUp, Menu, Globe, X, Bell, Sparkles, Clock, Heart } from 'lucide-react';
import { MenuToggleIcon } from '../FloatingToolbar/FloatingToolbar';
import { ALL_CATALOG_PRODUCTS } from '../../data/mockData';
import PhoenixFlight from './PhoenixFlight';
import ficLogo from '../../assets/fic-symbol.png';
import IndiaMap from './IndiaMap';
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
  onSelectNotificationTab = null,
  onMarkAllNotifsAsRead = null,
  onDismissNotif = null,
  onDismissTickets = null,
  onDismissStockAlerts = null
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
              <div className="brand-section">
                <a
                  href="/"
                  className="brand-col-logo"
                  aria-label="Forge India Connect Admin Home"
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>Notifications & Alerts</strong>
                            <span className="notif-count-pill">
                              {notificationCount} Active
                            </span>
                          </div>
                          {notificationCount > 0 && onMarkAllNotifsAsRead && (
                            <button
                              type="button"
                              className="notif-clear-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAllNotifsAsRead();
                              }}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="notif-dropdown-body">
                          {overviewStats?.recentNewOrders && overviewStats.recentNewOrders.length > 0 ? (
                            overviewStats.recentNewOrders.map(ro => {
                              const orderId = ro.orderId || ro.id;
                              return (
                                <div
                                  key={orderId}
                                  className="notif-item order-specific-item"
                                  onClick={() => {
                                    onDismissNotif && onDismissNotif(orderId);
                                    onSelectNotificationTab && onSelectNotificationTab('orders', 'ALL', orderId);
                                    setIsAdminNotifOpen(false);
                                  }}
                                >
                                  <div className="notif-icon-circle placed">
                                    <Bell size={14} />
                                  </div>
                                  <div className="notif-text" style={{ flex: 1 }}>
                                    <strong>New Order: #{orderId}</strong>
                                    <span>{ro.customerName} • ₹{Number(ro.totalAmount || ro.grandTotal || 0).toLocaleString('en-IN')}</span>
                                    {ro.estimatedDeliveryDate && (
                                      <span className="notif-eta-badge" style={{ display: 'block', fontSize: '11px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                                        Est. Delivery: {ro.estimatedDeliveryDate}
                                      </span>
                                    )}
                                  </div>
                                  {onDismissNotif && (
                                    <button
                                      type="button"
                                      className="notif-dismiss-btn"
                                      title="Dismiss notification"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDismissNotif(orderId);
                                      }}
                                    >
                                      <X size={14} />
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          ) : null}

                          {overviewStats?.delayedOrders && overviewStats.delayedOrders.length > 0 ? (
                            overviewStats.delayedOrders.map(dOrder => {
                              const orderId = dOrder.orderId || dOrder.id;
                              return (
                                <div
                                  key={`delayed_${orderId}`}
                                  className="notif-item order-specific-item"
                                  style={{ borderLeft: '3px solid #ef4444', backgroundColor: '#fef2f2' }}
                                  onClick={() => {
                                    onDismissNotif && onDismissNotif(`delayed_${orderId}`);
                                    onSelectNotificationTab && onSelectNotificationTab('orders', 'DELAYED', orderId);
                                    setIsAdminNotifOpen(false);
                                  }}
                                >
                                  <div className="notif-icon-circle placed" style={{ background: '#fee2e2', color: '#dc2626' }}>
                                    <Clock size={14} />
                                  </div>
                                  <div className="notif-text" style={{ flex: 1 }}>
                                    <strong style={{ color: '#b91c1c' }}>Delayed Order: #{orderId}</strong>
                                    <span>{dOrder.customerName} • Estimated: {dOrder.estimatedDeliveryDate || 'Overdue'}</span>
                                  </div>
                                  {onDismissNotif && (
                                    <button
                                      type="button"
                                      className="notif-dismiss-btn"
                                      title="Dismiss notification"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDismissNotif(`delayed_${orderId}`);
                                      }}
                                    >
                                      <X size={14} />
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          ) : null}

                          {(overviewStats?.unreadTicketsCount || 0) > 0 && (
                            <div
                              className="notif-item"
                              onClick={() => {
                                onDismissTickets && onDismissTickets();
                                onSelectNotificationTab && onSelectNotificationTab('support');
                                setIsAdminNotifOpen(false);
                              }}
                            >
                              <div className="notif-icon-circle support">
                                <User size={14} />
                              </div>
                              <div className="notif-text" style={{ flex: 1 }}>
                                <strong>{overviewStats.unreadTicketsCount} Open Support Inquiries</strong>
                                <span>Customer questions waiting for response</span>
                              </div>
                              {onDismissTickets && (
                                <button
                                  type="button"
                                  className="notif-dismiss-btn"
                                  title="Dismiss support alerts"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDismissTickets();
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          )}

                          {(overviewStats?.unreadLowStockCount || 0) > 0 && (
                            <div
                              className="notif-item"
                              onClick={() => {
                                onDismissStockAlerts && onDismissStockAlerts();
                                onSelectNotificationTab && onSelectNotificationTab('inventory');
                                setIsAdminNotifOpen(false);
                              }}
                            >
                              <div className="notif-icon-circle stock">
                                <Sparkles size={14} />
                              </div>
                              <div className="notif-text" style={{ flex: 1 }}>
                                <strong>{overviewStats.unreadLowStockCount} Inventory Stock Alerts</strong>
                                <span>Products reaching threshold limit</span>
                              </div>
                              {onDismissStockAlerts && (
                                <button
                                  type="button"
                                  className="notif-dismiss-btn"
                                  title="Dismiss stock alerts"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDismissStockAlerts();
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              )}
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
