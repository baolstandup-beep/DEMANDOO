import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProgressBar = ({ step, totalSteps }) => {
  const percentage = ((step - 1) / totalSteps) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-black text-demandoo-600 tracking-widest uppercase">
        <span>Étape {step} sur {totalSteps}</span>
        <span>{Math.round(percentage)} %</span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-demandoo-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const TripCreationLayout = ({ 
  step, 
  totalSteps, 
  onBack, 
  children,
  errorMsg
}) => {
  return (
    <div className="min-h-screen bg-[#F7FAF9] py-4 sm:py-8 lg:py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-[780px] space-y-6 sm:space-y-8">
        
        {/* Header & Progress */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white border border-[#E4EBE8] flex items-center justify-center text-[#667085] hover:text-[#101828] hover:bg-[#EFF9F6] transition-colors shadow-sm"
              type="button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/espace-chauffeur" className="text-sm font-bold text-[#667085] hover:text-[#101828] transition-colors py-2">
              Annuler
            </Link>
          </div>

          <ProgressBar step={step} totalSteps={totalSteps} />
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#F04438]/10 border border-[#F04438]/20 text-[#F04438] rounded-2xl text-sm font-bold shadow-sm animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[#FFFFFF] rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 lg:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E4EBE8] relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export const StepHeader = ({ icon: Icon, title, description }) => (
  <div className="space-y-2 mb-8 animate-fade-in">
    {Icon && (
      <div className="w-12 h-12 rounded-2xl bg-[#EFF9F6] flex items-center justify-center text-demandoo-600 mb-4">
        <Icon className="w-6 h-6" />
      </div>
    )}
    <h2 className="text-2xl sm:text-3xl font-black text-[#101828] tracking-tight">
      {title}
    </h2>
    {description && (
      <p className="text-[#667085] font-medium text-sm">
        {description}
      </p>
    )}
  </div>
);

export const PrimaryButton = ({ onClick, disabled, children, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="w-full mt-8 h-[56px] rounded-[14px] text-sm font-bold text-white bg-demandoo-600 hover:bg-demandoo-700 hover:-translate-y-[1px] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
  >
    {children}
  </button>
);

export const FormField = ({ label, children, required }) => (
  <div>
    <label className="text-[13px] font-bold text-[#101828] block mb-2 uppercase tracking-wide">
      {label} {required && <span className="text-[#F04438]">*</span>}
    </label>
    {children}
  </div>
);
