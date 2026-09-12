import React, { useRef } from 'react';
import { FileCheck, Shield, UploadCloud, CheckCircle } from 'lucide-react';

export const StepDocuments = ({ data, updateData, onNext }) => {
  const licenseFrontRef = useRef(null);
  const licenseBackRef = useRef(null);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData({ [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Vérification & Assurance</h2>
        <p className="text-slate-500 text-sm">Vos documents restent strictement confidentiels.</p>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-4 flex gap-4 items-start border border-emerald-100 mb-8">
        <Shield className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-700 font-medium">
          Ces documents ne seront jamais affichés publiquement. Les passagers verront uniquement un badge "Permis vérifié" sur votre profil public.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
            Permis de conduire (Recto) *
          </label>
          <div 
            onClick={() => licenseFrontRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${data.licenseFrontBase64 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
          >
            {data.licenseFrontBase64 ? (
              <div className="flex flex-col items-center text-emerald-600">
                <CheckCircle className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">Document ajouté</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <UploadCloud className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">Appuyez pour importer</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={licenseFrontRef}
              onChange={(e) => handleFileChange(e, 'licenseFrontBase64')}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
            Permis de conduire (Verso)
          </label>
          <div 
            onClick={() => licenseBackRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${data.licenseBackBase64 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
          >
            {data.licenseBackBase64 ? (
              <div className="flex flex-col items-center text-emerald-600">
                <CheckCircle className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">Document ajouté</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <UploadCloud className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">Appuyez pour importer</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={licenseBackRef}
              onChange={(e) => handleFileChange(e, 'licenseBackBase64')}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!data.licenseFrontBase64}
        className="w-full mt-8 py-4 rounded-2xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Étape suivante
      </button>
    </div>
  );
};
