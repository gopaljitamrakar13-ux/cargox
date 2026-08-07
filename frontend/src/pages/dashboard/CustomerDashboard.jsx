import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

const CustomerDashboard = () => {
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
          <div className="text-4xl font-bold text-primary mb-2">12</div>
          <div className="text-textSecondary">Active Shipments</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl font-bold text-accent mb-2">5</div>
          <div className="text-textSecondary">Pending Payments</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl font-bold text-success mb-2">48</div>
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
