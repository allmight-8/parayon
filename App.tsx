
import React, { useState, useEffect } from 'react';
import { ViewType, Transaction, CategoryDef, UserProfile, NotificationSettings } from './types';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import Budget from './components/Budget';
import Profile from './components/Profile';
import AddTransaction from './components/AddTransaction';
import Registration from './components/Registration';
import BottomNav from './components/BottomNav';
import ScanReceipt from './components/ScanReceipt';

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'yemek', name: 'Yemek', icon: '🍴', initialBudget: 1200, color: '#fb923c', bg: 'bg-orange-400' },
  { id: 'ulasim', name: 'Ulaşım', icon: '🚗', initialBudget: 500, color: '#38bdf8', bg: 'bg-blue-400' },
  { id: 'kira', name: 'Kira', icon: '🏠', initialBudget: 2500, color: '#f87171', bg: 'bg-red-400' },
  { id: 'faturalar', name: 'Faturalar', icon: '🧾', initialBudget: 1500, color: '#a855f7', bg: 'bg-purple-500' },
  { id: 'saglik', name: 'Sağlık', icon: '💊', initialBudget: 300, color: '#10b981', bg: 'bg-emerald-500' },
  { id: 'kisisel_bakim', name: 'Kişisel Bakım', icon: '🧖', initialBudget: 400, color: '#6366f1', bg: 'bg-indigo-500' },
  { id: 'alisveris', name: 'Alışveriş', icon: '🛍️', initialBudget: 800, color: '#f472b6', bg: 'bg-pink-400' },
  { id: 'teknoloji', name: 'Teknoloji', icon: '💻', initialBudget: 1000, color: '#475569', bg: 'bg-slate-600' },
];

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyReminders: true,
  budgetAlerts: true,
  aiInsights: true,
  reminderTime: '20:00'
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('parayon_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentView, setCurrentView] = useState<ViewType>(user ? ViewType.DASHBOARD : ViewType.REGISTRATION);
  const [prevView, setPrevView] = useState<ViewType>(ViewType.DASHBOARD);
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('parayon_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [unassignedBalance, setUnassignedBalance] = useState<number>(() => {
    const saved = localStorage.getItem('parayon_balance');
    return saved ? Number(saved) : 0;
  });
  
  const [categories, setCategories] = useState<CategoryDef[]>(() => {
    const saved = localStorage.getItem('parayon_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('parayon_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    if (user) localStorage.setItem('parayon_user', JSON.stringify(user));
    localStorage.setItem('parayon_transactions', JSON.stringify(transactions));
    localStorage.setItem('parayon_balance', unassignedBalance.toString());
    localStorage.setItem('parayon_categories', JSON.stringify(categories));
    localStorage.setItem('parayon_notifications', JSON.stringify(notifications));
  }, [user, transactions, unassignedBalance, categories, notifications]);

  const handleNavigate = (view: ViewType) => {
    if (view === ViewType.ADD_TRANSACTION || view === ViewType.SCAN) {
      setPrevView(currentView);
    }
    setCurrentView(view);
  };

  const handleRegistrationComplete = (newUser: UserProfile) => {
    setUser(newUser);
    setCurrentView(ViewType.DASHBOARD);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleUpdateNotifications = (settings: NotificationSettings) => {
    setNotifications(settings);
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setTransactions(prev => [tx, ...prev]);
    
    if (tx.type === 'expense') {
      setUnassignedBalance(prev => prev - tx.amount);
    } else {
      setUnassignedBalance(prev => prev + tx.amount);
    }
    
    handleNavigate(ViewType.DASHBOARD);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (!oldTx) return;

    // Önce eski tutarı bakiyeye iade et
    let tempBalance = unassignedBalance;
    if (oldTx.type === 'expense') tempBalance += oldTx.amount;
    else tempBalance -= oldTx.amount;

    // Yeni tutarı uygula
    if (updatedTx.type === 'expense') tempBalance -= updatedTx.amount;
    else tempBalance += updatedTx.amount;

    setUnassignedBalance(tempBalance);
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;

    if (txToDelete.type === 'expense') {
      setUnassignedBalance(prev => prev + txToDelete.amount);
    } else {
      setUnassignedBalance(prev => prev - txToDelete.amount);
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddCategory = (newCat: Omit<CategoryDef, 'id'>) => {
    const cat: CategoryDef = {
      ...newCat,
      id: Math.random().toString(36).substr(2, 9),
    };
    setCategories(prev => [...prev, cat]);
    return cat.id;
  };

  const handleUpdateCategory = (updatedCat: CategoryDef) => {
    setCategories(prev => prev.map(cat => cat.id === updatedCat.id ? updatedCat : cat));
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tüm verileriniz silinecek. Emin misiniz?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderView = () => {
    if (!user) return <Registration onComplete={handleRegistrationComplete} />;

    switch (currentView) {
      case ViewType.DASHBOARD:
        return (
          <Dashboard 
            user={user}
            onAssignClick={() => handleNavigate(ViewType.BUDGET)} 
            balance={unassignedBalance}
            transactions={transactions}
            categories={categories}
          />
        );
      case ViewType.ANALYSIS:
        return (
          <Analysis 
            transactions={transactions} 
            categories={categories} 
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case ViewType.BUDGET:
        return (
          <Budget 
            balance={unassignedBalance} 
            transactions={transactions} 
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case ViewType.PROFILE:
        return (
          <Profile 
            user={user} 
            notifications={notifications}
            onUpdateUser={handleUpdateUser} 
            onUpdateNotifications={handleUpdateNotifications}
            onClearData={handleClearData} 
          />
        );
      case ViewType.ADD_TRANSACTION:
        return (
          <AddTransaction 
            onClose={() => handleNavigate(prevView)} 
            onSave={handleAddTransaction}
            customCategories={categories}
            transactions={transactions}
            onQuickAddCategory={handleAddCategory}
          />
        );
      case ViewType.SCAN:
        return (
          <ScanReceipt 
            categories={categories}
            onSave={handleAddTransaction}
            onClose={() => handleNavigate(prevView)}
          />
        );
      default:
        return <Dashboard user={user} onAssignClick={() => handleNavigate(ViewType.BUDGET)} balance={unassignedBalance} transactions={transactions} categories={categories} />;
    }
  };

  // Tam ekran görünümler (Kamera, Kayıt vb)
  const isFullScreenView = currentView === ViewType.SCAN || currentView === ViewType.REGISTRATION;

  return (
    <div className="relative h-full w-full max-w-md mx-auto bg-[#0f172a] overflow-hidden flex flex-col shadow-2xl">
      <div className={`scroll-container no-scrollbar ${isFullScreenView ? 'p-0 pb-0' : ''}`}>
        {renderView()}
      </div>

      {user && !isFullScreenView && currentView !== ViewType.ADD_TRANSACTION && (
        <>
          <div className="fixed bottom-28 right-6 z-50">
            <button 
              onClick={() => handleNavigate(ViewType.ADD_TRANSACTION)}
              className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg blue-glow flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <BottomNav currentView={currentView} onNavigate={handleNavigate} />
        </>
      )}
    </div>
  );
};

export default App;
