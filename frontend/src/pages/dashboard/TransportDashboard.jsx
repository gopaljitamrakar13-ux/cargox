import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import GlassCard from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

const TransportDashboard = () => {
  const [stats, setStats] = useState({ total_fleet: 0, active_drivers: 0, active_trips: 0, monthly_revenue: 0 });

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
        <h1 className="text-3xl font-display font-bold text-white">Transport Company Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-3xl font-bold text-primary mb-2">{stats.total_fleet}</div>
          <div className="text-textSecondary text-sm">Total Fleet</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-3xl font-bold text-neonBlue mb-2">{stats.active_drivers}</div>
          <div className="text-textSecondary text-sm">Active Drivers</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-3xl font-bold text-accent mb-2">{stats.active_trips}</div>
          <div className="text-textSecondary text-sm">Active Trips</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-2xl font-bold text-success mb-2">${stats.monthly_revenue.toFixed(1)}</div>
          <div className="text-textSecondary text-sm">Total Revenue</div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-xl font-bold text-white mb-4">Company Overview</h2>
        <div className="text-textSecondary text-center py-8">
          Transport management will be implemented in Phase 5.
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default TransportDashboard;
