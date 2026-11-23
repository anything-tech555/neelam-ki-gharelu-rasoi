# Production Deployment Guide: Neelam Ki Gharelu Rasoi

This comprehensive guide walks you through deploying the complete production system:
1. **Customer Web & PWA App** (`https://neelamrasoi.com`)
2. **Private Admin App** (`https://admin.neelamrasoi.com`)
3. **Backend API & WebSocket Server** (`https://api.neelamrasoi.com`)
4. **Android Native App** (`com.neelam.rasoi`)

---

## 1. Domain & DNS Configuration

Configure your domain DNS zone as follows:

| Host / Subdomain | Type | Target | Destination App |
|---|---|---|---|
| `@` (or `www`) | CNAME / A | Vercel / Netlify / Cloudflare | Customer Ordering App |
| `admin` | CNAME / A | Vercel / Netlify / Cloudflare | Private Admin Portal |
| `api` | A / CNAME | Render / Railway / VPS | Backend REST & WebSocket API |

---

## 2. Backend Deployment (Render, Railway, or VPS)

### Option A: Railway / Render (Zero Devops)
1. Push your repository to GitHub (`akshat18goyal8-dev/neelam-ki-rasoi`).
2. Create a new Web Service on Railway / Render.
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`
6. Add Environment Variables:
   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_super_strong_production_jwt_secret_64_chars
   RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
   RAZORPAY_KEY_SECRET=your_actual_live_secret_key
   FRONTEND_CUSTOMER_URL=https://neelamrasoi.com
   FRONTEND_ADMIN_URL=https://admin.neelamrasoi.com
   ```

### Option B: VPS (Ubuntu / Debian + PM2 + Nginx)
```bash
# Clone and build
cd backend
npm install
npm run build

# Start persistent process with PM2
pm2 start dist/index.js --name "neelam-rasoi-backend"
pm2 save
pm2 startup
```

---

## 3. Customer Application Deployment (Vercel / Netlify)

1. Create a project pointing to `customer-app`.
2. Set **Framework Preset**: `Vite`.
3. Set **Build Command**: `npm run build`.
4. Set **Output Directory**: `dist`.
5. Add Environment Variable:
   ```env
   VITE_API_URL=https://api.neelamrasoi.com
   ```
6. Assign Custom Domain: `neelamrasoi.com`.

---

## 4. Admin Application Deployment (Vercel / Netlify)

1. Create a separate project pointing to `admin-app`.
2. Set **Framework Preset**: `Vite`.
3. Set **Build Command**: `npm run build`.
4. Set **Output Directory**: `dist`.
5. Add Environment Variable:
   ```env
   VITE_API_URL=https://api.neelamrasoi.com
   ```
6. Assign Custom Domain: `admin.neelamrasoi.com`.

---

## 5. Firebase Migration / Alternate Database Adapter
The codebase uses a clean repository pattern in `backend/src/db/storage.ts`. To use Firebase Cloud Firestore:
1. Create a project in [Firebase Console](https://console.firebase.google.com).
2. Download `serviceAccountKey.json`.
3. Initialize `firebase-admin` in `backend/src/db/` and bind Firestore collections (`users`, `foodItems`, `categories`, `orders`, `reviews`, `coupons`, `settings`).
