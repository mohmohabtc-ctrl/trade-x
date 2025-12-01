
export enum UserRole {
    MERCHANDISER = 'MERCHANDISER',
    MANAGER = 'MANAGER', // = Superviseur (Sophie)
    ADMIN = 'ADMIN',     // = Vous (Responsable des superviseurs)
}

export enum VisitStatus {
    TODO = 'TODO',
    name: string; // Nom commercial
    price: number;
    stock: number; // Stock cible ou théorique
    facing: number; // Objectif de facing
    owner_id?: string; // The Manager who owns this product
}

export interface Task {
    id: string;
    type: 'PHOTO' | 'FORM' | 'INVENTORY';
    title: string;
    completed: boolean;
    required: boolean;
    data?: any; // Stores the result (photo URL, form answers, etc.)
}

export interface Visit {
    id: string;
    merchandiserId: string; // Link to the assigned merchandiser
    storeId: string;
    store: Store;
    scheduledStart: string; // ISO Date
    scheduledEnd: string;   // ISO Date
    status: VisitStatus;
    tasks: Task[];
    checkInTime?: string;
    checkOutTime?: string;
    owner_id?: string; // The Manager who created this visit

    // Champs pour le rapport rapide en mode tableau
    dlc?: string;
    veille?: string;
    rupture?: string;
    photoAvant?: string; // URL ou nom du fichier
    photoApres?: string; // URL ou nom du fichier
    ruptureItems?: string[]; // List of product IDs out of stock
}

export interface KPI {
    label: string;
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
}

export interface Question {
    id: string;
    type: 'text' | 'number' | 'radio' | 'checkbox' | 'rating' | 'photo';
    label: string;
    options?: string[];
    required: boolean;
}

export interface FormTemplate {
    id: string;
    name: string;
    questions: Question[];
}

export interface AdminReport {
    id: string | number; // Updated to allow UUID strings
    merch: string;
    store: string;
    ville: string;
    dlc: string;
    veille: string;
    rupture: string;
    status: string;
    date: string;
    progress: number;
}

export interface MerchandiserProfile {
    id: string;
    name: string;
    email: string;
    password?: string;
    phone: string;
    zone: string;
    active: boolean;
    avatarUrl?: string;
    manager_id?: string; // Link to the Manager who created this user
    created_at?: string;
}

// New Interface for Supervisors (Managers like Sophie)
export interface ManagerProfile {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'SUPERVISOR' | 'ADMIN';
    region: string;
    active: boolean;
    created_at?: string;
}

export interface PhotoItem {
    id: string;
    url: string;
    merch: string;
    store: string;
    date: string;
    anomalyType: string; // 'Aucune', 'Rupture', 'Prix', 'PLV', etc.
    comment?: string;
}
