import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Home, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Edit2, 
  CheckCircle2, 
  Briefcase, 
  AlertCircle,
  Navigation,
  Loader2,
  Check
} from 'lucide-react';
import { ALL_CATALOG_PRODUCTS, BEST_PRODUCTS } from '../../data/mockData';
import './QuickOrderPage.css';

// Normalize & prioritize catalog products so D90501 and D00301 with authentic values appear first
const NORMALIZED_CATALOG = (() => {
  const customFirst = [
    {
      id: 'D90501',
      name: 'Atomy Toothpaste 200g x1N',
      price: 315.00,
      pv: 850,
      image: 'https://image.atomy.com/IN/goods/D90501/org/663/251130000048663.jpg?w=480&h=480'
    },
    {
      id: 'D00301',
      name: 'Evening Care Foam Cleanser',
      price: 755.20,
      pv: 3500,
      image: 'https://image.atomy.com/IN/goods/D00301/D00301_00.jpg?w=480&h=480'
    }
  ];

  const map = new Map();
  customFirst.forEach(p => map.set(p.id, p));

  if (ALL_CATALOG_PRODUCTS && Array.isArray(ALL_CATALOG_PRODUCTS)) {
    ALL_CATALOG_PRODUCTS.forEach(p => {
      if (p && p.id && !map.has(p.id)) {
        map.set(p.id, {
          id: p.id,
          name: p.name || 'Atomy Product',
          price: typeof p.price === 'number' ? p.price : 1000,
          pv: typeof p.pv === 'number' ? p.pv : Math.round((p.price || 1000) * 4.5),
          image: p.image || 'https://image.atomy.com/IN/goods/D00101/D00101_00.jpg?w=480&h=480'
        });
      }
    });
  }

  return Array.from(map.values());
})();

// Curated list of Bestseller Products to display in the bottom row
const QUICK_ORDER_BEST_PRODUCTS = [
  {
    id: 'D00101',
    rank: 1,
    name: 'Atomy HemoHIM (1 Set / 60pk)',
    price: 13000.00,
    pv: 60000,
    image: 'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480',
    tag: '#1 Immune Power'
  },
  {
    id: 'D90501',
    rank: 2,
    name: 'Atomy Toothpaste 200g x1N',
    price: 315.00,
    pv: 850,
    image: 'https://image.atomy.com/IN/goods/D90501/org/663/251130000048663.jpg?w=480&h=480',
    tag: 'Daily Dental Care'
  },
  {
    id: 'D00301',
    rank: 3,
    name: 'Evening Care Foam Cleanser',
    price: 755.20,
    pv: 3500,
    image: 'https://image.atomy.com/IN/goods/D00301/D00301_00.jpg?w=480&h=480',
    tag: 'Pure Cleansing'
  },
  {
    id: 'D00351',
    rank: 4,
    name: 'Evening Care 4 Set',
    price: 2900.00,
    pv: 13000,
    image: 'https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480',
    tag: 'Home Facial Spa'
  },
  {
    id: 'D00207',
    rank: 5,
    name: 'Absolute CellActive Skincare Set',
    price: 16500.00,
    pv: 130000,
    image: 'https://image.atomy.com/IN/goods/D00207/org/036/260803000054036.jpg?w=480&h=480',
    tag: 'Anti-Aging Luxury'
  },
  {
    id: 'D00510',
    rank: 6,
    name: 'Atomy Toothbrush Compact 8N',
    price: 900.00,
    pv: 5000,
    image: 'https://image.atomy.com/IN/goods/D00510/D00510_00.jpg?w=480&h=480',
    tag: '0.03mm Super Slim'
  }
];

// Offline instant fallback PIN code dictionary for key Indian postal zones
const PIN_CODE_MAP = {
  '110001': { city: 'New Delhi', state: 'Delhi', district: 'New Delhi' },
  '110002': { city: 'Central Delhi', state: 'Delhi', district: 'Central Delhi' },
  '110020': { city: 'South Delhi', state: 'Delhi', district: 'South Delhi' },
  '122001': { city: 'Gurugram', state: 'Haryana', district: 'Gurgaon' },
  '122003': { city: 'Gurugram', state: 'Haryana', district: 'Gurgaon' },
  '122018': { city: 'Gurugram', state: 'Haryana', district: 'Gurgaon' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar' },
  '400001': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai' },
  '400050': { city: 'Bandra, Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '560001': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560034': { city: 'Koramangala, Bengaluru', state: 'Karnataka', district: 'Bengaluru' },
  '500001': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  '700001': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad' },
  '302001': { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur' },
  '682001': { city: 'Kochi', state: 'Kerala', district: 'Ernakulam' },
  '796001': { city: 'Aizawl', state: 'Mizoram', district: 'Aizawl' }
};

const INITIAL_DEFAULT_ADDRESS = {
  id: 'addr-default-1',
  tag: 'Home',
  recipientName: 'Naveen Kumar',
  recipientPhone: '9876543210',
  alternatePhone: '',
  pincode: '122003',
  city: 'Gurugram',
  state: 'Haryana',
  addressLine1: 'Flat 402, Tower B, Cyber City Apartments',
  addressLine2: 'Sector 39, Near Unitech Cyber Park',
  landmark: 'Near Metro Station',
  deliveryMessage: 'Please call before delivery',
  isDefault: true
};

export default function QuickOrderPage({ 
  onNavigateHome,
  onNavigateBack,
  onAddToCart, 
  onProceedToOrderSheet,
  onProductClick 
}) {
  // 1. Product Lines State
  const [selectedItems, setSelectedItems] = useState([]);
  const [isProductSectionOpen, setIsProductSectionOpen] = useState(true);
  const [isDeliverySectionOpen, setIsDeliverySectionOpen] = useState(true);
  
  // Search Modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalCheckedIds, setModalCheckedIds] = useState(new Set());
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [quickAddToast, setQuickAddToast] = useState(null);

  // 2. Customer Delivery Addresses State
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_customer_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [INITIAL_DEFAULT_ADDRESS];
  });

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_customer_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const def = parsed.find(a => a.isDefault) || parsed[0];
          return def ? def.id : null;
        }
      }
    } catch {}
    return 'addr-default-1';
  });

  // Modal / Form state for Add / Edit Address
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null means adding new
  const [addressForm, setAddressForm] = useState({
    tag: 'Home',
    recipientName: '',
    recipientPhone: '',
    alternatePhone: '',
    pincode: '',
    city: '',
    state: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    deliveryMessage: '',
    isDefault: false
  });

  // Geolocation & PIN Code Live Detection States
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState('');
  const [locationFeedback, setLocationFeedback] = useState(null);
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);

  // Save addresses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atomy_customer_addresses', JSON.stringify(addresses));
    } catch {}
  }, [addresses]);

  // Selected address object
  const currentSelectedAddress = useMemo(() => {
    if (addresses.length === 0) return null;
    return addresses.find(a => a.id === selectedAddressId) || addresses[0] || null;
  }, [addresses, selectedAddressId]);

  // Sync selected address to atomy_shipping_address for checkout
  useEffect(() => {
    if (currentSelectedAddress) {
      try {
        localStorage.setItem('atomy_shipping_address', JSON.stringify(currentSelectedAddress));
      } catch {}
    } else {
      try {
        localStorage.removeItem('atomy_shipping_address');
      } catch {}
    }
  }, [currentSelectedAddress]);

  // Trigger Live GPS Current Location Detection
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationFeedback('Geolocation is not supported by your browser.');
      setTimeout(() => setLocationFeedback(null), 3000);
      return;
    }

    setIsDetectingLocation(true);
    setLocationFeedback('Detecting GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();

          const detectedPin = data.postcode || '';
          const detectedCity = data.city || data.locality || data.principalSubdivision || 'Gurugram';
          const detectedState = data.principalSubdivision || 'Haryana';
          const detectedArea = [data.locality, data.neighbourhood].filter(Boolean).join(', ');

          setAddressForm(prev => ({
            ...prev,
            pincode: detectedPin || prev.pincode || '122003',
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
            addressLine2: detectedArea || prev.addressLine2
          }));

          setIsLocationDetected(true);
          setDetectedLocationName(`${detectedCity}, ${detectedState}`);

          // Trigger PIN lookup if PIN code was detected
          if (detectedPin && detectedPin.length === 6) {
            handleLookupPincodeDetails(detectedPin);
          }

          setLocationFeedback(`✓ Location applied: ${detectedCity}, ${detectedState} ${detectedPin ? `(${detectedPin})` : ''}`);
          setTimeout(() => setLocationFeedback(null), 4000);
        } catch (err) {
          // Graceful fallback
          setAddressForm(prev => ({
            ...prev,
            city: prev.city || 'Gurugram',
            state: prev.state || 'Haryana',
            pincode: prev.pincode || '122003'
          }));
          setIsLocationDetected(true);
          setDetectedLocationName('Gurugram, Haryana');
          setLocationFeedback('✓ Current location applied.');
          setTimeout(() => setLocationFeedback(null), 3500);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        setIsLocationDetected(false);
        setLocationFeedback('Location access not permitted. Enter 6-digit PIN code for auto-detection.');
        setTimeout(() => setLocationFeedback(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Helper: Live lookup for Indian PIN code to find District, State, and specific Areas
  const handleLookupPincodeDetails = async (pin) => {
    setIsLookingUpPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();
      if (data && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice)) {
        const postOffices = data[0].PostOffice;
        const district = postOffices[0].District;
        const state = postOffices[0].State;
        const areaNames = postOffices.map(po => po.Name).filter(Boolean);

        setAddressForm(prev => ({
          ...prev,
          city: district || prev.city,
          state: state || prev.state,
          addressLine2: prev.addressLine2 ? prev.addressLine2 : (areaNames[0] || '')
        }));

        setAvailableAreas(areaNames);
      }
    } catch (err) {
      // Fallback already handled
    } finally {
      setIsLookingUpPincode(false);
    }
  };

  // Handle open add address
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAvailableAreas([]);
    setLocationFeedback(null);
    setIsLocationDetected(false);
    setDetectedLocationName('');
    setAddressForm({
      tag: 'Home',
      recipientName: '',
      recipientPhone: '',
      alternatePhone: '',
      pincode: '',
      city: '',
      state: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      deliveryMessage: '',
      isDefault: addresses.length === 0
    });
    setIsAddressModalOpen(true);
  };

  // Handle open edit address
  const handleOpenEditAddress = (addr, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setEditingAddressId(addr.id);
    setAvailableAreas([]);
    setLocationFeedback(null);
    setIsLocationDetected(false);
    setDetectedLocationName('');
    setAddressForm({ ...addr });
    setIsAddressModalOpen(true);
    if (addr.pincode && addr.pincode.length === 6) {
      handleLookupPincodeDetails(addr.pincode);
    }
  };

  // Handle delete / remove address
  const handleDeleteAddress = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    setAddresses(prev => {
      const updated = prev.filter(a => a.id !== id);
      if (selectedAddressId === id) {
        if (updated.length > 0) {
          const fallback = updated.find(a => a.isDefault) || updated[0];
          setSelectedAddressId(fallback.id);
        } else {
          setSelectedAddressId(null);
        }
      }
      return updated;
    });

    if (editingAddressId === id) {
      setIsAddressModalOpen(false);
    }
  };

  // Handle Set as default address
  const handleSetDefaultAddress = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  // Address PIN code change with automatic District, State & specific Area lookup
  const handleFormPincodeChange = (e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    
    // 0ms instant local dictionary check
    let immediateCity = '';
    let immediateState = '';
    if (pin.length === 6 && PIN_CODE_MAP[pin]) {
      immediateCity = PIN_CODE_MAP[pin].city;
      immediateState = PIN_CODE_MAP[pin].state;
    }

    setAddressForm(prev => ({
      ...prev,
      pincode: pin,
      city: immediateCity || prev.city,
      state: immediateState || prev.state
    }));

    if (pin.length === 6) {
      handleLookupPincodeDetails(pin);
    } else {
      setAvailableAreas([]);
    }
  };

  // Select a specific area suggestion chip
  const handleSelectAreaChip = (areaName) => {
    setAddressForm(prev => ({
      ...prev,
      addressLine2: areaName
    }));
  };

  // Save address from form (Add or Edit)
  const handleSaveAddressForm = (e) => {
    e.preventDefault();
    if (!addressForm.recipientName.trim() || !addressForm.recipientPhone.trim() || !addressForm.pincode.trim() || !addressForm.addressLine1.trim()) {
      alert('Please fill in all mandatory fields marked with *');
      return;
    }

    if (editingAddressId) {
      // Editing existing
      setAddresses(prev => prev.map(a => {
        if (a.id === editingAddressId) {
          return {
            ...addressForm,
            id: editingAddressId,
            isDefault: addressForm.isDefault ? true : (a.isDefault && !addressForm.isDefault ? false : a.isDefault)
          };
        }
        return addressForm.isDefault ? { ...a, isDefault: false } : a;
      }));
    } else {
      // Creating new
      const newId = `addr-${Date.now()}`;
      const newAddress = {
        ...addressForm,
        id: newId,
        isDefault: addressForm.isDefault || addresses.length === 0
      };

      setAddresses(prev => {
        const nextList = addressForm.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : [...prev];
        return [...nextList, newAddress];
      });

      setSelectedAddressId(newId);
    }

    setIsAddressModalOpen(false);
  };

  // Filtered products inside the search modal
  const filteredProducts = useMemo(() => {
    const q = modalSearchQuery.trim().toLowerCase();
    if (!q) return NORMALIZED_CATALOG;
    return NORMALIZED_CATALOG.filter(p => 
      p.id.toLowerCase().includes(q) || 
      p.name.toLowerCase().includes(q)
    );
  }, [modalSearchQuery]);

  // Check if all filtered products are currently checked
  const isAllFilteredSelected = useMemo(() => {
    if (filteredProducts.length === 0) return false;
    return filteredProducts.every(p => modalCheckedIds.has(p.id));
  }, [filteredProducts, modalCheckedIds]);

  // Toggle "All" checkbox in modal
  const handleToggleSelectAll = () => {
    setModalCheckedIds(prev => {
      const next = new Set(prev);
      if (isAllFilteredSelected) {
        filteredProducts.forEach(p => next.delete(p.id));
      } else {
        filteredProducts.forEach(p => next.add(p.id));
      }
      return next;
    });
  };

  // Toggle individual product checkbox in modal
  const handleToggleItemCheck = (id) => {
    setModalCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Add a single product to order (from modal or bestseller row)
  const handleAddSingleProduct = (prod) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.id === prod.id);
      if (existing) {
        return prev.map(item => item.id === prod.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...prod, qty: 1 }];
    });

    setQuickAddToast(`Added ${prod.name} to Quick Order!`);
    setTimeout(() => setQuickAddToast(null), 2500);

    if (isSearchModalOpen) {
      setIsSearchModalOpen(false);
    }
  };

  // Add multiple checked products from modal
  const handleAddSelectedProducts = () => {
    if (modalCheckedIds.size === 0) return;
    const toAdd = NORMALIZED_CATALOG.filter(p => modalCheckedIds.has(p.id));
    
    setSelectedItems(prev => {
      const copy = [...prev];
      toAdd.forEach(prod => {
        const idx = copy.findIndex(item => item.id === prod.id);
        if (idx !== -1) {
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        } else {
          copy.push({ ...prod, qty: 1 });
        }
      });
      return copy;
    });

    setModalCheckedIds(new Set());
    setIsSearchModalOpen(false);
  };

  // Update quantity in line
  const handleUpdateQty = (id, delta) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  // Set quantity directly from input
  const handleSetQty = (id, val) => {
    const num = parseInt(val, 10);
    const validQty = isNaN(num) || num < 1 ? 1 : num;
    setSelectedItems(prev => prev.map(item => item.id === id ? { ...item, qty: validQty } : item));
  };

  // Remove single line
  const handleRemoveLine = (id) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  // Clear all lines
  const handleClearAll = () => {
    setSelectedItems([]);
  };

  // Totals calculation
  const totals = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const price = item.price || 0;
      const pv = item.pv || 0;
      return {
        qty: acc.qty + item.qty,
        price: acc.price + (price * item.qty),
        pv: acc.pv + (pv * item.qty)
      };
    }, { qty: 0, price: 0, pv: 0 });
  }, [selectedItems]);

  // Delivery calculation: Free door delivery for orders above ₹4500, else ₹150
  const deliveryFee = totals.price >= 4500 || totals.price === 0 ? 0 : 150;
  const grandTotal = totals.price + deliveryFee;

  // Add all to cart
  const handleAddAllToCart = () => {
    if (selectedItems.length === 0) return;
    selectedItems.forEach(item => {
      onAddToCart && onAddToCart(item, item.qty);
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2200);
  };

  // Proceed to order sheet with items and delivery information
  const handleProceedOrderSheet = () => {
    if (selectedItems.length === 0) {
      alert('Please add at least one product to your order.');
      return;
    }
    if (!currentSelectedAddress) {
      alert('Please add a delivery address to complete your order.');
      setIsAddressModalOpen(true);
      return;
    }
    selectedItems.forEach(item => {
      onAddToCart && onAddToCart(item, item.qty);
    });
    try {
      localStorage.setItem('atomy_shipping_address', JSON.stringify(currentSelectedAddress));
      localStorage.setItem('atomy_delivery_type', 'direct');
    } catch {}
    onProceedToOrderSheet && onProceedToOrderSheet();
  };

  return (
    <div className="quick-order-page-wrapper">
      {/* Toast Notification */}
      {quickAddToast && (
        <div className="quick-add-floating-toast">
          <CheckCircle2 size={16} />
          <span>{quickAddToast}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="quick-order-breadcrumb" aria-label="Breadcrumb">
        <div className="quick-order-container">
          <button 
            type="button" 
            className="breadcrumb-link" 
            onClick={onNavigateHome}
          >
            <Home size={15} />
            <span>Home</span>
          </button>
          <ChevronRight size={15} className="breadcrumb-arrow" />
          <span className="breadcrumb-current">Quick Order</span>
        </div>
      </nav>

      <main className="quick-order-container quick-order-main-grid">
        {/* Left Column */}
        <section className="quick-order-left-column">
          {/* Page Title with Horizontal Line */}
          <div className="quick-order-header-row">
            <h1 className="quick-order-heading-title">Quick Order</h1>
          </div>

          {/* =========================================================================
              SECTION 1: Product Information (Matches User's Image 2 & 1)
              ========================================================================= */}
          <div className="quick-order-section-block">
            <div 
              className="section-title-bar" 
              onClick={() => setIsProductSectionOpen(!isProductSectionOpen)}
              title="Click to toggle section"
            >
              <h2 className="section-title-text">Product information</h2>
              <span className="section-collapse-toggle">
                {isProductSectionOpen ? '—' : '+'}
              </span>
            </div>

            {isProductSectionOpen && (
              <div className="section-content-area">
                {selectedItems.length === 0 ? (
                  /* 1. Empty State matching Image 2 */
                  <div className="quick-order-empty-state">
                    <button
                      type="button"
                      className="btn-quick-order-empty-add"
                      onClick={() => setIsSearchModalOpen(true)}
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  /* 2. Populated State: Show products line one by one */
                  <div className="quick-order-populated-lines">
                    <div className="populated-lines-toolbar">
                      <span className="lines-count-info">
                        Selected <strong>{selectedItems.length}</strong> product{selectedItems.length !== 1 ? 's' : ''} ({totals.qty} total units)
                      </span>
                      <div className="lines-toolbar-actions">
                        <button
                          type="button"
                          className="btn-toolbar-add-more"
                          onClick={() => setIsSearchModalOpen(true)}
                        >
                          <Plus size={15} />
                          <span>Add More</span>
                        </button>
                        <button
                          type="button"
                          className="btn-toolbar-clear"
                          onClick={handleClearAll}
                        >
                          <Trash2 size={15} />
                          <span>Clear All</span>
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive-wrapper">
                      <table className="quick-order-products-table">
                        <thead>
                          <tr>
                            <th className="th-idx">#</th>
                            <th className="th-code">Product Code</th>
                            <th className="th-details">Product Details</th>
                            <th className="th-price">Price</th>
                            <th className="th-pv">PV Points</th>
                            <th className="th-qty">Qty</th>
                            <th className="th-subtotal">Subtotal</th>
                            <th className="th-action"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedItems.map((item, index) => {
                            const linePrice = item.price * item.qty;
                            const linePv = item.pv * item.qty;

                            return (
                              <tr key={item.id} className="quick-order-item-row">
                                <td className="td-idx">{index + 1}</td>
                                <td className="td-code">
                                  <span className="code-pill">{item.id}</span>
                                </td>
                                <td className="td-details">
                                  <div className="product-table-cell">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="product-table-thumb"
                                      onError={(e) => { e.target.src = '/images/products/hemohim.png'; }}
                                    />
                                    <div className="product-table-info">
                                      <button
                                        type="button"
                                        className="product-name-link"
                                        onClick={() => onProductClick && onProductClick(item)}
                                      >
                                        {item.name}
                                      </button>
                                      <span className="in-stock-tag">In Stock</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="td-price">
                                  <div className="price-stack">
                                    <span className="unit-price-text">
                                      ₹ {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className="tax-tag">Incl. GST</span>
                                  </div>
                                </td>
                                <td className="td-pv">
                                  <span className="pv-point-text">
                                    {item.pv.toLocaleString()} PV
                                  </span>
                                </td>
                                <td className="td-qty">
                                  <div className="qty-stepper-box">
                                    <button
                                      type="button"
                                      className="qty-step-btn"
                                      onClick={() => handleUpdateQty(item.id, -1)}
                                      disabled={item.qty <= 1}
                                      aria-label="Decrease quantity"
                                    >
                                      −
                                    </button>
                                    <input
                                      type="number"
                                      className="qty-step-input"
                                      value={item.qty}
                                      onChange={(e) => handleSetQty(item.id, e.target.value)}
                                      min="1"
                                      max="99"
                                    />
                                    <button
                                      type="button"
                                      className="qty-step-btn"
                                      onClick={() => handleUpdateQty(item.id, 1)}
                                      aria-label="Increase quantity"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="td-subtotal">
                                  <div className="subtotal-stack">
                                    <span className="subtotal-price-text">
                                      ₹ {linePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className="subtotal-pv-text">
                                      {linePv.toLocaleString()} PV
                                    </span>
                                  </div>
                                </td>
                                <td className="td-action">
                                  <button
                                    type="button"
                                    className="btn-delete-line"
                                    onClick={() => handleRemoveLine(item.id)}
                                    title="Remove this line"
                                    aria-label="Remove item"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom Add Line bar */}
                    <div className="populated-bottom-bar">
                      <button
                        type="button"
                        className="btn-quick-order-empty-add small"
                        onClick={() => setIsSearchModalOpen(true)}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
              SECTION 2: Delivery Address (Door Delivery for Public Customers)
              ========================================================================= */}
          <div className="quick-order-section-block delivery-address-block">
            <div 
              className="section-title-bar" 
              onClick={() => setIsDeliverySectionOpen(!isDeliverySectionOpen)}
              title="Click to toggle section"
            >
              <div className="title-with-badge">
                <h2 className="section-title-text">Delivery Address (Door Delivery)</h2>
                <span className="address-saved-indicator">
                  <Truck size={14} />
                  <span>Doorstep Delivery</span>
                </span>
              </div>
              <span className="section-collapse-toggle">
                {isDeliverySectionOpen ? '—' : '+'}
              </span>
            </div>

            {isDeliverySectionOpen && (
              <div className="delivery-form-container">
                {/* Header with Add New Address */}
                <div className="address-header-row">
                  <p className="address-section-subtitle">
                    Select a delivery address for door delivery or add / remove addresses.
                  </p>
                  
                  <div className="address-top-buttons-group">
                    <button
                      type="button"
                      className="btn-add-new-address"
                      onClick={handleOpenAddAddress}
                    >
                      <Plus size={16} />
                      <span>Add New Address</span>
                    </button>
                  </div>
                </div>

                {/* If no addresses exist, show friendly prompt */}
                {addresses.length === 0 ? (
                  <div className="no-addresses-empty-state">
                    <MapPin size={42} className="no-addr-icon" />
                    <h3 className="no-addr-title">No Delivery Address Added Yet</h3>
                    <p className="no-addr-desc">
                      Please enter your doorstep delivery address to complete your order smoothly.
                    </p>
                    <div className="no-addr-btn-group">
                      <button
                        type="button"
                        className="btn-add-new-address"
                        onClick={handleOpenAddAddress}
                      >
                        <Plus size={16} />
                        <span>Add New Address</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* List of Saved Door Delivery Addresses */
                  <div className="saved-addresses-grid">
                    {addresses.map((addr) => {
                      const isSelected = addr.id === selectedAddressId;

                      return (
                        <div 
                          key={addr.id}
                          className={`address-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedAddressId(addr.id)}
                        >
                          <div className="address-card-top">
                            <div className="address-card-radio-wrap">
                              <input
                                type="radio"
                                name="selectedDeliveryAddress"
                                checked={isSelected}
                                onChange={() => setSelectedAddressId(addr.id)}
                              />
                              <span className="address-tag-badge">
                                {addr.tag === 'Home' && <Home size={13} />}
                                {addr.tag === 'Office' && <Briefcase size={13} />}
                                {addr.tag || 'Home'}
                              </span>
                              {addr.isDefault && (
                                <span className="default-pill-badge">Default</span>
                              )}
                            </div>

                            <div className="address-card-actions">
                              {/* Edit Button */}
                              <button
                                type="button"
                                className="btn-edit-address-icon"
                                onClick={(e) => handleOpenEditAddress(addr, e)}
                                title="Edit this address"
                              >
                                <Edit2 size={14} />
                                <span>Edit</span>
                              </button>

                              {/* Remove Button */}
                              <button
                                type="button"
                                className="btn-remove-address-btn"
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                title="Remove this address"
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>

                          {/* Recipient Details */}
                          <div className="address-recipient-info">
                            <strong className="recipient-name-bold">{addr.recipientName}</strong>
                            <span className="recipient-phone-num">+91 {addr.recipientPhone}</span>
                            {addr.alternatePhone && (
                              <span className="recipient-alt-phone">(Alt: +91 {addr.alternatePhone})</span>
                            )}
                          </div>

                          {/* Full Postal Address */}
                          <div className="address-full-text">
                            <p className="address-line-text">{addr.addressLine1}</p>
                            <p className="address-line-text">{addr.addressLine2}</p>
                            {addr.landmark && (
                              <p className="address-landmark-text">Landmark: {addr.landmark}</p>
                            )}
                            <p className="address-city-state">
                              <strong>{addr.city}</strong>, {addr.state} — <strong className="pin-text">{addr.pincode}</strong>
                            </p>
                            {addr.deliveryMessage && (
                              <p className="address-note-text">
                                <em>Note: {addr.deliveryMessage}</em>
                              </p>
                            )}
                          </div>

                          {/* Selection & Default toggles */}
                          <div className="address-card-footer">
                            {isSelected ? (
                              <span className="selected-status-label">
                                <CheckCircle2 size={15} />
                                <span>Delivering to this address</span>
                              </span>
                            ) : (
                              <span className="click-to-deliver-hint">Click to deliver here</span>
                            )}

                            {!addr.isDefault && (
                              <button
                                type="button"
                                className="btn-make-default"
                                onClick={(e) => handleSetDefaultAddress(addr.id, e)}
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Sticky Order Summary Panel */}
        <aside className="quick-order-summary-sidebar">
          <div className="summary-sticky-card">
            <h2 className="summary-card-title">Order Summary</h2>

            {/* PV Points Spotlight Card */}
            <div className="summary-pv-box">
              <div className="pv-box-top">
                <div className="pv-box-icon">
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="pv-box-sub">Total Accumulated PV</span>
                  <div className="pv-box-amount">
                    {totals.pv.toLocaleString()} <span className="pv-unit">PV</span>
                  </div>
                </div>
              </div>
              <p className="pv-box-desc">
                PV (Point Value) is credited directly to your direct customer account upon delivery.
              </p>
            </div>

            {/* Calculations Breakdown */}
            <div className="summary-rows">
              <div className="summary-row">
                <span className="row-label">Selected Products</span>
                <span className="row-value">{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="summary-row">
                <span className="row-label">Total Units</span>
                <span className="row-value">{totals.qty} unit{totals.qty !== 1 ? 's' : ''}</span>
              </div>
              <div className="summary-row">
                <span className="row-label">Items Subtotal</span>
                <span className="row-value">₹ {totals.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row">
                <span className="row-label">Doorstep Delivery Fee</span>
                <span className="row-value delivery-free">
                  {deliveryFee === 0 ? 'FREE' : '₹ 150.00'}
                </span>
              </div>
              {totals.price < 4500 && totals.price > 0 && (
                <div className="free-shipping-nudge">
                  Add <strong>₹ {(4500 - totals.price).toLocaleString()}</strong> more for FREE delivery
                </div>
              )}
            </div>

            {/* Delivery Destination Doorstep Preview */}
            <div className="summary-delivery-preview">
              <div className="dest-preview-title">
                <MapPin size={14} />
                <span>Door Delivery to:</span>
              </div>
              {currentSelectedAddress ? (
                <div className="dest-preview-address">
                  <strong>{currentSelectedAddress.recipientName}</strong> (+91 {currentSelectedAddress.recipientPhone})<br />
                  {currentSelectedAddress.addressLine1}, {currentSelectedAddress.city} - {currentSelectedAddress.pincode}
                </div>
              ) : (
                <div className="dest-preview-none">
                  <AlertCircle size={14} className="warn-icon" />
                  <span>No delivery address selected.</span>
                  <button type="button" className="inline-add-addr-link" onClick={handleOpenAddAddress}>
                    + Add Address
                  </button>
                </div>
              )}
            </div>

            <div className="summary-divider"></div>

            {/* Grand Total */}
            <div className="summary-grand-total">
              <div>
                <span className="grand-label">Grand Total</span>
                <span className="grand-tax-note">(Inclusive of all applicable taxes)</span>
              </div>
              <div className="grand-price-box">
                <span className="grand-price">₹ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="summary-actions">
              <button
                type="button"
                className={`btn-order-now ${selectedItems.length === 0 || !currentSelectedAddress ? 'disabled' : ''}`}
                disabled={selectedItems.length === 0 || !currentSelectedAddress}
                onClick={handleProceedOrderSheet}
              >
                <span>Order All Now</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className={`btn-add-cart ${selectedItems.length === 0 ? 'disabled' : ''} ${addedAnimation ? 'cart-added-active' : ''}`}
                disabled={selectedItems.length === 0}
                onClick={handleAddAllToCart}
              >
                <ShoppingCart size={18} />
                <span>{addedAnimation ? 'Added to Cart!' : 'Add All to Cart'}</span>
              </button>

              <button
                type="button"
                className="btn-continue-shopping"
                onClick={onNavigateHome}
              >
                <span>Continue Shopping</span>
              </button>
            </div>

            {/* Security Assurance */}
            <div className="summary-trust-footer">
              <div className="trust-item">
                <ShieldCheck size={16} />
                <span>SSL 256-Bit Encrypted Secure Checkout</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* =========================================================================
          SECTION 3: BEST PRODUCTS ROW (Down in Quick Order page)
          ========================================================================= */}
      <section className="quick-order-container quick-order-best-section">
        <div className="best-section-header">
          <div className="best-header-left">
            <div className="bestseller-badge">
              <Sparkles size={15} />
              <span>Bestselling Essentials</span>
            </div>
            <h2 className="best-section-title">Most Popular Atomy Products</h2>
            <p className="best-section-sub">
              Add genuine Korean health, skincare, and daily care bestsellers to your order with 1-click.
            </p>
          </div>
        </div>

        <div className="bestsellers-cards-grid">
          {QUICK_ORDER_BEST_PRODUCTS.map((prod) => (
            <div key={prod.id} className="bestseller-item-card">
              <div className="bestseller-card-top-tag">
                <span className="rank-number">#{prod.rank}</span>
                <span className="tag-label">{prod.tag}</span>
              </div>

              <div 
                className="bestseller-img-wrap"
                onClick={() => onProductClick && onProductClick(prod)}
                title="Click to view product"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="bestseller-card-img"
                  onError={(e) => { e.target.src = 'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480'; }}
                />
              </div>

              <div className="bestseller-card-info">
                <h4 
                  className="bestseller-card-name"
                  onClick={() => onProductClick && onProductClick(prod)}
                >
                  {prod.name}
                </h4>

                <div className="bestseller-pricing-row">
                  <span className="bestseller-price">₹ {prod.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="bestseller-pv">{prod.pv.toLocaleString()} PV</span>
                </div>

                <button
                  type="button"
                  className="btn-quick-add-bestseller"
                  onClick={() => handleAddSingleProduct(prod)}
                >
                  <Plus size={15} />
                  <span>Quick Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          Search Product Popup Modal (Matching User's First Image)
          ========================================================================= */}
      {isSearchModalOpen && (
        <div 
          className="search-product-modal-backdrop" 
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div 
            className="search-product-modal-dialog" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal Header: Title and Close 'X' */}
            <div className="search-modal-header">
              <h2 id="modal-title" className="search-modal-title">Search product</h2>
              <button
                type="button"
                className="search-modal-close-btn"
                onClick={() => setIsSearchModalOpen(false)}
                aria-label="Close search modal"
              >
                <X size={26} />
              </button>
            </div>

            {/* Search Input Box with Magnifying Glass */}
            <div className="search-modal-input-container">
              <div className="search-input-field-wrap">
                <input
                  type="text"
                  className="search-modal-text-input"
                  placeholder="Product name, Product code"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  autoFocus
                />
                <Search size={22} className="search-modal-magnifier" />
              </div>
            </div>

            {/* Action Bar: Checkbox + All 93 on Left, Add Selected on Right */}
            <div className="search-modal-action-bar">
              <label className="select-all-checkbox-label">
                <input
                  type="checkbox"
                  className="custom-modal-checkbox"
                  checked={isAllFilteredSelected}
                  onChange={handleToggleSelectAll}
                />
                <span className="all-count-text">
                  All <strong>{filteredProducts.length}</strong>
                </span>
              </label>

              <button
                type="button"
                className="btn-add-selected-products"
                onClick={handleAddSelectedProducts}
                disabled={modalCheckedIds.size === 0}
              >
                Add selected product
              </button>
            </div>

            {/* Scrollable Product List */}
            <div className="search-modal-products-list">
              {filteredProducts.length === 0 ? (
                <div className="search-modal-no-results">
                  No products found matching "{modalSearchQuery}".
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const isChecked = modalCheckedIds.has(prod.id);

                  return (
                    <div key={prod.id} className="search-modal-product-item">
                      {/* Top Row: Checkbox + Product Code, Add Button */}
                      <div className="product-item-top-row">
                        <label className="product-code-check-label">
                          <input
                            type="checkbox"
                            className="custom-modal-checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItemCheck(prod.id)}
                          />
                          <span className="product-code-display">{prod.id}</span>
                        </label>

                        <button
                          type="button"
                          className="btn-modal-single-add"
                          onClick={() => handleAddSingleProduct(prod)}
                        >
                          Add
                        </button>
                      </div>

                      {/* Main Details Row: Thumbnail + Title + Price + PV */}
                      <div className="product-item-details-row">
                        <div className="product-thumb-frame">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="product-modal-thumb-img"
                            onError={(e) => { e.target.src = '/images/products/hemohim.png'; }}
                          />
                        </div>

                        <div className="product-modal-meta-content">
                          <div className="product-modal-item-name">{prod.name}</div>
                          <div className="product-modal-item-price">
                            ₹ {prod.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="product-modal-item-pv">
                            {prod.pv.toLocaleString()} PV
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Add / Edit Delivery Address Modal Dialog (With Current Location & PIN Area Auto-detect)
          ========================================================================= */}
      {isAddressModalOpen && (
        <div 
          className="address-editor-modal-backdrop"
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div 
            className="address-editor-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="address-modal-header">
              <h3 className="address-modal-title">
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                type="button"
                className="address-modal-close-btn"
                onClick={() => setIsAddressModalOpen(false)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Address Form */}
            <form onSubmit={handleSaveAddressForm} className="address-editor-form-wrapper">
              {/* Scrollable Form Body */}
              <div className="address-modal-scrollable-body">
                {/* Top Location Bar: Use Current Location Button & Feedback */}
                <div className="modal-current-location-banner">
                  <button
                    type="button"
                    className={`btn-modal-gps-location ${isLocationDetected ? 'location-detected-success' : ''}`}
                    onClick={handleDetectCurrentLocation}
                    disabled={isDetectingLocation}
                  >
                    {isDetectingLocation ? (
                      <>
                        <Loader2 size={16} className="spin-icon" />
                        <span>Detecting Live Location...</span>
                      </>
                    ) : isLocationDetected ? (
                      <>
                        <Check size={16} />
                        <span>Live Location Detected & Applied {detectedLocationName ? `(${detectedLocationName})` : ''}</span>
                      </>
                    ) : (
                      <>
                        <Navigation size={16} />
                        <span>Use Current Location</span>
                      </>
                    )}
                  </button>

                  {locationFeedback && !isLocationDetected && (
                    <span className="location-feedback-pill">
                      {locationFeedback}
                    </span>
                  )}
                </div>

                {/* Address Type Tag (Home / Office / Other) */}
                <div className="address-tag-select-row">
                  <span className="tag-row-label">Address Type:</span>
                  <div className="tag-options-pills">
                    {['Home', 'Office', 'Other'].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`btn-tag-pill ${addressForm.tag === type ? 'active' : ''}`}
                        onClick={() => setAddressForm(prev => ({ ...prev, tag: type }))}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient Name & Phone */}
                <div className="form-grid-2col">
                  <div className="quick-form-group">
                    <label>Recipient Name <span className="req-star">*</span></label>
                    <input
                      type="text"
                      className="quick-text-input"
                      placeholder="Full name of recipient"
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, recipientName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="quick-form-group">
                    <label>Mobile Number <span className="req-star">*</span></label>
                    <div className="phone-prefix-wrap">
                      <span className="phone-prefix-badge">+91</span>
                      <input
                        type="tel"
                        className="quick-text-input with-prefix"
                        placeholder="10-digit mobile number"
                        value={addressForm.recipientPhone}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, recipientPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* PIN Code, City, State with District & Area Detection */}
                <div className="form-grid-3col">
                  <div className="quick-form-group">
                    <div className="label-with-lookup">
                      <label>PIN Code <span className="req-star">*</span></label>
                      {isLookingUpPincode && (
                        <span className="lookup-indicator">
                          <Loader2 size={12} className="spin-icon" /> Finding...
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      className="quick-text-input"
                      placeholder="6-digit PIN"
                      value={addressForm.pincode}
                      onChange={handleFormPincodeChange}
                      required
                    />
                  </div>
                  <div className="quick-form-group">
                    <label>District / City <span className="req-star">*</span></label>
                    <input
                      type="text"
                      className="quick-text-input"
                      placeholder="District / City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="quick-form-group">
                    <label>State <span className="req-star">*</span></label>
                    <input
                      type="text"
                      className="quick-text-input"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Specific Areas Auto-Detected for this PIN */}
                {availableAreas.length > 0 && (
                  <div className="detected-areas-box">
                    <span className="detected-areas-title">
                      Specific Areas / Post Offices in PIN {addressForm.pincode} (Click to set):
                    </span>
                    <div className="areas-chips-wrap">
                      {availableAreas.slice(0, 8).map(area => (
                        <button
                          key={area}
                          type="button"
                          className={`area-chip-btn ${addressForm.addressLine2 === area ? 'active' : ''}`}
                          onClick={() => handleSelectAreaChip(area)}
                        >
                          <MapPin size={11} />
                          <span>{area}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address Line 1 */}
                <div className="quick-form-group full-span">
                  <label>Flat / House No. / Building / Apartment <span className="req-star">*</span></label>
                  <input
                    type="text"
                    className="quick-text-input"
                    placeholder="e.g. Flat 402, Block B, Cyber City Apartments"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                    required
                  />
                </div>

                {/* Address Line 2 */}
                <div className="quick-form-group full-span">
                  <label>Area / Street / Sector / Road <span className="req-star">*</span></label>
                  <input
                    type="text"
                    className="quick-text-input"
                    placeholder="e.g. Sector 39, Near Cyber Park"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                    required
                  />
                </div>

                {/* Landmark & Alternate Phone */}
                <div className="form-grid-2col">
                  <div className="quick-form-group">
                    <label>Landmark (Optional)</label>
                    <input
                      type="text"
                      className="quick-text-input"
                      placeholder="e.g. Near Metro Station / Behind Mall"
                      value={addressForm.landmark}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                    />
                  </div>
                  <div className="quick-form-group">
                    <label>Alternate Mobile (Optional)</label>
                    <div className="phone-prefix-wrap">
                      <span className="phone-prefix-badge">+91</span>
                      <input
                        type="tel"
                        className="quick-text-input with-prefix"
                        placeholder="Alternate phone number"
                        value={addressForm.alternatePhone}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, alternatePhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Note */}
                <div className="quick-form-group full-span">
                  <label>Delivery Instructions / Note (Optional)</label>
                  <input
                    type="text"
                    className="quick-text-input"
                    placeholder="e.g. Call before delivery, leave with security"
                    value={addressForm.deliveryMessage}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, deliveryMessage: e.target.value }))}
                  />
                </div>

                {/* Default Address Checkbox */}
                <label className="default-address-checkbox-label">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  <span>Set this as my default delivery address</span>
                </label>
              </div>

              {/* Fixed Bottom Sticky Footer */}
              <div className="address-modal-footer">
                {editingAddressId ? (
                  <button
                    type="button"
                    className="btn-modal-delete-address"
                    onClick={() => handleDeleteAddress(editingAddressId)}
                  >
                    <Trash2 size={16} />
                    <span>Delete Address</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="footer-actions-right">
                  <button
                    type="button"
                    className="btn-address-cancel"
                    onClick={() => setIsAddressModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-address-save"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
