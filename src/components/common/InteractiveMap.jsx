import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Map as MapIcon, LocateFixed, Car } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TOUBA_COORDS = [14.8667, -15.8833];

const DESTINATIONS = [
  { id: 'mbacke', name: 'Mbacké', coords: [14.7903, -15.9081], distance: 7 },
  { id: 'diourbel', name: 'Diourbel', coords: [14.6500, -16.2333], distance: 44 },
  { id: 'dakar', name: 'Dakar', coords: [14.7167, -17.4677], distance: 171 },
  { id: 'thies', name: 'Thiès', coords: [14.7833, -16.9333], distance: 113 },
  { id: 'mbour', name: 'Mbour', coords: [14.4167, -16.9667], distance: 126 },
  { id: 'kaolack', name: 'Kaolack', coords: [14.1333, -16.2500], distance: 80 },
  { id: 'fatick', name: 'Fatick', coords: [14.3333, -16.4167], distance: 82 },
  { id: 'saintlouis', name: 'Saint-Louis', coords: [16.0333, -16.4833], distance: 145 },
  { id: 'louga', name: 'Louga', coords: [15.6167, -16.2167], distance: 85 },
  { id: 'ziguinchor', name: 'Ziguinchor', coords: [12.5833, -16.2667], distance: 450 },
  { id: 'kolda', name: 'Kolda', coords: [12.8833, -14.9500], distance: 380 },
  { id: 'tambacounda', name: 'Tambacounda', coords: [13.7667, -13.7333], distance: 300 },
  { id: 'matam', name: 'Matam', coords: [15.6500, -13.2500], distance: 350 },
];

// Custom icons
const createCustomIcon = (color, bgColor) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md ${bgColor} text-${color}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const toubaIcon = createCustomIcon('white', 'bg-demandoo-500');
const destIcon = createCustomIcon('white', 'bg-slate-800');
const carIcon = L.divIcon({
  className: 'custom-car-icon',
  html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md bg-white text-demandoo-500"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to handle map view updates when selection changes
const MapUpdater = ({ selectedDest }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedDest) {
      // Fit bounds to show both Touba and the selected destination
      const bounds = L.latLngBounds([TOUBA_COORDS, selectedDest.coords]);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
    } else {
      map.setView(TOUBA_COORDS, 7, { animate: true });
    }
  }, [selectedDest, map]);
  return null;
};

const InteractiveMap = () => {
  const [selectedDestId, setSelectedDestId] = useState('dakar'); // Dakar by default
  
  const selectedDest = DESTINATIONS.find(d => d.id === selectedDestId);

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden" id="interactive-map">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
              Touba vers tout le Sénégal
            </h2>
            <p className="text-lg text-slate-600">
              Carte interactive des trajets — choisissez une destination pour voir la route et la distance.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <MapPin className="h-4 w-4 text-demandoo-500" />
              <span className="text-sm font-medium">Touba (départ)</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 text-slate-600">
              <Navigation className="h-4 w-4" />
              <span className="text-sm font-medium">Destinations</span>
            </div>
          </div>
        </div>

        {/* Map and List Container */}
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[600px]">
          
          {/* Leaflet Map (Left) */}
          <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200 relative z-10 h-[400px] lg:h-full">
            <MapContainer 
              center={TOUBA_COORDS} 
              zoom={7} 
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              
              <MapUpdater selectedDest={selectedDest} />

              {/* Touba Marker */}
              <Marker position={TOUBA_COORDS} icon={toubaIcon}>
                <Popup className="font-sans font-medium">Touba (Départ)</Popup>
              </Marker>

              {/* Destination Markers */}
              {DESTINATIONS.map(dest => (
                <Marker 
                  key={dest.id} 
                  position={dest.coords} 
                  icon={dest.id === selectedDestId ? destIcon : createCustomIcon('slate-400', 'bg-white')}
                  eventHandlers={{
                    click: () => setSelectedDestId(dest.id),
                  }}
                >
                  <Popup className="font-sans font-medium">{dest.name}</Popup>
                </Marker>
              ))}

              {/* Route Line */}
              {selectedDest && (
                <>
                  <Polyline 
                    positions={[TOUBA_COORDS, selectedDest.coords]} 
                    color="#00665C" 
                    weight={4} 
                    opacity={0.7}
                    dashArray="10, 10"
                    className="animate-pulse"
                  />
                  {/* Car icon roughly in the middle */}
                  <Marker 
                    position={[
                      (TOUBA_COORDS[0] + selectedDest.coords[0]) / 2,
                      (TOUBA_COORDS[1] + selectedDest.coords[1]) / 2
                    ]} 
                    icon={carIcon} 
                  />
                </>
              )}
            </MapContainer>

            {/* Overlay Info on Map */}
            {selectedDest && (
              <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-demandoo-50 text-demandoo-500 rounded-full flex items-center justify-center">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Itinéraire</p>
                  <p className="text-slate-900 font-bold">Touba <span className="text-demandoo-500 mx-1">→</span> {selectedDest.name} · {selectedDest.distance} km</p>
                </div>
              </div>
            )}
          </div>

          {/* Destinations List (Right) */}
          <div className="w-full lg:w-96 bg-white rounded-3xl shadow-lg border border-slate-200 flex flex-col h-[400px] lg:h-full z-10">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                <MapIcon className="h-5 w-5 text-demandoo-500" />
                Destinations
              </h3>
              <p className="text-sm text-slate-500">
                Sélectionnez une ville pour tracer l'itinéraire.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {DESTINATIONS.map(dest => {
                const isSelected = selectedDestId === dest.id;
                return (
                  <button
                    key={dest.id}
                    onClick={() => setSelectedDestId(dest.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border-2 ${
                      isSelected 
                        ? 'border-demandoo-500 bg-demandoo-50 shadow-sm' 
                        : 'border-transparent bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`h-5 w-5 ${isSelected ? 'text-demandoo-500' : 'text-slate-400'}`} />
                      <span className={`font-semibold ${isSelected ? 'text-demandoo-700' : ''}`}>
                        {dest.name}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-demandoo-600' : 'text-slate-500'}`}>
                      {dest.distance} km
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={() => setSelectedDestId(null)}
                className="w-full py-3 bg-demandoo-600 hover:bg-demandoo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LocateFixed className="h-5 w-5" />
                Recentrer sur Touba
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
