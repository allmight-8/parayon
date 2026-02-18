
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface RegistrationProps {
  onComplete: (user: UserProfile) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onComplete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;
    onComplete({ firstName, lastName, email, profileImage });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-8 py-12 overflow-y-auto no-scrollbar">
      {/* Profil Fotoğrafı Seçimi */}
      <div className="relative mb-10 group">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-4 border-blue-600/30 flex items-center justify-center overflow-hidden cursor-pointer shadow-2xl transition-transform hover:scale-105 active:scale-95"
        >
          {profileImage ? (
            <img src={profileImage} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-500">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-black uppercase">Foto Ekle</span>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
        <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl border-4 border-[#0f172a] text-white">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-black mb-2">ParaYon'a Hoş Geldiniz</h1>
        <p className="text-slate-500 text-sm">Finansal yolculuğunuza başlamak için bilgilerinizi kaydedin.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 ml-1">Adınız</label>
            <input 
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-semibold"
              placeholder="Örn: Can"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 ml-1">Soyadınız</label>
            <input 
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-semibold"
              placeholder="Örn: Yılmaz"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 ml-1">E-Posta Adresiniz</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-semibold"
              placeholder="can@example.com"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-3xl font-black text-lg text-white shadow-2xl shadow-blue-600/30 transition-all active:scale-95 mt-4"
        >
          Hadi Başlayalım
        </button>
      </form>
    </div>
  );
};

export default Registration;
