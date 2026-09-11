import React, { useState, useMemo, useEffect, useRef, Component } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  Locate, 
  Search, 
  X, 
  ArrowRight, 
  Compass, 
  Plus, 
  Minus, 
  Check, 
  Sparkles,
  Car,
  Clock,
  ChevronRight,
  MapPinOff,
  Layers
} from 'lucide-react';
import { 
  TOUBA_COORDS, 
  SENEGAL_REGIONS, 
  SENEGAL_DESTINATIONS 
} from '../../data/destinationsData';
import { useAuth } from '../../context/AuthContext';

// -------------------------------------------------------------
// Custom SVG DivIcons for Leaflet (No broken external image dependencies)
// -------------------------------------------------------------

const createToubaOriginIcon = () => {
  return L.divIcon({
    className: 'touba-marker-custom',
    html: `
      <div class="relative flex items-center justify-center" style="width: 44px; height: 44px;">
        <span class="map-marker-pulse absolute w-10 h-10 rounded-full bg-emerald-400/40"></span>
        <span class="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-pulse"></span>
        <div class="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 border-2 border-white">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

const createActiveDestinationIcon = (cityName) => {
  return L.divIcon({
    className: 'dest-marker-custom',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer" style="width: 48px; height: 52px;">
        <div class="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-slate-900 via-[#102a43] to-slate-800 text-white flex items-center justify-center shadow-xl shadow-slate-950/40 border-2 border-emerald-400 transform transition-transform duration-300 scale-105">
          <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1 shadow-sm"></div>
      </div>
    `,
    iconSize: [48, 52],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  });
};

const createInactiveCityDotIcon = (cityName) => {
  return L.divIcon({
    className: 'inactive-city-dot',
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer" style="width: 22px; height: 22px;" title="${cityName}">
        <div class="w-3 h-3 rounded-full bg-slate-700/80 border-2 border-white shadow-sm transition-all duration-200 group-hover:scale-150 group-hover:bg-emerald-600"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

// -------------------------------------------------------------
// Helper controller for camera moves, fitBounds, recentering
// -------------------------------------------------------------
function MapController({ destination, recenterKey, locateKey }) {
  const map = useMap();

  // Invalidate size on mount to prevent Leaflet gray tile glitches
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  // Adjust camera bounds when destination changes
  useEffect(() => {
    if (!destination) return;

    try {
      const bounds = L.latLngBounds([
        TOUBA_COORDS,
        [destination.latitude, destination.longitude]
      ]);

      map.fitBounds(bounds, {
        padding: [90, 90],
        maxZoom: 10,
        animate: true,
        duration: 1.2
      });
    } catch (e) {
      console.warn("fitBounds failed:", e);
    }
  }, [destination, map]);

  // Recenter on Touba when trigger updates
  useEffect(() => {
    if (recenterKey === 0) return;
    map.flyTo(TOUBA_COORDS, 9, {
      animate: true,
      duration: 1.2
    });
  }, [recenterKey, map]);

  // Geolocation trigger
  useEffect(() => {
    if (locateKey === 0) return;
    map.locate({ setView: true, maxZoom: 10 });
  }, [locateKey, map]);

  return null;
}

// -------------------------------------------------------------
// Custom Floating Zoom Controls for the Map
// -------------------------------------------------------------
function CustomZoomControls() {
  const map = useMap();

  return (
    <div className="absolute top-5 left-5 z-[400] flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/70">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
        title="Zoom avant"
        aria-label="Zoom avant"
      >
        <Plus className="w-4 h-4" />
      </button>
      <div className="h-px bg-slate-100 mx-1" />
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
        title="Zoom arrière"
        aria-label="Zoom arrière"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}

// -------------------------------------------------------------
// Error Boundary for Map (catches Leaflet runtime crashes)
// -------------------------------------------------------------
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn('[InteractiveMap] Erreur capturée:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <section className="space-y-10 my-16 font-sans">
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-900">Carte temporairement indisponible</h3>
            <p className="text-sm text-slate-500">Rechargez la page pour réafficher la carte interactive.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              Recharger
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

// -------------------------------------------------------------
// MAIN COMPONENT: NationalCoverageSection
// -------------------------------------------------------------
export const NationalCoverageSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active selected destination (default Dakar)
  const [activeDest, setActiveDest] = useState(() => {
    return SENEGAL_DESTINATIONS.find(d => d.id === 'dakar') || SENEGAL_DESTINATIONS[0];
  });

  // Filters & Search
  const [selectedRegion, setSelectedRegion] = useState("Toutes");
  const [searchQuery, setSearchQuery] = useState("");

  // Map control triggers
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [locateTrigger, setLocateTrigger] = useState(0);

  // Reference to scroll to list on mobile
  const panelRef = useRef(null);

  // Filtered destinations list
  const filteredDestinations = useMemo(() => {
    return SENEGAL_DESTINATIONS.filter(item => {
      const matchRegion = selectedRegion === "Toutes" || item.region.toLowerCase() === selectedRegion.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        item.city.toLowerCase().includes(q) || 
        item.region.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q));
      return matchRegion && matchSearch;
    });
  }, [selectedRegion, searchQuery]);

  // Precomputed icons
  const toubaIcon = useMemo(() => createToubaOriginIcon(), []);
  const activeIcon = useMemo(() => createActiveDestinationIcon(activeDest.city), [activeDest.city]);

  // Route Polyline points
  const routePolyline = useMemo(() => {
    return [
      TOUBA_COORDS,
      [activeDest.latitude, activeDest.longitude]
    ];
  }, [activeDest]);

  // Handle navigate to rides
  const handleViewRides = (destination) => {
    navigate(`/trajets?from=Touba&to=${encodeURIComponent(destination.city)}`);
  };

  const handlePublishRide = (destination) => {
    navigate(`/publier?from=Touba&to=${encodeURIComponent(destination.city)}`);
  };

  const scrollToPanel = () => {
    if (panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <MapErrorBoundary>
    <section className="space-y-10 my-16 font-sans">
      
      {/* =========================================================
          1. HEADER & INTRO
         ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-extrabold text-[11px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Couverture Nationale
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Depuis Touba, voyagez partout au Sénégal.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Explorez les principales destinations desservies par les conducteurs Demandoo et visualisez votre trajet en temps réel.
          </p>
        </div>

        {/* Mini stats badges */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
          <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-black text-slate-900">14 régions</span>
            <span className="text-[11px] text-slate-500 font-medium">couvertes</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-xs font-black text-slate-900">30+ destinations</span>
            <span className="text-[11px] text-slate-500 font-medium">clés</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-black text-slate-900">Touba</span>
            <span className="text-[11px] text-slate-500 font-medium">départs quotidiens</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. MAIN INTERACTIVE CONTAINER (GRID: MAP 68% + PANEL 32%)
         ========================================================= */}
      <div className="bg-[#F8FAF9] p-3 sm:p-5 lg:p-6 rounded-[32px] border border-emerald-100 shadow-[0_20px_50px_rgba(16,185,129,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* =======================================================
            A. GAUCHE : CARTE LEAFLET PREMIUM (~68% desktop)
           ======================================================= */}
        <div className="lg:col-span-8 rounded-[28px] overflow-hidden border border-emerald-100/90 shadow-md relative h-[460px] sm:h-[540px] lg:h-[630px] bg-slate-100">
          
          <MapContainer 
            center={TOUBA_COORDS} 
            zoom={8} 
            scrollWheelZoom={false} 
            className="w-full h-full z-0"
            zoomControl={false}
          >
            {/* Tile Layer OSM - clean cartography */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Helper for smooth animations and fitBounds */}
            <MapController 
              destination={activeDest} 
              recenterKey={recenterTrigger}
              locateKey={locateTrigger}
            />

            {/* Custom Zoom Controls */}
            <CustomZoomControls />

            {/* ROUTE HALO (Back soft glow) */}
            <Polyline 
              positions={routePolyline} 
              color="#10b981" 
              weight={8} 
              opacity={0.25} 
            />

            {/* ROUTE FOREGROUND (Animated Dashed Stroke) */}
            <Polyline 
              positions={routePolyline} 
              color="#079c94" 
              weight={3.5} 
              dashArray="10, 10" 
              opacity={0.95} 
              className="leaflet-animated-route"
            />

            {/* INACTIVE DESTINATIONS MINI-DOTS (Allow clicking on the map directly) */}
            {SENEGAL_DESTINATIONS.map(item => {
              if (item.id === activeDest.id) return null;
              return (
                <Marker 
                  key={item.id} 
                  position={[item.latitude, item.longitude]}
                  icon={createInactiveCityDotIcon(item.city)}
                  eventHandlers={{
                    click: () => setActiveDest(item)
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                    <div className="font-sans text-xs px-1 py-0.5">
                      <span className="font-bold text-slate-900">{item.city}</span>
                      <span className="text-[10px] text-slate-500 block">≈ {item.distanceFromTouba} km • {item.region}</span>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

            {/* POINT DE DÉPART : TOUBA */}
            <Marker position={TOUBA_COORDS} icon={toubaIcon}>
              <Tooltip permanent direction="bottom" offset={[0, 14]} opacity={0.95}>
                <div className="text-center font-sans px-1.5 py-0.5">
                  <span className="font-black text-emerald-800 text-[11px] uppercase tracking-wide block">Touba — Départ</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Gare Routière & Grande Mosquée</span>
                </div>
              </Tooltip>
            </Marker>

            {/* DESTINATION ACTIVE */}
            <Marker position={[activeDest.latitude, activeDest.longitude]} icon={activeIcon}>
              <Tooltip permanent direction="top" offset={[0, -28]} opacity={0.95}>
                <div className="text-center font-sans px-2 py-0.5">
                  <span className="font-black text-slate-900 text-xs block">{activeDest.city}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block">≈ {activeDest.distanceFromTouba} km • {activeDest.duration}</span>
                </div>
              </Tooltip>
            </Marker>

          </MapContainer>

          {/* -----------------------------------------------------
              FLOATING ITINERARY MINI-CARD (Bottom-Left)
             ----------------------------------------------------- */}
          <div className="absolute bottom-5 left-5 z-[400] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-200/80 max-w-[calc(100%-40px)] sm:max-w-xs transition-all duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                <Navigation className="w-5 h-5 -rotate-45" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Itinéraire</span>
                  <span className="text-[10px] font-bold text-slate-400">• Région {activeDest.region}</span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">
                  Touba → {activeDest.city}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-0.5">
                  <span>≈ {activeDest.distanceFromTouba} km</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {activeDest.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------
              FLOATING ACTION BUTTONS (Top-Right of Map)
             ----------------------------------------------------- */}
          <div className="absolute top-5 right-5 z-[400] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRecenterTrigger(prev => prev + 1)}
              className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-800 shadow-md border border-slate-200/80 flex items-center gap-1.5 hover:bg-slate-50 hover:text-emerald-700 transition-all active:scale-95"
              title="Recentrer la carte sur Touba"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Touba</span>
            </button>

            <button
              type="button"
              onClick={() => setLocateTrigger(prev => prev + 1)}
              className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-800 shadow-md border border-slate-200/80 flex items-center gap-1.5 hover:bg-slate-50 hover:text-emerald-700 transition-all active:scale-95"
              title="Me localiser au Sénégal"
            >
              <Locate className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Me localiser</span>
            </button>
          </div>

          {/* -----------------------------------------------------
              MOBILE FLOATING CTA: GO TO DESTINATIONS
             ----------------------------------------------------- */}
          <div className="lg:hidden absolute bottom-5 right-5 z-[400]">
            <button
              type="button"
              onClick={scrollToPanel}
              className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl text-xs font-black shadow-lg flex items-center gap-1.5 hover:bg-slate-950 transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Destinations ({filteredDestinations.length})</span>
            </button>
          </div>

        </div>

        {/* =======================================================
            B. DROITE : PANNEAU DESTINATIONS (~32% desktop)
           ======================================================= */}
        <div 
          ref={panelRef}
          className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-[24px] border border-[#E7F5EF] shadow-sm flex flex-col justify-between space-y-5"
        >
          
          <div className="space-y-4">
            
            {/* 1. Header du Panneau */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Touba — départ
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                14 régions
              </span>
            </div>

            {/* 2. Titre & Descriptif */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Choisissez une destination
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sélectionnez une ville pour afficher automatiquement l'itinéraire.
              </p>
            </div>

            {/* 3. Barre de Recherche */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une ville ou une région…"
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 4. Onglets / Filtres de Régions (Scroll Horizontal) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
              {SENEGAL_REGIONS.map(reg => {
                const isSelected = selectedRegion.toLowerCase() === reg.toLowerCase();
                return (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }`}
                  >
                    {reg}
                  </button>
                );
              })}
            </div>

            {/* 5. Liste des Destinations Filtrées */}
            <div className="space-y-2 max-h-[300px] sm:max-h-[340px] overflow-y-auto pr-1">
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map(item => {
                  const isActive = activeDest.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveDest(item)}
                      className={`w-full p-3 rounded-2xl text-left transition-all duration-200 border flex items-center justify-between group ${
                        isActive
                          ? 'bg-emerald-50/90 text-emerald-950 border-emerald-500 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-100 hover:border-emerald-200 hover:bg-[#F4FFFA] hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          isActive 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-100 text-slate-500 group-hover:scale-105 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                        }`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 truncate">
                              {item.city}
                            </span>
                            {item.popular && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                Populaire
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate">
                            Région de {item.region}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className="text-xs font-black text-slate-800 block">
                          ≈ {item.distanceFromTouba} km
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {item.duration}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                /* ÉTAT VIDE (EMPTY STATE) */
                <div className="p-6 text-center space-y-2.5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <MapPinOff className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-extrabold text-slate-800">Aucune destination trouvée</h5>
                  <p className="text-[11px] text-slate-500">
                    Essayez un autre mot-clé ou sélectionnez "Toutes" les régions.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedRegion("Toutes");
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* 6. ACTION CARD FOOTER (CTA dynamique sur la destination sélectionnée) */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">
                  Sélection active
                </span>
                <span className="text-xs font-black text-slate-900">
                  Touba → {activeDest.city}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">Estimation</span>
                <span className="text-xs font-black text-emerald-700">{activeDest.priceEstimate}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleViewRides(activeDest)}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Voir les trajets vers {activeDest.city}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Bonus pour chauffeur connecté */}
            {user?.role === 'driver' && (
              <button
                type="button"
                onClick={() => handlePublishRide(activeDest)}
                className="w-full py-2 px-3 rounded-xl text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                <span>Publier un départ Touba → {activeDest.city}</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </section>
    </MapErrorBoundary>
  );
};

export default NationalCoverageSection;
