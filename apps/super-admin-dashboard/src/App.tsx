import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import ClubList from './pages/ClubList';
import ClubProvisioning from './pages/ClubProvisioning';
import NFCStockConfig from './pages/NFCStockConfig';
import FeeConfig from './pages/FeeConfig';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const ProtectedLayout = () => {
  return (
    <RequireAuth>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<ClubList />} />
            <Route path="/provision" element={<ClubProvisioning />} />
            <Route path="/nfc-config/:clubId" element={<NFCStockConfig />} />
            <Route path="/fee-config/:clubId" element={<FeeConfig />} />
            <Route path="/users" element={<UserManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
