import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import GateSelection from './pages/GateSelection';
import Scanner from './pages/Scanner';
import Capacity from './pages/Capacity';

function App() {
  const [selectedGate, setSelectedGate] = useState<string | null>(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/gate-selection" 
            element={<GateSelection onSelectGate={setSelectedGate} />} 
          />
          <Route 
            path="/scanner" 
            element={
              selectedGate ? 
                <Scanner gate={selectedGate} onBack={() => setSelectedGate(null)} /> : 
                <Navigate to="/gate-selection" />
            } 
          />
          <Route 
            path="/capacity" 
            element={<Capacity />} 
          />
          <Route path="/" element={<Navigate to="/gate-selection" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
