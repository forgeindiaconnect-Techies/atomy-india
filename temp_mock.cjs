const HERO_SLIDES = [
  {
    id: 1,
    title: "Atomy India Presents Mongsang Talk Show",
    subtitle: "Special Seminar & Direct Selling Vision",
    img: "https://image.atomy.com/IN/banner/50/201/26090000002720117430.png",
    bg: "#072044",
    textColor: "#ffffff",
    hasTextOverlay: false
  },
  {
    id: 2,
    title: "Paralympic Committee of India",
    subtitle: "Atomy India is Now Official Nutrition and Wellness Partner",
    img: "https://image.atomy.com/IN/banner/90/746/26090000002674618481.png",
    bg: "#ced3d6",
    textColor: "#222222",
    hasTextOverlay: false
  },
  {
    id: 3,
    title: "New Register Member Offer",
    subtitle: "Special Benefits for New Members",
    desc: "Flat ₹250 Discount Voucher On Your Very First Purchase",
    img: "https://image.atomy.com/IN/banner/90/210/26060000002521018925.png",
    bg: "#f3f5f8",
    textColor: "#222222",
    hasTextOverlay: false
  },
  {
    id: 4,
    title: "Atomy HemoHIM",
    subtitle: "Immunity Up! Fatigue Down!!",
    desc: "Patented Herbal Extract for Immune Support",
    img: "https://image.atomy.com/IN/banner/90/414/251100000021414132556.jpg",
    bg: "#e7ebeb",
    textColor: "#222222",
    hasTextOverlay: true
  },
  {
    id: 5,
    title: "Immunity UP Fatigue Down",
    subtitle: "Atomy HemoHim",
    desc: "Awaken your tired immune cells",
    img: "https://image.atomy.com/IN/banner/50/533/260500000024533213212.jpeg",
    bg: "#e5ecec",
    textColor: "#222222",
    hasTextOverlay: true
  },
  {
    id: 6,
    title: "Atomy Absolute Skincare",
    subtitle: "Recapture The Skin of Your Youth",
    desc: "Absolute CellActive Technology",
    img: "https://image.atomy.com/IN/banner/90/477/25110000002147714178.png",
    bg: "#f4f0ec",
    textColor: "#222222",
    hasTextOverlay: true
  },
  {
    id: 7,
    title: "Atomy Evening Care",
    subtitle: "Day Ends. Your Skin's Renewal Begins",
    desc: "4 Step Deep Cleansing Home Spa",
    img: "https://image.atomy.com/IN/banner/90/479/25110000002147914258.jpg",
    bg: "#f7fafc",
    textColor: "#222222",
    hasTextOverlay: true
  },
  {
    id: 8,
    title: "Atomy Shilajit Capsules",
    subtitle: "Unlock Your Peak Potential. Naturally",
    desc: "100% Pure Shilajit Extract with Fulvic Acid & Minerals",
    img: "https://image.atomy.com/IN/banner/90/495/251100000021495144311.jpg",
    bg: "#f0f4f8",
    textColor: "#222222",
    hasTextOverlay: true
  },
  {
    id: 9,
    title: "Atomy 100% PURE* Spirulina (India)",
    subtitle: "A Powerful Superfood with Essential Nutrients",
    desc: "Rich in Chlorophyll, Phycocyanin, Beta-Carotene & Antioxidants",
    img: "https://image.atomy.com/IN/banner/90/501/25110000002150115422.jpg",
    bg: "#eaf3ea",
    textColor: "#222222",
    hasTextOverlay: true
  }
];

const CATEGORIES = [
  {
    id: "personal_care",
    name: "PERSONAL CARE",
    icon: "https://image.atomy.com/IN/banner/90/790/251000000020790143920.svg",
    link: "#"
  },
  {
    id: "beauty",
    name: "BEAUTY",
    icon: "https://image.atomy.com/IN/banner/90/789/251000000020789143852.svg",
    link: "#"
  },
  {
    id: "food",
    name: "FOOD",
    icon: "https://image.atomy.com/IN/banner/90/794/251000000020794143823.svg",
    link: "#"
  },
  {
    id: "home",
    name: "HOME",
    icon: "https://image.atomy.com/IN/banner/90/795/251000000020795143948.svg",
    link: "#"
  },
  {
    id: "health",
    name: "HEALTH",
    icon: "https://image.atomy.com/IN/banner/90/788/251000000020788143752.svg",
    link: "#"
  },
  {
    id: "hemohim",
    name: "HemoHIM",
    icon: "https://image.atomy.com/IN/banner/90/793/25100000002079317317.svg",
    link: "#"
  },
  {
    id: "others",
    name: "OTHERS",
    icon: "https://image.atomy.com/IN/banner/90/801/251000000020801144016.svg",
    link: "#"
  },
  {
    id: "all_products",
    name: "ALL PRODUCTS",
    icon: "https://image.atomy.com/IN/banner/90/802/251000000020802144045.svg",
    link: "#"
  }
];

const BEST_PRODUCTS = [
  {
    id: "D00101",
    rank: 1,
    name: "HemoHIM *1set",
    originalPrice: 15000.0,
    formattedOriginalPrice: "₹ 15,000.00",
    price: 13000.0,
    formattedPrice: "₹ 13,000.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
    gstReduced: true,
    likes: 224,
    purchased: "1,219",
    addedToCart: "2,333",
    reviewsCount: 13,
    rating: 5.0,
    category: "health",
    tags: ["#GST REDUCED", "#Immunity"],
    freeDelivery: true,
    categoryTab: ["ALL", "BEST"]
  },
  {
    id: "D00207",
    rank: 2,
    name: "Absolute Skincare Set",
    originalPrice: 20000.0,
    formattedOriginalPrice: "₹ 20,000.00",
    price: 17000.0,
    formattedPrice: "₹ 17,000.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00207/org/036/260803000054036.jpg?w=480&h=480",
    gstReduced: false,
    likes: 103,
    tags: [],
    freeDelivery: true,
    categoryTab: ["ALL", "BEST"]
  },
  {
    id: "D00003",
    rank: 3,
    name: "The Fame Skincare Set (5 Pcs per Set)",
    originalPrice: 9100.0,
    formattedOriginalPrice: "₹ 9,100.00",
    price: 7735.0,
    formattedPrice: "₹ 7,735.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00003/D00003_00.jpg?w=480&h=480",
    gstReduced: false,
    likes: 51,
    tags: [],
    freeDelivery: true,
    categoryTab: ["ALL", "BEST"]
  },
  {
    id: "D00351",
    rank: 4,
    name: "Evening Care Set(4 Pcs per Set)",
    originalPrice: 3300.0,
    formattedOriginalPrice: "₹ 3,300.00",
    price: 2805.0,
    formattedPrice: "₹ 2,805.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480",
    gstReduced: false,
    likes: 245,
    tags: [],
    freeDelivery: false,
    categoryTab: ["ALL", "BEST"]
  },
  {
    id: "D00757",
    rank: 5,
    name: "Hydra Brightening Care Set (2 Pcs per Set)",
    originalPrice: 3000.0,
    formattedOriginalPrice: "₹ 3,000.00",
    price: 2550.0,
    formattedPrice: "₹ 2,550.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00757/D00757_00.jpg?w=480&h=480",
    gstReduced: false,
    likes: 222,
    tags: [],
    freeDelivery: false,
    categoryTab: ["ALL", "BEST"]
  },
  // NEW TAB ITEMS
  {
    id: "D01440",
    rank: null,
    name: "Brush Pen Eyeliner - Black",
    originalPrice: 900.0,
    formattedOriginalPrice: "₹ 900.00",
    price: 765.0,
    formattedPrice: "₹ 765.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D01440/org/810/260128000049810.jpg?w=480&h=480",
    gstReduced: false,
    likes: 42,
    tags: ["#NewArrival"],
    freeDelivery: false,
    categoryTab: ["NEW"]
  },
  {
    id: "D04704",
    rank: null,
    name: "Adelica Concealer - Beige",
    originalPrice: 900.0,
    formattedOriginalPrice: "₹ 900.00",
    price: 765.0,
    formattedPrice: "₹ 765.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D04704/org/115/260326000051115.jpeg?w=480&h=480",
    gstReduced: false,
    likes: 38,
    tags: ["#MakeupEssential"],
    freeDelivery: false,
    categoryTab: ["NEW"]
  },
  {
    id: "D01526",
    rank: null,
    name: "Atomy Absolute Snow Dark Spot Corrector",
    originalPrice: 1200.0,
    formattedOriginalPrice: "₹ 1,200.00",
    price: 1020.0,
    formattedPrice: "₹ 1,020.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D01526/org/447/251119000048447.jpg?w=480&h=480",
    gstReduced: false,
    likes: 89,
    tags: ["#Brightening"],
    freeDelivery: false,
    categoryTab: ["NEW"]
  },
  {
    id: "D00396",
    rank: null,
    name: "Atomy Air Pact #21",
    originalPrice: 1900.0,
    formattedOriginalPrice: "₹ 1,900.00",
    price: 1615.0,
    formattedPrice: "₹ 1,615.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00396/org/441/251119000048441.jpg?w=480&h=480",
    gstReduced: true,
    likes: 67,
    tags: ["#GST REDUCED"],
    freeDelivery: false,
    categoryTab: ["NEW"]
  },
  // RECOMMENDATION TAB ITEMS
  {
    id: "D00170",
    rank: null,
    name: "Atomy Noni Drink",
    originalPrice: 5900.0,
    formattedOriginalPrice: "₹ 5,900.00",
    price: 5015.0,
    formattedPrice: "₹ 5,015.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00170/org/350/260401000051350.jpg?w=480&h=480",
    gstReduced: true,
    likes: 184,
    tags: ["#GST REDUCED", "#Immunity"],
    freeDelivery: true,
    categoryTab: ["RECOMMENDATION"]
  },
  {
    id: "D00281",
    rank: null,
    name: "Sunscreen SPF50+ PA+++(Beige)",
    originalPrice: 900.0,
    formattedOriginalPrice: "₹ 900.00",
    price: 765.0,
    formattedPrice: "₹ 765.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00281/D00281_00.jpg?w=480&h=480",
    gstReduced: false,
    likes: 198,
    tags: ["#SunProtection"],
    freeDelivery: false,
    categoryTab: ["RECOMMENDATION"]
  },
  {
    id: "D00261",
    rank: null,
    name: "BB Cream SPF30 PA++",
    originalPrice: 900.0,
    formattedOriginalPrice: "₹ 900.00",
    price: 765.0,
    formattedPrice: "₹ 765.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00261/D00261_00.jpg?w=480&h=480",
    gstReduced: false,
    likes: 112,
    tags: ["#DailyCare"],
    freeDelivery: false,
    categoryTab: ["RECOMMENDATION"]
  },
  {
    id: "D00510",
    rank: null,
    name: "Toothbrush 8N",
    originalPrice: 950.0,
    formattedOriginalPrice: "₹ 950.00",
    price: 807.50,
    formattedPrice: "₹ 807.50",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00510/D00510_00.jpg?w=480&h=480",
    gstReduced: true,
    likes: 276,
    tags: ["#GST REDUCED", "#OralCare"],
    freeDelivery: false,
    categoryTab: ["RECOMMENDATION"]
  }
];

const HAIR_BODY_PRODUCTS = [
  {
    id: "D00693",
    name: "Scalpcare 2 Set",
    originalPrice: 2800.0,
    formattedOriginalPrice: "₹ 2,800.00",
    price: 2380.0,
    formattedPrice: "₹ 2,380.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00693/D00693_00.jpg?w=610&h=610",
    gstReduced: false,
    likes: 76,
    tags: []
  },
  {
    id: "D00691",
    name: "Scalpcare Hair Shampoo",
    originalPrice: 1350.0,
    formattedOriginalPrice: "₹ 1,350.00",
    price: 1147.50,
    formattedPrice: "₹ 1,147.50",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00691/D00691_00.jpg?w=610&h=610",
    gstReduced: true,
    likes: 139,
    tags: ["#GST REDUCED"]
  },
  {
    id: "D00681",
    name: "Hair Essential Oil",
    originalPrice: 1150.0,
    formattedOriginalPrice: "₹ 1,150.00",
    price: 977.50,
    formattedPrice: "₹ 977.50",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00681/D00681_00.jpg?w=610&h=610",
    gstReduced: true,
    likes: 124,
    tags: ["#GST REDUCED"]
  },
  {
    id: "D00661",
    name: "Herbal Hair Conditioner",
    originalPrice: 1400.0,
    formattedOriginalPrice: "₹ 1,400.00",
    price: 1190.0,
    formattedPrice: "₹ 1,190.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00661/D00661_00.jpg?w=610&h=610",
    gstReduced: false,
    likes: 63,
    tags: []
  },
  {
    id: "D00631",
    name: "Herbal Body Cleanser",
    originalPrice: 1000.0,
    formattedOriginalPrice: "₹ 1,000.00",
    price: 850.0,
    formattedPrice: "₹ 850.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00631/D00631_00.jpg?w=610&h=610",
    gstReduced: false,
    likes: 88,
    tags: []
  },
  {
    id: "D00620",
    name: "Saengmodan Hair Tonic",
    originalPrice: 1300.0,
    formattedOriginalPrice: "₹ 1,300.00",
    price: 1105.0,
    formattedPrice: "₹ 1,105.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00620/D00620_00.jpg?w=610&h=610",
    gstReduced: false,
    likes: 95,
    tags: []
  },
  {
    id: "D00611",
    name: "Herbal Hair Treatment",
    originalPrice: 800.0,
    formattedOriginalPrice: "₹ 800.00",
    price: 680.0,
    formattedPrice: "₹ 680.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00611/D00611_00.jpg?w=610&h=610",
    gstReduced: false,
    likes: 54,
    tags: []
  },
  {
    id: "D00601",
    name: "Herbal Hair Shampoo",
    originalPrice: 1050.0,
    formattedOriginalPrice: "₹ 1,050.00",
    price: 892.50,
    formattedPrice: "₹ 892.50",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=610&h=610",
    gstReduced: true,
    likes: 110,
    tags: ["#GST REDUCED"]
  }
];

const ABSOLUTE_SKINCARE_BANNER = "https://image.atomy.com/IN/banner/90/437/251100000021437201238.jpg";

const ABSOLUTE_SKINCARE_PRODUCTS = [
  {
    id: "D00207",
    name: "Absolute Skincare Set",
    originalPrice: 20000.0,
    formattedOriginalPrice: "₹ 20,000.00",
    price: 17000.0,
    formattedPrice: "₹ 17,000.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00207/org/036/260803000054036.jpg?w=260&h=260",
    category: "BEAUTY > Absolute Series"
  },
  {
    id: "D00217",
    name: "Absolute Toner",
    originalPrice: 3300.0,
    formattedOriginalPrice: "₹ 3,300.00",
    price: 2805.0,
    formattedPrice: "₹ 2,805.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00217/D00217_00.jpg?w=260&h=260",
    category: "BEAUTY > Absolute Series"
  },
  {
    id: "D00227",
    name: "Absolute Ampoule",
    originalPrice: 4500.0,
    formattedOriginalPrice: "₹ 4,500.00",
    price: 3825.0,
    formattedPrice: "₹ 3,825.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00227/D00227_00.jpg?w=260&h=260",
    category: "BEAUTY > Absolute Series"
  },
  {
    id: "D00237",
    name: "Absolute Serum",
    originalPrice: 3700.0,
    formattedOriginalPrice: "₹ 3,700.00",
    price: 3145.0,
    formattedPrice: "₹ 3,145.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00237/D00237_00.jpg?w=260&h=260",
    category: "BEAUTY > Absolute Series"
  },
  {
    id: "D00247",
    name: "Absolute Lotion",
    originalPrice: 3400.0,
    formattedOriginalPrice: "₹ 3,400.00",
    price: 2890.0,
    formattedPrice: "₹ 2,890.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00247/D00247_00.jpg?w=260&h=260",
    category: "BEAUTY > Absolute Series"
  },
  {
    id: "D00257",
    name: "Absolute Eye-Complex",
    originalPrice: 3700.0,
    formattedOriginalPrice: "₹ 3,700.00",
    price: 3145.0,
    formattedPrice: "₹ 3,145.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00257/D00257_00.jpg?w=260&h=260",
    category: "BEAUTY > Absolute Series"
  },
  {
    id: "D00267",
    name: "Absolute Nutrition Cream",
    originalPrice: 3300.0,
    formattedOriginalPrice: "₹ 3,300.00",
    price: 2805.0,
    formattedPrice: "₹ 2,805.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00267/D00267_00.jpg?w=260&h=260",
    category: "BEAUTY > Absolute Series"
  },
  {
    id: "D01513",
    name: "Atomy Absolute 24K Gold Night Mask",
    originalPrice: 3100.0,
    formattedOriginalPrice: "₹ 3,100.00",
    price: 2635.0,
    formattedPrice: "₹ 2,635.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D01513/D01513_00.jpg?w=260&h=260",
    category: "BEAUTY > Absolute Series"
  }
];

const USER_GUIDE_BANNER = "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png";
const RESOURCE_MATERIAL_BANNER = "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png";

const FOOD_ESSENTIAL_PRODUCTS = [
  {
    id: "D00975",
    name: "Atomy Cafe Arabica Black (50 sticks)",
    tag: "Atomy Cafe Arabica Black (50 sticks)",
    tagColor: "#ceb576",
    originalPrice: 1800.0,
    formattedOriginalPrice: "₹ 1,800.00",
    price: 1530.0,
    formattedPrice: "₹ 1,530.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/banner/50/451/251100000021451212853.jpg",
    category: "FOOD"
  },
  {
    id: "D00183",
    name: "Atomy Pomegranate Mixed Fruit Jelly",
    tag: "Atomy Pomegranate Mixed Fruit Jelly",
    tagColor: "#92b287",
    originalPrice: 6700.0,
    formattedOriginalPrice: "₹ 6,700.00",
    price: 5695.0,
    formattedPrice: "₹ 5,695.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/banner/50/443/25110000002144321296.jpg",
    category: "FOOD"
  },
  {
    id: "D00180",
    name: "Atomy Pu'er Tea",
    tag: "Atomy Pu'er Tea",
    tagColor: "#92add2",
    originalPrice: 3200.0,
    formattedOriginalPrice: "₹ 3,200.00",
    price: 2720.0,
    formattedPrice: "₹ 2,720.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/banner/50/440/251100000021440212834.jpg",
    category: "FOOD"
  }
];

const HEALTH_ESSENTIAL_BANNER = "https://image.atomy.com/IN/banner/90/507/251100000021507191230.jpg";

const HEALTH_ESSENTIAL_PRODUCTS = [
  {
    id: "D00111",
    name: "Alaska E-Omega 3",
    originalPrice: 3600.0,
    formattedOriginalPrice: "₹ 3,600.00",
    price: 3060.0,
    formattedPrice: "₹ 3,060.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00111/D00111_00.jpg?w=260&h=260",
    category: "HEALTH"
  },
  {
    id: "D00160",
    name: "Atomy Nutraceutical Mix",
    originalPrice: 4000.0,
    formattedOriginalPrice: "₹ 4,000.00",
    price: 3400.0,
    formattedPrice: "₹ 3,400.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00160/D00160_00.jpg?w=260&h=260",
    category: "HEALTH"
  },
  {
    id: "D00170",
    name: "Atomy Noni Drink",
    originalPrice: 5900.0,
    formattedOriginalPrice: "₹ 5,900.00",
    price: 5015.0,
    formattedPrice: "₹ 5,015.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00170/org/350/260401000051350.jpg?w=260&h=260",
    category: "HEALTH"
  },
  {
    id: "D00174",
    name: "Atomy Milk Thistle",
    originalPrice: 3400.0,
    formattedOriginalPrice: "₹ 3,400.00",
    price: 2890.0,
    formattedPrice: "₹ 2,890.00",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D00174/org/909/260422000051909.jpeg?w=260&h=260",
    category: "HEALTH"
  }
];

const GSGS_PRODUCTS = [
  {
    id: "D94085",
    name: "Atomy Shilajit Capsules",
    originalPrice: 849.0,
    formattedOriginalPrice: "₹ 849.00",
    price: 721.65,
    formattedPrice: "₹ 721.65",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D94085/org/907/260422000051907.jpeg?w=828&h=828",
    gstReduced: true,
    likes: 225,
    tags: []
  },
  {
    id: "D90178",
    name: "ATOMY 100% PURE* SPIRULINA (India)",
    originalPrice: 599.0,
    formattedOriginalPrice: "₹ 599.00",
    price: 509.15,
    formattedPrice: "₹ 509.15",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D90178/org/880/260422000051880.jpeg?w=828&h=828",
    gstReduced: true,
    likes: 232,
    tags: ["#GST REDUCED"]
  },
  {
    id: "D04086",
    name: "Atomy Moringa",
    originalPrice: 799.0,
    formattedOriginalPrice: "₹ 799.00",
    price: 679.15,
    formattedPrice: "₹ 679.15",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D04086/D04086_00.jpg?w=828&h=828",
    gstReduced: true,
    likes: 188,
    tags: ["#GST REDUCED"]
  },
  {
    id: "D94084",
    name: "Atomy 100% Pure* Spirulina Powder",
    originalPrice: 1799.0,
    formattedOriginalPrice: "₹ 1,799.00",
    price: 1529.15,
    formattedPrice: "₹ 1,529.15",
    discountPercent: "15%",
    image: "https://image.atomy.com/IN/goods/D94084/org/083/260501000052083.png?w=828&h=828",
    gstReduced: true,
    likes: 48,
    tags: ["#GST REDUCED"]
  }
];

const GST_BADGE_IMAGE = "https://image.atomy.com/IN/goods/flag/501/251120000048501.png";
const ATOMY_WHITE_LOGO = "https://resources.atomy.com/20261001111257/fo/images/common/CI-white.svg";
const ATOMY_BLUE_LOGO = "https://resources.atomy.com/20261001111257/fo/images/common/CI-blue_68.svg";

const NOTICE_ITEMS = [
  "[Notice] GENERAL NOTICE - New Register Member Coupon Offer",
  "[Notice] Operational Updates: Express Deliveries active for Tier 1 & 2 Indian Cities",
  "[Notice] Important Advisory regarding Unauthorized Reselling on E-commerce Platforms",
  "[Notice] Atomy India Success Academy - Live Registration Open"
];

const FOOTER_DATA = {
  agreementLinks: [
    "Direct Seller Agreement",
    "Code of Ethics and Principles",
    "Self-declaration",
    "Policies and Procedures",
    "CSR",
    "POSH",
    "Open source License",
    "Contact Details",
    "Compliance",
    "Return/Exchange",
    "Search Direct Seller",
    "Member Check"
  ],
  grievance: {
    contactPerson: "Mr. Naveen Sourabh Pal",
    email: "atomy_in@atomypark.com",
    mobile: "+918700995915",
    nodalOfficer: "Mr. Rahul Kokadwar",
    nodalTel: "+91-124-647-2850"
  },
  company: {
    name: "Atomy Enterprise India Pvt. Ltd.",
    corpAddress: "801/802, 8th Floor, Magnum Tower 2, Golf Course Extension Road, Sector - 58, Gurugram - 122011, Haryana, India",
    regAddress: "L-19, LGF, Kalkaji, New Delhi - 110019, Delhi, India",
    ceo: "Park Han-Gill, Yoon YongSoon",
    cin: "U74999DL2019FTC346490",
    gstin: "06AARCA9734D1ZG",
    pan: "AARCA9734D",
    copyright: "© 2023-2026 ATOMY CO., LTD. ALL RIGHTS RESERVED"
  },
  support: {
    phone: "+91-124-695-9000",
    fax: "+91-124-647-2851",
    hours: "Mon - Sat 09:00 AM ~ 17:30 PM (IST)",
    holidays: "(Sundays & Holidays : Closed)",
    email: "atomy_in@atomypark.com"
  }
};

const CATEGORY_CONFIGS = {
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
    banner: {
      title: "Atomy Nutraceutical Mix",
      subtitle: "The Daily Mix for a Happy Gut",
      image: "https://image.atomy.com/IN/banner/90/488/251100000021488134323.jpg",
      bgColor: "#b2d4e2"
    },
    subcategories: ["All", "Immunity", "Digestion", "Nutritional Health", "Eye Health", "Targeted Care"],
    bestProducts: [
      {
        id: "D90178",
        rank: 1,
        name: "ATOMY 100% PURE* SPIRULINA (India)",
        price: 599.0,
        formattedPrice: "₹ 599.00",
        image: "https://image.atomy.com/IN/goods/D90178/org/880/260422000051880.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 232,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      },
      {
        id: "D94085",
        rank: 2,
        name: "Atomy Shilajit Capsules",
        price: 849.0,
        formattedPrice: "₹ 849.00",
        image: "https://image.atomy.com/IN/goods/D94085/org/907/260422000051907.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 225,
        tags: [],
        freeDelivery: false
      },
      {
        id: "D04086",
        rank: 3,
        name: "Atomy Moringa",
        price: 799.0,
        formattedPrice: "₹ 799.00",
        image: "https://image.atomy.com/IN/goods/D04086/D04086_00.jpg?w=480&h=480",
        gstReduced: true,
        likes: 188,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      },
      {
        id: "D04006",
        rank: 4,
        name: "Atomy Algae Omega3",
        price: 5200.0,
        formattedPrice: "₹ 5,200.00",
        image: "https://image.atomy.com/IN/goods/D04006/D04006_00.jpg?w=480&h=480",
        gstReduced: true,
        isVeg: true,
        likes: 62,
        tags: ["#GST REDUCED"],
        freeDelivery: true
      },
      {
        id: "D00174",
        rank: 5,
        name: "Atomy Milk Thistle",
        price: 3400.0,
        formattedPrice: "₹ 3,400.00",
        image: "https://image.atomy.com/IN/goods/D00174/org/909/260422000051909.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 88,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      },
      {
        id: "D00160",
        rank: 6,
        name: "Atomy Nutraceutical Mix",
        price: 4000.0,
        formattedPrice: "₹ 4,000.00",
        image: "https://image.atomy.com/IN/goods/D00160/D00160_00.jpg?w=480&h=480",
        gstReduced: true,
        likes: 89,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      },
      {
        id: "D00111",
        rank: 7,
        name: "Alaska E-Omega 3",
        price: 3600.0,
        formattedPrice: "₹ 3,600.00",
        image: "https://image.atomy.com/IN/goods/D00111/D00111_00.jpg?w=480&h=480",
        gstReduced: true,
        isNonVeg: true,
        likes: 90,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      },
      {
        id: "D00170",
        rank: 8,
        name: "Atomy Noni Drink",
        price: 5900.0,
        formattedPrice: "₹ 5,900.00",
        image: "https://image.atomy.com/IN/goods/D00170/org/350/260401000051350.jpg?w=480&h=480",
        gstReduced: true,
        likes: 57,
        tags: ["#GST REDUCED"],
        freeDelivery: true
      },
      {
        id: "D07116",
        rank: 9,
        name: "Atomy 360 Degree Health Combo*",
        price: 11699.0,
        formattedPrice: "₹ 11,699.00",
        image: "https://image.atomy.com/IN/goods/D07116/org/183/260330000051183.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 26,
        tags: [],
        freeDelivery: true
      },
      {
        id: "D94084",
        rank: 10,
        name: "Atomy 100% Pure* Spirulina Powder",
        price: 1799.0,
        formattedPrice: "₹ 1,799.00",
        image: "https://image.atomy.com/IN/goods/D94084/org/083/260501000052083.png?w=480&h=480",
        gstReduced: true,
        likes: 48,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      }
    ],
    allProducts: [
      {
        id: "D90178",
        name: "ATOMY 100% PURE* SPIRULINA (India)",
        price: 599.0,
        formattedPrice: "₹ 599.00",
        image: "https://image.atomy.com/IN/goods/D90178/org/880/260422000051880.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 232,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D94085",
        name: "Atomy Shilajit Capsules",
        price: 849.0,
        formattedPrice: "₹ 849.00",
        image: "https://image.atomy.com/IN/goods/D94085/org/907/260422000051907.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 225,
        tags: []
      },
      {
        id: "D04086",
        name: "Atomy Moringa",
        price: 799.0,
        formattedPrice: "₹ 799.00",
        image: "https://image.atomy.com/IN/goods/D04086/D04086_00.jpg?w=480&h=480",
        gstReduced: true,
        likes: 188,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D04006",
        name: "Atomy Algae Omega3",
        price: 5200.0,
        formattedPrice: "₹ 5,200.00",
        image: "https://image.atomy.com/IN/goods/D04006/D04006_00.jpg?w=480&h=480",
        gstReduced: true,
        isVeg: true,
        likes: 62,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D00174",
        name: "Atomy Milk Thistle",
        price: 3400.0,
        formattedPrice: "₹ 3,400.00",
        image: "https://image.atomy.com/IN/goods/D00174/org/909/260422000051909.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 88,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D00160",
        name: "Atomy Nutraceutical Mix",
        price: 4000.0,
        formattedPrice: "₹ 4,000.00",
        image: "https://image.atomy.com/IN/goods/D00160/D00160_00.jpg?w=480&h=480",
        gstReduced: true,
        likes: 89,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D00111",
        name: "Alaska E-Omega 3",
        price: 3600.0,
        formattedPrice: "₹ 3,600.00",
        image: "https://image.atomy.com/IN/goods/D00111/D00111_00.jpg?w=480&h=480",
        gstReduced: true,
        isNonVeg: true,
        likes: 90,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D00170",
        name: "Atomy Noni Drink",
        price: 5900.0,
        formattedPrice: "₹ 5,900.00",
        image: "https://image.atomy.com/IN/goods/D00170/org/350/260401000051350.jpg?w=480&h=480",
        gstReduced: true,
        likes: 57,
        tags: ["#GST REDUCED"],
        freeDelivery: true
      },
      {
        id: "D07116",
        name: "Atomy 360 Degree Health Combo*",
        price: 11699.0,
        formattedPrice: "₹ 11,699.00",
        image: "https://image.atomy.com/IN/goods/D07116/org/183/260330000051183.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 26,
        tags: [],
        freeDelivery: true
      },
      {
        id: "D94084",
        name: "Atomy 100% Pure* Spirulina Powder",
        price: 1799.0,
        formattedPrice: "₹ 1,799.00",
        image: "https://image.atomy.com/IN/goods/D94084/org/083/260501000052083.png?w=480&h=480",
        gstReduced: true,
        likes: 48,
        tags: ["#GST REDUCED"]
      }
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
        image: "https://image.atomy.com/IN/banner/90/414/251100000021414132556.jpg",
        bgColor: "#e7ebeb"
      },
      {
        title: "HemoHIM 4-Set Mega Value Pack",
        subtitle: "Best Choice for Healthy Family Immunity",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        bgColor: "#e4edf0"
      },
      {
        title: "HemoHIM Global Edition",
        subtitle: "Loved by Over 16 Million Members Worldwide",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        bgColor: "#eaeef2"
      }
    ],
    banner: {
      title: "Atomy HemoHIM",
      subtitle: "Immunity Up! Fatigue Down!!",
      image: "https://image.atomy.com/IN/banner/90/414/251100000021414132556.jpg",
      bgColor: "#e7ebeb"
    },
    subcategories: ["All", "HemoHIM Individual", "HemoHIM Combo Sets", "Global Edition"],
    bestProducts: [
      {
        id: "D00101",
        rank: 1,
        name: "HemoHIM *1set",
        price: 11050.0,
        formattedPrice: "₹ 11,050.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 224,
        tags: ["#GST REDUCED", "#Immunity"],
        freeDelivery: true
      },
      {
        id: "D00104",
        rank: 2,
        name: "HemoHIM 4-Set Value Pack",
        price: 42000.0,
        formattedPrice: "₹ 42,000.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 142,
        tags: ["#MegaSaver", "#Immunity"],
        freeDelivery: true
      },
      {
        id: "D00102",
        rank: 3,
        name: "HemoHIM Global Edition (60 Sachets)",
        price: 11500.0,
        formattedPrice: "₹ 11,500.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: false,
        likes: 95,
        tags: ["#GlobalFavorite"],
        freeDelivery: true
      },
      {
        id: "D00105",
        rank: 4,
        name: "HemoHIM 2-Set Family Pack",
        price: 21500.0,
        formattedPrice: "₹ 21,500.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 88,
        tags: ["#FamilyPack"],
        freeDelivery: true
      },
      {
        id: "D00106",
        rank: 5,
        name: "HemoHIM Immunity Booster Pack",
        price: 12200.0,
        formattedPrice: "₹ 12,200.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 76,
        tags: ["#DailyEnergy"],
        freeDelivery: true
      },
      {
        id: "D00107",
        rank: 6,
        name: "HemoHIM Special Gift Box Edition",
        price: 11800.0,
        formattedPrice: "₹ 11,800.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 64,
        tags: ["#SpecialGift"],
        freeDelivery: true
      },
      {
        id: "D00108",
        rank: 7,
        name: "HemoHIM Travel Sachet Pack (30 pk)",
        price: 5800.0,
        formattedPrice: "₹ 5,800.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: false,
        likes: 53,
        tags: ["#OnTheGo"],
        freeDelivery: false
      },
      {
        id: "D00109",
        rank: 8,
        name: "HemoHIM Daily Wellness Edition",
        price: 11050.0,
        formattedPrice: "₹ 11,050.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 49,
        tags: ["#Wellness"],
        freeDelivery: true
      }
    ],
    allProducts: [
      {
        id: "D00101",
        name: "HemoHIM *1set",
        price: 11050.0,
        formattedPrice: "₹ 11,050.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 224,
        tags: ["#GST REDUCED", "#Immunity"],
        freeDelivery: true
      },
      {
        id: "D00104",
        name: "HemoHIM 4-Set Value Pack",
        price: 42000.0,
        formattedPrice: "₹ 42,000.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 142,
        tags: ["#MegaSaver", "#Immunity"],
        freeDelivery: true
      },
      {
        id: "D00102",
        name: "HemoHIM Global Edition (60 Sachets)",
        price: 11500.0,
        formattedPrice: "₹ 11,500.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: false,
        likes: 95,
        tags: ["#GlobalFavorite"],
        freeDelivery: true
      },
      {
        id: "D00105",
        name: "HemoHIM 2-Set Family Pack",
        price: 21500.0,
        formattedPrice: "₹ 21,500.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 88,
        tags: ["#FamilyPack"],
        freeDelivery: true
      },
      {
        id: "D00106",
        name: "HemoHIM Immunity Booster Pack",
        price: 12200.0,
        formattedPrice: "₹ 12,200.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 76,
        tags: ["#DailyEnergy"],
        freeDelivery: true
      },
      {
        id: "D00107",
        name: "HemoHIM Special Gift Box Edition",
        price: 11800.0,
        formattedPrice: "₹ 11,800.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 64,
        tags: ["#SpecialGift"],
        freeDelivery: true
      },
      {
        id: "D00108",
        name: "HemoHIM Travel Sachet Pack (30 pk)",
        price: 5800.0,
        formattedPrice: "₹ 5,800.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: false,
        likes: 53,
        tags: ["#OnTheGo"],
        freeDelivery: false
      },
      {
        id: "D00109",
        name: "HemoHIM Daily Wellness Edition",
        price: 11050.0,
        formattedPrice: "₹ 11,050.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 49,
        tags: ["#Wellness"],
        freeDelivery: true
      }
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
        image: "https://image.atomy.com/IN/banner/90/477/25110000002147714178.png",
        bgColor: "#f4f0ec"
      },
      {
        title: "Atomy The Fame Skincare",
        subtitle: "Unfading Beauty, Unfading Reputation",
        image: "https://image.atomy.com/IN/goods/D00003/D00003_00.jpg?w=480&h=480",
        bgColor: "#f8edf2"
      },
      {
        title: "Atomy Evening Care 4 Set",
        subtitle: "Home Aesthetic 365 Days a Year",
        image: "https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480",
        bgColor: "#eef2f5"
      }
    ],
    banner: {
      title: "Atomy Absolute Skincare",
      subtitle: "Recapture The Skin of Your Youth",
      image: "https://image.atomy.com/IN/banner/90/477/25110000002147714178.png",
      bgColor: "#f4f0ec"
    },
    subcategories: ["All", "Absolute Series", "The Fame", "Evening Care", "Sun Care", "Make Up"],
    bestProducts: [
      {
        id: "D00207",
        rank: 1,
        name: "Absolute Skincare Set",
        price: 17000.0,
        formattedPrice: "₹ 17,000.00",
        image: "https://image.atomy.com/IN/goods/D00207/org/036/260803000054036.jpg?w=480&h=480",
        gstReduced: false,
        likes: 103,
        tags: ["#AntiAging"],
        freeDelivery: true
      },
      {
        id: "D00003",
        rank: 2,
        name: "The Fame Skincare Set (5 Pcs per Set)",
        price: 7735.0,
        formattedPrice: "₹ 7,735.00",
        image: "https://image.atomy.com/IN/goods/D00003/D00003_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 51,
        tags: ["#Hydration"],
        freeDelivery: true
      },
      {
        id: "D00351",
        rank: 3,
        name: "Evening Care Set(4 Pcs per Set)",
        price: 2805.0,
        formattedPrice: "₹ 2,805.00",
        image: "https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 245,
        tags: ["#DeepCleansing"],
        freeDelivery: false
      },
      {
        id: "D00757",
        rank: 4,
        name: "Hydra Brightening Care Set (2 Pcs per Set)",
        price: 2550.0,
        formattedPrice: "₹ 2,550.00",
        image: "https://image.atomy.com/IN/goods/D00757/D00757_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 222,
        tags: ["#GlowSkin"],
        freeDelivery: false
      },
      {
        id: "D01526",
        rank: 5,
        name: "Atomy Absolute Snow Dark Spot Corrector",
        price: 1020.0,
        formattedPrice: "₹ 1,020.00",
        image: "https://image.atomy.com/IN/goods/D01526/org/447/251119000048447.jpg?w=480&h=480",
        gstReduced: false,
        likes: 89,
        tags: ["#SpotCorrector"],
        freeDelivery: false
      },
      {
        id: "D00227",
        rank: 6,
        name: "Atomy Absolute Ampoule",
        price: 3825.0,
        formattedPrice: "₹ 3,825.00",
        image: "https://image.atomy.com/IN/goods/D00227/D00227_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 94,
        tags: ["#CellActive"],
        freeDelivery: false
      },
      {
        id: "D01513",
        rank: 7,
        name: "Atomy Absolute 24K Gold Night Mask",
        price: 2635.0,
        formattedPrice: "₹ 2,635.00",
        image: "https://image.atomy.com/IN/goods/D01513/D01513_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 81,
        tags: ["#PureGold"],
        freeDelivery: false
      },
      {
        id: "D00396",
        rank: 8,
        name: "Atomy Air Pact #21",
        price: 1615.0,
        formattedPrice: "₹ 1,615.00",
        image: "https://image.atomy.com/IN/goods/D00396/org/441/251119000048441.jpg?w=480&h=480",
        gstReduced: true,
        likes: 67,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      },
      {
        id: "D01440",
        rank: 9,
        name: "Brush Pen Eyeliner - Black",
        price: 765.0,
        formattedPrice: "₹ 765.00",
        image: "https://image.atomy.com/IN/goods/D01440/org/810/260128000049810.jpg?w=480&h=480",
        likes: 42,
        tags: ["#NewArrival"]
      },
      {
        id: "D04704",
        rank: 10,
        name: "Adelica Concealer - Beige",
        price: 765.0,
        formattedPrice: "₹ 765.00",
        image: "https://image.atomy.com/IN/goods/D04704/org/115/260326000051115.jpeg?w=480&h=480",
        likes: 38,
        tags: ["#MakeupEssential"]
      }
    ],
    allProducts: [
      {
        id: "D00207",
        name: "Absolute Skincare Set",
        price: 17000.0,
        formattedPrice: "₹ 17,000.00",
        image: "https://image.atomy.com/IN/goods/D00207/org/036/260803000054036.jpg?w=480&h=480",
        likes: 103,
        tags: ["#AntiAging"],
        freeDelivery: true
      },
      {
        id: "D00003",
        name: "The Fame Skincare Set (5 Pcs per Set)",
        price: 7735.0,
        formattedPrice: "₹ 7,735.00",
        image: "https://image.atomy.com/IN/goods/D00003/D00003_00.jpg?w=480&h=480",
        likes: 51,
        tags: ["#Hydration"],
        freeDelivery: true
      },
      {
        id: "D00351",
        name: "Evening Care Set(4 Pcs per Set)",
        price: 2805.0,
        formattedPrice: "₹ 2,805.00",
        image: "https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480",
        likes: 245,
        tags: ["#DeepCleansing"]
      },
      {
        id: "D00757",
        name: "Hydra Brightening Care Set (2 Pcs per Set)",
        price: 2550.0,
        formattedPrice: "₹ 2,550.00",
        image: "https://image.atomy.com/IN/goods/D00757/D00757_00.jpg?w=480&h=480",
        likes: 222,
        tags: ["#GlowSkin"]
      },
      {
        id: "D01526",
        name: "Atomy Absolute Snow Dark Spot Corrector",
        price: 1020.0,
        formattedPrice: "₹ 1,020.00",
        image: "https://image.atomy.com/IN/goods/D01526/org/447/251119000048447.jpg?w=480&h=480",
        likes: 89,
        tags: ["#Brightening"]
      },
      {
        id: "D00227",
        name: "Atomy Absolute Ampoule",
        price: 3825.0,
        formattedPrice: "₹ 3,825.00",
        image: "https://image.atomy.com/IN/goods/D00227/D00227_00.jpg?w=480&h=480",
        likes: 94,
        tags: ["#CellActive"]
      },
      {
        id: "D01513",
        name: "Atomy Absolute 24K Gold Night Mask",
        price: 2635.0,
        formattedPrice: "₹ 2,635.00",
        image: "https://image.atomy.com/IN/goods/D01513/D01513_00.jpg?w=480&h=480",
        likes: 81,
        tags: ["#PureGold"]
      },
      {
        id: "D00396",
        name: "Atomy Air Pact #21",
        price: 1615.0,
        formattedPrice: "₹ 1,615.00",
        image: "https://image.atomy.com/IN/goods/D00396/org/441/251119000048441.jpg?w=480&h=480",
        gstReduced: true,
        likes: 67,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D01440",
        name: "Brush Pen Eyeliner - Black",
        price: 765.0,
        formattedPrice: "₹ 765.00",
        image: "https://image.atomy.com/IN/goods/D01440/org/810/260128000049810.jpg?w=480&h=480",
        likes: 42,
        tags: ["#NewArrival"]
      },
      {
        id: "D04704",
        name: "Adelica Concealer - Beige",
        price: 765.0,
        formattedPrice: "₹ 765.00",
        image: "https://image.atomy.com/IN/goods/D04704/org/115/260326000051115.jpeg?w=480&h=480",
        likes: 38,
        tags: ["#MakeupEssential"]
      }
    ]
  },
  food: {
    id: "food",
    dispCtgNo: "2510004177",
    name: "FOOD",
    banners: [
      {
        title: "Atomy Premium Food Selection",
        subtitle: "Pure, Natural Taste Delivered to Your Home",
        image: "https://image.atomy.com/IN/goods/D00980/D00980_00.jpg?w=480&h=480",
        bgColor: "#f7f1e6"
      },
      {
        title: "Atomy Cafe Arabica 100%",
        subtitle: "Rich Aroma of Finest Arabica Beans",
        image: "https://image.atomy.com/IN/banner/50/451/251100000021451212853.jpg",
        bgColor: "#efe5d8"
      },
      {
        title: "Atomy Pomegranate Jelly",
        subtitle: "Tasty Daily Care for Vitality and Health",
        image: "https://image.atomy.com/IN/banner/50/443/25110000002144321296.jpg",
        bgColor: "#f5e8e8"
      }
    ],
    banner: {
      title: "Atomy Premium Food Selection",
      subtitle: "Pure, Natural Taste Delivered to Your Home",
      image: "https://image.atomy.com/IN/goods/D00980/D00980_00.jpg?w=480&h=480",
      bgColor: "#f7f1e6"
    },
    subcategories: ["All", "Tea & Coffee", "Healthy Snacks", "Nourishment"],
    bestProducts: [
      {
        id: "D00980",
        rank: 1,
        name: "Atomy Cafe Arabica 50 (Instant Coffee)",
        price: 650.0,
        formattedPrice: "₹ 650.00",
        image: "https://image.atomy.com/IN/goods/D00980/D00980_00.jpg?w=480&h=480",
        likes: 165,
        tags: ["#100%Arabica"],
        freeDelivery: false
      },
      {
        id: "D00902",
        rank: 2,
        name: "Atomy Sandwich Laver (Crispy)",
        price: 1150.0,
        formattedPrice: "₹ 1,150.00",
        image: "https://image.atomy.com/IN/goods/D00902/D00902_00.jpg?w=480&h=480",
        likes: 92,
        tags: ["#CrispySeaweed"],
        freeDelivery: false
      },
      {
        id: "D00180",
        rank: 3,
        name: "Atomy Pomegranate Mixed Fruit Jelly",
        price: 2600.0,
        formattedPrice: "₹ 2,600.00",
        image: "https://image.atomy.com/IN/goods/D00180/D00180_00.jpg?w=480&h=480",
        likes: 110,
        tags: ["#Antioxidants"],
        freeDelivery: true
      },
      {
        id: "D00915",
        rank: 4,
        name: "Atomy Organic Green Tea",
        price: 900.0,
        formattedPrice: "₹ 900.00",
        image: "https://image.atomy.com/IN/goods/D00915/D00915_00.jpg?w=480&h=480",
        likes: 74,
        tags: ["#OrganicCertified"],
        freeDelivery: false
      },
      {
        id: "D00975",
        rank: 5,
        name: "Atomy Cafe Arabica Black (50 sticks)",
        price: 1530.0,
        formattedPrice: "₹ 1,530.00",
        image: "https://image.atomy.com/IN/banner/50/451/251100000021451212853.jpg",
        likes: 120,
        tags: ["#BlackCoffee"],
        freeDelivery: false
      },
      {
        id: "D00183",
        rank: 6,
        name: "Atomy Pu'er Tea (Extract)",
        price: 2720.0,
        formattedPrice: "₹ 2,720.00",
        image: "https://image.atomy.com/IN/banner/50/440/251100000021440212834.jpg",
        likes: 98,
        tags: ["#BodyShape"],
        freeDelivery: false
      },
      {
        id: "D00985",
        rank: 7,
        name: "Atomy Daily Soy Protein Shake",
        price: 3100.0,
        formattedPrice: "₹ 3,100.00",
        image: "https://image.atomy.com/IN/goods/D00980/D00980_00.jpg?w=480&h=480",
        likes: 85,
        tags: ["#HighProtein"],
        freeDelivery: false
      },
      {
        id: "D00990",
        rank: 8,
        name: "Atomy Korean Red Ginseng Tea",
        price: 3450.0,
        formattedPrice: "₹ 3,450.00",
        image: "https://image.atomy.com/IN/banner/50/440/251100000021440212834.jpg",
        likes: 104,
        tags: ["#Ginsenosides"],
        freeDelivery: true
      }
    ],
    allProducts: [
      {
        id: "D00980",
        name: "Atomy Cafe Arabica 50 (Instant Coffee)",
        price: 650.0,
        formattedPrice: "₹ 650.00",
        image: "https://image.atomy.com/IN/goods/D00980/D00980_00.jpg?w=480&h=480",
        likes: 165,
        tags: ["#100%Arabica"]
      },
      {
        id: "D00902",
        name: "Atomy Sandwich Laver (Crispy)",
        price: 1150.0,
        formattedPrice: "₹ 1,150.00",
        image: "https://image.atomy.com/IN/goods/D00902/D00902_00.jpg?w=480&h=480",
        likes: 92,
        tags: ["#CrispySeaweed"]
      },
      {
        id: "D00180",
        name: "Atomy Pomegranate Mixed Fruit Jelly",
        price: 2600.0,
        formattedPrice: "₹ 2,600.00",
        image: "https://image.atomy.com/IN/goods/D00180/D00180_00.jpg?w=480&h=480",
        likes: 110,
        tags: ["#Antioxidants"],
        freeDelivery: true
      },
      {
        id: "D00915",
        name: "Atomy Organic Green Tea",
        price: 900.0,
        formattedPrice: "₹ 900.00",
        image: "https://image.atomy.com/IN/goods/D00915/D00915_00.jpg?w=480&h=480",
        likes: 74,
        tags: ["#OrganicCertified"]
      },
      {
        id: "D00975",
        name: "Atomy Cafe Arabica Black (50 sticks)",
        price: 1530.0,
        formattedPrice: "₹ 1,530.00",
        image: "https://image.atomy.com/IN/banner/50/451/251100000021451212853.jpg",
        likes: 120,
        tags: ["#BlackCoffee"]
      },
      {
        id: "D00183",
        name: "Atomy Pu'er Tea (Extract)",
        price: 2720.0,
        formattedPrice: "₹ 2,720.00",
        image: "https://image.atomy.com/IN/banner/50/440/251100000021440212834.jpg",
        likes: 98,
        tags: ["#BodyShape"]
      },
      {
        id: "D00985",
        name: "Atomy Daily Soy Protein Shake",
        price: 3100.0,
        formattedPrice: "₹ 3,100.00",
        image: "https://image.atomy.com/IN/goods/D00980/D00980_00.jpg?w=480&h=480",
        likes: 85,
        tags: ["#HighProtein"]
      },
      {
        id: "D00990",
        name: "Atomy Korean Red Ginseng Tea",
        price: 3450.0,
        formattedPrice: "₹ 3,450.00",
        image: "https://image.atomy.com/IN/banner/50/440/251100000021440212834.jpg",
        likes: 104,
        tags: ["#Ginsenosides"]
      }
    ]
  },
  personal_care: {
    id: "personal_care",
    dispCtgNo: "2510004175",
    name: "PERSONAL CARE",
    banners: [
      {
        title: "Atomy Hair & Body Care",
        subtitle: "Naturally Gentle Solutions For The Whole Family",
        image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
        bgColor: "#edf5f2"
      },
      {
        title: "Atomy Propolis Toothpaste",
        subtitle: "Dental Care with Natural Antibacterial Propolis",
        image: "https://image.atomy.com/IN/goods/D00501/D00501_00.jpg?w=480&h=480",
        bgColor: "#f4f8e8"
      },
      {
        title: "Atomy Herbal Scalp Spa",
        subtitle: "Nourish Roots and Revitalize Every Strand",
        image: "https://image.atomy.com/IN/goods/D00620/D00620_00.jpg?w=480&h=480",
        bgColor: "#e8f0ec"
      }
    ],
    banner: {
      title: "Atomy Hair & Body Care",
      subtitle: "Naturally Gentle Solutions For The Whole Family",
      image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
      bgColor: "#edf5f2"
    },
    subcategories: ["All", "Hair & Scalp", "Oral Care", "Body Care", "Hand Care"],
    bestProducts: [
      {
        id: "D00601",
        rank: 1,
        name: "Atomy Herbal Hair Shampoo (500ml)",
        price: 1100.0,
        formattedPrice: "₹ 1,100.00",
        image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
        gstReduced: true,
        likes: 198,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      },
      {
        id: "D00501",
        rank: 2,
        name: "Atomy Toothpaste Set (200g x 5 Tubes)",
        price: 1250.0,
        formattedPrice: "₹ 1,250.00",
        image: "https://image.atomy.com/IN/goods/D00501/D00501_00.jpg?w=480&h=480",
        gstReduced: true,
        likes: 310,
        tags: ["#PropolisOralCare"],
        freeDelivery: false
      },
      {
        id: "D00510",
        rank: 3,
        name: "Atomy Compact Toothbrush (8 Pcs per Set)",
        price: 950.0,
        formattedPrice: "₹ 950.00",
        image: "https://image.atomy.com/IN/goods/D00510/D00510_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 275,
        tags: ["#GoldAntibacterial"],
        freeDelivery: false
      },
      {
        id: "D00650",
        rank: 4,
        name: "Atomy Body Care Rich Body Lotion",
        price: 1400.0,
        formattedPrice: "₹ 1,400.00",
        image: "https://image.atomy.com/IN/goods/D00650/D00650_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 140,
        tags: ["#DeepMoisture"],
        freeDelivery: false
      },
      {
        id: "D00681",
        rank: 5,
        name: "Hair Essential Oil",
        price: 977.50,
        formattedPrice: "₹ 977.50",
        image: "https://image.atomy.com/IN/goods/D00681/D00681_00.jpg?w=480&h=480",
        gstReduced: true,
        likes: 124,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      },
      {
        id: "D00661",
        rank: 6,
        name: "Herbal Hair Conditioner",
        price: 1190.0,
        formattedPrice: "₹ 1,190.00",
        image: "https://image.atomy.com/IN/goods/D00661/D00661_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 63,
        tags: ["#SilkySmooth"],
        freeDelivery: false
      },
      {
        id: "D00631",
        rank: 7,
        name: "Herbal Body Cleanser",
        price: 850.0,
        formattedPrice: "₹ 850.00",
        image: "https://image.atomy.com/IN/goods/D00631/D00631_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 88,
        tags: ["#BotanicalCare"],
        freeDelivery: false
      },
      {
        id: "D00620",
        rank: 8,
        name: "Saengmodan Hair Tonic",
        price: 1105.0,
        formattedPrice: "₹ 1,105.00",
        image: "https://image.atomy.com/IN/goods/D00620/D00620_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 95,
        tags: ["#ScalpHealth"],
        freeDelivery: false
      }
    ],
    allProducts: [
      {
        id: "D00601",
        name: "Atomy Herbal Hair Shampoo (500ml)",
        price: 1100.0,
        formattedPrice: "₹ 1,100.00",
        image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
        likes: 198,
        tags: ["#HerbalFormula"]
      },
      {
        id: "D00501",
        name: "Atomy Toothpaste Set (200g x 5 Tubes)",
        price: 1250.0,
        formattedPrice: "₹ 1,250.00",
        image: "https://image.atomy.com/IN/goods/D00501/D00501_00.jpg?w=480&h=480",
        likes: 310,
        tags: ["#PropolisOralCare"]
      },
      {
        id: "D00510",
        name: "Atomy Compact Toothbrush (8 Pcs per Set)",
        price: 950.0,
        formattedPrice: "₹ 950.00",
        image: "https://image.atomy.com/IN/goods/D00510/D00510_00.jpg?w=480&h=480",
        likes: 275,
        tags: ["#GoldAntibacterial"]
      },
      {
        id: "D00650",
        name: "Atomy Body Care Rich Body Lotion",
        price: 1400.0,
        formattedPrice: "₹ 1,400.00",
        image: "https://image.atomy.com/IN/goods/D00650/D00650_00.jpg?w=480&h=480",
        likes: 140,
        tags: ["#DeepMoisture"]
      },
      {
        id: "D00681",
        name: "Hair Essential Oil",
        price: 977.50,
        formattedPrice: "₹ 977.50",
        image: "https://image.atomy.com/IN/goods/D00681/D00681_00.jpg?w=480&h=480",
        likes: 124,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D00661",
        name: "Herbal Hair Conditioner",
        price: 1190.0,
        formattedPrice: "₹ 1,190.00",
        image: "https://image.atomy.com/IN/goods/D00661/D00661_00.jpg?w=480&h=480",
        likes: 63,
        tags: []
      },
      {
        id: "D00631",
        name: "Herbal Body Cleanser",
        price: 850.0,
        formattedPrice: "₹ 850.00",
        image: "https://image.atomy.com/IN/goods/D00631/D00631_00.jpg?w=480&h=480",
        likes: 88,
        tags: []
      },
      {
        id: "D00620",
        name: "Saengmodan Hair Tonic",
        price: 1105.0,
        formattedPrice: "₹ 1,105.00",
        image: "https://image.atomy.com/IN/goods/D00620/D00620_00.jpg?w=480&h=480",
        likes: 95,
        tags: []
      }
    ]
  },
  home: {
    id: "home",
    dispCtgNo: "2510004174",
    name: "HOME",
    banners: [
      {
        title: "Atomy Living Care",
        subtitle: "Eco-friendly, Non-toxic Cleaners For A Pure Home",
        image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
        bgColor: "#eef3f7"
      },
      {
        title: "Atomy Plant-Based Fabric Detergent",
        subtitle: "Powerful Enzyme Cleaning, Gentle on Skin",
        image: "https://image.atomy.com/IN/goods/D00810/D00810_00.jpg?w=480&h=480",
        bgColor: "#e4edf5"
      },
      {
        title: "Atomy Dish Detergent Class 1",
        subtitle: "Safe for Washing Fruits, Vegetables and Baby Bottles",
        image: "https://image.atomy.com/IN/goods/D00820/D00820_00.jpg?w=480&h=480",
        bgColor: "#ecf7ed"
      }
    ],
    banner: {
      title: "Atomy Living Care",
      subtitle: "Eco-friendly, Non-toxic Cleaners For A Pure Home",
      image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
      bgColor: "#eef3f7"
    },
    subcategories: ["All", "Living Care", "Detergent", "Kitchenware"],
    bestProducts: [
      {
        id: "D00801",
        rank: 1,
        name: "Atomy Fabric Detergent (Powder 2.4kg)",
        price: 1150.0,
        formattedPrice: "₹ 1,150.00",
        image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
        likes: 120,
        tags: ["#EcoFriendly"],
        freeDelivery: false
      },
      {
        id: "D00810",
        rank: 2,
        name: "Atomy Liquid Fabric Detergent (2kg)",
        price: 1350.0,
        formattedPrice: "₹ 1,350.00",
        image: "https://image.atomy.com/IN/goods/D00810/D00810_00.jpg?w=480&h=480",
        likes: 105,
        tags: ["#NaturalPlantBased"],
        freeDelivery: false
      },
      {
        id: "D00820",
        rank: 3,
        name: "Atomy Dish Detergent (1kg)",
        price: 750.0,
        formattedPrice: "₹ 750.00",
        image: "https://image.atomy.com/IN/goods/D00820/D00820_00.jpg?w=480&h=480",
        likes: 154,
        tags: ["#Class1Detergent"],
        freeDelivery: false
      },
      {
        id: "D00830",
        rank: 4,
        name: "Atomy Fabric Softener (2kg)",
        price: 980.0,
        formattedPrice: "₹ 980.00",
        image: "https://image.atomy.com/IN/goods/D00810/D00810_00.jpg?w=480&h=480",
        likes: 87,
        tags: ["#LongLastingScent"],
        freeDelivery: false
      },
      {
        id: "D00840",
        rank: 5,
        name: "Atomy Medycook Stainless Steel Wok",
        price: 12500.0,
        formattedPrice: "₹ 12,500.00",
        image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
        likes: 72,
        tags: ["#316Steel"],
        freeDelivery: true
      },
      {
        id: "D00850",
        rank: 6,
        name: "Atomy Multipurpose Kitchen Paper Towel",
        price: 520.0,
        formattedPrice: "₹ 520.00",
        image: "https://image.atomy.com/IN/goods/D00820/D00820_00.jpg?w=480&h=480",
        likes: 64,
        tags: ["#PurePulp"],
        freeDelivery: false
      },
      {
        id: "D00860",
        rank: 7,
        name: "Atomy Hand Soap (Antibacterial 300ml)",
        price: 430.0,
        formattedPrice: "₹ 430.00",
        image: "https://image.atomy.com/IN/goods/D00810/D00810_00.jpg?w=480&h=480",
        likes: 95,
        tags: ["#99.9%Protection"],
        freeDelivery: false
      },
      {
        id: "D00870",
        rank: 8,
        name: "Atomy Eco Scrubber 3-Pack",
        price: 320.0,
        formattedPrice: "₹ 320.00",
        image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
        likes: 58,
        tags: ["#AntibacterialMesh"],
        freeDelivery: false
      }
    ],
    allProducts: [
      {
        id: "D00801",
        name: "Atomy Fabric Detergent (Powder 2.4kg)",
        price: 1150.0,
        formattedPrice: "₹ 1,150.00",
        image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
        likes: 120,
        tags: ["#EcoFriendly"]
      },
      {
        id: "D00810",
        name: "Atomy Liquid Fabric Detergent (2kg)",
        price: 1350.0,
        formattedPrice: "₹ 1,350.00",
        image: "https://image.atomy.com/IN/goods/D00810/D00810_00.jpg?w=480&h=480",
        likes: 105,
        tags: ["#NaturalPlantBased"]
      },
      {
        id: "D00820",
        name: "Atomy Dish Detergent (1kg)",
        price: 750.0,
        formattedPrice: "₹ 750.00",
        image: "https://image.atomy.com/IN/goods/D00820/D00820_00.jpg?w=480&h=480",
        likes: 154,
        tags: ["#Class1Detergent"]
      },
      {
        id: "D00830",
        name: "Atomy Fabric Softener (2kg)",
        price: 980.0,
        formattedPrice: "₹ 980.00",
        image: "https://image.atomy.com/IN/goods/D00810/D00810_00.jpg?w=480&h=480",
        likes: 87,
        tags: ["#LongLastingScent"]
      },
      {
        id: "D00840",
        name: "Atomy Medycook Stainless Steel Wok",
        price: 12500.0,
        formattedPrice: "₹ 12,500.00",
        image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
        likes: 72,
        tags: ["#316Steel"]
      },
      {
        id: "D00850",
        name: "Atomy Multipurpose Kitchen Paper Towel",
        price: 520.0,
        formattedPrice: "₹ 520.00",
        image: "https://image.atomy.com/IN/goods/D00820/D00820_00.jpg?w=480&h=480",
        likes: 64,
        tags: ["#PurePulp"]
      },
      {
        id: "D00860",
        name: "Atomy Hand Soap (Antibacterial 300ml)",
        price: 430.0,
        formattedPrice: "₹ 430.00",
        image: "https://image.atomy.com/IN/goods/D00810/D00810_00.jpg?w=480&h=480",
        likes: 95,
        tags: ["#99.9%Protection"]
      },
      {
        id: "D00870",
        name: "Atomy Eco Scrubber 3-Pack",
        price: 320.0,
        formattedPrice: "₹ 320.00",
        image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
        likes: 58,
        tags: ["#AntibacterialMesh"]
      }
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
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        bgColor: "#f5f3f0"
      },
      {
        title: "Atomy Official Product Guide",
        subtitle: "Comprehensive Knowledge for Every Member",
        image: "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png",
        bgColor: "#eceff3"
      },
      {
        title: "Team Phoenix Business Starter Kit",
        subtitle: "Everything You Need to Succeed with Atomy",
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        bgColor: "#f7eee4"
      }
    ],
    banner: {
      title: "Atomy Business & Promotional Tools",
      subtitle: "Catalogs, Shopping Bags & Brand Essentials",
      image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
      bgColor: "#f5f3f0"
    },
    subcategories: ["All", "Shopping Bags", "Catalogs", "Business Materials"],
    bestProducts: [
      {
        id: "D09001",
        rank: 1,
        name: "Atomy Shopping Bag Medium (10 Pcs)",
        price: 150.0,
        formattedPrice: "₹ 150.00",
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        likes: 80,
        tags: ["#Branded"],
        freeDelivery: false
      },
      {
        id: "D09010",
        rank: 2,
        name: "Atomy Product Catalog (English Edition)",
        price: 200.0,
        formattedPrice: "₹ 200.00",
        image: "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png",
        likes: 95,
        tags: ["#Guide"],
        freeDelivery: false
      },
      {
        id: "D09002",
        rank: 3,
        name: "Atomy Shopping Bag Large (10 Pcs)",
        price: 220.0,
        formattedPrice: "₹ 220.00",
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        likes: 67,
        tags: ["#Durable"],
        freeDelivery: false
      },
      {
        id: "D09011",
        rank: 4,
        name: "Atomy Product Catalog (Hindi Edition)",
        price: 200.0,
        formattedPrice: "₹ 200.00",
        image: "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png",
        likes: 82,
        tags: ["#HindiCatalog"],
        freeDelivery: false
      },
      {
        id: "D09020",
        rank: 5,
        name: "Atomy Executive Notebook & Metal Pen Set",
        price: 550.0,
        formattedPrice: "₹ 550.00",
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        likes: 110,
        tags: ["#Executive"],
        freeDelivery: false
      },
      {
        id: "D09030",
        rank: 6,
        name: "Atomy Success Academy Lapel Pin Badge",
        price: 350.0,
        formattedPrice: "₹ 350.00",
        image: "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png",
        likes: 74,
        tags: ["#Achievement"],
        freeDelivery: false
      },
      {
        id: "D09040",
        rank: 7,
        name: "Atomy Sample Display Pouch Case",
        price: 480.0,
        formattedPrice: "₹ 480.00",
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        likes: 63,
        tags: ["#DemoKit"],
        freeDelivery: false
      },
      {
        id: "D09050",
        rank: 8,
        name: "Team Phoenix Business Starter Kit",
        price: 1200.0,
        formattedPrice: "₹ 1,200.00",
        image: "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png",
        likes: 135,
        tags: ["#BestValue"],
        freeDelivery: true
      }
    ],
    allProducts: [
      {
        id: "D09001",
        name: "Atomy Shopping Bag Medium (10 Pcs)",
        price: 150.0,
        formattedPrice: "₹ 150.00",
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        likes: 80,
        tags: ["#Branded"]
      },
      {
        id: "D09010",
        name: "Atomy Product Catalog (English Edition)",
        price: 200.0,
        formattedPrice: "₹ 200.00",
        image: "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png",
        likes: 95,
        tags: ["#Guide"]
      },
      {
        id: "D09002",
        name: "Atomy Shopping Bag Large (10 Pcs)",
        price: 220.0,
        formattedPrice: "₹ 220.00",
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        likes: 67,
        tags: ["#Durable"]
      },
      {
        id: "D09011",
        name: "Atomy Product Catalog (Hindi Edition)",
        price: 200.0,
        formattedPrice: "₹ 200.00",
        image: "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png",
        likes: 82,
        tags: ["#HindiCatalog"]
      },
      {
        id: "D09020",
        name: "Atomy Executive Notebook & Metal Pen Set",
        price: 550.0,
        formattedPrice: "₹ 550.00",
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        likes: 110,
        tags: ["#Executive"]
      },
      {
        id: "D09030",
        name: "Atomy Success Academy Lapel Pin Badge",
        price: 350.0,
        formattedPrice: "₹ 350.00",
        image: "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png",
        likes: 74,
        tags: ["#Achievement"]
      },
      {
        id: "D09040",
        name: "Atomy Sample Display Pouch Case",
        price: 480.0,
        formattedPrice: "₹ 480.00",
        image: "https://image.atomy.com/IN/banner/90/804/251000000020804144213.png",
        likes: 63,
        tags: ["#DemoKit"]
      },
      {
        id: "D09050",
        name: "Team Phoenix Business Starter Kit",
        price: 1200.0,
        formattedPrice: "₹ 1,200.00",
        image: "https://image.atomy.com/IN/banner/90/453/251100000021453161123.png",
        likes: 135,
        tags: ["#BestValue"]
      }
    ]
  },
  all_products: {
    id: "all_products",
    dispCtgNo: "ALL",
    name: "ALL PRODUCTS",
    banners: [
      {
        title: "Absolute Quality, Absolute Price",
        subtitle: "Explore the Complete Range of Atomy Products",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        bgColor: "#edf4f9"
      },
      {
        title: "Health & Immunity Champions",
        subtitle: "HemoHIM, Spirulina, Shilajit and Beyond",
        image: "https://image.atomy.com/IN/goods/D90178/org/880/260422000051880.jpeg?w=480&h=480",
        bgColor: "#e3f0e8"
      },
      {
        title: "Premium Skincare & Daily Living",
        subtitle: "K-Beauty Innovations & Natural Home Solutions",
        image: "https://image.atomy.com/IN/goods/D00207/org/036/260803000054036.jpg?w=480&h=480",
        bgColor: "#f7efe9"
      }
    ],
    banner: {
      title: "Absolute Quality, Absolute Price",
      subtitle: "Explore the Complete Range of Atomy Products",
      image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
      bgColor: "#edf4f9"
    },
    subcategories: ["All", "HemoHIM", "HEALTH", "BEAUTY", "FOOD", "PERSONAL CARE", "HOME", "OTHERS"],
    bestProducts: [
      {
        id: "D00101",
        rank: 1,
        name: "HemoHIM *1set",
        price: 11050.0,
        formattedPrice: "₹ 11,050.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 224,
        tags: ["#GST REDUCED", "#Immunity"],
        freeDelivery: true
      },
      {
        id: "D00207",
        rank: 2,
        name: "Absolute Skincare Set",
        price: 17000.0,
        formattedPrice: "₹ 17,000.00",
        image: "https://image.atomy.com/IN/goods/D00207/org/036/260803000054036.jpg?w=480&h=480",
        gstReduced: false,
        likes: 103,
        tags: ["#AntiAging"],
        freeDelivery: true
      },
      {
        id: "D90178",
        rank: 3,
        name: "ATOMY 100% PURE* SPIRULINA (India)",
        price: 599.0,
        formattedPrice: "₹ 599.00",
        image: "https://image.atomy.com/IN/goods/D90178/org/880/260422000051880.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 232,
        tags: ["#GST REDUCED"],
        freeDelivery: false
      },
      {
        id: "D00351",
        rank: 4,
        name: "Evening Care Set(4 Pcs per Set)",
        price: 2805.0,
        formattedPrice: "₹ 2,805.00",
        image: "https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480",
        gstReduced: false,
        likes: 245,
        tags: ["#DeepCleansing"],
        freeDelivery: false
      },
      {
        id: "D94085",
        rank: 5,
        name: "Atomy Shilajit Capsules",
        price: 849.0,
        formattedPrice: "₹ 849.00",
        image: "https://image.atomy.com/IN/goods/D94085/org/907/260422000051907.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 225,
        tags: [],
        freeDelivery: false
      },
      {
        id: "D00601",
        rank: 6,
        name: "Atomy Herbal Hair Shampoo (500ml)",
        price: 1100.0,
        formattedPrice: "₹ 1,100.00",
        image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
        gstReduced: true,
        likes: 198,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D00501",
        rank: 7,
        name: "Atomy Toothpaste Set (200g x 5 Tubes)",
        price: 1250.0,
        formattedPrice: "₹ 1,250.00",
        image: "https://image.atomy.com/IN/goods/D00501/D00501_00.jpg?w=480&h=480",
        likes: 310,
        tags: ["#PropolisOralCare"]
      },
      {
        id: "D00980",
        rank: 8,
        name: "Atomy Cafe Arabica 50 (Instant Coffee)",
        price: 650.0,
        formattedPrice: "₹ 650.00",
        image: "https://image.atomy.com/IN/goods/D00980/D00980_00.jpg?w=480&h=480",
        likes: 165,
        tags: ["#100%Arabica"]
      },
      {
        id: "D00801",
        rank: 9,
        name: "Atomy Fabric Detergent (Powder 2.4kg)",
        price: 1150.0,
        formattedPrice: "₹ 1,150.00",
        image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
        likes: 120,
        tags: ["#EcoFriendly"]
      },
      {
        id: "D04006",
        rank: 10,
        name: "Atomy Algae Omega3",
        price: 5200.0,
        formattedPrice: "₹ 5,200.00",
        image: "https://image.atomy.com/IN/goods/D04006/D04006_00.jpg?w=480&h=480",
        gstReduced: true,
        isVeg: true,
        likes: 62,
        tags: ["#GST REDUCED"]
      }
    ],
    allProducts: [
      {
        id: "D00101",
        name: "HemoHIM *1set",
        price: 11050.0,
        formattedPrice: "₹ 11,050.00",
        image: "https://image.atomy.com/IN/goods/D00101/org/085/260326000051085.jpg?w=480&h=480",
        gstReduced: true,
        likes: 224,
        tags: ["#GST REDUCED", "#Immunity"],
        freeDelivery: true
      },
      {
        id: "D00207",
        name: "Absolute Skincare Set",
        price: 17000.0,
        formattedPrice: "₹ 17,000.00",
        image: "https://image.atomy.com/IN/goods/D00207/org/036/260803000054036.jpg?w=480&h=480",
        likes: 103,
        tags: ["#AntiAging"],
        freeDelivery: true
      },
      {
        id: "D90178",
        name: "ATOMY 100% PURE* SPIRULINA (India)",
        price: 599.0,
        formattedPrice: "₹ 599.00",
        image: "https://image.atomy.com/IN/goods/D90178/org/880/260422000051880.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 232,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D94085",
        name: "Atomy Shilajit Capsules",
        price: 849.0,
        formattedPrice: "₹ 849.00",
        image: "https://image.atomy.com/IN/goods/D94085/org/907/260422000051907.jpeg?w=480&h=480",
        gstReduced: true,
        likes: 225,
        tags: []
      },
      {
        id: "D04086",
        name: "Atomy Moringa",
        price: 799.0,
        formattedPrice: "₹ 799.00",
        image: "https://image.atomy.com/IN/goods/D04086/D04086_00.jpg?w=480&h=480",
        gstReduced: true,
        likes: 188,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D00003",
        name: "The Fame Skincare Set (5 Pcs per Set)",
        price: 7735.0,
        formattedPrice: "₹ 7,735.00",
        image: "https://image.atomy.com/IN/goods/D00003/D00003_00.jpg?w=480&h=480",
        likes: 51,
        tags: ["#Hydration"],
        freeDelivery: true
      },
      {
        id: "D00351",
        name: "Evening Care Set(4 Pcs per Set)",
        price: 2805.0,
        formattedPrice: "₹ 2,805.00",
        image: "https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480",
        likes: 245,
        tags: ["#DeepCleansing"]
      },
      {
        id: "D04006",
        name: "Atomy Algae Omega3",
        price: 5200.0,
        formattedPrice: "₹ 5,200.00",
        image: "https://image.atomy.com/IN/goods/D04006/D04006_00.jpg?w=480&h=480",
        gstReduced: true,
        isVeg: true,
        likes: 62,
        tags: ["#GST REDUCED"]
      },
      {
        id: "D00601",
        name: "Atomy Herbal Hair Shampoo (500ml)",
        price: 1100.0,
        formattedPrice: "₹ 1,100.00",
        image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
        likes: 198,
        tags: ["#HerbalFormula"]
      },
      {
        id: "D00501",
        name: "Atomy Toothpaste Set (200g x 5 Tubes)",
        price: 1250.0,
        formattedPrice: "₹ 1,250.00",
        image: "https://image.atomy.com/IN/goods/D00501/D00501_00.jpg?w=480&h=480",
        likes: 310,
        tags: ["#PropolisOralCare"]
      }
    ]
  }
};

const OFFICIAL_RECOMMENDED_PRODUCTS_BY_CATEGORY = {
  beauty: [
    {
      id: "D00354",
      name: "Evening Care Foam Cleanser",
      price: 900.0,
      formattedPrice: "₹ 900.00",
      image: "https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480",
      likes: 287,
      category: "beauty"
    },
    {
      id: "D00281",
      name: "Sunscreen SPF50+ PA+++ (Beige )",
      price: 900.0,
      formattedPrice: "₹ 900.00",
      image: "https://image.atomy.com/IN/goods/D00281/org/440/251119000048440.jpg?w=480&h=480",
      likes: 345,
      category: "beauty"
    },
    {
      id: "D00282",
      name: "Sunscreen SPF50+ PA+++ (White )",
      price: 900.0,
      formattedPrice: "₹ 900.00",
      image: "https://image.atomy.com/IN/goods/D00282/org/440/251119000048440.jpg?w=480&h=480",
      likes: 167,
      category: "beauty"
    },
    {
      id: "D00351",
      name: "Evening Care Set(4 Pcs per Set)",
      price: 3300.0,
      formattedPrice: "₹ 3,300.00",
      image: "https://image.atomy.com/IN/goods/D00351/D00351_00.jpg?w=480&h=480",
      likes: 246,
      category: "beauty"
    },
    {
      id: "D00757",
      name: "Hydra Brightening Care Set (2 Pcs per Set)",
      price: 3000.0,
      formattedPrice: "₹ 3,000.00",
      image: "https://image.atomy.com/IN/goods/D00757/D00757_00.jpg?w=480&h=480",
      likes: 223,
      category: "beauty"
    }
  ],
  health: [
    {
      id: "D04006",
      name: "Atomy Algae Omega3",
      price: 5200.0,
      formattedPrice: "₹ 5,200.00",
      image: "https://image.atomy.com/IN/goods/D04006/D04006_00.jpg?w=480&h=480",
      likes: 185,
      category: "health"
    },
    {
      id: "D94084",
      name: "Atomy 100% PURE* Spirulina",
      price: 1799.0,
      formattedPrice: "₹ 1,799.00",
      image: "https://image.atomy.com/IN/goods/D94084/org/083/260501000052083.png?w=480&h=480",
      likes: 312,
      category: "health"
    },
    {
      id: "D00171",
      name: "Atomy Rhodiola Milk Thistle",
      price: 2400.0,
      formattedPrice: "₹ 2,400.00",
      image: "https://image.atomy.com/IN/goods/D00171/D00171_00.jpg?w=480&h=480",
      likes: 198,
      category: "health"
    },
    {
      id: "D94085",
      name: "Atomy Shilajit Capsules",
      price: 849.0,
      formattedPrice: "₹ 849.00",
      image: "https://image.atomy.com/IN/goods/D94085/org/907/260422000051907.jpeg?w=480&h=480",
      likes: 225,
      category: "health"
    },
    {
      id: "D04086",
      name: "Atomy Moringa",
      price: 799.0,
      formattedPrice: "₹ 799.00",
      image: "https://image.atomy.com/IN/goods/D04086/D04086_00.jpg?w=480&h=480",
      likes: 188,
      category: "health"
    }
  ],
  food: [
    {
      id: "D00901",
      name: "Atomy Cafe Arabica (50T)",
      price: 1050.0,
      formattedPrice: "₹ 1,050.00",
      image: "https://image.atomy.com/IN/goods/D00901/D00901_00.jpg?w=480&h=480",
      likes: 178,
      category: "food"
    },
    {
      id: "D00921",
      name: "Atomy Roasted Seasoned Seaweed",
      price: 1100.0,
      formattedPrice: "₹ 1,100.00",
      image: "https://image.atomy.com/IN/goods/D00921/D00921_00.jpg?w=480&h=480",
      likes: 142,
      category: "food"
    },
    {
      id: "D00915",
      name: "Atomy Potato Ramen (4 Packs)",
      price: 950.0,
      formattedPrice: "₹ 950.00",
      image: "https://image.atomy.com/IN/goods/D00915/D00915_00.jpg?w=480&h=480",
      likes: 210,
      category: "food"
    },
    {
      id: "D00930",
      name: "Atomy Organic Olive Oil Roasted Laver",
      price: 1250.0,
      formattedPrice: "₹ 1,250.00",
      image: "https://image.atomy.com/IN/goods/D00921/D00921_00.jpg?w=480&h=480",
      likes: 115,
      category: "food"
    },
    {
      id: "D00940",
      name: "Atomy Black Bean Soybean Paste",
      price: 880.0,
      formattedPrice: "₹ 880.00",
      image: "https://image.atomy.com/IN/goods/D00901/D00901_00.jpg?w=480&h=480",
      likes: 98,
      category: "food"
    }
  ],
  personal_care: [
    {
      id: "D00501",
      name: "Atomy Toothpaste Set (200g x 5 Tubes)",
      price: 1250.0,
      formattedPrice: "₹ 1,250.00",
      image: "https://image.atomy.com/IN/goods/D00501/D00501_00.jpg?w=480&h=480",
      likes: 310,
      category: "personal_care"
    },
    {
      id: "D00510",
      name: "Atomy Toothbrush Set (8 Pcs)",
      price: 850.0,
      formattedPrice: "₹ 850.00",
      image: "https://image.atomy.com/IN/goods/D00510/D00510_00.jpg?w=480&h=480",
      likes: 265,
      category: "personal_care"
    },
    {
      id: "D00601",
      name: "Atomy Herbal Hair Shampoo (500ml)",
      price: 1100.0,
      formattedPrice: "₹ 1,100.00",
      image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
      likes: 198,
      category: "personal_care"
    },
    {
      id: "D00602",
      name: "Atomy Herbal Hair Treatment (200ml)",
      price: 900.0,
      formattedPrice: "₹ 900.00",
      image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
      likes: 154,
      category: "personal_care"
    },
    {
      id: "D00603",
      name: "Atomy Herbal Body Cleanser (500ml)",
      price: 950.0,
      formattedPrice: "₹ 950.00",
      image: "https://image.atomy.com/IN/goods/D00601/D00601_00.jpg?w=480&h=480",
      likes: 182,
      category: "personal_care"
    }
  ],
  home: [
    {
      id: "D00801",
      name: "Atomy Dish Detergent (1000ml)",
      price: 750.0,
      formattedPrice: "₹ 750.00",
      image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
      likes: 220,
      category: "home"
    },
    {
      id: "D00802",
      name: "Atomy Fabric Detergent (2kg)",
      price: 1100.0,
      formattedPrice: "₹ 1,100.00",
      image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
      likes: 195,
      category: "home"
    },
    {
      id: "D00803",
      name: "Atomy Fabric Softener (2000ml)",
      price: 950.0,
      formattedPrice: "₹ 950.00",
      image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
      likes: 140,
      category: "home"
    },
    {
      id: "D00804",
      name: "Atomy Latex Gloves (Natural Rubber)",
      price: 350.0,
      formattedPrice: "₹ 350.00",
      image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
      likes: 85,
      category: "home"
    },
    {
      id: "D00805",
      name: "Atomy Stainless Steel Scrubber (2 Pcs)",
      price: 320.0,
      formattedPrice: "₹ 320.00",
      image: "https://image.atomy.com/IN/goods/D00801/D00801_00.jpg?w=480&h=480",
      likes: 72,
      category: "home"
    }
  ]
};

const getRelatedProducts = (currentProduct) => {
  if (!currentProduct) return OFFICIAL_RECOMMENDED_PRODUCTS_BY_CATEGORY.beauty;
  const name = (currentProduct.name || '').toLowerCase();
  const cat = (currentProduct.category || '').toLowerCase();

  // If viewing HemoHIM, official Atomy site features the Beauty recommendation set (User Screenshot 4!)
  if (name.includes('hemohim') || currentProduct.id === 'D00101') {
    return OFFICIAL_RECOMMENDED_PRODUCTS_BY_CATEGORY.beauty;
  }
  if (cat.includes('food') || name.includes('cafe') || name.includes('ramen') || name.includes('tea')) {
    return OFFICIAL_RECOMMENDED_PRODUCTS_BY_CATEGORY.food.filter(p => p.id !== currentProduct.id);
  }
  if (cat.includes('personal') || cat.includes('hair') || cat.includes('body') || name.includes('toothpaste') || name.includes('toothbrush')) {
    return OFFICIAL_RECOMMENDED_PRODUCTS_BY_CATEGORY.personal_care.filter(p => p.id !== currentProduct.id);
  }
  if (cat.includes('home') || name.includes('detergent')) {
    return OFFICIAL_RECOMMENDED_PRODUCTS_BY_CATEGORY.home.filter(p => p.id !== currentProduct.id);
  }
  if (cat.includes('health') || name.includes('omega') || name.includes('spirulina') || name.includes('shilajit')) {
    return OFFICIAL_RECOMMENDED_PRODUCTS_BY_CATEGORY.health.filter(p => p.id !== currentProduct.id);
  }
  // Default to Beauty (Screen 4)
  return OFFICIAL_RECOMMENDED_PRODUCTS_BY_CATEGORY.beauty.filter(p => p.id !== currentProduct.id);
};


module.exports = { CATEGORY_CONFIGS, CATEGORIES };