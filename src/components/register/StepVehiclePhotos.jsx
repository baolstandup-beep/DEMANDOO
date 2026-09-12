import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

export const StepVehiclePhotos = ({ data, updateData, onNext }) => {
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const currentPhotos = Array.isArray(data.vehiclePhotos) ? data.vehiclePhotos : [];
    if (file && currentPhotos.length < 5) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData({ vehiclePhotos: [...currentPhotos, reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...(Array.isArray(data.vehiclePhotos) ? data.vehiclePhotos : [])];
    newPhotos.splice(index, 1);
    updateData({ vehiclePhotos: newPhotos });
  };

  const isComplete = (Array.isArray(data.vehiclePhotos) ? data.vehiclePhotos : []).length >= 2;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Photos du Véhicule</h2>
        <p className="text-slate-500 text-sm">Ajoutez au moins 1 photo extérieure et 1 photo intérieure (max 5).</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(Array.isArray(data.vehiclePhotos) ? data.vehiclePhotos : []).map((photo, index) => (
          <div key={index} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            <img src={photo} alt={`Véhicule ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 p-1.5 bg-slate-900/50 backdrop-blur text-white rounded-full hover:bg-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/70 backdrop-blur text-white text-[10px] font-bold rounded-md">
                Principale
              </span>
            )}
          </div>
        ))}
        
        {(Array.isArray(data.vehiclePhotos) ? data.vehiclePhotos : []).length < 5 && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center cursor-pointer transition-colors"
          >
            <Camera className="w-6 h-6 text-slate-400 mb-2" />
            <span className="text-xs font-bold text-slate-500">Ajouter</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!isComplete}
          className="w-full py-4 rounded-2xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Étape suivante
        </button>
        {!isComplete && (
          <p className="text-center text-xs font-bold text-red-500 mt-3">
            Veuillez ajouter au moins 2 photos.
          </p>
        )}
      </div>
    </div>
  );
};
