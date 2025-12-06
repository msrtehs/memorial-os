
import React, { useState, useEffect } from 'react';
import { Sidebar, BrandLogoIcon } from './components/Sidebar';
import { UserView } from './components/UserView';
import { ManagerView } from './components/ManagerView';
import { WelcomingAgent } from './components/WelcomingAgent';
import { AppMode, Page, Profile, Plot, Transaction, Partner, InspectionRecord, LicensingDoc, MaintenanceTask, StockItem } from './types';
import { MOCK_PROFILES, MOCK_PLOTS, MOCK_TRANSACTIONS, MOCK_PARTNERS, MOCK_LICENSING_DOCS, MOCK_TASKS, MOCK_STOCK } from './services/dataService';
import { subscribeToCollection } from './services/realtimeService';
import { Lock, ArrowRight, AlertCircle, LogIn } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.USER);
  const [page, setPage] = useState<Page>(Page.MEMORIALS);
  
  // AUTHENTICATION STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

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
    console.log("Iniciando conexão com Firebase...");

    // Cada função retorna um "unsubscribe" para limpar a memória quando fechar o app
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

    // Cleanup function (roda ao desmontar o componente)
    return () => {
      unsubPlots();
      unsubProfiles();
      unsubTransactions();
      unsubTasks();
      unsubStock();
      unsubPartners();
      unsubInspections();
      unsubDocs();
    };
  }, []); // Array vazio garante que rode apenas uma vez ao iniciar

  const requestModeChange = (targetMode: AppMode) => {
    if (targetMode === AppMode.MANAGER) {
      if (isAuthenticated) {
        setMode(AppMode.MANAGER);
        setPage(Page.DASHBOARD);
      } else {
        setShowLoginModal(true);
        setLoginError(false);
        setPasswordInput('');
      }
    } else {
      setMode(AppMode.USER);
      setPage(Page.MEMORIALS);
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === '1234') {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setMode(AppMode.MANAGER);
      setPage(Page.DASHBOARD);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
        handleLogout={handleLogout}
        isAuthenticated={isAuthenticated}
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

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-200 relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-blue-900"></div>
             <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-white/20 rounded-full blur-2xl"></div>

             <div className="relative z-10 flex flex-col items-center pt-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                   <BrandLogoIcon className="w-10 h-10 text-blue-700" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 serif-font mb-1">Acesso Restrito</h2>
                <p className="text-slate-500 text-sm mb-8 text-center">Área exclusiva para Gestores e Assinantes MemorialOS.</p>

                <form onSubmit={handleLogin} className="w-full space-y-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha de Acesso</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" 
                          autoFocus
                          value={passwordInput}
                          onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false); }}
                          placeholder="••••••••"
                          className={`w-full bg-slate-50 border ${loginError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'} rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-slate-900`}
                        />
                      </div>
                      {loginError && (
                        <div className="flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse pl-1">
                           <AlertCircle className="w-3 h-3" /> Senha incorreta (Dica: 1234)
                        </div>
                      )}
                   </div>

                   <button 
                     type="submit"
                     className="w-full bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                   >
                     Entrar <ArrowRight className="w-4 h-4" />
                   </button>
                   
                   <button 
                     type="button"
                     onClick={() => setShowLoginModal(false)}
                     className="w-full text-slate-400 text-sm font-medium py-2 hover:text-slate-600 transition-colors"
                   >
                     Cancelar
                   </button>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
