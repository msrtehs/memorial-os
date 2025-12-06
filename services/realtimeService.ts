// services/realtimeService.ts
import { db } from './firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { Plot, Profile, Transaction, MaintenanceTask } from '../types';

// Função genérica para "ouvir" uma coleção em tempo real
export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  const q = query(collection(db, collectionName));
  
  // Isso cria um canal aberto. Se mudar no servidor, roda o callback aqui.
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(items);
  });

  return unsubscribe; // Retorna função para desligar o canal quando sair
};

// Funções para Salvar (Substituem os setStates manuais)
export const addTransaction = async (tx: Transaction) => {
  await addDoc(collection(db, 'transactions'), tx);
};

export const updatePlotStatus = async (plotId: string, status: string, occupant?: string) => {
  const plotRef = doc(db, 'plots', plotId);
  await updateDoc(plotRef, { 
    status, 
    occupantName: occupant || null,
    burialDate: occupant ? new Date().toLocaleDateString('pt-BR') : null
  });
};