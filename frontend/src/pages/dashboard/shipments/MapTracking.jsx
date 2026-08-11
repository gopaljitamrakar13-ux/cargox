import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import GlassCard from '../../../components/ui/GlassCard';
import { motion } from 'framer-motion';
import L from 'leaflet';
import api from '../../../api/axios';

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

// Real API data will be used below

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
  const [shipments, setShipments] = React.useState([]);
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const [trackingData, setTrackingData] = React.useState([]);

  React.useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await api.get('/shipments/');
        setShipments(response.data);
      } catch (error) {
        console.error('Failed to fetch shipments', error);
      }
    };
    fetchShipments();
  }, []);

  React.useEffect(() => {
    if (shipments.length > 0) {
      const fetchTracking = async () => {
        try {
          const shipment = shipments[selectedIdx];
          const response = await api.get(`/shipments/${shipment.id}/tracking`);
          setTrackingData(response.data);
        } catch (error) {
          console.error('Failed to fetch tracking data', error);
        }
      };
      fetchTracking();
    }
  }, [selectedIdx, shipments]);

  if (shipments.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-textSecondary h-[calc(100vh-8rem)] flex items-center justify-center">
        No active shipments found to track.
      </motion.div>
    );
  }

  const shipment = shipments[selectedIdx];
  const latestTracking = trackingData.length > 0 ? trackingData[0] : null;

  const pickup = shipment.pickup_lat ? [shipment.pickup_lat, shipment.pickup_lng] : [19.0760, 72.8777];
  const dropoff = shipment.dropoff_lat ? [shipment.dropoff_lat, shipment.dropoff_lng] : [28.7041, 77.1025];
  
  const truckCurrent = latestTracking 
    ? [latestTracking.lat, latestTracking.lng] 
    : [
        pickup[0] + (dropoff[0] - pickup[0]) * 0.5,
        pickup[1] + (dropoff[1] - pickup[1]) * 0.5
      ]; // Midway point as fallback

  const routePolyline = [pickup, truckCurrent, dropoff];
  const bounds = [pickup, dropoff];

  const label = `${shipment.pickup_address?.substring(0, 15)}... → ${shipment.dropoff_address?.substring(0, 15)}...`;
  const status = latestTracking?.status || shipment.status;
  const eta = 'TBD';
  const progress = 50;

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
          {shipments.map((s, i) => (
            <option key={s.id} value={i}>{s.id.substring(0,8).toUpperCase()} — {s.pickup_address?.substring(0,10)}...</option>
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
          <Marker position={pickup} icon={pickupIcon}>
            <Popup>
              <div style={{ color: '#333', fontWeight: 'bold' }}>📦 Pickup</div>
              <div style={{ color: '#555' }}>{shipment.pickup_address}</div>
            </Popup>
          </Marker>
          
          {/* Dropoff marker */}
          <Marker position={dropoff} icon={dropoffIcon}>
            <Popup>
              <div style={{ color: '#333', fontWeight: 'bold' }}>📍 Dropoff</div>
              <div style={{ color: '#555' }}>{shipment.dropoff_address}</div>
            </Popup>
          </Marker>
          
          {/* Truck current location */}
          <Marker position={truckCurrent} icon={truckIcon}>
            <Popup>
              <div style={{ color: '#333', fontWeight: 'bold' }}>🚛 Carrier</div>
              <div style={{ color: '#555' }}>Status: {status}</div>
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
        
        <div className="absolute top-4 left-4 z-[1000] w-72">
           <div className="bg-surface/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-glass">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">{shipment.id.substring(0,8).toUpperCase()}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neonBlue/20 text-neonBlue font-semibold">{status}</span>
              </div>
              <p className="text-sm text-textSecondary mb-1">{label}</p>
              <p className="text-xs text-textSecondary mb-1">Weight: {shipment.weight_tons} Tons</p>
              <p className="text-xs text-neonBlue mb-3">ETA: {eta}</p>
              
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-neonBlue h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-textSecondary mt-1 text-right">{progress}% complete</p>
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
