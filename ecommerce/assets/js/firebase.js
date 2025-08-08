// Firebase bootstrap. Fill in your Firebase web app config and deploy.
// See README for setup steps.

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Firebase SDK (modular) via CDN imports in HTML pages
// Each page includes firebase-app, firebase-auth, firebase-firestore scripts.
// We expose helpers that rely on global firebase namespace.

export function initFirebase() {
  if (!window.firebaseAppInstance) {
    window.firebaseAppInstance = window.firebase.initializeApp(firebaseConfig);
  }
  return window.firebaseAppInstance;
}

export function getAuthInstance() {
  initFirebase();
  return window.firebase.auth();
}

export function getFirestoreInstance() {
  initFirebase();
  return window.firebase.firestore();
}

export function getGoogleProvider() {
  return new window.firebase.auth.GoogleAuthProvider();
}