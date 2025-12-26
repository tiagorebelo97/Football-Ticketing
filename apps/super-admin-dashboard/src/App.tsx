import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import ClubsList from './pages/ClubsList';
import ClubForm from './pages/ClubForm';
import CountriesList from './pages/CountriesList';
import CountryForm from './pages/CountryForm';
import CountryDetail from './pages/CountryDetail';
import VenuesList from './pages/VenuesList';
import VenueForm from './pages/VenueForm';
import CompetitionsList from './pages/CompetitionsList';
import CompetitionForm from './pages/CompetitionForm';
import SeasonsList from './pages/SeasonsList';
import SeasonForm from './pages/SeasonForm';
import NFCStockConfig from './pages/NFCStockConfig';
import FeeConfig from './pages/FeeConfig';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/countries" replace />} />

            {/* Countries */}
            <Route path="/countries" element={<CountriesList />} />
            <Route path="/countries/new" element={<CountryForm />} />
            <Route path="/countries/:id" element={<CountryDetail />} />
            <Route path="/countries/:id/edit" element={<CountryForm />} />

            {/* Clubs */}
            <Route path="/clubs" element={<ClubsList />} />
            <Route path="/clubs/new" element={<ClubForm />} />
            <Route path="/clubs/:id/edit" element={<ClubForm />} />
            <Route path="/nfc-config/:clubId" element={<NFCStockConfig />} />
            <Route path="/fee-config/:clubId" element={<FeeConfig />} />

            {/* Venues */}
            <Route path="/venues" element={<VenuesList />} />
            <Route path="/venues/new" element={<VenueForm />} />
            <Route path="/venues/:id/edit" element={<VenueForm />} />

            {/* Competitions */}
            <Route path="/competitions" element={<CompetitionsList />} />
            <Route path="/competitions/new" element={<CompetitionForm />} />
            <Route path="/competitions/:id/edit" element={<CompetitionForm />} />

            {/* Seasons */}
            <Route path="/seasons" element={<SeasonsList />} />
            <Route path="/seasons/new" element={<SeasonForm />} />
            <Route path="/seasons/:id/edit" element={<SeasonForm />} />

            {/* Legacy routes */}
            <Route path="/users" element={<UserManagement />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
