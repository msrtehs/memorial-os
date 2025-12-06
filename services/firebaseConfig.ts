// services/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBYYzM8uPnpq_khU-xL1oyAp0LmqrVxxoc",
  authDomain: "memorial-os-saas.firebaseapp.com",
  projectId: "memorial-os-saas",
  storageBucket: "memorial-os-saas.firebasestorage.app",
  messagingSenderId: "200753816362",
  appId: "1:200753816362:web:6cf6e84000544419637453",
  measurementId: "G-8XYWNB1CME"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as ferramentas para usar no app
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);