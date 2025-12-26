import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VenuesList: React.FC = () => {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/venues', { params: { perPage: 100 } })
      .then(res => { setVenues(res.data.data || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div><h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800 }}>Venues</h1><p style={{ color: 'var(--text-muted)' }}>Manage stadiums and venues</p></div>
        <button className="premium-btn premium-btn-primary" onClick={() => navigate('/venues/new')}>+ Add Venue</button>
      </div>
      {venues.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}><h3>No Venues Found</h3></div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase' }}>Venue</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase' }}>Club</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase' }}>City</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
            </tr></thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 600 }}>{v.name}</td>
                  <td style={{ padding: '20px 24px' }}>{v.club_name}</td>
                  <td style={{ padding: '20px 24px' }}>{v.city}</td>
                  <td style={{ padding: '20px 24px' }}><div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="premium-btn premium-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate(`/venues/${v.id}/edit`)}>Edit</button>
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

export default VenuesList;
