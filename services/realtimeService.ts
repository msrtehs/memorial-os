import { db, storage } from './firebaseConfig';
import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseStorage from "firebase/storage";
import { 
  Plot, Profile, Transaction, MaintenanceTask, StockItem, Partner, InspectionRecord, LicensingDoc
} from '../types';

// Destructuring manual dos Namespaces (ADICIONADO: deleteDoc)
const { collection, onSnapshot, addDoc, updateDoc, doc, query, setDoc, where, deleteDoc } = firebaseFirestore as any;
const { ref, uploadBytes, getDownloadURL } = firebaseStorage as any;

// --- LISTENERS ---

// Listener Genérico (Para dados globais como Lotes e Estoque)
export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  try {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const items = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(items);
    }, (error: any) => {
      console.error(`Erro ao ouvir coleção ${collectionName}:`, error);
    });
    return unsubscribe;
  } catch (e) {
    console.error("Erro crítico na inicialização do Listener:", e);
    return () => {};
  }
};

// Listener Exclusivo por Usuário
export const subscribeToUserProfiles = (userId: string, callback: (data: Profile[]) => void) => {
  try {
    // Filtra apenas perfis onde ownerId é igual ao ID do usuário logado
    const q = query(collection(db, 'profiles'), where('ownerId', '==', userId));
    
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const items = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Profile[];
      callback(items);
    }, (error: any) => {
      console.error("Erro ao buscar perfis do usuário:", error);
    });
    return unsubscribe;
  } catch (e) {
    console.error("Erro no filtro de usuário:", e);
    return () => {};
  }
};

// --- WRITERS ---

export const addTransaction = async (tx: Transaction) => {
  const { id, ...data } = tx; 
  await addDoc(collection(db, 'transactions'), data);
};

export const updatePlotStatus = async (plotId: string, status: string, occupantName?: string, burialDate?: string) => {
  const plotRef = doc(db, 'plots', plotId);
  const data = { 
    status, 
    occupantName: occupantName || null,
    burialDate: burialDate || null
  };
  await setDoc(plotRef, data, { merge: true });
};

export const savePlot = async (plot: Plot) => {
    await setDoc(doc(db, 'plots', plot.id), plot);
}

export const addProfile = async (profile: Profile) => {
  // Usa setDoc para preservar o ID gerado e salva o ownerId se fornecido
  await setDoc(doc(db, 'profiles', profile.id), profile);
};

export const updateProfile = async (profileId: string, data: Partial<Profile>) => {
  const profileRef = doc(db, 'profiles', profileId);
  await setDoc(profileRef, data, { merge: true });
};

// NOVO: Função para excluir perfil
export const deleteProfile = async (profileId: string) => {
  try {
    await deleteDoc(doc(db, 'profiles', profileId));
  } catch (error) {
    console.error("Erro ao excluir perfil:", error);
    throw error;
  }
};

export const addTask = async (task: MaintenanceTask) => {
    const { id, ...data } = task;
    await addDoc(collection(db, 'tasks'), data);
};

export const updateTaskStatus = async (taskId: string, status: string, cost?: number) => {
    const taskRef = doc(db, 'tasks', taskId);
    await setDoc(taskRef, { status, cost }, { merge: true });
};

export const updateStockQuantity = async (itemId: string, newQuantity: number) => {
    const itemRef = doc(db, 'stock', itemId);
    await setDoc(itemRef, { quantity: newQuantity }, { merge: true });
};

export const addPartner = async (partner: Partner) => {
    const { id, ...data } = partner;
    await addDoc(collection(db, 'partners'), data);
};

export const addInspection = async (record: InspectionRecord) => {
    const { id, ...data } = record;
    await addDoc(collection(db, 'inspections'), data);
};

// --- STORAGE ---
export const uploadFileToStorage = async (path: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Erro no upload (realtimeService):", error);
    throw error;
  }
};