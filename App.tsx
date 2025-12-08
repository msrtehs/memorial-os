import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { UserView } from './components/UserView';
import { ManagerView } from './components/ManagerView';
import { WelcomingAgent } from './components/WelcomingAgent';
import { AppMode, Page, Profile, Plot, Transaction, Partner, InspectionRecord, LicensingDoc, MaintenanceTask, StockItem, AppUser } from './types';
import { MOCK_PROFILES, MOCK_PLOTS, MOCK_TRANSACTIONS, MOCK_PARTNERS, MOCK_LICENSING_DOCS, MOCK_TASKS, MOCK_STOCK } from './services/dataService';
import { subscribeToCollection, subscribeToUserProfiles } from './services/realtimeService';
import { subscribeToAuth, loginWithEmail, loginWithGoogle, registerWithEmail, logout } from './services/authService';
import { Lock, Mail, User, Chrome } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.USER);
  const [page, setPage] = useState<Page>(Page.MEMORIALS);
  
  // AUTH STATE
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Manager State
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState(false);
  const [showManagerLockModal, setShowManagerLockModal] = useState(false);
  const [managerPassword, setManagerPassword] = useState('');

  // GLOBAL DATA
  const [profiles, setProfiles] = useState<Profile[]>([]); // Começa vazio, carregará apenas do usuário
  const [plots, setPlots] = useState<Plot[]>(MOCK_PLOTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [tasks, setTasks] = useState<MaintenanceTask[]>(MOCK_TASKS);
  const [stock, setStock] = useState<StockItem[]>(MOCK_STOCK);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [licensingDocs, setLicensingDocs] = useState<LicensingDoc[]>(MOCK_LICENSING_DOCS);

  const [isWelcomingAgentOpen, setIsWelcomingAgentOpen] = useState(false);

  // 1. Monitorar Autenticação
  useEffect(() => {
    const unsubAuth = subscribeToAuth(setCurrentUser);
    return () => unsubAuth();
  }, []);

  // 2. Monitorar Perfis (Depende do Usuário Logado)
  useEffect(() => {
    let unsubProfiles: () => void;

    if (currentUser) {
      // Se logado, busca APENAS os memoriais deste usuário
      unsubProfiles = subscribeToUserProfiles(currentUser.uid, (data) => setProfiles(data));
    } else {
      // Se deslogado, limpa a lista (ou poderia mostrar demos públicas)
      setProfiles([]);
    }

    return () => {
      if (unsubProfiles) unsubProfiles();
    };
  }, [currentUser]);

  // 3. Monitorar Dados Globais (Sempre ativos)
  useEffect(() => {
    const unsubPlots = subscribeToCollection('plots', (d) => d && d.length > 0 && setPlots(d as Plot[]));
    const unsubTransactions = subscribeToCollection('transactions', (d) => d && d.length > 0 && setTransactions(d as Transaction[]));
    const unsubTasks = subscribeToCollection('tasks', (d) => d && d.length > 0 && setTasks(d as MaintenanceTask[]));
    const unsubStock = subscribeToCollection('stock', (d) => d && d.length > 0 && setStock(d as StockItem[]));
    const unsubPartners = subscribeToCollection('partners', (d) => d && d.length > 0 && setPartners(d as Partner[]));
    const unsubInspections = subscribeToCollection('inspections', (d) => d && d.length > 0 && setInspections(d as InspectionRecord[]));
    const unsubDocs = subscribeToCollection('licensingDocs', (d) => d && d.length > 0 && setLicensingDocs(d as LicensingDoc[]));

    return () => {
      unsubPlots(); unsubTransactions(); unsubTasks(); unsubStock(); unsubPartners(); unsubInspections(); unsubDocs();
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authTab === 'login') await loginWithEmail(email, password);
      else await registerWithEmail(email, password, name);
      setShowAuthModal(false);
      setEmail(''); setPassword(''); setName('');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') setAuthError('Email ou senha inválidos.');
      else if (error.code === 'auth/email-already-in-use') setAuthError('Email já cadastrado.');
      else setAuthError('Erro na autenticação.');
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
      setAuthError('Senha incorreta.');
    }
  };

  return (
    <div className={`flex h-screen transition-colors duration-500 ${mode === AppMode.USER ? 'bg-slate-50' : 'bg-slate-100'}`}>
      <Sidebar 
        mode={mode} setMode={requestModeChange} page={page} setPage={setPage}
        openWelcomingAgent={() => setIsWelcomingAgentOpen(true)}
        isWelcomingAgentOpen={isWelcomingAgentOpen}
        handleLogout={async () => { await logout(); setIsManagerAuthenticated(false); setMode(AppMode.USER); }}
        isAuthenticated={isManagerAuthenticated}
        currentUser={currentUser}
        onOpenLogin={() => setShowAuthModal(true)}
      />
      
      {/* MOBILE FIX: removed fixed margin-left (ml-72) on small screens, added padding-top for mobile header space */}
      <main className="flex-1 md:ml-72 overflow-y-auto h-screen scroll-smooth pt-16 md:pt-0">
        {mode === AppMode.USER ? (
          <UserView 
            page={page} profiles={profiles} setProfiles={setProfiles} plots={plots} setPlots={setPlots}
            setTransactions={setTransactions} setPage={setPage} tasks={tasks} setTasks={setTasks} currentUser={currentUser}
          />
        ) : (
          <ManagerView 
            page={page} setPage={setPage} setProfiles={setProfiles} profiles={profiles} plots={plots} setPlots={setPlots}
            transactions={transactions} setTransactions={setTransactions} partners={partners} setPartners={setPartners}
            inspections={inspections} setInspections={setInspections} licensingDocs={licensingDocs} setLicensingDocs={setLicensingDocs}
            tasks={tasks} setTasks={setTasks} stock={stock} setStock={setStock}
          />
        )}
      </main>

      {mode === AppMode.USER && <WelcomingAgent isOpen={isWelcomingAgentOpen} setIsOpen={setIsWelcomingAgentOpen} />}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
             <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button onClick={() => setAuthTab('login')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${authTab === 'login' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Entrar</button>
                <button onClick={() => setAuthTab('register')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${authTab === 'register' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Criar Conta</button>
             </div>
             <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authTab === 'register' && <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className="w-full bg-slate-50 border p-3 rounded-xl" />}
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-50 border p-3 rounded-xl" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="w-full bg-slate-50 border p-3 rounded-xl" />
                {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}
                <button type="submit" disabled={authLoading} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl shadow-lg">{authLoading ? '...' : 'Confirmar'}</button>
                <button type="button" onClick={handleGoogleLogin} className="w-full bg-white border font-bold py-3 rounded-xl flex justify-center items-center gap-2"><Chrome className="w-4 h-4 text-blue-500"/> Google</button>
             </form>
             <button onClick={() => setShowAuthModal(false)} className="w-full text-center text-slate-400 text-xs mt-4">Fechar</button>
          </div>
        </div>
      )}

      {/* MANAGER LOCK MODAL */}
      {showManagerLockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
             <Lock className="w-12 h-12 text-slate-800 mx-auto mb-4" />
             <h2 className="text-xl font-bold mb-4">Acesso Restrito</h2>
             <form onSubmit={handleManagerLogin}>
                <input type="password" autoFocus value={managerPassword} onChange={e => setManagerPassword(e.target.value)} placeholder="PIN" className="w-full bg-slate-50 border p-3 rounded-xl text-center text-lg mb-4" />
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg">Acessar</button>
                <button type="button" onClick={() => setShowManagerLockModal(false)} className="w-full text-slate-400 text-xs mt-4">Cancelar</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}