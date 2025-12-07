
import React from 'react';
import { AppMode, Page, AppUser } from '../types';
import { 
  Book, 
  ShoppingBag, 
  LayoutDashboard, 
  Shovel, 
  Building2,
  LogOut,
  Briefcase,
  Flower,
  CircleDollarSign,
  Map,
  FileText,
  HeartHandshake,
  User,
  Settings,
  LogIn
} from 'lucide-react';

interface SidebarProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  page: Page;
  setPage: (page: Page) => void;
  openWelcomingAgent: () => void;
  isWelcomingAgentOpen?: boolean;
  handleLogout?: () => void;
  isAuthenticated?: boolean; // Manager Auth
  currentUser?: AppUser | null; // Global User Auth
  onOpenLogin?: () => void;
}

// Reusable Logo Component
export const BrandLogoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="brandGradSmall" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0%" stopColor="currentColor" /> 
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="none" className="opacity-90" />
      <g transform="translate(12 12)">
        <path d="M0 -6.8 L5.89 -3.4 V3.4 L0 6.8 L-5.89 3.4 V-3.4 Z" fill="currentColor" stroke="white" strokeWidth="0.5" />
        <path d="M0 0 V6.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M0 0 L5.89 -3.4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M0 0 L-5.89 -3.4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </g>
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  mode, setMode, page, setPage, openWelcomingAgent, isWelcomingAgentOpen, 
  handleLogout, isAuthenticated, currentUser, onOpenLogin 
}) => {
  
  const navItemClass = (active: boolean) => 
    `w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-blue-900 text-white shadow-lg shadow-blue-200'
        : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-blue-700'
    }`;

  // Function to open profile settings (Uses a custom event or a prop if passed, 
  // currently we'll rely on UserView to show it based on a new Page enum or modal trigger.
  // For simplicity, we can trigger a state in App via prop, but let's assume we pass a prop later.
  // For now, visual only).
  const triggerProfileSettings = () => {
    // Dispatch a custom event that UserView listens to? 
    // Or cleaner: Add onEditProfile to Sidebar props.
    // For this iteration, let's use a CustomEvent as a quick bridge if UserView is mounted.
    window.dispatchEvent(new CustomEvent('openProfileSettings'));
  };

  return (
    <div className="w-72 h-screen p-4 flex flex-col fixed left-0 top-0 z-20 font-sans">
      <div className="h-full bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] flex flex-col overflow-hidden">
        
        {/* Brand */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="relative w-12 h-12 flex items-center justify-center bg-blue-50/50 rounded-2xl shadow-sm border border-blue-100 overflow-hidden group cursor-pointer" onClick={() => { setMode(AppMode.USER); setPage(Page.MEMORIALS); }}>
               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 transition-transform duration-700 group-hover:rotate-[30deg]">
                  <defs>
                    <linearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22">
                      <stop offset="0%" stopColor="#2563EB" /> 
                      <stop offset="100%" stopColor="#172554" />
                    </linearGradient>
                    <linearGradient id="sphereGradient" x1="12" y1="0" x2="12" y2="24">
                      <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="11" stroke="url(#logoGradient)" strokeWidth="1.5" fill="url(#sphereGradient)" className="opacity-90" />
                  <g transform="translate(12 12)">
                    <path d="M0 -6.8 L5.89 -3.4 V3.4 L0 6.8 L-5.89 3.4 V-3.4 Z" fill="url(#logoGradient)" stroke="white" strokeWidth="0.5"/>
                    <path d="M0 0 V6.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M0 0 L5.89 -3.4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M0 0 L-5.89 -3.4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
               </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 serif-font">MemorialOS</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium pl-[60px] uppercase tracking-widest opacity-80">
            {mode === AppMode.USER ? 'Área da Família' : 'Gestão Corporativa'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide py-4">
          {mode === AppMode.USER ? (
            <div className="space-y-1">
              <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu Principal</div>
              <button onClick={() => setPage(Page.MEMORIALS)} className={navItemClass(page === Page.MEMORIALS)}>
                <Book className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Memórias</span>
              </button>
              <button onClick={() => setPage(Page.OBITUARY)} className={navItemClass(page === Page.OBITUARY)}>
                <FileText className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Comunicar Óbito</span>
              </button>
              <button onClick={() => setPage(Page.SERVICES)} className={navItemClass(page === Page.SERVICES)}>
                <ShoppingBag className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Loja & Serviços</span>
              </button>
              
              <div className="my-4 h-px bg-slate-100/50"></div>
              
              <button onClick={openWelcomingAgent} className={navItemClass(!!isWelcomingAgentOpen)}>
                <BrandLogoIcon className={`w-5 h-5 relative z-10 ${isWelcomingAgentOpen ? 'text-white' : 'text-blue-600'}`} />
                <span className={`relative z-10 font-medium ${isWelcomingAgentOpen ? 'text-white' : 'text-slate-600'}`}>Assistente Virtual</span>
              </button>
            </div>
          ) : (
            // Manager Navigation (Preserved)
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-1">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estratégico & IA</div>
                <button onClick={() => setPage(Page.DASHBOARD)} className={navItemClass(page === Page.DASHBOARD)}>
                  <LayoutDashboard className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">Visão Geral</span>
                </button>
                <button onClick={() => setPage(Page.EXPERT_AI)} className={navItemClass(page === Page.EXPERT_AI)}>
                  <BrandLogoIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">IA Gerente & Supervisor</span>
                </button>
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Operacional</div>
                <button onClick={() => setPage(Page.INVENTORY)} className={navItemClass(page === Page.INVENTORY)}>
                  <Map className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">Mapa de Vagas</span>
                </button>
                <button onClick={() => setPage(Page.MAINTENANCE)} className={navItemClass(page === Page.MAINTENANCE)}>
                  <Shovel className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">Manutenção</span>
                </button>
                 <button onClick={() => setPage(Page.FINANCIAL)} className={navItemClass(page === Page.FINANCIAL)}>
                  <CircleDollarSign className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">Financeiro</span>
                </button>
                <button onClick={() => setPage(Page.SECURITY)} className={navItemClass(page === Page.SECURITY)}>
                  <div className="relative">
                    <BrandLogoIcon className="w-5 h-5 relative z-10" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></div>
                  </div>
                  <span className="relative z-10 font-medium">Segurança IA</span>
                </button>
              </div>
              <div className="space-y-1">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestão de Rede</div>
                <button onClick={() => setPage(Page.CEMETERIES)} className={navItemClass(page === Page.CEMETERIES)}>
                  <Building2 className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">Cemitérios & Unidades</span>
                </button>
                <button onClick={() => setPage(Page.ENVIRONMENTAL)} className={navItemClass(page === Page.ENVIRONMENTAL)}>
                  <Flower className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">Ambiental (CONAMA)</span>
                </button>
                <button onClick={() => setPage(Page.PARTNERS)} className={navItemClass(page === Page.PARTNERS)}>
                  <Briefcase className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">Parceiros</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile / Login Footer */}
        {mode === AppMode.USER && (
          <div className="px-4 mb-2">
            {currentUser ? (
              <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={triggerProfileSettings}>
                <img 
                  src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}&background=0D9488&color=fff`} 
                  alt="User" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 group-hover:border-blue-200" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{currentUser.displayName || 'Usuário'}</p>
                  <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Configurar Perfil
                  </p>
                </div>
              </div>
            ) : (
              <button 
                onClick={onOpenLogin}
                className="w-full bg-blue-50 text-blue-700 py-3 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Entrar / Cadastrar
              </button>
            )}
          </div>
        )}

        {/* Mode Toggle & Logout */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <div className="bg-white p-1 rounded-2xl mb-4 border border-slate-200 shadow-sm flex relative">
            <button 
              onClick={() => { setMode(AppMode.USER); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all z-10 ${
                mode === AppMode.USER ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Família
            </button>
            <button 
              onClick={() => { setMode(AppMode.MANAGER); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all z-10 ${
                mode === AppMode.MANAGER ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Gestor
            </button>
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-slate-100 transition-all duration-300 ease-out ${
              mode === AppMode.USER ? 'left-1' : 'left-[calc(50%+4px)]'
            }`} />
          </div>
          
          {(mode === AppMode.MANAGER && isAuthenticated) || (mode === AppMode.USER && currentUser) ? (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 transition-colors text-xs font-medium hover:bg-red-50 rounded-xl"
            >
              <LogOut className="w-3 h-3" />
              <span>Sair da Conta</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
