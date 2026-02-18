
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, NotificationSettings } from '../types';

interface ProfileProps {
  user: UserProfile;
  notifications: NotificationSettings;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onUpdateNotifications: (settings: NotificationSettings) => void;
  onClearData: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, notifications, onUpdateUser, onUpdateNotifications, onClearData }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User Edit State
  const [editFirstName, setEditFirstName] = useState(user.firstName);
  const [editLastName, setEditLastName] = useState(user.lastName);
  const [editEmail, setEditEmail] = useState(user.email);

  // Notifications State
  const [notifState, setNotifState] = useState<NotificationSettings>(notifications);

  useEffect(() => {
    if (isEditModalOpen) {
      setEditFirstName(user.firstName);
      setEditLastName(user.lastName);
      setEditEmail(user.email);
    }
  }, [isEditModalOpen, user]);

  const handleUpdateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName || !editLastName || !editEmail) return;
    onUpdateUser({
      ...user,
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail
    });
    setIsEditModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({
          ...user,
          profileImage: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleNotif = (key: keyof Omit<NotificationSettings, 'reminderTime'>) => {
    const newState = { ...notifState, [key]: !notifState[key] };
    setNotifState(newState);
    onUpdateNotifications(newState);
  };

  const handleTimeChange = (time: string) => {
    const newState = { ...notifState, reminderTime: time };
    setNotifState(newState);
    onUpdateNotifications(newState);
  };

  return (
    <div className="px-6 pt-12 text-center pb-12 animate-in fade-in duration-500">
      <div className="relative inline-block mb-6 group">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-blue-500 shadow-2xl blue-glow mx-auto rotate-3 transition-all hover:rotate-0 duration-500 cursor-pointer relative"
        >
          {user.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <img src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=2563eb&color=fff&size=200`} alt="Profile" className="w-full h-full object-cover" />
          )}
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />

        <div className="absolute -bottom-2 -right-2 bg-green-500 text-[10px] font-bold px-3 py-1.5 rounded-full border-2 border-[#0f172a] text-white flex items-center gap-1.5 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Aktif Kullanıcı
        </div>
      </div>
      
      <h2 className="text-3xl font-black mb-1">{user.firstName} {user.lastName}</h2>
      <p className="text-slate-500 text-sm font-bold mb-8 opacity-80">{user.email}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="glass-card rounded-[1.5rem] p-5 border-white/5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 text-center">Üyelik Tipi</p>
          <p className="text-xs font-black text-blue-400">Ücretsiz Plan</p>
        </div>
        <div className="glass-card rounded-[1.5rem] p-5 border-white/5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 text-center">Veri Konumu</p>
          <p className="text-xs font-black text-green-400">Yerel Bellek</p>
        </div>
      </div>
      
      <div className="space-y-4 text-left">
        <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] pl-4 mb-2">Genel Ayarlar</h3>
        
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="w-full glass-card rounded-2xl p-6 border-white/5 flex justify-between items-center group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
             </div>
             <span className="font-bold text-slate-200">Hesap Bilgilerini Güncelle</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <button 
          onClick={() => setIsNotifModalOpen(true)}
          className="w-full glass-card rounded-2xl p-6 border-white/5 flex justify-between items-center group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
             </div>
             <span className="font-bold text-slate-200">Bildirim Ayarları</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="pt-8 pb-4">
          <h3 className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] pl-4 mb-3">Kritik İşlemler</h3>
          <button 
            onClick={onClearData}
            className="w-full glass-card rounded-2xl p-6 border-red-500/20 flex justify-between items-center group hover:bg-red-500/5 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
               </div>
              <span className="font-bold text-red-400">Verileri Tamamen Sıfırla</span>
            </div>
            <span className="text-[9px] text-red-500/40 font-black uppercase bg-red-500/5 px-2 py-1 rounded-md">Geri Dönülemez</span>
          </button>
        </div>
      </div>

      {/* Hesap Bilgileri Güncelleme Modalı */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="glass-card relative w-full max-w-sm rounded-[2.5rem] p-8 border-white/20 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black mb-6 text-center text-white">Profili Düzenle</h3>
            <form onSubmit={handleUpdateUserSubmit} className="space-y-5">
              <div className="text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5 ml-1">Adınız</label>
                <input 
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>
              <div className="text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5 ml-1">Soyadınız</label>
                <input 
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>
              <div className="text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5 ml-1">E-Posta</label>
                <input 
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 text-slate-500 font-bold active:scale-95 transition-transform"
                >
                  Vazgeç
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-blue-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-transform"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bildirim Ayarları Modalı */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsNotifModalOpen(false)}></div>
          <div className="glass-card relative w-full max-w-sm rounded-[2.5rem] p-8 border-white/20 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-white">Bildirimler</h3>
               <button onClick={() => setIsNotifModalOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
            </div>

            <div className="space-y-6">
              {/* Daily Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-200">Günlük Hatırlatıcı</p>
                  <p className="text-[10px] text-slate-500">İşlemlerini kaydetmen için akşamları bildirim gönderilir.</p>
                </div>
                <button 
                  onClick={() => handleToggleNotif('dailyReminders')}
                  className={`w-12 h-6 rounded-full transition-all relative ${notifState.dailyReminders ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifState.dailyReminders ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Time Selection (visible only if daily is on) */}
              {notifState.dailyReminders && (
                <div className="bg-slate-900/40 p-3 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Hatırlatma Saati</span>
                  <input 
                    type="time" 
                    value={notifState.reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="bg-transparent text-sm font-black text-blue-400 outline-none"
                  />
                </div>
              )}

              {/* Budget Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-200">Bütçe Uyarıları</p>
                  <p className="text-[10px] text-slate-500">Kategori limitin %80'e ulaştığında seni uyarırız.</p>
                </div>
                <button 
                  onClick={() => handleToggleNotif('budgetAlerts')}
                  className={`w-12 h-6 rounded-full transition-all relative ${notifState.budgetAlerts ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifState.budgetAlerts ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {/* AI Financial Insights */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-200">AI Akıllı Öneriler</p>
                  <p className="text-[10px] text-slate-500">Haftalık harcama analizlerine dayalı AI ipuçları al.</p>
                </div>
                <button 
                  onClick={() => handleToggleNotif('aiInsights')}
                  className={`w-12 h-6 rounded-full transition-all relative ${notifState.aiInsights ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifState.aiInsights ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="mt-10">
               <button 
                 onClick={() => setIsNotifModalOpen(false)}
                 className="w-full bg-slate-800 py-4 rounded-2xl font-black text-white hover:bg-slate-700 transition-colors"
               >
                 Tamam
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
