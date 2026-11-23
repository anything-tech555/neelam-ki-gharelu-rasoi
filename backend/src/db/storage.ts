import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { CONFIG } from '../config';
import {
  User,
  FoodItem,
  Category,
  Order,
  Review,
  Coupon,
  RestaurantSettings,
  NotificationItem
} from '../types/shared';

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  categories: Category[];
  foodItems: FoodItem[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  notifications: NotificationItem[];
  settings: RestaurantSettings;
}

const DB_FILE = path.join(CONFIG.DATA_DIR, 'database.json');

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectories();
    this.data = this.loadOrInitialize();
  }

  private ensureDirectories() {
    if (!fs.existsSync(CONFIG.DATA_DIR)) {
      fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONFIG.UPLOADS_DIR)) {
      fs.mkdirSync(CONFIG.UPLOADS_DIR, { recursive: true });
    }
  }

  private loadOrInitialize(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database.json, initializing fresh seed', err);
      }
    }
    const initial = this.getSeedData();
    this.persist(initial);
    return initial;
  }

  private getSeedData(): DatabaseSchema {
    const adminSalt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('Admin@Neelam2026', adminSalt);
    const customerPasswordHash = bcrypt.hashSync('Customer@123', adminSalt);

    const defaultAdmin: User & { passwordHash: string } = {
      id: 'admin-001',
      name: 'Neelam Sharma (Owner)',
      email: 'admin@neelamrasoi.com',
      phone: '9997433379',
      role: 'admin',
      addresses: [
        {
          id: 'addr-admin-1',
          tag: 'Work',
          address: 'P S 31, Panchsheel Apartment, Kanth Road, Moradabad',
          landmark: 'Near Panchsheel Gate',
          isDefault: true
        }
      ],
      passwordHash: adminPasswordHash,
      createdAt: new Date().toISOString()
    };

    const demoCustomer: User & { passwordHash: string } = {
      id: 'cust-001',
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      phone: '9876543210',
      role: 'customer',
      addresses: [
        {
          id: 'addr-cust-1',
          tag: 'Home',
          address: 'Flat 402, Royal Enclave, Civil Lines, Moradabad',
          landmark: 'Opposite District Hospital',
          isDefault: true
        }
      ],
      passwordHash: customerPasswordHash,
      createdAt: new Date().toISOString()
    };

    const categories: Category[] = [
      { id: 'cat-breakfast', name: 'Breakfast', hindiName: 'नाश्ता', description: 'Freshly prepared morning delicacies with pure desi ghee', icon: 'Sun', displayOrder: 1, isActive: true },
      { id: 'cat-lunch', name: 'Lunch', hindiName: 'दोपहर का भोजन', description: 'Hearty North Indian lunch combos, dal and rice bowls', icon: 'Utensils', displayOrder: 2, isActive: true },
      { id: 'cat-dinner', name: 'Dinner', hindiName: 'रात का खाना', description: 'Light and wholesome dinner curries, rotis, and sabzi', icon: 'Moon', displayOrder: 3, isActive: true },
      { id: 'cat-thali', name: 'Special Thali', hindiName: 'विशेष थाली', description: 'Complete grand meal with dal, paneer, rotis, rice, raita & dessert', icon: 'Award', displayOrder: 4, isActive: true },
      { id: 'cat-snacks', name: 'Evening Snacks', hindiName: 'शाम का नाश्ता', description: 'Crispy pakodas, samosas, chillas, and tea companions', icon: 'Coffee', displayOrder: 5, isActive: true },
      { id: 'cat-special', name: 'Today’s Special', hindiName: 'आज का विशेष', description: 'Neelam Ji’s handpicked special recipes of the day', icon: 'Sparkles', displayOrder: 6, isActive: true },
      { id: 'cat-beverages', name: 'Beverages', hindiName: 'पेय पदार्थ', description: 'Chilled lassi, masala chaas, and hot kulhad chai', icon: 'GlassWater', displayOrder: 7, isActive: true }
    ];

    const foodItems: FoodItem[] = [
      {
        id: 'food-001',
        name: 'Poha with Jalebi',
        hindiName: 'पोहा और गरमा-गरम जलेबी',
        description: 'Soft Indori-style poha garnished with crunchy sev, fresh coriander, pomegranate, served with 2 crispy hot jalebis.',
        hindiDescription: 'मुलायम इंदौरी पोहा सेव और नींबू के साथ, साथ में 2 कुरकुरी गर्म जलेबी।',
        price: 70,
        discountPrice: 65,
        categoryId: 'cat-breakfast',
        categoryName: 'Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        isSpecial: true,
        prepTimeMinutes: 15,
        rating: 4.8,
        ratingCount: 124,
        displayOrder: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-002',
        name: 'Aloo Paratha with Makhan & Curd',
        hindiName: 'आलू पराठा मक्खन और दही के साथ',
        description: 'Two large golden stuffed whole wheat parathas with spiced potato filling, topped with white butter, fresh curd and pickle.',
        hindiDescription: '2 कुरकुरे आलू पराठे, सफेद मक्खन, ताजा दही और घर का बना आम का अचार।',
        price: 90,
        categoryId: 'cat-breakfast',
        categoryName: 'Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        isSpecial: false,
        prepTimeMinutes: 20,
        rating: 4.9,
        ratingCount: 198,
        displayOrder: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-003',
        name: 'Idli Sambar Combo',
        hindiName: 'इडली सांभर और नारियल चटनी',
        description: '3 pieces of pillowy soft steamed rice-lentil idlis, served with aromatic vegetable sambar and fresh coconut chutney.',
        hindiDescription: '3 रुई जैसी मुलायम इडली, खुशबूदार सब्जियों वाला सांभर और ताज़ा नारियल चटनी।',
        price: 70,
        categoryId: 'cat-breakfast',
        categoryName: 'Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        isSpecial: false,
        prepTimeMinutes: 15,
        rating: 4.7,
        ratingCount: 86,
        displayOrder: 3,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-004',
        name: 'Crispy Bedmi Puri with Aloo Sabzi',
        hindiName: 'बेड़मी पूरी और हलवाई स्टाइल आलू की सब्जी',
        description: '4 crispy urad dal stuffed bedmi puris served with Moradabad-special spicy tangy aloo jhol and methi chutney.',
        hindiDescription: '4 दाल भरी खस्ता बेड़मी पूरी, तरीदार चटपटे आलू और मेथी की लौंजी।',
        price: 80,
        categoryId: 'cat-breakfast',
        categoryName: 'Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        isSpecial: true,
        prepTimeMinutes: 20,
        rating: 4.9,
        ratingCount: 210,
        displayOrder: 4,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-005',
        name: 'Besan Chilla with Mint Chutney',
        hindiName: 'बेसन का चीला पुदीना चटनी के साथ',
        description: '2 nutritious gram flour pancakes loaded with finely chopped onions, tomatoes, and paneer, served with mint coriander dip.',
        hindiDescription: '2 कुरकुरे बेसन के चीले प्याज, टमाटर और पनीर से भरपूर, हरी चटनी के साथ।',
        price: 70,
        categoryId: 'cat-breakfast',
        categoryName: 'Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        isSpecial: false,
        prepTimeMinutes: 15,
        rating: 4.6,
        ratingCount: 65,
        displayOrder: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-006',
        name: 'Ghar Ka Rajma Chawal',
        hindiName: 'घर जैसा स्वादिष्ट राजमा चावल',
        description: 'Slow-simmered Kashmiri rajma cooked with homemade tomato puree and roasted cumin, served over fragrant basmati rice.',
        hindiDescription: 'धीमी आंच पर पका कश्मीरी राजमा, खुशबूदार बासमती चावल, सिरका प्याज और हरी मिर्च।',
        price: 110,
        discountPrice: 99,
        categoryId: 'cat-lunch',
        categoryName: 'Lunch',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        isSpecial: true,
        prepTimeMinutes: 20,
        rating: 4.9,
        ratingCount: 340,
        displayOrder: 6,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-007',
        name: 'Dal Tadka Combo Thali',
        hindiName: 'दाल तड़का कम्प्लीट मील',
        description: 'Yellow arhar dal with double garlic tadka, steamed basmati rice, seasonal dry vegetable, 2 soft rotis and fresh salad.',
        hindiDescription: 'देसी घी तड़का अरहर दाल, जीरा राइस, मौसमी सब्जी, 2 तवा रोटी और सलाद।',
        price: 120,
        categoryId: 'cat-lunch',
        categoryName: 'Lunch',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        isSpecial: false,
        prepTimeMinutes: 25,
        rating: 4.8,
        ratingCount: 150,
        displayOrder: 7,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-008',
        name: 'Royal Shahi Paneer Thali',
        hindiName: 'शाही पनीर डीलक्स थाली',
        description: 'Rich Shahi Paneer in cashew gravy, Dal Makhani, Jeera Rice, 3 Butter Rotis, Boondi Raita, Gulab Jamun, and Pickle.',
        hindiDescription: 'शाही पनीर, दाल मखनी, जीरा राइस, 3 बटर रोटी, बूंदी रायता, 1 गुलाब जामुन और सलाद।',
        price: 160,
        discountPrice: 149,
        categoryId: 'cat-thali',
        categoryName: 'Special Thali',
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        isSpecial: true,
        prepTimeMinutes: 25,
        rating: 5.0,
        ratingCount: 420,
        displayOrder: 8,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-009',
        name: 'Pakoda Kadhi with Jeera Rice',
        hindiName: 'कढ़ी पकौड़ा और जीरा राइस',
        description: 'Traditional spiced buttermilk kadhi with melt-in-mouth besan pakodas, tempered with mustard seeds and curry leaves.',
        hindiDescription: 'पारंपरिक खट्टी-मीठी कढ़ी, नरम बेसन पकौड़े, राई-कढ़ी पत्ता तड़का और जीरा राइस।',
        price: 100,
        categoryId: 'cat-lunch',
        categoryName: 'Lunch',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        isSpecial: false,
        prepTimeMinutes: 20,
        rating: 4.7,
        ratingCount: 95,
        displayOrder: 9,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-010',
        name: 'Amritsari Chole Chawal',
        hindiName: 'अमृतसरी छोले चावल',
        description: 'Authentic dark spiced chickpeas cooked with tea leaf infusion and anardana, served with fluffy jeera rice and spiced onions.',
        hindiDescription: 'अमृतसरी काले छोले, अनारदाना और खड़े मसालों का स्वाद, साथ में बासमती चावल।',
        price: 110,
        categoryId: 'cat-lunch',
        categoryName: 'Lunch',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        isSpecial: false,
        prepTimeMinutes: 20,
        rating: 4.8,
        ratingCount: 160,
        displayOrder: 10,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-011',
        name: 'Matar Paneer with Tawa Roti',
        hindiName: 'मटर पनीर और 4 तवा रोटी',
        description: 'Fresh cottage cheese cubes and sweet green peas in a rich onion-tomato gravy, served with 4 ghee-brushed phulkas.',
        hindiDescription: 'नरम पनीर और ताज़ी हरी मटर की मसालेदार सब्जी, 4 घी लगी गरमा-गरम फुल्का रोटी।',
        price: 130,
        categoryId: 'cat-dinner',
        categoryName: 'Dinner',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        isSpecial: false,
        prepTimeMinutes: 25,
        rating: 4.8,
        ratingCount: 110,
        displayOrder: 11,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-012',
        name: 'Moradabadi Moong Dal Chaat',
        hindiName: 'प्रसिद्ध मुरादाबादी मूंग दाल चाट',
        description: 'World-famous Moradabad street special: slow-cooked yellow moong dal topped with butter, heeng-jeera, green chilies, and crispy jalebi/crackers.',
        hindiDescription: 'मुरादाबाद की मशहूर गरमा-गरम मूंग दाल चाट, मक्खन, भुना हींग-जीरा और चटपटी चटनी के साथ।',
        price: 60,
        discountPrice: 50,
        categoryId: 'cat-snacks',
        categoryName: 'Evening Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        isSpecial: true,
        prepTimeMinutes: 10,
        rating: 5.0,
        ratingCount: 512,
        displayOrder: 12,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-013',
        name: 'Thandi Kesariya Sweet Lassi',
        hindiName: 'ठंडी केसरिया मलाई लस्सी',
        description: 'Thick, creamy churned yogurt sweetened and topped with saffron strands, crushed pistachios, and thick malai layer.',
        hindiDescription: 'गाढ़े ताज़े दही से बनी मलाईदार लस्सी, केसर और पिस्ता की सजावट के साथ।',
        price: 50,
        categoryId: 'cat-beverages',
        categoryName: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        isSpecial: false,
        prepTimeMinutes: 5,
        rating: 4.9,
        ratingCount: 180,
        displayOrder: 13,
        createdAt: new Date().toISOString()
      },
      {
        id: 'food-014',
        name: 'Adrak Elaichi Kulhad Chai (2 Cups)',
        hindiName: 'अदरक इलायची कुल्हड़ चाय (2 कप)',
        description: 'Freshly brewed aromatic tea boiled with crushed ginger and green cardamom, served hot in earthen clay kulhads.',
        hindiDescription: 'ताजा कुटी अदरक और इलायची वाली कड़क चाय, 2 कुल्हड़ के साथ।',
        price: 40,
        categoryId: 'cat-beverages',
        categoryName: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        isSpecial: false,
        prepTimeMinutes: 10,
        rating: 4.9,
        ratingCount: 290,
        displayOrder: 14,
        createdAt: new Date().toISOString()
      }
    ];

    const coupons: Coupon[] = [
      {
        id: 'c-01',
        code: 'SWAGAT50',
        description: '50% off on your first order up to ₹100',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minOrderAmount: 149,
        maxDiscountAmount: 100,
        isFirstOrderOnly: true,
        expiryDate: '2027-12-31T23:59:59.000Z',
        usageLimit: 1000,
        usageCount: 14,
        isActive: true
      },
      {
        id: 'c-02',
        code: 'GHARELU20',
        description: '20% off on family orders above ₹299',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 299,
        maxDiscountAmount: 80,
        isFirstOrderOnly: false,
        expiryDate: '2027-12-31T23:59:59.000Z',
        usageLimit: 500,
        usageCount: 32,
        isActive: true
      },
      {
        id: 'c-03',
        code: 'MORADABADFLAT30',
        description: 'Flat ₹30 off on all pure veg thalis',
        discountType: 'FIXED',
        discountValue: 30,
        minOrderAmount: 150,
        isFirstOrderOnly: false,
        expiryDate: '2027-12-31T23:59:59.000Z',
        usageLimit: 300,
        usageCount: 45,
        isActive: true
      }
    ];

    const reviews: Review[] = [
      {
        id: 'rev-001',
        orderId: 'NKG-2026-1001',
        customerId: 'cust-001',
        customerName: 'Rahul Verma',
        rating: 5,
        comment: 'Pure homemade taste! The Shahi Paneer Thali tasted just like home cooked food. Packing was clean and warm.',
        adminReply: 'Thank you Rahul ji! We strive to deliver the cleanest homemade food in Moradabad.',
        adminReplyAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        isApproved: true,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: 'rev-002',
        orderId: 'NKG-2026-1002',
        customerId: 'cust-002',
        customerName: 'Priya Agarwal',
        rating: 5,
        comment: 'Bedmi Puri and Aloo Sabzi reminded me of Sunday mornings! Delicious and not overly oily. 10/10.',
        isApproved: true,
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ];

    const settings: RestaurantSettings = {
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
      minOrderAmount: 50,
      freeDeliveryRadiusKm: 5,
      deliveryChargeAboveRadius: 30,
      announcementBanner: 'Shuddh Shakahari Homemade Food freshly cooked in Moradabad. Free delivery within 5 km for all orders!'
    };

    return {
      users: [defaultAdmin, demoCustomer],
      categories,
      foodItems,
      orders: [],
      reviews,
      coupons,
      notifications: [],
      settings
    };
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public update<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]): void {
    this.data[key] = value;
    this.persist(this.data);
  }

  public mutate(fn: (data: DatabaseSchema) => void): DatabaseSchema {
    fn(this.data);
    this.persist(this.data);
    return this.data;
  }
}

export const db = new DatabaseStore();
