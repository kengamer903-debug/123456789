import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is configured and not using a placeholder
const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
export let isFirebaseConfigured = !!rawApiKey && rawApiKey !== "YOUR_API_KEY_HERE" && rawApiKey.length > 10;

// Initialize Firebase only if configured
let app: any;
let auth: any;
let db: any;
let storage: any;
let googleProvider: any;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    isFirebaseConfigured = false;
  }
}

if (!isFirebaseConfigured) {
  console.warn("Firebase is not configured or initialization failed. Some features will be disabled.");
  // Provide mock objects or nulls that won't crash the app on import
  auth = { onAuthStateChanged: () => () => {} }; // Mock auth
}

export { auth, db, storage, googleProvider };

export const onAuthChange = (callback: (user: any) => void) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    // Return a dummy unsubscribe function
    return () => {};
  }
};

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    alert("Firebase is not configured. Please add your API keys to .env");
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = () => isFirebaseConfigured ? signOut(auth) : Promise.resolve();

// Firestore helpers
export const saveAudioMapping = async (userId: string, sceneId: number, audioUrl: string) => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, "users", userId, "audio_map", sceneId.toString());
  await setDoc(docRef, { sceneId, audioUrl, updatedAt: new Date().toISOString() });
};

export const saveGlobalAudioMapping = async (sceneId: number, audioUrl: string) => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, "global_audio_map", sceneId.toString());
  await setDoc(docRef, { sceneId, audioUrl, updatedAt: new Date().toISOString() });
};

export const getAudioMappings = async (userId: string) => {
  if (!isFirebaseConfigured) return {};
  const colRef = collection(db, "users", userId, "audio_map");
  const snapshot = await getDocs(colRef);
  const map: Record<string, string> = {};
  snapshot.forEach((doc) => {
    const data = doc.data();
    map[data.sceneId] = data.audioUrl;
  });
  return map;
};

export const getGlobalAudioMappings = async () => {
  if (!isFirebaseConfigured) return {};
  const colRef = collection(db, "global_audio_map");
  const snapshot = await getDocs(colRef);
  const map: Record<string, string> = {};
  snapshot.forEach((doc) => {
    const data = doc.data();
    map[data.sceneId] = data.audioUrl;
  });
  return map;
};

export const deleteAudioMapping = async (userId: string, sceneId: number) => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, "users", userId, "audio_map", sceneId.toString());
  await deleteDoc(docRef);
};

export const deleteGlobalAudioMapping = async (sceneId: number) => {
  if (!isFirebaseConfigured) return;
  const docRef = doc(db, "global_audio_map", sceneId.toString());
  await deleteDoc(docRef);
};

// Storage helpers
export const uploadAudioToStorage = async (userId: string, sceneId: number, file: File, isPublic: boolean = false) => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  const path = isPublic ? `public/audio/${sceneId}_${Date.now()}` : `users/${userId}/audio/${sceneId}_${Date.now()}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const deleteAudioFromStorage = async (url: string) => {
  try {
    // This is tricky because we need the full path. 
    // Usually we'd store the path in Firestore too.
    // For now, we'll just delete the mapping.
  } catch (error) {
    console.error("Error deleting from storage", error);
  }
};
