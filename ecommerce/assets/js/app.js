// Core app logic shared across pages
// Requires firebase.js helpers and Firebase CDN SDKs loaded before this file
import { initFirebase, getAuthInstance, getFirestoreInstance, getGoogleProvider } from './firebase.js';

const auth = getAuthInstance();
const db = getFirestoreInstance();

export const USER_ROLES = {
  Retailer: 'retailer',
  Company: 'company',
  Admin: 'admin',
  Delivery: 'delivery',
};

export function onAuthChange(callback) {
  auth.onAuthStateChanged(async (user) => {
    let profile = null;
    if (user) {
      const doc = await db.collection('users').doc(user.uid).get();
      profile = doc.exists ? doc.data() : null;
    }
    callback(user, profile);
  });
}

export async function signInWithGoogleAndMaybePickRole() {
  const provider = getGoogleProvider();
  const result = await auth.signInWithPopup(provider);
  const user = result.user;
  const userDocRef = db.collection('users').doc(user.uid);
  const snap = await userDocRef.get();
  if (!snap.exists) {
    // First login: ask for role (retailer/company)
    const role = await promptForPrimaryRole();
    await userDocRef.set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      primaryRole: role, // 'retailer' or 'company'
      // Optional admin/delivery flags default false
      isAdmin: false,
      isDelivery: false,
    });
  }
  return user;
}

function promptForPrimaryRole() {
  return new Promise((resolve) => {
    // Simple modal prompt
    const modal = document.getElementById('role-modal');
    if (!modal) {
      // fallback prompt
      const picked = window.prompt('Select your role: type retailer or company');
      const normalized = (picked || '').toLowerCase();
      resolve(normalized === 'company' ? USER_ROLES.Company : USER_ROLES.Retailer);
      return;
    }
    modal.style.display = 'flex';
    const retailerBtn = modal.querySelector('[data-role-retailer]');
    const companyBtn = modal.querySelector('[data-role-company]');
    const pick = (val) => {
      modal.style.display = 'none';
      resolve(val);
    };
    retailerBtn.onclick = () => pick(USER_ROLES.Retailer);
    companyBtn.onclick = () => pick(USER_ROLES.Company);
  });
}

export function signOut() {
  return auth.signOut();
}

export function getActivePrice(product, profile) {
  if (!profile || !profile.primaryRole) return product.msrp ?? product.priceCompany ?? product.priceRetailer;
  if (profile.primaryRole === USER_ROLES.Company) return product.priceCompany ?? product.msrp;
  if (profile.primaryRole === USER_ROLES.Retailer) return product.priceRetailer ?? product.msrp;
  return product.msrp ?? product.priceCompany ?? product.priceRetailer;
}

// Cart utilities (localStorage)
const CART_KEY = 'ec_cart_v1';
export function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}
export function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}
export function addToCart(productId, quantity = 1) {
  const items = readCart();
  const idx = items.findIndex((i) => i.productId === productId);
  if (idx >= 0) items[idx].quantity += quantity; else items.push({ productId, quantity });
  writeCart(items);
}
export function removeFromCart(productId) {
  writeCart(readCart().filter((i) => i.productId !== productId));
}
export function setCartQuantity(productId, quantity) {
  const items = readCart();
  const idx = items.findIndex((i) => i.productId === productId);
  if (idx >= 0) {
    items[idx].quantity = Math.max(1, quantity);
    writeCart(items);
  }
}

// Products API (Firestore)
export async function listActiveProducts(limit = 50) {
  const snap = await db.collection('products').where('active', '==', true).limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function getProduct(productId) {
  const d = await db.collection('products').doc(productId).get();
  return d.exists ? { id: d.id, ...d.data() } : null;
}

// Orders API
export async function createOrder({ user, profile, items }) {
  const enriched = [];
  let subtotal = 0;
  for (const item of items) {
    const product = await getProduct(item.productId);
    if (!product) continue;
    const unitPrice = getActivePrice(product, profile);
    subtotal += unitPrice * item.quantity;
    enriched.push({ productId: product.id, title: product.title, quantity: item.quantity, unitPrice });
  }
  const order = {
    userId: user.uid,
    userEmail: user.email,
    items: enriched,
    subtotal,
    status: 'placed',
    createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
    assignedDeliveryUserId: null,
  };
  const ref = await db.collection('orders').add(order);
  return { id: ref.id, ...order };
}

export async function listMyOrders(userId) {
  const snap = await db.collection('orders').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Admin API
export async function adminUpsertProduct(product) {
  if (product.id) {
    const { id, ...rest } = product;
    await db.collection('products').doc(id).set(rest, { merge: true });
    return product.id;
  } else {
    const ref = await db.collection('products').add(product);
    return ref.id;
  }
}
export async function adminDeleteProduct(id) {
  await db.collection('products').doc(id).delete();
}
export async function adminListOrders() {
  const snap = await db.collection('orders').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function adminAssignOrder(orderId, deliveryUserId) {
  await db.collection('orders').doc(orderId).set({ assignedDeliveryUserId: deliveryUserId, status: 'assigned' }, { merge: true });
}

// Delivery API
export async function listAssignedOrders(deliveryUserId) {
  const snap = await db.collection('orders').where('assignedDeliveryUserId', '==', deliveryUserId).orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function updateDeliveryStatus(orderId, status) {
  await db.collection('orders').doc(orderId).set({ status }, { merge: true });
}

// Simple header auth UI hooks (sign-in/out buttons)
export function wireAuthButtons() {
  const loginBtn = document.querySelector('[data-login]');
  const logoutBtn = document.querySelector('[data-logout]');
  if (loginBtn) loginBtn.addEventListener('click', signInWithGoogleAndMaybePickRole);
  if (logoutBtn) logoutBtn.addEventListener('click', signOut);
}