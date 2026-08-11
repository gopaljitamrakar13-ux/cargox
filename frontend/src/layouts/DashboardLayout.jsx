import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { LogOut, Menu, User, Truck, Package, Settings, Map, MessageSquare, Bell, X } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DashboardLayout = () => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
          <div className="flex items-center space-x-2 md:space-x-4 ml-auto relative">
            <button 
              className="relative p-2 text-textSecondary hover:text-white transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] flex items-center justify-center bg-error text-white font-bold rounded-full">{unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-12 right-12 w-80 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-glass z-50 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <h3 className="text-white font-bold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-textSecondary text-sm">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-white/5 text-sm ${n.is_read ? 'opacity-60' : 'bg-primary/10'}`}
                        onClick={() => !n.is_read && markAsRead(n.id)}
                      >
                        <h4 className={`font-semibold ${n.is_read ? 'text-textSecondary' : 'text-white'}`}>{n.title}</h4>
                        <p className="text-textSecondary mt-1">{n.message}</p>
                        <div className="text-[10px] text-textSecondary mt-2">
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
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
