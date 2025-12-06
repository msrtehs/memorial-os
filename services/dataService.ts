
import { Profile, ServiceItem, Plot, MaintenanceTask, Partner, Transaction, PricingItem, SecurityAlert, Cemetery, LicensingDoc, StockItem } from '../types';

// Mock Cemeteries (Multi-unidade)
export const MOCK_CEMETERIES: Cemetery[] = [
  { 
    id: 'c1', 
    name: 'Memorial Jardim da Paz', 
    city: 'São Paulo', 
    state: 'SP', 
    capacity: 5000, 
    occupied: 3850, 
    licensingStatus: 'valid',
    totalArea: 25000,
    revitalizationNeeded: false,
    conamaStatus: 'compliant',
    soilType: 'Argiloso',
    aiAnalysisSummary: 'Documentação completa. Sistema de drenagem de necrochorume operacional. Licença renovada em 2023.'
  },
  { 
    id: 'c2', 
    name: 'Cemitério Parque das Flores', 
    city: 'Campinas', 
    state: 'SP', 
    capacity: 2500, 
    occupied: 1200, 
    licensingStatus: 'pending',
    totalArea: 12000,
    revitalizationNeeded: true,
    conamaStatus: 'pending_analysis',
    soilType: 'Arenoso',
    aiAnalysisSummary: 'Pendente laudo hidrológico atualizado. Necessária impermeabilização das quadras B e C devido à porosidade do solo.'
  },
  { 
    id: 'c3', 
    name: 'Campo Santo Metropolitano', 
    city: 'Belo Horizonte', 
    state: 'MG', 
    capacity: 8000, 
    occupied: 7500, 
    licensingStatus: 'expired',
    totalArea: 40000,
    revitalizationNeeded: true,
    conamaStatus: 'non_compliant',
    soilType: 'Misto',
    aiAnalysisSummary: 'CRÍTICO: Licença vencida. Detectada saturação no setor antigo. Plano de exumação urgente necessário conforme upload do relatório técnico #402.'
  }
];

// Mock Profiles (Perfis)
export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Helena Ribeiro',
    dob: '20/04/1940',
    dod: '12/11/2020',
    bio: 'Uma avó amada que adorava jardinagem e música clássica. Ela deixa um legado de gentileza e biscoitos amanteigados.',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    location: 'Setor A, Fila 1, Jazigo 1',
    tributes: [
      { id: 't1', author: 'Paulo', content: 'Sinto sua falta todos os dias, mãe.', date: '01/10/2023', type: 'text' },
      { id: 't2', author: 'Família Silva', content: 'Enviamos uma rosa com amor.', date: '12/11/2023', type: 'flower' }
    ]
  },
  {
    id: '2',
    name: 'João Oliveira',
    dob: '15/08/1965',
    dod: '20/01/2021',
    bio: 'Pai dedicado e pescador ávido. Sempre tinha uma boa história para contar nas reuniões de domingo.',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    location: 'Setor C, Fila 1, Gaveta 1',
    tributes: []
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    dob: '10/02/1980',
    dod: '15/05/2023',
    bio: 'Amante de esportes radicais e vida ao ar livre.',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    location: 'Setor B, Fila 2, Jazigo 5',
    tributes: []
  }
];

// Mock Services
export const MOCK_SERVICES: ServiceItem[] = [
  { id: 's1', name: 'Buquê da Estação', description: 'Flores frescas da estação colocadas no túmulo.', price: 100.00, category: 'flowers', imageUrl: 'https://picsum.photos/300/200?random=10' },
  { id: 's2', name: 'Limpeza de Lápide', description: 'Limpeza profissional e polimento da lápide/marcador.', price: 100.00, category: 'maintenance', imageUrl: 'https://picsum.photos/300/200?random=11' },
  { id: 's3', name: 'Cerimônia de Lembrança', description: 'Uma pequena cerimônia realizada pela equipe.', price: 150.00, category: 'tribute', imageUrl: 'https://picsum.photos/300/200?random=12' },
  { id: 's4', name: 'Rosas Brancas', description: 'Uma dúzia de rosas brancas selecionadas.', price: 120.00, category: 'flowers', imageUrl: 'https://picsum.photos/300/200?random=13' }
];

// Map Data
const generateMockPlots = (): Plot[] => {
  const plots: Plot[] = [];
  // C1
  for (let i = 1; i <= 10; i++) {
    plots.push({
      id: `c1_p_a_${i}`, cemeteryId: 'c1', sector: 'A', row: '1', number: i, type: 'mausoleum',
      status: i <= 3 ? 'occupied' : 'available', price: 40000, features: ['Nobre'],
      occupantName: i === 1 ? 'Helena Ribeiro' : undefined, burialDate: i === 1 ? '12/11/2020' : undefined
    });
  }
  for (let i = 1; i <= 30; i++) {
    plots.push({
      id: `c1_p_b_${i}`, cemeteryId: 'c1', sector: 'B', row: Math.ceil(i/10).toString(), number: i, type: 'horizontal',
      status: i <= 15 ? 'occupied' : 'available', price: 3500 * 2.5, features: ['Gramado'],
      occupantName: i === 5 ? 'Carlos Mendes' : undefined, burialDate: i === 5 ? '16/05/2023' : undefined
    });
  }
  for (let i = 1; i <= 30; i++) {
    const isOccupied = i <= 20;
    const bDate = i === 1 ? '20/01/2021' : isOccupied ? '10/08/2023' : undefined; 
    plots.push({
      id: `c1_p_c_${i}`, cemeteryId: 'c1', sector: 'C', row: Math.ceil(i/10).toString(), number: i, type: 'vertical',
      status: isOccupied ? 'occupied' : 'available', price: 4500, features: ['Gaveta'],
      occupantName: isOccupied ? (i===1 ? 'João Oliveira' : `Anônimo SP ${i}`) : undefined, burialDate: bDate
    });
  }
  // C2
  for (let i = 1; i <= 60; i++) {
    plots.push({
      id: `c2_p_b_${i}`, cemeteryId: 'c2', sector: 'B', row: Math.ceil(i/15).toString(), number: i, type: 'horizontal',
      status: i <= 20 ? 'occupied' : 'available', price: 9500, features: ['Jardim', 'Vista'],
      occupantName: i <= 20 ? `Residente CP ${i}` : undefined, burialDate: '10/01/2024'
    });
  }
  // C3
  for (let i = 1; i <= 80; i++) {
     const isOccupied = i <= 70;
     const isExpired = i <= 15;
     const bDate = isExpired ? '01/05/2020' : '01/05/2023';
     plots.push({
      id: `c3_p_c_${i}`, cemeteryId: 'c3', sector: 'C', row: Math.ceil(i/20).toString(), number: i, type: 'vertical',
      status: isOccupied ? 'occupied' : 'available', price: 4000, features: ['Gaveta Econômica'],
      occupantName: isOccupied ? `Antigo Residente MG ${i}` : undefined, burialDate: isOccupied ? bDate : undefined
    });
  }
  return plots;
};

export const MOCK_PLOTS: Plot[] = generateMockPlots();

// Mock Tasks with Costs
export const MOCK_TASKS: MaintenanceTask[] = [
  { id: 'mt1', plotId: 'c1_p_b_5', description: 'Nivelamento de lápide horizontal', status: 'pending', priority: 'medium', reportedDate: '25/10/2023', cost: 0 },
  { id: 'mt2', plotId: 'c1_p_a_1', description: 'Limpeza de bronze do mausoléu', status: 'in-progress', priority: 'low', reportedDate: '26/10/2023', cost: 150.00 },
];

// Mock Stock (Estoque)
export const MOCK_STOCK: StockItem[] = [
    { id: 'st1', name: 'Cimento CP II', category: 'Material', quantity: 40, minQuantity: 10, unit: 'Saco 50kg', lastRestockDate: '01/10/2023' },
    { id: 'st2', name: 'Luvas de Proteção', category: 'EPI', quantity: 12, minQuantity: 20, unit: 'Par', lastRestockDate: '15/09/2023' },
    { id: 'st3', name: 'Tinta Branca Externa', category: 'Material', quantity: 5, minQuantity: 5, unit: 'Galão 18L', lastRestockDate: '20/10/2023' },
];

// Mock Partners
export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'pt1',
    name: 'Flower Incorporadora',
    type: 'Licenciamento & Gestão',
    description: 'Especialista em diagnósticos cemiteriais completos, licenciamento ambiental (CONAMA 335), planos de encerramento e gestão de concessões.',
    services: ['Licenciamento Ambiental', 'Diagnóstico Cemiterial', 'Planos de Encerramento', 'Gestão de Concessões'],
    contact: 'contato@flowerinc.com.br',
    isVerified: true,
    logoUrl: 'https://ui-avatars.com/api/?name=Flower+Inc&background=0D9488&color=fff'
  },
  {
    id: 'pt2',
    name: 'Marmoraria Eternitá',
    type: 'Construção',
    description: 'Construção de jazigos, ossários, gavetários e manutenção de pedras ornamentais.',
    services: ['Jazigos', 'Placas de Bronze', 'Polimento', 'Construção Civil'],
    contact: 'vendas@eternita.com.br',
    isVerified: true,
    logoUrl: 'https://ui-avatars.com/api/?name=Marmoraria&background=475569&color=fff'
  },
  {
    id: 'pt3',
    name: 'Jardins de Paz Paisagismo',
    type: 'Manutenção',
    description: 'Manutenção de áreas verdes, poda técnica e paisagismo para cemitérios parque.',
    services: ['Poda', 'Plantio', 'Limpeza Geral'],
    contact: 'servicos@jardinspaz.com.br',
    isVerified: false,
    logoUrl: 'https://ui-avatars.com/api/?name=Jardins&background=16A34A&color=fff'
  },
  {
    id: 'pt4',
    name: 'EcoAcqua Monitoramento',
    type: 'Ambiental & Aquíferos',
    description: 'Especialistas em monitoramento de lençol freático e análise de contaminação por necrochorume. Instalação de piezômetros.',
    services: ['Análise de Água', 'Piezômetros', 'Relatórios Ambientais', 'Laudo Hidrológico'],
    contact: 'contato@ecoacqua.com.br',
    isVerified: true,
    logoUrl: 'https://ui-avatars.com/api/?name=Eco+Acqua&background=0ea5e9&color=fff'
  },
  {
    id: 'pt5',
    name: 'VectorControl Pragas',
    type: 'Saúde Pública',
    description: 'Dedetização especializada para cemitérios (escorpiões, dengue, roedores) com laudo sanitário.',
    services: ['Dedetização', 'Controle de Escorpiões', 'Fumacê', 'Controle de Vetores'],
    contact: 'servicos@vectorcontrol.com',
    isVerified: true,
    logoUrl: 'https://ui-avatars.com/api/?name=Vector+Control&background=ef4444&color=fff'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', cemeteryId: 'c1', date: '25/10/2023', description: 'Venda Jazigo A-12', amount: 5500.00, type: 'income', category: 'Vendas', status: 'verified', aiAudited: true },
  { id: 't2', cemeteryId: 'c1', date: '26/10/2023', description: 'Manutenção Mensal Jardins', amount: 1200.00, type: 'expense', category: 'Manutenção', status: 'verified', aiAudited: true },
  { id: 't3', cemeteryId: 'c2', date: '26/10/2023', description: 'Taxa de Sepultamento', amount: 450.00, type: 'income', category: 'Serviços', status: 'pending', aiAudited: true },
  { id: 't4', cemeteryId: 'c1', date: '27/10/2023', description: 'Compra de EPIs', amount: 350.00, type: 'expense', category: 'Operacional', status: 'verified', aiAudited: false },
];

export const MOCK_PRICING: PricingItem[] = [
  { id: 'pr1', item: 'Mausoléu (m²)', type: 'construction', price: 8000.00, unit: 'm2', description: 'Construção nobre', lastUpdated: '01/10/2023' },
  { id: 'pr2', item: 'Gaveta Provisória (36m)', type: 'plot', price: 4500.00, unit: 'fixed', description: '36 meses com exumação', lastUpdated: '01/10/2023' },
  { id: 'pr3', item: 'Enterro Horizontal (m²)', type: 'plot', price: 3500.00, unit: 'm2', description: 'Área gramada', lastUpdated: '01/10/2023' },
  { id: 'pr4', item: 'Ossuário Perpétuo', type: 'plot', price: 3500.00, unit: 'fixed', description: 'Pós exumação (Solução Total)', lastUpdated: '01/10/2023' },
  { id: 'pr5', item: 'Taxa de Sepultamento', type: 'service', price: 450.00, unit: 'fixed', lastUpdated: '01/06/2023' },
  { id: 'pr6', item: 'Manutenção Anual', type: 'tax', price: 350.00, unit: 'fixed', lastUpdated: '01/01/2023' },
];

export const MOCK_ALERTS: SecurityAlert[] = [
  { id: 'al1', timestamp: '27/10/2023 02:14', location: 'Portão Norte', type: 'intrusion', status: 'resolved', resolvedBy: 'Carlos (Vigia)', resolutionNotes: 'Animal de pequeno porte acionou sensor.', imageUrl: 'https://picsum.photos/200/150?blur=5' },
  { id: 'al2', timestamp: '27/10/2023 23:45', location: 'Muro Leste', type: 'movement', status: 'active', imageUrl: 'https://picsum.photos/200/150?grayscale' },
];

export const MOCK_LICENSING_DOCS: LicensingDoc[] = [
    { id: 'ld1', name: 'Licença de Operação (LO)', type: 'LO', status: 'valid', expirationDate: '12/2025', requiredPartnerType: 'Licenciamento & Gestão' },
    { id: 'ld2', name: 'Plano de Gerenciamento de Resíduos (PGRSS)', type: 'Technical', status: 'valid', expirationDate: '01/2024', requiredPartnerType: 'Licenciamento & Gestão' },
    { id: 'ld3', name: 'Laudo Hidrológico / Monitoramento Lençol', type: 'Technical', status: 'pending', requiredPartnerType: 'Ambiental & Aquíferos' },
    { id: 'ld4', name: 'Projeto de Drenagem Pluvial', type: 'Technical', status: 'valid', requiredPartnerType: 'Construção' },
    { id: 'ld5', name: 'Certificado de Controle de Vetores', type: 'Technical', status: 'expired', expirationDate: '10/2023', requiredPartnerType: 'Saúde Pública' },
];
