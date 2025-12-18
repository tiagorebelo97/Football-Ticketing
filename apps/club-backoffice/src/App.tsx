import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MatchList from './pages/MatchList';
import MatchCreate from './pages/MatchCreate';
import NFCInventory from './pages/NFCInventory';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>🏟️ Club Backoffice</h1>
        </header>
        <nav className="nav">
          <a href="/">Matches</a>
          <a href="/nfc-inventory">NFC Inventory</a>
          <a href="/reports">Reports</a>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<MatchList />} />
            <Route path="/create-match" element={<MatchCreate />} />
            <Route path="/nfc-inventory" element={<NFCInventory />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
