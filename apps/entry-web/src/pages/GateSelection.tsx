import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GateSelectionProps {
  onSelectGate: (gate: string) => void;
}

const GateSelection: React.FC<GateSelectionProps> = ({ onSelectGate }) => {
  const navigate = useNavigate();

  const gates = ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E'];

  const handleGateSelect = (gate: string) => {
    onSelectGate(gate);
    navigate('/scanner');
  };

  return (
    <div>
      <div className="header">
        <h1>Entry Web App</h1>
        <div className="nav-buttons">
          <button className="nav-button" onClick={() => navigate('/capacity')}>
            Capacity Dashboard
          </button>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2 style={{ textAlign: 'center' }}>Select Entry Gate</h2>
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
            Choose which gate you are managing to start validating entries
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
