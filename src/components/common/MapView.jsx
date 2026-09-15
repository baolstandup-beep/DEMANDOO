import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

// Configuration de l'icône personnalisée pour le chauffeur
const createDriverIcon = () => {
  const iconHtml = ReactDOMServer.renderToString(
    <div className="relative">
      <div className="absolute -top-6 -left-3 w-12 h-12">
        <div className="absolute inset-0 bg-demandoo-500 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg border-2 border-demandoo-500">
          <Navigation className="w-5 h-5 text-demandoo-500" />
        </div>
      </div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-driver-icon',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Composant pour recentrer la carte quand les coordonnées changent
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, map.getZoom(), {
        duration: 1.5
      });
    }
  }, [center, map]);
  return null;
};

export const MapView = ({ latitude, longitude, label = 'Position', height = '400px' }) => {
  const [driverIcon, setDriverIcon] = useState(null);
  
  useEffect(() => {
    setDriverIcon(createDriverIcon());
  }, []);

  if (!latitude || !longitude || !driverIcon) {
    return (
      <div className="w-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200" style={{ height }}>
        <MapPin className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
        <p className="text-slate-500 font-medium text-sm">En attente du signal GPS...</p>
      </div>
    );
  }

  const position = [latitude, longitude];

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-sm relative z-0" style={{ height }}>
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position} icon={driverIcon}>
          <Popup className="rounded-xl overflow-hidden font-sans border-none shadow-xl">
            <div className="font-black text-slate-800">{label}</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-500">En direct</div>
          </Popup>
        </Marker>
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
};
