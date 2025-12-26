import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompetitionsList: React.FC = () => {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/competitions', { params: { perPage: 100 } })
      .then(res => { setCompetitions(res.data.data || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div><h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800 }}>Competitions</h1><p style={{ color: 'var(--text-muted)' }}>Manage leagues and tournaments</p></div>
        <button className="premium-btn premium-btn-primary" onClick={() => navigate('/competitions/new')}>+ Add Competition</button>
      </div>
      {competitions.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}><h3>No Competitions Found</h3></div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase' }}>Competition</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase' }}>Country</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
            </tr></thead>
            <tbody>
              {competitions.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '20px 24px' }}><span className="badge">{c.type}</span></td>
                  <td style={{ padding: '20px 24px' }}>{c.country_name}</td>
                  <td style={{ padding: '20px 24px' }}><div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="premium-btn premium-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate(`/competitions/${c.id}`)}>View</button>
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

export default CompetitionsList;
