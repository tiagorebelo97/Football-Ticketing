import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface CapacityProps {
  initialMatchId?: string;
}

const Capacity: React.FC<CapacityProps> = ({ initialMatchId }) => {
  const navigate = useNavigate();
  const [matchId, setMatchId] = useState(initialMatchId || '');
  const [capacity, setCapacity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const API_URL = process.env.REACT_APP_ENTRY_API_URL || 'http://entry-api.localhost';

  useEffect(() => {
    if (initialMatchId) {
      loadCapacityData(initialMatchId);
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [initialMatchId]);

  const loadCapacityData = async (id: string) => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/validation/capacity/${id}`);
      setCapacity(response.data);

      if (socket) socket.disconnect();

      const newSocket = io(API_URL);
      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('subscribe-match', id);
      });

      newSocket.on('disconnect', () => setIsConnected(false));
      newSocket.on('capacity-update', (data: any) => {
        if (data.matchId === id) setCapacity(data);
      });

      setSocket(newSocket);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load capacity data');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchId.trim()) loadCapacityData(matchId);
  };

  const getPercentage = () => {
    if (!capacity) return 0;
    return (capacity.currentAttendance / capacity.totalCapacity) * 100;
  };

  return (
    <div>
      <div className="header">
        <h1>Capacity Stats</h1>
        <div className="nav-buttons">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="container">
        {!capacity && (
          <div className="glass-card">
            <h2>Track Match Capacity</h2>
            <form onSubmit={handleLoadCapacity} style={{ marginTop: '16px' }}>
              <input
                type="text"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                placeholder="Enter Match ID"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  marginBottom: '16px'
                }}
              />
              {error && <p style={{ color: 'var(--color-danger)', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Loading...' : 'Track Match'}
              </button>
            </form>
          </div>
        )}

        {capacity && (
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0 }}>{capacity.matchName || 'Match Capacity'}</h2>
                <p style={{ color: 'var(--color-text-dim)', margin: '4px 0 0 0' }}>{isConnected ? '🟢 Live' : '🔴 Offline'}</p>
              </div>
            </div>

            <div style={{
              height: '32px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '24px',
              position: 'relative'
            }}>
              <div style={{
                width: `${getPercentage()}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                transition: 'width 0.5s ease'
              }}></div>
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontWeight: 700,
                fontSize: '12px'
              }}>{getPercentage().toFixed(1)}%</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="glass-card" style={{ padding: '16px', margin: 0 }}>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '12px', margin: '0 0 4px 0' }}>ATTENDANCE</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{capacity.currentAttendance}</p>
              </div>
              <div className="glass-card" style={{ padding: '16px', margin: 0 }}>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '12px', margin: '0 0 4px 0' }}>CAPACITY</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{capacity.totalCapacity}</p>
              </div>
            </div>

            <button
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '24px' }}
              onClick={() => setCapacity(null)}
            >
              Track Different Match
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Capacity;
