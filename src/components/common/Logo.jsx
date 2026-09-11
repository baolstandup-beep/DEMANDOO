import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Composant officiel du Logo Demandoo
 * Couleurs officielles :
 * - Bleu Royal Logo : #183E94
 * - Vert Émeraude / Pin Géoloc : #008577
 */
export const Logo = ({ 
  className = "h-8 sm:h-9", 
  withLink = false, 
  to = "/", 
  alt = "Demandoo — Covoiturage Sénégal",
  darkBackground = false,
  showSubtitle = false
}) => {
  const imageElement = (
    <img
      src="/logo.png"
      alt={alt}
      className={`w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] ${className}`}
    />
  );

  const content = darkBackground ? (
    <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-md shadow-black/10 group">
      {imageElement}
      {showSubtitle && (
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-l border-slate-200 pl-2">
          Sénégal
        </span>
      )}
    </div>
  ) : (
    <div className="inline-flex items-center gap-2.5 group">
      {imageElement}
      {showSubtitle && (
        <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-widest text-[#183E94] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#DBE6FE]">
          Touba • Sénégal
        </span>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none select-none">
        {content}
      </Link>
    );
  }

  return content;
};
