import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

const TruckOwnerDashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Truck Owner Dashboard</h1>
        <button className="btn-primary">Add Truck</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl font-bold text-primary mb-2">3</div>
          <div className="text-textSecondary">Available Trucks</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl font-bold text-accent mb-2">2</div>
          <div className="text-textSecondary">Trucks In Transit</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-8">
          <div className="text-2xl font-bold text-success mb-2">$4,250</div>
          <div className="text-textSecondary">Monthly Revenue</div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-xl font-bold text-white mb-4">Fleet Status</h2>
        <div className="text-textSecondary text-center py-8">
          Fleet management will be implemented in Phase 5.
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default TruckOwnerDashboard;
