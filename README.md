# E-commerce (ShopX)

This repository holds **ShopX**, a small e-commerce demo built with plain HTML, CSS, and JavaScript on **Firebase** (Auth, Firestore, Hosting).

The runnable app and Firebase config live in the **`ecommerce/`** subdirectory. Start there for setup, data model, and deployment.

## Repository layout

| Path | Purpose |
|------|---------|
| `ecommerce/` | ShopX source: pages, `assets/`, `firebase.json`, Firestore rules |
| `ecommerce/README.md` | Full feature list, Firebase setup, data model, page map |

## Quick start

1. Open **[`ecommerce/README.md`](ecommerce/README.md)** and follow **Setup** (Firebase project, Google sign-in, Firestore, web app config).
2. Edit **[`ecommerce/assets/js/firebase.js`](ecommerce/assets/js/firebase.js)** and replace the `firebaseConfig` placeholders with your Firebase web app values.
3. Set your project in **[`ecommerce/.firebaserc`](ecommerce/.firebaserc)** (`YOUR_PROJECT_ID` → your real project ID).
4. To run locally, serve the `ecommerce/` folder with any static server (Firebase Hosting emulator, `npx serve ecommerce`, or open files only works for some flows; ES modules typically need a server).
5. Deploy (from `ecommerce/`):

   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use YOUR_PROJECT_ID
   firebase deploy --only hosting
   firebase deploy --only firestore:rules
   ```

## Highlights

- **Google Sign-In** with retailer vs company role on first login  
- **Role-based pricing** in catalog, cart, and checkout  
- **Admin** product and order management; **delivery** view for assigned orders  
- **Customer profile** with order history  

Details, Firestore collections, and security notes are documented in **`ecommerce/README.md`**.
