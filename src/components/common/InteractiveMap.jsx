import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Locate } from 'lucide-react';

const customGreenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customRedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const SENEGAL_DESTINATIONS = [
  { name: 'Mbacké', distance: '7 km', lat: 14.7903, lng: -15.9082, price: '1 000 FCFA' },
  { name: 'Diourbel', distance: '44 km', lat: 14.6561, lng: -16.2307, price: '2 000 FCFA' },
  { name: 'Dakar', distance: '171 km', lat: 14.6937, lng: -17.4441, price: '9 000 FCFA' },
  { name: 'Thiès', distance: '113 km', lat: 14.7910, lng: -16.9256, price: '7 000 FCFA' },
  { name: 'Mbour', distance: '126 km', lat: 14.4220, lng: -16.9638, price: '6 000 FCFA' },
  { name: 'Kaolack', distance: '80 km', lat: 14.1506, lng: -16.0747, price: '4 000 FCFA' },
  { name: 'Fatick', distance: '82 km', lat: 14.3394, lng: -16.4042, price: '4 000 FCFA' },
  { name: 'Saint-Louis', distance: '145 km', lat: 16.0326, lng: -16.4818, price: '8 000 FCFA' },
];

const TOUBA_COORDS = [14.8631, -15.8770];

function RecenterMap({ center }) {
  const map = useMap();
  map.setView(center, 8);
  return null;
}

export const NationalCoverageSection = () => {
  const [activeDest, setActiveDest] = useState(SENEGAL_DESTINATIONS[2]); // Default Dakar

  const routePolyline = [
    TOUBA_COORDS,
    [activeDest.lat, activeDest.lng]
  ];

  return (
    <section className="space-y-4 my-12">
      <div>
        <span className="text-xs font-bold text-demandoo-600 uppercase tracking-widest block">
          Couverture nationale
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Touba vers tout le Sénégal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Carte interactive des trajets — choisissez une destination pour voir la route.
        </p>
      </div>

      <div className="bg-emerald-50/40 p-4 sm:p-6 rounded-3xl border border-emerald-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: LEAFLET MAP CONTAINER */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-slate-200 shadow-elevated relative h-[420px] bg-slate-100">
          
          <MapContainer 
            center={TOUBA_COORDS} 
            zoom={8} 
            scrollWheelZoom={false} 
            className="w-full h-full"
          >
            <RecenterMap center={[ (TOUBA_COORDS[0] + activeDest.lat) / 2, (TOUBA_COORDS[1] + activeDest.lng) / 2 ]} />
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* TOUBA ORIGIN MARKER */}
            <Marker position={TOUBA_COORDS} icon={customGreenIcon}>
              <Popup>
                <div className="text-center font-sans p-1">
                  <h4 className="font-extrabold text-slate-900">Touba (Départ)</h4>
                  <p className="text-xs text-demandoo-600 font-bold">Gare Routière / Grande Mosquée</p>
                </div>
              </Popup>
            </Marker>

            {/* DESTINATION MARKER */}
            <Marker position={[activeDest.lat, activeDest.lng]} icon={customRedIcon}>
              <Popup>
                <div className="text-center font-sans p-1">
                  <h4 className="font-extrabold text-slate-900">{activeDest.name}</h4>
                  <p className="text-xs text-slate-500">Distance : {activeDest.distance}</p>
                </div>
              </Popup>
            </Marker>

            {/* ROUTE LINE */}
            <Polyline 
              positions={routePolyline} 
              color="#059669" 
              weight={4} 
              dashArray="8, 8" 
              opacity={0.9} 
            />
          </MapContainer>

          {/* FLOATING ITINERARY OVERLAY BADGE (MATCHING SCREENSHOT 2) */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-demandoo-100 text-demandoo-700 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Itinéraire</span>
              <p className="text-xs font-extrabold text-slate-900">
                Touba → {activeDest.name} • {activeDest.distance}
              </p>
            </div>
          </div>

          {/* FLOATING ME LOCALISER BUTTON */}
          <button
            onClick={() => alert("Localisation GPS Sénégal activée")}
            className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full text-xs font-bold text-slate-800 shadow-md border border-slate-200 flex items-center gap-1.5 hover:bg-slate-50 transition-all"
          >
            <Locate className="w-4 h-4 text-demandoo-600" />
            Me localiser
          </button>

        </div>

        {/* RIGHT SIDEBAR: DESTINATIONS LIST (MATCHING SCREENSHOT 2) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-demandoo-700 border border-emerald-200">
              <MapPin className="w-3.5 h-3.5 text-demandoo-600" />
              Touba (départ)
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
              <Navigation className="w-3.5 h-3.5" />
              Destinations
            </span>
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-0.5">Destinations</h4>
            <p className="text-[11px] text-slate-500">Sélectionnez une ville pour tracer l'itinéraire.</p>
          </div>

          {/* DESTINATIONS LIST SCROLLABLE */}
          <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
            {SENEGAL_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                onClick={() => setActiveDest(dest)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border ${
                  activeDest.name === dest.name
                    ? 'bg-emerald-50/80 text-demandoo-700 border-demandoo-400 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className={`w-3.5 h-3.5 ${activeDest.name === dest.name ? 'text-demandoo-600' : 'text-slate-400'}`} />
                  {dest.name}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">{dest.distance}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => alert("Localisation activée pour Touba")}
            className="w-full py-3 rounded-xl text-xs font-extrabold text-white bg-demandoo-500 hover:bg-demandoo-600 shadow-md shadow-demandoo-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Locate className="w-4 h-4" />
            Me localiser
          </button>

        </div>

      </div>
    </section>
  );
};
