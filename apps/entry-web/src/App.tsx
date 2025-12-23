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
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/match-selection"
            element={<MatchSelection onSelectMatch={setSelectedMatch} />}
          />
          <Route
            path="/gate-selection"
            element={
              selectedMatch ?
                <GateSelection onSelectGate={setSelectedGate} matchName={`${selectedMatch.home_team} vs ${selectedMatch.away_team}`} /> :
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
                  onBack={() => setSelectedGate(null)}
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
