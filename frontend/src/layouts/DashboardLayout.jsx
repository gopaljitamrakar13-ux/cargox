import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, User, Truck, Package, Settings, Map, MessageSquare, Bell, X } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DashboardLayout = () => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background flex text-textPrimary overflow-hidden">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-surface/95 backdrop-blur-xl flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/10">
          <div className="text-2xl font-display font-bold text-white tracking-wide">
            Cargo<span className="text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">X</span>
          </div>
          <button className="md:hidden text-textSecondary hover:text-white" onClick={closeSidebar}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/dashboard" onClick={closeSidebar} className="flex items-center px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium transition-colors border border-primary/20">
            <Package className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link to="/dashboard/shipments" onClick={closeSidebar} className="flex items-center px-4 py-3 text-textSecondary hover:bg-white/5 hover:text-white rounded-lg font-medium transition-colors">
            <Truck className="w-5 h-5 mr-3" /> Shipments
          </Link>
          {(user?.role === 'TruckOwner' || user?.role === 'TransportOwner' || user?.role === 'Admin') && (
            <Link to="/dashboard/trucks" onClick={closeSidebar} className="flex items-center px-4 py-3 text-textSecondary hover:bg-white/5 hover:text-white rounded-lg font-medium transition-colors">
              <Truck className="w-5 h-5 mr-3" /> My Fleet
            </Link>
          )}
          <Link to="/dashboard/tracking" onClick={closeSidebar} className="flex items-center px-4 py-3 text-textSecondary hover:bg-white/5 hover:text-white rounded-lg font-medium transition-colors">
            <Map className="w-5 h-5 mr-3" /> Map Tracking
          </Link>
          <Link to="/dashboard/chat" onClick={closeSidebar} className="flex items-center px-4 py-3 text-textSecondary hover:bg-white/5 hover:text-white rounded-lg font-medium transition-colors">
            <MessageSquare className="w-5 h-5 mr-3" /> Chat & Alerts
          </Link>
          <Link to="/dashboard/profile" onClick={closeSidebar} className="flex items-center px-4 py-3 text-textSecondary hover:bg-white/5 hover:text-white rounded-lg font-medium transition-colors">
            <Settings className="w-5 h-5 mr-3" /> Profile Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => { closeSidebar(); logout(); }}
            className="flex items-center w-full px-4 py-3 text-error hover:bg-error/10 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 bg-surface/30 backdrop-blur-md flex items-center justify-between px-4 md:px-8">
          <button 
            className="md:hidden text-textSecondary hover:text-white p-2"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:block text-xl font-display font-semibold truncate px-4">
            Welcome back, {user?.full_name || user?.email || 'User'}
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
            <button className="relative p-2 text-textSecondary hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-neon-blue">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative w-full">
           <Outlet />
        </main>
      </div>
      <ToastContainer theme="dark" position="top-right" />
    </div>
  );
};

export default DashboardLayout;
