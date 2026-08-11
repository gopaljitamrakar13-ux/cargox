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
  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { errors: editErrors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);

  useEffect(() => {
    if (editingTruck) {
      resetEdit(editingTruck);
    }
  }, [editingTruck, resetEdit]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this truck?')) return;
    try {
      await api.delete(`/trucks/${id}`);
      toast.success('Truck deleted successfully');
      fetchTrucks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete truck');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await api.put(`/trucks/${editingTruck.id}`, data);
      toast.success('Truck updated successfully');
      setEditingTruck(null);
      fetchTrucks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update truck');
    }
  };

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
                      <th className="pb-3 font-medium text-right">Actions</th>
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
                        <td className="py-4 text-right space-x-3">
                          <button onClick={() => setEditingTruck(truck)} className="text-primary hover:text-neonBlue text-sm font-medium transition-colors">Edit</button>
                          <button onClick={() => handleDelete(truck.id)} className="text-error hover:text-red-400 text-sm font-medium transition-colors">Delete</button>
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

      {/* Edit Modal */}
      {editingTruck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Truck</h2>
              <button onClick={() => setEditingTruck(null)} className="text-textSecondary hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
              <Input
                label="Registration Number"
                {...registerEdit('registration_number', { required: 'Required' })}
                error={editErrors.registration_number?.message}
              />
              <Input
                label="Capacity (Tons)"
                type="number"
                step="0.1"
                {...registerEdit('capacity_tons', { required: 'Required' })}
                error={editErrors.capacity_tons?.message}
              />
              <div className="flex flex-col w-full">
                <label className="text-sm font-medium text-textSecondary mb-2">Truck Type</label>
                <select 
                  className="glass-input appearance-none bg-surface"
                  {...registerEdit('truck_type')}
                >
                  <option value="Open">Open</option>
                  <option value="Container">Container</option>
                  <option value="Trailer">Trailer</option>
                  <option value="Refrigerated">Refrigerated</option>
                </select>
              </div>
              <div className="flex flex-col w-full">
                <label className="text-sm font-medium text-textSecondary mb-2">Status</label>
                <select 
                  className="glass-input appearance-none bg-surface"
                  {...registerEdit('status')}
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" onClick={() => setEditingTruck(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </motion.div>
  );
};

export default TruckManagement;
