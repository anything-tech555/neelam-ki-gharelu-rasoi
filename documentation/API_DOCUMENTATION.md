# API Reference: Neelam Ki Gharelu Rasoi

Base API URL: `http://localhost:5000/api`

## Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Register new customer account | No |
| `POST` | `/login` | Customer login (Phone/Email + Password) | No |
| `POST` | `/admin-login` | Dedicated Admin Portal login | No |
| `GET` | `/me` | Get profile for currently signed-in user | Yes (Bearer Token) |
| `PUT` | `/profile` | Update profile details (Name, Phone) | Yes (Bearer Token) |
| `POST` | `/addresses` | Add new saved address | Yes (Bearer Token) |
| `DELETE` | `/addresses/:id` | Remove saved address | Yes (Bearer Token) |

---

## Food Menu & Categories (`/api/food`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/items` | List dishes (query by `categoryId`, `search`, `isSpecial`, `isFeatured`) | No |
| `GET` | `/items/:id` | Retrieve single dish details | No |
| `POST` | `/items` | Add new dish to menu | Admin |
| `PUT` | `/items/:id` | Update dish details | Admin |
| `PATCH` | `/items/:id/availability` | Quick toggle dish availability | Admin |
| `DELETE` | `/items/:id` | Remove dish from menu | Admin |
| `GET` | `/categories` | List all food categories | No |
| `POST` | `/categories` | Create new category | Admin |
| `PUT` | `/categories/:id` | Update category details | Admin |
| `DELETE` | `/categories/:id` | Delete category | Admin |

---

## Orders (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/` | Create new order with server price & coupon check | Optional |
| `GET` | `/my-orders` | List logged-in customer's orders | Yes (Bearer Token) |
| `GET` | `/:id` | Get order details by ID or order number | No |
| `GET` | `/` | List all orders with status/date filters | Admin |
| `PATCH` | `/:id/status` | Update order status & time adjustments | Admin |
| `PATCH` | `/:id/cancel` | Cancel order (enforces 30m window for customers) | Optional |

---

## Payments (`/api/payment`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/create-razorpay-order` | Create genuine Razorpay order | Optional |
| `POST` | `/verify-razorpay-payment` | Verify HMAC SHA-256 signature and record payment | Optional |

---

## Reviews (`/api/reviews`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | List approved public reviews | No |
| `POST` | `/` | Submit review (requires verified delivered order) | Yes (Bearer Token) |
| `GET` | `/all` | List all reviews for moderation | Admin |
| `PATCH` | `/:id/moderate` | Approve or hide review | Admin |
| `POST` | `/:id/reply` | Post official kitchen response | Admin |

---

## Coupons & Offers (`/api/coupons`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Get public active coupons | No |
| `POST` | `/validate` | Validate coupon code against cart amount | No |
| `GET` | `/all` | List all coupons | Admin |
| `POST` | `/` | Create new coupon | Admin |
| `PUT` | `/:id` | Update coupon | Admin |
| `DELETE` | `/:id` | Delete coupon | Admin |

---

## Settings & Analytics (`/api/settings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Get restaurant settings | No |
| `PUT` | `/` | Update settings (prep time, fees, pause orders) | Admin |
| `GET` | `/analytics` | Get sales, revenue, order count & 7-day trend | Admin |

---

## File Uploads (`/api/upload`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/` | Upload dish photo (multipart/form-data `image`) | Admin |
