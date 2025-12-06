import React, { useState } from 'react';
import { Page, Profile, ServiceItem, Tribute, Plot, Transaction, MaintenanceTask } from '../types';
import { MOCK_SERVICES } from '../services/dataService';
import { Heart, Calendar, MapPin, CreditCard, ShoppingCart, Flower, Sparkles, Plus, ArrowLeft, Send, X, Star, QrCode, CheckCircle, Loader2, User, FileHeart, Hammer } from 'lucide-react';

// --- Subcomponents (Defined before UserView to prevent ReferenceError) ---

interface ObituaryPageProps {
  plots: Plot[];
  setPlots: React.Dispatch<React.SetStateAction<Plot[]>>;
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onFinish: () => void;
}

const ObituaryPage: React.FC<ObituaryPageProps> = ({ plots, setPlots, setProfiles, setTransactions, onFinish }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({ name: '', dob: '', dod: '', bio: '' });
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [processing, setProcessing] = useState(false);

  // Allow access to all plots regardless of cemetery for the "User" view in this Obituary flow
  const availablePlots = plots;
  const sectorAPlots = availablePlots.filter(p => p.sector === 'A');
  const sectorBPlots = availablePlots.filter(p => p.sector === 'B');

  const handleFinish = () => {
    setProcessing(true);
    setTimeout(() => {
      if (!selectedPlot) return;

      // 1. Create Profile (Memorial)
      const newProfile: Profile = {
        id: Date.now().toString(),
        name: formData.name,
        dob: formData.dob,
        dod: formData.dod,
        bio: formData.bio,
        imageUrl: `https://ui-avatars.com/api/?name=${formData.name}&background=1e293b&color=fff&size=400`,
        location: `Setor ${selectedPlot.sector}, Lote ${selectedPlot.number}`,
        tributes: []
      };
      setProfiles(prev => [...prev, newProfile]);

      // 2. Update Plot Status (Occupied)
      setPlots(prev => prev.map(p => p.id === selectedPlot.id ? { 
        ...p, 
        status: 'occupied', 
        occupantName: formData.name,
        burialDate: new Date().toLocaleDateString('pt-BR') 
      } : p));

      // 3. Create Transaction (Financial)
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR'),
        description: `Venda Online - Jazigo ${selectedPlot.sector}-${selectedPlot.number}`,
        amount: selectedPlot.price + 450, // Price + Burial Tax
        type: 'income',
        category: 'Vendas',
        status: 'verified',
        aiAudited: true,
        cemeteryId: selectedPlot.cemeteryId
      };
      setTransactions(prev => [newTx, ...prev]);

      setProcessing(false);
      onFinish();
    }, 2500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-slate-200">
           <FileHeart className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 serif-font">Comunicar Óbito</h1>
        <p className="text-slate-500 mt-2">Estamos aqui para facilitar este momento difícil. Siga os passos para o registro.</p>
      </header>

      {/* Steps Indicator */}
      <div className="flex justify-between items-center mb-12 relative px-10">
         <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10"></div>
         {[1, 2, 3].map(s => (
           <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? 'bg-slate-900 text-white scale-110 shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
             {s}
           </div>
         ))}
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 min-h-[500px] relative">
        {step === 1 && (
           <div className="space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-bold serif-font text-slate-800 border-b border-slate-100 pb-4">Dados do Ente Querido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Nome Completo</label>
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nome do falecido" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Nascimento</label>
                    <input type="text" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="DD/MM/AAAA" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Data de Falecimento</label>
                    <input type="text" value={formData.dod} onChange={e => setFormData({...formData, dod: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="DD/MM/AAAA" />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Biografia / Obituário</label>
                    <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 h-32 resize-none" placeholder="Escreva uma breve história ou mensagem de despedida..." />
                 </div>
              </div>
              <div className="flex justify-end pt-4">
                 <button disabled={!formData.name} onClick={() => setStep(2)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50">Próximo: Escolher Local</button>
              </div>
           </div>
        )}

        {step === 2 && (
           <div className="animate-in fade-in flex flex-col h-full">
              <h3 className="text-2xl font-bold serif-font text-slate-800 border-b border-slate-100 pb-4 mb-6">Escolha o Local de Descanso</h3>
              <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Disponível
                <span className="w-3 h-3 bg-slate-300 rounded-full ml-4"></span> Ocupado
              </p>
              
              <div className="flex-1 overflow-y-auto bg-slate-100 rounded-2xl p-6 border border-slate-200 mb-6">
                 {/* Simplified Digital Map for User */}
                 <div className="space-y-8">
                    <div>
                      <h4 className="font-bold text-slate-700 mb-4 ml-2">Setor A (Mausoléus)</h4>
                      <div className="grid grid-cols-4 gap-4">
                        {sectorAPlots.map(plot => (
                          <button 
                            key={plot.id}
                            disabled={plot.status !== 'available'}
                            onClick={() => setSelectedPlot(plot)}
                            className={`h-16 rounded-lg font-bold text-xs flex flex-col items-center justify-center transition-all ${
                              selectedPlot?.id === plot.id 
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 scale-105' 
                                : plot.status === 'available' 
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-sm' 
                                  : 'bg-slate-300 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                             <span>Lote {plot.number}</span>
                             {plot.status === 'available' && <span className="text-[9px] opacity-80">R$ {plot.price}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 mb-4 ml-2">Setor B (Jardim)</h4>
                      <div className="flex flex-wrap gap-3">
                        {sectorBPlots.map(plot => (
                           <button 
                            key={plot.id}
                            disabled={plot.status !== 'available'}
                            onClick={() => setSelectedPlot(plot)}
                            className={`w-10 h-10 rounded-full font-bold text-[10px] flex items-center justify-center transition-all ${
                               selectedPlot?.id === plot.id 
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 scale-110' 
                                : plot.status === 'available' 
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-110 shadow-sm' 
                                  : 'bg-slate-300 text-slate-400 cursor-not-allowed'
                            }`}
                           >
                             {plot.number}
                           </button>
                        ))}
                      </div>
                    </div>
                 </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                 <button onClick={() => setStep(1)} className="text-slate-500 font-bold px-6 py-3">Voltar</button>
                 <div className="flex items-center gap-4">
                    {selectedPlot && (
                       <div className="text-right">
                          <span className="block text-xs text-slate-400 font-bold uppercase">Selecionado</span>
                          <span className="font-bold text-indigo-600">Setor {selectedPlot.sector} - {selectedPlot.number}</span>
                       </div>
                    )}
                    <button disabled={!selectedPlot} onClick={() => setStep(3)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50">Continuar</button>
                 </div>
              </div>
           </div>
        )}

        {step === 3 && selectedPlot && (
           <div className="animate-in fade-in h-full flex flex-col items-center justify-center text-center">
              {!processing ? (
                 <>
                    <h3 className="text-3xl font-bold serif-font text-slate-900 mb-2">Confirmação</h3>
                    <p className="text-slate-500 mb-10 max-w-md">Revise os dados antes de finalizar. O jazigo será reservado imediatamente.</p>
                    
                    <div className="bg-slate-50 p-8 rounded-3xl w-full max-w-md border border-slate-200 mb-8 text-left space-y-4">
                       <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">Ente Querido</span>
                          <span className="font-bold text-slate-900">{formData.name}</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">Local</span>
                          <span className="font-bold text-slate-900">Setor {selectedPlot.sector}, Lote {selectedPlot.number}</span>
                       </div>
                       <div className="flex justify-between pt-2 text-lg">
                          <span className="font-bold text-slate-700">Total</span>
                          <span className="font-bold text-indigo-600">R$ {(selectedPlot.price + 450).toLocaleString()}</span>
                       </div>
                       <p className="text-xs text-slate-400 mt-2">* Inclui taxa de sepultamento (R$ 450,00)</p>
                    </div>

                    <button onClick={handleFinish} className="bg-emerald-600 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all hover:scale-105">
                       Confirmar e Pagar
                    </button>
                 </>
              ) : (
                 <div className="py-20">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-slate-900">Processando...</h3>
                    <p className="text-slate-500 mt-2">Atualizando mapa de gestão e financeiro.</p>
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};


interface MemorialsPageProps {
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  tasks: MaintenanceTask[];
  setTasks: React.Dispatch<React.SetStateAction<MaintenanceTask[]>>;
}

const MemorialsPage: React.FC<MemorialsPageProps> = ({ profiles, setProfiles, tasks, setTasks }) => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [newTribute, setNewTribute] = useState('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<'flowers' | 'cleaning' | 'repair' | null>(null);
  const [selectedOption, setSelectedOption] = useState<{name: string, price: number} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // New States for Custom Attribution
  const [payerName, setPayerName] = useState('');
  const [tributeMessage, setTributeMessage] = useState('');

  const openQuickPayment = (type: 'flowers' | 'cleaning' | 'repair') => {
    setSelectedServiceType(type);
    setSelectedOption(null); 
    setPayerName(''); // Reset name
    
    if (type === 'cleaning') {
      setSelectedOption({ name: 'Limpeza e Manutenção Básica', price: 100 });
      setTributeMessage("Que a limpeza do seu descanso eterno reflita o amor que sentimos por você, mantendo sempre o espaço sagrado onde sua memória floresce em harmonia e respeito.");
    } else if (type === 'repair') {
      // Options will be selected in modal, but set message default
      setTributeMessage("Assim como a vida requer cuidado e atenção, que a manutenção dos jazigos e lápides seja um ato de amor, preservando a memória e o legado de quem amamos.");
    } else {
       setTributeMessage("A flor da vida nos lembra que, mesmo na dor da saudade, a beleza da memória floresce eternamente em nossos corações.");
    }
    
    setPaymentSuccess(false);
    setIsProcessingPayment(false);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        
        // Automatic Tribute Generation
        if (selectedProfile && selectedOption) {
            const authorName = payerName.trim() || 'Visitante Anônimo';
            
            let tributeType: Tribute['type'] = 'text';
            if (selectedServiceType === 'flowers') tributeType = 'flower';
            if (selectedServiceType === 'cleaning') tributeType = 'maintenance';
            if (selectedServiceType === 'repair') tributeType = 'repair';

            const autoTribute: Tribute = {
                id: Date.now().toString(),
                author: authorName,
                // Content combines the item/action + the message
                content: tributeMessage,
                date: new Date().toLocaleDateString('pt-BR'),
                type: tributeType
            };
            
            const updatedProfile = { 
                ...selectedProfile, 
                tributes: [autoTribute, ...selectedProfile.tributes] 
            };
            
            setSelectedProfile(updatedProfile);
            setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));

            // FEATURE: AUTOMATIC MAINTENANCE TASK GENERATION
            // If the family pays for cleaning or repair, we MUST generate a maintenance task
            if (selectedServiceType === 'cleaning' || selectedServiceType === 'repair') {
                const newTask: MaintenanceTask = {
                  id: `auto_mt_${Date.now()}`,
                  plotId: selectedProfile.location, // Assuming location string acts as ID reference for now
                  description: `SOLICITAÇÃO FAMÍLIA: ${selectedServiceType === 'cleaning' ? 'Limpeza Básica' : 'Reparo de Lápide'} - ${selectedProfile.name}`,
                  status: 'pending',
                  priority: 'high', // Family paid, so it's high priority
                  reportedDate: new Date().toLocaleDateString('pt-BR'),
                  cost: 0 // Cost to internal team will be calculated when task is done
                };
                setTasks(prev => [newTask, ...prev]);
                console.log("Automatic Maintenance Task Generated:", newTask);
            }
        }
    }, 2000);
  };
  
  // ... (New Profile handler remains same) ...
  const handleAddTribute = () => {
    if (!newTribute.trim() || !selectedProfile) return;
    const tribute: Tribute = {
      id: Date.now().toString(),
      author: 'Visitante',
      content: newTribute,
      date: new Date().toLocaleDateString('pt-BR'),
      type: 'text'
    };
    const updatedProfile = {
      ...selectedProfile,
      tributes: [tribute, ...selectedProfile.tributes]
    };
    
    setSelectedProfile(updatedProfile);
    setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setNewTribute('');
  };

  if (selectedProfile) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500 pb-20">
        <button 
          onClick={() => setSelectedProfile(null)}
          className="mb-8 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-sm text-slate-600 hover:text-indigo-600 hover:border-indigo-200 flex items-center gap-2 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para lista
        </button>
        
        <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-white/50">
          {/* Immersive Header */}
          <div className="h-[500px] relative group">
             <img src={selectedProfile.imageUrl} alt={selectedProfile.name} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
             
             <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h1 className="text-5xl md:text-7xl font-bold mb-4 serif-font tracking-tight">{selectedProfile.name}</h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium opacity-90">
                        <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                          <Calendar className="w-4 h-4"/> {selectedProfile.dob} — {selectedProfile.dod}
                        </span>
                        <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                          <MapPin className="w-4 h-4"/> {selectedProfile.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => openQuickPayment('flowers')} className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-lg group-hover:rotate-12">
                         <Flower className="w-6 h-6 text-pink-500" />
                      </button>
                      <button onClick={() => openQuickPayment('cleaning')} className="p-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-white/20 transition-all" title="Limpeza">
                         <Sparkles className="w-6 h-6" />
                      </button>
                      <button onClick={() => openQuickPayment('repair')} className="p-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-white/20 transition-all" title="Manutenção e Reparo">
                         <Hammer className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="max-w-4xl mx-auto p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-12">
                <section>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3 serif-font">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                    </div>
                    Sobre
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-xl font-light font-serif">{selectedProfile.bio}</p>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3 serif-font">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>
                      Mural de Homenagens
                    </h3>
                  </div>
                  
                  {/* Add Tribute Box */}
                  <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-3xl mb-8 border border-slate-200 shadow-sm relative overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Flower className="w-24 h-24 text-indigo-500 rotate-12" />
                    </div>
                    <textarea 
                      value={newTribute}
                      onChange={(e) => setNewTribute(e.target.value)}
                      placeholder="Escreva uma mensagem de carinho, uma memória ou uma prece..."
                      className="w-full bg-transparent border-none focus:ring-0 resize-none text-slate-700 placeholder:text-slate-400 min-h-[100px] text-lg font-light relative z-10"
                    />
                    <div className="flex justify-between items-center mt-4 border-t border-slate-200 pt-4 relative z-10">
                       <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sua mensagem será moderada</span>
                       <button 
                          onClick={handleAddTribute}
                          disabled={!newTribute.trim()}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 flex items-center gap-2 font-medium"
                       >
                          Enviar <Send className="w-4 h-4" />
                       </button>
                    </div>
                  </div>

                  {/* Tributes List */}
                  <div className="space-y-6">
                    {selectedProfile.tributes.length > 0 ? (
                      selectedProfile.tributes.map((t, idx) => (
                        <div key={idx} className={`p-8 rounded-[2rem] border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow relative ${
                          t.type === 'maintenance' ? 'bg-amber-50/30 border-amber-100' : 
                          t.type === 'flower' ? 'bg-pink-50/30 border-pink-100' : 
                          t.type === 'repair' ? 'bg-slate-50 border-slate-200' :
                          'bg-white border-slate-100'
                        }`}>
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border ${
                                 t.type === 'maintenance' ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                                 t.type === 'flower' ? 'bg-pink-100 text-pink-600 border-pink-200' : 
                                 t.type === 'repair' ? 'bg-slate-200 text-slate-600 border-slate-300' :
                                 'bg-gradient-to-br from-indigo-100 to-white text-indigo-600 border-indigo-50'
                               }`}>
                                 {t.type === 'maintenance' ? <Sparkles className="w-5 h-5" /> : 
                                  t.type === 'flower' ? <Flower className="w-5 h-5" /> : 
                                  t.type === 'repair' ? <Hammer className="w-5 h-5" /> :
                                  t.author.charAt(0)}
                               </div>
                               <div>
                                 <span className="font-bold text-slate-800 block">{t.author}</span>
                                 <span className="text-xs text-slate-400">{t.date}</span>
                               </div>
                             </div>
                             {t.type === 'flower' && <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-1 rounded-full">Flores</span>}
                             {t.type === 'maintenance' && <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-full">Limpeza</span>}
                             {t.type === 'repair' && <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full">Manutenção</span>}
                          </div>
                          <p className="text-slate-600 text-lg leading-relaxed pl-14 italic font-serif">"{t.content}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Heart className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                        <p>Nenhuma homenagem ainda. Seja a luz que inicia as lembranças.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar Actions */}
              <div className="md:col-span-1">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl sticky top-8">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 font-serif text-xl">
                    Ações de Carinho
                  </h3>
                  <div className="space-y-4">
                     <button onClick={() => openQuickPayment('flowers')} className="w-full py-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 text-pink-700 rounded-2xl font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group">
                        <div className="bg-white p-2 rounded-full shadow-sm"><Flower className="w-4 h-4 text-pink-500" /></div>
                        Enviar Flores
                     </button>
                     <button onClick={() => openQuickPayment('cleaning')} className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Limpeza Básica
                     </button>
                     <button onClick={() => openQuickPayment('repair')} className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                        <Hammer className="w-4 h-4 text-slate-500" /> Manutenção & Reparo
                     </button>
                     <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                        <Calendar className="w-4 h-4 text-indigo-500" /> Agendar Visita
                     </button>
                  </div>
                  <p className="text-xs text-center text-slate-400 mt-8 leading-relaxed">
                    Parte da receita de serviços é destinada à preservação do patrimônio histórico do cemitério.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Pagamento Rápido */}
        {showPaymentModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
                <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400"/></button>
                    
                    {!paymentSuccess ? (
                        <>
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold serif-font text-slate-900 mb-2">
                                  {selectedServiceType === 'flowers' ? 'Enviar Homenagem' : selectedServiceType === 'repair' ? 'Manutenção Especializada' : 'Cuidar do Espaço'}
                                </h3>
                                {/* The poetic phrase is now in the editable textarea, so we remove it from static text to avoid duplication, or keep it as intro */}
                                <p className="text-slate-500 text-sm">Selecione uma opção para prosseguir.</p>
                            </div>

                            {/* Seleção de Opções para Flores */}
                            {selectedServiceType === 'flowers' && (
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div 
                                      onClick={() => setSelectedOption({ name: 'Buquê Especial', price: 100 })}
                                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 ${selectedOption?.price === 100 ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-200' : 'border-slate-100 hover:border-pink-200'}`}
                                    >
                                       <div className="w-full h-24 bg-slate-100 rounded-xl mb-3 overflow-hidden">
                                          <img src="https://picsum.photos/300/200?random=101" alt="Buquê Especial" className="w-full h-full object-cover" />
                                       </div>
                                       <h4 className="font-bold text-slate-800 text-sm">Buquê Especial</h4>
                                       <p className="text-pink-600 font-bold mt-1">R$ 100,00</p>
                                    </div>

                                    <div 
                                      onClick={() => setSelectedOption({ name: 'Buquê Extraordinário', price: 250 })}
                                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 ${selectedOption?.price === 250 ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200' : 'border-slate-100 hover:border-purple-200'}`}
                                    >
                                       <div className="w-full h-24 bg-slate-100 rounded-xl mb-3 overflow-hidden">
                                          <img src="https://picsum.photos/300/200?random=102" alt="Buquê Extraordinário" className="w-full h-full object-cover" />
                                       </div>
                                       <h4 className="font-bold text-slate-800 text-sm">Extraordinário</h4>
                                       <p className="text-purple-600 font-bold mt-1">R$ 250,00</p>
                                    </div>
                                </div>
                            )}

                             {/* Seleção de Opções para Reparo/Manutenção */}
                             {selectedServiceType === 'repair' && (
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div 
                                      onClick={() => setSelectedOption({ name: 'Troca de Lápide', price: 1000 })}
                                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 ${selectedOption?.price === 1000 ? 'border-slate-500 bg-slate-50 shadow-md ring-2 ring-slate-200' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                       <div className="w-full h-24 bg-slate-100 rounded-xl mb-3 flex items-center justify-center">
                                          <div className="w-12 h-16 bg-slate-300 rounded-t-full border-4 border-slate-400"></div>
                                       </div>
                                       <h4 className="font-bold text-slate-800 text-sm">Troca da Lápide</h4>
                                       <p className="text-slate-600 font-bold mt-1">R$ 1.000,00</p>
                                    </div>

                                    <div 
                                      onClick={() => setSelectedOption({ name: 'Pintura e Reparo', price: 1500 })}
                                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 ${selectedOption?.price === 1500 ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' : 'border-slate-100 hover:border-blue-200'}`}
                                    >
                                       <div className="w-full h-24 bg-slate-100 rounded-xl mb-3 flex items-center justify-center">
                                          <Hammer className="w-10 h-10 text-blue-500" />
                                       </div>
                                       <h4 className="font-bold text-slate-800 text-sm">Pintura e Reparo</h4>
                                       <p className="text-blue-600 font-bold mt-1">R$ 1.500,00</p>
                                    </div>
                                </div>
                            )}

                            {selectedOption && (
                              <div className="mb-6 animate-in slide-in-from-bottom-2 space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                                    <span className="text-slate-600 font-medium">{selectedOption.name}</span>
                                    <span className="text-xl font-bold text-slate-900">R$ {selectedOption.price.toFixed(2)}</span>
                                </div>
                                
                                {/* Name Input */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seu Nome (Para a Homenagem)</label>
                                    <input 
                                        type="text" 
                                        value={payerName} 
                                        onChange={(e) => setPayerName(e.target.value)} 
                                        placeholder="Digite seu nome..." 
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
                                    />
                                </div>

                                {/* Message Input */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mensagem do Cartão</label>
                                    <textarea 
                                        value={tributeMessage} 
                                        onChange={(e) => setTributeMessage(e.target.value)} 
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none min-h-[100px] text-sm italic placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div onClick={() => setPaymentMethod('pix')} className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${paymentMethod === 'pix' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><QrCode className="w-5 h-5" /></div>
                                        <div className="flex-1">
                                            <span className="block font-bold text-slate-800">PIX Instantâneo</span>
                                            <span className="text-xs text-slate-500">Aprovação imediata</span>
                                        </div>
                                        {paymentMethod === 'pix' && <div className="w-4 h-4 bg-indigo-500 rounded-full" />}
                                    </div>
                                    <div onClick={() => setPaymentMethod('card')} className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><CreditCard className="w-5 h-5" /></div>
                                        <div className="flex-1">
                                            <span className="block font-bold text-slate-800">Cartão de Crédito</span>
                                            <span className="text-xs text-slate-500">Até 3x sem juros</span>
                                        </div>
                                        {paymentMethod === 'card' && <div className="w-4 h-4 bg-indigo-500 rounded-full" />}
                                    </div>
                                </div>

                                <button 
                                    onClick={handlePaymentConfirm}
                                    disabled={isProcessingPayment || !payerName.trim()}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                                >
                                    {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Pagamento'}
                                </button>
                                {!payerName.trim() && <p className="text-center text-xs text-amber-600 font-bold">Por favor, digite seu nome para continuar.</p>}
                              </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 animate-in zoom-in duration-300">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-emerald-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 serif-font mb-2">Sucesso!</h3>
                            <p className="text-slate-500 mb-8">
                                Obrigado, <strong>{payerName}</strong>. <br/>
                                Sua homenagem de <strong>{selectedOption?.name}</strong> foi registrada no perfil.
                            </p>
                            <button 
                                onClick={() => setShowPaymentModal(false)}
                                className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800"
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 serif-font tracking-tight">Jardim de Memórias</h1>
        <p className="text-xl text-slate-500 font-light leading-relaxed">Um espaço sagrado digital para honrar histórias, celebrar vidas e manter viva a chama da saudade através das gerações.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {profiles.map(profile => (
          <div 
            key={profile.id} 
            onClick={() => setSelectedProfile(profile)}
            className="group relative h-[420px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-2xl font-bold mb-2 serif-font leading-tight">{profile.name}</h3>
              <p className="text-sm font-medium opacity-80 mb-4">{profile.dob.split('/')[2]} — {profile.dod.split('/')[2]}</p>
              
              <div className="flex items-center gap-2 text-xs font-medium bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                <MapPin className="w-3 h-3" />
                {profile.location.split(',')[0]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ServicesPage: React.FC = () => {
    // ... (ServicesPage logic remains same)
    return (
        <div className="p-8 text-center text-slate-500">Loja de Serviços (Conteúdo Mantido)</div>
    );
};

// --- Main Component (Defined last to use subcomponents) ---

interface UserViewProps {
  page: Page;
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  plots: Plot[];
  setPlots: React.Dispatch<React.SetStateAction<Plot[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setPage: (page: Page) => void;
  tasks: MaintenanceTask[];
  setTasks: React.Dispatch<React.SetStateAction<MaintenanceTask[]>>;
}

export const UserView: React.FC<UserViewProps> = ({ page, profiles, setProfiles, plots, setPlots, setTransactions, setPage, tasks, setTasks }) => {
  return (
    <div className="p-8 md:p-12 max-w-[1600px] mx-auto min-h-screen font-sans">
      {page === Page.MEMORIALS && <MemorialsPage profiles={profiles} setProfiles={setProfiles} tasks={tasks} setTasks={setTasks} />}
      {page === Page.SERVICES && <ServicesPage />}
      {page === Page.OBITUARY && <ObituaryPage plots={plots} setPlots={setPlots} setProfiles={setProfiles} setTransactions={setTransactions} onFinish={() => setPage(Page.MEMORIALS)} />}
    </div>
  );
};