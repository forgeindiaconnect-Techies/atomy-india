import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Plus, 
  Minus, 
  Package, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Tag, 
  Edit2, 
  Trash2,
  Layers,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';
import { 
  fetchDistributorInventory, 
  updateDistributorStock,
  fetchAvailableProducts,
  addProductToInventory,
  removeProductFromInventory
} from '../../services/distributorService';
import '../Admin/AdminDashboard.css';

export default function DistributorInventoryPage({ 
  distributor,
  refreshKey,
  onOpenEditProduct
}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');
  const [adjustingId, setAdjustingId] = useState(null);

  // Add Products from Master Catalog Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [addQtyMap, setAddQtyMap] = useState({});
  const [addingId, setAddingId] = useState(null);

  // Quick Edit Stock Modal State
  const [editingStockProduct, setEditingStockProduct] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [editThreshold, setEditThreshold] = useState(10);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Remove from Hub Modal State
  const [productToRemove, setProductToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const distId = distributor?.distributorId || distributor?.id || '';
  const hubPincode = distributor?.primaryPincode || '';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  };

  const loadProducts = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchDistributorInventory(distId);
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products for distributor inventory:', err);
      showToast('Error syncing live regional inventory');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [distId, refreshKey]);

  // Real-time synchronization when products are edited in admin or sub-admin
  useEffect(() => {
    let prodChannel = null;
    let syncChannel = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const handleMsg = (event) => {
          if (event.data?.type === 'PRODUCT_UPDATED' && event.data.product) {
            const upd = event.data.product;
            setProducts(prev => prev.map(p => {
              if (p.id === upd.id || p.productId === upd.id) {
                return {
                  ...p,
                  ...upd,
                  price: upd.price ?? p.price,
                  originalPrice: upd.originalPrice ?? p.originalPrice,
                  stockQuantity: upd.stockQuantity ?? p.stockQuantity,
                  lowStockThreshold: upd.lowStockThreshold ?? p.lowStockThreshold,
                  name: upd.name || p.name
                };
              }
              return p;
            }));
          }
        };
        prodChannel = new BroadcastChannel('atomy_product_channel');
        prodChannel.onmessage = handleMsg;
        syncChannel = new BroadcastChannel('atomy_sync_channel');
        syncChannel.onmessage = handleMsg;
      }
    } catch {}
    return () => {
      try {
        prodChannel?.close();
        syncChannel?.close();
      } catch {}
    };
  }, []);

  // Load products from Super Admin Master Catalog that are NOT yet stocked in this hub
  const loadAvailableProducts = async () => {
    setIsLoadingAvailable(true);
    try {
      const data = await fetchAvailableProducts(distId);
      if (Array.isArray(data)) {
        setAvailableProducts(data);
        const initialQty = {};
        data.forEach(p => {
          initialQty[p.id] = 25; // Default batch quantity to stock
        });
        setAddQtyMap(initialQty);
      }
    } catch (err) {
      console.error('Failed to load available catalog products:', err);
      showToast('Error loading available master catalog products');
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  useEffect(() => {
    if (showAddModal) {
      loadAvailableProducts();
    }
  }, [showAddModal]);

  // Step Adjustment (-5 / +10)
  const handleStockAdjustment = async (product, delta) => {
    const newQty = Math.max(0, (product.stockQuantity || 0) + delta);
    setAdjustingId(product.id);
    try {
      await updateDistributorStock(distId, product.id, newQty, product.lowStockThreshold || 10);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockQuantity: newQty, isAvailable: newQty > 0 } : p));
      showToast(`Updated stock for ${product.name} to ${newQty} units`);
      try {
        const channel = new BroadcastChannel('atomy_product_channel');
        channel.postMessage({ type: 'PRODUCT_UPDATED', product: { ...product, stockQuantity: newQty, inStock: newQty > 0 } });
      } catch {}
    } catch (err) {
      console.error('Stock adjustment error:', err);
      showToast(`Failed to update stock: ${err.message || 'Server error'}`);
    } finally {
      setAdjustingId(null);
    }
  };

  // Add Product from Master Catalog to this hub
  const handleAddProductToHub = async (product) => {
    const qty = Math.max(1, Number(addQtyMap[product.id]) || 25);
    setAddingId(product.id);
    try {
      await addProductToInventory(distId, product.id, qty, 10);
      showToast(`Added "${product.name}" (${qty} units) to your hub inventory!`);

      // Remove from available modal list
      setAvailableProducts(prev => prev.filter(p => p.id !== product.id));

      // Add to current products list
      const newItem = {
        ...product,
        productId: product.id,
        stockQuantity: qty,
        lowStockThreshold: 10,
        isAvailable: true,
        distributorId: distId,
        pincode: hubPincode
      };
      setProducts(prev => [newItem, ...prev]);

      try {
        const channel = new BroadcastChannel('atomy_product_channel');
        channel.postMessage({ type: 'PRODUCT_UPDATED', product: newItem });
      } catch {}
    } catch (err) {
      showToast(`Failed to stock product: ${err.message || 'Server error'}`);
    } finally {
      setAddingId(null);
    }
  };

  // Remove Product from this hub
  const handleConfirmRemove = async () => {
    if (!productToRemove) return;
    setIsRemoving(true);
    try {
      await removeProductFromInventory(distId, productToRemove.id);
      setProducts(prev => prev.filter(p => p.id !== productToRemove.id));
      showToast(`Removed "${productToRemove.name}" from your hub inventory.`);

      try {
        const channel = new BroadcastChannel('atomy_product_channel');
        channel.postMessage({ type: 'PRODUCT_DELETED', productId: productToRemove.id });
      } catch {}

      setProductToRemove(null);
    } catch (err) {
      showToast(`Error: ${err.message || 'Failed to remove product'}`);
    } finally {
      setIsRemoving(false);
    }
  };

  // Save Stock Edit Modal
  const handleSaveStockEdit = async (e) => {
    e.preventDefault();
    if (!editingStockProduct) return;
    setIsSavingEdit(true);
    try {
      await updateDistributorStock(distId, editingStockProduct.id, editQty, editThreshold);
      setProducts(prev => prev.map(p => p.id === editingStockProduct.id ? {
        ...p,
        stockQuantity: editQty,
        lowStockThreshold: editThreshold,
        isAvailable: editQty > 0
      } : p));
      showToast(`Updated stock for "${editingStockProduct.name}" to ${editQty} units.`);
      setEditingStockProduct(null);

      try {
        const channel = new BroadcastChannel('atomy_product_channel');
        channel.postMessage({ type: 'PRODUCT_UPDATED', product: { ...editingStockProduct, stockQuantity: editQty, inStock: editQty > 0 } });
      } catch {}
    } catch (err) {
      showToast(`Error: ${err.message || 'Failed to update stock'}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Metrics
  const totalSkus = products.length;
  const inStockCount = products.filter(p => (p.stockQuantity || 0) > (p.lowStockThreshold || 10)).length;
  const lowStockCount = products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= (p.lowStockThreshold || 10)).length;
  const outOfStockCount = products.filter(p => (p.stockQuantity || 0) === 0).length;

  // Filtered list
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL') {
      const cat = String(p.categoryId || '').toLowerCase();
      const pName = String(p.name || '').toLowerCase();
      if (selectedCategory === 'hemohim') {
        if (!cat.includes('hemohim') && !pName.includes('hemohim')) return false;
      } else if (cat !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    const qty = p.stockQuantity || 0;
    const threshold = p.lowStockThreshold || 10;
    if (selectedStockFilter === 'IN_STOCK' && (qty <= threshold)) return false;
    if (selectedStockFilter === 'LOW' && (qty === 0 || qty > threshold)) return false;
    if (selectedStockFilter === 'OUT' && qty > 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = String(p.name || '').toLowerCase().includes(q);
      const matchId = String(p.id || '').toLowerCase().includes(q);
      const matchCat = String(p.categoryId || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchCat) return false;
    }

    return true;
  });

  // Filtered available products inside modal
  const filteredAvailable = availableProducts.filter(p => {
    if (!modalSearchQuery.trim()) return true;
    const q = modalSearchQuery.toLowerCase().trim();
    return String(p.name || '').toLowerCase().includes(q) ||
           String(p.id || '').toLowerCase().includes(q) ||
           String(p.categoryId || '').toLowerCase().includes(q);
  });

  return (
    <div className="admin-tab-content">
      {/* 1. Header Heading Row */}
      <div className="content-heading-row with-filter" style={{ paddingTop: '4px', marginBottom: '22px' }}>
        <div>
          <h2 className="content-title">Regional Hub Inventory &amp; Stock Control</h2>
          <p className="content-subtitle">
            Stock quantities and dispatch availability for PIN: <strong>{hubPincode}</strong> ({distributor?.city || 'Regional Hub'}, {distributor?.state || 'India'}).
          </p>
        </div>
        <div className="heading-actions-cluster">
          <button 
            type="button" 
            className="secondary-btn"
            onClick={loadProducts}
            disabled={isRefreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Sync Stock'}</span>
          </button>
          <button 
            type="button" 
            className="primary-action-btn"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#00a3e0' }}
          >
            <Plus size={16} />
            <span>Add Products from Catalog</span>
          </button>
        </div>
      </div>

      {/* 2. Top Inventory KPI Cards Strip */}
      <div className="kpi-gradient-grid four-cols" style={{ marginBottom: '28px' }}>
        {/* Total Stocked SKUs */}
        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
            '--card-border': '#bae6fd',
            '--card-title-color': '#0369a1'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Stocked in Hub</div>
            <div className="kpi-grad-icon-wrap">
              <Boxes size={19} color="#0284c7" />
            </div>
          </div>
          <div className="kpi-grad-val">
            {totalSkus} <span className="kpi-grad-unit">products</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Active in PIN {hubPincode}</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(2, 132, 199, 0.08)" />
            </svg>
          </div>
        </div>

        {/* In Stock Available */}
        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
            '--card-border': '#bbf7d0',
            '--card-title-color': '#15803d'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">In Stock Available</div>
            <div className="kpi-grad-icon-wrap">
              <CheckCircle2 size={19} color="#16a34a" />
            </div>
          </div>
          <div className="kpi-grad-val">
            {inStockCount} <span className="kpi-grad-unit">items</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Ready for immediate dispatch</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(22, 163, 74, 0.08)" />
            </svg>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #fefce8 0%, #fef08a 100%)',
            '--card-border': '#fde047',
            '--card-title-color': '#a16207'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Low Stock Alerts</div>
            <div className="kpi-grad-icon-wrap">
              <AlertTriangle size={19} color="#ca8a04" />
            </div>
          </div>
          <div className="kpi-grad-val" style={{ color: lowStockCount > 0 ? '#b45309' : '#0f172a' }}>
            {lowStockCount} <span className="kpi-grad-unit">(&le; 10 units)</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Reorder required from central depot</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#ca8a04" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(202, 138, 4, 0.08)" />
            </svg>
          </div>
        </div>

        {/* Out of Stock */}
        <div
          className="kpi-gradient-wave-card"
          style={{
            '--card-grad': 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)',
            '--card-border': '#fca5a5',
            '--card-title-color': '#b91c1c'
          }}
        >
          <div className="kpi-grad-top">
            <div className="kpi-grad-title">Out of Stock</div>
            <div className="kpi-grad-icon-wrap">
              <XCircle size={19} color="#dc2626" />
            </div>
          </div>
          <div className="kpi-grad-val" style={{ color: outOfStockCount > 0 ? '#dc2626' : '#0f172a' }}>
            {outOfStockCount} <span className="kpi-grad-unit">depleted</span>
          </div>
          <div className="kpi-grad-bottom">
            <div className="kpi-grad-trend">▲ Shows "Out of stock" to customers</div>
            <svg viewBox="0 0 160 35" preserveAspectRatio="none" className="kpi-grad-wave-svg">
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeOpacity="0.6" />
              <path d="M 0 25 Q 20 10 40 22 T 80 14 T 120 24 T 160 8 L 160 35 L 0 35 Z" fill="rgba(220, 38, 38, 0.08)" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="inventory-filter-toolbar" style={{ marginBottom: '20px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by Product Name, Code, or Category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="atomy-search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
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
            { id: 'food', label: 'Food & Drinks' }
          ].map(c => (
            <button
              key={c.id}
              type="button"
              className={`cat-filter-pill ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Stock Status Filter */}
        <div className="stock-filter-wrapper">
          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value)}
            className="atomy-dropdown"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock Only</option>
            <option value="LOW">Low Stock Only (&le; 10)</option>
            <option value="OUT">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* 4. Products Inventory Table */}
      <div className="atomy-table-responsive catalog-scrollable-table">
        <table className="atomy-data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Thumbnail</th>
              <th style={{ width: '110px' }}>Product No.</th>
              <th>Product Details</th>
              <th>Category</th>
              <th>Customer Price</th>
              <th>PV Points</th>
              <th style={{ textAlign: 'center' }}>Hub Stock</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center', width: '140px' }}>Quick Adjust</th>
              <th style={{ textAlign: 'right', width: '110px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="table-empty-row">
                  <p>Loading warehouse inventory...</p>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={10} className="table-empty-row" style={{ padding: '40px 20px' }}>
                  <Boxes size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#334155' }}>
                    {products.length === 0 ? 'Your Hub Has No Products Stocked Yet' : 'No matching products found'}
                  </h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#64748b', maxWidth: '480px' }}>
                    {products.length === 0
                      ? `Select which products from the Atomy Headquarters Master Catalog to carry in your local PIN ${hubPincode} warehouse.`
                      : 'Try adjusting your search terms or category filter.'}
                  </p>
                  {products.length === 0 && (
                    <button
                      type="button"
                      className="primary-action-btn"
                      onClick={() => setShowAddModal(true)}
                      style={{ background: '#00a3e0', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Plus size={16} />
                      <span>Browse Master Catalog &amp; Add Products</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const qty = p.stockQuantity != null ? Number(p.stockQuantity) : 0;
                const isOut = qty === 0;
                const isLow = !isOut && qty <= (p.lowStockThreshold || 10);

                return (
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
                      <span className="order-id-badge" style={{ background: '#f8fafc', color: '#0369a1', borderColor: '#bae6fd' }}>
                        {p.id}
                      </span>
                    </td>

                    <td>
                      <div className="cell-primary-text">{p.name}</div>
                      <div className="cell-secondary-text">{p.subcategory || 'Official Atomy Product'}</div>
                      <div style={{ display: 'flex', gap: '5px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {p.gstReduced && (
                          <span style={{ fontSize: '10px', fontWeight: 700, background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px' }}>
                            5% GST Reduced
                          </span>
                        )}
                        {p.freeDelivery && (
                          <span style={{ fontSize: '10px', fontWeight: 700, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px' }}>
                            Free Delivery
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="category-tag-badge">
                        {p.categoryId === 'hemohim' || (p.name && p.name.toLowerCase().includes('hemohim'))
                          ? 'HemoHIM'
                          : (p.categoryId ? p.categoryId.charAt(0).toUpperCase() + p.categoryId.slice(1).replace('_', ' ') : 'General')}
                      </span>
                    </td>

                    <td className="cell-price">
                      ₹ {Number(p.price || p.originalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      {p.originalPrice && Number(p.originalPrice) > Number(p.price || p.originalPrice || 0) && (
                        <div className="cell-mrp-sub" style={{ fontSize: '11px', color: '#94a3b8' }}>
                          MRP: ₹ {Number(p.originalPrice).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="pv-badge">{(Number(p.pv) || 0).toLocaleString('en-IN')} PV</span>
                    </td>

                    <td style={{ textAlign: 'center' }} className="stock-number-cell">
                      <span className={`stock-count-bubble ${isOut ? 'out' : isLow ? 'low' : 'good'}`}>
                        {qty} units
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${isOut ? 'out' : isLow ? 'low' : 'active'}`}>
                        {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div className="stock-step-btn-group" style={{ justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="stock-step-btn"
                          disabled={qty <= 0 || adjustingId === p.id}
                          onClick={() => handleStockAdjustment(p, -5)}
                          title="Reduce 5 units for dispatched batch"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          className="stock-step-btn"
                          disabled={adjustingId === p.id}
                          onClick={() => handleStockAdjustment(p, 10)}
                          title="Add 10 units for received restock"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions-group" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          type="button"
                          className="action-icon-btn edit"
                          onClick={() => {
                            if (onOpenEditProduct) {
                              onOpenEditProduct(p);
                            } else {
                              setEditingStockProduct(p);
                              setEditQty(p.stockQuantity || 0);
                              setEditThreshold(p.lowStockThreshold || 10);
                            }
                          }}
                          title="Full Edit: Product Details, Prices, Description, Photos & Stock"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn delete"
                          onClick={() => setProductToRemove(p)}
                          title="Remove from Hub Inventory"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          MODAL: ADD PRODUCTS FROM MASTER CATALOG (SUPER ADMIN)
          ======================================================== */}
      {showAddModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowAddModal(false)}>
          <div 
            className="atomy-modal-box" 
            style={{ maxWidth: '850px', width: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="atomy-modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Stock Products from Atomy Master Catalog
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Select approved products from headquarters to carry in your local hub (PIN: <strong>{hubPincode}</strong>). Enter your received stock quantity and click Add.
                </p>
              </div>
              <button 
                type="button" 
                className="atomy-modal-close" 
                onClick={() => setShowAddModal(false)}
                style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Search Toolbar */}
            <div style={{ padding: '14px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div className="search-input-wrapper" style={{ margin: 0, width: '100%', maxWidth: '100%' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filter available catalog products by name, code, or category..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="atomy-search-input"
                  style={{ width: '100%' }}
                />
                {modalSearchQuery && (
                  <button className="clear-search-btn" onClick={() => setModalSearchQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body: Available Products List */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
              {isLoadingAvailable ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                  <p>Comparing your hub inventory against Super Admin Master Catalog...</p>
                </div>
              ) : filteredAvailable.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <CheckCircle2 size={42} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a' }}>
                    {availableProducts.length === 0
                      ? 'All Master Catalog Products Are Already Stocked in Your Hub!'
                      : 'No unstocked products match your search.'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    {availableProducts.length === 0
                      ? 'Your regional warehouse is carrying 100% of the active Atomy India catalog items.'
                      : 'Try clearing your search query.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredAvailable.map(prod => {
                    const currentQty = addQtyMap[prod.id] !== undefined ? addQtyMap[prod.id] : 25;
                    const isAddingThis = addingId === prod.id;

                    return (
                      <div 
                        key={prod.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          background: '#ffffff',
                          gap: '16px'
                        }}
                      >
                        {/* Product Info Left */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                          <img
                            src={prod.image || "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg"}
                            alt={prod.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            onError={(e) => {
                              e.currentTarget.src = "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg";
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#0284c7', padding: '1px 6px', borderRadius: '4px' }}>
                                {prod.id}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                {prod.categoryId ? prod.categoryId.toUpperCase() : 'GENERAL'}
                              </span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              ₹ {Number(prod.price || 0).toLocaleString('en-IN')} • <strong style={{ color: '#0284c7' }}>{(Number(prod.pv) || 0).toLocaleString('en-IN')} PV</strong>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Input & Add Button Right */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Qty:</label>
                            <input
                              type="number"
                              min="1"
                              max="9999"
                              value={currentQty}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                setAddQtyMap(prev => ({ ...prev, [prod.id]: val }));
                              }}
                              style={{
                                width: '70px',
                                padding: '6px 8px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: '13.5px'
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddProductToHub(prod)}
                            disabled={isAddingThis}
                            style={{
                              background: '#00a3e0',
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '7px',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Plus size={14} />
                            <span>{isAddingThis ? 'Adding...' : 'Add to Hub'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                Remaining unstocked products: <strong>{filteredAvailable.length}</strong>
              </span>
              <button 
                type="button" 
                className="atomy-btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Close &amp; View Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: QUICK EDIT STOCK QUANTITY & THRESHOLD
          ======================================================== */}
      {editingStockProduct && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingStockProduct(null)}>
          <div className="atomy-modal-box compact" onClick={(e) => e.stopPropagation()}>
            <div className="atomy-modal-header">
              <h3>Update Hub Stock Quantity</h3>
              <button className="atomy-modal-close" onClick={() => setEditingStockProduct(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveStockEdit}>
              <div className="atomy-modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                  <img
                    src={editingStockProduct.image || "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg"}
                    alt={editingStockProduct.name}
                    style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>{editingStockProduct.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>SKU Code: <strong>{editingStockProduct.id}</strong></div>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Current Physical Warehouse Units:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editQty}
                    onChange={(e) => setEditQty(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: 700 }}
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Setting 0 will show "Out of Stock in your area" to PIN {hubPincode} customers.
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Low Stock Alert Warning Threshold:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editThreshold}
                    onChange={(e) => setEditThreshold(Math.max(1, parseInt(e.target.value) || 10))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: 600 }}
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Triggers yellow warning card when stock drops to or below this level.
                  </span>
                </div>

                <div className="modal-actions-right" style={{ marginTop: '20px' }}>
                  <button type="button" className="atomy-btn-secondary" onClick={() => setEditingStockProduct(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-action-btn" style={{ background: '#00a3e0' }} disabled={isSavingEdit}>
                    {isSavingEdit ? 'Saving...' : 'Update Hub Stock'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRM REMOVAL FROM HUB INVENTORY
          ======================================================== */}
      {productToRemove && (
        <div className="modal-backdrop-overlay" onClick={() => setProductToRemove(null)}>
          <div className="atomy-modal-box compact" onClick={(e) => e.stopPropagation()}>
            <div className="atomy-modal-header">
              <h3 className="text-red">Remove from Hub Inventory</h3>
              <button className="atomy-modal-close" onClick={() => setProductToRemove(null)}>
                &times;
              </button>
            </div>
            <div className="atomy-modal-body">
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to stop stocking <strong>{productToRemove.name}</strong> (Code: <code>{productToRemove.id}</code>) in your hub?
              </p>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', color: '#991b1b', marginTop: '10px' }}>
                Customers delivering to PIN <strong>{hubPincode}</strong> will see this product as unavailable in your territory. You can re-add it anytime from the Master Catalog.
              </div>
              <div className="modal-actions-right" style={{ marginTop: '20px' }}>
                <button type="button" className="atomy-btn-secondary" onClick={() => setProductToRemove(null)}>
                  Cancel
                </button>
                <button type="button" className="atomy-btn-danger" onClick={handleConfirmRemove} disabled={isRemoving}>
                  {isRemoving ? 'Removing...' : 'Yes, Remove from Hub'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 10000 }}>
          <CheckCircle2 size={16} color="#38bdf8" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
