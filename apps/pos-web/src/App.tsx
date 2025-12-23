import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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
                <Layout staffInfo={staffInfo} onLogout={handleLogout}>
                  <Dashboard staffInfo={staffInfo} onLogout={handleLogout} />
                </Layout> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/payment"
            element={
              isAuthenticated ?
                <Layout staffInfo={staffInfo} onLogout={handleLogout}>
                  <Payment staffInfo={staffInfo} onLogout={handleLogout} />
                </Layout> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/nfc-assignment"
            element={
              isAuthenticated ?
                <Layout staffInfo={staffInfo} onLogout={handleLogout}>
                  <NFCAssignment staffInfo={staffInfo} onLogout={handleLogout} />
                </Layout> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/refund"
            element={
              isAuthenticated ?
                <Layout staffInfo={staffInfo} onLogout={handleLogout}>
                  <Refund staffInfo={staffInfo} onLogout={handleLogout} />
                </Layout> :
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
