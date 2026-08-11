import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import GlassCard from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

const CustomerDashboard = () => {
  const [stats, setStats] = useState({ active_shipments: 0, pending_payments: 0, total_shipments: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Customer Dashboard</h1>
        <button className="btn-primary">New Shipment</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl font-bold text-primary mb-2">{stats.active_shipments}</div>
          <div className="text-textSecondary">Active Shipments</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl font-bold text-accent mb-2">{stats.pending_payments}</div>
          <div className="text-textSecondary">Pending Shipments</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl font-bold text-success mb-2">{stats.total_shipments}</div>
          <div className="text-textSecondary">Total Shipments</div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-xl font-bold text-white mb-4">Recent Shipments</h2>
        <div className="text-textSecondary text-center py-8">
          Shipment list will be implemented in Phase 5.
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default CustomerDashboard;
