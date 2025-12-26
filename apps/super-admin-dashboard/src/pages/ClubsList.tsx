import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Club {
  id: string;
  name: string;
  short_name?: string;
  logo_url?: string;
  country_name?: string;
  country_code?: string;
  deleted_at?: string;
  created_at: string;
}

const ClubsList: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clubsRes, countriesRes] = await Promise.all([
        axios.get('/api/clubs', { params: { perPage: 100 } }),
        axios.get('/api/countries', { params: { perPage: 100 } })
      ]);
      setClubs(clubsRes.data.data || clubsRes.data);
      setCountries(countriesRes.data.data || countriesRes.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.short_name?.toLowerCase().includes(search.toLowerCase())) &&
    (!countryFilter || c.country_name === countryFilter)
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800 }}>Clubs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage football clubs</p>
        </div>
        <button className="premium-btn premium-btn-primary" onClick={() => navigate('/clubs/new')}>
          + Add Club
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>
          <input
            type="text"
            placeholder="Search clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)'
            }}
          />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              minWidth: '200px'
            }}
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {filteredClubs.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🏢</div>
          <h3>No Clubs Found</h3>
          <button className="premium-btn premium-btn-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/clubs/new')}>Add First Club</button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Club</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Country</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClubs.map((club) => (
                <tr key={club.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {club.logo_url && <img src={club.logo_url} alt={club.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />}
                      <div>
                        <div style={{ fontWeight: 600 }}>{club.name}</div>
                        {club.short_name && <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{club.short_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>{club.country_name || '-'}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <span className={`badge ${club.deleted_at ? 'badge-danger' : 'badge-success'}`}>
                      {club.deleted_at ? 'Deleted' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="premium-btn premium-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate(`/clubs/${club.id}/edit`)}>View</button>
                      <button className="premium-btn premium-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate(`/clubs/${club.id}/edit`)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClubsList;
