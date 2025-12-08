
import { initializeApp } from "firebase/app";
import * as firebaseFirestore from "firebase/firestore";
import * as firebaseAuth from "firebase/auth";
import * as firebaseStorage from "firebase/storage";

// --- CONFIGURAÇÃO DO FIREBASE ---
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

// EXPORTAÇÕES SEGURAS (NAMESPACE IMPORTS)
// Casting para 'any' é necessário aqui para evitar erros de tipagem do compilador
// enquanto garante que o objeto runtime seja acessado corretamente.

export const db = (firebaseFirestore as any).getFirestore(app);
export const auth = (firebaseAuth as any).getAuth(app);

// Configuração do Google Provider
const provider = new (firebaseAuth as any).GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');
export const googleProvider = provider;

export const storage = (firebaseStorage as any).getStorage(app);
