import { useEffect } from 'react';

// 1. Imports ES6 Standards (Correction du bug de chargement)
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 2. Fix des icônes Leaflet pour Vite/Webpack
// On force l'utilisation des assets par défaut pour éviter les carrés blancs
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant utilitaire pour centrer la carte
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

export default function MapView({ courts, userLocation, onCourtClick }) {
  // 3. Création d'icônes personnalisées (Code existant optimisé)
  const createCustomIcon = (status) => {
    const colors = {
      hot: '#ef4444',   // red-500
      active: '#22c55e', // green-500
      empty: '#64748b'   // slate-500
    };
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${colors[status] || colors.empty};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
      ">${status === 'hot' ? '🔥' : '🏀'}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  // Note: On utilise ici les tuiles 'CartoDB Dark Matter' pour correspondre 
  // au thème sombre de l'application (Slate-950), au lieu d'OSM standard.
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 relative z-0">
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Marqueur position utilisateur */}
        <Marker position={userLocation}>
          <Popup>Votre position</Popup>
        </Marker>

        {/* Marqueurs des terrains */}
        {courts.map((court) => (
          <Marker
            key={court.id}
            position={[court.lat, court.lng]}
            icon={createCustomIcon(court.status)}
            eventHandlers={{
              click: () => onCourtClick(court)
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-slate-900 mb-1">{court.name}</div>
                <div className="text-xs text-slate-600">
                  {court.players} joueurs • {court.distance}
                </div>
                {court.status === 'hot' && (
                  <div className="text-xs text-red-600 font-bold mt-1">🔥 HOT</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <MapCenter center={userLocation} zoom={13} />
      </MapContainer>
    </div>
  );
}
