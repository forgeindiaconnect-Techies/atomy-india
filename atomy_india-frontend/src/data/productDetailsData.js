import officialDetails from './officialProductDetails.json';

const PARENT_MAP = {
  'D00354': 'D00351', // Evening Care Foam Cleanser -> Evening Care Set
  'D00282': 'D00281', // Sunscreen White -> Sunscreen Beige
  'D00104': 'D00101', // HemoHIM 4set -> HemoHIM
  'D00102': 'D00101', // HemoHIM 2set -> HemoHIM
  'D00105': 'D00101',
  'D00106': 'D00101',
  'D00107': 'D00101',
  'D00108': 'D00101',
  'D00109': 'D00101',
  'D00602': 'D00601',
  'D00603': 'D00601',
  'D00802': 'D00810',
  'D00803': 'D00830',
  'D00901': 'D00975',
  'D00921': 'D00975',
  'D00930': 'D00975',
  'D00940': 'D00975',
  'D00980': 'D00975',
  'D00902': 'D00975',
  'D00915': 'D00975',
  'D00985': 'D00975',
  'D00990': 'D00975',
};

export function getOfficialProductDetails(productId, productName) {
  if (!productId && !productName) return null;
  let targetId = productId;
  if (!officialDetails[targetId] && PARENT_MAP[targetId]) {
    targetId = PARENT_MAP[targetId];
  }
  if (!officialDetails[targetId] && productName) {
    const pLower = productName.toLowerCase();
    for (const [id, data] of Object.entries(officialDetails)) {
      if (pLower.includes(data.name.toLowerCase()) || data.name.toLowerCase().includes(pLower)) {
        targetId = id;
        break;
      }
    }
  }
  return officialDetails[targetId] || null;
}

export const PRODUCT_GENERIC_NAME_MAP = {
  // Personal Care & Hair Care
  'D00693': 'Scalp Care Hair Set (2 Pcs)',
  'D00691': 'Hair Care Shampoo',
  'D00681': 'Hair Essential Oil',
  'D00661': 'Hair Care Conditioner',
  'D00631': 'Herbal Body Cleanser',
  'D00620': 'Hair Scalp Tonic',
  'D00611': 'Hair Care Treatment',
  'D00601': 'Hair Care Shampoo',
  'D00602': 'Hair Care Treatment',
  'D00603': 'Herbal Body Cleanser',
  'D00650': 'Body Moisturizing Lotion',
  'D00501': 'Oral Care Toothpaste (Propolis)',
  'D00510': 'Oral Care Toothbrush',
  'D00860': 'Antibacterial Liquid Hand Soap',

  // Beauty & Skincare
  'D00207': 'Cosmetic Skincare Kit (6-Piece Set)',
  'D00217': 'Skin Care Toner',
  'D00227': 'Skin Care Intensive Ampoule',
  'D00237': 'Skin Care Serum',
  'D00247': 'Skin Care Lotion / Emulsion',
  'D00257': 'Eye Care Cream',
  'D00267': 'Skin Nourishing Cream',
  'D01513': 'Facial Night Mask Pack',
  'D01526': 'Skin Tone Brightening Corrector',
  'D00003': 'Cosmetic Skincare Kit (5-Piece Set)',
  'D00351': 'Facial Cleansing Kit (4-Piece Set)',
  'D00354': 'Facial Foam Cleanser',
  'D00757': 'Hydrating Skincare Kit (2-Piece Set)',
  'D00281': 'Sunscreen Cream (SPF50+ PA+++)',
  'D00282': 'Sunscreen Cream (SPF50+ PA+++)',
  'D00396': 'Compact Face Powder',
  'D01440': 'EyeLiner',
  'D04704': 'Concealer',

  // Health & Supplements
  'D00101': 'Health Supplement (Botanical-Mix Extract)',
  'D00104': 'Health Supplement (Botanical-Mix Extract)',
  'D00102': 'Health Supplement (Botanical-Mix Extract)',
  'D00105': 'Health Supplement (Botanical-Mix Extract)',
  'D00106': 'Health Supplement (Botanical-Mix Extract)',
  'D00107': 'Health Supplement (Botanical-Mix Extract)',
  'D00108': 'Health Supplement (Botanical-Mix Extract)',
  'D00109': 'Health Supplement (Botanical-Mix Extract)',
  'D00111': 'Health Supplement (Omega-3 Softgels)',
  'D00160': 'Health Supplement (Probiotics Powder Mix)',
  'D00170': 'Health Drink (Fermented Noni Extract)',
  'D00174': 'Health Supplement (Milk Thistle Capsules)',
  'D00171': 'Health Supplement (Milk Thistle Capsules)',
  'D00183': 'Health Fruit Jelly Supplement',
  'D00180': 'Packaged Tea (Pu\'er Tea Extract)',
  'D94085': 'Health Supplement (Shilajit Extract Capsules)',
  'D90178': 'Health Supplement (Spirulina Capsules)',
  'D94084': 'Health Supplement (Spirulina Powder)',
  'D04086': 'Health Supplement (Moringa Capsules)',
  'D04006': 'Health Supplement (Vegetarian Algae Omega-3)',
  'D07116': 'Health Supplement Combo Pack',

  // Food & Beverage
  'D00975': 'Instant Coffee (100% Arabica)',
  'D00980': 'Instant Coffee (Arabica Blend)',
  'D00901': 'Instant Coffee (100% Arabica)',
  'D00902': 'Roasted Seasoned Seaweed Snack',
  'D00921': 'Roasted Seasoned Seaweed Snack',
  'D00930': 'Roasted Seasoned Seaweed Snack',
  'D00915': 'Packaged Organic Green Tea',
  'D00985': 'Dietary Protein Shake Mix',
  'D00990': 'Korean Red Ginseng Tea Granules',
  'D00940': 'Fermented Soybean Paste (Doenjang)',

  // Home & Living
  'D00801': 'Powder Laundry Detergent',
  'D00810': 'Liquid Laundry Detergent',
  'D00802': 'Liquid Laundry Detergent',
  'D00820': 'Dishwashing Liquid Detergent',
  'D00830': 'Fabric Softener',
  'D00803': 'Fabric Softener',
  'D00840': 'Stainless Steel Cookware Wok',
  'D00850': 'Multipurpose Kitchen Paper Towels',
  'D00870': 'Kitchen Cleaning Scrubber',
  'D00805': 'Stainless Steel Kitchen Scrubber',
  'D00804': 'Natural Rubber Household Gloves',

  // Merchandise & Business Materials
  'D09001': 'Shopping Carry Bag (Medium)',
  'D09002': 'Shopping Carry Bag (Large)',
  'D09010': 'Printed Product Catalog',
  'D09011': 'Printed Product Catalog',
  'D09020': 'Stationery Executive Notebook & Pen',
  'D09030': 'Merchandise Lapel Pin Badge',
  'D09040': 'Display Case Pouch',
  'D09050': 'Business Starter Kit'
};

export function getGenericName(product) {
  if (!product) return 'Consumer Goods';
  if (product.id && PRODUCT_GENERIC_NAME_MAP[product.id]) {
    return PRODUCT_GENERIC_NAME_MAP[product.id];
  }
  const name = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();

  // Specific Product Matches
  if (name.includes('hemohim')) return 'Health Supplement (Botanical-Mix Extract)';
  if (name.includes('foam cleanser')) return 'Facial Foam Cleanser';
  if (name.includes('deep cleanser')) return 'Facial Deep Cleansing Cream';
  if (name.includes('peeling gel')) return 'Facial Peeling Gel';
  if (name.includes('peel-off mask') || name.includes('night mask')) return 'Facial Mask Pack';
  if (name.includes('evening care')) return 'Facial Cleansing Kit (4-Piece Set)';
  if (name.includes('sunscreen')) return 'Sunscreen Cream (SPF50+ PA+++)';
  if (name.includes('bb cream')) return 'Blemish Balm (BB) Cream SPF30 PA++';
  if (name.includes('toner')) return 'Skin Care Toner';
  if (name.includes('ampoule')) return 'Skin Care Intensive Ampoule';
  if (name.includes('serum')) return 'Skin Care Serum';
  if (name.includes('lotion')) return 'Skin Care Lotion / Emulsion';
  if (name.includes('eye-complex') || name.includes('eye cream')) return 'Eye Care Cream';
  if (name.includes('nutrition cream')) return 'Skin Nourishing Cream';
  if (name.includes('absolute skincare')) return 'Cosmetic Skincare Kit (6-Piece Set)';
  if (name.includes('the fame')) return 'Cosmetic Skincare Kit (5-Piece Set)';
  if (name.includes('hydra brightening')) return 'Hydrating Skincare Kit (2-Piece Set)';
  if (name.includes('snow dark spot') || name.includes('spot corrector')) return 'Skin Tone Brightening Corrector';
  if (name.includes('eyeliner')) return 'EyeLiner';
  if (name.includes('concealer')) return 'Concealer';
  if (name.includes('air pact')) return 'Compact Face Powder';
  if (name.includes('toothpaste')) return 'Oral Care Toothpaste (Propolis)';
  if (name.includes('toothbrush')) return 'Oral Care Toothbrush';
  if (name.includes('scalpcare') && name.includes('set')) return 'Scalp Care Hair Set (2 Pcs)';
  if (name.includes('scalpcare') || name.includes('shampoo')) return 'Hair Care Shampoo';
  if (name.includes('conditioner')) return 'Hair Care Conditioner';
  if (name.includes('hair tonic')) return 'Hair Scalp Tonic';
  if (name.includes('hair treatment')) return 'Hair Care Treatment';
  if (name.includes('hair essential oil') || name.includes('hair oil')) return 'Hair Essential Oil';
  if (name.includes('body cleanser') || name.includes('body wash')) return 'Herbal Body Cleanser';
  if (name.includes('body lotion') || name.includes('body care')) return 'Body Moisturizing Lotion';
  if (name.includes('hand soap')) return 'Antibacterial Liquid Hand Soap';
  if (name.includes('spirulina')) return 'Health Supplement (Spirulina Capsules)';
  if (name.includes('shilajit')) return 'Health Supplement (Shilajit Extract Capsules)';
  if (name.includes('omega')) return 'Health Supplement (Omega-3 Softgels)';
  if (name.includes('milk thistle') || name.includes('rhodiola')) return 'Health Supplement (Milk Thistle Capsules)';
  if (name.includes('noni')) return 'Health Drink (Fermented Noni Extract)';
  if (name.includes('pomegranate')) return 'Health Fruit Jelly Supplement';
  if (name.includes('moringa')) return 'Health Supplement (Moringa Capsules)';
  if (name.includes('pu\'er') || name.includes('tea')) return 'Packaged Tea (Pu\'er Tea Extract)';
  if (name.includes('cafe arabica') || name.includes('coffee')) return 'Instant Coffee (100% Arabica)';
  if (name.includes('seaweed') || name.includes('laver')) return 'Roasted Seasoned Seaweed Snack';
  if (name.includes('ramen')) return 'Instant Vegetarian Noodles';
  if (name.includes('protein shake') || name.includes('soy protein')) return 'Dietary Protein Shake Mix';
  if (name.includes('soybean paste')) return 'Fermented Soybean Paste (Doenjang)';
  if (name.includes('dish detergent')) return 'Dishwashing Liquid Detergent';
  if (name.includes('fabric detergent')) return 'Liquid Laundry Detergent';
  if (name.includes('softener')) return 'Fabric Softener';
  if (name.includes('scrubber')) return 'Kitchen Cleaning Scrubber';
  if (name.includes('latex gloves')) return 'Natural Rubber Household Gloves';
  if (name.includes('wok') || name.includes('cookware')) return 'Stainless Steel Cookware Wok';
  if (name.includes('paper towel')) return 'Multipurpose Kitchen Paper Towels';
  if (name.includes('bag')) return 'Shopping Carry Bag';
  if (name.includes('catalog') || name.includes('notebook')) return 'Printed Product Catalog';

  // Category based defaults
  if (cat.includes('beauty')) return 'Cosmetic Skincare Product';
  if (cat.includes('health') || cat.includes('hemohim')) return 'Health Supplement';
  if (cat.includes('food')) return 'Packaged Gourmet Food';
  if (cat.includes('personal_care')) return 'Personal Hygiene / Daily Care';
  if (cat.includes('home')) return 'Household Cleaning / Living Essential';
  return 'Consumer Lifestyle Essential';
}

export function getProductDetailConfig(product) {
  if (!product) return getDefaultConfig('Product');
  const raw = resolveRawConfig(product);
  const official = getOfficialProductDetails(product.id, product.name);
  raw.officialData = official;

  // Guarantee standard official Legal Metrology & Regulatory fields for all products:
  if (!raw.specs) raw.specs = {};
  if (!raw.specs.brandExportedBy) {
    raw.specs.brandExportedBy = "Atomy Co., Ltd., 2148-21, Baekjemunhwa-ro, Gongju-si, Chungcheongnam-do, Republic of Korea";
  }
  if (!raw.specs.manufacturer) {
    const cat = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    if (cat.includes('beauty') || name.includes('skincare') || name.includes('sunscreen') || name.includes('cream')) {
      raw.specs.manufacturer = "Kolmar Korea Co., Ltd., 12-11, Deokgogae-gil, Jeonui-myeon, Sejong-si, Republic of Korea";
    } else if (cat.includes('health') || name.includes('hemohim')) {
      raw.specs.manufacturer = "KOLMAR BNH CO., LTD., Sejong-si 22-15, Sandan-gil, Jeonui-myeon, 30003 Sejong-si, Republic of Korea";
    } else if (name.includes('toothbrush')) {
      raw.specs.manufacturer = "DEOTECH Co., Ltd., 13, Gamasil-gil, Yeongin-myeon, Asan-si, Chungcheongnam-do, Republic of Korea";
    } else if (name.includes('toothpaste') || cat.includes('personal_care')) {
      raw.specs.manufacturer = "Kolmar Korea Co., Ltd., 12-11, Deokgogae-gil, Jeonui-myeon, Sejong-si, Republic of Korea";
    } else {
      raw.specs.manufacturer = "Kolmar Korea Co., Ltd. / Atomy Co., Ltd., Republic of Korea";
    }
  }
  if (!raw.specs.importedMarketedBy) {
    raw.specs.importedMarketedBy = "Atomy Enterprise India Pvt. Ltd., L-19, LGF, Kalkaji, New Delhi - 110019, India";
  }
  if (!raw.specs.countryOfOrigin) {
    raw.specs.countryOfOrigin = "Republic of Korea";
  }
  raw.specs.genericName = PRODUCT_GENERIC_NAME_MAP[product.id] || getGenericName(product);

  if (official?.volumeDesc && (!raw.specs.netVolume || raw.specs.netVolume.includes('Standard Factory Sealed'))) {
    raw.specs.netVolume = official.volumeDesc;
  }
  return raw;
}

function resolveRawConfig(product) {
  const name = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  const id = product.id || '';

  // 1. HEMOHIM (D00101)
  if (id === 'D00101' || name.includes('hemohim')) {
    return {
      specs: {
        brandExportedBy: "Atomy Co., Ltd., 2148-21, Baekjemunhwa-ro, Gongju-si, Chungcheongnam-do, Republic of Korea",
        manufacturer: "KOLMAR BNH CO., LTD., Sejong-si 22-15, Sandan-gil, Jeonui-myeon, 30003 Sejong-si, Republic of Korea",
        importedMarketedBy: "Atomy Enterprise India Pvt. Ltd., L-19, LGF, Kalkaji, New Delhi - 110019, India",
        countryOfOrigin: "Republic of Korea",
        netVolume: "1,200 ml (20 ml × 60 Liquid Packets)",
        productType: "Food Supplement (Health Supplement for Adults)",
        storage: "Store in a cool, dry place away from direct sunlight. Consume immediately after opening.",
        expiration: "24 months from date of manufacturing",
        licenseNumber: "FSSAI Lic. No. 10019011006760",
        cautions: [
          "Not to exceed the stated recommended daily usage.",
          "Consult medical care practitioner for consumption beyond 4 months.",
          "This product is not intended to diagnose, treat, cure or prevent any disease.",
          "The product is not to be used by pregnant, nursing and lactating women or by infants, children, adolescents and elderly, except when medically advised.",
          "People on any medication or having any allergies are advised to consult their doctors or their medical practitioners before consuming the product.",
          "Not for parenteral use. Keep out of reach of children."
        ],
        contact: "Atomy Enterprise India Pvt. Ltd., Magnum Tower 2, Sector 58, Gurugram 122011, Haryana. Email: atomy_in@atomypark.com | Tel: +91-124-695-9000"
      }
    };
  }

  // 2. BEAUTY & SKINCARE (Absolute Skincare, Evening Care, Sunscreen, The Fame, Hydra)
  if (cat.includes('beauty') || name.includes('skincare') || name.includes('sunscreen') || name.includes('evening care') || name.includes('cream') || name.includes('cleanser') || name.includes('hydra')) {
    const isEveningCare = name.includes('evening care');
    const isSunscreen = name.includes('sunscreen');
    const isAbsolute = name.includes('absolute');

    return {
      specs: {
        brandExportedBy: "Atomy Co., Ltd., 2148-21, Baekjemunhwa-ro, Gongju-si, Chungcheongnam-do, Republic of Korea",
        manufacturer: "Kolmar Korea Co., Ltd., 12-11, Deokgogae-gil, Jeonui-myeon, Sejong-si, Republic of Korea",
        importedMarketedBy: "Atomy Enterprise India Pvt. Ltd., L-19, LGF, Kalkaji, New Delhi - 110019, India",
        countryOfOrigin: "Republic of Korea",
        netVolume: isEveningCare ? "4-Step System (Deep Cleanser 150ml, Foam Cleanser 150ml, Peeling Gel 120ml, Peel-off Mask 120ml)" : isSunscreen ? "60 ml (SPF50+ PA+++)" : isAbsolute ? "6-Piece Set (Toner 150ml, Ampoule 40ml, Serum 50ml, Lotion 135ml, Eye Complex 40ml, Nutrition Cream 50ml)" : "Standard Factory Sealed Retail Pack",
        productType: "Cosmetics / High-Performance Skincare",
        storage: "Store in a cool, dry place away from direct sunlight and extreme temperatures (10°C~30°C).",
        expiration: "30 months from date of manufacturing (12 months after opening)",
        licenseNumber: "CDSCO Cosmetic Registration Certificate No. COS-002148",
        cautions: [
          "For external cosmetic use only.",
          "Discontinue use immediately and consult a dermatologist if redness, swelling, itching, or irritation develops.",
          "Avoid direct contact with eyes. Rinse immediately with clean lukewarm water if contact occurs.",
          "Do not apply on broken, infected, or eczema-prone skin.",
          "Keep cap tightly closed after each application. Keep out of reach of children."
        ],
        contact: "Atomy Enterprise India Pvt. Ltd., Magnum Tower 2, Sector 58, Gurugram 122011, Haryana. Email: atomy_in@atomypark.com | Tel: +91-124-695-9000"
      }
    };
  }

  // 3. FOOD ESSENTIALS (Cafe Arabica, Seaweed, Ramen)
  if (cat.includes('food') || name.includes('cafe') || name.includes('seaweed') || name.includes('ramen') || name.includes('paste')) {
    return {
      specs: {
        brandExportedBy: "Atomy Co., Ltd., 2148-21, Baekjemunhwa-ro, Gongju-si, Chungcheongnam-do, Republic of Korea",
        manufacturer: "Atomy Food Partners Co., Ltd., South Korea",
        importedMarketedBy: "Atomy Enterprise India Pvt. Ltd., L-19, LGF, Kalkaji, New Delhi - 110019, India",
        countryOfOrigin: "Republic of Korea",
        netVolume: "Standard Sealed Food Grade Pack",
        productType: "Packaged Gourmet Food & Beverage",
        storage: "Store in a cool, dry place away from moisture and direct sunlight. Keep sealed once opened.",
        expiration: "12 to 18 months from date of manufacturing",
        licenseNumber: "FSSAI Lic. No. 10019011006760",
        cautions: [
          "Store away from direct sunlight, high temperature, and humidity.",
          "Consume promptly after opening package or keep sealed in an airtight container.",
          "Please check the ingredients list if you have known food allergies (sesame, soy, wheat).",
          "FSSAI compliant for direct consumer food safety."
        ],
        contact: "Atomy Enterprise India Pvt. Ltd., Magnum Tower 2, Sector 58, Gurugram 122011, Haryana. Email: atomy_in@atomypark.com | Tel: +91-124-695-9000"
      }
    };
  }

  // 4. PERSONAL CARE (Toothpaste, Toothbrush, Scalp Care, Body)
  if (cat.includes('personal') || name.includes('toothpaste') || name.includes('toothbrush') || name.includes('shampoo') || name.includes('body')) {
    const isOral = name.includes('tooth');
    const isShampoo = name.includes('shampoo') || name.includes('scalp');

    return {
      specs: {
        genericName: isShampoo ? "Hair Care" : (isOral ? "Oral Care" : "Body Care"),
        brandExportedBy: "Atomy Co., Ltd., 2148-21, Baekjemunhwa-ro, Gongju-si, Chungcheongnam-do-(South Korea)",
        manufacturer: isShampoo ? "Kolmar Korea Co., Ltd 22-17, Sandan-gil, Jeonui-myeon, Sejong-si, Korea" : "Kolmar Korea Co., Ltd., Republic of Korea",
        importedMarketedBy: "Atomy Enterprise India Pvt. Ltd. L-19, LGF, Kalkaji, New Delhi-110 019, India",
        countryOfOrigin: "Republic of Korea",
        directions: isShampoo ? "After Shampooing, Massage into scalp and hair, Rinse thoroughly" : undefined,
        netVolume: isOral ? "Toothpaste (200g × 5 Large Tubes) / Toothbrush (8 Pcs Compact Set)" : "500 mL Family Pump Dispenser",
        productType: "Personal Hygiene / Natural Daily Care",
        storage: "Store at room temperature. Avoid direct exposure to sunlight.",
        expiration: isShampoo ? "24 months from date of manufacture" : "36 months from date of manufacturing",
        licenseNumber: "CDSCO Cosmetic & Personal Care Registration No. COS-002148",
        cautions: isShampoo ? [
          "- For External Use only.",
          "- Avoid getting in eyes. In case of eye contact. Rinse immediately with water.",
          "- If redness /rash, itching or irritation occurs, discontinue use and consult a physician.",
          "- Keep out of reach of children.",
          "- Store at room temperature. Avoid direct exposure to sunlight."
        ] : [
          isOral ? "For oral care use only. Supervise children under 6 years to minimize swallowing." : "For external hygiene use only.",
          "If irritation develops, discontinue use and consult a healthcare specialist.",
          "Keep cap closed tightly after use. Keep out of reach of infants."
        ],
        contact: "Atomy Enterprise India Pvt. Ltd.\nAddress: 801-802, 8th floor, Magnum Tower – 2, Sector – 58, Golf Course Ext. Road, Gurgaon 122 011, Haryana, India\nEmail us at: atomy_in@atomypark.com\nTel.No.: +91-124- 695-9000"
      }
    };
  }

  // 5. DEFAULT / OTHER PRODUCTS
  return getDefaultConfig(product.name || 'Atomy Product');
}

function getDefaultConfig(name) {
  return {
    specs: {
      brandExportedBy: "Atomy Co., Ltd., 2148-21, Baekjemunhwa-ro, Gongju-si, Chungcheongnam-do, Republic of Korea",
      manufacturer: "Kolmar BNH / Kolmar Korea Co., Ltd., Republic of Korea",
      importedMarketedBy: "Atomy Enterprise India Pvt. Ltd., L-19, LGF, Kalkaji, New Delhi - 110019, India",
      countryOfOrigin: "Republic of Korea",
      netVolume: "Standard Factory Sealed Retail Pack",
      productType: "Premium Consumer Lifestyle Essential",
      storage: "Store in a cool, dry place away from direct sunlight and moisture.",
      expiration: "24 months from date of manufacturing",
      licenseNumber: "Atomy India Regulatory Compliance Certified",
      cautions: [
        "Follow product directions as indicated on packaging.",
        "Store in a cool, dry place away from direct sunlight.",
        "Keep out of reach of children."
      ],
      contact: "Atomy Enterprise India Pvt. Ltd., Magnum Tower 2, Sector 58, Gurugram 122011, Haryana. Email: atomy_in@atomypark.com | Tel: +91-124-695-9000"
    }
  };
}
