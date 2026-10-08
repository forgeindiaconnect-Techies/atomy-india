import React, { useState } from 'react';
import {
  User,
  Settings,
  ShoppingBag,
  Heart,
  Star,
  Ticket,
  Bell,
  Gift,
  MapPin,
  Edit3,
  Lock,
  Check,
  Plus,
  Trash2,
  ArrowLeft,
  ChevronRight,
  LogOut,
  Package,
  Calendar,
  Phone,
  Mail,
  Shield,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
  ShieldCheck
} from 'lucide-react';
import './CustomerProfilePage.css';

export default function CustomerProfilePage({
  currentUser,
  onUpdateUser,
  onLogout,
  onNavigateHome,
  onNavigateBack,
  placedOrders = [],
  favorites = [],
  onAddToCart,
  onToggleFavorite,
  onProductClick,
  onNavigateCart
}) {
  const [activeTab, setActiveTab] = useState('profile'); // profile, orders, wishlist, reviews, coupons, notifications, giftcards, addresses
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  
  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || 'Customer',
    email: currentUser?.email || 'customer@atomy.in',
    phone: currentUser?.phone || '+91 98765 43210',
    gender: currentUser?.gender || 'Prefer not to say',
    dob: currentUser?.dob || '1995-08-15'
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');

  // Saved Addresses state
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      type: 'Home',
      isDefault: true,
      fullName: currentUser?.name || 'Customer',
      phone: '+91 98765 43210',
      street: 'Flat 402, Phoenix Heights, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001'
    },
    {
      id: 'addr-2',
      type: 'Office',
      isDefault: false,
      fullName: currentUser?.name || 'Customer',
      phone: '+91 98765 43210',
      street: 'Tower B, Tech Park, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103'
    }
  ]);

  const [newAddressForm, setNewAddressForm] = useState({
    type: 'Home',
    fullName: currentUser?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Coupons state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [coupons, setCoupons] = useState([
    {
      id: 'cpn-1',
      code: 'WELCOME10',
      discount: '10% OFF',
      title: 'New Customer Welcome Voucher',
      description: 'Applicable on your first order with minimum cart value of ₹1,500',
      validTill: '31 Dec 2026',
      status: 'Active'
    },
    {
      id: 'cpn-2',
      code: 'ATOMYFREESHIP',
      discount: 'FREE DELIVERY',
      title: 'Free Shipping Across India',
      description: 'Enjoy zero delivery fees on all health and skincare products',
      validTill: '15 Nov 2026',
      status: 'Active'
    },
    {
      id: 'cpn-3',
      code: 'FESTIVE500',
      discount: '₹500 OFF',
      title: 'Festive Season Gift Coupon',
      description: 'Get instant flat ₹500 discount on Absolute Skincare and HemoHIM',
      validTill: '20 Oct 2026',
      status: 'Active'
    }
  ]);

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Special Customer Welcome!',
      message: 'Thank you for joining Atomy India. Explore Absolute Quality at Absolute Price.',
      time: '10 minutes ago',
      unread: true,
      type: 'welcome'
    },
    {
      id: 'notif-2',
      title: 'New Launch: Adelica Soft Brow Pencil',
      message: 'Premium Adelica Soft Brow Pencil Gray is now available with 4,000 PV.',
      time: '2 hours ago',
      unread: true,
      type: 'promo'
    },
    {
      id: 'notif-3',
      title: 'Free Delivery Milestone',
      message: 'You have unlocked free shipping on orders above ₹3,000 across India.',
      time: '1 day ago',
      unread: false,
      type: 'order'
    }
  ]);

  // Gift Cards state
  const [giftCardBalance, setGiftCardBalance] = useState(1500);
  const [redeemCardCode, setRedeemCardCode] = useState('');
  const [redeemMessage, setRedeemMessage] = useState('');

  // Customer Reviews state
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      productName: 'Atomy HemoHIM (60 Packets)',
      rating: 5,
      date: '02 Oct 2026',
      reviewTitle: 'Exceptional immunity booster, worth every rupee!',
      comment: 'I have been taking HemoHIM for 3 weeks and my daily energy levels have noticeably improved. Clean herbal taste and great quality packaging.',
      verified: true
    },
    {
      id: 'rev-2',
      productName: 'Atomy Absolute Skincare Set (6 Pieces)',
      rating: 5,
      date: '28 Sep 2026',
      reviewTitle: 'My skin texture feels supple and radiant',
      comment: 'Top Korean skincare science. The ampoule and eye cream are truly luxury grade. Highly recommended for daily skincare routine.',
      verified: true
    }
  ]);

  const [newReviewForm, setNewReviewForm] = useState({
    productName: 'Atomy Toothpaste (200g)',
    rating: 5,
    title: '',
    comment: ''
  });
  const [isWritingReview, setIsWritingReview] = useState(false);

  // Initial letter
  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  // Handle Profile Update
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        ...currentUser,
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        gender: profileForm.gender,
        dob: profileForm.dob
      });
    }
    setIsEditingProfile(false);
    setProfileSuccessMessage('Profile details updated successfully!');
    setTimeout(() => setProfileSuccessMessage(''), 3000);
  };

  // Handle Password Update
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('New passwords do not match. Please re-enter.');
      return;
    }
    setPasswordMessage('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordMessage(''), 3000);
  };

  // Handle Address Add
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddressForm.street || !newAddressForm.city || !newAddressForm.pincode) return;
    const newAddr = {
      id: `addr-${Date.now()}`,
      ...newAddressForm,
      isDefault: addresses.length === 0
    };
    setAddresses([...addresses, newAddr]);
    setIsAddingAddress(false);
    setNewAddressForm({
      type: 'Home',
      fullName: currentUser?.name || '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: ''
    });
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  // Handle Coupon Apply
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;
    const found = coupons.find(c => c.code === code);
    if (found) {
      setCouponMessage(`Coupon "${code}" is active! ${found.discount} applied.`);
    } else {
      setCouponMessage(`Invalid coupon code "${code}". Please check available coupons.`);
    }
    setTimeout(() => setCouponMessage(''), 4000);
  };

  // Handle Gift Card Redeem
  const handleRedeemGiftCard = (e) => {
    e.preventDefault();
    if (!redeemCardCode.trim()) return;
    setGiftCardBalance(prev => prev + 500);
    setRedeemMessage('Gift Card redeemed successfully! ₹500 added to your balance.');
    setRedeemCardCode('');
    setTimeout(() => setRedeemMessage(''), 4000);
  };

  // Handle New Review Submit
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewForm.title || !newReviewForm.comment) return;
    const rev = {
      id: `rev-${Date.now()}`,
      productName: newReviewForm.productName,
      rating: Number(newReviewForm.rating),
      date: 'Today',
      reviewTitle: newReviewForm.title,
      comment: newReviewForm.comment,
      verified: true
    };
    setReviews([rev, ...reviews]);
    setIsWritingReview(false);
    setNewReviewForm({ productName: 'Atomy Toothpaste (200g)', rating: 5, title: '', comment: '' });
  };

  // Mark all notifications read
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="customer-profile-page-wrapper">
      {/* Top Breadcrumb & Return Bar */}
      <div className="profile-page-top-bar">
        <div className="container profile-top-bar-container">
          <button
            type="button"
            className="profile-back-mall-btn"
            onClick={onNavigateBack || onNavigateHome}
          >
            <ArrowLeft size={16} />
            <span>Back to Shopping Mall</span>
          </button>
          <div className="profile-breadcrumb">
            <span onClick={onNavigateHome} style={{ cursor: 'pointer' }}>Home</span>
            <ChevronRight size={13} />
            <span>My Account</span>
            <ChevronRight size={13} />
            <span className="current-crumb">
              {activeTab === 'profile' && 'Profile Settings'}
              {activeTab === 'orders' && 'Your Orders'}
              {activeTab === 'wishlist' && 'Wishlist'}
              {activeTab === 'reviews' && 'My Reviews'}
              {activeTab === 'coupons' && 'Coupons & Vouchers'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'giftcards' && 'Gift Cards'}
              {activeTab === 'addresses' && 'Saved Addresses'}
              {activeTab === 'terms' && 'Terms & Conditions'}
            </span>
          </div>
        </div>
      </div>

      <div className="container profile-main-container">
        {/* Left Sidebar Navigation */}
        <aside className="profile-sidebar">
          {/* User Profile Card Header */}
          <div className="profile-user-badge-card">
            <div className="profile-badge-avatar">
              {userInitial}
            </div>
            <div className="profile-badge-info">
              <h3 className="profile-badge-name">{currentUser?.name || 'Valued Customer'}</h3>
              <span className="profile-badge-email">{currentUser?.email || currentUser?.username || 'customer@atomy.in'}</span>
              <span className="profile-verified-tag">
                <Shield size={11} /> Verified Customer
              </span>
            </div>
          </div>

          {/* PV & Balance Quick Stats */}
          <div className="profile-pv-stats-card">
            <div className="pv-stat-item">
              <span className="pv-stat-label">Personal PV</span>
              <span className="pv-stat-value">12,500 PV</span>
            </div>
            <div className="pv-stat-divider"></div>
            <div className="pv-stat-item">
              <span className="pv-stat-label">Wallet Balance</span>
              <span className="pv-stat-value">₹ {giftCardBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="profile-nav-menu">
            <button
              type="button"
              className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>Profile Settings</span>
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} />
              <span>Your Orders</span>
              {placedOrders.length > 0 && (
                <span className="nav-item-count">{placedOrders.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <Heart size={18} />
              <span>Wishlist / Favorites</span>
              {favorites.length > 0 && (
                <span className="nav-item-count">{favorites.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={18} />
              <span>My Reviews</span>
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === 'coupons' ? 'active' : ''}`}
              onClick={() => setActiveTab('coupons')}
            >
              <Ticket size={18} />
              <span>Coupons & Offers</span>
              <span className="nav-item-pill">3 Active</span>
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} />
              <span>All Notifications</span>
              {notifications.some(n => n.unread) && (
                <span className="nav-unread-dot"></span>
              )}
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === 'giftcards' ? 'active' : ''}`}
              onClick={() => setActiveTab('giftcards')}
            >
              <Gift size={18} />
              <span>Gift Cards & Balance</span>
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={18} />
              <span>Saved Addresses</span>
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              <FileText size={18} />
              <span>Terms & Conditions</span>
            </button>

            <div className="profile-nav-divider"></div>

            <button
              type="button"
              className="profile-nav-item logout-nav-item"
              onClick={onLogout}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Right Tab Content Panel */}
        <main className="profile-content-area">
          {profileSuccessMessage && (
            <div className="profile-alert success">
              <Check size={16} />
              <span>{profileSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: PROFILE SETTINGS / MANAGE PROFILE */}
          {activeTab === 'profile' && (
            <div className="profile-tab-section animate-fade-in">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Profile Settings & Account</h2>
                  <p className="profile-section-sub">Manage your personal information, contact details, and security.</p>
                </div>
                {!isEditingProfile && (
                  <button
                    type="button"
                    className="profile-action-primary-btn"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit3 size={15} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* View Mode or Edit Mode */}
              {!isEditingProfile ? (
                <div className="profile-details-grid">
                  <div className="profile-detail-card">
                    <span className="detail-card-label">Full Name</span>
                    <span className="detail-card-value">{currentUser?.name || 'Customer'}</span>
                  </div>
                  <div className="profile-detail-card">
                    <span className="detail-card-label">Email Address</span>
                    <span className="detail-card-value">{currentUser?.email || 'customer@atomy.in'}</span>
                  </div>
                  <div className="profile-detail-card">
                    <span className="detail-card-label">Mobile Number</span>
                    <span className="detail-card-value">{profileForm.phone}</span>
                  </div>
                  <div className="profile-detail-card">
                    <span className="detail-card-label">Customer ID / Username</span>
                    <span className="detail-card-value">{currentUser?.username || 'ATOMY-IN-CUSTOMER'}</span>
                  </div>
                  <div className="profile-detail-card">
                    <span className="detail-card-label">Gender</span>
                    <span className="detail-card-value">{profileForm.gender}</span>
                  </div>
                  <div className="profile-detail-card">
                    <span className="detail-card-label">Date of Birth</span>
                    <span className="detail-card-value">{profileForm.dob}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="profile-edit-form">
                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="field-label">Full Name</label>
                      <input
                        type="text"
                        className="profile-field-input"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="field-label">Email Address</label>
                      <input
                        type="email"
                        className="profile-field-input"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="field-label">Mobile Number</label>
                      <input
                        type="tel"
                        className="profile-field-input"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="field-label">Gender</label>
                      <select
                        className="profile-field-input"
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      >
                        <option value="Prefer not to say">Prefer not to say</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-field-group">
                      <label className="field-label">Date of Birth</label>
                      <input
                        type="date"
                        className="profile-field-input"
                        value={profileForm.dob}
                        onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="profile-form-btn-row">
                    <button type="submit" className="profile-save-btn">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="profile-cancel-btn"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Password & Security Card */}
              <div className="profile-security-card">
                <div className="security-card-header">
                  <div className="security-icon-circle">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="security-title">Change Account Password</h3>
                    <p className="security-sub">Ensure your customer shopping account is guarded with a strong password.</p>
                  </div>
                </div>

                {passwordMessage && (
                  <div className="profile-alert info">
                    <AlertCircle size={15} />
                    <span>{passwordMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="security-form-row">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="profile-field-input"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="profile-field-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="profile-field-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                  <button type="submit" className="security-update-btn">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: YOUR ORDERS */}
          {activeTab === 'orders' && (
            <div className="profile-tab-section animate-fade-in">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Your Orders & Deliveries</h2>
                  <p className="profile-section-sub">Track real-time shipment status, view invoice summary, and reorder.</p>
                </div>
              </div>

              {placedOrders.length === 0 ? (
                <div className="profile-empty-state">
                  <Package size={48} strokeWidth={1.5} className="empty-state-icon" />
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders yet. Start shopping authentic Atomy products now!</p>
                  <button
                    type="button"
                    className="profile-action-primary-btn"
                    onClick={onNavigateHome}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="orders-list-wrapper">
                  {placedOrders.map((order, idx) => (
                    <div key={order.orderId || idx} className="order-history-card">
                      <div className="order-card-top">
                        <div className="order-meta-group">
                          <span className="order-number">Order #{order.orderId || `ATO-${1000 + idx}`}</span>
                          <span className="order-date">{order.date || '06 Oct 2026'}</span>
                        </div>
                        <div className="order-status-badge delivered">
                          <Check size={13} />
                          <span>Delivered / Confirmed</span>
                        </div>
                      </div>

                      <div className="order-items-preview">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="order-preview-item">
                            <img src={item.image} alt={item.name} className="order-item-thumb" />
                            <div className="order-item-desc">
                              <span className="order-item-name">{item.name}</span>
                              <span className="order-item-qty">Qty: {item.qty} × ₹ {(item.price || 0).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-bottom">
                        <div className="order-total-group">
                          <span className="total-label">Order Total:</span>
                          <span className="total-val">₹ {(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          <span className="total-pv">PV: {(order.totalPv || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="order-actions-group">
                          <button
                            type="button"
                            className="reorder-btn"
                            onClick={() => {
                              (order.items || []).forEach(it => onAddToCart && onAddToCart(it, it.qty));
                              onNavigateCart && onNavigateCart();
                            }}
                          >
                            Reorder Items
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST / FAVORITES */}
          {activeTab === 'wishlist' && (
            <div className="profile-tab-section animate-fade-in">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Wishlist & Saved Products</h2>
                  <p className="profile-section-sub">Products you have saved for later purchase ({favorites.length} items).</p>
                </div>
              </div>

              {favorites.length === 0 ? (
                <div className="profile-empty-state">
                  <Heart size={48} strokeWidth={1.5} className="empty-state-icon" />
                  <h3>Your Wishlist is Empty</h3>
                  <p>Explore our Korean health and skincare catalog and tap the heart icon to save products here.</p>
                  <button
                    type="button"
                    className="profile-action-primary-btn"
                    onClick={onNavigateHome}
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {favorites.map((product) => (
                    <div key={product.id} className="wishlist-product-card">
                      <div className="wishlist-card-img" onClick={() => onProductClick && onProductClick(product)}>
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div className="wishlist-card-info">
                        <span className="wishlist-card-code">{product.id}</span>
                        <h4 className="wishlist-card-title" onClick={() => onProductClick && onProductClick(product)}>
                          {product.name}
                        </h4>
                        <div className="wishlist-card-pricing">
                          <span className="wishlist-price">₹ {(product.price || 0).toLocaleString('en-IN')}</span>
                          {product.pv && <span className="wishlist-pv">PV {product.pv.toLocaleString('en-IN')}</span>}
                        </div>
                        <div className="wishlist-card-btns">
                          <button
                            type="button"
                            className="wishlist-add-cart-btn"
                            onClick={() => onAddToCart && onAddToCart(product, 1)}
                          >
                            Add to Cart
                          </button>
                          <button
                            type="button"
                            className="wishlist-remove-btn"
                            title="Remove from Wishlist"
                            onClick={() => onToggleFavorite && onToggleFavorite(product)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="profile-tab-section animate-fade-in">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">My Product Reviews & Ratings</h2>
                  <p className="profile-section-sub">Your authentic feedback on purchased Atomy products.</p>
                </div>
                {!isWritingReview && (
                  <button
                    type="button"
                    className="profile-action-primary-btn"
                    onClick={() => setIsWritingReview(true)}
                  >
                    <Plus size={15} />
                    <span>Write a Review</span>
                  </button>
                )}
              </div>

              {isWritingReview && (
                <form onSubmit={handleAddReview} className="write-review-card">
                  <h3 className="write-review-title">Share Your Experience</h3>
                  <div className="form-field-group">
                    <label className="field-label">Select Product</label>
                    <select
                      className="profile-field-input"
                      value={newReviewForm.productName}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, productName: e.target.value })}
                    >
                      <option value="Atomy Toothpaste (200g)">Atomy Toothpaste (200g)</option>
                      <option value="Atomy HemoHIM (60 Packets)">Atomy HemoHIM (60 Packets)</option>
                      <option value="Atomy Absolute Skincare Set">Atomy Absolute Skincare Set</option>
                      <option value="Atomy Deep Cleanser">Atomy Deep Cleanser</option>
                      <option value="Adelica Soft Brow Pencil - Gray">Adelica Soft Brow Pencil - Gray</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="field-label">Rating (Stars)</label>
                    <select
                      className="profile-field-input"
                      value={newReviewForm.rating}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, rating: e.target.value })}
                    >
                      <option value="5">★★★★★ (5 Stars - Excellent)</option>
                      <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                      <option value="3">★★★☆☆ (3 Stars - Average)</option>
                      <option value="2">★★☆☆☆ (2 Stars - Below Average)</option>
                      <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="field-label">Review Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Best toothpaste for sensitive teeth!"
                      className="profile-field-input"
                      value={newReviewForm.title}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="field-label">Review Details</label>
                    <textarea
                      rows={3}
                      placeholder="Tell other shoppers why you like this product and how you use it..."
                      className="profile-field-input"
                      value={newReviewForm.comment}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                      required
                    />
                  </div>

                  <div className="profile-form-btn-row">
                    <button type="submit" className="profile-save-btn">Submit Review</button>
                    <button type="button" className="profile-cancel-btn" onClick={() => setIsWritingReview(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="reviews-list-wrapper">
                {reviews.map((rev) => (
                  <div key={rev.id} className="customer-review-card">
                    <div className="review-card-top">
                      <div>
                        <h4 className="review-product-name">{rev.productName}</h4>
                        <div className="review-stars-row">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rev.rating ? "#f59e0b" : "none"}
                              stroke={i < rev.rating ? "#f59e0b" : "#cbd5e1"}
                            />
                          ))}
                          <span className="review-date">{rev.date}</span>
                        </div>
                      </div>
                      {rev.verified && (
                        <span className="verified-buyer-pill">
                          <Check size={12} /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <h5 className="review-card-headline">"{rev.reviewTitle}"</h5>
                    <p className="review-card-text">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COUPONS & OFFERS */}
          {activeTab === 'coupons' && (
            <div className="profile-tab-section animate-fade-in">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Coupons & Promo Vouchers</h2>
                  <p className="profile-section-sub">Redeem promo codes and view active discount vouchers for checkout.</p>
                </div>
              </div>

              {/* Enter Promo Code Card */}
              <div className="coupon-redeem-card">
                <h3 className="coupon-redeem-title">Have a Promotional Code?</h3>
                <form onSubmit={handleApplyCoupon} className="coupon-input-row">
                  <input
                    type="text"
                    placeholder="Enter Coupon / Promo Code (e.g. WELCOME10)"
                    className="profile-field-input"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                  />
                  <button type="submit" className="coupon-apply-btn">
                    Apply Code
                  </button>
                </form>
                {couponMessage && (
                  <div className="coupon-alert-msg">{couponMessage}</div>
                )}
              </div>

              {/* Coupons List */}
              <div className="coupons-grid">
                {coupons.map((c) => (
                  <div key={c.id} className="coupon-voucher-card">
                    <div className="coupon-card-left">
                      <span className="coupon-badge-discount">{c.discount}</span>
                      <span className="coupon-badge-code">{c.code}</span>
                    </div>
                    <div className="coupon-card-right">
                      <h4 className="coupon-title">{c.title}</h4>
                      <p className="coupon-desc">{c.description}</p>
                      <div className="coupon-expiry">
                        <Clock size={13} />
                        <span>Valid till {c.validTill}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ALL NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="profile-tab-section animate-fade-in">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">All Notifications & Alerts</h2>
                  <p className="profile-section-sub">Stay informed on orders, exclusive member perks, and platform announcements.</p>
                </div>
                {notifications.some(n => n.unread) && (
                  <button
                    type="button"
                    className="profile-action-secondary-btn"
                    onClick={handleMarkAllRead}
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div className="notifications-list-wrapper">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`notification-item-card ${notif.unread ? 'unread' : ''}`}>
                    <div className="notification-icon-wrap">
                      <Bell size={18} />
                    </div>
                    <div className="notification-content-wrap">
                      <div className="notification-header-row">
                        <h4 className="notification-title">{notif.title}</h4>
                        <span className="notification-timestamp">{notif.time}</span>
                      </div>
                      <p className="notification-msg">{notif.message}</p>
                    </div>
                    {notif.unread && <span className="notification-unread-dot"></span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: GIFT CARDS */}
          {activeTab === 'giftcards' && (
            <div className="profile-tab-section animate-fade-in">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Gift Cards & Store Balance</h2>
                  <p className="profile-section-sub">Redeem Atomy India E-Gift cards or use store credit towards purchases.</p>
                </div>
              </div>

              {/* Balance Showcase Card */}
              <div className="giftcard-balance-card">
                <div className="giftcard-card-content">
                  <span className="balance-label">Total Usable Store Credit</span>
                  <h3 className="balance-amount">₹ {giftCardBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                  <span className="balance-note">Can be applied instantly at checkout on any order</span>
                </div>
                <div className="giftcard-card-icon">
                  <Gift size={44} />
                </div>
              </div>

              {/* Redeem Gift Card Form */}
              <div className="redeem-card-box">
                <h4 className="redeem-title">Redeem an E-Gift Card</h4>
                <p className="redeem-sub">Enter your 16-digit gift card code or PIN below to add credit to your account:</p>
                
                {redeemMessage && (
                  <div className="profile-alert success">
                    <Check size={16} />
                    <span>{redeemMessage}</span>
                  </div>
                )}

                <form onSubmit={handleRedeemGiftCard} className="redeem-input-row">
                  <input
                    type="text"
                    placeholder="e.g. ATOMY-GIFT-5000-XXXX"
                    className="profile-field-input"
                    value={redeemCardCode}
                    onChange={(e) => setRedeemCardCode(e.target.value)}
                    required
                  />
                  <button type="submit" className="redeem-submit-btn">
                    Add to Balance
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="profile-tab-section animate-fade-in">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Saved Shipping Addresses</h2>
                  <p className="profile-section-sub">Manage your delivery addresses for seamless direct shipping.</p>
                </div>
                {!isAddingAddress && (
                  <button
                    type="button"
                    className="profile-action-primary-btn"
                    onClick={() => setIsAddingAddress(true)}
                  >
                    <Plus size={15} />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {isAddingAddress && (
                <form onSubmit={handleAddAddress} className="add-address-form-card">
                  <h3 className="add-address-title">Add Delivery Address</h3>
                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="field-label">Address Tag / Type</label>
                      <select
                        className="profile-field-input"
                        value={newAddressForm.type}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, type: e.target.value })}
                      >
                        <option value="Home">Home (7 AM - 9 PM delivery)</option>
                        <option value="Office">Office (10 AM - 6 PM delivery)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Recipient Full Name</label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="profile-field-input"
                        value={newAddressForm.fullName}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Mobile Contact Number</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        className="profile-field-input"
                        value={newAddressForm.phone}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">PIN Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 560001"
                        className="profile-field-input"
                        value={newAddressForm.pincode}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field-group full-width">
                      <label className="field-label">Street Address & Landmark</label>
                      <input
                        type="text"
                        placeholder="House / Flat No., Building, Street Area"
                        className="profile-field-input"
                        value={newAddressForm.street}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">City / District</label>
                      <input
                        type="text"
                        placeholder="City"
                        className="profile-field-input"
                        value={newAddressForm.city}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        className="profile-field-input"
                        value={newAddressForm.state}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-form-btn-row">
                    <button type="submit" className="profile-save-btn">Save Address</button>
                    <button type="button" className="profile-cancel-btn" onClick={() => setIsAddingAddress(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="addresses-grid">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                    <div className="address-card-header">
                      <span className="address-type-tag">{addr.type}</span>
                      {addr.isDefault && (
                        <span className="default-address-pill">Default Delivery Address</span>
                      )}
                    </div>
                    <h4 className="address-recipient">{addr.fullName}</h4>
                    <p className="address-line">{addr.street}</p>
                    <p className="address-line">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="address-phone"><Phone size={12} /> {addr.phone}</p>
                    <div className="address-card-actions">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          className="address-action-btn"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        type="button"
                        className="address-action-btn delete"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="profile-tab-section animate-fade-in terms-tab-section">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Terms & Conditions</h2>
                  <p className="profile-section-subtitle">
                    Official Customer Agreement, Product Policies & Consumer Protection Guidelines • Atomy India
                  </p>
                </div>
                <div className="terms-compliance-pill">
                  <ShieldCheck size={14} />
                  <span>Consumer Protection Compliant</span>
                </div>
              </div>

              {/* Quick Legal Overview Notice */}
              <div className="terms-intro-box">
                <div className="terms-intro-header">
                  <Shield size={20} className="terms-shield-icon" />
                  <div>
                    <h4>Atomy Enterprise India Pvt. Ltd. Customer Agreement</h4>
                    <p>Last updated: October 2026 • Valid across all states & Union Territories of India</p>
                  </div>
                </div>
                <p className="terms-intro-text">
                  Welcome to the official shopping mall and customer portal of Atomy India. By accessing our services, creating a customer account, browsing products, or placing an order, you agree to adhere to the following Terms and Conditions, established under the Consumer Protection (Direct Selling) Rules, 2021 and Information Technology Act, 2000.
                </p>
              </div>

              {/* Comprehensive Terms Sections */}
              <div className="terms-sections-list">
                {/* 1. Account & Membership */}
                <div className="terms-policy-card">
                  <div className="terms-policy-number">01</div>
                  <div className="terms-policy-body">
                    <h3 className="terms-policy-title">Customer Membership & Account Security</h3>
                    <p>
                      Customer registration on Atomy India is completely free with zero renewal fees. Customers must be 18 years of age or older and possess a valid Indian mobile number and email ID.
                    </p>
                    <ul className="terms-policy-bullets">
                      <li>You are solely responsible for maintaining the confidentiality of your login credentials and personal password.</li>
                      <li>Any order placed through an authenticated account will be deemed authorized by the registered customer.</li>
                      <li>In accordance with statutory Indian directives, PAN and KYC verification may be requested for high-value orders or compensation eligibility.</li>
                    </ul>
                  </div>
                </div>

                {/* 2. Absolute Quality, Absolute Price & PV */}
                <div className="terms-policy-card">
                  <div className="terms-policy-number">02</div>
                  <div className="terms-policy-body">
                    <h3 className="terms-policy-title">Pricing, Taxes & Point Value (PV) System</h3>
                    <p>
                      Atomy operates on the founding philosophy of <strong>Absolute Quality, Absolute Price</strong>, ensuring world-class masstige products at the lowest possible consumer prices.
                    </p>
                    <ul className="terms-policy-bullets">
                      <li>All displayed product prices are in Indian Rupees (₹) and are inclusive of all applicable Goods and Services Tax (GST).</li>
                      <li>Point Value (PV) points are automatically calculated and attributed to your registered member ID upon confirmed payment.</li>
                      <li>Personal PV accumulated from purchases never expires and remains permanently valid with your active customer account.</li>
                    </ul>
                  </div>
                </div>

                {/* 3. Ordering & Payment */}
                <div className="terms-policy-card">
                  <div className="terms-policy-number">03</div>
                  <div className="terms-policy-body">
                    <h3 className="terms-policy-title">Ordering, Checkout & Payment Protection</h3>
                    <p>
                      While product catalog browsing and price checking are open to all visitors, ordering and wishlist features strictly require a registered and authenticated account.
                    </p>
                    <ul className="terms-policy-bullets">
                      <li>We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Major Credit & Debit Cards, and Atomy Gift Cards/Vouchers.</li>
                      <li>Payment gateways utilize 256-bit bank-grade SSL encryption adhering to PCI-DSS Level 1 compliance standards.</li>
                      <li>An instantaneous order confirmation with invoice and tracking reference is dispatched via SMS and registered email upon successful transaction.</li>
                    </ul>
                  </div>
                </div>

                {/* 4. Shipping & Delivery */}
                <div className="terms-policy-card">
                  <div className="terms-policy-number">04</div>
                  <div className="terms-policy-body">
                    <h3 className="terms-policy-title">Shipping, Logistics & Delivery Timelines</h3>
                    <p>
                      Atomy delivers nationwide across India through tier-1 logistics partners including Blue Dart, Delhivery, DTDC, and India Post.
                    </p>
                    <ul className="terms-policy-bullets">
                      <li>Standard delivery occurs within 3 to 7 business days from dispatch date depending on local regional accessibility.</li>
                      <li>Free delivery is automatically applied to all orders with total cart values exceeding ₹3,000.</li>
                      <li>Customers can track live consignment milestones directly through our Customer Portal tracking system.</li>
                    </ul>
                  </div>
                </div>

                {/* 5. 30-Day Return & 100% Refund */}
                <div className="terms-policy-card highlight-policy">
                  <div className="terms-policy-number">05</div>
                  <div className="terms-policy-body">
                    <h3 className="terms-policy-title">30-Day 100% Money-Back Guarantee & Returns</h3>
                    <p>
                      We stand behind the absolute quality of every genuine product. If you are not completely satisfied with your purchase, you are protected by our consumer refund guarantee.
                    </p>
                    <ul className="terms-policy-bullets">
                      <li>Unopened and undamaged items in original manufacturer packaging can be returned within 30 days of delivery.</li>
                      <li>In the rare event of transit damage or manufacturing defect, notify support within 48 hours for immediate doorstep replacement.</li>
                      <li>Approved refunds are credited directly to the customer's original payment method or wallet within 5-7 banking days.</li>
                    </ul>
                  </div>
                </div>

                {/* 6. Privacy & Data Protection */}
                <div className="terms-policy-card">
                  <div className="terms-policy-number">06</div>
                  <div className="terms-policy-body">
                    <h3 className="terms-policy-title">Privacy Policy & Personal Data Protection</h3>
                    <p>
                      Your privacy is paramount. Atomy India complies strictly with the Digital Personal Data Protection (DPDP) Act, 2023.
                    </p>
                    <ul className="terms-policy-bullets">
                      <li>Personal credentials, shipping addresses, and transaction histories are stored in encrypted, certified cloud repositories.</li>
                      <li>We strictly do NOT sell, rent, or lease customer contact details or purchase histories to any third-party marketing entities.</li>
                      <li>You may update, review, or request removal of your saved addresses and personal details at any time through this Profile Settings dashboard.</li>
                    </ul>
                  </div>
                </div>

                {/* 7. Grievance & Official Contacts */}
                <div className="terms-policy-card">
                  <div className="terms-policy-number">07</div>
                  <div className="terms-policy-body">
                    <h3 className="terms-policy-title">Grievance Redressal & Customer Care</h3>
                    <p>
                      For any questions, order inquiries, returns assistance, or grievance escalations, please contact our dedicated support team:
                    </p>
                    <div className="terms-contact-grid">
                      <div className="terms-contact-item">
                        <Phone size={15} />
                        <div>
                          <strong>Toll-Free Customer Care</strong>
                          <span>1800-123-ATOMY (1800-123-2866)</span>
                        </div>
                      </div>
                      <div className="terms-contact-item">
                        <Mail size={15} />
                        <div>
                          <strong>Customer Care Email</strong>
                          <span>support@atomy.in</span>
                        </div>
                      </div>
                      <div className="terms-contact-item">
                        <Shield size={15} />
                        <div>
                          <strong>Grievance Officer</strong>
                          <span>grievance@atomy.in</span>
                        </div>
                      </div>
                      <div className="terms-contact-item">
                        <Clock size={15} />
                        <div>
                          <strong>Operating Hours</strong>
                          <span>Mon – Fri: 9:30 AM to 6:00 PM IST</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
