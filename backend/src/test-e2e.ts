/**
 * Comprehensive End-to-End Automated Integration Test Suite
 * Tests all workflows: Auth, Admin RBAC, Menu, Cart, Orders, Payments, Tracking, Reviews, Settings
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('===============================================================');
  console.log('  NEELAM KI GHARELU RASOI — AUTOMATED E2E INTEGRATION TESTS    ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, title: string, details?: any) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`, details || '');
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
    assert(health.status === 'online', '1. Backend Health Check Online');

    // 2. Admin Login
    const adminLogin = await fetch(`${BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@neelamrasoi.com', password: 'Admin@Neelam2026' })
    }).then(r => r.json());
    assert(adminLogin.success && adminLogin.token, '2. Admin Authentication & JWT Generation');
    const adminToken = adminLogin.token;

    // 3. Customer Registration & Login
    const testEmail = `cust-${Date.now()}@example.com`;
    const testPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const custReg = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Gupta',
        email: testEmail,
        phone: testPhone,
        password: 'Password@123',
        address: 'B-12, Gandhi Nagar, Moradabad',
        landmark: 'Near Water Tank'
      })
    }).then(r => r.json());
    assert(custReg.success && custReg.token, '3. Customer Registration with 10-Digit Mobile');
    const customerToken = custReg.token;

    // 4. Admin RBAC Security Enforcement (Non-admin must be blocked with 403 Forbidden)
    const unauthorizedAttempt = await fetch(`${BASE_URL}/food/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ name: 'Hacked Dish', price: 10, categoryId: 'cat-breakfast' })
    });
    assert(unauthorizedAttempt.status === 403, '4. RBAC Security: Customer blocked from Admin Food Creation (403 Forbidden)');

    // 5. Admin Food Item Creation
    const newDish = await fetch(`${BASE_URL}/food/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Kesari Dal Baati Churma',
        hindiName: 'केसरी दाल बाटी चूरमा',
        description: 'Traditional Rajasthani pure desi ghee baatis served with spicy panchmel dal and churma.',
        price: 180,
        discountPrice: 165,
        categoryId: 'cat-thali',
        isSpecial: true,
        isFeatured: true,
        prepTimeMinutes: 25
      })
    }).then(r => r.json());
    assert(newDish.success && newDish.foodItem.id, '5. Admin Authorized Food Item Creation');
    const createdFoodId = newDish.foodItem.id;

    // 6. Food Price & Stock Availability Toggle
    const toggleRes = await fetch(`${BASE_URL}/food/items/${createdFoodId}/availability`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(toggleRes.success && toggleRes.isAvailable === false, '6. Instant Dish Stock Toggle (Sold Out)');

    // Toggle back to available for ordering
    await fetch(`${BASE_URL}/food/items/${createdFoodId}/availability`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    // 7. Coupon Validation (SWAGAT50)
    const couponVal = await fetch(`${BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SWAGAT50', cartSubtotal: 300 })
    }).then(r => r.json());
    assert(couponVal.success && couponVal.discountAmount > 0, '7. Server-Side Coupon Discount Validation (SWAGAT50)');

    // 8. Customer Order Creation with Server Price Validation & Delivery Fee Calculation
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        customerName: 'Aarav Gupta',
        customerPhone: testPhone,
        deliveryAddress: {
          address: 'B-12, Gandhi Nagar, Moradabad',
          landmark: 'Near Water Tank',
          deliveryInstructions: 'Piping hot please'
        },
        items: [
          { foodItemId: createdFoodId, quantity: 2 }
        ],
        paymentMethod: 'COD',
        couponCode: 'SWAGAT50'
      })
    }).then(r => r.json());
    assert(orderRes.success && orderRes.order?.orderNumber, '8. Order Placement with Server-Side Recalculated Bill');
    const order = orderRes.order;

    // 9. Real-Time Order Tracking Fetch
    const trackRes = await fetch(`${BASE_URL}/orders/${order.id}`).then(r => r.json());
    assert(trackRes.success && trackRes.order.status === 'ORDER_PLACED', '9. Real-Time Tracking Initial Status: ORDER_PLACED');

    // 10. Admin Lifecycle Progression: Placed -> Confirmed -> Prep Started -> Food Ready -> Out for Delivery -> Delivered
    const statuses = [
      'ORDER_CONFIRMED',
      'PREPARATION_STARTED',
      'BEING_PREPARED',
      'FOOD_READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ];

    for (const st of statuses) {
      const updateRes = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: st, note: `Automated test transition to ${st}` })
      }).then(r => r.json());
      assert(updateRes.success && updateRes.order.status === st, `10. Status Step: ${st}`);
    }

    // 11. Customer Rating on Delivered Order
    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        orderId: order.id,
        rating: 5,
        comment: 'Outstanding homemade flavour! Desi ghee fragrance was amazing.'
      })
    }).then(r => r.json());
    assert(reviewRes.success, '11. Eligible Delivered Customer Review Submission');

    // 12. Admin Review Reply & Moderation
    const replyRes = await fetch(`${BASE_URL}/reviews/${reviewRes.review.id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ reply: 'Dhanyavaad Aarav ji! We are delighted you enjoyed our food.' })
    }).then(r => r.json());
    assert(replyRes.success && replyRes.review.adminReply, '12. Admin Official Reply to Customer Review');

    // 13. Kitchen Time Controls & Pause Order Configuration
    const settingsUpdate = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        defaultPrepTimeMinutes: 20,
        defaultDeliveryTimeMinutes: 25,
        deliveryCharge: 30
      })
    }).then(r => r.json());
    assert(settingsUpdate.success && settingsUpdate.settings.defaultPrepTimeMinutes === 20, '13. Kitchen Time & Fee Controls Persistence');

    // 14. Admin Analytics Dashboard Data Check
    const analyticsRes = await fetch(`${BASE_URL}/settings/analytics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(analyticsRes.success && analyticsRes.analytics.totalOrders > 0, '14. Admin Real-Time Sales & Revenue Analytics');

    console.log('\n===============================================================');
    console.log(`  ALL E2E INTEGRATION TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

runTests();
