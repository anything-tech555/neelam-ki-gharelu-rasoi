# Razorpay Integration Guide: Neelam Ki Gharelu Rasoi

## 1. Overview
The platform integrates Razorpay for online payments across:
- **UPI**: Google Pay, PhonePe, Paytm, BHIM, Cred
- **Cards**: RuPay, Visa, MasterCard, Maestro
- **NetBanking**: All major Indian banks (SBI, HDFC, ICICI, PNB, etc.)
- **Wallets**: Paytm, Mobikwik, etc.
- **Cash on Delivery (COD)**: Handled directly with receipt generation.

---

## 2. Security Architecture
The platform enforces bank-grade security:
1. **Zero Secret Exposure**: The `RAZORPAY_KEY_SECRET` is stored strictly in `backend/.env` and is NEVER sent to the client.
2. **Order Verification**: When a customer confirms payment, the client sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to the backend.
3. **Cryptographic HMAC SHA-256 Validation**:
   ```typescript
   const body = razorpay_order_id + '|' + razorpay_payment_id;
   const expectedSignature = crypto
     .createHmac('sha256', CONFIG.RAZORPAY_KEY_SECRET)
     .update(body.toString())
     .digest('hex');

   const isValid = expectedSignature === razorpay_signature;
   ```
4. Only when `isValid === true` does the database mark `paymentStatus = 'COMPLETED'` and emit the verified status to both the customer and admin screens.

---

## 3. Configuration Steps

1. Log into your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings > API Keys**.
3. Click **Generate Key** (use Test Mode first, then switch to Live Mode).
4. Copy the **Key Id** and **Key Secret**.
5. Update `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
   ```
6. In **Settings > Webhooks**, add your webhook endpoint:
   `https://api.neelamrasoi.com/api/payment/webhook`
   and subscribe to `payment.captured` and `order.paid`.
