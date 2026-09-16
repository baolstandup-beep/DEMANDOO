import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StepIndicator } from '../components/register/StepIndicator';
import { StepIdentity } from '../components/register/StepIdentity';
import { StepDriverPhoto } from '../components/register/StepDriverPhoto';
import { StepVehicleInfo } from '../components/register/StepVehicleInfo';
import { StepVehiclePhotos } from '../components/register/StepVehiclePhotos';
import { StepSummary } from '../components/register/StepSummary';

const STORAGE_KEY = 'demandoo_draft_registration';

const INITIAL_DATA = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  avatarBase64: null,
  licenseFrontBase64: null,
  licenseBackBase64: null,
  brand: '',
  model: '',
  year: '',
  color: '',
  seatsCount: '',
  vehicleType: '',
  licensePlate: '',
  vehiclePhotos: [],
  acceptedTerms: false,
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States spécifiques à l'UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Charger le brouillon
  useEffect(() => {
    // FORCE CLEAR POUR REGLER LE BUG ACTUEL (TEMPORAIRE)
    localStorage.removeItem(STORAGE_KEY);
    
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData((prev) => ({
          ...prev, 
          ...parsed,
          vehiclePhotos: Array.isArray(parsed.vehiclePhotos) ? parsed.vehiclePhotos : []
        }));
      } catch (e) {
        console.error("Failed to parse draft registration", e);
      }
    }
  }, []);

  // Sauvegarder le brouillon à chaque modification
  useEffect(() => {
    // Ne pas sauvegarder le mot de passe (sécurité) ni les images en base64 pour éviter de saturer le localStorage
    const { 
      password, 
      confirmPassword, 
      avatarBase64, 
      licenseFrontBase64, 
      licenseBackBase64, 
      vehiclePhotos, 
      ...draftData 
    } = formData;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.warn("Impossible de sauvegarder le brouillon: quota dépassé", error);
    }
  }, [formData]);

  const updateData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    setError('');
    
    // Validation étape 1
    if (currentStep === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
      if (!formData.phone || formData.phone.replace(/\s/g, '').length < 8) {
        setError("Veuillez saisir un numéro de téléphone valide.");
        return;
      }
    }

    window.scrollTo(0, 0);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    window.scrollTo(0, 0);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: 'driver',
        avatar_url: formData.avatarBase64,
        vehicle: {
          brand: formData.brand || 'Standard',
          model: formData.model || 'Véhicule',
          year: formData.year || '2022',
          color: formData.color || 'Gris',
          seats_count: 4,
          vehicle_type: 'Berline',
          license_plate: formData.licensePlate || 'DK-0000-XX'
        }
      });

      if (result.success) {
        localStorage.removeItem(STORAGE_KEY);
        navigate('/abonnement');
      } else {
        alert(result.error || "Une erreur est survenue.");
      }
    } catch (e) {
      console.error("Register submit error:", e);
      alert(e?.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans flex items-center justify-center p-3 sm:p-4 py-6 sm:py-8 relative overflow-hidden">
      
      {/* Background Halos */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-demandoo-600/10 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-demandoo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-4 sm:p-8 lg:p-10 relative z-10">
        
        <div className="text-center mb-6">
          <Link to="/" className="inline-block p-2 rounded-xl bg-white shadow-md hover:scale-105 transition-transform mb-2 border border-slate-100">
            <img src="/logo.png" alt="Demandoo" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={3} onBack={prevStep} />

        <div className="min-h-[360px]">
          {currentStep === 1 && (
            <StepIdentity 
              data={formData} 
              updateData={updateData} 
              onNext={nextStep} 
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              error={error}
            />
          )}
          
          {currentStep === 2 && (
            <StepDriverPhoto data={formData} updateData={updateData} onNext={nextStep} />
          )}

          {currentStep === 3 && (
            <StepSummary data={formData} updateData={updateData} onSubmit={handleSubmit} isLoading={isLoading} />
          )}
        </div>

        <p className="text-sm text-center text-slate-400 font-medium mt-8 border-t border-slate-100 pt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-black text-demandoo-500 hover:text-demandoo-400 transition-colors">
            Se connecter
          </Link>
        </p>
      </div>

    </div>
  );
};
