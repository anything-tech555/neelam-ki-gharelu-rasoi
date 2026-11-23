# 🍲 Neelam Ki Gharelu Rasoi (नीलम की घरेलू रसोई)
### शुद्ध शाकाहारी भोजन • Pure Vegetarian Homemade Food Platform • Moradabad, Uttar Pradesh, India

A complete, production-ready, full-stack food ordering platform consisting of **Two Completely Separate Applications** communicating with the same real-time backend and secure database:

1. **Public Customer Food Ordering App** (`/customer-app`)
   - Responsive web application, installable PWA, and Android application.
   - Live Order Tracking timeline (8-step journey), Razorpay & UPI online payments, and Cash on Delivery.
   - Bilingual (English & Hindi) interface with pure vegetarian home culinary design.
2. **Private Admin Management App** (`/admin-app`)
   - Completely isolated, password-protected back-office management console.
   - Real-time order stream with audio chime alerts, time controls, dish availability toggles, image upload, and sales analytics.
3. **Unified Backend & Real-Time Engine** (`/backend`)
   - Express REST API with TypeScript, Socket.IO live synchronization, JWT role-based access control, and server-side bill validation.
4. **Android Native Project** (`/android` & `/customer-app/android`)
   - Capacitor 6 Android project configured for package `com.neelam.rasoi`.

---

## 🏢 Business Information
- **Business Name**: Neelam Ki Gharelu Rasoi
- **Hindi Name**: नीलम की घरेलू रसोई
- **Tagline**: शुद्ध शाकाहारी भोजन
- **Category**: 100% Pure Vegetarian Homemade Food (Desi Ghee preparation)
- **Official Location**: Moradabad, Uttar Pradesh, India
- **Official Kitchen Address**: P S 31, Panchsheel Apartment, Kanth Road, Moradabad - 244001
- **Official Contact Helpline**: +91 9997433379
- **Operating Hours**: 7:00 AM – 10:30 PM (7 Days a Week)

---

## 🚀 Quick Start Guide

### 1. Start the Backend API & Real-Time Engine
```bash
cd backend
npm install
npm run build
npm start
# Server runs on http://localhost:5000
```

### 2. Start the Public Customer Application
```bash
cd customer-app
npm install
npm run dev
# Accessible at http://localhost:5173
```

### 3. Start the Private Admin Application
```bash
cd admin-app
npm install
npm run dev
# Accessible at http://localhost:5174
```

---

## 🔐 Default Admin Credentials

| Role | Email / Identifier | Password | Access Level |
|---|---|---|---|
| **Admin Owner** | `admin@neelamrasoi.com` | `Admin@Neelam2026` | Full Kitchen Management & Order Control |
| **Demo Customer** | `9876543210` / `rahul.verma@example.com` | `Customer@123` | Customer Ordering & Tracking |

---

## 📱 Mobile App & PWA
- **PWA Installation**: Open `http://localhost:5173` on mobile or desktop; tap the top banner "Install App" for 1-click home screen installation.
- **Offline Fallback**: Displays branded offline notice with direct call button to `9997433379`.
- **Android APK Build**:
  ```bash
  cd customer-app
  npm run build
  npx cap copy android
  npx cap sync android
  cd android
  ./gradlew assembleDebug
  ```

---

## 💳 Payment Gateway Integration (Razorpay)
- Full server-side cryptographic signature verification via HMAC SHA-256.
- Supports UPI (GPay, PhonePe, Paytm, BHIM), Cards (RuPay, Visa, Mastercard), NetBanking, and Cash on Delivery (COD).
- Configured in `backend/.env`.

---

## 📂 Project Structure
```
/neelam-ki-gharelu-rasoi
  ├── /customer-app       # React + TS + Tailwind + PWA + Capacitor Customer App
  ├── /admin-app          # Private Kitchen Dashboard (Orders, Menu, Analytics)
  ├── /backend            # Express + TypeScript + Socket.IO + Storage Backend
  ├── /shared             # Domain interfaces, status machine, localization
  ├── /android            # Native Android Gradle Project (com.neelam.rasoi)
  ├── /documentation      # Architectural specs, API docs, deployment guides
  └── README.md
```
