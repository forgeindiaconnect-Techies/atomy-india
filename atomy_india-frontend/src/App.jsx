import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import Header from './components/Header/Header';
import HeroSlider from './components/HeroSlider/HeroSlider';
import CategoryBar from './components/Categories/CategoryBar';
import BestProductsSection from './components/ProductSections/BestProductsSection';
import HairBodySection from './components/ProductSections/HairBodySection';
import BrandShowcaseSection from './components/ProductSections/BrandShowcaseSection';
import FoodEssentialSection from './components/ProductSections/FoodEssentialSection';
import GsgsSection from './components/ProductSections/GsgsSection';
import PromoBannerStrip from './components/Banners/PromoBannerStrip';
import NoticeTicker from './components/Notice/NoticeTicker';
import FloatingToolbar from './components/FloatingToolbar/FloatingToolbar';
import Footer from './components/Footer/Footer';
import CartDrawer from './components/Cart/CartDrawer';
import CartPage from './components/Cart/CartPage';
import CategoryPage from './components/CategoryPage/CategoryPage';
import CheckoutModal from './components/Checkout/CheckoutModal';
import TrackingModal from './components/Tracking/TrackingModal';
import SignInPage from './components/Auth/SignInPage';
import CustomerProfilePage from './components/Profile/CustomerProfilePage';
import ProductDetailPage from './components/ProductDetail/ProductDetailPage';
import FavoritesPage from './components/Favorites/FavoritesPage';
import OrderHistoryPage from './components/Orders/OrderHistoryPage';
import ContactCentrePage from './components/ContactCentre/ContactCentrePage';
import OrderSheetPage from './components/OrderSheet/OrderSheetPage';
import RecentlyViewedDrawer from './components/RecentlyViewed/RecentlyViewedDrawer';
import QuickOrderPage from './components/QuickOrder/QuickOrderPage';
import NewLaunchBadge from './components/Promotions/NewLaunchBadge';
import { clearAdSuppressionForLogin } from './services/adPromotionService';
import NoticePage from './components/Notice/NoticePage';
import CompensationPlanPage from './components/Compensation/CompensationPlanPage';
import GuidePage from './components/Guide/GuidePage';
import SeminarsPage from './components/Seminars/SeminarsPage';
import AtomyHubPage from './components/AtomyHub/AtomyHubPage';
import {
  ABSOLUTE_SKINCARE_BANNER,
  ABSOLUTE_SKINCARE_PRODUCTS,
  USER_GUIDE_BANNER,
  RESOURCE_MATERIAL_BANNER,
  HEALTH_ESSENTIAL_BANNER,
  HEALTH_ESSENTIAL_PRODUCTS,
  ALL_CATALOG_PRODUCTS
} from './data/mockData';
import { onCatalogUpdate, syncCatalogFromBackend } from './services/catalogSyncService';
import './App.css';

// Parse current browser URL into route state
const parseRouteFromLocation = () => {
  if (typeof window === 'undefined') return { view: 'home' };
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const search = new URLSearchParams(window.location.search);
  
  if (path === '/quick-order' || path === '/quickorder') return { view: 'quick-order' };
  if (path === '/order-sheet' || path === '/ordersheet' || path === '/checkout') return { view: 'order-sheet' };
  if (path === '/cart' || path === '/shopping-cart') return { view: 'cart' };
  if (path === '/favorites' || path === '/wishlist') return { view: 'favorites' };
  if (path === '/profile' || path === '/my-account' || path === '/account') return { view: 'profile' };
  if (path === '/signin' || path === '/login') {
    const mode = search.get('mode') || 'signin';
    return { view: 'signin', authMode: mode };
  }
  if (path === '/signup' || path === '/register') return { view: 'signin', authMode: 'signup' };
  if (path === '/orders' || path === '/my-orders') return { view: 'orders' };
  if (path === '/contact' || path === '/contact-us') return { view: 'contact' };
  if (path === '/notice' || path === '/notices') return { view: 'notice' };
  if (path === '/compensation' || path === '/compensation-plan') return { view: 'compensation' };
  if (path === '/guide' || path === '/user-guide') return { view: 'guide' };
  if (path === '/seminars' || path === '/seminar') return { view: 'seminars' };
  if (path === '/hub' || path === '/atomy-hub') return { view: 'hub' };
  
  if (path === '/category' || path.startsWith('/category/')) {
    const catId = search.get('id') || path.split('/')[2] || 'health';
    return { view: 'category', categoryId: catId };
  }
  
  if (path === '/product' || path.startsWith('/product/')) {
    const prodId = search.get('id') || path.split('/')[2];
    return { view: 'product', productId: prodId };
  }
  
  return { view: 'home' };
};

// Map view state to clean standard URL pathname
const getUrlForView = (view, extra = {}) => {
  switch (view) {
    case 'quick-order': return '/quick-order';
    case 'order-sheet': return '/order-sheet';
    case 'cart': return '/cart';
    case 'profile': return '/profile';
    case 'signin': return extra.authMode === 'signup' ? '/signin?mode=signup' : '/signin';
    case 'favorites': return '/favorites';
    case 'orders': return '/orders';
    case 'contact': return '/contact';
    case 'notice': return '/notice';
    case 'compensation': return '/compensation';
    case 'guide': return '/guide';
    case 'seminars': return '/seminars';
    case 'hub': return '/hub';
    case 'category': return extra.categoryId ? `/category?id=${encodeURIComponent(extra.categoryId)}` : '/category';
    case 'product': {
      const pId = extra.product?.id || extra.productId;
      return pId ? `/product?id=${encodeURIComponent(pId)}` : '/product';
    }
    case 'home':
    default: return '/';
  }
};

const getViewTitle = (view, catId, prod) => {
  switch (view) {
    case 'quick-order': return 'Quick Order';
    case 'order-sheet': return 'Order Sheet & Payment';
    case 'cart': return 'Shopping Cart';
    case 'profile': return 'My Account & Customer Profile';
    case 'signin': return 'Member Sign In';
    case 'favorites': return 'Wishlist & Favorites';
    case 'orders': return 'Order History';
    case 'contact': return 'Customer Care & Centres';
    case 'notice': return 'Notices & Announcements';
    case 'compensation': return 'Compensation Plan';
    case 'guide': return 'Member Guide';
    case 'seminars': return 'Seminars & Academy';
    case 'hub': return 'AtomyHUB Media';
    case 'category': return catId ? `${catId.charAt(0).toUpperCase() + catId.slice(1)} Mall` : 'Category';
    case 'product': return prod?.name || 'Product Details';
    default: return 'Shopping Mall';
  }
};

// Load persisted session navigation history or initialize with home fallback
const getInitialNavHistory = () => {
  const initial = parseRouteFromLocation();
  try {
    const saved = sessionStorage.getItem('atomy_nav_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  
  if (initial.view === 'home') {
    return [{ view: 'home', categoryId: 'health', product: null }];
  }
  return [
    { view: 'home', categoryId: 'health', product: null },
    { view: initial.view, categoryId: initial.categoryId || 'health', product: null }
  ];
};

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [isRecentlyViewedOpen, setIsRecentlyViewedOpen] = useState(false);

  const [toast, setToast] = useState(null);
  
  // Initialize view from URL if present
  const initialRoute = useMemo(() => parseRouteFromLocation(), []);
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [authMode, setAuthMode] = useState(initialRoute.authMode || 'signin');
  const [selectedCategory, setSelectedCategory] = useState(initialRoute.categoryId || 'health');
  const [selectedProduct, setSelectedProduct] = useState(() => {
    if (initialRoute.productId && ALL_CATALOG_PRODUCTS) {
      return ALL_CATALOG_PRODUCTS.find(p => p.id === initialRoute.productId) || ALL_CATALOG_PRODUCTS[0];
    }
  });

  // Live catalog synchronization with Spring Boot backend & Admin updates
  const [, setCatalogVersion] = useState(0);

  useEffect(() => {
    syncCatalogFromBackend().then(() => {
      setCatalogVersion(v => v + 1);
    });

    const unsubscribe = onCatalogUpdate((updatedProd) => {
      setCatalogVersion(v => v + 1);
      setSelectedProduct(prev => {
        if (prev && prev.id === updatedProd.id) {
          return { ...prev, ...updatedProd };
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, []);

  // Track session navigation history stack for in-app "Back" navigation
  const [navigationHistory, setNavigationHistory] = useState(() => getInitialNavHistory());

  // Centralized navigate function that synchronizes React state, URL, and session history
  const navigateTo = useCallback((view, extra = {}) => {
    const targetUrl = getUrlForView(view, extra);

    setNavigationHistory(prev => {
      const last = prev[prev.length - 1];
      if (last && last.view === view && last.categoryId === (extra.categoryId || selectedCategory) && last.product?.id === (extra.product?.id || selectedProduct?.id)) {
        return prev;
      }
      const newStack = [...prev, {
        view,
        categoryId: extra.categoryId || selectedCategory,
        product: extra.product || (extra.productId && ALL_CATALOG_PRODUCTS ? ALL_CATALOG_PRODUCTS.find(p => p.id === extra.productId) : null) || selectedProduct
      }];
      try {
        sessionStorage.setItem('atomy_nav_history', JSON.stringify(newStack));
      } catch {}
      return newStack;
    });

    // Update browser URL
    const currentPathWithQuery = window.location.pathname + window.location.search;
    if (currentPathWithQuery !== targetUrl) {
      window.history.pushState({ view, ...extra }, '', targetUrl);
    }

    if (extra.categoryId) setSelectedCategory(extra.categoryId);
    if (extra.product) setSelectedProduct(extra.product);
    else if (extra.productId && ALL_CATALOG_PRODUCTS) {
      const found = ALL_CATALOG_PRODUCTS.find(p => p.id === extra.productId);
      if (found) setSelectedProduct(found);
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory, selectedProduct]);

  // Centralized Back navigation: redirects to previous view without ever exiting the URL/app
  const handleGoBack = useCallback(() => {
    setNavigationHistory(prev => {
      if (prev.length > 1) {
        const newStack = prev.slice(0, -1);
        const prevTarget = newStack[newStack.length - 1] || { view: 'home', categoryId: 'health', product: null };
        try {
          sessionStorage.setItem('atomy_nav_history', JSON.stringify(newStack));
        } catch {}

        const targetUrl = getUrlForView(prevTarget.view, prevTarget);
        window.history.pushState({ view: prevTarget.view, ...prevTarget }, '', targetUrl);

        if (prevTarget.categoryId) setSelectedCategory(prevTarget.categoryId);
        if (prevTarget.product) setSelectedProduct(prevTarget.product);
        setCurrentView(prevTarget.view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return newStack;
      }

      // If at base of stack, safely redirect to home without exiting the application URL
      const homeTarget = { view: 'home', categoryId: 'health', product: null };
      const homeStack = [homeTarget];
      try {
        sessionStorage.setItem('atomy_nav_history', JSON.stringify(homeStack));
      } catch {}

      const homeUrl = getUrlForView('home');
      window.history.pushState({ view: 'home' }, '', homeUrl);
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return homeStack;
    });
  }, []);

  // Listen to browser Back/Forward (popstate) buttons seamlessly
  useEffect(() => {
    // Sync initial state in history
    const initial = parseRouteFromLocation();
    window.history.replaceState({ view: initial.view }, '', window.location.pathname + window.location.search);

    const handlePopState = () => {
      const route = parseRouteFromLocation();
      setCurrentView(route.view);
      if (route.authMode) setAuthMode(route.authMode);
      if (route.categoryId) setSelectedCategory(route.categoryId);
      if (route.productId && ALL_CATALOG_PRODUCTS) {
        const prod = ALL_CATALOG_PRODUCTS.find(p => p.id === route.productId) || ALL_CATALOG_PRODUCTS[0];
        if (prod) setSelectedProduct(prod);
      }
      
      setNavigationHistory(prev => {
        if (prev.length > 1 && prev[prev.length - 2]?.view === route.view) {
          const updated = prev.slice(0, -1);
          try { sessionStorage.setItem('atomy_nav_history', JSON.stringify(updated)); } catch {}
          return updated;
        }
        const updated = [...prev, { view: route.view, categoryId: route.categoryId || 'health', product: null }];
        try { sessionStorage.setItem('atomy_nav_history', JSON.stringify(updated)); } catch {}
        return updated;
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('atomy_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('atomy_recently_viewed', JSON.stringify(recentlyViewed));
    } catch {}
  }, [recentlyViewed]);

  const [placedOrders, setPlacedOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_placed_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('atomy_placed_orders', JSON.stringify(placedOrders));
    } catch {}
  }, [placedOrders]);

  // Current authenticated customer state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userData, isNewSignUp) => {
    const userObj = typeof userData === 'string'
      ? { name: userData, username: userData, email: `${userData.toLowerCase().replace(/\s+/g, '')}@atomy.in` }
      : userData;
    setCurrentUser(userObj);
    try {
      localStorage.setItem('atomy_current_user', JSON.stringify(userObj));
    } catch {}
    setToast(
      isNewSignUp
        ? `Welcome to Atomy, ${userObj.name}! Your account is ready.`
        : `Welcome back, ${userObj.name}! Signed in successfully.`
    );
    setTimeout(() => setToast(null), 3500);
    handleNavigateHome();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('atomy_current_user');
    } catch {}
    setToast('Signed out successfully.');
    setTimeout(() => setToast(null), 2500);
  };

  // Auth requirement notification & redirect
  const requireAuth = (actionMessage = 'sign in or sign up') => {
    setToast(`Please ${actionMessage} to continue.`);
    setTimeout(() => setToast(null), 3200);
    handleNavigateSignIn();
    return false;
  };

  const handleToggleFavorite = (product) => {
    if (!currentUser) return requireAuth('sign in to save products to your wishlist');
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        setToast(`Removed ${product.name} from Favorites`);
        setTimeout(() => setToast(null), 2000);
        return prev.filter((p) => p.id !== product.id);
      } else {
        setToast(`Added ${product.name} to Favorites!`);
        setTimeout(() => setToast(null), 2000);
        return [...prev, product];
      }
    });
  };

  const handleNavigateFavorites = () => {
    if (!currentUser) return requireAuth('sign in to view your wishlist');
    navigateTo('favorites');
  };

  const handleNavigateOrders = () => {
    if (!currentUser) return requireAuth('sign in to view your order history');
    navigateTo('orders');
  };

  const handleNavigateProfile = () => {
    if (!currentUser) return requireAuth('sign in to access your profile settings');
    navigateTo('profile');
  };

  const handleNavigateContact = () => navigateTo('contact');
  const handleNavigateOrderSheet = () => {
    if (!currentUser) return requireAuth('sign in to proceed to checkout and payment');
    setIsCartOpen(false);
    navigateTo('order-sheet');
  };
  const handleOpenRecentlyViewed = () => setIsRecentlyViewedOpen(true);
  const handleNavigateQuickOrder = () => {
    if (!currentUser) return requireAuth('sign in to place quick orders');
    navigateTo('quick-order');
  };
  const handleSelectCategory = (catId) => navigateTo('category', { categoryId: catId });
  const handleNavigateHome = () => navigateTo('home');
  const handleNavigateView = (viewName) => navigateTo(viewName);
  const handleNavigateSignIn = (mode = 'signin') => {
    setAuthMode(mode);
    navigateTo('signin', { authMode: mode });
  };
  const handleNavigateCart = () => {
    if (!currentUser) return requireAuth('sign in to view your shopping cart');
    setIsCartOpen(false);
    navigateTo('cart');
  };
  const handleSelectProduct = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 20);
    });
    navigateTo('product', { product });
  };

  // Route access limitation guard: Customers without sign in or sign up can only browse products and prices
  useEffect(() => {
    const protectedViews = ['profile', 'cart', 'order-sheet', 'quick-order', 'favorites', 'orders'];
    if (!currentUser && protectedViews.includes(currentView)) {
      setToast('Please sign in or sign up to access this feature.');
      setTimeout(() => setToast(null), 3200);
      handleNavigateSignIn();
    }
  }, [currentUser, currentView]);

  useEffect(() => {
    const handleOpenCart = () => {
      if (!currentUser) return requireAuth('sign in to view your shopping cart');
      setIsCartOpen(true);
    };
    const handleOpenFavorites = () => handleNavigateFavorites();
    const handleOpenOrders = () => handleNavigateOrders();
    const handleOpenContact = () => handleNavigateContact();
    const handleOpenRecent = () => handleOpenRecentlyViewed();
    const handleOpenQuick = () => handleNavigateQuickOrder();
    const handleOpenNotice = () => handleNavigateView('notice');
    const handleTrackOrder = (e) => {
      if (e.detail?.orderId) {
        setTrackingOrderId(e.detail.orderId);
      }
      setIsTrackingOpen(true);
    };

    window.addEventListener('atomy:open-cart', handleOpenCart);
    window.addEventListener('atomy:open-favorites', handleOpenFavorites);
    window.addEventListener('atomy:open-orders', handleOpenOrders);
    window.addEventListener('atomy:open-contact', handleOpenContact);
    window.addEventListener('atomy:open-recent', handleOpenRecent);
    window.addEventListener('atomy:open-quick-order', handleOpenQuick);
    window.addEventListener('atomy:open-notice', handleOpenNotice);
    window.addEventListener('atomy:track-order', handleTrackOrder);

    return () => {
      window.removeEventListener('atomy:open-cart', handleOpenCart);
      window.removeEventListener('atomy:open-favorites', handleOpenFavorites);
      window.removeEventListener('atomy:open-orders', handleOpenOrders);
      window.removeEventListener('atomy:open-contact', handleOpenContact);
      window.removeEventListener('atomy:open-recent', handleOpenRecent);
      window.removeEventListener('atomy:open-quick-order', handleOpenQuick);
      window.removeEventListener('atomy:open-notice', handleOpenNotice);
      window.removeEventListener('atomy:track-order', handleTrackOrder);
    };
  }, [currentUser]);

  const handleAddToCart = (product, quantity = 1) => {
    if (!currentUser) return requireAuth('sign in or sign up to add items to your cart');
    const addQty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + addQty } : item
        );
      }
      return [...prev, { ...product, qty: addQty }];
    });

    // Show toast
    setToast(`${addQty > 1 ? `${addQty} × ` : ''}${product.name} added to cart!`);
    setTimeout(() => {
      setToast(null);
    }, 2400);
  };

  const handleBuyNow = (product, quantity = 1) => {
    if (!currentUser) return requireAuth('sign in or sign up to order products');
    const buyQty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + buyQty } : item
        );
      }
      return [...prev, { ...product, qty: buyQty }];
    });
    handleNavigateOrderSheet();
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOrderSuccess = (placedOrder) => {
    setCart([]);
    setPlacedOrders((prev) => [placedOrder, ...prev]);
    setToast(`Order ${placedOrder.orderId} placed successfully!`);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  if (currentView === 'signin') {
    return (
      <div className="app-main-layout">
        <SignInPage
          initialMode={authMode}
          onNavigateHome={handleNavigateHome}
          onNavigateBack={handleGoBack}
          onLoginSuccess={handleLoginSuccess}
        />
        {toast && (
          <div className="toast-notification">
            <span className="toast-dot"></span>
            <span>{toast}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-main-layout">
      {/* 1. Header with live cart count, full search autocomplete, and category/home navigation */}
      <Header
        cartCount={totalCartCount}
        favoritesCount={favorites.length}
        onCartClick={() => {
          if (!currentUser) return requireAuth('sign in or sign up to view your cart');
          setIsCartOpen(true);
        }}
        onNavigateCart={handleNavigateCart}
        onNavigateFavorites={handleNavigateFavorites}
        onNavigateOrders={handleNavigateOrders}
        onOpenQuickOrder={handleNavigateQuickOrder}
        onNavigateQuickOrder={handleNavigateQuickOrder}
        onNavigateContact={handleNavigateContact}
        onOpenRecentlyViewed={handleOpenRecentlyViewed}
        onNavigateHome={handleNavigateHome}
        onSelectCategory={handleSelectCategory}
        onNavigateSignIn={handleNavigateSignIn}
        onSelectProduct={handleSelectProduct}
        onNavigateView={handleNavigateView}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateProfile={handleNavigateProfile}
        currentView={currentView}
      />

      {/* Main Page Flow */}
      <main className="main-content">
        {currentView === 'home' ? (
          <>
            {/* 2. Hero Visual Slider (9-slide authentic carousel) */}
            <HeroSlider />

            {/* Shopping Body Section with bounded sticky Floating Toolbar */}
            <div className="shopping-body-wrapper">
              {/* 3. Category Icons Strip */}
              <CategoryBar onSelectCategory={handleSelectCategory} />

              {/* 4. Atomy India Shopping Mall BEST (with tabs & product cards) */}
              <BestProductsSection
                onAddToCart={handleAddToCart}
                onProductClick={handleSelectProduct}
              />

              {/* 5. Atomy India Hair & Body Essential */}
              <HairBodySection
                onAddToCart={handleAddToCart}
                onProductClick={handleSelectProduct}
              />

              {/* 6. Atomy Absolute Skincare set (Brand Showcase + 8 products) */}
              <BrandShowcaseSection
                title="Atomy Absolute Skincare set"
                subtitle="Recapture The Skin of Your Youth"
                bannerImage={ABSOLUTE_SKINCARE_BANNER}
                products={ABSOLUTE_SKINCARE_PRODUCTS}
                onAddToCart={handleAddToCart}
                onProductClick={handleSelectProduct}
              />

              {/* 7. Promotional Wide Banner: User Guide */}
              <div onClick={() => handleNavigateView('guide')} style={{ cursor: 'pointer' }}>
                <PromoBannerStrip
                  image={USER_GUIDE_BANNER}
                  text="User Guide"
                />
              </div>

              {/* 8. Atomy Food Essential (3 items grid) */}
              <FoodEssentialSection
                onAddToCart={handleAddToCart}
                onProductClick={handleSelectProduct}
              />

              {/* 9. Promotional Wide Banner: Resource Material */}
              <div onClick={() => handleNavigateView('hub')} style={{ cursor: 'pointer' }}>
                <PromoBannerStrip
                  image={RESOURCE_MATERIAL_BANNER}
                  text="Resource Material"
                />
              </div>

              {/* 10. Atomy India Health Essential (Brand Showcase + 4 products) */}
              <BrandShowcaseSection
                title="Atomy India Health Essential"
                subtitle="Your Daily Dose of Exceptional Health"
                bannerImage={HEALTH_ESSENTIAL_BANNER}
                products={HEALTH_ESSENTIAL_PRODUCTS}
                onAddToCart={handleAddToCart}
                onProductClick={handleSelectProduct}
              />

              {/* 11. Atomy India GSGS Product */}
              <GsgsSection
                onAddToCart={handleAddToCart}
                onProductClick={handleSelectProduct}
              />

              {/* 12. Notice Strip */}
              <NoticeTicker />
            </div>
          </>
        ) : currentView === 'product' ? (
          /* Product Details Page View for Direct Customer */
          <div className="shopping-body-wrapper product-detail-body-wrapper">
            <ProductDetailPage
              product={selectedProduct || (ALL_CATALOG_PRODUCTS && ALL_CATALOG_PRODUCTS[0])}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
              onSelectCategory={handleSelectCategory}
              onProductClick={handleSelectProduct}
              onNavigateFavorites={handleNavigateFavorites}
              onNavigateOrders={handleNavigateOrders}
              onOpenQuickOrder={handleNavigateQuickOrder}
              onNavigateQuickOrder={handleNavigateQuickOrder}
              onNavigateContact={handleNavigateContact}
              onOpenRecentlyViewed={handleOpenRecentlyViewed}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Notice Strip */}
            <NoticeTicker />
          </div>
        ) : currentView === 'signin' ? (
          /* Customer Sign In / Sign Up Page (No vendor/join us language) */
          <div className="shopping-body-wrapper signin-page-body-wrapper">
            <SignInPage
              initialMode={authMode}
              onNavigateHome={handleNavigateHome}
              onLoginSuccess={handleLoginSuccess}
            />
            <NoticeTicker />
          </div>
        ) : currentView === 'cart' ? (
          /* Full Cart Page View matching https://in.atomy.com/cart/view */
          <div className="shopping-body-wrapper cart-page-body-wrapper">
            <CartPage
              cartItems={cart}
              onUpdateQty={handleUpdateQty}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleNavigateOrderSheet}
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
              onProductClick={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onNavigateSignIn={handleNavigateSignIn}
            />

            {/* Notice Strip */}
            <NoticeTicker />
          </div>
        ) : currentView === 'order-sheet' ? (
          /* Atomy Official Order Sheet & Payment Details Page matching https://in.atomy.com/order/sheet */
          <div className="shopping-body-wrapper order-sheet-body-wrapper">
            <OrderSheetPage
              cartItems={cart}
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
              onNavigateCart={handleNavigateCart}
              onNavigateOrders={handleNavigateOrders}
              onOrderSuccess={handleOrderSuccess}
              onClearCart={() => setCart([])}
              onAddToCart={handleAddToCart}
              onProductClick={handleSelectProduct}
            />

            {/* Notice Strip */}
            <NoticeTicker />
          </div>
        ) : currentView === 'favorites' ? (
          /* Favorites / Wishlist Page View */
          <div className="shopping-body-wrapper favorites-page-body-wrapper">
            <FavoritesPage
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onProductClick={handleSelectProduct}
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
            />

            {/* Notice Strip */}
            <NoticeTicker />
          </div>
        ) : currentView === 'orders' ? (
          /* Order / Delivery History Page View matching https://in.atomy.com/mypage/orderList */
          <div className="shopping-body-wrapper orders-page-body-wrapper">
            <OrderHistoryPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
              onAddToCart={handleAddToCart}
              onProductClick={handleSelectProduct}
              placedOrders={placedOrders}
            />

            {/* Notice Strip */}
            <NoticeTicker />
          </div>
        ) : currentView === 'profile' ? (
          /* Dedicated Customer Profile & Account Management Page */
          <div className="shopping-body-wrapper profile-page-body-wrapper">
            <CustomerProfilePage
              currentUser={currentUser}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                try {
                  localStorage.setItem('atomy_current_user', JSON.stringify(updated));
                } catch {}
              }}
              onLogout={handleLogout}
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
              placedOrders={placedOrders}
              favorites={favorites}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              onProductClick={handleSelectProduct}
              onNavigateCart={handleNavigateCart}
            />

            {/* Notice Strip */}
            <NoticeTicker />
          </div>
        ) : currentView === 'contact' ? (
          /* Contact Us / Centre Map Page View matching https://in.atomy.com/cst/contactUs */
          <div className="shopping-body-wrapper contact-page-body-wrapper">
            <ContactCentrePage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
            />

            {/* Notice Strip */}
            <NoticeTicker />
          </div>
        ) : currentView === 'quick-order' ? (
          /* Dedicated Quick Order Page View for Fast & Bulk Product Entry */
          <div className="shopping-body-wrapper quick-order-body-wrapper">
            <QuickOrderPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
              onAddToCart={handleAddToCart}
              onProceedToOrderSheet={handleNavigateOrderSheet}
              onProductClick={handleSelectProduct}
            />

            {/* Notice Strip */}
            <NoticeTicker />
          </div>
        ) : currentView === 'notice' ? (
          /* Notice & Announcements Page matching in.atomy.com */
          <div className="shopping-body-wrapper notice-page-body-wrapper">
            <NoticePage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
            />
            <NoticeTicker />
          </div>
        ) : currentView === 'compensation' ? (
          /* Compensation Plan Page matching in.atomy.com */
          <div className="shopping-body-wrapper compensation-body-wrapper">
            <CompensationPlanPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
              onNavigateCategory={handleSelectCategory}
            />
            <NoticeTicker />
          </div>
        ) : currentView === 'guide' ? (
          /* User Guide Page matching in.atomy.com/home/guide/userGuide */
          <div className="shopping-body-wrapper guide-page-body-wrapper">
            <GuidePage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
              onNavigateCategory={handleSelectCategory}
              onNavigateSignIn={handleNavigateSignIn}
            />
            <NoticeTicker />
          </div>
        ) : currentView === 'seminars' ? (
          /* Seminars & Success Academy Page matching in.atomy.com */
          <div className="shopping-body-wrapper seminars-body-wrapper">
            <SeminarsPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
            />
            <NoticeTicker />
          </div>
        ) : currentView === 'hub' ? (
          /* AtomyHUB Multimedia & Resource Portal matching in.atomy.com */
          <div className="shopping-body-wrapper hub-page-body-wrapper">
            <AtomyHubPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
              onNavigateCategory={handleSelectCategory}
            />
            <NoticeTicker />
          </div>
        ) : (
          /* Category Landing Page View (matches User's Image 2 and Image 3) */
          <div className="shopping-body-wrapper category-landing-body-wrapper">
            <CategoryPage
              categoryId={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onAddToCart={handleAddToCart}
              onProductClick={handleSelectProduct}
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleGoBack}
            />

            {/* Notice Strip */}
            <NoticeTicker />
          </div>
        )}
      </main>

      {/* Corporate & Compliance Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onViewCartPage={handleNavigateCart}
        onCheckout={handleNavigateOrderSheet}
      />

      {/* Direct Customer Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Customer Order Tracking Modal */}
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setTrackingOrderId('');
        }}
        initialOrderId={trackingOrderId}
      />

      {/* Recently Viewed Products Drawer */}
      <RecentlyViewedDrawer
        isOpen={isRecentlyViewedOpen}
        onClose={() => setIsRecentlyViewedOpen(false)}
        items={recentlyViewed}
        onAddToCart={handleAddToCart}
        onProductClick={handleSelectProduct}
        onClearAll={() => setRecentlyViewed([])}
        onRemoveItem={(id) => setRecentlyViewed((prev) => prev.filter((p) => p.id !== id))}
      />

      {/* Bottom-Right Corner Scroll Navigation Arrows (Top & Bottom) */}
      <FloatingToolbar />

      {/* Bottom-Left Corner New Product Launch / Best Seller Showcase Badge */}
      <NewLaunchBadge
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        currentView={currentView}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <span className="toast-dot"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
