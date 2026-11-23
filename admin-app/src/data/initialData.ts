import { FoodItem, Category, RestaurantSettings, Review } from '../types/shared';

export const INITIAL_SETTINGS: RestaurantSettings = {
  businessName: 'Neelam Ki Gharelu Rasoi',
  hindiName: 'नीलम की घरेलू रसोई',
  tagline: 'शुद्ध शाकाहारी भोजन',
  category: 'Pure Vegetarian Homemade Food',
  location: 'Moradabad, Uttar Pradesh, India',
  address: 'P S 31, Panchsheel Apartment, Kanth Road, Moradabad',
  phone: '9997433379',
  secondaryPhone: '8272072057',
  currency: 'INR',
  isOpen: true,
  isPaused: false,
  pauseMessage: '',
  openingTime: '07:00',
  closingTime: '22:30',
  defaultPrepTimeMinutes: 20,
  defaultDeliveryTimeMinutes: 25,
  deliveryCharge: 30,
  freeDeliveryThreshold: 299,
  minOrderAmount: 30,
  freeDeliveryRadiusKm: 5,
  deliveryChargeAboveRadius: 30,
  announcementBanner: 'शुद्ध शाकाहारी घर का बना भोजन • 5 किमी के भीतर सभी ऑर्डर पर मुफ़्त डिलीवरी (₹65 या ₹70 के ऑर्डर पर भी मुफ़्त)!'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-special',
    name: "Today's Special",
    hindiName: 'आज का खास',
    description: 'Neelam Sharma Ji handpicked special dish for today',
    icon: 'Sparkles',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'cat-breakfast',
    name: 'Breakfast',
    hindiName: 'सुबह का नाश्ता',
    description: 'Freshly prepared morning delicacies with pure desi ghee (7:00 AM – 11:30 AM)',
    icon: 'Sun',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'cat-thali',
    name: 'Special Thali',
    hindiName: 'स्पेशल थाली',
    description: 'Complete wholesome traditional thalis with dal, paneer, rotis, rice, raita & dessert',
    icon: 'Award',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'cat-lunch',
    name: 'Lunch',
    hindiName: 'दोपहर का भोजन',
    description: 'Fresh homemade curries, dal tadka, rice bowls and phulkas (11:30 AM – 4:00 PM)',
    icon: 'Utensils',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'cat-snacks',
    name: 'Evening Snacks & Chai',
    hindiName: 'शाम का नाश्ता',
    description: 'Crispy samosas, bread pakodas, chillas & hot snacks (4:00 PM – 7:00 PM)',
    icon: 'Coffee',
    displayOrder: 5,
    isActive: true
  },
  {
    id: 'cat-dinner',
    name: 'Dinner',
    hindiName: 'रात्रि भोजन',
    description: 'Light, digestive, freshly cooked dinner curries and rotis (7:00 PM – 10:30 PM)',
    icon: 'Moon',
    displayOrder: 6,
    isActive: true
  },
  {
    id: 'cat-beverages',
    name: 'Beverages & Sweets',
    hindiName: 'पेय एवं मिष्ठान',
    description: 'Chilled lassi, masala chaas and warm desi ghee sweets',
    icon: 'GlassWater',
    displayOrder: 7,
    isActive: true
  }
];

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  // TODAY'S SPECIAL
  {
    id: 'food-010',
    name: 'Royal Shahi Paneer Thali',
    hindiName: 'रॉयल शाही पनीर थाली',
    description: 'Signature homemade thali: Rich Shahi Paneer cooked in pure desi ghee, Dal Makhani slow-cooked for 8 hours, 4 Butter Tawa Rotis, Fragrant Jeera Rice, Boondi Raita, Fresh Green Salad, and Hot Gulab Jamun.',
    hindiDescription: 'शाही पनीर देसी घी में निर्मित, 8 घंटे धीमी आँच पर पकी दाल मखनी, 4 मक्खन तवा रोटियाँ, जीरा राइस, बूंदी रायता, सलाद और 1 गरमा-गरम गुलाब जामुन।',
    price: 160,
    discountPrice: 149,
    categoryId: 'cat-thali',
    categoryName: 'Special Thali',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: true,
    prepTimeMinutes: 25,
    rating: 4.9,
    ratingCount: 420,
    displayOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // BREAKFAST
  {
    id: 'food-001',
    name: 'Poha with Jalebi',
    hindiName: 'पोहा और गरमा-गरम जलेबी',
    description: 'Fluffy Indori-style flattened rice tempered with mustard seeds, curry leaves, crunchy roasted peanuts, pomegranate pearls, fine nylon sev, and 2 crispy hot desi ghee jalebis.',
    hindiDescription: 'मुलायम इंदौरी पोहा, भुनी मूंगफली, अनार के दाने, बारीक सेव और साथ में 2 कुरकुरी देसी घी जलेबी।',
    price: 70,
    discountPrice: 65,
    categoryId: 'cat-breakfast',
    categoryName: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: false,
    prepTimeMinutes: 15,
    rating: 4.8,
    ratingCount: 310,
    displayOrder: 2,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-002',
    name: 'Desi Ghee Aloo Paratha (2 Pcs)',
    hindiName: 'देसी घी आलू पराठा (दही और अचार सहित)',
    description: 'Two golden, crispy whole wheat parathas stuffed with spiced mashed potatoes, roasted in pure Amul desi ghee. Served with thick fresh curd and homemade mango pickle.',
    hindiDescription: '2 कुरकुरे देसी घी आलू पराठे, ताज़ा गाढ़ा दही और नीलम जी के हाथ का बना आम का अचार।',
    price: 80,
    discountPrice: 70,
    categoryId: 'cat-breakfast',
    categoryName: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: false,
    prepTimeMinutes: 20,
    rating: 4.9,
    ratingCount: 285,
    displayOrder: 3,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-003',
    name: 'Bedmi Poori with Rasedar Aloo Sabzi',
    hindiName: 'बेड़मी पूरी और रसेदार आलू',
    description: 'Authentic Moradabad style 4 crispy urad dal stuffed pooris served with spicy, tangy hing-jeera flavored rasedar potato curry, methi chutney, and pickle.',
    hindiDescription: '4 उड़द दाल भरी खस्ता बेड़मी पूरियां, हींग-जीरे वाली तीखी रसेदार आलू की सब्जी और मेथी की लौंजी।',
    price: 85,
    discountPrice: 75,
    categoryId: 'cat-breakfast',
    categoryName: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    isSpecial: false,
    prepTimeMinutes: 20,
    rating: 4.7,
    ratingCount: 195,
    displayOrder: 4,
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // THALIS
  {
    id: 'food-009',
    name: 'Ghar Ki Shuddh Thali',
    hindiName: 'घर की शुद्ध थाली',
    description: 'Homely daily nourishment: Yellow Dal Tadka, Seasonal Sabzi (Aloo Gobhi / Bhindi), 4 Hot Tawa Phulkas smeared with desi ghee, Steamed Basmati Rice, and Fresh Salad.',
    hindiDescription: 'दाल तड़का, मौसमी ताज़ा सब्जी, 4 देसी घी तवा रोटियां, बासमती चावल, और ताज़ा सलाद।',
    price: 120,
    discountPrice: 99,
    categoryId: 'cat-thali',
    categoryName: 'Special Thali',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: false,
    prepTimeMinutes: 20,
    rating: 4.8,
    ratingCount: 510,
    displayOrder: 5,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-011',
    name: 'Neelam Deluxe Special Thali',
    hindiName: 'नीलम डीलक्स स्पेशल थाली',
    description: 'Grand feast: Paneer Butter Masala, Dal Makhani, Dry Seasonal Sabzi, 4 Butter Tawa Rotis, Jeera Rice, Cucumber Raita, Papad, Salad & 2 Desi Ghee Gulab Jamuns.',
    hindiDescription: 'पनीर बटर मसाला, दाल मखनी, सूखी मौसमी सब्जी, 4 मक्खन रोटी, जीरा राइस, रायता, पापड़, सलाद और 2 गुलाब जामुन।',
    price: 199,
    discountPrice: 179,
    categoryId: 'cat-thali',
    categoryName: 'Special Thali',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: false,
    prepTimeMinutes: 25,
    rating: 4.9,
    ratingCount: 360,
    displayOrder: 6,
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // LUNCH
  {
    id: 'food-005',
    name: 'Dal Makhani & Jeera Rice Bowl',
    hindiName: 'दाल मखनी और जीरा राइस',
    description: 'Whole black lentils and kidney beans slow-simmered overnight with homemade white butter and fresh cream. Served with aromatic cumin tempered basmati rice.',
    hindiDescription: 'रातभर धीमी आँच पर मक्खन और मलाई में पकी दाल मखनी, सुगन्धित जीरा बासमती चावल के साथ।',
    price: 120,
    discountPrice: 99,
    categoryId: 'cat-lunch',
    categoryName: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    isSpecial: false,
    prepTimeMinutes: 15,
    rating: 4.8,
    ratingCount: 245,
    displayOrder: 7,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-006',
    name: 'Paneer Butter Masala (Full)',
    hindiName: 'पनीर बटर मसाला',
    description: 'Soft fresh paneer cubes cooked in a velvety tomato-cashew makhani gravy enriched with pure desi ghee and aromatic kasuri methi.',
    hindiDescription: 'ताज़ा मलाई पनीर, काजू और टमाटर की मखमली ग्रेवी में कस्तूरी मेथी और देसी घी के साथ।',
    price: 140,
    discountPrice: 120,
    categoryId: 'cat-lunch',
    categoryName: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: false,
    prepTimeMinutes: 20,
    rating: 4.9,
    ratingCount: 390,
    displayOrder: 8,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-007',
    name: 'Ghar Ka Rajma Chawal Combo',
    hindiName: 'घर का राजमा चावल',
    description: 'Traditional Punjabi style red kidney beans cooked in a rich ginger-garlic-tomato masala gravy, served with fluffy basmati rice and sliced onions.',
    hindiDescription: 'मां के हाथ के स्वाद वाला तीखा राजमा और गरमा-गरम बासमती चावल, लच्छेदार प्याज के साथ।',
    price: 99,
    discountPrice: 89,
    categoryId: 'cat-lunch',
    categoryName: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    isSpecial: false,
    prepTimeMinutes: 15,
    rating: 4.8,
    ratingCount: 290,
    displayOrder: 9,
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // SNACKS
  {
    id: 'food-012',
    name: 'Desi Ghee Samosa (2 Pcs)',
    hindiName: 'देसी घी समोसा (2 पीस चटनी सहित)',
    description: 'Crispy flaky crust fried in pure desi ghee, filled with spiced potatoes, green peas and whole coriander seeds. Served with sweet tamarind saunth and spicy mint chutney.',
    hindiDescription: 'देसी घी में तले कुरकुरे समोसे, काजू-किशमिश व मटर वाले आलू, खट्टी-मीठी सोंठ और हरी चटनी।',
    price: 35,
    discountPrice: 30,
    categoryId: 'cat-snacks',
    categoryName: 'Evening Snacks & Chai',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: false,
    prepTimeMinutes: 10,
    rating: 4.9,
    ratingCount: 470,
    displayOrder: 10,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-013',
    name: 'Paneer Bread Pakora (2 Pcs)',
    hindiName: 'पनीर ब्रेड पकौड़ा',
    description: 'Crisp gram-flour batter stuffed with spiced paneer slice and potato masala, served piping hot with green coriander chutney.',
    hindiDescription: 'पनीर और आलू मसाले से भरा गरमा-गरम ब्रेड पकौड़ा, तीखी हरी चटनी के साथ।',
    price: 45,
    discountPrice: 40,
    categoryId: 'cat-snacks',
    categoryName: 'Evening Snacks & Chai',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    isSpecial: false,
    prepTimeMinutes: 12,
    rating: 4.7,
    ratingCount: 220,
    displayOrder: 11,
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // DINNER
  {
    id: 'food-015',
    name: 'Mix Veg Sabzi with 4 Butter Rotis',
    hindiName: 'मिक्स वेज सब्जी और 4 मक्खन रोटी',
    description: 'Fresh seasonal vegetables (cauliflower, carrots, green beans, peas, potatoes) stir-fried in light spices, served with 4 soft whole wheat butter rotis.',
    hindiDescription: 'ताज़ी हरी मौसमी सब्जियों की सूखी भुजिया और 4 मुलायम मक्खन लगी तवा रोटियाँ।',
    price: 110,
    discountPrice: 95,
    categoryId: 'cat-dinner',
    categoryName: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    isSpecial: false,
    prepTimeMinutes: 20,
    rating: 4.8,
    ratingCount: 180,
    displayOrder: 12,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-016',
    name: 'Kadhai Paneer Special',
    hindiName: 'कढ़ाई पनीर स्पेशल',
    description: 'Cottage cheese cubes tossed with crisp bell peppers, onions, and freshly pounded kadhai masala in a robust semi-dry tomato gravy.',
    hindiDescription: 'शिमला मिर्च, प्याज और दरदरे खड़े मसालों में भुना हुआ स्वादिष्ट कढ़ाई पनीर।',
    price: 145,
    discountPrice: 130,
    categoryId: 'cat-dinner',
    categoryName: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: false,
    prepTimeMinutes: 22,
    rating: 4.9,
    ratingCount: 310,
    displayOrder: 13,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-017',
    name: 'Tawa Phulka with Desi Ghee (4 Pcs)',
    hindiName: 'देसी घी तवा फुल्का रोटी (4 पीस)',
    description: 'Four piping hot, 100% whole wheat flour tawa rotis brushed with pure desi ghee.',
    hindiDescription: '4 गरमा-गरम देसी घी चुपड़ी हुई गेहूं की मुलायम तवा रोटियाँ।',
    price: 35,
    discountPrice: 30,
    categoryId: 'cat-dinner',
    categoryName: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    isSpecial: false,
    prepTimeMinutes: 10,
    rating: 4.9,
    ratingCount: 450,
    displayOrder: 14,
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // BEVERAGES & SWEETS
  {
    id: 'food-018',
    name: 'Amritsari Kulhad Sweet Lassi',
    hindiName: 'अमृतसरी कुल्हड़ मीठी लस्सी',
    description: 'Thick creamy churned yogurt sweetened with sugar and rose water, topped with a thick layer of malai and chopped almonds & pistachios in an earthen kulhad.',
    hindiDescription: 'गाढ़े दही की मलाईदार मीठी लस्सी, ऊपर से ताज़ी मलाई और बादाम-पिस्ता की कतरन।',
    price: 45,
    discountPrice: 40,
    categoryId: 'cat-beverages',
    categoryName: 'Beverages & Sweets',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: false,
    prepTimeMinutes: 5,
    rating: 4.9,
    ratingCount: 380,
    displayOrder: 15,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-019',
    name: 'Masala Chaas (Spiced Buttermilk)',
    hindiName: 'मसाला छाछ',
    description: 'Refreshing churned buttermilk infused with roasted cumin powder, black salt, fresh mint and green coriander.',
    hindiDescription: 'भुने जीरे, पुदीने और काले नमक वाली पाचक व ताज़गी भरी मसाला छाछ।',
    price: 25,
    discountPrice: 20,
    categoryId: 'cat-beverages',
    categoryName: 'Beverages & Sweets',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    isSpecial: false,
    prepTimeMinutes: 5,
    rating: 4.8,
    ratingCount: 260,
    displayOrder: 16,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'food-020',
    name: 'Desi Ghee Gulab Jamun (2 Pcs)',
    hindiName: 'देसी घी गुलाब जामुन (2 पीस)',
    description: 'Melt-in-mouth soft mawa dumplings fried in pure desi ghee, soaked in aromatic saffron and cardamom sugar syrup.',
    hindiDescription: 'शुद्ध देसी घी में तले मावा के रसीले गुलाब जामुन, इलायची और केसर की चाशनी में डूबे हुए।',
    price: 45,
    discountPrice: 40,
    categoryId: 'cat-beverages',
    categoryName: 'Beverages & Sweets',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=85'
    ],
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    isSpecial: false,
    prepTimeMinutes: 5,
    rating: 5.0,
    ratingCount: 490,
    displayOrder: 17,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    orderId: 'ord-88391',
    customerId: 'cust-01',
    customerName: 'Rohit Agarwal',
    rating: 5,
    comment: 'Panchsheel Apartment me best home food! Shahi Paneer bilkul shuddh desi ghee ka laga, bilkul ghar jaisa swad.',
    isApproved: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'rev-002',
    orderId: 'ord-88392',
    customerId: 'cust-02',
    customerName: 'Pooja Verma',
    rating: 5,
    comment: 'Subah subah 8 baje itna fresh poha aur crispy jalebi mil gayi. Moradabad me aisa swad pehli baar mila.',
    isApproved: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'rev-003',
    orderId: 'ord-88393',
    customerId: 'cust-03',
    customerName: 'Amit Saxena',
    rating: 5,
    comment: 'Parathe bhot badiya the, makhan aur dahi ke saath maja aa gaya. 25 minute me delivery bhi aa gayi.',
    isApproved: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];
