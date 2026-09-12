import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const StepIndicator = ({ currentStep, totalSteps, onBack }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        {currentStep > 1 && (
          <button 
            type="button"
            onClick={onBack}
            className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-500 mb-2">
            Étape {currentStep} sur {totalSteps}
          </p>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-demandoo-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
