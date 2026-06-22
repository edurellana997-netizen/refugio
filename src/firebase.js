import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app, auth, db
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { auth, db }

/** Inicia sesión anónima y devuelve el uid. */
export function ensureAuth() {
  return new Promise((resolve, reject) => {
    if (!isFirebaseConfigured) return reject(new Error('Firebase no configurado'))
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub()
        resolve(user.uid)
      }
    })
    signInAnonymously(auth).catch(reject)
  })
}

export {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
}
