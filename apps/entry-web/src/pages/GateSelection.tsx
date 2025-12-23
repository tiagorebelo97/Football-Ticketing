import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GateSelectionProps {
  onSelectGate: (gate: string) => void;
  matchName: string;
}

const GateSelection: React.FC<GateSelectionProps> = ({ onSelectGate, matchName }) => {
  const navigate = useNavigate();

  const gates = ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E'];

  const handleGateSelect = (gate: string) => {
    onSelectGate(gate);
    navigate('/scanner');
  };

  return (
    <div>
      <div className="header">
        <h1>{matchName}</h1>
        <div className="nav-buttons">
          <button className="btn btn-outline" onClick={() => navigate('/match-selection')}>
            Change Match
          </button>
        </div>
      </div>

      <div className="container">
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h2>Select Entry Gate</h2>
          <p style={{ color: 'var(--color-text-dim)' }}>
            Choose which gate you are managing
          </p>
        </div>

        <div className="gate-grid">
          {gates.map((gate) => (
            <div
              key={gate}
              className="gate-card"
              onClick={() => handleGateSelect(gate)}
            >
              <h3>🚪 {gate}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GateSelection;
