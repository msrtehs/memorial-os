
export enum AppMode {
  USER = 'USER',
  MANAGER = 'MANAGER'
}

export enum Page {
  // User Pages
  MEMORIALS = 'MEMORIALS',
  SERVICES = 'SERVICES',
  OBITUARY = 'OBITUARY',
  // Manager Pages
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  MAINTENANCE = 'MAINTENANCE',
  FINANCIAL = 'FINANCIAL',
  SECURITY = 'SECURITY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  PARTNERS = 'PARTNERS',
  EXPERT_AI = 'EXPERT_AI',
  CEMETERIES = 'CEMETERIES'
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Cemetery {
  id: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
  occupied: number;
  licensingStatus: 'valid' | 'expired' | 'pending';
  totalArea: number; // m2
  revitalizationNeeded: boolean;
  conamaStatus: 'compliant' | 'non_compliant' | 'pending_analysis';
  soilType?: string;
  aiAnalysisSummary?: string;
}

export interface Profile {
  id: string;
  name: string;
  dob: string;
  dod: string;
  bio: string;
  imageUrl: string;
  location: string;
  tributes: Tribute[];
}

export interface Tribute {
  id: string;
  author: string;
  content: string;
  date: string;
  type: 'text' | 'flower' | 'candle' | 'maintenance' | 'repair';
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'flowers' | 'maintenance' | 'tribute';
  imageUrl: string;
}

export interface Plot {
  id: string;
  cemeteryId: string;
  sector: string;
  row: string;
  number: number;
  type: 'mausoleum' | 'horizontal' | 'vertical';
  status: 'occupied' | 'available' | 'reserved' | 'maintenance';
  price: number;
  features: string[];
  burialDate?: string;
  occupantId?: string;
  occupantName?: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'EPI' | 'Material' | 'Ferramenta';
  quantity: number;
  minQuantity: number;
  unit: string;
  lastRestockDate: string;
}

export interface MaintenanceTask {
  id: string;
  plotId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  reportedDate: string;
  resolvedBy?: string;
  cost?: number; // Custo atrelado
  linkedTransactionId?: string; // ID da transação no financeiro
  usedStock?: string[]; // Itens de estoque usados
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  description: string;
  services: string[];
  contact: string;
  isVerified: boolean;
  logoUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingSources?: { title: string; uri: string }[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  status: 'verified' | 'pending';
  aiAudited: boolean;
  cemeteryId?: string;
}

export interface PricingItem {
  id: string;
  item: string;
  type: 'plot' | 'service' | 'tax' | 'construction';
  price: number;
  unit: 'fixed' | 'm2';
  description?: string;
  lastUpdated: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  location: string;
  type: 'intrusion' | 'movement' | 'unauthorized_access';
  imageUrl?: string;
  status: 'active' | 'resolved';
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface InspectionRecord {
  id: string;
  date: string;
  timestamp: number;
  cemeteryId: string;
  drainageStatus: boolean; // true = ok
  loculusStatus: boolean; // true = ok
  groundLeakDetected: boolean;
  notes: string;
  responsibleDrainage: string;
  responsibleLoculus: string;
}

export interface LicensingDoc {
  id: string;
  name: string;
  type: 'LP' | 'LI' | 'LO' | 'Technical'; 
  status: 'valid' | 'pending' | 'expired' | 'missing';
  expirationDate?: string;
  requiredPartnerType: string;
}
