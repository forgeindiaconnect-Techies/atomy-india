import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Headphones,
  Settings,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Truck,
  Edit2,
  Trash2,
  Filter,
  Send,
  Plus,
  Search,
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  Check,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  ShoppingBag,
  Sliders,
  Play,
  ShieldCheck,
  Sparkles,
  Info,
  User,
  RotateCcw,
  LogOut,
  Crown
} from 'lucide-react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import {
  fetchAdminStats,
  fetchAdminOrders,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  fetchAdminInventory,
  fetchAdminProducts,
  updateAdminStock,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminTickets,
  replyAdminTicket,
  updateAdminTicketStatus
} from '../../services/api';
import {
  playOrderAlertSound,
  playSupportAlertSound,
  sendDesktopNotification
} from '../../services/soundAlerts';
import ProductEditorPage from './ProductEditorPage';
import AdPromotionManager from './AdPromotionManager';
import MembershipManagementPage from './MembershipManagementPage';
import DeliveryStatusStepper from '../Orders/DeliveryStatusStepper';
import {
  getAdConfig,
  saveAdConfig,
  clearAdSuppressionForLogin,
  DEFAULT_AD_CONFIG
} from '../../services/adPromotionService';
import './AdminDashboard.css';

// Exactly 1 Clean Data Item for Catalog / Inventory
const INITIAL_SINGLE_PRODUCT = [
  {
    id: "D00101",
    name: "HemoHIM *1set",
    categoryId: "health",
    categoryName: "Health Care",
    subcategory: "Immune & Nutrition",
    price: 13000,
    originalPrice: 14950,
    pv: 80000,
    stockQuantity: 50,
    lowStockThreshold: 10,
    status: "IN_STOCK",
    image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg",
    description: "Atomy HemoHIM - Patented herbal extract formulated to awaken exhausted immune cells and support vitality. Developed by Korea Atomic Energy Research Institute (KAERI).",
    features: "Immune system enhancement, antioxidant protection, patented natural botanical formulation",
    ingredients: "Angelica Gigas Nakai, Cnidium Officinale Makino, Paeonia Japonica Miyabe",
    precautions: "Consume 1 packet twice daily with water. Pregnant women and children under 6 should consult a physician.",
    volumeDesc: "20ml x 60 packets (1,200ml)",
    weight: 1.5,
    tags: "Best Seller",
    isVeg: true,
    isNonVeg: false,
    gstReduced: true,
    freeDelivery: true,
    active: true
  }
];

// Local storage initialization key
const STORAGE_CLEAN_KEY = 'atomy_admin_clean_v8';

export default function AdminDashboard({ onBackToStore, onLogout, adminProfileProp }) {
  // Navigation tabs: 'overview' | 'inventory' | 'orders' | 'customers' | 'support' | 'settings' | 'floating-ad'
  const [activeTab, setActiveTab] = useState('overview');
  const [adPromotionConfig, setAdPromotionConfig] = useState(getAdConfig);

  // Notification & Sound Settings
  const [soundSettings, setSoundSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_admin_sound_settings');
      return saved ? JSON.parse(saved) : {
        orderSoundEnabled: true,
        supportSoundEnabled: true,
        volume: 0.85,
        pollingIntervalSec: 10
      };
    } catch {
      return { orderSoundEnabled: true, supportSoundEnabled: true, volume: 0.85, pollingIntervalSec: 10 };
    }
  });

  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_admin_store_settings');
      return saved ? JSON.parse(saved) : {
        storeName: 'Atomy India Official Direct Store',
        helpline: '1800-103-8200 (Toll Free)',
        supportEmail: 'support.india@atomy.com',
        fulfillmentCenter: 'Atomy India Distribution Center, Sector 48, Gurugram, Haryana - 122018',
        freeShippingThreshold: 4500,
        defaultCourier: 'Blue Dart Express',
        defaultLowStockAlert: 10
      };
    } catch {
      return {
        storeName: 'Atomy India Official Direct Store',
        helpline: '1800-103-8200 (Toll Free)',
        supportEmail: 'support.india@atomy.com',
        fulfillmentCenter: 'Atomy India Distribution Center, Sector 48, Gurugram, Haryana - 122018',
        freeShippingThreshold: 4500,
        defaultCourier: 'Blue Dart Express',
        defaultLowStockAlert: 10
      };
    }
  });

  // Active High-Impact Alert Banner state
  const [activeAlert, setActiveAlert] = useState(null);

  // Purge any stale demo cache on initialization so metrics start completely clean
  const [products, setProducts] = useState(() => {
    try {
      if (localStorage.getItem(STORAGE_CLEAN_KEY) !== 'true') {
        localStorage.setItem(STORAGE_CLEAN_KEY, 'true');
        localStorage.setItem('atomy_admin_products', JSON.stringify(INITIAL_SINGLE_PRODUCT));
        localStorage.setItem('atomy_admin_orders', JSON.stringify([]));
        localStorage.setItem('atomy_admin_tickets', JSON.stringify([]));
        localStorage.removeItem('atomy_placed_orders');
        localStorage.removeItem('atomy_members_registry');
        return INITIAL_SINGLE_PRODUCT;
      }
      const saved = localStorage.getItem('atomy_admin_products');
      return saved ? JSON.parse(saved) : INITIAL_SINGLE_PRODUCT;
    } catch {
      return INITIAL_SINGLE_PRODUCT;
    }
  });

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productStockFilter, setProductStockFilter] = useState('ALL');
  const [isEditingProductView, setIsEditingProductView] = useState(false);
  const [currentEditingProduct, setCurrentEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Orders State (Clean 0 demo orders - only real customer orders from MySQL backend)
  const [orders, setOrders] = useState(() => {
    try {
      if (localStorage.getItem(STORAGE_CLEAN_KEY) !== 'true') {
        return [];
      }
      const adminOrders = localStorage.getItem('atomy_admin_orders');
      if (adminOrders) {
        const parsed = JSON.parse(adminOrders);
        if (Array.isArray(parsed)) {
          return parsed.filter(o => 
            !o.orderId?.startsWith('ORD-20261005') && 
            !o.orderId?.startsWith('ORD-20261008-3800') && 
            !o.orderId?.startsWith('ORD-20261008-1863') && 
            !o.orderId?.toUpperCase().includes('DEMO') &&
            !o.customerName?.toLowerCase().includes('test') &&
            !o.customerEmail?.toLowerCase().includes('example.com') &&
            !o.customerEmail?.toLowerCase().includes('test')
          );
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [editingTrackingOrder, setEditingTrackingOrder] = useState(null);
  const [trackingForm, setTrackingForm] = useState({
    courierPartner: 'Blue Dart Express',
    trackingNumber: '',
    currentStatus: 'SHIPPED',
    currentLocation: 'Gurugram Hub',
    estimatedDelivery: '2-3 Business Days'
  });

  // Support State (Clean state from MySQL database or actual customer interactions)
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_admin_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        const demoIds = ['TCK-20261007-8894', 'TCK-20261006-4412', 'TCK-20261005-1109', 'TCK-20261004-9821'];
        return Array.isArray(parsed) ? parsed.filter(t => !demoIds.includes(t.ticketId)) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL');
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    subject: '',
    category: 'COURIER_TRACKING',
    priority: 'MEDIUM',
    orderId: '',
    initialMessage: ''
  });

  // Customer Drawer / Modal State
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Admin Profile & Top Nav Notification Dropdown State
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef(null);
  const [adminProfile, setAdminProfile] = useState(() => {
    if (adminProfileProp) return adminProfileProp;
    try {
      const saved = localStorage.getItem('atomy_admin_profile');
      return saved ? JSON.parse(saved) : {
        name: 'Naveen Sourabh Pal',
        email: 'naveen.admin@atomy.com',
        role: 'Super Administrator',
        phone: '+91 98765 43210',
        employeeId: 'AT-IN-001',
        department: 'E-Commerce Operations & Supply Chain',
        location: 'Gurugram HQ, India',
        twoFactorEnabled: true,
        lastLogin: 'Today, 09:30 AM (IST)',
        sessionIp: '192.168.1.104 (Secure VPN)'
      };
    } catch {
      return {
        name: 'Naveen Sourabh Pal',
        email: 'naveen.admin@atomy.com',
        role: 'Super Administrator',
        phone: '+91 98765 43210',
        employeeId: 'AT-IN-001',
        department: 'E-Commerce Operations & Supply Chain',
        location: 'Gurugram HQ, India',
        twoFactorEnabled: true,
        lastLogin: 'Today, 09:30 AM (IST)',
        sessionIp: '192.168.1.104 (Secure VPN)'
      };
    }
  });

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // References to track changes for audio alerts
  const prevOrderCountRef = useRef(orders.length);
  const prevTicketCountRef = useRef(tickets.length);
  const prevFirstOrderIdRef = useRef(orders[0]?.orderId);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atomy_admin_products', JSON.stringify(products));
    } catch { }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('atomy_admin_orders', JSON.stringify(orders));
    } catch { }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('atomy_admin_tickets', JSON.stringify(tickets));
    } catch { }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem('atomy_admin_sound_settings', JSON.stringify(soundSettings));
    } catch { }
  }, [soundSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('atomy_admin_store_settings', JSON.stringify(storeSettings));
    } catch { }
  }, [storeSettings]);

  // Initial Data Fetching from Spring Boot Backend
  useEffect(() => {
    // Ensure any stale hardcoded demo tickets are completely purged
    try {
      const saved = localStorage.getItem('atomy_admin_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        const demoIds = ['TCK-20261007-8894', 'TCK-20261006-4412', 'TCK-20261005-1109', 'TCK-20261004-9821'];
        const clean = Array.isArray(parsed) ? parsed.filter(t => !demoIds.includes(t.ticketId)) : [];
        if (clean.length !== parsed.length) {
          localStorage.setItem('atomy_admin_tickets', JSON.stringify(clean));
          setTickets(clean);
          setSelectedTicket(clean[0] || null);
        }
      }
    } catch { }
    syncWithBackend();
  }, []);

  const syncWithBackend = async () => {
    try {
      const [statsRes, ordersRes, prodsRes, ticketsRes] = await Promise.allSettled([
        fetchAdminStats(),
        fetchAdminOrders(),
        fetchAdminProducts(),
        fetchAdminTickets()
      ]);

      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        const mappedOrders = ordersRes.value.map(bo => ({
          orderId: bo.orderId,
          createdAt: bo.createdAt || new Date().toISOString(),
          customerName: bo.customerName || "Customer",
          customerEmail: bo.customerEmail || "customer@atomy.com",
          customerPhone: bo.customerPhone || "+91 98000 00000",
          shippingAddress: bo.shippingAddress || "Direct Delivery",
          city: bo.city || "New Delhi",
          state: bo.state || "Delhi",
          pincode: bo.pincode || "110001",
          orderStatus: bo.orderStatus || "PLACED",
          paymentMethod: bo.paymentMethod || "ONLINE_UPI",
          paymentStatus: bo.paymentStatus || "PAID",
          totalAmount: Number(bo.totalAmount) || 0,
          shippingFee: Number(bo.shippingFee) || 0,
          items: Array.isArray(bo.items) ? bo.items.map(it => ({
            id: it.productId,
            name: it.productName || it.name,
            productName: it.productName || it.name,
            image: it.productImage || it.image,
            price: Number(it.price) || 0,
            qty: it.quantity || it.qty || 1,
            quantity: it.quantity || it.qty || 1
          })) : [],
          tracking: bo.tracking || null
        })).filter(o => 
          !o.orderId?.startsWith('ORD-20261005') && 
          !o.orderId?.startsWith('ORD-20261008-3800') && 
          !o.orderId?.startsWith('ORD-20261008-1863') && 
          !o.orderId?.toUpperCase().includes('DEMO') &&
          !o.customerName?.toLowerCase().includes('test') &&
          !o.customerEmail?.toLowerCase().includes('example.com') &&
          !o.customerEmail?.toLowerCase().includes('test')
        );
        setOrders(mappedOrders);
        localStorage.setItem('atomy_admin_orders', JSON.stringify(mappedOrders));
      }
      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value) && prodsRes.value.length > 0) {
        setProducts(prodsRes.value);
        try {
          localStorage.setItem('atomy_admin_products', JSON.stringify(prodsRes.value));
        } catch { }
      }
      if (ticketsRes.status === 'fulfilled' && Array.isArray(ticketsRes.value)) {
        const demoIds = ['TCK-20261007-8894', 'TCK-20261006-4412', 'TCK-20261005-1109', 'TCK-20261004-9821'];
        const cleanTickets = ticketsRes.value.filter(t => !demoIds.includes(t.ticketId));
        setTickets(cleanTickets);
      }
    } catch (e) {
      console.warn('[Admin] Live backend syncing fallback to local cache:', e);
    }
  };

  // Background Live-Polling Listener & Cross-Channel Listener for live customer orders
  useEffect(() => {
    // 1. Setup real-time BroadcastChannel listeners
    let syncChannel, orderChannel;
    try {
      const handleIncomingOrder = (newOrderObj) => {
        setOrders(prev => {
          if (prev.some(o => o.orderId === newOrderObj.orderId)) return prev;
          triggerOrderNotification(newOrderObj);
          return [newOrderObj, ...prev];
        });
      };

      syncChannel = new BroadcastChannel('atomy_sync_channel');
      syncChannel.onmessage = (event) => {
        const data = event.data;
        if (data && (data.type === 'ORDER_PLACED' || data.type === 'NEW_ORDER') && data.order) {
          const o = data.order;
          handleIncomingOrder({
            orderId: o.orderId,
            createdAt: o.date || o.createdAt || new Date().toISOString(),
            customerName: o.recipient || o.customerName || "Customer",
            customerEmail: o.customerEmail || "customer@atomy.com",
            customerPhone: o.phone || o.customerPhone || "+91 98000 00000",
            shippingAddress: o.address?.fullAddress || o.shippingAddress || "Direct Delivery",
            city: o.city || "New Delhi",
            state: o.state || "Delhi",
            pincode: o.pincode || "110001",
            orderStatus: o.orderStatus || "PLACED",
            paymentMethod: o.paymentMethod || "ONLINE_UPI",
            paymentStatus: "PAID",
            totalAmount: o.grandTotal || o.totalAmount || 0,
            shippingFee: o.shippingFee || 0,
            items: o.items || [],
            tracking: null
          });
        }
      };

      orderChannel = new BroadcastChannel('atomy_order_channel');
      orderChannel.onmessage = (event) => {
        const data = event.data;
        if (data && (data.type === 'ORDER_PLACED' || data.type === 'NEW_ORDER') && data.order) {
          const o = data.order;
          handleIncomingOrder({
            orderId: o.orderId,
            createdAt: o.date || o.createdAt || new Date().toISOString(),
            customerName: o.recipient || o.customerName || "Customer",
            customerEmail: o.customerEmail || "customer@atomy.com",
            customerPhone: o.phone || o.customerPhone || "+91 98000 00000",
            shippingAddress: o.address?.fullAddress || o.shippingAddress || "Direct Delivery",
            city: o.city || "New Delhi",
            state: o.state || "Delhi",
            pincode: o.pincode || "110001",
            orderStatus: o.orderStatus || "PLACED",
            paymentMethod: o.paymentMethod || "ONLINE_UPI",
            paymentStatus: "PAID",
            totalAmount: o.grandTotal || o.totalAmount || 0,
            shippingFee: o.shippingFee || 0,
            items: o.items || [],
            tracking: null
          });
        }
      };
    } catch (e) { }

    // 2. Active Polling interval to check MySQL Spring Boot backend every 3 seconds
    const intervalTime = Math.min((soundSettings.pollingIntervalSec || 10) * 1000, 3000);
    const interval = setInterval(async () => {
      // Poll orders from Spring Boot Backend
      try {
        const backendOrders = await fetchAdminOrders();
        if (Array.isArray(backendOrders)) {
          const mappedOrders = backendOrders.map(bo => ({
            orderId: bo.orderId,
            createdAt: bo.createdAt || new Date().toISOString(),
            customerName: bo.customerName || "Customer",
            customerEmail: bo.customerEmail || "customer@atomy.com",
            customerPhone: bo.customerPhone || "+91 98000 00000",
            shippingAddress: bo.shippingAddress || "Direct Delivery",
            city: bo.city || "New Delhi",
            state: bo.state || "Delhi",
            pincode: bo.pincode || "110001",
            orderStatus: bo.orderStatus || "PLACED",
            paymentMethod: bo.paymentMethod || "ONLINE_UPI",
            paymentStatus: bo.paymentStatus || "PAID",
            totalAmount: Number(bo.totalAmount) || 0,
            shippingFee: Number(bo.shippingFee) || 0,
            items: Array.isArray(bo.items) ? bo.items.map(it => ({
              id: it.productId,
              name: it.productName,
              image: it.productImage,
              price: Number(it.price) || 0,
              qty: it.quantity || 1
            })) : [],
            tracking: bo.tracking || null
          })).filter(o => !o.orderId?.startsWith('ORD-20261005'));

          setOrders(prev => {
            const prevIds = new Set(prev.map(o => o.orderId));
            mappedOrders.forEach(mo => {
              if (!prevIds.has(mo.orderId) && prev.length > 0) {
                triggerOrderNotification(mo);
              }
            });
            return mappedOrders;
          });
        }
      } catch (e) { }

      // Check localStorage for any fresh customer orders placed from customer storefront
      try {
        const localOrdersRaw = localStorage.getItem('atomy_placed_orders');
        if (localOrdersRaw) {
          const freshList = JSON.parse(localOrdersRaw);
          if (Array.isArray(freshList) && freshList.length > 0) {
            freshList.forEach(latest => {
              setOrders(prev => {
                const alreadyHas = prev.some(o => o.orderId === latest.orderId);
                if (alreadyHas) return prev;
                const newOrderObj = {
                  orderId: latest.orderId,
                  createdAt: latest.date || new Date().toISOString(),
                  customerName: latest.recipient || latest.customerName || "Customer",
                  customerEmail: latest.customerEmail || "customer@atomy.com",
                  customerPhone: latest.phone || latest.customerPhone || "+91 98000 00000",
                  shippingAddress: latest.address?.fullAddress || latest.shippingAddress || "Direct Delivery",
                  city: latest.city || "New Delhi",
                  state: latest.state || "Delhi",
                  pincode: latest.pincode || "110001",
                  orderStatus: latest.orderStatus || "PLACED",
                  paymentMethod: latest.paymentMethod || "ONLINE_UPI",
                  paymentStatus: "PAID",
                  totalAmount: latest.grandTotal || latest.totalAmount || 0,
                  shippingFee: latest.shippingFee || 0,
                  items: latest.items || [],
                  tracking: null
                };
                triggerOrderNotification(newOrderObj);
                return [newOrderObj, ...prev];
              });
            });
          }
        }
      } catch (e) { }
    }, intervalTime);

    return () => {
      clearInterval(interval);
      try { syncChannel && syncChannel.close(); } catch { }
      try { orderChannel && orderChannel.close(); } catch { }
    };
  }, [soundSettings]);

  // STRONG NOTIFICATION TRIGGERS
  const triggerOrderNotification = (order) => {
    if (soundSettings.orderSoundEnabled) {
      playOrderAlertSound(soundSettings.volume);
    }
    setActiveAlert({
      type: 'order',
      title: 'NEW CUSTOMER ORDER RECEIVED!',
      message: `Order #${order.orderId} placed by ${order.customerName} for ₹ ${order.totalAmount?.toLocaleString('en-IN')}`,
      time: 'Just now',
      targetId: order.orderId
    });
    sendDesktopNotification(`🚨 Atomy India: New Order #${order.orderId}`, {
      body: `Customer ${order.customerName} placed an order for ₹ ${order.totalAmount?.toLocaleString('en-IN')}`
    });
  };

  const triggerSupportNotification = (ticket) => {
    if (soundSettings.supportSoundEnabled) {
      playSupportAlertSound(soundSettings.volume);
    }
    setActiveAlert({
      type: 'support',
      title: 'NEW CUSTOMER SUPPORT INQUIRY!',
      message: `Ticket #${ticket.ticketId} from ${ticket.customerName}: "${ticket.subject}"`,
      time: 'Just now',
      targetId: ticket.ticketId
    });
    sendDesktopNotification(`🎧 Atomy Support: Inquiry from ${ticket.customerName}`, {
      body: ticket.subject
    });
  };

  // Test sound triggers
  const handleTestOrderSound = () => {
    playOrderAlertSound(soundSettings.volume);
    showToast('🔔 Sound Tested: High-impact order chime played');
  };

  const handleTestSupportSound = () => {
    playSupportAlertSound(soundSettings.volume);
    showToast('🎧 Sound Tested: Urgent support notification played');
  };

  // 1. CALCULATE DASHBOARD OVERVIEW METRICS
  const overviewStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let todaySale = 0;
    let todayOrdersCount = 0;
    let overallSale = 0;
    let placedCount = 0;
    let processingCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;

    orders.forEach((o) => {
      const amt = Number(o.totalAmount) || 0;
      const orderTime = new Date(o.createdAt).getTime();

      if (o.orderStatus !== 'CANCELLED') {
        overallSale += amt;
      }

      if (orderTime >= startOfToday && o.orderStatus !== 'CANCELLED') {
        todaySale += amt;
        todayOrdersCount += 1;
      }

      if (o.orderStatus === 'PLACED') placedCount++;
      else if (o.orderStatus === 'PROCESSING') processingCount++;
      else if (o.orderStatus === 'SHIPPED' || o.orderStatus === 'OUT_FOR_DELIVERY') shippedCount++;
      else if (o.orderStatus === 'DELIVERED') deliveredCount++;
    });

    const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 10)).length;
    const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;
    const openTicketsCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

    return {
      todaySale,
      todayOrdersCount,
      overallSale,
      placedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      totalOrders: orders.length,
      lowStockCount,
      outOfStockCount,
      openTicketsCount
    };
  }, [orders, products, tickets]);

  // 2. PRODUCT MANAGEMENT HANDLERS (ADD, EDIT, REMOVE)
  const handleOpenAddProduct = () => {
    const nextCode = `D0${Math.floor(1000 + Math.random() * 9000)}`;
    setCurrentEditingProduct({
      isNew: true,
      id: nextCode,
      name: '',
      categoryId: 'health',
      subcategory: 'Immune & Nutrition',
      price: 2500,
      originalPrice: 3000,
      pv: 15000,
      stockQuantity: 50,
      lowStockThreshold: 10,
      image: 'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg',
      description: '',
      features: 'High absorption, clinically tested, natural formula',
      ingredients: 'Botanical extracts, antioxidants, essential vitamins',
      precautions: 'Store in cool and dry place. Keep out of reach of children.',
      volumeDesc: '60 Capsules / Box',
      weight: 0.5,
      tags: 'Best Seller',
      isVeg: true,
      isNonVeg: false,
      gstReduced: true,
      freeDelivery: true
    });
    setIsEditingProductView(true);
    setTimeout(() => {
      window.scrollTo(0, 0);
      const mainPanel = document.querySelector('.admin-main-panel');
      if (mainPanel) mainPanel.scrollTop = 0;
    }, 10);
  };

  const handleOpenEditProduct = (prod) => {
    const isHemohim = prod.categoryId === 'hemohim' || (prod.name && prod.name.toLowerCase().includes('hemohim')) || prod.id === 'D00101' || prod.id === 'D00102' || prod.id === 'D00104';
    setCurrentEditingProduct({
      ...prod,
      categoryId: isHemohim ? 'hemohim' : (prod.categoryId || 'health'),
      isNew: false
    });
    setIsEditingProductView(true);
    setTimeout(() => {
      window.scrollTo(0, 0);
      const mainPanel = document.querySelector('.admin-main-panel');
      if (mainPanel) mainPanel.scrollTop = 0;
    }, 10);
  };

  const handleSaveProductFromEditor = async (productData) => {
    const payload = {
      ...productData,
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice) || 0,
      discountPercent: Number(productData.discountPercent) || 0,
      dpPrice: productData.dpPrice ? Number(productData.dpPrice) : 0,
      pv: Number(productData.pv) || 0,
      stockQuantity: Number(productData.stockQuantity) || 0,
      lowStockThreshold: Number(productData.lowStockThreshold) || 10,
      status: (Number(productData.stockQuantity) || 0) === 0 ? 'OUT_OF_STOCK'
        : (Number(productData.stockQuantity) || 0) <= (Number(productData.lowStockThreshold) || 10) ? 'LOW_STOCK' : 'IN_STOCK',
      isVeg: Boolean(productData.isVeg),
      isNonVeg: Boolean(productData.isNonVeg),
      gstReduced: Boolean(productData.gstReduced),
      freeDelivery: Boolean(productData.freeDelivery),
      active: productData.active !== undefined ? Boolean(productData.active) : true,
      likesCount: Number(productData.likesCount) || 0,
      tags: productData.tags || 'Best Seller'
    };

    try {
      if (productData.isNew) {
        await createAdminProduct(payload);
        setProducts(prev => [payload, ...prev]);
        showToast(`Product "${payload.name}" published to live store!`);
      } else {
        await updateAdminProduct(payload.id, payload);
        setProducts(prev => prev.map(p => p.id === payload.id ? payload : p));
        showToast(`Product "${payload.name}" updated and synced with customer website!`);
      }
    } catch (err) {
      console.warn('Backend update warning:', err);
      setProducts(prev => {
        const exists = prev.some(p => p.id === payload.id);
        return exists ? prev.map(p => p.id === payload.id ? payload : p) : [payload, ...prev];
      });
      showToast(`Product "${payload.name}" saved!`);
    }

    // Broadcast update across ports/tabs to customer website instantly
    try {
      const channel = new BroadcastChannel('atomy_product_channel');
      channel.postMessage({ type: 'PRODUCT_UPDATED', product: payload });
    } catch { }

    setIsEditingProductView(false);
    setCurrentEditingProduct(null);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteAdminProduct(productToDelete.id).catch(() => { });
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));

      // Broadcast product deletion across channels to customer website instantly
      try {
        const channel = new BroadcastChannel('atomy_product_channel');
        channel.postMessage({ type: 'PRODUCT_DELETED', productId: productToDelete.id });
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({ type: 'PRODUCT_DELETED', productId: productToDelete.id });
      } catch { }

      showToast(`Product "${productToDelete.name}" (${productToDelete.id}) removed from catalog.`);
      setProductToDelete(null);
    } catch (err) {
      showToast('Error removing product: ' + err.message);
    }
  };

  const handleQuickStockChange = async (prod, delta) => {
    const newQty = Math.max(0, (prod.stockQuantity || 0) + delta);
    const updatedProd = {
      ...prod,
      stockQuantity: newQty,
      status: newQty === 0 ? 'OUT_OF_STOCK' : newQty <= (prod.lowStockThreshold || 10) ? 'LOW_STOCK' : 'IN_STOCK'
    };

    setProducts(prev => prev.map(p => p.id === prod.id ? updatedProd : p));
    await updateAdminStock(prod.id, newQty, prod.lowStockThreshold).catch(() => { });
    showToast(`Stock updated: ${prod.name} (${newQty} units)`);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = productSearch.toLowerCase().trim();
      const matchSearch = !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.categoryId && p.categoryId.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q));

      const isHemohim = p.categoryId === 'hemohim' || (p.name && p.name.toLowerCase().includes('hemohim')) || p.id === 'D00101' || p.id === 'D00102' || p.id === 'D00104';

      const matchCategory = productCategoryFilter === 'ALL'
        ? true
        : productCategoryFilter === 'hemohim'
          ? isHemohim
          : productCategoryFilter === 'health'
            ? (p.categoryId === 'health' && !isHemohim)
            : p.categoryId === productCategoryFilter;

      const matchStock = productStockFilter === 'ALL'
        ? true
        : productStockFilter === 'LOW'
          ? (p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 10))
          : productStockFilter === 'OUT'
            ? p.stockQuantity === 0
            : p.stockQuantity > (p.lowStockThreshold || 10);

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, productSearch, productCategoryFilter, productStockFilter]);

  // 3. ORDER MANAGEMENT HANDLERS
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus).catch(() => { });
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
      if (selectedOrderDetail && selectedOrderDetail.orderId === orderId) {
        setSelectedOrderDetail(prev => ({ ...prev, orderStatus: newStatus }));
      }

      // Sync live to customer website orders storage
      try {
        const localOrdersRaw = localStorage.getItem('atomy_placed_orders');
        if (localOrdersRaw) {
          const list = JSON.parse(localOrdersRaw);
          const statusMap = {
            'PLACED': 'Payment Completed',
            'PROCESSING': 'Preparing Shipment',
            'SHIPPED': 'In Transit',
            'OUT_FOR_DELIVERY': 'Out for Delivery',
            'DELIVERED': 'Delivered',
            'CANCELLED': 'Cancelled'
          };
          const updated = list.map(o => {
            if (o.orderId === orderId) {
              return {
                ...o,
                status: statusMap[newStatus] || newStatus,
                orderStatus: newStatus
              };
            }
            return o;
          });
          localStorage.setItem('atomy_placed_orders', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('atomy:orders-updated', { detail: updated }));
        }
      } catch (e) { }

      // Broadcast order status update across ports/tabs to customer website instantly
      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId, newStatus });
      } catch { }

      showToast(`Order ${orderId} status set to ${newStatus}`);
    } catch (err) {
      showToast('Error updating order: ' + err.message);
    }
  };

  const handleProcessRefund = async (orderId) => {
    if (!window.confirm(`Are you sure you want to process a refund for Order ${orderId}? This will reverse payment and update status to REFUNDED / CANCELLED.`)) {
      return;
    }
    try {
      await updateAdminOrderStatus(orderId, 'CANCELLED').catch(() => { });
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : o));
      if (selectedOrderDetail && selectedOrderDetail.orderId === orderId) {
        setSelectedOrderDetail(prev => ({ ...prev, orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' }));
      }
      showToast(`Refund processed successfully for ${orderId}! Payment status set to REFUNDED.`);
    } catch (err) {
      showToast('Error processing refund: ' + err.message);
    }
  };

  const handleOpenTrackingModal = (order) => {
    setEditingTrackingOrder(order);
    setTrackingForm({
      courierPartner: order.tracking?.courierPartner || order.courier || 'Blue Dart Express',
      trackingNumber: order.tracking?.trackingNumber || order.trackingNumber || `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`,
      currentStatus: order.orderStatus || 'PLACED',
      currentLocation: order.tracking?.currentLocation || 'Gurugram Hub',
      estimatedDelivery: order.tracking?.estimatedDelivery || order.estimatedDelivery || '2-3 Business Days'
    });
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!editingTrackingOrder) return;
    try {
      await updateAdminOrderTracking(editingTrackingOrder.orderId, trackingForm).catch(() => { });
      if (trackingForm.currentStatus) {
        await updateAdminOrderStatus(editingTrackingOrder.orderId, trackingForm.currentStatus).catch(() => { });
      }

      const updatedOrderData = {
        tracking: trackingForm,
        orderStatus: trackingForm.currentStatus,
        status: trackingForm.currentStatus,
        courier: trackingForm.courierPartner,
        trackingNumber: trackingForm.trackingNumber
      };

      setOrders(prev => prev.map(o => o.orderId === editingTrackingOrder.orderId ? {
        ...o,
        ...updatedOrderData
      } : o));

      if (selectedOrderDetail && selectedOrderDetail.orderId === editingTrackingOrder.orderId) {
        setSelectedOrderDetail(prev => ({
          ...prev,
          ...updatedOrderData
        }));
      }

      // Sync with customer placed orders
      try {
        const localOrdersRaw = localStorage.getItem('atomy_placed_orders');
        if (localOrdersRaw) {
          const list = JSON.parse(localOrdersRaw);
          const statusMap = {
            'PLACED': 'Payment Completed',
            'PROCESSING': 'Preparing Shipment',
            'SHIPPED': 'In Transit',
            'OUT_FOR_DELIVERY': 'Out for Delivery',
            'DELIVERED': 'Delivered',
            'CANCELLED': 'Cancelled'
          };
          const updated = list.map(o => {
            if (o.orderId === editingTrackingOrder.orderId) {
              return {
                ...o,
                status: statusMap[trackingForm.currentStatus] || trackingForm.currentStatus,
                orderStatus: trackingForm.currentStatus,
                courier: trackingForm.courierPartner,
                trackingNumber: trackingForm.trackingNumber
              };
            }
            return o;
          });
          localStorage.setItem('atomy_placed_orders', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('atomy:orders-updated', { detail: updated }));
        }
      } catch (e) { }

      // Broadcast order status update across ports/tabs to customer website instantly
      try {
        const syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.postMessage({
          type: 'ORDER_STATUS_UPDATED',
          orderId: editingTrackingOrder.orderId,
          newStatus: trackingForm.currentStatus,
          courier: trackingForm.courierPartner,
          trackingNumber: trackingForm.trackingNumber
        });
      } catch { }

      showToast(`Logistics Tracking saved for ${editingTrackingOrder.orderId}`);
      setEditingTrackingOrder(null);
    } catch (err) {
      showToast('Error saving tracking: ' + err.message);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = orderStatusFilter === 'ALL'
        ? true
        : orderStatusFilter === 'SHIPPED'
          ? (o.orderStatus === 'SHIPPED' || o.orderStatus === 'OUT_FOR_DELIVERY')
          : o.orderStatus === orderStatusFilter;

      const q = orderSearchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
        (o.city && o.city.toLowerCase().includes(q));

      return matchStatus && matchQuery;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // 4. CUSTOMER AGGREGATION DIRECTORY
  const customersList = useMemo(() => {
    const custMap = new Map();
    orders.forEach(o => {
      const email = (o.customerEmail || o.customerPhone || 'unknown').toLowerCase();
      if (!custMap.has(email)) {
        custMap.set(email, {
          name: o.customerName || "Customer",
          email: o.customerEmail || "N/A",
          phone: o.customerPhone || "N/A",
          city: o.city || "New Delhi",
          state: o.state || "Delhi",
          address: o.shippingAddress || "",
          pincode: o.pincode || "",
          totalOrders: 1,
          totalSpent: Number(o.totalAmount) || 0,
          firstOrderDate: o.createdAt,
          lastOrderDate: o.createdAt,
          orders: [o]
        });
      } else {
        const c = custMap.get(email);
        c.totalOrders += 1;
        c.totalSpent += (Number(o.totalAmount) || 0);
        c.orders.push(o);
        if (new Date(o.createdAt) < new Date(c.firstOrderDate)) c.firstOrderDate = o.createdAt;
        if (new Date(o.createdAt) > new Date(c.lastOrderDate)) c.lastOrderDate = o.createdAt;
      }
    });

    return Array.from(custMap.values()).map(c => {
      const tier = c.totalSpent >= 25000 ? 'VIP Member' : c.totalSpent >= 10000 ? 'Gold Customer' : 'Standard Member';
      return { ...c, tier };
    });
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return customersList;
    return customersList.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  }, [customersList, customerSearchQuery]);

  // 5. SUPPORT TICKET REPLIES & STATUS UPDATES
  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedTicket) return;
    const newMsg = {
      sender: 'ADMIN',
      message: adminReplyText.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...selectedTicket,
      status: selectedTicket.status === 'OPEN' ? 'IN_PROGRESS' : selectedTicket.status,
      messages: [...(selectedTicket.messages || []), newMsg]
    };

    setSelectedTicket(updated);
    setTickets(prev => prev.map(t => t.ticketId === selectedTicket.ticketId ? updated : t));
    setAdminReplyText('');

    await replyAdminTicket(selectedTicket.ticketId, adminReplyText.trim()).catch(() => { });
    showToast('Reply dispatched to customer ticket!');
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await updateAdminTicketStatus(ticketId, newStatus).catch(() => { });
      setTickets(prev => prev.map(t => t.ticketId === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket && selectedTicket.ticketId === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`Ticket status updated to ${newStatus}`);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleCreateNewTicket = (e) => {
    e.preventDefault();
    if (!newTicketForm.customerName.trim() || !newTicketForm.subject.trim()) {
      showToast('Please provide Customer Name and Subject');
      return;
    }
    const ticketId = `TCK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      ticketId,
      customerName: newTicketForm.customerName.trim(),
      customerEmail: newTicketForm.customerEmail.trim() || 'customer@atomy.com',
      customerPhone: newTicketForm.customerPhone.trim() || '+91 98000 00000',
      subject: newTicketForm.subject.trim(),
      category: newTicketForm.category || 'COURIER_TRACKING',
      priority: newTicketForm.priority || 'MEDIUM',
      status: 'OPEN',
      orderId: newTicketForm.orderId.trim(),
      createdAt: new Date().toISOString(),
      messages: newTicketForm.initialMessage.trim() ? [
        {
          sender: 'CUSTOMER',
          message: newTicketForm.initialMessage.trim(),
          createdAt: new Date().toISOString()
        }
      ] : []
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    setSelectedTicket(newTicket);
    try {
      localStorage.setItem('atomy_admin_tickets', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setIsNewTicketModalOpen(false);
    setNewTicketForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      subject: '',
      category: 'COURIER_TRACKING',
      priority: 'MEDIUM',
      orderId: '',
      initialMessage: ''
    });
    showToast(`New Customer Ticket ${ticketId} created!`);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchStatus = ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter;
      const q = ticketSearchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        (t.ticketId && t.ticketId.toLowerCase().includes(q)) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.orderId && t.orderId.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [tickets, ticketStatusFilter, ticketSearchQuery]);

  return (
    <div className="admin-master-wrapper">
      {/* 1. Master Atomy Header */}
      <Header
        cartCount={0}
        onCartClick={() => { }}
        onNavigateHome={onBackToStore}
        currentView="admin"
        adminProfile={adminProfile}
        onLogout={onLogout}
        onNavigateAdminProfile={() => {
          setActiveTab('profile');
          setIsEditingProductView(false);
        }}
        notificationCount={
          (overviewStats.placedCount || 0) +
          (overviewStats.openTicketsCount || 0) +
          (overviewStats.lowStockCount || 0)
        }
        overviewStats={overviewStats}
        onSelectNotificationTab={(tab, filter) => {
          setActiveTab(tab);
          if (filter) setOrderStatusFilter(filter);
          setIsEditingProductView(false);
        }}
      />

      {/* 2. Top Emergency / High-Priority Alert Banner (Hits hard with audio chime) */}
      {activeAlert && (
        <div className={`admin-high-alert-banner ${activeAlert.type}`}>
          <div className="alert-content-left">
            <div className="alert-bell-pulse">
              {activeAlert.type === 'order' ? <Bell size={24} /> : <Headphones size={24} />}
            </div>
            <div>
              <div className="alert-badge-tag">{activeAlert.title}</div>
              <div className="alert-main-text">{activeAlert.message}</div>
            </div>
          </div>
          <div className="alert-actions-right">
            {activeAlert.type === 'order' ? (
              <button
                className="alert-btn-action"
                onClick={() => {
                  setActiveTab('orders');
                  setOrderStatusFilter('ALL');
                  setOrderSearchQuery(activeAlert.targetId);
                  const matched = orders.find(o => o.orderId === activeAlert.targetId);
                  if (matched) setSelectedOrderDetail(matched);
                  setActiveAlert(null);
                }}
              >
                Inspect & Update Status →
              </button>
            ) : (
              <button
                className="alert-btn-action"
                onClick={() => {
                  setActiveTab('support');
                  const matched = tickets.find(t => t.ticketId === activeAlert.targetId);
                  if (matched) setSelectedTicket(matched);
                  setActiveAlert(null);
                }}
              >
                Respond in Support Desk →
              </button>
            )}
            <button className="alert-btn-dismiss" onClick={() => setActiveAlert(null)}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Operational Quick Action Bar (Top Utilities) */}
      <div className="admin-quick-strip">
        <div className="quick-strip-left">
          <span className="live-status-dot"></span>
          <span className="live-status-title">Atomy India Operations Console</span>
          <span className="live-store-tag">Active Session</span>
        </div>

        <div className="quick-strip-right">
          <span style={{ fontSize: '11px', color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
            MySQL Connected • {products.length} Products Live
          </span>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="quick-refresh-btn"
            style={{ textDecoration: 'none', background: '#00a3e0', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Open Live Customer Store (http://localhost:5173)"
          >
            <ExternalLink size={13} />
            <span>Customer Store (5173)</span>
          </a>

          <button
            className="quick-refresh-btn"
            onClick={() => {
              syncWithBackend();
              showToast('Synced with live Atomy MySQL & cache');
            }}
            title="Refresh All Datasets"
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>

          {onLogout && (
            <button
              type="button"
              id="btn-admin-header-logout"
              onClick={onLogout}
              title="Sign Out from Administrator Session"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.28)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 11px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Connected Two-Column Layout */}
      <div className="admin-connected-body">
        {/* Left Master Sidebar - Clean text, no notification pills */}
        <aside className="admin-master-sidebar">
          <nav className="sidebar-nav-menu">
            <button
              className={`sidebar-nav-button ${activeTab === 'overview' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => { setActiveTab('overview'); setIsEditingProductView(false); }}
            >
              <LayoutDashboard size={20} />
              <span>Overview & KPIs</span>
            </button>

            <button
              className={`sidebar-nav-button ${(activeTab === 'inventory' || isEditingProductView) ? 'active' : ''}`}
              onClick={() => { setActiveTab('inventory'); setIsEditingProductView(false); }}
            >
              <Boxes size={20} />
              <span>{isEditingProductView ? 'Catalog Editor (Active)' : 'Inventory & Catalog'}</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'orders' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => { setActiveTab('orders'); setIsEditingProductView(false); }}
            >
              <Package size={20} />
              <span>Customer Orders</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'customers' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => { setActiveTab('customers'); setIsEditingProductView(false); }}
            >
              <Users size={20} />
              <span>Customer Directory</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'membership' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => { setActiveTab('membership'); setIsEditingProductView(false); }}
            >
              <Crown size={20} />
              <span>Membership & Privileges</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'support' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => { setActiveTab('support'); setIsEditingProductView(false); }}
            >
              <Headphones size={20} />
              <span>Customer Support Desk</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'settings' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => { setActiveTab('settings'); setIsEditingProductView(false); }}
            >
              <Settings size={20} />
              <span>Settings & Audio Alerts</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'floating-ad' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => { setActiveTab('floating-ad'); setIsEditingProductView(false); }}
            >
              <Sparkles size={20} />
              <span>Ads & Banner Promotions</span>
            </button>

            <button
              className={`sidebar-nav-button ${activeTab === 'profile' && !isEditingProductView ? 'active' : ''}`}
              onClick={() => { setActiveTab('profile'); setIsEditingProductView(false); }}
            >
              <User size={20} />
              <span>Admin Profile & Policies</span>
            </button>
          </nav>

          <div className="sidebar-footer-box">
            <div className="admin-status-indicator">
              <span className="dot-green"></span>
              <span>Online • {soundSettings.orderSoundEnabled ? 'Audio Chimes Active' : 'Sound Muted'}</span>
            </div>

            {onLogout && (
              <button
                type="button"
                id="btn-sidebar-admin-logout"
                onClick={onLogout}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '7px',
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogOut size={14} />
                <span>Sign Out Console</span>
              </button>
            )}
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <main className={`admin-main-panel ${isEditingProductView ? 'is-editor-mode' : ''}`}>
          {isEditingProductView ? (
            <ProductEditorPage
              initialData={currentEditingProduct}
              onSave={handleSaveProductFromEditor}
              onCancel={() => {
                setIsEditingProductView(false);
                setCurrentEditingProduct(null);
              }}
            />
          ) : (
            <>
              {/* ========================================================
                  TAB 1: DASHBOARD OVERVIEW PAGE
                  ======================================================== */}
              {activeTab === 'overview' && (
                <div className="admin-tab-content">
                  <div className="content-heading-row">
                    <div>
                      <h2 className="content-title">Dashboard Overview & Business Metrics</h2>
                      <p className="content-subtitle">
                        Real-time sales performance, today's customer order volume, and fulfillment pipelines.
                      </p>
                    </div>
                    <div className="heading-actions-cluster">
                      <button className="primary-action-btn" onClick={handleOpenAddProduct}>
                        <Plus size={16} />
                        <span>Add New Product</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Prominent Requested Sales KPI Cards: Today Sale, Today's Order, Overall Sale */}
                  <div className="atomy-sales-kpi-grid">
                    <div className="sales-kpi-card highlight-glow">
                      <div className="kpi-card-header">
                        <span className="kpi-card-badge">TODAY'S METRICS</span>
                        <TrendingUp size={22} className="kpi-icon-blue" />
                      </div>
                      <div className="kpi-card-title">Today's Total Sale</div>
                      <div className="kpi-card-val highlight-blue">
                        ₹ {overviewStats.todaySale.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="kpi-card-subtext">
                        From <strong>{overviewStats.todayOrdersCount} orders</strong> placed today
                      </div>
                    </div>

                    <div className="sales-kpi-card">
                      <div className="kpi-card-header">
                        <span className="kpi-card-badge">TODAY'S VOLUME</span>
                        <ShoppingBag size={22} className="kpi-icon-green" />
                      </div>
                      <div className="kpi-card-title">Today's Orders</div>
                      <div className="kpi-card-val">
                        {overviewStats.todayOrdersCount} <span className="kpi-unit">orders</span>
                      </div>
                      <div className="kpi-card-subtext">
                        Direct public consumer orders received
                      </div>
                    </div>

                    <div className="sales-kpi-card highlight-glow">
                      <div className="kpi-card-header">
                        <span className="kpi-card-badge">CUMULATIVE PERFORMANCE</span>
                        <IndianRupee size={22} className="kpi-icon-navy" />
                      </div>
                      <div className="kpi-card-title">Overall Total Sale</div>
                      <div className="kpi-card-val highlight-navy">
                        ₹ {overviewStats.overallSale.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="kpi-card-subtext">
                        Total lifetime gross revenue across all non-cancelled orders
                      </div>
                    </div>
                  </div>

                  {/* Order Status Pipeline Grid */}
                  <div className="pipeline-kpi-strip">
                    <div className="pipeline-card placed" onClick={() => { setActiveTab('orders'); setOrderStatusFilter('PLACED'); }}>
                      <div className="pipeline-label">New Orders (Placed)</div>
                      <div className="pipeline-val">{overviewStats.placedCount}</div>
                      <span className="pipeline-sub">Awaiting fulfillment</span>
                    </div>
                    <div className="pipeline-card processing" onClick={() => { setActiveTab('orders'); setOrderStatusFilter('PROCESSING'); }}>
                      <div className="pipeline-label">Pending (Processing)</div>
                      <div className="pipeline-val">{overviewStats.processingCount}</div>
                      <span className="pipeline-sub">Packaging at Hub</span>
                    </div>
                    <div className="pipeline-card shipped" onClick={() => { setActiveTab('orders'); setOrderStatusFilter('SHIPPED'); }}>
                      <div className="pipeline-label">Shipped & In Transit</div>
                      <div className="pipeline-val">{overviewStats.shippedCount}</div>
                      <span className="pipeline-sub">Out via Blue Dart</span>
                    </div>
                    <div className="pipeline-card delivered" onClick={() => { setActiveTab('orders'); setOrderStatusFilter('DELIVERED'); }}>
                      <div className="pipeline-label">Delivered Orders</div>
                      <div className="pipeline-val">{overviewStats.deliveredCount}</div>
                      <span className="pipeline-sub">Successfully fulfilled</span>
                    </div>
                  </div>

                  {/* Overview Details Split */}
                  <div className="atomy-overview-split">
                    {/* Recent Customer Orders */}
                    <div className="atomy-card-box">
                      <div className="card-box-header">
                        <div className="box-title-group">
                          <Package size={18} color="#00A3E0" />
                          <h3>Recent Customer Orders</h3>
                        </div>
                        <button className="link-button" onClick={() => setActiveTab('orders')}>
                          View All Orders ({orders.length}) →
                        </button>
                      </div>

                      {orders.length === 0 ? (
                        <div className="empty-box-note">No customer orders recorded yet.</div>
                      ) : (
                        <div className="recent-orders-list">
                          {orders.slice(0, 5).map((o) => (
                            <div
                              key={o.orderId}
                              className="recent-order-row clickable"
                              onClick={() => { setSelectedOrderDetail(o); }}
                            >
                              <div className="recent-order-left">
                                <span className="order-id-badge">{o.orderId}</span>
                                <div className="customer-info-line">
                                  <strong>{o.customerName}</strong> • {o.city} ({new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                </div>
                                <div className="order-items-snippet">
                                  {o.items?.map(it => `${it.productName || it.name || 'Product'} (x${it.quantity || it.qty || 1})`).join(', ') || '1 item'}
                                </div>
                              </div>
                              <div className="order-row-right">
                                <span className="order-price">₹ {Number(o.totalAmount).toLocaleString('en-IN')}</span>
                                <span className={`status-badge ${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Warehouse Stock Health & Quick Action Center */}
                    <div className="atomy-card-box">
                      <div className="card-box-header">
                        <div className="box-title-group">
                          <Boxes size={18} color="#00A3E0" />
                          <h3>Inventory & Stock Health</h3>
                        </div>
                        <button className="link-button" onClick={() => setActiveTab('inventory')}>
                          Manage Catalog →
                        </button>
                      </div>

                      <div className="inv-health-list">
                        <div className="health-row">
                          <span>Total Registered Catalog SKUs</span>
                          <strong>{products.length}</strong>
                        </div>
                        <div className="health-row">
                          <span>In Stock Products</span>
                          <strong className="text-green">
                            {products.filter(p => p.stockQuantity > (p.lowStockThreshold || 10)).length}
                          </strong>
                        </div>
                        <div className="health-row">
                          <span>Low Stock Warnings (&le; 10 units)</span>
                          <strong className="text-yellow">{overviewStats.lowStockCount}</strong>
                        </div>
                        <div className="health-row">
                          <span>Out of Stock SKUs</span>
                          <strong className="text-red">{overviewStats.outOfStockCount}</strong>
                        </div>
                      </div>

                      <div className="quick-actions-box">
                        <div className="quick-actions-title">OPERATIONAL SHORTCUTS</div>
                        <div className="quick-btn-grid">
                          <button className="quick-action-tile" onClick={handleOpenAddProduct}>
                            <Plus size={16} />
                            <span>Add Product</span>
                          </button>
                          <button className="quick-action-tile" onClick={() => { setActiveTab('orders'); setOrderStatusFilter('PLACED'); }}>
                            <Bell size={16} />
                            <span>Review New ({overviewStats.placedCount})</span>
                          </button>
                          <button className="quick-action-tile" onClick={() => setActiveTab('support')}>
                            <Headphones size={16} />
                            <span>Support Desk ({overviewStats.openTicketsCount})</span>
                          </button>
                          <button className="quick-action-tile" onClick={() => setActiveTab('settings')}>
                            <Volume2 size={16} />
                            <span>Sound Controls</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
              TAB 2: INVENTORY & CATALOG MANAGEMENT
              ======================================================== */}
              {activeTab === 'inventory' && (
                <div className="admin-tab-content">
                  <div className="content-heading-row with-filter">
                    <div>
                      <h2 className="content-title">Warehouse Inventory & Product Catalog</h2>
                      <p className="content-subtitle">
                        Add new products, remove items, adjust stock counts, and edit complete specifications.
                      </p>
                    </div>

                    <div className="heading-actions-cluster">
                      <button className="primary-action-btn" onClick={handleOpenAddProduct}>
                        <Plus size={16} />
                        <span>Add New Product Item</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Filter Toolbar */}
                  <div className="inventory-filter-toolbar">
                    <div className="search-input-wrapper">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search by Product Name, Category, or Product Number (e.g., HemoHIM, D00101)..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="atomy-search-input"
                      />
                      {productSearch && (
                        <button className="clear-search-btn" onClick={() => setProductSearch('')}>
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="category-pill-group">
                      {[
                        { id: 'ALL', label: 'All Categories' },
                        { id: 'hemohim', label: 'HemoHIM' },
                        { id: 'health', label: 'Health Care' },
                        { id: 'beauty', label: 'Beauty' },
                        { id: 'personal_care', label: 'Personal Care' },
                        { id: 'home', label: 'Home & Living' },
                        { id: 'food', label: 'Food & Drinks' },
                        { id: 'others', label: 'ETC / Others' }
                      ].map(c => (
                        <button
                          key={c.id}
                          className={`cat-filter-pill ${productCategoryFilter === c.id ? 'active' : ''}`}
                          onClick={() => setProductCategoryFilter(c.id)}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>

                    {/* Stock Status Filter */}
                    <div className="stock-filter-wrapper">
                      <select
                        value={productStockFilter}
                        onChange={(e) => setProductStockFilter(e.target.value)}
                        className="atomy-dropdown"
                      >
                        <option value="ALL">All Stock Statuses</option>
                        <option value="LOW">Low Stock Only (&le; 10)</option>
                        <option value="OUT">Out of Stock (0)</option>
                      </select>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="atomy-table-responsive catalog-scrollable-table">
                    <table className="atomy-data-table">
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Thumbnail</th>
                          <th style={{ width: '110px' }}>Product No.</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Customer Price</th>
                          <th>PV Points</th>
                          <th>Current Stock</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'center' }}>Stock Adjustment</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="table-empty-row">
                              <Boxes size={36} color="#94a3b8" />
                              <p>No products found matching your search and filter criteria.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <img
                                  src={p.image || "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg"}
                                  alt={p.name}
                                  className="table-product-thumb"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg";
                                  }}
                                />
                              </td>
                              <td className="mono-col">
                                <strong>{p.id}</strong>
                              </td>
                              <td>
                                <div className="cell-primary-text">{p.name}</div>
                                <div className="cell-secondary-text">{p.subcategory || 'Standard Catalog'}</div>
                              </td>
                              <td>
                                <span className="category-tag-badge">
                                  {p.categoryId === 'hemohim' || (p.name && p.name.toLowerCase().includes('hemohim'))
                                    ? 'HemoHIM'
                                    : (p.categoryId ? p.categoryId.charAt(0).toUpperCase() + p.categoryId.slice(1).replace('_', ' ') : 'General')}
                                </span>
                              </td>
                              <td className="cell-price">
                                ₹ {Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <div className="cell-mrp-sub">MRP: ₹ {p.originalPrice.toLocaleString('en-IN')}</div>
                                )}
                              </td>
                              <td>
                                <span className="pv-badge">{(Number(p.pv) || 0).toLocaleString('en-IN')} PV</span>
                              </td>
                              <td className="stock-number-cell">
                                <span className={`stock-count-bubble ${p.stockQuantity === 0 ? 'out' : p.stockQuantity <= (p.lowStockThreshold || 10) ? 'low' : 'good'}`}>
                                  {p.stockQuantity} units
                                </span>
                              </td>
                              <td>
                                <span className={`status-badge ${(p.status || '').toLowerCase()}`}>
                                  {p.stockQuantity === 0 ? 'OUT OF STOCK' : p.stockQuantity <= (p.lowStockThreshold || 10) ? 'LOW STOCK' : 'IN STOCK'}
                                </span>
                              </td>
                              <td>
                                <div className="stock-step-btn-group">
                                  <button
                                    className="stock-step-btn"
                                    onClick={() => handleQuickStockChange(p, -5)}
                                    title="Reduce 5 units"
                                  >
                                    -5
                                  </button>
                                  <button
                                    className="stock-step-btn"
                                    onClick={() => handleQuickStockChange(p, 10)}
                                    title="Add 10 units"
                                  >
                                    +10
                                  </button>
                                </div>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="row-actions-group">
                                  <button
                                    className="action-icon-btn edit"
                                    onClick={() => handleOpenEditProduct(p)}
                                    title="Edit Product Details & Specifications"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    className="action-icon-btn delete"
                                    onClick={() => setProductToDelete(p)}
                                    title="Remove Product from Store"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
              TAB 3: CUSTOMER ORDERS & FULFILLMENT
              ======================================================== */}
              {activeTab === 'orders' && (
                <div className="admin-tab-content">
                  <div className="content-heading-row with-filter">
                    <div>
                      <h2 className="content-title">Customer Orders & Logistics Fulfillment</h2>
                      <p className="content-subtitle">
                        Inspect orders placed by direct consumers, update delivery stages, and dispatch courier tracking.
                      </p>
                    </div>
                  </div>

                  {/* Status Tabs Strip */}
                  <div className="orders-status-nav-strip">
                    {[
                      { id: 'ALL', label: 'All Orders', count: orders.length },
                      { id: 'PLACED', label: 'New Orders', count: orders.filter(o => o.orderStatus === 'PLACED').length },
                      { id: 'PROCESSING', label: 'Pending / Processing', count: orders.filter(o => o.orderStatus === 'PROCESSING').length },
                      { id: 'SHIPPED', label: 'Shipped & Out for Delivery', count: orders.filter(o => o.orderStatus === 'SHIPPED' || o.orderStatus === 'OUT_FOR_DELIVERY').length },
                      { id: 'DELIVERED', label: 'Delivered', count: orders.filter(o => o.orderStatus === 'DELIVERED').length },
                      { id: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => o.orderStatus === 'CANCELLED').length }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        className={`order-status-tab ${orderStatusFilter === tab.id ? 'active' : ''}`}
                        onClick={() => setOrderStatusFilter(tab.id)}
                      >
                        <span>{tab.label}</span>
                        <span className="tab-count-badge">{tab.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Orders Search & Summary Filter Bar */}
                  <div className="orders-filter-row">
                    <div className="search-input-wrapper orders-search-box">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search by Order ID, Customer Name, Phone, or City..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="atomy-search-input"
                      />
                      {orderSearchQuery && (
                        <button className="clear-search-btn" onClick={() => setOrderSearchQuery('')}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <div className="orders-summary-pill">
                      <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> Orders</span>
                    </div>
                  </div>

                  {/* Orders Data Table */}
                  <div className="atomy-table-responsive orders-table-wrapper">
                    <table className="atomy-data-table orders-data-table">
                      <thead>
                        <tr>
                          <th style={{ width: '175px', minWidth: '175px' }}>Order ID & Date</th>
                          <th style={{ width: '210px', minWidth: '210px' }}>Customer Details</th>
                          <th style={{ minWidth: '240px' }}>Shipping Destination</th>
                          <th style={{ width: '120px', minWidth: '120px', textAlign: 'center' }}>Items Ordered</th>
                          <th style={{ width: '140px', minWidth: '140px', textAlign: 'right' }}>Total Amount</th>
                          <th style={{ width: '130px', minWidth: '130px', textAlign: 'center' }}>Payment</th>
                          <th style={{ width: '190px', minWidth: '190px', textAlign: 'center' }}>Fulfillment Status</th>
                          <th style={{ width: '185px', minWidth: '185px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="table-empty-row">
                              <Package size={40} color="#94a3b8" />
                              <p>No customer orders found in this category.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((o) => (
                            <tr key={o.orderId}>
                              <td>
                                <div className="order-id-badge">
                                  <span className="order-id-text">{o.orderId}</span>
                                </div>
                                <div className="order-date-text">
                                  {new Date(o.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                  <span className="order-time-text">
                                    {new Date(o.createdAt).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="cell-primary-text">{o.customerName}</div>
                                <div className="cell-secondary-text">{o.customerPhone}</div>
                                <div className="cell-secondary-text">{o.customerEmail}</div>
                              </td>
                              <td className="cell-address">
                                <div className="address-line-primary">{o.shippingAddress}</div>
                                <div className="address-line-sub">
                                  {o.city}, {o.state} <span className="pincode-pill">{o.pincode}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className="items-count-badge">
                                  {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }} className="cell-price-col">
                                <span className="order-total-amount">
                                  ₹ {Number(o.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`payment-pill ${(o.paymentStatus || 'PAID').toLowerCase()}`}>
                                  {o.paymentMethod ? o.paymentMethod.replace(/_/g, ' ') : 'ONLINE UPI'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {/* Direct Fulfillment Status Dropdown */}
                                <select
                                  value={o.orderStatus}
                                  onChange={(e) => handleUpdateOrderStatus(o.orderId, e.target.value)}
                                  className={`status-select ${o.orderStatus.toLowerCase()}`}
                                >
                                  <option value="PLACED">PLACED (New)</option>
                                  <option value="PROCESSING">PROCESSING (Pending)</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="row-actions-group">
                                  <button
                                    className="action-pill-btn detail"
                                    onClick={() => setSelectedOrderDetail(o)}
                                    title="Inspect Full Order Line Items & Invoice"
                                  >
                                    <Eye size={13} />
                                    <span>Inspect</span>
                                  </button>
                                  <button
                                    className="action-pill-btn tracking"
                                    onClick={() => handleOpenTrackingModal(o)}
                                    title="Update Courier Tracking Details"
                                  >
                                    <Truck size={13} />
                                    <span>Tracking</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
              TAB 4: CUSTOMER DETAILS DIRECTORY
              ======================================================== */}
              {activeTab === 'customers' && (
                <div className="admin-tab-content">
                  <div className="content-heading-row with-filter">
                    <div>
                      <h2 className="content-title">Customer Directory & Consumer Accounts</h2>
                      <p className="content-subtitle">
                        Registered customers, lifetime order frequency, and direct purchase histories.
                      </p>
                    </div>
                  </div>

                  {/* Customer Stats Strip */}
                  <div className="customer-kpi-grid">
                    <div className="sales-kpi-card">
                      <div className="kpi-card-header">
                        <span className="kpi-card-badge">TOTAL CONSUMERS</span>
                        <Users size={20} className="kpi-icon-blue" />
                      </div>
                      <div className="kpi-card-title">Registered Accounts</div>
                      <div className="kpi-card-val highlight-blue">
                        {customersList.length} <span className="kpi-unit">users</span>
                      </div>
                      <div className="kpi-card-subtext">Active registered shoppers</div>
                    </div>

                    <div className="sales-kpi-card">
                      <div className="kpi-card-header">
                        <span className="kpi-card-badge">REPEAT CUSTOMERS</span>
                        <ShieldCheck size={20} className="kpi-icon-green" />
                      </div>
                      <div className="kpi-card-title">Repeat Buyers</div>
                      <div className="kpi-card-val" style={{ color: '#16a34a' }}>
                        {customersList.filter(c => c.totalOrders > 1).length} <span className="kpi-unit">customers</span>
                      </div>
                      <div className="kpi-card-subtext">More than 1 purchase</div>
                    </div>

                    <div className="sales-kpi-card highlight-glow">
                      <div className="kpi-card-header">
                        <span className="kpi-card-badge">AVERAGE SPEND</span>
                        <IndianRupee size={20} className="kpi-icon-navy" />
                      </div>
                      <div className="kpi-card-title">Average Lifetime Value</div>
                      <div className="kpi-card-val highlight-navy">
                        ₹ {customersList.length > 0 ? Math.round(overviewStats.overallSale / customersList.length).toLocaleString('en-IN') : 0}
                      </div>
                      <div className="kpi-card-subtext">Per consumer lifetime value</div>
                    </div>
                  </div>

                  {/* Customer Search Bar */}
                  <div className="orders-filter-row">
                    <div className="search-input-wrapper">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search by Customer Name, Email, Phone, or City..."
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        className="atomy-search-input"
                      />
                      {customerSearchQuery && (
                        <button className="clear-search-btn" onClick={() => setCustomerSearchQuery('')}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Table */}
                  <div className="atomy-table-responsive">
                    <table className="atomy-data-table">
                      <thead>
                        <tr>
                          <th>Customer Name</th>
                          <th>Contact Details</th>
                          <th>Location</th>
                          <th>Total Orders</th>
                          <th>Lifetime Spend</th>
                          <th>Customer Tier</th>
                          <th>Last Order Date</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="table-empty-row">
                              <Users size={36} color="#94a3b8" />
                              <p>No customers found matching search.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredCustomers.map((c, idx) => (
                            <tr key={idx}>
                              <td>
                                <div className="customer-avatar-row">
                                  <div className="customer-avatar-circle">
                                    {c.name.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="cell-primary-text">{c.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="cell-secondary-text">{c.email}</div>
                                <div className="cell-secondary-text">{c.phone}</div>
                              </td>
                              <td>
                                <div>{c.city}, {c.state}</div>
                                <div className="cell-secondary-text">{c.pincode}</div>
                              </td>
                              <td>
                                <strong>{c.totalOrders} order{c.totalOrders > 1 ? 's' : ''}</strong>
                              </td>
                              <td className="cell-price">
                                ₹ {c.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td>
                                <span className={`tier-badge ${c.tier.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {c.tier}
                                </span>
                              </td>
                              <td className="cell-secondary-text">
                                {new Date(c.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  className="action-pill-btn detail"
                                  onClick={() => setSelectedCustomerDetail(c)}
                                >
                                  <Clock size={13} />
                                  <span>View History</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
              TAB: MEMBERSHIP & LOYALTY PRIVILEGE MANAGEMENT
              ======================================================== */}
              {activeTab === 'membership' && !isEditingProductView && (
                <div className="admin-tab-content">
                  <MembershipManagementPage />
                </div>
              )}

              {/* ========================================================
              TAB 5: CUSTOMER SUPPORT DESK
              ======================================================== */}
              {activeTab === 'support' && (
                <div className="admin-tab-content">
                  <div className="content-heading-row with-filter">
                    <div>
                      <h2 className="content-title">Customer Support Desk & Inquiries</h2>
                      <p className="content-subtitle">
                        Respond to direct customer tickets, order queries, PV sync assistance, and return requests in real time.
                      </p>
                    </div>
                    <div className="heading-actions-cluster">
                      <button
                        className="primary-action-btn"
                        onClick={() => setIsNewTicketModalOpen(true)}
                      >
                        <Plus size={16} />
                        <span>Log Customer Ticket</span>
                      </button>
                    </div>
                  </div>

                  {/* Support KPI Metrics Cards */}
                  <div className="support-kpi-grid">
                    <div className="support-kpi-card">
                      <div className="support-kpi-badge">TOTAL INQUIRIES</div>
                      <div className="support-kpi-val">{tickets.length}</div>
                      <div className="support-kpi-sub">Lifetime customer tickets logged</div>
                    </div>
                    <div className="support-kpi-card highlight-amber">
                      <div className="support-kpi-badge">OPEN & AWAITING REPLY</div>
                      <div className="support-kpi-val">{tickets.filter(t => t.status === 'OPEN').length}</div>
                      <div className="support-kpi-sub">Immediate response needed</div>
                    </div>
                    <div className="support-kpi-card highlight-blue">
                      <div className="support-kpi-badge">IN PROGRESS</div>
                      <div className="support-kpi-val">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</div>
                      <div className="support-kpi-sub">Investigation / logistics sync</div>
                    </div>
                    <div className="support-kpi-card highlight-green">
                      <div className="support-kpi-badge">SATISFACTION RATE</div>
                      <div className="support-kpi-val">98.4%</div>
                      <div className="support-kpi-sub">Avg resolution: 18 minutes</div>
                    </div>
                  </div>

                  {/* Support Search & Status Filter Toolbar */}
                  <div className="orders-filter-row">
                    <div className="search-input-wrapper orders-search-box">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search by Ticket ID, Customer Name, Subject, or Order ID..."
                        value={ticketSearchQuery}
                        onChange={(e) => setTicketSearchQuery(e.target.value)}
                        className="atomy-search-input"
                      />
                      {ticketSearchQuery && (
                        <button className="clear-search-btn" onClick={() => setTicketSearchQuery('')}>
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="filter-select-wrapper">
                      <Filter size={15} />
                      <select
                        value={ticketStatusFilter}
                        onChange={(e) => setTicketStatusFilter(e.target.value)}
                        className="atomy-dropdown"
                      >
                        <option value="ALL">All Statuses ({tickets.length})</option>
                        <option value="OPEN">OPEN ({tickets.filter(t => t.status === 'OPEN').length})</option>
                        <option value="IN_PROGRESS">IN PROGRESS ({tickets.filter(t => t.status === 'IN_PROGRESS').length})</option>
                        <option value="RESOLVED">RESOLVED ({tickets.filter(t => t.status === 'RESOLVED').length})</option>
                        <option value="CLOSED">CLOSED ({tickets.filter(t => t.status === 'CLOSED').length})</option>
                      </select>
                    </div>
                  </div>

                  {tickets.length === 0 ? (
                    <div className="support-empty-state-box">
                      <div className="support-empty-icon-bubble">
                        <Headphones size={38} color="#00A3E0" />
                      </div>
                      <h3 className="support-empty-headline">Customer Support Inbox is Clear</h3>
                      <p className="support-empty-description">
                        No customer inquiries or return tickets registered in the database yet. When a customer submits an inquiry from the customer storefront, it will immediately populate here in real time.
                      </p>
                      <div className="support-empty-status-pills">
                        <span className="status-pill-clean">
                          <span className="dot-green"></span> MySQL Database Connected
                        </span>
                        <span className="status-pill-clean">
                          <span className="dot-green"></span> Real-Time Order Sync Active
                        </span>
                      </div>
                      <div style={{ marginTop: '22px' }}>
                        <button
                          className="primary-action-btn"
                          onClick={() => setIsNewTicketModalOpen(true)}
                        >
                          <Plus size={15} />
                          <span>Log Manual Support Ticket</span>
                        </button>
                      </div>
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="table-empty-row" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px' }}>
                      <Headphones size={44} strokeWidth={1.2} color="#94a3b8" />
                      <p style={{ marginTop: '12px', fontSize: '15px', color: '#475569', fontWeight: '600' }}>No customer tickets match your current search or filter.</p>
                      <button
                        className="atomy-btn-primary"
                        style={{ marginTop: '16px' }}
                        onClick={() => {
                          setTicketStatusFilter('ALL');
                          setTicketSearchQuery('');
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="atomy-support-split">
                      {/* Left Tickets List */}
                      <div className="atomy-tickets-sidebar">
                        {filteredTickets.map((t) => (
                          <div
                            key={t.ticketId}
                            className={`ticket-summary-item ${selectedTicket?.ticketId === t.ticketId ? 'selected' : ''}`}
                            onClick={() => setSelectedTicket(t)}
                          >
                            <div className="ticket-item-top">
                              <span className="mono-ticket">{t.ticketId}</span>
                              <span className={`priority-tag ${(t.priority || '').toLowerCase()}`}>{t.priority}</span>
                            </div>
                            <h4 className="ticket-item-subject">{t.subject}</h4>
                            <div className="ticket-item-footer">
                              <span>{t.customerName}</span>
                              <span className={`status-badge ${(t.status || '').toLowerCase()}`}>{t.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right Detail & Chat Thread */}
                      <div className="atomy-ticket-thread-pane">
                        {selectedTicket ? (
                          <div className="thread-wrapper">
                            <div className="thread-top-bar">
                              <div>
                                <span className="mono-ticket">{selectedTicket.ticketId}</span>
                                <h3 className="thread-main-subject">{selectedTicket.subject}</h3>
                                <div className="thread-customer-meta">
                                  <span>Customer: <strong>{selectedTicket.customerName}</strong> ({selectedTicket.customerEmail}, {selectedTicket.customerPhone})</span>
                                  {selectedTicket.orderId && (
                                    <button
                                      className="link-button"
                                      style={{ marginLeft: '12px', color: '#00A3E0', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}
                                      onClick={() => {
                                        setActiveTab('orders');
                                        setOrderSearchQuery(selectedTicket.orderId);
                                      }}
                                    >
                                      Linked Order: {selectedTicket.orderId} &rarr;
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="thread-status-select-wrap">
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Status:</label>
                                <select
                                  value={selectedTicket.status}
                                  onChange={(e) => handleUpdateTicketStatus(selectedTicket.ticketId, e.target.value)}
                                  className="atomy-dropdown"
                                >
                                  <option value="OPEN">OPEN</option>
                                  <option value="IN_PROGRESS">IN PROGRESS</option>
                                  <option value="RESOLVED">RESOLVED</option>
                                  <option value="CLOSED">CLOSED</option>
                                </select>
                              </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="atomy-messages-stream">
                              {selectedTicket.messages?.map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`chat-row ${msg.sender === 'ADMIN' ? 'from-admin' : 'from-customer'}`}
                                >
                                  <div className="chat-bubble">
                                    <div className="chat-bubble-author">
                                      {msg.sender === 'ADMIN' ? 'Atomy Operations Support (You)' : selectedTicket.customerName}
                                    </div>
                                    <div className="chat-bubble-text">{msg.message}</div>
                                    <div className="chat-bubble-time">
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Admin Reply Form */}
                            <form onSubmit={handleSendTicketReply} className="atomy-reply-form">
                              <input
                                type="text"
                                placeholder="Type a response to the customer..."
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                className="atomy-reply-input"
                              />
                              <button type="submit" disabled={!adminReplyText.trim()} className="atomy-btn-primary">
                                <Send size={15} />
                                <span>Send Reply</span>
                              </button>
                            </form>
                          </div>
                        ) : (
                          <div className="no-ticket-placeholder">
                            <Headphones size={36} color="#94a3b8" />
                            <p>Select an inquiry from the left to view customer communication and respond.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
              TAB 6: SETTINGS & AUDIO NOTIFICATION PREFERENCES
              ======================================================== */}
              {/* ========================================================
              TAB 6: ADS, BANNERS & PROMOTION MANAGER (LANDING, CATEGORY, FLOATING)
              ======================================================== */}
              {activeTab === 'floating-ad' && (
                <AdPromotionManager showToast={showToast} />
              )}

              {activeTab === 'settings' && (
                <div className="admin-tab-content">
                  <div className="content-heading-row">
                    <div>
                      <h2 className="content-title">Admin Settings & Audio Notification Preferences</h2>
                      <p className="content-subtitle">
                        Configure store profile, synthesized real-time audio chimes, volume levels, and warehouse logistics.
                      </p>
                    </div>
                  </div>

                  <div className="settings-cards-grid">
                    {/* 1. Strong Audio Alert Configuration */}
                    <div className="settings-section-card">
                      <div className="settings-card-header">
                        <Volume2 size={20} color="#00A3E0" />
                        <div>
                          <h3>Real-Time Strong Audio Alerts</h3>
                          <p>High-impact synthesizer chimes when orders and customer inquiries arrive</p>
                        </div>
                      </div>

                      <div className="settings-body-form">
                        <div className="setting-toggle-row">
                          <div>
                            <div className="setting-title">New Order Arrival Chime</div>
                            <div className="setting-desc">Ascending 4-tone melodic fanfare (E5 &rarr; G#5 &rarr; B5 &rarr; E6) on new order placement</div>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={soundSettings.orderSoundEnabled}
                              onChange={(e) => setSoundSettings({ ...soundSettings, orderSoundEnabled: e.target.checked })}
                            />
                            <span className="slider round"></span>
                          </label>
                        </div>

                        <div className="setting-toggle-row">
                          <div>
                            <div className="setting-title">Customer Support Ticket Chime</div>
                            <div className="setting-desc">Urgent dual-pulse emergency alert (A5 &rarr; D6) when an inquiry is submitted</div>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={soundSettings.supportSoundEnabled}
                              onChange={(e) => setSoundSettings({ ...soundSettings, supportSoundEnabled: e.target.checked })}
                            />
                            <span className="slider round"></span>
                          </label>
                        </div>

                        <div className="setting-field-group">
                          <label>Chime Volume Level: <strong>{Math.round(soundSettings.volume * 100)}%</strong></label>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={soundSettings.volume}
                            onChange={(e) => setSoundSettings({ ...soundSettings, volume: parseFloat(e.target.value) })}
                            className="volume-slider"
                          />
                        </div>

                        <div className="test-buttons-row">
                          <button type="button" className="test-action-btn" onClick={handleTestOrderSound}>
                            <Volume2 size={15} />
                            <span>Test Order Sound Now</span>
                          </button>
                          <button type="button" className="test-action-btn" onClick={handleTestSupportSound}>
                            <Headphones size={15} />
                            <span>Test Support Sound Now</span>
                          </button>
                        </div>

                        <div className="setting-field-group" style={{ marginTop: '16px' }}>
                          <label>Background Auto-Polling Interval</label>
                          <select
                            value={soundSettings.pollingIntervalSec}
                            onChange={(e) => setSoundSettings({ ...soundSettings, pollingIntervalSec: parseInt(e.target.value) })}
                            className="atomy-dropdown"
                          >
                            <option value="5">Every 5 Seconds (Ultra fast)</option>
                            <option value="10">Every 10 Seconds (Recommended)</option>
                            <option value="30">Every 30 Seconds</option>
                            <option value="60">Every 60 Seconds</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 2. Store Profile Configuration */}
                    <div className="settings-section-card">
                      <div className="settings-card-header">
                        <ShieldCheck size={20} color="#00A3E0" />
                        <div>
                          <h3>Official Store Profile & Contacts</h3>
                          <p>Business information displayed on customer order sheets and invoices</p>
                        </div>
                      </div>

                      <div className="settings-body-form">
                        <div className="setting-field-group">
                          <label>Store Entity Name</label>
                          <input
                            type="text"
                            value={storeSettings.storeName}
                            onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                            className="atomy-form-input"
                          />
                        </div>

                        <div className="setting-field-group">
                          <label>Toll Free Helpline</label>
                          <input
                            type="text"
                            value={storeSettings.helpline}
                            onChange={(e) => setStoreSettings({ ...storeSettings, helpline: e.target.value })}
                            className="atomy-form-input"
                          />
                        </div>

                        <div className="setting-field-group">
                          <label>Support Email Address</label>
                          <input
                            type="email"
                            value={storeSettings.supportEmail}
                            onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                            className="atomy-form-input"
                          />
                        </div>

                        <div className="setting-field-group">
                          <label>Main Fulfillment Center Location</label>
                          <input
                            type="text"
                            value={storeSettings.fulfillmentCenter}
                            onChange={(e) => setStoreSettings({ ...storeSettings, fulfillmentCenter: e.target.value })}
                            className="atomy-form-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Logistics & Fulfillment Rules */}
                    <div className="settings-section-card">
                      <div className="settings-card-header">
                        <Truck size={20} color="#00A3E0" />
                        <div>
                          <h3>Fulfillment & Logistics Rules</h3>
                          <p>Default couriers and inventory warning thresholds</p>
                        </div>
                      </div>

                      <div className="settings-body-form">
                        <div className="setting-field-group">
                          <label>Default Courier Partner</label>
                          <select
                            value={storeSettings.defaultCourier}
                            onChange={(e) => setStoreSettings({ ...storeSettings, defaultCourier: e.target.value })}
                            className="atomy-dropdown"
                          >
                            <option value="Blue Dart Express">Blue Dart Express (Priority Partner)</option>
                            <option value="Delhivery Logistics">Delhivery Logistics</option>
                            <option value="DTDC Express">DTDC Express</option>
                          </select>
                        </div>

                        <div className="setting-field-group">
                          <label>Free Shipping Minimum Order (₹)</label>
                          <input
                            type="number"
                            value={storeSettings.freeShippingThreshold}
                            onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                            className="atomy-form-input"
                          />
                        </div>

                        <div className="setting-field-group">
                          <label>Default Low Stock Warning Limit (units)</label>
                          <input
                            type="number"
                            value={storeSettings.defaultLowStockAlert}
                            onChange={(e) => setStoreSettings({ ...storeSettings, defaultLowStockAlert: parseInt(e.target.value) || 10 })}
                            className="atomy-form-input"
                          />
                        </div>

                        <button
                          className="atomy-btn-primary"
                          style={{ marginTop: '20px' }}
                          onClick={() => showToast('Preferences and store settings saved successfully!')}
                        >
                          Save All Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
              TAB 7: ADMIN PROFILE & REFUND/REPLACEMENT CENTER
              ======================================================== */}
              {activeTab === 'profile' && !isEditingProductView && (
                <div className="tab-pane-content">
                  {/* Profile Hero Card */}
                  <div className="admin-profile-hero-card">
                    <div className="profile-hero-left">
                      <div className="profile-avatar-large">
                        {adminProfile.name.charAt(0)}
                      </div>
                      <div>
                        <div className="profile-badge-row">
                          <span className="profile-role-badge">{adminProfile.role}</span>
                          <span className="profile-status-badge">● Active Session</span>
                        </div>
                        <h2 className="profile-hero-name">{adminProfile.name}</h2>
                        <p className="profile-hero-meta">
                          {adminProfile.employeeId} • {adminProfile.department} • {adminProfile.location}
                        </p>
                      </div>
                    </div>
                    <div className="profile-hero-right">
                      <div className="profile-stat-box">
                        <span className="stat-label">Security Protocol</span>
                        <span className="stat-value" style={{ color: '#16a34a' }}>2FA Protected</span>
                      </div>
                      <div className="profile-stat-box">
                        <span className="stat-label">Last Session Audit</span>
                        <span className="stat-value">{adminProfile.lastLogin}</span>
                      </div>
                      {onLogout && (
                        <button
                          type="button"
                          id="btn-profile-terminate-session"
                          onClick={onLogout}
                          style={{
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <LogOut size={15} />
                          <span>Sign Out Session</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Profile Details & Security Grid */}
                  <div className="profile-grid-cards">
                    {/* Personal & Station Information */}
                    <div className="settings-section-card">
                      <div className="settings-card-header">
                        <User size={20} color="#00A3E0" />
                        <div>
                          <h3>Administrator Details</h3>
                          <p>Personal profile & office station credentials</p>
                        </div>
                      </div>
                      <div className="settings-body-form">
                        <div className="setting-field-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            value={adminProfile.name}
                            onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                            className="atomy-form-input"
                          />
                        </div>
                        <div className="setting-field-group">
                          <label>Official Email</label>
                          <input
                            type="email"
                            value={adminProfile.email}
                            onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                            className="atomy-form-input"
                          />
                        </div>
                        <div className="setting-field-group">
                          <label>Phone Number</label>
                          <input
                            type="text"
                            value={adminProfile.phone}
                            onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                            className="atomy-form-input"
                          />
                        </div>
                        <div className="setting-field-group">
                          <label>Employee ID & Department</label>
                          <input
                            type="text"
                            value={`${adminProfile.employeeId} - ${adminProfile.department}`}
                            disabled
                            className="atomy-form-input"
                            style={{ backgroundColor: '#f1f5f9' }}
                          />
                        </div>
                        <button
                          className="atomy-btn-primary"
                          style={{ marginTop: '14px' }}
                          onClick={() => {
                            localStorage.setItem('atomy_admin_profile', JSON.stringify(adminProfile));
                            showToast('Admin Profile credentials updated successfully!');
                          }}
                        >
                          Save Profile Changes
                        </button>
                      </div>
                    </div>

                    {/* Security & Access Level */}
                    <div className="settings-section-card">
                      <div className="settings-card-header">
                        <ShieldCheck size={20} color="#16a34a" />
                        <div>
                          <h3>Security & Authorization</h3>
                          <p>Access privileges and audit compliance</p>
                        </div>
                      </div>
                      <div className="settings-body-form">
                        <div className="security-item-row">
                          <div>
                            <strong>Two-Factor Authentication</strong>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Authenticator app / SMS OTP active</div>
                          </div>
                          <span className="profile-role-badge" style={{ background: '#dcfce7', color: '#15803d' }}>ENABLED</span>
                        </div>

                        <div className="security-item-row">
                          <div>
                            <strong>Terminal Session IP</strong>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{adminProfile.sessionIp}</div>
                          </div>
                          <span className="profile-role-badge">SECURE</span>
                        </div>

                        <div className="permission-matrix-box" style={{ marginTop: '14px' }}>
                          <div className="matrix-title">Assigned Super Admin Permissions:</div>
                          <div className="matrix-items">
                            <span className="perm-pill">✓ Full Catalog & Inventory Management</span>
                            <span className="perm-pill">✓ Customer Order Processing & Status Override</span>
                            <span className="perm-pill">✓ Refund Approvals & Payment Gateway Reversals</span>
                            <span className="perm-pill">✓ 1-to-1 Replacement Dispatch Authorization</span>
                            <span className="perm-pill">✓ Live Ads, Banners & Promotion Campaigns</span>
                            <span className="perm-pill">✓ Audio Chimes & Sound Alert Configuration</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Section: Refund & Replacement Management and Policy */}
                  <div className="settings-section-card" style={{ marginTop: '24px' }}>
                    <div className="settings-card-header">
                      <RotateCcw size={20} color="#00A3E0" />
                      <div>
                        <h3>Atomy India Refund & Replacement Policy and Operations Center</h3>
                        <p>Official policy standards, return rules, and administrative execution workflows</p>
                      </div>
                    </div>

                    <div className="settings-body-form">
                      {/* Policy Pillars Grid */}
                      <div className="policy-pillars-grid">
                        <div className="pillar-card">
                          <div className="pillar-num">POLICY 01</div>
                          <h4>30-Day Money-Back Guarantee</h4>
                          <p>
                            Atomy India provides a 100% satisfaction guarantee. Customers can return unopened or gently tested products within 30 days of delivery if they are dissatisfied with the quality or results.
                          </p>
                        </div>

                        <div className="pillar-card">
                          <div className="pillar-num">POLICY 02</div>
                          <h4>Zero-Cost Replacement for Damaged Goods</h4>
                          <p>
                            Items received broken, leaked in transit, or defective qualify for an immediate 1-to-1 replacement. Reverse logistics pickup is dispatched through Blue Dart or Delhivery at zero expense to the consumer.
                          </p>
                        </div>

                        <div className="pillar-card">
                          <div className="pillar-num">POLICY 03</div>
                          <h4>Direct Payment Reversal (UPI / Cards / NetBanking)</h4>
                          <p>
                            Approved refunds are credited back to the customer's original payment method within 5 to 7 business days. Point Value (PV) earned on returned items is automatically adjusted from the member ledger.
                          </p>
                        </div>
                      </div>

                      {/* Operational Step-by-Step Box */}
                      <div className="refund-workflow-box" style={{ marginTop: '20px' }}>
                        <h4 style={{ margin: '0 0 12px', color: '#0369a1', fontSize: '14px', fontWeight: '800' }}>
                          How Admins Process Refunds & Replacements in this Console:
                        </h4>
                        <div className="workflow-steps">
                          <div className="wf-step">
                            <span className="step-badge">Step 1</span>
                            <div>
                              <strong>Customer Request Received:</strong> Customer submits a ticket via Support Desk (Category: <code>REFUND_REQUEST</code> or <code>DAMAGED_PRODUCT</code>) or requests cancellation on Order details.
                            </div>
                          </div>
                          <div className="wf-step">
                            <span className="step-badge">Step 2</span>
                            <div>
                              <strong>Verification & Inspection:</strong> Admin reviews courier tracking status, product invoice, and any unboxing video/photo proof attached to the support ticket.
                            </div>
                          </div>
                          <div className="wf-step">
                            <span className="step-badge">Step 3</span>
                            <div>
                              <strong>One-Click Execution:</strong> For refunds, click <em>"Process Refund"</em> in the Order Inspector to transition status to <code>REFUNDED</code> / <code>CANCELLED</code>. For replacements, dispatch a fresh shipment note to Blue Dart.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Button to jump to orders or support */}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
                        <button
                          className="atomy-btn-primary"
                          onClick={() => {
                            setActiveTab('orders');
                            setOrderStatusFilter('ALL');
                          }}
                        >
                          Go to Customer Orders (Process Refunds)
                        </button>
                        <button
                          className="atomy-btn-secondary"
                          onClick={() => {
                            setActiveTab('support');
                            setTicketStatusFilter('ALL');
                          }}
                        >
                          Open Support Desk (Review Tickets)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL: CONFIRM PRODUCT REMOVAL
          ======================================================== */}
      {productToDelete && (
        <div className="modal-backdrop-overlay" onClick={() => setProductToDelete(null)}>
          <div className="atomy-modal-box compact" onClick={(e) => e.stopPropagation()}>
            <div className="atomy-modal-header">
              <h3 className="text-red">Confirm Product Removal</h3>
              <button className="atomy-modal-close" onClick={() => setProductToDelete(null)}>
                &times;
              </button>
            </div>
            <div className="atomy-modal-body">
              <p>
                Are you sure you want to remove <strong>{productToDelete.name}</strong> (Code: <code>{productToDelete.id}</code>) from the public store catalog?
              </p>
              <div className="modal-actions-right" style={{ marginTop: '20px' }}>
                <button className="atomy-btn-secondary" onClick={() => setProductToDelete(null)}>
                  Cancel
                </button>
                <button className="atomy-btn-danger" onClick={handleConfirmDeleteProduct}>
                  Yes, Remove Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ORDER DETAILS INSPECTOR
          ======================================================== */}
      {/* ========================================================
          MODAL: ORDER INSPECTION & TIMELINE
          ======================================================== */}
      {selectedOrderDetail && (
        <div className="modal-backdrop-overlay" onClick={() => setSelectedOrderDetail(null)}>
          <div className="atomy-modal-box wide order-inspection-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="atomy-modal-header">
              <div className="modal-title-cluster">
                <Package size={22} color="#00A3E0" />
                <h3>Order Inspection: {selectedOrderDetail.orderId}</h3>
              </div>
              <button className="atomy-modal-close" onClick={() => setSelectedOrderDetail(null)}>
                &times;
              </button>
            </div>

            <div className="atomy-modal-body">
              {/* Live Animated Delivery Stepper matching Customer Experience */}
              <DeliveryStatusStepper order={selectedOrderDetail} />

              {/* Customer & Delivery Meta Grid */}
              <div className="order-meta-info-grid">
                <div className="meta-info-card">
                  <div className="meta-card-label">CUSTOMER DETAILS</div>
                  <div className="meta-card-main">{selectedOrderDetail.customerName}</div>
                  <div className="meta-card-sub">{selectedOrderDetail.customerPhone}</div>
                  <div className="meta-card-sub">{selectedOrderDetail.customerEmail}</div>
                </div>

                <div className="meta-info-card">
                  <div className="meta-card-label">DELIVERY DESTINATION</div>
                  <div className="meta-card-main">{selectedOrderDetail.shippingAddress}</div>
                  <div className="meta-card-sub">{selectedOrderDetail.city}, {selectedOrderDetail.state} - {selectedOrderDetail.pincode}</div>
                </div>

                <div className="meta-info-card">
                  <div className="meta-card-label">PAYMENT & STATUS</div>
                  <div className="meta-card-main">
                    ₹ {Number(selectedOrderDetail.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="meta-card-sub">
                    Method: {selectedOrderDetail.paymentMethod || 'ONLINE'} • {selectedOrderDetail.paymentStatus || 'PAID'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="order-items-detail-title">Purchased Items Breakdown</div>
              <div className="atomy-table-responsive" style={{ maxHeight: '250px' }}>
                <table className="atomy-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Item</th>
                      <th>Product Name</th>
                      <th>Product Code</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>PV</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderDetail.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <img
                            src={it.productImage || "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg"}
                            alt={it.productName}
                            className="table-product-thumb"
                            onError={(e) => {
                              e.currentTarget.src = "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg";
                            }}
                          />
                        </td>
                        <td>
                          <strong>{it.productName}</strong>
                        </td>
                        <td className="mono-col">{it.productId || '-'}</td>
                        <td>{it.quantity}</td>
                        <td>₹ {Number(it.unitPrice || it.price).toLocaleString('en-IN')}</td>
                        <td>{(Number(it.pv) || 0).toLocaleString('en-IN')} PV</td>
                        <td style={{ textAlign: 'right' }} className="cell-price">
                          ₹ {((Number(it.unitPrice || it.price) || 0) * (it.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Status Update Dropdown & Bottom Actions Alignment */}
              <div className="order-modal-footer-row">
                <div className="status-update-control">
                  <label className="status-update-label">Update Order Status:</label>
                  <select
                    value={selectedOrderDetail.orderStatus}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrderDetail.orderId, e.target.value)}
                    className="atomy-dropdown status-modal-dropdown"
                  >
                    <option value="PLACED">PLACED (New)</option>
                    <option value="PROCESSING">PROCESSING (Pending)</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="modal-actions-right">
                  <button
                    className="order-footer-btn refund-btn"
                    onClick={() => handleProcessRefund(selectedOrderDetail.orderId)}
                    title="Process Refund & Payment Reversal"
                  >
                    <RotateCcw size={15} />
                    <span>Process Refund</span>
                  </button>
                  <button
                    className="order-footer-btn courier-btn"
                    onClick={() => {
                      const o = selectedOrderDetail;
                      setSelectedOrderDetail(null);
                      handleOpenTrackingModal(o);
                    }}
                  >
                    <Truck size={15} />
                    <span>Courier Tracking Details</span>
                  </button>
                  <button className="order-footer-btn done-btn" onClick={() => setSelectedOrderDetail(null)}>
                    <span>Done</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: COURIER TRACKING & LOGISTICS
          ======================================================== */}
      {editingTrackingOrder && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingTrackingOrder(null)}>
          <div className="atomy-modal-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="atomy-modal-header">
              <div className="modal-title-cluster">
                <Truck size={20} color="#00A3E0" />
                <h3>Shipment Tracking: {editingTrackingOrder.orderId}</h3>
              </div>
              <button className="atomy-modal-close" onClick={() => setEditingTrackingOrder(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="atomy-modal-body">
              {/* Live Animated Delivery Stepper matching Customer Experience */}
              <DeliveryStatusStepper
                order={{
                  ...editingTrackingOrder,
                  orderStatus: trackingForm.currentStatus,
                  status: trackingForm.currentStatus,
                  courier: trackingForm.courierPartner,
                  trackingNumber: trackingForm.trackingNumber
                }}
              />

              {/* Shipping Stage Update */}
              <div className="modal-form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Fulfillment & Delivery Stage</span>
                  <span style={{ fontSize: '11.5px', color: '#00A3E0', fontWeight: 'normal' }}>
                    Select a stage to preview vehicle movement animation
                  </span>
                </label>
                <select
                  value={trackingForm.currentStatus}
                  onChange={(e) => setTrackingForm({ ...trackingForm, currentStatus: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #00A3E0',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="PLACED">Stage 1: PLACED (Payment Confirmed)</option>
                  <option value="PROCESSING">Stage 2: PROCESSING (Warehouse Packing)</option>
                  <option value="SHIPPED">Stage 3: SHIPPED (In Transit - Blue Dart Line-haul)</option>
                  <option value="OUT_FOR_DELIVERY">Stage 4: OUT FOR DELIVERY (Delivery Executive on Bike)</option>
                  <option value="DELIVERED">Stage 5: DELIVERED (Package Received)</option>
                </select>
              </div>

              <div className="modal-row-2">
                <div className="modal-form-group">
                  <label>Courier Service Partner</label>
                  <input
                    type="text"
                    value={trackingForm.courierPartner}
                    onChange={(e) => setTrackingForm({ ...trackingForm, courierPartner: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label>AWB Tracking Number</label>
                  <input
                    type="text"
                    value={trackingForm.trackingNumber}
                    onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-form-group">
                  <label>Current Location Hub</label>
                  <input
                    type="text"
                    value={trackingForm.currentLocation}
                    onChange={(e) => setTrackingForm({ ...trackingForm, currentLocation: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label>Estimated Delivery</label>
                  <input
                    type="text"
                    value={trackingForm.estimatedDelivery}
                    onChange={(e) => setTrackingForm({ ...trackingForm, estimatedDelivery: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions-right">
                <button type="button" className="atomy-btn-secondary" onClick={() => setEditingTrackingOrder(null)}>
                  Cancel
                </button>
                <button type="submit" className="atomy-btn-primary">
                  Save Logistics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CUSTOMER PROFILE & ORDER HISTORY
          ======================================================== */}
      {selectedCustomerDetail && (
        <div className="modal-backdrop-overlay" onClick={() => setSelectedCustomerDetail(null)}>
          <div className="atomy-modal-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="atomy-modal-header">
              <div className="modal-title-cluster">
                <Users size={20} color="#00A3E0" />
                <h3>Customer Profile: {selectedCustomerDetail.name}</h3>
              </div>
              <button className="atomy-modal-close" onClick={() => setSelectedCustomerDetail(null)}>
                &times;
              </button>
            </div>

            <div className="atomy-modal-body">
              <div className="customer-profile-banner">
                <div className="profile-banner-left">
                  <div className="avatar-big">{selectedCustomerDetail.name.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <h3>{selectedCustomerDetail.name}</h3>
                    <div className="profile-contact-line">
                      <span>{selectedCustomerDetail.email}</span> • <span>{selectedCustomerDetail.phone}</span>
                    </div>
                    <div className="profile-address-line">
                      <MapPin size={13} />
                      <span>{selectedCustomerDetail.address || `${selectedCustomerDetail.city}, ${selectedCustomerDetail.state}`}</span>
                    </div>
                  </div>
                </div>
                <div className="profile-banner-right">
                  <span className={`tier-badge ${selectedCustomerDetail.tier.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedCustomerDetail.tier}
                  </span>
                  <div className="profile-spend-stat">
                    <span>Lifetime Spend</span>
                    <strong>₹ {selectedCustomerDetail.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              </div>

              <div className="order-items-detail-title" style={{ marginTop: '20px' }}>
                Order Purchase History ({selectedCustomerDetail.orders.length} orders)
              </div>

              <div className="atomy-table-responsive" style={{ maxHeight: '280px' }}>
                <table className="atomy-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomerDetail.orders.map((o) => (
                      <tr key={o.orderId}>
                        <td className="mono-col"><strong>{o.orderId}</strong></td>
                        <td className="cell-secondary-text">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          {o.items?.map(i => `${i.productName} (x${i.quantity})`).join(', ') || '1 item'}
                        </td>
                        <td className="cell-price">
                          ₹ {Number(o.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`status-badge ${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="action-pill-btn detail"
                            onClick={() => {
                              setSelectedCustomerDetail(null);
                              setSelectedOrderDetail(o);
                            }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions-right" style={{ marginTop: '20px' }}>
                <button className="atomy-btn-primary" onClick={() => setSelectedCustomerDetail(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: LOG NEW CUSTOMER SUPPORT TICKET
          ======================================================== */}
      {isNewTicketModalOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsNewTicketModalOpen(false)}>
          <div className="atomy-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="atomy-modal-header">
              <div className="modal-title-cluster">
                <Headphones size={20} color="#00A3E0" />
                <h3>Log New Customer Support Ticket</h3>
              </div>
              <button className="atomy-modal-close" onClick={() => setIsNewTicketModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewTicket} className="atomy-modal-body">
              <div className="modal-row-2">
                <div className="form-group">
                  <label>Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newTicketForm.customerName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerName: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Customer Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98112 34567"
                    value={newTicketForm.customerPhone}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerPhone: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="form-group">
                  <label>Customer Email</label>
                  <input
                    type="email"
                    placeholder="e.g. priya.sharma@gmail.com"
                    value={newTicketForm.customerEmail}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerEmail: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Linked Order ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-20261005-5694"
                    value={newTicketForm.orderId}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, orderId: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="atomy-dropdown"
                  >
                    <option value="COURIER_TRACKING">Courier & Delivery Tracking</option>
                    <option value="PV_SYNC">PV Points & Member Genealogy</option>
                    <option value="RETURN_EXCHANGE">Return & Replacement Policy</option>
                    <option value="PRODUCT_USAGE">Product Usage & Guidance</option>
                    <option value="GENERAL">General Customer Inquiry</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="atomy-dropdown"
                  >
                    <option value="HIGH">HIGH (Urgent)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Ticket Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Dart tracking airway bill request for HemoHIM order"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="atomy-form-input"
                />
              </div>

              <div className="form-group">
                <label>Initial Customer Message / Query Note</label>
                <textarea
                  rows={3}
                  placeholder="Record what the customer asked or reported..."
                  value={newTicketForm.initialMessage}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, initialMessage: e.target.value })}
                  className="atomy-form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-actions-right" style={{ marginTop: '20px' }}>
                <button type="button" className="atomy-btn-secondary" onClick={() => setIsNewTicketModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="atomy-btn-primary">
                  Create & Open Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <span className="toast-dot"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
