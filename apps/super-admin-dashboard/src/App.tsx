import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClubList from './pages/ClubList';
import ClubProvisioning from './pages/ClubProvisioning';
import NFCStockConfig from './pages/NFCStockConfig';
import FeeConfig from './pages/FeeConfig';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>⚙️ Super Admin Dashboard</h1>
        </header>
        <nav className="nav">
          <a href="/">Clubs</a>
          <a href="/provision">Provision Club</a>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<ClubList />} />
            <Route path="/provision" element={<ClubProvisioning />} />
            <Route path="/nfc-config/:clubId" element={<NFCStockConfig />} />
            <Route path="/fee-config/:clubId" element={<FeeConfig />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
