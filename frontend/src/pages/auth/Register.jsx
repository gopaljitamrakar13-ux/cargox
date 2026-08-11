import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';

const Register = () => {
  const { register: registerForm, handleSubmit, formState: { errors }, watch } = useForm();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await register({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role
    });
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Registration successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Failed to register');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md my-8"
    >
      <GlassCard className="w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Create Account</h2>
          <p className="text-textSecondary">Join the CargoX logistics network</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            disabled={isLoading}
            {...registerForm('full_name', { required: 'Name is required' })}
            error={errors.full_name?.message}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            disabled={isLoading}
            {...registerForm('email', { required: 'Email is required' })}
            error={errors.email?.message}
          />
          
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-textSecondary mb-2">Account Type</label>
            <select 
              className="glass-input appearance-none bg-surface"
              disabled={isLoading}
              {...registerForm('role', { required: 'Role is required' })}
            >
              <option value="Customer">Customer (Sender)</option>
              <option value="TruckOwner">Truck Owner</option>
              <option value="TransportOwner">Transport Company</option>
              <option value="Driver">Driver</option>
            </select>
          </div>
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...registerForm('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' }
            })}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...registerForm('confirmPassword', { 
              validate: value => value === password || 'Passwords do not match'
            })}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-medium hover:text-neonBlue transition-colors">
            Sign In
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Register;
