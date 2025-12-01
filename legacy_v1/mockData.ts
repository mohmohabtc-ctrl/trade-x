
import { Visit, VisitStatus, KPI, FormTemplate, AdminReport, MerchandiserProfile, PhotoItem, ManagerProfile, Product } from './types';

export const MOCK_STORES = [
  { id: 's1', name: 'Carrefour Market', address: '12 Rue de la Paix, Paris', lat: 48.86, lng: 2.33 },
  { id: 's2', name: 'Monoprix', address: '55 Avenue des Champs, Paris', lat: 48.87, lng: 2.30 },
  { id: 's3', name: 'Franprix', address: '145 Bd Saint-Germain, Paris', lat: 48.85, lng: 2.33 },
  { id: 's4', name: 'Super U', address: '22 Rue Montorgueil, Paris', lat: 48.86, lng: 2.34 },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', brand: 'Coca-Cola', sku: 'COCA-1.5L', name: 'Coca-Cola Original 1.5L', price: 120, stock: 50, facing: 4 },
  { id: 'p2', brand: 'Coca-Cola', sku: 'COCA-33CL', name: 'Coca-Cola Canette 33cl', price: 60, stock: 100, facing: 6 },
  { id: 'p3', brand: 'Candia', sku: 'CANDIA-1L', name: 'Lait Candia Demi-Ecrémé 1L', price: 95, stock: 200, facing: 10 },
  { id: 'p4', brand: 'Ramy', sku: 'RAMY-JUS-1L', name: 'Jus Ramy Orange 1L', price: 130, stock: 40, facing: 3 },
];

// Assuming IDs from MOCK_MERCHANDISERS: m1=Ali, m2=Sara, m3=Amine, m4=Djamel

export const MOCK_VISITS: Visit[] = [
  {
    id: 'v1',
    merchandiserId: 'm1', // Ali
    storeId: 's1',
    store: MOCK_STORES[0],
    scheduledStart: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    scheduledEnd: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    status: VisitStatus.COMPLETED,
    checkInTime: new Date(new Date().setHours(9, 5, 0, 0)).toISOString(),
    checkOutTime: new Date(new Date().setHours(9, 55, 0, 0)).toISOString(),
    tasks: [
      { id: 't1', type: 'PHOTO', title: 'Photo Rayon Boissons', completed: true, required: true },
      { id: 't2', type: 'FORM', title: 'Relevé Promo', completed: true, required: true },
    ],
  },
  {
    id: 'v2',
    merchandiserId: 'm2', // Sara
    storeId: 's2',
    store: MOCK_STORES[1],
    scheduledStart: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    scheduledEnd: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
    status: VisitStatus.IN_PROGRESS,
    checkInTime: new Date(new Date().setHours(10, 35, 0, 0)).toISOString(),
    tasks: [
      { id: 't3', type: 'INVENTORY', title: 'Inventaire Cola 1.5L', completed: false, required: true },
      { id: 't4', type: 'PHOTO', title: 'Photo Tête de Gondole', completed: false, required: false },
    ],
  },
  {
    id: 'v3',
    merchandiserId: 'm3', // Amine
    storeId: 's3',
    store: MOCK_STORES[2],
    scheduledStart: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    scheduledEnd: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    status: VisitStatus.TODO,
    tasks: [
      { id: 't5', type: 'FORM', title: 'Conformité Linéaire', completed: false, required: true },
    ],
  },
  {
    id: 'v4',
    merchandiserId: 'm4', // Djamel
    storeId: 's4',
    store: MOCK_STORES[3],
    scheduledStart: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    scheduledEnd: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(),
    status: VisitStatus.LATE,
    tasks: [
      { id: 't6', type: 'PHOTO', title: 'Preuve de passage', completed: false, required: true },
    ],
  },
];

export const MOCK_KPIS: KPI[] = [
  { label: 'Visites du jour', value: '24 / 30', trend: 'up', trendValue: '+12%' },
  { label: 'Taux de conformité', value: '92%', trend: 'down', trendValue: '-2%' },
  { label: 'Photos reçues', value: 156, trend: 'up', trendValue: '+45' },
  { label: 'Anomalies Critiques', value: 3, trend: 'neutral', trendValue: '0' },
];

export const MOCK_FORM_TEMPLATE: FormTemplate = {
  id: 'ft1',
  name: 'Conformité Promo',
  questions: [
    { id: 'q1', type: 'radio', label: 'La PLV est-elle en place ?', options: ['Oui', 'Non'], required: true },
    { id: 'q2', type: 'number', label: 'Nombre de facings', required: true },
    { id: 'q3', type: 'rating', label: 'Propreté du linéaire', required: false },
    { id: 'q4', type: 'photo', label: 'Photo de la promotion', required: true },
  ],
};

export const MOCK_ADMIN_REPORTS: AdminReport[] = [
  {
    id: 1,
    merch: 'Ali',
    store: 'Carrefour Centre',
    ville: 'Alger',
    dlc: '',
    veille: '',
    rupture: 'Non',
    status: 'En cours',
    date: '11/11/2025',
    progress: 0
  },
  {
    id: 2,
    merch: 'Sara',
    store: 'Auchan Bab Ezzouar',
    ville: 'Alger',
    dlc: '',
    veille: '',
    rupture: 'Non',
    status: 'Terminé',
    date: '11/11/2025',
    progress: 0
  },
  {
    id: 3,
    merch: 'amine',
    store: 'PROXIM',
    ville: 'REGHAIA',
    dlc: '',
    veille: '',
    rupture: 'Non',
    status: 'En cours',
    date: '2025-11-11',
    progress: 0
  },
  {
    id: 4,
    merch: 'djamel',
    store: 'geant',
    ville: 'heusin dey',
    dlc: 'pistache70 G Q 10 ....',
    veille: 'PROMO AWAFI PRIX BARREE',
    rupture: 'Oui',
    status: 'Terminé',
    date: '2025-11-11',
    progress: 100
  }
];

export const MOCK_MERCHANDISERS: MerchandiserProfile[] = [
  { id: 'm1', name: 'Ali', email: 'ali@merchfield.com', password: '123', phone: '0550 12 34 56', zone: 'Alger Centre', active: true },
  { id: 'm2', name: 'Sara', email: 'sara@merchfield.com', password: '123', phone: '0551 98 76 54', zone: 'Alger Est', active: true },
  { id: 'm3', name: 'Amine', email: 'amine@merchfield.com', password: '123', phone: '0552 22 33 44', zone: 'Reghaia', active: true },
  { id: 'm4', name: 'Djamel', email: 'djamel@merchfield.com', password: '123', phone: '0553 44 55 66', zone: 'Hussein Dey', active: true },
];

export const MOCK_MANAGERS: ManagerProfile[] = [
  { id: 'mgr1', name: 'Sophie', email: 'sophie@raya.dz', password: '123', role: 'SUPERVISOR', region: 'Région Nord', active: true }
];

export const MOCK_PHOTOS: PhotoItem[] = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1601599963565-b7b4b494dbe8?q=80&w=400&auto=format&fit=crop',
    merch: 'Djamel',
    store: 'geant',
    date: '2025-11-11',
    anomalyType: 'Rupture',
    comment: 'Rayon pistache vide'
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=400&auto=format&fit=crop',
    merch: 'Sara',
    store: 'Auchan Bab Ezzouar',
    date: '2025-11-11',
    anomalyType: 'Aucune',
    comment: 'Mise en avant OK'
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1578916171728-56685e52d564?q=80&w=400&auto=format&fit=crop',
    merch: 'Djamel',
    store: 'geant',
    date: '2025-11-11',
    anomalyType: 'Prix',
    comment: 'Concurrent -20% affiché'
  },
  {
    id: 'p4',
    url: 'https://images.unsplash.com/photo-1580913428706-c311e67898b3?q=80&w=400&auto=format&fit=crop',
    merch: 'Amine',
    store: 'PROXIM',
    date: '2025-11-10',
    anomalyType: 'PLV',
    comment: 'PLV Manquante en tête de gondole'
  },
  {
    id: 'p5',
    url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=400&auto=format&fit=crop',
    merch: 'Ali',
    store: 'Carrefour Centre',
    date: '2025-11-11',
    anomalyType: 'Propreté',
    comment: 'Sol sale devant le rayon'
  }
];