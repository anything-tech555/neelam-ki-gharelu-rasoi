# System Architecture & Technical Specifications: Neelam Ki Gharelu Rasoi

## 1. Executive Summary
**Neelam Ki Gharelu Rasoi (नीलम की घरेलू रसोई)** is a full-stack, enterprise-grade food ordering platform dedicated to serving authentic, 100% pure vegetarian homemade meals in Moradabad, Uttar Pradesh, India.

The platform is designed with complete physical and logical separation between:
1. **Public Customer Food Ordering App** (`customer-app`): Highly optimized responsive web application, installable PWA, and Android application (Capacitor).
2. **Private Admin Management App** (`admin-app`): Fully isolated, password-protected back-office management console for kitchen operations.
3. **Unified Backend & Real-Time Engine** (`backend`): Central Node.js & Express RESTful API with Socket.IO bidirectional event streaming, persistent database, role-based authorization, and Razorpay payment verification.
4. **Shared Domain Layer** (`shared`): Canonical TypeScript models, order state machines, and bilingual localization dictionaries.

---

## 2. Architectural Blueprint

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|  [ Customer Web App ]       [ Customer Mobile PWA ]      [ Native Android APK ]   |
|  Port: 5173                 Service Worker Precache       com.neelam.rasoi        |
|  Tailwind + Baloo 2         Offline Fallback UI           Hardware-accelerated    |
|                                                                                   |
|  ===============================================================================  |
|                                                                                   |
|  [ Private Admin Management App ]                                                 |
|  Port: 5174                                                                       |
|  Protected Dashboard | Real-Time Audio Chime | Kitchen Status & Controls          |
+-----------------------------------------------------------------------------------+
                                   │                   ▲
                                   │ REST (JSON)       │ Socket.IO Events
                                   ▼                   │
+-----------------------------------------------------------------------------------+
|                         UNIFIED SECURE BACKEND SERVICE                            |
|                                                                                   |
|  [ Auth & RBAC ]           [ Order Pipeline ]          [ Real-Time Engine ]      |
|  JWT + Bcrypt              8-Stage State Machine       Socket.IO Room Dispatcher  |
|                                                                                   |
|  [ Menu & Stock ]          [ Pricing & Billing ]       [ Razorpay Service ]       |
|  Availability Toggles      Server-side Recalculation   HMAC SHA-256 Signatures    |
|                                                                                   |
|  [ Media Storage ]         [ Ratings & Reviews ]       [ Restaurant Controls ]    |
|  Multer Uploads            Verified Order Gate         Prep/Delivery Time Engine  |
+-----------------------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------------------+
|                               PERSISTENCE LAYER                                   |
|                                                                                   |
|  [ JSON / SQLite Atomic File Store ]           [ Static Media / Uploads ]        |
|  backend/data/database.json                   backend/uploads/                   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Order Lifecycle State Machine

Every order progresses through an 8-stage state machine:

1. **`ORDER_PLACED`**: Order received with server-side recalculated bill. Broadcasted immediately to admin room (`new-order`) with audio alert.
2. **`ORDER_CONFIRMED`**: Kitchen manager confirms the order.
3. **`PREPARATION_STARTED`**: Chef starts preparation with desi ghee and fresh spices.
4. **`BEING_PREPARED`**: Fresh food is simmering.
5. **`FOOD_READY`**: Order packed in thermal containers.
6. **`OUT_FOR_DELIVERY`**: Dispatch rider departs; customer cancellation is strictly locked.
7. **`DELIVERED`**: Order safely delivered; unlocks customer review prompt.
8. **`CANCELLED`**: Cancelled either by customer within the 30-minute window or by management with audited reason.

---

## 4. Security Principles

1. **Server-Side Price Calculation**: Dish prices, delivery fees, and coupon discounts are never trusted from the client. The server looks up current item prices in the database to calculate line totals, subtotals, and final bill.
2. **Cryptographic Payment Verification**: Razorpay payment signatures are validated on the server using `crypto.createHmac('sha256', SECRET)`.
3. **Role-Based Access Control (RBAC)**: All administrative endpoints (`/api/food/*`, `/api/orders/*/status`, `/api/settings`, `/api/coupons/*`) verify `req.user.role === 'admin'`.
4. **Separation of Admin Code**: The admin code is bundled and delivered in an independent application.
