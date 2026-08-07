import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Globe, ShieldCheck, Zap, ArrowRight, BarChart3, Clock } from 'lucide-react';
import HeroScene from '../../components/3d/HeroScene';
import GlassCard from '../../components/ui/GlassCard';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* 3D Background */}
      <HeroScene />
      
      {/* Navbar */}
      <nav className="relative z-50 w-full px-6 py-6 max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-display font-black text-white tracking-wider flex items-center gap-2">
          <Truck className="text-primary w-8 h-8" />
          CargoX<span className="text-primary">.</span>
        </div>
        <div className="flex gap-4">
          <Link to="/auth/login" className="px-6 py-2 text-white hover:text-primary transition-colors font-medium">
            Sign In
          </Link>
          <Link to="/auth/register" className="btn-primary">
            Join Network
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-20 mb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-block">
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-semibold tracking-wide uppercase shadow-glass backdrop-blur-md">
              The Next Generation Freight Network
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-display font-black text-white leading-tight">
            Logistics, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-neonBlue to-primary animate-pulse">
              Reimagined.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-textSecondary max-w-2xl mx-auto leading-relaxed">
            CargoX instantly connects shippers with a highly vetted network of carriers. Experience real-time visibility, automated pricing, and premium reliability.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/auth/register" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 shadow-neon-blue">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/auth/login" className="btn-outline text-lg px-8 py-4 flex items-center justify-center bg-white/5">
              View Live Demo
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 py-20 bg-surface/50 backdrop-blur-lg border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-white mb-4">Engineered for Scale</h2>
            <p className="text-textSecondary text-lg max-w-2xl mx-auto">Built on a modern microservices architecture to ensure maximum uptime and performance for enterprise shippers.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <GlassCard className="hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Global Tracking</h3>
              <p className="text-textSecondary">Real-time geospatial tracking utilizing high-frequency telemetry. Know exactly where your freight is.</p>
            </GlassCard>

            <GlassCard className="hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Booking</h3>
              <p className="text-textSecondary">Algorithmic matching pairs your load with the optimal carrier in seconds, eliminating endless phone calls.</p>
            </GlassCard>

            <GlassCard className="hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Verified Network</h3>
              <p className="text-textSecondary">Every carrier undergoes rigorous vetting. Automated compliance checks keep your supply chain secure.</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-white/10 text-center text-textSecondary bg-background">
        <p>© 2026 CargoX Logistics Network. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
