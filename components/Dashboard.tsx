
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { getFinancialInsight } from '../services/geminiService';
import { Transaction, UserProfile, CategoryDef } from '../types';

interface DashboardProps {
  user: UserProfile;
  onAssignClick: () => void;
  balance: number;
  transactions: Transaction[];
  categories: CategoryDef[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-2 rounded-xl border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-black text-blue-400">₺{payload[0].value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ user, onAssignClick, balance, transactions, categories }) => {
  const [aiTip, setAiTip] = useState<string>("Bütçe analiziniz hazırlanıyor...");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Calendar navigation
  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  // Calendar logic
  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Turkish day ordering (Mon-Sun)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [selectedDate]);

  const transactionsOnSelectedDay = useMemo(() => {
    const selDateStr = selectedDate.toISOString().split('T')[0];
    return transactions.filter(tx => tx.date.split('T')[0] === selDateStr);
  }, [transactions, selectedDate]);

  const weeklyData = useMemo(() => {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: days[d.getDay()], 
        dateStr: d.toISOString().split('T')[0],
        value: 0 
      };
    });

    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const txDate = tx.date.split('T')[0];
        const day = last7Days.find(d => d.dateStr === txDate);
        if (day) day.value += tx.amount;
      }
    });

    return last7Days;
  }, [transactions]);

  const totalSpentThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return transactions
      .filter(tx => tx.type === 'expense' && tx.date >= startOfMonth)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  useEffect(() => {
    const fetchTip = async () => {
      const tip = await getFinancialInsight(balance, totalSpentThisMonth);
      setAiTip(tip || "");
    };
    fetchTip();
  }, [balance, totalSpentThisMonth]);

  const getDayStatus = (day: Date) => {
    const dStr = day.toISOString().split('T')[0];
    const dayTxs = transactions.filter(tx => tx.date.split('T')[0] === dStr);
    const hasExpense = dayTxs.some(tx => tx.type === 'expense');
    const hasIncome = dayTxs.some(tx => tx.type === 'income');
    return { hasExpense, hasIncome };
  };

  const avatarSrc = user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=2563eb&color=fff`;

  return (
    <div className="px-6 pt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30">
            <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hoş Geldin</p>
            <h2 className="text-base font-bold">{user.firstName} {user.lastName}</h2>
          </div>
        </div>
        <button 
          onClick={handleGoToToday}
          className="p-3 glass-card rounded-2xl text-slate-400 hover:text-white transition-colors group flex items-center gap-2"
          title="Bugüne Git"
        >
          <span className="text-[10px] font-black uppercase hidden group-hover:block">Bugün</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Bakiyeniz */}
      <div className="text-center mb-10">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Genel Bakiyeniz</p>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-6">
          ₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </h1>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onAssignClick}
            className="bg-blue-600 px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-transform"
          >
            Bütçe Planla
          </button>
        </div>
      </div>

      {/* Takvim Bölümü */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-sm font-bold">Aktivite Takvimi</h3>
           <div className="flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-white/5">
              <button 
                onClick={handlePrevMonth}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <p className="text-[10px] text-slate-200 font-black uppercase tracking-widest min-w-[100px] text-center">
                {selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </p>
              <button 
                onClick={handleNextMonth}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
           </div>
        </div>
        <div className="glass-card rounded-3xl p-5 border-white/5 shadow-inner">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Pt', 'Sa', 'Çr', 'Pr', 'Cu', 'Ct', 'Pz'].map(d => (
              <span key={d} className="text-[10px] text-slate-600 font-black text-center">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-10"></div>;
              
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = day.toDateString() === selectedDate.toDateString();
              const { hasExpense, hasIncome } = getDayStatus(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-10 relative flex items-center justify-center rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : isToday ? 'bg-slate-800 text-blue-400 border border-blue-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}
                >
                  {day.getDate()}
                  <div className="absolute bottom-1.5 flex gap-0.5">
                    {hasIncome && <div className="w-1 h-1 bg-green-400 rounded-full"></div>}
                    {hasExpense && <div className="w-1 h-1 bg-red-400 rounded-full"></div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seçili Gün İşlemleri */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-sm font-bold">Günün İşlemleri</h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase">{selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="space-y-3">
          {transactionsOnSelectedDay.length > 0 ? (
            transactionsOnSelectedDay.map(tx => {
              const cat = categories.find(c => c.id === tx.category);
              return (
                <div key={tx.id} className="glass-card rounded-2xl p-4 flex items-center justify-between border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${tx.type === 'income' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800'}`}>
                      {tx.type === 'income' ? '💰' : (cat?.icon || '💳')}
                    </div>
                    <div>
                       <p className="text-xs font-bold text-white">{tx.type === 'income' ? 'Kazanç' : (cat?.name || 'Gider')}</p>
                       <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">İşlem Onaylandı {tx.note ? `• ${tx.note}` : ''}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-black ${tx.type === 'income' ? 'text-green-400' : 'text-slate-200'}`}>
                    {tx.type === 'income' ? '+' : '-'}₺{tx.amount.toLocaleString('tr-TR')}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center border-2 border-dashed border-slate-800 rounded-2xl">
               <p className="text-[10px] text-slate-600 font-bold uppercase">Bu güne ait bir işlem bulunmuyor</p>
            </div>
          )}
        </div>
      </div>

      {/* Haftalık Grafik */}
      <div className="mb-10">
        <h3 className="text-sm font-bold mb-4">Harcama Akışı</h3>
        <div className="h-56 glass-card rounded-3xl p-5 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Önerisi */}
      <div className="glass-card rounded-3xl p-6 border-blue-500/20 flex gap-4 items-start mb-10">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
          "{aiTip}"
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
