import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import TruckOwnerDashboard from './TruckOwnerDashboard';
import TransportDashboard from './TransportDashboard';
import DriverDashboard from './DriverDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return <div className="text-white text-center mt-10">Loading Dashboard...</div>;
  }

  switch (user.role) {
    case 'Customer':
      return <CustomerDashboard />;
    case 'TruckOwner':
      return <TruckOwnerDashboard />;
    case 'TransportOwner':
      return <TransportDashboard />;
    case 'Driver':
      return <DriverDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    default:
      return <div className="text-white text-center mt-10">Invalid Role Detected. Please contact support.</div>;
  }
};

export default DashboardRouter;
