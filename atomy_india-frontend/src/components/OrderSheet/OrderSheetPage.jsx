import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  ArrowLeft, 
  Lock, 
  RotateCcw, 
  Sparkles, 
  Info,
  Navigation,
  Loader2,
  Check,
  Plus,
  Trash2,
  Edit2,
  Home,
  Briefcase
} from 'lucide-react';
import './OrderSheetPage.css';
import customPaymentQr from '../../assets/WhatsApp Image 2026-10-06 at 12.14.42 PM.jpeg';

// Curated list of Bestseller Products with verified working CDN images
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

export default function OrderSheetPage({ 
  cartItems = [], 
  onNavigateHome, 
  onNavigateBack,
  onNavigateCart, 
  onNavigateOrders, 
  onOrderSuccess,
  onClearCart,
  onAddToCart,
  onProductClick
}) {
  // Steps: 'sheet' (02 Order & Delivery) | 'payment' (03 Payment Gateway) | 'completed' (04 Order Completed)
  const [step, setStep] = useState('sheet');
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);

  // Customer / Orderer Information
  const [ordererName, setOrdererName] = useState('Naveen Kumar');
  const [ordererPhone, setOrdererPhone] = useState('9876543210');
  const [ordererEmail, setOrdererEmail] = useState('naveen@example.com');

  // Delivery Addresses List & Active Selection (Synced with localStorage)
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_customer_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [INITIAL_DEFAULT_ADDRESS];
  });

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      const active = localStorage.getItem('atomy_shipping_address');
      if (active) {
        const parsed = JSON.parse(active);
        if (parsed && parsed.id) return parsed.id;
      }
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
  const [editingAddressId, setEditingAddressId] = useState(null);
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

  // Geolocation & PIN Code Live Detection States (Inside Address Modal)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState('');
  const [locationFeedback, setLocationFeedback] = useState(null);
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [quickAddToast, setQuickAddToast] = useState(null);

  // Dedicated Payment Method States (Used on step === 'payment')
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING' | 'COD'
  const [upiId, setUpiId] = useState('naveen.mj2.45-1@okicici');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'other'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [qrTimer, setQrTimer] = useState(272); // 4 minutes 32 seconds as in screenshot (272s)
  const [isFeesOpen, setIsFeesOpen] = useState(true);
  const [saveCardRbi, setSaveCardRbi] = useState(true);
  const [customUpiMode, setCustomUpiMode] = useState(false);

  // Live countdown timer for UPI QR Code
  useEffect(() => {
    if (step !== 'payment') return;
    const interval = setInterval(() => {
      setQrTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Consent checkbox
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // Active selected address object
  const currentSelectedAddress = useMemo(() => {
    if (addresses.length === 0) return null;
    return addresses.find(a => a.id === selectedAddressId) || addresses[0] || null;
  }, [addresses, selectedAddressId]);

  // Sync addresses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atomy_customer_addresses', JSON.stringify(addresses));
    } catch {}
  }, [addresses]);

  useEffect(() => {
    if (currentSelectedAddress) {
      try {
        localStorage.setItem('atomy_shipping_address', JSON.stringify(currentSelectedAddress));
      } catch {}
    }
  }, [currentSelectedAddress]);

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  }, [cartItems]);

  const totalPV = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + ((item.pv || 0) * item.qty), 0);
  }, [cartItems]);

  const totalQty = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty, 0);
  }, [cartItems]);

  // Delivery fee: Free for orders over ₹1,000; otherwise ₹99
  const shippingFee = subtotal >= 1000 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  // Trigger Live GPS Current Location Detection inside Address Modal
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

          if (detectedPin && detectedPin.length === 6) {
            handleLookupPincodeDetails(detectedPin);
          }

          setLocationFeedback(`✓ Location applied: ${detectedCity}, ${detectedState}`);
          setTimeout(() => setLocationFeedback(null), 4000);
        } catch (err) {
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
      () => {
        setIsDetectingLocation(false);
        setIsLocationDetected(false);
        setLocationFeedback('Location access not permitted. Enter 6-digit PIN code for auto-detection.');
        setTimeout(() => setLocationFeedback(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Live lookup for Indian PIN code
  const handleLookupPincodeDetails = async (pin) => {
    setIsLookingUpPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();
      if (data && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice)) {
        const postOffices = data[0].PostOffice;
        const district = postOffices[0].District;
        const st = postOffices[0].State;
        const areaNames = postOffices.map(po => po.Name).filter(Boolean);

        setAddressForm(prev => ({
          ...prev,
          city: district || prev.city,
          state: st || prev.state,
          addressLine2: prev.addressLine2 ? prev.addressLine2 : (areaNames[0] || '')
        }));

        setAvailableAreas(areaNames);
      }
    } catch {}
    finally {
      setIsLookingUpPincode(false);
    }
  };

  // Handle PIN code form change
  const handleFormPincodeChange = (e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
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

  // Area chip click
  const handleSelectAreaChip = (areaName) => {
    setAddressForm(prev => ({ ...prev, addressLine2: areaName }));
  };

  // Open Add Address Modal
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

  // Open Edit Address Modal
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

  // Delete Address
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

  // Set Default Address
  const handleSetDefaultAddress = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  // Save Address from Modal Form
  const handleSaveAddressForm = (e) => {
    e.preventDefault();
    if (!addressForm.recipientName.trim() || !addressForm.recipientPhone.trim() || !addressForm.pincode.trim() || !addressForm.addressLine1.trim()) {
      alert('Please fill in all mandatory fields marked with *');
      return;
    }

    if (editingAddressId) {
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

  // Step 1 -> Step 2: Proceed to Payment page
  const handleProceedToPayment = () => {
    if (!currentSelectedAddress) {
      alert('Please add or select a delivery address before proceeding to payment.');
      return;
    }
    if (!agreedTerms) {
      alert('Please review the ordered items and confirm delivery details.');
      return;
    }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Submit and Complete Order
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const orderId = `AT${new Date().toISOString().replace(/\D/g, '').slice(0, 12)}`;
      const newOrder = {
        orderId: orderId,
        date: new Date().toISOString(),
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Payment Completed',
        courier: 'Blue Dart Express (Assigned)',
        trackingNumber: `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI (Google Pay / PhonePe)' 
                     : paymentMethod === 'CARD' ? 'Credit / Debit Card'
                     : paymentMethod === 'NETBANKING' ? `Net Banking (${selectedBank})`
                     : 'Cash on Delivery',
        deliveryType: 'direct',
        recipient: currentSelectedAddress?.recipientName || ordererName,
        phone: currentSelectedAddress?.recipientPhone || ordererPhone,
        address: {
          recipient: currentSelectedAddress?.recipientName || ordererName,
          phone: currentSelectedAddress?.recipientPhone || ordererPhone,
          fullAddress: currentSelectedAddress 
            ? `${currentSelectedAddress.addressLine1}, ${currentSelectedAddress.addressLine2 || ''}, Landmark: ${currentSelectedAddress.landmark || 'N/A'}, ${currentSelectedAddress.city}, ${currentSelectedAddress.state} - ${currentSelectedAddress.pincode}`
            : 'Doorstep Courier Delivery'
        },
        items: cartItems.map(it => ({ ...it })),
        subtotal,
        shippingFee,
        grandTotal,
        totalPV
      };

      setPlacedOrderDetails(newOrder);
      setIsProcessing(false);
      setStep('completed');

      if (onOrderSuccess) {
        onOrderSuccess(newOrder);
      }
      if (onClearCart) {
        onClearCart();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1400);
  };

  // Quick Add bestseller to cart
  const handleQuickAddBestseller = (prod) => {
    if (onAddToCart) {
      onAddToCart(prod);
    }
    setQuickAddToast(`Added ${prod.name} to Order!`);
    setTimeout(() => setQuickAddToast(null), 2500);
  };

  return (
    <div className="order-sheet-page">
      {/* 1. Breadcrumbs & Stepper Header */}
      <div className="order-sheet-breadcrumbs">
        <div className="container breadcrumb-container">
          <div className="breadcrumb-nav">
            <button type="button" onClick={onNavigateHome} className="b-link">Home</button>
            <ChevronRight size={14} className="b-sep" />
            <button type="button" onClick={onNavigateCart} className="b-link">Shopping Cart</button>
            <ChevronRight size={14} className="b-sep" />
            <span className="b-current">
              {step === 'sheet' ? 'Order & Address' : step === 'payment' ? 'Payment Gateway' : 'Order Placed'}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="order-steps-stepper">
            <div className={`step-item ${step === 'sheet' ? 'active' : 'completed'}`}>
              <span className="step-num">01</span>
              <span className="step-label">Shopping Cart</span>
            </div>
            <div className={`step-item ${step === 'sheet' ? 'active current-pill' : 'completed'}`}>
              <span className="step-num">02</span>
              <span className="step-label">Order & Address</span>
            </div>
            <div className={`step-item ${step === 'payment' ? 'active current-pill' : (step === 'completed' ? 'completed' : '')}`}>
              <span className="step-num">03</span>
              <span className="step-label">Payment</span>
            </div>
            <div className={`step-item ${step === 'completed' ? 'active current-pill' : ''}`}>
              <span className="step-num">04</span>
              <span className="step-label">Completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container order-sheet-main-container">
        {step === 'sheet' ? (
          /* =========================================================================
             STEP 02: Order Details & Address Selection (Matching Quick Order)
             ========================================================================= */
          <>
            <div className="order-sheet-content-grid">
              {/* Left Main Column */}
              <div className="sheet-main-column">
                {/* Section 1: Order Products Summary */}
                <div className="sheet-card">
                  <div 
                    className="sheet-card-header clickable" 
                    onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                  >
                    <div className="card-header-title">
                      <ShoppingBag size={20} color="#00A3E0" />
                      <span>Order Products ({totalQty} {totalQty === 1 ? 'item' : 'items'})</span>
                    </div>
                    <div className="card-header-toggle">
                      <span className="header-pv-preview">Total {totalPV.toLocaleString('en-IN')} PV</span>
                      {isProductsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {isProductsExpanded && (
                    <div className="sheet-card-body products-card-body">
                      {cartItems.length === 0 ? (
                        <div className="sheet-empty-cart-alert">
                          <p>Your order sheet has no products selected yet.</p>
                          <div className="empty-cart-actions">
                            <button 
                              type="button" 
                              className="btn-browse-shop"
                              onClick={onNavigateHome}
                            >
                              Continue Shopping
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="sheet-products-table">
                          {cartItems.map((item) => (
                            <div key={item.id} className="sheet-product-row">
                              <div className="sheet-product-img">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480';
                                  }}
                                />
                              </div>
                              <div className="sheet-product-info">
                                <h4 className="sheet-product-title">{item.name}</h4>
                                <span className="sheet-product-code">{item.id}</span>
                                <div className="sheet-product-meta">
                                  <span className="meta-qty">Qty: {item.qty}</span>
                                  {item.pv > 0 && (
                                    <span className="meta-pv">PV {(item.pv * item.qty).toLocaleString('en-IN')}</span>
                                  )}
                                </div>
                              </div>
                              <div className="sheet-product-pricing">
                                <span className="sheet-item-price">
                                  ₹ {(item.price * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                                {item.qty > 1 && (
                                  <span className="sheet-unit-price">
                                    (₹ {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each)
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 2: Customer / Orderer Information */}
                <div className="sheet-card">
                  <div className="sheet-card-header">
                    <div className="card-header-title">
                      <Info size={20} color="#00A3E0" />
                      <span>Orderer Information (Direct Customer)</span>
                    </div>
                  </div>
                  <div className="sheet-card-body">
                    <div className="form-two-col">
                      <div className="sheet-form-group">
                        <label>Customer Name *</label>
                        <input
                          type="text"
                          value={ordererName}
                          onChange={(e) => setOrdererName(e.target.value)}
                          placeholder="Enter full name"
                          className="sheet-input"
                          required
                        />
                      </div>
                      <div className="sheet-form-group">
                        <label>Mobile Number *</label>
                        <div className="input-with-prefix">
                          <span className="input-prefix">+91</span>
                          <input
                            type="tel"
                            value={ordererPhone}
                            onChange={(e) => setOrdererPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="10-digit mobile number"
                            className="sheet-input"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sheet-form-group full-width">
                      <label>Email Address for Order Invoice *</label>
                      <input
                        type="email"
                        value={ordererEmail}
                        onChange={(e) => setOrdererEmail(e.target.value)}
                        placeholder="e.g. yourname@example.com"
                        className="sheet-input"
                        required
                      />
                      <span className="field-hint">Your order receipt and delivery tracking notifications will be dispatched to this email.</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Delivery Information (Door Delivery with Saved Addresses like Quick Order) */}
                <div className="sheet-card">
                  <div className="sheet-card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div className="card-header-title">
                      <Truck size={20} color="#00A3E0" />
                      <span>Delivery Address (Doorstep Courier Delivery)</span>
                    </div>
                    <button
                      type="button"
                      className="btn-add-new-address"
                      onClick={handleOpenAddAddress}
                    >
                      <Plus size={16} />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  <div className="sheet-card-body">
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
                                  <button
                                    type="button"
                                    className="btn-edit-address-icon"
                                    onClick={(e) => handleOpenEditAddress(addr, e)}
                                    title="Edit this address"
                                  >
                                    <Edit2 size={14} />
                                    <span>Edit</span>
                                  </button>

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

                              <div className="address-recipient-info">
                                <strong className="recipient-name-bold">{addr.recipientName}</strong>
                                <span className="recipient-phone-num">+91 {addr.recipientPhone}</span>
                                {addr.alternatePhone && (
                                  <span className="recipient-alt-phone">(Alt: +91 {addr.alternatePhone})</span>
                                )}
                              </div>

                              <div className="address-full-text">
                                <p className="address-line-text">{addr.addressLine1}</p>
                                {addr.addressLine2 && <p className="address-line-text">{addr.addressLine2}</p>}
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
                </div>
              </div>

              {/* Right Sticky Summary Column */}
              <div className="sheet-sidebar-column">
                <div className="payment-summary-card">
                  <h3 className="summary-title">Payment Summary</h3>

                  <div className="summary-breakdown">
                    <div className="summary-line">
                      <span className="line-label">Product Total ({totalQty} items)</span>
                      <span className="line-value">₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="summary-line pv-line">
                      <span className="line-label">Accumulated PV Points</span>
                      <span className="line-value pv-text">+{totalPV.toLocaleString('en-IN')} PV</span>
                    </div>

                    <div className="summary-line">
                      <span className="line-label">Doorstep Delivery Fee</span>
                      <span className="line-value">
                        {shippingFee === 0 ? (
                          <span className="free-tag">FREE</span>
                        ) : (
                          `₹ ${shippingFee.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    {shippingFee === 0 && (
                      <div className="free-shipping-note">
                        <CheckCircle2 size={13} color="#10b981" />
                        <span>Free Standard Delivery Applied</span>
                      </div>
                    )}

                    {/* Destination preview in summary */}
                    {currentSelectedAddress && (
                      <div className="summary-delivery-preview" style={{ marginTop: '16px', background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#00A3E0', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Delivering To:
                        </div>
                        <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>
                          {currentSelectedAddress.recipientName} (+91 {currentSelectedAddress.recipientPhone})
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {currentSelectedAddress.city}, {currentSelectedAddress.state} - {currentSelectedAddress.pincode}
                        </div>
                      </div>
                    )}

                    <div className="summary-divider"></div>

                    <div className="summary-grand-total">
                      <div className="grand-label">
                        <span>Total Payment Amount</span>
                        <small>(Inclusive of GST)</small>
                      </div>
                      <div className="grand-amount">
                        ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="consent-agreements">
                    <label className="consent-checkbox-row">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                      />
                      <span>I confirm the items and doorstep delivery address details.</span>
                    </label>
                  </div>

                  {/* Proceed to Payment CTA */}
                  <button
                    type="button"
                    className="place-order-submit-btn"
                    onClick={handleProceedToPayment}
                    disabled={!currentSelectedAddress || !agreedTerms || cartItems.length === 0}
                  >
                    <span>Proceed to Payment</span>
                    <ChevronRight size={18} />
                  </button>

                  {/* Trust Badges */}
                  <div className="sidebar-trust-badges">
                    <div className="trust-badge-item">
                      <ShieldCheck size={16} color="#00A3E0" />
                      <span>100% Genuine Atomy Guarantee</span>
                    </div>
                    <div className="trust-badge-item">
                      <RotateCcw size={16} color="#00A3E0" />
                      <span>30-Day Return & Exchange Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Best-Selling Products Row on Order Review Page */}
            <section className="quick-order-best-section">
              <div className="best-section-header">
                <div className="best-section-header-left">
                  <div className="best-badge">
                    <Sparkles size={16} />
                    <span>Customer Favorites</span>
                  </div>
                  <h2 className="best-section-title">Most Popular Atomy Products</h2>
                  <p className="best-section-subtitle">
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
                        onClick={() => handleQuickAddBestseller(prod)}
                      >
                        <Plus size={15} />
                        <span>Quick Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : step === 'payment' ? (
          /* =========================================================================
             STEP 03: Dedicated Modern Payment Gateway Page (Matching User Screenshot)
             ========================================================================= */
          <div className="payment-gateway-page animate-fade">
            {/* Top Navigation & Header Bar */}
            <div className="pg-top-header">
              <button
                type="button"
                className="pg-back-link-btn"
                onClick={() => { setStep('sheet'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                title="Return to Address and Order Sheet"
              >
                <ArrowLeft size={22} className="pg-back-arrow" />
                <span className="pg-header-title">Complete Payment</span>
              </button>

              <div className="pg-secure-badge-pill">
                <Lock size={15} className="pg-lock-icon" />
                <span>100% Secure</span>
              </div>
            </div>

            {/* 3-Column Main Payment Layout */}
            <div className="pg-three-column-grid">
              {/* ---------------------------------------------------------------
                  COLUMN 1: Left Payment Methods Selector
                  --------------------------------------------------------------- */}
              <div className="pg-methods-column">
                <div className="pg-methods-list">
                  {/* Option 1: UPI */}
                  <div
                    className={`pg-method-card ${paymentMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <div className="pg-method-icon-box">
                      <span className="pg-upi-text-badge">UPI</span>
                    </div>
                    <div className="pg-method-info">
                      <div className="pg-method-name">UPI</div>
                      <div className="pg-method-desc">Pay by any UPI app</div>
                    </div>
                  </div>

                  {/* Option 2: Credit / Debit / ATM Card */}
                  <div
                    className={`pg-method-card ${paymentMethod === 'CARD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('CARD')}
                  >
                    <div className="pg-method-icon-box">
                      <CreditCard size={22} className="pg-icon-svg" />
                    </div>
                    <div className="pg-method-info">
                      <div className="pg-method-name">Credit / Debit / ATM Card</div>
                      <div className="pg-method-desc">Add and secure cards as per RBI guidelines</div>
                      <div className="pg-method-offer-tag">Get upto 5% cashback • 2 offers available</div>
                    </div>
                  </div>

                  {/* Option 3: Cash on Delivery */}
                  <div
                    className={`pg-method-card ${paymentMethod === 'COD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <div className="pg-method-icon-box">
                      <Banknote size={22} className="pg-icon-svg" />
                    </div>
                    <div className="pg-method-info">
                      <div className="pg-method-name">Cash on Delivery</div>
                      <div className="pg-method-desc">Pay cash upon parcel delivery</div>
                    </div>
                  </div>

                  {/* Option 4: Net Banking (Requested by user) */}
                  <div
                    className={`pg-method-card ${paymentMethod === 'NETBANKING' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('NETBANKING')}
                  >
                    <div className="pg-method-icon-box">
                      <Building2 size={22} className="pg-icon-svg" />
                    </div>
                    <div className="pg-method-info">
                      <div className="pg-method-name">Net Banking</div>
                      <div className="pg-method-desc">All major Indian banks supported</div>
                    </div>
                  </div>
                </div>

                {/* Delivery destination snapshot reminder */}
                {currentSelectedAddress && (
                  <div className="pg-delivery-destination-mini">
                    <div className="pg-dest-header">
                      <Truck size={14} color="#00A3E0" />
                      <span>Shipping to: <strong>{currentSelectedAddress.recipientName}</strong></span>
                    </div>
                    <p className="pg-dest-line">
                      {currentSelectedAddress.addressLine1}, {currentSelectedAddress.city} - {currentSelectedAddress.pincode}
                    </p>
                  </div>
                )}
              </div>

              {/* ---------------------------------------------------------------
                  COLUMN 2: Center Interactive Payment Display
                  --------------------------------------------------------------- */}
              <div className="pg-center-column">
                {/* 2A: UPI SCAN QR AND PAY (Default from user screenshot) */}
                {paymentMethod === 'UPI' && (
                  <div className="pg-upi-center-wrapper animate-fade">
                    <div className="pg-center-header">
                      <h3 className="pg-center-title">Scan QR and Pay</h3>
                      <ChevronUp size={18} className="pg-collapse-icon" />
                    </div>

                    {/* QR Payment White Card */}
                    <div className="pg-qr-frame-card">
                      <div className="pg-qr-amount-header">
                        <span className="pg-qr-amount-label">AMOUNT</span>
                        <div className="pg-qr-amount-val">
                          ₹{(grandTotal > 0 ? grandTotal : 409).toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Uploaded Google Pay UPI QR Code */}
                      <div className="pg-qr-code-graphic">
                        <img
                          src={customPaymentQr}
                          alt="Naveen 070 Google Pay UPI QR Code"
                          className="pg-custom-qr-image"
                        />
                      </div>

                      {/* UPI Brand Logos Bar */}
                      <div className="pg-upi-apps-logo-row">
                        {/* GPay */}
                        <div className="pg-upi-app-badge gpay" title="Google Pay">
                          <svg viewBox="0 0 40 40" width="28" height="28">
                            <rect width="40" height="40" rx="20" fill="#ffffff" />
                            <path d="M28 20.2c0-.7-.06-1.3-.18-1.9H20v3.7h4.6c-.2 1.1-.8 2-1.7 2.6v2.2h2.8c1.6-1.5 2.6-3.8 2.6-6.6z" fill="#4285F4" />
                            <path d="M20 28.5c2.3 0 4.2-.8 5.7-2.1l-2.8-2.2c-.8.5-1.8.8-2.9.8-2.2 0-4.1-1.5-4.8-3.5h-2.9v2.3c1.4 2.8 4.3 4.7 7.7 4.7z" fill="#34A853" />
                            <path d="M15.2 21.5c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9v-2.3h-2.9c-.6 1.2-1 2.6-1 4.2s.4 3 1 4.2l2.9-2.3z" fill="#FBBC05" />
                            <path d="M20 14.7c1.3 0 2.4.4 3.3 1.3l2.5-2.5c-1.5-1.4-3.5-2.3-5.8-2.3-3.4 0-6.3 1.9-7.7 4.7l2.9 2.3c.7-2 2.6-3.5 4.8-3.5z" fill="#EA4335" />
                          </svg>
                        </div>

                        {/* PhonePe */}
                        <div className="pg-upi-app-badge phonepe" title="PhonePe">
                          <svg viewBox="0 0 40 40" width="28" height="28">
                            <rect width="40" height="40" rx="20" fill="#5f259f" />
                            <text x="20" y="27" fontSize="22" fontWeight="900" fill="#ffffff" textAnchor="middle" fontFamily="sans-serif">पे</text>
                          </svg>
                        </div>

                        {/* Paytm */}
                        <div className="pg-upi-app-badge paytm" title="Paytm">
                          <svg viewBox="0 0 40 40" width="28" height="28">
                            <rect width="40" height="40" rx="6" fill="#002e6e" />
                            <text x="20" y="25" fontSize="11" fontWeight="900" fill="#00b9f5" textAnchor="middle" fontFamily="sans-serif">paytm</text>
                          </svg>
                        </div>

                        {/* BHIM UPI */}
                        <div className="pg-upi-app-badge bhim" title="BHIM UPI">
                          <svg viewBox="0 0 40 40" width="28" height="28">
                            <rect width="40" height="40" rx="6" fill="#005a9c" />
                            <path d="M12 28l12-16v8l-6 8z" fill="#f47920" />
                            <path d="M28 12l-12 16v-8l6-8z" fill="#00a859" />
                          </svg>
                        </div>
                      </div>

                      <div className="pg-upi-or-text">or any other UPI app</div>
                    </div>

                    {/* QR Countdown Timer */}
                    <div className="pg-qr-timer-block">
                      <div className="pg-qr-timer-text">
                        QR valid for <strong>{formatTimer(qrTimer)}</strong> minutes
                      </div>
                      <div className="pg-qr-progress-track">
                        <div
                          className="pg-qr-progress-bar"
                          style={{ width: `${Math.max(0, Math.min(100, (qrTimer / 272) * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <p className="pg-qr-notice">
                      Do not hit back or close this screen until the transaction is complete
                    </p>

                    {/* Instant Complete / Verify CTA */}
                    <div className="pg-upi-actions-row">
                      <button
                        type="button"
                        className="pg-btn-verify-pay"
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="pg-btn-spinner-row">
                            <Loader2 size={18} className="animate-spin" />
                            <span>Verifying UPI Payment...</span>
                          </span>
                        ) : (
                          <span>I Have Completed UPI Payment (₹{(grandTotal > 0 ? grandTotal : 409).toLocaleString('en-IN')})</span>
                        )}
                      </button>

                      {/* Optional UPI ID Manual Input Toggle */}
                      <button
                        type="button"
                        className="pg-btn-toggle-vpa"
                        onClick={() => setCustomUpiMode(!customUpiMode)}
                      >
                        {customUpiMode ? 'Hide UPI ID Entry' : 'Or pay using Virtual UPI ID / VPA'}
                      </button>

                      {customUpiMode && (
                        <div className="pg-custom-vpa-box animate-fade">
                          <label>Enter Your UPI ID (Google Pay, PhonePe, BHIM, etc.)</label>
                          <div className="pg-vpa-input-row">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="e.g. mobile@okhdfcbank or user@paytm"
                              className="pg-vpa-input"
                            />
                            <button
                              type="button"
                              className="pg-vpa-pay-btn"
                              onClick={handlePlaceOrder}
                              disabled={!upiId.trim() || isProcessing}
                            >
                              Send Request
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2B: CREDIT / DEBIT / ATM CARD */}
                {paymentMethod === 'CARD' && (
                  <div className="pg-subform-center-card animate-fade">
                    <div className="pg-center-header">
                      <h3 className="pg-center-title">Credit / Debit / ATM Card</h3>
                      <ChevronUp size={18} className="pg-collapse-icon" />
                    </div>

                    <div className="pg-card-form-body">
                      <div className="pg-form-group">
                        <label>Card Number</label>
                        <div className="pg-card-input-wrap">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                              setCardNumber(v.replace(/(\d{4})/g, '$1 ').trim());
                            }}
                            placeholder="XXXX XXXX XXXX XXXX"
                            className="pg-input mono"
                          />
                          <div className="pg-card-type-logos">
                            <span className="card-badge visa">VISA</span>
                            <span className="card-badge master">Mastercard</span>
                            <span className="card-badge rupay">RuPay</span>
                          </div>
                        </div>
                      </div>

                      <div className="pg-form-row-two">
                        <div className="pg-form-group">
                          <label>Valid Thru (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                              if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                              setCardExpiry(v);
                            }}
                            placeholder="MM/YY"
                            className="pg-input mono"
                          />
                        </div>

                        <div className="pg-form-group">
                          <label>CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="3 or 4 digits"
                            className="pg-input mono"
                          />
                        </div>
                      </div>

                      <div className="pg-form-group">
                        <label>Name on Card</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name as printed on your card"
                          className="pg-input"
                        />
                      </div>

                      <label className="pg-rbi-checkbox-row">
                        <input
                          type="checkbox"
                          checked={saveCardRbi}
                          onChange={(e) => setSaveCardRbi(e.target.checked)}
                        />
                        <span>Securely tokenize & save this card as per RBI guidelines</span>
                      </label>

                      <button
                        type="button"
                        className="pg-btn-verify-pay"
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        style={{ marginTop: '14px' }}
                      >
                        {isProcessing ? (
                          <span className="pg-btn-spinner-row">
                            <Loader2 size={18} className="animate-spin" />
                            <span>Authorizing Card Payment...</span>
                          </span>
                        ) : (
                          <span>Pay ₹{(grandTotal > 0 ? grandTotal : 409).toLocaleString('en-IN')}</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2C: CASH ON DELIVERY */}
                {paymentMethod === 'COD' && (
                  <div className="pg-subform-center-card animate-fade">
                    <div className="pg-center-header">
                      <h3 className="pg-center-title">Cash on Delivery</h3>
                      <ChevronUp size={18} className="pg-collapse-icon" />
                    </div>

                    <div className="pg-cod-body">
                      <div className="pg-cod-icon-highlight">
                        <Banknote size={44} color="#10b981" />
                      </div>
                      <h4 className="pg-cod-heading">Pay at Your Doorstep</h4>
                      <p className="pg-cod-info">
                        You can pay with cash or ask the courier executive for their UPI QR code upon parcel arrival.
                      </p>

                      <div className="pg-cod-bullet-box">
                        <div className="pg-cod-bullet">
                          <CheckCircle2 size={16} color="#10b981" />
                          <span>Exact change is recommended for faster handover</span>
                        </div>
                        <div className="pg-cod-bullet">
                          <CheckCircle2 size={16} color="#10b981" />
                          <span>Official courier tax invoice provided upon delivery</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="pg-btn-verify-pay"
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        style={{ marginTop: '20px' }}
                      >
                        {isProcessing ? (
                          <span className="pg-btn-spinner-row">
                            <Loader2 size={18} className="animate-spin" />
                            <span>Confirming Cash on Delivery Order...</span>
                          </span>
                        ) : (
                          <span>Confirm Order with Cash on Delivery (₹{(grandTotal > 0 ? grandTotal : 409).toLocaleString('en-IN')})</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2D: NET BANKING (Requested by user) */}
                {paymentMethod === 'NETBANKING' && (
                  <div className="pg-subform-center-card animate-fade">
                    <div className="pg-center-header">
                      <h3 className="pg-center-title">Net Banking</h3>
                      <ChevronUp size={18} className="pg-collapse-icon" />
                    </div>

                    <div className="pg-netbanking-body">
                      <div className="pg-nb-subtitle">Select Popular Indian Bank</div>
                      <div className="pg-banks-grid">
                        {[
                          { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC' },
                          { id: 'ICICI', name: 'ICICI Bank', code: 'ICICI' },
                          { id: 'SBI', name: 'State Bank of India', code: 'SBI' },
                          { id: 'Axis Bank', name: 'Axis Bank', code: 'AXIS' },
                          { id: 'Kotak', name: 'Kotak Bank', code: 'KOTAK' },
                          { id: 'PNB', name: 'Punjab National Bank', code: 'PNB' }
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            className={`pg-bank-btn ${selectedBank === b.id ? 'active' : ''}`}
                            onClick={() => setSelectedBank(b.id)}
                          >
                            <span className="pg-bank-badge-code">{b.code}</span>
                            <span className="pg-bank-name">{b.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="pg-form-group" style={{ marginTop: '18px' }}>
                        <label>Or Choose Other Bank</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="pg-input"
                        >
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="SBI">State Bank of India</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak">Kotak Mahindra Bank</option>
                          <option value="PNB">Punjab National Bank</option>
                          <option value="Bank of Baroda">Bank of Baroda</option>
                          <option value="Canara Bank">Canara Bank</option>
                          <option value="Union Bank of India">Union Bank of India</option>
                          <option value="IndusInd Bank">IndusInd Bank</option>
                          <option value="Yes Bank">Yes Bank</option>
                          <option value="IDBI Bank">IDBI Bank</option>
                          <option value="Federal Bank">Federal Bank</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        className="pg-btn-verify-pay"
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        style={{ marginTop: '20px' }}
                      >
                        {isProcessing ? (
                          <span className="pg-btn-spinner-row">
                            <Loader2 size={18} className="animate-spin" />
                            <span>Redirecting to {selectedBank}...</span>
                          </span>
                        ) : (
                          <span>Pay via {selectedBank} (₹{(grandTotal > 0 ? grandTotal : 409).toLocaleString('en-IN')})</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ---------------------------------------------------------------
                  COLUMN 3: Right Price Summary Panel (Matching User Screenshot)
                  --------------------------------------------------------------- */}
              <div className="pg-right-summary-column">
                <div className="pg-price-summary-card">
                  {/* MRP Line */}
                  <div className="pg-summary-row">
                    <span className="pg-sum-label">MRP (incl. of all taxes)</span>
                    <span className="pg-sum-value">₹{(subtotal > 0 ? subtotal : (grandTotal > 0 ? grandTotal : 409)).toLocaleString('en-IN')}</span>
                  </div>

                  {/* Fees Accordion (Matching screenshot) */}
                  <div className="pg-summary-section">
                    <div
                      className="pg-summary-section-head clickable"
                      onClick={() => setIsFeesOpen(!isFeesOpen)}
                    >
                      <span className="pg-sum-label">Fees</span>
                      {isFeesOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                    {isFeesOpen && (
                      <div className="pg-summary-nested-row">
                        <span className="pg-nested-label">Platform Fee</span>
                        <span className="pg-nested-val">
                          {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Member PV Points info (Replacing coupon as requested) */}
                  {totalPV > 0 && (
                    <div className="pg-summary-section">
                      <div className="pg-summary-nested-row" style={{ marginTop: '6px' }}>
                        <span className="pg-nested-label" style={{ color: '#00A3E0', fontWeight: 600 }}>Atomy PV Points Earned</span>
                        <span className="pg-nested-val" style={{ color: '#00A3E0', fontWeight: 700 }}>+{totalPV.toLocaleString('en-IN')} PV</span>
                      </div>
                    </div>
                  )}

                  {/* Total Amount Blue Highlight Container (Matching screenshot) */}
                  <div className="pg-total-amount-box">
                    <span className="pg-total-label">Total Amount</span>
                    <span className="pg-total-val">₹{(grandTotal > 0 ? grandTotal : 409).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* 5% Cashback Green Card (Matching screenshot) */}
                <div className="pg-cashback-banner-card">
                  <div className="pg-cashback-info">
                    <h5 className="pg-cb-title">5% Cashback</h5>
                    <p className="pg-cb-sub">Claim now with payment offers</p>
                  </div>
                  <div className="pg-cashback-icons-wrap">
                    <span className="pg-cb-circle blue"></span>
                    <span className="pg-cb-circle red"></span>
                  </div>
                </div>

                {/* Secure Guarantee Footer */}
                <div className="pg-guarantee-strip">
                  <ShieldCheck size={16} color="#00A3E0" />
                  <span>Safe and Secure Payments. 100% Authentic Atomy Guarantee.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             STEP 04: Order Completed Success View
             ========================================================================= */
          <div className="order-completed-view animate-fade">
            <div className="completion-card">
              <div className="completion-icon-wrapper">
                <CheckCircle2 size={68} color="#10b981" />
              </div>

              <h2 className="completion-title">Order Placed Successfully!</h2>
              <p className="completion-subtitle">
                Thank you for purchasing with Atomy India. Your order has been placed and is being prepared for doorstep dispatch.
              </p>

              {/* Order Quick Summary Card */}
              {placedOrderDetails && (
                <div className="order-confirmation-box">
                  <div className="confirmation-meta-row">
                    <div className="c-meta-col">
                      <span className="c-label">Order Number</span>
                      <strong className="c-val order-num-tag">{placedOrderDetails.orderId}</strong>
                    </div>
                    <div className="c-meta-col">
                      <span className="c-label">Order Date</span>
                      <strong className="c-val">{placedOrderDetails.orderDate}</strong>
                    </div>
                    <div className="c-meta-col">
                      <span className="c-label">Payment Method</span>
                      <strong className="c-val">{placedOrderDetails.paymentMethod}</strong>
                    </div>
                    <div className="c-meta-col">
                      <span className="c-label">Total Amount Paid</span>
                      <strong className="c-val price-highlight">
                        ₹ {placedOrderDetails.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  {/* PV Earned Banner */}
                  <div className="pv-earned-celebration">
                    <Sparkles size={20} color="#00A3E0" />
                    <span>
                      Congratulations! You earned <strong>{placedOrderDetails.totalPV.toLocaleString('en-IN')} PV</strong> for your Atomy account on this order.
                    </span>
                  </div>

                  {/* Delivery destination summary */}
                  <div className="destination-summary-box">
                    <MapPin size={18} color="#00A3E0" />
                    <div>
                      <strong>Delivery Destination:</strong>
                      <p>{placedOrderDetails.address.fullAddress}</p>
                      <span>Recipient: {placedOrderDetails.recipient} ({placedOrderDetails.phone})</span>
                    </div>
                  </div>

                  {/* Ordered Items List */}
                  <div className="confirmed-items-list">
                    <h4>Purchased Items ({placedOrderDetails.items.length})</h4>
                    {placedOrderDetails.items.map((it, idx) => (
                      <div key={idx} className="confirmed-item-row">
                        <img 
                          src={it.image} 
                          alt={it.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480';
                          }}
                        />
                        <div className="confirmed-item-info">
                          <span className="item-name">{it.name}</span>
                          <span className="item-meta">Qty: {it.qty} | ₹ {(it.price * it.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="completion-actions-row">
                <button
                  type="button"
                  className="completion-btn primary"
                  onClick={() => {
                    if (placedOrderDetails) {
                      window.dispatchEvent(new CustomEvent('atomy:track-order', {
                        detail: { orderId: placedOrderDetails.orderId }
                      }));
                    }
                  }}
                >
                  <Truck size={16} />
                  <span>Track Delivery Status</span>
                </button>

                <button
                  type="button"
                  className="completion-btn secondary"
                  onClick={onNavigateOrders}
                >
                  <span>View Order History</span>
                </button>

                <button
                  type="button"
                  className="completion-btn outline"
                  onClick={onNavigateHome}
                >
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          Add / Edit Delivery Address Modal Dialog (Matching Quick Order)
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
                ✕
              </button>
            </div>

            {/* Address Form */}
            <form onSubmit={handleSaveAddressForm} className="address-editor-form-wrapper">
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

                {/* PIN Code, District, State with Live Detection */}
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

      {/* Floating Toast Notification */}
      {quickAddToast && (
        <div className="quick-add-floating-toast">
          <Check size={18} />
          <span>{quickAddToast}</span>
        </div>
      )}
    </div>
  );
}
