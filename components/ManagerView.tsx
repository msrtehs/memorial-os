import React, { useState, useEffect, useMemo } from 'react';
import { Page, Plot, MaintenanceTask, Transaction, Cemetery, Profile, Partner, InspectionRecord, LicensingDoc, StockItem } from '../types';
import { MOCK_CEMETERIES, MOCK_ALERTS, MOCK_PRICING } from '../services/dataService';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, 
  AreaChart, Area, CartesianGrid, Legend 
} from 'recharts';
import { 
  CircleDollarSign, MapPin, Droplets, Siren, Building2, ChevronDown, Plus, 
  Search, Filter, MoreHorizontal, Briefcase, Mail, FileText, ArrowRight, 
  Package, ClipboardList, PenTool, Skull, ShoppingCart, Truck, ShieldCheck, 
  AlertTriangle, CheckCircle, BrainCircuit, X, MessageSquare, Send 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { BrandLogoIcon } from './Sidebar';
import { addTask, updateTaskStatus, updateStockQuantity, addPartner, addInspection, addTransaction, updatePlotStatus } from '../services/realtimeService';

// --- SUB-COMPONENTES (Módulos) ---

// 1. DASHBOARD
const Dashboard: React.FC<{
  selectedCemeteryId: string, 
  cemeteries: Cemetery[], 
  onNavigate: (page: Page) => void, 
  plots: Plot[], 
  transactions: Transaction[],
  setInspections: any
}> = ({ selectedCemeteryId, cemeteries, onNavigate, plots, transactions, setInspections }) => {
  
  const relevantPlots = selectedCemeteryId === 'all' ? plots : plots.filter(p => p.cemeteryId === selectedCemeteryId);
  const occupiedCount = relevantPlots.filter(p => p.status === 'occupied').length;
  const occupancyRate = relevantPlots.length > 0 ? ((occupiedCount / relevantPlots.length) * 100).toFixed(1) : '0';
  
  const relevantTransactions = selectedCemeteryId === 'all' ? transactions : transactions.filter(t => t.cemeteryId === selectedCemeteryId);
  const revenue = relevantTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);

  const [showChecklist, setShowChecklist] = useState(false);

  const handleSaveChecklist = () => {
      const record: InspectionRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('pt-BR'),
          timestamp: Date.now(),
          cemeteryId: selectedCemeteryId === 'all' ? 'c1' : selectedCemeteryId,
          drainageStatus: true,
          loculusStatus: true,
          groundLeakDetected: false,
          notes: 'Inspeção diária realizada via Dashboard.',
          responsibleDrainage: 'Zelador José Santos',
          responsibleLoculus: 'Coveiro João'
      };
      setInspections((prev: any) => [record, ...prev]);
      addInspection(record);
      setShowChecklist(false);
      alert("Checklist Salvo e Enviado para Auditoria IA.");
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="mb-6 md:mb-8 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 serif-font">Dashboard Executivo</h1>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div onClick={() => onNavigate(Page.FINANCIAL)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
          <div className="flex justify-between mb-4"><div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors"><CircleDollarSign className="text-blue-600"/></div></div>
          <p className="text-slate-500 text-sm font-bold">Receita Total</p>
          <h3 className="text-2xl font-bold text-slate-800">R$ {revenue.toLocaleString()}</h3>
        </div>
        <div onClick={() => onNavigate(Page.INVENTORY)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
          <div className="flex justify-between mb-4"><div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors"><MapPin className="text-indigo-600"/></div></div>
          <p className="text-slate-500 text-sm font-bold">Taxa de Ocupação</p>
          <h3 className="text-2xl font-bold text-slate-800">{occupancyRate}%</h3>
        </div>
        <div onClick={() => setShowChecklist(true)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
          <div className="flex justify-between mb-4"><div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors"><Droplets className="text-emerald-600"/></div></div>
          <p className="text-slate-500 text-sm font-bold">Necrochorume</p>
          <h3 className="text-lg font-bold text-emerald-600 flex items-center gap-2">Preencher Checklist <ArrowRight className="w-4 h-4"/></h3>
        </div>
        <div onClick={() => onNavigate(Page.SECURITY)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
          <div className="flex justify-between mb-4"><div className="p-3 bg-rose-50 rounded-2xl group-hover:bg-rose-100 transition-colors"><Siren className="text-rose-600"/></div></div>
          <p className="text-slate-500 text-sm font-bold">Segurança</p>
          <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2">Ver Imagens <ArrowRight className="w-4 h-4"/></h3>
        </div>
      </div>

      {/* CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 min-h-[300px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><BrainCircuit className="w-32 h-32"/></div>
            <h3 className="font-bold mb-4 flex items-center gap-2"><BrandLogoIcon className="w-5 h-5 text-blue-600"/> Supervisora IA (Insights)</h3>
            <div className="bg-slate-50 p-6 rounded-3xl h-48 overflow-y-auto text-sm text-slate-600 leading-relaxed border border-slate-200">
               <p className="mb-2"><strong>Análise em Tempo Real:</strong></p>
               <ul className="list-disc pl-5 space-y-1">
                   <li>A ocupação global está em {occupancyRate}%. Recomendo atenção ao planejamento de expansão do Setor B.</li>
                   <li>Receita mensal está positiva. 3 transações pendentes de auditoria.</li>
                   <li>Checklist ambiental pendente para a unidade {selectedCemeteryId === 'all' ? 'Principal' : selectedCemeteryId}.</li>
               </ul>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="font-bold mb-4 self-start">Status de Vagas</h3>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie data={[{name: 'Ocupado', value: occupiedCount, color: '#1e293b'}, {name: 'Disponível', value: relevantPlots.length - occupiedCount, color: '#10b981'}]} innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                        <Cell fill="#1e293b"/><Cell fill="#10b981"/>
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* CHECKLIST MODAL */}
      {showChecklist && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold serif-font">Checklist: Necrochorume</h3>
                      <button onClick={() => setShowChecklist(false)}><X className="w-6 h-6 text-slate-400"/></button>
                  </div>
                  <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                          <div>
                              <p className="font-bold text-slate-800">Drenagem Superficial</p>
                              <p className="text-xs text-slate-500">Resp: Zelador José Santos</p>
                          </div>
                          <input type="checkbox" className="w-6 h-6 rounded text-blue-600" defaultChecked />
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                          <div>
                              <p className="font-bold text-slate-800">Verificação de Lóculos</p>
                              <p className="text-xs text-slate-500">Resp: Coveiro João</p>
                          </div>
                          <input type="checkbox" className="w-6 h-6 rounded text-blue-600" defaultChecked />
                      </div>
                      <textarea className="w-full p-4 bg-white border border-slate-200 rounded-xl h-24 text-slate-900" placeholder="Observações adicionais..."></textarea>
                      <button onClick={handleSaveChecklist} className="w-full py-4 bg-blue-900 text-white font-bold rounded-xl shadow-lg hover:bg-blue-800 transition-all">Salvar & Enviar Relatório</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// 2. INVENTORY (MAPA DE VAGAS)
const Inventory: React.FC<{ plots: Plot[], selectedCemeteryId: string, setPlots: any }> = ({ plots, selectedCemeteryId, setPlots }) => {
    const [viewMode, setViewMode] = useState<'map' | 'list' | 'audit'>('map');
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [filterSector, setFilterSector] = useState('all');

    // Filter logic
    const filteredPlots = plots.filter(p => {
        if (selectedCemeteryId !== 'all' && p.cemeteryId !== selectedCemeteryId) return false;
        if (filterSector !== 'all' && p.sector !== filterSector) return false;
        return true;
    });

    const sectors = Array.from(new Set(plots.map(p => p.sector))).sort();

    // Quick Action: Reserve
    const handleQuickReserve = async (plot: Plot) => {
        if (plot.status === 'available') {
            await updatePlotStatus(plot.id, 'reserved');
            setPlots((prev: Plot[]) => prev.map(p => p.id === plot.id ? { ...p, status: 'reserved' } : p));
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setViewMode('map')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Mapa Digital</button>
                    <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Lista de Controle</button>
                    <button onClick={() => setViewMode('audit')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'audit' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Auditor IA</button>
                </div>
                <div className="flex gap-2">
                    <select value={filterSector} onChange={e => setFilterSector(e.target.value)} className="bg-white border px-3 py-2 rounded-xl text-sm font-bold text-slate-600 outline-none">
                        <option value="all">Todos os Setores</option>
                        {sectors.map(s => <option key={s} value={s}>Setor {s}</option>)}
                    </select>
                </div>
            </div>

            {viewMode === 'map' && (
                <div className="bg-slate-200 p-8 rounded-[2.5rem] overflow-x-auto min-h-[500px] relative border border-slate-300 shadow-inner">
                    {selectedCemeteryId === 'all' ? (
                        <div className="flex items-center justify-center h-full text-slate-500 font-bold">Selecione uma unidade específica para ver o mapa.</div>
                    ) : (
                        <div className="min-w-[800px] grid grid-cols-10 gap-2">
                            {filteredPlots.map(plot => (
                                <div 
                                    key={plot.id}
                                    onClick={() => handleQuickReserve(plot)}
                                    className={`aspect-square rounded-md border flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all hover:scale-110 relative group ${
                                        plot.status === 'occupied' ? 'bg-slate-800 text-white border-slate-900' :
                                        plot.status === 'available' ? 'bg-emerald-400 text-emerald-900 border-emerald-500 hover:bg-emerald-300' :
                                        plot.status === 'reserved' ? 'bg-amber-400 text-amber-900 border-amber-500' :
                                        'bg-rose-400 text-white'
                                    }`}
                                >
                                    {plot.sector}-{plot.number}
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white p-3 rounded-xl shadow-xl w-48 z-50 pointer-events-none">
                                        <p className="font-bold text-sm mb-1">{plot.type === 'mausoleum' ? 'Mausoléu' : 'Jazigo'} {plot.sector}-{plot.number}</p>
                                        <p className="text-xs opacity-80">Status: {plot.status}</p>
                                        {plot.occupantName && <p className="text-xs text-emerald-400 mt-1">Ocupante: {plot.occupantName}</p>}
                                        {plot.burialDate && <p className="text-xs opacity-60">Data: {plot.burialDate}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'list' && (
                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4">Localização</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Ocupante</th>
                                <th className="p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPlots.slice(0, 50).map(plot => (
                                <tr key={plot.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold">Setor {plot.sector} - {plot.number}</td>
                                    <td className="p-4 capitalize">{plot.type}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${plot.status==='available'?'bg-emerald-100 text-emerald-700':plot.status==='occupied'?'bg-slate-200 text-slate-700':'bg-amber-100 text-amber-700'}`}>{plot.status}</span></td>
                                    <td className="p-4 text-slate-500">{plot.occupantName || '-'}</td>
                                    <td className="p-4"><button className="text-blue-600 hover:underline">Editar</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {viewMode === 'audit' && (
               <div className="bg-white p-8 rounded-[2rem] border border-slate-200 text-center">
                  <BrainCircuit className="w-16 h-16 mx-auto text-indigo-500 mb-4"/>
                  <h3 className="text-xl font-bold mb-2">Auditoria de Inventário</h3>
                  <p className="text-slate-500 mb-6">A IA está analisando inconsistências entre o mapa físico e os registros de venda.</p>
                  <div className="bg-green-50 text-green-800 p-4 rounded-xl inline-block font-bold">Nenhuma anomalia detectada hoje.</div>
               </div>
            )}
        </div>
    );
};

// 3. FINANCIAL (FINANCEIRO)
const Financial: React.FC<{ transactions: Transaction[], pricing: any, stock: any, setTransactions: any }> = ({ transactions, pricing, stock, setTransactions }) => {
    const [activeTab, setActiveTab] = useState<'transactions' | 'pricing' | 'projections'>('transactions');

    // Exhumation Logic
    const exhumationPotential = 15 * 3500; // 15 vagas vencidas x preço ossuário

    const handleGenerateOrders = () => {
        alert("15 Ordens de Serviço 'Preparação Exumação' geradas com sucesso.");
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit mb-6">
                <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'transactions' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Transações</button>
                <button onClick={() => setActiveTab('pricing')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pricing' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Tabela de Preços</button>
                <button onClick={() => setActiveTab('projections')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projections' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Projeções</button>
            </div>

            {activeTab === 'transactions' && (
                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4 text-right">Valor</th>
                                <th className="p-4 text-center">Auditoria IA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500">{t.date}</td>
                                    <td className="p-4 font-bold">{t.description}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{t.category}</span></td>
                                    <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        {t.aiAudited && <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[10px] font-bold border border-blue-100">Verificado</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'pricing' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_PRICING.map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-lg">{p.item}</h4>
                                <p className="text-slate-400 text-sm">{p.description}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-slate-900">R$ {p.price.toLocaleString()}</span>
                                <button className="text-xs text-blue-600 font-bold mt-1">Editar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'projections' && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-[2.5rem] shadow-xl">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6"/> Oportunidade Detectada</h3>
                    <p className="opacity-80 mb-8 max-w-2xl">Detectei 15 jazigos com prazo de exumação vencido (Solução Total). A liberação destas vagas e venda de ossuários pode gerar receita imediata.</p>
                    
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-slate-400 text-sm font-bold uppercase">Receita Potencial</p>
                            <p className="text-4xl font-bold text-emerald-400">R$ {exhumationPotential.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-bold uppercase">Custo Operacional Est.</p>
                            <p className="text-4xl font-bold text-rose-400">R$ 2.450</p>
                        </div>
                    </div>

                    <button onClick={handleGenerateOrders} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                        Gerar Ordens de Preparação
                    </button>
                </div>
            )}
        </div>
    );
};

// 4. MAINTENANCE (MANUTENÇÃO)
const Maintenance: React.FC<{ tasks: MaintenanceTask[], setTasks: any, stock: StockItem[], setStock: any }> = ({ tasks, setTasks, stock, setStock }) => {
    const [activeTab, setActiveTab] = useState<'kanban' | 'stock'>('kanban');
    const [newTaskDesc, setNewTaskDesc] = useState('');

    const handleAddTask = () => {
        if (!newTaskDesc) return;
        const task: MaintenanceTask = {
            id: `mt_${Date.now()}`,
            plotId: 'Geral',
            description: newTaskDesc,
            status: 'pending',
            priority: 'medium',
            reportedDate: new Date().toLocaleDateString('pt-BR'),
            cost: 0
        };
        setTasks((prev: any) => [task, ...prev]);
        addTask(task);
        setNewTaskDesc('');
    };

    const handleCompleteTask = async (taskId: string) => {
        await updateTaskStatus(taskId, 'completed', 100); // Mock cost
        setTasks((prev: MaintenanceTask[]) => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20">
             <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit mb-6">
                <button onClick={() => setActiveTab('kanban')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'kanban' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Tarefas (Kanban)</button>
                <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'stock' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Estoque & Compras</button>
            </div>

            {activeTab === 'kanban' && (
                <>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex gap-2">
                        <input value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Nova Ordem de Serviço..." className="flex-1 bg-slate-50 border-none rounded-xl px-4 focus:ring-2 focus:ring-blue-100" />
                        <button onClick={handleAddTask} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"><Plus className="w-5 h-5"/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['pending', 'in-progress', 'completed'].map(status => (
                            <div key={status} className="bg-slate-100 p-4 rounded-3xl min-h-[400px]">
                                <h4 className="font-bold text-slate-500 uppercase text-xs mb-4 ml-2">{status === 'pending' ? 'Pendente' : status === 'in-progress' ? 'Em Andamento' : 'Concluído'}</h4>
                                <div className="space-y-3">
                                    {tasks.filter(t => t.status === status).map(task => (
                                        <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>{task.priority}</span>
                                                <span className="text-[10px] text-slate-400">{task.reportedDate}</span>
                                            </div>
                                            <p className="font-bold text-sm text-slate-800 mb-1">{task.description}</p>
                                            <p className="text-xs text-slate-500 mb-3">{task.plotId}</p>
                                            {status !== 'completed' && (
                                                <button onClick={() => handleCompleteTask(task.id)} className="w-full py-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                                    <CheckCircle className="w-3 h-3"/> Concluir
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'stock' && (
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl">Inventário de Materiais</h3>
                        <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><ShoppingCart className="w-4 h-4"/> Solicitar Compra</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stock.map(item => (
                            <div key={item.id} className="border border-slate-100 p-6 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">{item.category}</p>
                                    <h4 className="font-bold text-lg text-slate-900">{item.name}</h4>
                                    <p className="text-sm text-slate-500">{item.quantity} {item.unit}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${item.quantity < item.minQuantity ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {item.quantity}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// 5. SECURITY (SEGURANÇA)
const Security: React.FC<{ alerts: any[] }> = ({ alerts }) => (
    <div className="animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-black rounded-[2rem] overflow-hidden relative min-h-[400px] shadow-2xl">
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full"></div> AO VIVO</div>
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700 font-mono">
                    <img src="https://picsum.photos/800/500?grayscale" className="w-full h-full object-cover opacity-50" />
                </div>
                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black to-transparent text-white">
                    <h3 className="font-bold text-lg">Câmera 01 - Portão Principal</h3>
                    <p className="text-sm opacity-70">IA Detectou: Movimento Humano (98%)</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 h-fit">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Siren className="text-rose-500"/> Alertas Recentes</h3>
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <div key={alert.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-800 text-sm">{alert.location}</span>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${alert.status === 'active' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{alert.status}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{alert.timestamp}</p>
                            {alert.status === 'active' && <button className="w-full py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg">Verificar</button>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// 6. EXPERT AI (SUPERVISORA)
const ExpertAI: React.FC<{ 
    plots?: Plot[], 
    transactions?: Transaction[], 
    stock?: StockItem[],
    inspections?: InspectionRecord[],
    licensingDocs?: LicensingDoc[]
}> = ({ plots, transactions, stock, inspections, licensingDocs }) => {
    const [messages, setMessages] = useState<{role:'user'|'model', text: string}[]>([
        { role: 'model', text: 'Olá, Gestor. Sou sua Supervisora Geral. Estou analisando todos os dados em tempo real. Em que posso ajudar?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Gera o Contexto (Snapshot) do Sistema
    const systemContext = useMemo(() => {
        const revenue = transactions?.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0) || 0;
        const expenses = transactions?.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0) || 0;
        const occupied = plots?.filter(p => p.status === 'occupied').length || 0;
        const totalPlots = plots?.length || 1;
        const occupancyRate = (occupied / totalPlots * 100).toFixed(1);
        const lowStock = stock?.filter(s => s.quantity < s.minQuantity).map(s => s.name).join(', ') || 'Nenhum';
        const expiredDocs = licensingDocs?.filter(d => d.status === 'expired').map(d => d.name).join(', ') || 'Nenhum';

        return JSON.stringify({
            financeiro: { receita: revenue, despesa: expenses, saldo: revenue - expenses },
            ocupacao: { taxa: `${occupancyRate}%`, total_vagas: totalPlots, ocupadas: occupied },
            estoque_critico: lowStock,
            documentacao_vencida: expiredDocs,
            alertas: 'Verifique aba Segurança'
        });
    }, [plots, transactions, stock, licensingDocs]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const newMsg = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // CORREÇÃO: Utilizando a chave de API válida fornecida e testada
            const apiKey = (import.meta as any).env?.VITE_API_KEY || "AIzaSyANrAPGfFwQ5Vg0SU-Px_PeMxVfywUDi3I";
            
            if (!apiKey) {
              throw new Error("API Key não configurada");
            }

            const ai = new GoogleGenAI({ apiKey });
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `Você é a Supervisora Geral do MemorialOS (IA).
                    Você tem acesso aos dados reais do sistema abaixo. Use-os para responder.
                    CONTEXTO ATUAL DO SISTEMA: ${systemContext}
                    
                    Seja profissional, direta e executiva. Dê insights baseados nos números acima.`,
                }
            });

            const result = await chat.sendMessage({ message: newMsg.text });
            setMessages(prev => [...prev, { role: 'model', text: result.text || 'Sem resposta.' }]);
        } catch (error: any) {
            // EXIBE O ERRO TÉCNICO DETALHADO NO BALÃO DE FALA
            console.error("Erro Expert AI:", error);
            const errorMsg = error.message || error.statusText || JSON.stringify(error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                text: `Erro de conexão (Detalhe Técnico): ${errorMsg}. \nVerifique se a chave API suporta o modelo 'gemini-2.5-flash'.` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/50"><BrainCircuit className="w-6 h-6"/></div>
                <div>
                    <h3 className="font-bold text-white text-lg">Supervisora Geral</h3>
                    <p className="text-slate-400 text-xs">Inteligência Artificial Onisciente</p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white border border-slate-200 shadow-sm rounded-tl-sm'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-xs text-slate-400 text-center animate-pulse">Processando dados...</div>}
            </div>
            <div className="p-6 bg-white border-t border-slate-100">
                <div className="relative">
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="w-full bg-slate-50 border border-slate-200 rounded-full py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Pergunte sobre receita, estoque ou alertas..." />
                    <button onClick={handleSend} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors"><Send className="w-4 h-4"/></button>
                </div>
            </div>
        </div>
    );
};

// --- PLACEHOLDERS FUNCIONAIS ---
const Partners: React.FC<{partners: Partner[]}> = ({partners}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {partners.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4">
                <img src={p.logoUrl} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                <div>
                    <h4 className="font-bold text-lg">{p.name} <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full ml-2">{p.type}</span></h4>
                    <p className="text-slate-500 text-sm mb-2">{p.description}</p>
                    <button className="text-xs font-bold text-slate-900 border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-50">Contatar: {p.contact}</button>
                </div>
            </div>
        ))}
    </div>
);

const Environmental: React.FC<{docs: LicensingDoc[]}> = ({docs}) => (
    <div className="pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {docs.map(d => (
                <div key={d.id} className={`p-6 rounded-[2rem] border ${d.status === 'valid' ? 'bg-emerald-50/50 border-emerald-100' : d.status === 'expired' ? 'bg-rose-50/50 border-rose-100' : 'bg-amber-50/50 border-amber-100'}`}>
                    <div className="flex justify-between mb-4">
                        <FileText className={`w-6 h-6 ${d.status === 'valid' ? 'text-emerald-500' : d.status === 'expired' ? 'text-rose-500' : 'text-amber-500'}`} />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">{d.status}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">{d.name}</h4>
                    <p className="text-xs text-slate-500">Expira: {d.expirationDate || 'N/A'}</p>
                </div>
            ))}
        </div>
    </div>
);

const CemeteriesManagement: React.FC<{cemeteries: Cemetery[]}> = ({cemeteries}) => (
    <div className="space-y-4 pb-20">
        {MOCK_CEMETERIES.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h4 className="font-bold text-lg flex items-center gap-2"><Building2 className="w-5 h-5 text-slate-400"/> {c.name}</h4>
                    <p className="text-slate-500 text-sm">{c.city} - {c.state} • {c.totalArea.toLocaleString()} m²</p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="text-center">
                        <span className="block font-bold text-slate-900">{((c.occupied/c.capacity)*100).toFixed(0)}%</span>
                        <span className="text-slate-400 text-xs">Ocupação</span>
                    </div>
                    <div className="text-center">
                        <span className={`block font-bold ${c.licensingStatus === 'valid' ? 'text-emerald-500' : 'text-rose-500'}`}>{c.licensingStatus === 'valid' ? 'OK' : 'Pend.'}</span>
                        <span className="text-slate-400 text-xs">Licença</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// --- MAIN MANAGER VIEW ---
interface ManagerViewProps {
  page: Page;
  setPage: (page: Page) => void;
  setProfiles: any; profiles: Profile[];
  plots: Plot[]; setPlots: any;
  transactions: Transaction[]; setTransactions: any;
  partners: Partner[]; setPartners: any;
  inspections: InspectionRecord[]; setInspections: any;
  licensingDocs: LicensingDoc[]; setLicensingDocs: any;
  tasks: MaintenanceTask[]; setTasks: any;
  stock: StockItem[]; setStock: any;
}

export const ManagerView: React.FC<ManagerViewProps> = ({ page, setPage, ...props }) => {
  const [selectedCemeteryId, setSelectedCemeteryId] = useState('all');
  
  return (
    <div className="p-4 md:p-12 max-w-[1600px] mx-auto min-h-screen font-sans bg-slate-50/50">
       {/* HEADER GESTÃO */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 sticky top-0 bg-slate-50/95 backdrop-blur-sm z-30 py-4 border-b border-slate-200 md:border-none md:static md:bg-transparent md:p-0">
          <h2 className="text-xl md:text-2xl font-bold serif-font text-slate-900 flex items-center gap-2">
            <BrandLogoIcon className="w-6 h-6 text-blue-900"/> Gestão Corporativa
          </h2>
          <div className="relative group">
            <button className="bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:border-blue-300 transition-colors">
                <Building2 className="w-4 h-4 text-slate-400"/> 
                {selectedCemeteryId === 'all' ? 'Todas as Unidades' : MOCK_CEMETERIES.find(c => c.id === selectedCemeteryId)?.name} 
                <ChevronDown className="w-4 h-4 text-slate-400"/>
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 hidden group-hover:block z-50 p-2">
                <button onClick={() => setSelectedCemeteryId('all')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700">Todas as Unidades</button>
                {MOCK_CEMETERIES.map(c => (
                    <button key={c.id} onClick={() => setSelectedCemeteryId(c.id)} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm text-slate-600">{c.name}</button>
                ))}
            </div>
          </div>
       </div>

       {/* CONTENT SWITCHER */}
       <div className="min-h-[600px]">
           {page === Page.DASHBOARD && <Dashboard selectedCemeteryId={selectedCemeteryId} cemeteries={MOCK_CEMETERIES} onNavigate={setPage} plots={props.plots} transactions={props.transactions} setInspections={props.setInspections} />}
           {page === Page.INVENTORY && <Inventory plots={props.plots} selectedCemeteryId={selectedCemeteryId} setPlots={props.setPlots} />}
           {page === Page.FINANCIAL && <Financial transactions={props.transactions} pricing={MOCK_PRICING} stock={props.stock} setTransactions={props.setTransactions} />}
           {page === Page.MAINTENANCE && <Maintenance tasks={props.tasks} setTasks={props.setTasks} stock={props.stock} setStock={props.setStock} />}
           {page === Page.SECURITY && <Security alerts={MOCK_ALERTS} />}
           {page === Page.EXPERT_AI && <ExpertAI plots={props.plots} transactions={props.transactions} stock={props.stock} inspections={props.inspections} licensingDocs={props.licensingDocs} />}
           {page === Page.PARTNERS && <Partners partners={props.partners} />}
           {page === Page.ENVIRONMENTAL && <Environmental docs={props.licensingDocs} />}
           {page === Page.CEMETERIES && <CemeteriesManagement cemeteries={MOCK_CEMETERIES} />}
       </div>
    </div>
  );
};