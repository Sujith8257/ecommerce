# ShopX - E-commerce (HTML/CSS/JS + Firebase)

Role-based pricing (Retailer vs Company), Google Sign-In with role selection on first login, Admin portal for products and orders, and Delivery portal.

## Features
- Google Sign-In (first login asks: Retailer or Company; immutable)
- Role-based pricing across catalog, cart, and checkout
- Admin portal: add/edit/delete products, set price per role, assign orders to delivery user
- Delivery portal: see only assigned orders and update status
- Customer account page with order history

## Tech
- Pure HTML/CSS/JS (no frameworks)
- Firebase Auth (Google), Firestore, and Hosting

## Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication > Sign-in method > Google
3. Create Cloud Firestore database (in production mode for real projects)
4. In Project settings > General > Your apps > Web, register an app and copy the config
5. Open `assets/js/firebase.js` and replace the placeholders in `firebaseConfig`
6. (Optional) Initialize Firebase Hosting:
   - Install CLI: `npm i -g firebase-tools`
   - Login: `firebase login`
   - Init hosting in repo root (`/workspace/ecommerce`): `firebase init hosting` (use `dist` defaults or current directory)
   - Deploy: `firebase deploy`

## Firestore Data Model
- `users/{uid}`: { uid, email, displayName, photoURL, createdAt, primaryRole: 'retailer'|'company', isAdmin: bool, isDelivery: bool }
- `products/{id}`: { title, category, description, imageUrl, msrp, priceRetailer, priceCompany, stock, active, createdAt, updatedAt }
- `orders/{id}`: { userId, userEmail, items: [ { productId, title, quantity, unitPrice } ], subtotal, status, createdAt, assignedDeliveryUserId }

To mark an admin or delivery user, set `isAdmin: true` or `isDelivery: true` in their `users/{uid}` document (via the console or Admin portal extension if you build one).

## Pages
- `index.html`: Home with trending products
- `products.html`: Listing with simple category filter
- `product.html?id=...`: Product details and add to cart
- `cart.html`: Cart with quantities and totals
- `checkout.html`: Places order
- `profile.html`: User role and order history
- `admin.html`: Manage products and orders (admin only)
- `delivery.html`: Assigned orders (delivery/admin only)
- `login.html`: Google sign-in with role modal

## Notes
- This is a starter. Add Firestore security rules before going live.
- Role is stored in Firestore; changing it requires admin intervention.
- Images can reference external URLs or Firebase Storage.

## Deploy Hosting and Rules
- From `/workspace/ecommerce`:

```bash
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy --only hosting
firebase deploy --only firestore:rules
```