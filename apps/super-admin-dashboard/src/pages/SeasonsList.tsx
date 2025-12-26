import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SeasonsList: React.FC = () => {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/seasons', { params: { perPage: 100 } })
      .then(res => { setSeasons(res.data.data || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div><h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800 }}>Seasons</h1><p style={{ color: 'var(--text-muted)' }}>Manage seasons and periods</p></div>
        <button className="premium-btn premium-btn-primary" onClick={() => navigate('/seasons/new')}>+ Add Season</button>
      </div>
      {seasons.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}><h3>No Seasons Found</h3></div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase' }}>Season</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase' }}>Period</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
            </tr></thead>
            <tbody>
              {seasons.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px' }}>{new Date(s.start_date).toLocaleDateString()} - {new Date(s.end_date).toLocaleDateString()}</td>
                  <td style={{ padding: '20px 24px' }}><span className={`badge ${s.is_active ? 'badge-success' : 'badge-secondary'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ padding: '20px 24px' }}><div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="premium-btn premium-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate(`/seasons/${s.id}`)}>View</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SeasonsList;
