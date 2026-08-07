import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        reset(response.data);
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.put('/users/profile', data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="text-white">Loading profile...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-display font-bold text-white mb-6">Profile Settings</h1>
      
      <GlassCard>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              {...register('full_name', { required: 'Name is required' })}
              error={errors.full_name?.message}
            />
            
            <Input
              label="Email Address"
              type="email"
              disabled
              {...register('email')}
              className="opacity-70"
            />

            <Input
              label="Phone Number"
              type="tel"
              {...register('phone')}
            />

            {(user?.role === 'Customer' || user?.role === 'TruckOwner' || user?.role === 'TransportOwner') && (
              <Input
                label="Company Name"
                type="text"
                {...register('company_name')}
              />
            )}

            {user?.role === 'Driver' && (
              <Input
                label="License Number"
                type="text"
                {...register('license_number')}
              />
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
};

export default ProfileSettings;
