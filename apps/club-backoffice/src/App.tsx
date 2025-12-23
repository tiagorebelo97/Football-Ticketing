

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MatchList from './pages/MatchList';
import MatchCreate from './pages/MatchCreate';
import NFCInventory from './pages/NFCInventory';
import Reports from './pages/Reports';
import Login from './pages/Login';
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
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/matches" element={<MatchList />} />
            <Route path="/create-match" element={<MatchCreate />} />
            <Route path="/club-members" element={<div className="card">Club Members Placeholder</div>} />
            <Route path="/calendar" element={<div className="card">Calendar Placeholder</div>} />
            <Route path="/venues" element={<div className="card">Venues Placeholder</div>} />
            <Route path="/nfc-inventory" element={<NFCInventory />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
