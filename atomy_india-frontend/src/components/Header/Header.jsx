import React, { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingCart, ChevronDown, ChevronUp, ChevronRight, Menu, Globe, X, Bell, Sparkles, Clock, Heart, Ticket, Compass, Settings, Check, Star, MapPin, Navigation } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getSavedLanguage, changeLanguage } from '../../services/languageService';
import { MenuToggleIcon } from '../FloatingToolbar/FloatingToolbar';
import { getCustomerDeliveryPincode, setCustomerDeliveryPincode, syncCatalogFromBackend } from '../../services/catalogSyncService';
import { 
  lookupPostalPincode,
  detectCustomerLiveLocation, 
  getShortLocationLabel, 
  getHubLabel, 
  applyDetectedLocation
} from '../../services/locationService';
import atomyLogo from '../../assets/atomy-logo.png';
import ficLogo from '../../assets/fic-symbol.png';
import IndiaMap from './IndiaMap';
import PhoenixFlight from './PhoenixFlight';
import NavbarColorPicker, { isHexColorDark, hexToRgba, rgbaToHex } from './NavbarColorPicker';
import { getMembershipExpiryInfo } from '../Membership/MembershipExpiryBanner';
import { ALL_CATALOG_PRODUCTS } from '../../data/mockData';
import { OFFICIAL_DISTRIBUTOR_PRICES } from '../../data/officialDistributorPrices';
import './Header.css';

export function getProductMrpPrice(prod) {
  if (!prod) return 0;
  const official = prod.id ? OFFICIAL_DISTRIBUTOR_PRICES[prod.id] : null;
  const mrp = Number(prod.originalPrice || prod.mrp || official?.mrp);
  if (mrp && mrp > 0) return mrp;
  const p = Number(prod.price || prod.dpPrice || official?.dpPrice || 0);
  return p > 0 ? p : 1000;
}


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
  membership = null,
  onOpenMembershipModal,
  onNavigateMembership
}) {
  const activeMembership = membership || currentUser?.membership;
  const isCustomerMember = Boolean(isMember || currentUser?.isMember || activeMembership?.status === 'ACTIVE');
  const expiryInfo = React.useMemo(() => getMembershipExpiryInfo(activeMembership), [activeMembership]);

  const [activePortal, setActivePortal] = useState('mall');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  useEffect(() => {
    if (isMegaMenuOpen) {
      document.body.classList.add('mobile-drawer-open');
    } else {
      document.body.classList.remove('mobile-drawer-open');
    }
    return () => {
      document.body.classList.remove('mobile-drawer-open');
    };
  }, [isMegaMenuOpen]);


  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(0);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isAtomySitesOpen, setIsAtomySitesOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => getSavedLanguage());
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [navbarBottom, setNavbarBottom] = useState(0);

  // Zepto-style Delivery Location & Regional Hub Lock State
  const [deliveryPincode, setDeliveryPincode] = useState(() => getCustomerDeliveryPincode());
  const [deliveryCity, setDeliveryCity] = useState(() => {
    try {
      return localStorage.getItem('atomy_customer_delivery_city') || '';
    } catch {
      return '';
    }
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatusMsg, setLocationStatusMsg] = useState('');
  const [availablePostAreas, setAvailablePostAreas] = useState([]);
  const [currentDistrict, setCurrentDistrict] = useState('');
  const [selectedSubArea, setSelectedSubArea] = useState('');

  // Dynamically resolve district & available post areas when user types a 6-digit PIN
  useEffect(() => {
    const clean = locationInput.trim();
    if (/^\d{6}$/.test(clean)) {
      lookupPostalPincode(clean).then((info) => {
        if (info && info.valid) {
          const dist = info.district || info.areaName;
          setCurrentDistrict(dist);
          setAvailablePostAreas(Array.isArray(info.postAreas) ? info.postAreas : []);
        } else {
          setAvailablePostAreas([]);
          setCurrentDistrict('');
        }
      });
    } else {
      setAvailablePostAreas([]);
      setCurrentDistrict('');
      setSelectedSubArea('');
    }
  }, [locationInput]);

  // Listen for pincode and area change broadcasts across all components
  useEffect(() => {
    const handlePinChange = (e) => {
      if (e?.detail?.pincode) setDeliveryPincode(e.detail.pincode);
      if (e?.detail?.city) setDeliveryCity(e.detail.city);
    };
    window.addEventListener('atomy_pincode_changed', handlePinChange);
    return () => window.removeEventListener('atomy_pincode_changed', handlePinChange);
  }, []);

  // Auto-detect location on first customer visit or launch
  useEffect(() => {
    try {
      const cachedPin = localStorage.getItem('atomy_customer_delivery_pincode');
      if (cachedPin === '635122') {
        localStorage.setItem('atomy_customer_delivery_pincode', '635002');
        localStorage.setItem('atomy_customer_delivery_city', 'Krishnagiri');
        setDeliveryPincode('635002');
        setDeliveryCity('Krishnagiri');
      }
      const alreadyDetected = localStorage.getItem('atomy_location_autodetected_v2');
      if (!alreadyDetected) {
        detectCustomerLiveLocation().then((loc) => {
          if (loc && loc.pincode) {
            setDeliveryPincode(loc.pincode);
            if (loc.city) setDeliveryCity(loc.city);
          }
        });
      }
    } catch {}
  }, []);

  const handleSelectPincode = async (pin, chosenSubLocality = null) => {
    const clean = String(pin || '').trim();
    if (!/^\d{6}$/.test(clean)) {
      setLocationStatusMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsLocating(true);
    setLocationStatusMsg(`Resolving delivery area for PIN ${clean}...`);

    try {
      const postalInfo = await lookupPostalPincode(clean);
      setIsLocating(false);

      const district = postalInfo?.district || postalInfo?.areaName || 'Regional Hub';
      const resolvedArea = chosenSubLocality
        ? `${chosenSubLocality}, ${district}`
        : district;
      const resolvedState = postalInfo?.state || 'India';

      applyDetectedLocation({
        pincode: clean,
        city: resolvedArea,
        state: resolvedState
      });

      setDeliveryPincode(clean);
      setDeliveryCity(resolvedArea);
      setSelectedSubArea(chosenSubLocality || '');
      setLocationStatusMsg(`✓ Connected to ${resolvedArea} (${clean}). Showing live stock!`);

      setTimeout(() => {
        setIsLocationModalOpen(false);
        setLocationStatusMsg('');
      }, 1200);
    } catch (err) {
      setIsLocating(false);
      const fallbackCity = chosenSubLocality || `Area (${clean})`;
      applyDetectedLocation({ pincode: clean, city: fallbackCity });
      setDeliveryPincode(clean);
      setDeliveryCity(fallbackCity);
      setLocationStatusMsg(`✓ Set delivery to PIN ${clean}.`);
      setTimeout(() => {
        setIsLocationModalOpen(false);
        setLocationStatusMsg('');
      }, 1200);
    }
  };

  const handleDetectLiveLocation = async () => {
    setIsLocating(true);
    setLocationStatusMsg('Detecting your live regional location with GPS...');
    try {
      const loc = await detectCustomerLiveLocation({ force: true });
      setIsLocating(false);
      if (loc && loc.pincode) {
        setDeliveryPincode(loc.pincode);
        if (loc.city) setDeliveryCity(loc.city);
        setLocationInput(loc.pincode);
        setLocationStatusMsg(`✓ Live location detected: ${loc.city || 'Your Area'} (${loc.pincode})! Live regional stock updated.`);
        setTimeout(() => {
          setIsLocationModalOpen(false);
          setLocationStatusMsg('');
        }, 1300);
      }
    } catch (err) {
      setIsLocating(false);
      setLocationStatusMsg('GPS timeout. Please enter your 6-digit PIN code above and click Apply.');
    }
  };
  const [navbarBgColor, setNavbarBgColor] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_navbar_bg');
      if (!saved || saved.toUpperCase() === '#EAB308') {
        localStorage.setItem('atomy_navbar_bg', '#00A3E0');
        return '#00A3E0';
      }
      return saved;
    } catch (e) {
      return '#00A3E0';
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
      name: "HEMOHIM",
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
                {(isMember || expiryInfo?.status === 'EXPIRED') ? (
                  <button
                    type="button"
                    className={`top-membership-pill ${
                      expiryInfo?.status === 'EXPIRING_SOON'
                        ? 'member-expiring'
                        : expiryInfo?.status === 'EXPIRED'
                        ? 'member-expired'
                        : 'member-active'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onNavigateMembership) onNavigateMembership();
                    }}
                    title={
                      expiryInfo?.status === 'EXPIRING_SOON'
                        ? `Atomy Distributor Plan Expires in ${expiryInfo.remainingDays} Day${expiryInfo.remainingDays === 1 ? '' : 's'} (${expiryInfo.expiryDateStr}) - Click to Renew`
                        : expiryInfo?.status === 'EXPIRED'
                        ? 'Atomy Distributor Plan Expired - Click to Reactivate'
                        : 'Atomy Distributor Membership Active - Wholesale DP Pricing Unlocked'
                    }
                  >
                    <span className="member-pill-sparkle">●</span>
                    <span className="member-pill-label-desktop">
                      {expiryInfo?.status === 'EXPIRING_SOON'
                        ? `Expires in ${expiryInfo.remainingDays} Day${expiryInfo.remainingDays === 1 ? '' : 's'}`
                        : expiryInfo?.status === 'EXPIRED'
                        ? 'Expired'
                        : 'Member Account'}
                    </span>
                    <span className="member-pill-label-mobile">
                      {expiryInfo?.status === 'EXPIRING_SOON'
                        ? `${expiryInfo.remainingDays}d Left`
                        : expiryInfo?.status === 'EXPIRED'
                        ? 'Expired'
                        : 'Member'}
                    </span>
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
                        onClick={() => {
                        setActivePortal('mall');
                        if (onNavigateHome) onNavigateHome();
                      }}
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
                    <button
                      type="button"
                      className="search-inline-location-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsLocationModalOpen(true);
                      }}
                      title="Change delivery location & live regional stock"
                    >
                      <MapPin size={13} className="search-location-icon" />
                      <span className="search-location-text">
                        {getShortLocationLabel(deliveryPincode, deliveryCity)}
                      </span>
                      <ChevronDown size={11} className="search-location-arrow" />
                    </button>
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
                                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>MRP</span>
                                      ₹ {getProductMrpPrice(prod).toLocaleString('en-IN', {
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

              <div className="profile-action-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {currentUser ? (
                  <>
                    <button 
                      className={`action-btn logged-in-profile-btn ${isCustomerMember ? 'has-member-star' : ''}`} 
                      aria-label="Customer Profile & Settings" 
                      title={`${userFullName} - Profile & Settings`}
                      onClick={() => onNavigateProfile && onNavigateProfile()}
                    >
                      <div className="profile-avatar-circle">
                        {userInitial}
                      </div>
                      <span className="profile-online-badge"></span>
                      {isCustomerMember && (
                        <span className="header-avatar-star-badge" title="Member Active" aria-label="Membership Star">
                          <Star size={10} fill="#f59e0b" color="#d97706" />
                        </span>
                      )}
                    </button>
                  </>
                ) : (
                  <>
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
                    {isMember && (
                      <span
                        className="header-member-account-badge"
                        onClick={() => onNavigateMembership && onNavigateMembership()}
                        title="Atomy Distributor Membership Active"
                      >
                        <span className="member-status-dot">●</span> Member Account
                      </span>
                    )}
                  </>
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
        <nav className={`sub-nav-bar ${isMegaMenuOpen ? 'has-drawer-open' : ''}`}>

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
                          <div className="mobile-drawer-avatar-wrapper">
                            <div className="mobile-drawer-avatar">{userInitial}</div>
                            {isCustomerMember && (
                              <span className="drawer-avatar-star-badge" title="Member Active" aria-label="Membership Star">
                                <Star size={11} fill="#f59e0b" color="#d97706" />
                              </span>
                            )}
                          </div>
                          <div className="mobile-drawer-meta">
                            <span className="mobile-drawer-username">{userFullName}</span>
                            <span className="mobile-drawer-status">{isCustomerMember ? '★ Member Active' : 'Consumer'}</span>
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

      {/* Mobile Delivery Location Strip - Visible only on mobile screens <= 768px */}
      {currentView !== 'admin' && (
        <div 
          className="mobile-delivery-strip"
          onClick={() => setIsLocationModalOpen(true)}
          role="button"
          tabIndex={0}
        >
          <div className="mobile-delivery-strip-left">
            <MapPin size={13} className="mobile-delivery-strip-icon" />
            <span className="mobile-delivery-strip-text">
              Deliver to: <strong>{getShortLocationLabel(deliveryPincode, deliveryCity)}</strong>
            </span>
          </div>
          <div className="mobile-delivery-strip-change">
            <span>Change</span>
            <ChevronDown size={12} />
          </div>
        </div>
      )}

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

    {/* Zepto-Style Regional Delivery Hub & PIN Selector Modal */}
    {isLocationModalOpen && (
      <div className="lang-region-modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
        <div
          className="lang-region-modal-card"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '440px', padding: '24px' }}
        >
          <div className="lang-region-modal-header" style={{ padding: '0 0 16px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={22} color="#00a3e0" />
              <h2 className="lang-region-modal-title" style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Select Delivery Location
              </h2>
            </div>
            <button
              type="button"
              className="lang-region-close-btn"
              onClick={() => setIsLocationModalOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Choose your delivery PIN code to view <strong>live regional stock</strong> and dispatch directly from your nearest Atomy Regional Hub.
            </p>

            {/* Current Active Hub & Delivery Area Badge */}
            <div style={{ padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7', flexShrink: 0 }}></div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0369a1' }}>
                  Current Area: {getHubLabel(deliveryPincode, deliveryCity)}
                </div>
                <div style={{ fontSize: '11.5px', color: '#0284c7', marginTop: '2px' }}>
                  PIN Code: <strong>{deliveryPincode}</strong> (Live Regional Stock &amp; Direct Dispatch)
                </div>
              </div>
            </div>

            {/* Manual PIN Code Input with Instant Area Resolution */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Enter Indian Delivery PIN Code
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 635202, 635001, 110001"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSelectPincode(locationInput); }}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.5px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSelectPincode(locationInput)}
                  disabled={isLocating}
                  style={{
                    padding: '10px 20px',
                    background: '#00a3e0',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: isLocating ? 'not-allowed' : 'pointer',
                    opacity: isLocating ? 0.7 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isLocating ? 'Verifying...' : 'Apply'}
                </button>
              </div>

              {/* Optional Specific Post Area / Locality Selector */}
              {availablePostAreas.length > 0 && (
                <div style={{ marginTop: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                      Available Areas in PIN {locationInput} (Select Locality):
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      District: <strong>{currentDistrict}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubArea('');
                        handleSelectPincode(locationInput, null);
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: !selectedSubArea ? '#00a3e0' : '#ffffff',
                        color: !selectedSubArea ? '#ffffff' : '#334155',
                        border: !selectedSubArea ? '1px solid #00a3e0' : '1px solid #cbd5e1',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Entire {currentDistrict || 'District'}
                    </button>
                    {availablePostAreas.map((postName) => {
                      const isCurrent = selectedSubArea === postName;
                      return (
                        <button
                          key={postName}
                          type="button"
                          onClick={() => {
                            setSelectedSubArea(postName);
                            handleSelectPincode(locationInput, postName);
                          }}
                          style={{
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: isCurrent ? '#00a3e0' : '#ffffff',
                            color: isCurrent ? '#ffffff' : '#334155',
                            border: isCurrent ? '1px solid #00a3e0' : '1px solid #cbd5e1',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {postName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Detect Live Location Button */}
            <button
              type="button"
              onClick={handleDetectLiveLocation}
              disabled={isLocating}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 16px',
                background: '#ffffff',
                border: '1.5px solid #bae6fd',
                borderRadius: '8px',
                color: '#0284c7',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isLocating ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Navigation size={15} color="#00a3e0" className={isLocating ? 'animate-spin' : ''} />
              <span>{isLocating ? 'Detecting Live GPS Location...' : 'Use Current Live Location'}</span>
            </button>

            {locationStatusMsg && (
              <div style={{ padding: '8px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '12px', color: '#065f46', fontWeight: 600 }}>
                {locationStatusMsg}
              </div>
            )}
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

          {/* Location selector strip inside mobile search popup */}
          <div className="mobile-search-popup-location-strip">
            <button
              type="button"
              className="mobile-search-popup-location-btn"
              onClick={() => {
                setIsMobileSearchOpen(false);
                setIsLocationModalOpen(true);
              }}
            >
              <MapPin size={13} className="mobile-search-loc-pin" />
              <span>Delivering to <strong>{getShortLocationLabel(deliveryPincode, deliveryCity)}</strong></span>
              <ChevronDown size={11} className="mobile-search-loc-arrow" />
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
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>MRP</span>
                              ₹ {getProductMrpPrice(prod).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
