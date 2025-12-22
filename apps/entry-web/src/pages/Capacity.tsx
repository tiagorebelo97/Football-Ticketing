import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const Capacity: React.FC = () => {
  const navigate = useNavigate();
  const [matchId, setMatchId] = useState('');
  const [capacity, setCapacity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const API_URL = process.env.REACT_APP_ENTRY_API_URL || 'http://entry-api.localhost';

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const handleLoadCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/validation/capacity/${matchId}`);
      setCapacity(response.data);
      
      // Connect to WebSocket for live updates
      const newSocket = io(API_URL);
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('subscribe-match', matchId);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('capacity-update', (data: any) => {
        if (data.matchId === matchId) {
          setCapacity(data);
        }
      });

      setSocket(newSocket);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load capacity data');
    } finally {
      setLoading(false);
    }
  };

  const getCapacityPercentage = () => {
    if (!capacity) return 0;
    return (capacity.currentAttendance / capacity.totalCapacity) * 100;
  };

  const getCapacityClass = () => {
    const percentage = getCapacityPercentage();
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return '';
  };

  return (
    <div>
      <div className="header">
        <h1>Capacity Dashboard</h1>
        <div className="nav-buttons">
          <button className="nav-button" onClick={() => navigate('/gate-selection')}>
            Back to Gates
          </button>
        </div>
      </div>

      <div className="container capacity-dashboard">
        <div className="card">
          <h2>Live Match Capacity Tracking</h2>
          
          {!capacity && (
            <form onSubmit={handleLoadCapacity}>
              <div className="form-group">
                <label htmlFor="matchId">Match ID</label>
                <input
                  type="text"
                  id="matchId"
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  placeholder="Enter Match ID to track"
                  required
                  disabled={loading}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button 
                type="submit" 
                className="button-primary"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load Capacity Data'}
              </button>
            </form>
          )}
        </div>

        {capacity && (
          <div className="capacity-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{capacity.matchName || `Match ${matchId}`}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: isConnected ? '#27ae60' : '#e74c3c',
                  display: 'inline-block'
                }}></span>
                <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
                  {isConnected ? 'Live Updates Active' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="capacity-bar">
              <div 
                className={`capacity-fill ${getCapacityClass()}`}
                style={{ width: `${getCapacityPercentage()}%` }}
              >
                {getCapacityPercentage().toFixed(1)}%
              </div>
            </div>

            <div className="capacity-stats">
              <div className="stat-box">
                <h3>Current Attendance</h3>
                <div className="value">{capacity.currentAttendance || 0}</div>
              </div>

              <div className="stat-box">
                <h3>Total Capacity</h3>
                <div className="value">{capacity.totalCapacity || 0}</div>
              </div>

              <div className="stat-box">
                <h3>Available Spots</h3>
                <div className="value">
                  {(capacity.totalCapacity || 0) - (capacity.currentAttendance || 0)}
                </div>
              </div>

              <div className="stat-box">
                <h3>Tickets Sold</h3>
                <div className="value">{capacity.ticketsSold || 0}</div>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                className="button-secondary"
                onClick={() => {
                  if (socket) socket.disconnect();
                  setCapacity(null);
                  setMatchId('');
                  setIsConnected(false);
                }}
              >
                Track Different Match
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Capacity;
