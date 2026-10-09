import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link,
  Undo,
  Redo,
  UploadCloud,
  FileText,
  Sparkles,
  Check,
  Boxes,
  HelpCircle,
  IndianRupee,
  Maximize2
} from 'lucide-react';
import officialProductDetails from '../../data/officialProductDetails.json';
import './ProductEditorPage.css';

export default function ProductEditorPage({
  initialData,
  onSave,
  onCancel
}) {
  const officialData = (initialData?.id && officialProductDetails[initialData.id]) ? officialProductDetails[initialData.id] : {};

  // Calculate discount percentage helper
  const computeDiscount = (mrp, offerPrice) => {
    const m = Number(mrp) || 0;
    const p = Number(offerPrice) || 0;
    if (m > 0 && p > 0 && m > p) {
      return Math.round(((m - p) / m) * 100);
    }
    return 0;
  };

  const initialDiscount = initialData?.discountPercent !== undefined && initialData?.discountPercent !== null
    ? initialData.discountPercent
    : computeDiscount(initialData?.originalPrice || officialData.price || 14950, initialData?.price || 13000);

  const [discountPercent, setDiscountPercent] = useState(initialDiscount);

  const [formData, setFormData] = useState({
    id: initialData?.id || `D0${Math.floor(1000 + Math.random() * 9000)}`,
    name: initialData?.name || officialData.name || '',
    categoryId: initialData?.categoryId || 'health',
    subcategory: initialData?.subcategory || '',
    price: initialData?.price ?? (officialData.price || 13000),
    originalPrice: initialData?.originalPrice ?? (officialData.originalPrice || officialData.price || 14950),
    discountPercent: initialDiscount,
    dpPrice: initialData?.dpPrice ?? (initialData?.distributorPrice || ''),
    pv: initialData?.pv || officialData.pv || 80000,
    stockQuantity: initialData?.stockQuantity || 50,
    lowStockThreshold: initialData?.lowStockThreshold || 10,
    image: initialData?.image || officialData.baseImage || 'https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg',
    description: initialData?.description || officialData.goodsDescHtml || '',
    features: initialData?.features || 'Absolute Quality, Absolute Price, Natural Botanical Ingredients',
    ingredients: initialData?.ingredients || 'Natural botanical extracts, patented herbal formulation',
    precautions: initialData?.precautions || 'Store in cool and dry place. Keep out of reach of children.',
    volumeDesc: initialData?.volumeDesc || officialData.volumeDesc || 'Standard Package',
    weight: initialData?.weight || officialData.weight || 1.0,
    tags: initialData?.tags || 'Best Seller',
    isVeg: initialData?.isVeg ?? true,
    isNonVeg: initialData?.isNonVeg ?? false,
    gstReduced: initialData?.gstReduced ?? true,
    freeDelivery: initialData?.freeDelivery ?? true,
    isNew: initialData?.isNew ?? false
  });

  // Handle Discount Percentage changes -> automatically deducts Offer Price from MRP
  const handleDiscountChange = (newDiscountVal) => {
    const val = newDiscountVal === '' ? '' : Math.max(0, Math.min(100, Number(newDiscountVal)));
    setDiscountPercent(val);
    const mrp = Number(formData.originalPrice) || 0;
    if (mrp > 0 && val !== '') {
      const discountAmount = (mrp * Number(val)) / 100;
      const computedPrice = Math.max(0, Math.round(mrp - discountAmount));
      setFormData(prev => ({
        ...prev,
        price: computedPrice,
        discountPercent: val
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        discountPercent: val
      }));
    }
  };

  // Handle Original / MRP changes -> recalculates Price based on Discount %
  const handleMrpChange = (newMrpVal) => {
    const mrp = newMrpVal === '' ? '' : Number(newMrpVal);
    setFormData(prev => {
      let updatedPrice = prev.price;
      if (mrp !== '' && discountPercent !== '' && Number(discountPercent) > 0) {
        const discountAmount = (Number(mrp) * Number(discountPercent)) / 100;
        updatedPrice = Math.max(0, Math.round(Number(mrp) - discountAmount));
      } else if (mrp !== '' && updatedPrice) {
        const disc = computeDiscount(mrp, updatedPrice);
        setDiscountPercent(disc);
      }
      return {
        ...prev,
        originalPrice: newMrpVal,
        price: updatedPrice
      };
    });
  };

  // Handle Customer Price change directly -> auto-updates Discount %
  const handlePriceChange = (newPriceVal) => {
    const price = newPriceVal === '' ? '' : Number(newPriceVal);
    const mrp = Number(formData.originalPrice) || 0;
    if (mrp > 0 && price !== '') {
      const disc = computeDiscount(mrp, price);
      setDiscountPercent(disc);
      setFormData(prev => ({
        ...prev,
        price: newPriceVal,
        discountPercent: disc
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        price: newPriceVal
      }));
    }
  };

  // Handle DP (Distributor Price) change in text form
  const handleDpPriceChange = (newDpVal) => {
    setFormData(prev => ({
      ...prev,
      dpPrice: newDpVal
    }));
  };

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeHeading, setActiveHeading] = useState('p');
  const [wordCount, setWordCount] = useState(0);

  // Initialize editor content and reset scroll position to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const mainPanel = document.querySelector('.admin-main-panel');
    if (mainPanel) mainPanel.scrollTop = 0;

    if (editorRef.current) {
      const descToLoad = formData.description || officialData.goodsDescHtml;
      if (descToLoad && descToLoad.trim()) {
        editorRef.current.innerHTML = descToLoad;
      } else {
        // Default clean document structure
        editorRef.current.innerHTML = `
          <h2>${formData.name || 'Product Overview & Highlights'}</h2>
          <p>Write or paste your product overview, clinical certifications, and patented technology details here...</p>
          <p><br/></p>
          <h3>Key Benefits & Features</h3>
          <ul>
            <li>Clinically researched patented botanical formulation</li>
            <li>Absolute Quality at Absolute Price guarantee</li>
            <li>Certified by international wellness regulatory standards</li>
          </ul>
        `;
      }
      updateWordCount();
    }
  }, [initialData?.id]);

  const updateWordCount = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };

  // MS Word Formatting Command Handler
  const execCmd = (cmd, val = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    updateWordCount();
  };

  // Insert Photo at current cursor position
  const insertImageHtml = (src, caption = 'Product Image') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const imgHtml = `
      <div style="text-align: center; margin: 18px 0; max-width: 100%;">
        <img src="${src}" alt="${caption}" style="max-width: 100%; max-height: 480px; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.12); border: 1px solid #e2e8f0;" />
        <div style="color: #64748b; font-size: 12px; margin-top: 6px; font-style: italic;">${caption}</div>
      </div>
      <p><br/></p>
    `;
    document.execCommand('insertHTML', false, imgHtml);
    updateWordCount();
  };

  // Handle local photo file upload
  const handleLocalPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          insertImageHtml(loadEvt.target.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
    // reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  // Handle web photo URL prompt
  const handleInsertWebPhoto = () => {
    const url = prompt('Enter the web image URL (https://...):', 'https://image.atomy.com/IN/goods/D00101/D00101_01.jpg');
    if (url && url.trim()) {
      insertImageHtml(url.trim(), 'Atomy Brochure Graphic');
    }
  };

  // Handle clipboard paste (Ctrl+V) directly inside Word canvas
  const handleCanvasPaste = (e) => {
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            insertImageHtml(event.target.result, 'Pasted Photo from Clipboard');
          }
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
    // Plain text or HTML paste will update count after paste
    setTimeout(updateWordCount, 10);
  };

  // Handle Drag-and-drop of photo files directly onto the MS Word canvas
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            insertImageHtml(event.target.result, file.name);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Load Official Atomy Brochure Template
  const handleLoadAtomyTemplate = () => {
    if (!editorRef.current) return;
    const templateHtml = `
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #002c6c; font-size: 26px; font-weight: 800; margin-bottom: 6px;">${formData.name || 'Atomy Official Product Brochure'}</h1>
        <p style="color: #00A3E0; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Absolute Quality • Absolute Price</p>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <img src="${formData.image}" alt="${formData.name}" style="max-width: 320px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);" />
      </div>

      <h2 style="color: #00A3E0; border-bottom: 2px solid #e0f2fe; padding-bottom: 6px;">1. Product Information & Description</h2>
      <p style="line-height: 1.6; font-size: 14.5px;">This premium Atomy formulation provides comprehensive wellness support utilizing advanced bio-fermentation extraction technology. Tested rigorously for purity, high bioavailability, and maximum consumer satisfaction.</p>

      <h2 style="color: #00A3E0; border-bottom: 2px solid #e0f2fe; padding-bottom: 6px; margin-top: 24px;">2. Key Benefits & Technological Highlights</h2>
      <ul style="line-height: 1.8; font-size: 14px;">
        <li><strong>Patented Biotechnology:</strong> Engineered through advanced natural purification systems.</li>
        <li><strong>Immunity & Vitality:</strong> Designed to replenish energy and awaken body defense mechanisms.</li>
        <li><strong>Clean Formula:</strong> Free from harmful chemicals, heavy metals, or synthetic fillers.</li>
      </ul>

      <h2 style="color: #00A3E0; border-bottom: 2px solid #e0f2fe; padding-bottom: 6px; margin-top: 24px;">3. Recommended Usage & Directions</h2>
      <p style="line-height: 1.6; font-size: 14px;">Consume 1 packet twice daily with water or take as directed by your healthcare specialist. Store in a cool, dry place away from direct sunlight.</p>
    `;
    editorRef.current.innerHTML = templateHtml;
    updateWordCount();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      alert('Product Code and Name are required.');
      return;
    }

    const editorHtml = editorRef.current ? editorRef.current.innerHTML : formData.description;

    onSave({
      ...formData,
      description: editorHtml,
      price: Number(formData.price) || 0,
      originalPrice: Number(formData.originalPrice) || 0,
      discountPercent: Number(discountPercent) || 0,
      dpPrice: formData.dpPrice ? Number(formData.dpPrice) : 0,
      pv: Number(formData.pv) || 0,
      stockQuantity: Number(formData.stockQuantity) || 0,
      lowStockThreshold: Number(formData.lowStockThreshold) || 10,
      isVeg: Boolean(formData.isVeg),
      isNonVeg: Boolean(formData.isNonVeg),
      gstReduced: Boolean(formData.gstReduced),
      freeDelivery: Boolean(formData.freeDelivery),
      active: formData.active !== undefined ? Boolean(formData.active) : true,
      likesCount: Number(formData.likesCount) || 0
    });
  };

  return (
    <div className="product-editor-full-page">
      {/* 1. Header Bar with Back and Save Actions */}
      <div className="editor-top-nav-bar">
        <div className="top-nav-left">
          <button type="button" className="editor-back-btn" onClick={onCancel}>
            <ArrowLeft size={18} />
            <span>Back to Inventory</span>
          </button>
          <div className="editor-title-group">
            <h1 className="editor-main-title">
              {formData.isNew ? 'Add New Product to Atomy Catalog' : `Edit Product Details: ${formData.name}`}
            </h1>
            <span className="editor-id-pill">SKU Code: {formData.id}</span>
          </div>
        </div>

        <div className="top-nav-right">
          <button type="button" className="atomy-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="editor-save-btn" onClick={handleSubmit}>
            <Save size={16} />
            <span>Save & Publish Product</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="editor-page-container">
        {/* SECTION 1: Product Classification & Identity */}
        <div className="editor-card-panel">
          <div className="panel-header">
            <Boxes size={20} color="#00A3E0" />
            <div>
              <h3>1. Product Identity & Category</h3>
              <p>Basic information displayed in catalog browsing and search autocomplete</p>
            </div>
          </div>

          <div className="panel-body">
            <div className="editor-grid-3">
              <div className="editor-form-group">
                <label>Product Code / Number *</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                  placeholder="e.g. D00101"
                  required
                  disabled={!formData.isNew}
                />
              </div>

              <div className="editor-form-group">
                <label>Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="editor-select"
                  required
                >
                  <option value="hemohim">HemoHIM</option>
                  <option value="health">Health Care</option>
                  <option value="beauty">Beauty & Cosmetics</option>
                  <option value="personal_care">Personal Care</option>
                  <option value="home">Living & Home</option>
                  <option value="food">Food & Groceries</option>
                  <option value="others">ETC / Supplementary</option>
                </select>
              </div>

              <div className="editor-form-group">
                <label>Subcategory</label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="e.g. Immune & Nutrition"
                />
              </div>
            </div>

            <div className="editor-form-group" style={{ marginTop: '14px' }}>
              <label>Product Display Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Atomy HemoHIM 1 Set"
                required
                className="input-large-text"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Pricing, Automated Discount Deduction, DP Price & Stock */}
        <div className="editor-card-panel">
          <div className="panel-header">
            <IndianRupee size={20} color="#00A3E0" />
            <div>
              <h3>2. Pricing, Discount Deduction, DP (Distributor Price) & Stock</h3>
              <p>Commercial pricing, automated discount deductions, member distributor rates, and fulfillment</p>
            </div>
          </div>

          <div className="panel-body">
            <div className="editor-grid-4">
              {/* Original / MRP (₹) */}
              <div className="editor-form-group">
                <label>Original / MRP (₹) *</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handleMrpChange(e.target.value)}
                  placeholder="e.g. 15000"
                  required
                />
                <span className="editor-field-helper">Maximum Retail Price</span>
              </div>

              {/* Discount Percentage (%) */}
              <div className="editor-form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Discount Percentage (%)</span>
                  {discountPercent > 0 && (
                    <span className="discount-calc-badge">{discountPercent}% OFF</span>
                  )}
                </label>
                <div className="input-with-affix">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    placeholder="e.g. 20"
                  />
                  <span className="input-affix-right">%</span>
                </div>
                <span className="editor-field-helper" style={{ color: '#0284c7', fontWeight: '600' }}>
                  ⚡ Auto-deducts Offer Price from MRP
                </span>
              </div>

              {/* Customer / Offer Price (₹) */}
              <div className="editor-form-group">
                <label>Customer Offer Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="e.g. 12000"
                  required
                  style={{ fontWeight: '700', color: '#0284c7' }}
                />
                <span className="editor-field-helper">
                  Selling price for direct customers
                </span>
              </div>

              {/* Distributor Price / DP (₹) */}
              <div className="editor-form-group dp-highlight-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Distributor Price / DP (₹)</span>
                  <span className="dp-plan-badge">Upcoming Advantage</span>
                </label>
                <input
                  type="text"
                  value={formData.dpPrice}
                  onChange={(e) => handleDpPriceChange(e.target.value)}
                  placeholder="e.g. 10000"
                  className="dp-input-field"
                />
                <span className="editor-field-helper" style={{ color: '#059669', fontWeight: '600' }}>
                  Member advantage price (Membership plan)
                </span>
              </div>
            </div>

            <div className="editor-grid-4" style={{ marginTop: '16px' }}>
              <div className="editor-form-group">
                <label>Atomy PV (Point Value) *</label>
                <input
                  type="number"
                  value={formData.pv}
                  onChange={(e) => setFormData({ ...formData, pv: e.target.value })}
                  required
                />
              </div>

              <div className="editor-form-group">
                <label>Warehouse Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  required
                />
              </div>

              <div className="editor-form-group">
                <label>Low Stock Warning Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                />
              </div>

              <div className="editor-form-group">
                <label>Net Weight / Volume</label>
                <input
                  type="text"
                  value={formData.volumeDesc}
                  onChange={(e) => setFormData({ ...formData, volumeDesc: e.target.value })}
                  placeholder="e.g. 20ml x 60 packets (1,200ml)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Primary Showcase Image & Badges */}
        <div className="editor-card-panel">
          <div className="panel-header">
            <ImageIcon size={20} color="#00A3E0" />
            <div>
              <h3>3. Primary Product Photography & Consumer Badges</h3>
              <p>Primary thumbnail shown in catalog grid, cart, and order sheets</p>
            </div>
          </div>

          <div className="panel-body">
            <div className="photo-preview-grid">
              <div className="photo-preview-box">
                <img
                  src={formData.image || "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg"}
                  alt="Thumbnail Preview"
                  onError={(e) => {
                    e.currentTarget.src = "https://resources.atomy.com/20261001111257/common/images/no_img_square.jpg";
                  }}
                />
              </div>

              <div className="photo-input-group">
                <label>Primary Image URL *</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://image.atomy.com/IN/goods/..."
                  required
                />
                <span className="input-hint">Paste an authentic Atomy product photography link or image asset.</span>

                {/* Flags and Badges */}
                <div className="editor-flags-row">
                  <label className="checkbox-flag">
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked, isNonVeg: !e.target.checked })}
                    />
                    <span>Pure Vegetarian (Green)</span>
                  </label>

                  <label className={`checkbox-flag ${formData.gstReduced ? 'active-flag-gst' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.gstReduced}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        let updatedTags = Array.isArray(formData.tags)
                          ? [...formData.tags]
                          : typeof formData.tags === 'string'
                            ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                            : [];
                        if (checked && !updatedTags.some(t => t.toUpperCase().includes('GST REDUCED'))) {
                          updatedTags.push('#GST REDUCED');
                        } else if (!checked) {
                          updatedTags = updatedTags.filter(t => !t.toUpperCase().includes('GST REDUCED'));
                        }
                        setFormData({ ...formData, gstReduced: checked, tags: updatedTags });
                      }}
                    />
                    <span>5% GST Reduced Rate Badge (#GST REDUCED)</span>
                  </label>

                  <label className={`checkbox-flag ${formData.freeDelivery ? 'active-flag-delivery' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.freeDelivery}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        let updatedTags = Array.isArray(formData.tags)
                          ? [...formData.tags]
                          : typeof formData.tags === 'string'
                            ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                            : [];
                        if (checked && !updatedTags.some(t => t.toUpperCase().includes('FREE DELIVERY'))) {
                          updatedTags.push('#FREE DELIVERY');
                        } else if (!checked) {
                          updatedTags = updatedTags.filter(t => !t.toUpperCase().includes('FREE DELIVERY'));
                        }
                        setFormData({ ...formData, freeDelivery: checked, tags: updatedTags });
                      }}
                    />
                    <span>Free Home Delivery Eligible (#FREE DELIVERY)</span>
                  </label>
                </div>

                {/* Quick Promotional Tag Chips */}
                <div className="editor-tag-chips-section" style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Quick Promotional Tags:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { tag: '#GST REDUCED', isGst: true },
                      { tag: '#FREE DELIVERY', isDeliv: true },
                      { tag: '#BEST SELLER' },
                      { tag: '#NEW' },
                      { tag: '#IMMUNITY' },
                      { tag: '#POPULAR' }
                    ].map(({ tag, isGst, isDeliv }) => {
                      const tagsArr = Array.isArray(formData.tags) 
                        ? formData.tags 
                        : typeof formData.tags === 'string' 
                          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) 
                          : [];
                      const isSelected = isGst ? formData.gstReduced : isDeliv ? formData.freeDelivery : tagsArr.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            let nextTags = [...tagsArr];
                            if (isGst) {
                              const nextVal = !formData.gstReduced;
                              if (nextVal && !nextTags.includes(tag)) nextTags.push(tag);
                              if (!nextVal) nextTags = nextTags.filter(t => t !== tag);
                              setFormData({ ...formData, gstReduced: nextVal, tags: nextTags });
                            } else if (isDeliv) {
                              const nextVal = !formData.freeDelivery;
                              if (nextVal && !nextTags.includes(tag)) nextTags.push(tag);
                              if (!nextVal) nextTags = nextTags.filter(t => t !== tag);
                              setFormData({ ...formData, freeDelivery: nextVal, tags: nextTags });
                            } else {
                              if (isSelected) {
                                nextTags = nextTags.filter(t => t !== tag);
                              } else {
                                nextTags.push(tag);
                              }
                              setFormData({ ...formData, tags: nextTags });
                            }
                          }}
                          style={{
                            padding: '4px 11px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: isSelected ? '1.5px solid #00A3E0' : '1px solid #cbd5e1',
                            background: isSelected ? '#e0f2fe' : '#ffffff',
                            color: isSelected ? '#0284c7' : '#64748b',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: MICROSOFT WORD STYLE INFORMATION & BROCHURE EDITOR */}
        <div className="editor-card-panel ms-word-container-panel">
          <div className="panel-header word-panel-header">
            <div className="ms-word-header-title">
              <div className="ms-word-app-badge">
                <span>W</span>
              </div>
              <div>
                <h3>Product Information, About Details & Brochure Editor</h3>
                <p>Microsoft Word Style WYSIWYG Editor — Type text, format headings, and paste/insert photos directly</p>
              </div>
            </div>

            <div className="ms-word-actions-right">
              <button
                type="button"
                className="word-template-btn"
                onClick={handleLoadAtomyTemplate}
                title="Populate an authentic Atomy product brochure layout"
              >
                <Sparkles size={14} />
                <span>Load Sample Atomy Layout</span>
              </button>
            </div>
          </div>

          {/* Microsoft Word Ribbon Toolbar */}
          <div className="ms-word-ribbon">
            {/* Quick Undo/Redo */}
            <div className="ribbon-btn-group">
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('undo')} title="Undo (Ctrl+Z)">
                <Undo size={15} />
              </button>
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('redo')} title="Redo (Ctrl+Y)">
                <Redo size={15} />
              </button>
            </div>

            <div className="ribbon-divider"></div>

            {/* Heading / Style Selector */}
            <div className="ribbon-btn-group">
              <select
                className="ribbon-select"
                onChange={(e) => {
                  execCmd('formatBlock', e.target.value);
                  setActiveHeading(e.target.value);
                }}
                value={activeHeading}
                title="Heading Styles"
              >
                <option value="p">Normal Text</option>
                <option value="h1">Heading 1 (Main Title)</option>
                <option value="h2">Heading 2 (Section)</option>
                <option value="h3">Heading 3 (Subsection)</option>
              </select>
            </div>

            <div className="ribbon-divider"></div>

            {/* Font Styling: Bold, Italic, Underline, Strikethrough */}
            <div className="ribbon-btn-group">
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('bold')} title="Bold (Ctrl+B)">
                <Bold size={15} />
              </button>
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('italic')} title="Italic (Ctrl+I)">
                <Italic size={15} />
              </button>
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('underline')} title="Underline (Ctrl+U)">
                <Underline size={15} />
              </button>
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('strikeThrough')} title="Strikethrough">
                <Strikethrough size={15} />
              </button>
            </div>

            <div className="ribbon-divider"></div>

            {/* Colors */}
            <div className="ribbon-btn-group">
              <label className="ribbon-color-picker" title="Text Color">
                <span className="color-label">A</span>
                <input
                  type="color"
                  onChange={(e) => execCmd('foreColor', e.target.value)}
                  defaultValue="#0f172a"
                />
              </label>
              <label className="ribbon-color-picker" title="Highlight Color">
                <span className="color-label highlight-label">H</span>
                <input
                  type="color"
                  onChange={(e) => execCmd('hiliteColor', e.target.value)}
                  defaultValue="#fef08a"
                />
              </label>
            </div>

            <div className="ribbon-divider"></div>

            {/* Alignment */}
            <div className="ribbon-btn-group">
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('justifyLeft')} title="Align Left">
                <AlignLeft size={15} />
              </button>
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('justifyCenter')} title="Center">
                <AlignCenter size={15} />
              </button>
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('justifyRight')} title="Align Right">
                <AlignRight size={15} />
              </button>
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('justifyFull')} title="Justify">
                <AlignJustify size={15} />
              </button>
            </div>

            <div className="ribbon-divider"></div>

            {/* Lists */}
            <div className="ribbon-btn-group">
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('insertUnorderedList')} title="Bulleted List">
                <List size={15} />
              </button>
              <button type="button" className="ribbon-icon-btn" onClick={() => execCmd('insertOrderedList')} title="Numbered List">
                <ListOrdered size={15} />
              </button>
            </div>

            <div className="ribbon-divider"></div>

            {/* Photo & Image Insertion Buttons */}
            <div className="ribbon-btn-group photo-ribbon-group">
              {/* Hidden file input for local photo */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLocalPhotoUpload}
              />
              <button
                type="button"
                className="ribbon-photo-action-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo from Computer (Embeds directly into document)"
              >
                <UploadCloud size={15} />
                <span>Insert Photo File</span>
              </button>

              <button
                type="button"
                className="ribbon-photo-action-btn secondary"
                onClick={handleInsertWebPhoto}
                title="Insert Web Image by URL"
              >
                <ImageIcon size={15} />
                <span>Photo via URL</span>
              </button>
            </div>
          </div>

          {/* Microsoft Word Document Canvas Sheet */}
          <div className="ms-word-workspace">
            <div className="ms-word-ruler-bar">
              <div className="ruler-line"></div>
              <span className="ruler-label">Document Page 1 — Paste Photos directly (Ctrl+V) or Drag & Drop</span>
              <span className="word-count-badge">{wordCount} words</span>
            </div>

            <div
              ref={editorRef}
              className="ms-word-page-canvas"
              contentEditable={true}
              suppressContentEditableWarning={true}
              onPaste={handleCanvasPaste}
              onDrop={handleCanvasDrop}
              onInput={updateWordCount}
              onKeyUp={updateWordCount}
              spellCheck={true}
              data-placeholder="Start typing your product details, descriptions, ingredients, directions of use, or paste photos directly here..."
            />
          </div>

          <div className="word-canvas-footer-tip">
            <HelpCircle size={14} color="#00A3E0" />
            <span>
              <strong>Tip:</strong> You can copy any image from your computer or internet and press <code>Ctrl+V</code> inside the document to paste photos instantly, or drag & drop image files onto the page!
            </span>
          </div>
        </div>

        {/* Floating Bottom Action Bar */}
        <div className="editor-bottom-bar">
          <div className="bottom-bar-left">
            <span>Editing SKU: <strong>{formData.id}</strong> ({formData.name || 'New Product'})</span>
          </div>
          <div className="bottom-bar-right">
            <button type="button" className="atomy-btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="editor-save-btn">
              <Save size={16} />
              <span>Save & Publish Product</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
