import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { compressImage } from '../../lib/imageCompressor';

export const StepDriverPhoto = ({ data, updateData, onNext }) => {
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsProcessing(true);
        const compressedBase64 = await compressImage(file, 500, 500, 0.75);
        updateData({ avatarBase64: compressedBase64 });
      } catch (err) {
        console.warn("Erreur compression image, fallback reader:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          updateData({ avatarBase64: reader.result });
        };
        reader.readAsDataURL(file);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePhoto = () => {
    updateData({ avatarBase64: null });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Votre photo de profil</h2>
        <p className="text-slate-500 text-sm">Elle sera visible publiquement par les passagers sur vos annonces.</p>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2rem] border border-slate-200 border-dashed">
        {data.avatarBase64 ? (
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img src={data.avatarBase64} alt="Aperçu" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlaceholder />
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
            />
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button 
                type="button"
                onClick={triggerFileSelect}
                className="flex-1 min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98]"
              >
                <ImageIcon className="w-5 h-5 text-slate-400" />
                Importer une photo
              </button>
              
              <button 
                type="button"
                onClick={triggerFileSelect}
                className="flex-1 min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 bg-demandoo-50 text-demandoo-600 rounded-xl font-bold hover:bg-demandoo-100 transition-colors active:scale-[0.98]"
              >
                <Camera className="w-5 h-5" />
                Prendre une photo
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!data.avatarBase64}
        className="w-full py-4 rounded-2xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Étape suivante
      </button>
    </div>
  );
};

const UserPlaceholder = () => (
  <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);
