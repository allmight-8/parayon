
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, CategoryDef } from '../types';

interface BudgetProps {
  balance: number;
  transactions: Transaction[];
  categories: CategoryDef[];
  onAddCategory: (cat: Omit<CategoryDef, 'id'>) => void;
  onUpdateCategory: (cat: CategoryDef) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const Budget: React.FC<BudgetProps> = ({ 
  balance, 
  transactions, 
  categories, 
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDef | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Category Form State
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newIcon, setNewIcon] = useState('📦');

  // Transaction Edit Form State
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxNote, setEditTxNote] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setNewName(editingCategory.name);
      setNewLimit(editingCategory.initialBudget.toString());
      setNewIcon(editingCategory.icon);
    } else {
      setNewName('');
      setNewLimit('');
      setNewIcon('📦');
    }
  }, [editingCategory]);

  const budgetData = useMemo(() => {
    return categories.map(cat => {
      const spent = transactions
        .filter(tx => tx.category === cat.id && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const available = cat.initialBudget - spent;
      return {
        ...cat,
        spent,
        available,
        percent: cat.initialBudget > 0 ? Math.min(100, (spent / cat.initialBudget) * 100) : 0
      };
    });
  }, [transactions, categories]);

  const categoryTransactions = useMemo(() => {
    if (!selectedCategoryId) return [];
    return transactions
      .filter(tx => tx.category === selectedCategoryId && tx.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedCategoryId]);

  const selectedCategoryInfo = useMemo(() => {
    return budgetData.find(c => c.id === selectedCategoryId);
  }, [budgetData, selectedCategoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLimit) return;
    
    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        name: newName,
        initialBudget: parseFloat(newLimit),
        icon: newIcon,
      });
    } else {
      onAddCategory({
        name: newName,
        initialBudget: parseFloat(newLimit),
        icon: newIcon,
        color: '#3b82f6',
        bg: 'bg-blue-500'
      });
    }

    setNewName('');
    setNewLimit('');
    setNewIcon('📦');
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleEditCategory = (e: React.MouseEvent, item: CategoryDef) => {
    e.stopPropagation(); // Drill-down'ı engelle
    setEditingCategory(item);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Drill-down'ı engelle
    onDeleteCategory(id);
  };

  const handleStartEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setEditTxAmount(tx.amount.toString());
    setEditTxDate(tx.date.split('T')[0]);
    setEditTxNote(tx.note || '');
  };

  const handleSaveTxEdit = () => {
    if (!editingTx) return;
    const numAmount = parseFloat(editTxAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onUpdateTransaction({
      ...editingTx,
      amount: numAmount,
      date: new Date(editTxDate).toISOString(),
      note: editTxNote
    });
    setEditingTx(null);
  };

  const handleDeleteTx = (id: string) => {
    if (window.confirm('Bu harcamayı silmek istediğinize emin misiniz?')) {
      onDeleteTransaction(id);
    }
  };

  const icons = ['🍕', '🚕', '👕', '🏠', '🎮', '💡', '💊', '🎓', '💪', '🌴', '📦', '🎁'];

  // Detail View Rendering
  if (selectedCategoryId && selectedCategoryInfo) {
    return (
      <div className="px-6 pt-8 animate-in slide-in-from-right duration-300 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setSelectedCategoryId(null)}
            className="p-3 glass-card rounded-2xl text-slate-400 active:scale-90 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-black">{selectedCategoryInfo.name} Bütçesi</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kategori Detayları</p>
          </div>
        </div>

        {/* Bütçe Kartı */}
        <div className="glass-card rounded-[2.5rem] p-8 mb-8 border-white/10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Kalan Bütçe</p>
              <p className={`text-4xl font-black ${selectedCategoryInfo.available > 0 ? 'text-white' : 'text-red-400'}`}>
                ₺{selectedCategoryInfo.available.toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl">
              {selectedCategoryInfo.icon}
            </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-end">
               <span className="text-xs text-slate-500 font-bold">Harcanan: ₺{selectedCategoryInfo.spent.toLocaleString('tr-TR')}</span>
               <span className="text-xs text-slate-400 font-black">₺{selectedCategoryInfo.initialBudget.toLocaleString('tr-TR')}</span>
             </div>
             <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${selectedCategoryInfo.percent > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${selectedCategoryInfo.percent}%` }}
                />
             </div>
          </div>
        </div>

        {/* Harcama Listesi */}
        <div className="space-y-4">
          <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4 pl-2">Harcama Geçmişi</h3>
          {categoryTransactions.length > 0 ? (
            categoryTransactions.map((tx) => (
              <div key={tx.id} className="glass-card rounded-2xl p-5 border-white/5 relative group">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleStartEditTx(tx)}
                    className="p-2 bg-blue-500/10 rounded-lg text-blue-400 hover:bg-blue-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteTx(tx.id)}
                    className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="pr-20">
                  <p className="text-xs font-bold text-white mb-1">
                    {new Date(tx.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xl font-black text-slate-200">₺{tx.amount.toLocaleString('tr-TR')}</p>
                  {tx.note && <p className="text-[11px] text-slate-500 mt-2 italic leading-relaxed">"{tx.note}"</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center glass-card rounded-[2.5rem] border-dashed border-white/5">
              <p className="text-slate-500 text-sm">Bu kategoride henüz bir harcama yok.</p>
            </div>
          )}
        </div>

        {/* İşlem Düzenleme Modalı */}
        {editingTx && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingTx(null)}></div>
            <div className="glass-card relative w-full max-w-sm rounded-[2.5rem] p-8 border-white/20 animate-in zoom-in duration-300">
              <h3 className="text-xl font-black mb-6 text-center text-white">Harcamayı Düzenle</h3>
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tutar</label>
                  <input 
                    type="number" 
                    value={editTxAmount}
                    onChange={(e) => setEditTxAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tarih</label>
                  <input 
                    type="date" 
                    value={editTxDate}
                    onChange={(e) => setEditTxDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Not</label>
                  <input 
                    type="text" 
                    value={editTxNote}
                    onChange={(e) => setEditTxNote(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setEditingTx(null)} className="flex-1 py-4 text-slate-500 font-bold">İptal</button>
                <button onClick={handleSaveTxEdit} className="flex-[2] bg-blue-600 py-4 rounded-2xl font-black text-white">Güncelle</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black">Bütçe Yönetimi</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kategorilere tıklayarak detayları gör</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
           ₺{balance.toLocaleString('tr-TR')} Boşta
        </div>
      </div>

      <div className="space-y-4">
        {budgetData.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedCategoryId(item.id)}
            className="glass-card rounded-2xl p-5 border-white/5 relative group transition-all hover:bg-slate-800/80 cursor-pointer active:scale-[0.98]"
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => handleEditCategory(e, item)}
                className="p-2 bg-slate-700/50 rounded-xl text-slate-300 hover:text-white"
                title="Düzenle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={(e) => handleDeleteCategory(e, item.id)}
                className="p-2 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500/20"
                title="Sil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-3 pr-20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-bold text-lg">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Kalan</p>
                <p className={`text-xl font-black ${item.available > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₺{item.available.toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">
                   <span>Harcandı: ₺{item.spent.toLocaleString('tr-TR')}</span>
                   <span>Bütçe: ₺{item.initialBudget.toLocaleString('tr-TR')}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${item.percent > 90 ? 'bg-red-500' : 'bg-blue-600'}`} 
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 mb-4">
         <button 
           onClick={() => {
             setEditingCategory(null);
             setIsModalOpen(true);
           }}
           className="w-full border-2 border-dashed border-slate-800 py-4 rounded-2xl text-slate-500 font-bold hover:border-slate-500 hover:text-slate-300 transition-all flex items-center justify-center gap-2"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Yeni Kategori Ekle
         </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}></div>
          <div className="glass-card relative w-full max-w-sm rounded-[2.5rem] p-8 border-white/20 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black mb-6 text-center text-white">
              {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5 ml-1">Kategori Adı</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white font-bold"
                  placeholder="Örn: Ev Giderleri"
                />
              </div>
              <div className="text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5 ml-1">Aylık Bütçe (₺)</label>
                <input 
                  type="number" 
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white font-bold"
                  placeholder="0.00"
                />
              </div>
              <div className="text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4 ml-1">İkon Seç</label>
                <div className="flex flex-wrap gap-3 justify-center max-h-32 overflow-y-auto no-scrollbar p-1">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${newIcon === icon ? 'bg-blue-600 scale-110 shadow-lg shadow-blue-600/30' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold">Vazgeç</button>
                 <button 
                    type="submit"
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-white shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                  >
                    {editingCategory ? 'Güncelle' : 'Kaydet'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
