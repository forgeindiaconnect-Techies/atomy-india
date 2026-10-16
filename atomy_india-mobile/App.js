import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
  BackHandler,
  PanResponder,
  Linking,
  Animated,
  Platform,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/constants/theme';
import Header from './src/components/Header/Header';
import HeroBannerCarousel from './src/components/Banner/HeroBannerCarousel';
import CategoryBar from './src/components/Categories/CategoryBar';
import BestProductsSection from './src/components/LandingSections/BestProductsSection';
import HairBodySection from './src/components/LandingSections/HairBodySection';
import BrandShowcaseSection from './src/components/LandingSections/BrandShowcaseSection';
import PromoBannerStrip from './src/components/LandingSections/PromoBannerStrip';
import FoodEssentialSection from './src/components/LandingSections/FoodEssentialSection';
import GsgsSection from './src/components/LandingSections/GsgsSection';
import NoticeTicker from './src/components/LandingSections/NoticeTicker';
import AtomyFooter from './src/components/Navigation/AtomyFooter';
import LandingProductCard from './src/components/Products/LandingProductCard';
import BottomNavBar from './src/components/Navigation/BottomNavBar';
import CategoryDrawerModal from './src/components/Menu/CategoryDrawerModal';
import MembershipModal from './src/components/Menu/MembershipModal';
import CartPage from './src/components/Cart/CartPage';
import CategoryPage from './src/components/Categories/CategoryPage';
import PaymentSummaryPage from './src/components/OrderSheet/PaymentSummaryPage';
import ProductDetailPage from './src/components/ProductDetail/ProductDetailPage';
import FavoritesPage from './src/components/Favorites/FavoritesPage';
import ProfilePage from './src/components/Profile/ProfilePage';
import MembershipPage from './src/components/Membership/MembershipPage';
import AboutUsPage from './src/components/AboutUs/AboutUsPage';
import CustomerSupportPage from './src/components/AboutUs/CustomerSupportPage';
import FindCentrePage from './src/components/FindCentre/FindCentrePage';
import FaqPage from './src/components/Faq/FaqPage';
import NoticePage from './src/components/Notice/NoticePage';
import OrderDeliveryPage from './src/components/Orders/OrderDeliveryPage';
import QuickOrderPage from './src/components/QuickOrder/QuickOrderPage';
import CompensationPlanPage from './src/components/Compensation/CompensationPlanPage';
import GuidePage from './src/components/Guide/GuidePage';
import SeminarsPage from './src/components/Seminars/SeminarsPage';
import AtomyHubPage from './src/components/AtomyHub/AtomyHubPage';
import FloatingAdModal from './src/components/Promotions/FloatingAdModal';
import SignInPage from './src/components/Auth/SignInPage';
import SearchPage from './src/components/Search/SearchPage';
import RecentlyViewedModal from './src/components/RecentlyViewed/RecentlyViewedModal';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from './src/services/pushNotificationService';
import { OFFICIAL_DISTRIBUTOR_PRICES } from './src/data/officialDistributorPrices';
import {
  createOrderApi,
  fetchOrderHistoryApi,
  joinMembershipApi,
  fetchLiveProducts,
  fetchMembershipStatusApi,
  fetchFloatingAdConfigApi,
} from './src/services/api';
import {
  ALL_PRODUCTS,
  HERO_SLIDES,
  ABSOLUTE_SKINCARE_BANNER,
  ABSOLUTE_SKINCARE_PRODUCTS,
  USER_GUIDE_BANNER,
  RESOURCE_MATERIAL_BANNER,
  HEALTH_ESSENTIAL_BANNER,
  HEALTH_ESSENTIAL_PRODUCTS,
} from './src/data/mockData';

// Guest User template (empty/logged-out state)
const GUEST_USER = {
  name: 'Guest User',
  email: '',
  phone: '',
  gender: '',
  dob: '',
  memberId: '',
  address: '',
};

// Persistent session loaders (ensures logout persists across refreshes)
const loadInitialUser = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const isLoggedOut = window.localStorage.getItem('atomy_user_logged_out');
      if (isLoggedOut === 'true') {
        return GUEST_USER;
      }
      const savedUser = window.localStorage.getItem('atomy_user_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name && parsed.name !== 'Guest User') {
          return parsed;
        }
      }
    }
  } catch (e) {}
  return GUEST_USER;
};

const loadInitialIsMember = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const isLoggedOut = window.localStorage.getItem('atomy_user_logged_out');
      if (isLoggedOut === 'true') {
        return false;
      }
      const savedMember = window.localStorage.getItem('atomy_is_member');
      if (savedMember !== null) {
        return savedMember === 'true';
      }
    }
  } catch (e) {}
  return false;
};

const loadInitialRecentlyViewed = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Clear legacy hardcoded demo data once if present
      const demoCleared = window.localStorage.getItem('atomy_mobile_rv_demo_cleared');
      if (!demoCleared) {
        window.localStorage.setItem('atomy_mobile_rv_demo_cleared', 'true');
        window.localStorage.removeItem('atomy_mobile_recently_viewed');
        return [];
      }
      const saved = window.localStorage.getItem('atomy_mobile_recently_viewed');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (e) {}
  return [];
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'cart' | 'payment_summary' | 'product_detail'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [activeSubTab, setActiveSubTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMember, setIsMember] = useState(loadInitialIsMember);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(loadInitialRecentlyViewed);
  const [isRecentlyViewedModalOpen, setIsRecentlyViewedModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(loadInitialUser);
  const [authNotice, setAuthNotice] = useState(null);
  const [authInitialMode, setAuthInitialMode] = useState('signin');
  const [placedOrders, setPlacedOrders] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [pendingOrderAction, setPendingOrderAction] = useState(null);

  // Recently Viewed product recorder & storage persistence
  const recordRecentlyViewed = (product) => {
    if (!product || !product.id) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== product.id);
      const nextList = [product, ...filtered].slice(0, 20);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('atomy_mobile_recently_viewed', JSON.stringify(nextList));
        }
      } catch (e) {}
      return nextList;
    });
  };

  const handleClearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('atomy_mobile_recently_viewed');
      }
    } catch (e) {}
    showToast('Cleared recently viewed products');
  };

  const handleRemoveRecentlyViewedItem = (productId) => {
    setRecentlyViewed((prev) => {
      const nextList = prev.filter((item) => item.id !== productId);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('atomy_mobile_recently_viewed', JSON.stringify(nextList));
        }
      } catch (e) {}
      return nextList;
    });
  };

  // User Logged In status checker
  const isUserLoggedIn = Boolean(
    currentUser &&
    currentUser.email &&
    currentUser.email.trim() !== '' &&
    currentUser.name !== 'Guest User'
  );

  // Hide bottom navigation bar while scrolling down on the Home page, show on scroll up
  const bottomBarAnim = useRef(new Animated.Value(0)).current; // 0: visible, 1: hidden
  const isBottomBarVisibleRef = useRef(true);
  const lastScrollY = useRef(0);

  const handleHomeScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Scrolling down: hide bottom bar smoothly (0.5s duration)
    if (diff > 6 && currentY > 30 && isBottomBarVisibleRef.current) {
      isBottomBarVisibleRef.current = false;
      bottomBarAnim.stopAnimation();
      Animated.timing(bottomBarAnim, {
        toValue: 1, // hidden
        duration: 500, // 0.5 sec time lap
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();
    }
    // Scrolling up (any upward movement) or near top: smoothly appear (0.5s duration)
    else if ((diff < -5 || currentY <= 15) && !isBottomBarVisibleRef.current) {
      isBottomBarVisibleRef.current = true;
      bottomBarAnim.stopAnimation();
      Animated.timing(bottomBarAnim, {
        toValue: 0, // visible
        duration: 500, // 0.5 sec time lap
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();
    }

    lastScrollY.current = currentY;
  };

  // Reset bottom bar visibility when switching screens or tabs
  useEffect(() => {
    isBottomBarVisibleRef.current = true;
    bottomBarAnim.setValue(0);
    lastScrollY.current = 0;
  }, [currentScreen, activeBottomTab]);

  // Floating Landing Ad states & session suppression
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isAdCancelledThisSession, setIsAdCancelledThisSession] = useState(false);
  const [adConfig, setAdConfig] = useState(null);

  const STORAGE_KEY_AD_DO_NOT_SHOW = 'atomy_mobile_ad_do_not_show_today';

  const isAdSuppressedForToday = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const today = new Date().toISOString().split('T')[0];
        const saved = window.localStorage.getItem(STORAGE_KEY_AD_DO_NOT_SHOW);
        return saved === today;
      }
    } catch (e) {}
    return false;
  };

  const setAdSuppressedForToday = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const today = new Date().toISOString().split('T')[0];
        window.localStorage.setItem(STORAGE_KEY_AD_DO_NOT_SHOW, today);
      }
    } catch (e) {}
  };

  // Once cancelled, it doesn't show up again until they remain in the app
  const handleCloseAd = (doNotShowToday) => {
    setIsAdOpen(false);
    setIsAdCancelledThisSession(true);
    if (doNotShowToday) {
      setAdSuppressedForToday();
    }
  };

  // Fetch live ad directly from MySQL backend/admin and open on landing
  useEffect(() => {
    let timer;
    async function initFloatingAd() {
      try {
        const remote = await fetchFloatingAdConfigApi();
        if (remote) {
          setAdConfig(remote);
        }
        if (remote?.isActive !== false && !isAdCancelledThisSession && !isAdSuppressedForToday()) {
          timer = setTimeout(() => {
            setIsAdOpen(true);
          }, 350);
        }
      } catch (err) {
        if (!isAdCancelledThisSession && !isAdSuppressedForToday()) {
          timer = setTimeout(() => {
            setIsAdOpen(true);
          }, 350);
        }
      }
    }
    initFloatingAd();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Register Push Notifications (FCM) & Attach Foreground / Tap Listeners
  useEffect(() => {
    let removeListeners = null;

    async function initPush() {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          console.log('[App] Push token registered successfully:', token);
        }
      } catch (e) {
        console.log('[App] Push registration skipped or unsupported:', e?.message);
      }
    }

    initPush();

    removeListeners = setupNotificationListeners(
      (notification) => {
        const title = notification?.request?.content?.title || 'Atomy India';
        const body = notification?.request?.content?.body || '';
        setToastMessage(`${title}: ${body}`);
        setTimeout(() => setToastMessage(null), 4500);
      },
      (response) => {
        console.log('[App] Notification clicked by user:', response);
      }
    );

    return () => {
      if (typeof removeListeners === 'function') {
        removeListeners();
      }
    };
  }, []);

  // Live Sync with Spring Boot Backend & MySQL Database (Port 8085)
  useEffect(() => {
    async function loadLiveBackendData() {
      if (!currentUser?.email) return;

      // 1. Sync Membership status with Admin & MySQL
      try {
        const memData = await fetchMembershipStatusApi(currentUser.email);
        if (memData && typeof memData.isMember === 'boolean') {
          setIsMember(memData.isMember);
        }
      } catch (e) {
        console.warn('Membership sync error:', e);
      }

      // 2. Sync Placed Orders with Admin & MySQL
      try {
        const remoteOrders = await fetchOrderHistoryApi(currentUser.email);
        if (Array.isArray(remoteOrders) && remoteOrders.length > 0) {
          const mapStatus = (st) => {
            const raw = (st || '').toUpperCase();
            if (raw.includes('DELIVER')) return 'Delivered';
            if (raw.includes('OUT')) return 'Out for Delivery';
            if (raw.includes('TRANSIT') || raw.includes('SHIPPED') || raw.includes('DISPATCH')) return 'In Transit';
            if (raw.includes('PREPAR') || raw.includes('PACK')) return 'Preparing';
            return 'Processing';
          };

          const formatted = remoteOrders.map((o) => ({
            id: o.orderId,
            date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            status: mapStatus(o.orderStatus),
            itemsCount: o.items ? o.items.length : 1,
            total: `₹ ${Number(o.totalAmount || 0).toLocaleString('en-IN')}`,
            pv: `${(o.items || []).reduce((acc, i) => acc + (i.pv || 0), 0).toLocaleString('en-IN')} PV`,
            title: (o.items || []).map((i) => i.productName || i.productId).join(' + ') || 'Atomy Products',
            shippingAddress: o.shippingAddress ? `${o.shippingAddress}, ${o.city || ''} ${o.pincode || ''}` : '',
            awb: o.trackingNumber || `ATMY-${(o.orderId || '').replace(/[^0-9]/g, '')}`,
            courier: 'Blue Dart Express',
            eta: 'Within 48 Hours',
            trackStatus: `Order ${o.orderStatus} • Synced with Central Database`,
            items: (o.items || []).map((i) => ({
              id: i.productId,
              name: i.productName || i.productId,
              price: i.price,
              qty: i.quantity,
              img: i.productImage || 'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg',
            })),
          }));
          setPlacedOrders(formatted);
        }
      } catch (e) {
        console.warn('Orders sync error:', e);
      }
    }
    loadLiveBackendData();
  }, [currentUser?.email]);

  // Quick Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const [navHistory, setNavHistory] = useState([]);

  // Screens strictly permitted for unauthenticated guests:
  // "they can view only the product in the home page and the category pages and also the product detail pages and home bar pages that's all"
  const PUBLIC_ALLOWED_SCREENS = [
    'home',
    'product_detail',
    'search',
    'notice',
    'compensation',
    'guide',
    'seminars',
    'hub',
    'company',
    'about',
  ];

  // Stack-based screen navigation with state preservation
  const navigateTo = (screenName, extra = {}) => {
    if (screenName === 'company' || screenName === 'about') {
      Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000');
      return;
    }

    // Access control rule: unauthenticated guests can only view public catalog & home pages
    if (!isUserLoggedIn && !PUBLIC_ALLOWED_SCREENS.includes(screenName)) {
      if (screenName === 'profile') {
        setCurrentScreen('profile');
        setActiveBottomTab('profile');
        setSelectedCategory(null);
        return;
      }

      let label = 'this section';
      if (screenName === 'cart') label = 'your Cart';
      else if (screenName === 'favorites') label = 'your Favorites';
      else if (screenName === 'quick_order') label = 'Quick Order';
      else if (screenName === 'order_delivery') label = 'Order & Delivery Tracking';
      else if (['customer_support', 'find_centre', 'faq', 'about_us'].includes(screenName)) label = 'Customer Support';
      else if (screenName === 'membership') label = 'Distributor Membership';
      else if (screenName === 'payment_summary') label = 'Checkout';

      showToast(`Please sign in to access ${label}`);
      setAuthNotice(`Sign in required to access ${label}`);
      setAuthInitialMode('signin');
      setCurrentScreen('profile');
      setActiveBottomTab('profile');
      setSelectedCategory(null);
      setIsCategoryModalOpen(false);
      return;
    }

    if (screenName === currentScreen && !extra.product) return;
    setNavHistory((prev) => [
      ...prev,
      {
        screen: currentScreen,
        product: selectedProduct,
        category: selectedCategory,
        activeBottomTab: activeBottomTab,
      },
    ]);
    setCurrentScreen(screenName);
    if (extra.product !== undefined) {
      setSelectedProduct(extra.product);
    }
    if (extra.category !== undefined) {
      setSelectedCategory(extra.category);
    }
    setIsCategoryModalOpen(false);
    setIsMembershipModalOpen(false);
    if (['home', 'favorites', 'profile'].includes(screenName)) {
      setActiveBottomTab(screenName);
    } else {
      setActiveBottomTab(null);
    }
  };

  // Stack-based Back navigation (restores previous screen and its exact state)
  const handleNavigateBack = () => {
    if (isCategoryModalOpen) {
      setIsCategoryModalOpen(false);
      return true;
    }
    if (isMembershipModalOpen) {
      setIsMembershipModalOpen(false);
      return true;
    }

    let handled = false;
    setNavHistory((prev) => {
      if (prev.length === 0) {
        if (currentScreen !== 'home') {
          setCurrentScreen('home');
          setActiveBottomTab('home');
          setSelectedProduct(null);
          setSelectedCategory(null);
          handled = true;
        }
        return [];
      }

      handled = true;
      const nextHistory = [...prev];
      const prevEntry = nextHistory.pop();

      const prevScreen =
        typeof prevEntry === 'string' ? prevEntry : prevEntry?.screen || 'home';
      setCurrentScreen(prevScreen);

      if (prevEntry && typeof prevEntry === 'object') {
        if (prevEntry.product !== undefined) {
          setSelectedProduct(prevEntry.product);
        } else if (prevScreen !== 'product_detail') {
          setSelectedProduct(null);
        }

        if (prevEntry.category !== undefined) {
          setSelectedCategory(prevEntry.category);
        }

        if (prevEntry.activeBottomTab !== undefined) {
          setActiveBottomTab(prevEntry.activeBottomTab);
        } else if (['home', 'favorites', 'profile'].includes(prevScreen)) {
          setActiveBottomTab(prevScreen);
        } else {
          setActiveBottomTab(null);
        }
      } else {
        if (prevScreen !== 'product_detail') {
          setSelectedProduct(null);
        }
        if (['home', 'favorites', 'profile'].includes(prevScreen)) {
          setActiveBottomTab(prevScreen);
        } else {
          setActiveBottomTab(null);
        }
      }

      return nextHistory;
    });

    return handled;
  };

  // Return directly to Home screen and reset navigation stack
  const handleNavigateHome = () => {
    setNavHistory([]);
    setCurrentScreen('home');
    setActiveBottomTab('home');
    setSelectedCategory(null);
    setSelectedProduct(null);
    setIsCategoryModalOpen(false);
    setIsMembershipModalOpen(false);
  };

  // User Logout handler (Clears active session, persists logout to localStorage, resets membership, cart & favorites)
  const handleUserLogout = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('atomy_user_session');
        window.localStorage.setItem('atomy_user_logged_out', 'true');
        window.localStorage.setItem('atomy_is_member', 'false');
      }
    } catch (e) {}
    setCurrentUser(GUEST_USER);
    setIsMember(false);
    setCart([]);
    setFavorites([]);
    setPlacedOrders([]);
    showToast('Logged out of Atomy successfully');
    setAuthNotice(null);
    handleNavigateHome();
  };

  // User Profile Update handler (Persists to session storage)
  const handleUpdateUser = (updated) => {
    setCurrentUser(updated);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('atomy_user_session', JSON.stringify(updated));
        window.localStorage.removeItem('atomy_user_logged_out');
      }
    } catch (e) {}
  };

  // Auth Success Handler: updates user, live syncs membership, resumes pending orders
  const handleAuthSuccess = async (user) => {
    setAuthNotice(null);
    handleUpdateUser(user);
    showToast(`Welcome back, ${user.name}!`);

    // Live sync membership status
    try {
      const memData = await fetchMembershipStatusApi(user.email);
      if (memData && typeof memData.isMember === 'boolean') {
        setIsMember(memData.isMember);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('atomy_is_member', memData.isMember ? 'true' : 'false');
        }
      } else if (user.isMember) {
        setIsMember(true);
      }
    } catch (e) {
      if (user.isMember) setIsMember(true);
    }

    // Automatically resume pending order if user attempted to order before signing in!
    if (pendingOrderAction) {
      const action = pendingOrderAction;
      setPendingOrderAction(null);
      if (action.type === 'checkout' || action.type === 'buynow') {
        setCheckoutItems(action.items);
        navigateTo('payment_summary');
        showToast('Proceeding to order checkout...');
      }
    }
  };

  // Open Product Detail Page handler (pushes current screen to history & records to recently viewed)
  const handleOpenProductDetail = (product) => {
    if (!product) return;
    recordRecentlyViewed(product);
    navigateTo('product_detail', { product });
  };

  // Add to cart handler
  const handleAddToCart = (product) => {
    const official = product?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[product.id] : null;
    const rawPrice = Number(product.price) || (official ? official.dpPrice : 1000);
    let dpPrice = Number(product.dpPrice || (official ? official.dpPrice : 0));
    if (!dpPrice || dpPrice >= rawPrice) {
      dpPrice = Math.round(rawPrice * 0.85);
    }
    const pv = Number(product.pv || (official ? official.pv : 0)) || Math.round(rawPrice * 4.5);
    let mrp = Number(product.originalPrice) || Number(product.mrp);
    if (!mrp || mrp <= rawPrice) {
      mrp = official?.mrp || Math.round(rawPrice * 1.18);
    }
    const enrichedProduct = {
      ...product,
      price: rawPrice,
      dpPrice,
      pv,
      originalPrice: mrp,
      image: product.image || product.img,
    };

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          ...enrichedProduct,
          qty: 1,
        },
      ];
    });
    showToast(`Added "${product.name}" to Cart!`);
  };

  // Update cart item quantity
  const handleUpdateQty = (productId, newQty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, qty: Math.max(1, newQty) } : item
      )
    );
  };

  // Remove item from cart
  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    showToast('Removed item from Cart');
  };

  // Place order checkout handler - opens full Payment Summary page or prompts sign-in
  const handleCheckout = (selectedItems) => {
    if (!selectedItems || selectedItems.length === 0) {
      showToast('Please select items to proceed to checkout');
      return;
    }
    if (!isUserLoggedIn) {
      setPendingOrderAction({ type: 'checkout', items: selectedItems });
      setAuthNotice('Please sign in or register to place your order with Atomy India.');
      setAuthInitialMode('signin');
      navigateTo('signin');
      return;
    }
    setCheckoutItems(selectedItems);
    navigateTo('payment_summary');
  };

  // Refs to allow PanResponder callbacks to always have latest state without recreation
  const currentScreenRef = useRef(currentScreen);
  const navHistoryRef = useRef(navHistory);
  useEffect(() => {
    currentScreenRef.current = currentScreen;
    navHistoryRef.current = navHistory;
  }, [currentScreen, navHistory]);

  // Mobile in-built back button listener (Android Hardware / System Back button)
  useEffect(() => {
    const onBackPress = () => {
      if (isCategoryModalOpen) {
        setIsCategoryModalOpen(false);
        return true;
      }
      if (isMembershipModalOpen) {
        setIsMembershipModalOpen(false);
        return true;
      }
      if (currentScreen !== 'home' || navHistory.length > 0) {
        return handleNavigateBack();
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, [currentScreen, navHistory, isCategoryModalOpen, isMembershipModalOpen]);

  // Global mobile edge swipe-back gesture responder (swiping from left screen edge towards right)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isFromLeftEdge = evt.nativeEvent.pageX <= 55;
        const isSwipingRight =
          gestureState.dx > 20 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        const canGoBack =
          currentScreenRef.current !== 'home' || navHistoryRef.current.length > 0;
        return isFromLeftEdge && isSwipingRight && canGoBack;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 60 || gestureState.vx > 0.4) {
          handleNavigateBack();
        }
      },
    })
  ).current;

  // Toggle favorite handler
  const handleToggleFavorite = (product) => {
    setFavorites((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast('Removed from Favorites');
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Added "${product.name}" to Favorites!`);
        return [...prev, product.id];
      }
    });
  };

  // Handle bottom navigation tab press
  const handleTabPress = (tabId) => {
    if (tabId === 'home') {
      handleNavigateHome();
    } else if (tabId === 'menu') {
      setIsCategoryModalOpen(true);
    } else if (tabId === 'recent') {
      setIsRecentlyViewedModalOpen(true);
    } else if (tabId === 'favorites') {
      if (!isUserLoggedIn) {
        showToast('Please sign in to access your Favorites');
        setAuthNotice('Sign in required to access your Favorites');
        setAuthInitialMode('signin');
        setCurrentScreen('profile');
        setActiveBottomTab('profile');
        setSelectedCategory(null);
        return;
      }
      navigateTo('favorites');
      setSelectedCategory(null);
    } else if (tabId === 'profile') {
      setAuthNotice(null);
      setAuthInitialMode('signin');
      navigateTo('profile');
      setSelectedCategory(null);
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <SafeAreaProvider>
      <View style={styles.rootContainer} {...panResponder.panHandlers}>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        {/* Top Safe Area matching view context */}
        <SafeAreaView
          edges={['top']}
          style={
            currentScreen === 'cart' || (currentScreen === 'profile' && !isUserLoggedIn)
              ? styles.topSafeAreaCart
              : styles.topSafeArea
          }
        />

        {currentScreen === 'product_detail' && selectedProduct ? (
          /* PRODUCT DETAIL PAGE (Authentic Official Product Details) */
          <ProductDetailPage
            product={selectedProduct}
            isMember={isMember}
            isFavorite={favorites.includes(selectedProduct.id)}
            cartCount={totalCartCount}
            onNavigateBack={handleNavigateBack}
            onNavigateCart={() => navigateTo('cart')}
            onAddToCart={(prod, quantity = 1) => {
              for (let i = 0; i < quantity; i++) {
                handleAddToCart(prod);
              }
            }}
            onBuyNow={(prod, quantity = 1) => {
              const official = prod?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[prod.id] : null;
              const rawPrice = Number(prod.price) || (official ? official.dpPrice : 1000);
              let dpPrice = Number(prod.dpPrice || (official ? official.dpPrice : 0));
              if (!dpPrice || dpPrice >= rawPrice) {
                dpPrice = Math.round(rawPrice * 0.85);
              }
              const item = {
                ...prod,
                price: rawPrice,
                dpPrice,
                pv: Number(prod.pv || (official ? official.pv : 0)) || Math.round(rawPrice * 4.5),
                image: prod.image || prod.img,
                qty: quantity || 1,
              };
              if (!isUserLoggedIn) {
                setPendingOrderAction({ type: 'buynow', items: [item] });
                setAuthNotice('Please sign in or register to place your order with Atomy India.');
                setAuthInitialMode('signin');
                navigateTo('signin');
                return;
              }
              setCheckoutItems([item]);
              navigateTo('payment_summary');
            }}
            onToggleFavorite={handleToggleFavorite}
            onJoinMemberPress={() => navigateTo('membership')}
            favorites={favorites}
            onSelectRelatedProduct={(prod) =>
              navigateTo('product_detail', { product: prod })
            }
          />
        ) : currentScreen === 'payment_summary' ? (
          /* PAYMENT SUMMARY & ORDER SHEET (Matching Authentic Website View) */
          <PaymentSummaryPage
            checkoutItems={checkoutItems}
            isMember={isMember}
            currentUser={currentUser}
            onRequestSignIn={() => {
              setAuthNotice('Please sign in or register to complete your order.');
              setAuthInitialMode('signin');
              navigateTo('signin');
            }}
            onNavigateBack={handleNavigateBack}
            onNavigateHome={handleNavigateHome}
            onUpdateQty={(productId, newQty) => {
              handleUpdateQty(productId, newQty);
              setCheckoutItems((prev) =>
                prev.map((item) =>
                  item.id === productId ? { ...item, qty: newQty } : item
                )
              );
            }}
            onRemoveItem={(productId) => {
              handleRemoveFromCart(productId);
              setCheckoutItems((prev) =>
                prev.filter((item) => item.id !== productId)
              );
              if (checkoutItems.length <= 1) {
                handleNavigateBack();
              }
            }}
            onOrderSuccess={async (orderDetails) => {
              const purchasedIds = checkoutItems.map((i) => i.id);
              setCart((prev) => prev.filter((i) => !purchasedIds.includes(i.id)));

              // Prepare database order payload
              const orderPayload = {
                customerName: currentUser.name,
                customerEmail: currentUser.email,
                customerPhone: currentUser.phone,
                shippingAddress: currentUser.address,
                city: 'Gurugram',
                state: 'Haryana',
                pincode: '122003',
                paymentMethod: 'ONLINE_UPI',
                items: checkoutItems.map((item) => ({
                  productId: item.id,
                  quantity: item.qty || 1,
                })),
              };

              // Send order to live Spring Boot backend & MySQL database
              const res = await createOrderApi(orderPayload);
              const realOrderId = res.success ? res.order.orderId : `AT-${Math.floor(10000 + Math.random() * 90000)}`;

              const newOrder = {
                id: realOrderId,
                date: new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }),
                status: 'Processing',
                itemsCount: checkoutItems.length,
                total: orderDetails?.totalFormatted || '₹ 0.00',
                pv: orderDetails?.pvFormatted || '0 PV',
                title: checkoutItems.map((i) => i.name).join(' + '),
                trackStatus: 'Order confirmed • Synced with Admin Database',
              };
              setPlacedOrders((prev) => [newOrder, ...prev]);
              showToast('Order Placed & Synced with Database! 🎉');
            }}
            onProductClick={handleOpenProductDetail}
          />
        ) : currentScreen === 'cart' ? (
          /* CART PAGE (Matching Authentic Website View) */
          <CartPage
            cartItems={cart}
            isMember={isMember}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
            onNavigateHome={handleNavigateHome}
            onNavigateBack={handleNavigateBack}
            onProductClick={handleOpenProductDetail}
            onAddToCart={handleAddToCart}
            onOpenMembershipModal={() => navigateTo('membership')}
          />
        ) : currentScreen === 'search' ? (
          /* DEDICATED SEARCH PAGE (Popular & Recent Searches + Live Results) */
          <>
            <SearchPage
              isMember={isMember}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={handleAddToCart}
              onProductClick={handleOpenProductDetail}
              onNavigateBack={handleNavigateBack}
              onNavigateHome={handleNavigateHome}
              onCartPress={() => navigateTo('cart')}
              cartCount={totalCartCount}
              onJoinMemberPress={() => navigateTo('membership')}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'favorites' ? (
          /* FAVORITES PAGE (Matching Authentic Website View) */
          <>
            <FavoritesPage
              favoriteIds={favorites}
              isMember={isMember}
              cartCount={totalCartCount}
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onNavigateCart={() => navigateTo('cart')}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={handleAddToCart}
              onBuyNow={(prod) => {
                const official = prod?.id && OFFICIAL_DISTRIBUTOR_PRICES ? OFFICIAL_DISTRIBUTOR_PRICES[prod.id] : null;
                const rawPrice = Number(prod.price) || (official ? official.dpPrice : 1000);
                let dpPrice = Number(prod.dpPrice || (official ? official.dpPrice : 0));
                if (!dpPrice || dpPrice >= rawPrice) {
                  dpPrice = Math.round(rawPrice * 0.85);
                }
                const item = {
                  ...prod,
                  price: rawPrice,
                  dpPrice,
                  pv: Number(prod.pv || (official ? official.pv : 0)) || Math.round(rawPrice * 4.5),
                  image: prod.image || prod.img,
                  qty: 1,
                };
                if (!isUserLoggedIn) {
                  setPendingOrderAction({ type: 'buynow', items: [item] });
                  setAuthNotice('Please sign in or register to place your order with Atomy India.');
                  setAuthInitialMode('signin');
                  navigateTo('signin');
                  return;
                }
                setCheckoutItems([item]);
                navigateTo('payment_summary');
              }}
              onProductClick={handleOpenProductDetail}
            />
            <BottomNavBar
              activeTab={activeBottomTab || 'favorites'}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'profile' || currentScreen === 'signin' ? (
          /* PROFILE / SIGN IN SCREEN: Displays SignInPage if not logged in, ProfilePage if logged in */
          <>
            {isUserLoggedIn && currentScreen === 'profile' ? (
              <ProfilePage
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
                placedOrders={placedOrders}
                isMember={isMember}
                favoritesCount={favorites.length}
                cartCount={totalCartCount}
                onNavigateHome={handleNavigateHome}
                onNavigateBack={handleNavigateBack}
                onNavigateCart={() => navigateTo('cart')}
                onNavigateFavorites={() => navigateTo('favorites')}
                onNavigateMembership={() => navigateTo('membership')}
                onLogOut={handleUserLogout}
                onNavigateSignIn={() => {
                  setAuthNotice(null);
                  setAuthInitialMode('signin');
                  navigateTo('signin');
                }}
                onOpenAuthModal={() => {
                  setAuthNotice(null);
                  setAuthInitialMode('signin');
                  navigateTo('signin');
                }}
              />
            ) : (
              <SignInPage
                noticeMessage={authNotice}
                initialMode={authInitialMode}
                onNavigateHome={handleNavigateHome}
                onNavigateBack={handleNavigateBack}
                onAuthSuccess={handleAuthSuccess}
              />
            )}
            <BottomNavBar
              activeTab={currentScreen === 'profile' ? 'profile' : null}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
              recentlyViewedCount={recentlyViewed.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'membership' ? (
          /* OFFICIAL MEMBERSHIP PAGE (Matching Authentic Website View) */
          <MembershipPage
            isMember={isMember}
            onNavigateHome={handleNavigateHome}
            onNavigateBack={handleNavigateBack}
            onMembershipActivated={async (member) => {
              setIsMember(true);
              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.setItem('atomy_is_member', 'true');
                  window.localStorage.removeItem('atomy_user_logged_out');
                }
              } catch (e) {}
              // Sync membership to live MySQL database
              await joinMembershipApi({
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone,
                plan: member?.plan || 'ANNUAL',
                amountPaid: member?.plan === 'MONTHLY' ? 299 : 2499,
              });
              showToast('Official Distributor Membership Activated & Synced with Database! 🎉');
              handleNavigateHome();
            }}
            onMembershipCancelled={() => {
              setIsMember(false);
              showToast('Distributor Membership Cancelled');
            }}
          />
        ) : currentScreen === 'about_us' ? (
          /* ABOUT US & SUPPORT (Matching Authentic Website View) */
          <>
            <AboutUsPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onNavigateFaq={() => navigateTo('faq')}
              onNavigateFindCentre={() => navigateTo('find_centre')}
              onNavigateCompany={() => Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000')}
              onNavigateNotice={() => navigateTo('notice')}
              onCartPress={() => navigateTo('cart')}
              cartCount={totalCartCount}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'customer_support' ? (
          /* CUSTOMER SUPPORT / HAPPINESS CENTER */
          <>
            <CustomerSupportPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onNavigateFaq={() => navigateTo('faq')}
              onNavigateFindCentre={() => navigateTo('find_centre')}
              onNavigateCompany={() => Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000')}
              onNavigateNotice={() => navigateTo('notice')}
              onCartPress={() => navigateTo('cart')}
              cartCount={totalCartCount}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'find_centre' ? (
          /* FIND CENTRE (Matching Authentic Website View) */
          <>
            <FindCentrePage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onCartPress={() => navigateTo('cart')}
              cartCount={totalCartCount}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'faq' ? (
          /* FAQ DIRECTORY (Matching Authentic Website View) */
          <>
            <FaqPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onNavigateAboutUs={() => navigateTo('about_us')}
              onCartPress={() => navigateTo('cart')}
              cartCount={totalCartCount}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'notice' ? (
          /* NOTICES & ANNOUNCEMENTS (Matching Authentic Website View) */
          <>
            <Header
              cartCount={totalCartCount}
              onCartPress={() => navigateTo('cart')}
              onSearchSubmit={(q) => showToast(`Searching for "${q}"`)}
              onSearchPress={() => navigateTo('search')}
              activeSubTab="notices"
              onSelectSubTab={(id) => {
                setActiveSubTab(id);
                if (id === 'home') {
                  handleNavigateHome();
                } else if (id === 'about') {
                  Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000');
                } else if (id === 'notices') {
                  // already on notice
                } else if (id === 'compensation') {
                  navigateTo('compensation');
                } else if (id === 'guide') {
                  navigateTo('guide');
                } else if (id === 'seminars') {
                  navigateTo('seminars');
                } else if (id === 'hub') {
                  navigateTo('hub');
                } else {
                  showToast(`Switched view to ${id.toUpperCase()}`);
                }
              }}
              onLogoPress={handleNavigateHome}
              onDropdownMenuPress={() => setIsCategoryModalOpen(true)}
            />
            <NoticePage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onCartPress={() => navigateTo('cart')}
              cartCount={totalCartCount}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'order_delivery' ? (
          /* ORDER / DELIVERY TRACKING (Matching Authentic Website View) */
          <>
            <OrderDeliveryPage
              placedOrders={placedOrders}
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onCartPress={() => navigateTo('cart')}
              onProductClick={handleOpenProductDetail}
              cartCount={totalCartCount}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'quick_order' ? (
          /* QUICK ORDER SHEET (Matching Authentic Website View) */
          <>
            <QuickOrderPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onCartPress={() => navigateTo('cart')}
              onAddToCart={handleAddToCart}
              onCheckout={handleCheckout}
              currentUser={currentUser}
              isMember={isMember}
              cartCount={totalCartCount}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'compensation' ? (
          /* COMPENSATION PLAN (Matching Website: Dealership, Commission, Promotion) */
          <>
            <Header
              cartCount={totalCartCount}
              onCartPress={() => navigateTo('cart')}
              onSearchSubmit={(q) => showToast(`Searching for "${q}"`)}
              onSearchPress={() => navigateTo('search')}
              activeSubTab="compensation"
              onSelectSubTab={(id) => {
                setActiveSubTab(id);
                if (id === 'home') {
                  handleNavigateHome();
                } else if (id === 'about') {
                  Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000');
                } else if (id === 'notices') {
                  navigateTo('notice');
                } else if (id === 'compensation') {
                  // already on compensation
                } else if (id === 'guide') {
                  navigateTo('guide');
                } else if (id === 'seminars') {
                  navigateTo('seminars');
                } else if (id === 'hub') {
                  navigateTo('hub');
                } else {
                  showToast(`Switched view to ${id.toUpperCase()}`);
                }
              }}
              onLogoPress={handleNavigateHome}
              onDropdownMenuPress={() => setIsCategoryModalOpen(true)}
            />
            <CompensationPlanPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onCartPress={() => navigateTo('cart')}
              cartCount={totalCartCount}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'guide' ? (
          /* MEMBER GUIDE (Matching Website: Join, Order, Delivery, Return) */
          <>
            <Header
              cartCount={totalCartCount}
              onCartPress={() => navigateTo('cart')}
              onSearchSubmit={(q) => showToast(`Searching for "${q}"`)}
              onSearchPress={() => navigateTo('search')}
              activeSubTab="guide"
              onSelectSubTab={(id) => {
                setActiveSubTab(id);
                if (id === 'home') {
                  handleNavigateHome();
                } else if (id === 'about') {
                  Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000');
                } else if (id === 'notices') {
                  navigateTo('notice');
                } else if (id === 'compensation') {
                  navigateTo('compensation');
                } else if (id === 'guide') {
                  // already on guide
                } else if (id === 'seminars') {
                  navigateTo('seminars');
                } else if (id === 'hub') {
                  navigateTo('hub');
                } else {
                  showToast(`Switched view to ${id.toUpperCase()}`);
                }
              }}
              onLogoPress={handleNavigateHome}
              onDropdownMenuPress={() => setIsCategoryModalOpen(true)}
            />
            <GuidePage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
              onNavigateMembership={() => navigateTo('membership')}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'seminars' ? (
          /* SEMINARS & SUCCESS ACADEMY (Matching Website) */
          <>
            <Header
              cartCount={totalCartCount}
              onCartPress={() => navigateTo('cart')}
              onSearchSubmit={(q) => showToast(`Searching for "${q}"`)}
              onSearchPress={() => navigateTo('search')}
              activeSubTab="seminars"
              onSelectSubTab={(id) => {
                setActiveSubTab(id);
                if (id === 'home') {
                  handleNavigateHome();
                } else if (id === 'about') {
                  Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000');
                } else if (id === 'notices') {
                  navigateTo('notice');
                } else if (id === 'compensation') {
                  navigateTo('compensation');
                } else if (id === 'guide') {
                  navigateTo('guide');
                } else if (id === 'seminars') {
                  // already on seminars
                } else if (id === 'hub') {
                  navigateTo('hub');
                } else {
                  showToast(`Switched view to ${id.toUpperCase()}`);
                }
              }}
              onLogoPress={handleNavigateHome}
              onDropdownMenuPress={() => setIsCategoryModalOpen(true)}
            />
            <SeminarsPage
              currentUser={currentUser}
              isMember={isMember}
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : currentScreen === 'hub' ? (
          /* ATOMY GLOBAL HUB (Matching Website: 5 Portals, Videos, Downloads) */
          <>
            <Header
              cartCount={totalCartCount}
              onCartPress={() => navigateTo('cart')}
              onSearchSubmit={(q) => showToast(`Searching for "${q}"`)}
              onSearchPress={() => navigateTo('search')}
              activeSubTab="hub"
              onSelectSubTab={(id) => {
                setActiveSubTab(id);
                if (id === 'home') {
                  handleNavigateHome();
                } else if (id === 'about') {
                  Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000');
                } else if (id === 'notices') {
                  navigateTo('notice');
                } else if (id === 'compensation') {
                  navigateTo('compensation');
                } else if (id === 'guide') {
                  navigateTo('guide');
                } else if (id === 'seminars') {
                  navigateTo('seminars');
                } else if (id === 'hub') {
                  // already on hub
                } else {
                  showToast(`Switched view to ${id.toUpperCase()}`);
                }
              }}
              onLogoPress={handleNavigateHome}
              onDropdownMenuPress={() => setIsCategoryModalOpen(true)}
            />
            <AtomyHubPage
              onNavigateHome={handleNavigateHome}
              onNavigateBack={handleNavigateBack}
            />
            <BottomNavBar
              activeTab={activeBottomTab}
              onTabPress={handleTabPress}
              favoritesCount={favorites.length}
            />
            <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
          </>
        ) : selectedCategory ? (
          /* DEDICATED CATEGORY PAGE (Personal Care, Beauty, Food, Health, etc.) */
          <CategoryPage
            categoryId={selectedCategory}
            isMember={isMember}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onProductClick={handleOpenProductDetail}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              showToast(`Browsing ${catId.replace('_', ' ').toUpperCase()}`);
            }}
            onNavigateHome={() => setSelectedCategory(null)}
            onNavigateBack={() => setSelectedCategory(null)}
            onCartPress={() => navigateTo('cart')}
            cartCount={totalCartCount}
            onJoinMemberPress={() => navigateTo('membership')}
            onSearchPress={() => navigateTo('search')}
          />
        ) : (
          <>
            {/* 1. Header with Left Logos & Names, Right Search & Cart, and Down Sub-Nav links */}
            <Header
              cartCount={totalCartCount}
              onCartPress={() => navigateTo('cart')}
              onSearchSubmit={(q) => showToast(`Searching for "${q}"`)}
              onSearchPress={() => navigateTo('search')}
              activeSubTab={activeSubTab}
              onSelectSubTab={(id) => {
                setActiveSubTab(id);
                if (id === 'home') {
                  handleNavigateHome();
                } else if (id === 'about') {
                  Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000');
                } else if (id === 'notices') {
                  navigateTo('notice');
                } else if (id === 'compensation') {
                  navigateTo('compensation');
                } else if (id === 'guide') {
                  navigateTo('guide');
                } else if (id === 'seminars') {
                  navigateTo('seminars');
                } else if (id === 'hub') {
                  navigateTo('hub');
                } else {
                  showToast(`Switched view to ${id.toUpperCase()}`);
                }
              }}
              onLogoPress={handleNavigateHome}
              onDropdownMenuPress={() => setIsCategoryModalOpen(true)}
              onOpenRecentlyViewed={() => setIsRecentlyViewedModalOpen(true)}
              recentlyViewedCount={recentlyViewed.length}
            />

            {/* 2. Main Scrollable Page Body */}
            <ScrollView
              style={styles.mainScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              onScroll={handleHomeScroll}
              scrollEventThrottle={16}
              onScrollEndDrag={(e) => {
                const currentY = e.nativeEvent?.contentOffset?.y || 0;
                if (currentY <= 20 && !isBottomBarVisibleRef.current) {
                  isBottomBarVisibleRef.current = true;
                  bottomBarAnim.stopAnimation();
                  Animated.timing(bottomBarAnim, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                    useNativeDriver: false,
                  }).start();
                }
              }}
            >
              {/* Ad Carousel with fitted banner support */}
              <HeroBannerCarousel
                slides={HERO_SLIDES}
                onSlidePress={(slide) => {
                  showToast(`Opened: ${slide.title}`);
                }}
                onOpenAllSlides={() => {
                  showToast('Browsing all 9 featured banners');
                }}
              />

              {/* 3. Category Icons Strip (Directly below Ad Carousel, matching the website) */}
              <CategoryBar
                selectedCategoryId={selectedCategory}
                refreshKey={`${currentScreen}-${navHistory.length}`}
                onSelectCategory={(catId) => {
                  if (catId === 'all_products') {
                    setSelectedCategory('all_products');
                  } else {
                    setSelectedCategory(catId);
                  }
                }}
              />

              {/* EXACT AUTHENTIC WEBSITE LANDING PAGE SECTIONS SEQUENCE */}
              <BestProductsSection
                onAddToCart={handleAddToCart}
                onProductClick={handleOpenProductDetail}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                isMember={isMember}
                onJoinMemberPress={() => setIsMembershipModalOpen(true)}
              />

              {/* 5. Atomy India Hair & Body Essential */}
              <HairBodySection
                onAddToCart={handleAddToCart}
                onProductClick={handleOpenProductDetail}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                isMember={isMember}
                onJoinMemberPress={() => setIsMembershipModalOpen(true)}
              />

              {/* 6. Atomy Absolute Skincare set (Brand Showcase + Banner) */}
              <BrandShowcaseSection
                title="Atomy Absolute Skincare set"
                subtitle="Recapture The Skin of Your Youth"
                bannerImage={ABSOLUTE_SKINCARE_BANNER}
                products={ABSOLUTE_SKINCARE_PRODUCTS}
                onAddToCart={handleAddToCart}
                onProductClick={handleOpenProductDetail}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onBannerPress={() => showToast('Opened Atomy Absolute Skincare Story')}
                isMember={isMember}
                onJoinMemberPress={() => setIsMembershipModalOpen(true)}
              />

              {/* 7. Promotional Wide Banner: User Guide */}
              <PromoBannerStrip
                image={USER_GUIDE_BANNER}
                text="User Guide"
                onPress={() => showToast('Opening Atomy Member User Guide')}
              />

              {/* 8. Atomy Food Essential */}
              <FoodEssentialSection
                onAddToCart={handleAddToCart}
                onProductClick={handleOpenProductDetail}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                isMember={isMember}
                onJoinMemberPress={() => setIsMembershipModalOpen(true)}
              />

              {/* 9. Promotional Wide Banner: Resource Material */}
              <PromoBannerStrip
                image={RESOURCE_MATERIAL_BANNER}
                text="Resource Material"
                onPress={() => showToast('Opening Atomy Resource Material')}
              />

              {/* 10. Atomy India Health Essential (Brand Showcase + Banner) */}
              <BrandShowcaseSection
                title={"Atomy India Health\nEssential"}
                subtitle="Your Daily Dose of Exceptional Health"
                bannerImage={HEALTH_ESSENTIAL_BANNER}
                products={HEALTH_ESSENTIAL_PRODUCTS}
                onAddToCart={handleAddToCart}
                onProductClick={handleOpenProductDetail}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onBannerPress={() => showToast('Opened Health Essential Story')}
                isMember={isMember}
                onJoinMemberPress={() => setIsMembershipModalOpen(true)}
              />

              {/* 11. Atomy India GSGS Product */}
              <GsgsSection
                onAddToCart={handleAddToCart}
                onProductClick={handleOpenProductDetail}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                isMember={isMember}
                onJoinMemberPress={() => setIsMembershipModalOpen(true)}
              />

              {/* 12. Notice Strip Ticker */}
              <NoticeTicker
                onNoticePress={() => navigateTo('notice')}
              />

              {/* 13. Official Corporate & Support Footer */}
              <AtomyFooter />
            </ScrollView>

            {/* 3. Fixed Animated Bottom Bar: Home, Menu, Recently View, Favorites, Profile */}
            <Animated.View
              style={[
                styles.bottomBarAnimatedWrapper,
                {
                  transform: [
                    {
                      translateY: bottomBarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 95],
                      }),
                    },
                  ],
                  opacity: bottomBarAnim.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [1, 0.6, 0],
                  }),
                },
              ]}
            >
              <BottomNavBar
                activeTab={activeBottomTab}
                onTabPress={handleTabPress}
                favoritesCount={favorites.length}
                recentlyViewedCount={recentlyViewed.length}
              />
              <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
            </Animated.View>
          </>
        )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastCard}>
          <View style={styles.toastDot} />
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMessage}
          </Text>
        </View>
      )}

      {/* 4. Category / Menu Drawer Modal */}
      <CategoryDrawerModal
        visible={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        isMember={isMember}
        isUserLoggedIn={isUserLoggedIn}
        onOpenSignIn={(mode, notice) => {
          setAuthInitialMode(mode || 'signin');
          setAuthNotice(notice || null);
          setCurrentScreen('profile');
          setActiveBottomTab('profile');
          setSelectedCategory(null);
        }}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          navigateTo('home', { category: catId });
          showToast(`Browsing category: ${catId.toUpperCase()}`);
        }}
        onNavigateQuickOrder={() => {
          navigateTo('quick_order');
        }}
        onNavigateOrderDelivery={() => {
          navigateTo('order_delivery');
        }}
        onNavigateAboutUs={() => {
          navigateTo('about_us');
        }}
        onNavigateFindCentre={() => {
          navigateTo('find_centre');
        }}
        onNavigateCustomerSupport={() => {
          navigateTo('customer_support');
        }}
        onNavigateFavorites={() => {
          navigateTo('favorites');
        }}
        onNavigateFaq={() => {
          navigateTo('faq');
        }}
        onNavigateNotice={() => {
          navigateTo('notice');
        }}
        onNavigateCompany={() => {
          Linking.openURL('https://global.atomy.com/menu.es?mid=a20101000000');
        }}
        onOpenMembership={() => {
          navigateTo('membership');
        }}
      />

      {/* 5. Free Membership & Public/Member State Modal */}
      <MembershipModal
        visible={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        isMember={isMember}
        onToggleMembership={(newStatus) => {
          setIsMember(newStatus);
          showToast(
            newStatus
              ? 'Switched to Member View (Distributor DP Prices Active ★)'
              : 'Switched to Public Guest View (Retail MRP Prices)'
          );
        }}
      />

      {/* 6. Promotional Floating Ad (Card & Modal, syncs live with MySQL / Admin) */}
      <FloatingAdModal
        visible={isAdOpen}
        showFloatingCard={currentScreen === 'home' && !selectedCategory}
        scrollAnim={bottomBarAnim}
        adConfig={adConfig}
        onOpenModal={() => setIsAdOpen(true)}
        onClose={handleCloseAd}
        onAddToCart={(item) => {
          handleAddToCart(item);
          handleCloseAd(false);
        }}
        onOrderNow={(item) => {
          const buyItem = {
            ...item,
            image: item.image || item.img,
            qty: 1,
          };
          if (!isUserLoggedIn) {
            setPendingOrderAction({ type: 'buynow', items: [buyItem] });
            setAuthNotice('Please sign in or register to place your order with Atomy India.');
            setAuthInitialMode('signin');
            navigateTo('signin');
            handleCloseAd(false);
            return;
          }
          setCheckoutItems([buyItem]);
          navigateTo('payment_summary');
          handleCloseAd(false);
        }}
      />

      {/* 8. Recently Viewed Products Drawer Modal */}
      <RecentlyViewedModal
        visible={isRecentlyViewedModalOpen}
        onClose={() => setIsRecentlyViewedModalOpen(false)}
        items={recentlyViewed}
        onProductClick={(prod) => {
          setIsRecentlyViewedModalOpen(false);
          handleOpenProductDetail(prod);
        }}
        onAddToCart={(prod) => {
          handleAddToCart(prod);
        }}
        onRemoveItem={handleRemoveRecentlyViewedItem}
        onClearAll={handleClearRecentlyViewed}
        isMember={isMember}
      />
      {toastMessage && (
        <View style={styles.toastCard}>
          <View style={styles.toastDot} />
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMessage}
          </Text>
        </View>
      )}
    </View>
  </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSafeArea: {
    backgroundColor: COLORS.primary, // Solid Atomy Cyan Blue
  },
  topSafeAreaCart: {
    backgroundColor: '#FFFFFF',
  },
  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 95,
  },
  bottomBarAnimatedWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
  },
  filteredSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  filteredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filteredTitleCol: {
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  filteredTitle: {
    fontSize: 22.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  filteredSubtitle: {
    fontSize: 13.5,
    color: '#111827',
    marginTop: 3,
    textAlign: 'center',
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridItemWrapper: {
    width: '48.5%',
  },
  toastCard: {
    position: 'absolute',
    bottom: 75,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    maxWidth: '90%',
    zIndex: 999,
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
