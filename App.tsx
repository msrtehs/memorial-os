
import React, { useState, useEffect } from 'react';
import { Sidebar, BrandLogoIcon } from './components/Sidebar';
import { UserView } from './components/UserView';
import { ManagerView } from './components/ManagerView';
import { WelcomingAgent } from './components/WelcomingAgent';
import { AppMode, Page, Profile, Plot, Transaction, Partner, InspectionRecord, LicensingDoc, MaintenanceTask, StockItem, AppUser } from './types';
import { MOCK_PROFILES, MOCK_PLOTS, MOCK_TRANSACTIONS, MOCK_PARTNERS, MOCK_LICENSING_DOCS, MOCK_TASKS, MOCK_STOCK } from './services/dataService';
import { subscribeToCollection } from './services/realtimeService';
import { subscribeToAuth, loginWithEmail, loginWithGoogle, registerWithEmail, logout } from './services/authService';
import { Lock, ArrowRight, AlertCircle, LogIn, Mail, User, Chrome, Camera } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.USER);
  const [page, setPage] = useState<Page>(Page.MEMORIALS);
  
  // AUTHENTICATION STATE
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Manager Specific Lock
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState(false);
  const [showManagerLockModal, setShowManagerLockModal] = useState(false);
  const [managerPassword, setManagerPassword] = useState('');

  // GLOBAL STATE (Initialized with Mocks, updated by Firebase)
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [plots, setPlots] = useState<Plot[]>(MOCK_PLOTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  
  // Maintenance & Stock
  const [tasks, setTasks] = useState<MaintenanceTask[]>(MOCK_TASKS);
  const [stock, setStock] = useState<StockItem[]>(MOCK_STOCK);

  // Environmental Sync
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [licensingDocs, setLicensingDocs] = useState<LicensingDoc[]>(MOCK_LICENSING_DOCS);

  // Welcoming Agent State
  const [isWelcomingAgentOpen, setIsWelcomingAgentOpen] = useState(false);

  // --- FIREBASE REAL-TIME CONNECTION ---
  useEffect(() => {
    // 1. Listen to Auth State
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    // 2. Listen to Database Collections
    const unsubPlots = subscribeToCollection('plots', (data) => {
      if (data && data.length > 0) setPlots(data as Plot[]);
    });

    const unsubProfiles = subscribeToCollection('profiles', (data) => {
      if (data && data.length > 0) setProfiles(data as Profile[]);
    });

    const unsubTransactions = subscribeToCollection('transactions', (data) => {
      if (data && data.length > 0) setTransactions(data as Transaction[]);
    });

    const unsubTasks = subscribeToCollection('tasks', (data) => {
      if (data && data.length > 0) setTasks(data as MaintenanceTask[]);
    });

    const unsubStock = subscribeToCollection('stock', (data) => {
      if (data && data.length > 0) setStock(data as StockItem[]);
    });

    const unsubPartners = subscribeToCollection('partners', (data) => {
      if (data && data.length > 0) setPartners(data as Partner[]);
    });

    const unsubInspections = subscribeToCollection('inspections', (data) => {
      if (data && data.length > 0) setInspections(data as InspectionRecord[]);
    });

    const unsubDocs = subscribeToCollection('licensingDocs', (data) => {
      if (data && data.length > 0) setLicensingDocs(data as LicensingDoc[]);
    });

    return () => {
      unsubAuth();
      unsubPlots();
      unsubProfiles();
      unsubTransactions();
      unsubTasks();
      unsubStock();
      unsubPartners();
      unsubInspections();
      unsubDocs();
    };
  }, []);

  const requestModeChange = (targetMode: AppMode) => {
    if (targetMode === AppMode.MANAGER) {
      if (isManagerAuthenticated) {
        setMode(AppMode.MANAGER);
        setPage(Page.DASHBOARD);
      } else {
        setShowManagerLockModal(true);
        setManagerPassword('');
      }
    } else {
      setMode(AppMode.USER);
      setPage(Page.MEMORIALS);
    }
  };

  // --- AUTH HANDLERS ---

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authTab === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
      setShowAuthModal(false);
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') setAuthError('Email ou senha inválidos.');
      else if (error.code === 'auth/email-already-in-use') setAuthError('Este email já está cadastrado.');
      else if (error.code === 'auth/weak-password') setAuthError('A senha deve ter pelo menos 6 caracteres.');
      else setAuthError('Ocorreu um erro. Tente novamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      await loginWithGoogle();
      setShowAuthModal(false);
    } catch (error: any) {
      setAuthError('Erro ao conectar com Google.');
    }
  };

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (managerPassword === '1234') {
      setIsManagerAuthenticated(true);
      setShowManagerLockModal(false);
      setMode(AppMode.MANAGER);
      setPage(Page.DASHBOARD);
    } else {
      setAuthError('Senha administrativa incorreta.');
    }
  };

  const handleAppLogout = async () => {
    await logout();
    setIsManagerAuthenticated(false);
    setMode(AppMode.USER);
    setPage(Page.MEMORIALS);
  };

  return (
    <div className={`flex h-screen transition-colors duration-500 ${mode === AppMode.USER ? 'bg-slate-50' : 'bg-slate-100'}`}>
      <Sidebar 
        mode={mode} 
        setMode={requestModeChange} 
        page={page}
        setPage={setPage}
        openWelcomingAgent={() => setIsWelcomingAgentOpen(true)}
        isWelcomingAgentOpen={isWelcomingAgentOpen}
        handleLogout={handleAppLogout}
        isAuthenticated={isManagerAuthenticated}
        currentUser={currentUser}
        onOpenLogin={() => setShowAuthModal(true)}
      />
      
      <main className="flex-1 ml-72 overflow-y-auto h-screen scroll-smooth">
        {mode === AppMode.USER ? (
          <UserView 
            page={page} 
            profiles={profiles} 
            setProfiles={setProfiles}
            plots={plots}
            setPlots={setPlots}
            setTransactions={setTransactions}
            setPage={setPage}
            tasks={tasks}
            setTasks={setTasks}
            currentUser={currentUser}
          />
        ) : (
          <ManagerView 
            page={page} 
            setPage={setPage}
            setProfiles={setProfiles}
            profiles={profiles}
            plots={plots}
            setPlots={setPlots}
            transactions={transactions}
            setTransactions={setTransactions}
            partners={partners}
            setPartners={setPartners}
            inspections={inspections}
            setInspections={setInspections}
            licensingDocs={licensingDocs}
            setLicensingDocs={setLicensingDocs}
            tasks={tasks}
            setTasks={setTasks}
            stock={stock}
            setStock={setStock}
          />
        )}
      </main>

      {/* Global AI Assistant - Only visible in User Mode */}
      {mode === AppMode.USER && (
        <WelcomingAgent 
          isOpen={isWelcomingAgentOpen} 
          setIsOpen={setIsWelcomingAgentOpen} 
        />
      )}

      {/* USER AUTH MODAL (Login/Register) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-200 relative overflow-hidden">
             
             {/* Decorative */}
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-blue-900"></div>
             <div className="relative z-10 -mt-2 mb-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-2">
                   <BrandLogoIcon className="w-10 h-10 text-blue-700" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 serif-font">Conta MemorialOS</h2>
             </div>

             {/* Tabs */}
             <div className="flex bg-slate-100 p-1 rounded-xl mb-6 relative z-10">
                <button 
                  onClick={() => setAuthTab('login')} 
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authTab === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                >
                  Entrar
                </button>
                <button 
                  onClick={() => setAuthTab('register')} 
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authTab === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                >
                  Criar Conta
                </button>
             </div>

             <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
                {authTab === 'register' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pl-10 pr-4 outline-none text-slate-900 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pl-10 pr-4 outline-none text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pl-10 pr-4 outline-none text-slate-900 text-sm"
                    />
                  </div>
                </div>

                {authError && <p className="text-xs text-red-500 font-bold text-center">{authError}</p>}

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {authLoading ? 'Processando...' : (authTab === 'login' ? 'Entrar' : 'Cadastrar')}
                </button>

                <div className="relative py-2">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                   <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Ou</span></div>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Chrome className="w-4 h-4 text-blue-500" /> Continuar com Google
                </button>
             </form>
             
             <button onClick={() => setShowAuthModal(false)} className="w-full text-center text-slate-400 text-xs mt-4 hover:text-slate-600">Fechar</button>
          </div>
        </div>
      )}

      {/* MANAGER LOCK MODAL (Kept Separate for Admin Access) */}
      {showManagerLockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-200 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-slate-800 to-slate-900"></div>
             <div className="relative z-10 flex flex-col items-center pt-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                   <Lock className="w-8 h-8 text-slate-800" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 serif-font mb-1">Área Restrita</h2>
                <p className="text-slate-500 text-sm mb-8 text-center">Digite o PIN administrativo para gerenciar o sistema.</p>

                <form onSubmit={handleManagerLogin} className="w-full space-y-4">
                   <div className="space-y-2">
                      <input 
                        type="password" 
                        autoFocus
                        value={managerPassword}
                        onChange={(e) => { setManagerPassword(e.target.value); setAuthError(''); }}
                        placeholder="PIN Administrativo"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 rounded-xl py-3 text-center text-lg tracking-widest outline-none text-slate-900"
                      />
                      {authError && <p className="text-xs text-red-500 font-bold text-center">{authError}</p>}
                   </div>

                   <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all">Acessar Painel</button>
                   <button type="button" onClick={() => setShowManagerLockModal(false)} className="w-full text-slate-400 text-sm py-2">Cancelar</button>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
