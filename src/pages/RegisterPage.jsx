import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StepIndicator } from '../components/register/StepIndicator';
import { StepIdentity } from '../components/register/StepIdentity';
import { StepDriverPhoto } from '../components/register/StepDriverPhoto';
import { StepDocuments } from '../components/register/StepDocuments';
import { StepVehicleInfo } from '../components/register/StepVehicleInfo';
import { StepVehiclePhotos } from '../components/register/StepVehiclePhotos';
import { StepSummary } from '../components/register/StepSummary';

const STORAGE_KEY = 'demandoo_draft_registration';

const INITIAL_DATA = {
  firstName: '',
  lastName: '',
  phone: '',
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
    // Ne pas sauvegarder le mot de passe pour des raisons de sécurité
    const { password, confirmPassword, ...draftData } = formData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
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
    setCurrentStep((prev) => Math.min(prev + 1, 6));
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
        password: formData.password,
        role: 'driver',
        // Dans une vraie app, les Base64 seraient uploadés sur Supabase Storage
        // Ici on les passe pour enrichir le profil / véhicule simulé si besoin
        avatar_url: formData.avatarBase64,
        vehicle: {
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          color: formData.color,
          seats_count: parseInt(formData.seatsCount),
          vehicle_type: formData.vehicleType,
          license_plate: formData.licensePlate,
          photos: formData.vehiclePhotos
        }
      });

      if (result.success) {
        localStorage.removeItem(STORAGE_KEY);
        navigate('/admin'); // Ou Dashboard chauffeur
      } else {
        alert(result.error || "Une erreur est survenue.");
      }
    } catch (e) {
      alert("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans flex items-center justify-center p-4 py-8 relative overflow-hidden">
      
      {/* Background Halos */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-demandoo-600/10 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-demandoo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-6 sm:p-10 relative z-10">
        
        <div className="text-center mb-6">
          <Link to="/" className="inline-block p-2 rounded-xl bg-white shadow-md hover:scale-105 transition-transform mb-2 border border-slate-100">
            <img src="/logo.png" alt="Demandoo" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={6} onBack={prevStep} />

        <div className="min-h-[400px]">
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
            <StepDocuments data={formData} updateData={updateData} onNext={nextStep} />
          )}

          {currentStep === 4 && (
            <StepVehicleInfo data={formData} updateData={updateData} onNext={nextStep} />
          )}

          {currentStep === 5 && (
            <StepVehiclePhotos data={formData} updateData={updateData} onNext={nextStep} />
          )}

          {currentStep === 6 && (
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
