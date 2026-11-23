import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<string, { en: string; hi: string }> = {
  restaurantName: { en: 'Neelam Ki Gharelu Rasoi', hi: 'नीलम की घरेलू रसोई' },
  tagline: { en: 'Ghar jaisa shuddh shakahari khana', hi: 'शुद्ध शाकाहारी भोजन' },
  location: { en: 'Moradabad, UP', hi: 'मुरादाबाद, उत्तर प्रदेश' },
  address: { en: 'P S 31, Panchsheel Apartment, Kanth Road, Moradabad', hi: 'पी एस 31, पंचशील अपार्टमेंट, कांठ रोड, मुरादाबाद' },
  officialPhone: { en: '9997433379', hi: '9997433379' },
  searchPlaceholder: { en: 'Search pure veg dishes, thalis, parathas...', hi: 'स्वादिष्ट व्यंजन, थाली या पराठे खोजें...' },
  allDishes: { en: 'All Dishes', hi: 'सभी व्यंजन' },
  addToCart: { en: 'Add', hi: 'जोड़ें' },
  viewCart: { en: 'View Cart', hi: 'कार्ट देखें' },
  cartTitle: { en: 'Your Order Cart', hi: 'आपका ऑर्डर' },
  cartEmpty: { en: 'Your cart is empty. Explore our homemade menu!', hi: 'आपकी थाली खाली है। मेनू से स्वादिष्ट व्यंजन जोड़ें।' },
  billDetails: { en: 'Bill Details', hi: 'बिल का विवरण' },
  subtotal: { en: 'Item Total', hi: 'व्यंजनों का कुल' },
  deliveryFee: { en: 'Delivery Fee', hi: 'डिलीवरी शुल्क' },
  freeDelivery: { en: 'FREE', hi: 'मुफ्त' },
  couponDiscount: { en: 'Coupon Discount', hi: 'कूपन छूट' },
  toPay: { en: 'Total Amount to Pay', hi: 'कुल भुगतान राशि' },
  applyCoupon: { en: 'Apply Coupon', hi: 'कूपन लागू करें' },
  haveCoupon: { en: 'Have a coupon code?', hi: 'क्या आपके पास कूपन कोड है?' },
  checkout: { en: 'Proceed to Checkout', hi: 'ऑर्डर आगे बढ़ाएं' },
  trackOrder: { en: 'Live Track', hi: 'ऑर्डर ट्रैक' },
  myOrders: { en: 'My Orders', hi: 'मेरे ऑर्डर्स' },
  login: { en: 'Login', hi: 'लॉगिन' },
  register: { en: 'Register', hi: 'रजिस्टर करें' },
  logout: { en: 'Logout', hi: 'लॉगआउट' },
  deliveryAddress: { en: 'Delivery Address', hi: 'डिलीवरी का पता' },
  name: { en: 'Full Name', hi: 'पूरा नाम' },
  phone: { en: '10-Digit Mobile', hi: '10-अंकों का मोबाइल नंबर' },
  landmark: { en: 'Landmark (Optional)', hi: 'लैंडमार्क (वैकल्पिक)' },
  instructions: { en: 'Cooking / Delivery instructions', hi: 'कोई खास निर्देश' },
  payCash: { en: 'Cash on Delivery (COD)', hi: 'कैश ऑन डिलीवरी (COD)' },
  payOnline: { en: 'Pay Online (UPI / Card / NetBanking)', hi: 'ऑनलाइन भुगतान (UPI / कार्ड्स)' },
  placeOrder: { en: 'Confirm & Place Order', hi: 'ऑर्डर कन्फर्म करें' },
  cancelOrder: { en: 'Cancel Order', hi: 'ऑर्डर रद्द करें' },
  cancellationRule: {
    en: 'Cancellation: Free within 30 minutes before food leaves for delivery.',
    hi: 'रद्दीकरण: ऑर्डर देने के 30 मिनट तक या डिलीवरी निकलने से पहले रद्द किया जा सकता है।'
  },
  rateFood: { en: 'Rate Your Meal', hi: 'खाने को रेटिंग दें' },
  reviewsHeading: { en: 'Customer Love in Moradabad', hi: 'मुरादाबाद के ग्राहकों का प्यार' },
  pureVegPromise: { en: '100% Pure Vegetarian Homemade with Desi Ghee', hi: '100% शुद्ध शाकाहारी, देसी घी से निर्मित' }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k: string) => k
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('nkg_lang') as Language) || 'en';
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('nkg_lang', l);
  };

  const t = (key: string): string => {
    if (DICTIONARY[key]) {
      return DICTIONARY[key][lang] || DICTIONARY[key]['en'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
