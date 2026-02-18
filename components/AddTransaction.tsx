
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, CategoryDef } from '../types';

interface AddTransactionProps {
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  customCategories: CategoryDef[];
  transactions: Transaction[];
  onQuickAddCategory: (cat: Omit<CategoryDef, 'id'>) => string;
}

const incomeCategories = [
  { id: 'maas', name: 'Maaş', icon: '💰', color: '#22c55e', bg: 'bg-green-500' },
  { id: 'yan_gelir', name: 'Yan Gelir', icon: '🚀', color: '#34d399', bg: 'bg-emerald-400' },
  { id: 'hediye', name: 'Hediye', icon: '🎁', color: '#fbbf24', bg: 'bg-yellow-400' },
  { id: 'diger_gelir', name: 'Diğer', icon: '💳', color: '#60a5fa', bg: 'bg-blue-400' },
];

const AddTransaction: React.FC<AddTransactionProps> = ({ onClose, onSave, customCategories, transactions, onQuickAddCategory }) => {
  const [amount, setAmount] = useState('0');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedCat, setSelectedCat] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');

  useEffect(() => {
    if (type === 'income') {
      setSelectedCat('maas');
    } else {
      if (!selectedCat || !customCategories.some(c => c.id === selectedCat)) {
        setSelectedCat(customCategories[0]?.id || '');
      }
    }
  }, [type, customCategories]);

  const selectedCategoryInfo = useMemo(() => {
    if (type !== 'expense') return null;
    const cat = customCategories.find(c => c.id === selectedCat);
    if (!cat) return null;

    const spent = transactions
      .filter(tx => tx.category === cat.id && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      name: cat.name,
      remaining: cat.initialBudget - spent,
    };
  }, [selectedCat, customCategories, transactions, type]);

  const handleKeyClick = (key: string) => {
    if (key === 'delete') {
      setAmount(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
    } else if (key === ',') {
      if (!amount.includes('.')) setAmount(prev => prev + '.');
    } else {
      setAmount(prev => (prev === '0' ? key : prev + key));
    }
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    onSave({
      amount: numAmount,
      category: selectedCat,
      type: type,
      date: new Date(date).toISOString()
    });
  };

  const handleQuickAdd = () => {
    if (!quickCatName.trim()) return;
    const id = onQuickAddCategory({
      name: quickCatName,
      initialBudget: 1000,
      icon: '📦',
      color: '#3b82f6',
      bg: 'bg-blue-500'
    });
    setSelectedCat(id);
    setQuickCatName('');
    setIsQuickAddOpen(false);
  };

  const activeCategories = type === 'expense' ? customCategories : incomeCategories;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col pt-6 overflow-y-auto no-scrollbar pb-10">
      {/* Üst Navigasyon */}
      <div className="px-6 flex justify-between items-center mb-6">
        <button onClick={onClose} className="p-3 glass-card rounded-2xl text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex bg-slate-800/80 rounded-2xl p-1.5 border border-white/5">
          <button 
            onClick={() => setType('expense')}
            className={`px-8 py-2 rounded-xl text-xs font-bold transition-all ${type === 'expense' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Gider
          </button>
          <button 
            onClick={() => setType('income')}
            className={`px-8 py-2 rounded-xl text-xs font-bold transition-all ${type === 'income' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Gelir
          </button>
        </div>
        <div className="w-12"></div>
      </div>

      {/* Tarih Seçici */}
      <div className="px-8 mb-6">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">İşlem Tarihi</p>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm font-bold text-white outline-none focus:text-blue-400 transition-colors"
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Bugün: {new Date().toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      {/* Tutar Girişi */}
      <div className="text-center mb-6 px-6">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
          {type === 'income' ? 'Toplam Kazanç' : 'Toplam Harcama'}
        </p>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${type === 'income' ? 'text-green-400' : 'text-blue-400'}`}>₺</span>
            <p className={`text-6xl font-extrabold tracking-tighter ${type === 'income' ? 'text-green-400' : 'text-blue-400'}`}>
              {amount}
            </p>
          </div>
          {selectedCategoryInfo && (
            <div className="mt-3 bg-slate-800/40 px-4 py-1.5 rounded-full border border-white/5 animate-in slide-in-from-top-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                {selectedCategoryInfo.name} Kalan: 
                <span className={`ml-1 font-black ${selectedCategoryInfo.remaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₺{selectedCategoryInfo.remaining.toLocaleString('tr-TR')}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KATEGORİ IZGARA (GRID) GÖRÜNÜMÜ */}
      <div className="flex-1 glass-card rounded-t-[3rem] p-8 border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Kategori Seçimi</h3>
             {type === 'expense' && (
               <button 
                 onClick={() => setIsQuickAddOpen(true)}
                 className="text-[10px] text-blue-400 font-black uppercase hover:text-blue-300 transition-colors"
               >
                 + Yeni Kategori
               </button>
             )}
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
            {activeCategories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 border-2 ${selectedCat === cat.id ? `bg-blue-600 border-blue-400 scale-110 shadow-[0_10px_20px_rgba(37,99,235,0.3)]` : 'bg-slate-800/50 text-slate-500 border-white/5 group-hover:bg-slate-800'}`}>
                  {cat.icon}
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight transition-colors truncate w-full ${selectedCat === cat.id ? 'text-white' : 'text-slate-500'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Nümerik Klavye */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'delete'].map((key) => (
            <button 
              key={key}
              onClick={() => handleKeyClick(key)}
              className="h-14 flex items-center justify-center text-2xl font-bold bg-slate-800/20 rounded-2xl hover:bg-slate-700/40 transition-all active:scale-95 border border-white/5"
            >
              {key === 'delete' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 002.828 0L21 9a2 2 0 000-2.828l-6.414-6.414a2 2 0 00-2.828 0L3 12z" />
                </svg>
              ) : key}
            </button>
          ))}
        </div>

        <button 
          onClick={handleSave}
          className={`w-full py-5 rounded-3xl font-black text-white flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl ${type === 'income' ? 'bg-green-600 shadow-green-600/30 hover:bg-green-500' : 'bg-blue-600 shadow-blue-600/30 hover:bg-blue-500'}`}
        >
          {type === 'income' ? 'Kazancı Onayla' : 'Harcamayı Onayla'}
        </button>
      </div>

      {/* Hızlı Kategori Ekleme */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsQuickAddOpen(false)}></div>
          <div className="glass-card relative w-full max-w-sm rounded-[2.5rem] p-10 border-white/20 animate-in zoom-in duration-200">
             <h3 className="text-xl font-black mb-6 text-center text-white">Yeni Kategori</h3>
             <input 
               autoFocus
               type="text"
               value={quickCatName}
               onChange={(e) => setQuickCatName(e.target.value)}
               placeholder="Örn: Tatil"
               className="w-full bg-slate-900/50 border-2 border-white/10 rounded-2xl px-5 py-4 mb-8 text-white focus:border-blue-500 outline-none transition-all font-bold text-center"
             />
             <div className="flex gap-4">
                <button 
                  onClick={() => setIsQuickAddOpen(false)}
                  className="flex-1 py-4 text-slate-500 font-bold"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleQuickAdd}
                  className="flex-[2] bg-blue-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-600/20"
                >
                  Ekle
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTransaction;
