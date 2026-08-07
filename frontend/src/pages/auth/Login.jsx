import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Failed to login');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <GlassCard className="w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-textSecondary">Sign in to your CargoX account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="enter your email"
            {...register('email', { required: 'Email is required' })}
            error={errors.email?.message}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-textSecondary cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" className="mr-2 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-background" />
              Remember me
            </label>
            <a href="#" className="text-sm text-primary hover:text-neonBlue transition-colors drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary font-medium hover:text-neonBlue transition-colors">
            Create one
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Login;
