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

  // Check Trial Status based on currentUser.created_at
  useEffect(() => {
    if (currentUser && currentUser.created_at) {
      const trialStart = new Date(currentUser.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - trialStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        setTrialExpired(true);
        setDaysRemaining(0);
      } else {
        setTrialExpired(false);
        setDaysRemaining(8 - diffDays);
      }
    } else if (currentUser) {
      // Fallback if no created_at (e.g. legacy user), assume trial valid or infinite?
      // For now, let's give them 7 days from "now" effectively or just hide it.
      // Or better, don't show trial banner if no date.
      setDaysRemaining(null);
    }
  }, [currentUser]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- GLOBAL STATE (Database) ---
  const [globalVisits, setGlobalVisits] = useState<Visit[]>([]);
  const [globalStores, setGlobalStores] = useState<Store[]>([]);
  const [globalMerchandisers, setGlobalMerchandisers] = useState<MerchandiserProfile[]>([]);
  const [globalManagers, setGlobalManagers] = useState<ManagerProfile[]>([]);
  const [globalProducts, setGlobalProducts] = useState<Product[]>([]);

  // --- INITIAL DATA FETCHING & REALTIME ---
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
          const merchs: MerchandiserProfile[] = users
            .filter((u: any) => u.role === 'MERCHANDISER')
            .map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              password: u.password,
              phone: u.phone,
              zone: u.zone,
              active: u.active,
              avatarUrl: u.avatar_url,
              manager_id: u.manager_id,
              created_at: u.created_at
            }));
          setGlobalMerchandisers(merchs);

          const managers: ManagerProfile[] = users
            .filter((u: any) => u.role === 'SUPERVISOR' || u.role === 'MANAGER' || u.role === 'ADMIN')
            .map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              password: u.password,
              role: (u.role === 'ADMIN' ? 'ADMIN' : 'SUPERVISOR') as 'SUPERVISOR' | 'ADMIN',
              region: u.zone, // Mapping zone to region for managers
              active: u.active,
              created_at: u.created_at
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

        // 5. Load Visits
        const { data: visits, error: visitError } = await supabase.from('visits').select('*');
        if (visits && !visitError) {
          // We might need to map some fields if DB structure differs slightly from Visit type
          // But assuming direct mapping for now or minimal adjustment
          setGlobalVisits(visits as Visit[]);
        } else {
          setGlobalVisits(MOCK_VISITS);
        }

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

    // Realtime Subscription for Visits
    const subscription = supabase
      .channel('public:visits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, (payload) => {
        console.log('Realtime update:', payload);
        fetchData(); // Re-fetch data on any change
      })
      .subscribe();

    // Listen for Auth Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile from public.users
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userProfile && !error) {
          const role = userProfile.role === 'ADMIN' ? UserRole.ADMIN :
            (userProfile.role === 'SUPERVISOR' || userProfile.role === 'MANAGER') ? UserRole.MANAGER :
              UserRole.MERCHANDISER;

          setRole(role);
          setCurrentUser({
            ...userProfile,
            // Map DB fields to App types if needed
            region: userProfile.zone,
            created_at: userProfile.created_at
          });
          setIsLoggedIn(true);
          setShowLandingPage(false);
        } else {
          console.error("Error fetching user profile:", error);
          // Handle case where auth exists but profile doesn't (maybe trigger failed?)
          // Fallback or show error?
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setShowLandingPage(true);
      }
    });

    return () => {
      supabase.removeChannel(subscription);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- ACTIONS ---

  const handleLogin = async (email: string, pass: string) => {
    // 1. Check Merchandisers (Local State - Legacy/Mock)
    const merch = globalMerchandisers.find(m => m.email.toLowerCase() === email.toLowerCase() && m.password === pass);
    if (merch) {
      setCurrentUser(merch);
      setRole(UserRole.MERCHANDISER);
      setIsLoggedIn(true);
      setShowLandingPage(false);
      return;
    }

    // 2. PRIMARY METHOD: Try Demo User Login via RPC FIRST (avoids rate limiting)
    console.log("🔐 Attempting login with RPC (demo-first approach)...");
    const { data: demoUser, error: demoError } = await supabase.rpc('login_demo_user', {
      email_input: email,
      password_input: pass
    });

    console.log("🔍 RPC Response:", { demoUser, demoError });

    if (demoUser && !demoError) {
      console.log("✅ Demo user logged in via RPC:", demoUser);
      const role = demoUser.role === 'ADMIN' ? UserRole.ADMIN :
        (demoUser.role === 'SUPERVISOR' || demoUser.role === 'MANAGER') ? UserRole.MANAGER :
          UserRole.MERCHANDISER;

      setRole(role);
      setCurrentUser({
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: role,
        region: demoUser.zone,
        active: true,
      } as any);
      setIsLoggedIn(true);
      setShowLandingPage(false);
      return;
    }

    // 3. FALLBACK: Try Supabase Auth (only if RPC failed - for real Auth users)
    console.log("⚠️ RPC login failed, trying Supabase Auth as fallback...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if (error) {
      console.error("❌ Both RPC and Auth login failed:", { demoError, authError: error.message });

      // 4. Final Fallback: Check legacy manual users
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

    // If Supabase Auth successful, the onAuthStateChange listener will handle the state update
    console.log("✅ Logged in via Supabase Auth");
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

  const addVisit = async (newVisit: Visit) => {
    // Save to Supabase
    const { error } = await supabase.from('visits').insert([{
      id: newVisit.id,
      merchandiser_id: newVisit.merchandiserId,
      store_id: newVisit.storeId,
      scheduled_start: newVisit.scheduledStart,
      scheduled_end: newVisit.scheduledEnd,
      status: newVisit.status,
      owner_id: currentUser?.id
    }]);

    if (!error) {
      setGlobalVisits(prev => [...prev, newVisit]);
    } else {
      console.error("Error adding visit:", error);
      alert("Erreur lors de la création de la visite.");
    }
  };

  const addMerchandiser = async (m: MerchandiserProfile) => {
    // Use RPC for demo merchandiser creation to handle password and linking
    // Or if we want to use the standard flow, we'd use auth.signUp but here we want the "demo" flow
    // where the manager creates it.

    // We'll use the RPC we created which handles everything including setting manager_id
    const { error } = await supabase.rpc('create_demo_merchandiser', {
      manager_email: currentUser?.email,
      merch_password: m.password,
      manager_name: currentUser?.name,
      manager_phone: m.phone
    });

    if (!error) {
      // We need to fetch the created user or just add it to state
      // The RPC creates it in DB, so we can add to state
      const newMerch = { ...m, manager_id: currentUser?.id };
      setGlobalMerchandisers(prev => [...prev, newMerch]);
    } else {
      console.error("Error adding merchandiser:", error);
      alert("Erreur lors de la création du merchandiser.");
    }
  };

  const addManager = (m: ManagerProfile) => {
    setGlobalManagers(prev => [...prev, m]);
  };

  const addStore = async (s: Store) => {
    const { error } = await supabase.from('stores').insert([{
      id: s.id,
      name: s.name,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
      owner_id: currentUser?.id
    }]);

    if (!error) {
      setGlobalStores(prev => [...prev, s]);
    } else {
      console.error("Error adding store:", error);
      alert("Erreur lors de la création du magasin.");
    }
  };

  const deleteStore = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce magasin ?')) {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (!error) {
        setGlobalStores(prev => prev.filter(s => s.id !== id));
      } else {
        console.error("Error deleting store:", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const addProduct = async (p: Product) => {
    const { error } = await supabase.from('products').insert([{
      id: p.id,
      brand: p.brand,
      sku: p.sku,
      name: p.name,
      price: p.price,
      stock: p.stock,
      facing: p.facing,
      owner_id: currentUser?.id
    }]);

    if (!error) {
      setGlobalProducts(prev => [...prev, p]);
    } else {
      console.error("Error adding product:", error);
      alert("Erreur lors de la création du produit.");
    }
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