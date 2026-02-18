
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Transaction, CategoryDef } from '../types';

interface AnalysisProps {
  transactions: Transaction[];
  categories: CategoryDef[];
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const Analysis: React.FC<AnalysisProps> = ({ transactions, categories, onUpdateTransaction, onDeleteTransaction }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form states for editing
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const chartData = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExpense = 0;

    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
        totalExpense += tx.amount;
      }
    });

    return Object.entries(totals).map(([catId, val]) => {
      const catDef = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: catDef?.name || catId,
        value: val,
        percentage: totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0,
        color: catDef?.color || '#3b82f6',
        icon: catDef?.icon || '💰',
        bg: catDef?.bg || 'bg-blue-500'
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const totalSpent = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Seçili kategoriye ait harcamalar
  const categoryTransactions = useMemo(() => {
    if (!selectedCategoryId) return [];
    return transactions
      .filter(tx => tx.type === 'expense' && tx.category === selectedCategoryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedCategoryId]);

  const selectedCategoryInfo = useMemo(() => {
    return chartData.find(c => c.id === selectedCategoryId);
  }, [chartData, selectedCategoryId]);

  const handleStartEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditDate(tx.date.split('T')[0]);
    setEditNote(tx.note || '');
    setEditCategory(tx.category);
  };

  const handleSaveEdit = () => {
    if (!editingTx) return;
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onUpdateTransaction({
      ...editingTx,
      amount: numAmount,
      date: new Date(editDate).toISOString(),
      note: editNote,
      category: editCategory
    });
    setEditingTx(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu harcamayı silmek istediğinize emin misiniz?')) {
      onDeleteTransaction(id);
    }
  };

  if (selectedCategoryId && selectedCategoryInfo) {
    return (
      <div className="px-6 pt-8 animate-in slide-in-from-right duration-300 pb-20">
        {/* Detay Header */}
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
            <h2 className="text-xl font-black">{selectedCategoryInfo.name} Detayları</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Harcama Geçmişi</p>
          </div>
        </div>

        {/* Kategori Özeti */}
        <div className="glass-card rounded-3xl p-6 mb-8 border-white/10 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Toplam Harcanan</p>
            <p className="text-3xl font-black text-white">₺{selectedCategoryInfo.value.toLocaleString('tr-TR')}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
            {selectedCategoryInfo.icon}
          </div>
        </div>

        {/* İşlem Listesi */}
        <div className="space-y-4">
          <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4 pl-2">Tüm İşlemler</h3>
          {categoryTransactions.length > 0 ? (
            categoryTransactions.map((tx) => (
              <div key={tx.id} className="glass-card rounded-2xl p-5 border-white/5 flex flex-col gap-2 relative group">
                {/* Aksiyon Butonları (Hover durumunda görünür) */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleStartEdit(tx)}
                    className="p-2 bg-blue-500/10 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                    title="Düzenle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(tx.id)}
                    className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Sil"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="flex justify-between items-start pr-20">
                  <div>
                    <p className="text-xs font-bold text-white">
                      {new Date(tx.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {tx.note && (
                      <p className="text-[11px] text-slate-400 mt-1 italic leading-relaxed">"{tx.note}"</p>
                    )}
                  </div>
                  <p className="text-base font-black text-slate-200">-₺{tx.amount.toLocaleString('tr-TR')}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2 py-0.5 rounded-md bg-slate-800 text-[8px] font-black uppercase text-slate-500 tracking-tighter">
                    Onaylandı
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-blue-500/10 text-[8px] font-black uppercase text-blue-400 tracking-tighter">
                    {selectedCategoryInfo.name}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center glass-card rounded-3xl border-dashed border-white/5">
              <p className="text-slate-500 text-sm">Bu kategoride henüz bir işlem yok.</p>
            </div>
          )}
        </div>

        {/* Düzenleme Modalı */}
        {editingTx && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingTx(null)}></div>
            <div className="glass-card relative w-full max-w-sm rounded-[2rem] p-8 border-white/20 animate-in zoom-in duration-300">
              <h3 className="text-xl font-black mb-6 text-center text-white">İşlemi Düzenle</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Tutar (₺)</label>
                  <input 
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Tarih</label>
                  <input 
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Kategori</label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Not</label>
                  <input 
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="İşlem notu..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-4 text-slate-500 font-bold"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="flex-[2] bg-blue-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-transform"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-20">
      {/* Month Selector */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-6 mb-2">
          <h2 className="text-xl font-bold">Güncel Durum</h2>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tüm Zamanlar Analizi</p>
      </div>

      {/* Donut Chart */}
      <div className="relative h-64 w-full flex items-center justify-center mb-8">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-center px-4">
             Henüz harcama verisi yok
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Toplam Harcama</p>
          <p className="text-3xl font-extrabold">₺{totalSpent.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {/* Insight Banner */}
      {chartData.length > 0 && (
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 mb-8 border-blue-500/10">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            En çok harcama <span className="text-blue-400 font-bold">{chartData[0].name}</span> kategorisinde yapıldı. Detaylar için listeye tıkla.
          </p>
        </div>
      )}

      {/* Breakdown */}
      <div className="mb-8">
        <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4">Harcama Detayları</h3>
        <div className="space-y-3">
          {chartData.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategoryId(cat.id)}
              className="w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-slate-800/80 transition-all active:scale-[0.98] text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                  {cat.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{cat.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Toplam harcamanın %{cat.percentage}'i</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="font-bold text-sm">₺{cat.value.toLocaleString('tr-TR')}</p>
                <div className="w-20 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${cat.bg} rounded-full transition-all duration-1000`} 
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
          
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-dashed border-green-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">
                💵
              </div>
              <div>
                <h4 className="font-bold text-sm">Toplam Gelir</h4>
                <p className="text-[10px] text-slate-500 font-medium">Sisteme giren toplam miktar</p>
              </div>
            </div>
            <p className="font-bold text-green-400">₺{totalIncome.toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
