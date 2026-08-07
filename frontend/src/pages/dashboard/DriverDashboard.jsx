import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

const DriverDashboard = () => {
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
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">In Transit</span>
          </div>
          <div className="text-textSecondary mb-6">
            <p className="mb-2"><strong>From:</strong> Warehouse A, New York</p>
            <p><strong>To:</strong> Distribution Center, Boston</p>
          </div>
          <button className="btn-primary w-full">Open Navigation</button>
        </GlassCard>
        
        <GlassCard className="flex flex-col justify-center">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button className="btn-outline w-full text-left justify-start">Update Status</button>
            <button className="btn w-full bg-error/20 text-error hover:bg-error/30 text-left justify-start">SOS / Emergency Report</button>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default DriverDashboard;
