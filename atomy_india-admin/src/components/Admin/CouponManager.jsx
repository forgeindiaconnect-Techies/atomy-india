import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Check,
  ChevronDown,
  Copy,
  Edit2,
  Trash2,
  Sparkles,
  Percent,
  IndianRupee,
  Truck,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Tag,
  Gift,
  ArrowRight,
  X,
  HelpCircle
} from 'lucide-react';
import {
  fetchCouponsFromBackend,
  saveCouponToBackend,
  deleteCouponFromBackend
} from '../../services/couponService';
import './CouponManager.css';

const STORAGE_KEY = 'atomy_admin_coupons';
const CUSTOMER_STORAGE_KEY = 'atomy_coupons';

const DEFAULT_COUPONS = [
  {
    id: 'cpn-welcome10',
    code: 'WELCOME10',
    title: 'New Member Welcome Voucher',
    description: 'Get instant 10% off on your first purchase of health supplements and absolute skincare.',
    discountType: 'PERCENTAGE', // 'PERCENTAGE' | 'FLAT' | 'FREE_SHIPPING'
    discountValue: 10,
    discountDisplay: '10% OFF',
    minOrderValue: 1500,
    maxDiscountCap: 500,
    categoryScope: 'ALL', // 'ALL' | 'HEALTH' | 'BEAUTY' | 'PERSONAL' | 'FOOD'
    targetProduct: 'ALL',
    firstOrderOnly: true,
    validTill: '2026-12-31',
    status: 'ACTIVE', // 'ACTIVE' | 'PAUSED' | 'EXPIRED'
    usageLimit: 500,
    usageCount: 142,
    createdAt: '2026-09-01'
  },
  {
    id: 'cpn-freeship',
    code: 'ATOMYFREESHIP',
    title: 'Free Shipping Across India',
    description: 'Waives 100% standard delivery and courier fees across all Indian pincodes via Blue Dart.',
    discountType: 'FREE_SHIPPING',
    discountValue: 0,
    discountDisplay: 'FREE DELIVERY',
    minOrderValue: 1000,
    maxDiscountCap: 0,
    categoryScope: 'ALL',
    targetProduct: 'ALL',
    firstOrderOnly: false,
    validTill: '2026-11-15',
    status: 'ACTIVE',
    usageLimit: 1000,
    usageCount: 420,
    createdAt: '2026-09-15'
  },
  {
    id: 'cpn-festive500',
    code: 'FESTIVE500',
    title: 'Festive Season Gift Coupon',
    description: 'Flat ₹500 discount on orders above ₹4,000. Stackable with member PV accumulation.',
    discountType: 'FLAT',
    discountValue: 500,
    discountDisplay: '₹500 OFF',
    minOrderValue: 4000,
    maxDiscountCap: 500,
    categoryScope: 'ALL',
    targetProduct: 'ALL',
    firstOrderOnly: false,
    validTill: '2026-11-30',
    status: 'ACTIVE',
    usageLimit: 300,
    usageCount: 89,
    createdAt: '2026-10-01'
  },
  {
    id: 'cpn-hemohim20',
    code: 'HEMOHIM20',
    title: 'Immunity Special - HemoHIM Offer',
    description: 'Exclusive 20% privilege discount on all HemoHIM multi-packs and health boxes.',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    discountDisplay: '20% OFF',
    minOrderValue: 10000,
    maxDiscountCap: 2500,
    categoryScope: 'HEALTH',
    targetProduct: 'HEMOHIM',
    firstOrderOnly: false,
    validTill: '2026-12-15',
    status: 'ACTIVE',
    usageLimit: 200,
    usageCount: 54,
    createdAt: '2026-10-10'
  }
];

export default function CouponManager({ showToast }) {
  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_COUPONS;
    } catch {
      return DEFAULT_COUPONS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState(null);

  // Custom Filter Dropdowns State
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
  const scopeDropdownRef = useRef(null);

  useEffect(() => {
    const handleFilterClickOutside = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(e.target)) {
        setIsScopeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleFilterClickOutside);
    document.addEventListener('touchstart', handleFilterClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleFilterClickOutside);
      document.removeEventListener('touchstart', handleFilterClickOutside);
    };
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);

  // Form State
  const [formState, setFormState] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscountCap: 500,
    categoryScope: 'ALL',
    validTill: '2026-12-31',
    status: 'ACTIVE',
    usageLimit: 500
  });

  // Load coupons from backend database on mount
  useEffect(() => {
    let isMounted = true;
    fetchCouponsFromBackend().then(backendCoupons => {
      if (isMounted && Array.isArray(backendCoupons) && backendCoupons.length > 0) {
        setCoupons(backendCoupons);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Sync to localStorage and broadcast whenever coupons change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
      
      // Also sync to customer format for storefront profile / checkout
      const customerFormat = coupons.map(c => ({
        id: c.id,
        code: c.code,
        discount: c.discountDisplay,
        title: c.title,
        description: c.description,
        validTill: c.validTill,
        status: c.status === 'ACTIVE' ? 'Active' : 'Inactive',
        minOrderValue: c.minOrderValue,
        discountType: c.discountType,
        discountValue: c.discountValue
      }));
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerFormat));

      // Broadcast channel for live sync across open tabs
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('atomy_coupon_sync');
        channel.postMessage({ type: 'COUPONS_UPDATED', coupons: customerFormat });
        channel.close();
      }
      window.dispatchEvent(new Event('atomy_coupons_updated'));
    } catch (e) {
      console.warn('Failed to sync coupons to localStorage', e);
    }
  }, [coupons]);

  // Compute Discount Display String
  const computeDiscountDisplay = (type, val) => {
    if (type === 'FREE_SHIPPING') return 'FREE DELIVERY';
    if (type === 'FLAT') return `₹${Number(val || 0).toLocaleString('en-IN')} OFF`;
    return `${val || 0}% OFF`;
  };

  // KPIs
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.status === 'ACTIVE').length;
    const paused = coupons.filter(c => c.status === 'PAUSED').length;
    const totalUses = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
    return { total, active, paused, totalUses };
  }, [coupons]);

  // Filtered List
  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchSearch =
        c.code.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchType = typeFilter === 'ALL' || c.discountType === typeFilter;
      const matchScope = scopeFilter === 'ALL' || c.categoryScope === scopeFilter;
      return matchSearch && matchStatus && matchType && matchScope;
    });
  }, [coupons, searchQuery, statusFilter, typeFilter, scopeFilter]);

  // Handle Copy
  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    if (showToast) showToast(`Coupon code "${code}" copied to clipboard!`, 'info');
    setTimeout(() => {
      setCopiedCode(prev => (prev === code ? null : prev));
    }, 2000);
  };

  // Toggle Status
  const handleToggleStatus = (id) => {
    setCoupons(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          const updated = { ...c, status: nextStatus };
          saveCouponToBackend(updated);
          if (showToast) {
            showToast(
              `Coupon "${c.code}" is now ${nextStatus === 'ACTIVE' ? 'Active' : 'Paused'}.`,
              nextStatus === 'ACTIVE' ? 'success' : 'warning'
            );
          }
          return updated;
        }
        return c;
      })
    );
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormState({
      code: '',
      title: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 1000,
      maxDiscountCap: 500,
      categoryScope: 'ALL',
      targetProduct: 'ALL',
      firstOrderOnly: false,
      validTill: '2026-12-31',
      status: 'ACTIVE',
      usageLimit: 500
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormState({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscountCap: coupon.maxDiscountCap || 0,
      categoryScope: coupon.categoryScope || 'ALL',
      targetProduct: coupon.targetProduct || 'ALL',
      firstOrderOnly: coupon.firstOrderOnly || false,
      validTill: coupon.validTill || '2026-12-31',
      status: coupon.status,
      usageLimit: coupon.usageLimit || 500
    });
    setIsModalOpen(true);
  };

  // Generate Random Code
  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ATOMY';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormState(prev => ({ ...prev, code }));
  };

  // Save Coupon (Create or Edit)
  const handleSaveCoupon = (e) => {
    e.preventDefault();
    const cleanCode = formState.code.trim().toUpperCase();
    if (!cleanCode) {
      if (showToast) showToast('Please enter a valid coupon code.', 'error');
      return;
    }

    // Duplicate check on create
    if (!editingCoupon && coupons.some(c => c.code === cleanCode)) {
      if (showToast) showToast(`Coupon code "${cleanCode}" already exists.`, 'error');
      return;
    }

    const discountDisplay = computeDiscountDisplay(formState.discountType, formState.discountValue);

    if (editingCoupon) {
      const updated = {
        ...editingCoupon,
        ...formState,
        code: cleanCode,
        discountDisplay,
        discountValue: Number(formState.discountValue) || 0,
        minOrderValue: Number(formState.minOrderValue) || 0,
        maxDiscountCap: Number(formState.maxDiscountCap) || 0,
        usageLimit: Number(formState.usageLimit) || 500
      };
      setCoupons(prev =>
        prev.map(c => {
          if (c.id === editingCoupon.id) {
            return updated;
          }
          return c;
        })
      );
      saveCouponToBackend(updated);
      if (showToast) showToast(`Coupon "${cleanCode}" updated successfully!`, 'success');
    } else {
      const newCoupon = {
        id: `cpn-${Date.now()}`,
        ...formState,
        code: cleanCode,
        discountDisplay,
        discountValue: Number(formState.discountValue) || 0,
        minOrderValue: Number(formState.minOrderValue) || 0,
        maxDiscountCap: Number(formState.maxDiscountCap) || 0,
        usageLimit: Number(formState.usageLimit) || 500,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCoupons(prev => [newCoupon, ...prev]);
      saveCouponToBackend(newCoupon);
      if (showToast) showToast(`Coupon "${cleanCode}" created successfully!`, 'success');
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!couponToDelete) return;
    deleteCouponFromBackend(couponToDelete.id);
    setCoupons(prev => prev.filter(c => c.id !== couponToDelete.id));
    if (showToast) showToast(`Coupon "${couponToDelete.code}" deleted permanently.`, 'info');
    setCouponToDelete(null);
  };

  return (
    <div className="admin-tab-content coupon-manager-root">
      {/* 1. Header & Actions */}
      <div className="content-heading-row">
        <div>
          <h2 className="content-title">Coupons & Promotional Vouchers</h2>
          <p className="content-subtitle">
            Configure member coupons, seasonal discount promo codes, free shipping vouchers, and minimum cart threshold rules.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="atomy-btn-secondary"
            onClick={() => {
              setCoupons(DEFAULT_COUPONS);
              if (showToast) showToast('Restored standard Atomy promotion vouchers.', 'info');
            }}
            title="Reset to default promotion set"
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            className="atomy-btn-primary"
            onClick={handleOpenCreateModal}
          >
            <Plus size={16} />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Strip */}
      <div className="coupon-kpi-grid">
        <div className="coupon-kpi-card">
          <div className="kpi-icon-wrap blue">
            <Ticket size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Coupons</span>
            <strong className="kpi-value">{stats.total}</strong>
            <span className="kpi-subtext">Active & configured</span>
          </div>
        </div>

        <div className="coupon-kpi-card">
          <div className="kpi-icon-wrap green">
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Active Campaigns</span>
            <strong className="kpi-value">{stats.active}</strong>
            <span className="kpi-subtext">Redeemable at checkout</span>
          </div>
        </div>

        <div className="coupon-kpi-card">
          <div className="kpi-icon-wrap amber">
            <Clock size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Paused / Inactive</span>
            <strong className="kpi-value">{stats.paused}</strong>
            <span className="kpi-subtext">Temporarily suspended</span>
          </div>
        </div>

        <div className="coupon-kpi-card">
          <div className="kpi-icon-wrap purple">
            <Sparkles size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Redemptions</span>
            <strong className="kpi-value">{stats.totalUses.toLocaleString('en-IN')}</strong>
            <span className="kpi-subtext">Claims by customers</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="coupon-filters-strip">
        <div className="coupon-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search coupon code (e.g. WELCOME10), title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="search-clear-btn">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="coupon-filter-dropdowns">
          {/* Status Custom Dropdown */}
          <div className="filter-group custom-select-container" ref={statusDropdownRef}>
            <button
              type="button"
              className={`coupon-select-trigger ${isStatusDropdownOpen ? 'active' : ''}`}
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsTypeDropdownOpen(false);
                setIsScopeDropdownOpen(false);
              }}
              aria-expanded={isStatusDropdownOpen}
              title="Filter by coupon status"
            >
              <span className="filter-prefix">Status:</span>
              <strong className="filter-selected-val">
                {statusFilter === 'ALL' && 'All Statuses'}
                {statusFilter === 'ACTIVE' && 'Active Only'}
                {statusFilter === 'PAUSED' && 'Paused Only'}
              </strong>
              <ChevronDown size={14} className={`dropdown-chevron ${isStatusDropdownOpen ? 'rotate' : ''}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="custom-dropdown-menu">
                {[
                  { id: 'ALL', label: 'All Statuses' },
                  { id: 'ACTIVE', label: 'Active Only' },
                  { id: 'PAUSED', label: 'Paused Only' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`custom-dropdown-item ${statusFilter === opt.id ? 'selected' : ''}`}
                    onClick={() => {
                      setStatusFilter(opt.id);
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.id && <Check size={14} color="#0284c7" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type Custom Dropdown */}
          <div className="filter-group custom-select-container" ref={typeDropdownRef}>
            <button
              type="button"
              className={`coupon-select-trigger ${isTypeDropdownOpen ? 'active' : ''}`}
              onClick={() => {
                setIsTypeDropdownOpen(!isTypeDropdownOpen);
                setIsStatusDropdownOpen(false);
                setIsScopeDropdownOpen(false);
              }}
              aria-expanded={isTypeDropdownOpen}
              title="Filter by discount type"
            >
              <span className="filter-prefix">Type:</span>
              <strong className="filter-selected-val">
                {typeFilter === 'ALL' && 'All Discount Types'}
                {typeFilter === 'PERCENTAGE' && 'Percentage (% Off)'}
                {typeFilter === 'FLAT' && 'Flat Cash (₹ Off)'}
                {typeFilter === 'FREE_SHIPPING' && 'Free Shipping'}
              </strong>
              <ChevronDown size={14} className={`dropdown-chevron ${isTypeDropdownOpen ? 'rotate' : ''}`} />
            </button>

            {isTypeDropdownOpen && (
              <div className="custom-dropdown-menu">
                {[
                  { id: 'ALL', label: 'All Discount Types' },
                  { id: 'PERCENTAGE', label: 'Percentage (% Off)' },
                  { id: 'FLAT', label: 'Flat Cash (₹ Off)' },
                  { id: 'FREE_SHIPPING', label: 'Free Shipping' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`custom-dropdown-item ${typeFilter === opt.id ? 'selected' : ''}`}
                    onClick={() => {
                      setTypeFilter(opt.id);
                      setIsTypeDropdownOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {typeFilter === opt.id && <Check size={14} color="#0284c7" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scope Custom Dropdown */}
          <div className="filter-group custom-select-container" ref={scopeDropdownRef}>
            <button
              type="button"
              className={`coupon-select-trigger ${isScopeDropdownOpen ? 'active' : ''}`}
              onClick={() => {
                setIsScopeDropdownOpen(!isScopeDropdownOpen);
                setIsStatusDropdownOpen(false);
                setIsTypeDropdownOpen(false);
              }}
              aria-expanded={isScopeDropdownOpen}
              title="Filter by scope"
            >
              <span className="filter-prefix">Scope:</span>
              <strong className="filter-selected-val">
                {scopeFilter === 'ALL' && 'All Products (Storewide)'}
                {scopeFilter === 'HEALTH' && 'Health Care & Supplements'}
                {scopeFilter === 'BEAUTY' && 'Skin Care & Cosmetics'}
                {scopeFilter === 'PERSONAL' && 'Personal & Body Care'}
                {scopeFilter === 'FOOD' && 'Food & Living'}
              </strong>
              <ChevronDown size={14} className={`dropdown-chevron ${isScopeDropdownOpen ? 'rotate' : ''}`} />
            </button>

            {isScopeDropdownOpen && (
              <div className="custom-dropdown-menu">
                {[
                  { id: 'ALL', label: 'All Products (Storewide)' },
                  { id: 'HEALTH', label: 'Health Care & Supplements' },
                  { id: 'BEAUTY', label: 'Skin Care & Cosmetics' },
                  { id: 'PERSONAL', label: 'Personal & Body Care' },
                  { id: 'FOOD', label: 'Food & Living' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`custom-dropdown-item ${scopeFilter === opt.id ? 'selected' : ''}`}
                    onClick={() => {
                      setScopeFilter(opt.id);
                      setIsScopeDropdownOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {scopeFilter === opt.id && <Check size={14} color="#0284c7" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Coupons Cards Grid */}
      {filteredCoupons.length === 0 ? (
        <div className="coupons-empty-placeholder">
          <Ticket size={42} color="#94a3b8" />
          <h3>No matching coupons found</h3>
          <p>Try adjusting your search query or filters, or create a brand new coupon campaign.</p>
          <button type="button" className="atomy-btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={15} />
            <span>Create New Coupon</span>
          </button>
        </div>
      ) : (
        <div className="coupons-cards-grid">
          {filteredCoupons.map((coupon) => {
            const isPaused = coupon.status === 'PAUSED';
            const progressPct = coupon.usageLimit
              ? Math.min(100, Math.round(((coupon.usageCount || 0) / coupon.usageLimit) * 100))
              : 0;

            return (
              <div
                key={coupon.id}
                className={`coupon-management-card ${isPaused ? 'is-paused' : 'is-active'}`}
              >
                {/* Top Badge Strip */}
                <div className="card-top-strip">
                  <div className="code-badge-cluster">
                    <span className="voucher-dashed-code">{coupon.code}</span>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => handleCopyCode(coupon.code)}
                      title="Copy coupon code"
                    >
                      {copiedCode === coupon.code ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="status-scope-cluster">
                    <span className={`status-pill ${coupon.status.toLowerCase()}`}>
                      <span className="dot"></span>
                      {coupon.status === 'ACTIVE' ? 'Active' : 'Paused'}
                    </span>
                    <span className="scope-pill">
                      {coupon.categoryScope === 'ALL'
                        ? 'Storewide'
                        : coupon.categoryScope === 'HEALTH'
                        ? 'Health Care'
                        : coupon.categoryScope === 'BEAUTY'
                        ? 'Skin Care'
                        : coupon.categoryScope}
                    </span>
                  </div>
                </div>

                {/* Offer Main Info */}
                <div className="card-middle-content">
                  <div className="discount-hero-pill">
                    {coupon.discountType === 'PERCENTAGE' && <Percent size={15} />}
                    {coupon.discountType === 'FLAT' && <IndianRupee size={15} />}
                    {coupon.discountType === 'FREE_SHIPPING' && <Truck size={15} />}
                    <span>{coupon.discountDisplay}</span>
                  </div>

                  <h3 className="coupon-card-title">{coupon.title}</h3>
                  <p className="coupon-card-desc">{coupon.description}</p>
                </div>

                {/* Rules Matrix */}
                <div className="rules-matrix-grid">
                  <div className="rule-item">
                    <span className="rule-label">Min Cart Spend</span>
                    <span className="rule-val">
                      {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue.toLocaleString('en-IN')}` : 'No Minimum'}
                    </span>
                  </div>

                  <div className="rule-item">
                    <span className="rule-label">Max Cap</span>
                    <span className="rule-val">
                      {coupon.maxDiscountCap > 0 ? `₹${coupon.maxDiscountCap.toLocaleString('en-IN')}` : 'No Limit'}
                    </span>
                  </div>

                  <div className="rule-item">
                    <span className="rule-label">Expiry Date</span>
                    <span className="rule-val" style={{ color: '#0369a1', fontWeight: 700 }}>
                      {coupon.validTill || 'No Expiry'}
                    </span>
                  </div>

                  <div className="rule-item">
                    <span className="rule-label">Claims / Limit</span>
                    <span className="rule-val">
                      {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
                    </span>
                  </div>
                </div>

                {/* Redemptions Progress Bar */}
                <div className="redemptions-progress-wrap">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
                  </div>
                  <span className="progress-text">{progressPct}% of quota claimed</span>
                </div>

                {/* Card Actions Footer */}
                <div className="card-actions-footer">
                  <div className="switch-toggle-cluster">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={coupon.status === 'ACTIVE'}
                        onChange={() => handleToggleStatus(coupon.id)}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span className="toggle-label">
                      {coupon.status === 'ACTIVE' ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <div className="btn-actions-right">
                    <button
                      type="button"
                      className="edit-action-btn"
                      onClick={() => handleOpenEditModal(coupon)}
                      title="Edit coupon rules"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="delete-action-btn"
                      onClick={() => setCouponToDelete(coupon)}
                      title="Delete coupon"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="atomy-modal-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="atomy-modal-header">
              <div className="modal-title-cluster">
                <Ticket size={20} color="#00A3E0" />
                <h3>{editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}</h3>
              </div>
              <button type="button" className="atomy-modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="atomy-modal-body">
              {/* Row 1: Code & Generate */}
              <div className="modal-row-2">
                <div className="modal-form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ margin: 0 }}>Coupon Code *</label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="generate-code-btn"
                    >
                      <Sparkles size={12} />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE2026"
                    value={formState.code}
                    onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                    className="atomy-form-input mono"
                    style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Offer Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali Super Health Offer"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="modal-form-group">
                <label>Offer Description / Terms for Customers</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Get 15% instant savings on cart orders above ₹2,000 for wellness products."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="atomy-form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Row 2: Discount Type & Value */}
              <div className="modal-row-3">
                <div className="modal-form-group">
                  <label>Discount Type</label>
                  <select
                    value={formState.discountType}
                    onChange={(e) => setFormState({ ...formState, discountType: e.target.value })}
                    className="atomy-dropdown"
                  >
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                    <option value="FLAT">Flat Cash (₹ Off)</option>
                    <option value="FREE_SHIPPING">Free Shipping Waiver</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>
                    {formState.discountType === 'PERCENTAGE'
                      ? 'Discount Percentage (%)'
                      : formState.discountType === 'FLAT'
                      ? 'Flat Amount (₹)'
                      : 'Free Shipping (No Value)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={formState.discountType === 'FREE_SHIPPING'}
                    placeholder={formState.discountType === 'PERCENTAGE' ? '15' : '500'}
                    value={formState.discountType === 'FREE_SHIPPING' ? 0 : formState.discountValue}
                    onChange={(e) => setFormState({ ...formState, discountValue: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>

                <div className="modal-form-group">
                  <label>Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1000 (0 = No cap)"
                    value={formState.maxDiscountCap}
                    onChange={(e) => setFormState({ ...formState, maxDiscountCap: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>
              </div>

              {/* Row 3: Minimum Order & Quota Limit */}
              <div className="modal-row-3">
                <div className="modal-form-group">
                  <label>Min Order Threshold (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500"
                    value={formState.minOrderValue}
                    onChange={(e) => setFormState({ ...formState, minOrderValue: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>

                <div className="modal-form-group">
                  <label>Usage Quota Limit (Uses)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={formState.usageLimit}
                    onChange={(e) => setFormState({ ...formState, usageLimit: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>

                <div className="modal-form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formState.validTill}
                    onChange={(e) => setFormState({ ...formState, validTill: e.target.value })}
                    className="atomy-form-input"
                  />
                </div>
              </div>

              {/* Row 4: Category Scope, Product Restriction & Eligibility */}
              <div className="modal-row-3">
                <div className="modal-form-group">
                  <label>Category Scope</label>
                  <select
                    value={formState.categoryScope}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormState({
                        ...formState,
                        categoryScope: val,
                        targetProduct: val === 'HEMOHIM' ? 'HEMOHIM' : formState.targetProduct
                      });
                    }}
                    className="atomy-dropdown"
                  >
                    <option value="ALL">Storewide (All Categories)</option>
                    <option value="HEALTH">Health Care & Supplements</option>
                    <option value="BEAUTY">Skin Care & Cosmetics</option>
                    <option value="PERSONAL">Personal & Body Care</option>
                    <option value="FOOD">Food & Living</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Product Restriction</label>
                  <select
                    value={formState.targetProduct || 'ALL'}
                    onChange={(e) => setFormState({ ...formState, targetProduct: e.target.value })}
                    className="atomy-dropdown"
                  >
                    <option value="ALL">Any Product in Scope</option>
                    <option value="HEMOHIM">Exclusive to HemoHIM Only</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Customer Order Eligibility</label>
                  <select
                    value={formState.firstOrderOnly ? 'FIRST_ONLY' : 'ALL_ORDERS'}
                    onChange={(e) => setFormState({ ...formState, firstOrderOnly: e.target.value === 'FIRST_ONLY' })}
                    className="atomy-dropdown"
                  >
                    <option value="ALL_ORDERS">All Orders (New & Returning)</option>
                    <option value="FIRST_ONLY">First-Time Order Only (New Customer)</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Initial Status */}
              <div className="modal-form-group" style={{ marginBottom: '14px' }}>
                <label>Campaign Status</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="atomy-dropdown"
                >
                  <option value="ACTIVE">Active (Live immediately)</option>
                  <option value="PAUSED">Paused (Draft / Scheduled)</option>
                </select>
              </div>

              {/* Live Preview Box */}
              <div className="coupon-preview-strip">
                <div className="preview-label">Live Customer Badge Preview:</div>
                <div className="preview-pill">
                  <span className="p-code">{formState.code || 'CODE'}</span>
                  <span className="p-div">•</span>
                  <span className="p-disc">
                    {computeDiscountDisplay(formState.discountType, formState.discountValue)}
                  </span>
                  <span className="p-div">•</span>
                  <span className="p-min">
                    {formState.minOrderValue > 0 ? `Min ₹${Number(formState.minOrderValue).toLocaleString('en-IN')}` : 'No Min'}
                  </span>
                </div>
              </div>

              <div className="modal-actions-right" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="atomy-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="atomy-btn-primary">
                  {editingCoupon ? 'Save Changes' : 'Publish Coupon Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="modal-backdrop-overlay" onClick={() => setCouponToDelete(null)}>
          <div className="atomy-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="atomy-modal-header">
              <div className="modal-title-cluster">
                <AlertTriangle size={20} color="#dc2626" />
                <h3>Delete Coupon?</h3>
              </div>
              <button type="button" className="atomy-modal-close" onClick={() => setCouponToDelete(null)}>
                &times;
              </button>
            </div>

            <div className="atomy-modal-body">
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to permanently delete coupon voucher{' '}
                <strong style={{ color: '#0f172a' }}>"{couponToDelete.code}"</strong>? Customers will no longer be able to claim this offer at checkout.
              </p>

              <div className="modal-actions-right" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="atomy-btn-secondary"
                  onClick={() => setCouponToDelete(null)}
                >
                  Keep Coupon
                </button>
                <button
                  type="button"
                  className="atomy-btn-primary"
                  style={{ background: '#ef4444', borderColor: '#ef4444' }}
                  onClick={handleConfirmDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
