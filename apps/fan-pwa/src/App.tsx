
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import MatchCalendar from './pages/MatchCalendar';
import TicketCheckout from './pages/TicketCheckout';
import MyTickets from './pages/MyTickets';
import TicketDetail from './pages/TicketDetail';
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
            <Route path="/" element={<MatchCalendar />} />
            <Route path="/checkout/:matchId" element={<TicketCheckout />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/ticket/:ticketId" element={<TicketDetail />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
