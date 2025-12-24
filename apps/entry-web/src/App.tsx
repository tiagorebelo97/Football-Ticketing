import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import './App.css';
import MatchSelection from './pages/MatchSelection';
import GateSelection from './pages/GateSelection';
import Scanner from './pages/Scanner';
import Capacity from './pages/Capacity';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
}

function App() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(() => {
    const stored = localStorage.getItem('entry_selectedMatch');
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedGate, setSelectedGate] = useState<string | null>(() => {
    return localStorage.getItem('entry_selectedGate');
  });

  const handleSelectMatch = (match: Match | null) => {
    if (match) {
      localStorage.setItem('entry_selectedMatch', JSON.stringify(match));
    } else {
      localStorage.removeItem('entry_selectedMatch');
    }
    setSelectedMatch(match);
  };

  const handleSelectGate = (gate: string | null) => {
    if (gate) {
      localStorage.setItem('entry_selectedGate', gate);
    } else {
      localStorage.removeItem('entry_selectedGate');
    }
    setSelectedGate(gate);
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/match-selection"
            element={<MatchSelection onSelectMatch={handleSelectMatch} />}
          />
          <Route
            path="/gate-selection"
            element={
              selectedMatch ?
                <GateSelection onSelectGate={handleSelectGate} matchName={`${selectedMatch.home_team} vs ${selectedMatch.away_team}`} /> :
                <Navigate to="/match-selection" />
            }
          />
          <Route
            path="/scanner"
            element={
              selectedMatch && selectedGate ?
                <Scanner
                  matchId={selectedMatch.id}
                  matchName={`${selectedMatch.home_team} vs ${selectedMatch.away_team}`}
                  gate={selectedGate}
                  onBack={() => handleSelectGate(null)}
                /> :
                <Navigate to="/match-selection" />
            }
          />
          <Route
            path="/capacity"
            element={<Capacity initialMatchId={selectedMatch?.id} />}
          />
          <Route path="/" element={<Navigate to="/match-selection" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
