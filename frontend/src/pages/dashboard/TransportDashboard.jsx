import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

const TransportDashboard = () => {
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
          <div className="text-3xl font-bold text-primary mb-2">24</div>
          <div className="text-textSecondary text-sm">Total Fleet</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-3xl font-bold text-neonBlue mb-2">18</div>
          <div className="text-textSecondary text-sm">Active Drivers</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-3xl font-bold text-accent mb-2">8</div>
          <div className="text-textSecondary text-sm">Active Trips</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-2xl font-bold text-success mb-2">$24.5K</div>
          <div className="text-textSecondary text-sm">Monthly Revenue</div>
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
