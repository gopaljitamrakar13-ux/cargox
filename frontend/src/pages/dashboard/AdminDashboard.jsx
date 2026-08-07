import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-display font-bold text-white">Platform Administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-3xl font-bold text-primary mb-2">1,204</div>
          <div className="text-textSecondary text-sm">Total Users</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-3xl font-bold text-neonBlue mb-2">432</div>
          <div className="text-textSecondary text-sm">Active Shipments</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-3xl font-bold text-accent mb-2">15</div>
          <div className="text-textSecondary text-sm">Pending Verifications</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6">
          <div className="text-2xl font-bold text-success mb-2">$124.5K</div>
          <div className="text-textSecondary text-sm">Platform Revenue</div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
