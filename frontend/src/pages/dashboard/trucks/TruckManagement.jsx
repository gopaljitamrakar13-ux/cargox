import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/ui/GlassCard';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { motion } from 'framer-motion';

const TruckManagement = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTrucks = async () => {
    try {
      const response = await api.get('/trucks/');
      setTrucks(response.data);
    } catch (error) {
      toast.error('Failed to fetch trucks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/trucks/', data);
      toast.success('Truck added successfully');
      reset();
      fetchTrucks();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.msg || 'Failed to add truck');
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
        <h1 className="text-3xl font-display font-bold text-white">Truck Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Truck Form */}
        <div className="lg:col-span-1">
          <GlassCard>
            <h2 className="text-xl font-bold text-white mb-4">Add New Truck</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registration Number"
                placeholder="e.g. MH-12-AB-1234"
                {...register('registration_number', { required: 'Registration is required' })}
                error={errors.registration_number?.message}
              />
              <Input
                label="Capacity (Tons)"
                type="number"
                step="0.1"
                placeholder="e.g. 15.5"
                {...register('capacity_tons', { required: 'Capacity is required' })}
                error={errors.capacity_tons?.message}
              />
              <div className="flex flex-col w-full">
                <label className="text-sm font-medium text-textSecondary mb-2">Truck Type</label>
                <select 
                  className="glass-input appearance-none bg-surface"
                  {...register('truck_type')}
                >
                  <option value="Open">Open</option>
                  <option value="Container">Container</option>
                  <option value="Trailer">Trailer</option>
                  <option value="Refrigerated">Refrigerated</option>
                </select>
              </div>
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Add Truck
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Trucks List */}
        <div className="lg:col-span-2">
          <GlassCard className="h-full min-h-[400px]">
            <h2 className="text-xl font-bold text-white mb-4">Your Fleet</h2>
            {loading ? (
              <div className="text-textSecondary">Loading trucks...</div>
            ) : trucks.length === 0 ? (
              <div className="text-textSecondary">No trucks found. Add your first truck.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-textSecondary text-sm">
                      <th className="pb-3 font-medium">Registration</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Capacity (Tons)</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map(truck => (
                      <tr key={truck.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 text-white font-medium">{truck.registration_number}</td>
                        <td className="py-4 text-textSecondary">{truck.truck_type}</td>
                        <td className="py-4 text-textSecondary">{truck.capacity_tons}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            truck.status === 'AVAILABLE' ? 'bg-success/20 text-success' : 
                            truck.status === 'IN_TRANSIT' ? 'bg-accent/20 text-accent' : 
                            'bg-error/20 text-error'
                          }`}>
                            {truck.status}
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

export default TruckManagement;
