import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import GlassCard from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

const DriverDashboard = () => {
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get('/shipments/');
        const trip = res.data.find(s => s.status === 'IN_TRANSIT' || s.status === 'ASSIGNED');
        setActiveTrip(trip);
      } catch (error) {
        console.error('Failed to fetch trip', error);
      }
    };
    fetchTrip();
  }, []);

  const handleSOS = async () => {
    if (!activeTrip) return;
    if (!window.confirm("Are you sure you want to trigger an SOS alert?")) return;
    
    setLoading(true);
    try {
      await api.post(`/shipments/${activeTrip.id}/sos`);
      setMessage('SOS Alert sent to Transport Owner.');
    } catch (error) {
      setMessage('Failed to send SOS');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleUpdateStatus = async (status) => {
    if (!activeTrip) return;
    setLoading(true);
    try {
      await api.put(`/shipments/${activeTrip.id}`, { status });
      setActiveTrip({...activeTrip, status});
      setMessage(`Status updated to ${status}`);
    } catch (error) {
      setMessage('Failed to update status');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleNavigation = () => {
    if (!activeTrip) return;
    if (activeTrip.pickup_lat && activeTrip.dropoff_lat) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${activeTrip.pickup_lat},${activeTrip.pickup_lng}&destination=${activeTrip.dropoff_lat},${activeTrip.dropoff_lng}`;
      window.open(url, '_blank');
    } else {
      setMessage("Coordinates not available for this trip.");
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-display font-bold text-white">Driver Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Current Trip</h2>
            {activeTrip && <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">{activeTrip.status}</span>}
          </div>
          {activeTrip ? (
            <>
              <div className="text-textSecondary mb-6">
                <p className="mb-2"><strong>From:</strong> {activeTrip.pickup_address}</p>
                <p><strong>To:</strong> {activeTrip.dropoff_address}</p>
              </div>
              <button onClick={handleNavigation} className="btn-primary w-full">Open Navigation</button>
            </>
          ) : (
            <div className="text-textSecondary text-center py-4">No active trips currently assigned.</div>
          )}
        </GlassCard>
        
        <GlassCard className="flex flex-col justify-center">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          {message && (
            <div className="mb-4 p-2 bg-primary/20 border border-primary/50 text-white rounded text-center text-sm">
              {message}
            </div>
          )}
          <div className="space-y-4">
            <button 
              onClick={() => handleUpdateStatus(activeTrip?.status === 'ASSIGNED' ? 'IN_TRANSIT' : 'DELIVERED')} 
              disabled={loading || !activeTrip} 
              className="btn-outline w-full text-left justify-start disabled:opacity-50"
            >
              Update Status ({activeTrip?.status === 'ASSIGNED' ? 'Start Trip' : 'Mark Delivered'})
            </button>
            <button 
              onClick={handleSOS} 
              disabled={loading || !activeTrip} 
              className="btn w-full bg-error/20 text-error hover:bg-error/30 text-left justify-start disabled:opacity-50"
            >
              SOS / Emergency Report
            </button>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default DriverDashboard;
