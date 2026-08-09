import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/ui/GlassCard';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { motion } from 'framer-motion';

const ShipmentManagement = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchShipments = async () => {
    try {
      const response = await api.get('/shipments/');
      setShipments(response.data);
    } catch (error) {
      toast.error('Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/shipments/', data);
      toast.success('Shipment created successfully');
      reset();
      fetchShipments();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.msg || 'Failed to create shipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Shipment Management</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Create Shipment Form (Only for Customers) */}
        {(user?.role === 'Customer' || user?.role === 'Admin') && (
          <div className="xl:col-span-1">
            <GlassCard>
              <h2 className="text-xl font-bold text-white mb-4">Create Shipment</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Pickup Address"
                  placeholder="Full pickup address"
                  {...register('pickup_address', { required: 'Required' })}
                  error={errors.pickup_address?.message}
                />
                <Input
                  label="Drop-off Address"
                  placeholder="Full destination address"
                  {...register('dropoff_address', { required: 'Required' })}
                  error={errors.dropoff_address?.message}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Weight (Tons)"
                    type="number"
                    step="0.1"
                    {...register('weight_tons', { required: 'Required' })}
                    error={errors.weight_tons?.message}
                  />
                  <Input
                    label="Material Type"
                    {...register('material_type', { required: 'Required' })}
                    error={errors.material_type?.message}
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Create Shipment
                </Button>
              </form>
            </GlassCard>
          </div>
        )}

        {/* Shipments List */}
        <div className={user?.role === 'Customer' || user?.role === 'Admin' ? 'xl:col-span-2' : 'xl:col-span-3'}>
          <GlassCard className="h-full min-h-[400px]">
            <h2 className="text-xl font-bold text-white mb-4">All Shipments</h2>
            {loading ? (
              <div className="text-textSecondary">Loading shipments...</div>
            ) : shipments.length === 0 ? (
              <div className="text-textSecondary">No shipments found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-textSecondary text-sm">
                      <th className="pb-3 font-medium">ID / Date</th>
                      <th className="pb-3 font-medium">Route</th>
                      <th className="pb-3 font-medium">Weight</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map(shipment => (
                      <tr key={shipment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="text-white font-medium">{shipment.id.substring(0,8).toUpperCase()}</div>
                          <div className="text-xs text-textSecondary">{new Date(shipment.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4">
                          <div className="text-sm text-white truncate max-w-[200px]">{shipment.pickup_address}</div>
                          <div className="text-xs text-textSecondary">↓</div>
                          <div className="text-sm text-white truncate max-w-[200px]">{shipment.dropoff_address}</div>
                        </td>
                        <td className="py-4 text-textSecondary">{shipment.weight_tons} Tons</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            shipment.status === 'DELIVERED' ? 'bg-success/20 text-success' : 
                            shipment.status === 'PENDING' ? 'bg-primary/20 text-primary' : 
                            'bg-accent/20 text-accent'
                          }`}>
                            {shipment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};

export default ShipmentManagement;
