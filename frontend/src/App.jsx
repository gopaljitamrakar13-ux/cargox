import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import DashboardRouter from './pages/dashboard/DashboardRouter';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import TruckManagement from './pages/dashboard/trucks/TruckManagement';
import ShipmentManagement from './pages/dashboard/shipments/ShipmentManagement';
import MapTracking from './pages/dashboard/shipments/MapTracking';
import ChatApp from './pages/dashboard/chat/ChatApp';
import Landing from './pages/public/Landing';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRouter />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="trucks" element={<TruckManagement />} />
            <Route path="shipments" element={<ShipmentManagement />} />
            <Route path="tracking" element={<MapTracking />} />
            <Route path="chat" element={<ChatApp />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
