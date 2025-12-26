import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Country {
  id: string;
  name: string;
  code: string;
  flag_url?: string;
  created_at: string;
}

const CountriesList: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; country?: Country }>({ show: false });
  const navigate = useNavigate();

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const response = await axios.get('/api/countries', { params: { perPage: 100 } });
      setCountries(response.data.data || response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load countries');
      setLoading(false);
    }
  };

  const handleDelete = async (country: Country) => {
    try {
      await axios.delete(`/api/countries/${country.id}`);
      setDeleteModal({ show: false });
      loadCountries();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to delete country');
      setDeleteModal({ show: false });
    }
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="text-gradient" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Loading...</div>
        <p>Retrieving countries</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
      <div style={{ color: '#ef4444', fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Error</h3>
      <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      <button onClick={loadCountries} className="premium-btn premium-btn-secondary" style={{ marginTop: '24px' }}>Retry</button>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Countries</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Manage countries and regions</p>
        </div>
        <button className="premium-btn premium-btn-primary" onClick={() => navigate('/countries/new')}>
          + Add Country
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontSize: '15px'
          }}
        />
      </div>

      {filteredCountries.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.5 }}>🌍</div>
          <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>No Countries Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 32px auto' }}>
            {search ? 'No countries match your search.' : 'Start by adding your first country.'}
          </p>
          {!search && <button className="premium-btn premium-btn-primary" onClick={() => navigate('/countries/new')}>Add First Country</button>}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Country</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Code</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Created</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCountries.map((country) => (
                <tr key={country.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {country.flag_url && (
                        <img src={country.flag_url} alt={country.name} style={{ width: '32px', height: '24px', objectFit: 'cover', borderRadius: '4px' }} />
                      )}
                      <span style={{ fontSize: '15px', fontWeight: 600 }}>{country.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <code style={{ color: 'var(--accent-secondary)', fontSize: '14px' }}>{country.code}</code>
                  </td>
                  <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    {new Date(country.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        className="premium-btn premium-btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => navigate(`/countries/${country.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="premium-btn premium-btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => navigate(`/countries/${country.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="premium-btn"
                        style={{ padding: '8px 16px', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                        onClick={() => setDeleteModal({ show: true, country })}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && deleteModal.country && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '500px', margin: '20px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Delete Country?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Are you sure you want to delete <strong>{deleteModal.country.name}</strong>? 
              This will cascade delete all associated clubs and competitions.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="premium-btn premium-btn-secondary"
                onClick={() => setDeleteModal({ show: false })}
              >
                Cancel
              </button>
              <button
                className="premium-btn"
                style={{ background: '#ef4444', color: 'white' }}
                onClick={() => handleDelete(deleteModal.country!)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountriesList;
