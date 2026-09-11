import React from 'react';

export const DriverNavigation = ({ activeTab, setActiveTab, pendingRequestsCount }) => {
  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'dashboard' 
              ? 'border-demandoo-500 text-demandoo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('requests')}
            className={`py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'requests' 
              ? 'border-demandoo-500 text-demandoo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Mes demandes
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              pendingRequestsCount > 0 
                ? (activeTab === 'requests' ? 'bg-demandoo-600 text-white' : 'bg-demandoo-100 text-demandoo-700')
                : 'bg-slate-100 text-slate-500'
            }`}>
              {pendingRequestsCount}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('trips')}
            className={`py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'trips' 
              ? 'border-demandoo-500 text-demandoo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Mes trajets
          </button>
          
          <button 
            onClick={() => setActiveTab('subscription')}
            className={`py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'subscription' 
              ? 'border-demandoo-500 text-demandoo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Mon abonnement
          </button>

        </div>
      </div>
    </div>
  );
};
