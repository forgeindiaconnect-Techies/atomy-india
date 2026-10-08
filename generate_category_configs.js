const fs = require('fs');

// Read existing mockData.js
const mockDataPath = 'atomy_india-frontend/src/data/mockData.js';
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

// Build product registry
const pMap = new Map();
const blockRegex = /\{\s*id:\s*["']([A-Za-z0-9]+)["'][\s\S]*?formattedPrice:\s*["']([^"']+)["'][\s\S]*?image:\s*["']([^"']+)["'][\s\S]*?\}/g;
let bm;
while ((bm = blockRegex.exec(mockDataContent)) !== null) {
  const block = bm[0];
  const idMatch = block.match(/id:\s*["']([A-Za-z0-9]+)["']/);
  const nameMatch = block.match(/name:\s*["']([^"']+)["']/);
  const priceMatch = block.match(/price:\s*([0-9.]+)/);
  const fPriceMatch = block.match(/formattedPrice:\s*["']([^"']+)["']/);
  const imgMatch = block.match(/image:\s*["']([^"']+)["']/);
  const likesMatch = block.match(/likes:\s*["']?([0-9]+(?:\s*Likes)?)["']?/);
  const tagsMatch = block.match(/tags:\s*\[([\s\S]*?)\]/);
  const gstMatch = block.includes('gstReduced: true');
  const vegMatch = block.includes('isVeg: true');
  const nonVegMatch = block.includes('isNonVeg: true');

  if (idMatch && nameMatch && !pMap.has(idMatch[1])) {
    const id = idMatch[1];
    const tags = tagsMatch ? [...tagsMatch[1].matchAll(/["']([^"']+)["']/g)].map(x => x[1]) : [];
    pMap.set(id, {
      id,
      name: nameMatch[1],
      price: priceMatch ? parseFloat(priceMatch[1]) : 0,
      formattedPrice: fPriceMatch ? fPriceMatch[1] : `₹ ${priceMatch ? priceMatch[1] : 0}`,
      image: imgMatch ? imgMatch[1] : '',
      likes: likesMatch ? (likesMatch[1].includes('Likes') ? likesMatch[1] : `${likesMatch[1]} Likes`) : '180 Likes',
      tags,
      gstReduced: gstMatch,
      isVeg: vegMatch,
      isNonVeg: nonVegMatch
    });
  }
}

// Add any missing from officialProductDetails
const officialDetails = JSON.parse(fs.readFileSync('atomy_india-frontend/src/data/officialProductDetails.json', 'utf8'));
for (const [k, off] of Object.entries(officialDetails)) {
  if (!pMap.has(k)) {
    pMap.set(k, {
      id: k,
      name: off.name,
      price: off.price || 1000,
      formattedPrice: `₹ ${(off.price || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      image: off.baseImage || `https://image.atomy.com/IN/goods/${k}/${k}_00.jpg`,
      likes: '160 Likes',
      tags: [],
      gstReduced: false,
      isVeg: false,
      isNonVeg: false
    });
  }
}

const categoriesDef = {
  health: {
    id: "health",
    dispCtgNo: "2510004178",
    name: "HEALTH",
    banners: [
      {
        title: "Atomy Nutraceutical Mix",
        subtitle: "The Daily Mix for a Happy Gut",
        image: "https://image.atomy.com/IN/banner/90/488/251100000021488134323.jpg",
        bgColor: "#b2d4e2"
      },
      {
        title: "Atomy 100% Pure Spirulina",
        subtitle: "Purity From The Pristine Environment",
        image: "https://image.atomy.com/IN/goods/D90178/org/880/260422000051880.jpeg?w=480&h=480",
        bgColor: "#cce4d8"
      },
      {
        title: "Atomy Shilajit Himalayan Gold",
        subtitle: "Ancient Ayurvedic Power for Daily Stamina",
        image: "https://image.atomy.com/IN/goods/D94085/org/907/260422000051907.jpeg?w=480&h=480",
        bgColor: "#d5dfeb"
      }
    ],
    subcategories: ["All", "Immunity", "Omega-3", "Vitality & Liver", "Specialty"],
    bestProductIds: ["D90178", "D04086", "D94085", "D00111", "D00174", "D00171", "D00160", "D04006", "D00170", "D07116"],
    products: [
      { id: "D90178", subTopic: "Immunity", tags: ["#GST REDUCED", "#IMMUNITY", "#SUPERFOOD"] },
      { id: "D94084", subTopic: "Immunity", tags: ["#SPIRULINA", "#ORGANIC", "#SUPERFOOD"] },
      { id: "D04086", subTopic: "Immunity", tags: ["#GST REDUCED", "#MORINGA", "#AYURVEDA"] },
      { id: "D00160", subTopic: "Immunity", tags: ["#GUT HEALTH", "#PROBIOTICS", "#IMMUNITY"] },
      { id: "D00111", subTopic: "Omega-3", tags: ["#OMEGA3", "#HEART CARE", "#EYE HEALTH"] },
      { id: "D04006", subTopic: "Omega-3", tags: ["#ALGAE OMEGA", "#VEGAN", "#BRAIN HEALTH"] },
      { id: "D94085", subTopic: "Vitality & Liver", tags: ["#GST REDUCED", "#SHILAJIT", "#STAMINA"] },
      { id: "D00174", subTopic: "Vitality & Liver", tags: ["#LIVER SUPPORT", "#MILK THISTLE", "#DETOX"] },
      { id: "D00171", subTopic: "Vitality & Liver", tags: ["#RHODIOLA", "#ENERGY", "#LIVER CARE"] },
      { id: "D00170", subTopic: "Specialty", tags: ["#ORGANIC NONI", "#FERMENTED JUICE", "#VITALITY"] },
      { id: "D07116", subTopic: "Specialty", tags: ["#TOTAL WELLNESS", "#COMBO PACK", "#COMPLETE CARE"] }
    ]
  },
  hemohim: {
    id: "hemohim",
    dispCtgNo: "2510004179",
    name: "HemoHIM",
    banners: [
      {
        title: "Atomy HemoHIM",
        subtitle: "Immunity Up! Fatigue Down!!",
        image: "https://image.atomy.com/IN/banner/90/469/25110000002146913231.jpg",
        bgColor: "#e5ecec"
      },
      {
        title: "HemoHIM 4-Set Mega Value Pack",
        subtitle: "Best Choice for Healthy Family Immunity",
        image: "https://image.atomy.com/IN/goods/D00104/D00104_00.jpg?w=480&h=480",
        bgColor: "#eae6df"
      },
      {
        title: "HemoHIM Global Edition",
        subtitle: "Loved by Over 16 Million Members Worldwide",
        image: "https://image.atomy.com/IN/goods/D00101/D00101_00.jpg?w=480&h=480",
        bgColor: "#e8eff2"
      }
    ],
    subcategories: ["All", "HemoHIM Sets", "Global Edition", "Special Packs"],
    bestProductIds: ["D00101", "D00104", "D00105", "D00102", "D00106", "D00107", "D00108", "D00109"],
    products: [
      { id: "D00101", subTopic: "HemoHIM Sets", tags: ["#FLAGSHIP", "#IMMUNITY", "#PATENTED HERBAL"] },
      { id: "D00104", subTopic: "HemoHIM Sets", tags: ["#FAMILY PACK", "#VALUE SET", "#IMMUNE SUPPORT"] },
      { id: "D00105", subTopic: "HemoHIM Sets", tags: ["#2 SET", "#COMBO VALUE", "#HEALTH"] },
      { id: "D00102", subTopic: "Global Edition", tags: ["#GLOBAL STANDARD", "#60 SACHETS", "#INTERNATIONAL"] },
      { id: "D00106", subTopic: "Special Packs", tags: ["#BOOSTER", "#SPECIAL FORMULA", "#ENERGY"] },
      { id: "D00107", subTopic: "Special Packs", tags: ["#GIFT EDITION", "#PREMIUM BOX", "#WELLNESS"] },
      { id: "D00108", subTopic: "Special Packs", tags: ["#TRAVEL PACK", "#ON THE GO", "#CONVENIENT"] },
      { id: "D00109", subTopic: "Special Packs", tags: ["#DAILY EDITION", "#EVERYDAY WELLNESS", "#VITALITY"] }
    ]
  },
  beauty: {
    id: "beauty",
    dispCtgNo: "2510004176",
    name: "BEAUTY",
    banners: [
      {
        title: "Atomy Absolute Skincare",
        subtitle: "Recapture The Skin of Your Youth",
        image: "https://image.atomy.com/IN/banner/90/490/25110000002149013557.jpg",
        bgColor: "#f5f0eb"
      },
      {
        title: "Atomy The Fame",
        subtitle: "Your Complete 5-Step Path to Radiance",
        image: "https://image.atomy.com/IN/banner/90/492/25110000002149213577.jpg",
        bgColor: "#eceef5"
      },
      {
        title: "Atomy Evening Care 4 Set",
        subtitle: "Home Aesthetic 365 Days a Year",
        image: "https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480",
        bgColor: "#f3f5f8"
      }
    ],
    subcategories: ["All", "Absolute Series", "The Fame", "Cleansing & Mask", "Sun Care", "Makeup"],
    bestProductIds: ["D00354", "D00282", "D00281", "D00757", "D00207", "D00003", "D00227", "D01513", "D01526", "D00396"],
    products: [
      { id: "D00207", subTopic: "Absolute Series", tags: ["#CELLACTIVE", "#LUXURY ANTI-AGING", "#6 SET"] },
      { id: "D00217", subTopic: "Absolute Series", tags: ["#TONER", "#SOOTHING", "#CELLACTIVE"] },
      { id: "D00227", subTopic: "Absolute Series", tags: ["#AMPOULE", "#HIGH CONCENTRATE", "#YOUTH"] },
      { id: "D00237", subTopic: "Absolute Series", tags: ["#SERUM", "#ELASTICITY", "#NOURISHING"] },
      { id: "D00247", subTopic: "Absolute Series", tags: ["#LOTION", "#HYDRATION BALANCE", "#SOFTENING"] },
      { id: "D00257", subTopic: "Absolute Series", tags: ["#EYE COMPLEX", "#WRINKLE CARE", "#FIRMNESS"] },
      { id: "D00267", subTopic: "Absolute Series", tags: ["#NUTRITION CREAM", "#LIFTING", "#RICH TEXTURE"] },
      { id: "D01513", subTopic: "Absolute Series", tags: ["#24K GOLD", "#SLEEPING MASK", "#REJUVENATION"] },
      { id: "D01526", subTopic: "Absolute Series", tags: ["#SNOW SPOT", "#BRIGHTENING", "#DARK SPOT CARE"] },
      { id: "D00003", subTopic: "The Fame", tags: ["#5-STEP SKINCARE", "#HYDRATING", "#UNFADING BEAUTY"] },
      { id: "D00351", subTopic: "Cleansing & Mask", tags: ["#4 SET", "#HOME AESTHETIC", "#DEEP CLEANSING"] },
      { id: "D00354", subTopic: "Cleansing & Mask", tags: ["#FOAM CLEANSER", "#RICH LATHER", "#HYDRATING"] },
      { id: "D00757", subTopic: "Cleansing & Mask", tags: ["#HYDRA BRIGHTENING", "#CAPSULE ESSENCE", "#CREAM"] },
      { id: "D00281", subTopic: "Sun Care", tags: ["#SPF50+", "#BEIGE TINT", "#UV SHIELD"] },
      { id: "D00282", subTopic: "Sun Care", tags: ["#SPF50+", "#WHITE CLEAR", "#NO STICKINESS"] },
      { id: "D00396", subTopic: "Makeup", tags: ["#AIR PACT #21", "#VELVET FINISH", "#SEBUM CONTROL"] },
      { id: "D01440", subTopic: "Makeup", tags: ["#EYELINER", "#WATERPROOF", "#PRECISION TIP"] },
      { id: "D04704", subTopic: "Makeup", tags: ["#CONCEALER", "#BEIGE", "#BLEMISH COVERAGE"] }
    ]
  },
  food: {
    id: "food",
    dispCtgNo: "2510004177",
    name: "FOOD",
    banners: [
      {
        title: "Atomy Cafe Arabica 100%",
        subtitle: "Rich Aroma of Finest Arabica Beans",
        image: "https://image.atomy.com/IN/goods/D00975/org/172/260422000052172.jpeg?w=480&h=480",
        bgColor: "#f0e9df"
      },
      {
        title: "Atomy Pomegranate Mixed Fruit Jelly",
        subtitle: "The Antioxidant Snack for Radiant Skin",
        image: "https://image.atomy.com/IN/banner/90/473/251100000021473134722.jpg",
        bgColor: "#faeee7"
      },
      {
        title: "Atomy Premium Food Selection",
        subtitle: "Pure, Natural Taste Delivered to Your Home",
        image: "https://image.atomy.com/IN/goods/D00180/D00180_00.jpg?w=480&h=480",
        bgColor: "#f4f1ea"
      }
    ],
    subcategories: ["All", "Tea & Coffee", "Healthy Snacks", "Nourishment"],
    bestProductIds: ["D00980", "D00975", "D00180", "D00902", "D00915", "D00921", "D00930", "D00985", "D00990", "D00940"],
    products: [
      { id: "D00980", subTopic: "Tea & Coffee", tags: ["#100% ARABICA", "#INSTANT COFFEE", "#RICH AROMA"] },
      { id: "D00975", subTopic: "Tea & Coffee", tags: ["#BLACK COFFEE", "#ARABICA BEANS", "#DEEP FLAVOR"] },
      { id: "D00901", subTopic: "Tea & Coffee", tags: ["#CAFE ARABICA 50T", "#PREMIUM COFFEE", "#FRESH BLEND"] },
      { id: "D00915", subTopic: "Tea & Coffee", tags: ["#ORGANIC GREEN TEA", "#JEJU ISLAND", "#HEALTHY SIP"] },
      { id: "D00990", subTopic: "Tea & Coffee", tags: ["#RED GINSENG TEA", "#VITALITY", "#TRADITIONAL KOREAN"] },
      { id: "D00902", subTopic: "Healthy Snacks", tags: ["#CRISPY LAVER", "#HEALTHY SNACK", "#ALMOND & GRAINS"] },
      { id: "D00921", subTopic: "Healthy Snacks", tags: ["#SEASONED SEAWEED", "#ROASTED", "#MINERAL RICH"] },
      { id: "D00930", subTopic: "Healthy Snacks", tags: ["#OLIVE OIL LAVER", "#CRUNCHY", "#NUTRIENT PACKED"] },
      { id: "D00180", subTopic: "Healthy Snacks", tags: ["#POMEGRANATE JELLY", "#ELLAGIC ACID", "#BEAUTY FOOD"] },
      { id: "D00183", subTopic: "Healthy Snacks", tags: ["#POMEGRANATE 2 SET", "#ANTIOXIDANT", "#TASTY CHEW"] },
      { id: "D00985", subTopic: "Nourishment", tags: ["#SOY PROTEIN", "#MEAL REPLACEMENT", "#GRAIN SHAKE"] },
      { id: "D00940", subTopic: "Nourishment", tags: ["#BLACK BEAN PASTE", "#TRADITIONAL RECIPE", "#NUTRITIOUS"] }
    ]
  },
  personal_care: {
    id: "personal_care",
    dispCtgNo: "2510004175",
    name: "PERSONAL CARE",
    banners: [
      {
        title: "Atomy Toothpaste",
        subtitle: "Propolis Protection. Natural Freshness.",
        image: "https://image.atomy.com/IN/banner/90/471/251100000021471133613.jpg",
        bgColor: "#e6f4fc"
      },
      {
        title: "Oral Care System",
        subtitle: "The Quality You Trust for Daily Oral Care.",
        image: "https://image.atomy.com/IN/banner/90/450/251100000021450133717.jpg",
        bgColor: "#ebf2f8"
      },
      {
        title: "Body Lotion",
        subtitle: "Lock in Moisture. Live in Softness.",
        image: "https://image.atomy.com/IN/banner/90/482/251100000021482134028.jpg",
        bgColor: "#f4f1eb"
      }
    ],
    subcategories: ["All", "Oral Care", "Hair & Scalp", "Body Care"],
    bestProductIds: ["D00501", "D00510", "D00601", "D00691", "D00693", "D00620", "D00681", "D00631", "D00650", "D00860"],
    products: [
      { id: "D00501", subTopic: "Oral Care", tags: ["#PROPOLIS", "#5 TUBES SET", "#PLAQUE CARE"] },
      { id: "D00510", subTopic: "Oral Care", tags: ["#SUPER SLIM BRISTLE", "#99.9% GOLD ANTIBACTERIAL", "#8 PCS"] },
      { id: "D00693", subTopic: "Hair & Scalp", tags: ["#SCALPCARE 2 SET", "#SHAMPOO & CONDITIONER", "#SPA"] },
      { id: "D00691", subTopic: "Hair & Scalp", tags: ["#AYURVEDIC HERBS", "#CLEAN PORES", "#DANDRUFF CARE"] },
      { id: "D00681", subTopic: "Hair & Scalp", tags: ["#ARGAN OIL", "#SHINE & MOISTURE", "#SPLIT ENDS"] },
      { id: "D00661", subTopic: "Hair & Scalp", tags: ["#HERBAL CONDITIONER", "#SILKY HAIR", "#NATURAL GLOSS"] },
      { id: "D00620", subTopic: "Hair & Scalp", tags: ["#HAIR TONIC", "#ROOT NOURISHMENT", "#COOLING"] },
      { id: "D00611", subTopic: "Hair & Scalp", tags: ["#HAIR TREATMENT", "#INTENSIVE REPAIR", "#DAMAGED HAIR"] },
      { id: "D00601", subTopic: "Hair & Scalp", tags: ["#HERBAL SHAMPOO", "#500ML", "#BOTANICAL FORMULA"] },
      { id: "D00602", subTopic: "Hair & Scalp", tags: ["#TREATMENT 200ML", "#HERBAL PROTEIN", "#SMOOTH HAIR"] },
      { id: "D00631", subTopic: "Body Care", tags: ["#BODY CLEANSER", "#FRESH HERBAL SCENT", "#HYDRATING"] },
      { id: "D00603", subTopic: "Body Care", tags: ["#BODY CLEANSER 500ML", "#GENTLE CLEANSING", "#FAMILY CARE"] },
      { id: "D00650", subTopic: "Body Care", tags: ["#RICH BODY LOTION", "#APPLE FRESH SCENT", "#24H MOISTURE"] },
      { id: "D00860", subTopic: "Body Care", tags: ["#HAND SOAP", "#ANTIBACTERIAL", "#PALM & COCONUT EXTRACT"] }
    ]
  },
  home: {
    id: "home",
    dispCtgNo: "2510004174",
    name: "HOME",
    banners: [
      {
        title: "Liquid Laundry Detergent",
        subtitle: "Making Every Fabric Feel Like New Again",
        image: "https://image.atomy.com/IN/banner/90/475/251100000021475134746.jpg",
        bgColor: "#edf3f8"
      },
      {
        title: "Dishwashing Liquid",
        subtitle: "Purity That Protects Your Hands and Your Home.",
        image: "https://image.atomy.com/IN/banner/90/486/251100000021486134317.jpg",
        bgColor: "#eef8f4"
      },
      {
        title: "Atomy Living Care",
        subtitle: "Eco-friendly, Non-toxic Cleaners For A Pure Home",
        image: "https://image.atomy.com/IN/goods/D00835/D00835_00.jpg?w=480&h=480",
        bgColor: "#f0f4f7"
      }
    ],
    subcategories: ["All", "Laundry Detergent", "Dish & Cleaners", "Kitchenware"],
    bestProductIds: ["D00805", "D00801", "D00820", "D00810", "D00870", "D00830", "D00840", "D00850", "D00804"],
    products: [
      { id: "D00801", subTopic: "Laundry Detergent", tags: ["#POWDER DETERGENT 2.4KG", "#ECO-FRIENDLY", "#FABRIC CARE"] },
      { id: "D00810", subTopic: "Laundry Detergent", tags: ["#LIQUID DETERGENT 2KG", "#NATURAL ENZYMES", "#STAIN REMOVAL"] },
      { id: "D00802", subTopic: "Laundry Detergent", tags: ["#FABRIC DETERGENT 2KG", "#PLANT EXTRACTS", "#GENTLE ON CLOTHES"] },
      { id: "D00830", subTopic: "Laundry Detergent", tags: ["#FABRIC SOFTENER 2KG", "#LONG LASTING FRAGRANCE", "#ANTI-STATIC"] },
      { id: "D00803", subTopic: "Laundry Detergent", tags: ["#FABRIC SOFTENER 2000ML", "#FLORAL FRESH", "#FABRIC CARE"] },
      { id: "D00820", subTopic: "Dish & Cleaners", tags: ["#CLASS 1 DISHWASH", "#FRUIT & VEG SAFE", "#SKIN FRIENDLY"] },
      { id: "D00870", subTopic: "Dish & Cleaners", tags: ["#ECO SCRUBBER", "#3 PACK", "#ANTIBACTERIAL"] },
      { id: "D00805", subTopic: "Dish & Cleaners", tags: ["#STAINLESS STEEL SCRUBBER", "#RUST RESISTANT", "#2 PCS"] },
      { id: "D00804", subTopic: "Dish & Cleaners", tags: ["#LATEX GLOVES", "#NATURAL RUBBER", "#COMFORT FIT"] },
      { id: "D00840", subTopic: "Kitchenware", tags: ["#MEDYCOOK WOK", "#316TI STAINLESS STEEL", "#5-PLY BASE"] },
      { id: "D00850", subTopic: "Kitchenware", tags: ["#MULTIPURPOSE PAPER TOWEL", "#ABSORBENT", "#KITCHEN ESSENTIAL"] }
    ]
  },
  others: {
    id: "others",
    dispCtgNo: "2510004180",
    name: "OTHERS",
    banners: [
      {
        title: "Atomy Business & Promotional Tools",
        subtitle: "Catalogs, Shopping Bags & Brand Essentials",
        image: "https://image.atomy.com/IN/goods/D07115/D07115_00.jpg?w=480&h=480",
        bgColor: "#f3f5f8"
      },
      {
        title: "Atomy Official Product Guide",
        subtitle: "Comprehensive Knowledge for Every Member",
        image: "https://image.atomy.com/IN/goods/D00553/D00553_00.jpg?w=480&h=480",
        bgColor: "#eef1f5"
      },
      {
        title: "Team Phoenix Business Starter Kit",
        subtitle: "Everything You Need to Succeed with Atomy",
        image: "https://image.atomy.com/IN/goods/D92445/D92445_00.jpg?w=480&h=480",
        bgColor: "#f8f4ec"
      }
    ],
    subcategories: ["All", "Shopping Bags", "Catalogs & Literature", "Business Materials"],
    bestProductIds: ["D09001", "D09002", "D09010", "D09011", "D09050", "D09020", "D09030", "D09040"],
    products: [
      { id: "D09001", subTopic: "Shopping Bags", tags: ["#NON-WOVEN", "#MEDIUM 10 PCS", "#ECO REUSABLE"] },
      { id: "D09002", subTopic: "Shopping Bags", tags: ["#NON-WOVEN", "#LARGE 10 PCS", "#DURABLE BAG"] },
      { id: "D09010", subTopic: "Catalogs & Literature", tags: ["#PRODUCT CATALOG", "#ENGLISH EDITION", "#FULL GUIDE"] },
      { id: "D09011", subTopic: "Catalogs & Literature", tags: ["#PRODUCT CATALOG", "#HINDI EDITION", "#PRODUCT DETAILS"] },
      { id: "D09020", subTopic: "Business Materials", tags: ["#NOTEBOOK & PEN", "#EXECUTIVE SET", "#OFFICE TOOLS"] },
      { id: "D09030", subTopic: "Business Materials", tags: ["#LAPEL PIN BADGE", "#ACADEMY PIN", "#BRAND IDENTITY"] },
      { id: "D09040", subTopic: "Business Materials", tags: ["#DISPLAY POUCH", "#SAMPLE CASE", "#ORGANIZER"] },
      { id: "D09050", subTopic: "Business Materials", tags: ["#STARTER KIT", "#TEAM PHOENIX", "#SUCCESS TOOLS"] }
    ]
  }
};

// All products collection
const allProductsArray = [];
for (const [catKey, catDef] of Object.entries(categoriesDef)) {
  for (const p of catDef.products) {
    const baseP = pMap.get(p.id);
    if (baseP) {
      allProductsArray.push({
        ...baseP,
        category: catDef.name,
        subTopic: p.subTopic,
        tags: p.tags && p.tags.length > 0 ? p.tags : baseP.tags
      });
    }
  }
}

console.log('Total products compiled for all categories:', allProductsArray.length);

// Generate CATEGORY_CONFIGS object string
function formatProduct(p, rank) {
  const pObj = {
    id: p.id,
    ...(rank ? { rank } : {}),
    name: p.name,
    price: p.price,
    formattedPrice: p.formattedPrice,
    image: p.image,
    likes: p.likes || '180 Likes',
    subTopic: p.subTopic || '',
    category: p.category || '',
    tags: p.tags || [],
    gstReduced: !!p.gstReduced,
    isVeg: !!p.isVeg,
    isNonVeg: !!p.isNonVeg
  };
  return JSON.stringify(pObj, null, 8).replace(/^ {8}/, '      ');
}

let out = 'export const CATEGORY_CONFIGS = {\n';

for (const [k, cat] of Object.entries(categoriesDef)) {
  out += `  ${k}: {\n`;
  out += `    id: "${cat.id}",\n`;
  out += `    dispCtgNo: "${cat.dispCtgNo}",\n`;
  out += `    name: "${cat.name}",\n`;
  out += `    banners: ${JSON.stringify(cat.banners, null, 6).replace(/\n/g, '\n    ')},\n`;
  out += `    subcategories: ${JSON.stringify(cat.subcategories)},\n`;
  
  // best products
  out += `    bestProducts: [\n`;
  const bestList = cat.bestProductIds.map((id, idx) => {
    const bp = pMap.get(id);
    const assigned = cat.products.find(x => x.id === id);
    return formatProduct({
      ...bp,
      category: cat.name,
      subTopic: assigned ? assigned.subTopic : '',
      tags: assigned ? assigned.tags : bp.tags
    }, idx + 1);
  });
  out += bestList.join(',\n') + '\n    ],\n';

  // all products
  out += `    allProducts: [\n`;
  const allList = cat.products.map(p => {
    const bp = pMap.get(p.id);
    return formatProduct({
      ...bp,
      category: cat.name,
      subTopic: p.subTopic,
      tags: p.tags
    });
  });
  out += allList.join(',\n') + '\n    ]\n';
  out += `  },\n`;
}

// Add all_products
out += `  all_products: {\n`;
out += `    id: "all_products",\n`;
out += `    dispCtgNo: "2510004181",\n`;
out += `    name: "ALL PRODUCTS",\n`;
out += `    banners: [\n`;
out += `      {\n`;
out += `        title: "Absolute Quality, Absolute Price",\n`;
out += `        subtitle: "Explore the Complete Range of Atomy Products",\n`;
out += `        image: "https://image.atomy.com/IN/banner/90/490/25110000002149013557.jpg",\n`;
out += `        bgColor: "#f4f1ec"\n`;
out += `      },\n`;
out += `      {\n`;
out += `        title: "Health & Immunity Champions",\n`;
out += `        subtitle: "HemoHIM, Spirulina, Shilajit and Beyond",\n`;
out += `        image: "https://image.atomy.com/IN/banner/90/469/25110000002146913231.jpg",\n`;
out += `        bgColor: "#e7ebeb"\n`;
out += `      },\n`;
out += `      {\n`;
out += `        title: "Premium Skincare & Daily Living",\n`;
out += `        subtitle: "K-Beauty Innovations & Natural Home Solutions",\n`;
out += `        image: "https://image.atomy.com/IN/banner/90/471/251100000021471133613.jpg",\n`;
out += `        bgColor: "#eaf2f7"\n`;
out += `      }\n`;
out += `    ],\n`;
out += `    subcategories: ["All", "HemoHIM", "HEALTH", "BEAUTY", "FOOD", "PERSONAL CARE", "HOME", "OTHERS"],\n`;

// top 10 best across all
const overallBestIds = ["D00101", "D90178", "D00207", "D00980", "D00501", "D00354", "D04086", "D00003", "D00801", "D00601"];
out += `    bestProducts: [\n`;
const overallBestList = overallBestIds.map((id, idx) => {
  const bp = allProductsArray.find(x => x.id === id) || pMap.get(id);
  return formatProduct(bp, idx + 1);
});
out += overallBestList.join(',\n') + '\n    ],\n';

out += `    allProducts: [\n`;
const allProdsFormatted = allProductsArray.map(p => formatProduct(p));
out += allProdsFormatted.join(',\n') + '\n    ]\n';
out += `  }\n`;
out += `};\n`;

fs.writeFileSync('generated_category_configs.js', out);
console.log('Saved generated_category_configs.js, size:', out.length);
