export interface WorkDomain {
  id: string;
  name: string;
  category: string;
  payoutType: 'DAILY' | 'PER_TRIP' | 'WEEKLY' | 'MONTHLY';
  defaultInflow: number;
  defaultDailyEarnings: number;
  suggestedBracket: 'entry' | 'standard' | 'high';
  iconName?: string;
  tags?: string[];
}

export const WORK_DOMAINS: WorkDomain[] = [
  // ============================================================================
  // 1. FOOD DELIVERY & QUICK COMMERCE (15 domains)
  // ============================================================================
  {
    id: "food-swiggy",
    name: "Swiggy Food & Instamart Delivery Partner",
    category: "Food Delivery & Quick Commerce",
    payoutType: "WEEKLY",
    defaultInflow: 38500,
    defaultDailyEarnings: 1450,
    suggestedBracket: "standard",
    tags: ["swiggy", "food", "instamart", "delivery", "rider"]
  },
  {
    id: "food-zomato",
    name: "Zomato Delivery Fleet Partner",
    category: "Food Delivery & Quick Commerce",
    payoutType: "WEEKLY",
    defaultInflow: 36000,
    defaultDailyEarnings: 1380,
    suggestedBracket: "standard",
    tags: ["zomato", "food", "rider", "fleet"]
  },
  {
    id: "food-zepto",
    name: "Zepto 10-Min Quick Commerce Dispatcher",
    category: "Food Delivery & Quick Commerce",
    payoutType: "WEEKLY",
    defaultInflow: 34500,
    defaultDailyEarnings: 1320,
    suggestedBracket: "standard",
    tags: ["zepto", "grocery", "dark store", "dispatch"]
  },
  {
    id: "food-blinkit",
    name: "Blinkit Express Delivery Executive",
    category: "Food Delivery & Quick Commerce",
    payoutType: "WEEKLY",
    defaultInflow: 35000,
    defaultDailyEarnings: 1340,
    suggestedBracket: "standard",
    tags: ["blinkit", "groceries", "express", "delivery"]
  },
  {
    id: "food-bigbasket",
    name: "BigBasket Daily Morning Milk & Bread Dispatcher",
    category: "Food Delivery & Quick Commerce",
    payoutType: "MONTHLY",
    defaultInflow: 26000,
    defaultDailyEarnings: 1000,
    suggestedBracket: "standard",
    tags: ["bigbasket", "bbdaily", "morning", "milk"]
  },
  {
    id: "food-dunzo",
    name: "Dunzo On-Demand Delivery Runner",
    category: "Food Delivery & Quick Commerce",
    payoutType: "WEEKLY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["dunzo", "errand", "pickup", "delivery"]
  },
  {
    id: "food-magicpin",
    name: "Magicpin / ONDC Logistics Delivery Captain",
    category: "Food Delivery & Quick Commerce",
    payoutType: "WEEKLY",
    defaultInflow: 29000,
    defaultDailyEarnings: 1100,
    suggestedBracket: "standard",
    tags: ["magicpin", "ondc", "food"]
  },
  {
    id: "food-eatclub",
    name: "EatClub / Box8 Dedicated Fleet Driver",
    category: "Food Delivery & Quick Commerce",
    payoutType: "WEEKLY",
    defaultInflow: 32000,
    defaultDailyEarnings: 1220,
    suggestedBracket: "standard",
    tags: ["box8", "eatclub", "meals"]
  },
  {
    id: "food-dominos",
    name: "Domino's Pizza Delivery Partner",
    category: "Food Delivery & Quick Commerce",
    payoutType: "MONTHLY",
    defaultInflow: 24000,
    defaultDailyEarnings: 920,
    suggestedBracket: "entry",
    tags: ["dominos", "pizza", "fast food"]
  },
  {
    id: "food-cloud-kitchen",
    name: "Cloud Kitchen Internal Dispatch Runner",
    category: "Food Delivery & Quick Commerce",
    payoutType: "MONTHLY",
    defaultInflow: 23000,
    defaultDailyEarnings: 880,
    suggestedBracket: "entry",
    tags: ["kitchen", "runner", "food"]
  },
  {
    id: "food-milkbasket",
    name: "MilkBasket Early Morning Hub Delivery",
    category: "Food Delivery & Quick Commerce",
    payoutType: "MONTHLY",
    defaultInflow: 22000,
    defaultDailyEarnings: 850,
    suggestedBracket: "entry",
    tags: ["milkbasket", "milk", "hub"]
  },
  {
    id: "food-licious",
    name: "Licious Meat & Seafood Delivery Executive",
    category: "Food Delivery & Quick Commerce",
    payoutType: "WEEKLY",
    defaultInflow: 31000,
    defaultDailyEarnings: 1190,
    suggestedBracket: "standard",
    tags: ["licious", "meat", "seafood"]
  },
  {
    id: "food-country-delight",
    name: "Country Delight Pure Milk & Dairy Delivery",
    category: "Food Delivery & Quick Commerce",
    payoutType: "MONTHLY",
    defaultInflow: 25000,
    defaultDailyEarnings: 960,
    suggestedBracket: "entry",
    tags: ["country delight", "dairy", "milk"]
  },
  {
    id: "food-fipola",
    name: "Specialty Fresh Food & Butchery Dispatcher",
    category: "Food Delivery & Quick Commerce",
    payoutType: "WEEKLY",
    defaultInflow: 27000,
    defaultDailyEarnings: 1040,
    suggestedBracket: "standard",
    tags: ["butchery", "fresh food", "dispatcher"]
  },
  {
    id: "food-tiffin",
    name: "Dabbawala / Home Tiffin Service Carrier",
    category: "Food Delivery & Quick Commerce",
    payoutType: "MONTHLY",
    defaultInflow: 21000,
    defaultDailyEarnings: 800,
    suggestedBracket: "entry",
    tags: ["dabbawala", "tiffin", "lunchbox"]
  },

  // ============================================================================
  // 2. RIDE-HAILING & MOBILITY (15 domains)
  // ============================================================================
  {
    id: "mobility-uber-premier",
    name: "Uber Premier & Sedan Ride Driver",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 52000,
    defaultDailyEarnings: 2000,
    suggestedBracket: "high",
    tags: ["uber", "sedan", "cab", "driver"]
  },
  {
    id: "mobility-uber-auto",
    name: "Uber Auto Rickshaw Partner",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 39000,
    defaultDailyEarnings: 1500,
    suggestedBracket: "standard",
    tags: ["uber", "auto", "three wheeler"]
  },
  {
    id: "mobility-uber-moto",
    name: "Uber Moto Bike Taxi Captain",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["uber moto", "bike taxi", "rider"]
  },
  {
    id: "mobility-ola-prime",
    name: "Ola Prime & Cab Partner Driver",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 48000,
    defaultDailyEarnings: 1850,
    suggestedBracket: "high",
    tags: ["ola", "cab", "prime", "driver"]
  },
  {
    id: "mobility-ola-auto",
    name: "Ola Auto Rickshaw Partner",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 38000,
    defaultDailyEarnings: 1460,
    suggestedBracket: "standard",
    tags: ["ola auto", "rickshaw"]
  },
  {
    id: "mobility-rapido-bike",
    name: "Rapido Bike Taxi Captain",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 29000,
    defaultDailyEarnings: 1110,
    suggestedBracket: "standard",
    tags: ["rapido", "bike taxi", "captain"]
  },
  {
    id: "mobility-rapido-auto",
    name: "Rapido Auto Captain",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 37000,
    defaultDailyEarnings: 1420,
    suggestedBracket: "standard",
    tags: ["rapido", "auto", "captain"]
  },
  {
    id: "mobility-blusmart",
    name: "BluSmart All-Electric Fleet Chauffeur",
    category: "Ride-Hailing & Mobility",
    payoutType: "WEEKLY",
    defaultInflow: 44000,
    defaultDailyEarnings: 1700,
    suggestedBracket: "high",
    tags: ["blusmart", "ev", "electric cab"]
  },
  {
    id: "mobility-indrive",
    name: "inDrive Peer-to-Peer Ride Driver",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 42000,
    defaultDailyEarnings: 1600,
    suggestedBracket: "high",
    tags: ["indrive", "driver", "city"]
  },
  {
    id: "mobility-auto-rickshaw",
    name: "Independent Metered Auto-Rickshaw Driver",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 36000,
    defaultDailyEarnings: 1380,
    suggestedBracket: "standard",
    tags: ["auto", "rickshaw", "tuk tuk"]
  },
  {
    id: "mobility-erickshaw",
    name: "E-Rickshaw / Toto Urban Shuttle Operator",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 30000,
    defaultDailyEarnings: 1150,
    suggestedBracket: "standard",
    tags: ["toto", "e-rickshaw", "shuttle"]
  },
  {
    id: "mobility-yellow-taxi",
    name: "Traditional Yellow-Black / Airport Taxi Driver",
    category: "Ride-Hailing & Mobility",
    payoutType: "DAILY",
    defaultInflow: 46000,
    defaultDailyEarnings: 1770,
    suggestedBracket: "high",
    tags: ["taxi", "airport cab", "yellow black"]
  },
  {
    id: "mobility-personal-chauffeur",
    name: "On-Demand Private Chauffeur / DriveU Driver",
    category: "Ride-Hailing & Mobility",
    payoutType: "PER_TRIP",
    defaultInflow: 33000,
    defaultDailyEarnings: 1270,
    suggestedBracket: "standard",
    tags: ["driveu", "chauffeur", "car driver"]
  },
  {
    id: "mobility-school-van",
    name: "School Van & Children Transit Operator",
    category: "Ride-Hailing & Mobility",
    payoutType: "MONTHLY",
    defaultInflow: 32000,
    defaultDailyEarnings: 1230,
    suggestedBracket: "standard",
    tags: ["school van", "van driver"]
  },
  {
    id: "mobility-tourist-cab",
    name: "Outstation Tourist & Pilgrimage Cab Driver",
    category: "Ride-Hailing & Mobility",
    payoutType: "PER_TRIP",
    defaultInflow: 55000,
    defaultDailyEarnings: 2100,
    suggestedBracket: "high",
    tags: ["outstation", "tourist cab", "pilgrim"]
  },

  // ============================================================================
  // 3. LOGISTICS & FREIGHT (15 domains)
  // ============================================================================
  {
    id: "logistics-porter-truck",
    name: "Porter Mini Truck / Tata Ace Partner Driver",
    category: "Logistics & Freight",
    payoutType: "DAILY",
    defaultInflow: 50000,
    defaultDailyEarnings: 1920,
    suggestedBracket: "high",
    tags: ["porter", "tata ace", "mini truck", "goods"]
  },
  {
    id: "logistics-porter-bike",
    name: "Porter Two-Wheeler Enterprise Courier",
    category: "Logistics & Freight",
    payoutType: "DAILY",
    defaultInflow: 30000,
    defaultDailyEarnings: 1150,
    suggestedBracket: "standard",
    tags: ["porter", "courier", "2-wheeler"]
  },
  {
    id: "logistics-shadowfax",
    name: "Shadowfax Hub & Last-Mile Delivery Associate",
    category: "Logistics & Freight",
    payoutType: "WEEKLY",
    defaultInflow: 33000,
    defaultDailyEarnings: 1270,
    suggestedBracket: "standard",
    tags: ["shadowfax", "hub", "delivery"]
  },
  {
    id: "logistics-delhivery",
    name: "Delhivery Parcel Delivery Rider",
    category: "Logistics & Freight",
    payoutType: "MONTHLY",
    defaultInflow: 29000,
    defaultDailyEarnings: 1110,
    suggestedBracket: "standard",
    tags: ["delhivery", "ecommerce", "parcels"]
  },
  {
    id: "logistics-amazon-flex",
    name: "Amazon Flex Independent Delivery Partner",
    category: "Logistics & Freight",
    payoutType: "WEEKLY",
    defaultInflow: 35000,
    defaultDailyEarnings: 1350,
    suggestedBracket: "standard",
    tags: ["amazon", "amazon flex", "packages"]
  },
  {
    id: "logistics-ekart",
    name: "eKart / Flipkart Logistics Field Executive",
    category: "Logistics & Freight",
    payoutType: "MONTHLY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["ekart", "flipkart", "logistics"]
  },
  {
    id: "logistics-ecom-express",
    name: "Ecom Express Last-Mile Courier",
    category: "Logistics & Freight",
    payoutType: "MONTHLY",
    defaultInflow: 27000,
    defaultDailyEarnings: 1040,
    suggestedBracket: "standard",
    tags: ["ecom express", "courier"]
  },
  {
    id: "logistics-blue-dart",
    name: "Blue Dart Air Express Feeder Delivery",
    category: "Logistics & Freight",
    payoutType: "MONTHLY",
    defaultInflow: 31000,
    defaultDailyEarnings: 1190,
    suggestedBracket: "standard",
    tags: ["blue dart", "express", "courier"]
  },
  {
    id: "logistics-xpressbees",
    name: "Xpressbees Parcel Courier Dispatcher",
    category: "Logistics & Freight",
    payoutType: "MONTHLY",
    defaultInflow: 27500,
    defaultDailyEarnings: 1060,
    suggestedBracket: "standard",
    tags: ["xpressbees", "parcels"]
  },
  {
    id: "logistics-shiprocket",
    name: "Shiprocket Quick-Courier Delivery Partner",
    category: "Logistics & Freight",
    payoutType: "WEEKLY",
    defaultInflow: 30000,
    defaultDailyEarnings: 1150,
    suggestedBracket: "standard",
    tags: ["shiprocket", "d2c courier"]
  },
  {
    id: "logistics-hamali-porter",
    name: "Market Freight Hamali / Truck Loader & Unloader",
    category: "Logistics & Freight",
    payoutType: "DAILY",
    defaultInflow: 26000,
    defaultDailyEarnings: 1000,
    suggestedBracket: "standard",
    tags: ["hamali", "loader", "mandi", "labor"]
  },
  {
    id: "logistics-warehouse-sorter",
    name: "E-Commerce Fulfillment Warehouse Sorter",
    category: "Logistics & Freight",
    payoutType: "MONTHLY",
    defaultInflow: 22000,
    defaultDailyEarnings: 850,
    suggestedBracket: "entry",
    tags: ["warehouse", "sorter", "picker"]
  },
  {
    id: "logistics-lpg-cylinder",
    name: "LPG Gas Cylinder Household Delivery Porter",
    category: "Logistics & Freight",
    payoutType: "DAILY",
    defaultInflow: 25000,
    defaultDailyEarnings: 960,
    suggestedBracket: "entry",
    tags: ["lpg", "gas cylinder", "delivery"]
  },
  {
    id: "logistics-water-tanker",
    name: "Commercial Water Tanker Driver & Assistant",
    category: "Logistics & Freight",
    payoutType: "DAILY",
    defaultInflow: 34000,
    defaultDailyEarnings: 1300,
    suggestedBracket: "standard",
    tags: ["water tanker", "driver"]
  },
  {
    id: "logistics-intercity-driver",
    name: "Heavy Commercial Truck Co-Driver / Cleaner",
    category: "Logistics & Freight",
    payoutType: "PER_TRIP",
    defaultInflow: 36000,
    defaultDailyEarnings: 1380,
    suggestedBracket: "standard",
    tags: ["truck driver", "heavy vehicle", "highway"]
  },

  // ============================================================================
  // 4. STREET VENDORS & MICRO-STALLS (15 domains)
  // ============================================================================
  {
    id: "vendor-chai-stall",
    name: "Tea Stall & Chai / Bun-Maska Kiosk Owner",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 45000,
    defaultDailyEarnings: 1730,
    suggestedBracket: "high",
    tags: ["chai", "tea stall", "tapri", "tea kiosk"]
  },
  {
    id: "vendor-chaat-streetfood",
    name: "Street Food, Pani Puri & Chaat Cart Operator",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 42000,
    defaultDailyEarnings: 1610,
    suggestedBracket: "high",
    tags: ["chaat", "pani puri", "golgappa", "street food"]
  },
  {
    id: "vendor-fruits-veg",
    name: "Fresh Fruit & Vegetable Pushcart Vendor",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 32000,
    defaultDailyEarnings: 1230,
    suggestedBracket: "standard",
    tags: ["vegetables", "fruits", "thela", "pushcart"]
  },
  {
    id: "vendor-tender-coconut",
    name: "Tender Coconut (Daab / Elaneer) Seller",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 38000,
    defaultDailyEarnings: 1460,
    suggestedBracket: "standard",
    tags: ["tender coconut", "nariyal pani", "daab"]
  },
  {
    id: "vendor-flower-garland",
    name: "Temple Flower Garland & Pooja Vendor",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 26000,
    defaultDailyEarnings: 1000,
    suggestedBracket: "standard",
    tags: ["flowers", "pooja", "garlands", "temple"]
  },
  {
    id: "vendor-sugarcane-juice",
    name: "Sugarcane Juice Mobile Crusher Kiosk",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 35000,
    defaultDailyEarnings: 1350,
    suggestedBracket: "standard",
    tags: ["sugarcane juice", "ganne ka ras", "beverages"]
  },
  {
    id: "vendor-paan-tobacco",
    name: "Paan, Mukhwas & Confectionery Shop Operator",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 39000,
    defaultDailyEarnings: 1500,
    suggestedBracket: "standard",
    tags: ["paan", "paan shop", "kiosk"]
  },
  {
    id: "vendor-roasted-corn",
    name: "Roasted Corn (Bhutta / Chhutta) Cart Vendor",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 20000,
    defaultDailyEarnings: 770,
    suggestedBracket: "entry",
    tags: ["bhutta", "corn", "street cart"]
  },
  {
    id: "vendor-idli-dosa-cart",
    name: "Morning Idli, Vada & Dosa Tiffin Cart",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 44000,
    defaultDailyEarnings: 1690,
    suggestedBracket: "high",
    tags: ["idli", "dosa", "tiffin cart", "breakfast"]
  },
  {
    id: "vendor-momos-rolls",
    name: "Evening Momos, Rolls & Noodles Cart Stall",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 41000,
    defaultDailyEarnings: 1580,
    suggestedBracket: "standard",
    tags: ["momos", "egg rolls", "noodles", "fast food"]
  },
  {
    id: "vendor-kulfi-icecream",
    name: "Matka Kulfi & Pushcart Ice Cream Vendor",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 24000,
    defaultDailyEarnings: 920,
    suggestedBracket: "entry",
    tags: ["kulfi", "ice cream", "dessert"]
  },
  {
    id: "vendor-roasted-peanuts",
    name: "Roasted Peanuts, Chana & Jhalmuri Hawker",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 18000,
    defaultDailyEarnings: 690,
    suggestedBracket: "entry",
    tags: ["peanuts", "chana", "jhalmuri", "snacks"]
  },
  {
    id: "vendor-citrus-juice",
    name: "Mosambi & Orange Fresh Squeezed Juice Stall",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 36000,
    defaultDailyEarnings: 1380,
    suggestedBracket: "standard",
    tags: ["fruit juice", "mosambi", "citrus"]
  },
  {
    id: "vendor-samosa-kachori",
    name: "Fresh Samosa, Kachori & Jalebi Fry Stall",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "DAILY",
    defaultInflow: 46000,
    defaultDailyEarnings: 1770,
    suggestedBracket: "high",
    tags: ["samosa", "kachori", "jalebi", "snacks"]
  },
  {
    id: "vendor-newspaper-stand",
    name: "Morning Newspaper & Magazine Distribution Stand",
    category: "Street Vendors & Micro-Stalls",
    payoutType: "MONTHLY",
    defaultInflow: 19000,
    defaultDailyEarnings: 730,
    suggestedBracket: "entry",
    tags: ["newspaper", "magazines", "hawker"]
  },

  // ============================================================================
  // 5. CONSTRUCTION & CIVIL TRADES (15 domains)
  // ============================================================================
  {
    id: "const-mason",
    name: "Master Mason / Rajmistri (Brickwork & Stone)",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 32000,
    defaultDailyEarnings: 1230,
    suggestedBracket: "standard",
    tags: ["mason", "rajmistri", "brickwork", "construction"]
  },
  {
    id: "const-shuttering",
    name: "Shuttering & Formwork Carpenter",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 30000,
    defaultDailyEarnings: 1150,
    suggestedBracket: "standard",
    tags: ["shuttering", "formwork", "carpentry"]
  },
  {
    id: "const-rebar-binder",
    name: "Rebar Bender & Concrete Steel Rod Binder",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["rebar", "saria", "steel binder", "rod bender"]
  },
  {
    id: "const-tile-marble",
    name: "Tile, Granite & Marble Flooring Setter",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 35000,
    defaultDailyEarnings: 1350,
    suggestedBracket: "standard",
    tags: ["tiles", "marble", "granite", "flooring"]
  },
  {
    id: "const-earthwork-beldar",
    name: "Earthwork Digger & Construction Laborer (Beldar)",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 21000,
    defaultDailyEarnings: 800,
    suggestedBracket: "entry",
    tags: ["beldar", "earthwork", "laborer", "digging"]
  },
  {
    id: "const-scaffolding",
    name: "High-Rise Scaffolding Rigger & Erector",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 29000,
    defaultDailyEarnings: 1110,
    suggestedBracket: "standard",
    tags: ["scaffolding", "rigger", "papad"]
  },
  {
    id: "const-plasterer",
    name: "Cement & Wall Plastering Specialist",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 27000,
    defaultDailyEarnings: 1040,
    suggestedBracket: "standard",
    tags: ["plasterer", "cement plaster"]
  },
  {
    id: "const-painter",
    name: "House Painter & Texture Finish Specialist",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 31000,
    defaultDailyEarnings: 1190,
    suggestedBracket: "standard",
    tags: ["painter", "painting", "distemper", "polish"]
  },
  {
    id: "const-pop-ceiling",
    name: "POP (Plaster of Paris) & False Ceiling Worker",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 33000,
    defaultDailyEarnings: 1270,
    suggestedBracket: "standard",
    tags: ["pop", "false ceiling", "gypsum"]
  },
  {
    id: "const-concrete-mixer",
    name: "Concrete Mixer Machine Operator",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 26000,
    defaultDailyEarnings: 1000,
    suggestedBracket: "standard",
    tags: ["concrete", "mixer operator"]
  },
  {
    id: "const-demolition",
    name: "Core Cutter & Wall Demolition Laborer",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 25000,
    defaultDailyEarnings: 960,
    suggestedBracket: "entry",
    tags: ["demolition", "core cutter"]
  },
  {
    id: "const-brick-kiln",
    name: "Brick Kiln Molding & Baking Worker",
    category: "Construction & Civil Trades",
    payoutType: "MONTHLY",
    defaultInflow: 19000,
    defaultDailyEarnings: 730,
    suggestedBracket: "entry",
    tags: ["brick kiln", "eent bhatta"]
  },
  {
    id: "const-stone-cutter",
    name: "Stone Quarry Cutter & Chisel Mason",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["stone cutter", "quarry"]
  },
  {
    id: "const-waterproofing",
    name: "Terrace & Basement Waterproofing Applicator",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 34000,
    defaultDailyEarnings: 1300,
    suggestedBracket: "standard",
    tags: ["waterproofing", "terrace coat"]
  },
  {
    id: "const-road-laborer",
    name: "Bitumen Road Paving & Asphalt Layer",
    category: "Construction & Civil Trades",
    payoutType: "DAILY",
    defaultInflow: 22000,
    defaultDailyEarnings: 850,
    suggestedBracket: "entry",
    tags: ["road paving", "tar", "asphalt"]
  },

  // ============================================================================
  // 6. HOME TRADES & MAINTENANCE (15 domains)
  // ============================================================================
  {
    id: "trade-electrician",
    name: "Residential Electrician & Wireman",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 39000,
    defaultDailyEarnings: 1500,
    suggestedBracket: "standard",
    tags: ["electrician", "wiring", "appliances", "urban company"]
  },
  {
    id: "trade-plumber",
    name: "Pipe Plumber & Sanitary Fitting Technician",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 37000,
    defaultDailyEarnings: 1420,
    suggestedBracket: "standard",
    tags: ["plumber", "pipe fitting", "bathroom"]
  },
  {
    id: "trade-carpenter",
    name: "Custom Furniture Carpenter & Woodworker",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 38000,
    defaultDailyEarnings: 1460,
    suggestedBracket: "standard",
    tags: ["carpenter", "furniture", "woodwork"]
  },
  {
    id: "trade-two-wheeler-mech",
    name: "Motorcycle & Scooter Repair Mechanic",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 41000,
    defaultDailyEarnings: 1580,
    suggestedBracket: "standard",
    tags: ["mechanic", "bike service", "two wheeler"]
  },
  {
    id: "trade-car-washer",
    name: "Apartment Daily Car Cleaner & Detailer",
    category: "Home Trades & Maintenance",
    payoutType: "MONTHLY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["car wash", "cleaning", "society cleaner"]
  },
  {
    id: "trade-tyre-puncture",
    name: "Tyre Puncture & Wheel Alignment Specialist",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 32000,
    defaultDailyEarnings: 1230,
    suggestedBracket: "standard",
    tags: ["puncture", "tyre", "air filling"]
  },
  {
    id: "trade-ac-technician",
    name: "Air Conditioner (AC) Repair & Gas Charging Tech",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 50000,
    defaultDailyEarnings: 1920,
    suggestedBracket: "high",
    tags: ["ac tech", "air conditioner", "refrigeration"]
  },
  {
    id: "trade-welder",
    name: "Fabrication Arc & Gas Welder (Grills & Gates)",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 36000,
    defaultDailyEarnings: 1380,
    suggestedBracket: "standard",
    tags: ["welder", "fabrication", "grills"]
  },
  {
    id: "trade-locksmith",
    name: "Key Maker & Lock Repair Technician",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 30000,
    defaultDailyEarnings: 1150,
    suggestedBracket: "standard",
    tags: ["locksmith", "key maker", "locks"]
  },
  {
    id: "trade-appliance-repair",
    name: "Washing Machine & Refrigerator Repair Tech",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 43000,
    defaultDailyEarnings: 1650,
    suggestedBracket: "high",
    tags: ["appliance", "fridge", "washing machine"]
  },
  {
    id: "trade-pest-control",
    name: "Residential Pest Control Applicator",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 33000,
    defaultDailyEarnings: 1270,
    suggestedBracket: "standard",
    tags: ["pest control", "termites"]
  },
  {
    id: "trade-gas-stove-repair",
    name: "Gas Stove & Hob Burner Repairer",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 25000,
    defaultDailyEarnings: 960,
    suggestedBracket: "entry",
    tags: ["gas stove", "burner repair"]
  },
  {
    id: "trade-mattress-fluffer",
    name: "Cotton Quilt & Mattress Carder (Dhunia)",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 20000,
    defaultDailyEarnings: 770,
    suggestedBracket: "entry",
    tags: ["mattress", "dhunia", "cotton"]
  },
  {
    id: "trade-watch-repairer",
    name: "Watch & Wall Clock Repair Technician",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 24000,
    defaultDailyEarnings: 920,
    suggestedBracket: "entry",
    tags: ["watch repair", "clocks"]
  },
  {
    id: "trade-bicycle-mechanic",
    name: "Bicycle & Gear Cycle Repair Mechanic",
    category: "Home Trades & Maintenance",
    payoutType: "DAILY",
    defaultInflow: 22000,
    defaultDailyEarnings: 850,
    suggestedBracket: "entry",
    tags: ["bicycle", "cycle repair"]
  },

  // ============================================================================
  // 7. DOMESTIC & CAREGIVING (15 domains)
  // ============================================================================
  {
    id: "care-maid-housekeeper",
    name: "Multi-Household Domestic Maid & Housekeeper",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 26000,
    defaultDailyEarnings: 1000,
    suggestedBracket: "standard",
    tags: ["maid", "domestic helper", "cleaning"]
  },
  {
    id: "care-home-cook",
    name: "Private Home Cook / Maharaj",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 32000,
    defaultDailyEarnings: 1230,
    suggestedBracket: "standard",
    tags: ["cook", "maharaj", "home food"]
  },
  {
    id: "care-elderly-assistant",
    name: "Elderly Patient Care Assistant / Attendant",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["elderly care", "patient attendant", "nursing"]
  },
  {
    id: "care-babysitter",
    name: "Babysitter & Child Daycare Nanny",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 24000,
    defaultDailyEarnings: 920,
    suggestedBracket: "entry",
    tags: ["babysitter", "nanny", "child care"]
  },
  {
    id: "care-neighborhood-barber",
    name: "Neighborhood Barber & Grooming Salon Stylist",
    category: "Domestic & Caregiving",
    payoutType: "DAILY",
    defaultInflow: 39000,
    defaultDailyEarnings: 1500,
    suggestedBracket: "standard",
    tags: ["barber", "haircut", "salon"]
  },
  {
    id: "care-dhobi-ironing",
    name: "Traditional Laundry & Charcoal Ironing (Dhobi)",
    category: "Domestic & Caregiving",
    payoutType: "DAILY",
    defaultInflow: 27000,
    defaultDailyEarnings: 1040,
    suggestedBracket: "standard",
    tags: ["dhobi", "ironing", "laundry", "presswala"]
  },
  {
    id: "care-waste-collector",
    name: "Municipal / Door-to-Door Waste Segregator",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 19000,
    defaultDailyEarnings: 730,
    suggestedBracket: "entry",
    tags: ["waste collector", "safai", "recycling"]
  },
  {
    id: "care-society-guard",
    name: "Residential Society Security Guard",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 18000,
    defaultDailyEarnings: 690,
    suggestedBracket: "entry",
    tags: ["security guard", "watchman", "chowkidar"]
  },
  {
    id: "care-gardener-mali",
    name: "Landscape & Society Maintenance Gardener (Mali)",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 22000,
    defaultDailyEarnings: 850,
    suggestedBracket: "entry",
    tags: ["mali", "gardener", "plants"]
  },
  {
    id: "care-pet-walker",
    name: "Urban Dog Walker & Pet Caregiver",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 25000,
    defaultDailyEarnings: 960,
    suggestedBracket: "entry",
    tags: ["pet walker", "dog care"]
  },
  {
    id: "care-office-boy",
    name: "Commercial Office Boy & Pantry Assistant",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 18500,
    defaultDailyEarnings: 710,
    suggestedBracket: "entry",
    tags: ["office boy", "peon", "pantry"]
  },
  {
    id: "care-postnatal-jinki",
    name: "Post-Natal Mother & Infant Caregiver (Jinki)",
    category: "Domestic & Caregiving",
    payoutType: "MONTHLY",
    defaultInflow: 35000,
    defaultDailyEarnings: 1350,
    suggestedBracket: "standard",
    tags: ["postnatal", "jinki", "newborn care"]
  },
  {
    id: "care-deep-cleaner",
    name: "Urban Company Deep Cleaning Crew Specialist",
    category: "Domestic & Caregiving",
    payoutType: "WEEKLY",
    defaultInflow: 36000,
    defaultDailyEarnings: 1380,
    suggestedBracket: "standard",
    tags: ["cleaning", "deep clean", "urban company"]
  },
  {
    id: "care-beautician-home",
    name: "Home Visit Beautician & Waxing Specialist",
    category: "Domestic & Caregiving",
    payoutType: "DAILY",
    defaultInflow: 41000,
    defaultDailyEarnings: 1580,
    suggestedBracket: "standard",
    tags: ["beautician", "salon at home", "facial"]
  },
  {
    id: "care-physio-assistant",
    name: "Home Physiotherapy & Mobility Assistant",
    category: "Domestic & Caregiving",
    payoutType: "DAILY",
    defaultInflow: 38000,
    defaultDailyEarnings: 1460,
    suggestedBracket: "standard",
    tags: ["physio assistant", "rehab"]
  },

  // ============================================================================
  // 8. MICRO-RETAIL & CORNER SHOPS (15 domains)
  // ============================================================================
  {
    id: "retail-kirana-operator",
    name: "Neighborhood Kirana & General Store Operator",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 48000,
    defaultDailyEarnings: 1850,
    suggestedBracket: "high",
    tags: ["kirana", "general store", "grocery shop"]
  },
  {
    id: "retail-xerox-print",
    name: "Xerox, Cyber Cafe & DTP Print Center Owner",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 34000,
    defaultDailyEarnings: 1300,
    suggestedBracket: "standard",
    tags: ["xerox", "photocopy", "dtp", "print shop"]
  },
  {
    id: "retail-mobile-repair",
    name: "Mobile Phone Hardware & Display Repair Shop",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 46000,
    defaultDailyEarnings: 1770,
    suggestedBracket: "high",
    tags: ["mobile repair", "screen replacement", "phones"]
  },
  {
    id: "retail-scrap-kabadi",
    name: "Scrap Aggregator & Recycler (Kabadiwala)",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 40000,
    defaultDailyEarnings: 1540,
    suggestedBracket: "standard",
    tags: ["kabadiwala", "scrap", "recycling", "bhangar"]
  },
  {
    id: "retail-meat-poultry",
    name: "Fresh Poultry Chicken & Mutton Butcher Stall",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 45000,
    defaultDailyEarnings: 1730,
    suggestedBracket: "high",
    tags: ["chicken stall", "butcher", "mutton"]
  },
  {
    id: "retail-fish-market",
    name: "Fresh Fish & Prawn Market Retailer",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 42000,
    defaultDailyEarnings: 1610,
    suggestedBracket: "high",
    tags: ["fish stall", "seafood", "machli market"]
  },
  {
    id: "retail-tailor-alteration",
    name: "Neighborhood Alteration & Tailoring Shop",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 31000,
    defaultDailyEarnings: 1190,
    suggestedBracket: "standard",
    tags: ["tailor", "alteration", "clothing"]
  },
  {
    id: "retail-cobbler-shoes",
    name: "Roadside Footwear Repair Cobbler (Mochi)",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 19000,
    defaultDailyEarnings: 730,
    suggestedBracket: "entry",
    tags: ["cobbler", "mochi", "shoe repair"]
  },
  {
    id: "retail-stationery-bangle",
    name: "Stationery, Cosmetics & Bangle Corner Store",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["stationery", "bangles", "cosmetics"]
  },
  {
    id: "retail-hardware-electrical",
    name: "Micro Hardware & Electrical Sanitary Retailer",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 44000,
    defaultDailyEarnings: 1690,
    suggestedBracket: "high",
    tags: ["hardware shop", "sanitary", "fittings"]
  },
  {
    id: "retail-plasticware-hawker",
    name: "Plasticware & Household Utensil Street Seller",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 24000,
    defaultDailyEarnings: 920,
    suggestedBracket: "entry",
    tags: ["plasticware", "buckets", "utensils"]
  },
  {
    id: "retail-atta-chakki",
    name: "Flour Mill / Spice Grinding Chakki Operator",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 35000,
    defaultDailyEarnings: 1350,
    suggestedBracket: "standard",
    tags: ["atta chakki", "flour mill", "grinding"]
  },
  {
    id: "retail-sweet-shop-clerk",
    name: "Mithai & Farsan Counter Attendant",
    category: "Micro-Retail & Corner Shops",
    payoutType: "MONTHLY",
    defaultInflow: 22000,
    defaultDailyEarnings: 850,
    suggestedBracket: "entry",
    tags: ["mithai", "sweets shop", "farsan"]
  },
  {
    id: "retail-bakery-counter",
    name: "Local Bakery & Pav Toast Counter Seller",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 29000,
    defaultDailyEarnings: 1110,
    suggestedBracket: "standard",
    tags: ["bakery", "bread", "biscuits"]
  },
  {
    id: "retail-egg-wholesaler",
    name: "Daily Egg Crate Retail & Wholesale Supplier",
    category: "Micro-Retail & Corner Shops",
    payoutType: "DAILY",
    defaultInflow: 37000,
    defaultDailyEarnings: 1420,
    suggestedBracket: "standard",
    tags: ["egg wholesale", "poultry supply"]
  },

  // ============================================================================
  // 9. AGRICULTURE, DAIRY & RURAL (15 domains)
  // ============================================================================
  {
    id: "agri-farm-laborer",
    name: "Daily Agricultural Farm Laborer (Khet Mazdoor)",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 18000,
    defaultDailyEarnings: 690,
    suggestedBracket: "entry",
    tags: ["khet mazdoor", "farm laborer", "harvest"]
  },
  {
    id: "agri-dairy-smallholder",
    name: "Smallholder Dairy Producer & Milk Supplier",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 36000,
    defaultDailyEarnings: 1380,
    suggestedBracket: "standard",
    tags: ["dairy", "cow milk", "buffalo", "dairy cooperative"]
  },
  {
    id: "agri-poultry-attendant",
    name: "Poultry Farm & Broiler Shed Attendant",
    category: "Agriculture, Dairy & Rural",
    payoutType: "MONTHLY",
    defaultInflow: 20000,
    defaultDailyEarnings: 770,
    suggestedBracket: "entry",
    tags: ["poultry", "broiler farm", "chicken shed"]
  },
  {
    id: "agri-sugarcane-cutter",
    name: "Seasonal Sugarcane Harvester & Cane Cutter",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 22000,
    defaultDailyEarnings: 850,
    suggestedBracket: "entry",
    tags: ["sugarcane", "ganna cutter", "harvest"]
  },
  {
    id: "agri-coconut-climber",
    name: "Coconut & Arecanut Palm Tree Climber",
    category: "Agriculture, Dairy & Rural",
    payoutType: "PER_TRIP",
    defaultInflow: 35000,
    defaultDailyEarnings: 1350,
    suggestedBracket: "standard",
    tags: ["coconut climber", "toddy tapper", "arecanut"]
  },
  {
    id: "agri-aquaculture-worker",
    name: "Fish & Shrimp Aquaculture Pond Cultivator",
    category: "Agriculture, Dairy & Rural",
    payoutType: "MONTHLY",
    defaultInflow: 25000,
    defaultDailyEarnings: 960,
    suggestedBracket: "entry",
    tags: ["aquaculture", "shrimp farm", "fishery"]
  },
  {
    id: "agri-tractor-operator",
    name: "Agricultural Tractor & Rotavator Field Driver",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 38000,
    defaultDailyEarnings: 1460,
    suggestedBracket: "standard",
    tags: ["tractor", "ploughing", "rotavator"]
  },
  {
    id: "agri-paddy-transplanter",
    name: "Paddy Transplanter & Crop Weeding Laborer",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 17500,
    defaultDailyEarnings: 670,
    suggestedBracket: "entry",
    tags: ["paddy", "rice transplanting", "weeding"]
  },
  {
    id: "agri-orchard-harvester",
    name: "Mango & Apple Orchard Picker & Packer",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 24000,
    defaultDailyEarnings: 920,
    suggestedBracket: "entry",
    tags: ["orchard", "mango picker", "fruits harvest"]
  },
  {
    id: "agri-cotton-picker",
    name: "Cotton Field Harvester & Pod Plucker",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 19000,
    defaultDailyEarnings: 730,
    suggestedBracket: "entry",
    tags: ["cotton picker", "kapas"]
  },
  {
    id: "agri-tea-garden-plucker",
    name: "Tea Plantation Leaf Plucker & Collector",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 17000,
    defaultDailyEarnings: 650,
    suggestedBracket: "entry",
    tags: ["tea garden", "tea plucker", "chai patti"]
  },
  {
    id: "agri-sericulture",
    name: "Silk Cocoon & Mulberry Sericulture Rearing",
    category: "Agriculture, Dairy & Rural",
    payoutType: "MONTHLY",
    defaultInflow: 26000,
    defaultDailyEarnings: 1000,
    suggestedBracket: "standard",
    tags: ["silk", "sericulture", "mulberry"]
  },
  {
    id: "agri-nursery-worker",
    name: "Plant Nursery & Horticultural Grafting Worker",
    category: "Agriculture, Dairy & Rural",
    payoutType: "MONTHLY",
    defaultInflow: 21000,
    defaultDailyEarnings: 800,
    suggestedBracket: "entry",
    tags: ["plant nursery", "horticulture", "saplings"]
  },
  {
    id: "agri-fodder-supplier",
    name: "Green Fodder & Cattle Feed Distributor",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 29000,
    defaultDailyEarnings: 1110,
    suggestedBracket: "standard",
    tags: ["fodder", "cattle feed", "grass cutter"]
  },
  {
    id: "agri-spice-curer",
    name: "Cardamom, Pepper & Spice Drying Yard Laborer",
    category: "Agriculture, Dairy & Rural",
    payoutType: "DAILY",
    defaultInflow: 23000,
    defaultDailyEarnings: 880,
    suggestedBracket: "entry",
    tags: ["cardamom", "spices", "pepper drying"]
  },

  // ============================================================================
  // 10. ARTISANS & HANDICRAFTS (15 domains)
  // ============================================================================
  {
    id: "art-master-darzi",
    name: "Master Dressmaker / Custom Suit & Blouse Tailor",
    category: "Artisans & Handicrafts",
    payoutType: "PER_TRIP",
    defaultInflow: 42000,
    defaultDailyEarnings: 1610,
    suggestedBracket: "high",
    tags: ["darzi", "tailor", "blouse", "suit master"]
  },
  {
    id: "art-handloom-weaver",
    name: "Handloom & Jacquard Saree Weaver",
    category: "Artisans & Handicrafts",
    payoutType: "MONTHLY",
    defaultInflow: 27000,
    defaultDailyEarnings: 1040,
    suggestedBracket: "standard",
    tags: ["handloom", "weaver", "saree", "jacquard"]
  },
  {
    id: "art-zari-embroidery",
    name: "Zari, Zardozi & Chikankari Hand Embroiderer",
    category: "Artisans & Handicrafts",
    payoutType: "PER_TRIP",
    defaultInflow: 25000,
    defaultDailyEarnings: 960,
    suggestedBracket: "entry",
    tags: ["zardozi", "chikankari", "embroidery", "zari"]
  },
  {
    id: "art-leather-craft",
    name: "Leather Footwear & Handcrafted Goods Artisan",
    category: "Artisans & Handicrafts",
    payoutType: "DAILY",
    defaultInflow: 31000,
    defaultDailyEarnings: 1190,
    suggestedBracket: "standard",
    tags: ["leather", "kolhapuri", "footwear"]
  },
  {
    id: "art-potter-clay",
    name: "Terracotta Potter & Clay Kiln Maker (Kumhar)",
    category: "Artisans & Handicrafts",
    payoutType: "DAILY",
    defaultInflow: 26000,
    defaultDailyEarnings: 1000,
    suggestedBracket: "standard",
    tags: ["potter", "kumhar", "matka", "terracotta"]
  },
  {
    id: "art-metal-brass",
    name: "Brassware, Copper & Bell Metal Smith",
    category: "Artisans & Handicrafts",
    payoutType: "MONTHLY",
    defaultInflow: 33000,
    defaultDailyEarnings: 1270,
    suggestedBracket: "standard",
    tags: ["brassware", "metal smith", "utensils"]
  },
  {
    id: "art-woodcarver",
    name: "Woodcarving & Wooden Handicrafts Craftsman",
    category: "Artisans & Handicrafts",
    payoutType: "PER_TRIP",
    defaultInflow: 30000,
    defaultDailyEarnings: 1150,
    suggestedBracket: "standard",
    tags: ["woodcarver", "handicraft", "wooden art"]
  },
  {
    id: "art-bamboo-basket",
    name: "Bamboo Cane & Wicker Basket Weaver",
    category: "Artisans & Handicrafts",
    payoutType: "DAILY",
    defaultInflow: 20000,
    defaultDailyEarnings: 770,
    suggestedBracket: "entry",
    tags: ["bamboo", "cane furniture", "baskets"]
  },
  {
    id: "art-block-print",
    name: "Block Printing & Bandhani Tie-Dye Artisan",
    category: "Artisans & Handicrafts",
    payoutType: "PER_TRIP",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["block print", "bandhani", "tie-dye"]
  },
  {
    id: "art-filigree-jewelry",
    name: "Silver Filigree & Micro-Jewelry Craftsman",
    category: "Artisans & Handicrafts",
    payoutType: "PER_TRIP",
    defaultInflow: 40000,
    defaultDailyEarnings: 1540,
    suggestedBracket: "standard",
    tags: ["filigree", "silver smith", "jewelry"]
  },
  {
    id: "art-glass-bangles",
    name: "Glass Bangle Maker & Kiln Worker",
    category: "Artisans & Handicrafts",
    payoutType: "DAILY",
    defaultInflow: 21000,
    defaultDailyEarnings: 800,
    suggestedBracket: "entry",
    tags: ["glass bangles", "firozabad", "choodi"]
  },
  {
    id: "art-idol-sculptor",
    name: "Festival Idol Sculptor & Clay Artist (Murtikar)",
    category: "Artisans & Handicrafts",
    payoutType: "PER_TRIP",
    defaultInflow: 45000,
    defaultDailyEarnings: 1730,
    suggestedBracket: "high",
    tags: ["murtikar", "ganpati idol", "durga puja sculptor"]
  },
  {
    id: "art-carpet-knotter",
    name: "Hand-Knotted Carpet & Rug Weaver",
    category: "Artisans & Handicrafts",
    payoutType: "MONTHLY",
    defaultInflow: 24000,
    defaultDailyEarnings: 920,
    suggestedBracket: "entry",
    tags: ["carpet weaver", "rugs", "kaleen"]
  },
  {
    id: "art-puppetry-toys",
    name: "Traditional Wooden Toy & Puppet Maker",
    category: "Artisans & Handicrafts",
    payoutType: "DAILY",
    defaultInflow: 22000,
    defaultDailyEarnings: 850,
    suggestedBracket: "entry",
    tags: ["channapatna", "wooden toys", "puppets"]
  },
  {
    id: "art-kite-maker",
    name: "Seasonal Paper Kite & Glass Manja Maker",
    category: "Artisans & Handicrafts",
    payoutType: "DAILY",
    defaultInflow: 23000,
    defaultDailyEarnings: 880,
    suggestedBracket: "entry",
    tags: ["kite maker", "patang", "manja"]
  },

  // ============================================================================
  // 11. FREELANCE & MICRO-SERVICES (15 domains)
  // ============================================================================
  {
    id: "service-catering-crew",
    name: "Event & Wedding Catering Service Crew",
    category: "Freelance & Micro-Services",
    payoutType: "DAILY",
    defaultInflow: 30000,
    defaultDailyEarnings: 1150,
    suggestedBracket: "standard",
    tags: ["catering", "wedding waitstaff", "serving"]
  },
  {
    id: "service-tent-sound",
    name: "Tent House, Shamiana & Sound Rigging Setup",
    category: "Freelance & Micro-Services",
    payoutType: "DAILY",
    defaultInflow: 34000,
    defaultDailyEarnings: 1300,
    suggestedBracket: "standard",
    tags: ["tent house", "sound system", "dj setup"]
  },
  {
    id: "service-event-videographer",
    name: "Wedding & Event Videographer / Camera Assistant",
    category: "Freelance & Micro-Services",
    payoutType: "PER_TRIP",
    defaultInflow: 46000,
    defaultDailyEarnings: 1770,
    suggestedBracket: "high",
    tags: ["videographer", "cameraman", "events"]
  },
  {
    id: "service-home-tutor",
    name: "Neighborhood Private Academic Home Tutor",
    category: "Freelance & Micro-Services",
    payoutType: "MONTHLY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["tutor", "tuition", "teaching"]
  },
  {
    id: "service-data-annotation",
    name: "AI Data Annotation, Bounding Box & Labeler",
    category: "Freelance & Micro-Services",
    payoutType: "WEEKLY",
    defaultInflow: 32000,
    defaultDailyEarnings: 1230,
    suggestedBracket: "standard",
    tags: ["data annotation", "ai labeler", "microwork"]
  },
  {
    id: "service-gym-trainer",
    name: "Freelance Fitness Trainer & Floor Coach",
    category: "Freelance & Micro-Services",
    payoutType: "MONTHLY",
    defaultInflow: 38000,
    defaultDailyEarnings: 1460,
    suggestedBracket: "standard",
    tags: ["gym trainer", "fitness coach"]
  },
  {
    id: "service-bridal-makeup",
    name: "Freelance Bridal & Event Makeup Artist",
    category: "Freelance & Micro-Services",
    payoutType: "PER_TRIP",
    defaultInflow: 50000,
    defaultDailyEarnings: 1920,
    suggestedBracket: "high",
    tags: ["makeup artist", "bridal", "beauty"]
  },
  {
    id: "service-sound-lighting",
    name: "Stage Lighting & Stage Rigging Technician",
    category: "Freelance & Micro-Services",
    payoutType: "DAILY",
    defaultInflow: 35000,
    defaultDailyEarnings: 1350,
    suggestedBracket: "standard",
    tags: ["stage lighting", "rigging"]
  },
  {
    id: "service-dj-operator",
    name: "Event DJ & Sound Mixer Operator",
    category: "Freelance & Micro-Services",
    payoutType: "PER_TRIP",
    defaultInflow: 42000,
    defaultDailyEarnings: 1610,
    suggestedBracket: "high",
    tags: ["dj", "music mixer", "party"]
  },
  {
    id: "service-priest-pandit",
    name: "Ceremony Pandit & Puja Ritual Specialist",
    category: "Freelance & Micro-Services",
    payoutType: "DAILY",
    defaultInflow: 39000,
    defaultDailyEarnings: 1500,
    suggestedBracket: "standard",
    tags: ["pandit", "puja", "priest"]
  },
  {
    id: "service-mehndi-artist",
    name: "Henna / Mehndi Bridal & Festival Artist",
    category: "Freelance & Micro-Services",
    payoutType: "DAILY",
    defaultInflow: 31000,
    defaultDailyEarnings: 1190,
    suggestedBracket: "standard",
    tags: ["mehndi", "henna artist"]
  },
  {
    id: "service-dtp-designer",
    name: "Printing Press DTP Banner & Card Designer",
    category: "Freelance & Micro-Services",
    payoutType: "MONTHLY",
    defaultInflow: 27000,
    defaultDailyEarnings: 1040,
    suggestedBracket: "standard",
    tags: ["dtp designer", "graphic designer", "banners"]
  },
  {
    id: "service-courier-pickup",
    name: "Hyperlocal Package Pickup & Delivery Runner",
    category: "Freelance & Micro-Services",
    payoutType: "DAILY",
    defaultInflow: 29000,
    defaultDailyEarnings: 1110,
    suggestedBracket: "standard",
    tags: ["courier pickup", "package runner"]
  },
  {
    id: "service-fleet-captain",
    name: "Gig Delivery Cluster Captain & Supervisor",
    category: "Freelance & Micro-Services",
    payoutType: "MONTHLY",
    defaultInflow: 45000,
    defaultDailyEarnings: 1730,
    suggestedBracket: "high",
    tags: ["fleet captain", "cluster lead", "supervisor"]
  },
  {
    id: "service-legal-typist",
    name: "Court & Registry Legal Typist / Document Clerk",
    category: "Freelance & Micro-Services",
    payoutType: "DAILY",
    defaultInflow: 28000,
    defaultDailyEarnings: 1080,
    suggestedBracket: "standard",
    tags: ["court typist", "legal clerk", "affidavit"]
  }
];

// Helper to look up a domain by id or name
export function findDomainById(id: string): WorkDomain | undefined {
  return WORK_DOMAINS.find(d => d.id === id || d.name.toLowerCase() === id.toLowerCase());
}

// Group domains by category
export function getCategorizedDomains(): Record<string, WorkDomain[]> {
  const map: Record<string, WorkDomain[]> = {};
  for (const domain of WORK_DOMAINS) {
    if (!map[domain.category]) {
      map[domain.category] = [];
    }
    map[domain.category].push(domain);
  }
  return map;
}
