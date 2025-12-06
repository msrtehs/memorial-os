import React, { useState, useRef, useEffect } from 'react';
import { Page, Plot, MaintenanceTask, Transaction, PricingItem, SecurityAlert, Cemetery, Profile, Partner, InspectionRecord, LicensingDoc, StockItem } from '../types';
import { MOCK_CEMETERIES, MOCK_ALERTS } from '../services/dataService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  AlertTriangle, CheckCircle, Settings, TrendingUp, Plus, Phone, 
  Award, ShieldCheck, MapPin, Loader2, Send, User, X, Edit, Save, 
  Camera, Droplets, Leaf, CircleDollarSign, 
  ArrowUpRight, Radio, Check, Building2, ChevronDown, 
  BookOpen, Calendar as CalendarIcon, MousePointer2, Clock, Search, Filter, MoreHorizontal, Briefcase, Mail,
  Bug, Waves, Microscope, Activity, FileText, ArrowRight, Package, ClipboardList, PenTool, Skull, Handshake,
  Siren, Eye, Lock, ShoppingCart, Truck
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { BrandLogoIcon } from './Sidebar';

// --- Subcomponents (Defined FIRST to avoid ReferenceError) ---

const Dashboard: React.FC<{
  selectedCemeteryId: string, 
  cemeteries: Cemetery[], 
  onNavigate: (page: Page, opts?: any) => void, 
  plots: Plot[], 
  transactions: Transaction[],
  partners: Partner[],
  setInspections: React.Dispatch<React.SetStateAction<InspectionRecord[]>>
}> = ({ selectedCemeteryId, cemeteries, onNavigate, plots, transactions, partners, setInspections }) => {
  
  const activeCemetery = cemeteries.find(c => c.id === selectedCemeteryId);
  
  // KPI Calculations
  const relevantPlots = selectedCemeteryId === 'all' ? plots : plots.filter(p => p.cemeteryId === selectedCemeteryId);
  const occupiedCount = relevantPlots.filter(p => p.status === 'occupied').length;
  const totalCount = relevantPlots.length;
  const occupancyRate = totalCount > 0 ? ((occupiedCount / totalCount) * 100).toFixed(1) : '0.0';

  const relevantTransactions = selectedCemeteryId === 'all' ? transactions : transactions.filter(t => t.cemeteryId === selectedCemeteryId);
  const monthlyRevenue = relevantTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);

  // AI Logic for Dashboard
  const [dashboardMessages, setDashboardMessages] = useState<{role: 'user'|'model', text: string}[]>([
     { role: 'model', text: `Olá. Sou a Supervisora Operacional. Monitoro ${selectedCemeteryId === 'all' ? 'todas as unidades' : activeCemetery?.name}. Ocupação: ${occupancyRate}%. Receita: R$${monthlyRevenue}. Analiso riscos de necrochorume e segurança em tempo real.` }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setDashboardMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
        setTimeout(() => {
            setDashboardMessages(prev => [...prev, { role: 'model', text: `Com base nos dados atuais (Ocupação: ${occupancyRate}%, Receita: R$${monthlyRevenue}), analiso que ${userMsg.includes('vagas') ? 'precisamos expandir o setor B.' : 'o fluxo está estável.'}` }]);
            setLoading(false);
        }, 1000);
    } catch (e) { setLoading(false); }
  };

  // Necroleachate Checklist State (LOCAL STATE FOR QUICK ACTION)
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistData, setChecklistData] = useState({ drainage: false, loculus: false, ground: false, notes: '' });

  const handleSaveChecklist = () => {
     const newRecord: InspectionRecord = {
         id: Date.now().toString(),
         date: new Date().toLocaleDateString('pt-BR'),
         timestamp: Date.now(),
         cemeteryId: selectedCemeteryId === 'all' ? 'c1' : selectedCemeteryId,
         drainageStatus: checklistData.drainage,
         loculusStatus: checklistData.loculus,
         groundLeakDetected: checklistData.ground,
         notes: checklistData.notes || 'Inspeção de rotina via Dashboard',
         responsibleDrainage: 'Zelador José Santos',
         responsibleLoculus: 'Coveiro João'
     };
     setInspections(prev => [newRecord, ...prev]);
     setShowChecklist(false);
     
     setDashboardMessages(prev => [...prev, { role: 'model', text: '✅ Checklist Ambiental registrado com sucesso. Já integrei essa inspeção ao banco de dados da Supervisora Geral e à página Ambiental.' }]);
  };
  
  const [showAquiferModal, setShowAquiferModal] = useState(false);
  const [showVectorModal, setShowVectorModal] = useState(false);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight serif-font">Dashboard Executivo</h1>
        <p className="text-slate-500 mt-1">Visão integrada de operações, financeiro e riscos.</p>
      </header>

      {/* KPI Cards as Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => onNavigate(Page.FINANCIAL)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors"><CircleDollarSign className="w-6 h-6 text-blue-600" /></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Receita Mensal</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">R$ {monthlyRevenue.toLocaleString()}</h3>
        </div>

        <div onClick={() => onNavigate(Page.INVENTORY)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors"><MapPin className="w-6 h-6 text-indigo-600" /></div>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-full">{totalCount} total</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Taxa de Ocupação</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{occupancyRate}%</h3>
        </div>

        {/* RESTORED QUICK ACTION: Does not navigate, sets local showChecklist to true */}
        <div onClick={() => setShowChecklist(true)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors"><Droplets className="w-6 h-6 text-emerald-600" /></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full animate-pulse">Ação Necessária</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Necrochorume</p>
          <h3 className="text-lg font-bold text-slate-900 mt-1">Preencher Checklist</h3>
        </div>

        <div onClick={() => onNavigate(Page.SECURITY)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 cursor-pointer transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl group-hover:bg-rose-100 transition-colors"><Siren className="w-6 h-6 text-rose-600" /></div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">2 Alertas</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Segurança IA</p>
          <h3 className="text-lg font-bold text-slate-900 mt-1">Ver Imagens</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area - Replaced with AI Supervisor as requested */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><BrandLogoIcon className="w-64 h-64 text-blue-900" /></div>
             
             <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <BrandLogoIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-xl text-slate-900 serif-font">Supervisora Operacional</h3>
                    <p className="text-sm text-slate-500">Análise de dados em tempo real</p>
                </div>
             </div>

             <div className="flex-1 bg-slate-50 rounded-3xl p-6 mb-4 overflow-y-auto max-h-[300px] relative z-10 custom-scrollbar">
                {dashboardMessages.map((msg, i) => (
                    <div key={i} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-xs text-slate-400 animate-pulse ml-2">Digitando...</div>}
             </div>

             <div className="relative z-10">
                <div className="flex gap-2">
                    <input 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Pergunte sobre ocupação, financeiro ou riscos..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 text-slate-900"
                    />
                    <button onClick={handleSendMessage} className="bg-blue-900 text-white p-3 rounded-xl hover:bg-blue-800 transition-colors"><Send className="w-5 h-5"/></button>
                </div>
             </div>
        </div>

        {/* Status Donut Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative">
             <h3 className="font-bold text-slate-900 absolute top-8 left-8">Status Geral</h3>
             <div className="h-[250px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Ocupado', value: occupiedCount, color: '#1e293b' }, // Slate 800
                                { name: 'Disponível', value: totalCount - occupiedCount, color: '#10b981' }, // Emerald 500
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            <Cell key="cell-0" fill="#1e293b" />
                            <Cell key="cell-1" fill="#10b981" />
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex gap-4 text-xs font-bold">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-800"></div> Ocupado</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Disponível</div>
             </div>
        </div>
      </div>

      {/* Monitoring Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div onClick={() => setShowAquiferModal(true)} className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2rem] cursor-pointer hover:bg-blue-50 transition-colors group">
               <div className="flex items-center gap-3 mb-2">
                   <Waves className="w-6 h-6 text-blue-500" />
                   <h3 className="font-bold text-blue-900">Monitoramento de Aquífero</h3>
               </div>
               <p className="text-sm text-blue-700/70 mb-4">Status do lençol freático e análise de piezômetros.</p>
               <span className="text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-full shadow-sm group-hover:shadow-md transition-shadow">Ver Relatório Consolidado</span>
          </div>

          <div onClick={() => setShowVectorModal(true)} className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] cursor-pointer hover:bg-amber-50 transition-colors group">
               <div className="flex items-center gap-3 mb-2">
                   <Bug className="w-6 h-6 text-amber-500" />
                   <h3 className="font-bold text-amber-900">Controle de Vetores</h3>
               </div>
               <p className="text-sm text-amber-700/70 mb-4">Monitoramento de dengue, escorpiões e pragas.</p>
               <span className="text-xs font-bold text-amber-600 bg-white px-3 py-1.5 rounded-full shadow-sm group-hover:shadow-md transition-shadow">Ver Metodologia</span>
          </div>
      </div>

      {/* Checklist Modal - RENDERED LOCALLY IN DASHBOARD */}
      {showChecklist && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-900 serif-font">Checklist: Necrochorume</h2>
                      <button onClick={() => setShowChecklist(false)}><X className="w-6 h-6 text-slate-400" /></button>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                      <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 bg-white">
                          <input type="checkbox" checked={checklistData.drainage} onChange={e => setChecklistData({...checklistData, drainage: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600" />
                          <div>
                              <span className="block font-bold text-slate-700">Drenagem Superficial</span>
                              <span className="text-xs text-slate-400">Responsável: Zelador José Santos</span>
                          </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 bg-white">
                          <input type="checkbox" checked={checklistData.loculus} onChange={e => setChecklistData({...checklistData, loculus: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600" />
                          <div>
                              <span className="block font-bold text-slate-700">Verificação de Lóculos</span>
                              <span className="text-xs text-slate-400">Responsável: Coveiro João</span>
                          </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 bg-white">
                          <input type="checkbox" checked={checklistData.ground} onChange={e => setChecklistData({...checklistData, ground: e.target.checked})} className="w-5 h-5 text-red-600 rounded focus:ring-red-500 accent-red-600" />
                          <div>
                              <span className="block font-bold text-slate-700">Vazamento no Solo Detectado?</span>
                              <span className="text-xs text-red-400 font-bold">Marque apenas se houver problemas</span>
                          </div>
                      </label>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Observações Adicionais</label>
                          <textarea 
                             value={checklistData.notes}
                             onChange={e => setChecklistData({...checklistData, notes: e.target.value})}
                             className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white text-slate-900"
                             placeholder="Descreva anomalias encontradas..."
                          />
                      </div>
                  </div>

                  <button onClick={handleSaveChecklist} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                      Salvar & Enviar Relatório
                  </button>
              </div>
          </div>
      )}

      {/* Modals for Monitoring Details (Aquifer/Vector) */}
      {showAquiferModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl">
                   <h2 className="text-2xl font-bold mb-4 serif-font text-blue-900">Monitoramento de Aquífero</h2>
                   <p className="text-slate-600 mb-4">Metodologia aplicada via parceiro <strong>EcoAcqua</strong>.</p>
                   <ul className="space-y-3 mb-6">
                       <li className="flex gap-2 items-start text-sm"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5"/> <span><strong>Piezômetros:</strong> 12 pontos de coleta instalados.</span></li>
                       <li className="flex gap-2 items-start text-sm"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5"/> <span><strong>Periodicidade:</strong> Coleta trimestral de amostras.</span></li>
                       <li className="flex gap-2 items-start text-sm"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5"/> <span><strong>Análise:</strong> DBO, DQO, Coliformes e Nitrogênio.</span></li>
                   </ul>
                   <button onClick={() => setShowAquiferModal(false)} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold">Fechar</button>
               </div>
          </div>
      )}

      {showVectorModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl">
                   <h2 className="text-2xl font-bold mb-4 serif-font text-amber-900">Controle de Vetores</h2>
                   <p className="text-slate-600 mb-4">Metodologia aplicada via parceiro <strong>VectorControl</strong>.</p>
                   <ul className="space-y-3 mb-6">
                       <li className="flex gap-2 items-start text-sm"><Bug className="w-4 h-4 text-amber-500 mt-0.5"/> <span><strong>Dengue:</strong> Armadilhas de oviposição (Ovitrampas).</span></li>
                       <li className="flex gap-2 items-start text-sm"><Bug className="w-4 h-4 text-amber-500 mt-0.5"/> <span><strong>Escorpiões:</strong> Busca ativa noturna com luz UV.</span></li>
                       <li className="flex gap-2 items-start text-sm"><Bug className="w-4 h-4 text-amber-500 mt-0.5"/> <span><strong>Desratização:</strong> Iscas parafinadas em pontos estratégicos.</span></li>
                   </ul>
                   <button onClick={() => setShowVectorModal(false)} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold">Fechar</button>
               </div>
          </div>
      )}
    </div>
  );
};

const Maintenance: React.FC<{ 
    tasks: MaintenanceTask[], 
    setTasks: React.Dispatch<React.SetStateAction<MaintenanceTask[]>>,
    stock: StockItem[],
    setStock: React.Dispatch<React.SetStateAction<StockItem[]>>,
    transactions: Transaction[],
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
    selectedCemeteryId: string
}> = ({ tasks, setTasks, stock, setStock, transactions, setTransactions, selectedCemeteryId }) => {
    
    const [activeTab, setActiveTab] = useState<'tasks' | 'stock'>('tasks');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showConcludeModal, setShowConcludeModal] = useState(false);
    const [selectedTaskToConclude, setSelectedTaskToConclude] = useState<MaintenanceTask | null>(null);
    
    // Stock Modal States
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [newStockItem, setNewStockItem] = useState({ name: '', category: 'Material', quantity: 0, minQuantity: 5, unit: 'Un' });
    const [purchaseRequest, setPurchaseRequest] = useState<{item: StockItem | null, quantity: number, estimatedCost: number}>({ item: null, quantity: 1, estimatedCost: 0 });

    // Task Creation State
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskCost, setNewTaskCost] = useState(0);
    const [newTaskPriority, setNewTaskPriority] = useState<'low'|'medium'|'high'>('medium');
    
    // Conclusion State
    const [concludeLaborCost, setConcludeLaborCost] = useState(0);
    const [selectedStockItems, setSelectedStockItems] = useState<{id: string, qty: number}[]>([]);

    const handleAddTask = () => {
        const newTask: MaintenanceTask = {
            id: Date.now().toString(),
            plotId: 'Geral',
            description: newTaskDesc,
            status: 'pending',
            priority: newTaskPriority,
            reportedDate: new Date().toLocaleDateString('pt-BR'),
            cost: newTaskCost
        };
        setTasks([...tasks, newTask]);
        setShowTaskModal(false);
    };

    const handleConcludeTask = () => {
        if (!selectedTaskToConclude) return;

        // 1. Calculate Total Cost (Labor + Stock implicitly)
        const totalCost = concludeLaborCost;

        // 2. Deduct Stock
        const updatedStock = stock.map(sItem => {
            const usage = selectedStockItems.find(u => u.id === sItem.id);
            if (usage) {
                return { ...sItem, quantity: sItem.quantity - usage.qty };
            }
            return sItem;
        });
        setStock(updatedStock);

        // 3. Create Expense Transaction
        if (totalCost > 0) {
            const newTx: Transaction = {
                id: `tx_maint_end_${Date.now()}`,
                date: new Date().toLocaleDateString('pt-BR'),
                description: `Conclusão OS: ${selectedTaskToConclude.description}`,
                amount: totalCost,
                type: 'expense',
                category: 'Manutenção',
                status: 'verified',
                aiAudited: true,
                cemeteryId: selectedCemeteryId === 'all' ? 'c1' : selectedCemeteryId
            };
            setTransactions(prev => [newTx, ...prev]);
        }

        // 4. Update Task Status
        const updatedTasks = tasks.map(t => 
            t.id === selectedTaskToConclude.id 
            ? { ...t, status: 'completed' as const, cost: totalCost } 
            : t
        );
        setTasks(updatedTasks);

        setShowConcludeModal(false);
        setSelectedTaskToConclude(null);
        setConcludeLaborCost(0);
        setSelectedStockItems([]);
    };

    const handleAddStockItem = () => {
        const newItem: StockItem = {
            id: `st_${Date.now()}`,
            name: newStockItem.name,
            category: newStockItem.category as any,
            quantity: Number(newStockItem.quantity),
            minQuantity: Number(newStockItem.minQuantity),
            unit: newStockItem.unit,
            lastRestockDate: new Date().toLocaleDateString('pt-BR')
        };
        setStock([...stock, newItem]);
        setShowAddStockModal(false);
        setNewStockItem({ name: '', category: 'Material', quantity: 0, minQuantity: 5, unit: 'Un' });
    };

    const handlePurchaseRequest = () => {
        if(!purchaseRequest.item) return;
        // Create Pending Transaction
        const newTx: Transaction = {
            id: `tx_purch_${Date.now()}`,
            date: new Date().toLocaleDateString('pt-BR'),
            description: `Solicitação Compra: ${purchaseRequest.item.name} (${purchaseRequest.quantity} ${purchaseRequest.item.unit})`,
            amount: Number(purchaseRequest.estimatedCost),
            type: 'expense',
            category: 'Compra de Estoque',
            status: 'pending',
            aiAudited: false, // Needs AI/Manager approval
            cemeteryId: selectedCemeteryId === 'all' ? 'c1' : selectedCemeteryId
        };
        setTransactions(prev => [newTx, ...prev]);
        setShowPurchaseModal(false);
        setPurchaseRequest({ item: null, quantity: 1, estimatedCost: 0 });
    };

    const toggleStockUsage = (itemId: string) => {
        const existing = selectedStockItems.find(i => i.id === itemId);
        if (existing) {
            setSelectedStockItems(selectedStockItems.filter(i => i.id !== itemId));
        } else {
            setSelectedStockItems([...selectedStockItems, { id: itemId, qty: 1 }]);
        }
    };

    return ( 
        <div className="animate-in fade-in duration-500"> 
            <header className="mb-8 flex justify-between items-end"> 
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight serif-font">Manutenção & Estoque</h1>
                    <p className="text-slate-500 mt-1">Gestão de ordens de serviço e insumos operacionais.</p>
                </div> 
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Ordens de Serviço</button>
                    <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'stock' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Estoque & Compras</button>
                </div>
            </header> 

            {activeTab === 'tasks' && (
                <>
                    <button onClick={() => setShowTaskModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-slate-800 transition-all shadow-lg mb-6">
                        <Plus className="w-5 h-5" /> Nova Ordem
                    </button>
                    <div className="grid gap-4">
                        {tasks.map(t => (
                            <div key={t.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`w-3 h-3 rounded-full ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                                        <span className="font-bold text-slate-800">{t.description}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 flex gap-4">
                                        <span>Data: {t.reportedDate}</span>
                                        {t.cost && t.cost > 0 && <span className="text-red-500 font-bold">- R$ {t.cost.toFixed(2)}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                                        t.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                                        t.status === 'in-progress' ? 'bg-blue-50 text-blue-600' : 
                                        'bg-emerald-50 text-emerald-600'
                                    }`}>
                                        {t.status === 'pending' ? 'Pendente' : t.status === 'in-progress' ? 'Em Andamento' : 'Concluído'}
                                    </span>
                                    {t.status !== 'completed' && (
                                        <button 
                                            onClick={() => { setSelectedTaskToConclude(t); setShowConcludeModal(true); }}
                                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600"
                                        >
                                            Concluir
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Stock Tab */}
            {activeTab === 'stock' && (
                <>
                 <div className="flex justify-between mb-6">
                    <button onClick={() => setShowAddStockModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-slate-800 transition-all shadow-lg">
                        <Plus className="w-5 h-5" /> Cadastrar Item
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stock.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-50 rounded-2xl"><Package className="w-6 h-6 text-slate-600" /></div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.quantity <= item.minQuantity ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {item.quantity <= item.minQuantity ? 'REPOR ESTOQUE' : 'NORMAL'}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">{item.category}</p>
                            
                            <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                                <div>
                                    <span className="block text-3xl font-bold text-slate-800">{item.quantity}</span>
                                    <span className="text-xs text-slate-400">{item.unit}</span>
                                </div>
                                <button 
                                    onClick={() => { setPurchaseRequest({item, quantity: 1, estimatedCost: 0}); setShowPurchaseModal(true); }}
                                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                                >
                                    Solicitar Compra <ShoppingCart className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
                 </>
            )}

            {/* Task Creation Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 serif-font">Nova Ordem de Manutenção</h2>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label><input value={newTaskDesc} onChange={e=>setNewTaskDesc(e.target.value)} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo Estimado (R$)</label><input type="number" value={newTaskCost} onChange={e=>setNewTaskCost(Number(e.target.value))} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" /></div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={handleAddTask} className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-bold">Salvar Ordem</button>
                            <button onClick={()=>{setShowTaskModal(false)}} className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Stock Item Modal */}
            {showAddStockModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 serif-font">Cadastrar Novo Item</h2>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Item</label><input value={newStockItem.name} onChange={e=>setNewStockItem({...newStockItem, name: e.target.value})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" placeholder="Ex: Pá de Aço" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qtd Atual</label><input type="number" value={newStockItem.quantity} onChange={e=>setNewStockItem({...newStockItem, quantity: Number(e.target.value)})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mínimo</label><input type="number" value={newStockItem.minQuantity} onChange={e=>setNewStockItem({...newStockItem, minQuantity: Number(e.target.value)})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" /></div>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unidade</label><input value={newStockItem.unit} onChange={e=>setNewStockItem({...newStockItem, unit: e.target.value})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" placeholder="Ex: Peça, Litro, Kg" /></div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={handleAddStockItem} disabled={!newStockItem.name} className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50">Salvar Item</button>
                            <button onClick={()=>{setShowAddStockModal(false)}} className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase Request Modal */}
            {showPurchaseModal && purchaseRequest.item && (
                 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-2 text-slate-900 serif-font">Solicitar Compra</h2>
                        <p className="text-slate-500 mb-6 text-sm">Requisição para: <strong>{purchaseRequest.item.name}</strong></p>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantidade a Comprar ({purchaseRequest.item.unit})</label><input type="number" value={purchaseRequest.quantity} onChange={e=>setPurchaseRequest({...purchaseRequest, quantity: Number(e.target.value)})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cotação Estimada (Total R$)</label><input type="number" value={purchaseRequest.estimatedCost} onChange={e=>setPurchaseRequest({...purchaseRequest, estimatedCost: Number(e.target.value)})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" /></div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={handlePurchaseRequest} className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700">Enviar para Financeiro</button>
                            <button onClick={()=>{setShowPurchaseModal(false)}} className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold">Cancelar</button>
                        </div>
                    </div>
                 </div>
            )}

            {/* Task Conclusion Modal */}
            {showConcludeModal && selectedTaskToConclude && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold mb-2 text-slate-900 serif-font">Concluir Manutenção</h2>
                        <p className="text-slate-500 mb-6 text-sm">{selectedTaskToConclude.description}</p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Baixar Estoque (Insumos Usados)</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-2">
                                    {stock.map(item => (
                                        <div key={item.id} onClick={() => toggleStockUsage(item.id)} className={`flex justify-between p-2 rounded-lg cursor-pointer ${selectedStockItems.find(i=>i.id===item.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}>
                                            <span className="text-sm text-slate-700">{item.name} ({item.unit})</span>
                                            {selectedStockItems.find(i=>i.id===item.id) && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo Final (Mão de Obra + Extra)</label>
                                <input 
                                    type="number" 
                                    value={concludeLaborCost} 
                                    onChange={e=>setConcludeLaborCost(Number(e.target.value))} 
                                    className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" 
                                    placeholder="0.00" 
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Este valor será lançado como despesa no Financeiro.</p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={handleConcludeTask} className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700">Confirmar & Baixar</button>
                            <button onClick={()=>{setShowConcludeModal(false)}} className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div> 
    )
};

const Financial: React.FC<{selectedCemeteryId: string, setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>, plots: Plot[], setPlots: React.Dispatch<React.SetStateAction<Plot[]>>, cemeteries: Cemetery[], transactions: Transaction[], setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>, tasks: MaintenanceTask[], setTasks: React.Dispatch<React.SetStateAction<MaintenanceTask[]>> }> = ({ selectedCemeteryId, setProfiles, plots, setPlots, cemeteries, transactions, setTransactions, tasks, setTasks }) => {
    
    // Calculate Exhumation Potential
    const relevantPlots = selectedCemeteryId === 'all' ? plots : plots.filter(p => p.cemeteryId === selectedCemeteryId);
    const expiredPlots = relevantPlots.filter(p => {
        if (p.type !== 'vertical' || !p.burialDate) return false;
        // Simple mock logic: if burial date contains 2020 or 2021, consider expired > 36 months
        return p.burialDate.includes('2020') || p.burialDate.includes('2021');
    });
    const potentialRevenue = expiredPlots.length * 4500; // Assuming 4500 for renewal or ossuary move
    
    const [ordersGenerated, setOrdersGenerated] = useState(false);

    const handleGenerateExhumationOrders = () => {
        if (expiredPlots.length === 0) return;
        
        const newTasks: MaintenanceTask[] = expiredPlots.map(p => ({
            id: `auto_exhum_${Date.now()}_${p.id}`,
            plotId: p.id,
            description: `PREPARAÇÃO EXUMAÇÃO: Setor ${p.sector}-${p.number} (Vencido)`,
            status: 'pending',
            priority: 'high',
            reportedDate: new Date().toLocaleDateString('pt-BR'),
            cost: 0 // Will be calculated upon completion
        }));
        
        setTasks(prev => [...prev, ...newTasks]);
        setOrdersGenerated(true);
        setTimeout(() => setOrdersGenerated(false), 3000);
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-8"> 
            <header><h1 className="text-3xl font-bold text-slate-900 tracking-tight serif-font">Financeiro</h1></header> 
            
            {/* FEATURE: Exhumation Revenue Projection */}
            {expiredPlots.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-[2rem] border border-amber-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Skull className="w-5 h-5"/></div>
                            <h3 className="font-bold text-amber-900">Potencial de Receita (Exumações)</h3>
                        </div>
                        <p className="text-amber-700 text-sm">{expiredPlots.length} jazigos verticais vencidos (36+ meses).</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-3xl font-bold text-amber-600">R$ {potentialRevenue.toLocaleString()}</span>
                        <button 
                            onClick={handleGenerateExhumationOrders}
                            disabled={ordersGenerated}
                            className={`text-xs px-4 py-2 rounded-full font-bold shadow-sm mt-2 transition-all ${ordersGenerated ? 'bg-emerald-500 text-white' : 'bg-white text-amber-600 hover:bg-amber-100'}`}
                        >
                            {ordersGenerated ? 'Ordens Geradas!' : 'Gerar Ordens de Preparação'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"> 
                <h3 className="font-bold text-lg mb-4">Livro Razão (Últimas Transações)</h3> 
                <div className="space-y-4"> 
                    {transactions.filter(t => selectedCemeteryId === 'all' || t.cemeteryId === selectedCemeteryId).slice(0, 5).map(t => ( 
                        <div key={t.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50"> 
                            <div> 
                                <p className="font-bold text-slate-800">{t.description}</p> 
                                <p className="text-xs text-slate-400">{t.date} • {t.category}</p> 
                                {t.status === 'pending' && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded font-bold">PENDENTE APROVAÇÃO</span>}
                            </div> 
                            <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}> {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString()} </span> 
                        </div> 
                    ))} 
                </div> 
            </div> 
        </div>
    );
};

const Inventory: React.FC<{ selectedCemeteryId: string, cemeteries: Cemetery[], plots: Plot[], setPlots: React.Dispatch<React.SetStateAction<Plot[]>> }> = ({ selectedCemeteryId, cemeteries, plots, setPlots }) => {
    const [activeTab, setActiveTab] = useState<'map' | 'list' | 'ai'>('map');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [showPlotModal, setShowPlotModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
  
    // Filter plots based on global cemetery selection
    const relevantPlots = selectedCemeteryId === 'all' ? plots : plots.filter(p => p.cemeteryId === selectedCemeteryId);
    
    // Search logic for List View
    const filteredPlots = relevantPlots.filter(p => 
      p.occupantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.number.toString().includes(searchTerm) ||
      p.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // AI Logic for Auditor
    const [aiMessages, setAiMessages] = useState<{role:'user'|'model', text:string}[]>([
        {role: 'model', text: 'Sou seu Auditor de Inventário. Monitoro os 36 meses para exumação e inconsistências de cadastro. Como posso ajudar?'}
    ]);
    const [aiInput, setAiInput] = useState('');
  
    return (
      <div className="animate-in fade-in duration-500">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight serif-font">Mapa de Vagas & Exumação</h1>
            <p className="text-slate-500 mt-1">Gestão visual do cemitério e controle de ocupação.</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
             <button onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Mapa Digital</button>
             <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Lista de Controle</button>
             <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Auditor IA</button>
          </div>
        </header>
  
        {activeTab === 'map' && (
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm h-[600px] relative overflow-hidden flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
               {selectedCemeteryId === 'all' ? (
                   <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl">
                       <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                       <h3 className="font-bold text-slate-900 text-xl mb-2">Selecione uma Unidade</h3>
                       <p className="text-slate-500">O mapa digital requer a visualização de um cemitério específico.</p>
                       <p className="text-xs text-slate-400 mt-4">Utilize o seletor no topo da página.</p>
                   </div>
               ) : (
                   <div className="w-full h-full relative overflow-auto custom-scrollbar p-10">
                        {/* Legend */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-2xl border border-slate-100 shadow-lg z-20">
                            <h4 className="font-bold text-xs uppercase text-slate-400 mb-2 tracking-wider">Legenda</h4>
                            <div className="space-y-2 text-xs font-bold text-slate-700">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-800 rounded-sm"></div> Mausoléu</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Horizontal</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Vertical (Gaveta)</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm animate-pulse"></div> Exumação (36m+)</div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <MousePointer2 className="w-3 h-3" /> Clique para Detalhes
                                </div>
                            </div>
                        </div>
  
                        {/* Map Grid Logic based on Layout Type */}
                        <div className="min-w-[800px] min-h-[600px] relative">
                             {/* SECTOR A (Mausoleums) - Top Area */}
                             <div className="absolute top-0 left-0 right-0 h-[150px] border-b-2 border-slate-200 border-dashed flex justify-center items-center gap-6 p-4">
                                  {relevantPlots.filter(p => p.type === 'mausoleum').map(p => (
                                      <div 
                                        key={p.id} 
                                        onClick={() => { setSelectedPlot(p); setShowPlotModal(true); }}
                                        className={`w-24 h-24 border-4 transition-all cursor-pointer relative group flex flex-col items-center justify-center shadow-sm hover:shadow-xl hover:scale-105 ${p.status === 'occupied' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                                      >
                                          <span className="font-serif font-bold text-2xl">{p.number}</span>
                                          <span className="text-[8px] uppercase tracking-widest opacity-60">Mausoléu</span>
                                          {/* Tooltip */}
                                          <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                                              {p.status === 'occupied' ? p.occupantName : 'Disponível'}
                                          </div>
                                      </div>
                                  ))}
                             </div>
  
                             {/* SECTOR B (Horizontal) - Left Area */}
                             <div className="absolute top-[180px] left-0 w-[45%] bottom-0 border-r-2 border-slate-200 border-dashed p-4 grid grid-cols-4 gap-2 content-start">
                                  <div className="col-span-4 text-center text-xs font-bold text-emerald-600 mb-2 uppercase tracking-widest bg-emerald-50 py-1 rounded">Setor Jardim</div>
                                  {relevantPlots.filter(p => p.type === 'horizontal').map(p => (
                                      <div 
                                        key={p.id} 
                                        onClick={() => { setSelectedPlot(p); setShowPlotModal(true); }}
                                        className={`aspect-square rounded-full border-2 flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-110 transition-transform ${p.status === 'occupied' ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-emerald-50 border-emerald-200 text-emerald-400'}`}
                                      >
                                          {p.number}
                                      </div>
                                  ))}
                             </div>
  
                             {/* SECTOR C (Vertical) - Right Area */}
                             <div className="absolute top-[180px] right-0 w-[50%] bottom-0 p-4 grid grid-cols-6 gap-1 content-start">
                                  <div className="col-span-6 text-center text-xs font-bold text-blue-600 mb-2 uppercase tracking-widest bg-blue-50 py-1 rounded">Gavetário Vertical</div>
                                  {relevantPlots.filter(p => p.type === 'vertical').map(p => {
                                      // Check Exhumation Logic (Simulated)
                                      const isExpired = p.burialDate && (p.burialDate.includes('2020') || p.burialDate.includes('2021'));
                                      return (
                                          <div 
                                            key={p.id} 
                                            onClick={() => { setSelectedPlot(p); setShowPlotModal(true); }}
                                            className={`aspect-[3/2] rounded border flex items-center justify-center font-bold text-[10px] cursor-pointer hover:z-10 hover:scale-125 transition-all shadow-sm ${
                                                isExpired ? 'bg-red-500 text-white border-red-600 animate-pulse' :
                                                p.status === 'occupied' ? 'bg-blue-600 border-blue-700 text-white' : 
                                                'bg-white border-slate-200 text-slate-300'
                                            }`}
                                          >
                                              {p.number}
                                          </div>
                                      );
                                  })}
                             </div>
                        </div>
                   </div>
               )}
           </div>
        )}
  
        {/* LIST VIEW */}
        {activeTab === 'list' && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por ocupante, lote..." 
                            className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 w-64 text-sm text-slate-900 bg-white"
                        />
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Cadastrar Lote
                    </button>
                </div>
  
                <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="p-4">Lote</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Ocupante</th>
                                <th className="p-4">Data Enterro</th>
                                <th className="p-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPlots.map(plot => {
                                const isExpired = plot.burialDate && (plot.burialDate.includes('2020') || plot.burialDate.includes('2021'));
                                return (
                                    <tr key={plot.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700">{plot.sector}-{plot.number}</td>
                                        <td className="p-4 text-slate-500 capitalize">{plot.type === 'horizontal' ? 'Jardim' : plot.type === 'vertical' ? 'Gaveta' : 'Mausoléu'}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                plot.status === 'occupied' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                {plot.status === 'occupied' ? 'Ocupado' : 'Disponível'}
                                            </span>
                                            {isExpired && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">EXUMAÇÃO</span>}
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">{plot.occupantName || '-'}</td>
                                        <td className="p-4 text-slate-500">{plot.burialDate || '-'}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => { setSelectedPlot(plot); setShowPlotModal(true); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
  
        {/* AI AUDITOR */}
        {activeTab === 'ai' && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm h-[600px] flex flex-col">
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                     <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <BrandLogoIcon className="w-8 h-8 text-white" />
                     </div>
                     <div>
                         <h3 className="font-bold text-xl text-slate-900 serif-font">Auditor de Inventário</h3>
                         <p className="text-sm text-slate-500">Monitoramento contínuo de exumações e consistência.</p>
                     </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
                     {aiMessages.map((m, i) => (
                         <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`p-4 rounded-2xl max-w-[80%] text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none'}`}>
                                 {m.text}
                             </div>
                         </div>
                     ))}
                 </div>
  
                 <div className="flex gap-2">
                     <input 
                        value={aiInput} 
                        onChange={e => setAiInput(e.target.value)} 
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 text-slate-900" 
                        placeholder="Pergunte sobre exumações vencidas..."
                     />
                     <button 
                        onClick={() => { 
                            if(!aiInput) return;
                            setAiMessages(prev => [...prev, {role:'user', text: aiInput}]);
                            setAiInput('');
                            setTimeout(() => {
                                setAiMessages(prev => [...prev, {role:'model', text: 'Analisei os registros. Temos 15 exumações vencidas no Setor C (Cemitério MG). Recomendo iniciar o processo de contato com as famílias.'}]);
                            }, 1000);
                        }} 
                        className="bg-indigo-900 text-white p-3 rounded-xl hover:bg-indigo-800"
                     >
                         <Send className="w-5 h-5" />
                     </button>
                 </div>
            </div>
        )}

        {/* Plot Details Modal (Quick Change) */}
        {showPlotModal && selectedPlot && (
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
                     <h2 className="text-2xl font-bold mb-1 serif-font">Lote {selectedPlot.sector}-{selectedPlot.number}</h2>
                     <p className="text-slate-500 mb-6 text-sm uppercase font-bold tracking-wide">{selectedPlot.type}</p>
                     
                     <div className="space-y-4 mb-8">
                         <div className="bg-slate-50 p-4 rounded-xl">
                             <span className="text-xs font-bold text-slate-400 uppercase">Status Atual</span>
                             <div className="flex items-center gap-2 mt-1">
                                 <span className={`w-3 h-3 rounded-full ${selectedPlot.status === 'occupied' ? 'bg-slate-800' : 'bg-emerald-500'}`}></span>
                                 <span className="font-bold text-slate-800">{selectedPlot.status === 'occupied' ? 'Ocupado' : 'Disponível'}</span>
                             </div>
                         </div>
                         {selectedPlot.status === 'occupied' && (
                             <div className="bg-blue-50 p-4 rounded-xl">
                                 <span className="text-xs font-bold text-blue-400 uppercase">Ocupante</span>
                                 <p className="font-bold text-blue-900 mt-1">{selectedPlot.occupantName}</p>
                                 <p className="text-xs text-blue-600">Enterro: {selectedPlot.burialDate}</p>
                             </div>
                         )}
                     </div>
                     
                     {selectedPlot.status === 'available' && (
                         <button 
                             onClick={() => {
                                 const updatedPlots = plots.map(p => p.id === selectedPlot.id ? { ...p, status: 'occupied' as const, occupantName: 'Reservado (Balcão)', burialDate: new Date().toLocaleDateString('pt-BR') } : p);
                                 setPlots(updatedPlots);
                                 setShowPlotModal(false);
                             }}
                             className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 mb-2"
                         >
                             Marcar como Ocupado (Rápido)
                         </button>
                     )}
                     <button onClick={() => setShowPlotModal(false)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Fechar</button>
                 </div>
             </div>
        )}
      </div>
    );
  };

const Security: React.FC = () => {
    // Mock Video Feed Simulation
    return (
        <div className="animate-in fade-in duration-500">
             <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight serif-font">Segurança Inteligente</h1>
                    <p className="text-slate-500 mt-1">Monitoramento por visão computacional e controle de acesso.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div> Ao Vivo
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Camera Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-black rounded-[2rem] overflow-hidden relative aspect-video shadow-2xl group border-4 border-slate-900">
                        <img src="https://picsum.photos/1200/800?grayscale" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute top-4 left-4 text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">CAM-01 • PORTÃO NORTE • REC</div>
                        
                        {/* Detection Box Simulation */}
                        <div className="absolute top-1/2 left-1/3 w-32 h-48 border-2 border-red-500 rounded-lg flex flex-col items-center">
                             <div className="bg-red-500 text-white text-[10px] font-bold px-1 -mt-2">PESSOA (98%)</div>
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="flex gap-4 text-white text-sm font-bold">
                                 <button className="hover:text-red-400">Verificar</button>
                                 <button className="hover:text-red-400">Acionar Alarme</button>
                             </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative opacity-60 hover:opacity-100 transition-opacity cursor-pointer border-2 border-slate-800 hover:border-blue-500">
                                <img src={`https://picsum.photos/400/300?random=${i+10}&grayscale`} className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 text-white text-[10px] bg-black/50 px-1 rounded">CAM-0{i+1}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alert Log */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[600px]">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Siren className="w-5 h-5 text-rose-500" /> Registro de Invasões
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {MOCK_ALERTS.map(alert => (
                            <div key={alert.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {alert.timestamp}
                                    </span>
                                    {alert.status === 'active' ? (
                                        <span className="text-[10px] bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full uppercase">Ativo</span>
                                    ) : (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-600 font-bold px-2 py-0.5 rounded-full uppercase">Resolvido</span>
                                    )}
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">{alert.location}</h4>
                                <p className="text-xs text-slate-500 mb-3">{alert.type === 'intrusion' ? 'Movimento detectado em área restrita.' : 'Acesso não autorizado.'}</p>
                                
                                {alert.status === 'active' && (
                                    <button className="w-full py-2 bg-white border border-rose-200 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-50 transition-colors">
                                        Verificar & Resolver
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Environmental: React.FC<{ 
    autoOpenChecklist: boolean, 
    setAutoOpenChecklist: (b: boolean) => void, 
    inspections: InspectionRecord[], 
    licensingDocs: LicensingDoc[], 
    setLicensingDocs: React.Dispatch<React.SetStateAction<LicensingDoc[]>>, 
    partners: Partner[],
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
}> = ({ autoOpenChecklist, setAutoOpenChecklist, inspections, licensingDocs, setLicensingDocs, partners, setTransactions }) => {
    
    const [showHireModal, setShowHireModal] = useState(false);
    const [selectedDocForHire, setSelectedDocForHire] = useState<LicensingDoc | null>(null);

    const handleHirePartner = (partner: Partner) => {
        // Create a Pending Expense Transaction
        const newTx: Transaction = {
            id: `tx_env_${Date.now()}`,
            date: new Date().toLocaleDateString('pt-BR'),
            description: `Provisão: ${selectedDocForHire?.name} - Contratado: ${partner.name}`,
            amount: 0, // Pending quote
            type: 'expense',
            category: 'Licenciamento Ambiental',
            status: 'pending',
            aiAudited: true,
            cemeteryId: 'c1'
        };
        setTransactions(prev => [newTx, ...prev]);
        setShowHireModal(false);
        // Optimistically update doc status
        if (selectedDocForHire) {
            setLicensingDocs(prev => prev.map(d => d.id === selectedDocForHire.id ? { ...d, status: 'pending' } : d));
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
             <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight serif-font">Gestão Ambiental</h1>
                    <p className="text-slate-500 mt-1">Licenciamento CONAMA 335 e monitoramento de necrochorume.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-slate-400"/> Licenças Operacionais</h3>
                    <div className="space-y-4">
                        {licensingDocs.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{doc.name}</h4>
                                    <p className="text-xs text-slate-400">Vencimento: {doc.expirationDate || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                        doc.status === 'valid' ? 'bg-emerald-100 text-emerald-600' :
                                        doc.status === 'expired' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                    }`}>{doc.status === 'valid' ? 'Vigente' : doc.status === 'expired' ? 'Vencido' : 'Pendente'}</span>
                                    
                                    {/* FEATURE: AUTOMATED WORKFLOW FOR EXPIRED DOCS */}
                                    {doc.status !== 'valid' && (
                                        <button 
                                            onClick={() => { setSelectedDocForHire(doc); setShowHireModal(true); }}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" 
                                            title="Solicitar Parceiro"
                                        >
                                            <Handshake className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* ... (Inspections card kept as is) ... */}
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-slate-400"/> Histórico de Inspeções</h3>
                    {inspections.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Nenhuma inspeção registrada recentemente.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {inspections.slice(0, 5).map(insp => (
                                <div key={insp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-slate-700 text-sm">{insp.date}</span>
                                        {insp.groundLeakDetected ? 
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">VAZAMENTO</span> : 
                                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">NORMAL</span>
                                        }
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{insp.notes || 'Sem observações.'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Hire Partner Modal */}
            {showHireModal && selectedDocForHire && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 serif-font">Regularizar: {selectedDocForHire.name}</h2>
                        <p className="text-slate-500 mb-6 text-sm">Selecione um parceiro homologado para iniciar o processo.</p>
                        
                        <div className="space-y-3 mb-8 max-h-60 overflow-y-auto">
                            {partners.filter(p => p.type.includes(selectedDocForHire.requiredPartnerType) || selectedDocForHire.requiredPartnerType.includes(p.type)).map(partner => (
                                <div key={partner.id} onClick={() => handleHirePartner(partner)} className="p-4 border border-slate-200 rounded-xl hover:bg-blue-50 cursor-pointer flex items-center gap-4 group">
                                    <img src={partner.logoUrl} className="w-10 h-10 rounded-lg" />
                                    <div>
                                        <h4 className="font-bold text-slate-800">{partner.name}</h4>
                                        <p className="text-xs text-slate-500 group-hover:text-blue-600">Solicitar Orçamento</p>
                                    </div>
                                </div>
                            ))}
                            {partners.filter(p => p.type.includes(selectedDocForHire.requiredPartnerType)).length === 0 && (
                                <p className="text-center text-slate-400 text-sm py-4">Nenhum parceiro específico encontrado.</p>
                            )}
                        </div>

                        <button onClick={() => setShowHireModal(false)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold w-full">Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Partners: React.FC<{ partners: Partner[], setPartners: React.Dispatch<React.SetStateAction<Partner[]>> }> = ({ partners, setPartners }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPartner, setNewPartner] = useState({ name: '', type: 'Construção', description: '', contact: '' });

    const categories = ['all', 'Licenciamento & Gestão', 'Construção', 'Manutenção', 'Ambiental & Aquíferos', 'Saúde Pública'];

    const filteredPartners = selectedCategory === 'all' 
        ? partners 
        : partners.filter(p => p.type.includes(selectedCategory));

    const handleAddPartner = () => {
        const partner: Partner = {
            id: `pt_${Date.now()}`,
            name: newPartner.name,
            type: newPartner.type,
            description: newPartner.description,
            services: [],
            contact: newPartner.contact,
            isVerified: true,
            logoUrl: `https://ui-avatars.com/api/?name=${newPartner.name}&background=random&color=fff`
        };
        setPartners([...partners, partner]);
        setShowAddModal(false);
        setNewPartner({ name: '', type: 'Construção', description: '', contact: '' });
    };

    return (
        <div className="animate-in fade-in duration-500">
             <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight serif-font">Rede de Parceiros</h1>
                    <p className="text-slate-500 mt-1">Gestão de fornecedores e prestadores de serviço homologados.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Cadastrar Parceiro
                </button>
            </header>

            <div className="mb-8 overflow-x-auto pb-2">
                <div className="flex gap-2">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            {cat === 'all' ? 'Todos' : cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPartners.map(partner => (
                    <div key={partner.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <img src={partner.logoUrl} alt={partner.name} className="w-14 h-14 rounded-2xl shadow-sm" />
                                <div>
                                    <h3 className="font-bold text-slate-900">{partner.name}</h3>
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{partner.type}</span>
                                </div>
                            </div>
                            {partner.isVerified && (
                                <div title="Verificado">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-3">{partner.description}</p>
                        
                        <div className="border-t border-slate-50 pt-4 flex justify-between items-center">
                            <a href={`mailto:${partner.contact}`} className="text-xs font-bold text-blue-600 flex items-center gap-2 hover:underline">
                                <Mail className="w-3 h-3" /> {partner.contact}
                            </a>
                            <button className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 serif-font">Novo Parceiro</h2>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Empresa</label><input value={newPartner.name} onChange={e=>setNewPartner({...newPartner, name: e.target.value})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" /></div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                                <select value={newPartner.type} onChange={e=>setNewPartner({...newPartner, type: e.target.value})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none">
                                    {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label><textarea value={newPartner.description} onChange={e=>setNewPartner({...newPartner, description: e.target.value})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none h-24 resize-none" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email / Contato</label><input value={newPartner.contact} onChange={e=>setNewPartner({...newPartner, contact: e.target.value})} className="border border-slate-200 p-3 w-full rounded-xl bg-white text-slate-900 outline-none" /></div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={handleAddPartner} disabled={!newPartner.name} className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50">Cadastrar</button>
                            <button onClick={()=>{setShowAddModal(false)}} className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CemeteriesManagement: React.FC<{ cemeteries: Cemetery[], setCemeteries: React.Dispatch<React.SetStateAction<Cemetery[]>> }> = ({ cemeteries }) => {
    return <div className="bg-white p-8 rounded-[2.5rem]"><h2 className="font-bold text-xl mb-4">Gestão de Unidades</h2><div className="grid gap-4">{cemeteries.map(c=><div key={c.id} className="p-4 border rounded-xl flex justify-between"><span>{c.name}</span><span className="font-bold">{c.city}</span></div>)}</div></div>;
};

// --- EXPERT AI (OMNISCIENT 2.0 - GRANULAR) ---

const ExpertAI: React.FC<{ 
    partners: Partner[], 
    plots: Plot[], 
    transactions: Transaction[],
    inspections: InspectionRecord[],
    licensingDocs: LicensingDoc[],
    cemeteries: Cemetery[],
    tasks: MaintenanceTask[],
    stock: StockItem[],
    profiles: Profile[]
}> = ({ partners, plots, transactions, inspections, licensingDocs, cemeteries, tasks, stock, profiles }) => {
    const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
        { role: 'model', text: 'Olá. Sou sua Supervisora Geral Onisciente. Agora possuo visão granular por cemitério (Centro de Custos). Posso analisar o desempenho individual de cada unidade e sugerir ações específicas. Como posso ajudar?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Function to generate the Real-Time System Snapshot - OMNISCIENT VERSION 2.0 (Granular)
    const generateSystemSnapshot = () => {
        // Global Data
        const globalIncome = transactions.filter(t => t.type === 'income').reduce((a,b) => a + b.amount, 0);
        const globalExpense = transactions.filter(t => t.type === 'expense').reduce((a,b) => a + b.amount, 0);
        
        // Granular Breakdown per Cemetery
        const detailedUnits = cemeteries.map(c => {
             // Financials for this unit
             const unitIncome = transactions.filter(t => t.cemeteryId === c.id && t.type === 'income').reduce((a,b) => a + b.amount, 0);
             const unitExpense = transactions.filter(t => t.cemeteryId === c.id && t.type === 'expense').reduce((a,b) => a + b.amount, 0);
             
             // Tasks for this unit (resolve via Plot ID)
             const unitTasks = tasks.filter(t => {
                 const plot = plots.find(p => p.id === t.plotId);
                 return plot?.cemeteryId === c.id; // Link Task -> Plot -> Cemetery
             });
             const pendingUnitTasks = unitTasks.filter(t => t.status === 'pending').length;
             
             // Inventory for this unit
             const unitPlots = plots.filter(p => p.cemeteryId === c.id);
             const unitOccupied = unitPlots.filter(p => p.status === 'occupied').length;
             const unitExpired = unitPlots.filter(p => p.type === 'vertical' && p.burialDate && (p.burialDate.includes('2020') || p.burialDate.includes('2021'))).length;
             
             return {
                 id: c.id,
                 nome: c.name,
                 cidade: c.city,
                 centro_de_custo: {
                     receita: unitIncome,
                     despesa: unitExpense,
                     saldo: unitIncome - unitExpense
                 },
                 operacional: {
                     ocupacao: `${((unitOccupied / unitPlots.length) * 100).toFixed(1)}%`,
                     manutencao_pendente: pendingUnitTasks,
                     exumacoes_urgentes: unitExpired
                 },
                 ambiental: c.licensingStatus
             };
        });

        // Other Global Context
        const pendingPurchases = transactions.filter(t => t.status === 'pending' && t.category === 'Compra de Estoque').length;
        const stockLow = stock.filter(s => s.quantity <= s.minQuantity).map(s => s.name);
        const partnerCount = partners.length;

        return JSON.stringify({
            contextoUsuario: {
                nome: "Gestor Administrativo",
                login: "admin_1234",
                perfil: "Focado em eficiência e centros de custo."
            },
            visao_global: { 
                receita_total: globalIncome, 
                despesa_total: globalExpense,
                estoque_critico: stockLow,
                compras_pendentes: pendingPurchases
            },
            detalhe_por_unidade: detailedUnits, // NEW GRANULAR DATA
            integracoes: {
                alerta: "Cruze os dados de 'detalhe_por_unidade'. Se uma unidade tem saldo negativo e muita manutenção pendente, alerte o gestor.",
            },
            parceiros: partnerCount
        }, null, 2);
    };

    const handleSend = async () => {
        if(!input.trim()) return;
        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setLoading(true);

        const currentSnapshot = generateSystemSnapshot();

        try {
          const apiKey = process.env.API_KEY;
          if (!apiKey) throw new Error("API Key missing");
          const ai = new GoogleGenAI({ apiKey });
          
          const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { 
                systemInstruction: `
                PERFIL: SUPERVISORA GERAL ONISCIENTE 2.0 (GRANULAR).
                
                DADOS COMPLETOS DO SISTEMA (SNAPSHOT):
                ${currentSnapshot}
                
                MISSÃO:
                1. ANALISE CADA UNIDADE INDIVIDUALMENTE. Você recebeu o objeto 'detalhe_por_unidade'.
                2. Identifique quais cemitérios são lucrativos e quais dão prejuízo (Centro de Custo).
                3. Se uma unidade específica (ex: Campinas) tem muitas 'exumacoes_urgentes', sugira ação focada lá.
                4. Compare as unidades: "A Unidade SP tem receita maior, mas a Unidade MG tem passivo ambiental".
                5. Mantenha a visão global sobre Estoque e Compras.
                
                Responda como uma Diretora de Operações que olha os números detalhados.
                ` 
            },
            history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
          });
          
          const result = await chat.sendMessage({ message: userText });
          const response = result.text;
          setMessages(prev => [...prev, { role: 'model', text: response || '' }]);
        } catch (e) {
          setMessages(prev => [...prev, { role: 'model', text: 'Erro de conexão. Verifique sua chave de API.' }]);
        } finally {
          setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-[2rem] shadow-[0_2px_30px_-5px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden font-sans">
           {/* BRANDING: Header with Logo Icon and Blue Gradient */}
           <div className="bg-gradient-to-r from-blue-600 to-blue-900 p-6 flex items-center justify-between text-white shadow-md z-10">
               <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                       <BrandLogoIcon className="w-8 h-8 text-white" />
                   </div>
                   <div>
                       <h2 className="font-bold text-lg leading-tight serif-font">Supervisora Geral</h2>
                       <p className="text-xs text-blue-300 font-medium tracking-wide">Onisciência Granular por Unidade</p>
                   </div>
               </div>
               <div className="flex gap-2">
                   <span className="bg-emerald-500/20 border border-emerald-500/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-200 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Conectada</span>
               </div>
           </div>
           <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
              {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-6 rounded-[2rem] max-w-[80%] text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-200' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'}`}>
                          {m.text}
                      </div>
                  </div>
              ))}
              {loading && <div className="text-slate-400 text-xs animate-pulse">Analisando dados globais...</div>}
              <div ref={messagesEndRef} />
           </div>
           <div className="p-6 bg-white border-t border-slate-100">
               <div className="relative">
                   <input 
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                       placeholder="Pergunte sobre Manutenção, Estoque ou Centros de Custo..."
                       className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-slate-900"
                   />
                   <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-800 transition-colors">
                       <Send className="w-4 h-4" />
                   </button>
               </div>
           </div>
        </div>
    );
};

// --- MAIN COMPONENT (Defined Last) ---

interface ManagerViewProps {
  page: Page;
  setPage: (page: Page) => void;
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  profiles: Profile[];
  plots: Plot[];
  setPlots: React.Dispatch<React.SetStateAction<Plot[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  partners: Partner[];
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  inspections: InspectionRecord[];
  setInspections: React.Dispatch<React.SetStateAction<InspectionRecord[]>>;
  licensingDocs: LicensingDoc[];
  setLicensingDocs: React.Dispatch<React.SetStateAction<LicensingDoc[]>>;
  tasks: MaintenanceTask[];
  setTasks: React.Dispatch<React.SetStateAction<MaintenanceTask[]>>;
  stock: StockItem[];
  setStock: React.Dispatch<React.SetStateAction<StockItem[]>>;
}

export const ManagerView: React.FC<ManagerViewProps> = ({ 
    page, setPage, setProfiles, profiles, plots, setPlots, transactions, setTransactions, partners, setPartners,
    inspections, setInspections, licensingDocs, setLicensingDocs, tasks, setTasks, stock, setStock
}) => {
  const [selectedCemeteryId, setSelectedCemeteryId] = useState<string>('all');
  const [cemeteries, setCemeteries] = useState<Cemetery[]>(MOCK_CEMETERIES);

  // FAB for Expert AI in Manager Mode
  const handleOpenExpertAI = () => setPage(Page.EXPERT_AI);

  return (
    <div className="p-8 md:p-12 max-w-[1600px] mx-auto min-h-screen font-sans">
      
      {/* GLOBAL HEADER & SELECTOR */}
      <div className="flex justify-between items-center mb-10">
          <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gestão Corporativa</p>
              <h2 className="text-2xl font-bold text-slate-900 serif-font">
                {selectedCemeteryId === 'all' ? 'Rede MemorialOS (Global)' : cemeteries.find(c => c.id === selectedCemeteryId)?.name}
              </h2>
          </div>
          
          {/* Global Cemetery Selector */}
          <div className="relative group pt-2">
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {selectedCemeteryId === 'all' ? 'Todas as Unidades' : cemeteries.find(c => c.id === selectedCemeteryId)?.city}
                  <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover:block z-50 animate-in slide-in-from-top-2">
                  <button 
                      onClick={() => setSelectedCemeteryId('all')}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold mb-1 ${selectedCemeteryId === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                      Todas as Unidades (Visão Global)
                  </button>
                  <div className="h-px bg-slate-100 my-1"></div>
                  {cemeteries.map(c => (
                      <button 
                          key={c.id}
                          onClick={() => setSelectedCemeteryId(c.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium ${selectedCemeteryId === c.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                          {c.city} - {c.name}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* Page Content Render */}
      {page === Page.DASHBOARD && <Dashboard selectedCemeteryId={selectedCemeteryId} cemeteries={cemeteries} onNavigate={setPage} plots={plots} transactions={transactions} partners={partners} setInspections={setInspections} />}
      {page === Page.INVENTORY && <Inventory selectedCemeteryId={selectedCemeteryId} cemeteries={cemeteries} plots={plots} setPlots={setPlots} />}
      {page === Page.MAINTENANCE && <Maintenance tasks={tasks} setTasks={setTasks} stock={stock} setStock={setStock} transactions={transactions} setTransactions={setTransactions} selectedCemeteryId={selectedCemeteryId} />}
      {page === Page.FINANCIAL && <Financial selectedCemeteryId={selectedCemeteryId} setProfiles={setProfiles} plots={plots} setPlots={setPlots} cemeteries={cemeteries} transactions={transactions} setTransactions={setTransactions} tasks={tasks} setTasks={setTasks} />}
      {page === Page.SECURITY && <Security />}
      {page === Page.ENVIRONMENTAL && <Environmental autoOpenChecklist={false} setAutoOpenChecklist={() => {}} inspections={inspections} licensingDocs={licensingDocs} setLicensingDocs={setLicensingDocs} partners={partners} setTransactions={setTransactions} />}
      {page === Page.PARTNERS && <Partners partners={partners} setPartners={setPartners} />}
      {page === Page.CEMETERIES && <CemeteriesManagement cemeteries={cemeteries} setCemeteries={setCemeteries} />}
      {page === Page.EXPERT_AI && <ExpertAI partners={partners} plots={plots} transactions={transactions} inspections={inspections} licensingDocs={licensingDocs} cemeteries={cemeteries} tasks={tasks} stock={stock} profiles={profiles} />}

      {/* Floating Action Button for Expert AI (Manager Mode Only) */}
      {page !== Page.EXPERT_AI && (
        <button
          onClick={handleOpenExpertAI}
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-900 text-white rounded-full shadow-[0_8px_30px_rgba(30,58,138,0.4)] flex items-center justify-center transition-all hover:scale-110 hover:bg-blue-800 z-40 group border border-blue-700"
          title="Falar com Supervisora Geral"
        >
          <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:animate-ping"></div>
          <BrandLogoIcon className="w-8 h-8 relative z-10" />
        </button>
      )}
    </div>
  );
};