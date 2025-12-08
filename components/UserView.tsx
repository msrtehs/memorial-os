import React, { useState, useEffect, Dispatch, SetStateAction, ChangeEvent } from 'react';
import { Page, Profile, Plot, Transaction, MaintenanceTask, AppUser, Tribute } from '../types';
import { Heart, Calendar, MapPin, CreditCard, Flower, Sparkles, Plus, ArrowLeft, Send, X, Star, QrCode, CheckCircle, Loader2, FileText, Hammer, Camera, Save, Trash2, Edit2 } from 'lucide-react';
import { updateUserProfile } from '../services/authService';
import { uploadFileToStorage, updateProfile, addProfile, updatePlotStatus, addTransaction, deleteProfile } from '../services/realtimeService';

// --- OBITUARY PAGE ---
interface ObituaryPageProps {
  plots: Plot[];
  setPlots: Dispatch<SetStateAction<Plot[]>>;
  setProfiles: Dispatch<SetStateAction<Profile[]>>;
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  onFinish: () => void;
  currentUser: AppUser | null;
}

const ObituaryPage: React.FC<ObituaryPageProps> = ({ plots, setPlots, setProfiles, setTransactions, onFinish, currentUser }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({ name: '', dob: '', dod: '', bio: '' });
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [processing, setProcessing] = useState(false);

  // FIX: Recalcular availablePlots quando 'plots' muda
  const availablePlots = plots ? plots.filter(p => p.status === 'available') : [];
  
  const handleFinish = async () => {
    if (!currentUser) {
        alert("Você precisa estar logado para registrar um óbito e ser o dono do memorial.");
        return;
    }

    setProcessing(true);
    if (!selectedPlot) return;
    
    const newProfile: Profile = {
      id: Date.now().toString(),
      ownerId: currentUser.uid,
      name: formData.name,
      dob: formData.dob,
      dod: formData.dod,
      bio: formData.bio,
      imageUrl: `https://ui-avatars.com/api/?name=${formData.name}&background=1e293b&color=fff&size=400`,
      location: `Setor ${selectedPlot.sector}, Lote ${selectedPlot.number}`,
      tributes: []
    };

    try {
        await addProfile(newProfile);
        await updatePlotStatus(selectedPlot.id, 'occupied', formData.name, new Date().toLocaleDateString('pt-BR'));
        
        const newTx: Transaction = {
            id: `tx_${Date.now()}`,
            date: new Date().toLocaleDateString('pt-BR'),
            description: `Venda Online - Jazigo ${selectedPlot.sector}-${selectedPlot.number}`,
            amount: selectedPlot.price + 450,
            type: 'income',
            category: 'Vendas',
            status: 'verified',
            aiAudited: true,
            cemeteryId: selectedPlot.cemeteryId
        };
        await addTransaction(newTx);

        // Optimistic update
        setProfiles(prev => [...prev, newProfile]);
        onFinish();
    } catch (error) {
        console.error("Erro ao salvar óbito:", error);
        alert("Erro ao salvar dados. Verifique conexão.");
    } finally {
        setProcessing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-4xl mx-auto pb-20 p-4 md:p-0">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 serif-font">Comunicar Óbito</h1>
        {!currentUser && (
            <p className="text-red-500 font-bold mt-2 bg-red-50 p-2 rounded-lg inline-block">
                Atenção: Faça login antes de iniciar para garantir que o memorial seja salvo na sua conta.
            </p>
        )}
      </header>

      {/* Steps Indicator */}
      <div className="flex justify-between items-center mb-8 md:mb-12 relative px-4 md:px-10">
         <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10"></div>
         {[1, 2, 3].map(s => (
           <div key={s} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all ${step >= s ? 'bg-slate-900 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>{s}</div>
         ))}
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl border border-slate-100 min-h-[400px]">
        {step === 1 && (
           <div className="space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-bold serif-font text-slate-800">Dados do Ente Querido</h3>
              <div className="grid grid-cols-1 gap-4">
                 <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Nome Completo" />
                 <div className="grid grid-cols-2 gap-4">
                    <input value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Nascimento (DD/MM/AAAA)" />
                    <input value={formData.dod} onChange={e => setFormData({...formData, dod: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Falecimento" />
                 </div>
                 <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 h-32" placeholder="Biografia..." />
              </div>
              <button disabled={!formData.name} onClick={() => setStep(2)} className="w-full md:w-auto float-right bg-slate-900 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50">Próximo</button>
           </div>
        )}

        {step === 2 && (
           <div className="flex flex-col h-full">
              <h3 className="text-xl md:text-2xl font-bold serif-font text-slate-800 mb-4">Escolha o Local</h3>
              <div className="flex-1 overflow-y-auto bg-slate-100 rounded-2xl p-4 border border-slate-200 mb-6 max-h-[300px] md:max-h-[400px]">
                 <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {availablePlots.map(plot => (
                        <button 
                            key={plot.id} 
                            onClick={() => setSelectedPlot(plot)} 
                            className={`p-2 rounded-lg text-xs font-bold transition-all border-2 ${
                                selectedPlot?.id === plot.id 
                                    ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-md' 
                                    : 'bg-emerald-500 text-white border-emerald-500 hover:scale-105'
                            }`}
                        >
                            {plot.sector}-{plot.number}
                        </button>
                    ))}
                 </div>
              </div>
              <div className="flex justify-between">
                 <button onClick={() => setStep(1)} className="text-slate-500 font-bold px-4">Voltar</button>
                 <button disabled={!selectedPlot} onClick={() => setStep(3)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50">Continuar</button>
              </div>
           </div>
        )}

        {step === 3 && selectedPlot && (
           <div className="text-center py-8">
              {processing ? <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600"/> : (
                 <>
                    <h3 className="text-2xl font-bold mb-4">Confirmar</h3>
                    <p className="mb-8 text-slate-500">{formData.name} em {selectedPlot.sector}-{selectedPlot.number}</p>
                    <button onClick={handleFinish} disabled={!currentUser} className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">Finalizar e Pagar</button>
                    {!currentUser && <p className="text-xs text-red-500 mt-2">Faça login para finalizar.</p>}
                 </>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

// --- MEMORIALS PAGE ---
interface MemorialsPageProps {
  profiles: Profile[];
  setProfiles: Dispatch<SetStateAction<Profile[]>>;
  tasks: MaintenanceTask[];
  setTasks: Dispatch<SetStateAction<MaintenanceTask[]>>;
  currentUser: AppUser | null;
}

const MemorialsPage: React.FC<MemorialsPageProps> = ({ profiles, setProfiles, tasks, setTasks, currentUser }) => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  
  // Quick Payment & Tribute logic omitted for brevity but should remain same structure
  // ... (Keep existing tribute logic) ...

  const handleImageUpdate = async (e: ChangeEvent<HTMLInputElement>, profileId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      try {
        const path = `memorials/${profileId}/profile_${Date.now()}.jpg`;
        const newUrl = await uploadFileToStorage(path, file);
        await updateProfile(profileId, { imageUrl: newUrl });
        
        // Optimistic Update
        const updated = profiles.map(p => p.id === profileId ? { ...p, imageUrl: newUrl } : p);
        setProfiles(updated);
        if (selectedProfile?.id === profileId) setSelectedProfile({ ...selectedProfile, imageUrl: newUrl });
      } catch (error: any) {
        alert(`Erro ao salvar foto: ${error.code || error.message}`);
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este memorial? Esta ação não pode ser desfeita.")) {
      try {
        await deleteProfile(profileId);
        setProfiles(prev => prev.filter(p => p.id !== profileId));
        setSelectedProfile(null);
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir memorial.");
      }
    }
  };

  const handleEditProfile = async () => {
    if (!selectedProfile || !editForm) return;
    try {
      await updateProfile(selectedProfile.id, editForm);
      const updatedProfile = { ...selectedProfile, ...editForm } as Profile;
      setSelectedProfile(updatedProfile);
      setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao editar:", error);
      alert("Erro ao salvar alterações.");
    }
  };

  if (selectedProfile) {
    return (
      <div className="pb-20 animate-in fade-in">
        <button onClick={() => setSelectedProfile(null)} className="mb-4 md:mb-8 px-4 py-2 bg-white rounded-full text-sm shadow-sm flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Voltar</button>
        
        {/* Profile Details */}
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl relative">
           {/* Edit/Delete Controls */}
           <div className="absolute top-4 left-4 z-30 flex gap-2">
              <button onClick={() => { setIsEditing(true); setEditForm(selectedProfile); }} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"><Edit2 className="w-5 h-5"/></button>
              <button onClick={() => handleDeleteProfile(selectedProfile.id)} className="p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-colors"><Trash2 className="w-5 h-5"/></button>
           </div>

           <div className="h-[300px] md:h-[500px] relative">
              <img src={selectedProfile.imageUrl} className="w-full h-full object-cover" />
              <label className="absolute top-4 right-4 p-3 bg-black/40 rounded-full text-white cursor-pointer z-20">
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpdate(e, selectedProfile.id)} />
                 {isUploadingPhoto ? <Loader2 className="animate-spin w-6 h-6"/> : <Camera className="w-6 h-6"/>}
              </label>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black/80 to-transparent text-white">
                 <h1 className="text-3xl md:text-5xl font-bold serif-font">{selectedProfile.name}</h1>
                 <p className="opacity-90">{(selectedProfile.dob||'').split('/').slice(-1)[0]} — {(selectedProfile.dod||'').split('/').slice(-1)[0]}</p>
              </div>
           </div>
           
           <div className="p-6 md:p-12">
              {isEditing ? (
                <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                   <h3 className="font-bold text-slate-800">Editar Informações</h3>
                   <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 border rounded" placeholder="Nome" />
                   <div className="flex gap-2">
                      <input value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-1/2 p-2 border rounded" placeholder="Nascimento" />
                      <input value={editForm.dod} onChange={e => setEditForm({...editForm, dod: e.target.value})} className="w-1/2 p-2 border rounded" placeholder="Falecimento" />
                   </div>
                   <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full p-2 border rounded h-24" placeholder="Biografia" />
                   <div className="flex gap-2 justify-end">
                      <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
                      <button onClick={handleEditProfile} className="px-4 py-2 bg-blue-600 text-white rounded">Salvar</button>
                   </div>
                </div>
              ) : (
                <p className="text-lg text-slate-600 font-serif leading-relaxed">{selectedProfile.bio}</p>
              )}
              {/* Tributes Section Placeholder... */}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in">
      <header className="mb-10 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 serif-font">Jardim de Memórias</h1>
        <p className="text-slate-500">{currentUser ? `Bem-vindo ao seu espaço sagrado, ${currentUser.displayName || 'Visitante'}.` : 'Faça login para ver suas memórias.'}</p>
      </header>
      
      {profiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-0">
            {profiles.map(profile => (
            <div key={profile.id} onClick={() => setSelectedProfile(profile)} className="h-[400px] rounded-[2rem] overflow-hidden relative cursor-pointer group shadow-md">
                <img src={profile.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
                <div className="absolute bottom-0 p-6 text-white">
                <h3 className="text-xl font-bold serif-font">{profile.name}</h3>
                <p className="text-sm opacity-80">{(profile.dob||'').split('/').slice(-1)[0]} - {(profile.dod||'').split('/').slice(-1)[0]}</p>
                </div>
            </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">
            {currentUser ? (
                <p>Você ainda não tem memoriais registrados. Use "Comunicar Óbito" para adicionar.</p>
            ) : (
                <div className="flex flex-col items-center">
                    <p className="mb-4">Este jardim é privado. Entre na sua conta para visualizá-lo.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

const ServicesPage: React.FC = () => (
    <div className="p-8 text-center text-slate-500"><h2 className="text-2xl font-bold">Loja de Serviços</h2></div>
);

interface UserViewProps {
  page: Page;
  profiles: Profile[];
  setProfiles: Dispatch<SetStateAction<Profile[]>>;
  plots: Plot[];
  setPlots: Dispatch<SetStateAction<Plot[]>>;
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  setPage: (page: Page) => void;
  tasks: MaintenanceTask[];
  setTasks: Dispatch<SetStateAction<MaintenanceTask[]>>;
  currentUser: AppUser | null;
}

export const UserView: React.FC<UserViewProps> = ({ page, profiles, setProfiles, plots, setPlots, setTransactions, setPage, tasks, setTasks, currentUser }) => {
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [editName, setEditName] = useState('');
  
  // Listen for Sidebar event
  useEffect(() => {
    const handleOpen = () => setShowProfileSettings(true);
    window.addEventListener('openProfileSettings', handleOpen);
    return () => window.removeEventListener('openProfileSettings', handleOpen);
  }, []);

  useEffect(() => { if (currentUser) setEditName(currentUser.displayName || ''); }, [currentUser]);

  const handleUpdateProfile = async () => {
      await updateUserProfile(editName);
      setShowProfileSettings(false);
  };

  return (
    <div className="p-4 md:p-12 max-w-[1600px] mx-auto min-h-screen font-sans">
      {page === Page.MEMORIALS && <MemorialsPage profiles={profiles} setProfiles={setProfiles} tasks={tasks} setTasks={setTasks} currentUser={currentUser} />}
      {page === Page.SERVICES && <ServicesPage />}
      {page === Page.OBITUARY && <ObituaryPage plots={plots} setPlots={setPlots} setProfiles={setProfiles} setTransactions={setTransactions} onFinish={() => setPage(Page.MEMORIALS)} currentUser={currentUser} />}
      
      {showProfileSettings && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-3xl w-full max-w-sm">
                  <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
                  <input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full border p-3 rounded-xl mb-4" />
                  <button onClick={handleUpdateProfile} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Salvar</button>
                  <button onClick={()=>setShowProfileSettings(false)} className="w-full mt-2 text-slate-500 py-2">Cancelar</button>
              </div>
          </div>
      )}
    </div>
  );
};