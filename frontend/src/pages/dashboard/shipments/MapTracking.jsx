import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import GlassCard from '../../../components/ui/GlassCard';
import { motion } from 'framer-motion';
import L from 'leaflet';

// Fix Leaflet default icons for Vite (CDN-based approach that always works)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored marker icons
const createIcon = (color) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 28px; height: 28px;
    background: ${color};
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 0 12px ${color}88;
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const pickupIcon = createIcon('#10B981');   // Green
const dropoffIcon = createIcon('#EF4444');  // Red
const truckIcon = createIcon('#00F0FF');    // Neon blue

// Demo data: Multiple shipments with locations across India
const demoShipments = [
  {
    id: 'SHP-001',
    label: 'Mumbai → Delhi',
    pickup: [19.0760, 72.8777],
    dropoff: [28.7041, 77.1025],
    truckCurrent: [23.2599, 77.4126],  // Bhopal (midway)
    status: 'In Transit',
    eta: '8h 30m',
    progress: 55,
    driver: 'Rajesh Kumar',
    truck: 'MH-04-AB-1234',
  },
  {
    id: 'SHP-002',
    label: 'Bangalore → Chennai',
    pickup: [12.9716, 77.5946],
    dropoff: [13.0827, 80.2707],
    truckCurrent: [12.9249, 79.1325],  // Vellore area
    status: 'In Transit',
    eta: '1h 45m',
    progress: 78,
    driver: 'Suresh Reddy',
    truck: 'KA-01-CD-5678',
  },
  {
    id: 'SHP-003',
    label: 'Kolkata → Patna',
    pickup: [22.5726, 88.3639],
    dropoff: [25.6093, 85.1376],
    truckCurrent: [24.7914, 84.9916],  // Near Gaya
    status: 'In Transit',
    eta: '2h 10m',
    progress: 82,
    driver: 'Amit Singh',
    truck: 'WB-06-EF-9012',
  },
];

// Component to fit map bounds to current shipment
const FitBounds = ({ bounds }) => {
  const map = useMap();
  React.useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

const MapTracking = () => {
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const shipment = demoShipments[selectedIdx];

  const routePolyline = [shipment.pickup, shipment.truckCurrent, shipment.dropoff];
  const bounds = [shipment.pickup, shipment.dropoff];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-[calc(100vh-8rem)] flex flex-col"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Live Tracking</h1>
        <select 
          className="glass-input !w-auto bg-surface"
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
        >
          {demoShipments.map((s, i) => (
            <option key={s.id} value={i}>{s.id} — {s.label}</option>
          ))}
        </select>
      </div>

      <GlassCard className="flex-grow p-0 overflow-hidden relative">
        <MapContainer 
          center={shipment.truckCurrent} 
          zoom={7} 
          style={{ height: '100%', width: '100%', background: '#0B0F19' }}
          className="z-0"
          key={shipment.id}
        >
          {/* Dark mode map tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <FitBounds bounds={bounds} />
          
          {/* Pickup marker */}
          <Marker position={shipment.pickup} icon={pickupIcon}>
            <Popup>
              <div style={{ color: '#333', fontWeight: 'bold' }}>📦 Pickup</div>
              <div style={{ color: '#555' }}>{shipment.label.split('→')[0].trim()}</div>
            </Popup>
          </Marker>
          
          {/* Dropoff marker */}
          <Marker position={shipment.dropoff} icon={dropoffIcon}>
            <Popup>
              <div style={{ color: '#333', fontWeight: 'bold' }}>📍 Dropoff</div>
              <div style={{ color: '#555' }}>{shipment.label.split('→')[1].trim()}</div>
            </Popup>
          </Marker>
          
          {/* Truck current location */}
          <Marker position={shipment.truckCurrent} icon={truckIcon}>
            <Popup>
              <div style={{ color: '#333', fontWeight: 'bold' }}>🚛 {shipment.truck}</div>
              <div style={{ color: '#555' }}>Driver: {shipment.driver}</div>
            </Popup>
          </Marker>

          {/* Route line */}
          <Polyline 
            positions={routePolyline} 
            color="#00F0FF" 
            weight={3} 
            dashArray="10, 8" 
            opacity={0.8}
          />
        </MapContainer>
        
        {/* Overlay Info Card */}
        <div className="absolute top-4 left-4 z-[1000] w-72">
           <div className="bg-surface/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-glass">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">{shipment.id}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neonBlue/20 text-neonBlue font-semibold">{shipment.status}</span>
              </div>
              <p className="text-sm text-textSecondary mb-1">{shipment.label}</p>
              <p className="text-xs text-textSecondary mb-1">🚛 {shipment.truck} · {shipment.driver}</p>
              <p className="text-xs text-neonBlue mb-3">ETA: {shipment.eta}</p>
              
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-neonBlue h-full rounded-full transition-all duration-500"
                  style={{ width: `${shipment.progress}%` }}
                />
              </div>
              <p className="text-xs text-textSecondary mt-1 text-right">{shipment.progress}% complete</p>
           </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <div className="bg-surface/90 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-glass text-xs space-y-1.5">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-success inline-block"></span> <span className="text-textSecondary">Pickup</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-error inline-block"></span> <span className="text-textSecondary">Dropoff</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-neonBlue inline-block"></span> <span className="text-textSecondary">Truck</span></div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default MapTracking;
