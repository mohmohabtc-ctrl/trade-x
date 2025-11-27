/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect } from 'react';
import { UserRole, MerchandiserProfile, Visit, Store, ManagerProfile, Product, VisitStatus, Task } from './types';
import MobileApp from './components/MobileApp';
import DesktopApp from './components/DesktopApp';
import LandingPage from './components/LandingPage';
import { Zap, Moon, Sun, Loader2, ArrowLeft, LogIn, Clock } from 'lucide-react';
import { supabase } from './supabaseClient';
import { MOCK_PRODUCTS, MOCK_VISITS, MOCK_STORES, MOCK_MERCHANDISERS, MOCK_MANAGERS } from './mockData';
import TrialExpired from './components/TrialExpired';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.MERCHANDISER);
  const [currentUser, setCurrentUser] = useState<MerchandiserProfile | ManagerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- LANDING PAGE STATE ---
  const [showLandingPage, setShowLandingPage] = useState(true);

  // --- DARK MODE STATE ---
  const [darkMode, setDarkMode] = useState(false);

  // --- TRIAL STATE ---
  const [trialExpired, setTrialExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check Trial Status on Mount
  useEffect(() => {
    const trialStart = localStorage.getItem('tradeX_trial_start');
    if (trialStart) {
      const startDate = new Date(trialStart);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        setTrialExpired(true);
      } else {
        setDaysRemaining(8 - diffDays); // 7 days trial, so 8 - current day index (1-based roughly)
      }

      // Auto-login if demo user
      const isDemoUser = localStorage.getItem('tradeX_is_demo_user');
      if (isDemoUser === 'true' && !isLoggedIn && diffDays <= 7) {
        // Auto login as Manager for demo
        const demoMgr = MOCK_MANAGERS[0];
        setCurrentUser(demoMgr);
        setRole(UserRole.MANAGER);
        setIsLoggedIn(true);
        setShowLandingPage(false);
      }
    }
  }, [isLoggedIn]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- GLOBAL STATE (Database) ---
  const [globalVisits, setGlobalVisits] = useState<Visit[]>([]);
  const [globalStores, setGlobalStores] = useState<Store[]>([]);
  const [globalMerchandisers, setGlobalMerchandisers] = useState<MerchandiserProfile[]>([]);
  const [globalManagers, setGlobalManagers] = useState<ManagerProfile[]>([]);
  const [globalProducts, setGlobalProducts] = useState<Product[]>([]);

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      // En arrière-plan, on charge les données
      try {
        // 1. Load Stores
        const { data: stores, error: storeError } = await supabase.from('stores').select('*');
        if (stores && !storeError) setGlobalStores(stores);
        else setGlobalStores(MOCK_STORES);

        // 2. Load Users (Merchandisers & Managers)
        const { data: users, error: userError } = await supabase.from('users').select('*');
        if (users && !userError) {
          const merchs = users.filter((u: any) => u.role === 'MERCHANDISER').map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            phone: u.phone,
            zone: u.zone,
            active: u.active,
            avatarUrl: u.avatar_url
          }));
          setGlobalMerchandisers(merchs);

          const managers = users.filter((u: any) => u.role === 'SUPERVISOR' || u.role === 'MANAGER' || u.role === 'ADMIN').map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            role: (u.role === 'ADMIN' ? 'ADMIN' : 'SUPERVISOR') as 'SUPERVISOR' | 'ADMIN',
            region: u.zone, // Mapping zone to region for managers
            active: u.active
          }));
          setGlobalManagers(managers);
        } else {
          // Fallback to mocks if error or empty (optional, maybe remove for prod)
          setGlobalMerchandisers(MOCK_MERCHANDISERS);
          setGlobalManagers(MOCK_MANAGERS);
        }

        // 4. Load Products
        const { data: products, error: prodError } = await supabase.from('products').select('*');
        if (products && !prodError) setGlobalProducts(products);
        else setGlobalProducts(MOCK_PRODUCTS);

        // 5. Load Visits (Complex join usually, keeping it simple for now or using Mocks if DB empty)
        // For now, we use MOCK_VISITS extended with dynamic logic if needed
        // In production, this would be a Supabase query
        setGlobalVisits(MOCK_VISITS);

      } catch (error) {
        console.error("Error loading data:", error);
        setGlobalStores(MOCK_STORES);
        setGlobalMerchandisers(MOCK_MERCHANDISERS);
        setGlobalManagers(MOCK_MANAGERS);
        setGlobalVisits(MOCK_VISITS);
        setGlobalProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- ACTIONS ---

  const handleLogin = async (email: string, pass: string) => {
    // 1. Check Merchandisers
    const merch = globalMerchandisers.find(m => m.email.toLowerCase() === email.toLowerCase() && m.password === pass);
    if (merch) {
      setCurrentUser(merch);
      setRole(UserRole.MERCHANDISER);
      setIsLoggedIn(true);
      setShowLandingPage(false);
      return;
    }

    // 1. Try Supabase Auth Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if (error) {
      // Fallback: Check if it's a legacy manual user (from our previous implementation without Auth)
      // This is useful during migration or for the "mobile" accounts we created manually
      const mgr = globalManagers.find(m => m.email.toLowerCase() === email.toLowerCase() && m.password === pass);
      if (mgr) {
        setCurrentUser(mgr);
        setRole(mgr.role === 'ADMIN' ? UserRole.ADMIN : UserRole.MANAGER);
        setIsLoggedIn(true);
        setShowLandingPage(false);
        return;
      }

      return "Email ou mot de passe incorrect.";
    }

    // If successful, the onAuthStateChange listener above will handle the state update
    return null;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('tradeX_is_demo_user'); // Clear demo auto-login
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowLandingPage(true); // Retour à la landing page
  };

  // Sync functions for App components to update global state
  const updateVisit = (updatedVisit: Visit) => {
    setGlobalVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
    // In Real App: Supabase update here
  };

  const addVisit = (newVisit: Visit) => {
    setGlobalVisits(prev => [...prev, newVisit]);
  };

  const addMerchandiser = (m: MerchandiserProfile) => {
    setGlobalMerchandisers(prev => [...prev, m]);
  };

  const addManager = (m: ManagerProfile) => {
    setGlobalManagers(prev => [...prev, m]);
  };

  const addStore = (s: Store) => {
    setGlobalStores(prev => [...prev, s]);
  };

  const deleteStore = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce magasin ?')) {
      setGlobalStores(prev => prev.filter(s => s.id !== id));
    }
  };

  const addProduct = (p: Product) => {
    setGlobalProducts(prev => [...prev, p]);
  }

  // --- RENDER LOGIC ---

  if (trialExpired) {
    return <TrialExpired />;
  }

  if (showLandingPage) {
    return (
      <LandingPage
        onEnterApp={() => setShowLandingPage(false)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        loading={false}
        isDarkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onBackToHome={() => setShowLandingPage(true)}
      />
    );
  }

  // Routing based on Role
  if (role === UserRole.MERCHANDISER) {
    return (
      <>
        {daysRemaining !== null && (
          <div className="bg-brand-600 text-white text-xs font-bold text-center py-1 px-4 flex justify-center items-center gap-2">
            <Clock size={12} /> Essai Gratuit : {daysRemaining} jours restants
          </div>
        )}
        <MobileApp
          onLogout={handleLogout}
          currentUser={currentUser as MerchandiserProfile}
          allVisits={globalVisits}
          onUpdateVisit={updateVisit}
          onAddVisit={addVisit}
          products={globalProducts}
          isDarkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </>
    );
  } else {
    return (
      <>
        {daysRemaining !== null && (
          <div className="bg-brand-600 text-white text-xs font-bold text-center py-1 px-4 flex justify-center items-center gap-2">
            <Clock size={12} /> Essai Gratuit : {daysRemaining} jours restants
          </div>
        )}
        <DesktopApp
          onLogout={handleLogout}
          userRole={role}
          currentUser={currentUser}
          merchandisers={globalMerchandisers}
          onAddMerchandiser={addMerchandiser}
          managers={globalManagers}
          onAddManager={addManager}
          stores={globalStores}
          onAddStore={addStore}
          onDeleteStore={deleteStore}
          visits={globalVisits}
          onAddVisit={addVisit}
          products={globalProducts}
          onAddProduct={addProduct}
          isDarkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </>
    );
  }
};

// --- LOGIN SCREEN COMPONENT ---
const LoginScreen = ({ onLogin, loading, isDarkMode, toggleDarkMode, onBackToHome }: any) => {
  // --- LOGIN STATE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = await onLogin(email, password);
    if (error) {
      setLoginError(error);
    } else {
      setLoginError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <button
        onClick={onBackToHome}
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-2 rounded-lg shadow-lg">
              <Zap size={28} className="fill-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">TradeX <span className="text-red-600">Insights</span></h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider uppercase font-semibold">Espace Professionnel</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email professionnel</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
              placeholder="nom@entreprise.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-brand-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
            Se connecter
          </button>
        </form>


      </div>
    </div>
  );
};

export default App;