import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCWqiAVHIE9lTzAiq4CN9q2f-n0HqDOkAQ",
  authDomain: "d-print-studio.firebaseapp.com",
  projectId: "d-print-studio",
  storageBucket: "d-print-studio.firebasestorage.app",
  messagingSenderId: "607955567116",
  appId: "1:607955567116:web:f8db1a96b98978e860a429",
  measurementId: "G-RRCD960L4W"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
