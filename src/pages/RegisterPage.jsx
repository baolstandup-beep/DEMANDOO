import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StepIdentity } from '../components/register/StepIdentity';

const STORAGE_KEY = 'demandoo_draft_registration';

const INITIAL_DATA = {
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States spécifiques à l'UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Charger le brouillon
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY);
    
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData((prev) => ({
          ...prev, 
          ...parsed,
        }));
      } catch (e) {
        console.error("Failed to parse draft registration", e);
      }
    }
  }, []);

  // Sauvegarder le brouillon à chaque modification
  useEffect(() => {
    const { password, confirmPassword, ...draftData } = formData;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.warn("Impossible de sauvegarder le brouillon", error);
    }
  }, [formData]);

  const updateData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les codes secrets ne correspondent pas.");
      return;
    }
    if (formData.password.length !== 4) {
      setError("Le code secret doit contenir exactement 4 chiffres.");
      return;
    }
    if (!formData.phone || formData.phone.replace(/\s/g, '').length < 8) {
      setError("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password,
        role: 'driver'
      });

      if (result.success) {
        localStorage.removeItem(STORAGE_KEY);
        // Rediriger vers l'espace chauffeur (ils devront compléter leur profil plus tard)
        navigate('/espace-chauffeur');
      } else {
        setError(result.error || "Une erreur est survenue.");
      }
    } catch (e) {
      console.error("Register submit error:", e);
      setError(e?.message || "Une erreur inattendue est survenue.");
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

        <div className="min-h-[360px]">
          <StepIdentity 
            data={formData} 
            updateData={updateData} 
            onNext={handleSubmit} 
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            error={error}
          />
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
