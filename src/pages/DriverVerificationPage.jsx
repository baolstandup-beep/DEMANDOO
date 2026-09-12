import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { VerifiedDriverBadge } from '../components/common/Badge';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Lock, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  Car,
  Camera,
  AlertCircle
} from 'lucide-react';

export const DriverVerificationPage = () => {
  const { user, updateDriverStatus, completeDriverOnboarding } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  // Redirect if passenger or already ACTIVE
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'passenger') {
      navigate('/');
    } else if (user.driver_status === 'VERIFIED' && user.is_driver_active) {
      // Chauffeur déjà vérifié et actif → espace chauffeur
      navigate('/espace-chauffeur');
    }
  }, [user, navigate]);

  const getInitialStep = () => {
    if (user?.driver_status === 'UNDER_REVIEW' || user?.driver_status === 'PENDING_VERIFICATION') return 6; // Status waiting screen
    if (user?.driver_status === 'ACTION_REQUIRED') return 1; // Can add a specific logic to jump to rejected step
    return 1;
  };

  const [step, setStep] = useState(getInitialStep());
  
  // Étape 1 : Infos Personnelles
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.full_name || '',
    dob: '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: '',
    address: '',
    profilePhoto: null
  });



  // Étape 3 : Permis
  const [licenseInfo, setLicenseInfo] = useState({
    number: '',
    issueDate: '',
    expireDate: '',
    licenseFront: null,
    licenseBack: null
  });

  // Étape 4 : Véhicule
  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    seats: 4,
    plate: '',
    hasAircon: false,
    acceptsLuggage: true,
    nonSmoking: true
  });

  // Étape 5 : Documents Véhicule
  const [vehicleDocs, setVehicleDocs] = useState({
    registration: null,
    insurance: null,
    insuranceExpireDate: '',
    vehicleFront: null,
    vehicleBack: null,
    vehicleInterior: null
  });

  // Étape 6 : Validation finale
  const [certify, setCertify] = useState(false);

  const handleNext = () => setStep(s => Math.min(s + 1, 6));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certify) {
      addNotification({
        title: "Certification requise",
        message: "Vous devez certifier l'exactitude de vos informations.",
        type: "error"
      });
      return;
    }
    // Execute Server-Side Verification Simulation
    const result = await completeDriverOnboarding({
      personalInfo,
      licenseInfo,
      vehicleDocs,
      vehicleInfo
    });

    if (!result.success) {
      addNotification({
        title: "Dossier incomplet",
        message: result.error,
        type: "error"
      });
      // Optionally show the missing elements in UI or keep them on step 6
      return;
    }
    
    // Success: Driver is automatically active!
    setStep(6);
    
    addNotification({
      title: "Compte activé !",
      message: "Félicitations, votre compte chauffeur est actif.",
      type: "success"
    });
  };

  const renderProgressBar = () => {
    const titles = [
      "Infos",
      "Permis",
      "Véhicule",
      "Docs",
      "Validation"
    ];
    
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Étape {step} sur 5</span>
          <span className="text-xs font-black text-demandoo-600">{Math.round((step / 5) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s}
              className={`h-full transition-all duration-500 flex-1 ${
                s < step ? 'bg-emerald-500' : s === step ? 'bg-demandoo-500' : 'bg-transparent border-r border-white/40'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-3 px-1 hidden sm:flex">
          {titles.map((title, i) => (
            <span key={i} className={`text-[10px] font-black uppercase tracking-widest ${i + 1 <= step ? 'text-demandoo-600' : 'text-slate-300'}`}>
              {title}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderUploadBox = (label, required = true, stateVal, setStateVal) => (
    <label className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 hover:border-demandoo-400 transition-colors relative overflow-hidden">
      <input 
        type="file" 
        className="hidden" 
        onChange={(e) => {
          if(e.target.files && e.target.files[0] && setStateVal) {
            setStateVal(e.target.files[0]);
          }
        }}
        accept="image/*,.pdf"
      />
      {stateVal ? (
        <>
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
          <span className="text-xs font-bold text-slate-700 truncate w-full px-2">{stateVal.name}</span>
          <span className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Fichier sélectionné</span>
        </>
      ) : (
        <>
          <Upload className="w-6 h-6 text-slate-400 mb-2" />
          <span className="text-xs font-bold text-slate-700">{label}</span>
          {required && <span className="text-[10px] text-demandoo-600 font-bold uppercase mt-1">Obligatoire</span>}
        </>
      )}
    </label>
  );

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Decorative SaaS Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-demandoo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white rounded-[2rem] p-8 sm:p-10 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-[#0A1A24]" />
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-demandoo-500/20 text-demandoo-400 border border-demandoo-500/30 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" /> Sécurisé par Demandoo
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Devenez chauffeur Demandoo
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-lg">
                Complétez votre vérification pour commencer à proposer des trajets en toute sécurité.
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-medium text-slate-600">
          <Lock className="w-5 h-5 text-demandoo-600 shrink-0 mt-0.5" />
          <p>
            Vos documents sont utilisés uniquement pour vérifier votre identité et sécuriser la communauté Demandoo.
          </p>
        </div>

        {/* ACTION REQUIRED Alert */}
        {user?.driver_status === 'ACTION_REQUIRED' && step < 7 && (
          <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-sm space-y-3 shadow-sm">
            <div className="flex items-center gap-2 font-black">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Une correction est nécessaire dans votre dossier.
            </div>
            <p className="font-medium text-rose-800/80 leading-relaxed">
              <strong>Permis de conduire</strong><br/>
              Motif : « L’image est trop floue. Merci d’envoyer une nouvelle photo. »
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
          
          {step < 6 && renderProgressBar()}

          {/* STEP 1: Informations personnelles */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <User className="w-6 h-6 text-demandoo-500" />
                Informations Personnelles
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nom complet</label>
                  <input type="text" value={personalInfo.fullName} onChange={e => setPersonalInfo({...personalInfo, fullName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date de naissance</label>
                  <input type="date" value={personalInfo.dob} onChange={e => setPersonalInfo({...personalInfo, dob: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Téléphone</label>
                  <input type="tel" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ville</label>
                  <input type="text" value={personalInfo.city} onChange={e => setPersonalInfo({...personalInfo, city: e.target.value})} placeholder="Ex: Dakar, Touba" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Adresse complète</label>
                  <input type="text" value={personalInfo.address} onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})} placeholder="Ex: HLM Grand Yoff, Villa 123" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
              </div>

              <div className="pt-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Photo de profil publique</label>
                {renderUploadBox("Télécharger une photo de vous (visage dégagé)", true, personalInfo.profilePhoto, (f) => setPersonalInfo({...personalInfo, profilePhoto: f}))}
              </div>

              <div className="flex justify-end pt-6">
                <button onClick={handleNext} className="px-8 py-4 bg-demandoo-600 hover:bg-demandoo-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-demandoo-600/20 active:scale-95 transition-all">
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}


          {/* STEP 2: Permis de conduire */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-demandoo-500" />
                Permis de conduire
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Numéro du permis</label>
                  <input type="text" value={licenseInfo.number} onChange={e => setLicenseInfo({...licenseInfo, number: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date de délivrance</label>
                  <input type="date" value={licenseInfo.issueDate} onChange={e => setLicenseInfo({...licenseInfo, issueDate: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date d'expiration</label>
                  <input type="date" value={licenseInfo.expireDate} onChange={e => setLicenseInfo({...licenseInfo, expireDate: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {renderUploadBox("Photo recto du permis", true, licenseInfo.licenseFront, (f) => setLicenseInfo({...licenseInfo, licenseFront: f}))}
                {renderUploadBox("Photo verso si nécessaire", false, licenseInfo.licenseBack, (f) => setLicenseInfo({...licenseInfo, licenseBack: f}))}
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={handlePrev} className="px-6 py-4 text-slate-500 hover:text-slate-900 font-black text-sm flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={handleNext} className="px-8 py-4 bg-demandoo-600 hover:bg-demandoo-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-demandoo-600/20 active:scale-95 transition-all">
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Informations du véhicule */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Car className="w-6 h-6 text-demandoo-500" />
                Informations du Véhicule
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Marque</label>
                  <input type="text" value={vehicleInfo.make} onChange={e => setVehicleInfo({...vehicleInfo, make: e.target.value})} placeholder="Ex: Peugeot" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Modèle</label>
                  <input type="text" value={vehicleInfo.model} onChange={e => setVehicleInfo({...vehicleInfo, model: e.target.value})} placeholder="Ex: 508" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Année</label>
                  <input type="number" value={vehicleInfo.year} onChange={e => setVehicleInfo({...vehicleInfo, year: e.target.value})} placeholder="Ex: 2018" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Couleur</label>
                  <input type="text" value={vehicleInfo.color} onChange={e => setVehicleInfo({...vehicleInfo, color: e.target.value})} placeholder="Ex: Gris" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Immatriculation</label>
                  <input type="text" value={vehicleInfo.plate} onChange={e => setVehicleInfo({...vehicleInfo, plate: e.target.value})} placeholder="Ex: DK-1234-AB" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre de places disponibles</label>
                  <input type="number" min={1} max={7} value={vehicleInfo.seats} onChange={e => setVehicleInfo({...vehicleInfo, seats: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 mb-4">Options du véhicule</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={vehicleInfo.hasAircon} onChange={e => setVehicleInfo({...vehicleInfo, hasAircon: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-demandoo-600 focus:ring-demandoo-500" />
                    <span className="text-sm font-bold text-slate-700">Véhicule climatisé</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={vehicleInfo.acceptsLuggage} onChange={e => setVehicleInfo({...vehicleInfo, acceptsLuggage: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-demandoo-600 focus:ring-demandoo-500" />
                    <span className="text-sm font-bold text-slate-700">Accepte les bagages</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={vehicleInfo.nonSmoking} onChange={e => setVehicleInfo({...vehicleInfo, nonSmoking: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-demandoo-600 focus:ring-demandoo-500" />
                    <span className="text-sm font-bold text-slate-700">Véhicule non-fumeur</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-6 mt-6 border-t border-slate-100">
                <button onClick={handlePrev} className="px-6 py-4 text-slate-500 hover:text-slate-900 font-black text-sm flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={handleNext} className="px-8 py-4 bg-demandoo-600 hover:bg-demandoo-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-demandoo-600/20 active:scale-95 transition-all">
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Documents Véhicule */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-6 h-6 text-demandoo-500" />
                Documents du Véhicule
              </h2>
              
              <div className="space-y-2 mb-6">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Date d'expiration de l'assurance</label>
                <input type="date" value={vehicleDocs.insuranceExpireDate} onChange={e => setVehicleDocs({...vehicleDocs, insuranceExpireDate: e.target.value})} className="w-full sm:w-1/2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 outline-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderUploadBox("Carte Grise", true, vehicleDocs.registration, (f) => setVehicleDocs({...vehicleDocs, registration: f}))}
                {renderUploadBox("Assurance du véhicule", true, vehicleDocs.insurance, (f) => setVehicleDocs({...vehicleDocs, insurance: f}))}
                {renderUploadBox("Photo avant du véhicule", true, vehicleDocs.vehicleFront, (f) => setVehicleDocs({...vehicleDocs, vehicleFront: f}))}
                {renderUploadBox("Photo arrière (Plaque visible)", true, vehicleDocs.vehicleBack, (f) => setVehicleDocs({...vehicleDocs, vehicleBack: f}))}
                <div className="sm:col-span-2">
                  {renderUploadBox("Photo intérieure", true, vehicleDocs.vehicleInterior, (f) => setVehicleDocs({...vehicleDocs, vehicleInterior: f}))}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button type="button" onClick={handlePrev} className="px-6 py-4 text-slate-500 hover:text-slate-900 font-black text-sm flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={handleNext} className="px-8 py-4 bg-demandoo-600 hover:bg-demandoo-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-demandoo-600/20 active:scale-95 transition-all">
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Vérification finale */}
          {step === 5 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-demandoo-500" />
                Vérification Finale
              </h2>
              <p className="text-sm text-slate-500 font-medium">Vérifiez un résumé de votre dossier avant soumission.</p>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 text-sm">

                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-500">Permis</span>
                  <span className="font-black text-slate-900">Complété</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Véhicule</span>
                  <span className="font-black text-slate-900">Complété</span>
                </div>
              </div>

              <div className="p-4 bg-demandoo-50 rounded-2xl border border-demandoo-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={certify}
                    onChange={e => setCertify(e.target.checked)}
                    className="mt-1 w-5 h-5 text-demandoo-600 rounded border-demandoo-300 focus:ring-demandoo-500"
                  />
                  <span className="text-sm font-bold text-demandoo-900">
                    Je certifie que les informations fournies sont exactes et correspondent à la réalité. Je comprends que des documents frauduleux entraîneront la suspension de mon compte.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button type="button" onClick={handlePrev} className="px-6 py-4 text-slate-500 hover:text-slate-900 font-black text-sm flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button type="submit" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                  Soumettre mon dossier <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 6: Activation réussie */}
          {step === 6 && (
            <div className="text-center space-y-6 py-10 animate-fade-in">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Félicitations ! Votre compte chauffeur Demandoo est maintenant actif.
              </h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                Votre dossier est complet. Vous pouvez dès à présent utiliser toutes les fonctionnalités chauffeur.
              </p>
              
              <Link to="/publier" className="inline-block mt-8 px-8 py-4 bg-demandoo-600 hover:bg-demandoo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-demandoo-600/20 active:scale-95 transition-all">
                Commencer à proposer des trajets
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
