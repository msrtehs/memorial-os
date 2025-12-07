
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import * as firebaseAuth from "firebase/auth";
import { getStorage } from "firebase/storage";

// --- CONFIGURAÇÃO DO FIREBASE ---
// 1. Acesse: https://console.firebase.google.com/
// 2. Crie um projeto "MemorialOS"
// 3. Adicione um app Web (ícone </>)
// 4. Copie as configurações e cole abaixo substituindo os valores.

const firebaseConfig = {
  // SUBSTITUA ESTES VALORES PELOS SEUS REAIS DO CONSOLE FIREBASE
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
export const auth = (firebaseAuth as any).getAuth(app);
export const googleProvider = new (firebaseAuth as any).GoogleAuthProvider();
export const storage = getStorage(app);
