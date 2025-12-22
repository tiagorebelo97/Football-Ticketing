import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MatchList from './pages/MatchList';
import MatchCreate from './pages/MatchCreate';
import NFCInventory from './pages/NFCInventory';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/matches" element={<MatchList />} />
          <Route path="/create-match" element={<MatchCreate />} />
          <Route path="/club-members" element={<div className="card">Club Members Placeholder</div>} />
          <Route path="/calendar" element={<div className="card">Calendar Placeholder</div>} />
          <Route path="/venues" element={<div className="card">Venues Placeholder</div>} />
          <Route path="/nfc-inventory" element={<NFCInventory />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
