import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface Country {
  id: string;
  name: string;
  code: string;
  flag_url?: string;
  created_at: string;
  updated_at: string;
  clubs?: any[];
  competitions?: any[];
}

const CountryDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCountry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCountry = async () => {
    try {
      const response = await axios.get(`/api/countries/${id}`);
      setCountry(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load country');
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="text-gradient" style={{ fontSize: '24px', fontWeight: 700 }}>Loading...</div>
      </div>
    </div>
  );

  if (error || !country) return (
    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
      <h3 style={{ color: '#ef4444' }}>Error</h3>
      <p style={{ color: 'var(--text-muted)' }}>{error || 'Country not found'}</p>
      <button onClick={() => navigate('/countries')} className="premium-btn premium-btn-secondary" style={{ marginTop: '24px' }}>
        Back to Countries
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/countries')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '16px'
          }}
        >
          ← Back to Countries
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
              {country.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Country Details</p>
          </div>
          <button
            className="premium-btn premium-btn-primary"
            onClick={() => navigate(`/countries/${id}/edit`)}
          >
            Edit Country
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Main Info Card */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                Name
              </label>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{country.name}</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                Code
              </label>
              <code style={{ fontSize: '16px', color: 'var(--accent-secondary)' }}>{country.code}</code>
            </div>

            {country.flag_url && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  Flag
                </label>
                <img src={country.flag_url} alt={country.name} style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                Created
              </label>
              <div style={{ fontSize: '15px' }}>{new Date(country.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Associated Clubs */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Associated Clubs ({country.clubs?.length || 0})
          </h3>
          {country.clubs && country.clubs.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {country.clubs.map((club) => (
                <div
                  key={club.id}
                  style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  {club.logo_url && (
                    <img src={club.logo_url} alt={club.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{club.name}</div>
                    {club.short_name && <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{club.short_name}</div>}
                  </div>
                  <button
                    className="premium-btn premium-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    onClick={() => navigate(`/clubs/${club.id}`)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px 0' }}>
              No clubs associated with this country yet.
            </p>
          )}
        </div>

        {/* Associated Competitions */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Associated Competitions ({country.competitions?.length || 0})
          </h3>
          {country.competitions && country.competitions.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {country.competitions.map((comp) => (
                <div
                  key={comp.id}
                  style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{comp.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Type: {comp.type}
                    </div>
                  </div>
                  <button
                    className="premium-btn premium-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    onClick={() => navigate(`/competitions/${comp.id}`)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px 0' }}>
              No competitions associated with this country yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryDetail;
