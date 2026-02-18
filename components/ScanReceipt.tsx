
import React, { useRef, useState, useEffect } from 'react';
import { CategoryDef, Transaction } from '../types';
import { analyzeReceipt } from '../services/geminiService';

interface ScanReceiptProps {
  categories: CategoryDef[];
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const ScanReceipt: React.FC<ScanReceiptProps> = ({ categories, onSave, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Bileşen kapandığında kamerayı mutlaka kapat
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Stream değiştiğinde ve kamera aktifse video elementine bağla
  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraActive]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Kamera başlatılamadı:", err);
      if (err.name === 'NotAllowedError') {
        setCameraError("Kamera izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.");
      } else {
        setCameraError("Kamera başlatılamadı. Cihazınızda kamera olduğundan emin olun.");
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        
        setCapturedImage(dataUrl);
        stopCamera();
        processImage(base64);
      }
    }
  };

  const processImage = async (base64: string) => {
    setIsProcessing(true);
    try {
      const result = await analyzeReceipt(base64, categories);
      if (result) {
        setScannedData(result);
      } else {
        alert("Fiş analiz edilemedi. Lütfen daha net bir fotoğraf çekin.");
        setIsCameraActive(false);
        setCapturedImage(null);
      }
    } catch (error) {
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsCameraActive(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (scannedData) {
      onSave({
        amount: scannedData.amount,
        category: scannedData.categoryId,
        date: scannedData.date,
        type: 'expense',
        note: scannedData.note
      });
    }
  };

  // 1. Durum: Henüz kamera başlatılmadı (Hazırlık Ekranı)
  if (!isCameraActive && !isProcessing && !scannedData) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col p-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-12">
          <button onClick={onClose} className="p-3 glass-card rounded-2xl text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Akıllı Tarayıcı</h2>
          <div className="w-12"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-6xl mb-8 blue-glow">
            🧾
          </div>
          <h1 className="text-3xl font-black mb-4">Harcamanı Tara</h1>
          <p className="text-slate-500 text-sm mb-12 max-w-[280px] leading-relaxed">
            Fişinizi veya faturanıza ait fotoğrafı çekin, AI teknolojisi ile harcamalarınızı saniyeler içinde kaydedelim.
          </p>
          
          <div className="w-full space-y-4 max-w-[280px]">
            <div className="flex items-center gap-4 text-left glass-card p-4 rounded-2xl border-white/5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs">1</div>
              <p className="text-[11px] font-bold text-slate-300">Fişi düz bir zemine koyun.</p>
            </div>
            <div className="flex items-center gap-4 text-left glass-card p-4 rounded-2xl border-white/5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs">2</div>
              <p className="text-[11px] font-bold text-slate-300">Işığın yeterli olduğundan emin olun.</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <button 
            onClick={startCamera}
            className="w-full bg-blue-600 py-5 rounded-3xl font-black text-white shadow-2xl shadow-blue-600/30 active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Tarayıcıyı Başlat
          </button>
          <p className="text-center text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-widest">Kamera Erişimi İstenecektir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Üst Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-white font-black uppercase tracking-widest text-sm">Tarayıcı Aktif</h2>
        <div className="w-12"></div>
      </div>

      {/* Kamera Ekranı (Aktifken) */}
      {isCameraActive && !scannedData && !isProcessing && (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          {cameraError ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-white font-bold mb-6">{cameraError}</p>
              <button 
                onClick={startCamera}
                className="bg-blue-600 px-6 py-3 rounded-xl font-bold text-white"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-3/5 border-2 border-dashed border-white/50 rounded-3xl relative">
                   <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                   <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                   <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
              </div>
              
              <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6">
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white rounded-full p-1.5 shadow-2xl active:scale-90 transition-transform"
                >
                  <div className="w-full h-full border-4 border-black/10 rounded-full flex items-center justify-center">
                     <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* İşleme Ekranı */}
      {isProcessing && (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0f172a] p-10 text-center animate-pulse">
          <div className="w-24 h-24 mb-8 relative">
            <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
          </div>
          <h3 className="text-2xl font-black mb-3 text-white">AI Analiz Ediyor</h3>
          <p className="text-slate-500 text-sm">Görüntü işleniyor, lütfen bekleyin...</p>
        </div>
      )}

      {/* Sonuç Ekranı */}
      {scannedData && !isProcessing && (
        <div className="flex-1 bg-[#0f172a] p-8 overflow-y-auto no-scrollbar pb-32">
          <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl">
            <img src={capturedImage!} alt="Fiş" className="w-full h-full object-cover" />
          </div>
          
          <div className="glass-card rounded-[2.5rem] p-8 space-y-6 border-white/10 animate-in slide-in-from-bottom-10">
            <div className="text-center mb-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Mağaza</p>
              <h3 className="text-2xl font-black text-white">{scannedData.storeName || 'Bilinmeyen'}</h3>
            </div>

            <div className="flex justify-between items-center py-4 border-y border-white/5">
               <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Tutar</p>
                 <p className="text-3xl font-black text-blue-400">₺{scannedData.amount.toLocaleString('tr-TR')}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Tarih</p>
                 <p className="text-sm font-bold text-slate-200">
                   {scannedData.date ? new Date(scannedData.date).toLocaleDateString('tr-TR') : '-'}
                 </p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl">
                 {categories.find(c => c.id === scannedData.categoryId)?.icon || '📦'}
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Kategori</p>
                 <p className="font-bold text-white">{categories.find(c => c.id === scannedData.categoryId)?.name || 'Diğer'}</p>
               </div>
            </div>

            <div className="flex gap-4 pt-4">
               <button 
                 onClick={() => { setScannedData(null); setCapturedImage(null); startCamera(); }}
                 className="flex-1 py-4 text-slate-500 font-bold bg-slate-800/50 rounded-2xl active:scale-95 transition-transform"
               >
                 Yeniden
               </button>
               <button 
                 onClick={handleConfirm}
                 className="flex-[2] bg-blue-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-transform"
               >
                 Kaydet
               </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ScanReceipt;
