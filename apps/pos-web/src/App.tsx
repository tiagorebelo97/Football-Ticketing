import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import NFCAssignment from './pages/NFCAssignment';
import Refund from './pages/Refund';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffInfo, setStaffInfo] = useState<any>(null);

  const handleLogin = (staff: any) => {
    setIsAuthenticated(true);
    setStaffInfo(staff);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStaffInfo(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard staffInfo={staffInfo} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/payment" 
            element={
              isAuthenticated ? 
                <Payment staffInfo={staffInfo} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/nfc-assignment" 
            element={
              isAuthenticated ? 
                <NFCAssignment staffInfo={staffInfo} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/refund" 
            element={
              isAuthenticated ? 
                <Refund staffInfo={staffInfo} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
