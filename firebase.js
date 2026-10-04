import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const e = import.meta.env
const cfg = { apiKey: e.VITE_FIREBASE_API_KEY, authDomain: e.VITE_FIREBASE_AUTH_DOMAIN, projectId: e.VITE_FIREBASE_PROJECT_ID,
  storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: e.VITE_FIREBASE_APP_ID }
export const configured = !!cfg.apiKey
let auth, db
if (configured) { const app = initializeApp(cfg); auth = getAuth(app); db = getFirestore(app) }

// One shared document (loans/main) so both users see the same data.
// No Firebase keys -> local mode (browser localStorage) so the app still runs.
export const onUser = (cb) => (configured ? onAuthStateChanged(auth, cb) : (cb({ uid: 'local', displayName: 'Local mode' }), () => {}))
export const signIn = (email, pw) => (configured ? signInWithEmailAndPassword(auth, email, pw) : Promise.resolve())
export const signOutUser = () => (configured ? signOut(auth) : Promise.resolve())
export async function load(uid) {
  if (!configured) { const t = localStorage.getItem('loan-data'); return t ? JSON.parse(t) : null }
  const snap = await getDoc(doc(db, 'loans', 'main')); return snap.exists() ? snap.data() : null
}
export async function save(uid, data) {
  if (!configured) return localStorage.setItem('loan-data', JSON.stringify(data))
  await setDoc(doc(db, 'loans', 'main'), data)
}
